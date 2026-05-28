import { seedBrands, seedCampaigns, seedContentPillars, seedPlatforms } from "./seed-data";
import type {
  ApprovalRecord,
  DailyPackInput,
  GeneratedContentPack,
  ImagePromptRecord,
  MetricSnapshot,
  PostDraftRecord,
  SocialMetricRecord,
} from "./types";
import { generateAssetFilename, todayIso } from "./utils";

const sampleTheme = "Your online presence should not require a full-time employee to manage.";

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

function pickBrand(slug: string) {
  const brand = seedBrands.find((item) => item.slug === slug);
  if (!brand) throw new Error(`Unknown brand slug: ${slug}`);
  return brand;
}

function pickPlatform(slug: string) {
  const platform = seedPlatforms.find((item) => item.slug === slug);
  if (!platform) throw new Error(`Unknown platform slug: ${slug}`);
  return platform;
}

function pickPillar(brandSlug: string, pillarSlug: string) {
  return (
    seedContentPillars.find((pillar) => pillar.brandSlug === brandSlug && pillar.slug === pillarSlug) ||
    seedContentPillars.find((pillar) => pillar.slug === pillarSlug) ||
    seedContentPillars[0]
  );
}

function pickCampaign(brandSlug: string, campaignSlug: string) {
  return (
    seedCampaigns.find((campaign) => campaign.brandSlug === brandSlug && campaign.slug === campaignSlug) ||
    seedCampaigns.find((campaign) => campaign.brandSlug === brandSlug) ||
    seedCampaigns[0]
  );
}

function aspectRatioFor(platformSlug: string, imageType?: string) {
  if (platformSlug === "instagram" && imageType === "carousel") return "4:5";
  if (platformSlug === "instagram") return "4:5";
  if (platformSlug === "google-business-profile") return "4:3";
  if (platformSlug === "x") return "16:9";
  if (platformSlug === "reddit") return "1:1";
  if (platformSlug === "linkedin" && imageType === "carousel") return "4:5";
  if (platformSlug === "linkedin") return "1.91:1";
  if (platformSlug === "facebook") return "4:5";
  return "1:1";
}

function nowIso() {
  return new Date().toISOString();
}

function createDraft(input: {
  contentPackId: string;
  index: number;
  date: string;
  brandSlug: string;
  platformSlug: string;
  campaignSlug: string;
  contentPillarSlug: string;
  postObjective: string;
  hook: string;
  body: string;
  ctaSoft: string;
  ctaDirect: string;
  hashtags?: string;
  communityTags?: string;
  firstComment?: string;
  replySeeds?: string[];
  redditDisclosure?: string;
  newsletterSubject?: string;
  altText: string;
}): PostDraftRecord {
  const brand = pickBrand(input.brandSlug);
  const platform = pickPlatform(input.platformSlug);
  const campaign = pickCampaign(input.brandSlug, input.campaignSlug);
  const pillar = pickPillar(input.brandSlug, input.contentPillarSlug);

  return {
    id: `${input.contentPackId}-post-${String(input.index).padStart(2, "0")}`,
    contentPackId: input.contentPackId,
    brandSlug: brand.slug,
    brandName: brand.name,
    campaignSlug: campaign.slug,
    campaignName: campaign.name,
    platformSlug: platform.slug,
    platformName: platform.name,
    contentPillarSlug: pillar.slug,
    contentPillarName: pillar.name,
    date: input.date,
    postObjective: input.postObjective,
    hook: input.hook,
    body: input.body,
    ctaSoft: input.ctaSoft,
    ctaDirect: input.ctaDirect,
    hashtags: input.hashtags || "",
    communityTags: input.communityTags || "",
    firstComment: input.firstComment || "",
    replySeeds: input.replySeeds || [],
    redditDisclosure: input.redditDisclosure || "",
    newsletterSubject: input.newsletterSubject || "",
    altText: input.altText,
    status: "needs_review",
    reviewerNotes: "Needs human review before any publishing action.",
    finalCopy: "",
    scheduledDate: "",
    postedUrl: "",
  };
}

function createImagePrompt(input: {
  draft: PostDraftRecord;
  imageType: ImagePromptRecord["imageType"];
  headlineText: string;
  supportingText: string;
  prompt: string;
  negativePrompt?: string;
  layoutNotes: string;
  canvaNotes: string;
  adobeExpressNotes: string;
  photoshopNotes: string;
  existingFilenames: string[];
}): ImagePromptRecord {
  const filename = generateAssetFilename({
    date: input.draft.date,
    brandSlug: input.draft.brandSlug,
    platformSlug: input.draft.platformSlug,
    contentPillarSlug: input.draft.contentPillarSlug,
    campaignSlug: input.draft.campaignSlug,
    existingFilenames: input.existingFilenames,
  });
  input.existingFilenames.push(filename);

  return {
    id: `${input.draft.id}-image-01`,
    postDraftId: input.draft.id,
    brandSlug: input.draft.brandSlug,
    platformSlug: input.draft.platformSlug,
    imageType: input.imageType,
    headlineText: input.headlineText,
    supportingText: input.supportingText,
    prompt: input.prompt,
    negativePrompt:
      input.negativePrompt ||
      "Avoid generic stock-photo energy, cluttered text, fake charts, illegible type, platform logos, and misleading claims.",
    layoutNotes: input.layoutNotes,
    canvaNotes: input.canvaNotes,
    adobeExpressNotes: input.adobeExpressNotes,
    photoshopNotes: input.photoshopNotes,
    altText: input.draft.altText,
    aspectRatio: aspectRatioFor(input.draft.platformSlug, input.imageType),
    filename,
    status: "needs_review",
  };
}

function createApprovals(draft: PostDraftRecord, imagePrompt: ImagePromptRecord): ApprovalRecord[] {
  return [
    {
      id: `${draft.id}-approval-copy`,
      contentPackId: draft.contentPackId,
      postDraftId: draft.id,
      type: "copy",
      status: "pending",
      reviewer: "",
      notes: "Review hook, platform fit, CTA, and final copy.",
      approvedAt: "",
    },
    {
      id: `${draft.id}-approval-image`,
      contentPackId: draft.contentPackId,
      postDraftId: draft.id,
      imagePromptId: imagePrompt.id,
      type: "image_prompt",
      status: "pending",
      reviewer: "",
      notes: "Review prompt, filename, alt text, and design notes.",
      approvedAt: "",
    },
    {
      id: `${draft.id}-approval-full-post`,
      contentPackId: draft.contentPackId,
      postDraftId: draft.id,
      imagePromptId: imagePrompt.id,
      type: "full_post",
      status: "pending",
      reviewer: "",
      notes: "Approve only after copy and image prompt are both ready.",
      approvedAt: "",
    },
  ];
}

export function createSampleDailyContentPack(date = todayIso()): GeneratedContentPack {
  const contentPackId = `pack-${date}-online-presence`;
  const existingFilenames: string[] = [];
  const drafts = [
    createDraft({
      contentPackId,
      index: 1,
      date,
      brandSlug: "signal-workshop",
      platformSlug: "linkedin",
      campaignSlug: "simple-systems-that-work",
      contentPillarSlug: "simple-systems-that-work",
      postObjective: "Build trust around maintainable business systems.",
      hook: "Your online presence should not require a full-time employee to manage.",
      body:
        "A small business does not need a giant content machine.\n\nIt needs a few clear systems:\n\n1. A website that answers the right questions.\n2. A social rhythm that can survive busy weeks.\n3. A simple approval process before anything goes live.\n4. Metrics that tell you what to repeat.\n\nThe goal is not to post everywhere. The goal is to make good work easier to find and easier to trust.",
      ctaSoft: "Save this as a quick systems check.",
      ctaDirect: "Ask Signal Workshop for a practical content operations review.",
      altText: "A simple system map showing website, content rhythm, approval, and metrics.",
    }),
    createDraft({
      contentPackId,
      index: 2,
      date,
      brandSlug: "signal-workshop",
      platformSlug: "facebook",
      campaignSlug: "good-work-better-signal",
      contentPillarSlug: "good-work-better-signal",
      postObjective: "Start a practical small-business conversation.",
      hook: "What part of your online presence feels heavier than it should?",
      body:
        "For a lot of small businesses, the problem is not effort.\n\nIt is that the website, social posts, photos, offers, and follow-up steps all live in separate places.\n\nThat makes every post feel like starting from zero.\n\nA useful system should make the next good action obvious.",
      ctaSoft: "Reply with the part that feels most annoying to keep up with.",
      ctaDirect: "Message Signal Workshop if you want a simpler web/content workflow.",
      firstComment: "A good answer could be: photos, captions, offers, reviews, follow-up, or knowing what to post next.",
      altText: "A clean workflow graphic showing online presence tasks moving into one simple system.",
    }),
    createDraft({
      contentPackId,
      index: 3,
      date,
      brandSlug: "local-signal-websites",
      platformSlug: "instagram",
      campaignSlug: "no-template-websites",
      contentPillarSlug: "simple-packages",
      postObjective: "Create a saveable carousel about low-maintenance websites.",
      hook: "Your website should not need constant babysitting.",
      body:
        "Carousel outline:\n1. Your site should answer the first questions fast.\n2. Your services should be easy to scan.\n3. Your proof should be visible.\n4. Your contact path should be obvious.\n5. Your updates should be simple.\n6. Own the site, do not rent confusion.",
      ctaSoft: "Save this before your next homepage edit.",
      ctaDirect: "Run a free Local Signal website audit.",
      hashtags: "#smallbusinesswebsite #localseo #websitedesign",
      altText: "Instagram carousel explaining how a local business website can stay clear and manageable.",
    }),
    createDraft({
      contentPackId,
      index: 4,
      date,
      brandSlug: "al-brothers",
      platformSlug: "facebook",
      campaignSlug: "punch-list-closeout",
      contentPillarSlug: "builder-closeout-support",
      postObjective: "Build local contractor trust with a builder-friendly proof point.",
      hook: "A clean closeout makes the whole job feel better.",
      body:
        "Punch lists are often where small details start carrying big weight.\n\nDrywall touch-ups, paint fixes, trim details, and exterior repairs can decide how finished the project feels to the homeowner.\n\nAL Brothers helps builders and homeowners close those gaps with practical finish work in Greenville and the Upstate.",
      ctaSoft: "Keep us in mind when the small list needs steady hands.",
      ctaDirect: "Send the punch list and ask about availability.",
      altText: "A contractor closeout checklist for drywall, paint, trim, and exterior repairs.",
    }),
    createDraft({
      contentPackId,
      index: 5,
      date,
      brandSlug: "al-brothers",
      platformSlug: "google-business-profile",
      campaignSlug: "builder-trust",
      contentPillarSlug: "service-area-posts",
      postObjective: "Create a local proof update for Google Business Profile.",
      hook: "Punch list and finish work support in Greenville and the Upstate.",
      body:
        "AL Brothers handles practical closeout and repair work for builders and homeowners, including drywall, paint, finish details, remodeling support, and exterior repairs.\n\nIf a project is close but not quite finished, send the list and we can talk through the next step.",
      ctaSoft: "Save our information for your next closeout list.",
      ctaDirect: "Request a quote.",
      altText: "A local service update for AL Brothers punch list and repair work in Upstate SC.",
    }),
    createDraft({
      contentPackId,
      index: 6,
      date,
      brandSlug: "parallax-hearts",
      platformSlug: "instagram",
      campaignSlug: "vallen-dispatches",
      contentPillarSlug: "field-notes",
      postObjective: "Reconnect the creative audience with an atmospheric fragment.",
      hook: "Field note: the town keeps a record of what people stop saying out loud.",
      body:
        "Some days Vallen sounds less like a place and more like a wet notebook left under a streetlight.\n\nA song can start there: not with a chorus, but with a signal someone tried to ignore.\n\nMore fragments from What the Town Keeps are on the way.",
      ctaSoft: "Follow for the next field note.",
      ctaDirect: "Support the archive when the next Ko-fi note opens.",
      hashtags: "#parallaxhearts #independentmusic #storyworld",
      altText: "A rainy archive-style visual for a Parallax Hearts field note from Vallen.",
    }),
    createDraft({
      contentPackId,
      index: 7,
      date,
      brandSlug: "business-signal-workshop",
      platformSlug: "x",
      campaignSlug: "business-signal-workshop-launch",
      contentPillarSlug: "business-decision-filters",
      postObjective: "Create a concise authority thread about reducing content operations drag.",
      hook: "A business should not need a full-time operator just to stay visible.",
      body:
        "1/ Visibility breaks when every post starts from scratch.\n\n2/ The fix is not more motivation. It is a reusable system.\n\n3/ One theme. Native platform versions. Human approval. Manual publishing. Weekly signal review.\n\n4/ That is enough to turn scattered content into a business asset.\n\n5/ Repeat what creates trust. Stop what only creates noise.",
      ctaSoft: "Steal the rhythm: theme, drafts, approval, export, metrics.",
      ctaDirect: "Join the Business Signal Workshop list for the deeper framework.",
      altText: "A concise thread graphic showing theme, drafts, approval, export, and metrics.",
    }),
  ];

  const imagePrompts = drafts.map((draft) => {
    const type =
      draft.platformSlug === "instagram" && draft.brandSlug === "local-signal-websites"
        ? "carousel"
        : draft.brandSlug === "parallax-hearts"
          ? "field_note"
          : draft.brandSlug === "al-brothers"
            ? draft.platformSlug === "google-business-profile"
              ? "google_business_photo_post"
              : "jobsite_before_after"
            : draft.platformSlug === "x"
              ? "diagram"
              : "checklist";

    return createImagePrompt({
      draft,
      imageType: type,
      headlineText: draft.hook,
      supportingText: draft.ctaSoft,
      prompt: `Create a ${draft.platformName} visual for ${draft.brandName}. Theme: "${sampleTheme}". Hook: "${draft.hook}". Use the brand style, keep text readable on mobile, and clarify the practical signal instead of decorating it.`,
      layoutNotes: "Use clear hierarchy, stable margins, and no overloaded text.",
      canvaNotes: "Build as a reusable template with headline, signal, and next-action zones.",
      adobeExpressNotes: "Keep layout simple enough for fast daily export and brand consistency.",
      photoshopNotes: "Check contrast, crop for platform fit, remove distracting elements, and verify phone readability.",
      existingFilenames,
    });
  });

  return {
    contentPack: {
      id: contentPackId,
      date,
      title: "Online Presence Should Not Need a Full-Time Employee",
      dailyTheme: sampleTheme,
      strategicReason:
        "This theme connects the umbrella promise to every brand: practical systems, lighter content operations, clearer local proof, and human review before publishing.",
      selectedBrands: ["signal-workshop", "local-signal-websites", "al-brothers", "parallax-hearts", "business-signal-workshop"],
      status: "needs_review",
      generatedBy: "deterministic-sample",
      modelUsed: "local-fallback",
      promptVersion: "v1",
      notes: "Sample pack is ready for review and export. Nothing is auto-published.",
    },
    postDrafts: drafts,
    imagePrompts,
    approvals: drafts.flatMap((draft, index) => createApprovals(draft, imagePrompts[index])),
    automationRun: {
      id: `${contentPackId}-run`,
      type: "daily_content_pack",
      status: "succeeded",
      input: { date, theme: sampleTheme },
      output: { postDrafts: drafts.length, imagePrompts: imagePrompts.length },
      error: "",
      startedAt: nowIso(),
      completedAt: nowIso(),
      createdAt: nowIso(),
    },
  };
}

export function createDailyContentPack(input: DailyPackInput = { theme: sampleTheme }) {
  return createSampleDailyContentPack(input.date || todayIso());
}

function csvEscape(value: string | number | undefined) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function exportDailyReviewMarkdown(pack: GeneratedContentPack) {
  return [
    `# Daily Content Pack - ${pack.contentPack.date}`,
    "",
    `**Theme:** ${pack.contentPack.dailyTheme}`,
    `**Strategic reason:** ${pack.contentPack.strategicReason}`,
    `**Status:** ${pack.contentPack.status}`,
    "",
    ...pack.postDrafts.flatMap((draft) => {
      const image = pack.imagePrompts.find((prompt) => prompt.postDraftId === draft.id);
      return [
        `## ${draft.brandName} - ${draft.platformName}`,
        "",
        `**Objective:** ${draft.postObjective}`,
        `**Pillar:** ${draft.contentPillarName}`,
        `**Campaign:** ${draft.campaignName}`,
        `**Approval status:** ${draft.status}`,
        "",
        `**Hook:** ${draft.hook}`,
        "",
        draft.body,
        "",
        `**Soft CTA:** ${draft.ctaSoft}`,
        `**Direct CTA:** ${draft.ctaDirect}`,
        `**Image prompt:** ${image?.prompt || "No image prompt created."}`,
        `**Alt text:** ${draft.altText}`,
        `**Filename:** ${image?.filename || "No filename."}`,
        "",
      ];
    }),
  ].join("\n");
}

export function exportSchedulerCsv(pack: GeneratedContentPack) {
  const approved = pack.postDrafts.filter((draft) => draft.status === "approved");
  const rows = approved.map((draft) => {
    const image = pack.imagePrompts.find((prompt) => prompt.postDraftId === draft.id);
    const copy = draft.finalCopy || [draft.hook, draft.body, draft.ctaDirect].filter(Boolean).join("\n\n");
    return [
      draft.date,
      draft.scheduledDate,
      draft.brandName,
      draft.platformName,
      copy,
      draft.firstComment,
      draft.hashtags,
      image?.filename || "",
      draft.altText,
      draft.reviewerNotes,
    ].map(csvEscape);
  });

  return [
    ["date", "time", "brand", "platform", "post_copy", "first_comment", "hashtags", "image_filename", "alt_text", "notes"].join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
}

export function exportImagePromptsJson(pack: GeneratedContentPack) {
  return JSON.stringify(pack.imagePrompts, null, 2);
}

export function exportAssetManifestJson(pack: GeneratedContentPack) {
  return JSON.stringify(
    {
      contentPackId: pack.contentPack.id,
      date: pack.contentPack.date,
      assets: pack.imagePrompts.map((prompt) => {
        const draft = pack.postDrafts.find((post) => post.id === prompt.postDraftId);
        return {
          contentPackId: pack.contentPack.id,
          postDraftId: prompt.postDraftId,
          imagePromptId: prompt.id,
          brand: draft?.brandName || prompt.brandSlug,
          platform: draft?.platformName || prompt.platformSlug,
          filename: prompt.filename,
          prompt: prompt.prompt,
          altText: prompt.altText,
          canvaNotes: prompt.canvaNotes,
          adobeExpressNotes: prompt.adobeExpressNotes,
          photoshopNotes: prompt.photoshopNotes,
          status: prompt.status,
        };
      }),
    },
    null,
    2,
  );
}

function scoreMetric(metric: Pick<SocialMetricRecord, keyof MetricSnapshot | "likes" | "profileVisits" | "formSubmissions" | "bookedCalls" | "workshopRegistrations" | "quoteRequests" | "kofiSupport">) {
  return (
    metric.engagements * 2 +
    metric.likes +
    metric.comments * 3 +
    metric.shares * 3 +
    metric.saves * 3 +
    metric.clicks * 2 +
    metric.dms * 5 +
    metric.leads * 8 +
    metric.bookedCalls * 10 +
    metric.workshopRegistrations * 10 +
    metric.quoteRequests * 8 +
    metric.kofiSupport * 8 +
    metric.profileVisits +
    metric.formSubmissions * 6
  );
}

export function recommendFromMetrics(metrics: SocialMetricRecord[], drafts: PostDraftRecord[] = []) {
  const ranked = [...metrics]
    .map((metric) => ({ metric, score: scoreMetric(metric) }))
    .sort((a, b) => b.score - a.score);
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  const topDraft = drafts.find((draft) => draft.id === top?.metric.postDraftId);
  const bottomDraft = drafts.find((draft) => draft.id === bottom?.metric.postDraftId);

  return {
    bestPosts: ranked.slice(0, 5),
    recommendations: [
      topDraft
        ? `Repeat this format: ${topDraft.platformName} ${topDraft.contentPillarName} post with the hook "${topDraft.hook}".`
        : "Repeat posts that connect one useful signal to one clear next action.",
      topDraft?.platformSlug === "instagram"
        ? "Turn the strongest carousel into a newsletter section and LinkedIn document post."
        : "Create a follow-up post that expands the strongest audience signal.",
      bottomDraft
        ? `Revise or stop this angle until there is a clearer signal: ${bottomDraft.hook}.`
        : "Stop making formats that create reach without comments, saves, clicks, DMs, leads, or support actions.",
      "Keep export and publishing approved-only. Metrics should inform drafts, not bypass review.",
    ],
  };
}

export function exportWeeklyReportMarkdown(metrics: SocialMetricRecord[], drafts: PostDraftRecord[] = []) {
  const analysis = recommendFromMetrics(metrics, drafts);
  return [
    "# Weekly Social Performance Report",
    "",
    "## Best Posts",
    "",
    ...analysis.bestPosts.map(({ metric, score }, index) => {
      const draft = drafts.find((item) => item.id === metric.postDraftId);
      return `${index + 1}. ${draft?.brandName || metric.brandSlug} / ${draft?.platformName || metric.platformSlug} - score ${score}`;
    }),
    "",
    "## Recommendations",
    "",
    ...analysis.recommendations.map((item) => `- ${item}`),
  ].join("\n");
}

export function sampleMetricsForPack(pack: GeneratedContentPack): SocialMetricRecord[] {
  return pack.postDrafts.slice(0, 4).map((draft, index) => ({
    id: `${draft.id}-metric`,
    postDraftId: draft.id,
    brandSlug: draft.brandSlug,
    platformSlug: draft.platformSlug,
    date: draft.date,
    ...zeroMetrics,
    reach: 600 - index * 90,
    impressions: 800 - index * 100,
    likes: 20 - index * 3,
    engagements: 35 - index * 4,
    comments: 4 - Math.min(index, 3),
    shares: 3 - Math.min(index, 2),
    saves: 5 - Math.min(index, 3),
    clicks: 7 - Math.min(index, 5),
    profileVisits: 8 - Math.min(index, 4),
    formSubmissions: index === 0 ? 1 : 0,
    dms: index === 0 ? 2 : 0,
    leads: index === 0 ? 1 : 0,
    bookedCalls: 0,
    workshopRegistrations: 0,
    quoteRequests: draft.brandSlug === "al-brothers" ? 1 : 0,
    kofiSupport: draft.brandSlug === "parallax-hearts" ? 1 : 0,
    notes: "Sample manual metric row for dashboard and report testing.",
  }));
}
