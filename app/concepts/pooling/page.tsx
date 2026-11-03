import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
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
  title: "Pooling · Perceptron Lab",
  description:
    "Pooling combines nearby values into a smaller representation. It reduces spatial resolution, so the choice of operation determines which responses are retained and which positional details are lost.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PoolingPage() {
  return (
    <ConceptPage
      lessonId="pooling"
      intuition={lessonIntuitions["pooling"]}
      technicalStart="Part 2. What Each Kind Keeps"
      openingTitle="Keep a Summary of the Neighborhood" openingId="keep-a-summary-of-the-neighbourhood"
      playgroundTitle="Keep a summary from each image neighborhood"
      playgroundIntro="Compare maximum and average summaries for the same window. Then look at which input values receive a gradient on the backward pass."
      title="Pooling"
      tagline={"Pooling combines nearby values into a smaller representation. It reduces spatial resolution, so the choice of operation determines which responses are retained and which positional details are lost."}
      prerequisites={<>The <Link href="/concepts/convolution" className={link}>convolution page</Link> explains the feature maps summarized here. <Link href="/concepts/backpropagation" className={link}>Backpropagation</Link> introduces the loss derivatives used in the second half. <Link href="/concepts/shapes-and-flattening" className={link}>Shapes and flattening</Link> explains why spatial axes matter even when two arrays contain the same number of values.</>}

      playground={<PoolingPlayground />}
      sections={[
        {
          title: "Part 1. Why a Network Shrinks a Picture",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Summarizing nearby feature responses" id="1-the-map-a-convolution-hands-over-is-mostly-repetition">
                <>
<p>{"A convolution produces a response map for each detector. Nearby responses can carry closely related information because neighboring windows contain many of the same pixels. In this example, a short vertical edge can therefore produce a bright patch across several nearby positions. Pooling summarizes a local region of that map, reducing the number of values passed to the next layer."}</p>
                <p>Nearby responses can be similar without being identical. A summary reduces their number while giving up some of the differences between them.</p>
</>
                <p>

                  Later layers must process those large maps. They may also need to treat nearby detections as similar, even when an edge shifts slightly. Pooling summarizes a small neighborhood so they receive fewer values and less precise location information. We will check when that loss of detail helps and when it removes information we need.
                </p>
                <KeepInMind>
                  Pooling can reduce computation in later layers when a coarser summary is enough for the task. Overlapping convolution windows often produce related responses, but their differences can still contain useful location or shape information.</KeepInMind>
              </SubSection>

              <SubSection title="2. Keeping one number per window">
                <p>The top activity shows a four-by-four feature-map patch and its pooled result. A two-by-two window summarizes the top-left four values. It then moves two cells at a time across and down the patch. Four windows produce four outputs. The summary follows a fixed rule rather than learned weights.</p>
                <>
<p>A summary discards some information about the values and their positions within a window. In this example, load the vertical stroke and nudge it right once. The stroke moves within the same nonoverlapping windows, leaving each window’s multiset of values unchanged. Both maximum and average pooling therefore return the same map.</p>
                <p>
                  Nudge again and the bright column of the pooled map moves one cell along, because this time the stroke crossed a boundary.
                </p>
</>
                <KeepInMind>
                  A pooling layer answers with one number per window, which
                  shrinks the map and at the same time stops recording where
                  inside a window the evidence sat.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Only the two spatial extents shrink">
                <p>The spatial pooling operations here process each channel independently. Eight input feature maps remain eight output maps; only their spatial dimensions change. A two-by-two window at stride two turns each twenty-six-by-twenty-six map into a thirteen-by-thirteen map. Different channels can still be related, but these pooling layers do not combine them.</p>
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
</>),
        },
        {
          title: "Part 2. What Each Kind Keeps",
          content: (
            <>
              <SubSection title="4. The largest value in the window">
                <p>
                  The first summary keeps the largest number under the window and
                  discards the other three. On the running patch, with a window
                  of two at a stride of two, the top left window holds 1, 5, 4 and
                  2, so the answer is 5. The other three windows hold 1, 3, 4, 0
                  and 0, 1, 2, 1 and 3, 1, 7, 5.
                </p>
                <Equation>{"max      [[5, 4],\n          [2, 7]]"}</Equation>
                <p>The top-left output reports a maximum of 5. It does not tell us how many other cells were close to 5. Section 6 compares a window containing one 8 and three zeros with a window of four 2s. Max pooling distinguishes their peaks, while average pooling gives the same result for both.</p>
                <KeepInMind>
                  A maximum reports the strongest evidence in the window and
                  discards how much other evidence there was.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The mean of the window">
                <p>
                  The second summary keeps the mean. The same four windows of the
                  patch sum to 12, 8, 4 and 16, and each holds four cells.
                </p>
                <Equation>
                  {
                    "12 / 4 = 3,   8 / 4 = 2,   4 / 4 = 1,   16 / 4 = 4\n\naverage  [[3, 2],\n          [1, 4]]"
                  }
                </Equation>
                <p>Both comparison windows average to 2, so the mean cannot distinguish one isolated large value from several equal moderate values in this case. Max pooling can distinguish them, but omits their total response. The useful summary depends on which differences the next layers need for the task.</p>
                <KeepInMind>
                  A mean reports how much response there was on average, so a
                  strong reading among quiet ones and several moderate readings
                  can come out alike.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Both on one window">
                <p>The widget compares both summaries on one window. It also shows how a small change to each input would affect the output. These local sensitivities determine how the backward pass distributes an arriving loss derivative. Part 4 follows that calculation through a full map.</p>
                <WindowSummaries />
                <WorkedExample title="The patch’s top left window">
                  <>
<p>For the top-left window, max pooling returns 5. While that value remains the unique maximum, changing it slightly changes the output by the same amount. Small changes to the other values leave the maximum unchanged. Its local derivative grid is therefore 0, 1, 0, 0. Average pooling returns 3, with a local derivative of one quarter for each input.</p>
                  <p>In exact arithmetic, the four derivative shares sum to one for either operation. A three-by-three average-pooling window assigns one ninth to each input. Floating-point calculations approximate those fractions; section 18 checks the resulting rounding differences.</p>
</>
                </WorkedExample>
                <KeepInMind>
                  Both operations use the same window geometry in this SDK. Their forward summaries and local derivative rules differ. The remaining sweep and shape checks can be shared.</KeepInMind>
              </SubSection>

              <SubSection title="7. Pooling has no learned weights">
                <p>Pooling has no trainable weight matrix or bias. A training step therefore has no parameters to update, and this SDK returns the same layer object. A saved network still needs the pooling configuration, including its window, stride and summary rule, to reproduce the operation.</p>
                <p>
                  Pooling applies its summary directly, without a separate
                  activation stage. Max pooling is itself a nonlinear operation;
                  average pooling is linear. This library therefore stores the
                  same result as both the layer&rsquo;s score and output.
                  Neither pooling method has parameter gradients, since neither
                  has trainable parameters. Both still calculate input gradients
                  so earlier layers can learn.
                </p>
                <KeepInMind>
                  These pooling layers have no trainable parameters. They still calculate input gradients, allowing loss information to reach earlier layers.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. The Arrangement, Settled Before Any Data",
          content: (
            <>
              <SubSection title="8. The window, the stride, and the sweep">
                <p>For these SDK layers, choose the square window width, stride and summary rule. The configured input shape supplies the channel count and spatial dimensions. The window starts at the top left, moves across by the stride, then moves down by the stride and starts a new row. Other libraries may also offer padding or per-axis settings.</p>
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

              <SubSection title="9. The output extent, in integers">
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
                <WhyThisWorks title="Count the window positions that still fit inside the input">
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
                  Only complete windows are included. The floor in the formula accounts for the final starting position that still fits, so an uncovered margin may remain at the far edge.</KeepInMind>
              </SubSection>

              <SubSection title="10. What a stride that does not divide the side leaves out">
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
                <>
<p>
                  Choose the rows in the table and watch the grid beside it. At a window of two and a stride of two nothing is pale. At a window of three and a stride of three the last two rows and the last two columns are, twenty-eight cells again by a different route. At a window of one and a stride of two, which throws away three cells in four without looking at them, forty-eight are pale.
                </p>
                <p>
                  There is no padding here, so the far edge is simply dropped rather than extended with zeros, and a five by five patch under a window of two at a stride of two comes out two by two with its fifth row and fifth column ignored.
                </p>
</>
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
                  A far-edge margin remains when the last sampled window stops before the end of the input. This depends on the window as well as the stride and extent. Separately, a stride larger than the window can leave gaps between windows. The coverage table makes both effects visible.</KeepInMind>
              </SubSection>

              <SubSection title="11. Overlap, and a stride larger than the window">
                <p>When stride is smaller than the window, adjacent windows overlap, as in the 2012 ImageNet network’s pooling layers. When stride is larger, gaps can appear between windows. Both configurations are accepted here, but omitted pixels may matter to the task. On a four-by-four patch, a two-by-two window at stride three has only one valid position: it reads four pixels and leaves twelve unread.</p>
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
                        "the complete windows tile without overlap; covered cells belong to one window, while a leftover far-edge margin may be omitted.",
                    },
                    {
                      expression: "stride > window",
                      reason:
                        "the windows skip, whole rows and columns belong to nothing, and those cells are neither read nor corrected.",
                    },
                  ]}
                />
                <KeepInMind>
                  Overlap retains more output positions and combines several gradient contributions at shared inputs. A larger stride can omit input regions. Either may be deliberate, so compare coverage and output size with the task’s needs.</KeepInMind>
              </SubSection>

              <SubSection title="12. How many numbers are carried forward">
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
                  <p>The eight maps contain 5,408 input values. A two-by-two window at stride two produces 1,352 summaries, one quarter as many output values, while still covering every input. With a three-by-three window at stride two, there are 1,152 outputs and fifty-one of each map’s 676 input positions fall outside every window. A two-by-two window at stride one produces 5,000 overlapping summaries. Output reduction and unread input positions are different quantities.</p>
                </InAModel>
                <p>When a two-by-two, stride-two operation divides both spatial dimensions evenly, it halves each side and quarters the map area. Three such operations leave one eighth of each original side, or one sixty-fourth of the area, if the dimensions support all three divisions. This can make a later dense layer much smaller.</p>
                <KeepInMind>
                  With matching window and stride and evenly divisible dimensions, the number of spatial output positions is reduced by the square of the stride. Otherwise the floor and omitted margins also affect the count. These operations preserve the channel count.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            several(
              "A bank of eight detectors answers with eight maps of twenty-six by twenty-six. Which of these hold when that goes through a pooling layer?",
              [
                              "Each map is pooled by itself and the answers are never combined across maps",
                              "At a window of two and a stride of two the arrangement becomes eight maps of thirteen by thirteen",
                              "A shape that counted only the 5408 numbers could not tell that stack from a single row of 5408",
                              "The channel count shrinks along with the two spatial extents",
                            ],
              [0, 1, 2],
              "This pooling layer summarizes spatial windows separately within each input channel. It reduces height and width while preserving the eight-channel axis. Combining responses across channels would be a different operation. The shape tuple keeps that distinction visible.",
              {
                "description": "This is spatial pooling applied independently to each channel, with no padding. The input shape is (channels, height, width) = (8, 26, 26). The proposed window and stride are both 2 in each spatial direction."
              },
            ),
            choice(
              "One window holds a single 8 among three zeros and another holds four 2s. What do the two summaries answer?",
              [
                "A maximum answers 8 and 2; an average answers 2 and 2",
                "A maximum answers 8 and 8; an average answers 2 and 2",
                "Both summaries tell the two windows apart",
                "Neither summary tells the two windows apart",
              ],
              0,
              "A maximum reports the strongest evidence and discards how much other evidence there was, which is the difference between those two windows stated as loudly as it can be. A mean reports how much response there was on average, so a strong reading among quiet ones and several moderate readings come out alike. Which behavior is wanted is a question about the data rather than about the layer.",
            ),
            trueFalse(
              "A pooling layer applies an activation function after taking its summary.",
              false,
              "It applies the summary directly and there is no separate activation stage. Max pooling is itself a nonlinear operation and average pooling is linear, and because there is nothing between the two the library stores the same result as both the layer’s score and its output. There are no parameters anywhere in the layer either, so a training step gives back the same layer object.",
            ),
            choice(
              "A window of two at a stride of three sweeps an eight by eight patch. How many cells lie in no window at all?",
              ["Twelve", "Sixteen", "Twenty-eight", "None, since every cell is covered"],
              2,
              "The windows sit at columns zero, three and six, so columns two and five are covered by nothing, and twenty-eight of the sixty-four cells are never read. The layer never reads them, the answers do not depend on them, and no correction ever reaches them. Nothing warns about it, which is why the count is worth working out when the numbers are chosen.",
            ),
            trueFalse(
              "For input sides divisible by eight, three pooling layers with window two and stride two leave one sixty-fourth of the original spatial area.",
              true,
              "A window of two at a stride of two halves each spatial side, and halving two sides quarters their product, so the effect compounds across layers. That is how a network gets from a picture to a few hundred numbers a dense layer can read, and the channel count is a constant factor throughout.",
            ),
        ],
        },
        {
          title: "Part 4. Where the Gradients Go",
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
                  {"input gradient at cell i  =  arriving slope  ×  ∂answer / ∂cell i"}
                </Equation>
                <p>{"Select max and enable the overlay in the top activity. Each of the four outputs receives a derivative of one. Under that setup, the highlighted input derivatives show directly how each output's contribution is distributed within its window."}</p>
                <KeepInMind>
                  For one window, multiply the arriving derivative by each local derivative share. If windows overlap, add all contributions that reach the same input.</KeepInMind>
              </SubSection>

              <SubSection title="14. The derivative of a maximum">
                <p>While one input is the unique maximum, sufficiently small changes preserve that winner. The output changes one for one with the winning input and does not change with a small adjustment to another input. These are local derivatives. At a tied maximum, the function has no unique derivative, so Part 6 explains the convention used by the SDK.</p>
                <Equation>
                  {
                    "y = max(x₁, …, xₙ)\n\n∂y/∂xᵢ = 1 if i won the window, and 0 otherwise"
                  }
                </Equation>
                <p>In the top-left example, the unique maximum is 5. Its derivative share is one and the shares for 1, 4 and 2 are zero. Small changes to those lower values do not change the output while they remain below 5. The backward pass multiplies these shares by the arriving loss derivative.</p>
                <KeepInMind>
                  Max pooling routes each window’s arriving derivative to its selected maximum. A cell selected by no window receives no contribution from this pooling operation on that pass. It may still receive gradients through other routes in a larger network.</KeepInMind>
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
                <p>{"For a two by two average-pooling window, each of its four cells receives a quarter of the derivative arriving at that output. The distribution does not depend on which cell held the largest value. This gives every input a route for that window's gradient, while also sending the same fraction to a weak contributor as to a strong one. A zero arriving derivative still gives zero contributions."}</p>
                <KeepInMind>
                  Average pooling assigns equal local derivative shares to all positions in a window. Those shares do not depend on the input values. The actual contributions also depend on the arriving derivative, which may be zero.</KeepInMind>
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
                <p>Only four input positions receive nonzero derivatives in this max-pooling example. Earlier layers receive the loss signal through those positions on this pass. Other inputs may become winners after the parameters or data change, but there is no guarantee that every position will eventually be selected. Shared earlier weights can still be updated from whichever positions do receive derivatives.</p>
                <KeepInMind>
                  Which cells receive correction is decided by the kind of
                  pooling, and under a maximum it is decided afresh by the values
                  at every step.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Why the shares in a window sum to one">
                <p>For the two operations here, the local derivative shares sum to one. Average pooling assigns equal shares whose sum is one. Max pooling assigns one to the unique winner and zero elsewhere; the SDK uses the same one-selected-position pattern under its tie convention. This identity is a useful consistency check for these rules.</p>
                <Equation>{"Σᵢ ∂y/∂xᵢ = 1"}</Equation>
                <p>The sum describes signed derivative contributions, not every measure of gradient size. If every input in one window increases by the same amount, max and average pooling increase by that amount too. Their derivative shares therefore sum to one. A different operation, such as summing the window, has a different scale and would need a different expected check.</p>
                <KeepInMind>
                  For max and average pooling, the sum of input derivatives equals the sum of arriving derivatives when all window contributions are included. Their distribution and norms can still change. Test the rule the operation is intended to implement.</KeepInMind>
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
                <>
<p>
                  For sixteen of the first thirty-two window widths, the computed sum differs slightly from one. The largest is 1.0000000000000004 at width 31, about 4.4e-16 above one. These are small floating-point errors, so the test should use a suitable tolerance. An exact-equality test happens to pass at width two and fail at width seven; checking only the first case would miss that numerical issue.
                </p>
                <p>
                  A maximum, whose shares are a single 1 and some zeros, is exact at every side.
                </p>
</>
                <KeepInMind>
                  Use a floating-point tolerance when checking average-pooling shares, and include windows whose fractions are not exactly representable. Exact binary-fraction cases remain useful tests, but they do not exercise the same rounding behavior.</KeepInMind>
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
                    "input gradient at cell i  =  Σ over the windows holding i of   arriving slope × ∂answer / ∂cell i"
                  }
                </Equation>
                <p>The backward pass adds contributions into each input-gradient cell. Overwriting a cell at each window would retain only the final contribution, producing the wrong gradient even if its shape and entries looked plausible. Shape validation would not detect that error; a numerical gradient comparison can.</p>
                <KeepInMind>
                  With overlapping windows a cell&rsquo;s correction is a sum over
                  every window it belongs to. The disjoint case hides this
                  entirely, since each sum has one term.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The total handed down is one per window">
                <p>{"The derivative shares within one pooling window sum to one, so that window distributes its full arriving derivative to the inputs. Adding across windows preserves the sum of those signed derivatives for either pooling operation and any supported stride. An input in overlapping windows receives each applicable contribution."}</p>
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
                <p>{"Overlap can increase the number of output windows, giving us more arriving derivatives to distribute. To isolate overlap itself, compare cases with the same total arriving derivative. Under that comparison the total passed to the inputs is unchanged; its distribution among input positions can still differ."}</p>
                <KeepInMind>
                  For these rules, the sum of signed input gradients equals the sum of arriving gradients at every supported stride, within numerical tolerance. That is a useful implementation check alongside checks of individual entries.</KeepInMind>
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
                <p>{"Max pooling can concentrate the derivatives on one locally large cell that wins several overlapping windows, while nearby cells receive none from those windows. Average pooling spreads each contribution evenly. In the displayed arrangement, an interior cell belongs to four times as many windows as a corner and therefore receives four times its contribution when the output derivatives are equal."}</p>
                <KeepInMind>

                  With total arriving derivative held fixed, overlap changes how contributions are distributed. Max pooling can concentrate them at repeated winners. Average pooling can give interior positions more contributions because they belong to more windows.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "A slope of one arrives at each of the four answers from a four by four patch at a window of two and a stride of two. What is handed down?",
              [
                "A maximum gives 1 to each of four cells and 0 to the other twelve; an average gives 0.25 to all sixteen",
                "A maximum gives 0.25 to each of four cells; an average gives 1 to all sixteen",
                "Both give 0.25 to all sixteen, since the shares must sum to one",
                "A maximum gives 1 to all sixteen, since each cell belongs to one window",
              ],
              0,
              "Over the range where the winning cell keeps winning, the answer simply is that cell, so the whole arriving slope goes to the winner and the rest of the window receives nothing. An average enters every cell with the same coefficient, one over the number of cells, so each of the four cells in a two by two window takes a quarter whatever it holds.",
            ),
            trueFalse(
              "Under a maximum, a cell that never wins a window still receives some correction, scaled by how close it came.",
              false,
              "It receives nothing at all, however large it is. In the top left window the answer 5 was 5 because of the cell holding 5, and the cells holding 1, 4 and 2 could each have been anything smaller without changing the answer, so a correction reaching them would be a correction for something they did not cause. A different four may win on the next step, which is an argument about the data rather than a guarantee.",
            ),
            trueFalse(
              "An average over a window of seven hands out forty-nine shares that add up to 0.9999999999999999 rather than to exactly one.",
              true,
              "The mathematical share is the reciprocal of 49, which float64 cannot represent exactly. Summing its floating-point approximations gives the reported tiny residual on this run. Other window sizes and summation implementations can round differently. Test the total with a suitable tolerance, including windows whose shares are not exactly representable.",
            ),
            choice(
              "The stride drops from two to one with the window left at two. What happens to the blame handed down?",
              [
                "The total is unchanged, and what moves is where it lands",
                "The total rises, because there are now nine windows sending it rather than four",
                "The total falls, because the overlapping windows divide it between them",
                "The total is unchanged and every cell receives the same amount it did before",
              ],
              0,
              "The shares inside a window add up to one, so whatever arrives at a window is handed down in full, and the total blame equals the total arriving at every stride. What changes is the distribution. At a stride of one the cell holding 4 in the second row wins three of the nine windows and receives 3, while under an average an interior cell belongs to four windows and takes four quarters, which is exactly 1.",
            ),
            trueFalse(
              "A backward pass that writes into the gradient block instead of adding into it produces a gradient of exactly the right arrangement, full of plausible finite numbers, on a layer that carries on training.",
              true,
              "Writing keeps only whichever window was visited last, so a cell that belongs to several windows is credited for one of them, and nothing about the shapes would catch it and no answer would look wrong. The disjoint case hides the question entirely, since there each cell belongs to one window and each sum has one term, which is why the mistake is only visible at a stride smaller than the window, where the cell in the middle of the patch is owed the sum of four arriving slopes.",
            ),
        ],
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
                <>
<p>
                  This one chooses the first cell in row-major order, the top row before the bottom and the left before the right. Load the flat patch in the box at the top, where every window is a four-way tie, and each window sends its whole slope to its own top left cell, four of the sixteen in total.
                </p>
                <p>Splitting a tied maximum’s arriving derivative among the tied positions is another valid convention. More generally, nonnegative shares across tied maxima that sum to one form valid subgradients, possible backward directions at this nondifferentiable point. Different choices can produce different updates. Ties are common in some data, including regions made zero by ReLU, so check the convention when comparing implementations.</p>
</>
                <KeepInMind>
                  On a tie the backward pass follows a stated convention rather
                  than a derivative. A gradient check cannot arbitrate it, because
                  the one-sided differences genuinely disagree there, so the
                  convention has to be tested directly.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Why the winner is recomputed rather than remembered">
                <p>{"The backward pass needs to identify the same winning positions used by the forward calculation. This implementation retains the input block rather than storing a separate winner table. It recomputes the maxima from those saved values using the same tie rule, which preserves the routing for that forward pass."}</p>
                <p>Recomputing winners requires another scan of each window. Storing winner indices during the forward pass would consume additional response memory but avoid that backward scan. This implementation chooses recomputation from the saved input; other implementations can make a different memory-versus-computation tradeoff.</p>
                <p>Dropout needs different information for its backward pass. Its mask is random, so the input values alone do not determine it. The SDK saves that mask. A system could instead reproduce the same draw from saved random-generator state and the same draw sequence, but inferring the mask from zero outputs is ambiguous when inputs themselves contain zeros. The <Link href="/concepts/dropout" className={link}>dropout page</Link> demonstrates that ambiguity.</p>
                <KeepInMind>
                  A max-pooling winner can be recovered from the saved input and tie rule. A dropout mask needs information about the random draw as well. Backward calculations must use the choices from their own forward pass.</KeepInMind>
              </SubSection>

              <SubSection title="24. Tolerance to a small shift, measured">
                <p>We can measure shift sensitivity on a particular pattern. Use an eight-by-eight patch with its third column lit and all other values zero. Pool with a two-by-two window and stride two, then move the pattern one column right and compare the result.</p>
                <ShiftTolerance />
                <InAModel title="One column, moved">
                  <>
<p>
                    Moving the stroke one column changes 16 of the picture&rsquo;s 64 cells, since eight go dark and eight light up, and changes 0 of the pooled map&rsquo;s 16 cells under either kind. The third and fourth columns share a window, so the stroke moved within it and the summaries did not notice. Move it a second column and it crosses into the next window, 8 of the 16 pooled cells change, and the bright column of the map moves one cell along.
                  </p>
                  <p>
                    The largest single change is 9 under a maximum and 4.5 under an average, which is the stroke&rsquo;s own value and half of it.
                  </p>
</>
                </InAModel>
                <p>Both shifted strokes give the next layer the same pooled representation in this example. A later classifier therefore cannot distinguish them from these pooled values alone. This demonstrates one specific position tolerance; it does not establish that two arbitrary shifted pictures of a digit will have equal representations.</p>
                <KeepInMind>
                  The summaries stay unchanged when a movement only permutes values within each of these disjoint windows. A general image shift can move values across boundaries or change several windows at once, so window width is not a guaranteed shift-tolerance radius.</KeepInMind>
              </SubSection>

              <SubSection title="25. What that tolerance is not">
                <>
<p>The result is specific to this stroke and window alignment. Pooling is not generally invariant to translations, including shifts smaller than the window. It also does not enforce general rotation or scale invariance. Comparing several patterns and alignments is necessary before claiming tolerance for a particular network.</p>
                <p>Stacking pooling layers enlarges the input region summarized by later outputs, while retaining sampling boundaries. It does not remove shift sensitivity in general. Other designs, including learned strided convolutions and training on translated examples, can also build useful tolerance. Their computation and behavior need to be compared for the task.</p>
</>
                <KeepInMind>
                  Fixed pooling can reduce sensitivity to some position changes without learned pooling parameters. The amount depends on the pattern, window alignment and summary. It is one design choice rather than a guarantee of general invariance.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Making Window Boundaries and Backward Routing Explicit" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="26. Stride, padding and how the layer handles a tied maximum" id="26-what-a-complete-implementation-must-specify">
                <p>A pooling layer needs an explicit input arrangement, window and stride. Its contract also states whether settings can differ by spatial axis, whether padding is used, and whether incomplete windows at the edge are omitted.</p>
<p>The summary determines the backward rule. Maximum pooling needs a tie convention; average pooling distributes the incoming derivative across its window. Overlapping windows must accumulate contributions at shared input cells.</p>
<p>Pooling has no trainable parameters, so its API must distinguish the absence of a parameter gradient from a parameter whose gradient is zero. The layer still passes input derivatives backward.</p>
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
                        "none. There is no padding setting, so the far margin is dropped and the output extent is the floor formula of section 9.",
                    },
                    {
                      expression: "the tie in a maximum",
                      reason:
                        "the first maximum in row-major order, matching the argmax rule used by the backward calculation.",
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
                        "returns the same layer object because this operation has no trainable parameters to update.",
                    },
                    {
                      expression: "the score and the answer",
                      reason:
                        "the same block of numbers; the pooling summary has no separate activation stage in this interface.",
                    },
                  ]}
                />
                <KeepInMind>
                  When results differ, compare input shape, window, stride, padding, edge-window handling and the summary rule. Tie handling affects max-pooling backward routing even when forward maps agree.</KeepInMind>
              </SubSection>

              <SubSection title="27. Partial windows, repeated maxima and incompatible shapes" id="27-the-edges-probed">
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
                <>
<p>The widget also includes three accepted cases. With a two-by-two window and stride three on a four-by-four patch, one valid window reads four cells and leaves twelve outside every window. This is sparse sampling, not a rejected configuration. Its usefulness depends on whether those omitted positions matter.</p>
                <p>A one-by-one window at stride one returns every value unchanged. With an arriving derivative of one at each output, each input also receives one. A training step returns the same pooling layer because there are no trainable parameters to update.</p>
</>
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
                  The shape error reports the expected channel, height and width axes. A bare integer is insufficient here even though it is accepted as a width by a dense layer. Check the expected input arrangement when moving between layer types.</KeepInMind>
              </SubSection>

              <SubSection title="28. Pairing a layer with its forward response" id="28-the-pairing-nothing-refuses">
                <p>The backward method checks response and arriving-gradient shapes. Those checks do not verify which layer instance produced the response. Different pooling configurations can have matching input and output shapes, so a manually paired response can pass validation while using the wrong window geometry.</p>
                <WorkedExample title="Two layers of one shape">
                  <>
<p>
                    A window of three at a stride of one over a four by four patch answers 2 by 2. So does a window of two at a stride of two. Ask the first to pool a picture, then hand its response to the second along with four arriving values 1, 2, 3 and 4. Nothing is raised.
                  </p>
                  <p>
                    Both hand down a total of 10, which agrees to the last bit. And 6 of the 16 cells receive something different, with the second layer routing three of the four values to cells that never won the windows they came from.
                  </p>
</>
                </WorkedExample>
                <p>Use the layer that produced a response when calculating its backward result. LayerStack keeps the matching layer and response at each position automatically. A caller using individual layers must retain that pairing explicitly. The example shows why matching shapes and matching derivative totals are insufficient to establish correct routing.</p>
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
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            choice(
              "Two cells in a window hold the same largest value. What does this implementation do?",
              [
                "It gives the whole slope to the first cell in row-major order, as a stated convention",
                "It splits the slope evenly between the tied cells, which the symmetry requires",
                "It refuses the window, since the derivative does not exist there",
                "It picks one of the tied cells at random so that no cell is favored over many steps",
              ],
              0,
              "At a tied maximum, the function is not differentiable in one unique way. This implementation selects the first maximum under its traversal order and sends that entry the upstream derivative. Splitting a derivative among tied entries is another possible subgradient convention. A central finite difference at the tie does not establish which convention the API promises, so test that promise directly.",
            ),
            trueFalse(
              "The forward pass records which cell won each window and hands that record to the backward pass.",
              false,
              "The forward response retains the input values. The backward pass finds each winner again from those values using the same traversal and tie rule. That trades stored winner indices for another window scan. A dropout mask is not determined by input values alone; reproducing its draw would also require the same random-generator state.",
            ),
            choice(
              "An eight by eight patch lit along its third column is pooled at a window of two and a stride of two, then the stroke moves one column right and it is pooled again. What changed?",
              [
                "16 of the picture’s 64 cells, and none of the pooled map’s 16",
                "16 of the picture’s 64 cells, and 8 of the pooled map’s 16",
                "8 of the picture’s 64 cells, and none of the pooled map’s 16",
                "Nothing in either, since the layer is invariant to shift",
              ],
              0,
              "The third and fourth input columns belong to the same pooling windows here, so moving this stroke between them leaves both summaries unchanged. The next move crosses a boundary and changes eight pooled cells. There is no universal one-pixel or window-width tolerance: even a small shift can cross a boundary, depending on the starting position and other values.",
            ),
            several(
              "Which of these are named as things pooling does not buy?",
              [
                "General shift invariance: a shift can change which values fall in each window",
                "Invariance to rotation",
                "Invariance to scale",
                "Removal of the window boundary, once several such layers are stacked"
              ],
              [0, 1, 2, 3],
              "Pooling summarizes values within fixed windows. Some local changes leave a particular summary unchanged, but moving values across a window boundary can change it. Stacking pooling layers gives coarser windows rather than eliminating boundaries. Rotation and scale tolerance need further architectural choices or training evidence.",
            ),
            choice(
              "A window of three at a stride of one and a window of two at a stride of two both answer two by two from a four by four patch. What happens if a response from the first is handed to the second?",
              [
                "Nothing is raised, both hand down a total of 10, and 6 of the 16 cells receive something different",
                "The second layer refuses the response, because the window widths differ",
                "The two layers hand down different totals, which is how the mistake shows up",
                "The second layer silently reproduces the first layer’s answer",
              ],
              0,
              "The incoming derivative shape matches both layers, so that check cannot identify which forward operation produced the response. Their different windows select different input locations, giving an incorrect derivative route when the response is paired with the wrong layer. An ordinary stack keeps each layer beside its own response. Direct API callers must preserve that pairing too.",
            ),
        ],
        },
        {
          title: "Practice. Pooling the Four by Four Patch With the Library",
          practice: [
            exercise(
              "Pool the running patch both ways",
              [
  "Apply maximum and average pooling to the supplied four-by-four one-channel patch, using two-by-two windows at stride two.",
  "Print each output shape, pooled map and sum of all pooled outputs. Compare the average-map total with the original patch total; the same relationship is not promised for maxima."
],
              `import numpy as np
from oop_ml import AveragePool2d, MaxPool2d

patch = np.array([[1.0, 5.0, 1.0, 3.0], [4.0, 2.0, 4.0, 0.0], [0.0, 1.0, 3.0, 1.0], [2.0, 1.0, 7.0, 5.0]])

for kind in (MaxPool2d, AveragePool2d):
    # Build the layer reading (1, 4, 4) with a window of two at a stride of
    # two, respond to the patch, and print the arrangement it answers with,
    # the pooled map, and what the four answers add up to.
    pass`,
              `import numpy as np
from oop_ml import AveragePool2d, MaxPool2d

patch = np.array([[1.0, 5.0, 1.0, 3.0], [4.0, 2.0, 4.0, 0.0], [0.0, 1.0, 3.0, 1.0], [2.0, 1.0, 7.0, 5.0]])

for kind in (MaxPool2d, AveragePool2d):
    layer = kind(reads=(1, 4, 4), window=2, stride=2)
    pooled = np.asarray(layer.respond_to(patch[None, None]).outputs)[0, 0]
    print(f"{kind.__name__} answers {layer.shape.answers}")
    print(pooled)
    print(f"the four answers add up to {pooled.sum():.0f}")`,
              `MaxPool2d answers (1, 2, 2)
[[5. 4.]
 [2. 7.]]
the four answers add up to 18
AveragePool2d answers (1, 2, 2)
[[3. 2.]
 [1. 4.]]
the four answers add up to 10`,
              { hints: [
  "The nonoverlapping windows cover every original cell once.",
  "Use the identical layout and window settings for both summaries."
], check: numberCheck("What do the four averages add up to?", 10, 0.5, "The four averages total ten. Each nonoverlapping window contributes its local mean, so their sum is reduced relative to the sum of all original cells."), question: "What does a maximum retain that an average combines?" },
            ),
            exercise(
              "Hand a slope of one back down, at both strides",
              [
  "For maximum and average pooling, run the supplied patch at strides two and one with window size two. Send derivative one to every output.",
  "Print window count, total input derivative, nonzero input-derivative count and the derivative at zero-based row 1/column 2 for every setting."
],
              `import numpy as np
from oop_ml import AveragePool2d, MaxPool2d

patch = np.array([[1.0, 5.0, 1.0, 3.0], [4.0, 2.0, 4.0, 0.0], [0.0, 1.0, 3.0, 1.0], [2.0, 1.0, 7.0, 5.0]])

for stride in (2, 1):
    for kind in (MaxPool2d, AveragePool2d):
        layer = kind(reads=(1, 4, 4), window=2, stride=stride)
        response = layer.respond_to(patch[None, None])
        # Build a block of ones the shape of the outputs, take the layer's
        # correction, and print the number of windows, the total blame
        # handed down, how many cells received anything, and the blame on
        # the cell at row 1, column 2, which holds the 4.`,
              `import numpy as np
from oop_ml import AveragePool2d, MaxPool2d

patch = np.array([[1.0, 5.0, 1.0, 3.0], [4.0, 2.0, 4.0, 0.0], [0.0, 1.0, 3.0, 1.0], [2.0, 1.0, 7.0, 5.0]])

for stride in (2, 1):
    for kind in (MaxPool2d, AveragePool2d):
        layer = kind(reads=(1, 4, 4), window=2, stride=stride)
        response = layer.respond_to(patch[None, None])
        arriving = np.ones_like(np.asarray(response.outputs))
        blame = np.asarray(layer.correction_for(response, arriving).passed_down)[0, 0]
        print(
            f"{kind.__name__} at stride {stride}: {arriving.size} windows, total blame {blame.sum():.0f}, "
            f"cells receiving anything {np.count_nonzero(blame)}, "
            f"the 4 at row 1, column 2 receives {blame[1, 2]:.2f}"
        )`,
              `MaxPool2d at stride 2: 4 windows, total blame 4, cells receiving anything 4, the 4 at row 1, column 2 receives 1.00
AveragePool2d at stride 2: 4 windows, total blame 4, cells receiving anything 16, the 4 at row 1, column 2 receives 0.25
MaxPool2d at stride 1: 9 windows, total blame 9, cells receiving anything 5, the 4 at row 1, column 2 receives 3.00
AveragePool2d at stride 1: 9 windows, total blame 9, cells receiving anything 16, the 4 at row 1, column 2 receives 1.00`,
              { hints: [
  "Maximum pooling routes a contribution to its selected winner; average pooling distributes it over the window.",
  "An input participating in several overlapping windows accumulates their contributions."
], check: numberCheck("Under a maximum at a stride of one, how many of the sixteen cells receive anything?", 5, 0.5, "Five input cells receive nonzero derivatives. Some cells win more than one overlapping maximum window and collect repeated contributions."), question: "How do overlapping pooling windows combine backward contributions?" },
            ),
            exercise(
              "Ask one window for its summary and its shares, then test the sum",
              [
  "Use the supplied top-left two-by-two window to inspect summarize and shares_of for both pooling rules. Print its summary, share map and share sum.",
  "For average-pooling square windows of sides one through eight, print the exact floating-point sum of all shares. Do not round the total before inspecting it."
],
              `import numpy as np
from oop_ml import AveragePool2d, MaxPool2d

window = np.array([[1.0, 5.0], [4.0, 2.0]])
for kind in (MaxPool2d, AveragePool2d):
    layer = kind(reads=(1, 2, 2), window=2, stride=2)
    # Print what the layer keeps from the window, the grid of shares it owes,
    # and what those shares add up to.

for side in range(1, 9):
    # Build an average pooling layer whose window is the whole side by side
    # picture, ask it for the shares of a window of zeros that size, and print
    # the side, how many shares there are, and their exact total.
    pass`,
              `import numpy as np
from oop_ml import AveragePool2d, MaxPool2d

window = np.array([[1.0, 5.0], [4.0, 2.0]])
for kind in (MaxPool2d, AveragePool2d):
    layer = kind(reads=(1, 2, 2), window=2, stride=2)
    shares = layer.shares_of(window)
    print(f"{kind.__name__} keeps {layer.summarise(window):.0f}")
    print(shares)
    print(f"its shares add up to {float(shares.sum())!r}")

for side in range(1, 9):
    layer = AveragePool2d(reads=(1, side, side), window=side, stride=side)
    total = float(layer.shares_of(np.zeros((side, side))).sum())
    print(f"side {side}: {side * side} shares add up to {total!r}")`,
              `MaxPool2d keeps 5
[[0. 1.]
 [0. 0.]]
its shares add up to 1.0
AveragePool2d keeps 3
[[0.25 0.25]
 [0.25 0.25]]
its shares add up to 1.0
side 1: 1 shares add up to 1.0
side 2: 4 shares add up to 1.0
side 3: 9 shares add up to 1.0
side 4: 16 shares add up to 1.0
side 5: 25 shares add up to 1.0
side 6: 36 shares add up to 1.0
side 7: 49 shares add up to 0.9999999999999999
side 8: 64 shares add up to 1.0`,
              { hints: [
  "shares_of supplies how an upstream derivative is distributed locally.",
  "Exact mathematical totals can acquire a tiny floating-point residual when many equal fractions are summed."
], check: numberCheck("At which window side between one and eight do the shares fail to add up to exactly one?", 7, 0.5, "The side-seven window shows the tiny residual. Floating-point summation of equal shares can differ from the exact mathematical total without a missing contribution."), question: "What local derivative shares does each pooling rule assign?" },
            ),
            exercise(
              "Measure the shift tolerance",
              [
  "Draw the supplied eight-by-eight image with value nine in zero-based column two and zero elsewhere. Compare maximum and average pooling at window two/stride two.",
  "Move the stroke right by one and two columns. For every method/shift print changed input cells, changed pooled cells and largest pooled-value change relative to the original."
],
              `import numpy as np
from oop_ml import AveragePool2d, MaxPool2d

stroke = np.zeros((8, 8))
stroke[:, 2] = 9.0
for kind in (MaxPool2d, AveragePool2d):
    layer = kind(reads=(1, 8, 8), window=2, stride=2)
    settled = np.asarray(layer.respond_to(stroke[None, None]).outputs)[0, 0]
    for shift in (1, 2):
        # Slide the stroke shift columns to the right, pool it, and print how
        # many picture cells changed, how many pooled cells changed, and the
        # largest change in any pooled cell.
        pass`,
              `import numpy as np
from oop_ml import AveragePool2d, MaxPool2d

stroke = np.zeros((8, 8))
stroke[:, 2] = 9.0
for kind in (MaxPool2d, AveragePool2d):
    layer = kind(reads=(1, 8, 8), window=2, stride=2)
    settled = np.asarray(layer.respond_to(stroke[None, None]).outputs)[0, 0]
    for shift in (1, 2):
        moved = np.zeros_like(stroke)
        moved[:, shift:] = stroke[:, : 8 - shift]
        pooled = np.asarray(layer.respond_to(moved[None, None]).outputs)[0, 0]
        print(
            f"{kind.__name__} shift {shift}: {np.count_nonzero(moved != stroke)} of 64 picture cells changed, "
            f"{np.count_nonzero(pooled != settled)} of 16 pooled cells changed, "
            f"largest change {np.abs(pooled - settled).max()}"
        )`,
              `MaxPool2d shift 1: 16 of 64 picture cells changed, 0 of 16 pooled cells changed, largest change 0.0
MaxPool2d shift 2: 16 of 64 picture cells changed, 8 of 16 pooled cells changed, largest change 9.0
AveragePool2d shift 1: 16 of 64 picture cells changed, 0 of 16 pooled cells changed, largest change 0.0
AveragePool2d shift 2: 16 of 64 picture cells changed, 8 of 16 pooled cells changed, largest change 4.5`,
              { hints: [
  "Use the same original response as the reference for both shifts.",
  "A shift within the same nonoverlapping window can preserve its summary; crossing into the next window can move that summary."
], check: numberCheck("How many of the sixteen pooled cells change when the stroke has moved two columns?", 8, 0.5, "Eight pooled cells change after the two-column move. The stroke crosses into neighboring pooling windows rather than staying inside its original ones."), question: "Does moving a stroke within a pooling window differ from crossing its boundary?" },
            ),
          ],
        },
      ]}
    />
  );
}
