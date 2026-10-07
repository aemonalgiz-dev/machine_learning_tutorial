import type { LessonProgression } from "@/lib/lesson-progressions";

// The motivation and the procedure are deliberately separate. The first is read
// before operating the example; the second introduces the detailed walkthrough.
export function LessonMotivation({ lesson }: { lesson: LessonProgression }) {
  return <>
    {lesson.problem.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <p>{lesson.bridge}</p>
    <ol className="list-decimal space-y-2 pl-6">
      {lesson.parts.map(([name, explanation]) => <li key={name}><strong>{name}:</strong> {explanation}</li>)}
    </ol>
  </>;
}

export function LessonProcedure({ lesson }: { lesson: LessonProgression }) {
  return <div className="space-y-4">
    <p>{lesson.start}</p>
    {lesson.steps.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <p>{lesson.result}</p>
  </div>;
}
