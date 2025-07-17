import { NextResponse } from "next/server";
import Invitation from "@/Models/invitation.model";
import dbConnect from "@/lib/dbConnect";
import { withAgent } from "@/lib/with-agent/withAgent";

const handler = async (req, agentMongoId) => {
  await dbConnect();

  // Ensure request method is POST
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Method not allowed. Use POST." },
      { status: 405 }
    );
  }

  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const invitation = await Invitation.findOne({ token });

  if (!invitation || invitation.status !== "pending") {
    return NextResponse.json(
      { error: "Invalid or expired invitation" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    email: invitation.email,
    workspaceId: invitation.workspaceId,
    role: invitation.role,
    status: invitation.status,
  });
};

export const POST = withAgent(handler);
