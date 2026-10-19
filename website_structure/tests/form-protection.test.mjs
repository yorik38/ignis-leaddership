import test, {describe} from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync, readdirSync, statSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const subscribe = require(join(root, "api/subscribe.js"));
const whitepaper = require(join(root, "api/whitepaper.js"));
const formConfig = require(join(root, "api/form-config.js"));
const {isBotGmail, resetProtectionForTests} = require(join(root, "api/_lib/protect.js"));

function response() {
  return {
    statusCode: 0,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(raw) { this.body = JSON.parse(raw); }
  };
}

function started(body = {}) {
  return {form_started_at: Date.now() - 10000, ...body};
}

async function post(handler, body, {headers = {}, fetchImpl} = {}) {
  const original = global.fetch;
  const calls = [];
  const fallbackFetch = async (url, init) => {
    if (String(url).includes("siteverify")) {
      return {ok: true, json: async () => ({success: true}), text: async () => ""};
    }
    if (String(url).includes("/pipeline")) {
      return {ok: true, json: async () => [{result: 1}], text: async () => ""};
    }
    return {ok: true, status: 200, json: async () => ({}), text: async () => ""};
  };
  global.fetch = async (url, init) => {
    calls.push({url: String(url), body: init && init.body, init});
    return (fetchImpl || fallbackFetch)(url, init);
  };
  const res = response();
  try {
    await handler({method: "POST", body, headers}, res);
  } finally {
    global.fetch = original;
  }
  return {res, calls};
}

describe("form protection", {concurrency: 1}, () => {
  test("honeypot, time trap and bot Gmail addresses do not call HubSpot", async () => {
    resetProtectionForTests();
    const honeypot = await post(subscribe, started({email: "ada@example.com", signal_consent: "true", company_website: "https://spam.test"}));
    assert.equal(honeypot.res.statusCode, 200);
    assert.equal(honeypot.res.body.ok, true);
    assert.equal(honeypot.calls.length, 0);

    const missingTime = await post(subscribe, {email: "ada@example.com", signal_consent: "true"});
    assert.equal(missingTime.res.statusCode, 200);
    assert.equal(missingTime.calls.length, 0);

    const tooFast = await post(subscribe, {email: "ada@example.com", signal_consent: "true", form_started_at: Date.now()});
    assert.equal(tooFast.res.statusCode, 200);
    assert.equal(tooFast.calls.length, 0);

    const bot = await post(subscribe, started({email: "j.uv.unavat.a.4.5@gmail.com", signal_consent: "true"}));
    assert.equal(bot.res.statusCode, 200);
    assert.equal(bot.calls.length, 0);

    const genuine = await post(subscribe, started({email: "j.smith@gmail.com", signal_consent: "true"}));
    assert.equal(genuine.res.statusCode, 200);
    assert.equal(genuine.calls.length, 1);
    assert.match(genuine.calls[0].url, /api\.hsforms\.com/);
  });

  test("Gmail bot pattern rejects dotted short segments and keeps real addresses", () => {
    assert.equal(isBotGmail("j.uv.unavat.a.4.5@gmail.com"), true);
    assert.equal(isBotGmail("a.b.c.d.e@gmail.com"), true);
    assert.equal(isBotGmail("J.UV.UNAVAT.A.4.5@GMAIL.COM"), true);
    assert.equal(isBotGmail("j.smith@gmail.com"), false);
    assert.equal(isBotGmail("john.smith@gmail.com"), false);
    assert.equal(isBotGmail("a.b.c.d@gmail.com"), false);
    assert.equal(isBotGmail("jonathan.smith.williams.brown.davis@gmail.com"), false);
    assert.equal(isBotGmail("j.u.v.a.n@outlook.com"), false);
  });

  test("rate limit returns 429 after five submissions from one IP", async () => {
    resetProtectionForTests();
    const headers = {"x-forwarded-for": "203.0.113.20, 10.0.0.1"};
    const bodies = [];
    for (let i = 0; i < 5; i += 1) {
      const result = await post(subscribe, started({email: `person${i}@example.com`, signal_consent: "true"}), {headers});
      assert.equal(result.res.statusCode, 200, `submission ${i + 1}`);
      bodies.push(result);
    }
    const blocked = await post(subscribe, started({email: "person6@example.com", signal_consent: "true"}), {headers});
    assert.equal(blocked.res.statusCode, 429);
    assert.equal(blocked.res.body.ok, false);
    assert.match(blocked.res.body.error, /wait a few minutes/);
    assert.equal(blocked.calls.length, 0);
    const otherIp = await post(subscribe, started({email: "other@example.com", signal_consent: "true"}), {headers: {"x-real-ip": "203.0.113.21"}});
    assert.equal(otherIp.res.statusCode, 200);
  });

  test("Upstash is used when configured and a failure falls back to memory", async () => {
    resetProtectionForTests();
    const previousUrl = process.env.UPSTASH_REDIS_REST_URL;
    const previousToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    try {
      let count = 0;
      const limited = await post(subscribe, started({email: "ada@example.com", signal_consent: "true"}), {
        headers: {"x-forwarded-for": "203.0.113.30"},
        fetchImpl: async (url) => {
          if (String(url).includes("/pipeline")) {
            count += 1;
            return {ok: true, json: async () => [{result: 6}], text: async () => ""};
          }
          throw new Error("HubSpot should not be called");
        }
      });
      assert.equal(limited.res.statusCode, 429);
      assert.equal(count, 1);

      const fallback = await post(subscribe, started({email: "ada@example.com", signal_consent: "true"}), {
        headers: {"x-forwarded-for": "203.0.113.31"},
        fetchImpl: async (url) => {
          if (String(url).includes("/pipeline")) throw new Error("upstash down");
          return {ok: true, status: 200, text: async () => "", json: async () => ({})};
        }
      });
      assert.equal(fallback.res.statusCode, 200);
      assert.equal(fallback.calls.filter((call) => call.url.includes("hsforms")).length, 1);
    } finally {
      if (previousUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
      else process.env.UPSTASH_REDIS_REST_URL = previousUrl;
      if (previousToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
      else process.env.UPSTASH_REDIS_REST_TOKEN = previousToken;
    }
  });

  test("Turnstile is skipped unless both keys are set, then the token is verified", async () => {
    resetProtectionForTests();
    const previousSite = process.env.TURNSTILE_SITE_KEY;
    const previousSecret = process.env.TURNSTILE_SECRET_KEY;
    delete process.env.TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    const signup = (email) => started({email, signal_consent: "true"});
    try {
      const off = await post(subscribe, signup("off@example.com"), {headers: {"x-forwarded-for": "203.0.113.40"}});
      assert.equal(off.res.statusCode, 200);
      assert.equal(off.calls.some((call) => call.url.includes("siteverify")), false);

      process.env.TURNSTILE_SITE_KEY = "site-key";
      const half = await post(subscribe, signup("half@example.com"), {headers: {"x-forwarded-for": "203.0.113.41"}});
      assert.equal(half.res.statusCode, 200);
      assert.equal(half.calls.some((call) => call.url.includes("siteverify")), false);

      process.env.TURNSTILE_SECRET_KEY = "secret";
      const missing = await post(subscribe, signup("missing@example.com"), {headers: {"x-forwarded-for": "203.0.113.42"}});
      assert.equal(missing.res.statusCode, 422);
      assert.match(missing.res.body.error, /security check/);
      assert.equal(missing.calls.length, 0);

      const failed = await post(subscribe, started({email: "failed@example.com", signal_consent: "true", "cf-turnstile-response": "bad"}), {
        headers: {"x-forwarded-for": "203.0.113.43"},
        fetchImpl: async (url) => {
          if (String(url).includes("siteverify")) return {ok: true, json: async () => ({success: false}), text: async () => ""};
          throw new Error("HubSpot should not be called");
        }
      });
      assert.equal(failed.res.statusCode, 422);

      const passed = await post(subscribe, started({email: "passed@example.com", signal_consent: "true", "cf-turnstile-response": "good"}), {
        headers: {"x-forwarded-for": "203.0.113.44"},
        fetchImpl: async (url, init) => {
          if (String(url).includes("siteverify")) {
            assert.match(String(init.body), /secret=secret/);
            assert.match(String(init.body), /response=good/);
            return {ok: true, json: async () => ({success: true}), text: async () => ""};
          }
          return {ok: true, status: 200, text: async () => "", json: async () => ({})};
        }
      });
      assert.equal(passed.res.statusCode, 200);
      assert.equal(passed.calls.filter((call) => String(call.url).includes("hsforms")).length, 1);
    } finally {
      if (previousSite === undefined) delete process.env.TURNSTILE_SITE_KEY;
      else process.env.TURNSTILE_SITE_KEY = previousSite;
      if (previousSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
      else process.env.TURNSTILE_SECRET_KEY = previousSecret;
    }
  });

  test("form config exposes the site key only when both Turnstile keys are set", async () => {
    const previousSite = process.env.TURNSTILE_SITE_KEY;
    const previousSecret = process.env.TURNSTILE_SECRET_KEY;
    const res = response();
    try {
      delete process.env.TURNSTILE_SITE_KEY;
      delete process.env.TURNSTILE_SECRET_KEY;
      await formConfig({method: "GET"}, res);
      assert.equal(res.body.turnstileSiteKey, "");

      process.env.TURNSTILE_SITE_KEY = "public-site-key";
      process.env.TURNSTILE_SECRET_KEY = "secret-key";
      const enabled = response();
      await formConfig({method: "GET"}, enabled);
      assert.equal(enabled.body.turnstileSiteKey, "public-site-key");
      assert.equal(JSON.stringify(enabled.body).includes("secret-key"), false);
    } finally {
      if (previousSite === undefined) delete process.env.TURNSTILE_SITE_KEY;
      else process.env.TURNSTILE_SITE_KEY = previousSite;
      if (previousSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
      else process.env.TURNSTILE_SECRET_KEY = previousSecret;
    }
  });

  test("Signal signup sends company, enquiry topic, source and the subscription date", async () => {
    resetProtectionForTests();
    const result = await post(subscribe, started({
      email: "ada@example.com",
      signal_consent: "true",
      company: "North Sea Power",
      enquiry_topic: "bid_tender",
      firstname: "Ada",
      page_url: "https://www.ignisleadership.com/insights?utm_source=forward"
    }), {headers: {"x-forwarded-for": "203.0.113.60"}});
    assert.equal(result.res.statusCode, 200);
    const fields = Object.fromEntries(JSON.parse(result.calls[0].body).fields.map((field) => [field.name, field.value]));
    assert.equal(fields.company, "North Sea Power");
    assert.equal(fields.enquiry_topic, "bid_tender");
    assert.equal(fields.topic, undefined);
    assert.equal(fields.content_source, "signal-signup");
    assert.equal(fields.signal_source, "forward_referral");
    assert.equal(fields.firstname, "Ada");
    const today = new Date();
    assert.equal(Number(fields.signal_subscribed_date), Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  });

  test("Market Monitor delivers the PDF with and without a HubSpot form id", async () => {
    resetProtectionForTests();
    const previous = process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(" "));
    const download = started({
      email: "ada@example.com",
      resource: "market-monitor-2026-10",
      paper_email_consent: "true",
      firstname: "Ada",
      company: "North Sea Power",
      signal_role: "ceo_md",
      enquiry_topic: "ar8",
      page_url: "https://www.ignisleadership.com/reports/market-monitor-2026-10?utm_source=linkedin"
    });
    try {
      delete process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
      const missing = await post(whitepaper, download, {headers: {"x-forwarded-for": "203.0.113.70"}});
      assert.equal(missing.res.statusCode, 200);
      assert.equal(missing.res.body.pdf, "/assets/downloads/ignis-market-monitor-2026-10.pdf");
      assert.equal(missing.calls.length, 0);
      assert.match(warnings.join("\n"), /HUBSPOT_MARKET_MONITOR_FORM_ID is not set/);

      process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = "monitor-form-id";
      const saved = await post(whitepaper, {...download, email: "saved@example.com"}, {headers: {"x-forwarded-for": "203.0.113.71"}});
      assert.equal(saved.res.statusCode, 200);
      assert.equal(saved.res.body.pdf, "/assets/downloads/ignis-market-monitor-2026-10.pdf");
      assert.equal(saved.calls.length, 1);
      assert.match(saved.calls[0].url, /monitor-form-id$/);
      const fields = Object.fromEntries(JSON.parse(saved.calls[0].body).fields.map((field) => [field.name, field.value]));
      assert.equal(fields.email, "saved@example.com");
      assert.equal(fields.firstname, undefined);
      assert.equal(fields.company, undefined);
      assert.equal(fields.signal_role, undefined);
      assert.equal(fields.enquiry_topic, undefined);
      assert.equal(fields.topic, undefined);
      assert.equal(fields.content_source, "market-monitor-2026-10");
      assert.equal(fields.resource, "market-monitor-2026-10");
      assert.equal(fields.acquisition_source, "linkedin");
      assert.deepEqual(JSON.parse(saved.calls[0].body).legalConsentOptions.consent.communications.map((item) => item.subscriptionTypeId), [3918058120]);
    } finally {
      console.warn = originalWarn;
      if (previous === undefined) delete process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
      else process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = previous;
    }
  });

  test("Market Monitor Signal opt-in submits the Signal form, including when the report form id is unset", async () => {
    resetProtectionForTests();
    const previous = process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
    const originalWarn = console.warn;
    console.warn = () => {};
    const body = started({
      email: "ada@example.com",
      resource: "market-monitor-2026-10",
      paper_email_consent: "true",
      signal_opt_in: "true",
      firstname: "Ada",
      company: "North Sea Power",
      enquiry_topic: "gate2",
      page_url: "https://www.ignisleadership.com/reports/market-monitor-2026-10?utm_source=linkedin"
    });
    try {
      process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = "monitor-form-id";
      const both = await post(whitepaper, body, {headers: {"x-forwarded-for": "203.0.113.80"}});
      assert.equal(both.res.statusCode, 200);
      assert.equal(both.res.body.pdf, "/assets/downloads/ignis-market-monitor-2026-10.pdf");
      assert.equal(both.res.body.newsletterSubscribed, true);
      assert.equal(both.calls.length, 2);
      assert.match(both.calls[0].url, /monitor-form-id$/);
      assert.match(both.calls[1].url, /9ee4b5ce-211f-4be1-a8d1-69809052e8b2$/);
      const reportConsent = JSON.parse(both.calls[0].body).legalConsentOptions.consent.communications.map((item) => item.subscriptionTypeId);
      const signalConsent = JSON.parse(both.calls[1].body).legalConsentOptions.consent.communications.map((item) => item.subscriptionTypeId);
      assert.deepEqual(reportConsent, [3918058120]);
      assert.deepEqual(signalConsent, [3918046194]);
      const signalFields = Object.fromEntries(JSON.parse(both.calls[1].body).fields.map((field) => [field.name, field.value]));
      assert.equal(signalFields.signal_source, "linkedin");
      assert.equal(signalFields.enquiry_topic, undefined);
      assert.equal(signalFields.firstname, undefined);
      assert.equal(signalFields.content_source, "market-monitor-2026-10");
      assert.equal(signalFields.company, undefined);
      assert.match(JSON.parse(both.calls[1].body).legalConsentOptions.consent.communications[0].text, /won't fill your inbox/);
      assert.ok(signalFields.signal_subscribed_date);

      delete process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
      const signalOnly = await post(whitepaper, {...body, email: "signal-only@example.com"}, {headers: {"x-forwarded-for": "203.0.113.81"}});
      assert.equal(signalOnly.res.statusCode, 200);
      assert.equal(signalOnly.res.body.pdf, "/assets/downloads/ignis-market-monitor-2026-10.pdf");
      assert.equal(signalOnly.calls.length, 1);
      assert.match(signalOnly.calls[0].url, /9ee4b5ce-211f-4be1-a8d1-69809052e8b2$/);
    } finally {
      console.warn = originalWarn;
      if (previous === undefined) delete process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
      else process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = previous;
    }
  });

  test("Market Monitor still returns the PDF when HubSpot rejects the extra fields", async () => {
    resetProtectionForTests();
    const previous = process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
    process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = "monitor-form-id";
    try {
      let attempt = 0;
      const result = await post(whitepaper, started({
        email: "ada@example.com",
        resource: "market-monitor-2026-10",
        company: "North Sea Power",
        enquiry_topic: "other"
      }), {
        headers: {"x-forwarded-for": "203.0.113.90"},
        fetchImpl: async (url, init) => {
          attempt += 1;
          const payload = JSON.parse(init.body);
          assert.equal(payload.fields.some((field) => field.name === "company"), false);
          assert.equal(payload.fields.some((field) => field.name === "enquiry_topic"), false);
          if (attempt === 1) {
            assert.equal(payload.fields.some((field) => field.name === "content_source"), true);
            return {ok: false, status: 400, text: async () => "unknown field content_source", json: async () => ({})};
          }
          assert.equal(payload.fields.some((field) => field.name === "content_source"), false);
          return {ok: true, status: 200, text: async () => "", json: async () => ({})};
        }
      });
      assert.equal(result.res.statusCode, 200);
      assert.equal(result.res.body.pdf, "/assets/downloads/ignis-market-monitor-2026-10.pdf");
      assert.equal(attempt, 2);
    } finally {
      if (previous === undefined) delete process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
      else process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = previous;
    }
  });

  test("subscribe, white paper and Market Monitor send hutk only when it is present", async () => {
    resetProtectionForTests();
    const previous = process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
    process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = "monitor-form-id";
    try {
      const withCookie = await post(subscribe, started({
        email: "hutk@example.com",
        signal_consent: "true",
        page_url: "https://www.ignisleadership.com/insights"
      }), {headers: {cookie: "session=1; hubspotutk=visitor-token", "x-forwarded-for": "203.0.113.110"}});
      const subscribed = JSON.parse(withCookie.calls[0].body);
      assert.equal(subscribed.context.hutk, "visitor-token");
      assert.equal(subscribed.context.pageUri, "https://www.ignisleadership.com/insights");
      assert.equal(subscribed.context.pageName, "Signal newsletter signup");

      const missing = await post(subscribe, started({
        email: "no-hutk@example.com",
        signal_consent: "true",
        page_url: "https://www.ignisleadership.com/"
      }), {headers: {"x-forwarded-for": "203.0.113.111"}});
      assert.equal("hutk" in JSON.parse(missing.calls[0].body).context, false);

      const posted = await post(whitepaper, started({
        email: "paper-hutk@example.com",
        resource: "bids-won-on-evidence",
        paper_email_consent: "true",
        hutk: "posted-token",
        page_url: "https://www.ignisleadership.com/resources/bids-won-on-evidence"
      }), {headers: {"x-forwarded-for": "203.0.113.112"}});
      const paper = JSON.parse(posted.calls[0].body);
      assert.equal(paper.context.hutk, "posted-token");
      assert.equal(paper.context.pageUri, "https://www.ignisleadership.com/resources/bids-won-on-evidence");
      assert.equal(paper.context.pageName, "Ignis white paper: bids-won-on-evidence");

      const cookieWins = await post(whitepaper, started({
        email: "both-hutk@example.com",
        resource: "commercial-system-pipeline",
        paper_email_consent: "true",
        hutk: "posted-token"
      }), {headers: {cookie: "hubspotutk=cookie-token", "x-forwarded-for": "203.0.113.113"}});
      assert.equal(JSON.parse(cookieWins.calls[0].body).context.hutk, "cookie-token");

      const monitor = await post(whitepaper, started({
        email: "monitor-hutk@example.com",
        resource: "market-monitor-2026-10",
        paper_email_consent: "true",
        signal_opt_in: "true",
        page_url: "https://www.ignisleadership.com/reports/market-monitor-2026-10"
      }), {headers: {cookie: "hubspotutk=monitor-cookie", "x-forwarded-for": "203.0.113.114"}});
      assert.equal(monitor.res.body.pdf, "/assets/downloads/ignis-market-monitor-2026-10.pdf");
      assert.equal(monitor.calls.length, 2);
      for (const call of monitor.calls) {
        const context = JSON.parse(call.body).context;
        assert.equal(context.hutk, "monitor-cookie");
        assert.equal(context.pageUri, "https://www.ignisleadership.com/reports/market-monitor-2026-10");
        assert.ok(context.pageName);
      }
    } finally {
      if (previous === undefined) delete process.env.HUBSPOT_MARKET_MONITOR_FORM_ID;
      else process.env.HUBSPOT_MARKET_MONITOR_FORM_ID = previous;
    }
  });
});

test("every signup and download form renders the shared protection fields", () => {
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
  const htmlPages = pages.map((path) => [path, readFileSync(path, "utf8")]).filter(([, html]) => html.includes("<form"));
  assert.ok(htmlPages.length >= 10);
  for (const [path, html] of htmlPages) {
    const forms = html.match(/<form\b[\s\S]*?<\/form>/g) || [];
    for (const form of forms) {
      if (!/\/api\/(subscribe|whitepaper|contact)/.test(form)) continue;
      assert.match(form, /name="company_website"/, path);
      assert.match(form, /name="form_started_at"/, path);
      assert.match(form, /data-turnstile/, path);
      assert.match(form, /autocomplete="off"/, path);
      assert.match(form, /tabindex="-1"/, path);
      assert.match(form, /aria-hidden="true"/, path);
    }
  }
  const monitor = readFileSync(join(root, "reports/market-monitor-2026-10.html"), "utf8");
  const download = monitor.slice(monitor.indexOf('id="hubspot-whitepaper-form"'), monitor.indexOf('id="whitepaper-download"'));
  assert.match(download, /data-edition="market-monitor-2026-10"/);
  assert.match(download, /data-pdf="\/assets\/downloads\/ignis-market-monitor-2026-10\.pdf"/);
  assert.match(download, /name="resource" value="market-monitor-2026-10"/);
  assert.match(download, /name="content_source" value="market-monitor-2026-10"/);
  assert.doesNotMatch(download, /name="signal_role"|name="enquiry_topic"|name="company"|name="firstname"|name="paper_email_consent"/);
  assert.doesNotMatch(download, /name="topic"|bid_and_tender|gate2_grid/);
  assert.match(download, /Also email me Signal, the weekly newsletter, and occasional marketing updates\. We won't fill your inbox\./);
  assert.match(download, /name="signal_opt_in"/);
  assert.doesNotMatch(download, /name="signal_opt_in"[^>]*checked/);
  assert.doesNotMatch(download, /HubSpot form placeholder|portalId:\s*"TODO"/);
  assert.match(readFileSync(join(root, "FORMS_SETUP.md"), "utf8"), /HUBSPOT_MARKET_MONITOR_FORM_ID/);
  assert.match(readFileSync(join(root, "FORMS_SETUP.md"), "utf8"), /TURNSTILE_SITE_KEY/);
  assert.match(readFileSync(join(root, "FORMS_SETUP.md"), "utf8"), /UPSTASH_REDIS_REST_URL/);
});
