import dbConnect from "@/lib/dbConnect";
import { withAgent } from "@/lib/with-agent/withAgent";
import { NextResponse } from "next/server";
import Workspace from "@/Models/workspace.model";

const handler = async (req, agentMongoId, pagination, context) => {
  await dbConnect();

  const { id } = context.params || {};

  if (!id) {
    return NextResponse.json(
      { error: "Missing ID parameter" },
      { status: 400 }
    );
  }

  const workspace = await Workspace.findById(id);

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  return NextResponse.json({ workspace }, { status: 200 });
};

export const GET = (req, context) => withAgent(handler)(req, context);
