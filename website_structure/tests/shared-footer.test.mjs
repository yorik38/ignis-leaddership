import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root = new URL("../", import.meta.url);
const footer = readFileSync(new URL("partials/site-footer.html", root), "utf8").trim();

function htmlFiles(dir) {
  return readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "partials" ? [] : htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

test("the shared footer is a concise, expandable sitemap with only available resources", () => {
  assert.match(footer, /class="footer-brand"[^>]*><img src="\/assets\/img\/favicon-dark-128\.png"/);
  assert.match(footer, /Commercial AI for energy projects, from last-mile development to financial close\./);
  assert.deepEqual([...footer.matchAll(/<h2>(?:<a [^>]*>)?([^<]+)/g)].map(match => match[1]), ["About", "Solutions", "Resources", "Get in touch"]);
  for (const path of ["/about", "/how-ignis-works#onshore", "/how-ignis-works#offshore", "/how-ignis-works", "/insights", "/reports", "/white-papers", "/contact", "/privacy", "/terms"]) {
    assert.ok(footer.includes(`href="${path}"`), `Missing footer route: ${path}`);
  }
  const sitemap = footer.match(/<nav class="footer-sitemap"[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.match(sitemap, /Onshore developers/);
  assert.match(sitemap, /Offshore wind developers/);
  assert.doesNotMatch(sitemap, /commercial-ai-adoption|commercial-transformation|\/privacy|\/terms|\/insights\//);
  const bottom = footer.match(/<div class="wrap footer-bottom">[\s\S]*$/)?.[0] ?? "";
  assert.match(bottom, /href="\/privacy"/);
  assert.match(bottom, /href="\/terms"/);
  assert.doesNotMatch(footer, /href="\/blog"/);
  assert.match(footer, /href="\/reports">Reports</);
});

test("all rendered pages use the same footer and updated shared stylesheet", () => {
  const files = htmlFiles(fileURLToPath(root));
  let count = 0;
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const rendered = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
    if (!rendered) continue;
    count++;
    assert.equal(rendered, footer, `Footer mismatch: ${file}`);
    assert.match(html, /\/assets\/site-chrome\.css\?v=49/, `Old shared CSS key: ${file}`);
  }
  assert.ok(count >= 22, `Expected shared footer across rendered pages; found ${count}`);
});

test("every page ends with the homepage call, the shared signup, then the shared footer", () => {
  const files = htmlFiles(fileURLToPath(root));
  const css = readFileSync(new URL("assets/capability.css", root), "utf8");
  assert.doesNotMatch(css, /\.site-footer\{[^}]*background:#000/);
  let count = 0;
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    if (!html.includes('<footer class="site-footer">')) continue;
    count++;
    const call = html.indexOf('id="close-call-title">Got a project heading for financial close?');
    const book = html.indexOf('class="button button-teal" href="/contact">Book a call');
    const signup = html.indexOf('id="wp-signup-title">Get the analysis');
    const footer = html.indexOf('<footer class="site-footer">');
    assert.ok(call !== -1 && call < book && book < signup && signup < footer, `Ending sequence: ${file}`);
    assert.equal(html.split('id="close-call-title"').length - 1, 1, `CTA count: ${file}`);
    assert.equal(html.split('id="wp-signup-title"').length - 1, 1, `Signup count: ${file}`);
  }
  assert.ok(count >= 22);
});
