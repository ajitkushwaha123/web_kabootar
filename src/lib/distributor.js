import dbConnect from "./dbConnect";
import Member from "@/models/Member";
import Lead from "@/models/Lead";
import Organization from "@/models/Organization";
import axios from "axios";

// ─── MAIN: LEAD ASSIGN KARO ──────────────────────────────────
export async function assignLead(leadId, orgId) {
  await dbConnect();

  const org = await Organization.findOne({ org_id: orgId });
  if (!org) return null;

  const settings = org.leadDistributionSettings || { rule: "round_robin", roundRobinIndex: 0 };
  const rule = settings.rule;
  let selectedMember = null;

  // Sirf active members lo
  let activeMembers = await Member.find({ organizationId: orgId, isActive: true });
  
  if (activeMembers.length === 0) {
    console.warn("⚠️ No active members found for lead assignment in org:", orgId, ". Checking for ANY member as fallback...");
    activeMembers = await Member.find({ organizationId: orgId });
    
    if (activeMembers.length === 0) {
        console.error("❌ Critical: No members found at all for org:", orgId, ". Lead remains unassigned.");
        return null;
    }
  }

  // ── Rule 1: Round Robin ──────────────────────────────────
  if (rule === "round_robin") {
    const idx = settings.roundRobinIndex % activeMembers.length;
    selectedMember = activeMembers[idx];

    // Index aage badhao in Organization model
    await Organization.findOneAndUpdate(
      { org_id: orgId },
      { "leadDistributionSettings.roundRobinIndex": (settings.roundRobinIndex + 1) }
    );
  }

  // ── Rule 2: Load Based (jiske paas sabse kam leads) ──────
  else if (rule === "load_based") {
    selectedMember = activeMembers.reduce((min, m) =>
      (m.currentLeads || 0) < (min.currentLeads || 0) ? m : min
    );
  }

  // ── Rule 3: Manual ────────────────────────────────────────
  else if (rule === "manual") {
    return null;
  }

  if (!selectedMember) return null;

  // Lead update karo
  const updatedLead = await Lead.findByIdAndUpdate(
    leadId,
    {
      $addToSet: { assignedTo: selectedMember._id.toString() },
      assignedAt: new Date(),
      stage: "assigned",
      distributionRule: rule,
    },
    { new: true }
  );

  // Member ka lead count badhao
  await Member.findByIdAndUpdate(selectedMember._id, {
    $inc: { currentLeads: 1, totalLeads: 1 }
  });

  // Notify member via WhatsApp (Meta API)
  await notifyMember(selectedMember, updatedLead, org);

  return selectedMember;
}

// ─── NOTIFY MEMBER (Meta API) ────────────────────────────────
async function notifyMember(member, lead, org) {
  if (!member.phone) return;

  const waUrl = `${process.env.META_WA_API_URL || "https://graph.facebook.com/v21.0"}/${org.phone_number_id}/messages`;
  const token = org.access_token || process.env.META_WA_TOKEN;

  try {
    await axios.post(
      waUrl,
      {
        messaging_product: "whatsapp",
        to: member.phone,
        type: "text",
        text: {
          body: `🔔 New Lead Assigned!\n\nName: ${lead.title || "New Lead"}\nPhone: ${lead.contactId || "N/A"}\nSource: ${lead.source}\nStatus: ${lead.stage}\n\nPlease check your dashboard.`,
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Notification sent to member: ${member.name} (${member.phone})`);
  } catch (error) {
    console.error(`❌ Failed to notify member ${member.name}:`, error.response?.data || error.message);
  }
}

// ─── ADMIN: MANUALLY ASSIGN KARO ────────────────────────────
export async function manualAssign(leadId, memberId, orgId) {
  await dbConnect();

  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error("Lead not found");

  // Pehle wale members ka count ghataao (agar single assignment model hota, par hamara array hai)
  // For simplicity, we assume we want to replace or just add. 
  // Custom requirement says replace in manualAssign usually.
  
  // If we wanted to decrease count of previous agents:
  /*
  if (lead.assignedTo && lead.assignedTo.length > 0) {
    for (const oldMemberId of lead.assignedTo) {
      await Member.findByIdAndUpdate(oldMemberId, { $inc: { currentLeads: -1 } });
    }
  }
  */

  await Lead.findByIdAndUpdate(leadId, {
    $set: { assignedTo: [memberId] }, 
    assignedAt: new Date(),
    stage: "assigned",
    distributionRule: "manual",
  });

  await Member.findByIdAndUpdate(memberId, {
    $inc: { currentLeads: 1, totalLeads: 1 }
  });
  
  const org = await Organization.findOne({ org_id: orgId });
  const member = await Member.findById(memberId);
  await notifyMember(member, lead, org);
}
