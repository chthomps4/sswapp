# Fred Brief

## Current Priorities

| Priority | Project | Owner | Status | Deadline Status | Blocker | Next Action |
| --- | --- | --- | --- | --- | --- | --- |
| Critical | SSWApp private dashboard auth recovery | Fred | in_progress | due_today | Clerk session loop on `sitesignal.company` | Ship Clerk route/env hotfix, verify owner login, then re-check mobile dashboard |
| Critical | Sara full Codex audit report | Fred | ready_for_fred | due_today | pending Fred review | Review Sara report in Linear `SIG-56`, then decide release sequencing and whether auth ships separately |
| High | SSWApp Codex Team Operating System | Fred | ready_for_review | not_scheduled | none | Review role README hardening handoff and decide whether Sara audit is needed |
| High | Seth R&D role activation | Seth | ready_for_fred | not_scheduled | none | Fred review of `SETH.md` and Seth handoff |
| High | Chad R&D research packet decision | Fred | ready_for_fred | due_soon | none | Review Linear `SIG-30` and decide whether Seth should brief, route, attach, or park the research |
| High | SiteSignal multi-domain tier architecture | Seth then Jeff/Ed | parked | not_scheduled | waiting on Seth research prompts | Receive Seth prompts, then route automation design to Jeff |
| High | Gary Local Asset Manager role notice | Jeff | ready_for_fred | due_soon | none | Review Linear `SIG-36`, accept Gary's local asset/code organization lane, and decide whether to send Fred's memo draft |
| High | Gary local repository and asset centralization | Gary | ready_for_fred | due_soon | none | Review Linear `SIG-37`, `C:\signal_workshop\signal-workshop-report.txt`, and decide whether Sara audit is needed |
| High | Slack + Linear + Codex delegation system | Jeff | ready_for_fred | due_soon | none | Review SIG-21, SIG-26, and Jeff's handoff; decide whether to pilot manually |
| High | AI workflow setup service and sample workshop | Fred / Seth / Jeff | draft | due_soon | pending Fred/CEO approval before public use | Review SIG-20 and decide whether Seth researches the opportunity and Ed drafts the workshop workflow |
| High | Rachel Fred assistant coverage | Rachel (for Fred) | in_progress | due_soon | none | Keep routing deterministic while Fred is busy, then hand back all meaningful tasks through handoff log and task queue discipline |

## Deadline Dashboard

- Due today: Dashboard auth recovery must stabilize `sitesignal.company` before deeper dashboard buildout resumes.
- Due today: Sara full Codex audit report needs Fred review before treating the current combined worktree as release-ready.
- Due soon: `SIG-30` Fred decision on Chad/Seth R&D research packet is due 2026-05-29.
- Due soon: Gary Local Asset Manager role notice is ready for Fred review on 2026-05-29.
- Due soon: Gary local repository and asset centralization in `SIG-37` is ready for Fred review on 2026-05-29.
- Due soon: Slack + Linear + Codex delegation system is ready for Fred review on 2026-05-29.
- Due soon: AI workflow setup service/sample workshop draft needs Fred routing before Seth/Ed/Sara work begins.
- Due soon: Rachel assistant relay begins on 2026-05-29. All routed items must have blocker/deadline fields, explicit next action, and handoff link; labels `manual-first`, `no-auto-approval`, `fred-review` must be applied to SIG-55 child routing.
- At risk: SiteSignal domain-tier work if Seth research does not return before implementation planning resumes.
- Overdue: none documented.
- Blocked by CEO/Owner: none documented.
- Blocked by Seth: SiteSignal domain-tier research prompts.

## CEO ACTION REQUIRED

- AI workflow setup service, sample workshop, pricing, public claims, paid tools, or live integration setup require CEO/Owner approval through Fred before launch or commitment.

## Fred Action Required

- Stabilize Clerk login on `sitesignal.company`; owner emails are `chthomps84@gmail.com` and `chad@lswdesigns.studio`.
- Review Sara's full Codex audit report and decide whether to split auth hotfix, workflow audit, team docs, and Gary/local docs into separate release lanes.
- Keep the dashboard recovery order fixed: auth first, mobile usability second, calendar read-only lane third, then Run Today/approvals/imports/exports.
- Treat Slack `#command` as intake, Linear as execution, and repo docs as the durable source of truth.
- Review the v3 Codex Team Operating System docs and role README hardening handoff.
- Review Seth role activation handoff and accept `SETH.md` as the source-of-truth Seth operating brief.
- Review Chad's Seth R&D research packet notification in Linear `SIG-30` and decide whether Seth should produce a full R&D brief, route vendor evaluation to `SIG-17`, attach it to `SIG-22`/`SIG-25`, or park it.
- Review Gary's Local Asset Manager role lane in Linear `SIG-36`, note that the CEO/Owner already looped Jeff in, and decide whether to send Fred's memo draft before Gary cleanup work starts.
- Review Gary's local asset centralization handoff and Linear `SIG-37`; decide whether Sara should audit the new `C:\signal_workshop` root for workspace efficiency.
- Review Slack + Linear + Codex delegation handoff and decide whether to pilot the manual-first `#command` intake workflow.
- Review the AI workflow setup service/sample workshop draft and decide whether Seth should research market/pricing and Ed should refine the workshop workflow through Jeff.
- Stand up Rachel lead coverage for Fred: use `SSW-TASK-0011`, keep all meaningful tasks explicit on Linear docs handoff logs, and require routing notes to include mandatory metadata.
- Decide whether to ask Sara for a workspace efficiency audit after install.
- Keep SiteSignal domain-tier work parked until Seth research is available.
