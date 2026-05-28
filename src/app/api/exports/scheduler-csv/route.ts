import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { createSampleDailyContentPack, exportSchedulerCsv } from "@/lib/automation-engine";
import { exportSchedulerCsvFromDb, isDatabaseConfigured } from "@/lib/db-operational";

export async function GET(request: Request) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const contentPackId = searchParams.get("contentPackId") || undefined;
  const csv = isDatabaseConfigured() ? await exportSchedulerCsvFromDb(contentPackId) : exportSchedulerCsv(createSampleDailyContentPack());
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="approved-scheduler-posts.csv"',
    },
  });
}
