import supplements from '@/lib/lessons/supplements.json';
import type { ExpandedLesson } from '@/lib/lessons/types';
import type { ConceptSection } from './ConceptPage';
import { Equation } from './Equation';
import { PythonCode, ProgramOutput } from './PythonCode';
import { FrameworkReference } from './FrameworkReference';

type Supplement = Pick<ExpandedLesson, 'parts' | 'practice'> & { checkpoint?: NonNullable<ExpandedLesson['checkpoints']>[number] };
const byId = supplements as Record<string, Supplement>;

// Older authored pages and the generated curriculum share the same content
// format. Keep their original bookmarks while inserting the missing teaching.
export function addLessonSupplement(id: string, sections: ConceptSection[]): ConceptSection[] {
  const extra = byId[id];
  if (!extra) return sections;
  const result = sections.map(section => section.practice ? { ...section, practice: [...section.practice, ...extra.practice] } : section);
  const finalQuiz = result.findLastIndex(section => section.quiz?.length);
  const practice = result.findIndex(section => section.practice?.length);
  const at = finalQuiz >= 0 ? finalQuiz : practice >= 0 ? practice : result.length;
  result.splice(at, 0, ...extra.parts.flatMap(part => [{ title: part.title, content: <>
    {part.paragraphs.map(text => <p key={text}>{text}</p>)}
    {part.calculation && <Equation>{part.calculation}</Equation>}
    {part.interpretation.map(text => <p key={text}>{text}</p>)}
    {part.examples?.map(example => <div key={example.title} className="my-8 min-w-0 space-y-4" data-worked-example>
      <h3 className="text-lg font-semibold text-foreground">{example.title}</h3>
      {example.paragraphs.map(text => <p key={text}>{text}</p>)}
      <PythonCode source={example.code} />
      <ProgramOutput output={example.output} />
      {example.interpretation.map(text => <p key={text}>{text}</p>)}
    </div>)}
    {part.references?.map(reference => <FrameworkReference key={reference.title} reference={reference} />)}
  </> }, ...(extra.checkpoint?.after === part.title ? [{ title: extra.checkpoint.title, quiz: extra.checkpoint.questions }] : [])]));
  return result;
}
