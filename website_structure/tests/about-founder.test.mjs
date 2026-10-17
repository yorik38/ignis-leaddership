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
  assert.match(about, /class="about-founder-mark"><img src="\/assets\/img\/yorik-green-portrait\.jpg" alt="Yorik Tisseau, founder of Ignis Leadership"/);
  assert.match(read('assets/about-founder.css'), /\.about-founder-mark\{[^}]*border-radius:50%/);
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
  const style = read('assets/about-founder.css');
  assert.match(home, /class="band band-paper about-preview founder-overview"/);
  assert.match(home, /<h2 id="founder-overview-title">Meet Yorik\.<\/h2>/);
  assert.match(home, /class="founder-overview-photo"><img class="founder-overview-portrait" src="\/assets\/img\/yorik-green-portrait\.jpg" alt="Portrait of Yorik Tisseau"/);
  assert.doesNotMatch(home, /<p class="section-label">Founder<\/p>/);
  assert.match(style, /\.founder-overview-photo\{[^}]*border-radius:50%/);
  assert.match(home, /17 years of commercial leadership/);
  assert.doesNotMatch(home, /Commercial leadership first\. AI only with judgement/);
  assert.match(home, /href="\/about.html">About Yorik/);
  assert.doesNotMatch(home, /class="trust-band/);
  assert.doesNotMatch(home, /logo-bp-monochrome|logo-bouygues-es/);
});
