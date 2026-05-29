import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { getSocialPerformanceData, isDatabaseConfigured } from "@/lib/db-operational";
import { createSampleDailyContentPack, recommendFromMetrics, sampleMetricsForPack } from "@/lib/automation-engine";

export async function GET() {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const social = await getSocialPerformanceData().catch(() => null);
  if (social?.snapshots.length) {
    return NextResponse.json({
      source: "social_metric_snapshots",
      insights: social.insights,
      snapshots: social.snapshots.length,
    });
  }
  if (isDatabaseConfigured()) {
    return NextResponse.json({
      source: "social_metric_snapshots",
      insights: [],
      snapshots: 0,
      message: "No confirmed social metric snapshots are persisted yet.",
    });
  }
  const pack = createSampleDailyContentPack();
  return NextResponse.json(recommendFromMetrics(sampleMetricsForPack(pack), pack.postDrafts));
}
