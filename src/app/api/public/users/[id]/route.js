import { createClerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Member from "@/models/Member";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { role, organizationId } = await req.json();
    if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });

    const clerkId = id;
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    // Step 1: Update Clerk user's metadata to store their global role
    await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: role
      }
    });

    // Step 2: Attempt to finding or creating a local 'Member' entry for lead distribution logic
    await dbConnect();
    const existingMember = await Member.findOne({ user_id: clerkId });

    if (existingMember) {
      await Member.findByIdAndUpdate(existingMember._id, { role });
    } else {
      // If we don't have an organizationId, we can't create a valid Member entry yet
      // but we can create a minimalist one or skip it.
      // Based on the user's need, let's at least store it in a generic way if possible.
      // Or just skip creating a Member entry until they are actually added to an org.
      console.log(`Clerk user ${clerkId} role changed but they are not part of an organization for lead distribution.`);
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
