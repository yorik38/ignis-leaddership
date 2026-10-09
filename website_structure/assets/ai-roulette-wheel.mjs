import {lanes} from "./ai-roulette-model.mjs";

const shortLabels={
  bd:"Business dev.",bids:"Bids",tenders:"Tenders",transactions:"Transactions",
  handover:"Handover",mobilisation:"Mobilisation",contracts_change:"Contracts",reporting:"Reporting",
  external_service:"Client service",internal_tool:"Internal tool"
};

export const wheelSlices=lanes.flatMap(lane=>lane.activities.map(([activity,label],index)=>({
  lane:lane.id,activity,label,shortLabel:shortLabels[activity]||label,
  start:lanes.indexOf(lane)*120+index*120/lane.activities.length,
  end:lanes.indexOf(lane)*120+(index+1)*120/lane.activities.length
})));

function point(radius,degrees){const radians=degrees*Math.PI/180;return [200+radius*Math.sin(radians),200-radius*Math.cos(radians)]}
export function slicePath(start,end){const [x1,y1]=point(190,start),[x2,y2]=point(190,end);return `M 200 200 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 190 190 0 ${end-start>180?1:0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`}
export function labelPosition(start,end){const middle=(start+end)/2;const [x,y]=point(127,middle);let angle=middle-90;if(angle>90&&angle<270)angle-=180;return{x:x.toFixed(2),y:y.toFixed(2),angle}}
