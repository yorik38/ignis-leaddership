import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (name) => readFileSync(new URL(name, root), "utf8");

test("the homepage combines the Ignis visual identity with Connecting Energy’s editorial routes", () => {
  const home = read("index.html");
  assert.match(home, /<h1 id="home-title">Connecting Energy/);
  assert.match(home, /hero-solar-topdown-1600/);
  assert.match(home, /assets\/img\/favicon-light-128\.png/);
  assert.match(home, /data-article-feed data-limit="3"/);
  assert.equal((home.match(/class="media-story"/g) ?? []).length, 3);
  assert.match(home, /href="https:\/\/connectingenergy\.substack\.com\/p\/[^"]+"/);
  assert.match(home, /href="https:\/\/connectingenergy\.substack\.com\/subscribe">Get Signal/);
  assert.match(home, /data-episode-feed data-limit="1" hidden/);
  assert.match(home, /href="\/work-with-me"/);

  const header = read("partials/site-header.html");
  for (const route of ["podcast", "insights", "events", "map", "resources", "work-with-me"]) {
    assert.ok(header.includes('href="/' + route + '"'), route);
    assert.match(read(route + ".html"), /<h1\b/);
  }
});

test("launch routes offer real next steps while episodes and events are being prepared", () => {
  const podcast = read("podcast.html");
  assert.match(podcast, /first episode goes live/);
  assert.match(podcast, /\/contact\?enquiry=podcast#contact-layout/);
  assert.match(podcast, /data-episode-feed hidden/);
  assert.doesNotMatch(podcast, /<audio|youtube\.com|spotify\.com/);

  const events = read("events.html");
  assert.match(events, /First debate · In planning/);
  assert.match(events, /href="https:\/\/connectingenergy\.substack\.com\/subscribe"/);
  assert.match(read("work-with-me.html"), /id="speaking"[\s\S]*id="advisory"/);
});
