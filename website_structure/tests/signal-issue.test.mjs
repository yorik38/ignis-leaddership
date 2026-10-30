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
    'id="ao10-sources"',
    '</article>',
    'id="signal-inbox-title">Get Signal in your inbox',
    'Weekly UK and European energy market insight. If you like it, sign up and get it straight into your mailbox every week.',
    'action="/api/subscribe"',
    'id="continue-reading-title">Continue reading',
    'href="/resources/route-to-market"',
    'href="/resources/procurement"',
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
  assert.match(gate, /<figcaption><strong>Figure 2\.<\/strong> <em>Only 20\.8 GW of the 604 GW transmission queue carried a Gate 2 label on 16 October, partly because the label only appears once an agreement is countersigned\. From this month's <a href="https:\/\/www\.ignisleadership\.com\/reports\/market-monitor-2026-10">Market Monitor, October 2026<\/a>, which covers the queue in more depth\.<\/em><\/figcaption>/);
  assert.match(gate, /fig-monitor-tec-queue-gate\.png/);
  assert.match(gate, /<figcaption><strong>Figure 3\.<\/strong> <em>Gate 2 milestones M1 to M8 in plain words\. M1 to M3 carry termination risk\.<\/em><\/figcaption>/);
  assert.match(gate, /signal-2-gate2-milestones-article-1600x900@2x\.png/);
  assert.match(gate, /Send me a message on LinkedIn\./);
  assert.match(gate, /<em>Commercial commentary, not legal, regulatory or investment advice\. Terms differ by project and network, so always read your own offer\. "By my arithmetic" marks my own calculation\. Sources checked 21 October 2026\.<\/em>/);
  assert.doesNotMatch(gate, /v3 for review|Notes for Yorik|not for publication|Reply in the comments/);
  const visible = gate.replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(visible, /signal-2-gate2-status-article|fig-monitor-tec-queue-gate|signal-2-gate2-milestones-article/);
  assert.doesNotMatch(gate, /<p>\s*(?:---|___|\*\*\*)\s*<\/p>/);
  assert.match(gate, /<p><em>Yorik<\/em><\/p>\s*<section class="issue-sources"/);
  order(gate, [
    'id="gate2-sources"',
    '</article>',
    'id="signal-inbox-title">Get Signal in your inbox',
    'Weekly UK and European energy market insight. If you like it, sign up and get it straight into your mailbox every week.',
    'action="/api/subscribe"',
    'id="continue-reading-title">Continue reading',
    'href="/insights/ao10-france-has-put-a-price-on-proof"',
    'href="/resources/procurement"',
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
  assert.match(reading, /<span class="continue-card-kicker">White paper<\/span><strong>Procurement without the pauses<\/strong>/);
  assert.doesNotMatch(reading, /bids-won-on-evidence|Bids are now won on evidence/);
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
