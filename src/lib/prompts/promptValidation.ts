import { promptRegistry } from "./promptRegistry";

export function findUnresolvedPlaceholders(template: string) {
  return template.match(/\{\{[^}]+\}\}/g) || [];
}

export function promptAllowsAutoApproval(text: string) {
  return /\b(status|default|mark)\s*[:=]?\s*"?approved"?/i.test(text) || /\bauto-approve\b/i.test(text);
}

export function promptAsksForRawPrivateData(text: string) {
  return /raw private (dashboard )?(rows|data)|send raw private/i.test(text);
}

export function validatePromptRegistryCompleteness() {
  const keys = new Set(promptRegistry.map((entry) => entry.key));
  const duplicateKeys = promptRegistry.map((entry) => entry.key).filter((key, index, list) => list.indexOf(key) !== index);
  return {
    count: promptRegistry.length,
    duplicateKeys,
    hasAllRequiredKeys: [
      "daily-content-pack",
      "brand-selection",
      "platform-post",
      "image-prompt",
      "carousel-outline",
      "short-video-script",
      "reddit-discussion",
      "google-business-profile-post",
      "newsletter-blurb",
      "caption-rewrite",
      "approval-summary",
      "weekly-research-brief",
      "dashboard-analysis",
      "metrics-insight-summary",
      "performance-context-for-generation",
      "repurpose-plan",
      "campaign-plan",
      "site-audit-to-content",
      "monthly-content-map",
      "prompt-quality-check",
    ].every((key) => keys.has(key)),
  };
}
