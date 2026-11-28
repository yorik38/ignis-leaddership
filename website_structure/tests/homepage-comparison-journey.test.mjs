import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (name) => readFileSync(new URL(name, root), "utf8");

test("the homepage presents Connecting Energy through its own masthead and curated stories", () => {
  const home = read("index.html");
  assert.match(home, /<h1 id="home-title"><img[^>]+connecting-energy-wordmark\.png[^>]+alt="Connecting Energy"/);
  assert.match(home, /A community and podcast for the energy transition/);
  assert.match(home, /href="https:\/\/connectingenergy\.substack\.com\/p\/the-cfd-built-britains-offshore-wind"/);
  assert.match(home, /href="\/insights\/electricity-bill-breakdown"/);
  assert.match(home, /src="https:\/\/connectingenergy\.substack\.com\/embed"/);
  assert.match(home, /href="https:\/\/www\.linkedin\.com\/in\/yorik-tisseau\/"/);
  assert.match(home, /data-article-feed data-limit="3" data-exclude-slugs=/);

});

test("the shared header puts all publication routes before Subscribe", () => {
  const header = read("partials/site-header.html");
  const expectedRoutes = ["/", "/podcast", "/insights", "/map", "/community", "/resources"];
  for (const label of ["Main navigation", "Mobile navigation"]) {
    const nav = header.match(new RegExp('<nav[^>]+aria-label="' + label + '">([\\s\\S]*?)</nav>'))?.[1] ?? "";
    assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map((match) => match[1]), expectedRoutes);
  }
  assert.match(header, /<header[^>]*>[\s\S]*edition-brand[\s\S]*class="media-primary"[\s\S]*href="\/#subscribe">Subscribe<\/a>/);
  for (const route of expectedRoutes.slice(1)) assert.match(read(route.slice(1) + ".html"), /<h1\b/);
});

test("the homepage previews every section next to a dedicated signup and links rail", () => {
  const home = read("index.html");
  const css = read("assets/editorial.css");
  assert.match(css, /\.edition-layout\s*\{ grid-template-columns: minmax\(0, 2fr\) minmax\(0, 1fr\)/);
  const column = home.slice(home.indexOf('class="edition-column"'), home.indexOf('class="edition-sidebar"'));
  assert.deepEqual([...column.matchAll(/<section [^>]*aria-labelledby="([^"]+)"/g)].map((match) => match[1]), [
    "home-title", "launch-title", "insights-title", "energy-map-title", "community-title", "resources-title",
  ]);
  const sidebar = home.match(/<aside class="edition-sidebar"[\s\S]*?<\/aside>/)?.[0] ?? "";
  for (const route of ["/podcast#guest", "/map", "/events", "/community#photos"]) assert.ok(sidebar.includes('href="' + route + '"'), route);
  assert.match(sidebar, /id="subscribe"[\s\S]*connectingenergy\.substack\.com\/embed/);
  assert.match(column, /href="\/resources\/global-energy-markets"/);
});

test("the podcast, community and technology guides retain their launch and participation routes", () => {
  const podcast = read("podcast.html");
  assert.match(podcast, /<time datetime="2026-12">December 2026<\/time>/);
  assert.match(podcast, /\/contact\?enquiry=podcast#contact-layout/);
  assert.match(podcast, /data-platform="YouTube"/);
  assert.match(podcast, /data-platform="Spotify"/);
  assert.match(podcast, /data-platform="Apple Podcasts"/);
  assert.match(podcast, /data-episode-feed hidden/);
  assert.doesNotMatch(podcast, /<audio/);

  for (const route of ["solar", "onshore-wind", "offshore-wind", "nuclear", "hydropower", "batteries", "long-duration-storage"]) {
    assert.match(read("technologies/" + route + ".html"), /Where it stands[\s\S]*What to watch[\s\S]*Sources/);
  }
  const community = read("community.html");
  assert.match(community, /mailto:yorik@ignisleadership\.com\?subject=Connecting/);
  assert.match(community, /\/contact\?enquiry=photos#contact-layout/);
  assert.match(community, /interest=live[\s\S]*interest=replay/);
});
