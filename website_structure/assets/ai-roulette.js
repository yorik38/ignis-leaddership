import {maturity,transformationBranch as transformationBranchQ,adoptionBranch as adoptionBranchQ,structureFor,evaluate,archetypes,dimensionLabels,sectionLabels,bandLabels,movesFor,startingPlanFor,maturityStages} from "./ai-roulette-model.mjs";
import {maturitySlices,slicePath,labelPosition} from "./ai-roulette-wheel.mjs";

const app=document.getElementById("ar-app");
const landing=document.querySelector(".ar-landing");
const STORAGE_KEY="ar-progress-v2";
const FOCUS_STAGES=new Set(["landing","segment","branch_t","branch_a","question","pause","gate"]);

const blankState=()=>({stage:"landing",segment:null,transformationBranch:null,adoptionBranch:null,sectionIdx:0,qIdx:0,answers:{},emailCaptured:false,capturedEmail:null,capturedName:null,result:null});
let state=blankState();

function saveProgress(){
  if(state.stage==="landing"||state.stage==="result")return;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(_e){}
}
function loadProgress(){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null}catch(_e){return null}}
function clearProgress(){try{localStorage.removeItem(STORAGE_KEY)}catch(_e){}}

const overlay=document.querySelector("[data-menu-overlay]"),menuOpen=document.querySelector("[data-menu-open]"),menuClose=document.querySelector("[data-menu-close]");
let previousFocus=null;
function setMenu(open){if(!overlay||!menuOpen)return;if(open)previousFocus=document.activeElement;overlay.classList.toggle("is-open",open);overlay.setAttribute("aria-hidden",String(!open));menuOpen.setAttribute("aria-expanded",String(open));document.body.classList.toggle("menu-open",open);document.querySelector(".site-header").inert=open;document.querySelector("main").inert=open;document.querySelector("footer").inert=open;if(open)menuClose?.focus();else previousFocus?.focus()}
menuOpen?.addEventListener("click",()=>setMenu(true));
menuClose?.addEventListener("click",()=>setMenu(false));
overlay?.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>setMenu(false)));
document.addEventListener("keydown",event=>{if(!overlay?.classList.contains("is-open"))return;if(event.key==="Escape"){setMenu(false);return}if(event.key==="Tab"){const items=[...overlay.querySelectorAll("a,button")],first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
const header=document.querySelector(".site-header");
function updateHeader(){header?.classList.toggle("is-scrolled",window.scrollY>24)}
updateHeader();window.addEventListener("scroll",updateHeader,{passive:true});

const optionMarkup=(name,value,label,checked,type="radio")=>`<label class="ar-option"><input type="${type}" name="${name}" value="${value}" ${checked?"checked":""}><span>${label}</span></label>`;
function focusContent(){window.requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:"instant"});const target=state.stage==="landing"?landing.querySelector("h1"):app.querySelector("#ar-question-title")||app.querySelector("h2")||app.querySelector("h3");if(target){target.tabIndex=-1;target.focus({preventScroll:true})}})}

const structure=()=>structureFor(state.transformationBranch,state.adoptionBranch);
const currentSection=()=>structure()[state.sectionIdx];

function render({focus=false}={}){
  landing.hidden=state.stage!=="landing";
  app.hidden=state.stage==="landing";
  document.body.classList.toggle("ar-focus-mode",FOCUS_STAGES.has(state.stage));
  const mark=document.querySelector(".ar-mark");if(mark)mark.hidden=state.stage!=="landing";
  if(state.stage!=="landing"){
    app.innerHTML=
      state.stage==="segment"?renderSegment():
      state.stage==="branch_t"?renderBranch(transformationBranchQ,"Transformation","Are you exploring this for clients or for your own organisation?"):
      state.stage==="branch_a"?renderBranch(adoptionBranchQ,"Adoption","Are you mainly on the front end of commercial work, or the back end?"):
      state.stage==="question"?renderQuestionStage():
      state.stage==="pause"?renderPause():
      state.stage==="gate"?renderGate():
      renderResult();
  }
  if(focus)focusContent();
  saveProgress();
}

function renderMaturityWheel(){
  const pegs=maturitySlices.map(slice=>{const rad=slice.start*Math.PI/180,x=200+194*Math.sin(rad),y=200-194*Math.cos(rad);return `<circle class="ar-wheel-peg" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="5"/>`}).join("");
  return `<div class="ar-wheel-wrap"><div class="ar-wheel-pointer" aria-hidden="true"></div><svg class="ar-wheel" viewBox="0 0 400 400" role="img" aria-label="Wheel showing seven stages of AI maturity, from no access to production"><defs><radialGradient id="ar-wheel-sheen" cx="32%" cy="24%" r="78%"><stop offset="0%" stop-color="#fff" stop-opacity=".24"/><stop offset="45%" stop-color="#fff" stop-opacity=".05"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="194" fill="#071016" stroke="#6c7780" stroke-width="3"/>${maturitySlices.map(slice=>{const p=labelPosition(slice.start,slice.end);return `<g class="ar-wheel-slice"><path d="${slicePath(slice.start,slice.end)}" fill="${slice.color}"/><text x="${p.x}" y="${p.y}" transform="rotate(${p.angle} ${p.x} ${p.y})" text-anchor="middle" dominant-baseline="middle" fill="${slice.textDark?"#0f1419":"#f5f7f8"}">${slice.shortLabel}</text></g>`}).join("")}<circle cx="200" cy="200" r="194" fill="url(#ar-wheel-sheen)"/>${pegs}<circle cx="200" cy="200" r="44" fill="#080d11" stroke="#fff" stroke-width="4"/><text x="200" y="205" text-anchor="middle" dominant-baseline="middle" class="ar-wheel-hub">/</text></svg></div>`;
}
function renderMaturityLegend(){return `<div class="ar-legend ar-maturity-legend" role="list" aria-label="AI maturity stages">${maturityStages.map(stage=>`<span role="listitem"><i class="ar-legend-dot" style="background:${stage.color}" aria-hidden="true"></i>${stage.label}</span>`).join("")}</div>`}

function topBar(backLabel="Back"){return `<div class="ar-top-bar"><button class="ar-back" type="button" data-back>← ${backLabel}</button><button class="ar-text-button" type="button" data-save-exit>Save &amp; finish later</button></div>`}

function renderSegment(){return `<section aria-labelledby="ar-segment-title">${topBar("Back")}<h2 class="ar-section-title" id="ar-segment-title">Which best describes you?</h2><p class="ar-choose-note">The questions underneath are the same either way. This only changes how your result is framed.</p><form data-segment-form><fieldset class="ar-options"><legend class="skip-link">Your role</legend>${optionMarkup("segment","decision_maker","Decision maker — Partner, Director, Head of Bids, COO",state.segment==="decision_maker")}${optionMarkup("segment","practitioner","Practitioner — bid manager, delivery lead, consultant",state.segment==="practitioner")}</fieldset><div class="ar-flow-actions"><button class="ar-button" type="submit">Continue <span aria-hidden="true">→</span></button></div></form></section>`}

function renderBranch(q,kicker,intro){const checked=q.id==="T0"?state.transformationBranch:state.adoptionBranch;return `<section aria-labelledby="ar-branch-title">${topBar()}<p class="ar-category-kicker">${kicker.toUpperCase()}</p><h2 class="ar-section-title" id="ar-branch-title">${q.text}</h2><p class="ar-choose-note">${intro}</p><form data-branch-form data-branch-id="${q.id}"><fieldset class="ar-options"><legend class="skip-link">${q.text}</legend>${q.options.map(o=>optionMarkup(q.id,o.value,o.label,checked===o.value)).join("")}</fieldset><div class="ar-flow-actions"><button class="ar-button" type="submit">Continue <span aria-hidden="true">→</span></button></div></form></section>`}

const SECTION_GROUPS=[[0],[1,2,3],[4,5,6],[7,8,9]];
function renderSegmentRow(){
  return `<div class="ar-seg-row" role="progressbar" aria-label="Quiz progress" aria-valuenow="${state.sectionIdx+1}" aria-valuemin="0" aria-valuemax="${structure().length}">${SECTION_GROUPS.map(group=>`<div class="ar-seg-group">${group.map(i=>{const cls=i<state.sectionIdx?"is-done":i===state.sectionIdx?"is-active":"";return `<span class="ar-seg ${cls}"></span>`}).join("")}</div>`).join("")}</div>`;
}
function progressHeader(){
  const sec=currentSection(),total=structure().length,label=sectionLabels[sec.section],dimName=(dimensionLabels[sec.dimension]||"").split(" — ")[0];
  return `${topBar()}<div class="ar-progress-block"><div class="ar-progress-top"><p class="ar-category-kicker">${label.title.toUpperCase()}</p><span class="ar-step-label">Step ${state.sectionIdx+1} of ${total}</span></div>${renderSegmentRow()}<p class="ar-subdim-heading"><em>${String(state.sectionIdx+1).padStart(2,"0")}</em> · ${dimName.toUpperCase()}</p></div>`;
}

function renderQuestionBlock(q,isActive){
  const saved=state.answers[q.id];
  const options=q.type==="scale"?[1,2,3,4,5].map(v=>optionMarkup(q.id,v,String(v),String(saved)===String(v))):q.options.map(o=>optionMarkup(q.id,o.value,o.label,saved===o.value));
  return `<div class="ar-stack-item ${isActive?"is-active":"is-done"}"><h2 class="ar-question" ${isActive?'id="ar-question-title"':""}>${q.text}</h2>${q.type==="scale"?`<p class="ar-hint">1 · ${q.low} — 5 · ${q.high}</p>`:""}<fieldset class="ar-options ${q.type==="scale"?"ar-scale":""}" ${isActive?"":"disabled"}><legend class="skip-link">${q.text}</legend>${options.join("")}</fieldset></div>`;
}
function renderQuestionStage(){
  const sec=currentSection();
  const blocks=[];
  for(let i=0;i<=state.qIdx&&i<sec.questions.length;i++)blocks.push(renderQuestionBlock(sec.questions[i],i===state.qIdx));
  return `<section class="ar-flow ar-stack" aria-labelledby="ar-question-title">${progressHeader()}<div class="ar-stack-list">${blocks.join("")}</div></section>`;
}

function renderPause(){
  const total=structure().length;
  return `<section class="ar-pause" aria-labelledby="ar-pause-title">${topBar()}<p class="ar-category-kicker">Step ${state.sectionIdx+1} of ${total} done</p><h2 id="ar-pause-title">Nicely done.</h2><p class="ar-choose-note">Take a breath — the next set is up next.</p><div class="ar-flow-actions"><button class="ar-button" type="button" data-continue-section>Continue <span aria-hidden="true">→</span></button></div></section>`;
}

function renderGate(){
  return `<section class="ar-gate" aria-labelledby="ar-gate-title">${topBar()}<p class="ar-category-kicker">Part 1 done. Nicely done.</p><h2 id="ar-gate-title">Where do we send your score?</h2><p class="ar-choose-note">Enter your name and email and we'll open your full report as a draft email once you finish. Nothing is sent to Ignis or stored — this stays on your device and in your own mail app.</p><form data-gate-form><div class="ar-capture-fields"><label>First name <input name="name" autocomplete="given-name" required></label><label>Email <input name="email" type="email" autocomplete="email" inputmode="email" required></label></div><div class="ar-flow-actions"><button class="ar-button" type="submit">Continue <span aria-hidden="true">→</span></button></div></form></section>`;
}

const segmentFraming={decision_maker:{experimenting:" At firm level, that is exposure worth naming before a competitor closes the gap.",design:" At firm level, resolving this is where budget should go next, not into a wider rollout.",pilot:" At firm level, the cost of waiting here is higher than the cost of testing it now."},practitioner:{experimenting:" Worth raising with your leadership before you are asked to move faster than the groundwork allows.",design:" Worth pushing your leadership to resolve before this lands on your desk as a done deal.",pilot:" Worth flagging to your leadership before this gets scaled onto your team without a review point."}};
const segmentGapCallout={decision_maker:"Worth checking against reality: practitioners often know the real day-to-day answer before leadership does. If you have not asked your team directly, treat this as a starting hypothesis, not the final word.",practitioner:"Leaders at firms like yours typically self-report one stage higher than practitioners report living day to day. If your leadership's picture does not match this, that gap is worth raising, directly."};
const segmentLabel={decision_maker:"Decision maker view",practitioner:"Practitioner view"};
const segmentShareLine={decision_maker:"Worth sending to your team for a reality check — they can take their own assessment at https://www.ignisleadership.com/ai-roulette",practitioner:"Worth forwarding to your leadership: https://www.ignisleadership.com/ai-roulette"};
const humanBoundary="People retain the final call on customer commitments, price, risk positions and anything that affects who gets paid, hired or trusted.";

function levelLabel(pct){return pct<40?"Needs work":pct<70?"Getting there":"Strength"}

function reportText(){
  const r=state.result;
  const sorted=Object.entries(r.dimensions).sort((a,b)=>a[1]-b[1]);
  const second=sorted[1];
  const maturityStage=maturityStages.find(s=>s.id===state.answers.M1);
  const lines=[
    `Your AI Roulette result`,
    `Archetype: ${r.archetype.name} — ${r.archetype.line}`,
    `Score: ${r.score}/100 (indicative only) · ${bandLabels[r.band]}`,
    `Weakest lever: ${dimensionLabels[r.constraint]}`,
    "",
    maturityStage?`AI maturity today: ${maturityStage.label} — ${maturityStage.note}`:"",
    "",
    "All levers:",
    ...sorted.map(([key,value])=>`- ${dimensionLabels[key]}: ${value}% (${levelLabel(value)})`),
    "",
    `Fix first — ${dimensionLabels[r.constraint]}:`,
    ...movesFor(r.constraint).map((m,i)=>`${i+1}. ${m}`),
    "",
    second?`Next after that — ${dimensionLabels[second[0]]}:`:"",
    second?movesFor(second[0])[0]||"":"",
    "",
    "30-day starting plan:",
    ...startingPlanFor(r.band).map((item,i)=>`${i+1}. ${item}`),
    "",
    "What stays human: "+humanBoundary,
    "",
    "This is an indicative interpretation of self-reported answers, not an organisational assessment or a benchmark.",
    "",
    segmentShareLine[state.segment]||"Know someone who should see this? They can take their own assessment: https://www.ignisleadership.com/ai-roulette"
  ].filter(Boolean);
  return lines.join("\n");
}

function renderResult(){
  const r=state.result;
  const sorted=Object.entries(r.dimensions).sort((a,b)=>a[1]-b[1]);
  const second=sorted[1];
  const maturityStage=maturityStages.find(s=>s.id===state.answers.M1);
  const moves=movesFor(r.constraint);
  const interpretation=(r.band==="experimenting"?`Your answers suggest you're early — there's a useful opening, but the work needs mapping before a governed AI pilot.`:r.band==="design"?`You have enough to design one bounded change, provided the unresolved conditions are tested.`:`Your answers suggest real foundations for a bounded pilot. Test them against live work before expanding.`)+(segmentFraming[state.segment]?.[r.band]||"");
  const gapCallout=segmentGapCallout[state.segment]||"";
  const shareHref=`mailto:?subject=${encodeURIComponent(`AI Roulette result: ${r.archetype.name}`)}&body=${encodeURIComponent(`I ran Ignis's AI Roulette and came out as "${r.archetype.name}" — ${r.archetype.line}\n\nScore: ${r.score}/100 (indicative only). Weakest lever: ${dimensionLabels[r.constraint]}.\n\nTake a few minutes and see where you land: https://www.ignisleadership.com/ai-roulette`)}`;
  const actions=state.segment==="practitioner"?`<a class="ar-button" href="${shareHref}">Share this with your leader <span aria-hidden="true">↗</span></a><a class="ar-outline" href="/contact">Talk it through <span aria-hidden="true">↗</span></a>`:`<a class="ar-button" href="/contact">Talk it through <span aria-hidden="true">↗</span></a><a class="ar-outline" href="/commercial-ai-adoption">Explore the Ignis approach <span aria-hidden="true">↗</span></a>`;
  const emailHref=state.capturedEmail?`mailto:${state.capturedEmail}?subject=${encodeURIComponent("Your AI Roulette report")}&body=${encodeURIComponent(reportText())}`:null;
  return `<section class="ar-result" aria-labelledby="ar-result-title">
    <div class="ar-result-head">
      <p class="ar-result-kicker">Your AI Roulette result${segmentLabel[state.segment]?` · ${segmentLabel[state.segment]}`:""}</p>
      <span class="ar-band">${bandLabels[r.band]}</span>
      <h2 id="ar-result-title">${r.archetype.name}</h2>
      <p class="ar-result-lead">${r.archetype.line} ${r.archetype.detail}</p>
      <p class="ar-result-score">${r.score}<span>/100, indicative only</span></p>
      <p class="ar-result-lead">${interpretation}</p>
      ${gapCallout?`<p class="ar-caveat"><strong>The gap worth checking:</strong> ${gapCallout}</p>`:""}
      ${maturityStage?`<p class="ar-caveat"><strong>AI maturity today:</strong> ${maturityStage.label} — ${maturityStage.note}</p>`:""}
      <p class="ar-caveat">This is an indicative interpretation of self-reported answers, not an organisational assessment or a benchmark. Nothing has been sent to Ignis or stored.</p>
    </div>
    <div class="ar-result-grid">
      <article><p class="ar-result-kicker">Fix first — ${dimensionLabels[r.constraint]}</p><h3>${moves[0]}</h3><p>${moves.slice(1).map(m=>`<span>${m}</span>`).join(" ")}</p></article>
      <article><p class="ar-result-kicker">Next after that</p><h3>${second?dimensionLabels[second[0]]:""}</h3><p>${second?movesFor(second[0])[0]:""}</p><h3>What stays human</h3><p>${humanBoundary}</p></article>
    </div>
    <div class="ar-lever-chart" aria-label="All levers, lowest to highest">${sorted.map(([key,value])=>`<div class="ar-lever-row"><span class="ar-lever-name">${dimensionLabels[key]}</span><span class="ar-lever-track"><span class="ar-lever-fill" style="width:${value}%" data-level="${levelLabel(value)}"></span></span><span class="ar-lever-value">${value}%</span></div>`).join("")}</div>
    ${r.gates.length?`<p class="ar-caveat"><strong>Why this result is bounded:</strong> ${r.gates.join(" ")}</p>`:""}
    <div class="ar-result-actions">${actions}</div>
    ${emailHref?`<div class="ar-result-actions"><a class="ar-outline" href="${emailHref}">Email me this report <span aria-hidden="true">↗</span></a></div>`:""}
    <div class="ar-result-actions"><button class="ar-text-button" type="button" data-restart>Start again</button></div>
  </section>`;
}

function goToSection(idx){state.sectionIdx=idx;state.qIdx=0;state.stage="question";render({focus:true})}

function afterSectionContinue(){
  const next=state.sectionIdx+1;
  if(next===1&&!state.transformationBranch){state.stage="branch_t";render({focus:true});return}
  if(next===4&&!state.adoptionBranch){state.stage="branch_a";render({focus:true});return}
  if(next===7&&!state.emailCaptured){state.stage="gate";render({focus:true});return}
  if(next>=structure().length){state.result=evaluate(structure(),state.answers);state.stage="result";clearProgress();render({focus:true});return}
  goToSection(next);
}

function answerCurrentQuestion(value){
  const sec=currentSection(),q=sec.questions[state.qIdx];
  state.answers[q.id]=value;
  if(state.qIdx<sec.questions.length-1){state.qIdx++;render();window.requestAnimationFrame(()=>{const active=app.querySelector(".ar-stack-item.is-active");active?.scrollIntoView({behavior:"smooth",block:"center"});const h=active?.querySelector("h2");if(h){h.tabIndex=-1;h.focus({preventScroll:true})}})}
  else{state.stage="pause";render({focus:true})}
}

function back(){
  if(state.stage==="segment"){state.stage="landing";render({focus:true});return}
  if(state.stage==="branch_t"){state.sectionIdx=0;state.qIdx=maturity.length-1;state.stage="question";render({focus:true});return}
  if(state.stage==="branch_a"){state.sectionIdx=3;state.qIdx=currentSection().questions.length-1;state.stage="question";render({focus:true});return}
  if(state.stage==="gate"){goToSection(6);return}
  if(state.stage==="pause"){state.stage="question";render({focus:true});return}
  if(state.stage==="question"){
    if(state.qIdx>0){state.qIdx--;render({focus:true});return}
    if(state.sectionIdx===0){state.stage="segment";render({focus:true});return}
    if(state.sectionIdx===1){state.stage="branch_t";render({focus:true});return}
    if(state.sectionIdx===4){state.stage="branch_a";render({focus:true});return}
    if(state.sectionIdx===7){state.stage="gate";render({focus:true});return}
    state.sectionIdx--;state.qIdx=structure()[state.sectionIdx].questions.length-1;render({focus:true});return
  }
}

function restart(){state=blankState();clearProgress();render({focus:true})}

landing.querySelector("[data-start]")?.addEventListener("click",()=>{state.stage="segment";render({focus:true})});
const resumeBtn=landing.querySelector("[data-resume]");
resumeBtn?.addEventListener("click",()=>{const saved=loadProgress();if(saved){state=saved;render({focus:true})}});

app.addEventListener("click",event=>{
  if(event.target.closest("[data-back]")){back();return}
  if(event.target.closest("[data-save-exit]")){saveProgress();state.stage="landing";render();window.alert("Saved on this device. Come back to /ai-roulette anytime to pick up where you left off.");return}
  if(event.target.closest("[data-continue-section]")){afterSectionContinue();return}
  if(event.target.closest("[data-restart]")){restart();return}
});

app.addEventListener("change",event=>{
  const input=event.target;
  if(input.closest(".ar-stack-item.is-active")){answerCurrentQuestion(input.value)}
});

app.addEventListener("submit",event=>{
  event.preventDefault();
  const form=event.target;
  if(form.matches("[data-segment-form]")){const value=new FormData(form).get("segment");if(!value){form.querySelector("input")?.focus();return}state.segment=value;state.stage="question";state.sectionIdx=0;state.qIdx=0;render({focus:true});return}
  if(form.matches("[data-branch-form]")){const id=form.dataset.branchId,value=new FormData(form).get(id);if(!value){form.querySelector("input")?.focus();return}if(id==="T0"){state.transformationBranch=value;goToSection(1)}else{state.adoptionBranch=value;goToSection(4)}return}
  if(form.matches("[data-gate-form]")){const data=new FormData(form),email=data.get("email"),name=data.get("name");if(!form.reportValidity())return;state.emailCaptured=true;state.capturedEmail=email;state.capturedName=name;goToSection(7);return}
});

document.getElementById("ar-wheel-preview").innerHTML=renderMaturityWheel();
document.getElementById("ar-landing-legend").innerHTML=renderMaturityLegend();
const savedProgress=loadProgress();
if(savedProgress&&resumeBtn)resumeBtn.hidden=false;
render();
