import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root = new URL("../", import.meta.url);
const issue = readFileSync(new URL("insights/ao10-france-has-put-a-price-on-proof.html", root), "utf8");
const paper = readFileSync(new URL("resources/bids-won-on-evidence.html", root), "utf8");
const signup = "The weekly newsletter, our reports and new white papers on moving energy projects from last-mile development to financial close.";

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
  assert.match(issue, /signal-ao10-cover\.png" alt="Signal Issue 1 cover: AO10 bids submitted: why proof, not price, will decide France's offshore wind round, with the Channel, Brittany, South Atlantic and Mediterranean awards mapped on France\." width="1920" height="1080"/);
  order(issue, [
    'id="ao10-sources"',
    'id="continue-reading-title">Continue reading',
    'href="/resources/bids-won-on-evidence"',
    'href="/insights/why-do-unclear-tenders-produce-incomparable-bids"',
    'href="/insights/when-do-tender-clarifications-become-a-second-specification"',
    'id="close-call-title">Got a project heading for financial close?',
    'class="button button-teal" href="/contact">Book a call',
    'id="wp-signup-title">Get the analysis',
    `<p>${signup}</p>`,
    'id="hubspot-newsletter-form"',
    '<footer class="site-footer">'
  ]);
  assert.equal((issue.match(/class="continue-card"/g) || []).length, 3);
  assert.doesNotMatch(issue, /class="home-newsletter"|class="issue-sidebar-form"|data-community-form|Coming soon/);
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
  assert.match(css, /\.continue-card-media\{[^}]*aspect-ratio:16\/9/);
  assert.match(css, /\.continue-card-media img\{[^}]*object-fit:contain/);
  assert.match(css, /@media\(max-width:1100px\)\{\s*\.continue-reading-grid\{grid-template-columns:1fr/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
