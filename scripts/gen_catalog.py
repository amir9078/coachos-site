import json
import copy

def av(coach, business, freelancer, mentor, corporate):
    return {
        "coach": {"title": coach[0], "h1": coach[1], "sub": coach[2]},
        "business": {"title": business[0], "h1": business[1], "sub": business[2]},
        "freelancer": {"title": freelancer[0], "h1": freelancer[1], "sub": freelancer[2]},
        "mentor": {"title": mentor[0], "h1": mentor[1], "sub": mentor[2]},
        "corporate": {"title": corporate[0], "h1": corporate[1], "sub": corporate[2]},
    }

def svc(slug, stage, title, h1, sub, problem, deliverables, variants):
    return {
        "slug": slug,
        "stage": stage,
        "genericTitle": title,
        "genericH1": h1,
        "genericSub": sub,
        "genericProblem": problem,
        "deliverables": deliverables,
        "audienceVariants": variants,
    }

D = {
    "strategy": ["Practice audit with written findings", "90-day plan with priorities and targets", "Pricing and offer recommendations", "Capacity and revenue review", "Quarterly review with updated plan"],
    "positioning": ["Positioning session for who you serve and why you", "One-sentence statement for bios and referrals", "Voice and message guide", "Rewritten bios for web and LinkedIn", "Visual direction for photos and graphics"],
    "website": ["Site structure around your offer and ideal client", "Copy in your voice, not template filler", "Mobile-first design with clear next step", "Booking or enquiry form wired and tested", "Launch plus monthly edits you approve"],
    "hosting": ["Domain registered or transferred with renewals managed", "DNS, SSL, and uptime monitoring", "Backups configured and checked", "Renewal notices handled by us", "Support when something breaks"],
    "email_setup": ["Mailbox on your domain", "SPF, DKIM, and DMARC configured", "Professional signatures", "Migration from old accounts", "Deliverability check in month one"],
    "social_handles": ["Handle audit on platforms that matter", "Consistent username claimed", "Old accounts cleaned up", "Bios and avatars matched", "Handoff doc of what lives where"],
    "social_marketing": ["Content calendar planned a month ahead", "Posts drafted for batch approval", "Graphics sized per platform", "Scheduled publishing through busy weeks", "Monthly performance summary"],
    "content": ["Topic research from client search behavior", "Articles written to rank and convert", "On-page SEO and internal links", "Repurposing plan for social snippets", "Publish and indexing checks"],
    "email_mkt": ["List and signup forms on your site", "Welcome and nurture sequences drafted", "Newsletters on a rhythm you can keep", "Segments for warm leads and past clients", "Compliance and deliverability handled"],
    "lead_gen": ["Channel plan where your clients already are", "Landing pages with one clear offer", "Capture forms to inbox or CRM", "Source tracking per enquiry", "Monthly tune-up from real conversions"],
    "paid_ads": ["Campaign strategy tied to converting pages", "Ad copy and creatives refreshed", "Daily budget watch", "Targeting for ideal clients", "Monthly cost-per-enquiry report"],
    "lead_mgmt": ["Enquiries answered in minutes", "Calls booked with no-show reminders", "Follow-up until yes or clear no", "Pipeline view so nothing sits idle", "Handoff notes when ready to close"],
    "sales": ["Proposal templates in your voice", "Eight-touch follow-up sequences", "Objection scripts you approve once", "Call scheduling and prep notes", "Deal notes for the next message"],
    "course": ["Curriculum from what you already teach", "Lesson scripts or slides for review", "Hosting and checkout on your platform", "Sales page and launch emails", "Launch week plan with checkpoints"],
    "mentor_positioning": ["Mentor offer in one sentence with pricing", "Program tiers mapped", "Intake questions that filter fit", "Sales page for your mentoring offer", "Proposal template for sponsors"],
    "program_structure": ["Session cadence and boundaries documented", "Month-one goal-setting framework", "Check-in templates for progress", "Renewal script and timing", "Exit survey and testimonial request"],
    "mentee_matching": ["Ideal mentee profile from your criteria", "Application form on your site", "Screening before you take a call", "Matching workflow before you commit", "Polite decline templates"],
    "renewals_proof": ["Goal tracking from day one", "Mid-program drift check-in", "Renewal offer before last session", "Testimonial requests at the right time", "Proof assets for site and proposals"],
    "referral_outreach": ["List of past clients worth reactivating", "Outreach drafted in your voice", "Referral ask templates", "Follow-up until reply or opt-out", "Referral tracking"],
    "pipeline": ["Inbox triaged by project type", "Proposals from your templates", "Follow-up until yes or no", "Pipeline view for stale quotes", "Handoff when work starts"],
    "listings": ["Google Business Profile claimed", "Directory listings corrected", "Duplicates flagged and merged", "Photos and copy aligned to site", "Monthly listing accuracy check"],
    "corp_matching": ["Matching rules from HR criteria", "Conflict checks before confirm", "Batch matching for large cohorts", "Re-match when pairs fail", "Audit log for leadership"],
    "corp_conflict": ["Manager conflict rules encoded", "Automated pre-match checks", "Escalation for bad pairs", "HR-ready documentation", "Re-match without full restart"],
    "corp_tracking": ["Session logging mentors will use", "Flags when pairs go quiet", "Reminder nudges before slip", "Completion tied to program goals", "Exportable quarterly data"],
    "corp_onboarding": ["Mentor welcome pack", "Mentee onboarding before session one", "Role descriptions for internal comms", "FAQ for managers and participants", "Launch checklist per cohort"],
    "corp_reporting": ["Dashboard for sign-ups and completions", "Outcome summaries, not vanity counts", "Quarterly narrative report", "Recommendations for next cohort", "Data export for internal systems"],
}

V = {
    "strategy": av(("Strategy for coaches", "Plan the practice, not a deck.", "Pricing, offers, and a 90-day plan reviewed quarterly."), ("Strategy for small business", "Plan the business, not another meeting.", "Pricing, staffing, and a 90-day plan while you run the shop."), ("Strategy for freelancers", "Plan the freelance business.", "Positioning, pricing, and a plan for feast-and-famine months."), ("Strategy for mentors", "Plan the mentoring business.", "Program economics and a 90-day roadmap."), ("Strategy for programs", "Program design consulting.", "Goals, rollout, and a cycle plan L&D can run.")),
    "position": av(("Positioning for coaches", "Who you coach in one sentence.", "The line that gets you referred."), ("Positioning for small business", "What you sell, clearly.", "Customers know what you do before they call."), ("Positioning for freelancers", "Niche and rate before the call.", "Prospects know your specialty and price."), ("Personal branding for mentors", "What is different about your mentoring.", "Experience turned into a priced offer."), ("Positioning for programs", "How the program shows up.", "Consistent messaging from invite to handbook.")),
    "website": av(("Website for coaches", "Built around your specialty.", "Who you coach and how to book — live in ~3 weeks."), ("Website for small business", "A site that stays current.", "Updated when prices, hours, or services change."), ("Portfolio for freelancers", "A portfolio that sells.", "Case studies and a clear enquiry path."), ("A page worth sending", "Forwardable mentoring page.", "Who you mentor, how it works, how to apply."), ("Program website", "A portal employees trust.", "Enrollment, FAQs, and on-brand comms.")),
    "hosting": av(("Hosting for coaches", "No renewal panic.", "DNS, SSL, backups handled."), ("Hosting for small business", "Stay online while you work.", "Domain and uptime managed."), ("Hosting for freelancers", "Portfolio stays live.", "Renewals handled between projects."), ("Hosting for mentors", "Page stays up year-round.", "Infrastructure without tickets to you."), ("Hosting for programs", "Portal up each cohort.", "Monitored through launch week.")),
    "email_setup": av(("Email for coaches", "Email on your domain.", "Discovery threads out of spam."), ("Email for small business", "Email customers recognize.", "Quotes from your domain."), ("Email for freelancers", "Client-ready email.", "Proposals from you@domain."), ("Email for mentors", "Branded mentor email.", "Applications from a proper address."), ("Email for programs", "Program email IT trusts.", "Mentor and mentee comms on-domain.")),
    "handles": av(("Handles for coaches", "One name everywhere.", "Claimed and matched before you post."), ("Handles and listings", "Listings match reality.", "Google and social aligned to your site."), ("Handles for freelancers", "Consistent freelance handles.", "No dead accounts on key platforms."), ("Handles for mentors", "Consistent before publishing.", "One name where mentees look."), ("Handles for programs", "Branded program accounts.", "Ready for internal launch.")),
    "social": av(("Social for coaches", "Posts through full cohorts.", "Drafted, approved, scheduled ahead."), ("Social for small business", "Visible while you work.", "A month planned and published."), ("Social for freelancers", "Proof between projects.", "Posts without eating delivery time."), ("Content that shows thinking", "Posts from real experience.", "Mentees read before they apply."), ("Program social", "Cohort comms on rhythm.", "Launch and milestone posts for HR.")),
    "content": av(("Content for coaches", "Found before they know you.", "Articles that bring enquiries."), ("Content for small business", "Answers what customers Google.", "Local pages that convert."), ("Content for freelancers", "Proof you know the work.", "Case write-ups that support your rate."), ("Thinking content for mentors", "Long-form mentoring proof.", "Guides serious mentees read first."), ("Program resources", "Assets participants use.", "Playbooks that cut HR support load.")),
    "email_mkt": av(("Email for coaches", "Past clients stay warm.", "Newsletters and nurture drafted."), ("Email for small business", "Repeat customers return.", "Promos on a steady rhythm."), ("Email for freelancers", "Leads warmed between projects.", "Sequences so enquiries do not cool."), ("Email for mentors", "Pipeline stays alive.", "Applicant and alumni updates."), ("Program email", "Cohort email on schedule.", "Invites and nudges aligned to calendar.")),
    "lead_gen": av(("Lead gen for coaches", "Enquiries on schedule.", "Channels built for your offer."), ("Lead gen for business", "Repeatable customer channel.", "Landing pages wired to you."), ("Lead gen for freelancers", "Beyond referrals.", "Qualified project enquiries."), ("Lead gen for mentors", "Serious mentees only.", "Screening before your calendar fills."), ("Program enrollment", "Sign-ups at scale.", "Flows for each cohort wave.")),
    "paid": av(("Paid ads for coaches", "Ads to booking pages.", "Budget watched daily."), ("Paid ads for business", "Local ads that convert.", "Run while you serve customers."), ("Paid ads for freelancers", "Ads for your niche.", "Spend tied to portfolio pages."), ("Paid ads for mentors", "Ads for applications.", "Targeting that filters early."), ("Paid ads for programs", "Recruitment per cohort.", "Creative aligned to HR deadlines.")),
    "lead_mgmt": av(("Lead mgmt for coaches", "Answered in minutes.", "Booking and follow-up in session gaps."), ("Lead mgmt for business", "Calls answered first.", "Quotes chased while you work."), ("Freelancer pipeline", "Proposals without billable drag.", "Chased until yes or no."), ("Lead mgmt for mentors", "Screened applications.", "Fit checked before intro calls."), ("Enrollment support", "Volume without HR bottleneck.", "Routing and FAQ at scale.")),
    "sales": av(("Sales for coaches", "Eight touches, not two.", "Follow-through to decision."), ("Sales for business", "Quotes until yes or no.", "Polite does not mean gone."), ("Sales for freelancers", "Close without chase debt.", "Scope and follow-up drafted."), ("Sales for mentors", "Close with confidence.", "Renewal conversations ready."), ("Sales for programs", "Procurement-friendly docs.", "Sponsor follow-up handled.")),
    "course": av(("Course for coaches", "Revenue without sessions.", "Package, host, launch."), ("Course for business", "Train customers at scale.", "Process turned into product."), ("Course for freelancers", "Productize repeat work.", "Earn during client projects."), ("Course for mentors", "Async mentoring offer.", "Alongside 1:1 programs."), ("Course for programs", "Internal curriculum.", "Modules and rollout at scale.")),
}

ROOT = {
    "business-strategy-consulting": svc("business-strategy-consulting", "Strategy", "Business strategy and consulting", "Plan the next quarter before you run it.", "Pricing, offers, capacity, and priorities — reviewed with you.", "81% of solo operators run growth by hand; without a plan, busy months feel productive but pipeline stays accidental.", D["strategy"], V["strategy"]),
    "personal-branding": svc("personal-branding", "Position", "Personal branding", "Say who you help in one sentence.", "Positioning used everywhere you appear.", "41% of buyers cannot explain what you do; vague positioning costs referrals before price comes up.", D["positioning"], V["position"]),
    "website": svc("website", "Launch", "Website", "Look established on first visit.", "Built, launched, and kept current.", "75% judge credibility on your site; stale pages lose the decision in seconds.", D["website"], V["website"]),
    "hosting-domain": svc("hosting-domain", "Launch", "Hosting and domain", "Stay online without renewal panic.", "Domain, DNS, SSL, backups managed.", "Missed renewals take thousands of sites offline yearly; one lapse can erase search traffic.", D["hosting"], V["hosting"]),
    "business-email": svc("business-email", "Launch", "Business email", "Inbox delivery on your domain.", "Mailboxes with deliverability sorted.", "45% of business email fails authentication; client messages vanish to spam.", D["email_setup"], V["email_setup"]),
    "social-handles": svc("social-handles", "Launch", "Social handles", "One name where people look you up.", "Claimed, matched, cleaned up.", "People check two platforms before enquiring; mismatched handles look inactive.", D["social_handles"], V["handles"]),
    "social-media-marketing": svc("social-media-marketing", "Grow", "Social media marketing", "Keep posting when work peaks.", "Calendar, drafts, approval, publishing.", "51% stop posting when client work peaks; quiet feeds cost the next enquiry.", D["social_marketing"], V["social"]),
    "content-marketing": svc("content-marketing", "Grow", "Content marketing", "Found before they know your name.", "Research, SEO articles, publishing.", "93% of journeys start with search; unanswered questions go to competitors.", D["content"], V["content"]),
    "email-marketing": svc("email-marketing", "Grow", "Email marketing", "Stay in touch without weekly writing.", "Lists, newsletters, nurture sequences.", "Email returns $36 per $1, yet most operators go silent for months.", D["email_mkt"], V["email_mkt"]),
    "lead-generation": svc("lead-generation", "Grow", "Lead generation", "Enquiries on schedule, not luck.", "Channels, pages, capture, tracking.", "Hour-one response is 7x more likely to qualify; most still rely on referrals alone.", D["lead_gen"], V["lead_gen"]),
    "paid-ads-management": svc("paid-ads-management", "Grow", "Paid ads management", "Ads run daily, budgets protected.", "Strategy, creatives, spend watch.", "26% of small ad spend is wasted on poor targeting without daily management.", D["paid_ads"], V["paid"]),
    "lead-management": svc("lead-management", "Run", "Lead management", "Nothing sits unanswered.", "Fast replies, booking, follow-up.", "Five-minute response is 21x more likely to qualify; two-hour callbacks often lose the deal.", D["lead_mgmt"], V["lead_mgmt"]),
    "sales-closing-support": svc("sales-closing-support", "Run", "Sales and closing support", "Follow through until they decide.", "Proposals and eight-touch sequences.", "80% of sales need five follow-ups; most stop at two.", D["sales"], V["sales"]),
    "course-creation": svc("course-creation", "Courses", "Course creation and launch", "Sell knowledge without your calendar.", "Curriculum, production, hosting, launch.", "Courses can add 30–50% revenue; most experts never package what they already teach.", D["course"], V["course"]),
}

services = dict(ROOT)

def add_aud(audience, slug, title, h1, sub, problem):
    base = copy.deepcopy(ROOT[slug])
    base["genericTitle"] = title
    base["genericH1"] = h1
    base["genericSub"] = sub
    base["genericProblem"] = problem
    services[f"{audience}/{slug}"] = base

def add_custom(path, slug, stage, title, h1, sub, problem, dels, variants):
    services[path] = svc(slug, stage, title, h1, sub, problem, dels, variants)

# Example variants (4 services x 5 audiences)
for aud, rows in {
    "coach": [("lead-generation", "Lead generation for coaches", "Enquiries while you coach.", "Channels for your practice — never resold lists.", "Referral-only practices have no backup when referrals pause."), ("website", "Website for your specialty", "A site that books sessions.", "Built around who you coach and how to enquire.", "Generic templates make every coach look the same."), ("social-media-marketing", "Social for coaches", "Posts through full cohorts.", "Still publishing three weeks into a full calendar.", "Posting stops when sessions fill; silence signals unavailability."), ("lead-management", "First-session closing", "Replies in minutes.", "Booking and follow-up while you are in session.", "Three-form callers book whoever answers first.")],
    "business": [("lead-generation", "Lead gen for small business", "Customers you can repeat.", "Local pages wired to phone and inbox.", "Walk-ins plateau without a second channel."), ("website", "Website that stays current", "Site matches the shop today.", "Updated when hours, prices, or services change.", "Wrong Google hours send customers elsewhere."), ("social-media-marketing", "Social for small business", "Visible on the floor.", "A month of posts without closing-time writing.", "A quiet month sends customers to active competitors."), ("lead-management", "Lead mgmt and sales support", "Answered before the next shop.", "Forms, quotes, and follow-up while you serve.", "Missed calls cost thousands; most callers skip voicemail.")],
    "freelancer": [("lead-generation", "Lead gen for freelancers", "Pipeline beyond referrals.", "A second channel for project enquiries.", "70% rely on referrals; income pauses when referrals do."), ("website", "Portfolio that sells", "Work that wins briefs.", "Case studies and a clear enquiry path.", "Managers spend <60s on portfolios; weak samples mean no brief."), ("social-media-marketing", "Social for freelancers", "Visible between projects.", "Proof posted without eating delivery time.", "Going quiet during delivery loses the next brief."), ("lead-management", "Proposals and pipeline", "Quotes chased for you.", "Triage, proposals, follow-up to decision.", "Late replies lose projects to faster freelancers.")],
    "mentor": [("lead-generation", "Lead gen for mentors", "Serious mentees only.", "Applications that filter before your calendar.", "41% of mentees come only via people who know you."), ("website", "A page worth sending", "Answer do you mentor with a link.", "Who, how, cost, and apply — ready to forward.", "A bio alone loses good fits."), ("social-media-marketing", "Content that shows thinking", "Proof before applications.", "Posts scheduled when mentoring work is heavy.", "No public thinking means not taking clients."), ("lead-management", "Mentee application triage", "Screened before your calendar.", "Fit checks, booking, polite declines.", "One bad-fit mentee costs nine months.")],
    "corporate": [("lead-generation", "Enrollment at scale", "Sign-ups without HR overload.", "Landing pages per cohort wave.", "Manual enrollment breaks past ~50 people."), ("website", "Program website", "A front door employees trust.", "Enrollment, FAQs, internal branding.", "Only 11% of L&D teams trust program ROI visibility."), ("social-media-marketing", "Program comms", "Launch rhythm for HR.", "Cohort announcements and mentor spotlights.", "One launch email is why half the pairs meet once."), ("lead-management", "Enrollment support", "Questions without HR in the middle.", "Routing, FAQs, follow-up at volume.", "Launch-week HR inboxes kill sign-up completion.")],
}.items():
    for slug, title, h1, sub, problem in rows:
        add_aud(aud, slug, title, h1, sub, problem)

# Coach renamed slugs (5)
add_custom("coach/website-built-around-your-specialty", "website-built-around-your-specialty", "Launch", "Website built around your specialty", "Built for how you coach.", "Specialty, clients, and booking — not stock coaching copy.", "75% decide on credibility in seconds; generic sites lose silent bookings.", D["website"], V["website"])
add_custom("coach/personal-branding-and-positioning", "personal-branding-and-positioning", "Position", "Personal branding and positioning", "Who you coach in one sentence.", "The referral line used everywhere.", "Vague positioning costs introductions before price is discussed.", D["positioning"], V["position"])
add_custom("coach/social-handles-claimed-and-consistent", "social-handles-claimed-and-consistent", "Launch", "Social handles claimed and consistent", "One name before you post.", "Instagram, LinkedIn, and more claimed and matched.", "Two-platform checks happen before every enquiry; mismatches look part-time.", D["social_handles"], V["handles"])
add_custom("coach/lead-management-and-first-session-closing", "lead-management-and-first-session-closing", "Run", "Lead management and first-session closing", "Every inquiry answered fast.", "Booking and follow-up to first session.", "Slow replies lose bookings to faster responders.", D["lead_mgmt"], V["lead_mgmt"])
add_custom("coach/course-creation-and-launch", "course-creation-and-launch", "Courses", "Course creation and launch", "Income without more sessions.", "Package, host, and launch what you teach.", "Hour-for-hour income caps growth; courses monetize repeat advice.", D["course"], V["course"])

# Business renamed (3) + standard set
add_custom("business/website-that-stays-current", "website-that-stays-current", "Launch", "Website that stays current", "Hours and prices match reality.", "You approve edits; we publish.", "Stale listings and sites send customers to whoever looks open now.", D["website"], V["website"])
add_custom("business/handles-and-listings-corrected", "handles-and-listings-corrected", "Launch", "Handles and listings corrected", "Google and social agree.", "Listings, hours, handles aligned.", "Wrong hours on Google cost calls you never trace.", D["listings"], V["handles"])
add_custom("business/lead-management-and-sales-support", "lead-management-and-sales-support", "Run", "Lead management and sales support", "Answered before the next shop.", "Forms, quotes, follow-up while you work.", "Unanswered forms and calls go to the next business on the list.", D["lead_mgmt"], V["lead_mgmt"])
# business standard paths inherit via root audienceVariants; only renamed slugs above

# Freelancer set (15)
add_custom("freelancer/positioning-and-pricing", "positioning-and-pricing", "Position", "Positioning and pricing", "Niche and rate you defend.", "Clear offer before discovery calls.", "No niche means competing on price every time.", D["positioning"], V["position"])
add_custom("freelancer/portfolio-website-that-sells", "portfolio-website-that-sells", "Launch", "Portfolio website that sells", "Work that wins the brief.", "Case studies and enquiry path built for hiring managers.", "Under 60 seconds to judge a portfolio; weak samples get skipped.", D["website"], V["website"])
add_custom("freelancer/referral-outreach", "referral-outreach", "Grow", "Referral outreach", "Past clients asked properly.", "Reactivation and referral asks followed up.", "Referrals dry up when nobody systematically asks.", D["referral_outreach"], V["lead_gen"])
add_custom("freelancer/proposals-follow-ups-and-pipeline", "proposals-follow-ups-and-pipeline", "Run", "Proposals, follow-ups, and pipeline", "Quotes chased while you deliver.", "Triage, proposals, follow-up to decision.", "Pipeline silence during delivery costs the next project.", D["pipeline"], V["lead_mgmt"])
for s, title, h1, sub in [
    ("business-strategy-consulting", "Strategy for freelancers", "Plan the freelance business.", "Positioning, pricing, and a plan for feast-and-famine months."),
    ("hosting-domain", "Hosting for freelancers", "Portfolio stays live.", "Renewals handled between projects."),
    ("business-email", "Email for freelancers", "Client-ready email.", "Proposals from you@domain."),
    ("social-handles", "Handles for freelancers", "Consistent freelance handles.", "No dead accounts on key platforms."),
    ("content-marketing", "Content for freelancers", "Proof you know the work.", "Case write-ups that support your rate."),
    ("email-marketing", "Email for freelancers", "Leads warmed between projects.", "Sequences so enquiries do not cool."),
    ("paid-ads-management", "Paid ads for freelancers", "Ads for your niche.", "Spend tied to portfolio pages."),
    ("sales-closing-support", "Sales for freelancers", "Close without chase debt.", "Scope and follow-up drafted."),
    ("course-creation", "Course for freelancers", "Productize repeat work.", "Earn during client projects."),
]:
    add_aud("freelancer", s, title, h1, sub, ROOT[s]["genericProblem"])

# Mentor set (18)
add_custom("mentor/mentor-positioning-and-offer-setup", "mentor-positioning-and-offer-setup", "Position", "Mentor positioning and offer setup", "Offer you can price in one line.", "Tiers, intake, and sales copy for mentoring.", "It depends pricing attracts wrong-fit mentees.", D["mentor_positioning"], V["position"])
add_custom("mentor/1-1-program-structure", "1-1-program-structure", "Position", "1:1 program structure", "Nine months with intent.", "Cadence, goals, renewals documented upfront.", "Structured mentoring succeeds 91% of the time; unstructured rarely renews.", D["program_structure"], V["position"])
add_custom("mentor/mentee-matching", "mentee-matching", "Grow", "Mentee matching", "Fit before hour one.", "Screening and applications before you commit.", "Bad-fit mentees cost nine months and reputation.", D["mentee_matching"], V["lead_gen"])
add_custom("mentor/a-page-worth-sending", "a-page-worth-sending", "Launch", "A page worth sending", "Forward when someone asks.", "Who, how, cost, apply — ready to send.", "No page means good mentees go elsewhere.", D["website"], V["website"])
add_custom("mentor/content-that-shows-your-thinking", "content-that-shows-your-thinking", "Grow", "Content that shows your thinking", "Proof before they apply.", "Essays and posts from real experience.", "Serious mentees research first; silence reads as closed.", D["content"], V["social"])
add_custom("mentor/renewals-and-proof", "renewals-and-proof", "Run", "Renewals and proof", "Outcomes you can show.", "Goals, renewals, testimonials on schedule.", "No start goals means no end proof — and no renewal.", D["renewals_proof"], V["sales"])
add_custom("mentor/course-creation-and-launch", "course-creation-and-launch", "Courses", "Course creation and launch", "Async mentoring revenue.", "Package and launch mentoring knowledge.", "Experts rarely productize what they repeat weekly.", D["course"], V["course"])
# mentor remaining standard services use root keys via example paths + unique slugs
for s, title, h1, sub in [
    ("business-strategy-consulting", "Strategy for mentors", "Plan the mentoring business.", "Program economics and a 90-day roadmap."),
    ("personal-branding", "Personal branding for mentors", "What is different about your mentoring.", "Experience turned into a priced offer."),
    ("hosting-domain", "Hosting for mentors", "Page stays up year-round.", "Infrastructure without tickets to you."),
    ("business-email", "Email for mentors", "Branded mentor email.", "Applications from a proper address."),
    ("social-handles", "Handles for mentors", "Consistent before publishing.", "One name where mentees look."),
    ("email-marketing", "Email for mentors", "Pipeline stays alive.", "Applicant and alumni updates."),
    ("paid-ads-management", "Paid ads for mentors", "Ads for applications.", "Targeting that filters early."),
    ("sales-closing-support", "Sales for mentors", "Close with confidence.", "Renewal conversations ready."),
]:
    add_aud("mentor", s, title, h1, sub, ROOT[s]["genericProblem"])

# Corporate set (19)
add_custom("corporate/matching-run-on-your-criteria", "matching-run-on-your-criteria", "Run", "Matching on your criteria", "No spreadsheet weekends.", "Rule-based matching at cohort scale.", "Manual matching breaks past 25–50 and still pairs managers wrongly.", D["corp_matching"], V["lead_mgmt"])
add_custom("corporate/conflict-checks-and-re-matching", "conflict-checks-and-re-matching", "Run", "Conflict checks and re-matching", "No manager pairings.", "Checks pre-confirm; re-match when needed.", "Manager-mentee pairs fail on day one and erode program trust.", D["corp_conflict"], V["lead_mgmt"])
add_custom("corporate/session-tracking-and-early-flags", "session-tracking-and-early-flags", "Run", "Session tracking and early flags", "See quiet pairs early.", "Logging, nudges, drift flags.", "Half the pairs meet once; leadership only sees sign-ups without tracking.", D["corp_tracking"], V["lead_mgmt"])
add_custom("corporate/mentor-onboarding", "mentor-onboarding", "Launch", "Mentor onboarding", "Mentors ready day one.", "Welcome packs HR can send as-is.", "Unclear onboarding burns volunteer mentors in month one.", D["corp_onboarding"], V["hosting"])
add_custom("corporate/reporting-leadership-can-act-on", "reporting-leadership-can-act-on", "Run", "Reporting leadership can act on", "Numbers executives trust.", "Completions, outcomes, recommendations.", "11% of L&D teams are confident programs work — visibility fixes that.", D["corp_reporting"], V["strategy"])
for s, title, h1, sub in [
    ("business-strategy-consulting", "Strategy for programs", "Program design consulting.", "Goals, rollout, and a cycle plan L&D can run."),
    ("personal-branding", "Positioning for programs", "How the program shows up.", "Consistent messaging from invite to handbook."),
    ("hosting-domain", "Hosting for programs", "Portal up each cohort.", "Monitored through launch week."),
    ("business-email", "Email for programs", "Program email IT trusts.", "Mentor and mentee comms on-domain."),
    ("social-handles", "Handles for programs", "Branded program accounts.", "Ready for internal launch."),
    ("content-marketing", "Program resources", "Assets participants use.", "Playbooks that cut HR support load."),
    ("email-marketing", "Program email", "Cohort email on schedule.", "Invites and nudges aligned to calendar."),
    ("paid-ads-management", "Paid ads for programs", "Recruitment per cohort.", "Creative aligned to HR deadlines."),
    ("sales-closing-support", "Sales for programs", "Procurement-friendly docs.", "Sponsor follow-up handled."),
    ("course-creation", "Course for programs", "Internal curriculum.", "Modules and rollout at scale."),
]:
    add_aud("corporate", s, title, h1, sub, ROOT[s]["genericProblem"])

services["defaultTemplate"] = {
    "slug": "{slug}",
    "stage": "Grow",
    "genericTitle": "{title}",
    "genericH1": "Done for you, under your name.",
    "genericSub": "We draft, a specialist reviews, you approve, then we run it on schedule.",
    "genericProblem": "Marketing and admin stop when client work peaks; the next enquiry lands on silence.",
    "deliverables": ["Kickoff to confirm goals", "Drafts in your voice for approval", "Specialist review before shipping", "Execution on agreed schedule", "Monthly summary of work completed"],
    "audienceVariants": av(("For coaches", "Runs while you coach.", "Work that does not wait for a quiet week."), ("For small business", "Runs while you work.", "Updates without closing-time tasks."), ("For freelancers", "Runs while you deliver.", "Pipeline without billable-hour cost."), ("For mentors", "Runs while you mentor.", "Outreach through heavy months."), ("For corporate programs", "Runs at program scale.", "Operations HR can see and approve.")),
}

catalog = {"services": services}
out = "/workspace/data/service-catalog.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(catalog, f, separators=(",", ":"), ensure_ascii=False)
print(len(services), "entries", len(open(out).read()), "chars")
