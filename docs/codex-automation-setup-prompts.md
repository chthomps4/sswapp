# Codex Automation Setup Prompts

Use these prompts in Codex automations for SSWApp. They are designed to avoid overlapping code changes: recurring automations should operate the app workflows, summarize outputs, and suggest backlog items. They should not modify source code unless a separate human-approved implementation task is created.

## Shared Rules For Every Codex Automation

Add this block to every automation prompt:

```text
Rules:
- Work inside the SSWApp repository only.
- Do not create overlapping code changes.
- Do not edit source code, schema, tests, docs, or prompts unless this automation explicitly asks for a documentation-only note.
- Do not auto-publish social content.
- Do not auto-approve generated content.
- Treat all generated posts, image prompts, reports, and recommendations as review-ready drafts.
- Use SSWApp automation recipes, prompt library, exports, and APIs before inventing a new workflow.
- Use sanitized performance context only. Do not send raw imported dashboard rows to AI providers.
- If a workflow fails, report the failure and the smallest safe next step.
- End with a short summary of generated items, review actions, and suggested follow-ups.
```

## Automation 1: Daily Run Today

Suggested schedule: Tuesday through Saturday morning.

Prompt:

```text
Run the SSWApp daily content operation for today.

Use the Run Today recipe and prompt library already implemented in the app.

Inputs:
- Date: today
- Strategic priority: Create useful daily visibility for the Signal Workshop umbrella without creating extra operations burden.
- Daily theme: choose one if none is already provided by current campaign/performance context.
- Include image prompts: true
- Include carousel outlines: true
- Include Google Business Profile posts for local/service brands: true
- Include Reddit: false unless there is a strong discussion-first angle
- Include short video ideas: true
- Include sanitized performance context: true

Brands to consider:
- Signal Workshop
- Business Signal Workshop
- Local Signal Websites
- SiteSignal
- Parallax Hearts
- AL Brothers LLC

Use the app boundaries:
- Prefer /api/automations/run-today or the run-today recipe.
- Keep all generated posts in needs_review.
- Keep approvals pending.
- Do not publish or schedule anything.

Output:
- Content pack title and theme
- Brands/platforms selected and why
- Number of post drafts created
- Number of image prompts created
- Number of approval records created
- Review checklist
- One thing to watch after manual posting
- Tomorrow's suggested theme

Shared rules apply.
```

## Automation 2: Monday Weekly Content Intelligence

Suggested schedule: Monday morning.

Prompt:

```text
Create the weekly content intelligence brief for SSWApp.

Use the weekly-research-brief prompt template and existing brand/campaign context. If no fresh Deep Research output is available, create a practical internal brief from current brand priorities, campaigns, and sanitized performance context.

Focus:
- What each brand should talk about this week
- Which offers need clearer support
- Which platforms deserve more attention
- Which topics should be avoided because they are generic, repetitive, or unsupported
- What should feed the Daily Run Today automation tomorrow

Do not generate a full week of approved posts.
Do not edit app code.
Do not publish anything.

Output:
- Weekly executive summary
- Top 10 audience/content signals
- Recommended weekly campaign focus
- 7-day theme plan
- Best platforms by brand
- Risks to avoid
- Specific instructions for the next Run Today automation

Shared rules apply.
```

## Automation 3: Sunday Social Dashboard Analysis

Suggested schedule: Sunday afternoon or evening.

Prompt:

```text
Run SSWApp weekly social dashboard analysis.

Use normalized metrics and sanitized summaries from the private social dashboard data processing engine. Prefer the weekly-social-analysis recipe and rule-based insight engine. Only use AI metric analysis if ENABLE_AI_METRIC_ANALYSIS is explicitly true, and even then use sanitized aggregate context only.

Analyze:
- Best posts
- Weakest posts
- Best platforms
- Best content pillars
- Best hooks
- Best CTAs
- Best image types
- Posts that created leads, DMs, quote requests, registrations, or support actions
- Content to repeat, revise, stop, or repurpose

Create or summarize saved SocialPerformanceInsight records where the workflow supports it.

Do not expose raw dashboard rows.
Do not edit source code.
Do not auto-create approved content.

Output:
- Weekly performance summary
- Top wins
- Weak spots
- Recommended repeats
- Recommended revisions
- Stop/reduce list
- Prompt-safe context for next week's Daily Run Today workflow

Shared rules apply.
```

## Automation 4: Performance Context Refresh

Suggested schedule: Monday after Weekly Content Intelligence, or after new metrics import.

Prompt:

```text
Refresh SSWApp prompt-safe performance context.

Use the performance-context-refresh recipe and performance-context-for-generation prompt. Convert accepted insights, winning patterns, weak patterns, and content gaps into short guidance that future content generation can safely use.

Do not include raw imported rows.
Do not include personally identifiable information.
Do not edit source code.

Output:
- Summary for future prompts
- Do more of
- Do less of
- Test next
- Recommended pillars
- Recommended image types
- Recommended CTAs
- Notes for Run Today

Shared rules apply.
```

## Automation 5: Approved Export Prep

Suggested schedule: After manual approval window, or run manually.

Prompt:

```text
Prepare approved-only exports from SSWApp.

Use the app's export workflows:
- Review Markdown for the selected content pack
- Scheduler CSV for approved posts only
- Image Prompt JSON
- Asset Manifest JSON

Do not approve posts.
Do not publish posts.
Do not include drafts in scheduler CSV.
If no posts are approved, say that clearly and provide the review queue summary instead.

Output:
- Export files/routes used
- Number of approved posts exported
- Drafts still waiting for review
- Image prompts still waiting for review
- Any missing alt text, filename, CTA, or approval issue

Shared rules apply.
```

## Automation 6: Prompt Quality Review

Suggested schedule: Weekly, after several Run Today packs have been generated.

Prompt:

```text
Review recent SSWApp generated content quality.

Use the prompt-quality-check template conceptually and inspect recent/generated sample content packs where available. Look for patterns that should become prompt improvement notes.

Check:
- Generic wording
- Weak hooks
- Weak CTAs
- Platform mismatch
- Missing local angle
- Missing proof-of-work
- Parallax Hearts sounding too promotional
- AL Brothers needing stronger jobsite/proof language
- Image prompts that are too abstract
- Accessibility or alt text gaps

Do not edit prompt files automatically.
Do not edit source code.
Record suggested prompt improvement notes in the response for human review.

Output:
- Quality score summary
- Top recurring issues
- Prompt improvement notes by prompt key
- Suggested rewrites to test next
- Any content that should be revised before posting

Shared rules apply.
```

## Automation 7: Repurpose Winning Post

Suggested schedule: Manual after Weekly Social Dashboard Analysis identifies winners.

Prompt:

```text
Create a SSWApp repurpose plan for the strongest recent post.

Use the repurpose-winning-post recipe and repurpose-plan prompt. Choose the source from the latest saved social performance insights or the best available sanitized performance summary.

Target platforms:
- Facebook
- Instagram carousel
- LinkedIn
- X thread
- Newsletter section
- Google Business Profile if local/service relevant

Do not duplicate the original copy.
Do not approve or publish anything.

Output:
- Source post and reason for repurposing
- Platform-native follow-up ideas
- Draft hooks
- Image concepts/prompts
- Suggested content theme records
- Review notes

Shared rules apply.
```

## Automation 8: Campaign Plan Generator

Suggested schedule: Manual before a launch, workshop, service push, or creative release.

Prompt:

```text
Generate a SSWApp draft campaign plan.

Use the campaign-plan recipe and campaign-plan prompt. Keep the campaign as a draft plan until human approval.

Inputs to infer from current context if not provided:
- Brand
- Offer
- Campaign goal
- Start date
- End date
- Target platforms
- Constraints
- Sanitized performance context

Do not activate the campaign.
Do not generate approved posts.
Do not edit source code.

Output:
- Campaign name and slug
- Objective
- Audience
- Primary CTA and secondary CTA
- Core message
- Campaign phases
- Sample post angles
- Metrics to watch
- Risks to avoid
- Approval notes

Shared rules apply.
```

## Automation 9: Monthly Content Map

Suggested schedule: Last weekday of each month.

Prompt:

```text
Generate the next month's SSWApp content map.

Use the monthly-content-map recipe and prompt. The output should be a planned content rhythm, not 30 days of approved posts.

Balance:
- Signal Workshop umbrella visibility
- Business Signal Workshop authority
- Local Signal Websites service content
- SiteSignal audit education
- Parallax Hearts creative world continuity
- AL Brothers local proof and service-area trust

Do not force every brand to post every day.
Do not approve, schedule, or publish anything.

Output:
- Monthly theme
- Weekly themes
- Planned calendar items
- Priority brands by week
- Campaign support notes
- Content balance notes
- Metrics to watch
- Risks to avoid

Shared rules apply.
```

## Automation 10: Site Audit To Content

Suggested schedule: Manual after a SiteSignal audit or website review.

Prompt:

```text
Turn sanitized SiteSignal or website audit findings into public-safe content.

Use the site-audit-to-content recipe and prompt. The content should teach a general lesson without exposing private client details or shaming a site.

Good target brands:
- SiteSignal
- Signal Workshop
- Local Signal Websites

Do not include raw private audit findings.
Do not name a client unless explicitly approved in the input.
Do not approve or publish anything.

Output:
- Educational angle
- Platform-native draft
- CTA
- Image concept
- Image prompt
- Alt text
- Privacy notes
- Approval notes

Shared rules apply.
```

## Automation 11: Deep Research Intake

Suggested schedule: Manual when a new Deep Research result is ready.

Prompt:

```text
Process a new Deep Research brief for SSWApp.

Read the pasted or available research output and convert it into app-ready internal context. Do not overwrite code or prompts.

Extract:
- Audience signals
- Objections
- Content opportunities
- Offer angles
- Visual themes
- Reddit/community discussion ideas
- LinkedIn authority angles
- Instagram carousel ideas
- Facebook conversation ideas
- Instructions for the next Run Today workflow

Output:
- Clean summary
- ContentTheme suggestions
- Campaign suggestions
- Prompt-safe notes for daily generation
- Any risks or unsupported claims to avoid

Shared rules apply.
```

## Automation 12: Team Training Digest

Suggested schedule: Weekly after any major training packet or every Monday.

Prompt:

```text
Run the Codex team training digest.

Use these rules:
- Distill one focused training theme from the latest docs or issue context.
- Keep everything review-safe and actionable.
- Include repository and file/module targets for each recommendation.
- Include a clear owner and acceptance criterion for every task.

Inputs:
- Linear issue `SIG-55` and any active training-related comments
- `docs/codex-playbook.md`
- `docs/automation-prompts/codex-task-delegation.md`
- `docs/automation-prompts/codex-team-training-digest.md`
- `docs/task-queue.md`

Output:
- One short digest summary
- 4 implementation-ready actions
- For each action: owner, repo/files, expected behavior, acceptance criterion
- Any blockers, missing inputs, or approval boundaries

Safety rules:
- Do not purchase tools or subscribe services.
- Do not make production changes.
- Do not auto-approve or auto-assign final execution.
- Flag any ambiguity as "blocked: needs clarification."

Shared rules apply.
```

## Recommended First Automation Set

Start with:

1. Daily Run Today
2. Monday Weekly Content Intelligence
3. Sunday Social Dashboard Analysis
4. Performance Context Refresh
5. Prompt Quality Review

Add the campaign/monthly/site-audit automations after the first week of real generated packs and imported metrics.
12. Use Codex Team Training Digest when you need to keep the team aligned and implementation-ready after training sessions.
