import { NextResponse } from "next/server";
import { createSampleDailyContentPack, recommendFromMetrics, sampleMetricsForPack } from "@/lib/automation-engine";
import { requireOwnerResponse } from "@/lib/auth";
import { getSocialPerformanceData, isDatabaseConfigured } from "@/lib/db-operational";
import { generateRuleBasedInsights } from "@/lib/social-dashboard-engine";

export async function POST() {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  if (isDatabaseConfigured()) {
    const data = await getSocialPerformanceData();
    return NextResponse.json({
      source: "social_metric_snapshots",
      insights: generateRuleBasedInsights(data.snapshots, data.socialPosts),
      snapshots: data.snapshots.length,
      message: data.snapshots.length ? "" : "No confirmed social metric snapshots are persisted yet.",
    });
  }
  const pack = createSampleDailyContentPack();
  return NextResponse.json(recommendFromMetrics(sampleMetricsForPack(pack), pack.postDrafts));
}
