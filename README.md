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
For a fresh local checkout, copy that example to `.env.development.local`.

## Accounts and saved work

The compute API and account backend are separate services. The compute API
fits the numerical examples. The private [`../backend`](../backend) service
handles sign-in and stores learner work in its database. The website forwards
account requests through `/account-api`; the browser stays on the website's
origin, including during the sign-in callback.

For local development, prepare the backend from its directory:

```powershell
.venv/Scripts/python -m fitlab_backend.local prepare
```

This creates an ignored `.env` with a random session secret and applies the
local SQLite migrations. Existing configuration and data stay in place. Fill
`FITLAB_OIDC_ISSUER`, `FITLAB_OIDC_CLIENT_ID`, and `FITLAB_OIDC_CLIENT_SECRET`
in that backend file using your identity provider's values. For the existing
Cognito pool, also set `FITLAB_COGNITO_DOMAIN` to its HTTPS managed-login
domain, without a path. This enables the direct **Create account** button and
Cognito logout. Keep the app client secret in the backend only. Then run:

```powershell
.venv/Scripts/python -m fitlab_backend.local check
.venv/Scripts/python -m fitlab_backend.local run
```

The local backend listens on `127.0.0.1:8001` and expects the website at
`http://localhost:3000`. Add this line to the website's
`.env.development.local`, then restart the Next.js dev server:

```dotenv
OOP_ML_ACCOUNTS_URL=http://127.0.0.1:8001
```

Use `.env.development.local` for this local address. Next.js also reads
`.env.local` in production, where the account backend must use HTTPS.

Open `/account` and choose **Create account** or **Sign in**. Registration opens
Cognito's signup page using the same authorization-code flow as sign-in,
including state, nonce and PKCE. Cognito handles the password and email
verification. FitLab creates its account after a verified callback, then
returns the learner to `/account` to sync their work.

The Cognito app client must enable the authorization-code grant and the
`openid`, `email` and `profile` scopes. Enable self-service signup in the pool
and configure its email verification and delivery. Register the exact URLs:

| Environment | Callback | Sign-out |
| --- | --- | --- |
| Local | `http://localhost:3000/account-api/auth/callback` | `http://localhost:3000/account` |
| Production | `https://fitlab.dev/account-api/auth/callback` | `https://fitlab.dev/account` |

Use the deployed hostname if it differs from `fitlab.dev`, and configure a
separate development app client when keeping local access separate. The
backend's site origin determines the callback; browser-supplied URLs cannot
override it. Cognito's signup endpoint and its parameters are described in
[the managed-login documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/managed-login-endpoints.html).

Quiz answers, Python drafts,
workshop constructions, journey decisions and notes use the same account sync.
Guest work stays separate until the learner chooses to import it. Leaving the
URL unset or empty keeps guest learning available.

Run `npm run check:backend -- --site http://localhost:3000` with the services
running to check backend health, its session response, and the website's
account proxy. For production configuration, use
`npm run check:backend -- --production --site https://fitlab.dev`. Run
`npm run test:backend` for the runtime configuration, proxy and backend
integration contracts. The real-service tests require the private backend
checkout and its development dependencies. Set `FITLAB_BACKEND_PATH` and
`FITLAB_BACKEND_PYTHON` when they are outside the default sibling checkout.
Those tests start a disposable database and test identity provider; they do
not change real accounts. They check signup redirects, callback validation
and restored work, but cannot verify the live Cognito pool's email delivery
or registration settings. These checks do not deploy services.

For Amplify, deploy and configure the backend first. Set
`OOP_ML_ACCOUNTS_URL` in the website app's Amplify environment variables to the
backend's HTTPS service URL, without credentials, a query or a fragment. Set
the backend's `FITLAB_SITE_ORIGIN` to the exact website origin, for example
`https://fitlab.dev`, and register
`https://fitlab.dev/account-api/auth/callback` with the identity provider.
Keep the backend's database URL, session secret and OIDC credentials in the
backend deployment only.

Keep the production compute API setting (`NEXT_PUBLIC_API_BASE_URL`, and
`OOP_ML_API_URL` when using the `/backend` rewrite) separate from the account
URL. Preserve the existing deployed compute address when adding accounts.
The localhost values in `.env.example` are only for development.

The checked-in `amplify.yml` runs the existing npm build pipeline and
`scripts/prepare-account-runtime.mjs` before building. The script writes only
the account service URL to `.env.production`, preserving other existing
settings. This follows [Amplify's server runtime environment setup](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-environment-variables.html).
Amplify build variables alone do not make the URL available to the Next.js
server. Removing the variable and rebuilding writes an empty value so a
previous service URL cannot remain in that generated file. A configured
non-HTTPS URL fails the production preparation step. Redeploy after changing
the URL; the script does not provision or deploy the backend.

Before enabling accounts on the main branch, check `/account-api/session`
and complete a sign-in on an Amplify preview branch with its own matching
backend site origin and identity-provider callback. The repository uses
Next.js 16.3.3; [Amplify's published Next.js support page](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html)
currently lists versions through 15. A local build does not establish hosting
compatibility for the account routes.

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
marks on the home page and the section pages read. Guests keep progress in
their browser. Signed-in readers sync their work through the independent
private `../backend` repository; the account page offers an explicit guest
work import. `lib/learner-state.ts` stores quiz answers, Python drafts/results,
Botie journeys and constructions, experiment inputs, and preferences. Each
activity has its own server revision and an account-scoped offline cache.
Conflicting device edits are preserved for an explicit choice on `/account`.
New activities should use `useLearnerRecord` and `useLearnerField`, with a
stable, versioned key; write on user edits, never on mounting default values.
Keep timers, pointer gestures and active code execution outside saved records.

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
progress is preserved. Sign-in is optional; exercises have no locked steps.

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
