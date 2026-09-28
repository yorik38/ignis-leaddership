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
  "insights/why-does-every-bid-feel-like-starting-again.html",
  "insights/the-proposal-is-becoming-the-easy-part.html",
  "insights/bids-are-lost-before-the-writing-starts.html",
  "insights/why-do-tenders-inherit-decisions-without-their-history.html",
  "insights/ai-will-expose-your-slowest-bid-decision.html",
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

  html = html.replace(/\/assets\/site-chrome\.css\?v=\d+/g, "/assets/site-chrome.css?v=17");
  if (!html.includes('/assets/site-chrome.css?v=17')) {
    html = html.replace("</head>", '<link rel="stylesheet" href="/assets/site-chrome.css?v=17">\n</head>');
  }

  html = html.replace(/\/assets\/capability\.js\?v=\d+/g, "/assets/capability.js?v=7");
  if (!html.includes('/assets/capability.js?v=7')) {
    html = html.replace("</body>", '<script src="/assets/capability.js?v=7"></script>\n</body>');
  }

  await writeFile(url, html);
  process.stdout.write(`${relative(new URL("..", import.meta.url).pathname, url.pathname)}\n`);
}
