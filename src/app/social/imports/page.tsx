import Link from "next/link";
import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleSocialImport, mappingTemplates, socialAccounts } from "@/lib/social-dashboard-engine";

export default function SocialImportsPage() {
  const sample = createSampleSocialImport();
  const imports = [sample.import];

  return (
    <ContentPageShell
      eyebrow="Private social data"
      title="Social Data Imports"
      description="Upload or paste dashboard exports, preview normalized rows, and confirm private metric imports before analysis."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/social/imports/new" className="rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
          New import
        </Link>
        <Link href="/social/performance" className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium">
          Performance dashboard
        </Link>
      </div>
      <section className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Rows</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date range</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {imports.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.originalFilename}</td>
                <td className="px-4 py-3">{item.detectedPlatform}</td>
                <td className="px-4 py-3">{item.rowCount}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">
                  {item.detectedDateRangeStart} to {item.detectedDateRangeEnd}
                </td>
                <td className="px-4 py-3">
                  <Link href="/social/imports/sample" className="text-[#1e6b4d] hover:underline">
                    View import
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Seeded social accounts</h2>
          <p className="mt-2 text-sm text-stone-600">{socialAccounts.length} private account records are ready for brand/platform matching.</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Mapping templates</h2>
          <p className="mt-2 text-sm text-stone-600">{mappingTemplates.length} reusable templates cover generic, Meta, Instagram, LinkedIn, GBP, Ko-fi, and manual entry.</p>
        </div>
      </section>
    </ContentPageShell>
  );
}
