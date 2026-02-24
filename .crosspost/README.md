# Crossposting

Posts TIL entries to Bluesky and Mastodon.

## How it works

1. Run `./scripts/publish.sh`
2. `create-crosspost-entries.js` finds the oldest post (after 2026-01-25) without a `.crosspost/*.json` file and creates one
3. You edit the JSON (text, image, alt text) then press Enter
4. `post.js` posts it to Bluesky + Mastodon via `@humanwhocodes/crosspost`

## Skipping a post

Create a placeholder JSON file for it, e.g. `{"skip": true}`. The script only checks if the file exists.

## Environment variables

- `BLUESKY_PASSWORD`
- `MASTODON_ACCESS_TOKEN`
