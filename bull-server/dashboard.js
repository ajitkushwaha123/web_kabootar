import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { whatsappEventQueue } from "../src/lib/bullmq/queue/whatsappEventQueue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(whatsappEventQueue)],
  serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

app.listen(3002, () => {
  console.log(
    "📊 Bull Board dashboard running at http://localhost:3002/admin/queues"
  );
});
