import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BotRule from "@/models/BotRule";
import { getAuthContext } from "@/lib/auth/getAuth";

/**
 * PATCH: Update an existing bot rule.
 */
export async function PATCH(req, { params }) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const updates = await req.json();

    if (updates.keywords) {
      updates.keywords = updates.keywords.map(kw => kw.trim().toLowerCase());
    }

    await dbConnect();
    const rule = await BotRule.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      updates,
      { new: true }
    );

    if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove a bot rule.
 */
export async function DELETE(req, { params }) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await dbConnect();
    const deleted = await BotRule.findOneAndDelete({ _id: id, organizationId: orgId });
    
    if (!deleted) return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
