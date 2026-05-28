import { NextResponse } from "next/server";
import { createSampleSocialImport, generateRuleBasedInsights } from "@/lib/social-dashboard-engine";

export async function POST() {
  const sample = createSampleSocialImport();
  return NextResponse.json({ insights: generateRuleBasedInsights(sample.snapshots, sample.socialPosts) });
}
