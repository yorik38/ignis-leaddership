import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createRequire} from "node:module";
import {existsSync, readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join} from "node:path";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const whitepaper = require("../api/whitepaper.js");

const PAPERS = [
  ["route-to-market", "/assets/downloads/ignis-route-to-market.pdf"],
  ["procurement", "/assets/downloads/ignis-procurement.pdf"],
  ["market-monitor-2026-10", "/assets/downloads/ignis-market-monitor-2026-10.pdf"],
  ["agentic-transformation-for-energy-developers", "/assets/downloads/ignis-guide-agentic-transformation-for-energy-developers.pdf"],
  ["bids-won-on-evidence", "/assets/downloads/guide-01-bids-whitepaper.pdf"],
  ["commercial-system-pipeline", "/assets/downloads/ignis-white-paper-commercial-system-pipeline.pdf"]
];

const PAGES = [
  "resources/route-to-market.html",
  "resources/procurement.html",
  "resources/agentic-transformation-for-energy-developers.html",
  "reports/market-monitor-2026-10.html"
];

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

test("gated papers hide the PDF until a valid submit, and ungated papers return it", async () => {
  const originalFetch = global.fetch;
  const originalUngated = process.env.HUBSPOT_UNGATED_RESOURCES;
  const originalSite = process.env.TURNSTILE_SITE_KEY;
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;
  global.fetch = async () => ({ok: true, status: 200, json: async () => ({success: true}), text: async () => ""});
  let ip = 80;
  try {
    delete process.env.HUBSPOT_UNGATED_RESOURCES;
    delete process.env.TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;

    assert.equal(whitepaper.paperIsGated("route-to-market", {gated: true}), true);
    assert.equal(whitepaper.paperIsGated("route-to-market", {gated: false}), false);
    assert.equal(whitepaper.paperIsGated("route-to-market", {}), true);

    for (const [resource, pdfPath] of PAPERS) {
      const lookedUp = response();
      await whitepaper({method: "GET", url: `/api/whitepaper?resource=${encodeURIComponent(resource)}`, headers: {}}, lookedUp);
      assert.equal(lookedUp.statusCode, 200, resource);
      assert.equal(lookedUp.body.gated, true, resource);
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

    const unknown = response();
    await whitepaper({method: "GET", url: "/api/whitepaper?resource=not-a-paper", headers: {}}, unknown);
    assert.equal(unknown.statusCode, 404);
    assert.equal(hasPdf(unknown.body), false);

    const fromQuery = response();
    await whitepaper({method: "GET", query: {resource: "procurement"}, headers: {}}, fromQuery);
    assert.equal(fromQuery.body.gated, true);
    assert.equal(hasPdf(fromQuery.body), false);

    const invalid = response();
    await whitepaper({
      method: "POST",
      body: {email: "not-an-email", resource: "route-to-market", form_started_at: Date.now() - 10000},
      headers: {"x-forwarded-for": "198.51.100.200"}
    }, invalid);
    assert.equal(invalid.statusCode, 422);
    assert.equal(hasPdf(invalid.body), false);

    process.env.HUBSPOT_UNGATED_RESOURCES = " route-to-market, procurement ,";
    assert.equal(whitepaper.paperIsGated("route-to-market", {gated: true}), false);
    assert.equal(whitepaper.paperIsGated("procurement", {gated: true}), false);
    assert.equal(whitepaper.paperIsGated("market-monitor-2026-10", {gated: true}), true);

    for (const [resource, pdfPath] of [
      ["route-to-market", "/assets/downloads/ignis-route-to-market.pdf"],
      ["procurement", "/assets/downloads/ignis-procurement.pdf"]
    ]) {
      const opened = response();
      await whitepaper({method: "GET", url: `/api/whitepaper?resource=${resource}`, headers: {}}, opened);
      assert.equal(opened.statusCode, 200, resource);
      assert.equal(opened.body.gated, false, resource);
      assert.equal(opened.body.pdf, `${pdfPath}?v=${versionFor(pdfPath)}`, resource);

      const posted = response();
      await whitepaper({
        method: "POST",
        body: {email: "test@example.com", resource, form_started_at: Date.now() - 10000},
        headers: {"x-forwarded-for": `198.51.100.${ip++}`}
      }, posted);
      assert.equal(posted.statusCode, 200, resource);
      assert.equal(posted.body.pdf, `${pdfPath}?v=${versionFor(pdfPath)}`, resource);
    }

    const stillGated = response();
    await whitepaper({method: "GET", url: "/api/whitepaper?resource=market-monitor-2026-10", headers: {}}, stillGated);
    assert.equal(stillGated.body.gated, true);
    assert.equal(hasPdf(stillGated.body), false);
    assert.doesNotMatch(JSON.stringify(stillGated.body), /\/assets\/downloads\//);

    const denied = response();
    await whitepaper({method: "PUT", headers: {}}, denied);
    assert.equal(denied.statusCode, 405);
    assert.equal(denied.headers.Allow, "GET, POST");
    assert.equal(hasPdf(denied.body), false);
  } finally {
    global.fetch = originalFetch;
    if (originalUngated === undefined) delete process.env.HUBSPOT_UNGATED_RESOURCES;
    else process.env.HUBSPOT_UNGATED_RESOURCES = originalUngated;
    if (originalSite === undefined) delete process.env.TURNSTILE_SITE_KEY;
    else process.env.TURNSTILE_SITE_KEY = originalSite;
    if (originalSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = originalSecret;
  }
});

test("the four paper pages contain no download URL", () => {
  for (const file of PAGES) {
    const html = readFileSync(join(root, file), "utf8");
    assert.doesNotMatch(html, /\/assets\/downloads\//, file);
    assert.match(html, /data-whitepaper-key="/, file);
    assert.match(html, /name="resource"/, file);
    assert.match(html, /whitepaper\.js\?v=11/, file);
  }
});

test("the client uses the API pdf and drops the fallback and session shortcut", () => {
  const script = readFileSync(join(root, "assets/whitepaper.js"), "utf8");
  assert.doesNotMatch(script, /guide-01-bids-whitepaper/);
  assert.doesNotMatch(script, /sessionStorage/);
  assert.doesNotMatch(script, /data-whitepaper-pdf/);
  assert.match(script, /\/api\/whitepaper\?resource=/);
  assert.match(script, /data\.gated === false && data\.pdf/);
  assert.match(script, /revealWhitepaperDownload\(data\.pdf/);
});

test("download PDFs revalidate ahead of the immutable assets rule", () => {
  const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  const headers = vercel.headers;
  const assetsAt = headers.findIndex((rule) => rule.source === "/assets/(.*)");
  const pdfAt = headers.findIndex((rule) => rule.source === "/assets/downloads/(.*).pdf");
  assert.ok(assetsAt !== -1 && pdfAt > assetsAt);
  const assetsCache = headers[assetsAt].headers.find((item) => item.key === "Cache-Control");
  const pdfCache = headers[pdfAt].headers.find((item) => item.key === "Cache-Control");
  assert.equal(assetsCache.value, "public, max-age=31536000, immutable");
  assert.equal(pdfCache.value, "public, max-age=0, must-revalidate");
  assert.equal(headers.some((rule) => (rule.headers || []).some((item) => /noindex|x-robots-tag/i.test(`${item.key} ${item.value}`))), false);
  assert.ok(vercel.redirects.some((rule) => rule.source === "/how-ignis-works" && rule.destination === "/services"));
});

test("llms.txt lists live page URLs and no gated PDF", () => {
  const llms = readFileSync(join(root, "llms.txt"), "utf8");
  const brochure = "- [Governed agentic system brochure](https://www.ignisleadership.com/assets/downloads/ignis-governed-agentic-system-brochure.pdf): a free, ungated overview of how people, agents, knowledge and controls work together across bids and tenders.";
  assert.ok(llms.includes(brochure));
  for (const name of [
    "guide-01-bids-whitepaper.pdf",
    "ignis-white-paper-commercial-system-pipeline.pdf",
    "ignis-route-to-market.pdf",
    "ignis-procurement.pdf",
    "ignis-market-monitor-2026-10.pdf",
    "ignis-guide-agentic-transformation-for-energy-developers.pdf"
  ]) {
    assert.equal(llms.includes(name), false, name);
  }
  const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  const redirectSources = new Set(vercel.redirects.map((rule) => rule.source));
  const urls = [...llms.matchAll(/https:\/\/www\.ignisleadership\.com[^)\s]*/g)].map((match) => match[0]);
  assert.ok(urls.length >= 10);
  for (const url of urls) {
    const path = new URL(url).pathname;
    if (path === "/assets/downloads/ignis-governed-agentic-system-brochure.pdf") {
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
});
