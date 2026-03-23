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
    const auth = await getAuthContext();
    const { orgId } = auth;
    console.log("🧪 [BOT-TEST] Auth Context OrgId:", orgId);

    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { message } = body;
    console.log("🧪 [BOT-TEST] Message received:", message);

    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    await dbConnect();
    const org = await Organization.findOne({ org_id: orgId });

    // 1. Bot Rules check
    console.log("🧪 [BOT-TEST] Checking rules...");
    const rules = await BotRule.find({ organizationId: orgId, isActive: true }).sort({ priority: -1 });
    const botReply = matchRule(message, rules);

    if (botReply) {
       console.log("🧪 [BOT-TEST] Rule Match found!");
       BotRule.updateOne({ organizationId: orgId, reply: botReply }, { $inc: { matchCount: 1 } }).exec();
       return NextResponse.json({ reply: botReply, source: "bot" });
    }

    // 2. AI Brain check (RAG + Intent)
    console.log("🧪 [BOT-TEST] Brain processing...");
    const { reply: aiReply, intent, usedKnowledge } = await processMessage(
      message, 
      "test-convo-id", 
      orgId, 
      org?.name || "Magic Scale", 
      "Test User"
    );

    if (aiReply) {
       console.log("🧪 [BOT-TEST] AI Reply generated!");
       return NextResponse.json({ 
         reply: aiReply, 
         source: "ai", 
         intent, 
         usedKnowledge 
       });
    }

    // 3. Fallback
    console.log("🧪 [BOT-TEST] Fallback reached.");
    return NextResponse.json({ 
      reply: "Maaf kijiye, main ye samajh nahi gaya. Humari team aapko jald contact karegi! 🙏",
      source: "fallback"
    });

  } catch (error) {
    console.error("❌ [BOT-TEST] Fatal Error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
