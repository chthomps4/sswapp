import { NextResponse } from "next/server";
import { createSampleDailyContentPack, exportImagePromptsJson } from "@/lib/automation-engine";

export async function GET() {
  return new NextResponse(exportImagePromptsJson(createSampleDailyContentPack()), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="image-prompts.json"',
    },
  });
}
