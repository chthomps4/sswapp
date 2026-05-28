import { spawnSync } from "node:child_process";
import { prismaEnv } from "./prisma-env.mjs";

const env = prismaEnv();

const generate = spawnSync("npx", ["prisma", "generate"], {
  env,
  shell: true,
  stdio: "inherit",
});

if (generate.status !== 0) process.exit(generate.status ?? 1);

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  env,
  shell: true,
  stdio: "inherit",
});

process.exit(tsc.status ?? 1);
