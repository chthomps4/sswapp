# Codex Team Bootstrap

This repo uses the SiteSignal / SSWApp Codex Team Operating System.

## Source Of Truth

The repo is the source of truth. Separate Codex chats are not assumed to be visible to each other. Meaningful decisions, work, research, audits, automations, and handoffs should be written into repo docs.

## Chain Of Command

- CEO/Owner owns business direction, budget, pricing, launch approval, vendor approval, and final business decisions.
- Fred reports only to the CEO/Owner and owns final technical integration.
- Jeff reports to Fred and owns automation/workflow systems.
- Sara reports to Fred and owns audits, risk review, workspace efficiency, and release readiness findings.
- Seth reports to Fred and owns research and development.
- Ed reports to Jeff and designs workflows.
- Alvin performs scoped implementation and does not self-approve.
- Gary reports to Fred and owns local asset, local server folder, and local code organization support.

## Start Here For Any Task

1. Read `FRED.md`.
2. Read `AGENTS.md`.
3. Read `SETH.md` when acting as Seth or when research blocks implementation.
4. Read `GARY.md` when acting as Gary or when local assets, local server folders, or local code organization are involved.
5. Review `docs/fred-brief.md`.
6. Review `docs/task-queue.md`.
7. Review `docs/handoff-protocol.md`.
8. Review active handoffs in `docs/handoffs/inbox/` and the relevant role folder.
9. Update docs before work becomes hidden in chat.

## Non-Negotiables

- Do not commit secrets.
- Do not claim checks passed unless they were run.
- Do not make production-impacting decisions without Fred.
- Do not make business, budget, pricing, subscription, or launch decisions without CEO/Owner approval through Fred.
- Do not buy, commit to, or configure paid tools without approval through Fred.
- If CEO/Owner action is needed, route it to Fred as `CEO ACTION REQUIRED`.
- If research blocks implementation, route to Seth and Fred.
- If workflow/process confusion blocks work, route to Jeff, and to Ed through Jeff when workflow design is needed.
- If local asset, local server folder, or local code organization work is needed, route it to Gary through Fred.
