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
    "Sweep a small grid of weights across a picture and read where the brightness changes rather than what it is.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FiltersAndEdgesPage() {
  return (
    <ConceptPage
      title="Filters and Edges"
      tagline="Sweep a small grid of weights across a picture, and read where the brightness changes rather than what it is."
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
      history={
        <>
          <p>
            Lawrence Roberts wanted a machine to look at a photograph of a few
            wooden blocks and say what solids were in the picture and where they
            sat, which was the subject of his 1963 doctoral thesis at MIT,
            &ldquo;Machine Perception of Three-Dimensional Solids&rdquo;. The
            difficulty he ran into first is the one this page opens on. He could
            not work from the brightness of the pixels, because the brightness
            of a face of a block is a fact about the lamp and the angle it
            shines from as much as about the block, and a program that learned
            what a block looks like under one lamp would have learned nothing
            about the same block under another. What does not move is where one
            face stops and the next begins, so his first step was to find those
            boundaries, and the operator he used for it was a pair of two by two
            grids differencing the two diagonals of a small square.
          </p>
          <p>
            Judith Prewitt was working on a different problem with the same
            difficulty. She was building automatic descriptions of cells
            photographed down a microscope, where the illumination is not even
            across the field and one specimen is stained a little more heavily
            than the next, and her contribution in &ldquo;Object enhancement and
            extraction&rdquo;, published in 1970 in <em>Picture Processing and
            Psychopictorics</em>, was a three by three grid that differences
            across the boundary and averages along it, so that a single stray
            pixel counts for a third of what it used to. Irwin Sobel and Gary
            Feldman had presented a variant at the Stanford Artificial
            Intelligence Project in 1968 which counts the middle row twice, and
            it reached print in Duda and Hart&rsquo;s <em>Pattern
            Classification and Scene Analysis</em> in 1973, which is where most
            people met it and why it carries Sobel&rsquo;s name. Sobel has since
            written down how the weights were arrived at, which was by letting
            each of the eight neighbours contribute in proportion to how close
            it sits to the pixel being answered for.
          </p>
          <p>
            The last of the four weightings on this page comes from asking a
            sharper question about what those grids are for. Hanno Scharr, in
            doctoral work at Heidelberg published in 2000, took the view that
            what a gradient operator is usually wanted for is the <em>angle</em>
            {" "}it reports, since that is what a later stage counts and
            compares, and that the angle is exactly what a three by three grid
            gets wrong on an edge that is not upright or flat. So he chose the
            weights to make the reported angle as close to independent of how
            the edge is turned as three columns allow, and arrived at three and
            ten where Sobel has one and two. Between those and the modern form
            sit two papers that changed what the question was. David Marr and
            Ellen Hildreth argued in 1980 that an edge should be found as a zero
            crossing of a smoothed second derivative, and John Canny in 1986
            wrote down what &ldquo;good&rdquo; ought to mean for an edge finder
            at all, which was to find the edge, to put it in the right place,
            and to answer once rather than several times, and then derived the
            filter that does best on those three at once.
          </p>
          <p>
            The page asks six questions in order. Why is the brightness of a
            pixel nearly useless for recognising anything? What exactly does one
            step of a sweep do? Should the weights multiply the pixels in the
            order they are written or in reverse, and what turns on the answer?
            What is read where the weights hang off the picture, given that there
            is nothing there? Which weights, and what does each choice buy? And
            which way does the answer point, given that this is the thing most
            often got the wrong way round?
          </p>
        </>
      }
      playground={<EdgeFieldPlayground />}
      sections={[
        {
          title: "Part 1. What Brightness Cannot Do",
          defaultOpen: true,
          content: (
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
                <p>
                  There is one more thing in it, and it is deliberate. The whole
                  scene is a little brighter on the right than on the left, by
                  0.30 spread evenly across the forty eight columns, which is
                  0.00638 per column. That is a ramp, and it is what a scene
                  looks like when the lamp is off to one side. Without it the
                  page could not tell the difference between a method that reads
                  the objects and a method that reads the lighting, and the
                  playground above lets you take the ramp away and put it back.
                </p>
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
                <p>
                  Look at the same two pictures a different way. Instead of
                  asking how bright each pixel is, ask how different it is from
                  the pixel beside it. Turning the lamp up multiplied every pixel
                  by 1.6, so it multiplied every difference by 1.6 as well; the
                  second lamp added a flat 0.15 to every pixel, so it added
                  nothing at all to any difference, since the same constant sits
                  on both sides of every subtraction. Whatever that pattern of
                  differences was, the same lamp change scales the whole of it by
                  one common number and leaves it otherwise exactly where it was.
                </p>
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
          ),
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
                  <p>
                    At column 2 the window covers columns 1, 2 and 3, reading 0,
                    0 and 1. The products are &minus;0.5 &times; 0, 0 &times; 0
                    and 0.5 &times; 1, which sum to 0.5. At column 3 the window
                    covers 2, 3 and 4, reading 0, 1 and 1, and the products are
                    &minus;0.5 &times; 0, 0 &times; 1 and 0.5 &times; 1, which
                    also sum to 0.5. At column 4 the window covers 3, 4 and 5,
                    all of them 1, and the products are &minus;0.5 and 0.5, which
                    cancel to 0.
                  </p>
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
                <p>
                  There is a fork here that looks like pedantry and is not.
                  Having laid the weights over the picture, we can multiply them
                  by the pixels in the order they are written, or we can turn the
                  weights end over end first and then multiply. The first is
                  called correlation and the second convolution. For a grid that
                  reads the same forwards as backwards the two agree exactly and
                  nobody ever notices the question. For the weights on this page
                  they do not agree, because these weights are negative on one
                  side and positive on the other, and reversing them swaps which.
                </p>
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
                  caption="Each three by three grid is the row weighting multiplied by the column weighting, so Sobel’s middle-left entry is 2 × −1, which is −2."
                />
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
                <p>
                  If the four barely disagree, the question is what Scharr&rsquo;s
                  three and ten was for. The answer needs an edge the scene does
                  not contain, because every boundary in it is drawn by arithmetic
                  and is one pixel wide, and a step one pixel wide is a case where
                  none of these estimates is any good. So the test is a straight
                  edge drawn at every angle from zero to eighty five degrees, and
                  drawn twice, once as a hard one-pixel step and once spread
                  across a couple of pixels, which is what a lens and a sensor do
                  to the boundary of a real object.
                </p>
                <OperatorGallery />
                <p>
                  On the spread edge the ordering is exactly the published one and
                  the gaps are large. The worst angle any of them reports across
                  the eighteen drawn angles is out by 4.13 degrees for the central
                  difference, 3.10 for Prewitt, 1.16 for Sobel and 0.28 for
                  Scharr, so Scharr&rsquo;s weights are four times steadier than
                  Sobel&rsquo;s and nearly fifteen times steadier than the bare
                  difference. Every one of them is exact at zero and at forty five
                  degrees, where the arrangement of pixels around the edge is
                  symmetric, and worst somewhere between fifteen and twenty five
                  degrees, and again at the mirror of that past forty five, since
                  the curve is symmetric about the diagonal.
                </p>
                <p>
                  On the hard one-pixel step none of that holds. Every operator is
                  out by more than nine degrees on average, Prewitt and Sobel come
                  out identical at 9.2367, and Scharr is the worst of the three at
                  10.8913, with a worst case of 27.01 against Sobel&rsquo;s 21.57.
                  That is the honest report and it is not a defect in Scharr. A
                  one-pixel step has no well-defined rate of change to estimate,
                  so the weights tuned to estimate one accurately have nothing to
                  be accurate about, and the fact that the workbench scene is
                  drawn that way is exactly why the diagonal bar showed so little
                  between them.
                </p>
                <InAModel>
                  <p>
                    The reason this matters more than it sounds is what usually
                    happens next. A description built from gradients throws the
                    sizes away and counts the directions, sorting them into bins a
                    few tens of degrees wide, so an angle out by four degrees will
                    sometimes fall in the wrong bin and an angle out by a third of
                    a degree will almost never do so. That is what buys the extra
                    arithmetic of three and ten over one and two, and it buys
                    nothing at all on a picture whose boundaries were drawn rather
                    than photographed.
                  </p>
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
                <p>
                  The timings underneath are a measurement of whichever machine
                  answered the request and move a little between runs, which is
                  why they are read live rather than written into this page. The
                  figure worth taking from them is the shape rather than any one
                  number, since the cost per pixel at the scene&rsquo;s size is roughly
                  double what it is on a picture a thousand pixels on a side,
                  because on a small picture most of the time goes on arranging
                  the sweep rather than on doing it. It also scales as the number
                  of pixels and not worse, so a picture with four times as many
                  pixels costs about four times as much, which is what made these
                  operators usable on the hardware they were invented on.
                </p>
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
          title: "Part 5. Two Answers Kept Together",
          content: (
            <>
              <SubSection title="18. A rate across and a rate down">
                <p>
                  Sweeping once answers how fast the brightness rises to the
                  right, and that alone is not an edge. A boundary running exactly
                  up and down is invisible to it in the vertical direction and a
                  boundary running exactly flat is invisible to it in the
                  horizontal one, which is why the vertical sweep of the six by
                  six picture answers zero everywhere while the horizontal sweep
                  answers 4 at two columns. So the same picture is swept twice,
                  with the same grid turned on its side for the second, and the
                  two answers are kept together.
                </p>
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
                <p>
                  Away from the border the flat parts of the scene answer 0.0511
                  rather than zero, because the scene carries the brightness ramp
                  from step 1, and that number is worth checking. The window spans
                  two columns either side of centre, so it sees twice the
                  ramp&rsquo;s 0.00638, and the positive weights add to 4, giving
                  2 &times; 0.00638 &times; 4 = 0.0511. Take the ramp away in the
                  playground and those same 1666 pixels answer 0.
                </p>
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
                <p>
                  That is not a quibble, because it says exactly when the estimate
                  is good. It is good when the scene changes slowly compared with
                  the spacing of the pixels, so that three neighbouring readings
                  really do lie near one smooth curve. It has nothing to say when
                  the scene changes faster than that, and a boundary between two
                  flat regions one pixel apart is the extreme case. Step 16
                  measured what that does. On an edge spread over a couple of
                  pixels the four operators report angles out by between 0.28 and
                  4.13 degrees, and on a one-pixel step the same four are out by
                  between 21.57 and 40.00.
                </p>
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
                <p>
                  So the faint half of a real boundary and the loud half of the
                  noise occupy the same range of sharpness, and no single number
                  keeps one and drops the other. The escape is to stop asking for
                  one number, which is what the work after 1980 did, and the two
                  usual moves are to use two thresholds and keep a weak pixel only
                  when it joins a strong one, and to smooth first at a chosen
                  scale so that the noise loses more than the boundary does. Both
                  are still choices with a cost; neither turns the overlap into a
                  separation.
                </p>
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
                <p>
                  Brightness changes where no object ends. The shadow a hand casts
                  on a table has a boundary as sharp as the hand does, and so does
                  the printed edge of a pattern on a shirt, and so does the line
                  where sunlight stops on a wall; a gradient operator reports all
                  of them at full strength, because at each of them the brightness
                  really is changing sharply, which is all it was ever asked. And
                  objects end where the brightness does not change. A grey cat on
                  a grey sofa has a real boundary along which the brightness is
                  the same on both sides, and the operator answers close to
                  nothing there, correctly and uselessly.
                </p>
                <p>
                  There is nothing in the estimate that could distinguish these,
                  because the distinction is not present in the numbers being
                  read. It needs something the operator does not have, which is
                  either a colour or a texture that does differ across the
                  boundary, or knowledge of what shape the thing is, or a second
                  view of the same scene from elsewhere. That is roughly the
                  history of the subject after this page, since everything else in this
                  section is a way of building something more informative on top
                  of these answers, and none of it repairs the gap between where
                  the brightness changes and where the object is.
                </p>
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
      ]}
    />
  );
}
