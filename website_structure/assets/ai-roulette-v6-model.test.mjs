import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { score, scoreGrid, scoreValue, scoreLikert, fmtMid } from "./ai-roulette-v6-model.mjs";

const bank = JSON.parse(readFileSync(new URL("./ai-roulette-v6-questions.json", import.meta.url)));
const grid = Object.fromEntries(bank.workstreams.map(item => [item.id, { p: 2, a: 2 }]));
const state = {
  sector: 1, role: 1, goal: 3, projectCount: 2, grid, ladder: 3, tools: [1],
  found: Object.fromEntries(bank.questions.filter(item => item.section === "foundations").map(item => [item.id, 4])),
  grow: Object.fromEntries(bank.questions.filter(item => item.section === "grow").map(item => [item.id, 4])),
  cost: { K1: 3, K2: 3, K3: 3, K4: 3, K6: 2 }, k1Exact: null,
  money: { currency: "g", slipMonth: 100000, projectValue: 2000000 }, peopleCost: null,
  urgency: [1]
};
const result = score(bank, state);
assert.equal(result.readiness, 40);
assert.equal(result.foundations.total, 50);
assert.equal(result.grow.total, 50);
assert.equal(result.grid.biggestGap, "buy");
assert.equal(result.grid.jointWith, "close");
assert.equal(result.value.weeks.mid, 26);
assert.equal(result.headline, "money");
assert.deepEqual(result.moves.map(item => item.kind), ["processMove", "facet", "goal"]);
assert.equal(result.build.first, "buy");
assert.equal(result.value.growPot.mid, 3000000);
assert.ok(result.value.optimise.mid > 500000 && result.value.optimise.mid < 700000);
assert.match(fmtMid(result.value.optimise, "£").text, /^about £/);

const unknownGrid = scoreGrid(bank, {}, "close");
assert.equal(unknownGrid.biggestGap, null);
assert.equal(unknownGrid.processMaturityIndex, null);
assert.equal(unknownGrid.aiUseIndex, null);
const none = scoreValue(bank, { K1: 1, K2: 1, K3: 1, K6: 1 }, null, { currency: "g" });
assert.deepEqual(none.weeks, { lo: 0, hi: 0, mid: 0 });
assert.equal(none.optimise, null);
const unsure = scoreLikert(bank, "foundations", {}, bank.scoring.foundations.minAnswered, bank.scoring.foundations.facets);
assert.equal(unsure.total, null);
assert.equal(unsure.notSure.length, 6);
console.log("AI Roulette v6 model tests passed");
