import { lessonHistories,type HistoryLessonId } from "../history";
import type { LessonHistory } from "../history/types";
import { labLessons,labHref } from "../labs";
import { lessonLocations } from "../course-navigation";
import { BUILDS,buildById,firstUse } from "./catalog";
import { TOOLS } from "./tools";
import { assemble,evaluate,expressionTools,type Build,type Data,type Settings } from "./engine";
import { constructionJourney, type ConstructionJourney } from "./challenges";
import { planFor } from "./journeys";
import type { JourneyPlan } from "./journey-plan";
import { reusableCalculation, type ReusableCalculation } from "./journey-reuse";
import { freshCaseFor } from "./fresh-cases";
import type { FreshJourneyCase } from "./journey-fresh";
export interface JourneyConnection {
  lessonId: string; skill: string; why: string;
  title: string; href: string; build: Build; caseIndex: number; reuse?: ReusableCalculation;
}
export interface JourneyData {
  build:Build;
  lesson:{title:string;href:string;section:string};
  history:LessonHistory;
  tools:{key:string;earlier?:{title:string;href:string};example?:{inputs:Data[];settings:Settings;output:Data}}[];
  challenges: ConstructionJourney;
  plan?: JourneyPlan;
  fresh?: FreshJourneyCase;
  connections: JourneyConnection[];
  previous?:{title:string;href:string};next?:{title:string;href:string};
}
let earlierExamples: Map<string, NonNullable<JourneyData["tools"][number]["example"]>> | undefined;
function exampleFor(key: string) {
  if (!earlierExamples) {
    earlierExamples = new Map();
    for (const build of BUILDS) {
      const graph = assemble(build.recipe, TOOLS), trace = evaluate(graph, build.cases[0].data, TOOLS);
      for (const step of trace.steps) {
        const piece = graph.pieces.find(piece => piece.id === step.id)!;
        if (TOOLS[piece.tool] && !earlierExamples.has(piece.tool)) earlierExamples.set(piece.tool, { inputs: step.inputs, settings: piece.settings, output: step.output });
      }
    }
  }
  return earlierExamples.get(key);
}
export function journeyFor(id:string):JourneyData {
  const original=buildById[id];if(!original)throw Error(`Missing construction: ${id}`);
  const plan=id==="workshop-guide"?undefined:planFor(id);
  const at=labLessons.findIndex(l=>l.id===id),lesson=labLessons[at];
  const location=lesson?lessonLocations[lesson.href]:undefined;
  const workshopLink=(item:{title:string;href:string})=>({title:item.title,href:labHref(item.href.split('/').pop()!)});
  const build={...original,extras:original.extras?.filter(key=>{const introduced=labLessons.findIndex(l=>l.id===firstUse[key]);return firstUse[key]==="workshop-guide"&&id!=="workshop-guide"||introduced>=0&&introduced<at;})};
  const reference=assemble(build.recipe,TOOLS),trace=evaluate(reference,build.cases[0].data,TOOLS);
  const keys=[...new Set([...expressionTools(build.recipe).filter(t=>!t.startsWith("source:")),...(build.extras??[])])];
  return {build,plan,fresh:id==="workshop-guide"?undefined:freshCaseFor(id),challenges:constructionJourney(build,plan),connections:(plan?.connections??[]).map(connection=>{
    const prior=buildById[connection.lessonId];
    if(!prior)throw Error(`${id}: missing earlier workshop ${connection.lessonId}`);
    const earlier=labLessons.find(item=>item.id===connection.lessonId);
    return {...connection,title:earlier?.title??"The workshop introduction",href:labHref(connection.lessonId),build:prior,caseIndex:connection.lessonId==="workshop-guide"?prior.cases.length-1:planFor(connection.lessonId).investigation.caseIndex,reuse:reusableCalculation(prior,build)};
  }),lesson:lesson??{title:"Getting started with Botie",href:"/lab/workshop-guide",section:"Start here"},
    history:id==="workshop-guide"?{title:"How Do We Give a Machine a Job?",sources:[],blocks:[
      "Suppose a sensor sends us a reading and we need twice that amount. We know what we want, but the machine still needs instructions. We need to tell it where the reading comes from, what to do with it, and where to send the answer.",
      "Botie's workshop lets us make those instructions visible. A source supplies data, an operation changes or combines it, and a wire carries the result into another operation. The result is where we check whether the whole construction does what we asked.",
      "In the lessons, we will start with the problems people were trying to solve. Botie will introduce the tools they developed, show how the pieces work, and then work through that problem with you in a construction. You will keep using familiar tools as the problems become more involved.",
    ]}:lessonHistories[id as HistoryLessonId],
    tools:keys.map(key=>{const first=labLessons.find(l=>l.id===firstUse[key]);const piece=reference.pieces.find(p=>p.tool===key);const step=trace.steps.find(s=>s.id===piece?.id);return {key,...(first&&first.id!==id&&labLessons.indexOf(first)<at?{earlier:{title:first.title,href:labHref(first.id)}}:firstUse[key]==="workshop-guide"&&id!=="workshop-guide"?{earlier:{title:"The workshop tutorial",href:"/lab/workshop-guide"}}:{}),example:piece&&step?{inputs:step.inputs,settings:piece.settings,output:step.output}:exampleFor(key)};}),
    ...(location?.previous?{previous:workshopLink(location.previous)}:{}),
    ...(location?.next?{next:workshopLink(location.next)}:id==="workshop-guide"?{next:{title:labLessons[0].title,href:labHref(labLessons[0].id)}}:{}),
  };
}
