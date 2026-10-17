import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

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
  for (const layer of ["Process", "Context", "Data", "Governance", "Workflows"]) {
    assert.match(page, new RegExp(`<h3>${layer}</h3>`));
  }
  assert.match(page, /Map the opportunity/);
  assert.match(page, /Design the model/);
  assert.match(page, /Support delivery/);
  assert.match(page, /commercial-gates-comparison-v1\.png/);
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
  const demo = home.indexOf('id="product-demo"');
  assert.ok(gates >= 0 && who > gates && routes > who && demo > routes);
  assert.match(home, /Who Ignis works with/);
  assert.match(home, /href="\/how-ignis-works#onshore"/);
  assert.match(home, /href="\/how-ignis-works#offshore"/);
  assert.match(home, /One governed system, from grid offer to close\./);
  assert.match(home, /Demo coming soon/);
  assert.match(home, /Testimonials: add a quote band here/);
  assert.doesNotMatch(home, /href="\/commercial-ai-adoption"|href="\/commercial-transformation"/);
  assert.doesNotMatch(home, /FORGE|Forge/);
});
