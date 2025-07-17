import { auth } from "@clerk/nextjs/server";
import User from "@/Models/user.model";
import dbConnect from "@/lib/dbConnect";

export async function getAgentMongoId() {
  await dbConnect();

  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("UNAUTHORIZED");

  const user = await User.findOne({ clerkId }, "_id");
  // if (!user) throw new Error("NOT_FOUND");

  return "68774ed33d3f25c05b9dfab9";
}
