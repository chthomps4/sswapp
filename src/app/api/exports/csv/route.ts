import { NextResponse } from "next/server";
import { approvedOnly, seedPosts, stringifyPostsCsv } from "@/lib/content-engine";

export async function GET() {
  return new NextResponse(stringifyPostsCsv(approvedOnly(seedPosts)), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="sswapp-approved-posts.csv"',
    },
  });
}
