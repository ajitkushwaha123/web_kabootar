import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/getAuth";

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

    const { orgId, userId } = await getAuthContext();

    if (!userId || !orgId) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const Conversation = (await import("@/models/Conversation")).default;
    const conversation = await Conversation.findById(chatId).populate("contactId").lean();
    const contactName = conversation?.contactId?.primaryName || "Unknown Customer";

    const messages = await Message.find({
      conversationId: chatId,
      organizationId: orgId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    const enrichedMessages = messages.map(msg => ({
      ...msg,
      senderName: msg.direction === "incoming" ? contactName : "You",
      senderAvatar: "" // can add logic for contact avatar if available
    }));

    return NextResponse.json(
      {
        message: enrichedMessages.length > 0 ? "Messages fetched successfully" : "No messages found",
        data: enrichedMessages,
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
