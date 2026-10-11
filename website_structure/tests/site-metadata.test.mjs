import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://www.ignisleadership.com';

function pages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'partials' ? [] : pages(filename);
    return entry.name.endsWith('.html') ? [filename] : [];
  });
}

function tag(html, attribute, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<meta ${attribute}="${escaped}" content="([^"]*)"`, 'i'))?.[1];
}

const seenCanonical = new Set();
const seenTitles = new Set();

for (const file of pages(site)) {
  const name = relative(site, file);
  test(`${name} has consistent metadata`, () => {
    const html = readFileSync(file, 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const description = tag(html, 'name', 'description');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    const image = tag(html, 'property', 'og:image');
    assert.ok(title, 'missing title');
    assert.ok(description, 'missing description');
    assert.ok(canonical?.startsWith(origin), 'missing site canonical');
    assert.ok(!seenTitles.has(title), `duplicate title: ${title}`);
    assert.ok(!seenCanonical.has(canonical), `duplicate canonical: ${canonical}`);
    seenTitles.add(title);
    seenCanonical.add(canonical);
    assert.equal(tag(html, 'property', 'og:title'), title);
    assert.equal(tag(html, 'property', 'og:description'), description);
    assert.equal(tag(html, 'property', 'og:url'), canonical);
    assert.equal(tag(html, 'property', 'og:locale'), 'en_GB');
    assert.equal(tag(html, 'name', 'twitter:card'), 'summary_large_image');
    assert.equal(tag(html, 'name', 'twitter:title'), title);
    assert.equal(tag(html, 'name', 'twitter:description'), description);
    assert.equal(tag(html, 'name', 'twitter:image'), image);
    assert.ok(tag(html, 'property', 'og:image:alt'));
    assert.ok(tag(html, 'name', 'twitter:image:alt'));
    assert.ok(image?.startsWith(origin));
    assert.ok(existsSync(join(site, image.slice(origin.length))));
    const robots = tag(html, 'name', 'robots');
    assert.match(robots ?? '', name === 'ai-roulette.html' ? /noindex/ : /index/);
  });
}
