import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleSocialImport, identifyTopPosts } from "@/lib/social-dashboard-engine";

export default async function SocialPostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sample = createSampleSocialImport();
  const post = sample.socialPosts.find((item) => item.id === id) || sample.socialPosts[0];
  const metric = sample.snapshots.find((item) => item.socialPostId === post.id);
  const score = identifyTopPosts(sample.snapshots, sample.socialPosts).find((item) => item.post?.id === post.id)?.score || 0;

  return (
    <ContentPageShell eyebrow="Post performance" title={post.hook || post.title} description="Post-level metric snapshots, matching context, and recommendation evidence.">
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-stone-500">
            {post.brandSlug} / {post.platformSlug} / {post.status}
          </p>
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-stone-700">{post.fullCopy || post.bodyPreview}</p>
        </article>
        <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Snapshot</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt>Score</dt>
              <dd>{score.toFixed(1)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Reach</dt>
              <dd>{metric?.reach || 0}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Engagements</dt>
              <dd>{metric?.engagementCount || 0}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Clicks</dt>
              <dd>{metric?.clicks || metric?.linkClicks || metric?.websiteClicks || 0}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </ContentPageShell>
  );
}
