const { createHash } = require("node:crypto");
const { XMLParser, XMLValidator } = require("fast-xml-parser");
const { decode } = require("html-entities");

const ARTICLE_FEED = "https://connectingenergy.substack.com/feed";
const MAX_FEED_BYTES = 8 * 1024 * 1024;
const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  isArray: (tag) => ["item", "enclosure", "media:content", "media:thumbnail"].includes(tag),
});

function list(value) {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

function text(value, limit = 240) {
  const raw = typeof value === "string" ? value : value?.["#text"];
  if (!raw) return "";
  const plain = decode(raw.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
  return plain.length > limit ? plain.slice(0, limit - 1).trimEnd() + "…" : plain;
}

function httpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

function artwork(item) {
  const candidates = [
    item["itunes:image"]?.["@_href"],
    ...list(item["media:thumbnail"]).map((image) => image["@_url"]),
    ...list(item.enclosure).filter((file) => /^image\//i.test(file["@_type"])).map((image) => image["@_url"]),
    ...list(item["media:content"]).filter((file) => /^image\//i.test(file["@_type"])).map((image) => image["@_url"]),
  ];
  return candidates.map(httpsUrl).find(Boolean) || "";
}

function publishedAt(value) {
  const date = new Date(text(value));
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

function sortUnique(items, field) {
  return [...new Map(items.filter(Boolean).map((item) => [item[field], item])).values()]
    .sort((left, right) => right.published.localeCompare(left.published));
}

function parseFeed(xml) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) {
    throw new Error("Invalid RSS feed");
  }
  const channel = parser.parse(xml)?.rss?.channel;
  if (!channel || typeof channel !== "object") throw new Error("Missing RSS channel");
  const articles = [];
  const episodes = [];
  for (const item of list(channel.item).slice(0, 120)) {
    const link = httpsUrl(text(item.link, 4096));
    const title = text(item.title, 180);
    if (!title || !link) continue;
    const details = {
      title,
      url: link,
      summary: text(item.description, 270),
      published: publishedAt(item.pubDate),
      image: artwork(item),
    };
    const audio = list(item.enclosure)
      .filter((file) => /^audio\//i.test(file["@_type"]))
      .map((file) => httpsUrl(file["@_url"])).find(Boolean);
    if (audio) {
      const identifier = text(item.guid, 4096) || link;
      const id = createHash("sha256").update(identifier).digest("hex").slice(0, 16);
      episodes.push({ ...details, id, audio });
    } else {
      articles.push(details);
    }
  }
  return { articles: sortUnique(articles, "url"), episodes: sortUnique(episodes, "id") };
}

async function fetchFeed(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(4500),
    headers: { Accept: "application/rss+xml, application/xml, text/xml;q=0.9" },
  });
  if (!response.ok || !response.body) throw new Error("RSS feed unavailable");

  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_FEED_BYTES) {
        await reader.cancel();
        throw new Error("RSS feed exceeds the size limit");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return parseFeed(new TextDecoder().decode(Buffer.concat(chunks)));
}

module.exports = { ARTICLE_FEED, fetchFeed, httpsUrl, parseFeed, sortUnique };
