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
 * POST: Create/Add a new bot rule (Handles Single & Bulk Array).
 */
export async function POST(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    // --- CASE 1: BULK IMPORT (ARRAY) ---
    if (Array.isArray(body)) {
      if (body.length === 0) return NextResponse.json({ error: "Empty array" }, { status: 400 });

      const rulesToInsert = body.map(item => ({
        organizationId: orgId,
        keywords: Array.isArray(item.keywords) ? item.keywords.map(k => k.trim().toLowerCase()) : [],
        reply: item.reply || "",
        category: item.category || "general",
        priority: item.priority || 5,
        isActive: item.isActive !== false,
      })).filter(r => r.keywords.length > 0 && r.reply);

      if (rulesToInsert.length === 0) return NextResponse.json({ error: "No valid rules found in array" }, { status: 400 });

      const docs = await BotRule.insertMany(rulesToInsert);
      return NextResponse.json({ success: true, count: docs.length, data: docs });
    }

    // --- CASE 2: SINGLE RULE ---
    const { keywords, reply, category, priority } = body;

    if (!keywords?.length || !reply) {
      return NextResponse.json({ error: "keywords and reply are required" }, { status: 400 });
    }

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
