import test from 'node:test';
import assert from 'node:assert/strict';
import {structureFor,evaluate,movesFor} from '../assets/ai-roulette-model.mjs';

const variants=[['external','front_end'],['external','back_end'],['internal','front_end'],['internal','back_end']];
const answersFor=(structure,scale='1')=>Object.fromEntries(structure.flatMap(section=>section.questions.map(q=>[q.id,q.type==='scale'?scale:q.options[0].value])));

test('all branches have 60 unique questions in the intended four-part order',()=>{
  for(const [transformation,adoption] of variants){
    const structure=structureFor(transformation,adoption);
    const questions=structure.flatMap(s=>s.questions);
    assert.equal(questions.length,60);
    assert.equal(new Set(questions.map(q=>q.id)).size,60);
    assert.deepEqual([...new Set(structure.map(s=>s.section))],['maturity','adoption','governance','transformation']);
    assert.deepEqual(structure.map(s=>s.questions.length),Array(10).fill(6));
  }
});

test('maturity is context; nine scored dimensions make the result',()=>{
  for(const [transformation,adoption] of variants){
    const structure=structureFor(transformation,adoption);
    const low=evaluate(structure,answersFor(structure));
    assert.equal(low.score,0);
    assert.equal(low.band,'experimenting');
    assert.equal(Object.keys(low.dimensions).length,9);
    assert.ok(!('maturity' in low.dimensions));
    assert.equal(movesFor(low.constraint).length,3);
    const high=evaluate(structure,answersFor(structure,'5'));
    assert.ok(high.score>=95);
    assert.equal(high.band,'pilot');
  }
});

test('weak governance caps an otherwise high result',()=>{
  const structure=structureFor('external','front_end');
  const answers=answersFor(structure,'5');
  for(const q of structure.find(s=>s.dimension==='clearance').questions)answers[q.id]='1';
  const result=evaluate(structure,answers);
  assert.equal(result.band,'design');
  assert.ok(result.gates.some(g=>g.includes('Decision rights')));
});

test('rejects incomplete and out-of-range scored answers',()=>{
  const structure=structureFor('external','front_end');
  assert.throws(()=>evaluate(structure,{}),/could not be scored/);
  const answers=answersFor(structure);
  answers.AC1='9';
  assert.throws(()=>evaluate(structure,answers),/could not be scored/);
});
