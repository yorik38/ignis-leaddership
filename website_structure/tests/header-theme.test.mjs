import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dark = new Set([
  "index.html",
  "services.html",
  "bid.html",
  "tender.html",
  "case-study.html",
]);

function htmlFiles(dir) {
  return readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "partials" ? [] : htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

test("every page declares a header theme that matches its hero", () => {
  const files = htmlFiles(root).filter(file => readFileSync(file, "utf8").includes('class="site-header"'));
  assert.ok(files.length >= 19, `Expected a header on every rendered page; found ${files.length}`);
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const name = file.split("/").pop();
    const expected = dark.has(name) ? "dark" : "light";
    assert.match(html, new RegExp(`<body\\b[^>]*\\sdata-header="${expected}"`), `${name} should use the ${expected} header`);
    assert.equal((html.match(/<body\b[^>]*\sdata-header="/g) || []).length, 1, `One header theme: ${name}`);
  }
  assert.match(readFileSync(join(root, "about.html"), "utf8"), /data-header="light"/);
  assert.match(readFileSync(join(root, "index.html"), "utf8"), /data-header="dark"/);
});

test("the shared header theme replaces the old per-page colour overrides", () => {
  const chrome = readFileSync(join(root, "assets/site-chrome.css"), "utf8");
  assert.match(chrome, /body\[data-header="light"\] \.site-header:not\(\.is-scrolling\) \.brand-icon img\s*\{[^}]*filter:\s*invert\(1\)/);
  assert.match(chrome, /body\[data-header="dark"\] \.site-header:not\(\.is-scrolled\):not\(\.is-scrolling\) \.brand-icon img\s*\{[^}]*filter:\s*none/);
  assert.match(chrome, /body\[data-header="light"\] \.site-header\.is-scrolling \.brand-icon img,\s*body\[data-header="dark"\] \.site-header\.is-scrolling \.brand-icon img\s*\{[^}]*filter:\s*none/);
  assert.match(chrome, /body\[data-header="dark"\] \.site-header\.is-scrolled:not\(\.is-scrolling\) \.brand-icon img\s*\{[^}]*filter:\s*invert\(1\)/);
  assert.match(chrome, /body\[data-header\] \.menu-overlay \.brand-icon img\s*\{[^}]*filter:\s*none/);
  assert.doesNotMatch(chrome, /\.issue-page \.site-header|\.contact-page \.site-header/);
  assert.doesNotMatch(readFileSync(join(root, "assets/whitepaper.css"), "utf8"), /\.whitepapers?-page \.site-header/);
  assert.doesNotMatch(readFileSync(join(root, "assets/resources.css"), "utf8"), /\.guides-page \.site-header/);
  assert.doesNotMatch(readFileSync(join(root, "assets/comparison.css"), "utf8"), /\.comparison-page \.site-header/);
});
