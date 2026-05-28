import { NextResponse } from "next/server";
import { getSocialPerformanceData } from "@/lib/db-operational";
import { createSampleDailyContentPack, recommendFromMetrics, sampleMetricsForPack } from "@/lib/automation-engine";

export async function GET() {
  const social = await getSocialPerformanceData().catch(() => null);
  if (social?.snapshots.length) {
    return NextResponse.json({
      source: "social_metric_snapshots",
      insights: social.insights,
      snapshots: social.snapshots.length,
    });
  }
  const pack = createSampleDailyContentPack();
  return NextResponse.json(recommendFromMetrics(sampleMetricsForPack(pack), pack.postDrafts));
}
