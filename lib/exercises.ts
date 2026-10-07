// Problems a reader works through with the library, away from the page.
//
// A quiz checks that a claim landed. A problem checks something different,
// which is whether the reader can make the method do the thing the lesson
// described, on numbers of their own, and read what comes back. So a problem
// is a task, a script to start from, the finished script, and what the
// finished script prints. The reader runs their own version and compares.
//
// Every output recorded here was produced by running the solution against the
// library, not written by hand, and the tool that inserts a problem into a
// lesson refuses one whose solution it could not run. A problem may also name
// one number its script arrives at, which the page can check for the reader
// without their having to show anyone the code.

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
  extras: { hints?: string[]; check?: NumberCheck } = {},
): Exercise => ({ title, task, starter, solution, output, ...extras });

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
