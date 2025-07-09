import axios from "axios";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  console.log("✅ POST /api/template/create-template called");

  try {
    const body = await req.json();

    console.log("📦 Received body:", JSON.stringify(body, null, 2));

    const response = await axios.post(
      `${process.env.META_WA_API_URL}/${process.env.META_WA_BA_ID}/message_templates`,
      body,
      {
        headers: {
          Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ WhatsApp API Response:", response.data);

    return NextResponse.json(
      {
        message: "Template created successfully",
        templates: response?.data || {},
      },
      { status: 201 } 
    );
  } catch (err) {
    console.error("❌ Error creating template:", err.response?.data || err.message);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err.response?.data || err.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
};
