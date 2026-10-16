import test from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);

test("commercial gates comparison follows the rotating statement",()=>{
  const homepage=readFileSync(new URL("index.html",root),"utf8");
  const image="assets/img/commercial-gates-comparison-v1.png";
  assert.ok(existsSync(new URL(image,root)));
  assert.ok(homepage.indexOf('class="band band-paper commercial-gates"')>homepage.indexOf('class="band band-paper pipeline-statement"'));
  assert.ok(homepage.indexOf('class="band band-paper commercial-gates"')<homepage.indexOf('class="trust-band band-paper"'));
  assert.match(homepage,/Traditional commercial development stalls between gates\./);
  assert.match(homepage,/Grid offer and consents remain the same in both paths\./);
  assert.doesNotMatch(homepage,/Illustrative process, not a measured project timeline\./);
  assert.doesNotMatch(homepage,/View full-size diagram/);
});
