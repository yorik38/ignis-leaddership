import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {scoreGap,scoreCost,urgencyLevel,pathFor,visibleQuestions,sectorText} from "../assets/ai-roulette-v4-model.mjs";

const bank=JSON.parse(readFileSync(new URL("../assets/ai-roulette-v4-questions.json",import.meta.url)));
const gap=bank.questions.filter(q=>q.section==="gap");
const ideal=()=>Object.fromEntries(gap.map(q=>[q.id,q.reverseScored?"1":"7"]));

test("v4 bank has 12 balanced gap items and all intended flow items",()=>{
  assert.equal(bank.meta.version,"2026-10-v4");
  assert.equal(gap.length,12);
  assert.equal(new Set(bank.questions.map(q=>q.id)).size,bank.questions.length);
  for(const lever of bank.levers){
    const items=gap.filter(q=>q.lever===lever.id);
    assert.equal(items.length,2);
    assert.deepEqual(items.map(q=>q.reverseScored).sort(),[false,true]);
  }
  assert.deepEqual(visibleQuestions(bank,{K3:"1"}).filter(q=>q.section==="cost").map(q=>q.id),["K1","K2","K3","K6"]);
});

test("all-good, all-bad, and straight-line answers score as specified",()=>{
  assert.equal(scoreGap(bank,ideal()).total,100);
  const worst=Object.fromEntries(gap.map(q=>[q.id,q.reverseScored?"7":"1"]));
  assert.equal(scoreGap(bank,worst).total,0);
  for(const value of ["1","4","7"]){
    const result=scoreGap(bank,Object.fromEntries(gap.map(q=>[q.id,value])));
    assert.equal(result.total,50);
  }
});

test("governance gate caps the band without changing the number",()=>{
  const answers=ideal();
  answers.GCK1="1";answers.GRU2="7";
  const result=scoreGap(bank,answers);
  assert.equal(result.total,83);
  assert.equal(result.band,"betting");
  assert.equal(result.gatedLever.id,"checks");
});

test("not sure is excluded and creates low visibility",()=>{
  const answers=ideal();
  answers.GCK1="0";
  const result=scoreGap(bank,answers);
  assert.equal(result.total,92);
  assert.equal(result.band,"house");
  assert.equal(result.levers.find(item=>item.id==="checks").health,null);
  assert.equal(result.gatedLever,null);
});

test("sector only changes wording, never question order or scoring",()=>{
  const base=scoreGap(bank,ideal());
  for(const sector of bank.sector.options.map(option=>option.id)){
    assert.equal(scoreGap(bank,ideal()).total,base.total);
    assert.equal(bank.questions.find(q=>q.id==="AFO1").id,"AFO1");
    assert.ok(sectorText(bank.questions.find(q=>q.id==="AFO1"),"text",sector));
  }
});

test("cost maths uses respondents' ranges and private urgency routes",()=>{
  const answers={K1:"2",K2:"3",K3:"3",K4:"3",K6:"3",U1:["strategic"]};
  const cost=scoreCost(bank,answers,bank.levers.find(item=>item.id==="handover"));
  assert.deepEqual(cost.time,[828,2760]);
  assert.deepEqual(cost.delay,[6,20]);
  assert.deepEqual(cost.missed,[3,5]);
  assert.equal(urgencyLevel(bank,answers,cost),"maybe");
  answers.U1=["deadline"];
  assert.equal(urgencyLevel(bank,answers,cost),"need");
  answers.U1=["strategic"];answers.K3="4";
  assert.equal(urgencyLevel(bank,answers,scoreCost(bank,answers)),"maybe");
  answers.K3="1";answers.K6="1";
  assert.equal(urgencyLevel(bank,answers,scoreCost(bank,answers)),"want");
});

test("site path follows score and fix-first rules",()=>{
  assert.equal(pathFor(scoreGap(bank,ideal()),"grow"),"support");
  assert.equal(pathFor(scoreGap(bank,Object.fromEntries(gap.map(q=>[q.id,q.reverseScored?"7":"1"]))),"grow"),"map");
  assert.equal(pathFor(scoreGap(bank,{}),"grow"),"map");
});
