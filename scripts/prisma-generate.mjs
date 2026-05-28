import { spawnSync } from "node:child_process";
import { prismaEnv } from "./prisma-env.mjs";

const result = spawnSync("npx", ["prisma", "generate"], {
  env: prismaEnv(),
  shell: true,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
