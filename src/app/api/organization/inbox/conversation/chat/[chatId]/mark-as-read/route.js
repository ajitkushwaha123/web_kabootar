import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { NextResponse } from "next/server";

export const PUT = async (req, { params }) => {
  try {
    await dbConnect();

    const { chatId } = await params;
    if (!chatId) {
      return NextResponse.json(
        { message: "Conversation ID missing", success: false },
        { status: 400 }
      );
    }

    const conversation = await Conversation.findById(chatId);

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found", success: false },
        { status: 404 }
      );
    }

    conversation.unreadCount = 0;
    await conversation.save();

    return NextResponse.json(
      {
        message: "Conversation marked as read",
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        message: err.message || "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
};
