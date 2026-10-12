import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assess, scoreSection} from "../assets/ai-assessment-v7-model.mjs";

const bank = JSON.parse(readFileSync(new URL("../assets/ai-assessment-v7.json", import.meta.url)));
const all = Object.fromEntries(bank.sections.flatMap(section => section.questions.filter(q => q.type === "likert").map(q => [q.id, "5"])));

test("landing stays concise while answer-sharing is disclosed before the questions", () => {
  const html = readFileSync(new URL("../ai-roulette.html", import.meta.url), "utf8");
  const controller = readFileSync(new URL("../assets/ai-assessment-v7.js", import.meta.url), "utf8");
  const landing = html.match(/<section class="ar-landing"[\s\S]*?<\/section>/)?.[0];
  assert.ok(landing);
  assert.match(landing, /Instant result · No sign-up required/);
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

test("Likert questions offer only the seven-point disagree-to-agree scale", () => {
  const controller = readFileSync(new URL("../assets/ai-assessment-v7.js", import.meta.url), "utf8");
  assert.match(controller, /<span>Disagree<\/span><span>Neutral<\/span><span>Agree<\/span>/);
  assert.match(controller, /scaleNames\.map/);
  assert.doesNotMatch(controller, /data-alternative|ar-answer-alternatives|ar-not-sure/);
  assert.match(controller, /delete value\.answers\[question\.id\]/);
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
