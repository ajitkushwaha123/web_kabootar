import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const GET = async (req, { params }) => {
  try {
    await dbConnect();

    const { chatId } = await params;
    if (!chatId) {
      return NextResponse.json(
        { message: "Conversation ID missing", success: false },
        { status: 400 }
      );
    }

    const { orgId, userId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const messages = await Message.find({
      conversationId: chatId,
      organizationId: orgId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      {
        message: "Messages fetched successfully",
        data: messages,
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching messages:", err);
    return NextResponse.json(
      {
        message: err.message || "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
};
