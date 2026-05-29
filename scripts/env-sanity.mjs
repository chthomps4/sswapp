const status = {
  databaseConfigured: Boolean(process.env.DATABASE_URL),
  clerkConfigured: Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
  ownerEmailsConfigured: Boolean(process.env.OWNER_EMAILS),
  openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
  autoApproval: process.env.ENABLE_AUTO_APPROVAL === "true",
  autoPublishing: process.env.ENABLE_AUTO_PUBLISHING === "true",
  aiMetricAnalysisEnabled: process.env.ENABLE_AI_METRIC_ANALYSIS === "true",
};

console.log(JSON.stringify(status, null, 2));

if (status.autoApproval || status.autoPublishing) {
  console.error("Unsafe automation flags are enabled.");
  process.exit(1);
}
