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
import { ConvolutionEdgeCases } from "@/components/widgets/ConvolutionEdgeCases";
import { ConvolutionParameterCount } from "@/components/widgets/ConvolutionParameterCount";
import { ConvolutionPlayground } from "@/components/widgets/ConvolutionPlayground";
import { KernelBankMaps } from "@/components/widgets/KernelBankMaps";
import { ShiftLedger } from "@/components/widgets/ShiftLedger";
import { ShuffleComparison } from "@/components/widgets/ShuffleComparison";
import { SweepBackwardBlame } from "@/components/widgets/SweepBackwardBlame";
import { SweepCostTable } from "@/components/widgets/SweepCostTable";
import { SweepGeometryTable } from "@/components/widgets/SweepGeometryTable";

export const metadata: Metadata = {
  title: "Convolution · oop_ml",
  description:
    "Slide a small set of shared weights across a picture to produce a map of responses.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function ConvolutionPage() {
  return (
    <ConceptPage
      lessonId="convolution"
      intuition={lessonIntuitions["convolution"]}
      technicalStart="Part 2. One Kernel, Swept"
      openingTitle="Look for the Same Pattern in More Than One Place"
      playgroundIntro="Inspect one input window and the output value it produces. Move to the next position and check that the same weights are reused."
      title="Convolution"
      tagline="Slide a small set of shared weights across a picture to produce a map of responses."
      prerequisites={
        <>
          A convolution is a layer, so the{" "}
          <Link href="/concepts/dense-layers" className={link}>
            dense layer page
          </Link>{" "}
          comes first, since that is where what a layer reads and answers with
          was settled, and this page spends most of its length on the difference
          between the two. The sum at the heart of it is the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>
          &rsquo;s dot product taken over a small patch rather than a row.{" "}
          <Link href="/concepts/shapes-and-flattening" className={link}>
            Shapes and flattening
          </Link>{" "}
          is where an arrangement of extents was introduced, and Part 6 leans on{" "}
          <Link href="/concepts/backpropagation" className={link}>
            backpropagation
          </Link>{" "}
          for what a slope arriving from the layer above is.
        </>
      }

      playground={<ConvolutionPlayground />}
      sections={[
        {
          title: "Part 1. Why a Picture Is Not a Row",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The picture we will carry through the page">
                <p>
                  The grid on the left of the playground is eight cells by eight, with a four by four square painted in the middle of it, and every cell holds either a zero or a one. That is sixty-four numbers, and it is the picture every claim on this page is made about. The small grid in the middle holds nine weights.
                </p>
                <p>
                  The grid on the right is what comes back when those nine weights are swept across the picture, and it is six cells by six because a three by three window fits into an eight by eight picture in six places along each side.
                </p>
                <p>
                  The square sits in rows 2 to 5 and columns 2 to 5, counting
                  from zero, so its left edge is the boundary between column 1
                  and column 2 and its right edge the boundary between column 5
                  and column 6. Every worked number below comes from that
                  arrangement, and the widgets on the page all start from it, so
                  a reader can hold one picture in mind for the whole of the
                  page rather than a fresh one per section.
                </p>
                <WorkedExample title="The picture, written out">
                  <p>
                    Rows 0, 1, 6 and 7 are dark all the way across. Rows 2, 3, 4
                    and 5 read 0, 0, 1, 1, 1, 1, 0, 0. Sixteen of the sixty-four
                    cells are lit, and they form a solid block with a straight
                    edge on each of its four sides.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Everything on this page is about one picture of sixty-four
                  numbers and one small grid of nine weights. Nothing here needs
                  a larger example to be true, and the counting section will show
                  what happens to the numbers when the picture does get larger.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A layer that reads a row is never told where the cells were">
                <p>
                  A dense layer takes a list of numbers and answers with another
                  list, and each of its answers is a weighted sum of the whole
                  input. To hand it this picture we first have to flatten it, so
                  the eight rows are laid end to end into a list of sixty-four.
                  Cell row 0 column 0 becomes entry 0, cell row 0 column 1
                  becomes entry 1, and cell row 1 column 0 becomes entry 8.
                </p>
                <p>
                  Once that has happened the layer has no way of knowing which entries were neighbours. Entry 0 and entry 1 were beside each other and entry 0 and entry 8 were one above the other, and entry 0 and entry 37 were nowhere near each other, but all three of those pairs look identical to a weighted sum.
                </p>
                <p>
                  The layer is not forbidden from learning the geometry, and given enough examples it can work out that certain entries tend to agree; it simply has not been told, and everything it comes to know about the arrangement has to be paid for out of the data.
                </p>
                <Equation>
                  {
                    "flattened[8 · row + column]  =  picture[row, column]\n\nanswer[j]  =  bias[j]  +  Σ over i of  weight[j, i] · flattened[i]"
                  }
                </Equation>
                <p>
                  There is a sharper way of putting the same thing. Take any
                  fixed shuffling of the sixty-four positions, apply it to every
                  picture the layer will ever see, and apply it to the columns of
                  the weight matrix as well. Nothing the layer answers changes,
                  because the sum is over the same set of products in a different
                  order. A reader who found that hard to believe should look at
                  the next section, where it is measured rather than argued.
                </p>
                <KeepInMind>
                  The complaint against a dense layer here is not that it cannot
                  read pictures. It is that the arrangement of the cells is a
                  fact about the world which the layer has to rediscover from
                  examples, and rediscovering it costs both weights and data.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What is lost by flattening, measured on a shuffle">
                <p>
                  Rather than take that on trust, we can run it. A fixed shuffle
                  moves the picture&rsquo;s sixty-four cells about, and the same
                  shuffle is applied to every weight of a layer that reads a row.
                  Then both readers are given both pictures, the original and the
                  shuffle, and asked what they answer. The measurement is what
                  the widget below prints on load.
                </p>
                <p>
                  The rewired row reader answers what it answered before. Its
                  largest disagreement across all thirty-six of its outputs is
                  2.2 × 10<sup>&minus;16</sup>, which is one rounding step in
                  double precision and not a difference of meaning; the answers
                  are not bit for bit identical only because the products were
                  added up in a different order. The same two pictures put
                  through one convolution give answers 6 apart at the worst cell,
                  with 27 of the 36 cells changed, on a map whose largest entry
                  at rest is 4.
                </p>
                <ShuffleComparison />
                <p>
                  The shuffle moved 18 of the 64 cells, so it was not a violent
                  rearrangement, and it was still enough to destroy every edge in
                  the picture. Look at the two swept maps side by side. The one
                  on the original has a clean column of positive answers where
                  the square begins, nothing across its interior, and a clean
                  column of negative answers where it ends. The one on the
                  shuffle has neither.
                </p>
                <KeepInMind>
                  Both readers hold parameters, and they hold very different
                  numbers of them, 10 against 2,340 on this picture. What the
                  shuffle exposes is a separate question from the count, which is
                  whether the arrangement of the cells is part of what the layer
                  computes at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Reading a window instead of a row">
                <p>
                  The repair is to stop giving the layer the whole picture at
                  once. Choose a small window, three cells by three, place it
                  over the top left corner of the picture, and form one weighted
                  sum of the nine cells beneath it. Then move the window one cell
                  to the right and form another, using the same nine weights.
                  Carry on until the window reaches the right edge, drop down a
                  row, and start again from the left.
                </p>
                <p>
                  Two things about that procedure are worth stating before any
                  arithmetic. A weight only ever multiplies a cell inside its own
                  window, so whatever the nine weights say, they say it about a
                  neighbourhood; that is locality. And the same nine numbers
                  answer at every position, so what they have learned to notice
                  they notice everywhere rather than once per place; that is
                  weight sharing. The rest of this page is those two facts
                  followed through.
                </p>
                <DerivationTable
                  expressionHeading="what changes"
                  reasonHeading="what it buys"
                  rows={[
                    {
                      expression: "a window, not a row",
                      reason:
                        "each answer depends on nine cells rather than sixty-four, and on nine that were beside one another in the picture.",
                    },
                    {
                      expression: "the same weights at every position",
                      reason:
                        "one set of nine, reused, rather than a fresh set per position. The count of parameters stops depending on the size of the picture.",
                    },
                    {
                      expression: "answers laid out as a map",
                      reason:
                        "the answer keeps the arrangement of the picture, so a second layer can read it as a picture in turn.",
                    },
                  ]}
                />
                <KeepInMind>
                  Locality and sharing are separate ideas, and they can be had
                  separately. Part 3 counts a layer that keeps the window and
                  drops the sharing, so that the two savings can be told apart.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. One Kernel, Swept",
          content: (
            <>
              <SubSection title="5. Nine weights, one bias, and a window">
                <p>
                  The nine weights are called a kernel, and one kernel with one
                  bias is a filter. The bias is added once to every answer, not
                  once per window position, which is worth saying early because
                  it is where the count of parameters gets its second term. Sweep
                  the filter across the picture and what comes back is a map, one
                  number for every place the window fitted.
                </p>
                <p>
                  The kernel the page opens with has a negative left column, a
                  zero middle column and a positive right column. A window that
                  is dark on the left and lit on the right therefore sums to
                  something large and positive, a window that is the same shade
                  all the way across sums to zero because the two columns cancel,
                  and a window that goes from lit to dark sums to something
                  negative. It is a detector for a vertical edge, and it is the
                  vertical half of the pair usually called the Sobel operator.
                </p>
                <Equation>
                  {
                    "answer[i, j]  =  bias  +  Σ over u, v of  kernel[u, v] · picture[i + u, j + v]\n\nwith u and v each running over 0, 1, 2"
                  }
                </Equation>
                <p>
                  Nothing in that sum depends on i and j except which cells are
                  read. The kernel entries are the same numbers whatever i and j
                  are, which is the sharing written down as an equation rather
                  than as a sentence.
                </p>
                <KeepInMind>
                  One bias per filter, and not one per position. A layer that
                  gave every answer cell its own bias would have thirty-six of
                  them here, and it would no longer be answering the same
                  question at each place.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. One position, worked by hand">
                <p>
                  Take the answer cell at row 2, column 0, which is the one the
                  playground shows whenever nothing is hovered. Its window covers
                  picture rows 2 to 4 and columns 0 to 2. The first two of those
                  columns are outside the square and dark, and the third is the
                  square&rsquo;s left edge and lit, so the window reads three
                  zeros, three zeros and three ones.
                </p>
                <Equation>
                  {
                    "the window        the kernel         the products\n0  0  1          −1   0   1          0  0  1\n0  0  1     ×    −2   0   2     =    0  0  2\n0  0  1          −1   0   1          0  0  1\n\nsum of the nine products  =  1 + 2 + 1  =  4"
                  }
                </Equation>
                <p>
                  Six of the nine products are zero because the cell beneath them
                  is zero. The three that survive are the kernel&rsquo;s right
                  column, 1 and 2 and 1, each multiplied by a lit cell, and they
                  add to 4. The sweep answers 4 at that position, exactly, and
                  the playground will show the nine products underneath if the
                  cell is hovered.
                </p>
                <WorkedExample title="Why the left column contributed nothing">
                  <p>
                    The kernel&rsquo;s left column holds &minus;1, &minus;2 and
                    &minus;1, which are the largest weights it has in magnitude
                    after the right column. They contributed nothing here only
                    because the cells under them were dark. Move the window two
                    cells to the right so that the left column sits on lit cells
                    as well, and those weights come back with a total of
                    &minus;4, which cancels the right column&rsquo;s 4 and leaves
                    0.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A kernel entry that answers zero has not been switched off. It
                  multiplied a cell that happened to be dark, and the same entry
                  will dominate the sum at a position where that cell is lit.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The rest of the answer, one row at a time">
                <p>
                  Move one cell to the right and the window reads columns 1 to 3,
                  still dark on the left and lit on the right, so it answers 4
                  again. Two cells further along the window lies entirely inside
                  the square, every cell is lit, and the two columns cancel to 0.
                  At column 4 the window straddles the square&rsquo;s right edge,
                  lit on the left and dark on the right, and the sum is &minus;4.
                </p>
                <NumberTable
                  headings={["answer row", "the six answers across that row"]}
                  rows={[
                    ["row 0", "1,  1,  0,  0,  −1,  −1"],
                    ["row 1", "3,  3,  0,  0,  −3,  −3"],
                    ["row 2", "4,  4,  0,  0,  −4,  −4"],
                    ["row 3", "4,  4,  0,  0,  −4,  −4"],
                    ["row 4", "3,  3,  0,  0,  −3,  −3"],
                    ["row 5", "1,  1,  0,  0,  −1,  −1"],
                  ]}
                  caption="The whole six by six map under the vertical edge kernel, as the sweep answers it."
                />
                <p>
                  Rows 0 and 5 answer 1 rather than 4 because their windows only
                  overlap the square by one of their three rows, and rows 1 and 4
                  answer 3 because they overlap it by two. The map is a picture of
                  where the vertical edges are and how much of the window is
                  sitting on them, and it is the same nine weights that produced
                  all thirty-six of those numbers.
                </p>
                <KeepInMind>
                  Two answers on the same row can be equal and mean different
                  things, since a window straddling the edge at row 2 and one at
                  row 3 both answer 4. The map says how strongly the filter fired
                  and where, and nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. What a different kernel finds in the same picture">
                <p>
                  Nothing about the sweep is particular to edge detection. The
                  same procedure with nine different numbers answers a different
                  question about every neighbourhood, and the playground&rsquo;s
                  preset buttons are four more of them. Switching the kernel does
                  not change the picture, the window, the stride or the size of
                  the answer, only what the nine weights are asking.
                </p>
                <p>
                  Turn the kernel on its side and it finds the square&rsquo;s top and bottom edges instead, with the interior at zero and the vertical edges invisible. Set all nine weights to a ninth and it answers the mean of the window, so the interior comes back at 1, the corner where only one cell is lit comes back at a ninth, and the map is a blurred copy of the picture.
                </p>
                <p>
                  Paint the diagonal instead of the square and both edge kernels find it, each at half the strength the square gave them, because a diagonal presents each of them with only part of an edge.
                </p>
                <InAModel>
                  <p>
                    None of the kernels on this page were learned. They are hand
                    written so that the arithmetic can be followed, and in a
                    trained network the nine weights are whatever
                    backpropagation left there. What is often found in the first
                    layer of a trained network does look a great deal like these,
                    edges at various angles and small blobs of colour, which is
                    a result rather than something the architecture guarantees.
                  </p>
                </InAModel>
                <KeepInMind>
                  A kernel is a question asked of every neighbourhood at once.
                  Changing the nine numbers changes the question and changes
                  nothing else about the layer, which is why one implementation
                  serves blurring, sharpening and edge finding without knowing
                  which it is doing.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The name says convolution and the arithmetic says correlation">
                <p>
                  There is a naming inaccuracy here that is universal and worth
                  knowing about. In signal processing a convolution flips the
                  kernel end over end, top to bottom and left to right, before
                  sliding it, and the sum with the kernel unflipped is called a
                  cross-correlation. What this layer computes, and what every
                  machine learning framework computes under the name convolution,
                  is the unflipped sum.
                </p>
                <Equation>
                  {
                    "cross-correlation   answer[i, j]  =  Σ  kernel[u, v] · picture[i + u,     j + v]\nconvolution         answer[i, j]  =  Σ  kernel[u, v] · picture[i − u + 2, j − v + 2]"
                  }
                </Equation>
                <WhyThisWorks title="Why the flip makes no difference to a learned kernel">
                  <p>
                    Suppose we had built the flipping version and trained it, and
                    it settled on some kernel. The unflipped version, given the
                    mirror image of that kernel, computes exactly the same sums
                    at every position, so it can represent everything the
                    flipping version can and nothing more. Since the nine numbers
                    are learned rather than given, the two versions reach the
                    same family of answers and differ only in which nine numbers
                    they store to get there.
                  </p>
                  <p>
                    The flip is not decoration in signal processing. It is what
                    makes the operation commutative and makes the convolution
                    theorem hold, so a signal processing text is right to insist
                    on it. Neither of those properties is being used here, which
                    is why the field kept the name and dropped the flip.
                  </p>
                </WhyThisWorks>
                <p>
                  The consequence for a reader is small but real. A kernel copied
                  out of a signal processing reference has to be flipped before
                  it will do here what the reference says it does, and a kernel
                  that is symmetric under that flip, which the blur is and the
                  vertical edge kernel is not, will behave the same either way.
                </p>
                <KeepInMind>
                  The layer everyone calls a convolution computes a
                  cross-correlation. Nothing about a trained network is harmed by
                  that, and a reader lifting a kernel out of a signal processing
                  reference still needs to know it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "Shuffling the sixty-four cells of every picture, and shuffling the columns of a row reader’s weights the same way, leaves what that reader answers unchanged.",
              true,
              "The sum runs over the same set of products in a different order, so nothing it answers moves. Measured, the largest disagreement across all thirty-six outputs is 2.2 × 10⁻¹⁶, one rounding step in double precision. The same two pictures through one convolution give answers 6 apart at the worst cell, on a map whose largest entry at rest is 4.",
            ),
            choice(
              "The answer cell at row 2, column 0 comes out at 4. Where does the 4 come from?",
              [
                "Four of the nine cells under the window are lit",
                "The three lit cells sit under the kernel’s right column of 1, 2 and 1",
                "The bias is 4 and the nine products cancel",
                "The window lies inside the square, so the two outer columns cancel",
              ],
              1,
              "Six of the nine products are zero because the cell beneath them is zero, and the three that survive are the right column against lit cells. Move the window two cells right so the left column sits on lit cells too and it brings −4, cancelling the right column and leaving 0.",
            ),
            trueFalse(
              "A kernel entry that contributes zero at some position has effectively been switched off.",
              false,
              "It multiplied a cell that happened to be dark. The left column holds −1, −2 and −1, the largest weights the kernel has in magnitude after the right column, and they dominate the sum as soon as the window moves far enough right for lit cells to sit under them.",
            ),
            trueFalse(
              "The layer everyone calls a convolution computes the unflipped sum, so it can represent less than the flipping version can.",
              false,
              "The first half is right and the second is not. Given the mirror image of any kernel, the unflipped sum computes exactly the same numbers at every position, so the two reach the same family of answers and differ only in which nine numbers they store. The flip earns its keep in signal processing, where it makes the operation commutative and makes the convolution theorem hold, and neither is used here. A kernel lifted from a signal processing reference still has to be flipped first.",
            ),
            trueFalse(
              "The blur kernel, all nine weights a ninth, answers the same numbers whether or not it is flipped end over end before the sweep.",
              true,
              "Flipping turns a kernel top to bottom and left to right, and a kernel that is symmetric under that flip is unchanged by it, so the flipped and unflipped sums are the same sums. The blur is symmetric and the vertical edge kernel is not, since its negative left column and positive right column swap places, which is why a kernel copied out of a signal processing reference has to be flipped before it does here what the reference says it does.",
            ),
        ],
        },
        {
          title: "Part 3. Locality and Sharing, Counted",
          content: (
            <>
              <SubSection title="10. Locality, which is nine cells rather than sixty-four">
                <p>
                  Take the sharing away for a moment and keep only the window.
                  Imagine a layer that gives every one of its thirty-six answer
                  cells its own private set of nine weights and its own bias, but
                  still lets each of them read only the nine cells under its own
                  window. That layer is local and shares nothing, and counting it
                  separates the two savings.
                </p>
                <Equation>
                  {
                    "window, nothing shared  =  36 positions × (9 weights + 1 bias)  =  360\ndense, equal width      =  36 outputs × (64 weights + 1 bias)  =  2,340"
                  }
                </Equation>
                <p>
                  Locality alone takes 2,340 down to 360, which is a factor of
                  six and a half, and the ratio is exactly the ratio of 65 to 10,
                  what one output reads plus its bias in each case. That is
                  worth having, and it is nothing like the whole of the saving
                  the page is about.
                </p>
                <KeepInMind>
                  Layers of exactly this kind exist and are called locally
                  connected. They are used where the position genuinely matters,
                  a face aligned so the eyes are always in the same place being
                  the standard example, and they are not what this page is about.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Sharing, which is one set of nine used thirty-six times">
                <p>
                  Now add the sharing back. The thirty-six sets of nine become
                  one set of nine, and the thirty-six biases become one bias. The
                  layer holds ten numbers and answers with the same thirty-six it
                  answered with before.
                </p>
                <p>
                  The thing to notice is what the ten does not depend on. It does
                  not depend on the size of the picture, since the same nine
                  weights sweep a picture of any size. It does not depend on
                  where in the picture anything is. It depends on the window and
                  on how many input channels there are, and on nothing else,
                  which is why the count in the geometry table of Part 5 stays
                  flat down a column where every other number moves.
                </p>
                <NumberTable
                  headings={["reader", "parameters", "answers", "reads"]}
                  rows={[
                    ["one convolution filter", "10", "36", "9 cells per answer"],
                    ["window, nothing shared", "360", "36", "9 cells per answer"],
                    ["dense, equal width", "2,340", "36", "64 cells per answer"],
                  ]}
                  caption="The three readers on the page’s own eight by eight picture, every count read off a layer that was built and then asked what it holds."
                />
                <KeepInMind>
                  <p>
                    Separate the parameter saving into the restriction to local windows
                    and the reuse of one filter across positions.
                  </p>
                  <Equation>{"combined saving factor = locality factor × sharing factor\n                       = 6.5 × 36 = 234"}</Equation>
                  <p>
                    The total alone hides how much each design choice contributes.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The count in full, and where each term comes from">
                <p>
                  Written out in general the count has two terms, and both are
                  short. A filter holds one weight for each cell of its window in
                  each input channel, plus one bias, and a layer holds as many
                  filters as it was asked for.
                </p>
                <Equation>
                  {
                    "convolution  =  n_filters × (channels × k × k)  +  n_filters\ndense        =  n_outputs × n_inputs  +  n_outputs"
                  }
                </Equation>
                <p>
                  A colour picture makes the difference between the two terms
                  visible. Three channels of an eight by eight picture through
                  one filter of three by three costs 28 parameters, which is 27
                  weights and a bias, because a filter reads every input channel
                  at once rather than one per channel. The picture grew by a
                  factor of three and the filter grew by a factor of three, so
                  the layer got a little larger; a dense layer reading the same
                  picture would have grown by a factor of three in its width as
                  well.
                </p>
                <DerivationTable
                  expressionHeading="term"
                  reasonHeading="what it counts"
                  rows={[
                    {
                      expression: "channels × k × k",
                      reason:
                        "one weight per cell of the window per input channel. This is the fan-in, how many numbers each output position sums.",
                    },
                    {
                      expression: "× n_filters",
                      reason:
                        "each filter is a separate kernel bank reading every channel, and answers with a channel of its own.",
                    },
                    {
                      expression: "+ n_filters",
                      reason:
                        "one bias per filter. Not per position, and not per channel.",
                    },
                    {
                      expression: "nothing about the picture",
                      reason:
                        "the height and the width appear nowhere in the count, which is the whole of what weight sharing buys.",
                    },
                  ]}
                />
                <KeepInMind>
                  A filter&rsquo;s kernel is three-dimensional whenever the input
                  has more than one channel, and a bank of them is
                  four-dimensional. Counting it as though each filter held a flat
                  three by three grid undercounts a colour layer by a factor of
                  three.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. The ratio grows with the picture">
                <p>
                  The convolution&rsquo;s count is flat in the size of the
                  picture and the dense layer&rsquo;s is quadratic in it, since
                  the dense layer&rsquo;s count is how many numbers went in times
                  how many come out and both of those grow with the picture. So
                  the ratio between them grows without any change to the layer.
                </p>
                <p>
                  The example carried through these pages is a twenty-eight by
                  twenty-eight picture, the size of a handwritten digit, read by
                  eight filters of three by three. The convolution holds 80
                  parameters. A layer keeping the window and sharing nothing
                  would hold 54,080. A dense layer reading the same 784 cells and
                  answering the same 5,408 numbers holds 4,245,280, which is
                  53,066 times what the convolution holds, for an answer of
                  exactly the same size.
                </p>
                <ConvolutionParameterCount />
                <p>
                  Move the picture side slider and watch which bar moves. The
                  convolution&rsquo;s bar does not, because nothing in its count
                  mentions the picture; the other two climb. The bars are on a
                  log scale, since at the default setting the first is 80 and the
                  last is over four million and a linear scale would leave the
                  first invisible.
                </p>
                <InAModel>
                  <p>
                    Fewer parameters is not automatically better. What the
                    sharing does is impose a constraint, that whatever is worth
                    noticing here is worth noticing everywhere, and that
                    constraint happens to be true of pictures and false of plenty
                    of other things. A table of measurements where column 3 and
                    column 4 mean unrelated quantities would be badly served by a
                    layer that insisted on treating them alike.
                  </p>
                </InAModel>
                <KeepInMind>
                  53,066 is a ratio at one particular size, and it moves as soon
                  as the picture or the filter count moves. What survives every
                  setting of the sliders is that one of the two counts grows with
                  the picture and the other does not.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What the constraint costs">
                <p>
                  A kernel can only ever say something about a neighbourhood, so
                  one layer of them cannot tell a face from a scrambled
                  arrangement of the same eyes and mouth, since every window
                  contains at most part of one feature and no window contains
                  two of them at a distance. A wider kernel would answer that
                  complaint and would hand back the parameter saving while doing
                  so, since the count is the window area times the channels. The
                  route taken instead is a second convolution laid on top of this
                  one.
                </p>
                <p>
                  A second three by three window placed over the first
                  layer&rsquo;s map covers a five by five patch of the original
                  picture, because each of its nine inputs was itself formed from
                  a three by three patch and those patches overlap. A third
                  covers seven by seven. That growing patch is called the
                  receptive field, and stacking layers is what widens it while
                  each layer keeps its own small count of weights.
                </p>
                <Equation>
                  {
                    "receptive field after L layers of a k by k window at stride 1\n\n    side  =  1  +  L · (k − 1)\n\nk = 3, L = 1   side = 3\nk = 3, L = 2   side = 5\nk = 3, L = 3   side = 7"
                  }
                </Equation>
                <KeepInMind>
                  Depth is how a network of small windows comes to read a large
                  patch. The word deep in deep convolutional network is doing
                  exactly that job, and it is why the receptive field is a
                  property of a stack rather than of a layer.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Move the Picture and the Answer Moves",
          content: (
            <>
              <SubSection title="15. The square, slid one column across">
                <p>
                  Take the picture, move every cell one column to the right, and
                  sweep it again. The answer we get is the answer we had, moved
                  one position to the right. Not approximately, and not usually;
                  every cell of the map that has somewhere to move to agrees with
                  the moved answer exactly, and the widget below reports the
                  largest disagreement as 0.
                </p>
                <p>
                  That is a statement about the arithmetic, not about the
                  training, so it holds whatever nine numbers the kernel is
                  carrying. Switch the kernel with the buttons and the maps
                  change completely while the gap stays at 0. It is the property
                  Fukushima was after in 1980, and it is what makes a filter that
                  has learned an edge in one place a filter that has learned it
                  everywhere.
                </p>
                <ShiftLedger />
                <p>
                  The square really is moving under it. At a shift of one, 8 of
                  the picture&rsquo;s cells change and 18 of the map&rsquo;s
                  thirty-six do; at a shift of two, 16 cells change and all 36
                  of the map&rsquo;s do. The map is not staying still, it is
                  travelling with the square, which is a different and stronger
                  claim.
                </p>
                <KeepInMind>
                  Read the column headed sweep in the table as the whole result.
                  Every entry in it is 0, at every distance and under every
                  kernel, and a single entry that was not would sink the argument
                  of this part.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A layer of the same width does not do that">
                <p>
                  The comparison that makes the point is a dense layer built to
                  answer the same thirty-six numbers from the same sixty-four
                  cells. Two of them sit beside the sweep in the widget above.
                  The first holds a single detector, which is the page&rsquo;s
                  own nine weights written into one window position of the
                  picture and zeros in all the other fifty-five places.
                </p>
                <p>
                  At rest that detector answers 4, since the square&rsquo;s edge
                  is sitting exactly under it, and it is the same 4 the sweep
                  answers at that position. Move the picture one column and it
                  answers 0. Move it two and it answers 0. Move it three and it
                  answers 0. It has learned the edge at one place and has learned
                  nothing at all about the same edge one cell over.
                </p>
                <p>
                  The second is an ordinary draw of thirty-six neurons over
                  sixty-four cells, laid out as a six by six block purely so it
                  can be printed beside the sweep&rsquo;s map, and compared
                  against its own resting answer moved by the same amount. At a
                  shift of one its answers move by 1.753 where the largest answer
                  it gives anywhere on that picture is 0.896. The change is
                  larger than the thing being changed, and all 36 of its outputs
                  move at every distance.
                </p>
                <WorkedExample title="Why laying the dense answers out as a map is a courtesy">
                  <p>
                    Nothing in the dense layer&rsquo;s arithmetic makes output 7
                    the neighbour of output 8 or of output 1. Arranging its
                    thirty-six answers in a six by six block is a convenience for
                    the comparison, and the layer would answer exactly the same
                    numbers if we printed them in a line or in a circle. That is
                    the same point section 2 made about its inputs, made again
                    about its outputs.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A dense layer can of course be trained on shifted copies until
                  it handles them, and that is the expensive route. The sweep
                  does not need to be trained on them, because moving with the
                  picture is a consequence of its arithmetic.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Why it holds, in one substitution">
                <p>
                  The proof is one line of algebra and worth doing, because it
                  shows exactly which assumptions it rests on. Let the moved
                  picture be the original read one column to the left, so that
                  the moved picture at column j holds what the original held at
                  column j minus one. Substitute that into the sum.
                </p>
                <Equation>
                  {
                    "moved[row, column]  =  picture[row, column − 1]\n\nanswer_moved[i, j]  =  Σ  kernel[u, v] · moved[i + u, j + v]\n                    =  Σ  kernel[u, v] · picture[i + u, j + v − 1]\n                    =  answer[i, j − 1]"
                  }
                </Equation>
                <p>
                  The middle line is the whole of it. The kernel entries did not
                  change when the picture moved, because they do not depend on
                  the position, and so the sum at position j of the moved picture
                  is character for character the sum at position j minus one of
                  the original. A layer whose weights differed by position could
                  not take that step, which is why the locally connected layer of
                  section 10 has no such property.
                </p>
                <WhyThisWorks title="Where the argument needs the stride to be one">
                  <p>
                    At a stride of s the answer at position j reads the picture
                    starting at column j times s, so moving the picture by one
                    column asks for an answer at position one over s, which is
                    not a position unless s divides the move. The widget reports
                    that honestly rather than rounding it away. A shift of one at
                    a stride of two comes back with no answer position to move
                    to; a shift of two at a stride of two moves the answer by
                    exactly one position, with a gap of 0.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Equivariance at a stride greater than one holds only for shifts
                  the stride divides. That is not a defect in the implementation,
                  it is what happens when the answer is sampled more coarsely than
                  the picture it reads.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Equivariance is not invariance, and it stops at the border">
                <p>
                  It is easy to read the last three sections as saying the layer
                  does not care where things are, and that is not what they say.
                  The answer moved. A layer above this one still sees a different
                  map for a moved picture, and if what it needs is a single
                  verdict that does not change under a shift then something else
                  has to supply it.
                </p>
                <p>
                  The two usual somethings are pooling, which summarises a small
                  neighbourhood of the map and so absorbs a small movement inside
                  it, and a summary taken over the whole map at the end, which
                  throws the position away entirely. Both are separate layers
                  with their own costs, and the{" "}
                  <Link href="/concepts/pooling" className={link}>
                    pooling page
                  </Link>{" "}
                  measures how much of a shift the first of them actually
                  absorbs.
                </p>
                <NumberTable
                  headings={["property", "what it says", "does this layer have it"]}
                  rows={[
                    [
                      "equivariance",
                      "move the picture and the answer moves the same way",
                      "yes, exactly, at stride one",
                    ],
                    [
                      "invariance",
                      "move the picture and the answer does not change",
                      "no, and it is not trying to",
                    ],
                    [
                      "rotation equivariance",
                      "turn the picture and the answer turns with it",
                      "no, a kernel has a fixed orientation",
                    ],
                  ]}
                />
                <p>
                  There is a second limit, at the edges. A square sitting against
                  the right border and moved one column further right loses part
                  of itself, so nothing about the sweep can recover an answer for
                  a thing that is no longer in the picture. The widget compares
                  only the columns the move leaves inside the map for exactly
                  that reason.
                </p>
                <KeepInMind>
                  Equivariance is a promise about how the answer moves, not a
                  promise that it stays put. Reading it as invariance is the
                  commonest way this property gets overstated.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Locality alone takes the count from 2,340 down to 360. What takes it the rest of the way to 10?",
              [
                "Weight sharing, one set of nine and one bias in place of thirty-six of each",
                "Dropping the biases, which a swept filter does not need",
                "The smaller answer map, which has fewer cells to be weighted",
                "Reading one channel rather than three",
              ],
              0,
              "A locally connected layer keeps the window and gives every answer cell its own nine weights and its own bias, which is a factor of six and a half, exactly the ratio of 65 to 10. Sharing turns the thirty-six sets into one, a further factor of thirty-six, and the two multiply to 234. Layers of the locally connected kind are real and are used where the position genuinely matters.",
            ),
            trueFalse(
              "A convolution’s parameter count depends on its window and on the channels beneath it, and not on the size of the picture it reads.",
              true,
              "The count is the number of filters times the window area times the channels beneath, plus one bias per filter, and nothing in it mentions the picture, which is why the parameters column of the geometry table stays flat while every other number in it moves. A dense layer’s count is how many numbers went in times how many come out, and both of those grow, which is why the ratio reaches 53,066 at twenty-eight by twenty-eight through eight filters without any change to the layer.",
            ),
            choice(
              "A second three by three window is placed over the first layer’s map. How much of the original picture does one of its answers cover?",
              ["Five cells by five", "Three cells by three", "Six cells by six", "Nine cells by nine"],
              0,
              "Each of the second window’s nine inputs was itself formed from a three by three patch, and neighbouring patches overlap, so the nine of them together span five cells a side. A third layer covers seven. That growing patch is the receptive field, and stacking layers is what widens it while each layer keeps its own small count of weights, where a wider kernel would widen it at the cost of the parameter saving.",
            ),
            several(
              "Which of these hold of the way the answer moves when the picture moves?",
              [
                "Every map cell with somewhere to move to agrees exactly, with the largest disagreement reported as 0",
                "It holds whatever nine numbers the kernel is carrying, since it is a statement about the arithmetic",
                "At a stride of two it holds only for shifts the stride divides",
                "A layer above this one therefore sees the same map for a moved picture",
              ],
              [0, 1, 2],
              "The answer moves rather than staying put, so a layer above does see a different map, and anything needing a verdict that survives a shift has to get it from pooling or from a summary taken over the whole map. Reading this property as invariance is the commonest way it gets overstated. The map really is travelling, since at a shift of two all thirty-six of its cells change.",
            ),
            choice(
              "A dense layer holding the page’s nine weights in one window position, and zeros in the other fifty-five places, answers 4 at rest. What does it answer once the picture moves one column?",
              ["4, since the edge is still in the picture", "0", "1.753", "3, since the window now overlaps the edge by two rows"],
              1,
              "It answers 0 at a shift of one, and again at two and at three. It learned the edge at one place and learned nothing at all about the same edge one cell over. The 1.753 belongs to the other comparison, an ordinary draw of thirty-six neurons whose answers move by more than the largest answer it gives anywhere on the picture.",
            ),
        ],
        },
        {
          title: "Part 5. A Bank of Filters, and the Arrangement in Integers",
          content: (
            <>
              <SubSection title="19. One layer holds several filters">
                <p>
                  One filter answers one question about every neighbourhood, and
                  a picture has more than one question worth asking of it. So a
                  layer holds a bank of filters rather than one, each with its own
                  nine weights and its own bias, and each sweeping the same
                  picture independently of the others. The answer is one map per
                  filter, stacked.
                </p>
                <p>
                  Three filters over the page&rsquo;s picture answer with three
                  maps of six by six, which is written as an arrangement
                  of (3, 6, 6), and the whole bank costs 30 parameters, ten per
                  filter. The vertical edge filter answers most strongly at row 2
                  column 0, on the square&rsquo;s left edge. The horizontal one
                  answers most strongly at row 0 column 2, on its top edge. The
                  blur answers most strongly in the middle, at row 2 column 2,
                  where the whole window is inside the square.
                </p>
                <KernelBankMaps />
                <p>
                  Tick and untick the filters and watch the arrangement change in
                  the readout. Only the first extent moves, since adding a filter
                  adds a map and changes nothing about how large a map is. That
                  first extent is the number of channels the next layer will read.
                </p>
                <KeepInMind>
                  The filters in a bank do not talk to one another. Each is swept
                  across the picture on its own, and it is the layer above that
                  gets to combine what they found.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Channels in, filters out">
                <p>
                  That stack of maps is what the next convolution reads, and it
                  reads it the way this one read a colour picture. A filter in the
                  second layer holds one three by three grid of weights for each
                  of the maps beneath it, and its answer at one position is the
                  sum over all of them at once. So the second layer&rsquo;s
                  filters are wider than the first layer&rsquo;s even though their
                  windows are the same size.
                </p>
                <Equation>
                  {
                    "reads    (channels, height, width)\nanswers  (n_filters, out_height, out_width)\n\none filter's weights  (channels, k, k)\nthe whole bank        (n_filters, channels, k, k)"
                  }
                </Equation>
                <p>
                  That four-dimensional arrangement is kept on the
                  layer itself, and only flattens it to two dimensions when a
                  gradient block is handed out and back, which section 26 returns
                  to. What matters here is that a filter is never a flat grid once
                  there is more than one channel, and that the first extent of
                  what a layer answers is always the number of filters it holds.
                </p>
                <WorkedExample title="Two layers costed">
                  <>
                    <p>
                      The channel count matters as well as the kernel width. The first
                      layer reads one image channel; the second reads eight feature
                      maps.
                    </p>
                    <Equation>{"first layer = 8 × (1 × 3 × 3 + 1) = 80 parameters\nsecond layer = 16 × (8 × 3 × 3 + 1) = 1,168 parameters\nratio = 1,168 / 80 = 14.6"}</Equation>
                    <p>
                      The kernels are the same spatial size, but the second layer has
                      more input channels and more output filters.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  A filter&rsquo;s cost is the window times the number of channels
                  beneath it. Deepening a network by adding filters at each layer
                  therefore raises the cost of the layer above as well as the cost
                  of the layer being widened.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The output extent, worked in integers">
                <p>
                  A dense layer&rsquo;s output width is a number somebody chose.
                  A convolution&rsquo;s is arithmetic, and every term in it is
                  known before any picture arrives. A window of side k on a
                  picture of side n, with p rows of padding added at each edge and
                  the window moved s cells at a time, fits at a position every s
                  cells until its far edge runs out of picture.
                </p>
                <Equation>
                  {
                    "out  =  ⌊(n − k + 2p) / s⌋  +  1\n\nn = 8, k = 3, p = 0, s = 1     ⌊5 / 1⌋ + 1  =  6\nn = 8, k = 3, p = 1, s = 1     ⌊7 / 1⌋ + 1  =  8\nn = 8, k = 3, p = 0, s = 2     ⌊5 / 2⌋ + 1  =  3\nn = 8, k = 3, p = 1, s = 2     ⌊7 / 2⌋ + 1  =  4\nn = 8, k = 5, p = 0, s = 1     ⌊3 / 1⌋ + 1  =  4"
                  }
                </Equation>
                <p>
                  The floor is where a stride that does not divide evenly loses
                  its last partial step, and it is the only place in the formula
                  where information is thrown away. The table below builds a layer
                  for every combination of window, stride and padding at whatever
                  picture size is chosen, and reads the answer off the
                  layer&rsquo;s own shape without sweeping a single cell.
                </p>
                <SweepGeometryTable />
                <p>
                  Look down the parameters column while the picture side slider
                  moves. It does not change. Every other number in the table
                  depends on the picture and that one does not, which is section
                  11&rsquo;s claim shown rather than argued.
                </p>
                <KeepInMind>
                  The answer&rsquo;s extents are decided by four integers and are
                  known before the layer has read anything. That is what makes it
                  possible to check a whole network of these for shape agreement
                  at the moment it is assembled.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Padding, and what the corner is read by">
                <p>
                  Without padding the border of the picture is under-read, and the
                  amount is easy to count. On the page&rsquo;s eight by eight
                  picture under a three by three window at stride one, the top
                  left cell is inside exactly 1 window position and the middle
                  cell is inside 9 of them. The corner contributes to a ninth as
                  many answers as the middle does, so whatever is happening at the
                  corner is nine times less able to influence what the layer says.
                </p>
                <p>
                  Adding one row and column of zeros at each edge before the sweep
                  fixes both problems at once. The answer comes back at eight by
                  eight rather than six by six, so the picture stops shrinking, and
                  the corner&rsquo;s coverage goes from 1 window position to 4. The
                  geometry table above reports both counts, and the rows where the
                  answer is the same size as the picture are shaded.
                </p>
                <NumberTable
                  headings={["setting", "answer", "corner read by", "middle read by"]}
                  rows={[
                    ["3 by 3, stride 1, no padding", "(1, 6, 6)", "1 window", "9 windows"],
                    ["3 by 3, stride 1, padded by 1", "(1, 8, 8)", "4 windows", "9 windows"],
                    ["5 by 5, stride 1, no padding", "(1, 4, 4)", "1 window", "16 windows"],
                    ["5 by 5, stride 1, padded by 1", "(1, 6, 6)", "4 windows", "25 windows"],
                  ]}
                  caption="Every figure counted by placing the window at every position the layer will actually use, rather than read off the formula."
                />
                <p>
                  Zeros specifically, and the reason is that a zero contributes
                  nothing to any sum it enters, so the border adds no evidence of
                  its own. It is still an assumption, and the assumption is that
                  the world outside the picture is dark. A filter looking for a
                  bright region will therefore find an edge along the border of a
                  padded picture that was not there before the padding was added.
                </p>
                <KeepInMind>
                  Without padding a picture loses two cells a side per layer, so a
                  stack of fourteen three by three layers has nothing left of a
                  twenty-eight by twenty-eight picture to read. Padding is what
                  makes a deep stack of these possible at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Stride, and the cells no window reaches">
                <p>
                  Stride is how far the window moves between positions, and
                  raising it is a way of shrinking the answer without adding a
                  layer. At a stride of two on the page&rsquo;s picture the answer
                  comes back three by three rather than six by six, which is a
                  quarter as many numbers carried forward.
                </p>
                <p>
                  It is not free, and the cost is countable. At a stride of two
                  with a three by three window, 15 of the picture&rsquo;s 64 cells
                  are inside no window position at all, so 15 cells of the picture
                  contribute nothing to any answer the layer gives. Nothing refuses
                  that, and nothing should, since it is a legitimate thing to want;
                  it is simply worth knowing before choosing the setting.
                </p>
                <p>
                  Push it further and the effect grows. A three by three window at
                  a stride of four answers with a two by two map and leaves 28 of
                  the 64 cells outside every window, which the failure contracts of
                  Part 7 record as one of the three things that are accepted
                  rather than refuses.
                </p>
                <KeepInMind>
                  Reading the two counts together is what the geometry table is
                  for. A setting that answers with a pleasingly small map may be
                  ignoring a quarter of the picture to do it, and the answer&rsquo;s
                  extents alone will not say so.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Refused at construction rather than four layers later">
                <p>
                  Because all four terms are integers known in advance, a setting
                  whose answer would be smaller than a single cell can be refused
                  the moment the layer is built. Ask for a window of seven over a
                  picture of four and the arithmetic gives &minus;2, which is not
                  an extent, and the refusal says so with the sum written out
                  rather than with a message about an array shape.
                </p>
                <Equation>
                  {
                    "this convolution's answer would have height\n(4 − 7 + 2 · 0) // 1 + 1 = −2,\nso the window does not fit over what it reads"
                  }
                </Equation>
                <p>
                  Try that setting in the geometry table by dragging the picture
                  side down to 4, and the rows with a window of five and of seven
                  come back carrying that refusal instead of numbers. The
                  alternative, which is what happens when the extents are only
                  worked out as the data flows, is discovering the mistake several
                  layers downstream in the middle of a training run, with a message
                  about a matrix that will not multiply.
                </p>
                <KeepInMind>
                  Every term of the formula was chosen by the caller, so the
                  refusal can name all four of them. A message that says what was
                  asked for and what it came to is worth a great deal more than one
                  that says a shape did not match.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. The Backward Pass, and What the Sweep Costs",
          content: (
            <>
              <SubSection title="25. A slope arrives at every answer cell">
                <p>
                  When the layer is being trained, something above it hands down
                  one number for every cell of the map, saying how the loss would
                  change if that cell answered a little higher. The layer has to
                  turn those thirty-six numbers into three things, a slope for each
                  of its nine weights, a slope for its bias, and one number for
                  each cell of the picture to hand down in turn.
                </p>
                <p>
                  The bias is the easy one. It was added once at every answer
                  position, so its slope is the arriving numbers added up. The
                  weights are the interesting one, and the reason is the sharing.
                  A single weight multiplied a cell at every one of the thirty-six
                  positions, so its slope is a sum over all of them, and that sum
                  is the sharing seen from behind.
                </p>
                <Equation>
                  {
                    "∂loss / ∂kernel[u, v]  =  Σ over i, j of  arriving[i, j] · picture[i + u, j + v]\n∂loss / ∂bias        =  Σ over i, j of  arriving[i, j]\n∂loss / ∂picture[r, c] =  Σ over the windows covering (r, c) of\n                          arriving[i, j] · the kernel entry that read it"
                  }
                </Equation>
                <KeepInMind>
                  A shared weight collects a slope from every position it was used
                  at. That is why a convolution&rsquo;s weights typically see much
                  larger gradients than a dense layer&rsquo;s of the same
                  magnitude, and why the learning rate is not transferable between
                  the two without thought.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. The two places the backward pass is usually got wrong">
                <p>
                  Both mistakes have the same shape, which is that they run
                  perfectly and train something slightly other than what was asked
                  for. The first is writing the kernel slope with an assignment
                  where a sum was wanted, which leaves the layer training on the
                  last window it happened to visit. The second is walking the
                  input cells and asking which window each belongs to, rather than
                  walking the output positions and adding into the cells each one
                  covered, which loses terms at the border and under a stride
                  greater than one.
                </p>
                <p>
                  Both are visible on the page&rsquo;s own square if a slope of one
                  is sent to every answer cell, because then every number in the
                  answer is a plain count and can be checked by hand. Each of the
                  nine kernel entries comes back wanting 16, which is exactly the
                  number of lit cells in the picture, since the entry multiplied a
                  one at sixteen of its thirty-six positions and a zero at the
                  other twenty. The bias comes back wanting 36, one for each
                  position it was added at.
                </p>
                <SweepBackwardBlame />
                <p>
                  The blame handed down to the picture is the other half. A cell
                  read by every one of the nine kernel positions collects the sum
                  of the nine weights, which for this kernel is 0, so the whole
                  interior of the picture receives nothing. The very corner cell is
                  read by one window position only, at the kernel entry holding
                  &minus;1, so it collects exactly &minus;1. Thirty-two of the
                  sixty-four cells receive nothing at all, and they are the ones
                  where the kernel&rsquo;s columns cancel.
                </p>
                <KeepInMind>
                  Both directions accumulate rather than assign, and for the same
                  reason. One weight was used many times going up, and one cell was
                  read by many windows going up, so both are sums coming back down.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. Checked against a central difference">
                <p>
                  Hand-checking one fixture is not a test of the implementation, so
                  the reported slopes are also compared against
                  measured ones. Each parameter is moved a millionth up and a
                  millionth down, the loss is remeasured both times, and the
                  difference divided by the total movement is what the slope must
                  be. That is done for every kernel weight, every bias and every
                  input value, on three fixtures, and the second table in the
                  widget above reports the worst disagreement in each block.
                </p>
                <p>
                  The three fixtures are chosen for what each can catch. A plain
                  sweep at stride one with no padding is the base case. Padding by
                  one is where an implementation that forgets to strip the invented
                  border off the blame shows up. Two channels at a stride of two is
                  where an implementation walking the input rather than the output
                  positions loses terms. On the run behind these figures the worst
                  disagreement anywhere across the three fixtures was 7.8 × 10
                  <sup>&minus;9</sup>, on the inputs of the padded fixture,
                  against reported slopes as large as 13.9.
                </p>
                <WhyThisWorks title="Why the difference is taken from both sides">
                  <p>
                    Measuring the loss at the parameter and at the parameter plus a
                    step gives an error that falls in step with the step, so
                    halving the step halves the error. Measuring at plus a step and
                    minus a step and dividing by twice the step cancels the leading
                    error term, and what is left falls as the square of the step.
                    That is what makes an agreement of eight decimal places evidence
                    about the implementation rather than evidence about how the
                    difference was taken.
                  </p>
                  <p>
                    The step cannot simply be made tiny. Subtracting two nearly
                    equal losses in double precision loses digits, so too small a
                    step measures rounding rather than slope. A millionth is the
                    usual compromise and is what these figures use.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  A gradient check is a comparison against a definition, not a proof.
                  It is very good at catching a missing term and blind to a mistake
                  the fixtures never exercise, which is why three fixtures are used
                  and why each of them is chosen for something it can catch.
                </KeepInMind>
              </SubSection>

              <SubSection title="28. Seven nested loops, and the same sum as one multiply">
                <p>
                  Written the way the definition reads, the sweep is seven nested
                  loops, over the rows of the batch, the filters, the two output
                  axes, the input channels and the two kernel axes, with one
                  product added at the innermost step. That version can be checked
                  line by line against the equation, and on the page&rsquo;s
                  eight by eight picture it adds up 324 products, nine for each of
                  the thirty-six answer cells. Through eight filters on a picture
                  twenty-eight on a side it adds up 48,672, one at a time.
                </p>
                <p>
                  None of those products depends on any other, so the order they are added in is ours to choose. Lay every window of the picture out as one row of a table, nine numbers long for a three by three kernel on one channel, and the thirty-six windows of our square become a table of thirty-six rows and nine columns.
                </p>
                <p>
                  Write the kernel bank as a table of nine rows with one column per filter, and the whole sweep is the first table times the second, which is a matrix multiply, the operation numerical routines have been tuned hardest for. The windows do not even have to be copied to be laid out this way, since each one is the same stretch of the picture read from a different starting cell, so the table of windows is a way of reading the picture and costs no copy.
                </p>
                <Equation>
                  {
                    "answer[f, i, j]  =  bias[f] + Σ over c, u, v of  kernel[f, c, u, v] · picture[c, i·s + u, j·s + v]\n\n(windows × c·k·k)  ·  (c·k·k × filters)  =  (windows × filters)"
                  }
                </Equation>
                <p>
                  The widget runs both versions on the machine serving this page,
                  at three sizes, beside a dense layer reading the same numbers and
                  answering the same numbers, and it compares the two
                  versions&rsquo; answers. They agree to 1.8 × 10
                  <sup>&minus;15</sup> at the largest size, a few rounding steps,
                  which is what adding the same products in a different order
                  costs and nothing more. On the runs I made behind this page the
                  loops took between about 115 and 330 times as long as the
                  multiply at the largest size, and only one to two times as long
                  on the page&rsquo;s own picture, where there are too few
                  products for the multiply&rsquo;s fixed setup to be repaid.
                </p>
                <SweepCostTable />
                <p>
                  The dense layer is kept beside them because it corrects an easy reading of the parameter count. On the page&rsquo;s picture the sweep holds 10 parameters against the dense layer&rsquo;s 2,340 and is still the slower of the two, between about six and sixteen times on my runs, since multiplying a row of sixty-four by a table of sixty-four by thirty-six is almost nothing and laying the windows out costs more than that.
                </p>
                <p>
                  At twenty-eight on a side through eight filters the dense layer has 4,245,280 parameters to work through against the sweep&rsquo;s 48,672 products, and the order reverses, the sweep taking between about a tenth and two fifths of the dense layer&rsquo;s time. That is far less than the eighty-seven-fold gap in arithmetic would suggest, because at these sizes most of the sweep&rsquo;s time is fixed overhead and the widget shows it barely moving from the smallest picture to the largest.
                </p>
                <InAModel>
                  <p>
                    Holding fewer parameters buys a model that can be estimated
                    from less data, fits in less memory, and carries a constraint
                    that matches how pictures work. What it costs to run is a
                    separate question, decided by how the sum is arranged and how
                    large the picture is, and on this page the same layer is the
                    slower of the two on an eight by eight picture and the quicker
                    at twenty-eight by twenty-eight.
                  </p>
                </InAModel>
                <KeepInMind>
                  The seven loops and the single multiply add up the same products
                  in a different order, and their answers differ by a few rounding
                  steps. A convolution holding 234 times fewer parameters than a
                  dense layer can still take longer to run on a small picture, so
                  the saving in parameters and the saving in time have to be
                  measured separately.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="29. What a complete implementation must specify">
                <p>
                  Two convolutions can agree on every word of the description
                  above and still answer different numbers on the same picture. The
                  decisions that separate them are mostly invisible until that
                  happens, so it is worth writing down what a complete
                  implementation has to fix. The table records what this one fixes
                  and where it declines to offer a choice at all.
                </p>
                <DerivationTable
                  expressionHeading="the decision"
                  reasonHeading="what is decided here"
                  rows={[
                    {
                      expression: "arrangement read",
                      reason:
                        "three extents exactly, channels then height then width. A bare integer or two extents is refused by name.",
                    },
                    {
                      expression: "flipped or not",
                      reason:
                        "not flipped, so this computes a cross-correlation under the name convolution, as every framework does.",
                    },
                    {
                      expression: "window, stride, padding",
                      reason:
                        "one square window, one stride and one padding, shared by both axes. Rectangular windows and per-axis settings are absent rather than defaulted.",
                    },
                    {
                      expression: "what padding contains",
                      reason:
                        "zeros. Reflecting or repeating the border is not offered, and the border is built on both passes rather than carried on the response.",
                    },
                    {
                      expression: "dilation",
                      reason:
                        "absent. A window always reads adjacent cells, so there is no setting that spreads it out.",
                    },
                    {
                      expression: "the bias",
                      reason:
                        "one per filter, started at zero, added once at every output position.",
                    },
                    {
                      expression: "where the weights start",
                      reason:
                        "normal draws scaled by the square root of two over the fan-in, the fan-in being channels times the window area. The seed is a construction argument, so two layers built alike are the same layer.",
                    },
                    {
                      expression: "the activation",
                      reason:
                        "one activation function for the whole layer, since a filter answers at many positions and there is no per-position identity for an activation function to belong to.",
                    },
                    {
                      expression: "the gradient block",
                      reason:
                        "kernels flattened to two dimensions on the way out and reshaped back on the way in, by this layer and nothing else, since only the layer that made a gradient can say what its axes mean.",
                    },
                    {
                      expression: "a training step",
                      reason:
                        "a new layer of the same geometry carrying moved parameters. Nothing is mutated, so a fitted layer stays reproducible.",
                    },
                    {
                      expression: "a step with no gradient",
                      reason:
                        "refused. A convolution has parameters and has nothing to answer with when asked to step by nothing.",
                    },
                  ]}
                />
                <KeepInMind>
                  Padding value, the flip, and dilation are the three that most
                  often differ between two implementations of what is called the
                  same layer. They are the first three to check when two libraries
                  disagree about a number.
                </KeepInMind>
              </SubSection>

              <SubSection title="30. The edges, probed">
                <p>
                  Below is every edge asked of a convolution as this page loads,
                  with what came back rather than what ought to. Nineteen are
                  attempted, sixteen are refused, and every one of the sixteen
                  names itself in words that say what was wrong rather than in a
                  message from the interpreter.
                </p>
                <ConvolutionEdgeCases />
                <p>
                  Two of those refusals are there because the natural mistake would otherwise escape as a bare failure. Giving a whole number where three extents are wanted is exactly what a dense layer&rsquo;s width looks like, and without a guard it would come back saying that an integer is not iterable; here it says that a convolution reads channels, height and width, and got 8, which is not a sequence of extents.
                </p>
                <p>
                  Giving a flag where a count is wanted is the other, since a flag indexes as one and would otherwise slip through as a layer with a single filter.
                </p>
                <p>
                  Three are accepted, and each of the three is a decision rather than an oversight. A window the size of the whole picture answers with a single number from one position and holds 65 parameters reading 64, which is a dense layer wearing this layer&rsquo;s interface and is not wrong, only pointless. A stride of four with a window of three answers two by two and leaves 28 of the 64 cells outside every window.
                </p>
                <p>
                  A padding of four with a window of three answers fourteen by fourteen, of which 96 of the 196 positions read nothing but invented border and so answer with the bias and no evidence at all.
                </p>
                <p>
                  Two things a reader might look for are absent from the table, and
                  both for the same reason. There is no unfitted state to guard and
                  no feature names to match, because a layer holds its weights from
                  the moment it is built and reads positions rather than named
                  columns. Its whole contract is the arrangement, so almost every
                  refusal it has is about an arrangement or about a number that
                  cannot be a window.
                </p>
                <KeepInMind>
                  A refusal that names the arrangement is worth more than one that
                  names a Python type, because the arrangement is what the caller
                  got wrong. The three accepted rows are worth as much again, since
                  each is a setting that will quietly do something other than what
                  was probably intended.
                </KeepInMind>
              </SubSection>

              <SubSection title="31. The join that names both arrangements">
                <p>
                  The last block of the widget above offers three chains of layers
                  to a stack. The first puts a layer that reads a row directly on
                  top of the page&rsquo;s convolution, which answers a map of one
                  channel by six by six, and the layer above reads a row of
                  thirty-six. Those hold the same count of numbers and are not the
                  same thing, and the stack refuses to be built.
                </p>
                <Equation>
                  {
                    "layer 0 answers with (1, 6, 6) and layer 1 reads (36,);\nboth hold 36 numbers, so it is the arrangement that disagrees\nand not the width"
                  }
                </Equation>
                <p>
                  The second half of that message is the part worth having. A check
                  that compared counts alone would have let this join through, and
                  a message that said only that a shape did not match would send a
                  reader looking for a bug in the code rather than for the
                  missing layer. The third chain is the twenty-eight by twenty-eight example
                  joined the same wrong way, where the two sides are (8, 26, 26)
                  and (5408,) and the message says the same thing about 5,408
                  numbers.
                </p>
                <p>
                  The repair is a flattening layer between them, which changes no
                  number and only restates the arrangement, and the middle chain is
                  that. It builds, holds three layers, reads (1, 8, 8) and answers a
                  row of three. Every join in a stack is settled this way at the
                  moment the stack is assembled, in integer comparisons, before any
                  picture has been read.
                </p>
                <KeepInMind>
                  Two arrangements holding the same count of numbers are not
                  interchangeable, and the failure when they are treated as though
                  they were is a network that trains happily while reading the
                  picture sideways. That is the case this whole family of checks
                  exists to catch.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            choice(
              "A first layer of eight filters over one channel holds 80 parameters. A second layer of sixteen filters, same three by three window, reading those eight maps holds how many?",
              ["144", "1,168", "160", "2,340"],
              1,
              "A filter holds one weight for each cell of its window in each input channel, plus a bias, so the eight maps beneath multiply the cost of every filter above them. The second layer comes to 1,168, which is 14.6 times the first. Counting a filter as a flat three by three grid would undercount it eightfold here.",
            ),
            trueFalse(
              "Padding with zeros is neutral, because a zero contributes nothing to any sum it enters.",
              false,
              "The first half is exactly why zeros are chosen, and it is still an assumption, namely that the world outside the picture is dark. A filter looking for a bright region will find an edge along the border of a padded picture that was not there before the padding. What padding buys is real, since the corner’s coverage goes from 1 window position to 4 and the picture stops shrinking by two cells a side per layer.",
            ),
            choice(
              "At a stride of two with a three by three window the eight by eight picture answers three by three. What else does the geometry table report about that setting?",
              [
                "Every cell is still read, only less often",
                "15 of the 64 cells lie inside no window position at all",
                "The parameter count falls to a quarter",
                "The border cells are read four times each",
              ],
              1,
              "Raising the stride shrinks the answer to a quarter as many numbers without adding a layer, and the cost is countable. Pushing to a stride of four answers two by two and leaves 28 of the 64 cells outside every window, which the failure contracts record as accepted rather than refused. A setting that answers with a pleasingly small map may be ignoring a quarter of the picture to do it.",
            ),
            choice(
              "A slope of one is sent to every one of the thirty-six answer cells over the page’s square. What does each of the nine kernel entries come back wanting?",
              [
                "16, the number of lit cells in the picture",
                "36, one for each position it was used at",
                "9, one for each entry of the kernel",
                "4, the largest entry of the map",
              ],
              0,
              "A kernel entry multiplied a one at sixteen of its thirty-six positions and a zero at the other twenty, and its slope is the sum over every position it was used at, which is the sharing seen from behind. It is the bias that comes back wanting 36, because it was added once at every position. Both directions accumulate rather than assign, and writing the kernel slope as an assignment leaves the layer training on the last window it visited.",
            ),
            trueFalse(
              "A convolution answering (1, 6, 6) placed directly beneath a layer reading (36,) is refused at the moment the stack is built, before any picture has been read.",
              true,
              "Every join in a stack is settled in integer comparisons when the stack is assembled, and the refusal says that both sides hold 36 numbers so it is the arrangement that disagrees and not the width. A check comparing counts alone would have let the join through, and a message saying only that a shape did not match would send a reader hunting for a bug rather than for the missing layer. The repair is a flattening layer, which changes no number and only restates the arrangement.",
            ),
        ],
        },
        {
          title: "Practice. Sweeping the Page’s Square With the Library",
          practice: [
            exercise(
              "Sweep the vertical edge kernel across the square",
              ["Paint the page’s picture, eight cells by eight with a four by four square lit in rows 2 to 5 and columns 2 to 5, and build a convolution reading one channel of eight by eight with a single three by three filter and an identity activation. Hand it the vertical edge kernel through with_parameters, with a bias of zero, and sweep it across the picture.", "Print the six by six map, the arrangement the layer answers with, how many parameters it holds, and the answer at row 2, column 0, which Part 2 worked by hand and got 4. Then count how many of the thirty-six answers are not zero, which the page does not print."],
              `import numpy as np
from oop_ml import Conv2d, Identity

picture = np.zeros((8, 8))
picture[2:6, 2:6] = 1.0
kernel = np.array([[-1.0, 0.0, 1.0], [-2.0, 0.0, 2.0], [-1.0, 0.0, 1.0]])

layer = Conv2d(reads=(1, 8, 8), n_filters=1, kernel_size=3, activation=Identity(), random_seed=0)
# Give the layer the kernel and a zero bias, sweep it across the picture as a
# block of one row and one channel, and print the map, the arrangement
# answered, the parameter count, the answer at row 2, column 0, and how many
# of the thirty-six answers are not zero.`,
              `import numpy as np
from oop_ml import Conv2d, Identity

picture = np.zeros((8, 8))
picture[2:6, 2:6] = 1.0
kernel = np.array([[-1.0, 0.0, 1.0], [-2.0, 0.0, 2.0], [-1.0, 0.0, 1.0]])

layer = Conv2d(reads=(1, 8, 8), n_filters=1, kernel_size=3, activation=Identity(), random_seed=0)
layer = layer.with_parameters(kernel.reshape(1, 1, 3, 3), np.zeros(1))
response = layer.respond_to(picture.reshape(1, 1, 8, 8))
swept = np.asarray(response.outputs)[0, 0]

print(swept)
print(f"arrangement answered {layer.shape.answers}")
print(f"parameters {layer.kernels.size + layer.bias_vector.size}")
print(f"answer at row 2, column 0 is {swept[2, 0]:.0f}")
print(f"answers that are not zero {np.count_nonzero(swept)} of {swept.size}")`,
              `[[ 1.  1.  0.  0. -1. -1.]
 [ 3.  3.  0.  0. -3. -3.]
 [ 4.  4.  0.  0. -4. -4.]
 [ 4.  4.  0.  0. -4. -4.]
 [ 3.  3.  0.  0. -3. -3.]
 [ 1.  1.  0.  0. -1. -1.]]
arrangement answered (1, 6, 6)
parameters 10
answer at row 2, column 0 is 4
answers that are not zero 24 of 36`,
              { hints: ["The layer draws random kernels when it is built, and with_parameters answers a copy carrying the kernels and biases it is given. A bank of kernels is arranged as filters, channels, rows and columns, so one three by three kernel over one channel is a block of (1, 1, 3, 3).", "A convolution reads a block whose leading axis is rows, so a single picture goes in arranged as (1, 1, 8, 8), one row holding one channel of eight by eight.", "The response’s outputs come back arranged the same way, so the map for the one picture and the one filter is the slice at row 0, channel 0."], check: numberCheck("How many of the thirty-six answers are not zero?", 24, 0.5, "The two columns of windows that straddle the square’s left edge answer positive numbers, 1, 3, 4, 4, 3 and 1 down each, and the two that straddle its right edge answer the same numbers negated. The two columns of windows between them answer zero, because every row of such a window is the same shade all the way across and the kernel’s two outer columns cancel. That is twenty-four cells with an answer and twelve without, and the whole map sums to zero.") },
            ),
            exercise(
              "Move the picture and the answer moves",
              ["Part 4 claims that moving the picture a column to the right moves the map a column to the right, exactly, whatever the kernel holds. Sweep the resting picture, then slide it one, two and three columns right with zeros entering at the left, sweep each, and compare the moved answer against the resting answer moved by the same amount over the columns the move leaves inside the map.", "Print how many picture cells and how many map cells changed at each shift and the largest gap between the two maps. Part 4 reports 8 picture cells and 18 map cells at a shift of one and 16 and 36 at a shift of two, and a gap of 0 throughout. A shift of three is not on the page."],
              `import numpy as np
from oop_ml import Conv2d, Identity

picture = np.zeros((8, 8))
picture[2:6, 2:6] = 1.0
kernel = np.array([[-1.0, 0.0, 1.0], [-2.0, 0.0, 2.0], [-1.0, 0.0, 1.0]])
layer = Conv2d(reads=(1, 8, 8), n_filters=1, kernel_size=3, activation=Identity(), random_seed=0)
layer = layer.with_parameters(kernel.reshape(1, 1, 3, 3), np.zeros(1))
resting = np.asarray(layer.respond_to(picture.reshape(1, 1, 8, 8)).outputs)[0, 0]

for shift in (1, 2, 3):
    # Slide the picture shift columns to the right with zeros entering at the
    # left, sweep it, and print how many picture cells changed, how many map
    # cells changed, and the largest gap between the moved map and the resting
    # map moved by the same number of columns.
    pass`,
              `import numpy as np
from oop_ml import Conv2d, Identity

picture = np.zeros((8, 8))
picture[2:6, 2:6] = 1.0
kernel = np.array([[-1.0, 0.0, 1.0], [-2.0, 0.0, 2.0], [-1.0, 0.0, 1.0]])
layer = Conv2d(reads=(1, 8, 8), n_filters=1, kernel_size=3, activation=Identity(), random_seed=0)
layer = layer.with_parameters(kernel.reshape(1, 1, 3, 3), np.zeros(1))
resting = np.asarray(layer.respond_to(picture.reshape(1, 1, 8, 8)).outputs)[0, 0]

for shift in (1, 2, 3):
    moved = np.zeros_like(picture)
    moved[:, shift:] = picture[:, : 8 - shift]
    swept = np.asarray(layer.respond_to(moved.reshape(1, 1, 8, 8)).outputs)[0, 0]
    gap = np.abs(swept[:, shift:] - resting[:, : 6 - shift]).max()
    print(
        f"shift {shift}: {np.count_nonzero(moved != picture)} picture cells changed, "
        f"{np.count_nonzero(swept != resting)} map cells changed, largest gap {gap}"
    )`,
              `shift 1: 8 picture cells changed, 18 map cells changed, largest gap 0.0
shift 2: 16 picture cells changed, 36 map cells changed, largest gap 0.0
shift 3: 20 picture cells changed, 30 map cells changed, largest gap 0.0`,
              { hints: ["A picture moved one column right holds, at column j, what the original held at column j minus one, so slice the original’s first seven columns into the moved picture’s last seven and leave the first column dark.", "The columns pushed off the right edge of the map have nothing to be compared against, so compare the moved map from column shift onwards with the resting map up to column six minus shift.", "The answer at a shift of three has only three columns left to compare, and the claim is that those three agree to the last bit."], check: numberCheck("How many of the map’s thirty-six cells change at a shift of three?", 30, 0.5, "At a shift of three the square’s left edge has moved from column 2 to column 5 and its right edge has left the picture, so every window that straddled an edge before now reads something else. The only cells that keep their value are the six in the third column of the map, which read the dark columns 2 to 4 of the moved picture and answer zero, as they did at rest. The gap is still 0, because the three columns left to compare are the resting map moved three columns along, which is what equivariance promises.") },
            ),
            exercise(
              "Send a slope of one back down",
              ["Part 6 works the backward pass by hand with a slope of one arriving at every answer cell. Reproduce it. Sweep the square, build a block of ones the same shape as the answer, and ask the layer for its correction.", "Print the nine kernel slopes, the bias slope, the blame handed down to the picture, what the corner cell and the centre cell receive, and how many of the sixty-four cells receive nothing. Part 6 says every kernel entry wants 16, the bias wants 36, the corner collects −1, and thirty-two cells receive nothing."],
              `import numpy as np
from oop_ml import Conv2d, Identity

picture = np.zeros((8, 8))
picture[2:6, 2:6] = 1.0
kernel = np.array([[-1.0, 0.0, 1.0], [-2.0, 0.0, 2.0], [-1.0, 0.0, 1.0]])
layer = Conv2d(reads=(1, 8, 8), n_filters=1, kernel_size=3, activation=Identity(), random_seed=0)
layer = layer.with_parameters(kernel.reshape(1, 1, 3, 3), np.zeros(1))
response = layer.respond_to(picture.reshape(1, 1, 8, 8))

# Build a block of ones the shape of the answer, ask the layer for its
# correction, and print the kernel slopes as a three by three grid, the bias
# slope, the blame handed down, the corner and centre cells of that blame, and
# how many cells receive nothing.`,
              `import numpy as np
from oop_ml import Conv2d, Identity

picture = np.zeros((8, 8))
picture[2:6, 2:6] = 1.0
kernel = np.array([[-1.0, 0.0, 1.0], [-2.0, 0.0, 2.0], [-1.0, 0.0, 1.0]])
layer = Conv2d(reads=(1, 8, 8), n_filters=1, kernel_size=3, activation=Identity(), random_seed=0)
layer = layer.with_parameters(kernel.reshape(1, 1, 3, 3), np.zeros(1))
response = layer.respond_to(picture.reshape(1, 1, 8, 8))

arriving = np.ones_like(np.asarray(response.outputs))
correction = layer.correction_for(response, arriving)
print(np.asarray(correction.gradient.weights).reshape(3, 3))
print(f"bias slope {correction.gradient.biases[0]:.0f}")
blame = np.asarray(correction.passed_down)[0, 0]
print(blame)
print(f"corner cell receives {blame[0, 0]:.0f}, centre cell receives {blame[4, 4]:.0f}")
print(f"cells receiving nothing {np.count_nonzero(blame == 0)} of {blame.size}")`,
              `[[16. 16. 16.]
 [16. 16. 16.]
 [16. 16. 16.]]
bias slope 36
[[-1. -1.  0.  0.  0.  0.  1.  1.]
 [-3. -3.  0.  0.  0.  0.  3.  3.]
 [-4. -4.  0.  0.  0.  0.  4.  4.]
 [-4. -4.  0.  0.  0.  0.  4.  4.]
 [-4. -4.  0.  0.  0.  0.  4.  4.]
 [-4. -4.  0.  0.  0.  0.  4.  4.]
 [-3. -3.  0.  0.  0.  0.  3.  3.]
 [-1. -1.  0.  0.  0.  0.  1.  1.]]
corner cell receives -1, centre cell receives 0
cells receiving nothing 32 of 64`,
              { hints: ["correction_for takes the response the forward pass produced and the slope arriving at every answer cell, which here is a block of ones arranged like the outputs.", "The correction’s gradient holds the kernel slopes flattened to one row per filter, so the nine for this filter reshape to three by three, and its biases hold one slope per filter.", "The blame handed down is passed_down, arranged like the picture the layer read, so the corner is row 0, column 0 and the centre of an eight by eight is row 4, column 4."], check: numberCheck("What slope does the bias come back wanting?", 36, 0.5, "The bias was added once at every one of the thirty-six answer positions, so its slope is the arriving slopes added up, and with a slope of one everywhere that is a count of positions. Each kernel entry wants 16 for the same reason, since it multiplied a lit cell at sixteen of those positions and a dark one at the other twenty. Both are sums rather than assignments, which is the sharing seen from behind.") },
            ),
            exercise(
              "Count the library’s own example, and refuse the wrong join",
              ["Part 3 costs a twenty-eight by twenty-eight picture read by eight filters of three by three, and Part 7 puts a layer that reads a row straight on top of a convolution. Build that convolution, count its parameters and those of a dense layer reading the same 784 cells and answering the same 5,408 numbers, and print the ratio.", "Then build a dense layer of ten neurons reading 5,408 numbers, offer the two to a stack with nothing between them, and print the class and the message of what comes back. Finally put a flattening between them and print what the stack that builds reads and answers."],
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, Identity, LayerStack, MLLibError, Neuron

layer = Conv2d(reads=(1, 28, 28), n_filters=8, kernel_size=3, activation=Identity(), random_seed=0)
# Print the arrangement the layer answers with and how many numbers it holds,
# then count the convolution's parameters and those of a dense layer of equal
# width, and print both with their ratio.

reader = DenseLayer([Neuron(np.zeros(layer.shape.n_outputs), 0.0, Identity()) for _ in range(10)])
# Offer the convolution and the reader to a LayerStack with nothing between
# them, catching the library's refusal and printing its class and message.
# Then build the stack again with a Flatten between them and print how many
# layers it holds, what it reads and what it answers.`,
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, Identity, LayerStack, MLLibError, Neuron

layer = Conv2d(reads=(1, 28, 28), n_filters=8, kernel_size=3, activation=Identity(), random_seed=0)
convolution = layer.kernels.size + layer.bias_vector.size
dense = layer.shape.n_outputs * layer.shape.n_inputs + layer.shape.n_outputs
print(f"answers {layer.shape.answers}, holding {layer.shape.n_outputs} numbers")
print(f"convolution {convolution} parameters, dense layer of equal width {dense}, ratio {dense / convolution:.0f}")

reader = DenseLayer([Neuron(np.zeros(layer.shape.n_outputs), 0.0, Identity()) for _ in range(10)])
try:
    LayerStack([layer, reader])
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)
stack = LayerStack([layer, Flatten(layer.shape.answers), reader])
print(f"with a flattening between them the stack holds {len(stack)} layers, reads {stack.shape.reads} and answers {stack.shape.answers}")`,
              `answers (8, 26, 26), holding 5408 numbers
convolution 80 parameters, dense layer of equal width 4245280, ratio 53066
ShapeMismatchError
layer 0 answers with (8, 26, 26) and layer 1 reads (5408,); both hold 5408 numbers, so it is the arrangement that disagrees and not the width
with a flattening between them the stack holds 3 layers, reads (1, 28, 28) and answers (10,)`,
              { hints: ["A layer’s shape carries reads and answers as tuples of extents, and n_inputs and n_outputs as the products of those extents, so the dense count is n_outputs times n_inputs plus n_outputs.", "Every refusal the library makes derives from MLLibError, so catching that catches this one, and its message names both arrangements and says that the counts agree.", "Flatten takes the arrangement it will read, which is exactly what the convolution answers, so handing it the convolution’s own shape.answers builds the right bridge."], check: numberCheck("How many parameters does the dense layer of equal width hold?", 4245280, 0.5, "A dense layer reading 784 cells and answering 5,408 numbers holds one weight per input per output plus one bias per output, which is 5,408 times 784 plus 5,408. The convolution holds 80, eight filters of nine weights and a bias, so the dense layer holds 53,066 times as many for an answer of exactly the same size, and the ratio would go on growing with the picture while the 80 stayed as it is.") },
            ),
          ],
        },
      ]}
    />
  );
}
