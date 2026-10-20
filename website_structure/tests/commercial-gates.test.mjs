import test from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);

test("commercial gates comparison follows the rotating statement",()=>{
  const homepage=readFileSync(new URL("index.html",root),"utf8");
  const image="assets/img/commercial-gates-comparison-v2.png";
  assert.ok(existsSync(new URL(image,root)));
  assert.match(homepage,/commercial-gates-comparison-v2\.png/);
  assert.ok(homepage.indexOf('class="band band-paper commercial-gates"')>homepage.indexOf('class="band band-paper pipeline-statement"'));
  assert.ok(homepage.indexOf('class="band band-paper commercial-gates"')<homepage.indexOf('class="band band-paper working-comparison"'));
  assert.match(homepage,/Conventional commercial development stalls between gates\./);
  assert.match(homepage,/Grid offer and consents remain the same in both paths\./);
  assert.doesNotMatch(homepage,/Illustrative process, not a measured project timeline\./);
  assert.doesNotMatch(homepage,/View full-size diagram/);
  assert.match(homepage,/class="text-link commercial-gates-link" href="#services">See how Ignis works <span aria-hidden="true">↗<\/span>/);
  const css=readFileSync(new URL("assets/capability.css",root),"utf8");
  assert.match(css,/\.commercial-gates-link\{[^}]*margin-top:0;color:var\(--ink\)/);
  assert.match(homepage,/class="gates-stack"/);
  assert.match(css,/@media\(max-width:800px\)\{[\s\S]*\.commercial-gates-figure,\.how-ignis-figure\{[^}]*background:transparent[^}]*overflow-x:auto/);
  assert.match(css,/@media\(max-width:800px\)\{[\s\S]*\.commercial-gates-figure img,\.how-ignis-figure img\{[^}]*width:960px[^}]*max-width:none/);
  assert.match(css,/@media\(max-width:800px\)\{[\s\S]*\.gates-stack\{display:none\}/);
  assert.match(homepage,/class="gates-scroll-hint" aria-hidden="true"><span>Scroll →<\/span>/);
  assert.match(homepage,/name="viewport" content="width=device-width, initial-scale=1"/);
  assert.doesNotMatch(homepage,/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/);
  assert.match(homepage,/commercial-gates-fit\.css\?v=1/);
  assert.ok(homepage.indexOf("capability.css?v=206")<homepage.indexOf("commercial-gates-fit.css?v=1"));
  const fit=readFileSync(new URL("assets/commercial-gates-fit.css",root),"utf8");
  assert.match(fit,/@media\(max-width:800px\)\{[\s\S]*aspect-ratio:2400\/778[\s\S]*overflow:hidden/);
  assert.match(fit,/\.commercial-gates-figure \.gates-chart\{[^}]*width:960px[^}]*transform:scale\(calc\(100cqw \/ 960px\)\)/);
  assert.match(fit,/\.commercial-gates-figure \.gates-scroll-hint\{display:none\}/);
  assert.match(homepage,/class="gates-lane-labels"><span class="gates-lane-label is-conventional">Conventional<\/span><span class="gates-lane-label is-ignis">With Ignis<\/span>/);
  assert.match(css,/\.gates-lane-labels\{[^}]*position:sticky[^}]*width:11cqi/);
  assert.match(css,/@media\(max-width:800px\)\{[\s\S]*\.gates-lane-label\{[^}]*background:#fff/);
  assert.match(homepage,/id="services"/);
  assert.doesNotMatch(homepage,/id="how-we-build"/);
});
