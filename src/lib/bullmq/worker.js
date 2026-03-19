import { Worker } from "bullmq";
import Redis from "ioredis";
import axios from "axios";

// ✅ Build-safe Redis connection logic 
const getRedisConnection = () => {
    if (typeof window !== "undefined") return null; // Client-side safety
    
    if (!process.env.REDIS_URL || process.env.NEXT_PHASE === "phase-production-build") {
      return null; // Return null during build or if missing
    }
  
    return new Redis(process.env.REDIS_URL, {
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
  };

const connection = getRedisConnection();

// ✅ Event routing handler (No changes here)
async function handleEvent(job) {
  const { event, payload } = job.data;
  console.log(`🔄 Routing event: ${event} for JOB:${payload}`);

  switch (event) {
    case "whatsapp-message":
      return await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/organization/inbox/message/received-message`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
    case "whatsapp-status-update":
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

// ✅ Worker setup (Only if connection is present)
export const worker = connection ? new Worker(
  "whatsappEventQueue",
  async (job) => {
    try {
      const response = await handleEvent(job);
      if (!response || response.status < 200 || response.status >= 300) {
        throw new Error(`Unexpected response ${response?.status}`);
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },
  {
    connection,
    concurrency: 5,
    lockDuration: 120000,
  }
) : null;

if (worker) {
    worker.on("active", (job) => console.log(`🟢 [JOB:${job.id}] Started (${job.data.event})`));
}

console.log("💬 WhatsApp Worker module loaded (Build-safe)");

export default worker;
