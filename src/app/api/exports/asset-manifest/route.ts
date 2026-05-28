import { NextResponse } from "next/server";
import { createSampleDailyContentPack, exportAssetManifestJson } from "@/lib/automation-engine";

export async function GET() {
  return new NextResponse(exportAssetManifestJson(createSampleDailyContentPack()), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="manifest.json"',
    },
  });
}
