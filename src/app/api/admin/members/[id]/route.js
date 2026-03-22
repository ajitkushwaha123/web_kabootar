import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Member from "@/models/Member";
import { getAuthContext } from "@/lib/auth/getAuth";

export async function PATCH(req, { params }) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isActive, name, phone, email, role } = await req.json();
    await dbConnect();
    
    const memberId = params.id;
    
    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    const member = await Member.findOneAndUpdate(
      { _id: memberId, organizationId: orgId },
      updateData,
      { new: true }
    );
    
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const memberId = params.id;
    await dbConnect();

    const deleted = await Member.findOneAndDelete({ _id: memberId, organizationId: orgId });
    if (!deleted) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
