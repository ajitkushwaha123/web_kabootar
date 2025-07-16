import { withAgent } from "@/lib/api/withAgent";
import Conversation from "@/Models/coversation.model";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

const handler = async (req, agentMongoId) => {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const cursor = searchParams.get("cursor"); 

  const query = { assignedTo: agentMongoId };
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const chatList = await Conversation.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1); 

  const hasMore = chatList.length > limit;
  const results = hasMore ? chatList.slice(0, -1) : chatList;

  return NextResponse.json({
    data: results,
    nextCursor: hasMore ? results[results.length - 1].createdAt : null,
  });
};

export const GET = withAgent(handler);
