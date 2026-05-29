import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; rowId: string }> }) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { id, rowId } = await context.params;
  const json = await request.json().catch(() => ({}));
  const action = String(json.action || "manual_match");
  if (!["manual_match", "create_social_post", "ignore_row"].includes(action)) {
    return NextResponse.json({ message: "Unsupported row match action." }, { status: 400 });
  }

  return NextResponse.json({
    importId: id,
    rowId,
    action,
    matchedPostDraftId: json.postDraftId || "",
    matchedSocialPostId: json.socialPostId || "",
    status: action === "ignore_row" ? "ignored" : "valid",
  });
}
