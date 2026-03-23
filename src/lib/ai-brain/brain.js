import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { detectIntent } from "./intentDetector";
import { searchKnowledge } from "./ragSystem";
import dbConnect from "../dbConnect";
import Message from "@/models/Message";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * AI Personality Templates based on different intents.
 */
const SYSTEM_PROMPTS = {
  sales: `You are an expert sales agent. Your goal: convert the customer politely. Highlight price and urgency if possible. Ask for a demo/trial call-to-action. Stay Hinglish (Hindi + English mix).`,
  support: `You are a helpful support agent. Help the customer solve their issues. Provide step-by-step guidance. If it fails, promise an escalation. Empathize politely in Hinglish.`,
  complaint: `You are a senior customer care lead. First apologize 🙏. Acknowledge their issue, never be defensive. Ask for an application ID or order number to resolve. Stay calm and Hinglish.`,
  greeting: `You are a warm, casual business bot. Greet naturally. Use "Hey/Haanji/Namaste". Keep it short (1-2 lines). Ask how you can help. Hinglish is preferred.`,
  followup: `You are a responsive assistant. Provide a status update honestly. If unsure, tell them: "Main check karke 5 mins mein batata hoon". Be reassuriing in Hinglish.`,
  unknown: `You are a general assistant for this organization. Be helpful and politely clarify if they are unclear. Mix Hindi & English.`,
};

/**
 * The Central AI Orchestrator: Intent + History + RAG + Generation.
 */
export async function processMessage(userMessage, conversationId, organizationId, orgName = "Business", customerName = "Customer") {
  if (!userMessage || !organizationId) return { reply: "", intent: "unknown", usedKnowledge: false };

  await dbConnect();
  
  // 1. 🔍 Detect intent (Fast or AI-based)
  const intent = await detectIntent(userMessage);

  // 2. 💬 Fetch conversation history (for deep context)
  const historyRaw = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  
  const historyText = historyRaw
    .reverse()
    .map(m => `${m.direction === "incoming" ? customerName : "Assistant"}: ${m.text?.body || "[Media Content]"}`)
    .join("\n");

  // 3. 📚 Knowledge retrieval (RAG)
  const knowledge = await searchKnowledge(userMessage, organizationId);
  const usedKnowledge = knowledge.length > 0;

  // 4. 👋 Final Response generation
  const systemPrompt = `You are the AI WhatsApp Assistant of "${orgName}". 
  LANGUAGE: Natural Hinglish (Mix Hindi + English like humans talk in India).
  LENGTH: Short and Sweet (keep it under 2 lines max).
  
  ${SYSTEM_PROMPTS[intent]}
  
  ${usedKnowledge ? `📚 TRUSTED BUSINESS DATA (use this to answer): \n${knowledge}` : "📚 INSTRUCTION: If you don't have business data, answer based on general polite behavior."}
  
  💬 CONVERSATION HISTORY:
  ${historyText}
  
  🆕 NEW MESSAGE from ${customerName}: "${userMessage}"
  
  RULES:
  - NEVER mention you are an AI.
  - Sound like a helpful human assistant.
  - No bullet points in response.
  - No markdown bold/italic unless highlighting a PRICE.
  - Don't repeat yourself.
  `;

  try {
     const { text: reply } = await generateText({
       model: google("gemini-flash-latest"),
       temperature: 0.85,
       system: systemPrompt,
       prompt: `Suggest a reply (Return ONLY the reply text):`,
     });
     
     return { 
       reply: reply.trim(), 
       intent, 
       usedKnowledge 
     };
  } catch (err) {
    console.error("AI Brain Error:", err.message);
    return { 
      reply: "Maaf kijiye, humare system mein thodi dikkat thhi. Kal fir try karein ya support@creativeminds.in pe likhein 🙏", 
      intent: "unknown", 
      usedKnowledge: false 
    };
  }
}
