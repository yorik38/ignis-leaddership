import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const insightsDir = new URL("insights/", root);
const rail = (await readFile(new URL("../partials/article-signal-rail.html", import.meta.url), "utf8")).trim();
const bio = (await readFile(new URL("../partials/article-author-bio.html", import.meta.url), "utf8")).trim();

if (!rail.includes('action="/api/subscribe"') || !rail.includes('name="content_source" value="signal-signup"')) {
  throw new Error("Article Signal partial is missing the subscribe endpoint or source field");
}
if (!bio.includes("About the author")) throw new Error("Article author partial is empty");

function replaceElement(html, startTag, replacement) {
  const start = html.indexOf(startTag);
  if (start < 0) return null;
  const tag = startTag.slice(1, startTag.indexOf(" "));
  let i = start;
  let depth = 0;
  while (i < html.length) {
    if (html.startsWith(`<${tag}`, i)) {
      depth += 1;
      i = html.indexOf(">", i) + 1;
      continue;
    }
    if (html.startsWith(`</${tag}>`, i)) {
      depth -= 1;
      i += tag.length + 3;
      if (depth === 0) return html.slice(0, start) + replacement + html.slice(i);
      continue;
    }
    i += 1;
  }
  throw new Error(`Unclosed <${tag}>`);
}

function footnote(html) {
  return html.replace(
    /<p(?:\s+class="issue-disclaimer")?>\s*(?:<em>)?\s*(Commercial commentary,(?:(?!<\/p>)[\s\S])*)\s*<\/p>/g,
    (_, text) => `<p class="issue-disclaimer">${text.replace(/<\/?em>/g, "").trim()}</p>`,
  );
}

function stripBottomSignup(html) {
  const start = html.indexOf('<section class="signal-inbox');
  if (start < 0) return html;
  const markers = ['<section class="continue-reading"', '<section class="band band-dark close-call"'];
  const next = markers
    .map((marker) => html.indexOf(marker, start))
    .filter((index) => index > start)
    .sort((a, b) => a - b)[0];
  if (next === undefined) throw new Error("Could not find the section after the article signup");
  return html.slice(0, start) + html.slice(next);
}

function wrapReadingStage(html) {
  const bodyStart = html.indexOf('<div class="issue-body">');
  const sources = html.indexOf('<section class="issue-sources"', bodyStart);
  if (bodyStart < 0 || sources < 0) throw new Error("Article is missing the body or sources block");
  const opening = '<div class="issue-body"><div class="issue-shell">';
  if (!html.slice(bodyStart, sources).startsWith(opening)) {
    throw new Error("Unexpected article body opening");
  }
  const reading = html.slice(bodyStart, sources).replace(
    opening,
    '<div class="issue-body"><div class="issue-read-stage"><div class="issue-shell">',
  );
  const bridge = `</div></div>\n${rail}\n</div>\n<div class="issue-shell issue-endmatter"><div class="issue-article-content">\n`;
  return html.slice(0, bodyStart) + reading + bridge + html.slice(sources);
}

const files = (await readdir(insightsDir)).filter((name) => name.endsWith(".html")).sort();
if (files.length === 0) throw new Error("No article pages found");

for (const name of files) {
  const url = new URL(name, insightsDir);
  let html = await readFile(url, "utf8");
  if (!html.includes("insight-article-page")) throw new Error(`${name} is not an article page`);
  html = footnote(html);
  html = replaceElement(html, '<div class="issue-author-bio">', bio) ?? (() => { throw new Error(`${name} has no author bio`); })();
  if (html.includes("article-signal-rail")) {
    const railStart = html.includes('<aside class="signal-inbox article-signal-rail')
      ? '<aside class="signal-inbox article-signal-rail'
      : '<aside class="article-signal-rail';
    html = replaceElement(html, railStart, rail);
  } else {
    html = stripBottomSignup(html);
    html = wrapReadingStage(html);
  }
  if ((html.match(/class="signal-signup-form"/g) || []).length !== 1) {
    throw new Error(`${name} does not have exactly one Signal form`);
  }
  html = html.replaceAll("signal-reading.css?v=2", "signal-reading.css?v=4");
  html = html.replaceAll("signal-reading.css?v=3", "signal-reading.css?v=4");
  html = html.replaceAll("capability.js?v=18", "capability.js?v=19");
  await writeFile(url, html);
  console.log(`updated ${join("insights", name)}`);
}
