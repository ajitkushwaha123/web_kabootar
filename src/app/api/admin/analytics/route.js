import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Lead from "@/models/Lead";
import { getAuthContext } from "@/lib/auth/getAuth";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";

    let from = daysAgo(7);
    if (range === "today") from = daysAgo(0);
    if (range === "30d") from = daysAgo(30);

    await dbConnect();

    // 1. Summary Stats
    const totalMessages = await Message.countDocuments({
      organizationId: orgId,
      direction: "incoming",
      timestamp: { $gte: from }
    });

    const totalLeads = await Lead.countDocuments({
      organizationId: orgId,
      createdAt: { $gte: from }
    });

    const convertedLeads = await Lead.countDocuments({
      organizationId: orgId,
      stage: "won",
      updatedAt: { $gte: from }
    });

    // 2. Reply Source Breakdown
    const sourceStats = await Message.aggregate([
      { $match: { 
          organizationId: orgId, 
          direction: "outgoing", 
          timestamp: { $gte: from } 
      } },
      { $group: { 
          _id: "$metadata.source", 
          count: { $sum: 1 } 
      } }
    ]);

    const replySources = { bot: 0, ai: 0, agent: 0 };
    sourceStats.forEach(s => {
      const src = s._id || "agent";
      if (src === "bot") replySources.bot += s.count;
      else if (src === "ai") replySources.ai += s.count;
      else replySources.agent += s.count;
    });

    // 3. Intent Breakdown
    const intentStats = await Message.aggregate([
      { $match: { 
          organizationId: orgId, 
          direction: "outgoing",
          "metadata.source": "ai",
          timestamp: { $gte: from } 
      } },
      { $group: { 
          _id: "$metadata.intent", 
          count: { $sum: 1 } 
      } },
      { $sort: { count: -1 } }
    ]);

    // 4. Daily Trend
    const dailyTrend = await Message.aggregate([
      { $match: { 
          organizationId: orgId, 
          direction: "incoming", 
          timestamp: { $gte: daysAgo(7) } 
      } },
      { $group: {
          _id: { 
            day: { $dayOfMonth: "$timestamp" }, 
            month: { $month: "$timestamp" } 
          },
          messages: { $sum: 1 }
      } },
      { $sort: { "_id.month": 1, "_id.day": 1 } }
    ]);

    // 5. Hourly Activity
    const hourlyActivity = await Message.aggregate([
      { $match: { 
          organizationId: orgId, 
          direction: "incoming", 
          timestamp: { $gte: from } 
      } },
      { $group: {
          _id: { $hour: "$timestamp" },
          count: { $sum: 1 }
      } },
      { $sort: { "_id": 1 } }
    ]);

    // 6. Recent Activity
    const recentMessages = await Message.find({
      organizationId: orgId,
      direction: "incoming"
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();

    const unmatchedCount = await (await import("@/models/UnmatchedMessage")).default.countDocuments({
      organizationId: orgId,
      resolved: false,
      createdAt: { $gte: from }
    });

    return NextResponse.json({
      summary: {
        totalMessages,
        totalLeads,
        convertedLeads,
        unmatchedCount,
        conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
      },
      replySources,
      intentBreakdown: intentStats.map(i => ({ intent: i._id || "unknown", count: i.count })),
      agentPerformance: [], // Need separate logic if tracking agent-specific replies
      dailyTrend: dailyTrend.map(d => ({ label: `${d._id.day}/${d._id.month}`, messages: d.messages })),
      hourlyActivity: hourlyActivity.map(h => ({ hour: `${h._id}:00`, count: h.count })),
      recentActivity: recentMessages.map(m => ({
        phone: "******" + (m.metadata?.wa_id?.slice(-4) || "0000"),
        text: m.text?.body || "Media message",
        time: m.timestamp
      }))
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
