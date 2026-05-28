import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { canTransitionApproval, seedPosts } from "@/lib/content-engine";
import { isDatabaseConfigured, updatePostStatus } from "@/lib/db-operational";
import { statusPatchSchema } from "@/lib/schemas";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { id } = await context.params;
  const json = await request.json().catch(() => null);
  const parsed = statusPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid status payload.", issues: parsed.error.issues }, { status: 400 });
  }

  if (isDatabaseConfigured()) {
    try {
      const post = await updatePostStatus(id, parsed.data.status, parsed.data.reviewer || "owner", parsed.data.notes || "");
      if (!post) return NextResponse.json({ message: "Post not found." }, { status: 404 });
      return NextResponse.json({
        post,
        approvalEvent: {
          postId: id,
          toStatus: parsed.data.status,
          reviewer: parsed.data.reviewer || "owner",
          notes: parsed.data.notes || "",
        },
      });
    } catch (error) {
      return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to update post status." }, { status: 409 });
    }
  }

  const post = seedPosts.find((item) => item.id === id);
  if (!post) return NextResponse.json({ message: "Post not found." }, { status: 404 });

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
