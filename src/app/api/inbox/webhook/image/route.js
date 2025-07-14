import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import cloudinary from "@/lib/cloudinary";
import axios from "axios";

export async function POST(req) {
  try {
    await dbConnect();
    const { imageId } = await req.json();

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const metaRes = await axios.get(
      `${process.env.META_WA_API_URL}/${imageId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
        },
      }
    );

    console.log("📷 Received image metadata:", metaRes.data);

    if (!metaRes?.data?.url) {
      return NextResponse.json(
        { error: "Image URL not found in metadata" },
        { status: 400 }
      );
    }

    const imageUrl = metaRes?.data?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to retrieve image URL from WhatsApp" },
        { status: 500 }
      );
    }

    console.log("✅ Received image URL:", imageUrl);

    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
      },
    });

    const imageBuffer = Buffer.from(imageRes.data);

    const cloudinaryResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "kabootar-images" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      stream.end(imageBuffer);
    });

    return NextResponse.json(
      {
        success: true,
        cloudinaryUrl: cloudinaryResult.secure_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Upload error:", error?.response?.data || error.message);
    return NextResponse.json(
      {
        error:
          error?.response?.data?.error?.message ||
          error.message ||
          "Unknown error",
      },
      { status: 500 }
    );
  }
}
