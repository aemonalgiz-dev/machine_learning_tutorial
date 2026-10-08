# oop_ml teaching website

An interactive course in machine learning, built around examples that the
[`oop_ml`](../) library computes through its [API](../api).

The default reading path begins with an everyday problem, introduces the parts
needed to understand it, works through an example, and then develops the
mechanism and its limitations. Every lesson has a section list and a direct
link to its technical material. The three mathematics primers are available
when their ideas become useful.

## Why it is a separate repository

The library, API and website are separate repositories. Visual playgrounds call
the API; coding challenges run Python locally in the reader's browser. The
website is nested inside the library's project
folder for convenience, with its own Git history and remote.

## Stack

Next.js App Router, React, TypeScript and Tailwind. Interactive SVG playgrounds
request calculations from the API and render the returned results.

## Running

Start the API alongside the website:

```bash
# in ../api
.venv/Scripts/uvicorn oop_ml_api.main:app --reload

# here
npm install
npm run dev
```

The site runs at `http://localhost:3000` and the API at
`http://localhost:8000`. See `.env.example` for `NEXT_PUBLIC_API_BASE_URL`.

## Adding or editing a lesson

Read [EDITORIAL.md](EDITORIAL.md) before changing reader-facing content.

Concept lessons live in `app/concepts/<slug>/page.tsx`. `ConceptPage` takes a
specific `openingTitle`, a guided `intuition`, a `playgroundIntro`, a playground,
and ordered sections. Set `technicalStart` to the exact title of an existing
section. Keep prerequisites short and link to background material where needed.

Guided introductions live in `lib/intuition/` and are registered in its index.
Each introduces the problem, follows visible steps through a concrete example,
and connects that example to the later mechanism. Use the scene type suited to
the explanation: text rows, coordinate plots, pixel grids, or bars. Distinguish
assigned illustrations from computed or trained results. The kernel lesson
retains its custom introductory walkthrough through the `history` prop.

A lesson shows one section at a time, chosen by the arrows and the dropdown
at the top of the page and recorded in the address bar, so a link to a section
opens the lesson on it. Revise the introduction, lesson, and widget together
so their terminology and examples agree. Keep all calculations in separate
blocks and never use em dashes.

A section may hold questions instead of prose (`quiz`, built with the helpers
in `lib/quizzes.ts`) or problems to work through with the library (`practice`,
built with the helpers in `lib/exercises.ts`). Both kinds report themselves to
the progress the reader's browser keeps (`lib/progress.ts`), which is what the
marks on the home page and the section pages read. There is no account and
nothing leaves the browser.

Primers use `PrimerPage`, `PrimerSection`, `PrimerQuiz`, `PrimerPractice` and
the same section navigation.

The site is dark by default, with a light theme behind the toggle in the
header. The theme is an attribute on `<html>` that every `dark:` class keys
on, so components are written once with both palettes.
`Equation` renders calculations in a separate block. `WorkedExample`,
`WhyThisWorks` and `KeepInMind` separate examples, optional derivations and
qualifications. Add the lesson to the relevant group in `lib/curriculum.ts`.

The landing page lists course sections rather than every lesson. Each section
has a statically generated page at `/sections/<section-id>` with its own topics
and lesson links. Curriculum data is shared by the overview, section pages,
and lesson breadcrumbs. Explicit section and topic IDs preserve stable links;
old homepage fragments are forwarded to their new section destinations.

## Modern-model lessons

The curriculum includes Large Language Models, Generative Models, and Adapting
and Evaluating Modern Models. Thirteen lessons cover transformer blocks,
next-token learning, generation, sampling, autoencoders, VAEs, GANs, diffusion,
supervised fine-tuning, LoRA, reinforcement learning, RAG, and evaluation.

`ModernLearningExample` uses the typed controls in `lib/concepts/modern-learning.ts`
to call `/concepts/modern/<slug>`. It renders labeled calculation tables and
handles loading, stale responses, API errors, retries, and empty retrieval.
The playground API calls `oop_ml.numpy.modern`; the interface displays its results.
These examples expose individual operations, a small scalar GAN, and a
one-state policy that learns from sampled actions and rewards. The reinforcement
lesson also explains delayed returns, RLHF, and the relationship to LoRA.
The examples do not train full language or image-generation systems.

## Coding challenges

Every lesson and primer has a practice section with a stated challenge, an
editable Python workspace, hints, and a worked solution. The section controls
also provide a direct coding jump. CodeMirror provides editing, indentation,
line numbers and keyboard shortcuts. Drafts and previous passing results are stored
in localStorage, with storage failures handled without disabling the editor.

The three mathematics primers use direct NumPy calculations: readers build
statistics from deviations, matrix operations from weighted sums, and gradient
updates from derivatives. Use oop_ml when applying an already explained model
is the objective. Do not hide the operation being taught behind SDK properties
or a fit call. Local installation instructions follow each exercise's needs.

Run code executes the program. Run tests executes it in a fresh namespace and
then runs Python assertions for successful execution, the number of result
lines, and each expected line's text and numerical values. Whitespace and
rounding at the displayed precision are accepted. These are output tests,
not source-code checks or proof against hard-coded answers. Results show
passed and failed counters, skipped counts when applicable, and individual
assertions with expected/actual values.
Reading a solution does not mark its tests as passed. The existing local course
progress is preserved. Exercises do not use accounts, rewards or locked steps.

Python runs in a dedicated [Pyodide worker](https://pyodide.org/en/stable/usage/webworker.html).
The engine is pinned to 314.0.7. It loads only on Run, downloads NumPy, and
loads the SDK, SciPy and Pydantic only for scripts importing oop_ml. The first
run needs network access to the pinned Pyodide package CDN. User code is never
sent to the compute API. Stop terminates the worker; loading times out after
three minutes, execution after one minute, and each output stream is limited
to 20,000 characters. Variables reset between runs. Python modules and its
temporary filesystem remain in the worker until it is stopped or the reader
leaves the coding section. This is a learning workspace, not a hostile-code
security boundary inside the reader's browser.

`npm run prepare:python` runs before dev/build. It copies the pinned runtime
from node_modules and packages the SDK's core and NumPy Python sources plus
its MIT license. Those source files are intentionally public website assets.
Optional PyTorch/scikit backends, API files, tests, local data, and Git metadata
are excluded. The archive has a SHA-256 manifest checked before importing.
A website-only checkout or Docker build uses the checked-in SDK archive;
set `OOP_ML_SOURCE` to refresh it from another SDK checkout.

`npm run test:practice` runs all reference solutions in the same WebAssembly
Python engine and checks every assertion. A small number of unstable fits,
solver sign choices, and platform representations differ from the original
desktop outputs. `lib/practice-fixtures.json` records measured browser results
for these exercises, keyed by a signature of the starter and solution. To
update them after a deliberate SDK/runtime change, run `npm run record:practice`,
review the generated output changes, and then run `npm run test:practice`.
Never record a failing Python program as a reference output.

## Amplify deployment size

`npm run build` prints a production-size report after the build. Run
`npm run size:build` to measure an existing build again. The report counts
generated server pages, browser assets, public files, manifests and additional
traced runtime dependencies once each. It excludes `.next/dev`, build caches
and unused packages. Amplify's final packaged artifact remains the authoritative
size; its Linux dependencies may differ from a local Windows build.

The shared course navigation is imported by the client navigation components.
Keep it out of root-layout props: passing the whole table there serializes it
into every page's HTML, RSC response and prefetch files. The navigation data
instead belongs in a shared browser bundle that can be cached across lessons.

Production browser, server and prerender source maps are disabled to reduce
deployment size. Production stack traces consequently have less source detail.
Use `next build --debug-prerender` when investigating a prerender error, then
rebuild normally for deployment. Keep the Python runtime and SDK assets: the
browser exercises need them.

See [AWS's build-size troubleshooting guide](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-SSR.html#build-output-too-large)
for inspecting an Amplify artifact when its reported size differs from the
local estimate.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:runner
npm run test:practice
npx playwright install chromium
npm run test:browser
```

For navigation changes, also check a technical jump, a pasted section URL and
browser back/forward navigation. A target inside a collapsed lesson section
must become visible. For content changes, reproduce worked arithmetic and
verify that widget instructions name controls the widget actually provides.
