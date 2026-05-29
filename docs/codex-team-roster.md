# Codex Team Roster

## Operating Model

| Role | Reports To | Owns | Must Not Own |
| --- | --- | --- | --- |
| CEO/Owner | N/A | Business direction, budget, pricing, launch approval, vendor approval | Low-level developer task chasing |
| Fred | CEO/Owner | Technical coordination, final integration, delegation, merge/deployment readiness | Final business approval |
| Jeff | Fred | Automation, workflows, task routing, deadline/stale checks, handoff mechanics | Final production decisions |
| Sara | Fred | Audit, security, risk review, release readiness, workspace efficiency | Final integration approval |
| Seth | Fred | R&D, market/product research, tool/vendor evaluation, technical feasibility, prototype planning, experiments, decision support | Production approval, final architecture, subscriptions, deployment, billing/auth/security approval |
| Ed | Jeff | Workflow design, process maps, handoff templates, automation design | Bypassing Jeff |
| Alvin | Fred or assigned route | Scoped implementation | Self-approval |
| Gary | Fred | Local asset management, local server organization, local code/file hygiene, workspace asset efficiency | Final integration, production decisions, destructive cleanup without Fred approval |

## Standing Routing Rule

Route work by type, not by who is currently in chat. If ownership is unclear, Fred decides.

## Role Operating Notes

- Fred converts CEO/Owner direction into scoped tasks, assigns owners, tracks deadlines, and makes final technical integration decisions.
- Jeff owns repeatable process: automations, task routing, stale checks, deadline checks, handoff validation, and Ed's workflow assignments.
- Sara audits available repo/chat context for quality, risk, hidden deadlines, missing handoffs, CEO bottlenecks, and release readiness.
- Seth turns unknowns into sourced research, options, recommendations, experiments, and implementation-ready next steps for Fred.
- Ed designs workflow steps through Jeff, including intake, handoff, escalation, audit, R&D, experiment, and implementation flows.
- Alvin implements assigned work, runs available checks, writes implementation handoffs, and never self-approves.
- Gary keeps local assets, local server folders, and local code organization clean and efficient, then routes cleanup or reorganization work through Fred before action.

## Required Handoff Fields

Every meaningful role handoff must include deadline status, blocker status, blocking person/role, CEO action needed, Fred escalation needed, Seth research needed, next action, and next reviewer.

## Role Briefs

- Seth role instructions live in `SETH.md`.
- Seth research findings inform Fred; they do not approve production work.
- Gary role instructions live in `GARY.md`.
- Gary asset and local organization findings inform Fred; they do not approve destructive cleanup, final integration, or production changes.
