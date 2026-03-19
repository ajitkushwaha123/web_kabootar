import dbConnect from "@/lib/dbConnect";
import Lead from "@/models/Lead";
import Conversation from "@/models/Conversation";
import Contact from "@/models/Contact";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await dbConnect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    const { conversationId, title, description, source } = await req.json();

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return NextResponse.json(
        {
          message: "Conversation not found",
          success: false,
        },
        { status: 404 }
      );
    }

    const contact = await Contact.findById(conversation.contactId);
    if (!contact) {
      return NextResponse.json(
        {
          message: "Contact not found",
          success: false,
        },
        { status: 404 }
      );
    }

    const lead = await Lead.create({
      organizationId: contact.organizationId,
      contactId: contact._id,
      conversationId: conversation._id,
      title,
      description,
      source: source || "whatsapp",
      stage: "new",
      createdBy: userId,
    });

    conversation.leadId = lead._id;
    conversation.isLead = true;
    await conversation.save();

    contact.leadId = lead._id;
    await contact.save();

    return NextResponse.json(
      {
        success: true,
        lead,
        message: "Lead created successfully",
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error", error: err.message, success: false },
      { status: 500 }
    );
  }
};
