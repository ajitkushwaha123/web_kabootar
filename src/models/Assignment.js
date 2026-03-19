import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
      index: true,
    },

    agentId: {
      type: String, // Clerk user ID
      required: true,
      index: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true, versionKey: false }
);

const Assignment =
  mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);

export default Assignment;
