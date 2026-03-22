import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [mappedOrg, setMappedOrg] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      if (user) {
        try {
          const response = await fetch("/api/organization/me");
          if (response.ok) {
            const data = await response.json();
            setMappedOrg(data);
          } else {
            console.warn("Failed to fetch organization or no organization found");
            setMappedOrg(null);
          }
        } catch (error) {
          console.error("Error fetching organization:", error);
          setMappedOrg(null);
        } finally {
          setLoadingOrg(false);
        }
      } else if (isLoaded) {
        setMappedOrg(null);
        setLoadingOrg(false);
      }
    };

    fetchOrg();
  }, [user, isLoaded]);

  const mappedUser = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        imageUrl: user.imageUrl,
      }
    : null;

  return (
    <AuthContext.Provider value={{ user: mappedUser, org: mappedOrg, loading: !isLoaded || loadingOrg }}>
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
