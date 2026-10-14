import {VERSION,IDS,QUESTIONS,PARTS,LABELS,assess} from "./ai-score-v10-score.mjs";

const landing=document.getElementById("as-landing"),app=document.getElementById("ar-app");
const KEY="ignis_ai_score_v10",motion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const REPORT_EMAIL_ENABLED=false;
const track=(name,detail={})=>{if(typeof window.gtag==="function")window.gtag("event",name,{assessment_version:VERSION,...detail});};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const attempt=()=>globalThis.crypto?.randomUUID?.()||`v10-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const fresh=()=>({version:VERSION,screen:"landing",part:0,active:0,answers:{},attemptId:attempt(),completionTracked:false});
let saved;
try{const value=JSON.parse(localStorage.getItem(KEY));if(value?.version===VERSION&&value.answers&&value.attemptId)saved=value;}catch{}
let state=saved||fresh(),timer;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
function mode(){
  const landingScreen=state.screen==="landing",taking=["intro","questions"].includes(state.screen);
  document.body.classList.toggle("as-landing-page",landingScreen);
  document.body.classList.toggle("as-taking",taking);
  document.body.classList.toggle("as-result-page",state.screen==="result");
  landing.hidden=!landingScreen;app.hidden=landingScreen;
}
function topbar(){return `<div class="ar-top-bar"><button class="ar-back" type="button" data-back>← Back</button><button class="ar-text-button" type="button" data-save>Save &amp; finish later</button></div>`;}
function progress(){
  const done=IDS.filter(id=>state.answers[id]!==undefined).length;
  return `<div class="ar-progress-block"><div class="ar-progress-top"><span>${esc(PARTS[state.part].title)}</span></div><div class="ar-seg-row" role="progressbar" aria-label="Assessment progress" aria-valuemin="0" aria-valuemax="17" aria-valuenow="${done}">${PARTS.map(p=>{const n=QUESTIONS.slice(p.start,p.end).filter(q=>state.answers[q.id]!==undefined).length;return `<span class="ar-seg" style="--fill:${n/(p.end-p.start)*100}%" aria-hidden="true"></span>`;}).join("")}</div></div>`;
}
function intro(){
  const part=PARTS[state.part];
  return `<div class="ar-shell"><section class="ar-pause" aria-labelledby="ar-screen-title">${topbar()}<div class="ar-pause-content"><p class="ar-category-kicker">${esc(part.title)}</p><h2 id="ar-screen-title">${esc(part.title)}</h2><p class="ar-screen-help">${esc(part.subtitle)}</p><button class="ar-button" type="button" data-begin>Begin section →</button></div></section></div>`;
}
const scenario=`<aside class="as-scenario"><strong>Your next project enters procurement while the current one is still mid-way.</strong><p>Imagine the current one has about six directly bought packages. Scope between them is still a best guess and much of what it has taught the team sits with its project manager. Answer for how your business works today, not how it should.</p></aside>`;
function choices(q){
  return `<div class="ar-question-options" role="group" aria-label="${esc(q.text)}">${Object.entries(LABELS[q.id]).map(([code,label])=>`<button class="ar-choice ${state.answers[q.id]===code?"is-selected":""}" type="button" aria-pressed="${state.answers[q.id]===code}" data-answer="${esc(code)}" data-id="${q.id}">${esc(label)}</button>`).join("")}</div>`;
}
function dots(q){
  const codes=["sd","d","n","a","sa"],selected=codes.indexOf(state.answers[q.id]);
  return `<div class="ar-dots-labels"><span>Disagree</span><span>Agree</span></div><fieldset class="ar-dots" aria-label="${esc(q.text)}">${codes.map((code,i)=>`<label class="ar-dot ${selected>=i?"is-lit":""}" data-point="${i+1}"><input type="radio" name="${q.id}" value="${code}" aria-label="${esc(LABELS[q.id][code])}" ${selected===i?"checked":""}><span aria-hidden="true"></span></label>`).join("")}</fieldset><button class="ar-text-button ar-quiz-not-sure ${state.answers[q.id]==="not_sure"?"is-selected":""}" type="button" data-answer="not_sure" data-id="${q.id}">Not sure</button>`;
}
function questions(){
  const part=PARTS[state.part],items=QUESTIONS.slice(part.start,part.end),complete=items.every(q=>state.answers[q.id]!==undefined);
  return `<div class="ar-shell"><section class="ar-flow ar-stack" aria-label="${esc(part.title)} questions"><div class="ar-sticky-head">${topbar()}${progress()}</div><div class="ar-stack-list">${items.map((q,i)=>`${q.id==="S1"?scenario:""}<article class="ar-stack-item ${i===state.active?"is-active":""}" data-index="${i}" data-question-id="${q.id}"><h2 class="ar-question">${esc(q.text)}</h2>${q.type==="likert"?dots(q):choices(q)}</article>`).join("")}</div><div class="ar-flow-actions"><button class="ar-button" type="button" data-next ${complete?"":"disabled"}>${state.part===3?"See my result":"Continue"} →</button></div></section></div>`;
}
function focusQuestion(index){
  const items=[...app.querySelectorAll(".ar-stack-item")],target=items[index];
  if(!target)return;
  items.forEach((item,i)=>item.classList.toggle("is-active",i===index));
  target.scrollIntoView({behavior:motion?"instant":"smooth",block:"center"});
}
function answer(id,value){
  state.answers[id]=value;save();
  const items=QUESTIONS.slice(PARTS[state.part].start,PARTS[state.part].end);
  const current=items.findIndex(q=>q.id===id);
  if(current<items.length-1){
    state.active=current+1;
    clearTimeout(timer);
    timer=setTimeout(()=>{render();focusQuestion(state.active);},motion?0:280);
  }else{render();requestAnimationFrame(()=>app.querySelector("[data-next]")?.scrollIntoView({behavior:motion?"instant":"smooth",block:"center"}));}
}
const CONSEQUENCES={S1:["Every project pays its set-up cost again.","Set-up is faster, but still filled in by hand.","The next project starts from the last one."],S2:["The next project can reuse it only if that person has time.","Mostly with one person; notes help.","What it learned is owned and current."],S3:["Capacity is set by your busiest person, not your team.","It slows while people ask around.","Someone else picks it up within days."],S4:["The same interface questions come back late.","RACI catches up later.","Interfaces are agreed before offers."]};
const FIXES={
  Holder:{title:"Give each project's knowledge an owner and a home.",body:"Keep one current project record: packages, interfaces, scope decisions, changes between offer and contract, bidder notes and lessons. A named owner maintains it and hands it on as the project moves stage.",steps:["Agree the record's fields on a live project and name its owner.","Fill it from current folders. Ask a second person to answer open questions from the record alone.","Start the next project from it and compare set-up time with today."]},
  Start:{title:"Start every project from the last one.",body:"Build a starter pack from the last project's approved record: packages, interfaces, tender sections, criteria and lessons. It should be a usable starting point, not an old precedent to copy blindly.",steps:["List what the next project needs on day one.","Build the starter pack from the current project and check every source.","Use it on the next project and compare set-up time with today."]},
  Cover:{title:"Make every project pick-up-able.",body:"Make open items, owners, interfaces and next decisions readable by another project manager, rather than keeping the project's position in one person's head.",steps:["Define a one-page project position and its owner.","Keep it current on each live project.","Test it with a real handover between two project managers."]},
  Scope:{title:"Agree interfaces before offers.",body:"Reuse and refine a standard package and interface list so responsibilities are clear at offer stage, not discovered during negotiation.",steps:["Build the interface list from a current project.","Issue it with the next offers and assign owners.","Compare interface questions raised in negotiation with today."]},
  Reusable:{title:"You are ahead. Let agents prepare from the record.",body:"Your next project already starts from the last one. Agents could draft packs, compare bids and propose lessons from the record, with your people checking sources and signing off.",steps:["Pick the step taking most senior time.","Design the agent workflow, controls and human checks.","Run it on live work and measure senior time against the baseline."]},
  Visibility:{title:"Walk one finished project through to the next.",body:"In one hour with the people involved, establish how the last project's knowledge reached the next one and who held it. The missing visibility is the first finding.",steps:["Run the walk-through.","Name the weak point and its owner.","Fix that point on a live project and test the handover."]}
};
const shortLabel=(id)=>LABELS[id][state.answers[id]]||"Not sure from your answers";
const range=(values,unit="")=>values?`${values[0]} to ${values[2]}${unit}`:"Not enough information";
const about=(value)=>value==null?"Not available":`about ${Math.round(value)}`;
const flags=report=>new Set(report.your_view.tailoring);
function strip(report){
  return ["S1","S2","S3","S4"].map((id,i)=>{const pts=report.points[id],kind=pts==null?"grey":pts===3?"green":pts===2?"amber":"",weak=report.weak_question===id&&!report.visibility_gap&&report.reuse_band!=="Reusable";
    return `<div class="as-s ${kind} ${weak?"weak":""}"><div class="h"><span>${["Start","Holder","Cover","Scope"][i]}</span><span class="pts">${pts==null?"?":pts}/3</span></div><div class="a">${esc(shortLabel(id))}</div><div class="m">${esc(pts==null?"Not sure: no data.":CONSEQUENCES[id][pts===3?2:pts===2?1:0])}</div>${weak?'<span class="flag">Leaks here first</span>':""}</div>`;}).join("");
}
function result(){
  const report=assess(state.answers),f=flags(report),gap=report.visibility_gap,fix=FIXES[gap?"Visibility":report.reuse_band==="Reusable"?"Reusable":report.weak_point]||FIXES.Visibility;
  const team={flat:"isn't growing",slower:"is growing more slowly than the work",with_work:"is growing with the work"}[state.answers.G1]||"has an uncertain growth plan";
  const remit={build:"while holding projects through construction",build_operate:"while holding projects through construction and into operation",services:"while offering construction or procurement services to others",same:"on the same model, with more of it"}[state.answers.D3]||"";
  const headline=gap?"you can't yet see what your next project starts from":report.reuse_band==="Reusable"?"each project already starts from the last one; the next step is agentic":report.headline?.split(": ")[1]?.replace(/\.$/,"")||"there is a knowledge gap";
  const headlineLead=report.growth_multiple_mid===null?"Your next project:":report.growth_multiple_mid<=1?"At your current pace:":state.answers.G1==="with_work"?"More projects and a growing team:":"More projects, same team, bigger remit:";
  const projectDirection=state.answers.D2==="not_sure"?"Your two-year project target is not yet clear.":`You want ${shortLabel("D2")} ${shortLabel("D2")==="1"?"project":"projects"} a year.`;
  const callTitle=f.has("board_plan")?"30 minutes with Yorik on the AI plan your board expects.":state.answers.G1==="with_work"?"30 minutes with Yorik on making project knowledge reusable.":"30 minutes with Yorik on carrying more with the same team.";
  const years=report.growth_multiple_mid!=null?(report.growth_multiple_mid<=1?"Same pace":`${report.growth_multiple_mid}×`):report.at_once?`${report.at_once[1]} at once`:"Not sure";
  const weeks=report.rebuild_weeks_per_year_at_target||report.rebuild_weeks_per_year_today;
  const senior=report.senior_days_per_week_checking;
  const scoreStats=[
    [gap?"Not visible":`${report.reuse_score_0_100}/100`,gap?"Reuse score: three or more unknown answers":`Reuse score: ${report.reuse_band}`],
    [report.team_band||"Not sure",`Team ${team}; ${esc(shortLabel("G2"))} with EPC-scale experience`],
    [years,report.growth_multiple_mid!=null?`projects a year wanted (${shortLabel("D1")} today, ${shortLabel("D2")} target)`:`projects your team can run at once`],
    ...(weeks?[[`~${Math.round(weeks[1])} ${Math.round(weeks[1])===1?"wk":"wks"}`,`a year re-creating context (${range(weeks)})`]]:senior?[[`~${senior[1]} days`,`of each senior week spent checking`]]:[])
  ];
  const statHtml=scoreStats.map(([n,label])=>`<div><div class="v">${esc(n)}</div><div class="l">${esc(label)}</div></div>`).join("");
  const date=n=>{const d=new Date();d.setDate(d.getDate()+n);return new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(d).replace(",","");};
  const steps=fix.steps.map((item,i)=>`<li><div><span>By ${date([30,60,90][i])}</span><b>${["30 days","60 days","90 days"][i]}</b></div><div>${esc(item)}</div></li>`).join("");
  const viewNote=(checks)=>checks.filter(([flag])=>f.has(flag)).map(([,copy])=>copy).join(" ");
  const capView=viewNote([["people_limit","You see people's time, not finance or grid, as the limit. These numbers show where that time goes."],["soften_capacity","You see finance or grid as the bigger limit. These figures show what the team would have to carry when those constraints clear."]]);
  const fixView=viewNote([["record_first","You said a new hire could not find what they need without asking. The record comes first."],["board_plan","This can be the first page of the AI plan your board expects: one priority, one pilot and a measure."]]);
  const teamFix=(report.team_band==="Stretched"||["none","one"].includes(state.answers.G2))?"Pair the fix with the team: two people learn the EPC-scale step on a live project, so it does not rest on one person.":"";
  const agentView=viewNote([["tools_vs_workflow","You have tried AI tools without changing how projects run. Shared work changes when the workflow and its controls change."],["already_shifting","AI is already changing how your projects run. Make that change shared, checked and repeatable."],["bid_comparison_ready","You would trust AI to prepare a bid comparison if your team checked it. That could be a first agentic step once the record exists."],["trust_pilot","Start with a shadow run on a closed tender and compare the agent's preparation with the decision your team made."]]);
  const view=copy=>copy?`<p class="as-view"><b>Your view</b>${esc(copy)}</p>`:"";
  const weeksBox=weeks?`<div class="as-money"><span class="k">Re-creating context, ${report.rebuild_weeks_per_year_at_target?"at your target":"today"}</span><div class="big">${about(weeks[1])} weeks a year</div><p>Range ${range(weeks)} weeks. ${report.rebuild_fte_at_target?`About ${report.rebuild_fte_at_target[1]} of a person (${range(report.rebuild_fte_at_target)}).`:""} These are your input ranges, not a forecast.</p></div>`:"";
  const seniorBox=senior?`<div class="as-money"><span class="k">Senior time on checking</span><div class="big">${about(senior[1])} days a week</div><p>${range(senior)} days of each senior week go on checking and coordinating, rather than deciding.</p></div>`:"";
  const comparisons=[
    ["Start the next project","S1","An agent drafts packages, interface lists and tender material from the last approved record. Every line links to a source; gaps are flagged.","The PM checks and approves what goes to market."],
    ["Compare bids",null,"An agent keeps originals, maps returns to your criteria, flags gaps and drafts clarifications.","People judge, shortlist and send every message."],
    ["Hold scope and interfaces","S4","Agents track owners, comments and changes against the agreed interface list.","People negotiate, accept risk and approve contracts."],
    ["Carry the lessons","S2","At each stage gate an agent proposes what to retain. The named owner approves it into the record.","The owner approves lessons and template changes."],
    ["Cover a stretched PM","S3","Another person reads open items, owners and decisions from the project record.","A senior person reassigns responsibility."]
  ];
  const rows=comparisons.map(([name,id,next,decides])=>`<tr class="${id===report.weak_question?"hl":""}"><td>${name}</td><td data-k="Today">${id?esc(shortLabel(id)):"Not asked in this assessment. Validate the current comparison process in a pilot."}</td><td data-k="With a record and agents">${esc(next)}</td><td data-k="Who decides" class="who">${esc(decides)}</td></tr>`).join("");
  const rebuildValues={lt1:"0 / 0.5 / 1 weeks","1_2":"1 / 1.5 / 2 weeks","3_4":"3 / 3.5 / 4 weeks","5_plus":"5 / 6 / 8 weeks"};
  const seniorValues={lt_quarter:"0 / 15 / 25%",quarter_half:"25 / 37.5 / 50%",over_half:"50 / 62.5 / 75%",nearly_all:"75 / 85 / 95%"};
  const inputs=[["Target",shortLabel("D2"),report.projects_per_year_target,"projects a year"],["Rebuild per project",shortLabel("C2"),rebuildValues[state.answers.C2]||null,""],["Senior time checking",shortLabel("C3"),seniorValues[state.answers.C3]||null,"of a five-day week"]];
  const inputRows=inputs.map(([name,value,computed,unit])=>`<tr><td data-k="Input">${name}</td><td data-k="Your answer">${esc(value)}</td><td data-k="Used as (low / mid / high)">${esc(computed?`${Array.isArray(computed)?computed.join(" / "):computed} ${unit}`: "No estimate used")}</td></tr>`).join("");
  const email=`<section class="as-band as-tint" id="report"><div class="as-wrap as-grid"><div><p class="as-label">Optional</p><h2 class="as-h2">Email me the two-page CEO report.</h2><p class="as-lead">Get your result, its inputs and three questions to bring to a call. When you request it, Ignis also receives your details and answers to review the result.</p></div><form class="as-form" data-report-form><label>First name<input name="firstName" required autocomplete="given-name"></label><label>Work email<input name="email" type="email" required autocomplete="email"></label><label>Company (optional)<input name="company" autocomplete="organization"></label><label>Role<select name="role"><option value="ceo">CEO or founder</option><option value="md">Managing director</option><option value="executive">Other executive</option></select></label><label class="full">How is AI used in this work today? (optional)<select name="aiUse"><option value="not_sure">Prefer not to say</option><option value="none">Not at all</option><option value="individual">Individuals with a chat assistant</option><option value="templates">Shared prompts or templates</option><option value="workflow">A shared workflow with checks and sign-off</option></select></label><label class="full consent"><input type="checkbox" name="consent" value="yes" required><span>Email me the report and share my details and answers with Ignis for review. Ignis may contact me once about the result. This does not subscribe me to marketing emails. See the <a href="/privacy">Privacy notice</a>.</span></label><button class="as-btn as-btn-dark" type="submit">Email the report ↗</button><p class="as-result-form-status" role="status" aria-live="polite" data-status></p></form></div></section>`;
  return `<div class="as-result"><section class="as-hero as-result-intro"><div class="as-hero-media" aria-hidden="true"></div><div class="as-wrap"><div class="as-result-topbar"><button type="button" data-back>← Review answers</button><button type="button" data-restart>Start again</button></div><div class="as-restart-confirm" data-restart-confirm hidden><p>Start again? This clears the answers saved in this browser.</p><div class="as-btn-row"><button type="button" class="as-btn as-btn-light" data-restart-now>Clear and restart</button><button type="button" class="as-btn as-btn-outline" data-restart-cancel>Keep this result</button></div></div><p class="as-eyebrow">/ Your AI Score</p><h1>${esc(headlineLead)} <span class="as-serif as-grad">${esc(headline)}.</span></h1><p class="as-hero-support">${esc(projectDirection)} Your team ${esc(team)} ${esc(remit)}. This result shows what the next project can reuse and where to start.</p><div class="as-stats">${statHtml}</div><p class="as-note">Built from your 17 answers. Your view and your ranges, not an external benchmark or a verified audit.</p>${REPORT_EMAIL_ENABLED?'<div class="as-btn-row"><a class="as-btn as-btn-light" href="#report">Get the two-page executive report ↓</a></div>':""}</div></section>
  <section class="as-band"><div class="as-wrap"><p class="as-label">${report.reuse_band==="Reusable"?"What carries forward":"Where it gets stuck"}</p><h2 class="as-h2">${report.reuse_band==="Reusable"?"What the next project can reuse":"Where the knowledge leaks"}</h2><p class="as-lead">Your next project enters procurement while the current one is mid-way. Your answers show what it hands on.</p><div class="as-strip">${strip(report)}</div><p class="as-note">${gap?'You answered “Not sure” to three or more reuse questions. The first task is to see how one project hands knowledge to the next.':report.reuse_band==="Reusable"?'Your answers show a reusable handover. The next step is to test what an agent could prepare from the approved record, with your team checking the sources and decisions.':`Why ${report.weak_point} comes first: it is the lowest-scoring known step.`} Standard used: a reusable record, an owner, cover within days and interfaces agreed before offers. This is a practitioner standard, not a survey.</p></div></section>
  <section class="as-band as-tint"><div class="as-wrap"><p class="as-label">Capacity and cost</p><h2 class="as-h2">${f.has("soften_capacity")?"What the team would have to carry when other constraints clear":"Your capacity gap, and what it costs"}</h2><p class="as-lead">${report.growth_multiple_mid&&report.growth_multiple_mid>1?`To grow from ${esc(shortLabel("D1"))} projects a year today to ${esc(shortLabel("D2"))} in two years, each project needs to take less of the team.`:"Even at the current pace, more scope can demand more of the same people."}</p><div class="as-stats"><div><div class="v">${esc(shortLabel("D1"))}</div><div class="l">projects a year today</div></div><div><div class="v">${esc(shortLabel("D2"))}</div><div class="l">target in two years</div></div><div><div class="v">${esc(shortLabel("C1"))}</div><div class="l">at once with today's team</div></div><div><div class="v">${esc(report.team_band||"Not sure")}</div><div class="l">team coverage</div></div></div><div class="as-two">${weeksBox||'<p>Answer the rebuild question to see the weeks.</p>'}${seniorBox}</div>${view(capView)}<table class="as-table stack"><thead><tr><th>Input</th><th>Your answer</th><th>Used in the reading</th></tr></thead><tbody>${inputRows}<tr><td>A person-year</td><td>Ignis assumption</td><td>46 working weeks</td></tr></tbody></table><p class="as-note">Low, middle and high multiply your ranges. These are not savings or a forecast; a pilot would measure what can be recovered.</p></div></section>
  <section class="as-band"><div class="as-wrap as-grid"><p class="as-label">The one thing to fix first</p><div><h2 class="as-h2">${esc(fix.title)}</h2><p class="as-lead">${esc(fix.body)} ${["build_operate","services"].includes(state.answers.D3)?"Decide what the business must own, operate or offer, and design the record to last that long.":""}</p>${teamFix?`<p class="as-lead">${esc(teamFix)}</p>`:""}${view(fixView)}<ol class="as-moves">${steps}</ol></div></div></section>
  <section class="as-band as-dark"><div class="as-wrap"><p class="as-label">An agentic way of working</p><h2 class="as-h2">How your team could carry more projects <span class="as-serif">without adding headcount.</span></h2><p class="as-lead">Code checks. AI prepares. People decide. This is an illustrative design, not a claimed saving.</p><table class="as-table stack"><thead><tr><th>Step</th><th>Today, from your answers</th><th>With a reusable record and agents</th><th>Who decides</th></tr></thead><tbody>${rows}</tbody></table>${view(agentView)}<p class="as-note">Agents can only reuse what is written down, owned and checked. That is why the first fix comes first.</p></div></section>
  <section class="as-band"><div class="as-wrap as-cta-band"><div><p class="as-label">Next step</p><h2 class="as-h2">${esc(callTitle)}</h2><p class="as-lead">Bring this result. We will walk how one project's knowledge reaches the next, test the proposed fix against your work and decide whether mapping it is worth doing. No documents needed.</p><p class="as-note">Yorik Tisseau brings 17 years building commercial capability where the work or market was new, including experience at bp, RWE and Bouygues.</p></div><div class="as-btn-row"><a class="as-btn as-btn-dark" href="/contact?source=ai-score-v10">Pick a time ↗</a>${REPORT_EMAIL_ENABLED?'<a class="as-textlink" href="#report">Email me the two-page report ↓</a>':""}</div></div></section>${REPORT_EMAIL_ENABLED?email:""}</div>`;
}
function render(){
  mode();
  if(state.screen==="landing"){document.querySelectorAll("[data-start]:not([data-no-label])").forEach(button=>button.innerHTML=((saved&&Object.keys(saved.answers).length)||Object.keys(state.answers).length?"Resume the score":"Start the 5-minute score")+' <span aria-hidden="true">↗</span>');return;}
  app.innerHTML=state.screen==="intro"?intro():state.screen==="questions"?questions():result();
  save();
  if(state.screen==="questions")requestAnimationFrame(()=>focusQuestion(state.active));
}
function start(){state=Object.keys(state.answers).length?state:fresh();if(!Object.keys(state.answers).length)track("ai_score_started");if(state.screen==="landing"){state.screen=state.resumeScreen||"intro";delete state.resumeScreen;}render();scrollTo(0,0);}
function back(){
  clearTimeout(timer);
  if(state.screen==="result"){state.screen="questions";state.part=3;state.active=4;}
  else if(state.screen==="questions"){state.screen="intro";}
  else if(state.part>0){state.part--;state.screen="questions";state.active=PARTS[state.part].end-PARTS[state.part].start-1;}
  else{state.screen="landing";}
  render();scrollTo(0,0);
}
document.addEventListener("click",event=>{
  if(event.target.closest("[data-start]"))start();
  if(event.target.closest("[data-back]"))back();
  if(event.target.closest("[data-save]")){track("ai_score_saved",{completed_questions:IDS.filter(id=>state.answers[id]!==undefined).length});state.resumeScreen=state.screen;state.screen="landing";saved={...state};save();render();scrollTo(0,0);}
  if(event.target.closest("[data-begin]")){state.screen="questions";state.active=0;render();scrollTo(0,0);}
  const button=event.target.closest("[data-answer]");if(button)answer(button.dataset.id,button.dataset.answer);
  if(event.target.closest("[data-next]")){if(state.part<3){state.part++;state.screen="intro";}else{state.screen="result";if(!state.completionTracked){track("ai_score_completed");state.completionTracked=true;}}render();scrollTo(0,0);}
  if(event.target.closest("[data-restart]")){app.querySelector("[data-restart-confirm]").hidden=false;}
  if(event.target.closest("[data-restart-cancel]")){app.querySelector("[data-restart-confirm]").hidden=true;}
  if(event.target.closest("[data-restart-now]")){localStorage.removeItem(KEY);saved=null;state=fresh();render();scrollTo(0,0);}
});
app.addEventListener("change",event=>{if(event.target.matches(".ar-dot input"))answer(event.target.name,event.target.value);});
app.addEventListener("pointerover",event=>{const dot=event.target.closest(".ar-dot");if(!dot)return;const group=dot.closest(".ar-stack-item"),n=Number(dot.dataset.point);group.querySelectorAll(".ar-dot").forEach(item=>item.classList.toggle("is-lit",Number(item.dataset.point)<=n));});
app.addEventListener("pointerout",event=>{const dot=event.target.closest(".ar-dot");if(!dot||dot.contains(event.relatedTarget))return;const group=dot.closest(".ar-stack-item"),q=group.dataset.questionId,codes=["sd","d","n","a","sa"],n=codes.indexOf(state.answers[q])+1;group.querySelectorAll(".ar-dot").forEach(item=>item.classList.toggle("is-lit",Number(item.dataset.point)<=n));});
app.addEventListener("submit",async event=>{
  if(!event.target.matches("[data-report-form]"))return;
  event.preventDefault();
  const form=event.target,data=new FormData(form),status=form.querySelector("[data-status]");
  const payload={version:VERSION,action:"email",attemptId:state.attemptId,answers:state.answers,firstName:data.get("firstName"),email:data.get("email"),company:data.get("company"),role:data.get("role"),aiUse:data.get("aiUse"),consent:data.get("consent")==="yes"};
  const submit=form.querySelector('[type="submit"]');submit.disabled=true;status.textContent="Sending…";status.dataset.kind="";
  try{const response=await fetch("/api/assessment-report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const body=await response.json();if(!response.ok)throw Error(body.error||"That didn't send.");form.innerHTML=`<div role="status" aria-live="polite"><p class="as-label">Report requested</p><h3 tabindex="-1">Thank you, ${esc(data.get("firstName"))}.</h3><p class="as-lead">Your two-page report is on its way to ${esc(data.get("email"))}. Want to test the first fix against your team's work?</p></div><a class="as-btn as-btn-dark" href="/contact?source=ai-score-v10">Pick a time with Yorik ↗</a>`;form.querySelector("h3").focus();track("ai_score_report_requested");}
  catch(error){status.textContent=`${error.message} Your result is still here; try again later.`;status.dataset.kind="error";submit.disabled=false;}
});
render();
