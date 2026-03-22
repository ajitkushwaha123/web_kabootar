import 'dotenv/config';
import { Worker } from "bullmq";
import Redis from "ioredis";
import axios from "axios";

// ✅ Build-safe Redis connection logic 
const getRedisConnection = () => {
  if (typeof window !== "undefined") return null; // Client-side safety

  if (!process.env.REDIS_URL) {
    console.error("❌ Worker cannot start: REDIS_URL is missing in process.env");
    return null; // Return null during build or if missing
  }
  console.log("🔗 Connecting to Redis for Worker...");

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

async function handleEvent(job) {
  const { event, payload } = job.data;
  console.log(`🔄 [JOB:${job.id}] Routing event: ${event}`);

  // Determine Base URL (Prioritizing the exact environment variable provided by user)
  let baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_APP_BASE_URL || "http://localhost:3000").trim();
  
  // Ensure the URL starts with http:// or https:// to avoid Axios "Invalid URL" errors
  if (!baseUrl.startsWith("http")) {
    console.warn(`⚠️ Base URL "${baseUrl}" is invalid. Falling back to localhost.`);
    baseUrl = "http://localhost:3000";
  }

  const endpointMap = {
    "whatsapp-message": "/api/organization/inbox/message/received-message",
    "whatsapp-status-update": "/api/organization/inbox/message/update-status",
  };

  const endpoint = endpointMap[event];
  
  if (!endpoint) {
    console.warn(`⚠️ [JOB:${job.id}] Unknown event type: ${event}`);
    return { success: false, message: "Unknown event type", event };
  }

  const fullUrl = `${baseUrl}${endpoint}`;
  console.log(`🌐 [JOB:${job.id}] Calling API: ${fullUrl}`);

  try {
    const response = await axios.post(fullUrl, payload, {
      headers: { "Content-Type": "application/json" },
      // Increase timeout for webhook processing
      timeout: 30000, 
    });
    return response;
  } catch (error) {
    if (error.response) {
      // The server responded with a status outside of 2xx
      console.error(`❌ [JOB:${job.id}] API error (${error.response.status}):`, error.response.data);
      if (error.response.status === 404) {
        console.error(`🔍 Check if organization exists for phone_number_id in payload.`);
      }
    } else if (error.request) {
      // No response was received
      console.error(`❌ [JOB:${job.id}] No response from server. Check if ${baseUrl} is reachable.`);
    } else {
      console.error(`❌ [JOB:${job.id}] Request configuration error:`, error.message);
    }
    throw error; // Rethrow to let BullMQ handle retry
  }
}

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
  worker.on("completed", (job) => console.log(`✅ [JOB:${job.id}] Completed`));
  worker.on("failed", (job, err) => console.error(`❌ [JOB:${job.id}] Failed:`, err.message));
  console.log("🚀 WhatsApp Worker started successfully and is waiting for jobs...");
} else {
  console.error("❌ Worker instance was not created.");
}

console.log("💬 WhatsApp Worker module loaded (Build-safe)");

export default worker;
