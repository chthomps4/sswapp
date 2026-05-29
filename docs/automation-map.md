# Automation Map

Jeff owns this file.

## Automation Ownership

| Automation / Workflow | Owner | Frequency / Trigger | Purpose | Risk Level | Status | Next Action |
| --- | --- | --- | --- | --- | --- | --- |
| SSWApp approved export prep | Jeff | Tue-Sat 12:30 | Prepare approved-only exports without publishing | Medium | Active | Keep scheduler exports approved-only |
| SSWApp daily run today | Jeff | Daily | Generate/review daily operating context | Medium | Active | Monitor output and handoff quality |
| SSWApp Monday performance context refresh | Jeff | Weekly | Refresh performance context for planning | Medium | Active | Ensure sanitized metrics only |
| SSWApp Monday weekly content intelligence | Jeff | Weekly | Create weekly content intelligence | Medium | Active | Keep research/approval boundaries |
| SSWApp Sunday social dashboard analysis | Jeff | Weekly | Analyze social dashboard context | Medium | Active | Ensure raw dashboard rows stay private |
| SiteSignal production health monitor | Jeff | Hourly | Monitor SaaS production health | High | Active | Continue no-deploy/no-secret rules |
| SiteSignal domain-tier architecture | Jeff with Ed, pending Seth | On demand after Seth research | Convert domain-tier workflow into implementation automation | High | Parked | Wait for Seth prompts |
| Slack command intake sweep | Jeff / Fred | Weekday manual after `#command` updates | Convert Slack intake into Linear/repo routing recommendations | Medium | Manual-first | Use SIG-21 and `docs/automation-prompts/slack-command-intake-sweep.md` |
| Codex task delegation review | Jeff / Fred | On demand when Fred delegates work | Split tasks, route roles, and keep Codex outputs review-ready | Medium | Manual-first | Use SIG-26 and `docs/automation-prompts/codex-task-delegation.md` |
| Codex team training digest | Jeff / Seth | Weekly + after training packets | Keep team aligned on Codex prompting, Slack intake, and Linear execution standards | Medium | Active | Follow SIG-55 and `docs/automation-prompts/codex-team-training-digest.md` |
| AI workflow service proof-of-work refresh | Jeff with Seth, Ed, Sara | Manual before Fred/CEO review | Keep the internal business hub usable as a safe sample of client AI workflow setup | Medium | Draft | Keep offer and workshop materials internal until approved |

## Jeff Checks

- Missing handoffs.
- Missing due dates/check-ins/review dates.
- Overdue or at-risk tasks.
- CEO-action-needed items not routed to Fred.
- Repeated manual steps that should become scripts or recurring Codex automations.
- Unsafe automations touching billing, auth, database, deployment, or secrets without Fred approval.
- Live Slack, Linear, GitHub, Vercel, Chrome, or OpenAI bridges proposed before manual workflow outputs are accepted.
