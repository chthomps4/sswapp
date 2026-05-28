import { NextResponse } from "next/server";
import { canTransitionApproval, seedPosts } from "@/lib/content-engine";
import { statusPatchSchema } from "@/lib/schemas";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const post = seedPosts.find((item) => item.id === id);
  if (!post) return NextResponse.json({ message: "Post not found." }, { status: 404 });

  const json = await request.json().catch(() => null);
  const parsed = statusPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid status payload.", issues: parsed.error.issues }, { status: 400 });
  }

  if (!canTransitionApproval(post.approvalStatus, parsed.data.status)) {
    return NextResponse.json({ message: "Invalid approval status transition." }, { status: 409 });
  }

  return NextResponse.json({
    post: { ...post, approvalStatus: parsed.data.status },
    approvalEvent: {
      postId: id,
      fromStatus: post.approvalStatus,
      toStatus: parsed.data.status,
      reviewer: parsed.data.reviewer || "owner",
      notes: parsed.data.notes || "",
    },
  });
}
