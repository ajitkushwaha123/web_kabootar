import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Member from "@/models/Member";

export async function GET() {
  try {
    await dbConnect();
    // Public listing of ALL members irrespective of org
    const members = await Member.find().sort({ name: 1 });
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
