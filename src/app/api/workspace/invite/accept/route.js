import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Workspace from "@/Models/workspace.model";
import Invitation from "@/Models/invitation.model";
import { withAgent } from "@/lib/with-agent/withAgent";
import User from "@/Models/user.model";

const handler = async (req, agentMongoId) => {
  try {
    await dbConnect();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invitation = await Invitation.findOne({ token });

    if (!invitation || invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const user = await User.findById(agentMongoId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      invitation.email.trim().toLowerCase() !== user.email.trim().toLowerCase()
    ) {
      return NextResponse.json(
        {
          error: "Logged-in email does not match invitation",
          invitationEmail: invitation.email,
          userEmail: user.email,
        },
        { status: 403 }
      );
    }

    const workspace = await Workspace.findById(invitation.workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const alreadyMember = workspace.members.some(
      (member) => member.user.toString() === agentMongoId.toString()
    );

    if (!alreadyMember) {
      workspace.members.push({
        user: agentMongoId,
        email: user.email,
        role: invitation.role,
        joinedAt: new Date(),
      });
      await workspace.save();
    }

    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await invitation.save();

    return NextResponse.json(
      { message: "Invitation accepted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error accepting invitation:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
};

export const POST = withAgent(handler);
