import { NextResponse } from "next/server";
import { exportSocialMetricsCsvFromDb, isDatabaseConfigured } from "@/lib/db-operational";
import { createSampleSocialImport, exportSocialMetricsCsv } from "@/lib/social-dashboard-engine";

export async function GET() {
  const sample = createSampleSocialImport();
  const csv = isDatabaseConfigured() ? await exportSocialMetricsCsvFromDb() : exportSocialMetricsCsv(sample.snapshots);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="social-metrics.csv"',
    },
  });
}
