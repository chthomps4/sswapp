import { createHash } from "node:crypto";
import { parseCsv } from "./content-engine";
import { createSampleDailyContentPack } from "./automation-engine";
import { seedCampaigns, seedContentPillars, seedPlatforms } from "./seed-data";
import type { PostDraftRecord } from "./types";
import { slugify, todayIso } from "./utils";

export type SocialImportMethod = "csv_upload" | "pasted_table" | "manual_entry" | "api_import" | "json_upload" | "xlsx_upload";
export type SocialImportStatus = "uploaded" | "parsed" | "needs_mapping" | "ready_to_import" | "imported" | "partially_imported" | "failed" | "archived";
export type SocialRowValidationStatus = "valid" | "warning" | "invalid" | "duplicate" | "ignored";
export type SocialPostStatus = "imported" | "matched" | "manually_created" | "generated_from_app" | "posted" | "archived";
export type SocialInsightStatus = "new" | "reviewed" | "accepted" | "dismissed" | "implemented";
export type SocialInsightType =
  | "winning_post"
  | "weak_post"
  | "winning_platform"
  | "weak_platform"
  | "winning_pillar"
  | "weak_pillar"
  | "winning_hook"
  | "weak_hook"
  | "winning_cta"
  | "weak_cta"
  | "winning_image_type"
  | "weak_image_type"
  | "posting_time_pattern"
  | "audience_response_pattern"
  | "conversion_pattern"
  | "repurpose_opportunity"
  | "stop_doing"
  | "test_next"
  | "content_gap";

export type SocialAccountRecord = {
  id: string;
  brandSlug: string;
  platformSlug: string;
  accountName: string;
  handle: string;
  accountUrl: string;
  externalAccountId: string;
  dashboardSource: string;
  timezone: string;
  active: boolean;
  notes: string;
};

export type MappingTemplate = {
  id: string;
  name: string;
  platformSlug?: string;
  sourceName: string;
  description: string;
  mappingJson: Record<string, string[]>;
  requiredFields: string[];
  optionalFields: string[];
  active: boolean;
};

export type NormalizedMetricRow = {
  platform: string;
  brand: string;
  account: string;
  externalPostId: string;
  postUrl: string;
  postedAt: string;
  caption: string;
  title: string;
  contentType: string;
  mediaType: string;
  campaign: string;
  contentPillar: string;
  postObjective: string;
  imageType: string;
  ctaType: string;
  reach?: number;
  impressions?: number;
  views?: number;
  videoViews?: number;
  likes?: number;
  reactions?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  linkClicks?: number;
  websiteClicks?: number;
  phoneClicks?: number;
  directionClicks?: number;
  profileVisits?: number;
  follows?: number;
  dms?: number;
  formSubmissions?: number;
  leads?: number;
  quoteRequests?: number;
  bookedCalls?: number;
  workshopRegistrations?: number;
  purchases?: number;
  revenue?: number;
  spend?: number;
  kofiSupport?: number;
  engagementCount: number;
  engagementRate: number;
  clickRate: number;
  conversionRate: number;
  costPerLead?: number;
  revenuePerPost?: number;
};

export type SocialPostRecord = {
  id: string;
  brandSlug: string;
  platformSlug: string;
  socialAccountId: string;
  postDraftId: string;
  contentPackId: string;
  campaignSlug: string;
  contentPillarSlug: string;
  externalPostId: string;
  postUrl: string;
  postedAt: string;
  title: string;
  hook: string;
  bodyPreview: string;
  fullCopy: string;
  mediaType: string;
  imageType: string;
  assetFilename: string;
  ctaType: string;
  postObjective: string;
  contentFingerprint: string;
  status: SocialPostStatus;
};

export type SocialImportedRowRecord = {
  id: string;
  importId: string;
  rowIndex: number;
  rawJson: Record<string, string>;
  normalizedJson?: NormalizedMetricRow;
  validationStatus: SocialRowValidationStatus;
  validationErrors: string[];
  matchedPostDraftId: string;
  matchedSocialPostId: string;
};

export type SocialDashboardImportRecord = {
  id: string;
  sourceName: string;
  platformSlug: string;
  brandSlug: string;
  socialAccountId: string;
  importedBy: string;
  importMethod: SocialImportMethod;
  originalFilename: string;
  originalFileHash: string;
  rawColumnHeaders: string[];
  detectedPlatform: string;
  detectedDateRangeStart: string;
  detectedDateRangeEnd: string;
  rowCount: number;
  status: SocialImportStatus;
  errorSummary: string;
  mappingTemplateId: string;
  notes: string;
  previewRows: SocialImportedRowRecord[];
};

export type SocialMetricSnapshotRecord = NormalizedMetricRow & {
  id: string;
  socialPostId: string;
  postDraftId: string;
  brandSlug: string;
  platformSlug: string;
  socialAccountId: string;
  importId: string;
  snapshotDate: string;
  reportingStartDate: string;
  reportingEndDate: string;
  rawMetricJson: Record<string, string>;
};

export type SocialPerformanceInsightRecord = {
  id: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  brandSlug: string;
  platformSlug: string;
  campaignSlug: string;
  contentPillarSlug: string;
  insightType: SocialInsightType;
  title: string;
  summary: string;
  evidenceJson: unknown;
  recommendation: string;
  confidence: number;
  priority: number;
  status: SocialInsightStatus;
};

export type SocialImportIssueRecord = {
  id: string;
  importId: string;
  rowId: string;
  issueType:
    | "missing_required_field"
    | "invalid_date"
    | "invalid_number"
    | "duplicate_row"
    | "unmatched_post"
    | "unknown_platform"
    | "unknown_brand"
    | "unsupported_file_type"
    | "mapping_error"
    | "parse_error";
  severity: "info" | "warning" | "error";
  message: string;
  suggestedFix: string;
  resolved: boolean;
};

export const socialAccounts: SocialAccountRecord[] = [
  ["signal-workshop", "facebook", "Signal Workshop Facebook Page"],
  ["signal-workshop", "linkedin", "Signal Workshop LinkedIn Page"],
  ["signal-workshop", "instagram", "Signal Workshop Instagram"],
  ["local-signal-websites", "facebook", "Local Signal Websites Facebook Page"],
  ["local-signal-websites", "instagram", "Local Signal Websites Instagram"],
  ["parallax-hearts", "facebook", "Parallax Hearts Facebook Page"],
  ["parallax-hearts", "instagram", "Parallax Hearts Instagram"],
  ["parallax-hearts", "kofi", "Parallax Hearts Ko-fi"],
  ["al-brothers", "facebook", "AL Brothers LLC Facebook Page"],
  ["al-brothers", "google-business-profile", "AL Brothers LLC Google Business Profile"],
  ["al-brothers", "instagram", "AL Brothers LLC Instagram"],
].map(([brandSlug, platformSlug, accountName]) => ({
  id: `${brandSlug}-${platformSlug}-account`,
  brandSlug,
  platformSlug,
  accountName,
  handle: "",
  accountUrl: "",
  externalAccountId: "",
  dashboardSource: platformSlug,
  timezone: "America/New_York",
  active: true,
  notes: "Seeded private account metadata. Update account URLs and handles as dashboards are connected.",
}));

const metricAliases: Record<string, string[]> = {
  platform: ["platform", "network", "source"],
  brand: ["brand", "business", "page name"],
  account: ["account", "account name", "page", "profile", "channel"],
  externalPostId: ["post id", "post_id", "id", "external post id", "content id"],
  postUrl: ["post url", "permalink", "url", "link", "content url"],
  postedAt: ["date", "posted at", "publish date", "published date", "created time", "time published", "post date"],
  caption: ["caption", "post text", "copy", "message", "description", "text", "content"],
  title: ["title", "post title", "video title"],
  contentType: ["content type", "type", "post type"],
  mediaType: ["media type", "format"],
  campaign: ["campaign", "campaign name"],
  contentPillar: ["content pillar", "pillar"],
  postObjective: ["post objective", "objective"],
  imageType: ["image type", "visual format", "creative type"],
  ctaType: ["cta type", "cta", "call to action"],
  reach: ["reach", "accounts reached", "local reach"],
  impressions: ["impressions", "impression"],
  views: ["views", "page views", "content views"],
  videoViews: ["video views", "plays"],
  likes: ["likes", "like count"],
  reactions: ["reactions", "reaction count"],
  comments: ["comments", "comment count", "replies"],
  shares: ["shares", "share count"],
  saves: ["saves", "saved"],
  clicks: ["clicks", "total clicks", "post clicks"],
  linkClicks: ["link clicks", "outbound clicks"],
  websiteClicks: ["website clicks", "website actions"],
  phoneClicks: ["phone clicks", "calls"],
  directionClicks: ["direction clicks", "directions", "direction requests"],
  profileVisits: ["profile visits", "profile views", "page visits"],
  follows: ["follows", "new followers", "subscribers"],
  dms: ["dms", "messages", "facebook messages", "direct messages"],
  formSubmissions: ["form submissions", "forms"],
  leads: ["leads"],
  quoteRequests: ["quote requests", "requests"],
  bookedCalls: ["booked calls", "bookings"],
  workshopRegistrations: ["workshop registrations", "registrations"],
  purchases: ["purchases", "orders"],
  revenue: ["revenue", "amount", "gross amount"],
  spend: ["spend", "cost"],
  kofiSupport: ["kofi support", "support amount", "donation amount"],
};

export const mappingTemplates: MappingTemplate[] = [
  {
    id: "generic-social-post-metrics",
    name: "Generic social post metrics CSV",
    sourceName: "generic",
    description: "Flexible CSV for platform, URL, caption, and common metrics.",
    mappingJson: metricAliases,
    requiredFields: ["postedAt"],
    optionalFields: Object.keys(metricAliases).filter((field) => field !== "postedAt"),
    active: true,
  },
  {
    id: "meta-facebook-post-export",
    name: "Meta/Facebook generic post export",
    platformSlug: "facebook",
    sourceName: "meta",
    description: "Meta Business Suite style post export.",
    mappingJson: metricAliases,
    requiredFields: ["postedAt"],
    optionalFields: Object.keys(metricAliases).filter((field) => field !== "postedAt"),
    active: true,
  },
  {
    id: "instagram-insights-export",
    name: "Instagram generic insights export",
    platformSlug: "instagram",
    sourceName: "instagram",
    description: "Instagram Insights post metrics export.",
    mappingJson: metricAliases,
    requiredFields: ["postedAt"],
    optionalFields: Object.keys(metricAliases).filter((field) => field !== "postedAt"),
    active: true,
  },
  {
    id: "linkedin-post-export",
    name: "LinkedIn generic post export",
    platformSlug: "linkedin",
    sourceName: "linkedin",
    description: "LinkedIn page analytics post export.",
    mappingJson: metricAliases,
    requiredFields: ["postedAt"],
    optionalFields: Object.keys(metricAliases).filter((field) => field !== "postedAt"),
    active: true,
  },
  {
    id: "google-business-profile-performance",
    name: "Google Business Profile generic performance export",
    platformSlug: "google-business-profile",
    sourceName: "google-business-profile",
    description: "GBP performance actions and local visibility export.",
    mappingJson: metricAliases,
    requiredFields: ["postedAt"],
    optionalFields: Object.keys(metricAliases).filter((field) => field !== "postedAt"),
    active: true,
  },
  {
    id: "kofi-support-export",
    name: "Ko-fi generic support export",
    platformSlug: "kofi",
    sourceName: "kofi",
    description: "Ko-fi support export mapped to revenue/support metrics.",
    mappingJson: metricAliases,
    requiredFields: ["postedAt"],
    optionalFields: Object.keys(metricAliases).filter((field) => field !== "postedAt"),
    active: true,
  },
  {
    id: "manual-social-metrics-entry",
    name: "Manual entry template",
    sourceName: "manual",
    description: "Manual metrics entry or copy/pasted dashboard table.",
    mappingJson: metricAliases,
    requiredFields: ["postedAt"],
    optionalFields: Object.keys(metricAliases).filter((field) => field !== "postedAt"),
    active: true,
  },
];

export function normalizeMetricName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[%()]/g, "")
    .replace(/[_/.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePlatformName(value: string) {
  const normalized = slugify(value || "");
  if (["meta", "facebook-page", "fb"].includes(normalized)) return "facebook";
  if (["ig", "insta"].includes(normalized)) return "instagram";
  if (["twitter"].includes(normalized)) return "x";
  if (["gbp", "google-business", "google-profile"].includes(normalized)) return "google-business-profile";
  if (["youtube-studio"].includes(normalized)) return "youtube";
  return normalized;
}

export function parseMetricNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const text = String(value).trim();
  if (!text || text === "-") return undefined;
  const isPercent = text.includes("%");
  const cleaned = text.replace(/[$,%]/g, "").replace(/,/g, "").trim();
  const multiplier = cleaned.toLowerCase().endsWith("k") ? 1000 : cleaned.toLowerCase().endsWith("m") ? 1000000 : 1;
  const numeric = Number.parseFloat(cleaned.replace(/[km]$/i, ""));
  if (Number.isNaN(numeric)) return undefined;
  const result = numeric * multiplier;
  return isPercent ? result / 100 : result;
}

export function parseDashboardDate(value: unknown): string {
  if (!value) return "";
  const text = String(value).trim();
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);

  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return "";
  const [, month, day, year] = match;
  const fullYear = year.length === 2 ? `20${year}` : year;
  const date = new Date(`${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function parseDashboardText(text: string) {
  const delimiter = text.includes("\t") && text.split("\t").length > text.split(",").length ? "\t" : ",";
  if (delimiter === ",") return parseCsv(text);
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split("\t").map((cell) => cell.trim()));
}

export function rowsToObjects(rows: string[][]) {
  const headers = rows[0]?.map((header) => header.trim()) || [];
  return rows.slice(1).map((row) =>
    Object.fromEntries(
      headers.map((header, index) => [header, row[index] ?? ""]).filter(([header]) => String(header).length > 0),
    ) as Record<string, string>,
  );
}

export function hashImportContent(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120) || "social-dashboard-import.csv";
}

export function detectPlatformFromHeaders(headers: string[]) {
  const names = headers.map(normalizeMetricName);
  const joined = names.join(" ");
  if (joined.includes("ko fi") || joined.includes("supporter") || joined.includes("support amount")) return "kofi";
  if (joined.includes("direction") || joined.includes("phone clicks") || joined.includes("business interactions")) return "google-business-profile";
  if (joined.includes("retweets") || joined.includes("quote posts")) return "x";
  if (joined.includes("video title") || joined.includes("watch time")) return "youtube";
  if (joined.includes("profile visits") || joined.includes("accounts reached")) return "instagram";
  if (joined.includes("reactions") && joined.includes("impressions")) return "linkedin";
  if (joined.includes("post clicks") || joined.includes("permalink")) return "facebook";
  return "generic";
}

export function detectDateRange(rows: NormalizedMetricRow[]) {
  const dates = rows.map((row) => row.postedAt).filter(Boolean).sort();
  return {
    start: dates[0] || "",
    end: dates[dates.length - 1] || "",
  };
}

function getByAliases(row: Record<string, string>, aliases: string[]) {
  const normalizedEntries = Object.entries(row).map(([key, value]) => [normalizeMetricName(key), value] as const);
  for (const alias of aliases.map(normalizeMetricName)) {
    const match = normalizedEntries.find(([key]) => key === alias);
    if (match) return match[1];
  }
  return "";
}

export function calculateDerivedMetrics(row: Partial<NormalizedMetricRow>): Pick<
  NormalizedMetricRow,
  "engagementCount" | "engagementRate" | "clickRate" | "conversionRate" | "costPerLead" | "revenuePerPost"
> {
  const engagementCount = Number(row.likes || 0) + Number(row.reactions || 0) + Number(row.comments || 0) + Number(row.shares || 0) + Number(row.saves || 0);
  const impressions = Number(row.impressions || row.reach || row.views || 0);
  const clicks = Number(row.clicks || 0) + Number(row.linkClicks || 0) + Number(row.websiteClicks || 0);
  const conversions =
    Number(row.leads || 0) +
    Number(row.quoteRequests || 0) +
    Number(row.bookedCalls || 0) +
    Number(row.workshopRegistrations || 0) +
    Number(row.purchases || 0) +
    Number(row.kofiSupport || 0);
  const spend = Number(row.spend || 0);
  const revenue = Number(row.revenue || row.kofiSupport || 0);

  return {
    engagementCount,
    engagementRate: impressions ? engagementCount / impressions : 0,
    clickRate: impressions ? clicks / impressions : 0,
    conversionRate: impressions ? conversions / impressions : 0,
    costPerLead: spend && conversions ? spend / conversions : undefined,
    revenuePerPost: revenue || undefined,
  };
}

export function normalizeRow(
  raw: Record<string, string>,
  template: MappingTemplate,
  defaults: { brandSlug?: string; platformSlug?: string; accountId?: string } = {},
): NormalizedMetricRow {
  const mapped = Object.fromEntries(
    Object.entries(template.mappingJson).map(([field, aliases]) => [field, getByAliases(raw, aliases)]),
  ) as Record<string, string>;
  const detectedPlatform = normalizePlatformName(mapped.platform || defaults.platformSlug || detectPlatformFromHeaders(Object.keys(raw)));
  const brand = mapped.brand ? slugify(mapped.brand) : defaults.brandSlug || "";
  const account = mapped.account || defaults.accountId || "";
  const postedAt = parseDashboardDate(mapped.postedAt);
  const partial: Partial<NormalizedMetricRow> = {
    platform: detectedPlatform,
    brand,
    account,
    externalPostId: mapped.externalPostId || "",
    postUrl: mapped.postUrl || "",
    postedAt,
    caption: mapped.caption || "",
    title: mapped.title || "",
    contentType: mapped.contentType || "",
    mediaType: mapped.mediaType || "",
    campaign: mapped.campaign ? slugify(mapped.campaign) : "",
    contentPillar: mapped.contentPillar ? slugify(mapped.contentPillar) : "",
    postObjective: mapped.postObjective || "",
    imageType: mapped.imageType ? slugify(mapped.imageType) : "",
    ctaType: mapped.ctaType ? slugify(mapped.ctaType) : "",
  };

  for (const field of [
    "reach",
    "impressions",
    "views",
    "videoViews",
    "likes",
    "reactions",
    "comments",
    "shares",
    "saves",
    "clicks",
    "linkClicks",
    "websiteClicks",
    "phoneClicks",
    "directionClicks",
    "profileVisits",
    "follows",
    "dms",
    "formSubmissions",
    "leads",
    "quoteRequests",
    "bookedCalls",
    "workshopRegistrations",
    "purchases",
    "revenue",
    "spend",
    "kofiSupport",
  ] as const) {
    partial[field] = parseMetricNumber(mapped[field]);
  }

  return {
    platform: partial.platform || "generic",
    brand: partial.brand || "",
    account: partial.account || "",
    externalPostId: partial.externalPostId || "",
    postUrl: partial.postUrl || "",
    postedAt: partial.postedAt || "",
    caption: partial.caption || "",
    title: partial.title || "",
    contentType: partial.contentType || "",
    mediaType: partial.mediaType || "",
    campaign: partial.campaign || "",
    contentPillar: partial.contentPillar || "",
    postObjective: partial.postObjective || "",
    imageType: partial.imageType || "",
    ctaType: partial.ctaType || "",
    ...Object.fromEntries(Object.entries(partial).filter(([, value]) => typeof value === "number")),
    ...calculateDerivedMetrics(partial),
  };
}

export function validateNormalizedRow(row: NormalizedMetricRow) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!row.postedAt) errors.push("Missing or invalid posted date.");
  if (!row.platform || row.platform === "generic") warnings.push("Platform could not be confidently detected.");
  if (!row.brand) warnings.push("Brand was not present in the row; selected brand will be used.");
  if (!row.externalPostId && !row.postUrl && !row.caption && !row.title) errors.push("Row has no post URL, post ID, caption, or title to match.");

  return {
    status: errors.length ? "invalid" : warnings.length ? "warning" : "valid",
    errors: [...errors, ...warnings],
  } as { status: SocialRowValidationStatus; errors: string[] };
}

export function createContentFingerprint(input: { platform?: string; postedAt?: string; caption?: string; title?: string; postUrl?: string }) {
  const text = [input.platform, input.postedAt, input.postUrl, input.caption, input.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
  return createHash("sha1").update(text).digest("hex");
}

export function chooseMappingTemplate(headers: string[], platformSlug?: string) {
  const detected = platformSlug || detectPlatformFromHeaders(headers);
  return (
    mappingTemplates.find((template) => template.platformSlug === detected) ||
    mappingTemplates.find((template) => template.id === "generic-social-post-metrics") ||
    mappingTemplates[0]
  );
}

export function createImportPreview(input: {
  content: string;
  filename?: string;
  method?: SocialImportMethod;
  brandSlug?: string;
  platformSlug?: string;
  socialAccountId?: string;
  importedBy?: string;
}) {
  const maxBytes = Number.parseInt(process.env.SOCIAL_IMPORT_MAX_BYTES || "5242880", 10);
  const bytes = Buffer.byteLength(input.content, "utf8");
  if (bytes > maxBytes) {
    throw new Error(`Import is larger than SOCIAL_IMPORT_MAX_BYTES (${maxBytes}).`);
  }

  const rows = parseDashboardText(input.content).filter((row) => row.some((cell) => cell.trim()));
  const headers = rows[0]?.map((header) => header.trim()) || [];
  const rawRows = rowsToObjects(rows);
  const detectedPlatform = normalizePlatformName(input.platformSlug || detectPlatformFromHeaders(headers));
  const template = chooseMappingTemplate(headers, detectedPlatform);
  const importId = `import-${hashImportContent(input.content).slice(0, 12)}`;
  const seen = new Set<string>();

  const previewRows = rawRows.map((raw, index) => {
    const normalized = normalizeRow(raw, template, {
      brandSlug: input.brandSlug,
      platformSlug: detectedPlatform,
      accountId: input.socialAccountId,
    });
    const fingerprint = createContentFingerprint(normalized);
    const validation = validateNormalizedRow(normalized);
    const duplicate = seen.has(fingerprint);
    seen.add(fingerprint);
    const match = matchImportedRowToPost(normalized);
    return {
      id: `${importId}-row-${index + 1}`,
      importId,
      rowIndex: index + 1,
      rawJson: raw,
      normalizedJson: normalized,
      validationStatus: duplicate ? "duplicate" : validation.status,
      validationErrors: duplicate ? [...validation.errors, "Duplicate row in this import."] : validation.errors,
      matchedPostDraftId: match.postDraftId,
      matchedSocialPostId: match.socialPostId,
    } satisfies SocialImportedRowRecord;
  });
  const dateRange = detectDateRange(previewRows.map((row) => row.normalizedJson).filter(Boolean) as NormalizedMetricRow[]);

  return {
    id: importId,
    sourceName: template.sourceName,
    platformSlug: detectedPlatform,
    brandSlug: input.brandSlug || "",
    socialAccountId: input.socialAccountId || "",
    importedBy: input.importedBy || "owner",
    importMethod: input.method || "pasted_table",
    originalFilename: sanitizeFilename(input.filename || "pasted-social-dashboard.csv"),
    originalFileHash: hashImportContent(input.content),
    rawColumnHeaders: headers,
    detectedPlatform,
    detectedDateRangeStart: dateRange.start,
    detectedDateRangeEnd: dateRange.end,
    rowCount: rawRows.length,
    status: previewRows.some((row) => row.validationStatus === "invalid") ? "needs_mapping" : "ready_to_import",
    errorSummary: previewRows.flatMap((row) => row.validationErrors).slice(0, 3).join(" "),
    mappingTemplateId: template.id,
    notes: "Preview only until confirmed. Raw import content remains private.",
    previewRows: previewRows.slice(0, 20),
  } satisfies SocialDashboardImportRecord;
}

export function matchImportedRowToPost(row: NormalizedMetricRow) {
  const pack = createSampleDailyContentPack(row.postedAt || todayIso());
  const postUrlMatch = pack.postDrafts.find((draft) => draft.postedUrl && draft.postedUrl === row.postUrl);
  if (postUrlMatch) return { postDraftId: postUrlMatch.id, socialPostId: "" };
  const datePlatformMatches = pack.postDrafts.filter((draft) => draft.platformSlug === row.platform && (!row.brand || draft.brandSlug === row.brand));
  const text = `${row.caption} ${row.title}`.toLowerCase();
  const similar = datePlatformMatches.find((draft) => {
    const source = `${draft.hook} ${draft.body}`.toLowerCase();
    const words = text.split(/\s+/).filter((word) => word.length > 4);
    return words.length > 0 && words.filter((word) => source.includes(word)).length >= Math.min(2, words.length);
  });
  if (similar) return { postDraftId: similar.id, socialPostId: "" };
  return { postDraftId: "", socialPostId: "" };
}

export function createSocialPostFromRow(row: NormalizedMetricRow, draft?: PostDraftRecord): SocialPostRecord {
  const campaign = row.campaign || draft?.campaignSlug || seedCampaigns.find((item) => item.brandSlug === row.brand)?.slug || "";
  const pillar = row.contentPillar || draft?.contentPillarSlug || seedContentPillars.find((item) => item.brandSlug === row.brand)?.slug || "";
  return {
    id: `social-post-${createContentFingerprint(row).slice(0, 12)}`,
    brandSlug: row.brand || draft?.brandSlug || "signal-workshop",
    platformSlug: row.platform || draft?.platformSlug || "facebook",
    socialAccountId: row.account,
    postDraftId: draft?.id || "",
    contentPackId: draft?.contentPackId || "",
    campaignSlug: campaign,
    contentPillarSlug: pillar,
    externalPostId: row.externalPostId,
    postUrl: row.postUrl,
    postedAt: row.postedAt,
    title: row.title,
    hook: draft?.hook || row.title || row.caption.slice(0, 90),
    bodyPreview: row.caption.slice(0, 180),
    fullCopy: row.caption,
    mediaType: row.mediaType || row.contentType,
    imageType: row.imageType,
    assetFilename: "",
    ctaType: row.ctaType,
    postObjective: row.postObjective || draft?.postObjective || "",
    contentFingerprint: createContentFingerprint(row),
    status: draft ? "matched" : "imported",
  };
}

export function confirmImport(preview: SocialDashboardImportRecord) {
  const pack = createSampleDailyContentPack(preview.detectedDateRangeStart || todayIso());
  const validRows = preview.previewRows.filter((row) => row.validationStatus !== "invalid" && row.validationStatus !== "duplicate" && row.normalizedJson);
  const socialPosts = validRows.map((row) => {
    const draft = pack.postDrafts.find((item) => item.id === row.matchedPostDraftId);
    return createSocialPostFromRow(row.normalizedJson as NormalizedMetricRow, draft);
  });
  const snapshots = validRows.map((row, index) => {
    const normalized = row.normalizedJson as NormalizedMetricRow;
    const draft = pack.postDrafts.find((item) => item.id === row.matchedPostDraftId);
    const post = socialPosts[index];
    return {
      id: `${row.id}-snapshot`,
      socialPostId: post.id,
      postDraftId: draft?.id || "",
      brandSlug: post.brandSlug,
      platformSlug: post.platformSlug,
      socialAccountId: preview.socialAccountId,
      importId: preview.id,
      snapshotDate: todayIso(),
      reportingStartDate: preview.detectedDateRangeStart || normalized.postedAt,
      reportingEndDate: preview.detectedDateRangeEnd || normalized.postedAt,
      rawMetricJson: row.rawJson,
      ...normalized,
    } satisfies SocialMetricSnapshotRecord;
  });
  const issues = createImportIssues(preview);
  const insights = generateRuleBasedInsights(snapshots, socialPosts);

  return {
    import: { ...preview, status: issues.some((issue) => issue.severity === "error") ? "partially_imported" : "imported" },
    socialPosts,
    snapshots,
    issues,
    insights,
    rollups: generateDailyRollups(snapshots, socialPosts),
  };
}

export function createImportIssues(preview: SocialDashboardImportRecord): SocialImportIssueRecord[] {
  return preview.previewRows.flatMap((row) =>
    row.validationErrors.map((message, index) => ({
      id: `${row.id}-issue-${index + 1}`,
      importId: preview.id,
      rowId: row.id,
      issueType: row.validationStatus === "duplicate" ? "duplicate_row" : row.validationStatus === "invalid" ? "missing_required_field" : "unmatched_post",
      severity: row.validationStatus === "invalid" ? "error" : "warning",
      message,
      suggestedFix: row.validationStatus === "invalid" ? "Map the missing field or ignore this row." : "Review the row before confirming import.",
      resolved: false,
    })),
  );
}

export function calculateEngagementRate(metric: Pick<NormalizedMetricRow, "engagementCount" | "impressions" | "reach" | "views">) {
  const base = metric.impressions || metric.reach || metric.views || 0;
  return base ? metric.engagementCount / base : 0;
}

export function calculateClickRate(metric: Pick<NormalizedMetricRow, "clicks" | "linkClicks" | "websiteClicks" | "impressions" | "reach" | "views">) {
  const base = metric.impressions || metric.reach || metric.views || 0;
  const clicks = Number(metric.clicks || 0) + Number(metric.linkClicks || 0) + Number(metric.websiteClicks || 0);
  return base ? clicks / base : 0;
}

export function calculateConversionRate(metric: Partial<NormalizedMetricRow>) {
  const base = metric.impressions || metric.reach || metric.views || 0;
  const conversions =
    Number(metric.leads || 0) +
    Number(metric.quoteRequests || 0) +
    Number(metric.bookedCalls || 0) +
    Number(metric.workshopRegistrations || 0) +
    Number(metric.purchases || 0) +
    Number(metric.kofiSupport || 0);
  return base ? conversions / base : 0;
}

const brandWeights: Record<string, Record<string, number>> = {
  "signal-workshop": { clicks: 3, leads: 8, bookedCalls: 10, workshopRegistrations: 10, comments: 4, saves: 4 },
  "business-signal-workshop": { comments: 5, saves: 5, clicks: 4, workshopRegistrations: 10, bookedCalls: 10 },
  "local-signal-websites": { websiteClicks: 5, formSubmissions: 8, quoteRequests: 10, dms: 7, profileVisits: 3 },
  "parallax-hearts": { saves: 5, shares: 5, follows: 4, kofiSupport: 10, views: 2, comments: 4, linkClicks: 4 },
  "al-brothers": { phoneClicks: 8, directionClicks: 8, quoteRequests: 10, formSubmissions: 8, reach: 2, dms: 7 },
};

export function calculatePostScore(metric: SocialMetricSnapshotRecord) {
  const weights = brandWeights[metric.brandSlug] || {};
  const base =
    Number(metric.reach || 0) * (weights.reach || 0.5) +
    Number(metric.impressions || 0) * 0.2 +
    metric.engagementCount * 2 +
    calculateEngagementRate(metric) * 100 +
    calculateClickRate(metric) * 140 +
    calculateConversionRate(metric) * 220;
  return Object.entries(weights).reduce((score, [field, weight]) => {
    const value = Number((metric as unknown as Record<string, number | undefined>)[field] || 0);
    return score + value * weight;
  }, base);
}

export function identifyTopPosts(metrics: SocialMetricSnapshotRecord[], posts: SocialPostRecord[]) {
  return metrics
    .map((metric) => ({ metric, post: posts.find((post) => post.id === metric.socialPostId), score: calculatePostScore(metric) }))
    .sort((a, b) => b.score - a.score);
}

export function generateDailyRollups(metrics: SocialMetricSnapshotRecord[], posts: SocialPostRecord[]) {
  const groups = new Map<string, SocialMetricSnapshotRecord[]>();
  for (const metric of metrics) {
    const post = posts.find((item) => item.id === metric.socialPostId);
    const key = [metric.snapshotDate, metric.brandSlug, metric.platformSlug, post?.campaignSlug || "", post?.contentPillarSlug || "", post?.postObjective || "", post?.imageType || ""].join("|");
    groups.set(key, [...(groups.get(key) || []), metric]);
  }

  return [...groups.entries()].map(([key, rows]) => {
    const [date, brandSlug, platformSlug, campaignSlug, contentPillarSlug, postObjective, imageType] = key.split("|");
    const totalEngagements = rows.reduce((sum, row) => sum + row.engagementCount, 0);
    const totalImpressions = rows.reduce((sum, row) => sum + Number(row.impressions || 0), 0);
    const totalClicks = rows.reduce((sum, row) => sum + Number(row.clicks || row.linkClicks || row.websiteClicks || 0), 0);
    return {
      id: `rollup-${slugify(key)}`,
      date,
      brandSlug,
      platformSlug,
      campaignSlug,
      contentPillarSlug,
      postObjective,
      imageType,
      totalPosts: rows.length,
      totalReach: rows.reduce((sum, row) => sum + Number(row.reach || 0), 0),
      totalImpressions,
      totalViews: rows.reduce((sum, row) => sum + Number(row.views || row.videoViews || 0), 0),
      totalEngagements,
      totalClicks,
      totalLeads: rows.reduce((sum, row) => sum + Number(row.leads || row.quoteRequests || row.bookedCalls || 0), 0),
      totalRevenue: rows.reduce((sum, row) => sum + Number(row.revenue || row.kofiSupport || 0), 0),
      averageEngagementRate: totalImpressions ? totalEngagements / totalImpressions : 0,
      averageClickRate: totalImpressions ? totalClicks / totalImpressions : 0,
      averageConversionRate: rows.reduce((sum, row) => sum + row.conversionRate, 0) / rows.length,
    };
  });
}

function aggregateBy<T extends string>(metrics: SocialMetricSnapshotRecord[], posts: SocialPostRecord[], getter: (metric: SocialMetricSnapshotRecord, post?: SocialPostRecord) => T) {
  const totals = new Map<T, number>();
  for (const metric of metrics) {
    const post = posts.find((item) => item.id === metric.socialPostId);
    const key = getter(metric, post);
    totals.set(key, (totals.get(key) || 0) + calculatePostScore(metric));
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

export function generateRuleBasedInsights(metrics: SocialMetricSnapshotRecord[], posts: SocialPostRecord[]) {
  const ranked = identifyTopPosts(metrics, posts);
  const platformTotals = aggregateBy(metrics, posts, (metric) => metric.platformSlug);
  const pillarTotals = aggregateBy(metrics, posts, (_metric, post) => post?.contentPillarSlug || "unknown");
  const imageTotals = aggregateBy(metrics, posts, (_metric, post) => post?.imageType || "unknown");
  const dateRangeStart = metrics.map((metric) => metric.reportingStartDate || metric.snapshotDate).sort()[0] || todayIso();
  const dateRangeEnd = metrics.map((metric) => metric.reportingEndDate || metric.snapshotDate).sort().at(-1) || todayIso();
  const top = ranked[0];
  const weak = ranked.at(-1);

  return [
    top && {
      id: "insight-winning-post",
      dateRangeStart,
      dateRangeEnd,
      brandSlug: top.metric.brandSlug,
      platformSlug: top.metric.platformSlug,
      campaignSlug: top.post?.campaignSlug || "",
      contentPillarSlug: top.post?.contentPillarSlug || "",
      insightType: "winning_post",
      title: "Top post worth repeating",
      summary: `${top.post?.hook || top.post?.title || "This post"} created the strongest weighted signal in the import.`,
      evidenceJson: { score: top.score, metric: top.metric, post: top.post },
      recommendation: "Create a follow-up and repurpose the angle into one additional native platform format.",
      confidence: 0.82,
      priority: 1,
      status: "new",
    },
    weak && {
      id: "insight-weak-post",
      dateRangeStart,
      dateRangeEnd,
      brandSlug: weak.metric.brandSlug,
      platformSlug: weak.metric.platformSlug,
      campaignSlug: weak.post?.campaignSlug || "",
      contentPillarSlug: weak.post?.contentPillarSlug || "",
      insightType: "weak_post",
      title: "Weak post angle needs revision",
      summary: `${weak.post?.hook || weak.post?.title || "This post"} underperformed against the imported set.`,
      evidenceJson: { score: weak.score, metric: weak.metric, post: weak.post },
      recommendation: "Revise the hook, switch the visual format, or reduce this angle until there is clearer demand.",
      confidence: 0.7,
      priority: 2,
      status: "new",
    },
    platformTotals[0] && {
      id: "insight-winning-platform",
      dateRangeStart,
      dateRangeEnd,
      brandSlug: "",
      platformSlug: platformTotals[0][0],
      campaignSlug: "",
      contentPillarSlug: "",
      insightType: "winning_platform",
      title: "Best platform in this import",
      summary: `${platformName(platformTotals[0][0])} produced the strongest weighted performance.`,
      evidenceJson: { platformTotals },
      recommendation: "Prioritize one more native post on this platform in the next content pack.",
      confidence: 0.68,
      priority: 2,
      status: "new",
    },
    pillarTotals[0] && {
      id: "insight-winning-pillar",
      dateRangeStart,
      dateRangeEnd,
      brandSlug: "",
      platformSlug: "",
      campaignSlug: "",
      contentPillarSlug: pillarTotals[0][0],
      insightType: "winning_pillar",
      title: "Strongest content pillar",
      summary: `${titleize(pillarTotals[0][0])} is the strongest pillar in this import.`,
      evidenceJson: { pillarTotals },
      recommendation: "Use this pillar as a theme candidate for the next daily pack.",
      confidence: 0.66,
      priority: 2,
      status: "new",
    },
    imageTotals[0] && {
      id: "insight-winning-image-type",
      dateRangeStart,
      dateRangeEnd,
      brandSlug: "",
      platformSlug: "",
      campaignSlug: "",
      contentPillarSlug: "",
      insightType: "winning_image_type",
      title: "Best visual format",
      summary: `${titleize(imageTotals[0][0])} is the strongest image type in this import.`,
      evidenceJson: { imageTotals },
      recommendation: "Generate more image prompts using this visual format before testing new formats.",
      confidence: 0.6,
      priority: 3,
      status: "new",
    },
  ].filter(Boolean) as SocialPerformanceInsightRecord[];
}

export function getPerformanceContextForPrompt({
  metrics,
  posts,
  brandSlug,
  platformSlug,
}: {
  metrics: SocialMetricSnapshotRecord[];
  posts: SocialPostRecord[];
  brandSlug?: string;
  platformSlug?: string;
}) {
  const scoped = metrics.filter((metric) => (!brandSlug || metric.brandSlug === brandSlug) && (!platformSlug || metric.platformSlug === platformSlug));
  const ranked = identifyTopPosts(scoped, posts);
  const insights = generateRuleBasedInsights(scoped, posts);
  return {
    topPosts: ranked.slice(0, 5).map(({ post, score }) => ({ hook: post?.hook, platform: post?.platformSlug, score })),
    weakestPosts: ranked.slice(-5).map(({ post, score }) => ({ hook: post?.hook, platform: post?.platformSlug, score })),
    recommendations: insights.slice(0, 5).map((insight) => insight.recommendation),
  };
}

export function exportWeeklySocialReportMarkdown(metrics: SocialMetricSnapshotRecord[], posts: SocialPostRecord[], insights = generateRuleBasedInsights(metrics, posts)) {
  const ranked = identifyTopPosts(metrics, posts);
  const start = metrics.map((metric) => metric.reportingStartDate || metric.snapshotDate).sort()[0] || todayIso();
  const end = metrics.map((metric) => metric.reportingEndDate || metric.snapshotDate).sort().at(-1) || todayIso();
  return [
    `# Weekly Social Report - ${start} to ${end}`,
    "",
    "## Executive Summary",
    "",
    `Imported ${metrics.length} metric snapshots across ${new Set(metrics.map((metric) => metric.platformSlug)).size} platform(s).`,
    "",
    "## Best Posts",
    "",
    ...ranked.slice(0, 5).map(({ post, score }, index) => `${index + 1}. ${post?.hook || post?.title || "Untitled post"} - score ${score.toFixed(1)}`),
    "",
    "## Weakest Posts",
    "",
    ...ranked.slice(-5).map(({ post, score }, index) => `${index + 1}. ${post?.hook || post?.title || "Untitled post"} - score ${score.toFixed(1)}`),
    "",
    "## Recommendations",
    "",
    ...insights.map((insight) => `- ${insight.recommendation}`),
  ].join("\n");
}

export function exportSocialMetricsCsv(metrics: SocialMetricSnapshotRecord[]) {
  const headers = ["date", "brand", "platform", "post", "reach", "impressions", "engagements", "clicks", "leads", "engagement_rate", "conversion_rate"];
  const rows = metrics.map((metric) => [
    metric.snapshotDate,
    metric.brandSlug,
    metric.platformSlug,
    metric.socialPostId,
    metric.reach || 0,
    metric.impressions || 0,
    metric.engagementCount,
    metric.clicks || metric.linkClicks || metric.websiteClicks || 0,
    metric.leads || metric.quoteRequests || metric.bookedCalls || 0,
    metric.engagementRate.toFixed(4),
    metric.conversionRate.toFixed(4),
  ]);
  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

export function createSampleSocialImport() {
  const csv = [
    "Platform,Brand,Account,Post URL,Date,Caption,Content Type,Reach,Impressions,Likes,Comments,Shares,Saves,Link Clicks,Profile Visits,Leads,Quote Requests",
    "LinkedIn,signal-workshop,Signal Workshop LinkedIn Page,https://linkedin.com/posts/signal-1,2026-05-28,Good work deserves a better signal.,text,620,800,31,6,4,8,12,15,2,0",
    "Instagram,local-signal-websites,Local Signal Websites Instagram,https://instagram.com/p/local-1,2026-05-28,A local website should answer four questions fast.,carousel,480,650,28,5,7,18,9,22,1,0",
    "Facebook,al-brothers,AL Brothers LLC Facebook Page,https://facebook.com/albrothers/posts/1,2026-05-28,A punch list is not just a list of small things.,photo,710,900,34,8,5,2,6,18,0,3",
    "Instagram,parallax-hearts,Parallax Hearts Instagram,https://instagram.com/p/vallen-1,2026-05-28,Field note from Vallen under the rain.,image,390,520,41,7,9,16,5,11,0,0",
  ].join("\n");
  const preview = createImportPreview({ content: csv, filename: "generic-social-metrics.csv", method: "csv_upload", brandSlug: "signal-workshop" });
  return confirmImport(preview);
}

function platformName(slug: string) {
  return seedPlatforms.find((platform) => platform.slug === slug)?.name || titleize(slug);
}

function titleize(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
