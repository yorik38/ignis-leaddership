import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root = new URL("../", import.meta.url);
const paper = readFileSync(new URL("resources/commercial-system-for-your-pipeline.html", root), "utf8");
const listing = readFileSync(new URL("resources.html", root), "utf8");

test("the second white paper is published without a coming-soon state", () => {
  assert.match(paper, /<title>One commercial record, from supplier choice to financial close \| Ignis<\/title>/);
  assert.match(paper, /property="og:title" content="One commercial record, from supplier choice to financial close \| Ignis"/);
  assert.match(paper, /"headline":"One commercial record, from supplier choice to financial close"/);
  assert.match(paper, /<h1>One commercial record, from supplier choice to financial close<\/h1>/);
  assert.match(paper, /rel="canonical" href="https:\/\/www\.ignisleadership\.com\/resources\/commercial-system-for-your-pipeline"/);
  assert.match(paper, /data-header="light"/);
  assert.match(paper, /<time datetime="2026-10">October 2026<\/time>/);
  assert.match(paper, /id="abstract"|id="article"/);
  assert.match(paper, /Key findings/);
  assert.match(paper, /Figure 1/);
  assert.match(paper, /Figure 4/);
  assert.doesNotMatch(paper, /Figure 4<\/span><span class="illus">/);
  assert.match(paper, /class="layer-row s7"/);
  assert.match(paper, /<section class="abs"[\s\S]*?<\/p><p>/);
  assert.match(paper, /id="tab-sens"/);
  assert.match(paper, /£65\.23/);
  assert.match(paper, /£27\.10/);
  assert.match(paper, /30 December 2025/);
  assert.match(paper, /15–30%/);
  assert.match(paper, /id="sources"/);
  assert.match(paper, /data-whitepaper-pdf="\/assets\/downloads\/ignis-white-paper-commercial-system-pipeline\.pdf"/);
  assert.doesNotMatch(paper, /not in the download folder|not in the site download folder|broken file/);
  assert.match(paper, /name="email"/);
  assert.match(paper, /name="resource" value="commercial-system-pipeline"/);
  const signal = paper.slice(paper.indexOf('class="signal-signup-form"'), paper.indexOf('signal-signup-success'));
  assert.match(signal, /placeholder="Work email"/);
  assert.doesNotMatch(signal, /name="company"(?!_)|name="enquiry_topic"|Company \(optional\)|Topic \(optional\)/);
  assert.match(paper, /name="content_source" value="whitepaper-commercial-system-pipeline"/);
  assert.doesNotMatch(paper, /name, work email, company/);
  assert.doesNotMatch(paper, /FORGE|Forge|Coming soon/);
  assert.match(listing, /href="\/resources\/commercial-system-for-your-pipeline"/);
  assert.match(listing, /resource-book-commercial-system\.webp/);
  assert.doesNotMatch(listing, /Coming soon|is-soon|whitepaper-commercial-system-coming-soon/);
  const prose = paper
    .slice(paper.indexOf('<div class="art">'), paper.indexOf('<section class="sources"'))
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/g, " ");
  const words = prose.match(/[A-Za-z0-9£][A-Za-z0-9£'’/%.-]*/g) || [];
  assert.ok(words.length >= 2500 && words.length <= 4000, `word count ${words.length}`);
});
