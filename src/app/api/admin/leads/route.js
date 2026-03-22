import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Lead from "@/models/Lead";
import { getAuthContext } from "@/lib/auth/getAuth";

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const leads = await Lead.find({ organizationId: orgId })
      .populate({
        path: "assignedTo",
        model: "Member",
        select: "name phone email" 
      })
      .sort({ createdAt: -1 })
      .limit(100);
    
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
