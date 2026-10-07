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
import { BlockOverlapMap } from "@/components/widgets/BlockOverlapMap";
import { EdgeToBucket } from "@/components/widgets/EdgeToBucket";
import { InsideOneCell } from "@/components/widgets/InsideOneCell";
import { LightingLedger } from "@/components/widgets/LightingLedger";
import { OrientedGradientPlayground } from "@/components/widgets/OrientedGradientPlayground";
import { RangeChoiceCompare } from "@/components/widgets/RangeChoiceCompare";
import { SceneUnderTwoLamps } from "@/components/widgets/SceneUnderTwoLamps";
import { TurnedAgainstRelit } from "@/components/widgets/TurnedAgainstRelit";
import { VoteSharingSlide } from "@/components/widgets/VoteSharingSlide";

export const metadata: Metadata = {
  title: "Histogram of Oriented Gradients · oop_ml",
  description:
    "Build an image descriptor from local edge directions and normalise neighbouring regions.",
};

export default function OrientedGradientsPage() {
  return (
    <ConceptPage
      lessonId="histogram-of-oriented-gradients"
      intuition={lessonIntuitions["histogram-of-oriented-gradients"]}
      technicalStart="Part 2. Counting Directions Inside A Cell"
      openingTitle="Describe Which Way the Edges Point"
      playgroundIntro="Follow an edge direction into its histogram bins. Compare the counts before and after block normalisation as the picture's contrast changes."
      title="Histogram of Oriented Gradients"
      tagline="Build an image descriptor from local edge directions and normalise neighbouring regions."
      prerequisites={
        <>
          Start with{" "}
          <Link href="/concepts/filters-and-edges" className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400">
            filters and edges
          </Link>
          . That lesson measures how brightness changes horizontally and
          vertically. Together those measurements describe a direction and
          strength of change. Here we collect those directions into a compact
          description of an image region. A brightness gradient points across
          an edge, toward increasing brightness, rather than along the edge.
        </>
      }

      playground={<OrientedGradientPlayground />}
      sections={[
        {
          title: "Part 1. Why A Description Made Of Brightnesses Will Not Do",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The scene we will describe">
                <>
<p>
                  Everything on this page is worked on one small scene, 48 pixels on a side, drawn by arithmetic rather than photographed so that we can always say exactly what is in it. There is a square near the top left with four straight edges and four corners, a disc to the right of it whose edge points in every direction there is, a bar running diagonally across the bottom left, and three small crosses scattered about.
                </p>
                <p>
                  Laid over all of that is a ramp of brightness that makes the right-hand side of the scene lighter than the left, so the crosses on the right are brighter than the ones on the left although they are the same shape.
                </p>
</>
                <p>
                  The question the whole page turns on is what we should write
                  down about a patch of that scene so that we could recognise
                  the same thing again somewhere else. The obvious answer is to
                  write down the brightnesses, and the reason that answer fails
                  is worth measuring rather than asserting.
                </p>
                <KeepInMind>
                  The ramp is the most important thing in the scene and the
                  least visible. It is what makes two copies of the same shape
                  read at different brightnesses, so a description built out of
                  brightness will call them different things.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Turn the lamp up and every brightness moves">
                <p>
                  Take that scene and light it differently. Multiplying every
                  brightness by a number and then adding another is roughly
                  what a stronger lamp and a second lamp do to a photograph,
                  and nothing in the scene has moved by so much as a pixel. If
                  our description is the list of 2304 brightnesses, every one
                  of those 2304 numbers is now different.
                </p>
                <Equation>{`relit = 1.6 × here + 0.15`}</Equation>
                <p>
                  Two lists of the same length can be compared one position at
                  a time. Take the difference at every pixel, square it, add
                  the 2304 squares up and take the square root, and the result
                  is one number saying how far apart the two lists are. The
                  same arithmetic on one list by itself, squaring each
                  brightness rather than each difference, gives that
                  list&rsquo;s own length, which is the yardstick a distance
                  has to be read against, since a distance means nothing until
                  it is set beside how long the lists themselves are. Every
                  distance and every length on this page is measured this way.
                </p>
                <Equation>{`apart  = √( Σ over pixels of (relit − here)² )

length = √( Σ over pixels of here² )`}</Equation>
                <p>
                  Measured, the two lists are 19.52 apart, where the first
                  list&rsquo;s own length is 21.89. That is 89 per cent of the
                  way to being an unrelated picture, for a change that a person
                  looking at the two would describe as the same scene on a
                  brighter day.
                </p>
                <Equation>{`19.52 / 21.89 ≈ 0.89`}</Equation>
                <SceneUnderTwoLamps />
                <KeepInMind>
                  A description built out of brightnesses is partly a
                  description of the lighting, and there is no threshold or
                  tolerance that repairs that, because the change is as large
                  as the thing being described.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The rate of change holds still">
                <p>
                  Now read the same two pictures a different way, by asking at
                  each pixel how fast the brightness is changing and in which
                  direction. The added constant does not survive that question
                  at all, since it is added to both of the neighbours whose
                  difference is being taken and cancels out. The multiplier
                  does survive, but it multiplies every rate of change by the
                  same factor, which stretches all the arrows and turns none of
                  them.
                </p>
                <p>
                  On the two pictures above, not one direction turned by more
                  than 6.2 times ten to the minus thirteenth of a degree, which
                  is the arithmetic&rsquo;s own rounding rather than a real
                  movement, and every rate of change grew by the same factor of
                  1.60, the smallest and the largest agreeing. So a description
                  made of directions is already untouched by the added constant
                  and off by one overall factor on account of the multiplier.
                </p>
                <WhyThisWorks>
                  <p>
                    The estimate of the rate of change at a pixel is a weighted
                    sum of the brightnesses around it, and every one of the
                    grids used for it has weights adding to nought, with each
                    positive weight matched by a negative one across the middle.
                    Adding a constant to every brightness therefore contributes
                    that constant times the sum of the weights, which is nought.
                  </p>
                  <Equation>{`sum of weights = 0    so    sweep(picture + c) = sweep(picture)`}</Equation>
                  <p>
                    Multiplying is different, because the sum is linear in the
                    brightnesses, so a picture multiplied by a factor gives
                    every rate of change multiplied by the same factor. The
                    direction is the ratio of two of those, and a common factor
                    cancels out of a ratio, which is why the angles do not move.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Adding to every brightness costs nothing from the moment we
                  start reading rates of change. Multiplying every brightness is
                  a real problem, and it is still there. Keep those two apart,
                  because a later section shows that they are fixed at
                  different stages and it is easy to credit the second stage
                  with both.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. A field of arrows is still not a description">
                <p>
                  So far nothing has been described. The scene had one number
                  per pixel and now it has two, a length and an angle, which is
                  4608 numbers where there were 2304. Worse, those numbers are
                  still tied to exact positions, so the same shape drawn one
                  pixel to the left disagrees with the original at almost every
                  position, in the same way the brightnesses did.
                </p>
                <p>
                  What is wanted is a way of keeping the directions, which
                  held still under the lamp, while giving up some of the
                  precision about where each one was, which is what moved when
                  the shape moved. That trade is the whole of the method, and it
                  happens in three stages.
                </p>
                <InAModel>
                  At the size the pedestrian work used, a window 64 pixels wide
                  and 128 tall holds 8192 brightnesses and so 16384 numbers of
                  rate of change. The finished description of that window holds
                  3780, and the arithmetic that gets there is the subject of
                  Part 5.
                </InAModel>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Counting Directions Inside A Cell",
          content: (
            <>
              <SubSection title="5. A cell, and the one question it asks">
                <p>
                  Divide the patch into small squares of a fixed size, 8 pixels
                  on a side by default, and treat each square on its own. Inside
                  one square, throw away where each edge was and keep only which
                  way it pointed, weighted by how sharply the brightness was
                  changing at that pixel. What comes out is a handful of numbers
                  saying that this square holds a great deal of nearly upright
                  edge and a little diagonal, and nothing at all about
                  whereabouts in the square any of it was.
                </p>
                <p>
                  Those squares are called cells, and the handful of numbers is
                  the histogram of that cell. Two pictures whose shapes are
                  two pixels apart inside the same cell produce exactly the same
                  handful of numbers, which is the tolerance we came for, and
                  what it costs is that the description no longer knows where
                  anything was.
                </p>
                <KeepInMind>
                  The cell size is the dial that trades those two against each
                  other, and nothing in the method sets it. At 8 pixels the
                  scene here divides into 6 cells by 6 and the square, which is
                  11 pixels across, spreads over six of them. At 16 pixels there
                  are 3 cells by 3, the square lies almost wholly inside one of
                  them, and a movement of five pixels then changes the answer by
                  nothing at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Nine buckets over half a circle">
                <>
                  <p>
                    A histogram needs a fixed set of direction bins. With unsigned
                    orientations, a direction and its reverse count as the same
                    orientation, so the range is half a circle.
                  </p>
                  <Equation>{"bin width = 180° / 9 = 20°"}</Equation>
                  <p>
                    Each of the nine bins covers a twenty-degree interval.
                  </p>
                </>
                <Equation>{`bucket b covers  [ b × w , (b+1) × w )    and is centred at  (b + 0.5) × w

with  w = 180 / 9 = 20 degrees`}</Equation>
                <p>
                  So bucket 0 covers everything from 0 up to 20 degrees and is
                  centred on 10, bucket 4 covers 80 up to 100 and is centred on
                  90, and bucket 8 covers 160 up to 180 and is centred on 170.
                  The centres matter as much as the edges, and Part 3 is about
                  why.
                </p>
                <p>
                  Remember that a direction here is the direction the
                  brightness rises, which is across the edge. An upright edge
                  with its bright side on the right has a direction of 0
                  degrees, and an edge running left to right with its bright
                  side below has a direction of 90 degrees. When the drawings on
                  this page show a stroke for a bucket, the stroke is turned a
                  quarter circle from the bucket&rsquo;s own direction so that
                  it lies along the edge, which is what makes a grid of them
                  look like the picture it came from.
                </p>
              </SubSection>

              <SubSection title="7. A patch with one edge, worked through">
                <p>
                  Here is the smallest thing worth doing this to. Take a patch
                  6 pixels square whose left three columns are dark and whose
                  right three are bright, so it holds one upright edge and
                  nothing else, and use cells 3 pixels on a side so that the
                  patch divides into four of them.
                </p>
                <WorkedExample>
                  <p>
                    The sweep answers 4 at every pixel of the two columns beside
                    the edge, which are columns 2 and 3, and nothing anywhere
                    else, because everywhere else the three brightnesses it
                    reads are all equal. The downward sweep answers nothing at
                    all, since no row differs from the next. So the direction at
                    every pixel that has one is 0 degrees, pointing from the
                    dark side towards the bright side.
                  </p>
                  <p>
                    Each 3 by 3 cell contains exactly one of those two columns,
                    which is 3 pixels answering 4, so each cell collects 12 of
                    weight and the four collect 48 between them. Dropping each
                    cell&rsquo;s whole vote into the bucket its direction falls
                    in puts all 12 into bucket 0, since 0 degrees is inside the
                    range 0 up to 20.
                  </p>
                </WorkedExample>
                <EdgeToBucket initialSharing="whole" />
                <p>
                  Two things in that drawing are worth pausing on. The four
                  cells are identical although the weight is at a different
                  place inside them, since the two cells on the left hold theirs
                  in their rightmost column and the two on the right hold theirs
                  in their leftmost, and that is the position tolerance
                  arriving. And each cell&rsquo;s star is a single stroke lying
                  vertically, because the edge runs vertically even though the
                  direction being counted is horizontal.
                </p>
              </SubSection>

              <SubSection title="8. How heavily a pixel votes">
                <p>
                  A pixel does not vote once. It votes with a weight equal to
                  how sharply the brightness is changing there, so a pixel in
                  the middle of a strong edge counts for a great deal and a
                  pixel in a nearly flat region counts for almost nothing. That
                  is what stops a large area of very slight shading from
                  outvoting the outline that we actually care about.
                </p>
                <Equation>{`H(cell, b) = sum over pixels in the cell of  magnitude(pixel) × share(direction(pixel), b)`}</Equation>
                <>
                  <p>
                    Multiplying every brightness by 1.6 multiplies every gradient
                    magnitude, and therefore every unnormalized histogram value, by 1.6.
                    The change vector has sixty percent of the original magnitude.
                  </p>
                  <Equation>{"relative change = 1.6 − 1 = 0.6\nchange in descriptor ≈ 0.6 × 221.49 ≈ 132.89"}</Equation>
                  <p>
                    The measured values match this prediction. Normalization is needed
                    to remove this dependence on overall contrast.
                  </p>
                </>
                <KeepInMind>
                  The counts in a cell are a sum of magnitudes and not a
                  probability, so they do not add to one and they grow with the
                  contrast of the picture. Part 4 is where that is dealt with,
                  and it is dealt with across groups of cells rather than inside
                  one.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What a cell throws away, and what that buys">
                <p>
                  The tolerance is not free, and the price is measurable on
                  three small patches. Draw a bright square 3 pixels across
                  inside a cell, then draw the same square somewhere else inside
                  that same cell, then draw it again over in the next cell
                  along. Both moves change the brightnesses by exactly the same
                  amount, 4.2426, since in each case the square is drawn clear
                  of where it was.
                </p>
                <InsideOneCell />
                <>
<p>
                  The move that stays inside the cell leaves the description at a distance of exactly 0, which is the same vector rather than a nearby one. The move that crosses the cell edge takes it 1.4142 away, out of an answer whose own length is 1, and 1.4142 is the furthest apart two answers of that length can be.
                </p>
                <p>
                  So the same change in the brightnesses produces no change at all in one case and the largest change available in the other, and which of the two happens is decided by where the cell edges were drawn.
                </p>
</>
                <WhyThisWorks>
                  <p>
                    Why 1.4142 is the ceiling needs one fact about the
                    description. Every entry in it is a sum of vote weights,
                    and a weight is how sharply the brightness changes, which
                    is never below nought. So no entry is ever negative, and
                    two answers of length 1 are as far apart as they can be
                    when they have no bucket in common at all, every entry
                    that is above nought in one being nought in the other.
                    The squared distance is then the sum of the two squared
                    lengths.
                  </p>
                  <Equation>{`with no entry in common     apart² = 1² + 1² = 2     so     apart = √2 ≈ 1.4142`}</Equation>
                  <p>
                    The square that crossed into the next cell is exactly that
                    case. Its votes left the cell that held them for one that
                    held nothing, so the two unit blocks have no position
                    above nought in common, and the distance between them is
                    the largest the method can report for two answers of that
                    length.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  This is where the method is worse than reading the
                  brightnesses directly. Two patches that a person would call
                  obviously different can come back as the same vector, and no
                  amount of care further along recovers the difference, because
                  it was discarded before anything further along ran. Choosing a
                  smaller cell shrinks the region inside which everything is
                  indistinguishable and adds more cell edges for a shape to fall
                  across, so it works on both problems at once and neither of
                  them goes away.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "Relighting the scene leaves the two lists of 2304 brightnesses 19.52 apart, against the first list’s own length of 21.89. What happens to the rates of change?",
              [
                "No direction turned by more than 6.2 times ten to the minus thirteenth of a degree, and every rate of change grew by the same factor of 1.60",
                "Both the directions and the sizes come back unchanged",
                "The directions all turn by the same angle, and the sizes hold",
                "The directions hold, and the sizes are untouched by the multiplier",
              ],
              0,
              "The added constant cancels because every sweep’s weights add to nought, so it contributes that constant times nought. The multiplier survives and stretches all the arrows while turning none of them, because a direction is the ratio of two rates of change and a common factor cancels out of a ratio. So the added constant is already free, and the multiplier is a real problem that is still there.",
            ),
            trueFalse(
              "Reading a rate of change at every pixel gives the scene two numbers per pixel, 4608 where there were 2304, and still describes nothing.",
              true,
              "Each of those numbers is tied to an exact position, so the same shape drawn one pixel to the left disagrees with the original at almost every position, exactly as the brightnesses did. What is wanted is to keep the directions, which held still under the lamp, and give up some of the precision about where each one was, and that trade is what the three stages make.",
            ),
            trueFalse(
              "At a cell side of 16 pixels the scene divides into 3 cells by 3, the square lies almost wholly inside one of them, and a movement of five pixels can then change the answer by nothing at all.",
              true,
              "The cell side is the dial that trades tolerance to position against knowing where anything was, and nothing in the method sets it. At 8 pixels the scene divides into 6 cells by 6 and the 11 pixel square spreads over six of them, so the same movement crosses cell edges and the answer changes. A larger cell buys more tolerance by throwing more away, which is why there is no sense in which 8 pixels is correct.",
            ),
            choice(
              "A bright square 3 pixels across is moved within its cell, and then moved into the next cell along. Both moves change the brightnesses by exactly 4.2426. What happens to the description?",
              [
                "The move inside the cell leaves it at a distance of exactly 0 and the move across takes it 1.4142 away, the furthest two answers of length 1 can be",
                "Both moves change it by the same amount, since both changed the brightnesses by the same amount",
                "Both leave it unchanged, which is the tolerance the cells buy",
                "The move inside the cell changes it slightly and the move across not at all",
              ],
              0,
              "Which of the two happens is decided by where the cell edges were drawn, and no amount of care further along recovers the difference, because it was discarded before anything further along ran. The 1.4142 is the square root of two, which is as far apart as two answers of length 1 with no entry in common can be. A smaller cell shrinks the region inside which everything is indistinguishable and adds more cell edges for a shape to fall across, so it works on both problems at once and neither goes away.",
            ),
            several(
              "Which of these hold under the page’s nine unsigned buckets?",
              [
                "A direction and its reverse count as one, so the range is half a circle and each bucket covers twenty degrees",
                "On the 6 by 6 patch with cells 3 pixels on a side, each cell collects 12 of weight and under whole votes all of it lands in bucket 0",
                "Bucket 4 covers 80 up to 100 degrees and is centred on 100",
                "A cell’s counts add to one, since a histogram is a distribution",
              ],
              [0, 1],
              "A bucket is centred halfway along its span, so bucket 4, covering 80 up to 100, is centred on 90, and bucket 8 on 170. The sweep answers 4 at every pixel of the two columns beside the patch’s edge, so each cell holds 3 pixels of 4 and the four cells hold 48 between them. The counts are a sum of magnitudes rather than a probability, so they do not add to one and they grow with the contrast of the picture, which is what Part 4 removes.",
            ),
        ],
        },
        {
          title: "Part 3. Sharing One Vote Between Two Buckets",
          content: (
            <>
              <SubSection title="10. A whole vote jumps at a boundary">
                <p>
                  Dropping a vote whole into the bucket its direction falls in
                  is the obvious rule and it has a bad property at the edges
                  of the buckets. Two patches whose edges differ by an
                  arbitrarily small amount, one on each side of a boundary,
                  produce cells with no weight in common at all.
                </p>
                <p>
                  The cleanest way to see it is a picture whose brightness rises
                  along a straight ramp, since the direction is then the same at
                  every interior pixel and is exactly the angle the ramp was
                  drawn at. Turn such a ramp from 19 degrees to 21, across the
                  boundary at 20, and an interior cell&rsquo;s histogram moves
                  by 724.08 under the whole-vote rule, which is the entire
                  contents of the cell leaving one bucket and arriving in
                  another.
                </p>
              </SubSection>

              <SubSection title="11. Sharing it in proportion slides instead">
                <p>
                  The repair is to look at the two bucket centres nearest the
                  direction and give each of them a share in proportion to how
                  near it is. A direction exactly on a centre gives that bucket
                  everything; a direction a quarter of the way from one centre
                  to the next gives three quarters to the first and a quarter to
                  the second.
                </p>
                <Equation>{`position = direction / w

lower = floor(position − 0.5)      upper = lower + 1

share of upper = position − 0.5 − lower       share of lower = 1 − that`}</Equation>
                <p>
                  At 19 degrees the cell reads 0.55 in the first bucket and 0.45
                  in the second, and at 21 degrees it reads 0.45 and 0.55. The
                  same two degrees of turn now move it by 72.41 instead of
                  724.08, and the ratio between those two numbers is 10 to
                  within 4.4 times ten to the minus fourteenth. Two degrees is
                  a tenth of a 20 degree bucket, so a tenth is exactly what
                  ought to move.
                </p>
                <VoteSharingSlide />
                <WhyThisWorks>
                  <p>
                    The sharing is the linear interpolation you would use to
                    read a value between two entries of a table, applied to
                    which bucket a vote belongs to rather than to a value. It
                    makes the histogram a continuous function of the direction,
                    so a small turn of the picture produces a small change in
                    the answer, which is what a description handed to a
                    classifier needs if nearby inputs are to get nearby scores.
                  </p>
                  <p>
                    The wrapping matters as much as the interpolation. The
                    buckets go round a circle, so the last one is a neighbour of
                    the first, and over half a circle that is a statement
                    about geometry rather than a convenience of the arithmetic,
                    since 180 degrees and 0 degrees are the same direction once
                    a direction and its reverse have been folded together.
                  </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="12. A clean upright edge that reads as two half-full buckets">
                <p>
                  Now go back to the 6 by 6 patch, whose one edge is upright and
                  whose direction is exactly 0 degrees, and switch the sharing
                  on. Each cell&rsquo;s 12 of weight comes apart into 6 in
                  bucket 0 and 6 in bucket 8, and nothing anywhere else. That
                  looks like a mistake and it is not one.
                </p>
                <EdgeToBucket initialSharing="shared" />
                <>
                  <p>
                    The first bin centre is ten degrees and the last is 170 degrees.
                    Unsigned orientations wrap around after 180 degrees, making zero
                    equally close to those two centres.
                  </p>
                  <Equation>{"wraparound distance = 180° − 170° = 10°\nordinary distance = 10° − 0° = 10°\nweight in each bin = 1/2"}</Equation>
                  <p>
                    The square’s upright edges split their contributions equally between
                    these neighbouring bins. The initial playground cell shows that
                    split.
                  </p>
                </>
                <p>
                  Compare that with an edge running left to right, whose
                  direction is 90 degrees. That is the centre of bucket 4, so
                  the sharing gives that bucket everything and the two rules
                  agree exactly. What decides the behaviour is how far the
                  direction falls from the nearest centre, and 0 degrees happens
                  to be the furthest a direction can fall from one, which is 10
                  degrees under this arrangement of buckets.
                </p>
                <KeepInMind>
                  A single clean edge occupying two buckets at half strength
                  each is the correct answer under this rule, and reading it as
                  a bug and moving the bucket edges to fix it would only move
                  the halfway points somewhere else.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. What the sharing costs">
                <p>
                  Nothing has been gained for free. Under whole votes a pure
                  direction lands in one bucket and the cell says with complete
                  confidence which of the nine it was; under sharing the same
                  pure direction is spread over two, and the fullest bucket
                  holds between 0.5 and 1.0 of the cell depending on where the
                  direction fell. So a reader of the description can no longer
                  recover which single bucket a pure direction belonged to, and
                  in return a turn of two degrees changes the answer by
                  something proportional to two degrees.
                </p>
                <>
<p>
                  Drag the slider above to 30 degrees and both rules put everything in the second bucket, since 30 is that bucket&rsquo;s centre. Drag to 20, which is a boundary rather than a centre, and the shared rule reads a clean half and half while the whole-vote rule reads 0.4531 and 0.5469, because the ramp&rsquo;s direction is worked out pixel by pixel and lands on either side of the boundary by amounts far below anything the picture could distinguish.
                </p>
                <p>
                  That is what a rule with a jump in it does when handed the jump, and it is why the shared rule is the one worth building on, at the price that no cell ever again reports a direction more precisely than the two buckets it falls between.
                </p>
</>
                <KeepInMind>
                  Only the direction is shared here. The original work also
                  shares each vote between neighbouring cells, which removes the
                  same kind of jump in space that this removes in angle. That is
                  absent from what this page measures rather than hidden, and it
                  is the obvious next thing to add.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Rescaling Overlapping Blocks Of Cells",
          content: (
            <>
              <SubSection title="14. A block, and dividing it by its own length">
                <p>
                  The counts in a cell still grow with the contrast of the
                  picture, so we are one factor away from a description that
                  does not read the lamp at all. Removing a common factor from a
                  vector is easy, and the only real decision is which vector to
                  remove it from.
                </p>
                <p>
                  The answer is neither one cell nor the whole patch. Cells are
                  gathered into small groups, 2 by 2 by default, and each group
                  is laid end to end into one vector of 36 numbers and divided
                  by its own length. The 36 is four cells of nine buckets each,
                  and the length is the same square root of a sum of squares
                  that Part 1 used on two lists of brightnesses, so dividing by
                  it leaves a vector of length exactly 1 whatever the contrast
                  of the picture was. A group of cells is called a block, and the
                  reason for choosing that size rather than the whole patch is
                  that lighting across a real photograph is not uniform, so a
                  factor that holds over a 16 pixel square often does not hold
                  over a whole person.
                </p>
                <Equation>{`block = ( cell₁ , cell₂ , cell₃ , cell₄ )        36 numbers

rescaled = block / ‖block‖`}</Equation>
              </SubSection>

              <SubSection title="15. Only half of a change of lighting needed rescaling">
                <p>
                  Here is the sharpest measurement on the page, and it
                  contradicts the way the step is usually described. Rescaling
                  the blocks is said to give the description its tolerance to
                  lighting. Half of that is true. Split the change of lighting
                  into its two parts, the constant added to every brightness and
                  the factor every brightness is multiplied by, and measure each
                  on its own with the rescaling switched off.
                </p>
                <p>
                  Adding 0.15 to every brightness moves the unrescaled
                  description by 8.4 times ten to the minus fourteenth, which is
                  nothing at all. That half was already free two stages earlier,
                  bought by the weights of the sweep adding to nought.
                  Multiplying every brightness by 1.6 moves the same unrescaled
                  description by 132.89, against an answer whose own length is
                  221.49. Switch the rescaling on and the whole change together
                  moves it by 2.3 times ten to the minus fifteenth.
                </p>
                <LightingLedger />
                <p>
                  Push the multiplier to 3.7 and the shift to 12, which is a far
                  more violent relighting than any photograph would receive, and
                  the unrescaled answer moves 598.02 while the rescaled one
                  stays at about ten to the minus fifteenth. The rescaled
                  distance does not grow with the multiplier at all, because the
                  factor cancels exactly and what is left is the rounding of the
                  arithmetic that cancelled it.
                </p>
                <KeepInMind>
                  Saying that rescaling the blocks buys tolerance to lighting
                  credits it with something it did not do. It buys tolerance to
                  the multiplier and nothing else, and the two halves are worth
                  keeping apart because a reader who believes the whole thing
                  happens here will not understand why it is done over small
                  groups of cells rather than once at the end.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Four ways to rescale a block, and what each puts it on">
                <p>
                  Dividing by the length is one choice among several, and all of
                  them remove a common factor, which is the property that
                  matters. They differ in how much weight they leave on a
                  block&rsquo;s loudest direction relative to its quietest.
                </p>
                <NumberTable
                  headings={[
                    "What is done to a block",
                    "First block sums to",
                    "First block’s length",
                    "Relit answer moves by",
                  ]}
                  rows={[
                    ["left alone", "142.210", "52.257", "132.894"],
                    ["divided by the sum of its entries", "1.000", "0.367", "7.9e−16"],
                    ["that, and then square-rooted", "3.573", "1.000", "1.8e−15"],
                    ["divided by its own length", "2.721", "1.000", "2.9e−15"],
                    [
                      "divided by its length, cut back, divided again",
                      "3.339",
                      "1.000",
                      "2.3e−15",
                    ],
                  ]}
                  caption="Measured on the scene, at the usual settings. Every rescaling removes the multiplier completely, and what separates them is the shape they leave the block in."
                />
                <p>
                  Dividing by the sum makes a block add to one, which is the
                  shape of a distribution; taking the square root of that pulls
                  the large entries down towards the small ones and happens to
                  leave the block a unit vector as well. Dividing by the length
                  makes it a unit vector directly. The last row is the default
                  and is the subject of the next step.
                </p>
              </SubSection>

              <SubSection title="17. Cutting the loudest direction back">
                <p>
                  One extremely sharp edge inside a block can take almost the
                  whole of that block&rsquo;s allowance, leaving the weaker
                  directions around it with nearly nothing to say. The default
                  rule makes the block a unit vector, cuts any entry above 0.2
                  back to 0.2, and then makes it a unit vector again.
                </p>
                <Equation>{`unit  =  block / ‖block‖

cut   =  min(unit, 0.2)

answer = cut / ‖cut‖`}</Equation>
                <p>
                  On the scene, the largest entry of the description falls from
                  0.9274 under plain division by the length to 0.5376 with the
                  cut, so the loudest direction has lost a little over two
                  fifths of its share and the rest of its block has gained it.
                  What is bought is the ratio between the loudest direction in a
                  block and the quietest, which is what lets a faint edge beside
                  a strong one survive into the answer at all.
                </p>
                <KeepInMind>
                  The 0.2 is a limit on the way in and not a ceiling on the way
                  out, and the last Part measures how thoroughly it is not one.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Blocks that overlap, and cells described more than once">
                <p>
                  The last thing the method does looks wasteful. The blocks do
                  not tile the grid of cells; they step one cell at a time, so a
                  cell away from the border belongs to four different blocks and
                  reaches the answer four times, each time divided by a
                  different denominator.
                </p>
                <BlockOverlapMap initialPreset={2} />
                <>
                  <p>
                    Overlapping two-by-two blocks reuse cells. In a three-by-three cell
                    grid, each corner belongs to one block, each non-corner edge cell to
                    two, and the centre to four.
                  </p>
                  <Equation>{"cell appearances = 4 × 1 + 4 × 2 + 1 × 4 = 16"}</Equation>
                  <p>
                    The nine cells therefore contribute sixteen sets of histogram
                    values. On the six-by-six scene, thirty-six cells produce one
                    hundred such appearances.
                  </p>
                </>
                <WhyThisWorks>
                  <p>
                    The repetition is the point rather than an accident of the
                    arrangement. A cell that sits beside a very strong edge is
                    dimmed by that neighbour in the block they share, and left
                    alone in a block on its other side that does not contain the
                    strong edge. Both readings survive into the description, so
                    whichever of them turns out to be informative is available
                    to whatever reads it, and the classifier is given the choice
                    instead of having it made in advance by where the block
                    boundaries happened to fall.
                  </p>
                  <p>
                    Switching the blocks to tile instead, with the widget above,
                    shows what is lost. Every cell is then described once, under
                    exactly one denominator, and the answer is four times
                    shorter and carries only the reading that its own block
                    happened to give it.
                  </p>
                </WhyThisWorks>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Turning a ramp from 19 degrees to 21, across the boundary at 20, moves a cell’s histogram by 724.08 under whole votes. What does sharing between the two nearest centres give?",
              [
                "72.41, a tenth of the whole-vote move, because two degrees is a tenth of a twenty-degree bucket",
                "724.08 still, since the direction crossed a boundary either way",
                "Nothing at all, since the two centres are equally near",
                "1.4142, the furthest two answers of length 1 can be",
              ],
              0,
              "At 19 degrees the cell reads 0.55 and 0.45 and at 21 it reads 0.45 and 0.55, and the ratio between the two moves is 10 to within 4.4 times ten to the minus fourteenth. Sharing makes the histogram a continuous function of the direction, so a small turn of the picture produces a small change in the answer, which is what a description handed to a classifier needs if nearby inputs are to get nearby scores.",
            ),
            trueFalse(
              "A clean upright edge splitting its weight evenly between the first bucket and the last is a fault in the wrapping.",
              false,
              "The first centre is 10 degrees and the last is 170, and once directions wrap at 180 the two are equally near to 0, which makes 0 degrees the furthest a direction can fall from any centre under this arrangement. An edge running left to right, at 90 degrees, sits exactly on the centre of bucket 4 and the two rules agree on it. Reading the split as a bug and moving the bucket edges would only put the halfway points somewhere else.",
            ),
            choice(
              "What does sharing a vote cost?",
              [
                "A reader can no longer recover which single bucket a pure direction belonged to, since the fullest bucket holds between 0.5 and 1.0 of the cell",
                "Nothing, since the two rules agree on every direction",
                "The histogram stops being a continuous function of the direction",
                "The wrapping between the last bucket and the first",
              ],
              0,
              "Under whole votes a pure direction lands in one bucket and the cell says with complete confidence which of the nine it was. Handed a direction on a boundary, though, the whole-vote rule reads 0.4531 and 0.5469 where the shared rule reads a clean half and half, because the ramp’s direction is worked out pixel by pixel and falls on either side by amounts nothing in the picture could distinguish. The two rules agree only where a direction sits exactly on a centre, as at 30 degrees.",
            ),
            choice(
              "Rescaling the blocks is usually said to buy the tolerance to lighting. What did splitting the change in two show?",
              [
                "Adding 0.15 to every brightness already moved the unrescaled description by 8.4 times ten to the minus fourteenth, so the rescaling buys tolerance to the multiplier and nothing else",
                "The rescaling buys both halves, exactly as it is usually described",
                "The rescaling buys tolerance to the added constant and nothing else",
                "Neither half is bought by the rescaling",
              ],
              0,
              "Multiplying every brightness by 1.6 moves the unrescaled description by 132.89 against an answer whose own length is 221.49, and with the rescaling on the whole change moves it by 2.3 times ten to the minus fifteenth. Every one of the four ways of rescaling removes the multiplier completely, and what separates them is the shape they leave a block in. Keeping the two halves apart is what explains why the step is done over small groups of cells rather than once at the end.",
            ),
            several(
              "Blocks step one cell at a time instead of tiling. Which of these does the page give as the reason or the consequence?",
              [
                "A cell away from the border belongs to four blocks and reaches the answer four times, each under a different denominator",
                "A cell beside a strong edge is dimmed in the block they share and left alone in a block that does not hold the strong edge",
                "Both readings survive, so the classifier is given the choice rather than having it made by where the boundaries happened to fall",
                "Tiling the blocks instead gives an answer four times shorter, in which every cell is described once under exactly one denominator",
              ],
              [0, 1, 2, 3],
              "Every one of the four holds. The repetition is the point rather than an accident of the arrangement, and the claim about tiling is what the widget shows when the blocks are switched to tile, since what tiling gives up is the second, third and fourth readings of each middle cell. On a 3 by 3 grid the nine cells make sixteen appearances in the answer, and on the scene’s 6 by 6 grid thirty-six cells make a hundred.",
            ),
        ],
        },
        {
          title: "Part 5. Half A Circle Or The Whole One, And How Long The Answer Is",
          content: (
            <>
              <SubSection title="19. A bright thing on a dark ground and its opposite">
                <p>
                  Everything so far has folded a direction together with its
                  reverse, so that 30 degrees and 210 degrees land in one
                  bucket. That was a choice, and it can be made the other way by
                  dividing the whole circle instead of half of it. The
                  difference shows on the simplest fixture there is, a bright
                  bar on a dark ground beside the same bar with its brightness
                  turned inside out.
                </p>
                <p>
                  The bar has two edges, and they are one edge seen from either
                  side, so their directions are exactly opposite. Over half a
                  circle they fall in one bucket and the bar occupies a single
                  bucket of the nine. Over the whole circle they fall in two,
                  centred on 10 degrees and 190 degrees, half the weight in each.
                </p>
                <RangeChoiceCompare />
                <p>
                  The number that decides the choice is the distance between the
                  bar and its inverted twin. Over half a circle it is exactly 0,
                  the same vector to the last bit, so the description cannot see
                  the inversion at all. Over the whole circle it is 1.41421,
                  which is the furthest apart two answers of length 1 can be, so
                  the description sees nothing else. On the whole scene the same
                  comparison gives 4.2 times ten to the minus fifteenth against
                  5.9899, out of a length of 5.
                </p>
              </SubSection>

              <SubSection title="20. Why the pedestrian work folded the circle">
                <>
<p>
                  A person in a dark coat against a bright wall and the same person in a light coat against a dark one produce gradients that point opposite ways along the same silhouette. A description over the whole circle calls those two people as different as two descriptions can be, when the thing a detector has to learn is that they are the same shape, and a description over half a circle hands it both of them as one case.
                </p>
                <p>
                  That is the argument Dalal and Triggs made, and the measurement above is that argument in two numbers.
                </p>
</>
                <p>
                  It is not always the right choice. Where the direction of the
                  contrast is itself information, keeping the whole circle is
                  worth twice as many numbers per cell. Printed text is the
                  obvious case, since light letters on a dark page and dark
                  letters on a light page really are different things and a
                  reader wants to know which, and there the 1.41421 measured
                  above is the useful answer and the 0 is the useless one.
                </p>
                <KeepInMind>
                  Folding the circle is a deliberate loss of information, chosen
                  because for the job of finding people that information was
                  noise. It is worth asking, before taking the default, whether
                  the thing being described is ever going to appear against a
                  background lighter than itself, since if it is not then the
                  fold has cost something and bought nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. How long the finished answer is">
                <p>
                  The length of the description follows from the arrangement and
                  nothing else. Divide the sides of the patch by the cell side to
                  get the grid of cells; the block positions along a side follow
                  from the block&rsquo;s own side and how far it steps; and each
                  block contributes one number per bucket per cell it holds.
                </p>
                <Equation>{`cells across = width / cell side          cells down = height / cell side

blocks across = cells across − block side + 1        (stepping one cell)

length = blocks across × blocks down × block side² × buckets`}</Equation>
                <WorkedExample>
                  <p>
                    For the pedestrian window, 64 wide and 128 tall with 8 pixel
                    cells, that is 8 cells across and 16 down. A 2 by 2 block
                    stepping one cell at a time has 7 positions across and 15
                    down, so 105 blocks. Each block holds 4 cells of 9 buckets,
                    which is 36 numbers.
                  </p>
                  <Equation>{`7 × 15 × 4 × 9 = 3780`}</Equation>
                  <p>
                    That is Dalal and Triggs&rsquo; own figure for their
                    descriptor, and the same arithmetic on the scene this page
                    uses gives 5 by 5 blocks of 36, which is 900.
                  </p>
                </WorkedExample>
                <BlockOverlapMap initialPreset={0} showStride={false} />
              </SubSection>

              <SubSection title="22. What it costs">
                <p>
                  The pedestrian window holds 8192 brightnesses and its
                  description holds 3780 numbers, which is 0.46 numbers per
                  pixel. So the description is smaller than the picture, though
                  not by much, and it is a great deal larger than the 128 cells
                  it is built from would suggest, because the overlap describes
                  those 128 cells in 420 cells&rsquo; worth of numbers.
                </p>
                <NumberTable
                  headings={[
                    "Arrangement",
                    "Cells",
                    "Cells’ worth in the answer",
                    "Numbers",
                  ]}
                  rows={[
                    ["64 by 128, blocks overlapping", "128", "420", "3780"],
                    ["48 by 48, blocks overlapping", "36", "100", "900"],
                    ["24 by 24, blocks overlapping", "9", "16", "144"],
                    ["24 by 24, blocks tiling", "9", "4", "36"],
                  ]}
                  caption="Overlapping blocks cost between 1.8 and 3.3 times as many numbers as there are cells, and the multiplier grows with the grid because a larger grid has proportionally fewer border cells."
                />
                <p>
                  That is the price a sliding-window detector pays at every one
                  of the many thousands of positions it examines in a
                  photograph, so the arrangement is worth arguing about. Tiling
                  the blocks instead brings the 24 by 24 case from 144 numbers
                  to 36, and what it gives up is the second and third and fourth
                  readings of each middle cell that Part 4 measured.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where The Method Stops Being Defined",
          content: (
            <>
              <SubSection title="23. A patch that has been turned">
                <p>
                  Every stage above measures a direction from a fixed axis and
                  assigns a pixel to a cell by its fixed position, so turning
                  the patch turns every direction with it and moves every pixel
                  into a different cell. The description is not defined to
                  survive that and it does not.
                </p>
                <p>
                  Turn the scene a quarter circle, which is exact because every
                  pixel lands on a pixel and nothing has to be guessed in
                  between, and the description moves 5.2331 where its own length
                  is 5. The move is larger than the whole answer. Relighting the
                  same scene moves it 2.3 times ten to the minus fifteenth.
                  Those two figures are fifteen orders of magnitude apart, and
                  quoting either one on its own gives a badly wrong impression
                  of what the method does.
                </p>
                <TurnedAgainstRelit />
                <>
<p>
                  It would be comfortable to blame the buckets. At 9 buckets a quarter turn is four and a half buckets, so the directions do not land cleanly on new buckets, and one might hope that a count dividing 90 exactly would fix it. It does not. At 6 buckets, where each covers 30 degrees and a quarter turn is exactly three of them, the answer still moves 0.95 of its own length, and no way of rescaling a block brings any of it below 0.98.
                </p>
                <p>
                  The directions are only half of the problem, since the cells have moved as well, and no arithmetic over buckets can undo that.
                </p>
</>
                <KeepInMind>
                  This is why the family of methods that followed begins by
                  measuring a patch&rsquo;s own dominant direction and turning
                  the patch to face it before counting anything. That step is
                  outside this method and it is what a description meant to
                  survive rotation has to add.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A grid chosen in advance, and a thing at the wrong size">
                <p>
                  The cell side is a number a person picks, and once picked it
                  fixes what counts as a small movement. Nothing in the method
                  derives it from the picture, and there is no sense in which
                  8 pixels is correct. That is a genuine gap rather than an
                  omission, because the right cell size depends on how large the
                  thing being described is in the picture, which is not known
                  until it has been found.
                </p>
                <p>
                  The same fact makes the description depend on scale. An object
                  twice as far from the camera fills a quarter as many cells, so
                  its edges fall across a different arrangement of cells and its
                  description is a different length, which cannot even be
                  compared with the first. Two descriptions of different lengths
                  do not correspond position by position and the distance
                  between them has no meaning, so the comparison is undefined
                  rather than merely poor.
                </p>
                <p>
                  The usual repair lives outside the method. Resize the picture
                  several times over, run the whole thing at each size, and keep
                  whichever answer scored best. That turns one description into
                  a family of them and turns the cost measured in the last Part
                  into that cost times the number of sizes tried.
                </p>
              </SubSection>

              <SubSection title="25. Brightness that does not change has no direction">
                <p>
                  Where the brightness is flat in both directions the rate of
                  change is nought in both directions, and the angle of a vector
                  of length nought does not exist. Every implementation has to
                  answer something, and the reasonable answers are to record
                  nought degrees, to record nothing at all, or to refuse. Since
                  the vote is weighted by the magnitude, a pixel like that votes
                  with weight nought whichever answer is chosen, so the choice
                  is invisible in the counts.
                </p>
                <p>A flat image region creates a zero gradient histogram. Normalizing that histogram requires care because its length is zero, and direct division by that length is undefined.</p>
<p>We therefore need a stated policy. We can leave a zero block unchanged, stabilize the denominator with a small positive constant, or reject the block. The first two preserve a useful interpretation, which is that this region has no measured edge structure.</p>
<p>The stabilizing constant also affects nearly flat regions, where dividing by a tiny length could amplify numerical noise. In the displayed uniform scene, the accumulated gradient weight is zero and the implementation returns a zero descriptor.</p>
              </SubSection>

              <SubSection title="26. A limit that is not a ceiling">
                <p>
                  The cut at 0.2 is applied to a unit vector and the block is
                  then made a unit vector again, so the cut entry is divided by
                  a length that the cut itself made smaller. Whenever the cut
                  removed anything at all it comes back above 0.2, and the
                  arithmetic says so before any picture is involved.
                </p>
                <WorkedExample>
                  <>
                    <p>
                      The example block has eight entries of six and twenty-eight zeros.
                      Normalize it, clip every value above 0.2, then inspect the clipped
                      vector’s length.
                    </p>
                    <Equation>{"original length = √(8 × 6²) = √288 ≈ 16.9706\nnormalized nonzero entry = 6 / √288 ≈ 0.353553\nclipped nonzero entry = 0.2\nclipped length = √(8 × 0.2²) ≈ 0.565685"}</Equation>
                    <p>
                      All eight nonzero entries are clipped. The following normalization
                      restores unit length.
                    </p>
                  </>
                  <Equation>{`0.2 / 0.565685 = 0.353553`}</Equation>
                  <p>
                    Every entry is back exactly where it started. The cut
                    changed nothing whatever, and the entry the limit was
                    supposed to hold at 0.2 ends at 0.3536.
                  </p>
                </WorkedExample>
                <>
<p>
                  On the scene, where the entries are not all equal, the cut does change the answer and still does not enforce the limit. The largest entry falls from 0.9274 to 0.5376, which is nearly three times the limit it was cut to. And the number of entries in the whole description above 0.2 rises from 170 to 248, because making each block a unit vector again lifts everything that was not cut.
                </p>
                <p>
                  What the step does is move weight from the loud entries of a block to the quiet ones, and the 0.2 governs how much moves rather than where any entry ends up.
                </p>
</>
              </SubSection>

              <SubSection title="27. What has to be decided">
                <DerivationTable
                  expressionHeading="The case"
                  reasonHeading="What is undefined, or what must be chosen"
                  rows={[
                    {
                      expression: "brightness flat at a pixel",
                      reason:
                        "The rate of change is nought in both directions and its angle does not exist. Any answer is a convention, and the weighting by magnitude makes the convention invisible in the counts.",
                    },
                    {
                      expression: "every cell of a block flat",
                      reason:
                        "Dividing by the block’s own length is a division by nought. Answering with noughts, adding a constant to the denominator and refusing the patch are the three choices, and they differ in what a patch of blank sky is said to be.",
                    },
                    {
                      expression: "a direction halfway between two centres",
                      reason:
                        "Genuinely split in half by the sharing rule, and 0 degrees is such a direction over half a circle, so a clean upright edge reads as two half-full buckets. Moving the bucket edges only moves the halfway points.",
                    },
                    {
                      expression: "the patch does not divide into whole cells",
                      reason:
                        "The leftover strip either votes in a cell of a different size, which changes what a number in the answer means, or does not vote at all, which loses an edge silently. Refusing is the only choice that does neither.",
                    },
                    {
                      expression: "blocks stepping further than their own width",
                      reason:
                        "Cells between two block positions belong to no block and never reach the answer, so part of the patch is described by nothing at all.",
                    },
                    {
                      expression: "two patches of different sizes",
                      reason:
                        "Their descriptions have different lengths, so position 40 of one and position 40 of the other are counts of different things and the distance between them is a number with no meaning.",
                    },
                    {
                      expression: "the patch has been turned",
                      reason:
                        "The method is defined against a fixed axis, so this is outside what it describes. Measured on the scene, a quarter turn moves the answer 5.2331 where its own length is 5, against 2.3e−15 for a change of lighting.",
                    },
                    {
                      expression: "an entry above the cut limit",
                      reason:
                        "Renormalising after the cut puts it back above the limit, so the limit constrains the ratios inside a block rather than any single entry. On the scene the largest entry ends at 0.5376 against a limit of 0.2.",
                    },
                  ]}
                />
                <KeepInMind>
                  Three of those eight are choices with a cost attached and the
                  rest are places the arithmetic has no answer at all. The
                  awkward ones are the two about a patch that does not divide
                  and about two patches of different sizes, because rounding
                  either of them away produces a description of the right shape
                  and the right general appearance whose numbers count different
                  things at different positions, and nothing downstream can
                  detect that.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "A bright bar on a dark ground, beside the same bar with its brightness turned inside out. How far apart are the two descriptions?",
              [
                "Exactly 0 over half a circle, and 1.41421 over the whole circle",
                "1.41421 either way",
                "Exactly 0 either way, since nothing in the shape has moved",
                "0 over the whole circle and 1.41421 over half of it",
              ],
              0,
              "The bar’s two edges are one edge seen from either side, so their directions are exactly opposite and fold into one bucket over half a circle, while over the whole circle they land in two buckets centred on 10 and 190 degrees with half the weight in each. That is Dalal and Triggs’ argument in two numbers, since a person in a dark coat against a bright wall is the same shape as one in a light coat against a dark wall, and for printed text the 1.41421 is the useful answer and the 0 the useless one.",
            ),
            choice(
              "The pedestrian window is 64 wide and 128 tall with 8 pixel cells. How does its description reach 3780 numbers?",
              [
                "8 cells across and 16 down give 7 by 15 block positions, so 105 blocks of 36 numbers each",
                "8 by 16 block positions, one per cell, of 36 numbers each",
                "128 cells of 9 buckets, once for each of the scales searched",
                "7 by 15 block positions of 9 numbers each, one bucket per block",
              ],
              0,
              "A 2 by 2 block stepping one cell at a time has one position fewer than there are cells along each side, and each block holds 4 cells of 9 buckets, which is 36 numbers. That is Dalal and Triggs’ own figure for their descriptor. The window holds 8192 brightnesses, so the description is smaller than the picture though not by much, and it is far larger than the 128 cells it is built from would suggest, because the overlap describes those 128 cells in 420 cells’ worth of numbers.",
            ),
            trueFalse(
              "A bucket count that divides 90 exactly would let the description survive a quarter turn.",
              false,
              "A quarter turn moves the description 5.2331 where its own length is 5, and at 6 buckets, where a quarter turn is exactly three of them, it still moves 0.95 of its own length, with no way of rescaling a block bringing any of it below 0.98. The directions are only half the problem, since the cells have moved as well and no arithmetic over buckets can undo that.",
            ),
            choice(
              "Why is the description of an object twice as far away not merely a poorer match?",
              [
                "It fills a quarter as many cells, so it is a different length, and two descriptions of different lengths do not correspond position by position",
                "Its rates of change are weaker, so every entry comes out smaller",
                "Its directions have turned, so the buckets no longer line up",
                "The cut at 0.2 bites differently at the smaller size",
              ],
              0,
              "The distance between two descriptions of different lengths has no meaning, so the comparison is undefined rather than poor. The usual repair lives outside the method, resizing the picture several times over and keeping whichever answer scored best, which turns the cost of one description into that cost times the number of sizes tried.",
            ),
            several(
              "The cut at 0.2 is applied to a unit vector, which is then made a unit vector again. Which of these hold?",
              [
                "On a block of eight equal entries the cut changes nothing, and the entry it was meant to hold at 0.2 ends at 0.3536",
                "On the scene the largest entry falls from 0.9274 to 0.5376, which is nearly three times the limit it was cut to",
                "The number of entries in the whole description above 0.2 rises from 170 to 248",
                "After the step no entry can be above 0.2, which is what the limit is for",
              ],
              [0, 1, 2],
              "Whenever the cut removed anything at all the entry comes back above 0.2, because it is then divided by a length the cut itself made smaller, and the arithmetic says so before any picture is involved. What the step does is move weight from the loud entries of a block to the quiet ones, and the 0.2 governs how much moves rather than where any entry ends up.",
            ),
        ],
        },
        {
          title: "Practice. Describing The Scene With The Library",
          practice: [
            exercise(
              "Work the one-edge patch through with the library",
              ["Part 2 takes a patch 6 pixels square, dark on the left and bright on the right, with cells 3 pixels on a side, and counts 12 of weight into each of its four cells, all of it in bucket 0 under whole votes. Part 3 switches the sharing on and the same 12 comes apart into 6 in bucket 0 and 6 in bucket 8. Build the patch, count its votes under both rules with HistogramOfOrientedGradients, and read the top-left cell.", "Then describe the patch under the default settings. The four cells make one block, so the description is a single unit vector of 36 numbers, and it is the block of eight sixes that Part 6 works on paper. Read how long it is, its largest entry, and how many of its entries sit above the 0.2 limit."],
              `import numpy as np
from oop_ml.core.computer_vision.oriented_gradients import (
    HistogramOfOrientedGradients,
    VoteSharing,
)
from oop_ml.core.computer_vision.picture import Picture

patch = Picture([[0.0, 0.0, 0.0, 1.0, 1.0, 1.0] for _ in range(6)])
whole = HistogramOfOrientedGradients(cell_side=3, vote_sharing=VoteSharing.WHOLE_TO_NEAREST)
shared = HistogramOfOrientedGradients(cell_side=3)

# Count the votes into cells under each rule. Print the total weight and the
# grid of cells, then the top-left cell's nine buckets under each rule.
# Then describe the patch with the shared rule, and print how many numbers
# the description holds, its length, its largest entry and how many of its
# entries are above 0.2.`,
              `import numpy as np
from oop_ml.core.computer_vision.oriented_gradients import (
    HistogramOfOrientedGradients,
    VoteSharing,
)
from oop_ml.core.computer_vision.picture import Picture

patch = Picture([[0.0, 0.0, 0.0, 1.0, 1.0, 1.0] for _ in range(6)])
whole = HistogramOfOrientedGradients(cell_side=3, vote_sharing=VoteSharing.WHOLE_TO_NEAREST)
shared = HistogramOfOrientedGradients(cell_side=3)

counted_whole = whole.cell_histograms(patch)
counted_shared = shared.cell_histograms(patch)
print(f"total weight {counted_shared.total_weight:.1f} over {counted_shared.n_cell_rows} by {counted_shared.n_cell_columns} cells")
print(f"top-left cell under whole votes  {counted_whole.histogram_at(0, 0)}")
print(f"top-left cell under shared votes {counted_shared.histogram_at(0, 0)}")

described = shared.describe(patch)
entries = np.asarray(described)
print(f"description holds {described.n_values} numbers of length {described.length:.4f}")
print(f"largest entry {entries.max():.4f} with {int((entries > 0.2).sum())} entries above 0.2")`,
              `total weight 48.0 over 2 by 2 cells
top-left cell under whole votes  [12.  0.  0.  0.  0.  0.  0.  0.  0.]
top-left cell under shared votes [6. 0. 0. 0. 0. 0. 0. 0. 6.]
description holds 36 numbers of length 1.0000
largest entry 0.3536 with 8 entries above 0.2`,
              { hints: ["cell_histograms takes a Picture and answers an object holding one histogram per cell. total_weight, n_cell_rows and n_cell_columns are properties of it, and histogram_at(row, column) is one cell’s nine buckets as an array.", "The shared rule is the default, so the second model needs only the cell side. The whole-vote rule is VoteSharing.WHOLE_TO_NEAREST.", "describe takes the same Picture and answers the finished description. n_values and length are properties of it, and np.asarray turns it into a plain array for max and for a comparison with 0.2."], check: numberCheck("What is the largest entry of the finished description?", 0.3536, 0.0005, "The patch is one block of four identical cells, each holding 6 in bucket 0 and 6 in bucket 8, so the block has eight entries of 6 and twenty-eight of nought, which is exactly the block Part 6 works on paper. Its length is the square root of 288, and 6 over that is 0.3536. The cut to 0.2 takes all eight entries down together and the second division puts every one of them back, so the limit holds nothing here and all eight entries end above it.") },
            ),
            exercise(
              "Turn a ramp across a bucket boundary",
              ["Part 3 draws a picture whose brightness rises along a straight ramp, so that every interior pixel has the same direction, and turns the ramp from 19 degrees to 21, across the boundary between the first two buckets. Draw the two ramps, 24 pixels square, and read the middle cell at row 1 and column 1 under each voting rule.", "The lesson reports the cell moving 724.08 under whole votes and 72.41 under sharing. Print those, the shares in each bucket at both angles, and one number the lesson does not give, which is how much weight the cell holds."],
              `import numpy as np
from oop_ml.core.computer_vision.oriented_gradients import (
    HistogramOfOrientedGradients,
    VoteSharing,
)
from oop_ml.core.computer_vision.picture import Picture

rows, columns = np.mgrid[0:24, 0:24]
at_19 = Picture(np.cos(np.deg2rad(19)) * columns + np.sin(np.deg2rad(19)) * rows)
at_21 = Picture(np.cos(np.deg2rad(21)) * columns + np.sin(np.deg2rad(21)) * rows)

for sharing in (VoteSharing.WHOLE_TO_NEAREST, VoteSharing.SPLIT_BETWEEN_NEIGHBOURS):
    model = HistogramOfOrientedGradients(vote_sharing=sharing)
    # Read the middle cell, at row 1 and column 1, from each ramp's histograms.
    # Print the rule, the cell's total weight, its shares at each angle
    # rounded to two places, and how far the cell moved between the two.`,
              `import numpy as np
from oop_ml.core.computer_vision.oriented_gradients import (
    HistogramOfOrientedGradients,
    VoteSharing,
)
from oop_ml.core.computer_vision.picture import Picture

rows, columns = np.mgrid[0:24, 0:24]
at_19 = Picture(np.cos(np.deg2rad(19)) * columns + np.sin(np.deg2rad(19)) * rows)
at_21 = Picture(np.cos(np.deg2rad(21)) * columns + np.sin(np.deg2rad(21)) * rows)

for sharing in (VoteSharing.WHOLE_TO_NEAREST, VoteSharing.SPLIT_BETWEEN_NEIGHBOURS):
    model = HistogramOfOrientedGradients(vote_sharing=sharing)
    before = np.asarray(model.cell_histograms(at_19).histogram_at(1, 1))
    after = np.asarray(model.cell_histograms(at_21).histogram_at(1, 1))
    print(sharing.value)
    print(f"  cell weight {before.sum():.1f}")
    print(f"  shares at 19 degrees {np.round(before / before.sum(), 2)}")
    print(f"  shares at 21 degrees {np.round(after / after.sum(), 2)}")
    print(f"  moved {np.linalg.norm(after - before):.2f}")`,
              `whole_to_nearest
  cell weight 512.0
  shares at 19 degrees [1. 0. 0. 0. 0. 0. 0. 0. 0.]
  shares at 21 degrees [0. 1. 0. 0. 0. 0. 0. 0. 0.]
  moved 724.08
split_between_neighbours
  cell weight 512.0
  shares at 19 degrees [0.55 0.45 0.   0.   0.   0.   0.   0.   0.  ]
  shares at 21 degrees [0.45 0.55 0.   0.   0.   0.   0.   0.   0.  ]
  moved 72.41`,
              { hints: ["The default cell side is 8, so a 24 pixel ramp is 3 cells by 3 and the cell at row 1, column 1 is the one that touches no border.", "histogram_at(1, 1) answers that cell’s nine buckets as a frozen array. Wrap it in np.asarray so the arithmetic that follows works on a plain array, and the weight is its sum.", "The move between the two angles is the length of the difference between the two histograms, which is np.linalg.norm of one minus the other, the same yardstick Part 1 uses on two lists of brightnesses."], check: numberCheck("How much weight does the middle cell hold, under either rule?", 512, 0.5, "The ramp rises by one unit of brightness per pixel along its direction, and the sweep reads that rate of change as 8 at every interior pixel, so a cell of 8 by 8 pixels collects 64 votes of 8. Under whole votes all 512 leave bucket 0 for bucket 1, a move of 512 times the square root of two, which is the 724.08 of Part 3, and under sharing a tenth of the cell moves, which is the 72.41. The weight is the same under both rules because sharing decides where a vote goes and never how much it weighs.") },
            ),
            exercise(
              "Relight the scene and turn it, and measure both at each stage",
              ["Rebuild the 48 pixel scene from Part 1, a square, a disc, a diagonal bar, three crosses and a brightness ramp, and make the three relit copies Part 4 measures, the shift of 0.15 alone, the multiplier of 1.6 alone and the two together, along with the quarter turn of Part 6.", "Describe the scene with the blocks left alone and under the default rule. Part 4 reports the unrescaled description moving 8.4 times ten to the minus fourteenth for the shift and 132.89 for the multiplier against its own length of 221.49, and Part 6 reports the quarter turn moving the finished description 5.2331 against a length of 5. Print all of those to six significant figures, with the two figures Part 6 sets side by side, the turn and the whole relighting under the default rule, in the same block of output."],
              `import numpy as np
from oop_ml.core.computer_vision.oriented_gradients import (
    BlockNormalisation,
    HistogramOfOrientedGradients,
)
from oop_ml.core.computer_vision.picture import Picture

canvas = np.full((48, 48), 0.12)
canvas[6:17, 5:16] = 0.78
rows, columns = np.ogrid[:48, :48]
canvas[(rows - 12) ** 2 + (columns - 34) ** 2 <= 36] = 0.78
for step in range(14):
    canvas[30 - step, 6 + step : 9 + step] = 0.78
cross = np.full((7, 7), 0.12)
cross[2:5, :], cross[:, 2:5] = 0.78, 0.78
for row, column in ((26, 26), (38, 12), (39, 36)):
    canvas[row : row + 7, column : column + 7] = np.maximum(canvas[row : row + 7, column : column + 7], cross)
canvas += np.tile(np.linspace(0.0, 0.30, 48), (48, 1))

here = Picture(canvas)
changes = {"shift": canvas + 0.15, "scale": canvas * 1.6, "both": canvas * 1.6 + 0.15, "turn": np.rot90(canvas)}
# For the blocks left alone and for the default rule, describe the scene,
# print the description's length, and print how far each of the four changes
# moves it, to six significant figures.`,
              `import numpy as np
from oop_ml.core.computer_vision.oriented_gradients import (
    BlockNormalisation,
    HistogramOfOrientedGradients,
)
from oop_ml.core.computer_vision.picture import Picture

canvas = np.full((48, 48), 0.12)
canvas[6:17, 5:16] = 0.78
rows, columns = np.ogrid[:48, :48]
canvas[(rows - 12) ** 2 + (columns - 34) ** 2 <= 36] = 0.78
for step in range(14):
    canvas[30 - step, 6 + step : 9 + step] = 0.78
cross = np.full((7, 7), 0.12)
cross[2:5, :], cross[:, 2:5] = 0.78, 0.78
for row, column in ((26, 26), (38, 12), (39, 36)):
    canvas[row : row + 7, column : column + 7] = np.maximum(canvas[row : row + 7, column : column + 7], cross)
canvas += np.tile(np.linspace(0.0, 0.30, 48), (48, 1))

here = Picture(canvas)
changes = {"shift": canvas + 0.15, "scale": canvas * 1.6, "both": canvas * 1.6 + 0.15, "turn": np.rot90(canvas)}
for rule in (BlockNormalisation.NONE, BlockNormalisation.L2_CLIPPED):
    model = HistogramOfOrientedGradients(block_normalisation=rule)
    described = model.describe(here)
    print(f"{rule.value} length {described.length:.6g}")
    for name, values in changes.items():
        print(f"  {name} moves it {described.distance_to(model.describe(Picture(values))):.6g}")`,
              `none length 221.49
  shift moves it 8.35981e-14
  scale moves it 132.894
  both moves it 132.894
  turn moves it 265.588
l2_clipped length 5
  shift moves it 1.9318e-15
  scale moves it 1.9759e-15
  both moves it 2.29922e-15
  turn moves it 5.23308`,
              { hints: ["A model is configured at construction and reads a picture with describe. The only setting that changes between the two runs is block_normalisation, which takes BlockNormalisation.NONE or BlockNormalisation.L2_CLIPPED, the default.", "Each changed copy of the canvas is a plain array until Picture wraps it, and describe wants the Picture. The original canvas stays as it was, since the arithmetic made new arrays rather than writing into it.", "distance_to is a method of one description taking another, and length is a property. A format of .6g shows the tiny moves as powers of ten rather than as 0.000000."], check: numberCheck("How far does the quarter turn move the finished description, under the default rule?", 5.23308, 0.0005, "Every stage measures a direction from a fixed axis and assigns a pixel to a cell by its position, so a quarter turn turns every direction and moves every pixel into a different cell, and the description, whose own length is 5, moves further than its whole length. The same relighting that moved the unrescaled description by 132.894 moves the rescaled one by about ten to the minus fifteenth, which is the pair of figures Part 6 says must always be quoted together.") },
            ),
            exercise(
              "Ask for three things the method does not define",
              ["Part 6 lists the cases the arithmetic has no answer for, and three of them the library refuses by name. Hand it a 20 by 20 picture at the default cell side of 8, which does not divide into whole cells. Ask for the distance between the descriptions of a 48 by 48 picture and a 24 by 24 one, which are different lengths. And construct a model whose 2 by 2 blocks step 3 cells at a time, which would leave cells no block covers.", "Catch each refusal and print the name of its class and its message. The first two derive from the library’s own base error. The third is refused at construction, before any picture exists, by the validation the model’s own constructor runs, so it arrives as a validation error rather than as one of the library’s."],
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.core.computer_vision.oriented_gradients import HistogramOfOrientedGradients
from oop_ml.core.computer_vision.picture import Picture
from pydantic import ValidationError

model = HistogramOfOrientedGradients()
blank = {side: Picture(np.zeros((side, side))) for side in (20, 24, 48)}

# Try each of the three in turn, catching what the library raises, and print
# the class name and the message. The third refusal comes from the
# constructor, so the message is the first entry of its errors().`,
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.core.computer_vision.oriented_gradients import HistogramOfOrientedGradients
from oop_ml.core.computer_vision.picture import Picture
from pydantic import ValidationError

model = HistogramOfOrientedGradients()
blank = {side: Picture(np.zeros((side, side))) for side in (20, 24, 48)}

try:
    model.describe(blank[20])
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)

try:
    model.describe(blank[48]).distance_to(model.describe(blank[24]))
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)

try:
    HistogramOfOrientedGradients(block_stride_in_cells=3)
except ValidationError as refusal:
    print(type(refusal).__name__)
    print(refusal.errors()[0]["msg"])`,
              `ShapeMismatchError
a 20 by 20 patch does not divide into whole 8 by 8 cells, and the leftover strip would either vote in a cell of a different size or not vote at all
ShapeMismatchError
two descriptions can only be compared position by position, and these are 900 and 144 long, so they were built under different settings
ValidationError
Value error, blocks 2 cells across stepping 3 cells at a time leave cells that no block covers, so those cells would not reach the answer at all; the stride is at most the block's own side`,
              { hints: ["Every refusal the library makes derives from MLLibError, so catching that one catches whichever specific refusal each of the first two turns out to be, and printing the exception prints its message.", "A blank picture describes without complaint, since a block with no weight comes back as noughts, so the second refusal is about the two lengths alone. The 48 by 48 picture describes in 900 numbers and the 24 by 24 one in 144.", "The model is a pydantic model, and a rule that spans two of its fields is checked when it is constructed. pydantic wraps that check in a ValidationError whose errors() lists each failure as a dictionary with the message under msg."] },
            ),
          ],
        },
      ]}
    />
  );
}
