# Template Copy Checklist: Scaling index.html Across All Pages

This checklist ensures every page uses the consistent Ignis design system whilst allowing content customization.

---

## SECTIONS THAT REMAIN IDENTICAL ACROSS ALL PAGES

### 1. Navigation Bar
- **File**: Fully copied from index.html `<nav>` section
- **What Stays The Same**:
  - Logo markup and structure
  - All nav items: Home | About | Work with me (dropdown) | Methods | Challenges (dropdown) | Let's talk
  - Dropdown menus with 100% identical structure
  - All CSS classes and data attributes
  - JavaScript toggle functionality
- **What Changes**:
  - Active nav state (add `class="nav-active"` to current page link)
  - Example: On About page, the "About" link gets `class="nav-active"`

### 2. Footer Section
- **File**: Fully copied from index.html `<footer>` section
- **What Stays The Same**:
  - All footer markup, links, styling
  - Copyright text
  - Social links structure
- **What Changes**:
  - None. Footer is completely identical.

### 3. Stylesheet Links (in `<head>`)
```html
<link rel="stylesheet" href="assets/shared.css">
```
- Copy exactly as-is to every page
- **Exception for service/challenge pages in subdirectories**:
  - If page is at `/services/1-1-transformation/index.html`, use: `<link rel="stylesheet" href="../../assets/shared.css">`
  - If page is at `/challenges/anxiety/index.html`, use: `<link rel="stylesheet" href="../../assets/shared.css">`

### 4. JavaScript (at bottom of `<body>`)
```html
<script>
  // Dropdown toggle code
  document.addEventListener('click', (e) => {
    if (e.target.closest('.nav-work-dropdown-toggle')) {
      const navWorkLi = e.target.closest('.nav-work-dropdown');
      navWorkLi.classList.toggle('nav-open');
    }
    if (e.target.closest('.nav-outcomes-dropdown-toggle')) {
      const navOutcomesLi = e.target.closest('.nav-outcomes-dropdown');
      navOutcomesLi.classList.toggle('nav-open');
    }
  });
</script>
```
- Copy exactly as-is to every page

### 5. Meta Tags (in `<head>`)
- Copy all meta tags from index.html
- **Update these per page**:
  - `<title>` - Page title
  - `<meta name="description">` - Page meta description (160 chars max)
  - `<meta property="og:title">` - Social share title
  - `<meta property="og:description">` - Social share description

---

## HERO SECTION: CUSTOMIZATION PER PAGE TYPE

The hero section structure remains identical across all pages. Only the headline, subheading, and CTA change.

### Hero HTML Structure (Copy as-is)
```html
<section class="hero">
  <div class="hero-container">
    <h1 class="hero-h1">[CUSTOMIZE HEADLINE]</h1>
    <p class="hero-sub">[CUSTOMIZE SUBHEADING]</p>
    <button class="cta-primary" onclick="window.location.href='[CUSTOMIZE LINK]';">[CUSTOMIZE BUTTON TEXT]</button>
  </div>
</section>
```

### Hero Styling (Copy from index.html `<style>` section)
- Copy all `.hero`, `.hero-container`, `.hero-h1`, `.hero-sub`, `.cta-primary`, `.cta-secondary` styles exactly
- These styles remain 100% identical across all pages

### Page Type: HOMEPAGE (index.html) — Reference Template
```html
<h1 class="hero-h1">You've built a successful career. Now let's build the life.</h1>
<p class="hero-sub">For high achievers in their 40s who are still delivering, but quietly running on empty inside.</p>
<button class="cta-primary" onclick="window.location.href='#assessment';">Free Reignite Assessment</button>
```

### Page Type: ABOUT PAGE (about/index.html)
```html
<h1 class="hero-h1">How I Help High Achievers Reclaim Their Life</h1>
<p class="hero-sub">Your background in leadership is brilliant. Now we focus on your wellbeing.</p>
<button class="cta-primary" onclick="window.location.href='#book';">Let's Talk</button>
```

### Page Type: 1:1 TRANSFORMATION SERVICE PAGE (services/1-1-transformation/index.html)
```html
<h1 class="hero-h1">Bespoke Coaching for High-Performing Leaders</h1>
<p class="hero-sub">Personalized sessions designed for your specific challenges and goals.</p>
<button class="cta-primary" onclick="window.location.href='#book';">Book a Consultation</button>
```

### Page Type: COURSES SERVICE PAGE (services/courses/index.html)
```html
<h1 class="hero-h1">Self-Guided Learning for Busy Leaders</h1>
<p class="hero-sub">Master the Clear Identity Method at your own pace.</p>
<button class="cta-primary" onclick="window.location.href='#courses';">Explore Courses</button>
```

### Page Type: CHALLENGE OUTCOME PAGES (challenges/[challenge-name]/index.html)

#### High-Stakes Anxiety (challenges/anxiety/index.html)
```html
<h1 class="hero-h1">High-Stakes Anxiety That's Holding You Back</h1>
<p class="hero-sub">Feel clear, confident, and capable in high-pressure situations.</p>
<button class="cta-primary" onclick="window.location.href='#book';">Let's Talk</button>
```

#### Executive Burnout (challenges/burnout/index.html)
```html
<h1 class="hero-h1">The Burnout That Success Alone Won't Fix</h1>
<p class="hero-sub">Restore energy and purpose without sacrificing your career.</p>
<button class="cta-primary" onclick="window.location.href='#book';">Let's Talk</button>
```

#### Imposter Syndrome (challenges/imposter-syndrome/index.html)
```html
<h1 class="hero-h1">Imposter Syndrome: When External Success Meets Internal Doubt</h1>
<p class="hero-sub">Stop waiting to be found out. Own your expertise.</p>
<button class="cta-primary" onclick="window.location.href='#book';">Let's Talk</button>
```

#### Decision Paralysis (challenges/decision-paralysis/index.html)
```html
<h1 class="hero-h1">Stuck Between Options? Decision Paralysis Ends Here</h1>
<p class="hero-sub">Make decisions with clarity and move forward without second-guessing.</p>
<button class="cta-primary" onclick="window.location.href='#book';">Let's Talk</button>
```

#### Perfectionism & Procrastination (challenges/perfectionism/index.html)
```html
<h1 class="hero-h1">Perfectionism That Once Drove You Is Now Holding You Back</h1>
<p class="hero-sub">Break the cycle. Deliver without the constant self-criticism.</p>
<button class="cta-primary" onclick="window.location.href='#book';">Let's Talk</button>
```

#### Performance Blocks (challenges/performance-blocks/index.html)
```html
<h1 class="hero-h1">Performance Blocks: Capability Meets Self-Doubt</h1>
<p class="hero-sub">Access your full potential when it matters most.</p>
<button class="cta-primary" onclick="window.location.href='#book';">Let's Talk</button>
```

---

## MAIN CONTENT SECTION: AFTER HERO

### Homepage (index.html)
- Assessment banner (sticky)
- "I am a..." section (existing)
- Testimonials section
- Footer

### About Page
- Professional background section
- Qualifications/credentials
- Approach overview
- Client testimonials
- Footer

### Service Pages (1:1 Transformation & Courses)
- What's included section
- Pricing/investment section
- Process/how it works
- Testimonials
- CTA section
- Footer

### Challenge Pages (All 6 outcomes)
- Problem identification ("Do you relate to this?")
- The cost section
- What becomes possible section
- How it works (brief)
- Testimonial (specific to this challenge)
- Investment & CTA section
- Cross-links to related challenges
- Footer

---

## ACTIVE NAV STATE: HOW TO SET IT

Every page must highlight its current section in the nav bar.

### For Homepage (index.html)
```html
<!-- No active state needed, or set on Home link -->
<a href="/">Home</a>
```

### For About Page (about/index.html)
```html
<a href="/about" class="nav-active">About</a>
```

### For 1:1 Transformation Service Page (services/1-1-transformation/index.html)
```html
<!-- The "Work with me" dropdown toggle stays, but the "1:1 Transformation" link gets active -->
<a href="/services/1-1-transformation" class="nav-active">1:1 Transformation</a>
```

### For Courses Service Page (services/courses/index.html)
```html
<a href="/services/courses" class="nav-active">Courses</a>
```

### For Challenge Pages (challenges/[name]/index.html)
```html
<!-- The "Challenges" dropdown toggle stays, but the specific challenge link gets active -->
<a href="/challenges/anxiety" class="nav-active">High-Stakes Anxiety</a>
```

---

## FILE PATHS: RELATIVE LINKS FOR SUBPAGES

### If copying to `/about/index.html` (one level deep)
- Stylesheets: `<link rel="stylesheet" href="../assets/shared.css">`
- Nav home link: `<a href="/">Home</a>` (absolute, no change)
- Nav challenge link: `<a href="/challenges/anxiety">High-Stakes Anxiety</a>` (absolute, no change)

### If copying to `/services/1-1-transformation/index.html` (two levels deep)
- Stylesheets: `<link rel="stylesheet" href="../../assets/shared.css">`
- Nav home link: `<a href="/">Home</a>` (absolute, no change)
- Nav challenge link: `<a href="/challenges/anxiety">High-Stakes Anxiety</a>` (absolute, no change)

### If copying to `/challenges/anxiety/index.html` (two levels deep)
- Stylesheets: `<link rel="stylesheet" href="../../assets/shared.css">`
- Nav home link: `<a href="/">Home</a>` (absolute, no change)
- Nav challenge link: `<a href="/challenges/anxiety">High-Stakes Anxiety</a>` (absolute, no change)

---

## STEP-BY-STEP COPY PROCEDURE

### Step 1: Create the file structure
```
website_structure/
├── index.html (master template)
├── about/
│   └── index.html
├── services/
│   ├── 1-1-transformation/
│   │   └── index.html
│   └── courses/
│       └── index.html
└── challenges/
    ├── anxiety/
    │   └── index.html
    ├── burnout/
    │   └── index.html
    ├── imposter-syndrome/
    │   └── index.html
    ├── decision-paralysis/
    │   └── index.html
    ├── perfectionism/
    │   └── index.html
    └── performance-blocks/
        └── index.html
```

### Step 2: Copy index.html to create each new page
1. Open `index.html`
2. Select all (Cmd+A or Ctrl+A)
3. Copy
4. Create new file at target location (e.g., `about/index.html`)
5. Paste entire content

### Step 3: Update the new page
For each new page, change ONLY these sections:

**In `<head>`:**
- `<title>` tag
- `<meta name="description">`
- `<meta property="og:title">`
- `<meta property="og:description">`
- Stylesheet path (if page is 2+ levels deep)

**In `<nav>` section:**
- Set `class="nav-active"` on the current page's link
- Remove `class="nav-active"` from other links

**In `.hero` section:**
- Update `<h1 class="hero-h1">` text
- Update `<p class="hero-sub">` text
- Update button link and text

**In main content:**
- Replace homepage-specific content with page-specific content
- Keep footer 100% identical

### Step 4: Verify before publishing
- [ ] Stylesheets load correctly (check browser DevTools)
- [ ] Nav links work and active state displays
- [ ] Dropdowns open/close properly
- [ ] Hero section displays correctly
- [ ] Button links point to correct destinations
- [ ] Footer displays identically to homepage
- [ ] Test on mobile (responsive design)

---

## PAGES TO CREATE (In Priority Order)

### Priority 1: Core Pages
- [ ] **About page** → `/about/index.html`
- [ ] **1:1 Transformation service** → `/services/1-1-transformation/index.html`
- [ ] **Courses service** → `/services/courses/index.html`

### Priority 2: Challenge Outcome Pages
- [ ] **High-Stakes Anxiety** → `/challenges/anxiety/index.html`
- [ ] **Executive Burnout** → `/challenges/burnout/index.html`
- [ ] **Imposter Syndrome** → `/challenges/imposter-syndrome/index.html`
- [ ] **Decision Paralysis** → `/challenges/decision-paralysis/index.html`
- [ ] **Perfectionism & Procrastination** → `/challenges/perfectionism/index.html`
- [ ] **Performance Blocks** → `/challenges/performance-blocks/index.html`

---

## QUICK REFERENCE: What Changes Per Page

| Section | Homepage | About | 1:1 Service | Courses | Challenges |
|---------|----------|-------|------------|---------|-----------|
| **Nav** | (none) | `About` active | `1:1 Trans.` active | `Courses` active | Challenge name active |
| **Hero H1** | "You've built..." | "How I Help..." | "Bespoke Coaching..." | "Self-Guided Learning..." | [Challenge-specific] |
| **Hero Sub** | "For high achievers..." | "Your background..." | "Personalized sessions..." | "Master the Clear..." | [Challenge-specific] |
| **Hero CTA** | "Free Reignite..." | "Let's Talk" | "Book a Consultation" | "Explore Courses" | "Let's Talk" |
| **Main Content** | Assessment + "I am" + testimonials | Background + credentials | What's included + pricing | Course overview | Problem + cost + benefits |
| **Footer** | Identical | Identical | Identical | Identical | Identical |
| **Stylesheet Path** | `assets/shared.css` | `../assets/shared.css` | `../../assets/shared.css` | `../../assets/shared.css` | `../../assets/shared.css` |

---

## Notes
- The nav dropdowns remain fully functional across all pages
- The sticky assessment banner (if kept) appears on all pages
- All CSS and JavaScript stays identical
- The only variables are: page title, meta tags, nav active state, hero content, main content section
