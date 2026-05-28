export type ApprovalStatus =
  | "draft"
  | "needs_review"
  | "approved"
  | "needs_revision"
  | "scheduled"
  | "posted"
  | "measured"
  | "skipped"
  | "archived";

export type PublishingStatus = "not_scheduled" | "ready_to_post" | "scheduled" | "posted" | "skipped";

export type PlatformSlug =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "reddit"
  | "google-business-profile"
  | "newsletter"
  | "youtube-shorts"
  | "tiktok"
  | "kofi";

export type Brand = {
  slug: string;
  name: string;
  businessType: string;
  description?: string;
  positioning: string;
  audience: string;
  offerSummary: string;
  voiceGuidelines: string;
  forbiddenPhrases: string[];
  visualStyle: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  websiteUrl?: string;
  defaultCTA: string;
  active: boolean;
  socialProfiles: SocialProfile[];
  primaryAudience: string;
  voiceNotes: string;
  defaultCta: string;
  notes: string;
};

export type SocialProfile = {
  platform: string;
  handle: string;
  profileUrl: string;
  composerUrl: string;
  adminUrl: string;
  notes: string;
};

export type Platform = {
  slug: PlatformSlug | string;
  name: string;
  characterLimit?: number;
  supportsHashtags: boolean;
  supportsAltText: boolean;
  supportsCarousel: boolean;
  supportsVideo: boolean;
  bestUseCase: string;
  active: boolean;
  maxLength?: number;
  contentNotes: string;
  requiresTags: boolean;
};

export type ContentPillar = {
  brandSlug?: string;
  slug: string;
  name: string;
  description: string;
  examples?: string[];
  active?: boolean;
};

export type Campaign = {
  slug: string;
  brandSlug: string;
  name: string;
  objective: string;
  offer: string;
  primaryCTA: string;
  status: ApprovalStatus;
  notes: string;
};

export type PostVariant = {
  id: string;
  date: string;
  brandSlug: string;
  brandName: string;
  platformSlug: string;
  platformName: string;
  campaign: string;
  contentPillarSlug: string;
  contentPillarName: string;
  objective: string;
  hook: string;
  body: string;
  cta: string;
  imageConcept: string;
  imagePrompt: string;
  altText: string;
  hashtags: string;
  assetFilename: string;
  approvalStatus: ApprovalStatus;
  publishingStatus: PublishingStatus;
  finalUrl: string;
  reviewNotes: string;
  metrics: MetricSnapshot;
};

export type MetricSnapshot = {
  reach: number;
  impressions: number;
  engagements: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  dms: number;
  leads: number;
  registrations: number;
};

export type SocialMetricRecord = MetricSnapshot & {
  id: string;
  postDraftId: string;
  brandSlug: string;
  platformSlug: string;
  date: string;
  likes: number;
  profileVisits: number;
  formSubmissions: number;
  bookedCalls: number;
  workshopRegistrations: number;
  quoteRequests: number;
  kofiSupport: number;
  notes: string;
};

export type ImageType =
  | "quote_card"
  | "carousel"
  | "checklist"
  | "diagram"
  | "data_style_graphic"
  | "screenshot_mockup"
  | "founder_note"
  | "workshop_promo"
  | "before_after"
  | "field_note"
  | "album_story_visual"
  | "jobsite_before_after"
  | "google_business_photo_post"
  | "text_only_no_image_needed";

export type ImagePromptRecord = {
  id: string;
  postDraftId: string;
  brandSlug: string;
  platformSlug: string;
  imageType: ImageType;
  headlineText: string;
  supportingText: string;
  prompt: string;
  negativePrompt: string;
  layoutNotes: string;
  canvaNotes: string;
  adobeExpressNotes: string;
  photoshopNotes: string;
  altText: string;
  aspectRatio: string;
  filename: string;
  status: ApprovalStatus;
};

export type PostDraftRecord = {
  id: string;
  contentPackId: string;
  brandSlug: string;
  brandName: string;
  campaignSlug: string;
  campaignName: string;
  platformSlug: string;
  platformName: string;
  contentPillarSlug: string;
  contentPillarName: string;
  date: string;
  postObjective: string;
  hook: string;
  body: string;
  ctaSoft: string;
  ctaDirect: string;
  hashtags: string;
  communityTags: string;
  firstComment: string;
  replySeeds: string[];
  redditDisclosure: string;
  newsletterSubject: string;
  altText: string;
  status: ApprovalStatus;
  reviewerNotes: string;
  finalCopy: string;
  scheduledDate: string;
  postedUrl: string;
};

export type ContentPackRecord = {
  id: string;
  date: string;
  title: string;
  dailyTheme: string;
  strategicReason: string;
  selectedBrands: string[];
  status: ApprovalStatus;
  generatedBy: string;
  modelUsed: string;
  promptVersion: string;
  notes: string;
};

export type ApprovalRecord = {
  id: string;
  contentPackId: string;
  postDraftId?: string;
  imagePromptId?: string;
  creativeAssetId?: string;
  type: "copy" | "image_prompt" | "image_asset" | "full_post";
  status: "pending" | "approved" | "needs_revision" | "rejected";
  reviewer: string;
  notes: string;
  approvedAt: string;
};

export type AutomationRunRecord = {
  id: string;
  type:
    | "run_today"
    | "daily_content_pack"
    | "image_prompt_batch"
    | "weekly_research_brief"
    | "weekly_social_analysis"
    | "performance_context_refresh"
    | "repurpose_winning_post"
    | "campaign_plan"
    | "monthly_content_map"
    | "site_audit_to_content"
    | "metrics_analysis"
    | "caption_rewrite"
    | "approval_summary"
    | "prompt_test_run"
    | "approval_export"
    | "asset_manifest_export";
  status: "queued" | "running" | "succeeded" | "failed";
  input: unknown;
  output: unknown;
  error: string;
  startedAt: string;
  completedAt: string;
  createdAt: string;
  promptKey?: string;
  promptVersion?: string;
  promptInputHash?: string;
  modelUsed?: string;
  recordsCreated?: unknown;
};

export type GeneratedContentPack = {
  contentPack: ContentPackRecord;
  postDrafts: PostDraftRecord[];
  imagePrompts: ImagePromptRecord[];
  approvals: ApprovalRecord[];
  automationRun: AutomationRunRecord;
};

export type DailyPackInput = {
  date?: string;
  theme: string;
  dailyTheme?: string;
  brandSlug?: string;
  selectedBrands?: string[];
  selectedPlatforms?: string[];
  offer?: string;
  audiencePriority?: string;
  campaign?: string;
  strategicPriority?: string;
  recentPerformanceNotes?: string;
  researchBrief?: string;
  postCount?: number;
  includeImagePrompts?: boolean;
  includeCarouselOutlines?: boolean;
  includeRedditVersions?: boolean;
  includeGoogleBusinessProfile?: boolean;
};

export type GeneratedPost = Omit<
  PostVariant,
  "id" | "metrics" | "approvalStatus" | "publishingStatus" | "finalUrl" | "reviewNotes"
>;
