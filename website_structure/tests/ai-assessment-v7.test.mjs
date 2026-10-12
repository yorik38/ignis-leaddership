import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assess, scoreSection, stageScope} from "../assets/ai-assessment-v7-model.mjs";

const bank = JSON.parse(readFileSync(new URL("../assets/ai-assessment-v7.json", import.meta.url)));
const all = Object.fromEntries(bank.sections.flatMap(section => section.questions.filter(q => q.type === "likert").map(q => [q.id, "5"])));

test("AI score uses the public URL and redirects the retired roulette path", () => {
  const html = readFileSync(new URL("../ai-score.html", import.meta.url), "utf8");
  const homepage = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.match(html, /rel="canonical" href="https:\/\/www\.ignisleadership\.com\/ai-score"/);
  assert.match(html, /property="og:url" content="https:\/\/www\.ignisleadership\.com\/ai-score"/);
  assert.match(homepage, /href="\/ai-score">See your AI score/);
  assert.ok(vercel.redirects.some(route => route.source === "/ai-roulette" && route.destination === "/ai-score" && route.permanent));
  assert.ok(vercel.redirects.some(route => route.source === "/ai-roulette.html" && route.destination === "/ai-score" && route.permanent));
});

test("landing stays concise while answer-sharing is disclosed before the questions", () => {
  const html = readFileSync(new URL("../ai-score.html", import.meta.url), "utf8");
  const controller = readFileSync(new URL("../assets/ai-assessment-v7.js", import.meta.url), "utf8");
  const landing = html.match(/<section class="ar-landing"[\s\S]*?<\/section>/)?.[0];
  assert.ok(landing);
  assert.match(landing, /Instant result · No sign-up required/);
  assert.match(landing, /Is AI built into the work that moves your projects forward\?/);
  assert.match(landing, /See where your team uses AI today, what limits reliable use, and what to build next\./);
  assert.match(landing, /Governed AI capability/);
  assert.doesNotMatch(landing, /Indicative result, not a benchmark/);
  assert.match(landing, /Individual contributor/);
  assert.match(landing, /Team leader/);
  assert.match(landing, /Business leader/);
  assert.doesNotMatch(landing, /When you finish, Ignis receives your answers/);
  assert.match(controller, /index === 0 \? '<p class="ar-caveat">When you finish, Ignis receives your answers/);
  assert.match(controller, /When you finish, your answers and result are shared with Ignis/);
});

test("reader perspective changes wording, not the score or next build", () => {
  const answers = {...all, A1:["copilot"], A2:"individual"};
  const individual = assess(bank, answers, {persona:"individual",outcome:"scale",bottleneck:"evidence"});
  const leader = assess(bank, answers, {persona:"leader",outcome:"scale",bottleneck:"evidence"});
  assert.equal(individual.score, leader.score);
  assert.equal(individual.priority.id, leader.priority.id);
  assert.match(individual.findings.adoption, /In the work you know/);
  assert.match(leader.findings.adoption, /From your view of the business/);
  assert.match(leader.findings.adoption, /mostly through an assistant or copilot/);
});

test("shared AI practice receives a constructive finding", () => {
  const result = assess(bank, {...all,A1:["copilot","workflow"],A2:"team",A6:"6"}, {persona:"team",outcome:"scale",bottleneck:"unclear"});
  assert.match(result.findings.adoption, /moving beyond individual prompts/);
  assert.match(result.findings.foundations, /foundation|attention/i);
  assert.match(result.findings.priority, /Your answers point/);
});

test("seven sections contain six questions each and unique IDs", () => {
  assert.equal(bank.sections.length, 7);
  assert.ok(bank.sections.every(section => section.questions.length === 6));
  const ids = bank.sections.flatMap(section => section.questions.map(question => question.id));
  assert.equal(new Set(ids).size, 42);
});

test("progress is visual without visible question or section counts", () => {
  const controller = readFileSync(new URL("../assets/ai-assessment-v7.js", import.meta.url), "utf8");
  assert.match(controller, /role="progressbar"/);
  assert.match(controller, /aria-valuenow="\$\{done\}"/);
  assert.doesNotMatch(controller, /\$\{done\} \/ \$\{total\} questions|of 06|of 07|of 3|ar-subdim-heading/);
});

test("Likert questions distinguish a genuine midpoint from outside my view", () => {
  const controller = readFileSync(new URL("../assets/ai-assessment-v7.js", import.meta.url), "utf8");
  assert.match(controller, /<span>Disagree<\/span><span>Neither<\/span><span>Agree<\/span>/);
  assert.match(controller, /Neither agree nor disagree/);
  assert.match(controller, /scaleNames\.map/);
  assert.match(controller, /data-outside/);
  assert.match(controller, /delete value\.answers\[question\.id\]/);
});

test("project-stage context permits two stages or the full lifecycle", () => {
  const stage = bank.context.find(item => item.id === "stages");
  assert.equal(stage.type, "multi");
  assert.equal(stage.max, 2);
  assert.deepEqual(stage.options.map(option => option.id), ["development", "route", "procurement", "close", "all"]);
  assert.equal(stage.options.at(-1).exclusive, true);
  assert.match(stageScope(["development", "procurement"]), /early development and procurement and contracting/);
  assert.match(stageScope(["all"]), /full project lifecycle/);
});

test("stage context changes scope, not the score or priority", () => {
  const answers = {...all,A1:["copilot"],A2:"team"};
  const development = assess(bank, answers, {persona:"team",outcome:"scale",bottleneck:"evidence",stages:["development"]});
  const close = assess(bank, answers, {persona:"team",outcome:"scale",bottleneck:"evidence",stages:["close"]});
  assert.equal(development.score, close.score);
  assert.equal(development.priority.id, close.priority.id);
  assert.match(development.scope, /early development/);
  assert.match(close.scope, /financial close/);
});

test("unknown and outside-role responses are not treated as low scores", () => {
  const section = bank.sections.find(item => item.id === "data");
  const result = scoreSection(section, {D1: "5", D2: "0", D3: "outside", D4: "5", D5: "5"});
  assert.equal(result.answered, 3);
  assert.equal(result.score, 67);
});

test("new opportunities do not reduce the main score", () => {
  const high = assess(bank, all, {outcome: "scale", bottleneck: "unclear"});
  const noOffers = Object.fromEntries(Object.entries(all).map(([id, value]) => [id, id.startsWith("O") ? "1" : value]));
  assert.equal(assess(bank, noOffers, {outcome: "scale", bottleneck: "unclear"}).score, high.score);
});

test("headline gauge measures AI in work, not strong non-AI foundations", () => {
  const answers = Object.fromEntries(Object.entries(all).map(([id]) => [id, /^(A|N|L)/.test(id) ? "1" : "7"]));
  const result = assess(bank, {...answers,A1:["none"],A2:"none"}, {});
  assert.equal(result.score, 0);
  assert.equal(result.dimensions.find(item => item.id === "workflow").score, 100);
  assert.equal(result.dimensions.find(item => item.id === "data").score, 100);
  assert.match(result.scoreExplanation, /limited by governance/);
});

test("governance limits the gauge without giving workflow or data score weight", () => {
  const answers = Object.fromEntries(Object.entries(all).map(([id]) => [id, id.startsWith("G") ? "3" : "7"]));
  const result = assess(bank, {...answers,A1:["workflow"],A2:"team"}, {});
  assert.equal(result.score, 33);
  assert.equal(result.dimensions.find(item => item.id === "adoption").score, 100);
  assert.equal(result.dimensions.find(item => item.id === "win").score, 100);
  assert.equal(result.dimensions.find(item => item.id === "deliver").score, 100);
});

test("a score needs visibility of adoption, governance and at least one work area", () => {
  const noWork = Object.fromEntries(Object.entries(all).map(([id,value]) => [id,/^(N|L)/.test(id) ? "outside" : value]));
  const noWorkResult = assess(bank, noWork, {});
  assert.equal(noWorkResult.score, null);
  assert.equal(noWorkResult.priority.id, "visibility");
  const oneArea = {...noWork,N1:"5",N2:"5",N3:"5"};
  assert.equal(assess(bank, oneArea, {}).score, 67);
});

test("active AI use with weak governance prioritises controls", () => {
  const answers = Object.fromEntries(Object.entries(all).map(([id, value]) => [id, id.startsWith("G") ? "2" : value]));
  assert.equal(assess(bank, answers, {outcome: "win", bottleneck: "winning"}).priority.id, "governance");
});

test("the named bottleneck breaks a weak-foundation tie", () => {
  const answers = Object.fromEntries(Object.entries(all).map(([id, value]) => [id, /^[WD]/.test(id) ? "3" : value]));
  assert.equal(assess(bank, answers, {outcome: "deliver", bottleneck: "evidence"}).priority.id, "data");
});

test("a declared evidence bottleneck informs the build even when all scores are moderate", () => {
  const result = assess(bank, {...all,A1:["copilot"],A2:"team"}, {outcome:"scale",bottleneck:"evidence"});
  assert.equal(result.priority.id,"data");
  assert.equal(result.stage,"Shared practice");
  assert.match(result.foundationFinding,/tied at 67\/100/);
  assert.match(result.foundationFinding,/identified data and evidence/);
});

test("limited coverage yields a validation recommendation, not a fabricated number", () => {
  const answers = {A3: "5", A4: "5", W1: "5", W2: "5", W3: "5"};
  const result = assess(bank, answers, {});
  assert.equal(result.score, null);
  assert.equal(result.priority.id, "visibility");
});

test("core score requires visibility of both AI adoption and governance", () => {
  const answers = Object.fromEntries(Object.entries(all).map(([id,value]) => [id,id.startsWith("G") ? "outside" : value]));
  const result = assess(bank, answers, {outcome:"scale",bottleneck:"unclear"});
  assert.equal(result.score,null);
  assert.equal(result.priority.id,"visibility");
});
