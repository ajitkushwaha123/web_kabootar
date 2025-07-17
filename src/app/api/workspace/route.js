import dbConnect from "@/lib/dbConnect";
import { withAgent } from "@/lib/with-agent/withAgent";
import { NextResponse } from "next/server";
import Workspace from "@/Models/workspace.model";

const handler = async (req, agentMongoId) => {
  await dbConnect();

  const workspaces = await Workspace.find({
    "members.user": agentMongoId,
  }).lean();

  const result = workspaces.map((ws) => {
    const member = ws.members.find(
      (m) => m.user.toString() === agentMongoId.toString()
    );

    const role =
      ws.createdBy.toString() === agentMongoId.toString()
        ? "Admin"
        : member?.role || "Member";

    return {
      _id: ws._id,
      name: ws.name,
      slug: ws.slug,
      logo: ws.logo || null,
      role,
    };
  });

  return NextResponse.json({ workspaces: result }, { status: 200 });
};

export const GET = withAgent(handler);
