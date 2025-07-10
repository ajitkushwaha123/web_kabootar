import axios from "axios";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");

    const queryParams = new URLSearchParams({});
    if (status && status !== "ALL") {
      queryParams.append("status", status);
    }

    const response = await axios.get(
      `${process.env.META_WA_API_URL}/${
        process.env.META_WA_BA_ID
      }/message_templates?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response from WhatsApp API:", response.data);

    return NextResponse.json(
      {
        templates: response?.data?.data || [],
        message: "Templates fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/template/get-all-template:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
};
