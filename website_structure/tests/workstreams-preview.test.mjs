import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const home = readFileSync(join(site, 'index.html'), 'utf8');
const css = readFileSync(join(site, 'assets/workstreams-preview.css'), 'utf8');
const js = readFileSync(join(site, 'assets/working-examples.js'), 'utf8');

test('working examples replace the stacked workstream panels', () => {
  const comparison = home.indexOf('class="band band-paper working-comparison"');
  const examples = home.indexOf('id="working-examples-title"');
  const sprint = home.indexOf('class="band band-paper engagement-offer sprint-journey"');
  assert.ok(comparison >= 0 && examples > comparison && sprint > examples);
  assert.match(home, /<h2 id="working-examples-title">Across the project life<\/h2>/);
  assert.doesNotMatch(home, /<h2 id="working-examples-title">Working examples<\/h2>/);
  assert.doesNotMatch(home, /class="workstream-panel"|Illustrative workflow/);
  assert.doesNotMatch(home, /FORGE/);
  assert.match(home, /role="tablist"/);
  for (const label of ['Grow your pipeline', 'Steer your portfolio', 'Secure your route to market', 'Tender to financial close']) {
    assert.match(home, new RegExp(`>${label}</button>`));
    assert.match(home, new RegExp(`data-journey-tab="wx-tab-[a-z]+"[^>]*>[\\s\\S]*?<strong>${label}</strong>`));
  }
  assert.match(home, /class="project-journey"/);
  assert.ok(home.indexOf('class="project-journey"') < home.indexOf('Every project starts by rebuilding the last one.'));
  assert.ok(home.indexOf('Every project starts by rebuilding the last one.') < home.indexOf('id="adoption-gap"'));
  assert.doesNotMatch(home, /wx-accordion|Option A · swipe the chips|Option B · accordion/);
  assert.match(home, /href="\/services">See our services /);
  assert.match(css, /max-width:800px\)\{[\s\S]*\.wx-tabs\{[^}]*overflow-x:auto/);
  assert.match(home, /Win the right to develop\./);
  assert.equal((home.match(/ILLUSTRATIVE · <span>example data<\/span>/g) || []).length, 5);
  assert.match(home, /Secure your route to market\./);
  assert.match(home, /Choose the bid you can deliver\./);
  assert.match(home, /Make the Gate 2 call with confidence\./);
  assert.match(home, /Move projects to financial close\./);
  assert.match(home, /Your team decides awards, risk and FID/);
  assert.match(home, /Your team owns strategy, pricing and commitments/);
  assert.match(home, /workstreams-preview\.css\?v=6/);
  assert.match(home, /project-journey\.css\?v=2/);
  assert.match(css, /\.wx-win\+\.wx-win\{width:auto;margin:14px 0 0 12%\}/);
  assert.match(css, /max-width:800px\)\{[\s\S]*\.wx-win\+\.wx-win\{width:100%;margin:14px 0 0\}/);
  assert.match(css, /\.wx-stack thead\{display:none\}/);
  assert.match(js, /data-journey-tab/);
  assert.doesNotMatch(js, /data-wx-accordion/);
  assert.match(js, /ArrowRight/);
  assert.match(js, /aria-selected/);
  assert.match(js, /Home/);
  assert.match(js, /End/);
});
