#!/usr/bin/env node
/**
 * Rewrites demo/ HTML with research-backed, SEO-focused copy.
 * Local only — does not touch the main site outside demo/.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as cheerio from 'cheerio';

const DEMO_ROOT = join(process.cwd(), 'demo');
const rootPages = JSON.parse(readFileSync(join(process.cwd(), 'content/root-pages.json'), 'utf8'));
const catalog = JSON.parse(readFileSync(join(process.cwd(), 'data/service-catalog.json'), 'utf8')).services;
const audiencePages = JSON.parse(readFileSync(join(process.cwd(), 'content/audience-pages.json'), 'utf8'));

const DEMO_BANNER = `<div id="content-demo-banner" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#1a4d2e;color:#fff;font:500 13px/1.4 'IBM Plex Mono',monospace;padding:10px 16px;text-align:center;border-bottom:2px solid #4ade80">Content demo — rewritten copy for review. <a href="http://127.0.0.1:8080/" style="color:#bbf7d0;margin-left:8px">Original site</a> · <strong style="color:#fff">You are viewing the updated version</strong></div>`;

const FOOTER_TAGLINE =
  'CoachOS — done-for-you website, marketing, and lead follow-up. AI drafts, a specialist reviews, you approve.';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

function addDemoBanner($) {
  $('body').prepend(DEMO_BANNER);
  $('head').append('<style>body{padding-top:44px!important}#content-demo-banner a:hover{text-decoration:underline}</style>');
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
    h1.find('.split-text').html(`${esc(lines[0])}${accent ? ` <span class="accent">${esc(accent)}</span>` : ''}`);
  } else {
    const last = lines[lines.length - 1];
    const rest = lines.slice(0, -1).join(' ');
    h1.html(`${esc(rest)}${rest ? ' ' : ''}<em>${esc(last)}</em>`);
  }
}

function setPageHero($, { label, h1Lines, sub, h1, h1Em }) {
  if (label) $('.pagehero .label.crumb, .hero .topline span').first().text(label);
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

  $('#doors .sec-head h2').html(`${esc(c.doors.heading.split('.')[0])}. <em>${esc(c.doors.heading.split('.').slice(1).join('.').trim() || 'Pick yours.')}</em>`);
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
      const attrs = s.countTo != null ? ` data-count-to="${s.countTo}"${s.suffix ? ` data-count-suffix="${s.suffix}"` : ''}` : '';
      strip.append(`<div><span class="n"${attrs}>${esc(s.value)}</span><span class="l">${esc(s.label)}</span></div>`);
    });
    $('.stat-source').text(data.hero.statSource);
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
  $('#included .sec-head h2, .sec#included .sec-head h2').first().html(`${esc(pkgSec.h2)} <em>${esc(pkgSec.h2Em)}</em>`);
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

  // Problem section (root-style pages)
  const probSec = $('.sec-tight.alt');
  if (probSec.length && entry.genericProblem) {
    probSec.find('.sec-head h2').text('Why this service exists');
    probSec.find('.pain p').first().html(esc(entry.genericProblem));
  }

  // What's included
  const incSec = $('.sec').not('.sec-tight').first();
  incSec.find('.sec-head h2').html(`What's included, <em>reviewed by you</em>`);
  incSec.find('.sec-head .after').text(
    'AI drafts the repetitive parts. A specialist reviews everything. You approve before it ships.'
  );
  const pains = incSec.find('.pains');
  pains.empty();
  entry.deliverables.forEach((d, i) => {
    const num = String(i + 1).padStart(2, '0');
    pains.append(`<div class="pain reveal"><span class="numeral">${num}</span><p>${esc(d)}</p></div>`);
  });

  // Add how-it-works block if missing
  if (!$('#how-coachos').length) {
    incSec.after(`<section class="sec-tight alt" id="how-coachos"><div class="wrap"><div class="sec-head reveal"><span class="label">How it works</span><h2>Three steps, <em>every time</em></h2><p class="after">Same process on every service — no black box.</p></div><div class="steps"><div class="step reveal"><span class="n">1</span><h3>We draft from your brief</h3><p>Using your voice, offer, and goals — not generic templates.</p></div><div class="step reveal"><span class="n">2</span><h3>A specialist reviews</h3><p>Every draft is checked before you see it.</p></div><div class="step reveal"><span class="n">3</span><h3>You approve, then it runs</h3><p>Nothing ships under your name until you say yes.</p></div></div></div></section>`);
  }

  return true;
}

function rewriteProblemsRoot($, c) {
  setMeta($, c.title, c.metaDescription);
  setPageHero($, c.hero);

  const intro = c.citationsIntro;
  $('.sec-tight.alt .sec-head .label').first().text(intro.label);
  $('.sec-tight.alt .sec-head h2').first().text(intro.heading);
  $('.sec-tight.alt .sec-head .after').first().text(intro.sub);

  const pains = $('.sec-tight.alt .pains').first();
  pains.empty();
  intro.citations.forEach((cit) => {
    pains.append(
      `<div class="pain reveal"><span class="numeral">&#10022;</span><p><b>${esc(cit.stat)}</b> &mdash; ${esc(cit.source)}.</p></div>`
    );
  });
  pains.after(`<p class="reveal" style="margin-top:2rem;color:var(--ink-soft);max-width:760px">${esc(intro.afterNote)}</p>`);

  const close = c.closeSection;
  $('.close-sec .label').text(close.label);
  $('.close-sec h2').html(`${esc(close.heading)} <em>${esc(close.headingEm)}</em>`);
  $('.close-sec p').first().text(close.sub);
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
  });
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

function rewritePlatformSubpage($, name) {
  const intros = {
    desk: {
      sub: 'One dashboard for leads, marketing, bookings, billing, and client work — AI drafts, you approve, nothing sends alone.',
    },
    roundtable: {
      sub: 'Member rooms by practice and topic — plus a Quiet Room when you need to ask without a name attached.',
    },
    roster: {
      sub: 'One profile built from your real practice — specialty, offers, credentials — with referrals that mean something.',
    },
    shortlist: {
      sub: 'A vetted directory clients search by specialty and language. Every enquiry lands on your Desk board. 0% revenue share.',
    },
  };
  const intro = intros[name];
  if (intro) $('.pagehero .sub').text(intro.sub);
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...walk(full, []));
    else if (name.endsWith('.html')) files.push(full);
  }
  return files;
}

function processFile(filePath) {
  const rel = relative(DEMO_ROOT, filePath);
  let html = readFileSync(filePath, 'utf8');

  // Skip redirect stubs
  if (html.includes('http-equiv="refresh"') && html.length < 800) {
    html = html.replace('<body>', `<body>${DEMO_BANNER}`);
    writeFileSync(filePath, html);
    return { rel, type: 'redirect' };
  }

  const $ = cheerio.load(html, { decodeEntities: false });
  addDemoBanner($);
  updateFooter($);

  if (rel === 'index.html') {
    rewriteIndex($, rootPages['index.html']);
    writeFileSync(filePath, $.html());
    return { rel, type: 'index' };
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
    writeFileSync(filePath, $.html());
    return { rel, type: 'root-' + rel };
  }

  const audMatch = rel.match(/^(coach|business|freelancer|mentor|corporate)\/index\.html$/);
  if (audMatch && audiencePages[audMatch[1]]) {
    rewriteAudienceIndex($, audiencePages[audMatch[1]]);
    writeFileSync(filePath, $.html());
    return { rel, type: 'audience-index' };
  }

  if (rel.includes('/services/') || rel.startsWith('services/')) {
    rewriteServicePage($, rel);
    writeFileSync(filePath, $.html());
    return { rel, type: 'service' };
  }

  if (rel.endsWith('/problems.html')) {
    const c = rootPages['problems.html'];
    setMeta($, c.title.replace('CoachOS', `CoachOS ${rel.split('/')[0]}`), c.metaDescription);
    setPageHero($, {
      label: 'Problems we fix',
      h1: 'Research-backed problems.',
      h1Em: 'Clear fixes.',
      sub: c.hero.sub,
    });
    writeFileSync(filePath, $.html());
    return { rel, type: 'problems-audience' };
  }

  const platMatch = rel.match(/(?:^|\/)(desk|roundtable|roster|shortlist)\.html$/);
  if (platMatch) {
    rewritePlatformSubpage($, platMatch[1]);
    writeFileSync(filePath, $.html());
    return { rel, type: 'platform-sub' };
  }

  if (rel.match(/^(coach|business|freelancer|mentor|corporate)\/(why|contact|platform)\.html$/)) {
    const page = rel.split('/')[1].replace('.html', '');
    const c = rootPages[`${page}.html`];
    if (c) {
      setMeta($, c.title, c.metaDescription);
      setPageHero($, c.hero);
    }
    writeFileSync(filePath, $.html());
    return { rel, type: 'audience-' + page };
  }

  writeFileSync(filePath, $.html());
  return { rel, type: 'banner-only' };
}

const files = walk(DEMO_ROOT);
const results = files.map(processFile);
const counts = results.reduce((acc, r) => {
  acc[r.type] = (acc[r.type] || 0) + 1;
  return acc;
}, {});
console.log(`Processed ${files.length} HTML files in demo/`);
console.log(JSON.stringify(counts, null, 2));
