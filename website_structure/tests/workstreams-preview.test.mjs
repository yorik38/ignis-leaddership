import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const home = readFileSync(join(site, 'index.html'), 'utf8');

test('the two illustrative workstreams sit between comparison and Sprint', () => {
  const comparison = home.indexOf('class="band band-paper working-comparison"');
  const workstreams = home.indexOf('class="band band-paper workstreams-preview"');
  const sprint = home.indexOf('class="band band-paper engagement-offer sprint-journey"');
  assert.ok(comparison >= 0 && workstreams > comparison && sprint > workstreams);
  assert.match(home, /id="close-workstream-title">Move projects to<br>financial close/);
  assert.match(home, /id="market-workstream-title">Secure your<br>route to market/);
  assert.ok(home.indexOf('id="market-workstream-title"') < home.indexOf('Illustrative auction requirements and offtake terms views'));
  assert.equal((home.match(/class="workstream-visual-note">Illustrative workflow/g) || []).length, 2);
  assert.match(home, /Your team decides awards, risk and FID/);
  assert.match(home, /Your team owns strategy, pricing and commitments/);
});
