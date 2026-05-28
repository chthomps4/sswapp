import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleDailyContentPack, exportWeeklyReportMarkdown, sampleMetricsForPack } from "@/lib/automation-engine";

export default function MetricsPage() {
  const pack = createSampleDailyContentPack();
  const metrics = sampleMetricsForPack(pack);
  return (
    <ContentPageShell eyebrow="Metrics" title="Metrics Dashboard" description="Manual metrics import and weekly analysis for repeats, revisions, follow-ups, and stop-making decisions.">
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Manual metrics entry</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["reach", "comments", "saves", "clicks", "dms", "leads"].map((field) => (
              <input key={field} className="rounded-md border border-stone-200 px-3 py-2 text-sm" placeholder={field} aria-label={field} />
            ))}
          </div>
        </div>
        <pre className="max-h-[520px] overflow-auto rounded-lg border border-stone-200 bg-white p-4 text-xs leading-5 shadow-sm">
          {exportWeeklyReportMarkdown(metrics, pack.postDrafts)}
        </pre>
      </section>
    </ContentPageShell>
  );
}
