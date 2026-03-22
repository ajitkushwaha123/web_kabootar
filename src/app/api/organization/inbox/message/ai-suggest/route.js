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
        const role = m.direction === "incoming" ? "Customer" : "Agent";
        const content = m.text?.body || `[Media: ${m.messageType}]`;
        return `${role}: ${content}`;
      })
      .join("\n");

    // 3. Generate suggestion
    let suggestion = "";
    try {
      const { text } = await generateText({
        model: google("gemini-flash-latest"),
        temperature: 0.9,
        system: `You are a friendly and helpful person named "Kabootar AI Assistant" helping users on behalf of "${org?.name || "our company"}".
        
        TONE & VARIETY:
        - Talk like a real human, not a robotic assistant.
        - Use Hinglish (mix of Hindi and English) naturally.
        - Keep it very short (1-2 lines).
        - NEVER repeat the same phrasing. Vary your greetings and word choices.
        - If the customer repeats themselves, respond with fresh wording.
        - Use emojis occasionally (🙂, 👍, 🙏).
        - NEVER say "I am an AI" or "As an AI".
        
        Your goal is to suggest a natural next message for the agent.`,
        prompt: `Conversation History:\n${history}\n\nSuggest a unique and natural reply (don't repeat what was said before):`,
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
