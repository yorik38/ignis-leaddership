import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root = new URL("../", import.meta.url);
const page = readFileSync(new URL("services.html", root), "utf8");
const home = readFileSync(new URL("index.html", root), "utf8");
const capability = readFileSync(new URL("assets/capability.css", root), "utf8");
const servicesCss = readFileSync(new URL("assets/services.css", root), "utf8");
const sitemap = readFileSync(new URL("sitemap.xml", root), "utf8");
const vercel = JSON.parse(readFileSync(new URL("vercel.json", root), "utf8"));

test("the Services page states the two offers without inventing proof", () => {
  assert.match(page, /rel="canonical" href="https:\/\/www\.ignisleadership\.com\/services"/);
  assert.match(page, /<div class="page-hero-copy"><h1>Ignis moves offshore wind and onshore renewables projects to financial close<\/h1><p class="hero-support services-hero-support">Agents will do more of the work every month\. We help you build the system behind them: your process, decisions and know-how, held in one place you own\.<\/p>/);
  assert.match(page, /capability\.css\?v=219/);
  assert.match(page, /services\.css\?v=9/);
  assert.match(capability, /\.hero h1,\.services-hero h1\{[^}]*font-size:clamp\(3\.2rem,5\.15vw,5\.8rem\)/);
  assert.match(capability, /\.hero-support,\.services-hero \.hero-support\{[^}]*font-size:clamp\(1\.05rem,1\.6vw,1\.35rem\)/);
  assert.doesNotMatch(servicesCss, /\.services-hero-support\{[^}]*font-size/);
  assert.doesNotMatch(servicesCss, /\.page-hero h1\{[^}]*font-size/);
  assert.doesNotMatch(page, /<p class="section-label">Services<\/p>/);
  assert.match(page, /href="#offshore">Offshore wind<\/a>/);
  assert.match(page, /href="#onshore">Onshore renewables<\/a>/);
  assert.match(page, /<p class="section-label">Onshore renewables<\/p>/);
  assert.match(page, /<title>Ignis moves offshore wind and onshore renewables projects to financial close \| Ignis<\/title>/);
  assert.match(page, /<meta name="description" content="Ignis moves offshore wind and onshore renewables projects to financial close\.">/);
  assert.match(page, /id="offshore"/);
  assert.match(page, /id="onshore"/);
  assert.match(page, /From seabed to financial close\./);
  assert.match(page, /One system for the whole route to market\. It keeps every milestone and consent workstream aligned, builds and reuses your CfD and seabed leasing bids, shapes your procurement strategy and runs the supply chain packages through to award, so you reach financial close faster and on stronger terms\./);
  assert.match(page, /One system across your whole pipeline\. It keeps Gate 2 evidence, land, planning and grid aligned across many projects, helps you bid into CfD and PPA routes to market, and shapes and tenders your EPC and equipment packages, so more projects reach build sooner\./);
  assert.match(page, /Secure the seabed/);
  assert.match(page, /Leasing rounds and tenders, for example France AO10\./);
  assert.match(page, /Build the procurement strategy and go out to market: supply chain and EPC tenders\./);
  assert.match(page, /Secure the route to market \(CfD\/offtake\), and on to financial close\./);
  assert.match(page, /Offshore has big gaps between stages, but it's the same process\./);
  assert.match(page, /Experienced offshore development leadership, with a layer of AI agentic workflows behind it\./);
  assert.match(page, /Consulting today, built on our own AI system, which is becoming a product\./);
  assert.equal((page.match(/class="service-flow"/g) || []).length, 2);
  assert.doesNotMatch(page, /class="service-rows"|class="service-card"/);
  assert.match(page, /Same team, more projects to close\./);
  assert.match(page, /AI bid and tender\/procurement managers do the drafting, comparing and tracking, and the team makes the calls/);
  assert.doesNotMatch(page, /id="how-we-work"|How we work|Agents draft, compare and track/);
  assert.doesNotMatch(page, /A named person still approves price, risk and commitments/);
  assert.match(page, /Drafting, comparing and tracking across the last mile: grid offer and consents, route to market \(CfD\/PPA\), and EPC and supply tenders\./);
  assert.match(page, /<p class="service-method-label">How<\/p>/);
  assert.match(page, /Public queues and CfD results first\. Then a 2 to 3 week sprint on one project's data room, shared securely/);
  assert.match(page, /Need a trusted adviser on your next big move\?/);
  assert.doesNotMatch(page, /Five steps, starting on live work|commercial-gates-comparison|class="faq-section"/);
  assert.doesNotMatch(page, /FORGE|Forge/);
  // /services now 301s to /work-with-me. The file stays in place, out of the index.
  assert.match(page, /<meta name="robots" content="noindex, follow">/);
});

test("retired offer pages redirect and leave the sitemap", () => {
  for (const source of ["/commercial-ai-adoption", "/commercial-transformation", "/commercial-ai-readiness", "/how-ignis-works", "/discovery"]) {
    assert.ok(vercel.redirects.some(route => route.source === source && route.destination === "/work-with-me" && route.permanent), source);
  }
  for (const source of ["/services", "/services.html", "/bid", "/tender", "/case-study"]) {
    assert.ok(vercel.redirects.some(route => route.source === source && route.destination === "/work-with-me" && route.permanent), source);
  }
  assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.ignisleadership\.com\/(services|bid|tender|case-study)<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/www\.ignisleadership\.com\/work-with-me<\/loc>/);
  assert.doesNotMatch(sitemap, /how-ignis-works/);
  assert.doesNotMatch(sitemap, /commercial-ai-adoption|commercial-transformation|commercial-ai-readiness/);
});

test("the homepage no longer carries the advisory audiences or service links", () => {
  assert.doesNotMatch(home, /id="who-ignis"|id="commercial-gates"|class="who-ignis-card"/);
  assert.doesNotMatch(home, /href="\/services|href="\/commercial-ai-adoption"|href="\/commercial-transformation"/);
  assert.doesNotMatch(home, /FORGE|Forge/);
});

function htmlFiles(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

function visibleFaq(html) {
  const section = html.match(/<section class="faq-section"[\s\S]*?<\/section>/)?.[0];
  if (!section) return [];
  return [...section.matchAll(/<summary>([^<]+)<\/summary><div class="faq-answer"><p>([^<]*)<\/p><\/div><\/details>/g)].map((match) => [match[1], match[2]]);
}

function jsonFaq(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const [, json] of scripts) {
    const data = JSON.parse(json);
    const faq = (data["@graph"] || [data]).find((node) => node["@type"] === "FAQPage");
    if (!faq) continue;
    return faq.mainEntity.map((question) => [question.name, question.acceptedAnswer.text]);
  }
  return null;
}

test("the homepage FAQ is retired and every signup keeps the stored consent line", () => {
  assert.deepEqual(visibleFaq(home), []);
  assert.equal(jsonFaq(home), null);
  assert.equal(visibleFaq(page).length, 0);
  assert.equal(jsonFaq(page), null);
  for (const path of htmlFiles(fileURLToPath(root))) {
    const html = readFileSync(path, "utf8");
    if (!html.includes('id="wp-signup-title"') && !html.includes('id="signal-inbox-title"')) continue;
    assert.ok(html.includes("By signing up, you agree to receive Signal via Substack and occasional emails from Ignis Leadership. Unsubscribe at any time."), path);
    assert.doesNotMatch(html, /Signal: practical notes on moving energy projects/);
    assert.doesNotMatch(html, /New white papers on taking energy projects/);
  }
  assert.match(home, /Need a trusted adviser on your next big move\?/);
  assert.match(home, /class="button button-teal" href="\/contact">Talk it through<\/a>/);
  assert.match(home, /id="wp-signup-title" class="signal-card-title"><span class="signal-wordmark">Connecting Energy<span class="signal-mark">\.<\/span><\/span><span class="signal-card-follow">Free on Substack<\/span><\/h2>/);
  assert.doesNotMatch(home, /Turn AI ambition into|commercial advantage/);
});
