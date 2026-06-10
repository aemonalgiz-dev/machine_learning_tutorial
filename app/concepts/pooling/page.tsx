import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import {
  DerivationTable,
  InAModel,
  KeepInMind,
  NumberTable,
  SubSection,
  WhyThisWorks,
  WorkedExample,
} from "@/components/concept/Treatments";
import { PoolingArrangement } from "@/components/widgets/PoolingArrangement";
import { PoolingEdgeCases } from "@/components/widgets/PoolingEdgeCases";
import { PoolingPlayground } from "@/components/widgets/PoolingPlayground";
import { PoolingReduction } from "@/components/widgets/PoolingReduction";
import { ShareTotalsChart } from "@/components/widgets/ShareTotalsChart";
import { ShiftTolerance } from "@/components/widgets/ShiftTolerance";
import { WindowSummaries } from "@/components/widgets/WindowSummaries";

export const metadata: Metadata = {
  title: "Pooling · oop_ml",
  description:
    "Shrink a picture by summarising each window, keeping the largest value or the average, and follow where the correction goes on the way back, which is the whole difference between the two.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PoolingPage() {
  return (
    <ConceptPage
      title="Pooling"
      tagline="Shrink a picture by summarising each window, and see which cells the layer holds responsible on the way back."
      prerequisites={
        <>
          The picture being pooled is the bank of maps a convolution answers
          with, so the{" "}
          <Link href="/concepts/convolution" className={link}>
            convolution page
          </Link>{" "}
          comes first, and this page pools the map that one ends on. The second
          half leans on{" "}
          <Link href="/concepts/backpropagation" className={link}>
            backpropagation
          </Link>
          , where a slope arriving from the layer above was first explained, and
          on{" "}
          <Link href="/concepts/shapes-and-flattening" className={link}>
            shapes and flattening
          </Link>{" "}
          for what an arrangement of extents is and why the count alone will not
          do.
        </>
      }
      history={
        <>
          <p>
            In 1959, and again in the longer 1962 paper, David Hubel and
            Torsten Wiesel recorded from single neurons in the striate cortex of
            anaesthetised cats while moving a bar of light across a screen, and
            found two kinds of cell. A simple
            cell fired for an edge at one orientation in one small place, and
            moving the bar a little killed the response. A complex cell fired
            for the same orientation anywhere within a larger patch, which is a
            cell that has been told a feature is present and has not been told
            where. Nobody knew how to build a machine with the second property.
            A detector that reports a position reports a different position when
            the picture moves one pixel, and everything above it has to be
            taught the new coordinates from scratch.
          </p>
          <p>
            Kunihiko Fukushima built the two kinds into a network in 1980 and
            put the difficulty in the title, a self-organising model of pattern
            recognition unaffected by shift in position. His Neocognitron
            alternated layers of detectors with layers whose units answered
            wherever a detector had fired inside their window, and the second
            kind is what this page is about. Yann LeCun&rsquo;s 1989 zip-code
            network shrank its maps by stepping each kernel two cells at a time
            rather than by adding a layer, and the LeNet-5 of 1998 made the
            shrink a layer of its own. That layer averaged each two by two
            window and then multiplied by a learned coefficient and added a
            learned bias, so it is worth saying that it was not the
            parameterless average of today. Keeping the largest value came back
            from the cortex. Maximilian Riesenhuber and Tomaso Poggio argued in
            1999 that a maximum was closer to what the complex cells were
            computing, Dominik Scherer, Andreas Müller and Sven Behnke compared
            the two on images in 2010 and found the maximum trained better, and
            the 2012 ImageNet network of Alex Krizhevsky, Ilya Sutskever and
            Geoffrey Hinton took maxima over windows of three at a stride of
            two, overlapping on purpose.
          </p>
          <p>
            The layer has since been argued with rather than settled. Min Lin,
            Qiang Chen and Shuicheng Yan proposed in 2013 that the last of these
            layers take the average of a whole map, one number per detector,
            which removes the dense layers a classifier used to end with. Jost
            Tobias Springenberg and his colleagues argued in 2014 that a
            convolution taking every second position does the same job, so the
            layer can be dropped from the middle of a network without loss. Each
            argument is about what the shrinking is worth, and neither is easy to
            weigh until the layer itself is unambiguous, which is what the
            sections below try to make it. The running example throughout is a
            four by four patch of a feature map, small enough that both kinds
            can be worked with a pencil and every correction counted by hand.
          </p>
        </>
      }
      playground={<PoolingPlayground />}
      sections={[
        {
          title: "Part 1. Why a Network Shrinks a Picture",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. The map a convolution hands over is mostly repetition">
                <p>
                  A convolution reads a picture and answers with a map nearly as
                  large as the picture it read, one map per detector. Most of
                  what those maps hold says the same thing twice. A detector
                  that responds to a short vertical edge responds again when the
                  window slides one cell along, since almost the same cells are
                  under it, so a single edge in the picture shows up as a small
                  bright patch in the map rather than as one bright cell.
                  Carrying every position of that patch forward means carrying
                  the same finding several times.
                </p>
                <p>
                  The layers above pay for it twice over. They have more numbers
                  to read, and they have to learn that a finding two cells to the
                  left means what the same finding here means, which is a fact
                  about geometry that they are being asked to work out from
                  examples. A layer that summarised each small neighbourhood
                  would spare them both.
                </p>
                <KeepInMind>
                  Shrinking a map is worth doing because the map is redundant,
                  and the redundancy is a consequence of the way a convolution
                  sweeps rather than a fault in the picture.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Keeping one number per window">
                <p>
                  Look at the two grids in the box at the top of the page. The
                  left one is a patch of a feature map, four numbers by four, and
                  the right one is what came back after the patch went through a
                  pooling layer. A window two cells wide sat over the top left
                  corner, the four numbers under it became one, the window moved
                  two cells across and did it again, and four windows gave four
                  answers. Nothing was multiplied and nothing was learned.
                </p>
                <p>
                  What is thrown away is the point of the exercise. The answer
                  for a window says something was found in this neighbourhood and
                  deliberately does not say where inside it, which is the complex
                  cell&rsquo;s property written as arithmetic. Press the vertical
                  stroke button and then nudge right once. The picture has moved a
                  whole column and the pooled map has not changed by a single
                  number, because the stroke stayed inside the same windows. Nudge
                  again and the bright column of the pooled map moves one cell
                  along, because this time the stroke crossed a boundary.
                </p>
                <KeepInMind>
                  A pooling layer answers with one number per window, which
                  shrinks the map and at the same time stops recording where
                  inside a window the evidence sat.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Only the two spatial extents shrink">
                <p>
                  A bank of eight detectors over a picture answers with eight
                  maps, and pooling leaves that eight alone. Each map is pooled
                  by itself and the answers are never combined across maps,
                  because two detectors are two different questions and the
                  largest response of one says nothing whatever about the other.
                  So an arrangement of eight maps of twenty-six by twenty-six
                  comes out as eight maps of thirteen by thirteen, and the
                  leading eight is carried through untouched.
                </p>
                <Equation>
                  {"(8, 26, 26)   →   (8, 13, 13)"}
                </Equation>
                <p>
                  This is why the arrangement has to be written as extents per
                  side rather than as one count. Five thousand four hundred and
                  eight numbers arranged as eight maps of twenty-six by
                  twenty-six is a thing a pooling layer can read, and the same
                  five thousand four hundred and eight numbers laid out in a
                  single row is not, and a shape that only counted would call
                  those two the same.
                </p>
                <KeepInMind>
                  Channels are pooled independently and never mixed. A pooling
                  layer changes the last two extents and leaves the first one
                  exactly as it found it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. The Arrangement, Settled Before Any Data",
          content: (
            <>
              <SubSection title="4. The window, the stride, and the sweep">
                <p>
                  A pooling layer is three settings and no more. How wide the
                  square window is, how far it moves between positions, and which
                  summary it keeps. The window starts at the top left corner, the
                  summary is taken, the window moves across by the stride, and at
                  the end of a row it drops down by the stride and starts again
                  from the left.
                </p>
                <p>
                  Every one of those is a choice made when the layer is built,
                  and none of them depends on what the numbers turn out to be. So
                  how many positions the window can take along a side, and
                  therefore what arrangement the layer answers with, is decided
                  at that same moment.
                </p>
                <KeepInMind>
                  The sweep is fixed by the window and the stride alone. Two
                  pictures of the same arrangement are swept identically whatever
                  they hold.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The output extent, in integers">
                <p>
                  Along one side, the first window occupies positions zero up to
                  the window width, and each later one starts a stride further
                  on. The last window that fits is the last one whose far edge
                  has not passed the end of the side, so the count is how many
                  whole strides fit in what is left after the first window, plus
                  the first window itself.
                </p>
                <Equation>
                  {"pooled extent = ⌊(extent − window) / stride⌋ + 1"}
                </Equation>
                <p>
                  For an eight by eight patch under a window of two at a stride
                  of two that gives four on each side, so sixty-four numbers
                  become sixteen. At a stride of one it gives seven, so
                  sixty-four numbers become forty-nine, and the windows overlap.
                  A window of one at a stride of one gives eight, which is the
                  picture back again.
                </p>
                <WhyThisWorks>
                  <p>
                    Write the corner of window k at k times the stride. The
                    window covers up to that corner plus the window width, so it
                    fits when k times the stride plus the window is at most the
                    extent, which is k at most the extent less the window,
                    divided by the stride. Counting from zero, the number of
                    admissible k is that floor plus one, and the floor is doing
                    the work of noticing that a partial window is not a window.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The floor is the whole of the arithmetic that can surprise you.
                  It silently discards whatever is left over at the far edge.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. What a stride that does not divide the side leaves out">
                <p>
                  When the stride divides the side evenly and equals the window,
                  every cell belongs to exactly one window and nothing is left
                  over. Change either and that stops being true. Under a window
                  of two at a stride of three over an eight by eight patch the
                  windows sit at columns zero, three and six, so columns two and
                  five are covered by nothing at all, and twenty-eight of the
                  sixty-four cells lie in no window. The layer never reads them,
                  the answers do not depend on them, and no correction ever
                  reaches them.
                </p>
                <PoolingArrangement />
                <p>
                  Choose the rows in the table and watch the grid beside it. At a
                  window of two and a stride of two nothing is pale. At a window
                  of three and a stride of three the last two rows and the last
                  two columns are, twenty-eight cells again by a different route.
                  At a window of one and a stride of two, which throws away three
                  cells in four without looking at them, forty-eight are pale.
                  There is no padding here, so the far edge is simply dropped
                  rather than extended with zeros, and a five by five patch under
                  a window of two at a stride of two comes out two by two with
                  its fifth row and fifth column ignored.
                </p>
                <NumberTable
                  headings={[
                    "window, stride",
                    "8 by 8 answers",
                    "numbers kept",
                    "cells in no window",
                  ]}
                  rows={[
                    ["2, 2", "4 × 4", "16", "0"],
                    ["2, 1", "7 × 7", "49", "0"],
                    ["2, 3", "3 × 3", "9", "28"],
                    ["3, 2", "3 × 3", "9", "15"],
                    ["3, 3", "2 × 2", "4", "28"],
                    ["1, 2", "4 × 4", "16", "48"],
                  ]}
                  caption="Read off six layers built over an eight by eight patch, none of which pooled anything; the arrangement is known as soon as the layer exists."
                />
                <KeepInMind>
                  A stride that does not divide the side leaves a margin at the
                  far edge that is never read. Nothing warns about it, so the
                  count of unreached cells is worth working out when the numbers
                  are chosen.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Overlap, and a stride larger than the window">
                <p>
                  A stride smaller than the window makes consecutive windows
                  share cells, which is legal and is what the 2012 ImageNet
                  network chose. A stride larger than the window makes
                  consecutive windows skip cells, which is also legal and is
                  almost never wanted. Both are accepted here, and the second
                  produces the gaps of the previous section at their worst. A
                  window of two at a stride of three over a four by four patch
                  answers with a single number and leaves fifteen of the sixteen
                  cells outside every window.
                </p>
                <DerivationTable
                  expressionHeading="stride against window"
                  reasonHeading="what the sweep does"
                  rows={[
                    {
                      expression: "stride < window",
                      reason:
                        "the windows overlap, one cell belongs to several of them, and the map shrinks less than the window suggests.",
                    },
                    {
                      expression: "stride = window",
                      reason:
                        "the windows tile, each cell belongs to exactly one, and any leftover margin at the far edge is dropped.",
                    },
                    {
                      expression: "stride > window",
                      reason:
                        "the windows skip, whole rows and columns belong to nothing, and those cells are neither read nor corrected.",
                    },
                  ]}
                />
                <KeepInMind>
                  Overlapping is a deliberate choice with a cost in size.
                  Skipping is legal and is usually an error in the settings
                  rather than a decision.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. How many numbers are carried forward">
                <p>
                  The count of numbers a layer answers with is the product of the
                  extents it answers with, and for a pooling layer the channel
                  count is a factor that never changes. Take the arrangement the
                  convolution page ends on, eight filters of three by three over
                  a twenty-eight by twenty-eight picture, which answers with
                  eight maps of twenty-six by twenty-six.
                </p>
                <PoolingReduction />
                <InAModel title="The shrink on that bank of maps">
                  <p>
                    Five thousand four hundred and eight numbers arrive. Under a
                    window of two at a stride of two, 1352 leave, a share of
                    0.25, so four thousand and fifty-six of them are dropped
                    before the next layer ever sees them. Under a window of three
                    at the same stride, 1152 leave and one row and one column of
                    each map, fifty-one cells of the 676, belong to no window.
                    Under a window of two at a stride of one the map barely
                    shrinks at all, 5000 of the 5408 numbers going on.
                  </p>
                </InAModel>
                <p>
                  A quarter is the usual figure because a window of two at a
                  stride of two halves each spatial side, and halving two sides
                  quarters their product. Repeat it and the effect compounds, so
                  three such layers leave a sixty-fourth of the spatial extent,
                  which is how a network gets from a picture to a few hundred
                  numbers a dense layer can read.
                </p>
                <KeepInMind>
                  The shrink is in the spatial extents, so it goes as the square
                  of the stride when window and stride agree. The channel count
                  is a constant factor throughout.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What Each Kind Keeps",
          content: (
            <>
              <SubSection title="9. The largest value in the window">
                <p>
                  The first summary keeps the largest number under the window and
                  discards the other three. On the running patch, with a window
                  of two at a stride of two, the top left window holds 1, 5, 4 and
                  2, so the answer is 5. The other three windows hold 1, 3, 4, 0
                  and 0, 1, 2, 1 and 3, 1, 7, 5.
                </p>
                <Equation>{"max      [[5, 4],\n          [2, 7]]"}</Equation>
                <p>
                  Reading that map as a report, it says the strongest response in
                  this neighbourhood was 5, and it says nothing about how many
                  cells were nearly as strong. Section 11 has two windows in it
                  that make the omission plain, one holding a single 8 among three
                  zeros and one holding four 2s, and a maximum answers 8 and 2,
                  which is the difference between them stated as loudly as it can
                  be.
                </p>
                <KeepInMind>
                  A maximum reports the strongest evidence in the window and
                  discards how much other evidence there was.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The mean of the window">
                <p>
                  The second summary keeps the mean. The same four windows of the
                  patch sum to 12, 8, 4 and 16, and each holds four cells.
                </p>
                <Equation>
                  {
                    "12 / 4 = 3,   8 / 4 = 2,   4 / 4 = 1,   16 / 4 = 4\n\naverage  [[3, 2],\n          [1, 4]]"
                  }
                </Equation>
                <p>
                  Now go back to the two windows of the previous section and the
                  reading reverses. The one holding a single 8 and the one holding
                  four 2s both average 2, so a mean cannot tell them apart at all
                  where a maximum could. In exchange, a mean is pulled down by the
                  quiet cells around a strong one, which a maximum ignores. Which
                  of those two behaviours is wanted is a question about the data
                  rather than about the layer, and the layer itself has no
                  opinion.
                </p>
                <KeepInMind>
                  A mean reports how much response there was on average, so a
                  strong reading among quiet ones and several moderate readings
                  can come out alike.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Both on one window">
                <p>
                  The two kinds differ by one function, and one window is enough
                  to see the whole of it. The grid on the left below is a window
                  and the two on the right are what each kind owes each position
                  in it, which is the derivative of the answer with respect to
                  that position. The next part is about why those grids matter;
                  they are here because they are what the two layers actually
                  differ by.
                </p>
                <WindowSummaries />
                <WorkedExample title="The patch’s top left window">
                  <p>
                    The four cells 1, 5, 4 and 2 sum to 12. A maximum keeps 5 and
                    owes all of it to the single cell in row 0, column 1, so its
                    grid of shares is 0, 1, 0, 0 and exactly one of the four cells
                    receives anything. An average keeps 3 and owes a quarter to
                    each, so its grid is four quarters and all four receive
                    something. Both grids add up to 1. On a window of three by
                    three the average hands out ninths, each 0.1111111111111111,
                    and the nine of them still come to exactly 1.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A kind of pooling amounts to two functions of one window, the
                  number it keeps and the shares it owes. The sweep, the extents
                  and every refusal are common to both kinds.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Nothing is multiplied and nothing is learned">
                <p>
                  A dense layer forms a weighted sum and then bends it, and a
                  convolution multiplies a kernel at every position. This layer
                  does neither. There is no weight anywhere in it, so there is
                  nothing for a training step to move and nothing for a saved
                  model to store, and asking such a layer to take a step gives
                  back the same layer object it was asked of.
                </p>
                <p>
                  One consequence is easy to miss. Since there is no bend, there
                  is no value before the bend that differs from the answer, so the
                  score and the output of a pooling layer are the same block of
                  numbers rather than two blocks that happen to be equal. And
                  since there are no parameters, the layer reports no gradient of
                  its own on the way back, which is a truer answer than a block of
                  zeros would be. A block of zeros claims there is something here
                  whose slope happens to be flat.
                </p>
                <KeepInMind>
                  A pooling layer has no parameters at all. It still takes part in
                  the backward pass, because it has to pass a correction down to
                  the layer beneath it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Where the Blame Goes",
          content: (
            <>
              <SubSection title="13. A slope arrives at an answer">
                <p>
                  On the way back, the layer above hands this layer one number
                  per answer, saying how much the loss would move if that answer
                  moved. The pooling layer&rsquo;s whole job is to convert that
                  into one number per input cell, saying how much the loss would
                  move if that cell moved, and it does so by the chain rule and
                  nothing else. A cell&rsquo;s share of an answer, times the slope
                  arriving at that answer.
                </p>
                <Equation>
                  {"blame on cell i  =  arriving slope  ×  ∂answer / ∂cell i"}
                </Equation>
                <p>
                  Turn the overlay on in the box at the top of the page, with max
                  chosen. A slope of one is being sent to each of the four
                  answers, which makes the arithmetic easy to read, since the
                  blame on a cell is then just its share.
                </p>
                <KeepInMind>
                  The backward pass of a pooling layer is a distribution rule.
                  There is no arithmetic in it beyond multiplying by a share.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The derivative of a maximum">
                <p>
                  A maximum is a selection rather than a calculation. Over the
                  range where the winning cell keeps winning, the answer simply is
                  that cell, so moving the winner by a little moves the answer by
                  exactly as much, and moving any other cell in the window by a
                  little does not move the answer at all.
                </p>
                <Equation>
                  {
                    "y = max(x₁, …, xₙ)\n\n∂y/∂xᵢ = 1 if i won the window, and 0 otherwise"
                  }
                </Equation>
                <p>
                  So the whole arriving slope goes to one cell and the rest of the
                  window receives nothing. In the top left window the answer 5 was
                  5 because of the cell holding 5, and the cells holding 1, 4 and
                  2 could each have been anything smaller without changing the
                  answer, so a correction reaching them would be a correction for
                  something they did not cause.
                </p>
                <KeepInMind>
                  A maximum trains only its winners. A cell that never wins a
                  window never receives a correction from this layer, however
                  large it is.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The derivative of an average">
                <p>
                  An average has no such asymmetry. Every cell enters the answer
                  with the same coefficient, one over the number of cells, so
                  every cell is responsible for that much of it.
                </p>
                <Equation>
                  {"y = (x₁ + … + xₙ) / n\n\n∂y/∂xᵢ = 1 / n  for every i"}
                </Equation>
                <p>
                  A two by two window therefore hands each of its four cells a
                  quarter of whatever arrives, at every step, whatever the cell
                  holds. Nothing is ever starved, which is what makes an average
                  the gentler of the two on a deep stack, and the cost is that a
                  cell which contributed almost nothing to the answer is corrected
                  as much as the cell that carried it.
                </p>
                <KeepInMind>
                  An average trains everything in the window a little. Its shares
                  do not depend on the values in the window at all, so they are
                  the same grid every time.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Who gets trained, counted on the patch">
                <p>
                  On the four by four patch under a window of two at a stride of
                  two, with a slope of one arriving at each of the four answers,
                  the counting is finished in a sentence. A maximum gives 1 to
                  each of four cells and 0 to the other twelve. An average gives
                  0.25 to every one of the sixteen. The overlay in the box prints
                  both, and the emerald rings mark the cells that receive
                  anything.
                </p>
                <NumberTable
                  headings={[
                    "on the patch, window 2, stride 2",
                    "max",
                    "average",
                  ]}
                  rows={[
                    ["cells receiving any correction", "4 of 16", "16 of 16"],
                    ["largest amount one cell receives", "1", "0.25"],
                    ["total handed down", "4", "4"],
                  ]}
                  caption="Both kinds hand down four in total, one per window, and they disagree entirely about who receives it."
                />
                <p>
                  Twelve of the sixteen cells beneath a maximum receive nothing
                  on this step, so whatever layer sits below learns through four
                  cells only. On the next step a different four may win, since the
                  numbers will have moved, and that is the argument that the
                  starvation is temporary rather than structural. It is an
                  argument about the data and not a guarantee, and a region that
                  is uniformly quiet can sit unwinning for a long time.
                </p>
                <KeepInMind>
                  Which cells receive correction is decided by the kind of
                  pooling, and under a maximum it is decided afresh by the values
                  at every step.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Why the shares in a window sum to one">
                <p>
                  Both grids of shares in section 11 added up to one, and that is
                  a property of the family rather than a coincidence of those two
                  members. Each answer here is a weighted mean of its window with
                  weights adding to one, a maximum putting all the weight on one
                  cell and an average spreading it evenly, and the shares are
                  those same weights.
                </p>
                <Equation>{"Σᵢ ∂y/∂xᵢ = 1"}</Equation>
                <p>
                  A layer whose shares came to something other than one would be
                  scaling every gradient that passed through it, quietly, by a
                  factor nobody chose. Shares adding to 1.5 would inflate the
                  correction reaching every layer below by half as much again at
                  every pooling layer in the stack, which compounds. So the sum is
                  worth checking rather than assuming, and it is checked for both
                  kinds at a range of window sides.
                </p>
                <KeepInMind>
                  Shares summing to one is what makes a pooling layer transparent
                  to the size of a gradient. It is a claim about the family, so it
                  is the right thing to test for every member.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. And why they only nearly do">
                <p>
                  In float64 the claim is true to within rounding and not exactly.
                  An average over a window of seven hands out forty-nine shares of
                  one forty-ninth, that reciprocal has no exact representation,
                  and the forty-nine of them add up to 0.9999999999999999. Sides 2
                  and 4 and 8 are exact because their reciprocals are, and the
                  rest are a matter of which way the rounding went.
                </p>
                <ShareTotalsChart />
                <p>
                  Sixteen of the first thirty-two sides miss, which is half of
                  them, and the furthest away is side 31, at 1.0000000000000004,
                  which is 4.4e-16 above one. That is far below the rounding
                  already present in any gradient reaching the layer, so the
                  practical answer is that this does not matter. The reason it is worth a section is
                  that a test asserting the sum is exactly one passes at side 2
                  and fails at side 7, and a test written only against a window of
                  two would never find out. A maximum, whose shares are a single
                  1 and some zeros, is exact at every side.
                </p>
                <KeepInMind>
                  The shares sum to one to within float64. Any check on them needs
                  a tolerance and needs to include a side whose reciprocal is
                  inexact, or it is checking nothing.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Overlap, and What It Does Not Change",
          content: (
            <>
              <SubSection title="19. One cell in several windows">
                <p>
                  Slide the stride down to one in the box at the top of the page,
                  keeping the window at two, and the four windows become nine. The
                  cell in the middle of the patch now belongs to four of them, an
                  edge cell to two, and a corner cell to one. That cell affects
                  four different answers, so four different arriving slopes reach
                  it, and what it is owed is the sum of the four.
                </p>
                <Equation>
                  {
                    "blame on cell i  =  Σ over the windows holding i of   arriving slope × ∂answer / ∂cell i"
                  }
                </Equation>
                <p>
                  So the backward pass adds into the block it is building rather
                  than writing into it. Writing instead of adding keeps only
                  whichever window was visited last, which produces a gradient of
                  exactly the right arrangement, full of plausible finite numbers,
                  on a layer that carries on training. Nothing about the shapes
                  would catch it and no answer would look wrong.
                </p>
                <KeepInMind>
                  With overlapping windows a cell&rsquo;s correction is a sum over
                  every window it belongs to. The disjoint case hides this
                  entirely, since each sum has one term.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The total handed down is one per window">
                <p>
                  Since the shares inside a window add up to one, whatever arrives
                  at a window is handed down in full. Sum over the windows and the
                  total blame handed down equals the total slope that arrived,
                  whatever the stride and whichever kind.
                </p>
                <NumberTable
                  headings={[
                    "on the patch, window 2, a slope of one per answer",
                    "windows",
                    "max hands down",
                    "average hands down",
                  ]}
                  rows={[
                    ["stride 2", "4", "4", "4"],
                    ["stride 1", "9", "9", "9"],
                  ]}
                  caption="Nine windows send down nine, and four send down four, under both kinds. Overlap does not create or destroy any of it."
                />
                <p>
                  It is tempting to say that overlapping windows send more blame
                  down, and that is only true in the sense that there are more
                  windows sending it. Ask the same question with the totals
                  matched and the answer is that overlap changes nothing about the
                  amount.
                </p>
                <KeepInMind>
                  Total blame equals total arriving at every stride. That is a
                  consequence of the shares summing to one, and it is a cheap
                  check to run on any pooling implementation.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. What overlap changes is the concentration">
                <p>
                  What does change is where the total lands. At a stride of two on
                  the patch, no cell can receive more than one under a maximum,
                  since each cell belongs to a single window and can win it at
                  most once. At a stride of one the cell holding 4 in the second
                  row wins three of the nine windows and receives 3, and under an
                  average an interior cell belongs to four windows and receives
                  four quarters, which is exactly 1.
                </p>
                <NumberTable
                  headings={[
                    "on the patch, window 2",
                    "cells corrected",
                    "most one cell receives",
                  ]}
                  rows={[
                    ["max, stride 2", "4 of 16", "1"],
                    ["max, stride 1", "5 of 16", "3"],
                    ["average, stride 2", "16 of 16", "0.25"],
                    ["average, stride 1", "16 of 16", "1"],
                  ]}
                  caption="Overlap under a maximum spreads the correction over one more cell and concentrates three times as much on the busiest of them."
                />
                <p>
                  Under a maximum the effect is uneven in a way worth knowing
                  about. A cell that is large relative to a whole neighbourhood
                  wins every window that contains it, so it collects the blame
                  from all of them, and its neighbours collect none. Under an
                  average the same overlap is smooth, and the interior of the
                  patch is corrected four times as much as the corners simply
                  because it takes part in four times as many windows.
                </p>
                <KeepInMind>
                  Overlap redistributes correction rather than adding any. Under a
                  maximum it concentrates it on cells that win repeatedly, and
                  under an average it favours the interior over the edges.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Ties, Winners and Small Shifts",
          content: (
            <>
              <SubSection title="22. Two cells hold the same maximum">
                <p>
                  When two cells in a window hold the same largest value the
                  derivative does not exist, and that is a fact about the function
                  rather than a gap in the implementation. The maximum of two
                  crossing lines has a corner at the crossing, and the slope
                  approaching from one side gives the whole of it to the first
                  cell while the slope approaching from the other gives it to the
                  second. There is no single right answer to compute, so an
                  implementation chooses one.
                </p>
                <p>
                  This one chooses the first cell in row-major order, the top row
                  before the bottom and the left before the right. Load the flat
                  patch in the box at the top, where every window is a four-way
                  tie, and each window sends its whole slope to its own top left
                  cell, four of the sixteen in total. The alternative, splitting
                  the slope evenly among the tied cells, is a perfectly legitimate
                  reading of the corner and is what a symmetric argument suggests.
                  It is not what established implementations do, and on data where
                  exact ties in float64 are essentially confined to constant
                  regions there is nothing to choose between them.
                </p>
                <KeepInMind>
                  On a tie the backward pass follows a stated convention rather
                  than a derivative. A gradient check cannot arbitrate it, because
                  the one-sided differences genuinely disagree there, so the
                  convention has to be tested directly.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Why the winner is recomputed rather than remembered">
                <p>
                  The forward pass knows which cell won each window, and could
                  hand a record of that to the backward pass. This implementation
                  does not. What the forward pass hands on already includes the
                  block it read, and the winner is a function of those frozen
                  numbers, so the backward pass asks the same question of the same
                  numbers with the same tie rule and cannot arrive at a different
                  answer.
                </p>
                <p>
                  The cost is a second scan of every window, and it is real rather
                  than negligible, since the backward pass does the same scan the
                  forward pass did plus an accumulation on top. Recording the
                  winners on the way up would move that work rather than remove it,
                  and it would widen the type every layer shares for the benefit of
                  this one.
                </p>
                <p>
                  A dropout layer reaches the opposite conclusion about the same
                  question, and the two are worth reading together. Its mask was
                  drawn at random, so it cannot be recomputed at all and has to be
                  carried. Recovering it later from which outputs are zero fails
                  quietly on any input that was genuinely zero and genuinely kept,
                  which the{" "}
                  <Link href="/concepts/dropout" className={link}>
                    dropout page
                  </Link>{" "}
                  measures.
                </p>
                <KeepInMind>
                  A winner is derivable from what the forward pass already kept, so
                  carrying it would store a fact that can be recovered. A random
                  draw is not derivable, and has to be carried.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Tolerance to a small shift, measured">
                <p>
                  The property the whole layer is for can be measured rather than
                  described. Take an eight by eight patch lit along its third
                  column and dark elsewhere, pool it at a window of two and a
                  stride of two, then move the whole picture one column to the
                  right and pool it again.
                </p>
                <ShiftTolerance />
                <InAModel title="One column, moved">
                  <p>
                    Moving the stroke one column changes 16 of the picture&rsquo;s
                    64 cells, since eight go dark and eight light up, and changes
                    0 of the pooled map&rsquo;s 16 cells under either kind. The
                    third and fourth columns share a window, so the stroke moved
                    within it and the summaries did not notice. Move it a second
                    column and it crosses into the next window, 8 of the 16 pooled
                    cells change, and the bright column of the map moves one cell
                    along. The largest single change is 9 under a maximum and 4.5
                    under an average, which is the stroke&rsquo;s own value and
                    half of it.
                  </p>
                </InAModel>
                <p>
                  That is the complex cell&rsquo;s property in four numbers. The
                  layer beneath saw a large change and the layer above saw none,
                  and the layers above that never have to learn that the two
                  pictures were the same digit.
                </p>
                <KeepInMind>
                  The tolerance is exactly as wide as a window and no wider. A
                  shift within a window is invisible above the layer, and a shift
                  across a boundary is fully visible.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. What that tolerance is not">
                <p>
                  Four things are easy to read into the previous section that are
                  not there. The layer is not invariant to shift in general, only
                  to shift that stays inside a window, and the measurement above
                  shows exactly where the second column crosses the line. It is not
                  invariant to rotation or to scale, which nothing in a window
                  summary addresses. Stacking several such layers widens the
                  window in the original picture rather than removing the boundary,
                  so the same knife edge is there at a coarser spacing. And a
                  network can be tolerant to shift without this layer at all, by
                  learning from examples at many positions, which is more expensive
                  and is what the argument for replacing the layer with a strided
                  convolution turns on.
                </p>
                <KeepInMind>
                  Pooling buys tolerance to small shifts within a window, cheaply
                  and with no parameters. It does not buy general invariance, and
                  it is not the only way to get what it does buy.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="26. What a complete implementation must specify">
                <p>
                  A pooling layer looks like the simplest thing in a network and
                  has a surprising number of decisions in it, most of which are
                  invisible until two implementations disagree. A complete one
                  states the arrangement it reads, the window and the stride and
                  whether they may differ per axis, whether any padding is applied
                  and with what value, which summary it keeps, how a tie in a
                  maximum breaks, whether the leftover margin at the far edge is
                  dropped or covered by a partial window, whether the backward
                  pass accumulates over overlapping windows, what it reports when
                  asked for a gradient it does not have, and what it does when
                  asked to take a training step.
                </p>
                <DerivationTable
                  expressionHeading="the decision"
                  reasonHeading="what is decided here"
                  rows={[
                    {
                      expression: "arrangement read",
                      reason:
                        "three extents exactly, channels then height then width. A picture with any other number of extents is refused by name.",
                    },
                    {
                      expression: "window and stride",
                      reason:
                        "one square window and one stride, shared by both axes. Rectangular windows and per-axis strides are absent rather than defaulted.",
                    },
                    {
                      expression: "padding",
                      reason:
                        "none. There is no padding setting, so the far margin is dropped and the output extent is the floor formula of section 5.",
                    },
                    {
                      expression: "the tie in a maximum",
                      reason:
                        "the first cell in row-major order, which is what a flat scan of the window returns, so the two passes ask one function one question.",
                    },
                    {
                      expression: "overlapping windows",
                      reason:
                        "the backward pass adds rather than assigns, so a cell in four windows receives all four contributions.",
                    },
                    {
                      expression: "the gradient",
                      reason:
                        "reported as absent, since the layer has no parameters, rather than as a block of zeros.",
                    },
                    {
                      expression: "a training step",
                      reason:
                        "answered with the same layer object. Nothing is copied, because nothing changed and nothing can.",
                    },
                    {
                      expression: "the score and the answer",
                      reason:
                        "the same block of numbers, since there is no activation and so no pre-activation value distinct from the answer.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two implementations that agree on the summary can disagree on
                  padding, on the leftover margin and on ties, and produce
                  different maps from the same picture. Those three are the ones
                  to check first when numbers do not match.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. The edges, probed">
                <p>
                  Below is every edge asked of a pooling layer as this page loads,
                  with what came back rather than what ought to. Thirteen of the
                  sixteen are refused and every refusal names itself in words that
                  say what was wrong, including the two that a bare Python failure
                  would otherwise escape through, giving a whole number where three
                  extents are wanted and giving a flag where a whole number is
                  wanted.
                </p>
                <PoolingEdgeCases />
                <p>
                  Three are accepted, and each of the three is a decision rather
                  than an oversight. A stride larger than the window is legal, and
                  a window of two at a stride of three over a four by four patch
                  answers with a single number and leaves fifteen of the sixteen
                  cells outside every window, which is section 7 as a refusal that
                  never comes. A window of one at a stride of one is the identity,
                  answering with the arrangement it read and handing every one of
                  the sixteen cells exactly 1. And a step asked of a layer with
                  nothing to learn gives back the same layer object.
                </p>
                <p>
                  Two things a reader might expect are missing from that table, and
                  both are missing for the same reason. There is no unfitted state
                  to guard against and no feature names to match, because a pooling
                  layer learns nothing and reads positions rather than named
                  columns. Its whole contract is the arrangement, so every refusal
                  it has is about an arrangement or about a number that cannot be a
                  window.
                </p>
                <KeepInMind>
                  A refusal that names the arrangement is worth more than one that
                  names a Python type, because the arrangement is what the caller
                  got wrong. A bare integer where extents are wanted is the natural
                  mistake, since it is exactly what a dense layer&rsquo;s width
                  looks like.
                </KeepInMind>
              </SubSection>

              <SubSection title="28. The pairing nothing refuses">
                <p>
                  One case is neither refused nor right, and the block at the
                  bottom of the widget above is it. The backward pass checks that
                  the response it was handed came from a layer of this shape and
                  that the arriving block has this layer&rsquo;s own arrangement,
                  which catches every mistake about extents. It cannot catch a
                  mistake between two layers whose extents agree.
                </p>
                <WorkedExample title="Two layers of one shape">
                  <p>
                    A window of three at a stride of one over a four by four patch
                    answers 2 by 2. So does a window of two at a stride of two. Ask
                    the first to pool a picture, then hand its response to the
                    second along with four arriving values 1, 2, 3 and 4. Nothing
                    is raised. Both hand down a total of 10, which agrees to the
                    last bit. And 6 of the 16 cells receive something different,
                    with the second layer routing three of the four values to cells
                    that never won the windows they came from.
                  </p>
                </WorkedExample>
                <p>
                  Closing it would mean every response carrying a record of which
                  layer produced it, which is a field on the type every layer
                  shares, added for a case that a network assembled as a stack
                  cannot reach, since a stack pairs layer k with response k by
                  construction. The exposure is to a caller pairing the two by
                  hand, which is what a step-by-step walk through a single layer
                  does. So it is written down rather than defended, and this
                  section is where it is written down.
                </p>
                <KeepInMind>
                  Matching arrangements is not the same as matching layers. Where a
                  check reads shapes alone, two layers of one shape are
                  indistinguishable to it, and the numbers that come back from the
                  wrong pairing look entirely reasonable.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
