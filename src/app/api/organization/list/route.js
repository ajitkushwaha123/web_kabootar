import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";

export async function GET() {
  try {
    await dbConnect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, listing ALL organizations as requested by the user
    const organizations = await Organization.find({}).select("name slug org_id logo_url").lean();

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
