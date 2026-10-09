// AI Roulette is an indicative self-assessment, not a validated benchmark.
// Maturity is context. Adoption and Governance make the core score; Evolution
// is a separate opportunity lens, so not having a new offer is not a penalty.
const option=(value,label)=>({value,label});
const scale=(id,text,dimension)=>({id,text,dimension,type:"scale"});
const single=(id,text,dimension,options)=>({id,text,dimension,type:"single",options});

export const maturityStages=[
  {id:"none",label:"Not yet",shortLabel:"Not yet",color:"#49535a",note:"AI is not in routine use yet."},
  {id:"individual",label:"Individual use",shortLabel:"Individual",color:"#8fb0d6",note:"People use AI in their own work, but shared practice is limited."},
  {id:"team",label:"Team use",shortLabel:"Team",color:"#69c0bc",note:"At least one team uses AI as part of its regular work."},
  {id:"organisation",label:"Wider use",shortLabel:"Wider use",color:"#e3b575",note:"AI is in routine use across several teams or functions."}
];

export const maturity=[
  single("M1","Where is AI used routinely today?","maturity",[
    option("none","Not in routine use"),option("individual","By individuals"),
    option("team","In at least one team"),option("organisation","Across several teams or functions")
  ]),
  single("M2","Which form of AI do you see most often in the work you know?","maturity",[
    option("none","No access or use"),option("assistant","A general assistant or copilot"),
    option("feature","AI features in existing software"),option("agent","An individual-built agent or automation"),
    option("shared","A shared AI-assisted workflow"),option("unsure","Not sure")
  ]),
  scale("M3","I have a clear view of how AI is used beyond my own work.","maturity"),
  scale("M4","Leaders have explained what AI should help us achieve.","maturity"),
  scale("M5","AI use has spread beyond a few enthusiasts.","maturity"),
  scale("M6","We can point to work that has changed because of AI.","maturity")
];

const individualUse=[
  scale("AU1","People use approved AI tools for real tasks, not only experiments.","individual_use"),
  scale("AU2","People know which AI tools they can use for their work.","individual_use"),
  scale("AU3","People are confident using AI for tasks where it genuinely helps.","individual_use"),
  scale("AU4","People check AI output before they use it in their work.","individual_use"),
  scale("AU5","AI saves time or improves quality in work we do regularly.","individual_use"),
  scale("AU6","Useful AI practices are repeated, rather than rediscovered by each person.","individual_use")
];
const sharedUse=[
  scale("AS1","At least one team uses AI as part of a shared way of working.","shared_use"),
  scale("AS2","Our AI-assisted work has clear steps for people to review and decide.","shared_use"),
  scale("AS3","People know when to hand an AI-assisted task to another person or team.","shared_use"),
  scale("AS4","AI outputs can be traced back to the information used to produce them.","shared_use"),
  scale("AS5","We measure whether AI is improving the work where it is used.","shared_use"),
  scale("AS6","A useful AI workflow can be adopted by another team without starting again.","shared_use")
];
const rules=[
  scale("GR1","People know what information they may put into AI tools.","rules"),
  scale("GR2","People know which AI uses require approval before they go live.","rules"),
  scale("GR3","The decisions AI must never make alone are clear.","rules"),
  scale("GR4","The rules for AI use are easy to find and apply during real work.","rules"),
  scale("GR5","People have a clear route to ask when an AI use is uncertain.","rules"),
  scale("GR6","AI rules are updated when our tools or ways of working change.","rules")
];
const oversight=[
  scale("GO1","A named person owns each AI-assisted workflow in regular use.","oversight"),
  scale("GO2","Important AI-assisted outputs are checked before they affect a decision or another person.","oversight"),
  scale("GO3","We can see where AI is being used, not just what our policy says.","oversight"),
  scale("GO4","When AI makes a material error, we record it and improve the workflow.","oversight"),
  scale("GO5","Leaders review evidence of AI use and its effects, not only activity counts.","oversight"),
  scale("GO6","There is a clear way to pause or change an AI workflow that is not working safely.","oversight")
];
const evolution=[
  scale("EV1","We can name an outcome AI could make possible beyond doing today's tasks faster.","evolution"),
  scale("EV2","We look for ways AI could improve a service or experience for the people we serve.","evolution"),
  scale("EV3","We look for ways AI could change how our organisation delivers value internally.","evolution"),
  scale("EV4","Promising AI ideas are tested with the people who would use or buy them.","evolution"),
  scale("EV5","We test the value and delivery risk of an AI-enabled idea before investing in a build.","evolution"),
  scale("EV6","We can name a next opportunity that AI makes viable, with someone accountable for testing it.","evolution")
];

export const dimensionLabels={maturity:"AI starting point",individual_use:"Everyday AI use",shared_use:"Shared AI work",rules:"Rules and boundaries",oversight:"Ownership and oversight",evolution:"New opportunities"};
export const sectionLabels={maturity:{title:"Maturity",blurb:"Where AI is used today."},adoption:{title:"Adoption",blurb:"How AI is used in real work."},governance:{title:"Governance",blurb:"The rules and oversight that make use dependable."},evolution:{title:"Evolution",blurb:"What AI could make possible next."}};

export function structureFor(){return [
  {section:"maturity",dimension:"maturity",questions:maturity},
  {section:"adoption",dimension:"individual_use",questions:individualUse},
  {section:"adoption",dimension:"shared_use",questions:sharedUse},
  {section:"governance",dimension:"rules",questions:rules},
  {section:"governance",dimension:"oversight",questions:oversight},
  {section:"evolution",dimension:"evolution",questions:evolution}
]}

export const archetypes={
  individual_use:{name:"The Explorer",line:"AI has not yet become dependable everyday practice.",detail:"Start with one approved use in a real task, then check whether it helps."},
  shared_use:{name:"The Soloist",line:"Useful AI work still depends too much on individuals.",detail:"Turn one repeatable use into a shared workflow with human review points."},
  rules:{name:"The Free Agent",line:"AI use is moving faster than the rules around it.",detail:"Agree what is allowed, who decides and where people go when unsure."},
  oversight:{name:"The Trusting Type",line:"AI work needs clearer ownership and checks.",detail:"Name an owner and test the output before it affects a decision or another person."}
};

export function evaluate(structure,answers){
  const dimensions={};
  for(const {dimension,questions} of structure){
    if(dimension==="maturity")continue;
    const values=questions.map(q=>Number(answers[q.id]));
    if(values.some(v=>!Number.isInteger(v)||v<1||v>5))throw new Error("An answer could not be scored.");
    dimensions[dimension]=Math.round(values.reduce((sum,v)=>sum+v-1,0)/(questions.length*4)*100);
  }
  const opportunityScore=dimensions.evolution;
  const core=Object.fromEntries(Object.entries(dimensions).filter(([key])=>key!=="evolution"));
  const score=Math.round(Object.values(core).reduce((sum,value)=>sum+value,0)/Object.keys(core).length);
  let band=score<40?"experimenting":score<70?"design":"pilot";
  const gates=[];
  if(band==="pilot"&&core.rules<50){band="design";gates.push("The rules for AI use need to be clearer before a wider pilot.")}
  if(band==="pilot"&&core.oversight<50){band="design";gates.push("Ownership and oversight need to be in place before AI use scales further.")}
  const constraint=Object.keys(core).sort((a,b)=>core[a]-core[b])[0];
  return {score,band,dimensions:core,opportunityScore,constraint,gates,maturityScore:null,archetype:archetypes[constraint]};
}

export const bandLabels={experimenting:"Finding a starting point",design:"Ready to design a bounded move",pilot:"Foundations for a pilot"};
const moveCopy={
  individual_use:["Choose one real task where an approved AI tool could help.","Show people what good use and checking look like.","Measure whether the task improves before extending it."],
  shared_use:["Turn one useful AI practice into a shared workflow.","Define its inputs, owner and human review points.","Test it with another team before calling it scalable."],
  rules:["Agree what information and decisions are inside the AI boundary.","Make approval and escalation clear in the work itself.","Check the rules against an actual use case."],
  oversight:["Name an owner for one AI-assisted workflow.","Test how important outputs are reviewed and errors handled.","Give leaders evidence of real use and results, not just policy."]
};
export function movesFor(constraint){return moveCopy[constraint]||[]}

export function startingPlanFor(band){
  if(band==="experimenting")return ["Week 1: choose one real task and one owner.","Week 2: agree the tools, information and human checks it needs.","Week 3: test it in live work and record what changes.","Week 4: decide whether to stop, adapt or share the practice."];
  if(band==="design")return ["Week 1: choose one AI use worth making repeatable.","Week 2: map the inputs, decisions and accountable people.","Week 3: agree controls and measures with the teams involved.","Week 4: write a bounded pilot brief and test it with users."];
  return ["Week 1: confirm a pilot owner, scope and measures.","Week 2: test the workflow and human review points.","Week 3: prepare the people who will use and support it.","Week 4: review live evidence before extending its reach."];
}
