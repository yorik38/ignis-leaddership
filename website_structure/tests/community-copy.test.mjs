import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const expected = 'Practical notes on moving energy projects from last-mile development to financial close.';

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  });
}

test('shared community copy reflects the commercial-close positioning on every page', () => {
  const template = readFileSync(join(site, 'partials/community-signup.html'), 'utf8');
  assert.ok(template.includes(`<h2>${expected}</h2>`));

  for (const path of htmlFiles(site)) {
    const html = readFileSync(path, 'utf8');
    if (!html.includes('class="band band-dark home-community"')) continue;
    assert.ok(html.includes(`<h2>${expected}</h2>`), `${path} has outdated community copy`);
  }
});
