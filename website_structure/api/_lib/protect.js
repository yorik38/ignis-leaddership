const MIN_FILL_MS = 3000;
const RATE_LIMIT = 5;
const RATE_WINDOW_SEC = 10 * 60;
const memoryBuckets = new Map();

function headerValue(headers, name) {
  if (!headers) return "";
  const wanted = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (String(key).toLowerCase() === wanted) return headers[key];
  }
  return "";
}

function clientIp(headers) {
  const forwarded = String(headerValue(headers, "x-forwarded-for") || "");
  const first = forwarded.split(",")[0].trim();
  const ip = first || String(headerValue(headers, "x-real-ip") || "").trim();
  return (ip || "unknown").slice(0, 80);
}

function filled(value) {
  return String(value || "").trim().length > 0;
}

function tooFast(body) {
  const raw = body && body.form_started_at;
  if (raw === undefined || raw === null || String(raw).trim() === "") return true;
  const started = Number(raw);
  if (!Number.isFinite(started)) return true;
  return Date.now() - started < MIN_FILL_MS;
}

// Gmail local parts with 4 or more dots, where most segments are 1–2 characters.
function isBotGmail(email) {
  const match = String(email || "").trim().toLowerCase().match(/^([^@\s]+)@(gmail\.com)$/);
  if (!match) return false;
  const segments = match[1].split(".");
  const dots = segments.length - 1;
  if (dots < 4) return false;
  const shortSegments = segments.filter((segment) => segment.length >= 1 && segment.length <= 2).length;
  return shortSegments * 2 > segments.length;
}

function memoryLimited(key) {
  const now = Date.now();
  const windowMs = RATE_WINDOW_SEC * 1000;
  if (memoryBuckets.size > 5000) memoryBuckets.clear();
  const stamps = (memoryBuckets.get(key) || []).filter((stamp) => now - stamp < windowMs);
  if (stamps.length >= RATE_LIMIT) {
    memoryBuckets.set(key, stamps);
    return true;
  }
  stamps.push(now);
  memoryBuckets.set(key, stamps);
  return false;
}

function upstashCount(data) {
  if (Array.isArray(data)) {
    const first = data[0];
    if (first && typeof first === "object" && "result" in first) return Number(first.result);
    return Number(first);
  }
  if (data && Array.isArray(data.result)) return Number(data.result[0]);
  return NaN;
}

async function rateLimited(ip, endpoint) {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim().replace(/\/$/, "");
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  const key = `ignis:form:${endpoint}:${ip}`;
  if (!url || !token) return memoryLimited(key);
  try {
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(RATE_WINDOW_SEC)]
      ])
    });
    if (!response.ok) throw new Error(`Upstash rate limit failed: ${response.status}`);
    const count = upstashCount(await response.json());
    if (!Number.isFinite(count)) throw new Error("Upstash rate limit returned an unexpected count");
    return count > RATE_LIMIT;
  } catch (error) {
    console.error("Upstash rate limit failed; using the in-memory limiter", error && error.message);
    return memoryLimited(key);
  }
}

function turnstileEnabled() {
  return Boolean(String(process.env.TURNSTILE_SITE_KEY || "").trim() && String(process.env.TURNSTILE_SECRET_KEY || "").trim());
}

async function turnstileOk(token, ip) {
  if (!turnstileEnabled()) return true;
  if (!String(token || "").trim()) return false;
  const body = new URLSearchParams();
  body.set("secret", String(process.env.TURNSTILE_SECRET_KEY).trim());
  body.set("response", String(token).trim());
  if (ip && ip !== "unknown") body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body
    });
    const data = await response.json();
    return Boolean(data && data.success);
  } catch (error) {
    console.error("Turnstile verification failed", error && error.message);
    return false;
  }
}

function turnstileToken(body) {
  if (!body) return "";
  return body.turnstile_token || body["cf-turnstile-response"] || "";
}

// Returns null when the submission may continue. Otherwise returns the HTTP response to send,
// with no HubSpot call. Honeypot, time trap and the loose Gmail pattern look successful.
async function protectForm(request, body, endpoint) {
  if (filled(body && body.company_website)) return {status: 200, payload: {ok: true}};
  if (tooFast(body)) return {status: 200, payload: {ok: true}};
  const email = String((body && body.email) || "").trim().toLowerCase();
  if (isBotGmail(email)) return {status: 200, payload: {ok: true}};
  const ip = clientIp((request && request.headers) || {});
  if (await rateLimited(ip, endpoint)) {
    return {status: 429, payload: {ok: false, error: "Please wait a few minutes before trying again."}};
  }
  if (turnstileEnabled()) {
    const ok = await turnstileOk(turnstileToken(body), ip);
    if (!ok) return {status: 422, payload: {ok: false, error: "Please complete the security check and try again."}};
  }
  return null;
}

function resetProtectionForTests() {
  memoryBuckets.clear();
}

module.exports = {
  protectForm,
  isBotGmail,
  clientIp,
  turnstileEnabled,
  resetProtectionForTests,
  MIN_FILL_MS,
  RATE_LIMIT
};
