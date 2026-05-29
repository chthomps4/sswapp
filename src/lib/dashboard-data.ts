import { createSampleDailyContentPack } from "./automation-engine";
import { getLatestContentPack, isDatabaseConfigured } from "./db-operational";
import { prisma } from "./prisma";
import { seedBrands } from "./seed-data";
import type { Brand, GeneratedContentPack, ImagePromptRecord, MetricSnapshot, PostDraftRecord, PostVariant } from "./types";
import { todayIso } from "./utils";

export type DashboardDataSource = "database" | "empty_database" | "deterministic_fallback" | "error_fallback";

export type DashboardConfigStatus = {
  databaseConfigured: boolean;
  clerkConfigured: boolean;
  clerkProductionReady: boolean;
  ownerEmailsConfigured: boolean;
  openaiConfigured: boolean;
};

export type DashboardSnapshot = {
  contentSource: DashboardDataSource;
  contentSourceLabel: string;
  socialSource: DashboardDataSource;
  socialSourceLabel: string;
  statusMode: "persistent" | "preview_only";
  latestPackId: string;
  latestPackTitle: string;
  latestPackDate: string;
  dailyTheme: string;
  totalDrafts: number;
  needsReviewCount: number;
  approvedCount: number;
  scheduledCount: number;
  postedCount: number;
  imagePromptCount: number;
  pendingApprovalCount: number;
  socialImportCount: number;
  socialSnapshotCount: number;
  socialInsightCount: number;
  unresolvedImportIssueCount: number;
  configStatus: DashboardConfigStatus;
  warnings: string[];
  nextActions: string[];
};

export type DashboardData = {
  brands: Brand[];
  posts: PostVariant[];
  snapshot: DashboardSnapshot;
};

const zeroMetrics: MetricSnapshot = {
  reach: 0,
  impressions: 0,
  engagements: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  clicks: 0,
  dms: 0,
  leads: 0,
  registrations: 0,
};

function sourceLabel(source: DashboardDataSource) {
  const labels: Record<DashboardDataSource, string> = {
    database: "DB-backed",
    empty_database: "DB configured, waiting for records",
    deterministic_fallback: "Deterministic fallback",
    error_fallback: "DB error fallback",
  };
  return labels[source];
}

function emptyDashboardSnapshot(
  contentSource: DashboardDataSource,
  socialCounts: Awaited<ReturnType<typeof getSocialCounts>>,
  reason: string,
): DashboardSnapshot {
  const config = configStatus();
  const warnings: string[] = [reason];
  if (!config.databaseConfigured) warnings.push("DATABASE_URL is not configured; persistence is unavailable in this environment.");
  if (socialCounts.source !== "database") warnings.push("Social metrics are waiting for confirmed imports.");
  if (!config.clerkConfigured) warnings.push("Clerk is not fully configured; production private access should fail closed before operational use.");
  if (config.clerkConfigured && !config.clerkProductionReady) warnings.push("Clerk is using development keys. Use live Clerk keys for the production custom domain.");
  if (!config.ownerEmailsConfigured) warnings.push("OWNER_EMAILS is missing; owner-only controls need this before production use.");
  if (!config.openaiConfigured) warnings.push("OpenAI is optional; deterministic fallback remains available when AI is disabled.");

  return {
    contentSource,
    contentSourceLabel: sourceLabel(contentSource),
    socialSource: socialCounts.source,
    socialSourceLabel: sourceLabel(socialCounts.source),
    statusMode: "preview_only",
    latestPackId: "",
    latestPackTitle: "",
    latestPackDate: todayIso(),
    dailyTheme: "",
    totalDrafts: 0,
    needsReviewCount: 0,
    approvedCount: 0,
    scheduledCount: 0,
    postedCount: 0,
    imagePromptCount: 0,
    pendingApprovalCount: 0,
    socialImportCount: socialCounts.imports,
    socialSnapshotCount: socialCounts.snapshots,
    socialInsightCount: socialCounts.insights,
    unresolvedImportIssueCount: socialCounts.issues,
    configStatus: config,
    warnings,
    nextActions: [
      "Run Today to create the first persisted content pack.",
      "Import and confirm social dashboard CSVs to activate metrics.",
      "Review approvals before exporting scheduler CSVs.",
      "Use Calendar for the operating cadence while Google Calendar sync stays read-only.",
    ],
  };
}

export function postDraftToDashboardPost(draft: PostDraftRecord, imagePrompt?: ImagePromptRecord): PostVariant {
  return {
    id: draft.id,
    date: draft.date,
    brandSlug: draft.brandSlug,
    brandName: draft.brandName,
    platformSlug: draft.platformSlug,
    platformName: draft.platformName,
    campaign: draft.campaignName || draft.campaignSlug,
    contentPillarSlug: draft.contentPillarSlug,
    contentPillarName: draft.contentPillarName,
    objective: draft.postObjective,
    hook: draft.hook,
    body: draft.body,
    cta: draft.ctaDirect || draft.ctaSoft,
    imageConcept: imagePrompt?.headlineText || imagePrompt?.supportingText || draft.altText,
    imagePrompt: imagePrompt?.prompt || "",
    altText: imagePrompt?.altText || draft.altText,
    hashtags: draft.hashtags,
    assetFilename: imagePrompt?.filename || "",
    approvalStatus: draft.status,
    publishingStatus: draft.status === "scheduled" ? "scheduled" : draft.status === "posted" ? "posted" : "not_scheduled",
    finalUrl: draft.postedUrl,
    reviewNotes: draft.reviewerNotes,
    metrics: zeroMetrics,
  };
}

function postsFromPack(pack: GeneratedContentPack) {
  const imageByDraftId = new Map(pack.imagePrompts.map((prompt) => [prompt.postDraftId, prompt]));
  return pack.postDrafts.map((draft) => postDraftToDashboardPost(draft, imageByDraftId.get(draft.id)));
}

function configStatus(): DashboardConfigStatus {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const clerkSecretKey = process.env.CLERK_SECRET_KEY || "";
  return {
    databaseConfigured: isDatabaseConfigured(),
    clerkConfigured: Boolean(clerkPublishableKey && clerkSecretKey),
    clerkProductionReady: clerkPublishableKey.startsWith("pk_live_") && clerkSecretKey.startsWith("sk_live_"),
    ownerEmailsConfigured: Boolean(process.env.OWNER_EMAILS),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
  };
}

function contentSnapshot(pack: GeneratedContentPack, contentSource: DashboardDataSource, socialCounts: Awaited<ReturnType<typeof getSocialCounts>>): DashboardSnapshot {
  const needsReviewCount = pack.postDrafts.filter((draft) => ["draft", "needs_review", "needs_revision"].includes(draft.status)).length;
  const approvedCount = pack.postDrafts.filter((draft) => draft.status === "approved").length;
  const scheduledCount = pack.postDrafts.filter((draft) => draft.status === "scheduled").length;
  const postedCount = pack.postDrafts.filter((draft) => draft.status === "posted").length;
  const pendingApprovalCount = pack.approvals.filter((approval) => approval.status === "pending").length;
  const config = configStatus();
  const warnings: string[] = [];
  if (!config.databaseConfigured) warnings.push("DATABASE_URL is not configured; content and metrics are deterministic fallback data.");
  if (contentSource !== "database") warnings.push("No persisted content pack is powering this dashboard yet.");
  if (socialCounts.source !== "database") warnings.push("Social metrics are not yet powered by confirmed imports.");
  if (!config.clerkConfigured) warnings.push("Clerk is not fully configured; production private access should fail closed before operational use.");
  if (config.clerkConfigured && !config.clerkProductionReady) warnings.push("Clerk is using development keys. Use live Clerk keys for the production custom domain.");
  if (!config.ownerEmailsConfigured) warnings.push("OWNER_EMAILS is missing; owner-only controls need this before production use.");
  if (!config.openaiConfigured) warnings.push("OpenAI is optional and currently falls back to deterministic generation.");

  return {
    contentSource,
    contentSourceLabel: sourceLabel(contentSource),
    socialSource: socialCounts.source,
    socialSourceLabel: sourceLabel(socialCounts.source),
    statusMode: contentSource === "database" ? "persistent" : "preview_only",
    latestPackId: pack.contentPack.id,
    latestPackTitle: pack.contentPack.title,
    latestPackDate: pack.contentPack.date || todayIso(),
    dailyTheme: pack.contentPack.dailyTheme,
    totalDrafts: pack.postDrafts.length,
    needsReviewCount,
    approvedCount,
    scheduledCount,
    postedCount,
    imagePromptCount: pack.imagePrompts.length,
    pendingApprovalCount,
    socialImportCount: socialCounts.imports,
    socialSnapshotCount: socialCounts.snapshots,
    socialInsightCount: socialCounts.insights,
    unresolvedImportIssueCount: socialCounts.issues,
    configStatus: config,
    warnings,
    nextActions: [
      "Run Today to create or refresh a persisted content pack.",
      "Review pending copy and image prompt approvals before any export.",
      "Import and confirm dashboard CSVs to replace sample metrics.",
      "Use Calendar for business cadence and route rescue status.",
    ],
  };
}

async function getSocialCounts(): Promise<{
  source: DashboardDataSource;
  imports: number;
  snapshots: number;
  insights: number;
  issues: number;
}> {
  if (!isDatabaseConfigured()) return { source: "deterministic_fallback", imports: 0, snapshots: 0, insights: 0, issues: 0 };
  try {
    const [imports, snapshots, insights, issues] = await Promise.all([
      prisma.socialDashboardImport.count(),
      prisma.socialMetricSnapshot.count(),
      prisma.socialPerformanceInsight.count(),
      prisma.socialImportIssue.count({ where: { resolved: false } }),
    ]);
    return {
      source: snapshots > 0 || imports > 0 || insights > 0 ? "database" : "empty_database",
      imports,
      snapshots,
      insights,
      issues,
    };
  } catch {
    return { source: "error_fallback", imports: 0, snapshots: 0, insights: 0, issues: 0 };
  }
}

export function createDashboardDataFromPack(
  pack: GeneratedContentPack,
  options?: {
    contentSource?: DashboardDataSource;
    socialCounts?: Awaited<ReturnType<typeof getSocialCounts>>;
  },
): DashboardData {
  const socialCounts = options?.socialCounts || { source: "deterministic_fallback" as const, imports: 0, snapshots: 0, insights: 0, issues: 0 };
  return {
    brands: seedBrands,
    posts: postsFromPack(pack),
    snapshot: contentSnapshot(pack, options?.contentSource || "deterministic_fallback", socialCounts),
  };
}

export async function getOperationalDashboardData(): Promise<DashboardData> {
  const socialCounts = await getSocialCounts();
  if (!isDatabaseConfigured()) {
    return createDashboardDataFromPack(createSampleDailyContentPack(), {
      contentSource: "deterministic_fallback",
      socialCounts,
    });
  }

  try {
    const pack = await getLatestContentPack();
    if (!pack) {
      return {
        brands: seedBrands,
        posts: [],
        snapshot: emptyDashboardSnapshot("empty_database", socialCounts, "Database is connected, but no content pack has been created yet."),
      };
    }
    return createDashboardDataFromPack(pack, {
      contentSource: "database",
      socialCounts,
    });
  } catch {
    return {
      brands: seedBrands,
      posts: [],
      snapshot: emptyDashboardSnapshot(
        "error_fallback",
        { ...socialCounts, source: socialCounts.source === "database" ? "error_fallback" : socialCounts.source },
        "Database reads failed for the dashboard. Check migrations, Prisma client generation, and production database access.",
      ),
    };
  }
}
