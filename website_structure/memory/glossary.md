# Glossary

Ignis Leadership website shortcuts and internal terms.

## Outcomes (6 Result Pages)
| Code | Full Name |
|------|-----------|
| Perfectionism | Overcome perfectionism → move forward |
| Burnout | Beat burnout → sustainable performance |
| Decision-Making | Gain decision-making clarity → confidence |
| Self-Sabotage | Stop self-sabotage → authentic leadership |
| Overthinking | Quiet overthinking → calm mind |
| Performance | Build performance confidence → unshakable results |

## Technical Terms
| Term | Meaning |
|------|---------|
| Shared CSS | `assets/shared.css` — centralized styles for nav, dropdown, hamburger, footer (single source of truth) |
| Hamburger | Mobile menu toggle (3 horizontal lines) |
| Dropdown arrow | Right-aligned arrow next to "Outcomes" in nav |
| Hero header | `images/hero header.jpg` — full-width background image used across pages |
| Logo wall | Client logos section with light grey (`--block-grey`) background |
| Problem section | Dark section with "YOU KNOW WHAT TO DO..." pull-quote; uses `.bg-off` class |
| Tagline (new) | "Clear identity · Authentic leadership · Calm confidence" |
| Tagline (old) | "Deep sleep · Anxiety-free leadership · Unshakable confidence" |
| CSS centralization | Moving duplicate styles from individual pages into shared.css |
| Mobile breakpoints | 960px (tablet), 620px (mobile) |
| !important flags | CSS override technique used in shared.css to ensure styles apply across all pages |
| cleanUrls | Vercel setting for URL routing (no .html extensions) |

## Colors
| Variable | Value | Use |
|----------|-------|-----|
| --off-white | #F2F0F5 | (DEPRECATED - use --white or --block-grey) |
| --white | #FFFFFF | Clean backgrounds, card backgrounds |
| --block-grey | #F2F0F5 | Logo wall section background |
| --dark | Primary dark | Dark backgrounds (nav, footer, hero overlays) |
| --accent | Brand pink/magenta | Call-to-action, highlights |

## Files
| Shorthand | Full Path |
|-----------|-----------|
| index | /index.html (homepage) |
| about | /about.html (about page) |
| outcomes/ | /outcomes/ (burnout.html, perfectionism.html, etc.) |
| shared.css | /assets/shared.css (centralized styles) |
| shared.js | /assets/shared.js (menu logic) |

## Tools & Platforms
| Tool | Use |
|------|-----|
| Git | Source control, commit history |
| GitHub | Remote repository, trigger for Vercel |
| Vercel | Auto-deployment platform, production environment |
| VS Code | Code editor |

## CSS Classes & IDs
| Class | Purpose |
|-------|---------|
| .bg-off | Background color (problem section) — **NOW: white** |
| .navbar | Main navigation container |
| .nav-outcomes-dropdown | Outcomes dropdown menu wrapper |
| .hamburger | Mobile menu toggle button |
| .mobile-menu | Mobile menu container |
| .logo-wall | Client logos section |
| .prob-card | Problem section cards |

## Git/Deploy
| Term | Meaning |
|------|---------|
| cd31be3 | Latest commit: "Update problem section background to white" |
| Push | Send commits from local → GitHub (triggers Vercel) |
| Deploy | Vercel auto-deploys when GitHub is updated |
| Main branch | Production branch |

## Design Alignment
| Concept | Application |
|---------|-------------|
| Outcomes-focused | Website now emphasizes results/outcomes, not services |
| Responsive | Works desktop, tablet (960px), mobile (620px) |
| Unified nav | Same navigation across all pages (via shared.css) |
| White backgrounds | Clean, modern feel (problem section, cards) |
| Consistent hero | Same hero image, overlay, sizing across pages |
