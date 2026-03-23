import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Member from "@/models/Member";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { role } = await req.json();
    if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });

    await dbConnect();
    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!updatedMember) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    return NextResponse.json(updatedMember);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
