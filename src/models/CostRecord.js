import mongoose from "mongoose";

const costRecordSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String, // Clerk Org ID
      required: true,
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      index: true,
    },
    type: {
      type: String,
      enum: ["template", "ai_gemini", "ai_openai", "agent_message"],
      required: true,
    },
    messageType: {
      type: String, // text, image, template, etc.
    },
    cost: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for daily/monthly tracking
costRecordSchema.index({ organizationId: 1, createdAt: -1 });

const CostRecord =
  mongoose.models.CostRecord || mongoose.model("CostRecord", costRecordSchema);

export default CostRecord;
