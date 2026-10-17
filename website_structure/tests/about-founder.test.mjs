import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(join(site, name), 'utf8');

test('About introduces Yorik, his experience and the reason for Ignis', () => {
  const about = read('about.html');
  const style = read('assets/about-founder.css');
  assert.match(about, /<h1 id="about-title">Yorik Tisseau<\/h1>/);
  assert.match(about, /class="about-portrait-mark"><img src="\/assets\/img\/yorik-green-portrait\.jpg" alt="Yorik Tisseau, founder of Ignis Leadership"/);
  assert.match(style, /\.about-portrait-mark\{[^}]*border-radius:50%/);
  assert.doesNotMatch(about, /headshot\.jpg|class="about-portrait"|logo-bp-monochrome|logo-bouygues-es|What I bring|Build with us|Experience from/);
  assert.equal((about.match(/<img /g) || []).filter((tag) => about.includes('yorik-green-portrait')).length > 0, true);
  const main = about.slice(about.indexOf('<main'), about.indexOf('</main>'));
  const images = main.match(/<img [^>]*>/g) || [];
  assert.deepEqual(images.map((tag) => tag.includes('yorik-green-portrait') ? 'portrait' : tag.includes('signup-band') ? 'signup' : tag), ['portrait', 'signup']);
  for (const heading of ['Mission', "Founder's view: build faster, together", 'Experience']) assert.match(main, new RegExp(`<h2>${heading}</h2>`));
  assert.ok(main.indexOf('<h2>Mission</h2>') < main.indexOf("<h2>Founder's view: build faster, together</h2>") && main.indexOf("<h2>Founder's view: build faster, together</h2>") < main.indexOf('<h2>Experience</h2>'));
  assert.match(about, /Governed AI for commercial teams helps developers build more projects, faster, and accelerates the energy transition\./);
  assert.match(about, /The energy transition will be won or lost on how fast good projects reach financial close\. That is why we help renewable developers move faster, with less risk and sharper commercial judgement: people make the decisions, governed AI agents do the heavy lifting, and the client owns the system\./);
  assert.doesNotMatch(about, /<p>We help renewable developers move faster, with less risk and sharper commercial judgement\.<\/p>/);
  assert.doesNotMatch(about, /<p>People make the decisions\. Governed AI agents do the heavy lifting\. The client owns the system\.<\/p>/);
  assert.match(about, /<h3>What we believe<\/h3>\s*<ul class="about-beliefs">/);
  assert.match(about, /<strong>Sustainability is the point\.<\/strong> Everything we do should bring more clean energy online, sooner\./);
  assert.match(about, /class="about-manifesto-signoff">Yorik Tisseau, Founder, Ignis<\/p>/);
  assert.match(read("assets/about-founder.css"), /\.about-manifesto-body p\.about-manifesto-signoff\{[^}]*color:#08756d[^}]*font-weight:700/);
  assert.match(style, /\.about-manifesto-body\{[^}]*max-width:none/);
  assert.match(style, /\.about-manifesto-body p\{[^}]*max-width:none/);
  assert.doesNotMatch(about, /What we borrowed|What I borrowed|Points to check|unlimitedindustries/);
  assert.match(about, /from project engineer to bid director, at bp, RWE and Bouygues Energies &amp; Services/);
  assert.match(about, /building first-of-a-kind projects and doing difficult things/);
  assert.match(about, /class="button button-teal" href="\/contact">Get in touch<\/a>/);
  assert.doesNotMatch(about, /FORGE|Forge/);
});

test('Homepage holds only the concise founder overview, not the logos strip', () => {
  const home = read('index.html');
  const style = read('assets/about-founder.css');
  assert.match(home, /class="band band-paper about-preview founder-overview"/);
  assert.match(home, /<p class="founder-overview-eyebrow">Founder<\/p>/);
  assert.match(home, /<h2 id="founder-overview-title">Meet Yorik\.<\/h2>/);
  assert.match(home, /class="founder-overview-photo"><img class="founder-overview-portrait" src="\/assets\/img\/yorik-green-portrait\.jpg" alt="Portrait of Yorik Tisseau"/);
  assert.match(style, /\.founder-overview-photo\{[^}]*border-radius:50%/);
  assert.match(home, /Yorik spent 17 years leading bids, procurement and deals on complex energy and infrastructure projects, from project engineer to bid director\./);
  assert.match(home, /He founded Ignis to help developers build more projects, faster\./);
  assert.match(home, /href="\/about">About Yorik/);
  assert.doesNotMatch(home, /class="trust-band/);
  assert.doesNotMatch(home, /logo-bp-monochrome|logo-bouygues-es/);
  assert.doesNotMatch(home, /id="product-demo"|Demo coming soon/);
  assert.match(home, /Product demo: add a section here when a look at the work is ready/);
});

test('white paper cards alternate a large figure and show the month and year', () => {
  const listing = read('white-papers.html');
  const article = read('resources/bids-won-on-evidence.html');
  const css = read('assets/whitepaper.css');
  const list = listing.slice(listing.indexOf('class="wp-index-list"'), listing.indexOf('close-call'));
  assert.match(list, /<a class="wp-report" href="\/resources\/bids-won-on-evidence">/);
  assert.match(list, /<a class="wp-report" href="\/resources\/commercial-system-for-your-pipeline">/);
  assert.equal((list.match(/<a class="wp-report"/g) || []).length, 2);
  assert.match(list, /<time datetime="2026-10">October 2026<\/time>/);
  assert.doesNotMatch(list, /17 October 2026/);
  assert.match(list, /Read the paper/);
  assert.doesNotMatch(list, /class="wp-report is-soon"|Coming soon/);
  assert.match(css, /\.whitepapers-page \.wp-report:nth-child\(odd\) \.wp-report-media\{order:2\}/);
  assert.match(css, /\.whitepapers-page \.wp-report-media\{[^}]*aspect-ratio:4\/3/);
  assert.doesNotMatch(css, /\.whitepapers-page \.wp-report\{[^}]*background:#f3f5f4/);
  assert.match(css, /@media\(max-width:800px\)\{[\s\S]*?\.wp-report:nth-child\(odd\) \.wp-report-media,\.whitepapers-page \.wp-report:nth-child\(even\) \.wp-report-media\{order:0\}/);
  assert.match(article, /<time datetime="2026-10">October 2026<\/time>/);
  assert.doesNotMatch(article, /17 October 2026/);
});
