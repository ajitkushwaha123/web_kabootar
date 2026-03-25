import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Member from "@/models/Member";
import { getAuthContext } from "@/lib/auth/getAuth";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isActive, name, phone, email, role, permissions } = await req.json();
    await dbConnect();
    
    const memberId = id;
    
    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;

    const member = await Member.findOneAndUpdate(
      { _id: memberId, organizationId: orgId },
      updateData,
      { new: true }
    );
    
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // Sync to Organization model if user_id exists
    if (member.user_id && permissions) {
       const Organization = (await import("@/models/Organization")).default;
       await Organization.updateOne(
          { org_id: orgId, "members.user_id": member.user_id },
          { $set: { "members.$.permissions": permissions } }
       );
       console.log(`✅ Synced permissions for user ${member.user_id} in Org ${orgId}`);
    }

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const { id } = await params;
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const memberId = id;
    await dbConnect();

    const deleted = await Member.findOneAndDelete({ _id: memberId, organizationId: orgId });
    if (!deleted) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
