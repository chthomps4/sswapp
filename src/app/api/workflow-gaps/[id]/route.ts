import { WorkflowGapStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { updateWorkflowGapStatus } from "@/lib/workflow-audit";

const statusMap: Record<string, WorkflowGapStatus> = {
  new: WorkflowGapStatus.NEW,
  reviewed: WorkflowGapStatus.REVIEWED,
  accepted: WorkflowGapStatus.ACCEPTED,
  in_progress: WorkflowGapStatus.IN_PROGRESS,
  resolved: WorkflowGapStatus.RESOLVED,
  ignored: WorkflowGapStatus.IGNORED,
  converted_to_task: WorkflowGapStatus.CONVERTED_TO_TASK,
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { id } = await context.params;
  const json = await request.json().catch(() => null);
  const status = json?.status ? statusMap[String(json.status)] : undefined;
  if (!status) return NextResponse.json({ message: "Invalid workflow gap status." }, { status: 400 });
  const gap = await updateWorkflowGapStatus(id, status);
  return NextResponse.json({ gap });
}
