import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
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
    for (const [resource, formId, pdf] of [
      ["bids-won-on-evidence", "9b783156-b16d-443a-bc80-51bab3411670", "/assets/downloads/guide-01-bids-whitepaper.pdf"],
      ["commercial-system-pipeline", "5b3bb573-2ca5-47cc-8bc0-3e8b0f4023d5", "/assets/downloads/ignis-white-paper-commercial-system-pipeline.pdf"]
    ]) {
      const result = response();
      await whitepaper({method: "POST", body: {email: "test@example.com", resource, paper_email_consent: "true", form_started_at: Date.now() - 10000}, headers: {}}, result);
      assert.equal(result.statusCode, 200);
      assert.equal(result.body.pdf, pdf);
      assert.equal(result.body.newsletterSubscribed, false);
      const request = requests.at(-1);
      assert.match(request.url, new RegExp(formId + "$"));
      const fields = Object.fromEntries(request.payload.fields.map((field) => [field.name, field.value]));
      assert.equal(fields.email, "test@example.com");
      assert.equal(fields.resource, resource);
      assert.equal(fields.content_source, resource === "bids-won-on-evidence" ? "whitepaper-bids-won-on-evidence" : "whitepaper-commercial-system-pipeline");
      assert.equal(fields.acquisition_source, "website");
      assert.deepEqual(request.payload.legalConsentOptions.consent.communications.map(item => item.subscriptionTypeId), [3918058120]);
    }
    const optedIn = response();
    await whitepaper({method: "POST", body: {email: "test@example.com", resource: "bids-won-on-evidence", paper_email_consent: "true", signal_opt_in: "true", company: "North Sea Power", enquiry_topic: "ar8", page_url: "https://www.ignisleadership.com/resources/bids-won-on-evidence?utm_source=linkedin", form_started_at: Date.now() - 10000}, headers: {}}, optedIn);
    assert.equal(optedIn.statusCode, 200);
    assert.equal(optedIn.body.pdf, "/assets/downloads/guide-01-bids-whitepaper.pdf");
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

test("paper forms and visible Signal signups are connected", () => {
  const bids = readFileSync(join(root, "resources/bids-won-on-evidence.html"), "utf8");
  const pipeline = readFileSync(join(root, "resources/commercial-system-for-your-pipeline.html"), "utf8");
  for (const html of [bids, pipeline]) {
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
    assert.match(signup, /Email me Signal, the weekly newsletter, and occasional marketing updates\. We won't fill your inbox\. See our <a href="\/privacy">Privacy Policy<\/a>\./);
    assert.doesNotMatch(html, /class="signal-signup-privacy"/);
  }
  const home = readFileSync(join(root, "index.html"), "utf8");
  assert.match(home, /class="signal-signup-form"[^>]*data-community-form/);
  const homeConsent = home.match(/<label class="signal-signup-consent">[\s\S]*?<\/label>/)?.[0] ?? "";
  assert.match(homeConsent, /Email me Signal, the weekly newsletter, and occasional marketing updates\. We won't fill your inbox\. See our <a href="\/privacy">Privacy Policy<\/a>\./);
  assert.doesNotMatch(homeConsent, /checked/);
});
