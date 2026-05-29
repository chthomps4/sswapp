import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  AutomationStatus,
  AutomationType,
  ContentStatus,
  SocialImportStatus,
  SocialInsightStatus,
  SocialPostStatus,
  WorkflowAuditCheckpointStatus,
  WorkflowAuditStatus,
  WorkflowAuditTriggerType,
  WorkflowGapActionStatus,
  WorkflowGapSeverity,
  WorkflowGapStatus,
  WorkflowReadinessLevel,
  Prisma,
} from "@prisma/client";
import { automationRecipes } from "./automation-recipes";
import { isClerkConfigured } from "./auth";
import { isDatabaseConfigured } from "./db-operational";
import { prisma } from "./prisma";
import { promptRegistry } from "./prompts/promptRegistry";

export type WorkflowGapCategory =
  | "automation_failure"
  | "partial_automation_run"
  | "stalled_content_pack"
  | "stale_approval"
  | "missing_image_prompt"
  | "missing_alt_text"
  | "missing_filename"
  | "missing_asset"
  | "approved_not_exported"
  | "posted_without_metrics"
  | "imported_not_confirmed"
  | "import_errors_unresolved"
  | "unmatched_social_posts"
  | "missing_metric_snapshots"
  | "missing_weekly_analysis"
  | "missing_performance_context"
  | "stale_prompt_context"
  | "weak_content_coverage"
  | "brand_under_posted"
  | "platform_under_used"
  | "content_pillar_imbalance"
  | "campaign_inactive_or_stale"
  | "offer_not_supported_by_content"
  | "failed_export"
  | "duplicate_records"
  | "orphan_records"
  | "env_config_gap"
  | "auth_privacy_gap"
  | "ai_fallback_gap"
  | "test_coverage_gap"
  | "documentation_gap"
  | "security_privacy_risk";

export type WorkflowGapInput = {
  category: WorkflowGapCategory;
  severity: WorkflowGapSeverity;
  title: string;
  description: string;
  evidenceJson?: Prisma.InputJsonValue;
  affectedEntityType?: string;
  affectedEntityId?: string;
  affectedBrandId?: string;
  affectedPlatformId?: string;
  recommendation: string;
  suggestedOwner?: string;
  suggestedDueDate?: Date;
};

export type WorkflowCheckpointResult = {
  checkpointKey: string;
  checkpointName: string;
  category: string;
  status: WorkflowAuditCheckpointStatus;
  summary: string;
  recordsChecked: number;
  gaps: WorkflowGapInput[];
  durationMs: number;
  error?: string;
};

export type WorkflowAuditInput = {
  dateRangeStart?: string | Date;
  dateRangeEnd?: string | Date;
  includeAiSummary?: boolean;
  includeArchived?: boolean;
  dryRun?: boolean;
  triggerType?: "manual" | "scheduled" | "cron" | "github_actions" | "post_deploy" | "test";
};

const severityWeight: Record<WorkflowGapSeverity, number> = {
  [WorkflowGapSeverity.CRITICAL]: 25,
  [WorkflowGapSeverity.HIGH]: 10,
  [WorkflowGapSeverity.MEDIUM]: 4,
  [WorkflowGapSeverity.LOW]: 1,
};

const generatingAutomationTypes: AutomationType[] = [
  AutomationType.RUN_TODAY,
  AutomationType.DAILY_CONTENT_PACK,
  AutomationType.IMAGE_PROMPT_BATCH,
  AutomationType.WEEKLY_SOCIAL_ANALYSIS,
  AutomationType.APPROVAL_EXPORT,
  AutomationType.ASSET_MANIFEST_EXPORT,
  AutomationType.WEEKLY_WORKFLOW_GAP_AUDIT,
];

function daysAgo(days: number, end = new Date()) {
  const date = new Date(end);
  date.setDate(date.getDate() - days);
  return date;
}

function olderThan(date: Date, days: number, now = new Date()) {
  return date.getTime() < daysAgo(days, now).getTime();
}

function toDate(value: string | Date | undefined, fallback: Date) {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function triggerType(value: WorkflowAuditInput["triggerType"]) {
  const map: Record<NonNullable<WorkflowAuditInput["triggerType"]>, WorkflowAuditTriggerType> = {
    manual: WorkflowAuditTriggerType.MANUAL,
    scheduled: WorkflowAuditTriggerType.SCHEDULED,
    cron: WorkflowAuditTriggerType.CRON,
    github_actions: WorkflowAuditTriggerType.GITHUB_ACTIONS,
    post_deploy: WorkflowAuditTriggerType.POST_DEPLOY,
    test: WorkflowAuditTriggerType.TEST,
  };
  return map[value || "manual"];
}

export function redactSensitive(value: string) {
  return value
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[REDACTED_DATABASE_URL]")
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, "[REDACTED_OPENAI_KEY]")
    .replace(/(?:CLERK|OPENAI|DATABASE|DIRECT|CRON|SECRET|TOKEN|KEY)[A-Z0-9_]*=([^\s"']+)/gi, (match) => match.split("=")[0] + "=[REDACTED]")
    .slice(0, 1800);
}

function gap(input: WorkflowGapInput): WorkflowGapInput {
  return {
    suggestedOwner: "owner",
    suggestedDueDate: input.severity === WorkflowGapSeverity.CRITICAL || input.severity === WorkflowGapSeverity.HIGH ? daysAgo(-2) : daysAgo(-7),
    ...input,
  };
}

export function scoreWorkflowHealth(gaps: Pick<WorkflowGapInput, "severity">[]) {
  const counts = {
    criticalCount: gaps.filter((item) => item.severity === WorkflowGapSeverity.CRITICAL).length,
    highCount: gaps.filter((item) => item.severity === WorkflowGapSeverity.HIGH).length,
    mediumCount: gaps.filter((item) => item.severity === WorkflowGapSeverity.MEDIUM).length,
    lowCount: gaps.filter((item) => item.severity === WorkflowGapSeverity.LOW).length,
  };
  const score = Math.max(
    0,
    100 -
      gaps.reduce((sum, item) => {
        return sum + severityWeight[item.severity];
      }, 0),
  );
  const readinessLevel = score >= 85 ? WorkflowReadinessLevel.GREEN : score >= 60 ? WorkflowReadinessLevel.YELLOW : WorkflowReadinessLevel.RED;
  return { overallHealthScore: score, readinessLevel, ...counts, totalGaps: gaps.length };
}

function checkpointStatus(gaps: WorkflowGapInput[], error?: string) {
  if (error) return WorkflowAuditCheckpointStatus.FAILED;
  if (gaps.some((item) => item.severity === WorkflowGapSeverity.CRITICAL || item.severity === WorkflowGapSeverity.HIGH)) return WorkflowAuditCheckpointStatus.FAILED;
  if (gaps.length) return WorkflowAuditCheckpointStatus.WARNING;
  return WorkflowAuditCheckpointStatus.PASSED;
}

async function runCheckpoint(
  checkpointKey: string,
  checkpointName: string,
  category: string,
  fn: () => Promise<{ recordsChecked: number; gaps: WorkflowGapInput[]; summary?: string }>,
): Promise<WorkflowCheckpointResult> {
  const started = Date.now();
  try {
    const result = await fn();
    return {
      checkpointKey,
      checkpointName,
      category,
      status: checkpointStatus(result.gaps),
      summary: result.summary || `${result.gaps.length} gap(s) found across ${result.recordsChecked} record(s).`,
      recordsChecked: result.recordsChecked,
      gaps: result.gaps,
      durationMs: Date.now() - started,
    };
  } catch (error) {
    const safeError = redactSensitive(error instanceof Error ? error.message : "Checkpoint failed.");
    return {
      checkpointKey,
      checkpointName,
      category,
      status: WorkflowAuditCheckpointStatus.FAILED,
      summary: "Checkpoint failed before completion.",
      recordsChecked: 0,
      gaps: [
        gap({
          category: "automation_failure",
          severity: WorkflowGapSeverity.HIGH,
          title: `${checkpointName} failed`,
          description: safeError,
          recommendation: "Inspect the checkpoint error and rerun the weekly workflow gap audit after fixing it.",
        }),
      ],
      durationMs: Date.now() - started,
      error: safeError,
    };
  }
}

async function detectAutomationRunGaps(start: Date, end: Date) {
  const runs = await prisma.automationRun.findMany({
    where: { createdAt: { gte: start, lte: end }, type: { not: AutomationType.WEEKLY_WORKFLOW_GAP_AUDIT } },
    orderBy: { createdAt: "desc" },
  });
  const gaps: WorkflowGapInput[] = [];
  const failed = runs.filter((run) => run.status === AutomationStatus.FAILED);
  const partial = runs.filter((run) => run.status === AutomationStatus.PARTIAL);
  const stuck = runs.filter((run) => run.status === AutomationStatus.RUNNING && run.startedAt && olderThan(run.startedAt, 1 / 24, end));

  for (const run of failed) {
    gaps.push(
      gap({
        category: "automation_failure",
        severity: run.type === AutomationType.RUN_TODAY ? WorkflowGapSeverity.CRITICAL : WorkflowGapSeverity.HIGH,
        title: `${run.type.toLowerCase()} failed`,
        description: `Automation run ${run.id} failed during the audit range.`,
        evidenceJson: { automationRunId: run.id, type: run.type, error: redactSensitive(run.error || "") },
        affectedEntityType: "AutomationRun",
        affectedEntityId: run.id,
        recommendation: "Open the failed automation run, fix the root cause, and rerun the workflow manually.",
      }),
    );
  }

  for (const run of partial) {
    gaps.push(
      gap({
        category: "partial_automation_run",
        severity: WorkflowGapSeverity.MEDIUM,
        title: `${run.type.toLowerCase()} finished partially`,
        description: `Automation run ${run.id} completed with partial output.`,
        evidenceJson: { automationRunId: run.id, type: run.type },
        affectedEntityType: "AutomationRun",
        affectedEntityId: run.id,
        recommendation: "Review recordsCreated and rerun only the missing step if it is safe.",
      }),
    );
  }

  for (const run of stuck) {
    gaps.push(
      gap({
        category: "automation_failure",
        severity: WorkflowGapSeverity.HIGH,
        title: `${run.type.toLowerCase()} appears stuck`,
        description: `Automation run ${run.id} has been running longer than expected.`,
        evidenceJson: { automationRunId: run.id, startedAt: run.startedAt?.toISOString() },
        affectedEntityType: "AutomationRun",
        affectedEntityId: run.id,
        recommendation: "Mark the stuck run failed after confirming no worker is still processing it.",
      }),
    );
  }

  for (const run of runs.filter((item) => item.status === AutomationStatus.SUCCEEDED && generatingAutomationTypes.includes(item.type) && !item.recordsCreated)) {
    gaps.push(
      gap({
        category: "automation_failure",
        severity: WorkflowGapSeverity.LOW,
        title: `${run.type.toLowerCase()} is missing recordsCreated metadata`,
        description: "Successful automation runs should show which records they created so failures are auditable later.",
        affectedEntityType: "AutomationRun",
        affectedEntityId: run.id,
        recommendation: "Update the automation to store recordsCreated counts and IDs.",
      }),
    );
  }

  if (process.env.ENABLE_AI_CONTENT_GENERATION === "true") {
    for (const run of runs.filter((item) => item.modelUsed?.includes("rule-based-local"))) {
      gaps.push(
        gap({
          category: "ai_fallback_gap",
          severity: WorkflowGapSeverity.LOW,
          title: `${run.type.toLowerCase()} used deterministic fallback`,
          description: "AI content generation is enabled, but this run used the local fallback.",
          affectedEntityType: "AutomationRun",
          affectedEntityId: run.id,
          recommendation: "Confirm this was intentional or inspect OpenAI/API errors for the run.",
        }),
      );
    }
  }

  return { recordsChecked: runs.length, gaps, summary: `${failed.length} failed, ${partial.length} partial, ${stuck.length} stuck automation run(s).` };
}

async function detectContentWorkflowGaps(end: Date) {
  const packs = await prisma.contentPack.findMany({
    where: { createdAt: { gte: daysAgo(30, end), lte: end } },
    include: { postDrafts: { include: { imagePrompts: true } }, approvals: true },
    orderBy: { createdAt: "desc" },
  });
  const gaps: WorkflowGapInput[] = [];
  for (const pack of packs) {
    if (pack.postDrafts.length === 0) {
      gaps.push(
        gap({
          category: "stalled_content_pack",
          severity: WorkflowGapSeverity.HIGH,
          title: "Content pack has zero posts",
          description: `${pack.title} was created without any PostDraft records.`,
          affectedEntityType: "ContentPack",
          affectedEntityId: pack.id,
          recommendation: "Rerun Run Today or archive this empty pack so it does not confuse reporting.",
        }),
      );
    }
    const reviewPackStatuses: ContentStatus[] = [ContentStatus.DRAFT, ContentStatus.NEEDS_REVIEW];
    if (reviewPackStatuses.includes(pack.status) && olderThan(pack.createdAt, 7, end)) {
      gaps.push(
        gap({
          category: "stalled_content_pack",
          severity: WorkflowGapSeverity.MEDIUM,
          title: "Content pack is stale in review",
          description: `${pack.title} has been in ${pack.status.toLowerCase()} for more than 7 days.`,
          affectedEntityType: "ContentPack",
          affectedEntityId: pack.id,
          recommendation: "Approve, revise, export, or archive the pack during the next content ops pass.",
        }),
      );
    }
    if (pack.approvals.length === 0) {
      gaps.push(
        gap({
          category: "stale_approval",
          severity: WorkflowGapSeverity.MEDIUM,
          title: "Content pack has no approval records",
          description: `${pack.title} cannot move through review cleanly without Approval rows.`,
          affectedEntityType: "ContentPack",
          affectedEntityId: pack.id,
          recommendation: "Create approval records for copy, image prompts, and full posts.",
        }),
      );
    }
    const postsMissingImages = pack.postDrafts.filter((draft) => draft.imagePrompts.length === 0);
    if (postsMissingImages.length) {
      gaps.push(
        gap({
          category: "missing_image_prompt",
          severity: WorkflowGapSeverity.MEDIUM,
          title: "Content pack has posts missing image prompts",
          description: `${postsMissingImages.length} post(s) in ${pack.title} do not have image prompt records.`,
          evidenceJson: { postDraftIds: postsMissingImages.map((draft) => draft.id) },
          affectedEntityType: "ContentPack",
          affectedEntityId: pack.id,
          recommendation: "Run the image prompt batch automation for this pack.",
        }),
      );
    }
  }
  return { recordsChecked: packs.length, gaps };
}

async function detectPostQualityGaps(end: Date) {
  const drafts = await prisma.postDraft.findMany({
    where: { createdAt: { gte: daysAgo(14, end), lte: end } },
    include: { imagePrompts: true },
  });
  const gaps: WorkflowGapInput[] = [];
  const bodyFingerprints = new Map<string, string[]>();
  for (const draft of drafts) {
    const missing = [
      !draft.hook && "hook",
      !draft.body && "body",
      !draft.ctaSoft && !draft.ctaDirect && "CTA",
      !draft.contentPillarId && "content pillar",
      !draft.brandId && "brand",
      !draft.platformId && "platform",
    ].filter(Boolean);
    if (missing.length) {
      gaps.push(
        gap({
          category: "weak_content_coverage",
          severity: draft.status === ContentStatus.APPROVED ? WorkflowGapSeverity.CRITICAL : WorkflowGapSeverity.LOW,
          title: "Post draft is missing required copy fields",
          description: `PostDraft ${draft.id} is missing ${missing.join(", ")}.`,
          affectedEntityType: "PostDraft",
          affectedEntityId: draft.id,
          recommendation: "Fill the missing copy fields before approving or exporting this post.",
        }),
      );
    }
    if (draft.imagePrompts.length && !draft.altText) {
      gaps.push(
        gap({
          category: "missing_alt_text",
          severity: draft.status === ContentStatus.APPROVED ? WorkflowGapSeverity.HIGH : WorkflowGapSeverity.MEDIUM,
          title: "Post with image prompt is missing alt text",
          description: "Image-supported social posts need plain-language alt text before export.",
          affectedEntityType: "PostDraft",
          affectedEntityId: draft.id,
          recommendation: "Add alt text that describes the visual and the useful signal.",
        }),
      );
    }
    if (draft.status === ContentStatus.APPROVED && !draft.finalCopy && !draft.body) {
      gaps.push(
        gap({
          category: "approved_not_exported",
          severity: WorkflowGapSeverity.CRITICAL,
          title: "Approved post is missing export-ready copy",
          description: `Approved PostDraft ${draft.id} does not have finalCopy or body text.`,
          affectedEntityType: "PostDraft",
          affectedEntityId: draft.id,
          recommendation: "Add final copy or move the post back to needs_revision.",
        }),
      );
    }
    if (draft.status === ContentStatus.NEEDS_REVISION && !draft.reviewerNotes) {
      gaps.push(
        gap({
          category: "stale_approval",
          severity: WorkflowGapSeverity.LOW,
          title: "Revision request has no reviewer notes",
          description: "A needs_revision post should explain what needs changing.",
          affectedEntityType: "PostDraft",
          affectedEntityId: draft.id,
          recommendation: "Add reviewer notes before the next rewrite pass.",
        }),
      );
    }
    const fingerprint = draft.body.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 160);
    if (fingerprint.length > 60) bodyFingerprints.set(fingerprint, [...(bodyFingerprints.get(fingerprint) || []), draft.id]);
  }
  for (const [fingerprint, draftIds] of bodyFingerprints.entries()) {
    if (draftIds.length > 1) {
      gaps.push(
        gap({
          category: "weak_content_coverage",
          severity: WorkflowGapSeverity.LOW,
          title: "Nearly identical post bodies found",
          description: "Platform-native content should not duplicate the same body across channels.",
          evidenceJson: { fingerprint, postDraftIds: draftIds },
          recommendation: "Rewrite repeated posts for each platform before approval.",
        }),
      );
    }
  }
  return { recordsChecked: drafts.length, gaps };
}

async function detectImagePromptGaps(end: Date) {
  const prompts = await prisma.imagePrompt.findMany({
    where: { createdAt: { gte: daysAgo(30, end), lte: end } },
    include: { creativeAssets: true, postDraft: true },
  });
  const gaps: WorkflowGapInput[] = [];
  const filenames = new Map<string, string[]>();
  for (const prompt of prompts) {
    if (!prompt.prompt) {
      gaps.push(
        gap({
          category: "missing_image_prompt",
          severity: WorkflowGapSeverity.MEDIUM,
          title: "Image prompt has no prompt text",
          description: "Design/export automation cannot use an empty image prompt.",
          affectedEntityType: "ImagePrompt",
          affectedEntityId: prompt.id,
          recommendation: "Regenerate or manually write the prompt before asset creation.",
        }),
      );
    }
    if (!prompt.altText) {
      gaps.push(
        gap({
          category: "missing_alt_text",
          severity: prompt.status === ContentStatus.APPROVED ? WorkflowGapSeverity.HIGH : WorkflowGapSeverity.MEDIUM,
          title: "Image prompt is missing alt text",
          description: "Every visual instruction should carry accessible alt text.",
          affectedEntityType: "ImagePrompt",
          affectedEntityId: prompt.id,
          recommendation: "Add plain-language alt text before approval/export.",
        }),
      );
    }
    if (!prompt.filename) {
      gaps.push(
        gap({
          category: "missing_filename",
          severity: prompt.status === ContentStatus.APPROVED ? WorkflowGapSeverity.HIGH : WorkflowGapSeverity.LOW,
          title: "Image prompt is missing filename",
          description: "Asset manifest export depends on stable filenames.",
          affectedEntityType: "ImagePrompt",
          affectedEntityId: prompt.id,
          recommendation: "Generate a filename using the documented asset naming convention.",
        }),
      );
    } else {
      filenames.set(prompt.filename, [...(filenames.get(prompt.filename) || []), prompt.id]);
    }
    if (prompt.status === ContentStatus.APPROVED && prompt.creativeAssets.length === 0 && olderThan(prompt.updatedAt, 3, end)) {
      gaps.push(
        gap({
          category: "missing_asset",
          severity: WorkflowGapSeverity.HIGH,
          title: "Approved image prompt has no creative asset",
          description: "Approved visual instructions have not become a tracked creative asset.",
          affectedEntityType: "ImagePrompt",
          affectedEntityId: prompt.id,
          recommendation: "Create or attach the asset, or move the image prompt back to needs_review.",
        }),
      );
    }
  }
  for (const [filename, ids] of filenames.entries()) {
    if (ids.length > 1) {
      gaps.push(
        gap({
          category: "duplicate_records",
          severity: WorkflowGapSeverity.HIGH,
          title: "Duplicate image prompt filenames",
          description: `${filename} is used by multiple image prompts.`,
          evidenceJson: { filename, imagePromptIds: ids },
          recommendation: "Rename duplicate assets before exporting the manifest.",
        }),
      );
    }
  }
  return { recordsChecked: prompts.length, gaps };
}

async function detectApprovalGaps(end: Date) {
  const approvals = await prisma.approval.findMany({
    where: { createdAt: { lte: end } },
    include: { postDraft: true, imagePrompt: true, creativeAsset: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const gaps: WorkflowGapInput[] = [];
  if (process.env.ENABLE_AUTO_APPROVAL === "true") {
    gaps.push(
      gap({
        category: "auth_privacy_gap",
        severity: WorkflowGapSeverity.CRITICAL,
        title: "Auto approval feature flag is enabled",
        description: "Generated content must never be automatically approved in this private app.",
        recommendation: "Set ENABLE_AUTO_APPROVAL=false immediately.",
      }),
    );
  }
  for (const approval of approvals) {
    if (approval.status === "PENDING" && olderThan(approval.createdAt, 7, end)) {
      gaps.push(
        gap({
          category: "stale_approval",
          severity: WorkflowGapSeverity.MEDIUM,
          title: "Approval has been pending too long",
          description: `Approval ${approval.id} has been pending for more than 7 days.`,
          affectedEntityType: "Approval",
          affectedEntityId: approval.id,
          recommendation: "Review, approve, request revision, reject, or archive the linked item.",
        }),
      );
    }
    if (!approval.postDraft && !approval.imagePrompt && !approval.creativeAsset && !approval.contentPackId) {
      gaps.push(
        gap({
          category: "orphan_records",
          severity: WorkflowGapSeverity.HIGH,
          title: "Approval points to no reviewable entity",
          description: `Approval ${approval.id} is not linked to a post, image prompt, asset, or content pack.`,
          affectedEntityType: "Approval",
          affectedEntityId: approval.id,
          recommendation: "Delete or repair the orphan approval after confirming it is not needed.",
        }),
      );
    }
    if (approval.status === "APPROVED" && !approval.reviewer) {
      gaps.push(
        gap({
          category: "auth_privacy_gap",
          severity: WorkflowGapSeverity.CRITICAL,
          title: "Approval record lacks explicit reviewer",
          description: "Approved records should show a human reviewer to avoid accidental auto-approval ambiguity.",
          affectedEntityType: "Approval",
          affectedEntityId: approval.id,
          recommendation: "Add reviewer metadata or move the item back to pending review.",
        }),
      );
    }
  }
  return { recordsChecked: approvals.length, gaps };
}

async function detectExportGaps(end: Date) {
  const approved = await prisma.postDraft.findMany({
    where: { status: ContentStatus.APPROVED },
    include: { imagePrompts: true },
    take: 500,
  });
  const recentExports = await prisma.automationRun.count({
    where: { createdAt: { gte: daysAgo(7, end), lte: end }, type: { in: [AutomationType.APPROVAL_EXPORT, AutomationType.ASSET_MANIFEST_EXPORT] }, status: AutomationStatus.SUCCEEDED },
  });
  const gaps: WorkflowGapInput[] = [];
  for (const draft of approved) {
    if (!draft.finalCopy && !draft.body) {
      gaps.push(
        gap({
          category: "approved_not_exported",
          severity: WorkflowGapSeverity.HIGH,
          title: "Approved post cannot be exported",
          description: `PostDraft ${draft.id} is approved but missing export-ready copy.`,
          affectedEntityType: "PostDraft",
          affectedEntityId: draft.id,
          recommendation: "Add finalCopy/body or request revision before CSV export.",
        }),
      );
    }
    if (draft.imagePrompts.some((prompt) => !prompt.filename || !prompt.altText)) {
      gaps.push(
        gap({
          category: "missing_filename",
          severity: WorkflowGapSeverity.MEDIUM,
          title: "Approved post has incomplete image prompt export fields",
          description: "Scheduler and image prompt exports need filename and alt text.",
          affectedEntityType: "PostDraft",
          affectedEntityId: draft.id,
          recommendation: "Complete filenames and alt text before exporting.",
        }),
      );
    }
    if (olderThan(draft.updatedAt, 3, end) && recentExports === 0) {
      gaps.push(
        gap({
          category: "approved_not_exported",
          severity: WorkflowGapSeverity.MEDIUM,
          title: "Approved content may not have been exported",
          description: "There are approved posts but no recent export AutomationRun records.",
          affectedEntityType: "PostDraft",
          affectedEntityId: draft.id,
          recommendation: "Run the approved-only scheduler CSV export and record the export run.",
        }),
      );
    }
  }
  return { recordsChecked: approved.length, gaps };
}

async function detectSocialImportGaps(end: Date) {
  const imports = await prisma.socialDashboardImport.findMany({
    where: { createdAt: { gte: daysAgo(30, end), lte: end } },
    include: { rows: true, issues: true, metricSnapshots: true },
  });
  const gaps: WorkflowGapInput[] = [];
  for (const item of imports) {
    const unconfirmedStatuses: SocialImportStatus[] = [SocialImportStatus.UPLOADED, SocialImportStatus.PARSED, SocialImportStatus.NEEDS_MAPPING, SocialImportStatus.READY_TO_IMPORT];
    if (unconfirmedStatuses.includes(item.status) && olderThan(item.createdAt, 7, end)) {
      gaps.push(
        gap({
          category: "imported_not_confirmed",
          severity: WorkflowGapSeverity.LOW,
          title: "Social import is waiting for confirmation",
          description: `${item.originalFilename || item.id} has not been confirmed after 7 days.`,
          affectedEntityType: "SocialDashboardImport",
          affectedEntityId: item.id,
          recommendation: "Confirm, remap, archive, or delete the import.",
        }),
      );
    }
    const failedImportStatuses: SocialImportStatus[] = [SocialImportStatus.FAILED, SocialImportStatus.PARTIALLY_IMPORTED];
    if (failedImportStatuses.includes(item.status)) {
      gaps.push(
        gap({
          category: "import_errors_unresolved",
          severity: item.status === SocialImportStatus.FAILED ? WorkflowGapSeverity.HIGH : WorkflowGapSeverity.MEDIUM,
          title: "Social import has unresolved failure status",
          description: `${item.originalFilename || item.id} is ${item.status.toLowerCase()}.`,
          affectedEntityType: "SocialDashboardImport",
          affectedEntityId: item.id,
          recommendation: "Review import issues, fix mapping/data, then reprocess or archive.",
        }),
      );
    }
    if (item.issues.some((issue) => !issue.resolved)) {
      gaps.push(
        gap({
          category: "import_errors_unresolved",
          severity: WorkflowGapSeverity.MEDIUM,
          title: "Social import has unresolved row issues",
          description: `${item.issues.filter((issue) => !issue.resolved).length} issue(s) still need attention.`,
          affectedEntityType: "SocialDashboardImport",
          affectedEntityId: item.id,
          recommendation: "Resolve or explicitly ignore the import issues.",
        }),
      );
    }
    const importedStatuses: SocialImportStatus[] = [SocialImportStatus.IMPORTED, SocialImportStatus.PARTIALLY_IMPORTED];
    if (importedStatuses.includes(item.status) && item.metricSnapshots.length === 0) {
      gaps.push(
        gap({
          category: "missing_metric_snapshots",
          severity: WorkflowGapSeverity.HIGH,
          title: "Confirmed import created no metric snapshots",
          description: "A confirmed import should create metric snapshots for reporting.",
          affectedEntityType: "SocialDashboardImport",
          affectedEntityId: item.id,
          recommendation: "Reprocess the import or inspect why all rows were invalid/ignored.",
        }),
      );
    }
  }
  const unmatchedPosts = await prisma.socialPost.count({ where: { postDraftId: null, createdAt: { gte: daysAgo(30, end), lte: end } } });
  if (unmatchedPosts) {
    gaps.push(
      gap({
        category: "unmatched_social_posts",
        severity: WorkflowGapSeverity.MEDIUM,
        title: "Imported social posts remain unmatched",
        description: `${unmatchedPosts} SocialPost record(s) are not linked to app-generated drafts.`,
        evidenceJson: { unmatchedPosts },
        recommendation: "Use the import detail/manual matching flow to link or classify unmatched posts.",
      }),
    );
  }
  return { recordsChecked: imports.length, gaps };
}

async function detectMetricsAndInsightGaps(end: Date) {
  const socialPosts = await prisma.socialPost.findMany({
    where: { postedAt: { lte: daysAgo(14, end) }, status: { in: [SocialPostStatus.POSTED, SocialPostStatus.IMPORTED, SocialPostStatus.MATCHED] } },
    include: { metricSnapshots: true },
    take: 500,
  });
  const gaps: WorkflowGapInput[] = [];
  for (const post of socialPosts.filter((item) => item.metricSnapshots.length === 0)) {
    gaps.push(
      gap({
        category: "posted_without_metrics",
        severity: WorkflowGapSeverity.HIGH,
        title: "Social post has no metrics after 14 days",
        description: `${post.title || post.hook || post.id} has no SocialMetricSnapshot records.`,
        affectedEntityType: "SocialPost",
        affectedEntityId: post.id,
        recommendation: "Import platform dashboard metrics or mark this post as intentionally unmeasured.",
      }),
    );
  }
  const lastAnalysis = await prisma.automationRun.findFirst({
    where: { type: AutomationType.WEEKLY_SOCIAL_ANALYSIS, status: AutomationStatus.SUCCEEDED },
    orderBy: { createdAt: "desc" },
  });
  if (!lastAnalysis || olderThan(lastAnalysis.createdAt, 7, end)) {
    gaps.push(
      gap({
        category: "missing_weekly_analysis",
        severity: WorkflowGapSeverity.MEDIUM,
        title: "Weekly social analysis is stale",
        description: "No successful weekly social analysis run was found in the last 7 days.",
        recommendation: "Run weekly social analysis after importing the latest dashboard metrics.",
      }),
    );
  }
  const staleInsights = await prisma.socialPerformanceInsight.count({
    where: { status: SocialInsightStatus.NEW, createdAt: { lte: daysAgo(7, end) } },
  });
  if (staleInsights) {
    gaps.push(
      gap({
        category: "missing_performance_context",
        severity: WorkflowGapSeverity.LOW,
        title: "Performance insights are waiting for review",
        description: `${staleInsights} insight(s) are still new after 7 days.`,
        evidenceJson: { staleInsights },
        recommendation: "Accept, dismiss, or convert useful insights into future content themes.",
      }),
    );
  }
  return { recordsChecked: socialPosts.length + (lastAnalysis ? 1 : 0) + staleInsights, gaps };
}

async function detectBrandCoverageGaps(end: Date) {
  const brands = await prisma.brand.findMany({ where: { active: true } });
  const drafts = await prisma.postDraft.findMany({ where: { createdAt: { gte: daysAgo(30, end), lte: end } }, select: { brandId: true, platformId: true } });
  const brandCounts = new Map<string, number>();
  const platformCounts = new Map<string, number>();
  for (const draft of drafts) {
    brandCounts.set(draft.brandId, (brandCounts.get(draft.brandId) || 0) + 1);
    platformCounts.set(draft.platformId, (platformCounts.get(draft.platformId) || 0) + 1);
  }
  const gaps: WorkflowGapInput[] = [];
  for (const brand of brands) {
    const count = brandCounts.get(brand.id) || 0;
    const expected = brand.slug === "signal-workshop" ? 4 : brand.slug === "local-signal-websites" ? 2 : 1;
    if (count < expected) {
      gaps.push(
        gap({
          category: "brand_under_posted",
          severity: count === 0 ? WorkflowGapSeverity.MEDIUM : WorkflowGapSeverity.LOW,
          title: `${brand.name} coverage is low`,
          description: `${brand.name} has ${count} draft/planned post(s) in the last 30 days.`,
          evidenceJson: { expected, actual: count },
          affectedBrandId: brand.id,
          recommendation: "Add this brand to the next Run Today or monthly content map if it is still active.",
        }),
      );
    }
  }
  const activeCampaigns = await prisma.campaign.findMany({
    where: {
      status: { in: [ContentStatus.DRAFT, ContentStatus.NEEDS_REVIEW, ContentStatus.APPROVED, ContentStatus.SCHEDULED] },
      OR: [{ endDate: null }, { endDate: { gte: daysAgo(30, end) } }],
    },
    include: { postDrafts: true },
  });
  for (const campaign of activeCampaigns.filter((item) => item.postDrafts.length === 0)) {
    gaps.push(
      gap({
        category: "campaign_inactive_or_stale",
        severity: campaign.offer ? WorkflowGapSeverity.HIGH : WorkflowGapSeverity.MEDIUM,
        title: "Active campaign has no supporting posts",
        description: `${campaign.name} is active or draft-ready but has no post drafts.`,
        affectedEntityType: "Campaign",
        affectedEntityId: campaign.id,
        affectedBrandId: campaign.brandId,
        recommendation: "Generate campaign support content or archive the campaign if it is no longer active.",
      }),
    );
  }
  return { recordsChecked: brands.length + activeCampaigns.length + drafts.length, gaps };
}

async function detectPromptAndRecipeGaps() {
  const gaps: WorkflowGapInput[] = [];
  for (const prompt of promptRegistry) {
    const socialPath = join(process.cwd(), "src", "prompts", "social", prompt.filename);
    const systemPath = join(process.cwd(), "src", "prompts", "system", prompt.filename);
    const rootPath = join(process.cwd(), "src", "prompts", prompt.filename);
    if (!existsSync(socialPath) && !existsSync(systemPath) && !existsSync(rootPath)) {
      gaps.push(
        gap({
          category: "automation_failure",
          severity: WorkflowGapSeverity.MEDIUM,
          title: "Prompt registry points to missing file",
          description: `${prompt.key} references ${prompt.filename}, but no matching prompt file was found.`,
          evidenceJson: { promptKey: prompt.key, filename: prompt.filename },
          recommendation: "Restore the prompt template or remove the registry entry.",
        }),
      );
    }
  }
  const requiredRecipes = ["run-today", "weekly-social-analysis", "approval-summary", "weekly-workflow-gap-audit"];
  for (const slug of requiredRecipes) {
    if (!automationRecipes.some((recipe) => recipe.slug === slug && recipe.active)) {
      gaps.push(
        gap({
          category: "automation_failure",
          severity: slug === "run-today" ? WorkflowGapSeverity.HIGH : WorkflowGapSeverity.MEDIUM,
          title: "Required automation recipe is missing or inactive",
          description: `${slug} is required for operational readiness.`,
          recommendation: "Restore or activate the automation recipe.",
        }),
      );
    }
  }
  const runToday = automationRecipes.find((recipe) => recipe.slug === "run-today");
  const requiredSteps = ["select brands", "generate daily pack", "generate image prompts", "create approvals"];
  if (runToday && requiredSteps.some((step) => !runToday.stepsJson.includes(step))) {
    gaps.push(
      gap({
        category: "automation_failure",
        severity: WorkflowGapSeverity.HIGH,
        title: "Run Today recipe is missing required steps",
        description: "Run Today must select brands, generate content, create image prompts, and create approvals.",
        evidenceJson: { steps: runToday.stepsJson },
        recommendation: "Update the recipe before relying on it for daily operations.",
      }),
    );
  }
  return { recordsChecked: promptRegistry.length + automationRecipes.length, gaps };
}

async function detectDataIntegrityGaps(end: Date) {
  const [emptyPacks, orphanSnapshots, duplicateFilenames, succeededNoRecords] = await Promise.all([
    prisma.contentPack.findMany({ where: { createdAt: { gte: daysAgo(30, end), lte: end }, postDrafts: { none: {} } }, select: { id: true, title: true } }),
    prisma.socialMetricSnapshot.count({ where: { socialPostId: null, createdAt: { gte: daysAgo(30, end), lte: end } } }),
    prisma.imagePrompt.groupBy({ by: ["filename"], _count: { filename: true }, having: { filename: { _count: { gt: 1 } } } }),
    prisma.automationRun.findMany({ where: { status: AutomationStatus.SUCCEEDED, recordsCreated: { equals: Prisma.JsonNull }, type: { in: generatingAutomationTypes } }, take: 50 }),
  ]);
  const gaps: WorkflowGapInput[] = [];
  for (const pack of emptyPacks) {
    gaps.push(
      gap({
        category: "orphan_records",
        severity: WorkflowGapSeverity.HIGH,
        title: "Content pack success path has no posts",
        description: `${pack.title} has zero PostDraft records.`,
        affectedEntityType: "ContentPack",
        affectedEntityId: pack.id,
        recommendation: "Rerun the content pack or archive this incomplete record.",
      }),
    );
  }
  if (orphanSnapshots) {
    gaps.push(
      gap({
        category: "orphan_records",
        severity: WorkflowGapSeverity.MEDIUM,
        title: "Metric snapshots are not linked to SocialPost",
        description: `${orphanSnapshots} SocialMetricSnapshot record(s) are missing socialPostId.`,
        evidenceJson: { orphanSnapshots },
        recommendation: "Reprocess affected imports so snapshots link to SocialPost records.",
      }),
    );
  }
  for (const duplicate of duplicateFilenames) {
    gaps.push(
      gap({
        category: "duplicate_records",
        severity: WorkflowGapSeverity.HIGH,
        title: "Duplicate asset filename detected",
        description: `${duplicate.filename} appears ${duplicate._count.filename} times.`,
        evidenceJson: duplicate as unknown as Prisma.InputJsonValue,
        recommendation: "Rename duplicate prompt/assets before export.",
      }),
    );
  }
  for (const run of succeededNoRecords) {
    gaps.push(
      gap({
        category: "automation_failure",
        severity: WorkflowGapSeverity.LOW,
        title: "Successful automation lacks created-record metadata",
        description: `${run.type.toLowerCase()} succeeded without recordsCreated.`,
        affectedEntityType: "AutomationRun",
        affectedEntityId: run.id,
        recommendation: "Store recordsCreated metadata for better weekly audit traceability.",
      }),
    );
  }
  return { recordsChecked: emptyPacks.length + orphanSnapshots + duplicateFilenames.length + succeededNoRecords.length, gaps };
}

async function detectConfigGaps() {
  const gaps: WorkflowGapInput[] = [];
  if (!isDatabaseConfigured()) {
    gaps.push(
      gap({
        category: "env_config_gap",
        severity: WorkflowGapSeverity.HIGH,
        title: "Database is not configured",
        description: "DB-first workflows cannot persist operational records without DATABASE_URL.",
        recommendation: "Set DATABASE_URL and DIRECT_URL, run migrations, and seed the database.",
      }),
    );
  }
  if (!isClerkConfigured() && process.env.NODE_ENV === "production") {
    gaps.push(
      gap({
        category: "auth_privacy_gap",
        severity: WorkflowGapSeverity.CRITICAL,
        title: "Clerk is not configured in production",
        description: "Private app routes must fail closed in production.",
        recommendation: "Set Clerk publishable and secret keys in Vercel.",
      }),
    );
  }
  if (!process.env.OWNER_EMAILS && process.env.NODE_ENV === "production") {
    gaps.push(
      gap({
        category: "auth_privacy_gap",
        severity: WorkflowGapSeverity.HIGH,
        title: "Owner emails are not configured",
        description: "OWNER_EMAILS should be set so route-level owner checks are explicit.",
        recommendation: "Set OWNER_EMAILS to the authorized owner email list.",
      }),
    );
  }
  if (process.env.ENABLE_AUTO_APPROVAL === "true") {
    gaps.push(
      gap({
        category: "security_privacy_risk",
        severity: WorkflowGapSeverity.CRITICAL,
        title: "Auto approval is enabled",
        description: "This violates the human-review boundary.",
        recommendation: "Set ENABLE_AUTO_APPROVAL=false.",
      }),
    );
  }
  if (process.env.ENABLE_AUTO_PUBLISHING === "true") {
    gaps.push(
      gap({
        category: "security_privacy_risk",
        severity: WorkflowGapSeverity.CRITICAL,
        title: "Auto publishing is enabled",
        description: "SSWApp must not publish automatically.",
        recommendation: "Set ENABLE_AUTO_PUBLISHING=false.",
      }),
    );
  }
  if (!process.env.SOCIAL_IMPORT_MAX_BYTES) {
    gaps.push(
      gap({
        category: "env_config_gap",
        severity: WorkflowGapSeverity.LOW,
        title: "Social import max upload size is not configured",
        description: "SOCIAL_IMPORT_MAX_BYTES should cap private dashboard uploads.",
        recommendation: "Set SOCIAL_IMPORT_MAX_BYTES to a conservative byte limit such as 1048576.",
      }),
    );
  }
  if (process.env.ENABLE_AI_METRIC_ANALYSIS === "true") {
    gaps.push(
      gap({
        category: "security_privacy_risk",
        severity: WorkflowGapSeverity.LOW,
        title: "AI metric analysis is enabled",
        description: "This is allowed only for sanitized aggregate summaries. Raw rows must remain blocked.",
        recommendation: "Confirm metric AI prompts use sanitized rollups only before relying on them.",
      }),
    );
  }
  return { recordsChecked: 8, gaps };
}

async function collectCheckpoints(start: Date, end: Date) {
  return Promise.all([
    runCheckpoint("automation-run-health", "Automation Run Health", "automation", () => detectAutomationRunGaps(start, end)),
    runCheckpoint("content-pack-flow", "Content Pack Flow", "content", () => detectContentWorkflowGaps(end)),
    runCheckpoint("post-draft-quality", "Post Draft Quality and Readiness", "content", () => detectPostQualityGaps(end)),
    runCheckpoint("image-prompt-asset-flow", "Image Prompt and Asset Flow", "assets", () => detectImagePromptGaps(end)),
    runCheckpoint("approval-queue-health", "Approval Queue Health", "approval", () => detectApprovalGaps(end)),
    runCheckpoint("export-workflow", "Export Workflow", "exports", () => detectExportGaps(end)),
    runCheckpoint("social-import-workflow", "Social Import Workflow", "imports", () => detectSocialImportGaps(end)),
    runCheckpoint("metrics-insights-flow", "Metrics and Insights Flow", "metrics", () => detectMetricsAndInsightGaps(end)),
    runCheckpoint("brand-platform-coverage", "Brand and Platform Coverage", "coverage", () => detectBrandCoverageGaps(end)),
    runCheckpoint("prompt-recipe-health", "Prompt and Automation Recipe Health", "prompts", detectPromptAndRecipeGaps),
    runCheckpoint("data-integrity", "Data Integrity and Orphan Records", "data", () => detectDataIntegrityGaps(end)),
    runCheckpoint("config-safety-boundary", "Config, Environment, and Safety Boundary", "security", detectConfigGaps),
  ]);
}

export function generateWorkflowAuditSummary(gaps: WorkflowGapInput[], checkpoints: WorkflowCheckpointResult[], score: ReturnType<typeof scoreWorkflowHealth>) {
  const critical = gaps.filter((item) => item.severity === WorkflowGapSeverity.CRITICAL);
  const high = gaps.filter((item) => item.severity === WorkflowGapSeverity.HIGH);
  const failedCheckpoints = checkpoints.filter((item) => item.status === WorkflowAuditCheckpointStatus.FAILED).length;
  const warningCheckpoints = checkpoints.filter((item) => item.status === WorkflowAuditCheckpointStatus.WARNING).length;
  const nextGap = critical[0] || high[0] || gaps[0];
  return {
    auditDate: new Date().toISOString(),
    readinessLevel: score.readinessLevel.toLowerCase(),
    overallHealthScore: score.overallHealthScore,
    executiveSummary:
      gaps.length === 0
        ? "Workflow audit found no active operational gaps. Keep the weekly check running and continue manual review before publishing."
        : `Workflow audit found ${gaps.length} gap(s): ${critical.length} critical, ${high.length} high. ${failedCheckpoints} checkpoint(s) failed and ${warningCheckpoints} warned.`,
    criticalFindings: critical.slice(0, 5).map((item) => item.title),
    highPriorityFindings: high.slice(0, 8).map((item) => item.title),
    workflowGaps: gaps.slice(0, 25).map((item) => ({ category: item.category, severity: item.severity.toLowerCase(), title: item.title })),
    recommendedActions: gaps.slice(0, 10).map((item) => item.recommendation),
    wins: checkpoints.filter((item) => item.status === WorkflowAuditCheckpointStatus.PASSED).map((item) => `${item.checkpointName} passed.`),
    staleItems: gaps.filter((item) => item.category.includes("stale") || item.category.includes("missing")).slice(0, 8).map((item) => item.title),
    automationFailures: gaps.filter((item) => item.category === "automation_failure").slice(0, 8).map((item) => item.title),
    contentGaps: gaps.filter((item) => ["weak_content_coverage", "brand_under_posted", "campaign_inactive_or_stale"].includes(item.category)).slice(0, 8).map((item) => item.title),
    importExportGaps: gaps.filter((item) => item.category.includes("import") || item.category.includes("export")).slice(0, 8).map((item) => item.title),
    metricsGaps: gaps.filter((item) => item.category.includes("metric") || item.category.includes("analysis") || item.category.includes("context")).slice(0, 8).map((item) => item.title),
    privacySafetyNotes: gaps.filter((item) => item.category.includes("privacy") || item.category.includes("security") || item.category.includes("auth")).slice(0, 8).map((item) => item.title),
    nextWeekFocus: nextGap ? nextGap.recommendation : "Keep the current workflow rhythm and continue measuring approved/published content.",
    manualReviewNeeded: gaps.length > 0,
  };
}

export async function runWeeklyWorkflowGapAudit(input: WorkflowAuditInput = {}) {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is required for Weekly Workflow Gap Audit.");
  const now = new Date();
  const dateRangeEnd = toDate(input.dateRangeEnd, now);
  const dateRangeStart = toDate(input.dateRangeStart, daysAgo(7, dateRangeEnd));
  const auditInput = {
    dateRangeStart: dateRangeStart.toISOString(),
    dateRangeEnd: dateRangeEnd.toISOString(),
    includeAiSummary: Boolean(input.includeAiSummary && process.env.ENABLE_AI_WORKFLOW_AUDIT_SUMMARY === "true"),
    includeArchived: Boolean(input.includeArchived),
    dryRun: Boolean(input.dryRun),
    triggerType: input.triggerType || "manual",
  };
  const checkpoints = await collectCheckpoints(dateRangeStart, dateRangeEnd);
  const gaps = checkpoints.flatMap((checkpoint) => checkpoint.gaps);
  const score = scoreWorkflowHealth(gaps);
  const summary = generateWorkflowAuditSummary(gaps, checkpoints, score);

  if (input.dryRun) {
    return { audit: null, gaps, checkpoints, actionItems: [], summary, score, dryRun: true };
  }

  const startedAt = now;
  const completedAt = new Date();
  const status = score.criticalCount || score.highCount ? WorkflowAuditStatus.COMPLETED_WITH_WARNINGS : WorkflowAuditStatus.COMPLETED;
  const runStatus = score.criticalCount || checkpoints.some((item) => item.status === WorkflowAuditCheckpointStatus.FAILED) ? AutomationStatus.PARTIAL : AutomationStatus.SUCCEEDED;
  const automationRun = await prisma.automationRun.create({
    data: {
      type: AutomationType.WEEKLY_WORKFLOW_GAP_AUDIT,
      status: runStatus,
      input: auditInput,
      output: summary as Prisma.InputJsonValue,
      recordsCreated: {
        gaps: gaps.length,
        checkpoints: checkpoints.length,
        critical: score.criticalCount,
        high: score.highCount,
      },
      modelUsed: "rule-based-local",
      startedAt,
      completedAt,
    },
  });
  const audit = await prisma.workflowGapAudit.create({
    data: {
      auditDate: now,
      dateRangeStart,
      dateRangeEnd,
      status,
      triggerType: triggerType(input.triggerType),
      summary: summary.executiveSummary,
      overallHealthScore: score.overallHealthScore,
      readinessLevel: score.readinessLevel,
      totalGaps: score.totalGaps,
      criticalCount: score.criticalCount,
      highCount: score.highCount,
      mediumCount: score.mediumCount,
      lowCount: score.lowCount,
      automationRunId: automationRun.id,
      inputJson: auditInput,
      outputJson: summary as Prisma.InputJsonValue,
      startedAt,
      completedAt,
    },
  });
  await prisma.workflowAuditCheckpoint.createMany({
    data: checkpoints.map((checkpoint) => ({
      auditId: audit.id,
      checkpointKey: checkpoint.checkpointKey,
      checkpointName: checkpoint.checkpointName,
      category: checkpoint.category,
      status: checkpoint.status,
      summary: checkpoint.summary,
      recordsChecked: checkpoint.recordsChecked,
      gapsFound: checkpoint.gaps.length,
      durationMs: checkpoint.durationMs,
      error: checkpoint.error,
    })),
  });
  const createdGaps = [];
  for (const item of gaps) {
    const created = await prisma.workflowGap.create({
      data: {
        auditId: audit.id,
        category: item.category,
        severity: item.severity,
        title: item.title,
        description: item.description,
        evidenceJson: item.evidenceJson,
        affectedEntityType: item.affectedEntityType,
        affectedEntityId: item.affectedEntityId,
        affectedBrandId: item.affectedBrandId,
        affectedPlatformId: item.affectedPlatformId,
        recommendation: item.recommendation,
        suggestedOwner: item.suggestedOwner,
        suggestedDueDate: item.suggestedDueDate,
      },
    });
    createdGaps.push(created);
    await prisma.workflowGapActionItem.create({
      data: {
        auditId: audit.id,
        gapId: created.id,
        title: item.title,
        description: item.description,
        priority: item.severity,
        status: WorkflowGapActionStatus.OPEN,
        linkedEntityType: item.affectedEntityType,
        linkedEntityId: item.affectedEntityId,
        recommendedAction: item.recommendation,
        dueDate: item.suggestedDueDate,
      },
    });
  }
  await prisma.automationRun.update({
    where: { id: automationRun.id },
    data: { recordsCreated: { gaps: gaps.length, checkpoints: checkpoints.length, actionItems: createdGaps.length, auditId: audit.id } },
  });
  const persisted = await getWorkflowGapAudit(audit.id);
  return { audit: persisted, gaps: createdGaps, checkpoints, actionItems: createdGaps.length, summary, score, dryRun: false };
}

export async function listWorkflowGapAudits(limit = 50) {
  if (!isDatabaseConfigured()) return [];
  return prisma.workflowGapAudit.findMany({
    include: { gaps: true, checkpoints: true },
    orderBy: { auditDate: "desc" },
    take: limit,
  });
}

export async function getLatestWorkflowGapAudit() {
  if (!isDatabaseConfigured()) return null;
  return prisma.workflowGapAudit.findFirst({
    include: { gaps: true, checkpoints: true, actionItems: true },
    orderBy: { auditDate: "desc" },
  });
}

export async function getWorkflowGapAudit(id: string) {
  if (!isDatabaseConfigured()) return null;
  return prisma.workflowGapAudit.findUnique({
    where: { id },
    include: {
      gaps: { include: { actionItems: true, affectedBrand: true, affectedPlatform: true }, orderBy: [{ severity: "asc" }, { createdAt: "asc" }] },
      checkpoints: { orderBy: { createdAt: "asc" } },
      actionItems: { orderBy: [{ priority: "asc" }, { createdAt: "asc" }] },
      automationRun: true,
    },
  });
}

export async function listWorkflowGaps() {
  if (!isDatabaseConfigured()) return [];
  return prisma.workflowGap.findMany({
    include: { audit: true, affectedBrand: true, affectedPlatform: true, actionItems: true },
    orderBy: [{ status: "asc" }, { severity: "asc" }, { createdAt: "desc" }],
    take: 500,
  });
}

export async function updateWorkflowGapStatus(id: string, status: WorkflowGapStatus) {
  const updated = await prisma.workflowGap.update({ where: { id }, data: { status }, include: { audit: true } });
  const [resolvedCount, ignoredCount] = await Promise.all([
    prisma.workflowGap.count({ where: { auditId: updated.auditId, status: WorkflowGapStatus.RESOLVED } }),
    prisma.workflowGap.count({ where: { auditId: updated.auditId, status: WorkflowGapStatus.IGNORED } }),
  ]);
  await prisma.workflowGapAudit.update({ where: { id: updated.auditId }, data: { resolvedCount, ignoredCount } });
  return updated;
}

export function workflowAuditReportMarkdown(audit: NonNullable<Awaited<ReturnType<typeof getWorkflowGapAudit>>>) {
  const date = audit.auditDate.toISOString().slice(0, 10);
  const lines = [
    `# Weekly Workflow Gap Audit - ${date}`,
    "",
    `Date range: ${audit.dateRangeStart.toISOString().slice(0, 10)} to ${audit.dateRangeEnd.toISOString().slice(0, 10)}`,
    `Readiness: ${audit.readinessLevel.toLowerCase()}`,
    `Health score: ${audit.overallHealthScore}`,
    `Gaps: ${audit.totalGaps} (${audit.criticalCount} critical, ${audit.highCount} high, ${audit.mediumCount} medium, ${audit.lowCount} low)`,
    "",
    "## Executive Summary",
    "",
    audit.summary || "No summary saved.",
    "",
    "## Checkpoints",
    "",
    ...audit.checkpoints.map((checkpoint) => `- ${checkpoint.checkpointName}: ${checkpoint.status.toLowerCase()} (${checkpoint.gapsFound} gaps, ${checkpoint.recordsChecked} records checked)`),
    "",
    "## Critical And High Gaps",
    "",
    ...audit.gaps
      .filter((item) => {
        const urgent: WorkflowGapSeverity[] = [WorkflowGapSeverity.CRITICAL, WorkflowGapSeverity.HIGH];
        return urgent.includes(item.severity);
      })
      .map((item) => `- [${item.severity.toLowerCase()}] ${item.title}: ${item.recommendation}`),
    "",
    "## All Gaps",
    "",
    ...audit.gaps.map((item) => `- [${item.severity.toLowerCase()}] ${item.category}: ${item.title} (${item.status.toLowerCase()})`),
    "",
    "## Action Items",
    "",
    ...audit.actionItems.map((item) => `- [${item.priority.toLowerCase()}] ${item.title}: ${item.recommendedAction}`),
    "",
    "## Safety Notes",
    "",
    "- No auto-fix was performed.",
    "- No auto-approval was performed.",
    "- No auto-publishing was performed.",
    "- Raw dashboard/import rows are not included in this report.",
  ];
  return redactSensitive(lines.join("\n"));
}
