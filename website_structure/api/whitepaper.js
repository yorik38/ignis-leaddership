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

function papers() {
  return {
    "bids-won-on-evidence": {
      formId: "9b783156-b16d-443a-bc80-51bab3411670",
      pdf: "/assets/downloads/guide-01-bids-whitepaper.pdf",
      contentSource: "whitepaper-bids-won-on-evidence",
      pageName: "Ignis white paper: bids-won-on-evidence"
    },
    "commercial-system-pipeline": {
      formId: "5b3bb573-2ca5-47cc-8bc0-3e8b0f4023d5",
      pdf: "/assets/downloads/ignis-white-paper-commercial-system-pipeline.pdf",
      contentSource: "whitepaper-commercial-system-pipeline",
      pageName: "Ignis white paper: commercial-system-pipeline"
    },
    // Replacements keep the existing HubSpot forms but carry their own content_source.
    // Until the matching dropdown option exists in HubSpot (and is listed in
    // HUBSPOT_EXTRA_CONTENT_SOURCES or CONTENT_SOURCES), downloadFields leaves content_source
    // out, so the submission still goes through and the resource field names the paper.
    "route-to-market": {
      formId: "9b783156-b16d-443a-bc80-51bab3411670",
      pdf: "/assets/downloads/ignis-route-to-market.pdf",
      contentSource: "whitepaper-route-to-market",
      pageName: "Ignis white paper: route-to-market"
    },
    "procurement": {
      formId: "5b3bb573-2ca5-47cc-8bc0-3e8b0f4023d5",
      pdf: "/assets/downloads/ignis-procurement.pdf",
      contentSource: "whitepaper-procurement",
      pageName: "Ignis white paper: procurement"
    },
    "market-monitor-2026-10": {
      formId: String(process.env.HUBSPOT_MARKET_MONITOR_FORM_ID || "").trim(),
      pdf: "/assets/downloads/ignis-market-monitor-2026-10.pdf",
      contentSource: "market-monitor-2026-10",
      pageName: "Market Monitor, October 2026",
      formEnv: "HUBSPOT_MARKET_MONITOR_FORM_ID",
      deliverWithoutForm: true,
      separateSignalOptIn: true
    },
    "agentic-transformation-for-energy-developers": {
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
      pdf: paper.pdf,
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
    pdf: paper.pdf,
    newsletterSubscribed: signalOptIn ? signalSaved : false,
    ...(signalOptIn && !signalSaved ? {warning: "newsletter_submission_failed"} : {})
  });
};
