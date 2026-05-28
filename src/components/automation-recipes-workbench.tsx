"use client";

import { Play, Save } from "lucide-react";
import { useState } from "react";
import type { AutomationRecipeConfig } from "@/lib/automation-recipes";

type RecipeRunSummary = {
  recipeSlug?: string;
  message?: string;
  automationRun?: { id: string; type: string; status: string };
  error?: string;
};

export function AutomationRecipesWorkbench({ recipes }: { recipes: AutomationRecipeConfig[] }) {
  const [selectedSlug, setSelectedSlug] = useState(recipes[0]?.slug || "");
  const [localRecipes, setLocalRecipes] = useState(recipes);
  const [draftSteps, setDraftSteps] = useState(JSON.stringify(recipes[0]?.stepsJson || [], null, 2));
  const [runResult, setRunResult] = useState<RecipeRunSummary | null>(null);
  const selectedRecipe = localRecipes.find((recipe) => recipe.slug === selectedSlug) || localRecipes[0];

  function selectRecipe(slug: string) {
    const next = localRecipes.find((recipe) => recipe.slug === slug);
    setSelectedSlug(slug);
    setDraftSteps(JSON.stringify(next?.stepsJson || [], null, 2));
    setRunResult(null);
  }

  function saveLocalSteps() {
    const steps = JSON.parse(draftSteps) as string[];
    setLocalRecipes((current) => current.map((recipe) => (recipe.slug === selectedSlug ? { ...recipe, stepsJson: steps } : recipe)));
  }

  function toggleActive() {
    setLocalRecipes((current) => current.map((recipe) => (recipe.slug === selectedSlug ? { ...recipe, active: !recipe.active } : recipe)));
  }

  async function runRecipe() {
    const response = await fetch(`/api/automations/recipes/${selectedSlug}/run`, { method: "POST" });
    setRunResult((await response.json()) as RecipeRunSummary);
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Recipes</h2>
        <div className="mt-3 grid gap-2">
          {localRecipes.map((recipe) => (
            <button
              key={recipe.slug}
              type="button"
              onClick={() => selectRecipe(recipe.slug)}
              className={`rounded-md border px-3 py-2 text-left text-sm ${recipe.slug === selectedSlug ? "border-emerald-300 bg-emerald-50" : "border-stone-200 bg-white"}`}
            >
              <span className="font-semibold">{recipe.name}</span>
              <span className="mt-1 block text-xs text-stone-500">{recipe.active ? "Active" : "Paused"} / {recipe.triggerType}</span>
            </button>
          ))}
        </div>
      </aside>

      {selectedRecipe ? (
        <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{selectedRecipe.name}</h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">{selectedRecipe.description}</p>
            </div>
            <span className="w-fit rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs">{selectedRecipe.slug}</span>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="recipe-steps">
                Steps JSON
              </label>
              <textarea id="recipe-steps" value={draftSteps} onChange={(event) => setDraftSteps(event.target.value)} className="mt-2 min-h-72 w-full rounded-md border border-stone-200 p-3 font-mono text-xs leading-5" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={saveLocalSteps} className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium">
                  <Save size={15} />
                  Save local edit
                </button>
                <button type="button" onClick={toggleActive} className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium">
                  {selectedRecipe.active ? "Pause recipe" : "Activate recipe"}
                </button>
                <button type="button" onClick={runRecipe} className="inline-flex items-center gap-2 rounded-md bg-[#1e6b4d] px-3 py-2 text-sm font-medium text-white">
                  <Play size={15} />
                  Run manually
                </button>
              </div>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="rounded-md border border-stone-200 p-3">
                <p className="text-xs font-semibold uppercase text-stone-500">Required inputs</p>
                <p className="mt-2 text-stone-700">{selectedRecipe.requiredInputsJson.join(", ")}</p>
              </div>
              <div className="rounded-md border border-stone-200 p-3">
                <p className="text-xs font-semibold uppercase text-stone-500">Feature flags</p>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-stone-700">{JSON.stringify(selectedRecipe.featureFlagsJson, null, 2)}</pre>
              </div>
              {runResult ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
                  <p className="font-semibold">Run result</p>
                  <p className="mt-1 text-sm">{runResult.message || runResult.error || "Recipe run returned."}</p>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{JSON.stringify(runResult.automationRun || runResult, null, 2)}</pre>
                </div>
              ) : null}
            </div>
          </div>
          <p className="mt-4 text-xs text-stone-500">Local edits are for prompt debugging and workflow tuning in this browser session. The Prisma schema includes persistent AutomationRecipe and AutomationRecipeRun models for database-backed editing when the app moves from seed-backed config to persisted admin settings.</p>
        </article>
      ) : null}
    </section>
  );
}
