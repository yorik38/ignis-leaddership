import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const require = createRequire(import.meta.url);
const handler = require(join(dirname(fileURLToPath(import.meta.url)), "../api/contact.js"));

function invoke(body, fetchImpl) {
  const original = global.fetch;
  global.fetch = fetchImpl;
  const res = {statusCode: 0, headers: {}, setHeader() {}, end(raw) { this.body = JSON.parse(raw); }};
  const payload = {form_started_at: Date.now() - 10000, ...body};
  return handler({method: "POST", body: payload, headers: {}}, res).then(() => {
    global.fetch = original;
    return res;
  }, (error) => {
    global.fetch = original;
    throw error;
  });
}

const enquiry = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "North Sea Power",
  role: "Commercial Director",
  topic: "gate2",
  phone: "+44 20 0000 0000",
  message: "Two sites approaching Gate 2.",
  newsletter_opt_in: false
};

test("contact API forwards topic, company and role to HubSpot", async () => {
  let submitted;
  const res = await invoke(enquiry, async (_url, options) => {
    submitted = JSON.parse(options.body);
    return {ok: true, status: 200, text: async () => ""};
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  const fields = Object.fromEntries(submitted.fields.map((field) => [field.name, field.value]));
  assert.equal(fields.topic, "gate2");
  assert.equal(fields.company, "North Sea Power");
  assert.equal(fields.role, "Commercial Director");
  assert.equal(fields.firstname, "Ada");
  assert.match(fields.message, /Two sites approaching Gate 2\./);
  assert.match(fields.message, /Topic: Gate 2: keep-or-kill decisions/);
  assert.match(fields.message, /Company: North Sea Power/);
  assert.match(fields.message, /Role: Commercial Director/);
});

test("contact API still sends the enquiry when HubSpot has no topic field", async () => {
  const calls = [];
  const res = await invoke(enquiry, async (_url, options) => {
    const payload = JSON.parse(options.body);
    calls.push(payload.fields.map((field) => field.name));
    if (calls.length === 1) return {ok: false, status: 400, text: async () => "unknown field topic"};
    return {ok: true, status: 200, text: async () => ""};
  });
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 2);
  assert.ok(calls[1].includes("message"));
  assert.equal(calls[1].includes("topic"), false);
  assert.equal(calls[1].includes("company"), false);
  assert.equal(calls[1].includes("role"), false);
});

test("contact API rejects an enquiry without a topic or company", async () => {
  const res = await invoke({...enquiry, topic: "", company: ""}, async () => {
    throw new Error("HubSpot should not be called");
  });
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.error, "invalid_details");
});
