import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync, readdirSync, statSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join} from "node:path";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const subscribe = require("../api/subscribe.js");
const whitepaper = require("../api/whitepaper.js");

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(value) { this.body = JSON.parse(value); }
  };
}

function assertVersionedPdf(actual, filePath) {
  assert.equal(String(actual).split("?")[0], filePath);
  assert.match(String(actual), /\?v=[0-9a-f]{8}$/);
}

test("Signal signup needs affirmative consent and uses the Signal form", async () => {
  const originalFetch = global.fetch;
  const requests = [];
  global.fetch = async (url, init) => {
    requests.push({url, payload: JSON.parse(init.body)});
    return {ok: true};
  };
  try {
    const rejected = response();
    await subscribe({method: "POST", body: {email: "test@example.com", form_started_at: Date.now() - 10000}, headers: {}}, rejected);
    assert.equal(rejected.statusCode, 422);
    assert.equal(requests.length, 0);
    const accepted = response();
    await subscribe({method: "POST", body: {email: "test@example.com", signal_consent: "true", form_started_at: Date.now() - 10000}, headers: {}}, accepted);
    assert.equal(accepted.statusCode, 200);
    assert.match(requests[0].url, /9ee4b5ce-211f-4be1-a8d1-69809052e8b2$/);
    const fields = Object.fromEntries(requests[0].payload.fields.map((field) => [field.name, field.value]));
    assert.equal(fields.email, "test@example.com");
    assert.equal(fields.content_source, "signal-signup");
    assert.equal(fields.signal_source, "website");
    const today = new Date();
    assert.equal(Number(fields.signal_subscribed_date), Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    assert.deepEqual(requests[0].payload.legalConsentOptions.consent.communications.map(item => item.subscriptionTypeId), [3918046194]);
    assert.match(requests[0].payload.legalConsentOptions.consent.communications[0].text, /won't fill your inbox/);
    assert.match(requests[0].payload.legalConsentOptions.consent.text, /occasional marketing updates/);
  } finally {
    global.fetch = originalFetch;
  }
});

test("both paper gates route by resource and never infer Signal consent", async () => {
  const originalFetch = global.fetch;
  const requests = [];
  global.fetch = async (url, init) => {
    requests.push({url, payload: JSON.parse(init.body)});
    return {ok: true};
  };
  try {
    for (const [resource, formId, pdf, contentSource] of [
      ["bids-won-on-evidence", "9b783156-b16d-443a-bc80-51bab3411670", "/assets/downloads/guide-01-bids-whitepaper.pdf", "whitepaper-bids-won-on-evidence"],
      ["commercial-system-pipeline", "5b3bb573-2ca5-47cc-8bc0-3e8b0f4023d5", "/assets/downloads/ignis-white-paper-commercial-system-pipeline.pdf", "whitepaper-commercial-system-pipeline"]
    ]) {
      const result = response();
      await whitepaper({method: "POST", body: {email: "test@example.com", resource, paper_email_consent: "true", form_started_at: Date.now() - 10000}, headers: {}}, result);
      assert.equal(result.statusCode, 200);
      assertVersionedPdf(result.body.pdf, pdf);
      assert.equal(result.body.newsletterSubscribed, false);
      const request = requests.at(-1);
      assert.match(request.url, new RegExp(formId + "$"));
      const fields = Object.fromEntries(request.payload.fields.map((field) => [field.name, field.value]));
      assert.equal(fields.email, "test@example.com");
      assert.equal(fields.resource, resource);
      assert.equal(fields.content_source, contentSource);
      assert.equal(fields.acquisition_source, "website");
      assert.deepEqual(request.payload.legalConsentOptions.consent.communications.map(item => item.subscriptionTypeId), [3918058120]);
    }
    const optedIn = response();
    await whitepaper({method: "POST", body: {email: "test@example.com", resource: "bids-won-on-evidence", paper_email_consent: "true", signal_opt_in: "true", company: "North Sea Power", enquiry_topic: "ar8", page_url: "https://www.ignisleadership.com/resources/bids-won-on-evidence?utm_source=linkedin", form_started_at: Date.now() - 10000}, headers: {}}, optedIn);
    assert.equal(optedIn.statusCode, 200);
    assertVersionedPdf(optedIn.body.pdf, "/assets/downloads/guide-01-bids-whitepaper.pdf");
    assert.equal(optedIn.body.newsletterSubscribed, true);
    const paperCall = requests.at(-2);
    const signalCall = requests.at(-1);
    assert.match(paperCall.url, /9b783156-b16d-443a-bc80-51bab3411670$/);
    assert.deepEqual(paperCall.payload.legalConsentOptions.consent.communications.map(item => item.subscriptionTypeId), [3918058120]);
    const paperFields = Object.fromEntries(paperCall.payload.fields.map((field) => [field.name, field.value]));
    assert.equal(paperFields.company, undefined);
    assert.equal(paperFields.enquiry_topic, undefined);
    assert.match(signalCall.url, /9ee4b5ce-211f-4be1-a8d1-69809052e8b2$/);
    assert.deepEqual(signalCall.payload.legalConsentOptions.consent.communications.map(item => item.subscriptionTypeId), [3918046194]);
    assert.match(signalCall.payload.legalConsentOptions.consent.communications[0].text, /won't fill your inbox/);
    const signalFields = Object.fromEntries(signalCall.payload.fields.map((field) => [field.name, field.value]));
    assert.equal(signalFields.email, "test@example.com");
    assert.equal(signalFields.company, undefined);
    assert.equal(signalFields.enquiry_topic, undefined);
    assert.equal(signalFields.firstname, undefined);
    assert.equal(signalFields.signal_source, "linkedin");
    assert.equal(signalFields.content_source, "whitepaper-bids-won-on-evidence");
    const today = new Date();
    assert.equal(Number(signalFields.signal_subscribed_date), Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const rejected = response();
    await whitepaper({method: "POST", body: {email: "test@example.com", resource: "bad-resource", paper_email_consent: "true", form_started_at: Date.now() - 10000}, headers: {}}, rejected);
    assert.equal(rejected.statusCode, 422);
    assert.equal(requests.length, 4);
  } finally {
    global.fetch = originalFetch;
  }
});

test("route to market and procurement submit to their own HubSpot forms", async () => {
  const originalFetch = global.fetch;
  const originalRoute = process.env.HUBSPOT_ROUTE_TO_MARKET_FORM_ID;
  const originalProcurement = process.env.HUBSPOT_PROCUREMENT_FORM_ID;
  const requests = [];
  global.fetch = async (url, init) => {
    requests.push({url, payload: JSON.parse(init.body)});
    return {ok: true};
  };
  const fieldsOf = (request) => Object.fromEntries(request.payload.fields.map((field) => [field.name, field.value]));
  try {
    delete process.env.HUBSPOT_ROUTE_TO_MARKET_FORM_ID;
    delete process.env.HUBSPOT_PROCUREMENT_FORM_ID;
    const defaults = [
      ["route-to-market", "92f54ac1-4205-4a4e-9e75-4303c2b5173b", "/assets/downloads/ignis-route-to-market.pdf", "whitepaper-route-to-market"],
      ["procurement", "eb4c59d4-1f1d-4104-8df3-6a249154867c", "/assets/downloads/ignis-procurement.pdf", "whitepaper-procurement"]
    ];
    let ip = 44;
    for (const [resource, formId, pdf, contentSource] of defaults) {
      requests.length = 0;
      const result = response();
      await whitepaper({method: "POST", body: {email: "test@example.com", resource, form_started_at: Date.now() - 10000}, headers: {"x-forwarded-for": `203.0.113.${ip++}`}}, result);
      assert.equal(result.statusCode, 200);
      assertVersionedPdf(result.body.pdf, pdf);
      assert.match(requests[0].url, new RegExp(`${formId}$`));
      const fields = fieldsOf(requests[0]);
      assert.equal(fields.resource, resource);
      assert.equal(fields.content_source, contentSource);
      assert.equal(fields.acquisition_source, "website");
    }

    process.env.HUBSPOT_ROUTE_TO_MARKET_FORM_ID = "  route-form-override  ";
    process.env.HUBSPOT_PROCUREMENT_FORM_ID = "  procurement-form-override  ";
    for (const [resource, formId, contentSource] of [
      ["route-to-market", "route-form-override", "whitepaper-route-to-market"],
      ["procurement", "procurement-form-override", "whitepaper-procurement"]
    ]) {
      requests.length = 0;
      const result = response();
      await whitepaper({method: "POST", body: {email: "test@example.com", resource, form_started_at: Date.now() - 10000}, headers: {"x-forwarded-for": `203.0.113.${ip++}`}}, result);
      assert.equal(result.statusCode, 200);
      assert.match(requests[0].url, new RegExp(`${formId}$`));
      assert.equal(fieldsOf(requests[0]).content_source, contentSource);
    }
  } finally {
    global.fetch = originalFetch;
    if (originalRoute === undefined) delete process.env.HUBSPOT_ROUTE_TO_MARKET_FORM_ID;
    else process.env.HUBSPOT_ROUTE_TO_MARKET_FORM_ID = originalRoute;
    if (originalProcurement === undefined) delete process.env.HUBSPOT_PROCUREMENT_FORM_ID;
    else process.env.HUBSPOT_PROCUREMENT_FORM_ID = originalProcurement;
  }
});

test("route to market and procurement send their own content_source without an extra env list", async () => {
  const originalFetch = global.fetch;
  const originalExtra = process.env.HUBSPOT_EXTRA_CONTENT_SOURCES;
  const originalRoute = process.env.HUBSPOT_ROUTE_TO_MARKET_FORM_ID;
  const originalProcurement = process.env.HUBSPOT_PROCUREMENT_FORM_ID;
  const requests = [];
  global.fetch = async (url, init) => {
    requests.push({url, payload: JSON.parse(init.body)});
    return {ok: true};
  };
  const fieldsOf = (request) => Object.fromEntries(request.payload.fields.map((field) => [field.name, field.value]));
  const papers = [
    ["route-to-market", "whitepaper-route-to-market", "92f54ac1-4205-4a4e-9e75-4303c2b5173b", "resources/route-to-market.html"],
    ["procurement", "whitepaper-procurement", "eb4c59d4-1f1d-4104-8df3-6a249154867c", "resources/procurement.html"]
  ];
  try {
    delete process.env.HUBSPOT_EXTRA_CONTENT_SOURCES;
    delete process.env.HUBSPOT_ROUTE_TO_MARKET_FORM_ID;
    delete process.env.HUBSPOT_PROCUREMENT_FORM_ID;
    let ip = 60;
    for (const [resource, contentSource, formId, page] of papers) {
      const html = readFileSync(join(root, page), "utf8");
      assert.match(html, new RegExp(`name="content_source" value="${contentSource}"`));
      assert.doesNotMatch(html, /whitepaper-bids-won-on-evidence|whitepaper-commercial-system-pipeline/);

      requests.length = 0;
      const known = response();
      await whitepaper({method: "POST", body: {email: "test@example.com", resource, content_source: contentSource, signal_consent: "true", form_started_at: Date.now() - 10000}, headers: {"x-forwarded-for": `203.0.113.${ip++}`}}, known);
      assert.equal(known.statusCode, 200);
      assert.ok(requests.length >= 1);
      assert.match(requests[0].url, new RegExp(`${formId}$`));
      assert.equal(fieldsOf(requests[0]).resource, resource);
      assert.equal(fieldsOf(requests[0]).content_source, contentSource);
    }
  } finally {
    global.fetch = originalFetch;
    if (originalExtra === undefined) delete process.env.HUBSPOT_EXTRA_CONTENT_SOURCES;
    else process.env.HUBSPOT_EXTRA_CONTENT_SOURCES = originalExtra;
    if (originalRoute === undefined) delete process.env.HUBSPOT_ROUTE_TO_MARKET_FORM_ID;
    else process.env.HUBSPOT_ROUTE_TO_MARKET_FORM_ID = originalRoute;
    if (originalProcurement === undefined) delete process.env.HUBSPOT_PROCUREMENT_FORM_ID;
    else process.env.HUBSPOT_PROCUREMENT_FORM_ID = originalProcurement;
  }
});

test("paper forms and visible Signal signups are connected", () => {
  const bids = readFileSync(join(root, "resources/bids-won-on-evidence.html"), "utf8");
  const pipeline = readFileSync(join(root, "resources/commercial-system-for-your-pipeline.html"), "utf8");
  const route = readFileSync(join(root, "resources/route-to-market.html"), "utf8");
  const procurement = readFileSync(join(root, "resources/procurement.html"), "utf8");
  for (const html of [bids, pipeline, route, procurement]) {
    const gate = html.slice(html.indexOf('id="hubspot-whitepaper-form"'), html.indexOf('id="whitepaper-download"'));
    assert.match(html, /data-whitepaper-form/);
    assert.doesNotMatch(gate, /name="paper_email_consent"/);
    assert.doesNotMatch(gate, /name="company"|name="enquiry_topic"|name="firstname"|name="signal_role"/);
    assert.match(gate, /name="signal_opt_in"/);
    assert.doesNotMatch(gate, /name="signal_opt_in"[^>]*checked/);
    assert.match(gate, /Also email me Signal, the weekly newsletter, and occasional marketing updates\. We won't fill your inbox\. See our <a href="\/privacy">Privacy Policy<\/a>\./);
    assert.doesNotMatch(gate, /class="wp-paper-privacy"/);
    const consent = gate.match(/<label class="wp-paper-consent">[\s\S]*?<\/label>/)?.[0] ?? "";
    assert.match(consent, /href="\/privacy"/);
    assert.doesNotMatch(consent, /checked/);
    assert.match(html, /The PDF is on its way\./);
    assert.match(html, /class="signal-signup-form"[^>]*data-community-form/);
    const signup = html.match(/<label class="signal-signup-consent">[\s\S]*?<\/label>/)?.[0] ?? "";
    assert.match(signup, /Yes, I want to receive Signal, the weekly newsletter, the monthly report and occasional marketing updates\./);
    assert.doesNotMatch(html, /class="signal-signup-privacy"/);
  }
  const home = readFileSync(join(root, "index.html"), "utf8");
  assert.match(home, /class="signal-signup-form"[^>]*data-community-form/);
  const homeConsent = home.match(/<label class="signal-signup-consent">[\s\S]*?<\/label>/)?.[0] ?? "";
  assert.match(homeConsent, /Yes, I want to receive Signal, the weekly newsletter, the monthly report and occasional marketing updates\./);
  assert.doesNotMatch(homeConsent, /checked/);
  const pages = [];
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (entry === "backups" || entry === "tests" || entry === "node_modules") continue;
      if (statSync(path).isDirectory()) walk(path);
      else if (entry.endsWith(".html")) pages.push(path);
    }
  }
  walk(root);
  const signups = pages.map((path) => [path, readFileSync(path, "utf8")]).filter(([, html]) => html.includes("signal-signup-form"));
  assert.ok(signups.length >= 19);
  for (const [path, html] of signups) {
    const form = html.slice(html.indexOf('class="signal-signup-form"'), html.indexOf("signal-signup-success"));
    assert.match(form, /placeholder="Work email"/, path);
    assert.match(form, /name="signal_consent"/, path);
    assert.doesNotMatch(form, /name="company"(?!_)|name="enquiry_topic"|Company \(optional\)|Topic \(optional\)|signal-signup-optional/, path);
    assert.match(html, /class="signal-signup-success"[^>]*tabindex="-1"/, path);
    assert.match(html, /capability\.css\?v=208/);
    if (html.includes('class="signal-inbox')) {
      assert.match(form, /aria-label="Sign up">Sign up</, path);
      assert.doesNotMatch(form, /aria-label="Subscribe"|>Subscribe</, path);
      assert.match(html, /id="signal-inbox-title">Get Signal in your inbox</, path);
      assert.match(html, /Weekly UK and European energy market insight\. If you like it, sign up and get it straight into your mailbox every week\./, path);
      assert.equal(html.split('class="signal-signup-form"').length - 1, 1, path);
      assert.equal(html.split('id="wp-signup-title"').length - 1, 0, path);
    } else {
      assert.match(form, /aria-label="Subscribe"/, path);
      assert.doesNotMatch(form, />Subscribe</, path);
    }
  }
  const consentRule = /\.signal-signup-consent\{display:flex;align-items:flex-start;gap:\.4rem;min-height:24px;[^}]*color:rgba\(255,255,255,\.85\);font-size:13px;font-weight:400;line-height:1\.45/;
  const checkboxRule = /\.signal-signup-consent input\{flex:none;width:17px;height:17px;/;
  for (const file of ["assets/capability.css", "assets/whitepaper.css"]) {
    const css = readFileSync(join(root, file), "utf8");
    assert.match(css, consentRule, file);
    assert.match(css, checkboxRule, file);
    assert.match(css, /@media\(max-width:640px\)\{[\s\S]*\.signal-signup-consent\{font-size:12\.5px\}/, file);
    assert.match(css, /\.wp-signup-copy \.signal-signup-consent a\{[^}]*text-decoration:underline/, file);
  }
});
