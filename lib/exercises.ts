// Challenges worked in the lesson's browser-based Python workspace.
//
// A quiz checks that a claim landed. A problem checks something different,
// which is whether the reader can make the method do the thing the lesson
// described, on numbers of their own, and read what comes back. So a problem
// is a task, a script to start from, the finished script, and what the
// finished script prints. The reader writes, runs and checks their own version.
//
// Outputs come from executed solutions. The browser runtime's measured
// differences are stored with a source signature in practice-fixtures.json.
// A problem may also explain one number once its Python tests have passed.

import fixtures from "./practice-fixtures.json";
import { browserOutput } from "./practice-fixtures.mjs";

export interface NumberCheck {
  // The question the number answers, such as "What slope does the fit report?"
  prompt: string;
  answer: number;
  // Half the width of the band an answer is accepted in. Rounding to the
  // places the task asked for should land inside it.
  tolerance: number;
  // Why that is the number, shown once the reader has one of their own.
  because: string;
}

export interface Exercise {
  title: string;
  // Override when turning an imperative title into a question would be awkward.
  question?: string;
  browserNote?: string;
  // Paragraphs. The first says what to do; later ones say what to look for.
  task: string[];
  starter: string;
  // Shown one at a time, on request, before the solution.
  hints?: string[];
  solution: string;
  output: string;
  check?: NumberCheck;
}

export const exercise = (
  title: string,
  task: string[],
  starter: string,
  solution: string,
  output: string,
  extras: { hints?: string[]; check?: NumberCheck; question?: string } = {},
): Exercise => {
  const problem = { title, task, starter, solution, output, ...extras };
  const measured = browserOutput(problem, fixtures);
  return {
    ...problem,
    output: measured,
    // The stored explanatory number belongs to the original desktop run.
    check: measured === output ? extras.check : undefined,
    browserNote: measured === output ? undefined : "These expected results were measured in the browser's Python environment. Solver choices and floating-point rounding can change the last digits, eigenvector signs, or the path of an unstable fit compared with a desktop run.",
  };
};

const challengeQuestions: Record<string, string> = {
  "Four vectors against three entries": "Which of the three entries should represent each vector?",
  "One draw, and then four hundred": "What does one dropout draw tell us, and what changes over four hundred?",
  "Five rulers on five readings, then on an outlier": "How do five scaling rules treat the same readings and an outlier?",
  "The same six hundred vectors at three scales": "What changes when we quantise the same six hundred vectors at three scales?",
  "The seventy-two words on the thousand-code grid": "Where do the seventy-two words land on a thousand-code grid?",
  "The honest score, and the score that wears its name": "Does the winning search score hold up on rows the search never saw?",
  "Three searches that cannot run": "Can you find why these three searches cannot run?",
  "Three routes against a nudge": "Do all three gradient calculations agree with a small nudge?",
  "One row, three layers": "What do the three normalisation layers do with one row?",
  "Two sentences, one run of numbers, and a table that refuses": "Can two different sentences produce the same run of token IDs?",
  "Writing that separates the two rules, in both directions": "Can you find text that separates the two boundary rules in both directions?",
};

export function challengeQuestion(problem: Exercise): string {
  if (problem.question) return problem.question;
  if (challengeQuestions[problem.title]) return challengeQuestions[problem.title];
  if (problem.title.endsWith("?")) return problem.title;
  return `How would you ${problem.title.charAt(0).toLowerCase()}${problem.title.slice(1)}?`;
}

export const numberCheck = (
  prompt: string,
  answer: number,
  tolerance: number,
  because: string,
): NumberCheck => ({ prompt, answer, tolerance, because });

export function withinTolerance(check: NumberCheck, given: number): boolean {
  return Number.isFinite(given) && Math.abs(given - check.answer) <= check.tolerance;
}

// What a reader needs before the first problem, once per site rather than once
// per lesson. The library is installed from its repository, into an
// environment of the reader's own.
export const SETUP_COMMANDS = `git clone https://github.com/aemonalgiz-dev/oop_ml.git
cd oop_ml
python -m venv .venv
.venv\\Scripts\\activate        # on macOS or Linux: source .venv/bin/activate
pip install -e .`;

export const NUMPY_SETUP_COMMANDS = `python -m venv .venv
.venv\\Scripts\\activate        # on macOS or Linux: source .venv/bin/activate
python -m pip install numpy`;
