const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || "149324702";
const HUBSPOT_FORM_ID = process.env.HUBSPOT_READINESS_FORM_ID;
const HUBSPOT_SUBSCRIPTION_TYPE_ID = process.env.HUBSPOT_READINESS_SUBSCRIPTION_TYPE_ID;

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

module.exports = async function readinessHandler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  if (body.company_website) return send(res, 200, { ok: true });

  const email = String(body.email || "").trim().toLowerCase();
  const firstname = String(body.firstname || "").trim().slice(0, 80);
  if (!firstname || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return send(res, 400, { ok: false, error: "invalid_details" });
  }
  if (!HUBSPOT_FORM_ID || !HUBSPOT_SUBSCRIPTION_TYPE_ID) {
    console.error("Readiness form is missing HubSpot environment configuration.");
    return send(res, 503, { ok: false, error: "form_not_configured" });
  }

  const allowedRoutes = new Set(["bid", "tender"]);
  const allowedBands = new Set(["foundation", "pilot", "connect", "scale"]);
  const fields = [
    { name: "firstname", value: firstname },
    { name: "email", value: email },
    { name: "readiness_route", value: allowedRoutes.has(body.route) ? body.route : "" },
    { name: "readiness_band", value: allowedBands.has(body.readiness_band) ? body.readiness_band : "" },
    { name: "readiness_weakest_dimension", value: String(body.weakest_dimension || "").slice(0, 80) },
    { name: "readiness_recommended_workflow", value: String(body.recommended_workflow || "").slice(0, 180) },
    { name: "readiness_constraint", value: String(body.constraint_answer || "").slice(0, 180) },
    { name: "readiness_workflow_interest", value: String(body.workflow_interest || "").slice(0, 180) },
    { name: "readiness_source", value: "commercial_ai_readiness_check" }
  ];

  const forwardedFor = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const context = {
    pageUri: String(body.page_url || "https://www.ignisleadership.com/commercial-ai-readiness").slice(0, 500),
    pageName: "Commercial AI Readiness Check"
  };
  const hutk = cookieValue(req.headers.cookie, "hubspotutk");
  if (hutk) context.hutk = hutk;
  if (forwardedFor) context.ipAddress = forwardedFor;

  const submission = {
    submittedAt: Date.now(),
    fields,
    context,
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: "Receive your result and a short five-email follow-up explaining what it means. Unsubscribe at any time.",
        communications: [{
          value: true,
          subscriptionTypeId: Number(HUBSPOT_SUBSCRIPTION_TYPE_ID),
          text: "Commercial AI Readiness Check result and five-email follow-up."
        }]
      }
    }
  };

  try {
    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(HUBSPOT_PORTAL_ID)}/${encodeURIComponent(HUBSPOT_FORM_ID)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(submission) }
    );
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 800);
      console.error("HubSpot readiness submission failed", response.status, detail);
      return send(res, 502, { ok: false, error: "submission_failed" });
    }
    return send(res, 200, { ok: true });
  } catch (error) {
    console.error("HubSpot readiness submission error", error && error.message);
    return send(res, 502, { ok: false, error: "submission_failed" });
  }
};
