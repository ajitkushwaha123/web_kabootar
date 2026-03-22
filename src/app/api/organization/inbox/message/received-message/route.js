import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/Contact";
import Conversation from "@/models/Conversation";
import Organization from "@/models/Organization";
import { NextResponse } from "next/server";
import { handleMessageByType } from "@/helper/webhook-payload/message-handler";
import { whatsappEventQueue } from "@/lib/bullmq/queue/whatsappEventQueue";

export const POST = async (req) => {
  console.log("🚀 [RECEIVED] API HIT");
  try {
    await dbConnect();

    const data = await req.json();
    const { contacts, metadata, messages } = data;

    const org = await Organization.findOne({
      phone_number_id: metadata?.phone_number_id,
    });

    if (!org) {
      console.error("❌ [RECEIVED] Organization not found for phone_number_id:", metadata?.phone_number_id);
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

    console.log("✅ Message saved:", message._id);

    // 🟢 NEW: Trigger Auto AI Reply if enabled (Direct Trigger)
    if (org.autoAiReply) {
      console.log("🤖 Triggering Auto-Reply API...");
      const baseUrl = process.env.NEXT_APP_BASE_URL || "http://localhost:3000";
      
      try {
        // Await the fetch to ensure it is sent before the response completes
        await fetch(`${baseUrl}/api/organization/inbox/message/auto-reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversation._id,
            organizationId: org.org_id,
          }),
        });
        console.log("✅ Auto-Reply API call finished");
      } catch (fetchErr) {
        console.error("❌ Failed to trigger Auto-Reply API:", fetchErr.message);
      }
    }

    return NextResponse.json(
      { message: "Webhook received success", success: true },
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
