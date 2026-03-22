import { getAuthContext } from "@/lib/auth/getAuth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { clerkClient } from "@clerk/nextjs/server";

export const PATCH = async (req) => {
  try {
    const { userId, orgId, org } = await getAuthContext();

    if (!userId || !orgId) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
    }

    const { autoAiReply } = await req.json();

    await dbConnect();

    // 1. Update MongoDB
    const updatedOrg = await Organization.findOneAndUpdate(
      { org_id: orgId },
      { $set: { autoAiReply: !!autoAiReply } },
      { new: true }
    );

    // 2. Sync with Clerk Public Metadata (for UI state)
    // Note: This requires the Clerk Secret Key to have org management permissions.
    // If we're using personal accounts or don't want to overcomplicate, we can skip.
    // However, the UI relies on organization?.publicMetadata?.autoAiReply.
    
    // We'll try to update Clerk if possible
    try {
      const client = await clerkClient();
      await client.organizations.updateOrganizationMetadata(org.org_id, {
        publicMetadata: {
          autoAiReply: !!autoAiReply,
        },
      });
    } catch (clerkErr) {
      console.warn("Clerk Metadata sync failed (probably not a Clerk Org):", clerkErr.message);
    }

    return NextResponse.json({
      success: true,
      data: updatedOrg,
    });
  } catch (err) {
    console.error("Update Org Error:", err);
    return NextResponse.json({ message: err.message, success: false }, { status: 500 });
  }
};
