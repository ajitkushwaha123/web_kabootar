import { currentUser, currentOrganization } from "@clerk/nextjs/server";
import { User, Organization } from "./types";

function mapClerkUser(cUser) {
  if (!cUser) return null;
  return new User({
    id: cUser.id,
    email: cUser.emailAddresses?.[0]?.emailAddress,
    name: cUser.firstName ? `${cUser.firstName} ${cUser.lastName || ""}` : "",
    imageUrl: cUser.imageUrl,
  });
}

function mapClerkOrg(cOrg) {
  if (!cOrg) return null;
  return new Organization({
    id: cOrg.id,
    name: cOrg.name,
    slug: cOrg.slug,
    imageUrl: cOrg.imageUrl,
  });
}

export const ClerkServerAuth = {
  async getCurrentUser() {
    return mapClerkUser(await currentUser());
  },
  async getCurrentOrg() {
    return mapClerkOrg(await currentOrganization());
  },
};
