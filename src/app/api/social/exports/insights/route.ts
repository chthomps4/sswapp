import { NextResponse } from "next/server";
import { exportSocialInsightsJsonFromDb, isDatabaseConfigured } from "@/lib/db-operational";
import { createSampleSocialImport } from "@/lib/social-dashboard-engine";

export async function GET() {
  const sample = createSampleSocialImport();
  if (isDatabaseConfigured()) {
    return new NextResponse(await exportSocialInsightsJsonFromDb(), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return NextResponse.json({ insights: sample.insights });
}
