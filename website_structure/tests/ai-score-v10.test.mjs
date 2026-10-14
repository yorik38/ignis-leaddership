import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import {IDS,QUESTIONS,PARTS,LABELS,assess,validAnswers} from "../assets/ai-score-v10-score.mjs";

const require=createRequire(import.meta.url);
const handler=require("../api/assessment-report.js");
const buildPDF=require("../api/assessment-v10-pdf.js");
const example={D1:"2_3",D2:"4_6",D3:"build_operate",G1:"flat",G2:"one",S1:"old_folders",S2:"pm_only",S3:"waits_senior",S4:"best_guess",C1:"2",C2:"3_4",C3:"over_half",L1:"a",L2:"a",L3:"d",L4:"sa",L5:"a"};
const request=(action,extra={})=>({method:"POST",headers:{"content-length":"1000"},body:{version:"v10",action,attemptId:"c4eec94f-363f-4ec1-9e70-38c5ce1bbdbd",answers:example,...extra}});
const response=()=>({statusCode:0,setHeader(){},end(value){this.body=value;}});

test("v10 has 17 unique questions in four parts and preserves five dot statements",()=>{
  assert.equal(QUESTIONS.length,17);
  assert.equal(new Set(IDS).size,17);
  assert.deepEqual(PARTS.map(p=>p.end-p.start),[3,6,3,5]);
  assert.equal(QUESTIONS.filter(q=>q.type==="likert").length,5);
  const controller=readFileSync(new URL("../assets/ai-score-v10.js",import.meta.url),"utf8");
  assert.match(controller,/class="ar-dots"/);
  assert.match(controller,/data-answer/);
  assert.match(controller,/setTimeout\(\(\)=>\{render\(\);focusQuestion/);
});
test("v10 scorer matches supplied worked example",()=>{
  assert.equal(validAnswers(example),true);
  const result=assess(example);
  assert.equal(result.reuse_score_0_100,33);
  assert.equal(result.weak_point,"Holder");
  assert.equal(result.team_band,"Stretched");
  assert.deepEqual(result.rebuild_weeks_per_year_at_target,[12,17.5,24]);
  assert.deepEqual(result.senior_days_per_week_checking,[2.5,3.1,3.8]);
});
test("reuse score bands use the four handover answers only",()=>{
  const options={S1:["blank","old_folders","templates","record"],S2:["lost","pm_only","pm_notes","shared_owned"],S3:["goes_with","waits_senior","slows","pickup_days"],S4:["found_in_contract","best_guess","mostly_raci_later","matrix_start"]};
  for(const [points,number,band] of [[[1,1,1,1],33,"Leaking"],[[2,1,1,1],42,"Fragile"],[[2,2,2,2],67,"Holding"],[[3,3,3,2],92,"Reusable"]]){
    const answers={...example};
    Object.keys(options).forEach((id,i)=>{answers[id]=options[id][points[i]];});
    assert.equal(assess(answers).reuse_score_0_100,number);
    assert.equal(assess(answers).reuse_band,band);
  }
});
test("unscored opinions cannot change reuse score or first fix",()=>{
  const changed={...example,L1:"sd",L2:"sd",L3:"sa",L4:"d",L5:"sd"};
  assert.equal(assess(changed).reuse_score_0_100,33);
  assert.equal(assess(changed).weak_point,"Holder");
  assert.notDeepEqual(assess(changed).your_view.tailoring,assess(example).your_view.tailoring);
});
test("unknown reuse steps create a visibility gap, not a low score",()=>{
  const a={...example,S1:"not_sure",S2:"not_sure",S3:"not_sure"};
  assert.equal(assess(a).visibility_gap,true);
  assert.equal(assess(a).reuse_score_0_100,null);
  assert.equal(assess(a).weak_point,null);
});
test("each weak handover point produces its own first-build recommendation",()=>{
  const strong={...example,S1:"record",S2:"shared_owned",S3:"pickup_days",S4:"matrix_start"};
  const cases={S1:["blank","Start","Start each project from the last one"],S2:["lost","Holder","Give project knowledge an owner and a home"],S3:["goes_with","Cover","Make every project pick-up-able"],S4:["found_in_contract","Scope","Agree interfaces before offers"]};
  for(const [id,[answer,expected,recommendation]] of Object.entries(cases)){
    const answers={...strong,[id]:answer},result=assess(answers);
    assert.equal(result.weak_point,expected);
    assert.equal(result.weak_question,id);
    assert.equal(result.reuse_score_0_100,75);
    const labels=Object.fromEntries(IDS.map(key=>[key,LABELS[key][answers[key]]]));
    const pdf=buildPDF(result,answers,{firstName:"Sam"},labels).toString("latin1");
    assert.match(pdf,new RegExp(recommendation.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  }
  assert.equal(assess(strong).reuse_band,"Reusable");
});
test("a reusable handover is not presented as a knowledge leak",()=>{
  const answers={...example,S1:"record",S2:"shared_owned",S3:"pickup_days",S4:"matrix_start"};
  const result=assess(answers);
  const labels=Object.fromEntries(IDS.map(id=>[id,LABELS[id][answers[id]]]));
  const pdf=buildPDF(result,answers,{firstName:"Sam"},labels).toString("latin1");
  assert.equal(result.reuse_score_0_100,100);
  assert.match(pdf,/handover answers meet the reusable threshold/);
  assert.doesNotMatch(pdf,/weakest measured point is holder/i);
  const dashboard=readFileSync(new URL("../assets/ai-score-v10.js",import.meta.url),"utf8");
  assert.match(dashboard,/report\.reuse_band!=="Reusable"/);
});
test("the decision brief does not call a flat or unknown target growth",()=>{
  for(const [target,claim] of [["2_3","AT YOUR CURRENT PACE."],["not_sure","YOUR NEXT PROJECT."]]){
    const answers={...example,D2:target},result=assess(answers);
    const labels=Object.fromEntries(IDS.map(key=>[key,LABELS[key][answers[key]]]));
    assert.match(buildPDF(result,answers,{firstName:"Sam"},labels).toString("latin1"),new RegExp(claim.replaceAll(".","\\.")));
  }
});
test("v10 API rejects missing answers and email without consent",async()=>{
  const bad=response();await handler(request("complete",{answers:{}}),bad);assert.equal(bad.statusCode,400);
  const noConsent=response();await handler(request("email",{firstName:"Sam",email:"sam@example.com",role:"ceo",aiUse:"none"}),noConsent);assert.equal(noConsent.statusCode,400);
});
test("v10 email sends a two-page brief and owner update",async()=>{
  const oldFetch=global.fetch,oldKey=process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY="test-key";const messages=[];
  global.fetch=async(_url,options)=>{messages.push(JSON.parse(options.body));return {ok:true};};
  try{
    const res=response();await handler(request("email",{firstName:"Sam",email:"sam@example.com",company:"Northmoor Energy",role:"ceo",aiUse:"individual",consent:true}),res);
    assert.equal(res.statusCode,200);
    assert.equal(messages.length,2);
    assert.equal(messages[0].to[0],"sam@example.com");
    assert.equal(messages[1].to[0],"yorik@ignisleadership.com");
    const pdf=Buffer.from(messages[0].attachments[0].content,"base64").toString("latin1");
    assert.match(pdf,/^%PDF-1\.4/);
    assert.equal((pdf.match(/\/Type \/Page\b/g)||[]).length,2);
    assert.match(pdf,/What to fix first/);
    assert.match(pdf,/33\/100/);
  }finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=oldKey;}
});
test("anonymous completion does not disclose contact details",async()=>{
  const oldFetch=global.fetch,oldKey=process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY="test-key";const messages=[];
  global.fetch=async(_url,options)=>{messages.push(JSON.parse(options.body));return {ok:true};};
  try{
    const res=response();await handler(request("complete",{firstName:"Hidden",email:"hidden@example.com"}),res);
    assert.equal(res.statusCode,200);
    assert.equal(messages.length,1);
    assert.equal(messages[0].to[0],"yorik@ignisleadership.com");
    assert.doesNotMatch(messages[0].text,/hidden@example.com|Hidden/);
  }finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=oldKey;}
});
