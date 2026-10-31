const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {protectForm} = require("./_lib/protect");
const {
  PAPER_SUBSCRIPTION_TYPE_ID,
  submitWithFallback,
  contextFor,
  signalConsent,
  buildSignalFields,
  signalFormId,
  SIGNAL_EXTRA_FIELDS,
  DOWNLOAD_EXTRA_FIELDS,
  acquisitionSourceFromPage,
  knownContentSource
} = require("./_lib/hubspot");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// One shared HubSpot download form can record any resource that has no form of its own.
// Its hidden fields should be email, resource, content_source and acquisition_source.
function sharedDownloadFormId() {
  return String(process.env.HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID || "").trim();
}

// Flip one paper by changing its `gated` line. true: the PDF URL is returned only
// after a valid submit. false: the form stays, and a direct download is offered too.
// HUBSPOT_UNGATED_RESOURCES (comma-separated keys) forces those papers ungated.
function papers() {
  return {
    "bids-won-on-evidence": {
      gated: true,
      formId: "9b783156-b16d-443a-bc80-51bab3411670",
      pdf: "/assets/downloads/guide-01-bids-whitepaper.pdf",
      contentSource: "whitepaper-bids-won-on-evidence",
      pageName: "Ignis white paper: bids-won-on-evidence"
    },
    "commercial-system-pipeline": {
      gated: true,
      formId: "5b3bb573-2ca5-47cc-8bc0-3e8b0f4023d5",
      pdf: "/assets/downloads/ignis-white-paper-commercial-system-pipeline.pdf",
      contentSource: "whitepaper-commercial-system-pipeline",
      pageName: "Ignis white paper: commercial-system-pipeline"
    },
    // Each paper submits to its own HubSpot form. The form id below is the default
    // and can be overridden with the named environment variable.
    "route-to-market": {
      gated: true,
      formId: String(process.env.HUBSPOT_ROUTE_TO_MARKET_FORM_ID || "92f54ac1-4205-4a4e-9e75-4303c2b5173b").trim(),
      pdf: "/assets/downloads/ignis-route-to-market.pdf",
      contentSource: "whitepaper-route-to-market",
      pageName: "Ignis white paper: route-to-market",
      formEnv: "HUBSPOT_ROUTE_TO_MARKET_FORM_ID"
    },
    "procurement": {
      gated: true,
      formId: String(process.env.HUBSPOT_PROCUREMENT_FORM_ID || "eb4c59d4-1f1d-4104-8df3-6a249154867c").trim(),
      pdf: "/assets/downloads/ignis-procurement.pdf",
      contentSource: "whitepaper-procurement",
      pageName: "Ignis white paper: procurement",
      formEnv: "HUBSPOT_PROCUREMENT_FORM_ID"
    },
    "market-monitor-2026-10": {
      gated: true,
      formId: String(process.env.HUBSPOT_MARKET_MONITOR_FORM_ID || "").trim(),
      pdf: "/assets/downloads/ignis-market-monitor-2026-10.pdf",
      contentSource: "market-monitor-2026-10",
      pageName: "Market Monitor, October 2026",
      formEnv: "HUBSPOT_MARKET_MONITOR_FORM_ID",
      deliverWithoutForm: true,
      separateSignalOptIn: true
    },
    "agentic-transformation-for-energy-developers": {
      gated: true,
      formId: String(process.env.HUBSPOT_AGENTIC_GUIDE_FORM_ID || "").trim(),
      pdf: "/assets/downloads/ignis-guide-agentic-transformation-for-energy-developers.pdf",
      contentSource: "guide-agentic-transformation",
      pageName: "Ignis guide: Agentic transformation for energy developers",
      formEnv: "HUBSPOT_AGENTIC_GUIDE_FORM_ID",
      deliverWithoutForm: true,
      separateSignalOptIn: true,
      kind: "guide"
    }
  };
}

function ungatedResourceKeys() {
  return new Set(
    String(process.env.HUBSPOT_UNGATED_RESOURCES || "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean)
  );
}

// The only place that decides whether a paper is gated.
function paperIsGated(resource, paper) {
  if (ungatedResourceKeys().has(resource)) return false;
  return !paper || paper.gated !== false;
}

const pdfVersions = new Map();

function pdfVersion(pdfPath) {
  const cached = pdfVersions.get(pdfPath);
  if (cached) return cached;
  const filePath = path.join(__dirname, "..", String(pdfPath || "").replace(/^\//, ""));
  const version = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").slice(0, 8);
  pdfVersions.set(pdfPath, version);
  return version;
}

function publicPdfUrl(pdfPath) {
  return `${pdfPath}?v=${pdfVersion(pdfPath)}`;
}

function resourceFrom(request) {
  const query = request && request.query;
  if (query && query.resource != null) {
    const value = Array.isArray(query.resource) ? query.resource[0] : query.resource;
    return String(value || "").trim();
  }
  const raw = String((request && request.url) || "");
  const q = raw.indexOf("?");
  if (q === -1) return "";
  return String(new URLSearchParams(raw.slice(q + 1)).get("resource") || "").trim();
}

function send(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function checked(value) {
  return value === true || value === "true" || value === "on";
}

function downloadFields(body, resource, contentSource, pageUrl) {
  const fields = [
    {name: "email", value: String(body.email || "").trim().toLowerCase()},
    {name: "resource", value: resource}
  ];
  // content_source is a HubSpot dropdown: only send values that exist there, so an unknown
  // value never costs us the other fields. The free text resource field always names the paper.
  if (knownContentSource(contentSource)) fields.push({name: "content_source", value: contentSource});
  fields.push({name: "acquisition_source", value: acquisitionSourceFromPage(pageUrl, body.acquisition_source || body.source)});
  return fields;
}

function deliveryConsentText(resource, paper) {
  if (paper && paper.kind === "guide") {
    return "Email me the guide I requested. This is only for this guide, not the Signal newsletter.";
  }
  if (String(resource).startsWith("market-monitor")) {
    return "Email me the report I requested. This is only for this report, not the Signal newsletter.";
  }
  return "Email me the white paper I requested. This is only for this paper, not the Signal newsletter.";
}

async function whitepaper(request, response) {
  if (request.method === "GET") {
    const resource = resourceFrom(request);
    const catalogue = papers();
    const paper = Object.prototype.hasOwnProperty.call(catalogue, resource) ? catalogue[resource] : undefined;
    if (!paper) return send(response, 404, {ok: false, error: "unknown_resource"});
    if (paperIsGated(resource, paper)) return send(response, 200, {gated: true});
    return send(response, 200, {gated: false, pdf: publicPdfUrl(paper.pdf)});
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return send(response, 405, {ok: false, error: "method_not_allowed"});
  }

  let body;
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
  } catch (_error) {
    return send(response, 400, {ok: false, error: "invalid_json"});
  }

  const gate = await protectForm(request, body, "whitepaper");
  if (gate) return send(response, gate.status, gate.payload);

  const email = String(body.email || "").trim().toLowerCase();
  const resource = String(body.resource || "").trim();
  const catalogue = papers();
  const listed = Object.prototype.hasOwnProperty.call(catalogue, resource) ? catalogue[resource] : undefined;
  const paper = listed && !listed.formId && sharedDownloadFormId()
    ? {...listed, formId: sharedDownloadFormId()}
    : listed;
  if (!EMAIL_PATTERN.test(email) || !paper) {
    return send(response, 422, {ok: false, error: "Enter a valid work email."});
  }

  const signalOptIn = checked(body.signal_opt_in);
  const communications = [{
    value: true,
    subscriptionTypeId: PAPER_SUBSCRIPTION_TYPE_ID,
    text: deliveryConsentText(resource, paper)
  }];

  const context = contextFor(
    request,
    body,
    paper.pageName,
    `https://www.ignisleadership.com/resources/${resource}`
  );
  const fields = downloadFields(body, resource, paper.contentSource, context.pageUri);

  async function submitSignalOptIn(tagResource) {
    if (!signalOptIn) return true;
    const fields = buildSignalFields({
      email,
      contentSource: paper.contentSource,
      pageUrl: context.pageUri,
      referrer: body.referrer || body.referer,
      utmSource: body.utm_source
    });
    // With no download form, this is the only record of the request, so name the resource.
    // submitWithFallback drops it only when HubSpot names that field as invalid.
    if (tagResource) fields.push({name: "resource", value: resource});
    const payload = {
      submittedAt: Date.now(),
      fields,
      context: {...context, pageName: `Signal signup from ${resource}`},
      legalConsentOptions: {
        consent: signalConsent()
      }
    };
    try {
      await submitWithFallback(signalFormId(), payload, SIGNAL_EXTRA_FIELDS);
      return true;
    } catch (error) {
      console.error("HubSpot Signal opt-in submission error", error && error.message, error && error.detail);
      return false;
    }
  }

  if (!paper.formId) {
    if (!paper.deliverWithoutForm) {
      return send(response, 422, {ok: false, error: "Enter your email and confirm that we may send the paper."});
    }
    console.warn(`${paper.formEnv || "The HubSpot download form ID"} is not set (nor HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID); delivering ${resource} without a HubSpot form submission.`);
    const signalSaved = await submitSignalOptIn(true);
    return send(response, 200, {
      ok: true,
      pdf: publicPdfUrl(paper.pdf),
      newsletterSubscribed: signalOptIn ? signalSaved : false,
      ...(signalOptIn && !signalSaved ? {warning: "newsletter_submission_failed"} : {})
    });
  }

  try {
    await submitWithFallback(paper.formId, {
      submittedAt: Date.now(),
      fields,
      context,
      legalConsentOptions: {
        consent: {
          consentToProcess: true,
          text: paper.kind === "guide"
            ? "Ignis Leadership may use my email address to deliver the requested guide."
            : resource.startsWith("market-monitor")
              ? "Ignis Leadership may use my email address to send the report I requested."
              : "Ignis Leadership may use my email address to deliver the requested white paper.",
          communications
        }
      }
    }, DOWNLOAD_EXTRA_FIELDS);
  } catch (error) {
    if (error && error.emailRejected) {
      const blocked = /\b(BLOCKED_EMAIL|INVALID_DOMAIN)\b/.test(String(error.detail || ""));
      return send(response, 422, {
        ok: false,
        error: blocked
          ? "That email address cannot be used. Try a different one."
          : "Enter a valid work email."
      });
    }
    console.error("HubSpot white paper submission error", error && error.message, error && error.detail);
    return send(response, 502, {ok: false, error: "We could not send your paper just now. Please try again."});
  }

  const signalSaved = await submitSignalOptIn();
  return send(response, 200, {
    ok: true,
    pdf: publicPdfUrl(paper.pdf),
    newsletterSubscribed: signalOptIn ? signalSaved : false,
    ...(signalOptIn && !signalSaved ? {warning: "newsletter_submission_failed"} : {})
  });
}

module.exports = whitepaper;
module.exports.paperIsGated = paperIsGated;
