import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Member from "@/models/Member";
import Organization from "@/models/Organization";
import { getAuthContext } from "@/lib/auth/getAuth";
import { createClerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const members = await Member.find({ organizationId: orgId }).sort({ name: 1 });
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId, orgId, org } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { name, phone, email, role, permissions, autoPassword, password: manualPassword } = data;
    
    await dbConnect();
    
    // Check if phone or email already in use for this org
    const existing = await Member.findOne({ organizationId: orgId, $or: [{ phone }, { email }] });
    if (existing) {
       return NextResponse.json({ error: "Phone or Email already registered." }, { status: 400 });
    }

    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    
    let generatedPassword = manualPassword;
    if (autoPassword || !generatedPassword) {
       generatedPassword = Math.random().toString(36).slice(-10) + "Ms!";
    }

    // 1. Create User in Clerk
    let clerkUserId = null;
    let dashboardAccess = true;
    try {
      const newClerkUser = await clerk.users.createUser({
        emailAddress: [email],
        password: generatedPassword,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" "),
        skipEmailVerification: true,
      });
      clerkUserId = newClerkUser.id;
    } catch (clerkErr) {
      console.error("Clerk Create Error:", clerkErr.message);
      
      // If Quota Exceeded, we allow adding to DB without dashboard access
      if (clerkErr.errors?.[0]?.code === 'user_quota_exceeded') {
        console.warn("⚠️ Clerk Quota Exceeded! Adding member to local DB only.");
        dashboardAccess = false;
        clerkUserId = `LOCAL_${Date.now()}`; // Placeholder ID for local record
      } else {
        return NextResponse.json({ 
          error: "Failed to create account in Clerk: " + (clerkErr.errors?.[0]?.message || clerkErr.message) 
        }, { status: 400 });
      }
    }

    // 2. Add to Organization members list
    await Organization.findOneAndUpdate(
       { org_id: orgId },
       { 
         $addToSet: { 
           members: { 
             user_id: clerkUserId, 
             role: role === "ADMIN" ? "ADMIN" : "MEMBER",
             permissions: permissions || ["inbox"]
           } 
         } 
       }
    );

    // 3. Create local Member record
    const member = await Member.create({ 
      organizationId: orgId, 
      user_id: clerkUserId,
      name, 
      phone, 
      email,
      role,
      permissions: permissions || ["inbox"]
    });

    return NextResponse.json({ 
      success: true, 
      member, 
      dashboardAccess,
      warning: dashboardAccess ? null : "Caution: Clerk user quota exceeded. Member added to CRM but dashboard login is disabled.",
      credentials: { email, password: generatedPassword } 
    });
  } catch (error) {
    console.error("Member creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
