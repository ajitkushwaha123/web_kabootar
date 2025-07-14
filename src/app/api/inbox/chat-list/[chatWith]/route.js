import dbConnect from "@/lib/dbConnect";
import messageModel from "@/models/message.model";
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  await dbConnect();

  const chatWith = params?.chatWith;

  if (!chatWith) {
    return NextResponse.json(
      { error: "Missing 'chatWith' parameter in URL" },
      { status: 400 }
    );
  }

  try {
    const rawMessages = await messageModel
      .find({
        $or: [{ from: chatWith }, { to: chatWith }],
      })
      .sort({ timestamp: 1 })
      .lean();

    const profileSample = rawMessages.find((m) => m.profileName) || {};
    const profileName = profileSample.profileName || "Unknown";

    const unreadCount = await messageModel.countDocuments({
      from: chatWith,
      direction: "incoming",
      unread: true,
    });

    const chatWithData = {
      waId: chatWith,
      profileName,
      unreadCount,
      phoneNumber: chatWith,
    };

    const messages = rawMessages.map((msg) => ({
      direction: msg.direction || "outgoing",
      message: msg.message || "",
      timestamp: msg.timestamp || null,
      status: msg.status || undefined,
      unread: msg.unread ?? false,
      to: msg.to,
      type: msg.type || "text",
      messageId: msg.messageId.toString(),
      context: msg.context || {},
    }));

    return NextResponse.json(
      {
        chatWith: chatWithData,
        messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to fetch chat messages:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
