// AI Roulette is an indicative, self-reported conversation starter, not a benchmark.
export const lanes = [
  {id:"win",title:"Win work.",description:"From business development and bids to tenders and transactions.",activities:[
    ["bd","Business development"],["bids","Bids and proposals"],["tenders","Tenders"],["transactions","Transactions"]]},
  {id:"deliver",title:"Deliver work.",description:"Keep commitments, evidence and commercial decisions connected after the win.",activities:[
    ["handover","Handover"],["mobilisation","Mobilisation"],["contracts_change","Contracts and change"],["reporting","Reporting"]]},
  {id:"sell",title:"Sell differently.",description:"Explore a service or delivery model AI could make viable.",activities:[
    ["external_service","New service for clients"],["internal_tool","New tool for the business"]]}
];

const option=(value,label,points,activities)=>({value,label,points,activities});
const scale=(id,text,dimension,low,high)=>({id,text,dimension,type:"scale",low,high});
const single=(id,text,dimension,options)=>({id,text,dimension,type:"single",options});
const governanceOptions=[option("no_rules","No rules yet",0),option("unclear","Rules exist but are unclear for this work",1),option("not_sure","Not sure",1),option("not_applied","Clear rules, not yet built into our workflows",3),option("applied","Clear rules built into workflows, with named owners",4)];
const sponsorOptions=[option("no_sponsor","No obvious sponsor",0),option("manager_no_budget","An interested manager without budget",1),option("director_no_budget","A director with appetite, budget not agreed",3),option("sponsor_budget","A sponsor with budget and a mandate",4)];
const ownershipOptions=[option("none","No owned AI-assisted workflow",0),option("ad_hoc","Individuals choose tasks and checks for themselves",1),option("pilot","A team pilot has a named owner and review points",2),option("defined","A defined process uses approved inputs and human review",3),option("monitored","The owned process is monitored, improved and used in normal work",4)];

const win=[
  single("W1","Where does the most time, cost or risk sit today?",null,[
    option("account_insight","Understanding accounts and upcoming opportunities",null,["bd","transactions"]),option("qualification","Deciding which opportunities to pursue"),option("reading_docs","Reading and interpreting tender or deal documents",null,["bids","tenders","transactions"]),option("evidence_reuse","Finding and reusing past evidence, CVs and case studies",null,["bd","bids","tenders"]),option("writing_review","Writing and reviewing responses",null,["bd","bids","tenders"]),option("pricing_risk","Pricing, risk positions and assumptions"),option("coordination","Coordinating contributors, reviews and deadlines"),option("due_diligence","Due diligence, data rooms and conditions precedent",null,["transactions"]),option("negotiation_positions","Preparing negotiation positions and markups",null,["transactions"])]),
  scale("W2","How repeatable is your process from opportunity to submission or signing?","process","Every pursuit runs differently","Defined stages, templates and gates, used every time"),
  single("W3","How do you measure performance in this work?","process",[option("none","We do not track it consistently",0),option("wins","We track wins and losses",1),option("win_rate","We track win rate and pipeline value",2),option("cost_cycle","We also track cost to pursue and cycle time",3),option("acted_on","We review these regularly and act on them",4)]),
  scale("W4","When you need your best past evidence, how quickly can your team find an approved version?","evidence","It depends who you ask","Minutes, from a maintained library with owners"),
  single("W5","How structured is the data behind pricing, risk and past outcomes?","evidence",[option("personal","Mostly in personal spreadsheets and inboxes",0),option("shared_mixed","Shared folders, inconsistent formats",1),option("some_templates","Some standard templates, partly reused",2),option("central_record","Standard templates and a central record",3),option("linked_outcomes","Structured, maintained and linked to outcomes",4)]),
  scale("W6","How clear is it who approves go or no-go, price, risk positions and final terms?","governance","Decided case by case, often late","Documented authority levels, followed and recorded"),
  single("W7","Does your organisation have rules for using AI with commercial and customer-confidential information?","governance",governanceOptions),
  single("W8","How is AI built into an owned workflow here?","adoption",ownershipOptions),
  single("W9","Who would sponsor a change to how this work runs?","adoption",sponsorOptions)
];
const deliver=[
  single("D1","Where does the most time, cost or risk sit today?",null,[option("handover_gaps","Commitments and assumptions lost between bid and delivery",null,["handover","mobilisation"]),option("mobilisation","Setting up plans, controls and the team at start",null,["handover","mobilisation"]),option("obligations","Tracking obligations, notices and deadlines"),option("change","Managing change and variations",null,["contracts_change","reporting"]),option("claims","Building evidence for claims or disputes",null,["contracts_change","reporting"]),option("supplier","Supplier and subcontract management",null,["mobilisation","contracts_change"]),option("payment","Payment applications and cash",null,["contracts_change","reporting"]),option("reporting","Commercial, progress and performance reporting")]),
  scale("D2","How well do bid commitments, assumptions and risks carry into delivery?","contract","Delivery often starts without them","A structured handover, with an owner for each commitment"),
  scale("D3","How visible are your live obligations, notice periods and time bars?","contract","Held in people's heads","In a maintained register with owners and alerts"),
  single("D4","Where do contract correspondence and records mostly live?","records",[option("inboxes","Personal inboxes and drives",0),option("shared_drives","Shared drives, filed inconsistently",1),option("doc_control","A document control system, partly structured",2),option("cde","A common data environment with consistent metadata",3),option("cms_linked","A contract management system linked to records",4)]),
  single("D5","How long does monthly commercial reporting take your team?","records",[option("week_plus","More than a week of effort, mostly manual",0),option("several_days","Several days, rebuilt each month",1),option("few_days","A few days, with standard templates",2),option("about_day","About a day, mostly drawn from systems",3),option("review_only","Largely automated; time goes on review",4)]),
  scale("D6","How clear is it who decides on change, notices and claims positions?","governance","Unclear, often decided under pressure","Documented authority, followed and recorded"),
  single("D7","Does your organisation have rules for using AI with contract and customer information?","governance",governanceOptions),
  single("D8","How is AI built into an owned workflow here?","adoption",ownershipOptions),
  single("D9","Who would sponsor a change to how this work runs?","adoption",sponsorOptions)
];
const sellCommon=[
  scale("S2","How well is your scarce expertise written down as methods others could follow?","assets","It lives in a few people's heads","Documented methods, used across teams"),
  single("S3","Do you hold useful data or insight with clear rights to use it?","assets",[option("none","No relevant data",0),option("rights_unclear","Data exists, but rights are unclear",1),option("not_sure","Not sure",1),option("some_clear","Some data, with clear rights",2),option("clear_partly","Clear rights to useful data, partly structured",3),option("clear_structured","Clear rights, structured and maintained",4)])
];
const sellExternal=[
  single("S1","What is driving the question?",null,[option("margin","Margin pressure on existing services"),option("more_for_less","Customers expecting more for less"),option("new_entrants","Competitors or new entrants offering digital services"),option("scarce_experts","Scarce experts limit how much we can deliver"),option("leadership_ask","Leadership wants a plan for AI-enabled growth"),option("unused_data","We hold data we do not use well")]),
  ...sellCommon,
  single("S4","What evidence do you have that customers want this?","demand",[option("internal_idea","An internal idea so far",0),option("anecdotal","Anecdotal conversations",1),option("asked_directly","Customers have asked for it directly",3),option("would_cofund","A customer would pilot or co-fund it",4)]),
  scale("S5","How clear is it who would buy this, and how they buy?","demand","Not yet clear","Named buyers, budget lines and procurement route understood"),
  single("S6","How developed is the commercial model: pricing, margin and terms?","model",[option("not_started","Not started",0),option("ideas","Ideas, nothing tested",1),option("draft","A draft model with stated assumptions",2),option("tested_internal","Tested with finance and commercial colleagues",3),option("tested_customers","Tested with customers",4)]),
  scale("S7","Could your teams sell, deliver and support a recurring AI-enabled service?","model","Not without new capability across the board","Yes, with clear roles for sales, delivery and support"),
  scale("S8","How clear are liability, assurance and IP positions for an AI-enabled offer?","governance","Not discussed yet","Agreed with legal, risk and insurance"),
  single("S9","Who would sponsor a new offer?","governance",sponsorOptions)
];
const sellInternal=[
  single("S1","What is driving the question?",null,[option("scarce_experts","Scarce experts limit how much we can deliver"),option("repeated_work","Teams repeat the same analysis or documents"),option("inconsistent_quality","Quality varies by team or person"),option("slow_decisions","Decisions wait on information that is hard to pull together"),option("leadership_ask","Leadership wants a plan for AI-enabled growth"),option("unused_data","We hold data we do not use well")]),
  ...sellCommon,
  single("S4","What evidence do you have that teams would use it?","demand",[option("idea_only","An idea so far",0),option("anecdotal","Anecdotal requests",1),option("team_asked","A team has asked for it directly",3),option("team_commits","A team would pilot it and give time to it",4)]),
  scale("S5","How clearly can you describe who would use it and the task or decision it supports?","demand","Not yet clear","Named users, the task and its current cost understood"),
  single("S6","How clear is the value case for the tool?","model",[option("not_started","Not started",0),option("ideas","Ideas, nothing measured",1),option("baseline","We know the current time, cost or quality of the task",2),option("agreed_owner","Value case agreed with the business owner",3),option("measured_trial","Value case agreed and measured on a trial",4)]),
  scale("S7","Could your teams build, run and support the tool inside the business?","model","Not without new capability across the board","Yes, with a named owner, IT support and a route into daily work"),
  scale("S8","How clear are data, security and approval rules for an internal AI tool?","governance","Not discussed yet","Agreed with IT, security and legal"),
  single("S9","Who would sponsor the tool?","governance",sponsorOptions)
];
export function questionsFor(lane,activity){if(lane==="win")return win;if(lane==="deliver")return deliver;if(lane==="sell")return activity==="internal_tool"?sellInternal:sellExternal;return[]}

export const aiUses=[
  ["copilot","People use a copilot for research, summaries or drafting"],
  ["personal_agents","People have built their own assistants, custom agents or automations"],
  ["approved_features","Teams use approved AI features or plug-ins in existing software"],
  ["team_process","A team runs a defined AI-assisted process with shared inputs and review points"],
  ["connected_workflow","AI connects information or actions across systems in a governed workflow"],
  ["none","Not used yet"],
  ["unknown","I don't know"]
];

export const dimensionLabels={win:{process:"Process and measurement",evidence:"Evidence and data",governance:"Governance and decision rights",adoption:"Workflow ownership and sponsorship"},deliver:{contract:"Contract visibility",records:"Records and reporting",governance:"Governance and decision rights",adoption:"Workflow ownership and sponsorship"},sell:{assets:"Expertise and data",demand:"Evidence of demand",model:"Value and delivery model",governance:"Governance and sponsorship"}};

export function evaluate({lane,activity,answers}){
  const questions=questionsFor(lane,activity);
  if(!questions.length||questions.some(q=>answers[q.id]===undefined))throw new Error("Complete all questions before viewing a result.");
  const totals={};
  for(const q of questions){
    if(!q.dimension)continue;
    const answer=answers[q.id];
    const points=q.type==="scale"?Number(answer)-1:q.options.find(o=>o.value===answer)?.points;
    if(!Number.isInteger(points)||points<0||points>4)throw new Error("An answer could not be scored.");
    totals[q.dimension]=(totals[q.dimension]||0)+points;
  }
  const dimensions=Object.fromEntries(Object.entries(totals).map(([key,points])=>[key,Math.round(points/8*100)]));
  const score=Math.round(Object.values(totals).reduce((a,b)=>a+b,0)/32*100);
  let band=score<40?"experimenting":score<70?"design":"pilot";
  const gates=[];
  if(band==="pilot"&&dimensions.governance<50){band="design";gates.push("Governance and decision rights need clearer ownership before a broader pilot.")}
  const sponsor=answers[lane==="win"?"W9":lane==="deliver"?"D9":"S9"];
  if(band==="pilot"&&sponsor==="no_sponsor"){band="design";gates.push("A named sponsor is needed before this becomes an owned change.")}
  if(lane==="sell"&&band==="pilot"&&["internal_idea","idea_only","anecdotal"].includes(answers.S4)){band="design";gates.push("Demand needs testing before committing to delivery.")}
  const constraint=Object.keys(dimensions).sort((a,b)=>dimensions[a]-dimensions[b])[0];
  return{score,band,dimensions,constraint,gates};
}

export const bandLabels={experimenting:"Start by mapping",design:"Ready to design a bounded move",pilot:"Foundations for a pilot"};
export const humanBoundary={win:"People retain go or no-go, price, risk and final customer commitments.",deliver:"People retain contract interpretations, notices, claims positions and decisions that affect customers or suppliers.",sell:"People own the customer promise, commercial model, safety, legal positions and the decision to launch."};

const moveCopy={
  win:{process:["Map one pursuit from qualification to decision and name its owner, gates and measures.","Test a repeatable go/no-go review.","Set a baseline for time, cost and quality before automation."],evidence:["Build an approved evidence map for one pursuit, with owners and expiry dates.","Identify the sources behind pricing and risk decisions.","Test retrieval on a real bid before drafting from it."],governance:["Agree who can approve AI use, evidence, price and risk on one live pursuit.","Document the human review points.","Test confidential-information rules with IT and legal."],adoption:["Give one commercial workflow a sponsor, owner and explicit human review points.","Choose a narrow team pilot rather than more ad hoc use.","Review actual usage and exceptions after the first cycle."]},
  deliver:{contract:["Map the handover from bid commitments to live obligations, naming an owner for each.","Create one maintained obligations register.","Test alerts against a real notice or milestone."],records:["Bring the records for one commercial decision into a reliable, reviewable trail.","Standardise the source and metadata for reporting.","Measure the effort of the current monthly report."],governance:["Set decision rights for contract change, notices and AI-supported analysis.","Mark the points where legal or commercial sign-off is mandatory.","Test the rules against a live exception."],adoption:["Give one delivery workflow a sponsor, owner and human review points.","Pilot a defined task with approved sources.","Review failures and exceptions before wider use."]},
  sell:{assets:["Map the expertise and data that could support one useful offer, including rights to use them.","Write down the expert method behind the offer.","Test whether source material is reliable enough to repeat."],demand:["Test the proposed value with named customers or users before designing a build.","Ask what they would buy or commit time to use.","Identify the buyer, budget and existing alternative."],model:["Sketch one offer and test its price, delivery cost, margin and human service boundary.","Model the work needed to sell and support it.","Pilot the promise before broadening the offer."],governance:["Name a sponsor and define rights, liability, approvals and human accountability for one offer.","Review the design with risk, legal and technical owners.","Document what must be checked before launch."]}
};
const internalMoves={assets:["Map the expert method and data an internal team needs for one useful tool, including rights to use them.","Write down the task and judgement the tool must support.","Test source quality with the people who do the work."],demand:["Find one team willing to pilot the tool on a real task and give time to its review.","Name the users and the current cost of the task.","Agree what would make the team keep using it."],model:["Set a value case for one internal tool, with a baseline for time, cost or quality.","Name who will own support after the pilot.","Test whether the tool changes the task, not just the draft."],governance:["Agree a sponsor, data rules and human approval points for one internal tool.","Review security and access with IT.","Document what must be checked before wider use."]};
const pilotMoves={win:["Pilot one owned pursuit workflow on a live opportunity, with approved evidence and named human approvals.","Measure time, quality and exceptions against the current process.","Review what the team would keep, change or stop before scaling."],deliver:["Pilot one owned delivery workflow on a live contract, with traceable records and human sign-off.","Check exceptions, notices and commercial decisions against the real contract.","Review adoption and evidence quality before using it more widely."],external_service:["Pilot one AI-enabled service with a willing customer and a clear commercial promise.","Test delivery cost, liability and review effort against the proposed price.","Ask what the customer would pay for again before scaling."],internal_tool:["Pilot one internal tool with a committed team on a real task.","Measure the change in time, quality and decision confidence.","Keep a route to a client offer open, but test internal usefulness first."]};
export function movesFor(lane,constraint,activity,band){if(band==="pilot")return pilotMoves[activity]||pilotMoves[lane]||[];if(lane==="sell"&&activity==="internal_tool")return internalMoves[constraint]||[];return moveCopy[lane]?.[constraint]||[]}

export function startingPlanFor(band,lane){
  const name=lanes.find(item=>item.id===lane)?.title.toLowerCase().replace('.','')||'this work';
  if(band==='experimenting')return[
    `Week 1: name one live pressure in ${name} and one owner for it.`,
    'Week 2: map how that work runs today, including who decides what.',
    'Week 3: agree AI rules for the information involved.',
    'Week 4: choose one bounded move and define what a good result would look like.'
  ];
  if(band==='design')return[
    'Week 1: choose one move and one live piece of work to design around.',
    'Week 2: map the evidence, systems and decision points it needs.',
    'Week 3: define human review points, controls and measures.',
    'Week 4: write a one-page pilot brief a team or technology partner could build from.'
  ];
  return[
    'Week 1: confirm pilot scope, measures and sponsor sign-off.',
    'Week 2: agree build and review responsibilities.',
    'Week 3: prepare the people who will use it, including roles and training.',
    'Week 4: start on live work, with a review date in the diary.'
  ];
}
