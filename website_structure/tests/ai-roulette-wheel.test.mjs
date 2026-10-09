import test from "node:test";
import assert from "node:assert/strict";
import {maturitySlices,slicePath,labelPosition} from "../assets/ai-roulette-wheel.mjs";

test("decorative maturity wheel covers all seven stages",()=>{
  assert.equal(maturitySlices.length,7);
  assert.equal(maturitySlices[0].start,0);
  assert.equal(maturitySlices.at(-1).end,360);
  for(let i=1;i<maturitySlices.length;i++)assert.equal(maturitySlices[i-1].end,maturitySlices[i].start);
});

test("every slice has a draw path and an on-wheel label position",()=>{
  for(const slice of maturitySlices){assert.match(slicePath(slice.start,slice.end),/^M 200 200 L /);const position=labelPosition(slice.start,slice.end);assert.ok(Number.isFinite(Number(position.x)));assert.ok(Number.isFinite(Number(position.y)));}
});
