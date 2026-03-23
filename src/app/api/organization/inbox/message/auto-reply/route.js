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

    // 5. Send Response immediately (Async Processing)
    // We run the AI generation and Meta sending in the 'background' to keep response time low.
    (async () => {
      try {
        // 1. Double check: Did a human reply recently?
        const lastMsg = await Message.findOne({ conversationId }).sort({ createdAt: -1 });
        if (lastMsg && lastMsg.direction === "outgoing" && lastMsg.senderId !== "AI_BOT") {
          console.log("🤖 Human already replied, skipping AI.");
          return;
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
        const { text } = await generateText({
          model: google("gemini-flash-latest"),
          temperature: 0.9,
          system: `You are a friendly human sales assistant for "${org.name}". 
          
          TONE & VARIETY:
          - Talk like a real human, not a bot. 
          - Use Hinglish (Hindi + English) naturally.
          - Keep it very short (1-2 lines).
          - NEVER repeat the same phrasing. Use different greetings (Hey, Hi, Hello, Haanji).
          - Vary your sentence structures. 
          - If the customer asks the same thing, try rephrasing your previous answer.
          - Follow-up with a question occasionally to keep the chat alive.
          - NEVER mention you are an AI.`,
          prompt: `Recent Conversation:\n${history}\n\nProvide a unique and natural response as the Agent (Don't repeat previous agent messages):`,
        });
        replyText = text.trim();

        if (!replyText) return;

        // 4. Send Message
        const recipientPhone = lastMessages.find(m => m.direction === "incoming")?.senderId; 
        if (!recipientPhone) return;

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

        // 5. Save to DB with timestamp
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
          timestamp: new Date(), // ✅ FIXED: Timestamp is required in schema
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
