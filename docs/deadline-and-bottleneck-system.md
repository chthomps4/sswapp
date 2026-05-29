# Deadline And Bottleneck System

## Required Fields

Every active task and meaningful handoff must include:

- Due date.
- Check-in date.
- Review due date.
- Deadline status.
- Blocker status.
- Blocking person/role.
- Next action.
- CEO action needed: yes/no.
- Fred escalation needed: yes/no.

## Deadline Statuses

`not_scheduled`, `on_track`, `due_soon`, `at_risk`, `overdue`, `blocked`, `blocked_by_ceo`, `waiting_on_review`, `complete`

## Escalation Rules

- At-risk work should be escalated before it becomes overdue.
- Overdue work is escalated to Fred.
- CEO-action-needed work is routed to Fred immediately as `CEO ACTION REQUIRED`.
- Missing Seth research on a blocking implementation task is routed to Seth and Fred.
- Missing workflow design is routed to Jeff for Ed.

## CEO Bottleneck Definition

The CEO/Owner is the bottleneck when progress requires a business decision, launch approval, pricing/package approval, budget approval, subscription/vendor approval, domain/DNS/account access, or brand/legal/policy direction.
