import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Workspace from "@/Models/workspace.model";
import Invitation from "@/Models/invitation.model";
import { withAgent } from "@/lib/with-agent/withAgent";

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

    if (
      invitation.email?.toLowerCase().trim() !==
      agentMongoId.email?.toLowerCase().trim()
    ) {
      return NextResponse.json(
        { error: "Logged-in email does not match invitation" },
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
      (member) => member.userId === agentMongoId._id.toString()
    );

    if (!alreadyMember) {
      workspace.members.push({
        email: invitation.email,
        role: invitation.role,
        userId: agentMongoId._id.toString(),
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
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
};

export const POST = withAgent(handler);
