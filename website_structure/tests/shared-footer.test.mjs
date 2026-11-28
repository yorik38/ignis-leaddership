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

test("the footer links to Connecting Energy, Ignis and the legal pages", () => {
  assert.match(footer, /Published by Ignis Leadership/);
  for (const route of ["/podcast", "/insights", "/events", "/map", "/resources", "/technologies", "/community", "/about", "/privacy", "/terms"]) {
    assert.ok(footer.includes('href="' + route + '"'), route);
  }
  assert.match(footer, /data-cookie-settings/);
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
    assert.match(html, /\/assets\/site-chrome\.css\?v=55/, `Old shared CSS key: ${file}`);
  }
  assert.ok(count >= 19, `Expected shared footer across rendered pages; found ${count}`);
});
