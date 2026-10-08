import { readFile, writeFile } from "node:fs/promises";
import { relative } from "node:path";

const root = new URL("../", import.meta.url);
const pages = [
  "index.html",
  "about.html",
  "bid.html",
  "tender.html",
  "case-study.html",
  "insights.html",
  "contact.html",
  "privacy.html",
  "terms.html",
  "archive.html",
  "resources.html",
  "discovery.html",
  "commercial-ai-readiness.html",
  "commercial-ai-adoption.html",
  "commercial-transformation.html",
  "rfp-software-vs-agentic-bid-system.html",
  "insights/why-does-every-bid-feel-like-starting-again.html",
  "insights/the-proposal-is-becoming-the-easy-part.html",
  "insights/bids-are-lost-before-the-writing-starts.html",
  "insights/why-do-tenders-inherit-decisions-without-their-history.html",
  "insights/ai-will-expose-your-slowest-bid-decision.html",
  "insights/is-commercial-work-too-judgement-heavy-for-ai-agents.html",
  "insights/when-do-tender-clarifications-become-a-second-specification.html",
  "insights/why-do-unclear-tenders-produce-incomparable-bids.html",
  "insights/why-is-your-tender-team-still-overloaded.html",
  "insights/your-team-uses-ai-does-the-business.html",
  "resources/choose-first-ai-bid-use-case.html",
  "resources/bid-agent-maturity.html",
  "resources/ai-augmented-bid-practice.html",
];

const communityPages = new Map([
  ["index.html", "home"],
  ["bid.html", "bid"],
  ["tender.html", "tender"],
  ["insights.html", "insights"],
]);

const header = (await readFile(new URL("../partials/site-header.html", import.meta.url), "utf8")).trim();
const footer = (await readFile(new URL("../partials/site-footer.html", import.meta.url), "utf8")).trim();
const communityTemplate = (await readFile(new URL("../partials/community-signup.html", import.meta.url), "utf8")).trim();

if (!header || !footer || !communityTemplate) throw new Error("A shared site template is empty");

for (const page of pages) {
  const url = new URL(page, root);
  let html = await readFile(url, "utf8");

  if (/<main\b/.test(html)) {
    html = html.replace(
      /(?:<a class="skip-link".*?<\/a>\s*)?<header(?: class="site-header")?>.*?(?=<main\b)/s,
      `${header.trim()}\n`,
    );
  } else {
    html = html.replace(
      /(?:<a class="skip-link".*?<\/a>\s*)?<header(?: class="site-header")?>.*?(?=<section class="legal-page")/s,
      `${header.trim()}\n<main id="main">\n`,
    );
    html = html.replace(/<\/section>\s*(?=<footer class="site-footer">)/, "</section>\n</main>\n");
  }
  html = html.replace(/<main(?![^>]*\bid=)/, '<main id="main"');
  html = html.replace(/<footer(?: class="[^"]*")?>.*?<\/footer>/s, footer);

  const communityFormId = communityPages.get(page);
  if (communityFormId) {
    const community = communityTemplate.replaceAll("{{FORM_ID}}", communityFormId);
    if (!/<section class="band band-dark home-community">.*?<\/section>/s.test(html)) {
      throw new Error(`Community signup section was not found in ${page}`);
    }
    html = html.replace(/<section class="band band-dark home-community">.*?<\/section>/s, community);
  }

  if (page === "index.html") {
    html = html.replace(
      'Make AI change how commercial work runs and what your business can offer.',
      'Make AI change how commercial work runs.',
    );
    html = html.replace(
      '<span class="hero-sans">Make AI change how commercial work runs</span><span class="gradient-word hero-serif">and what your business can offer.</span>',
      '<span class="hero-sans">Make AI change how</span><span class="gradient-word hero-serif">commercial work runs.</span>',
    );
    html = html.replace(
      '<h3>Productivity without a commercial design</h3>',
      '<h3>Productivity without<br>commercial design</h3>',
    );
    html = html.replace(
      'Energy <span>·</span> Infrastructure <span>·</span> Industrial <span>·</span> Construction',
      'Energy <span>·</span> Industrial <span>·</span> Construction',
    );
    html = html.replace(
      '<h2>Turn AI ambition into <span class="serif-accent">commercial advantage.</span></h2>',
      '<h2>Turn AI ambition into <span class="gradient-word serif-accent">commercial advantage.</span></h2>',
    );
    html = html.replace(
      /<section class="band band-paper specialist-applications">.*?<\/section>(?=\s*<section class="band brochure-band">)/s,
      '<section class="band band-paper specialist-applications"><div class="wrap"><div class="section-heading"><p class="section-label">A practical starting point</p><div><h2>Start with the opportunity. Or start with the work.</h2><p class="section-answer">Explore what AI could make commercially viable, or redesign the commercial process you already have.</p></div></div><div class="outcomes-preview"><a class="outcome-preview-card" href="/commercial-transformation"><p class="outcome-kicker">Commercial transformation</p><h2>Explore the opportunity.</h2><p>Find the customer value, service or delivery model that AI could make viable.</p><span class="outcome-card-link">Explore Commercial transformation <span aria-hidden="true">↗</span></span></a><a class="outcome-preview-card" href="/commercial-ai-adoption"><p class="outcome-kicker">Commercial AI adoption</p><h2>Adopt the capability.</h2><p>Map and govern the existing commercial work where AI can create value now.</p><span class="outcome-card-link">Explore Commercial AI adoption <span aria-hidden="true">↗</span></span></a></div></div></section>',
    );
    if (!html.includes('What stays human?')) {
      html = html.replace(
        '</details></div></div></section>\n    <section class="band band-paper closing-band closing-band-light">',
        '</details><details class="faq-item"><summary>Where should we start?</summary><div class="faq-answer"><p>Start with a live commercial pressure or opportunity. Map the value, feasibility and controls, then choose one bounded next move.</p></div></details><details class="faq-item"><summary>Can we use our existing technology?</summary><div class="faq-answer"><p>Usually, yes. The work starts with the information and systems you already have, replacing or adding technology only where the evidence requires it.</p></div></details><details class="faq-item"><summary>What stays human?</summary><div class="faq-answer"><p>Commercial judgement, customer commitments, risk decisions and exceptions remain human-owned. Agents support defined tasks with clear evidence and escalation points.</p></div></details></div></div></section>\n    <section class="band band-paper closing-band closing-band-light">',
      );
    }
  }

  if (page === "bid.html") {
    html = html.replace(
      '<p class="section-label">Bid</p><h1>',
      '<p class="section-label">Commercial AI adoption · Bid</p><h1>',
    );
    if (!html.includes('class="band band-tint specialist-context"')) {
      html = html.replace(
        '<section class="band band-paper closing-band closing-band-light">',
        '<section class="band band-tint specialist-context"><div class="wrap statement-grid"><p class="section-label">Where this fits</p><div><h2>Bid is a specialist application of <span class="serif-accent">Commercial AI adoption.</span></h2><p class="lead-muted">Explore the broader commercial workflow, then use the bid desk where the pressure and opportunity are most immediate.</p><a class="text-link" href="/commercial-ai-adoption">Explore Commercial AI adoption <span aria-hidden="true">↗</span></a></div></div></section>\n<section class="band band-paper closing-band closing-band-light">',
      );
    }
  }

  if (page === "tender.html") {
    html = html.replace(
      '<p class="section-label">Tender</p><h1>',
      '<p class="section-label">Commercial AI adoption · Tender</p><h1>',
    );
    if (!html.includes('class="band band-tint specialist-context"')) {
      html = html.replace(
        '<section class="band band-paper closing-band closing-band-light">',
        '<section class="band band-tint specialist-context"><div class="wrap statement-grid"><p class="section-label">Where this fits</p><div><h2>Tender is a specialist application of <span class="serif-accent">Commercial AI adoption.</span></h2><p class="lead-muted">Explore the broader commercial workflow, then use the tender desk where the pressure and opportunity are most immediate.</p><a class="text-link" href="/commercial-ai-adoption">Explore Commercial AI adoption <span aria-hidden="true">↗</span></a></div></div></section>\n<section class="band band-paper closing-band closing-band-light">',
      );
    }
  }

  html = html.replace(/\/assets\/site-chrome\.css\?v=\d+/g, "/assets/site-chrome.css?v=22");
  if (!html.includes('/assets/site-chrome.css?v=22')) {
    html = html.replace("</head>", '<link rel="stylesheet" href="/assets/site-chrome.css?v=22">\n</head>');
  }

  html = html.replace(/\/assets\/capability\.js\?v=\d+/g, "/assets/capability.js?v=12");
  if (!html.includes('/assets/capability.js?v=12')) {
    html = html.replace("</body>", '<script src="/assets/capability.js?v=12"></script>\n</body>');
  }

  await writeFile(url, html);
  process.stdout.write(`${relative(new URL("..", import.meta.url).pathname, url.pathname)}\n`);
}
