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

export const metadata: Metadata = {
  title: "Filters and Edges · oop_ml",
  description:
    "The boundary of an object often appears as a change in brightness. Small image filters compare nearby pixels so we can measure those changes instead of treating each pixel in isolation.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FiltersAndEdgesPage() {
  return (
    <ConceptPage
      lessonId="filters-and-edges"
      intuition={lessonIntuitions["filters-and-edges"]}
      technicalStart="Part 2. Carrying a Grid of Weights Across a Picture"
      openingTitle="The Brightness Changed; the Edge Stayed Put"
      playgroundIntro="Compare the original picture with the filter response. Inspect one window's arithmetic, then change the filter and examine which changes in brightness it highlights."
      title="Filters and Edges"
      tagline={"The boundary of an object often appears as a change in brightness. Small image filters compare nearby pixels so we can measure those changes instead of treating each pixel in isolation."}
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
                <p>
                  A greyscale picture is a grid of numbers, one to a pixel,
                  saying how much light arrived there. The scene this page works
                  on is forty eight pixels on a side and is drawn rather than
                  photographed, so that everything in it is known. It holds a
                  square, a disc, a diagonal bar and three small crosses, all of
                  them at the same brightness, on ground that is much darker. Two
                  thousand three hundred and four numbers in all, of which three
                  hundred and seventy five belong to a shape.
                </p>
                <>
<p>
                  There is one more thing in it, and it is deliberate. The whole scene is a little brighter on the right than on the left, by 0.30 spread evenly across the forty eight columns, which is 0.00638 per column. That is a ramp, and it is what a scene looks like when the lamp is off to one side.
                </p>
                <p>
                  Without it the page could not tell the difference between a method that reads the objects and a method that reads the lighting, and the playground above lets you take the ramp away and put it back.
                </p>
</>
                <KeepInMind>
                  A picture is a grid of numbers and nothing more, and the
                  numbers are not a property of the objects in the scene. The
                  same square photographed twice under different lamps is two
                  different grids.
                </KeepInMind>
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
                <p>
                  The threshold of 0.6 now keeps 1252 pixels where it should keep
                  375, and it disagrees with itself about 877 of them, which is
                  38.06 per cent of the picture. It is not that 0.6 was a bad
                  choice; the window of thresholds that works has moved out from
                  under it, from between 0.42 and 0.8119 to between 0.822 and
                  1.4491, and those two windows do not overlap anywhere. No
                  single number can serve both pictures, and a number chosen on
                  one photograph is a number chosen for that photograph&rsquo;s
                  lamp.
                </p>
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
                <p>
                  Be precise about what survives, because the loose version of
                  this claim is false. The <em>size</em> of the change did move,
                  by a factor of 1.6, so a threshold on sharpness is no more
                  portable across lamps than a threshold on brightness was. What
                  survived is everything that does not depend on a common scale.
                  The direction is exact. Any comparison between two sharpness
                  readings is exact, since both were multiplied by the same
                  number. That is why the descriptions built on this in the
                  decades after Roberts count directions and take ratios rather
                  than quoting sizes.
                </p>
                <KeepInMind>
                  A lamp that multiplies and adds moves every pixel and leaves
                  every direction alone. The direction carries across lamps
                  unchanged. The sharpness is multiplied by the same 1.6
                  everywhere, so two sharpness readings can still be compared
                  against each other, and the brightness carries nothing across.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. What that costs, and where it is the wrong trade">
                <p>
                  It is worth saying plainly what has been given up, because the
                  answer is a lot. The threshold in step 2 needed one comparison
                  per pixel and gave a verdict about all 2304 of them, saying of
                  each one whether it belonged to a shape. Reading differences
                  instead costs thirty four multiplications and additions per
                  pixel, and what comes back is an answer about the 450 pixels
                  that sit on a boundary, from which it takes a further step to
                  work out which side of the boundary the object is on.
                </p>
                <p>
                  So where the lighting is genuinely fixed, the threshold is the
                  better method, and this is not a close call. A document scanner
                  lights the page itself and a microscope has a lamp under the
                  stage; on pictures from either, thresholding the brightness
                  costs about a thirtieth of the arithmetic and answers a
                  stronger question. Roberts and Prewitt were not working on
                  those. Roberts had photographs of blocks lit by whatever was in
                  the room, and Prewitt had specimens stained by hand.
                </p>
                <KeepInMind>
                  Working from differences is a trade rather than an
                  improvement. It buys independence from the lamp at about thirty
                  times the arithmetic and a weaker answer, and on a scanned page,
                  where the lamp is part of the machine, the threshold in step 2
                  does the better job for a thirtieth of the work.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Carrying a Grid of Weights Across a Picture",
          content: (
            <>
              <SubSection title="5. One position, one weighted sum">
                <p>
                  Everything on this page, and most of what the rest of this
                  section does, is one operation asked different questions. Take
                  a small grid of numbers, lay it over the picture so that its
                  middle sits on some pixel, multiply each of its numbers by the
                  pixel under it, add all of those up, and write the total down
                  as the answer for that pixel. Then move along one pixel and do
                  it again. That is a sweep, and the small grid is the weights.
                </p>
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

              <SubSection title="6. The whole sweep, worked on six by six">
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
                  the simplest weights on the page, half of the right neighbour
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
                <p>
                  Notice what the answer says about where the change is. There is
                  one boundary in this picture and two columns report it, at
                  equal strength. That is not a fault in the weights and there is
                  no cleverer choice that avoids it, since the change happens between
                  two pixels, and any three wide window centred on either of them
                  straddles it equally. An operator of this kind says where the
                  brightness is changing to within a pixel and not to within
                  less, which is a permanent property of asking the question this
                  way.
                </p>
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
                  An odd side gives the grid a middle pixel to report at. An even
                  side leaves the answer half a pixel from where it was computed,
                  which is a bias that nothing downstream can undo because
                  nothing downstream can see it.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. In the order written, or reversed">
                <>
<p>
                  There is a fork here that looks like pedantry and is not. Having laid the weights over the picture, we can multiply them by the pixels in the order they are written, or we can turn the weights end over end first and then multiply. The first is called correlation and the second convolution. For a grid that reads the same forwards as backwards the two agree exactly and nobody ever notices the question.
                </p>
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
                <WhyThisWorks>
                  <p>
                    Signal processing prefers convolution because reversing is
                    what makes the operation associative, so that sweeping with
                    one grid and then another is the same as sweeping once with a
                    single combined grid, and a great deal of theory rests on
                    that. Vision implementations mostly prefer correlation
                    because it is what a person means when they draw a small
                    picture and ask where it fits, which is exactly what template
                    matching is, and because leaving the weights the way round
                    they are written makes the sign of the answer match what the
                    reader wrote down.
                  </p>
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
                  Correlation multiplies the weights by the pixels in the order
                  written; convolution reverses them first. They agree whenever
                  the weights are symmetric and differ by a sign whenever they
                  are not, so the sign of every direction on this page rests on
                  that choice being stated rather than assumed.
                </KeepInMind>
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
              "It keeps 1252 pixels where it should keep 375, disagreeing with itself about 38.06 per cent of the picture. The working window moved from between 0.42 and 0.8119 to between 0.822 and 1.4491, and the two do not overlap anywhere, so nothing was wrong with 0.6 and no single number can serve both pictures.",
            ),
            several(
              "The same lamp change is applied and the differences between neighbouring pixels are read instead. Which of these were measured on the scene?",
              [
                "Every measured sharpness is multiplied by a number between 1.5999999999999897 and 1.6000000000000139",
                "The direction in which the brightness rises does not move, the largest turn over all 2304 pixels being 1.07e-14 radians",
                "A threshold on sharpness now carries across the change of lamp",
                "The flat 0.15 adds nothing to any difference, since the same constant sits on both sides of every subtraction",
              ],
              [0, 1, 3],
              "What survives a lamp that multiplies and adds is everything not resting on a common scale, which is the direction and any comparison between two sharpness readings. The size did move, by a factor of 1.6, so a threshold on sharpness is no more portable than a threshold on brightness was, and the loose version of this claim is the false one.",
            ),
            trueFalse(
              "On a scanned page, where the lamp is part of the machine, thresholding the brightness is the better method than reading differences.",
              true,
              "Reading differences is a trade rather than an improvement. It costs thirty four multiplications and additions per pixel against one comparison, and what comes back is an answer about the 450 pixels on a boundary rather than a verdict on all 2304. What it buys is independence from the lamp, and a document scanner lights the page itself, so there the threshold answers the stronger question for about a thirtieth of the work. Roberts and Prewitt were not working on those; Roberts had photographs of blocks lit by whatever was in the room.",
            ),
            choice(
              "The six by six picture has one boundary, between columns two and three, and two columns report it at equal strength. Why?",
              [
                "Because the weights have not been normalised",
                "Because the change happens between two pixels, and any three wide window centred on either of them straddles it equally",
                "Because the border rule invented values outside the frame",
                "Because correlation and convolution disagree about the sign",
              ],
              1,
              "There is no cleverer choice of three weights that avoids it. An operator of this kind says where the brightness is changing to within a pixel and not to within less, so the smearing is the arithmetic rather than a fault in it.",
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
                <p>
                  There is no right answer to what should be read there, and that
                  is a genuine fact about the situation rather than an admission
                  of laziness. The photograph is a window onto a scene that
                  continued outside the frame, and nothing in the file records
                  what was there. Whatever is read is invented, so the only
                  question is which invention to make and what it costs.
                </p>
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
                        "assumes the scene carried on as it was. A flat border stays flat, so the operator answers 0 at both ends of this picture, which is what the picture actually holds. It is the smallest invention of the four and is the usual default for that reason.",
                    },
                    {
                      expression: "treat the outside as black",
                      reason:
                        "assumes the world outside the frame is dark. That happens to be true on the left of this picture, where it answers 0 like the rule above, and false on the right, where the bright side meets invented darkness and the operator answers 4, exactly as sharp as the one real boundary.",
                    },
                    {
                      expression: "read from the opposite side",
                      reason:
                        "assumes the picture tiles. The left border then reads the bright right-hand side and the right border reads the dark left-hand side, so the operator answers 4 at both ends and reports three boundaries where the picture holds one. Correct for a texture that genuinely repeats and wrong for a photograph.",
                    },
                    {
                      expression: "answer nothing there",
                      reason:
                        "invents nothing and answers only where the weights fit, which makes the answer smaller than the question, four by four here rather than six by six. Honest, and it means the answer can no longer be laid over the picture position for position without an offset being carried alongside it.",
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
                  Repeating the edge pixel invents the least, because it asserts
                  only that the scene continued as it was, where treating the
                  outside as black asserts that the world beyond the frame is
                  dark. That assertion is right at a dark border and wrong at a
                  bright one, and both cases occur in the same photograph.
                </KeepInMind>
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
                <p>
                  Part 1 asked how different a pixel is from the pixel beside it.
                  The cheapest way to answer is to subtract the left neighbour
                  from the right one and halve it, since the two are two pixels
                  apart, which is the central difference and is the one by three
                  grid already used above.
                </p>
                <Equation>
                  {"rate across at column c ≈ ( p(c + 1) − p(c − 1) ) / 2"}
                </Equation>
                <p>
                  It is exact on a straight ramp, where the brightness really does
                  rise by the same amount each column, and it is hopeless on a
                  photograph. Its answer at a pixel depends on exactly two other
                  pixels, so a single sensor reading a little high moves it by
                  half of however wrong that reading was, and it moves it whether
                  or not there is a boundary anywhere near.
                </p>
                <KeepInMind>
                  The two-neighbour difference is the definition of the thing
                  being estimated and the worst usable estimate of it, because
                  nothing in it distinguishes a real change from one stray pixel.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Difference across, average along">
                <p>
                  The repair every named operator makes is the same one. A real
                  boundary is not one pixel long; it runs for some distance, so
                  the rows just above and just below the pixel being answered for
                  are looking at the same boundary and should have a say. Take the
                  same left-minus-right difference on three neighbouring rows and
                  average the three answers, and a stray reading in one of them
                  now counts for a third of what it did while a real boundary,
                  which is present in all three, counts for the same.
                </p>
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
                <p>
                  The grid that asks about the downward direction is this one
                  turned on its side, which is not a coincidence and not worth
                  writing out separately. It is the same estimate asked about the
                  other axis, so writing the second by hand would only be an
                  opportunity to write it wrong.
                </p>
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
                <p>
                  So the same boundary, in the same picture, is reported as 0.5,
                  3, 4 or 16 depending on nothing but which grid was swept. None
                  of them is normalised, and that has a practical consequence
                  worth stating, which is that a threshold chosen for one of these
                  is meaningless for another, and the factor between Scharr and
                  the central difference is thirty two.
                </p>
                <p>
                  What every one of them does share is that its weights add to
                  zero. That is what makes the answer zero on any flat region,
                  whatever the brightness of that region, since the positive and
                  negative weights then meet the same value and cancel. It is also
                  why adding a constant to every pixel, which is what a second lamp
                  did in Part 1, changes no answer anywhere.
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
                  The four operators differ in how much they smooth and in what
                  scale they answer on, and hardly at all in what they mean. Two
                  of them reporting sizes a factor of twenty six apart at the same
                  boundary can still agree about its angle to within a third of a
                  degree.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Where the weights actually differ">
                <>
<p>
                  If the four barely disagree, the question is what Scharr&rsquo;s three and ten was for. The answer needs an edge the scene does not contain, because every boundary in it is drawn by arithmetic and is one pixel wide, and a step one pixel wide is a case where none of these estimates is any good.
                </p>
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
<p>
                  On the hard one-pixel step none of that holds. Every operator is out by more than nine degrees on average, Prewitt and Sobel come out identical at 9.2367, and Scharr is the worst of the three at 10.8913, with a worst case of 27.01 against Sobel&rsquo;s 21.57. That is the honest report and it is not a defect in Scharr.
                </p>
                <p>
                  A one-pixel step has no well-defined rate of change to estimate, so the weights tuned to estimate one accurately have nothing to be accurate about, and the fact that the workbench scene is drawn that way is exactly why the diagonal bar showed so little between them.
                </p>
</>
                <InAModel>
                  <>
<p>
                    The reason this matters more than it sounds is what usually happens next. A description built from gradients throws the sizes away and counts the directions, sorting them into bins a few tens of degrees wide, so an angle out by four degrees will sometimes fall in the wrong bin and an angle out by a third of a degree will almost never do so.
                  </p>
                  <p>
                    That is what buys the extra arithmetic of three and ten over one and two, and it buys nothing at all on a picture whose boundaries were drawn rather than photographed.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  On an edge spread over a couple of pixels, which is what a
                  photographed edge is, the reported angles are steadiest for
                  Scharr, then Sobel, then Prewitt, then the bare difference, by
                  factors of four and three. On a one-pixel step every one of them
                  is out by nine degrees or more and the ordering reverses, so a
                  scene drawn by arithmetic cannot be used to choose between them.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What a sweep costs">
                <p>
                  The counting part is exact. A three by three grid does nine
                  multiplications and eight additions at every pixel, and a
                  gradient needs two sweeps, one across and one down, so it is
                  thirty four operations per pixel and 78,336 for the whole forty
                  eight by forty eight scene. The magnitude and the angle add a
                  square root and an inverse tangent per pixel on top of that.
                </p>
                <SweepCost />
                <>
<p>
                  The timings underneath are a measurement of whichever machine answered the request and move a little between runs, which is why they are read live rather than written into this page. The figure worth taking from them is the shape rather than any one number, since the cost per pixel at the scene&rsquo;s size is roughly double what it is on a picture a thousand pixels on a side, because on a small picture most of the time goes on arranging the sweep rather than on doing it.
                </p>
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
              "On a flat region the positive and negative weights meet the same value and cancel, which is also why adding a constant to every pixel changes no answer anywhere. None of the four is normalised, and the factor between Scharr and the central difference is thirty two, so a threshold chosen for one of them is meaningless for another.",
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
              "Nine multiplications and eight additions per sweep, and a gradient needs one sweep across and one down, which is 78,336 operations for the whole forty eight by forty eight scene before the square root and the inverse tangent are added. A picture with four times as many pixels costs about four times as much, which is what made these operators usable on the hardware they were invented on.",
            ),
        ],
        },
        {
          title: "Part 5. Two Answers Kept Together",
          content: (
            <>
              <SubSection title="18. A rate across and a rate down">
                <>
<p>
                  Sweeping once answers how fast the brightness rises to the right, and that alone is not an edge. A boundary running exactly up and down is invisible to it in the vertical direction and a boundary running exactly flat is invisible to it in the horizontal one, which is why the vertical sweep of the six by six picture answers zero everywhere while the horizontal sweep answers 4 at two columns.
                </p>
                <p>
                  So the same picture is swept twice, with the same grid turned on its side for the second, and the two answers are kept together.
                </p>
</>
                <p>
                  Together they are a pair of numbers at every pixel, and a pair
                  of numbers is an arrow. Handing back two separate pictures and
                  leaving them to be paired up later is how the two get separated
                  and one of them gets compared against the wrong half of
                  something else, so they travel as one thing.
                </p>
                <KeepInMind>
                  Neither direction alone is an edge. What an edge operator
                  answers with is one arrow per pixel, made from a horizontal rate
                  and a vertical rate that mean nothing apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. How long the arrow is">
                <p>
                  The length of that arrow says how sharply the brightness is
                  changing at that pixel, taking both directions into account at
                  once. It comes from the two rates the way the length of any
                  arrow comes from its two sides.
                </p>
                <Equation>
                  {"sharpness = √( across² + down² )"}
                </Equation>
                <p>
                  Being a length, it is never negative, and it is zero exactly
                  where the brightness is flat in both directions at once. On the
                  scene the sharpest reading anywhere is 2.9974, and it sits on
                  the disc&rsquo;s rim rather than on a side of the square, since
                  a boundary crossed at an angle gives both sweeps something to
                  answer and the two lengths add through the square root. The
                  square&rsquo;s upright sides read 2.6911 and its flat ones
                  2.6405.
                </p>
                <>
                  <p>
                    The flat regions still contain the brightness ramp introduced in
                    step 1. The filter compares positions two columns from its centre,
                    and its positive weights add to four. That predicts the small
                    nonzero response.
                  </p>
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
                <p>
                  There is one honest gap in that. Where the picture is flat, both
                  rates are zero, and an arrow of zero length has no angle at all;
                  a number still comes back, and the number is zero, and it is a
                  convention rather than a measurement. That is why every drawing
                  on this page of directions draws a stroke only where the
                  sharpness is above a share of the largest, and why any later
                  stage that counts directions has to weight each one by its
                  sharpness rather than counting them equally.
                </p>
                <KeepInMind>
                  The angle is only meaningful where the sharpness is not near
                  zero. A flat region has no direction, so whatever number is
                  reported there was chosen by whoever implemented it and says
                  nothing about the picture.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The gradient crosses the edge, it does not run along it">
                <p>
                  This is the thing most often got the wrong way round, so it is
                  worth being blunt. The arrow points the way the brightness{" "}
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
                  The gradient points across the edge, from the dark side to the
                  bright side, and never along it. The edge&rsquo;s own direction
                  is that turned by a quarter circle, and confusing the two turns
                  every later description by ninety degrees without anything
                  looking wrong.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where an Edge Operator Stops Being Defined",
          content: (
            <>
              <SubSection title="22. A derivative of something sampled at whole pixels">
                <p>
                  Everything on this page has been calling the answer a rate of
                  change, and it is worth saying what that phrase can and cannot
                  mean here. A rate of change is defined for a quantity known at
                  every point of a continuum. Brightness is known at whole pixels
                  and nowhere between them, so there is no rate of change to
                  compute; there is only an estimate of what the rate would have
                  been had the scene been sampled finely enough for the question
                  to have an answer.
                </p>
                <>
<p>
                  That is not a quibble, because it says exactly when the estimate is good. It is good when the scene changes slowly compared with the spacing of the pixels, so that three neighbouring readings really do lie near one smooth curve. It has nothing to say when the scene changes faster than that, and a boundary between two flat regions one pixel apart is the extreme case.
                </p>
                <p>
                  Step 16 measured what that does. On an edge spread over a couple of pixels the four operators report angles out by between 0.28 and 4.13 degrees, and on a one-pixel step the same four are out by between 21.57 and 40.00.
                </p>
</>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the mathematics says"
                  rows={[
                    {
                      expression: "a picture one pixel wide",
                      reason:
                        "a three wide grid has no position at all where it fits inside, so answering only where it fits answers an empty picture, and every other rule answers a picture made entirely of what it invented. The estimate needs neighbours and there are none.",
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
                        "there is no middle pixel to report at, so the answer belongs half a pixel from anywhere it can be written, and every later comparison against the picture is offset by that half pixel with nothing to reveal it.",
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
                        "the same boundary answers 0.5, 3, 4 or 16 depending on the grid, since none of them is scaled to a common unit. A number is comparable with another number from the same grid and with nothing else.",
                    },
                    {
                      expression: "comparing sharpness between two lamps",
                      reason:
                        "a lamp that multiplies the picture multiplies every sharpness by the same factor, measured here as 1.6 to fourteen places. Ratios of sharpness survive that and absolute values do not, which is why a fixed threshold is the wrong thing to carry between photographs and the direction is the right one.",
                    },
                  ]}
                />
                <KeepInMind>
                  These operators estimate a quantity that a sampled picture does
                  not have. Where the scene varies gently against the pixel
                  spacing the estimate is close, and where it does not there is
                  nothing for it to be close to, though a plausible number comes
                  back either way.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. One threshold cannot do both jobs">
                <p>
                  The obvious last step is to decide, at every pixel, whether it
                  is on an edge, by keeping the pixels whose sharpness is above
                  some number. On the scene as it is drawn that works perfectly,
                  and it is worth seeing why before seeing why it does not
                  generally. Drawn by arithmetic the scene has no noise, so flat
                  ground never answers above 0.0511 and the faintest pixel on a
                  real boundary answers 0.898, more than seventeen times as much.
                  Every threshold between those two labels all 2304 pixels
                  correctly.
                </p>
                <p>
                  Now add the thing a photograph has and a drawing does not. With
                  a normal spread of 0.08 added to every pixel, which is twelve
                  per cent of the contrast between the shapes and the ground, flat
                  ground answers as high as 1.0157. The faintest real boundary is
                  still at 0.898. Those two ranges now overlap, and once they
                  overlap there is no number that separates them, because the
                  populations are not separated in the quantity being thresholded.
                </p>
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
<p>
                  So the faint half of a real boundary and the loud half of the noise occupy the same range of sharpness, and no single number keeps one and drops the other. The escape is to stop asking for one number, which is what the work after 1980 did, and the two usual moves are to use two thresholds and keep a weak pixel only when it joins a strong one, and to smooth first at a chosen scale so that the noise loses more than the boundary does.
                </p>
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
                <p>
                  The last limit is not about arithmetic at all, and it is the one
                  that stops this being a solved problem. An edge operator answers
                  a question about brightness. The question anyone actually wants
                  answered is about objects, and those two questions have
                  different answers in both directions.
                </p>
                <>
<p>
                  Brightness changes where no object ends. The shadow a hand casts on a table has a boundary as sharp as the hand does, and so does the printed edge of a pattern on a shirt, and so does the line where sunlight stops on a wall; a gradient operator reports all of them at full strength, because at each of them the brightness really is changing sharply, which is all it was ever asked.
                </p>
                <p>
                  And objects end where the brightness does not change. A grey cat on a grey sofa has a real boundary along which the brightness is the same on both sides, and the operator answers close to nothing there, correctly and uselessly.
                </p>
</>
                <>
<p>
                  There is nothing in the estimate that could distinguish these, because the distinction is not present in the numbers being read. It needs something the operator does not have, which is either a colour or a texture that does differ across the boundary, or knowledge of what shape the thing is, or a second view of the same scene from elsewhere.
                </p>
                <p>
                  That is roughly the history of the subject after this page, since everything else in this section is a way of building something more informative on top of these answers, and none of it repairs the gap between where the brightness changes and where the object is.
                </p>
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
              "Both rates are zero there, and an arrow of zero length has no angle at all, so the number that comes back was chosen by whoever implemented it. That is why the drawings put a stroke only where the sharpness is above a share of the largest, and why any later stage counting directions has to weight each one by its sharpness rather than counting them equally.",
            ),
            choice(
              "With a normal spread of 0.08 added to every pixel, flat ground answers as high as 1.0157 while the faintest real boundary is still at 0.898. What follows for a single threshold?",
              [
                "No number separates the two, because the populations overlap in the quantity being thresholded",
                "A threshold of 0.9 separates them, which is why it is the best in the sweep",
                "The threshold simply has to be raised above 1.0157",
                "The noise has to be subtracted first, after which any threshold works again",
              ],
              0,
              "The sweep says what each end costs. At 0.4 nothing real is lost and 693 of the 1854 flat pixels survive as false edges, and at 1.1 no flat pixel survives but 63 pixels on a real boundary have gone. The best value in the whole sweep is 0.9 and it still keeps 5 flat pixels while losing 35 real ones.",
            ),
            several(
              "Why does an edge operator not answer the question anyone actually wants answered?",
              [
                "A shadow cast on a table has a boundary as sharp as the hand does, and the operator reports it at full strength",
                "A grey cat on a grey sofa has a real boundary along which the operator answers close to nothing",
                "A better choice of weights, border rule and threshold would close the gap",
                "Smoothing first at a chosen scale turns the overlap between noise and faint boundaries into a separation",
              ],
              [0, 1],
              "Brightness changes where no object ends and objects end where the brightness does not change, so the two questions have different answers in both directions. The distinction is not present in the numbers being read, so it needs colour, texture, knowledge of the shape or a second view, and no choice of weights, border rule or threshold closes it. Smoothing first and keeping a weak pixel only when it joins a strong one are the two usual moves after 1980, and both are still choices with a cost; neither turns the overlap into a separation.",
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
            exercise(
              "Sweep the six by six picture under every border rule",
              ["Part 2 swept the six by six picture with the central difference and found 0.5 at columns two and three and nothing elsewhere, and found that reversing the weights answers −0.5 at the same two columns. Part 3 then ran the four border rules over it with the Sobel operator and found that two of them invent an edge the picture does not hold. Reproduce all of it with the library.", "The picture is the lesson’s own, six rows of 0, 0, 0, 1, 1, 1. The library sweeps by correlation, with the weights in the order written, so the sign of every answer is the sign you wrote down."],
              `import numpy as np
from oop_ml.core.computer_vision.edges import GradientField, GradientOperator
from oop_ml.core.computer_vision.filtering import EdgeRule, swept
from oop_ml.core.computer_vision.picture import Picture

picture = Picture([[0.0, 0.0, 0.0, 1.0, 1.0, 1.0]] * 6)

# Sweep the picture with the central difference, minus a half, nought, a half,
# and print the middle row of the answer. Sweep it again with those weights
# reversed and print the same row. Then, for each border rule, build the Sobel
# gradient field under it and print the shape of its answer and the middle
# row of its sharpness.`,
              `import numpy as np
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
    print(f"{rule.value:14} answer {field.shape[0]} by {field.shape[1]}, Sobel sharpness along a middle row {middle.tolist()}")`,
              `weights as written, middle row [0.0, 0.0, 0.5, 0.5, 0.0, 0.0]
weights reversed, middle row  [0.0, 0.0, -0.5, -0.5, 0.0, 0.0]
keep_valid     answer 4 by 4, Sobel sharpness along a middle row [0.0, 4.0, 4.0, 0.0]
extend         answer 6 by 6, Sobel sharpness along a middle row [0.0, 0.0, 4.0, 4.0, 0.0, 0.0]
wrap           answer 6 by 6, Sobel sharpness along a middle row [4.0, 0.0, 4.0, 4.0, 0.0, 4.0]
pad_with_zero  answer 6 by 6, Sobel sharpness along a middle row [0.0, 0.0, 4.0, 4.0, 0.0, 4.0]`,
              { hints: ["swept takes the Picture, the weights as a list of rows, and a border rule that defaults to repeating the edge pixel. It answers a Picture, and np.asarray turns one into a plain array whose row three is the middle row.", "GradientField.of takes the Picture, an operator and a border rule, and its magnitude is a Picture of the sharpness. Under the rule that answers only where the weights fit, the field is four by four, so its middle row is row one rather than row three.", "EdgeRule is an enum, so iterating over it visits all four rules, and each one’s value is its name as a string."], check: numberCheck("What does the Sobel sweep answer at the right border of the middle row when the outside is treated as black?", 4.0, 0.001, "The bright right side meets invented darkness, so the operator reports a change exactly as sharp as the one real boundary, 4, which is the sum of Sobel’s positive weights. Repeating the edge pixel answers 0 there, because a flat border stays flat; reading from the opposite side answers 4 at both ends and reports three boundaries where the picture holds one; and answering only where the weights fit invents nothing and comes back four by four.") },
            ),
            exercise(
              "Relight the scene and watch what survives",
              ["Part 1 drew the forty eight by forty eight scene, lit it again with the lamp turned up by 1.6 and a second lamp adding 0.15, and found that a threshold of 0.6 which labelled every pixel correctly now relabels 877 of them, while every sharpness was multiplied by 1.6 and no direction moved. The scene is rebuilt here from the numbers behind the page, so every pixel is the page’s own.", "The starter draws the square, the disc, the diagonal bar and the three crosses on ground of 0.12 at a brightness of 0.78, then adds the ramp of 0.30 across the columns. The last line, adding a row of forty eight numbers to a grid of forty eight columns, adds the ramp to every row at once."],
              `import numpy as np
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
# of any direction between the two.`,
              `import numpy as np
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
print(f"largest turn of any direction {turn.max():.2e} radians")`,
              `shape pixels 375, brightest ground 0.4200, darkest shape 0.8119
relit, brightest ground 0.8220, darkest shape 1.4491
threshold 0.6 keeps 375 pixels here and 1252 relit, disagreeing about 877
sharpness multiplied by between 1.600000 and 1.600000
largest turn of any direction 1.07e-14 radians`,
              { hints: ["A comparison such as scene >= 0.7 answers a grid of booleans, which can index the scene to pick out the ground or the shapes, and .sum() counts how many are true.", "GradientField.of takes a Picture and defaults to the Sobel operator with the edge pixel repeated, so Picture(scene) is all the construction needed. Its magnitude and direction are Pictures, and np.asarray reads either as an array.", "The ramp makes every pixel of the scene change a little, so no sharpness is zero and the ratio can be taken everywhere without guarding against division by zero.", "Directions are angles, so the gap between two is taken the short way round, adding π, reducing modulo 2π and subtracting π again, which is what the page does before reporting the largest turn."], check: numberCheck("How many of the 2304 pixels does the threshold of 0.6 disagree with itself about between the two lightings?", 877, 0.5, "The threshold keeps 375 pixels on the scene as drawn, which is exactly the shape pixels, and 1252 on the relit scene, so 877 pixels are labelled differently, 38.06 per cent of the picture. The window of thresholds that works moved from between 0.42 and 0.8119 to between 0.822 and 1.4491, and the two windows do not overlap anywhere. The sharpness, meanwhile, was multiplied by 1.6 to fourteen places everywhere, and the largest turn of any direction is a rounding step rather than a movement.") },
            ),
            exercise(
              "Put the four operators on a clean step and on a turned edge",
              ["Part 4 says that on a clean step every operator answers the sum of its own positive weights, 0.5, 3, 4 and 16, all reporting the brightness rising at exactly zero radians, and that on an edge spread across a pixel the operators part company over the angle, Scharr’s worst miss being 0.28 degrees against the central difference’s 4.13. Measure both with the library.", "The step is five rows of 0, 0, 1, 1. The turned edge is drawn with numpy the way the page’s sweep draws it, a straight boundary at twenty degrees spread across about a pixel by a hyperbolic tangent, and read at its centre pixel. What each operator reports there is a number the page does not print."],
              `import numpy as np
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
# this edge, and how far that is from twenty.`,
              `import numpy as np
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
    print(f"{operator.value:18} reports the twenty degree edge at {reported:.2f} degrees, out by {abs(reported - 20):.2f}")`,
              `central_difference positive weights add to  0.5, answer on the step  0.5, direction 0.0000 radians
prewitt            positive weights add to  3.0, answer on the step  3.0, direction 0.0000 radians
sobel              positive weights add to  4.0, answer on the step  4.0, direction 0.0000 radians
scharr             positive weights add to 16.0, answer on the step 16.0, direction 0.0000 radians
central_difference reports the twenty degree edge at 24.13 degrees, out by 4.13
prewitt            reports the twenty degree edge at 17.01 degrees, out by 2.99
sobel              reports the twenty degree edge at 18.90 degrees, out by 1.10
scharr             reports the twenty degree edge at 20.27 degrees, out by 0.27`,
              { hints: ["GradientOperator is an enum of the four, and weights_of(operator, vertical=False) answers the horizontal grid as a list of rows, so np.asarray and a boolean mask pick out the positive weights.", "GradientField.of takes the Picture and the operator, and its magnitude and direction are Pictures, so np.asarray and an index of [2, 1] read the answer at row 2, column 1.", "The direction is in radians, measured from pointing right towards pointing down, and np.degrees converts it. Twenty degrees is the direction the brightness rises in, which is across the drawn edge."], check: numberCheck("What angle does Scharr report at the centre of the twenty degree edge, in degrees?", 20.27, 0.01, "Scharr’s three and ten were chosen so that the reported angle is as close to independent of how the edge is turned as three columns of weights allow, and across every angle the page swept its worst miss was 0.28 degrees, against 1.16 for Sobel, 3.10 for Prewitt and 4.13 for the central difference. At twenty degrees the four misses line up in that order. On the clean step they all agree exactly, since the vertical sweep answers exactly zero on a picture whose rows are identical.") },
            ),
            exercise(
              "Threshold the sharpness and find the overlap",
              ["Part 6 says that on the scene as drawn every threshold between 0.0511 and 0.898 labels all 2304 pixels correctly, and that with a normal spread of 0.08 added to every pixel flat ground answers as high as 1.0157, so the two populations overlap and no threshold keeps every boundary pixel while dropping every flat one. Measure the overlap and score four thresholds.", "The two populations are read off the ramp-free scene, as the page does, so that the ramp’s own gentle change does not count as a boundary. The page quotes 0.4, 0.9 and 1.1; what 0.7 keeps and loses is a number it does not print."],
              `import numpy as np
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
# and how many boundary pixels are lost.`,
              `import numpy as np
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
    print(f"threshold {threshold}: {(kept & on_flat).sum()} flat pixels kept, {(~kept & on_edge).sum()} boundary pixels lost")`,
              `sharpest reading 2.9974, flat ground answers up to 0.0511 with the ramp and 0.0 without
450 boundary pixels, the faintest at 0.898, and 1854 flat pixels
with noise, flat ground answers up to 1.0157
threshold 0.4: 693 flat pixels kept, 0 boundary pixels lost
threshold 0.7: 80 flat pixels kept, 15 boundary pixels lost
threshold 0.9: 5 flat pixels kept, 35 boundary pixels lost
threshold 1.1: 0 flat pixels kept, 63 boundary pixels lost`,
              { hints: ["GradientField.of(Picture(scene)).magnitude is the Sobel sharpness under the default rule, and np.asarray turns it into a grid that comparisons such as > 0.2 can be made on.", "np.random.default_rng(0).normal(0.0, 0.08, ramped.shape) is the noise the page adds, one draw per pixel, and the same seed draws the same noise.", "Boolean grids combine with & and negate with ~, so (kept & on_flat).sum() counts the flat pixels that survive a threshold and (~kept & on_edge).sum() the boundary pixels that do not."], check: numberCheck("At a threshold of 0.7, how many boundary pixels are lost?", 15, 0.5, "At 0.4 nothing real is lost and 693 of the 1854 flat pixels survive as false edges; at 1.1 no flat pixel survives and 63 boundary pixels have gone. In between both happen at once, and 0.7 sits inside the overlap, keeping 80 flat pixels and losing 15 real ones, because the faint half of a real boundary, the obliquely crossed pixels on the disc’s rim and along the diagonal bar, and the loud half of the noise occupy the same range of sharpness. The best value in the whole sweep is 0.9, keeping 5 flat pixels and losing 35 real ones.") },
            ),
          ],
        },
      ]}
    />
  );
}
