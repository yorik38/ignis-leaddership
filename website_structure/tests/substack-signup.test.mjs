import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(root, '..');
const successCopy = 'Taking you to Substack to confirm your subscription.';
const substackBase = 'https://connectingenergy.substack.com/subscribe';

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (entry === 'backups' || entry === '_backup' || entry === 'node_modules' || entry === 'tests') continue;
    if (statSync(path).isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

function extractHelpers() {
  const source = readFileSync(join(root, 'assets/capability.js'), 'utf8');
  const start = source.indexOf('function substackSubscribeUrl');
  const end = source.indexOf('document.querySelectorAll("[data-community-form]', start);
  assert.ok(start >= 0 && end > start, 'capability.js should declare Substack helpers beside the signup binder');
  return new Function(`${source.slice(start, end)} return {substackSubscribeUrl, isSignupClientError};`)();
}

const {substackSubscribeUrl, isSignupClientError} = extractHelpers();
const pages = walk(root).filter((path) => path.endsWith('.html') && !path.includes('/partials/'));
const signupPages = pages.filter((path) => readFileSync(path, 'utf8').includes('class="signal-signup-form"'));
const capability = readFileSync(join(root, 'assets/capability.js'), 'utf8');
const whitepaper = readFileSync(join(root, 'assets/whitepaper.js'), 'utf8');
const contact = readFileSync(join(root, 'contact.html'), 'utf8');
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));

test('Signal signups still post to HubSpot, then open Substack in the same tab', () => {
  assert.equal(substackSubscribeUrl('Ada@Developer.co.uk'), `${substackBase}?email=${encodeURIComponent('Ada@Developer.co.uk')}`);
  assert.equal(substackSubscribeUrl('  name+signal@developer.co.uk '), `${substackBase}?email=${encodeURIComponent('name+signal@developer.co.uk')}`);
  assert.equal(isSignupClientError(422), true);
  assert.equal(isSignupClientError(429), true);
  assert.equal(isSignupClientError(400), true);
  assert.equal(isSignupClientError(200), false);
  assert.equal(isSignupClientError(502), false);
  assert.equal(isSignupClientError(0), false);
  assert.equal(isSignupClientError(undefined), false);

  assert.match(capability, /timer=window\.setTimeout\(proceedToSubstack,1500\)/);
  assert.match(capability, /window\.location\.assign\(substackSubscribeUrl\(email\)\)/);
  assert.match(capability, /if\(isSignupClientError\(error&&error\.status\)\)failOnPage\(error\);else proceedToSubstack\(\)/);
  assert.match(capability, /fetch\(form\.action,/);
  assert.match(capability, /action==="\/api\/subscribe"/);
  assert.match(capability, /gtag\("event","sign_up",\{method:"newsletter"/);
  assert.doesNotMatch(capability, /window\.open\(/);
  assert.match(capability, /Taking you to Substack to confirm your subscription\./);

  assert.ok(signupPages.length >= 19, `expected Signal forms across the site, found ${signupPages.length}`);
  for (const path of signupPages) {
    const html = readFileSync(path, 'utf8');
    const rel = relative(root, path);
    assert.match(html, /class="signal-signup-form"[^>]*action="\/api\/subscribe"/, rel);
    assert.match(html, /class="signal-signup-success"[^>]*tabindex="-1"[^>]*>[\s\S]*Taking you to Substack to confirm your subscription\./, rel);
    assert.doesNotMatch(html, /You're in\. Signal arrives weekly, plus the monthly Market Monitor\./, rel);
    assert.match(html, /capability\.js\?v=22/, rel);
    assert.doesNotMatch(html, /capability\.js\?v=21/, rel);
  }

  const rail = readFileSync(join(root, 'partials/article-signal-rail.html'), 'utf8');
  assert.match(rail, /action="\/api\/subscribe"/);
  assert.match(rail, /Taking you to Substack to confirm your subscription\./);
});

test('white paper and contact enquiry forms are not sent to Substack', () => {
  assert.doesNotMatch(whitepaper, /connectingenergy\.substack\.com|substackSubscribeUrl|proceedToSubstack/);

  assert.match(contact, /js-eu1\.hsforms\.net\/forms\/embed\/v2\.js/);
  const contactForm = contact.slice(contact.indexOf('id="hubspot-contact-form"'), contact.indexOf('class="signal-signup-form"'));
  assert.doesNotMatch(contactForm, /api\/subscribe|signal-signup-form/);
});

test('pages that load capability.js request the bumped file, and no CSP blocks Substack', () => {
  const loaders = pages.filter((path) => readFileSync(path, 'utf8').includes('capability.js?v='));
  assert.ok(loaders.length >= 20);
  for (const path of loaders) {
    const text = readFileSync(path, 'utf8');
    const rel = relative(repo, path);
    assert.match(text, /capability\.js\?v=22/, rel);
    assert.doesNotMatch(text, /capability\.js\?v=21/, rel);
  }
  const headerValues = (vercel.headers || []).flatMap((rule) => (rule.headers || []).map((item) => `${item.key}:${item.value}`));
  assert.equal(headerValues.some((value) => /content-security-policy/i.test(value)), false);
  assert.equal(successCopy.includes('—') || successCopy.includes('–') || successCopy.includes('book a call') || /FORGE/i.test(successCopy), false);
});
