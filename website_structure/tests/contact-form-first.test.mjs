import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(site, path), 'utf8');

test('Contact page leads with one introduction and the existing form', () => {
  const contact = read('contact.html');
  assert.match(contact, /<body class="contact-page" data-header="light">/);
  assert.match(contact, /<main id="main">\s*<section class="band band-paper contact-section">/);
  assert.match(contact, /<h1>Start the conversation\.<\/h1>/);
  assert.match(contact, /the next gate you need to reach/);
  assert.doesNotMatch(contact, /Where does it hurt|class="page-hero|class="band band-dark home-community"/);
  assert.equal((contact.match(/<h1\b/g) || []).length, 1);
  assert.equal((contact.match(/<form class="contact-form"/g) || []).length, 1);
  assert.match(contact, /<form class="contact-form" action="\/api\/contact" method="post" data-contact-form>/);
  for (const field of ['name', 'email', 'phone', 'discovery-source', 'message', 'newsletter-opt-in']) {
    assert.ok(contact.includes(`id="${field}"`), `${field} missing`);
  }
  assert.match(read('scripts/sync-site-chrome.mjs'), /if \(page === "contact\.html"\) \{\s*html = html\.replace\(\/<section class="band band-dark home-community">/);
});
