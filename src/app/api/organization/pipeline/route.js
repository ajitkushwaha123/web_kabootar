import dbConnect from "@/lib/dbConnect";
import Lead from "@/models/Lead";
import Contact from "@/models/Contact";
import Conversation from "@/models/Conversation";
import { getAuthContext } from "@/lib/auth/getAuth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ message: "Organization ID missing" }, { status: 400 });

    await dbConnect();

    const leads = await Lead.find({ organizationId: orgId, status: "active" })
      .populate("contactId", "primaryName primaryPhone")
      .populate("conversationId", "tags")
      .sort({ updatedAt: -1 })
      .lean();

    // Grouping leads by stage for the pipeline
    const pipeline = {
      new: [],
      contacted: [],
      interested: [],
      done: [],
      other: []
    };

    leads.forEach(lead => {
      const stage = lead.stage;
      const data = {
         _id: lead._id,
         conversationId: lead.conversationId?._id || lead.conversationId,
         name: lead.contactId?.primaryName || lead.title || "Unknown Customer",
         phone: lead.contactId?.primaryPhone || "No Phone",
         value: lead.value || 0,
         tags: lead.conversationId?.tags || [],
         updatedAt: lead.updatedAt
      };

      if (pipeline[stage]) {
        pipeline[stage].push(data);
      } else {
        pipeline.other.push(data);
      }
    });

    return NextResponse.json({ success: true, pipeline });
  } catch (error) {
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ message: "Organization ID missing" }, { status: 400 });

    const { leadId, stage } = await req.json();
    if (!leadId || !stage) return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });

    await dbConnect();

    const updatedLead = await Lead.findOneAndUpdate(
      { _id: leadId, organizationId: orgId },
      { stage, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedLead) return NextResponse.json({ message: "Lead not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Lead stage updated" });
  } catch (error) {
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
