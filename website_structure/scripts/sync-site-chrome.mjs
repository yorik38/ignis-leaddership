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

  const communityFormId = communityPages.get(page) ?? `page-${page.replace(/\.html$/, "").replaceAll("/", "-")}`;
  const community = communityTemplate.replaceAll("{{FORM_ID}}", communityFormId);
  if (/<section class="band band-dark home-community">.*?<\/section>/s.test(html)) {
    html = html.replace(/<section class="band band-dark home-community">.*?<\/section>/s, community);
  } else {
    html = html.replace(/(?=<footer class="site-footer">)/, `${community}\n`);
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
      '<div class="services-intro"><p class="section-label section-label-dark">Services</p><p class="services-lead">Partnering with commercial leaders to turn AI ambition into work that performs and value customers can buy.</p></div>',
      '<div class="services-intro"><p class="section-label section-label-dark">Ways to start</p><div class="services-intro-copy"><h2>Start with the commercial opportunity. Or start with the work already under pressure.</h2><p>Every engagement begins with a live commercial pressure or opportunity and ends with a decision you can act on.</p></div></div>',
    );
    html = html.replace(
      '<p class="section-label section-label-dark">Two routes</p>',
      '<p class="section-label section-label-dark">Ways to start</p>',
    );
    html = html.replace(
      '<p class="section-label section-label-dark">Services</p><p class="services-lead">Partnering with commercial leaders to turn AI ambition into work that performs and value customers can buy.</p>',
      '<p class="section-label section-label-dark">Ways to start</p><div class="services-intro-copy"><h2>Start with the commercial opportunity. Or start with the work already under pressure.</h2><p>Every engagement begins with a live commercial pressure or opportunity and ends with a decision you can act on.</p></div>',
    );
    html = html.replace(/<span class="service-number">0[12]<\/span>/g, '');
    html = html.replace(/<ol class="services-method">.*?<\/ol>/s, '');
    html = html.replace(
      'Map customer needs, commercial processes, expertise, data, systems, decision rights and constraints. Identify where AI can strengthen an existing operation or make a new offer viable.',
      'Map the work, data, governance, systems and decision rights. Identify the priority opportunities, then leave with a commercially grounded AI strategy and roadmap.',
    );
    html = html.replace(
      'Turn the priority into a governed delivery model: the customer proposition, workflow, evidence, human responsibilities, data, controls and delivery requirements.',
      'Turn the priority into a governed model: the proposition, workflow, evidence, human responsibilities, data, controls and a build-ready pilot brief.',
    );
    html = html.replace(
      'Stay involved while an internal team or technology partner builds, tests and refines the system. Protect the commercial intent through implementation and into customer use.',
      'Stay involved while an internal team or technology partner builds, tests and refines the system. Protect the commercial intent, test the pilot and guide adoption into use.',
    );
    html = html.replace(
      'Find the next commercial offer AI makes viable.',
      'Develop commercial innovations: new services, offers and delivery models that AI makes viable.',
    );
    html = html.replace(
      'Ignis defines and protects the commercial requirement. We work with your internal team or technology partner; direct technical delivery can be separately scoped where appropriate.',
      'Ignis defines the commercial requirement, workflow, controls and pilot scope, then supports your internal team or technology partner through delivery. Where appropriate, delivery can be scoped separately.',
    );
    html = html.replace(
      'It is the work of identifying and testing services, offers and delivery models that AI makes commercially viable.',
      'It is the work of identifying, testing and delivering commercial innovations: services, offers and delivery models that AI makes commercially viable.',
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
      /\s*<section class="band band-paper specialist-applications">.*?<\/section>(?=\s*<section class="band brochure-band">)/s,
      '',
    );
    if (!html.includes('What stays human?')) {
      html = html.replace(
        '</details></div></div></section>\n    <section class="band band-paper closing-band closing-band-light">',
        '</details><details class="faq-item"><summary>Where should we start?</summary><div class="faq-answer"><p>Start with a live commercial pressure or opportunity. Map the value, feasibility and controls, then choose one bounded next move.</p></div></details><details class="faq-item"><summary>Can we use our existing technology?</summary><div class="faq-answer"><p>Usually, yes. The work starts with the information and systems you already have, replacing or adding technology only where the evidence requires it.</p></div></details><details class="faq-item"><summary>What stays human?</summary><div class="faq-answer"><p>Commercial judgement, customer commitments, risk decisions and exceptions remain human-owned. Agents support defined tasks with clear evidence and escalation points.</p></div></details></div></div></section>\n    <section class="band band-paper closing-band closing-band-light">',
      );
    }
  }

  if (page === "insights.html") {
    html = html.replaceAll(
      'Bid &amp; Tender AI Insights | Ignis Leadership',
      'Commercial AI Insights | Ignis Leadership',
    );
    html = html.replaceAll(
      'Practical analysis for commercial leaders on agentic AI, bid and tender management, commercial memory, governance and human decision-making.',
      'Practical notes for commercial leaders on AI adoption, transformation, governance and human-agent systems.',
    );
    html = html.replaceAll(
      'Practical analysis of agentic AI, commercial judgement and governance across bids and tenders.',
      'Practical notes on commercial AI adoption, transformation, governance and human-agent systems.',
    );
    html = html.replaceAll(
      '"name":"Bid and Tender AI Insights"',
      '"name":"Commercial AI Insights"',
    );
    html = html.replaceAll(
      'Practical notes on how agentic AI is changing the way teams bid, tender and make commercial decisions.',
      'Practical notes on how agentic AI is changing commercial work, customer value and growth.',
    );
  }

  if (page === "commercial-transformation.html") {
    html = html.replaceAll(
      'Identify and test the services, offers and delivery models AI can make commercially viable, then design the governed system behind them.',
      'Identify and test commercial innovations: the services, offers and delivery models AI can make viable, then design the governed system behind them.',
    );
    html = html.replaceAll(
      'Identify and test the services, offers and delivery models AI can make commercially viable.',
      'Identify and test commercial innovations: the services, offers and delivery models AI can make viable.',
    );
    html = html.replace(
      'Explore the services, offers and delivery models that become possible when expertise, monitoring and decision support can be delivered at a different scale.',
      'Explore the commercial innovations that become possible when expertise, monitoring and decision support can be delivered at a different scale.',
    );
    html = html.replace(
      '<p class="section-label">The opportunity</p>',
      '<p class="section-label">Commercial innovation</p>',
    );
    html = html.replace(
      'Illustrative opportunity patterns',
      'Illustrative innovation patterns',
    );
    html = html.replace(
      'From commercial opportunity to a buildable delivery model.',
      'From commercial innovation to a buildable delivery model.',
    );
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

  if (page === "commercial-ai-adoption.html") {
    html = html.replace(
      '<p class="section-label">The shift</p>',
      '<p class="section-label">Commercial workflow design</p>',
    );
    html = html.replace(
      '<p class="section-label">The work</p>',
      '<p class="section-label">A governed system</p>',
    );
    html = html.replace(
      'Where should AI make commercial work <span class="serif-accent">more valuable first?</span>',
      'Which commercial workflow should AI make <span class="serif-accent">more effective first?</span>',
    );
  }

  html = html.replace(/\/assets\/capability\.css\?v=\d+/g, "/assets/capability.css?v=121");
  if (!html.includes('/assets/capability.css?v=121')) {
    html = html.replace("</head>", '<link rel="stylesheet" href="/assets/capability.css?v=121">\n</head>');
  }

  html = html.replace(/\/assets\/site-chrome\.css\?v=\d+/g, "/assets/site-chrome.css?v=36");
  if (!html.includes('/assets/site-chrome.css?v=36')) {
    html = html.replace("</head>", '<link rel="stylesheet" href="/assets/site-chrome.css?v=36">\n</head>');
  }

  html = html.replace(/\/assets\/capability\.js\?v=\d+/g, "/assets/capability.js?v=12");
  if (!html.includes('/assets/capability.js?v=12')) {
    html = html.replace("</body>", '<script src="/assets/capability.js?v=12"></script>\n</body>');
  }

  await writeFile(url, html);
  process.stdout.write(`${relative(new URL("..", import.meta.url).pathname, url.pathname)}\n`);
}
