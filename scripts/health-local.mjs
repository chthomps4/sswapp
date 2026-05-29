const baseUrl = process.env.HEALTH_BASE_URL || "http://localhost:3000";

try {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/health`);
  const text = await response.text();
  if (!response.ok) {
    console.error(`Health check failed: ${response.status} ${text}`);
    process.exit(1);
  }
  console.log(text);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Local health check failed.");
  process.exit(1);
}
