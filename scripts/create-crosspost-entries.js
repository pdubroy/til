#!/usr/bin/env node
// Creates .crosspost/*.json entries for new TIL posts after 2026-01-25.

import { existsSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "node:fs";

const verbose = process.argv.includes("--verbose");
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const crosspostDir = join(repoRoot, ".crosspost");

const mdFiles = globSync("**/*.md", { cwd: repoRoot })
  .filter((f) => !f.startsWith("node_modules/"))
  .sort();

for (const relpath of mdFiles) {
  const filename = basename(relpath, ".md");
  const date = filename.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    if (verbose) console.log(`Skipping ${relpath} (no date in filename)`);
    continue;
  }
  if (date < "2026-01-26") {
    if (verbose)
      console.log(`Skipping ${relpath} (date ${date} <= 2026-01-25)`);
    continue;
  }

  const jsonFile = join(crosspostDir, `${filename}.json`);
  if (existsSync(jsonFile)) {
    if (verbose)
      console.log(`Skipping ${relpath} (already has crosspost entry)`);
    continue;
  }

  const title = filename.slice(11).replaceAll("-", " ");
  const text = `TIL: ${title}\n→ https://github.com/pdubroy/til/blob/main/${relpath}`;

  writeFileSync(
    jsonFile,
    JSON.stringify({ text, image: `${filename}.png`, alt: "" }, null, 2) + "\n",
  );
  console.log(`Created ${jsonFile}`);
}
