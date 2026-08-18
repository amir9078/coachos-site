#!/usr/bin/env node
/**
 * Publishes the built final/ site to the repo root for GitHub Pages.
 * Strips preview-only banner markup so navigation works everywhere.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const FINAL_ROOT = join(ROOT, 'final');

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkHtml(path, acc);
    else if (name.endsWith('.html')) acc.push(path);
  }
  return acc;
}

function stripPreviewBanner(html) {
  return html
    .replace(/<style>body\{padding-top:44px!important\}#content-final-banner a:hover\{text-decoration:underline\}<\/style>/g, '')
    .replace(
      /<div id="content-final-banner"[^>]*>[\s\S]*?<\/div>/g,
      ''
    );
}

function publishHtml(fromPath) {
  const rel = relative(FINAL_ROOT, fromPath);
  const dest = join(ROOT, rel);
  mkdirSync(dirname(dest), { recursive: true });
  const cleaned = stripPreviewBanner(readFileSync(fromPath, 'utf8'));
  writeFileSync(dest, cleaned, 'utf8');
  return rel;
}

console.log('Applying research voices…');
run('node', ['scripts/apply-research-voices.mjs']);

console.log('Building final/ (no preview banner)…');
run('node', ['scripts/build-content-final.mjs']);

if (!existsSync(FINAL_ROOT)) {
  console.error('final/ missing after build');
  process.exit(1);
}

const files = walkHtml(FINAL_ROOT);
const published = files.map(publishHtml);

writeFileSync(join(ROOT, '.nojekyll'), '\n');
console.log(`Published ${published.length} HTML files to repo root`);
console.log('Live URL: https://amir9078.github.io/coachos-site/');
