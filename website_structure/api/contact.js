const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || "149324702";
const HUBSPOT_FORM_ID = process.env.HUBSPOT_CONTACT_FORM_ID || "c4133ecb-5cca-4779-bb4e-9f85bf3d8bc3";
const HUBSPOT_NEWSLETTER_FORM_ID = process.env.HUBSPOT_SIGNAL_FORM_ID || "9ee4b5ce-211f-4be1-a8d1-69809052e8b2";
const HUBSPOT_NEWSLETTER_SUBSCRIPTION_TYPE_ID = process.env.HUBSPOT_SIGNAL_SUBSCRIPTION_TYPE_ID || "3918046194";
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
  const company = String(body.company || "").trim().replace(/\s+/g, " ").slice(0, 200);
  const role = String(body.role || "").trim().replace(/\s+/g, " ").slice(0, 160);
  const topic = String(body.topic || "").trim();
  const allowedTopics = new Set(["gate2", "ar8", "bid_tender", "new_offers", "other"]);
  const message = String(body.message || "").trim().slice(0, 5000);
  const discoverySource = String(body.discovery_source || "").trim().slice(0, 80);
  const allowedDiscoverySources = new Set([
    "linkedin",
    "google_search",
    "chatgpt",
    "claude",
    "perplexity",
    "other_ai_assistant",
    "recommendation_referral",
    "event_podcast_article",
    "other"
  ]);
  const acquisitionSource = allowedDiscoverySources.has(discoverySource)
    ? `self_reported_${discoverySource}`
    : String(body.source || "website").trim().slice(0, 180);
  const newsletterOptIn = body.newsletter_opt_in === true || body.newsletter_opt_in === "true" || body.newsletter_opt_in === "on";

  if (!fullName || !EMAIL_PATTERN.test(email) || !company || !allowedTopics.has(topic)) {
    return send(res, 422, {ok: false, error: "invalid_details"});
  }

  const topicLabels = {
    gate2: "Gate 2: keep-or-kill decisions",
    ar8: "AR8 bid",
    bid_tender: "Bid and tender work",
    new_offers: "New AI-enabled offers",
    other: "Something else"
  };
  const enquiryLines = [
    message,
    `Topic: ${topicLabels[topic]}`,
    `Company: ${company}`,
    role ? `Role: ${role}` : ""
  ].filter(Boolean);
  const enquiryMessage = enquiryLines.join("\n\n").slice(0, 5000);

  const fields = [
    {name: "email", value: email},
    {name: "firstname", value: firstname},
    {name: "lastname", value: lastname},
    {name: "company", value: company},
    {name: "topic", value: topic},
    {name: "acquisition_source", value: acquisitionSource},
    {name: "conversion_asset", value: "website_enquiry"},
    {name: "message", value: enquiryMessage}
  ];
  if (phone) fields.push({name: "phone", value: phone});
  if (role) fields.push({name: "role", value: role});

  const context = {
    pageUri: String(body.page_url || "https://www.ignisleadership.com/#contact").slice(0, 500),
    pageName: "Ignis Leadership enquiry"
  };
  const hutk = cookieValue(req.headers.cookie, "hubspotutk");
  if (hutk) context.hutk = hutk;

  const hubspotPayload = {
    submittedAt: Date.now(),
    fields,
    context,
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: "I agree that Ignis Leadership may use these details to respond to my enquiry."
      }
    }
  };

  try {
    try {
      await submitHubspotForm(HUBSPOT_FORM_ID, hubspotPayload);
    } catch (error) {
      const fallbackFields = fields.filter((field) => !["company", "topic", "role"].includes(field.name));
      if (fallbackFields.length === fields.length) throw error;
      console.error("HubSpot enquiry rejected the extra fields; retrying with the message", error && error.message);
      await submitHubspotForm(HUBSPOT_FORM_ID, {...hubspotPayload, fields: fallbackFields});
    }
  } catch (error) {
    console.error("HubSpot enquiry submission error", error && error.message, error && error.detail);
    return send(res, 502, {ok: false, error: "submission_failed"});
  }

  if (!newsletterOptIn) return send(res, 200, {ok: true, newsletterSubscribed: false});

  const subscriptionTypeId = Number(HUBSPOT_NEWSLETTER_SUBSCRIPTION_TYPE_ID);
  const newsletterConsent = {
    consentToProcess: true,
    text: "Ignis Leadership may use these details to send the Signal newsletter. You can unsubscribe at any time."
  };
  if (Number.isFinite(subscriptionTypeId)) {
    newsletterConsent.communications = [{
      value: true,
      subscriptionTypeId,
      text: "I want to receive the Signal newsletter from Ignis Leadership."
    }];
  }

  const newsletterFields = [{name: "email", value: email}];

  try {
    await submitHubspotForm(HUBSPOT_NEWSLETTER_FORM_ID, {
      submittedAt: Date.now(),
      fields: newsletterFields,
      context: {...context, pageName: "Signal newsletter signup from contact"},
      legalConsentOptions: {consent: newsletterConsent}
    });
    return send(res, 200, {ok: true, newsletterSubscribed: true});
  } catch (error) {
    console.error("HubSpot newsletter opt-in submission error", error && error.message, error && error.detail);
    return send(res, 200, {ok: true, newsletterSubscribed: false, warning: "newsletter_submission_failed"});
  }
};
