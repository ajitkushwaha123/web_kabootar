import mongoose from "mongoose";

const botRuleSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    keywords: {
      type: [String], // ["price", "cost", "kitna"]
      required: true,
    },
    reply: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["sales", "support", "fssai", "gst", "onboarding", "general"],
      default: "general",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 5, // Higher = check first
    },
    matchCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

botRuleSchema.index({ organizationId: 1, priority: -1 });

const BotRule = mongoose.models.BotRule || mongoose.model("BotRule", botRuleSchema);

export default BotRule;
