import test, {mock} from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createRequire} from "node:module";
import fs, {existsSync, readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join} from "node:path";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const whitepaper = require("../api/whitepaper.js");

const GATED = [
  ["agentic-transformation-for-energy-developers", "/assets/downloads/ignis-guide-agentic-transformation-for-energy-developers.pdf"],
  ["bids-won-on-evidence", "/assets/downloads/guide-01-bids-whitepaper.pdf"],
  ["commercial-system-pipeline", "/assets/downloads/ignis-white-paper-commercial-system-pipeline.pdf"]
];

const FREE = [
  ["route-to-market", "/assets/downloads/ignis-route-to-market.pdf", "resources/route-to-market.html"],
  ["procurement", "/assets/downloads/ignis-procurement.pdf", "resources/procurement.html"],
  ["market-monitor-2026-10", "/assets/downloads/ignis-market-monitor-2026-10.pdf", "reports/market-monitor-2026-10.html"]
];

  const FREE_PDFS = new Set();

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(value) { this.body = JSON.parse(value); }
  };
}

function versionFor(pdfPath) {
  const file = join(root, pdfPath.replace(/^\//, ""));
  return createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 8);
}

function hasPdf(body) {
  return Object.prototype.hasOwnProperty.call(body, "pdf");
}

test("only the agentic guide stays gated, and the override can open it", async () => {
  const originalFetch = global.fetch;
  const originalUngated = process.env.HUBSPOT_UNGATED_RESOURCES;
  const originalSite = process.env.TURNSTILE_SITE_KEY;
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;
  const originalGuide = process.env.HUBSPOT_AGENTIC_GUIDE_FORM_ID;
  const originalMonitor = process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
  global.fetch = async () => ({ok: true, status: 200, json: async () => ({success: true}), text: async () => ""});
  let ip = 80;
  try {
    delete process.env.HUBSPOT_UNGATED_RESOURCES;
    delete process.env.TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.HUBSPOT_AGENTIC_GUIDE_FORM_ID = "guide-form-for-gating-test";

    assert.equal(whitepaper.paperIsGated("agentic-transformation-for-energy-developers", {gated: true}), true);
    assert.equal(whitepaper.paperIsGated("route-to-market", {gated: false}), false);
    assert.equal(whitepaper.paperIsGated("route-to-market", {}), true);

    process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = "monitor-form-for-gating";
    for (const [resource, pdfPath] of FREE) {
      const lookedUp = response();
      await whitepaper({method: "GET", url: `/api/whitepaper?resource=${encodeURIComponent(resource)}`, headers: {}}, lookedUp);
      assert.equal(lookedUp.statusCode, 200, resource);
      assert.equal(lookedUp.body.gated, true, resource);
      assert.equal(lookedUp.body.presentation, "popup", resource);
      assert.equal(hasPdf(lookedUp.body), false, resource);
      assert.doesNotMatch(JSON.stringify(lookedUp.body), /\/assets\/downloads\//, resource);

      const posted = response();
      await whitepaper({
        method: "POST",
        body: {email: "test@example.com", resource, form_started_at: Date.now() - 10000},
        headers: {"x-forwarded-for": `198.51.100.${ip++}`}
      }, posted);
      assert.equal(posted.statusCode, 200, resource);
      assert.equal(posted.body.pdf, `${pdfPath}?v=${versionFor(pdfPath)}`, resource);
    }

    for (const [resource, pdfPath] of GATED) {
      const lookedUp = response();
      await whitepaper({method: "GET", url: `/api/whitepaper?resource=${encodeURIComponent(resource)}`, headers: {}}, lookedUp);
      assert.equal(lookedUp.statusCode, 200, resource);
      assert.equal(lookedUp.body.gated, true, resource);
      assert.equal(lookedUp.body.presentation, resource.startsWith("agentic") ? "form" : "form", resource);
      assert.equal(hasPdf(lookedUp.body), false, resource);
      assert.doesNotMatch(JSON.stringify(lookedUp.body), /\/assets\/downloads\//, resource);

      const posted = response();
      await whitepaper({
        method: "POST",
        body: {email: "test@example.com", resource, form_started_at: Date.now() - 10000},
        headers: {"x-forwarded-for": `198.51.100.${ip++}`}
      }, posted);
      assert.equal(posted.statusCode, 200, resource);
      assert.equal(posted.body.ok, true, resource);
      assert.equal(posted.body.pdf, `${pdfPath}?v=${versionFor(pdfPath)}`, resource);
    }

    const invalid = response();
    await whitepaper({
      method: "POST",
      body: {email: "not-an-email", resource: "agentic-transformation-for-energy-developers", form_started_at: Date.now() - 10000},
      headers: {"x-forwarded-for": "198.51.100.200"}
    }, invalid);
    assert.equal(invalid.statusCode, 422);
    assert.equal(hasPdf(invalid.body), false);

    process.env.HUBSPOT_UNGATED_RESOURCES = " agentic-transformation-for-energy-developers ,";
    assert.equal(whitepaper.paperIsGated("agentic-transformation-for-energy-developers", {gated: true}), false);
    assert.equal(whitepaper.paperIsGated("bids-won-on-evidence", {gated: true}), true);
    const opened = response();
    await whitepaper({method: "GET", url: "/api/whitepaper?resource=agentic-transformation-for-energy-developers", headers: {}}, opened);
    assert.equal(opened.body.gated, false);
    assert.equal(opened.body.pdf, `/assets/downloads/ignis-guide-agentic-transformation-for-energy-developers.pdf?v=${versionFor("/assets/downloads/ignis-guide-agentic-transformation-for-energy-developers.pdf")}`);
    const stillGated = response();
    await whitepaper({method: "GET", url: "/api/whitepaper?resource=route-to-market", headers: {}}, stillGated);
    assert.equal(stillGated.body.gated, true);
    assert.equal(stillGated.body.presentation, "popup");
    assert.equal(hasPdf(stillGated.body), false);
  } finally {
    global.fetch = originalFetch;
    if (originalUngated === undefined) delete process.env.HUBSPOT_UNGATED_RESOURCES;
    else process.env.HUBSPOT_UNGATED_RESOURCES = originalUngated;
    if (originalSite === undefined) delete process.env.TURNSTILE_SITE_KEY;
    else process.env.TURNSTILE_SITE_KEY = originalSite;
    if (originalSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = originalSecret;
    if (originalGuide === undefined) delete process.env.HUBSPOT_AGENTIC_GUIDE_FORM_ID;
    else process.env.HUBSPOT_AGENTIC_GUIDE_FORM_ID = originalGuide;
    if (originalMonitor === undefined) delete process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
    else process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = originalMonitor;
  }
});

test("a gated paper with no resolvable form id does not deliver the PDF", async () => {
  const originalFetch = global.fetch;
  const originalGuide = process.env.HUBSPOT_AGENTIC_GUIDE_FORM_ID;
  const originalShared = process.env.HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID;
  const originalMonitor = process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(" "));
  const calls = [];
  global.fetch = async (url) => {
    calls.push(String(url));
    return {ok: true, status: 200, json: async () => ({success: true}), text: async () => ""};
  };
  const restore = (name, value) => {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  };
  try {
    delete process.env.HUBSPOT_AGENTIC_GUIDE_FORM_ID;
    delete process.env.HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID;
    delete process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
    const defaults = response();
    await whitepaper({
      method: "POST",
      body: {email: "ada@example.com", resource: "agentic-transformation-for-energy-developers", form_started_at: Date.now() - 10000},
      headers: {"x-forwarded-for": "198.51.100.209"}
    }, defaults);
    assert.equal(defaults.statusCode, 200);
    assert.match(calls[0], /2282b746-28f8-4e9f-a783-6d471c01fffd$/);

    process.env.HUBSPOT_AGENTIC_GUIDE_FORM_ID = "   ";
    calls.length = 0;
    warnings.length = 0;
    const blocked = response();
    await whitepaper({
      method: "POST",
      body: {email: "ada@example.com", resource: "agentic-transformation-for-energy-developers", signal_opt_in: "true", form_started_at: Date.now() - 10000},
      headers: {"x-forwarded-for": "198.51.100.210"}
    }, blocked);
    assert.equal(blocked.statusCode, 503);
    assert.deepEqual(blocked.body, {ok: false, error: "We could not send your paper just now. Please try again."});
    assert.equal(calls.length, 0);
    assert.match(warnings.join("\n"), /not delivering agentic-transformation-for-energy-developers without a HubSpot form submission/);

    warnings.length = 0;
    const closed = response();
    await whitepaper({
      method: "POST",
      body: {email: "ada@example.com", resource: "market-monitor-2026-10", form_started_at: Date.now() - 10000},
      headers: {"x-forwarded-for": "198.51.100.211"}
    }, closed);
    assert.equal(closed.statusCode, 503);
    assert.equal(hasPdf(closed.body), false);
    assert.match(warnings.join("\n"), /not delivering market-monitor-2026-10/);

    warnings.length = 0;
    process.env.HUBSPOT_UNGATED_RESOURCES = "market-monitor-2026-10";
    const free = response();
    await whitepaper({
      method: "POST",
      body: {email: "ada@example.com", resource: "market-monitor-2026-10", form_started_at: Date.now() - 10000},
      headers: {"x-forwarded-for": "198.51.100.213"}
    }, free);
    assert.equal(free.statusCode, 200);
    assert.equal(free.body.pdf, `/assets/downloads/ignis-market-monitor-2026-10.pdf?v=${versionFor("/assets/downloads/ignis-market-monitor-2026-10.pdf")}`);
    delete process.env.HUBSPOT_UNGATED_RESOURCES;

    process.env.HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID = "shared-download-form";
    calls.length = 0;
    const shared = response();
    await whitepaper({
      method: "POST",
      body: {email: "ada@example.com", resource: "agentic-transformation-for-energy-developers", form_started_at: Date.now() - 10000},
      headers: {"x-forwarded-for": "198.51.100.212"}
    }, shared);
    assert.equal(shared.statusCode, 200);
    assert.match(shared.body.pdf, /^\/assets\/downloads\/ignis-guide-agentic-transformation-for-energy-developers\.pdf\?v=/);
    assert.match(calls[0], /shared-download-form$/);
  } finally {
    console.warn = originalWarn;
    global.fetch = originalFetch;
    restore("HUBSPOT_AGENTIC_GUIDE_FORM_ID", originalGuide);
    restore("HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID", originalShared);
    restore("HUBSPOT_MARKET_MONITOR_FORM_ID", originalMonitor);
  }
});

test("popup pages have no PDF URL and the guide keeps its on-page form", () => {
  for (const [resource, , file] of FREE) {
    const html = readFileSync(join(root, file), "utf8");
    assert.doesNotMatch(html, /\/assets\/downloads\//, file);
    assert.match(html, /<p class="wp-free-label">Free resource\.<\/p>/, file);
    assert.doesNotMatch(html, /wp-inline-download|wp-download-open|wp-gate-card|Download the white paper|download the PDF/, file);
    assert.equal((html.match(/class="wp-get-pdf"[^>]*>Get the PDF</g) || []).length, 2, file);
    assert.equal((html.match(/data-download-open/g) || []).length, 2, file);
    assert.doesNotMatch(html, /<button[^>]*data-download-open/, file);
    assert.doesNotMatch(html, /wp-download-jump/, file);
    assert.match(html, new RegExp(`data-paper="${resource}"`), file);
    assert.match(html, /<dialog class="wp-download-dialog"/, file);
    assert.match(html, /data-whitepaper-popup/, file);
    assert.match(html, /Enter your email\. The PDF downloads now and a copy goes to your inbox\./, file);
    assert.match(html, /<button type="submit">Send me the PDF<\/button>/, file);
    assert.match(html, /Your download has started\./, file);
    assert.match(html, /Download not started\? <a href="#" data-download-fallback>Use this link<\/a>/, file);
    assert.match(html, /name="email"[^>]*required/, file);
    assert.doesNotMatch(html, /name="firstname"|name="lastname"/, file);
    assert.match(html, /name="signal_opt_in" value="true">/, file);
    assert.doesNotMatch(html, /name="signal_opt_in"[^>]*checked/, file);
    assert.match(html, /data-turnstile/, file);
    assert.match(html, /class="signal-signup-form"[^>]*data-community-form/, file);
  }
  const guide = readFileSync(join(root, "resources/agentic-transformation-for-energy-developers.html"), "utf8");
  assert.doesNotMatch(guide, /\/assets\/downloads\//);
  assert.doesNotMatch(guide, /data-whitepaper-popup/);
  assert.match(guide, /data-whitepaper-form/);
  assert.match(guide, /name="resource" value="agentic-transformation-for-energy-developers"/);
  assert.match(guide, /name="content_source" value="guide-agentic-transformation"/);
  assert.match(guide, /name="signal_opt_in"/);
  assert.doesNotMatch(guide, /name="signal_opt_in"[^>]*checked/);
  assert.doesNotMatch(guide, /Free resource\. Read it below/);
});

test("the client uses the API pdf, hides an ungated form, and drops the old bypasses", () => {
  const script = readFileSync(join(root, "assets/whitepaper.js"), "utf8");
  assert.doesNotMatch(script, /guide-01-bids-whitepaper/);
  assert.doesNotMatch(script, /sessionStorage/);
  assert.doesNotMatch(script, /data-whitepaper-pdf/);
  assert.match(script, /\/api\/whitepaper\?resource=/);
  assert.match(script, /data\.gated === false && data\.pdf/);
  assert.match(script, /revealWhitepaperDownload\(data\.pdf/);
  assert.match(script, /dialog\[data-paper\]/);
  assert.match(script, /data-whitepaper-popup/);
  assert.match(script, /showModal/);
  assert.match(script, /startDownload\(data\.pdf\)/);
  assert.match(script, /function formErrorText\(value, fallback\)/);
  assert.match(script, /value\.message/);
  assert.doesNotMatch(script, /new Error\(data\.error \|\|/);
  assert.match(script, /formErrorText\(data\.error, "We could not send your paper just now\."\)/);
  const signup = readFileSync(join(root, "assets/capability.js"), "utf8");
  assert.match(signup, /function formErrorText\(value,fallback\)/);
  assert.doesNotMatch(signup, /new Error\(data\.error\|\|/);
  assert.match(signup, /formErrorText\(data\.error,"We could not send this just now\."\)/);
  assert.match(signup, /formErrorText\(data\.error,"We could not add you just now\."\)/);
  const readiness = readFileSync(join(root, "assets/readiness.js"), "utf8");
  assert.doesNotMatch(readiness, /data\.error/);
  assert.match(readiness, /We could not save your details\. Please try again, or email admin@ignisleadership\.com\./);
});

test("download PDFs revalidate, and only the guide PDF is noindex", () => {
  const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  const headers = vercel.headers;
  const assetsAt = headers.findIndex((rule) => rule.source === "/assets/(.*)");
  const pdfAt = headers.findIndex((rule) => rule.source === "/assets/downloads/(.*).pdf");
  assert.ok(assetsAt !== -1 && pdfAt > assetsAt);
  const assetsCache = headers[assetsAt].headers.find((item) => item.key === "Cache-Control");
  const pdfCache = headers[pdfAt].headers.find((item) => item.key === "Cache-Control");
  assert.equal(assetsCache.value, "public, max-age=31536000, immutable");
  assert.equal(pdfCache.value, "public, max-age=0, must-revalidate");
  assert.equal(vercel.functions["api/whitepaper.js"].includeFiles, "assets/downloads/**");
  const robots = headers.filter((rule) => (rule.headers || []).some((item) => item.key === "X-Robots-Tag"));
  const noindex = new Set([
    "/assets/downloads/ignis-route-to-market.pdf",
    "/assets/downloads/ignis-procurement.pdf",
    "/assets/downloads/ignis-market-monitor-2026-10.pdf",
    "/assets/downloads/ignis-guide-agentic-transformation-for-energy-developers.pdf"
  ]);
  assert.equal(robots.length, noindex.size);
  for (const rule of robots) {
    assert.equal(noindex.has(rule.source), true, rule.source);
    assert.equal(rule.headers.find((item) => item.key === "X-Robots-Tag").value, "noindex");
  }
  assert.equal(headers.some((rule) => rule.source === "/assets/downloads/guide-01-bids-whitepaper.pdf"), false);
  assert.equal(headers.some((rule) => rule.source === "/assets/downloads/ignis-white-paper-commercial-system-pipeline.pdf"), false);
  assert.ok(vercel.redirects.some((rule) => rule.source === "/how-ignis-works" && rule.destination === "/services"));
});

test("llms.txt points at the paper pages and not their PDFs", () => {
  const llms = readFileSync(join(root, "llms.txt"), "utf8");
  const brochure = "- [Governed agentic system brochure](https://www.ignisleadership.com/assets/downloads/ignis-governed-agentic-system-brochure.pdf): a free, ungated overview of how people, agents, knowledge and controls work together across bids and tenders.";
  assert.ok(llms.includes(brochure));
  for (const name of [
    "ignis-guide-agentic-transformation-for-energy-developers.pdf",
    "guide-01-bids-whitepaper.pdf",
    "ignis-white-paper-commercial-system-pipeline.pdf",
    "ignis-route-to-market.pdf",
    "ignis-procurement.pdf",
    "ignis-market-monitor-2026-10.pdf"
  ]) {
    assert.equal(llms.includes(name), false, name);
  }
  assert.match(llms, /\/resources\/route-to-market\)/);
  assert.match(llms, /\/resources\/procurement\)/);
  assert.match(llms, /\/reports\/market-monitor-2026-10\)/);
  assert.match(llms, /\/resources\/agentic-transformation-for-energy-developers\)/);
  const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  const redirectSources = new Set(vercel.redirects.map((rule) => rule.source));
  const urls = [...llms.matchAll(/https:\/\/www\.ignisleadership\.com[^)\s]*/g)].map((match) => match[0]);
  assert.ok(urls.length >= 10);
  for (const url of urls) {
    const path = new URL(url).pathname;
    if (path === "/assets/downloads/ignis-governed-agentic-system-brochure.pdf" || FREE_PDFS.has(path)) {
      assert.ok(existsSync(join(root, path.slice(1))), url);
      continue;
    }
    assert.doesNotMatch(path, /\/assets\/downloads\//, url);
    assert.equal(redirectSources.has(path), false, `${path} redirects`);
    const file = path === "/" ? "index.html" : `${path.replace(/^\//, "")}.html`;
    assert.ok(existsSync(join(root, file)), `${url} -> ${file}`);
  }
  const setup = readFileSync(join(root, "FORMS_SETUP.md"), "utf8");
  assert.match(setup, /HUBSPOT_UNGATED_RESOURCES/);
  assert.match(setup, /paperIsGated/);
  assert.match(setup, /presentation: "popup"/);
  assert.match(setup, /2282b746-28f8-4e9f-a783-6d471c01fffd/);
  assert.match(setup, /X-Robots-Tag: noindex/);
  assert.match(setup, /includeFiles/);
  assert.match(setup, /Get the PDF/);
});

test("a missing PDF file does not crash the download", async () => {
  const originalFetch = global.fetch;
  const originalWarn = console.error;
  const originalUngated = process.env.HUBSPOT_UNGATED_RESOURCES;
  const originalMonitor = process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
  const originalShared = process.env.HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID;
  const originalSite = process.env.TURNSTILE_SITE_KEY;
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;
  const originalUpstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalUpstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const errors = [];
  console.error = (...args) => { errors.push(args.map(String).join(" ")); };
  const read = mock.method(fs, "readFileSync", () => {
    const error = new Error("ENOENT: missing pdf");
    error.code = "ENOENT";
    throw error;
  });
  whitepaper.resetPdfVersionsForTests();
  try {
    delete process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
    delete process.env.HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID;
    delete process.env.TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.HUBSPOT_UNGATED_RESOURCES = "market-monitor-2026-10";
    global.fetch = async () => { throw new Error("fetch should not run"); };
    const delivered = response();
    await whitepaper({
      method: "POST",
      body: {email: "ada@example.com", resource: "market-monitor-2026-10", form_started_at: Date.now() - 10000},
      headers: {"x-forwarded-for": "198.51.100.214"}
    }, delivered);
    assert.equal(delivered.statusCode, 200);
    assert.equal(delivered.body.ok, true);
    assert.equal(delivered.body.pdf, "/assets/downloads/ignis-market-monitor-2026-10.pdf");
    assert.match(errors.join("\n"), /Could not read .*ignis-market-monitor-2026-10\.pdf/);
    assert.match(errors.join("\n"), /include assets\/downloads/);
  } finally {
    read.mock.restore();
    whitepaper.resetPdfVersionsForTests();
    console.error = originalWarn;
    global.fetch = originalFetch;
    if (originalUngated === undefined) delete process.env.HUBSPOT_UNGATED_RESOURCES;
    else process.env.HUBSPOT_UNGATED_RESOURCES = originalUngated;
    if (originalMonitor === undefined) delete process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
    else process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = originalMonitor;
    if (originalShared === undefined) delete process.env.HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID;
    else process.env.HUBSPOT_RESOURCE_DOWNLOAD_FORM_ID = originalShared;
    if (originalSite === undefined) delete process.env.TURNSTILE_SITE_KEY;
    else process.env.TURNSTILE_SITE_KEY = originalSite;
    if (originalSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = originalSecret;
    if (originalUpstashUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = originalUpstashUrl;
    if (originalUpstashToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = originalUpstashToken;
  }
});
