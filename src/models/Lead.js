import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
      index: true,
    },

    organizationId: {
      type: String,
      required: true,
      index: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },

    title: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    source: {
      type: String,
      enum: ["whatsapp", "manual", "imported", "form", "referral"],
      default: "whatsapp",
      index: true,
    },

    stage: {
      type: String,
      enum: ["new", "in_progress", "won", "lost"],
      default: "new",
      index: true,
    },

    value: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },

    assignedTo: [
      {
        type: String,
        index: true,
      },
    ],

    createdBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

leadSchema.index({ organizationId: 1, stage: 1 });
leadSchema.index({ organizationId: 1, status: 1 });

leadSchema.index(
  { organizationId: 1, contactId: 1 },
  { unique: true, partialFilterExpression: { contactId: { $exists: true } } }
);

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
export default Lead;
