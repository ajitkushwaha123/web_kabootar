import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Knowledge from "@/models/Knowledge";
import { getAuthContext } from "@/lib/auth/getAuth";

/**
 * GET: Fetch all knowledge docs for the current organization.
 */
export async function GET(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const docs = await Knowledge.find({ organizationId: orgId }).sort({ priority: -1, createdAt: -1 });
    
    return NextResponse.json({ success: true, data: docs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Create/Add a new knowledge entry.
 */
export async function POST(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { category, question, answer, keywords, priority } = await req.json();

    if (!question || !answer) {
      return NextResponse.json({ error: "question and answer are required" }, { status: 400 });
    }

    await dbConnect();
    const doc = await Knowledge.create({
      organizationId: orgId,
      category: category || "general",
      question,
      answer,
      keywords: keywords || question.toLowerCase().split(/\s+/),
      priority: priority || 1,
    });

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH: Update an existing knowledge entry.
 */
export async function PATCH(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await dbConnect();
    const doc = await Knowledge.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      updates,
      { new: true }
    );

    if (!doc) return NextResponse.json({ error: "Doc not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove a knowledge entry.
 */
export async function DELETE(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await dbConnect();
    const deleted = await Knowledge.findOneAndDelete({ _id: id, organizationId: orgId });
    
    if (!deleted) return NextResponse.json({ error: "Doc not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
