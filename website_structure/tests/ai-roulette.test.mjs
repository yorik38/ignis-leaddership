import test from 'node:test';
import assert from 'node:assert/strict';
import {structureFor,evaluate,movesFor} from '../assets/ai-roulette-model.mjs';

const answersFor=(structure,scale='1')=>Object.fromEntries(structure.flatMap(section=>section.questions.map(q=>[q.id,q.type==='scale'?scale:q.options[0].value])));

test('assessment has 36 unique questions in four parts',()=>{
  const structure=structureFor();
  const questions=structure.flatMap(s=>s.questions);
  assert.equal(questions.length,36);
  assert.equal(new Set(questions.map(q=>q.id)).size,36);
  assert.deepEqual([...new Set(structure.map(s=>s.section))],['maturity','adoption','governance','evolution']);
  assert.deepEqual(structure.map(s=>s.questions.length),Array(6).fill(6));
});

test('maturity is context and evolution is a separate opportunity lens',()=>{
  const structure=structureFor();
  const low=evaluate(structure,answersFor(structure));
  assert.equal(low.score,0);
  assert.equal(low.opportunityScore,0);
  assert.equal(low.band,'experimenting');
  assert.equal(Object.keys(low.dimensions).length,4);
  assert.ok(!('maturity' in low.dimensions));
  assert.ok(!('evolution' in low.dimensions));
  assert.equal(movesFor(low.constraint).length,3);
  const high=evaluate(structure,answersFor(structure,'5'));
  assert.equal(high.score,100);
  assert.equal(high.opportunityScore,100);
  assert.equal(high.band,'pilot');
  const lowEvolution=answersFor(structure,'5');
  for(const q of structure.find(s=>s.section==='evolution').questions)lowEvolution[q.id]='1';
  const result=evaluate(structure,lowEvolution);
  assert.equal(result.score,100);
  assert.equal(result.opportunityScore,0);
});

test('weak governance caps an otherwise high result',()=>{
  const structure=structureFor();
  const answers=answersFor(structure,'5');
  for(const q of structure.find(s=>s.dimension==='rules').questions)answers[q.id]='1';
  const result=evaluate(structure,answers);
  assert.equal(result.band,'design');
  assert.ok(result.gates.some(g=>g.includes('rules')));
});

test('rejects incomplete and out-of-range scored answers',()=>{
  const structure=structureFor();
  assert.throws(()=>evaluate(structure,{}),/could not be scored/);
  const answers=answersFor(structure);
  answers.AU1='9';
  assert.throws(()=>evaluate(structure,answers),/could not be scored/);
});
