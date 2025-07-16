
import dbConnect from "@/lib/dbConnect";
import { withAgent } from "@/lib/with-agent/withAgent";
import Contact from "@/Models/contact.model";
import { NextResponse } from "next/server";

const handler = async (req, agentMongoId) => {
  await dbConnect();

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await req.json();

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json(
      { error: "No contacts provided" },
      { status: 400 }
    );
  }

  const contacts = body.map((item) => ({
    customerPhone: item.customerPhone,
    name: item.name || "",
    email: item.email || "",
    tags: item.tags || [],
    location: item.location || {},
    assignedTo: agentMongoId,
    createdBy: agentMongoId,
    extraData: item.extraData || {},
  }));

  try {
    const result = await Contact.insertMany(contacts, { ordered: false });
    return NextResponse.json(
      { success: true, insertedCount: result.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk contact insert error:", error);
    return NextResponse.json(
      { error: "Some contacts failed to upload" },
      { status: 500 }
    );
  }
};

export const POST = withAgent(handler);
