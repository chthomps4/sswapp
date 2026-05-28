import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  calculateClickRate,
  calculateConversionRate,
  calculateDerivedMetrics,
  calculateEngagementRate,
  calculatePostScore,
  chooseMappingTemplate,
  createContentFingerprint,
  createImportPreview,
  createSampleSocialImport,
  detectPlatformFromHeaders,
  exportSocialMetricsCsv,
  exportWeeklySocialReportMarkdown,
  generateDailyRollups,
  generateRuleBasedInsights,
  getPerformanceContextForPrompt,
  hashImportContent,
  matchImportedRowToPost,
  normalizeMetricName,
  normalizePlatformName,
  parseDashboardDate,
  parseDashboardText,
  parseMetricNumber,
  validateNormalizedRow,
} from "../src/lib/social-dashboard-engine";

test("CSV parsing and pasted table parsing work", () => {
  const csvRows = parseDashboardText("Date,Reach\n2026-05-28,100");
  const pastedRows = parseDashboardText("Date\tReach\n2026-05-28\t100");
  assert.equal(csvRows[1][1], "100");
  assert.equal(pastedRows[1][1], "100");
});

test("platform detection and mapping templates handle common exports", () => {
  assert.equal(detectPlatformFromHeaders(["Permalink", "Post Clicks", "Reach"]), "facebook");
  assert.equal(detectPlatformFromHeaders(["Direction Clicks", "Phone Clicks", "Views"]), "google-business-profile");
  assert.equal(chooseMappingTemplate(["Post URL", "Accounts Reached"], "instagram").platformSlug, "instagram");
  assert.equal(normalizePlatformName("Twitter"), "x");
});

test("normalization helpers parse headers, numbers, and dates", () => {
  assert.equal(normalizeMetricName("Link_Clicks (%)"), "link clicks");
  assert.equal(parseMetricNumber("1.2k"), 1200);
  assert.equal(parseMetricNumber("5%"), 0.05);
  assert.equal(parseDashboardDate("5/28/2026"), "2026-05-28");
});

test("import preview validates required fields and duplicate rows", () => {
  const preview = createImportPreview({
    content: "Date,Caption,Reach\n2026-05-28,Same post,100\n2026-05-28,Same post,100",
    filename: "dupes.csv",
    brandSlug: "signal-workshop",
    platformSlug: "facebook",
  });
  assert.equal(preview.rowCount, 2);
  assert.equal(preview.previewRows[1].validationStatus, "duplicate");
});

test("fixture import creates normalized rows with post matching context", async () => {
  const content = await readFile("fixtures/social-imports/generic-social-metrics.csv", "utf8");
  const preview = createImportPreview({ content, filename: "generic-social-metrics.csv", brandSlug: "signal-workshop" });
  assert.ok(preview.detectedPlatform);
  assert.ok(preview.previewRows.length >= 5);
  assert.ok(preview.previewRows.some((row) => row.matchedPostDraftId || row.normalizedJson));
});

test("post matching by URL/text fingerprint is deterministic", () => {
  const fingerprintA = createContentFingerprint({ platform: "facebook", postedAt: "2026-05-28", caption: "A punch list is not just a list of small things." });
  const fingerprintB = createContentFingerprint({ platform: "facebook", postedAt: "2026-05-28", caption: "A punch list is not just a list of small things!" });
  assert.equal(fingerprintA, fingerprintB);
  const match = matchImportedRowToPost({
    platform: "facebook",
    brand: "al-brothers",
    account: "",
    externalPostId: "",
    postUrl: "",
    postedAt: "2026-05-28",
    caption: "A punch list is not just a list of small things.",
    title: "",
    contentType: "",
    mediaType: "",
    campaign: "",
    contentPillar: "",
    postObjective: "",
    imageType: "",
    ctaType: "",
    engagementCount: 0,
    engagementRate: 0,
    clickRate: 0,
    conversionRate: 0,
  });
  assert.ok(match.postDraftId);
});

test("derived metric and rate calculations work", () => {
  const derived = calculateDerivedMetrics({ impressions: 1000, likes: 10, comments: 5, shares: 2, saves: 3, clicks: 20, leads: 2, spend: 10 });
  assert.equal(derived.engagementCount, 20);
  assert.equal(calculateEngagementRate({ engagementCount: 20, impressions: 1000 }), 0.02);
  assert.equal(calculateClickRate({ clicks: 20, impressions: 1000 }), 0.02);
  assert.equal(calculateConversionRate({ leads: 2, impressions: 1000 }), 0.002);
});

test("sample import produces rollups, insights, exports, and prompt context", () => {
  const sample = createSampleSocialImport();
  const score = calculatePostScore(sample.snapshots[0]);
  const rollups = generateDailyRollups(sample.snapshots, sample.socialPosts);
  const insights = generateRuleBasedInsights(sample.snapshots, sample.socialPosts);
  const markdown = exportWeeklySocialReportMarkdown(sample.snapshots, sample.socialPosts, insights);
  const csv = exportSocialMetricsCsv(sample.snapshots);
  const promptContext = getPerformanceContextForPrompt({ metrics: sample.snapshots, posts: sample.socialPosts });

  assert.ok(score > 0);
  assert.ok(rollups.length > 0);
  assert.ok(insights.some((insight) => insight.insightType === "winning_post"));
  assert.match(markdown, /Weekly Social Report/);
  assert.match(csv, /engagement_rate/);
  assert.ok(promptContext.recommendations.length > 0);
});

test("validation catches invalid rows and import hashes prevent duplicates", () => {
  const validation = validateNormalizedRow({
    platform: "facebook",
    brand: "signal-workshop",
    account: "",
    externalPostId: "",
    postUrl: "",
    postedAt: "",
    caption: "",
    title: "",
    contentType: "",
    mediaType: "",
    campaign: "",
    contentPillar: "",
    postObjective: "",
    imageType: "",
    ctaType: "",
    engagementCount: 0,
    engagementRate: 0,
    clickRate: 0,
    conversionRate: 0,
  });
  assert.equal(validation.status, "invalid");
  assert.equal(hashImportContent("same"), hashImportContent("same"));
});

test("privacy guardrail keeps AI metric analysis disabled by default", () => {
  assert.notEqual(process.env.ENABLE_AI_METRIC_ANALYSIS, "true");
});
