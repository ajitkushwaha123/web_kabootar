import dbConnect from "@/lib/dbConnect";
import { withAgent } from "@/lib/with-agent/withAgent";
import { NextResponse } from "next/server";
import Workspace from "@/Models/workspace.model";
import User from "@/Models/user.model";

const handler = async (req, agentMongoId, pagination, context) => {
  try {
    await dbConnect();

    const { id } = context.params || {};

    if (!id) {
      return NextResponse.json(
        { error: "Missing workspace ID" },
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

    const members = workspace.members;

    if (!members || members.length === 0) {
      return NextResponse.json(
        { error: "No members found in this workspace" },
        { status: 404 }
      );
    }

    const membersData = await Promise.all(
      members.map(async (member) => {
        const user = await User.findById(member.user).select(
          "_id email username name profileImageUrl phoneNumber isActive"
        );
        return {
          ...user.toObject(),
          role: member.role,
        };
      })
    );

    return NextResponse.json({ members: membersData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const GET = (req, context) => withAgent(handler)(req, context);
