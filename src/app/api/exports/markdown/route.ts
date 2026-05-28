import { NextResponse } from "next/server";
import { exportMarkdownReview, seedPosts } from "@/lib/content-engine";

export async function GET() {
  return new NextResponse(exportMarkdownReview(seedPosts), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": 'attachment; filename="sswapp-review-pack.md"',
    },
  });
}
