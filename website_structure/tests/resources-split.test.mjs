import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(site, path), 'utf8');

test('Insights and Reports are distinct collections', () => {
  const insights = read('insights.html');
  assert.match(insights, /id="newsletter-editions"/);
  assert.doesNotMatch(insights, /class="signal-guides"|signal-index-header[\s\S]{0,800}href="\/resources"/);
  assert.match(insights, /class="site-footer"[\s\S]*href="\/resources">Research</);
  assert.match(insights, /class="signal-hero" href="\/insights\/what-gate-2-is-really-about"/);
  assert.match(insights, /First come, first served is over\. What the new grid offers mean for developers/);
  assert.match(insights, /class="earlier-editions"/);
  assert.doesNotMatch(insights, /class="earlier-editions"[^>]*hidden/);
  assert.match(insights, />Earlier editions</);
  assert.match(insights, /class="earlier-card" href="\/insights\/ao10-france-has-put-a-price-on-proof"/);
  const heroAt = insights.indexOf('class="signal-hero" href="/insights/what-gate-2-is-really-about"');
  const inboxAt = insights.indexOf('id="signal-inbox-title">Get Signal in your inbox');
  const earlierAt = insights.indexOf('class="earlier-card" href="/insights/ao10-france-has-put-a-price-on-proof"');
  assert.ok(heroAt > -1 && inboxAt > heroAt && earlierAt > inboxAt, 'Issue 2 is listed above Issue 1, with signup between them');
  assert.match(insights, /Weekly UK and European energy market insight\. If you like it, sign up and get it straight into your mailbox every week\./);
  assert.match(read('assets/capability.css'), /\.signal-index\{[^}]*background:#fff\}/);
  assert.doesNotMatch(read('assets/capability.css'), /#f3f6f5/);
  assert.equal((insights.match(/href="\/insights\/ao10-france-has-put-a-price-on-proof"/g) || []).length, 1);
  assert.equal((insights.match(/href="\/insights\/what-gate-2-is-really-about"/g) || []).length, 1);
  assert.doesNotMatch(insights, /class="insights-guides"/);
  assert.doesNotMatch(read('reports/market-monitor-2026-10.html'), /signal-mark/);
  assert.doesNotMatch(read('resources/bids-won-on-evidence.html'), /signal-mark/);
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

test('Research is one hub at /resources, with a type tag on every card', () => {
  const hub = read('resources.html');
  assert.equal(existsSync(join(site, 'reports.html')), false);
  assert.equal(existsSync(join(site, 'white-papers.html')), false);
  assert.match(hub, /<h1 id="research-title">Research<span class="signal-mark">\.<\/span><\/h1>/);
  assert.match(hub, /class="issue-page resources-page"/);
  assert.match(hub, /rel="canonical" href="https:\/\/www\.ignisleadership\.com\/resources"/);
  const featured = hub.slice(hub.indexOf('class="res-featured"'), hub.indexOf('class="res-grid-title"'));
  assert.match(featured, /href="\/resources\/agentic-transformation-for-energy-developers"/);
  assert.match(featured, /<span class="res-type">Guide<\/span>/);
  assert.match(featured, /resource-book-agentic-transformation/);
  const grid = hub.slice(hub.indexOf('class="res-grid"'), hub.indexOf('class="signal-inbox'));
  const cards = [...grid.matchAll(/<a class="res-card" href="([^"]+)">[\s\S]*?<span class="res-type">([^<]+)<\/span>\s*<h3>([^<]+)<\/h3>\s*<p>([^<]+)<\/p>\s*<span class="res-card-read">/g)];
  assert.deepEqual(cards.map((card) => [card[1], card[2], card[3]]), [
    ['/reports/market-monitor-2026-10', 'Report', 'Ignis Market Monitor: October 2026'],
    ['/resources/commercial-system-for-your-pipeline', 'White paper', 'One commercial record, from supplier choice to financial close'],
    ['/resources/bids-won-on-evidence', 'White paper', 'Bids are now won on evidence, not hours'],
  ]);
  for (const card of cards) assert.ok(card[4].length <= 110, `one line promise: ${card[4]}`);
  assert.equal((hub.match(/class="res-card-media"/g) || []).length, 3);
  assert.doesNotMatch(hub, /[\u2013\u2014]|FORGE|Book a call|£/);
  assert.match(hub, />Talk it through</);
  const order = ['class="res-featured"', 'class="res-grid"', 'class="signal-inbox', 'id="close-call-title"', 'class="site-footer"'].map((marker) => hub.indexOf(marker));
  assert.deepEqual([...order].sort((x, y) => x - y), order);
  const ld = [...hub.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const collection = ld.find((item) => item['@type'] === 'CollectionPage');
  assert.equal(collection.hasPart.length, 4);
  assert.ok(ld.some((item) => item['@type'] === 'BreadcrumbList'));
});

test('Resources navigation and canonical routes point to the Research hub', () => {
  const header = read('partials/site-header.html');
  const footer = read('partials/site-footer.html');
  assert.match(header, /<a href="\/services">Solutions<\/a>/);
  assert.doesNotMatch(header, /overlay-resource-toggle">Solutions/);
  assert.doesNotMatch(header, /services#onshore|services#offshore|Onshore developers|Offshore wind developers/);
  assert.match(header, /<details class="overlay-resource-group"><summary class="overlay-resource-toggle">Resources/);
  assert.doesNotMatch(header, /overlay-nav-mark/);
  assert.match(header, /class="overlay-resource-chevron" aria-hidden="true"/);
  for (const part of [header, footer]) {
    assert.ok(part.includes('<a href="/insights">Insights</a><a href="/resources">Research</a>'));
    assert.doesNotMatch(part, /href="\/(reports|white-papers|guides)"/);
  }
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /<loc>https:\/\/www\.ignisleadership\.com\/resources<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/www\.ignisleadership\.com\/resources\/agentic-transformation-for-energy-developers<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/www\.ignisleadership\.com\/reports\/market-monitor-2026-10<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.ignisleadership\.com\/(reports|white-papers)<\/loc>/);
  const llms = read('llms.txt');
  assert.match(llms, /\[Research\]\(https:\/\/www\.ignisleadership\.com\/resources\)/);
  assert.match(llms, /resources\/agentic-transformation-for-energy-developers/);
  assert.doesNotMatch(llms, /ignisleadership\.com\/(white-papers|reports)\)/);
  const redirects = JSON.parse(read('vercel.json')).redirects;
  const to = (source) => redirects.find((rule) => rule.source === source)?.destination;
  assert.equal(to('/resources'), undefined, '/resources is now a page');
  for (const source of ['/reports', '/reports.html', '/white-papers', '/white-papers.html', '/guides', '/guides/:path*',
    '/resources/ai-augmented-bid-practice', '/resources/bid-agent-maturity', '/resources/choose-first-ai-bid-use-case',
    '/rfp-software-vs-agentic-bid-system']) assert.equal(to(source), '/resources', source);
  assert.equal(to('/resources/guide-01-bids'), '/resources/bids-won-on-evidence');
  const catchAll = redirects.findIndex((rule) => rule.source === '/:path*.html');
  for (const source of ['/reports.html', '/white-papers.html']) {
    assert.ok(redirects.findIndex((rule) => rule.source === source) < catchAll, `${source} must win over the .html catch-all`);
  }
  assert.ok(!redirects.some((rule) => /^\/reports\/|^\/resources\/(bids-won|commercial-system|agentic)/.test(rule.source)), 'item URLs keep working');
});

test('Research hub loads shared chrome after the legacy page styles', () => {
  const hub = read('resources.html');
  const legacy = hub.indexOf('/assets/capability.css');
  const shared = hub.indexOf('/assets/site-chrome.css');
  assert.ok(legacy !== -1 && shared > legacy, 'shared menu styles must win on Research');
  assert.match(hub, /resource-cards\.css\?v=2/);
});

test('the flagship guide page has a teaser, an email gate and an unticked Signal opt-in', () => {
  const page = read('resources/agentic-transformation-for-energy-developers.html');
  assert.match(page, /<title>Agentic transformation for energy developers \| Ignis<\/title>/);
  assert.match(page, /<h1>A practical guide to introducing agents<\/h1>/);
  assert.match(page, /<p class="sub">From early stage development to financial close<\/p>/);
  assert.match(page, /<span class="pill o">Onshore and offshore<\/span><span class="pill o">UK and Europe<\/span>/);
  assert.match(page, /<p class="wp-crumb"><a href="\/resources">Research<\/a><\/p>/);
  const points = page.slice(page.indexOf('class="guide-points"'), page.indexOf('</ul>'));
  const count = (points.match(/<li>/g) || []).length;
  assert.ok(count >= 4 && count <= 5, `${count} bullets`);
  assert.match(page, /og:image" content="https:\/\/www\.ignisleadership\.com\/assets\/img\/og-agentic-transformation-guide\.png"/);
  assert.ok(existsSync(join(site, 'assets/img/og-agentic-transformation-guide.png')));
  assert.match(page, /data-whitepaper-pdf="\/assets\/downloads\/ignis-guide-agentic-transformation-for-energy-developers\.pdf"/);
  assert.ok(existsSync(join(site, 'assets/downloads/ignis-guide-agentic-transformation-for-energy-developers.pdf')));
  assert.match(page, /action="\/api\/whitepaper" data-whitepaper-form/);
  assert.match(page, /name="resource" value="agentic-transformation-for-energy-developers"/);
  assert.match(page, /<input type="checkbox" name="signal_opt_in" value="true">/);
  assert.doesNotMatch(page, /name="signal_opt_in"[^>]*checked/);
  assert.match(page, /whitepaper\.js/);
  assert.match(page, />Talk it through</);
  assert.doesNotMatch(page, /[\u2013\u2014]|FORGE|Forge|Book a call|book a call|£|\$\d/);
});

test('every paper and report download is gated by email with an unticked Signal opt-in', () => {
  for (const [path, resource] of [
    ['resources/agentic-transformation-for-energy-developers.html', 'agentic-transformation-for-energy-developers'],
    ['resources/bids-won-on-evidence.html', 'bids-won-on-evidence'],
    ['resources/commercial-system-for-your-pipeline.html', 'commercial-system-pipeline'],
    ['reports/market-monitor-2026-10.html', 'market-monitor-2026-10'],
  ]) {
    const page = read(path);
    const pdf = page.match(/data-whitepaper-pdf="([^"]+)"/)?.[1];
    assert.ok(pdf, `${path} has a gated PDF`);
    assert.equal(page.includes(`href="${pdf}"`), false, `${path} does not link the PDF directly`);
    assert.match(page, new RegExp(`name="resource" value="${resource}"`));
    assert.match(page, /name="email"[^>]*required/);
    assert.match(page, /<input type="checkbox" name="signal_opt_in" value="true">/);
  }
});
