import dbConnect from "@/lib/dbConnect";
import { withAgent } from "@/lib/with-agent/withAgent";
import Contact from "@/Models/contact.model";
import { NextResponse } from "next/server";

const handler = async (req, agentMongoId) => {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const cursor = searchParams.get("cursor");
  const tag = searchParams.get("tag");

  const query = {
    assignedTo: agentMongoId,
  };

  if (tag && tag !== "All") {
    query.tags = tag;
  }

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const contacts = await Contact.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1); 

  const hasMore = contacts.length > limit;
  const results = hasMore ? contacts.slice(0, -1) : contacts;

  return NextResponse.json({
    data: results,
    nextCursor: hasMore ? results[results.length - 1].createdAt : null,
  });
};

export const GET = withAgent(handler);
