"use client";

import { AlertCircle, CheckCircle2, FileUp, Rows3, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { SocialDashboardImportRecord } from "@/lib/social-dashboard-engine";
import type { Brand, Platform } from "@/lib/types";

const sampleCsv = [
  "Platform,Brand,Account,Post URL,Date,Caption,Content Type,Reach,Impressions,Likes,Comments,Shares,Saves,Link Clicks,Profile Visits,Leads,Quote Requests",
  "LinkedIn,signal-workshop,Signal Workshop LinkedIn Page,https://linkedin.com/posts/signal-1,2026-05-28,Good work deserves a better signal.,text,620,800,31,6,4,8,12,15,2,0",
  "Instagram,local-signal-websites,Local Signal Websites Instagram,https://instagram.com/p/local-1,2026-05-28,A local website should answer four questions fast.,carousel,480,650,28,5,7,18,9,22,1,0",
  "Facebook,al-brothers,AL Brothers LLC Facebook Page,https://facebook.com/albrothers/posts/1,2026-05-28,A punch list is not just a list of small things.,photo,710,900,34,8,5,2,6,18,0,3",
].join("\n");

export function SocialImportWorkbench({ brands, platforms }: { brands: Brand[]; platforms: Platform[] }) {
  const [brandSlug, setBrandSlug] = useState("signal-workshop");
  const [platformSlug, setPlatformSlug] = useState("facebook");
  const [content, setContent] = useState(sampleCsv);
  const [filename, setFilename] = useState("generic-social-metrics.csv");
  const [preview, setPreview] = useState<SocialDashboardImportRecord | null>(null);
  const [status, setStatus] = useState("Paste CSV or choose a file, then preview before import.");
  const visibleHeaders = useMemo(() => preview?.rawColumnHeaders.slice(0, 8) || [], [preview]);

  async function parseImport(nextContent = content, nextFilename = filename) {
    setStatus("Parsing dashboard export...");
    const response = await fetch("/api/social/imports/parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        content: nextContent,
        filename: nextFilename,
        method: "pasted_table",
        brandSlug,
        platformSlug,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.message || "Import preview failed.");
      return;
    }
    setPreview(data.preview);
    setStatus("Preview ready. Review mapping, validation, and matches before confirming.");
  }

  async function confirmImport() {
    if (!preview) return;
    setStatus("Confirming import and generating insights...");
    const response = await fetch(`/api/social/imports/${preview.id}/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ preview }),
    });
    const data = await response.json();
    setStatus(response.ok ? `Imported ${data.snapshots?.length || 0} metric snapshots and created ${data.insights?.length || 0} insights.` : data.message || "Confirm failed.");
  }

  async function onFileChange(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    setFilename(file.name);
    setContent(text);
    await parseImport(text, file.name);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">New Social Import</h2>
            <p className="text-sm text-stone-600">CSV upload or pasted dashboard table. Nothing is public, and nothing is sent to AI.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium hover:border-emerald-300">
            <FileUp size={16} />
            Upload CSV
            <input className="hidden" type="file" accept=".csv,text/csv,text/plain" onChange={(event) => void onFileChange(event.target.files?.[0])} />
          </label>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select value={brandSlug} onChange={(event) => setBrandSlug(event.target.value)} className="rounded-md border border-stone-200 px-3 py-2 text-sm">
            {brands.map((brand) => (
              <option key={brand.slug} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
          <select value={platformSlug} onChange={(event) => setPlatformSlug(event.target.value)} className="rounded-md border border-stone-200 px-3 py-2 text-sm">
            {platforms.map((platform) => (
              <option key={platform.slug} value={platform.slug}>
                {platform.name}
              </option>
            ))}
          </select>
          <input value={filename} onChange={(event) => setFilename(event.target.value)} className="rounded-md border border-stone-200 px-3 py-2 text-sm" />
        </div>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="mt-3 min-h-56 w-full rounded-md border border-stone-200 px-3 py-2 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => void parseImport()} className="inline-flex items-center gap-2 rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
            <Rows3 size={16} />
            Preview Mapping
          </button>
          <button
            type="button"
            disabled={!preview}
            onClick={() => void confirmImport()}
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
            Confirm Import
          </button>
        </div>
        <p className="mt-3 text-sm text-stone-600">{status}</p>
      </section>

      <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Mapping Preview</h2>
        {preview ? (
          <div className="mt-4 space-y-3 text-sm">
            <p>
              <span className="font-medium">Detected:</span> {preview.detectedPlatform}
            </p>
            <p>
              <span className="font-medium">Template:</span> {preview.mappingTemplateId}
            </p>
            <p>
              <span className="font-medium">Rows:</span> {preview.rowCount}
            </p>
            <p>
              <span className="font-medium">Date range:</span> {preview.detectedDateRangeStart || "unknown"} to {preview.detectedDateRangeEnd || "unknown"}
            </p>
            <div>
              <p className="font-medium">Headers</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {visibleHeaders.map((header) => (
                  <span key={header} className="rounded border border-stone-200 bg-stone-50 px-2 py-1 text-xs">
                    {header}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-stone-600">Preview will show platform detection, mapping template, headers, validation, and post matches.</p>
        )}
      </aside>

      {preview ? (
        <section className="xl:col-span-2 rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 p-4">
            <h2 className="text-lg font-semibold">First 20 Rows</h2>
            <p className="text-sm text-stone-600">Warnings can still import. Invalid and duplicate rows are held back.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Posted</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Caption</th>
                  <th className="px-4 py-3">Match</th>
                  <th className="px-4 py-3">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {preview.previewRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-mono text-xs">{row.rowIndex}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded border border-stone-200 px-2 py-1 text-xs">
                        {row.validationStatus === "invalid" ? <AlertCircle size={12} /> : <Sparkles size={12} />}
                        {row.validationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.normalizedJson?.postedAt}</td>
                    <td className="px-4 py-3">{row.normalizedJson?.platform}</td>
                    <td className="max-w-md px-4 py-3">{row.normalizedJson?.caption || row.normalizedJson?.title}</td>
                    <td className="px-4 py-3">{row.matchedPostDraftId ? "PostDraft" : "Create SocialPost"}</td>
                    <td className="px-4 py-3 text-xs text-stone-500">{row.validationErrors.join(" ") || "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
