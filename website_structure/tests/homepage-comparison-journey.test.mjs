import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);
const homepage=readFileSync(new URL("index.html",root),"utf8");
const css=readFileSync(new URL("assets/capability.css",root),"utf8");

test("the comparison follows the gates diagram and keeps each contrast aligned",()=>{
  const gates=homepage.indexOf('class="band band-paper commercial-gates"');
  const comparison=homepage.indexOf('class="band band-paper working-comparison"');
  const sprint=homepage.indexOf('class="band band-paper engagement-offer sprint-journey"');
  assert.ok(gates>=0 && gates<comparison && comparison<sprint);
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
  assert.match(section,/class="sprint-phase"/);
  assert.match(css,/\.sprint-journey-steps\{grid-column:1 \/ -1;grid-row:2;display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css,/\.sprint-journey-bar\{[^}]*width:calc\(100% \+ var\(--sprint-gap\) \/ 2\)/);
  assert.match(css,/@media\(max-width:700px\)\{[\s\S]*?\.sprint-journey-steps\{display:grid;grid-template-columns:1fr/);
  assert.match(section,/class="sprint-mobile-range"> · steps 1–3<\/span>/);
  assert.match(css,/\.sprint-mobile-range\{display:none\}/);
  assert.match(css,/\.sprint-journey-bar \.sprint-mobile-range\{display:inline\}/);
  assert.match(css,/@media\(max-width:700px\)\{[\s\S]*?\.sprint-phase::before\{content:"";[^}]*width:2px/);
  assert.doesNotMatch(css,/border-left:4px solid/);
  assert.doesNotMatch(css,/sprint-step-1::after|sprint-step-2::after/);
});

test("the brochure section is absent from the homepage",()=>{
  assert.doesNotMatch(homepage,/class="band brochure-band"/);
});

test("the detailed build section is absent and the gates link still has a destination",()=>{
  assert.doesNotMatch(homepage,/class="band band-dark system-build"/);
  assert.doesNotMatch(homepage,/id="how-we-build"/);
  assert.match(homepage,/class="text-link commercial-gates-link" href="#services"/);
  assert.match(homepage,/class="band band-paper engagement-offer sprint-journey" id="services"/);
  assert.doesNotMatch(css,/\.system-build\{/);
});

test("the What Ignis builds section is removed without losing the founder route",()=>{
  assert.doesNotMatch(homepage,/id="what-ignis-builds"|class="band builds-band"/);
  assert.doesNotMatch(css,/\.builds-band\{/);
  assert.match(homepage,/class="band band-paper working-comparison"[\s\S]*?<\/section>\s*<section class="band band-paper engagement-offer sprint-journey"/);
  assert.match(homepage,/class="band band-paper about-preview founder-overview"/);
});

test("the homepage FAQ sets out a bounded consulting start in three questions",()=>{
  const section=homepage.match(/<section class="faq-section"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.doesNotMatch(section,/Questions leaders ask/);
  assert.match(css,/\.faq-heading\{text-align:center;/);
  assert.match(css,/\.faq-grid\{[^}]*margin-inline:auto;/);
  assert.deepEqual([...section.matchAll(/<summary>([^<]+)<\/summary>/g)].map(match=>match[1]),[
    "Where should we start?",
    "What does the first engagement deliver?",
    "Do we need a new platform?"
  ]);
  assert.match(section,/The Sprint reviews the gaps, maps how decisions move today and designs one governed workflow/);
  assert.match(section,/A pilot and embedding are separate next steps/);
  assert.match(section,/Your team keeps ownership of its knowledge, rules and commercial decisions/);
  assert.doesNotMatch(section,/investor|co-founder|full enterprise platform/i);
});
