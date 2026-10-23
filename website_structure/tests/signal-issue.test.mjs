import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

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
