import { getAuthContext } from "@/lib/auth/getAuth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/Contact";
import Conversation from "@/models/Conversation";

export const POST = async (req) => {
  try {
    const { userId, orgId } = await getAuthContext();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ message: "Organization not found", success: false }, { status: 404 });
    }

    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ message: "Phone number is required", success: false }, { status: 400 });
    }

    // Clean phone number (remove spaces, plus, etc.)
    const cleanPhone = phoneNumber.replace(/[^\d]/g, "");

    await dbConnect();

    // 1. Find or Create Contact
    let contact = await Contact.findOne({
      primaryPhone: cleanPhone,
      organizationId: orgId,
    });

    if (!contact) {
      contact = await Contact.create({
        organizationId: orgId,
        primaryPhone: cleanPhone,
        primaryName: cleanPhone, // Default to phone number
        source: "manual_contacted",
        name: { formatted_name: cleanPhone },
        phone: [{ phone: cleanPhone, wa_id: cleanPhone, type: "whatsapp" }],
        wa_id: cleanPhone,
      });
    }

    // 2. Find or Create Conversation
    let conversation = await Conversation.findOne({
      contactId: contact._id,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        contactId: contact._id,
        organizationId: orgId,
        participants: [cleanPhone],
        status: "open",
        unreadCount: 0,
        lastMessageAt: new Date(),
      });
    }

    return NextResponse.json({
      message: "Conversation ready",
      conversationId: conversation._id,
      success: true,
    });
  } catch (err) {
    console.error("Error creating new chat:", err);
    return NextResponse.json({ message: err.message || "Internal server error", success: false }, { status: 500 });
  }
};
