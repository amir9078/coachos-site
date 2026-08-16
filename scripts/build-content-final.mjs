#!/usr/bin/env node
/**
 * Builds final/ — product-aligned marketing copy from content/*.json
 * Sources product terminology from the CoachOS product repo (cloned separately).
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative } from 'node:path';
import * as cheerio from 'cheerio';

const ROOT = process.cwd();
const FINAL_ROOT = join(ROOT, 'final');
const SKIP_DIRS = new Set([
  'demo',
  'final',
  'v2',
  'node_modules',
  '.git',
  'coachos-product',
  'tmp',
  'content',
  'data',
  'scripts',
]);

const globalCopy = JSON.parse(readFileSync(join(ROOT, 'content/global.json'), 'utf8'));
const rootPages = JSON.parse(readFileSync(join(ROOT, 'content/root-pages.json'), 'utf8'));
const platformPages = JSON.parse(readFileSync(join(ROOT, 'content/platform-pages.json'), 'utf8'));
const catalog = JSON.parse(readFileSync(join(ROOT, 'data/service-catalog.json'), 'utf8')).services;
const audiencePages = JSON.parse(readFileSync(join(ROOT, 'content/audience-pages.json'), 'utf8'));
const taglines = JSON.parse(readFileSync(join(ROOT, 'content/taglines.json'), 'utf8'));
const problemsPages = JSON.parse(readFileSync(join(ROOT, 'content/problems-pages.json'), 'utf8'));

function pickAudienceHero(section, audience) {
  const block = taglines[section];
  if (!block) return null;
  if (audience && block[audience]) return block[audience];
  if (block.default) return block.default;
  if (block.h1Lines || block.h1 || block.h1Em) return block;
  return null;
}

const PREVIEW =
  process.argv.includes('--preview') || process.env.PREVIEW_BANNER === '1';

const FINAL_BANNER = `<div id="content-final-banner" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#312e81;color:#fff;font:500 13px/1.4 'IBM Plex Mono',monospace;padding:10px 16px;text-align:center;border-bottom:2px solid #a5b4fc">Preview — research-aligned copy (port 8082). Live site: <a href="https://amir9078.github.io/coachos-site/" style="color:#c7d2fe;margin-left:8px">GitHub Pages</a></div>`;

const FOOTER_TAGLINE = globalCopy.footerTagline;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function syncFinalSite() {
  if (existsSync(FINAL_ROOT)) rmSync(FINAL_ROOT, { recursive: true, force: true });
  mkdirSync(FINAL_ROOT, { recursive: true });

  for (const name of readdirSync(ROOT)) {
    if (SKIP_DIRS.has(name)) continue;
    const src = join(ROOT, name);
    if (statSync(src).isDirectory()) cpSync(src, join(FINAL_ROOT, name), { recursive: true });
    else cpSync(src, join(FINAL_ROOT, name));
  }
  console.log('Synced site copy to final/');
}

function setMeta($, title, desc) {
  if (title) {
    $('title').text(title);
    $('meta[property="og:title"]').attr('content', title);
  }
  if (desc) {
    $('meta[name="description"]').attr('content', desc);
    $('meta[property="og:description"]').attr('content', desc);
  }
}

function addFinalBanner($) {
  if (!PREVIEW) return;
  $('body').prepend(FINAL_BANNER);
  $('head').append(
    '<style>body{padding-top:44px!important}#content-final-banner a:hover{text-decoration:underline}</style>'
  );
}

function setHeroH1($, lines, emOnLast = true) {
  const h1 = $('.pagehero h1, .hero h1').first();
  if (!h1.length || !lines?.length) return;
  if (h1.find('.line').length) {
    h1.empty();
    lines.forEach((line, i) => {
      const isEm = emOnLast && i === lines.length - 1;
      const inner = isEm ? `<em>${esc(line)}</em>` : esc(line);
      h1.append(`<span class="line"><span>${inner}</span></span>`);
    });
  } else if (h1.find('.split-text').length) {
    const accent = lines.length > 1 ? lines.slice(1).join(' ') : '';
    h1.find('.split-text').html(
      `${esc(lines[0])}${accent ? ` <span class="accent">${esc(accent)}</span>` : ''}`
    );
  } else {
    const last = lines[lines.length - 1];
    const rest = lines.slice(0, -1).join(' ');
    h1.html(`${esc(rest)}${rest ? ' ' : ''}<em>${esc(last)}</em>`);
  }
}

function setPageHero($, { label, h1Lines, sub, h1, h1Em }) {
  if (label) {
    const labelEl = $('.pagehero .label.crumb, .hero .topline span').first();
    if (labelEl.find('.status-dot').length) {
      labelEl.html(`<span class="status-dot"></span>${esc(label)}`);
    } else {
      labelEl.text(label);
    }
  }
  if (h1Lines) setHeroH1($, h1Lines);
  else if (h1) {
    const h1el = $('.pagehero h1, .hero h1').first();
    h1el.html(`${esc(h1)}${h1Em ? ` <em>${esc(h1Em)}</em>` : ''}`);
  }
  if (sub) $('.pagehero .sub, .hero-sub').first().text(sub);
}

function updateFooter($) {
  $('.foot > p').first().text(FOOTER_TAGLINE);
}

function rewriteIndex($, c) {
  setMeta($, c.title, c.metaDescription);
  $('.topline span').first().html(`<span class="status-dot"></span>${esc(c.hero.topline)}`);
  setHeroH1($, c.hero.h1Lines);
  $('.hero-sub').text(c.hero.sub);
  $('.hero-ctas .btn-primary').text(c.hero.ctaPrimary);
  $('.hero-ctas .btn-ghost').text(c.hero.ctaSecondary);

  const cards = c.doors.cards;
  $('.show-grid .show').each((i, el) => {
    const card = cards[i];
    if (!card) return;
    $(el).find('.big').text(card.stat);
    $(el).find('.who').text(card.who);
    $(el).find('.body p').text(card.body);
  });

  $('#doors .sec-head h2').html(
    `${esc(c.doors.heading.split('.')[0])}. <em>${esc(c.doors.heading.split('.').slice(1).join('.').trim() || 'Pick yours.')}</em>`
  );
  $('#doors .sec-head .after').text(c.doors.sub);

  const track = $('.marquee .track').first();
  if (track.length && c.marquee) {
    track.empty();
    c.marquee.forEach((item) => track.append(`<span class="item">${esc(item)}</span>`));
  }

  const stages = c.servicesSection.stages;
  $('#services .svc-row').each((i, el) => {
    const st = stages[i];
    if (!st) return;
    $(el).find('h3').html(`${esc(st.num)} &mdash; ${esc(st.title)}`);
    $(el).find('.desc').text(st.desc);
    const chips = $(el).find('.chips');
    chips.empty();
    st.chips.forEach((ch) => chips.append(`<span class="chip">${esc(ch)}</span>`));
  });
  $('#services .sec-head h2').text(c.servicesSection.heading);
  $('#services .sec-head .after').text(c.servicesSection.sub);

  const how = c.howSection;
  $('#how .sec-head h2').text(how.heading);
  $('#how .sec-head .after').text(how.sub);
  $('#how .steps .step').each((i, el) => {
    const step = how.steps[i];
    if (!step) return;
    $(el).find('h3').text(step.title);
    $(el).find('p').text(step.desc);
  });
  if (how.feedNote) $('.feed .fnote').text(how.feedNote);
  rewriteDeskFeed($);

  const close = c.closeSection;
  $('.close-sec .label').last().text(close.label);
  $('.close-sec h2').last().html(`${esc(close.heading)} <em>${esc(close.headingEm)}</em>`);
  $('.close-sec .btn-primary').last().text(close.ctaPrimary);
}

function rewriteAudienceIndex($, data) {
  setMeta($, data.title, data.metaDescription);
  setPageHero($, { label: data.hero.crumb, h1: data.hero.h1, h1Em: data.hero.h1Em, sub: data.hero.sub });

  const strip = $('.stat-strip');
  if (strip.length && data.hero.stats) {
    strip.empty();
    data.hero.stats.forEach((s) => {
      const attrs =
        s.countTo != null
          ? ` data-count-to="${s.countTo}"${s.suffix ? ` data-count-suffix="${s.suffix}"` : ''}`
          : '';
      strip.append(
        `<div><span class="n"${attrs}>${esc(s.value)}</span><span class="l">${esc(s.label)}</span></div>`
      );
    });
    $('.stat-source').remove();
  }

  const ps = data.painsSection;
  $('.sec-tight.alt .sec-head .label').first().text(ps.label);
  $('.sec-tight.alt .sec-head h2').first().text(ps.h2);
  $('.sec-tight.alt .pain').each((i, el) => {
    const p = data.pains[i];
    if (!p) return;
    $(el).find('p').html(`<b>${esc(p.title)}</b> ${esc(p.body)}`);
  });
  $('.sec-tight.alt .reveal').filter('p').first().text(ps.intro);

  const pkgSec = data.packagesSection;
  $('#included .sec-head .label, .sec:not(.sec-tight) .sec-head .label').first().text(pkgSec.label);
  $('#included .sec-head h2, .sec#included .sec-head h2')
    .first()
    .html(`${esc(pkgSec.h2)} <em>${esc(pkgSec.h2Em)}</em>`);
  $('#included .sec-head .after').text(pkgSec.after);
  $('.package').each((i, el) => {
    const p = data.packages[i];
    if (!p) return;
    $(el).find('h3').text(p.title);
    $(el).find('.tag').text(p.tag);
    const ul = $(el).find('ul');
    ul.empty();
    p.bullets.forEach((b) => ul.append(`<li>${esc(b)}</li>`));
  });

  const proofSec = data.proofSection;
  $('.sec-tight.alt').eq(1).find('.sec-head h2').text(proofSec.h2);
  $('.sec-tight.alt').eq(1).find('.step').each((i, el) => {
    const p = data.proof[i];
    if (!p) return;
    $(el).find('h3').text(p.title);
    $(el).find('p').text(p.body);
  });

  const stSec = data.stepsSection;
  $('#steps .sec-head .label').text(stSec.label);
  $('#steps .sec-head h2').html(`${esc(stSec.h2)} <em>${esc(stSec.h2Em)}</em>`);
  $('#steps .sec-head .after').text(stSec.after);
  $('#steps .step').each((i, el) => {
    const s = data.steps[i];
    if (!s) return;
    $(el).find('.n').text(s.n);
    $(el).find('h3').text(s.title);
    $(el).find('p').text(s.body);
  });
  if (stSec.footnote) $('#steps .reveal').last().text(stSec.footnote);

  const rs = data.roomsStrip;
  if (rs) {
    $('.rooms-strip h2').text(rs.h2);
    if (rs.note) $('.rooms-strip .note').text(rs.note);
  }

  const cl = data.close;
  $('.close-sec .label').text(cl.label);
  $('.close-sec h2').html(`${esc(cl.h2)} <em>${esc(cl.h2Em)}</em>`);
  $('.close-sec .btn-primary').text(cl.cta);
}

function serviceKey(relPath) {
  const p = relPath.replace(/\\/g, '/');
  if (p.startsWith('services/')) return p.replace('services/', '').replace('.html', '');
  const m = p.match(/^(coach|business|freelancer|mentor|corporate)\/services\/(.+)\.html$/);
  if (m) return `${m[1]}/${m[2]}`;
  return null;
}

function rewriteServicePage($, relPath) {
  const key = serviceKey(relPath);
  if (!key) return false;
  const entry = catalog[key] || catalog['defaultTemplate'];
  if (!entry) return false;

  const audience = relPath.split('/')[0];
  const variant =
    audience && entry.audienceVariants?.[audience]
      ? entry.audienceVariants[audience]
      : { title: entry.genericTitle, h1: entry.genericH1, sub: entry.genericSub };

  setMeta($, `${variant.title} — CoachOS`, `${variant.sub} ${entry.genericProblem}`);

  const h1 = $('.pagehero h1').first();
  const h1Text = variant.h1.replace(/\.$/, '');
  if (h1.find('em').length) h1.html(`${esc(h1Text)}<em>.</em>`);
  else h1.html(`${esc(h1Text)} <em>.</em>`);
  $('.pagehero .sub').text(variant.sub);

  const probSec = $('.sec-tight.alt');
  if (probSec.length && entry.genericProblem) {
    probSec.find('.sec-head h2').text('Why this service exists');
    probSec.find('.pain p').first().html(esc(entry.genericProblem));
  }

  const incSec = $('.sec').not('.sec-tight').first();
  incSec.find('.sec-head h2').html(`What's included, <em>reviewed by you</em>`);
  incSec.find('.sec-head .after').text(globalCopy.servicesLoop.heading);
  const pains = incSec.find('.pains');
  pains.empty();
  entry.deliverables.forEach((d, i) => {
    const num = String(i + 1).padStart(2, '0');
    pains.append(`<div class="pain reveal"><span class="numeral">${num}</span><p>${esc(d)}</p></div>`);
  });

  const steps = globalCopy.servicesLoop.steps;
  const howHtml = `<section class="sec-tight alt" id="how-coachos"><div class="wrap"><div class="sec-head reveal"><span class="label">How it works</span><h2>Three steps, <em>every time</em></h2><p class="after">${esc(globalCopy.servicesLoop.heading)}</p></div><div class="steps">${steps
    .map(
      (s, i) =>
        `<div class="step reveal"><span class="n">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`
    )
    .join('')}</div></div></section>`;
  $('#how-coachos').remove();
  incSec.after(howHtml);

  return true;
}

function fixGlobalNav($) {
  const label = globalCopy.navProblemsLabel || 'What we fix';
  $('a[href*="problems.html"]').each((_, el) => {
    const text = $(el).text().trim();
    if (/research|full research/i.test(text)) {
      $(el).html(`${label} &rarr;`);
    }
  });
}

function sanitizeProductCopy($) {
  fixGlobalNav($);
  $('.method').remove();
  $('cite').each((_, el) => {
    const t = $(el).text().replace(/\s*·\s*composite account/gi, '').trim();
    $(el).text(t);
  });
  $('.sec-head .after, p, .note, .desc').each((_, el) => {
    const html = $(el).html();
    if (!html) return;
    $(el).html(
      html
        .replace(/from our research/gi, 'from members')
        .replace(/seeded from the same research/gi, 'from peers in the same room')
        .replace(/the research says/gi, 'the numbers say')
        .replace(/Full research on the/gi, 'Every problem on the')
        .replace(/the full research/gi, 'what we fix')
        .replace(/Documented, not invented/gi, 'The pattern')
        .replace(/composite account/gi, '')
    );
  });
  $('title, meta[name="description"], meta[property="og:title"], meta[property="og:description"]').each(
    (_, el) => {
      const attr = el.tagName === 'title' ? 'text' : 'content';
      const val = $(el).attr(attr);
      if (val && /research|composite|documented problems/i.test(val)) {
        $(el).attr(
          attr,
          val
            .replace(/research, sources, and fixes/gi, 'website, marketing, leads, and follow-up')
            .replace(/Documented problems.*?fixes each one\./gi, 'The gaps we fix — mapped to services.')
            .replace(/with research sources and the CoachOS service/gi, 'and the CoachOS service')
        );
      }
    }
  );
}

function renderRootProblemItem(item, prefix = '') {
  const href = prefix + item.serviceHref;
  return `<div class="prob">
        <span class="pstat">${esc(item.stat)}</span>
        <div>
          <h4>${esc(item.title)}</h4>
          <div class="voice">
            <span class="av">${esc(item.avatar)}</span>
            <div class="bubble">
              <blockquote>&ldquo;${esc(item.quote)}&rdquo;</blockquote>
              <cite>${esc(item.role)}</cite>
            </div>
          </div>
          <div class="voice rx">
            <span class="av">&#10003;</span>
            <div class="bubble">
              <p class="after-line">${esc(item.after)} &rarr; <a href="${href}">${esc(item.service)}</a></p>
            </div>
          </div>
        </div>
      </div>`;
}

function renderAudienceProblemItem(item, prefix = '') {
  const href = prefix + (item.serviceHrefAudience || item.serviceHref || 'services.html');
  return `<div class="prob">
        <span class="pstat">${esc(item.stat)}</span>
        <div>
          <h4>${esc(item.title)}</h4>
          <div class="voice">
            <span class="av">${esc(item.avatar)}</span>
            <div class="bubble">
              <blockquote>&ldquo;${esc(item.quote)}&rdquo;</blockquote>
              <cite>${esc(item.role)}</cite>
            </div>
          </div>
          <p class="ans"><b>The answer</b>${esc(item.after)} &rarr; <a href="${href}">${esc(item.service)}</a></p>
        </div>
      </div>`;
}

function renderProblemsCategories(categories, prefix = '', audience = null) {
  return categories
    .map((cat) => {
      const items = audience
        ? cat.items.filter((it) => it.audiences?.includes(audience))
        : cat.items;
      if (!items.length) return '';
      const probs = items.map((it) => renderRootProblemItem(it, prefix)).join('\n');
      return `<div class="prob-cat reveal">
      <div class="chead"><span class="gnum">${esc(cat.num)} /</span><h3>${esc(cat.title)}</h3><span class="sub">${esc(cat.sub)}</span></div>
${probs}
    </div>`;
    })
    .join('\n');
}

function renderAudienceProblemsCategories(categories, audience, prefix = '') {
  const items = [];
  for (const cat of categories) {
    for (const it of cat.items) {
      if (it.audiences?.includes(audience)) items.push(it);
    }
  }
  return items.map((it) => renderAudienceProblemItem(it, prefix)).join('\n');
}

function renderArcsSection(arcs, prefix = '') {
  const arcItems = arcs.items
    .map(
      (a) => `<div class="svc">
        <h4>${esc(a.title)}</h4>
        <div>
          <p><b style="color:var(--ink)">Arrives with:</b> ${esc(a.arrives)}</p>
          <p style="margin-top:.6rem"><b style="color:var(--ink)">Weeks 1&ndash;4:</b> ${esc(a.weeks)}</p>
          <p style="margin-top:.6rem;margin-bottom:.6rem"><b style="color:var(--accent)">The difference:</b></p>
          <div class="chips">${a.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>
        </div>
      </div>`
    )
    .join('\n');
  return `<div class="prob-cat reveal">
      <div class="chead"><span class="gnum">${esc(arcs.num)} /</span><h3>${esc(arcs.title)}</h3><span class="sub">${esc(arcs.sub)}</span></div>
      <p class="stage-intro" style="color:var(--ink-soft);font-size:.98rem;max-width:760px;margin:.9rem 0 1.4rem">${esc(arcs.intro)}</p>
${arcItems}
      <p class="reveal" style="margin-top:1.6rem;color:var(--ink-dim);font-size:.9rem">${esc(arcs.footnote)} <a href="${prefix}contact.html">Tell us what&rsquo;s tangled</a>.</p>
    </div>`;
}

function rewriteDeskFeed($) {
  const feed = globalCopy.deskFeed;
  if (!feed) return;
  const head = $('.feed .fhead');
  if (head.length) {
    head.find('span').first().html(`<span class="status-dot"></span>${esc(feed.heading)}`);
    head.find('span').last().text(feed.subheading);
  }
  const list = $('#feed-list');
  if (list.length && feed.items?.length) {
    list.empty();
    feed.items.forEach((it) => {
      list.append(
        `<li><span class="ic">${it.ic}</span><span>${it.html}</span><span class="t">${esc(it.t)}</span></li>`
      );
    });
  }
  if (feed.note) $('.feed .fnote').text(feed.note);
}

function rewriteRoundtableIntro($) {
  const intro = globalCopy.roundtableRoomsIntro;
  if (!intro) return;
  $('#rooms .sec-head .after, section#rooms .sec-head .after').first().text(intro);
}

function rewriteProblemsRoot($, c) {
  setMeta($, c.title, c.metaDescription);
  setPageHero($, c.hero);

  const intro = problemsPages.intro;
  $('.sec-tight.alt .sec-head .label').first().text(intro.label);
  $('.sec-tight.alt .sec-head h2').first().text(intro.heading);
  $('.sec-tight.alt .sec-head .after').first().text(intro.sub);

  const pains = $('.sec-tight.alt .pains').first();
  pains.empty();
  intro.stats.forEach((s) => {
    pains.append(
      `<div class="pain reveal"><span class="numeral">&#10022;</span><p><b>${esc(s.stat)}</b> &mdash; ${esc(s.text)}.</p></div>`
    );
  });
  pains.nextAll('p.reveal').remove();
  pains.after(
    `<p class="reveal" style="margin-top:2rem;color:var(--ink-soft);max-width:760px">${esc(intro.afterNote)}</p>`
  );

  const main = $('section.sec').not('.sec-tight').first().find('> .wrap').first();
  main.find('.prob-cat, .method, .stage-intro').remove();
  const bodyHtml =
    renderProblemsCategories(problemsPages.categories) +
    renderArcsSection(problemsPages.arcs);
  main.prepend(bodyHtml);

  const close = c.closeSection;
  $('.close-sec .label').text(close.label);
  $('.close-sec h2').html(`${esc(close.heading)} <em>${esc(close.headingEm)}</em>`);
  $('.close-sec p').first().text(close.sub);
}

function rewriteAudienceProblemsPage($, audience) {
  const hero = pickAudienceHero('problemsAudience', audience);
  const c = rootPages['problems.html'];
  setMeta($, c.title.replace('CoachOS', `CoachOS · ${audience}`), c.metaDescription);
  setPageHero($, {
    label: hero.label,
    h1Lines: hero.h1Lines,
    sub: hero.sub,
  });

  const main = $('section.sec').not('.sec-tight').first().find('> .wrap').first();
  main.find('.prob-cat, .method').remove();
  main.prepend(
    `<div class="prob-cat reveal">${renderAudienceProblemsCategories(problemsPages.categories, audience)}</div>`
  );

  const strip = problemsPages.audienceClose[audience];
  if (strip) {
    $('.rooms-strip h2').text(strip.heading);
    const links = $('.rooms-strip .links');
    links.empty();
    strip.links.forEach((l) => {
      links.append(`<a href="${l.href}">${esc(l.text)}</a>`);
    });
    $('.rooms-strip .note').text(strip.note);
  }
}

function rewriteWhy($, c) {
  setMeta($, c.title, c.metaDescription);
  setPageHero($, c.hero);
  const ss = c.shortSection;
  if (ss) {
    $('.wrap-narrow .sec-head .label, section .sec-head .label').first().text(ss.label);
    $('.wrap-narrow h2, .short h2').first().text(ss.heading);
    const paras = ss.paragraphs;
    $('.wrap-narrow p').each((i, el) => {
      if (paras[i]) $(el).text(paras[i]);
    });
  }
  const stats = c.statsSection;
  if (stats) {
    $('.stat-strip div').each((i, el) => {
      const s = stats.stats[i];
      if (!s) return;
      $(el).find('.n').text(s.value);
      $(el).find('.l').text(s.label);
    });
    if (stats.closing) {
      const closing = $('.stat-strip').next('p.reveal');
      if (closing.length) closing.text(stats.closing);
    }
    $('.stat-source').remove();
  }
  const c3 = c.compare3;
  if (c3) {
    $('.compare3 .col').each((i, el) => {
      const col = c3.columns[i];
      if (!col) return;
      $(el).find('h3').text(col.title);
      const ul = $(el).find('ul');
      ul.empty();
      col.points.forEach((pt) => ul.append(`<li>${esc(pt)}</li>`));
    });
  }
}

function rewritePlatform($, c) {
  setMeta($, c.title, c.metaDescription);
  setPageHero($, { label: c.hero.label, h1Lines: c.hero.h1Lines, sub: c.hero.sub });
  $('.rooms .room').each((i, el) => {
    const r = c.roomsSection.rooms[i];
    if (!r) return;
    $(el).find('h3').text(r.title);
    $(el).find('p').not('.status').first().text(r.desc);
    if (r.status) $(el).find('.status').text(r.status);
  });
  const rule = c.ruleSection;
  if (rule) {
    $('.sec-tight .sec-head h2').first().text(rule.heading);
    $('.sec-tight .wrap-narrow p, .sec-tight p').first().text(rule.body);
  }
}

function rewriteContact($, c) {
  setMeta($, c.title, c.metaDescription);
  setPageHero($, c.hero);
  const fs = c.founderSection;
  if (fs) {
    $('section .wrap-narrow h2, .founder h2').first().text(fs.heading);
  }
  const form = c.formSection;
  if (form) {
    $('textarea[name="message"], #message').attr('placeholder', form.messagePlaceholder);
  }
}

function rewriteDesk($, c) {
  setMeta($, c.title, c.metaDescription);
  setPageHero($, {
    label: c.hero.label,
    h1: c.hero.h1,
    h1Em: c.hero.h1Em,
    sub: c.hero.sub,
  });

  const rule = c.ruleSection;
  const ruleSec = $('.sec-tight.alt').first();
  ruleSec.find('.sec-head .label').text(rule.label);
  ruleSec.find('.sec-head h2').html(`${esc(rule.heading)} <em>${esc(rule.headingEm)}</em>`);
  ruleSec.find('p.reveal').first().text(rule.intro);
  ruleSec.find('.pain').each((i, el) => {
    const step = rule.steps[i];
    if (!step) return;
    $(el).find('p').html(`<b>${esc(step.title)}</b> ${esc(step.body)}`);
  });

  // Fix closing paragraph in problem section (third alt section's last p in ledger area)
  $('p').each((_, el) => {
    const t = $(el).text();
    if (t.includes('checked by our specialist, approved by you')) {
      $(el).text(c.problemClosing);
    }
  });

  // Nine rooms
  $('#inside .svc-row, .svc-rows.plain .svc-row').each((i, el) => {
    const room = c.rooms[i];
    if (!room) return;
    $(el).find('h3').text(room.title);
    $(el).find('p.desc').first().text(room.desc);
    const chips = $(el).find('.chips');
    if (chips.length && room.chips) {
      chips.empty();
      room.chips.forEach((ch) => chips.append(`<span class="chip">${esc(ch)}</span>`));
    }
  });

  const mem = c.membership;
  $('.wrap-narrow .sec-head h2').last().html(`${esc(mem.heading)} <em>${esc(mem.headingEm)}</em>`);
  const memParas = $('.wrap-narrow .reveal[style*="font-size:1.05rem"] p');
  memParas.each((i, el) => {
    if (mem.paragraphs[i]) $(el).text(mem.paragraphs[i]);
  });
}

function rewritePlatformSubpage($, name) {
  const page = platformPages[name];
  if (!page) return;
  if (page.title) setMeta($, page.title, page.metaDescription || $('meta[name="description"]').attr('content'));
  const hero = page.hero || {};
  setPageHero($, {
    label: hero.label,
    h1: hero.h1,
    h1Em: hero.h1Em,
    h1Lines: hero.h1Lines,
    sub: hero.sub,
  });
  if (page.intro) {
    $('p').each((_, el) => {
      const t = $(el).text();
      if (t.includes('Roundtable is how Coach Community') || t.includes('Roster is the network layer') || t.includes('Shortlist is how the Coach')) {
        $(el).text(page.intro);
      }
    });
  }
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...walk(full, []));
    else if (name.endsWith('.html')) files.push(full);
  }
  return files;
}

function commitPage($, filePath, rel) {
  if (/roundtable/.test(rel)) rewriteRoundtableIntro($);
  if (rel === 'index.html' || rel === 'desk/index.html' || rel.endsWith('/desk.html')) {
    rewriteDeskFeed($);
  }
  sanitizeProductCopy($);
  writeFileSync(filePath, $.html());
}

function processFile(filePath) {
  const rel = relative(FINAL_ROOT, filePath);
  let html = readFileSync(filePath, 'utf8');

  if (html.includes('http-equiv="refresh"') && html.length < 800) {
    if (PREVIEW) html = html.replace('<body>', `<body>${FINAL_BANNER}`);
    writeFileSync(filePath, html);
    return { rel, type: 'redirect' };
  }

  const $ = cheerio.load(html, { decodeEntities: false });
  addFinalBanner($);
  updateFooter($);

  if (rel === 'index.html') {
    rewriteIndex($, rootPages['index.html']);
    commitPage($, filePath, rel);
    return { rel, type: 'index' };
  }

  if (rel === 'desk/index.html') {
    rewriteDesk($, platformPages.desk);
    commitPage($, filePath, rel);
    return { rel, type: 'desk' };
  }

  if (rootPages[rel]) {
    const c = rootPages[rel];
    if (rel === 'problems.html') rewriteProblemsRoot($, c);
    else if (rel === 'why.html') rewriteWhy($, c);
    else if (rel === 'platform.html') rewritePlatform($, c);
    else if (rel === 'contact.html') rewriteContact($, c);
    else if (rel === 'services.html') {
      setMeta($, c.title, c.metaDescription);
      setPageHero($, { label: c.hero.label, h1Lines: c.hero.h1Lines, sub: c.hero.sub });
    }
    commitPage($, filePath, rel);
    return { rel, type: 'root-' + rel };
  }

  const audMatch = rel.match(/^(coach|business|freelancer|mentor|corporate)\/index\.html$/);
  if (audMatch && audiencePages[audMatch[1]]) {
    rewriteAudienceIndex($, audiencePages[audMatch[1]]);
    commitPage($, filePath, rel);
    return { rel, type: 'audience-index' };
  }

  if (rel.includes('/services/') || rel.startsWith('services/')) {
    rewriteServicePage($, rel);
    commitPage($, filePath, rel);
    return { rel, type: 'service' };
  }

  if (rel.endsWith('/problems.html')) {
    const aud = rel.split('/')[0];
    rewriteAudienceProblemsPage($, aud);
    commitPage($, filePath, rel);
    return { rel, type: 'problems-audience' };
  }

  const audServicesMatch = rel.match(/^(coach|business|freelancer|mentor|corporate)\/services\.html$/);
  if (audServicesMatch) {
    const hero = taglines.audienceServicesIndex[audServicesMatch[1]];
    if (hero) {
      setPageHero($, { h1: hero.h1, h1Em: hero.h1Em, sub: hero.sub });
    }
    commitPage($, filePath, rel);
    return { rel, type: 'audience-services-index' };
  }

  const platDirMatch = rel.match(/^(desk|roundtable|roster|shortlist)\/index\.html$/);
  if (platDirMatch) {
    rewritePlatformSubpage($, platDirMatch[1]);
    if (platDirMatch[1] === 'desk') rewriteDesk($, platformPages.desk);
    commitPage($, filePath, rel);
    return { rel, type: 'platform-dir-' + platDirMatch[1] };
  }

  const platMatch = rel.match(/(?:^|\/)(desk|roundtable|roster|shortlist)\.html$/);
  if (platMatch) {
    rewritePlatformSubpage($, platMatch[1]);
    if (platMatch[1] === 'desk') rewriteDesk($, platformPages.desk);
    commitPage($, filePath, rel);
    return { rel, type: 'platform-sub' };
  }

  const audSubMatch = rel.match(/^(coach|business|freelancer|mentor|corporate)\/(why|contact|platform)\.html$/);
  if (audSubMatch) {
    const [, audience, page] = audSubMatch;
    const c = rootPages[`${page}.html`];
    if (c) {
      setMeta($, c.title, c.metaDescription);
      if (page === 'platform') {
        rewritePlatform($, c);
        const ph = audiencePages[audience]?.platformHero;
        if (ph) {
          setPageHero($, {
            label: c.hero.label,
            h1Lines: ph.h1Lines,
            h1: ph.h1,
            h1Em: ph.h1Em,
            sub: ph.sub || c.hero.sub,
          });
        }
      } else if (page === 'why') {
        const hero = pickAudienceHero('audienceWhy', audience);
        setPageHero($, { label: hero.label, h1Lines: hero.h1Lines, sub: hero.sub });
      } else if (page === 'contact') {
        rewriteContact($, c);
        const hero = pickAudienceHero('audienceContact', audience);
        setPageHero($, { label: hero.label, h1Lines: hero.h1Lines, sub: hero.sub });
      }
    }
    commitPage($, filePath, rel);
    return { rel, type: 'audience-' + page };
  }

  commitPage($, filePath, rel);
  return { rel, type: 'banner-only' };
}

syncFinalSite();
const files = walk(FINAL_ROOT);
const results = files.map(processFile);
const counts = results.reduce((acc, r) => {
  acc[r.type] = (acc[r.type] || 0) + 1;
  return acc;
}, {});
console.log(`Processed ${files.length} HTML files in final/`);
console.log(JSON.stringify(counts, null, 2));
