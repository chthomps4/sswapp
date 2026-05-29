export type BusinessHubSource = "manual" | "google_calendar" | "linear" | "slack" | "sswapp" | "repo";

export type BusinessHubPrivacy = "owner_only" | "internal" | "public_safe";

export type BusinessHubEventStatus = "confirmed" | "tentative" | "needs_review";

export type BusinessHubEventCategory =
  | "command_center"
  | "calendar"
  | "automation"
  | "content"
  | "audit"
  | "research"
  | "implementation";

export type BusinessHubEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: BusinessHubEventCategory;
  source: BusinessHubSource;
  status: BusinessHubEventStatus;
  privacy: BusinessHubPrivacy;
  owner: string;
  description: string;
  nextAction: string;
  relatedIssue?: string;
};

export type BusinessHubRouteStatus =
  | "db_backed"
  | "sample_fallback"
  | "placeholder"
  | "needs_integration"
  | "needs_review";

export type BusinessHubRouteAuditItem = {
  route: string;
  label: string;
  status: BusinessHubRouteStatus;
  priority: "P0" | "P1" | "P2" | "P3";
  owner: "Fred" | "Jeff" | "Sara" | "Seth" | "Ed" | "Alvin";
  problem: string;
  nextAction: string;
  relatedIssue?: string;
};

export const businessHubEvents: BusinessHubEvent[] = [
  {
    id: "fred-eod-ceo-brief-2026-05-29",
    title: "Fred EOD CEO Brief",
    date: "2026-05-29",
    startTime: "16:30",
    endTime: "17:00",
    category: "command_center",
    source: "linear",
    status: "needs_review",
    privacy: "internal",
    owner: "Fred",
    description: "Summarize what is live, what is blocked, and what needs CEO approval.",
    nextAction: "Review SIG-23 through SIG-29 and publish a concise CEO brief.",
    relatedIssue: "SIG-23",
  },
  {
    id: "business-hub-calendar-boundaries-2026-05-29",
    title: "Confirm Calendar Boundaries",
    date: "2026-05-29",
    startTime: "15:00",
    endTime: "15:30",
    category: "calendar",
    source: "google_calendar",
    status: "needs_review",
    privacy: "owner_only",
    owner: "CEO/Fred",
    description: "Decide which calendars can be used as private operating context for the hub.",
    nextAction: "CEO confirms primary-only versus broader calendar access in SIG-29.",
    relatedIssue: "SIG-29",
  },
  {
    id: "daily-slack-command-intake-2026-05-29",
    title: "Slack #command Intake Sweep",
    date: "2026-05-29",
    startTime: "09:00",
    endTime: "09:20",
    category: "automation",
    source: "slack",
    status: "tentative",
    privacy: "internal",
    owner: "Jeff",
    description: "Capture command-channel updates into Linear or repo handoffs.",
    nextAction: "Keep Slack as intake until Fred approves durable source-of-truth rules.",
    relatedIssue: "SIG-21",
  },
  {
    id: "daily-signal-intelligence-2026-05-29",
    title: "Daily Signal Intelligence Sweep",
    date: "2026-05-29",
    startTime: "08:30",
    endTime: "09:00",
    category: "research",
    source: "repo",
    status: "tentative",
    privacy: "internal",
    owner: "Seth",
    description: "Find useful site, app, automation, and product signals for Fred review.",
    nextAction: "Run manually first; schedule only after Fred accepts the first output.",
    relatedIssue: "SIG-19",
  },
  {
    id: "weekly-workflow-gap-audit-2026-06-01",
    title: "Weekly Workflow Gap Audit",
    date: "2026-06-01",
    startTime: "10:30",
    endTime: "11:00",
    category: "audit",
    source: "sswapp",
    status: "confirmed",
    privacy: "internal",
    owner: "Sara/Fred",
    description: "Review failed automation chains, stale approvals, missing metrics, and workflow drift.",
    nextAction: "Enable cron only after CRON_SECRET and production flags are confirmed.",
  },
];

export const businessHubRouteAudit: BusinessHubRouteAuditItem[] = [
  {
    route: "/",
    label: "Dashboard",
    status: "sample_fallback",
    priority: "P1",
    owner: "Fred",
    problem: "The home dashboard still leans on seed/sample data for several widgets.",
    nextAction: "Replace dashboard widgets with persisted DB summaries and explicit missing-env states.",
    relatedIssue: "SIG-23",
  },
  {
    route: "/calendar",
    label: "Business and Content Calendar",
    status: "needs_integration",
    priority: "P1",
    owner: "Alvin",
    problem: "The route showed content drafts only; it did not represent business calendar context.",
    nextAction: "Show business calendar operating events now, then add DB-backed read-only Google Calendar sync after Fred approval.",
    relatedIssue: "SIG-28",
  },
  {
    route: "/generator",
    label: "Generator",
    status: "placeholder",
    priority: "P1",
    owner: "Alvin",
    problem: "The visible form needs to be wired into the Run Today/content-generation API path.",
    nextAction: "Connect the form to persisted automation runs and route to the generated pack detail.",
    relatedIssue: "SIG-28",
  },
  {
    route: "/metrics",
    label: "Metrics",
    status: "sample_fallback",
    priority: "P1",
    owner: "Sara",
    problem: "The page can show sample pack metrics instead of persisted social import/rollup data.",
    nextAction: "Move the page to SocialMetricSnapshot, SocialPerformanceInsight, and import-confirm records.",
    relatedIssue: "SIG-24",
  },
  {
    route: "/brands",
    label: "Brands",
    status: "sample_fallback",
    priority: "P2",
    owner: "Alvin",
    problem: "Brand configuration visibility is not yet a true admin surface.",
    nextAction: "Render persisted brand/platform/pillar configs and defer editing until owner checks are complete.",
  },
  {
    route: "/social/posts/[id]",
    label: "Social Post Detail",
    status: "needs_review",
    priority: "P2",
    owner: "Sara",
    problem: "Detail routes need a full pass for persisted reads, auth, empty states, and export readiness.",
    nextAction: "Audit route-level owner checks and DB-backed behavior before marking ready.",
    relatedIssue: "SIG-24",
  },
];

export function getUpcomingBusinessHubEvents(limit = 6, fromDate = "2026-05-29") {
  return businessHubEvents
    .filter((event) => event.date >= fromDate)
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
    .slice(0, limit);
}

export function getBusinessHubRouteAuditSummary() {
  return businessHubRouteAudit.reduce<Record<BusinessHubRouteStatus, number>>(
    (summary, item) => {
      summary[item.status] += 1;
      return summary;
    },
    {
      db_backed: 0,
      sample_fallback: 0,
      placeholder: 0,
      needs_integration: 0,
      needs_review: 0,
    },
  );
}

export function getOwnerActionItems() {
  return [
    "Confirm which Google calendars should feed the hub. Fred recommends primary calendar read-only for v1.",
    "Confirm Slack #command as intake-only or source-of-truth. Fred recommends intake-only with Linear/repo as durable record.",
    "List any private project folders outside SiteSignalCo and Signal workshop business hub that must be included.",
    "Choose the first functional priority after calendar: dashboard, Run Today, approvals, metrics/imports, exports, or brand admin.",
  ];
}
