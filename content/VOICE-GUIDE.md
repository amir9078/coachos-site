# CoachOS marketing voice

## What we sound like

Plain, warm, direct — like a real product, not a research deck. Numbers are stated as facts. No source footnotes on the public site.

**Five phrases that recur everywhere** (subs and body, not stacked in h1):

1. *DIY works for a week — I don't stick with it*
2. *Expensive and hard to trust*
3. *They had already signed with someone else*
4. *The tech side is fine, but finding clients is tough*
5. *What I'm actually good at*

## Service page heroes (h1 + `.sub`)

Every service page uses the same spine:

1. **h1 — the problem, plain.** Say what's wrong in one sentence anyone in that role recognizes. Name the situation (no plan, Gmail inbox, site offline, slow reply). No metaphors ("ceiling", "forgettable not bad"). No taglines ("Runs while you coach").
2. **sub — the service + what we do.** Start with the service name, then one sentence: *We [verb]…* with concrete deliverables.

Good pair:

- *You never wrote down what the business should do next quarter.*
- *Business strategy and consulting — we audit your practice, write the 90-day plan, and review offers, pricing, and priorities with you every quarter.*

Bad pair:

- *Hit a ceiling nobody at your table can break.* (clever; reader has to decode it)
- *A written 90-day plan…* (deliverable list with no service name; doesn't say who runs it)

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
