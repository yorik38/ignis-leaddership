// AI Roulette is an indicative, self-reported conversation starter, not a benchmark.
// Structure: Maturity (opening context, unscored for banding), then Adoption,
// Governance and Transformation. AI Roulette is the public name; there is no acronym.
// Adoption branches once (front_end = winning work / back_end = delivering it).
// Transformation branches once (external = for clients / internal = for the organisation).
// Everyone answers Maturity, then passes a preview email checkpoint before the scored areas.
// Questions are mostly a single 1-5 agree/disagree scale for a consistent, centred answer UI.
// A handful stay as a pick-one list where the answer is genuinely a named category, not a degree: the
// maturity ladder (M1) and the two branch questions (T0, A0).

const option=(value,label,points)=>({value,label,points});
const scale=(id,text,dimension,low,high)=>({id,text,dimension,type:"scale",low,high});
const single=(id,text,dimension,options)=>({id,text,dimension,type:"single",options});

// Landing-page decorative wheel and the Maturity section share this ladder, so they tell the same story.
export const maturityStages=[
  {id:"no_access",label:"No access",shortLabel:"No access",color:"#39424a",textDark:false,note:"AI tools are blocked. Too much risk, not enough reward, to allow it yet."},
  {id:"shadow_use",label:"Shadow use",shortLabel:"Shadow use",color:"#55626c",textDark:false,note:"People use personal AI tools quietly. No policy, no visibility."},
  {id:"approved_copilot",label:"Approved copilot",shortLabel:"Copilot",color:"#7fa0c9",textDark:true,note:"Teams use sanctioned copilot features or plug-ins inside existing software."},
  {id:"custom_agents",label:"Custom agents",shortLabel:"Custom agents",color:"#8fb0d6",textDark:true,note:"Individuals build their own assistants or automations for their own work."},
  {id:"team_workflows",label:"Team workflows",shortLabel:"Team workflows",color:"#69c0bc",textDark:true,note:"A team runs a shared, AI-assisted process with defined inputs and review points."},
  {id:"pilot",label:"Pilot",shortLabel:"Pilot",color:"#4fa39c",textDark:false,note:"A governed pilot connects AI into real work, with a named owner and measured results."},
  {id:"production",label:"Production",shortLabel:"Production",color:"#e3b575",textDark:true,note:"AI is embedded in everyday commercial work, monitored and continuously improved."}
];
const maturityPoints={no_access:0,shadow_use:1,approved_copilot:2,custom_agents:2,team_workflows:3,pilot:3,production:4};

export const maturity=[
  single("M1","Which best describes AI use in your organisation today?","maturity",maturityStages.map(s=>option(s.id,s.label,maturityPoints[s.id]))),
  scale("M2","I'm confident this is accurate across the whole organisation, not just my own experience.","maturity","Not confident, this is my own impression","Very confident, this matches what others report too"),
  scale("M3","Leadership has set a clear direction for AI, and expects progress.","maturity","No clear stance either way","A clear mandate, with progress expected"),
  scale("M4","How much has changed in our AI use in the last 12 months?","maturity","Nothing has really changed","Rapid, visible change"),
  scale("M5","AI is used widely across the organisation, not just by a few enthusiasts.","maturity","Just a handful of individuals","Organisation-wide, as normal practice"),
  scale("M6","Our AI tooling is sophisticated, connected, purpose-built workflows, not just basic chat.","maturity","Basic, general-purpose chat tools only","Connected, purpose-built tools integrated into real workflows")
];

export const adoptionBranch=single("A0","Are you mainly on the front end of commercial work, or the back end?",null,[option("front_end","Winning it, business development, bids, tenders"),option("back_end","Delivering it, mobilisation, contracts, reporting")]);

const cadence=[
  scale("AC1","How repeatable is your process from opportunity to submission or signing?","cadence","Every pursuit runs differently","Defined stages, templates and gates, used every time"),
  scale("AC2","We track performance in this work and act on what we learn.","cadence","We do not track it consistently","We review these regularly and act on them"),
  scale("AC3","How consistently does your team use the same evidence and templates across pursuits?","cadence","Everyone builds their own version","A shared, current template and evidence set every time"),
  scale("AC4","When a pursuit stalls or a deadline slips, a clear pattern kicks in to get it moving again.","cadence","No consistent pattern, depends who's involved","Patterns are reviewed and the process improved"),
  scale("AC5","How much of the decision to pursue relies on one person's judgement versus a documented process?","cadence","Almost entirely one person's judgement","A documented process most people could run"),
  scale("AC6","AI is used in a structured way in this work, not just occasionally.","cadence","Not used in this work","Embedded in the actual workflow, not just individual tasks")
];
const cache=[
  scale("AH1","When you need your best past evidence, how quickly can your team find an approved version?","cache","It depends who you ask","Minutes, from a maintained library with owners"),
  scale("AH2","The data behind pricing, risk and past outcomes is structured and reliable.","cache","Mostly in personal spreadsheets and inboxes","Structured, maintained and linked to outcomes"),
  scale("AH3","How confident are you that the evidence being reused is still accurate and approved?","cache","Not confident, no one checks","Very confident, evidence has an owner and expiry"),
  scale("AH4","Someone is clearly responsible for keeping our evidence library current.","cache","No one specifically","A documented team process keeps it current"),
  scale("AH5","How easily can someone outside the original pursuit find and reuse this evidence?","cache","Only the people who wrote it know where it is","Anyone can find it through a shared, searchable library"),
  scale("AH6","AI has changed how we find or reuse evidence, in a governed way.","cache","Not yet","A governed retrieval process keeps AI outputs traceable to source")
];
const continuity=[
  scale("AT1","How well do bid commitments, assumptions and risks carry into delivery?","continuity","Delivery often starts without them","A structured handover, with an owner for each commitment"),
  scale("AT2","How visible are your live obligations, notice periods and time bars?","continuity","Held in people's heads","In a maintained register with owners and alerts"),
  scale("AT3","Commitments made during the bid are tracked live once delivery starts.","continuity","Mostly lost or rediscovered under pressure","Commitments are tracked live against delivery, with alerts"),
  scale("AT4","How quickly can you answer 'what did we commit to, and when' for a live contract?","continuity","Takes a search through old documents and emails","Minutes, from a maintained register"),
  scale("AT5","AI is used in a structured way in this work, not just occasionally.","continuity","Not used in this work","Embedded in the actual workflow, not just individual tasks"),
  scale("AT6","How confident are you that nothing material gets missed between bid and delivery?","continuity","Not confident, we've been caught out before","Very confident, the handover is tested and reliable")
];
const chronicle=[
  scale("AR1","Contract correspondence and records live in one well-governed system.","chronicle","Personal inboxes and drives","A contract management system linked to records"),
  scale("AR2","Monthly commercial reporting is fast, mostly drawn from systems rather than rebuilt.","chronicle","More than a week of effort, mostly manual","Largely automated; time goes on review"),
  scale("AR3","How easily can you reconstruct the full correspondence history on a live issue?","chronicle","Takes real digging across inboxes and drives","Minutes, from one maintained record"),
  scale("AR4","Someone is clearly responsible for keeping contract records current and organised.","chronicle","No one specifically","A documented team process keeps it current"),
  scale("AR5","How much of your reporting is manually rebuilt each month versus drawn from a live system?","chronicle","Manually rebuilt from scratch each time","Drawn automatically from a live, structured system"),
  scale("AR6","AI has changed how we produce records or reports, in a structured way.","chronicle","Not yet","Embedded in the reporting workflow, not just individual tasks")
];
const coordinationFrontEnd=[
  scale("AO1","How clearly are roles and deadlines assigned across everyone contributing to a pursuit?","coordination","Unclear, chased informally","Clearly assigned, tracked and visible to all contributors"),
  scale("AO2","When a contributor misses a deadline or goes quiet, a clear pattern kicks in.","coordination","No consistent pattern, depends who's involved","Patterns are reviewed and the process improved"),
  scale("AO3","How visible is the full picture, who's doing what, by when, to everyone involved, not just the lead?","coordination","Only the lead has the full picture","Visible to everyone involved, updated in real time"),
  scale("AO4","Review and sign-off is coordinated through a structured, accountable process.","coordination","No consistent review step","Tracked sign-off with accountability for each piece"),
  scale("AO5","How much time is lost chasing people versus doing the work itself?","coordination","A significant amount, chasing is a job in itself","Very little, coordination mostly runs itself"),
  scale("AO6","AI is used in a structured way to help coordinate this work.","coordination","Not used in this work","Embedded in the actual workflow, not just individual tasks")
];
const coordinationBackEnd=[
  scale("AO1","How clearly are roles and responsibilities assigned across everyone involved in delivery, including suppliers and subcontractors?","coordination","Unclear, chased informally","Clearly assigned, tracked and visible to all parties"),
  scale("AO2","When a supplier, subcontractor or team member misses a commitment, a clear pattern kicks in.","coordination","No consistent pattern, depends who's involved","Patterns are reviewed and the process improved"),
  scale("AO3","How visible is the full delivery picture, who's doing what, by when, to everyone involved, not just the lead?","coordination","Only the lead has the full picture","Visible to everyone involved, updated in real time"),
  scale("AO4","Review and sign-off before client delivery is coordinated through a structured, accountable process.","coordination","No consistent review step","Tracked sign-off with accountability for each piece"),
  scale("AO5","How much time is lost chasing people versus doing the work itself?","coordination","A significant amount, chasing is a job in itself","Very little, coordination mostly runs itself"),
  scale("AO6","AI is used in a structured way to help coordinate this work.","coordination","Not used in this work","Embedded in the actual workflow, not just individual tasks")
];
export function adoptionFor(branch){return branch==="back_end"?{continuity,chronicle,coordination:coordinationBackEnd}:{cadence,cache,coordination:coordinationFrontEnd}}

export const transformationBranch=single("T0","Are you exploring this mainly for your clients, or for your own organisation?",null,[option("external","For clients, a new or different service"),option("internal","For your own organisation, a new internal tool or way of working")]);

const craft=[
  scale("TC1","How well is your scarce expertise written down as methods others could follow?","craft","It lives in a few people's heads","Documented methods, used across teams"),
  scale("TC2","We hold useful data or insight with clear rights to use it.","craft","No relevant data, or rights are unclear","Clear rights, structured and maintained"),
  scale("TC3","If the person who knows this best left tomorrow, how much would the organisation lose?","craft","Most of it, it lives in their head","Very little, it's written down and used by others"),
  scale("TC4","This expertise is reusable, documented in a way others could pick up.","craft","Not really, every situation starts from scratch","Tested and transferable to people who didn't create it"),
  scale("TC5","How confident are you in the quality and currency of the data behind this?","craft","Not confident, it's old, incomplete or scattered","Very confident, it's current, complete and trusted"),
  scale("TC6","AI has helped us capture or structure this expertise.","craft","Not yet","It's now a reusable, AI-assisted asset others draw on")
];
const convictionExternal=[
  scale("TV1","Customers have told us directly, unprompted, that they want this.","conviction","This is an internal idea so far, not something customers raised","Multiple customers have asked for this unprompted"),
  scale("TV2","How clear is it who would buy this, and how they buy?","conviction","Not yet clear","Named buyers, budget lines and procurement route understood"),
  scale("TV3","How specific is the customer problem this addresses?","conviction","Vague, we think there's a gap, not sure exactly what","Specific, we can name the exact problem and who has it"),
  scale("TV4","A customer has put real skin in the game for this, time, data or money.","conviction","No customer has engaged with this yet","A customer is paying or co-funding development"),
  scale("TV5","How would you know if this idea was wrong?","conviction","We wouldn't, there's no clear test","We have a specific test and a customer who can fail it"),
  scale("TV6","Multiple customers or segments have validated this need, not just one.","conviction","None yet","Validated across a defined segment")
];
const convictionInternal=[
  scale("TV1","Teams have told us directly, unprompted, that they'd use this.","conviction","An idea so far, not something teams raised","Multiple teams have asked for this unprompted"),
  scale("TV2","How clearly can you describe who would use it and the task or decision it supports?","conviction","Not yet clear","Named users, the task and its current cost understood"),
  scale("TV3","How specific is the problem this addresses for the team?","conviction","Vague, we think there's a gap, not sure exactly what","Specific, we can name the exact task and who's affected"),
  scale("TV4","A team has put real time into testing this, not just talking about it.","conviction","No team has engaged with this yet","A team has used it and measured the value"),
  scale("TV5","How would you know if this idea was wrong?","conviction","We wouldn't, there's no clear test","We have a specific test and a team who can fail it"),
  scale("TV6","Multiple teams have validated this need, not just one.","conviction","None yet","Validated across a whole function")
];
const caseExternal=[
  scale("TM1","The commercial model, pricing, margin and terms, is developed and tested.","case","Not started","Tested with customers"),
  scale("TM2","Could your teams sell, deliver and support a recurring AI-enabled service?","case","Not without new capability across the board","Yes, with clear roles for sales, delivery and support"),
  scale("TM3","How clear is the margin on this compared to your existing services?","case","Not modelled, we don't know yet","Clearly modelled and better than, or comparable to, today"),
  scale("TM4","We're ready to propose this to a client today, with nothing specific holding us back.","case","Not defined, we haven't tested a real offer","Nothing specific, we're ready to propose it"),
  scale("TM5","How ready are sales, delivery and support to actually run this day to day?","case","Not ready, none of them have done this before","Ready, roles and handoffs are defined"),
  scale("TM6","The commercial model has been tested with people outside the idea's originators.","case","Not tested","A customer has agreed to the terms")
];
const caseInternal=[
  scale("TM1","The value case for the tool is clear and tested.","case","Not started","Value case agreed and measured on a trial"),
  scale("TM2","Could your teams build, run and support the tool inside the business?","case","Not without new capability across the board","Yes, with a named owner, IT support and a route into daily work"),
  scale("TM3","How clear is the return compared to the cost of building and running this?","case","Not modelled, we don't know yet","Clearly modelled and worth the investment"),
  scale("TM4","We're ready to propose this to the business today, with nothing specific holding us back.","case","Not defined, we haven't proposed a real build","Nothing specific, we're ready to propose it"),
  scale("TM5","How ready are IT, security and the owning team to actually run this day to day?","case","Not ready, none of them have done this before","Ready, roles and support are defined"),
  scale("TM6","The value case has been tested with people outside the idea's originators.","case","Not tested","Agreed and measured on a real trial")
];
export function transformationFor(branch){return {craft,conviction:branch==="internal"?convictionInternal:convictionExternal,case:branch==="internal"?caseInternal:caseExternal}}

const clearance=[
  scale("GC1","How clear is it who approves go/no-go, price, risk positions and final commitments?","clearance","Decided case by case, often late","Documented authority levels, followed and recorded"),
  scale("GC2","We have clear rules for using AI with commercial and customer-confidential information.","clearance","No rules yet","Clear rules built into workflows, with named owners"),
  scale("GC3","How consistently are those rules actually followed in practice, not just written down?","clearance","Rarely, people work around them","Consistently, they shape how work actually gets done"),
  scale("GC4","When someone's unsure whether an AI use is allowed, there's a fast, clear way to find out.","clearance","There's no one to ask","A clear, fast process exists and people actually use it"),
  scale("GC5","How clear are the boundaries on what AI should never be allowed to decide alone?","clearance","Not discussed","Clearly defined and understood"),
  scale("GC6","Our AI rules stay current with how AI is actually being used.","clearance","Out of date, written before current use","Live governance that adapts as use changes")
];
const commitment=[
  scale("GM1","AI is built into an owned, monitored workflow here, generally.","commitment","No owned AI-assisted workflow","The owned process is monitored, improved and used in normal work"),
  scale("GM2","A named sponsor, with budget and a mandate, backs AI adoption here.","commitment","No obvious sponsor","A sponsor with budget and a mandate"),
  scale("GM3","How much budget has actually been committed to AI adoption, versus just discussed?","commitment","Discussed, nothing committed","Budget is committed and being spent"),
  scale("GM4","Someone is clearly, formally accountable for AI adoption, not everyone's job and no one's.","commitment","No one specifically","A cross-functional team with an executive sponsor"),
  scale("GM5","How likely is this effort to survive a change in priorities or personnel?","commitment","Not likely, it depends on one person's enthusiasm","Very likely, it's embedded in how the organisation runs"),
  scale("GM6","Progress on AI adoption is reviewed regularly against named measures.","commitment","It isn't reviewed","Reviewed at board or leadership level on a fixed cadence")
];
const control=[
  scale("GN1","Once an AI-assisted output is used in live work, how closely is it checked against the original source or instruction?","control","Rarely checked, it's trusted by default","Checked every time, against a clear standard"),
  scale("GN2","We have a tested plan for what happens if an AI-assisted output turns out to be wrong in front of a client or regulator.","control","No plan, we'd deal with it reactively","Prevented by the review process before it reaches anyone"),
  scale("GN3","How much visibility does leadership have into how AI is actually being used day to day, not just the policy?","control","Very little, policy and practice have drifted apart","Strong, leadership sees real usage, not just the policy"),
  scale("GN4","AI-related incidents or near-misses are logged and used to update the rules.","control","They aren't captured","Logged, reviewed and used to update the rules"),
  scale("GN5","How confident are you that AI use today would survive serious scrutiny, a client audit, a regulator, a journalist?","control","Not confident","Very confident"),
  scale("GN6","Someone would reliably find out if AI were used in a way the rules don't allow.","control","No one, there's no visibility","Systematically monitored with clear escalation")
];
export const governance={clearance,commitment,control};

export const dimensionLabels={maturity:"AI maturity",craft:"Craft, expertise & data",conviction:"Conviction, evidence of demand",case:"Case, commercial model",cadence:"Cadence, pursuit process",cache:"Cache, evidence & reuse",continuity:"Continuity, bid to delivery",chronicle:"Chronicle, records & reporting",coordination:"Coordination, people & deadlines",clearance:"Clearance, decision rights",commitment:"Commitment, sponsorship & ownership",control:"Control, oversight once live"};

export const sectionLabels={maturity:{title:"Maturity",blurb:"Where you are today."},adoption:{title:"Adoption",blurb:"How AI is actually used in commercial work."},transformation:{title:"Transformation",blurb:"New value, not just optimisation."},governance:{title:"Governance",blurb:"Rules, sponsorship and control."}};

// Full ordered structure for a given pair of branch answers. Each entry is one gated sub-dimension ("C" in OwnerScore terms).
// Order: Maturity -> Adoption -> Governance -> Transformation.
export function structureFor(transformationBranchValue,adoptionBranchValue){
  const t=transformationFor(transformationBranchValue),a=adoptionFor(adoptionBranchValue);
  return [
    {section:"maturity",dimension:"maturity",questions:maturity},
    {section:"adoption",dimension:adoptionBranchValue==="back_end"?"continuity":"cadence",questions:adoptionBranchValue==="back_end"?a.continuity:a.cadence},
    {section:"adoption",dimension:adoptionBranchValue==="back_end"?"chronicle":"cache",questions:adoptionBranchValue==="back_end"?a.chronicle:a.cache},
    {section:"adoption",dimension:"coordination",questions:a.coordination},
    {section:"governance",dimension:"clearance",questions:governance.clearance},
    {section:"governance",dimension:"commitment",questions:governance.commitment},
    {section:"governance",dimension:"control",questions:governance.control},
    {section:"transformation",dimension:"craft",questions:t.craft},
    {section:"transformation",dimension:"conviction",questions:t.conviction},
    {section:"transformation",dimension:"case",questions:t.case}
  ];
}

// Archetypes: one per weakest scored dimension (maturity excluded, it's the frame, not a scored lever).
export const archetypes={
  craft:{name:"The Improviser",line:"Your expertise lives in people, not in anything repeatable.",detail:"Write it down before someone else has to relearn it from scratch."},
  conviction:{name:"The Dreamer",line:"You have an idea, not yet a customer.",detail:"Test it against someone who could say no before you build around it."},
  case:{name:"The Builder",line:"You could probably make this work.",detail:"You haven't yet proven anyone will pay for it the way you've designed it."},
  cadence:{name:"The Firefighter",line:"Every pursuit runs differently, so nothing gets easier to repeat.",detail:"The process is the lever here, not more individual effort."},
  cache:{name:"The Reinventor",line:"Good work gets done once, then quietly redone.",detail:"Someone on your team is rebuilding something that already exists."},
  continuity:{name:"The Loose End",line:"What gets promised in the bid doesn't reliably survive the handover.",detail:"That gap is where delivery risk actually sits."},
  chronicle:{name:"The Rebuilder",line:"Reporting gets rebuilt from scratch every month.",detail:"It should be pulled from a system that already knows the answer."},
  coordination:{name:"The Chaser",line:"Real work competes with chasing people for updates.",detail:"Visibility is the lever here, not more individual effort."},
  clearance:{name:"The Freelancer",line:"AI gets used, but nobody's agreed the rules.",detail:"Someone will eventually ask who approved it."},
  commitment:{name:"The Hobbyist",line:"AI adoption depends on enthusiasm, not budget or ownership.",detail:"It won't survive a reshuffle or a change in priorities."},
  control:{name:"The Rubber Stamp",line:"AI outputs get used on faith, rarely checked against the source.",detail:"That works fine, right up until something gets through that shouldn't have."}
};

export function evaluate(structure,answers){
  const dimensions={};
  for(const {dimension,questions} of structure){
    if(dimension==="maturity")continue;
    let total=0;
    for(const q of questions){
      const answer=answers[q.id];
      const points=q.type==="scale"?Number(answer)-1:q.options.find(o=>o.value===answer)?.points;
      if(!Number.isInteger(points)||points<0||points>4)throw new Error("An answer could not be scored.");
      total+=points;
    }
    dimensions[dimension]=Math.round(total/(questions.length*4)*100);
  }
  const score=Math.round(Object.values(dimensions).reduce((a,b)=>a+b,0)/Object.keys(dimensions).length);
  let band=score<40?"experimenting":score<70?"design":"pilot";
  const gates=[];
  if(band==="pilot"&&dimensions.clearance<50){band="design";gates.push("Decision rights for AI use need to be clearer before a broader pilot.")}
  if(band==="pilot"&&dimensions.commitment<50){band="design";gates.push("A named, budgeted sponsor is needed before this becomes an owned change.")}
  if(band==="pilot"&&dimensions.control<50){band="design";gates.push("Oversight of live AI outputs needs to be in place before this scales further.")}
  const constraint=Object.keys(dimensions).sort((a,b)=>dimensions[a]-dimensions[b])[0];
  let maturityScore=null;
  const maturitySection=structure.find(s=>s.dimension==="maturity");
  if(maturitySection){
    let mTotal=0;
    for(const q of maturitySection.questions){
      const answer=answers[q.id];
      const points=q.type==="scale"?Number(answer)-1:q.options.find(o=>o.value===answer)?.points;
      if(Number.isInteger(points))mTotal+=points;
    }
    maturityScore=Math.round(mTotal/(maturitySection.questions.length*4)*100);
  }
  return{score,band,dimensions,constraint,gates,maturityScore,archetype:archetypes[constraint]};
}

export const bandLabels={experimenting:"Start by mapping",design:"Ready to design a bounded move",pilot:"Foundations for a pilot"};

const moveCopy={
  craft:["Map the expertise and data that could support one useful offer, including rights to use them.","Write down the expert method behind it.","Test whether source material is reliable enough to repeat."],
  conviction:["Test the proposed value with named customers or teams before designing a build.","Ask what they would buy or commit time to use.","Identify the buyer or user, the budget or capacity, and the existing alternative."],
  case:["Sketch one offer and test its price, delivery cost, margin and human service boundary.","Model the work needed to sell and support it.","Pilot the promise before broadening the offer."],
  cadence:["Map one pursuit from qualification to decision and name its owner, gates and measures.","Test a repeatable go/no-go review.","Set a baseline for time, cost and quality before automation."],
  cache:["Build an approved evidence map for one pursuit, with owners and expiry dates.","Identify the sources behind pricing and risk decisions.","Test retrieval on a real bid before drafting from it."],
  continuity:["Map the handover from bid commitments to live obligations, naming an owner for each.","Create one maintained obligations register.","Test alerts against a real notice or milestone."],
  chronicle:["Bring the records for one commercial decision into a reliable, reviewable trail.","Standardise the source and metadata for reporting.","Measure the effort of the current monthly report."],
  coordination:["Give one live pursuit or delivery a single coordinator with visible roles and deadlines.","Replace informal chasing with one shared, visible tracker.","Measure how much time coordination actually takes before and after."],
  clearance:["Agree who can approve AI use, evidence, price and risk on one live piece of work.","Document the human review points.","Test confidential-information rules with IT and legal."],
  commitment:["Give one AI-assisted workflow a sponsor, owner and explicit human review points.","Choose a narrow team pilot rather than more ad hoc use.","Review actual usage and exceptions after the first cycle."],
  control:["Set a simple check on one AI-assisted output type before it reaches a client or regulator.","Log incidents and near-misses, even small ones.","Review what leadership actually sees about real usage versus policy."]
};
export function movesFor(constraint){return moveCopy[constraint]||[]}

export function startingPlanFor(band){
  if(band==='experimenting')return[
    'Week 1: name one live pressure and one owner for it.',
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
