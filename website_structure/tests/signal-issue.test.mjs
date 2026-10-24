import test from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";

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
    'id="ao10-sources"',
    'id="continue-reading-title">Continue reading',
    'href="/resources/bids-won-on-evidence"',
    'href="/resources/commercial-system-for-your-pipeline"',
    'id="close-call-title">Got a project heading for financial close?',
    'class="button button-teal" href="/contact">Book a call',
    'id="wp-signup-title">Get the analysis',
    'id="hubspot-newsletter-form"',
    '<footer class="site-footer">'
  ]);
  assert.equal((issue.match(/class="continue-card"/g) || []).length, 2);
  assert.match(issue, /I'm especially glad to start Signal with AO10\./);
  assert.doesNotMatch(issue, /issue-signal-tagline|issue-signal-description/);
  const reading = issue.slice(issue.indexOf('continue-reading'), issue.indexOf('close-call'));
  assert.doesNotMatch(reading, /why-do-unclear-tenders|tender-clarifications/);
  assert.match(issue, /class="signal-signup-form"[^>]*data-community-form/);
  assert.doesNotMatch(issue, /Signal: practical notes on moving energy projects/);
  assert.doesNotMatch(issue, /class="home-newsletter"|class="issue-sidebar-form"|Coming soon/);
  assert.match(issue, /aspect-ratio|continue-card/);
});

test("Signal Issue 2 publishes the approved Gate 2 article", () => {
  const gate = readFileSync(new URL("insights/what-gate-2-is-really-about.html", root), "utf8");
  assert.match(gate, /<title>What Gate 2 is really about, and what it means for your projects \| Ignis<\/title>/);
  assert.match(gate, /<h1>What Gate 2 is really about, and what it means for your projects<\/h1>/);
  assert.match(gate, /Signal · Issue 2/);
  assert.match(gate, /Sunday 25 October 2026/);
  assert.match(gate, /There is a lot of noise about Gate 2\. Under it is something simpler: a deadline this week, a second phase in January, and years of milestones written into every signed offer\./);
  assert.match(gate, /What Gate 2 means for GB developers: the noise about delayed dates, the deadlines to March 2027, milestones M1 to M8, and the risks of signing or declining\./);
  assert.match(gate, /signal-gate2-cover\.png(?:\?v=\d+)?" alt="Signal Issue 2 cover: What Gate 2 is really about, and what it means for your projects, over a photo of an electricity pylon at dusk\." width="1920" height="1080"/);
  assert.match(gate, /signal-gate2-cover\.avif/);
  assert.match(gate, /signal-gate2-cover\.webp/);
  assert.match(gate, /<figcaption><strong>Figure 1\.<\/strong> <em>Where the Gate 2 process stands on 21 October 2026: Phase 1 offers are being issued, Phase 2 comes next, and the next application window has no date\.<\/em><\/figcaption>/);
  assert.match(gate, /signal-2-gate2-status-article-1600x900\.png 1600w, \/assets\/img\/signal-2-gate2-status-article-1600x900@2x\.png 3200w/);
  assert.match(gate, /<figcaption><strong>Figure 2\.<\/strong> <em>Only 20\.8 GW of the 604 GW transmission queue carried a Gate 2 label on 16 October, partly because the label only appears once an agreement is countersigned\. From this month's <a href="https:\/\/www\.ignisleadership\.com\/reports\/market-monitor-2026-10">Ignis Market Monitor<\/a>, which covers the queue in more depth\.<\/em><\/figcaption>/);
  assert.match(gate, /fig-monitor-tec-queue-gate\.png/);
  assert.match(gate, /<figcaption><strong>Figure 3\.<\/strong> <em>Gate 2 milestones M1 to M8 in plain words\. M1 to M3 carry termination risk\.<\/em><\/figcaption>/);
  assert.match(gate, /signal-2-gate2-milestones-article-1600x900@2x\.png/);
  assert.match(gate, /Send me a message on LinkedIn\./);
  assert.match(gate, /<em>Commercial commentary, not legal, regulatory or investment advice\. Terms differ by project and network, so always read your own offer\. "By my arithmetic" marks my own calculation\. Sources checked 21 October 2026\.<\/em>/);
  assert.doesNotMatch(gate, /v3 for review|Notes for Yorik|not for publication|Reply in the comments/);
  const visible = gate.replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(visible, /signal-2-gate2-status-article|fig-monitor-tec-queue-gate|signal-2-gate2-milestones-article/);
  order(gate, [
    'id="gate2-sources"',
    'id="continue-reading-title">Continue reading',
    'href="/resources/bids-won-on-evidence"',
    'href="/resources/commercial-system-for-your-pipeline"',
    'id="close-call-title">Got a project heading for financial close?',
    'class="button button-teal" href="/contact">Book a call',
    'id="wp-signup-title">Get the analysis',
    'id="hubspot-newsletter-form"',
    '<footer class="site-footer">'
  ]);
  assert.equal((gate.match(/class="continue-card"/g) || []).length, 2);
  assert.match(gate, /class="signal-signup-form"[^>]*data-community-form/);
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

test("the white paper page uses the same continue-reading cards without linking to itself", () => {
  const block = paper.slice(paper.indexOf('class="continue-reading"'), paper.indexOf("</main>"));
  assert.equal((block.match(/class="continue-card"/g) || []).length, 3);
  assert.match(block, /href="\/insights\/ao10-france-has-put-a-price-on-proof"/);
  assert.match(block, /AO10 bids submitted: why proof, not price, will decide France's offshore wind round/);
  assert.doesNotMatch(block, /href="\/resources\/bids-won-on-evidence"/);
  assert.doesNotMatch(block, /Coming soon|How to build a commercial system/);
  const css = readFileSync(new URL("assets/capability.css", root), "utf8");
  assert.match(css, /\.continue-reading-grid\{[^}]*minmax\(0,420px\)/);
  assert.doesNotMatch(css, /\.continue-card-media\{[^}]*aspect-ratio:16\/9/);
  assert.match(css, /\.continue-card-media img\{[^}]*height:auto/);
  assert.match(css, /\.continue-card-media img\{[^}]*object-fit:contain/);
  assert.match(css, /@media\(max-width:1100px\)\{\s*\.continue-reading-grid\{grid-template-columns:1fr/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
