// AI Roulette is an indicative, self-reported conversation starter, not a benchmark.
// Structure: Maturity (frame, unscored for banding) + TAG — Transformation, Adoption, Governance.
// Adoption branches once (front_end = winning work / back_end = delivering it).
// Transformation branches once (external = for clients / internal = for the organisation).
// Everyone answers Maturity, Transformation and Adoption, then — after the email gate — Governance.

const option=(value,label,points)=>({value,label,points});
const scale=(id,text,dimension,low,high)=>({id,text,dimension,type:"scale",low,high});
const single=(id,text,dimension,options)=>({id,text,dimension,type:"single",options});

const governanceOptions=[option("no_rules","No rules yet",0),option("unclear","Rules exist but are unclear for this work",1),option("not_sure","Not sure",1),option("not_applied","Clear rules, not yet built into our workflows",3),option("applied","Clear rules built into workflows, with named owners",4)];
const sponsorOptions=[option("no_sponsor","No obvious sponsor",0),option("manager_no_budget","An interested manager without budget",1),option("director_no_budget","A director with appetite, budget not agreed",3),option("sponsor_budget","A sponsor with budget and a mandate",4)];
const ownershipOptions=[option("none","No owned AI-assisted workflow",0),option("ad_hoc","Individuals choose tasks and checks for themselves",1),option("pilot","A team pilot has a named owner and review points",2),option("defined","A defined process uses approved inputs and human review",3),option("monitored","The owned process is monitored, improved and used in normal work",4)];
const aiUseOptions=[option("not_used","Not used in this work",0),option("occasional_drafting","Occasional help drafting or summarising",1),option("regular_drafting","Regularly used for drafting and research",2),option("structured_support","Used in a structured way with defined inputs and checks",3),option("embedded","Embedded in the actual workflow, not just individual tasks",4)];
const ownerMaintainOptions=[option("no_one","No one specifically",0),option("whoever_notices","Whoever notices it's out of date",1),option("part_time","Someone owns it part-time, alongside other work",2),option("named_owner","A named owner maintains it as part of their role",3),option("team_process","A documented team process keeps it current",4)];

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
  scale("M2","How confident are you that this is accurate across the whole organisation, not just your own experience?","maturity","Not confident — this is my own impression","Very confident — this matches what others report too"),
  single("M3","What's driving your organisation's current stance on AI?","maturity",[option("no_clear_stance","No clear stance either way",0),option("risk_first","Risk and compliance concerns come first",1),option("encouraged","Experimentation is encouraged, informally",2),option("mandated","Leadership has set a clear direction and expects progress",4)]),
  scale("M4","How much has changed in your organisation's AI use in the last 12 months?","maturity","Nothing has really changed","Rapid, visible change"),
  single("M5","How widely is AI actually used across the organisation, beyond a few enthusiasts?","maturity",[option("few_individuals","A handful of individuals",0),option("some_teams","Some teams, inconsistently",1),option("most_teams","Most teams, to varying degrees",2),option("most_teams_consistent","Most teams, fairly consistently",3),option("organisation_wide","Organisation-wide, as normal practice",4)]),
  scale("M6","How sophisticated is the AI tooling in regular use — basic chat tools versus connected, purpose-built workflows?","maturity","Basic, general-purpose chat tools only","Connected, purpose-built tools integrated into real workflows")
];

export const transformationBranch=single("T0","Are you exploring this mainly for your clients, or for your own organisation?",null,[option("external","For clients — a new or different service"),option("internal","For your own organisation — a new internal tool or way of working")]);

const craft=[
  scale("TC1","How well is your scarce expertise written down as methods others could follow?","craft","It lives in a few people's heads","Documented methods, used across teams"),
  single("TC2","Do you hold useful data or insight with clear rights to use it?","craft",[option("none","No relevant data",0),option("rights_unclear","Data exists, but rights are unclear",1),option("not_sure","Not sure",1),option("some_clear","Some data, with clear rights",2),option("clear_partly","Clear rights to useful data, partly structured",3),option("clear_structured","Clear rights, structured and maintained",4)]),
  scale("TC3","If the person who knows this best left tomorrow, how much would the organisation lose?","craft","Most of it — it lives in their head","Very little — it's written down and used by others"),
  single("TC4","How reusable is this expertise in practice?","craft",[option("not_reusable","Not really — every situation starts from scratch",0),option("informal_reuse","People informally reuse bits of past work",1),option("some_templates","Some documented methods or templates exist",2),option("structured_methods","Structured methods are used consistently across teams",3),option("tested_transferable","Methods are tested and transferable to people who didn't create them",4)]),
  scale("TC5","How confident are you in the quality and currency of the data behind this?","craft","Not confident — it's old, incomplete or scattered","Very confident — it's current, complete and trusted"),
  single("TC6","Has AI been used to help capture or structure this expertise?","craft",[option("not_yet","Not yet",0),option("informal_experiments","A few informal experiments",1),option("some_documentation","AI has helped document some of it",2),option("structured_capture","A structured effort to capture it with AI is underway",3),option("reusable_asset","It's now a reusable, AI-assisted asset others draw on",4)])
];
const convictionExternal=[
  single("TV1","What evidence do you have that customers want this?","conviction",[option("internal_idea","An internal idea so far",0),option("anecdotal","Anecdotal conversations",1),option("asked_directly","Customers have asked for it directly",3),option("would_cofund","A customer would pilot or co-fund it",4)]),
  scale("TV2","How clear is it who would buy this, and how they buy?","conviction","Not yet clear","Named buyers, budget lines and procurement route understood"),
  scale("TV3","How specific is the customer problem this addresses?","conviction","Vague — we think there's a gap, not sure exactly what","Specific — we can name the exact problem and who has it"),
  single("TV4","Has a customer put real skin in the game yet — time, data or money?","conviction",[option("none","No customer has engaged with this yet",0),option("conversations","We've had early conversations",1),option("asked_directly","Customers have asked for it directly",2),option("pilot_committed","A customer has committed time or data to a pilot",3),option("paying_or_cofunding","A customer is paying or co-funding development",4)]),
  scale("TV5","How would you know if this idea was wrong?","conviction","We wouldn't — there's no clear test","We have a specific test and a customer who can fail it"),
  single("TV6","How many different customers or segments have validated the need, not just one?","conviction",[option("none","None yet",0),option("one","One customer or conversation",1),option("few","A few, informally",2),option("several_structured","Several, gathered in a structured way",3),option("validated_segment","Validated across a defined segment",4)])
];
const convictionInternal=[
  single("TV1","What evidence do you have that teams would use it?","conviction",[option("idea_only","An idea so far",0),option("anecdotal","Anecdotal requests",1),option("team_asked","A team has asked for it directly",3),option("team_commits","A team would pilot it and give time to it",4)]),
  scale("TV2","How clearly can you describe who would use it and the task or decision it supports?","conviction","Not yet clear","Named users, the task and its current cost understood"),
  scale("TV3","How specific is the problem this addresses for the team?","conviction","Vague — we think there's a gap, not sure exactly what","Specific — we can name the exact task and who's affected"),
  single("TV4","Has a team put real time into testing this, not just talking about it?","conviction",[option("none","No team has engaged with this yet",0),option("conversations","We've had early conversations",1),option("asked_directly","A team has asked for it directly",2),option("pilot_committed","A team has committed time to a pilot",3),option("measured_value","A team has used it and measured the value",4)]),
  scale("TV5","How would you know if this idea was wrong?","conviction","We wouldn't — there's no clear test","We have a specific test and a team who can fail it"),
  single("TV6","How many different teams have validated the need, not just one?","conviction",[option("none","None yet",0),option("one","One team or conversation",1),option("few","A few, informally",2),option("several_structured","Several, gathered in a structured way",3),option("validated_function","Validated across a whole function",4)])
];
const caseExternal=[
  single("TM1","How developed is the commercial model: pricing, margin and terms?","case",[option("not_started","Not started",0),option("ideas","Ideas, nothing tested",1),option("draft","A draft model with stated assumptions",2),option("tested_internal","Tested with finance and commercial colleagues",3),option("tested_customers","Tested with customers",4)]),
  scale("TM2","Could your teams sell, deliver and support a recurring AI-enabled service?","case","Not without new capability across the board","Yes, with clear roles for sales, delivery and support"),
  scale("TM3","How clear is the margin on this compared to your existing services?","case","Not modelled — we don't know yet","Clearly modelled and better than, or comparable to, today"),
  single("TM4","What would stop a client saying yes to this today?","case",[option("not_defined","Not defined — we haven't tested a real offer",0),option("price_unclear","Price or terms aren't settled enough to propose",1),option("needs_proof","They'd want proof it works before committing",2),option("minor_objections","Minor objections we have answers for",3),option("ready_to_propose","Nothing specific — we're ready to propose it",4)]),
  scale("TM5","How ready are sales, delivery and support to actually run this day to day?","case","Not ready — none of them have done this before","Ready — roles and handoffs are defined"),
  single("TM6","Has the commercial model been tested with anyone outside the idea's originators?","case",[option("not_tested","Not tested",0),option("internal_finance","Tested informally with finance or colleagues",1),option("internal_structured","Tested in a structured internal review",2),option("customer_feedback","Shared with a customer for feedback",3),option("customer_committed","A customer has agreed to the terms",4)])
];
const caseInternal=[
  single("TM1","How clear is the value case for the tool?","case",[option("not_started","Not started",0),option("ideas","Ideas, nothing measured",1),option("baseline","We know the current time, cost or quality of the task",2),option("agreed_owner","Value case agreed with the business owner",3),option("measured_trial","Value case agreed and measured on a trial",4)]),
  scale("TM2","Could your teams build, run and support the tool inside the business?","case","Not without new capability across the board","Yes, with a named owner, IT support and a route into daily work"),
  scale("TM3","How clear is the return compared to the cost of building and running this?","case","Not modelled — we don't know yet","Clearly modelled and worth the investment"),
  single("TM4","What would stop the business backing this today?","case",[option("not_defined","Not defined — we haven't proposed a real build",0),option("cost_unclear","Cost or effort isn't settled enough to propose",1),option("needs_proof","They'd want proof it works before committing",2),option("minor_objections","Minor objections we have answers for",3),option("ready_to_propose","Nothing specific — we're ready to propose it",4)]),
  scale("TM5","How ready are IT, security and the owning team to actually run this day to day?","case","Not ready — none of them have done this before","Ready — roles and support are defined"),
  single("TM6","Has the value case been tested with anyone outside the idea's originators?","case",[option("not_tested","Not tested",0),option("internal_informal","Tested informally with colleagues",1),option("internal_structured","Tested in a structured internal review",2),option("business_owner","Reviewed and agreed with the business owner",3),option("measured_trial","Agreed and measured on a real trial",4)])
];
export function transformationFor(branch){return {craft,conviction:branch==="internal"?convictionInternal:convictionExternal,case:branch==="internal"?caseInternal:caseExternal}}

export const adoptionBranch=single("A0","Are you mainly on the front end of commercial work, or the back end?",null,[option("front_end","Winning it — business development, bids, tenders"),option("back_end","Delivering it — mobilisation, contracts, reporting")]);

const cadence=[
  scale("AC1","How repeatable is your process from opportunity to submission or signing?","cadence","Every pursuit runs differently","Defined stages, templates and gates, used every time"),
  single("AC2","How do you measure performance in this work?","cadence",[option("none","We do not track it consistently",0),option("wins","We track wins and losses",1),option("win_rate","We track win rate and pipeline value",2),option("cost_cycle","We also track cost to pursue and cycle time",3),option("acted_on","We review these regularly and act on them",4)]),
  scale("AC3","How consistently does your team use the same evidence and templates across pursuits?","cadence","Everyone builds their own version","A shared, current template and evidence set every time"),
  single("AC4","What happens when a pursuit stalls or a deadline slips?","cadence",[option("no_pattern","No consistent pattern — depends who's involved",0),option("informal_chase","Someone informally chases it",1),option("named_owner","A named owner is accountable for keeping it moving",2),option("escalation_path","A clear escalation path kicks in automatically",3),option("reviewed_pattern","Patterns are reviewed and the process improved",4)]),
  scale("AC5","How much of the decision to pursue relies on one person's judgement versus a documented process?","cadence","Almost entirely one person's judgement","A documented process most people could run"),
  single("AC6","Where does AI currently help with this work, if at all?","cadence",aiUseOptions)
];
const cache=[
  scale("AH1","When you need your best past evidence, how quickly can your team find an approved version?","cache","It depends who you ask","Minutes, from a maintained library with owners"),
  single("AH2","How structured is the data behind pricing, risk and past outcomes?","cache",[option("personal","Mostly in personal spreadsheets and inboxes",0),option("shared_mixed","Shared folders, inconsistent formats",1),option("some_templates","Some standard templates, partly reused",2),option("central_record","Standard templates and a central record",3),option("linked_outcomes","Structured, maintained and linked to outcomes",4)]),
  scale("AH3","How confident are you that the evidence being reused is still accurate and approved?","cache","Not confident — no one checks","Very confident — evidence has an owner and expiry"),
  single("AH4","Who is responsible for keeping your evidence library current?","cache",ownerMaintainOptions),
  scale("AH5","How easily can someone outside the original pursuit find and reuse this evidence?","cache","Only the people who wrote it know where it is","Anyone can find it through a shared, searchable library"),
  single("AH6","Has AI changed how your team finds or reuses evidence?","cache",[option("not_yet","Not yet",0),option("manual_search","People still search manually, AI isn't involved",1),option("ai_assisted_search","AI helps search or summarise existing evidence",2),option("ai_drafts_from_evidence","AI drafts directly from the approved evidence base",3),option("governed_retrieval","A governed retrieval process keeps AI outputs traceable to source",4)])
];
const continuity=[
  scale("AT1","How well do bid commitments, assumptions and risks carry into delivery?","continuity","Delivery often starts without them","A structured handover, with an owner for each commitment"),
  scale("AT2","How visible are your live obligations, notice periods and time bars?","continuity","Held in people's heads","In a maintained register with owners and alerts"),
  single("AT3","What happens to the commitments made during the bid once delivery starts?","continuity",[option("lost","Mostly lost or rediscovered under pressure",0),option("informal_handover","An informal handover, no structured record",1),option("partial_handover","A handover document exists but isn't consistently used",2),option("structured_handover","A structured handover with a named owner for each commitment",3),option("tracked_live","Commitments are tracked live against delivery, with alerts",4)]),
  scale("AT4","How quickly can you answer 'what did we commit to, and when' for a live contract?","continuity","Takes a search through old documents and emails","Minutes, from a maintained register"),
  single("AT5","Where does AI currently help with this work, if at all?","continuity",aiUseOptions),
  scale("AT6","How confident are you that nothing material gets missed between bid and delivery?","continuity","Not confident — we've been caught out before","Very confident — the handover is tested and reliable")
];
const chronicle=[
  single("AR1","Where do contract correspondence and records mostly live?","chronicle",[option("inboxes","Personal inboxes and drives",0),option("shared_drives","Shared drives, filed inconsistently",1),option("doc_control","A document control system, partly structured",2),option("cde","A common data environment with consistent metadata",3),option("cms_linked","A contract management system linked to records",4)]),
  single("AR2","How long does monthly commercial reporting take your team?","chronicle",[option("week_plus","More than a week of effort, mostly manual",0),option("several_days","Several days, rebuilt each month",1),option("few_days","A few days, with standard templates",2),option("about_day","About a day, mostly drawn from systems",3),option("review_only","Largely automated; time goes on review",4)]),
  scale("AR3","How easily can you reconstruct the full correspondence history on a live issue?","chronicle","Takes real digging across inboxes and drives","Minutes, from one maintained record"),
  single("AR4","Who is responsible for keeping contract records current and well-organised?","chronicle",ownerMaintainOptions),
  scale("AR5","How much of your reporting is manually rebuilt each month versus drawn from a live system?","chronicle","Manually rebuilt from scratch each time","Drawn automatically from a live, structured system"),
  single("AR6","Has AI changed how your team produces records or reports?","chronicle",[option("not_yet","Not yet",0),option("drafting_help","AI helps draft summaries or reports",1),option("regular_use","Regularly used to pull together reporting",2),option("structured_support","Used in a structured way with defined inputs and checks",3),option("embedded","Embedded in the reporting workflow, not just individual tasks",4)])
];
const coordinationFrontEnd=[
  scale("AO1","How clearly are roles and deadlines assigned across everyone contributing to a pursuit?","coordination","Unclear, chased informally","Clearly assigned, tracked and visible to all contributors"),
  single("AO2","What happens when a contributor misses a deadline or goes quiet?","coordination",[option("no_pattern","No consistent pattern — depends who's involved",0),option("informal_chase","Someone informally chases it",1),option("named_owner","A named coordinator is accountable for keeping it moving",2),option("escalation_path","A clear escalation path kicks in automatically",3),option("reviewed_pattern","Patterns are reviewed and the process improved",4)]),
  scale("AO3","How visible is the full picture — who's doing what, by when — to everyone involved, not just the lead?","coordination","Only the lead has the full picture","Visible to everyone involved, updated in real time"),
  single("AO4","How is review and sign-off coordinated across contributors before something goes out?","coordination",[option("no_review","No consistent review step",0),option("ad_hoc_review","Ad hoc — whoever's free reviews it",1),option("named_reviewers","Named reviewers, informally scheduled",2),option("structured_review","A structured review stage with defined roles",3),option("tracked_signoff","Tracked sign-off with accountability for each piece",4)]),
  scale("AO5","How much time is lost chasing people versus doing the work itself?","coordination","A significant amount — chasing is a job in itself","Very little — coordination mostly runs itself"),
  single("AO6","Has AI changed how your team coordinates this work?","coordination",aiUseOptions)
];
const coordinationBackEnd=[
  scale("AO1","How clearly are roles and responsibilities assigned across everyone involved in delivery, including suppliers and subcontractors?","coordination","Unclear, chased informally","Clearly assigned, tracked and visible to all parties"),
  single("AO2","What happens when a supplier, subcontractor or team member misses a commitment?","coordination",[option("no_pattern","No consistent pattern — depends who's involved",0),option("informal_chase","Someone informally chases it",1),option("named_owner","A named coordinator is accountable for keeping it moving",2),option("escalation_path","A clear escalation path kicks in automatically",3),option("reviewed_pattern","Patterns are reviewed and the process improved",4)]),
  scale("AO3","How visible is the full delivery picture — who's doing what, by when — to everyone involved, not just the lead?","coordination","Only the lead has the full picture","Visible to everyone involved, updated in real time"),
  single("AO4","How is review and sign-off coordinated across contributors before something goes to the client?","coordination",[option("no_review","No consistent review step",0),option("ad_hoc_review","Ad hoc — whoever's free reviews it",1),option("named_reviewers","Named reviewers, informally scheduled",2),option("structured_review","A structured review stage with defined roles",3),option("tracked_signoff","Tracked sign-off with accountability for each piece",4)]),
  scale("AO5","How much time is lost chasing people versus doing the work itself?","coordination","A significant amount — chasing is a job in itself","Very little — coordination mostly runs itself"),
  single("AO6","Has AI changed how your team coordinates this work?","coordination",aiUseOptions)
];
export function adoptionFor(branch){return branch==="back_end"?{continuity,chronicle,coordination:coordinationBackEnd}:{cadence,cache,coordination:coordinationFrontEnd}}

const clearance=[
  scale("GC1","How clear is it who approves go/no-go, price, risk positions and final commitments?","clearance","Decided case by case, often late","Documented authority levels, followed and recorded"),
  single("GC2","Does your organisation have rules for using AI with commercial and customer-confidential information?","clearance",governanceOptions),
  scale("GC3","How consistently are those rules actually followed in practice, not just written down?","clearance","Rarely — people work around them","Consistently — they shape how work actually gets done"),
  single("GC4","What happens when someone is unsure whether an AI use is allowed?","clearance",[option("no_one_to_ask","There's no one to ask",0),option("ask_around","People ask around informally",1),option("informal_guidance","Informal guidance exists but isn't documented",2),option("clear_process","A clear process exists for raising it",3),option("fast_clear_process","A clear, fast process exists and people actually use it",4)]),
  scale("GC5","How clear are the boundaries on what AI should never be allowed to decide alone?","clearance","Not discussed","Clearly defined and understood"),
  single("GC6","How up to date are these rules with how AI is actually being used today?","clearance",[option("outdated","Out of date — written before current use",0),option("partially_current","Partly current, gaps remain",1),option("reviewed_occasionally","Reviewed occasionally",2),option("reviewed_regularly","Reviewed regularly against actual use",3),option("live_governance","Live governance that adapts as use changes",4)])
];
const commitment=[
  single("GM1","How is AI built into an owned workflow here, generally?","commitment",ownershipOptions),
  single("GM2","Who would sponsor a change to how AI is used across the organisation?","commitment",sponsorOptions),
  scale("GM3","How much budget has actually been committed to AI adoption, versus just discussed?","commitment","Discussed, nothing committed","Budget is committed and being spent"),
  single("GM4","Is there a named individual accountable for AI adoption, or is it everyone's job and no one's?","commitment",[option("no_one","No one specifically",0),option("informal_lead","Someone leads informally, alongside other work",1),option("part_time_role","Part of someone's formal role, part-time",2),option("dedicated_owner","A dedicated owner, with time and authority",3),option("cross_functional_team","A cross-functional team with an executive sponsor",4)]),
  scale("GM5","How likely is this effort to survive a change in priorities or personnel?","commitment","Not likely — it depends on one person's enthusiasm","Very likely — it's embedded in how the organisation runs"),
  single("GM6","How is progress on AI adoption actually reviewed?","commitment",[option("not_reviewed","It isn't reviewed",0),option("informal_updates","Informal updates when it comes up",1),option("occasional_review","An occasional review, no fixed cadence",2),option("regular_review","A regular review against named measures",3),option("board_level","Reviewed at board or leadership level on a fixed cadence",4)])
];
const control=[
  scale("GN1","Once an AI-assisted output is used in live work, how closely is it checked against the original source or instruction?","control","Rarely checked — it's trusted by default","Checked every time, against a clear standard"),
  single("GN2","What happens if an AI-assisted output turns out to be wrong in front of a client or regulator?","control",[option("no_plan","No plan — we'd deal with it reactively",0),option("informal_fix","We'd fix it and move on, informally",1),option("documented_response","A documented response exists but isn't tested",2),option("tested_response","A tested response plan, with clear ownership",3),option("prevented_by_review","Prevented by the review process before it reaches anyone",4)]),
  scale("GN3","How much visibility does leadership have into how AI is actually being used day to day, not just the policy?","control","Very little — policy and practice have drifted apart","Strong — leadership sees real usage, not just the policy"),
  single("GN4","How are AI-related incidents or near-misses captured and learned from?","control",[option("not_captured","They aren't captured",0),option("informally_discussed","Discussed informally if they come up",1),option("logged_sometimes","Logged sometimes, inconsistently",2),option("logged_consistently","Logged consistently",3),option("reviewed_and_acted_on","Logged, reviewed and used to update the rules",4)]),
  scale("GN5","How confident are you that AI use today would survive serious scrutiny — a client audit, a regulator, a journalist?","control","Not confident","Very confident"),
  single("GN6","Who would actually find out if someone used AI in a way the rules don't allow?","control",[option("no_one","No one — there's no visibility",0),option("might_notice","Someone might notice by chance",1),option("spot_checks","Occasional spot checks",2),option("monitored","Monitored as part of normal process",3),option("systematic","Systematically monitored with clear escalation",4)])
];
export const governance={clearance,commitment,control};

export const dimensionLabels={maturity:"AI maturity",craft:"Craft — expertise & data",conviction:"Conviction — evidence of demand",case:"Case — commercial model",cadence:"Cadence — pursuit process",cache:"Cache — evidence & reuse",continuity:"Continuity — bid to delivery",chronicle:"Chronicle — records & reporting",coordination:"Coordination — people & deadlines",clearance:"Clearance — decision rights",commitment:"Commitment — sponsorship & ownership",control:"Control — oversight once live"};

export const sectionLabels={maturity:{title:"Maturity",blurb:"Where you are today."},transformation:{title:"Transformation",blurb:"New value, not just optimisation."},adoption:{title:"Adoption",blurb:"How AI is actually used in commercial work."},governance:{title:"Governance",blurb:"Rules, sponsorship and control."}};

// Full ordered structure for a given pair of branch answers. Each entry is one gated sub-dimension ("C" in OwnerScore terms).
export function structureFor(transformationBranchValue,adoptionBranchValue){
  const t=transformationFor(transformationBranchValue),a=adoptionFor(adoptionBranchValue);
  return [
    {section:"maturity",dimension:"maturity",questions:maturity},
    {section:"transformation",dimension:"craft",questions:t.craft},
    {section:"transformation",dimension:"conviction",questions:t.conviction},
    {section:"transformation",dimension:"case",questions:t.case},
    {section:"adoption",dimension:adoptionBranchValue==="back_end"?"continuity":"cadence",questions:adoptionBranchValue==="back_end"?a.continuity:a.cadence},
    {section:"adoption",dimension:adoptionBranchValue==="back_end"?"chronicle":"cache",questions:adoptionBranchValue==="back_end"?a.chronicle:a.cache},
    {section:"adoption",dimension:"coordination",questions:a.coordination},
    {section:"governance",dimension:"clearance",questions:governance.clearance},
    {section:"governance",dimension:"commitment",questions:governance.commitment},
    {section:"governance",dimension:"control",questions:governance.control}
  ];
}

// Archetypes: one per weakest scored dimension (maturity excluded — it's the frame, not a scored lever).
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
