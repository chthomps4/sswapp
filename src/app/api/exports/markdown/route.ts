import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { exportMarkdownReview, seedPosts } from "@/lib/content-engine";
import { exportReviewMarkdownFromDb, isDatabaseConfigured } from "@/lib/db-operational";

export async function GET(request: Request) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const contentPackId = searchParams.get("contentPackId") || undefined;
  const markdown = isDatabaseConfigured() ? await exportReviewMarkdownFromDb(contentPackId) : exportMarkdownReview(seedPosts);
  return new NextResponse(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": 'attachment; filename="sswapp-review-pack.md"',
    },
  });
}
