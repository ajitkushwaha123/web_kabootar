import { NextResponse } from "next/server";
import Conversation from "@/Models/coversation.model";
import { getAgentMongoId } from "@/lib/server-helpers/getAgentMongoId";
import dbConnect from "@/lib/dbConnect";

export const GET = async (req) => {
  try {
    await dbConnect();

    const mongoId = await getAgentMongoId(req); 
    console.log("Mongo ID:", mongoId); 

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "open";
    const before = url.searchParams.get("before");

    const query = { status, assignedTo: mongoId };
    if (before) {
      query.updatedAt = { $lt: new Date(before) };
    }

    const rows = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate("lastMessage")
      .lean();

    return NextResponse.json(rows);
  } catch (err) {
    if (err instanceof Response) return err;

    console.error("Error in GET /api/conversations:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};
