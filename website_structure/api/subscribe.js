const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE_TAG_ENV = {
  website: "KIT_TAG_SOURCE_WEBSITE",
  linkedin: "KIT_TAG_SOURCE_LINKEDIN",
  email: "KIT_TAG_SOURCE_EMAIL",
  shared: "KIT_TAG_SOURCE_SHARED"
};
const SOURCE_TAG_NAME = {
  website: "Source - Website",
  linkedin: "Source - LinkedIn",
  email: "Source - Email",
  shared: "Source - Reader share"
};
const NEWSLETTER_TAG_NAME = "Newsletter - Bid more. Win more.";
let cachedTags;

function json(response, status, payload) {
  response.status(status).setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  return response.end(JSON.stringify(payload));
}

async function kitRequest(path, apiKey, body, method = "POST") {
  const response = await fetch(`https://api.kit.com/v4${path}`, {
    method,
    headers: {"Content-Type": "application/json", "X-Kit-Api-Key": apiKey},
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.errors?.join(" ") || "Kit rejected the subscription.");
  return payload;
}

async function resolveTagIds(apiKey, source) {
  const configuredIds = [process.env.KIT_TAG_NEWSLETTER, process.env[SOURCE_TAG_ENV[source]]].filter(Boolean);
  if (configuredIds.length === 2) return configuredIds;

  if (!cachedTags) {
    const payload = await kitRequest("/tags", apiKey, null, "GET");
    cachedTags = payload.tags || [];
  }

  const requiredNames = [NEWSLETTER_TAG_NAME, SOURCE_TAG_NAME[source]];
  const resolvedIds = requiredNames.map((name) => cachedTags.find((tag) => tag.name === name)?.id).filter(Boolean);
  if (resolvedIds.length !== requiredNames.length) throw new Error("Required Kit tags could not be found.");
  return resolvedIds;
}

module.exports = async function subscribe(request, response) {
  if (request.method !== "POST") return json(response, 405, {error: "Method not allowed."});

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
  if (body.company_website) return json(response, 200, {ok: true});

  const email = String(body.email || "").trim().toLowerCase();
  const firstName = String(body.first_name || "").trim().slice(0, 80);
  const source = Object.hasOwn(SOURCE_TAG_ENV, body.source) ? body.source : "website";
  if (!EMAIL_PATTERN.test(email)) return json(response, 422, {error: "Enter a valid email address."});

  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID || "8043482";
  if (!apiKey) return json(response, 503, {error: "Newsletter signup is awaiting its final Kit connection."});

  try {
    await kitRequest(`/forms/${formId}/subscribers`, apiKey, {email_address: email, first_name: firstName || null});

    const tagIds = await resolveTagIds(apiKey, source);
    await Promise.all(tagIds.map((tagId) => kitRequest(`/tags/${tagId}/subscribers`, apiKey, {email_address: email})));
    return json(response, 200, {ok: true});
  } catch (error) {
    console.error("Newsletter subscription failed:", error.message);
    return json(response, 502, {error: "We could not add you just now."});
  }
};
