import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import Member from "@/models/Member";
import { getAuthContext } from "@/lib/auth/getAuth";

/**
 * GET: Fetch ALL organizations and their member stats for Master Admin.
 * ⚠️ SECURITY: In production, we should check if the 'userMetadata.role === "MASTER"'.
 * For now, we allow the requesting ADMIN to view the platform overview.
 */
export async function GET() {
  try {
    const { userId, orgId } = await getAuthContext();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    
    // 1. Fetch all Organizations
    const orgs = await Organization.find({}).sort({ createdAt: -1 }).lean();
    
    // 2. Fetch all Members to calculate counts per org
    const allMembers = await Member.find({}).lean();
    
    // 3. Enrich Organization data
    const enrichedOrgs = orgs.map(org => {
      const orgMembers = allMembers.filter(m => m.organizationId === org.org_id);
      return {
        ...org,
        memberCount: orgMembers.length,
        adminUser: orgMembers.find(m => m.role === "ADMIN") || null,
        crmMembers: orgMembers
      };
    });

    return NextResponse.json({ 
      success: true, 
      count: orgs.length,
      data: enrichedOrgs 
    });
  } catch (error) {
    console.error("Master Orgs API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
