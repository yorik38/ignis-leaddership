import test from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);

test("AI Score is retired from the public website",()=>{
  assert.equal(existsSync(new URL("ai-score.html",root)),false);
  const homepage=readFileSync(new URL("index.html",root),"utf8");
  const privacy=readFileSync(new URL("privacy.html",root),"utf8");
  assert.doesNotMatch(homepage,/AI Score|ai-score/i);
  assert.doesNotMatch(privacy,/AI Score|ai-score/i);
});

test("retired assessment routes lead to the closest active service page",()=>{
  const config=JSON.parse(readFileSync(new URL("vercel.json",root),"utf8"));
  for(const source of ["/ai-score","/ai-score.html","/ai-roulette","/ai-roulette.html"]){
    assert.ok(config.redirects.some(route=>route.source===source&&route.destination==="/services"&&route.permanent));
  }
  assert.equal(Object.hasOwn(config.functions,"api/assessment-report.js"),false);
});
