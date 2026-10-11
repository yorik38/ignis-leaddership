export const VERSION = "2026-10-ceo-review-1";

export const SECTION_LABELS = {
  adoption: "AI adoption",
  workflow: "Workflow",
  data: "Data and evidence",
  governance: "Governance",
  win: "Winning work",
  deliver: "Delivering work",
  opportunity: "New opportunities"
};

const BUILD = {
  workflow: {
    title: "Build a repeatable decision workflow",
    why: "Work cannot scale if stages, decisions and handovers depend on the same few people.",
    first: "Map one live workflow, name the decision owner at each stage and record what must pass at handover.",
    owner: "COO or accountable functional leader",
    pilot: "Use one live opportunity or project to test the stages, decision rights and handover record."
  },
  data: {
    title: "Build a governed evidence base",
    why: "AI cannot reliably reuse information that is hard to find, out of date or disconnected from its source.",
    first: "Choose the evidence used most often in one workflow; assign owners, approved versions and source checks.",
    owner: "Commercial data owner with the relevant workstream lead",
    pilot: "Test retrieval and checking on one live submission, procurement or project question."
  },
  governance: {
    title: "Build the controls for trusted AI use",
    why: "AI use is difficult to scale when approved tools, review points and accountability are unclear.",
    first: "Agree which tools and information are permitted, who reviews consequential outputs and how errors are corrected.",
    owner: "Executive sponsor with IT, security and the workstream owner",
    pilot: "Apply the rules to one live AI-assisted output and record the source, reviewer and decision."
  },
  adoption: {
    title: "Build shared AI practice",
    why: "Individual experiments create less lasting capability than a repeatable way for a team to work.",
    first: "Select one recurring task, an approved tool, a team owner and a simple review standard.",
    owner: "Functional leader with an AI or technology partner",
    pilot: "Run the task with one team for 30 days and compare quality, time and rework with the previous method."
  },
  win: {
    title: "Build one governed win-work pilot",
    why: "The next step is to turn isolated AI assistance into a repeatable way to pursue the right work.",
    first: "Choose one live opportunity and define where AI may gather, compare or check evidence before a human decision.",
    owner: "Commercial or development lead",
    pilot: "Run the workflow through one auction, bid or opportunity decision and review speed and output quality."
  },
  deliver: {
    title: "Build one governed delivery-work pilot",
    why: "A bounded workflow can carry evidence and commitments forward without removing human accountability.",
    first: "Choose one live project and define the obligation, evidence and handover checks AI can support.",
    owner: "Project commercial or delivery lead",
    pilot: "Test the workflow through one procurement, contract or project milestone and record rework and delay."
  },
  opportunity: {
    title: "Test one new AI-enabled offer",
    why: "A new service or wider role needs a customer case and operating model before a technology build.",
    first: "Select one customer problem, describe the new value and identify what the business would need to own or operate.",
    owner: "CEO or commercial strategy lead",
    pilot: "Test the proposition, economics and obligations with one real buyer before building it."
  },
  visibility: {
    title: "Validate the organisation's starting point",
    why: "Too many answers fall outside this respondent's view to recommend a specific build responsibly.",
    first: "Compare this result with the people who own the workflow, data, technology and customer outcome.",
    owner: "Executive sponsor",
    pilot: "Review one live workflow with its owners and agree which facts still need checking."
  }
};

export function scoreSection(section, answers) {
  const items = section.questions.filter(question => question.type === "likert");
  const values = items.map(question => Number(answers[question.id])).filter(value => Number.isInteger(value) && value >= 1 && value <= 7);
  const minimum = Math.ceil(items.length / 2);
  return {
    id: section.id,
    label: SECTION_LABELS[section.id] || section.title,
    answered: values.length,
    possible: items.length,
    score: values.length >= minimum ? Math.round(values.reduce((sum, value) => sum + (value - 1) / 6 * 100, 0) / values.length) : null
  };
}

function mean(numbers) {
  return Math.round(numbers.reduce((sum, number) => sum + number, 0) / numbers.length);
}

function stageFor(answers, adoption) {
  const reach = answers.A2;
  const embedded = Number(answers.A6) >= 5 && Array.isArray(answers.A1) && answers.A1.includes("workflow");
  if (reach === "none" || reach === "occasional" || (adoption?.score != null && adoption.score < 35)) return "Exploring";
  if (["team", "department", "organisation"].includes(reach) && embedded) return "Embedded workflow";
  if (["team", "department", "organisation"].includes(reach)) return "Shared practice";
  if (reach === "individual") return "Individual use";
  return "Use not yet clear";
}

function choosePriority(byId, context) {
  const scorable = id => byId[id]?.score != null;
  const weakFoundations = ["workflow", "data", "governance"].filter(id => scorable(id) && byId[id].score < 55);
  if (scorable("governance") && scorable("adoption") && byId.adoption.score >= 45 && byId.governance.score < 45) return "governance";
  if (weakFoundations.length) {
    const preferred = context.bottleneck === "decisions" ? "workflow" : context.bottleneck === "evidence" ? "data" : null;
    if (preferred && weakFoundations.includes(preferred)) return preferred;
    return weakFoundations.sort((a, b) => byId[a].score - byId[b].score)[0];
  }
  const declaredFoundation = context.bottleneck === "decisions" ? "workflow" : context.bottleneck === "evidence" ? "data" : null;
  if (declaredFoundation && scorable(declaredFoundation) && byId[declaredFoundation].score < 75) return declaredFoundation;
  if (context.outcome === "offer" && scorable("opportunity") && byId.opportunity.score >= 50) return "opportunity";
  if (scorable("adoption") && byId.adoption.score < 55) return "adoption";
  const target = context.bottleneck === "winning" || context.outcome === "win" ? "win" : context.bottleneck === "delivery" || context.outcome === "deliver" ? "deliver" : null;
  if (target && scorable(target)) return target;
  const work = ["win", "deliver"].filter(scorable).sort((a, b) => byId[a].score - byId[b].score);
  return work[0] || (context.outcome === "offer" && scorable("opportunity") ? "opportunity" : "adoption");
}

function foundationFinding(byId, context) {
  const foundations = ["workflow","data","governance"].map(id => byId[id]).filter(item => item?.score != null).sort((a,b) => a.score - b.score);
  if (!foundations.length) return "There is not enough visibility yet to identify the main foundation gap.";
  const lowest = foundations.filter(item => item.score === foundations[0].score);
  if (lowest.length > 1) {
    const named = context.bottleneck === "evidence" ? "data" : context.bottleneck === "decisions" ? "workflow" : null;
    const note = named && lowest.some(item => item.id === named) ? ` You identified ${byId[named].label.toLowerCase()} as a live bottleneck.` : " No single foundation gap stands out from these scores.";
    return `${lowest.length === 3 ? "All three foundations" : "Two foundations"} are tied at ${lowest[0].score}/100.${note}`;
  }
  return `${lowest[0].label} is the lowest measured foundation at ${lowest[0].score}/100.`;
}

export function assess(bank, answers = {}, context = {}) {
  if (bank.version !== VERSION) throw new Error("Question bank version mismatch");
  const dimensions = bank.sections.map(section => scoreSection(section, answers));
  const byId = Object.fromEntries(dimensions.map(dimension => [dimension.id, dimension]));
  const workScores = [byId.win?.score, byId.deliver?.score].filter(value => value != null);
  const core = [byId.adoption?.score, byId.workflow?.score, byId.data?.score, byId.governance?.score, workScores.length ? mean(workScores) : null].filter(value => value != null);
  const score = byId.adoption?.score != null && byId.governance?.score != null && core.length >= 4 ? mean(core) : null;
  const priorityId = score === null ? "visibility" : choosePriority(byId, context);
  const priority = {id: priorityId, ...BUILD[priorityId]};
  const unknown = dimensions.filter(dimension => dimension.score === null).map(dimension => dimension.label);
  return {
    score,
    stage: stageFor(answers, byId.adoption),
    dimensions,
    priority,
    foundationFinding: foundationFinding(byId, context),
    unknown,
    outcome: context.outcome || null,
    bottleneck: context.bottleneck || null,
    opportunitySeparate: byId.opportunity?.score ?? null,
    caveat: "A self-assessment based on one person's view of the work they know. It is not an independent audit or an external benchmark."
  };
}
