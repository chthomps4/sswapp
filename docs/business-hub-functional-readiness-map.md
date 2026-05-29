# Business Hub Functional Readiness Map

Status: active rescue plan
Owner: Fred
Primary Linear issue: SIG-22
Staff lanes: SIG-23 through SIG-29
Last updated: 2026-05-29

## Purpose

The Signal Workshop business hub should become the private operating system for the business, not a set of disconnected demo pages.

The immediate goal is to make every visible page truthful and useful, then replace sample-only behavior with persisted workflows in a safe order.

## Current Audit Summary

The hub has real foundations:

- Next.js App Router application.
- Prisma/Postgres direction.
- Clerk-ready private access controls.
- Automation routes and prompt libraries.
- Social imports, metrics, exports, approvals, workflow audits, and Run Today work already started.
- Google Calendar connector access is available to Codex for bounded, private reads.
- Linear is the execution board for staff tasks.
- Slack `#command` is available as an intake lane.
- The hub is now also an internal proof-of-work example for AI workflow setup services, pending Fred and CEO/Owner approval before any public positioning.

The hub is not fully functional yet because several pages still use seed data, deterministic samples, placeholder UI, or partially wired actions.

## First Slice Implemented

The first rescue slice makes `/calendar` useful immediately without overbuilding production sync.

Added:

- Private business operating events.
- Owner action list.
- Content draft calendar.
- Route/dead-page rescue queue.
- Clear labels for manual, connector-ready, and future DB-backed states.

No calendar writes were added.
No auto-approval was added.
No auto-publishing was added.
No raw calendar data is exposed publicly.

## Route Readiness

| Route | Current State | Priority | Owner | Next Action |
| --- | --- | --- | --- | --- |
| `/` | Sample-heavy dashboard | P1 | Fred | Replace widgets with persisted DB summaries and missing-env states. |
| `/calendar` | Partially rescued | P1 | Alvin | Add DB-backed business calendar events, then approved read-only Google sync. |
| `/generator` | Placeholder/static form risk | P1 | Alvin | Wire to Run Today and persisted AutomationRun records. |
| `/metrics` | Sample fallback risk | P1 | Sara | Move to persisted SocialMetricSnapshot and SocialPerformanceInsight records. |
| `/brands` | Seed-backed config view | P2 | Alvin | Render persisted brand/platform/pillar configs; defer editing until owner checks are complete. |
| `/social/posts/[id]` | Needs route-level review | P2 | Sara | Confirm persisted reads, owner checks, empty states, and export readiness. |

## Staff Delegation

### Fred

Linear: SIG-23

Owns the final functional readiness map, implementation sequence, CEO blockers, merge readiness, and deployment readiness.

### Sara

Linear: SIG-24

Audits dead pages, sample-only behavior, missing owner checks, privacy risk, misleading UI, and missing empty/error states.

### Seth

Linear: SIG-25

Researches Google Calendar integration options, business OS data boundaries, and production-safe sync approaches. Research does not authorize implementation.

### Jeff

Linear: SIG-26

Owns automation intake across Slack, Linear, repo docs, Google Calendar context, and SSWApp automation outputs.

### Ed

Linear: SIG-27

Maps workflows and review gates so source inputs become durable tasks, handoffs, audits, or CEO decisions without bypassing Fred.

### Alvin

Linear: SIG-28

Implements Fred-approved slices only. First slice is calendar visibility plus route rescue visibility. Later slices need Fred/Sara approval.

### CEO/Owner

Linear: SIG-29

Confirms access and business rules that Fred cannot safely decide alone.

## What We Need From The CEO/Owner

Current blockers are limited and concrete:

1. Confirm which Google calendars should feed the hub.
   Fred recommends primary calendar read-only for v1.

2. Confirm whether Slack `#command` is intake-only or source of truth.
   Fred recommends intake-only. Repo docs and Linear remain durable source of truth.

3. List any private project folders outside:
   - `C:\Users\Signal Workshop\Documents\SiteSignalCo`
   - `C:\Users\Signal Workshop\Documents\Signal workshop business hub`

4. Choose the first functional priority after calendar:
   - dashboard
   - Run Today/generator
   - approval queue
   - metrics/imports
   - exports
   - brand/campaign admin

5. Confirm whether production Google Calendar integration should be:
   - connector-only daily briefs first
   - manual import/export first
   - DB-backed read-only sync
   - full OAuth app integration later

Fred recommendation: connector-only daily briefs plus DB-backed manual events first, then read-only Google sync after Sara's privacy audit.

## Implementation Phases

### Phase 1: Truthful UI And Rescue Map

Goal: No page should pretend to be more operational than it is.

Actions:

- Show business calendar and content calendar separately.
- Show dead-page/route rescue queue.
- Add clear sample/fallback labels.
- Keep owner-only data private.
- Add tests around static operating data.

Status: in progress.

### Phase 2: DB-Backed Business Calendar

Goal: Store internal business events and deadlines without relying on hardcoded data.

Suggested models:

- `BusinessCalendarEvent`
- `BusinessCalendarSource`
- `BusinessDeadline`
- `BusinessHubActionItem`

Rules:

- Default privacy: owner-only or internal.
- No public exports by default.
- No calendar writes.
- Store source and sync metadata.

### Phase 3: Google Calendar Read-Only Context

Goal: Bring calendar context into daily briefs and dashboard widgets safely.

Options:

- Use Codex connector for Fred daily briefs.
- Add manual calendar-event import.
- Add server-side read-only sync with explicit allowlisted calendars.
- Add full OAuth later only if needed.

Privacy rules:

- Do not send raw event descriptions to AI by default.
- Store minimal event metadata.
- Do not show private calendar details in public content or marketing outputs.
- Any calendar write requires explicit CEO approval.

### Phase 4: Replace Dead Pages With Real Workflows

Priority order:

1. Calendar and owner action view.
2. Dashboard persisted summaries.
3. Generator wired to Run Today.
4. Approval queue and status transitions.
5. Metrics/imports and insight pages.
6. Export pages.
7. Brand/campaign admin.

### Phase 5: Command Center Sync

Goal: Keep SiteSignalCo, Linear, Slack, Google Calendar, and SSWApp aligned.

Rules:

- Repo docs remain durable memory.
- Linear is execution board.
- Slack is intake.
- Google Calendar is private schedule context.
- SSWApp automations produce reviewable records only.

### Phase 6: AI Workflow Service Proof-Of-Work

Goal: Use the internal business hub as a safe example of what Signal Workshop can build for businesses.

Rules:

- The sample workshop and service model stay internal drafts until Fred and the CEO/Owner approve them.
- Seth researches market, competitor, pricing, and tool/vendor questions before public positioning.
- Ed drafts workflow maps through Jeff.
- Sara audits privacy, security, claims, and client-readiness before public use.
- Alvin implements public pages, forms, or app changes only after Fred approval.
- No private SSWApp data, raw dashboard rows, raw calendar content, or client-private material appears in demos.

## Acceptance Criteria For "Whole Site Functional"

The site is not "functional" until:

- Every visible route is DB-backed or truthfully labeled as manual/fallback.
- Private routes require owner access.
- Run Today persists records.
- Generator page creates real drafts.
- Calendar shows real business events or explicitly manual events.
- Metrics pages use persisted imports/snapshots.
- Approval actions persist and never auto-approve.
- Exports use persisted data and approved-only rules.
- Empty/error/loading states exist.
- Health endpoint reports safe booleans only.
- Tests, lint, typecheck, Prisma validate, and build pass.

## Safety Boundaries

- No auto-approval.
- No auto-publishing.
- No destructive auto-fix.
- No unapproved spending.
- No calendar writes unless explicitly approved.
- No raw private dashboard or calendar data sent to AI by default.
- Research stays advisory until Fred approves it.
- Business-impacting decisions route to the CEO/Owner.
- AI workflow service offers, sample workshops, pricing, public claims, and paid tools require Fred review and CEO/Owner approval.
