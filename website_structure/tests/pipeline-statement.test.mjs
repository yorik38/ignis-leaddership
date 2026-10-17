import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);

test("rotating statement emphasises more projects without changing its accessible heading",()=>{
  const homepage=readFileSync(new URL("index.html",root),"utf8");
  assert.match(homepage,/aria-label="Move more projects with Ignis">Move <span class="pipeline-statement-emphasis gradient-word serif-accent">more projects<\/span>/);
  assert.match(homepage,/class="pipeline-statement-tail">with <span class="pipeline-statement-word is-brand"/);
  assert.match(homepage,/pipeline-statement\.js\?v=5/);
});

test("rotation waits until the statement is well in view and pauses off screen",()=>{
  const script=readFileSync(new URL("assets/pipeline-statement.js",root),"utf8");
  assert.match(script,/prefers-reduced-motion:\s*reduce/);
  assert.match(script,/threshold:\s*\[0,\s*0\.6\]/);
  assert.match(script,/rect\.top <= view\.vh \* 0\.4/);
  assert.match(script,/ratio >= 0\.6/);
  assert.match(script,/isOutOfView/);
  assert.match(script,/ratio < 0\.15/);
  assert.doesNotMatch(script,/intersectionRatio >= 0\.3/);
});
