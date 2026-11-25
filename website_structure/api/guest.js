// "Be a guest" applications for the Connecting Energy podcast.
// Posts to a dedicated HubSpot form through the public Forms API v3, with the same
// bot checks as the other site forms. Set HUBSPOT_PODCAST_GUEST_FORM_ID in Vercel.
const {protectForm} = require("./_lib/protect");
const {clip, submitWithFallback, contextFor, knownContentSource} = require("./_lib/hubspot");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTENT_SOURCE = "podcast-guest";
const CONSENT_TEXT = "I agree to Ignis Leadership storing these details so Yorik can reply about the Connecting Energy podcast.";

function guestFormId() {
  return String(process.env.HUBSPOT_PODCAST_GUEST_FORM_ID || "").trim();
}

function send(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function linkedinUrl(value) {
  const raw = clip(value, 300);
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) return null;
    url.protocol = "https:";
    return url.href.slice(0, 300);
  } catch (_error) {
    return null;
  }
}

function guestMessage({organisation, role, topic, linkedin}) {
  return [
    "Connecting Energy podcast: guest application",
    `Organisation: ${organisation}`,
    `Role: ${role}`,
    `LinkedIn: ${linkedin || "not given"}`,
    "Topic idea:",
    topic
  ].join("\n");
}

function buildGuestFields({firstname, lastname, email, organisation, role, topic, linkedin}) {
  const fields = [
    {name: "email", value: email},
    {name: "firstname", value: firstname}
  ];
  if (lastname) fields.push({name: "lastname", value: lastname});
  fields.push({name: "company", value: organisation});
  fields.push({name: "jobtitle", value: role});
  if (linkedin) fields.push({name: "hs_linkedin_url", value: linkedin});
  // The message carries every answer, so nothing is lost if HubSpot strips a field the form lacks.
  fields.push({name: "message", value: guestMessage({organisation, role, topic, linkedin})});
  if (knownContentSource(CONTENT_SOURCE)) fields.push({name: "content_source", value: CONTENT_SOURCE});
  return fields;
}

module.exports = async function guest(request, response) {
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

  const gate = await protectForm(request, body, "guest");
  if (gate) return send(response, gate.status, gate.payload);

  const fullName = clip(body.name, 160);
  const email = String(body.email || "").trim().toLowerCase();
  const organisation = clip(body.organisation || body.company, 200);
  const role = clip(body.role, 160);
  const topic = String(body.topic || "").trim().replace(/\r\n?/g, "\n").slice(0, 2000);
  const linkedin = linkedinUrl(body.linkedin);

  if (!fullName) return send(response, 422, {ok: false, error: "Please add your name."});
  if (!EMAIL_PATTERN.test(email)) return send(response, 422, {ok: false, error: "Enter a valid email address."});
  if (!organisation) return send(response, 422, {ok: false, error: "Please add your organisation."});
  if (!role) return send(response, 422, {ok: false, error: "Please add your role."});
  if (topic.length < 10) return send(response, 422, {ok: false, error: "Tell me a little more about the topic."});
  if (linkedin === null) return send(response, 422, {ok: false, error: "That doesn't look like a LinkedIn link."});

  const formId = guestFormId();
  if (!formId) {
    console.error("HUBSPOT_PODCAST_GUEST_FORM_ID is not set. The guest application was not stored.");
    return send(response, 503, {ok: false, error: "not_configured"});
  }

  const parts = fullName.split(" ");
  const firstname = parts.shift() || "";
  const lastname = parts.join(" ");
  const context = contextFor(request, body, "Connecting Energy podcast: be a guest", "https://www.ignisleadership.com/#guest");

  try {
    await submitWithFallback(formId, {
      submittedAt: Date.now(),
      fields: buildGuestFields({firstname, lastname, email, organisation, role, topic, linkedin}),
      context,
      legalConsentOptions: {consent: {consentToProcess: true, text: CONSENT_TEXT}}
    });
    return send(response, 200, {ok: true});
  } catch (error) {
    if (error && error.emailRejected) {
      return send(response, 422, {ok: false, error: "That email address cannot be used. Try a different one."});
    }
    console.error("HubSpot guest submission error", error && error.message, error && error.detail);
    return send(response, 502, {ok: false, error: "We could not send that just now."});
  }
};

module.exports.buildGuestFields = buildGuestFields;
module.exports.linkedinUrl = linkedinUrl;
module.exports.CONTENT_SOURCE = CONTENT_SOURCE;
