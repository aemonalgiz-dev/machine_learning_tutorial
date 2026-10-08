import type { LessonHistory } from "@/lib/history/types";
import { BotieSays } from "@/components/site/Botie";

export function HistoricalContext({ lesson }: { lesson: LessonHistory }) {
  return (
    <div data-lesson-history className="space-y-5">
      {lesson.blocks.map((block, index) =>
        typeof block === "string" ? (
          index === 0 ? <BotieSays key={index}>{block}</BotieSays> : <p key={index}>{block}</p>
        ) : (
          <ol key={index} className="list-decimal space-y-4 pl-6">
            {block.items.map(({ name, explanation }) => (
              <li key={name}>
                <strong className="text-foreground">{name}.</strong>{" "}
                {explanation}
              </li>
            ))}
          </ol>
        ),
      )}
      <details className="rounded-lg border border-line bg-surface px-5 py-4 text-sm">
        <summary className="cursor-pointer font-medium text-foreground">
          Sources for this history
        </summary>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {lesson.sources.map(({ title, url }) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">
                {title}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
