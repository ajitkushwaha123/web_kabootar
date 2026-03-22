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

    // 1. Fetch last 10 messages for context
    const lastMessages = await Message.find({
      conversationId,
      organizationId: orgId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(10)
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
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      system: `You are a professional WhatsApp support agent for "${org?.name || "the business"}". 
      REPLY RULES:
      1. Keep it under 2 lines.
      2. Be extremely helpful and friendly.
      3. Do NOT include any prefixes like "Agent:" or "Reply:".
      4. Use a natural, human-like tone.
      5. If the last message is just a greeting, reply with a warm welcome.`,
      prompt: `Conversation history:\n${history || "No messages yet."}\n\nSuggest a helpful reply for the agent to send now:`,
    });

    return NextResponse.json({
      success: true,
      suggestion: text.trim(),
    });
  } catch (err) {
    console.error("AI Suggest Error:", err);
    return NextResponse.json({ message: "Failed to generate AI suggestion", success: false }, { status: 500 });
  }
};
