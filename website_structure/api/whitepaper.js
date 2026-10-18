const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || "149324702";
const PAPER_SUBSCRIPTION_TYPE_ID = 3918058120;
const SIGNAL_SUBSCRIPTION_TYPE_ID = 3918046194;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAPERS = {
  "bids-won-on-evidence": {
    formId: "9b783156-b16d-443a-bc80-51bab3411670",
    pdf: "/assets/downloads/guide-01-bids-whitepaper.pdf"
  },
  "commercial-system-pipeline": {
    formId: "5b3bb573-2ca5-47cc-8bc0-3e8b0f4023d5",
    pdf: "/assets/downloads/ignis-white-paper-commercial-system-pipeline.pdf"
  }
};

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

function checked(value) {
  return value === true || value === "true" || value === "on";
}

module.exports = async function whitepaper(request, response) {
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

  const email = String(body.email || "").trim().toLowerCase();
  const resource = String(body.resource || "").trim();
  const paper = Object.hasOwn(PAPERS, resource) ? PAPERS[resource] : undefined;
  if (!EMAIL_PATTERN.test(email) || !paper || !checked(body.paper_email_consent)) {
    return send(response, 422, {ok: false, error: "Enter your email and confirm that we may send the paper."});
  }

  const communications = [{
    value: true,
    subscriptionTypeId: PAPER_SUBSCRIPTION_TYPE_ID,
    text: "Email me the white paper I requested. This is only for this paper, not the Signal newsletter."
  }];
  if (checked(body.signal_opt_in)) {
    communications.push({
      value: true,
      subscriptionTypeId: SIGNAL_SUBSCRIPTION_TYPE_ID,
      text: "Yes, email me Signal from Ignis Leadership."
    });
  }
  const context = {
    pageUri: String(body.page_url || `https://www.ignisleadership.com/resources/${resource}`).slice(0, 500),
    pageName: `Ignis white paper: ${resource}`
  };
  const hutk = cookieValue(request.headers.cookie, "hubspotutk");
  if (hutk) context.hutk = hutk;

  try {
    const hubspotResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(HUBSPOT_PORTAL_ID)}/${encodeURIComponent(paper.formId)}`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          submittedAt: Date.now(),
          fields: [{name: "email", value: email}, {name: "resource", value: resource}],
          context,
          legalConsentOptions: {
            consent: {
              consentToProcess: true,
              text: "Ignis Leadership may use my email address to deliver the requested white paper.",
              communications
            }
          }
        })
      }
    );
    if (!hubspotResponse.ok) {
      const detail = (await hubspotResponse.text()).slice(0, 800);
      console.error("HubSpot white paper submission failed", hubspotResponse.status, detail);
      return send(response, 502, {ok: false, error: "We could not send your paper just now. Please try again."});
    }
    return send(response, 200, {ok: true, pdf: paper.pdf});
  } catch (error) {
    console.error("HubSpot white paper submission error", error && error.message);
    return send(response, 502, {ok: false, error: "We could not send your paper just now. Please try again."});
  }
};
