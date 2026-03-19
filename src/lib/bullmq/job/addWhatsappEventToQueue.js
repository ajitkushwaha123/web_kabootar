import { whatsappEventQueue } from "../queue/whatsappEventQueue";

export const addWhatsappEventToQueue = async ({ payload, event }) => {
  console.log(`⏳ Queuing WhatsApp event: ${event}`);

  try {
    await whatsappEventQueue.add(
      "whatsappEvent", 
      { event, payload }, 
      {
        attempts: 5,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: { age: 3600, count: 500 },
        removeOnFail: false,
        lifo: false,
      }
    );

    console.log(`✅ WhatsApp event queued successfully → ${event}`);
  } catch (err) {
    console.error("❌ Failed to add WhatsApp event to queue:", err);
    throw err;
  }
};
