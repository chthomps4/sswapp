import { NextResponse } from "next/server";
import { confirmImport, createSampleSocialImport, type SocialDashboardImportRecord } from "@/lib/social-dashboard-engine";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const json = await request.json().catch(() => ({}));
  const preview = json.preview as SocialDashboardImportRecord | undefined;
  const result = preview ? confirmImport(preview) : createSampleSocialImport();

  return NextResponse.json({
    ...result,
    import: { ...result.import, id },
  });
}
