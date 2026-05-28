import { NextResponse } from "next/server";
import { createImportPreview } from "@/lib/social-dashboard-engine";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ message: "Missing CSV file." }, { status: 400 });
      if (!file.name.toLowerCase().endsWith(".csv")) return NextResponse.json({ message: "Only CSV upload is supported in v1." }, { status: 415 });
      const preview = createImportPreview({
        content: await file.text(),
        filename: file.name,
        method: "csv_upload",
        brandSlug: String(form.get("brandSlug") || ""),
        platformSlug: String(form.get("platformSlug") || ""),
        socialAccountId: String(form.get("socialAccountId") || ""),
      });
      return NextResponse.json({ preview });
    }

    const json = await request.json();
    const preview = createImportPreview({
      content: String(json.content || ""),
      filename: String(json.filename || "pasted-social-dashboard.csv"),
      method: json.method === "csv_upload" ? "csv_upload" : "pasted_table",
      brandSlug: json.brandSlug,
      platformSlug: json.platformSlug,
      socialAccountId: json.socialAccountId,
    });
    return NextResponse.json({ preview });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to parse import." }, { status: 400 });
  }
}
