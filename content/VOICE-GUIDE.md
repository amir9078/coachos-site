# CoachOS marketing voice

## What we sound like

Plain, warm, direct — like a real product, not a research deck. Numbers are stated as facts. No source footnotes on the public site.

**Five phrases that recur everywhere** (subs and body, not stacked in h1):

1. *DIY works for a week — I don't stick with it*
2. *Expensive and hard to trust*
3. *They had already signed with someone else*
4. *The tech side is fine, but finding clients is tough*
5. *What I'm actually good at*

## Headlines (h1 / h1Lines)

- Short. Quote-shaped. Read aloud.
- Felt moment or reframe — not a stat slide.
- Good: *You coach. We run the rest.* · *They signed with someone else.*

## Subheads (hero `.sub`)

- Scene + promise in plain language.
- Stats live in stat strips and problem cards — not in h1.

## Product truth

1. **Services** — AI drafts → specialist reviews → you approve.
2. **Desk** — Practice Agent drafts → you approve; nothing sends alone.
3. **Membership** — chosen, not sold.
4. **Shortlist** — vetted, **0% commission**.
5. Never claim AI coaches clients.

## Desk demo copy

Use real module names: Pipeline Agent, Marketing Studio, Agreements & billing, Client delivery, Autopilot, Voice & Rules, Listmonk sends, Stripe billing.

## Editing workflow

1. Change copy in `content/*.json` or `data/service-catalog.json` (via `research-voices.json` + `node scripts/apply-research-voices.mjs`).
2. `node scripts/build-content-final.mjs --preview`
3. `npm run build:live` to publish root for GitHub Pages.
