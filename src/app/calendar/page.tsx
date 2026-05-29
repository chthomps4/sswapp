import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleDailyContentPack } from "@/lib/automation-engine";
import {
  businessHubRouteAudit,
  getBusinessHubRouteAuditSummary,
  getOwnerActionItems,
  getUpcomingBusinessHubEvents,
} from "@/lib/business-hub-operating-plan";
import { isDatabaseConfigured, listCalendarDrafts } from "@/lib/db-operational";

export const dynamic = "force-dynamic";

async function getCalendarDraftsSafely() {
  if (!isDatabaseConfigured()) {
    return { drafts: null, warning: "Database is not configured; showing deterministic sample content drafts." };
  }
  try {
    return { drafts: await listCalendarDrafts(), warning: "" };
  } catch {
    return {
      drafts: null,
      warning: "Database calendar reads are unavailable in this deployment; showing deterministic sample content drafts.",
    };
  }
}

export default async function CalendarPage() {
  const { drafts: dbDrafts, warning: calendarWarning } = await getCalendarDraftsSafely();
  const pack = dbDrafts ? null : createSampleDailyContentPack();
  const drafts =
    dbDrafts?.map((draft) => ({
      id: draft.id,
      date: draft.date.toISOString().slice(0, 10),
      brandName: draft.brand.name,
      platformName: draft.platform.name,
      contentPillarName: draft.contentPillar.name,
      hook: draft.hook,
      status: draft.status.toLowerCase(),
    })) || pack?.postDrafts || [];
  const businessEvents = getUpcomingBusinessHubEvents();
  const routeAuditSummary = getBusinessHubRouteAuditSummary();
  const ownerActionItems = getOwnerActionItems();

  return (
    <ContentPageShell
      eyebrow="Calendar"
      title="Business and Content Calendar"
      description="Private operating view for business cadence, Google Calendar integration planning, generated content drafts, and dead-page rescue work."
    >
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-stone-500">Business Operating Calendar</p>
              <h2 className="mt-1 text-lg font-semibold text-stone-900">Upcoming command-center events</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                This is a private, connector-ready view. Google Calendar is read as operating context only; production sync and
                calendar writes require Fred and CEO approval.
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">read-only v1</span>
          </div>

          {calendarWarning ? (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{calendarWarning}</p>
          ) : null}

          <div className="mt-4 space-y-3">
            {businessEvents.map((event) => (
              <article key={event.id} className="rounded-md border border-stone-200 bg-stone-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-stone-900">{event.title}</h3>
                    <p className="mt-1 text-sm text-stone-600">
                      {event.date} - {event.startTime}-{event.endTime} - {event.owner}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-white px-2.5 py-1 text-stone-700 ring-1 ring-stone-200">{event.source}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-stone-700 ring-1 ring-stone-200">{event.status}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-stone-700 ring-1 ring-stone-200">{event.privacy}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-700">{event.description}</p>
                <p className="mt-2 text-sm font-medium text-[#1e6b4d]">{event.nextAction}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-stone-500">CEO/Fred Inputs</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-900">What is still needed from you</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
            {ownerActionItems.map((item) => (
              <li key={item} className="rounded-md bg-stone-50 p-3">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="mt-5 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-stone-500">Dead Page Rescue</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-900">Route audit queue</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              These are the pages Fred/Sara/Alvin need to move from sample-heavy or placeholder behavior into real operating
              workflows.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
            {Object.entries(routeAuditSummary).map(([status, count]) => (
              <div key={status} className="rounded-md bg-stone-50 px-3 py-2 text-center">
                <div className="font-semibold text-stone-900">{count}</div>
                <div className="mt-1 text-stone-500">{status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Problem</th>
                <th className="px-4 py-3">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {businessHubRouteAudit.map((item) => (
                <tr key={item.route}>
                  <td className="px-4 py-3 font-mono text-xs">{item.route}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3 font-semibold">{item.priority}</td>
                  <td className="px-4 py-3">{item.owner}</td>
                  <td className="px-4 py-3">{item.problem}</td>
                  <td className="px-4 py-3">{item.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase text-stone-500">Content Calendar</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-900">Generated post drafts</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            DB-backed drafts are shown when the database is configured. Otherwise the table uses deterministic sample data so the
            workflow stays reviewable during setup.
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Pillar</th>
              <th className="px-4 py-3">Hook</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {drafts.map((draft) => (
              <tr key={draft.id}>
                <td className="px-4 py-3 font-mono text-xs">{draft.date}</td>
                <td className="px-4 py-3">{draft.brandName}</td>
                <td className="px-4 py-3">{draft.platformName}</td>
                <td className="px-4 py-3">{draft.contentPillarName}</td>
                <td className="px-4 py-3">{draft.hook}</td>
                <td className="px-4 py-3">{draft.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </section>
    </ContentPageShell>
  );
}
