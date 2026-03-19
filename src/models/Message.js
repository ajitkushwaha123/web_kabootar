import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    senderId: {
      type: String, // Clerk user ID
      default: null,
    },

    organizationId: {
      type: String, // Clerk org ID
      required: true,
      index: true,
    },

    senderType: {
      type: String,
      enum: ["agent", "admin", "system", "user"],
      required: true,
    },

    whatsappMessageId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    messageType: {
      type: String,
      enum: [
        "text",
        "reaction",
        "image",
        "sticker",
        "file",
        "audio",
        "video",
        "location",
        "contacts",
        "document",
        "unsupported",
      ],
      default: "text",
      index: true,
    },

    text: {
      preview_url: { type: Boolean, default: false },
      body: { type: String, trim: true },
    },

    reaction: {
      message_id: { type: String },
      emoji: { type: String },
    },

    image: {
      link: { type: String },
      caption: { type: String },
    },

    sticker: {
      id: { type: String },
      link: { type: String },
      mime_type: { type: String },
      sha256: { type: String },
    },

    video: {
      id: { type: String },
      link: { type: String },
      caption: { type: String },
      mime_type: { type: String },
      sha256: { type: String },
    },

    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      name: { type: String },
      address: { type: String },
    },

    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact",
      },
    ],

    document: {
      id: { type: String },
      link: { type: String },
      filename: { type: String },
      mime_type: { type: String },
      sha256: { type: String },
    },

    unsupported: {
      code: { type: Number },
      title: { type: String },
      message: { type: String },
      details: { type: String },
    },

    context: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    direction: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "failed", "received"],
      default: "sent",
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

    metadata: {
      type: Object,
      default: {},
    },

    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Optimized indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ organizationId: 1, direction: 1, timestamp: -1 });
messageSchema.index({ organizationId: 1, isDeleted: 1 });
messageSchema.index({ whatsappMessageId: 1 }, { sparse: true });

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
