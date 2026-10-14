const {createHash}=require("node:crypto");
const buildPDF=require("./assessment-v10-pdf.js");
const clean=(value,max=120)=>String(value??"").trim().replace(/\s+/g," ").slice(0,max);
const json=(res,status,payload)=>{res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(payload));};
async function send(message,key,id){
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json","Idempotency-Key":id},body:JSON.stringify(message),signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error(`Email provider returned ${response.status}`);
}
module.exports=async function handleV10(body,res){
  if(!body||JSON.stringify(body).length>20000||!["complete","email"].includes(body.action)||!/^[a-z0-9-]{12,100}$/i.test(body.attemptId||""))return json(res,400,{error:"Invalid assessment request."});
  const {assess,validAnswers,LABELS,IDS}=await import("../assets/ai-score-v10-score.mjs");
  if(!validAnswers(body.answers))return json(res,400,{error:"The assessment answers are incomplete. Please review and try again."});
  const result=assess(body.answers),labels=Object.fromEntries(IDS.map(id=>[id,LABELS[id][body.answers[id]]]));
  const key=process.env.RESEND_API_KEY,from=process.env.AI_ASSESSMENT_FROM_EMAIL||"yorik@ignisleadership.com",notify=process.env.AI_ASSESSMENT_NOTIFY_EMAIL||"yorik@ignisleadership.com";
  const first=clean(body.firstName,80),company=clean(body.company,120),email=clean(body.email,254).toLowerCase();
  if(body.action==="email"&&(!body.consent||!first||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!["ceo","md","executive"].includes(body.role)||!["not_sure","none","individual","templates","workflow"].includes(body.aiUse)))return json(res,400,{error:"Enter your name and a valid email, then confirm report delivery."});
  if(!key||!from||!notify)return json(res,503,{error:"Email delivery is not configured yet."});
  const finding=result.visibility_gap?"not visible":result.reuse_band==="Reusable"?"no handover gap flagged":result.weak_point;
  const lines=[`Attempt: ${body.attemptId}`,`Reuse score: ${result.reuse_score_0_100??"not visible"}/100; ${result.reuse_band||"visibility gap"}`,`Handover finding: ${finding}`,`Team: ${result.team_band||"not known"}`,`Projects today: ${labels.D1}; target: ${labels.D2}; at once: ${labels.C1}`,`Rebuild weeks at target: ${result.rebuild_weeks_per_year_at_target?.join(" / ")||"not known"}`,`Senior days checking: ${result.senior_days_per_week_checking?.join(" / ")||"not known"}`,`Lead call openers: ${result.your_view.top_openers.join(" | ")||"none"}`,"","ALL ANSWERS",...IDS.map(id=>`${id}: ${labels[id]}`)];
  let pdf;
  try{pdf=buildPDF(result,body.answers,{firstName:first,company},labels);}catch(error){console.error("v10 PDF error",error);return json(res,500,{error:"The report could not be prepared."});}
  const attachment={filename:"ignis-project-reuse-decision-brief.pdf",content:pdf.toString("base64")};
  if(body.action==="complete"){
    try{await send({from,to:[notify],subject:`AI Score completed | ${finding} | ${result.team_band||"team unknown"}`,text:`Anonymous completed response. No contact information was supplied.\n\n${lines.join("\n")}`,attachments:[attachment]},key,`ai-score-v10-complete-${body.attemptId}`);return json(res,200,{ok:true});}
    catch(error){console.error("v10 completion delivery",error.message);return json(res,502,{error:"Research delivery was not confirmed."});}
  }
  let sent=false;
  try{await send({from,to:[email],subject:"Your Ignis two-page decision brief",text:`Hi ${first},\n\nYour two-page project-reuse decision brief is attached. It is based on your answers and includes the first fix to test. Your on-screen result remains available in this browser.\n\nThese are your ranges and a working interpretation, not an independent audit or a savings claim.\n\nIgnis Leadership\nhttps://www.ignisleadership.com/contact`,attachments:[attachment]},key,`ai-score-v10-report-${body.attemptId}-${createHash("sha256").update(email).digest("hex").slice(0,16)}`);sent=true;}
  catch(error){console.error("v10 respondent delivery",error.message);}
  try{await send({from,to:[notify],subject:`AI Score report ${sent?"accepted":"failed"} | ${company||"No company"} | ${finding}`,text:`Respondent: ${first}\nCompany: ${company||"Not supplied"}\nEmail: ${email}\nRole: ${body.role}\nAI use: ${body.aiUse}\nRespondent delivery: ${sent?"accepted by the email service":"failed"}\n\n${lines.join("\n")}`,attachments:[attachment]},key,`ai-score-v10-status-${body.attemptId}-${sent?"accepted":"failed"}`);}catch(error){console.error("v10 research update",error.message);}
  return sent?json(res,200,{ok:true}):json(res,502,{error:"We could not send the report. Please try again later."});
};
