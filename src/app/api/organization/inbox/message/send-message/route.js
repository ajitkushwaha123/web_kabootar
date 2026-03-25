import { getAuthContext } from "@/lib/auth/getAuth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import axios from "axios";

export const POST = async (req) => {
  try {
    const { userId, orgId, org } = await getAuthContext();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    if (!orgId || !org) {
      return NextResponse.json(
        { message: "Organization not found", success: false },
        { status: 404 }
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
      case "template":
        if (!metadata.templateName) throw new Error("Template name is required for template message");
        messageContent.template = { 
          name: metadata.templateName, 
          language: { code: metadata.language || "en" },
          components: metadata.components || [] 
        };
        break;
      default:
        throw new Error("Unsupported message type");
    }

    await dbConnect();

    // 1. Get Conversation and Contact to find recipient phone number
    const conversation = await Conversation.findById(conversationId).populate("contactId");
    if (!conversation || !conversation.contactId) {
      return NextResponse.json(
        { message: "Conversation or Contact not found", success: false },
        { status: 404 }
      );
    }

    const recipientPhone = conversation.contactId.primaryPhone;

    // 🕒 24-Hour Session Window Check 🚀
    const lastCustomerMsg = conversation.lastCustomerMessageAt || conversation.updatedAt || new Date();
    const isWithin24Hours = (new Date() - new Date(lastCustomerMsg)) <= 24 * 60 * 60 * 1000;

    if (!isWithin24Hours && !metadata.isTemplate) {
      console.warn(`⚠️ [WHATSAPP-WINDOW] Session expired for ${recipientPhone}. Last customer message was at: ${lastCustomerMsg}`);
      return NextResponse.json(
        { 
          message: "WhatsApp 24h session window expired. Please send a Template message to re-engage the customer.", 
          success: false,
          windowExpired: true 
        },
        { status: 403 }
      );
    }

    // 2. Save message locally first
    const newMessage = await Message.create({
      conversationId,
      senderId: userId,
      organizationId: orgId,
      senderType,
      status: "pending",
      direction: "outgoing",
      messageType,
      ...messageContent,
      metadata,
      timestamp: new Date(),
    });

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: messageType,
      [messageType]: messageContent[messageType],
    };

    const phoneId = (org.phone_number_id || process.env.META_WA_PHONE_NUMBER_ID || "").trim();
    const baseUrl = (process.env.META_WA_API_URL || "https://graph.facebook.com/v21.0").trim();

    if (!phoneId) {
      console.error("❌ WhatsApp Error: phone_number_id is missing");
      newMessage.status = "failed";
      await newMessage.save();
      return NextResponse.json({ message: "WhatsApp Phone ID is missing for this organization", success: false }, { status: 400 });
    }

    const fullUrl = `${baseUrl}/${phoneId}/messages`;
    console.log("🚀 Sending WhatsApp Message to:", recipientPhone, "URL:", fullUrl);

    const token = (org.access_token || process.env.META_WA_TOKEN || "").trim();

    try {
      const waRes = await axios.post(
        fullUrl,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ WhatsApp API response:", waRes.data);

      if (waRes.data?.messages?.length > 0) {
        newMessage.status = "sent";
        newMessage.whatsappMessageId = waRes.data.messages[0].id || null;
        await newMessage.save();

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessageId: newMessage._id,
          lastMessageAt: newMessage.timestamp,
        });

        // 💰 Log Cost for Platform Tracker (Zomato-style) 🚀
        try {
          const { default: CostRecord } = await import("@/models/CostRecord");
          const msgCost = messageType === "template" ? 1.1 : 0; // ₹1.1 avg for template
          await CostRecord.create({
            organizationId: orgId,
            conversationId,
            type: messageType === "template" ? "template" : "agent_message",
            messageType,
            cost: msgCost,
            metadata: { waId: waRes.data.messages[0].id }
          });
          console.log(`💰 [COST-TRACK] ₹${msgCost} logged for ${messageType}`);
        } catch (costErr) {
          console.error("❌ Failed to log cost:", costErr.message);
        }

        // 🧠 Layer: AI Auto-Learning from Agent (Only if enabled)
        if (text && senderType === "agent" && org.autoLearn !== false) {
           (async () => {
             try {
                const { learnFromAgent } = await import("@/lib/ai-brain/ragSystem");
                // Find previous incoming message to pair with this answer
                const incomingMsg = await Message.findOne({ 
                  conversationId, 
                  direction: "incoming",
                  messageType: "text" 
                }).sort({ createdAt: -1 });

                if (incomingMsg?.text?.body) {
                   await learnFromAgent(incomingMsg.text.body, text, orgId);
                }
             } catch (learnErr) {
                console.error("Auto-Learn Error:", learnErr.message);
             }
           })();
        }
      }
    } catch (waErr) {
      console.error("❌ WhatsApp API error:", waErr.response?.data || waErr.message);
      newMessage.status = "failed";
      newMessage.metadata = { ...newMessage.metadata, error: waErr.message };
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
