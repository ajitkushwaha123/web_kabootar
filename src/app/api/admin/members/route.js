import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Member from "@/models/Member";
import { getAuthContext } from "@/lib/auth/getAuth";

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const members = await Member.find({ organizationId: orgId }).sort({ name: 1 });
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, phone, email, user_id, role } = await req.json();
    await dbConnect();
    
    // Check if phone or email already in use for this org
    const existing = await Member.findOne({ organizationId: orgId, $or: [{ phone }, { email }] });
    if (existing) {
       return NextResponse.json({ error: "Phone or Email already registered for a member." }, { status: 400 });
    }

    const member = await Member.create({ 
      organizationId: orgId, 
      name, 
      phone, 
      email,
      user_id,
      role
    });
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
