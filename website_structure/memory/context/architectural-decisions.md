# Architectural Decisions

## CSS Centralization vs. Duplication

**Decision:** Single source of truth in `assets/shared.css`

**Why:**
- 8 pages share identical nav, hamburger, dropdown styling
- Duplicate code across pages meant:
  - Bug fixes only worked on some pages (inconsistency)
  - Updates required editing 8 files (maintenance nightmare)
  - Team had to remember to propagate changes everywhere (human error)

**How it works:**
```html
<!-- Every page includes -->
<link rel="stylesheet" href="../assets/shared.css?v=20260427-nav">
```

**Impact:**
- Arrow alignment fix: applies instantly to all 8 pages
- New dropdown style: update once, live everywhere
- Code is DRY (Don't Repeat Yourself) — removed 268 lines

**Technical detail:**
Uses `!important` flags to override any page-specific CSS when needed:
```css
.mobile-menu { width: 100% !important; overflow-x: hidden !important; }
```

This ensures shared.css always wins, no matter page load order.

## Arrow Positioning (Failed Approaches)

**Attempt 1: `top: 50%; transform: translateY(-50%)`**
- Result: Arrow sometimes below text, sometimes at center
- Problem: translateY offset calculated from text baseline, not predictable
- Abandoned ❌

**Attempt 2: Absolute positioning with `top: 0`**
- Result: Arrow at very top of anchor, misaligned
- Problem: Didn't account for line-height and text metrics
- Abandoned ❌

**Final: Flexbox alignment (WORKS)**
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
Result: Arrow perfectly vertically centered within anchor element, always ✅

**Why this works:**
- Flex handles text baseline automatically
- `align-items: center` centers content within its container
- `top: 0; bottom: 0` makes pseudo-element fill the anchor height
- No transforms, no guessing

## Mobile Menu Closing Logic

**Problem:** When user clicked "Outcomes" dropdown on mobile, the hamburger menu closed too

**Root cause:** JavaScript was closing burger menu on ANY link click, including the dropdown toggle

**Solution:** Check if click target is the dropdown toggle, if yes → don't close
```javascript
const parentLi = this.closest('li');
if (parentLi && parentLi.classList.contains('nav-outcomes-dropdown')) {
  return; // Don't close the menu for dropdown
}
```

**Result:** Mobile user can now click "Outcomes" → submenu opens → menu stays open until they click an actual destination link

## Mobile Menu Width Issue (100vw vs 100%)

**Attempt 1: `width: 100vw`**
- Result: Menu extends beyond viewport on right side (horizontal scrollbar)
- Problem: 100vw = full viewport width including scrollbar, breaks layout
- Abandoned ❌

**Final: `width: 100%` + `overflow-x: hidden`**
```css
.mobile-menu { width: 100%; overflow-x: hidden; }
```
Result: Menu fits perfectly, no overflow ✅

## Brand Messaging Update

**Why we updated the tagline:**
- Old tagline focused on emotional benefits: "Deep sleep · Anxiety-free leadership · Unshakable confidence"
- New positioning is outcomes-focused: "Clear identity · Authentic leadership · Calm confidence"

**Alignment:**
1. **Clear identity** — Know who you are (Perfectionism, Self-Sabotage outcomes)
2. **Authentic leadership** — Lead from that clarity (Self-Sabotage, Decision-Making outcomes)
3. **Calm confidence** — Performance flows naturally (Burnout, Overthinking, Performance outcomes)

This creates a narrative arc: self-awareness → authentic action → confident results

## Background Color Strategy

**Logo wall:** Light grey (`--block-grey: #F2F0F5`)
- Subtle contrast without being harsh
- Lets client logos stand out without overwhelming the page

**Problem section:** White (changed from off-white)
- Clean, modern aesthetic
- High contrast with dark text
- Aligns with "Outcomes-focused, clear positioning" brand strategy

**Overall:** Mostly white backgrounds with strategic dark sections (hero, footer, about)
- Creates clear visual hierarchy
- Guides user through page
- Modern, clean feel

## Why Vercel + GitHub (Not Manual Upload)

**Benefits of Vercel auto-deploy:**
1. **Atomic deploys** — entire site updates at once, no partial deploys
2. **Instant rollback** — revert to previous Git commit if something breaks
3. **Preview URLs** — test branches before merging to main
4. **HTTPS & CDN** — automatic, global
5. **Zero configuration** — detects Next.js, static sites, etc. automatically

**Workflow:**
```
edit locally → git commit → git push → Vercel sees update → auto-deploys → live
```

No manual steps, no FTP, no human error.

## Why Vanilla JavaScript (Not React/Vue)

**This project doesn't need a framework because:**
- Small scope: only 8 pages, mostly static content
- Simple interactivity: hamburger toggle + dropdown menu
- No state management: page just changes display on click
- No data binding: no real-time syncing, no complex form validation
- Performance: zero framework overhead

**What vanilla JS handles perfectly:**
```javascript
document.querySelector('.hamburger').addEventListener('click', () => {
  document.querySelector('.mobile-menu').classList.toggle('open');
});
```

Simple, readable, no build step needed.

**When we'd use a framework:**
- Multiple interconnected pieces of state
- Real-time data (live notifications, multiplayer)
- Complex forms with validation
- App-like interaction patterns

## File Organization Philosophy

Keep it flat and obvious:
- `index.html` at root (homepage entry point)
- Outcome pages in `outcomes/` folder (grouped)
- Shared assets in `assets/` (styles, images, scripts)
- Memory files in `memory/` (documentation, context)

Result: Anyone can understand structure in 30 seconds

## Testing Strategy

Before each deployment:
1. **Visual check** — arrow position, colors, spacing
2. **Responsive check** — does it work at 1920px, 960px, 620px?
3. **Interaction check** — does hamburger toggle work? Does dropdown open/close?
4. **Link check** — do outcome pages link back to each other?

No automated tests needed (static content), but manual testing is quick because scope is small.

## Performance Considerations

**Current optimizations:**
- Static HTML (no server needed)
- CSS variables for theming (no duplication)
- Flexbox layouts (no complex calculations)
- Single shared.css (browser caches it across pages)

**If performance becomes an issue:**
- Minify CSS/JS
- Lazy-load images
- Add critical CSS above fold
- Compress hero image further

For now: load time is already sub-second, no action needed.
