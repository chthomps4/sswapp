import Link from "next/link";
import { ContentPageShell } from "@/components/content-page-shell";
import { getOperationalDashboardData } from "@/lib/dashboard-data";
import { getSocialPerformanceData, isDatabaseConfigured } from "@/lib/db-operational";
import { identifyTopPosts } from "@/lib/social-dashboard-engine";

export const dynamic = "force-dynamic";

async function getMetricsSafely() {
  try {
    return await getSocialPerformanceData();
  } catch {
    return null;
  }
}

export default async function MetricsPage() {
  const [dashboardData, performanceData] = await Promise.all([getOperationalDashboardData(), getMetricsSafely()]);
  const snapshot = dashboardData.snapshot;
  const hasConfirmedMetrics = snapshot.socialSnapshotCount > 0;
  const ranked = hasConfirmedMetrics && performanceData ? identifyTopPosts(performanceData.snapshots, performanceData.socialPosts).slice(0, 10) : [];
  const totals = hasConfirmedMetrics && performanceData
    ? {
        reach: performanceData.snapshots.reduce((sum, metric) => sum + Number(metric.reach || 0), 0),
        impressions: performanceData.snapshots.reduce((sum, metric) => sum + Number(metric.impressions || 0), 0),
        engagements: performanceData.snapshots.reduce((sum, metric) => sum + metric.engagementCount, 0),
        clicks: performanceData.snapshots.reduce((sum, metric) => sum + Number(metric.clicks || metric.linkClicks || metric.websiteClicks || 0), 0),
        leads: performanceData.snapshots.reduce((sum, metric) => sum + Number(metric.leads || metric.quoteRequests || metric.bookedCalls || 0), 0),
      }
    : { reach: 0, impressions: 0, engagements: 0, clicks: 0, leads: 0 };

  return (
    <ContentPageShell
      eyebrow="Metrics"
      title="Metrics Dashboard"
      description="Confirmed import counts, performance rollups, and next actions for the private content feedback loop."
    >
      <section className="grid gap-4 md:grid-cols-5">
        {[
          ["Imports", snapshot.socialImportCount],
          ["Snapshots", snapshot.socialSnapshotCount],
          ["Insights", snapshot.socialInsightCount],
          ["Unresolved issues", snapshot.unresolvedImportIssueCount],
          ["Approved drafts", snapshot.approvedCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      {!isDatabaseConfigured() || !hasConfirmedMetrics ? (
        <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm">
          <h2 className="font-semibold">Metrics need confirmed imports</h2>
          <p className="mt-2 text-sm leading-6">
            The dashboard is ready, but performance cards stay empty until a CSV or pasted dashboard export is imported and confirmed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/social/imports/new" className="rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
              Import metrics
            </Link>
            <Link href="/social/imports" className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-950">
              View imports
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-4 grid gap-4 md:grid-cols-5">
        {[
          ["Reach", totals.reach],
          ["Impressions", totals.impressions],
          ["Engagements", totals.engagements],
          ["Clicks", totals.clicks],
          ["Leads/actions", totals.leads],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Post</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Reach</th>
              <th className="px-4 py-3">Engagement rate</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {ranked.length ? (
              ranked.map(({ metric, post, score }) => (
                <tr key={metric.id}>
                  <td className="max-w-md px-4 py-3 font-medium">{post?.hook || post?.title || "Imported post"}</td>
                  <td className="px-4 py-3">{metric.platformSlug}</td>
                  <td className="px-4 py-3">{metric.reach || 0}</td>
                  <td className="px-4 py-3">{(metric.engagementRate * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3">{score.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/social/posts/${post?.id || metric.socialPostId}`} className="text-[#1e6b4d] hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-sm text-stone-600" colSpan={6}>
                  No confirmed post metrics yet. Import social dashboard data to populate this table.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </ContentPageShell>
  );
}
