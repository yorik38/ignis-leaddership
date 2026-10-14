// Deterministic port of the supplied v10/scripts/score_v10.py. No LLM or client score is trusted.
export const VERSION = "v10";
export const IDS = ["D1","D2","D3","G1","G2","S1","S2","S3","S4","C1","C2","C3","L1","L2","L3","L4","L5"];
export const POINTS = {
  S1:{record:3,templates:2,old_folders:1,blank:0},
  S2:{shared_owned:3,pm_notes:2,pm_only:1,lost:0},
  S3:{pickup_days:3,slows:2,waits_senior:1,goes_with:0},
  S4:{matrix_start:3,mostly_raci_later:2,best_guess:1,found_in_contract:0},
  G1:{flat:0,slower:1,with_work:2},
  G2:{none:0,one:1,two_three:2,team:2}
};
export const LABELS = {
  D1:{"1":"1","2_3":"2 to 3","4_6":"4 to 6","7_plus":"at least 7",not_sure:"Not sure"},
  D2:{"1":"1","2_3":"2 to 3","4_6":"4 to 6","7_plus":"at least 7",not_sure:"Not sure"},
  D3:{build:"Holding projects through construction",build_operate:"Holding through construction and into operation",services:"Offering construction or procurement services to others",same:"Nothing new; the same model, more of it",not_sure:"Not sure"},
  G1:{flat:"Stay the same size, or shrink",slower:"Grow, but slower than the work",with_work:"Grow with the work",not_sure:"Not sure"},
  G2:{none:"None; we are learning on the job",one:"One person",two_three:"Two or three",team:"A dedicated team",not_sure:"Not sure"},
  S1:{record:"A reusable record from the last project",templates:"Templates and precedents, filled in again by hand",old_folders:"The last project's folders, if someone knows where to look",blank:"A blank page and whoever remembers",not_sure:"Not sure"},
  S2:{shared_owned:"A shared record that someone owns and keeps current",pm_notes:"The project manager, plus some notes",pm_only:"The project manager only",lost:"No one; it is lost once the contract is signed",not_sure:"Not sure"},
  S3:{pickup_days:"Someone else picks it up from the record within days",slows:"It slows while others ask around",waits_senior:"It waits, or a senior person steps in",goes_with:"What they knew goes with them",not_sure:"Not sure"},
  S4:{matrix_start:"An agreed interface matrix from the start",mostly_raci_later:"Mostly defined; RACI completed later",best_guess:"A best guess, firmed up in negotiation",found_in_contract:"Found during the contract, or after it",not_sure:"Not sure"},
  C1:{"1":"1","2":"2","3_4":"3 to 4","5_plus":"at least 5",not_sure:"Not sure"},
  C2:{lt1:"Under a week","1_2":"1 to 2 weeks","3_4":"3 to 4 weeks","5_plus":"at least 5 weeks",not_sure:"Not sure"},
  C3:{lt_quarter:"Under a quarter",quarter_half:"A quarter to a half",over_half:"Over half",nearly_all:"Nearly all",not_sure:"Not sure"},
  L1:{sd:"Strongly disagree",d:"Disagree",n:"Neither agree nor disagree",a:"Agree",sa:"Strongly agree",not_sure:"Not sure"},
  L2:{sd:"Strongly disagree",d:"Disagree",n:"Neither agree nor disagree",a:"Agree",sa:"Strongly agree",not_sure:"Not sure"},
  L3:{sd:"Strongly disagree",d:"Disagree",n:"Neither agree nor disagree",a:"Agree",sa:"Strongly agree",not_sure:"Not sure"},
  L4:{sd:"Strongly disagree",d:"Disagree",n:"Neither agree nor disagree",a:"Agree",sa:"Strongly agree",not_sure:"Not sure"},
  L5:{sd:"Strongly disagree",d:"Disagree",n:"Neither agree nor disagree",a:"Agree",sa:"Strongly agree",not_sure:"Not sure"}
};
export const QUESTIONS = [
  {id:"D1",text:"How many projects a year does the business take into procurement or construction today?"},
  {id:"D2",text:"And in two years' time, how many a year do you want?"},
  {id:"D3",text:"What is the business taking on that it didn't do before?"},
  {id:"G1",text:"Over the next 12 months, the team that runs procurement and delivery will…"},
  {id:"G2",text:"How many of them have already led EPC-scale procurement and contract negotiation?"},
  {id:"S1",text:"When the next project starts procurement, what does the team start from?"},
  {id:"S2",text:"Who holds what the last project learned: interfaces, changes between offer and contract, and which bidders delivered?"},
  {id:"S3",text:"When a project manager is stretched across two projects, or leaves, what happens to their project?"},
  {id:"S4",text:"At offer stage, how well defined are scope and interfaces between packages?"},
  {id:"C1",text:"With today's team, how many projects can you run through procurement at once, properly?"},
  {id:"C2",text:"On each new project, how long does the team spend finding or rebuilding information that already existed?"},
  {id:"C3",text:"How much of your senior people's time goes on checking and coordinating, rather than deciding?"},
  {id:"L1",text:"Our board expects a clear AI plan from us within the next 12 months.",type:"likert"},
  {id:"L2",text:"I would trust AI to prepare a bid comparison if my team checked it before any decision.",type:"likert"},
  {id:"L3",text:"Our project data is organised well enough that a new hire could find what they need without asking.",type:"likert"},
  {id:"L4",text:"Taking on more projects is limited by people's time, not by finance or grid.",type:"likert"},
  {id:"L5",text:"We have tried AI tools, but they haven't changed how projects actually run.",type:"likert"}
];
export const PARTS = [
  {title:"Where you are heading",subtitle:"Your pipeline ambition and the remit your team is taking on.",start:0,end:3},
  {title:"The gap",subtitle:"Your team, then what the next project really starts from.",start:3,end:9},
  {title:"What it costs, in capacity",subtitle:"Your ranges for projects, rebuilding and senior checking time.",start:9,end:12},
  {title:"Your view",subtitle:"Five quick statements. They don't change your score; they shape what we suggest.",start:12,end:17}
];
const STEPS={S1:"Start",S2:"Holder",S3:"Cover",S4:"Scope"};
const TIE=["S2","S1","S3","S4"];
const PHRASE={Holder:"what each project learns leaves with its project manager",Start:"each new project starts again from old folders",Cover:"one stretched project manager stalls a whole project",Scope:"scope stays a best guess until negotiation"};
const YEAR={"1":[1,1,1],"2_3":[2,2.5,3],"4_6":[4,5,6],"7_plus":[7,8,10]};
const ONCE={"1":[1,1,1],"2":[2,2,2],"3_4":[3,3.5,4],"5_plus":[5,5,6]};
const WEEKS={lt1:[0,.5,1],"1_2":[1,1.5,2],"3_4":[3,3.5,4],"5_plus":[5,6,8]};
const SHARE={lt_quarter:[0,.15,.25],quarter_half:[.25,.375,.5],over_half:[.5,.625,.75],nearly_all:[.75,.85,.95]};
const round=(n,d=0)=>Math.round((n+Number.EPSILON)*10**d)/10**d;
const tri=(a,b)=>a.map((v,i)=>round(v*b[i],1));
export function score(a) {
  const points=Object.fromEntries(Object.entries(POINTS).map(([k,v])=>[k,v[a[k]]??null]));
  const known=TIE.filter(k=>points[k]!==null), visibility=known.length<=1;
  const reuse=visibility?null:round(known.reduce((n,k)=>n+points[k],0)/known.length/3*100);
  const band=reuse===null?null:reuse>=85?"Reusable":reuse>=65?"Holding":reuse>=40?"Fragile":"Leaking";
  const weak=visibility?null:[...known].sort((a,b)=>points[a]-points[b]||TIE.indexOf(a)-TIE.indexOf(b))[0];
  const team=points.G1===null||points.G2===null?null:points.G1+points.G2;
  const today=YEAR[a.D1]??null,target=YEAR[a.D2]??null,rebuild=WEEKS[a.C2]??null,share=SHARE[a.C3]??null;
  const weeksTarget=target&&rebuild?tri(target,rebuild):null;
  return {
    points,reuse_score_0_100:reuse,reuse_band:band,visibility_gap:visibility,
    weak_point:weak?STEPS[weak]:null,weak_question:weak,
    team_points_0_4:team,team_band:team===null?null:team<=1?"Stretched":team<=3?"Thin":"Covered",
    projects_per_year_today:today,projects_per_year_target:target,
    growth_multiple_mid:today&&target?round(target[1]/today[1],1):null,
    at_once:ONCE[a.C1]??null,
    rebuild_weeks_per_year_today:today&&rebuild?tri(today,rebuild):null,
    rebuild_weeks_per_year_at_target:weeksTarget,
    rebuild_fte_at_target:weeksTarget?weeksTarget.map(n=>round(n/46,2)):null,
    senior_days_per_week_checking:share?share.map(n=>round(n*5,1)):null,
    headline:visibility?null:`More projects, same team, bigger remit: ${band==="Reusable"?"each project already starts from the last one; the next step is agentic":PHRASE[STEPS[weak]]}.`
  };
}
const LIKERT={sd:1,d:2,n:3,a:4,sa:5};
const lean=k=>!LIKERT[k]?null:LIKERT[k]>=4?"agree":LIKERT[k]<=2?"disagree":"neutral";
const STATEMENTS=Object.fromEntries(QUESTIONS.filter(q=>q.type==="likert").map(q=>[q.id,q.text]));
const OPENER={
  data_tension:"You said a new hire could find what they need, yet the next project starts from {S1}. Who actually finds things today?",
  soften_capacity:"You see finance or grid as the bigger limit than people's time. If both were solved tomorrow, could the team carry {D2} projects a year?",
  board_plan:"Your board expects an AI plan within 12 months. What would they need to see in it to back {D2} projects a year with this team?",
  trust_pilot:"You wouldn't yet trust AI with a bid comparison, even checked. What would a pilot need to show you first?",
  tools_vs_workflow:"You've tried AI tools without changing how projects run. Which tools, and who used them: individuals, or a shared workflow?",
  record_first:"A new hire couldn't find what they need without asking. Who do they ask, and what happens when that person is on the other project?",
  people_limit:"You see people's time as the limit. Which person, if they were off for a month, would stop a project?",
  bid_comparison_ready:"You'd trust AI to prepare a bid comparison with your team checking. On your last tender, how long did comparing the returns take?",
  already_shifting:"AI is already changing how projects run for you. Where, and is it shared or held by one person?",
  no_board_push:"Your board isn't pushing for an AI plan. Who in the business is asking for this, and why now?"
};
const ORDER=["data_tension","soften_capacity","board_plan","trust_pilot","tools_vs_workflow","record_first","people_limit","bid_comparison_ready","already_shifting","no_board_push"];
export function view(a,scored=score(a)) {
  const statements=Object.fromEntries(Object.keys(STATEMENTS).map(k=>[k,{answer:a[k]??null,label:LABELS[k][a[k]]??null,value:LIKERT[a[k]]??null,lean:lean(a[k])}]));
  statements.L5.ai_traction=statements.L5.value===null?null:6-statements.L5.value;
  const L=Object.fromEntries(Object.keys(statements).map(k=>[k,statements[k].lean]));
  const flags=[];
  if(L.L1==="agree")flags.push("board_plan");if(L.L1==="disagree")flags.push("no_board_push");
  if(L.L2==="agree")flags.push("bid_comparison_ready");if(L.L2==="disagree")flags.push("trust_pilot");
  if(L.L3==="disagree")flags.push("record_first");
  if(L.L3==="agree"&&["S1","S2"].some(k=>scored.points[k]!==null&&scored.points[k]<=1))flags.push("data_tension");
  if(L.L4==="agree")flags.push("people_limit");if(L.L4==="disagree")flags.push("soften_capacity");
  if(L.L5==="agree")flags.push("tools_vs_workflow");if(L.L5==="disagree")flags.push("already_shifting");
  const fill={S1:({record:"a reusable record",templates:"templates filled in by hand",old_folders:"the last project's folders",blank:"a blank page"})[a.S1]??"what it starts from",D2:LABELS.D2[a.D2]??"more"};
  const replace=s=>s.replaceAll("{S1}",fill.S1).replaceAll("{D2}",fill.D2);
  const openers=ORDER.filter(f=>flags.includes(f)).map(f=>replace(OPENER[f]));
  for(const k of Object.keys(STATEMENTS))if(a[k]==="not_sure")openers.push(`You weren't sure about: "${STATEMENTS[k]}". Worth asking directly.`);
  return {statements,tailoring:flags,call_openers:openers,top_openers:openers.slice(0,3)};
}
export function assess(a) {const result=score(a);return {...result,your_view:view(a,result)};}
export function validAnswers(a){return !!a&&typeof a==="object"&&!Array.isArray(a)&&IDS.every(id=>Object.hasOwn(LABELS[id],a[id]));}
