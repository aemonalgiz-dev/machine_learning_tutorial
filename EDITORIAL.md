# Editorial guide

The site teaches novice and technical readers in the author's direct,
example-led voice. These rules reflect the author's stated preferences.

The explanation should answer a chain of questions: Why do we care about this
problem? What information or operation are we missing? What are the fundamental
components of the proposed solution? How do we use them, one step at a time?
What does the result tell us? Only then move into the full mathematical treatment.
This applies to lesson bodies and widget explanations as well as introductions.

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

- Never use em dashes in authored content, including headings, captions,
  metadata, labels and documentation.
- Open with a concrete problem and a heading specific to it. Do not reuse
  "Where This Came From" as a template heading.
- Every lesson has a historical opening in `lib/history/`, selected by its
  `lessonId`. Start with the problem people faced, explain the documented
  contribution, then give an intuitive account of why it helps. Link primary
  sources. Distinguish an influential example from an invention or priority
  claim, and distinguish the original method from this site's teaching variant.
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
  The list is the dropdown at the top of every lesson, so section titles have
  to stand on their own there. Preserve section links and update numbered
  references when reordering.
- Quiz sections sit beside the parts they draw on and are titled for them,
  `Questions on Parts 3 to 5`, which is also how the page finds the parts to
  offer after a wrong answer. Every figure in a question or its explanation
  comes from the lesson. Options are dealt in a fixed shuffled order, so an
  explanation names an option by its content, never by its position. Aim for
  roughly half of true-or-false claims to be true, and vary how many options
  of a `several` question hold.
- A practice section comes last, titled `Practice. ...` in the register of
  the part titles, and holds two to four problems worked in Python with
  NumPy or oop_ml. It is the one place on a lesson that may name the library's
  classes and methods. Every output shown is what the solution printed when
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
- Every coding challenge has runnable Python tests. State the required output
  clearly, expose expected and actual results, and allow rounding at the stated
  precision. Test the meaningful result, not one spelling of the solution.
  Report test results as feedback on the work. Do not add rewards, achievement
  language or locked steps. Viewing a solution does not mark tests as passed.
  Run reference solutions in browser Python before publishing.
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
