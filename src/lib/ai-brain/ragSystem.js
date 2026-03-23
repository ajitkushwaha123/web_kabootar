import dbConnect from "../dbConnect";
import Knowledge from "@/models/Knowledge";

/**
 * Keyword-based retrieval for efficiency & simplicity.
 * @param {string} query - The customer's message text
 * @param {string} organizationId - Organization context is key!
 */
export async function searchKnowledge(query, organizationId) {
  if (!query || !organizationId) return "";
  
  await dbConnect();
  
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 3); // only focus on significant words
  
  // 1. Keyword-based matching in organization's knowledge base
  const matches = await Knowledge.find({
    organizationId,
    $or: [
      { keywords: { $in: words } },
      { question: { $regex: q, $options: "i" } },
      { answer: { $regex: q, $options: "i" } },
    ]
  })
  .sort({ priority: -1 })
  .limit(3)
  .lean();

  if (matches.length === 0) return "";
  
  // 2. Format knowledge for AI context injection
  const knowledgeText = matches
    .map(doc => `Q: ${doc.question}\nA: ${doc.answer}`)
    .join("\n\n");
    
  return knowledgeText;
}

/**
 * Seeding initial knowledge data if none exists.
 */
export async function seedInitialKnowledge(organizationId) {
  if (!organizationId) return;

  await dbConnect();
  const existingCount = await Knowledge.countDocuments({ organizationId });
  if (existingCount > 0) return;

  const defaultFAQs = [
    {
      organizationId,
      category: "pricing",
      question: "Price kya hai? Plans kya hain?",
      answer: "Humare 3 plans hain:\n• Starter: ₹999/month (1000 msgs)\n• Pro: ₹2499/month (unlimited msgs, AI features)\n• Enterprise: Custom dedicated support.",
      keywords: ["price", "cost", "paisa", "pessa", "charges", "charges?", "costing", "rate", "billing"],
      priority: 10,
    },
    {
       organizationId,
       category: "support",
       question: "Support help?",
       answer: "Hume Email karein support@magicscale.in pe ya fir isi WhatsApp number pe 10 AM to 7 PM support available hai.",
       keywords: ["help", "support", "madad", "baat", "call", "problem", "ticket"],
       priority: 5,
    }
  ];

  await Knowledge.insertMany(defaultFAQs);
  console.log(`✅ Base knowledge seeded for org: ${organizationId}`);
}
