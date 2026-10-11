import {bankVersion,visibleQuestions,sectorText,optionFor,scoreGap,scoreCost,urgencyLevel,pathFor,formatRange} from "./ai-roulette-v4-model.mjs";

const app=document.getElementById("ar-app");
const landing=document.querySelector(".ar-landing");
const STORAGE_KEY="ai_roulette_v4";
const params=new URLSearchParams(location.search);
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
let bank=null;
let state=null;
let advanceTimer=0;
let scrollLockUntil=0;

const overlay=document.querySelector("[data-menu-overlay]");
const openMenu=document.querySelector("[data-menu-open]");
const closeMenu=document.querySelector("[data-menu-close]");
let oldFocus=null;
function setMenu(open){
  if(!overlay)return;
  if(open)oldFocus=document.activeElement;
  overlay.classList.toggle("is-open",open);
  overlay.setAttribute("aria-hidden",String(!open));
  openMenu?.setAttribute("aria-expanded",String(open));
  for(const selector of [".site-header","main","footer"]){const element=document.querySelector(selector);if(element)element.inert=open}
  if(open)closeMenu?.focus();else oldFocus?.focus();
}
openMenu?.addEventListener("click",()=>setMenu(true));
closeMenu?.addEventListener("click",()=>setMenu(false));
overlay?.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>setMenu(false)));
document.addEventListener("keydown",event=>{
  if(!overlay?.classList.contains("is-open"))return;
  if(event.key==="Escape"){setMenu(false);return}
  if(event.key==="Tab"){
    const focusables=[...overlay.querySelectorAll("a,button")],first=focusables[0],last=focusables.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});
addEventListener("scroll",()=>document.querySelector(".site-header")?.classList.toggle("is-scrolled",scrollY>24),{passive:true});

function blankState(){
  const pack=bank.meta.packs.find(item=>item.id===params.get("p"))?.id??null;
  const sector=bank.sector.options.some(item=>item.id===params.get("s"))?params.get("s"):bank.meta.packs.find(item=>item.id===pack)?.sector??null;
  return {version:bankVersion,screen:"landing",answers:{},sector,role:null,pack,questionIndex:0,visionDetail:"",fidCount:null,ownNumber:"",ownType:"delayMonth",currency:bank.cost.ownNumber.defaultCurrency};
}
function loadSaved(){
  try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY));return value?.version===bankVersion&&value.answers&&typeof value.screen==="string"?value:null}catch{return null}
}
function save(){
  try{if(state.screen==="landing")return;localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}
}
function clearSave(){try{localStorage.removeItem(STORAGE_KEY)}catch{}}
function screenList(){
  const cost=visibleQuestions(bank,state.answers).filter(q=>q.section==="cost");
  return [
    {id:"sector",kind:"tap",question:bank.sector},
    {id:"role",kind:"tap",question:bank.role},
    {id:"intro-vision",kind:"intro",title:"Where next?",help:"Start with the outcome that matters most over the next 12 months.",label:"Part 01 of 07 · Direction"},
    {id:"V1",kind:"tap",question:bank.questions.find(q=>q.id==="V1")},
    {id:"intro-maturity",kind:"intro",title:"AI today",help:"Two quick questions to set the scene. These are not scored.",label:"Part 02 of 07 · Today"},
    ...bank.questions.filter(q=>q.section==="maturity").map(q=>({id:q.id,kind:"tap",question:q})),
    ...bank.groups.flatMap((group,index)=>[
      {id:`intro-${group.id}`,kind:"intro",title:group.label,help:group.question,label:`Part 0${index+3} of 07 · ${group.label}`},
      {id:`gap-${group.id}`,kind:"gap",group,questions:bank.questions.filter(q=>q.section==="gap"&&q.group===group.id)}
    ]),
    {id:"intro-cost",kind:"intro",title:"What is at stake?",help:"Use your best rough estimates. Not sure is fine.",label:"Part 06 of 07 · Your numbers"},
    ...cost.map(q=>({id:q.id,kind:"tap",question:q})),
    {id:"intro-urgency",kind:"intro",title:"One last question",label:"Part 07 of 07 · Last question"},
    {id:"U1",kind:"multi",question:bank.questions.find(q=>q.id==="U1")},
    {id:"result",kind:"result"}
  ];
}
function currentScreen(){return screenList().find(item=>item.id===state.screen)}
function move(offset){
  clearTimeout(advanceTimer);
  const screens=screenList(),index=screens.findIndex(item=>item.id===state.screen);
  const next=screens[index+offset];
  if(!next)return;
  state.screen=next.id;
  state.questionIndex=next.kind==="gap"?(offset<0?next.questions.length-1:0):0;
  render(true);
}
function back(){
  if(state.screen==="landing")return;
  if(state.screen.startsWith("gap-")&&state.questionIndex>0){activateQuestion(state.questionIndex-1);return}
  if(state.screen==="sector"){state.screen="landing";render(true);return}
  move(-1);
}
function topBar(){return `<div class="ar-top-bar"><button type="button" class="ar-back" data-back>← Back</button><button type="button" class="ar-text-button" data-save>Save &amp; finish later</button></div>`}
function progress(){
  const gapItems=bank.questions.filter(q=>q.section==="gap");
  const completed=gapItems.filter(q=>state.answers[q.id]!==undefined).length;
  const group=bank.groups.find(g=>state.screen===`gap-${g.id}`);
  return `<div class="ar-progress-block"><div class="ar-progress-top"><span>${esc(group?.label??"AI Roulette")}</span><span>${completed} / ${gapItems.length} statements</span></div><div class="ar-seg-row" role="progressbar" aria-label="Gap statements answered" aria-valuemin="0" aria-valuemax="${gapItems.length}" aria-valuenow="${completed}">${bank.groups.map(g=>{const n=gapItems.filter(q=>q.group===g.id&&state.answers[q.id]!==undefined).length;return `<span class="ar-seg" style="--fill:${n/4*100}%" aria-hidden="true"></span>`}).join("")}</div></div>`
}
function screenTitle(screen){
  return sectorText(screen.question,"text",state.sector??"ipp");
}
function choiceOption(option){
  return `<button type="button" class="ar-choice" data-choice="${esc(option.value)}"><span>${esc(sectorText(option,"label",state.sector??"ipp"))}</span>${option.help?`<small>${esc(option.help)}</small>`:""}</button>`
}
function renderTap(screen){
  const q=screen.question;
  const heading=screenTitle(screen);
  const help=sectorText(q,"help",state.sector??"ipp")||q.note||"";
  const progressLabel=screen.id==="sector"?"First, a little context":screen.id==="role"?"One more thing":screen.id==="V1"?"Your 12-month goal":q.section==="maturity"?"Where AI is today":"Your own estimate";
  const selected=state.answers[q.id];
  return `<section class="ar-flow ar-tap" aria-labelledby="ar-screen-title">${topBar()}<p class="ar-category-kicker">${esc(progressLabel)}</p><h2 id="ar-screen-title">${esc(heading)}</h2>${help?`<p class="ar-screen-help">${esc(help)}</p>`:""}<div class="ar-choice-list">${q.options.map(choiceOption).join("")}</div>${screen.id==="V1"&&selected==="3"&&state.sector==="ipp"?renderFidFollowup(q):""}${screen.id==="V1"&&selected==="6"?`<label class="ar-detail-label">In a few words (optional)<input data-vision-detail maxlength="80" value="${esc(state.visionDetail)}"></label>`:""}${screen.id==="V1"&&selected?`<button class="ar-button" type="button" data-next>Continue →</button>`:""}</section>`
}
function renderFidFollowup(q){
  const follow=q.options.find(option=>option.id==="fid")?.followUp;
  return `<fieldset class="ar-followup"><legend>${esc(follow.text)}</legend>${follow.options.map(option=>`<label><input type="radio" name="fidCount" value="${esc(option.id)}" ${state.fidCount===option.id?"checked":""}><span>${esc(option.label)}</span></label>`).join("")}</fieldset>`;
}
function renderIntro(screen){
  return `<section class="ar-pause" aria-labelledby="ar-screen-title">${topBar()}<p class="ar-category-kicker">${esc(screen.label)}</p><h2 id="ar-screen-title">${esc(screen.title)}</h2>${screen.help?`<p class="ar-screen-help">${esc(screen.help)}</p>`:""}<button class="ar-button" type="button" data-next>Continue →</button></section>`;
}
function dotLabels(q){
  return `<div class="ar-dots-labels"><span>${esc(bank.scale.endLabels.left)}</span><span>${esc(bank.scale.endLabels.right)}</span></div><fieldset class="ar-dots" aria-label="${esc(q.text)}">${bank.scale.labels.map((label,i)=>`<label class="ar-dot" data-point="${i+1}"><input type="radio" name="${esc(q.id)}" value="${i+1}" aria-label="${esc(label)}" ${String(state.answers[q.id])===String(i+1)?"checked":""}><span aria-hidden="true"></span></label>`).join("")}</fieldset>`;
}
function renderGap(screen){
  const blocks=screen.questions.map((q,i)=>`<article class="ar-stack-item ${i===state.questionIndex?"is-active":""}" data-question-index="${i}" data-question-id="${esc(q.id)}"><h2 ${i===state.questionIndex?'id="ar-screen-title"':""} class="ar-question">${esc(sectorText(q,"text",state.sector??"ipp"))}</h2>${dotLabels(q)}<p class="ar-scale-value" data-scale-value>${state.answers[q.id]==="0"?"Not sure":state.answers[q.id]?esc(bank.scale.labels[Number(state.answers[q.id])-1]):"Tap how much you agree"}</p><button type="button" class="ar-not-sure ${state.answers[q.id]==="0"?"is-selected":""}" data-not-sure="${esc(q.id)}">Not sure</button></article>`).join("");
  const complete=screen.questions.every(q=>state.answers[q.id]!==undefined);
  return `<section class="ar-flow ar-stack" aria-labelledby="ar-screen-title"><div class="ar-sticky-head">${topBar()}${progress()}<p class="ar-subdim-heading"><em>Statement ${String(state.questionIndex+1).padStart(2,"0")} of ${String(screen.questions.length).padStart(2,"0")}</em> · ${esc(screen.group.name)}</p></div><div class="ar-stack-list">${blocks}</div><div class="ar-flow-actions"><button class="ar-button" type="button" data-next ${complete?"":"disabled"}>Continue →</button></div></section>`;
}
function renderMulti(screen){
  const selected=state.answers.U1??[];
  return `<section class="ar-flow ar-tap" aria-labelledby="ar-screen-title">${topBar()}<p class="ar-category-kicker">One last question</p><h2 id="ar-screen-title">${esc(screen.question.text)}</h2><p class="ar-screen-help">${esc(screen.question.help)}</p><div class="ar-choice-list">${screen.question.options.map(option=>`<button type="button" class="ar-choice ${selected.includes(option.id)?"is-selected":""}" aria-pressed="${selected.includes(option.id)}" data-multi="${esc(option.id)}">${esc(sectorText(option,"label",state.sector??"ipp"))}</button>`).join("")}</div><button class="ar-button" type="button" data-next ${selected.length?"":"disabled"}>See my result →</button></section>`;
}
function visionPhrase(){
  const q=bank.questions.find(item=>item.id==="V1");
  const option=optionFor(q,state.answers.V1);
  if(option?.id==="fid"&&state.sector==="ipp"&&state.fidCount)return option.followUp.options.find(item=>item.id===state.fidCount)?.visionPhrase??option.phrase;
  return sectorText(option,"phrase",state.sector??"ipp")||"get where you need the business to be";
}
function urgencyEcho(){
  const q=bank.questions.find(item=>item.id==="U1");
  const selected=(state.answers.U1??[]).map(id=>q.options.find(option=>option.id===id)).filter(item=>item?.class==="need"&&item.echo).slice(0,2);
  if(!selected.length)return "";
  return `You told us that if nothing changes in the next 30 days, ${selected.map(item=>item.echo).join(" and ")}.`;
}
function costTile(title,range,unit){
  return `<div class="ar-cost-tile"><span>${esc(title)}</span><strong>${esc(formatRange(range))}${range?` ${unit}`:""}</strong><small>Your estimate</small></div>`;
}
function result(){
  const gap=scoreGap(bank,state.answers);
  const cost=scoreCost(bank,state.answers,gap.archetype);
  const urgency=urgencyLevel(bank,state.answers,cost);
  const path=pathFor(gap,optionFor(bank.questions.find(q=>q.id==="V1"),state.answers.V1)?.id);
  const pathData=bank.paths.options[path];
  const archetype=gap.archetype?.archetype;
  const lever=gap.archetype?.name??"visibility";
  const moveLever=gap.fixFirst??gap.archetype;
  const move=sectorText(moveLever?.archetype,"move",state.sector??"ipp")||moveLever?.archetype?.moveBySector?.[state.sector??"ipp"]||"Ask the people doing the work where AI is used, what it changes, and how it is checked.";
  const bandData=bank.scoring.bands.find(item=>item.id===gap.band);
  const resultHeading=gap.visibilityOnly?"Not enough visibility yet":archetype?.name??"Your result";
  const primaryTalk=urgency==="need";
  const talkLink=`<a class="ar-button" href="/contact?source=ai-roulette">Discuss my next move ↗</a>`;
  const reportButton=`<button class="ar-button" type="button" data-report>View the full report ↓</button>`;
  const costName={time:"time",delay:"delay",missed:"missed value"};
  const costHeadline=cost.biggest?`By your own estimate, this shows up most as ${costName[cost.biggest]}.`:"Your answers do not point to one main cost yet. That is worth finding out.";
  const ownNumber=Number(state.ownNumber);
  const symbol=state.currency==="e"?"€":"£";
  const moneyRange=state.ownType==="delayMonth"&&cost.delay?cost.delay.map(value=>value===null?null:Math.round(value/bank.cost.assumptions.weeksPerMonth*ownNumber)):state.ownType==="dealValue"&&cost.missed?cost.missed.map(value=>value===null?null:Math.round(value*ownNumber)):null;
  const moneyLine=ownNumber>0&&moneyRange?`<p class="ar-money-result">At your figure, roughly ${symbol}${formatRange(moneyRange)} ${state.ownType==="delayMonth"?"a year of slippage":"of work you passed on"}. ${state.ownType==="dealValue"?"That is value at stake, not lost profit.":""}</p>`:"";
  return `<section class="ar-result" aria-labelledby="ar-result-title"><div class="ar-result-hero"><p class="ar-category-kicker">Your AI Roulette result</p><h2 id="ar-result-title">${esc(resultHeading)}</h2><p class="ar-result-line">${esc(archetype?.oneLiner??bank.copy.result.visibilityOnly)}</p><div class="ar-result-score">${gap.total}<span>/100</span></div><p class="ar-band">${esc(bandData?.name??"Indicative score")}</p><p class="ar-result-lead">You want to ${esc(visionPhrase())}. ${gap.visibilityOnly?"We cannot name one gap from the answers you were unsure of.":`The biggest thing in the way appears to be ${esc(lever)}.`}</p>${gap.gatedLever?`<p class="ar-caveat">${esc(bank.scoring.governanceGate.message.replace("{lever}",gap.gatedLever.name))}</p>`:""}${gap.straightLining?`<p class="ar-caveat">${esc(bank.scoring.straightLiningNote)}</p>`:""}</div><section class="ar-result-section"><h3>What it may cost</h3><p>${esc(costHeadline)}</p><div class="ar-cost-grid">${costTile("Time",cost.time,"hours / year")}${costTile("Delay",cost.delay,"weeks / year")}${costTile("Missed value",cost.missed,"opportunities")}</div><p class="ar-caveat">These are your estimates multiplied out, not industry averages. We cannot tell from these answers which gap causes which cost.</p><div class="ar-own-number"><label for="ar-own-value">Want a money figure? Add one number you know. Optional.</label><div class="ar-own-controls"><select data-own-type aria-label="Type of value">${bank.cost.ownNumber.types.map(item=>`<option value="${item.id}" ${state.ownType===item.id?"selected":""}>${esc(sectorText(item,"label",state.sector??"ipp"))}</option>`).join("")}</select><select data-currency aria-label="Currency"><option value="g" ${state.currency==="g"?"selected":""}>£ GBP</option><option value="e" ${state.currency==="e"?"selected":""}>€ EUR</option></select><input id="ar-own-value" data-own-number type="number" inputmode="decimal" min="0" step="any" placeholder="Your figure" value="${esc(state.ownNumber)}"></div>${moneyLine}<small>It stays on this device unless you choose to share it.</small></div><p class="ar-caveat">${esc(bank.cost.footer)}</p></section><section class="ar-result-section"><h3>One move for the next 30 days</h3><p class="ar-next-move">${esc(move)}</p>${gap.fixFirst&&gap.archetype&&gap.fixFirst.id!==gap.archetype.id?`<p class="ar-caveat">Your lowest lever is ${esc(gap.archetype.name)}, but we'd address ${esc(gap.fixFirst.name)} first.</p>`:""}<div class="ar-path"><span>On the Ignis path</span><h4>${esc(pathData.label)}</h4><p>${esc(pathData.line)}</p><a href="/commercial-ai-adoption">Explore Commercial AI adoption ↗</a></div></section><section class="ar-result-section ar-result-cta"><h3>${primaryTalk?"Talk it through":"Keep your result"}</h3>${primaryTalk&&urgencyEcho()?`<p>${esc(urgencyEcho())}</p>`:""}<p>${primaryTalk?"A short conversation about the live pressure point and one next move.":"You can review the six levers and share this page with a colleague to compare perspectives."}</p><div class="ar-result-actions">${primaryTalk?talkLink+reportButton:reportButton+talkLink}</div><p class="ar-caveat">Your full result is available below without sign-up.</p></section><details class="ar-result-section ar-details" id="ar-full-report"><summary>Your six levers and full report</summary><div class="ar-lever-chart">${gap.groups.map(group=>`<h4>${esc(group.label)} · ${group.health}/100</h4>${gap.levers.filter(item=>item.group===group.id).map(item=>`<div class="ar-lever-row"><span>${esc(item.name)}</span><span class="ar-lever-track"><span class="ar-lever-fill" style="width:${item.health??50}%" data-level="${item.health===null?"unknown":item.health<40?"low":item.health<70?"mid":"high"}"></span></span><span>${item.health===null?"Not sure":`${item.health}%`}</span></div>`).join("")}`).join("")}</div>${gap.blindSpots.length?`<p class="ar-caveat">Not sure on ${gap.blindSpots.map(item=>item.name).join(", ")}. Compare this with someone else in the business.</p>`:""}<p class="ar-caveat">${esc(bank.meta.disclaimer)}</p></details><div class="ar-result-actions"><button class="ar-text-button" type="button" data-restart>Retake the assessment</button><button class="ar-text-button" type="button" data-copy>Copy a link to the assessment</button></div></section>`;
}
function render(focus=false){
  const isLanding=state.screen==="landing";
  landing.hidden=!isLanding;
  app.hidden=isLanding;
  document.body.classList.toggle("ar-is-landing",isLanding);
  document.body.classList.toggle("ar-focus-mode",!isLanding&&state.screen!=="result");
  document.querySelector(".ar-mark").hidden=!isLanding;
  if(isLanding){if(focus)scrollTo(0,0);return}
  const screen=currentScreen();
  app.innerHTML=screen.kind==="tap"?renderTap(screen):screen.kind==="intro"?renderIntro(screen):screen.kind==="gap"?renderGap(screen):screen.kind==="multi"?renderMulti(screen):result();
  if(screen.kind==="gap")updateDots();
  if(screen.kind==="result"){
    const gap=scoreGap(bank,state.answers);
    const score=app.querySelector(".ar-result-score");
    if(score){
      score.style.setProperty("--score-angle",`${gap.total*3.6}deg`);
      score.setAttribute("aria-label",`Indicative AI Roulette score: ${gap.total} out of 100`);
      const scale=document.createElement("p");
      scale.className="ar-score-key";
      scale.textContent="0–33 Spinning the wheel · 34–66 Placing bets · 67–100 Running the house";
      score.insertAdjacentElement("afterend",scale);
    }
    const rationale=app.querySelector(".ar-next-move + .ar-caveat");
    if(rationale&&gap.fixFirst&&gap.archetype){
      const reason=gap.fixFirst.group==="aim"?"A clear commercial target comes before wider adoption and controls.":gap.fixFirst.group==="build"?"A repeatable workflow makes later checks and ownership meaningful.":"This control needs attention before the wider use of AI is safe.";
      rationale.textContent=`Your lowest score is ${gap.archetype.name}. We suggest ${gap.fixFirst.name} first because ${reason}`;
    }
  }
  save();
  if(focus){
    requestAnimationFrame(()=>{
      if(screen.kind==="gap")scrollToQuestion(state.questionIndex,false);
      else scrollTo({top:0,behavior:"instant"});
      const heading=app.querySelector("#ar-screen-title,#ar-result-title");
      if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
    });
  }
}
function scrollToQuestion(index,smooth=true){
  const block=app.querySelector(`[data-question-index="${index}"]`);
  if(!block)return;
  const sticky=app.querySelector(".ar-sticky-head")?.getBoundingClientRect().height??0;
  const top=scrollY+block.getBoundingClientRect().top-sticky-20;
  scrollLockUntil=performance.now()+1000;
  scrollTo({top,behavior:smooth&&!reduced.matches?"smooth":"instant"});
}
function updateDots(preview=null){
  app.querySelectorAll(".ar-stack-item").forEach(block=>{
    const id=block.dataset.questionId;
    const saved=Number(state.answers[id]);
    const chosen=preview?.id===id?preview.value:saved;
    block.querySelectorAll(".ar-dot").forEach((dot,i)=>dot.classList.toggle("is-lit",chosen>0&&i<chosen));
    block.querySelector(".ar-scale-value").textContent=preview?.id===id?bank.scale.labels[chosen-1]??"Tap how much you agree":saved===0&&state.answers[id]!==undefined?"Not sure":saved?bank.scale.labels[saved-1]:"Tap how much you agree";
  });
}
function activateQuestion(index){
  const screen=currentScreen();
  if(screen?.kind!=="gap"||index<0||index>=screen.questions.length)return;
  state.questionIndex=index;
  app.querySelectorAll(".ar-stack-item").forEach((block,i)=>{
    block.classList.toggle("is-active",i===index);
    const heading=block.querySelector("h2");
    if(i===index)heading.id="ar-screen-title";else heading.removeAttribute("id");
  });
  app.querySelector(".ar-subdim-heading em").textContent=`Statement ${String(index+1).padStart(2,"0")} of ${String(screen.questions.length).padStart(2,"0")}`;
  scrollToQuestion(index,true);
  save();
}
function selectGap(id,value){
  const screen=currentScreen();
  const index=screen.questions.findIndex(q=>q.id===id);
  if(index<0)return;
  state.answers[id]=String(value);
  app.querySelector(`[data-question-id="${id}"] .ar-not-sure`)?.classList.toggle("is-selected",value===0);
  updateDots();
  const gapItems=bank.questions.filter(q=>q.section==="gap");
  const completed=gapItems.filter(q=>state.answers[q.id]!==undefined).length;
  const count=app.querySelector(".ar-progress-top span:last-child");
  if(count)count.textContent=`${completed} / ${gapItems.length} statements`;
  app.querySelector(".ar-seg-row")?.setAttribute("aria-valuenow",String(completed));
  app.querySelectorAll(".ar-seg").forEach((segment,i)=>{
    const group=bank.groups[i];
    const answered=gapItems.filter(q=>q.group===group.id&&state.answers[q.id]!==undefined).length;
    segment.style.setProperty("--fill",`${answered/4*100}%`);
  });
  app.querySelector("[data-next]").disabled=!screen.questions.every(q=>state.answers[q.id]!==undefined);
  save();
  clearTimeout(advanceTimer);
  if(index<screen.questions.length-1){
    advanceTimer=setTimeout(()=>{
      if(state.screen!==screen.id)return;
      activateQuestion(index+1);
      const heading=app.querySelector("#ar-screen-title");
      if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
    },220);
  }else{
    advanceTimer=setTimeout(()=>{
      const button=app.querySelector("[data-next]");
      if(button&&!button.disabled){button.scrollIntoView({block:"center",behavior:reduced.matches?"instant":"smooth"});button.focus({preventScroll:true})}
    },220);
  }
}
function updateLanding(){
  const pack=bank.meta.packs.find(item=>item.id===state.pack);
  landing.querySelector(".ar-lede").textContent=bank.copy.landing.sub;
  landing.querySelector(".ar-result-promise").textContent=bank.copy.landing.promise;
  const sampleScore=Math.max(0,Math.min(100,Number(bank.copy.landing.example.score)||0));
  const scoreNumber=landing.querySelector("[data-sample-score]");
  const gauge=landing.querySelector(".ar-score-tease");
  const track=gauge.querySelector(".ar-gauge-track");
  const fill=gauge.querySelector(".ar-gauge-fill");
  const dot=gauge.querySelector(".ar-gauge-dot");
  const trackLength=track.getTotalLength();
  const paintScore=value=>{
    const score=Math.max(0,Math.min(100,value));
    const point=track.getPointAtLength(trackLength*score/100);
    fill.style.strokeDasharray=`${score} 100`;
    dot.setAttribute("cx",point.x);
    dot.setAttribute("cy",point.y);
    scoreNumber.textContent=Math.round(score);
  };
  gauge.setAttribute("aria-label",reduced.matches?`Example AI Roulette score: ${sampleScore} out of 100`:`Animated example AI Roulette score, moving up and down and returning to ${sampleScore} out of 100`);
  gauge.style.setProperty("--sample-score",sampleScore);
  paintScore(sampleScore);
  if(!reduced.matches){
    const frames=[
      {at:0,value:0},
      {at:.3,value:Math.min(100,sampleScore+26)},
      {at:.55,value:Math.max(0,sampleScore-22)},
      {at:.75,value:Math.min(100,sampleScore+11)},
      {at:.9,value:sampleScore},
      {at:1,value:sampleScore}
    ];
    let started;
    const animate=now=>{
      started??=now;
      if(reduced.matches){paintScore(sampleScore);return}
      if(!landing.hidden&&!document.hidden){
        const progress=((now-started)%5600)/5600;
        const first=progress<.9&&now-started<5600?frames[0]:{at:0,value:sampleScore};
        const points=first===frames[0]?frames:[first,...frames.slice(1)];
        const end=points.findIndex((point,index)=>index>0&&progress<=point.at);
        const next=end<0?points.length-1:end;
        const from=points[Math.max(0,next-1)];
        const to=points[next];
        const fraction=to.at===from.at?1:Math.max(0,Math.min(1,(progress-from.at)/(to.at-from.at)));
        const eased=fraction*fraction*(3-2*fraction);
        paintScore(from.value+(to.value-from.value)*eased);
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
  landing.querySelector(".ar-score-caption").textContent=bank.copy.landing.example.caption;
  landing.querySelector(".ar-fineprint").textContent=bank.copy.landing.fine;
  landing.querySelectorAll(".ar-landing-outcome p").forEach((node,i)=>node.textContent=bank.copy.landing.outcomes[i]);
  const packLine=landing.querySelector(".ar-pack-line");
  packLine.hidden=!pack;
  if(pack)packLine.textContent=bank.copy.landing.packLine.replace("{packShort}",pack.shortTitle);
}
app.addEventListener("click",event=>{
  if(event.target.closest("[data-back]")){back();return}
  if(event.target.closest("[data-save]")){save();state.screen="landing";render(true);return}
  if(event.target.closest("[data-restart]")){clearSave();state=blankState();render(true);return}
  if(event.target.closest("[data-copy]")){navigator.clipboard?.writeText("https://www.ignisleadership.com/ai-roulette");event.target.textContent="Link copied";return}
  if(event.target.closest("[data-report]")){const details=app.querySelector("#ar-full-report");details.open=true;details.scrollIntoView({block:"start",behavior:reduced.matches?"instant":"smooth"});return}
  const choice=event.target.closest("[data-choice]");
  if(choice){
    const screen=currentScreen();
    if(screen.id==="sector"){state.sector=screen.question.options.find(item=>item.value===choice.dataset.choice)?.id??"ipp";state.answers.X2=choice.dataset.choice}
    else if(screen.id==="role"){state.role=screen.question.options.find(item=>item.value===choice.dataset.choice)?.id??"direction";state.answers.X1=choice.dataset.choice}
    else state.answers[screen.id]=choice.dataset.choice;
    save();
    if(screen.id==="V1"){
      render(false);
      if(choice.dataset.choice==="3"&&state.sector==="ipp")requestAnimationFrame(()=>app.querySelector(".ar-followup")?.scrollIntoView({block:"center",behavior:reduced.matches?"instant":"smooth"}));
      if(choice.dataset.choice!=="3"&&choice.dataset.choice!=="6")move(1);
    }else move(1);
    return;
  }
  const notSure=event.target.closest("[data-not-sure]");
  if(notSure){selectGap(notSure.dataset.notSure,0);return}
  const multi=event.target.closest("[data-multi]");
  if(multi){
    const option=bank.questions.find(q=>q.id==="U1").options.find(item=>item.id===multi.dataset.multi);
    let selected=state.answers.U1??[];
    if(option.exclusive)selected=selected.includes(option.id)?[]:[option.id];
    else if(selected.includes(option.id))selected=selected.filter(id=>id!==option.id);
    else selected=[...selected.filter(id=>!bank.questions.find(q=>q.id==="U1").options.find(item=>item.id===id)?.exclusive),option.id].slice(0,3);
    state.answers.U1=selected;render(false);return;
  }
  if(event.target.closest("[data-next]")){if(!event.target.closest("[data-next]").disabled)move(1);return}
});
app.addEventListener("change",event=>{
  const input=event.target;
  if(input.closest(".ar-dot")){selectGap(input.name,Number(input.value));return}
  if(input.name==="fidCount"){state.fidCount=input.value;save();return}
  if(input.matches("[data-own-type]"))state.ownType=input.value;
  if(input.matches("[data-currency]"))state.currency=input.value;
  if(input.matches("[data-own-type],[data-currency]"))render(false);
});
app.addEventListener("input",event=>{
  if(event.target.matches("[data-vision-detail]")){state.visionDetail=event.target.value;save()}
  if(event.target.matches("[data-own-number]")){state.ownNumber=event.target.value;const position=scrollY;render(false);scrollTo(0,position);app.querySelector("[data-own-number]")?.focus({preventScroll:true})}
});
app.addEventListener("pointerover",event=>{
  const dot=event.target.closest(".ar-dot");
  if(dot)updateDots({id:dot.closest(".ar-stack-item").dataset.questionId,value:Number(dot.dataset.point)});
});
app.addEventListener("pointerout",event=>{
  const dots=event.target.closest(".ar-dots");
  if(dots&&!dots.contains(event.relatedTarget))updateDots();
});
app.addEventListener("focusin",event=>{
  const dot=event.target.closest(".ar-dot");
  if(dot)updateDots({id:dot.closest(".ar-stack-item").dataset.questionId,value:Number(dot.dataset.point)});
});
app.addEventListener("focusout",event=>{
  if(event.target.closest(".ar-dot"))updateDots();
});
let scrollFrame=0;
addEventListener("scroll",()=>{
  if(scrollFrame||performance.now()<scrollLockUntil||!state?.screen.startsWith("gap-"))return;
  scrollFrame=requestAnimationFrame(()=>{
    scrollFrame=0;
    const blocks=[...app.querySelectorAll(".ar-stack-item")];
    const sticky=app.querySelector(".ar-sticky-head")?.getBoundingClientRect().height??0;
    const center=sticky+(innerHeight-sticky)/2;
    const nearest=blocks.map((node,i)=>({i,delta:Math.abs((node.getBoundingClientRect().top+node.getBoundingClientRect().bottom)/2-center)})).sort((a,b)=>a.delta-b.delta)[0];
    if(nearest&&nearest.i!==state.questionIndex){
      state.questionIndex=nearest.i;
      blocks.forEach((block,i)=>{block.classList.toggle("is-active",i===nearest.i);const title=block.querySelector("h2");if(i===nearest.i)title.id="ar-screen-title";else title.removeAttribute("id")});
      app.querySelector(".ar-subdim-heading em").textContent=`Statement ${String(nearest.i+1).padStart(2,"0")} of ${String(currentScreen().questions.length).padStart(2,"0")}`;
      save();
    }
  });
},{passive:true});
document.querySelector("[data-start]")?.addEventListener("click",()=>{
  const saved=loadSaved();
  state=saved??blankState();
  if(!saved){state.screen="sector";clearSave()}
  render(true);
});
document.addEventListener("keydown",event=>{
  if(!state?.screen.startsWith("gap-")||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName??""))return;
  if(/^[1-7]$/.test(event.key)){event.preventDefault();const q=currentScreen().questions[state.questionIndex];selectGap(q.id,Number(event.key))}
  if(event.key==="0"||event.key.toLowerCase()==="n"){event.preventDefault();const q=currentScreen().questions[state.questionIndex];selectGap(q.id,0)}
});
fetch("/assets/ai-roulette-v4-questions.json")
  .then(response=>{if(!response.ok)throw new Error("Question bank unavailable");return response.json()})
  .then(data=>{
    if(data.meta.version!==bankVersion)throw new Error("Question bank version mismatch");
    bank=data;state=blankState();updateLanding();render();
  })
  .catch(()=>{app.hidden=false;app.innerHTML='<p class="ar-error" role="alert">The assessment could not load. Please refresh the page or try again later.</p>'});
