import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root = new URL("../", import.meta.url);
const footer = readFileSync(new URL("partials/site-footer.html", root), "utf8").trim();
const chrome = readFileSync(new URL("assets/site-chrome.css", root), "utf8");

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
  for (const path of ["/about", "/services#onshore", "/services#offshore", "/insights", "/resources", "/contact", "/privacy", "/terms"]) {
    assert.ok(footer.includes(`href="${path}"`), `Missing footer route: ${path}`);
  }
  const sitemap = footer.match(/<nav class="footer-sitemap"[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.match(sitemap, /<h2>Solutions<\/h2><a href="\/services#offshore">Offshore wind<\/a><a href="\/services#onshore">Onshore renewables<\/a>/);
  assert.doesNotMatch(sitemap, /Onshore developers|Offshore wind developers|>Services</);
  assert.doesNotMatch(sitemap, /commercial-ai-adoption|commercial-transformation|\/privacy|\/terms|\/insights\//);
  const bottom = footer.match(/<div class="wrap footer-bottom">[\s\S]*$/)?.[0] ?? "";
  assert.match(bottom, /href="\/privacy"/);
  assert.match(bottom, /href="\/terms"/);
  assert.doesNotMatch(footer, /href="\/blog"/);
  assert.match(footer, /href="\/resources">Research</);
  assert.doesNotMatch(footer, /href="\/(reports|white-papers)"/);
  assert.match(chrome, /\.brand-accent \{ color: var\(--chrome-teal\); \}/);
  assert.match(chrome, /\.footer-brand \.brand-accent \{ color: var\(--chrome-teal\); \}/);
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
    assert.match(html, /\/assets\/site-chrome\.css\?v=52/, `Old shared CSS key: ${file}`);
  }
  assert.ok(count >= 19, `Expected shared footer across rendered pages; found ${count}`);
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
    const bookLabel = file.endsWith("/contact.html")
      ? 'class="button button-teal" href="https://calendly.com/yorik-tisseau-tmff/commercial-decision-call" data-calendly-link>Book a call'
      : 'class="button button-teal" href="/contact">Book a call';
    const book = html.indexOf(bookLabel);
    const footer = html.indexOf('<footer class="site-footer">');
    assert.equal(html.split('id="close-call-title"').length - 1, 1, `CTA count: ${file}`);
    assert.equal(html.split('class="signal-signup-form"').length - 1, 1, `Signup count: ${file}`);
    if (html.includes('class="signal-inbox')) {
      const inbox = html.indexOf('id="signal-inbox-title">Get Signal in your inbox');
      assert.equal(html.split('id="signal-inbox-title"').length - 1, 1, `Inbox count: ${file}`);
      assert.equal(html.split('id="wp-signup-title"').length - 1, 0, `Old signup remains: ${file}`);
      assert.ok(call !== -1 && call < footer, `Ending sequence: ${file}`);
      if (file.endsWith("/insights.html")) {
        const hero = html.indexOf('class="signal-hero"');
        const earlier = html.indexOf('class="earlier-editions"');
        assert.ok(hero !== -1 && hero < inbox && inbox < earlier, `Listing signup: ${file}`);
      } else if (html.includes('class="continue-reading"')) {
        const reading = html.indexOf('class="continue-reading"');
        assert.ok(inbox !== -1 && inbox < reading && reading < call, `Article signup: ${file}`);
      } else {
        assert.ok(inbox !== -1 && inbox < call, `Article signup: ${file}`);
      }
      continue;
    }
    const signup = html.indexOf('id="wp-signup-title">Get the analysis');
    assert.ok(call !== -1 && call < book && book < signup && signup < footer, `Ending sequence: ${file}`);
    assert.equal(html.split('id="wp-signup-title"').length - 1, 1, `Signup count: ${file}`);
  }
  assert.ok(count >= 19);
});
