import { ContentPageShell } from "@/components/content-page-shell";
import { getSocialImportPreview, isDatabaseConfigured } from "@/lib/db-operational";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SocialImportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbImport = isDatabaseConfigured() ? await getSocialImportPreview(id).catch(() => null) : null;
  if (!dbImport) {
    notFound();
  }
  const importRecord = dbImport;

  return (
    <ContentPageShell
      eyebrow="Import detail"
      title={`Social Import: ${id}`}
      description="Review source metadata, validation issues, matched posts, normalized metrics, and generated recommendations."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {[
          ["Detected platform", importRecord.detectedPlatform],
          ["Rows parsed", importRecord.previewRows.length],
          ["Issues", importRecord.previewRows.reduce((sum, row) => sum + row.validationErrors.length, 0)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <section className="mt-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Preview rows</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Row</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Matched draft</th>
                <th className="px-4 py-3">Matched social post</th>
                <th className="px-4 py-3">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {importRecord.previewRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-mono text-xs">{row.rowIndex}</td>
                  <td className="px-4 py-3">{row.validationStatus}</td>
                  <td className="px-4 py-3">{row.matchedPostDraftId || "-"}</td>
                  <td className="px-4 py-3">{row.matchedSocialPostId || "-"}</td>
                  <td className="px-4 py-3">{row.validationErrors.join("; ") || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ContentPageShell>
  );
}
