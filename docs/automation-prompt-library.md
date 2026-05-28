# Automation Prompt Library

SSWApp stores the prompt system as versioned files plus a TypeScript registry so content, image, approval, analytics, research, and repurposing workflows can share the same guardrails.

## Folder Structure

- `src/prompts/system/base-brand-guardrails.md`: shared brand and anti-slop rules.
- `src/prompts/system/privacy-rules.md`: private dashboard and AI data-use rules.
- `src/prompts/system/output-format-rules.md`: JSON output and status defaults.
- `src/prompts/social/*.md`: the social, image, approval, analytics, campaign, and repurposing templates.
- `src/lib/prompts/promptRegistry.ts`: metadata for each prompt key.
- `src/lib/prompts/renderPrompt.ts`: prompt loading, nested variable replacement, and validation.
- `src/lib/prompts/promptVariables.ts`: sample variable fixtures for preview and tests.

## Prompt Keys

The registry includes:

- `daily-content-pack`
- `brand-selection`
- `platform-post`
- `image-prompt`
- `carousel-outline`
- `short-video-script`
- `reddit-discussion`
- `google-business-profile-post`
- `newsletter-blurb`
- `caption-rewrite`
- `approval-summary`
- `weekly-research-brief`
- `dashboard-analysis`
- `metrics-insight-summary`
- `performance-context-for-generation`
- `repurpose-plan`
- `campaign-plan`
- `site-audit-to-content`
- `monthly-content-map`
- `prompt-quality-check`

## Rendering

Use:

```ts
await renderPrompt({
  promptKey: "daily-content-pack",
  variables,
  includeSystemGuardrails: true,
  includePrivacyRules: true,
  includeOutputRules: true,
});
```

The renderer supports nested paths such as `{{brand.name}}`, validates required variables, includes shared system prompts by default, and returns the prompt key, version, variables used, input hash data for automation runs, and render timestamp.

## Versioning

Each registry entry has a `version`. The Prisma schema supports storing `promptKey`, `promptVersion`, `promptInputHash`, and `modelUsed` on automation outputs such as content packs, post drafts, image prompts, social insights, and automation runs.

## Adding A Prompt

1. Add a Markdown template under `src/prompts/social/` or `src/prompts/system/`.
2. Add a registry entry in `src/lib/prompts/promptRegistry.ts`.
3. Add sample variables in `src/lib/prompts/promptVariables.ts`.
4. Add a fixture in `fixtures/prompts/` when useful.
5. Run `npm.cmd test`.

## Privacy And Approval

- Generated content defaults to `needs_review`.
- Approval records default to `pending`.
- Nothing auto-publishes.
- Analytics prompts use sanitized metrics by default.
- Raw private dashboard data is blocked unless a future feature flag explicitly allows sanitized external analysis.

## UI

- `/prompts` lists prompt metadata.
- `/prompts/preview` renders prompts with editable JSON variables.
- `/automations/recipes` shows manual recipes that use the prompt library.
- `/run-today` runs the practical daily workflow.
