const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || "149324702";
const HUBSPOT_FORM_ID = process.env.HUBSPOT_NEWSLETTER_FORM_ID || process.env.HUBSPOT_CONTACT_FORM_ID || "c4133ecb-5cca-4779-bb4e-9f85bf3d8bc3";
const HUBSPOT_SUBSCRIPTION_TYPE_ID = process.env.HUBSPOT_NEWSLETTER_SUBSCRIPTION_TYPE_ID || "3723081039";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function send(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function cookieValue(header, name) {
  const match = String(header || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]) : undefined;
}

module.exports = async function subscribe(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, {ok: false, error: "method_not_allowed"});
  }

  let body;
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
  } catch (_error) {
    return send(response, 400, {ok: false, error: "invalid_json"});
  }
  if (body.company_website) return send(response, 200, {ok: true});

  const fullName = String(body.name || body.first_name || "").trim().replace(/\s+/g, " ").slice(0, 160);
  const parts = fullName.split(" ");
  const firstname = parts.shift() || "";
  const lastname = parts.join(" ");
  const email = String(body.email || "").trim().toLowerCase();
  const source = String(body.source || "website").trim().slice(0, 180);

  if (!EMAIL_PATTERN.test(email)) {
    return send(response, 422, {ok: false, error: "Enter a valid email address."});
  }

  const fields = [
    {name: "email", value: email},
    {name: "acquisition_source", value: source},
    {name: "conversion_asset", value: "website_newsletter"}
  ];
  if (firstname) fields.push({name: "firstname", value: firstname});
  if (lastname) fields.push({name: "lastname", value: lastname});
  const context = {
    pageUri: String(body.page_url || "https://www.ignisleadership.com/insights").slice(0, 500),
    pageName: "Bid more. Win more. newsletter signup"
  };
  const hutk = cookieValue(request.headers.cookie, "hubspotutk");
  if (hutk) context.hutk = hutk;

  const subscriptionTypeId = Number(HUBSPOT_SUBSCRIPTION_TYPE_ID);
  const consent = {
    consentToProcess: true,
    text: "Ignis Leadership may use these details to send Bid more. Win more. You can unsubscribe at any time."
  };
  if (Number.isFinite(subscriptionTypeId)) {
    consent.communications = [{
      value: true,
      subscriptionTypeId,
      text: "I want to receive Bid more. Win more. from Ignis Leadership."
    }];
  }

  try {
    const hubspotResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(HUBSPOT_PORTAL_ID)}/${encodeURIComponent(HUBSPOT_FORM_ID)}`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({submittedAt: Date.now(), fields, context, legalConsentOptions: {consent}})
      }
    );

    if (!hubspotResponse.ok) {
      const detail = (await hubspotResponse.text()).slice(0, 800);
      console.error("HubSpot newsletter submission failed", hubspotResponse.status, detail);
      return send(response, 502, {ok: false, error: "We could not add you just now."});
    }
    return send(response, 200, {ok: true});
  } catch (error) {
    console.error("HubSpot newsletter submission error", error && error.message);
    return send(response, 502, {ok: false, error: "We could not add you just now."});
  }
};
