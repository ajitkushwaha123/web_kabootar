import { NextResponse } from "next/server";
import axios from "axios";

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);

    console.log("Received search parameters:", searchParams.toString());

    const language = searchParams.get("language") || "en_US";
    const limit = searchParams.get("limit") || "5";
    let platform = searchParams.get("platform");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const topic = searchParams.get("topic");
    const usecase = searchParams.get("usecase");
    const industry = searchParams.get("industry");

    if (!language.match(/^[a-z]{2}(_[A-Z]{2})?$/)) {
      return NextResponse.json(
        {
          error: "Invalid language code",
          message: "Please provide a valid language like 'en_US' or 'hi'",
        },
        { status: 400 }
      );
    }

    if (!process.env.META_WA_API_URL || !process.env.META_WA_TOKEN) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          message: "Missing META_WA_API_URL or META_WA_TOKEN in environment",
        },
        { status: 500 }
      );
    }

    const queryParams = new URLSearchParams({
      language,
      limit,
      // pretty: "1",
    });

    if (platform && platform !== "All") {
      queryParams.append("platform", platform);
    }

    if (search) {
      queryParams.append("search", search);
    }

    if (category) {
      queryParams.append("category", category);
    }

    if (topic) {
      queryParams.append("topic", topic);
    }

    if (usecase) {
      queryParams.append("usecase", usecase);
    }

    if (industry) {
      queryParams.append("industry", industry);
    }

    const url = `${
      process.env.META_WA_API_URL
    }/message_template_library?${queryParams.toString()}`;

    console.log("Fetching templates from URL:", url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const templates = response?.data?.data || [];

    return NextResponse.json(
      {
        templates,
        message: "Templates fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/template/template-library:", error);

    const statusCode = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.error?.message ||
      error?.message ||
      "Unknown server error";

    return NextResponse.json(
      {
        error: "Failed to fetch templates",
        message: errorMessage,
      },
      { status: statusCode }
    );
  }
};
