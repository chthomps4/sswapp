import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleSocialImport } from "@/lib/social-dashboard-engine";

export default function SocialInsightsPage() {
  const sample = createSampleSocialImport();
  return (
    <ContentPageShell eyebrow="Recommendations" title="Insights and Recommendations" description="Rule-based performance insights that can feed content themes and repurpose tasks.">
      <section className="grid gap-3">
        {sample.insights.map((insight) => (
          <article key={insight.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500">{insight.insightType}</p>
                <h2 className="mt-1 font-semibold">{insight.title}</h2>
              </div>
              <span className="w-fit rounded border border-stone-200 bg-stone-50 px-2 py-1 text-xs">{insight.status}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">{insight.summary}</p>
            <p className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{insight.recommendation}</p>
          </article>
        ))}
      </section>
    </ContentPageShell>
  );
}
