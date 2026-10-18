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
  assert.match(contact, /<form class="contact-form" action="\/api\/contact" method="post" data-contact-form aria-describedby="contact-required-note">/);
  for (const field of ['name', 'company', 'role', 'email', 'topic', 'phone', 'discovery-source', 'message', 'newsletter-opt-in']) {
    assert.ok(contact.includes(`id="${field}"`), `${field} missing`);
  }
  assert.match(contact, /All fields required unless marked optional/);
  assert.match(contact, /What's on your desk right now\?/);
  assert.match(contact, /name="topic" required aria-required="true"/);
  assert.match(contact, /value="gate2">Gate 2: keep-or-kill decisions/);
  assert.match(contact, /value="ar8">AR8 bid/);
  assert.match(contact, /value="bid_tender">Bid and tender work/);
  assert.match(contact, /value="new_offers">New AI-enabled offers/);
  assert.match(contact, /value="other">Something else/);
  assert.match(contact, /id="company" name="company" autocomplete="organization" placeholder="e\.g\. developer or IPP name" required aria-required="true"/);
  assert.match(contact, /id="role" name="role" autocomplete="organization-title" placeholder="e\.g\. CEO, Commercial Director"/);
  assert.match(contact, /Phone \(optional\)/);
  assert.match(contact, /placeholder="For a quicker call back"/);
  assert.match(contact, /What's the decision or bid in front of you\?/);
  assert.match(contact, /Two sites approaching Gate 2 and we need a clear keep-or-kill case by March\./);
  assert.doesNotMatch(contact, /<label for="message">Description<\/label>/);
  assert.match(contact, /How did you first hear about Ignis\? \(optional\)/);
  assert.ok(contact.indexOf('id="message"') < contact.indexOf('id="discovery-source"'));
  assert.match(contact, /Yorik reads every message personally and replies within 2 working days/);
  assert.match(contact, />Send to Yorik</);
  assert.match(contact, /Prefer to talk now\? Book a 30-minute call/);
  assert.match(contact, /We'll use your details only to reply to this enquiry\. See our <a href="\/privacy">Privacy Policy<\/a>/);
  assert.match(contact, /Also send me Signal, the weekly Ignis newsletter\. Unsubscribe any time\./);
  assert.doesNotMatch(contact, /id="newsletter-opt-in"[^>]*checked/);
  assert.match(contact, /Thanks, <span data-contact-first-name><\/span>\. Your message is with Yorik\. He'll reply by email within 2 working days\. Can't wait\? <a href="https:\/\/calendly\.com\/yorik-tisseau-tmff\/bid-capability-diagnostic" data-calendly-link>Book a call now<\/a>/);
  assert.match(contact, /class="button button-teal" href="https:\/\/calendly\.com\/yorik-tisseau-tmff\/bid-capability-diagnostic" data-calendly-link>Book a call<\/a>/);
  assert.match(read('api/contact.js'), /name: "topic", value: topic/);
  assert.match(read('api/contact.js'), /name: "company", value: company/);
  assert.match(read('api/contact.js'), /name: "role", value: role/);
  assert.doesNotMatch(contact, /FORGE|Forge/);
  assert.match(read('scripts/sync-site-chrome.mjs'), /if \(page === "contact\.html"\) \{\s*html = html\.replace\(\/<section class="band band-dark home-community">/);
});
