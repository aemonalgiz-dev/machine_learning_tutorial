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
    "Find the few places in a picture that can be located at all, describe what surrounds each of them, and match two pictures through those descriptions.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KeypointsAndDescriptorsPage() {
  return (
    <ConceptPage
      title="Keypoints and Descriptors"
      tagline="Find the few places in a picture that can be located at all, write down what surrounds each of them, and match two pictures through those."
      prerequisites={
        <>
          Everything here is built on the rate of change of brightness, so you
          should have met a small grid of weights carried across a picture and
          the pair of answers it gives at every pixel, one for how fast
          brightness rises to the right and one for how fast it rises downward.
          The{" "}
          <Link href="/concepts/convolution" className={link}>
            sweeping operation
          </Link>{" "}
          is that same carrying, with the weights learned rather than chosen.
          Nothing on this page needs any of it to be learned.
        </>
      }
      history={
        <>
          <p>
            Hans Moravec had a cart at the Stanford Artificial Intelligence
            Laboratory in the late 1970s, and the cart had a problem this page
            is about. It stopped, slid its camera along a rail on top of it and
            took a picture at each of nine positions, and to work out how far
            anything in the room was it had to say which patch of one picture
            was the patch of the next. Almost none of them could be said. A patch of blank
            wall is the patch beside it, and a patch cut from the middle of a
            table edge is every other patch along that edge, so the two
            photographs agreed everywhere and told him nothing. His 1980 thesis,
            &ldquo;Obstacle Avoidance and Navigation in the Real World by a
            Seeing Robot Rover&rdquo;, answers it by finding the few places
            where the agreement breaks down. He scored a small window by how
            much it changed when it was moved one pixel in each of four
            directions and kept the smallest of those four changes, which is
            large only where moving the window in any direction changes what it
            sees.
          </p>
          <p>
            Chris Harris and Mike Stephens, working at Plessey Research in Roke
            Manor, rewrote that score in 1988 for the Alvey Vision Conference in
            a paper called &ldquo;A Combined Corner and Edge Detector&rdquo;.
            Moravec&rsquo;s four shifts were the trouble, since an edge lying at
            an angle to all four of them changes the window under every one, and
            the score then calls it a corner. Harris and Stephens
            expanded the same quantity for a shift in any direction at all and
            found that it depends on the picture only through three averaged
            products of the two gradients, which is a small symmetric matrix per
            pixel. That matrix is what this page is really about. They then
            scored it with its determinant less a multiple of its squared trace,
            because a square root per pixel was worth avoiding on the hardware
            they had. Jianbo Shi and Carlo Tomasi returned to the question in
            1994 in &ldquo;Good Features to Track&rdquo; and argued that the
            honest score is the smaller of the matrix&rsquo;s two eigenvalues,
            since that is exactly the quantity the tracking they wanted to do
            needs to be large.
          </p>
          <p>
            David Lowe added the other half at the University of British
            Columbia, in &ldquo;Object Recognition from Local Scale-Invariant
            Features&rdquo; in 1999 and at length in &ldquo;Distinctive Image
            Features from Scale-Invariant Keypoints&rdquo; in 2004. Finding a
            place is useless unless what surrounds it can be written down in a
            form that survives the photograph being taken again, and Lowe also
            gave the rule that decides whether a match between two such
            descriptions is worth believing, which is to compare the nearest
            against the second nearest rather than to threshold the distance. He
            measured a threshold of 0.8 on that comparison as removing most
            false matches while losing very few correct ones, and that number is
            still the one everybody uses. This page asks six questions in order.
            Why describe a few places rather than the whole picture? Which
            places can be located at all? How is that turned into a number a
            computer can rank? What is written down around a place, and what
            does that survive? How are two lists of descriptions matched
            without a threshold that means nothing? And what does the method
            cost, and where does it stop being defined?
          </p>
        </>
      }
      playground={<KeypointWorkbench />}
      sections={[
        {
          title: "Part 1. Describing Less Of The Picture",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. What two photographs of one scene actually ask">
                <p>
                  The scene above is 48 pixels on a side, and it holds a square,
                  a disc, a diagonal bar, three copies of a small cross and a
                  brightness ramp that makes the left side of it darker than the
                  right. Photograph it twice, moving the camera a little between
                  the two, and the question that matters is which position in
                  the first picture is which position in the second. Answering
                  it by describing every position is the obvious plan. It is
                  expensive, and the more serious trouble is that most of the
                  descriptions it produces do not distinguish anything from
                  anything.
                </p>
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
                <p>
                  It is worth watching that happen rather than taking it. Put a
                  bright square on dark ground, cut a five-wide patch from the
                  middle of its left edge, and then slide a window down that
                  edge one row at a time, measuring how far what the window sees
                  is from the patch we cut. Five of the fifteen stops come out
                  at a distance of exactly zero. Not nearly zero; the same
                  numbers in the same order. Slide the same window past the
                  corner instead and exactly one stop matches, which is the
                  corner itself.
                </p>
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
          ),
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
                  <p>
                    Every gradient inside a window straddling a straight edge
                    points the same way, as the arrows in step 4 show. So each
                    of the nine outer products being averaged is a multiple of
                    the same one, and the average is a multiple of it too, which
                    makes the matrix exactly rank one. A rank one matrix has a
                    zero eigenvalue, and the determinant is the product of the
                    eigenvalues, so the determinant is exactly zero. Nothing
                    about the length of the edge, the sharpness of the step or
                    the width of the window changes that.
                  </p>
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
                <p>
                  Dropping a candidate first means the corner inside the border
                  never gets to suppress anything, so the pixel on its shoulder
                  survives and is reported in its place. On a square whose
                  corners sit two pixels from the frame, at a border of three,
                  that answers four places rather than one, three of them a
                  single pixel off, scoring 3.5556 where the corners they stand
                  beside score 4.0. The count looks right, the strengths look
                  plausible, and every position is wrong. The rule that works is
                  to let a place inside the border suppress its own
                  neighbourhood and then decline to report it.
                </p>
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
                  <p>
                    The patch at the square&rsquo;s top-left corner is nine
                    pixels of the square and sixteen of the ground, so its mean
                    is 9 / 25, which is 0.36. Centring leaves nine values of
                    0.64 and sixteen of −0.36. The sum of their squares is 9 ×
                    0.64² + 16 × 0.36², which is 5.76, so the length is 2.4.
                    Dividing through gives nine values of 0.266667 and sixteen
                    of −0.15, and that run of twenty-five numbers is the whole
                    description.
                  </p>
                </WorkedExample>
              </SubSection>

              <SubSection title="16. What the two steps buy, measured">
                <p>
                  It is worth checking that they buy what they promise rather
                  than assuming it. Add ten to every pixel of the picture and
                  the description of that same corner moves by 1.2 × 10⁻¹⁵.
                  Multiply every pixel by three and it moves by 2.0 × 10⁻¹⁶. I
                  expected both of those to be exactly zero and they are not,
                  because the subtraction and the division are done in floating
                  point and their last bits do not always land where the algebra
                  says. On a scale whose maximum is 2, moving by 10⁻¹⁵ is
                  nothing, but it is rounding rather than identity and the
                  difference is worth stating.
                </p>
                <DescriptorCard show="distances" />
                <p>
                  The other rows of that drawing are the ones that give the
                  scale its meaning. Two different corners of the same square
                  sit 1.443376 apart. A corner against its own picture with the
                  brightness reversed sits at 2.0, the furthest two descriptions
                  can be. And two patches of flat ground, one outside the square
                  and one inside it, sit at exactly 0.0 from each other, because
                  neither has any variation to normalise and both come back as
                  twenty-five zeros. That last row is the aperture problem again,
                  now in the description rather than in the score.
                </p>
                <KeepInMind>
                  A flat patch has no length to divide by, so its description
                  does not exist and the convention is to answer zeros. Every
                  such answer is zero distance from every other, so a flat patch
                  matches all flat patches equally well, which is exactly why
                  places are hunted at corners.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The places belong to the scene, the descriptions to the frame">
                <p>
                  Two claims are worth separating here, because they come out
                  differently and the difference is what this kind of
                  description can and cannot promise. Shift the whole picture
                  down two rows and right three columns. Every place moves by
                  exactly that much, every strength is identical to the last
                  bit, and every description is at distance exactly 0.0 from
                  where it was. Turn the lamp up instead, multiplying every
                  pixel by 1.6 and adding 0.15, and every score is multiplied by
                  2.56, which is 1.6 squared, while no description on the whole
                  scene moves further than 1.2 × 10⁻¹⁵.
                </p>
                <SceneLedger show="lighting" />
                <p>
                  Now turn the picture a quarter circle, which is the one
                  rotation that needs no interpolation, so nothing that follows
                  can be blamed on resampling. All 47 places land exactly where
                  the coordinate map says they should, with strengths that agree
                  to the last bit, because the trace and the determinant do not
                  care how the axes are labelled and a square window is
                  unchanged by a quarter turn. The descriptions do not survive
                  it at all. On the square, all four corners end up 1.443376
                  from their own turned selves, which is precisely the distance
                  between that square&rsquo;s top-left corner and its top-right
                  one. On the workbench scene, where the brightness ramp makes
                  no two corners quite alike, the corresponding pairs come out
                  between 0.052724 and 1.545328 apart, and not one of them at
                  zero.
                </p>
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
                <p>
                  Three arrangements, on the three buttons above. One square
                  photographed twice, moved down four rows and right five
                  columns, gives four matches, each at a distance of exactly 0.0
                  against a runner-up at 1.443376, so each ratio is 0.0 and each
                  winner is the corner that moved by the known shift. The same
                  square searched for in a picture holding two identical copies
                  of it gives four matches at a distance of 0.0 against a
                  runner-up also at 0.0, which is a ratio of 1.0 and is refused.
                  Laying a faint ripple over that second picture breaks the
                  exact tie, and the ratios become numbers the arithmetic
                  computed rather than a convention, 0.980729 for the first of
                  them, which is still refused.
                </p>
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
                  1,697. The two timings in the drawing were measured when this
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
                <p>
                  Describing every position instead does answer. A five-wide
                  patch fits at 289 positions, of which 221 are flat and
                  indistinguishable, and the 68 that straddle the edge each find
                  their partner in the second photograph at a distance of
                  exactly 0.0 and exactly three rows lower. The vertical move is
                  recovered perfectly by the plan this whole page replaced. The
                  horizontal move would not be, since every position along the
                  edge looks like every other, so the dense plan has the same
                  aperture problem; it simply does not throw away the one
                  direction it can still see.
                </p>
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
                <p>
                  It is not invariant to rotation. A patch read row by row is a
                  list of positions in the frame, so turning the picture
                  rearranges the list, and step 17 measured what that costs. The
                  repair is to give each place an orientation of its own, read
                  off the gradients around it, and to read the patch relative to
                  that orientation instead of to the frame. It is not invariant
                  to scale either. A patch is five pixels wide in the frame, and
                  a photograph taken from twice as far away puts the same corner
                  inside a patch covering four times as much of the scene, so
                  the two descriptions are of different things. The repair is to
                  look for places at several blurrings of the picture at once and
                  to keep the ones that are strongest across that stack, which is
                  a scale space. Both repairs together are roughly the distance
                  between what is on this page and what a published
                  scale-invariant detector does.
                </p>
                <p>
                  And a corner is a property of brightness rather than of an
                  object. Put a pale block on a lit floor, and beside it a patch
                  of shadow the same size and the same distance from the
                  floor&rsquo;s brightness, one above it and one below. The
                  method finds eight places and scores every one of them at
                  0.64, because the score reads the size of the step in
                  brightness and there is nothing else in it to read. The
                  descriptions do tell the two apart, since reversing brightness
                  moves a description by the full 2.0, but a detector counting
                  corners in a room counts the shadows&rsquo; corners among
                  them.
                </p>
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
      ]}
    />
  );
}
