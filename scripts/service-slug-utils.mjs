/** Resolve HTML service paths to service-catalog.json keys. */

/** Filename slug → catalog slug (last path segment). */
export const SLUG_ALIASES = {
  'business-strategy-and-consulting': 'business-strategy-consulting',
  'hosting-and-domain': 'hosting-domain',
  'personal-branding-and-positioning': 'personal-branding',
  'lead-management-and-first-session-closing': 'lead-management',
  'lead-management-and-sales-support': 'lead-management',
  'course-creation-and-launch': 'course-creation',
  'website-built-around-your-specialty': 'website',
  'website-that-stays-current': 'website',
  'portfolio-website-that-sells': 'website',
  'social-handles-claimed-and-consistent': 'social-handles',
  'handles-and-listings-corrected': 'social-handles',
  'proposals-follow-ups-and-pipeline': 'lead-management',
  'positioning-and-pricing': 'personal-branding',
  'referral-outreach': 'lead-generation',
  'mentor-positioning-and-offer-setup': 'mentor-positioning-and-offer-setup',
  '1-1-program-structure': '1-1-program-structure',
  'a-page-worth-sending': 'a-page-worth-sending',
  'content-that-shows-your-thinking': 'social-media-marketing',
  'renewals-and-proof': 'renewals-and-proof',
  'matching-run-on-your-criteria': 'matching-run-on-your-criteria',
  'conflict-checks-and-re-matching': 'conflict-checks-and-re-matching',
  'session-tracking-and-early-flags': 'session-tracking-and-early-flags',
  'mentor-onboarding': 'mentor-onboarding',
  'reporting-leadership-can-act-on': 'reporting-leadership-can-act-on',
};

/** Root services/*.html mentor pages → mentor/ catalog prefix. */
export const ROOT_MENTOR_SLUGS = new Set([
  'mentor-positioning',
  'mentee-matching',
  'mentorship-program-setup',
]);

const ROOT_MENTOR_CATALOG = {
  'mentor-positioning': 'mentor/mentor-positioning-and-offer-setup',
  'mentee-matching': 'mentor/mentee-matching',
  'mentorship-program-setup': 'mentor/1-1-program-structure',
};

export function normalizeSlug(slug) {
  if (!slug) return slug;
  return SLUG_ALIASES[slug] || slug;
}

export function serviceKey(relPath) {
  const p = relPath.replace(/\\/g, '/');
  if (p.startsWith('services/')) {
    const slug = p.replace('services/', '').replace('.html', '');
    if (ROOT_MENTOR_SLUGS.has(slug)) return ROOT_MENTOR_CATALOG[slug];
    return normalizeSlug(slug);
  }
  const m = p.match(/^(coach|business|freelancer|mentor|corporate)\/services\/(.+)\.html$/);
  if (m) return `${m[1]}/${normalizeSlug(m[2])}`;
  return null;
}

export function baseServiceSlug(key) {
  if (!key) return null;
  const parts = key.split('/');
  return normalizeSlug(parts[parts.length - 1]);
}

export function resolveCatalogKey(key, catalog) {
  if (!key || key === 'defaultTemplate') return null;
  if (catalog[key]) return key;

  const parts = key.split('/');
  const audience = parts.length > 1 ? parts[0] : null;
  const rawSlug = parts[parts.length - 1];
  const slug = normalizeSlug(rawSlug);

  const candidates = [];
  if (audience) candidates.push(`${audience}/${slug}`, `${audience}/${rawSlug}`);
  candidates.push(slug, rawSlug);
  if (audience) candidates.push(`${audience}/${slug.replace(/-/g, '')}`);

  for (const c of candidates) {
    if (catalog[c]) return c;
  }

  if (audience && catalog[slug]) return slug;

  return null;
}

export function resolveCatalogEntry(key, catalog) {
  const resolved = resolveCatalogKey(key, catalog);
  if (!resolved) return { key: null, entry: null };
  return { key: resolved, entry: catalog[resolved] };
}

export function pageAudience(relPath, catalogKey) {
  const m = relPath.match(/^(coach|business|freelancer|mentor|corporate)\//);
  if (m) return m[1];
  if (catalogKey?.startsWith('mentor/')) return 'mentor';
  if (catalogKey?.startsWith('corporate/')) return 'corporate';
  return null;
}
