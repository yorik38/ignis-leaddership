import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(site, path), 'utf8');

test('Insights and Reports are distinct collections', () => {
  const insights = read('insights.html');
  const guides = read('reports.html');
  assert.match(insights, /id="newsletter-editions"/);
  assert.doesNotMatch(insights, /class="signal-guides"|signal-index-header[\s\S]{0,800}href="\/reports"/);
  assert.match(insights, /class="site-footer"[\s\S]*href="\/reports">Reports</);
  assert.match(insights, /class="signal-hero"/);
  assert.match(insights, /class="earlier-editions"[^>]*hidden/);
  assert.match(insights, />Earlier editions</);
  assert.doesNotMatch(insights, /class="earlier-card"/);
  assert.equal((insights.match(/href="\/insights\/ao10-france-has-put-a-price-on-proof"/g) || []).length, 1);
  assert.doesNotMatch(insights, /class="insights-guides"/);
  assert.match(guides, /<h1 id="reports-title">Reports<span class="signal-mark">\.<\/span><\/h1>/);
  assert.match(read('white-papers.html'), /<h1 id="white-papers-title">White papers<span class="signal-mark">\.<\/span><\/h1>/);
  assert.doesNotMatch(read('reports/market-monitor-2026-10.html'), /signal-mark/);
  assert.doesNotMatch(read('resources/bids-won-on-evidence.html'), /signal-mark/);
  assert.match(guides, /class="issue-page whitepapers-page"/);
  assert.match(guides, /class="wp-index"/);
  assert.doesNotMatch(guides, /class="home-latest"/);
  assert.doesNotMatch(guides, /class="home-newsletter"/);
  assert.doesNotMatch(guides, /class="resources-catalogue"/);
  assert.equal((guides.match(/<a class="wp-report"/g) || []).length, 1);
  for (const path of [
    '/resources/ai-augmented-bid-practice',
    '/resources/bid-agent-maturity',
    '/resources/choose-first-ai-bid-use-case',
    '/rfp-software-vs-agentic-bid-system',
    '/insights/why-do-unclear-tenders-produce-incomparable-bids',
    '/insights/when-do-tender-clarifications-become-a-second-specification',
    '/insights/is-commercial-work-too-judgement-heavy-for-ai-agents',
  ]) assert.equal(guides.includes(`href="${path}"`), false, `${path} still listed`);
  assert.match(guides, /href="\/reports\/market-monitor-2026-10"/);
  assert.match(guides, /<time datetime="2026-10">October 2026<\/time>/);
  assert.match(guides, /market-monitor-2026-10-card\.webp 1200w/);
  assert.match(guides, /market-monitor-2026-10-card\.jpg/);
  assert.match(guides, /Ignis Market Monitor is a free monthly research briefing on European offshore wind, UK onshore renewables \(wind, solar and BESS\) and the wider GB power market\./);
  assert.match(guides, /<h2>October 2026: power doubles, France bids 10 GW, grid decisions bunch up<\/h2>/);
  assert.match(guides, /Spot power averaged £145\/MWh over 1 to 17 October, against £73 a year earlier, and gas explains nearly all of it\./);
  assert.doesNotMatch(guides, /What moved in auctions, prices, grid and deals/);
  const report = read('reports/market-monitor-2026-10.html');
  assert.match(report, /<meta name="description" content="Ignis Market Monitor, October 2026\. GB power, European offshore wind and the UK onshore last mile: what moved this month, and what is due next\.">/);
  assert.match(report, /og:image" content="https:\/\/www\.ignisleadership\.com\/assets\/img\/market-monitor-2026-10-card\.jpg"/);
  assert.doesNotMatch(report, /<img[^>]+market-monitor-2026-10-card/);
  assert.match(report, /<h1>Ignis Market Monitor: October 2026<\/h1>/);
  assert.match(report, /GB power, European offshore wind and the UK onshore last mile: what moved this month, and what is due next\./);
  assert.match(report, /data-whitepaper-form/);
  assert.match(report, /action="\/api\/whitepaper"/);
  assert.match(report, /data-edition="market-monitor-2026-10"/);
  assert.doesNotMatch(report, /HubSpot form placeholder|YORIK — HUBSPOT FORM PLACEHOLDER/);
  assert.match(report, /data-whitepaper-pdf="\/assets\/downloads\/ignis-market-monitor-2026-10\.pdf"/);
  assert.match(report, /whitepaper\.js/);
  assert.doesNotMatch(report, /FORGE/);
  assert.doesNotMatch(report, /\bNDA\b/);
  assert.equal((report.match(/<figure /g) || []).length, 3);
  assert.match(report, /The broader market: why power doubled/);
  assert.match(report, /fig3-gb-power-vs-gas\.png/);
  assert.match(report, /id="s13"/);
  assert.match(report, /id="s78"/);
  assert.match(report, /let's have a conversation/);
  assert.match(report, />Book a 30-minute call</);
  assert.match(report, />contact page</);
  assert.match(report, />Subscribe to Signal</);
  assert.match(report, />read it on ignisleadership.com</);
  assert.match(report, /first 90 days after award/);
  assert.match(report, /mailto:yorik@ignisleadership.com/);
  assert.doesNotMatch(report, /fig3-gb-wholesale/);
});

test('Resources navigation and canonical routes point to both pages', () => {
  const header = read('partials/site-header.html');
  const footer = read('partials/site-footer.html');
  assert.match(header, /<a href="\/services">Solutions<\/a>/);
  assert.doesNotMatch(header, /overlay-resource-toggle">Solutions/);
  assert.doesNotMatch(header, /services#onshore|services#offshore|Onshore developers|Offshore wind developers/);
  assert.match(header, /<details class="overlay-resource-group"><summary class="overlay-resource-toggle">Resources/);
  assert.doesNotMatch(header, /overlay-nav-mark/);
  assert.match(header, /class="overlay-resource-chevron" aria-hidden="true"/);
  for (const path of ['/insights', '/reports']) {
    assert.ok(header.includes(`href="${path}"`));
    assert.ok(footer.includes(`href="${path}"`));
  }
  assert.doesNotMatch(header, /href="\/guides"/);
  assert.doesNotMatch(footer, /href="\/guides"/);
  assert.match(read('reports.html'), /rel="canonical" href="https:\/\/www\.ignisleadership\.com\/reports"/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/www\.ignisleadership\.com\/reports<\/loc>/);
  const redirects = JSON.parse(read('vercel.json')).redirects;
  assert.equal(redirects.find(({ source }) => source === '/resources')?.destination, '/reports');
  assert.equal(redirects.find(({ source }) => source === '/guides')?.destination, '/reports');
  assert.equal(redirects.find(({ source }) => source === '/guides/:path*')?.destination, '/reports');
  for (const source of [
    '/resources/ai-augmented-bid-practice',
    '/resources/bid-agent-maturity',
    '/resources/choose-first-ai-bid-use-case',
    '/rfp-software-vs-agentic-bid-system',
  ]) assert.equal(redirects.find((rule) => rule.source === source)?.destination, '/reports', source);
});

test('Reports loads shared chrome after the legacy page styles', () => {
  const guides = read('reports.html');
  const legacy = guides.indexOf('/assets/capability.css');
  const shared = guides.indexOf('/assets/site-chrome.css');
  assert.ok(legacy !== -1 && shared > legacy, 'shared menu styles must win on Guides');
});
