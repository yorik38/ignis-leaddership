const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const buildPDF = require("./assessment-pdf.js");

const bank = JSON.parse(fs.readFileSync(path.join(__dirname,"..","assets","ai-assessment-v7.json"),"utf8"));
const MAX_BODY = 20000;
const DEFAULT_FROM = "yorik@ignisleadership.com";
const DEFAULT_NOTIFY_TO = "yorik@ignisleadership.com";
const clean = (value,max=120) => String(value ?? "").trim().replace(/\s+/g," ").slice(0,max);
function json(res,status,payload) { res.statusCode=status; res.setHeader("Content-Type","application/json; charset=utf-8"); res.setHeader("Cache-Control","no-store"); res.end(JSON.stringify(payload)); }
function validAnswers(answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return false;
  return bank.sections.every(section => section.questions.every(question => {
    const value = answers[question.id];
    if (question.type === "likert") return value === "0" || value === "outside" || Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 7;
    if (question.type === "single") return question.options.some(option => option.id === value);
    if (question.type === "multi") return Array.isArray(value) && value.length > 0 && value.length <= question.options.length && value.every(item => question.options.some(option => option.id === item)) && !(value.includes("none") && value.length > 1);
    return false;
  }));
}
function validContext(context) {
  return context && typeof context === "object" && bank.context.every(item => item.options.some(option => option.id === context[item.id]));
}
function answerLabel(question,value) {
  if (question.type === "likert") return value === "0" ? "Not sure" : value === "outside" ? "Not involved" : `${value}/7`;
  const values = Array.isArray(value) ? value : [value];
  return values.map(item => question.options.find(option => option.id === item)?.label || item).join(", ");
}
function researchSummary(result,answers,context,attemptId) {
  const contextLines = bank.context.map(item => `${item.title}: ${item.options.find(option => option.id === context[item.id])?.label || context[item.id]}`);
  const scoreLines = result.dimensions.map(item => `${item.label}: ${item.score == null ? "not scored" : `${item.score}/100`} (${item.answered}/${item.possible} scored answers)`);
  const answerLines = bank.sections.flatMap(section => [section.title.toUpperCase(),...section.questions.map(question => `${question.id}. ${question.text}\n${answerLabel(question,answers[question.id])}`),""]);
  return [
    `Attempt: ${attemptId}`,
    `Overall score: ${result.score == null ? "not scored" : `${result.score}/100`}`,
    `AI stage: ${result.stage}`,
    `Build priority: ${result.priority.title}`,
    `Why: ${result.priority.why}`,
    `First move: ${result.priority.first}`,
    `Owner: ${result.priority.owner}`,
    `Pilot: ${result.priority.pilot}`,
    "",
    "CONTEXT",...contextLines,"",
    "DIMENSION SCORES",...scoreLines,"",
    "ALL ANSWERS",...answerLines,
    result.caveat
  ].join("\n");
}
async function sendEmail(message,apiKey,idempotencyKey) {
  const response = await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json","Idempotency-Key":idempotencyKey},
    body:JSON.stringify(message),
    signal:AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}

module.exports = async function assessmentReport(req,res) {
  if (req.method !== "POST") { res.setHeader("Allow","POST"); return json(res,405,{error:"Method not allowed."}); }
  if (Number(req.headers["content-length"] || 0) > MAX_BODY) return json(res,413,{error:"Request too large."});
  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : req.body; }
  catch { return json(res,400,{error:"Invalid report request."}); }
  if (!body || JSON.stringify(body).length > MAX_BODY || body.version !== bank.version || !["complete","email"].includes(body.action) || !validAnswers(body.answers) || !validContext(body.context) || !/^[a-z0-9-]{12,100}$/i.test(body.attemptId || "")) return json(res,400,{error:"The assessment answers are incomplete or out of date. Please refresh and try again."});
  let result;
  try { const model = await import("../assets/ai-assessment-v7-model.mjs"); result = model.assess(bank,body.answers,body.context); }
  catch { return json(res,500,{error:"The assessment could not be calculated. Please try again."}); }
  const apiKey=process.env.RESEND_API_KEY;
  const from=process.env.AI_ASSESSMENT_FROM_EMAIL || DEFAULT_FROM;
  const notifyTo=process.env.AI_ASSESSMENT_NOTIFY_EMAIL || DEFAULT_NOTIFY_TO;
  if (body.action === "complete") {
    if (!apiKey || !from || !notifyTo) return json(res,503,{error:"Assessment research delivery is not available yet."});
    const pdf=buildPDF(result,body.answers,{});
    const message={from,to:[notifyTo],subject:`AI self-assessment completed | ${result.score ?? "unscored"}/100 | ${result.stage}`,
      text:`Report email status at completion: not requested yet. This response has no name or email address. If the participant later requests a report, a separate delivery update follows.\n\n${researchSummary(result,body.answers,body.context,body.attemptId)}`,
      attachments:[{filename:"ignis-ai-self-assessment.pdf",content:pdf.toString("base64")}]
    };
    if (process.env.AI_ASSESSMENT_REPLY_TO) message.reply_to=process.env.AI_ASSESSMENT_REPLY_TO;
    try { await sendEmail(message,apiKey,`ai-assessment-complete-${body.attemptId}`); return json(res,200,{ok:true}); }
    catch(error) { console.error("Assessment research delivery error",error.message); return json(res,502,{error:"Assessment research delivery could not be confirmed."}); }
  }
  const firstName=clean(body.firstName,80), company=clean(body.company,120), email=clean(body.email,254).toLowerCase();
  if (!body.consent || !firstName || !company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res,400,{error:"Enter your name, company and a valid email, then confirm report delivery."});
  if (!apiKey || !from || !notifyTo) return json(res,503,{error:"Email delivery is not available yet."});
  const pdf=buildPDF(result,body.answers,{firstName,company});
  const message={from,to:[email],subject:"Your Ignis AI self-assessment report",
    text:`Hi ${firstName},\n\nYour two-page AI self-assessment report is attached. Your result is also available in the browser where you completed the assessment.\n\nThis is a directional self-assessment based on your answers, not an independent audit or external benchmark.\n\nIgnis Leadership\nhttps://www.ignisleadership.com/contact`,
    attachments:[{filename:"ignis-ai-self-assessment.pdf",content:pdf.toString("base64")}]
  };
  if (process.env.AI_ASSESSMENT_REPLY_TO) message.reply_to=process.env.AI_ASSESSMENT_REPLY_TO;
  const recipientKey=createHash("sha256").update(email).digest("hex").slice(0,16);
  let sent=false;
  try { await sendEmail(message,apiKey,`ai-assessment-report-${body.attemptId}-${recipientKey}`); sent=true; }
  catch(error) { console.error("Assessment report delivery error",error.message); }
  if (notifyTo) {
    const update={from,to:[notifyTo],subject:`AI self-assessment report ${sent ? "accepted" : "not sent"} | ${body.attemptId}`,
      text:`Report email: ${sent ? "accepted by the email service" : "not sent: email service rejected the request"}\nFirst name: ${firstName}\nCompany: ${company}\nEmail: ${email}\n\n${researchSummary(result,body.answers,body.context,body.attemptId)}`,
      attachments:[{filename:"ignis-ai-self-assessment.pdf",content:pdf.toString("base64")}]};
    try { await sendEmail(update,apiKey,`ai-assessment-report-status-${body.attemptId}-${recipientKey}-${sent ? "accepted" : "failed"}`); }
    catch(error) { console.error("Assessment research status error",error.message); }
  }
  return sent ? json(res,200,{ok:true}) : json(res,502,{error:"We could not send the report. Please try again later."});
};
