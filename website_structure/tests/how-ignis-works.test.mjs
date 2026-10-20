import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root = new URL("../", import.meta.url);
const page = readFileSync(new URL("services.html", root), "utf8");
const home = readFileSync(new URL("index.html", root), "utf8");
const sitemap = readFileSync(new URL("sitemap.xml", root), "utf8");
const vercel = JSON.parse(readFileSync(new URL("vercel.json", root), "utf8"));

test("the Services page states the two offers without inventing proof", () => {
  assert.match(page, /rel="canonical" href="https:\/\/www\.ignisleadership\.com\/services"/);
  assert.match(page, /<p class="section-label">Services<\/p><h1>We move offshore wind and onshore renewables projects to financial close<\/h1>/);
  assert.match(page, /href="#offshore">Offshore wind<\/a>/);
  assert.match(page, /href="#onshore">Onshore renewables<\/a>/);
  assert.match(page, /<p class="section-label">Onshore renewables<\/p>/);
  assert.match(page, /<title>We move offshore wind and onshore renewables projects to financial close \| Ignis<\/title>/);
  assert.match(page, /id="offshore"/);
  assert.match(page, /id="onshore"/);
  assert.match(page, /From seabed to financial close\./);
  assert.match(page, /We help offshore wind developers across the end-to-end lifecycle: put the strategy in place \(bid strategy\), then deliver and execute\./);
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
  assert.match(page, /GB onshore wind, solar and BESS developers becoming IPPs/);
  assert.match(page, /AI bid and tender\/procurement managers do the drafting, comparing and tracking, and the team makes the calls/);
  assert.match(page, /id="how-we-work-title">How we work<\/h2>/);
  assert.match(page, /Queues, CfD results and tender rules, so we come to the first meeting with a view\./);
  assert.match(page, /2–3 weeks at a fixed fee, on one project's data room shared securely/);
  assert.match(page, /Bid &amp; Tender Desk<\/h3><p>Then your own system, which you keep and run in-house\./);
  assert.match(page, /A named person still approves price, risk and commitments\./);
  assert.match(page, /Fund-backed GB developers of onshore wind, solar, BESS and long-duration storage/);
  assert.match(page, /Drafting, comparing and tracking across the last mile: grid offer and consents, route to market \(CfD\/PPA\), and EPC and supply tenders\./);
  assert.match(page, /Public queues and CfD results first\. Then a 2–3 week sprint on one project's data room, shared securely/);
  assert.match(page, /id="close-call-title">Got a project heading for financial close\?/);
  assert.doesNotMatch(page, /Five steps, starting on live work|commercial-gates-comparison|class="faq-section"/);
  assert.doesNotMatch(page, /FORGE|Forge/);
  const layers = [
    ["Process", "How each project moves from grid offer to close."],
    ["Context", "Your past projects, plus market, policy and commercial knowledge."],
    ["Data", "One trusted set of numbers across the pipeline."],
    ["Governance", "Approvals, controls and a full audit trail."],
    ["Workflows", "Repeatable commercial work, run by agents."],
  ];
  for (const [layer, description] of layers) {
    assert.match(home, new RegExp(`<span>${layer}</span><p>${description}</p>`));
  }
});

test("retired offer pages redirect and leave the sitemap", () => {
  for (const source of ["/commercial-ai-adoption", "/commercial-transformation", "/commercial-ai-readiness"]) {
    assert.ok(vercel.redirects.some(route => route.source === source && route.destination === "/services" && route.permanent));
  }
  assert.ok(vercel.redirects.some(route => route.source === "/how-ignis-works" && route.destination === "/services" && route.permanent));
  assert.equal(vercel.redirects.some(route => route.source === "/services"), false);
  assert.match(sitemap, /<loc>https:\/\/www\.ignisleadership\.com\/services<\/loc>/);
  assert.doesNotMatch(sitemap, /how-ignis-works/);
  assert.doesNotMatch(sitemap, /commercial-ai-adoption|commercial-transformation|commercial-ai-readiness/);
});

test("the homepage states one offer, the audiences, and a quiet demo slot", () => {
  const gates = home.indexOf('id="commercial-gates"');
  const who = home.indexOf('id="who-ignis"');
  const routes = home.indexOf('id="routes"');
  const founder = home.indexOf("founder-overview");
  assert.ok(gates >= 0 && who > gates && routes > who && founder > routes);
  assert.match(home, /Who Ignis works with/);
  assert.match(home, /href="\/services#onshore"/);
  assert.match(home, /href="\/services#offshore"/);
  assert.match(home, /One governed system, from grid offer to close\./);
  assert.match(home, /Product demo: add a section here when a look at the work is ready/);
  assert.doesNotMatch(home, /id="product-demo"|Demo coming soon|A look at the work, when the demo is ready/);
  assert.match(home, /Testimonials: add a quote band here/);
  assert.doesNotMatch(home, /href="\/commercial-ai-adoption"|href="\/commercial-transformation"/);
  assert.doesNotMatch(home, /FORGE|Forge/);
  assert.match(home, /<h1><span class="hero-line">Close <span class="gradient-word">more<\/span><\/span> <span class="hero-line"><span class="gradient-word">projects<\/span>, faster\.<\/span><\/h1>/);
  assert.match(home, /<p class="hero-support">Ignis helps energy developers win the right to develop and move projects to financial close, with fewer delays, fewer surprises and stronger terms\.<\/p>/);
  assert.doesNotMatch(home, /move their pipeline from last-mile development to financial close/);
  assert.match(home, /For fund-backed developers who need to move more projects to financial close, faster\./);
  assert.doesNotMatch(home, /Fund-backed developers carrying a live project from the next gate to financial close/);
});

test("each audience card is one link with a motion-safe hover state", () => {
  const css = readFileSync(new URL("assets/capability.css", root), "utf8");
  const section = home.slice(home.indexOf('id="who-ignis"'), home.indexOf("founder-overview"));
  const cards = [...section.matchAll(/<a class="who-ignis-card" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.deepEqual(cards.map((card) => card[1]), ["/services#onshore", "/services#offshore"]);
  for (const [, , inner] of cards) {
    assert.equal(inner.match(/<a\b/g), null);
    assert.match(inner, /class="who-ignis-more"/);
    assert.match(inner, /Learn more <span class="who-ignis-more-arrow" aria-hidden="true">↗<\/span>/);
  }
  assert.match(css, /\.who-ignis-media\{[^}]*overflow:hidden/);
  assert.match(css, /\.who-ignis-card:hover,\.who-ignis-card:focus-visible\{transform:translateY\(-4px\);box-shadow:/);
  assert.match(css, /\.who-ignis-card:hover img,\.who-ignis-card:focus-visible img\{transform:scale\(1\.03\)\}/);
  assert.match(css, /\.who-ignis-card:hover \.who-ignis-more-arrow,\.who-ignis-card:focus-visible \.who-ignis-more-arrow\{transform:translate\(3px,-3px\)\}/);
  assert.match(css, /\.who-ignis-card:focus-visible\{outline:3px solid #08756d;outline-offset:4px\}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\{[\s\S]*?\.who-ignis-card:hover,\.who-ignis-card:focus-visible[\s\S]*?transform:none/);
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

test("audience FAQs are answer-first and match their FAQPage data", () => {
  const homeFaq = visibleFaq(home);
  assert.equal(visibleFaq(page).length, 0);
  assert.ok(homeFaq.length >= 6 && homeFaq.length <= 8);
  assert.deepEqual(jsonFaq(home), homeFaq);
  assert.equal(jsonFaq(page), null);
  for (const [, answer] of homeFaq) {
    assert.doesNotMatch(answer, /FORGE|Forge/);
    assert.match(answer, /Ignis/);
    const sentences = answer.split(/(?<=[.!?])\s+/).filter(Boolean);
    assert.ok(sentences.length >= 2 && sentences.length <= 4, answer);
  }
  for (const path of htmlFiles(fileURLToPath(root))) {
    const html = readFileSync(path, "utf8");
    if (!html.includes('id="wp-signup-title"')) continue;
    assert.ok(html.includes("Yes, I want to receive Signal, the weekly newsletter, the monthly report and occasional marketing updates."), path);
    assert.doesNotMatch(html, /Signal: practical notes on moving energy projects/);
    assert.doesNotMatch(html, /New white papers on taking energy projects/);
  }
  assert.match(home, /Got a project heading for financial close\?/);
  assert.match(home, /Let’s map where your commercial flow slows down, and what Ignis would change\./);
  assert.match(home, /class="button button-teal" href="\/contact">Book a call<\/a>/);
  assert.doesNotMatch(home, /Turn AI ambition into|commercial advantage/);
});
