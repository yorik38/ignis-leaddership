import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);
const homepage=readFileSync(new URL("index.html",root),"utf8");
const css=readFileSync(new URL("assets/capability.css",root),"utf8");
const methodCss=readFileSync(new URL("assets/homepage-method.css",root),"utf8");

test("the approved hero leads with the commercial outcome and one contact action",()=>{
  const section=homepage.match(/<section class="hero band-dark">[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.match(section,/Win <span class="gradient-word">more<\/span>\./);
  assert.match(section,/Move more projects to financial close\./);
  assert.match(section,/Ignis starts with the commercial pressure in front of you\./);
  assert.match(section,/href="\/contact">Get in touch/);
  assert.equal((section.match(/class="button /g)??[]).length,1);
});

test("the project journey keeps the rail first and explains the transformation beneath it",()=>{
  const section=homepage.match(/<section class="project-journey"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.ok(section.indexOf('class="project-journey-rail"')<section.indexOf('id="project-journey-title"'));
  assert.match(section,/Start where the commercial pressure is greatest\./);
  assert.match(section,/uses it to expose what must change in the process, data and human-agent workflow behind it/);
  assert.match(section,/while people retain judgement, approval and accountability/);
  assert.match(section,/href="\/services">Explore our services/);
});

test("the former comparison is absorbed into one method",()=>{
  assert.doesNotMatch(homepage,/class="band band-paper working-comparison"|Conventional approach/);
  for(const copy of [
    "Built around one live decision","Evidence held in one governed record",
    "Changes and exceptions surfaced across the workflow","Gaps caught before approval",
    "Approved learning carried forward"
  ]) assert.ok(homepage.includes(copy),`Missing method outcome: ${copy}`);
  assert.match(methodCss,/\.method-shifts\{/);
});

test("the five-step method runs from diagnosis through governed improvement",()=>{
  const section=homepage.match(/<section class="band band-paper engagement-offer ignis-method"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.match(section,/Five steps from live pressure to agentic capability\./);
  assert.deepEqual([...section.matchAll(/<h3>([^<]+)<\/h3>/g)].map(match=>match[1]),[
    "Diagnose","Map","Redesign","Implement and test","Govern and improve","What changes through the method"
  ]);
  assert.doesNotMatch(section,/Sprint|4 weeks/i);
  assert.match(section,/what agents can prepare and where people must retain authority/);
  assert.match(section,/Your technical team or selected delivery partners normally build and integrate production technology/);
  assert.match(section,/href="\/contact">Talk it through/);
  assert.match(methodCss,/\.method-steps\{display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(methodCss,/@media\(max-width:560px\)\{[\s\S]*\.method-steps\{grid-template-columns:1fr\}/);
});

test("the four outcomes follow the method and are framed as measures, not delivered benefits",()=>{
  const method=homepage.indexOf('class="band band-paper engagement-offer ignis-method"');
  const outcomes=homepage.indexOf('class="band band-dark adoption-gap"');
  const routes=homepage.indexOf('class="band band-dark services route-services"');
  assert.ok(method>=0 && outcomes>method && routes>outcomes);
  const section=homepage.match(/<section class="band band-dark adoption-gap"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.match(section,/Measure whether the workflow is improving\./);
  assert.match(section,/They are not benefits assumed in advance\./);
  assert.deepEqual([...section.matchAll(/<h3>([^<]+)<\/h3>/g)].map(match=>match[1]),[
    "Capacity released.","Exceptions caught earlier.","Decisions better supported.","Learning carried forward."
  ]);
  assert.equal((section.match(/<p>Track whether/g)??[]).length,4);
  assert.doesNotMatch(section,/Better margin at close|More time to build relationships|Every project sharper/);
});

test("the brochure section is absent from the homepage",()=>{
  assert.doesNotMatch(homepage,/class="band brochure-band"/);
});

test("the detailed build section is absent and the gates link still has a destination",()=>{
  assert.doesNotMatch(homepage,/class="band band-dark system-build"/);
  assert.doesNotMatch(homepage,/id="how-we-build"/);
  assert.match(homepage,/class="text-link commercial-gates-link" href="#services"/);
  assert.match(homepage,/class="band band-paper engagement-offer ignis-method" id="services"/);
  assert.doesNotMatch(css,/\.system-build\{/);
});

test("the What Ignis builds section is removed without losing the founder route",()=>{
  assert.doesNotMatch(homepage,/id="what-ignis-builds"|class="band builds-band"/);
  assert.doesNotMatch(css,/\.builds-band\{/);
  assert.doesNotMatch(homepage,/class="band band-paper working-comparison"/);
  assert.match(homepage,/class="band band-paper engagement-offer ignis-method"/);
  assert.match(homepage,/class="band band-paper about-preview founder-overview"/);
});

test("the homepage FAQ answers the five decisions that matter before starting",()=>{
  const section=homepage.match(/<section class="faq-section"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.doesNotMatch(section,/Questions leaders ask/);
  assert.match(css,/\.faq-heading\{text-align:center;/);
  assert.match(css,/\.faq-grid\{[^}]*margin-inline:auto;/);
  assert.match(homepage,/<style>\.faq-item summary:focus-visible\{outline:3px solid var\(--teal\);outline-offset:4px\}@media\(max-width:400px\)\{\.founder-authority-layout\{grid-template-columns:1fr;gap:1\.25rem\}/);
  assert.deepEqual([...section.matchAll(/<summary>([^<]+)<\/summary>/g)].map(match=>match[1]),[
    "Where should we start?",
    "What does the first engagement deliver?",
    "Who builds the technology?",
    "Do we need a new platform?",
    "How do we evaluate success?"
  ]);
  assert.match(section,/identifies and prioritises useful agentic use cases/);
  assert.match(section,/Your technical team or selected delivery partners normally build and integrate production technology/);
  assert.match(section,/New technology is considered only where it solves a defined problem/);
  assert.match(section,/whether people retain effective judgement and control/);
  assert.doesNotMatch(section,/Sprint|investor|co-founder|full enterprise platform/i);
});
