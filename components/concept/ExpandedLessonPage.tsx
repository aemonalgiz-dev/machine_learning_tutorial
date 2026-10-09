import Link from "next/link";
import { ConceptPage } from "./ConceptPage";
import { Equation } from "./Equation";
import { PythonCode, ProgramOutput } from "./PythonCode";
import { LessonExperiment } from "../lab/LessonExperiment";
import { story, step, strips } from "@/lib/intuition/types";
import { expandedLessonById } from "@/lib/lessons";
import { buildById } from "@/lib/builds/catalog";

export function ExpandedLessonPage({ id }: { id: string }) {
  const lesson = expandedLessonById[id];
  const intuition = story(lesson.opening, lesson.intuition.map(item => step(item.title, item.explanation,
    item.scene ?? strips("An invented example for this lesson.", item.rows))), "What we can now calculate", [lesson.build.why]);
  return <ConceptPage lessonId={lesson.id} title={lesson.title} tagline={lesson.blurb}
    openingTitle={lesson.openingTitle} intuition={intuition} technicalStart={lesson.parts[1].title}
    prerequisites={<>{lesson.prerequisites.map((item, i) => <span key={item.href}>{i > 0 && ", "}<Link href={item.href}>{item.title}</Link></span>)}.</>}
    playgroundIntro="Choose an example, then change a value. Follow the calculation below to see which result changes and why. These are small teaching examples; the construction later asks you to choose the operations yourself."
    playground={<LessonExperiment build={buildById[id]} />}
    sections={[
      ...lesson.parts.map((part, index) => ({ title: part.title, content: <>
        {part.paragraphs.map(text => <p key={text}>{text}</p>)}
        {part.calculation && <Equation>{part.calculation}</Equation>}
        {part.interpretation.map(text => <p key={text}>{text}</p>)}
        {part.examples?.map(example => <div key={example.title} className="my-8 min-w-0 space-y-4" data-worked-example>
          <h3 className="mb-3 text-lg font-semibold text-foreground">{example.title}</h3>
          {example.paragraphs.map(text => <p key={text}>{text}</p>)}
          <PythonCode source={example.code} />
          <ProgramOutput output={example.output} />
          {example.interpretation.map(text => <p key={text}>{text}</p>)}
        </div>)}
        {index === lesson.parts.length - 1 && lesson.appliedIn?.length && <aside className="mt-8 rounded-lg border border-line bg-surface p-4 text-sm">
          <p className="font-semibold text-foreground">Where you will use this</p>
          <p className="mt-2">These operations return in {lesson.appliedIn.map((item, i) => <span key={item.href}>{i > 0 && ", "}<Link className="text-accent underline underline-offset-4" href={item.href}>{item.title}</Link></span>)}.</p>
        </aside>}
      </> })),
      { title: `Questions on Parts 1 to ${lesson.parts.length}`, quiz: lesson.quiz },
      { title: "Practice. Work Through the Problem With NumPy", practice: lesson.practice },
    ]} />;
}
