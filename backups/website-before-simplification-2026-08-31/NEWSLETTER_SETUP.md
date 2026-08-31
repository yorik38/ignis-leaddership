# Newsletter launch checklist

The website implementation is complete. These are the short account-level steps needed to connect it to Kit.

## Kit

1. Create one inline form named `Website newsletter`.
2. Keep the confirmation email enabled (double opt-in) and edit its copy in the Ignis voice.
3. Add Kit's standard `First Name` field to the form with the label `First name`.
4. Create these tags:
   - `Newsletter - Bid more. Win more.`
   - `Source - Website`
   - `Source - LinkedIn`
   - `Source - Email`
   - `Source - Reader share`
5. In Kit Developer settings, create a V4 API key named `Ignis website`.
6. The published form ID is `8043482`. Tag IDs are resolved automatically from the exact names above.

## Vercel environment variables

Add these to the production project, then redeploy:

```text
KIT_API_KEY=
KIT_FORM_ID=8043482
```

The tag ID variables are optional. The website resolves the five tags by their exact names through Kit's API.

The API key stays on the server and is never exposed in the page.

## LinkedIn funnel link

Use this link in the LinkedIn newsletter and profile:

```text
https://www.ignisleadership.com/newsletter?source=linkedin&utm_source=linkedin&utm_medium=newsletter&utm_campaign=the_bid_advantage
```

## Release scope

Included now: branded landing page, mobile layout, double opt-in through a Kit form, newsletter and source tags, LinkedIn/email/copy-link sharing, spam honeypot, privacy link and clear success/error states.

Later, only if growth warrants it: issue archive on the Ignis domain, preference centre, topic tags, lead magnet and a rewarded referral programme. Kit's native SparkLoop referral rewards require Creator Pro, so they are intentionally outside this first release.
