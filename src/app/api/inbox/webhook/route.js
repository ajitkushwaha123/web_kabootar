import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import messageModel from "@/models/message.model";
import axios from "axios";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      return new Response(challenge ?? "", { status: 200 });
    }

    return new Response("Verification failed", { status: 403 });
  } catch (err) {
    console.error("❌ Verification error:", err);
    return new Response("Error during verification", { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const contact = value?.contacts?.[0];
    const message = value?.messages?.[0];

    if (!message || !contact) {
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    const from = message.from;
    const to = value.metadata.display_phone_number;
    const waId = contact.wa_id;
    const profileName = contact.profile?.name ?? null;
    const type = message.type ?? "text";
    const timestamp = new Date(parseInt(message.timestamp) * 1000);

    let content = "";

    if (type === "image") {
      const imageId = message.image?.id;
      if (!imageId) {
        return NextResponse.json(
          { error: "Image ID missing in image message" },
          { status: 400 }
        );
      }

      console.log("📷 Received image ID:", imageId);

      try {
        const imageRes = await axios.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/inbox/webhook/image`,
          { imageId }
        );

        const cloudinaryUrl = imageRes?.data?.cloudinaryUrl;
        if (!cloudinaryUrl) throw new Error("Cloudinary upload failed");

        content = cloudinaryUrl;
      } catch (uploadErr) {
        console.error("❌ Image upload failed:", uploadErr.message);
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }
    } else if (type === "text") {
      content = message.text?.body ?? "";
    } else {
      content = `[Unsupported message type: ${type}]`;
    }

    const messageData = {
      messageId: message.id,
      timestamp,
      from,
      to,
      waId,
      profileName,
      type,
      message: content,
      direction: "incoming",
      phoneNumberId: value.metadata.phone_number_id,
      displayPhoneNumber: value.metadata.display_phone_number,
      chatWith: from,
    };

    const existing = await messageModel.findOne({ messageId: message.id });
    if (existing) {
      console.log("⚠️ Duplicate message ignored:", message.id);
      return NextResponse.json({ duplicate: true }, { status: 200 });
    }

    const savedMessage = await messageModel.create(messageData);
    console.log("📥 Message saved:", savedMessage.messageId);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/socket/emit`,
        {
          event: "event:broadcast",
          data: { type: "message", message: savedMessage },
        }
      );

      console.log("📡 Broadcasted message");
    } catch (err) {
      console.error("❌ Socket emit failed:", err.message);
    }

    const trigger =
      "Hi! Can you please tell me the documents needed for an FSSAI license?"
        .trim()
        .toLowerCase();

    const normalized = content.trim().toLowerCase();

    if (type === "text" && normalized === trigger) {
      console.log("🤖 Auto-reply triggered");

      const replies = [
        "Hi sir! Documents required are:\n1. Aadhar card\n2. PAN card\n3. Address with pincode\n4. Phone number\n5. Mail ID\n6. Passport size photo\n7. Shop name",
        "amount 700 , license in 24hrs with 1 year validity , No advance .",
      ];

      for (const msg of replies) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/inbox/send-message`,
            {
              to: from,
              type: "text",
              message: msg,
            }
          );
          console.log("📤 Sent auto-reply:", res.status);
        } catch (err) {
          console.error("❌ Failed to send auto-reply:", err.message);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
