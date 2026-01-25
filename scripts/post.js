#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import {
  BlueskyStrategy,
  Client,
  MastodonStrategy,
} from "@humanwhocodes/crosspost";

const metaFile = process.argv[2];
if (!metaFile) {
  console.error("Usage: node post.js <path-to-metadata.json>");
  process.exit(1);
}

const meta = JSON.parse(await readFile(metaFile, "utf8"));

const strategies = [
  new BlueskyStrategy({
    identifier: "dubroy.com",
    password: process.env.BLUESKY_PASSWORD,
    host: "bsky.social",
  }),
  new MastodonStrategy({
    accessToken: process.env.MASTODON_ACCESS_TOKEN,
    host: "hachyderm.io",
  }),
];
const client = new Client({ strategies });

const options = {};
if (meta.image) {
  const imageData = await readFile(resolve(dirname(metaFile), meta.image));
  options.images = [{ data: imageData, alt: meta.alt }];
}
import { inspect } from "node:util";
const dbg = (obj) => (
  console.log(inspect(obj, { depth: null, colors: true })), obj
);

await client.post(meta.text, options);

console.log("Posted successfully!");
