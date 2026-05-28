import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { getSocialPerformanceData } from "@/lib/db-operational";
import { generateRuleBasedInsights } from "@/lib/social-dashboard-engine";

export async function POST() {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const sample = await getSocialPerformanceData();
  return NextResponse.json({ insights: generateRuleBasedInsights(sample.snapshots, sample.socialPosts) });
}
