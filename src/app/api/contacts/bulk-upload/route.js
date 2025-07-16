import dbConnect from "@/lib/dbConnect";
import { withAgent } from "@/lib/with-agent/withAgent";
import Contact from "@/Models/contact.model";
import { NextResponse } from "next/server";

const handler = async (req, agentMongoId) => {
  await dbConnect();

  const contacts = await req.json();

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json(
      { error: "No contact data provided." },
      { status: 400 }
    );
  }

  const ops = contacts
    .filter((c) => c.customerPhone)
    .map((c) => ({
      updateOne: {
        filter: { customerPhone: c.customerPhone },
        update: {
          $set: {
            name: c.name || "",
            email: c.email || "",
            tags: Array.isArray(c.tags) ? c.tags : [],
            location: c.location || {},
            assignedTo: c.assignedTo ?? undefined,
            extraData: c.extraData || {},
            createdBy: agentMongoId,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

  if (ops.length === 0) {
    return NextResponse.json(
      { error: "No valid contacts with phone numbers." },
      { status: 400 }
    );
  }

  const result = await Contact.bulkWrite(ops);

  return NextResponse.json(
    {
      message: "Bulk upload complete",
      insertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    },
    { status: 200 }
  );
};

export const POST = withAgent(handler);
