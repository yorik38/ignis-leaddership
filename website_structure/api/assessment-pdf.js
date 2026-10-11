// A small, dependency-free two-page PDF renderer for the assessment report.
// It keeps the report usable in the serverless runtime without a browser or PDF package.
const W = 595, H = 842, LEFT = 48, RIGHT = 547;
const plain = value => String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/[^\x20-\x7e]/g, "");
const pdfText = value => plain(value).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
const rgb = hex => { const h = hex.replace("#",""); return [0,2,4].map(i => (parseInt(h.slice(i,i+2),16)/255).toFixed(3)).join(" "); };
const GREEN = rgb("#08766c"), DARK = rgb("#102426"), GREY = rgb("#4c6060");

function page() {
  const commands = [];
  return {
    commands,
    text(value,x,y,size=11,bold=false,color=DARK) { commands.push(`${color} rg BT /${bold?"F2":"F1"} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${pdfText(value)}) Tj ET`); },
    line(y) { commands.push(`${rgb("#cbdedb")} RG 1 w ${LEFT} ${y} m ${RIGHT} ${y} l S`); },
    bar(x,y,w,h,color=GREEN) { commands.push(`${color} rg ${x} ${y} ${w} ${h} re f`); },
    paragraph(value,x,y,maxChars=84,size=10.5,leading=15,color=DARK) {
      const words = plain(value).split(/\s+/); let row="";
      for (const word of words) {
        if ((row+" "+word).trim().length > maxChars && row) { this.text(row,x,y,size,false,color); y-=leading; row=word; }
        else row = row ? row+" "+word : word;
      }
      if (row) { this.text(row,x,y,size,false,color); y-=leading; }
      return y;
    }
  };
}
function reportDimension(report,id) { return report.dimensions.find(item => item.id === id); }
function summary(report,answers) {
  const adoption=reportDimension(report,"adoption");
  const modes=Array.isArray(answers.A1) ? answers.A1.filter(item=>item!=="none").map(item=>({copilot:"copilots",plugin:"plug-ins",personal_agent:"personal agents",team_agent:"team agents",workflow:"embedded workflows"}[item]||item)) : [];
  return [
    {label:"01 / AI TODAY", title:report.stage, body:`${modes.length?`AI use identified: ${modes.join(", ")}.`:"No current AI mode was identified."} ${adoption?.score==null?"Adoption could not be scored reliably.":`Adoption score: ${adoption.score}/100.`}`},
    {label:"02 / WHAT BLOCKS SCALE", title:"Workflow, data and governance", body:`${report.foundationFinding} Review process, evidence quality and controls before scaling AI.`},
    {label:"03 / WHERE IT MATTERS", title:"Work and new value", body:`Winning work: ${reportDimension(report,"win")?.score??"not scored"}/100. Delivering work: ${reportDimension(report,"deliver")?.score??"not scored"}/100. New opportunities: ${reportDimension(report,"opportunity")?.score??"not scored"}/100 (shown separately from the core score).`},
    {label:"04 / WHAT TO BUILD", title:report.priority.title, body:`${report.priority.why} First move: ${report.priority.first}`}
  ];
}
function makePageOne(report,answers,details) {
  const p=page();
  p.bar(0,H-12,W,12); p.text("/  IGNIS",LEFT,790,15,true,GREEN); p.text("AI SELF-ASSESSMENT",RIGHT-141,790,10,true,GREY); p.line(775);
  p.text("What to build with AI next",LEFT,738,23,true,DARK);
  const company = plain(details.company || "Organisation");
  p.text(`${company.length > 65 ? `${company.slice(0,62)}...` : company}  |  ${new Date().toISOString().slice(0,10)}`,LEFT,710,10,false,GREY);
  p.text(report.score==null?"?":String(report.score),LEFT,640,58,true,GREEN); p.text("/100",LEFT+75,647,17,true,GREY);
  p.text(report.score==null?"Not enough coverage for an overall score":report.stage,LEFT+155,654,16,true,DARK);
  p.text("Directional self-assessment, not an external benchmark",LEFT+155,635,9,false,GREY);
  p.line(610); let y=585;
  for (const block of summary(report,answers)) {
    p.text(block.label,LEFT,y,9,true,GREEN); y-=20;
    p.text(block.title,LEFT,y,15,true,DARK); y-=20;
    y=p.paragraph(block.body,LEFT,y,91,10.2,14.5,GREY)-17;
    p.line(y); y-=25;
  }
  p.text("PAGE 1 OF 2  |  Your answers shape these findings; see the build plan overleaf.",LEFT,35,8,false,GREY);
  return p;
}
function makePageTwo(report,details) {
  const p=page();
  p.bar(0,H-12,W,12); p.text("/  IGNIS",LEFT,790,15,true,GREEN); p.text("BUILD PRIORITY AND 30-DAY PILOT",RIGHT-218,790,10,true,GREY); p.line(775);
  p.text(report.priority.title,LEFT,736,21,true,DARK); let y=710;
  y=p.paragraph(report.priority.why,LEFT,y,91,10.3,15,GREY)-17;
  p.text("SCORES BY AREA",LEFT,y,10,true,GREEN); y-=25;
  for (const dimension of report.dimensions) {
    p.text(dimension.label,LEFT,y,10,false,DARK);
    p.bar(225,y-3,235,7,rgb("#d9e4e2"));
    if (dimension.score!=null) p.bar(225,y-3,235*dimension.score/100,7,GREEN);
    p.text(dimension.score==null?"N/A":`${dimension.score}/100`,473,y,9,true,GREY); y-=27;
  }
  y-=9; p.line(y); y-=28;
  for (const item of [
    ["FIRST MOVE",report.priority.first],
    ["ACCOUNTABLE OWNER",report.priority.owner],
    ["BOUNDED PILOT",report.priority.pilot]
  ]) { p.text(item[0],LEFT,y,9,true,GREEN); y-=18; y=p.paragraph(item[1],LEFT,y,91,10.3,15,DARK)-16; }
  p.line(116); p.text("How to read this",LEFT,99,10,true,DARK);
  p.paragraph(report.caveat,LEFT,82,97,8.7,12,GREY);
  p.text("PAGE 2 OF 2  |  Ignis Leadership  |  ignisleadership.com",LEFT,35,8,false,GREY);
  return p;
}
function objectBuffer(objects) {
  const pieces=["%PDF-1.4\n%IGNIS\n"], offsets=[0];
  for(let i=0;i<objects.length;i++) { offsets.push(Buffer.byteLength(pieces.join(""),"latin1")); pieces.push(`${i+1} 0 obj\n${objects[i]}\nendobj\n`); }
  const start=Buffer.byteLength(pieces.join(""),"latin1");
  pieces.push(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`);
  for(let i=1;i<offsets.length;i++) pieces.push(`${String(offsets[i]).padStart(10,"0")} 00000 n \n`);
  pieces.push(`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);
  return Buffer.from(pieces.join(""),"latin1");
}
module.exports = function buildAssessmentPDF(report,answers,details={}) {
  const streams=[makePageOne(report,answers,details),makePageTwo(report,details)].map(item=>item.commands.join("\n")+"\n");
  return objectBuffer([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [5 0 R 6 0 R] /Count 2 >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 7 0 R >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 8 0 R >>`,
    `<< /Length ${Buffer.byteLength(streams[0],"latin1")} >>\nstream\n${streams[0]}endstream`,
    `<< /Length ${Buffer.byteLength(streams[1],"latin1")} >>\nstream\n${streams[1]}endstream`
  ]);
};
