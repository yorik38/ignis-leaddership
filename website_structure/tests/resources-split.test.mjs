import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(site, path), 'utf8');

test('Insights and Guides are distinct collections', () => {
  const insights = read('insights.html');
  const guides = read('guides.html');
  assert.match(insights, /id="newsletter-editions"/);
  assert.match(insights, /href="\/guides"/);
  assert.doesNotMatch(insights, /class="insights-guides"/);
  assert.match(guides, /<h1 id="resources-title">Practical guides/);
  assert.doesNotMatch(guides, /class="home-latest"/);
  assert.doesNotMatch(guides, /class="home-newsletter"/);
  for (const path of [
    '/resources/ai-augmented-bid-practice',
    '/resources/bid-agent-maturity',
    '/resources/choose-first-ai-bid-use-case',
    '/insights/why-do-unclear-tenders-produce-incomparable-bids',
    '/insights/when-do-tender-clarifications-become-a-second-specification',
    '/insights/is-commercial-work-too-judgement-heavy-for-ai-agents',
    '/rfp-software-vs-agentic-bid-system',
  ]) assert.ok(guides.includes(`href="${path}"`), `${path} missing from Guides`);
});

test('Resources navigation and canonical routes point to both pages', () => {
  const header = read('partials/site-header.html');
  const footer = read('partials/site-footer.html');
  assert.match(header, /<details class="overlay-resource-group"><summary class="overlay-resource-toggle"><span class="overlay-nav-mark" aria-hidden="true">\/<\/span>Resources/);
  assert.match(header, /class="overlay-resource-chevron" aria-hidden="true"/);
  for (const path of ['/insights', '/guides']) {
    assert.ok(header.includes(`href="${path}"`));
    assert.ok(footer.includes(`href="${path}"`));
  }
  assert.match(read('guides.html'), /rel="canonical" href="https:\/\/www\.ignisleadership\.com\/guides"/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/www\.ignisleadership\.com\/guides<\/loc>/);
  const redirects = JSON.parse(read('vercel.json')).redirects;
  assert.equal(redirects.find(({ source }) => source === '/resources')?.destination, '/guides');
  assert.ok(!redirects.some(({ source }) => source === '/guides'));
});
