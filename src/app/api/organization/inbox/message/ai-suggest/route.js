import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getAuthContext } from "@/lib/auth/getAuth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";

// Configure Gemini
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const POST = async (req) => {
  try {
    const { userId, orgId, org } = await getAuthContext();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
    }

    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ message: "Conversation ID is required", success: false }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ message: "AI API key not configured", success: false }, { status: 500 });
    }

    await dbConnect();

    // 1. Fetch last 6 messages for context (Faster + Cheaper)
    const lastMessages = await Message.find({
      conversationId,
      organizationId: orgId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // 2. Format history for AI
    const history = lastMessages
      .reverse()
      .map((m) => {
        const role = m.direction === "incoming" ? "Customer" : "You";
        const content = m.text?.body || `[Media: ${m.messageType}]`;
        return `${role}: ${content}`;
      })
      .join("\n");

    // 3. Generate suggestion
    let suggestion = "";
    try {
      const { text } = await generateText({
        model: google("gemini-flash-latest"),
        system: `You are a friendly and helpful person named "Kabootar AI Assistant" helping users on behalf of "${org?.name || "our company"}".
        
        TONE & STYLE:
        - Talk like a real human, not a robotic assistant.
        - Use Hinglish (mix of Hindi and English) which is natural in Indian business chats.
        - Keep it very short (1-2 lines).
        - Be warm, helpful, and slightly casual.
        - Use emojis occasionally (🙂, 👍, 🙏).
        - NEVER say "I am an AI" or "As an AI".
        
        SALES RULES:
        - If the user asks about price, provide a clear but welcoming answer.
        - If they say Hi, greet them warmly like a friend.
        - If they ask for a demo or details, be encouraging.
        - If unsure, ask a simple follow-up question to keep the conversation going.
        
        Your goal is to assist the agent in replying appropriately.`,
        prompt: `Here is the recent conversation history:\n${history || "No messages yet."}\n\nCustomer's last message was "${lastMessages[0]?.text?.body || "just started"}". Write a natural reply for me (the agent) to send:`,
      });
      suggestion = text.trim();
    } catch (e) {
      console.error("AI Generation failed:", e);
    }

    // 4. Fallback safety
    if (!suggestion) {
      suggestion = "Thanks for your message! Our team will reply shortly 🙌";
    }

    return NextResponse.json({
      success: true,
      suggestion,
    });

  } catch (err) {
    console.error("AI Suggest Error:", err);
    return NextResponse.json({ message: "Failed to generate AI suggestion", success: false }, { status: 500 });
  }
};
