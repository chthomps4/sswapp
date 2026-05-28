import { ContentPageShell } from "@/components/content-page-shell";
import { seedBrands, seedPlatforms } from "@/lib/seed-data";

export default function GeneratorPage() {
  return (
    <ContentPageShell
      eyebrow="Automation"
      title="Daily Content Pack Generator"
      description="Manual-trigger generation inputs for daily packs. The API can use OpenAI when a key is configured and deterministic fallback when it is not."
    >
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <form className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <input className="rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue="2026-05-28" aria-label="Date" />
          <input
            className="rounded-md border border-stone-200 px-3 py-2 text-sm"
            defaultValue="Your online presence should not require a full-time employee to manage."
            aria-label="Daily theme"
          />
          <textarea
            className="min-h-28 rounded-md border border-stone-200 px-3 py-2 text-sm"
            defaultValue="Paste Deep Research notes, recent performance notes, campaign details, or audience priorities here."
            aria-label="Research context"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <select className="rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue="signal-workshop" aria-label="Brand">
              {seedBrands.map((brand) => (
                <option key={brand.slug} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
            <select className="rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue="linkedin" aria-label="Platform">
              {seedPlatforms.map((platform) => (
                <option key={platform.slug} value={platform.slug}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>
          <button className="w-fit rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white" type="button">
            Generate review pack
          </button>
        </form>
        <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Automation boundary</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">This route prepares drafts, image prompts, approvals, exports, and reports. It does not publish posts.</p>
          <p className="mt-4 rounded-md border border-stone-200 p-3 font-mono text-xs text-stone-600">POST /api/generate/daily-pack</p>
        </aside>
      </section>
    </ContentPageShell>
  );
}
