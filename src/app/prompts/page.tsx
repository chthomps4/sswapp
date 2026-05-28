import Link from "next/link";
import { ContentPageShell } from "@/components/content-page-shell";
import { promptRegistry } from "@/lib/prompts/promptRegistry";

export default function PromptLibraryPage() {
  return (
    <ContentPageShell
      eyebrow="Automation"
      title="Prompt Library"
      description="Inspect prompt keys, versions, privacy levels, required variables, and output modes used by content automations."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/prompts/preview" className="rounded-md bg-[#1e6b4d] px-3 py-2 text-sm font-medium text-white">
          Open prompt preview
        </Link>
        <Link href="/automations/recipes" className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800">
          Automation recipes
        </Link>
      </div>
      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Prompt</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Privacy</th>
              <th className="px-4 py-3">Output</th>
              <th className="px-4 py-3">Required variables</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {promptRegistry.map((prompt) => (
              <tr key={prompt.key} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold">{prompt.key}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{prompt.description}</p>
                </td>
                <td className="px-4 py-3">{prompt.category}</td>
                <td className="px-4 py-3 font-mono text-xs">{prompt.version}</td>
                <td className="px-4 py-3 text-xs">{prompt.privacyLevel}</td>
                <td className="px-4 py-3">{prompt.outputMode}</td>
                <td className="px-4 py-3 text-xs">{prompt.requiredVariables.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </ContentPageShell>
  );
}
