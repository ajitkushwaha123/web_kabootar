import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * All possible intent categories for CRM interactions
 */
export const INTENTS = [
  "sales",      // for price, buy, purchase, demo, features
  "support",    // for problem, issue, help, help center
  "complaint",  // for angry, bad experience, refund, not working
  "greeting",   // for hi, hello, hey, namaste
  "followup",   // for status, kab tak update, ho gaya?
  "unknown"     // if anything else
];

/**
 * Fast Regex-based detection to bypass AI calls (cheap & fast).
 */
export function detectIntentFast(text) {
  const t = text.toLowerCase();
  
  // Sales regex (including common Hinglish/Hindi)
  if (/price|cost|kitna|rate|plan|buy|purchase|kharid|demo|trial|paisa|charge/.test(t))
    return "sales";
    
  // Support regex
  if (/problem|issue|error|nahi chal|kaam nahi|help|fix|solve|support/.test(t))
    return "support";
    
  // Complaint regex
  if (/angry|worst|bad|refund|wapas|complaint|fraud|scam|pathetic|ghatiya/.test(t))
    return "complaint";
    
  // Greeting regex
  if (/^(hi|hello|hlo|hey|namaste|hii|helo|vanakkam|marhaba)\b/.test(t))
    return "greeting";
    
  // Follow-up regex
  if (/status|update|kab|kitne din|abhi tak|ho gaya|complete/.test(t))
    return "followup";

  return "unknown";
}

/**
 * AI-powered deep detection: uses Gemini to classify if regex fails.
 */
export async function detectIntentAI(text) {
  try {
    const { text: intent } = await generateText({
      model: google("gemini-flash-latest"),
      system: `Classify the intent of this WhatsApp message into exactly ONE category from: [sales, support, complaint, greeting, followup, unknown]. 
      Only return the category name and nothing else.`,
      prompt: `Message from customer: "${text}"`,
    });
    
    const result = intent.trim().toLowerCase();
    return INTENTS.includes(result) ? result : "unknown";
  } catch (err) {
    console.warn("AI Intent Detection failed:", err.message);
    return "unknown";
  }
}

/**
 * Helper to combine both methods for robustness and speed.
 */
export async function detectIntent(text) {
  const fast = detectIntentFast(text);
  if (fast !== "unknown") return fast;
  return await detectIntentAI(text);
}
