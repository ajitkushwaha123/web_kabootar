import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set("active_org_id", orgId, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ success: true, orgId });
  } catch (error) {
    console.error("Error setting active organization:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
