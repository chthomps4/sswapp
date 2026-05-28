import Link from "next/link";
import { ContentPageShell } from "@/components/content-page-shell";
import { getSocialPerformanceData } from "@/lib/db-operational";
import { identifyTopPosts } from "@/lib/social-dashboard-engine";

export const dynamic = "force-dynamic";

export default async function SocialPerformancePage() {
  const sample = await getSocialPerformanceData();
  const ranked = identifyTopPosts(sample.snapshots, sample.socialPosts);
  const totalReach = sample.snapshots.reduce((sum, metric) => sum + Number(metric.reach || 0), 0);
  const totalImpressions = sample.snapshots.reduce((sum, metric) => sum + Number(metric.impressions || 0), 0);
  const totalEngagements = sample.snapshots.reduce((sum, metric) => sum + metric.engagementCount, 0);
  const totalClicks = sample.snapshots.reduce((sum, metric) => sum + Number(metric.clicks || metric.linkClicks || metric.websiteClicks || 0), 0);
  const totalLeads = sample.snapshots.reduce((sum, metric) => sum + Number(metric.leads || metric.quoteRequests || metric.bookedCalls || 0), 0);

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
            {ranked.map(({ metric, post, score }) => (
              <tr key={metric.id}>
                <td className="max-w-md px-4 py-3 font-medium">{post?.hook || post?.title}</td>
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
            ))}
          </tbody>
        </table>
      </section>
    </ContentPageShell>
  );
}
