import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Knowledge from "@/models/Knowledge";
import { getAuthContext } from "@/lib/auth/getAuth";

export async function PATCH(req, { params }) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id } = await params;
    
    await dbConnect();
    const updated = await Knowledge.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      { $set: body },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    await Knowledge.deleteOne({ _id: id, organizationId: orgId });

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
