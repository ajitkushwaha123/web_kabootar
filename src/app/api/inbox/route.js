import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import userModel from "@/Models/user.model";
import dbConnect from "@/lib/dbConnect";

export const GET = async (req) => {
  await dbConnect();
  const { userId } = await auth();

  const user = await userModel.find({});

  return NextResponse.json({
    message: "This is a response from the inbox API",
    status: "success",
  });
};
