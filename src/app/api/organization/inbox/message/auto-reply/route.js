import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Organization from "@/models/Organization";
import Conversation from "@/models/Conversation";
import { NextResponse } from "next/server";
import axios from "axios";

export const POST = async (req) => {
  console.log("🚀 [AUTO-REPLY] API Route Hit");
  try {
    const { conversationId, organizationId } = await req.json();
    
    if (!conversationId || !organizationId) {
      return NextResponse.json({ message: "Missing data", success: false });
    }

    await dbConnect();
    const org = await Organization.findOne({ org_id: organizationId });
    
    if (!org) return NextResponse.json({ message: "Org not found", success: false });
    if (!org.autoAiReply) return NextResponse.json({ message: "Auto Reply disabled for this org", success: false });

    // Dynamic import to avoid loading AI libs on simple validation checks
    const { processMessage } = await import("@/lib/ai-brain/brain");
    const { seedMagicScaleKnowledge } = await import("@/lib/ai-brain/magicscale-knowledge");
    const { matchRule, seedMagicScaleBotRules } = await import("@/lib/bot/botEngine");
    const BotRule = (await import("@/models/BotRule")).default;
    const UnmatchedMessage = (await import("@/models/UnmatchedMessage")).default;

    // Send Response immediately (Async Processing)
    (async () => {
      try {
        await seedMagicScaleKnowledge(org.org_id); // lazy seed Magic Scale data if none exists
        await seedMagicScaleBotRules(org.org_id); // lazy seed Bot Rules if none exists

        // 1. Double check: Did a human reply recently?
        const lastMsg = await Message.findOne({ conversationId }).sort({ createdAt: -1 });
        if (lastMsg && lastMsg.direction === "outgoing" && lastMsg.senderId !== "AI_BOT") {
          console.log("🤖 Human already replied, skipping AI.");
          return;
        }

        // 2. Fetch context
        const convo = await Conversation.findById(conversationId).populate("contactId").lean();
        if (!convo || !convo.contactId) return;

        const customerName = convo.contactId.primaryName || "Customer";
        const recipientPhone = convo.contactId.primaryPhone;
        const userMessage = lastMsg?.text?.body || "Hello";

        const mode = org.autoReplyMode || "HYBRID";
        console.log(`🤖 Auto-Reply Mode: ${mode} for Org: ${org.name}`);

        if (mode === "OFF") {
           console.log("🤖 Auto-reply is OFF.");
           return;
        }

        let finalReply = "";
        let source = "ai";

        // --- LAYER 1: BOT RULES (Only if HYBRID or BOT_ONLY) ---
        if (mode === "HYBRID" || mode === "BOT_ONLY") {
          const activeRules = await BotRule.find({ organizationId: org.org_id, isActive: true }).sort({ priority: -1 });
          const botReply = matchRule(userMessage, activeRules);
          
          if (botReply) {
             console.log(`🤖 Bot Rule Matched: "${botReply}"`);
             finalReply = botReply;
             source = "bot";
             BotRule.updateOne({ organizationId: org.org_id, reply: botReply }, { $inc: { matchCount: 1 } }).exec();
          }
        }

        // --- LAYER 2: AI BRAIN (Only if HYBRID/AI_ONLY and no reply yet) ---
        if (!finalReply && (mode === "HYBRID" || mode === "AI_ONLY")) {
           console.log(`🤖 Processing Brain for ${customerName}...`);
           
           // Log unmatched for training (If not matched by bot)
           UnmatchedMessage.create({ 
             organizationId: org.org_id, 
             text: userMessage, 
             phone: recipientPhone 
           }).catch(e => console.error("Unmatched Log Error:", e));

           const { reply: aiReply, intent, usedKnowledge, source: brainSource } = await processMessage(
             userMessage, 
             conversationId, 
             org.org_id, 
             org.name, 
             customerName
           );
           finalReply = aiReply;
           source = brainSource || "ai";
           console.log(`🤖 ${source.toUpperCase()} Reply: "${finalReply}" [Intent: ${intent}, RAG: ${usedKnowledge}]`);
        }

        if (!finalReply) return;

        // 4. Send Message via Meta API
        const waUrl = `${process.env.META_WA_API_URL || "https://graph.facebook.com/v21.0"}/${org.phone_number_id}/messages`;
        const response = await axios.post(
          waUrl,
          {
            messaging_product: "whatsapp",
            to: recipientPhone,
            type: "text",
            text: { body: finalReply },
          },
          { headers: { Authorization: `Bearer ${org.access_token || process.env.META_WA_TOKEN}` } }
        );

        const whatsappMessageId = response.data?.messages?.[0]?.id;

        // 5. Save to DB
        const newMessage = await Message.create({
          conversationId,
          organizationId: org.org_id,
          direction: "outgoing",
          senderId: "AI_BOT",
          senderType: "agent",
          messageType: "text",
          status: "sent",
          whatsappMessageId,
          text: { body: finalReply },
          metadata: { 
            source, 
            intent: intent || null, 
            triggerMessage: userMessage 
          }, // bot or ai + intent info + trigger for corrections
          timestamp: new Date(),
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessageId: newMessage._id,
          lastMessageAt: new Date(),
        });

        // 💰 Log AI / Bot Cost (Zomato-style Tracking) 🚀
        try {
          const { default: CostRecord } = await import("@/models/CostRecord");
          let aiCost = 0;
          if (source === "ai_gemini") aiCost = 0.05;
          else if (source === "ai_openai") aiCost = 0.15;
          else if (source === "bot") aiCost = 0; // Bot rules are free (excluding Meta cost)

          await CostRecord.create({
            organizationId: org.org_id,
            conversationId,
            type: source.startsWith("ai") ? source : "bot",
            messageType: "text",
            cost: aiCost,
            metadata: { trigger: userMessage, waId: whatsappMessageId }
          });
          console.log(`💰 [AUTO-COST] ₹${aiCost} logged for ${source}`);
        } catch (costErr) {
          console.error("❌ Failed to log AI cost:", costErr.message);
        }
        console.log("✅ Auto-reply background process completed");
      } catch (innerErr) {
        console.error("❌ Auto-reply async background error:", innerErr.response?.data || innerErr.message);
      }
    })();

    return NextResponse.json({ success: true, message: "Auto reply processing in background" });
  } catch (err) {
    console.error("Auto-AI error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
};
