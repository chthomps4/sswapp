import { NextResponse } from "next/server";
import { createSampleSocialImport } from "@/lib/social-dashboard-engine";

export async function GET() {
  const sample = createSampleSocialImport();
  return NextResponse.json({ insights: sample.insights });
}
