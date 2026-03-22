import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/Contact";
import Conversation from "@/models/Conversation";
import Organization from "@/models/Organization";
import { NextResponse } from "next/server";
import { handleMessageByType } from "@/helper/webhook-payload/message-handler";

export const POST = async (req) => {
  try {
    await dbConnect();

    const data = await req.json();
    const { contacts, metadata, messages } = data;

    const org = await Organization.findOne({
      phone_number_id: metadata?.phone_number_id,
    });

    if (!org) {
      return NextResponse.json(
        { message: "Organization not found", success: false },
        { status: 404 }
      );
    }

    const { wa_id, profile } = contacts?.[0] || {};
    const messagePayload = messages?.[0] || {};

    if (!wa_id || !messagePayload.id) {
      return NextResponse.json(
        { message: "Invalid message payload", success: false },
        { status: 400 }
      );
    }

    const senderContact = await Contact.findOneAndUpdate(
      { primaryPhone: wa_id, organizationId: org.org_id },
      {
        $setOnInsert: {
          primaryName: profile?.name || "",
          organizationId: org.org_id,
          source: messagePayload.referral
            ? "whatsapp_ad"
            : "direct_message_received",
          name: { formatted_name: profile?.name || "" },
          phone: [{ phone: wa_id, wa_id: wa_id, type: "whatsapp" }],
          wa_id: wa_id,
        },
      },
      { new: true, upsert: true }
    );

    const conversation = await Conversation.findOneAndUpdate(
      {
        contactId: senderContact._id,
        organizationId: org.org_id,
        isDeleted: false,
      },
      {
        $setOnInsert: {
          participants: [wa_id],
          status: "open",
          unreadCount: 0,
          lastMessageAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    const message = await handleMessageByType({
      org,
      contact: senderContact,
      conversation,
      messagePayload,
    });

    await Conversation.findByIdAndUpdate(
      conversation._id,
      {
        lastMessageId: message._id,
        lastMessageAt: new Date(),
        $inc: { unreadCount: 1 },
      },
      { new: true }
    );

    return NextResponse.json(
      { message: "Message processed successfully", success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error processing webhook:", err);
    return NextResponse.json(
      { message: err.message || "Internal Server Error", success: false },
      { status: 500 }
    );
  }
};
