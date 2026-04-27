# Tech Stack & Architecture

## Frontend
- **HTML5** — semantic markup
- **CSS3** — vanilla CSS with CSS variables, media queries, flexbox
- **JavaScript (Vanilla)** — no frameworks; event listeners for menu toggle & dropdown
- **Responsive design** — mobile-first, breakpoints at 960px (tablet) and 620px (mobile)

## Deployment & DevOps
- **Git** — version control, local + remote (GitHub)
- **GitHub** — remote repository
- **Vercel** — auto-deployment on GitHub push
  - Setting: `cleanUrls: true` (routes /about to /about.html)
  - Static hosting, auto-HTTPS

## Architecture Decisions

### CSS Centralization (KEY PATTERN)
**Problem:** Duplicate dropdown/hamburger CSS across 8 HTML files (index, about, 6 outcomes)
- Made updates impossible (changes in 1 place didn't apply everywhere)
- Caused inconsistencies (arrows misaligned on some pages)

**Solution:** Single source of truth in `assets/shared.css`
- `index.html` and `about.html` and all outcome pages all import `shared.css`
- Uses `!important` flags to override page-specific CSS if needed
- Removed 268 lines of duplicate code
- Now: update nav once → applies everywhere instantly

### Mobile Menu Logic
Navigation needs different behavior on mobile vs desktop:

**Desktop:** Click "Outcomes" → dropdown shows, stays visible
**Mobile:** Click "Outcomes" → dropdown shows, but close menu when user clicks link

**Implementation:** `shared.js` checks if click parent has `.nav-outcomes-dropdown` class
- If yes → don't close menu (let dropdown stay open)
- If no → close menu

### Arrow Positioning
**Problem:** Arrow appearing below "Outcomes" text instead of to the right
**Root cause:** Using `top: 50%; transform: translateY(-50%)` created unpredictable centering

**Solution:** Use flexbox centering within the anchor element
```css
.nav-outcomes-dropdown > a::after {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  content: '›';
}
```
Arrow now perfectly aligned right, always.

## File Organization

```
/
├── index.html              (homepage)
├── about.html              (about page)
├── outcomes/
│   ├── burnout.html
│   ├── perfectionism.html
│   ├── decision-making.html
│   ├── self-sabotage.html
│   ├── overthinking.html
│   └── performance-confidence.html
├── assets/
│   ├── shared.css          (SINGLE SOURCE OF TRUTH)
│   ├── shared.js           (menu toggle + dropdown logic)
│   └── images/
│       └── hero header.jpg (used across all pages)
└── (this repo)
    ├── CLAUDE.md           (working memory)
    └── memory/             (deep memory)
```

## CSS Variables (Defined in `index.html` <style>)

```css
--mw: 1380px               (max-width container)
--px: 48px                 (horizontal padding)
--sp: 80px                 (vertical spacing)
--nav-h: 72px              (nav height)
--fd: ...serif             (display font family)
--fb: ...sans-serif        (body font family)
--dark: #14121e            (primary dark)
--dark-2: #1a1824          (darker)
--white: #ffffff
--off-white: #F2F0F0       (DEPRECATED for new work)
--block-grey: #F2F0F5      (light grey for logo wall, etc.)
--accent: #C4476C          (brand pink/magenta)
--accent-light: #E885A5    (lighter accent)
--accent-bg: #362740       (accent background)
--gray-text: #333333
--gray-light: #E8E8E8
--plum: #2d2a3e            (testimonial card bg)
--accent-h: hover version of --accent
--ft-muted: footer muted text colour
```

## Build & Deploy Process

1. **Edit locally** → Make changes to HTML/CSS/JS
2. **Test locally** → Open in browser, check responsive + mobile
3. **Git commit** → `git add` → `git commit -m "..."`
4. **Git push** → `git push origin main`
5. **Vercel auto-deploys** → Watches GitHub main branch
6. **Live** → Changes appear on production within 1-2 minutes

## Current Status
- All pages have proper nav (shared.css imported)
- Arrow alignment correct (flex-based)
- Mobile menu working (closes on link, stays on dropdown)
- Problem section background: white (`.bg-off`)
- Tagline updated: "Clear identity · Authentic leadership · Calm confidence"
- Ready to push commit `cd31be3` to GitHub
