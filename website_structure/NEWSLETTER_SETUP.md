# Signal and white-paper forms

The site submits Signal signups through `/api/subscribe` and the two white-paper gates through `/api/whitepaper`. Both endpoints use HubSpot Forms API in the EU portal. The paper must not be revealed until HubSpot accepts the request. A paper request does not imply Signal consent.

## HubSpot IDs

| Purpose | ID |
| --- | --- |
| EU portal | `149324702` |
| Signal form | `9ee4b5ce-211f-4be1-a8d1-69809052e8b2` |
| Signal subscription type | `3918046194` |
| Bids paper form | `9b783156-b16d-443a-bc80-51bab3411670` |
| Pipeline paper form | `5b3bb573-2ca5-47cc-8bc0-3e8b0f4023d5` |
| Requested white papers subscription type | `3918058120` |

The Signal form has Email and required Signal consent. Each paper form has Email, hidden `resource`, required consent for the requested paper, and a separate, optional Signal choice. Each paper form has a live follow-up workflow that emails its own PDF link. The site also shows the PDF link after accepted submission.

## Vercel environment variables

The defaults in the endpoints match the IDs above. To override them, set:

```text
HUBSPOT_PORTAL_ID=149324702
HUBSPOT_SIGNAL_FORM_ID=9ee4b5ce-211f-4be1-a8d1-69809052e8b2
HUBSPOT_SIGNAL_SUBSCRIPTION_TYPE_ID=3918046194
```

The old `HUBSPOT_NEWSLETTER_*` variables are no longer read. Keep the old “Bid More. Win More.” form active until a live Signal signup and both paper deliveries have been verified, then retire it. HubSpot account-wide double opt-in is intentionally off: on this plan it would apply to contact and paper forms as well as Signal. Each form still records affirmative, purpose-specific consent.
