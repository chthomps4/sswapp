import { ContentPageShell } from "@/components/content-page-shell";
import { seedBrands } from "@/lib/seed-data";

export default function BrandsPage() {
  return (
    <ContentPageShell eyebrow="Brand config" title="Brand Context Admin" description="Code-based editable brand configs live in src/config/brands for v1, with social destinations kept editable in seed metadata.">
      <div className="grid gap-4 md:grid-cols-2">
        {seedBrands.map((brand) => (
          <article key={brand.slug} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold">{brand.name}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{brand.positioning}</p>
            <p className="mt-3 text-xs text-stone-500">{brand.websiteUrl}</p>
          </article>
        ))}
      </div>
    </ContentPageShell>
  );
}
