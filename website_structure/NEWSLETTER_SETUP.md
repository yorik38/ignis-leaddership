# Newsletter launch checklist

The website newsletter forms now submit to HubSpot through the server-side `/api/subscribe` endpoint.

## HubSpot form

1. Create a HubSpot form named `Website newsletter`.
2. Include `Email`, `First name`, `Last name`, `Acquisition source` and `Conversion asset` in the form definition.
3. Keep the newsletter subscription type enabled and confirm that its ID is `3723081039`.
4. Set the form follow-up workflow for `Bid more. Win more.`
5. Test the form, consent record and unsubscribe flow before launch.

Until a dedicated newsletter form ID is supplied, the endpoint uses the existing website contact form ID. Submissions are distinguished by `conversion_asset = website_newsletter`.

## Vercel environment variables

```text
HUBSPOT_PORTAL_ID=149324702
HUBSPOT_NEWSLETTER_FORM_ID=
HUBSPOT_NEWSLETTER_SUBSCRIPTION_TYPE_ID=3723081039
```

The form IDs and consent details stay on the server and are never exposed in the page.

## LinkedIn funnel link

Use this link in the LinkedIn newsletter and profile:

```text
https://www.ignisleadership.com/newsletter?source=linkedin&utm_source=linkedin&utm_medium=newsletter&utm_campaign=the_bid_advantage
```

## Edition display rule

Whenever a new issue is published:

1. Make the new issue the single featured **Latest edition** on `insights.html`.
2. Move the previous latest issue into **Past editions** and retain no more than the three most recent past issues there.
3. Show the three most recent published issues in total on the homepage.
4. Keep every published issue in the full archive.
