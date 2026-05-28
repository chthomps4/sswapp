-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'needs_review', 'needs_revision', 'approved', 'scheduled', 'posted', 'measured', 'skipped', 'archived');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('copy', 'image_prompt', 'image_asset', 'full_post');

-- CreateEnum
CREATE TYPE "ApprovalWorkflowStatus" AS ENUM ('pending', 'approved', 'needs_revision', 'rejected');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('quote_card', 'carousel', 'checklist', 'diagram', 'data_style_graphic', 'screenshot_mockup', 'founder_note', 'workshop_promo', 'before_after', 'field_note', 'album_story_visual', 'jobsite_before_after', 'google_business_photo_post', 'text_only_no_image_needed');

-- CreateEnum
CREATE TYPE "AutomationType" AS ENUM ('run_today', 'daily_content_pack', 'image_prompt_batch', 'weekly_research_brief', 'weekly_social_analysis', 'performance_context_refresh', 'repurpose_winning_post', 'campaign_plan', 'monthly_content_map', 'site_audit_to_content', 'metrics_analysis', 'caption_rewrite', 'approval_summary', 'prompt_test_run', 'approval_export', 'asset_manifest_export');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "AutomationRecipeTriggerType" AS ENUM ('manual', 'scheduled', 'event', 'webhook', 'import_complete');

-- CreateEnum
CREATE TYPE "SocialImportMethod" AS ENUM ('csv_upload', 'xlsx_upload', 'pasted_table', 'manual_entry', 'api_import', 'json_upload');

-- CreateEnum
CREATE TYPE "SocialImportStatus" AS ENUM ('uploaded', 'parsed', 'needs_mapping', 'ready_to_import', 'imported', 'partially_imported', 'failed', 'archived');

-- CreateEnum
CREATE TYPE "SocialRowValidationStatus" AS ENUM ('valid', 'warning', 'invalid', 'duplicate', 'ignored');

-- CreateEnum
CREATE TYPE "SocialPostStatus" AS ENUM ('imported', 'matched', 'manually_created', 'generated_from_app', 'posted', 'archived');

-- CreateEnum
CREATE TYPE "SocialInsightType" AS ENUM ('winning_post', 'weak_post', 'winning_platform', 'weak_platform', 'winning_pillar', 'weak_pillar', 'winning_hook', 'weak_hook', 'winning_cta', 'weak_cta', 'winning_image_type', 'weak_image_type', 'posting_time_pattern', 'audience_response_pattern', 'conversion_pattern', 'repurpose_opportunity', 'stop_doing', 'test_next', 'content_gap');

-- CreateEnum
CREATE TYPE "SocialInsightStatus" AS ENUM ('new', 'reviewed', 'accepted', 'dismissed', 'implemented');

-- CreateEnum
CREATE TYPE "SocialImportIssueType" AS ENUM ('missing_required_field', 'invalid_date', 'invalid_number', 'duplicate_row', 'unmatched_post', 'unknown_platform', 'unknown_brand', 'unsupported_file_type', 'mapping_error', 'parse_error');

-- CreateEnum
CREATE TYPE "SocialImportIssueSeverity" AS ENUM ('info', 'warning', 'error');

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "positioning" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "offerSummary" TEXT NOT NULL,
    "voiceGuidelines" TEXT NOT NULL,
    "forbiddenPhrases" JSONB,
    "visualStyle" TEXT NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "defaultCTA" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialProfile" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT,
    "profileUrl" TEXT NOT NULL,
    "composerUrl" TEXT,
    "adminUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "characterLimit" INTEGER,
    "supportsHashtags" BOOLEAN NOT NULL DEFAULT false,
    "supportsAltText" BOOLEAN NOT NULL DEFAULT false,
    "supportsCarousel" BOOLEAN NOT NULL DEFAULT false,
    "supportsVideo" BOOLEAN NOT NULL DEFAULT false,
    "bestUseCase" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPillar" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "examples" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContentPillar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "offer" TEXT,
    "primaryCTA" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTheme" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "angle" TEXT,
    "source" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "recommendedBrands" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPack" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "dailyTheme" TEXT NOT NULL,
    "strategicReason" TEXT NOT NULL,
    "selectedBrands" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "generatedBy" TEXT,
    "modelUsed" TEXT,
    "promptKey" TEXT,
    "promptVersion" TEXT,
    "promptInputHash" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostDraft" (
    "id" TEXT NOT NULL,
    "contentPackId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "campaignId" TEXT,
    "platformId" TEXT NOT NULL,
    "contentPillarId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "postObjective" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "ctaSoft" TEXT,
    "ctaDirect" TEXT,
    "hashtags" TEXT,
    "communityTags" TEXT,
    "firstComment" TEXT,
    "replySeeds" JSONB,
    "redditDisclosure" TEXT,
    "newsletterSubject" TEXT,
    "altText" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'needs_review',
    "reviewerNotes" TEXT,
    "finalCopy" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "postedUrl" TEXT,
    "promptKey" TEXT,
    "promptVersion" TEXT,
    "promptInputHash" TEXT,
    "modelUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagePrompt" (
    "id" TEXT NOT NULL,
    "postDraftId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "imageType" "ImageType" NOT NULL,
    "headlineText" TEXT,
    "supportingText" TEXT,
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "layoutNotes" TEXT,
    "canvaNotes" TEXT,
    "adobeExpressNotes" TEXT,
    "photoshopNotes" TEXT,
    "altText" TEXT,
    "aspectRatio" TEXT,
    "filename" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'needs_review',
    "promptKey" TEXT,
    "promptVersion" TEXT,
    "promptInputHash" TEXT,
    "modelUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImagePrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeAsset" (
    "id" TEXT NOT NULL,
    "imagePromptId" TEXT NOT NULL,
    "postDraftId" TEXT,
    "brandId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT,
    "storagePath" TEXT,
    "mimeType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "aspectRatio" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreativeAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "contentPackId" TEXT,
    "postDraftId" TEXT,
    "imagePromptId" TEXT,
    "creativeAssetId" TEXT,
    "brandId" TEXT,
    "type" "ApprovalType" NOT NULL,
    "status" "ApprovalWorkflowStatus" NOT NULL DEFAULT 'pending',
    "reviewer" TEXT,
    "notes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMetric" (
    "id" TEXT NOT NULL,
    "postDraftId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "profileVisits" INTEGER NOT NULL DEFAULT 0,
    "dms" INTEGER NOT NULL DEFAULT 0,
    "formSubmissions" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "bookedCalls" INTEGER NOT NULL DEFAULT 0,
    "workshopRegistrations" INTEGER NOT NULL DEFAULT 0,
    "quoteRequests" INTEGER NOT NULL DEFAULT 0,
    "kofiSupport" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "handle" TEXT,
    "accountUrl" TEXT,
    "externalAccountId" TEXT,
    "dashboardSource" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialDashboardImport" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "platformId" TEXT,
    "brandId" TEXT,
    "socialAccountId" TEXT,
    "importedBy" TEXT,
    "importMethod" "SocialImportMethod" NOT NULL,
    "originalFilename" TEXT,
    "originalFileUrl" TEXT,
    "originalFileBytes" BYTEA,
    "originalMimeType" TEXT,
    "originalFileHash" TEXT NOT NULL,
    "rawColumnHeaders" JSONB NOT NULL,
    "detectedPlatform" TEXT,
    "detectedDateRangeStart" TIMESTAMP(3),
    "detectedDateRangeEnd" TIMESTAMP(3),
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "status" "SocialImportStatus" NOT NULL DEFAULT 'uploaded',
    "errorSummary" TEXT,
    "mappingTemplateId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialDashboardImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMetricMappingTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platformId" TEXT,
    "sourceName" TEXT NOT NULL,
    "description" TEXT,
    "mappingJson" JSONB NOT NULL,
    "requiredFields" JSONB NOT NULL,
    "optionalFields" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMetricMappingTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialImportedRow" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "rawJson" JSONB NOT NULL,
    "normalizedJson" JSONB,
    "validationStatus" "SocialRowValidationStatus" NOT NULL DEFAULT 'valid',
    "validationErrors" JSONB,
    "matchedPostDraftId" TEXT,
    "matchedSocialPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialImportedRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "socialAccountId" TEXT,
    "postDraftId" TEXT,
    "contentPackId" TEXT,
    "campaignId" TEXT,
    "contentPillarId" TEXT,
    "externalPostId" TEXT,
    "postUrl" TEXT,
    "postedAt" TIMESTAMP(3),
    "title" TEXT,
    "hook" TEXT,
    "bodyPreview" TEXT,
    "fullCopy" TEXT,
    "mediaType" TEXT,
    "imageType" "ImageType",
    "assetFilename" TEXT,
    "ctaType" TEXT,
    "postObjective" TEXT,
    "contentFingerprint" TEXT NOT NULL,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'imported',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMetricSnapshot" (
    "id" TEXT NOT NULL,
    "socialPostId" TEXT,
    "postDraftId" TEXT,
    "brandId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "socialAccountId" TEXT,
    "importId" TEXT,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "reportingStartDate" TIMESTAMP(3),
    "reportingEndDate" TIMESTAMP(3),
    "reach" INTEGER,
    "impressions" INTEGER,
    "views" INTEGER,
    "videoViews" INTEGER,
    "threeSecondViews" INTEGER,
    "averageWatchTime" DOUBLE PRECISION,
    "watchTimeSeconds" INTEGER,
    "likes" INTEGER,
    "reactions" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saves" INTEGER,
    "reposts" INTEGER,
    "retweets" INTEGER,
    "quotePosts" INTEGER,
    "linkClicks" INTEGER,
    "profileVisits" INTEGER,
    "follows" INTEGER,
    "unfollows" INTEGER,
    "dms" INTEGER,
    "emailClicks" INTEGER,
    "phoneClicks" INTEGER,
    "directionClicks" INTEGER,
    "websiteClicks" INTEGER,
    "formSubmissions" INTEGER,
    "leads" INTEGER,
    "quoteRequests" INTEGER,
    "bookedCalls" INTEGER,
    "workshopRegistrations" INTEGER,
    "purchases" INTEGER,
    "revenue" DOUBLE PRECISION,
    "kofiSupport" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION,
    "spend" DOUBLE PRECISION,
    "cpc" DOUBLE PRECISION,
    "cpm" DOUBLE PRECISION,
    "ctr" DOUBLE PRECISION,
    "engagementRate" DOUBLE PRECISION,
    "conversionRate" DOUBLE PRECISION,
    "rawMetricJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMetricDailyRollup" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "socialAccountId" TEXT,
    "campaignId" TEXT,
    "contentPillarId" TEXT,
    "postObjective" TEXT,
    "imageType" "ImageType",
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "totalReach" INTEGER NOT NULL DEFAULT 0,
    "totalImpressions" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalEngagements" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageEngagementRate" DOUBLE PRECISION,
    "averageClickRate" DOUBLE PRECISION,
    "averageConversionRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMetricDailyRollup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPerformanceInsight" (
    "id" TEXT NOT NULL,
    "dateRangeStart" TIMESTAMP(3) NOT NULL,
    "dateRangeEnd" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT,
    "platformId" TEXT,
    "campaignId" TEXT,
    "contentPillarId" TEXT,
    "insightType" "SocialInsightType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "evidenceJson" JSONB NOT NULL,
    "recommendation" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "status" "SocialInsightStatus" NOT NULL DEFAULT 'new',
    "promptKey" TEXT,
    "promptVersion" TEXT,
    "promptInputHash" TEXT,
    "modelUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPerformanceInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialBenchmark" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "averageValue" DOUBLE PRECISION NOT NULL,
    "medianValue" DOUBLE PRECISION,
    "topQuartileValue" DOUBLE PRECISION,
    "bottomQuartileValue" DOUBLE PRECISION,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "dateRangeStart" TIMESTAMP(3) NOT NULL,
    "dateRangeEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialImportIssue" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "rowId" TEXT,
    "issueType" "SocialImportIssueType" NOT NULL,
    "severity" "SocialImportIssueSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "suggestedFix" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialImportIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL,
    "type" "AutomationType" NOT NULL,
    "status" "AutomationStatus" NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "promptKey" TEXT,
    "promptVersion" TEXT,
    "promptInputHash" TEXT,
    "modelUsed" TEXT,
    "recordsCreated" JSONB,
    "recipeRunId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRecipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "triggerType" "AutomationRecipeTriggerType" NOT NULL DEFAULT 'manual',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "stepsJson" JSONB NOT NULL,
    "requiredInputsJson" JSONB NOT NULL,
    "optionalInputsJson" JSONB,
    "defaultSettingsJson" JSONB,
    "featureFlagsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRecipeRun" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "status" "AutomationStatus" NOT NULL,
    "inputJson" JSONB NOT NULL,
    "outputJson" JSONB,
    "error" TEXT,
    "recordsCreatedJson" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationRecipeRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchBrief" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "summary" TEXT NOT NULL,
    "audienceSignals" JSONB,
    "postIdeas" JSONB,
    "visualConcepts" JSONB,
    "rawText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchBrief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SocialProfile_brandId_platform_key" ON "SocialProfile"("brandId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_slug_key" ON "Platform"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPillar_brandId_slug_key" ON "ContentPillar"("brandId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_brandId_slug_key" ON "Campaign"("brandId", "slug");

-- CreateIndex
CREATE INDEX "PostDraft_date_status_idx" ON "PostDraft"("date", "status");

-- CreateIndex
CREATE INDEX "PostDraft_brandId_platformId_idx" ON "PostDraft"("brandId", "platformId");

-- CreateIndex
CREATE UNIQUE INDEX "ImagePrompt_filename_key" ON "ImagePrompt"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "CreativeAsset_filename_key" ON "CreativeAsset"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_brandId_platformId_accountName_key" ON "SocialAccount"("brandId", "platformId", "accountName");

-- CreateIndex
CREATE UNIQUE INDEX "SocialDashboardImport_originalFileHash_key" ON "SocialDashboardImport"("originalFileHash");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMetricMappingTemplate_name_sourceName_key" ON "SocialMetricMappingTemplate"("name", "sourceName");

-- CreateIndex
CREATE UNIQUE INDEX "SocialImportedRow_importId_rowIndex_key" ON "SocialImportedRow"("importId", "rowIndex");

-- CreateIndex
CREATE INDEX "SocialPost_brandId_platformId_postedAt_idx" ON "SocialPost"("brandId", "platformId", "postedAt");

-- CreateIndex
CREATE INDEX "SocialPost_contentFingerprint_idx" ON "SocialPost"("contentFingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "SocialPost_platformId_externalPostId_key" ON "SocialPost"("platformId", "externalPostId");

-- CreateIndex
CREATE INDEX "SocialMetricSnapshot_brandId_platformId_snapshotDate_idx" ON "SocialMetricSnapshot"("brandId", "platformId", "snapshotDate");

-- CreateIndex
CREATE INDEX "SocialMetricSnapshot_socialPostId_snapshotDate_idx" ON "SocialMetricSnapshot"("socialPostId", "snapshotDate");

-- CreateIndex
CREATE INDEX "SocialMetricDailyRollup_date_brandId_platformId_idx" ON "SocialMetricDailyRollup"("date", "brandId", "platformId");

-- CreateIndex
CREATE INDEX "SocialPerformanceInsight_dateRangeStart_dateRangeEnd_status_idx" ON "SocialPerformanceInsight"("dateRangeStart", "dateRangeEnd", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SocialBenchmark_brandId_platformId_metricName_period_dateRa_key" ON "SocialBenchmark"("brandId", "platformId", "metricName", "period", "dateRangeStart", "dateRangeEnd");

-- CreateIndex
CREATE INDEX "SocialImportIssue_importId_severity_idx" ON "SocialImportIssue"("importId", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationRecipe_slug_key" ON "AutomationRecipe"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PromptTemplate_slug_key" ON "PromptTemplate"("slug");

-- AddForeignKey
ALTER TABLE "SocialProfile" ADD CONSTRAINT "SocialProfile_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPillar" ADD CONSTRAINT "ContentPillar_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostDraft" ADD CONSTRAINT "PostDraft_contentPackId_fkey" FOREIGN KEY ("contentPackId") REFERENCES "ContentPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostDraft" ADD CONSTRAINT "PostDraft_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostDraft" ADD CONSTRAINT "PostDraft_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostDraft" ADD CONSTRAINT "PostDraft_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostDraft" ADD CONSTRAINT "PostDraft_contentPillarId_fkey" FOREIGN KEY ("contentPillarId") REFERENCES "ContentPillar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagePrompt" ADD CONSTRAINT "ImagePrompt_postDraftId_fkey" FOREIGN KEY ("postDraftId") REFERENCES "PostDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagePrompt" ADD CONSTRAINT "ImagePrompt_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagePrompt" ADD CONSTRAINT "ImagePrompt_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeAsset" ADD CONSTRAINT "CreativeAsset_imagePromptId_fkey" FOREIGN KEY ("imagePromptId") REFERENCES "ImagePrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeAsset" ADD CONSTRAINT "CreativeAsset_postDraftId_fkey" FOREIGN KEY ("postDraftId") REFERENCES "PostDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeAsset" ADD CONSTRAINT "CreativeAsset_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeAsset" ADD CONSTRAINT "CreativeAsset_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_contentPackId_fkey" FOREIGN KEY ("contentPackId") REFERENCES "ContentPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_postDraftId_fkey" FOREIGN KEY ("postDraftId") REFERENCES "PostDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_imagePromptId_fkey" FOREIGN KEY ("imagePromptId") REFERENCES "ImagePrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_creativeAssetId_fkey" FOREIGN KEY ("creativeAssetId") REFERENCES "CreativeAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetric" ADD CONSTRAINT "SocialMetric_postDraftId_fkey" FOREIGN KEY ("postDraftId") REFERENCES "PostDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetric" ADD CONSTRAINT "SocialMetric_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetric" ADD CONSTRAINT "SocialMetric_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialDashboardImport" ADD CONSTRAINT "SocialDashboardImport_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialDashboardImport" ADD CONSTRAINT "SocialDashboardImport_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialDashboardImport" ADD CONSTRAINT "SocialDashboardImport_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialDashboardImport" ADD CONSTRAINT "SocialDashboardImport_mappingTemplateId_fkey" FOREIGN KEY ("mappingTemplateId") REFERENCES "SocialMetricMappingTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricMappingTemplate" ADD CONSTRAINT "SocialMetricMappingTemplate_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialImportedRow" ADD CONSTRAINT "SocialImportedRow_importId_fkey" FOREIGN KEY ("importId") REFERENCES "SocialDashboardImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialImportedRow" ADD CONSTRAINT "SocialImportedRow_matchedPostDraftId_fkey" FOREIGN KEY ("matchedPostDraftId") REFERENCES "PostDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialImportedRow" ADD CONSTRAINT "SocialImportedRow_matchedSocialPostId_fkey" FOREIGN KEY ("matchedSocialPostId") REFERENCES "SocialPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_postDraftId_fkey" FOREIGN KEY ("postDraftId") REFERENCES "PostDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_contentPackId_fkey" FOREIGN KEY ("contentPackId") REFERENCES "ContentPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_contentPillarId_fkey" FOREIGN KEY ("contentPillarId") REFERENCES "ContentPillar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricSnapshot" ADD CONSTRAINT "SocialMetricSnapshot_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricSnapshot" ADD CONSTRAINT "SocialMetricSnapshot_postDraftId_fkey" FOREIGN KEY ("postDraftId") REFERENCES "PostDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricSnapshot" ADD CONSTRAINT "SocialMetricSnapshot_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricSnapshot" ADD CONSTRAINT "SocialMetricSnapshot_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricSnapshot" ADD CONSTRAINT "SocialMetricSnapshot_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricSnapshot" ADD CONSTRAINT "SocialMetricSnapshot_importId_fkey" FOREIGN KEY ("importId") REFERENCES "SocialDashboardImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricDailyRollup" ADD CONSTRAINT "SocialMetricDailyRollup_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricDailyRollup" ADD CONSTRAINT "SocialMetricDailyRollup_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricDailyRollup" ADD CONSTRAINT "SocialMetricDailyRollup_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricDailyRollup" ADD CONSTRAINT "SocialMetricDailyRollup_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetricDailyRollup" ADD CONSTRAINT "SocialMetricDailyRollup_contentPillarId_fkey" FOREIGN KEY ("contentPillarId") REFERENCES "ContentPillar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPerformanceInsight" ADD CONSTRAINT "SocialPerformanceInsight_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPerformanceInsight" ADD CONSTRAINT "SocialPerformanceInsight_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPerformanceInsight" ADD CONSTRAINT "SocialPerformanceInsight_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPerformanceInsight" ADD CONSTRAINT "SocialPerformanceInsight_contentPillarId_fkey" FOREIGN KEY ("contentPillarId") REFERENCES "ContentPillar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialBenchmark" ADD CONSTRAINT "SocialBenchmark_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialBenchmark" ADD CONSTRAINT "SocialBenchmark_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialImportIssue" ADD CONSTRAINT "SocialImportIssue_importId_fkey" FOREIGN KEY ("importId") REFERENCES "SocialDashboardImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialImportIssue" ADD CONSTRAINT "SocialImportIssue_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "SocialImportedRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_recipeRunId_fkey" FOREIGN KEY ("recipeRunId") REFERENCES "AutomationRecipeRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRecipeRun" ADD CONSTRAINT "AutomationRecipeRun_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "AutomationRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

