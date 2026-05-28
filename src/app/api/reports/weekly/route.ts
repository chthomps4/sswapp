import { NextResponse } from "next/server";
import { createSampleDailyContentPack, recommendFromMetrics, sampleMetricsForPack } from "@/lib/automation-engine";

export async function GET() {
  const pack = createSampleDailyContentPack();
  return NextResponse.json(recommendFromMetrics(sampleMetricsForPack(pack), pack.postDrafts));
}
