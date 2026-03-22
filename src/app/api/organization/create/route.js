import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";

export async function POST(req) {
  try {
    await dbConnect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug, logo_url, display_phone_number, phone_number_id, wa_business_account_id, access_token } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    // Check if slug already exists
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return NextResponse.json({ error: "Organization with this slug already exists" }, { status: 409 });
    }

    const org = await Organization.create({
      name,
      slug,
      org_id: slug, // Using slug as the unique ID for compatibility
      logo_url: logo_url || "",
      display_phone_number: display_phone_number || "",
      phone_number_id: phone_number_id || "",
      wa_business_account_id: wa_business_account_id || "",
      access_token: access_token || "",
      admin_id: user.id,
      members: [
        {
          user_id: user.id,
          role: "ADMIN",
        },
      ],
    });

    return NextResponse.json({ 
      success: true, 
      org_id: org._id, 
      slug: org.slug 
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
