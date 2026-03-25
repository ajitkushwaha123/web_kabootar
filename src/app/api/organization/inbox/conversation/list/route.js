import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Contact from "@/models/Contact";
import Message from "@/models/Message";
import { getAuthContext } from "@/lib/auth/getAuth";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const { userId, orgId } = await getAuthContext();
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        { message: "Organization not found", success: false },
        { status: 404 }
      );
    }

    const query = {
      organizationId: orgId,
      isDeleted: false,
    };

    if (tag) {
      query.tags = { $in: [tag] };
    }

    const conversations = await Conversation.find(query)
      .populate("contactId", "primaryName , primaryPhone")
      .populate("lastMessageId")
      .sort({ lastMessageAt: -1 })
      .lean();

    return NextResponse.json(
      {
        message: "Conversations fetched successfully",
        conversations,
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching conversations:", err);
    return NextResponse.json(
      {
        message: err.message || "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
};
