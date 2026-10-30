import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const page = readFileSync(join(site, 'newsletter.html'), 'utf8');
const insights = readFileSync(join(site, 'insights.html'), 'utf8');
const vercel = JSON.parse(readFileSync(join(site, 'vercel.json'), 'utf8'));
const { signupPlacement } = extractPlacement();

const title = "Signal: What's moving in energy this week, and the commercial take.";
const description = 'A weekly read on auctions, policy, deals and supply chains, seen through a commercial lens, for renewable energy developers and offshore wind teams.';
const url = 'https://www.ignisleadership.com/newsletter';
const image = 'https://www.ignisleadership.com/assets/img/signal-share-card-1200x630.png';
const alt = "Signal. Newsletter. What's moving in energy this week, and the commercial take.";

function tag(html, attribute, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<meta ${attribute}="${escaped}" content="([^"]*)"`, 'i'))?.[1];
}

function extractPlacement() {
  const source = readFileSync(join(site, 'assets/capability.js'), 'utf8');
  const start = source.indexOf('function signupPlacement');
  const end = source.indexOf('document.querySelectorAll', start);
  return new Function(`${source.slice(start, end)} return {signupPlacement};`)();
}

test('the newsletter route is its own page, with no redirect onto Insights', () => {
  assert.equal(vercel.redirects.some((route) => route.source === '/newsletter'), false);
  assert.equal(vercel.redirects.find((route) => route.source === '/newsletter/:slug')?.destination, '/insights/:slug');
  assert.match(page, /<body class="insights-page newsletter-page"/);
  assert.doesNotMatch(page, /http-equiv="refresh"|Bid more\. Win more|Bid Management Insights/);
});

test('newsletter share tags describe Signal and point at this URL', () => {
  const head = page.slice(0, page.indexOf('</head>'));
  assert.equal(head.match(/<title>([^<]+)<\/title>/)?.[1], title);
  assert.equal(tag(head, 'name', 'description'), description);
  assert.equal(head.match(/<link rel="canonical" href="([^"]+)"/)?.[1], url);
  assert.equal(tag(head, 'property', 'og:title'), title);
  assert.equal(tag(head, 'property', 'og:description'), description);
  assert.equal(tag(head, 'property', 'og:url'), url);
  assert.equal(tag(head, 'property', 'og:image'), image);
  assert.equal(tag(head, 'property', 'og:image:width'), '1200');
  assert.equal(tag(head, 'property', 'og:image:height'), '630');
  assert.equal(tag(head, 'property', 'og:image:alt'), alt);
  assert.equal(tag(head, 'name', 'twitter:title'), title);
  assert.equal(tag(head, 'name', 'twitter:description'), description);
  assert.equal(tag(head, 'name', 'twitter:image'), image);
  assert.equal(tag(head, 'name', 'twitter:image:alt'), alt);
  assert.equal(tag(head, 'name', 'author'), 'Yorik Tisseau');
  assert.equal(tag(head, 'property', 'article:author'), 'https://www.linkedin.com/in/yorik-tisseau/');
  assert.equal(head.split(url).length - 1 >= 3, true);
  assert.doesNotMatch(head, /signal-gate2-cover|\/insights"|og-social-card/);
});

test('the share card is 1200 by 630 and the supplied master is kept beside it', () => {
  const png = require('node:fs').readFileSync(join(site, 'assets/img/signal-share-card-1200x630.png'));
  const master = require('node:fs').readFileSync(join(site, 'assets/img/signal-share-card.png'));
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.equal(master.readUInt32BE(16), 1920);
  assert.equal(master.readUInt32BE(20), 1080);
});

test('Insights and issue covers keep their own share images', () => {
  assert.equal(tag(insights, 'property', 'og:image'), 'https://www.ignisleadership.com/assets/img/signal-gate2-cover.png');
  assert.equal(tag(insights, 'property', 'og:url'), 'https://www.ignisleadership.com/insights');
  const issue = readFileSync(join(site, 'insights/what-gate-2-is-really-about.html'), 'utf8');
  assert.match(tag(issue, 'property', 'og:image'), /signal-gate2-cover/);
  assert.doesNotMatch(issue, /signal-share-card/);
  const body = page.slice(page.indexOf('</head>'));
  assert.match(body, /signal-gate2-cover\.png/);
  assert.doesNotMatch(body, /signal-share-card/);
});

test('a signup on /newsletter is recorded as the newsletter page', () => {
  const hero = page.indexOf('id="signal-hero-signup-title"');
  const edition = page.indexOf('class="signal-hero"');
  const end = page.indexOf('data-signup-placement="newsletter_end"');
  assert.ok(hero !== -1 && hero < edition && edition < end);
  assert.match(page, /Weekly insight on agentic AI for energy developers/);
  assert.match(page, /onshore renewables, offshore wind, the grid and data centres/);
  assert.doesNotMatch(page, /IPP|FORGE|Book a call|[\u2013\u2014]/);
  const form = page.slice(page.indexOf('class="signal-signup-form"'), page.indexOf('signal-signup-success'));
  assert.match(form, /data-signup-placement="newsletter"/);
  assert.match(form, /action="\/api\/subscribe"/);
  assert.match(form, /name="signal_consent"/);
  const element = { dataset: {}, classList: { contains: () => false }, closest: () => null };
  globalThis.window = { location: { pathname: '/newsletter' } };
  assert.equal(signupPlacement(element), 'newsletter');
  element.dataset.signupPlacement = 'newsletter';
  globalThis.window.location.pathname = '/insights';
  assert.equal(signupPlacement(element), 'newsletter');
  delete globalThis.window;
});
