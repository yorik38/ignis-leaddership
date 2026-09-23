const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || "149324702";
const HUBSPOT_FORM_ID = process.env.HUBSPOT_CONTACT_FORM_ID || "c4133ecb-5cca-4779-bb4e-9f85bf3d8bc3";
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

module.exports = async function contactHandler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, {ok: false, error: "method_not_allowed"});
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  if (body.company_website) return send(res, 200, {ok: true});

  const fullName = String(body.name || "").trim().replace(/\s+/g, " ").slice(0, 160);
  const parts = fullName.split(" ");
  const firstname = parts.shift() || "";
  const lastname = parts.join(" ");
  const email = String(body.email || "").trim().toLowerCase();
  const company = String(body.organisation || "").trim().slice(0, 180);
  const message = String(body.message || "").trim().slice(0, 5000);
  if (!fullName || !company || !message || !EMAIL_PATTERN.test(email)) {
    return send(res, 422, {ok: false, error: "invalid_details"});
  }

  const fields = [
    {name: "email", value: email},
    {name: "firstname", value: firstname},
    {name: "lastname", value: lastname},
    {name: "company", value: company},
    {name: "jobtitle", value: String(body.role || "").trim().slice(0, 180)},
    {name: "message", value: message},
    {name: "service_interest", value: String(body.service_interest || "").trim().slice(0, 180)},
    {name: "acquisition_source", value: String(body.source || "website").trim().slice(0, 180)},
    {name: "conversion_asset", value: "website_enquiry"}
  ];

  const context = {
    pageUri: String(body.page_url || "https://www.ignisleadership.com/#contact").slice(0, 500),
    pageName: "Ignis Leadership enquiry"
  };
  const hutk = cookieValue(req.headers.cookie, "hubspotutk");
  if (hutk) context.hutk = hutk;

  try {
    const hubspotResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(HUBSPOT_PORTAL_ID)}/${encodeURIComponent(HUBSPOT_FORM_ID)}`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          submittedAt: Date.now(),
          fields,
          context,
          legalConsentOptions: {
            consent: {
              consentToProcess: true,
              text: "I agree that Ignis Leadership may use these details to respond to my enquiry."
            }
          }
        })
      }
    );
    if (!hubspotResponse.ok) {
      const detail = (await hubspotResponse.text()).slice(0, 800);
      console.error("HubSpot enquiry submission failed", hubspotResponse.status, detail);
      return send(res, 502, {ok: false, error: "submission_failed"});
    }
    return send(res, 200, {ok: true});
  } catch (error) {
    console.error("HubSpot enquiry submission error", error && error.message);
    return send(res, 502, {ok: false, error: "submission_failed"});
  }
};
