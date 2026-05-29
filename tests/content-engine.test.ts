import assert from "node:assert/strict";
import test from "node:test";
import {
  createSampleDailyContentPack,
  exportAssetManifestJson,
  exportDailyReviewMarkdown,
  exportImagePromptsJson,
  exportSchedulerCsv,
  recommendFromMetrics,
  sampleMetricsForPack,
} from "../src/lib/automation-engine";
import { renderPrompt, renderPromptText } from "../src/lib/prompt-renderer";
import {
  approvedOnly,
  canTransitionApproval,
  exportImagePromptBatch,
  exportMarkdownReview,
  parseCsv,
  stringifyPostsCsv,
  validateNoAutoPublish,
  weeklyReport,
} from "../src/lib/content-engine";
import { generateAssetFilename, makeAssetFilename } from "../src/lib/utils";
import { seedPosts } from "../src/lib/seed-data";

test("asset filenames follow the documented convention", () => {
  assert.equal(
    makeAssetFilename("2026-05-28", "Business Signal Workshop", "LinkedIn", "Signal Push", "Authority"),
    "2026-05-28_business-signal-workshop_linkedin_signal-push_authority_v01.png",
  );
  assert.equal(
    generateAssetFilename({
      date: "2026-05-28",
      brandSlug: "business-signal-workshop",
      platformSlug: "linkedin",
      contentPillarSlug: "authority-and-trust",
      campaignSlug: "launch",
    }),
    "2026-05-28_business-signal-workshop_linkedin_authority-and-trust_launch_v01.png",
  );
});

test("CSV export round-trips quoted commas and line breaks", () => {
  const csv = stringifyPostsCsv(seedPosts);
  const rows = parseCsv(csv);
  assert.equal(rows[0][0], "date");
  assert.equal(rows.length, seedPosts.length + 1);
  assert.ok(rows[1].includes(seedPosts[0].hook));
});

test("publishing is blocked without approval", () => {
  assert.throws(() => validateNoAutoPublish({ approvalStatus: "needs_review", publishingStatus: "posted" }));
  assert.doesNotThrow(() => validateNoAutoPublish({ approvalStatus: "approved", publishingStatus: "posted" }));
});

test("status transitions protect posted content", () => {
  assert.equal(canTransitionApproval("approved", "scheduled"), true);
  assert.equal(canTransitionApproval("draft", "posted"), false);
  assert.equal(canTransitionApproval("posted", "needs_revision"), false);
});

test("exports include review and image prompt details", () => {
  const markdown = exportMarkdownReview(seedPosts);
  const batch = exportImagePromptBatch(seedPosts);
  assert.match(markdown, /SSWApp Content Review Pack/);
  assert.match(markdown, /Image prompt/);
  assert.match(batch, /photoshopNotes/);
});

test("approved-only filtering and weekly ranking work", () => {
  const approved = approvedOnly([
    { ...seedPosts[0], approvalStatus: "approved" },
    { ...seedPosts[1], approvalStatus: "scheduled" },
    { ...seedPosts[2], approvalStatus: "needs_revision" },
  ]);
  const report = weeklyReport(seedPosts);
  assert.equal(approved.length, 1);
  assert.equal(approved[0].approvalStatus, "approved");
  assert.ok(Array.isArray(report.bestPosts));
  assert.ok(Array.isArray(report.recommendations));
});

test("prompt rendering fills variables from markdown templates", async () => {
  assert.equal(renderPromptText("Hello {{brand}} on {{platform}}", { brand: "Signal Workshop", platform: "LinkedIn" }), "Hello Signal Workshop on LinkedIn");
  const rendered = await renderPrompt("platform-post", {
    brand: "Signal Workshop",
    platform: "LinkedIn",
    contentPillar: "Good Work Better Signal",
  });
  assert.match(rendered, /Signal Workshop/);
  assert.doesNotMatch(rendered, /\{\{brand\}\}/);
});

test("sample content pack creates drafts, image prompts, and approvals", () => {
  const pack = createSampleDailyContentPack("2026-05-28");
  assert.equal(pack.contentPack.dailyTheme, "Your online presence should not require a full-time employee to manage.");
  assert.equal(pack.postDrafts.length, 7);
  assert.equal(pack.imagePrompts.length, pack.postDrafts.length);
  assert.equal(pack.approvals.length, pack.postDrafts.length * 3);
  assert.ok(pack.imagePrompts.every((prompt) => prompt.filename.endsWith(".png")));
});

test("exports format review markdown, approved-only scheduler CSV, and manifests", () => {
  const pack = createSampleDailyContentPack("2026-05-28");
  const review = exportDailyReviewMarkdown(pack);
  const imageJson = JSON.parse(exportImagePromptsJson(pack)) as unknown[];
  const manifest = JSON.parse(exportAssetManifestJson(pack)) as { assets: unknown[] };
  const emptyScheduler = exportSchedulerCsv(pack);
  const approvedScheduler = exportSchedulerCsv({
    ...pack,
    postDrafts: [
      { ...pack.postDrafts[0], status: "approved" },
      { ...pack.postDrafts[1], status: "scheduled" },
      { ...pack.postDrafts[2], status: "needs_revision" },
      ...pack.postDrafts.slice(3),
    ],
  });

  assert.match(review, /Daily Content Pack/);
  assert.equal(imageJson.length, pack.imagePrompts.length);
  assert.equal(manifest.assets.length, pack.imagePrompts.length);
  assert.equal(emptyScheduler.split("\n").length, 1);
  assert.equal(parseCsv(approvedScheduler).length, 2);
  assert.doesNotMatch(approvedScheduler, /scheduled/);
  assert.doesNotMatch(approvedScheduler, /needs_revision/);
});

test("metrics recommendations identify repeat and revision actions", () => {
  const pack = createSampleDailyContentPack("2026-05-28");
  const metrics = sampleMetricsForPack(pack);
  const recommendation = recommendFromMetrics(metrics, pack.postDrafts);
  assert.ok(recommendation.bestPosts.length > 0);
  assert.ok(recommendation.recommendations.some((item) => item.includes("Repeat")));
});
