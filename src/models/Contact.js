import mongoose from "mongoose";

const phoneSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true },
    wa_id: { type: String, trim: true },
    type: { type: String, trim: true },
  },
  { _id: false }
);

const nameSchema = new mongoose.Schema(
  {
    formatted_name: { type: String, trim: true },
    first_name: { type: String, trim: true },
    last_name: { type: String, trim: true },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String, // Clerk org ID
      required: true,
      index: true,
    },

    name: nameSchema,
    phone: [phoneSchema],

    source: {
      type: String,
      enum: [
        "whatsapp_contact_shared",
        "whatsapp_ad",
        "direct_message_received",
        "imported",
        "manual_contacted",
      ],
      default: "whatsapp_contact_shared",
    },

    wa_id: { type: String, index: true, trim: true },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },

    primaryPhone: {
      type: String,
      required: true,
      trim: true,
    },

    primaryName: { type: String, trim: true },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: false,
      sparse: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// ✅ Ensure unique primaryPhone per organization
contactSchema.index({ organizationId: 1, primaryPhone: 1 }, { unique: true });

const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);

export default Contact;
