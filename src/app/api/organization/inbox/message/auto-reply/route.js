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
  try {
    const { conversationId, organizationId } = await req.json();

    if (!conversationId || !organizationId) {
      return NextResponse.json({ message: "Missing data", success: false });
    }

    await dbConnect();
    const org = await Organization.findOne({ org_id: organizationId });
    if (!org || !org.autoAiReply) return NextResponse.json({ success: false });

    // 1. Double check: Did a human reply in the last 10 seconds?
    const lastMsg = await Message.findOne({ conversationId }).sort({ createdAt: -1 });
    if (lastMsg && lastMsg.direction === "outgoing" && lastMsg.senderType === "agent") {
      // Human already replied or AI already replied
      return NextResponse.json({ message: "Replying already handled", success: false });
    }

    // 2. Fetch context
    const lastMessages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const history = lastMessages
      .reverse()
      .map((m) => `${m.direction === "incoming" ? "customer" : "agent"}: ${m.text?.body || "[Media]"}`)
      .join("\n");

    // 3. Generate Reply
    const { text: replyText } = await generateText({
      model: google("gemini-1.5-flash"),
      system: `You are an AI auto-responder for "${org.name}". 
      Reply to the customer on WhatsApp. 
      RULES: Short (1-2 lines), helpful, friendly, Hinglish if needed.`,
      prompt: `Conversation:\n${history}\n\nAuto-reply to customer:`,
    });

    if (!replyText) return NextResponse.json({ success: false });

    // 4. Send Message via internal API or direct Meta call
    const baseUrl = process.env.NEXT_APP_BASE_URL || "http://localhost:3000";
    
    // We call the send-message API internally (or similar)
    // Actually, calling send-message API needs auth. 
    // It's better to just call the Meta API direct here and SAVE to DB.
    
    const wa_id = lastMessages[lastMessages.length - 1].senderId; // Assuming senderId is the phone for incoming
    const conversation = await Conversation.findById(conversationId);
    
    // Call WhatsApp API
    const response = await axios.post(
      `${process.env.META_WA_API_URL}/${org.phone_number_id}/messages`,
      {
        messaging_product: "whatsapp",
        to: wa_id,
        type: "text",
        text: { body: replyText },
      },
      { headers: { Authorization: `Bearer ${org.access_token || process.env.META_WA_TOKEN}` } }
    );

    const whatsappMessageId = response.data?.messages?.[0]?.id;

    // 5. Save to DB
    const newMessage = await Message.create({
      conversationId: conversation._id,
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
  } catch (err) {
    console.error("Auto-AI error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
};
