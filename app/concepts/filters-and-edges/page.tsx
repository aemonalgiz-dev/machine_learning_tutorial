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
import { BorderRuleGallery } from "@/components/widgets/BorderRuleGallery";
import { EdgeFieldPlayground } from "@/components/widgets/EdgeFieldPlayground";
import { GradientArrows } from "@/components/widgets/GradientArrows";
import { LightingProbe } from "@/components/widgets/LightingProbe";
import { OperatorGallery } from "@/components/widgets/OperatorGallery";
import { SweepByHand } from "@/components/widgets/SweepByHand";
import { SweepCost } from "@/components/widgets/SweepCost";
import { ThresholdSweep } from "@/components/widgets/ThresholdSweep";

export const metadata: Metadata = pageMetadata("/concepts/filters-and-edges", {
  title: "Filters and Edges · Perceptron Lab",
  description:
    "Changes in neighboring pixel values reveal boundaries and local patterns in an image. Filters calculate those changes over small regions, making image structure easier to measure.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FiltersAndEdgesPage() {
  return (
    <ConceptPage
      lessonId="filters-and-edges"
      intuition={lessonIntuitions["filters-and-edges"]}
      technicalStart="Part 2. Carrying a Grid of Weights Across a Picture"
      openingTitle="The Brightness Changed; the Edge Stayed Put"
      playgroundTitle="Which changes in brightness does a filter notice?"
      playgroundIntro="Compare the original picture with the filter response. Inspect one window's arithmetic, then change the filter and examine which changes in brightness it highlights."
      title="Filters and Edges"
      tagline={"Changes in neighboring pixel values reveal boundaries and local patterns in an image. Filters calculate those changes over small regions, making image structure easier to measure."}
      prerequisites={
        <>
          Nothing beyond arithmetic is needed to follow the sweep, since it is a
          few multiplications and an addition repeated at every pixel. Two
          things from the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>{" "}
          are used once the two answers are put together, the length of an arrow
          made from a pair of numbers and the angle it points at, and the{" "}
          <Link href="/primers/calculus" className={link}>
            calculus primer
          </Link>
          &rsquo;s rate of change is what the whole page is estimating, though
          it is estimated by subtraction throughout and never differentiated.
        </>
      }

      playground={<EdgeFieldPlayground />}
      sections={[
        {
          title: "Part 1. What Brightness Cannot Do",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. One number per pixel, and a scene to work on">
                <p>A grayscale picture stores a brightness value at every position in a grid. These are encoded image values; without a calibrated imaging process, we should not read them as direct physical measurements of arriving light.</p>
              <p>Our scene is drawn rather than photographed and is 48 pixels on each side. It contains a square, a disc, a diagonal bar and three small crosses on a darker background. There are 2,304 positions, with 375 belonging to a shape. Because we constructed the scene, we can check a proposed edge rule against the shapes that actually produced it.</p>
                <>
<p>
                  There is also a gradual change in illumination. The right side is brighter than the left by 0.30, spread evenly across forty-eight columns, or about 0.00638 per column. We call this a brightness ramp. It gives us a simple way to investigate uneven lighting, as though the lamp were off to one side.
                </p>
                <p>
                  Without it the page could not tell the difference between a method that reads the objects and a method that reads the lighting, and the playground above lets you take the ramp away and put it back.
                </p>
</>
                <KeepInMind>
                  A grayscale image records numerical values at pixel positions. Those values depend on the scene, illumination and imaging process. Photographing the same square under a different lamp can therefore change the grid even though the square has not moved.</KeepInMind>
              </SubSection>

              <SubSection title="2. Turn the lamp up and the answer changes">
                <p>
                  Here is the simplest thing anyone would try first. Every shape
                  in the scene is bright and the ground between them is dark, so
                  pick a number in between and call every pixel at or above it
                  part of a shape. The darkest pixel belonging to a shape reads
                  0.8119 and the brightest pixel of ground reads 0.42, so any
                  threshold at all between those two labels every one of the two
                  thousand three hundred and four pixels correctly. Take 0.6.
                  Nothing is wrong with the method and there is nothing to tune.
                </p>
                <p>
                  Now light the same scene differently. Turn the lamp up so that
                  every pixel is multiplied by 1.6, and add a second lamp
                  contributing a flat 0.15 everywhere. Nothing in the scene has
                  moved, nothing has changed shape, and no object has come or
                  gone. The average pixel has moved by 0.3765 and the largest
                  single move is 0.7789, which is larger than the whole gap
                  between the ground and the shapes was to begin with.
                </p>
                <p>The fixed threshold of 0.6 now retains 1252 pixels instead of the intended 375, adding 877 mistakes, or 38.06 percent of the image. The usable threshold interval moved from between 0.42 and 0.8119 to between 0.822 and 1.4491. Those intervals do not overlap, so no single threshold perfectly segments both versions of this constructed scene.</p>
                <KeepInMind>
                  The brightness of a pixel is a statement about the lighting at
                  least as much as about what is in the scene, and a description
                  built out of brightness inherits that. On this scene a
                  perfectly chosen threshold relabels 877 of 2304 pixels after a
                  change of lamp that moves no object at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What the change of lamp leaves alone">
                <>
<p>
                  Look at the same two pictures a different way. Instead of asking how bright each pixel is, ask how different it is from the pixel beside it. Turning the lamp up multiplied every pixel by 1.6, so it multiplied every difference by 1.6 as well; the second lamp added a flat 0.15 to every pixel, so it added nothing at all to any difference, since the same constant sits on both sides of every subtraction.
                </p>
                <p>
                  Whatever that pattern of differences was, the same lamp change scales the whole of it by one common number and leaves it otherwise exactly where it was.
                </p>
</>
                <p>
                  Measured on the scene, that is what happens. Every pixel where
                  there is any change at all has its measured sharpness
                  multiplied by a number between 1.5999999999999897 and
                  1.6000000000000139, which is 1.6 to as many places as float64
                  arithmetic can carry it. And the direction in which the
                  brightness rises does not move at all, and over all 2304 pixels the
                  largest turn is 1.07e-14 radians, and over the 450 pixels where
                  the change is sharp enough for the angle to mean anything it is
                  8.9e-16, which is a rounding step rather than a movement.
                </p>
                <LightingProbe />
                <p>Under this positive scale-and-offset change, and with a border rule that preserves a constant offset, the gradient responses scale by 1.6. Their directions and ratios of nonzero magnitudes are unchanged in exact arithmetic. A fixed magnitude threshold may still select different pixels. These properties do not cover every lighting change: spatially varying illumination, clipping and noise can change the directions too.</p>
                <KeepInMind>
                  For this brightness transformation, raw pixel values and gradient magnitudes change. Nonzero gradient directions and magnitude ratios remain unchanged in exact arithmetic. Brightness ordering is also preserved; the failure in section 2 is specifically the unchanged numerical threshold.</KeepInMind>
              </SubSection>

              <SubSection title="4. What that costs, and where it is the wrong trade">
                <p>
                  The threshold in step 2 made one comparison per pixel and classified all 2304 positions as foreground or background. Our difference calculation costs thirty-four multiplications and additions per pixel and highlights 450 boundary positions. Those responses do not yet tell us which side belongs to an object. Detecting a boundary and segmenting a region are different stages.
                </p>
                <p>If a controlled imaging setup consistently separates foreground and background brightness, a simple threshold can be sufficient and inexpensive. A scanner or microscope may help control illumination, but neither guarantees a clean brightness gap. Edge detection answers a different question: where values change, rather than which complete region belongs to an object.</p>
                <KeepInMind>
                  The threshold and gradient procedures answer different questions. Their arithmetic counts here also differ. Choose the measurement needed for the task, then check whether its assumptions hold under the expected illumination and noise.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Carrying a Grid of Weights Across a Picture",
          content: (
            <>
              <SubSection title="5. One position, one weighted sum">
                <p>A local filter applies a small grid of weights at each image position. Multiply each weight by the pixel beneath it, add the products, and record the result at that position. Moving the same grid across the image repeats a consistent local comparison. Different weights let that operation measure different properties.</p>
                <p>
                  Written out for a three wide, three tall grid whose weights are
                  called w and a picture called p, the answer at row r and column
                  c is the following.
                </p>
                <Equation>
                  {
                    "answer(r, c) = ∑ over i in −1, 0, 1 and j in −1, 0, 1 of w(i, j) × p(r + i, c + j)"
                  }
                </Equation>
                <p>
                  Nine multiplications and eight additions, and then the same
                  nine multiplications and eight additions at the next pixel. What
                  the sweep answers is decided entirely by what is written in the
                  weights, and the rest of this page is about choosing them.
                </p>
                <KeepInMind>
                  A sweep is one weighted sum repeated at every position. The
                  machinery does not change from question to question; only the
                  numbers in the small grid do.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Read every response in a six-by-six image" id="6-the-whole-sweep-worked-on-six-by-six">
                <p>
                  The forty eight by forty eight scene is too large to check by
                  hand, so there is a small picture beside it, six pixels on a
                  side, whose every row is the same six numbers.
                </p>
                <Equation>{"0  0  0  1  1  1"}</Equation>
                <p>

                  It is dark on the left and bright on the right, so the one
                  change of brightness in it sits between columns two and three,
                  and every answer below can be checked on paper. Sweep it with
                  the simplest weights on the page, half of the right neighbor
                  minus half of the left one, written as a one by three grid.
                </p>
                <Equation>{"−0.5   0   0.5"}</Equation>
                <WorkedExample>
                  <>
                    <p>
                      At column 2, the three-pixel window reads 0, 0 and 1. At column 3
                      it reads 0, 1 and 1. At column 4 it reads three ones. Apply the
                      same three weights in each position.
                    </p>
                    <Equation>{"column 2: (−0.5) × 0 + 0 × 0 + 0.5 × 1 = 0.5\ncolumn 3: (−0.5) × 0 + 0 × 1 + 0.5 × 1 = 0.5\ncolumn 4: (−0.5) × 1 + 0 × 1 + 0.5 × 1 = 0"}</Equation>
                    <p>
                      The first two windows straddle a change in brightness. The third
                      contains constant brightness, so its contributions cancel.
                    </p>
                  </>
                  <p>
                    Every row of the answer is the same, since every row of the
                    picture is.
                  </p>
                  <Equation>{"0   0   0.5   0.5   0   0"}</Equation>
                </WorkedExample>
                <SweepByHand />
                <p>This symmetric central-difference filter reports the step at two adjacent columns with equal strength. Its two windows span the same transition. That response pattern belongs to these weights; another difference rule can locate its response differently. Estimating a boundary between pixels requires additional assumptions about the sampled image.</p>
                <KeepInMind>
                  A step between two adjacent columns is reported at both of
                  them. A sweep of three wide weights locates a change to within
                  about a pixel, and the smearing is the arithmetic rather than a
                  fault in it.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Why every side of the grid is odd">
                <p>
                  The answer at a position is written down at the pixel the
                  middle of the grid was sitting on. A grid with an odd number of
                  columns has a middle column, and a grid with an even number
                  does not, so the answer from a two wide grid belongs half a
                  pixel to the side of anywhere it could be written. That
                  half-pixel offset then travels through everything downstream:
                  every later stage that compares this answer against the picture,
                  or against another sweep&rsquo;s answer, is quietly comparing
                  things measured half a pixel apart.
                </p>
                <p>
                  This is not a rule about what is possible. Roberts&rsquo; own
                  operator is two by two, and it works; its answers belong to the
                  corners between pixels rather than to the pixels, and he knew
                  that. Everything on this page is odd on both sides, so
                  every answer sits at a pixel, and a grid with an even side is
                  refused rather than quietly shifting the whole answer.
                </p>
                <KeepInMind>
                  Odd filter dimensions provide a central pixel for the chosen output alignment. Even dimensions need a declared anchor or coordinate offset. Later operations can account for that offset if it is preserved; the problem is an unstated alignment, rather than an irrecoverable bias.</KeepInMind>
              </SubSection>

              <SubSection title="8. In the order written, or reversed">
                <>
<p>There are two related operations to distinguish. Correlation uses the weights in their written arrangement. Convolution reverses the kernel along both axes before combining it with the pixels. Symmetric weights give the same result either way; directional difference weights can change sign. The convention matters when interpreting the gradient direction.</p>
                <p>
                  For the weights on this page they do not agree, because these weights are negative on one side and positive on the other, and reversing them swaps which.
                </p>
</>
                <p>
                  On the six by six picture, sweeping in the order written
                  answers 0.5 at columns two and three, and sweeping the reversed
                  weights answers &minus;0.5 at exactly the same two columns.
                  Nothing else about the sweep has changed. Every number has the
                  same size and the opposite sign, which means that the two
                  conventions disagree about which way the brightness is rising
                  everywhere at once. The reversing switch on the widget above
                  does this.
                </p>
                <WhyThisWorks title="Why reversing the filter makes successive convolutions associative">
                  <p>Convolution is associative under its usual full-domain assumptions. Correlation, treated as a binary operation on two signals, is not generally associative in the same way. Sequential fixed correlation filters can still be combined by convolving their kernels. On finite images, border extension and cropping also affect whether a combined filter matches two separate passes.</p>
                  <p>
                    Everything on this page is correlation, so the weights are
                    positive on the right and every horizontal answer is positive
                    where the brightness rises to the right. Under the other
                    convention the identical grid would report brightness rising
                    to the left. Whichever is chosen, it has to be written down,
                    because every angle further on inherits it.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Correlation uses the written weight arrangement; convolution reverses it. They agree for symmetric kernels. Reversing an antisymmetric derivative kernel changes its sign, but an arbitrary nonsymmetric kernel need not differ by a sign alone. State the convention when interpreting directions.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "A threshold of 0.6 labels every one of the 2304 pixels correctly. The lamp is then turned up so every pixel is multiplied by 1.6, and a second lamp adds a flat 0.15. What happens to that threshold?",
              [
                "It still works, since no object moved and none changed shape",
                "It keeps too few pixels now, so it needs lowering a little",
                "It relabels 877 pixels, and the window of thresholds that works has moved somewhere that does not overlap the old window",
                "It fails because the second lamp changed the contrast between the shapes and the ground",
              ],
              2,
              "The original threshold keeps the 375 shape pixels. After relighting it keeps 1,252 pixels, changing 877 decisions. The clean separation interval moves from between 0.42 and 0.8119 to between 0.822 and 1.4491. Those intervals do not overlap, so one fixed intensity cutoff cannot correctly label both versions of this scene.",
            ),
            several(
              "The same lamp change is applied and the differences between neighboring pixels are read instead. Which of these were measured on the scene?",
              [
                "Every measured sharpness is multiplied by a number between 1.5999999999999897 and 1.6000000000000139",
                "The direction in which the brightness rises does not move, the largest turn over all 2304 pixels being 1.07e-14 radians",
                "A threshold on sharpness now carries across the change of lamp",
                "The flat 0.15 adds nothing to any difference, since the same constant sits on both sides of every subtraction",
              ],
              [0, 1, 3],
              "A shared additive offset cancels in these differences under the stated boundary rules. A positive multiplier scales gradient magnitudes by the same amount and preserves directions. Magnitude ratios can therefore remain unchanged, but an absolute magnitude threshold must be adjusted for the multiplier. The reported tiny direction differences reflect floating-point rounding.",
            ),
            trueFalse(
              "For foreground-versus-background segmentation in a scanner with stable, controlled illumination, an intensity threshold can be more appropriate than detecting only brightness boundaries.",
              true,
              "An intensity threshold can label foreground interiors directly when the lighting and contrast make the intensity ranges separable. A gradient operator instead reports where brightness changes, leaving a different task of identifying or filling regions. Thresholding also needs fewer operations in the direct implementation compared here. Uneven illumination or faint print may require more processing even in a scanner.",
            ),
            choice(
              "The six by six picture has one boundary, between columns two and three, and two columns report it at equal strength. Why?",
              [
                "Because the weights have not been normalized",
                "Because the change happens between two pixels, and any three wide window centered on either of them straddles it equally",
                "Because the border rule invented values outside the frame",
                "Because correlation and convolution disagree about the sign",
              ],
              1,
              "For the central-difference weights used here, the windows centered on either side of the jump each include one dark and one bright endpoint. They therefore produce equal responses in adjacent output columns. This is a consequence of this filter and sampling alignment; asymmetric filters or further edge-localization methods can produce different responses.",
            ),
            trueFalse(
              "Correlation and convolution give the same answer for the weights used on this page.",
              false,
              "They agree exactly whenever the grid reads the same forwards as backwards, and these weights are negative on one side and positive on the other, so reversing them swaps which. On the six by six picture one convention answers 0.5 at columns two and three and the other answers −0.5 at the same two columns, which is a disagreement about which way the brightness is rising everywhere at once.",
            ),
        ],
        },
        {
          title: "Part 3. What Happens at the Border",
          content: (
            <>
              <SubSection title="9. The weights hang off the picture">
                <p>
                  Put the middle of a three wide grid on column zero and its left
                  column falls on column minus one, which does not exist. The
                  same happens at the last column, and for a three by three grid
                  at the top row and the bottom row as well, so every pixel
                  around the outside of the picture is affected. On the six by
                  six picture that is twenty of the thirty six positions, and on
                  the forty eight by forty eight scene it is 188 of the 2304.
                </p>
                <p>The file contains no measurements beyond its frame. A border rule therefore adds an assumption, such as repeating an edge value, reflecting nearby pixels or using a fixed constant. Compare those assumptions with the image and the operation rather than treating a default as newly observed information.</p>
                <KeepInMind>
                  A sweep needs values it does not have at every border pixel.
                  Every way of supplying them invents something, so the choice
                  cannot be avoided by choosing carefully.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Four rules, and what each one invents">
                <p>
                  Four answers are in common use, and the small picture is a good
                  place to see them apart, because it has exactly one boundary and
                  everything else it reports is invention. Its left side is dark
                  and its right side is bright, which is what makes the four
                  disagree.
                </p>
                <DerivationTable
                  expressionHeading="what is read outside"
                  reasonHeading="what that assumes, and what it costs here"
                  rows={[
                    {
                      expression: "repeat the edge pixel",
                      reason:
                        "reuses the nearest edge value outside the image. It preserves a locally constant border and gives zero at both ends of this example. That is a chosen continuation, not observed evidence beyond the frame.",
                    },
                    {
                      expression: "treat the outside as black",
                      reason:
                        "assumes the world outside the frame is dark. That happens to be true on the left of this picture, where it answers 0 like the rule above, and false on the right, where the bright side meets invented darkness and the operator answers 4, exactly as sharp as the one real boundary.",
                    },
                    {
                      expression: "read from the opposite side",
                      reason:
                        "wraps to the opposite edge, as if the image repeated periodically. Here Sobel reports magnitude 4 at both borders, in addition to the internal boundary. This convention suits periodic data; its suitability is not determined simply by whether the image was photographed.",
                    },
                    {
                      expression: "answer nothing there",
                      reason:
                        "computes only complete windows and does not supply outside samples. A three-by-three filter gives a four-by-four output from this six-by-six image. Preserve its coordinate offset when aligning it with the original.",
                    },
                  ]}
                />
                <BorderRuleGallery />
                <p>
                  The pair worth looking at twice is the first two, because on
                  this picture they agree at the left border and both answer 0
                  there. That agreement is a property of the picture rather than
                  of the rules, since this picture happens to be dark on its left,
                  and the right border is where they part company. A scene tested
                  only on the left of this picture would leave someone believing
                  those two rules were the same rule.
                </p>
                <KeepInMind>
                  Repeating an edge value and supplying zero make different assumptions about the unobserved region. Their suitability depends on the image and operation. Agreement at one dark border does not show that the rules are interchangeable.</KeepInMind>
              </SubSection>

              <SubSection title="11. Answering nothing, and answering a smaller picture">
                <p>
                  The fourth rule deserves its own paragraph, because it is the
                  only one that changes the shape of the answer, and shape is
                  what everything downstream is built on. A three by three grid
                  that refuses to hang off the picture answers two fewer rows and
                  two fewer columns, so the forty eight by forty eight scene comes
                  back as forty six by forty six and the six by six picture as
                  four by four.
                </p>
                <p>
                  That is not a small inconvenience. Two sweeps of different grids
                  now answer different sizes and cannot be laid on top of each
                  other; the answer&rsquo;s row three is the picture&rsquo;s row
                  four, so any position quoted from one has to be translated
                  before it means anything in the other; and stacking several
                  sweeps shrinks the picture each time, which is the reason the
                  first three rules exist at all.
                </p>
                <KeepInMind>
                  Answering only where the weights fit is the one option that
                  invents nothing, and the price is an answer of a different size
                  from the question, which every later stage has to know about.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Choosing the Weights",
          content: (
            <>
              <SubSection title="12. The cheapest estimate of a rate of change">
                <p>A simple estimate subtracts the left neighbor from the right neighbor and divides by their two-pixel separation. This central difference uses the one-by-three grid already examined.</p>
                <Equation>
                  {"rate across at column c ≈ ( p(c + 1) − p(c − 1) ) / 2"}
                </Equation>
                <p>The estimate is exact on a straight brightness ramp in exact arithmetic. It is also sensitive to isolated pixel noise: an error in either sampled neighbor changes the response even if no object boundary is nearby. Averaging nearby differences can reduce some noise, at a cost in spatial detail.</p>
                <KeepInMind>

                  A finite difference estimates a derivative from samples; it is not the definition of the continuous derivative. Its two sampled neighbors provide limited protection against noise. Whether more smoothing helps depends on the noise and the detail we need to preserve.</KeepInMind>
              </SubSection>

              <SubSection title="13. Difference across, average along">
                <p>Noise can make a single neighboring difference unreliable. The named operators combine differences across nearby rows, giving a boundary supported over several positions more influence than an isolated fluctuation. A simple average gives each of three rows equal weight; other operators choose different weights to improve their directional estimates.</p>
                <p>
                  Written as a grid, that averaging is what turns the one by three
                  grid into a three by three one. The difference is still taken
                  across, left column negative and right column positive; what is
                  new is the weighting down the middle, and that weighting is the
                  entire difference between the three named operators.
                </p>
                <NumberTable
                  headings={["Weights", "Down the rows", "Across the columns"]}
                  rows={[
                    ["Central difference", "1", "−0.5, 0, 0.5"],
                    ["Prewitt", "1, 1, 1", "−1, 0, 1"],
                    ["Sobel", "1, 2, 1", "−1, 0, 1"],
                    ["Scharr", "3, 10, 3", "−1, 0, 1"],
                  ]}
                  caption="Each grid entry is the row weight multiplied by the column weight."
                />
                <Equation>{"Sobel middle-left entry = 2 × (−1) = −2"}</Equation>
                <p>The downward-response kernel is the transpose of the horizontal-response kernel: exchange its rows and columns. This applies the corresponding local difference to the other image axis while keeping the coordinate convention consistent.</p>
                <KeepInMind>
                  Every named operator here differences across the boundary and
                  averages along it. They are the same idea with different
                  averages, and none of them is doing anything the central
                  difference was not doing except spreading the estimate over more
                  rows.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What each set of weights answers on a clean step">
                <p>
                  Put each of the four over a clean step, a picture whose left
                  columns are all zero and whose right columns are all one, and
                  the answer at the boundary is easy to predict without computing
                  anything. Every positive weight sits over a one and contributes
                  itself; every negative weight sits over a zero and contributes
                  nothing. So the answer is the sum of the positive weights, and
                  it is different for every operator.
                </p>
                <NumberTable
                  headings={[
                    "Weights",
                    "Positive weights",
                    "They add to",
                    "Answer on the step",
                  ]}
                  rows={[
                    ["Central difference", "0.5", "0.5", "0.5"],
                    ["Prewitt", "1, 1, 1", "3", "3"],
                    ["Sobel", "1, 2, 1", "4", "4"],
                    ["Scharr", "3, 10, 3", "16", "16"],
                  ]}
                  caption="Measured on a step from zero to one, and equal in every case to the total of that operator’s own positive weights."
                />
                <p>The raw weights give step responses of 0.5, 3, 4 and 16. Their numerical scales therefore differ; Scharr’s displayed step response is thirty-two times the central difference’s. A threshold needs adjustment or validation when changing operators. A scale factor matching this clean step does not guarantee identical responses to every image pattern.</p>
                <p>

                  These filters all have weights that sum to zero. On a flat patch, each weight multiplies the same brightness, so the positive and negative contributions cancel. Adding a constant brightness to every sampled pixel also cancels in this way. That explains why the second lamp in Part 1 leaves the responses unchanged; at image boundaries, the result also depends on how missing neighboring pixels are supplied.
                </p>
                <KeepInMind>
                  The size of the answer is a property of the grid as much as of
                  the picture, and none of these grids is scaled to any common
                  unit. What they share is that their weights sum to zero, which
                  is what makes a flat region answer nothing at any brightness.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. They agree about the direction and not about the size">
                <p>
                  Given that the four answer 0.5, 3, 4 and 16 at the same
                  boundary, it would be reasonable to expect them to disagree
                  about a good deal else. They do not. On the clean step every one
                  of the four reports the brightness rising at exactly zero
                  radians, which is due right, and every one reports the boundary
                  itself as running at exactly a quarter circle to that. Not close
                  to; exactly, because the vertical sweep answers exactly zero on
                  a picture whose rows are identical, whichever grid does it.
                </p>
                <p>
                  On something harder they still nearly agree. The diagonal bar in
                  the scene runs up and to the right, so its edges run at minus
                  forty five degrees and the brightness across one of them rises
                  at minus a hundred and thirty five. The four report &minus;134.44,
                  &minus;134.16, &minus;134.25 and &minus;134.31 degrees, which is
                  a spread of 0.2839 degrees between the furthest apart of them,
                  while their sizes there are 0.4622, 1.8399, 2.7643 and 11.9904,
                  a factor of 25.94 between the largest and the smallest.
                </p>
                <KeepInMind>
                  On these displayed boundaries, the operators have similar directions despite substantially different magnitudes. The next experiment varies edge angle and sampling to test where their directional estimates differ. Agreement on a few selected edges is not enough to rank them generally.</KeepInMind>
              </SubSection>

              <SubSection title="16. Where the weights actually differ">
                <>
<p>To compare directional accuracy, we need edges at several angles and sampling conditions. The next test varies both, using a hard pixel step and a transition spread across a few pixels.</p>
                <p>
                  So the test is a straight edge drawn at every angle from zero to eighty five degrees, and drawn twice, once as a hard one-pixel step and once spread across a couple of pixels, which is what a lens and a sensor do to the boundary of a real object.
                </p>
</>
                <OperatorGallery />
                <>
<p>
                  On the spread edge the ordering is exactly the published one and the gaps are large. The worst angle any of them reports across the eighteen drawn angles is out by 4.13 degrees for the central difference, 3.10 for Prewitt, 1.16 for Sobel and 0.28 for Scharr, so Scharr&rsquo;s weights are four times steadier than Sobel&rsquo;s and nearly fifteen times steadier than the bare difference.
                </p>
                <p>
                  Every one of them is exact at zero and at forty five degrees, where the arrangement of pixels around the edge is symmetric, and worst somewhere between fifteen and twenty five degrees, and again at the mirror of that past forty five, since the curve is symmetric about the diagonal.
                </p>
</>
                <>
<p>The sharp one-pixel step gives a different result. Every operator has mean angular error above nine degrees. Prewitt and Sobel both give 9.2367 degrees, while Scharr gives 10.8913; the corresponding worst cases are 21.57 and 27.01 for Sobel and Scharr. The ranking therefore depends on this input. The assumptions behind the smoother comparison do not describe a discontinuous pixel step.</p>
                <p>A hard one-pixel step is poorly sampled for interpreting the filter as a derivative of a smooth brightness field. Differences between operator designs need not follow the same ordering as on the spread edge. That is why the workbench’s sharply drawn diagonal bar gave a different comparison.</p>
</>
                <InAModel>
                  <>
<p>Angular error can affect descriptors that sort responses into orientation bins. A response near a bin boundary can move to a neighboring bin even after a small angle change. Histogram-of-oriented-gradients descriptors also weight responses by magnitude and normalize groups of bins, so they do not simply discard every magnitude.</p>
                  <p>The extra weighting can improve the directional estimate under some sampling conditions. Compare that benefit with its cost and the images expected by the application. A controlled synthetic test can be useful when it represents those conditions.</p>
</>
                </InAModel>
                <KeepInMind>
                  For the spread-edge test, Scharr has the smallest reported worst angular error, followed by Sobel, Prewitt and central difference. The hard-step test gives larger errors and a different ranking. These results concern the defined sampling conditions; being a drawing or photograph alone does not determine which comparison applies.</KeepInMind>
              </SubSection>

              <SubSection title="17. What a sweep costs">
                <p>A direct dense calculation of a three-by-three weighted sum uses nine multiplications and eight additions. Two such sums give thirty-four operations per pixel, or 78,336 for this 48-by-48 scene. Magnitude and angle require additional operations. This is an arithmetic model; an implementation can exploit zero weights, separability or optimized routines.</p>
                <SweepCost />
                <>
<p>The widget times the implementation on the machine serving the request. Values can vary between runs. Setup overhead can make small images cost more per pixel, while memory layout, caches and vectorized operations also affect scaling. Use the timing curve alongside the direct arithmetic count.</p>
                <p>
                  It also scales as the number of pixels and not worse, so a picture with four times as many pixels costs about four times as much, which is what made these operators usable on the hardware they were invented on.
                </p>
</>
                <KeepInMind>
                  A sweep costs a fixed amount of arithmetic per pixel, which for
                  a three by three grid in both directions is thirty four
                  operations, and the total grows in step with the number of
                  pixels rather than faster.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Which border rule changes the shape of the answer?",
              [
                "Repeating the edge pixel outward",
                "Treating everything outside the frame as black",
                "Answering only at positions where the whole grid fits",
                "None of them, since a sweep always answers one value per pixel",
              ],
              2,
              "A three by three grid that refuses to hang off the picture answers two fewer rows and two fewer columns, so the forty eight by forty eight scene comes back as forty six by forty six. It is the one option that invents nothing, and the price is that two sweeps of different grids can no longer be laid on top of each other and that stacking sweeps shrinks the picture each time.",
            ),
            trueFalse(
              "Repeating the edge pixel and treating the outside as black are the same rule, since both answer 0 at the left border of the six by six picture.",
              false,
              "They agree there because that picture happens to be dark on its left, which is a property of the picture rather than of the rules, and the right border is where they part company. Repeating the edge asserts only that the scene continued as it was, where treating the outside as black asserts that the world beyond the frame is dark, which is right at a dark border and wrong at a bright one.",
            ),
            choice(
              "On a clean step the four operators answer 0.5, 3, 4 and 16 at the same boundary. What do all four share?",
              [
                "Their weights sum to zero, so a flat region answers nothing whatever its brightness",
                "They are scaled to a common unit, so a threshold transfers between them",
                "They report the same size once the picture itself is rescaled",
                "They average over the same number of rows",
              ],
              0,
              "On a constant neighborhood, positive and negative weights cancel because their sum is zero. Adding a common brightness offset therefore leaves these derivative responses unchanged where padding preserves that constant. Zero padding is an exception at the image boundary because its outside value does not receive the same offset. The operators use different normalization scales, so a magnitude threshold should not be transferred unchanged between them.",
            ),
            several(
              "A straight edge was drawn at every angle from zero to eighty five degrees, twice. What did that test find?",
              [
                "On an edge spread across a couple of pixels the worst reported angle is out by 4.13 degrees for the central difference and 0.28 for Scharr",
                "On a hard one-pixel step the ordering reverses, and Scharr is the worst of the three at 10.8913",
                "Every operator is exact at zero and at forty five degrees, where the arrangement of pixels around the edge is symmetric",
                "The workbench scene’s diagonal bar is what demonstrates Scharr’s extra accuracy",
              ],
              [0, 1, 2],
              "A one-pixel step has no well-defined rate of change to estimate, so weights tuned to estimate one accurately have nothing to be accurate about. Every boundary in the workbench scene is drawn by arithmetic and is one pixel wide, which is exactly why the diagonal bar showed so little between the four, their angles falling within 0.2839 degrees of each other.",
            ),
            trueFalse(
              "A gradient from a three by three grid costs thirty four operations per pixel, and the total grows in step with the number of pixels rather than faster.",
              true,
              "A direct dense three-by-three filter uses nine multiplications and eight additions per pixel. Computing both gradient components gives:\n\n```math\n2 × (9 + 8) = 34 operations per output pixel\n34 × 48 × 48 = 78,336 operations\n```\n\nMagnitude and direction add their own work. This count is for the straightforward implementation; separable filters, zero weights or vectorized libraries can change the constant cost. With fixed filter size, work grows linearly with the pixel count.",
            ),
        ],
        },
        {
          title: "Part 5. Two Answers Kept Together",
          content: (
            <>
              <SubSection title="18. A rate across and a rate down">
                <>
<p>A horizontal difference responds to a vertical dark-to-bright boundary. It gives zero for an ideal horizontal boundary whose brightness is constant across each row. The corresponding vertical difference detects that missing direction. On the six-by-six example, Sobel’s horizontal response is four at the two boundary columns and its vertical response is zero.</p>
                <p>
                  So the same picture is swept twice, with the same grid turned on its side for the second, and the two answers are kept together.
                </p>
</>
                <p>The horizontal and vertical responses together form a vector at each pixel: the estimated brightness gradient. Keeping the pair together preserves which two measurements describe the same position and convention. Its length and direction then summarize the local change.</p>
                <KeepInMind>
                  Each response measures a directional change and is useful on its own. Keeping the horizontal and vertical components together lets us estimate the full local gradient rather than only one of its components.</KeepInMind>
              </SubSection>

              <SubSection title="19. How long the arrow is">
                <p>The gradient’s length combines the horizontal and vertical changes into one measure of strength. A large horizontal response or a large vertical response can make that length large. The calculation uses the same length rule as any two-dimensional vector.</p>
                <Equation>
                  {"sharpness = √( across² + down² )"}
                </Equation>
                <p>The magnitude is zero when both estimated responses are zero. That can occur in a flat region, but a particular filter can also miss some nonflat patterns. In this scene, the largest magnitude is 2.9974 on the disc rim. The square’s upright and flat sides give 2.6911 and 2.6405. Pixel sampling, local shape and the chosen weights affect these differences; a diagonal boundary is not inherently sharper merely because both components contribute.</p>
                <>
                  <p>The apparently flat regions still contain the brightness ramp. The filter samples one column to either side of its center, giving a two-column separation, and its positive weights sum to four. This gives the small response calculated below.</p>
                  <Equation>{"ramp response ≈ 2 × 0.00638 × 4 ≈ 0.0511"}</Equation>
                  <p>
                    Remove the ramp in the playground and those same 1666 interior
                    pixels return zero. The filter was responding to a small brightness
                    change, even where the larger shapes looked flat.
                  </p>
                </>
                <KeepInMind>
                  The sharpness is a length, so it is never negative and never
                  says which way anything is going. A perfectly gentle slope
                  across the whole picture still answers something everywhere,
                  which is correct, since the brightness there really is changing.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Which way it points">
                <p>
                  The angle of the arrow says which way the brightness is rising,
                  and it comes from the two rates the way any angle does.
                </p>
                <Equation>
                  {"direction = arctan2( down, across )"}
                </Equation>
                <p>
                  Measured from pointing right and turning towards pointing down,
                  it lies between minus half a turn and half a turn. Zero means
                  the brightness rises to the right, a quarter circle means it
                  rises downward, and a whole half turn either way means it rises
                  to the left.
                </p>
                <p>A flat image region has zero horizontal and vertical response. That zero-length vector has no direction. The routine returns an angle of zero by convention, so we must not count it as a measured horizontal edge. The drawings suppress directions below a response threshold, and later orientation histograms weight directions by response strength.</p>
                <KeepInMind>
                  The angle is only meaningful where the sharpness is not near
                  zero. A flat region has no direction, so whatever number is
                  reported there was chosen by whoever implemented it and says
                  nothing about the picture.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The gradient crosses the edge, it does not run along it">
                <p>
                  Check the arrow against the image. It points in the direction where brightness{" "}
                  <em>increases</em>. Standing on a boundary, the way the
                  brightness increases is across it, from the dark side to the
                  bright side. The boundary itself runs at right angles to that.
                </p>
                <p>
                  Take a boundary running straight up and down with the bright
                  side on the right. The brightness does not change at all as you
                  walk up or down it, and changes as fast as it ever does as you
                  step sideways across it, so the arrow points due right, at zero
                  radians, while the boundary runs vertically, at a quarter
                  circle. Those two numbers are the same fact reported two ways
                  and are a quarter turn apart, always.
                </p>
                <GradientArrows />
                <p>
                  The widget draws both, and the square is the clearest place to
                  see it. Switched to the way the brightness rises, the strokes on
                  the square&rsquo;s left and right sides lie horizontally, cutting
                  across sides that are vertical. Switched to the way the edge
                  runs, the same strokes lie along those sides. On the disc, whose
                  boundary points in every direction in turn, the first setting
                  gives a starburst pointing inward from the rim, since the disc
                  is the bright thing, and the second gives a set of strokes
                  lying around the rim like a wheel.
                </p>
                <KeepInMind>
                  For an ideal local brightness boundary, the gradient points from darker to brighter values and is perpendicular to the constant-brightness contour. Its estimated direction can differ from an object’s geometric edge because of illumination, texture, noise and sampling.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Flat Regions, Narrow Images and Boundary Choices", id: "part-6-where-an-edge-operator-stops-being-defined",
          content: (
            <>
              <SubSection title="22. A derivative of something sampled at whole pixels">
                <p>
                  The image gives us samples at pixel positions. To interpret an edge response as a rate of change, we assume an underlying brightness field and approximate its derivative from those samples. We cannot recover every variation between pixels from the grid alone. The sampling resolution and the chosen filter therefore limit what this estimate can tell us.
                </p>
                <>
<p>A smooth field sampled finely enough supports an accurate local derivative estimate. An abrupt pixel transition can still be detected as an image change, but interpreting its response as the derivative of a uniquely known continuous scene requires more assumptions. Noise and the spatial scale of variation affect that interpretation.</p>
                <p>
                  Step 16 measured what that does. On an edge spread over a couple of pixels the four operators report angles out by between 0.28 and 4.13 degrees, and on a one-pixel step the same four are out by between 21.57 and 40.00.
                </p>
</>
                <DerivationTable
                  expressionHeading="Image or boundary condition"
                  reasonHeading="Effect on the filter response"
                  rows={[
                    {
                      expression: "a picture one pixel wide",
                      reason:
                        "a three-wide valid window cannot fit, so no full-window output is available. Padding can provide horizontal neighbors under a declared convention. Existing vertical measurements still contain information; the entire output is not invented.",
                    },
                    {
                      expression: "a boundary one pixel wide",
                      reason:
                        "the quantity being differentiated is not smooth at the scale it is sampled at, so there is no rate of change for the estimate to approximate. Every operator still answers a number, and the numbers are measurably wrong about the angle by tens of degrees rather than by fractions of one.",
                    },
                    {
                      expression: "a flat region",
                      reason:
                        "both rates are zero, so the arrow has zero length and no angle. The length is genuinely zero and is a fact; the angle does not exist and whatever is reported is a convention. Counting directions without weighting them by sharpness counts these.",
                    },
                    {
                      expression: "a grid with an even side",
                      reason:
                        "requires an explicit anchor or coordinate-offset convention because it has no unique middle pixel. Later operations can preserve or compensate for that alignment.",
                    },
                    {
                      expression: "any pixel on the border",
                      reason:
                        "the window needs values the picture does not hold, and nothing in a photograph records what lay outside the frame. Every rule invents them, so the answer at a border pixel is partly a statement about the assumption rather than about the scene.",
                    },
                    {
                      expression: "asking which side the object is on",
                      reason:
                        "the sign of the answer says which side is brighter, and brightness is not ownership. A dark object on a light ground and a light object on a dark ground give arrows pointing opposite ways across the same boundary, and nothing in the operator distinguishes them.",
                    },
                    {
                      expression: "comparing sharpness between two operators",
                      reason:
                        "the displayed raw filters report 0.5, 3, 4 or 16 on the same clean step. Normalize or calibrate responses before comparing magnitudes; a clean-step scale conversion need not make the filters equivalent on other patterns.",
                    },
                    {
                      expression: "comparing sharpness between two lamps",
                      reason:
                        "a lamp that multiplies the picture multiplies every sharpness by the same factor, measured here as 1.6 to fourteen places. Ratios of sharpness survive that and absolute values do not, which is why a fixed threshold is the wrong thing to carry between photographs and the direction is the right one.",
                    },
                  ]}
                />
                <KeepInMind>
                  These operators produce well-defined image responses under their boundary conventions. Interpreting those responses as derivatives of a continuous scene requires assumptions about sampling and smoothness. The edge-angle experiments show why those assumptions matter.</KeepInMind>
              </SubSection>

              <SubSection title="23. One threshold cannot do both jobs">
                <p>

                  We could keep every pixel whose gradient magnitude exceeds a cutoff. In this noise-free drawn scene, the largest background response is 0.0511 and the smallest true-boundary response is 0.898. A threshold between them separates all 2304 labeled positions correctly. The clean gap is why this example is easy; noise and weaker boundaries can remove it.
                </p>
                <p>Now add Gaussian noise with standard deviation 0.08 to each image value, about twelve percent of the shape-background contrast. The noisy background responses reach 1.0157, above the clean boundary minimum of 0.898. Noise also changes the boundary responses. The sweep below measures the resulting overlap directly, counting missed boundaries and retained background pixels at each cutoff.</p>
                <ThresholdSweep />
                <p>
                  The sweep says what that costs at each end. At 0.4 nothing real
                  is lost and 693 of the 1854 flat pixels survive as false edges.
                  At 1.1 no flat pixel survives at all and 63 pixels on a real
                  boundary have gone. In between, both happen at once, and the best
                  threshold in the whole sweep is 0.9, and it keeps 5 flat pixels
                  and loses 35 real ones, of which 33 come from the 98 obliquely
                  crossed pixels on the disc&rsquo;s rim and along the diagonal
                  bar, where the change is genuinely gentler because a three wide
                  window straddles it rather than meeting it square.
                </p>
                <>
<p>The noisy responses overlap, so one magnitude cutoff cannot keep every boundary and reject every background response. Hysteresis uses two thresholds and keeps a weaker response when it connects to a stronger one. Smoothing before differentiation can reduce some noise but can also blur detail. Both add information or assumptions beyond a single magnitude cutoff.</p>
                <p>
                  Both are still choices with a cost; neither turns the overlap into a separation.
                </p>
</>
                <KeepInMind>
                  A single threshold on sharpness has one number to separate two
                  populations that overlap. Above the overlap it drops the faint
                  half of real boundaries and below it keeps noise, and there is
                  no value between, because there is nothing between.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Where the brightness changes is not where the object ends">
                <p>A strong image gradient identifies a brightness change. An object boundary is a statement about the scene that caused the image. Shadows can create gradients within one object, while similarly colored objects can meet without a strong gradient. Those differences limit what this measurement alone can establish.</p>
                <>
<p>Shadows, printed patterns and changes in illumination can create strong gradients without separating objects. Their response strength depends on contrast, blur and sampling, just as it does for an object boundary. A local gradient alone does not identify the cause of that change.</p>
                <p>

                  And objects end where the brightness does not change. A gray cat on a gray sofa has a real boundary along which the brightness is the same on both sides, and the operator answers close to nothing there, correctly and uselessly.
                </p>
</>
                <>
<p>

                  There is nothing in the estimate that could distinguish these, because the distinction is not present in the numbers being read. It needs something the operator does not have, which is either a color or a texture that does differ across the boundary, or knowledge of what shape the thing is, or a second view of the same scene from elsewhere.
                </p>
                <p>Later descriptors combine local responses with more spatial context or learned information. That can make them more useful for recognizing objects, while the original gradient still measures an image change. Keeping those roles distinct helps explain why detecting edges and identifying objects require different evidence.</p>
</>
                <KeepInMind>
                  An edge operator answers where the brightness changes. Shadows,
                  printed patterns and lighting boundaries change the brightness
                  and end no object; two objects of the same brightness meet at a
                  boundary it cannot see. The gap is in the question rather than
                  in the estimate, so no choice of weights, border rule or
                  threshold closes it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "A boundary runs straight up and down with the bright side on the right. Which way does the arrow point?",
              [
                "Along the boundary, at a quarter circle",
                "Due right, at zero radians, while the boundary itself runs at a quarter circle",
                "Due left, since the dark side is on the left",
                "Nowhere in particular, since the vertical sweep answers zero there",
              ],
              1,
              "The brightness does not change as you walk up or down the boundary and changes as fast as it ever does as you step across it, so the arrow points across, from the dark side to the bright side. The arrow’s angle and the edge’s own direction are the same fact reported two ways and are a quarter turn apart always, and confusing them turns every later description by ninety degrees without anything looking wrong.",
            ),
            trueFalse(
              "Where the picture is flat the reported angle is zero, and that zero is a measurement.",
              false,
              "At zero gradient magnitude there is no defined geometric direction. An implementation may return angle zero as a convention, so it should not be interpreted as evidence for a horizontal gradient. Later direction summaries can exclude such pixels or weight them by magnitude, depending on their purpose.",
            ),
            choice(
              "In the noisy scene, flat pixels reach magnitude 1.0157. At threshold 0.7, eighty flat pixels remain while fifteen boundary pixels are lost. What does that show about separating these reference groups with one threshold?",
              [
                "No number separates the two, because the populations overlap in the quantity being thresholded",
                "A threshold of 0.9 separates them, which is why it is the best in the sweep",
                "The threshold simply has to be raised above 1.0157",
                "The noise has to be subtracted first, after which any threshold works again",
              ],
              0,
              "Some flat pixels have larger responses than some reference boundary pixels, so no scalar cutoff can perfectly separate them. Raising the cutoff reduces retained flat pixels but loses more boundary pixels. At 0.9, five flat pixels remain and thirty-five boundary pixels are missed. Whether that is preferable depends on the relative cost of the two errors; no cost rule is specified here.",
            ),
            several(
              "Why does a brightness-edge operator alone not reliably identify every object boundary?",
              [
                "A shadow cast on a table has a boundary as sharp as the hand does, and the operator reports it at full strength",
                "A gray cat on a gray sofa has a real boundary along which the operator answers close to nothing",
                "A better choice of weights, border rule and threshold would close the gap",
                "Smoothing first at a chosen scale turns the overlap between noise and faint boundaries into a separation",
              ],
              [0, 1],
              "A shadow can create a strong brightness change within an object, while two different objects can have similar intensities at their boundary. A local derivative measures intensity change, so those cases require additional evidence such as texture, color or shape. Smoothing and edge-linking can reduce particular noise errors, but neither guarantees that every response is an object boundary or every object boundary is detected.",
            ),
            trueFalse(
              "A grid with an even side is refused here rather than swept, because its answer would belong half a pixel from any pixel it could be written at.",
              true,
              "A grid with an odd number of columns has a middle column to report at and a grid with an even number does not, so the answer from a two wide grid belongs half a pixel to the side of anywhere it could be written, and every later comparison against the picture is offset by that half pixel with nothing to reveal it. Roberts’ own operator is two by two and works, with its answers belonging to the corners between pixels, which he knew. Everything on this page is odd on both sides so that every answer sits at a pixel.",
            ),
        ],
        },
        {
          title: "Practice. Sweeping the Scene With the Library",
          practice: [
            exercise("Sweep the six by six picture under every border rule",["Apply swept to the six-by-six image below with weights [-0.5, 0, 0.5], then reverse the weights. Print the middle output row each time. Next calculate a Sobel GradientField under every EdgeRule and print each output shape and a middle row of gradient magnitudes.", "Each image row is [0, 0, 0, 1, 1, 1]. This library applies the filter by correlation, using weights in their written order. Compare which responses change sign when weights reverse and which border rules create additional responses."],`import numpy as np
from oop_ml.core.computer_vision.edges import GradientField, GradientOperator
from oop_ml.core.computer_vision.filtering import EdgeRule, swept
from oop_ml.core.computer_vision.picture import Picture

picture = Picture([[0.0, 0.0, 0.0, 1.0, 1.0, 1.0]] * 6)

# Sweep the picture with the central difference, minus a half, nought, a half,
# and print the middle row of the answer. Sweep it again with those weights
# reversed and print the same row. Then, for each border rule, build the Sobel
# gradient field under it and print the shape of its answer and the middle
# row of its sharpness.`,`import numpy as np
from oop_ml.core.computer_vision.edges import GradientField, GradientOperator
from oop_ml.core.computer_vision.filtering import EdgeRule, swept
from oop_ml.core.computer_vision.picture import Picture

picture = Picture([[0.0, 0.0, 0.0, 1.0, 1.0, 1.0]] * 6)

written = np.asarray(swept(picture, [[-0.5, 0.0, 0.5]]))
reversed_grid = np.asarray(swept(picture, [[0.5, 0.0, -0.5]]))
print(f"weights as written, middle row {written[3].tolist()}")
print(f"weights reversed, middle row  {reversed_grid[3].tolist()}")

for rule in EdgeRule:
    field = GradientField.of(picture, GradientOperator.SOBEL, rule)
    magnitude = np.asarray(field.magnitude)
    middle = magnitude[min(3, field.shape[0] - 1)]
    print(f"{rule.value:14} answer {field.shape[0]} by {field.shape[1]}, Sobel sharpness along a middle row {middle.tolist()}")`,`weights as written, middle row [0.0, 0.0, 0.5, 0.5, 0.0, 0.0]
weights reversed, middle row  [0.0, 0.0, -0.5, -0.5, 0.0, 0.0]
keep_valid     answer 4 by 4, Sobel sharpness along a middle row [0.0, 4.0, 4.0, 0.0]
extend         answer 6 by 6, Sobel sharpness along a middle row [0.0, 0.0, 4.0, 4.0, 0.0, 0.0]
wrap           answer 6 by 6, Sobel sharpness along a middle row [4.0, 0.0, 4.0, 4.0, 0.0, 4.0]
pad_with_zero  answer 6 by 6, Sobel sharpness along a middle row [0.0, 0.0, 4.0, 4.0, 0.0, 4.0]`,{...{ hints: ["swept takes the Picture, the weights as a list of rows, and a border rule that defaults to repeating the edge pixel. It answers a Picture, and np.asarray turns one into a plain array whose row three is the middle row.", "GradientField.of receives the Picture, operator and border rule. Its magnitude contains gradient strength. keep_valid returns a four-by-four field for the three-by-three Sobel filter; choose an available middle row instead of assuming the original image dimensions.", "EdgeRule is an enum, so iterating over it visits all four rules, and each one’s value is its name as a string."], check: numberCheck("What does the Sobel sweep answer at the right border of the middle row when the outside is treated as black?", 4.0, 0.001, "Zero padding puts invented darkness beside a bright border, so the filter reports a border response. Repeating the edge value preserves a flat border; other padding rules make different assumptions about what lies outside the frame.") },question:"Which image boundaries do the filter and border rules report?"}),
            exercise("Relight the scene and watch what survives",["The starter constructs the same 48-by-48 scene as the lesson, including the shapes and brightness ramp. Relighting multiplies every value by 1.6 and adds 0.15. Use the original scene >= 0.7 mask to identify shape pixels, then print the brightest background and darkest shape value under each lighting.", "Apply a fixed intensity threshold of 0.6 to both images. Print how many pixels it keeps in each and how many decisions differ. Then calculate both Sobel gradient fields. Print the minimum and maximum relit-to-original magnitude ratio and the largest wrapped difference between their directions."],`import numpy as np
from oop_ml.core.computer_vision.edges import GradientField
from oop_ml.core.computer_vision.picture import Picture

scene = np.full((48, 48), 0.12)
scene[6:17, 5:16] = 0.78
rows, columns = np.ogrid[:48, :48]
scene[(rows - 12) ** 2 + (columns - 34) ** 2 <= 36] = 0.78
for step in range(14):
    scene[30 - step, 6 + step:9 + step] = 0.78
cross = np.full((7, 7), 0.12)
cross[2:5, :] = 0.78
cross[:, 2:5] = 0.78
for row, column in ((26, 26), (38, 12), (39, 36)):
    scene[row:row + 7, column:column + 7] = np.maximum(scene[row:row + 7, column:column + 7], cross)
scene = scene + np.linspace(0.0, 0.30, 48)
relit = scene * 1.6 + 0.15

# Label the shape pixels as those at or above 0.7. Print how many there are,
# the brightest ground pixel and the darkest shape pixel, and the same two
# numbers for the relit scene. Print how many pixels a threshold of 0.6 keeps
# in each picture and how many pixels the two labellings disagree about.
# Then build the Sobel gradient field of both pictures and print the smallest
# and largest ratio of relit sharpness to original, and the largest turn
# of any direction between the two.`,`import numpy as np
from oop_ml.core.computer_vision.edges import GradientField
from oop_ml.core.computer_vision.picture import Picture

scene = np.full((48, 48), 0.12)
scene[6:17, 5:16] = 0.78
rows, columns = np.ogrid[:48, :48]
scene[(rows - 12) ** 2 + (columns - 34) ** 2 <= 36] = 0.78
for step in range(14):
    scene[30 - step, 6 + step:9 + step] = 0.78
cross = np.full((7, 7), 0.12)
cross[2:5, :] = 0.78
cross[:, 2:5] = 0.78
for row, column in ((26, 26), (38, 12), (39, 36)):
    scene[row:row + 7, column:column + 7] = np.maximum(scene[row:row + 7, column:column + 7], cross)
scene = scene + np.linspace(0.0, 0.30, 48)
relit = scene * 1.6 + 0.15

is_shape = scene >= 0.7
print(f"shape pixels {is_shape.sum()}, brightest ground {scene[~is_shape].max():.4f}, darkest shape {scene[is_shape].min():.4f}")
print(f"relit, brightest ground {relit[~is_shape].max():.4f}, darkest shape {relit[is_shape].min():.4f}")
kept, kept_relit = scene >= 0.6, relit >= 0.6
print(f"threshold 0.6 keeps {kept.sum()} pixels here and {kept_relit.sum()} relit, disagreeing about {(kept != kept_relit).sum()}")

here = GradientField.of(Picture(scene))
there = GradientField.of(Picture(relit))
sharpness_here, sharpness_there = np.asarray(here.magnitude), np.asarray(there.magnitude)
ratio = sharpness_there / sharpness_here
print(f"sharpness multiplied by between {ratio.min():.6f} and {ratio.max():.6f}")
turn = np.abs((np.asarray(there.direction) - np.asarray(here.direction) + np.pi) % (2 * np.pi) - np.pi)
print(f"largest turn of any direction {turn.max():.2e} radians")`,`shape pixels 375, brightest ground 0.4200, darkest shape 0.8119
relit, brightest ground 0.8220, darkest shape 1.4491
threshold 0.6 keeps 375 pixels here and 1252 relit, disagreeing about 877
sharpness multiplied by between 1.600000 and 1.600000
largest turn of any direction 1.07e-14 radians`,{...{ hints: ["A comparison such as scene >= 0.7 answers a grid of booleans, which can index the scene to pick out the ground or the shapes, and .sum() counts how many are true.", "GradientField.of takes a Picture and defaults to the Sobel operator with the edge pixel repeated, so Picture(scene) is all the construction needed. Its magnitude and direction are Pictures, and np.asarray reads either as an array.", "The ramp makes every pixel of the scene change a little, so no sharpness is zero and the ratio can be taken everywhere without guarding against division by zero.", "Directions are angles, so the gap between two is taken the short way round, adding π, reducing modulo 2π and subtracting π again, which is what the page does before reporting the largest turn."], check: numberCheck("How many of the 2304 pixels does the threshold of 0.6 disagree with itself about between the two lightings?", 877, 0.5, "The fixed intensity threshold changes many decisions after relighting. The gradient calculation instead cancels a common additive offset and scales with the positive contrast multiplier under these boundary settings.") },question:"What survives a change in image brightness and contrast?"}),
            exercise("Put the four operators on a clean step and on a turned edge",["For each GradientOperator, print the sum of its positive horizontal-filter weights, its gradient magnitude at row 2, column 1 of the clean step, and the direction there. Compare response scales before choosing a threshold.", "Next use the supplied smooth edge whose brightness increases at twenty degrees. For each operator, print the center pixel's gradient angle in degrees and its absolute difference from twenty. This is one sampled edge construction, so do not assume the resulting ranking applies to every edge."],`import numpy as np
from oop_ml.core.computer_vision.edges import GradientField, GradientOperator, weights_of
from oop_ml.core.computer_vision.picture import Picture

step = Picture([[0.0, 0.0, 1.0, 1.0]] * 5)
# For each operator, print the sum of its positive weights, the sharpness it
# answers at row 2, column 1 of the step, and the direction it reports there.

angle = np.radians(20)
rows, columns = np.mgrid[:21, :21]
across = (columns - 10) * np.cos(angle) + (rows - 10) * np.sin(angle)
edge = Picture(0.5 + 0.5 * np.tanh(across))
# For each operator, print the angle in degrees it reports at the centre of
# this edge, and how far that is from twenty.`,`import numpy as np
from oop_ml.core.computer_vision.edges import GradientField, GradientOperator, weights_of
from oop_ml.core.computer_vision.picture import Picture

step = Picture([[0.0, 0.0, 1.0, 1.0]] * 5)
for operator in GradientOperator:
    grid = np.asarray(weights_of(operator, vertical=False))
    field = GradientField.of(step, operator)
    sharpness = np.asarray(field.magnitude)[2, 1]
    print(f"{operator.value:18} positive weights add to {grid[grid > 0].sum():4}, answer on the step {sharpness:4}, "
          f"direction {np.asarray(field.direction)[2, 1]:.4f} radians")

angle = np.radians(20)
rows, columns = np.mgrid[:21, :21]
across = (columns - 10) * np.cos(angle) + (rows - 10) * np.sin(angle)
edge = Picture(0.5 + 0.5 * np.tanh(across))
for operator in GradientOperator:
    reported = np.degrees(np.asarray(GradientField.of(edge, operator).direction)[10, 10])
    print(f"{operator.value:18} reports the twenty degree edge at {reported:.2f} degrees, out by {abs(reported - 20):.2f}")`,`central_difference positive weights add to  0.5, answer on the step  0.5, direction 0.0000 radians
prewitt            positive weights add to  3.0, answer on the step  3.0, direction 0.0000 radians
sobel              positive weights add to  4.0, answer on the step  4.0, direction 0.0000 radians
scharr             positive weights add to 16.0, answer on the step 16.0, direction 0.0000 radians
central_difference reports the twenty degree edge at 24.13 degrees, out by 4.13
prewitt            reports the twenty degree edge at 17.01 degrees, out by 2.99
sobel              reports the twenty degree edge at 18.90 degrees, out by 1.10
scharr             reports the twenty degree edge at 20.27 degrees, out by 0.27`,{...{ hints: ["GradientOperator is an enum of the four, and weights_of(operator, vertical=False) answers the horizontal grid as a list of rows, so np.asarray and a boolean mask pick out the positive weights.", "GradientField.of takes the Picture and the operator, and its magnitude and direction are Pictures, so np.asarray and an index of [2, 1] read the answer at row 2, column 1.", "The direction is in radians, measured from pointing right towards pointing down, and np.degrees converts it. Twenty degrees is the direction the brightness rises in, which is across the drawn edge."], check: numberCheck("What angle does Scharr report at the center of the twenty degree edge, in degrees?", 20.27, 0.01, "The operators agree on an axis-aligned step but differ on a sampled oblique boundary. On this measured angle sweep, Scharr has the smallest worst direction error; that observation concerns the supplied edge construction and operator conventions.") },question:"How accurately do the gradient operators recover a tilted edge's direction?"}),
            exercise("Threshold the sharpness and find the overlap",["Build the Sobel magnitude for the scene with and without its ramp. Define boundary pixels where the ramp-free magnitude exceeds 0.2 and flat pixels where it is zero. Print their counts, the largest response, the smallest boundary response and the largest flat response under the specified clean images.", "Add the supplied seeded Gaussian noise with standard deviation 0.08 to the ramped scene. Print its largest flat-pixel response. At thresholds 0.4, 0.7, 0.9 and 1.1, count retained flat pixels and missed boundary pixels using the fixed reference masks. Compare which errors each cutoff permits."],`import numpy as np
from oop_ml.core.computer_vision.edges import GradientField
from oop_ml.core.computer_vision.picture import Picture

scene = np.full((48, 48), 0.12)
scene[6:17, 5:16] = 0.78
rows, columns = np.ogrid[:48, :48]
scene[(rows - 12) ** 2 + (columns - 34) ** 2 <= 36] = 0.78
for step in range(14):
    scene[30 - step, 6 + step:9 + step] = 0.78
cross = np.full((7, 7), 0.12)
cross[2:5, :] = 0.78
cross[:, 2:5] = 0.78
for row, column in ((26, 26), (38, 12), (39, 36)):
    scene[row:row + 7, column:column + 7] = np.maximum(scene[row:row + 7, column:column + 7], cross)
ramped = scene + np.linspace(0.0, 0.30, 48)

# Build the Sobel sharpness of the scene without its ramp and with it. Call
# a pixel a boundary pixel where the ramp-free sharpness is above 0.2 and a
# flat pixel where it is exactly zero. Print the sharpest reading with the
# ramp, what flat ground answers up to with and without it, the count of
# boundary and flat pixels, and the faintest boundary reading.
# Then add normal noise of spread 0.08 from a generator seeded with 0, and
# for thresholds 0.4, 0.7, 0.9 and 1.1 print how many flat pixels survive
# and how many boundary pixels are lost.`,`import numpy as np
from oop_ml.core.computer_vision.edges import GradientField
from oop_ml.core.computer_vision.picture import Picture

scene = np.full((48, 48), 0.12)
scene[6:17, 5:16] = 0.78
rows, columns = np.ogrid[:48, :48]
scene[(rows - 12) ** 2 + (columns - 34) ** 2 <= 36] = 0.78
for step in range(14):
    scene[30 - step, 6 + step:9 + step] = 0.78
cross = np.full((7, 7), 0.12)
cross[2:5, :] = 0.78
cross[:, 2:5] = 0.78
for row, column in ((26, 26), (38, 12), (39, 36)):
    scene[row:row + 7, column:column + 7] = np.maximum(scene[row:row + 7, column:column + 7], cross)
ramped = scene + np.linspace(0.0, 0.30, 48)

plain = np.asarray(GradientField.of(Picture(scene)).magnitude)
clean = np.asarray(GradientField.of(Picture(ramped)).magnitude)
on_edge, on_flat = plain > 0.2, plain == 0.0
print(f"sharpest reading {clean.max():.4f}, flat ground answers up to {clean[on_flat].max():.4f} with the ramp and {plain[on_flat].max()} without")
print(f"{on_edge.sum()} boundary pixels, the faintest at {clean[on_edge].min():.3f}, and {on_flat.sum()} flat pixels")

noisy = Picture(ramped + np.random.default_rng(0).normal(0.0, 0.08, ramped.shape))
sharpness = np.asarray(GradientField.of(noisy).magnitude)
print(f"with noise, flat ground answers up to {sharpness[on_flat].max():.4f}")
for threshold in (0.4, 0.7, 0.9, 1.1):
    kept = sharpness >= threshold
    print(f"threshold {threshold}: {(kept & on_flat).sum()} flat pixels kept, {(~kept & on_edge).sum()} boundary pixels lost")`,`sharpest reading 2.9974, flat ground answers up to 0.0511 with the ramp and 0.0 without
450 boundary pixels, the faintest at 0.898, and 1854 flat pixels
with noise, flat ground answers up to 1.0157
threshold 0.4: 693 flat pixels kept, 0 boundary pixels lost
threshold 0.7: 80 flat pixels kept, 15 boundary pixels lost
threshold 0.9: 5 flat pixels kept, 35 boundary pixels lost
threshold 1.1: 0 flat pixels kept, 63 boundary pixels lost`,{...{ hints: ["GradientField.of(Picture(scene)).magnitude is the Sobel sharpness under the default rule, and np.asarray turns it into a grid that comparisons such as > 0.2 can be made on.", "np.random.default_rng(0).normal(0.0, 0.08, ramped.shape) is the noise the page adds, one draw per pixel, and the same seed draws the same noise.", "Boolean grids combine with & and negate with ~, so (kept & on_flat).sum() counts the flat pixels that survive a threshold and (~kept & on_edge).sum() the boundary pixels that do not."], check: numberCheck("At a threshold of 0.7, how many boundary pixels are lost?", 15, 0.5, "At this threshold both false edge responses and missed true boundary pixels remain. Their overlapping response ranges prevent a perfect scalar cutoff on this noisy scene.") },question:"Which threshold separates real edge responses from noise on this scene?"}),
          ],
        },
      ]}
    />
  );
}
