import { createClerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Member from "@/models/Member";

export async function GET() {
  try {
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    
    // Fetch all users from Clerk (up to 500)
    const { data: clerkUsers } = await clerkClient.users.getUserList({ limit: 500 });
    
    await dbConnect();
    // Fetch current members to get their local settings/stats
    const localMembers = await Member.find().lean();
    
    // Map Clerk users to a combined format
    const allUsers = clerkUsers.map(user => {
      const local = localMembers.find(m => m.user_id === user.id);
      return {
        _id: user.id, // Using clerk ID as the key for the public view
        clerkId: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Unknown",
        phone: user.phoneNumbers?.[0]?.phoneNumber || "No Phone",
        email: user.emailAddresses?.[0]?.emailAddress || "No Email",
        role: user.publicMetadata?.role || local?.role || "USER", 
        isActive: local?.isActive !== false,
        memberId: local?._id || null, // exists only if they are in the lead distribution system
        organizationId: local?.organizationId || "No Org", 
        imageUrl: user.imageUrl,
      }
    });

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users from Clerk:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
