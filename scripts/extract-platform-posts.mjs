#!/usr/bin/env node
/** Extract canonical Roundtable / Roster inline feed data to content/*.json */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

function extractBetween(html, start, endRe) {
  const i = html.indexOf(start);
  if (i < 0) throw new Error(`Missing marker: ${start}`);
  const rest = html.slice(i + start.length);
  const m = rest.match(endRe);
  if (!m) throw new Error(`Missing end after: ${start}`);
  return rest.slice(0, m.index);
}

const rt = readFileSync(join(ROOT, 'roundtable/index.html'), 'utf8');
const S = extractBetween(rt, 'var S = ', /\n\s*var GROUPS/);
const GROUPS = extractBetween(rt, 'var GROUPS = ', /\n\s*var sideEl/);

const rs = readFileSync(join(ROOT, 'roster/index.html'), 'utf8');
const AV = extractBetween(rs, 'var AV = ', /\n\s*var P = /);
const P = extractBetween(rs, 'var P = ', /\n\s*var tabsEl/);

const coachRs = readFileSync(join(ROOT, 'coach/roster.html'), 'utf8');
const EXTRA = extractBetween(coachRs, 'var EXTRA = ', /\n\s*var ANON/);
const ANON = extractBetween(coachRs, 'var ANON = ', /\n\s*function anonHtml/);

writeFileSync(join(ROOT, 'content/roundtable-feed.json'), JSON.stringify({ S, GROUPS }, null, 2));
writeFileSync(
  join(ROOT, 'content/roster-feed.json'),
  JSON.stringify({ AV, P, EXTRA, ANON }, null, 2)
);

console.log('Wrote content/roundtable-feed.json and content/roster-feed.json');
console.log(`  Roundtable S: ${S.length} chars, GROUPS: ${GROUPS.length} chars`);
console.log(`  Roster AV: ${AV.length}, P: ${P.length}, EXTRA: ${EXTRA.length}, ANON: ${ANON.length}`);
