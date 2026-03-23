import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UnmatchedMessage from "@/models/UnmatchedMessage";
import { getAuthContext } from "@/lib/auth/getAuth";

/**
 * GET: Fetch all unmatched messages for the current organization.
 */
export async function GET(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const docs = await UnmatchedMessage.find({ organizationId: orgId, resolved: false })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return NextResponse.json({ success: true, data: docs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH: Mark an unmatched message as resolved or deleted.
 */
export async function PATCH(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, resolved } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await dbConnect();
    const doc = await UnmatchedMessage.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      { resolved: resolved ?? true },
      { new: true }
    );

    if (!doc) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove an unmatched message.
 */
export async function DELETE(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await dbConnect();
    const deleted = await UnmatchedMessage.findOneAndDelete({ _id: id, organizationId: orgId });
    
    if (!deleted) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
