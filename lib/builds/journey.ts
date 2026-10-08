import { lessonHistories,type HistoryLessonId } from "../history";
import type { LessonHistory } from "../history/types";
import { labLessons,labHref } from "../labs";
import { buildById,firstUse } from "./catalog";
import { TOOLS } from "./tools";
import { assemble,evaluate,expressionTools,type Build,type Data,type Settings } from "./engine";
export interface JourneyData {
  build:Build;
  lesson:{title:string;href:string;section:string};
  history:LessonHistory;
  tools:{key:string;earlier?:{title:string;href:string};example?:{inputs:Data[];settings:Settings;output:Data}}[];
  previous?:{title:string;href:string};next?:{title:string;href:string};
}
export function journeyFor(id:string):JourneyData {
  const original=buildById[id];if(!original)throw Error(`Missing construction: ${id}`);
  const at=labLessons.findIndex(l=>l.id===id),lesson=labLessons[at];
  const build={...original,extras:original.extras?.filter(key=>{const introduced=labLessons.findIndex(l=>l.id===firstUse[key]);return firstUse[key]==="workshop-guide"&&id!=="workshop-guide"||introduced>=0&&introduced<at;})};
  const reference=assemble(build.recipe,TOOLS),trace=evaluate(reference,build.cases[0].data,TOOLS);
  const keys=[...new Set([...expressionTools(build.recipe).filter(t=>!t.startsWith("source:")),...(build.extras??[])])];
  return {build,lesson:lesson??{title:"Getting started with Botie",href:"/lab/workshop-guide",section:"Start here"},
    history:id==="workshop-guide"?{title:"How Do We Give a Machine a Job?",sources:[],blocks:[
      "Suppose a sensor sends us a reading and we need twice that amount. We know what we want, but the machine still needs instructions. We need to tell it where the reading comes from, what to do with it, and where to send the answer.",
      "Botie's workshop lets us make those instructions visible. A source supplies data, an operation changes or combines it, and a wire carries the result into another operation. The result is where we check whether the whole construction does what we asked.",
      "In the lessons, we will start with the problems people were trying to solve. Botie will introduce the tools they developed, show how the pieces work, and then work through that problem with you in a construction. You will keep using familiar tools as the problems become more involved.",
    ]}:lessonHistories[id as HistoryLessonId],
    tools:keys.map(key=>{const first=labLessons.find(l=>l.id===firstUse[key]);const piece=reference.pieces.find(p=>p.tool===key);const step=trace.steps.find(s=>s.id===piece?.id);return {key,...(first&&first.id!==id&&labLessons.indexOf(first)<at?{earlier:{title:first.title,href:labHref(first.id)}}:firstUse[key]==="workshop-guide"&&id!=="workshop-guide"?{earlier:{title:"The workshop tutorial",href:"/lab/workshop-guide"}}:{}),...(piece&&step?{example:{inputs:step.inputs,settings:piece.settings,output:step.output}}:{})};}),
    ...(at>0?{previous:{title:labLessons[at-1].title,href:labHref(labLessons[at-1].id)}}:{}),
    ...(at<labLessons.length-1?{next:{title:labLessons[at+1].title,href:labHref(labLessons[at+1].id)}}:{}),
  };
}
