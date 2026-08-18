# CoachOS marketing copy — product & research alignment

Maps marketing copy to the **CoachOS product repo** (`amir9078/coachos`) and the **Market Research & Brand Strategy** report (August 16, 2026).

## Research → site map

| Research asset | Site location |
|----------------|---------------|
| Five recurring pains (Part II) | Hero subs, audience problems pages, `research-voices.json` |
| Twelve exhibits | Tone reference; problems page citations (Part III stats) |
| 14 services voice map (Part II-B) | `content/research-voices.json` → `data/service-catalog.json` |
| Five doors (Part II-B) | `content/audience-pages.json` heroes |
| Four platform products (Part II-B) | `content/platform-pages.json` heroes |
| Part III numbers | Audience stat strips, `problems.html` citations |
| Competitor gaps (Part IV-B) | `why.html` short section |

Full PDF: `content/CoachOS-Market-Research-Report.pdf`

## Two layers (do not merge in copy)

| Layer | What it is | Approval loop |
|-------|------------|---------------|
| **Services** | Human-delivered website, marketing, lead follow-up | AI drafts → **CoachOS specialist reviews** → you approve |
| **Platform (Desk)** | Practice OS | **Practice Agent** drafts → **you approve** |

## Product terms

- **Desk** — Practice OS (not “CRM” alone)
- **Marketing Studio**, **Practice Intelligence**, **Autopilot**, **Daily Briefing**
- **The Shortlist** — vetted directory, **0% commission**
- **Roundtable** + **Roster** — Coach Community

## Voice rules

See `content/VOICE-GUIDE.md`. Headlines = human quotes. Stats = strips & citations, not hero dumps.

## Build (final site)

```bash
node scripts/apply-research-voices.mjs   # after editing research-voices.json
node scripts/build-content-final.mjs
python3 -m http.server 8082 --directory final
```

Open http://127.0.0.1:8082/

Output: `/workspace/final/` (177 pages, rebuilt from `content/*.json` + catalog)
