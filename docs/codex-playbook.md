# Codex Playbook

This playbook stores repeatable patterns for using Codex in Signal Workshop work without losing context or bypassing review.

## Operating Rules

- Read `CODEX_TEAM_BOOTSTRAP.md` before meaningful work.
- Keep repo docs and Linear aligned.
- Prefer existing SSWApp recipes, prompts, exports, and APIs before inventing a workflow.
- Treat generated posts, image prompts, reports, recommendations, and code as review-ready drafts.
- Never auto-approve, auto-publish, merge, deploy, buy tools, or configure paid services without approval.
- Use sanitized aggregate context only when AI is involved.

## Good Codex Task Shape

```text
Task:
Context:
Repo/files:
Acceptance:
Deliverable:
Owner/reviewer:
Safety boundaries:
```

## Useful Patterns

| Pattern | Use When | Required Output |
| --- | --- | --- |
| Docs-only operating note | A workflow, role, handoff, or tracker rule needs to become durable | Updated docs, handoff, task queue, and Linear note |
| Review-ready implementation | Fred approved a scoped code change | Code diff, tests/checks, handoff, and Fred/Sara review path |
| Research handoff | A decision depends on market, tool, vendor, or feasibility research | Seth brief, options, recommendation, confidence, risks |
| Workflow design | A repeatable process needs a runbook or review gate | Ed design through Jeff, automation map update, Fred review |
| Audit sweep | Privacy, security, quality, workspace, or release risk exists | Sara findings, severity, affected area, smallest safe next step |
| Team training rollout | Codex workflows and prompt patterns need consistent team adoption | Training handoff, templates, acceptance criteria, ownership matrix |

## Lessons Logged

| Date | Source | Lesson | Follow-Up |
| --- | --- | --- | --- |
| 2026-05-29 | Slack + Linear + Codex delegation setup | Manual-first intake avoids accidental approvals while still making Slack useful as a command lane. | Pilot with copied `#command` summaries before enabling any live bridge |
| 2026-05-29 | Codex training packet from Chad | Teams adopt Codex better when prompts include goal, repo, path/module, and acceptance upfront. | Codex training digest prompt pack + weekly digest output now added for rollout |

## Prompt Improvement Notes

- Ask Codex for concrete owner, approval gate, and next action on every delegated task.
- Ask Codex to state skipped checks when work is docs-only.
- Ask Codex to report the smallest safe next step when a workflow fails.
- Add this rule to training prompts: "If acceptance criteria are missing, return a blocking item and request one clarifying line from the requestor."
