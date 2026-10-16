import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);
const homepage=readFileSync(new URL("index.html",root),"utf8");
const css=readFileSync(new URL("assets/capability.css",root),"utf8");

test("the comparison follows the gates diagram and keeps each contrast aligned",()=>{
  const gates=homepage.indexOf('class="band band-paper commercial-gates"');
  const comparison=homepage.indexOf('class="band band-paper working-comparison"');
  const trust=homepage.indexOf('class="trust-band band-paper"');
  assert.ok(gates>=0 && gates<comparison && comparison<trust);
  for(const copy of [
    "Built around your next gate","Work split into separate scopes",
    "One governed record","Evidence across files and inboxes",
    "Changes flagged across workstreams","Impacts traced by hand",
    "Gaps caught as you go","Gaps found late",
    "Every lesson carries forward","Learning stays with individuals"
  ]) assert.ok(homepage.includes(copy),`Missing comparison copy: ${copy}`);
  assert.match(css,/\.working-comparison-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:700px\)\{\s*\.working-comparison-grid\{grid-template-columns:1fr\}/);
});

test("the five-step journey places only the first three steps in the Sprint",()=>{
  const section=homepage.match(/<section class="band band-paper engagement-offer sprint-journey"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.match(section,/The Sprint covers gap review, mapping and design\. Pilot and embedding follow\./);
  assert.deepEqual([...section.matchAll(/<h3>([^<]+)<\/h3>/g)].map(match=>match[1]),[
    "Gap review","Map","Design","Pilot","Embed and improve"
  ]);
  assert.doesNotMatch(section,/4 weeks/i);
  assert.match(css,/\.sprint-journey-steps\{display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:700px\)\{[\s\S]*?\.sprint-journey-steps\{grid-template-columns:1fr/);
});

test("the brochure section is absent from the homepage",()=>{
  assert.doesNotMatch(homepage,/class="band brochure-band"/);
});
