import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    org_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    logo_url: {
      type: String,
      default: "",
    },
    display_phone_number: {
      type: String,
      trim: true,
    },
    phone_number_id: {
      type: String,
      trim: true,
    },
    wa_business_account_id: {
      type: String,
      trim: true,
    },
    access_token: {
      type: String,
      trim: true,
    },
    admin_id: {
      type: String,
      required: true,
      index: true,
    },
    members: [
      {
        user_id: String, // Clerk User ID
        role: {
          type: String,
          enum: ["ADMIN", "MEMBER"],
          default: "MEMBER",
        },
        permissions: {
           type: [String],
           default: ["inbox", "analytics", "bot", "team"],
        },
      },
    ],
    autoAiReply: {
      type: Boolean,
      default: false,
    },
    autoReplyMode: {
      type: String,
      enum: ["OFF", "BOT_ONLY", "AI_ONLY", "HYBRID"],
      default: "HYBRID",
    },
    aiCapabilities: {
      type: [String],
      default: ["reply_suggestion"],
    },
    autoLearn: {
      type: Boolean,
      default: true,
    },
    aiConfidenceThreshold: {
      type: Number,
      default: 0.85,
    },
    leadDistributionSettings: {
      rule: {
        type: String,
        enum: ["round_robin", "load_based", "manual"],
        default: "round_robin",
      },
      roundRobinIndex: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Organization =
  mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);

export default Organization;
