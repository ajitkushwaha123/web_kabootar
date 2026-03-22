import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { User, Organization as OrgType } from "./types";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";

function mapClerkUser(cUser) {
  if (!cUser) return null;
  return new User({
    id: cUser.id,
    email: cUser.emailAddresses?.[0]?.emailAddress,
    name: cUser.firstName ? `${cUser.firstName} ${cUser.lastName || ""}` : "",
    imageUrl: cUser.imageUrl,
  });
}

function mapMongoOrg(mOrg) {
  if (!mOrg) return null;
  return new OrgType({
    id: mOrg.org_id,
    name: mOrg.name,
    slug: mOrg.slug,
    imageUrl: mOrg.logo_url,
  });
}

export const ClerkServerAuth = {
  async getCurrentUser() {
    return mapClerkUser(await currentUser());
  },
  async getCurrentOrg() {
    await dbConnect();
    const user = await currentUser();
    if (!user) return null;

    // 1. Check if a specific organization was selected via cookie
    const cookieStore = await cookies();
    const activeOrgId = cookieStore.get("active_org_id")?.value;

    if (activeOrgId) {
      const selectedOrg = await Organization.findOne({ org_id: activeOrgId });
      if (selectedOrg) return mapMongoOrg(selectedOrg);
    }

    // 2. Fallback to the first organization where the user is a member
    const org = await Organization.findOne({
      "members.user_id": user.id,
    });
    
    return mapMongoOrg(org);
  },
};
