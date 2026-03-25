import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CostRecord from "@/models/CostRecord";
import BotRule from "@/models/BotRule";
import Knowledge from "@/models/Knowledge";
import UnmatchedMessage from "@/models/UnmatchedMessage";
import { getAuthContext } from "@/lib/auth/getAuth";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const today = startOfDay(new Date());
    const yesterday = startOfDay(subDays(new Date(), 1));

    // 💰 1. Cost Stats
    const todayCosts = await CostRecord.find({ 
      organizationId: orgId, 
      createdAt: { $gte: today } 
    }).lean();

    const totalCostToDate = await CostRecord.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: null, total: { $sum: "$cost" } } }
    ]);

    const costByType = await CostRecord.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: "$type", total: { $sum: "$cost" }, count: { $sum: 1 } } }
    ]);

    // 🤖 2. Bot Efficiency (Category-wise)
    const ruleStats = await BotRule.find({ organizationId: orgId }).select('category matchCount reply keywords').lean();
    
    const categoryStats = ruleStats.reduce((acc, rule) => {
      const cat = rule.category || "general";
      if (!acc[cat]) acc[cat] = { hits: 0, rulesCount: 0 };
      acc[cat].hits += (rule.matchCount || 0);
      acc[cat].rulesCount += 1;
      return acc;
    }, {});

    // 🧠 3. Knowledge Base Quality
    const learnedCount = await Knowledge.countDocuments({ organizationId: orgId });
    const unmatchedCount = await UnmatchedMessage.countDocuments({ organizationId: orgId, resolved: false });

    return NextResponse.json({
      success: true,
      costs: {
        today: todayCosts.reduce((acc, c) => acc + c.cost, 0),
        total: totalCostToDate[0]?.total || 0,
        byType: costByType
      },
      bot: {
        totalMatchCount: ruleStats.reduce((acc, r) => acc + (r.matchCount || 0), 0),
        categories: Object.entries(categoryStats).map(([name, stats]) => ({ name, ...stats })),
        topRules: ruleStats.sort((a,b) => (b.matchCount || 0) - (a.matchCount || 0)).slice(0, 5)
      },
      knowledge: {
        learnedCount,
        unmatchedCount
      }
    });

  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
