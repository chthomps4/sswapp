# Codex Task Delegation

Owner role: Jeff / Fred
Primary Linear issue: SIG-26
Approval gate: Fred approves routing and final integration.

## Purpose

Use Codex as a review-ready draft worker for repetitive coding, documentation, testing, research summarization, and tracker hygiene while keeping Fred in control of approval, merge, deployment, and business decisions.

## Task Template

```text
# Objective
{{Short task name}}

# Context
{{Why this task matters, links to Slack/Linear/repo docs, and relevant background}}

# Repository and files
{{Repository name and specific paths or modules}}

# Acceptance criteria
{{Specific conditions, checks, or behavior that define success}}

# Deliverable
{{Expected output: code, docs, tests, summary, Linear update, or handoff}}

# Safety boundaries
{{No auto-approval, no publishing, no deployment, no raw private data, no paid tool setup}}
```

## Delegation Strategy

1. Decide whether the work is research, workflow design, audit, implementation, local asset organization, or final integration.
2. Split large work into small subtasks when parallel work is useful.
3. Route role-specific work:
   - Fred: final integration, approvals, business-impacting escalation.
   - Jeff: automation, workflow routing, Codex/Slack/Linear coordination.
   - Seth: product research, market research, feasibility, tool/vendor review.
   - Ed: workflow maps and runbooks through Jeff.
   - Sara: audit, privacy, security, quality, release readiness.
   - Alvin: Fred-approved implementation.
   - Gary: local asset and local server organization through Fred.
4. Assign Codex only when the work can produce a review-ready draft or bounded implementation output.
5. Capture the result in Linear, repo docs, or a handoff before the chat context is lost.

## Codex Boundaries

- Codex may draft code, docs, tests, issue notes, summaries, checklists, and handoffs.
- Codex may not approve generated content, publish social content, merge, deploy, buy tools, configure paid services, or make final business decisions.
- Codex must report failures and the smallest safe next step.

## Reporting Format

- What was done.
- Who owns review.
- Files or Linear issues changed.
- Checks run or skipped.
- Outstanding blockers.
- Suggested next action.

## Acceptance Criteria

- Fred can see who owns each next step.
- Linear and repo docs agree on the task state.
- Codex output is explicitly review-ready, not approved.
- No live Slack, Linear, GitHub, Vercel, Chrome, or OpenAI bridge is configured without approval.
