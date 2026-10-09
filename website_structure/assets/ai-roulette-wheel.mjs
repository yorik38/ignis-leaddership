import {maturityStages} from "./ai-roulette-model.mjs";

function point(radius,degrees){const radians=degrees*Math.PI/180;return [200+radius*Math.sin(radians),200-radius*Math.cos(radians)]}
export function slicePath(start,end){const [x1,y1]=point(190,start),[x2,y2]=point(190,end);return `M 200 200 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 190 190 0 ${end-start>180?1:0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`}
export function labelPosition(start,end){const middle=(start+end)/2;const [x,y]=point(127,middle);let angle=middle-90;if(angle>90&&angle<270)angle-=180;return{x:x.toFixed(2),y:y.toFixed(2),angle}}

// Landing-page decorative wheel only, geometry for the same maturityStages the Maturity section actually asks about (ai-roulette-model.mjs), kept in sync by importing rather than redefining.
export const maturitySlices=maturityStages.map((stage,index)=>({...stage,start:index*360/maturityStages.length,end:(index+1)*360/maturityStages.length}));
