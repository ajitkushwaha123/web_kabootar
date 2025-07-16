import Conversation from "@/Models/coversation.model";
import dbConnect from "@/lib/dbConnect";
import { withAgent } from "@/lib/with-agent/withAgent";
import { NextResponse } from "next/server";

const handler = async (req, agentMongoId, { limit, cursor }) => {
  await dbConnect();

  const query = { assignedTo: agentMongoId };
  if (cursor) {
    query.createdAt = { $lt: cursor };
  }

  const conversations = await Conversation.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = conversations.length > limit;
  const results = hasMore ? conversations.slice(0, -1) : conversations;

  return NextResponse.json({
    data: results,
    nextCursor: hasMore
      ? results[results.length - 1].createdAt.toISOString()
      : null,
  });
};

export const GET = withAgent(handler);
