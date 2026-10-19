const {protectForm} = require("./_lib/protect");
const {
  clip,
  submitWithFallback,
  contextFor,
  signalConsent,
  buildSignalFields,
  signalFormId,
  SIGNAL_EXTRA_FIELDS
} = require("./_lib/hubspot");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function send(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function checked(value) {
  return value === true || value === "true" || value === "on";
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

  const gate = await protectForm(request, body, "subscribe");
  if (gate) return send(response, gate.status, gate.payload);

  const fullName = clip(body.name || body.first_name || body.firstname, 160);
  const parts = fullName.split(" ");
  const firstname = parts.shift() || "";
  const lastname = parts.join(" ");
  const email = String(body.email || "").trim().toLowerCase();
  const signalConsentGiven = checked(body.signal_consent);

  if (!EMAIL_PATTERN.test(email)) {
    return send(response, 422, {ok: false, error: "Enter a valid email address."});
  }
  if (!signalConsentGiven) return send(response, 422, {ok: false, error: "Please confirm that you want to receive Signal."});

  const context = contextFor(request, body, "Signal newsletter signup", "https://www.ignisleadership.com/insights");
  const fields = buildSignalFields({
    email,
    firstname,
    lastname,
    company: body.company,
    enquiryTopic: body.enquiry_topic || body.topic,
    contentSource: "signal-signup",
    pageUrl: context.pageUri
  });

  try {
    await submitWithFallback(signalFormId(), {
      submittedAt: Date.now(),
      fields,
      context,
      legalConsentOptions: {consent: signalConsent()}
    }, SIGNAL_EXTRA_FIELDS);
    return send(response, 200, {ok: true});
  } catch (error) {
    console.error("HubSpot newsletter submission error", error && error.message, error && error.detail);
    return send(response, 502, {ok: false, error: "We could not add you just now."});
  }
};
