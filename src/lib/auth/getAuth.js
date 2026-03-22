import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";

export async function getAuthContext() {
  await dbConnect();
  const user = await currentUser();

  if (!user) {
    return { userId: null, orgId: null, org: null, user: null };
  }

  // 1. Try to get organization from active_org_id cookie (Admin/User Selection Mode)
  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get("active_org_id")?.value;

  let organization;
  if (activeOrgId) {
    organization = await Organization.findOne({ org_id: activeOrgId });
  }

  // 2. Fallback to membership check if no cookie or org found
  if (!organization) {
    organization = await Organization.findOne({ 
      "members.user_id": user.id 
    });
  }

  return {
    userId: user.id,
    user: user,
    orgId: organization ? organization.org_id : null,
    org: organization,
  };
}

