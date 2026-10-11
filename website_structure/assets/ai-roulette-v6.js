import { score, fmt, fmtMid, textFor } from "./ai-roulette-v6-model.mjs";

const app = document.getElementById("ar-app");
const landing = document.querySelector(".ar-landing");
const mark = document.querySelector(".ar-mark");
const params = new URLSearchParams(location.search);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const STORE = "ai_roulette_v6";
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const lookup = (bank, id) => bank.questions.find(item => item.id === id);
const interpolate = (template, fields) => String(template || "").replace(/\{([\w]+)\}/g, (_, key) => fields[key] ?? "");
let bank, state, timer;

function fresh() {
  const preselect = bank.sector.options.find(item => item.id === params.get("s"));
  return { version: bank.meta.version, screen: "landing", step: 0, sector: preselect ? Number(preselect.value) : null,
    role: null, goal: null, projectCount: null, grid: {}, gridCard: 0, ladder: null, tools: [],
    found: {}, grow: {}, cost: {}, k1Exact: null, money: { currency: "g" }, peopleCost: null, urgency: [] };
}
function saved() {
  try { const data = JSON.parse(localStorage.getItem(STORE)); return data?.version === bank.meta.version && ["step", "result"].includes(data.screen) ? data : null; }
  catch { return null; }
}
function persist() {
  if (state.screen === "landing" || state.screen === "resume") return;
  try { const { capture, ...safe } = state; localStorage.setItem(STORE, JSON.stringify({ ...safe, savedAt: new Date().toISOString() })); } catch {}
}
function clearOld() { try { localStorage.removeItem("ai_roulette_v4"); localStorage.removeItem("ai_roulette_v5"); } catch {} }
function sector() { return bank.sector.options.find(item => Number(item.value) === Number(state.sector))?.id || bank.sector.default; }
function goalOption() { return lookup(bank, "V1").options.find(item => Number(item.value) === Number(state.goal)); }
function goalPhrase() {
  const goal = goalOption();
  if (sector() === "ipp" && goal?.id === "close" && state.projectCount) {
    return goal.followUp.options.find(item => Number(item.value) === Number(state.projectCount))?.phrase || textFor(goal, sector(), "phrase");
  }
  return textFor(goal, sector(), "phrase");
}
function goalShort() { return textFor(goalOption(), sector(), "short"); }
function setScreen(screen, step = state.step) {
  clearTimeout(timer);
  state.screen = screen; state.step = step; persist(); render(true);
}
function next() {
  if (state.step === 3) state.gridCard = 0;
  if (state.step === 3) showOverlay("Your workstream map is ready. Next, where AI stands today.", () => setScreen("step", 4));
  else if (state.step === 7) showOverlay("Last part: your numbers. They turn the map into money.", () => setScreen("step", 8));
  else if (state.step >= 14) calculate();
  else setScreen("step", state.step + 1);
}
function back() { if (state.screen === "result") setScreen("step", 14); else if (state.step > 0) setScreen("step", state.step - 1); else setScreen("landing", 0); }
function showOverlay(message, done) {
  state.screen = "overlay";
  app.innerHTML = `<section class="ar-v6-overlay" aria-live="polite"><p>${esc(message)}</p><button type="button" data-overlay-skip>Continue →</button></section>`;
  app.hidden = false; landing.hidden = true;
  app.querySelector("[data-overlay-skip]").onclick = () => { clearTimeout(timer); done(); };
  timer = setTimeout(done, reduceMotion.matches ? 20 : 1800);
}
function calculate() {
  state.screen = "calculating";
  const lines = Object.values(bank.copy.calculating).filter(value => typeof value === "string");
  app.innerHTML = `<section class="ar-v6-overlay" aria-live="polite"><p>${esc(lines[0] || "Putting your result together")}</p></section>`;
  app.hidden = false; landing.hidden = true;
  timer = setTimeout(() => setScreen("result"), reduceMotion.matches ? 20 : bank.meta.flow.calculatingMs);
}
function topbar(step) {
  const total = bank.meta.flow.totalSteps;
  const part = bank.meta.flow.parts.find(item => item.n === step.part)?.label || "";
  return `<div class="ar-v6-top"><button type="button" data-back>← Back</button><button type="button" data-save>Save and finish later</button></div>
    <div class="ar-v6-progress"><div><strong>${esc(part)}</strong><span>Step ${step.n} of ${total} · ${esc(step.label)}</span></div>
    <div class="ar-v6-track" role="progressbar" aria-label="Assessment progress" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${step.n}">${bank.meta.flow.steps.map(item => `<i class="${item.n < step.n ? "done" : item.n === step.n ? "now" : ""}" aria-hidden="true"></i>`).join("")}</div></div>`;
}
function choices(id, options, selected, mode = "single") {
  return `<div class="ar-v6-choices">${options.map(item => {
    const value = Number(item.value), on = mode === "multi" ? selected.includes(value) : selected !== null && selected !== undefined && Number(selected) === value;
    return `<button type="button" class="ar-v6-choice ${on ? "selected" : ""}" data-choice="${esc(id)}" data-value="${value}" aria-pressed="${on}"><span>${esc(textFor(item, sector(), "label"))}</span>${item.help ? `<small>${esc(item.help)}</small>` : ""}</button>`;
  }).join("")}</div>`;
}
function basicStep(id) {
  const item = id === "X2" ? bank.sector : id === "X1" ? bank.role : lookup(bank, id);
  const selected = id === "X2" ? state.sector : id === "X1" ? state.role : id === "V1" ? state.goal : id === "M1" ? state.ladder : id === "M2" ? state.tools : id === "U1" ? state.urgency : state.cost[id];
  const multi = ["M2", "U1"].includes(id);
  const title = textFor(item, sector());
  const help = textFor(item, sector(), "help") || item.note || (id === "U1" ? "Choose up to three." : "");
  const optional = id === "V1" && Number(state.goal) === 3 && sector() === "ipp";
  const follow = optional ? goalOption()?.followUp : null;
  const count = `<fieldset class="ar-v6-follow" data-follow><legend>${esc(follow?.text)}</legend>${follow?.options.map(option => `<label><input type="radio" name="project-count" value="${option.value}" ${Number(state.projectCount) === Number(option.value) ? "checked" : ""}><span>${esc(option.label)}</span></label>`).join("")}</fieldset>`;
  const k1 = id === "K1" ? `<label class="ar-v6-exact">Exact number, if you know it <input type="number" min="1" max="100000" inputmode="numeric" data-exact value="${esc(state.k1Exact ?? "")}"></label>` : "";
  const selectedEnough = multi ? selected.length > 0 : selected !== null && selected !== undefined;
  const manualContinue = ["V1", "M2", "U1", "K1", "K3"].includes(id);
  const options = item.options;
  const k3Follow = id === "K3" && Number(state.cost.K3) > 1 ? renderK4() : "";
  const intro = id === "U1" ? bank.copy.intros.urgency : id.startsWith("K") ? bank.copy.intros.numbers : id.startsWith("M") ? bank.copy.intros.maturity : "";
  return `${intro ? `<p class="ar-v6-intro">${esc(intro)}</p>` : ""}
    <h2 id="ar-v6-title">${esc(title)}</h2>${help ? `<p class="ar-v6-help">${esc(help)}</p>` : ""}
    ${choices(id, options, selected, multi ? "multi" : "single")}${optional ? count : ""}${k3Follow}${k1}
    ${manualContinue ? `<button class="ar-v6-next" type="button" data-next ${selectedEnough ? "" : "disabled"}>Continue →</button>` : ""}
    ${id === "U1" ? `<p class="ar-v6-count">${selected.length} of 3 chosen</p>` : ""}`;
}
function renderK4() {
  const item = lookup(bank, "K4");
  return `<div class="ar-v6-subquestion" data-k4><h3>${esc(item.text)}</h3>${choices("K4", item.options, state.cost.K4)}</div>`;
}
function gridControl(item, workId, axis) {
  const value = state.grid[workId]?.[axis] ?? null;
  return `<fieldset class="ar-v6-grid-scale" aria-label="${esc(textFor(item, sector(), "name"))}: ${axis === "p" ? "process" : "AI use"}"><legend>${axis === "p" ? "Process" : "AI use"}</legend>${lookup(bank, "G1").columns[axis === "p" ? 0 : 1].options.map(option =>
    `<label title="${esc(option.help || option.label)}"><input type="radio" name="${workId}-${axis}" value="${option.value}" data-grid="${workId}" data-axis="${axis}" ${value !== null && Number(value) === Number(option.value) ? "checked" : ""}><span>${esc(option.short || option.label)}</span></label>`).join("")}</fieldset>`;
}
function gridStep() {
  const items = [...bank.workstreams].sort((a, b) => a.order - b.order);
  const complete = items.every(item => state.grid[item.id]?.p !== undefined && state.grid[item.id]?.a !== undefined);
  const current = items[state.gridCard];
  const currentComplete = state.grid[current.id]?.p !== undefined && state.grid[current.id]?.a !== undefined;
  const legend = lookup(bank, "G1").columns.map(column => `<div><strong>${esc(column.label)}</strong>${column.options.map(option => `<span>${esc(option.short || option.label)}: ${esc(option.help || option.label)}</span>`).join("")}</div>`).join("");
  return `<p class="ar-v6-intro">${esc(bank.copy.intros.grid)}</p><h2 id="ar-v6-title">Your five workstreams</h2><p class="ar-v6-help">${esc(lookup(bank, "G1").help)}</p>
    <details class="ar-v6-legend"><summary>What the levels mean</summary>${legend}</details>
    <div class="ar-v6-grid">${items.map((item, index) => `<div class="ar-v6-grid-row ${index === state.gridCard ? "current" : ""}" data-grid-row="${index}">
      <div class="ar-v6-grid-name"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(textFor(item, sector(), "name"))}</h3><p>${esc(textFor(item, sector(), "help"))}</p></div>
      ${gridControl(item, item.id, "p")}${gridControl(item, item.id, "a")}</div>`).join("")}</div>
    <div class="ar-v6-grid-mobile-nav"><button type="button" data-grid-back ${state.gridCard === 0 ? "hidden" : ""}>← Previous</button><span>${state.gridCard + 1} of 5</span><button type="button" data-grid-next ${state.gridCard >= 4 ? "hidden" : ""} ${currentComplete ? "" : "disabled"}>Next →</button></div>
    <button class="ar-v6-next" type="button" data-next ${complete ? "" : "disabled"}>Continue →</button>`;
}
function likertItem(item, index, group) {
  const answer = state[group][item.id];
  return `<section class="ar-v6-statement ${index === 0 ? "active" : ""}" data-statement="${item.id}" id="ar-v6-${item.id}"><span class="ar-v6-statement-n">${String(index + 1).padStart(2, "0")}</span>
    <h3>${esc(textFor(item, sector()))}</h3><div class="ar-v6-scale-head"><span>Disagree</span><span>Agree</span></div>
    <fieldset class="ar-v6-dots" aria-label="${esc(textFor(item, sector()))}">${bank.scale.labels.map((label, point) => `<label class="${answer !== undefined && Number(answer) > point ? "lit" : ""}"><input type="radio" name="${item.id}" value="${point + 1}" data-likert="${item.id}" data-group="${group}" aria-label="${esc(label)}" ${Number(answer) === point + 1 ? "checked" : ""}><span aria-hidden="true"></span></label>`).join("")}</fieldset>
    <div class="ar-v6-answer-label">${answer === undefined ? "Select how much you agree" : Number(answer) === 0 ? "Not sure" : esc(bank.scale.labels[Number(answer) - 1])}</div>
    <button type="button" class="ar-v6-not-sure ${Number(answer) === 0 ? "selected" : ""}" data-likert-not-sure="${item.id}" data-group="${group}">Not sure</button></section>`;
}
function likertStep(group) {
  const items = bank.questions.filter(item => item.section === group).sort((a, b) => a.order - b.order);
  const answerGroup = group === "foundations" ? "found" : "grow";
  const complete = items.every(item => state[answerGroup][item.id] !== undefined);
  return `<p class="ar-v6-intro">${esc(bank.copy.intros[group])}</p><h2 id="ar-v6-title">${group === "grow" ? "Grow" : "Foundations"}</h2>
    <p class="ar-v6-help">${esc(bank.scale.notSure.hint)}</p><div class="ar-v6-statements">${items.map((item, index) => likertItem(item, index, answerGroup)).join("")}</div>
    <button class="ar-v6-next" type="button" data-next ${complete ? "" : "disabled"}>Continue →</button>`;
}
function moneyStep() {
  const item = lookup(bank, "K7"), money = state.money;
  return `<p class="ar-v6-intro">${esc(bank.copy.intros.numbers)}</p><h2 id="ar-v6-title">${esc(item.text)}</h2><p class="ar-v6-help">${esc(item.help)}</p>
    <div class="ar-v6-currency"><span>Currency</span><button type="button" data-currency="g" aria-pressed="${money.currency === "g"}">£ GBP</button><button type="button" data-currency="e" aria-pressed="${money.currency === "e"}">€ EUR</button></div>
    ${item.fields.map(field => `<div class="ar-v6-money-field"><label for="ar-v6-${field.id}">${esc(textFor(field, sector(), "label"))}</label><p>${esc(textFor(field, sector(), "help"))}</p>
      <div class="ar-v6-money-input"><span>${money.currency === "e" ? "€" : "£"}</span><input id="ar-v6-${field.id}" type="number" min="0" max="100000000000" inputmode="decimal" data-money="${field.id}" value="${esc(money[field.id] ?? "")}"></div>
      <div class="ar-v6-chips">${field.chips.map(chip => `<button type="button" data-money-chip="${field.id}" data-value="${chip}">${esc(fmt(chip, money.currency === "e" ? "€" : "£"))}</button>`).join("")}</div></div>`).join("")}
    <button class="ar-v6-next" type="button" data-next>Continue →</button><button class="ar-v6-skip" type="button" data-skip-money>Skip: show hours and weeks only</button>`;
}
function resultFields(result) {
  const value = result.value, currency = value.currency === "e" ? "€" : "£", token = bank.copy.sectorTokens[sector()];
  const goal = goalOption(), gap = result.grid.biggestGap, work = bank.workstreams.find(item => item.id === gap);
  const processOption = work && lookup(bank, "G1").columns[0].options.find(item => Number(item.value) === result.grid.ws[gap].P);
  const aiOption = work && lookup(bank, "G1").columns[1].options.find(item => Number(item.value) === result.grid.ws[gap].A);
  const formatted = { pipelineWord: token.pipelineWord, cur: currency, optMid: value.optimise ? fmt(value.optimise.mid) : "", optLo: value.optimise ? fmt(value.optimise.lo) : "", optHi: value.optimise?.hi === null ? "more" : value.optimise ? fmt(value.optimise.hi) : "",
    weeksMid: value.weeks ? fmt(value.weeks.mid) : "", weeksLo: value.weeks ? fmt(value.weeks.lo) : "", weeksHi: value.weeks?.hi === null ? "more" : value.weeks ? fmt(value.weeks.hi) : "",
    hoursMid: value.hours ? fmt(value.hours.mid) : "", hoursLo: value.hours ? fmt(value.hours.lo) : "", hoursHi: value.hours?.hi === null ? "more" : value.hours ? fmt(value.hours.hi) : "",
    fteMid: value.fte ? fmt(value.fte.mid) : "", slipMonth: state.money.slipMonth ? fmt(Number(state.money.slipMonth)) : "",
    wsName: work ? textFor(work, sector(), "name") : "not clear yet", wsName2: result.grid.jointWith ? textFor(bank.workstreams.find(item => item.id === result.grid.jointWith), sector(), "name") : "",
    goalPhrase: goalPhrase(), goalShort: goalShort(), processLabel: processOption?.label?.toLowerCase() || "not known", aiLabel: aiOption?.label?.toLowerCase() || "not known",
    importanceWord: bank.copy.result.importanceWords[result.grid.ws[gap]?.importance || 1] };
  const headlineKey = { money: "headlineMoney", weeks: "headlineWeeks", hours: "headlineHours", none: "headlineNone" }[result.headline];
  return { ...formatted, headline: interpolate(bank.copy.result[headlineKey], formatted), subline: interpolate(bank.copy.result[headlineKey + "Sub"], formatted) };
}
function heatmap(result) {
  const columns = lookup(bank, "G1").columns;
  return `<div class="ar-v6-heatmap" role="table" aria-label="Workstream process and AI use"><div class="ar-v6-heat-head" role="row"><span>Workstream</span><span>Process</span><span>AI use</span><span>Status</span></div>
    ${bank.workstreams.map(item => {
      const row = result.grid.ws[item.id], process = columns[0].options.find(option => Number(option.value) === row.P), ai = columns[1].options.find(option => Number(option.value) === row.A);
      const status = bank.scoring.status.find(option => option.id === row.status)?.label || "Not sure";
      return `<div class="ar-v6-heat-row ${result.grid.biggestGap === item.id ? "biggest" : ""}" role="row"><strong>${esc(textFor(item, sector(), "name"))}${result.grid.biggestGap === item.id ? " · Biggest gap" : ""}</strong>
        <span class="level-${row.P}">${esc(process?.short || process?.label || "Not sure")}</span><span class="level-${row.A}">${esc(ai?.short || ai?.label || "Not sure")}</span><small>${esc(status)}</small></div>`;
    }).join("")}</div><p class="ar-v6-legend-line">${esc(bank.copy.result.heatmapLegend)}</p>`;
}
function renderPots(result) {
  const { value } = result, currency = value.currency === "e" ? "€" : "£";
  return `<div class="ar-v6-pots"><article><span>${esc(bank.copy.result.optimise.label)}</span><strong>${value.optimise ? esc(fmtMid(value.optimise, currency).text) : "Not yet sized"}</strong><p>${value.optimise ? "Your estimate from slipped milestones." : esc(bank.copy.result.optimise.none)}</p></article>
    <article><span>${esc(bank.copy.result.growPot.label)}</span><strong>${value.growPot ? esc(fmtMid(value.growPot, currency).text) : "Not yet sized"}</strong><p>${value.growPot ? "Value at stake, not profit. You would not have won it all." : esc(bank.copy.result.growPot.none)}</p></article></div>`;
}
function resultStep() {
  const result = score(bank, state), fields = resultFields(result), zone = bank.scoring.zones.find(item => item.id === result.readinessZone);
  const work = bank.workstreams.find(item => item.id === result.grid.biggestGap);
  const why = result.grid.biggestGap ? interpolate(bank.copy.result.biggestWhy, fields) : "There is not enough information yet to name one gap. Ask each workstream lead how the work is done and where AI is used.";
  const goalLine = result.grid.biggestGap ? interpolate(bank.copy.result[result.grid.jointWith ? "goalLineJoint" : "goalLine"], fields) : `You want to ${goalPhrase()}. First, map how the five workstreams operate.`;
  const module = bank.modules[result.build.first], then = result.build.then ? bank.modules[result.build.then] : null;
  const facets = bank.scoring.foundations.facets.map(item => `<li>${esc(item.label)} <strong>${result.foundations.facets[item.id] ?? "Not known"}${result.foundations.facets[item.id] === null ? "" : "/100"}</strong></li>`).join("");
  const growBand = bank.scoring.grow.bands.find(item => item.id === result.grow.band);
  const talkHref = `/contact?source=ai-roulette-v6&goal=${encodeURIComponent(result.goal || "")}`;
  return `<section class="ar-v6-result" aria-labelledby="ar-v6-title"><button class="ar-v6-back" type="button" data-back>← Back</button><p class="ar-v6-eyebrow">Your pipeline check</p>
    <h2 id="ar-v6-title" class="ar-v6-headline">${esc(fields.headline)}</h2>${fields.subline ? `<p class="ar-v6-subline">${esc(fields.subline)}</p>` : ""}
    <p class="ar-v6-goal">${esc(goalLine)}</p><p class="ar-v6-why">${esc(why)}</p>
    <section><h3>${esc(bank.copy.result.heatmapH3)}</h3>${heatmap(result)}</section>
    <section><h3>${esc(bank.copy.result.potsH3)}</h3><div data-result-pots>${renderPots(result)}</div><div class="ar-v6-result-inputs">
      <label>What one month's slip costs on a typical project <input type="number" inputmode="decimal" min="0" data-result-money="slipMonth" value="${esc(state.money.slipMonth ?? "")}"></label>
      <label>What a typical project is worth to you <input type="number" inputmode="decimal" min="0" data-result-money="projectValue" value="${esc(state.money.projectValue ?? "")}"></label>
      <label>${esc(bank.value.peopleCost.label)} <input type="number" inputmode="decimal" min="0" data-people-cost value="${esc(state.peopleCost ?? "")}"></label></div></section>
    <section class="ar-v6-readiness"><h3>${esc(bank.copy.result.readinessH3)}</h3><div><span>Process <strong>${result.grid.processMaturityIndex ?? "Not known"}</strong></span><span>AI use <strong>${result.grid.aiUseIndex ?? "Not known"}</strong></span><span>Foundations <strong>${result.foundations.total ?? "Not known"}</strong></span><span>AI readiness <strong>${result.readiness ?? "Not known"}</strong></span></div><p>${esc(zone?.label || "Not enough information")}</p><ul>${facets}</ul></section>
    <section><h3>${esc(bank.copy.result.movesH3)}</h3><div class="ar-v6-moves">${result.moves.map((item, index) => `<article><span>${["Next 30 days", "By day 60", "By day 90"][index]}</span><p>${esc(interpolate(item.text, { docExamples: bank.copy.sectorTokens[sector()].docExamples }))}</p><small>${esc(bank.moves.who[bank.role.options.find(option => Number(option.value) === Number(state.role))?.id || "direction"])}</small></article>`).join("")}</div></section>
    <section class="ar-v6-build"><h3>${esc(bank.copy.result.buildH3)}</h3><h4>${esc(module.name)}</h4><p>${esc(module.line)}</p><small>${esc(module.status)}</small>${then ? `<p>Then: <strong>${esc(then.name)}</strong>. ${esc(then.status)}</p>` : ""}${result.build.sprint ? `<p>${esc(bank.buildFirst.sprint.line)}</p>` : ""}</section>
    <section><h3>${esc(bank.copy.result.growH3)}</h3><p>${result.grow.total === null ? esc(bank.scoring.grow.nullLine) : `${result.grow.total}/100 · ${esc(growBand.name)}. ${esc(growBand.line)}`}</p></section>
    <section class="ar-v6-result-cta"><h3>Your next move</h3><p>${esc(bank.copy.result.ctaBookSub)}</p><a class="ar-v6-primary" href="${esc(talkHref)}">${esc(interpolate(bank.copy.result.ctaBook, { goalShort: goalShort() || "result" }))} →</a><p class="ar-v6-caveat">${esc(bank.meta.disclaimer)}</p></section>
    <div class="ar-v6-result-actions"><button type="button" data-restart>Retake the check</button><button type="button" data-print>Print this result</button></div></section>`;
}
function captureStep() {
  const result = score(bank, state), fields = resultFields(result);
  return `<p class="ar-v6-intro">${esc(interpolate(bank.copy.capture.teaser, fields))}</p><h2 id="ar-v6-title">Your result is ready</h2>
    <p class="ar-v6-help">Your workstream map, the value at stake and three moves are on the next screen. You can view and print them without sharing your details.</p>
    <div class="ar-v6-preview-note" role="note"><strong>Report delivery is not connected in this preview</strong><p>No email is collected. We will add the optional two-page email report once delivery and CRM tagging have been tested.</p></div>
    <button class="ar-v6-next" type="button" data-next>Show my result →</button>`;
}
function stepBody(step) {
  if (step.id === "G1") return gridStep();
  if (step.id === "foundations" || step.id === "grow") return likertStep(step.id);
  if (step.id === "K7") return moneyStep();
  if (step.id === "capture") return captureStep();
  return basicStep(step.id === "K3+K4" ? "K3" : step.id);
}
function renderLanding() {
  const copy = bank.copy.landing, selectedSector = sector();
  const heat = [
    ["Origination", "Some", "Individuals"], ["Development", "Some", "None"], ["Route to market", "Standard", "Individuals"],
    ["Procurement", "Ad hoc", "None"], ["Path to close", "Ad hoc", "Individuals"]
  ];
  landing.innerHTML = `<div class="ar-v6-landing-inner"><p class="ar-v6-eyebrow">${esc(copy.eyebrow)}</p><h1 id="ar-title">${esc(copy.h1BySector?.[selectedSector] || copy.h1)}</h1>
    <p class="ar-v6-landing-sub">${esc(copy.subBySector?.[selectedSector] || copy.sub)}</p>
    <div class="ar-v6-sample"><p>${esc(copy.sample.headline)}</p><div class="ar-v6-sample-grid">${heat.map((row, index) => `<div style="--row:${index}"><span>${esc(row[0])}</span><i>${esc(row[1])}</i><i>${esc(row[2])}</i></div>`).join("")}</div><small>${esc(copy.sample.caption)}</small></div>
    <p class="ar-v6-promise">${esc(copy.promise)}</p><div class="ar-v6-readers"><p>${esc(copy.readers.direction)}</p><p>${esc(copy.readers.practice)}</p></div>
    <button type="button" class="ar-v6-primary ar-v6-start" data-start>${esc(copy.cta)}</button><p class="ar-v6-micro">About 6 minutes · Instant result · No sign-up required</p>
    <section class="ar-v6-how"><h2>How it works</h2><ol>${copy.how.map(item => `<li>${esc(item)}</li>`).join("")}</ol><p>${esc(copy.pov)}</p><button type="button" class="ar-v6-primary" data-start>${esc(copy.cta)}</button><small>${esc(copy.fine)}</small></section></div>`;
}
function render(focus = false) {
  const onLanding = state.screen === "landing";
  landing.hidden = !onLanding; app.hidden = onLanding; mark.hidden = !onLanding;
  document.body.classList.toggle("ar-v6-landing", onLanding);
  if (onLanding) renderLanding();
  else if (state.screen === "resume") {
    const date = state.savedAt ? new Date(state.savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : "earlier";
    app.innerHTML = `<section class="ar-v6-resume"><h2 id="ar-v6-title">Welcome back</h2><p>You have a saved check from ${esc(date)}.</p>
      <button type="button" data-resume>${state.resume?.screen === "result" ? "See my last result" : "Continue where I left off"}</button><button type="button" data-fresh>Start fresh</button></section>`;
  } else if (state.screen === "result") app.innerHTML = resultStep();
  else if (state.screen === "step") {
    const step = bank.meta.flow.steps[state.step];
    app.innerHTML = `<section class="ar-v6-flow" aria-labelledby="ar-v6-title">${topbar(step)}<div class="ar-v6-question-area">${stepBody(step)}</div></section>`;
  }
  if (focus) requestAnimationFrame(() => {
    scrollTo({ top: 0, behavior: "instant" });
    const heading = app.querySelector("#ar-v6-title"); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  });
}
function updateResultNumbers() {
  const result = score(bank, state), fields = resultFields(result);
  const headline = app.querySelector(".ar-v6-headline"); if (headline) headline.textContent = fields.headline;
  const subline = app.querySelector(".ar-v6-subline"); if (subline) subline.textContent = fields.subline;
  const pots = app.querySelector("[data-result-pots]"); if (pots) pots.innerHTML = renderPots(result);
  persist();
}
function syncLikert(group, id, value) {
  state[group][id] = value; persist();
  const block = app.querySelector(`[data-statement="${id}"]`);
  block.querySelectorAll(".ar-v6-dots label").forEach((label, index) => label.classList.toggle("lit", value > index));
  block.querySelector(".ar-v6-answer-label").textContent = value === 0 ? "Not sure" : bank.scale.labels[value - 1];
  block.querySelector(".ar-v6-not-sure").classList.toggle("selected", value === 0);
  const items = bank.questions.filter(item => item.section === (group === "found" ? "foundations" : "grow")).sort((a, b) => a.order - b.order);
  const index = items.findIndex(item => item.id === id), nextItem = items[index + 1];
  app.querySelector("[data-next]").disabled = !items.every(item => state[group][item.id] !== undefined);
  if (nextItem) timer = setTimeout(() => { const nextBlock = app.querySelector(`[data-statement="${nextItem.id}"]`); app.querySelectorAll(".ar-v6-statement.active").forEach(item => item.classList.remove("active")); nextBlock?.classList.add("active"); nextBlock?.scrollIntoView({ block: "center", behavior: reduceMotion.matches ? "instant" : "smooth" }); nextBlock?.querySelector("h3")?.setAttribute("tabindex", "-1"); nextBlock?.querySelector("h3")?.focus({ preventScroll: true }); }, 130);
  else app.querySelector("[data-next]")?.scrollIntoView({ block: "center", behavior: reduceMotion.matches ? "instant" : "smooth" });
}
document.addEventListener("click", event => {
  const target = event.target;
  if (target.closest("[data-start]")) {
    const previous = saved();
    if (previous) { state = { ...previous, screen: "resume", resume: previous }; render(true); }
    else { state = fresh(); setScreen("step", 0); }
    return;
  }
  if (target.closest("[data-resume]")) { const previous = state.resume; state = previous; render(true); return; }
  if (target.closest("[data-fresh]")) { if (confirm("Start a new check? Your saved answers will be cleared.")) { localStorage.removeItem(STORE); state = fresh(); setScreen("step", 0); } return; }
  if (target.closest("[data-back]")) { back(); return; }
  if (target.closest("[data-save]")) { persist(); state.screen = "landing"; render(true); return; }
  if (target.closest("[data-restart]")) { if (confirm("Retake the check? Your saved answers will be cleared.")) { localStorage.removeItem(STORE); state = fresh(); render(true); } return; }
  if (target.closest("[data-print]")) { window.print(); return; }
  const currency = target.closest("[data-currency]");
  if (currency) { state.money.currency = currency.dataset.currency; persist(); render(false); return; }
  const chip = target.closest("[data-money-chip]");
  if (chip) { const field = chip.dataset.moneyChip; state.money[field] = Number(chip.dataset.value); persist(); app.querySelector(`[data-money="${field}"]`).value = state.money[field]; return; }
  if (target.closest("[data-skip-money]")) { state.money.slipMonth = null; state.money.projectValue = null; persist(); next(); return; }
  const cardBack = target.closest("[data-grid-back]");
  if (cardBack) { state.gridCard = Math.max(0, state.gridCard - 1); persist(); render(false); return; }
  const cardNext = target.closest("[data-grid-next]");
  if (cardNext && !cardNext.disabled) { state.gridCard = Math.min(4, state.gridCard + 1); persist(); render(false); const heading = app.querySelector(".ar-v6-grid-row.current h3"); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); } return; }
  const choice = target.closest("[data-choice]");
  if (choice) {
    const id = choice.dataset.choice, value = Number(choice.dataset.value);
    if (id === "X2") state.sector = value;
    else if (id === "X1") state.role = value;
    else if (id === "V1") { state.goal = value; if (value !== 3) state.projectCount = null; }
    else if (id === "M1") state.ladder = value;
    else if (id === "M2" || id === "U1") {
      const array = id === "M2" ? state.tools : state.urgency, option = lookup(bank, id).options.find(item => Number(item.value) === value);
      const next = array.includes(value) ? array.filter(item => item !== value) : option.exclusive ? [value] : [...array.filter(item => !lookup(bank, id).options.find(entry => Number(entry.value) === item)?.exclusive), value];
      if (id === "M2") state.tools = next; else state.urgency = next.slice(0, 3);
    } else { state.cost[id] = value; if (id === "K3" && [0, 1].includes(value)) state.cost.K4 = 0; }
    persist();
    if (["M2", "U1", "V1", "K1", "K3"].includes(id)) {
      const follow = id === "V1" && value === 3 && sector() === "ipp" || id === "K3" && value > 1;
      render(false);
      if (follow) requestAnimationFrame(() => { const element = app.querySelector(id === "V1" ? "[data-follow]" : "[data-k4]"); element?.scrollIntoView({ block: "center", behavior: reduceMotion.matches ? "instant" : "smooth" }); element?.querySelector("legend,h3")?.focus({ preventScroll: true }); });
    } else next();
    return;
  }
  const notSure = target.closest("[data-likert-not-sure]");
  if (notSure) { syncLikert(notSure.dataset.group, notSure.dataset.likertNotSure, 0); return; }
  if (target.closest("[data-next]")) {
    if (target.closest("[data-next]").disabled) return;
    if (state.step === 10 && Number(state.cost.K3) > 1 && state.cost.K4 === undefined) { app.querySelector("[data-k4]")?.scrollIntoView({ block: "center" }); return; }
    next();
  }
});
app.addEventListener("change", event => {
  const field = event.target;
  if (field.dataset.grid) {
    const row = state.grid[field.dataset.grid] ||= {};
    row[field.dataset.axis] = Number(field.value); persist();
    app.querySelector("[data-next]").disabled = !bank.workstreams.every(item => state.grid[item.id]?.p !== undefined && state.grid[item.id]?.a !== undefined);
    const current = bank.workstreams[state.gridCard];
    const nextCard = app.querySelector("[data-grid-next]");
    if (nextCard) nextCard.disabled = state.grid[current.id]?.p === undefined || state.grid[current.id]?.a === undefined;
  }
  if (field.dataset.likert) syncLikert(field.dataset.group, field.dataset.likert, Number(field.value));
  if (field.name === "project-count") { state.projectCount = Number(field.value); persist(); }
});
app.addEventListener("input", event => {
  const field = event.target;
  if (field.matches("[data-exact]")) { state.k1Exact = field.value ? Math.max(1, Math.min(100000, Number(field.value))) : null; persist(); }
  if (field.dataset.money) { state.money[field.dataset.money] = field.value ? Number(field.value) : null; persist(); }
  if (field.dataset.resultMoney) { state.money[field.dataset.resultMoney] = field.value ? Number(field.value) : null; updateResultNumbers(); }
  if (field.matches("[data-people-cost]")) { state.peopleCost = field.value ? Number(field.value) : null; updateResultNumbers(); }
});
document.addEventListener("keydown", event => {
  if (state?.screen !== "step" || ![6, 7].includes(state.step) || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")) return;
  if (!/^[0-7]$/.test(event.key) && event.key.toLowerCase() !== "n") return;
  const first = app.querySelector(".ar-v6-statement.active") || app.querySelector(".ar-v6-statement");
  if (first) { event.preventDefault(); syncLikert(state.step === 6 ? "found" : "grow", first.dataset.statement, event.key.toLowerCase() === "n" ? 0 : Number(event.key)); first.classList.remove("active"); }
});

fetch("/assets/ai-roulette-v6-questions.json?v=1")
  .then(response => { if (!response.ok) throw new Error("Question bank unavailable"); return response.json(); })
  .then(data => { if (data.meta.version !== "2026-10-v6") throw new Error("Question bank version mismatch"); bank = data; clearOld(); state = fresh(); renderLanding(); render(); })
  .catch(error => { app.hidden = false; landing.hidden = true; app.innerHTML = `<p role="alert">The assessment could not load. ${esc(error.message)}</p>`; });
