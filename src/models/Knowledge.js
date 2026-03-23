import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema(
  {
    organizationId: {
       type: String,
       required: true,
       index: true
    },
    category: {
      type: String, // "pricing", "faq", "product", "policy", etc.
      default: "general"
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    keywords: {
      type: [String],
      default: []
    },
    priority: {
      type: Number,
      default: 1 // Higher is searched first
    }
  },
  { timestamps: true }
);

// Search optimization: keyword matching
knowledgeSchema.index({ keywords: 1 });
knowledgeSchema.index({ organizationId: 1, priority: -1 });

const Knowledge = mongoose.models.Knowledge || mongoose.model("Knowledge", knowledgeSchema);

export default Knowledge;
