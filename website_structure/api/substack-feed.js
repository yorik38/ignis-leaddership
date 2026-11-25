// Latest long-form Connecting Energy posts from the public Substack RSS feed.
// The site shows title, date, summary and a link out. It never copies the article.
const FEED_URL = "https://connectingenergy.substack.com/feed";
const MIN_WORDS = 1000;
const MAX_ITEMS = 6;

function decodeEntities(text) {
  return String(text || "")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, "\"")
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function unwrap(value) {
  const text = String(value || "").trim();
  const cdata = text.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return cdata ? cdata[1] : decodeEntities(text);
}

function tagValue(xml, name) {
  const escaped = name.replace(/:/g, "\\:");
  const match = xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`));
  return match ? unwrap(match[1]) : "";
}

function plainText(html) {
  return decodeEntities(String(html || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function wordCount(html) {
  const text = plainText(html);
  return text ? text.split(" ").length : 0;
}

function isSubstackPost(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "connectingenergy.substack.com" && parsed.pathname.startsWith("/p/");
  } catch (_error) {
    return false;
  }
}

function safeImage(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "";
    if (parsed.hostname === "substack-post-media.s3.amazonaws.com") {
      return `https://substackcdn.com/image/fetch/w_720,c_limit,f_auto,q_auto:good/${encodeURIComponent(parsed.href)}`;
    }
    if (parsed.hostname === "substackcdn.com") return parsed.href;
    return "";
  } catch (_error) {
    return "";
  }
}

function parseFeed(xml, {minWords = MIN_WORDS, limit = MAX_ITEMS} = {}) {
  const items = [];
  const blocks = String(xml || "").match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const block of blocks) {
    const url = tagValue(block, "link").trim();
    if (!isSubstackPost(url)) continue;
    // LinkedIn cross-posts arrive with urnliactivity slugs. They are short notes, not long reads.
    if (/\/p\/urnliactivity/i.test(url)) continue;
    const body = tagValue(block, "content:encoded");
    if (wordCount(body) < minWords) continue;
    const title = plainText(tagValue(block, "title")).slice(0, 200);
    if (!title) continue;
    const published = new Date(tagValue(block, "pubDate"));
    const enclosure = block.match(/<enclosure\b[^>]*\burl="([^"]+)"[^>]*>/);
    items.push({
      title,
      url,
      summary: plainText(tagValue(block, "description")).slice(0, 280),
      date: Number.isNaN(published.getTime()) ? "" : published.toISOString(),
      image: enclosure ? safeImage(decodeEntities(enclosure[1])) : ""
    });
    if (items.length >= limit) break;
  }
  return items;
}

function send(response, status, payload, cache) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", cache);
  response.end(JSON.stringify(payload));
}

async function substackFeed(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return send(response, 405, {ok: false, error: "method_not_allowed"}, "no-store");
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const upstream = await fetch(FEED_URL, {
      headers: {Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.5", "User-Agent": "ignisleadership.com feed reader"},
      signal: controller.signal
    }).finally(() => clearTimeout(timer));
    if (!upstream.ok) throw new Error(`Substack feed returned ${upstream.status}`);
    const items = parseFeed(await upstream.text());
    return send(response, 200, {ok: true, items}, "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  } catch (error) {
    console.error("Substack feed error", error && error.message);
    return send(response, 502, {ok: false, items: []}, "public, max-age=0, s-maxage=300");
  }
}

module.exports = substackFeed;
module.exports.parseFeed = parseFeed;
