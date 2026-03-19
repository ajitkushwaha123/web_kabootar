import { Worker } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// ✅ Basic sanity checks
if (!process.env.MONGODB_URI) throw new Error("❌ Missing MONGODB_URI in .env");
if (!process.env.REDIS_URL) throw new Error("❌ Missing REDIS_URL in .env");
if (!process.env.NEXT_PUBLIC_BASE_URL)
  throw new Error("❌ Missing NEXT_PUBLIC_BASE_URL in .env");

// ✅ Stable Redis connection
const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  reconnectOnError: (err) => {
    const targetErrors = ["READONLY", "ECONNRESET"];
    if (targetErrors.some((e) => err.message.includes(e))) {
      console.warn("🔄 Redis reconnecting after transient error:", err.message);
      return true;
    }
    return false;
  },
});

// ✅ Event routing handler
async function handleEvent(job) {
  const { event, payload } = job.data;

  console.log(`🔄 Routing event: ${event} for JOB:${payload}`);

  switch (event) {
    case "whatsapp-message":
      console.log(`💬 Handling WhatsApp message event for JOB:${job.id}`);
      return await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/organization/inbox/message/received-message`,
        payload,
        {
           headers: { "Content-Type": "application/json" } 
      }
      );

    case "whatsapp-status-update":
      console.log(`📡 Handling WhatsApp status update for JOB:${job.id}`);
      return await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/organization/inbox/message/update-status`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

    default:
      console.warn(`⚠️ [JOB:${job.id}] Unknown event type: ${event}`);
      return { success: false, message: "Unknown event type", event };
  }
}

// ✅ Worker setup
const worker = new Worker(
  "whatsappEventQueue",
  async (job) => {
    console.log(`🚀 [JOB:${job.id}] Received event: ${job.data}`);
    console.log("Payload:", job.data.messages);

    try {
      const response = await handleEvent(job);

      // ✅ Validate response
      if (!response || response.status < 200 || response.status >= 300) {
        throw new Error(`Unexpected response ${response?.status}`);
      }

      console.log(`✅ [JOB:${job.id}] Processed successfully`);
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data || err.message || "Unknown error";
      console.error(`❌ [JOB:${job.id}] Failed → ${errMsg}`);

      // Optional retry logic for network issues
      if (["ECONNRESET", "ETIMEDOUT"].includes(err.code)) {
        console.warn("⚠️ Network error — requeuing job for retry...");
        throw new Error("Temporary network failure — retrying...");
      }

      throw err;
    }
  },
  {
    connection,
    concurrency: 5,
    lockDuration: 120000,
    lockRenewTime: 20000,
    stalledInterval: 30000,
    maxStalledCount: 3,
    removeOnComplete: { age: 3600, count: 500 },
  }
);

// ✅ Event listeners for observability
worker.on("active", (job) =>
  console.log(`🟢 [JOB:${job.id}] Started (${job.data.event})`)
);
worker.on("completed", (job, result) =>
  console.log(`✅ [JOB:${job.id}] Completed →`, result?.message || "done")
);
worker.on("failed", (job, err) =>
  console.error(`❌ [JOB:${job?.id}] Failed: ${err.message}`)
);
worker.on("stalled", (jobId) =>
  console.warn(`⚠️ [JOB:${jobId}] Stalled! Possibly took too long.`)
);

// ✅ Graceful shutdown
const shutdown = async () => {
  console.log("🛑 Gracefully shutting down WhatsApp worker...");
  await worker.close();
  await connection.quit();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log(
  "💬 WhatsApp Worker ready → listening on queue: whatsappEventQueue"
);

export default worker;
