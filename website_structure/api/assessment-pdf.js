// A dependency-free, two-page decision brief for the assessment email.
const fs = require("node:fs"), path = require("node:path"), zlib = require("node:zlib");
const bank = require("../assets/ai-assessment-v7.json");
const W = 595, H = 842, LEFT = 42, RIGHT = 553, WIDTH = RIGHT - LEFT;
const plain = value => String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/[^\x20-\x7e]/g, "");
const pdfText = value => plain(value).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
const rgb = hex => { const h = hex.replace("#",""); return [0,2,4].map(i => (parseInt(h.slice(i,i+2),16)/255).toFixed(3)).join(" "); };
const GREEN = rgb("#08766c"), DARK = rgb("#102426"), GREY = rgb("#4c6060"), LIGHT = rgb("#f0f3f3"), RULE = rgb("#cbdedb");
const LIKERT = ["", "Strongly disagree", "Disagree", "Somewhat disagree", "Neither agree nor disagree", "Somewhat agree", "Agree", "Strongly agree"];

function logoImage() {
  const bytes = fs.readFileSync(path.join(__dirname, "..", "assets", "img", "ignis-logo-full.png"));
  if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("Ignis logo is not a PNG");
  let offset = 8, width = 0, height = 0, type = 0, depth = 0; const parts = [];
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset), kind = bytes.toString("ascii", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length); offset += length + 12;
    if (kind === "IHDR") { width = data.readUInt32BE(0); height = data.readUInt32BE(4); depth = data[8]; type = data[9]; if (data[12] !== 0) throw new Error("Interlaced logo is unsupported"); }
    if (kind === "IDAT") parts.push(data);
    if (kind === "IEND") break;
  }
  if (type !== 6 || depth !== 8 || !width || !height) throw new Error("Unexpected Ignis logo format");
  const inflated = zlib.inflateSync(Buffer.concat(parts)), stride = width * 4;
  const rgbBytes = Buffer.alloc(width * height * 3), alpha = Buffer.alloc(width * height);
  let source = 0, pixel = 0, previous = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = inflated[source++], row = Buffer.from(inflated.subarray(source, source + stride)); source += stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? row[x - 4] : 0, above = previous[x], upperLeft = x >= 4 ? previous[x - 4] : 0;
      const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above : filter === 3 ? Math.floor((left + above) / 2) : (() => {
        const p = left + above - upperLeft, a = Math.abs(p - left), b = Math.abs(p - above), c = Math.abs(p - upperLeft);
        return a <= b && a <= c ? left : b <= c ? above : upperLeft;
      })();
      if (filter > 4) throw new Error("Unexpected logo PNG filter");
      row[x] = (row[x] + predictor) & 255;
    }
    for (let x = 0; x < width; x++) { const i = x * 4; rgbBytes.set(row.subarray(i, i + 3), pixel * 3); alpha[pixel++] = row[i + 3]; }
    previous = row;
  }
  return {width, height, rgb:zlib.deflateSync(rgbBytes), alpha:zlib.deflateSync(alpha)};
}
const LOGO = logoImage();

function textWidth(value, size, bold = false) {
  return [...plain(value)].reduce((total, character) => total + (character === " " ? .28 : /[ilI.,:;!'|]/.test(character) ? .27 : /[MW@%]/.test(character) ? .88 : /[A-Z0-9]/.test(character) ? .64 : .52), 0) * size * (bold ? 1.04 : 1);
}
function wrap(value, width, size, bold = false) {
  const words = plain(value).split(/\s+/).filter(Boolean), lines = []; let row = "";
  for (const word of words) {
    const next = row ? `${row} ${word}` : word;
    if (row && textWidth(next, size, bold) > width) { lines.push(row); row = word; } else row = next;
  }
  if (row) lines.push(row);
  return lines;
}

function page() {
  const commands = [];
  return {
    commands,
    text(value,x,y,size=11,bold=false,color=DARK) { commands.push(`${color} rg BT /${bold?"F2":"F1"} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${pdfText(value)}) Tj ET`); },
    line(y,color=RULE) { commands.push(`${color} RG .7 w ${LEFT} ${y} m ${RIGHT} ${y} l S`); },
    bar(x,y,w,h,color=GREEN) { commands.push(`${color} rg ${x} ${y} ${w} ${h} re f`); },
    image(x,y,w,h) { commands.push(`q ${w} 0 0 ${h} ${x} ${y} cm /Im1 Do Q`); },
    paragraph(value,x,y,width=WIDTH,size=10.5,leading=15,color=DARK,bold=false) {
      for (const row of wrap(value,width,size,bold)) { this.text(row,x,y,size,bold,color); y-=leading; }
      return y;
    }
  };
}
function header(p,number,label) {
  p.bar(0,H-9,W,9); p.image(LEFT,785,70,23.5);
  p.text(label.toUpperCase(),RIGHT-textWidth(label.toUpperCase(),8.5,true),792,8.5,true,GREY); p.line(775);
  p.line(50); p.text("Ignis Leadership  |  ignisleadership.com",LEFT,34,8,false,GREY);
  p.text(`Page ${number} of 2`,RIGHT-43,34,8,false,GREY);
}
function heading(p,number,title,y) {
  const x=LEFT+10,cy=y-3,r=10,k=5.523;
  p.commands.push(`${GREEN} rg ${x+r} ${cy} m ${x+r} ${cy+k} ${x+k} ${cy+r} ${x} ${cy+r} c ${x-k} ${cy+r} ${x-r} ${cy+k} ${x-r} ${cy} c ${x-r} ${cy-k} ${x-k} ${cy-r} ${x} ${cy-r} c ${x+k} ${cy-r} ${x+r} ${cy-k} ${x+r} ${cy} c f`);
  p.text(number,LEFT+6.5,y-6,8,true,"1 1 1"); p.text(title,LEFT+28,y-3,13.2,true,DARK); p.line(y-15,GREEN);
  return y-34;
}
function contextLabel(context,id) {
  const item=bank.context.find(entry=>entry.id===id), value=context[id];
  if(!item||value==null)return "Not selected";
  if(Array.isArray(value))return value.map(choice=>item.options.find(option=>option.id===choice)?.label||choice).join(" and ");
  return item.options.find(option=>option.id===value)?.label||"Not selected";
}
function contextCell(p,label,value,x,y,width) {
  p.text(label.toUpperCase(),x,y,8.1,true,GREEN);
  p.paragraph(value,x,y-16,width,10,13,DARK);
}
function evidenceSignals(report,answers) {
  const sections=bank.sections.filter(section=>section.id!=="opportunity");
  const rated=section=>section.questions.filter(question=>question.type==="likert"&&Number.isInteger(Number(answers[question.id]))&&Number(answers[question.id])>=1&&Number(answers[question.id])<=7)
    .map(question=>({question,section,value:Number(answers[question.id])}));
  const primary=sections.find(section=>section.id===report.priority.id);
  const weak=(primary?rated(primary):sections.flatMap(rated)).sort((a,b)=>a.value-b.value).slice(0,2);
  const contrast=sections.flatMap(rated).filter(item=>!weak.some(signal=>signal.question.id===item.question.id)).sort((a,b)=>b.value-a.value)[0];
  return [...weak,...contrast?[contrast]:[]].map(item=>({
    text:item.question.text,
    answer:LIKERT[item.value],
    label:`${item.section.title} / ${item.question.id}`,
    kind:weak.includes(item)?"Constraint signal":item.value>=5?"Counter-signal":"Comparison signal"
  }));
}
function alternative(report) {
  const options=report.dimensions.filter(item=>item.id!=="opportunity"&&item.id!==report.priority.id&&item.score!=null).sort((a,b)=>a.score-b.score);
  const item=options[0];
  if(!item)return {id:null,title:"Map the work first",why:"If the evidence is thin, review one live workflow before choosing a build."};
  const moves={adoption:"Agree one recurring team use case and an approved review standard.",workflow:"Map the decision path and handovers on one live project.",data:"Check who owns the evidence, source and approved version.",governance:"Set access, review and human sign-off for a real AI-assisted output.",win:"Test evidence gathering and checking in one live opportunity.",deliver:"Test obligation and handover checks in one live project."};
  return {id:item.id,title:`Also test: ${item.label.toLowerCase()}`,why:`This area scored ${item.score}/100. ${moves[item.id]} It may be a parallel need, not the first dependency.`};
}
function coverage(report) {
  const scored=report.dimensions.filter(item=>item.id!=="opportunity");
  const answered=scored.reduce((sum,item)=>sum+item.answered,0),possible=scored.reduce((sum,item)=>sum+item.possible,0);
  return `${answered} of ${possible} scored statements were within this respondent's view.${report.unknown.length?` Insufficient coverage in ${report.unknown.join(", ")}.`:""}`;
}
function routeRationale(report,other,context) {
  const primary=report.dimensions.find(item=>item.id===report.priority.id);
  const alternative=report.dimensions.find(item=>other.id===item.id);
  const named=context.bottleneck==="evidence"&&report.priority.id==="data"||context.bottleneck==="decisions"&&report.priority.id==="workflow";
  if(!primary||!alternative)return "Treat this as a hypothesis until the live workflow confirms the constraint.";
  if(primary.score===alternative.score)return `Both areas scored ${primary.score}/100. ${named?"Your named bottleneck breaks the tie;":"Use the live test to break the tie;"} do not assume either is causal.`;
  return `${primary.label} scored ${primary.score}/100 versus ${alternative.score}/100 for ${alternative.label.toLowerCase()}. Test whether the first is a dependency, not just a lower score.`;
}
function makePageOne(report,answers,details) {
  const p=page(),context=details.context||{}; header(p,1,"AI capability brief");
  p.text("AI capability / decision brief",LEFT,739,23,true,DARK);
  const recipient=plain(details.firstName||"Respondent"),company=plain(details.company||"");
  p.text(`Prepared for ${recipient}${company?`  |  ${company}`:""}`.slice(0,75),LEFT,717,10.2,false,GREY);
  p.text(new Date().toISOString().slice(0,10),RIGHT-52,702,9,false,GREY);

  p.bar(LEFT,567,WIDTH,127,LIGHT); p.bar(LEFT,567,3,127,GREEN);
  p.text("01 / WHAT YOU TOLD US",LEFT+14,674,9,true,GREEN);
  contextCell(p,"Your perspective",{individual:"Individual contributor",team:"Team leader",leader:"Business leader"}[context.persona]||"Not selected",LEFT+14,651,228);
  contextCell(p,"Project view",contextLabel(context,"stages"),LEFT+267,651,228);
  contextCell(p,"12-month priority",contextLabel(context,"outcome"),LEFT+14,604,228);
  contextCell(p,"Named bottleneck",contextLabel(context,"bottleneck"),LEFT+267,604,228);

  heading(p,"02","Our working interpretation",543);
  p.text(report.score==null?"SCORE UNAVAILABLE":`${report.score}/100  /  ${report.stage}`,RIGHT-137,543,8.5,true,GREEN);
  p.text("AI use",LEFT,502,10.5,true,DARK);
  p.paragraph(report.findings.adoption,LEFT,484,240,9.2,12.5,GREY);
  p.text("Likely constraint",LEFT+263,502,10.5,true,DARK);
  p.paragraph(`${report.foundationFinding} ${report.findings.foundations}`,LEFT+263,484,248,9.2,12.5,GREY);
  p.line(389);
  heading(p,"03","Answer signals behind that reading",371);
  const signals=evidenceSignals(report,answers);
  if(!signals.length) p.paragraph("There are not enough scored answer signals to support a specific diagnosis. Validate the starting point with the people who own the work.",LEFT,334,WIDTH,9.5,13,GREY);
  else for(const [index,signal] of signals.entries()) {
    const y=334-index*70;
    p.text(signal.kind.toUpperCase(),LEFT,y,8.2,true,GREEN);
    p.text(`${signal.label} / ${signal.answer}`,LEFT,y-15,8.5,false,GREY);
    p.paragraph(signal.text,LEFT+212,y-2,WIDTH-212,9.2,12.2,DARK);
    p.line(y-53);
  }
  p.bar(LEFT,72,WIDTH,53,LIGHT);
  p.text("04 / CONFIDENCE AND LIMITS",LEFT+12,107,8.6,true,GREEN);
  p.paragraph(`${coverage(report)} This is one person's self-report, not a verified audit or a comparison with other developers.`,LEFT+12,90,WIDTH-24,8.7,11.5,DARK);
  return p;
}
function makePageTwo(report,details) {
  const p=page(),context=details.context||{}; header(p,2,"Your next build");
  p.text("The decision / a first test",LEFT,739,23,true,DARK);
  p.text(`Prepared for ${plain(details.firstName||"Respondent")}`.slice(0,75),LEFT,717,10.2,false,GREY);
  heading(p,"05","Two routes to examine",690);
  const other=alternative(report);
  p.bar(LEFT,456,248,188,LIGHT); p.bar(LEFT,456,3,188,GREEN);
  p.text("FIRST CANDIDATE",LEFT+12,625,8.8,true,GREEN);
  let y=p.paragraph(report.priority.title,LEFT+12,603,224,12.2,15,DARK,true)-5;
  y=p.paragraph(report.priority.why,LEFT+12,y,224,9.1,12.2,GREY)-8;
  y=p.paragraph(report.priority.first,LEFT+12,y,224,9.1,12.2,DARK)-10;
  p.paragraph(routeRationale(report,other,context),LEFT+12,y,224,8.7,11.5,GREEN);
  p.bar(LEFT+263,456,248,188,LIGHT);
  p.text("ALTERNATIVE TO CHECK",LEFT+275,625,8.8,true,GREEN);
  y=p.paragraph(other.title,LEFT+275,603,224,12.2,15,DARK,true)-5;
  y=p.paragraph(other.why,LEFT+275,y,224,9.1,12.2,GREY)-10;
  p.paragraph("If the first build removes no real friction, compare this route against the same baseline before expanding either one.",LEFT+275,y,224,8.7,11.5,DARK);

  heading(p,"06","A bounded validation plan",426);
  const steps=[
    ["01  BASELINE",`Choose ${context.stages==="all"?"one live project and a handover":context.stages?"one live activity in the stage you selected":"one live activity in the work you know"}. Record current time, rework, errors and decision ownership.`],
    ["02  TEST",`${report.priority.pilot} ${report.stageApplication}`],
    ["03  DECIDE",`Ask ${report.priority.owner.toLowerCase()} to review output quality, evidence, human sign-off and whether the pilot improved the baseline.`]
  ];
  steps.forEach(([label,body],index)=>{
    const yy=386-index*74; p.text(label,LEFT,yy,8.6,true,GREEN); p.paragraph(body,LEFT+117,yy,WIDTH-117,9.2,12.3,DARK); p.line(yy-57);
  });
  heading(p,"07","Questions before committing",151);
  const stageQuestion={development:"Which site, grid, land or planning decision would have changed?",route:"Which auction, tender or offtake decision would have changed?",procurement:"Which supplier, interface or contract decision would have changed?",close:"Which lender question or close decision would have changed?",all:"Which handover between project stages would have changed?"}[context.stages]||"Which live decision would have changed?";
  p.paragraph(`${stageQuestion} Can the team show the approved source, correction path and human sign-off? What would make this worth repeating on the next project?`,LEFT,115,WIDTH,9.2,12.3,DARK);
  p.text("WATCH-OUT",LEFT,66,8.5,true,GREEN);
  p.text("These answers do not prove a stage-level gap, financial cost or causal saving.",LEFT+76,66,8.5,false,GREY);
  return p;
}
function binaryStream(dict,data) {
  return Buffer.concat([Buffer.from(`<< ${dict} /Length ${data.length} >>\nstream\n`,"latin1"),data,Buffer.from("\nendstream","latin1")]);
}
function objectBuffer(objects) {
  const pieces=[Buffer.from("%PDF-1.4\n%IGNIS\n","latin1")],offsets=[0]; let length=pieces[0].length;
  objects.forEach((object,index)=>{
    offsets.push(length);
    const part=Buffer.concat([Buffer.from(`${index+1} 0 obj\n`,"latin1"),Buffer.isBuffer(object)?object:Buffer.from(object,"latin1"),Buffer.from("\nendobj\n","latin1")]);
    pieces.push(part);length+=part.length;
  });
  pieces.push(Buffer.from([`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`,...offsets.slice(1).map(value=>`${String(value).padStart(10,"0")} 00000 n \n`),`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${length}\n%%EOF`].join(""),"latin1"));
  return Buffer.concat(pieces);
}
module.exports = function buildAssessmentPDF(report,answers,details={}) {
  const streams=[makePageOne(report,answers,details),makePageTwo(report,details)].map(item=>item.commands.join("\n")+"\n");
  return objectBuffer([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [5 0 R 6 0 R] /Count 2 >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im1 9 0 R >> >> /Contents 7 0 R >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im1 9 0 R >> >> /Contents 8 0 R >>`,
    binaryStream("",Buffer.from(streams[0],"latin1")),
    binaryStream("",Buffer.from(streams[1],"latin1")),
    binaryStream(`/Type /XObject /Subtype /Image /Width ${LOGO.width} /Height ${LOGO.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask 10 0 R`,LOGO.rgb),
    binaryStream(`/Type /XObject /Subtype /Image /Width ${LOGO.width} /Height ${LOGO.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode`,LOGO.alpha)
  ]);
};
// Shared low-level PDF layout primitives for the separate v10 decision brief.
module.exports.primitives={W,H,LEFT,RIGHT,WIDTH,GREEN,DARK,GREY,LIGHT,RULE,LOGO,page,header,heading,binaryStream,objectBuffer};
