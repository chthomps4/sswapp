import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleSocialImport } from "@/lib/social-dashboard-engine";

export default async function SocialImportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sample = createSampleSocialImport();

  return (
    <ContentPageShell
      eyebrow="Import detail"
      title={`Social Import: ${id}`}
      description="Review source metadata, validation issues, matched posts, normalized metrics, and generated recommendations."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {[
          ["Detected platform", sample.import.detectedPlatform],
          ["Rows imported", sample.snapshots.length],
          ["Issues", sample.issues.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <section className="mt-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Generated insights</h2>
        <div className="mt-3 grid gap-3">
          {sample.insights.map((insight) => (
            <article key={insight.id} className="rounded-md border border-stone-200 p-3">
              <p className="text-sm font-semibold">{insight.title}</p>
              <p className="mt-1 text-sm text-stone-600">{insight.summary}</p>
              <p className="mt-2 text-xs text-[#1e6b4d]">{insight.recommendation}</p>
            </article>
          ))}
        </div>
      </section>
    </ContentPageShell>
  );
}
