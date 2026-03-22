import { NextResponse } from "next/server";
import { manualAssign } from "@/lib/distributor";
import { getAuthContext } from "@/lib/auth/getAuth";

export async function POST(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId, memberId } = await req.json();
    if (!leadId || !memberId) {
      return NextResponse.json({ error: "Missing leadId or memberId" }, { status: 400 });
    }

    await manualAssign(leadId, memberId, orgId);
    return NextResponse.json({ success: true, message: "Lead assigned manually." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
