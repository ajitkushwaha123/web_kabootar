import { Queue } from "bullmq";
import Redis from "ioredis";

// ✅ Build-safe Redis connection logic
const getRedisConnection = () => {
  if (typeof window !== "undefined") return null; // Client-side safety
  
  if (!process.env.REDIS_URL) {
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
       console.error("❌ REDIS_URL is missing in production environment!");
    }
    return null; // Return null during build or if missing
  }

  return new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
};

const connection = getRedisConnection();

// ✅ Export queue with handle for absent connection during build
export const whatsappEventQueue = connection 
  ? new Queue("whatsappEventQueue", { connection }) 
  : null;
