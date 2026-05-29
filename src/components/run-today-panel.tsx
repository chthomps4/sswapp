"use client";

import { CalendarDays, CheckCircle2, FileJson, FileText, ImageIcon, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { seedBrands, seedCampaigns, seedPlatforms } from "@/lib/seed-data";

type RunTodayResponse = {
  message: string;
  packUrl: string;
  contentPackId: string;
  posts: number;
  imagePrompts: number;
  approvals: number;
  promptRenders: Array<{ promptKey: string; promptVersion: string }>;
};

function localDateInputValue() {
  return new Date().toLocaleDateString("en-CA");
}

export function RunTodayPanel() {
  const [date, setDate] = useState(localDateInputValue);
  const [strategicPriority, setStrategicPriority] = useState("Create useful daily visibility without creating another full-time operations burden.");
  const [dailyTheme, setDailyTheme] = useState("");
  const [businessNotes, setBusinessNotes] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(["signal-workshop", "local-signal-websites", "al-brothers"]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin", "facebook", "instagram", "google-business-profile"]);
  const [includeReddit, setIncludeReddit] = useState(false);
  const [includePerformanceContext, setIncludePerformanceContext] = useState(true);
  const [includeShortVideoIdeas, setIncludeShortVideoIdeas] = useState(true);
  const [result, setResult] = useState<RunTodayResponse | null>(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  function toggle(list: string[], value: string, setter: (values: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  async function runToday() {
    setIsRunning(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/automations/run-today", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date,
          strategicPriority,
          dailyTheme,
          selectedBrands,
          selectedPlatforms,
          businessNotes,
          includeImagePrompts: true,
          includeCarouselOutlines: true,
          includeGoogleBusinessProfile: selectedPlatforms.includes("google-business-profile"),
          includeReddit,
          includeShortVideoIdeas,
          includePerformanceContext,
        }),
      });
      const data = (await response.json().catch(() => null)) as (RunTodayResponse & { message?: string }) | null;
      if (!response.ok || !data?.packUrl) {
        setError(data?.message || "Run Today failed. Check your login, database connection, and deployment logs.");
        return;
      }
      setResult(data);
      window.location.assign(data.packUrl);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-stone-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Run Today</h2>
            <p className="text-sm leading-6 text-stone-600">One morning action for drafts, image prompts, quality checks, and pending approvals.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 size={14} />
            Manual publishing only
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm font-medium">
            Date
            <input value={date} onChange={(event) => setDate(event.target.value)} className="rounded-md border border-stone-200 px-3 py-2 text-sm font-normal" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Strategic priority
            <input value={strategicPriority} onChange={(event) => setStrategicPriority(event.target.value)} className="rounded-md border border-stone-200 px-3 py-2 text-sm font-normal" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Daily theme, optional
            <input value={dailyTheme} onChange={(event) => setDailyTheme(event.target.value)} placeholder="Leave blank and the app will choose a theme" className="rounded-md border border-stone-200 px-3 py-2 text-sm font-normal" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Business notes
            <textarea value={businessNotes} onChange={(event) => setBusinessNotes(event.target.value)} className="min-h-24 rounded-md border border-stone-200 px-3 py-2 text-sm font-normal" placeholder="Campaign notes, offer timing, Deep Research output, or constraints." />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <fieldset className="rounded-md border border-stone-200 p-3">
            <legend className="px-1 text-xs font-semibold uppercase text-stone-500">Brands</legend>
            <div className="mt-2 grid gap-2">
              {seedBrands.map((brand) => (
                <label key={brand.slug} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedBrands.includes(brand.slug)} onChange={() => toggle(selectedBrands, brand.slug, setSelectedBrands)} />
                  {brand.name}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="rounded-md border border-stone-200 p-3">
            <legend className="px-1 text-xs font-semibold uppercase text-stone-500">Platforms</legend>
            <div className="mt-2 grid gap-2">
              {seedPlatforms.slice(0, 10).map((platform) => (
                <label key={platform.slug} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedPlatforms.includes(platform.slug)} onChange={() => toggle(selectedPlatforms, platform.slug, setSelectedPlatforms)} />
                  {platform.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-4 grid gap-2 rounded-md border border-stone-200 p-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={includePerformanceContext} onChange={(event) => setIncludePerformanceContext(event.target.checked)} />
            Include sanitized performance context
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={includeShortVideoIdeas} onChange={(event) => setIncludeShortVideoIdeas(event.target.checked)} />
            Include short video ideas
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={includeReddit} onChange={(event) => setIncludeReddit(event.target.checked)} />
            Include Reddit discussion variants
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={runToday} disabled={isRunning} className="inline-flex items-center gap-2 rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white hover:bg-[#195a41] disabled:opacity-60">
            <Play size={16} />
            {isRunning ? "Running..." : "Run Today"}
          </button>
          <Link href="/packs/run-today" className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:border-emerald-300">
            <CalendarDays size={16} />
            View latest pack
          </Link>
        </div>
        {error ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>
        ) : null}
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">What gets created</h2>
          <div className="mt-3 grid gap-2 text-sm text-stone-700">
            {[
              ["ContentPack", FileText],
              ["PostDrafts", Sparkles],
              ["ImagePrompts", ImageIcon],
              ["Approval records", CheckCircle2],
              ["AutomationRun", FileJson],
            ].map(([label, Icon]) => (
              <div key={String(label)} className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2">
                <Icon size={15} />
                {String(label)}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-stone-500">Generated records stay in needs_review or pending. Export CSV remains approved-only.</p>
        </div>

        {result ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-sm">
            <h2 className="font-semibold">Run complete</h2>
            <p className="mt-2 text-sm leading-6">{result.message}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-md bg-white/70 p-2">
                <dt className="text-xs text-emerald-800">Posts</dt>
                <dd className="font-semibold">{result.posts}</dd>
              </div>
              <div className="rounded-md bg-white/70 p-2">
                <dt className="text-xs text-emerald-800">Images</dt>
                <dd className="font-semibold">{result.imagePrompts}</dd>
              </div>
              <div className="rounded-md bg-white/70 p-2">
                <dt className="text-xs text-emerald-800">Approvals</dt>
                <dd className="font-semibold">{result.approvals}</dd>
              </div>
            </dl>
            <a href={result.packUrl} className="mt-3 inline-flex rounded-md bg-[#1e6b4d] px-3 py-2 text-sm font-medium text-white">
              Open pack detail
            </a>
          </div>
        ) : null}

        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Current campaigns</h2>
          <div className="mt-3 space-y-2">
            {seedCampaigns.slice(0, 5).map((campaign) => (
              <p key={campaign.slug} className="rounded-md border border-stone-200 px-3 py-2 text-xs text-stone-600">
                <span className="font-semibold text-stone-800">{campaign.name}</span> - {campaign.offer}
              </p>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
