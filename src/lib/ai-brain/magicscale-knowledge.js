import Knowledge from "@/models/Knowledge";

export async function seedMagicScaleKnowledge(organizationId) {
  if (!organizationId) return;
  const existing = await Knowledge.countDocuments({ organizationId });
  if (existing > 0) return;

  const data = [
    // ════════════════════════════════════════════════
    // ZOMATO + SWIGGY ONBOARDING
    // ════════════════════════════════════════════════
    {
      organizationId,
      category: "onboarding",
      question: "Zomato aur Swiggy pe restaurant kaise list karein?",
      answer: "Hum aapka complete onboarding karte hain — Zomato + Swiggy dono pe sirf ₹3,500 mein (GST inclusive). Sirf 3 din mein aapka restaurant live ho jaata hai! Isme account setup, menu, descriptions, combos sab included hai.",
      keywords: ["zomato","swiggy","list","onboard","register","restaurant","live","start","kaise"],
      priority: 10,
    },
    {
      organizationId,
      category: "onboarding",
      question: "Sirf Zomato ya sirf Swiggy pe list karwana hai",
      answer: "Koi baat nahi! Sirf Zomato ya sirf Swiggy — dono ka price ₹2,000 hai (GST inclusive). 3 din mein live ho jaata hai.",
      keywords: ["sirf","only","ek","zomato only","swiggy only","single","ek platform"],
      priority: 9,
    },
    {
      organizationId,
      category: "onboarding",
      question: "Onboarding mein kya kya milega?",
      answer: "Onboarding package mein yeh sab included hai:\n• Complete account setup\n• Restaurant live karna (3 din mein)\n• Professional menu setup\n• Engaging food descriptions\n• Add-ons aur combo setup\n• Full account optimization\nSab ek saath — listing sirf nahi, optimization bhi!",
      keywords: ["included","milega","kya","package","features","service","onboarding mein"],
      priority: 9,
    },
    {
      organizationId,
      category: "onboarding",
      question: "Kitne din mein restaurant live hoga?",
      answer: "3 working days mein aapka restaurant Zomato aur Swiggy dono pe live ho jaata hai. Hum poora process handle karte hain — aapko kuch karne ki zaroorat nahi!",
      keywords: ["kitne din","time","kab","live","jaldi","fast","3 din","days"],
      priority: 9,
    },

    // ════════════════════════════════════════════════
    // GROWTH PLANS — BASIC & PREMIUM
    // ════════════════════════════════════════════════
    {
      organizationId,
      category: "growth_plan",
      question: "Growth plan ki pricing kya hai?",
      answer: "Hamare 2 growth plans hain:\n\n🔹 Basic Plan (50 se kam items):\n• 1 Month: ₹8,499\n• 3 Months: ₹19,000\n\n🔸 Premium Plan (50+ items):\n• 1 Month: ₹11,999\n• 3 Months: ₹27,000\n\nDono plans mein menu optimization, weekly reports, dedicated account manager included hai!",
      keywords: ["growth","plan","price","cost","kitna","rate","basic","premium","monthly","pricing"],
      priority: 10,
    },
    {
      organizationId,
      category: "growth_plan",
      question: "Basic aur Premium plan mein kya fark hai?",
      answer: "Basic Plan (₹8,499/month) mein standard features milte hain. Premium Plan (₹11,999/month) mein extra milta hai:\n✅ SEO Friendly Content\n✅ Response to Reviews\n✅ Menu Optimization\n✅ Marketing Insights\n✅ Boosted Promotions\n✅ Festival Specific Promotions\n✅ Weekly Menu Insights\n✅ Analytics Dashboard\nPremium = zyada growth, zyada visibility!",
      keywords: ["basic","premium","difference","fark","better","kaunsa","compare","vs"],
      priority: 9,
    },
    {
      organizationId,
      category: "growth_plan",
      question: "3 mahine ka plan kya hoga?",
      answer: "3 month plan mein aap save karte ho:\n• Basic 3 months: ₹19,000 (vs ₹25,497 if monthly)\n• Premium 3 months: ₹27,000 (vs ₹35,997 if monthly)\nLong term lene se better ROI milta hai!",
      keywords: ["3 month","teen mahine","quarterly","long term","3 mahine","save"],
      priority: 8,
    },

    // ════════════════════════════════════════════════
    // 3-PHASE STRATEGY
    // ════════════════════════════════════════════════
    {
      organizationId,
      category: "strategy",
      question: "Aap kaise kaam karte ho? Kya strategy hai?",
      answer: "Hum 3-phase strategy follow karte hain:\n\n📌 Month 1 — Customer Acquisition:\nMenu optimization, high-quality images, offers & ads\n\n📌 Month 2 — Repeat Orders:\nData analysis, combo offers, smart discounts, review management\n\n📌 Month 3 — Profitability:\nPricing optimization, discount reduction, better ROI on ads\nHar mahine ka ek clear goal hota hai!",
      keywords: ["strategy","kaise","kaam","phase","plan","month","process","approach"],
      priority: 8,
    },

    // ════════════════════════════════════════════════
    // FSSAI LICENSE
    // ════════════════════════════════════════════════
    {
      organizationId,
      category: "fssai",
      question: "FSSAI food license kaise milega? Price kya hai?",
      answer: "Hum FSSAI registration handle karte hain:\n\n📋 1-Year Basic License: ₹1,000\n📋 5-Year Basic License: ₹3,000\n⏱ 15 din mein license issue ho jaata hai\n\nDocuments chahiye:\nPAN Card, Aadhaar, Mobile, Email, Photo, Shop photo\n\nHum poora process handle karte hain — application se approval tak!",
      keywords: ["fssai","food license","licence","registration","food safety","1 year","5 year","fssai kaise"],
      priority: 9,
    },
    {
      organizationId,
      category: "fssai",
      question: "FSSAI mein kitne din lagte hain?",
      answer: "FSSAI license 15 working days mein issue ho jaata hai. Hum poora process manage karte hain, aapko sirf documents dene hain!",
      keywords: ["fssai time","kitne din","15 din","days","jaldi","fast"],
      priority: 8,
    },

    // ════════════════════════════════════════════════
    // GST REGISTRATION
    // ════════════════════════════════════════════════
    {
      organizationId,
      category: "gst",
      question: "GST registration kaise hoga? Price kya hai?",
      answer: "GST registration sirf ₹1,000 mein! 24-48 hours mein GST number mil jaata hai.\n\nDocuments chahiye:\nPAN Card, Aadhaar, Mobile, Email, Photo, Address proof (Rent agreement ya electricity bill), Shop photo\n\nHum poora process handle karte hain — bilkul hassle-free!",
      keywords: ["gst","registration","gst number","tax","₹1000","kitna","documents","gst kaise"],
      priority: 9,
    },
    {
      organizationId,
      category: "gst",
      question: "GST kitne din mein milega?",
      answer: "GST number sirf 24-48 hours mein issue ho jaata hai! Yeh hamare sabse fast services mein se ek hai.",
      keywords: ["gst time","48 hours","24 hours","jaldi","fast","kab milega","kitne din"],
      priority: 8,
    },

    // ════════════════════════════════════════════════
    // COMPANY INFO
    // ════════════════════════════════════════════════
    {
      organizationId,
      category: "company",
      question: "Magic Scale kya hai? Company ke baare mein batao",
      answer: "Magic Scale ek restaurant consulting firm hai jo restaurants aur cloud kitchens ko Zomato/Swiggy pe grow karne mein help karta hai.\n\n🎯 Mission: Restaurant owners aur cloud kitchen founders ko empower karna\n🌟 Vision: India ka leading restaurant consulting firm banna\n\nAddress: Plot No. 72, Near Nav Yug School, Rajokari, New Delhi\n📞 +91 8826073117\n🌐 magicscale.in",
      keywords: ["magic scale","company","kya hai","about","kaun","firm","address","contact","website"],
      priority: 8,
    },
    {
      organizationId,
      category: "company",
      question: "Contact kaise karein? Phone number kya hai?",
      answer: "Hum se contact karein:\n📞 Phone: +91 8826073117\n🌐 Website: magicscale.in\n📍 Plot No. 72, Near Nav Yug School, Rajokari, New Delhi\n\nHum Mon-Sat available hain — koi bhi sawaal ho, poochh sakte hain!",
      keywords: ["contact","phone","number","call","address","website","reach","mil","bat"],
      priority: 7,
    },

    // ════════════════════════════════════════════════
    // PAYMENT & CANCELLATION
    // ════════════════════════════════════════════════
    {
      organizationId,
      category: "payment",
      question: "Payment kaise karni hogi? EMI milega?",
      answer: "Payment ek saath (one-shot) karni hoti hai service shuru hone se pehle. EMI ya deferred payment available nahi hai abhi. UPI, bank transfer accepted hai.",
      keywords: ["payment","EMI","kaise","advance","kitna dena","pay","paisa"],
      priority: 7,
    },
    {
      organizationId,
      category: "payment",
      question: "Cancel kar sakte hain? Refund milega?",
      answer: "Haan! Aap kabhi bhi cancel kar sakte hain — sirf 3 din pehle written notice dena hoga next billing cycle se pehle. Flexible plans — koi lock-in nahi!",
      keywords: ["cancel","cancellation","refund","band","stop","lock","flexible"],
      priority: 7,
    },

    // ════════════════════════════════════════════════
    // COMMON SALES OBJECTIONS
    // ════════════════════════════════════════════════
    {
      organizationId,
      category: "sales",
      question: "Guarantee hai ki orders badhenge?",
      answer: "Hum 100% guarantee nahi de sakte kyunki results platform performance pe bhi depend karte hain. Lekin hamare clients ka average 40-60% order increase hua hai pehle 3 months mein. Hum data-driven approach use karte hain — har decision numbers pe based hota hai!",
      keywords: ["guarantee","result","badhega","assured","promise","surety","kitna badhega"],
      priority: 8,
    },
    {
      organizationId,
      category: "sales",
      question: "Humne already Zomato pe account bana liya hai",
      answer: "Koi baat nahi! Hum existing accounts ka bhi optimization karte hain. Often existing accounts mein bahut improvement ki scope hoti hai — menu score, images, descriptions, ratings. Ek free audit karein — main batata hoon kya improve ho sakta hai!",
      keywords: ["already","pehle se","exist","bana hua","hai hi","account hai"],
      priority: 8,
    },
  ];

  await Knowledge.insertMany(data);
  console.log("✅ MagicScale knowledge base seeded — " + await Knowledge.countDocuments({ organizationId }) + " entries!");
}
