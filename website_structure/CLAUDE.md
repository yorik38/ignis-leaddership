# Memory

## Me
**Yorik** — Building Ignis Leadership website (outcomes-focused leadership coaching platform).

## Active Projects
| Project | Status | What |
|---------|--------|------|
| **Ignis Website** | In progress | Restructure from service-focused → outcomes-focused. 6 outcome pages, responsive nav, CSS centralization. |
| **Vercel Deploy** | Active | Auto-deployment via GitHub → Vercel with cleanUrls. |

## Key Concepts
| Term | Meaning |
|------|---------|
| **Outcomes** | 6 result-focused pages: Perfectionism, Burnout, Decision-Making Clarity, Self-Sabotage, Overthinking & Quiet Mind, Performance Confidence |
| **CSS centralization** | All shared components (nav, hamburger, dropdown, footer) in `assets/shared.css` with `!important` flags |
| **Hero header** | `images/hero header.jpg` — used across all pages, needs consistent sizing/color overlay |
| **Logo wall** | Client logos section — uses `--block-grey` (#F2F0F5) background with new tagline |
| **Problem section** | "YOU KNOW WHAT TO DO. YOU QUESTION WHO YOU ARE." — `.bg-off` class now uses white background |
| **Tagline (2026)** | "Clear identity · Authentic leadership · Calm confidence" (was "Deep sleep · Anxiety-free leadership · Unshakable confidence") |
| **Dropdown arrow** | Positioned right of "Outcomes" — uses flex alignment: `right: 0; top: 0; bottom: 0; display: flex; align-items: center` |
| **Mobile breakpoints** | 960px (tablet), 620px (mobile) |
| **Hamburger menu** | Mobile-only, triggers with click, closes on link click (except Outcomes dropdown) |

## Files & Structure
| File | Purpose |
|------|---------|
| `index.html` | Homepage — nav, hero, problem section, transform grid, testimonials, CTA |
| `about.html` | About page — shared nav/footer |
| `outcomes/*.html` | 6 outcome pages (burnout, perfectionism, decision-making, self-sabotage, overthinking, performance-confidence) |
| `assets/shared.css` | **SINGLE SOURCE OF TRUTH** — dropdown menu, hamburger, mobile menu, footer styles |
| `assets/shared.js` | Menu toggle & dropdown logic |

## Recent Fixes
- ✅ Arrow alignment: fixed vertical centering (was translateY, now flex)
- ✅ CSS centralization: removed 268 lines of duplicate code
- ✅ Mobile menu: added checks to keep dropdown open (don't close on Outcomes click)
- ✅ Tagline updated: "Clear identity · Authentic leadership · Calm confidence"
- ✅ Problem section background: changed `.bg-off` from off-white → white
- ✅ All outcome pages: added `shared.css` import

## Next Steps
- Push commit `cd31be3` to GitHub (triggers Vercel deploy)
- Test all pages: desktop (arrow right), mobile (hamburger visible)
- Verify white background on problem section live

## Tools
- **Git/GitHub** → source control & triggers Vercel
- **Vercel** → auto-deployment on push
- **Responsive design** → CSS media queries, flexbox
- **HTML/CSS/JS** → vanilla, no frameworks
