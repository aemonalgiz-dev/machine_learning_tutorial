import { part, exercise } from './authoring.mjs';

export const section = (title, explanation, calculation = null, interpretation = '') => part(title, explanation, calculation, interpretation);
export const question = (description, prompt, options, answer, because) => ({kind:'choice',given:{description:'Use this setup.',data:description},prompt,options,answer,because});
export function functionTask(title, task, setup, signature, body, demo, output, hints, tests) {
  return {...exercise(title, task, `${setup}\n\n${signature}\n    # Write the procedure here.\n    raise NotImplementedError\n\n${demo}`, `${setup}\n\n${signature}\n${body}\n\n${demo}`, output, hints),tests:tests.map(([name,code])=>({name,code}))};
}
export function appendParts(lesson, parts) {
  lesson.parts.push(...parts.map((entry,i)=>({...entry,title:`${lesson.parts.length+i+1}. ${entry.title}`})));
}
export function insertBefore(lesson,index,parts) {
  // Existing fragment IDs survive when earlier teaching steps are inserted.
  const slug=title=>title.toLowerCase().replace(/['’]/g,'').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  lesson.parts.forEach(p=>{p.id??=slug(p.title);});
  lesson.parts.splice(index,0,...parts);
  lesson.parts=lesson.parts.map((p,i)=>({...p,title:`${i+1}. ${p.title.replace(/^\d+\.\s*/, '')}`}));
}
