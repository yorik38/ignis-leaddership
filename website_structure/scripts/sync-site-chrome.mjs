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
      '<span class="hero-sans">Make AI change how</span><span class="gradient-word hero-serif">commercial work runs.</span>',
      '<span class="hero-sans hero-opening">Make commercial</span> <span class="hero-sans hero-work">work</span> <span class="gradient-word hero-serif">with AI.</span>',
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
      'Energy <span>·</span> Infrastructure <span>·</span> Industrial',
    );
    html = html.replace(
      'Energy <span>·</span> Industrial <span>·</span> Construction',
      'Energy <span>·</span> Infrastructure <span>·</span> Industrial',
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

  if (page === "index.html") {
    html = html.replace(
      'I help commercial and transformation leaders in energy, industrial and construction redesign the work they do today and develop the services and offers AI makes viable next.',
      'I help commercial and transformation leaders in the energy, infrastructure and industrial sectors use AI to win work, deliver work and create new value to sell.',
    );
    html = html.replace(
      'I help commercial and transformation leaders in energy, infrastructure, industrial and construction use AI to win work, deliver work and create new value to sell.',
      'I help commercial and transformation leaders in the energy, infrastructure and industrial sectors use AI to win work, deliver work and create new value to sell.',
    );
    html = html.replace(
      '<h3>Productivity without<br>commercial design</h3><p>Teams experiment with tools. Central functions run pilots. Tasks move faster, but evidence, decision rights, customer value and the offer itself remain unchanged.</p>',
      '<h3>Improve how you<br>win and deliver work</h3><p>Teams experiment with tools. Tasks move faster, but the commercial process, decision rights and customer commitments remain unchanged.</p>',
    );
    html = html.replace(
      '<h3>Commercial transformation</h3><p>AI is designed into the operating model or customer offer. The business can deliver expertise, insight or outcomes that were previously too costly, slow or difficult to provide.</p>',
      '<h3>Create new value<br>to sell</h3><p>AI is designed into the operating model or customer offer, making expertise, insight or outcomes viable at a scale that was previously too costly, slow or difficult.</p>',
    );
    html = html.replace(
      '<h3>Work better.</h3><p class="service-summary">Make today’s commercial work more effective, governed and scalable.</p>',
      '<h3>Win work.<br>Deliver work.</h3><p class="service-summary">Make existing commercial work more effective, governed and scalable.</p>',
    );
    html = html.replace(
      /<section class="band band-dark services route-services" id="routes">.*?<\/section>(?=\s*<section class="band brochure-band">)/s,
      `<section class="band band-dark services route-services" id="routes"><div class="wrap"><div class="services-intro"><p class="section-label section-label-dark">Ways to start</p><div class="services-intro-copy"><h2>Start with the commercial opportunity. Or start with the work already under pressure.</h2></div></div><div class="services-desks"><a class="service-row route-adoption" href="/commercial-ai-adoption"><span class="service-eyebrow">Commercial AI adoption</span><div class="service-main"><h3>Win work.<br>Deliver work.</h3><div class="service-copy"><p class="service-description">Redesign how teams win work and carry commercial commitments into delivery with governed human–AI workflows.</p><p class="service-benefit">Move faster while keeping evidence, judgement and accountability connected.</p><span class="service-view">Explore adoption <span aria-hidden="true">▶</span></span></div></div></a><a class="service-row route-transformation" href="/commercial-transformation"><span class="service-eyebrow">Commercial transformation</span><div class="service-main"><h3>Sell differently.</h3><div class="service-copy"><p class="service-description">Develop AI-enabled services, offers and delivery models from the expertise and insight your business already holds.</p><p class="service-benefit">Give customers new value to buy, with a model your team can deliver and govern.</p><span class="service-view">Explore transformation <span aria-hidden="true">▶</span></span></div></div></a></div></div></section>`,
    );
    html = html.replace(
      '<h2>How do you move AI<br><span class="serif-accent">from experiment to commercial value?</span></h2><p>A practical guide to choosing the opportunity, designing the human-agent system and keeping people accountable.</p>',
      '<h2>A practical guide to governed AI<br><span class="serif-accent">for bids and tenders.</span></h2><p>Choose a useful commercial workflow, design the human-agent system and keep people accountable.</p>',
    );
  }

  if (page === "commercial-ai-adoption.html") {
    html = html.replaceAll(
      'Commercial AI Adoption for Commercial Teams | Ignis Leadership',
      'Commercial AI Adoption | Ignis Leadership',
    );
    html = html.replaceAll(
      'Turn existing commercial work into governed human-agent systems, from business development and bids to mobilisation and handover.',
      'Use governed AI to win work, deliver commercial commitments and strengthen the customer journey.',
    );
    html = html.replace(
      'Make AI part of how</span><span class="gradient-word hero-serif">commercial work gets done.',
      'Make AI part of how you</span><span class="gradient-word hero-serif">win and deliver work.',
    );
    html = html.replace(
      'Redesign existing commercial work as governed human-agent systems, so teams can move faster without losing the evidence, judgement and authority that matter.',
      'Use governed human-agent systems to improve how commercial teams win work, carry commitments into delivery and retain the judgement that matters.',
    );
    html = html.replace('See the commercial front end', 'See the commercial lifecycle');
    html = html.replace(
      /<section class="band band-dark lifecycle-band" id="commercial-front-end">.*?<\/section>(?=\s*<section class="band band-paper foundation-band">)/s,
      `<section class="band band-dark lifecycle-band" id="commercial-front-end"><div class="wrap"><div class="lifecycle-heading"><p class="section-label">Win work. Deliver work.</p><h2>Strengthen the commercial thread<br>from first signal to delivery.</h2><p class="lifecycle-summary">Commercial AI adoption is not one fixed linear process. It makes the work of winning, committing to and delivering commercial value more connected, governed and repeatable.</p></div><div class="capability-list"><article class="capability-item"><span class="slash-marker" aria-hidden="true">/</span><div class="stage-value"><h3>Win work</h3><p>Build a shared picture of accounts, opportunities, requirements and the route to a credible decision.</p></div><div class="agent-work"><p class="agent-work-label">Where AI can help</p><ul class="agent-activities"><li>Market signals and account context</li><li>Opportunity qualification</li><li>Requirements and evidence mapping</li></ul></div></article><article class="capability-item"><span class="slash-marker" aria-hidden="true">/</span><div class="stage-value"><h3>Commit with confidence</h3><p>Keep strategy, evidence, risk and commercial authority connected as the team develops an offer, response or commercial position.</p></div><div class="agent-work"><p class="agent-work-label">Where AI can help</p><ul class="agent-activities"><li>Strategy and decision preparation</li><li>Trusted evidence retrieval</li><li>Coordination and assurance</li></ul></div></article><article class="capability-item"><span class="slash-marker" aria-hidden="true">/</span><div class="stage-value"><h3>Deliver work</h3><p>Carry the reasoning, commitments and controls from commercial decision through mobilisation, delivery and the next customer conversation.</p></div><div class="agent-work"><p class="agent-work-label">Where AI can help</p><ul class="agent-activities"><li>Approval and commitment trails</li><li>Mobilisation and handover actions</li><li>Evidence-linked customer continuity</li></ul></div></article></div></div></section>`,
    );
    html = html.replace(
      '<h2>Bid and Tender are where Ignis has depth today.</h2><p class="section-answer">Both involve high-stakes commercial decisions, fragmented evidence and a commitment that must survive the move into delivery.</p>',
      '<h2>Bid and Tender are proven places to start.</h2><p class="section-answer">They involve high-stakes commercial decisions, fragmented evidence and commitments that must survive the move into delivery. <a class="inline-link" href="/case-study">See how a commercial capability compounds.</a></p>',
    );
  }

  if (page === "commercial-transformation.html") {
    html = html.replaceAll(
      'AI-Enabled Commercial Transformation | Ignis Leadership',
      'Commercial Transformation | Ignis Leadership',
    );
  }

  if (page === "case-study.html") {
    html = html.replaceAll('Bid &amp; Tender Outcomes | Ignis Leadership', 'How Commercial AI Capability Compounds | Ignis Leadership');
    html = html.replaceAll('Bid and Tender Outcomes | Ignis Leadership', 'How Commercial AI Capability Compounds | Ignis Leadership');
    html = html.replaceAll(
      'See how Ignis starts with one governed capability, proves it on real bid or tender work and scales it without losing control.',
      'See how a governed commercial capability grows from one live pressure point without losing human control.',
    );
    html = html.replaceAll(
      'Start with one governed bid or tender capability. Prove it on real work, connect the next module and scale without losing control.',
      'Start with one commercial pressure point, design the right governed workflow and extend only where the evidence supports it.',
    );
    html = html.replaceAll(
      'How Ignis proves one governed bid or tender capability and scales it without losing human control.',
      'How commercial AI capability can grow from one governed workflow without losing human control.',
    );
    html = html.replace(
      '<p class="section-label">Outcomes</p><h1><span class="hero-sans">Start with one pressure point.</span><span class="gradient-word hero-serif">Build a system that grows with the desk.</span></h1><p>Ignis installs one governed capability around real work, proves it with the team and connects the next module only when the evidence supports it.</p>',
      '<p class="section-label">Commercial AI adoption</p><h1><span class="hero-sans">Start with one commercial pressure.</span><span class="gradient-word hero-serif">Build capability that compounds.</span></h1><p>Map the work, design one governed workflow and support delivery with the team. Extend only where the evidence supports it.</p>',
    );
    html = html.replace(
      '<article><span>01</span><h3>Start small</h3><h4>No platform bet. No wholesale transformation.</h4><p>Begin where capacity, consistency or control is breaking. Audit the work and select one bounded capability that can be tested on a live or recent bid or tender.</p></article><article><span>02</span><h3>Prove it on real work</h3><h4>A useful capability, not an AI demonstration.</h4><p>The pilot runs with the team’s process, documents, evidence and decisions. Its value is measured through the work it changes, not the novelty of the technology.</p></article><article><span>03</span><h3>Connect the next module</h3><h4>Each capability strengthens the next.</h4><p>A Capture module can connect to Pursue and Shape. A Tender Appraisal module can connect to Clarify, Evaluate and Close. Shared foundations prevent every use case from starting again.</p></article><article><span>04</span><h3>Scale without losing control</h3><h4>More agentic work. The same human authority.</h4><p>As the system carries more coordination and production, human gates remain around strategy, price, risk, evaluation, negotiation and final commitments.</p></article><article><span>05</span><h3>Leave capability behind</h3><h4>The system stays with the organisation.</h4><p>Process, ownership, documentation, controls and commercial memory remain on the desk. The team can use, challenge and improve the system without remaining dependent on Ignis.</p></article>',
      '<article><span>01</span><h3>Map the work</h3><h4>Start with a live commercial pressure.</h4><p>See how the work, information, decisions and commitments move today. Identify one bounded opportunity worth taking forward.</p></article><article><span>02</span><h3>Design the model</h3><h4>A useful capability, not an AI demonstration.</h4><p>Define the workflow, evidence, controls and human authority that make the first capability valuable and buildable.</p></article><article><span>03</span><h3>Support delivery</h3><h4>Keep commercial intent intact.</h4><p>Work with the internal team or technology partner while the capability is built, tested and refined on real work.</p></article><article><span>04</span><h3>Extend with evidence</h3><h4>Each capability earns the next.</h4><p>Use what changes in the work to decide whether to connect the next workflow, strengthen the controls or stop.</p></article><article><span>05</span><h3>Leave capability behind</h3><h4>The organisation keeps the learning.</h4><p>Process, ownership, documentation, controls and commercial memory remain with the team to use, challenge and improve.</p></article>',
    );
    html = html.replace(
      'The output is not a demo or another login. It is a governed capability installed on the commercial desk, with the workflow and memory left with the team.',
      'The output is not a demo or another login. It is a governed capability with its workflow, controls and commercial memory left with the team.',
    );
    html = html.replace(
      /<section class="band band-paper outcomes-system" id="how-it-scales">.*?<\/section>(?=\s*<section class="band band-tint designed-outcomes">)/s,
      `<section class="band band-paper outcomes-system" id="how-it-scales"><div class="wrap"><div class="outcomes-system-intro"><p class="section-label">From first workflow to capability</p><div><h2>Small enough to prove.<br><span class="serif-accent">Designed to compound.</span></h2><p>Each capability starts with real work. Shared process, knowledge and controls mean the next one begins from a stronger foundation.</p></div></div><div class="outcomes-system-grid"><article class="outcomes-system-step"><span>01</span><h3>Map the work</h3><h4>Start with a live commercial pressure.</h4><p>See how the work, information, decisions and commitments move today. Identify one bounded opportunity worth taking forward.</p></article><article class="outcomes-system-step"><span>02</span><h3>Design the model</h3><h4>A useful capability, not an AI demonstration.</h4><p>Define the workflow, evidence, controls and human authority that make the first capability valuable and buildable.</p></article><article class="outcomes-system-step"><span>03</span><h3>Support delivery</h3><h4>Keep commercial intent intact.</h4><p>Work with the internal team or technology partner while the capability is built, tested and refined on real work.</p></article><article class="outcomes-system-step"><span>04</span><h3>Extend with evidence</h3><h4>Each capability earns the next.</h4><p>Use what changes in the work to decide whether to connect the next workflow, strengthen the controls or stop.</p></article><article class="outcomes-system-step"><span>05</span><h3>Leave capability behind</h3><h4>The organisation keeps the learning.</h4><p>Process, ownership, documentation, controls and commercial memory remain with the team to use, challenge and improve.</p></article></div></div></section>`,
    );
  }

  if (page === "bid.html" || page === "tender.html") {
    html = html.replace('<p class="section-label">How Ignis installs it</p>', '<p class="section-label">How Ignis helps</p>');
    html = html.replace('Here is what the Pilot stage looks like in practice.', 'The route is the same as the wider Ignis approach: map the work, design the model and support delivery.');
    html = html.replace('<article><span>01</span><h3>Audit</h3><p>See how work, decisions and information move today.</p></article>', '<article><span>01</span><h3>Map</h3><p>See how work, decisions and information move today.</p></article>');
    html = html.replace('<article><span>01</span><h3>Audit</h3><p>See how packages, information and decisions move today.</p></article>', '<article><span>01</span><h3>Map</h3><p>See how packages, information and decisions move today.</p></article>');
    html = html.replace('<article><span>02</span><h3>Redesign</h3><p>Define the right division of work between people and agents.</p></article>', '<article><span>02</span><h3>Design</h3><p>Define the right division of work between people and agents.</p></article>');
    html = html.replace('<article><span>03</span><h3>Workflow</h3><p>Build the agentic workflow, evidence trail and human gates.</p></article>', '<article><span>03</span><h3>Support delivery</h3><p>Support the workflow, evidence trail and human gates through build and test.</p></article>');
    html = html.replace('<article><span>04</span><h3>Embed</h3><p>Put ownership, documentation and controls on the desk.</p></article>', '<article><span>04</span><h3>Embed</h3><p>Put ownership, documentation and controls with the team.</p></article>');
    html = html.replace('<article><span>05</span><h3>Adopt</h3><p>Train people to use, challenge and improve the system.</p></article>', '<article><span>05</span><h3>Adopt</h3><p>Help people use, challenge and improve the system.</p></article>');
    html = html.replace(
      'We start with an audit to find where capacity or control breaks. From there, we shape a bounded pilot that makes sense for the team, prove it on real work and scale only when the evidence supports it.',
      'We map where capacity or control breaks, design a bounded capability around the real work and support delivery with the team. The next move is guided by evidence, not a fixed rollout plan.',
    );
  }

  if (page.startsWith("insights/") || page.startsWith("resources/")) {
    html = html.replaceAll('the <a href="/#services">Audit step</a>', 'the <a href="/commercial-ai-adoption">Map stage</a>');
    html = html.replaceAll('the <a href="/#services">engagement audit</a>', 'the <a href="/commercial-ai-adoption">mapping stage</a>');
  }

  if (page === "rfp-software-vs-agentic-bid-system.html") {
    html = html.replace(
      '<article><span>01</span><h3>Audit</h3><p>Map the process, decisions, evidence and controls. Identify whether the gap needs software, a bespoke workflow or both.</p></article><article><span>02</span><h3>Pilot</h3><p>Build and test one bounded human-agent workflow around approved evidence and named decision gates.</p></article><article><span>03</span><h3>Scale</h3><p>Measure the outcome and review burden. Keep what works, strengthen the controls and connect the next part of the work.</p></article>',
      '<article><span>01</span><h3>Map</h3><p>Map the process, decisions, evidence and controls. Identify whether the gap needs software, a bespoke workflow or both.</p></article><article><span>02</span><h3>Design</h3><p>Define one bounded human-agent workflow around approved evidence and named decision gates.</p></article><article><span>03</span><h3>Support delivery</h3><p>Support the build and test, measure the review burden and decide the next move from evidence.</p></article>',
    );
  }

  if (page === "contact.html") {
    html = html.replaceAll('Contact Ignis Leadership | Bid &amp; Tender Consultancy', 'Contact Ignis Leadership | Commercial AI');
    html = html.replaceAll(
      'Talk to Ignis Leadership about the first governed bid or tender capability worth installing on your commercial desk.',
      'Talk to Ignis Leadership about improving commercial work or creating a new AI-enabled commercial offer.',
    );
    html = html.replaceAll(
      'Start with the pressure point. Identify the first governed bid or tender capability worth proving.',
      'Start with a commercial pressure or opportunity. Identify the next governed move worth making.',
    );
    html = html.replace(
      'One conversation. We name the capability. We decide whether there is a small, governed system worth putting on your desk.',
      'One conversation. We identify whether the next move is to win work, deliver work or create new value to sell.',
    );
    html = html.replace(
      'Tell me where capacity, control or continuity breaks on the next bid or tender.',
      'Tell me where commercial work is under pressure, or where AI could make a new customer offer viable.',
    );
  }

  html = html.replace(/\/assets\/capability\.css\?v=\d+/g, "/assets/capability.css?v=125");
  if (!html.includes('/assets/capability.css?v=125')) {
    html = html.replace("</head>", '<link rel="stylesheet" href="/assets/capability.css?v=125">\n</head>');
  }
  let capabilityStyles = 0;
  html = html.replace(/<link rel="stylesheet" href="\/assets\/capability\.css\?v=125">\s*/g, (match) => {
    capabilityStyles += 1;
    return capabilityStyles === 1 ? match : '';
  });

  html = html.replace(/\/assets\/site-chrome\.css\?v=\d+/g, "/assets/site-chrome.css?v=37");
  if (!html.includes('/assets/site-chrome.css?v=37')) {
    html = html.replace("</head>", '<link rel="stylesheet" href="/assets/site-chrome.css?v=37">\n</head>');
  }
  let chromeStyles = 0;
  html = html.replace(/<link rel="stylesheet" href="\/assets\/site-chrome\.css\?v=37">\s*/g, (match) => {
    chromeStyles += 1;
    return chromeStyles === 1 ? match : '';
  });

  html = html.replace(/\/assets\/capability\.js\?v=\d+/g, "/assets/capability.js?v=12");
  if (!html.includes('/assets/capability.js?v=12')) {
    html = html.replace("</body>", '<script src="/assets/capability.js?v=12"></script>\n</body>');
  }

  await writeFile(url, html);
  process.stdout.write(`${relative(new URL("..", import.meta.url).pathname, url.pathname)}\n`);
}
