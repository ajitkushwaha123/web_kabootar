import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
        type: String,
        enum: ["member", "admin"],
        default: "member",
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "expired", "revoked"],
        default: "pending",
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    invitedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    token: { type: String, required: true, unique: true },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
    },
} , {timestamps : true})

const Invitation = mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);
export default Invitation;