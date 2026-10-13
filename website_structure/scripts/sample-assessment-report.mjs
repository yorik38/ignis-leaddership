import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {assess} from "../assets/ai-assessment-v7-model.mjs";

const require = createRequire(import.meta.url);
const bank = require("../assets/ai-assessment-v7.json");
const buildPDF = require("../api/assessment-pdf.js");
const context = {persona:"leader",outcome:"scale",bottleneck:"evidence",stages:"all"};
const ratings = {adoption:[4,5,4,5],workflow:[4,4,4,5,4,5],data:[3,3,4,3,4,3],governance:[4,4,4,4,4,4],win:[4,4,4,4,4,4],deliver:[3,3,4,3,4,3],opportunity:[3,3,3,3,3,3]};
const answers = {};
for (const section of bank.sections) {
  let index = 0;
  for (const question of section.questions) {
    if (question.id === "A1") answers[question.id] = ["copilot","plugin"];
    else if (question.id === "A2") answers[question.id] = "team";
    else answers[question.id] = String(ratings[section.id][index++]);
  }
}
const report = assess(bank,answers,context);
const destination = process.argv[2] || path.join(process.cwd(),"output","pdf","ignis-ai-capability-brief-sample.pdf");
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(destination,buildPDF(report,answers,{firstName:"Alex",company:"Example Renewables",context}));
process.stdout.write(`${destination}\n`);
