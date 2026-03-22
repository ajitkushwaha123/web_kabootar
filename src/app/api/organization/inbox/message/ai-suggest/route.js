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
        const role = m.direction === "incoming" ? "customer" : "agent";
        const content = m.text?.body || `[Media: ${m.messageType}]`;
        return `${role}: ${content}`;
      })
      .join("\n");

    // 3. Generate suggestion
    let suggestion = "";
    try {
      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        system: `You are a professional WhatsApp sales agent for "${org?.name || "the business"}". 
        REPLY RULES:
        1. Reply in 1-2 short lines.
        2. Be friendly and human-like.
        3. Use simple Hinglish (Hindi + English) if the customer uses it.
        4. Focus on helping and converting the user.
        5. Do NOT use labels like "Agent:" or "Reply:".
        6. If the history is empty, greet the user warmly.`,
        prompt: `Conversation history:\n${history || "No messages yet."}\n\nSuggest a helpful reply for the agent to send now:`,
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
