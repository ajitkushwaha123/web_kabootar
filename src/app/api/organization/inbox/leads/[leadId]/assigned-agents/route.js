import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Lead from "@/models/Lead";
import Assignment from "@/models/Assignment";
import { getAuthContext } from "@/lib/auth/getAuth";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { leadId } = await params;
    const { orgId } = await getAuthContext();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lead = await Lead.findOne({ _id: leadId, organizationId: orgId });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const activeAssignments = await Assignment.find({
      organizationId: orgId,
      leadId,
    }).lean();

    console.log("Active Assignments:", activeAssignments);

    return NextResponse.json({
      success: true,
      assignedAgents: activeAssignments,
    });
  } catch (error) {
    console.error("Fetch assigned agents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
