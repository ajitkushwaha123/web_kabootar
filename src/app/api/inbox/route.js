import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/Models/user.model";

export const GET = async (req) => {
  await dbConnect();
  const { userId } = await auth();

  const user = await User.find({});

  return NextResponse.json({
    message: "This is a response from the inbox API",
    status: "success",
  });
};
