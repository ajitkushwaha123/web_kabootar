import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Organization from "@/models/Organization";
import Conversation from "@/models/Conversation";
import { NextResponse } from "next/server";
import axios from "axios";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const POST = async (req) => {
  console.log("🚀 [AUTO-REPLY] API Route Hit");
  try {
    const { conversationId, organizationId } = await req.json();
    console.log("📦 [AUTO-REPLY] Payload Received:", { conversationId, organizationId });

    if (!conversationId || !organizationId) {
      return NextResponse.json({ message: "Missing data", success: false });
    }

    await dbConnect();
    const org = await Organization.findOne({ org_id: organizationId });
    console.log("🤖 AutoReply Check - Org ID:", organizationId, "Enabled:", org?.autoAiReply);
    
    if (!org) return NextResponse.json({ message: "Org not found", success: false });
    if (!org.autoAiReply) return NextResponse.json({ message: "Auto Reply disabled for this org", success: false });

    // 1. Double check: Did a human reply recently?
    const lastMsg = await Message.findOne({ conversationId }).sort({ createdAt: -1 });
    console.log("🤖 Last Msg Direction:", lastMsg?.direction, "Sender:", lastMsg?.senderId);

    if (lastMsg && lastMsg.direction === "outgoing" && lastMsg.senderId !== "AI_BOT") {
      console.log("🤖 Human already replied, skipping AI.");
      return NextResponse.json({ message: "Human already handled", success: false });
    }

    // 2. Fetch context
    const lastMessages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const history = lastMessages
      .reverse()
      .map((m) => `${m.direction === "incoming" ? "Customer" : "Agent"}: ${m.text?.body || "[Media]"}`)
      .join("\n");

    // 3. Generate Reply
    console.log("🤖 Generating AI suggestion for history...");
    let replyText = "";
    try {
      const { text } = await generateText({
        model: google("gemini-flash-latest"),
        system: `You are a friendly human sales assistant for "${org.name}". 
        
        TONE:
        - Talk like a human, not a bot. 
        - Use Hinglish (Hindi + English) naturally.
        - Keep it very short (1-2 lines).
        - Be warm, helpful and polite.
        - Use emojis rarely but effectively (😊, 🙏).
        
        GOAL:
        - Answer the customer's question directly.
        - If they say Hi, greet them back.
        - If they ask for price/details, provide them clearly.
        - Direct them to take next steps or ask if they need anything else.
        - NEVER mention you are an AI.`,
        prompt: `Conversation history:\n${history}\n\nYour turn to reply as the Agent:`,
      });
      replyText = text.trim();
    } catch (aiErr) {
      console.error("🤖 AI Fail:", aiErr.message);
    }

    if (!replyText) return NextResponse.json({ success: false, message: "No reply text generated" });
    console.log("🤖 AI Generated Reply:", replyText);

    // 4. Send Message
    const recipientPhone = lastMessages.find(m => m.direction === "incoming")?.senderId; 
    console.log("🤖 Sending to phone:", recipientPhone);

    if (!recipientPhone) return NextResponse.json({ success: false, message: "No recipient phone found" });

    try {
      const waUrl = `${process.env.META_WA_API_URL || "https://graph.facebook.com/v21.0"}/${org.phone_number_id}/messages`;
      console.log("🤖 Calling Meta API:", waUrl);

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

      console.log("🤖 Meta Response Success:", response.data?.messages?.[0]?.id);
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
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessageId: newMessage._id,
        lastMessageAt: new Date(),
      });

      return NextResponse.json({ success: true, message: "Auto reply sent" });
    } catch (metaErr) {
      console.error("🤖 Meta Sending Error:", metaErr.response?.data || metaErr.message);
      return NextResponse.json({ success: false, error: "Meta API rejection" });
    }
  } catch (err) {
    console.error("Auto-AI error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
};
