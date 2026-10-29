# Editorial guide

## Learning areas and navigation

The homepage links to learning areas. Each area contains sections, and each
section contains lessons. Mathematics and Programming appears first. Databases
is a separate learning area for SQL, NoSQL and graph databases. Keep
section and lesson URLs stable when changing their place in the navigation.
Register each section once in `lib/learning-areas.ts`; other areas should link
to shared prerequisites instead of copying their lessons. Subject groups help
readers browse, while adjacent lesson links retain the curriculum order inside
the current learning area. Mark areas without published lessons as being in
preparation. Run the navigation contracts in `tests/learning-areas.spec.ts`
when adding or moving sections.

Learning-area pages open with a short description followed by the section cards.
Avoid repeated "with Botie" buttons and a second navigation menu that repeats
those cards. Use group headings only when they distinguish several sections.

## Writing the lessons

Additional paid practice belongs in `/practice`, separate from the existing
free course and Botie journey. The extra quizzes, programming challenges and
workshops require a verified Practice subscription. The main course and its
existing exercises remain public. Free accounts save progress and drafts through
the same backend without purchasing a subscription. Describe generated cases
as variations of an authored problem, not as separately written lessons. Each
case must supply its data, and the programming and construction checks must
include changed inputs. A larger count is useful only when learners still have
a clear problem, an explanation of mistakes, and a way to test their reasoning.

The site teaches novice and technical readers in the author's direct,
example-led voice. These rules reflect the author's stated preferences.

Write as someone who enjoys working out how these methods work and wants the
reader to be able to work them out too. Let that interest show through a useful
question, an observation about the example, or a patient explanation. Do not
manufacture excitement with claims about an idea's importance. Do not invent
personal experiences, add deliberate mistakes, or remove qualifications to
make the writing sound casual. Accuracy and depth still come first.

Keep the example consistent between the opening, diagram, live widget and
worked calculation. State explicitly when a later example changes its data or
setting. Technical names need a concrete operation or observation beside their
first explanation. Medium articles can inform pacing and presentation; check
technical claims against primary sources and do not copy another author's text
or describe an explanation as highly rated without verifiable evidence.

Avoid rhetorical contrasts such as "not just X, but Y", polished slogans,
decorative metaphors and anonymous appeals to experts. Prefer ordinary verbs
to "serves as", "underscores" or "exemplifies". Omit stock transitions such as
"Furthermore", "Crucially" and "In summary". Let the next sentence explain
the actual connection. Do not arrange explanations into triplets for rhythm;
a method that really has three components should still explain all three.

Paragraphs can have different lengths. A short observation or a question can
stand on its own when the reader has enough context. Use lists for things the
reader needs to compare or follow, not as a default prose template. Keep
headings specific to what the reader is trying to understand. Finish an
explanation with what its result means or the question it leaves us, without
adding a ceremonial conclusion. Preserve existing heading IDs and links.

The explanation should answer a chain of questions: Why do we care about this
problem? What information or operation are we missing? What are the fundamental
components of the proposed solution? How do we use them, one step at a time?
What does the result tell us? Only then move into the full mathematical treatment.
This applies to lesson bodies and widget explanations as well as introductions.

Section introductions, topic summaries, and lesson descriptions need the same
care. Establish the problem and why it matters before naming the method or its
operations. Avoid reducing a description to a list of commands such as
"Build..., compare..., inspect...". Use the space needed to connect the ideas,
and keep lesson headers and metadata consistent with the course descriptions.

The author's token example starts with "How Can Our Models Read Language?",
explains why readable text needs another representation for numerical models,
then maps a familiar word such as `cat` to an illustrative ID such as `103`.
Word parts are introduced as a possibility whose purpose will be explained
later. Follow that pace: establish the need before naming the machinery, and
do not compress several unfamiliar concepts into the first paragraph.

The kernel-trick visual walkthrough is the accepted model for lesson pacing.
Before equations or a full model control panel, give the reader a concrete
picture of the problem. Follow the same observations through a small number
of visible changes, explain why each change helps, and interpret the result.
Only then name and calculate the mechanism. Use a representation appropriate
to the topic: coordinate diagrams, text pieces, image grids, data rows, or
information flowing between components. Do not force every idea into geometry.
Keep hand-built illustrations clearly distinct from trained model results.

Guided examples should read naturally from top to bottom. Keep an optional
one-step view, with named steps, for readers who want to pause. Do not make a
row of numbered buttons the only way to discover the explanation.

Keep data beside what it describes. Pair words with their IDs, observations
with their predictions, and matrix entries with named rows and columns. Show
time passing on a timeline, including which measurements are still unavailable.
Use a shared scale when comparing positions or spreads. Draw connected objects
when teaching graphs, and show actual pixel arrangements when teaching images.
Avoid disconnected number chips or separate lists that readers must mentally
zip together. Equal list lengths alone do not imply a correspondence.

The shared presentation rules live in `lib/intuition/presentation.ts` and apply
to both the older lessons and generated curriculum. New content can supply an
explicit `Scene` in its authoring module. Such a scene takes precedence over a
legacy row presentation. Check named axes, observation alignment, information
boundaries, and narrow-screen reading in `tests/intuition-reading.spec.ts` when
changing a demonstration. Plain explanatory lists are appropriate for distinct
roles or choices; they should not stand in for a calculation or diagram.

Headings and experiment prompts should name the question, data or operation
specific to the lesson. Avoid labels such as "the measured five", "the worked
matrix", "Explore the full example" and "What we can now calculate". A preset
should say what it loads or changes. Keep ordinary controls and mathematical
terminology consistent; novelty is not a reason to rename a familiar operation.

Routine qualifications belong in the explanation. Give a callout an explicit,
informative title only when a particular pitfall needs emphasis. Optional
derivations need titles that say what they derive. Let the number of visual
steps follow the idea instead of filling a fixed outline. A complete teaching
program must differ from the later challenge solution: demonstrate a component,
use another case, or leave the learner a further operation to work out. Preserve
existing fragment IDs when changing section titles.

- Never use em dashes in authored content, including headings, captions,
  metadata, labels and documentation.
- Open with a concrete problem and a heading specific to it. Do not reuse
  "Where This Came From" as a template heading.
- Every lesson has a historical opening in `lib/history/`, selected by its
  `lessonId`. Start with the problem people faced, explain the documented
  contribution, then give an intuitive account of why it helps. Link primary
  sources. Distinguish an influential example from an invention or priority
  claim, and distinguish the original method from this site's teaching variant.
  A description of a current API alone is insufficient historical context.
  Explain what a platform or library is before asking readers to use its
  interfaces, including how it relates to the other tools in that lesson.
  Trace a feature to documented developments without inventing a separate
  origin date for every command or routine.
  Use topic-specific headings and preserve the existing section and practice
  links when adding history. Dates and names should support the explanation,
  not replace it.
- Introduce components before combining them. For a neuron, explain weights,
  bias and activation individually before calculating a score and output.
- Explain what an operation does and why it matters. Do not use "bend" as
  shorthand for an activation or for nonlinearity. Name the function, the
  changing slope, the curved relationship or the piecewise-linear regions.
- Keep performed calculations out of prose. Introduce their inputs in words,
  show the arithmetic in `Equation`, a code block or a dedicated calculation
  table, then interpret the result. This also applies to captions and live
  widget explanations. A reported value or an input setting may stay in prose.
- Use parentheses to make grouping unambiguous. Show intermediate steps when
  they teach the operation. Use approximate equality for rounded results and
  distinguish rounded displayed inputs from full-precision calculations.
- Follow an example with its mechanism, then derivations, limitations and
  implementation details. Move a technical detour later if it interrupts the
  first complete example. Keep mathematical primers available on demand.
- Provide an exact `technicalStart` section title and a useful section list.
  The lesson title appears above the content. Bottom navigation moves between
  pages, reaching the previous lesson's last page or the next lesson's first
  page at the boundaries. The footer's Lesson contents menu includes a page
  selector and workshop and coding shortcuts. Titles must stand on their own
  in that list. Preserve section links and update numbered references when
  reordering.
- Quiz sections sit beside the parts they draw on and are titled for them,
  `Questions on Parts 3 to 5`, which is also how the page finds the parts to
  offer after a wrong answer. Test concepts already explained. A fresh example
  must include every value, label and assumption needed to answer it on its card.
  Options are dealt in a fixed shuffled order, so an
  explanation names an option by its content, never by its position. Aim for
  roughly half of true-or-false claims to be true, and vary how many options
  of a `several` question hold.
- A question must supply the data and assumptions needed to answer it on its
  own card. If it refers to an array, table, graph, ordering or rule from an
  earlier section, repeat that setup beside the question in a labelled block.
  Do not make readers remember which observation occupied which position.
  Show inputs and the operation being asked about without revealing its result.
- Botie delivers quiz feedback and the closing summary. State whether the
  answer is correct, explain why, and offer relevant lesson sections after a
  mistake. Keep the tone helpful and preserve the question's full explanation.
- A practice section comes last, titled `Practice. ...` in the register of
  the part titles, and holds the problems needed to apply and investigate the method, worked in Python with
  NumPy or oop_ml. In mathematical and model lessons, this is where the library's
  classes and methods belong. In Python and NumPy lessons, teach the relevant
  data structures and syntax before practice: explain why the example needs
  them, show a small complete program, show its output separately, and explain
  what each result means. Introduce creation, access, shape and data type before
  combining operations. Do not assume a list and an array behave alike. Run
  these worked examples in browser Python as well as the challenge solutions.
  Every output shown is what the solution printed when
  it was run, and every number a problem checks is one the solution prints.
  At least one problem per lesson asks for a number the lesson itself does
  not quote.
- Coding challenges state a concrete question in the lesson's voice, followed
  by the information needed to solve it and then an editable Python workspace.
  Keep practice after the explanation it depends on. Use NumPy for direct
  calculations. When the operation itself is what the reader needs to learn,
  have them implement its steps with NumPy arrays, arithmetic and reductions.
  In the mathematics primers, calculate statistics, vector operations and
  gradient updates directly rather than reading them from model properties.
  Use oop_ml when applying an already explained model is the challenge and
  its internal operations are not the learning objective.
  A reader can jump directly to coding from the section controls.
- Botie gives the programming challenge hints. Reveal the existing guidance
  one hint at a time when asked, keeping earlier hints available to revisit.
- Every coding challenge has runnable Python tests. State the required output
  clearly, expose expected and actual results, and allow rounding at the stated
  precision. Test the meaningful result, not one spelling of the solution.
  Report test results as feedback on the work. Do not add rewards, achievement
  language or locked steps. Viewing a solution does not mark tests as passed.
  Run reference solutions in browser Python before publishing.
  When a challenge asks for a reusable procedure, declare the function's inputs,
  outputs and failure behaviour, then test it on additional inputs. Do not use
  printed example results alone to establish that a function generalises.
- SQL lessons use an SQL editor and a fresh in-memory SQLite database for each
  run. Show the starting tables beside the question and display query results
  as a table. Explain the dialect used, and separate PostgreSQL examples from
  queries the browser can execute. Test query behaviour on changed records as
  well as the displayed example. A Python test harness may verify the results,
  but readers should write SQL when SQL is the operation being taught.
- NoSQL and graph lessons distinguish local teaching models from database
  services. Use runnable Python to expose record operations, traversal and
  distributed-state reasoning. Give MongoDB, Redis, Cassandra, DynamoDB, Cypher
  and SPARQL examples their real syntax, documented behaviour and explicit
  setup requirements. Do not present a homemade subset parser as one of those
  databases. State which guarantees an offline model cannot establish. Graph
  diagrams show relationship direction and type; a record table remains
  available when the underlying properties matter.
- Do not target a fixed number of pages, intuition stages or challenges. Keep
  the reading controls consistent while giving each idea the space it needs.
  A topic is ready when the learner can explain its components, carry out a
  complete procedure and investigate a case where its assumptions fail.
  Quiz explanations remain visible until the reader chooses to continue.
- Botie's journey connects a construction to its historical problem and lets
  the reader try each component as it becomes useful. Embed the workshop after the
  explanation it depends on and before Python practice. State the objective before the controls, calculate
  feedback from the actual settings, and show both actual and required results.
  Keep hints, worked setups, explanations and Python accessible without locks.
  Botie responds to the experiment and helps the reader inspect a mistake.
  Separate a manually controlled demonstration from an algorithm that trains.
  Explain what the toy example leaves out. Preserve reduced-motion support.
  Prefer manipulating the objects involved in the problem: placing a machine,
  connecting an input, moving a part, or changing a route. Introduce one new
  component at a time. The workshop guide teaches placing, configuring, wiring
  and testing. A learner's first independent construction starts with an empty
  floor; a later challenge can reuse their own tested pieces. The learner chooses
  components and their arrangement. Later lessons reuse earlier tools, with
  links back to their introductions. Keep the whole journey freely accessible.
  Make the effect visible where it happens, and let the reader pause and follow
  an example through each operation. A factory or circuit should calculate
  from the reader's construction and accept different working arrangements.
  Keep the connection between the game objects and the lesson's actual method
  explicit. A control panel followed by a score is not enough on its own.
  Continue the problem introduced in the history through the workshop's inputs,
  objective and explanation. City records should remain city records, light
  sensors should remain light sensors, and text should remain text. Do not
  replace a lesson's setting with unrelated boxes or deliveries to fit a game
  metaphor. Before introducing tools, have Botie explain which part of that
  problem the reader will build. Label invented historical examples as invented
  and explain the limits of any simplified model.
- Workshop journeys open on a playable construction. Keep the problem and its
  historical explanation close to the activity, with sources available on demand.
  The controls tutorial may begin with a partly connected example, then moves to
  an empty floor. Longer lesson constructions can offer an intermediate calculation
  taken from the actual method; describe its inputs and role precisely. Carry the
  learner's tested pieces into the full problem, retaining any existing draft.
  Set aside a changed-input case, invite a prediction before showing its result,
  and check the earlier examples too. A variation is practice evidence, not proof
  of mastery. Keep guidance, original workspaces and Python challenges accessible.
  Record assistance honestly, and distinguish an explored explanation from a
  construction that has passed its checks. Do not add points or completion quotas.
- Each workshop has an authored plan in `lib/builds/journeys/`. Choose its opening,
  intermediate calculation and changed case for a reason specific to that lesson.
  Do not infer the learning sequence from the number of operations or automatically
  reserve the last case. Predictions suit numerical consequences; comparisons,
  diagnoses and design decisions need their own questions and explanatory feedback.
  Connect to named earlier capabilities and the learner's saved work. Say when no
  earlier attempt is saved instead of implying they completed it. A prior machine
  can be carried only when its input meanings can be mapped consistently and its
  calculation passes checks in both settings. Copy the learner's pieces on request,
  retain the existing draft and require a new test in the new problem.
- Match instructions to actual controls, fixtures and defaults. Do not ask a
  reader to move a slider that is absent, or describe one dataset while the
  widget loads another without explaining how to select it.
- Define jargon when it first becomes necessary. Break long explanations at
  changes of idea. Preserve technical detail without compressing several
  unfamiliar operations into one sentence.
- Distinguish a measured result on the page's dataset from a general property.
  State assumptions behind guarantees. Explain SDK-specific behaviour as such,
  especially loss input conventions, normalization and tokenizer variants.
- Preserve the author's observations when supported by existing experiments.
  Do not invent measurements or personal history. Cite primary documentation
  when a claim depends on an external implementation.
