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

    // Send Response immediately (Async Processing)
    (async () => {
      try {
        await seedMagicScaleKnowledge(org.org_id); // lazy seed Magic Scale data if none exists

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

        // 3. 🧠 Smart AI Brain: Intent + History + RAG + Generation
        console.log(`🤖 Processing Brain for ${customerName} in org ${org.name}...`);
        const { reply: replyText, intent, usedKnowledge } = await processMessage(
          lastMsg?.text?.body || "Hello", 
          conversationId, 
          org.org_id, 
          org.name, 
          customerName
        );

        if (!replyText) return;
        console.log(`🤖 Reply: "${replyText}" [Intent: ${intent}, RAG: ${usedKnowledge}]`);

        // 4. Send Message via Meta API
        const waUrl = `${process.env.META_WA_API_URL || "https://graph.facebook.com/v21.0"}/${org.phone_number_id}/messages`;
        const response = await axios.post(
          waUrl,
          {
            messaging_product: "whatsapp",
            to: recipientPhone,
            type: "text",
            text: { body: replyText },
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
          text: { body: replyText },
          timestamp: new Date(),
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessageId: newMessage._id,
          lastMessageAt: new Date(),
        });
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
