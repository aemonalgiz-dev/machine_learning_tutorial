// Checks a reader can answer from the section they have just read.
//
// A question belongs to a section only when that section makes a claim worth
// checking. A section that sets up a problem, or that exists to show a picture,
// has nothing to ask yet, and a question there tests reading comprehension
// rather than understanding. So a quiz is an optional field and most sections
// will not carry one.
//
// Every question carries the reason its answer is right, shown once the reader
// has committed to an answer. The reason is the teaching; the mark is only what
// makes the reader commit first, which is what makes the reason land.
//
// Three shapes, because they test different things. A claim that sounds
// plausible and is false is a true-or-false question, and it is the shape that
// catches a reader who has learned the words without the idea. A question with
// one right answer among several defensible ones is a choice. A question where
// more than one option holds asks the reader to decide about each of them
// separately, which is harder and is the right shape for properties that travel
// in groups.

export type QuizQuestion =
  | { kind: "trueFalse"; prompt: string; answer: boolean; because: string }
  | { kind: "choice"; prompt: string; options: string[]; answer: number; because: string }
  | { kind: "several"; prompt: string; options: string[]; answers: number[]; because: string };

/** A claim the reader marks true or false. */
export const trueFalse = (prompt: string, answer: boolean, because: string): QuizQuestion => ({
  kind: "trueFalse",
  prompt,
  answer,
  because,
});

/** One right answer among several. The answer is the index into options. */
export const choice = (
  prompt: string,
  options: string[],
  answer: number,
  because: string,
): QuizQuestion => ({ kind: "choice", prompt, options, answer, because });

/** Every option is a separate decision. The answers are indices into options. */
export const several = (
  prompt: string,
  options: string[],
  answers: number[],
  because: string,
): QuizQuestion => ({ kind: "several", prompt, options, answers: [...answers].sort(), because });

export function isCorrect(question: QuizQuestion, given: number[]): boolean {
  switch (question.kind) {
    case "trueFalse":
      return given.length === 1 && given[0] === (question.answer ? 1 : 0);
    case "choice":
      return given.length === 1 && given[0] === question.answer;
    case "several":
      return (
        given.length === question.answers.length &&
        [...given].sort().every((value, index) => value === question.answers[index])
      );
  }
}

export function optionsFor(question: QuizQuestion): string[] {
  return question.kind === "trueFalse" ? ["False", "True"] : question.options;
}

export function answersOf(question: QuizQuestion): number[] {
  switch (question.kind) {
    case "trueFalse":
      return [question.answer ? 1 : 0];
    case "choice":
      return [question.answer];
    case "several":
      return question.answers;
  }
}

// The order the options are shown in.
//
// Writing the right answer first is the natural way to author a question, and
// across the site it had been written first four times in five, which a reader
// notices by the third question. So the options are dealt into an order fixed
// by the prompt rather than shown as written. Fixed by the prompt, so that the
// same question is in the same order on every visit and for every reader, and
// a question two people discuss is the same question for both of them. True
// and false keep their places, since a pair has no order to hide an answer in.
//
// `order[shown]` is the index, as written, of the option shown in that place.
export interface Arrangement {
  options: string[];
  order: number[];
}

export function arranged(question: QuizQuestion): Arrangement {
  const options = optionsFor(question);
  if (question.kind === "trueFalse") return { options, order: [0, 1] };

  const order = options.map((_, index) => index);
  const next = seededFrom(question.prompt);
  for (let at = order.length - 1; at > 0; at--) {
    const swap = Math.floor(next() * (at + 1));
    [order[at], order[swap]] = [order[swap], order[at]];
  }
  return { options: order.map((index) => options[index]), order };
}

// A small deterministic generator seeded from a string, so the arrangement is
// a pure function of the prompt. FNV-1a for the seed, mulberry32 for the draws.
function seededFrom(text: string): () => number {
  let hash = 0x811c9dc5;
  for (let at = 0; at < text.length; at++) {
    hash ^= text.charCodeAt(at);
    hash = Math.imul(hash, 0x01000193);
  }
  let state = hash >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
