#!/usr/bin/env node

// Convert the contents of the clipboard (aka "paste buffer" on macOS) to JSON.
// Usage: `node scripts/pb2json.js | pbcopy`

import { execSync } from "child_process";

const alt = execSync("pbpaste", { encoding: "utf8" }).trim();
console.log(JSON.stringify(alt));
