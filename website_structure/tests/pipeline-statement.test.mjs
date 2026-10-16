import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);

test("rotating statement emphasises more projects without changing its accessible heading",()=>{
  const homepage=readFileSync(new URL("index.html",root),"utf8");
  assert.match(homepage,/aria-label="Move more projects with Ignis">Move <span class="pipeline-statement-emphasis gradient-word serif-accent">more projects<\/span>/);
  assert.match(homepage,/class="pipeline-statement-tail">with <span class="pipeline-statement-word is-brand"/);
});
