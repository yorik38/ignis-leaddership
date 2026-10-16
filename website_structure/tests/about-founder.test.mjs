import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(join(site, name), 'utf8');

test('About introduces Yorik, his experience and the reason for Ignis', () => {
  const about = read('about.html');
  assert.match(about, /<h1 id="about-title">Built by someone who's/);
  assert.match(about, /17 years I've worked on the commercial side/);
  assert.match(about, /alt="Yorik Tisseau, founder of Ignis"/);
  assert.match(about, /Experience from/);
  for (const name of ['bp', 'RWE', 'Bouygues Energies']) assert.ok(about.includes(name));
  for (const title of ['First-of-a-kind projects', 'Bids and tenders', 'Cross-functional leadership', 'Coaching']) assert.ok(about.includes(title));
  assert.match(about, /senior commercial judgement plus AI agents/);
  assert.match(about, /Technology should strengthen commercial judgement/);
  assert.match(about, /Build with us/);
  assert.match(about, /href="\/contact">Get in touch/);
});

test('Homepage holds only the concise founder overview, not the logos strip', () => {
  const home = read('index.html');
  assert.match(home, /class="band band-paper about-preview founder-overview"/);
  assert.match(home, /<h2 id="founder-overview-title">Yorik Tisseau<\/h2>/);
  assert.match(home, /qualified executive coach/);
  assert.match(home, /href="\/about.html">About Yorik/);
  assert.doesNotMatch(home, /class="trust-band/);
  assert.doesNotMatch(home, /logo-bp-monochrome|logo-bouygues-es/);
});
