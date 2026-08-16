# CoachOS marketing voice

Based on **CoachOS Market Research & Brand Strategy** (August 16, 2026). Source data: `content/research-voices.json`.

## What we sound like

Plain, warm, direct — the market's own words, lightly edited. Not corpo-speak. Not stat-stacked headlines.

**Five phrases that recur everywhere** (use in subs and body, not all at once in h1):

1. *DIY works for a week — I don't stick with it*
2. *Expensive and hard to trust*
3. *They had already signed with someone else*
4. *The tech side is fine, but finding clients is tough*
5. *What I'm actually good at*

The **homepage owns #4** (*You lose it on the work nobody taught you.*). Other pages speak #1, #2, #3, and #5 in their register.

## Headlines (h1 / h1Lines)

- Short. Quote-shaped. Read aloud.
- **Felt moment or reframe** — not a research slide.
- Good: *You coach. We run the rest.* · *They signed with someone else.* · *DIY works for a week.*
- Bad: *54% manage marketing alone. 63% cite irregular income.*

## Subheads (hero `.sub`)

- Scene + promise in plain language.
- One research phrase is enough.
- Stats → stat strips, problems citations, body copy.

## Where numbers live

| Place | Role |
|-------|------|
| Audience **stat strip** | ICF, BrightLocal, MIT speed-to-lead, etc. |
| **problems.html** citations | Full research table (Part III) |
| Service **genericProblem** | Can cite one number when it's the story (e.g. Friday→Monday) |
| **Hero h1** | Almost never |

## Product truth

1. **Services** — AI drafts → specialist reviews → you approve.
2. **Desk** — Practice Agent drafts → you approve; nothing sends alone.
3. **Membership** — chosen, not sold.
4. **Shortlist** — vetted, **0% commission**.
5. Never claim AI coaches clients or full GA before it's true.

## Homepage vs coach door

- **Home:** universal all-in-one + untaught-work quote.
- **Coach door / Platform:** *You coach. CoachOS runs everything else.*

## Editing workflow

1. Change copy in `content/*.json` or `data/service-catalog.json` (via `research-voices.json` + `node scripts/apply-research-voices.mjs`).
2. `node scripts/build-content-final.mjs`
3. Preview `final/` on port 8082.
