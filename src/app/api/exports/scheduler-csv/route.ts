import { NextResponse } from "next/server";
import { createSampleDailyContentPack, exportSchedulerCsv } from "@/lib/automation-engine";

export async function GET() {
  return new NextResponse(exportSchedulerCsv(createSampleDailyContentPack()), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="approved-scheduler-posts.csv"',
    },
  });
}
