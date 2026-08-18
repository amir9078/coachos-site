#!/usr/bin/env node
/** Apply research-voices.json to service-catalog.json (all matching keys). */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { baseServiceSlug, resolveCatalogKey } from './service-slug-utils.mjs';

const ROOT = process.cwd();
const voices = JSON.parse(readFileSync(join(ROOT, 'content/research-voices.json'), 'utf8'));
const catalog = JSON.parse(readFileSync(join(ROOT, 'data/service-catalog.json'), 'utf8'));

function patchEntry(entry, voice) {
  if (voice.genericH1) entry.genericH1 = voice.genericH1;
  if (voice.genericSub) entry.genericSub = voice.genericSub;
  if (voice.genericProblem) entry.genericProblem = voice.genericProblem;
  if (voice.voice) entry.voice = voice.voice;
}

let patched = 0;
const seen = new Set();

for (const [voiceKey, voice] of Object.entries(voices.services)) {
  const resolved = resolveCatalogKey(voiceKey, catalog.services);
  if (!resolved) {
    console.warn(`No catalog entry for research voice key: ${voiceKey}`);
    continue;
  }
  patchEntry(catalog.services[resolved], voice);
  seen.add(resolved);
  patched++;
}

for (const [catKey, entry] of Object.entries(catalog.services)) {
  if (catKey === 'defaultTemplate' || seen.has(catKey)) continue;
  const base = baseServiceSlug(catKey);
  const rootVoice = voices.services[base];
  if (rootVoice) {
    patchEntry(entry, rootVoice);
    patched++;
  }
}

writeFileSync(join(ROOT, 'data/service-catalog.json'), JSON.stringify(catalog));
console.log(`Patched ${patched} catalog entries from research-voices.json`);
