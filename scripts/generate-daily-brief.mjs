// Generates one dated entry in news.html by asking Claude to search the web for a
// few genuinely recent, relevant items and summarize them. Run by
// .github/workflows/daily-brief.yml on a daily schedule. Requires ANTHROPIC_API_KEY.
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const newsPath = path.join(__dirname, '..', 'news.html');

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

const html = readFileSync(newsPath, 'utf8');

if (html.includes(`data-date="${today}"`)) {
  console.log(`Brief for ${today} already published — skipping.`);
  process.exit(0);
}

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const SYSTEM = `You write a short, grounded daily brief for CoachOS's public "News" page, read by coaches, mentors, freelancers, and service-business owners. Tone: plain, non-hype, practical — the opposite of clickbait. Never fabricate a statistic or event. Every item must be based on something you actually found via web search, with a real source URL you can point to.`;

const USER = `Search the web for 2-3 genuinely recent (last 2-3 days) developments relevant to: AI agents for small businesses, running a coaching/mentoring/freelance practice, or the coaching industry generally. Summarize each in 2-3 plain sentences aimed at a busy solo practitioner, not a technical audience.

Respond with ONLY raw JSON — no markdown code fences, no commentary before or after — in exactly this shape:
{"items":[{"headline":"...","summary":"...","source_url":"..."}]}`;

const response = await client.messages.create({
  model: 'claude-opus-4-8',
  max_tokens: 4096,
  system: SYSTEM,
  tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 4 }],
  messages: [{ role: 'user', content: USER }],
});

const textBlock = response.content.find((b) => b.type === 'text');
if (!textBlock) {
  console.error('No text block in the model response — aborting without publishing.');
  process.exit(1);
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through to null */
      }
    }
  }
  return null;
}

const parsed = extractJson(textBlock.text);
if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) {
  console.error('Could not parse a valid brief from the model response — aborting without publishing.');
  console.error(textBlock.text);
  process.exit(1);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const itemsHtml = parsed.items
  .map(
    (item) => `
    <div class="brief-item">
      <h3>${escapeHtml(item.headline)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <a class="brief-source" href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener noreferrer">Source →</a>
    </div>`
  )
  .join('\n');

const dateLabel = new Date(`${today}T00:00:00Z`).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

const articleHtml = `
  <article class="brief-day" data-date="${today}">
    <span class="kicker">${dateLabel}</span>
    ${itemsHtml}
  </article>
`;

const marker = '<!-- NEWS-ITEMS -->';
if (!html.includes(marker)) {
  console.error(`Marker "${marker}" not found in news.html — aborting.`);
  process.exit(1);
}

const updated = html.replace(marker, marker + articleHtml);
writeFileSync(newsPath, updated, 'utf8');
console.log(`Published brief for ${today} with ${parsed.items.length} item(s).`);
