// Two-page, dependency-free decision brief built from the server-scored v10 answers.
const {W,H,LEFT,RIGHT,WIDTH,GREEN,DARK,GREY,LIGHT,LOGO,page,header,heading,binaryStream,objectBuffer}=require("./assessment-pdf.js").primitives;
const clean=value=>String(value??"").replace(/\s+/g," ").trim();
const fmt=values=>values?`${values[0]} to ${values[2]}`:"not known";
const fix={
  Holder:["Give project knowledge an owner and a home","Keep one current project record for packages, interfaces, changes, bidders and lessons. A named owner maintains it as the project moves stage.","Agree the record fields and name an owner.","Fill it from a live project; ask a second person to answer from it.","Start the next project from it and compare set-up time."],
  Start:["Start each project from the last one","Build an approved starter pack from the previous project record, not a blank precedent or a folder that needs interpretation.","List what the next project needs on day one.","Build and verify the starter pack.","Use it on the next project and compare set-up time."],
  Cover:["Make every project pick-up-able","Make open items, owners, interfaces and next decisions readable by someone else rather than held by one project manager.","Define a one-page project position.","Keep it current on every live project.","Test a real handover between two project managers."],
  Scope:["Agree interfaces before offers","Reuse an agreed package and interface list so roles are clear at offer stage instead of discovered during negotiation.","Build the list from a current project.","Issue it with the next offers.","Count interface questions in negotiation against today."],
  Reusable:["Let agents prepare from the record","Your next project already starts from the last one. Agents could prepare from that record, with people checking and signing off.","Select the step taking most senior time.","Design the workflow, checks and sign-off.","Run a pilot and measure senior time."],
  Visibility:["Walk one finished project through to the next","The missing visibility is the finding. Establish what carried across, where it was held and who owned it.","Run the walk-through with the people involved.","Name the weak point and its owner.","Fix that point on a live project."]
};
function line(p,label,value,y){p.text(label.toUpperCase(),LEFT,y,8.2,true,GREEN);return p.paragraph(value,LEFT+120,y,WIDTH-120,9.4,13,DARK)-8;}
function makeOne(result,answers,details,labels){
  const p=page();header(p,1,"Your project-reuse decision brief");
  const direction=result.growth_multiple_mid===null?"YOUR NEXT PROJECT.":result.growth_multiple_mid<=1?"AT YOUR CURRENT PACE.":answers.G1==="with_work"?"MORE PROJECTS. GROWING TEAM.":"MORE PROJECTS. SAME TEAM.";
  p.text(direction,LEFT,744,22,true,DARK);
  p.text("What the next project can reuse",LEFT,720,12,false,GREY);
  p.text(`Prepared for ${clean(details.firstName)||"the respondent"}${details.company?` | ${clean(details.company)}`:""}`,LEFT,697,9.7,false,GREY);
  p.line(682);
  let y=heading(p,"01","The reading from your answers",660);
  p.text(result.visibility_gap?"REUSE NOT VISIBLE":`${result.reuse_score_0_100}/100  |  ${result.reuse_band.toUpperCase()}`,LEFT,y,17,true,GREEN);y-=26;
  y=p.paragraph(result.visibility_gap?"Three or more answers about handover were Not sure. You cannot yet see how the next project would reuse the last. That is the first finding.":result.reuse_band==="Reusable"?"Your handover answers meet the reusable threshold. Test what an agent could prepare from the approved record, with your team checking sources and decisions. This is not an AI maturity or peer benchmark.":`The weakest measured point is ${result.weak_point.toLowerCase()}. This is a reuse score, not an AI maturity or peer benchmark.`,LEFT,y,WIDTH,10.3,15,DARK)-12;
  y=line(p,"Project direction",`${labels.D1} a year today; ${labels.D2} wanted in two years. ${labels.D3}.`,y);
  y=line(p,"Team",`${result.team_band||"Not known"}. Team growth: ${labels.G1}. EPC-scale experience: ${labels.G2}.`,y);
  y=line(p,"Current capacity",`${labels.C1} projects at once with today's team.`,y);
  y-=6;p.line(y);y-=30;
  p.text("02 / THE HANDOVER TEST",LEFT,y,9,true,GREEN);y-=21;
  for(const [id,name] of [["S1","Start"],["S2","Holder"],["S3","Cover"],["S4","Scope"]]){
    p.text(`${name.toUpperCase()}  ${result.points[id]==null?"?":result.points[id]}/3`,LEFT,y,9.4,true,result.reuse_band!=="Reusable"&&result.weak_question===id?GREEN:DARK);
    y=p.paragraph(labels[id],LEFT+120,y,WIDTH-120,9.3,12.6,DARK)-8;
  }
  p.line(y);y-=30;
  p.text("03 / CAPACITY AT STAKE",LEFT,y,9,true,GREEN);y-=22;
  if(result.rebuild_weeks_per_year_at_target){
    const weeks=result.rebuild_weeks_per_year_at_target;
    y=p.paragraph(`At your target: about ${Math.round(weeks[1])} weeks a year finding or rebuilding context, within a ${fmt(weeks)}-week range. That is approximately ${result.rebuild_fte_at_target[1]} of a person-year.`,LEFT,y,WIDTH,10,14,DARK)-10;
  }else y=p.paragraph("The project target or time spent rebuilding was not known, so a yearly estimate would be misleading.",LEFT,y,WIDTH,10,14,DARK)-10;
  if(result.senior_days_per_week_checking)y=p.paragraph(`Senior time spent checking and coordinating: about ${result.senior_days_per_week_checking[1]} days of a five-day week (${fmt(result.senior_days_per_week_checking)} days).`,LEFT,y,WIDTH,10,14,DARK)-8;
  p.bar(LEFT,79,WIDTH,51,LIGHT);
  p.paragraph("These are your ranges multiplied out, not a saving or forecast. A pilot would measure what the team can recover. One person's self-report is not an independent audit.",LEFT+12,111,WIDTH-24,8.8,11.5,DARK);
  return p;
}
function makeTwo(result,answers,details,labels){
  const p=page();header(p,2,"The first build and test");
  p.text("A FIRST FIX, NOT A PLATFORM CLAIM",LEFT,743,20,true,DARK);
  p.text(`Prepared for ${clean(details.firstName)||"the respondent"}`,LEFT,719,10,false,GREY);
  const selected=fix[result.visibility_gap?"Visibility":result.reuse_band==="Reusable"?"Reusable":result.weak_point]||fix.Visibility;
  let y=heading(p,"04","What to fix first",685);
  p.text(selected[0],LEFT,y,14,true,DARK);y-=20;
  y=p.paragraph(selected[1],LEFT,y,WIDTH,10,14,DARK)-12;
  for(let i=0;i<3;i++)y=line(p,`${[30,60,90][i]} days`,selected[i+2],y);
  if(result.team_band==="Stretched"||["none","one"].includes(answers.G2))y=p.paragraph("Pair the fix with the team: two people learn the EPC-scale step on a live project, so it does not rest on one person.",LEFT,y,WIDTH,9.3,12.5,GREY)-11;
  if(["build_operate","services"].includes(answers.D3))y=p.paragraph("Because your remit extends beyond a sale, decide which knowledge the business must own or operate and design the record to last that long.",LEFT,y,WIDTH,9.3,12.5,GREY)-11;
  p.line(y);y-=30;
  p.text("05 / HOW AN AGENTIC WORKFLOW WOULD DIFFER",LEFT,y,9,true,GREEN);y-=22;
  y=p.paragraph("Today, people rebuild context, compare returns and track interfaces across documents. With an approved project record, code can check versions and completeness; an agent can prepare a cited pack or comparison; people still set criteria, negotiate, decide and sign off.",LEFT,y,WIDTH,10,14,DARK)-14;
  y=p.paragraph("This is an illustrative design. Agents can only reuse what is written down, owned and checked. No time saving is claimed until a pilot measures it against today's work.",LEFT,y,WIDTH,9.3,13,GREY)-15;
  p.line(y);y-=29;
  p.text("06 / THREE QUESTIONS FOR A 30-MINUTE CALL",LEFT,y,9,true,GREEN);y-=22;
  const questions=result.your_view.top_openers.length?result.your_view.top_openers:[`You want ${labels.D2} projects a year. What did the last project hand to the next one?`];
  for(const [i,question] of questions.slice(0,3).entries())y=p.paragraph(`${i+1}. ${question}`,LEFT,y,WIDTH,9.4,13,DARK)-8;
  if(y>175){p.line(y);y-=28;p.text("07 / A BOUNDED NEXT STEP",LEFT,y,9,true,GREEN);y-=22;p.paragraph("Map one live handover and its decision rights. Design the record and a checked agent workflow. Build one pilot with the team, then decide from measured evidence whether to embed it.",LEFT,y,WIDTH,9.5,13,DARK);}
  p.bar(LEFT,77,WIDTH,42,LIGHT);p.text("Bring this result, not confidential project documents.",LEFT+12,101,9.3,true,DARK);p.text("ignisleadership.com/contact",LEFT+12,84,9,false,GREEN);
  return p;
}
module.exports=function buildV10PDF(result,answers,details,labels){
  const streams=[makeOne(result,answers,details,labels),makeTwo(result,answers,details,labels)].map(item=>item.commands.join("\n")+"\n");
  return objectBuffer([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [5 0 R 6 0 R] /Count 2 >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im1 9 0 R >> >> /Contents 7 0 R >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im1 9 0 R >> >> /Contents 8 0 R >>`,
    binaryStream("",Buffer.from(streams[0],"latin1")),binaryStream("",Buffer.from(streams[1],"latin1")),
    binaryStream(`/Type /XObject /Subtype /Image /Width ${LOGO.width} /Height ${LOGO.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask 10 0 R`,LOGO.rgb),
    binaryStream(`/Type /XObject /Subtype /Image /Width ${LOGO.width} /Height ${LOGO.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode`,LOGO.alpha)
  ]);
};
