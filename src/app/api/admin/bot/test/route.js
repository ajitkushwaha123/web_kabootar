import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BotRule from "@/models/BotRule";
import { matchRule } from "@/lib/bot/botEngine";
import { processMessage } from "@/lib/ai-brain/brain";
import { getAuthContext } from "@/lib/auth/getAuth";
import Organization from "@/models/Organization";

/**
 * POST: Test the bot pipeline locally in dashboard.
 */
export async function POST(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    await dbConnect();
    const org = await Organization.findOne({ org_id: orgId });

    // 1. Bot Rules check
    const rules = await BotRule.find({ organizationId: orgId, isActive: true }).sort({ priority: -1 });
    const botReply = matchRule(message, rules);

    if (botReply) {
       // Increment match count in background
       BotRule.updateOne({ organizationId: orgId, reply: botReply }, { $inc: { matchCount: 1 } }).exec();
       return NextResponse.json({ reply: botReply, source: "bot" });
    }

    // 2. AI Brain check (RAG + Intent)
    const { reply: aiReply, intent, usedKnowledge } = await processMessage(
      message, 
      "test-convo-id", 
      orgId, 
      org?.name || "Magic Scale", 
      "Test User"
    );

    if (aiReply) {
       return NextResponse.json({ 
         reply: aiReply, 
         source: "ai", 
         intent, 
         usedKnowledge 
       });
    }

    // 3. Fallback
    return NextResponse.json({ 
      reply: "Maaf kijiye, main ye samajh nahi gaya. Humari team aapko jald contact karegi! 🙏",
      source: "fallback"
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
