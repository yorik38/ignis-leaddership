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
    await subscribe({method: "POST", body: {email: "test@example.com"}, headers: {}}, rejected);
    assert.equal(rejected.statusCode, 422);
    assert.equal(requests.length, 0);
    const accepted = response();
    await subscribe({method: "POST", body: {email: "test@example.com", signal_consent: "true"}, headers: {}}, accepted);
    assert.equal(accepted.statusCode, 200);
    assert.match(requests[0].url, /9ee4b5ce-211f-4be1-a8d1-69809052e8b2$/);
    assert.deepEqual(requests[0].payload.fields, [{name: "email", value: "test@example.com"}]);
    assert.deepEqual(requests[0].payload.legalConsentOptions.consent.communications.map(item => item.subscriptionTypeId), [3918046194]);
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
      await whitepaper({method: "POST", body: {email: "test@example.com", resource, paper_email_consent: "true"}, headers: {}}, result);
      assert.equal(result.statusCode, 200);
      assert.equal(result.body.pdf, pdf);
      const request = requests.at(-1);
      assert.match(request.url, new RegExp(formId + "$"));
      assert.deepEqual(request.payload.fields, [{name: "email", value: "test@example.com"}, {name: "resource", value: resource}]);
      assert.deepEqual(request.payload.legalConsentOptions.consent.communications.map(item => item.subscriptionTypeId), [3918058120]);
    }
    const optedIn = response();
    await whitepaper({method: "POST", body: {email: "test@example.com", resource: "bids-won-on-evidence", paper_email_consent: "true", signal_opt_in: "true"}, headers: {}}, optedIn);
    assert.deepEqual(requests.at(-1).payload.legalConsentOptions.consent.communications.map(item => item.subscriptionTypeId), [3918058120, 3918046194]);
    const rejected = response();
    await whitepaper({method: "POST", body: {email: "test@example.com", resource: "bad-resource", paper_email_consent: "true"}, headers: {}}, rejected);
    assert.equal(rejected.statusCode, 422);
    assert.equal(requests.length, 3);
  } finally {
    global.fetch = originalFetch;
  }
});

test("paper forms and visible Signal signups are connected", () => {
  const bids = readFileSync(join(root, "resources/bids-won-on-evidence.html"), "utf8");
  const pipeline = readFileSync(join(root, "resources/commercial-system-for-your-pipeline.html"), "utf8");
  for (const html of [bids, pipeline]) {
    assert.match(html, /data-whitepaper-form/);
    assert.match(html, /name="paper_email_consent"[^>]*required/);
    assert.match(html, /name="signal_opt_in"/);
    assert.match(html, /class="signal-signup-form"[^>]*data-community-form/);
  }
  assert.match(readFileSync(join(root, "index.html"), "utf8"), /class="signal-signup-form"[^>]*data-community-form/);
});
