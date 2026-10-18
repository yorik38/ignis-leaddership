import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root = new URL("../", import.meta.url);
const page = readFileSync(new URL("how-ignis-works.html", root), "utf8");
const home = readFileSync(new URL("index.html", root), "utf8");
const sitemap = readFileSync(new URL("sitemap.xml", root), "utf8");
const vercel = JSON.parse(readFileSync(new URL("vercel.json", root), "utf8"));

test("the How Ignis works page states the single offer without naming a product", () => {
  assert.match(page, /rel="canonical" href="https:\/\/www\.ignisleadership\.com\/how-ignis-works"/);
  assert.match(page, /id="onshore"/);
  assert.match(page, /id="offshore"/);
  assert.match(page, /solar, onshore wind, battery storage and long-duration storage/i);
  assert.match(page, /fixed and floating/i);
  const layers = [
    ["Process", "How each project moves from grid offer to close."],
    ["Context", "Your past projects, plus market, policy and commercial knowledge."],
    ["Data", "One trusted set of numbers across the pipeline."],
    ["Governance", "Approvals, controls and a full audit trail."],
    ["Workflows", "Repeatable commercial work, run by agents."],
  ];
  for (const [layer, description] of layers) {
    assert.match(page, new RegExp(`<h3>${layer}</h3><p>${description}</p>`));
    assert.match(home, new RegExp(`<span>${layer}</span><p>${description}</p>`));
  }
  assert.match(page, /Five steps, starting on live work\./);
  for (const step of ["Gap review", "Map", "Design", "Pilot", "Embed and improve"]) {
    assert.match(page, new RegExp(`<h3>${step}</h3>`));
  }
  assert.match(page, /The Sprint covers gap review, mapping and design\. Pilot and embedding follow\./);
  assert.doesNotMatch(page, /Map the opportunity|Design the model/);
  assert.match(page, /commercial-gates-comparison-v2\.png/);
  assert.match(page, /class="gates-lane-labels"/);
  assert.match(page, /"@type":"FAQPage"/);
  assert.doesNotMatch(page, /FORGE|Forge/);
});

test("retired offer pages redirect and leave the sitemap", () => {
  for (const source of ["/commercial-ai-adoption", "/commercial-transformation", "/commercial-ai-readiness"]) {
    assert.ok(vercel.redirects.some(route => route.source === source && route.destination === "/how-ignis-works" && route.permanent));
  }
  assert.match(sitemap, /<loc>https:\/\/www\.ignisleadership\.com\/how-ignis-works<\/loc>/);
  assert.doesNotMatch(sitemap, /commercial-ai-adoption|commercial-transformation|commercial-ai-readiness/);
});

test("the homepage states one offer, the audiences, and a quiet demo slot", () => {
  const gates = home.indexOf('id="commercial-gates"');
  const who = home.indexOf('id="who-ignis"');
  const routes = home.indexOf('id="routes"');
  const founder = home.indexOf("founder-overview");
  assert.ok(gates >= 0 && who > gates && routes > who && founder > routes);
  assert.match(home, /Who Ignis works with/);
  assert.match(home, /href="\/how-ignis-works#onshore"/);
  assert.match(home, /href="\/how-ignis-works#offshore"/);
  assert.match(home, /One governed system, from grid offer to close\./);
  assert.match(home, /Product demo: add a section here when a look at the work is ready/);
  assert.doesNotMatch(home, /id="product-demo"|Demo coming soon|A look at the work, when the demo is ready/);
  assert.match(home, /Testimonials: add a quote band here/);
  assert.doesNotMatch(home, /href="\/commercial-ai-adoption"|href="\/commercial-transformation"/);
  assert.doesNotMatch(home, /FORGE|Forge/);
  assert.match(home, /For fund-backed developers who need to move more projects to financial close, faster\./);
  assert.doesNotMatch(home, /Fund-backed developers carrying a live project from the next gate to financial close/);
});

test("each audience card is one link with a motion-safe hover state", () => {
  const css = readFileSync(new URL("assets/capability.css", root), "utf8");
  const section = home.slice(home.indexOf('id="who-ignis"'), home.indexOf("founder-overview"));
  const cards = [...section.matchAll(/<a class="who-ignis-card" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.deepEqual(cards.map((card) => card[1]), ["/how-ignis-works#onshore", "/how-ignis-works#offshore"]);
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
  const signup = "Signal: practical notes on moving energy projects from last-mile development to financial close.";
  const homeFaq = visibleFaq(home);
  const pageFaq = visibleFaq(page);
  assert.ok(homeFaq.length >= 6 && homeFaq.length <= 8);
  assert.ok(pageFaq.length >= 6 && pageFaq.length <= 8);
  assert.deepEqual(jsonFaq(home), homeFaq);
  assert.deepEqual(jsonFaq(page), pageFaq);
  const shared = homeFaq.filter(([question, answer]) => pageFaq.some(([otherQuestion, otherAnswer]) => otherQuestion === question || otherAnswer === answer));
  assert.deepEqual(shared, []);
  for (const [, answer] of [...homeFaq, ...pageFaq]) {
    assert.doesNotMatch(answer, /FORGE|Forge/);
    assert.match(answer, /Ignis/);
    const sentences = answer.split(/(?<=[.!?])\s+/).filter(Boolean);
    assert.ok(sentences.length >= 2 && sentences.length <= 4, answer);
  }
  for (const path of htmlFiles(fileURLToPath(root))) {
    const html = readFileSync(path, "utf8");
    if (!html.includes('id="wp-signup-title"')) continue;
    assert.ok(html.includes(`<p>${signup}</p>`), path);
    assert.doesNotMatch(html, /New white papers on taking energy projects/);
  }
  assert.match(home, /Got a project heading for financial close\?/);
  assert.match(home, /Let’s map where your commercial flow slows down, and what Ignis would change\./);
  assert.match(home, /class="button button-teal" href="\/contact">Book a call<\/a>/);
  assert.doesNotMatch(home, /Turn AI ambition into|commercial advantage/);
});
