import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import axios from "axios";
import { auth } from "@clerk/nextjs/server";
import messageModel from "@/Models/message.model";
import { buildPayload } from "@/utils/buildPayload";

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
    const { to, type, message, context } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Missing 'to' parameter in request body." },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: "Missing 'type' parameter in request body." },
        { status: 400 }
      );
    }

    const PHONE_ID = process.env.META_WA_PHONE_NUMBER_ID;

    const metaUrl = `${process.env.META_WA_API_URL}/${process.env.META_WA_PHONE_NUMBER_ID}/messages`;

    const payload = buildPayload({ to, type, message, context });

    const waResponse = await axios.post(metaUrl, payload, {
      headers: {
        Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const responseData = waResponse.data;
    const confirmedMessageId = responseData?.messages?.[0]?.id;
    const tempMessageId = `local-${Date.now()}`;
    const messageId = confirmedMessageId || tempMessageId;
    const from = PHONE_ID || "unknown";
    const text = message?.text || "";

    const tempMessage = {
      messageId,
      from,
      to,
      type,
      direction: "outgoing",
      timestamp: new Date(),
      phoneNumberId: from,
      displayPhoneNumber: from,
      chatWith: to,
      clerkId: userId,
      context: context || {},
    };

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

    console.log("✅ Message saved to database:", savedMessage);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("🚨 Error sending WhatsApp message:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Unknown error occurred.",
      },
      { status: 500 }
    );
  }
}
