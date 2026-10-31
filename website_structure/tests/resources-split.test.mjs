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
  assert.match(report, /<meta name="description" content="Market Monitor, October 2026\. What moved in power, offshore wind and onshore renewables this month, and what is due next\.">/);
  assert.match(report, /og:image" content="https:\/\/www\.ignisleadership\.com\/assets\/img\/market-monitor-2026-10-og\.png\?v=2"/);
  assert.doesNotMatch(report, /<img[^>]+market-monitor-2026-10-card/);
  assert.match(report, /<h1>Market Monitor, October 2026<\/h1>/);
  assert.match(report, /What moved in power, offshore wind and onshore renewables this month, and what is due next\./);
  assert.match(report, /data-whitepaper-popup/);
  assert.match(report, /action="\/api\/whitepaper"/);
  assert.match(report, /<p class="wp-free-label">Free resource\.<\/p>/);
  assert.match(report, /data-paper="market-monitor-2026-10"/);
  assert.doesNotMatch(report, /\/assets\/downloads\//);
  assert.doesNotMatch(report, /wp-download-open|wp-gate-card|Download the white paper/);
  assert.equal((report.match(/>Get the PDF</g) || []).length, 2);
  assert.doesNotMatch(report, /HubSpot form placeholder|YORIK — HUBSPOT FORM PLACEHOLDER/);
  assert.match(report, /data-whitepaper-key="ignis-market-monitor-2026-10"/);
  assert.match(report, /whitepaper\.js/);
  assert.doesNotMatch(report, /FORGE/);
  assert.doesNotMatch(report, /\bNDA\b/);
  assert.equal((report.match(/<figure /g) || []).length, 3);
  assert.match(report, /The broader market: why power doubled/);
  assert.match(report, /fig3-gb-power-vs-gas\.png/);
  assert.match(report, /id="s13"/);
  assert.match(report, /id="s78"/);
  assert.match(report, /let's have a conversation/);
  assert.match(report, /Rather speak now\? Talk it through with Yorik in 30 minutes\./);
  assert.match(report, /commercial-decision-call">Get in touch</);
  assert.doesNotMatch(report, /Book a 30-minute call|Talk it through: 30 minutes/);
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
    ['/reports/market-monitor-2026-10', 'Report', 'Market Monitor, October 2026'],
    ['/resources/procurement', 'White paper', 'Procurement without the pauses'],
    ['/resources/route-to-market', 'White paper', 'Choose your route to market, then win it'],
  ]);
  for (const card of cards) assert.ok(card[4].length <= 120, `one line promise: ${card[4]}`);
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
  assert.equal(to('/resources/guide-01-bids'), '/resources/route-to-market');
  assert.equal(to('/resources/bids-won-on-evidence'), '/resources/route-to-market');
  assert.equal(to('/resources/commercial-system-for-your-pipeline'), '/resources/procurement');
  const catchAll = redirects.findIndex((rule) => rule.source === '/:path*.html');
  for (const source of ['/reports.html', '/white-papers.html']) {
    assert.ok(redirects.findIndex((rule) => rule.source === source) < catchAll, `${source} must win over the .html catch-all`);
  }
  assert.ok(!redirects.some((rule) => /^\/reports\/|^\/resources\/agentic/.test(rule.source)), 'live item URLs keep working');
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
  assert.doesNotMatch(page, /\/assets\/downloads\//);
  assert.match(page, /data-whitepaper-key="ignis-guide-agentic-transformation"/);
  assert.ok(existsSync(join(site, 'assets/downloads/ignis-guide-agentic-transformation-for-energy-developers.pdf')));
  assert.match(page, /action="\/api\/whitepaper" data-whitepaper-form/);
  assert.match(page, /name="resource" value="agentic-transformation-for-energy-developers"/);
  assert.match(page, /<input type="checkbox" name="signal_opt_in" value="true">/);
  assert.doesNotMatch(page, /name="signal_opt_in"[^>]*checked/);
  assert.match(page, /name="content_source" value="guide-agentic-transformation"/);
  assert.match(page, /<a href="#download">Get the guide \(PDF\)<\/a>/);
  assert.match(page, /<a class="guide-hero-book" href="#download" aria-label="Get the guide \(PDF\)">/);
  assert.match(page, /scrollIntoView\(\{ behavior: reduce \? "auto" : "smooth", block: "start" \}\)/);
  assert.match(page, /email\.focus\(\{ preventScroll: true \}\)/);
  assert.match(read('assets/resource-cards.css'), /body\.guide-page #download\{scroll-margin-top:calc\(76px \+ 1\.25rem\)\}/);
  assert.match(read('assets/resource-cards.css'), /@media\(max-width:850px\)\{body\.guide-page #download\{scroll-margin-top:calc\(70px \+ 1\.25rem\)\}/);
  assert.match(page, /resource-cards\.css\?v=3/);
  assert.doesNotMatch(page, /id="signal-inbox-title"|class="signal-inbox"|Get Signal in your inbox/);
  assert.match(page, /whitepaper\.js/);
  assert.match(page, />Talk it through</);
  assert.doesNotMatch(page, /[\u2013\u2014]|FORGE|Forge|Book a call|book a call|£|\$\d/);
});

test('the guide stays on an email form and the three papers use a download pop-up', () => {
  const guide = read('resources/agentic-transformation-for-energy-developers.html');
  assert.doesNotMatch(guide, /\/assets\/downloads\//);
  assert.match(guide, /name="resource" value="agentic-transformation-for-energy-developers"/);
  assert.match(guide, /name="email"[^>]*required/);
  assert.match(guide, /<input type="checkbox" name="signal_opt_in" value="true">/);
  assert.doesNotMatch(guide, /name="signal_opt_in"[^>]*checked/);
  for (const path of [
    'resources/route-to-market.html',
    'resources/procurement.html',
    'reports/market-monitor-2026-10.html',
  ]) {
    const page = read(path);
    assert.doesNotMatch(page, /\/assets\/downloads\//, path);
    assert.match(page, /<p class="wp-free-label">Free resource\.<\/p>/, path);
    assert.doesNotMatch(page, /wp-inline-download|wp-download-open|wp-gate-card/, path);
    assert.equal((page.match(/>Get the PDF</g) || []).length, 2, path);
    assert.match(page, /data-whitepaper-popup/, path);
    assert.match(page, /<button type="submit">Send me the PDF<\/button>/, path);
    assert.match(page, /class="signal-signup-form"/, path);
  }
  for (const [path, resource] of [
    ['resources/bids-won-on-evidence.html', 'bids-won-on-evidence'],
    ['resources/commercial-system-for-your-pipeline.html', 'commercial-system-pipeline'],
  ]) {
    const page = read(path);
    const pdf = page.match(/data-whitepaper-pdf="([^"]+)"/)?.[1];
    assert.ok(pdf, `${path} has a gated PDF`);
    assert.equal(page.includes(`href="${pdf}"`), false, `${path} does not link the PDF directly`);
    assert.match(page, new RegExp(`name="resource" value="${resource}"`));
    assert.match(page, /name="email"[^>]*required/);
    assert.match(page, /<input type="checkbox" name="signal_opt_in" value="true">/);
  }
  for (const file of [
    'resources.html',
    'resources/agentic-transformation-for-energy-developers.html',
    'resources/route-to-market.html',
    'resources/procurement.html',
  ]) {
    assert.doesNotMatch(read(file), /Illustrative|a few thousand pounds|id="sources"|FORGE/, file);
  }
  assert.match(read('resources/route-to-market.html'), /discovery and gap review/);
  assert.match(read('resources/procurement.html'), /The price stays open until we have seen the work/);
});
