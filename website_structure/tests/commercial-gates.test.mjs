import test from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);

test("the commercial gates comparison left the homepage, and its image stays published",()=>{
  const homepage=readFileSync(new URL("index.html",root),"utf8");
  assert.ok(existsSync(new URL("assets/img/commercial-gates-comparison-v2.png",root)));
  assert.doesNotMatch(homepage,/commercial-gates|gates-stack|commercial-gates-fit\.css/);
  assert.match(homepage,/name="viewport" content="width=device-width,initial-scale=1"/);
  assert.doesNotMatch(homepage,/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/);
});
