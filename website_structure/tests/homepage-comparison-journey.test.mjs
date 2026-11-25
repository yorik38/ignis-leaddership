import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);
const homepage=readFileSync(new URL("index.html",root),"utf8");

// The Ignis advisory homepage (hero, project journey, method, outcomes, FAQ) was retired
// in the Connecting Energy refresh. Advisory now lives on /work-with-me.
test("the old advisory homepage sections are retired",()=>{
  assert.doesNotMatch(homepage,/class="project-journey"|engagement-offer ignis-method|class="faq-section"|"@type":"FAQPage"/);
  assert.doesNotMatch(homepage,/Win <span class="gradient-word">more<\/span>|Move more projects to financial close/);
  assert.doesNotMatch(homepage,/id="brochure"|class="brochure-band"/);
  assert.match(homepage,/href="\/work-with-me"/);
});
