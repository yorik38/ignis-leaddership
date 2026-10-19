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
  acquisitionSourceFromPage
} = require("./_lib/hubspot");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    "market-monitor-2026-10": {
      formId: String(process.env.HUBSPOT_MARKET_MONITOR_FORM_ID || "").trim(),
      pdf: "/assets/downloads/ignis-market-monitor-2026-10.pdf",
      contentSource: "market-monitor-2026-10",
      pageName: "Ignis Market Monitor: October 2026",
      deliverWithoutForm: true,
      separateSignalOptIn: true
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
  return [
    {name: "email", value: String(body.email || "").trim().toLowerCase()},
    {name: "resource", value: resource},
    {name: "content_source", value: contentSource},
    {name: "acquisition_source", value: acquisitionSourceFromPage(pageUrl, body.acquisition_source || body.source)}
  ];
}

function deliveryConsentText(resource) {
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
  const paper = Object.prototype.hasOwnProperty.call(catalogue, resource) ? catalogue[resource] : undefined;
  if (!EMAIL_PATTERN.test(email) || !paper) {
    return send(response, 422, {ok: false, error: "Enter a valid work email."});
  }

  const signalOptIn = checked(body.signal_opt_in);
  const communications = [{
    value: true,
    subscriptionTypeId: PAPER_SUBSCRIPTION_TYPE_ID,
    text: deliveryConsentText(resource)
  }];

  const context = contextFor(
    request,
    body,
    paper.pageName,
    `https://www.ignisleadership.com/resources/${resource}`
  );
  const fields = downloadFields(body, resource, paper.contentSource, context.pageUri);

  async function submitSignalOptIn() {
    if (!signalOptIn) return true;
    try {
      await submitWithFallback(signalFormId(), {
        submittedAt: Date.now(),
        fields: buildSignalFields({
          email,
          contentSource: paper.contentSource,
          pageUrl: context.pageUri
        }),
        context: {...context, pageName: `Signal signup from ${resource}`},
        legalConsentOptions: {
          consent: signalConsent()
        }
      }, SIGNAL_EXTRA_FIELDS);
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
    console.warn(`HUBSPOT_MARKET_MONITOR_FORM_ID is not set; delivering ${resource} without a HubSpot form submission.`);
    const signalSaved = await submitSignalOptIn();
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
          text: resource.startsWith("market-monitor")
            ? "Ignis Leadership may use my email address to send the report I requested."
            : "Ignis Leadership may use my email address to deliver the requested white paper.",
          communications
        }
      }
    }, DOWNLOAD_EXTRA_FIELDS);
  } catch (error) {
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
