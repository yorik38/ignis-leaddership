# Ignis Leadership Website Redesign

**Status:** In progress — final stages
**Repository:** GitHub (integrated with Vercel)
**Deployment:** Vercel (auto-deploy on GitHub push)

## Vision
Transform from **service-focused** (coaching services) to **outcomes-focused** (what clients achieve).

Old positioning: Services (1-on-1, group, workshops)
New positioning: 6 quantifiable outcomes that clients get

## 6 Outcome Pages

1. **Perfectionism** → Move past perfectionism, take action
2. **Burnout** → Beat burnout, sustain high performance
3. **Decision-Making Clarity** → Make decisions with confidence
4. **Self-Sabotage** → Stop sabotaging yourself, lead authentically
5. **Overthinking & Quiet Mind** → Calm racing mind, find clarity
6. **Performance Confidence** → Unshakable confidence in results

Each outcome page:
- Consistent hero header (background image, dark overlay)
- Problem/solution messaging
- Logo wall (client testimonials)
- CTA at bottom
- Same nav & footer as homepage
- Links to all 6 outcomes (footer or nav)

## Key Updates

### Tagline (Brand Message)
**Old:** "Deep sleep · Anxiety-free leadership · Unshakable confidence"
**New:** "Clear identity · Authentic leadership · Calm confidence"

Alignment: Client knows who they are → leads authentically → gains confidence

### Color Scheme
- **Logo wall background:** Light grey (`--block-grey: #F2F0F5`)
- **Problem section:** White background (`.bg-off` class)
- **Overall:** Clean, modern, high contrast

### Navigation
- **Desktop & Tablet:** Horizontal nav with "Outcomes" dropdown showing all 6 links
- **Mobile:** Hamburger menu opens full nav; "Outcomes" becomes expandable submenu
- **Arrow:** Always positioned right of "Outcomes" (flex-aligned, not translateY)

### CSS Architecture
**Before:** Duplicate dropdown/hamburger CSS in each HTML file
**After:** Single `assets/shared.css` imported by all pages

Benefits:
- Update nav once, applies everywhere
- Removed 268 lines of duplicate code
- No more inconsistencies

### Latest Commits

| Commit | What |
|--------|------|
| cd31be3 | Update problem section background to white |
| ee1fc29 | Fix mobile menu closing on dropdown click |
| 97b121e | Centralize all dropdown CSS in shared.css |
| 70b11c4 | Fix nav dropdown and mobile menu |
| d27deb8 | Fix arrow alignment, standardise across pages |

## Remaining Work
- [x] CSS centralization
- [x] Arrow alignment (desktop & mobile)
- [x] Mobile hamburger menu
- [x] All 6 outcome pages created
- [x] Tagline updated
- [x] Problem section background white
- [x] All pages import shared.css
- [ ] **Push commit to GitHub** (triggers Vercel deploy)
- [ ] Final testing on production
- [ ] Verify all pages live with correct styles

## File Structure

```
/index.html                    (homepage)
/about.html                    (about page)
/outcomes/
  ├── burnout.html
  ├── perfectionism.html
  ├── decision-making.html
  ├── self-sabotage.html
  ├── overthinking.html
  └── performance-confidence.html
/assets/
  ├── shared.css               ← SINGLE SOURCE OF TRUTH
  ├── shared.js                ← Menu logic
  └── images/hero header.jpg
```

## Deployment Flow
1. Local edit → git commit
2. git push origin main
3. GitHub webhook → Vercel deploys
4. Live in 1-2 minutes

## Testing Checklist (Before Deploy)
- [ ] Homepage: nav arrow right, hamburger visible on mobile
- [ ] About page: nav arrow right, hamburger visible
- [ ] All 6 outcome pages: nav arrow right, hamburger visible, correct styling
- [ ] Problem section: white background
- [ ] Tagline: "Clear identity · Authentic leadership · Calm confidence"
- [ ] Logo wall: light grey background
- [ ] Mobile: menu closes on link click (except Outcomes dropdown)
- [ ] Responsive: works at 960px and 620px breakpoints

## Contact & Notes
- **Owner:** Yorik
- **Preference:** Async updates, git-based workflow
- **Deployment:** GitHub → Vercel (auto)
- **Tools:** VS Code, GitHub, Vercel dashboard
