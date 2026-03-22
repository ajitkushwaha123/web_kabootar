import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { getAuthContext } from "@/lib/auth/getAuth";

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const org = await Organization.findOne({ org_id: orgId });
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    return NextResponse.json(org.leadDistributionSettings || { rule: "round_robin", roundRobinIndex: 0 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { orgId } = await getAuthContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rule } = await req.json();
    if (!["round_robin", "load_based", "manual"].includes(rule)) {
      return NextResponse.json({ error: "Invalid rule" }, { status: 400 });
    }

    await dbConnect();
    const org = await Organization.findOneAndUpdate(
      { org_id: orgId },
      { "leadDistributionSettings.rule": rule, "leadDistributionSettings.roundRobinIndex": 0 },
      { new: true, upsert: true }
    );
    
    return NextResponse.json(org.leadDistributionSettings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
