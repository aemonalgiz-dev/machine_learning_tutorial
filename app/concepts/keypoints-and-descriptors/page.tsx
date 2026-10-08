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
import { ApertureSlide } from "@/components/widgets/ApertureSlide";
import { DescriptorCard } from "@/components/widgets/DescriptorCard";
import { KeypointWorkbench } from "@/components/widgets/KeypointWorkbench";
import { MatchBoard } from "@/components/widgets/MatchBoard";
import { SceneLedger } from "@/components/widgets/SceneLedger";
import { SuppressionLadder } from "@/components/widgets/SuppressionLadder";
import { WhyACorner } from "@/components/widgets/WhyACorner";
import { WithoutCorners } from "@/components/widgets/WithoutCorners";

export const metadata: Metadata = {
  title: "Keypoints and Descriptors · oop_ml",
  description:
    "Two photographs may show the same scene from different positions. We need distinctive points we can recognise in both pictures and a numerical description that lets us compare their surroundings.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KeypointsAndDescriptorsPage() {
  return (
    <ConceptPage
      lessonId="keypoints-and-descriptors"
      intuition={lessonIntuitions["keypoints-and-descriptors"]}
      technicalStart="Part 3. Scoring A Corner"
      openingTitle="Find Places You Can Recognise Again"
      playgroundIntro="Compare the detected locations with their descriptors and proposed matches. Check whether a strong local match also makes sense in the two pictures."
      title="Keypoints and Descriptors"
      tagline={"Two photographs may show the same scene from different positions. We need distinctive points we can recognise in both pictures and a numerical description that lets us compare their surroundings."}
      prerequisites={
        <>
          Start with{" "}
          <Link href="/concepts/filters-and-edges" className={link}>
            filters and edges
          </Link>{" "}
          to see how a small filter measures brightness changes across a picture.
          Here we use those measurements to find distinctive locations, then
          describe the surrounding patches so we can compare two pictures.
        </>
      }

      playground={<KeypointWorkbench />}
      sections={[
        {
          title: "Part 1. Describing Less Of The Picture",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. What two photographs of one scene actually ask">
                <>
<p>
                  The scene above is 48 pixels on a side, and it holds a square, a disc, a diagonal bar, three copies of a small cross and a brightness ramp that makes the left side of it darker than the right. Photograph it twice, moving the camera a little between the two, and the question that matters is which position in the first picture is which position in the second.
                </p>
                <p>
                  Answering it by describing every position is the obvious plan. It is expensive, and the more serious trouble is that most of the descriptions it produces do not distinguish anything from anything.
                </p>
</>
                <p>
                  A five-wide patch fits at 1,936 of the scene&rsquo;s 2,304
                  pixels, so the obvious plan writes down 1,936 descriptions.
                  When I counted how many of those are distinct, only 815 were.
                  The remaining positions share a description with at least one
                  other position, 1,179 of them in all, and the largest group
                  that agree exactly runs to 86 positions. Those 86 cannot say
                  where they came from, however carefully they are compared,
                  because there is nothing to compare that differs.
                </p>
                <NumberTable
                  headings={["what was counted", "on the scene above"]}
                  rows={[
                    ["pixels", "2,304"],
                    ["positions a five-wide patch fits at", "1,936"],
                    ["descriptions that are distinct", "815"],
                    ["positions sharing theirs with another", "1,179"],
                    ["largest group agreeing exactly", "86"],
                  ]}
                  caption="Describing everything produces a great many descriptions that are not descriptions of anything in particular."
                />
                <KeepInMind>
                  The trouble with describing every position is not mainly that
                  there are many of them. It is that most of them are
                  indistinguishable from their neighbours, so the description is
                  a true statement about the brightness there and still says
                  nothing about where there is.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Most positions cannot say where they came from">
                <>
<p>
                  It is worth watching that happen rather than taking it. Put a bright square on dark ground, cut a five-wide patch from the middle of its left edge, and then slide a window down that edge one row at a time, measuring how far what the window sees is from the patch we cut. Five of the fifteen stops come out at a distance of exactly zero.
                </p>
                <p>
                  Not nearly zero; the same numbers in the same order. Slide the same window past the corner instead and exactly one stop matches, which is the corner itself.
                </p>
</>
                <ApertureSlide />
                <p>
                  This is the aperture problem, and the name is a good one. Look
                  at a long edge through a small hole and you can see when it
                  moves across itself and not when it moves along itself, so the
                  hole gives you one of the two numbers you wanted and there is
                  nothing to be done about the other. A corner shows through the
                  same hole as two edges at once, and moving it in any direction
                  changes what the hole sees.
                </p>
                <KeepInMind>
                  A position is worth describing exactly when moving a window
                  away from it, in any direction, changes what the window sees.
                  That is a property of the neighbourhood rather than of the
                  pixel, which is why everything that follows is about a window
                  and not about a point.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Find, describe, match">
                <p>
                  So the method has three stages and they are worth naming
                  before any of them is built. Score every position by how
                  firmly a window there is pinned, and keep the few best.
                  Describe what surrounds each of the kept ones, in a form that
                  does not move when the lighting does. Then match one
                  picture&rsquo;s descriptions against another&rsquo;s, keeping
                  only the matches that were not close calls. The rest of this
                  page is those three stages, in that order, and then what they
                  cost and where they stop.
                </p>
                <InAModel>
                  The first stage still reads the whole picture. Reporting a few
                  dozen places on a 48 by 48 scene means computing a score at
                  all 2,304 pixels, from one sweep for each gradient direction
                  and one more for each of three averaged products. What the
                  method saves is spent downstream, on the comparing, and Part 6
                  puts a number on it.
                </InAModel>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. What Makes A Position Findable",
          content: (
            <>
              <SubSection title="4. Move the window and see what changes">
                <p>
                  Take the square again and look at three positions on it, one
                  corner, one point in the middle of an edge four pixels clear
                  of any corner, and one patch of empty ground. At each of them,
                  draw the nine gradient vectors inside a three by three window,
                  each arrow pointing the way brightness rises there and as long
                  as brightness rises fast. The three drawings are the whole
                  argument of this part, and they say it before any arithmetic
                  does.
                </p>
                <WhyACorner show="probes" />
                <p>
                  On flat ground there are no arrows. Along the edge every arrow
                  points the same way, to the right, because that is the only
                  direction in which anything is changing. At the corner some
                  arrows point right and some point down. What separates the
                  three is how many directions the change comes in, which is a
                  statement about the spread of the arrows rather than about
                  their length, and the middle drawing has arrows quite as long
                  as the corner&rsquo;s.
                </p>
                <KeepInMind>
                  Flat ground, an edge and a corner differ in the number of
                  directions the brightness changes in, which is zero, one and
                  two. Everything the rest of this page does is a way of
                  measuring that number without ever counting anything.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Three averaged products hold all of it">
                <p>
                  A spread of directions is awkward to hold, and it turns out
                  that three numbers hold it exactly. Square the across
                  gradient, square the down gradient, multiply the two together,
                  and average each of the three over the window. Those three
                  averages arrange themselves as a small symmetric matrix, one
                  per pixel, and every corner measure ever proposed reads that
                  matrix and nothing else.
                </p>
                <Equation>
                  {`across energy  =  average over the window of ( across × across )
shared term    =  average over the window of ( across × down )
down energy    =  average over the window of ( down × down )

                 [  across energy    shared term  ]
    the matrix = [                                ]
                 [  shared term      down energy  ]`}
                </Equation>
                <WorkedExample>
                  <p>
                    At the square&rsquo;s top-left corner, with a three-wide
                    window and the usual centre-weighted gradient estimate, the
                    across energy is 5.777778, the down energy is 5.777778 and
                    the shared term is 1.777778. In the middle of the left edge
                    the across energy is 10.666667, the down energy is 0.0 and
                    the shared term is 0.0, since nothing at all is changing
                    downward there. On empty ground all three are 0.0.
                  </p>
                  <p>
                    Those figures come from the nine gradients inside the
                    window. At the corner they are these, read along the
                    window&rsquo;s own three rows.
                  </p>
                  <NumberTable
                    headings={["window row", "across gradients", "down gradients"]}
                    rows={[
                      ["top", "1, 1, 0", "1, 3, 4"],
                      ["middle", "3, 3, 0", "1, 3, 4"],
                      ["bottom", "4, 4, 0", "0, 0, 0"],
                    ]}
                  />
                  <Equation>{"across energy  =  (1² + 1² + 3² + 3² + 4² + 4²) / 9  =  52 / 9  ≈  5.777778\ndown energy    =  (1² + 3² + 4² + 1² + 3² + 4²) / 9  =  52 / 9  ≈  5.777778\nshared term    =  (1×1 + 1×3 + 3×1 + 3×3) / 9      =  16 / 9  ≈  1.777778"}</Equation>
                  <p>
                    The shared term is not zero because four of the nine
                    positions have brightness rising both across and down at
                    once. In the middle of the edge, six of the nine gradients
                    are 4 across and nothing down, and the other three are
                    zero, so there is no position where the two multiply to
                    anything.
                  </p>
                  <Equation>{"across energy  =  (6 × 4²) / 9  =  96 / 9  ≈  10.666667\ndown energy    =  0\nshared term    =  0"}</Equation>
                </WorkedExample>
                <KeepInMind>
                  The averaging is over a window, so this is a description of a
                  neighbourhood. The three numbers are not properties of a pixel
                  and would say nothing if they were.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Without the averaging there are no corners at all">
                <p>
                  That last point is easy to read as a smoothing step, a
                  tidying-up applied to numbers that would have worked anyway,
                  and it is not. Take the window down to a single pixel and the
                  matrix at every position becomes one gradient vector
                  multiplied by itself, which describes one direction because
                  one vector is all it was given. Any score that asks for two
                  directions is then zero everywhere by construction. Scored
                  that way, the square has no corners, and neither has any
                  other picture.
                </p>
                <WhyACorner show="window" />
                <p>
                  The second row of that drawing is the honest answer, four
                  places on a picture with four corners. The first row is a
                  one-pixel window, which finds nothing anywhere. The rows below
                  are wider windows, which is a different failure and is the
                  subject of Part 7.
                </p>
                <KeepInMind>
                  Averaging over a neighbourhood is the only reason a matrix
                  built from gradients can describe two directions at once, so
                  the window is doing the work that the word corner is standing
                  for. A quantity computed at a single pixel cannot distinguish
                  a corner from anything.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Two numbers settle a two by two symmetric matrix">
                <p>
                  A symmetric matrix of this size is completely described by two
                  numbers, its trace and its determinant, and its eigenvalues
                  follow from those two by the quadratic formula. That is worth
                  saying because no measure below ever computes an eigenvalue as
                  such. Every score on this page is read off the same two
                  pictures, one holding a sum and one holding a difference of
                  products.
                </p>
                <Equation>
                  {`trace        =  across energy + down energy

determinant  =  across energy × down energy − shared term × shared term

eigenvalues  =  ( trace ± √( trace² − 4 × determinant ) ) / 2`}
                </Equation>
                <p>
                  The trace is the total amount of change in the window,
                  whatever direction it is in, and the page calls it the total
                  energy from here on. The determinant is the product of the two
                  eigenvalues, so it is large only when both of them are, and
                  the page calls it the shape term, since knowing about shape is
                  the whole of what it adds. The next part is what happens when
                  each of the two is asked to find a corner.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Scoring A Corner",
          content: (
            <>
              <SubSection title="8. The energy cannot tell a corner from an edge">
                <p>
                  Start with the trace, since it is the obvious candidate and
                  the one most people reach for. It is the total gradient energy
                  in the window, so it is zero on flat ground and large wherever
                  brightness is changing. On the square it reads 11.555556 at
                  the corner and 10.666667 in the middle of the edge, which are
                  the numbers from the worked example above added up.
                </p>
                <NumberTable
                  headings={["position", "total energy", "share of the corner"]}
                  rows={[
                    ["a corner", "11.555556", "1.000000"],
                    ["the middle of an edge", "10.666667", "0.923077"],
                    ["flat ground", "0.000000", "0.000000"],
                  ]}
                  caption="The energy separates the square from its background by everything and a corner from an edge by 8%."
                />
                <p>
                  A corner beats an edge by a factor of 1.083333. On this
                  square, which is as clean as a picture gets, a threshold
                  anywhere between 10.666667 and 11.555556 does separate the two,
                  and that gap is the whole of what the energy has to offer. The
                  energy grows with the square of the contrast, so an edge with
                  five per cent more contrast than this one already outscores
                  the corner, and the ordering holds only while every edge in
                  the picture is as sharp as every other.
                </p>
              </SubSection>

              <SubSection title="9. Along a straight edge the shape term is exactly zero">
                <p>
                  Now the determinant, and here the numbers stop being close.
                  The corner reads 30.222222. The middle of the edge reads 0.0,
                  and it is worth being careful about what kind of zero that is.
                  It is not a small number that rounding could have moved; it is
                  zero because of what the matrix is.
                </p>
                <WhyThisWorks>
                  <>
<p>
                    Every gradient inside a window straddling a straight edge points the same way, as the arrows in step 4 show. So each of the nine outer products being averaged is a multiple of the same one, and the average is a multiple of it too, which makes the matrix exactly rank one. A rank one matrix has a zero eigenvalue, and the determinant is the product of the eigenvalues, so the determinant is exactly zero.
                  </p>
                  <p>
                    Nothing about the length of the edge, the sharpness of the step or the width of the window changes that.
                  </p>
</>
                </WhyThisWorks>
                <p>
                  Flat ground gives zero for a duller reason, which is that all
                  three averages are zero there. So the determinant reads 0.0 at
                  the edge and 0.0 on flat ground, and the number it gives at
                  the corner is more than thirty times either.
                </p>
              </SubSection>

              <SubSection title="10. The ordering everybody quotes does not exist">
                <p>
                  Put those two together and the smaller eigenvalue falls out.
                  It is the direct answer to the question the method asked,
                  since a window is pinned in both directions exactly as far as
                  the weaker of the two directions is pinned. On the square it
                  reads exactly 4.0 at each of the four corners, exactly 0.0
                  along each of the four edges, and exactly 0.0 on the ground
                  outside and inside.
                </p>
                <WorkedExample title="The corner, through the formulas of step 7">
                  <Equation>{"trace        =  5.777778 + 5.777778  =  11.555556\ndeterminant  =  5.777778 × 5.777778 − 1.777778 × 1.777778  ≈  30.222222\n\ntrace² − 4 × determinant  ≈  133.530864 − 120.888889  =  12.641975\n√12.641975  ≈  3.555556\n\nsmaller eigenvalue  =  (11.555556 − 3.555556) / 2  =  4.0\nlarger eigenvalue   =  (11.555556 + 3.555556) / 2  ≈  7.555556"}</Equation>
                  <p>
                    Along the edge the determinant is zero, so the square root
                    is the trace itself and the subtraction leaves nothing.
                  </p>
                  <Equation>{"smaller eigenvalue  =  (10.666667 − √(10.666667² − 4 × 0)) / 2  =  0\nlarger eigenvalue   =  (10.666667 + 10.666667) / 2  =  10.666667"}</Equation>
                  <p>
                    The edge&rsquo;s larger eigenvalue is its whole energy. All
                    of the change in that window is in one direction, and the
                    other direction is left with exactly none.
                  </p>
                </WorkedExample>
                <NumberTable
                  headings={[
                    "position",
                    "total energy",
                    "shape term",
                    "smaller eigenvalue",
                    "Harris score",
                  ]}
                  rows={[
                    ["a corner", "11.555556", "30.222222", "4.000000", "24.880988"],
                    [
                      "the middle of an edge",
                      "10.666667",
                      "0.000000",
                      "0.000000",
                      "−4.551111",
                    ],
                    ["flat ground", "0.000000", "0.000000", "0.000000", "0.000000"],
                  ]}
                  caption="The three positions of the square, read four ways. Only the first column has an edge anywhere between a corner and empty ground."
                />
                <p>
                  I had expected a middling number in the middle row and there
                  is not one, and that is the most interesting thing on this
                  page. An edge is not partway between a corner and empty ground.
                  It scores what empty ground scores, because it is exactly as
                  unlocatable along its own length as empty ground is in every
                  direction, and a measure that ranked it higher would be
                  putting keypoints precisely where a keypoint cannot be
                  pinned.
                </p>
                <KeepInMind>
                  Corners high, edges middling, flat ground low is a true
                  statement about the total energy and a false one about every
                  corner measure. Reading the energy is how a detector ends up
                  covering an edge in keypoints that no second photograph can
                  match.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Harris, and an edge below empty ground">
                <p>
                  Harris and Stephens wanted the same answer without the square
                  root, and the score they wrote down subtracts a multiple of
                  the squared energy from the shape term. It is large and
                  positive where both directions change, near zero where nothing
                  does, and negative where exactly one direction changes.
                </p>
                <Equation>
                  {`Harris score  =  determinant − sensitivity × trace²`}
                </Equation>
                <p>
                  On the square that is 24.880988 at the corner, 0.0 on flat
                  ground and −4.551111 along the edge, so an edge scores below
                  empty ground rather than above it. The subtracted term has
                  nothing to bite on where the energy is zero and a great deal
                  to bite on along an edge. Both measures are saying the same
                  thing in their own words, and neither of them puts an edge
                  above the ground.
                </p>
                <p>
                  Those three figures use a sensitivity of 0.04, and each is
                  one subtraction from numbers already worked above.
                </p>
                <Equation>{"corner  =  30.222222 − 0.04 × 11.555556²  ≈  30.222222 − 5.341235  ≈  24.880988\nedge    =  0 − 0.04 × 10.666667²          ≈  −4.551111\nground  =  0 − 0.04 × 0²                  =  0"}</Equation>
                <p>
                  The sensitivity is the awkward part. It is a number with no
                  principled value, and the guidance in the literature amounts
                  to somewhere between 0.04 and 0.06. It also has a ceiling that
                  is a fact rather than a convention. The determinant of a real
                  symmetric matrix is at most a quarter of its squared trace, so
                  from a sensitivity of a quarter upward the score cannot be
                  positive anywhere, whatever the picture holds. Just below
                  that, at 0.24, the square&rsquo;s own corners read −1.825185
                  and nothing is found at all.
                </p>
                <WhyThisWorks>
                  <p>
                    For the two eigenvalues, the trace is their sum and the
                    determinant their product, and the product of two numbers is
                    at most the square of their average. So the determinant is
                    at most trace² / 4 and the Harris score is at most trace² ×
                    (0.25 − sensitivity), which is zero or below the moment the
                    sensitivity reaches a quarter.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The smaller eigenvalue takes no parameter and is in the units
                  of a squared gradient, so a threshold on it means the same
                  thing on two different pictures. The Harris score is a squared
                  gradient to the fourth power, so its numbers do not carry from
                  one picture to another, and the sensitivity is a dial nobody
                  can set for you.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. One corner, one place">
                <p>
                  A corner is a few pixels across and the window is three pixels
                  wide, so the score around a corner is a blob rather than a
                  spike. On the square, 32 pixels score above a threshold of
                  0.5, which is four corners reported eight times each. The
                  repair is to work downward from the strongest score and refuse
                  any later candidate lying within a few pixels of one already
                  taken, and because it works downward, anything kept was the
                  strongest thing within its own radius without a second pass
                  being needed to check.
                </p>
                <SuppressionLadder show="separation" />
                <p>
                  On the square, a separation of two takes 32 answers to 4, and
                  so does every larger separation up to seven. On the workbench
                  scene, 457 pixels score above 0.05 and the same rule takes
                  that to 446 at a separation of one, 101 at two, 47 at three
                  and 16 at seven. Nine tenths of what the scoring stage
                  produces on this scene is the blob around a place rather than
                  a place, so the suppression is carrying most of the work of
                  turning a picture into a short list.
                </p>
              </SubSection>

              <SubSection title="13. Excluding a corner must not promote its neighbour">
                <p>
                  There is one more rule, and it is the one that hides a bug.
                  A description is a patch cut around a place, so a place too
                  near the frame has no patch to cut, and those places have to
                  be left out. The obvious way to write that is to drop them
                  from the candidates before the suppression runs, and the
                  obvious way is wrong.
                </p>
                <SuppressionLadder show="border" />
                <>
<p>
                  Dropping a candidate first means the corner inside the border never gets to suppress anything, so the pixel on its shoulder survives and is reported in its place. On a square whose corners sit two pixels from the frame, at a border of three, that answers four places rather than one, three of them a single pixel off, scoring 3.5556 where the corners they stand beside score 4.0.
                </p>
                <p>
                  The count looks right, the strengths look plausible, and every position is wrong. The rule that works is to let a place inside the border suppress its own neighbourhood and then decline to report it.
                </p>
</>
                <KeepInMind>
                  A threshold on the score can be applied on either side of the
                  suppression, since a candidate too weak to be kept could not
                  have suppressed anything a stronger one did not. A border
                  cannot, because the place it excludes is the strongest thing in
                  its own neighbourhood, and excluding it early hands that
                  neighbourhood to the second strongest.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "A five-wide patch fits at 1,936 positions of the scene, so describing every position gives 1,936 descriptions that can be told apart.",
              false,
              "Only 815 of them are distinct. The other 1,179 positions share a description with at least one other, and the largest group that agree exactly runs to 86 positions, which cannot say where they came from however carefully they are compared. The trouble is not mainly how many positions there are, it is that most of them are indistinguishable from their neighbours.",
            ),
            trueFalse(
              "With the averaging window taken down to a single pixel, a score that asks for two directions is zero at every position, so the square has no corners at all.",
              true,
              "At one pixel the matrix is a single gradient vector multiplied by itself, which describes one direction because one vector is all it was given. The averaging is not a tidying-up of numbers that would have worked anyway. At the corner it is what puts gradients pointing across and gradients pointing down into the same three averages, which is where the shared term of 1.777778 and the determinant of 30.222222 come from.",
            ),
            choice(
              "On the square, the smaller eigenvalue reads exactly 4.0 at each corner and exactly 0.0 both along the edges and on the flat ground. What is that saying?",
              [
                "An edge is exactly as unlocatable along its own length as empty ground is in every direction",
                "An edge is partway between a corner and empty ground, and rounding hid the middling value",
                "The window was too narrow to register the edge",
                "The measure is only defined at corners",
              ],
              0,
              "There is no middling number in the middle row, and a measure that ranked an edge higher would be putting keypoints precisely where a keypoint cannot be pinned. Corners high, edges middling, flat ground low is a true statement about the total energy, which reads 11.555556 at the corner and 10.666667 at the edge, and a false one about every corner measure.",
            ),
            several(
              "Which of these hold for the Harris score and its sensitivity?",
              [
                "On the square it reads −4.551111 along the edge and 0.0 on flat ground, so an edge scores below empty ground",
                "From a sensitivity of a quarter upward the score cannot be positive anywhere, whatever the picture holds",
                "Its numbers carry from one picture to another, since it avoids the square root",
                "The sensitivity has one principled value, which the mathematics supplies",
              ],
              [0, 1],
              "The subtracted term has nothing to bite on where the energy is zero and 0.04 × 10.666667² to bite on along the edge. The determinant of a real symmetric matrix is at most a quarter of its squared trace, which makes the ceiling a fact rather than a convention. The other two fail. The score is a squared gradient to the fourth power, so its numbers do not carry between pictures, and the sensitivity has no principled value, only guidance of somewhere between 0.04 and 0.06.",
            ),
            choice(
              "A place too near the frame has no patch to cut, so it cannot be reported. What goes wrong if those candidates are dropped before the suppression runs?",
              [
                "The corner inside the border never suppresses anything, so the pixel on its shoulder survives and is reported in its place",
                "Nothing, since a candidate inside the border could not have been kept anyway",
                "The separation has to be widened to compensate",
                "The count of places comes out too low",
              ],
              0,
              "On a square whose corners sit two pixels from the frame, at a border of three, three of the answers are a single pixel off, scoring 3.5556 beside corners that score 4.0. The count looks right, the strengths look plausible and every position is wrong. A threshold can go on either side of the suppression, because a candidate too weak to be kept could not have suppressed anything a stronger one did not.",
            ),
        ],
        },
        {
          title: "Part 4. Describing What Surrounds A Place",
          content: (
            <>
              <SubSection title="14. A position is not something to match on">
                <p>
                  We now have a short list of places, and the list on its own is
                  worth very little. The whole reason for finding them was that
                  two photographs of one scene put the same corner at different
                  positions, so the position is the thing being solved for and
                  cannot be the thing that is matched. What travels between two
                  photographs is what surrounds the corner.
                </p>
                <p>
                  So the description is the square of brightness around the
                  place. Five pixels on a side, which is twenty-five numbers,
                  read row by row. Left there it would be useless, because
                  turning a lamp up adds to every one of those numbers and
                  moving a lamp closer multiplies them, and neither of those
                  changes anything about the scene.
                </p>
              </SubSection>

              <SubSection title="15. Take out the mean, divide out the length">
                <p>
                  Two steps repair both. Subtract the patch&rsquo;s own mean
                  from every one of its numbers, which removes anything that was
                  added to all of them. Then divide by the length of what is
                  left, which removes anything that multiplied all of them. What
                  remains is a direction rather than a quantity, and two of them
                  can be compared by the straight-line distance between them, a
                  distance running from zero for two identical patches to two
                  for a patch against its own exact opposite.
                </p>
                <Equation>
                  {`centred      =  patch − mean of patch

description  =  centred / length of centred

distance     =  length of ( one description − the other )`}
                </Equation>
                <DescriptorCard show="patch" />
                <WorkedExample>
                  <>
                    <p>
                      The patch contains nine bright pixels with value one and sixteen
                      background pixels with value zero. Find its mean, subtract it,
                      then compute the length of the centred vector.
                    </p>
                    <Equation>{"mean = 9 / 25 = 0.36\ncentred bright pixel = 1 − 0.36 = 0.64\ncentred background pixel = 0 − 0.36 = −0.36\nsquared length = 9 × 0.64² + 16 × (−0.36)² = 5.76\nlength = √5.76 = 2.4"}</Equation>
                    <p>
                      Divide every centred value by that length.
                    </p>
                    <Equation>{"bright entry = 0.64 / 2.4 ≈ 0.266667\nbackground entry = −0.36 / 2.4 = −0.15"}</Equation>
                    <p>
                      The nine bright entries and sixteen background entries, kept in
                      pixel order, form the descriptor.
                    </p>
                  </>
                </WorkedExample>
              </SubSection>

              <SubSection title="16. What the two steps buy, measured">
                <>
<p>
                  It is worth checking that they buy what they promise rather than assuming it. Add ten to every pixel of the picture and the description of that same corner moves by 1.2 × 10⁻¹⁵. Multiply every pixel by three and it moves by 2.0 × 10⁻¹⁶. I expected both of those to be exactly zero and they are not, because the subtraction and the division are done in floating point and their last bits do not always land where the algebra says.
                </p>
                <p>
                  On a scale whose maximum is 2, moving by 10⁻¹⁵ is nothing, but it is rounding rather than identity and the difference is worth stating.
                </p>
</>
                <DescriptorCard show="distances" />
                <>
<p>
                  The other rows of that drawing are the ones that give the scale its meaning. Two different corners of the same square sit 1.443376 apart. A corner against its own picture with the brightness reversed sits at 2.0, the furthest two descriptions can be. And two patches of flat ground, one outside the square and one inside it, sit at exactly 0.0 from each other, because neither has any variation to normalise and both come back as twenty-five zeros.
                </p>
                <p>
                  That last row is the aperture problem again, now in the description rather than in the score.
                </p>
</>
                <WorkedExample title="Where 1.443376 comes from">
                  <p>
                    The top-left corner&rsquo;s patch is bright in its lower
                    right nine pixels and the top-right corner&rsquo;s patch is
                    bright in its lower left nine. Three bright pixels are
                    shared, so twelve of the twenty-five entries hold a bright
                    value in one description and a background value in the
                    other, and the remaining thirteen agree.
                  </p>
                  <Equation>{"gap in one differing entry  =  0.266667 − (−0.15)  =  0.416667\ndistance  =  √(12 × 0.416667²)  ≈  1.443376"}</Equation>
                  <p>
                    Reversing the brightness flips the sign of every entry, so
                    each one moves by twice its own size and the distance is
                    twice the description&rsquo;s length of one.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A flat patch has no length to divide by, so its description
                  does not exist and the convention is to answer zeros. Every
                  such answer is zero distance from every other, so a flat patch
                  matches all flat patches equally well, which is exactly why
                  places are hunted at corners.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The places belong to the scene, the descriptions to the frame">
                <>
<p>
                  Two claims are worth separating here, because they come out differently and the difference is what this kind of description can and cannot promise. Shift the whole picture down two rows and right three columns. Every place moves by exactly that much, every strength is identical to the last bit, and every description is at distance exactly 0.0 from where it was.
                </p>
                <p>
                  Now increase contrast and brightness while keeping the same
                  scene. The strength scores change under this transformation,
                  while the normalized descriptions remain nearly unchanged.
                </p>
                <Equation>{"New pixel value = (1.6 × original pixel value) + 0.15\nStrength multiplier = 1.6² = 2.56"}</Equation>
                <p>The largest change to a description is approximately
                  1.2 × 10⁻¹⁵, within floating-point rounding for this experiment.</p>
</>
                <SceneLedger show="lighting" />
                <>
<p>
                  Now turn the picture a quarter circle, which is the one rotation that needs no interpolation, so nothing that follows can be blamed on resampling. All 47 places land exactly where the coordinate map says they should, with strengths that agree to the last bit, because the trace and the determinant do not care how the axes are labelled and a square window is unchanged by a quarter turn.
                </p>
                <p>
                  The descriptions do not survive it at all. On the square, all four corners end up 1.443376 from their own turned selves, which is precisely the distance between that square&rsquo;s top-left corner and its top-right one. On the workbench scene, where the brightness ramp makes no two corners quite alike, the corresponding pairs come out between 0.052724 and 1.545328 apart, and not one of them at zero.
                </p>
</>
                <KeepInMind>
                  After a quarter turn this description does not recognise a
                  corner as itself. It recognises it as a different corner,
                  which is worse than failing to match, because it is a match
                  that will be believed. Nothing here assigns an orientation,
                  and Part 7 says what it would take.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Matching Two Lists",
          content: (
            <>
              <SubSection title="18. The nearest description, and why its distance says nothing">
                <p>
                  Two pictures are now two short lists of descriptions, and
                  matching them is the obvious search. For each description in
                  the first list, find the nearest in the second. The nearest
                  always exists, whatever the two pictures are of, so the search
                  answers even when it should not, and the only defence is to
                  ask whether the answer means anything.
                </p>
                <p>
                  Asking whether the winner is near is the first thing anybody
                  tries and it does not work. How near is near depends on the
                  contrast of the pictures, the amount of noise in them and the
                  size of the patch, and a threshold tuned on one pair is wrong
                  on the next. There is no number to put there that carries.
                </p>
              </SubSection>

              <SubSection title="19. Ask instead whether the nearest is much nearer">
                <p>
                  Lowe&rsquo;s rule replaces that question with one that needs
                  no units. Compare the nearest against the second nearest. A
                  place that is genuinely distinctive leaves its runner-up far
                  behind; a place that is one of many similar ones has a
                  runner-up right behind it, and the ratio of the two distances
                  says which of those we are in without ever naming a scale.
                </p>
                <Equation>
                  {`ratio  =  distance to the nearest / distance to the second nearest`}
                </Equation>
                <MatchBoard />
                <>
<p>
                  Three arrangements, on the three buttons above. One square photographed twice, moved down four rows and right five columns, gives four matches, each at a distance of exactly 0.0 against a runner-up at 1.443376, so each ratio is 0.0 and each winner is the corner that moved by the known shift. The same square searched for in a picture holding two identical copies of it gives four matches at a distance of 0.0 against a runner-up also at 0.0, which is a ratio of 1.0 and is refused.
                </p>
                <p>
                  Laying a faint ripple over that second picture breaks the exact tie, and the ratios become numbers the arithmetic computed rather than a convention, 0.980729 for the first of them, which is still refused.
                </p>
</>
                <KeepInMind>
                  Refusing all four matches on the twin squares is the right
                  answer rather than a failure. Both copies are equally good
                  answers, so any single answer would be one of two
                  indistinguishable places picked at random, and declining is
                  the only honest thing left.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Two equally good answers, and a zero over a zero">
                <p>
                  The twin squares raise a case the formula cannot evaluate.
                  Both candidates sit at distance exactly zero, so the ratio is
                  a zero divided by a zero and there is no value it takes. It
                  has to be decided rather than derived, and the decision that
                  agrees with what the number means is one, since one is what
                  the ratio says when the runner-up is exactly as good as the
                  winner.
                </p>
                <p>
                  Any other choice does damage. Answering zero would give the
                  most ambiguous case the score reserved for the most
                  distinctive one, so every duplicated shape in a picture would
                  come back as a confident match. That case is not exotic, since
                  a brick wall, a window grid and a keyboard are all made of it.
                </p>
              </SubSection>

              <SubSection title="21. The whole method on the shared scene, and six matches it should have refused">
                <p>
                  Run all three stages on the workbench scene against its relit
                  self, which is the easiest test the method will ever be given,
                  since the two pictures are the same scene under a lamp that
                  has been turned up. The detector finds 47 places in each. The
                  ratio test keeps 32 of the 47 matches and refuses 15, and all
                  15 of the refusals sit on the three identical crosses, which
                  are the one piece of repeated structure in the scene and are
                  correctly declined.
                </p>
                <SceneLedger show="strays" />
                <p>
                  Of the 32 it kept, only 26 landed on the position they came
                  from. The other six landed on a corner of a different cross,
                  and the table says why. Every description in this run agrees
                  with its true partner at the level of rounding, so the
                  winner&rsquo;s distance is around 1.6 × 10⁻¹⁶ and the
                  runner-up&rsquo;s is around 2.5 × 10⁻¹⁶, and the ratio of two
                  rounding errors is a number that can land anywhere. Here it
                  landed between 0.5726 and 0.7219, comfortably under the
                  threshold, and six coincidences were reported as matches.
                </p>
                <KeepInMind>
                  The ratio test refuses a tie it can see. It cannot refuse a
                  tie that has been broken below the last bit of a number, and
                  on a scene with repeated structure and no noise that is what
                  most of the ties are. The lowest ratio it refused in this run
                  was 0.824163, so the two populations were not far apart to
                  begin with.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "What do the two steps applied to a raw patch repair?",
              [
                "Subtracting the patch’s mean removes anything added to every pixel, and dividing by the length removes anything that multiplied them",
                "Subtracting the mean removes rotation and dividing by the length removes scale",
                "They make the twenty-five numbers sum to one",
                "They turn the patch from a direction into a quantity",
              ],
              0,
              "Turning a lamp up adds to every number and moving a lamp closer multiplies them, and neither changes anything about the scene. What is left is a direction rather than a quantity, and two of them compare by a straight-line distance running from zero for identical patches to two for a patch against its own exact opposite.",
            ),
            choice(
              "On the twin squares both candidates sit at a distance of exactly zero, so the ratio is a zero divided by a zero. What value is it given, and why?",
              [
                "One, since that is what the ratio says when the runner-up is exactly as good as the winner",
                "Zero, since the winner’s distance is zero",
                "Whatever the arithmetic returns, since a convention would be an invention",
                "The value of the threshold itself, so the match sits exactly on the line",
              ],
              0,
              "The formula has no value there, so it has to be decided rather than derived. Answering zero would give the most ambiguous case the score reserved for the most distinctive one, and every duplicated shape in a picture would come back as a confident match. At one, all four matches on the twin squares are refused, which is the right answer when both copies are equally good.",
            ),
            choice(
              "Two patches of flat ground, one outside the square and one inside it, sit at exactly 0.0 from each other. Why?",
              [
                "Neither has any variation to normalise, so both come back as twenty-five zeros and every such answer matches every other equally well",
                "They happen to share a mean brightness",
                "The distance is clipped below at zero",
                "Flat patches are left out of the descriptor stage",
              ],
              0,
              "A flat patch has no length to divide by, so its description does not exist and the convention is to answer zeros. That is the aperture problem again, now in the description rather than in the score, and it is exactly why places are hunted at corners.",
            ),
            trueFalse(
              "After a quarter turn the description recognises a corner as a different corner rather than failing to match it.",
              true,
              "On the square all four corners end up 1.443376 from their own turned selves, which is precisely the distance between that square’s top-left corner and its top-right one, twelve entries each out by 0.416667. That is worse than failing, because it is a match that will be believed. The places and the strengths do survive the turn exactly, since the trace and the determinant do not care how the axes are labelled.",
            ),
            several(
              "Which of these hold for the ratio test on the workbench scene against its relit self?",
              [
                "It kept 32 of the 47 matches and refused 15, every one of the refusals sitting on the three identical crosses",
                "Of the 32 it kept, only 26 landed on the position they came from",
                "The six that went wrong had ratios above the threshold and were reported anyway",
                "Those six came from the ratio of two rounding errors, a winner near 1.6 × 10⁻¹⁶ against a runner-up near 2.5 × 10⁻¹⁶",
              ],
              [0, 1, 3],
              "Their ratios landed between 0.5726 and 0.7219, comfortably under the threshold, so nothing flagged them. The test refuses a tie it can see and cannot refuse a tie broken below the last bit of a number, which on a scene with repeated structure and no noise is what most of the ties are. The lowest ratio it did refuse in that run was 0.824163.",
            ),
        ],
        },
        {
          title: "Part 6. What It Costs, And Where It Is Worse",
          content: (
            <>
              <SubSection title="22. What the method costs">
                <p>
                  The saving is downstream and it is worth being exact about
                  where. Finding the places costs a full pass over the picture
                  whatever happens, since a score has to be computed at every
                  one of the 2,304 pixels before the strongest few can be
                  chosen, and that is one sweep per gradient direction plus one
                  per averaged product. Nothing about keeping 47 answers makes
                  that stage cheaper.
                </p>
                <SceneLedger show="cost" />
                <p>
                  What changes is everything after it. Describing every position
                  of this scene is 48,400 numbers and describing the 47 places
                  is 1,175, a factor of 41. Comparing every position of one
                  picture against every position of another is 3,748,096
                  comparisons and comparing the places is 2,209, a factor of
                  1,697.
                </p>
                <Equation>{"numbers, every position   =  1,936 positions × 25  =  48,400\nnumbers, the places       =  47 places × 25       =  1,175\n\ncomparisons, every position  =  1,936 × 1,936  =  3,748,096\ncomparisons, the places      =  47 × 47        =  2,209"}</Equation>
                <p>
                  A description is twenty-five numbers wherever it is cut, so
                  the first saving is just the shorter list. The second is the
                  shorter list squared, because every description of one
                  picture is compared against every description of the other.
                  The two timings in the drawing were measured when this
                  page loaded and will differ from machine to machine, but the
                  counts will not, and the counts are where the argument is.
                </p>
                <InAModel>
                  The factor grows with the picture. The number of positions is
                  roughly the number of pixels and the number of comparisons is
                  its square, while the number of places follows how much
                  structure the scene holds rather than how finely it was
                  sampled. Photographing the same room at four times the width
                  costs sixteen times as many descriptions and two hundred and
                  fifty-six times as many comparisons the dense way, and leaves
                  the count of places where it was.
                </InAModel>
              </SubSection>

              <SubSection title="23. Where looking at everything wins">
                <p>
                  There is a picture on which the obvious plan beats this one
                  outright, and it is not a contrived one. Photograph a horizon,
                  then photograph it again with the camera three rows lower. The
                  corner score is exactly 0.0 at every pixel of both, so the
                  method finds nothing, describes nothing and matches nothing,
                  and it is right to, since there is no corner anywhere in
                  either picture.
                </p>
                <WithoutCorners />
                <>
<p>
                  Describing every position instead does answer. A five-wide patch fits at 289 positions, of which 221 are flat and indistinguishable, and the 68 that straddle the edge each find their partner in the second photograph at a distance of exactly 0.0 and exactly three rows lower. The vertical move is recovered perfectly by the plan this whole page replaced.
                </p>
                <p>
                  The horizontal move would not be, since every position along the edge looks like every other, so the dense plan has the same aperture problem; it simply does not throw away the one direction it can still see.
                </p>
</>
                <KeepInMind>
                  This method answers nothing on a scene with no corners, and a
                  scene with no corners is common. A horizon, a wall, a sheet of
                  paper and a clear sky are all of them, and on those the honest
                  report is that the method declined rather than that the scene
                  had nothing in it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where The Method Stops Being Defined",
          content: (
            <>
              <SubSection title="24. Six choices the method does not make for you">
                <p>
                  Everything above needed six numbers that no part of the
                  mathematics supplies. The width of the averaging window, the
                  threshold on the score, the separation between two kept
                  places, the border, the side of the patch, and the ratio a
                  match must beat. Each of them is a decision about what counts
                  as a corner rather than a setting that could in principle be
                  derived.
                </p>
                <p>
                  The window is the one that bites hardest, because it changes
                  the answer rather than trimming it. Widening it on the square
                  from three pixels to nine takes the score at the top-left
                  corner from 4.0 down to 1.62963, and takes the number of
                  places kept from 4 up to 25, on a picture that has four
                  corners. At nine pixels the window is large enough that two
                  different corners share one, so what the extra twenty-one
                  answers report is the overlap between corners rather than a
                  corner.
                </p>
                <NumberTable
                  headings={[
                    "window",
                    "score at the corner",
                    "places kept on a four-cornered picture",
                  ]}
                  rows={[
                    ["1 by 1", "0.000000", "0"],
                    ["3 by 3", "4.000000", "4"],
                    ["5 by 5", "2.720000", "12"],
                    ["7 by 7", "2.040816", "16"],
                    ["9 by 9", "1.629630", "25"],
                  ]}
                  caption="The averaging window decides what a corner is. Only one row of this table answers the question that was asked."
                />
                <KeepInMind>
                  Reporting a number of keypoints without the window, the
                  threshold and the separation that produced it says almost
                  nothing, since the same picture answers 0, 4, 12, 16 or 25
                  depending on the first of those alone.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. What a description of this kind never claims">
                <p>
                  Three limits are properties of this description rather than of
                  any particular way of computing it, and it is better to say
                  them plainly than to let a reader assume otherwise, because
                  assuming otherwise produces a plausible answer rather than a
                  complaint.
                </p>
                <p>The patch descriptor on this page records pixels relative to the image frame. Rotate the image and those pixels move to different coordinates within the descriptor, even if we found the same physical point.</p>
<p>To reduce this sensitivity, a more developed method can estimate a local orientation from gradients and describe the patch relative to that orientation. This introduces an extra measurement whose repeatability matters.</p>
<p>Scale creates a related problem: a fixed pixel-sized patch covers a different amount of the scene when the apparent object size changes. Detecting points across several scales and choosing a characteristic scale can make the compared neighborhoods more consistent.</p>
<p>Those orientation and scale stages are not implemented by the small descriptor demonstrated here. Their absence explains the rotation and scale failures in the earlier experiments.</p>
                <>
<p>
                  And a corner is a property of brightness rather than of an object. Put a pale block on a lit floor, and beside it a patch of shadow the same size and the same distance from the floor&rsquo;s brightness, one above it and one below. The method finds eight places and scores every one of them at 0.64, because the score reads the size of the step in brightness and there is nothing else in it to read.
                </p>
                <p>
                  The descriptions do tell the two apart, since reversing brightness moves a description by the full 2.0, but a detector counting corners in a room counts the shadows&rsquo; corners among them.
                </p>
</>
                <KeepInMind>
                  The block-and-shadow picture is on one of the buttons in the
                  playground at the top of this page, if you want to watch all
                  eight rings appear at the same strength.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Where it stops being defined">
                <p>
                  Beneath the choices there are inputs on which the method does
                  not become approximate. It becomes undefined, because some
                  quantity it needs is not there to be had. Each line below is a
                  fact about
                  the mathematics rather than a matter of taste, and several of
                  them are cases where a value has to be decided and something
                  turns on which.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a window of a single pixel",
                      reason:
                        "the matrix is one gradient vector multiplied by itself, which describes exactly one direction because one vector is all it was given. Its determinant is zero everywhere by construction, so the smaller eigenvalue is zero at every pixel of every picture and no corner exists anywhere.",
                    },
                    {
                      expression: "a window with an even side",
                      reason:
                        "there is no centre pixel for the average to be reported at, so the answer belongs half a pixel from where it was computed. The same applies to a patch with an even side, which has no centre for the place to sit on.",
                    },
                    {
                      expression: "a window straddling a perfectly straight edge",
                      reason:
                        "every gradient in it points one way, so the matrix is exactly rank one and its determinant is exactly zero. The smaller eigenvalue there is not small, it is the same number flat ground gives, and no amount of contrast in the edge changes that.",
                    },
                    {
                      expression: "a Harris sensitivity of a quarter or more",
                      reason:
                        "the determinant of a real symmetric matrix is at most a quarter of its squared trace, so the score is at most trace² × (0.25 − sensitivity), which is zero or below whatever the picture holds. At 0.24 the square’s own corners already read −1.825185 and nothing is found.",
                    },
                    {
                      expression: "a patch with no variation in it",
                      reason:
                        "there is no length to divide by, so the unit description does not exist. Answering twenty-five zeros is a convention, and it has the consequence that every flat patch sits at distance zero from every other, so a flat patch matches all of them at once.",
                    },
                    {
                      expression: "a place within half a patch of the frame",
                      reason:
                        "part of the patch is outside the picture, so the description would be partly of pixels the scene does not contain. Inventing them is worse than refusing, since two pictures’ inventions then match each other rather than matching anything that was photographed.",
                    },
                    {
                      expression: "a set of one description to search in",
                      reason:
                        "there is no runner-up, so the ratio cannot be formed and the test cannot be asked. Answering the nearest anyway is exactly the behaviour the ratio test exists to stop.",
                    },
                    {
                      expression: "two candidates at exactly the same distance",
                      reason:
                        "the ratio is a zero over a zero when both are at zero, and undefined rather than large. It has to be decided, and one is the value that agrees with what the number means, since answering zero would call the most ambiguous case the most distinctive one.",
                    },
                    {
                      expression: "two candidates differing only by rounding",
                      reason:
                        "the ratio is a ratio of two rounding errors and can land anywhere between zero and one, so the test passes or fails by accident. Measured on the shared scene against its relit self, six of the thirty-two kept matches are this, at ratios from 0.5726 to 0.7219.",
                    },
                    {
                      expression: "two places with identical scores",
                      reason:
                        "which is reported first is a convention, since the four corners of a square score alike. Any rule will do and no rule is derivable; what matters is that one is written down, or the same picture answers differently on two runs.",
                    },
                    {
                      expression: "a peak that does not sit on a pixel",
                      reason:
                        "the score is only known at whole pixels and the underlying maximum need not be at one, so a position read off the grid carries an error of up to half a pixel that no care in the scoring removes. Fitting a curve through the peak and its neighbours is the usual repair, and it is a further choice rather than a correction.",
                    },
                    {
                      expression: "a picture with no corner in it",
                      reason:
                        "there is nothing to describe, and the method answers an empty list. That is correct rather than a failure, but it is a failure to be useful, and a horizon, a wall and a clear sky are all of them.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of those are worth carrying away because nothing about
                  them looks wrong at the time. The rank one edge, since a
                  measure that reports a middling score there is not being
                  cautious, it is reporting positions no second photograph can
                  match. And the ratio of two rounding errors, since it produces
                  confident matches on exactly the scenes, the repeated and the
                  noiseless, where the test was supposed to protect you.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            choice(
              "Where does the saving from keeping only a short list of places actually fall?",
              [
                "Downstream, since a score still has to be computed at all 2,304 pixels while the comparisons fall from 3,748,096 to 2,209",
                "In the scoring, since only the 47 chosen pixels have to be scored",
                "In both stages about equally",
                "Nowhere that can be stated, since the figures are machine dependent",
              ],
              0,
              "Nothing about keeping 47 answers makes the scoring pass cheaper. Describing every position is 48,400 numbers against 1,175, a factor of 41, and the comparison count is a factor of 1,697. The factor grows with the picture, because the comparisons go roughly as the square of the pixel count while the number of places follows how much structure the scene holds.",
            ),
            trueFalse(
              "On two photographs of a horizon taken three rows apart, this method answers nothing while describing every position recovers the vertical move exactly.",
              true,
              "The corner score is exactly 0.0 at every pixel of both pictures, so there is nothing to find and the method is right to decline. Of the 289 patch positions 221 are flat and indistinguishable, and the 68 that straddle the edge each find their partner at a distance of exactly 0.0 and exactly three rows lower. The horizontal move is beyond both, since every position along the edge looks like every other.",
            ),
            trueFalse(
              "A count of keypoints is a meaningful figure to report on its own.",
              false,
              "The same square answers 0, 4, 12, 16 or 25 depending on the window width alone, so the window, the threshold and the separation have to be reported with it. Widening the window from three pixels to nine takes the corner score from 4.0 down to 1.62963 and the count from 4 up to 25, on a picture that has four corners.",
            ),
            several(
              "A pale block on a lit floor sits beside a patch of shadow the same size and the same distance from the floor’s brightness. Which of these hold?",
              [
                "The method finds eight places and scores every one of them at 0.64",
                "The score reads the size of the step in brightness and has nothing else in it to read",
                "The descriptions do tell the block from the shadow, since reversing brightness moves a description by the full 2.0",
                "A detector counting corners in a room counts the shadows’ corners among them",
              ],
              [0, 1, 2, 3],
              "All four hold. A corner here is a property of brightness rather than of an object, which is why a block above the floor’s brightness and a shadow the same distance below it score alike. It is the counting rather than the describing that is fooled, because the description keeps the sign of the step and the score does not.",
            ),
            choice(
              "One picture’s descriptions are searched for in a set that holds exactly one description. What does the method say?",
              [
                "Nothing, since there is no runner-up and the ratio cannot be formed",
                "The single candidate is the match, at a ratio of zero",
                "The ratio is taken as one and the match is refused",
                "The candidate is accepted whenever its distance is under the threshold",
              ],
              0,
              "The test compares the nearest against the second nearest, and with one candidate there is no second. Answering the nearest anyway is exactly the behaviour the ratio test exists to stop, because the nearest always exists whatever the two pictures are of. A ratio of one is the decision for two candidates at the same distance, which is a different case.",
            ),
        ],
        },
        {
          title: "Practice. Scoring, Describing And Matching The Square",
          practice: [
            exercise(
              "Score the square’s corner, edge and ground",
              ["Draw the bright square Part 2 works by hand, nine pixels on a side in a frame of twenty-one, and read its structure tensor at three positions, the top-left corner, the middle of the left edge and a patch of empty ground. Print the total energy, the shape term, the smaller eigenvalue and the Harris score at each.", "Part 3’s table gives the corner 11.555556, 30.222222, 4.0 and 24.880988, with the Harris sensitivity at 0.04. Reproduce the table, then score the same three positions with the sensitivity at 0.06, the other end of the range Part 3 mentions, which the lesson does not quote."],
              `import numpy as np
from oop_ml.core.computer_vision.keypoints import CornerResponse, HarrisMeasure, StructureTensor
from oop_ml.core.computer_vision.picture import Picture

values = np.zeros((21, 21))
values[6:15, 6:15] = 1.0
picture = Picture(values)

positions = {"corner": (6, 6), "edge": (10, 6), "ground": (2, 2)}
tensor = StructureTensor.of(picture)
smaller = CornerResponse.of(picture)
# Build two more responses with a HarrisMeasure, one at each sensitivity.
# Then, for each position, print the tensor's trace and determinant there,
# the smaller eigenvalue and the two Harris scores, to six places.

# Print the corner's Harris score at 0.06 on a line of its own, to four places.`,
              `import numpy as np
from oop_ml.core.computer_vision.keypoints import CornerResponse, HarrisMeasure, StructureTensor
from oop_ml.core.computer_vision.picture import Picture

values = np.zeros((21, 21))
values[6:15, 6:15] = 1.0
picture = Picture(values)

positions = {"corner": (6, 6), "edge": (10, 6), "ground": (2, 2)}
tensor = StructureTensor.of(picture)
smaller = CornerResponse.of(picture)
harris = CornerResponse.of(picture, HarrisMeasure(sensitivity=0.04))
strict = CornerResponse.of(picture, HarrisMeasure(sensitivity=0.06))

for name, (row, column) in positions.items():
    print(name)
    print(f"  total energy {tensor.trace.values[row, column]:.6f}")
    print(f"  shape term {tensor.determinant.values[row, column]:.6f}")
    print(f"  smaller eigenvalue {smaller.at(row, column):.6f}")
    print(f"  Harris at 0.04 {harris.at(row, column):.6f}")
    print(f"  Harris at 0.06 {strict.at(row, column):.6f}")

print(f"corner, Harris at 0.06: {strict.at(6, 6):.4f}")`,
              `corner
  total energy 11.555556
  shape term 30.222222
  smaller eigenvalue 4.000000
  Harris at 0.04 24.880988
  Harris at 0.06 22.210370
edge
  total energy 10.666667
  shape term 0.000000
  smaller eigenvalue 0.000000
  Harris at 0.04 -4.551111
  Harris at 0.06 -6.826667
ground
  total energy 0.000000
  shape term 0.000000
  smaller eigenvalue 0.000000
  Harris at 0.04 0.000000
  Harris at 0.06 0.000000
corner, Harris at 0.06: 22.2104`,
              { hints: ["CornerResponse.of takes the picture and, optionally, a measure. With no measure it scores by the smaller eigenvalue. HarrisMeasure takes its sensitivity as a keyword.", "The tensor’s trace and determinant are each a picture of their own, one number per pixel, so their values are indexed by row and column like any array.", "A response answers one position through at(row, column), which is less to hold than its whole table of scores."], check: numberCheck("What does the corner score under Harris at a sensitivity of 0.06, to four places?", 22.2104, 0.0005, "The corner’s shape term is 30.222222 and its squared energy is 133.530864, so the score is 30.222222 less 0.06 lots of 133.530864. Raising the sensitivity from 0.04 took the corner down from 24.880988 and pushed the edge further below zero, from −4.551111 to −6.826667, while the smaller eigenvalue beside them has no dial to move.") },
            ),
            exercise(
              "Describe one corner and measure how far it is from the others",
              ["Describe the square’s top-left corner by its five-wide patch, print the twenty-five numbers as five rows, and then print how far that description is from the top-right corner’s, from the bottom-right corner’s, from the same corner with every pixel raised by ten, and from the same corner with the brightness reversed.", "Part 4 works the patch by hand to 0.266667 and −0.15, puts two neighbouring corners 1.443376 apart, and puts a corner 2.0 from its own reverse. The diagonally opposite corner is not on the page. Before running it, count how many of the twenty-five entries it should disagree in."],
              `import numpy as np
from oop_ml.core.computer_vision.keypoints import Keypoint, PatchDescriptor
from oop_ml.core.computer_vision.picture import Picture

values = np.zeros((21, 21))
values[6:15, 6:15] = 1.0
picture = Picture(values)

top_left = PatchDescriptor.of(picture, Keypoint(6, 6, 4.0), 5)
# Print top_left's values as five rows of five, to six places.
# Describe the corners at (6, 14) and (14, 14) the same way, and the corner at
# (6, 6) of two new pictures, values + 10.0 and -values.
# Print the distance from top_left to each of the four.

# Print the distance to the bottom-right corner on a line of its own, to four places.`,
              `import numpy as np
from oop_ml.core.computer_vision.keypoints import Keypoint, PatchDescriptor
from oop_ml.core.computer_vision.picture import Picture

values = np.zeros((21, 21))
values[6:15, 6:15] = 1.0
picture = Picture(values)

top_left = PatchDescriptor.of(picture, Keypoint(6, 6, 4.0), 5)
for row in top_left.values.reshape(5, 5):
    print("  ".join(f"{entry:9.6f}" for entry in row))

top_right = PatchDescriptor.of(picture, Keypoint(6, 14, 4.0), 5)
bottom_right = PatchDescriptor.of(picture, Keypoint(14, 14, 4.0), 5)
brighter = PatchDescriptor.of(Picture(values + 10.0), Keypoint(6, 6, 4.0), 5)
negative = PatchDescriptor.of(Picture(-values), Keypoint(6, 6, 4.0), 5)

print(f"to the top-right corner {top_left.distance_to(top_right):.6f}")
print(f"to the bottom-right corner {top_left.distance_to(bottom_right):.6f}")
print(f"to itself, ten brighter {top_left.distance_to(brighter):.1e}")
print(f"to itself, reversed {top_left.distance_to(negative):.6f}")

print(f"opposite corner: {top_left.distance_to(bottom_right):.4f}")`,
              `-0.150000  -0.150000  -0.150000  -0.150000  -0.150000
-0.150000  -0.150000  -0.150000  -0.150000  -0.150000
-0.150000  -0.150000   0.266667   0.266667   0.266667
-0.150000  -0.150000   0.266667   0.266667   0.266667
-0.150000  -0.150000   0.266667   0.266667   0.266667
to the top-right corner 1.443376
to the bottom-right corner 1.666667
to itself, ten brighter 1.2e-15
to itself, reversed 2.000000
opposite corner: 1.6667`,
              { hints: ["A Keypoint is a row, a column and a strength. The strength plays no part in the description, so any finite number will do for a place you chose by hand.", "A description’s values are one flat run of twenty-five numbers read row by row, so reshape(5, 5) puts them back in the patch’s own arrangement.", "distance_to takes another description and answers one number. The patch around the opposite corner is bright in the one quarter this one is dark in, and the two share only the centre pixel."], check: numberCheck("How far is the top-left corner’s description from the bottom-right corner’s, to four places?", 1.6667, 0.0005, "Each patch has nine bright entries and the two share only the centre pixel, so sixteen of the twenty-five entries hold 0.266667 in one description and −0.15 in the other. Sixteen gaps of 0.416667 give a distance of four times 0.416667. A neighbouring corner disagrees in twelve entries and sits at 1.443376, so the opposite corner is further off, and both are well short of the 2.0 of an exact reverse.") },
            ),
            exercise(
              "Match a moved square, then a square against its twin",
              ["Photograph one square twice, the second time moved down four rows and right five columns, as Part 5 does. The starter finds and describes the corners of every picture. Match the first picture’s descriptions against the moved one’s and print where each match went, its distance, its runner-up’s distance and its ratio. Then match a single seven-wide square against a picture holding two identical copies of it, once with the ratio test turned off so that every match is reported, and once with it on.", "Part 5 reports four matches at a ratio of 0.0 on the moved square, and four at a ratio of 1.0 on the twins, all refused."],
              `import numpy as np
from oop_ml.core.computer_vision.keypoints import CornerResponse, Descriptors
from oop_ml.core.computer_vision.picture import Picture

pictures = {name: np.zeros((31, 31)) for name in ("first", "moved", "one", "twins")}
pictures["first"][6:15, 6:15] = 1.0
pictures["moved"][10:19, 11:20] = 1.0
pictures["one"][5:12, 3:10] = 1.0
pictures["twins"][5:12, 3:10] = 1.0
pictures["twins"][5:12, 18:25] = 1.0

described = {}
for name, values in pictures.items():
    picture = Picture(values)
    corners = CornerResponse.of(picture).peaks(minimum_strength=0.5, border=3)
    described[name] = Descriptors.of(picture, corners, 5)

# Match described["first"] against described["moved"], and for each match
# print the two positions, the distance, the runner-up's distance and the ratio.

# Match described["one"] against described["twins"] twice, with
# maximum_ratio=1.0 and at the default. Print each ratio from the first, and
# how many matches each of the two kept.`,
              `import numpy as np
from oop_ml.core.computer_vision.keypoints import CornerResponse, Descriptors
from oop_ml.core.computer_vision.picture import Picture

pictures = {name: np.zeros((31, 31)) for name in ("first", "moved", "one", "twins")}
pictures["first"][6:15, 6:15] = 1.0
pictures["moved"][10:19, 11:20] = 1.0
pictures["one"][5:12, 3:10] = 1.0
pictures["twins"][5:12, 3:10] = 1.0
pictures["twins"][5:12, 18:25] = 1.0

described = {}
for name, values in pictures.items():
    picture = Picture(values)
    corners = CornerResponse.of(picture).peaks(minimum_strength=0.5, border=3)
    described[name] = Descriptors.of(picture, corners, 5)

for match in described["first"].matched_to(described["moved"]):
    here, there = match.first.keypoint, match.second.keypoint
    print(f"({here.row}, {here.column}) to ({there.row}, {there.column})")
    print(f"  distance {match.distance:.4f}, runner-up {match.runner_up_distance:.4f}, ratio {match.ratio:.4f}")

everything = described["one"].matched_to(described["twins"], maximum_ratio=1.0)
print("ratios on the twins", [round(match.ratio, 4) for match in everything])
print(f"reported with the test off {len(everything)}")
print(f"kept by the test {len(described['one'].matched_to(described['twins']))}")`,
              `(6, 6) to (10, 11)
  distance 0.0000, runner-up 1.4434, ratio 0.0000
(6, 14) to (10, 19)
  distance 0.0000, runner-up 1.4434, ratio 0.0000
(14, 6) to (18, 11)
  distance 0.0000, runner-up 1.4434, ratio 0.0000
(14, 14) to (18, 19)
  distance 0.0000, runner-up 1.4434, ratio 0.0000
ratios on the twins [1.0, 1.0, 1.0, 1.0]
reported with the test off 4
kept by the test 0`,
              { hints: ["matched_to is called on one set of descriptions with the other as its argument, and what it answers can be looped over. Each match carries first, second, distance, runner_up_distance and ratio.", "A match’s first and second are descriptions, and a description knows the keypoint it was cut around, which is where the row and column are.", "maximum_ratio is the largest ratio still counted as a match. At one, everything is kept, which is the only way to see a ratio the test would otherwise have refused."], check: numberCheck("On the moved square, how far away is each match’s runner-up, to four places?", 1.4434, 0.0005, "Every corner of the moved square finds its own moved self at a distance of exactly zero, and the next best candidate is a neighbouring corner of the same square, twelve entries out at 1.443376. A zero over 1.443376 is a ratio of zero, the most distinctive a match can be. On the twins the runner-up is the other copy at zero as well, the ratio is decided as one, and none of the four is kept.") },
            ),
            exercise(
              "Search a set that holds one description",
              ["Part 7 lists a set of one description as a case where the ratio test cannot be asked. Describe the square’s corners, keep only the strongest one as the set to search in, and try to match all four corners against it. Catch what the library raises and print its name and its message.", "A search that answered here would be answering the nearest because it was the only candidate, which is the behaviour the test exists to stop."],
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.core.computer_vision.keypoints import CornerResponse, Descriptors
from oop_ml.core.computer_vision.picture import Picture

values = np.zeros((21, 21))
values[6:15, 6:15] = 1.0
picture = Picture(values)
response = CornerResponse.of(picture)

everything = Descriptors.of(picture, response.peaks(minimum_strength=0.5), 5)
# Describe only the strongest corner, which peaks will hand over if its limit
# is one. Print how many descriptions each set holds, then try to match
# everything against the set of one, and print the name and the message of
# the library's refusal.`,
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.core.computer_vision.keypoints import CornerResponse, Descriptors
from oop_ml.core.computer_vision.picture import Picture

values = np.zeros((21, 21))
values[6:15, 6:15] = 1.0
picture = Picture(values)
response = CornerResponse.of(picture)

everything = Descriptors.of(picture, response.peaks(minimum_strength=0.5), 5)
only_one = Descriptors.of(picture, response.peaks(minimum_strength=0.5, limit=1), 5)
print(f"asking with {len(everything)}, searching in {len(only_one)}")

try:
    everything.matched_to(only_one)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)`,
              `asking with 4, searching in 1
TooFewValuesError
the ratio test needs a runner-up to compare against, so it needs at least two descriptors to search in; got 1`,
              { hints: ["peaks takes a limit, the most places it will hand back, and it hands them back strongest first.", "Every refusal the library makes derives from MLLibError, so catching that catches whichever specific one this is."] },
            ),
          ],
        },
      ]}
    />
  );
}
