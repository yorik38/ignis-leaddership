import test from 'node:test';
import assert from 'node:assert/strict';
import {lanes,questionsFor,evaluate,movesFor} from '../assets/ai-roulette-model.mjs';

const firstAnswer=q=>q.type==='scale'?'1':q.options[0].value;
function complete(lane,activity,choice=firstAnswer){return Object.fromEntries(questionsFor(lane,activity).map(q=>[q.id,choice(q)]))}

test('all three lanes have two activities or more and nine questions',()=>{
  for(const lane of lanes){
    assert.ok(lane.activities.length>=2);
    for(const [activity] of lane.activities){
      const questions=questionsFor(lane.id,activity);
      assert.equal(questions.length,9);
      assert.equal(questions.filter(q=>q.dimension).length,8);
      assert.equal(new Set(questions.map(q=>q.id)).size,9);
      assert.ok(questions.every(q=>q.type==='scale'||q.options.length>=2));
    }
  }
});

test('all low answers lead to a mapping result, with four scored dimensions',()=>{
  for(const lane of lanes){
    const activity=lane.activities[0][0];
    const result=evaluate({lane:lane.id,activity,answers:complete(lane.id,activity)});
    assert.equal(result.score,0);
    assert.equal(result.band,'experimenting');
    assert.equal(Object.keys(result.dimensions).length,4);
    assert.equal(movesFor(lane.id,result.constraint).length,3);
  }
});

test('all high answers show pilot foundations when no gate applies',()=>{
  for(const lane of lanes){
    const activity=lane.activities[0][0];
    const answers=complete(lane.id,activity,q=>q.type==='scale'?'5':q.options.at(-1).value);
    const result=evaluate({lane:lane.id,activity,answers});
    assert.equal(result.score,100);
    assert.equal(result.band,'pilot');
  }
});

test('weak governance caps a high result',()=>{
  const answers=complete('win','bids',q=>q.type==='scale'?'5':q.options.at(-1).value);
  answers.W6='1';answers.W7='no_rules';
  const result=evaluate({lane:'win',activity:'bids',answers});
  assert.equal(result.band,'design');
  assert.ok(result.gates.some(gate=>gate.includes('Governance')));
});

test('no sponsor caps a high result',()=>{
  const answers=complete('deliver','handover',q=>q.type==='scale'?'5':q.options.at(-1).value);
  answers.D9='no_sponsor';
  const result=evaluate({lane:'deliver',activity:'handover',answers});
  assert.equal(result.band,'design');
  assert.ok(result.gates.some(gate=>gate.includes('sponsor')));
});

test('untested demand caps Sell differently',()=>{
  const answers=complete('sell','external_service',q=>q.type==='scale'?'5':q.options.at(-1).value);
  answers.S4='internal_idea';
  const result=evaluate({lane:'sell',activity:'external_service',answers});
  assert.equal(result.band,'design');
  assert.ok(result.gates.some(gate=>gate.includes('Demand')));
});

test('rejects incomplete and invalid scored answers',()=>{
  assert.throws(()=>evaluate({lane:'win',activity:'bids',answers:{}}),/Complete/);
  const answers=complete('win','bids');answers.W2='9';
  assert.throws(()=>evaluate({lane:'win',activity:'bids',answers}),/could not be scored/);
});
