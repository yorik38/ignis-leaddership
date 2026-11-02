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
  assert.doesNotMatch(insights, /class="signal-hero" href="\/insights\/what-gate-2-is-really-about"/);
  assert.match(insights, /class="signal-index-lead"/);
  assert.match(insights, /class="signal-latest-label">Latest issue</);
  assert.match(insights, /First come, first served is over\. What the new grid offers mean for developers/);
  assert.match(insights, /class="signal-hero" href="\/insights\/who-powers-the-next-data-centre"/);
  assert.match(insights, /Who powers the next data centre\?/);
  assert.match(insights, /class="earlier-editions"/);
  assert.doesNotMatch(insights, /class="earlier-editions"[^>]*hidden/);
  assert.match(insights, />Earlier editions</);
  assert.match(insights, /class="edition-feature" href="\/insights\/what-gate-2-is-really-about"/);
  assert.match(insights, /class="edition-feature" href="\/insights\/ao10-france-has-put-a-price-on-proof"/);
  assert.match(insights, /class="older-editions-title"/);
  assert.doesNotMatch(insights, /class="earlier-card"/);
  const heroAt = insights.indexOf('class="signal-hero" href="/insights/who-powers-the-next-data-centre"');
  const inboxAt = insights.indexOf('id="signal-inbox-title">Get Signal in your inbox.');
  const issue2At = insights.indexOf('class="edition-feature" href="/insights/what-gate-2-is-really-about"');
  const issue1At = insights.indexOf('class="edition-feature" href="/insights/ao10-france-has-put-a-price-on-proof"');
  assert.ok(heroAt > -1 && inboxAt > heroAt && issue2At > inboxAt && issue1At > issue2At, 'Issue 3 is above signup, followed by Issues 2 and 1');
  assert.match(insights, /id="signal-inbox-title">Get Signal in your inbox\.<\/h2>\s*<p>What's changing in renewables, the grid and data centre demand, and what it means for strategy, winning work, delivery and agentic AI\.<\/p>/);
  assert.doesNotMatch(insights.slice(inboxAt, issue2At), /See what changed|One focused analysis each week/);
  assert.match(insights, /Each week I cover renewables, the grid and data centre demand for energy developers in the UK and Europe\./);
  assert.match(insights, /Previous analysis on market shifts, project evidence and commercial decisions for energy developers\./);
  assert.match(insights, /What is changing in your commercial workflow\?/);
  assert.match(insights, /where agents could help and where people must retain control\./);
  assert.doesNotMatch(insights, /Weekly UK and European energy market insight\. If you like it, sign up and get it straight into your mailbox every week\./);
  assert.match(read('assets/capability.css'), /\.signal-index\{[^}]*background:#fff\}/);
  assert.match(read('assets/resource-cards.css'), /grid-template-areas:"intro latest" "signup latest"/);
  assert.match(read('assets/resource-cards.css'), /grid-template-areas:"intro" "latest" "signup"/);
  assert.doesNotMatch(read('assets/capability.css'), /#f3f6f5/);
  assert.equal((insights.match(/href="\/insights\/ao10-france-has-put-a-price-on-proof"/g) || []).length, 1);
  assert.equal((insights.match(/href="\/insights\/what-gate-2-is-really-about"/g) || []).length, 1);
  assert.equal((insights.match(/href="\/insights\/who-powers-the-next-data-centre"/g) || []).length, 1);
  assert.doesNotMatch(insights, /class="insights-guides"/);
  assert.doesNotMatch(read('reports/market-monitor-2026-10.html'), /id="signal-title"/);
  assert.doesNotMatch(read('resources/bids-won-on-evidence.html'), /id="signal-title"/);
  assert.match(read('reports/market-monitor-2026-10.html'), /class="signal-wordmark">Signal<span class="signal-mark">\.<\/span>/);
  const report = read('reports/market-monitor-2026-10.html');
  assert.match(report, /<meta name="description" content="Ignis Market Monitor: October 2026\. What moved in power, offshore wind and onshore renewables this month, and what is due next\.">/);
  assert.match(report, /og:image" content="https:\/\/www\.ignisleadership\.com\/assets\/img\/market-monitor-2026-10-og\.png\?v=4"/);
  assert.doesNotMatch(report, /<img[^>]+market-monitor-2026-10-card/);
  assert.match(report, /<h1>Ignis Market Monitor: October 2026<\/h1>/);
  assert.match(report, /What moved in power, offshore wind and onshore renewables this month, and what is due next\./);
  assert.doesNotMatch(report, /ignis-market-monitor-2026-10\.pdf/);
  assert.match(report, /<a href="\/assets\/downloads\/ignis-market-monitor-2026-10-sources">Full source register<\/a>/);
  assert.match(report, /data-whitepaper-form data-whitepaper-email/);
  assert.match(report, /action="\/api\/whitepaper"/);
  assert.match(report, /<p class="wp-free-label">Free to read online\.<\/p>/);
  assert.match(report, /name="resource" value="market-monitor-2026-10"/);
  assert.match(report, /class="wp-gate wp-pdf-offer"/);
  assert.doesNotMatch(report, /wp-download-open|wp-download-dialog|data-whitepaper-popup|wp-get-pdf-row/);
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
  assert.match(report, /<a href="https:\/\/www\.ignisleadership\.com\/insights">Get Signal<\/a>/);
  assert.match(report, />read it on ignisleadership.com</);
  assert.match(report, /first 90 days after award/);
  assert.match(report, /mailto:yorik@ignisleadership.com/);
  assert.doesNotMatch(report, /fig3-gb-wholesale/);
});

test('Research is one hub at /resources, with filters and cards in reading order', () => {
  const hub = read('resources.html');
  assert.equal(existsSync(join(site, 'reports.html')), false);
  assert.equal(existsSync(join(site, 'white-papers.html')), false);
  assert.match(hub, /<h1 id="research-title">Research<span class="signal-mark">\.<\/span><\/h1>/);
  assert.match(hub, /class="issue-page resources-page"/);
  assert.match(hub, /rel="canonical" href="https:\/\/www\.ignisleadership\.com\/resources"/);
  assert.match(hub, /Guides, white papers and reports for energy developers, from early stage development to financial close\./);
  const filters = hub.slice(hub.indexOf('class="res-filters"'), hub.indexOf('data-res-row'));
  assert.match(filters, /role="group" aria-label="Filter research"/);
  assert.match(filters, /<button type="button" aria-pressed="true" data-filter="all">All<\/button>/);
  assert.match(filters, /<button type="button" aria-pressed="false" data-filter="guide">Guide<\/button>/);
  assert.match(filters, /<button type="button" aria-pressed="false" data-filter="white-paper">White papers<\/button>/);
  assert.match(filters, /<button type="button" aria-pressed="false" data-filter="report">Reports<\/button>/);
  const row = hub.slice(hub.indexOf('data-res-row'), hub.indexOf('data-res-follow'));
  const rowCards = [...row.matchAll(/<a class="res-card" href="([^"]+)" data-res-type="([^"]+)">[\s\S]*?<span class="res-type">([^<]+)<\/span>[\s\S]*?<h2 class="res-card-title">([^<]+)<\/h2>[\s\S]*?<p class="res-card-summary">([^<]+)<\/p>/g)];
  assert.deepEqual(rowCards.map((card) => [card[1], card[2], card[3], card[4]]), [
    ['/reports/market-monitor-2026-10', 'report', 'Report', 'Ignis Market Monitor: October 2026'],
    ['/resources/route-to-market', 'white-paper', 'White paper', 'Route to Market for Energy Developers'],
    ['/resources/procurement', 'white-paper', 'White paper', 'Procurement for Energy Developers'],
  ]);
  for (const card of rowCards) assert.ok(card[5].length <= 120, `one line promise: ${card[5]}`);
  assert.match(row, /<time datetime="2026-10-21">21 October 2026<\/time>/);
  assert.equal((row.match(/<time datetime="2026-11">November 2026<\/time>/g) || []).length, 2);
  assert.equal((row.match(/<span class="res-card-read">Free resource<\/span>/g) || []).length, 3);
  const follow = hub.slice(hub.indexOf('data-res-follow'), hub.indexOf('class="signal-inbox'));
  assert.match(follow, /href="\/resources\/agentic-transformation-for-energy-developers" data-res-type="guide"/);
  assert.match(follow, /<span class="res-type">Guide<\/span>/);
  assert.match(follow, /<h2 class="res-card-title">Agentic Transformation for Energy Developers<\/h2>/);
  assert.match(follow, /<span class="res-card-read">Free guide, sent by email<\/span>/);
  assert.match(follow, /How to introduce agents across your projects, from early stage development to financial close\./);
  assert.doesNotMatch(follow, /<time/);
  assert.equal((hub.match(/class="res-card-learn">Learn more</g) || []).length, 4);
  assert.equal((hub.match(/class="res-card-media"/g) || []).length, 4);
  assert.doesNotMatch(hub, /class="res-featured"|res-card-read">[^<]*<span|Get the guide|Read the paper|Read the report|More research/);
  assert.doesNotMatch(hub, /[\u2013\u2014]|FORGE|Book a call|£/);
  assert.match(hub, />Talk it through</);
  const order = ['data-res-filters', 'data-res-row', 'data-res-dots', 'data-res-follow', 'class="signal-inbox', 'id="close-call-title"', 'class="site-footer"'].map((marker) => hub.indexOf(marker));
  assert.deepEqual([...order].sort((x, y) => x - y), order);
  const ld = [...hub.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const collection = ld.find((item) => item['@type'] === 'CollectionPage');
  assert.deepEqual(collection.hasPart.map((part) => part['@id']), [
    'https://www.ignisleadership.com/reports/market-monitor-2026-10#article',
    'https://www.ignisleadership.com/resources/route-to-market#article',
    'https://www.ignisleadership.com/resources/procurement#article',
    'https://www.ignisleadership.com/resources/agentic-transformation-for-energy-developers#article',
  ]);
  assert.deepEqual(collection.mainEntity.itemListElement.map((item) => [item.position, item.url, item.name]), [
    [1, 'https://www.ignisleadership.com/reports/market-monitor-2026-10', 'Ignis Market Monitor: October 2026'],
    [2, 'https://www.ignisleadership.com/resources/route-to-market', 'Route to Market for Energy Developers'],
    [3, 'https://www.ignisleadership.com/resources/procurement', 'Procurement for Energy Developers'],
    [4, 'https://www.ignisleadership.com/resources/agentic-transformation-for-energy-developers', 'Agentic Transformation for Energy Developers'],
  ]);
  assert.ok(ld.some((item) => item['@type'] === 'BreadcrumbList'));
  const css = read('assets/resource-cards.css');
  assert.match(css, /@media \(hover: hover\)/);
  assert.match(css, /scroll-snap-type:x mandatory/);
  assert.match(css, /\.res-card-media\{[^}]*aspect-ratio:210\/297/);
  assert.match(css, /body\.resources-page \.res-card-media\{height:auto;max-height:none;aspect-ratio:auto\}/);
  assert.match(css, /body\.resources-page \.res-card-media img\{width:100%;height:auto;aspect-ratio:auto;object-fit:contain\}/);
  assert.match(css, /body\.resources-page \.res-card-panel\{position:relative;right:auto;bottom:auto;left:auto;display:block;box-sizing:border-box;width:100%/);
  assert.doesNotMatch(css, /body\.resources-page \.res-card\{/);
});

test('the homepage repeats the same four research cards before the close', () => {
  const home = read('index.html');
  const founder = home.indexOf('founder-overview');
  const section = home.indexOf('class="home-research"');
  const close = home.indexOf('class="band band-dark close-call"');
  assert.ok(founder !== -1 && section > founder && close > section);
  const block = home.slice(section, close);
  assert.match(block, /<h2 id="home-research-title">Research<span class="signal-mark">\.<\/span><\/h2>/);
  assert.match(block, /href="\/resources">See all research</);
  assert.doesNotMatch(block, /data-res-filters|aria-pressed/);
  const hrefs = [...block.matchAll(/<a class="res-card" href="([^"]+)" data-res-type="([^"]+)">/g)].map((card) => [card[1], card[2]]);
  assert.deepEqual(hrefs, [
    ['/reports/market-monitor-2026-10', 'report'],
    ['/resources/route-to-market', 'white-paper'],
    ['/resources/procurement', 'white-paper'],
    ['/resources/agentic-transformation-for-energy-developers', 'guide'],
  ]);
  assert.equal((block.match(/>Free resource</g) || []).length, 3);
  assert.match(block, />Free guide, sent by email</);
  assert.equal((block.match(/class="res-card-learn">Learn more</g) || []).length, 4);
  assert.match(block, /<time datetime="2026-10-21">21 October 2026<\/time>/);
  assert.equal((block.match(/<time datetime="2026-11">November 2026<\/time>/g) || []).length, 2);
  assert.doesNotMatch(block.slice(block.indexOf('data-res-follow')), /<time/);
  assert.doesNotMatch(home.slice(section, home.indexOf('data-res-follow', section)), /agentic-transformation/);
  assert.match(home, /resource-cards\.css\?v=11/);
  assert.match(home, /research-cards\.js\?v=2/);
});

test('research paper and guide heroes use their publication covers with a readable overlay', () => {
  const css = read('assets/whitepaper.css');
  for (const asset of [
    'resource-book-market-monitor-2026-10.webp',
    'resource-book-route-to-market.webp',
    'resource-book-procurement.webp',
    'resource-book-agentic-transformation.webp',
  ]) {
    assert.match(css, new RegExp(asset.replaceAll('.', '\\.')));
  }
  assert.match(css, /\.whitepaper \.wp-hero:after\{display:block;[^}]+background:linear-gradient/);
  assert.match(css, /\.whitepaper \.wp-hero\{[^}]+min-height:min\(900px,100svh\)[^}]+background-position:center top/);
  assert.match(css, /\.whitepaper \.wp-hero \.hero-in\{[^}]+max-width:none[^}]+padding-inline:max\(var\(--gutter\),calc\(\(100vw - var\(--wrap\)\)\/2\)\)/);
  assert.match(css, /@media\(max-width:760px\)\{\s*\.whitepaper \.wp-hero\{[^}]+background-size:auto 185%/);
  assert.match(css, /body\.guide-page \.guide-hero-book\{display:none\}/);
  for (const path of [
    'reports/market-monitor-2026-10.html',
    'resources/route-to-market.html',
    'resources/procurement.html',
    'resources/agentic-transformation-for-energy-developers.html',
  ]) {
    assert.match(read(path), /whitepaper\.css\?v=44/);
  }
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
  assert.match(hub, /resource-cards\.css\?v=13/);
});

test('the flagship guide page has a teaser, an email gate and an unticked Signal opt-in', () => {
  const page = read('resources/agentic-transformation-for-energy-developers.html');
  assert.match(page, /<title>Agentic Transformation for Energy Developers \| Ignis<\/title>/);
  assert.match(page, /<h1>Agentic Transformation for Energy Developers<\/h1>/);
  assert.match(page, /<p class="sub">From early stage development to financial close: process first, data second, agents third\.<\/p>/);
  assert.match(page, /<span class="pill o">Onshore and offshore<\/span><span class="pill o">UK and Europe<\/span>/);
  assert.match(page, /<p class="wp-crumb"><a href="\/resources">Research<\/a><\/p>/);
  const points = page.slice(page.indexOf('class="guide-points"'), page.indexOf('</ul>'));
  const count = (points.match(/<li>/g) || []).length;
  assert.ok(count >= 4 && count <= 5, `${count} bullets`);
  assert.match(page, /og:image" content="https:\/\/www\.ignisleadership\.com\/assets\/img\/og-agentic-transformation-guide\.png\?v=3"/);
  assert.ok(existsSync(join(site, 'assets/img/og-agentic-transformation-guide.png')));
  assert.doesNotMatch(page, /\/assets\/downloads\//);
  assert.match(page, /data-whitepaper-key="ignis-guide-agentic-transformation"/);
  assert.ok(existsSync(join(site, 'assets/downloads/ignis-guide-agentic-transformation-for-energy-developers.pdf')));
  assert.match(page, /action="\/api\/whitepaper" data-whitepaper-form/);
  assert.match(page, /name="resource" value="agentic-transformation-for-energy-developers"/);
  assert.match(page, /<input type="checkbox" name="signal_opt_in" value="true">/);
  assert.doesNotMatch(page, /name="signal_opt_in"[^>]*checked/);
  assert.match(page, /name="content_source" value="guide-agentic-transformation"/);
  assert.match(page, /Get the full guide by email\./);
  assert.match(page, /data-whitepaper-form data-whitepaper-email/);
  assert.doesNotMatch(page, /wp-download-jump/);
  assert.match(page, /<a class="guide-hero-book" href="#download" aria-label="Get the guide \(PDF\)">/);
  assert.match(page, /scrollIntoView\(\{ behavior: reduce \? "auto" : "smooth", block: "start" \}\)/);
  assert.match(page, /email\.focus\(\{ preventScroll: true \}\)/);
  assert.match(read('assets/resource-cards.css'), /body\.guide-page #download\{scroll-margin-top:calc\(76px \+ 1\.25rem\)\}/);
  assert.match(read('assets/resource-cards.css'), /@media\(max-width:850px\)\{body\.guide-page #download\{scroll-margin-top:calc\(70px \+ 1\.25rem\)\}/);
  assert.match(page, /resource-cards\.css\?v=11/);
  assert.doesNotMatch(page, /id="signal-inbox-title"|class="signal-inbox"|Weekly intelligence for energy developers/);
  assert.match(page, /whitepaper\.js/);
  assert.match(page, />Talk it through</);
  assert.doesNotMatch(page, /[\u2013\u2014]|FORGE|Forge|Book a call|book a call|£|\$\d/);
});

test('the guide and three papers use visible email-delivery forms', () => {
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
    if (path.endsWith('market-monitor-2026-10.html')) {
      assert.doesNotMatch(page, /ignis-market-monitor-2026-10\.pdf/, path);
      assert.match(page, /Full source register/, path);
    } else {
      assert.doesNotMatch(page, /\/assets\/downloads\//, path);
    }
    assert.match(page, /<p class="wp-free-label">Free to read online\.<\/p>/, path);
    assert.match(page, /class="wp-gate wp-pdf-offer"/, path);
    assert.match(page, /data-whitepaper-form data-whitepaper-email/, path);
    assert.doesNotMatch(page, /wp-download-open|wp-download-dialog|data-whitepaper-popup|wp-get-pdf-row/, path);
    assert.match(page, /aria-label="Send me the PDF"/, path);
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
