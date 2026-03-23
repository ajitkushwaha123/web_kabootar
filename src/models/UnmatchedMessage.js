import mongoose from "mongoose";

const unmatchedMessageSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

unmatchedMessageSchema.index({ organizationId: 1, resolved: 1 });

const UnmatchedMessage =
  mongoose.models.UnmatchedMessage ||
  mongoose.model("UnmatchedMessage", unmatchedMessageSchema);

export default UnmatchedMessage;
