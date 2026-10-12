import { assess, VERSION } from "./ai-assessment-v7-model.mjs";

const app = document.getElementById("ar-app");
const landing = document.querySelector(".ar-landing");
const start = document.querySelector("[data-start]");
const KEY = "ignis_ai_self_assessment_v7";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const scaleNames = ["Strongly disagree", "Disagree", "Somewhat disagree", "Neither agree nor disagree", "Somewhat agree", "Agree", "Strongly agree"];
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]));
let bank;
let saved;
let state;
let moveTimer;
let completionPending = false;
let completionRetry;
let retryDelay = 15000;

function newAttemptId() { return globalThis.crypto?.randomUUID?.() || `a-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function fresh() { return {version: VERSION, screen: "landing", context: {}, answers: {}, section: 0, active: 0, attemptId: newAttemptId(), completionSent: false}; }
function restore() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    const previousVersion = value?.version === "2026-10-ceo-review-1";
    if ((value?.version === VERSION || previousVersion) && value.answers && value.context && Number.isInteger(value.section)) {
      if (value.context.role) {
        if (!value.context.persona) value.context.persona = value.context.role === "leader" ? "leader" : "individual";
        if (value.screen === "context-2") value.screen = "context-1";
        else if (value.screen === "context-1") value.screen = "context-0";
        else if (value.screen === "context-0" && value.context.outcome) value.screen = "context-1";
        delete value.context.role;
      }
      if (previousVersion && value.screen === "context-1" && !value.context.stages) value.screen = "context-2";
      value.version = VERSION;
      const legacyAnswer = bank.sections.flatMap((section, sectionIndex) => section.questions.map((question, questionIndex) => ({question, sectionIndex, questionIndex})))
        .find(({question}) => question.type === "likert" && ["0", "outside"].includes(value.answers[question.id]));
      if (legacyAnswer) {
        for (const section of bank.sections) for (const question of section.questions) {
          if (question.type === "likert" && ["0", "outside"].includes(value.answers[question.id])) delete value.answers[question.id];
        }
        value.screen = "questions";
        value.section = legacyAnswer.sectionIndex;
        value.active = legacyAnswer.questionIndex;
        value.attemptId = newAttemptId();
        value.completionSent = false;
      }
      return {...value, attemptId: value.attemptId || newAttemptId(), completionSent: value.completionSent === true};
    }
  } catch {}
  return null;
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function landingMode() {
  document.body.classList.toggle("ar-is-landing", state.screen === "landing");
  document.body.classList.toggle("ar-focus-mode", state.screen !== "landing");
  landing.hidden = state.screen !== "landing";
  app.hidden = state.screen === "landing";
}
function topBar() {
  return `<div class="ar-top-bar"><button class="ar-back" type="button" data-back>← Back</button><button class="ar-text-button" type="button" data-save>Save &amp; finish later</button></div>`;
}
function intro() {
  const section = bank.sections[state.section];
  return `<section class="ar-pause" aria-labelledby="ar-screen-title">${topBar()}<div class="ar-pause-content"><h2 id="ar-screen-title">${escapeHTML(section.title)}</h2><p class="ar-screen-help">${escapeHTML(section.subtitle)}</p><button class="ar-button" type="button" data-begin-section>Begin section →</button></div></section>`;
}
function contextScreen() {
  const index = Number(state.screen.slice(-1));
  const item = bank.context[index];
  const selected = state.context[item.id];
  const multiple = item.type === "multi";
  return `<section class="ar-flow ar-tap" aria-labelledby="ar-screen-title">${topBar()}<p class="ar-category-kicker">Before we begin</p><h2 id="ar-screen-title">${escapeHTML(item.title)}</h2><p class="ar-screen-help">${escapeHTML(item.help || "This helps us frame your result. It does not change your score.")}</p>${index === 0 ? '<p class="ar-caveat">When you finish, Ignis receives your answers and result for assessment research, even if you do not request the emailed report. Contact details are optional. <a href="/privacy">How we use your answers</a>.</p>' : ""}<div class="ar-choice-list">${item.options.map(option => { const picked = multiple ? Array.isArray(selected) && selected.includes(option.id) : selected === option.id; return `<button class="ar-choice ${picked ? "is-selected" : ""}" type="button" data-context-choice="${escapeHTML(option.id)}" aria-pressed="${picked}">${escapeHTML(option.label)}</button>`; }).join("")}</div>${multiple ? `<p class="ar-context-feedback" role="status" aria-live="polite"></p><button class="ar-button" type="button" data-context-continue ${Array.isArray(selected) && selected.length ? "" : "disabled"}>Continue →</button>` : ""}</section>`;
}
function progress() {
  const total = bank.sections.reduce((sum, section) => sum + section.questions.length, 0);
  const done = bank.sections.flatMap(section => section.questions).filter(question => state.answers[question.id] !== undefined).length;
  return `<div class="ar-progress-block"><div class="ar-progress-top"><span>${escapeHTML(bank.sections[state.section].title)}</span></div><div class="ar-seg-row" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}">${bank.sections.map(section => { const count = section.questions.filter(question => state.answers[question.id] !== undefined).length; return `<span class="ar-seg" style="--fill:${count / section.questions.length * 100}%" aria-hidden="true"></span>`; }).join("")}</div></div>`;
}
function choices(question) {
  const picked = state.answers[question.id];
  const multi = question.type === "multi";
  return `<div class="ar-question-options" role="group" aria-label="${escapeHTML(question.text)}">${question.options.map(option => { const chosen = multi ? Array.isArray(picked) && picked.includes(option.id) : picked === option.id; return `<button type="button" class="ar-choice ${chosen ? "is-selected" : ""}" aria-pressed="${chosen}" data-option="${escapeHTML(option.id)}" data-question-id="${question.id}">${escapeHTML(option.label)}</button>`; }).join("")}</div>${multi ? `<button type="button" class="ar-text-button ar-choice-done" data-multi-done="${question.id}" ${Array.isArray(picked) && picked.length ? "" : "disabled"}>Continue →</button>` : ""}`;
}
function dots(question) {
  const outside = state.answers[question.id] === "outside";
  const selected = outside ? 0 : Number(state.answers[question.id]);
  return `<div class="ar-dots-labels"><span>Disagree</span><span>Neither</span><span>Agree</span></div><fieldset class="ar-dots" aria-label="${escapeHTML(question.text)}">${scaleNames.map((label,index) => `<label class="ar-dot ${selected >= index + 1 ? "is-lit" : ""}" data-point="${index + 1}"><input type="radio" name="${question.id}" value="${index + 1}" aria-label="${label}" ${selected === index + 1 ? "checked" : ""}><span aria-hidden="true"></span></label>`).join("")}</fieldset><p class="ar-scale-value">${outside ? "Outside my view" : selected ? scaleNames[selected - 1] : "Tap how much you agree"}</p><button type="button" class="ar-text-button ar-outside ${outside ? "is-selected" : ""}" aria-pressed="${outside}" data-outside="${question.id}">Outside my view</button>`;
}
function questionScreen() {
  const section = bank.sections[state.section];
  const complete = section.questions.every(question => state.answers[question.id] !== undefined);
  return `<section class="ar-flow ar-stack" aria-label="${escapeHTML(section.title)} questions"><div class="ar-sticky-head">${topBar()}${progress()}</div><div class="ar-stack-list">${section.questions.map((question,index) => `<article class="ar-stack-item ${index === state.active ? "is-active" : ""}" data-question-index="${index}" data-question-id="${question.id}"><h2 class="ar-question">${escapeHTML(question.text)}</h2>${question.type === "likert" ? dots(question) : choices(question)}</article>`).join("")}</div><div class="ar-flow-actions"><button class="ar-button" type="button" data-next-section ${complete ? "" : "disabled"}>${state.section === bank.sections.length - 1 ? "See my result" : "Continue"} →</button></div></section>`;
}
function scoreRow(dimension) {
  const value = dimension.score;
  return `<div class="ar-lever-row"><span>${escapeHTML(dimension.label)}</span><span class="ar-lever-track"><span class="ar-lever-fill" data-level="${value == null ? "unknown" : value < 40 ? "low" : value < 65 ? "mid" : "high"}" style="width:${value ?? 0}%"></span></span><strong>${value == null ? "Not enough data" : `${value}/100`}</strong></div>`;
}
function resultScreen() {
  const report = assess(bank, state.answers, state.context);
  const byId = Object.fromEntries(report.dimensions.map(dimension => [dimension.id, dimension]));
  const work = [byId.win, byId.deliver, byId.opportunity];
  const score = report.score;
  return `<section class="ar-result" aria-labelledby="ar-screen-title">${topBar()}<div class="ar-result-hero"><p class="ar-category-kicker">Your AI score</p><h2 id="ar-screen-title">What to build next</h2><div class="ar-result-score" style="--score-angle:${score == null ? 0 : score * 3.6}deg" aria-label="${score == null ? "Not enough answers for a score" : `Score ${score} out of 100`}">${score == null ? "?" : score}<span>/100</span></div>${score == null ? '<p class="ar-score-key">Not enough answers for a responsible overall score.</p>' : ""}<p class="ar-band">${escapeHTML(report.stage)}</p><p class="ar-result-line">${escapeHTML(report.scope)}</p></div>
  <div class="ar-result-section"><p class="ar-category-kicker">01 · Where you stand</p><h3>AI today</h3><p>${escapeHTML(report.findings.adoption)}</p>${scoreRow(byId.adoption)}</div>
  <div class="ar-result-section"><p class="ar-category-kicker">02 · What blocks scale</p><h3>Workflow, data and governance</h3><p>${escapeHTML(report.findings.foundations)}</p>${[byId.workflow,byId.data,byId.governance].map(scoreRow).join("")}</div>
  <div class="ar-result-section"><p class="ar-category-kicker">03 · Where it matters</p><h3>Work and new value</h3><p>${escapeHTML(report.findings.work)}</p>${work.map(scoreRow).join("")}</div>
  <div class="ar-result-section ar-priority"><p class="ar-category-kicker">04 · What to build first</p><h3>${escapeHTML(report.priority.title)}</h3><p>${escapeHTML(report.findings.priority)}</p><dl><div><dt>First move</dt><dd>${escapeHTML(report.priority.first)}</dd></div><div><dt>Likely owner</dt><dd>${escapeHTML(report.priority.owner)}</dd></div><div><dt>Bounded pilot</dt><dd>${escapeHTML(report.priority.pilot)}</dd></div></dl></div>
  <div class="ar-result-section ar-report-section"><h3>Get the executive report</h3><p>Your results are above. The two-page report brings together your scores, build priority, accountable owner and a bounded pilot. Enter your details and we will email it to you.</p><form class="ar-report-form" data-email-form><label>First name<input name="firstName" autocomplete="given-name" maxlength="80" required></label><label>Work email<input name="email" type="email" autocomplete="email" maxlength="254" required></label><label>Company<input name="company" autocomplete="organization" maxlength="120" required></label><label class="ar-consent"><input name="consent" type="checkbox" required><span>Email me the two-page report using these details. This does not subscribe me to marketing emails.</span></label><button class="ar-button" type="submit">Email my executive report →</button><p class="ar-form-status" role="status" aria-live="polite"></p></form><a class="ar-outline" href="/contact?source=ai-assessment">Discuss the next build ↗</a><p class="ar-caveat">Your progress is saved in this browser. When you finish, your answers and result are shared with Ignis for assessment research, whether or not you request the email report. We only receive your name, company and email if you submit this form. Do not enter confidential project information. See our <a href="/privacy">privacy policy</a>.</p></div></section>`;
}
function render(scrollTop = false) {
  landingMode();
  if (state.screen === "landing") { start.textContent = saved ? "Resume the assessment →" : "Start the assessment →"; return; }
  app.innerHTML = state.screen.startsWith("context-") ? contextScreen() : state.screen === "intro" ? intro() : state.screen === "questions" ? questionScreen() : resultScreen();
  persist();
  if (state.screen === "result") void notifyCompletion();
  if (scrollTop) {
    if (state.screen === "questions") requestAnimationFrame(() => activate(state.active,false));
    else scrollTo({top: 0, behavior: reducedMotion ? "instant" : "smooth"});
  }
}
function activate(index, smooth = true) {
  const items = [...app.querySelectorAll(".ar-stack-item")];
  if (!items[index]) return;
  state.active = index;
  items.forEach((item,itemIndex) => item.classList.toggle("is-active", itemIndex === index));
  persist();
  items[index].scrollIntoView({block:"center", behavior: smooth && !reducedMotion ? "smooth" : "instant"});
}
function answer(questionId, value) {
  clearTimeout(moveTimer);
  state.answers[questionId] = value;
  const current = state.active;
  render(false);
  if (current < bank.sections[state.section].questions.length - 1) {
    moveTimer = setTimeout(() => activate(current + 1), 220);
  } else {
    moveTimer = setTimeout(() => app.querySelector("[data-next-section]")?.scrollIntoView({block:"center", behavior: reducedMotion ? "instant" : "smooth"}), 220);
  }
}
function back() {
  clearTimeout(moveTimer);
  if (state.screen === "result") { state.screen = "questions"; state.section = bank.sections.length - 1; state.active = 5; }
  else if (state.screen === "questions") { state.screen = "intro"; }
  else if (state.screen === "intro") { if (state.section) { state.section -= 1; state.screen = "questions"; state.active = 5; } else state.screen = `context-${bank.context.length - 1}`; }
  else if (state.screen.startsWith("context-")) { const index = Number(state.screen.slice(-1)); state.screen = index ? `context-${index - 1}` : "landing"; }
  render(true);
}
async function reportRequest(action, payload = {}) {
  const response = await fetch("/api/assessment-report", {method:"POST", headers:{"Content-Type":"application/json"}, keepalive:action === "complete", body:JSON.stringify({action, version:VERSION, attemptId:state.attemptId, answers:state.answers, context:state.context, ...payload})});
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || "The report service is not available right now."); }
  return response;
}
async function notifyCompletion() {
  if (state.screen !== "result" || state.completionSent || completionPending) return;
  clearTimeout(completionRetry);
  completionPending = true;
  const attemptId = state.attemptId;
  try {
    await reportRequest("complete");
    if (state.attemptId === attemptId) { state.completionSent = true; persist(); }
    retryDelay = 15000;
  } catch {
    if (state.attemptId === attemptId) {
      completionRetry = setTimeout(() => { if (state.screen === "result") void notifyCompletion(); }, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 300000);
    }
  } finally { completionPending = false; }
}
function updateGauge() {
  const score = document.querySelector("[data-sample-score]");
  const gauge = document.querySelector(".ar-score-tease");
  const track = gauge?.querySelector(".ar-gauge-track");
  const fill = gauge?.querySelector(".ar-gauge-fill");
  const dot = gauge?.querySelector(".ar-gauge-dot");
  if (!score || !track || !fill || !dot) return;
  const finalScore = 47;
  const trackLength = track.getTotalLength();
  function set(value) {
    const position = Math.max(0, Math.min(100, value));
    const point = track.getPointAtLength(trackLength * position / 100);
    score.textContent = String(Math.round(position));
    fill.style.strokeDasharray = `${position} 100`;
    dot.setAttribute("cx", String(point.x));
    dot.setAttribute("cy", String(point.y));
  }
  set(finalScore);
  if (reducedMotion) return;
  const frames = [
    {at: 0, value: finalScore},
    {at: .3, value: 64},
    {at: .55, value: 38},
    {at: .78, value: 53},
    {at: 1, value: finalScore}
  ];
  let started;
  function animate(now) {
    started ??= now;
    const progress = Math.min((now - started) / 6500, 1);
    const nextIndex = frames.findIndex((frame, index) => index > 0 && progress <= frame.at);
    const next = frames[nextIndex < 0 ? frames.length - 1 : nextIndex];
    const previous = frames[frames.indexOf(next) - 1];
    const fraction = Math.max(0, Math.min(1, (progress - previous.at) / (next.at - previous.at)));
    const eased = fraction * fraction * (3 - 2 * fraction);
    set(previous.value + (next.value - previous.value) * eased);
    if (progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

const personaPicker = document.querySelector(".ar-persona-picker");
const personaError = document.getElementById("ar-persona-error");
personaPicker.addEventListener("change", event => { if (event.target.matches('input[name="persona"]')) personaError.hidden = true; });
start.addEventListener("click", () => {
  const persona = document.querySelector('input[name="persona"]:checked');
  if (!persona) {
    personaError.hidden = false;
    personaPicker.querySelector('input[name="persona"]').focus();
    return;
  }
  state = saved || fresh();
  state.context.persona = persona.value;
  if (state.screen === "landing") state.screen = "context-0";
  render(true);
});
app.addEventListener("click", async event => {
  const target = event.target.closest("button, .ar-stack-item"); if (!target) return;
  if (target.matches("[data-back]")) return back();
  if (target.matches("[data-save]")) { persist(); saved = {...state}; state = fresh(); render(true); return; }
  if (target.matches("[data-context-choice]")) { const index = Number(state.screen.slice(-1)); const item = bank.context[index]; if (item.type === "multi") { const selected = new Set(state.context[item.id] || []); const option = item.options.find(choice => choice.id === target.dataset.contextChoice); if (option.exclusive) { if (selected.has(option.id)) selected.clear(); else { selected.clear(); selected.add(option.id); } } else { selected.delete("all"); if (selected.has(option.id)) selected.delete(option.id); else if (selected.size < item.max) selected.add(option.id); else { app.querySelector(".ar-context-feedback").textContent = `Choose up to ${item.max}, or select across the full lifecycle.`; return; } } state.context[item.id] = [...selected]; render(false); app.querySelector(`[data-context-choice="${option.id}"]`)?.focus(); return; } state.context[item.id] = target.dataset.contextChoice; state.screen = index === bank.context.length - 1 ? "intro" : `context-${index + 1}`; return render(true); }
  if (target.matches("[data-context-continue]")) { const index = Number(state.screen.slice(-1)); if (!(state.context[bank.context[index].id] || []).length) return; state.screen = index === bank.context.length - 1 ? "intro" : `context-${index + 1}`; render(true); return; }
  if (target.matches("[data-begin-section]")) { state.screen = "questions"; state.active = 0; render(true); return; }
  if (target.matches("[data-option]")) { const question = bank.sections[state.section].questions.find(item => item.id === target.dataset.questionId); if (question.type === "multi") { const selected = new Set(state.answers[question.id] || []); const option = question.options.find(item => item.id === target.dataset.option); if (option.exclusive) { selected.clear(); selected.add(option.id); } else { selected.delete("none"); if (selected.has(option.id)) selected.delete(option.id); else selected.add(option.id); } state.answers[question.id] = [...selected]; render(false); } else answer(question.id, target.dataset.option); return; }
  if (target.matches("[data-multi-done]")) { if ((state.answers[target.dataset.multiDone] || []).length) activate(Math.min(state.active + 1,5)); return; }
  if (target.matches("[data-outside]")) { answer(target.dataset.outside, "outside"); return; }
  if (target.matches("[data-next-section]")) { if (state.section < bank.sections.length - 1) { state.section += 1; state.screen = "intro"; } else state.screen = "result"; render(true); return; }
  if (target.matches(".ar-stack-item")) { const index = Number(target.dataset.questionIndex); if (index !== state.active) activate(index); }
});
app.addEventListener("change", event => { const input = event.target; if (input.matches('.ar-dot input[type="radio"]')) answer(input.name, input.value); });
app.addEventListener("pointerover", event => { const dot = event.target.closest(".ar-dot"); if (!dot) return; const group = dot.closest(".ar-stack-item"); group.querySelectorAll(".ar-dot").forEach(item => item.classList.toggle("is-lit", Number(item.dataset.point) <= Number(dot.dataset.point))); });
app.addEventListener("pointerout", event => { const dot = event.target.closest(".ar-dot"); if (!dot || dot.contains(event.relatedTarget)) return; const group = dot.closest(".ar-stack-item"); const value = Number(state.answers[group.dataset.questionId]); group.querySelectorAll(".ar-dot").forEach(item => item.classList.toggle("is-lit", Number(item.dataset.point) <= value)); });
app.addEventListener("submit", async event => {
  if (!event.target.matches("[data-email-form]")) return;
  event.preventDefault(); const form = event.target; const data = new FormData(form); const button = form.querySelector('[type="submit"]'); const status = form.querySelector(".ar-form-status");
  button.disabled = true; status.textContent = "Sending your report…";
  try { await reportRequest("email", {firstName:data.get("firstName"), email:data.get("email"), company:data.get("company"), consent:data.get("consent") === "on"}); status.textContent = "Your two-page report has been sent. Please check your inbox."; form.reset(); }
  catch(error) { status.textContent = `${error.message} Your on-screen result remains available above. Please try the email request again later.`; }
  finally { button.disabled = false; }
});
addEventListener("online", () => { if (state?.screen === "result") void notifyCompletion(); });

try {
  const response = await fetch("/assets/ai-assessment-v7.json", {cache:"no-store"});
  if (!response.ok) throw new Error("The assessment could not load.");
  bank = await response.json(); if (bank.version !== VERSION) throw new Error("The question and scoring versions do not match.");
  saved = restore(); state = fresh();
  if (saved?.context.persona) document.querySelectorAll('input[name="persona"]').forEach(input => { input.checked = input.value === saved.context.persona; });
  render(); updateGauge();
} catch(error) { landing.hidden = true; app.hidden = false; app.innerHTML = `<p class="ar-error">${escapeHTML(error.message)} Please try again later.</p>`; }
