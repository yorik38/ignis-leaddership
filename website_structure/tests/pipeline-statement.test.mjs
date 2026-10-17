import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);

test("rotating statement emphasises more projects without changing its accessible heading",()=>{
  const homepage=readFileSync(new URL("index.html",root),"utf8");
  assert.match(homepage,/aria-label="Move more projects with Ignis">Move <span class="pipeline-statement-emphasis gradient-word serif-accent">more projects<\/span>/);
  assert.match(homepage,/class="pipeline-statement-word" aria-hidden="true"><span data-pipeline-word>Process<\/span>/);
  assert.doesNotMatch(homepage,/pipeline-statement-word is-brand/);
  assert.match(homepage,/pipeline-statement\.js\?v=6/);
});

test("rotation waits for the heading and replays from Process",()=>{
  const script=readFileSync(new URL("assets/pipeline-statement.js",root),"utf8");
  assert.match(script,/var stages = \["Process", "Context", "Data", "Governance", "Workflows"\]/);
  assert.match(script,/var HOLD_MS = 1100/);
  assert.match(script,/prefers-reduced-motion:\s*reduce/);
  assert.match(script,/threshold:\s*\[0,\s*0\.6\]/);
  assert.match(script,/headingTop <= view\.vh \* 0\.5/);
  assert.match(script,/ratio >= 0\.6/);
  assert.match(script,/isOutOfView/);
  assert.match(script,/ratio < 0\.15/);
  assert.match(script,/showWord\(stages\[0\]\)/);
  assert.doesNotMatch(script,/rect\.top <= view\.vh \* 0\.4/);
  assert.doesNotMatch(script,/fewer surprises/);
  assert.doesNotMatch(script,/showWord\("Ignis"\);\s*\n\s*\}/);
});
