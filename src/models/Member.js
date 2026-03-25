import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    user_id: {
      type: String, // Clerk User ID (optional link)
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true, // WhatsApp number for notification
    },
    email: {
      type: String,
    },
    role: {
      type: String,
      enum: ["ADMIN", "SALES", "SUPPORT"],
      default: "SALES",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentLeads: {
      type: Number,
      default: 0,
    },
    totalLeads: {
      type: Number,
      default: 0,
    },
    permissions: {
      type: [String],
      default: ["inbox", "analytics", "bot", "team"],
    },
  },
  { timestamps: true }
);

const Member = mongoose.models.Member || mongoose.model("Member", memberSchema);
export default Member;
