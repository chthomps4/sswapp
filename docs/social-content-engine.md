# Social Content Automation Engine

SSWApp is the internal operating system for Signal Workshop umbrella content. It creates review-ready daily packs, platform-specific captions, image prompts, approval records, export files, and weekly performance recommendations. It does not auto-publish.

## Seeded Brands

- Signal Workshop
- Business Signal Workshop
- Local Signal Websites
- SiteSignal
- Parallax Hearts
- AL Brothers LLC

Editable brand configuration lives in `src/config/brands/*.json`. Those files include positioning, audience, offers, voice, forbidden phrases, content pillars, CTA options, image style rules, guardrails, sample hooks, formats, and filename prefixes.

## Daily Pack Workflow

1. Open the dashboard or `/generator`.
2. Add the date, selected brands, selected platforms, offer, theme, strategic priority, and any Deep Research notes.
3. Generate a pack through `POST /api/generate/daily-pack` for OpenAI-backed/fallback post drafts or `POST /api/automation/generate-daily-content-pack` for the deterministic internal sample pack shape.
4. Review every copy and image prompt approval.
5. Export approved content only.
6. Open social destinations from Social Launchpad and publish manually in the logged-in browser.

## Approval Workflow

Default records are review-first:

- copy: pending
- image_prompt: pending
- full_post: pending

Publishing status is never advanced automatically. Scheduler exports must use approved posts only.

## Exports

- Daily review markdown: `GET /api/exports/markdown`
- Approved scheduler CSV: `GET /api/exports/csv`
- Scheduler CSV from the automation pack: `GET /api/exports/scheduler-csv`
- Image prompt JSON: `GET /api/exports/image-prompts`
- Asset manifest JSON: `GET /api/exports/asset-manifest`
- Weekly report markdown: `GET /api/exports/weekly-report`

## Image Prompts

Image prompt records include image type, headline text, supporting text, prompt, negative prompt, layout notes, Canva notes, Adobe Express notes, Photoshop notes, alt text, aspect ratio, filename, and status.

Filename format:

```text
YYYY-MM-DD_brand_platform_contentpillar_campaign_v01.ext
```

Example:

```text
2026-05-28_signal-workshop_linkedin_simple-systems-that-work_simple-systems-that-work_v01.png
```

## Metrics

Metrics can be entered manually or imported through `POST /api/metrics/import`. The rule-based recommendation engine scores practical outcomes more heavily than vanity reach:

- saves
- comments
- shares
- clicks
- DMs
- leads
- quote requests
- workshop registrations
- booked calls
- Ko-fi support

Weekly analysis recommends what to repeat, revise, stop, or repurpose.

## Environment Variables

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OWNER_EMAILS=
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_MODEL_TEXT=
OPENAI_MODEL_IMAGE=
ENABLE_IMAGE_GENERATION=false
ENABLE_AUTO_APPROVAL=false
```

Use a pooled Neon connection for app traffic in `DATABASE_URL`. Use a direct connection for Prisma migration operations in `DIRECT_URL`. Prisma 7 reads `DATABASE_URL` through `prisma.config.ts`.

## Future Integrations

- actual image generation behind `ENABLE_IMAGE_GENERATION`
- Canva and Adobe Express API handoff
- Photoshop refinement automation
- Meta scheduling after approval
- LinkedIn API scheduling after approval
- Google Business Profile posting after approval
- Reddit draft management
- analytics API imports
- automated Pulse/Tasks import
