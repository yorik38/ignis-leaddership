export const VERSION = "2026-10-ceo-review-2";

const STAGES = {
  development: "early development",
  route: "route to market",
  procurement: "procurement",
  close: "financial close"
};

export function stageScope(stages) {
  const stage = Array.isArray(stages) ? stages[0] : stages;
  if (stage === "all") return "This result reflects your view across the full project lifecycle.";
  if (!STAGES[stage]) return "This result reflects the work you know; no project stage was selected.";
  return `This result reflects your view of ${STAGES[stage]}.`;
}

export function stageApplication(stages) {
  const stage = Array.isArray(stages) ? stages[0] : stages;
  if (stage === "all") return "Test this priority across one live project's stages and handovers before applying it across the pipeline.";
  const examples = {
    development: "a site, grid, planning or land decision",
    route: "an auction, tender or offtake decision",
    procurement: "a supplier return, interface issue or contract decision",
    close: "a lender evidence request or financial-close decision"
  };
  return `Test this priority against ${examples[stage] || "one live activity"} before scaling it.`;
}

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
    why: "The available answers do not yet distinguish one build priority clearly enough.",
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
  const comparable = ["adoption", "workflow", "data", "governance", "win", "deliver"].map(id => byId[id]?.score);
  if ((!context.bottleneck || context.bottleneck === "unclear") && comparable.every(score => score != null) && Math.max(...comparable) - Math.min(...comparable) <= 5 && comparable.every(score => score >= 45 && score <= 55)) return "visibility";
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

function readerLead(persona) {
  if (persona === "team") return "In the work your team does,";
  if (persona === "leader") return "From your view of the business,";
  return "In the work you know,";
}

function adoptionFinding(answers, byId, stage, persona) {
  const lead = readerLead(persona);
  const modes = Array.isArray(answers.A1) ? answers.A1.filter(mode => mode !== "none") : [];
  const embedded = modes.includes("workflow") && Number(answers.A6) >= 5;
  if (!modes.length || answers.A2 === "none") return `${lead} AI is not yet part of regular work. Start with one useful task and an approved way to try it.`;
  if (stage === "Exploring") return `${lead} AI use is still exploratory. People may be trying tools, but the answers do not yet show a shared way of working.`;
  if (stage === "Individual use") {
    const mode = modes.length === 1 && modes[0] === "copilot" ? "mostly through an assistant or copilot" : "through tools and individual experiments";
    return `${lead} AI is being used ${mode}, but it has not yet become a repeatable team practice. The next step is to make one use case work beyond the person who started it.`;
  }
  if (embedded) return `${lead} AI is moving beyond individual prompts and into an agreed workflow. The opportunity now is to check whether the evidence, controls and ownership can support that way of working consistently.`;
  if (stage === "Shared practice") return `${lead} AI use is spreading across a team or wider business. You are moving beyond isolated prompting, but the answers suggest there is still work to do before it becomes a dependable system.`;
  return `${lead} there is some AI use, but its reach is not clear from these answers. Check how consistently the practice is shared before scaling it.`;
}

function foundationNarrative(byId) {
  const foundations = [byId.workflow, byId.data, byId.governance].filter(item => item?.score != null).sort((a, b) => a.score - b.score);
  if (!foundations.length) return "You may need a clearer picture of the workflow, evidence and controls before deciding what to scale.";
  const lowest = foundations.filter(item => item.score === foundations[0].score);
  if (lowest.length > 1) return `${lowest.length === 3 ? "Workflow, data and governance" : lowest.map(item => item.label.toLowerCase()).join(" and ")} received the same rating. No single constraint stands out yet. Test them together in one live workflow before choosing the next build.`;
  const label = lowest[0].label.toLowerCase();
  return lowest[0].score < 45
    ? `${label.charAt(0).toUpperCase() + label.slice(1)} looks like the clearest barrier to scaling AI reliably. Strengthening it will make shared use easier to trust and repeat.`
    : `${label.charAt(0).toUpperCase() + label.slice(1)} is the next foundation to strengthen. Check it in a live workflow before asking more people to rely on AI.`;
}

function workFinding(byId) {
  const win = byId.win?.score, deliver = byId.deliver?.score, opportunity = byId.opportunity?.score;
  if (win == null && deliver == null) return "There is not enough visibility yet to say where AI is helping winning or delivering work. A small pilot can make that clearer.";
  const weaker = win == null ? "delivering work" : deliver == null ? "winning work" : win < deliver ? "winning work" : "delivering work";
  const comparison = win != null && deliver != null && Math.abs(win - deliver) >= 10
    ? `Your answers point to ${weaker} as the less developed area.`
    : "Winning and delivering work appear to be at a similar stage.";
  const opportunityLine = opportunity == null ? "Your answers do not yet give a clear view of new AI-enabled opportunities." : opportunity < 70
    ? "These answers do not yet establish a case for a new AI-enabled offer. That is separate from improving current work."
    : "Some conditions for exploring a new AI-enabled offer are reported, but customer demand and delivery obligations still need testing.";
  return `${comparison} ${opportunityLine}`;
}

function priorityFinding(priority) {
  if (priority.id === "visibility") return "These answers do not yet justify one specific build. Compare this view with the people who own the work, evidence and controls, then choose a bounded test.";
  return `Your answers point to this as the next thing to build because ${priority.why.charAt(0).toLowerCase() + priority.why.slice(1)} Start small, then check the result with the people who own the work.`;
}

export function assess(bank, answers = {}, context = {}) {
  if (bank.version !== VERSION) throw new Error("Question bank version mismatch");
  const dimensions = bank.sections.map(section => scoreSection(section, answers));
  const byId = Object.fromEntries(dimensions.map(dimension => [dimension.id, dimension]));
  const workScores = [byId.win?.score, byId.deliver?.score].filter(value => value != null);
  // The gauge describes AI capability demonstrated in reported work. Foundations
  // are separate findings; governance limits the claim rather than inflating it.
  const workScore = workScores.length ? mean(workScores) : null;
  const useScore = byId.adoption?.score != null && workScore != null ? mean([byId.adoption.score, workScore]) : null;
  const score = useScore != null && byId.governance?.score != null ? Math.min(useScore, byId.governance.score) : null;
  const priorityId = score === null ? "visibility" : choosePriority(byId, context);
  const priority = {id: priorityId, ...BUILD[priorityId]};
  const unknown = dimensions.filter(dimension => dimension.score === null).map(dimension => dimension.label);
  return {
    score,
    scoreExplanation: "The score combines reported AI adoption and AI use in live work, limited by governance. Workflow and data are shown separately.",
    stage: stageFor(answers, byId.adoption),
    scope: stageScope(context.stages),
    stageApplication: stageApplication(context.stages),
    dimensions,
    priority,
    foundationFinding: foundationFinding(byId, context),
    findings: {
      adoption: adoptionFinding(answers, byId, stageFor(answers, byId.adoption), context.persona),
      foundations: foundationNarrative(byId),
      work: workFinding(byId),
      priority: priorityFinding(priority)
    },
    unknown,
    outcome: context.outcome || null,
    bottleneck: context.bottleneck || null,
    opportunitySeparate: byId.opportunity?.score ?? null,
    caveat: "A self-assessment based on one person's view of the work they know. It is not an independent audit or an external benchmark."
  };
}
