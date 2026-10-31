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

const FREE_PDFS = new Set(FREE.map(([, pdfPath]) => pdfPath));

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
  global.fetch = async () => ({ok: true, status: 200, json: async () => ({success: true}), text: async () => ""});
  let ip = 80;
  try {
    delete process.env.HUBSPOT_UNGATED_RESOURCES;
    delete process.env.TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;

    assert.equal(whitepaper.paperIsGated("agentic-transformation-for-energy-developers", {gated: true}), true);
    assert.equal(whitepaper.paperIsGated("route-to-market", {gated: false}), false);
    assert.equal(whitepaper.paperIsGated("route-to-market", {}), true);

    for (const [resource, pdfPath] of FREE) {
      const lookedUp = response();
      await whitepaper({method: "GET", url: `/api/whitepaper?resource=${encodeURIComponent(resource)}`, headers: {}}, lookedUp);
      assert.equal(lookedUp.statusCode, 200, resource);
      assert.equal(lookedUp.body.gated, false, resource);
      assert.equal(lookedUp.body.pdf, `${pdfPath}?v=${versionFor(pdfPath)}`, resource);

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
    const stillFree = response();
    await whitepaper({method: "GET", url: "/api/whitepaper?resource=route-to-market", headers: {}}, stillFree);
    assert.equal(stillFree.body.gated, false);
    assert.match(stillFree.body.pdf, /^\/assets\/downloads\/ignis-route-to-market\.pdf\?v=/);
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

test("the three free papers have no form and a real download link, and the guide stays closed", () => {
  for (const [, pdfPath, file] of FREE) {
    const html = readFileSync(join(root, file), "utf8");
    assert.doesNotMatch(html, /data-whitepaper-form/, file);
    assert.doesNotMatch(html, /action="\/api\/whitepaper"/, file);
    assert.match(html, /class="wp-free-label">Free resource</, file);
    assert.match(html, />Download the PDF</, file);
    assert.match(html, new RegExp(`href="${pdfPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\?v=${versionFor(pdfPath)}"`), file);
    assert.match(html, /class="signal-signup-form"[^>]*data-community-form/, file);
  }
  const guide = readFileSync(join(root, "resources/agentic-transformation-for-energy-developers.html"), "utf8");
  assert.doesNotMatch(guide, /\/assets\/downloads\//);
  assert.match(guide, /data-whitepaper-form/);
  assert.match(guide, /name="resource" value="agentic-transformation-for-energy-developers"/);
  assert.match(guide, /name="signal_opt_in"/);
  assert.doesNotMatch(guide, /name="signal_opt_in"[^>]*checked/);
  assert.doesNotMatch(guide, /Free resource/);
});

test("the client uses the API pdf, hides an ungated form, and drops the old bypasses", () => {
  const script = readFileSync(join(root, "assets/whitepaper.js"), "utf8");
  assert.doesNotMatch(script, /guide-01-bids-whitepaper/);
  assert.doesNotMatch(script, /sessionStorage/);
  assert.doesNotMatch(script, /data-whitepaper-pdf/);
  assert.match(script, /\/api\/whitepaper\?resource=/);
  assert.match(script, /data\.gated === false && data\.pdf/);
  assert.match(script, /revealWhitepaperDownload\(data\.pdf/);
  assert.match(script, /Free resource/);
  assert.match(script, /slot\.hidden = true/);
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
  const robots = headers.filter((rule) => (rule.headers || []).some((item) => item.key === "X-Robots-Tag"));
  assert.equal(robots.length, 1);
  assert.equal(robots[0].source, "/assets/downloads/ignis-guide-agentic-transformation-for-energy-developers.pdf");
  assert.equal(robots[0].headers.find((item) => item.key === "X-Robots-Tag").value, "noindex");
  for (const [, pdfPath] of FREE) {
    assert.equal(headers.some((rule) => rule.source === pdfPath), false, pdfPath);
  }
  assert.ok(vercel.redirects.some((rule) => rule.source === "/how-ignis-works" && rule.destination === "/services"));
});

test("llms.txt lists the three free PDFs and not the guide PDF", () => {
  const llms = readFileSync(join(root, "llms.txt"), "utf8");
  const brochure = "- [Governed agentic system brochure](https://www.ignisleadership.com/assets/downloads/ignis-governed-agentic-system-brochure.pdf): a free, ungated overview of how people, agents, knowledge and controls work together across bids and tenders.";
  assert.ok(llms.includes(brochure));
  assert.equal(llms.includes("ignis-guide-agentic-transformation-for-energy-developers.pdf"), false);
  assert.equal(llms.includes("guide-01-bids-whitepaper.pdf"), false);
  assert.equal(llms.includes("ignis-white-paper-commercial-system-pipeline.pdf"), false);
  for (const [, pdfPath] of FREE) {
    const line = llms.split("\n").find((entry) => entry.includes(pdfPath));
    assert.ok(line, pdfPath);
    assert.match(line, /free/i);
  }
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
  assert.match(setup, /gated: false/);
  assert.match(setup, /X-Robots-Tag: noindex/);
});
