# Site form setup

Signal signups, white-paper downloads and the Market Monitor download post to the site’s own API. Each handler submits to the HubSpot Forms API v3. Bot checks run before that call. A property HubSpot does not recognise is retried without the extra fields, so a field mismatch does not drop the lead.

The contact page does not use this API. `/contact` embeds HubSpot form `3c83d1fd-334f-4bf6-9068-47e7f2044ad8`. The old site handler `api/contact.js` posted to form `c4133ecb-5cca-4779-bb4e-9f85bf3d8bc3`, whose public definition now 404s, and no page posts to `/api/contact`. That function, its Vercel entry and the old `/api/contact` path in `assets/script.js` are removed. Remove `HUBSPOT_CONTACT_FORM_ID` from Vercel if it is still set.

The Market Monitor PDF is still returned when `HUBSPOT_MARKET_MONITOR_FORM_ID` is unset. The server logs a warning, and a ticked Signal box is still submitted to the Signal form. The delivery email itself is the HubSpot workflow on the Market Monitor form, not a mailer in this repo.

## Turn off reCAPTCHA on forms the site posts to

A valid Signal signup currently returns HTTP 502 from `/api/subscribe`. HubSpot answers the public Forms API with `FORM_HAS_RECAPTCHA_ENABLED`: form `9ee4b5ce-211f-4be1-a8d1-69809052e8b2` has CAPTCHA version V2 on. The public Forms API cannot send HubSpot’s captcha token, and stripping extra fields does not get past it. The hosted share form still works because that page includes the captcha widget.

Turn CAPTCHA / reCAPTCHA off on every form the site API submits:

- Signal `9ee4b5ce-211f-4be1-a8d1-69809052e8b2`
- Bids white paper `9b783156-b16d-443a-bc80-51bab3411670`
- Commercial system white paper `5b3bb573-2ca5-47cc-8bc0-3e8b0f4023d5`
- the Market Monitor form, once `HUBSPOT_MARKET_MONITOR_FORM_ID` is set

Leave CAPTCHA on the contact embed `3c83d1fd-334f-4bf6-9068-47e7f2044ad8`. That form is rendered by HubSpot, so its widget can run. No new Vercel secret is required. The site already drops obvious bots with a honeypot, a three-second fill time, a rate limit, optional Turnstile, and a loose Gmail pattern.

After CAPTCHA is off, a real work email with the Signal box ticked, and `form_started_at` more than about three seconds old, should return 200 and create a submission on the Signal form.

## Environment variables

| Variable | Required before 21 October 2026 | Purpose |
| --- | --- | --- |
| `HUBSPOT_PORTAL_ID` | Confirm it. Default in code: `149324702` | HubSpot portal used by every form submission |
| `HUBSPOT_SIGNAL_FORM_ID` | Confirm it. Default in code: `9ee4b5ce-211f-4be1-a8d1-69809052e8b2` | Signal form. Its workflow sends welcome email 1. Also used when a white paper or Market Monitor Signal box is ticked |
| `HUBSPOT_MARKET_MONITOR_FORM_ID` | **Yes, for capture and the delivery email.** No default | New HubSpot form “Market Monitor – download”. Without it the October PDF still downloads, but HubSpot does not store the download and the delivery email does not send |
| `HUBSPOT_CONTACT_FORM_ID` | Remove it | Retired with `api/contact.js`. The contact page is the HubSpot embed |
| `HUBSPOT_SIGNAL_SUBSCRIPTION_TYPE_ID` | No. Default: `3918046194` | Signal consent subscription type |
| `TURNSTILE_SITE_KEY` | No. Set both Turnstile keys together, or neither | Public Cloudflare Turnstile site key. `/api/form-config` exposes it only when the secret is set as well |
| `TURNSTILE_SECRET_KEY` | No. Pair with the site key | Server-side Turnstile verification. Never exposed to the page |
| `UPSTASH_REDIS_REST_URL` | No. Set both Upstash values together, or neither | Shared rate-limit counter: 5 submissions per 10 minutes per IP per endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | No. Pair with the REST URL | Upstash bearer token |

Set these in the Vercel project for Production and Preview. If Turnstile or Upstash is left unset, the forms still submit. Turnstile is skipped with no widget and no error. Rate limiting then uses a best-effort in-memory counter on each serverless instance.

Before 21 October, create the HubSpot form, attach the draft workflow “Market Monitor delivery – October 2026”, and set `HUBSPOT_MARKET_MONITOR_FORM_ID`. Confirm `HUBSPOT_PORTAL_ID` and `HUBSPOT_SIGNAL_FORM_ID`. Remove `HUBSPOT_CONTACT_FORM_ID`. Add Turnstile and Upstash when those accounts are ready; they are not required for the PDF to download.

## Fields HubSpot needs on each form

The Forms API rejects a property that is not on the form. The site then retries without the extra fields. Add these properties to the forms so the first submission sticks.

Contact properties, with these internal values:

- `enquiry_topic`: `gate2`, `ar8`, `bid_tender`, `new_offers`, `other`. Labels: “Gate 2: keep-or-kill decisions”, “AR8 bid”, “Bid and tender work”, “New AI-enabled offers”, “Something else”. This is the property every new dropdown uses. The site does not send the separate `topic` property.
- `signal_role`: `ceo_md`, `commercial_lead`, `bid_tender_lead`, `development`, `finance`, `other`. The site no longer sends this on downloads.
- `content_source`: `signal-signup`, `whitepaper-bids-won-on-evidence`, `whitepaper-commercial-system-pipeline`, `whitepaper-route-to-market`, `whitepaper-procurement`, `market-monitor-2026-10`, `contact-form`, `linkedin`, `forward-referral`, `event`, `other`
- `signal_source`: `linkedin`, `website`, `forward_referral`, `event`, `other`
- `signal_subscribed_date`: date, midnight UTC in epoch milliseconds
- Existing text properties: `resource`, `acquisition_source`, `conversion_asset`, plus standard `email`, `firstname`, `lastname`, `company`

| Form | Fields the site sends |
| --- | --- |
| Signal (footer and page signup) | `email` only. The signup block does not ask for company or topic. The API still accepts a request that omits them, and still forwards `firstname`, `lastname`, `company` and `enquiry_topic` if a client posts them. Always `content_source` = `signal-signup`, `signal_source`, `signal_subscribed_date`. Consent is the existing Signal subscription `3918046194` |
| Bids white paper | `email`, `resource` = `bids-won-on-evidence`, `content_source` = `whitepaper-bids-won-on-evidence`, `acquisition_source`. Form `9b783156-b16d-443a-bc80-51bab3411670`. PDF `/assets/downloads/guide-01-bids-whitepaper.pdf` |
| Commercial system white paper | `email`, `resource` = `commercial-system-pipeline`, `content_source` = `whitepaper-commercial-system-pipeline`, `acquisition_source`. Form `5b3bb573-2ca5-47cc-8bc0-3e8b0f4023d5`. PDF `/assets/downloads/ignis-white-paper-commercial-system-pipeline.pdf` |
| Route to market white paper | `email`, `resource` = `route-to-market`, `content_source` = `whitepaper-route-to-market`, `acquisition_source`. Form `92f54ac1-4205-4a4e-9e75-4303c2b5173b`, or `HUBSPOT_ROUTE_TO_MARKET_FORM_ID` when that variable is set. PDF `/assets/downloads/ignis-route-to-market.pdf` |
| Procurement white paper | `email`, `resource` = `procurement`, `content_source` = `whitepaper-procurement`, `acquisition_source`. Form `eb4c59d4-1f1d-4104-8df3-6a249154867c`, or `HUBSPOT_PROCUREMENT_FORM_ID` when that variable is set. PDF `/assets/downloads/ignis-procurement.pdf` |
| Agentic transformation guide | `email`, `resource` = `guide-agentic-transformation`, `content_source` = `guide-agentic-transformation`, `acquisition_source`. Form `2282b746-28f8-4e9f-a783-6d471c01fffd`, or `HUBSPOT_AGENTIC_GUIDE_FORM_ID` when that variable is set. The page does not include the PDF path |
| Market Monitor download | `email`, `content_source` = `market-monitor-2026-10`, `resource` = `market-monitor-2026-10`, `acquisition_source`. Delivery consent uses subscription type `3918058120`. PDF `/assets/downloads/ignis-market-monitor-2026-10.pdf`. Form id is `HUBSPOT_MARKET_MONITOR_FORM_ID` |
| Contact | Not submitted by the site. The page embeds HubSpot form `3c83d1fd-334f-4bf6-9068-47e7f2044ad8` |

White-paper and Market Monitor gates collect a work email and one unticked checkbox. That checkbox is Signal only. The site does not send company, topic, role, or first name from those gates, even if a client posts them. Entering an email is enough to request the PDF: the paper form records subscription `3918058120` for that delivery, and there is no second “email me this PDF” checkbox. Signal subscription `3918046194` is recorded only when the box is ticked, and only by a second submit to the Signal form. That second submit sends the email, `content_source`, `signal_source` and `signal_subscribed_date`. It does not copy company or topic onto the Signal form, so a download does not also fire a second welcome from the paper form.

The label the API stores for Signal, on both the footer signup and a ticked gate, is: “Email me Signal, the weekly newsletter, and occasional marketing updates. We won't fill your inbox.” That is still subscription `3918046194`. Do not add a separate marketing subscription type.

The contact embed’s Signal checkbox is edited in HubSpot, not in the site HTML. Its current label is “Yes, send me Signal: practical notes on moving energy projects to financial close. I can unsubscribe at any time.” Change that label in form `3c83d1fd` so it also covers the weekly newsletter and occasional marketing, and keep it on `3918046194`.

`signal_source` is taken from `utm_source` on the page URL: `forward`, `forward_referral` or `forward-referral` becomes `forward_referral`; `linkedin` stays `linkedin`; anything else is `website`. `acquisition_source` on a download is the raw `utm_source`, or `website` when there is none.

## Which email sends which PDF

The pages post to the form for that asset. The follow-up email is a HubSpot workflow, and the email body is what links the PDF. These automated emails already link the matching file:

| Asset | Email | Edit | PDF in the email |
| --- | --- | --- | --- |
| Bids white paper | `1406943214817` | [494637052135](https://app-eu1.hubspot.com/email/149324702/edit/494637052135) | `/assets/downloads/guide-01-bids-whitepaper.pdf` |
| Commercial white paper | `1406963052756` | [494478880982](https://app-eu1.hubspot.com/email/149324702/edit/494478880982) | `/assets/downloads/ignis-white-paper-commercial-system-pipeline.pdf` |
| Market Monitor, October 2026 | `1406578736329` | [494301996237](https://app-eu1.hubspot.com/email/149324702/edit/494301996237) | `/assets/downloads/ignis-market-monitor-2026-10.pdf` |

If a white-paper signup arrives with the Market Monitor PDF, the workflow on form `9b783156` or `5b3bb573` is sending email `1406578736329`. Point that workflow at the paper’s own email, and leave the monitor email on the Market Monitor form only. Also confirm `HUBSPOT_MARKET_MONITOR_FORM_ID` is the Market Monitor form, not a white-paper form id. The site does not choose the attachment.

When the visitor has accepted analytics cookies, each submission sends `context.hutk` from the `hubspotutk` cookie (or from `hutk` / `hubspotutk` posted by the page), plus `pageUri` and `pageName`. `hutk` is omitted when the cookie is not there.

## Bot protection

Every signup and download form includes:

- a hidden `company_website` honeypot
- `form_started_at`, set when the page script runs; submissions under about 3 seconds, or with no timestamp, are ignored
- a server-side limit of 5 submissions per 10 minutes per IP per endpoint
- Cloudflare Turnstile when both keys are set
- a loose rejection of Gmail addresses whose local part has four or more dots and mostly one- or two-character segments

Honeypot, time trap and that Gmail pattern return a quiet success and do not call HubSpot. The rate limit returns HTTP 429. A failed Turnstile check asks the visitor to complete the security check.

## Gated and ungated papers

Each entry in `papers()` in `api/whitepaper.js` has a `gated` boolean and a `presentation` of `popup` or `form`. `paperIsGated` is the only function that reads `gated`. To switch one paper, change that entry's `gated` line. `presentation` says how the page asks for the email.

All four current papers are `gated: true`. Route to market, procurement and the October Market Monitor use `presentation: "popup"`. The agentic guide uses `presentation: "form"`. The older bids and commercial system entries stay `gated: true` and `presentation: "form"`.

`HUBSPOT_UNGATED_RESOURCES` is optional. It is a comma-separated list of resource keys. A key in that list is ungated even when its `gated` flag is still `true`. Leave the variable unset and the flags above apply. The variable cannot force a paper back to gated.

`GET /api/whitepaper?resource=<key>` returns `{gated, presentation}` and includes `pdf` only when the paper is ungated. A gated POST returns the PDF URL only after a valid submit. The submit accepts an email with no first name. `content_source` is the paper's own value. The Signal checkbox subscribes only when it is ticked.

If a gated paper's resolved form id is empty and `HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID` is unset, the POST returns 503, `{"ok":false,"error":"We could not send your paper just now. Please try again."}`, and does not include the PDF. Ungated papers can still download when no form id is set.

Popup pages (route to market, procurement, Market Monitor) keep the article on the page. The hero says "Free resource." and has no download control. A text link, "Get the PDF", sits straight after the briefing and again at the end of the article, before the Signal sign-up. The link opens the dialog. The dialog asks for an email, runs Turnstile, and has an unticked Signal box. The page source does not include the PDF URL. On success the browser starts the download from the API URL. When the function can read the file, that URL ends with `?v=` and the first eight characters of the file's SHA-256. If the read fails, the function logs the path and returns the PDF path without `?v=`, so the visitor still gets the file. `api/whitepaper.js` sets `includeFiles` to `assets/downloads/**` so the read works on Vercel.

The pop-up is one script, `/assets/whitepaper.js`, plus the markup below. The only paper specific part is `data-paper`. Set it to the resource key in `papers()`. The script copies that key into the form before submit. The API chooses `content_source`, the form id and the PDF from that key. Do not put the PDF path in the page.

```html
<p class="wp-free-label">Free resource.</p>
<p class="wp-get-pdf-row"><a class="wp-get-pdf" href="#wp-download-dialog" data-download-open aria-haspopup="dialog" aria-controls="wp-download-dialog">Get the PDF</a></p>
<dialog class="wp-download-dialog" id="wp-download-dialog" data-paper="your-resource-key" aria-labelledby="wp-download-dialog-title">
<form method="post" action="/api/whitepaper" data-whitepaper-form data-whitepaper-popup>
<input type="hidden" name="resource" value="">
<input type="hidden" name="form_started_at" value="">
<!-- email field, honeypot, Turnstile slot, unticked signal_opt_in, status line, submit "Send me the PDF", and the success panel -->
</form>
</dialog>
```

Load `/assets/whitepaper.js` on the page. Add the same key to `papers()` with `gated: true`, `presentation: "popup"`, the PDF path and the HubSpot form id.

The guide form stays on the page. It defaults to `2282b746-28f8-4e9f-a783-6d471c01fffd`. `HUBSPOT_AGENTIC_GUIDE_FORM_ID` overrides that default when it is set. Its HubSpot fields are `resource` = `guide-agentic-transformation` and `content_source` = `guide-agentic-transformation`. The guide page does not include the PDF path.

Route to market uses form `92f54ac1-4205-4a4e-9e75-4303c2b5173b`, or `HUBSPOT_ROUTE_TO_MARKET_FORM_ID` when that variable is set. Procurement uses `eb4c59d4-1f1d-4104-8df3-6a249154867c`, or `HUBSPOT_PROCUREMENT_FORM_ID`. The Market Monitor uses `HUBSPOT_MARKET_MONITOR_FORM_ID`, then the shared download form if that is unset.

These four PDFs send `X-Robots-Tag: noindex`. The bids and commercial system PDFs do not.

Files under `/assets/downloads/*.pdf` send `Cache-Control: public, max-age=0, must-revalidate`. That rule comes after the one-year immutable rule for `/assets/*`, so it wins for those PDFs. Other assets keep the one-year rule. Links already sent in HubSpot emails use the path without `?v=`. A browser that stored that file under the old immutable rule can keep showing it until that copy expires. New visitors, and browsers that revalidate, get the current file.

## A later Market Monitor edition

Copy the October report page, including both "Get the PDF" links. On the dialog, change `data-paper` to the new slug and leave the rest of the pop-up markup as it is. Do not put the PDF path in the page. Add that slug to `papers()` with `gated: true`, `presentation: "popup"`, its PDF path and its form id. Add the slug to the HubSpot `content_source` property before relying on it. The October PDF path and report copy stay as they are.
