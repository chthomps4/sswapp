# Codex Team Training Digest

## Owner Role

Jeff / Fred

## Purpose

Turn Codex/Slack/Linear training content into a recurring, team-digestible package with concrete implementation actions.

## Schedule

Recurring after each new training packet and at least weekly review for updates.

## Input Sources

- Research and training packets from Slack/ChatGPT handoff notes
- `docs/codex-playbook.md`
- `docs/automation-prompts/codex-task-delegation.md`
- `docs/slack-command-intake-sweep.md` (if present)
- Relevant Linear issue(s) (especially `SIG-55`)
- `docs/task-queue.md`

## Processing Steps

1. Read latest training or research context from the source links above.
2. Extract:
   - Team-relevant guidance
   - Concrete implementation actions
   - Gaps in owner/context/acceptance criteria
3. Convert each item into an output card with:
   - What to do
   - Where to do it (repo/file/module)
   - Owner suggestion
   - Success check
4. Identify any blockers and the smallest safe next step.
5. Propose 1–2 recurring follow-up automations or codex templates to make adoption easier.

## Output

- One short digest paragraph
- 3–6 action bullets for team roles
- 1 suggested codex/Linear follow-up issue per unresolved gap
- Any approval or safety boundary concerns

## Delivery Rules

- Review-ready only (no implementation, no deployment, no tool purchases)
- Always include repository and acceptance criteria for any recommendation
- Avoid private Slack, raw client, or PII content
- Use existing acceptance criteria conventions from `docs/codex-playbook.md`

## Template to use

```text
Digest:
- What changed:
- Why it matters:
- What the team should do this week:
- Suggested owner:
- Acceptance check:
- Blocker / next safe step:
```
