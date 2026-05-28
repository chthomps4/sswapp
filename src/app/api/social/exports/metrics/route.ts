import { NextResponse } from "next/server";
import { createSampleSocialImport, exportSocialMetricsCsv } from "@/lib/social-dashboard-engine";

export async function GET() {
  const sample = createSampleSocialImport();
  return new NextResponse(exportSocialMetricsCsv(sample.snapshots), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="social-metrics.csv"',
    },
  });
}
