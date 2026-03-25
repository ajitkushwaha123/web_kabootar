import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { getAuthContext } from "@/lib/auth/getAuth";

/**
 * GET: Fetch current organization settings.
 */
export async function GET(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const org = await Organization.findOne({ org_id: orgId });
    
    return NextResponse.json({ 
      success: true, 
      mode: org.autoReplyMode || "HYBRID",
      autoLearn: org.autoLearn !== false,
      confidenceThreshold: org.aiConfidenceThreshold || 0.85
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Update settings.
 */
export async function POST(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { mode, autoLearn, confidenceThreshold } = body;

    const updateData = {};
    if (mode) {
      if (!["OFF", "BOT_ONLY", "AI_ONLY", "HYBRID"].includes(mode)) {
        return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
      }
      updateData.autoReplyMode = mode;
      updateData.autoAiReply = (mode !== "OFF");
    }

    if (autoLearn !== undefined) updateData.autoLearn = autoLearn;
    if (confidenceThreshold !== undefined) updateData.aiConfidenceThreshold = parseFloat(confidenceThreshold);

    await dbConnect();
    const updated = await Organization.findOneAndUpdate(
      { org_id: orgId }, 
      { $set: updateData }, 
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      mode: updated?.autoReplyMode,
      autoLearn: updated?.autoLearn,
      confidenceThreshold: updated?.aiConfidenceThreshold
    });
  } catch (error) {
    console.error("❌ [SETTINGS] Update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
