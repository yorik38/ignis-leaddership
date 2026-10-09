import {maturity,transformationBranch as transformationBranchQ,adoptionBranch as adoptionBranchQ,structureFor,evaluate,archetypes,dimensionLabels,sectionLabels,bandLabels,movesFor,startingPlanFor,maturityStages} from "./ai-roulette-model.mjs";

const app=document.getElementById("ar-app");
const landing=document.querySelector(".ar-landing");
const STORAGE_KEY="ar-progress-v2";
const FOCUS_STAGES=new Set(["landing","segment","intro","branch_t","branch_a","question","pause","gate"]);

const blankState=()=>({stage:"landing",segment:null,transformationBranch:null,adoptionBranch:null,sectionIdx:0,qIdx:0,answers:{},emailCaptured:false,capturedEmail:null,capturedName:null,result:null,notice:null});
let state=blankState();

function saveProgress(){
  if(state.stage==="landing"||state.stage==="result")return;
  try{const snapshot={...state,capturedEmail:null,capturedName:null,emailCaptured:false,result:null};if(state.emailCaptured)snapshot.stage="gate";localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot))}catch(_e){}
}
function loadProgress(){try{const raw=localStorage.getItem(STORAGE_KEY);const saved=raw?JSON.parse(raw):null;return saved&&saved.answers&&["segment","intro","branch_t","branch_a","question","pause","gate"].includes(saved.stage)?saved:null}catch(_e){return null}}
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
function focusContent(){window.requestAnimationFrame(()=>{const target=state.stage==="landing"?landing.querySelector("h1"):app.querySelector("#ar-question-title")||app.querySelector("h2")||app.querySelector("h3");if(state.stage==="question")app.querySelector(".ar-stack-item.is-active")?.scrollIntoView({block:"center",behavior:"instant"});else window.scrollTo({top:0,behavior:"instant"});if(target){target.tabIndex=-1;target.focus({preventScroll:true})}})}

const structure=()=>structureFor(state.transformationBranch,state.adoptionBranch);
const currentSection=()=>structure()[state.sectionIdx];

function render({focus=false}={}){
  landing.hidden=state.stage!=="landing";
  app.hidden=state.stage==="landing";
  document.body.classList.toggle("ar-focus-mode",FOCUS_STAGES.has(state.stage));
  document.body.classList.toggle("ar-is-landing",state.stage==="landing");
  const mark=document.querySelector(".ar-mark");if(mark)mark.hidden=state.stage!=="landing";
  if(state.stage!=="landing"){
    app.innerHTML=
      state.stage==="segment"?renderSegment():
      state.stage==="intro"?renderIntro():
      state.stage==="branch_t"?renderBranch(transformationBranchQ,"Transformation","Choose where you want to create new value."):
      state.stage==="branch_a"?renderBranch(adoptionBranchQ,"Adoption","Choose the commercial work you know best."):
      state.stage==="question"?renderQuestionStage():
      state.stage==="pause"?renderPause():
      state.stage==="gate"?renderGate():
      renderResult();
  }
  if(focus)focusContent();
  saveProgress();
  if(resumeBtn)resumeBtn.hidden=!loadProgress();
}

function renderMaturityLadder(){return `<div class="ar-ladder" role="img" aria-label="Seven stages of AI maturity, from no access to production">${maturityStages.map(stage=>`<div class="ar-ladder-step"><span class="ar-ladder-bar" style="background:${stage.color}"></span><span class="ar-ladder-label">${stage.label}</span></div>`).join("")}</div>`}

function topBar(backLabel="Back"){return `<div class="ar-top-bar"><button class="ar-back" type="button" data-back>← ${backLabel}</button><button class="ar-text-button" type="button" data-save-exit>Save &amp; finish later</button></div>`}

function renderSegment(){return `<section class="ar-flow ar-centered" aria-labelledby="ar-segment-title">${topBar()}<p class="ar-category-kicker">First, one quick thing</p><h2 class="ar-section-title" id="ar-segment-title">Which best describes you?</h2><p class="ar-choose-note">The questions are the same either way. This only changes how we explain your result.</p><form data-segment-form><fieldset class="ar-options"><legend class="skip-link">Your role</legend>${optionMarkup("segment","decision_maker","I lead or make decisions about commercial work",state.segment==="decision_maker")}${optionMarkup("segment","practitioner","I work in commercial or delivery teams",state.segment==="practitioner")}</fieldset><div class="ar-flow-actions"><button class="ar-button" type="submit">Continue <span aria-hidden="true">→</span></button></div></form></section>`}

const partStarts=[0,1,4,7];
function renderIntro(){const sec=structure()[state.sectionIdx],label=sectionLabels[sec.section];const part=partStarts.indexOf(state.sectionIdx)+1;return `<section class="ar-pause ar-intro" aria-labelledby="ar-intro-title">${topBar()}<p class="ar-category-kicker">Part ${part} of 4</p><h2 id="ar-intro-title">${label.title}</h2><p class="ar-choose-note">${label.blurb}</p><div class="ar-part-progress" aria-label="Part ${part} of 4">${partStarts.map((_,i)=>`<span class="${i<part?"is-current":""}"></span>`).join("")}</div><button class="ar-button" type="button" data-begin-part>${part===1?"Begin":"Keep going"} <span aria-hidden="true">→</span></button></section>`}

function renderBranch(q,kicker,intro){const checked=q.id==="T0"?state.transformationBranch:state.adoptionBranch;return `<section class="ar-flow" aria-labelledby="ar-branch-title">${topBar()}<p class="ar-category-kicker">${kicker.toUpperCase()}</p><h2 class="ar-section-title" id="ar-branch-title">${q.text}</h2><p class="ar-choose-note">${intro}</p><form data-branch-form data-branch-id="${q.id}"><fieldset class="ar-options"><legend class="skip-link">${q.text}</legend>${q.options.map(o=>optionMarkup(q.id,o.value,o.label,checked===o.value)).join("")}</fieldset><div class="ar-flow-actions"><button class="ar-button" type="submit">Continue <span aria-hidden="true">→</span></button></div></form></section>`}

const SECTION_GROUPS=[[0],[1,2,3],[4,5,6],[7,8,9]];
function renderSegmentRow(){
  const answered=structure().slice(0,state.sectionIdx).reduce((n,s)=>n+s.questions.length,0)+state.qIdx;
  return `<div class="ar-seg-row" role="progressbar" aria-label="Quiz progress" aria-valuenow="${answered}" aria-valuemin="0" aria-valuemax="60">${SECTION_GROUPS.map(group=>`<div class="ar-seg-group">${group.map(i=>{const cls=i<state.sectionIdx?"is-done":i===state.sectionIdx?"is-active":"";const fill=i===state.sectionIdx?` style="--ar-segment-fill:${Math.round((state.qIdx+1)/6*100)}%"`:"";return `<span class="ar-seg ${cls}"${fill}></span>`}).join("")}</div>`).join("")}</div>`;
}
function progressHeader(){
  const sec=currentSection(),label=sectionLabels[sec.section],dimName=(dimensionLabels[sec.dimension]||"").split(", ")[0];
  const answered=structure().slice(0,state.sectionIdx).reduce((n,s)=>n+s.questions.length,0)+state.qIdx+1;
  return `${topBar()}<div class="ar-progress-block"><div class="ar-progress-top"><p class="ar-category-kicker">${label.title.toUpperCase()}</p><span class="ar-step-label">Question ${answered} of 60</span></div>${renderSegmentRow()}<p class="ar-subdim-heading"><em>${String(answered).padStart(2,"0")}</em> · ${dimName.toUpperCase()}</p></div>`;
}

function renderQuestionBlock(q,isActive){
  const saved=state.answers[q.id];
  const body=q.type==="scale"
    ? `<div class="ar-dots-labels"><span>Disagree</span><span>Agree</span></div><fieldset class="ar-dots"><legend class="skip-link">${q.text}</legend>${[1,2,3,4,5].map(v=>`<label class="ar-dot ${Number(saved)>=v?"is-lit":""}"><input type="radio" name="${q.id}" value="${v}" aria-label="${["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"][v-1]}" ${String(saved)===String(v)?"checked":""}></label>`).join("")}</fieldset><p class="ar-scale-cue">Select how much you agree</p>`
    : `<fieldset class="ar-options"><legend class="skip-link">${q.text}</legend>${q.options.map(o=>optionMarkup(q.id,o.value,o.label,saved===o.value)).join("")}</fieldset>`;
  return `<div class="ar-stack-item ${isActive?"is-active":""}" data-question-id="${q.id}"><h2 class="ar-question" ${isActive?'id="ar-question-title"':""}>${q.text}</h2>${body}</div>`;
}
function renderQuestionStage(){
  const sec=currentSection();
  const blocks=sec.questions.map((q,i)=>renderQuestionBlock(q,i===state.qIdx));
  const complete=sec.questions.every(q=>state.answers[q.id]!==undefined);
  return `<section class="ar-flow ar-stack" aria-labelledby="ar-question-title"><div class="ar-sticky-head">${progressHeader()}</div>${state.notice?`<p class="ar-question-notice" role="alert">${state.notice}</p>`:""}<div class="ar-stack-list">${blocks.join("")}</div><div class="ar-flow-actions"><button class="ar-button" type="button" data-next-question ${complete?"":"disabled"}>Continue <span aria-hidden="true">→</span></button></div></section>`;
}

function lightDots(fieldset,through){fieldset.querySelectorAll(".ar-dot").forEach((dot,i)=>dot.classList.toggle("is-lit",i<through))}
function activateQuestion(index,{scroll=true}={}){
  const blocks=[...app.querySelectorAll(".ar-stack-item")];
  blocks.forEach((block,i)=>{block.classList.toggle("is-active",i===index);block.classList.toggle("is-muted",i!==index);const heading=block.querySelector(".ar-question");if(i===index)heading.id="ar-question-title";else heading.removeAttribute("id")});
  state.qIdx=index;
  const total=structure().slice(0,state.sectionIdx).reduce((n,s)=>n+s.questions.length,0)+index+1;
  const step=app.querySelector(".ar-step-label");if(step)step.textContent=`Question ${total} of 60`;
  const number=app.querySelector(".ar-subdim-heading em");if(number)number.textContent=String(total).padStart(2,"0");
  const progress=app.querySelector(".ar-seg.is-active");if(progress)progress.style.setProperty("--ar-segment-fill",`${Math.round((index+1)/6*100)}%`);
  app.querySelector(".ar-seg-row")?.setAttribute("aria-valuenow",String(total-1));
  if(scroll)blocks[index]?.scrollIntoView({block:"center",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  saveProgress();
}

function renderPause(){const sec=currentSection(),part=partStarts.indexOf(state.sectionIdx+1);return `<section class="ar-pause" aria-labelledby="ar-pause-title">${topBar()}<p class="ar-category-kicker">Part ${part>0?part:4} complete</p><h2 id="ar-pause-title">${sec.section==="maturity"?"Your starting point is set.":"That section is done."}</h2><p class="ar-choose-note">${sec.section==="maturity"?"Now we can look at the work, the rules and the opportunity.":"Your answers are saved on this device as you go."}</p><button class="ar-button" type="button" data-continue-section>Continue <span aria-hidden="true">→</span></button></section>`}

function renderGate(){return `<section class="ar-gate" aria-labelledby="ar-gate-title">${topBar()}<p class="ar-category-kicker">Maturity complete</p><h2 id="ar-gate-title">Keep your result close.</h2><p class="ar-choose-note">Add your name and email to continue. In this review preview, nothing is sent to Ignis and no report is emailed. Your email is held only in this open tab, not in saved progress.</p><form data-gate-form><div class="ar-capture-fields"><label>First name <input name="name" autocomplete="given-name" required></label><label>Email <input name="email" type="email" autocomplete="email" inputmode="email" required></label></div><div class="ar-flow-actions"><button class="ar-button" type="submit">Continue <span aria-hidden="true">→</span></button></div></form></section>`}

const segmentFraming={decision_maker:{experimenting:" At firm level, that is exposure worth naming before a competitor closes the gap.",design:" At firm level, resolving this is where budget should go next, not into a wider rollout.",pilot:" At firm level, the cost of waiting here is higher than the cost of testing it now."},practitioner:{experimenting:" Worth raising with your leadership before you are asked to move faster than the groundwork allows.",design:" Worth pushing your leadership to resolve before this lands on your desk as a done deal.",pilot:" Worth flagging to your leadership before this gets scaled onto your team without a review point."}};
const segmentGapCallout={decision_maker:"Worth checking against reality: people doing the day-to-day work may see AI use differently. If you have not asked your team directly, treat this as a starting hypothesis, not the final word.",practitioner:"Leadership may see a different picture of day-to-day AI use. Compare your experience with theirs and make any gap visible before deciding what to scale."};
const segmentLabel={decision_maker:"Decision maker view",practitioner:"Practitioner view"};
const segmentShareLine={decision_maker:"Worth sending to your team for a reality check, they can take their own assessment at https://www.ignisleadership.com/ai-roulette",practitioner:"Worth forwarding to your leadership: https://www.ignisleadership.com/ai-roulette"};
const humanBoundary="People retain the final call on customer commitments, price, risk positions and anything that affects who gets paid, hired or trusted.";

function levelLabel(pct){return pct<40?"Needs work":pct<70?"Getting there":"Strength"}

function reportText(){
  const r=state.result;
  const sorted=Object.entries(r.dimensions).sort((a,b)=>a[1]-b[1]);
  const second=sorted[1];
  const maturityStage=maturityStages.find(s=>s.id===state.answers.M1);
  const lines=[
    `Your AI Roulette result`,
    `Archetype: ${r.archetype.name}, ${r.archetype.line}`,
    `Score: ${r.score}/100 (indicative only) · ${bandLabels[r.band]}`,
    `Weakest lever: ${dimensionLabels[r.constraint]}`,
    "",
    maturityStage?`AI maturity today: ${maturityStage.label}, ${maturityStage.note}`:"",
    "",
    "All levers:",
    ...sorted.map(([key,value])=>`- ${dimensionLabels[key]}: ${value}% (${levelLabel(value)})`),
    "",
    `Fix first, ${dimensionLabels[r.constraint]}:`,
    ...movesFor(r.constraint).map((m,i)=>`${i+1}. ${m}`),
    "",
    second?`Next after that, ${dimensionLabels[second[0]]}:`:"",
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
  const interpretation=(r.band==="experimenting"?`Your answers suggest you're early, there's a useful opening, but the work needs mapping before a governed AI pilot.`:r.band==="design"?`You have enough to design one bounded change, provided the unresolved conditions are tested.`:`Your answers suggest real foundations for a bounded pilot. Test them against live work before expanding.`)+(segmentFraming[state.segment]?.[r.band]||"");
  const gapCallout=segmentGapCallout[state.segment]||"";
  const shareHref=`mailto:?subject=${encodeURIComponent(`AI Roulette result: ${r.archetype.name}`)}&body=${encodeURIComponent(`I ran Ignis's AI Roulette and came out as "${r.archetype.name}", ${r.archetype.line}\n\nScore: ${r.score}/100 (indicative only). Weakest lever: ${dimensionLabels[r.constraint]}.\n\nTake a few minutes and see where you land: https://www.ignisleadership.com/ai-roulette`)}`;
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
      ${maturityStage?`<p class="ar-caveat"><strong>AI maturity today:</strong> ${maturityStage.label}, ${maturityStage.note}</p>`:""}
      <p class="ar-caveat">This is an indicative interpretation of self-reported answers, not an organisational assessment or a benchmark. In this preview, no answers or contact details have been sent to Ignis. Saved progress on this device is cleared when you finish.</p>
    </div>
    <div class="ar-result-grid">
      <article><p class="ar-result-kicker">Fix first, ${dimensionLabels[r.constraint]}</p><h3>${moves[0]}</h3><p>${moves.slice(1).map(m=>`<span>${m}</span>`).join(" ")}</p></article>
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
  if(next>=structure().length){
    for(const [sectionIdx,section] of structure().entries())for(const [qIdx,q] of section.questions.entries())if(state.answers[q.id]===undefined){state.sectionIdx=sectionIdx;state.qIdx=qIdx;state.notice="One question still needs an answer before your result is ready.";state.stage="question";render({focus:true});return}
    try{state.result=evaluate(structure(),state.answers)}catch(_error){state.notice="One answer could not be scored. Please review this section.";state.stage="question";render({focus:true});return}
    state.stage="result";clearProgress();render({focus:true});return
  }
  if(next===1&&!state.emailCaptured){state.stage="gate";render({focus:true});return}
  state.sectionIdx=next;state.qIdx=0;state.stage="intro";render({focus:true});
}

function advanceQuestion(){
  const sec=currentSection();
  if(sec.questions.some(q=>state.answers[q.id]===undefined)){const index=sec.questions.findIndex(q=>state.answers[q.id]===undefined);activateQuestion(index);return}
  if([0,3,6,9].includes(state.sectionIdx)){state.stage="pause";render({focus:true});return}
  goToSection(state.sectionIdx+1);
}

function back(){
  if(state.stage==="segment"){state.stage="landing";render({focus:true});return}
  if(state.stage==="intro"){
    if(state.sectionIdx===0){state.stage="segment";render({focus:true});return}
    if(state.sectionIdx===1){state.stage="gate";render({focus:true});return}
    state.sectionIdx--;state.qIdx=structure()[state.sectionIdx].questions.length-1;state.stage="question";render({focus:true});return
  }
  if(state.stage==="gate"){state.sectionIdx=0;state.qIdx=maturity.length-1;state.stage="question";render({focus:true});return}
  if(state.stage==="branch_a"||state.stage==="branch_t"){state.stage="intro";render({focus:true});return}
  if(state.stage==="pause"){state.stage="question";render({focus:true});return}
  if(state.stage==="question"){
    if(state.qIdx>0){state.qIdx--;render({focus:true});return}
    if(state.sectionIdx===0||state.sectionIdx===1||state.sectionIdx===7){state.stage="intro";render({focus:true});return}
    state.sectionIdx--;state.qIdx=structure()[state.sectionIdx].questions.length-1;render({focus:true});return
  }
}

function restart(){state=blankState();clearProgress();render({focus:true})}

landing.querySelector("[data-start]")?.addEventListener("click",()=>{state.stage="segment";render({focus:true})});
const resumeBtn=landing.querySelector("[data-resume]");
resumeBtn?.addEventListener("click",()=>{const saved=loadProgress();if(saved){state=saved;render({focus:true})}});

app.addEventListener("click",event=>{
  if(event.target.closest("[data-back]")){back();return}
  if(event.target.closest("[data-save-exit]")){saveProgress();state.stage="landing";render({focus:true});return}
  if(event.target.closest("[data-begin-part]")){if(state.sectionIdx===1&&!state.adoptionBranch)state.stage="branch_a";else if(state.sectionIdx===7&&!state.transformationBranch)state.stage="branch_t";else state.stage="question";render({focus:true});return}
  if(event.target.closest("[data-next-question]")){advanceQuestion();return}
  if(event.target.closest("[data-continue-section]")){afterSectionContinue();return}
  if(event.target.closest("[data-restart]")){restart();return}
});

app.addEventListener("change",event=>{
  const input=event.target;
  const block=input.closest(".ar-stack-item");
  if(block){state.answers[input.name]=input.value;state.notice=null;app.querySelector(".ar-question-notice")?.remove();const dots=input.closest(".ar-dots");if(dots)lightDots(dots,Number(input.value));const sec=currentSection(),complete=sec.questions.every(q=>state.answers[q.id]!==undefined);const next=app.querySelector("[data-next-question]");if(next)next.disabled=!complete;const index=sec.questions.findIndex(q=>q.id===input.name);activateQuestion(Math.min(index+1,sec.questions.length-1),{scroll:index<sec.questions.length-1});}
});

app.addEventListener("pointerover",event=>{const dot=event.target.closest(".ar-dot");if(dot)lightDots(dot.closest(".ar-dots"),Number(dot.querySelector("input").value))});
app.addEventListener("pointerout",event=>{const dots=event.target.closest(".ar-dots");if(dots&&!dots.contains(event.relatedTarget)){const checked=dots.querySelector("input:checked");lightDots(dots,checked?Number(checked.value):0)}});
app.addEventListener("focusin",event=>{const dot=event.target.closest(".ar-dot");if(dot)lightDots(dot.closest(".ar-dots"),Number(dot.querySelector("input").value))});
app.addEventListener("focusout",event=>{const dots=event.target.closest(".ar-dots");if(dots&&!dots.contains(event.relatedTarget)){const checked=dots.querySelector("input:checked");lightDots(dots,checked?Number(checked.value):0)}});

app.addEventListener("submit",event=>{
  event.preventDefault();
  const form=event.target;
  if(form.matches("[data-segment-form]")){const value=new FormData(form).get("segment");if(!value){form.querySelector("input")?.focus();return}state.segment=value;state.stage="intro";state.sectionIdx=0;state.qIdx=0;render({focus:true});return}
  if(form.matches("[data-branch-form]")){const id=form.dataset.branchId,value=new FormData(form).get(id);if(!value){form.querySelector("input")?.focus();return}if(id==="A0"){state.adoptionBranch=value;goToSection(1)}else{state.transformationBranch=value;goToSection(7)}return}
  if(form.matches("[data-gate-form]")){const data=new FormData(form),email=data.get("email"),name=data.get("name");if(!form.reportValidity())return;state.emailCaptured=true;state.capturedEmail=email;state.capturedName=name;if(state.sectionIdx<1){state.sectionIdx=1;state.qIdx=0;state.stage="intro"}else if([1,4,7].includes(state.sectionIdx)&&state.qIdx===0){state.stage="intro"}else state.stage="question";render({focus:true});return}
});

document.getElementById("ar-maturity-ladder").innerHTML=renderMaturityLadder();
const savedProgress=loadProgress();
if(savedProgress&&resumeBtn)resumeBtn.hidden=false;
render();
