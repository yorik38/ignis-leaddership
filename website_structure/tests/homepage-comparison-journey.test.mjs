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

  const header = read("partials/site-header.html");
  for (const route of ["podcast", "insights", "map", "community"]) {
    assert.ok(header.includes('href="/' + route + '"'), route);
    assert.match(read(route + ".html"), /<h1\b/);
  }
  assert.doesNotMatch(header, /href="\/(?:resources|work-with-me|events)"/);
});

test("podcast and the map are prominent, with technology guides and community actions below", () => {
  const home = read("index.html");
  const order = ["edition-featured", 'id="launch-title"', 'id="energy-map-title"', 'id="technology-title"', 'id="event-title"'];
  assert.deepEqual(order.map((part) => home.indexOf(part)).every((pos, i, indices) => pos !== -1 && (i === 0 || pos > indices[i - 1])), true);
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
