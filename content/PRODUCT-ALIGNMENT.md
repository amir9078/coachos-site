# CoachOS marketing copy — product alignment

This document maps marketing copy to the CoachOS product repo (`amir9078/coachos`).

## Two layers (do not merge in copy)

| Layer | What it is | Approval loop |
|-------|------------|---------------|
| **Services** | Human-delivered website, marketing, lead follow-up | AI drafts → **CoachOS specialist reviews** → you approve |
| **Platform (Desk)** | Practice OS: leads, Marketing Studio, bookings, agreements, client delivery, etc. | AI / **Practice Agent** drafts → **you approve** → sends from your email |

## Product terms to use on marketing surfaces

- **Tagline (coach / Platform):** You coach. CoachOS runs everything else.
- **Homepage (all fits):** Topline — *The all-in-one solution for your business.* Hero quote — *You don't lose the business on the work you know. You lose it on the work nobody taught you.*
- **Desk** — the core product (not “CRM” alone)
- **Marketing Studio**, **Practice Intelligence**, **Autopilot**, **Daily Briefing**
- **Pipeline Agent** / **Practice Agent** — drafts and pauses; never sends alone
- **Email Connections** — outbound from the coach’s address
- **The Shortlist** — marketing name for **Coach & Mentor Directory** (listing model, **0% commission**)
- **Roundtable** + **Roster** — marketing packaging of **Coach Community**

## What we fixed from the earlier demo

1. Homepage uses all-in-one business tagline (all five fits); coach tagline stays on coach + Platform pages
2. Platform pages no longer claim a specialist reviews every Desk action
3. Desk no longer claims “Done, not suggested” or LinkedIn scraping
4. Marketing Studio copy matches product spec (draft + approve; optional done-for-you on Practice+)
5. Platform rule section uses approval-first language from product docs

## Build

```bash
node scripts/build-content-final.mjs
python3 -m http.server 8082 --directory final
```

Open http://127.0.0.1:8082/

## Voice

See `content/VOICE-GUIDE.md` — headlines stay human and quote-shaped; research stats live in stat strips and the problems citations section, not in hero lines.

## Sources

- Product: `/workspace/coachos-product/` (README, docs/02, docs/06, docs/04)
- Content data: `/workspace/content/*.json`
- Output: `/workspace/final/`
