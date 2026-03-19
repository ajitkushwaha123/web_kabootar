import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
    },

    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
      index: true,
    },

    organizationId: {
      type: String, // Clerk org ID
      required: true,
      index: true,
    },

    participants: {
      type: [String], // Clerk user IDs or WA IDs
      default: [],
    },

    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    status: {
      type: String,
      enum: ["open", "closed", "archived"],
      default: "open",
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    isLead: {
      type: Boolean,
      default: false,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 🧩 Compound indexes for efficient sorting and filtering
conversationSchema.index({ organizationId: 1, lastMessageAt: -1 });
conversationSchema.index({
  organizationId: 1,
  unreadCount: -1,
  lastMessageAt: -1,
});
conversationSchema.index({
  organizationId: 1,
  isDeleted: 1,
  lastMessageAt: -1,
});

// ✅ Ensure one active (non-deleted) conversation per contact per org
conversationSchema.index(
  { organizationId: 1, contactId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// ✅ Ensure only one "open" conversation per contact per org
conversationSchema.index(
  { organizationId: 1, contactId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "open" } }
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
