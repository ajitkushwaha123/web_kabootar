import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import messageModel from "@/models/message.model";
import axios from "axios";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    await dbConnect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { to, type = "reaction", message_id, emoji, context } = body;

    if (!to || !message_id || !emoji || type !== "reaction") {
      return NextResponse.json(
        {
          error:
            "Missing required fields. 'to', 'message_id', and 'emoji' are required for a reaction.",
        },
        { status: 400 }
      );
    }

    const META_BASE_URL = process.env.META_WA_API_URL;
    const PHONE_ID = process.env.META_WA_PHONE_NUMBER_ID;
    const TOKEN = process.env.META_WA_TOKEN;

    const metaUrl = `${META_BASE_URL}/${PHONE_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "reaction",
      reaction: { message_id, emoji },
      ...(context ? { context } : {}),
    };

    console.log("📤 Sending WhatsApp reaction:", payload);

    const waResponse = await axios.post(metaUrl, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const responseData = waResponse.data;
    const confirmedMessageId = responseData?.messages?.[0]?.id;
    const tempMessageId = `local-${Date.now()}`;
    const messageId = confirmedMessageId || tempMessageId;
    const from = PHONE_ID || "unknown";

    const tempMessage = {
      messageId,
      from,
      to,
      type: "reaction",
      message: emoji,
      direction: "outgoing",
      timestamp: new Date(),
      phoneNumberId: from,
      displayPhoneNumber: from,
      profileName: null,
      chatWith: to,
      clerkId: userId,
      context: context || {},
    };

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/socket/emit`,
        {
          event: "event:broadcast",
          data: { type: "message", message: tempMessage },
        }
      );
      console.log("📡 Reaction message broadcasted via socket");
    } catch (emitErr) {
      console.error("❌ Socket emit failed:", emitErr.message);
    }

    const latestIncoming = await messageModel
      .findOne({
        from: to,
        direction: "incoming",
        profileName: { $exists: true },
      })
      .sort({ timestamp: -1 });

    const savedMessage = await messageModel.create({
      ...tempMessage,
      profileName: latestIncoming?.profileName || null,
    });

    console.log("✅ Reaction message saved:", savedMessage.toJSON());

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("🚨 Error sending WhatsApp reaction:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Unknown error occurred.",
      },
      { status: 500 }
    );
  }
}
