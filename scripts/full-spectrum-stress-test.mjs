import { spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const steps = [
  ["env sanity", "node", ["scripts/env-sanity.mjs"]],
  ["prisma validate", npm, ["run", "prisma:validate"]],
  ["unit tests", npm, ["test"]],
  ["operational tests", npm, ["run", "test:operational"]],
  ...(process.env.TEST_DATABASE_URL ? [["db integration tests", npm, ["run", "test:integration"]]] : []),
  ["lint", npm, ["run", "lint"]],
  ["typecheck", npm, ["run", "typecheck"]],
  ["build", npm, ["run", "build"]],
];

const results = [];
for (const [name, command, args] of steps) {
  const started = Date.now();
  const result = spawnSync(command, args, { shell: true, stdio: "inherit", env: { ...process.env, DATABASE_URL: name === "db integration tests" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL } });
  results.push({ name, status: result.status === 0 ? "passed" : "failed", durationMs: Date.now() - started });
}

if (process.env.RUN_LOAD_SMOKE === "true") {
  const started = Date.now();
  const result = spawnSync(npm, ["run", "test:load:smoke"], { shell: true, stdio: "inherit" });
  results.push({ name: "load smoke", status: result.status === 0 ? "passed" : "failed", durationMs: Date.now() - started });
}

console.log("\nFull-spectrum stress summary");
console.table(results);
process.exit(results.some((result) => result.status === "failed") ? 1 : 0);
