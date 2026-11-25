import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {existsSync, readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFileSync(join(root, file), "utf8");
const home = read("index.html");
const wwm = read("work-with-me.html");
const vercel = JSON.parse(read("vercel.json"));
const guest = require("../api/guest.js");
const feed = require("../api/substack-feed.js");
const {resetProtectionForTests} = require("../api/_lib/protect.js");

function response() {
  return {statusCode: 200, headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(value) { this.body = JSON.parse(value); }};
}

function htmlFiles(dir) {
  return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "partials" ? [] : htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

function visibleText(html) {
  return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
}

test("the homepage leads with Connecting Energy and the podcast", () => {
  assert.match(home, /<title>Connecting Energy \| Yorik Tisseau<\/title>/);
  assert.match(home, /<link rel="canonical" href="https:\/\/www\.ignisleadership\.com\/">/);
  assert.match(home, /connecting-energy-logo-640\.png" alt="Connecting Energy"/);
  assert.match(home, /connecting-energy\.css\?v=1/);
  assert.match(home, /connecting-energy\.js\?v=1/);
  for (const image of ["connecting-energy-logo-640.png", "connecting-energy-logo-640.webp", "connecting-energy-podcast-cover-600.jpg", "connecting-energy-podcast-cover-600.webp", "og-connecting-energy-v1.png", "yorik-portrait-480.jpg", "yorik-portrait-480.webp"]) {
    assert.ok(existsSync(join(root, "assets/img", image)), image);
  }
  const order = ['id="podcast"', 'id="episodes"', 'id="guest"', 'id="latest"', 'id="about-yorik"', 'id="close-call-title"', 'id="subscribe"', '<footer class="site-footer">'].map((marker) => home.indexOf(marker));
  order.forEach((at, index) => assert.ok(at > (index ? order[index - 1] : 0), `section order at ${index}`));
  assert.match(home, /generation, grid and demand, and the people who join them up/);
  assert.match(home, /The energy transition is a technical story\. It's a human one too\./);
  const ld = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const types = ld["@graph"].map((node) => node["@type"]);
  for (const type of ["WebSite", "PodcastSeries", "Person", "Organization"]) assert.ok(types.includes(type), type);
});

test("episodes and listening links stay as coming soon until episode one", () => {
  const episodes = home.slice(home.indexOf('id="episodes"'), home.indexOf('id="guest"'));
  assert.match(episodes, /First episodes coming soon\./);
  assert.equal((episodes.match(/class="ce-episode-slot"/g) || []).length, 3);
  const listen = episodes.match(/<ul class="ce-listen"[\s\S]*?<\/ul>/)[0];
  assert.doesNotMatch(listen, /<a\b/);
  assert.equal((listen.match(/Coming soon/g) || []).length, 3);
  assert.match(episodes, /href="#subscribe"/);
});

test("the guest form asks for the six agreed fields and posts to the site API", () => {
  const form = home.match(/<form class="ce-guest-form"[\s\S]*?<\/form>/)[0];
  assert.match(form, /action="\/api\/guest"/);
  assert.match(form, /data-guest-form/);
  for (const name of ["name", "email", "organisation", "role", "topic", "linkedin"]) assert.match(form, new RegExp(`name="${name}"`), name);
  assert.match(form, /name="company_website"/);
  assert.match(form, /name="form_started_at"/);
  assert.match(form, /data-turnstile/);
  assert.match(form, /href="\/privacy"/);
  assert.match(read("assets/connecting-energy.js"), /mailto:yorik@ignisleadership\.com/);
});

test("latest articles come from the Substack feed with a static fallback", () => {
  const list = home.match(/<ul class="ce-posts" data-substack-feed[\s\S]*?<\/ul>/)[0];
  const links = [...list.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(links.length, 3);
  for (const link of links) assert.match(link, /^https:\/\/connectingenergy\.substack\.com\/p\//);
  assert.doesNotMatch(list, /urnliactivity/);
  assert.ok(vercel.functions["api/substack-feed.js"]);
  assert.ok(vercel.functions["api/guest.js"]);
});

test("the feed parser keeps long reads, drops LinkedIn notes and resizes images", () => {
  const long = "word ".repeat(1200);
  const xml = `<rss><channel>
<item><title><![CDATA[A long read]]></title><description><![CDATA[Summary &amp; more]]></description><link>https://connectingenergy.substack.com/p/a-long-read</link><pubDate>Tue, 24 Nov 2026 18:01:50 GMT</pubDate><enclosure url="https://substack-post-media.s3.amazonaws.com/public/images/a.png" type="image/png"/><content:encoded><![CDATA[<p>${long}</p>]]></content:encoded></item>
<item><title>Note</title><link>https://connectingenergy.substack.com/p/urnliactivity123</link><pubDate>Mon, 23 Nov 2026 09:00:00 GMT</pubDate><content:encoded><![CDATA[<p>${long}</p>]]></content:encoded></item>
<item><title>Short</title><link>https://connectingenergy.substack.com/p/short</link><pubDate>Mon, 23 Nov 2026 09:00:00 GMT</pubDate><content:encoded><![CDATA[<p>a few words</p>]]></content:encoded></item>
<item><title>Elsewhere</title><link>https://example.com/p/elsewhere</link><content:encoded><![CDATA[<p>${long}</p>]]></content:encoded></item>
</channel></rss>`;
  const items = feed.parseFeed(xml);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "A long read");
  assert.equal(items[0].summary, "Summary & more");
  assert.equal(items[0].date, "2026-11-24T18:01:50.000Z");
  assert.match(items[0].image, /^https:\/\/substackcdn\.com\/image\/fetch\/w_720,/);
});

test("the feed endpoint caches at the edge and fails soft", async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async () => ({ok: true, text: async () => "<rss><channel></channel></rss>"});
    const ok = response();
    await feed({method: "GET", headers: {}}, ok);
    assert.equal(ok.statusCode, 200);
    assert.match(ok.headers["Cache-Control"], /s-maxage=3600/);
    global.fetch = async () => { throw new Error("down"); };
    const failed = response();
    await feed({method: "GET", headers: {}}, failed);
    assert.equal(failed.statusCode, 502);
    assert.deepEqual(failed.body.items, []);
  } finally {
    global.fetch = originalFetch;
  }
});

test("guest applications go to the HubSpot guest form with every answer kept", async () => {
  const originalFetch = global.fetch;
  const originalForm = process.env.HUBSPOT_PODCAST_GUEST_FORM_ID;
  const requests = [];
  global.fetch = async (url, init) => { requests.push({url, payload: JSON.parse(init.body)}); return {ok: true}; };
  resetProtectionForTests();
  const body = {name: "Sam Example", email: "sam@example.com", organisation: "Example Grid", role: "Head of connections", topic: "Why connection reform matters for storage", linkedin: "linkedin.com/in/sam-example", form_started_at: Date.now() - 10000};
  try {
    delete process.env.HUBSPOT_PODCAST_GUEST_FORM_ID;
    const off = response();
    await guest({method: "POST", body, headers: {"x-forwarded-for": "10.0.0.1"}}, off);
    assert.equal(off.statusCode, 503);
    assert.equal(off.body.error, "not_configured");
    assert.equal(requests.length, 0);

    process.env.HUBSPOT_PODCAST_GUEST_FORM_ID = "00000000-0000-0000-0000-000000000000";
    const bad = response();
    await guest({method: "POST", body: {...body, linkedin: "https://example.com/me"}, headers: {"x-forwarded-for": "10.0.0.2"}}, bad);
    assert.equal(bad.statusCode, 422);
    const missing = response();
    await guest({method: "POST", body: {...body, role: ""}, headers: {"x-forwarded-for": "10.0.0.3"}}, missing);
    assert.equal(missing.statusCode, 422);

    const ok = response();
    await guest({method: "POST", body, headers: {"x-forwarded-for": "10.0.0.4", cookie: "hubspotutk=abc123"}}, ok);
    assert.equal(ok.statusCode, 200);
    assert.equal(requests.length, 1);
    assert.match(requests[0].url, /\/149324702\/00000000-0000-0000-0000-000000000000$/);
    const fields = Object.fromEntries(requests[0].payload.fields.map((field) => [field.name, field.value]));
    assert.equal(fields.email, "sam@example.com");
    assert.equal(fields.firstname, "Sam");
    assert.equal(fields.lastname, "Example");
    assert.equal(fields.company, "Example Grid");
    assert.equal(fields.jobtitle, "Head of connections");
    assert.equal(fields.hs_linkedin_url, "https://linkedin.com/in/sam-example");
    assert.match(fields.message, /^Connecting Energy podcast: guest application/);
    assert.match(fields.message, /Why connection reform matters for storage/);
    assert.equal(fields.content_source, undefined, "only sent once the HubSpot option exists");
    assert.equal(requests[0].payload.context.hutk, "abc123");
    assert.equal(requests[0].payload.legalConsentOptions.consent.consentToProcess, true);

    const honeypot = response();
    await guest({method: "POST", body: {...body, company_website: "x"}, headers: {"x-forwarded-for": "10.0.0.5"}}, honeypot);
    assert.equal(honeypot.statusCode, 200);
    assert.equal(requests.length, 1);
  } finally {
    global.fetch = originalFetch;
    if (originalForm === undefined) delete process.env.HUBSPOT_PODCAST_GUEST_FORM_ID;
    else process.env.HUBSPOT_PODCAST_GUEST_FORM_ID = originalForm;
  }
});

test("Work with me describes the advisory work and ends with Get in touch", () => {
  assert.match(wwm, /<title>Work with me \| Yorik Tisseau, Ignis Leadership<\/title>/);
  assert.match(wwm, /<link rel="canonical" href="https:\/\/www\.ignisleadership\.com\/work-with-me">/);
  for (const area of ["Market intelligence", "Early-stage development and bids", "Route to market", "Procurement", "Joining it up"]) {
    assert.match(wwm, new RegExp(`<h3>${area}</h3>`), area);
  }
  assert.match(wwm, /AI agents are changing what a small commercial team can take on\./);
  assert.match(wwm, /class="button button-teal" href="\/contact">Get in touch<\/a>/);
  assert.match(read("sitemap.xml"), /<loc>https:\/\/www\.ignisleadership\.com\/work-with-me<\/loc>/);
});

test("new pages follow the house style rules", () => {
  for (const [name, html] of [["index.html", home], ["work-with-me.html", wwm]]) {
    const text = visibleText(html);
    assert.doesNotMatch(html, /[\u2013\u2014]/, `${name} has an en or em dash`);
    assert.doesNotMatch(text, /\bIPPs?\b|book a call|FORGE|Carlos|Dajin/i, name);
    assert.doesNotMatch(text, /\bunlock|\bnavigat(e|es|ing)\b|landscape|seamless|leverage/i, name);
    assert.match(html, /<body class="ce-page[^"]*" data-header="light">/);
  }
});

test("navigation drops services and reports everywhere and keeps Insights", () => {
  const nav = read("partials/site-header.html").match(/<nav class="overlay-nav"[\s\S]*?<\/nav>/)[0];
  assert.equal(nav, '<nav class="overlay-nav" aria-label="Main navigation"><a href="/#podcast">Podcast</a><a href="/#latest">Connecting Energy</a><a href="/insights">Insights</a><a href="/work-with-me">Work with me</a><a href="/about">About</a><a href="/contact">Get in touch</a><a href="/#subscribe">Subscribe</a></nav>');
  let count = 0;
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, "utf8");
    const rendered = html.match(/<nav class="overlay-nav"[\s\S]*?<\/nav>/)?.[0];
    if (!rendered) continue;
    count++;
    assert.equal(rendered, nav, file);
  }
  assert.ok(count >= 20);
});

test("retired pages 301 before the .html catch-all and leave the index", () => {
  const redirects = vercel.redirects;
  const at = (source) => redirects.findIndex((rule) => rule.source === source);
  const catchAll = at("/:path*.html");
  const expected = {
    "/services": "/work-with-me", "/services.html": "/work-with-me",
    "/bid": "/work-with-me", "/bid.html": "/work-with-me",
    "/tender": "/work-with-me", "/tender.html": "/work-with-me",
    "/case-study": "/work-with-me", "/case-study.html": "/work-with-me",
    "/reports/market-monitor-2026-10": "/#latest", "/reports/market-monitor-2026-10.html": "/#latest",
    "/courses": "/", "/outcomes/:path*": "/"
  };
  for (const [source, destination] of Object.entries(expected)) {
    const index = at(source);
    assert.ok(index !== -1, source);
    assert.equal(redirects[index].destination, destination, source);
    assert.equal(redirects[index].permanent, true, source);
    assert.ok(index < catchAll, `${source} must come before the catch-all`);
  }
  assert.equal(at("/insights"), -1, "Insights stays as it is");
  assert.ok(!redirects.some((rule) => rule.destination === "/services" || rule.destination === "/case-study"), "no redirect chains through retired pages");
  for (const file of ["services.html", "bid.html", "tender.html", "case-study.html", "reports/market-monitor-2026-10.html"]) {
    assert.match(read(file), /<meta name="robots" content="noindex, follow">/, file);
  }
});
