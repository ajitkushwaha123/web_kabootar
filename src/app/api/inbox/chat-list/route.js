import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import messageModel from "@/Models/message.model";

export async function GET() {
  try {
    await dbConnect();

    const pipeline = [
      {
        $addFields: {
          chatWith: {
            $cond: [{ $eq: ["$direction", "incoming"] }, "$from", "$to"],
          },
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: "$chatWith",
          latestMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$direction", "incoming"] },
                    { $eq: ["$unread", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          "latestMessage.unreadCount": "$unreadCount",
          "latestMessage.chatWith": "$_id",
        },
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" },
      },
      {
        $sort: { timestamp: -1 },
      },
    ];

    const chats = await messageModel.aggregate(pipeline);

    return NextResponse.json(chats);
  } catch (err) {
    console.error("❌ Chat list error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
