import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { getSocialPerformanceData, isDatabaseConfigured } from "@/lib/db-operational";
import { createSampleSocialImport, getPerformanceContextForPrompt } from "@/lib/social-dashboard-engine";

export async function GET() {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const sample = isDatabaseConfigured() ? await getSocialPerformanceData() : createSampleSocialImport();
  return NextResponse.json({
    context: getPerformanceContextForPrompt({
      metrics: sample.snapshots,
      posts: sample.socialPosts,
    }),
    privacy: "Sanitized aggregate context only. Raw imported dashboard rows are not included.",
  });
}
