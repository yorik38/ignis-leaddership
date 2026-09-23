# Newsletter launch checklist

The website newsletter is connected to HubSpot.

## HubSpot configuration

The published form is `Website Newsletter Subscription`.

- Portal ID: `149324702`
- Form ID: `9694ec84-e70c-4134-b426-383c2e458f22`
- Subscription type: `Bid More. Win More.` (`3723080970`)
- Tracking properties: `newsletter_source`, `acquisition_source`, `conversion_asset`

## Vercel environment variables

The IDs have safe defaults in the serverless endpoint. These environment variables are optional overrides:

```text
HUBSPOT_PORTAL_ID=149324702
HUBSPOT_NEWSLETTER_FORM_ID=9694ec84-e70c-4134-b426-383c2e458f22
HUBSPOT_NEWSLETTER_SUBSCRIPTION_TYPE_ID=3723080970
```

No private API key is required. The serverless endpoint submits to HubSpot's public Forms API.

## LinkedIn funnel link

Use this link in the LinkedIn newsletter and profile:

```text
https://www.ignisleadership.com/newsletter?source=linkedin&utm_source=linkedin&utm_medium=newsletter&utm_campaign=the_bid_advantage
```

## Release scope

Included now: branded landing page, mobile layout, HubSpot consent and source properties, LinkedIn/email/copy-link sharing, spam honeypot, privacy link and clear success/error states.

Later, only if growth warrants it: preference-centre refinements, topic preferences, a lead magnet and a referral programme.

## Edition display rule

Whenever a new issue is published:

1. Make the new issue the single featured **Latest edition** on `insights.html`.
2. Move the previous latest issue into **Past editions** and retain no more than the three most recent past issues there.
3. Show the three most recent published issues in total on the homepage.
4. Keep every published issue in the full archive.

For example, when Issue 04 is published, the Insights page features Issue 04 and lists Issues 03, 02 and 01 beneath it. The homepage lists Issues 04, 03 and 02.
