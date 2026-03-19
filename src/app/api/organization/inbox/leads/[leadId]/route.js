import Lead from "@/models/Lead";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@clerk/nextjs/server";

export const GET = async (req, { params }) => {
  try {
    const { leadId } = await params;
    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const lead = await Lead.findOne({ _id: leadId, organizationId: orgId });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

export const PUT = async (req, { params }) => {
  try {
    const { leadId } = await params;
    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description } = await req.json();
    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await dbConnect();

    const updatedLead = await Lead.findOneAndUpdate(
      { _id: leadId, organizationId: orgId },
      { $set: { title, description } },
      { new: true }
    );

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
