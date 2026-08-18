# AGENTS.md

## Cursor Cloud specific instructions

### Preview the final site (research-aligned copy)

The **final** site is generated — do not edit HTML in `final/` directly. Edit `content/*.json` and `data/service-catalog.json`, then rebuild:

```bash
node scripts/apply-research-voices.mjs
node scripts/build-content-final.mjs --preview
```

### Publish to GitHub Pages (live site)

GitHub Pages serves the **repo root** on `main`. To ship research-aligned copy:

```bash
npm run build:live
# or: node scripts/publish-live.mjs
git add -A '*.html' .nojekyll
git commit -m "Publish research-aligned site to root"
git push origin main
```

Live URL: https://amir9078.github.io/coachos-site/

The preview banner (localhost links) only appears when building with `--preview` for port **8082**. Published root HTML has no banner.

**Preview URLs** (servers start automatically via `.cursor/environment.json`):

| Port | What |
|------|------|
| **8082** | **Final site** — `final/` (use this for copy review) |
| 8080 | Original site — repo root |

Examples:

- http://127.0.0.1:8082/problems.html
- http://127.0.0.1:8082/coach/index.html
- http://127.0.0.1:8082/desk/index.html

If you see `ERR_CONNECTION_REFUSED` on 8082, the final preview server is not running. Start it manually:

```bash
python3 -m http.server 8082 --bind 0.0.0.0 --directory final
```

In Cursor Desktop, open the **Ports** panel and forward port **8082** if you are viewing from your local browser.

### Copy system

- Source of truth: `content/research-voices.json` + `content/root-pages.json` + `content/audience-services-pages.json` + `content/problems-pages.json` + `content/roundtable-feed.json` + `content/roster-feed.json` + audience/platform/taglines JSON
- Voice rules: `content/VOICE-GUIDE.md`
- Research PDF: `content/CoachOS-Market-Research-Report.pdf`
- Service pages: build resolves HTML slugs via `scripts/service-slug-utils.mjs` (e.g. `business-strategy-and-consulting` → catalog key). Heroes use **problem `genericH1` + solution `genericSub`** — never `defaultTemplate` “Runs while you…”.
- Roundtable/Roster demo feeds: canonical post bodies live in `content/roundtable-feed.json` and `content/roster-feed.json` (extract from `roundtable/index.html` / `roster/index.html` with `node scripts/extract-platform-posts.mjs`). Build injects them word-for-word into every roundtable/roster HTML copy.
