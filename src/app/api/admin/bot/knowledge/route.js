import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Knowledge from "@/models/Knowledge";
import { getAuthContext } from "@/lib/auth/getAuth";

export async function GET(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    
    const data = await Knowledge.find({ 
      organizationId: orgId 
    }).sort({ usageCount: -1, createdAt: -1 });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    const newItem = await Knowledge.create({
      ...body,
      organizationId: orgId,
      keywords: body.keywords || body.question.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
