export type PromptCategory =
  | "generation"
  | "image"
  | "approval"
  | "analytics"
  | "research"
  | "repurposing"
  | "campaign"
  | "quality-control";

export type PrivacyLevel =
  | "public_context_only"
  | "private_business_context"
  | "sanitized_metrics_only"
  | "raw_private_data_blocked"
  | "raw_private_data_allowed_with_feature_flag";

export type OutputMode = "json" | "markdown" | "csv" | "plain_text";

export type ParseStrategy = "json" | "markdown" | "csv" | "plain_text";

export type PromptRegistryEntry = {
  key: string;
  filename: string;
  title: string;
  description: string;
  category: PromptCategory;
  version: string;
  requiredVariables: string[];
  optionalVariables: string[];
  outputMode: OutputMode;
  recommendedModel: string;
  privacyLevel: PrivacyLevel;
  parseStrategy: ParseStrategy;
};

export type PromptRenderInput = {
  promptKey: string;
  variables: Record<string, unknown>;
  includeSystemGuardrails?: boolean;
  includePrivacyRules?: boolean;
  includeOutputRules?: boolean;
};

export type PromptRenderResult = {
  finalPrompt: string;
  promptKey: string;
  promptVersion: string;
  variablesUsed: string[];
  missingVariables: string[];
  renderedAt: string;
};

export type PromptBrand = {
  id?: string;
  name: string;
  slug: string;
  positioning: string;
  audience: string;
  offerSummary: string;
  voiceGuidelines: string;
  forbiddenPhrases: string[];
  visualStyle: string;
  imageStyleRules?: string[];
  ctaOptions?: string[];
  primaryPlatforms?: string[];
  contentPillars?: string[];
};

export type PromptPlatform = {
  id?: string;
  name: string;
  slug: string;
  bestUseCase: string;
  characterLimit?: number;
  supportsHashtags: boolean;
  supportsAltText: boolean;
  supportsCarousel: boolean;
  supportsVideo: boolean;
  platformVoiceRules?: string;
};

export type PromptCampaign = {
  id?: string;
  name: string;
  slug: string;
  objective: string;
  offer: string;
  primaryCTA: string;
  startDate?: string;
  endDate?: string;
  status: string;
};

export type PromptPerformanceContext = {
  dateRange: string;
  topPosts: unknown[];
  weakPosts: unknown[];
  winningPillars: unknown[];
  weakPillars: unknown[];
  winningCTAs: unknown[];
  weakCTAs: unknown[];
  winningImageTypes: unknown[];
  recommendations: string[];
  summaryForPrompt: string;
};
