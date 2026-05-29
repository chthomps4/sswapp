# Slack Command Intake Sweep

Owner role: Jeff / Fred
Cadence: Weekday morning manual run after meaningful `#command` activity.
Primary Linear issue: SIG-21
Approval gate: Fred decides what becomes official work.

## Purpose

Turn Slack `#command` notes into review-ready routing recommendations without treating Slack as the durable source of truth.

## Inputs

- Slack `#command` thread or copied message summary.
- `docs/slack-command-intake-log.md`
- `docs/handoffs/inbox/`
- `docs/chat-handoff-log.md`
- `docs/task-queue.md`
- `docs/fred-brief.md`
- `docs/project-registry.md`
- Linear command-center issues, especially SIG-21 and SIG-26.

## Required Intake Format

```text
!task
Task name:
Context:
Repository/files:
Acceptance criteria:
Deliverable:
Suggested assignees:
Deadline/check-in:
Risks or approvals needed:
```

## Routing Rules

- Fred reviews every task before it becomes implementation work.
- Jeff owns automation, workflow, handoff mechanics, and Codex routing.
- Ed designs workflow steps through Jeff.
- Seth handles research, product opportunity, tool/vendor, and market questions.
- Sara audits privacy, security, quality, release, and workspace efficiency risks.
- Alvin implements only Fred-approved scoped work.
- Gary handles local asset, local server, and local file organization through Fred.
- Codex outputs are review-ready drafts only.

## Safety Rules

- Do not treat Slack as durable memory.
- Do not close, approve, schedule, publish, merge, deploy, or mark Linear issues done from Slack intake alone.
- Do not assign production implementation directly to Alvin without Fred approval.
- Do not send raw private Slack, dashboard, calendar, or client data to AI providers.
- Do not configure paid tools or live bridges without Fred and CEO/Owner approval.

## Output

- Slack command summary.
- Recommended Linear issue updates or new issue candidates.
- Recommended repo handoffs.
- CEO action candidates.
- Seth research candidates.
- Sara audit candidates.
- Jeff/Ed workflow candidates.
- Alvin implementation candidates routed to Fred.
- Smallest safe next step for any failed or unclear workflow.

## Acceptance Criteria

- Every recommendation includes source, owner role, confidence, approval gate, and next action.
- Official work is captured in Linear or repo docs before execution.
- Business-impacting work is marked for Fred to route to the CEO/Owner.
- No item becomes approved, published, merged, deployed, or scheduled automatically.
