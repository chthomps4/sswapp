import assert from "node:assert/strict";
import test from "node:test";
import { generateDailyPack } from "../src/lib/openai";

test("generation falls back safely without an OpenAI key", async () => {
  const original = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const result = await generateDailyPack({
    theme: "Audience questions as signal",
    brandSlug: "signal-workshop",
  });
  process.env.OPENAI_API_KEY = original;
  assert.equal(result.mode, "fallback");
  assert.ok(result.posts.length >= 5);
  assert.ok(result.error);
});
