import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { conversationId } = await params;
    const { text, agentId, agentName } = await req.json();

    if (!conversationId || !text || !agentId) {
      return NextResponse.json({ message: "Invalid parameters", success: false }, { status: 400 });
    }

    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $push: {
          notes: {
            text,
            createdBy: agentId,
            creatorName: agentName,
            createdAt: new Date()
          }
        }
      }
    );

    return NextResponse.json({ success: true, message: "Note added" });
  } catch (err) {
    return NextResponse.json({ message: err.message, success: false }, { status: 500 });
  }
}

// Optional Delete note or Pin note route can be added here as well if needed.
