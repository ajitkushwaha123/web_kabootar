import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import messageModel from "@/models/message.model";

export async function POST(req) {
  try {
    const body = await req.json();
    const { chatWith, userId } = body;

    if (!chatWith || !userId) {
      return NextResponse.json(
        { error: "Both 'chatWith' and 'userId' are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await messageModel.updateMany(
      {
        chatWith,
        to: userId,
        unread: true,
      },
      {
        $set: { unread: false, readAt: new Date() },
      }
    );

    console.log("✅ Marked messages as read:", {
      chatWith,
      userId,
      modifiedCount: result.modifiedCount,
    });

    return NextResponse.json(
      {
        status: "✅ Messages marked as read",
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
