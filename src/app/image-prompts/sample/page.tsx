import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleDailyContentPack } from "@/lib/automation-engine";

export default function ImagePromptDetailPage() {
  const prompt = createSampleDailyContentPack().imagePrompts[0];
  return (
    <ContentPageShell eyebrow="Image prompt" title="Image Prompt Detail" description="Review image type, prompt, design notes, alt text, filename, and status before assets are created.">
      <form className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <input className="rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={prompt.imageType} aria-label="Image type" />
        <input className="rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={prompt.headlineText} aria-label="Headline text" />
        <textarea className="min-h-36 rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={prompt.prompt} aria-label="Image prompt" />
        <textarea className="min-h-24 rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={prompt.canvaNotes} aria-label="Canva notes" />
        <textarea className="min-h-24 rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={prompt.photoshopNotes} aria-label="Photoshop notes" />
        <input className="rounded-md border border-stone-200 px-3 py-2 text-sm" defaultValue={prompt.filename} aria-label="Filename" />
      </form>
    </ContentPageShell>
  );
}
