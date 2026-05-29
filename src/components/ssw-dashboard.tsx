"use client";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  ImageIcon,
  LineChart,
  Library,
  Link2,
  Play,
  Send,
  Sparkles,
  TableProperties,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { signalWorkshopAssets } from "@/lib/brand-assets";
import type { DashboardSnapshot } from "@/lib/dashboard-data";
import type { Brand, GeneratedPost, PostVariant } from "@/lib/types";
import { getLaunchUrl, weeklyReport } from "@/lib/content-engine";
import {
  createSampleDailyContentPack,
  exportDailyReviewMarkdown,
  exportSchedulerCsv,
  exportWeeklyReportMarkdown,
  sampleMetricsForPack,
} from "@/lib/automation-engine";

type DashboardProps = {
  brands: Brand[];
  posts: PostVariant[];
  dashboard: DashboardSnapshot;
};

const sourceTone: Record<string, string> = {
  database: "border-emerald-200 bg-emerald-50 text-emerald-900",
  empty_database: "border-amber-200 bg-amber-50 text-amber-900",
  deterministic_fallback: "border-stone-200 bg-stone-50 text-stone-800",
  error_fallback: "border-red-200 bg-red-50 text-red-900",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  needs_review: "Needs Review",
  approved: "Approved",
  needs_revision: "Needs Revision",
  scheduled: "Scheduled",
  posted: "Posted",
  skipped: "Skipped",
  archived: "Archived",
};

function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(value);
  }
}

function downloadText(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "needs_revision"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "posted"
          ? "border-slate-300 bg-slate-100 text-slate-800"
          : "border-stone-200 bg-stone-50 text-stone-700";
  return <span className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${tone}`}>{statusLabels[status] || status}</span>;
}

function IconButton({
  label,
  children,
  onClick,
  href,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const classes =
    "inline-flex size-8 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-700 transition hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400";
  if (href) {
    return (
      <a className={classes} href={href} target="_blank" rel="noreferrer" title={label} aria-label={label}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} onClick={onClick} title={label} aria-label={label} type="button">
      {children}
    </button>
  );
}

export function SswDashboard({ brands, posts, dashboard }: DashboardProps) {
  const [activeBrand, setActiveBrand] = useState(brands[0]?.slug || "signal-workshop");
  const [drafts, setDrafts] = useState<PostVariant[]>(posts);
  const [theme, setTheme] = useState("Signal over noise");
  const [researchBrief, setResearchBrief] = useState("");
  const [generationNote, setGenerationNote] = useState("Prompt-assisted and API-backed generation are ready.");
  const [statusNote, setStatusNote] = useState(
    dashboard.statusMode === "persistent"
      ? "Dashboard status actions will call the persisted approval API."
      : "Dashboard status actions are preview-only until a persisted content pack is loaded.",
  );
  const activeBrandData = brands.find((brand) => brand.slug === activeBrand) || brands[0];
  const reviewQueue = drafts.filter((post) => ["draft", "needs_review", "needs_revision"].includes(post.approvalStatus));
  const report = weeklyReport(drafts);
  const approvedCount = drafts.filter((post) => post.approvalStatus === "approved").length;
  const samplePack = useMemo(() => createSampleDailyContentPack(), []);
  const sampleMetrics = useMemo(() => sampleMetricsForPack(samplePack), [samplePack]);
  const packExportQuery = dashboard.statusMode === "persistent" ? `?contentPackId=${encodeURIComponent(dashboard.latestPackId)}` : "";
  const operationalCards = [
    {
      label: "Content Source",
      value: dashboard.contentSourceLabel,
      detail: dashboard.latestPackTitle || "No pack loaded",
      tone: dashboard.contentSource,
    },
    {
      label: "Review Queue",
      value: String(reviewQueue.length),
      detail: `${dashboard.pendingApprovalCount} pending approvals`,
      tone: reviewQueue.length > 0 ? "empty_database" : "database",
    },
    {
      label: "Image Prompts",
      value: String(dashboard.imagePromptCount),
      detail: `${dashboard.totalDrafts} current drafts`,
      tone: dashboard.imagePromptCount > 0 ? "database" : "empty_database",
    },
    {
      label: "Social Metrics",
      value: dashboard.socialSourceLabel,
      detail: `${dashboard.socialImportCount} imports / ${dashboard.socialSnapshotCount} snapshots`,
      tone: dashboard.socialSource,
    },
  ];

  const socialLinks = useMemo(() => activeBrandData?.socialProfiles || [], [activeBrandData]);
  const heroAsset = signalWorkshopAssets.studioDashboardMockup;

  async function generatePack() {
    setGenerationNote("Generating review-ready pack...");
    const response = await fetch("/api/generate/daily-pack", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ theme, brandSlug: activeBrand, researchBrief }),
    });
    const data = (await response.json()) as { mode: string; posts: GeneratedPost[]; error?: string };
    const generated = data.posts.map((post, index) => ({
      ...post,
      id: `generated-${Date.now()}-${index}`,
      approvalStatus: "needs_review" as const,
      publishingStatus: "not_scheduled" as const,
      finalUrl: "",
      reviewNotes: data.mode === "fallback" ? data.error || "Generated from deterministic fallback." : "Generated by OpenAI.",
      metrics: {
        reach: 0,
        impressions: 0,
        engagements: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        clicks: 0,
        dms: 0,
        leads: 0,
        registrations: 0,
      },
    }));
    setDrafts((current) => [...generated, ...current]);
    setGenerationNote(data.mode === "fallback" ? `Fallback pack created. ${data.error || ""}` : "OpenAI pack created and queued for review.");
  }

  async function updateDraftStatus(id: string, status: "approved" | "needs_revision") {
    if (dashboard.statusMode === "persistent") {
      const response = await fetch(`/api/posts/${id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          reviewer: "owner",
          notes: status === "approved" ? "Approved from dashboard." : "Requested revision from dashboard.",
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setStatusNote(data?.message || "Status update failed. Open Approval Queue for details.");
        return;
      }
      setStatusNote(status === "approved" ? "Approval persisted." : "Revision request persisted.");
    } else {
      setStatusNote("Preview-only status change. Run Today or seed the database before operational approval.");
    }
    setDrafts((current) => current.map((post) => (post.id === id ? { ...post, approvalStatus: status } : post)));
  }

  return (
    <div className="min-h-screen bg-[#f5f7f4] text-[#17211d]">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="border-r border-stone-200 bg-[#15211b] px-4 py-5 text-stone-100">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
              <Image
                src={signalWorkshopAssets.swMonogram.src}
                alt={signalWorkshopAssets.swMonogram.alt}
                width={44}
                height={44}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold">SSWApp</p>
              <p className="text-xs text-stone-300">Social Operations</p>
            </div>
          </div>
          <nav className="mt-8 space-y-1 text-sm">
            {[
              ["Today", "#today", Sparkles],
              ["Run Today", "/run-today", Play],
              ["Generator", "/generator", Send],
              ["Approval Queue", "/approvals", CheckCircle2],
              ["Calendar", "/calendar", CalendarDays],
              ["Metrics", "/metrics", TableProperties],
              ["Social Data", "/social/imports", LineChart],
              ["Prompts", "/prompts", FileText],
              ["Recipes", "/automations/recipes", Library],
              ["Brand Context", "/brands", Library],
              ["Launchpad", "#launchpad", Link2],
            ].map(([label, href, Icon]) => (
              <a
                key={String(label)}
                href={String(href)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-stone-200 hover:bg-white/10"
              >
                <Icon size={16} />
                {String(label)}
              </a>
            ))}
          </nav>
          <div className="mt-8 border-t border-white/10 pt-5">
            <label className="text-xs font-semibold uppercase text-stone-400" htmlFor="brand-select">
              Brand
            </label>
            <select
              id="brand-select"
              value={activeBrand}
              onChange={(event) => setActiveBrand(event.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {brands.map((brand) => (
                <option className="text-stone-900" value={brand.slug} key={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex h-24 w-full max-w-[280px] items-center justify-center rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
                <Image
                  src={signalWorkshopAssets.primaryLogo.src}
                  alt={signalWorkshopAssets.primaryLogo.alt}
                  width={280}
                  height={180}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div>
              <h1 className="text-2xl font-semibold tracking-normal text-[#17211d]">Signal Workshop operating dashboard</h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">
                Review content, imports, approvals, workflow audits, and exports from the DB-backed business hub without crossing the auto-publish line.
              </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/run-today"
                className="inline-flex items-center gap-2 rounded-md bg-[#1e6b4d] px-3 py-2 text-sm font-medium text-white hover:bg-[#195a41]"
              >
                <Sparkles size={16} />
                Run Today
              </a>
              <a
                href={`/api/exports/markdown${packExportQuery}`}
                className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:border-emerald-300"
              >
                <FileText size={16} />
                Review Pack
              </a>
              <a
                href={`/api/exports/csv${packExportQuery}`}
                className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:border-emerald-300"
              >
                <Download size={16} />
                Approved CSV
              </a>
              <a
                href={`/api/exports/image-prompts${packExportQuery}`}
                className="inline-flex items-center gap-2 rounded-md bg-[#1e6b4d] px-3 py-2 text-sm font-medium text-white hover:bg-[#195a41]"
              >
                <ImageIcon size={16} />
                Image JSON
              </a>
              <a
                href={`/api/exports/asset-manifest${packExportQuery}`}
                className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:border-emerald-300"
              >
                <FileText size={16} />
                Manifest
              </a>
            </div>
          </header>

          <section className="mt-5 overflow-hidden rounded-lg border border-stone-200 bg-[#14211c] shadow-sm">
            <div className="grid min-h-[260px] gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
              <div className="flex flex-col justify-between gap-6 p-5 text-white sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Private command surface</p>
                  <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-normal sm:text-3xl">Good work deserves a better signal.</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-stone-200">
                    The dashboard stays focused on review queues, imports, approvals, and operational next steps. The imagery is brand context; persisted data remains the source of truth.
                  </p>
                </div>
                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  {[
                    ["Source", dashboard.contentSourceLabel],
                    ["Approvals", `${dashboard.pendingApprovalCount} pending`],
                    ["Metrics", dashboard.socialSourceLabel],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-white/10 bg-white/10 p-3">
                      <p className="text-xs uppercase text-stone-300">{label}</p>
                      <p className="mt-1 font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative min-h-[240px] border-t border-white/10 bg-stone-950 lg:border-l lg:border-t-0">
                <Image
                  src={heroAsset.src}
                  alt={heroAsset.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </section>

          <section className="grid gap-3 py-5 md:grid-cols-2 xl:grid-cols-4">
            {operationalCards.map((card) => (
              <div key={card.label} className={`rounded-lg border p-4 shadow-sm ${sourceTone[card.tone] || sourceTone.deterministic_fallback}`}>
                <p className="text-xs font-semibold uppercase">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 opacity-80">{card.detail}</p>
              </div>
            ))}
          </section>

          <section className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Operational Warnings</h2>
              {dashboard.warnings.length ? (
                <div className="mt-3 space-y-2">
                  {dashboard.warnings.map((warning) => (
                    <p key={warning} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      {warning}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  Core dashboard dependencies are configured and the latest pack is loading from persisted records.
                </p>
              )}
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Next Actions</h2>
              <div className="mt-3 space-y-2">
                {dashboard.nextActions.slice(0, 4).map((action) => (
                  <p key={action} className="rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-700">
                    {action}
                  </p>
                ))}
              </div>
            </div>
          </section>

          <section id="today" className="grid gap-4 py-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Today&apos;s Pack</h2>
                  <p className="text-sm text-stone-600">Theme, research context, and generation queue.</p>
                </div>
                <StatusPill status={approvedCount ? "approved" : "needs_review"} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                  className="rounded-md border border-stone-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Daily theme"
                />
                <input
                  className="rounded-md border border-stone-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Offer tie-in"
                  defaultValue={activeBrandData?.defaultCta}
                />
                <button
                  type="button"
                  onClick={generatePack}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white hover:bg-[#195a41]"
                >
                  <Send size={16} />
                  Generate
                </button>
              </div>
              <textarea
                value={researchBrief}
                onChange={(event) => setResearchBrief(event.target.value)}
                className="mt-3 min-h-28 w-full rounded-md border border-stone-200 px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Paste the incoming Deep Research brief or weekly content intelligence notes here."
              />
              <p className="mt-2 text-xs text-stone-500">{generationNote}</p>
            </div>

            <div id="launchpad" className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Social Launchpad</h2>
              <p className="mt-1 text-sm text-stone-600">Open logged-in social destinations, then paste approved content manually.</p>
              <div className="mt-4 space-y-2">
                {socialLinks.map((profile) => (
                  <div key={`${profile.platform}-${profile.profileUrl}`} className="flex items-center justify-between gap-3 rounded-md border border-stone-200 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{profile.platform}</p>
                      <p className="truncate text-xs text-stone-500">{profile.handle || profile.profileUrl}</p>
                    </div>
                    <div className="flex gap-2">
                      <IconButton label={`Open ${profile.platform}`} href={profile.composerUrl || profile.profileUrl}>
                        <ArrowUpRight size={15} />
                      </IconButton>
                      <IconButton label="Copy URL" onClick={() => copyText(profile.composerUrl || profile.profileUrl)}>
                        <Clipboard size={15} />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="approval-queue" className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-stone-200 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Approval Queue</h2>
                <p className="text-sm text-stone-600">Every row remains manual-review first. Open links never publish.</p>
              </div>
              <div className="max-w-md text-left md:text-right">
                <p className="text-sm text-stone-500">{reviewQueue.length} waiting for review</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">{statusNote}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Brand</th>
                    <th className="px-4 py-3 font-semibold">Platform</th>
                    <th className="px-4 py-3 font-semibold">Hook</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reviewQueue.map((post) => (
                    <tr key={post.id} className="align-top hover:bg-stone-50/70">
                      <td className="px-4 py-3 font-mono text-xs text-stone-500">{post.date}</td>
                      <td className="max-w-[180px] px-4 py-3 font-medium">{post.brandName}</td>
                      <td className="px-4 py-3">{post.platformName}</td>
                      <td className="max-w-md px-4 py-3">
                        <p className="font-medium">{post.hook}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">{post.body}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={post.approvalStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <IconButton label="Copy post copy" onClick={() => copyText([post.hook, post.body, post.cta, post.hashtags].filter(Boolean).join("\n\n"))}>
                            <Clipboard size={15} />
                          </IconButton>
                          <IconButton label="Open social site" href={getLaunchUrl(post)}>
                            <ArrowUpRight size={15} />
                          </IconButton>
                          <button
                            type="button"
                            onClick={() => void updateDraftStatus(post.id, "approved")}
                            className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => void updateDraftStatus(post.id, "needs_revision")}
                            className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
                          >
                            Revise
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 py-5 xl:grid-cols-3">
            <div id="calendar" className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Calendar</h2>
              <div className="mt-4 space-y-3">
                {drafts.slice(0, 5).map((post) => (
                  <div key={`cal-${post.id}`} className="border-l-2 border-emerald-300 pl-3">
                    <p className="font-mono text-xs text-stone-500">{post.date}</p>
                    <p className="text-sm font-medium">{post.platformName}: {post.hook}</p>
                  </div>
                ))}
              </div>
            </div>
            <div id="metrics" className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Metrics</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Drafts", drafts.length],
                  ["Needs Review", reviewQueue.length],
                  ["Approved", approvedCount],
                  ["Snapshots", dashboard.socialSnapshotCount],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-md border border-stone-200 p-3">
                    <p className="text-xs uppercase text-stone-500">{String(label)}</p>
                    <p className="mt-1 text-2xl font-semibold">{String(value)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-stone-600">Best current pillar: {report.bestPillars[0]?.pillar || "Waiting for metrics"}</p>
              <p className="mt-2 text-xs text-stone-500">
                Metrics source: {dashboard.socialSourceLabel}. Unresolved import issues: {dashboard.unresolvedImportIssueCount}.
              </p>
            </div>
            <div id="prompts" className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Prompt Library</h2>
              <div className="mt-4 space-y-2 text-sm">
                {["Daily Social Post Pack", "Weekly Deep Research Brief", "Image Concept Batch", "Photoshop Refinement", "Beautiful.ai Workshop Promo Deck", "Lucid Automation Workflow"].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => copyText(prompt)}
                    className="flex w-full items-center justify-between rounded-md border border-stone-200 px-3 py-2 text-left hover:border-emerald-300"
                  >
                    <span>{prompt}</span>
                    <Clipboard size={14} />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 pb-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Fallback Sample Daily Output</h2>
                  <p className="text-sm text-stone-600">Reference pack for export format checks: {samplePack.contentPack.dailyTheme}</p>
                </div>
                <StatusPill status={samplePack.contentPack.status} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {samplePack.postDrafts.slice(0, 6).map((draft) => (
                  <div key={draft.id} className="rounded-md border border-stone-200 p-3">
                    <p className="text-xs font-semibold uppercase text-stone-500">
                      {draft.brandName} / {draft.platformName}
                    </p>
                    <p className="mt-2 text-sm font-semibold">{draft.hook}</p>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-stone-600">{draft.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadText("daily-content-pack-sample.md", exportDailyReviewMarkdown(samplePack))}
                  className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:border-emerald-300"
                >
                  <FileText size={16} />
                  Sample Review
                </button>
                <button
                  type="button"
                  onClick={() => downloadText("approved-scheduler-sample.csv", exportSchedulerCsv(samplePack), "text/csv")}
                  className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:border-emerald-300"
                >
                  <Download size={16} />
                  Scheduler CSV
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Sample Metrics Feedback Loop</h2>
              <p className="mt-1 text-sm text-stone-600">Deterministic sample recommendations stay visible until confirmed social imports take over.</p>
              <div className="mt-4 space-y-2 text-sm">
                {exportWeeklyReportMarkdown(sampleMetrics, samplePack.postDrafts)
                  .split("\n")
                  .filter((line) => line.startsWith("- "))
                  .slice(0, 4)
                  .map((line) => (
                    <p key={line} className="rounded-md border border-stone-200 px-3 py-2 text-stone-700">
                      {line.replace(/^- /, "")}
                    </p>
                  ))}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Brand Context</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-6">
              {brands.map((brand) => (
                <div key={brand.slug} className="rounded-md border border-stone-200 p-3">
                  <p className="text-sm font-semibold">{brand.name}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-600">{brand.primaryAudience}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
