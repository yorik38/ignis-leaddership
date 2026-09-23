# Commercial AI Readiness Check: launch setup

The page and deterministic scoring work locally. Production submissions are connected to HubSpot.

## HubSpot form

The published `Commercial AI Readiness Check` form contains these exact field/property names:

- `firstname`
- `lastname`
- `email`
- `readiness_route`
- `readiness_band`
- `readiness_weakest_dimension`
- `readiness_recommended_workflow`
- `readiness_constraint`
- `readiness_workflow_interest`
- `readiness_source`

The custom properties must also be present on the form definition. HubSpot validates submitted fields against the form.

## Vercel environment variables

- `HUBSPOT_PORTAL_ID`: optional; defaults to `149324702`
- `HUBSPOT_READINESS_FORM_ID`: optional; defaults to `ed1c58a7-3ca9-498e-aa49-0b70bf1f3c1e`
- `HUBSPOT_READINESS_SUBSCRIPTION_TYPE_ID`: optional; defaults to `3723081039`

## HubSpot workflow

Trigger the workflow when `readiness_source` equals `commercial_ai_readiness_check`. Use `readiness_route`, `readiness_band`, `readiness_weakest_dimension` and `readiness_recommended_workflow` to branch the five-email sequence.

Before launch, send test submissions down both routes, verify consent logging and unsubscribe behaviour, and have the updated privacy wording reviewed.
