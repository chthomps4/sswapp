# Weekly Workflow Gap Audit

The Weekly Workflow Gap Audit is SSWApp's weekly operations smoke alarm. It scans persisted workflow data for failed automations, stale approvals, incomplete content packs, import/export issues, missing metrics, coverage gaps, and safety boundary problems.

It does not auto-fix, auto-approve, auto-schedule, auto-publish, or send raw dashboard/import rows to AI.

## What It Checks

- Automation run health: failed, partial, stuck, missing metadata, unexpected fallback.
- Content flow: empty content packs, stale review packs, missing approvals, missing image prompts.
- Post readiness: missing hook/body/CTA/alt text, approved posts missing export copy, duplicate platform copy.
- Image and asset flow: missing prompt text, alt text, filenames, creative assets, and duplicate filenames.
- Approval queue health: stale pending approvals, orphan approvals, approval/reviewer safety.
- Exports: approved content that cannot export, missing filenames/alt text, stale approved content.
- Social imports: unconfirmed imports, failed/partial imports, unresolved issues, unmatched posts, missing snapshots.
- Metrics and insights: posted content without metrics, stale weekly analysis, insights waiting for review.
- Brand/campaign coverage: quiet brand lanes, active campaigns/offers without content support.
- Prompt and recipe health: missing prompt files, inactive required recipes, broken Run Today recipe steps.
- Data integrity: orphan records, duplicate filenames, successful automations without recordsCreated.
- Config and safety: database, Clerk, owner emails, upload cap, auto-approval, auto-publishing, metric AI flags.

## Health Score

The score starts at `100`.

- Critical gap: `-25`
- High gap: `-10`
- Medium gap: `-4`
- Low gap: `-1`

Readiness:

- `green`: 85-100
- `yellow`: 60-84
- `red`: below 60

## Manual Run

Open `/workflow-audits` and click **Run weekly audit**.

API:

```bash
curl -X POST https://your-app.example/api/workflow-audits/run \
  -H "content-type: application/json" \
  --data '{"dryRun":false}'
```

Owner authentication is required when Clerk is configured.

## Scheduled Run

Vercel Cron is configured in `vercel.json`:

```json
{
  "path": "/api/cron/workflow-gap-audit",
  "schedule": "30 10 * * 1"
}
```

This runs Monday at 10:30 UTC. Local time shifts with daylight saving time.

Required production environment variables:

```env
CRON_SECRET=
ENABLE_WEEKLY_WORKFLOW_GAP_AUDIT=true
WEEKLY_WORKFLOW_AUDIT_CRON_ENABLED=true
ENABLE_AI_WORKFLOW_AUDIT_SUMMARY=false
ENABLE_AUTO_APPROVAL=false
ENABLE_AUTO_PUBLISHING=false
SOCIAL_IMPORT_MAX_BYTES=5242880
```

The cron endpoint requires:

```http
Authorization: Bearer ${CRON_SECRET}
```

## Optional AI Summary

AI summary is disabled by default. If `ENABLE_AI_WORKFLOW_AUDIT_SUMMARY=true`, only sanitized gap/checkpoint summaries may be sent. Raw imports, dashboard rows, original files, secrets, and customer/private identifiers must remain blocked.

The default summary generator is deterministic and rule-based.

## UI

- `/workflow-audits`: audit history and manual run.
- `/workflow-audits/[id]`: audit detail, checkpoints, critical/high gaps, action items, Markdown export.
- `/workflow-gaps`: global gap/action queue with reviewed/accepted/in-progress/resolved/ignored actions.
- Dashboard home: latest audit score and quick links.

## Export

Audit reports export as:

```text
weekly-workflow-gap-audit-YYYY-MM-DD.md
```

Reports include score, readiness, summary, checkpoints, gaps, action items, and safety notes. They redact common secret patterns and exclude raw dashboard rows.

## Code Health Companion

`.github/workflows/weekly-workflow-code-health.yml` runs weekly code checks:

- `npm ci`
- `npm run prisma:validate`
- `npm test`
- `npm run test:operational`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Vercel Cron audits private app workflow data. GitHub Actions audits code health. They are complementary.

## What It Does Not Do

- It does not delete or repair data automatically.
- It does not approve content.
- It does not publish content.
- It does not send raw private imports to AI.
- It does not replace human review.
