function send(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

module.exports = async function formConfig(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return send(response, 405, {ok: false, error: "method_not_allowed"});
  }
  const siteKey = String(process.env.TURNSTILE_SITE_KEY || "").trim();
  const secret = String(process.env.TURNSTILE_SECRET_KEY || "").trim();
  const enabled = Boolean(siteKey && secret);
  return send(response, 200, {ok: true, turnstileSiteKey: enabled ? siteKey : ""});
};
