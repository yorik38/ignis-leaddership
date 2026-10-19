const PAPER_SUBSCRIPTION_TYPE_ID = 3918058120;
const DEFAULT_SIGNAL_SUBSCRIPTION_TYPE_ID = "3918046194";
const DEFAULT_SIGNAL_FORM_ID = "9ee4b5ce-211f-4be1-a8d1-69809052e8b2";
const DEFAULT_PORTAL_ID = "149324702";

const ENQUIRY_TOPICS = {
  gate2: "Gate 2: keep-or-kill decisions",
  ar8: "AR8 bid",
  bid_tender: "Bid and tender work",
  new_offers: "New AI-enabled offers",
  other: "Something else"
};

const ROLES = {
  ceo_md: "CEO / MD",
  commercial_lead: "Commercial lead",
  bid_tender_lead: "Bid / tender lead",
  development: "Development",
  finance: "Finance",
  other: "Other"
};

const CONTENT_SOURCES = new Set([
  "signal-signup",
  "whitepaper-bids-won-on-evidence",
  "whitepaper-commercial-system-pipeline",
  "market-monitor-2026-10",
  "contact-form",
  "linkedin",
  "forward-referral",
  "event",
  "other"
]);

function portalId() {
  return String(process.env.HUBSPOT_PORTAL_ID || DEFAULT_PORTAL_ID).trim() || DEFAULT_PORTAL_ID;
}

function signalFormId() {
  return String(process.env.HUBSPOT_SIGNAL_FORM_ID || DEFAULT_SIGNAL_FORM_ID).trim() || DEFAULT_SIGNAL_FORM_ID;
}

function signalSubscriptionTypeId() {
  return String(process.env.HUBSPOT_SIGNAL_SUBSCRIPTION_TYPE_ID || DEFAULT_SIGNAL_SUBSCRIPTION_TYPE_ID).trim();
}

function cookieValue(header, name) {
  const match = String(header || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function queryParam(pageUrl, name) {
  try {
    const url = new URL(String(pageUrl || ""), "https://www.ignisleadership.com");
    return String(url.searchParams.get(name) || "").trim();
  } catch (_error) {
    return "";
  }
}

function signalSourceFromPage(pageUrl) {
  const utm = queryParam(pageUrl, "utm_source").toLowerCase();
  if (utm === "forward" || utm === "forward_referral" || utm === "forward-referral") return "forward_referral";
  if (utm === "linkedin") return "linkedin";
  return "website";
}

function acquisitionSourceFromPage(pageUrl, fallback) {
  const utm = queryParam(pageUrl, "utm_source");
  return (utm || fallback || "website").slice(0, 180);
}

function midnightUtc(now = Date.now()) {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function normaliseEnquiryTopic(value) {
  const key = String(value || "").trim();
  return Object.prototype.hasOwnProperty.call(ENQUIRY_TOPICS, key) ? key : "";
}

function normaliseRole(value) {
  const key = String(value || "").trim();
  return Object.prototype.hasOwnProperty.call(ROLES, key) ? key : "";
}

function clip(value, max) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

function pushField(fields, name, value) {
  const cleaned = String(value || "").trim();
  if (cleaned) fields.push({name, value: cleaned});
}

async function submitHubspotForm(formId, payload) {
  const response = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(portalId())}/${encodeURIComponent(formId)}`,
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
    error.status = response.status;
    throw error;
  }
}

async function submitWithFallback(formId, payload, extraNames) {
  try {
    await submitHubspotForm(formId, payload);
  } catch (error) {
    const fallbackFields = payload.fields.filter((field) => !extraNames.has(field.name));
    if (fallbackFields.length === payload.fields.length) throw error;
    console.error("HubSpot rejected the extra fields; retrying without them", error && error.message);
    await submitHubspotForm(formId, {...payload, fields: fallbackFields});
  }
}

function contextFor(request, body, pageName, fallbackUrl) {
  const context = {
    pageUri: String((body && body.page_url) || fallbackUrl).slice(0, 500),
    pageName
  };
  const hutk = cookieValue(request && request.headers && request.headers.cookie, "hubspotutk");
  if (hutk) context.hutk = hutk;
  return context;
}

function signalConsent(text) {
  const consent = {
    consentToProcess: true,
    text: text || "Ignis Leadership may use your email address to send Signal. You can unsubscribe at any time."
  };
  const subscriptionTypeId = Number(signalSubscriptionTypeId());
  if (Number.isFinite(subscriptionTypeId)) {
    consent.communications = [{
      value: true,
      subscriptionTypeId,
      text: "Email me Signal, the weekly Ignis newsletter. Unsubscribe anytime."
    }];
  }
  return consent;
}

function buildSignalFields({email, firstname, lastname, company, enquiryTopic, contentSource, pageUrl}) {
  const fields = [{name: "email", value: email}];
  pushField(fields, "firstname", clip(firstname, 80));
  pushField(fields, "lastname", clip(lastname, 80));
  pushField(fields, "company", clip(company, 200));
  const enquiry = normaliseEnquiryTopic(enquiryTopic);
  if (enquiry) fields.push({name: "enquiry_topic", value: enquiry});
  if (contentSource && CONTENT_SOURCES.has(contentSource)) fields.push({name: "content_source", value: contentSource});
  fields.push({name: "signal_source", value: signalSourceFromPage(pageUrl)});
  fields.push({name: "signal_subscribed_date", value: String(midnightUtc())});
  return fields;
}

const SIGNAL_EXTRA_FIELDS = new Set(["company", "enquiry_topic", "content_source", "signal_source", "signal_subscribed_date"]);
const DOWNLOAD_EXTRA_FIELDS = new Set(["firstname", "company", "signal_role", "enquiry_topic", "content_source", "acquisition_source"]);

module.exports = {
  PAPER_SUBSCRIPTION_TYPE_ID,
  ENQUIRY_TOPICS,
  ROLES,
  CONTENT_SOURCES,
  SIGNAL_EXTRA_FIELDS,
  DOWNLOAD_EXTRA_FIELDS,
  portalId,
  signalFormId,
  cookieValue,
  signalSourceFromPage,
  acquisitionSourceFromPage,
  midnightUtc,
  normaliseEnquiryTopic,
  normaliseRole,
  clip,
  pushField,
  submitHubspotForm,
  submitWithFallback,
  contextFor,
  signalConsent,
  buildSignalFields
};
