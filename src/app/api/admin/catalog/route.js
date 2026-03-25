import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CatalogItem from "@/models/CatalogItem";
import { getAuthContext } from "@/lib/auth/getAuth";

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const items = await CatalogItem.find({ organizationId: orgId }).sort({ createdAt: -1 });

    return NextResponse.json(items);
  } catch (error) {
    console.error("API: GET CATALOG ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    const newItem = await CatalogItem.create({
      ...body,
      organizationId: orgId,
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("API: POST CATALOG ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
