import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assess, scoreSection} from "../assets/ai-assessment-v7-model.mjs";

const bank = JSON.parse(readFileSync(new URL("../assets/ai-assessment-v7.json", import.meta.url)));
const all = Object.fromEntries(bank.sections.flatMap(section => section.questions.filter(q => q.type === "likert").map(q => [q.id, "5"])));

test("seven sections contain six questions each and unique IDs", () => {
  assert.equal(bank.sections.length, 7);
  assert.ok(bank.sections.every(section => section.questions.length === 6));
  const ids = bank.sections.flatMap(section => section.questions.map(question => question.id));
  assert.equal(new Set(ids).size, 42);
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
