#!/usr/bin/env node
/** Apply research-voices.json to service-catalog.json (generic + audience slug keys). */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const voices = JSON.parse(readFileSync(join(ROOT, 'content/research-voices.json'), 'utf8'));
const catalog = JSON.parse(readFileSync(join(ROOT, 'data/service-catalog.json'), 'utf8'));

let patched = 0;
for (const [key, voice] of Object.entries(voices.services)) {
  if (!catalog.services[key]) continue;
  Object.assign(catalog.services[key], {
    genericH1: voice.genericH1,
    genericSub: voice.genericSub,
    genericProblem: voice.genericProblem,
  });
  patched++;
}

writeFileSync(join(ROOT, 'data/service-catalog.json'), JSON.stringify(catalog));
console.log(`Patched ${patched} root service entries from research-voices.json`);
