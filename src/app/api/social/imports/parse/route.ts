import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { createImportPreview } from "@/lib/social-dashboard-engine";
import { isDatabaseConfigured, persistSocialImportPreview } from "@/lib/db-operational";

function maxImportBytes() {
  const value = Number(process.env.SOCIAL_IMPORT_MAX_BYTES || 1024 * 1024);
  return Number.isFinite(value) && value > 0 ? value : 1024 * 1024;
}

export async function POST(request: Request) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ message: "Missing CSV file." }, { status: 400 });
      if (!file.name.toLowerCase().endsWith(".csv")) return NextResponse.json({ message: "Only CSV upload is supported in v1." }, { status: 415 });
      if (file.size > maxImportBytes()) return NextResponse.json({ message: "Import file exceeds SOCIAL_IMPORT_MAX_BYTES." }, { status: 413 });
      const input = {
        content: await file.text(),
        filename: file.name,
        method: "csv_upload" as const,
        brandSlug: String(form.get("brandSlug") || ""),
        platformSlug: String(form.get("platformSlug") || ""),
        socialAccountId: String(form.get("socialAccountId") || ""),
        mimeType: file.type,
      };
      const preview = isDatabaseConfigured() ? await persistSocialImportPreview(input) : createImportPreview(input);
      return NextResponse.json({ preview });
    }

    const json = await request.json();
    const content = String(json.content || "");
    if (Buffer.byteLength(content, "utf8") > maxImportBytes()) return NextResponse.json({ message: "Import content exceeds SOCIAL_IMPORT_MAX_BYTES." }, { status: 413 });
    const input = {
      content,
      filename: String(json.filename || "pasted-social-dashboard.csv"),
      method: json.method === "csv_upload" ? ("csv_upload" as const) : ("pasted_table" as const),
      brandSlug: json.brandSlug,
      platformSlug: json.platformSlug,
      socialAccountId: json.socialAccountId,
    };
    const preview = isDatabaseConfigured() ? await persistSocialImportPreview(input) : createImportPreview(input);
    return NextResponse.json({ preview });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to parse import." }, { status: 400 });
  }
}
