const baseUrl = (process.env.LOAD_TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const vus = Math.max(1, Number(process.env.LOAD_TEST_VUS || 2));
const durationMs = Math.max(1000, Number(process.env.LOAD_TEST_DURATION_MS || 5000));
const authToken = process.env.LOAD_TEST_AUTH_TOKEN || "";
const enableWrites = process.env.ENABLE_WRITE_LOAD_TESTS === "true";
const endpoints = ["/api/health"];

if (enableWrites) {
  endpoints.push("/api/workflow-audits/run");
}

const started = Date.now();
const timings = [];
let requests = 0;
let failures = 0;

async function hit(endpoint) {
  const isWrite = endpoint.includes("/run");
  const before = performance.now();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: isWrite ? "POST" : "GET",
    headers: {
      ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
      ...(isWrite ? { "content-type": "application/json" } : {}),
    },
    body: isWrite ? JSON.stringify({ dryRun: true }) : undefined,
  });
  timings.push(performance.now() - before);
  requests += 1;
  if (!response.ok && response.status !== 401 && response.status !== 403) failures += 1;
}

await Promise.all(
  Array.from({ length: vus }, async (_, vu) => {
    while (Date.now() - started < durationMs) {
      const endpoint = endpoints[vu % endpoints.length];
      try {
        await hit(endpoint);
      } catch {
        failures += 1;
      }
    }
  }),
);

timings.sort((a, b) => a - b);
const percentile = (p) => timings[Math.min(timings.length - 1, Math.floor(timings.length * p))] || 0;
const errorRate = requests ? failures / requests : 1;

const result = {
  baseUrl,
  vus,
  durationMs,
  requests,
  failures,
  errorRate,
  p95Ms: Math.round(percentile(0.95)),
  p99Ms: Math.round(percentile(0.99)),
  writesEnabled: enableWrites,
};

console.log(JSON.stringify(result, null, 2));
if (errorRate > 0.01) process.exit(1);
