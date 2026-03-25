import dbConnect from "../dbConnect";
import Knowledge from "@/models/Knowledge";
import { detectIntent } from "./intentDetector"; // 🤖 NEW

const STOP_WORDS = ["kya", "hai", "ka", "ki", "ke", "bhai", "please", "batao", "sir", "mam", "mujhhe", "ko", "se", "me"];

export function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .trim();
}

export function cleanWords(text) {
  const norm = normalizeText(text);
  const words = norm.split(/\s+/).filter(w => w.length > 1); // allow 2+ chars
  return words.filter(w => !STOP_WORDS.includes(w));
}

/**
 * 🔍 Smart Search: Finds best match based on word-overlap score + percentage
 */
export async function findSimilarQuestion(query, organizationId, threshold = 0.5) {
  if (!query || !organizationId) return null;
  
  await dbConnect();
  
  // 1. Exact Match Check (Super Fast)
  const normQuery = normalizeText(query);
  const exactMatch = await Knowledge.findOne({
    organizationId,
    question: { $regex: new RegExp(`^${normQuery}$`, "i") }
  });

  if (exactMatch) {
    await Knowledge.findByIdAndUpdate(exactMatch._id, { $inc: { usageCount: 1 } });
    return exactMatch.answer;
  }

  // 2. Advanced Similarity Logic (Word Overlap)
  const queryWords = cleanWords(query);
  if (queryWords.length === 0) return null;

  const candidates = await Knowledge.find({ organizationId }).limit(100).lean();
  
  let bestMatch = null;
  let highestScore = 0;
  let bestPercent = 0;

  for (const item of candidates) {
    const itemWords = cleanWords(item.question);
    if (itemWords.length === 0) continue;

    // Calculate Absolute matches
    const intersection = queryWords.filter(w => itemWords.includes(w));
    const matchCount = intersection.length;

    // Calculate Percent match relative to SAVED question (how well did we cover its intent?)
    const percent = matchCount / itemWords.length;

    // 🎯 Ranking Logic: Priority on Percentage but only if at least 1-2 words match
    if (percent > bestPercent) {
      bestPercent = percent;
      bestMatch = item;
      highestScore = matchCount;
    } else if (percent === bestPercent && matchCount > highestScore) {
       // Match tie? Use higher absolute word count
       highestScore = matchCount;
       bestMatch = item;
    }
  }

  // 🏆 Smart Threshold Logic
  // Match if: 
  // - High percentage (> threshold, e.g. 50%+) AND at least 2 non-stop words match
  // - OR Nearly 100% match if query is very short
  const isMatch = (bestPercent >= threshold && highestScore >= 2) || (bestPercent > 0.8 && highestScore >= 1);

  if (isMatch && bestMatch) {
    console.log(`🧠 [SMART-MATCH] Found! Score: ${highestScore}, Percent: ${(bestPercent * 100).toFixed(0)}%`);
    await Knowledge.findByIdAndUpdate(bestMatch._id, { $inc: { usageCount: 1 } });
    return bestMatch.answer;
  }

  return null;
}

/**
 * 📚 RAG Search: Returns context for AI Brain fallback
 */
export async function searchKnowledge(query, organizationId) {
  if (!query || !organizationId) return "";
  
  await dbConnect();
  const words = cleanWords(query);
  
  const matches = await Knowledge.find({
    organizationId,
    $or: [
      { keywords: { $in: words } },
      { question: { $regex: normalizeText(query), $options: "i" } },
    ]
  })
  .sort({ priority: -1 })
  .limit(3)
  .lean();

  if (matches.length === 0) return "";
  
  return matches
    .map(doc => `Q: ${doc.question}\nA: ${doc.answer}`)
    .join("\n\n");
}

/**
 * 👨‍💼 Agent Learning: Auto-save manual replies to Knowledge Base
 */
export async function learnFromAgent(question, answer, organizationId) {
  if (!question || !answer || !organizationId) return;

  await dbConnect();
  
  const normQ = normalizeText(question);
  const a = answer.trim();

  if (a.length < 5) return;

  const existing = await Knowledge.findOne({ 
    organizationId, 
    question: { $regex: new RegExp(`^${normQ}$`, "i") } 
  });

  if (existing) return;

  const intent = await detectIntent(question);
  const category = intent !== "unknown" ? intent : "learned";
  const keywords = cleanWords(question);

  await Knowledge.create({
    organizationId,
    category,
    question: normQ,
    answer: a,
    keywords,
    priority: 1
  });

  console.log(`🧠 [AI-LEARNING] New ${category.toUpperCase()} knowledge learned: "${normQ}"`);
}
