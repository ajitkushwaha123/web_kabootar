import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await dbConnect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const activeOrgId = cookieStore.get("active_org_id")?.value;

    let org;
    if (activeOrgId) {
      org = await Organization.findOne({ org_id: activeOrgId });
    }

    if (!org) {
      org = await Organization.findOne({
        "members.user_id": user.id,
      });
    }

    if (!org) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const member = org.members.find(m => m.user_id === user.id);

    return NextResponse.json({ 
      id: org.org_id, 
      name: org.name, 
      slug: org.slug, 
      imageUrl: org.logo_url,
      autoAiReply: !!org.autoAiReply,
      role: member ? member.role : "MEMBER",
      permissions: member ? member.permissions : ["inbox"]
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
