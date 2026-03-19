"use client";

import { createContext, useContext } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const { user } = useUser();
  const { organization } = useOrganization();

  const mappedUser = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        imageUrl: user.imageUrl,
      }
    : null;

  const mappedOrg = organization
    ? {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        imageUrl: organization.imageUrl,
      }
    : null;

  return (
    <AuthContext.Provider value={{ user: mappedUser, org: mappedOrg }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
