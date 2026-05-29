import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { confirmPersistedSocialImport, isDatabaseConfigured } from "@/lib/db-operational";
import { confirmImport, createSampleSocialImport, type SocialDashboardImportRecord } from "@/lib/social-dashboard-engine";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { id } = await context.params;
  const json = await request.json().catch(() => ({}));
  if (isDatabaseConfigured()) {
    try {
      const result = await confirmPersistedSocialImport(id);
      return NextResponse.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import could not be confirmed.";
      const status = message.toLowerCase().includes("not found") ? 404 : 400;
      return NextResponse.json({ message }, { status });
    }
  }
  const preview = json.preview as SocialDashboardImportRecord | undefined;
  const result = preview ? confirmImport(preview) : createSampleSocialImport();

  return NextResponse.json({
    ...result,
    import: { ...result.import, id },
  });
}
