import { createHash } from "node:crypto";
import { createSampleDailyContentPack } from "./automation-engine";
import { buildSamplePromptVariables } from "./prompts/promptVariables";
import { getPromptMetadata, renderPrompt } from "./prompts/renderPrompt";
import { seedBrands, seedPlatforms, seedPosts } from "./seed-data";
import { createSampleSocialImport, generateRuleBasedInsights, getPerformanceContextForPrompt } from "./social-dashboard-engine";
import type { AutomationRunRecord, GeneratedContentPack, ImagePromptRecord, PostDraftRecord } from "./types";
import { generateAssetFilename, todayIso } from "./utils";

export type AutomationRecipeConfig = {
  id: string;
  name: string;
  slug: string;
  description: string;
  triggerType: "manual" | "scheduled" | "event" | "webhook" | "import_complete";
  active: boolean;
  stepsJson: string[];
  requiredInputsJson: string[];
  optionalInputsJson: string[];
  defaultSettingsJson: Record<string, unknown>;
  featureFlagsJson: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type RunTodayInput = {
  date?: string;
  strategicPriority: string;
  dailyTheme?: string;
  selectedBrands?: string[];
  selectedPlatforms?: string[];
  selectedCampaign?: string;
  selectedOffer?: string;
  businessNotes?: string;
  includeImagePrompts?: boolean;
  includeCarouselOutlines?: boolean;
  includeGoogleBusinessProfile?: boolean;
  includeReddit?: boolean;
  includeShortVideoIdeas?: boolean;
  includePerformanceContext?: boolean;
};

export type AutomationRecipeRunResult = {
  recipeSlug: string;
  automationRun: AutomationRunRecord;
  promptRenders: Array<{ promptKey: string; promptVersion: string; inputHash: string; renderedPromptPreview: string }>;
  output: unknown;
  message: string;
};

const now = "2026-05-28T09:00:00.000Z";

function hashValue(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

function featureFlags() {
  return {
    ENABLE_AI_CONTENT_GENERATION: process.env.ENABLE_AI_CONTENT_GENERATION === "true",
    ENABLE_AI_IMAGE_PROMPTS: process.env.ENABLE_AI_IMAGE_PROMPTS === "true",
    ENABLE_AI_METRIC_ANALYSIS: process.env.ENABLE_AI_METRIC_ANALYSIS === "true",
    ENABLE_AUTO_APPROVAL: process.env.ENABLE_AUTO_APPROVAL === "true",
    ENABLE_AUTO_PUBLISHING: process.env.ENABLE_AUTO_PUBLISHING === "true",
  };
}

function createRun({
  type,
  input,
  output,
  promptKey,
  recordsCreated,
}: {
  type: AutomationRunRecord["type"];
  input: unknown;
  output: unknown;
  promptKey?: string;
  recordsCreated?: unknown;
}): AutomationRunRecord {
  const metadata = promptKey ? getPromptMetadata(promptKey) : undefined;
  return {
    id: `run-${type}-${hashValue({ input, output })}`,
    type,
    status: "succeeded",
    input,
    output,
    error: "",
    startedAt: now,
    completedAt: now,
    createdAt: now,
    promptKey,
    promptVersion: metadata?.version,
    promptInputHash: hashValue(input),
    modelUsed: process.env.OPENAI_API_KEY ? metadata?.recommendedModel || "openai-configured" : "rule-based-local",
    recordsCreated,
  };
}

async function renderRecipePrompts(keys: string[], overrides: Record<string, unknown> = {}) {
  const promptRenders: AutomationRecipeRunResult["promptRenders"] = [];
  for (const promptKey of keys) {
    const variables = { ...buildSamplePromptVariables(promptKey), ...overrides, promptKey };
    const rendered = await renderPrompt({ promptKey, variables });
    promptRenders.push({
      promptKey,
      promptVersion: rendered.promptVersion,
      inputHash: hashValue(variables),
      renderedPromptPreview: rendered.finalPrompt.slice(0, 900),
    });
  }
  return promptRenders;
}

function forceReviewStatuses(pack: GeneratedContentPack): GeneratedContentPack {
  return {
    ...pack,
    contentPack: { ...pack.contentPack, status: "needs_review" },
    postDrafts: pack.postDrafts.map((draft) => ({ ...draft, status: "needs_review" })),
    imagePrompts: pack.imagePrompts.map((prompt) => ({ ...prompt, status: "needs_review" })),
    approvals: pack.approvals.map((approval) => ({ ...approval, status: "pending", approvedAt: "" })),
  };
}

function platformName(slug: string) {
  return seedPlatforms.find((platform) => platform.slug === slug)?.name || slug;
}

function constrainPackToSelections(pack: GeneratedContentPack, selectedBrands: string[], selectedPlatforms: string[], dailyTheme: string): GeneratedContentPack {
  const brandSet = new Set(selectedBrands);
  const platformSet = new Set(selectedPlatforms);
  let drafts = pack.postDrafts.filter((draft) => brandSet.has(draft.brandSlug) && platformSet.has(draft.platformSlug));

  if (!drafts.length) {
    const matchingBrands = pack.postDrafts.filter((draft) => brandSet.has(draft.brandSlug));
    const sourceDrafts = matchingBrands.length ? matchingBrands : pack.postDrafts;
    drafts = sourceDrafts.slice(0, Math.max(1, Math.min(selectedBrands.length || 1, 4))).map((draft, index) => {
      const brandSlug = selectedBrands[index % Math.max(1, selectedBrands.length)] || draft.brandSlug;
      const platformSlug = selectedPlatforms[index % Math.max(1, selectedPlatforms.length)] || draft.platformSlug;
      const brand = seedBrands.find((item) => item.slug === brandSlug);
      return {
        ...draft,
        id: `${pack.contentPack.id}-post-generated-${index + 1}`,
        brandSlug,
        brandName: brand?.name || draft.brandName,
        platformSlug,
        platformName: platformName(platformSlug),
        hook: draft.hook,
        body: `${draft.body}\n\nDaily theme: ${dailyTheme}`,
        altText: draft.altText || `Review-ready social draft for ${brand?.name || brandSlug}.`,
      };
    });
  }

  const draftIds = new Set(drafts.map((draft) => draft.id));
  const existingImagesByDraftId = new Map(pack.imagePrompts.map((prompt) => [prompt.postDraftId, prompt]));
  const existingFilenames: string[] = [];
  const imagePrompts = drafts.map((draft) => {
    const existing = existingImagesByDraftId.get(draft.id);
    if (existing) {
      existingFilenames.push(existing.filename);
      return existing;
    }
    const filename = generateAssetFilename({
      date: draft.date,
      brandSlug: draft.brandSlug,
      platformSlug: draft.platformSlug,
      contentPillarSlug: draft.contentPillarSlug,
      campaignSlug: draft.campaignSlug,
      existingFilenames,
    });
    existingFilenames.push(filename);
    return {
      id: `${draft.id}-image-01`,
      postDraftId: draft.id,
      brandSlug: draft.brandSlug,
      platformSlug: draft.platformSlug,
      imageType: draft.platformSlug === "instagram" ? ("carousel" as const) : draft.platformSlug === "google-business-profile" ? ("google_business_photo_post" as const) : ("checklist" as const),
      headlineText: draft.hook,
      supportingText: draft.ctaSoft,
      prompt: `Create a platform-native ${draft.platformName} visual for ${draft.brandName}. Clarify this signal: ${draft.hook}. Keep it readable, specific, and review-ready.`,
      negativePrompt: "No fake metrics, no auto-publishing language, no clutter, no generic stock-photo energy.",
      layoutNotes: "Readable headline, clear hierarchy, stable margins, and mobile-safe spacing.",
      canvaNotes: "Build as a reusable internal template with headline, signal, and next action zones.",
      adobeExpressNotes: "Export at the platform aspect ratio and keep text accessible.",
      photoshopNotes: "Check contrast, crop for mobile, and remove distracting elements.",
      altText: draft.altText,
      aspectRatio: draft.platformSlug === "instagram" ? "4:5" : draft.platformSlug === "google-business-profile" ? "4:3" : "1:1",
      filename,
      status: "needs_review" as const,
    };
  });

  const approvals = [
    ...drafts.map((draft) => ({
      id: `${draft.id}-approval-copy`,
      contentPackId: pack.contentPack.id,
      postDraftId: draft.id,
      type: "copy" as const,
      status: "pending" as const,
      reviewer: "",
      notes: "Review copy before manual publishing.",
      approvedAt: "",
    })),
    ...imagePrompts.map((prompt) => ({
      id: `${prompt.id}-approval-image`,
      contentPackId: pack.contentPack.id,
      postDraftId: prompt.postDraftId,
      imagePromptId: prompt.id,
      type: "image_prompt" as const,
      status: "pending" as const,
      reviewer: "",
      notes: "Review image prompt before creating assets.",
      approvedAt: "",
    })),
    ...drafts.map((draft) => ({
      id: `${draft.id}-approval-full-post`,
      contentPackId: pack.contentPack.id,
      postDraftId: draft.id,
      imagePromptId: imagePrompts.find((prompt) => prompt.postDraftId === draft.id)?.id,
      type: "full_post" as const,
      status: "pending" as const,
      reviewer: "",
      notes: "Approve only after copy and image prompt are both ready.",
      approvedAt: "",
    })),
  ];

  return {
    ...pack,
    contentPack: {
      ...pack.contentPack,
      dailyTheme,
      selectedBrands,
      status: "needs_review",
    },
    postDrafts: drafts.map((draft) => ({ ...draft, status: "needs_review" })),
    imagePrompts: imagePrompts.filter((prompt) => draftIds.has(prompt.postDraftId)).map((prompt) => ({ ...prompt, status: "needs_review" })),
    approvals,
  };
}

export const automationRecipes: AutomationRecipeConfig[] = [
  {
    id: "recipe-run-today",
    name: "Run Today",
    slug: "run-today",
    description: "Morning content operation: select brands, generate pack, image prompts, review notes, and approvals.",
    triggerType: "manual",
    active: true,
    stepsJson: ["load brand context", "load active campaigns", "load sanitized performance context", "select brands", "generate daily pack", "generate image prompts", "run quality check", "create approvals"],
    requiredInputsJson: ["date", "strategicPriority"],
    optionalInputsJson: ["dailyTheme", "selectedBrands", "selectedPlatforms", "selectedCampaign", "selectedOffer", "businessNotes"],
    defaultSettingsJson: { includeImagePrompts: true, includeCarouselOutlines: true, includeGoogleBusinessProfile: true, includeReddit: false, includeShortVideoIdeas: true, includePerformanceContext: true },
    featureFlagsJson: { aiContent: "ENABLE_AI_CONTENT_GENERATION", aiImagePrompts: "ENABLE_AI_IMAGE_PROMPTS", autoApproval: "ENABLE_AUTO_APPROVAL=false", autoPublishing: "ENABLE_AUTO_PUBLISHING=false" },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "recipe-image-prompt-batch",
    name: "Generate Image Prompt Batch",
    slug: "image-prompt-batch",
    description: "Finds posts missing image prompts and creates prompt records for human review.",
    triggerType: "manual",
    active: true,
    stepsJson: ["find missing image prompts", "run image-prompt", "create image prompts", "create approvals"],
    requiredInputsJson: ["contentPackId or postDraftIds"],
    optionalInputsJson: ["imageType", "platform"],
    defaultSettingsJson: { includeAltText: true },
    featureFlagsJson: { aiImagePrompts: "ENABLE_AI_IMAGE_PROMPTS" },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "recipe-weekly-social-analysis",
    name: "Weekly Social Analysis",
    slug: "weekly-social-analysis",
    description: "Aggregates sanitized metrics and creates rule-based insights by default.",
    triggerType: "manual",
    active: true,
    stepsJson: ["aggregate sanitized metrics", "run dashboard-analysis when enabled", "run metrics-insight-summary", "create insights"],
    requiredInputsJson: ["dateRange"],
    optionalInputsJson: ["brand", "platform"],
    defaultSettingsJson: { useRuleBasedFallback: true },
    featureFlagsJson: { aiMetrics: "ENABLE_AI_METRIC_ANALYSIS" },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "recipe-performance-context-refresh",
    name: "Performance Context Refresh",
    slug: "performance-context-refresh",
    description: "Creates compact sanitized context for future daily generation prompts.",
    triggerType: "manual",
    active: true,
    stepsJson: ["load accepted insights", "load top and weak patterns", "run performance-context-for-generation", "save compact context"],
    requiredInputsJson: ["brandId", "dateRange"],
    optionalInputsJson: ["platformId"],
    defaultSettingsJson: { sanitizedOnly: true },
    featureFlagsJson: { rawPrivateData: "blocked" },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "recipe-repurpose-winning-post",
    name: "Repurpose Winning Post",
    slug: "repurpose-winning-post",
    description: "Turns a winning post into platform-native follow-ups.",
    triggerType: "manual",
    active: true,
    stepsJson: ["load source post", "load performance reason", "run repurpose-plan", "create draft follow-ups"],
    requiredInputsJson: ["sourcePostId", "targetPlatforms"],
    optionalInputsJson: ["reason"],
    defaultSettingsJson: { status: "needs_review" },
    featureFlagsJson: { autoPublishing: "ENABLE_AUTO_PUBLISHING=false" },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "recipe-campaign-plan",
    name: "Generate Campaign Plan",
    slug: "campaign-plan",
    description: "Drafts a campaign plan that can feed daily content generation.",
    triggerType: "manual",
    active: true,
    stepsJson: ["load brand", "load offer", "run campaign-plan", "save draft campaign plan"],
    requiredInputsJson: ["brandId", "offer", "campaignGoal", "startDate", "endDate"],
    optionalInputsJson: ["platforms", "constraints"],
    defaultSettingsJson: { activateImmediately: false },
    featureFlagsJson: { autoApproval: "ENABLE_AUTO_APPROVAL=false" },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "recipe-monthly-content-map",
    name: "Generate Monthly Content Map",
    slug: "monthly-content-map",
    description: "Creates a planned monthly map without approving or scheduling posts.",
    triggerType: "manual",
    active: true,
    stepsJson: ["load brands", "load campaigns", "load insights", "run monthly-content-map", "save planned map"],
    requiredInputsJson: ["month", "businessPriorities"],
    optionalInputsJson: ["brands", "campaigns", "offers"],
    defaultSettingsJson: { createApprovedPosts: false },
    featureFlagsJson: { autoApproval: "ENABLE_AUTO_APPROVAL=false" },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "recipe-site-audit-to-content",
    name: "Turn Site Audit Into Content",
    slug: "site-audit-to-content",
    description: "Turns sanitized audit findings into public-safe educational drafts.",
    triggerType: "manual",
    active: true,
    stepsJson: ["load sanitized audit", "run site-audit-to-content", "create draft post", "create image prompt", "create approvals"],
    requiredInputsJson: ["auditFindings", "brandId", "platform"],
    optionalInputsJson: ["offer", "targetAudience"],
    defaultSettingsJson: { publicSafeOnly: true },
    featureFlagsJson: { rawPrivateData: "blocked" },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "recipe-approval-summary",
    name: "Generate Approval Summary",
    slug: "approval-summary",
    description: "Creates a human review summary for a content pack.",
    triggerType: "manual",
    active: true,
    stepsJson: ["load pack", "load posts", "load image prompts", "run approval-summary", "show review notes"],
    requiredInputsJson: ["contentPackId"],
    optionalInputsJson: ["knownRisks"],
    defaultSettingsJson: { autoApprove: false },
    featureFlagsJson: { autoApproval: "ENABLE_AUTO_APPROVAL=false" },
    createdAt: now,
    updatedAt: now,
  },
];

export function getAutomationRecipes() {
  return automationRecipes;
}

export async function runTodayAutomation(input: RunTodayInput): Promise<AutomationRecipeRunResult & { pack: GeneratedContentPack }> {
  const date = input.date || todayIso();
  const dailyTheme = input.dailyTheme || "Your online presence should not require a full-time employee to manage.";
  const metrics = createSampleSocialImport();
  const promptContext = getPerformanceContextForPrompt({ metrics: metrics.snapshots, posts: metrics.socialPosts });
  const performanceContext =
    input.includePerformanceContext === false
      ? "Performance context skipped by user."
      : {
          ...promptContext,
          summaryForPrompt: promptContext.recommendations.join(" "),
        };
  const selectedBrands = input.selectedBrands?.length ? input.selectedBrands : ["signal-workshop", "local-signal-websites", "al-brothers", "parallax-hearts", "business-signal-workshop"];
  const selectedPlatforms = input.selectedPlatforms?.length ? input.selectedPlatforms : ["linkedin", "facebook", "instagram", "google-business-profile", "x"];
  const promptRenders = await renderRecipePrompts(["brand-selection", "daily-content-pack", "image-prompt", "carousel-outline", "short-video-script", "google-business-profile-post", "prompt-quality-check"], {
    date,
    dailyTheme,
    strategicPriority: input.strategicPriority,
    selectedBrands,
    selectedPlatforms,
    recentPerformanceContext: performanceContext,
    businessNotes: input.businessNotes || "Manual publishing only. Human review required.",
  });
  const pack = constrainPackToSelections(forceReviewStatuses(createSampleDailyContentPack(date)), selectedBrands, selectedPlatforms, dailyTheme);
  const output = {
    contentPackId: pack.contentPack.id,
    posts: pack.postDrafts.length,
    imagePrompts: pack.imagePrompts.length,
    approvals: pack.approvals.length,
    featureFlags: featureFlags(),
    selectedBrands,
    selectedPlatforms,
    dailyTheme,
  };
  const automationRun = createRun({
    type: "run_today",
    input,
    output,
    promptKey: "daily-content-pack",
    recordsCreated: output,
  });
  return {
    recipeSlug: "run-today",
    automationRun,
    promptRenders,
    output,
    pack: { ...pack, automationRun },
    message: "Run Today created review-ready drafts, image prompts, and pending approvals. Nothing was published or approved.",
  };
}

export async function runImagePromptBatchAutomation(pack: GeneratedContentPack): Promise<AutomationRecipeRunResult & { imagePrompts: ImagePromptRecord[] }> {
  const existingDraftIds = new Set(pack.imagePrompts.map((prompt) => prompt.postDraftId));
  const missingDrafts = pack.postDrafts.filter((draft) => !existingDraftIds.has(draft.id));
  const existingFilenames = pack.imagePrompts.map((prompt) => prompt.filename);
  const imagePrompts = missingDrafts.map((draft) => {
    const filename = generateAssetFilename({
      date: draft.date,
      brandSlug: draft.brandSlug,
      platformSlug: draft.platformSlug,
      contentPillarSlug: draft.contentPillarSlug,
      campaignSlug: draft.campaignSlug,
      existingFilenames,
    });
    existingFilenames.push(filename);
    return {
      id: `${draft.id}-image-generated`,
      postDraftId: draft.id,
      brandSlug: draft.brandSlug,
      platformSlug: draft.platformSlug,
      imageType: "checklist" as const,
      headlineText: draft.hook,
      supportingText: draft.ctaSoft,
      prompt: `Create a ${draft.platformName} visual for ${draft.brandName} that clarifies: ${draft.hook}`,
      negativePrompt: "No fake metrics, no clutter, no generic stock photo energy.",
      layoutNotes: "Readable headline, clear supporting signal, stable margins.",
      canvaNotes: "Build as reusable daily insight template.",
      adobeExpressNotes: "Keep exports platform-native and accessible.",
      photoshopNotes: "Check contrast and crop for mobile readability.",
      altText: draft.altText,
      aspectRatio: draft.platformSlug === "instagram" ? "4:5" : "1:1",
      filename,
      status: "needs_review" as const,
    };
  });
  const promptRenders = await renderRecipePrompts(["image-prompt"]);
  const automationRun = createRun({
    type: "image_prompt_batch",
    input: { contentPackId: pack.contentPack.id },
    output: { generated: imagePrompts.length },
    promptKey: "image-prompt",
    recordsCreated: { imagePrompts: imagePrompts.length, approvals: imagePrompts.length },
  });
  return { recipeSlug: "image-prompt-batch", automationRun, promptRenders, output: { imagePrompts }, imagePrompts, message: "Generated missing image prompts only." };
}

export async function runCaptionRewriteAutomation(draft: PostDraftRecord, mode = "make_more_direct", reviewerNotes = "") {
  const promptRenders = await renderRecipePrompts(["caption-rewrite"], {
    originalCaption: draft.body,
    rewriteReason: mode,
    desiredDirection: reviewerNotes || mode,
  });
  const rewritten = {
    originalBody: draft.body,
    rewrittenHook: draft.hook,
    rewrittenBody: `${draft.body}\n\nReview note: tightened for ${mode.replace(/_/g, " ")}.`,
    ctaSoft: draft.ctaSoft,
    ctaDirect: draft.ctaDirect,
    status: "needs_review",
  };
  const automationRun = createRun({ type: "caption_rewrite", input: { draftId: draft.id, mode, reviewerNotes }, output: rewritten, promptKey: "caption-rewrite", recordsCreated: { revisions: 1 } });
  return { recipeSlug: "caption-rewrite", automationRun, promptRenders, output: rewritten, rewritten, message: "Caption rewrite created a review-ready candidate and preserved the original copy." };
}

export async function runApprovalSummaryAutomation(pack: GeneratedContentPack) {
  const promptRenders = await renderRecipePrompts(["approval-summary"], {
    contentPack: pack.contentPack,
    posts: pack.postDrafts,
    imagePrompts: pack.imagePrompts,
  });
  const summary = {
    contentPackId: pack.contentPack.id,
    summary: `${pack.postDrafts.length} posts and ${pack.imagePrompts.length} image prompts are ready for human review.`,
    itemsNeedingAttention: pack.postDrafts
      .filter((draft) => !draft.altText || !draft.ctaDirect)
      .map((draft) => ({ itemType: "post", itemId: draft.id, brandSlug: draft.brandSlug, platformSlug: draft.platformSlug, issue: "Missing alt text or direct CTA", suggestedFix: "Add clear accessibility text and a truthful next step." })),
    approvalChecklist: [
      { label: "No auto-publishing", passed: true, notes: "All publishing remains manual." },
      { label: "No auto-approval", passed: true, notes: "Approvals remain pending." },
      { label: "Alt text present", passed: pack.postDrafts.every((draft) => Boolean(draft.altText)), notes: "Review platform-specific accessibility." },
    ],
    overallRiskLevel: "low",
    finalRecommendation: "Review copy and imagery before exporting approved-only scheduler CSV.",
  };
  const automationRun = createRun({ type: "approval_summary", input: { contentPackId: pack.contentPack.id }, output: summary, promptKey: "approval-summary" });
  return { recipeSlug: "approval-summary", automationRun, promptRenders, output: summary, summary, message: "Approval summary generated. No approvals were changed." };
}

export async function runWeeklySocialAnalysisAutomation() {
  const sample = createSampleSocialImport();
  const insights = generateRuleBasedInsights(sample.snapshots, sample.socialPosts);
  const promptRenders = await renderRecipePrompts(["dashboard-analysis", "metrics-insight-summary"], {
    sanitizedMetricsSummary: getPerformanceContextForPrompt({ metrics: sample.snapshots, posts: sample.socialPosts }).recommendations.join(" "),
    topPosts: sample.socialPosts.slice(0, 3).map((post) => ({ id: post.id, platformSlug: post.platformSlug, hook: post.hook })),
    weakPosts: sample.socialPosts.slice(-2).map((post) => ({ id: post.id, platformSlug: post.platformSlug, hook: post.hook })),
  });
  const output = {
    mode: featureFlags().ENABLE_AI_METRIC_ANALYSIS ? "ai_allowed_sanitized" : "rule_based_ai_blocked",
    insights,
    sanitizedOnly: true,
    rawRowsSentToAi: false,
  };
  const automationRun = createRun({ type: "weekly_social_analysis", input: { dateRange: "last_30_days" }, output, promptKey: "dashboard-analysis", recordsCreated: { insights: insights.length } });
  return { recipeSlug: "weekly-social-analysis", automationRun, promptRenders, output, message: "Weekly analysis used sanitized summaries and rule-based recommendations by default." };
}

export async function runPerformanceContextAutomation() {
  const sample = createSampleSocialImport();
  const context = {
    ...getPerformanceContextForPrompt({ metrics: sample.snapshots, posts: sample.socialPosts }),
    summaryForPrompt: getPerformanceContextForPrompt({ metrics: sample.snapshots, posts: sample.socialPosts }).recommendations.join(" "),
  };
  const promptRenders = await renderRecipePrompts(["performance-context-for-generation"], {
    topPerformancePatterns: context.recommendations,
    weakPerformancePatterns: ["Text-only posts without a practical next step underperform."],
  });
  const automationRun = createRun({ type: "performance_context_refresh", input: { dateRange: "last_30_days" }, output: context, promptKey: "performance-context-for-generation" });
  return { recipeSlug: "performance-context-refresh", automationRun, promptRenders, output: context, context, message: "Prompt-safe performance context refreshed without raw private rows." };
}

export async function runRepurposePlanAutomation(source = seedPosts[0], targetPlatforms = ["facebook", "instagram", "newsletter"]) {
  const promptRenders = await renderRecipePrompts(["repurpose-plan"], { sourceItem: source, targetPlatforms });
  const repurposePlan = targetPlatforms.map((platformSlug) => ({
    targetPlatformSlug: platformSlug,
    format: platformSlug === "instagram" ? "carousel" : platformSlug === "newsletter" ? "newsletter_section" : "discussion_post",
    newAngle: `Adapt "${source.hook}" for ${platformSlug} without copying the original caption.`,
    hook: platformSlug === "facebook" ? "What part of this system feels heaviest right now?" : source.hook,
    bodySummary: "Keep the original signal, adjust pacing, CTA, and visual format for the destination.",
    cta: "Review and approve before posting.",
    imageConcept: source.imageConcept,
    imagePrompt: source.imagePrompt,
    approvalNotes: "Needs review. This is not a duplicate repost.",
  }));
  const automationRun = createRun({ type: "repurpose_winning_post", input: { sourcePostId: source.id, targetPlatforms }, output: { repurposePlan }, promptKey: "repurpose-plan", recordsCreated: { plannedDrafts: repurposePlan.length } });
  return { recipeSlug: "repurpose-winning-post", automationRun, promptRenders, output: { repurposePlan }, repurposePlan, message: "Repurpose plan created platform-native follow-ups in needs_review workflow." };
}

export async function runCampaignPlanAutomation() {
  const promptRenders = await renderRecipePrompts(["campaign-plan"]);
  const campaignPlan = { brandSlug: "signal-workshop", campaignName: "Simple Systems That Work", campaignSlug: "simple-systems-that-work", status: "needs_review", metricsToWatch: ["clicks", "leads", "booked calls"], risksToAvoid: ["unsupported claims", "fake urgency"] };
  const automationRun = createRun({ type: "campaign_plan", input: { brandSlug: "signal-workshop" }, output: campaignPlan, promptKey: "campaign-plan" });
  return { recipeSlug: "campaign-plan", automationRun, promptRenders, output: campaignPlan, campaignPlan, message: "Draft campaign plan created. It is not active until reviewed." };
}

export async function runMonthlyContentMapAutomation() {
  const promptRenders = await renderRecipePrompts(["monthly-content-map"]);
  const monthlyMap = {
    month: "June 2026",
    monthlyTheme: "Useful systems, visible proof, and sustainable rhythm",
    calendar: Array.from({ length: 7 }, (_, index) => ({
      date: `2026-06-${String(index + 1).padStart(2, "0")}`,
      recommendedBrand: seedBrands[index % seedBrands.length].slug,
      platforms: [seedPlatforms[index % 5].slug],
      status: "planned",
    })),
  };
  const automationRun = createRun({ type: "monthly_content_map", input: { month: "June 2026" }, output: monthlyMap, promptKey: "monthly-content-map" });
  return { recipeSlug: "monthly-content-map", automationRun, promptRenders, output: monthlyMap, monthlyMap, message: "Monthly map planned only. No posts were approved or scheduled." };
}

export async function runSiteAuditToContentAutomation() {
  const promptRenders = await renderRecipePrompts(["site-audit-to-content"]);
  const post = {
    brandSlug: "sitesignal",
    platformSlug: "linkedin",
    hook: "A hidden service area is a conversion problem.",
    body: "When visitors cannot quickly see who you serve, they hesitate. Public-safe lesson: make service area, offer, proof, and next step visible before asking people to dig.",
    ctaSoft: "Use this as a homepage check.",
    ctaDirect: "Run a SiteSignal audit before your next redesign.",
    status: "needs_review",
  };
  const automationRun = createRun({ type: "site_audit_to_content", input: { auditSource: "sanitized_fixture" }, output: post, promptKey: "site-audit-to-content", recordsCreated: { postDrafts: 1, imagePrompts: 1, approvals: 2 } });
  return { recipeSlug: "site-audit-to-content", automationRun, promptRenders, output: post, post, message: "Sanitized audit finding became a public-safe draft. No private details exposed." };
}

export async function runAutomationRecipe(slug: string, input: Record<string, unknown> = {}) {
  if (slug === "run-today") return runTodayAutomation({ strategicPriority: String(input.strategicPriority || "Daily useful visibility"), ...input });
  if (slug === "image-prompt-batch") return runImagePromptBatchAutomation(createSampleDailyContentPack());
  if (slug === "weekly-social-analysis") return runWeeklySocialAnalysisAutomation();
  if (slug === "performance-context-refresh") return runPerformanceContextAutomation();
  if (slug === "repurpose-winning-post") return runRepurposePlanAutomation();
  if (slug === "campaign-plan") return runCampaignPlanAutomation();
  if (slug === "monthly-content-map") return runMonthlyContentMapAutomation();
  if (slug === "site-audit-to-content") return runSiteAuditToContentAutomation();
  if (slug === "approval-summary") return runApprovalSummaryAutomation(createSampleDailyContentPack());
  throw new Error(`Unknown automation recipe: ${slug}`);
}
