import axios from "axios";
import { NextResponse } from "next/server";

// POST handler
export const POST = async (req) => {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const file_name = searchParams.get("file_name");
    const file_length = searchParams.get("file_length");
    const file_type = searchParams.get("file_type");

    // Validate required parameters
    if (!file_name || !file_length || !file_type) {
      return NextResponse.json(
        { error: "Missing file_name, file_length, or file_type" },
        { status: 400 }
      );
    }

    // Get binary file data from request body
    const fileBuffer = await req.arrayBuffer();
    const file = Buffer.from(fileBuffer);

    // Step 1: Initiate upload session
    const initiateUrl = `${process.env.META_WA_API_URL}/${process.env.META_WA_APP_ID}/uploads`;

    const sessionInitResponse = await axios.post(initiateUrl, null, {
      params: {
        file_name,
        file_length,
        file_type,
        access_token: process.env.META_WA_TOKEN,
      },
    });

    const uploadSessionId = sessionInitResponse.data?.id;

    if (!uploadSessionId) {
      return NextResponse.json(
        { error: "Failed to initiate upload session" },
        { status: 500 }
      );
    }

    // Step 2: Upload file to session URL
    const uploadUrl = `${process.env.META_WA_API_URL}/${uploadSessionId}`;

    const uploadResponse = await axios.post(uploadUrl, file, {
      headers: {
        Authorization: `OAuth ${process.env.META_WA_TOKEN}`,
        file_offset: "0",
        "Content-Type": file_type,
      },
    });

    console.log("Upload response:", uploadResponse.data);

    return NextResponse.json(
      {
        message: "Upload successful",
        data: uploadResponse.data,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Upload error:", err?.response?.data || err.message);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: err?.response?.data || err.message,
      },
      { status: 500 }
    );
  }
};
