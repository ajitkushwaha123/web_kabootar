import 'dotenv/config';
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  console.log("--- Organizations ---");
  const orgs = await db.collection("organizations").find({ name: 'magic' }).toArray();
  for (const o of orgs) {
    console.log(`Org Name: "magic", _id: ${o._id.toString()}, slug: ${o.slug}`);
  }

  console.log("\n--- Latest 5 Messages ---");
  const msgs = await db.collection("messages").find({}).sort({ createdAt: -1 }).limit(5).toArray();
  for (const m of msgs) {
    console.log(`- ID: ${m._id}, Content: "${m.text?.body || m.messageType}", OrgId: "${m.organizationId}" (${m.organizationId === orgs[0]?._id.toString() ? 'MATCHES magic' : 'MISMATCH'})`);
  }

  process.exit(0);
}
run();
