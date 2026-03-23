import dbConnect from "../dbConnect";
import BotRule from "@/models/BotRule";

/**
 * Searches and matches user message against bot rules.
 * @param {string} userMessage - text from customer
 * @param {Array} rules - pre-fetched rules for efficiency
 */
export function matchRule(userMessage, rules) {
  if (!userMessage || !rules?.length) return null;
  
  const text = userMessage.trim().toLowerCase();
  
  // Rules should already be sorted by priority DESC
  for (const rule of rules) {
    if (!rule.isActive) continue;
    
    const matched = rule.keywords.some(kw => 
       text.includes(kw.trim().toLowerCase())
    );
    
    if (matched) return rule.reply;
  }
  
  return null;
}

/**
 * Seeding initial bot rules for Magic Scale
 */
export async function seedMagicScaleBotRules(organizationId) {
  if (!organizationId) return;

  await dbConnect();
  const existingCount = await BotRule.countDocuments({ organizationId });
  if (existingCount > 0) return;

  const defaultRules = [
    {
      organizationId,
      keywords: ["hi", "hello", "hlo", "hey", "namaste", "hii"],
      reply: "Namaste! 🙏 Main Magic Scale ka AI assistant hoon. Restaurant consulting, Zomato/Swiggy onboarding, FSSAI ya GST ke liye poochh sakte hain. Main aapki kya help kar sakta hoon? 😊",
      category: "general", priority: 10,
    },
    {
      organizationId,
      keywords: ["zomato swiggy", "dono", "both", "combo", "listing"],
      reply: "Zomato + Swiggy dono ka onboarding package sirf ₹3,500 mein hai (GST included). Sirf 3 din mein restaurant live! Kya aap start karna chahte hain? 🚀",
      category: "onboarding", priority: 9,
    },
    {
      organizationId,
      keywords: ["price", "cost", "kitna", "fees", "rate", "charge", "pricing"],
      reply: "Magic Scale Plans:\n🔹 Onboarding: ₹3,500\n🔹 Growth Basic: ₹8,499/month\n🔹 Growth Premium: ₹11,999/month\n🔹 FSSAI: ₹1,000\n🔹 GST: ₹1,000\nKaunsi service chahiye? 😊",
      category: "sales", priority: 8,
    },
    {
      organizationId,
      keywords: ["fssai", "license", "licence", "food safety"],
      reply: "FSSAI Food License:\n📋 1yr: ₹1,000 | 📋 5yr: ₹3,000\n⏱ 15 din mein issue hota hai. \nMain application start karwata hoon! documents share karein? 🙂",
      category: "fssai", priority: 7,
    },
    {
      organizationId,
      keywords: ["gst", "registration", "gst number"],
      reply: "GST Registration sirf ₹1,000 mein!\n⚡ 24-48 hours mein GST number mil jaata hai. Documents mein PAN, Aadhaar aur Address Proof chahiye.",
      category: "gst", priority: 7,
    },
    {
       organizationId,
       keywords: ["growth plan", "sales", "orders", "revenue"],
       reply: "Growth plans starts from ₹8,499/month. Hum menu optimization aur strategy se orders badhate hain. Demo chat karke dekhein? 📊",
       category: "sales", priority: 6,
    }
  ];

  await BotRule.insertMany(defaultRules);
  console.log(`✅ Default MagicScale bot rules seeded for org: ${organizationId}`);
}
