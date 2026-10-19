# Signal and white-paper forms

The site submits Signal signups through `/api/subscribe` and the two white-paper gates through `/api/whitepaper`. The October Market Monitor uses the same white-paper endpoint. All three use HubSpot Forms API in the EU portal. Environment variables, Turnstile, rate limiting and the Market Monitor form id are listed in [FORMS_SETUP.md](FORMS_SETUP.md).

A white paper is not revealed until HubSpot accepts the request. The Market Monitor PDF is the exception when `HUBSPOT_MARKET_MONITOR_FORM_ID` is unset: the file is still delivered and the server logs a warning. A paper or report request does not imply Signal consent. The gate is a work email plus one unticked checkbox. That checkbox enrols the existing Signal subscription `3918046194` by a second submit to the Signal form, and it does not send company, topic, role, or first name. The footer Signal form is a work email and the consent checkbox. It does not collect company or topic. `/api/subscribe` still succeeds when those fields are absent, and still forwards them if a client posts them. If HubSpot rejects those extra fields, the handler retries without them. Submissions include `context.hutk` only when the visitor’s `hubspotutk` cookie, or a posted token, is present. The old `/api/contact` handler is retired; `/contact` uses the HubSpot embed.

The footer checkbox and the text stored with subscription `3918046194` both say: “Email me Signal, the weekly newsletter, and occasional marketing updates. We won't fill your inbox.” The gate checkbox says the same thing, with “Also email me” at the start, and it is not required. There is no separate marketing subscription. Turn off reCAPTCHA on the Signal form and both paper forms, or `/api/subscribe` and the paper API keep returning 502. See [FORMS_SETUP.md](FORMS_SETUP.md).

## HubSpot IDs

| Purpose | ID |
| --- | --- |
| EU portal | `149324702` |
| Signal form | `9ee4b5ce-211f-4be1-a8d1-69809052e8b2` |
| Signal subscription type | `3918046194` |
| Bids paper form | `9b783156-b16d-443a-bc80-51bab3411670` |
| Pipeline paper form | `5b3bb573-2ca5-47cc-8bc0-3e8b0f4023d5` |
| Requested white papers subscription type | `3918058120` |

The Signal form has Email and required Signal consent on subscription `3918046194`. Each paper form has Email, hidden `resource`, and records delivery consent `3918058120` from the email submit itself. Signal is not a checkbox on the HubSpot paper form from the site’s point of view: the optional tick is a second submit to the Signal form. Each paper form’s follow-up workflow must email that paper’s PDF, not the Market Monitor. The site shows “The PDF is on its way.” after an accepted submission and does not open the file automatically.

## Vercel environment variables

The defaults in the endpoints match the IDs above. To override them, set:

```text
HUBSPOT_PORTAL_ID=149324702
HUBSPOT_SIGNAL_FORM_ID=9ee4b5ce-211f-4be1-a8d1-69809052e8b2
HUBSPOT_SIGNAL_SUBSCRIPTION_TYPE_ID=3918046194
```

The old `HUBSPOT_NEWSLETTER_*` variables are no longer read. Keep the old “Bid More. Win More.” form active until a live Signal signup and both paper deliveries have been verified, then retire it. HubSpot account-wide double opt-in is intentionally off: on this plan it would apply to contact and paper forms as well as Signal. Each form still records affirmative, purpose-specific consent.
