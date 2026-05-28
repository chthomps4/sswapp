"use client";

import { Clipboard, Play, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import type { PromptRegistryEntry } from "@/lib/prompts/promptTypes";

type RenderResponse = {
  finalPrompt?: string;
  promptKey?: string;
  promptVersion?: string;
  variablesUsed?: string[];
  missingVariables?: string[];
  error?: string;
};

export function PromptPreviewWorkbench({
  prompts,
  samples,
}: {
  prompts: PromptRegistryEntry[];
  samples: Record<string, Record<string, unknown>>;
}) {
  const [promptKey, setPromptKey] = useState(prompts[0]?.key || "daily-content-pack");
  const [variablesJson, setVariablesJson] = useState(JSON.stringify(samples[promptKey] || {}, null, 2));
  const [result, setResult] = useState<RenderResponse | null>(null);
  const [includeSystemGuardrails, setIncludeSystemGuardrails] = useState(true);
  const [includePrivacyRules, setIncludePrivacyRules] = useState(true);
  const [includeOutputRules, setIncludeOutputRules] = useState(true);
  const [improvementNote, setImprovementNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<Record<string, string[]>>(() => {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem("sswapp-prompt-improvement-notes");
    if (!stored) return {};
    try {
      return JSON.parse(stored) as Record<string, string[]>;
    } catch {
      return {};
    }
  });
  const selected = useMemo(() => prompts.find((prompt) => prompt.key === promptKey), [promptKey, prompts]);

  function loadSample(nextKey = promptKey) {
    setVariablesJson(JSON.stringify(samples[nextKey] || {}, null, 2));
    setResult(null);
  }

  async function renderSelectedPrompt() {
    const response = await fetch("/api/prompts/render", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        promptKey,
        variables: JSON.parse(variablesJson),
        includeSystemGuardrails,
        includePrivacyRules,
        includeOutputRules,
      }),
    });
    setResult((await response.json()) as RenderResponse);
  }

  function changePrompt(nextKey: string) {
    setPromptKey(nextKey);
    loadSample(nextKey);
  }

  function copyPrompt() {
    if (result?.finalPrompt) void navigator.clipboard.writeText(result.finalPrompt);
  }

  function saveImprovementNote() {
    if (!improvementNote.trim()) return;
    const next = { ...savedNotes, [promptKey]: [...(savedNotes[promptKey] || []), improvementNote.trim()] };
    setSavedNotes(next);
    window.localStorage.setItem("sswapp-prompt-improvement-notes", JSON.stringify(next));
    setImprovementNote("");
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <label className="grid gap-1 text-sm font-medium">
          Prompt
          <select value={promptKey} onChange={(event) => changePrompt(event.target.value)} className="rounded-md border border-stone-200 px-3 py-2 text-sm font-normal">
            {prompts.map((prompt) => (
              <option key={prompt.key} value={prompt.key}>
                {prompt.key}
              </option>
            ))}
          </select>
        </label>
        {selected ? (
          <div className="mt-4 rounded-md border border-stone-200 p-3 text-sm">
            <p className="font-semibold">{selected.title}</p>
            <p className="mt-1 text-xs leading-5 text-stone-600">{selected.description}</p>
            <dl className="mt-3 grid gap-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-stone-500">Version</dt>
                <dd>{selected.version}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-stone-500">Privacy</dt>
                <dd className="text-right">{selected.privacyLevel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-stone-500">Output</dt>
                <dd>{selected.outputMode}</dd>
              </div>
            </dl>
          </div>
        ) : null}
        <div className="mt-4 grid gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={includeSystemGuardrails} onChange={(event) => setIncludeSystemGuardrails(event.target.checked)} />
            Brand guardrails
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={includePrivacyRules} onChange={(event) => setIncludePrivacyRules(event.target.checked)} />
            Privacy rules
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={includeOutputRules} onChange={(event) => setIncludeOutputRules(event.target.checked)} />
            Output rules
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={renderSelectedPrompt} className="inline-flex items-center gap-2 rounded-md bg-[#1e6b4d] px-3 py-2 text-sm font-medium text-white">
            <Play size={15} />
            Render
          </button>
          <button type="button" onClick={() => loadSample()} className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800">
            <RotateCcw size={15} />
            Load sample
          </button>
        </div>
        <div className="mt-4 rounded-md border border-stone-200 p-3">
          <label className="text-sm font-semibold" htmlFor="prompt-note">
            Improvement note
          </label>
          <textarea
            id="prompt-note"
            value={improvementNote}
            onChange={(event) => setImprovementNote(event.target.value)}
            className="mt-2 min-h-20 w-full rounded-md border border-stone-200 p-2 text-sm"
            placeholder="too generic, needs stronger local angle, better CTA needed..."
          />
          <button type="button" onClick={saveImprovementNote} className="mt-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium">
            Save note
          </button>
          {savedNotes[promptKey]?.length ? (
            <ul className="mt-3 space-y-2 text-xs text-stone-600">
              {savedNotes[promptKey].map((note, index) => (
                <li key={`${note}-${index}`} className="rounded border border-stone-200 bg-stone-50 px-2 py-1">
                  {note}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </aside>

      <div className="grid gap-4">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Variables JSON</h2>
            <span className="text-xs text-stone-500">Nested paths like brand.name are supported</span>
          </div>
          <textarea value={variablesJson} onChange={(event) => setVariablesJson(event.target.value)} className="mt-3 min-h-80 w-full rounded-md border border-stone-200 p-3 font-mono text-xs leading-5" />
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Rendered Prompt</h2>
            <button type="button" onClick={copyPrompt} disabled={!result?.finalPrompt} className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm disabled:opacity-50">
              <Clipboard size={15} />
              Copy
            </button>
          </div>
          {result?.error ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{result.error}</p> : null}
          {result?.missingVariables?.length ? <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Missing: {result.missingVariables.join(", ")}</p> : null}
          <pre className="mt-3 max-h-[560px] overflow-auto whitespace-pre-wrap rounded-md bg-stone-950 p-4 text-xs leading-5 text-stone-100">{result?.finalPrompt || "Render a prompt to preview it here."}</pre>
        </div>
      </div>
    </section>
  );
}
