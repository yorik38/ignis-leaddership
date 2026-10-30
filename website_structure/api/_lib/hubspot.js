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
  "other",
  "guide-agentic-transformation"
]);

const SIGNAL_SOURCE_VALUES = new Set(["linkedin", "website", "forward_referral", "event", "other"]);
const EMAIL_REJECTION_TYPES = new Set(["INVALID_EMAIL", "BLOCKED_EMAIL", "INVALID_DOMAIN"]);
const STRIP_ERROR_TYPES = new Set([
  "FIELD_NOT_IN_FORM_DEFINITION",
  "VALUE_NOT_IN_FIELD_DEFINITION",
  "INVALID_NUMBER",
  "INPUT_TOO_LARGE",
  "NUMBER_OUT_OF_RANGE",
  "MAX_NUMBER_OF_SUBMITTED_VALUES_EXCEEDED"
]);

// Extra content_source values can be switched on without a code change once the
// matching option exists in HubSpot: set HUBSPOT_EXTRA_CONTENT_SOURCES to a comma separated list.
function knownContentSource(value) {
  const key = String(value || "").trim();
  if (!key) return false;
  if (CONTENT_SOURCES.has(key)) return true;
  return String(process.env.HUBSPOT_EXTRA_CONTENT_SOURCES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(key);
}

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

function mappedSignalToken(value) {
  const token = String(value || "").trim().toLowerCase();
  if (!token) return "";
  if (token === "forward" || token === "forward_referral" || token === "forward-referral") return "forward_referral";
  if (SIGNAL_SOURCE_VALUES.has(token)) return token;
  return "other";
}

function referrerSignalSource(referrer) {
  const raw = String(referrer || "").trim();
  if (!raw) return "website";
  let host = "";
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch (_error) {
    return "other";
  }
  if (!host || host === "ignisleadership.com" || host.endsWith(".ignisleadership.com") || host === "localhost" || host === "127.0.0.1") {
    return "website";
  }
  if (host === "linkedin.com" || host.endsWith(".linkedin.com") || host === "lnkd.in" || host.endsWith(".lnkd.in")) {
    return "linkedin";
  }
  return "other";
}

function signalSourceFromPage(pageUrl, referrer, explicitUtm) {
  const utm = queryParam(pageUrl, "utm_source") || String(explicitUtm || "").trim();
  if (utm) return mappedSignalToken(utm);
  return referrerSignalSource(referrer);
}

function acquisitionSourceFromPage(pageUrl, fallback) {
  const utm = queryParam(pageUrl, "utm_source");
  return (utm || fallback || "website").slice(0, 180);
}

// Forms API v3 accepts a date property as YYYY-MM-DD or as unix milliseconds
// aligned to midnight UTC. signal_subscribed_date is a HubSpot date property.
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

function parseHubspotErrors(detail) {
  const text = String(detail || "");
  try {
    const parsed = JSON.parse(text);
    return {errors: Array.isArray(parsed && parsed.errors) ? parsed.errors : [], text};
  } catch (_error) {
    return {errors: [], text};
  }
}

function isEmailRejectionDetail(detail) {
  const {errors, text} = parseHubspotErrors(detail);
  if (errors.some((item) => EMAIL_REJECTION_TYPES.has(item && item.errorType))) return true;
  return /\b(INVALID_EMAIL|BLOCKED_EMAIL|INVALID_DOMAIN)\b/.test(text);
}

function fieldNameFromText(message, fieldNames) {
  const text = String(message || "");
  const patterns = [
    /fields\.([A-Za-z0-9_]+)/,
    /field '([A-Za-z0-9_]+)'/i,
    /field "([A-Za-z0-9_]+)"/i,
    /unknown field ([A-Za-z0-9_]+)/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && fieldNames.includes(match[1])) return match[1];
  }
  for (const name of fieldNames) {
    if (name === "email") continue;
    if (new RegExp(`['"]${name}['"]`).test(text)) return name;
  }
  return "";
}

function fieldsNamedInvalid(detail, fieldNames) {
  const {errors, text} = parseHubspotErrors(detail);
  const named = [];
  const add = (name) => {
    if (name && name !== "email" && fieldNames.includes(name) && !named.includes(name)) named.push(name);
  };
  if (errors.length) {
    for (const item of errors) {
      if (!STRIP_ERROR_TYPES.has(item && item.errorType)) continue;
      if (fieldNames.includes(item && item.in)) add(item.in);
      add(fieldNameFromText(item.message, fieldNames) || fieldNameFromText(JSON.stringify(item), fieldNames));
    }
    return named;
  }
  if (!/FIELD_NOT_IN_FORM_DEFINITION|VALUE_NOT_IN_FIELD_DEFINITION|unknown field/i.test(text)) return [];
  add(fieldNameFromText(text, fieldNames));
  return named;
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
    const detail = (await response.text()).slice(0, 4000);
    const error = new Error(`HubSpot form submission failed: ${response.status}`);
    error.detail = detail;
    error.status = response.status;
    error.captcha = detail.includes("FORM_HAS_RECAPTCHA_ENABLED");
    error.emailRejected = isEmailRejectionDetail(detail);
    throw error;
  }
}

// Retry only drops fields HubSpot names as invalid. Attribution fields stay
// unless the error body names them. _extraNames is unused so existing callers
// keep working; it is not a list of fields to discard.
async function submitWithFallback(formId, payload, _extraNames) {
  let current = payload;
  const removed = [];
  const limit = Math.max(1, (payload.fields || []).length);
  for (let attempt = 0; attempt < limit; attempt += 1) {
    try {
      await submitHubspotForm(formId, current);
      return;
    } catch (error) {
      if (error && error.captcha) {
        console.error(
          "HubSpot rejected the submission because reCAPTCHA is enabled on form",
          formId,
          "Turn off CAPTCHA on forms submitted through the site API. The public Forms API cannot post to them.",
          error.detail
        );
        throw error;
      }
      if (error && error.emailRejected) {
        console.error("HubSpot rejected the email address on form", formId, error.detail);
        throw error;
      }
      const fieldNames = (current.fields || []).map((field) => field.name);
      const named = fieldsNamedInvalid(error && error.detail, fieldNames).filter((name) => !removed.includes(name));
      if (!named.length) throw error;
      removed.push(...named);
      console.error(
        "HubSpot rejected specific fields; retrying without them:",
        named.join(", "),
        "form",
        formId,
        "HubSpot response:",
        error.detail
      );
      const fields = current.fields.filter((field) => !named.includes(field.name));
      if (!fields.length) throw error;
      current = {...current, fields};
    }
  }
}

function visitorHutk(request, body) {
  const fromCookie = cookieValue(request && request.headers && request.headers.cookie, "hubspotutk");
  const posted = body && (body.hutk || body.hubspotutk);
  return String(fromCookie || posted || "").trim();
}

function contextFor(request, body, pageName, fallbackUrl) {
  const context = {
    pageUri: String((body && body.page_url) || fallbackUrl).slice(0, 500),
    pageName
  };
  const hutk = visitorHutk(request, body);
  if (hutk) context.hutk = hutk;
  return context;
}

function signalConsent(text) {
  const consent = {
    consentToProcess: true,
    text: text || "Ignis Leadership may use your email address to send Signal, the weekly newsletter, and occasional marketing updates. We won't fill your inbox. You can unsubscribe at any time."
  };
  const subscriptionTypeId = Number(signalSubscriptionTypeId());
  if (Number.isFinite(subscriptionTypeId)) {
    consent.communications = [{
      value: true,
      subscriptionTypeId,
      text: "Email me Signal, the weekly newsletter, and occasional marketing updates. We won't fill your inbox."
    }];
  }
  return consent;
}

function buildSignalFields({email, firstname, lastname, company, enquiryTopic, contentSource, pageUrl, referrer, utmSource}) {
  const fields = [{name: "email", value: email}];
  pushField(fields, "firstname", clip(firstname, 80));
  pushField(fields, "lastname", clip(lastname, 80));
  pushField(fields, "company", clip(company, 200));
  const enquiry = normaliseEnquiryTopic(enquiryTopic);
  if (enquiry) fields.push({name: "enquiry_topic", value: enquiry});
  if (knownContentSource(contentSource)) fields.push({name: "content_source", value: contentSource});
  fields.push({name: "signal_source", value: signalSourceFromPage(pageUrl, referrer, utmSource)});
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
  SIGNAL_SOURCE_VALUES,
  knownContentSource,
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
  visitorHutk,
  contextFor,
  signalConsent,
  buildSignalFields
};
