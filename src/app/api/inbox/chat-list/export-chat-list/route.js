import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@clerk/nextjs/server";
import messageModel from "@/Models/message.model";

export async function GET(req) {
  try {
    await dbConnect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    const query = { userId };

    console.log("Query parameters:", {
      startDate: startDateStr,
      endDate: endDateStr,
    });

    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      endDate.setUTCHours(23, 59, 59, 999);

      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const chatWithList = await messageModel.find({ clerkId: userId });

    console.log("Chat with list:", chatWithList);

    return NextResponse.json(chatWithList);
  } catch (err) {
    console.error("❌ Chat export error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
