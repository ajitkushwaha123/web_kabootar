// models/message.model.ts  (rename to .js if not using TypeScript)

import mongoose from "mongoose";

const mediaSubSchema = new mongoose.Schema(
  {
    url: String, // Signed URL retrieved from WA media API
    mimeType: String, // e.g. "image/jpeg", "audio/ogg; codecs=opus"
    sha256: String, // Content hash returned by WA
    fileSize: Number, // Bytes (optional)
    fileName: String, // For documents
    voice: Boolean, // true if this audio is a voice note
  },
  { _id: false }
);

const locationSubSchema = new mongoose.Schema(
  {
    latitude: Number,
    longitude: Number,
    name: String, // e.g. “Spicy Kulcha Factory”
    address: String,
    url: String, // Google Maps link if provided
  },
  { _id: false }
);

const contactSubSchema = new mongoose.Schema(
  {
    waId: String, // WhatsApp ID
    name: {
      formattedName: String,
      firstName: String,
      lastName: String,
      middleName: String,
    },
    phones: [
      {
        phone: String,
        type: String, // "CELL", "HOME", …
        waId: String,
      },
    ],
    emails: [String],
    org: {
      company: String,
      department: String,
      title: String,
    },
  },
  { _id: false }
);

const reactionSubSchema = new mongoose.Schema(
  {
    emoji: String,
    targetWaMsgId: String, // WA msg ID that was reacted to
  },
  { _id: false }
);

const interactiveSubSchema = new mongoose.Schema(
  {
    type: {
      type: String, // "button_reply" | "list_reply"
      required: true,
    },
    buttonReply: {
      id: String, // developer‑defined payload id
      title: String, // button text
    },
    listReply: {
      id: String,
      title: String,
      description: String,
      sectionId: String,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    /** WhatsApp‑side IDs & direction **/
    waMessageId: { type: String, index: true }, // "wamid.*"
    fromMe: { type: Boolean, required: true }, // true = business sent
    senderPhone: String, // E.164 (includes "+")
    recipientPhone: String,

    /** Core classification **/
    type: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "sticker",
        "reaction",
        "location",
        "contacts",
        "interactive",
        "template",
        "unsupported",
      ],
      required: true,
    },

    /** Payload variants **/
    text: { body: String }, // plain text
    caption: String, // for media with captions
    media: mediaSubSchema, // image/video/audio/document/sticker
    reaction: reactionSubSchema, // emoji reactions
    location: locationSubSchema, // live location not included here
    contacts: [contactSubSchema], // array of vCards
    interactive: interactiveSubSchema, // replies from buttons/lists
    templateId: String, // outgoing template name
    components: mongoose.Schema.Types.Mixed, // variables sent with template

    /** Context (replies / threading) **/
    context: {
      waMessageId: String, // original WA msg ID
      localMessageId: {
        // if already in DB
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      forwarded: { type: Boolean, default: false },
    },

    /** Delivery lifecycle **/
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "failed"],
      default: "pending",
      index: true,
    },
    deliveredAt: Date,
    readAt: Date,
    error: {
      code: Number,
      title: String,
      details: String,
    },

    /** Raw WA payload for debugging or re‑processing **/
    raw: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

/* Helpful indexes */
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ "context.waMessageId": 1 });

export default mongoose.models.Message ||
  mongoose.model("Message", messageSchema);
