# Ignis Leadership – Monthly SEO and Metadata Health Review

**Review date:** 1 October 2026
**Site reviewed:** www.ignisleadership.com (website_structure workspace folder)

This is the first dated monthly record in this series. Overall the site's own metadata is in strong shape: every primary page, legal page and newsletter post carries a complete title, meta description, canonical tag, Open Graph set, Twitter Card set and appropriate JSON-LD. The two issues worth Yorik's attention this month are a routing conflict on three draft-style pages and a stale Google listing that has not yet caught up with the site's current bid management positioning.

## Technical and metadata health

robots.txt and sitemap.xml are both present and well formed. robots.txt correctly allows all crawlers, including the named AI assistant bots, and points to the sitemap. Every URL listed in sitemap.xml corresponds to a real, live-routed page (homepage, about, bid, tender, case-study, contact, insights, archive, privacy, terms, and all six current newsletter posts), so there are no dead sitemap entries.

However, six real page files exist in the folder that are not in the sitemap: discovery.html, commercial-ai-readiness.html, resources.html and the three resource articles (ai-augmented-bid-practice, bid-agent-maturity, choose-first-ai-bid-use-case). On inspection this is not simply a missing-sitemap-entry issue: vercel.json currently redirects each of these URLs elsewhere (/discovery and /commercial-ai-readiness both 301 to /#services, and /resources plus /resources/:slug* both 301 to /insights). So these six files carry full, polished SEO metadata, including self-referencing canonical tags, Open Graph tags and JSON-LD, pointing at URLs that will never actually serve that page's content because the routing layer redirects away first. This is worth a deliberate decision rather than leaving as is: either these pages are meant to go live soon, in which case the matching redirect rules in vercel.json should be removed, or they are superseded drafts, in which case it would be tidier to archive the files so they do not sit in the live folder with contradictory routing.

A smaller gap: twitter:image:alt is missing on four pages (resources.html and the three resource articles), even though og:image:alt is present on all of them. Easy fix whenever those pages are next touched.

All ten unique images referenced across og:image and twitter:image tags site-wide were checked against the assets/img folder, and all ten exist. No broken image references this month, so the stale-preview issue from the original audit has not recurred.

## Live search presence

A search for "ignisleadership.com" still returns a stale Google listing for the site: the shown title and description describe the old identity-coaching and hypnotherapy positioning ("The Clear Identity Method for Senior Leaders", "1:1 Executive Transformation", "The People's Power Newsletter"), not the current bid management and governed agentic AI positioning that is now live on every page. This is the same class of issue caught in the original audit and it has not yet cleared from Google's index. Worth requesting re-indexing of the homepage and key pages via Search Console, and checking the URL Inspection tool confirms Google has crawled the live version.

A plain search for "Ignis Leadership" (without the domain) is noisier, since the name is shared with several unrelated organisations (an energy group, a healthcare software firm, a wildfire-safety company, and others), but the search engine's own summary of the site itself did correctly describe it as a bid and tender consultancy working with agentic AI, which suggests the newer positioning is starting to surface in some contexts even though the classic SERP snippet has not refreshed yet.

## Keyword and content opportunity scan

The current keyword focus (bid management consultancy, governed agentic AI, energy/infrastructure/industrial sector terms) is well reflected in the homepage and insights hub metadata and body copy. Two gaps worth noting rather than a full audit:

- "Fractional bid director" does not appear anywhere on the site, despite being part of Yorik's stated positioning and despite the About page already referencing genuine Bid Director experience at bp, RWE and Bouygues. This is a supportable long-tail term with no content behind it yet.
- "Data centre" does not appear anywhere on the site, despite being named as a target vertical. No client evidence exists for this sector on the site, so any new content should stay at the level of market commentary rather than implying delivered work.

Suggestions for next month:

- Add a short insights post or a line in the About/homepage copy that explicitly targets "fractional bid director" as a service framing, since the supporting experience is already documented and this is currently an open long-tail opportunity.
- Consider a data centre-focused insights post on AI governance challenges in data centre capital project tenders, framed as market commentary rather than a case study, to begin building topical relevance for that named vertical without overclaiming.

## Summary of flagged items

- Routing conflict: discovery.html, commercial-ai-readiness.html, resources.html and its three articles have full SEO metadata but are redirected away by vercel.json before that content can ever be served or indexed. Needs a decision: unblock the redirects or archive the files.
- Missing twitter:image:alt on resources.html and its three article pages (og:image:alt is present on all four).
- Google's indexed snippet for ignisleadership.com is still showing the old identity-coaching positioning and needs a re-indexing request via Search Console.
- No broken og:image/twitter:image references found this month.
- Content opportunity: "fractional bid director" and "data centre" are named positioning terms with no current content behind them.

No live site files were modified as part of this review.
