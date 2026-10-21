import Link from "next/link";
import { ConceptPage } from "./ConceptPage";
import { Equation } from "./Equation";
import { PythonCode, ProgramOutput } from "./PythonCode";
import { LessonExperiment } from "../lab/LessonExperiment";
import { story, step, strips } from "@/lib/intuition/types";
import { expandedLessonById } from "@/lib/lessons";
import { buildById } from "@/lib/builds/catalog";
import { GaussianProcessExperiment } from "../widgets/GaussianProcessExperiment";
import { FrameworkReference } from "./FrameworkReference";
import { SqlData } from "./SqlData";

export function ExpandedLessonPage({ id }: { id: string }) {
  const lesson = expandedLessonById[id];
  const intuition = { ...story(lesson.opening, lesson.intuition.map(item => step(item.title, item.explanation,
    item.scene ?? strips("An invented example for this lesson.", item.rows))), lesson.reading.connectionTitle, [lesson.build.why]),
    exampleNote: lesson.reading.exampleNote };
  return <ConceptPage lessonId={lesson.id} title={lesson.title} tagline={lesson.blurb}
    openingTitle={lesson.openingTitle} intuition={intuition} technicalStart={lesson.technicalStart ?? (lesson.parts[1] ?? lesson.parts[0]).title}
    prerequisites={<>{lesson.prerequisites.map((item, i) => <span key={item.href}>{i > 0 && ", "}<Link href={item.href}>{item.title}</Link></span>)}.</>}
    playgroundTitle={lesson.reading.experimentTitle}
    playgroundIntro={lesson.reading.experimentIntro}
    playground={id==="gaussian-process-regression"?<GaussianProcessExperiment/>:<LessonExperiment build={buildById[id]} outputLabel={lesson.reading.outputLabel} />}
    sections={[
      ...lesson.parts.flatMap((part, index) => [{ title: part.title, id: part.id, content: <>
        {part.paragraphs.map(text => <p key={text}>{text}</p>)}
        {part.calculation && <Equation>{part.calculation}</Equation>}
        {part.interpretation.map(text => <p key={text}>{text}</p>)}
        {part.examples?.map(example => <div key={example.title} className="my-8 min-w-0 space-y-4" data-worked-example>
          <h3 className="mb-3 text-lg font-semibold text-foreground">{example.title}</h3>
          {example.paragraphs.map(text => <p key={text}>{text}</p>)}
          {example.language === "sql" && <>
            <SqlData tables={example.tables ?? []} />
            <details><summary className="cursor-pointer text-sm text-accent">Database setup for this example</summary><PythonCode source={example.setup ?? ''} language="sql" /></details>
          </>}
          <PythonCode source={example.code} language={example.language} />
          {example.resultTable ? <SqlData tables={[example.resultTable]} label="Worked query result" /> : <ProgramOutput output={example.output} />}
          {example.interpretation.map(text => <p key={text}>{text}</p>)}
        </div>)}
        {part.references?.map(reference => <FrameworkReference key={reference.title} reference={reference} />)}
        {index === lesson.parts.length - 1 && lesson.appliedIn?.length && <aside className="mt-8 rounded-lg border border-line bg-surface p-4 text-sm">
          <p className="font-semibold text-foreground">Continue with {lesson.appliedIn.map((item, i) => <span key={item.href}>{i > 0 && ", "}<Link className="text-accent underline underline-offset-4" href={item.href}>{item.title}</Link></span>)}</p>
        </aside>}
      </> }, ...(lesson.checkpoints ?? []).filter(checkpoint=>checkpoint.after===part.title).map(checkpoint=>({title:checkpoint.title,quiz:checkpoint.questions}))]),
      { title: `Questions on Parts 1 to ${lesson.parts.length}`, id: lesson.quizId, quiz: lesson.quiz },
      { title: lesson.reading.practiceTitle, id: lesson.section === "SQL" ? "practice-write-the-query" : ["NoSQL", "Graph Databases"].includes(lesson.section) ? "practice" : "practice-work-through-the-problem-with-numpy", practice: lesson.practice },
    ]} />;
}
