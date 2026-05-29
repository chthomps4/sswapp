import { RunTodayPanel } from "@/components/run-today-panel";
import { ContentPageShell } from "@/components/content-page-shell";
import { signalWorkshopAssets } from "@/lib/brand-assets";
import Image from "next/image";

export default function RunTodayPage() {
  return (
    <ContentPageShell
      eyebrow="Automation"
      title="Run Today"
      description="The one-click daily content operation for Signal Workshop. It creates review-ready drafts, image prompts, and pending approvals without publishing anything."
    >
      <section className="mb-4 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,0.85fr)_minmax(360px,1.15fr)]">
          <div className="flex flex-col justify-center p-4 sm:p-5">
            <div className="flex size-14 items-center justify-center rounded-lg border border-stone-200 bg-white p-2 shadow-sm">
              <Image
                src={signalWorkshopAssets.swMonogram.src}
                alt={signalWorkshopAssets.swMonogram.alt}
                width={56}
                height={56}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-normal text-[#17211d]">Morning operation, review-first.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
              Generate drafts, image prompts, and approval records from the same Signal Workshop operating rhythm without publishing or approving anything automatically.
            </p>
          </div>
          <div className="relative min-h-[220px] border-t border-stone-200 lg:border-l lg:border-t-0">
            <Image
              src={signalWorkshopAssets.operationsDesk.src}
              alt={signalWorkshopAssets.operationsDesk.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>
      <RunTodayPanel />
    </ContentPageShell>
  );
}
