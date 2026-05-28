import { AutomationRecipesWorkbench } from "@/components/automation-recipes-workbench";
import { ContentPageShell } from "@/components/content-page-shell";
import { automationRecipes } from "@/lib/automation-recipes";

export default function AutomationRecipesPage() {
  return (
    <ContentPageShell
      eyebrow="Automation"
      title="Automation Recipes"
      description="Editable-style recipe configs for manual internal workflows. These are seeded as safe manual triggers with auto-publishing disabled."
    >
      <AutomationRecipesWorkbench recipes={automationRecipes} />
    </ContentPageShell>
  );
}
