// gta6-meme-x-01 entry, v4 — the resume meme: PLAYER ONE, Professional
// Waiter, 13 years of experience waiting for GTA VI.
//
// Runs on Node 22 with the standard library only. Try it locally:
//
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The entry is the X post itself: the house fetches the post named in
// POST.json and hands its first picture plus its text to the judge. This
// program exists only to carry POST.json from the repo into the output
// directory, where the gate picks it up. It validates the URL first, so a
// placeholder or a mistyped address fails loudly here instead of silently
// passing an empty entry to the judge.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function abort(reason: string): never {
  console.error(`v4 entry: ${reason}`);
  process.exit(1);
}

const postPath = join(BOT_DIR, 'POST.json');
if (!existsSync(postPath)) {
  abort(`no POST.json found at ${postPath}; the X post must be named first.`);
}

const raw = readFileSync(postPath, 'utf8');

let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch {
  abort('POST.json is not valid JSON.');
}

const url = (parsed as { url?: unknown }).url;
if (typeof url !== 'string' || !url.startsWith('https://x.com/')) {
  abort('POST.json does not name an X post URL; refusing to publish it.');
}
if (url.includes('PLACEHOLDER')) {
  abort('POST.json still holds the placeholder URL; replace it with the real post.');
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const target = join(OUTPUT_DIR, 'POST.json');
writeFileSync(target, raw);

// Read the published copy back: the gate reads this file, so confirm the
// bytes that landed are exactly the bytes we meant to publish.
if (readFileSync(target, 'utf8') !== raw) {
  abort('published POST.json does not match the source; aborting.');
}

console.log(`Published ${url} to ${target}`);
