import { Equation } from "./Equation";

export function InlineCodeText({ text }: { text: string }) {
  return <>{text.split(/(`[^`\r\n]+`)/g).map((part, index) =>
    index % 2 ? <code key={index} className="rounded bg-background px-1 font-mono text-[0.9em] [overflow-wrap:anywhere]">{part.slice(1, -1)}</code> : part)}</>;
}

// Authored feedback can separate a calculation from its surrounding prose.
// These fences are display text, never executable code or HTML.
export function FeedbackExplanation({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.split(/(```(?:text|math)?\r?\n[\s\S]*?\r?\n```)/g);
  return <div className={`min-w-0 ${className}`}>
    {blocks.flatMap((block, index) => {
      const calculation = block.match(/^```(?:text|math)?\r?\n([\s\S]*?)\r?\n```$/);
      if (calculation) return [<Equation key={`calculation-${index}`}>{calculation[1]}</Equation>];
      return block.trim().split(/\r?\n[\t ]*\r?\n/).filter(Boolean).map((paragraph, part) =>
        <p key={`paragraph-${index}-${part}`} className="mt-2 first:mt-0"><InlineCodeText text={paragraph} /></p>);
    })}
  </div>;
}
