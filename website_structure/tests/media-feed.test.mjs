import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { ARTICLE_FEED, parseFeed } = require("../api/_lib/media-feed");
const handler = require("../api/media");

const article = '<item><title>Power &amp; demand</title><link>https://connectingenergy.substack.com/p/power</link><description><![CDATA[<p>Costs &#163;5 per unit.</p>]]></description><content:encoded><![CDATA[Paid body excluded]]></content:encoded><pubDate>Wed, 25 Nov 2026 10:00:00 GMT</pubDate><enclosure url="https://example.com/cover.jpg" type="image/jpeg" /></item>';
const episode = '<item><title>First public episode</title><link>https://connectingenergy.substack.com/p/podcast-one</link><guid isPermaLink="false">episode-one</guid><enclosure url="https://example.com/audio.mp3" type="audio/mpeg" /></item>';
const rss = (entries) => '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>' + entries + '</channel></rss>';

function response() {
  return {
    headers: {},
    statusCode: 0,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(data) { return data; },
    end() {},
  };
}

test("RSS exposes plain public teasers and stable episodes while omitting the article body", () => {
  const parsed = parseFeed(rss(article + episode + article));
  assert.equal(parsed.articles.length, 1);
  assert.equal(parsed.articles[0].title, "Power & demand");
  assert.equal(parsed.articles[0].summary, "Costs £5 per unit.");
  assert.equal(parsed.articles[0].published, "2026-11-25T10:00:00.000Z");
  assert.equal(parsed.articles[0].image, "https://example.com/cover.jpg");
  assert.equal(parsed.episodes[0].audio, "https://example.com/audio.mp3");
  assert.match(parsed.episodes[0].id, /^[0-9a-f]{16}$/);
  assert.equal(parsed.episodes[0].id, parseFeed(rss(episode)).episodes[0].id);
  assert.doesNotMatch(JSON.stringify(parsed), /Paid body excluded/);
  assert.throws(() => parseFeed("<html></html>"), /RSS channel/);
});

test("the public article feed is available while the show is in pre-launch", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(url, ARTICLE_FEED);
    return new Response(rss(article));
  });
  const res = response();
  const result = await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(result.articles.length, 1);
  assert.deepEqual(result.episodes, []);
});

test("the episode feed works when the article feed temporarily fails", async (t) => {
  const old = process.env.PUBLIC_PODCAST_RSS_URL;
  const url = "https://example.com/public-episodes.xml";
  process.env.PUBLIC_PODCAST_RSS_URL = url;
  t.after(() => {
    if (old === undefined) delete process.env.PUBLIC_PODCAST_RSS_URL;
    else process.env.PUBLIC_PODCAST_RSS_URL = old;
  });
  t.mock.method(globalThis, "fetch", async (requested) => {
    if (requested === url) return new Response(rss(episode));
    return new Response("", { status: 503 });
  });
  const res = response();
  const result = await handler({ method: "GET" }, res);
  assert.equal(result.articles, null);
  assert.equal(result.episodes[0].title, "First public episode");
  assert.match(res.headers["Vercel-CDN-Cache-Control"], /s-maxage=60$/);
});
