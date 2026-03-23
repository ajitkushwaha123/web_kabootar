import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BotRule from "@/models/BotRule";
import { getAuthContext } from "@/lib/auth/getAuth";

/**
 * GET: Fetch all bot rules for the current organization.
 */
export async function GET(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const rules = await BotRule.find({ organizationId: orgId }).sort({ priority: -1, createdAt: -1 });
    
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Create/Add a new bot rule.
 */
export async function POST(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { keywords, reply, category, priority } = await req.json();

    if (!keywords?.length || !reply) {
      return NextResponse.json({ error: "keywords and reply are required" }, { status: 400 });
    }

    await dbConnect();
    const rule = await BotRule.create({
      organizationId: orgId,
      keywords: keywords.map(kw => kw.trim().toLowerCase()),
      reply,
      category: category || "general",
      priority: priority || 5,
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
