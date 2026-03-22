import Message from "@/models/Message";
import Contact from "@/models/Contact";
import { getMediaUrl } from "./image-helper";

export const handleMessageByType = async ({
  org,
  contact,
  conversation,
  messagePayload,
}) => {
  const {
    id: msgId,
    type,
    text,
    image,
    video,
    audio,
    document,
    sticker,
    reaction,
    location,
    referral,
    timestamp,
    context,
    errors,
    contacts,
  } = messagePayload;

  let repliedMessage = null;
  if (context?.id || type === "reaction") {
    repliedMessage = await Message.findOne({
      whatsappMessageId: context?.id || reaction?.message_id,
      organizationId: org.org_id,
    }).select("_id");
  }

  const base = {
    conversationId: conversation._id,
    senderId: contact.primaryPhone,
    senderType: "user",
    organizationId: org.org_id,
    direction: "incoming",
    status: type === "unsupported" ? "failed" : "received",
    messageType: type,
    timestamp: new Date(parseInt(timestamp) * 1000),
    whatsappMessageId: msgId,
    metadata: {
      ...(referral ? { referral } : {}),
    },
    context: repliedMessage?._id || null,
  };

  let messageData = {};

  switch (type) {
    case "text":
      messageData.text = { preview_url: text?.preview_url, body: text?.body };
      break;

    case "image":
      messageData.image = {
        id: image?.id,
        caption: image?.caption,
        mime_type: image?.mime_type,
        sha256: image?.sha256,
        link: await getMediaUrl(image?.id, image?.mime_type, "images"),
      };
      break;

    case "video":
      messageData.video = {
        id: video?.id,
        caption: video?.caption,
        mime_type: video?.mime_type,
        sha256: video?.sha256,
        link: await getMediaUrl(video?.id, video?.mime_type, "videos"),
      };
      break;

    case "audio":
      messageData.audio = {
        id: audio?.id,
        mime_type: audio?.mime_type,
        sha256: audio?.sha256,
        link: await getMediaUrl(audio?.id, audio?.mime_type, "audio"),
      };
      break;

    case "document":
      messageData.document = {
        id: document?.id,
        filename: document?.filename,
        mime_type: document?.mime_type,
        sha256: document?.sha256,
        link: await getMediaUrl(document?.id, document?.mime_type, "documents"),
      };
      break;

    case "sticker":
      messageData.sticker = {
        id: sticker?.id,
        mime_type: sticker?.mime_type,
        sha256: sticker?.sha256,
        link: await getMediaUrl(sticker?.id, sticker?.mime_type, "stickers"),
      };
      break;

    case "reaction":
      messageData.reaction = {
        message_id: reaction?.message_id,
        emoji: reaction?.emoji,
      };
      break;

    case "location":
      messageData.location = {
        latitude: location?.latitude,
        longitude: location?.longitude,
        name: location?.name || null,
        address: location?.address || null,
      };
      break;

    // 🧾 CONTACTS TYPE HANDLING
    case "contacts": {
      const sharedContacts = Array.isArray(contacts) ? contacts : [];

      console.log("📇 Shared contacts received:", sharedContacts.length);

      let savedContactIds = [];

      for (const contact of sharedContacts) {
        const { name, phones } = contact;
        const primaryPhone = phones?.[0]?.phone?.replace(/\s+/g, "") || null;

        if (!primaryPhone) {
          console.log("⚠️ Skipping contact with no phone number:", contact);
          continue;
        }

        // ✅ 1️⃣ Check if this contact already exists for the org
        let existing = await Contact.findOne({
          primaryPhone,
          organizationId: org.org_id,
        });

        if (existing) {
          console.log("ℹ️ Contact already exists:", existing.primaryPhone);
          continue; // skip creating duplicate
        }

        // ✅ 2️⃣ Create new contact if not found
        const newContact = await Contact.create({
          organizationId: org.org_id,
          primaryName: name?.formatted_name || "Unnamed",
          primaryPhone,
          source: "whatsapp_contact_shared",
          name: {
            formatted_name: name?.formatted_name,
            first_name: name?.first_name,
            last_name: name?.last_name,
          },
          phone: (phones || []).map((p) => ({
            phone: p.phone?.replace(/\s+/g, ""),
            wa_id: p.wa_id || null,
            type: "whatsapp",
          })),
        });

        console.log("✅ New shared contact saved:", newContact.primaryPhone);
        savedContactIds.push(newContact._id);
      }

      messageData.contacts = savedContactIds;
      break;
    }

    case "unsupported":
      console.warn("⚠️ Unsupported message received:", errors?.[0]);
      messageData.unsupported = {
        code: errors?.[0]?.code || null,
        title: errors?.[0]?.title || "Unknown",
        message: errors?.[0]?.message || "Unsupported message type",
        details: errors?.[0]?.error_data?.details || "",
      };
      break;

    default:
      console.log("⚠️ Unhandled message type:", type);
      break;
  }

  const message = await Message.create({ ...base, ...messageData });
  console.log(`✅ Message (${type}) saved → ${message._id}`);

  return message;
};
