# oop_ml teaching website

An interactive course in machine learning, built around examples that the
[`oop_ml`](../) library computes through its [API](../api).

The default reading path begins with an everyday problem, introduces the parts
needed to understand it, works through an example, and then develops the
mechanism and its limitations. Every lesson has a section list and a direct
link to its technical material. The three mathematics primers are available
when their ideas become useful.

## Why it is a separate repository

The library, API and website are separate repositories. The site calls the API
and never imports the Python library. It is nested inside the library's project
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
The API calls `oop_ml.numpy.modern`; the website performs no model arithmetic.
These examples expose individual operations, a small scalar GAN, and a
one-state policy that learns from sampled actions and rewards. The reinforcement
lesson also explains delayed returns, RLHF, and the relationship to LoRA.
The examples do not train full language or image-generation systems.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```

For navigation changes, also check a technical jump, a pasted section URL and
browser back/forward navigation. A target inside a collapsed lesson section
must become visible. For content changes, reproduce worked arithmetic and
verify that widget instructions name controls the widget actually provides.
