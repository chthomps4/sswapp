import Link from "next/link";
import { ContentPageShell } from "@/components/content-page-shell";
import { getOperationalDashboardData } from "@/lib/dashboard-data";
import { getSocialPerformanceData } from "@/lib/db-operational";
import { identifyTopPosts } from "@/lib/social-dashboard-engine";

export const dynamic = "force-dynamic";

export default async function SocialPerformancePage() {
  const dashboardData = await getOperationalDashboardData();
  const hasConfirmedMetrics = dashboardData.snapshot.socialSnapshotCount > 0;
  const performance = hasConfirmedMetrics ? await getSocialPerformanceData() : null;
  const ranked = performance ? identifyTopPosts(performance.snapshots, performance.socialPosts) : [];
  const totalReach = performance?.snapshots.reduce((sum, metric) => sum + Number(metric.reach || 0), 0) || 0;
  const totalImpressions = performance?.snapshots.reduce((sum, metric) => sum + Number(metric.impressions || 0), 0) || 0;
  const totalEngagements = performance?.snapshots.reduce((sum, metric) => sum + metric.engagementCount, 0) || 0;
  const totalClicks = performance?.snapshots.reduce((sum, metric) => sum + Number(metric.clicks || metric.linkClicks || metric.websiteClicks || 0), 0) || 0;
  const totalLeads = performance?.snapshots.reduce((sum, metric) => sum + Number(metric.leads || metric.quoteRequests || metric.bookedCalls || 0), 0) || 0;

  return (
    <ContentPageShell
      eyebrow="Performance"
      title="Social Performance Dashboard"
      description="Private rollups and post-level metrics from imported dashboard exports."
    >
      <section className="grid gap-4 md:grid-cols-5">
        {[
          ["Reach", totalReach],
          ["Impressions", totalImpressions],
          ["Engagements", totalEngagements],
          ["Clicks", totalClicks],
          ["Leads/actions", totalLeads],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      {!hasConfirmedMetrics ? (
        <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm">
          <h2 className="font-semibold">No confirmed metrics yet</h2>
          <p className="mt-2 text-sm leading-6">
            Import and confirm social dashboard data before this page ranks posts. The dashboard will not show sample performance
            as real performance.
          </p>
          <Link href="/social/imports/new" className="mt-3 inline-flex rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
            Import metrics
          </Link>
        </section>
      ) : null}
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
                  No confirmed post metrics yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </ContentPageShell>
  );
}
