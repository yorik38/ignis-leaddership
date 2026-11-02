import test from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root = new URL("../", import.meta.url);
const issue = readFileSync(new URL("insights/ao10-france-has-put-a-price-on-proof.html", root), "utf8");
const paper = readFileSync(new URL("resources/bids-won-on-evidence.html", root), "utf8");
function order(html, markers) {
  let cursor = 0;
  for (const marker of markers) {
    const at = html.indexOf(marker, cursor);
    assert.ok(at > cursor, `missing or out of order: ${marker}`);
    cursor = at;
  }
}

test("Signal Issue 1 ends with continue reading, the call, then the shared signup", () => {
  assert.match(issue, /Signal · Issue 1/);
  assert.match(issue, /18 October 2026/);
  assert.match(issue, /<h1>AO10 bids submitted: why proof, not price, will decide France's offshore wind round<\/h1>/);
  assert.match(issue, /signal-ao10-cover\.png(?:\?v=\d+)?" alt="Signal Issue 1 cover: AO10 bids submitted: why proof, not price, will decide France's offshore wind round, with the Channel, Brittany, South Atlantic and Mediterranean awards mapped on France\." width="1920" height="1080"/);
  order(issue, [
    'id="signal-inbox-title">Get Signal in your inbox.',
    'action="/api/subscribe"',
    'id="ao10-sources"',
    'class="issue-disclaimer"',
    '</article>',
    'id="continue-reading-title">Continue reading',
    'href="/insights/what-gate-2-is-really-about"',
    'href="/resources/route-to-market"',
    'id="close-call-title">Got a project heading for financial close?',
    'class="button button-teal" href="/contact">Get in touch',
    '<footer class="site-footer">'
  ]);
  assert.equal((issue.match(/class="continue-card"/g) || []).length, 2);
  assert.match(issue, /I'm especially glad to start Signal with AO10\./);
  assert.doesNotMatch(issue, /issue-signal-tagline|issue-signal-description/);
  const reading = issue.slice(issue.indexOf('continue-reading'), issue.indexOf('close-call'));
  assert.doesNotMatch(reading, /why-do-unclear-tenders|tender-clarifications/);
  assert.match(issue, /class="signal-signup-form"[^>]*data-community-form/);
  assert.match(issue, /class="signal-signup-success"[^>]*tabindex="-1"[^>]*>[\s\S]*Thanks, you're subscribed\./);
  assert.doesNotMatch(issue, /You're in\.|Subscription confirmed/);
  assert.match(reading, /<span class="continue-card-kicker">Signal · Issue 2<\/span>/);
  assert.doesNotMatch(issue, /Signal: practical notes on moving energy projects/);
  assert.doesNotMatch(issue, /class="home-newsletter"|class="issue-sidebar-form"|Coming soon/);
  assert.match(issue, /aspect-ratio|continue-card/);
});

test("Signal Issue 2 publishes the approved Gate 2 article", () => {
  const gate = readFileSync(new URL("insights/what-gate-2-is-really-about.html", root), "utf8");
  assert.match(gate, /<title>First come, first served is over\. What the new grid offers mean for developers \| Ignis<\/title>/);
  assert.match(gate, /<h1>First come, first served is over\. What the new grid offers mean for developers<\/h1>/);
  assert.match(gate, /Signal · Issue 2/);
  assert.match(gate, /Sunday 25 October 2026/);
  assert.match(gate, /<p>UK grid reform is still under way\. For years, grid connections ran on first come, first served: apply early and you kept your place in the queue, ready or not\. That is ending\.<\/p>/);
  assert.match(gate, /For years, grid connections ran on first come, first served: apply early and you kept your place in the queue, ready or not\./);
  assert.doesNotMatch(gate, /There is a lot of noise about Gate 2\. Under it is something simpler/);
  assert.match(gate, /signal-gate2-cover\.png(?:\?v=\d+)?" alt="Signal Issue 2 cover: What Gate 2 is really about, and what it means for your projects, over a photo of an electricity pylon at dusk\." width="1920" height="1080"/);
  assert.match(gate, /signal-gate2-cover\.avif/);
  assert.match(gate, /signal-gate2-cover\.webp/);
  assert.match(gate, /<figcaption><strong>Figure 1\.<\/strong> <em>Where the Gate 2 process stands on 21 October 2026: Phase 1 offers are being issued, Phase 2 comes next, and the next application window has no date\.<\/em><\/figcaption>/);
  assert.match(gate, /signal-2-gate2-status-article-1600x900\.png 1600w, \/assets\/img\/signal-2-gate2-status-article-1600x900@2x\.png 3200w/);
  assert.match(gate, /<figcaption><strong>Figure 2\.<\/strong> <em>Only 20\.8 GW of the 604 GW transmission queue carried a Gate 2 label on 16 October, partly because the label only appears once an agreement is countersigned\. From this month's <a href="https:\/\/www\.ignisleadership\.com\/reports\/market-monitor-2026-10">Ignis Market Monitor: October 2026<\/a>, which covers the queue in more depth\.<\/em><\/figcaption>/);
  assert.match(gate, /fig-monitor-tec-queue-gate\.png/);
  assert.match(gate, /<figcaption><strong>Figure 3\.<\/strong> <em>Gate 2 milestones M1 to M8 in plain words\. M1 to M3 carry termination risk\.<\/em><\/figcaption>/);
  assert.match(gate, /signal-2-gate2-milestones-article-1600x900@2x\.png/);
  assert.match(gate, /Send me a message on LinkedIn\./);
  assert.match(gate, /<p class="issue-disclaimer">Commercial commentary, not legal, regulatory or investment advice\. Terms differ by project and network, so always read your own offer\. "By my arithmetic" marks my own calculation\. Sources checked 21 October 2026\.<\/p>/);
  assert.doesNotMatch(gate, /v3 for review|Notes for Yorik|not for publication|Reply in the comments/);
  const visible = gate.replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(visible, /signal-2-gate2-status-article|fig-monitor-tec-queue-gate|signal-2-gate2-milestones-article/);
  assert.doesNotMatch(gate, /<p>\s*(?:---|___|\*\*\*)\s*<\/p>/);
  assert.match(gate, /<p><em>Yorik<\/em><\/p>[\s\S]*<section class="issue-sources"/);
  order(gate, [
    'id="signal-inbox-title">Get Signal in your inbox.',
    'action="/api/subscribe"',
    'id="gate2-sources"',
    '</article>',
    'id="continue-reading-title">Continue reading',
    'href="/insights/ao10-france-has-put-a-price-on-proof"',
    'href="/reports/market-monitor-2026-10"',
    'id="close-call-title">Got a project heading for financial close?',
    'class="button button-teal" href="/contact">Get in touch',
    '<footer class="site-footer">'
  ]);
  const reading = gate.slice(gate.indexOf('class="continue-reading"'), gate.indexOf('class="band band-dark close-call"'));
  assert.equal((reading.match(/class="continue-card"/g) || []).length, 2);
  assert.match(reading, /href="\/insights\/ao10-france-has-put-a-price-on-proof"/);
  assert.match(reading, /signal-ao10-cover\.avif\?v=2/);
  assert.match(reading, /signal-ao10-cover\.webp\?v=2/);
  assert.match(reading, /signal-ao10-cover\.png\?v=2" alt="Signal Issue 1 cover: AO10 bids submitted: why proof, not price, will decide France's offshore wind round, with the Channel, Brittany, South Atlantic and Mediterranean awards mapped on France\."/);
  assert.match(reading, /<span class="continue-card-kicker">Signal · Issue 1<\/span><strong>AO10 bids submitted: why proof, not price, will decide France's offshore wind round<\/strong>/);
  assert.match(reading, /AO10 turns the credibility of a French offshore wind bid into points, and those points translate almost one for one into euros per MWh for developers\./);
  assert.match(reading, /<span class="continue-card-kicker">Report<\/span><strong>Ignis Market Monitor: October 2026<\/strong>/);
  assert.doesNotMatch(reading, /bids-won-on-evidence|Bids are now won on evidence/);
  assert.equal((gate.match(/class="continue-card"/g) || []).length, 2);
  assert.match(gate, /class="signal-signup-form"[^>]*data-community-form/);
  assert.match(gate, /class="signal-signup-success"[^>]*tabindex="-1"[^>]*>[\s\S]*Thanks, you're subscribed\./);
  assert.doesNotMatch(gate, /You're in\.|Subscription confirmed/);
  for (const file of [
    "assets/img/signal-gate2-cover.avif",
    "assets/img/signal-gate2-cover.webp",
    "assets/img/signal-gate2-cover.png",
    "assets/img/signal-2-gate2-status-article-1600x900.png",
    "assets/img/signal-2-gate2-status-article-1600x900@2x.png",
    "assets/img/fig-monitor-tec-queue-gate.png",
    "assets/img/signal-2-gate2-milestones-article-1600x900.png",
    "assets/img/signal-2-gate2-milestones-article-1600x900@2x.png",
  ]) assert.ok(existsSync(new URL(file, root)), file);
});

test("Signal Issue 3 publishes the approved data-centre article", () => {
  const dataCentre = readFileSync(new URL("insights/who-powers-the-next-data-centre.html", root), "utf8");
  assert.match(dataCentre, /<title>Who powers the next data centre\? \| Ignis<\/title>/);
  assert.match(dataCentre, /<h1>Who powers the next data centre\?<\/h1>/);
  assert.match(dataCentre, /Signal · Issue 3/);
  assert.match(dataCentre, /Monday 2 November 2026 · 8 min read/);
  assert.match(dataCentre, /Utilities sold the obvious sites first\. Smaller developers hold the next\./);
  assert.match(dataCentre, /id="issue-summary-title">In this issue/);
  assert.match(dataCentre, /signal-3-who-powers-data-centre\.(?:png|webp|avif)/);
  assert.match(dataCentre, /signal-3-powerstation-sites-map-1600x900@2x\.png/);
  assert.match(dataCentre, /signal-3-aigz-map-1600x900@2x\.png/);
  assert.match(dataCentre, /id="issue-3-sources"/);
  assert.equal((dataCentre.match(/<li id="source-\d+">/g) || []).length, 35);
  assert.doesNotMatch(dataCentre, /Second helpings|second helpings/);
  assert.match(dataCentre, /<p class="issue-disclaimer">Commercial commentary, not legal, regulatory or investment advice\. Project and connection terms vary\. Sources checked 30 October 2026\.<\/p>/);
  assert.match(dataCentre, /class="signal-signup-form"[^>]*data-community-form/);
  assert.match(dataCentre, /id="signal-inbox-title">Get Signal in your inbox\.<\/h2>/);
  assert.match(dataCentre, /Thanks, you're subscribed\./);
  assert.doesNotMatch(dataCentre, /<p>The weekly newsletter for energy developers\.<\/p>/);
  assert.match(dataCentre, /By signing up, you agree to receive Signal and occasional emails from Ignis Leadership\. Unsubscribe at any time\./);
  assert.doesNotMatch(dataCentre, /Weekly UK and European energy market insight|monthly report and occasional marketing updates/);
  for (const file of [
    "assets/img/signal-3-who-powers-data-centre.avif",
    "assets/img/signal-3-who-powers-data-centre.webp",
    "assets/img/signal-3-who-powers-data-centre.png",
    "assets/img/signal-3-powerstation-sites-map-1600x900.png",
    "assets/img/signal-3-powerstation-sites-map-1600x900@2x.png",
    "assets/img/signal-3-aigz-map-1600x900.png",
    "assets/img/signal-3-aigz-map-1600x900@2x.png",
  ]) assert.ok(existsSync(new URL(file, root)), file);
});

test("Signal articles share a narrow reading column and a separated sources list", () => {
  const css = readFileSync(new URL("assets/signal-reading.css", root), "utf8");
  assert.match(css, /--signal-right-inset:max\(1\.5rem,calc\(\(100% - 700px\) \/ 2\)\)/);
  assert.match(css, /--signal-measure:min\(880px,calc\(100% - var\(--signal-right-inset\) - var\(--signal-left-min\)\)\)/);
  assert.match(css, /\.issue-feature[\s\S]*width:var\(--signal-measure\)/);
  assert.match(css, /\.issue-article-content figure img[\s\S]*width:100%/);
  assert.match(css, /\.issue-sources\{[^}]*border-top:3px solid var\(--signal-teal\)/);
  assert.match(css, /\.issue-sources ol li::before\{[^}]*counter\(signal-source\)/);
  assert.match(css, /\.issue-sources a\{[^}]*overflow-wrap:anywhere/);
  const indexCss = readFileSync(new URL("assets/resource-cards.css", root), "utf8");
  assert.match(indexCss, /grid-template-areas:"intro latest" "signup latest"/);
  assert.match(indexCss, /\.signal-inbox\{[^}]*align-self:end/);
  assert.match(indexCss, /\.edition-feature:nth-of-type\(even\) \.edition-feature-media\{order:-1\}/);
  assert.match(indexCss, /\.edition-features:has\(\.edition-feature:nth-of-type\(7\)\) \.older-editions-title/);
  assert.match(indexCss, /@media\(max-width:800px\)/);
  for (const file of [
    "insights/who-powers-the-next-data-centre.html",
    "insights/what-gate-2-is-really-about.html",
    "insights/ao10-france-has-put-a-price-on-proof.html",
    "insights/is-commercial-work-too-judgement-heavy-for-ai-agents.html",
    "insights/when-do-tender-clarifications-become-a-second-specification.html",
    "insights/why-do-unclear-tenders-produce-incomparable-bids.html",
  ]) {
    const html = readFileSync(new URL(file, root), "utf8");
    assert.match(html, /signal-reading\.css\?v=3/, file);
    assert.doesNotMatch(html, /Illustrative CGI|\bCGI\b/, file);
  }
  const coverAlt = "Data centre buildings beside solar panels and battery units in open countryside.";
  const issue = readFileSync(new URL("insights/who-powers-the-next-data-centre.html", root), "utf8");
  assert.equal((issue.match(new RegExp(coverAlt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 3);
  const index = readFileSync(new URL("insights.html", root), "utf8");
  assert.equal((index.match(new RegExp(coverAlt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 3);
});

test("article pages share one Signal rail, the footnote and the proposed author bio", () => {
  const rail = readFileSync(new URL("partials/article-signal-rail.html", root), "utf8").trim();
  const bio = readFileSync(new URL("partials/article-author-bio.html", root), "utf8").trim();
  const css = readFileSync(new URL("assets/signal-reading.css", root), "utf8");
  assert.match(css, /@media\(min-width:1240px\)\{[\s\S]*position:sticky;[\s\S]*top:calc\(96px \+ 1\.25rem\)/);
  assert.match(css, /background:#111719/);
  assert.match(css, /\.issue-disclaimer\{[^}]*font-size:\.78rem;[^}]*font-style:normal/);
  assert.match(rail, /action="\/api\/subscribe"/);
  assert.match(rail, /name="content_source" value="signal-signup"/);
  assert.match(rail, /data-turnstile data-turnstile-theme="dark" data-turnstile-size="compact"/);
  assert.match(rail, /Thanks, you're subscribed\./);
  assert.match(bio, /He has spent 17 years closing commercial deals on energy infrastructure, including at bp, RWE and Bouygues\./);
  assert.match(bio, /Today he helps energy developers find where agentic AI can win them more projects, and builds it with their team so they own the system\./);
  const articles = [
    "insights/who-powers-the-next-data-centre.html",
    "insights/what-gate-2-is-really-about.html",
    "insights/ao10-france-has-put-a-price-on-proof.html",
    "insights/is-commercial-work-too-judgement-heavy-for-ai-agents.html",
    "insights/when-do-tender-clarifications-become-a-second-specification.html",
    "insights/why-do-unclear-tenders-produce-incomparable-bids.html",
  ];
  for (const file of articles) {
    const html = readFileSync(new URL(file, root), "utf8");
    assert.ok(html.includes(rail), file);
    assert.ok(html.includes(bio), file);
    assert.equal((html.match(/class="signal-signup-form"/g) || []).length, 1, file);
    assert.equal((html.match(/<div class="turnstile-slot"/g) || []).length, 1, file);
    const formAt = html.indexOf('class="signal-signup-form"');
    const sourcesAt = html.indexOf('<section class="issue-sources"');
    const bioAt = html.indexOf('class="issue-author-bio"');
    const endAt = html.indexOf("</article>");
    assert.ok(formAt > 0 && formAt < sourcesAt && sourcesAt < bioAt && bioAt < endAt, file);
  }
});

test("the white paper page uses the same continue-reading cards without linking to itself", () => {
  const block = paper.slice(paper.indexOf('class="continue-reading"'), paper.indexOf("</main>"));
  assert.equal((block.match(/class="continue-card"/g) || []).length, 3);
  assert.match(block, /href="\/insights\/ao10-france-has-put-a-price-on-proof"/);
  assert.match(block, /AO10 bids submitted: why proof, not price, will decide France's offshore wind round/);
  assert.doesNotMatch(block, /href="\/resources\/bids-won-on-evidence"/);
  assert.doesNotMatch(block, /Coming soon|One commercial record from grid offer to close/);
  const css = readFileSync(new URL("assets/capability.css", root), "utf8");
  assert.match(css, /\.continue-reading-grid\{[^}]*minmax\(0,420px\)/);
  assert.doesNotMatch(css, /\.continue-card-media\{[^}]*aspect-ratio:16\/9/);
  assert.match(css, /\.continue-card-media img\{[^}]*height:auto/);
  assert.match(css, /\.continue-card-media img\{[^}]*object-fit:contain/);
  assert.match(css, /@media\(max-width:1100px\)\{\s*\.continue-reading-grid\{grid-template-columns:1fr/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test("no insight renders a markdown rule as its own paragraph", () => {
  function files(dir) {
    return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === "tests" ? [] : files(path);
      return entry.name.endsWith(".html") ? [path] : [];
    });
  }
  for (const file of files(fileURLToPath(root))) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /<p>\s*(?:---|___|\*\*\*)\s*<\/p>/, file);
  }
});
