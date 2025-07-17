import dbConnect from "@/lib/dbConnect";
import { withAgent } from "@/lib/with-agent/withAgent";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import Workspace from "@/Models/workspace.model";
import User from "@/Models/user.model";

const handler = async (req, agentMongoId) => {
  await dbConnect();

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const formData = await req.formData();

  const name = formData.get("name");
  const slug = formData.get("slug");
  const metadataRaw = formData.get("metadata") || "{}";
  const logoFile = formData.get("logo");

  if (!name) {
    return NextResponse.json(
      { error: "Workspace name is required" },
      { status: 400 }
    );
  }

  const existing = await Workspace.findOne({ slug });
  if (slug && existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  let logoUrl = "";
  if (
    logoFile &&
    typeof logoFile === "object" &&
    typeof logoFile.arrayBuffer === "function"
  ) {
    const buffer = Buffer.from(await logoFile.arrayBuffer());

    try {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "workspaces",
              resource_type: "image",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          )
          .end(buffer);
      });

      logoUrl = uploadResult.secure_url;
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to upload logo to Cloudinary" },
        { status: 500 }
      );
    }
  }

  const user = await User.findById(agentMongoId);

  console.log("Creating workspace with user:", user);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const metadata = JSON.parse(metadataRaw);

  const { email } = user;

  if (!email) {
    return NextResponse.json(
      { error: "User email is required" },
      { status: 400 }
    );
  }

  const workspace = await Workspace.create({
    name,
    slug,
    metadata,
    logo: logoUrl,
    createdBy: agentMongoId,
    members: [
      {
        user: agentMongoId,
        role: "admin",
        joinedAt: new Date(),
        email,
      },
    ],
  });

  console.log("Workspace created:", workspace);

  return NextResponse.json(
    { message: "Workspace created", workspace },
    { status: 201 }
  );
};

export const POST = withAgent(handler);
