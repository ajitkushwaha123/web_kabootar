import Message from "@/models/Message";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const statuses = body?.statuses;

    if (!Array.isArray(statuses) || !statuses.length) {
      return NextResponse.json(
        { success: false, message: "No statuses found in payload" },
        { status: 400 }
      );
    }

    console.log("Processing status update:", statuses[0]);

    const {
      id: msgId,
      status,
      conversation,
      timestamp,
      recipient_id,
      pricing,
    } = statuses[0];

    if (!msgId) {
      return NextResponse.json(
        { success: false, message: "Missing message ID" },
        { status: 400 }
      );
    }

    const message = await Message.findOne({ whatsappMessageId: msgId }).select(
      "_id status"
    );

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    message.status = status;
    await message.save();

    console.log(
      `🔄 Message status updated:
      - ID: ${msgId}
      - Status: ${status}
      - Conversation: ${conversation?.id || "N/A"}
      - Recipient: ${recipient_id || "N/A"}
      - Time: ${new Date(Number(timestamp) * 1000).toISOString()}
      - Pricing: ${JSON.stringify(pricing, null, 2)}`
    );

    return NextResponse.json(
      { success: true, message: "Message status updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error updating message status:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
};
