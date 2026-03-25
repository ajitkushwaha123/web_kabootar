import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai"; // 🤖 NEW
import { detectIntent } from "./intentDetector";
import { searchKnowledge, findSimilarQuestion } from "./ragSystem";
import dbConnect from "../dbConnect";
import Message from "@/models/Message";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const openai = createOpenAI({ // 🤖 NEW
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Magic Scale Specialized Personality
 */
const MAGICSCALE_SYSTEM_PROMPT = `
Tu Magic Scale ka WhatsApp AI Assistant hai.
Magic Scale ek restaurant consulting firm hai jo restaurants ko Zomato aur Swiggy pe grow karne mein help karta hai.

Services:
- Zomato + Swiggy Onboarding: ₹3,500
- Zomato Only / Swiggy Only: ₹2,000 each
- Growth Plans: Basic ₹8,499/month, Premium ₹11,999/month
- FSSAI License: ₹1,000 (1yr), ₹3,000 (5yr)
- GST Registration: ₹1,000

TONE: Friendly, professional, helpful — Hinglish mein baat karo
LENGTH: 2-3 lines max — concise rehna
GOAL: Customer ko service lene ke liye convince karo
RULES: Knowledge base mein jo info hai wahi batao. Price hamesha confidently batao. 
If interested: ask for name and contact. No bullet points. No markdown bold/italic unless price.
`;

const INTENT_FLOWS = {
  sales: `Focus on conversion, highlight pricing benefits.`,
  support: `Be helpful, guide through FSSAI/GST status if asked.`,
  complaint: `Apologize 🙏, ask for business name to resolve.`,
  greeting: `Warm welcome, introduce Magic Scale.`,
  followup: `Provide timeline (e.g. 3 days for onboarding, 2 days for GST).`,
  unknown: `General consulting helpfulness.`,
};

/**
 * The Central AI Orchestrator: Intent + History + RAG + Generation.
 */
export async function processMessage(userMessage, conversationId, organizationId, orgName = "Business", customerName = "Customer") {
  if (!userMessage || !organizationId) return { reply: "", intent: "unknown", usedKnowledge: false };

  await dbConnect();
  const Organization = (await import("@/models/Organization")).default;
  const org = await Organization.findOne({ org_id: organizationId });

  // 🔍 Layer 0: Direct Knowledge Match (Fast + Free)
  const memoryReply = await findSimilarQuestion(userMessage, organizationId, org?.aiConfidenceThreshold);
  if (memoryReply) {
     console.log("🧠 Brain Match found: Sending from Memory.");
     return { 
       reply: memoryReply, 
       intent: "faq", 
       usedKnowledge: true,
       source: "memory" 
     };
  }
  
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
  const systemPrompt = `
  ${MAGICSCALE_SYSTEM_PROMPT}
  
  CURRENT INTENT FOCUS: ${INTENT_FLOWS[intent]}
  
  ${usedKnowledge ? `📚 TRUSTED BUSINESS DATA (use this to answer): \n${knowledge}` : "📚 INSTRUCTION: Answer based on Magic Scale expertise shared above."}
  
  💬 CONVERSATION HISTORY (Last 8 messages):
  ${historyText}
  
  🆕 NEW MESSAGE from ${customerName}: "${userMessage}"
  `;

  // --- PRIMARY AI: GEMINI ---
  try {
     console.log("🤖 [AI-BRAIN] Trying Primary AI (Gemini Flash)...");
     const { text: reply } = await generateText({
       model: google("gemini-flash-latest"),
       temperature: 0.85,
       system: systemPrompt,
       prompt: `Suggest a reply (Return ONLY the reply text):`,
     });
     
     return { 
       reply: reply.trim(), 
       intent, 
       usedKnowledge,
       source: "gemini"
     };
  } catch (err) {
    console.warn("❌ [AI-BRAIN] Gemini failed:", err.message);

    // --- SECONDARY AI: OPENAI FALLBACK ---
    if (!process.env.OPENAI_API_KEY) {
       console.error("❌ [AI-BRAIN] OpenAI Key missing. Aborting.");
       return { 
         reply: "Maaf kijiye, humare system mein thodi dikkat thhi. Kal fir try karein 🙏", 
         intent, 
         source: "fallback" 
       };
    }

    try {
       console.log("🔁 [AI-BRAIN] Switching to Backup AI (GPT-4o-mini)...");
       const { text: openaiReply } = await generateText({
         model: openai("gpt-4o-mini"),
         temperature: 0.7,
         system: systemPrompt,
         prompt: `Suggest a reply (Return ONLY the reply text):`,
       });

       return {
         reply: openaiReply.trim(),
         intent,
         usedKnowledge,
         source: "openai"
       };
    } catch (openaiErr) {
       console.error("❌ [AI-BRAIN] OpenAI also failed:", openaiErr.message);
       return { 
         reply: "Server thoda busy hai, thodi der baad try karein 🙏", 
         intent: "unknown", 
         usedKnowledge: false,
         source: "fallback"
       };
    }
  }
}
