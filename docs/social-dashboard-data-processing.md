# Private Social Dashboard Data Processing

SSWApp can process manual social dashboard exports without auto-publishing or exposing private data. V1 focuses on the first useful workflow: export dashboard data, upload or paste it into SSWApp, preview the mapping, import normalized metrics, and see what content is worth repeating.

## Supported Imports

V1 fully supports:

- CSV upload
- pasted table data

The schema and enums reserve room for XLSX, JSON, manual entry, and direct API imports, but those are not active in v1.

Sample fixtures live in `fixtures/social-imports/` and use fake data only.

## Import Flow

1. Open `/social/imports/new`.
2. Select brand and platform.
3. Upload a CSV or paste dashboard table data.
4. Preview the first 20 rows.
5. Review detected platform, date range, headers, mapping template, validation status, and post matches.
6. Confirm import.
7. SSWApp creates persisted social posts, metric snapshots, rollups, issues, and rule-based insights when `DATABASE_URL` is configured. Without database env vars, the UI uses deterministic sample data so routes remain testable.

## Persistence

The DB-first v1 stores:

- `SocialDashboardImport` with private `originalFileBytes`, file hash, headers, detected platform, row count, status, and mapping template.
- `SocialImportedRow` preview rows with raw JSON, normalized JSON, validation status, and matching metadata.
- `SocialImportIssue` records for missing fields, duplicates, unsupported rows, and mapping problems.
- `SocialPost` records for matched or newly imported posts.
- `SocialMetricSnapshot` and `SocialMetricDailyRollup` records for reporting.
- `SocialPerformanceInsight` records for recommendations that can feed future content themes.

Duplicate imports are blocked by `originalFileHash`.

## Column Mapping

Mapping templates live in `src/lib/social-dashboard-engine.ts` for v1. The templates normalize common dashboard headers such as:

- `Post URL`, `Permalink`, `Content URL`
- `Date`, `Published Date`, `Created Time`
- `Caption`, `Post Text`, `Message`
- `Reach`, `Impressions`, `Views`
- `Likes`, `Reactions`, `Comments`, `Shares`, `Saves`
- `Link Clicks`, `Website Clicks`, `Phone Clicks`, `Direction Clicks`
- `Leads`, `Quote Requests`, `Booked Calls`, `Workshop Registrations`

Rows with missing required fields are flagged before import.

## Post Matching

Imported rows match existing content in this order:

1. Exact post URL.
2. External post ID.
3. Existing `PostDraft.postedUrl`.
4. Same platform/brand/date with similar caption.
5. Same platform/brand with asset filename.
6. Manual match, create new SocialPost, or ignore.

V1 includes automatic matching and API shape for manual matching.

## Normalized Metrics

All imports are converted into a normalized row with identity, classification, raw metrics, and derived metrics:

- identity: platform, brand, account, post URL, external post ID, posted date, caption/title.
- classification: campaign, pillar, objective, image type, CTA type.
- metrics: reach, impressions, views, video views, likes, comments, shares, saves, clicks, profile visits, follows, DMs, leads, quote requests, booked calls, purchases, revenue, spend.
- derived: engagement count, engagement rate, click rate, conversion rate, cost per lead, revenue per post.

## Insight Engine

The first implementation is rule-based. It scores posts by brand-specific goals:

- Signal Workshop: clicks, leads, booked calls, registrations, comments, saves.
- Local Signal Websites: website clicks, form submissions, quote requests, DMs, profile visits.
- Parallax Hearts: saves, shares, follows, Ko-fi support, views, comments, link clicks.
- AL Brothers: phone clicks, direction clicks, quote requests, form submissions, local reach, messages.
- Business Signal Workshop: comments, saves, clicks, registrations, booked calls.

Generated insights include winning posts, weak posts, winning platforms, winning pillars, best visual formats, repurpose opportunities, and stop/revise recommendations.

## Feedback Into Content Creation

Use `/api/social/exports/prompt-context` to get sanitized performance context for future content prompts. It returns only summarized top posts, weak posts, and recommendations. It does not include raw imported dashboard rows.

Accepted recommendations can become future `ContentTheme` records through `/api/social/insights/[id]/accept`.

## Privacy

- Imported data is private.
- Original import bytes are stored privately in Postgres v1 when the database is configured.
- Raw rows are not logged intentionally.
- Raw import data is not sent to OpenAI.
- `ENABLE_AI_METRIC_ANALYSIS=false` by default.
- `ENABLE_SOCIAL_API_IMPORTS=false` by default.
- `SOCIAL_IMPORT_MAX_BYTES=5242880` by default.

## Exports

- Weekly Markdown report: `/api/social/exports/weekly-report`
- Normalized metrics CSV: `/api/social/exports/metrics`
- Insights JSON: `/api/social/exports/insights`
- Sanitized prompt context JSON: `/api/social/exports/prompt-context`

## Future API Integrations

Direct API integrations should come after the CSV/paste workflow is reliable. Future connectors can add Meta, LinkedIn, Google Business Profile, YouTube, TikTok, Reddit, Ko-fi, and website analytics imports behind feature flags.
