# Automation Workflows

SSWApp automations are manual internal workflows. They generate drafts, review notes, prompt outputs, image prompt records, metrics insights, and export-ready assets. They do not approve or publish content.

## Feature Flags

- `ENABLE_AI_CONTENT_GENERATION=false`
- `ENABLE_AI_IMAGE_PROMPTS=false`
- `ENABLE_AI_METRIC_ANALYSIS=false`
- `ENABLE_AUTO_APPROVAL=false`
- `ENABLE_AUTO_PUBLISHING=false`
- `ENABLE_SOCIAL_API_IMPORTS=false`

When a feature flag is disabled, the app uses deterministic local output or rule-based analysis. The workflow remains usable without an AI provider key.

## Run Today

Manual route: `/run-today`

Steps:

1. Load active brand context.
2. Load active campaigns and offers.
3. Load sanitized performance context from recent imports.
4. Render `brand-selection`.
5. Render `daily-content-pack`.
6. Render image, carousel, short-video, Google Business Profile, and quality-check prompts where relevant.
7. Create review-ready `ContentPack`, `PostDraft`, `ImagePrompt`, and `Approval` records.
8. Redirect or link to the content pack detail page.

All generated items remain `needs_review` or `pending`.

Operational behavior:

- With `DATABASE_URL`, Run Today persists records and returns `/packs/[contentPackId]`.
- Without `DATABASE_URL`, Run Today returns deterministic fallback content and `/packs/run-today`.
- With `OPENAI_API_KEY` disabled or missing, generation remains review-safe and local fallback is labeled in the automation metadata.

## Image Prompt Batch

Recipe: `image-prompt-batch`

The workflow finds post drafts missing image prompts, renders `image-prompt`, creates image prompt records, creates pending image-prompt approvals, and prepares JSON exports for design tools.

## Caption Rewrite

Recipe: `caption-rewrite`

The workflow preserves the original body, renders `caption-rewrite`, saves a review-ready candidate, and keeps the original copy accessible.

## Approval Summary

Recipe: `approval-summary`

The workflow gathers a content pack, posts, and image prompts, renders `approval-summary`, and returns issues and suggested fixes. It never changes approval status automatically.

## Weekly Social Analysis

Recipe: `weekly-social-analysis`

The workflow aggregates normalized metric snapshots, creates sanitized summaries, generates rule-based insights, and only uses AI metric prompts if `ENABLE_AI_METRIC_ANALYSIS=true`. Raw imported rows are never sent by default.

## Performance Context

Recipe: `performance-context-refresh`

The workflow turns accepted insights, top patterns, and weak patterns into a compact safe summary for future daily generation.

## Repurpose Winning Post

Recipe: `repurpose-winning-post`

The workflow loads a strong source post and produces platform-native follow-up ideas. It does not duplicate copy across platforms.

## Campaign Plan

Recipe: `campaign-plan`

The workflow renders `campaign-plan` and creates a draft campaign plan. It is not activated without review.

## Monthly Content Map

Recipe: `monthly-content-map`

The workflow renders a planned calendar map. It does not create approved posts or scheduled posts automatically.

## Site Audit To Content

Recipe: `site-audit-to-content`

The workflow uses sanitized audit findings and creates public-safe educational content. It avoids private client details and client shaming.

## Troubleshooting

- If a prompt fails to render, check required variables on `/prompts`.
- If an AI action is blocked, check the relevant feature flag.
- If exports are empty, confirm posts are approved; scheduler CSV exports approved posts only.
- If analytics are sparse, import more dashboard CSV data and rerun weekly analysis.
- If `/api/health` reports `databaseConfigured: false`, add Neon `DATABASE_URL` and `DIRECT_URL`, run `npx prisma migrate deploy`, then `npm run seed`.
- If Vercel has deployment-level overrides from an older import, redeploy production without build cache after setting Framework Preset to Next.js and Output Directory to the Next.js default.
