import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleDailyContentPack } from "@/lib/automation-engine";

export default function PackDetailPage() {
  const pack = createSampleDailyContentPack();
  return (
    <ContentPageShell eyebrow="Pack detail" title={pack.contentPack.title} description={pack.contentPack.strategicReason}>
      <section className="grid gap-4">
        {pack.postDrafts.map((draft) => {
          const image = pack.imagePrompts.find((prompt) => prompt.postDraftId === draft.id);
          return (
            <article key={draft.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-stone-500">
                {draft.brandName} / {draft.platformName} / {draft.status}
              </p>
              <h2 className="mt-2 text-lg font-semibold">{draft.hook}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-700">{draft.body}</p>
              <p className="mt-3 text-sm text-stone-600">Image: {image?.filename}</p>
            </article>
          );
        })}
      </section>
    </ContentPageShell>
  );
}
