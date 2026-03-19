import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Lead from "@/models/Lead";
import Assignment from "@/models/Assignment";
import { auth } from "@clerk/nextjs/server";

export const POST = async (req, { params }) => {
  try {
    await dbConnect();
    const { leadId } = await params;
    const { agentId } = await req.json();
    const { orgId, userId } = await auth();

    if (!orgId || !userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!leadId || !agentId)
      return NextResponse.json(
        { error: "Lead ID and Agent ID are required" },
        { status: 400 }
      );

    const lead = await Lead.findOne({ _id: leadId, organizationId: orgId });
    if (!lead)
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const existing = await Assignment.findOne({
      organizationId: orgId,
      leadId,
      agentId,
    });

    let assignedAgents;
    if (existing) {
      assignedAgents = await Assignment.find({ organizationId: orgId, leadId });
      return NextResponse.json({
        success: true,
        message: "Agent already assigned",
        assigned: assignedAgents,
      });
    } else {
      await Assignment.create({
        organizationId: orgId,
        leadId,
        agentId,
        conversationId: lead.conversationId || null,
        assignedAt: new Date(),
      });

      assignedAgents = await Assignment.find({ organizationId: orgId, leadId });
      return NextResponse.json({
        success: true,
        message: "Agent assigned successfully",
        assigned: assignedAgents,
      });
    }
  } catch (err) {
    console.error("Error assigning agent:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};

export const DELETE = async (req, { params }) => {
  try {
    await dbConnect();
    const { leadId } = await params;
    const { agentId } = await req.json();
    const { orgId, userId } = await auth();

    if (!orgId || !userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!leadId || !agentId)
      return NextResponse.json(
        { error: "Lead ID and Agent ID are required" },
        { status: 400 }
      );

    const assignment = await Assignment.findOneAndDelete({
      organizationId: orgId,
      leadId,
      agentId,
    });

    if (!assignment)
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );

    const assignedAgents = await Assignment.find({
      organizationId: orgId,
      leadId,
    });

    return NextResponse.json({
      success: true,
      message: "Agent unassigned successfully",
      assigned: assignedAgents,
    });
  } catch (err) {
    console.error("Error deleting assignment:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};
