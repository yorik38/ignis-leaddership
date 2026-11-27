import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);


test("rotation waits for the heading and replays from the agreed phrases",()=>{
  const script=readFileSync(new URL("assets/pipeline-statement.js",root),"utf8");
  assert.match(script,/var stages = \["fewer surprises", "one source of truth", "faster gates", "stronger terms"\]/);
  assert.match(script,/var HOLD_MS = 1100/);
  assert.match(script,/prefers-reduced-motion:\s*reduce/);
  assert.match(script,/threshold:\s*\[0,\s*0\.6\]/);
  assert.match(script,/headingTop <= view\.vh \* 0\.5/);
  assert.match(script,/ratio >= 0\.6/);
  assert.match(script,/isOutOfView/);
  assert.match(script,/ratio < 0\.15/);
  assert.match(script,/showWord\(stages\[0\]\)/);
  assert.doesNotMatch(script,/rect\.top <= view\.vh \* 0\.4/);
  assert.match(script,/showWord\("Ignis"\)/);
  assert.doesNotMatch(script,/var stages = \["Process"/);
});
