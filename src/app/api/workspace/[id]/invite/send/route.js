import dbConnect from "@/lib/dbConnect";
import { withAgent } from "@/lib/with-agent/withAgent";
import { NextResponse } from "next/server";
import Workspace from "@/Models/workspace.model";
import jwt from "jsonwebtoken";
import Invitation from "@/Models/invitation.model";
import { sendInvitationEmail } from "@/lib/email/sendInvitationEmail"; // ✅ Import

const handler = async (req, agentMongoId, pagination, context) => {
  try {
    await dbConnect();

    const { id } = context.params || {};
    const { email, role } = await req.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: "Missing workspace ID or email" },
        { status: 400 }
      );
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    const alreadyInvited = workspace.members.find(
      (member) => member?.email.toLowerCase() === normalizedEmail
    );

    if (alreadyInvited) {
      return NextResponse.json(
        { error: "User already invited or a member" },
        { status: 400 }
      );
    }

    const workspaceId = workspace._id.toString();

    const inviteToken = jwt.sign(
      { email: normalizedEmail, workspaceId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await Invitation.create({
      email: normalizedEmail,
      role: role || "member",
      invitedBy: agentMongoId,
      invitedAt: new Date(),
      status: "pending",
      token: inviteToken,
      workspaceId: id,
    });

    const baseUrl = process.env.NEXT_APP_BASE_URL;
    const inviteUrl = `${baseUrl}/workspace/invite?token=${inviteToken}`;

    await sendInvitationEmail({
      to: normalizedEmail,
      workspaceName: workspace.name,
      inviteUrl,
    });

    return NextResponse.json(
      { message: "Invitation sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = (req, context) => withAgent(handler)(req, context);
