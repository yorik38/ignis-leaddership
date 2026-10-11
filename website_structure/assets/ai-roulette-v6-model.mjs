// Pure v6 assessment model. All labels, weights and bands come from the question bank.
export const NOT_SURE = 0;
const question = (bank, id) => bank.questions.find(item => item.id === id);
const section = (bank, id) => bank.questions.filter(item => item.section === id).sort((a, b) => a.order - b.order);
export const textFor = (item, sector, field = "text") => item?.[`${field}BySector`]?.[sector] || item?.[field] || "";
const average = values => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
const index = value => value >= 1 && value <= 4 ? Math.round((value - 1) / 3 * 100) : null;

export function scoreGrid(bank, grid = {}, goalId) {
  const ws = {};
  for (const item of [...bank.workstreams].sort((a, b) => a.order - b.order)) {
    const p = Number(grid[item.id]?.p ?? 0), a = Number(grid[item.id]?.a ?? 0);
    if (![0, 1, 2, 3, 4].includes(p) || ![0, 1, 2, 3, 4].includes(a)) throw new Error(`Invalid workstream ${item.id}`);
    const processIndex = index(p), aiIndex = index(a);
    const weakness = Math.round(100 - (0.6 * (processIndex ?? 50) + 0.4 * (aiIndex ?? 50)));
    const importance = item.importance[goalId] ?? 2;
    const status = p === 0 ? "unknown" : p <= 2 && a >= 3 ? "aiahead" : p <= 2 ? "fixprocess" : a >= 3 ? "scale" : "quickwin";
    ws[item.id] = { P: p, A: a, processIndex, aiIndex, weakness, importance, priority: importance * weakness, status, order: item.order };
  }
  const ids = Object.keys(ws);
  const ranked = [...ids].sort((x, y) => ws[y].priority - ws[x].priority || ws[y].importance - ws[x].importance ||
    (ws[x].processIndex ?? 50) - (ws[y].processIndex ?? 50) || ws[x].order - ws[y].order);
  const biggestGap = ids.every(id => ws[id].P === 0 && ws[id].A === 0) ? null : ranked[0];
  const jointWith = biggestGap && ranked[1] && ws[ranked[1]].priority === ws[biggestGap].priority ? ranked[1] : null;
  return {
    ws, ranked, biggestGap, jointWith,
    processMaturityIndex: average(ids.map(id => ws[id].processIndex).filter(value => value !== null)),
    aiUseIndex: average(ids.map(id => ws[id].aiIndex).filter(value => value !== null)),
    fixProcessFirst: ranked.filter(id => ["fixprocess", "aiahead"].includes(ws[id].status)),
    quickWins: ranked.filter(id => ws[id].status === "quickwin"),
    aiAhead: ranked.filter(id => ws[id].status === "aiahead"),
    visibilityNote: ids.filter(id => ws[id].P === 0).length >= 3
  };
}

export function scoreLikert(bank, name, answers = {}, minAnswered, facetsDef = []) {
  const items = section(bank, name), itemScore = {}, notSure = [];
  for (const item of items) {
    const value = Number(answers?.[item.id] ?? 0);
    if (!Number.isInteger(value) || value < 0 || value > 7) throw new Error(`Invalid answer ${item.id}`);
    if (value === 0) { notSure.push(item.id); continue; }
    itemScore[item.id] = item.reverseScored ? 7 - value : value - 1;
  }
  const ids = items.map(item => item.id).filter(id => id in itemScore);
  const pct = keys => Math.round(keys.reduce((sum, id) => sum + itemScore[id], 0) / (6 * keys.length) * 100);
  const facets = Object.fromEntries(facetsDef.map(facet => [facet.id, facet.items.every(id => id in itemScore) ? pct(facet.items) : null]));
  const low = [...ids].sort((a, b) => itemScore[a] - itemScore[b])[0];
  return { total: ids.length >= minAnswered ? pct(ids) : null, facets, itemScore, notSure, nudge: low ?? null };
}

export function roundNice(value) {
  if (value === 0) return 0;
  if (Math.abs(value) < 10) return Math.round(value * 10) / 10;
  const place = 10 ** (Math.floor(Math.log10(Math.abs(value))) - 1);
  return Math.round(value / place) * place;
}
export const fmt = (value, unit = "") => unit + roundNice(value).toLocaleString("en-GB");
export function fmtMid(range, unit = "") {
  if (!range) return null;
  if (range.hi === null) return { text: `at least ${fmt(range.lo, unit)}`, mid: fmt(range.lo, unit), lo: fmt(range.lo, unit), hi: null };
  if (roundNice(range.lo) === roundNice(range.hi)) return { text: fmt(range.lo, unit), mid: fmt(range.lo, unit), lo: fmt(range.lo, unit), hi: fmt(range.hi, unit) };
  return { text: `about ${fmt(range.mid, unit)} (${fmt(range.lo, unit)} to ${fmt(range.hi, unit)})`, mid: fmt(range.mid, unit), lo: fmt(range.lo, unit), hi: fmt(range.hi, unit) };
}
const range = (lo, hi) => ({ lo, hi, mid: hi === null ? lo : (lo + hi) / 2 });
const multiply = (a, b) => ({ lo: a.lo * b.lo, hi: a.hi === null || b.hi === null ? null : a.hi * b.hi, mid: a.mid * b.mid });
const scale = (a, n) => ({ lo: a.lo * n, hi: a.hi === null ? null : a.hi * n, mid: a.mid * n });

export function scoreValue(bank, cost = {}, k1Exact = null, money = {}, peopleCost = null) {
  const assumptions = bank.value.assumptions;
  const option = id => {
    const value = Number(cost?.[id] ?? 0);
    if (value === 0) return null;
    const found = question(bank, id)?.options.find(item => Number(item.value) === value && item.range);
    if (!found) throw new Error(`Invalid estimate ${id}`);
    return found;
  };
  const team = Number(k1Exact) > 0 ? { range: [Number(k1Exact), Number(k1Exact)] } : option("K1");
  const hoursPerPerson = option("K2"), count = option("K3"), slip = option("K4"), passed = option("K6");
  const asRange = item => range(item.range[0], item.range[1]);
  const hours = team && hoursPerPerson ? scale(multiply(asRange(team), asRange(hoursPerPerson)), assumptions.workingWeeks) : null;
  const fte = hours ? scale(hours, 1 / assumptions.fteHoursPerYear) : null;
  let weeks = null, delay = null;
  if (count?.range[1] === 0) { weeks = range(0, 0); delay = 0; }
  else if (count && slip) { weeks = multiply(asRange(count), asRange(slip)); delay = (count.severity + slip.severity) / 2; }
  const missed = passed ? asRange(passed) : null;
  const slipMonth = Number(money?.slipMonth), projectValue = Number(money?.projectValue);
  let optimise = weeks && slipMonth > 0 ? scale(weeks, slipMonth / assumptions.weeksPerMonth) : null;
  if (optimise && hours && Number(peopleCost) > 0) {
    const labour = scale(hours, Number(peopleCost) / assumptions.fteHoursPerYear);
    optimise = { lo: optimise.lo + labour.lo, hi: optimise.hi === null || labour.hi === null ? null : optimise.hi + labour.hi, mid: optimise.mid + labour.mid };
  }
  const growPot = missed && projectValue > 0 ? scale(missed, projectValue) : null;
  return { hours, fte, weeks, missed, optimise, growPot, currency: money?.currency || "g",
    severity: { time: hoursPerPerson?.severity ?? null, delay, missed: passed?.severity ?? null } };
}

export function scoreUrgency(bank, selected = [], value = null) {
  const options = selected.map(number => question(bank, bank.urgency.question).options.find(item => Number(item.value) === Number(number))).filter(Boolean);
  const ids = options.map(item => item.id);
  if (options.some(item => item.class === "need")) return { level: "need", reason: "need-option", selected: ids };
  if (!options.length) return { level: "maybe", reason: "unanswered", selected: ids };
  if (options.some(item => item.class === "maybe")) return { level: "maybe", reason: ids.includes("notsure") ? "not-sure" : "next-quarter", selected: ids };
  const severity = value?.severity || {};
  if ((severity.delay ?? 0) >= bank.urgency.upgradeIfCostHigh.delaySeverityMin ||
    (severity.missed ?? 0) >= bank.urgency.upgradeIfCostHigh.missedSeverityMin) return { level: "maybe", reason: "cost-high", selected: ids };
  return { level: "want", reason: "want-only", selected: ids };
}
export function readiness(grid, foundations) {
  const parts = [[grid.processMaturityIndex, .4], [foundations.total, .4], [grid.aiUseIndex, .2]].filter(([value]) => value !== null);
  if (!parts.length) return null;
  const totalWeight = parts.reduce((sum, [, weight]) => sum + weight, 0);
  return Math.round(parts.reduce((sum, [value, weight]) => sum + value * weight, 0) / totalWeight);
}
export const zone = (bank, value) => value === null ? null : bank.scoring.zones.find(item => value < item.maxExclusive)?.id ?? null;
export const growBand = (bank, value) => value === null ? null : bank.scoring.grow.bands.find(item => value >= item.min && value <= item.max)?.id ?? null;

export function buildFirst(bank, sector, grid, foundations) {
  const facets = foundations.facets;
  const governance = facets.data !== null && facets.data < 40 || facets.leadership !== null && facets.leadership < 40;
  const gap = grid.biggestGap;
  const module = !gap ? "map" : sector === "ipp" ? gap : gap === "win" ? "win" : "map";
  const first = governance ? "governance" : module, then = governance ? module : null;
  return { first, then, sprint: sector === "ipp" && [first, then].some(id => id === "buy" || id === "close") };
}
export function moves(bank, sector, grid, foundations, readinessScore, growResult, goalId) {
  const work = Object.fromEntries(bank.workstreams.map(item => [item.id, item]));
  const workMove = (id, kind) => ({ ws: id, kind, text: sector === "ipp" ? work[id].moves[kind] :
    bank.workstreamMovesGeneric[kind].replace("{wsName}", textFor(work[id], sector, "name").replace(/^./, c => c.toLowerCase())) });
  const output = [], gap = grid.biggestGap;
  if (gap) {
    const status = grid.ws[gap].status;
    output.push(status === "unknown" ? { ws: gap, kind: "ask", text: bank.moves.ask.replace("{wsName}", textFor(work[gap], sector, "name").toLowerCase()) } :
      workMove(gap, ["fixprocess", "aiahead"].includes(status) ? "processMove" : status === "quickwin" ? "aiMove" : "scaleMove"));
  }
  const weakFacets = Object.entries(foundations.facets).filter(([, value]) => value !== null && value < 70).sort((a, b) => a[1] - b[1]);
  if (weakFacets.length) output.push({ facet: weakFacets[0][0], kind: "facet", text: bank.moves.facet[weakFacets[0][0]] });
  else {
    const next = grid.quickWins.find(id => id !== gap) || grid.fixProcessFirst.find(id => id !== gap) || grid.ranked.find(id => id !== gap && grid.ws[id].status !== "unknown");
    if (next) output.push(workMove(next, grid.ws[next].status === "quickwin" ? "aiMove" : grid.ws[next].status === "scale" ? "scaleMove" : "processMove"));
  }
  const growReady = readinessScore !== null && readinessScore >= 70 && ["ready", "within"].includes(growResult.band);
  output.push(growReady ? { kind: "grow", text: bank.moves.grow } : { kind: "goal", goal: goalId,
    text: bank.moves.goalBySector[goalId]?.[sector] || bank.moves.goal[goalId] });
  return output;
}
export function leadTags(sector, goalId, grid, growResult, urgency) {
  const tags = [];
  if (growResult.band === "ready" || growResult.total !== null && growResult.total >= 55 && goalId === "scope") tags.push("innovation");
  if (sector === "ipp" && (["buy", "close"].includes(grid.biggestGap) || goalId === "close")) tags.push("close-desk");
  if (urgency.level === "need") tags.push("need");
  return tags;
}
export const headlineKind = value => value.optimise ? "money" : value.weeks?.mid > 0 && value.hours ? "weeks" : value.hours ? "hours" : "none";
export function score(bank, state) {
  const sector = bank.sector.options.find(item => Number(item.value) === Number(state.sector))?.id || "ipp";
  const goal = question(bank, "V1").options.find(item => Number(item.value) === Number(state.goal))?.id ?? null;
  const grid = scoreGrid(bank, state.grid, goal);
  const foundations = scoreLikert(bank, "foundations", state.found, bank.scoring.foundations.minAnswered, bank.scoring.foundations.facets);
  const growScore = scoreLikert(bank, "grow", state.grow, bank.scoring.grow.minAnswered);
  const grow = { ...growScore, band: growBand(bank, growScore.total) };
  const value = scoreValue(bank, state.cost, state.k1Exact, state.money, state.peopleCost);
  const urgency = scoreUrgency(bank, state.urgency, value);
  const ready = readiness(grid, foundations);
  return { sector, goal, grid, foundations, grow, value, urgency, readiness: ready, readinessZone: zone(bank, ready),
    build: buildFirst(bank, sector, grid, foundations), moves: moves(bank, sector, grid, foundations, ready, grow, goal),
    tags: leadTags(sector, goal, grid, grow, urgency), headline: headlineKind(value) };
}
