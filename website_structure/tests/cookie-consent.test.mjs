import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const cookies = require("../assets/cookie-consent.js");

function htmlFiles(dir) {
  return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "partials" || entry.name === "tests" ? [] : htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

test("withdrawing consent records the choice, revokes HubSpot, denies GA and clears tracking cookies", () => {
  const jar = [];
  const hsq = [];
  const gtagCalls = [];
  const now = Date.UTC(2026, 9, 19);
  const result = cookies.withdraw({
    hostname: "www.ignisleadership.com",
    now,
    setCookie: (value) => jar.push(value),
    hsq,
    gtag: (...args) => gtagCalls.push(args)
  });

  assert.equal(result.consent, "declined");
  assert.deepEqual(hsq, [["revokeCookieConsent"]]);
  assert.equal(gtagCalls[0][0], "consent");
  assert.equal(gtagCalls[0][1], "update");
  assert.equal(gtagCalls[0][2].analytics_storage, "denied");
  assert.match(jar[0], /^ignis_cookie_consent=declined;/);
  assert.match(jar[0], /Secure/);
  const expires = new Date(jar[0].match(/expires=([^;]+)/)[1]);
  assert.equal(expires.getTime(), now + 180 * 86400000);

  for (const name of ["__hstc", "hubspotutk", "__hssc", "__hssrc", "_ga", "_ga_F5LV9CKKTS"]) {
    assert.ok(jar.some((value) => value.startsWith(`${name}=;`) && !value.includes("domain=")), name);
    assert.ok(jar.some((value) => value.startsWith(`${name}=;`) && value.includes("domain=www.ignisleadership.com")), name);
    assert.ok(jar.some((value) => value.startsWith(`${name}=;`) && value.includes("domain=.ignisleadership.com")), name);
  }
  assert.deepEqual(cookies.TRACKING_COOKIES, ["__hstc", "hubspotutk", "__hssc", "__hssrc", "_ga", "_ga_F5LV9CKKTS"]);
});

test("Reject and Accept share the same fill, and every page can reopen the banner", () => {
  const css = readFileSync(join(root, "assets/capability.css"), "utf8");
  const helper = readFileSync(join(root, "assets/cookie-consent.js"), "utf8");
  const script = readFileSync(join(root, "assets/script.js"), "utf8");
  const capability = readFileSync(join(root, "assets/capability.js"), "utf8");
  assert.match(css, /\.cookie-btn\.accept,\.cookie-btn\.decline\{color:var\(--ink\);background:var\(--paper\);border-color:var\(--paper\)\}/);
  assert.match(helper, /Reject non-essential/);
  assert.match(helper, /id="cookie-accept"/);
  assert.match(script, /Reject non-essential/);
  assert.match(capability, /Reject non-essential/);
  assert.match(helper, /hs-script-loader/);
  assert.match(helper, /__hubSpotTrackingLoaded/);
  assert.match(script, /getElementById\("hs-script-loader"\)/);
  assert.match(capability, /getElementById\("hs-script-loader"\)/);
  assert.match(script, /if \(window\.ignisCookieConsent\) return/);
  assert.match(capability, /if\(window\.ignisCookieConsent\)return/);
  assert.doesNotMatch(script, /function initCalendly\(\)\{\s*loadCalendlyAssets\(\)/);
  assert.doesNotMatch(capability, /if\(contactForms\.length\)loadContactCalendly\(\)/);
  assert.match(capability, /loadContactCalendly\(openContactCalendly\)/);

  const pages = htmlFiles(root);
  assert.ok(pages.length >= 19);
  for (const file of pages) {
    const html = readFileSync(file, "utf8");
    assert.match(html, /cookie-consent\.js/, file);
    assert.match(html, /\/assets\/(?:capability|script)\.js/, file);
    assert.match(html, /data-cookie-settings/, file);
    assert.doesNotMatch(html, /assets\.calendly\.com\/assets\/external\/widget\.js/, file);
  }
});

test("the privacy policy names each cookie and the way to change the choice", () => {
  const privacy = readFileSync(join(root, "privacy.html"), "utf8");
  const section = privacy.slice(privacy.indexOf('id="cookies"'), privacy.indexOf('id="third-parties"'));
  for (const name of ["ignis_cookie_consent", "__hstc", "hubspotutk", "__hssc", "__hssrc", "_ga_F5LV9CKKTS", "__cf_bm"]) {
    assert.match(section, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(section, /180 days/);
  assert.match(section, /6 months/);
  assert.match(section, /30 minutes/);
  assert.match(section, /2 years/);
  assert.match(section, /Session/);
  assert.match(section, /reCAPTCHA/);
  assert.match(section, /data-cookie-settings/);
  assert.match(section, /Cookie settings/);
  assert.match(section, /You can change your mind at any time/);
  assert.doesNotMatch(section, /clearing your browser/);
});
