import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import axios from "axios";

export const POST = async (req) => {
  try {
    const { userId, orgId } = await auth();

    if (!orgId) {
      return NextResponse.json(
        { message: "Organization not found", success: false },
        { status: 404 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const messageData = await req.json();
    const {
      conversationId,
      senderType = "agent",
      status = "pending",
      direction = "outgoing",
      messageType,
      text,
      image,
      video,
      reaction,
      metadata = {},
    } = messageData;

    if (!messageType) {
      return NextResponse.json(
        { message: "Message type is required", success: false },
        { status: 400 }
      );
    }

    console.log("messageType", messageData);

    const messageContent = {};
    switch (messageType) {
      case "text":
        if (!text) throw new Error("Text content is required");
        messageContent.text = text;
        break;
      case "image":
        if (!image) throw new Error("Image content is required");
        messageContent.image = image;
        break;
      case "video":
        if (!video) throw new Error("Video content is required");
        messageContent.video = video;
        break;
      case "reaction":
        if (!reaction) throw new Error("Reaction content is required");
        messageContent.reaction = reaction;
        break;
      default:
        throw new Error("Unsupported message type");
    }

    await dbConnect();

    // Save message locally first
    const newMessage = await Message.create({
      conversationId,
      senderId: userId,
      organizationId: orgId,
      senderType,
      status,
      direction,
      messageType,
      ...messageContent,
      metadata,
      timestamp: new Date(),
    });

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: 918178739633, // replace with dynamic number if needed
      type: messageType,
      [messageType]: messageContent[messageType],
    };

    try {
      const waRes = await axios.post(
        `${process.env.META_BASE_API_URL}/${process.env.META_PHONE_NUMBER_ID}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("WhatsApp API response:", waRes.data);

      if (waRes.data?.messages?.length > 0) {
        newMessage.status = "sent";
        newMessage.whatsappMessageId = waRes.data.messages[0].id || null;
        await newMessage.save();

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessageId: newMessage._id,
          lastMessageAt: newMessage.timestamp,
        });
      }
    } catch (waErr) {
      console.error("WhatsApp API error:", waErr.message);
      // Optionally mark message as 'failed' or leave as 'pending'
      newMessage.status = "failed";
      await newMessage.save();
    }

    return NextResponse.json(
      {
        message: "Message processed successfully",
        data: newMessage,
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Message send error:", err.message);

    return NextResponse.json(
      { message: err.message || "Failed to send message", success: false },
      { status: 500 }
    );
  }
};
