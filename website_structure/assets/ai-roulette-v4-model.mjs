// Deterministic, indicative scoring for the v4 question bank. No network or PII.
export const bankVersion = "2026-10-v4";

export function visibleQuestions(bank, answers = {}) {
  return bank.questions.filter(q => !q.skipIf || !q.skipIf.values.includes(String(answers[q.skipIf.question])));
}

export function sectorText(item, field, sector = "ipp") {
  return item?.[`${field}BySector`]?.[sector] ?? item?.[field] ?? "";
}

export function optionFor(question, value) {
  return question?.options?.find(option => String(option.value) === String(value));
}

export function scoreGap(bank, answers) {
  const min = bank.scoring.minAnsweredPerLever;
  const gapQuestions = bank.questions.filter(q => q.section === "gap");
  const levers = bank.levers.map(lever => {
    const items = gapQuestions.filter(q => q.lever === lever.id);
    const values = items.map(q => ({ q, value: Number(answers[q.id]) })).filter(({value}) => Number.isInteger(value) && value >= 1 && value <= 7);
    const unknown = items.length - values.length;
    const health = values.length < min ? null : Math.round(values.reduce((sum, {q,value}) => sum + (q.reverseScored ? 7-value : value-1), 0) / (values.length*6) * 100);
    return {...lever, health, unknown, scoreFraction: health === null ? .5 : health/100};
  });
  const total = Math.round(levers.reduce((sum, lever) => sum + lever.scoreFraction, 0) / levers.length * 100);
  const groups = bank.groups.map(group => {
    const members = levers.filter(lever => lever.group === group.id);
    return {...group, health: Math.round(members.reduce((sum, lever) => sum + lever.scoreFraction, 0) / members.length * 100)};
  });
  const known = levers.filter(lever => lever.health !== null);
  const ranked = [...known].sort((a,b) => a.health-b.health || a.order-b.order);
  const archetype = ranked[0] ?? null;
  const reds = known.filter(lever => lever.health < bank.scoring.redBelowPct).sort((a,b) => bank.groups.findIndex(g => g.id === a.group)-bank.groups.findIndex(g => g.id === b.group) || a.health-b.health || a.order-b.order);
  const fixFirst = reds[0] ?? archetype;
  const strongest = [...known].sort((a,b) => b.health-a.health || a.order-b.order)[0] ?? null;
  let band = bank.scoring.bands.find(item => total >= item.min && total <= item.max)?.id ?? "betting";
  const gatedLever = band === "house" ? levers.find(lever => bank.scoring.governanceGate.levers.includes(lever.id) && lever.health !== null && lever.health < bank.scoring.governanceGate.thresholdPct) ?? null : null;
  if (gatedLever) band = "betting";
  const raw = gapQuestions.map(q => Number(answers[q.id])).filter(value => value >= 1 && value <= 7);
  const mean = raw.reduce((sum,value) => sum+value,0)/(raw.length || 1);
  const spread = Math.sqrt(raw.reduce((sum,value) => sum+(value-mean)**2,0)/(raw.length || 1));
  return {total,band,levers,groups,archetype,shadow:ranked[1]??null,strongest,fixFirst,gatedLever,weakestGroup:[...groups].sort((a,b)=>a.health-b.health||a.order-b.order)[0],blindSpots:levers.filter(lever=>lever.unknown).sort((a,b)=>b.unknown-a.unknown||a.order-b.order),visibilityOnly:known.length===0,straightLining:raw.length>=10&&spread<.5};
}

function selection(bank,id,answers){const q=bank.questions.find(item=>item.id===id);return optionFor(q,answers[id]);}
function multiplyRange(a,b,multiplier=1){if(!a?.range||!b?.range)return null;return [a.range[0]*b.range[0]*multiplier,a.range[1]===null||b.range[1]===null?null:a.range[1]*b.range[1]*multiplier];}
export function scoreCost(bank,answers,archetype=null){
  const k1=selection(bank,"K1",answers),k2=selection(bank,"K2",answers),k3=selection(bank,"K3",answers),k4=selection(bank,"K4",answers),k6=selection(bank,"K6",answers);
  const weeks=bank.cost.assumptions.workingWeeks;
  const time=multiplyRange(k1,k2,weeks);
  const delay=k3?.range?.[0]===0?[0,0]:multiplyRange(k3,k4);
  const missed=k6?.range??null;
  const severity={time:k2?.severity??null,delay:k3?.range?.[0]===0?0:(k3?.severity!=null&&k4?.severity!=null?(k3.severity+k4.severity)/2:null),missed:k6?.severity??null};
  const costRank=dim=>{const rank=archetype?.costDims?.indexOf(dim)??-1;return rank<0?99:rank};
  const candidates=Object.entries(severity).filter(([,value])=>value>0).sort((a,b)=>b[1]-a[1] || costRank(a[0])-costRank(b[0]) || bank.cost.dimOrder.indexOf(a[0])-bank.cost.dimOrder.indexOf(b[0]));
  return {time,delay,missed,severity,biggest:candidates[0]?.[0]??null};
}

export function urgencyLevel(bank,answers,cost){
  const q=bank.questions.find(item=>item.id==="U1");
  const chosen=(Array.isArray(answers.U1)?answers.U1:[]).map(id=>q.options.find(option=>option.id===id)).filter(Boolean);
  if(chosen.some(option=>option.class==="need"))return "need";
  if(!chosen.length||chosen.some(option=>option.class==="maybe"))return "maybe";
  if((cost.severity.delay??0)>=bank.urgency.upgradeIfCostHigh.delaySeverityMin||(cost.severity.missed??0)>=bank.urgency.upgradeIfCostHigh.missedSeverityMin)return "maybe";
  return "want";
}

export function pathFor(result,vision){
  if(result.visibilityOnly)return "map";
  if(result.band==="house")return "support";
  if(result.band==="spinning"||result.fixFirst?.group==="aim"||vision==="aiplan")return "map";
  return "design";
}

export function formatRange(range,digits=0){
  if(!range)return "Not sure: worth finding out";
  const fmt=value=>Number(value).toLocaleString("en-GB",{maximumFractionDigits:digits});
  return range[1]===null?`${fmt(range[0])}+`:`${fmt(range[0])} to ${fmt(range[1])}`;
}
