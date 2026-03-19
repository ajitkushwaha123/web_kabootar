import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const GET = async (req, { params }) => {
  try {
    await dbConnect();

    const { chatId } = await params;
    const { orgId } = await auth();

    if (!chatId || !orgId) {
      return NextResponse.json(
        {
          success: false,
          message: "chatId or orgId is required",
        },
        { status: 400 }
      );
    }

    const chatDetails = await Conversation.findOne({
      _id: chatId,
      organizationId: orgId,
      isDeleted: false,
    })
      .populate("contactId", "primaryName primaryPhone source")
      .populate("lastMessageId")
      .lean();

    if (!chatDetails) {
      return NextResponse.json(
        {
          success: false,
          message: "Chat not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Chat details fetched successfully",
        data: chatDetails,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching chat details:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch chat details",
      },
      { status: 500 }
    );
  }
};
