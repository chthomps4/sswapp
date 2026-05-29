import {
  ApprovalType,
  ApprovalWorkflowStatus,
  AutomationRecipeTriggerType,
  AutomationStatus,
  AutomationType,
  ContentStatus,
  ImageType,
  SocialImportIssueSeverity,
  SocialImportIssueType,
  SocialImportMethod,
  SocialImportStatus,
  SocialInsightStatus,
  SocialInsightType,
  SocialPostStatus,
  SocialRowValidationStatus,
  type Prisma,
} from "@prisma/client";
import { createHash } from "node:crypto";
import { prisma } from "./prisma";
import { automationRecipes } from "./automation-recipes";
import {
  createSampleDailyContentPack,
  exportAssetManifestJson,
  exportDailyReviewMarkdown,
  exportImagePromptsJson,
  exportSchedulerCsv,
} from "./automation-engine";
import { canTransitionApproval } from "./content-engine";
import { promptRegistry } from "./prompts/promptRegistry";
import {
  confirmImport,
  createImportPreview,
  createSampleSocialImport,
  exportSocialMetricsCsv,
  exportWeeklySocialReportMarkdown,
  generateRuleBasedInsights,
  mappingTemplates,
  socialAccounts,
  type NormalizedMetricRow,
  type SocialDashboardImportRecord,
  type SocialMetricSnapshotRecord,
  type SocialPerformanceInsightRecord,
  type SocialPostRecord,
} from "./social-dashboard-engine";
import { seedBrands, seedCampaigns, seedContentPillars, seedPlatforms } from "./seed-data";
import type {
  ApprovalRecord,
  ApprovalStatus,
  AutomationRunRecord,
  Campaign,
  GeneratedContentPack,
  ImagePromptRecord,
  PostDraftRecord,
} from "./types";

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("DATABASE_URL is not configured.");
  }
}

function requireDatabase() {
  if (!isDatabaseConfigured()) throw new DatabaseUnavailableError();
}

function dateOnly(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function jsonArray(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function contentStatus(status: ApprovalStatus | string | undefined) {
  const map: Record<string, ContentStatus> = {
    draft: ContentStatus.DRAFT,
    needs_review: ContentStatus.NEEDS_REVIEW,
    needs_revision: ContentStatus.NEEDS_REVISION,
    approved: ContentStatus.APPROVED,
    scheduled: ContentStatus.SCHEDULED,
    posted: ContentStatus.POSTED,
    measured: ContentStatus.MEASURED,
    skipped: ContentStatus.SKIPPED,
    archived: ContentStatus.ARCHIVED,
  };
  return map[String(status || "needs_review")] || ContentStatus.NEEDS_REVIEW;
}

function contentStatusOut(status: ContentStatus): ApprovalStatus {
  const map: Record<ContentStatus, ApprovalStatus> = {
    DRAFT: "draft",
    NEEDS_REVIEW: "needs_review",
    NEEDS_REVISION: "needs_revision",
    APPROVED: "approved",
    SCHEDULED: "scheduled",
    POSTED: "posted",
    MEASURED: "measured",
    SKIPPED: "skipped",
    ARCHIVED: "archived",
  };
  return map[status];
}

function imageType(value: string | undefined) {
  const key = String(value || "checklist").toUpperCase() as keyof typeof ImageType;
  return ImageType[key] || ImageType.CHECKLIST;
}

function imageTypeOut(value: ImageType) {
  return value.toLowerCase() as ImagePromptRecord["imageType"];
}

function approvalType(value: ApprovalRecord["type"]) {
  const map: Record<ApprovalRecord["type"], ApprovalType> = {
    copy: ApprovalType.COPY,
    image_prompt: ApprovalType.IMAGE_PROMPT,
    image_asset: ApprovalType.IMAGE_ASSET,
    full_post: ApprovalType.FULL_POST,
  };
  return map[value];
}

function approvalTypeOut(value: ApprovalType): ApprovalRecord["type"] {
  const map: Record<ApprovalType, ApprovalRecord["type"]> = {
    COPY: "copy",
    IMAGE_PROMPT: "image_prompt",
    IMAGE_ASSET: "image_asset",
    FULL_POST: "full_post",
  };
  return map[value];
}

function approvalStatusOut(value: ApprovalWorkflowStatus): ApprovalRecord["status"] {
  const map: Record<ApprovalWorkflowStatus, ApprovalRecord["status"]> = {
    PENDING: "pending",
    APPROVED: "approved",
    NEEDS_REVISION: "needs_revision",
    REJECTED: "rejected",
  };
  return map[value];
}

function automationType(type: AutomationRunRecord["type"]) {
  const key = type.toUpperCase() as keyof typeof AutomationType;
  return AutomationType[key] || AutomationType.DAILY_CONTENT_PACK;
}

function automationTypeOut(value: AutomationType): AutomationRunRecord["type"] {
  return value.toLowerCase() as AutomationRunRecord["type"];
}

function automationStatusOut(value: AutomationStatus): AutomationRunRecord["status"] {
  return value.toLowerCase() as AutomationRunRecord["status"];
}

function hashValue(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

function inputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

async function lookupCore() {
  const [brands, platforms, pillars, campaigns] = await Promise.all([
    prisma.brand.findMany(),
    prisma.platform.findMany(),
    prisma.contentPillar.findMany({ include: { brand: true } }),
    prisma.campaign.findMany({ include: { brand: true } }),
  ]);

  return {
    brandBySlug: new Map(brands.map((brand) => [brand.slug, brand])),
    platformBySlug: new Map(platforms.map((platform) => [platform.slug, platform])),
    pillarByBrandSlug: new Map(pillars.map((pillar) => [`${pillar.brand.slug}:${pillar.slug}`, pillar])),
    campaignByBrandSlug: new Map(campaigns.map((campaign) => [`${campaign.brand.slug}:${campaign.slug}`, campaign])),
  };
}

export async function seedOperationalDatabase() {
  requireDatabase();

  for (const brand of seedBrands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        description: brand.description || "",
        positioning: brand.positioning,
        audience: brand.audience,
        offerSummary: brand.offerSummary,
        voiceGuidelines: brand.voiceGuidelines,
        forbiddenPhrases: brand.forbiddenPhrases,
        visualStyle: brand.visualStyle,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        accentColor: brand.accentColor,
        logoUrl: brand.logoUrl,
        websiteUrl: brand.websiteUrl,
        defaultCTA: brand.defaultCTA,
        active: brand.active,
      },
      create: {
        name: brand.name,
        slug: brand.slug,
        description: brand.description || "",
        positioning: brand.positioning,
        audience: brand.audience,
        offerSummary: brand.offerSummary,
        voiceGuidelines: brand.voiceGuidelines,
        forbiddenPhrases: brand.forbiddenPhrases,
        visualStyle: brand.visualStyle,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        accentColor: brand.accentColor,
        logoUrl: brand.logoUrl,
        websiteUrl: brand.websiteUrl,
        defaultCTA: brand.defaultCTA,
        active: brand.active,
      },
    });
  }

  for (const platform of seedPlatforms) {
    await prisma.platform.upsert({
      where: { slug: platform.slug },
      update: {
        name: platform.name,
        characterLimit: platform.characterLimit,
        supportsHashtags: platform.supportsHashtags,
        supportsAltText: platform.supportsAltText,
        supportsCarousel: platform.supportsCarousel,
        supportsVideo: platform.supportsVideo,
        bestUseCase: platform.bestUseCase,
        active: platform.active,
      },
      create: {
        name: platform.name,
        slug: platform.slug,
        characterLimit: platform.characterLimit,
        supportsHashtags: platform.supportsHashtags,
        supportsAltText: platform.supportsAltText,
        supportsCarousel: platform.supportsCarousel,
        supportsVideo: platform.supportsVideo,
        bestUseCase: platform.bestUseCase,
        active: platform.active,
      },
    });
  }

  const { brandBySlug, platformBySlug } = await lookupCore();

  for (const brand of seedBrands) {
    const dbBrand = brandBySlug.get(brand.slug);
    if (!dbBrand) continue;
    for (const profile of brand.socialProfiles) {
      await prisma.socialProfile.upsert({
        where: { brandId_platform: { brandId: dbBrand.id, platform: profile.platform } },
        update: profile,
        create: { ...profile, brandId: dbBrand.id },
      });
    }
  }

  for (const pillar of seedContentPillars) {
    const dbBrand = brandBySlug.get(pillar.brandSlug || "signal-workshop");
    if (!dbBrand) continue;
    await prisma.contentPillar.upsert({
      where: { brandId_slug: { brandId: dbBrand.id, slug: pillar.slug } },
      update: {
        name: pillar.name,
        description: pillar.description,
        examples: pillar.examples || [],
        active: pillar.active !== false,
      },
      create: {
        brandId: dbBrand.id,
        name: pillar.name,
        slug: pillar.slug,
        description: pillar.description,
        examples: pillar.examples || [],
        active: pillar.active !== false,
      },
    });
  }

  for (const campaign of seedCampaigns) {
    const dbBrand = brandBySlug.get(campaign.brandSlug);
    if (!dbBrand) continue;
    await prisma.campaign.upsert({
      where: { brandId_slug: { brandId: dbBrand.id, slug: campaign.slug } },
      update: {
        name: campaign.name,
        objective: campaign.objective,
        status: contentStatus(campaign.status),
        offer: campaign.offer,
        primaryCTA: campaign.primaryCTA,
        notes: campaign.notes,
      },
      create: {
        brandId: dbBrand.id,
        name: campaign.name,
        slug: campaign.slug,
        objective: campaign.objective,
        status: contentStatus(campaign.status),
        offer: campaign.offer,
        primaryCTA: campaign.primaryCTA,
        notes: campaign.notes,
      },
    });
  }

  for (const account of socialAccounts) {
    const brand = brandBySlug.get(account.brandSlug);
    const platform = platformBySlug.get(account.platformSlug);
    if (!brand || !platform) continue;
    await prisma.socialAccount.upsert({
      where: { brandId_platformId_accountName: { brandId: brand.id, platformId: platform.id, accountName: account.accountName } },
      update: {
        handle: account.handle,
        accountUrl: account.accountUrl,
        externalAccountId: account.externalAccountId,
        dashboardSource: account.dashboardSource,
        timezone: account.timezone,
        active: account.active,
        notes: account.notes,
      },
      create: {
        brandId: brand.id,
        platformId: platform.id,
        accountName: account.accountName,
        handle: account.handle,
        accountUrl: account.accountUrl,
        externalAccountId: account.externalAccountId,
        dashboardSource: account.dashboardSource,
        timezone: account.timezone,
        active: account.active,
        notes: account.notes,
      },
    });
  }

  for (const template of mappingTemplates) {
    const platform = template.platformSlug ? platformBySlug.get(template.platformSlug) : undefined;
    await prisma.socialMetricMappingTemplate.upsert({
      where: { name_sourceName: { name: template.name, sourceName: template.sourceName } },
      update: {
        platformId: platform?.id,
        description: template.description,
        mappingJson: template.mappingJson,
        requiredFields: template.requiredFields,
        optionalFields: template.optionalFields,
        active: template.active,
      },
      create: {
        name: template.name,
        sourceName: template.sourceName,
        platformId: platform?.id,
        description: template.description,
        mappingJson: template.mappingJson,
        requiredFields: template.requiredFields,
        optionalFields: template.optionalFields,
        active: template.active,
      },
    });
  }

  for (const recipe of automationRecipes) {
    await prisma.automationRecipe.upsert({
      where: { slug: recipe.slug },
      update: {
        name: recipe.name,
        description: recipe.description,
        triggerType: AutomationRecipeTriggerType[recipe.triggerType.toUpperCase() as keyof typeof AutomationRecipeTriggerType],
        active: recipe.active,
        stepsJson: inputJson(recipe.stepsJson),
        requiredInputsJson: inputJson(recipe.requiredInputsJson),
        optionalInputsJson: inputJson(recipe.optionalInputsJson),
        defaultSettingsJson: inputJson(recipe.defaultSettingsJson),
        featureFlagsJson: inputJson(recipe.featureFlagsJson),
      },
      create: {
        name: recipe.name,
        slug: recipe.slug,
        description: recipe.description,
        triggerType: AutomationRecipeTriggerType[recipe.triggerType.toUpperCase() as keyof typeof AutomationRecipeTriggerType],
        active: recipe.active,
        stepsJson: inputJson(recipe.stepsJson),
        requiredInputsJson: inputJson(recipe.requiredInputsJson),
        optionalInputsJson: inputJson(recipe.optionalInputsJson),
        defaultSettingsJson: inputJson(recipe.defaultSettingsJson),
        featureFlagsJson: inputJson(recipe.featureFlagsJson),
      },
    });
  }

  for (const prompt of promptRegistry) {
    await prisma.promptTemplate.upsert({
      where: { slug: prompt.key },
      update: {
        name: prompt.title,
        category: prompt.category,
        variables: { required: prompt.requiredVariables, optional: prompt.optionalVariables },
        notes: `${prompt.description} Version ${prompt.version}.`,
      },
      create: {
        slug: prompt.key,
        name: prompt.title,
        category: prompt.category,
        body: prompt.filename,
        variables: { required: prompt.requiredVariables, optional: prompt.optionalVariables },
        notes: `${prompt.description} Version ${prompt.version}.`,
      },
    });
  }
}

export async function persistGeneratedContentPack(pack: GeneratedContentPack) {
  requireDatabase();
  await seedOperationalDatabase();
  const core = await lookupCore();
  const existingFilenames = new Set(
    (
      await prisma.imagePrompt.findMany({
        select: { filename: true },
      })
    ).map((item) => item.filename),
  );

  const dbPack = await prisma.contentPack.create({
    data: {
      date: new Date(`${pack.contentPack.date}T00:00:00.000Z`),
      title: pack.contentPack.title,
      dailyTheme: pack.contentPack.dailyTheme,
      strategicReason: pack.contentPack.strategicReason,
      selectedBrands: pack.contentPack.selectedBrands,
      status: ContentStatus.NEEDS_REVIEW,
      generatedBy: pack.contentPack.generatedBy,
      modelUsed: pack.contentPack.modelUsed,
      promptKey: pack.automationRun.promptKey || "daily-content-pack",
      promptVersion: pack.automationRun.promptVersion || pack.contentPack.promptVersion,
      promptInputHash: pack.automationRun.promptInputHash,
      notes: pack.contentPack.notes,
    },
  });

  const draftIdMap = new Map<string, string>();
  const imageIdMap = new Map<string, string>();

  for (const draft of pack.postDrafts) {
    const brand = core.brandBySlug.get(draft.brandSlug);
    const platform = core.platformBySlug.get(draft.platformSlug);
    const pillar = core.pillarByBrandSlug.get(`${draft.brandSlug}:${draft.contentPillarSlug}`);
    const campaign = core.campaignByBrandSlug.get(`${draft.brandSlug}:${draft.campaignSlug}`) || undefined;
    if (!brand || !platform || !pillar) continue;

    const dbDraft = await prisma.postDraft.create({
      data: {
        contentPackId: dbPack.id,
        brandId: brand.id,
        platformId: platform.id,
        contentPillarId: pillar.id,
        campaignId: campaign?.id,
        date: new Date(`${draft.date}T00:00:00.000Z`),
        postObjective: draft.postObjective,
        hook: draft.hook,
        body: draft.body,
        ctaSoft: draft.ctaSoft,
        ctaDirect: draft.ctaDirect,
        hashtags: draft.hashtags,
        communityTags: draft.communityTags,
        firstComment: draft.firstComment,
        replySeeds: draft.replySeeds,
        redditDisclosure: draft.redditDisclosure,
        newsletterSubject: draft.newsletterSubject,
        altText: draft.altText,
        status: ContentStatus.NEEDS_REVIEW,
        reviewerNotes: draft.reviewerNotes,
        finalCopy: draft.finalCopy,
        scheduledDate: draft.scheduledDate ? new Date(draft.scheduledDate) : undefined,
        postedUrl: draft.postedUrl || undefined,
        promptKey: pack.automationRun.promptKey,
        promptVersion: pack.automationRun.promptVersion,
        promptInputHash: pack.automationRun.promptInputHash,
        modelUsed: pack.automationRun.modelUsed,
      },
    });
    draftIdMap.set(draft.id, dbDraft.id);
  }

  for (const prompt of pack.imagePrompts) {
    const postDraftId = draftIdMap.get(prompt.postDraftId);
    const brand = core.brandBySlug.get(prompt.brandSlug);
    const platform = core.platformBySlug.get(prompt.platformSlug);
    if (!postDraftId || !brand || !platform) continue;
    let filename = prompt.filename;
    if (existingFilenames.has(filename)) {
      const extension = filename.includes(".") ? filename.split(".").pop() || "png" : "png";
      const base = filename.replace(new RegExp(`\\.${extension}$`), "");
      let version = 2;
      while (existingFilenames.has(`${base.replace(/_v\\d+$/, "")}_v${String(version).padStart(2, "0")}.${extension}`)) {
        version += 1;
      }
      filename = `${base.replace(/_v\\d+$/, "")}_v${String(version).padStart(2, "0")}.${extension}`;
    }
    existingFilenames.add(filename);

    const dbPrompt = await prisma.imagePrompt.create({
      data: {
        postDraftId,
        brandId: brand.id,
        platformId: platform.id,
        imageType: imageType(prompt.imageType),
        headlineText: prompt.headlineText,
        supportingText: prompt.supportingText,
        prompt: prompt.prompt,
        negativePrompt: prompt.negativePrompt,
        layoutNotes: prompt.layoutNotes,
        canvaNotes: prompt.canvaNotes,
        adobeExpressNotes: prompt.adobeExpressNotes,
        photoshopNotes: prompt.photoshopNotes,
        altText: prompt.altText,
        aspectRatio: prompt.aspectRatio,
        filename,
        status: ContentStatus.NEEDS_REVIEW,
        promptKey: "image-prompt",
        promptVersion: pack.automationRun.promptVersion,
        promptInputHash: pack.automationRun.promptInputHash,
        modelUsed: pack.automationRun.modelUsed,
      },
    });
    imageIdMap.set(prompt.id, dbPrompt.id);
  }

  for (const approval of pack.approvals) {
    const postDraftId = approval.postDraftId ? draftIdMap.get(approval.postDraftId) : undefined;
    const imagePromptId = approval.imagePromptId ? imageIdMap.get(approval.imagePromptId) : undefined;
    const draft = pack.postDrafts.find((item) => item.id === approval.postDraftId);
    const brand = draft ? core.brandBySlug.get(draft.brandSlug) : undefined;
    await prisma.approval.create({
      data: {
        contentPackId: dbPack.id,
        postDraftId,
        imagePromptId,
        brandId: brand?.id,
        type: approvalType(approval.type),
        status: ApprovalWorkflowStatus.PENDING,
        reviewer: approval.reviewer,
        notes: approval.notes,
      },
    });
  }

  const recordsCreated = {
    ...(typeof pack.automationRun.recordsCreated === "object" && pack.automationRun.recordsCreated ? pack.automationRun.recordsCreated : {}),
    contentPackId: dbPack.id,
    postDrafts: draftIdMap.size,
    imagePrompts: imageIdMap.size,
    approvals: pack.approvals.length,
  };

  const dbRun = await prisma.automationRun.create({
    data: {
      type: automationType(pack.automationRun.type),
      status: AutomationStatus.SUCCEEDED,
      input: (pack.automationRun.input ?? {}) as Prisma.InputJsonValue,
      output: inputJson({ ...(pack.automationRun.output as Record<string, unknown> | undefined), contentPackId: dbPack.id }),
      error: pack.automationRun.error || "",
      promptKey: pack.automationRun.promptKey,
      promptVersion: pack.automationRun.promptVersion,
      promptInputHash: pack.automationRun.promptInputHash || hashValue(pack.automationRun.input),
      modelUsed: pack.automationRun.modelUsed,
      recordsCreated: inputJson(recordsCreated),
      startedAt: pack.automationRun.startedAt ? new Date(pack.automationRun.startedAt) : new Date(),
      completedAt: pack.automationRun.completedAt ? new Date(pack.automationRun.completedAt) : new Date(),
    },
  });

  return (await getContentPackById(dbPack.id)) || {
    ...pack,
    contentPack: { ...pack.contentPack, id: dbPack.id },
    automationRun: { ...pack.automationRun, id: dbRun.id },
  };
}

type DbContentPack = Prisma.ContentPackGetPayload<{
  include: {
    postDrafts: { include: { brand: true; platform: true; campaign: true; contentPillar: true; imagePrompts: true; approvals: true } };
    approvals: true;
  };
}>;

function dbAutomationRunToRecord(run: Awaited<ReturnType<typeof prisma.automationRun.findFirst>>): AutomationRunRecord {
  return {
    id: run?.id || "",
    type: run ? automationTypeOut(run.type) : "daily_content_pack",
    status: run ? automationStatusOut(run.status) : "succeeded",
    input: run?.input || {},
    output: run?.output || {},
    error: run?.error || "",
    startedAt: run?.startedAt?.toISOString() || "",
    completedAt: run?.completedAt?.toISOString() || "",
    createdAt: run?.createdAt?.toISOString() || "",
    promptKey: run?.promptKey || undefined,
    promptVersion: run?.promptVersion || undefined,
    promptInputHash: run?.promptInputHash || undefined,
    modelUsed: run?.modelUsed || undefined,
    recordsCreated: run?.recordsCreated || undefined,
  };
}

async function dbPackToGenerated(pack: DbContentPack): Promise<GeneratedContentPack> {
  const run = await prisma.automationRun.findFirst({
    where: { recordsCreated: { path: ["contentPackId"], equals: pack.id } },
    orderBy: { createdAt: "desc" },
  });
  const postDrafts: PostDraftRecord[] = pack.postDrafts.map((draft) => ({
    id: draft.id,
    contentPackId: pack.id,
    brandSlug: draft.brand.slug,
    brandName: draft.brand.name,
    campaignSlug: draft.campaign?.slug || "",
    campaignName: draft.campaign?.name || "",
    platformSlug: draft.platform.slug,
    platformName: draft.platform.name,
    contentPillarSlug: draft.contentPillar.slug,
    contentPillarName: draft.contentPillar.name,
    date: dateOnly(draft.date),
    postObjective: draft.postObjective,
    hook: draft.hook,
    body: draft.body,
    ctaSoft: draft.ctaSoft || "",
    ctaDirect: draft.ctaDirect || "",
    hashtags: draft.hashtags || "",
    communityTags: draft.communityTags || "",
    firstComment: draft.firstComment || "",
    replySeeds: jsonArray(draft.replySeeds),
    redditDisclosure: draft.redditDisclosure || "",
    newsletterSubject: draft.newsletterSubject || "",
    altText: draft.altText || "",
    status: contentStatusOut(draft.status),
    reviewerNotes: draft.reviewerNotes || "",
    finalCopy: draft.finalCopy || "",
    scheduledDate: draft.scheduledDate?.toISOString() || "",
    postedUrl: draft.postedUrl || "",
  }));
  const imagePrompts: ImagePromptRecord[] = pack.postDrafts.flatMap((draft) =>
    draft.imagePrompts.map((prompt) => ({
      id: prompt.id,
      postDraftId: draft.id,
      brandSlug: draft.brand.slug,
      platformSlug: draft.platform.slug,
      imageType: imageTypeOut(prompt.imageType),
      headlineText: prompt.headlineText || "",
      supportingText: prompt.supportingText || "",
      prompt: prompt.prompt,
      negativePrompt: prompt.negativePrompt || "",
      layoutNotes: prompt.layoutNotes || "",
      canvaNotes: prompt.canvaNotes || "",
      adobeExpressNotes: prompt.adobeExpressNotes || "",
      photoshopNotes: prompt.photoshopNotes || "",
      altText: prompt.altText || "",
      aspectRatio: prompt.aspectRatio || "",
      filename: prompt.filename,
      status: contentStatusOut(prompt.status),
    })),
  );
  const approvals: ApprovalRecord[] = pack.approvals.map((approval) => ({
    id: approval.id,
    contentPackId: approval.contentPackId || "",
    postDraftId: approval.postDraftId || undefined,
    imagePromptId: approval.imagePromptId || undefined,
    creativeAssetId: approval.creativeAssetId || undefined,
    type: approvalTypeOut(approval.type),
    status: approvalStatusOut(approval.status),
    reviewer: approval.reviewer || "",
    notes: approval.notes || "",
    approvedAt: approval.approvedAt?.toISOString() || "",
  }));

  return {
    contentPack: {
      id: pack.id,
      date: dateOnly(pack.date),
      title: pack.title,
      dailyTheme: pack.dailyTheme,
      strategicReason: pack.strategicReason,
      selectedBrands: jsonArray(pack.selectedBrands),
      status: contentStatusOut(pack.status),
      generatedBy: pack.generatedBy || "",
      modelUsed: pack.modelUsed || "",
      promptVersion: pack.promptVersion || "",
      notes: pack.notes || "",
    },
    postDrafts,
    imagePrompts,
    approvals,
    automationRun: dbAutomationRunToRecord(run),
  };
}

export async function getContentPackById(id: string) {
  requireDatabase();
  const pack = await prisma.contentPack.findUnique({
    where: { id },
    include: {
      postDrafts: {
        include: { brand: true, platform: true, campaign: true, contentPillar: true, imagePrompts: true, approvals: true },
        orderBy: { createdAt: "asc" },
      },
      approvals: { orderBy: { createdAt: "asc" } },
    },
  });
  return pack ? dbPackToGenerated(pack) : null;
}

export async function getLatestContentPack() {
  requireDatabase();
  const pack = await prisma.contentPack.findFirst({
    include: {
      postDrafts: {
        include: { brand: true, platform: true, campaign: true, contentPillar: true, imagePrompts: true, approvals: true },
        orderBy: { createdAt: "asc" },
      },
      approvals: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return pack ? dbPackToGenerated(pack) : null;
}

export async function getPackForDisplay(id?: string) {
  if (!isDatabaseConfigured()) return createSampleDailyContentPack("2026-05-28");
  return (id ? await getContentPackById(id) : await getLatestContentPack()) || createSampleDailyContentPack("2026-05-28");
}

export async function listCalendarDrafts(limit = 100) {
  requireDatabase();
  return prisma.postDraft.findMany({
    include: { brand: true, platform: true, contentPillar: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function listApprovalQueue(limit = 100) {
  requireDatabase();
  return prisma.approval.findMany({
    include: { postDraft: { include: { brand: true, platform: true } }, imagePrompt: true, contentPack: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function updatePostStatus(id: string, status: ApprovalStatus, reviewer = "owner", notes = "") {
  requireDatabase();
  const existing = await prisma.postDraft.findUnique({ where: { id } });
  if (!existing) return null;
  if (!canTransitionApproval(contentStatusOut(existing.status), status)) {
    throw new Error("Invalid approval status transition.");
  }
  const updated = await prisma.postDraft.update({
    where: { id },
    data: {
      status: contentStatus(status),
      reviewerNotes: notes || existing.reviewerNotes,
    },
    include: { brand: true, platform: true, campaign: true, contentPillar: true },
  });
  await prisma.approval.create({
    data: {
      contentPackId: updated.contentPackId,
      postDraftId: updated.id,
      brandId: updated.brandId,
      type: ApprovalType.COPY,
      status: status === "approved" ? ApprovalWorkflowStatus.APPROVED : status === "needs_revision" ? ApprovalWorkflowStatus.NEEDS_REVISION : ApprovalWorkflowStatus.PENDING,
      reviewer,
      notes,
      approvedAt: status === "approved" ? new Date() : undefined,
    },
  });
  return updated;
}

export async function exportReviewMarkdownFromDb(contentPackId?: string) {
  const pack = contentPackId ? await getContentPackById(contentPackId) : await getLatestContentPack();
  return pack
    ? exportDailyReviewMarkdown(pack)
    : [
        "# SSWApp Review Pack",
        "",
        "No persisted content pack was found for the selected filters.",
        "",
        "Run Today or select a saved content pack before exporting review markdown.",
      ].join("\n");
}

export async function exportSchedulerCsvFromDb(contentPackId?: string) {
  const pack = contentPackId ? await getContentPackById(contentPackId) : await getLatestContentPack();
  return pack
    ? exportSchedulerCsv(pack)
    : ["date", "time", "brand", "platform", "post_copy", "first_comment", "hashtags", "image_filename", "alt_text", "notes"].join(",");
}

export async function exportImagePromptsFromDb(contentPackId?: string) {
  const pack = contentPackId ? await getContentPackById(contentPackId) : await getLatestContentPack();
  return pack ? exportImagePromptsJson(pack) : JSON.stringify([], null, 2);
}

export async function exportAssetManifestFromDb(contentPackId?: string) {
  const pack = contentPackId ? await getContentPackById(contentPackId) : await getLatestContentPack();
  return pack
    ? exportAssetManifestJson(pack)
    : JSON.stringify(
        {
          contentPackId: contentPackId || "",
          date: "",
          assets: [],
        },
        null,
        2,
      );
}

function socialImportMethod(value: string | undefined) {
  const key = String(value || "pasted_table").toUpperCase() as keyof typeof SocialImportMethod;
  return SocialImportMethod[key] || SocialImportMethod.PASTED_TABLE;
}

function socialImportStatus(value: string | undefined) {
  const key = String(value || "uploaded").toUpperCase() as keyof typeof SocialImportStatus;
  return SocialImportStatus[key] || SocialImportStatus.UPLOADED;
}

function socialImportStatusOut(value: SocialImportStatus) {
  return value.toLowerCase() as SocialDashboardImportRecord["status"];
}

function rowStatus(value: string | undefined) {
  const key = String(value || "valid").toUpperCase() as keyof typeof SocialRowValidationStatus;
  return SocialRowValidationStatus[key] || SocialRowValidationStatus.VALID;
}

function issueType(value: string | undefined) {
  const key = String(value || "parse_error").toUpperCase() as keyof typeof SocialImportIssueType;
  return SocialImportIssueType[key] || SocialImportIssueType.PARSE_ERROR;
}

function issueSeverity(value: string | undefined) {
  const key = String(value || "warning").toUpperCase() as keyof typeof SocialImportIssueSeverity;
  return SocialImportIssueSeverity[key] || SocialImportIssueSeverity.WARNING;
}

function socialPostStatus(value: string | undefined) {
  const key = String(value || "imported").toUpperCase() as keyof typeof SocialPostStatus;
  return SocialPostStatus[key] || SocialPostStatus.IMPORTED;
}

function socialInsightType(value: string | undefined) {
  const key = String(value || "test_next").toUpperCase() as keyof typeof SocialInsightType;
  return SocialInsightType[key] || SocialInsightType.TEST_NEXT;
}

function socialInsightStatus(value: string | undefined) {
  const key = String(value || "new").toUpperCase() as keyof typeof SocialInsightStatus;
  return SocialInsightStatus[key] || SocialInsightStatus.NEW;
}

function toDbDate(value: string | Date | undefined, fallback = new Date()) {
  if (!value) return fallback;
  if (value instanceof Date) return value;
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

async function findCoreIdsForSocial(row: { brandSlug?: string; platformSlug?: string; campaignSlug?: string; contentPillarSlug?: string }) {
  const brand = await prisma.brand.findUnique({ where: { slug: row.brandSlug || "signal-workshop" } });
  const platform = await prisma.platform.findUnique({ where: { slug: row.platformSlug || "facebook" } });
  if (!brand || !platform) throw new Error("Seed brands and platforms before importing social metrics.");
  const campaign = row.campaignSlug
    ? await prisma.campaign.findUnique({ where: { brandId_slug: { brandId: brand.id, slug: row.campaignSlug } } })
    : await prisma.campaign.findFirst({ where: { brandId: brand.id }, orderBy: { createdAt: "asc" } });
  const pillar = row.contentPillarSlug
    ? await prisma.contentPillar.findUnique({ where: { brandId_slug: { brandId: brand.id, slug: row.contentPillarSlug } } })
    : await prisma.contentPillar.findFirst({ where: { brandId: brand.id }, orderBy: { name: "asc" } });
  return { brand, platform, campaign, pillar };
}

async function findSocialAccountId(brandId: string, platformId: string, value: string | undefined) {
  if (!value) return undefined;
  const byId = await prisma.socialAccount.findUnique({ where: { id: value }, select: { id: true } }).catch(() => null);
  if (byId) return byId.id;
  const byName = await prisma.socialAccount.findFirst({
    where: {
      brandId,
      platformId,
      OR: [{ accountName: value }, { handle: value }, { externalAccountId: value }],
    },
    select: { id: true },
  });
  return byName?.id;
}

export async function persistSocialImportPreview(input: {
  content: string;
  filename?: string;
  method?: "csv_upload" | "pasted_table" | "manual_entry" | "api_import" | "json_upload" | "xlsx_upload";
  brandSlug?: string;
  platformSlug?: string;
  socialAccountId?: string;
  importedBy?: string;
  mimeType?: string;
}) {
  requireDatabase();
  await seedOperationalDatabase();
  const maxBytes = Number(process.env.SOCIAL_IMPORT_MAX_BYTES || 2_000_000);
  const bytes = Buffer.from(input.content);
  if (bytes.byteLength > maxBytes) throw new Error(`Import is ${bytes.byteLength} bytes, above SOCIAL_IMPORT_MAX_BYTES (${maxBytes}).`);

  const preview = createImportPreview(input);
  const duplicate = await prisma.socialDashboardImport.findUnique({ where: { originalFileHash: preview.originalFileHash } });
  if (duplicate) throw new Error(`Duplicate import blocked. Existing import: ${duplicate.id}.`);

  const core = await lookupCore();
  const brand = input.brandSlug ? core.brandBySlug.get(input.brandSlug) : undefined;
  const platform = input.platformSlug ? core.platformBySlug.get(input.platformSlug) : core.platformBySlug.get(preview.detectedPlatform);
  const socialAccountId = brand && platform ? await findSocialAccountId(brand.id, platform.id, input.socialAccountId) : undefined;
  const template = await prisma.socialMetricMappingTemplate.findUnique({ where: { name_sourceName: { name: mappingTemplates.find((item) => item.id === preview.mappingTemplateId)?.name || "Generic social post metrics CSV", sourceName: preview.sourceName } } }).catch(() => null);

  const dbImport = await prisma.socialDashboardImport.create({
    data: {
      sourceName: preview.sourceName,
      platformId: platform?.id,
      brandId: brand?.id,
      socialAccountId,
      importedBy: input.importedBy || "owner",
      importMethod: socialImportMethod(preview.importMethod),
      originalFilename: preview.originalFilename,
      originalFileBytes: bytes,
      originalMimeType: input.mimeType || "text/csv",
      originalFileHash: preview.originalFileHash,
      rawColumnHeaders: inputJson(preview.rawColumnHeaders),
      detectedPlatform: preview.detectedPlatform,
      detectedDateRangeStart: preview.detectedDateRangeStart ? toDbDate(preview.detectedDateRangeStart) : undefined,
      detectedDateRangeEnd: preview.detectedDateRangeEnd ? toDbDate(preview.detectedDateRangeEnd) : undefined,
      rowCount: preview.rowCount,
      status: socialImportStatus(preview.status),
      errorSummary: preview.errorSummary,
      mappingTemplateId: template?.id,
      notes: preview.notes,
    },
  });

  for (const row of preview.previewRows) {
    const matchedPostDraft = row.matchedPostDraftId ? await prisma.postDraft.findUnique({ where: { id: row.matchedPostDraftId }, select: { id: true } }) : null;
    const matchedSocialPost = row.matchedSocialPostId ? await prisma.socialPost.findUnique({ where: { id: row.matchedSocialPostId }, select: { id: true } }) : null;
    const dbRow = await prisma.socialImportedRow.create({
      data: {
        importId: dbImport.id,
        rowIndex: row.rowIndex,
        rawJson: inputJson(row.rawJson),
        normalizedJson: row.normalizedJson ? inputJson(row.normalizedJson) : undefined,
        validationStatus: rowStatus(row.validationStatus),
        validationErrors: inputJson(row.validationErrors),
        matchedPostDraftId: matchedPostDraft?.id,
        matchedSocialPostId: matchedSocialPost?.id,
      },
    });

    for (const message of row.validationErrors) {
      await prisma.socialImportIssue.create({
        data: {
          importId: dbImport.id,
          rowId: dbRow.id,
          issueType: row.validationStatus === "duplicate" ? SocialImportIssueType.DUPLICATE_ROW : row.validationStatus === "invalid" ? SocialImportIssueType.MISSING_REQUIRED_FIELD : SocialImportIssueType.UNMATCHED_POST,
          severity: row.validationStatus === "invalid" ? SocialImportIssueSeverity.ERROR : SocialImportIssueSeverity.WARNING,
          message,
          suggestedFix: row.validationStatus === "invalid" ? "Map the missing field or ignore this row." : "Review the row before confirming import.",
        },
      });
    }
  }

  return getSocialImportPreview(dbImport.id);
}

export async function getSocialImportPreview(id: string): Promise<SocialDashboardImportRecord> {
  requireDatabase();
  const dbImport = await prisma.socialDashboardImport.findUnique({
    where: { id },
    include: { brand: true, platform: true, rows: { orderBy: { rowIndex: "asc" } } },
  });
  if (!dbImport) throw new Error("Import not found.");
  return {
    id: dbImport.id,
    sourceName: dbImport.sourceName,
    platformSlug: dbImport.platform?.slug || dbImport.detectedPlatform || "",
    brandSlug: dbImport.brand?.slug || "",
    socialAccountId: dbImport.socialAccountId || "",
    importedBy: dbImport.importedBy || "",
    importMethod: dbImport.importMethod.toLowerCase() as SocialDashboardImportRecord["importMethod"],
    originalFilename: dbImport.originalFilename || "",
    originalFileHash: dbImport.originalFileHash,
    rawColumnHeaders: jsonArray(dbImport.rawColumnHeaders),
    detectedPlatform: dbImport.detectedPlatform || dbImport.platform?.slug || "",
    detectedDateRangeStart: dateOnly(dbImport.detectedDateRangeStart),
    detectedDateRangeEnd: dateOnly(dbImport.detectedDateRangeEnd),
    rowCount: dbImport.rowCount,
    status: socialImportStatusOut(dbImport.status),
    errorSummary: dbImport.errorSummary || "",
    mappingTemplateId: dbImport.mappingTemplateId || "",
    notes: dbImport.notes || "",
    previewRows: dbImport.rows.map((row) => ({
      id: row.id,
      importId: dbImport.id,
      rowIndex: row.rowIndex,
      rawJson: (row.rawJson || {}) as Record<string, string>,
      normalizedJson: (row.normalizedJson || undefined) as NormalizedMetricRow | undefined,
      validationStatus: row.validationStatus.toLowerCase() as SocialDashboardImportRecord["previewRows"][number]["validationStatus"],
      validationErrors: jsonArray(row.validationErrors),
      matchedPostDraftId: row.matchedPostDraftId || "",
      matchedSocialPostId: row.matchedSocialPostId || "",
    })),
  };
}

export async function confirmPersistedSocialImport(id: string) {
  requireDatabase();
  await seedOperationalDatabase();
  const existingImport = await prisma.socialDashboardImport.findUnique({
    where: { id },
    include: { metricSnapshots: true },
  });
  const finalImportStatuses: SocialImportStatus[] = [SocialImportStatus.IMPORTED, SocialImportStatus.PARTIALLY_IMPORTED];
  if (
    existingImport &&
    finalImportStatuses.includes(existingImport.status) &&
    existingImport.metricSnapshots.length > 0
  ) {
    return {
      import: await getSocialImportPreview(id),
      socialPosts: [],
      snapshots: [],
      issues: [],
      insights: [],
      rollups: [],
      alreadyImported: true,
    };
  }
  const preview = await getSocialImportPreview(id);
  const result = confirmImport(preview);
  const socialPostIdByLocalId = new Map<string, string>();

  for (const post of result.socialPosts) {
    const matchedPostDraft = post.postDraftId ? await prisma.postDraft.findUnique({ where: { id: post.postDraftId }, select: { id: true, contentPackId: true } }) : null;
    const { brand, platform, campaign, pillar } = await findCoreIdsForSocial({
      brandSlug: post.brandSlug,
      platformSlug: post.platformSlug,
      campaignSlug: post.campaignSlug,
      contentPillarSlug: post.contentPillarSlug,
    });
    const data = {
      brandId: brand.id,
      platformId: platform.id,
      socialAccountId: await findSocialAccountId(brand.id, platform.id, post.socialAccountId),
      postDraftId: matchedPostDraft?.id,
      contentPackId: matchedPostDraft?.contentPackId || undefined,
      campaignId: campaign?.id,
      contentPillarId: pillar?.id,
      externalPostId: post.externalPostId || undefined,
      postUrl: post.postUrl || undefined,
      postedAt: post.postedAt ? toDbDate(post.postedAt) : undefined,
      title: post.title || undefined,
      hook: post.hook || undefined,
      bodyPreview: post.bodyPreview || undefined,
      fullCopy: post.fullCopy || undefined,
      mediaType: post.mediaType || undefined,
      imageType: post.imageType ? imageType(post.imageType) : undefined,
      assetFilename: post.assetFilename || undefined,
      ctaType: post.ctaType || undefined,
      postObjective: post.postObjective || undefined,
      contentFingerprint: post.contentFingerprint,
      status: socialPostStatus(post.status),
    };
    const dbPost =
      post.externalPostId && post.externalPostId.trim()
        ? await prisma.socialPost.upsert({
            where: { platformId_externalPostId: { platformId: platform.id, externalPostId: post.externalPostId } },
            update: data,
            create: data,
          })
        : await prisma.socialPost.create({ data });
    socialPostIdByLocalId.set(post.id, dbPost.id);
  }

  for (const snapshot of result.snapshots) {
    const matchedPostDraft = snapshot.postDraftId ? await prisma.postDraft.findUnique({ where: { id: snapshot.postDraftId }, select: { id: true } }) : null;
    const { brand, platform } = await findCoreIdsForSocial({
      brandSlug: snapshot.brandSlug,
      platformSlug: snapshot.platformSlug,
    });
    await prisma.socialMetricSnapshot.create({
      data: {
        socialPostId: socialPostIdByLocalId.get(snapshot.socialPostId),
        postDraftId: matchedPostDraft?.id,
        brandId: brand.id,
        platformId: platform.id,
        socialAccountId: await findSocialAccountId(brand.id, platform.id, snapshot.socialAccountId),
        importId: id,
        snapshotDate: toDbDate(snapshot.snapshotDate),
        reportingStartDate: snapshot.reportingStartDate ? toDbDate(snapshot.reportingStartDate) : undefined,
        reportingEndDate: snapshot.reportingEndDate ? toDbDate(snapshot.reportingEndDate) : undefined,
        reach: snapshot.reach,
        impressions: snapshot.impressions,
        views: snapshot.views,
        videoViews: snapshot.videoViews,
        likes: snapshot.likes,
        reactions: snapshot.reactions,
        comments: snapshot.comments,
        shares: snapshot.shares,
        saves: snapshot.saves,
        linkClicks: snapshot.linkClicks ?? snapshot.clicks,
        profileVisits: snapshot.profileVisits,
        follows: snapshot.follows,
        dms: snapshot.dms,
        phoneClicks: snapshot.phoneClicks,
        directionClicks: snapshot.directionClicks,
        websiteClicks: snapshot.websiteClicks,
        formSubmissions: snapshot.formSubmissions,
        leads: snapshot.leads,
        quoteRequests: snapshot.quoteRequests,
        bookedCalls: snapshot.bookedCalls,
        workshopRegistrations: snapshot.workshopRegistrations,
        purchases: snapshot.purchases,
        revenue: snapshot.revenue,
        kofiSupport: snapshot.kofiSupport,
        spend: snapshot.spend,
        engagementRate: snapshot.engagementRate,
        conversionRate: snapshot.conversionRate,
        rawMetricJson: inputJson(snapshot.rawMetricJson),
      },
    });
  }

  for (const issue of result.issues) {
    await prisma.socialImportIssue.create({
      data: {
        importId: id,
        rowId: issue.rowId || undefined,
        issueType: issueType(issue.issueType),
        severity: issueSeverity(issue.severity),
        message: issue.message,
        suggestedFix: issue.suggestedFix,
        resolved: issue.resolved,
      },
    }).catch(() => undefined);
  }

  for (const rollup of result.rollups) {
    const { brand, platform, campaign, pillar } = await findCoreIdsForSocial({
      brandSlug: rollup.brandSlug,
      platformSlug: rollup.platformSlug,
      campaignSlug: rollup.campaignSlug,
      contentPillarSlug: rollup.contentPillarSlug,
    });
    await prisma.socialMetricDailyRollup.create({
      data: {
        date: toDbDate(rollup.date),
        brandId: brand.id,
        platformId: platform.id,
        campaignId: campaign?.id,
        contentPillarId: pillar?.id,
        postObjective: rollup.postObjective,
        imageType: rollup.imageType ? imageType(rollup.imageType) : undefined,
        totalPosts: rollup.totalPosts,
        totalReach: rollup.totalReach,
        totalImpressions: rollup.totalImpressions,
        totalViews: rollup.totalViews,
        totalEngagements: rollup.totalEngagements,
        totalClicks: rollup.totalClicks,
        totalLeads: rollup.totalLeads,
        totalRevenue: rollup.totalRevenue,
        averageEngagementRate: rollup.averageEngagementRate,
        averageClickRate: rollup.averageClickRate,
        averageConversionRate: rollup.averageConversionRate,
      },
    });
  }

  for (const insight of result.insights) {
    const brand = insight.brandSlug ? await prisma.brand.findUnique({ where: { slug: insight.brandSlug } }) : null;
    const platform = insight.platformSlug ? await prisma.platform.findUnique({ where: { slug: insight.platformSlug } }) : null;
    const campaign = brand && insight.campaignSlug ? await prisma.campaign.findUnique({ where: { brandId_slug: { brandId: brand.id, slug: insight.campaignSlug } } }) : null;
    const pillar = brand && insight.contentPillarSlug ? await prisma.contentPillar.findUnique({ where: { brandId_slug: { brandId: brand.id, slug: insight.contentPillarSlug } } }) : null;
    await prisma.socialPerformanceInsight.create({
      data: {
        dateRangeStart: toDbDate(insight.dateRangeStart),
        dateRangeEnd: toDbDate(insight.dateRangeEnd),
        brandId: brand?.id,
        platformId: platform?.id,
        campaignId: campaign?.id,
        contentPillarId: pillar?.id,
        insightType: socialInsightType(insight.insightType),
        title: insight.title,
        summary: insight.summary,
        evidenceJson: inputJson(insight.evidenceJson),
        recommendation: insight.recommendation,
        confidence: insight.confidence,
        priority: insight.priority,
        status: socialInsightStatus(insight.status),
      },
    });
  }

  await prisma.socialDashboardImport.update({
    where: { id },
    data: { status: socialImportStatus(result.import.status) },
  });

  return result;
}

export async function listSocialImports() {
  requireDatabase();
  return prisma.socialDashboardImport.findMany({
    include: { brand: true, platform: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getSocialPerformanceData() {
  if (!isDatabaseConfigured()) return createSampleSocialImport();
  const snapshots = await prisma.socialMetricSnapshot.findMany({
    include: { brand: true, platform: true, socialPost: true },
    orderBy: { snapshotDate: "desc" },
    take: 200,
  });
  if (!snapshots.length) {
    return {
      import: {
        id: "",
        sourceName: "",
        platformSlug: "",
        brandSlug: "",
        socialAccountId: "",
        importedBy: "",
        importMethod: "manual_entry" as const,
        originalFilename: "",
        originalFileHash: "",
        rawColumnHeaders: [],
        detectedPlatform: "",
        detectedDateRangeStart: "",
        detectedDateRangeEnd: "",
        rowCount: 0,
        status: "imported" as const,
        errorSummary: "",
        mappingTemplateId: "",
        notes: "No confirmed social metric snapshots are persisted yet.",
        previewRows: [],
      },
      socialPosts: [],
      snapshots: [],
      issues: [],
      insights: [],
      rollups: [],
    };
  }
  const postsById = new Map<string, SocialPostRecord>();
  const metrics: SocialMetricSnapshotRecord[] = snapshots.map((snapshot) => {
    if (snapshot.socialPost) {
      postsById.set(snapshot.socialPost.id, {
        id: snapshot.socialPost.id,
        brandSlug: snapshot.brand.slug,
        platformSlug: snapshot.platform.slug,
        socialAccountId: snapshot.socialAccountId || "",
        postDraftId: snapshot.postDraftId || "",
        contentPackId: snapshot.socialPost.contentPackId || "",
        campaignSlug: "",
        contentPillarSlug: "",
        externalPostId: snapshot.socialPost.externalPostId || "",
        postUrl: snapshot.socialPost.postUrl || "",
        postedAt: dateOnly(snapshot.socialPost.postedAt),
        title: snapshot.socialPost.title || "",
        hook: snapshot.socialPost.hook || "",
        bodyPreview: snapshot.socialPost.bodyPreview || "",
        fullCopy: snapshot.socialPost.fullCopy || "",
        mediaType: snapshot.socialPost.mediaType || "",
        imageType: snapshot.socialPost.imageType ? imageTypeOut(snapshot.socialPost.imageType) : "",
        assetFilename: snapshot.socialPost.assetFilename || "",
        ctaType: snapshot.socialPost.ctaType || "",
        postObjective: snapshot.socialPost.postObjective || "",
        contentFingerprint: snapshot.socialPost.contentFingerprint,
        status: snapshot.socialPost.status.toLowerCase() as SocialPostRecord["status"],
      });
    }
    const engagementCount = Number(snapshot.likes || 0) + Number(snapshot.reactions || 0) + Number(snapshot.comments || 0) + Number(snapshot.shares || 0) + Number(snapshot.saves || 0);
    return {
      id: snapshot.id,
      socialPostId: snapshot.socialPostId || "",
      postDraftId: snapshot.postDraftId || "",
      brandSlug: snapshot.brand.slug,
      platformSlug: snapshot.platform.slug,
      socialAccountId: snapshot.socialAccountId || "",
      importId: snapshot.importId || "",
      snapshotDate: dateOnly(snapshot.snapshotDate),
      reportingStartDate: dateOnly(snapshot.reportingStartDate),
      reportingEndDate: dateOnly(snapshot.reportingEndDate),
      rawMetricJson: (snapshot.rawMetricJson || {}) as Record<string, string>,
      platform: snapshot.platform.slug,
      brand: snapshot.brand.slug,
      account: snapshot.socialAccountId || "",
      externalPostId: snapshot.socialPost?.externalPostId || "",
      postUrl: snapshot.socialPost?.postUrl || "",
      postedAt: dateOnly(snapshot.socialPost?.postedAt),
      caption: snapshot.socialPost?.fullCopy || "",
      title: snapshot.socialPost?.title || "",
      contentType: snapshot.socialPost?.mediaType || "",
      mediaType: snapshot.socialPost?.mediaType || "",
      campaign: "",
      contentPillar: "",
      postObjective: snapshot.socialPost?.postObjective || "",
      imageType: snapshot.socialPost?.imageType ? imageTypeOut(snapshot.socialPost.imageType) : "",
      ctaType: snapshot.socialPost?.ctaType || "",
      reach: snapshot.reach || undefined,
      impressions: snapshot.impressions || undefined,
      views: snapshot.views || undefined,
      videoViews: snapshot.videoViews || undefined,
      likes: snapshot.likes || undefined,
      reactions: snapshot.reactions || undefined,
      comments: snapshot.comments || undefined,
      shares: snapshot.shares || undefined,
      saves: snapshot.saves || undefined,
      linkClicks: snapshot.linkClicks || undefined,
      profileVisits: snapshot.profileVisits || undefined,
      follows: snapshot.follows || undefined,
      dms: snapshot.dms || undefined,
      phoneClicks: snapshot.phoneClicks || undefined,
      directionClicks: snapshot.directionClicks || undefined,
      websiteClicks: snapshot.websiteClicks || undefined,
      formSubmissions: snapshot.formSubmissions || undefined,
      leads: snapshot.leads || undefined,
      quoteRequests: snapshot.quoteRequests || undefined,
      bookedCalls: snapshot.bookedCalls || undefined,
      workshopRegistrations: snapshot.workshopRegistrations || undefined,
      purchases: snapshot.purchases || undefined,
      revenue: snapshot.revenue || undefined,
      spend: snapshot.spend || undefined,
      kofiSupport: snapshot.kofiSupport || undefined,
      engagementCount,
      engagementRate: snapshot.engagementRate || 0,
      clickRate: snapshot.ctr || 0,
      conversionRate: snapshot.conversionRate || 0,
    };
  });

  return {
    import: await getSocialImportPreview(snapshots[0]?.importId || "").catch(() => ({
      id: snapshots[0]?.importId || "",
      sourceName: "",
      platformSlug: "",
      brandSlug: "",
      socialAccountId: "",
      importedBy: "",
      importMethod: "manual_entry" as const,
      originalFilename: "",
      originalFileHash: "",
      rawColumnHeaders: [],
      detectedPlatform: "",
      detectedDateRangeStart: "",
      detectedDateRangeEnd: "",
      rowCount: snapshots.length,
      status: "imported" as const,
      errorSummary: "",
      mappingTemplateId: "",
      notes: "Metric snapshots are present, but their source import could not be loaded.",
      previewRows: [],
    })),
    socialPosts: [...postsById.values()],
    snapshots: metrics,
    issues: [],
    insights: generateRuleBasedInsights(metrics, [...postsById.values()]),
    rollups: [],
  };
}

export async function getPersistedSocialInsights(): Promise<SocialPerformanceInsightRecord[]> {
  if (!isDatabaseConfigured()) return createSampleSocialImport().insights;
  const insights = await prisma.socialPerformanceInsight.findMany({
    include: { brand: true, platform: true, campaign: true, contentPillar: true },
    orderBy: [{ status: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
  return insights.map((insight) => ({
    id: insight.id,
    dateRangeStart: dateOnly(insight.dateRangeStart),
    dateRangeEnd: dateOnly(insight.dateRangeEnd),
    brandSlug: insight.brand?.slug || "",
    platformSlug: insight.platform?.slug || "",
    campaignSlug: insight.campaign?.slug || "",
    contentPillarSlug: insight.contentPillar?.slug || "",
    insightType: insight.insightType.toLowerCase() as SocialPerformanceInsightRecord["insightType"],
    title: insight.title,
    summary: insight.summary,
    evidenceJson: insight.evidenceJson,
    recommendation: insight.recommendation,
    confidence: insight.confidence,
    priority: insight.priority,
    status: insight.status.toLowerCase() as SocialPerformanceInsightRecord["status"],
  }));
}

export async function exportSocialWeeklyReportFromDb() {
  const data = await getSocialPerformanceData();
  return exportWeeklySocialReportMarkdown(data.snapshots, data.socialPosts, data.insights);
}

export async function exportSocialMetricsCsvFromDb() {
  const data = await getSocialPerformanceData();
  return exportSocialMetricsCsv(data.snapshots);
}

export async function exportSocialInsightsJsonFromDb() {
  return JSON.stringify(await getPersistedSocialInsights(), null, 2);
}

export function campaignForBrand(brandSlug: string): Campaign {
  return seedCampaigns.find((campaign) => campaign.brandSlug === brandSlug) || seedCampaigns[0];
}

export async function createOperationalPackFromFallback(input: {
  date: string;
  selectedBrands: string[];
  selectedPlatforms: string[];
  strategicPriority: string;
  dailyTheme: string;
  basePack?: GeneratedContentPack;
}) {
  const base = input.basePack || createSampleDailyContentPack(input.date);
  const filteredDrafts = base.postDrafts.filter(
    (draft) => input.selectedBrands.includes(draft.brandSlug) && input.selectedPlatforms.includes(draft.platformSlug),
  );
  const postDrafts = filteredDrafts.length ? filteredDrafts : base.postDrafts.slice(0, 1);
  const ids = new Set(postDrafts.map((draft) => draft.id));
  const imagePrompts = base.imagePrompts.filter((prompt) => ids.has(prompt.postDraftId));
  const approvals = base.approvals.filter((approval) => !approval.postDraftId || ids.has(approval.postDraftId));
  return {
    ...base,
    contentPack: {
      ...base.contentPack,
      date: input.date,
      dailyTheme: input.dailyTheme,
      strategicReason: input.strategicPriority,
      selectedBrands: input.selectedBrands,
      status: "needs_review" as const,
    },
    postDrafts: postDrafts.map((draft) => ({ ...draft, date: input.date, status: "needs_review" as const })),
    imagePrompts: imagePrompts.map((prompt) => ({ ...prompt, status: "needs_review" as const })),
    approvals: approvals.map((approval) => ({ ...approval, status: "pending" as const, approvedAt: "" })),
  };
}
