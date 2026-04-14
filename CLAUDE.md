# CLAUDE.md — Ignis Leadership Project Context

> This file is read automatically at the start of every session. It gives Claude full context about the business, workspace, and skills to use.

---

## Business Context

**Company:** Ignis Leadership
**Owner:** Yorik Tisseau (yorik.tisseau@gmail.com)
**Services:** Executive coaching and clinical hypnotherapy for high-performers, engineers, and leaders — particularly in energy, infrastructure, and tech sectors
**Location:** Manchester, UK
**Website:** Hosted on Vercel
**Google Analytics:** G-08D7N7C1NX (GA4)

**Key audiences:**
- High-performing professionals who can't switch off
- Engineers moving into leadership
- Tech CEOs / founders with anxiety or sleep issues
- Women leaders seeking confidence coaching
- Energy/infrastructure sector professionals under pressure

---

## Workspace Paths

| What | Host Path | Notes |
|------|-----------|-------|
| Live website files | `~/Desktop/websites/ignis leadership/website_structure/` | 8 HTML pages, hosted on Vercel |
| Global skills library | `~/Documents/Claude/skills/` | Mount at start of every session |
| Old website (archive) | `~/Documents/Claude/projects/ignis website radical brievety/` | Do not use — moved to Desktop |

**At the start of every session, request access to:**
1. `~/Desktop/websites/ignis leadership` — live website
2. `~/Documents/Claude/skills` — global skills library

---

## Live Website Pages

Located in `website_structure/`:

| File | Purpose |
|------|---------|
| `index.html` | Homepage |
| `about.html` | About Yorik |
| `coaching.html` | Executive coaching service page |
| `hypnotherapy.html` | Hypnotherapy service page |
| `hypnotherapy-sleep.html` | Sleep-specific hypnotherapy (SEO page) |
| `privacy-policy.html` | Legal |
| `cookie-policy.html` | Legal |
| `terms-and-conditions.html` | Legal |

Also contains: `assets/`, `images/`, `vercel.json`

**All pages have Google Analytics G-08D7N7C1NX installed (added April 2026).**

---

## Brand Identity

**Fonts:**
- Display / headings: `Bebas Neue` (weight 400)
- Body: `Inter` (weights 300, 400, 500, 600)

**Colour palette:**
```
--accent:       #C4476C   (rose/crimson — primary CTA, highlights)
--accent-h:     #A8325A   (accent hover)
--accent-light: #E0789A   (soft rose — eyebrows, active nav links)
--dark:         #1F2330   (near-black — dark sections)
--dark-2:       #262D3C   (slightly lighter dark)
--plum:         #1E1232   (deep plum — rarely used)
--white:        #FFFFFF
--off-white:    #F6F2EC   (warm cream — section backgrounds)
--gray-text:    #6C6C78   (body text on light)
--gray-light:   #E0DFE8   (dividers, grid gaps)
```

**Design style:** Elegant (confirmed) — refined, premium, human. Dark hero sections, generous whitespace, restrained typography, rose accent. Reference `skills/awesome-design-skills-main/skills/elegant/SKILL.md` for all HTML/design work.

**Tone:** Direct, confident, non-clinical. Speaks to high-performers who are self-aware but stuck. Not soft or overly therapeutic — authoritative yet warm.

**Logo:** `images/logo nav bar.png` — inverts to white on dark backgrounds, normal on scrolled/light nav.

**Booking:** Calendly is integrated and functional. All CTAs should link to or embed Calendly.

---

## Website Status & Roadmap

### Current issues to fix
- `hypnotherapy-sleep.html` uses a **different nav, hero, mobile menu, and footer** from the rest of the site — must be brought in line with `index.html` / `coaching.html`
- Hero header style is inconsistent across pages — homepage uses full-screen hero with hcards; inner pages use `pg-hero` style — keep `pg-hero` for inner pages but make sure it is visually consistent
- Mobile navigation differs on `hypnotherapy-sleep.html`

### Pages to improve (coaching.html + hypnotherapy.html)
Add the following — but keep pages **concise, not long**:
- Pricing section: Coaching from £2,997 | Hypnotherapy 4-session programme £480
- More detail on process (what happens in a session, the journey, what to expect)
- Testimonials / social proof relevant to each service

### Assessment landing page (coming — hold for now)
- Sleep assessment → leads to digital product (7-day sleep improvement hypnosis + PDFs)
- Full brief from Yorik to follow

### SEO pages (hold for now)
- More pages to follow same pattern as `hypnotherapy-sleep.html`
- Topics TBD — wait for brief from Yorik

---

## Skills — When to Use What

Always read the relevant SKILL.md **before** starting work. Skills are in `~/Documents/Claude/skills/`.

### File Creation Skills (built-in — always use these)
| Task | Skill to read |
|------|--------------|
| Create/edit Word document (.docx) | `skills/docx/SKILL.md` |
| Create/edit PowerPoint (.pptx) | `skills/pptx/SKILL.md` |
| Create/edit Excel spreadsheet (.xlsx) | `skills/xlsx/SKILL.md` |
| Create/edit PDF | built-in pdf skill |

### Website & SEO Skills (global library)
| Task | Skill path |
|------|-----------|
| SEO audit or improvements | `skills/seo-audit/SKILL.md` |
| AI SEO / optimise for LLM answers | `skills/ai-seo/SKILL.md` |
| Rewrite or improve page copy | `skills/copywriting/SKILL.md` |
| Edit/proofread existing copy | `skills/copy-editing/SKILL.md` |
| Site structure / navigation | `skills/site-architecture/SKILL.md` |
| Add schema markup | `skills/schema-markup/SKILL.md` |
| Landing page conversion | `skills/page-cro/SKILL.md` |
| Analytics setup or troubleshooting | `skills/analytics-tracking/SKILL.md` |
| Frontend / HTML design work | `skills/frontend-design/SKILL.md` or `skills/senior-frontend/SKILL.md` |
| Programmatic SEO pages | `skills/programmatic-seo/SKILL.md` |

### Content & Marketing Skills (global library)
| Task | Skill path |
|------|-----------|
| Plan what content to create | `skills/content-strategy/SKILL.md` |
| Write blog posts, articles, social | `skills/copywriting/SKILL.md` |
| LinkedIn posts | `skills/linkedin-posts/SKILL.md` |
| Social media content | `skills/social-content/SKILL.md` |
| Email sequences | `skills/email-sequence/SKILL.md` |
| Cold outreach emails | `skills/cold-email/SKILL.md` |
| Paid ads copy | `skills/paid-ads/SKILL.md` |
| Ad creative | `skills/ad-creative/SKILL.md` |
| Launch strategy | `skills/launch-strategy/SKILL.md` |
| Lead magnet creation | `skills/lead-magnets/SKILL.md` |
| Competitor research | `skills/competitor-alternatives/SKILL.md` |
| Marketing ideas / brainstorm | `skills/marketing-ideas/SKILL.md` |
| Marketing psychology | `skills/marketing-psychology/SKILL.md` |
| Product marketing context | `skills/product-marketing-context/SKILL.md` |
| Free tool strategy | `skills/free-tool-strategy/SKILL.md` |
| Referral programme | `skills/referral-program/SKILL.md` |
| Churn / retention | `skills/churn-prevention/SKILL.md` |
| Pricing strategy | `skills/pricing-strategy/SKILL.md` |
| RevOps / sales ops | `skills/revops/SKILL.md` |
| Sales enablement | `skills/sales-enablement/SKILL.md` |

### CRO Skills (global library)
| Task | Skill path |
|------|-----------|
| Improve signup / booking flow | `skills/signup-flow-cro/SKILL.md` |
| Optimise forms | `skills/form-cro/SKILL.md` |
| Onboarding optimisation | `skills/onboarding-cro/SKILL.md` |
| Popup / lead capture | `skills/popup-cro/SKILL.md` |
| Paywall / upgrade pages | `skills/paywall-upgrade-cro/SKILL.md` |
| A/B test setup | `skills/ab-test-setup/SKILL.md` |

### Design Skills — Awesome Design Skills Library
Located in `skills/awesome-design-skills-main/skills/`. Read the relevant SKILL.md before any design or frontend work. Each skill contains typography, colour palette, spacing, component specs, and accessibility rules.

**Recommended for Ignis Leadership** (premium, trust-building, high-performer audience):

| Style | Skill path | Best for |
|-------|-----------|---------|
| Elegant | `awesome-design-skills-main/skills/elegant/SKILL.md` | Default — refined, high-end feel |
| Luxury | `awesome-design-skills-main/skills/luxury/SKILL.md` | Premium positioning, dark backgrounds |
| Premium | `awesome-design-skills-main/skills/premium/SKILL.md` | High-value service pages |
| Refined | `awesome-design-skills-main/skills/refined/SKILL.md` | Subtle, sophisticated layouts |
| Sleek | `awesome-design-skills-main/skills/sleek/SKILL.md` | Tech-forward, engineers/leaders audience |
| Dramatic | `awesome-design-skills-main/skills/dramatic/SKILL.md` | Hero sections, emotional impact |
| Modern | `awesome-design-skills-main/skills/modern/SKILL.md` | Clean contemporary layouts |
| Minimal | `awesome-design-skills-main/skills/minimal/SKILL.md` | Distraction-free, focused pages |
| Clean | `awesome-design-skills-main/skills/clean/SKILL.md` | Simple, clear service pages |
| Professional | `awesome-design-skills-main/skills/professional/SKILL.md` | Corporate/enterprise audience |
| Editorial | `awesome-design-skills-main/skills/editorial/SKILL.md` | Blog posts, long-form content |
| Storytelling | `awesome-design-skills-main/skills/storytelling/SKILL.md` | About page, Yorik's journey |

**Full library** (57 styles total) — all other styles available in `awesome-design-skills-main/skills/`:
`agentic`, `ant`, `application`, `artistic`, `bento`, `bold`, `brutalism`, `cafe`, `claymorphism`, `colorful`, `contemporary`, `corporate`, `cosmic`, `creative`, `dashboard`, `dithered`, `doodle`, `energetic`, `enterprise`, `expressive`, `fantasy`, `flat`, `friendly`, `futuristic`, `glassmorphism`, `gradient`, `levels`, `lingo`, `material`, `mono`, `neobrutalism`, `neon`, `neumorphism`, `pacman`, `paper`, `perspective`, `publication`, `retro`, `shadcn`, `simple`, `skeumorphism`, `spacious`, `tetris`, `ui-design-system`, `vibrant`, `vintage`

**When doing any HTML/design work:** always read the chosen design skill BEFORE writing code.

---

### Plugin Skills (always available, no mount needed)
| Task | Plugin skill |
|------|-------------|
| Brand voice guidelines | `brand-voice:guideline-generation` |
| Write on-brand content | `brand-voice:brand-voice-enforcement` |
| Discover brand materials | `brand-voice:discover-brand` |
| Marketing campaign plan | `marketing:campaign-plan` |
| Draft marketing content | `marketing:draft-content` |
| SEO audit (plugin) | `marketing:seo-audit` |
| Competitive brief | `marketing:competitive-brief` |
| Brand review | `marketing:brand-review` |
| Performance report | `marketing:performance-report` |
| Email sequence (plugin) | `marketing:email-sequence` |

---

## Key Instructions for Claude

1. **Always mount the skills library** (`~/Documents/Claude/skills`) if it's not already mounted before doing any content, SEO, or website work.
2. **Always read the relevant SKILL.md** before starting any non-trivial task — don't skip this.
3. **Live website edits go to** `~/Desktop/websites/ignis leadership/website_structure/` — not the old archive folder.
4. **All HTML files already have GA4** (G-08D7N7C1NX) installed — don't add it again.
5. **Vercel deployment** — after editing HTML files, remind Yorik to push/deploy to Vercel.
6. When in doubt about which skill to use, check this file first, then read the SKILL.md.
