import { ContentPageShell } from "@/components/content-page-shell";
import {
  createSampleDailyContentPack,
  exportAssetManifestJson,
  exportDailyReviewMarkdown,
  exportImagePromptsJson,
  exportSchedulerCsv,
} from "@/lib/automation-engine";

export default function RunTodayPackPage() {
  const pack = createSampleDailyContentPack("2026-05-28");
  const reviewMarkdown = exportDailyReviewMarkdown(pack);
  const schedulerCsv = exportSchedulerCsv(pack);
  const imageJson = exportImagePromptsJson(pack);
  const manifestJson = exportAssetManifestJson(pack);

  return (
    <ContentPageShell
      eyebrow="Content pack"
      title={pack.contentPack.title}
      description="A review-ready Run Today pack detail view. Exports are available, but scheduler CSV includes approved posts only."
    >
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Daily theme</h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">{pack.contentPack.dailyTheme}</p>
            <p className="mt-3 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-600">{pack.contentPack.strategicReason}</p>
          </article>

          <article className="rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 p-4">
              <h2 className="text-lg font-semibold">Posts by platform</h2>
              <p className="mt-1 text-sm text-stone-600">All generated copy remains needs_review.</p>
            </div>
            <div className="divide-y divide-stone-100">
              {pack.postDrafts.map((draft) => {
                const image = pack.imagePrompts.find((prompt) => prompt.postDraftId === draft.id);
                return (
                  <section key={draft.id} className="p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-stone-500">
                          {draft.brandName} / {draft.platformName}
                        </p>
                        <h3 className="mt-1 font-semibold">{draft.hook}</h3>
                      </div>
                      <span className="w-fit rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">{draft.status}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">{draft.body}</p>
                    <div className="mt-3 grid gap-2 text-xs text-stone-600 md:grid-cols-2">
                      <p className="rounded-md border border-stone-200 p-3">
                        <span className="font-semibold text-stone-800">Soft CTA:</span> {draft.ctaSoft}
                      </p>
                      <p className="rounded-md border border-stone-200 p-3">
                        <span className="font-semibold text-stone-800">Direct CTA:</span> {draft.ctaDirect}
                      </p>
                    </div>
                    {image ? (
                      <div className="mt-3 rounded-md border border-stone-200 bg-stone-50 p-3 text-xs leading-5 text-stone-600">
                        <p className="font-semibold text-stone-800">Image prompt: {image.filename}</p>
                        <p className="mt-1">{image.prompt}</p>
                        <p className="mt-1">Alt text: {image.altText}</p>
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Exports</h2>
            <div className="mt-3 grid gap-2 text-xs">
              <a href={`data:text/markdown;charset=utf-8,${encodeURIComponent(reviewMarkdown)}`} download="daily-content-pack-2026-05-28.md" className="rounded-md border border-stone-200 px-3 py-2 hover:border-emerald-300">
                Review Markdown
              </a>
              <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(schedulerCsv)}`} download="scheduler-approved-2026-05-28.csv" className="rounded-md border border-stone-200 px-3 py-2 hover:border-emerald-300">
                Scheduler CSV (approved only)
              </a>
              <a href={`data:application/json;charset=utf-8,${encodeURIComponent(imageJson)}`} download="image-prompts-2026-05-28.json" className="rounded-md border border-stone-200 px-3 py-2 hover:border-emerald-300">
                Image Prompt JSON
              </a>
              <a href={`data:application/json;charset=utf-8,${encodeURIComponent(manifestJson)}`} download="manifest.json" className="rounded-md border border-stone-200 px-3 py-2 hover:border-emerald-300">
                Asset Manifest JSON
              </a>
            </div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Review checklist</h2>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>Copy matches brand voice.</li>
              <li>Claims are supported.</li>
              <li>Image prompt clarifies the idea.</li>
              <li>Alt text is usable.</li>
              <li>Nothing is approved automatically.</li>
            </ul>
          </div>
        </aside>
      </section>
    </ContentPageShell>
  );
}
