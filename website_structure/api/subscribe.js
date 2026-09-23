const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || "149324702";
const HUBSPOT_FORM_ID = process.env.HUBSPOT_NEWSLETTER_FORM_ID || "9694ec84-e70c-4134-b426-383c2e458f22";
const HUBSPOT_SUBSCRIPTION_TYPE_ID = process.env.HUBSPOT_NEWSLETTER_SUBSCRIPTION_TYPE_ID || "3723080970";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = new Set(["website", "linkedin", "email", "shared", "article-end"]);

function json(response, status, payload) {
  response.status(status).setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  return response.end(JSON.stringify(payload));
}

function cookieValue(header, name) {
  const match = String(header || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]) : undefined;
}

module.exports = async function subscribe(request, response) {
  if (request.method !== "POST") return json(response, 405, {error: "Method not allowed."});

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
  if (body.company_website) return json(response, 200, {ok: true});

  const email = String(body.email || "").trim().toLowerCase();
  const firstName = String(body.first_name || "").trim().slice(0, 80);
  const source = ALLOWED_SOURCES.has(body.source) ? body.source : "website";
  if (!EMAIL_PATTERN.test(email)) return json(response, 422, {error: "Enter a valid email address."});
  if (!HUBSPOT_SUBSCRIPTION_TYPE_ID) {
    return json(response, 503, {error: "Newsletter signup is awaiting its final HubSpot connection."});
  }

  const fields = [
    {name: "email", value: email},
    {name: "newsletter_source", value: source},
    {name: "acquisition_source", value: source},
    {name: "conversion_asset", value: "bid_more_win_more_newsletter"}
  ];
  if (firstName) fields.push({name: "firstname", value: firstName});

  const context = {
    pageUri: String(body.page_url || "https://www.ignisleadership.com/insights").slice(0, 500),
    pageName: "Bid More. Win More."
  };
  const hutk = cookieValue(request.headers.cookie, "hubspotutk");
  if (hutk) context.hutk = hutk;

  const submission = {
    submittedAt: Date.now(),
    fields,
    context,
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: "Subscribe to Bid More. Win More. You can unsubscribe at any time.",
        communications: [{
          value: true,
          subscriptionTypeId: Number(HUBSPOT_SUBSCRIPTION_TYPE_ID),
          text: "Receive Bid More. Win More. by email."
        }]
      }
    }
  };

  try {
    const hubspotResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(HUBSPOT_PORTAL_ID)}/${encodeURIComponent(HUBSPOT_FORM_ID)}`,
      {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(submission)}
    );
    if (!hubspotResponse.ok) {
      const detail = (await hubspotResponse.text()).slice(0, 800);
      console.error("HubSpot newsletter submission failed", hubspotResponse.status, detail);
      throw new Error("HubSpot rejected the subscription.");
    }
    return json(response, 200, {ok: true});
  } catch (error) {
    console.error("Newsletter subscription failed:", error.message);
    return json(response, 502, {error: "We could not add you just now."});
  }
};
