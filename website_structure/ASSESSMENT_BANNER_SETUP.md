# Assessment Banner Setup Guide

## Overview
A sticky assessment banner has been created to appear at the top of your pages. It features:
- Responsive design that works on all devices
- Matches your Ignis brand colours and typography
- Sticky positioning (stays at top as users scroll)
- Smooth hover animations

## Files Created
- `assets/assessment-banner.css` - All styling
- `assets/assessment-banner.html` - Banner markup

## How to Add to Your Pages

### Step 1: Link the CSS
In the `<head>` section of each page, add this line (place it after other stylesheets):
```html
<link rel="stylesheet" href="assets/assessment-banner.css">
```

### Step 2: Add the Banner HTML
Right after your opening `<body>` tag (and ideally before or after your `<nav>` element), add:
```html
<!-- Assessment Banner -->
<div class="assessment-banner">
  <div class="assessment-banner__container">
    <h2 class="assessment-banner__heading">Stop the Struggle. Start Your Breakthrough.</h2>
    <p class="assessment-banner__subtext">Free Assessment: 2 minutes to clarity.</p>
    <button class="assessment-banner__button" onclick="window.location.href='#assessment';">Start Now</button>
  </div>
</div>
```

### Step 3: Update the Button Link
Change the `onclick` attribute in the button to point to your assessment:
```html
onclick="window.location.href='YOUR_ASSESSMENT_URL';"
```

For example:
- If your assessment is at `https://ignisleadership.com/assessment`, use: `window.location.href='/assessment';`
- If it's a form or external link, use the full URL

## Pages to Update
Apply the banner to:
- [ ] index.html
- [ ] about.html
- [ ] Any other key landing pages

## Customisation Options

### Change Button Text
Edit the button text in the HTML. Currently set to "Start Now"

### Adjust Spacing/Padding
The banner uses CSS variables from your design system:
- `--px` - horizontal padding (adjusts with viewport)
- `--gap-md` - spacing between elements
- `--mw` - max width

### Modify Colours
If you want different shades, edit the gradient in `assessment-banner.css`:
```css
background: linear-gradient(135deg, #C4476C 0%, #A8325A 100%);
```

### Remove Sticky Positioning
If you don't want it to stick, remove or change this line in the CSS:
```css
position: sticky;
top: 0;
```

## Notes
- The banner has `z-index: 999` so it appears above most content. Adjust if needed.
- On mobile, text and button scale responsively
- Includes smooth hover effects and transitions
