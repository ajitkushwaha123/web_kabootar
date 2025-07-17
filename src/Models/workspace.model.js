import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member", "manager"],
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
        email: { type: String, lowercase: true, trim: true, required: true },
      },
    ],
    metadata: { type: Object, default: {} },
    logo: { type: String, default: "" },
  },
  { timestamps: true }
);
const Workspace =
  mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);

export default Workspace;
