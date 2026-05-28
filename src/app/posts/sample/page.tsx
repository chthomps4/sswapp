import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleDailyContentPack } from "@/lib/automation-engine";

export default function PostDetailPage() {
  const draft = createSampleDailyContentPack().postDrafts[0];
  return (
    <ContentPageShell eyebrow="Post editor" title="Post Draft Detail" description="Editable copy fields for hook, body, CTAs, hashtags, alt text, final copy, and review status.">
      <form className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <input className="rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={draft.hook} aria-label="Hook" />
        <textarea className="min-h-40 rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={draft.body} aria-label="Body" />
        <input className="rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={draft.ctaSoft} aria-label="Soft CTA" />
        <input className="rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={draft.ctaDirect} aria-label="Direct CTA" />
        <textarea className="min-h-24 rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={draft.altText} aria-label="Alt text" />
      </form>
    </ContentPageShell>
  );
}
