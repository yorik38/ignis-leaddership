import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const handler = require("../api/assessment-report.js");
const bank = JSON.parse(fs.readFileSync(new URL("../assets/ai-assessment-v7.json", import.meta.url),"utf8"));
const answers = Object.fromEntries(bank.sections.flatMap(section => section.questions.map(question => [question.id,question.type === "likert" ? "5" : question.type === "single" ? "team" : ["copilot","plugin"]])));
const context = {persona:"leader",outcome:"scale",bottleneck:"evidence",stages:"route"};
function request(action,other={}) { return {method:"POST",headers:{"content-length":"1000"},body:{action,attemptId:"c4eec94f-363f-4ec1-9e70-38c5ce1bbdbd",version:bank.version,answers,context,...other}}; }
function response() {
  const headers={};
  return {headers,statusCode:0,setHeader(name,value){headers[name.toLowerCase()]=value;},end(value){this.body=value;}};
}

test("the two-page report cannot be downloaded without the email route",async () => {
  const res=response(); await handler(request("download"),res);
  assert.equal(res.statusCode,400);
});

test("rejects incomplete answers and missing email consent",async () => {
  const bad=response(); await handler(request("complete",{answers:{}}),bad); assert.equal(bad.statusCode,400);
  const consent=response(); await handler(request("email",{firstName:"A",email:"a@example.com",company:"Test"}),consent); assert.equal(consent.statusCode,400);
});

test("rejects multiple stages, including an old multi-stage selection",async () => {
  const many=response(); await handler(request("complete",{context:{...context,stages:["development","route"]}}),many);
  assert.equal(many.statusCode,400);
  const mixed=response(); await handler(request("complete",{context:{...context,stages:["all","route"]}}),mixed);
  assert.equal(mixed.statusCode,400);
});

test("email never reports sent when provider is unconfigured",async () => {
  const key=process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  const res=response(); await handler(request("email",{firstName:"A",email:"a@example.com",company:"Test",consent:true}),res);
  assert.equal(res.statusCode,503); assert.match(res.body,/not available yet/);
  if(key!==undefined)process.env.RESEND_API_KEY=key;
});

test("email success requires provider success and includes the PDF attachment",async () => {
  const oldFetch=global.fetch, oldKey=process.env.RESEND_API_KEY, oldFrom=process.env.AI_ASSESSMENT_FROM_EMAIL, oldNotify=process.env.AI_ASSESSMENT_NOTIFY_EMAIL;
  process.env.RESEND_API_KEY="test-key"; process.env.AI_ASSESSMENT_FROM_EMAIL="reports@example.com"; process.env.AI_ASSESSMENT_NOTIFY_EMAIL="owner@example.com";
  const payloads=[];
  global.fetch=async (_url,options) => {payloads.push({body:JSON.parse(options.body),key:options.headers["Idempotency-Key"]});return {ok:true};};
  try {
    const res=response(); await handler(request("email",{firstName:"A",email:"a@example.com",company:"Test",consent:true}),res);
    assert.equal(res.statusCode,200); assert.equal(payloads[0].body.to[0],"a@example.com");
    const pdf=Buffer.from(payloads[0].body.attachments[0].content,"base64").toString("latin1");
    assert.match(pdf,/^%PDF-1\.4/);
    assert.equal((pdf.match(/\/Type \/Page\b/g)||[]).length,2);
    assert.match(pdf,/Prepared for A  \|  Test/);
    assert.match(pdf,/Business leader/);
    assert.match(pdf,/Route to market/);
    assert.match(pdf,/Our working interpretation/);
    assert.match(pdf,/Answer signals behind that reading/);
    assert.match(pdf,/Two routes to examine/);
    assert.match(pdf,/A bounded validation plan/);
    assert.match(pdf,/Constraint signal|CONSTRAINT SIGNAL/i);
    assert.match(pdf,/Which auction, tender or offtake decision would have changed/);
    assert.match(pdf,/These answers do not prove a stage-level gap, financial cost or causal saving/);
    assert.match(pdf,/\/Subtype \/Image/);
    assert.equal(payloads[1].body.to[0],"owner@example.com");
    assert.match(payloads[1].body.text,/Report email: accepted by the email service/);
  } finally { global.fetch=oldFetch; if(oldKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=oldKey; if(oldFrom===undefined)delete process.env.AI_ASSESSMENT_FROM_EMAIL;else process.env.AI_ASSESSMENT_FROM_EMAIL=oldFrom; if(oldNotify===undefined)delete process.env.AI_ASSESSMENT_NOTIFY_EMAIL;else process.env.AI_ASSESSMENT_NOTIFY_EMAIL=oldNotify; }
});

test("completion sends full findings to Ignis without requiring contact details",async () => {
  const oldFetch=global.fetch, oldKey=process.env.RESEND_API_KEY, oldFrom=process.env.AI_ASSESSMENT_FROM_EMAIL, oldNotify=process.env.AI_ASSESSMENT_NOTIFY_EMAIL;
  process.env.RESEND_API_KEY="test-key"; process.env.AI_ASSESSMENT_FROM_EMAIL="reports@example.com"; process.env.AI_ASSESSMENT_NOTIFY_EMAIL="owner@example.com";
  let payload,headers;
  global.fetch=async (_url,options) => {payload=JSON.parse(options.body); headers=options.headers; return {ok:true};};
  try {
    const res=response(); await handler(request("complete",{firstName:"Private",company:"Private Co",email:"private@example.com"}),res);
    assert.equal(res.statusCode,200); assert.equal(payload.to[0],"owner@example.com");
    assert.match(payload.text,/Report email status at completion: not requested yet/);
    assert.match(payload.text,/ALL ANSWERS/); assert.match(payload.text,/Build priority: Build a governed evidence base/);
    assert.match(payload.text,/Reader perspective: Business leader/);
    assert.match(payload.text,/Which project stage gives you the clearest view\?: Route to market/);
    assert.match(payload.text,/Where to test it: Test this priority against an auction, tender or offtake decision/);
    assert.ok(!payload.text.includes("private@example.com"));
    assert.ok(!payload.text.includes("Private Co"));
    assert.match(Buffer.from(payload.attachments[0].content,"base64").toString("latin1"),/^%PDF-1\.4/);
    assert.match(headers["Idempotency-Key"],/^ai-assessment-complete-/);
  } finally { global.fetch=oldFetch; if(oldKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=oldKey; if(oldFrom===undefined)delete process.env.AI_ASSESSMENT_FROM_EMAIL;else process.env.AI_ASSESSMENT_FROM_EMAIL=oldFrom; if(oldNotify===undefined)delete process.env.AI_ASSESSMENT_NOTIFY_EMAIL;else process.env.AI_ASSESSMENT_NOTIFY_EMAIL=oldNotify; }
});

test("confirmed Ignis sender and research inbox are used by default",async () => {
  const oldFetch=global.fetch, oldKey=process.env.RESEND_API_KEY, oldFrom=process.env.AI_ASSESSMENT_FROM_EMAIL, oldNotify=process.env.AI_ASSESSMENT_NOTIFY_EMAIL;
  process.env.RESEND_API_KEY="test-key"; delete process.env.AI_ASSESSMENT_FROM_EMAIL; delete process.env.AI_ASSESSMENT_NOTIFY_EMAIL;
  let payload;
  global.fetch=async (_url,options) => { payload=JSON.parse(options.body); return {ok:true}; };
  try {
    const res=response(); await handler(request("complete"),res);
    assert.equal(res.statusCode,200);
    assert.equal(payload.from,"yorik@ignisleadership.com");
    assert.deepEqual(payload.to,["yorik@ignisleadership.com"]);
  } finally { global.fetch=oldFetch; if(oldKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=oldKey; if(oldFrom===undefined)delete process.env.AI_ASSESSMENT_FROM_EMAIL;else process.env.AI_ASSESSMENT_FROM_EMAIL=oldFrom; if(oldNotify===undefined)delete process.env.AI_ASSESSMENT_NOTIFY_EMAIL;else process.env.AI_ASSESSMENT_NOTIFY_EMAIL=oldNotify; }
});

test("provider failure is surfaced rather than reported as delivery",async () => {
  const oldFetch=global.fetch, oldKey=process.env.RESEND_API_KEY, oldFrom=process.env.AI_ASSESSMENT_FROM_EMAIL, oldNotify=process.env.AI_ASSESSMENT_NOTIFY_EMAIL;
  process.env.RESEND_API_KEY="test-key"; process.env.AI_ASSESSMENT_FROM_EMAIL="reports@example.com"; process.env.AI_ASSESSMENT_NOTIFY_EMAIL="owner@example.com";
  const messages=[];
  global.fetch=async (_url,options) => { messages.push(JSON.parse(options.body)); return messages.length === 1 ? {ok:false,status:422} : {ok:true}; };
  try {
    const res=response(); await handler(request("email",{firstName:"A",email:"a@example.com",company:"Test",consent:true}),res);
    assert.equal(res.statusCode,502); assert.match(res.body,/could not send/);
    assert.equal(messages[1].to[0],"owner@example.com");
    assert.match(messages[1].text,/Report email: not sent/);
    assert.match(messages[1].text,/ALL ANSWERS/);
  } finally { global.fetch=oldFetch; if(oldKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=oldKey; if(oldFrom===undefined)delete process.env.AI_ASSESSMENT_FROM_EMAIL;else process.env.AI_ASSESSMENT_FROM_EMAIL=oldFrom; if(oldNotify===undefined)delete process.env.AI_ASSESSMENT_NOTIFY_EMAIL;else process.env.AI_ASSESSMENT_NOTIFY_EMAIL=oldNotify; }
});
