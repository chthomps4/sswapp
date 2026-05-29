import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { exportSocialInsightsJsonFromDb, isDatabaseConfigured } from "@/lib/db-operational";
import { createSampleSocialImport } from "@/lib/social-dashboard-engine";

export async function GET() {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const sample = createSampleSocialImport();
  if (isDatabaseConfigured()) {
    return new NextResponse(await exportSocialInsightsJsonFromDb(), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return NextResponse.json({ insights: sample.insights });
}
