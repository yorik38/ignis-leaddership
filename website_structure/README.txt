# Website structure

Put this entire folder next to your existing `images` folder.

Example:

repo-root/
  images/
  website_structure/
    index.html
    about.html
    coaching.html
    ...

Because this folder sits **next to** `images`, all page files use `../images/...`.

## How to use
1. Delete or archive your old `index.html`.
2. Copy the contents of this folder into your new `website_structure` folder in the repo.
3. Make sure your existing `images` folder stays in the repo root, alongside `website_structure`.
4. Open `website_structure/index.html` locally, or serve the repo root with:
   `python3 -m http.server 8000`
5. Visit:
   `http://localhost:8000/website_structure/index.html`

## Included pages
- index.html
- about.html
- coaching.html
- hypnotherapy.html
- executive-coaching-manchester.html
- hypnotherapy-manchester.html
- executive-coaching-uk.html
- hypnotherapy-uk.html
- hypnotherapy-sleep.html
- overthinking-work.html
- performance-anxiety-professionals.html
- cant-switch-off-after-work.html
- why-high-performers-energy-infrastructure-struggle-with-pressure.html
- from-engineering-to-leadership-in-high-pressure-industries.html
- the-human-cost-of-building-ai-infrastructure.html
- terms-and-conditions.html
- privacy-policy.html
- cookie-policy.html
