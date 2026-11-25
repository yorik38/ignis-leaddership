import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const home = readFileSync(join(site, 'index.html'), 'utf8');
const css = readFileSync(join(site, 'assets/workstreams-preview.css'), 'utf8');
const timeGoes = readFileSync(join(site, 'assets/time-goes.css'), 'utf8');
const journey = readFileSync(join(site, 'assets/project-journey.css'), 'utf8');
const js = readFileSync(join(site, 'assets/working-examples.js'), 'utf8');

test('the working examples block left the homepage with the advisory content', () => {
  assert.doesNotMatch(home, /data-working-examples|id="workstreams"|working-examples\.js/);
});
