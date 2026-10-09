import test from "node:test";
import assert from "node:assert/strict";
import {wheelSlices,slicePath,labelPosition} from "../assets/ai-roulette-wheel.mjs";

test("wheel covers three equal lane arcs with all ten activities",()=>{
  assert.equal(wheelSlices.length,10);
  assert.deepEqual(wheelSlices.map(slice=>slice.lane),[...Array(4).fill("win"),...Array(4).fill("deliver"),...Array(2).fill("sell")]);
  assert.equal(wheelSlices[0].start,0);
  assert.equal(wheelSlices.at(-1).end,360);
  for(let i=1;i<wheelSlices.length;i++)assert.equal(wheelSlices[i-1].end,wheelSlices[i].start);
});

test("every slice has a draw path and an on-wheel label position",()=>{
  for(const slice of wheelSlices){assert.match(slicePath(slice.start,slice.end),/^M 200 200 L /);const position=labelPosition(slice.start,slice.end);assert.ok(Number.isFinite(Number(position.x)));assert.ok(Number.isFinite(Number(position.y)));}
});
