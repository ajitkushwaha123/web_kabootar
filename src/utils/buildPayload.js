export const hasUrl = (str = "") =>
  /\bhttps?:\/\/[^\s/$.?#].[^\s]*\b/i.test(str);

export const buildPayload = ({ to, type, message, context }) => {
  console.log("Building payload for type:", type);
  const base = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type,
    ...(context ? { context } : {}),
  };

  switch (type) {
    case "text":
      return {
        ...base,
        text: { preview_url: hasUrl(message?.text), body: message?.text },
      };

    case "image":
      return {
        ...base,
        image: { link: message },
      };

    case "document":
      return {
        ...base,
        document: {
          link: message,
          filename: "document.pdf",
        },
      };

    case "audio":
      return {
        ...base,
        audio: { link: message },
      };

    case "video":
      return {
        ...base,
        video: { link: message },
      };

    case "sticker":
      return {
        ...base,
        sticker: { link: message },
      };

    case "location":
      return {
        ...base,
        location: {
          latitude: message.lat,
          longitude: message.lng,
          name: message.name || "",
          address: message.address || "",
        },
      };

    case "contact":
      return {
        ...base,
        contacts: [
          {
            name: {
              first_name: message.firstName,
              last_name: message.lastName || "",
            },
            phones: [
              {
                phone: message.phone,
                type: "CELL",
              },
            ],
          },
        ],
      };

    case "template":
      return {
        ...base,
        template: message,
      };

    case "reaction":
      return {
        ...base,
        reaction: {
          emoji: message.emoji,
          message_id: message.message_id,
        },
      };

    default:
      throw new Error(`Unsupported message type: ${type}`);
  }
};
