import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Webhook } from "svix";
import { headers } from "next/headers";
import User from "@/Models/user.model";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";

export async function POST(req) {
  const payload = await req.text();
  const headerList = await headers();

  const svixHeaders = {
    "svix-id": headerList.get("svix-id") || "",
    "svix-timestamp": headerList.get("svix-timestamp") || "",
    "svix-signature": headerList.get("svix-signature") || "",
  };

  const webhook = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = webhook.verify(payload, svixHeaders);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;
  const user = evt.data;

  console.log("✅ Clerk Webhook Event Received:", {
    eventType,
    userId: user.id,
    email: user.email_addresses?.[0]?.email_address || "",
  });

  await dbConnect();

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const email = user.email_addresses?.[0]?.email_address || "";
      const phone = user.phone_numbers?.[0]?.phone_number || "";
      const username = user.username || `user_${user.id}`;

      const updatePayload = {
        email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        profileImageUrl: user.image_url,
        phoneNumber: phone,
        username,
      };

      const existingUser = await User.findOne({ clerkId: user.id });

      if (existingUser) {
        await User.updateOne({ userId: user.id }, updatePayload);
      } else {
        await User.create({
          ...updatePayload,
          userId: user.id,
          role: "user",
          isOnboarded: false,
          settings: {},
        });
      }
    }

    if (eventType === "user.deleted") {
      await User.deleteOne({ userId: user.id });
    }

    return NextResponse.json({ message: "Webhook received and processed" });
  } catch (error) {
    console.error("❌ Error handling webhook event:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
