import { addWhatsappEventToQueue } from "@/lib/bullmq/job/addWhatsappEventToQueue";
import crypto from "crypto";
import { NextResponse } from "next/server";

/**
 * ✅ Verify Meta Webhook Setup (GET)
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * 🔐 Verify incoming webhook signature
 */
function verifySignature(rawBody, signature) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signature) return false;

  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(rawBody, "utf8");
  const expectedSignature = "sha256=" + hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

/**
 * ✅ Handle Webhook Events (POST)
 */
export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  // ⚠️ Verify webhook signature for authenticity
  if (!verifySignature(rawBody, signature)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (body.object === "whatsapp_business_account") {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;

    if (changes) {
      console.log("📥 WhatsApp Webhook Event Received:", changes);

      if (Array.isArray(changes.statuses) && changes.statuses.length > 0) {
        console.log("Received statuses:", changes.statuses);
        await addWhatsappEventToQueue({
          payload: changes,
          event: "whatsapp-status-update",
        });
      }

      if (Array.isArray(changes.messages) && changes.messages.length > 0) {
        console.log("Received messages:", changes.messages);
        await addWhatsappEventToQueue({
          payload: changes,
          event: "whatsapp-message",
        });
      }

      changes.messages?.forEach((msg) =>
        console.log("📩 Incoming message:", msg)
      );

      changes.statuses?.forEach((status) =>
        console.log("📡 Status update:", status)
      );
    }
  }

  return NextResponse.json({ success: true });
}
