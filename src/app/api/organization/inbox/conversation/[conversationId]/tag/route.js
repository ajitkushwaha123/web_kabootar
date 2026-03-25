import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { conversationId } = await params;
    const { tag } = await req.json();

    if (!conversationId || !tag) {
      return NextResponse.json({ message: "Invalid parameters", success: false }, { status: 400 });
    }

    await Conversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { tags: tag } }
    );

    return NextResponse.json({ success: true, message: "Tag added" });
  } catch (err) {
    return NextResponse.json({ message: err.message, success: false }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { conversationId } = await params;
    const { tag } = await req.json();

    if (!conversationId || !tag) {
      return NextResponse.json({ message: "Invalid parameters", success: false }, { status: 400 });
    }

    await Conversation.findByIdAndUpdate(
      conversationId,
      { $pull: { tags: tag } }
    );

    return NextResponse.json({ success: true, message: "Tag removed" });
  } catch (err) {
    return NextResponse.json({ message: err.message, success: false }, { status: 500 });
  }
}
