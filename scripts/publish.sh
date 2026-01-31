#!/bin/bash
set -euo pipefail

entry=$(node scripts/create-crosspost-entries.js | sed 's/^Created //')

if [ -z "$entry" ]; then
  echo "No new crosspost entry created."
  exit 1
fi

echo ""
echo "Created: $entry"
echo "Edit the crosspost entry, then press Enter to post."
read -r

node scripts/post.js "$entry"
