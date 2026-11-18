import { pageMetadata } from "@/lib/seo";
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

export const metadata: Metadata = pageMetadata("/concepts/convolution", {
  title: "Convolution · Perceptron Lab",
  description:
    "Convolution applies the same small set of weights across different positions. The resulting response map describes where a local pattern appears, using fewer independent weights than a separate rule for every position.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function ConvolutionPage() {
  return (
    <ConceptPage
      lessonId="convolution"
      intuition={lessonIntuitions["convolution"]}
      technicalStart="Part 2. Applying a Convolution Filter"
      openingTitle="Look for the Same Pattern in More Than One Place"
      playgroundTitle="Move one filter across the image"
      playgroundIntro="Inspect one input window and the output value it produces. Move to the next position and check that the same weights are reused."
      title="Convolution"
      tagline={"Convolution applies the same small set of weights across different positions. The resulting response map describes where a local pattern appears, using fewer independent weights than a separate rule for every position."}
      prerequisites={<>The <Link href="/concepts/dense-layers" className={link}>dense layer page</Link> explains weighted sums and layer inputs and outputs. We compare that operation with a weighted sum over a small image patch. The <Link href="/primers/linear-algebra" className={link}>linear algebra primer</Link> introduces the dot product used in that sum. <Link href="/concepts/shapes-and-flattening" className={link}>Shapes and flattening</Link> explains array axes and extents. Part 6 uses <Link href="/concepts/backpropagation" className={link}>backpropagation</Link> to calculate how the loss changes with each input and parameter.</>}

      playground={<ConvolutionPlayground />}
      sections={[
        {
          title: "Part 1. Why a Picture Is Not a Row",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The picture we will carry through the page">
                <p>
                  Our first image is an eight-by-eight grid with a four-by-four square in its middle. Every pixel is zero or one. Beside it is a three-by-three grid of weights. Instead of combining all sixty-four image values at once, we will place these nine weights over one small patch and calculate a response there.
                </p>
                <p>
                  The grid on the right is what comes back when those nine weights are swept across the picture, and it is six cells by six because a three by three window fits into an eight by eight picture in six places along each side.
                </p>
                <p>The square occupies rows 2 to 5 and columns 2 to 5, counting from zero. Its left edge lies between columns 1 and 2, and its right edge between columns 5 and 6. We reuse this picture in the calculations and widgets so we can compare changes to the filter while keeping the input familiar.</p>
                <WorkedExample title="The picture, written out">
                  <p>
                    Rows 0, 1, 6 and 7 are dark all the way across. Rows 2, 3, 4
                    and 5 read 0, 0, 1, 1, 1, 1, 0, 0. Sixteen of the sixty-four
                    cells are lit, and they form a solid block with a straight
                    edge on each of its four sides.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  We start with sixty-four pixel values and nine filter weights. This is enough to calculate a complete convolution by hand. Later sections compare the same operation on larger images.</KeepInMind>
              </SubSection>

              <SubSection title="2. Flattening and spatial structure" id="2-a-layer-that-reads-a-row-is-never-told-where-the-cells-were">
                <p>
                  A dense layer takes a list of numbers and answers with another
                  list, and each of its answers is a weighted sum of the whole
                  input. To hand it this picture we first have to flatten it, so
                  the eight rows are laid end to end into a list of sixty-four.
                  Cell row 0 column 0 becomes entry 0, cell row 0 column 1
                  becomes entry 1, and cell row 1 column 0 becomes entry 8.
                </p>
                <p>Flattening preserves every value in a known order. Given the original dimensions and ordering, we can reconstruct the image. A standard dense layer, however, assigns an independent weight to each input position without treating nearby pixels as a special group. Horizontal and vertical neighbors receive no built-in relationship beyond their distinct positions in the list.</p>
                <p>A dense layer can learn useful spatial relationships from examples. Convolution builds in a different assumption: nearby pixels should be processed together, and the same local rule should apply at different positions. That reduces the number of independently learned weights.</p>
                <Equation>
                  {
                    "flattened[8 · row + column]  =  picture[row, column]\n\nanswer[j]  =  bias[j]  +  Σ over i of  weight[j, i] · flattened[i]"
                  }
                </Equation>
                <p>Apply one fixed permutation to the sixty-four pixel positions and the same permutation to the columns of the dense weight matrix. Every pixel is still multiplied by its original weight, so the mathematical outputs stay the same. The next widget checks this comparison and shows the small floating-point differences caused by changing the summation order.</p>
                <KeepInMind>
                  Dense layers can process pictures. The distinction is that an ordinary dense weight matrix does not require local connections or share a detector across image positions. Those constraints are built into convolution.</KeepInMind>
              </SubSection>

              <SubSection title="3. Comparing responses to a pixel shuffle" id="3-what-is-lost-by-flattening-measured-on-a-shuffle">
                <p>The widget applies a fixed shuffle to the image and a matching permutation to the dense layer’s input weights. It compares that rewired layer on the shuffled image with the original layer on the original image. It also applies the same convolution kernel to both pictures, keeping the kernel unchanged.</p>
                <p>The rewired dense layer’s largest disagreement across thirty-six outputs is about 2.2 × 10<sup>−16</sup>. Reordering floating-point additions can produce a difference this small even though the mathematical sums are equal. The unchanged convolution kernel responds differently to the rearranged neighborhoods: its largest output difference is 6, and 27 of the 36 output cells change. The original response map has a largest magnitude of 4.</p>
                <ShuffleComparison />
                <p>Eighteen of the sixty-four pixel values change under this shuffle. That is enough to disrupt the square’s straight boundaries. Compare the response maps: the original has positive responses along the left edge, zeros across the interior and negative responses along the right edge. The shuffled image produces a different arrangement of local edge responses.</p>
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
                <p>The window restricts each output to nearby pixels. We call this locality. Reusing the same weights at every position is weight sharing. The distance the window moves between calculations is the stride; so far it is one pixel. These choices determine which pixels contribute, how many independent parameters we need and how the output responds when the picture moves.</p>
                <DerivationTable
                  expressionHeading="what changes"
                  reasonHeading="effect"
                  rows={[
                    {
                      expression: "a local window",
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
                        "outputs retain their spatial ordering, so a later layer can combine neighboring responses.",
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
          title: "Part 2. Applying a Convolution Filter", id: "part-2-one-kernel-swept",
          content: (
            <>
              <SubSection title="5. Nine weights, one bias, and a window">
                <p>The grid of nine weights is called a kernel. Here we use filter to mean that kernel together with one bias. At every window position we sum the nine weighted pixel values and add the same bias once. The output map contains one number for each valid position. There is one bias parameter per filter, reused across positions.</p>
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

              <SubSection title="6. Multiply and add at one window position" id="6-one-position-worked-by-hand">
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
                  A zero product does not imply a zero kernel weight. Here several nonzero weights multiply dark pixels whose values are zero. At another window position, the same weights can multiply lit pixels and contribute to the result.</KeepInMind>
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
                  Equal responses can occur at different positions or for different local patterns. The map records each filter’s response and its location; a single response value does not reconstruct the pixel window that produced it.</KeepInMind>
              </SubSection>

              <SubSection title="8. What a different kernel finds in the same picture">
                <p>

                  Nothing about the sweep is particular to edge detection. The
                  same procedure with nine different numbers answers a different
                  question about every neighborhood, and the playground&rsquo;s
                  preset buttons are four more of them. Switching the kernel does
                  not change the picture, the window, the stride or the size of
                  the answer, only what the nine weights are asking.
                </p>
                <p>
                  Turn the kernel on its side and it finds the square&rsquo;s top and bottom edges instead, with the interior at zero and the vertical edges invisible. Set all nine weights to a ninth and it answers the mean of the window, so the interior comes back at 1, the corner where only one cell is lit comes back at a ninth, and the map is a blurred copy of the picture.
                </p>
                <p>The diagonal preset changes the local pattern rather than the filter. Both edge kernels respond, with smaller peak magnitudes in this fixture than on the solid square. The response follows from which weighted positions contain lit pixels; it is not a universal rule that diagonal edges have half the response.</p>
                <InAModel>
                  <p>

                    None of the kernels on this page were learned. They are hand
                    written so that the arithmetic can be followed, and in a
                    trained network the nine weights are whatever
                    backpropagation left there. What is often found in the first
                    layer of a trained network does look a great deal like these,
                    edges at various angles and small blobs of color, which is
                    a result rather than something the architecture guarantees.
                  </p>
                </InAModel>
                <KeepInMind>

                  Changing kernel values changes the local weighted sum. The same operation can implement a blur, a sharpening filter or an edge detector, depending on the chosen weights.</KeepInMind>
              </SubSection>

              <SubSection title="9. The name says convolution and the arithmetic says correlation">
                <p>There is a naming convention to distinguish. Signal-processing convolution reverses the kernel along both spatial axes before sliding it. The unflipped sum is cross-correlation. This SDK uses the unflipped form, as common neural-network convolution layers such as PyTorch Conv2d do.</p>
                <Equation>
                  {
                    "cross-correlation   answer[i, j]  =  Σ  kernel[u, v] · picture[i + u,     j + v]\nconvolution         answer[i, j]  =  Σ  kernel[u, v] · picture[i − u + 2, j − v + 2]"
                  }
                </Equation>
                <WhyThisWorks title="Why the flip makes no difference to a learned kernel">
                  <p>Suppose a convolution using a reversed kernel has learned particular weights. An unflipped cross-correlation can produce the same sums by storing those weights reversed along both spatial axes. The two parameterizations therefore describe the same family of functions when all kernel entries are freely learned. They differ in the orientation of the stored weights.</p>
                  <p>The distinction still matters when using known signal-processing filters. Reversal gives convolution its standard commutative form and its usual Fourier product identity. Cross-correlation has a related Fourier identity with a reversal or conjugation. Equivalent learned function families do not make the two operations interchangeable when the kernel is fixed.</p>
                </WhyThisWorks>
                <p>
                  The consequence for a reader is small but real. A kernel copied
                  out of a signal processing reference has to be flipped before
                  it will do here what the reference says it does, and a kernel
                  that is symmetric under that flip, which the blur is and the
                  vertical edge kernel is not, will behave the same either way.
                </p>
                <KeepInMind>
                  Check whether a library reverses the kernel when reproducing a published filter. A freely learned kernel can represent either orientation, but a copied fixed kernel may produce a different result under the two conventions.</KeepInMind>
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
              "For a dense row reader, applying the same permutation to the pixels and their matching weights preserves the sum in exact arithmetic. The tiny reported disagreement comes from floating-point summation order. A convolution instead uses spatial neighborhoods, which an arbitrary pixel shuffle changes. Its responses therefore need not be preserved by that shuffle.",
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
              "Six of the nine products are zero because the cell beneath them is zero, and the three that survive are the right column against lit cells. Move the window two cells right so the left column sits on lit cells too and it brings −4, canceling the right column and leaving 0.",
            ),
            trueFalse(
              "A kernel entry that contributes zero at some position has effectively been switched off.",
              false,
              "It multiplied a cell that happened to be dark. The left column holds −1, −2 and −1, the largest weights the kernel has in magnitude after the right column, and they dominate the sum as soon as the window moves far enough right for lit cells to sit under them.",
            ),
            trueFalse(
              "The layer everyone calls a convolution computes the unflipped sum, so it can represent less than the flipping version can.",
              false,
              "Deep-learning layers commonly calculate cross-correlation, using the kernel without reversing its spatial axes. Reversing a learnable kernel gives the corresponding mathematical-convolution kernel, so either convention represents the same family of filters. The distinction matters when importing fixed kernels: check which operation the reference defines before copying its numbers.",
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
                <p>Restricting the connections to local windows reduces this example from 2,340 parameters to 360. Reusing one window’s parameters across positions will reduce the count further. These are separate constraints, so we can measure their contributions separately.</p>
                <KeepInMind>
                  A layer with local windows and independent weights at each position is called locally connected. It can be useful when positions have distinct roles, such as consistently aligned image regions. Convolution adds the further constraint of sharing weights across positions.</KeepInMind>
              </SubSection>

              <SubSection title="11. Sharing, which is one set of nine used thirty-six times">
                <p>With weight sharing, the thirty-six independent sets become one set of nine weights and one bias. The convolution has ten parameters and still produces thirty-six output values. Those values need not match an arbitrary locally connected layer; the output shape is what stays the same.</p>
                <p>For one filter, the parameter count depends on the window area and number of input channels. It does not depend on image height or width: the same weights can be reused at additional positions. A layer with more output filters has a proportionally larger count, as section 12 shows.</p>
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
                <p>For a three-channel color image, one three-by-three filter has 27 weights and one bias, giving 28 parameters. The filter reads a patch from all three channels to produce one output value. Compared with a one-channel input, the weight count triples while the one shared bias remains. A dense layer with a fixed number of outputs also triples its input-weight count; its output width need not change.</p>
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

                  For multiple input channels, each filter stores a channel axis as well as its two spatial axes. A bank also has an output-filter axis. Counting only a three-by-three grid per filter omits the additional channel weights.</KeepInMind>
              </SubSection>

              <SubSection title="13. The ratio grows with the picture">
                <p>Keep the kernel, channel count and filter count fixed while increasing image size. The convolution parameter count stays constant. A dense layer producing an equally sized output map has an input count and an output count that both grow with image area, so its parameter count grows roughly quadratically in that area. The output map and amount of convolution work still grow.</p>
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
                  <p>Sharing assumes that the same local feature can be useful at different positions. That is often appropriate for images, but it does not describe every image task or every kind of data. In a table, adjacent columns might be temperature and account balance. Sliding one shared filter across those unrelated measurements would impose a relationship that their ordering does not justify.</p>
                </InAModel>
                <KeepInMind>
                  The ratio 53,066 belongs to this image and window geometry. It changes with settings such as image size, input channels, kernel size, stride and padding. When the comparison matches the number of output filters on both sides, changing that number scales both parameter counts equally and leaves their ratio unchanged.</KeepInMind>
              </SubSection>

              <SubSection title="14. What the constraint costs">
                <p>A single output position sees only its local window. It cannot directly combine an eye on one side of a face with a mouth outside that window. The complete response map still preserves where local features occurred, so a later operation can combine them. We can enlarge the window, or stack layers so later local windows cover a larger part of the original image. Larger windows increase the weights per filter.</p>
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
                  Each layer has a receptive field in the original input. Stacking small-window layers enlarges the region that can affect a later output. Depth also adds learned transformations, so receptive-field growth is one consequence of depth rather than its complete definition.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Move the Picture and the Answer Moves",
          content: (
            <>
              <SubSection title="15. The square, slid one column across">
                <p>Move the square one column right and apply the same filter again. At stride one, the responses in the overlapping valid region equal the original responses shifted one output position. The widget reports a largest difference of zero there. We compare only positions for which both calculations use the corresponding original pixels.</p>
                <p>This relationship follows from reusing the same weights, so it holds for every kernel setting in the widget. Changing the kernel changes the detected pattern while preserving the shift relationship on the comparable region. A filter therefore applies the same local rule wherever its window is placed.</p>
                <ShiftLedger />
                <p>At shift one, eight pixel values and eighteen output cells change in this fixture. At shift two, sixteen pixels and all thirty-six output cells change. The map’s values at fixed positions can change even though the shifted responses agree on the overlapping region. We call that relationship translation equivariance.</p>
                <KeepInMind>
                  The sweep column reports the maximum difference after aligning the two output maps on their comparable region. Its zeros demonstrate this fixture’s shift relationship. Boundary handling, stride and the set of compared positions remain part of the claim.</KeepInMind>
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
                <p>The fixed detector responds 4 in the original position and 0 after each of the three listed shifts. Its nonzero weights were placed by hand at one location. They provide no matching detector at another location. A convolution reuses its detector at every valid window position.</p>
                <p>The second dense layer has thirty-six randomly initialized outputs, displayed as a six-by-six grid for comparison. After a one-column input shift, its largest disagreement with a correspondingly shifted original output is 1.753. Its largest output magnitude on that shifted picture is 0.896, and all thirty-six coordinates change. This layer has no enforced translation relationship between output coordinates.</p>
                <WorkedExample title="Displaying dense outputs as a grid">
                  <p>{"A dense layer assigns separate weights to its output coordinates without defining a spatial relationship between them. Printing its thirty-six answers as a six by six grid makes comparison convenient, but does not make output 7 a learned neighbor of output 8 or output 1. The layer would calculate the same values if we displayed them in a line. This is the output-side version of the input-order distinction in section 2."}</p>
                </WorkedExample>
                <KeepInMind>
                  A dense layer can learn to handle shifted examples, or be explicitly constrained to share suitable weights. An ordinary dense layer does not enforce that relationship. Convolution enforces its translation relationship through the window and shared weights, subject to stride and boundary conditions.</KeepInMind>
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
                  <p>At stride s, adjacent outputs read windows s pixels apart. A shift of the input corresponds to a whole output-position shift only when its size is divisible by s. The widget marks other shifts as having no integer output alignment. At stride two, an input shift of two aligns with a one-position output shift and gives a zero gap on the compared region.</p>
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
                <p>Pooling summarizes neighborhoods and can reduce sensitivity to some small movements, but it does not guarantee that every movement within or across windows leaves the result unchanged. A whole-map summary discards the individual positions and can give shift-invariant values when a shift merely rearranges map entries without changing their values or losing entries at boundaries. The <Link href="/concepts/pooling" className={link}>pooling page</Link> measures these limits.</p>
                <NumberTable
                  headings={["property", "what it says", "does this layer have it"]}
                  rows={[
                    [
                      "equivariance",
                      "move the picture and the answer moves the same way",
                      "at stride one on corresponding valid regions",
                    ],
                    [
                      "invariance",
                      "move the picture and the answer does not change",
                      "not generally",
                    ],
                    [
                      "rotation equivariance",
                      "turn the picture and the answer turns with it",
                      "not generally; rotating the input need not rotate a fixed kernel’s response",
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
              "Local windows reduce each output’s connections from all 64 input pixels to nine nearby pixels. Without sharing, the 36 positions would still hold separate weights and biases, totaling 360 parameters. Convolution shares one nine-weight kernel and one bias across every position, leaving ten parameters. Locality and sharing provide separate reductions.",
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
              "Each of the second window’s nine inputs was itself formed from a three by three patch, and neighboring patches overlap, so the nine of them together span five cells a side. A third layer covers seven. That growing patch is the receptive field, and stacking layers is what widens it while each layer keeps its own small count of weights, where a wider kernel would widen it at the cost of the parameter saving.",
            ),
            several(
              "When a picture is shifted, which statements hold for the convolution’s output?",
              [
                "Matching output cells move with the picture and have the same value, apart from floating-point rounding",
                "It holds whatever nine numbers the kernel is carrying, since it is a statement about the arithmetic",
                "At a stride of two it holds only for shifts the stride divides",
                "A layer above this one therefore sees the same map for a moved picture"
              ],
              [0, 1, 2],
              "Over a comparable valid region, shifting the input shifts the stride-one convolution response. That is equivariance, not an unchanged output. Pooling, spatial summaries and training choices can help a later predictor become less sensitive to position, but they do not automatically guarantee invariance to every shift. Boundary cropping and stride also matter.",
              {
                "description": "Use a shared kernel and bias, with the same activation at each position. Compare positions whose complete input windows remain inside both pictures. At stride two, test shifts divisible by two."
              },
            ),
            choice(
              "This fixed-position dense detector answers 4 before the picture moves. What does it answer after moving the picture one column to the right?",
              ["4, since the edge is still in the picture", "0", "1.753", "3, since the window now overlaps the edge by two rows"],
              1,
              "This supplied detector uses fixed weights at one location. Moving the edge away from that location gives output zero in the tested shifts. Its construction has no weight-sharing rule that applies the same detector at the new position. A dense model could learn other position-sensitive responses, but this fixed detector has not been trained to do so.",
              {
                "description": "Use zero-based indices. The dense output reads only rows 2–4, columns 0–2 with the nine weights below; every other weight and the bias are zero. Shift the picture right by one column, filling the vacated left column with zeros.",
                "data": "picture =\n0 0 0 0 0 0 0 0\n0 0 0 0 0 0 0 0\n0 0 1 1 1 1 0 0\n0 0 1 1 1 1 0 0\n0 0 1 1 1 1 0 0\n0 0 1 1 1 1 0 0\n0 0 0 0 0 0 0 0\n0 0 0 0 0 0 0 0\n\nweights in the fixed window =\n−1 0 1\n−2 0 2\n−1 0 1"
              },
            ),
        ],
        },
        {
          title: "Part 5. A Bank of Filters, and the Arrangement in Integers",
          content: (
            <>
              <SubSection title="19. One layer holds several filters">
                <p>

                  One filter answers one question about every neighborhood, and
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
                  reads it the way this one read a color picture. A filter in the
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
                  A filter’s weight count is its spatial window area times its input-channel count, plus one bias. Increasing the number of filters widens a layer’s output. If a later convolution reads all those outputs, its filters need more channel weights too.</KeepInMind>
              </SubSection>

              <SubSection title="21. Count the positions where the window fits" id="21-the-output-extent-worked-in-integers">
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
                <p>The floor symbol keeps only whole window positions. If the stride leaves a partial step at the far edge, no output is created for that incomplete position. This is a count of positions, not a measure of all information discarded by the layer. The table constructs each configuration and reads its output shape before running data through it.</p>
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
                <p>Coverage differs between border and interior pixels. With this eight-by-eight image, a three-by-three window and stride one, the top-left pixel appears in one output window while a fully interior pixel appears in nine. That is a ninefold difference in the number of uses, not necessarily in influence on the output or loss. The weights and later gradients determine each contribution’s size and sign.</p>
                <p>One row and column of zero padding on each side preserve the eight-by-eight output size for this three-by-three, stride-one setting. The corner then appears in four windows instead of one, while the middle still appears in nine. Padding improves border coverage here without making it uniform.</p>
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
                  At stride one, an unpadded three-by-three convolution reduces each spatial extent by two. A twenty-eight-by-twenty-eight input cannot pass through fourteen such layers because the final window no longer fits. Appropriate padding preserves the spatial extent in a deep stack of these particular layers.</KeepInMind>
              </SubSection>

              <SubSection title="23. Stride, and the cells no window reaches">
                <p>
                  Stride is how far the window moves between positions, and
                  raising it is a way of shrinking the answer without adding a
                  layer. At a stride of two on the page&rsquo;s picture the answer
                  comes back three by three rather than six by six, which is a
                  quarter as many numbers carried forward.
                </p>
                <p>At stride two with a three-by-three window, fifteen of the sixty-four pixels fall outside every sampled window. Those pixels contribute nothing to this layer’s output. The setting is valid, but its smaller map also reflects skipped image content. Check coverage as well as output size when choosing a stride.</p>
                <p>At stride four, the same three-by-three window produces a two-by-two map and leaves twenty-eight of the sixty-four pixels outside every window. Part 7 includes this valid configuration so we can inspect its behavior alongside configurations that the SDK rejects.</p>
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
                <p>At image side four, configurations whose padded input is smaller than their window are rejected. Padding matters: some five-by-five windows still fit when a border is included. The message reports the dimensions used in the failed calculation, so we can correct the geometry before running a network.</p>
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
                <p>{"The bias contributes at every output position, so its gradient adds the derivatives arriving from those positions. Each kernel weight is reused in the same way: it multiplies a pixel in every window where it is applied. Its gradient must therefore include the contribution from each of the thirty-six positions. Shared parameters collect evidence from every use of that parameter."}</p>
                <Equation>
                  {
                    "∂loss / ∂kernel[u, v]  =  Σ over i, j of  arriving[i, j] · picture[i + u, j + v]\n∂loss / ∂bias        =  Σ over i, j of  arriving[i, j]\n∂loss / ∂picture[r, c] =  Σ over the windows covering (r, c) of\n                          arriving[i, j] · the kernel entry that read it"
                  }
                </Equation>
                <KeepInMind>
                  A shared weight’s gradient sums contributions from all positions where it was used, as well as the batch observations. These terms may reinforce or cancel one another. The total also depends on the loss reduction and activation derivatives, so weight sharing alone does not guarantee larger gradients than a dense layer. Check the gradient scale when choosing a learning rate.</KeepInMind>
              </SubSection>

              <SubSection title="26. Accumulating gradients across overlapping windows" id="26-the-two-places-the-backward-pass-is-usually-got-wrong">
                <p>A kernel weight’s gradient must accumulate contributions rather than overwrite them at each position. Otherwise only the final visited window contributes. An input pixel can also belong to several windows. An implementation can iterate over outputs or over inputs, but it must enumerate every corresponding contribution, including overlap, padding and stride. Assuming that an input belongs to just one window loses terms.</p>
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
                <p>{"An input pixel's derivative combines contributions from every output window that used it. A fully interior pixel appears under all nine kernel positions, whose weights sum to 0 for this kernel. A corner pixel appears under only the kernel entry holding −1, so its derivative is −1 in this example. Thirty-two of the sixty-four input cells receive zero because the corresponding weight contributions cancel."}</p>
                <KeepInMind>
                  Both directions accumulate rather than assign, and for the same
                  reason. One weight was used many times going up, and one cell was
                  read by many windows going up, so both are sums coming back down.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. Checked against a central difference">
                <p>The hand calculation checks one fixture. The widget also compares the analytic gradients with central finite differences: move a parameter slightly up and down, measure the corresponding scalar loss and divide its change by the total displacement. It checks every kernel weight, bias and input value on three fixtures. The second table reports the largest disagreement in each block.</p>
                <p>The fixtures exercise different geometry. One uses stride one without padding. Another adds padding, checking that the returned input gradient excludes the padded border. A third uses two channels and stride two, checking their contributions together. In the recorded run, the largest disagreement was 7.8 × 10<sup>−9</sup> on the padded fixture’s inputs, with analytic gradient magnitudes as large as 13.9.</p>
                <WhyThisWorks title="Why the difference is taken from both sides">
                  <p>For a sufficiently smooth function, a one-sided finite difference generally has leading truncation error proportional to the step size. The symmetric difference cancels that term, leaving error proportional to the square of the step before rounding dominates. This makes it useful for comparing analytic gradients, while still leaving a numerical approximation rather than a proof.</p>
                  <p>Making the step extremely small also causes problems. The calculation subtracts nearly equal floating-point loss values, so rounding can dominate their difference. These checks use a step of one millionth. A suitable step depends on the parameter and loss scales and should be reconsidered when those scales change.</p>
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
                <p>Write the kernel bank as a table with one column per filter. Multiplying the window table by it produces all output values. The SDK expresses the same sum with NumPy einsum over a sliding-window view. That view shares the padded input’s memory, but forming a contiguous matrix representation or executing the optimized contraction can still require temporary storage. Zero padding itself also allocates a bordered array.</p>
                <Equation>
                  {
                    "answer[f, i, j]  =  bias[f] + Σ over c, u, v of  kernel[f, c, u, v] · picture[c, i·s + u, j·s + v]\n\n(windows × c·k·k)  ·  (c·k·k × filters)  =  (windows × filters)"
                  }
                </Equation>
                <p>The benchmark compares the explicit loops with the matrix-based implementation at three sizes, and includes a dense-layer calculation for context. At the largest size, the two convolution results agree to 1.8 × 10⁻¹⁵. Reordering floating-point additions can produce differences of that size.</p>
                <p>In the recorded runs, the loop implementation takes about 115 to 330 times as long as the matrix-based version at the largest size. On the small image used in the lesson, the ratio is only one to two. The setup work matters more when there are few products to calculate. Current timings depend on the runtime executing the benchmark.</p>
                <SweepCostTable />
                <p>The dense benchmark shows why parameter count and runtime must be measured separately. On the eight-by-eight example the convolution has ten parameters and the dense layer has 2,340, yet the recorded convolution takes about six to sixteen times as long. At this size, preparing and processing the windows can cost more than the small dense matrix multiplication.</p>
                <p>At side twenty-eight with eight filters, the dense layer has 4,245,280 parameters while the convolution evaluates 48,672 weighted products. In the recorded runs, convolution takes between about one tenth and two fifths of the dense layer’s time. The runtime difference is smaller than the arithmetic-count difference. Setup, array layout and the optimized numerical operations also affect elapsed time.</p>
                <InAModel>
                  <p>Fewer independent parameters reduce parameter storage and impose a shared local rule. When that rule fits the task, it can also reduce the data needed to learn useful features; fewer parameters alone do not guarantee better learning. Execution cost is separate. In these benchmarks the convolution is slower on the small image and faster on the larger image.</p>
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
          title: "Part 7. Keeping Window Geometry and Weight Sharing Consistent" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="29. The conventions needed to reproduce a convolution" id="29-what-a-complete-implementation-must-specify">
                <p>
                  Two convolution implementations can use the same general method and still produce different outputs because of choices such as padding or kernel orientation. The table below states the conventions used here. Check them when comparing this implementation with another library.
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
                        "not flipped: this SDK computes cross-correlation under the convolution name, following the convention used by common neural-network libraries.",
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
                        "normal draws scaled by the square root of two over the fan-in, where fan-in is channels times window area. Matching configuration and seed reproduce the initial parameter values.",
                    },
                    {
                      expression: "the activation",
                      reason:
                        "one configured activation function applied across the layer. Per-position activation choices are not part of this interface.",
                    },
                    {
                      expression: "the gradient block",
                      reason:
                        "kernel gradients returned as a two-dimensional block and reshaped to the configured kernel-bank dimensions when updating the layer.",
                    },
                    {
                      expression: "a training step",
                      reason:
                        "a new layer of the same geometry with updated parameters. The original layer and its parameters remain unchanged.",
                    },
                    {
                      expression: "a step with no gradient",
                      reason:
                        "refused: an update requires a parameter-gradient block. A zero-valued gradient block is valid and is different from no gradient block.",
                    },
                  ]}
                />
                <KeepInMind>
                  When two libraries disagree, compare kernel orientation, axis order, padding, stride, dilation, bias and activation settings. Each changes the operation or representation and may explain the difference.</KeepInMind>
              </SubSection>

              <SubSection title="30. Windows that do not fit and shapes that do not join" id="30-the-edges-probed">
                <p>The widget tries nineteen configurations and reports the actual results. Sixteen are rejected with messages about the invalid shape, setting or value. The remaining three are accepted; inspecting their outputs helps distinguish a valid configuration from one that is useful for the intended task.</p>
                <ConvolutionEdgeCases />
                <p>
                  Two of those refusals are there because the natural mistake would otherwise escape as a bare failure. Giving a whole number where three extents are wanted is exactly what a dense layer&rsquo;s width looks like, and without a guard it would come back saying that an integer is not iterable; here it says that a convolution reads channels, height and width, and got 8, which is not a sequence of extents.
                </p>
                <p>Python booleans can behave as integers in some operations. The SDK checks for this and rejects a boolean filter count, so True is not silently treated as a request for one filter.</p>
                <p>The three accepted configurations are valid special cases. A window covering the complete eight-by-eight image produces one output and has sixty-four weights plus one bias, the same weighted-sum structure as one dense neuron. That can be intentional. A stride of four with a three-by-three window produces a two-by-two map while omitting twenty-eight input pixels from every window.</p>
                <p>With padding four and a three-by-three window, the output is fourteen-by-fourteen. Ninety-six of its 196 window positions contain only padding zeros. Their weighted pixel contribution is zero, so their pre-activation score is the filter bias. With the Identity activation used here, the output is also that bias.</p>
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
                  Validation distinguishes unsupported or inconsistent settings from valid settings with potentially surprising behavior. Read the accepted rows as carefully as the rejected ones, and choose geometry according to which pixels the task needs.</KeepInMind>
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
                <p>The message distinguishes shape agreement from equal element counts. In the larger example, the convolution returns shape (8, 26, 26), while the dense layer expects (5408,). Both contain 5,408 values, but the explicit flattening operation is missing between them.</p>
                <p>
                  The repair is a flattening layer between them, which changes no
                  number and only restates the arrangement, and the middle chain is
                  that. It builds, holds three layers, reads (1, 8, 8) and answers a
                  row of three. Every join in a stack is settled this way at the
                  moment the stack is assembled, in integer comparisons, before any
                  picture has been read.
                </p>
                <KeepInMind>
                  Equal element counts do not make two array shapes interchangeable. This stack rejects the missing-flattening join before a forward pass. If we explicitly reshape data, we must still preserve the intended axis order; shape validation alone cannot detect every semantic rearrangement.</KeepInMind>
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
              "At stride two, this valid sweep produces nine outputs instead of thirty-six. A larger stride can also leave input pixels outside every window. In the displayed stride-four case, 28 of the 64 pixels are never read by a window. A smaller output map therefore needs to be considered alongside coverage, not just its value count.",
            ),
            choice(
              "Each of this convolution’s 36 output cells receives an arriving gradient of 1. What gradient does each of the nine shared kernel entries receive?",
              [
                              "16, the number of lit cells in the picture",
                              "36, one for each position it was used at",
                              "9, one for each entry of the kernel",
                              "4, the largest entry of the map",
                            ],
              0,
              "A kernel entry multiplied a one at sixteen of its thirty-six positions and a zero at the other twenty, and its slope is the sum over every position it was used at, which is the sharing seen from behind. It is the bias that comes back wanting 36, because it was added once at every position. Both directions accumulate rather than assign, and writing the kernel slope as an assignment leaves the layer training on the last window it visited.",
              {
                "description": "Use a 3 × 3 kernel, stride 1, no padding and a linear activation. Every output receives gradient 1. A kernel entry’s gradient adds input_value × arriving_gradient across all of its window positions.",
                "data": "picture =\n0 0 0 0 0 0 0 0\n0 0 0 0 0 0 0 0\n0 0 1 1 1 1 0 0\n0 0 1 1 1 1 0 0\n0 0 1 1 1 1 0 0\n0 0 1 1 1 1 0 0\n0 0 0 0 0 0 0 0\n0 0 0 0 0 0 0 0"
              },
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
              [
  "Use the supplied eight-by-eight single-channel image with its bright square in rows and columns 2 through 5. Apply the given three-by-three vertical-edge kernel, zero bias and identity activation.",
  "Print the six-by-six response map, output shape, parameter count, response at zero-based row 2/column 0 and number of nonzero responses."
],
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
              { hints: [
  "with_parameters supplies the fixed kernel and bias; respond_to performs the sweep.",
  "Count learned storage separately from the number of positions sharing those same weights."
], check: numberCheck("How many of the thirty-six answers are not zero?", 24, 0.5, "Twenty-four response cells are nonzero. Their signs distinguish opposite vertical boundaries, while balanced windows cancel under this kernel."), question: "Where does the vertical-edge filter respond to a bright square?" },
            ),
            exercise(
              "Move the picture and the answer moves",
              [
  "Compute the original filter map, then move the supplied image right by one, two and three columns, filling the newly exposed left columns with zero.",
  "At each shift print changed input-cell and map-cell counts, then the largest difference between shifted responses over their common valid region. Cropped-away positions are outside that comparison."
],
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
              { hints: [
  "Shift the image rather than its labels or kernel.",
  "Compare only response columns for which both shifted windows exist. Boundary cropping can change cells outside that shared region."
], check: numberCheck("How many of the map’s thirty-six cells change at a shift of three?", 30, 0.5, "Thirty map cells change at this shift. The translated valid overlap still agrees exactly, but cropping alters which windows remain in the image."), question: "Does moving the input move the convolution response over the comparable region?" },
            ),
            exercise(
              "Send a slope of one back down",
              [
  "Run the supplied square through its fixed convolution. Send an upstream derivative of one to every output-map position and obtain correction_for from that forward response.",
  "Print kernel gradients, bias gradient, input-gradient map, the specified corner/center gradients and number of zero input gradients. These are derivatives of the summed outputs, not a separate fitted loss."
],
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
              { hints: [
  "Use np.ones_like(response.outputs) so upstream shape matches the complete batch/channel map.",
  "The same kernel parameter participates at many positions, so its gradient collects contributions from all of them."
], check: numberCheck("What is the bias derivative when every output receives upstream derivative one?", 36, 0.5, "The bias derivative is 36. That single bias participates in every output position, so its derivative collects all supplied upstream contributions."), question: "How do shared kernel weights collect gradients from every window?" },
            ),
            exercise(
              "Count the library’s own example, and refuse the wrong join",
              [
  "Build the supplied eight-filter convolution for a one-channel twenty-eight-by-twenty-eight image. Compare its parameter count with a dense layer mapping the same pixel count to the same output-value count. Print both counts and their ratio.",
  "Attempt to join the convolution directly to the supplied ten-unit dense layer; print its error class/message. Add Flatten between them and print the resulting stack’s layer count and input/output shapes."
],
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
              { hints: [
  "The convolution returns channel/row/column axes; the dense layer expects one feature axis.",
  "Flatten changes the arrangement while preserving the number and order of values."
], check: numberCheck("How many parameters does the dense layer of equal width hold?", 4245280, 0.5, "The dense layer stores 4245280 parameters. It gives each output a separate connection to every pixel instead of sharing a small kernel across positions."), question: "Why can equal-sized outputs still need a flattening step?" },
            ),
          ],
        },
      ]}
    />
  );
}
