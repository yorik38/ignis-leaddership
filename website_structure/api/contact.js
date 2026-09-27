const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || "149324702";
const HUBSPOT_FORM_ID = process.env.HUBSPOT_CONTACT_FORM_ID || "c4133ecb-5cca-4779-bb4e-9f85bf3d8bc3";
const HUBSPOT_NEWSLETTER_FORM_ID = process.env.HUBSPOT_NEWSLETTER_FORM_ID || "9694ec84-e70c-4134-b426-383c2e458f22";
const HUBSPOT_NEWSLETTER_SUBSCRIPTION_TYPE_ID = process.env.HUBSPOT_NEWSLETTER_SUBSCRIPTION_TYPE_ID || "3723081039";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function cookieValue(header, name) {
  const match = String(header || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]) : undefined;
}

async function submitHubspotForm(formId, payload) {
  const response = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(HUBSPOT_PORTAL_ID)}/${encodeURIComponent(formId)}`,
    {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    }
  );
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 800);
    const error = new Error(`HubSpot form submission failed: ${response.status}`);
    error.detail = detail;
    throw error;
  }
}

module.exports = async function contactHandler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, {ok: false, error: "method_not_allowed"});
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch (_error) {
    return send(res, 400, {ok: false, error: "invalid_json"});
  }
  if (body.company_website) return send(res, 200, {ok: true});

  const fullName = String(body.name || "").trim().replace(/\s+/g, " ").slice(0, 160);
  const parts = fullName.split(" ");
  const firstname = parts.shift() || "";
  const lastname = parts.join(" ");
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim().slice(0, 80);
  const message = String(body.message || "").trim().slice(0, 5000);
  const newsletterOptIn = body.newsletter_opt_in === true || body.newsletter_opt_in === "true" || body.newsletter_opt_in === "on";

  if (!fullName || !EMAIL_PATTERN.test(email)) {
    return send(res, 422, {ok: false, error: "invalid_details"});
  }

  const fields = [
    {name: "email", value: email},
    {name: "firstname", value: firstname},
    {name: "lastname", value: lastname},
    {name: "acquisition_source", value: String(body.source || "website").trim().slice(0, 180)},
    {name: "conversion_asset", value: "website_enquiry"}
  ];
  if (phone) fields.push({name: "phone", value: phone});
  if (message) fields.push({name: "message", value: message});

  const context = {
    pageUri: String(body.page_url || "https://www.ignisleadership.com/#contact").slice(0, 500),
    pageName: "Ignis Leadership enquiry"
  };
  const hutk = cookieValue(req.headers.cookie, "hubspotutk");
  if (hutk) context.hutk = hutk;

  try {
    await submitHubspotForm(HUBSPOT_FORM_ID, {
      submittedAt: Date.now(),
      fields,
      context,
      legalConsentOptions: {
        consent: {
          consentToProcess: true,
          text: "I agree that Ignis Leadership may use these details to respond to my enquiry."
        }
      }
    });
  } catch (error) {
    console.error("HubSpot enquiry submission error", error && error.message, error && error.detail);
    return send(res, 502, {ok: false, error: "submission_failed"});
  }

  if (!newsletterOptIn) return send(res, 200, {ok: true, newsletterSubscribed: false});

  const subscriptionTypeId = Number(HUBSPOT_NEWSLETTER_SUBSCRIPTION_TYPE_ID);
  const newsletterConsent = {
    consentToProcess: true,
    text: "Ignis Leadership may use these details to send the Bid more. Win more. newsletter. You can unsubscribe at any time."
  };
  if (Number.isFinite(subscriptionTypeId)) {
    newsletterConsent.communications = [{
      value: true,
      subscriptionTypeId,
      text: "I want to receive the Bid more. Win more. newsletter from Ignis Leadership."
    }];
  }

  const newsletterFields = [
    {name: "email", value: email},
    {name: "firstname", value: firstname},
    {name: "lastname", value: lastname},
    {name: "acquisition_source", value: String(body.source || "website").trim().slice(0, 180)},
    {name: "conversion_asset", value: "website_newsletter"}
  ];

  try {
    await submitHubspotForm(HUBSPOT_NEWSLETTER_FORM_ID, {
      submittedAt: Date.now(),
      fields: newsletterFields,
      context: {...context, pageName: "Bid more. Win more. newsletter signup from contact"},
      legalConsentOptions: {consent: newsletterConsent}
    });
    return send(res, 200, {ok: true, newsletterSubscribed: true});
  } catch (error) {
    console.error("HubSpot newsletter opt-in submission error", error && error.message, error && error.detail);
    return send(res, 200, {ok: true, newsletterSubscribed: false, warning: "newsletter_submission_failed"});
  }
};
