// lib/server-helpers/getAgentMongoId.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/Models/user.model";
import dbConnect from "@/lib/dbConnect";

export async function getAgentMongoId(req) {
  await dbConnect();

  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw NextResponse.json(
      { error: "Unauthorized: Clerk session missing" },
      { status: 401 }
    );
  }

  const user = await User.findOne({ clerkId }, "_id");

  if (!user) {
    throw NextResponse.json({ error: "User not found in DB" }, { status: 404 });
  }

  return user._id; 
}
