import type { ApprovalStatus, DailyPackInput, GeneratedPost, PostVariant } from "./types";
import { seedBrands, seedContentPillars, seedPlatforms, seedPosts } from "./seed-data";
import { makeAssetFilename, slugify, todayIso } from "./utils";

export const requiredCsvHeaders = [
  "date",
  "brand",
  "platform",
  "campaign",
  "content_pillar",
  "objective",
  "hook",
  "body",
  "cta",
  "image_concept",
  "image_prompt",
  "alt_text",
  "hashtags",
  "asset_filename",
  "approval_status",
  "publishing_status",
  "final_url",
  "review_notes",
  "reach",
  "impressions",
  "engagements",
  "comments",
  "shares",
  "saves",
  "clicks",
  "dms",
  "leads",
  "registrations",
] as const;

export function canTransitionApproval(from: ApprovalStatus, to: ApprovalStatus) {
  if (from === "posted" && to !== "archived") return false;
  if (to === "posted" && from !== "approved" && from !== "scheduled") return false;
  if (to === "scheduled" && from !== "approved") return false;
  return true;
}

export function validateNoAutoPublish(post: Pick<PostVariant, "approvalStatus" | "publishingStatus">) {
  if (post.publishingStatus === "posted" && post.approvalStatus !== "approved") {
    throw new Error("Posts cannot be marked posted until they are approved.");
  }
}

export function csvEscape(value: string | number | undefined) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function stringifyPostsCsv(posts: PostVariant[]) {
  const rows = posts.map((post) =>
    [
      post.date,
      post.brandName,
      post.platformName,
      post.campaign,
      post.contentPillarName,
      post.objective,
      post.hook,
      post.body,
      post.cta,
      post.imageConcept,
      post.imagePrompt,
      post.altText,
      post.hashtags,
      post.assetFilename,
      post.approvalStatus,
      post.publishingStatus,
      post.finalUrl,
      post.reviewNotes,
      post.metrics.reach,
      post.metrics.impressions,
      post.metrics.engagements,
      post.metrics.comments,
      post.metrics.shares,
      post.metrics.saves,
      post.metrics.clicks,
      post.metrics.dms,
      post.metrics.leads,
      post.metrics.registrations,
    ].map(csvEscape),
  );
  return [requiredCsvHeaders.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted && char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(current);
      current = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}

export function exportMarkdownReview(posts: PostVariant[]) {
  return [
    "# SSWApp Content Review Pack",
    "",
    ...posts.flatMap((post) => [
      `## ${post.date} - ${post.brandName} - ${post.platformName}`,
      "",
      `**Status:** ${post.approvalStatus} / ${post.publishingStatus}`,
      `**Campaign:** ${post.campaign}`,
      `**Pillar:** ${post.contentPillarName}`,
      `**Objective:** ${post.objective}`,
      "",
      `**Hook:** ${post.hook}`,
      "",
      post.body,
      "",
      `**CTA:** ${post.cta}`,
      `**Image concept:** ${post.imageConcept}`,
      `**Image prompt:** ${post.imagePrompt}`,
      `**Alt text:** ${post.altText}`,
      `**Asset filename:** ${post.assetFilename}`,
      `**Review notes:** ${post.reviewNotes || "None"}`,
      "",
    ]),
  ].join("\n");
}

export function exportImagePromptBatch(posts: PostVariant[]) {
  return posts
    .map((post) => ({
      date: post.date,
      brand: post.brandName,
      platform: post.platformName,
      format: post.platformSlug === "instagram" ? "carousel" : "post graphic",
      headlineText: post.hook,
      prompt: post.imagePrompt,
      canvaNotes: "Use clear hierarchy, generous whitespace, and no overloaded text.",
      photoshopNotes: "Check mobile readability, contrast, crop, and remove distracting details.",
      altText: post.altText,
      filename: post.assetFilename,
    }))
    .map((asset) => JSON.stringify(asset, null, 2))
    .join("\n\n");
}

export function approvedOnly(posts: PostVariant[]) {
  return posts.filter((post) => post.approvalStatus === "approved");
}

export function rankPosts(posts: PostVariant[]) {
  return [...posts]
    .map((post) => ({
      post,
      score:
        post.metrics.engagements * 2 +
        post.metrics.comments * 3 +
        post.metrics.shares * 3 +
        post.metrics.saves * 3 +
        post.metrics.clicks * 2 +
        post.metrics.dms * 5 +
        post.metrics.leads * 8 +
        post.metrics.registrations * 10,
    }))
    .sort((a, b) => b.score - a.score);
}

export function weeklyReport(posts: PostVariant[]) {
  const ranked = rankPosts(posts);
  const best = ranked.slice(0, 5).map(({ post, score }) => ({
    id: post.id,
    hook: post.hook,
    brand: post.brandName,
    platform: post.platformName,
    pillar: post.contentPillarName,
    score,
  }));
  const pillarTotals = new Map<string, number>();
  ranked.forEach(({ post, score }) => {
    pillarTotals.set(post.contentPillarName, (pillarTotals.get(post.contentPillarName) || 0) + score);
  });

  return {
    bestPosts: best,
    bestPillars: [...pillarTotals.entries()]
      .map(([pillar, score]) => ({ pillar, score }))
      .sort((a, b) => b.score - a.score),
    recommendations: [
      "Repeat posts that connect one practical signal to one clear next action.",
      "Keep Reddit versions non-promotional and discussion-first.",
      "Move approved posts into manual publishing only after copy and image prompts are reviewed.",
    ],
  };
}

export function buildFallbackDailyPack(input: DailyPackInput): GeneratedPost[] {
  const date = input.date || todayIso();
  const brand = seedBrands.find((item) => item.slug === input.brandSlug) || seedBrands[0];
  const platforms = seedPlatforms.filter((platform) =>
    ["facebook", "instagram", "linkedin", "x", "reddit", "newsletter"].includes(platform.slug),
  );
  const pillar = seedContentPillars[0];
  const campaign = input.campaign || "Daily Signal Rhythm";
  const theme = input.dailyTheme || input.theme || "Signal over noise";
  const offer = input.offer || brand.defaultCta;

  return platforms.map((platform) => {
    const platformAngle =
      platform.slug === "reddit"
        ? `What are you seeing around ${theme.toLowerCase()}?`
        : `${theme}: one practical signal to use today`;
    return {
      date,
      brandSlug: brand.slug,
      brandName: brand.name,
      platformSlug: platform.slug,
      platformName: platform.name,
      campaign,
      contentPillarSlug: pillar.slug,
      contentPillarName: pillar.name,
      objective: `Create a ${platform.name}-native draft that stays useful before it sells.`,
      hook: platformAngle,
      body:
        platform.slug === "x"
          ? `${theme}: if the same audience question keeps repeating, it is probably not noise. Turn it into one clear answer.`
          : `Today's signal: ${theme}.\n\nThe useful move is not to publish more for the sake of volume. It is to notice one repeated audience problem, answer it plainly, and connect it to the next practical step.\n\nOffer tie-in: ${offer}.`,
      cta: platform.slug === "reddit" ? "Curious how others are handling this." : offer,
      imageConcept: `Platform-native ${platform.name} visual that clarifies ${theme}.`,
      imagePrompt: `Create a clean, business-focused ${platform.name} social graphic about "${theme}". Use structured hierarchy, mobile-readable text, and no generic stock-photo energy.`,
      altText: `${platform.name} visual explaining ${theme} for ${brand.name}.`,
      hashtags: platform.slug === "instagram" ? "#smallbusiness #contentstrategy #businesssystems" : "",
      assetFilename: makeAssetFilename(date, brand.slug, platform.slug, campaign, pillar.slug),
    };
  });
}

export function getLaunchUrl(post: PostVariant) {
  const brand = seedBrands.find((item) => item.slug === post.brandSlug);
  const social = brand?.socialProfiles.find((profile) => slugify(profile.platform) === post.platformSlug);
  return social?.composerUrl || social?.profileUrl || "https://www.google.com/search?q=" + encodeURIComponent(post.platformName);
}

export { seedPosts };
