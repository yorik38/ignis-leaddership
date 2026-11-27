import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(join(site, name), 'utf8');

test('About connects Yorik’s energy experience with Connecting Energy and Ignis', () => {
  const about = read('about.html');
  assert.match(about, /From boiler engineer to bid director/);
  assert.match(about, /Bouygues, RWE and bp/);
  assert.match(about, /href="\/work-with-me"/);
});


test('white paper cards on the Research hub show a type tag, a cover and one call to action', () => {
  const listing = read('resources.html');
  const article = read('resources/bids-won-on-evidence.html');
  const css = read('assets/resource-cards.css');
  const list = listing.slice(listing.indexOf('data-res-row'), listing.indexOf('close-call'));
  assert.match(list, /<a class="res-card" href="\/resources\/route-to-market" data-res-type="white-paper">/);
  assert.match(list, /<a class="res-card" href="\/resources\/procurement" data-res-type="white-paper">/);
  assert.equal((list.match(/<span class="res-type">White paper<\/span>/g) || []).length, 2);
  assert.equal((list.match(/<span class="res-card-read">Free resource<\/span>/g) || []).length, 3);
  assert.match(list, /<span class="res-card-read">Free guide, sent by email<\/span>/);
  assert.doesNotMatch(list, /Read the paper|is-soon|Coming soon/);
  assert.match(css, /\.res-card-media\{[^}]*aspect-ratio:210\/297/);
  assert.match(css, /\.res-row\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:800px\)\{[\s\S]*?scroll-snap-type:x mandatory/);
  assert.match(article, /<time datetime="2026-10">October 2026<\/time>/);
  assert.doesNotMatch(article, /17 October 2026/);
});
