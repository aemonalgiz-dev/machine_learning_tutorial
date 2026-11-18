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
import { BlockOverlapMap } from "@/components/widgets/BlockOverlapMap";
import { EdgeToBucket } from "@/components/widgets/EdgeToBucket";
import { InsideOneCell } from "@/components/widgets/InsideOneCell";
import { LightingLedger } from "@/components/widgets/LightingLedger";
import { OrientedGradientPlayground } from "@/components/widgets/OrientedGradientPlayground";
import { RangeChoiceCompare } from "@/components/widgets/RangeChoiceCompare";
import { SceneUnderTwoLamps } from "@/components/widgets/SceneUnderTwoLamps";
import { TurnedAgainstRelit } from "@/components/widgets/TurnedAgainstRelit";
import { VoteSharingSlide } from "@/components/widgets/VoteSharingSlide";

export const metadata: Metadata = pageMetadata("/concepts/histogram-of-oriented-gradients", {
  title: "Histogram of Oriented Gradients · Perceptron Lab",
  description:
    "Local edge directions describe image shape without requiring every pixel value to match. Histograms of oriented gradients collect those directions into regional summaries that can support object detection.",
});

export default function OrientedGradientsPage() {
  return (
    <ConceptPage
      lessonId="histogram-of-oriented-gradients"
      intuition={lessonIntuitions["histogram-of-oriented-gradients"]}
      technicalStart="Part 2. Counting Directions Inside A Cell"
      openingTitle="Describe Which Way the Edges Point"
      playgroundTitle="Describe an image by the directions of its edges"
      playgroundIntro="Follow an edge direction into its histogram bins. Compare the counts before and after block normalization as the picture's contrast changes."
      title="Histogram of Oriented Gradients"
      tagline={"Local edge directions describe image shape without requiring every pixel value to match. Histograms of oriented gradients collect those directions into regional summaries that can support object detection."}
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
          title: "Part 1. Image Descriptions Under Changing Brightness",
          id: "part-1-why-a-description-made-of-brightnesses-will-not-do",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The scene we will describe">
                <>
<p>We will use a drawn scene forty-eight pixels on each side. Its square has straight edges and corners, its disc has an edge whose direction changes, and its diagonal bar supplies another orientation. Three small crosses complete the scene. Because we placed these shapes ourselves, we can check what each image measurement responds to.</p>
                <p>
                  Laid over all of that is a ramp of brightness that makes the right-hand side of the scene lighter than the left, so the crosses on the right are brighter than the ones on the left although they are the same shape.
                </p>
</>
                <p>We want a description that lets us compare a shape seen in different images. Keeping every brightness value preserves exact detail, but also makes the comparison sensitive to lighting and small position changes. The measurements below show what we might gain by keeping a different kind of information.</p>
                <KeepInMind>
                  The brightness ramp changes the values of otherwise matching crosses. A raw pixel comparison responds to that difference. Whether a later model should retain or remove it depends on the task and expected lighting variation.</KeepInMind>
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
                <p>We can first compare the two images as lists of brightness values, keeping matching pixel positions aligned. For each position, take the brightness difference. Square the differences, add them, and take a square root. This is Euclidean distance between the flattened images.</p>
              <p>The same operation applied to one image against an all-zero image gives the vector&apos;s length, also called its norm. That length is a useful reference scale for the distance. It does not establish whether the difference came from lighting, a moved shape or another cause. The descriptor we build next will choose which of those changes to retain.</p>
                <Equation>{`apart  = √( Σ over pixels of (relit − here)² )

length = √( Σ over pixels of here² )`}</Equation>
                <p>The image vectors are 19.52 apart, while the original vector has length 21.89. Their distance is therefore about 89 percent of that reference length. This quantifies a large numerical change under the tested lighting transformation; it does not define a percentage of being an unrelated image.</p>
                <Equation>{`19.52 / 21.89 ≈ 0.89`}</Equation>
                <SceneUnderTwoLamps />
                <KeepInMind>
                  Raw brightness comparisons can be sensitive to lighting. A threshold may still work in a controlled setting, while centering or normalization can remove some specific brightness changes. Here we investigate a different representation and the information it preserves.</KeepInMind>
              </SubSection>

              <SubSection title="3. The rate of change holds still">
                <p>

                  Now read the same two pictures a different way, by asking at
                  each pixel how fast the brightness is changing and in which
                  direction. The added constant does not survive that question
                  at all, since it is added to both of the neighbors whose
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
                <WhyThisWorks title="Why a constant brightness offset vanishes under these filters">
                  <p>The derivative filters used here have weights summing to zero. Adding a constant to every sampled value therefore adds zero to their response. The border rule must preserve the same constant offset for this argument to hold at the image frame.</p>
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
                <p>The gradient field still stores two values at each exact pixel position, giving 4608 numbers instead of 2304 intensities. It describes local changes, but a direct position-by-position comparison remains sensitive to shifting the same shape. Grouping gradients within cells reduces some of that position sensitivity.</p>
                <p>Gradient directions give us useful local structure. We can summarize their distribution within regions instead of retaining the exact position of every response. This reduces some sensitivity to small shifts while deliberately losing fine spatial information. The following stages build that regional description.</p>
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
                <p>Divide the patch into cells, 8 pixels on a side by default. For each cell, accumulate gradient contributions into direction ranges, weighting each contribution by its strength. The resulting numbers describe which brightness-change directions occur in that region. They do not record each contributing pixel’s precise position.</p>
                <p>Those direction totals form the cell’s histogram. If a shift preserves the same gradients inside the same cell, their totals remain unchanged. Crossing a cell boundary, changing the gradients or clipping part of the shape can change the description. The tolerance comes from grouping positions, rather than from guaranteeing identical outputs for every small movement.</p>
                <KeepInMind>
                  Cell size controls how much spatial detail is pooled together. Eight-pixel cells give a six-by-six grid here; sixteen-pixel cells give a three-by-three grid. A larger cell can tolerate some movements that keep the same gradient contributions inside it, while making more distinct arrangements share the same summary.</KeepInMind>
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
                <Equation>{`bucket b covers  [ b × w , (b+1) × w )    and is centered at  (b + 0.5) × w

with  w = 180 / 9 = 20 degrees`}</Equation>
                <p>

                  So bucket 0 covers everything from 0 up to 20 degrees and is
                  centered on 10, bucket 4 covers 80 up to 100 and is centered on
                  90, and bucket 8 covers 160 up to 180 and is centered on 170.
                  The centers matter as much as the edges, and Part 3 is about
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

              <SubSection title="7. Follow one edge into the orientation histogram" id="7-a-patch-with-one-edge-worked-through">
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
                  We weight each pixel&apos;s contribution by the strength of its brightness gradient. A strong edge therefore contributes more than a nearly flat patch. This helps prevent weak shading from dominating the description simply because it covers many pixels. We will still need to account for changes in contrast when we compare images.
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
<p>The within-cell move gives the same descriptor, at distance zero. Moving the square across the cell boundary gives distance 1.4142 between these nonnegative unit descriptors. That is their maximum possible distance because their nonzero entries occupy disjoint positions. General signed unit vectors can be farther apart, as discussed later.</p>
                <p>
                  So the same change in the brightnesses produces no change at all in one case and the largest change available in the other, and which of the two happens is decided by where the cell edges were drawn.
                </p>
</>
                <WhyThisWorks title="Why these nonnegative unit descriptors cannot be farther apart">
                  <p>Every histogram entry is nonnegative because it sums nonnegative gradient weights. For two unit descriptors, disjoint nonzero entries give a zero dot product. Their squared distance then equals the sum of their squared lengths, as shown below. This establishes the bound for these histograms.</p>
                  <Equation>{`with no entry in common     apart² = 1² + 1² = 2     so     apart = √2 ≈ 1.4142`}</Equation>
                  <p>In this example, crossing into the next cell moves all nonzero contributions to positions where the other descriptor is zero. That disjoint support gives the largest distance available for two nonnegative unit descriptors.</p>
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
              "The zero-sum derivative filters cancel a common brightness offset under the stated boundary convention. A positive multiplier scales both gradient components equally, so their direction is unchanged while magnitude grows. Histogram counts still depend on that magnitude; block normalization addresses the remaining global scale dependence in this example.",
            ),
            trueFalse(
              "Keeping a gradient value at every exact pixel position still makes direct vector comparisons sensitive to small shifts of the same shape.",
              true,
              "A shifted edge changes which pixel positions contain its gradients. Comparing the gradient arrays position by position can therefore give a large difference for the same shifted shape. HOG groups gradient information within cells, deliberately giving up some precise location information to reduce that sensitivity.",
            ),
            trueFalse(
              "At a cell side of 16 pixels the scene divides into 3 cells by 3, the square lies almost wholly inside one of them, and a movement of five pixels can then change the answer by nothing at all.",
              true,
              "The cell side is the dial that trades tolerance to position against knowing where anything was, and nothing in the method sets it. At 8 pixels the scene divides into 6 cells by 6 and the 11 pixel square spreads over six of them, so the same movement crosses cell edges and the answer changes. A larger cell buys more tolerance by throwing more away, which is why there is no sense in which 8 pixels is correct.",
            ),
            choice(
              "A bright square 3 pixels across is moved within its cell, and then moved into the next cell along. Both moves change the brightnesses by exactly 4.2426. What happens to the description?",
              [
                "The move inside the cell gives distance 0, while crossing cells gives 1.4142, the maximum for nonnegative unit vectors",
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
                "Bucket 4 covers 80 up to 100 degrees and is centered on 100",
                "A cell’s counts add to one, since a histogram is a distribution",
              ],
              [0, 1],
              "A bucket is centered halfway along its span, so bucket 4, covering 80 up to 100, is centered on 90, and bucket 8 on 170. The sweep answers 4 at every pixel of the two columns beside the patch’s edge, so each cell holds 3 pixels of 4 and the four cells hold 48 between them. The counts are a sum of magnitudes rather than a probability, so they do not add to one and they grow with the contrast of the picture, which is what Part 4 removes.",
            ),
        ],
        },
        {
          title: "Part 3. Sharing One Vote Between Two Buckets",
          content: (
            <>
              <SubSection title="10. A whole vote jumps at a boundary">
                <p>Assigning a whole vote to one direction bin creates an abrupt boundary. A tiny rotation across that boundary moves the entire contribution to a neighboring bin. Two very similar patches can then receive sharply different histograms.</p>
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
                <p>Share each contribution between its two nearest bin centers. The nearer center receives more of the weight. At a center, that bin receives everything; between centers, the proportions change gradually. This is linear interpolation applied to the vote weights.</p>
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
                <WhyThisWorks title="How interpolation shares a vote between neighboring directions">
                  <p>Interpolating between bin centers makes an individual vote continuous as its direction changes, with its magnitude and cell assignment fixed. This reduces sensitivity to an angular bin boundary. Rotating a whole image can also alter sampling and cell locations, so vote interpolation alone does not guarantee a small change in the complete descriptor.</p>
                  <p>

                    The wrapping matters as much as the interpolation. The
                    buckets go round a circle, so the last one is a neighbor of
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

                    The first bin center is ten degrees and the last is 170 degrees.
                    Unsigned orientations wrap around after 180 degrees, making zero
                    equally close to those two centers.
                  </p>
                  <Equation>{"wraparound distance = 180° − 170° = 10°\nordinary distance = 10° − 0° = 10°\nweight in each bin = 1/2"}</Equation>
                  <p>

                    The square’s upright edges split their contributions equally between
                    these neighboring bins. The initial playground cell shows that
                    split.
                  </p>
                </>
                <p>

                  Compare that with an edge running left to right, whose
                  direction is 90 degrees. That is the center of bucket 4, so
                  the sharing gives that bucket everything and the two rules
                  agree exactly. What decides the behavior is how far the
                  direction falls from the nearest center, and 0 degrees happens
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
                <p>With shared votes, the largest bin receives between 0.5 and 1.0 of a pure direction’s contribution, depending on its position between centers. The neighboring weights together still encode that position. The useful change is continuity: a small rotation changes the shares gradually instead of moving the entire contribution at a bin boundary.</p>
                <>
<p>

                  Drag the slider above to 30 degrees and both rules put everything in the second bucket, since 30 is that bucket&rsquo;s center. Drag to 20, which is a boundary rather than a center, and the shared rule reads a clean half and half while the whole-vote rule reads 0.4531 and 0.5469, because the ramp&rsquo;s direction is worked out pixel by pixel and lands on either side of the boundary by amounts far below anything the picture could distinguish.
                </p>
                <p>Interpolation removes that abrupt jump in the direction vote. It does not remove changes caused by moving gradients between spatial cells, which is a separate part of the descriptor. We will keep those two sources of sensitivity distinct.</p>
</>
                <KeepInMind>

                  Only the direction is shared here. The original work also
                  shares each vote between neighboring cells, which removes the
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
                <p>Histogram magnitudes still increase with a common increase in contrast. Normalization removes that shared factor from a selected group of counts. We now need to decide which nearby cells to normalize together and how to handle groups with almost no gradient information.</p>
                <p>
                  Group nearby cells into a block, two by two by default.
                  Each cell contributes its nine direction counts. Placing those
                  four lists end to end gives the block vector shown below.
                </p>
                <p>

                  Divide a nonzero block vector by its Euclidean length to remove
                  a common positive scale factor. In the ideal expression this
                  produces unit length. A zero block needs a separate policy,
                  and implementations may add a small stabilizing value to the
                  denominator rather than divide by zero.
                </p>
                <p>

                  Normalize locally because illumination can vary across a
                  photograph. A contrast change shared by a small patch may not
                  be shared by the whole person. Block normalization addresses
                  that local scale change; it does not remove every lighting effect.
                </p>
                <Equation>{`block = ( cell₁ , cell₂ , cell₃ , cell₄ )        36 numbers

rescaled = block / ‖block‖`}</Equation>
              </SubSection>

              <SubSection title="15. Only half of a change of lighting needed rescaling">
                <p>An additive brightness offset and a multiplicative contrast change affect different stages. Difference filters already cancel a common offset; normalization addresses a common scale factor in the gradient counts. Switching normalization off lets us measure those effects separately instead of attributing both to the final rescaling.</p>
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
                <p>With multiplier 3.7 and offset 12, the unnormalized descriptor changes by 598.02, while the normalized result differs by about 10⁻¹⁵ in this test. Positive common gain cancels in the ideal nonzero-block normalization. The experiment applies no clipping or camera nonlinearities, so it tests that model rather than every possible relighting.</p>
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
                <p>Dividing a nonzero nonnegative block by the sum of its entries makes those entries sum to one. Taking their square roots compresses ratios between large and small values; it does not make each entry numerically smaller. The resulting vector has unit Euclidean length because its squared entries sum to one. Dividing directly by Euclidean length also produces a unit vector, with different relative contributions. The final table row adds clipping before another normalization.</p>
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
                <p>In this scene, clipping and renormalizing changes the largest descriptor entry from 0.9274 to 0.5376. It reduces some dominant contributions relative to weaker ones within their blocks. The total sum of entries need not be preserved, and a nonzero faint response was already present before clipping. The operation changes relative weighting rather than making an otherwise absent edge appear.</p>
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
                    two, and the center to four.
                  </p>
                  <Equation>{"cell appearances = 4 × 1 + 4 × 2 + 1 × 4 = 16"}</Equation>
                  <p>
                    The nine cells therefore contribute sixteen sets of histogram
                    values. On the six-by-six scene, thirty-six cells produce one
                    hundred such appearances.
                  </p>
                </>
                <WhyThisWorks title="Why overlapping blocks give a cell several local comparisons">
                  <p>Overlapping blocks describe a cell under several local normalization contexts. A strong neighboring edge can reduce its relative contribution in one block but be absent from another. Keeping both versions gives a later classifier access to those different comparisons. The repeated values serve that purpose rather than adding new pixels.</p>
                  <p>Switch the widget to tiled blocks. When the grid divides exactly, each cell then appears in one normalized block rather than several overlapping blocks. On the six-by-six cell grid, this gives nine blocks instead of twenty-five. The descriptor is shorter, but the exact length ratio depends on the grid and stride; it is not always four.</p>
                </WhyThisWorks>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Turning a ramp from 19 degrees to 21, across the boundary at 20, moves a cell’s histogram by 724.08 under whole votes. What does sharing between the two nearest centers give?",
              [
                "72.41, a tenth of the whole-vote move, because two degrees is a tenth of a twenty-degree bucket",
                "724.08 still, since the direction crossed a boundary either way",
                "Nothing at all, since the two centers are equally near",
                "1.4142, the furthest two answers of length 1 can be",
              ],
              0,
              "At nineteen degrees the two bin shares are 0.55 and 0.45; at twenty-one they are 0.45 and 0.55. Sharing interpolates the vote between nearby bin centers, reducing the histogram jump in this comparison. It makes binning continuous in angle for fixed pixel magnitude and cell assignment; image resampling or crossing a cell boundary can still introduce other changes.",
            ),
            trueFalse(
              "A clean upright edge splitting its weight evenly between the first bucket and the last is a fault in the wrapping.",
              false,
              "The first center is 10 degrees and the last is 170, and once directions wrap at 180 the two are equally near to 0, which makes 0 degrees the furthest a direction can fall from any center under this arrangement. An edge running left to right, at 90 degrees, sits exactly on the center of bucket 4 and the two rules agree on it. Reading the split as a bug and moving the bucket edges would only put the halfway points somewhere else.",
            ),
            choice(
              "What does sharing a vote cost?",
              [
                "One gradient can contribute to two bins instead of one, so its largest-bin share can range from 0.5 to 1.0",
                "Nothing, since the two rules agree on every direction",
                "The histogram stops being a continuous function of the direction",
                "The wrapping between the last bucket and the first",
              ],
              0,
              "Sharing uses two weighted bin contributions rather than one hard assignment. It trades a little more work for smoother angular changes. A pure direction can still be inferred from its split weights under the known convention, but a cell mixes many gradients and does not retain every original direction separately. At a hard boundary, small numerical angle errors can instead split whole votes unpredictably across neighboring bins.",
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
              "The unnormalized descriptor is already nearly invariant to the added constant because it uses intensity differences. Multiplying intensities scales its gradient votes and changes that descriptor. The normalized blocks remove nearly all of this global positive multiplier in the supplied experiment. Local lighting changes, clipping or low-contrast numerical effects need not satisfy the same ideal transformation.",
            ),
            several(
              "Blocks step one cell at a time instead of tiling. Which of these does the page give as the reason or the consequence?",
              [
                "A cell away from the border belongs to four blocks and reaches the answer four times, each under a different denominator",
                "A cell beside a strong edge is dimmed in the block they share and left alone in a block that does not hold the strong edge",
                "Both readings survive, so the classifier is given the choice rather than having it made by where the boundaries happened to fall",
                "When tiling fits the grid exactly, each cell appears in one block, producing fewer entries than overlapping blocks",
              ],
              [0, 1, 2, 3],
              "With two-by-two blocks and stride one, an interior cell participates in four neighborhoods, each with its own normalization. Tiling gives a cell only one such neighborhood. For the six-by-six cell grid, overlapping blocks produce twenty-five block positions while exact tiling produces nine. The repeated contextual normalization is the purpose of the extra entries; the length ratio depends on the finite grid and stride.",
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
                <p>The bar’s two sides have opposite brightness-gradient directions. Unsigned orientations combine opposite directions; signed orientations keep them separate. The comparison below measures how those choices respond when the bright bar and dark background exchange contrast.</p>
                <RangeChoiceCompare />
                <p>For the isolated bar, unsigned orientations give distance 0 after contrast reversal. Signed orientations give 1.41421, the maximum for nonnegative unit vectors with disjoint support. General signed unit vectors could be distance 2, but these histogram entries are nonnegative. On the full scene, the two conventions give distances 4.2 × 10⁻¹⁵ and 5.9899 for descriptors of length 5.</p>
              </SubSection>

              <SubSection title="20. Why the pedestrian work folded the circle">
                <>
<p>If a silhouette changes from brighter than its background to darker, its gradient directions can reverse while its outline stays similar. Unsigned orientations remove that polarity difference from the orientation measurement. Other textures and image changes can still alter the descriptor, so it need not become identical for every change of clothing or background.</p>
                <p>
                  That is the argument Dalal and Triggs made, and the measurement above is that argument in two numbers.
                </p>
</>
                <p>Keeping contrast direction can be useful when foreground polarity matters to the task. It may be unhelpful when light-on-dark and dark-on-light versions should receive the same interpretation, as in some text-recognition settings. Covering a full circle at the same angular resolution requires twice as many bins; keeping the bin count fixed instead makes each bin wider.</p>
                <KeepInMind>
                  Combining opposite gradient directions makes the descriptor less sensitive to contrast reversal. That can help when the same outline appears lighter than its background in one image and darker in another. If the direction of contrast is useful evidence for our task, unsigned orientations discard it. We should compare that choice with the signed version.
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

              <SubSection title="22. The work of voting, grouping and normalizing cells" id="22-what-it-costs">
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
          title: "Part 6. Rotated Patches, Lost Detail and Descriptor Choices" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="23. A patch that has been turned">
                <p>The descriptor uses fixed image axes and a fixed spatial cell layout. Rotating a patch changes its gradient orientations and relocates its contributions among cells. Ordinary HOG therefore does not guarantee rotation invariance. The following rotation test checks both changes together.</p>
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
<p>With nine bins, a quarter turn shifts angles by four and a half bins, so bin alignment might appear to explain the change. Using six bins makes the angle shift exactly three bins, yet the measured descriptor still changes by 0.95 of its original length. Cell and block locations also rotate. Changing only the bin count therefore does not supply rotation invariance.</p>
                <p>Changing the direction bins alone does not undo the spatial movement of cells and blocks. A rotation-handling procedure must account for both orientation and spatial coordinates.</p>
</>
                <KeepInMind>
                  One approach is to estimate a dominant local orientation and describe the patch relative to it, as the keypoint lesson explains. Other rotation-handling designs are possible. Ordinary fixed-axis HOG does not include that alignment automatically.</KeepInMind>
              </SubSection>

              <SubSection title="24. A grid chosen in advance, and a thing at the wrong size">
                <p>Cell size is selected for an expected object scale and the detail needed by the task. Eight pixels is a convention used in this arrangement, rather than a universal correct size. When an object can appear at several sizes, the detection procedure can compare multiple image scales or use another scale-handling representation.</p>
                <p>A smaller object occupies a different pattern of cells when the image window and cell size stay fixed. The descriptor keeps its length in that case, but its entries change. Resizing the whole cropped window instead changes the cell grid and can change descriptor length. This API rejects a direct distance comparison between unequal-length descriptors.</p>
                <p>A sliding-window detector can compute features across an image pyramid, evaluating candidate windows at several sizes. That adds work, but shared gradients and feature maps can avoid recomputing every window independently. The actual cost depends on the image sizes and implementation.</p>
              </SubSection>

              <SubSection title="25. Brightness that does not change has no direction">
                <p>A zero gradient has no defined direction, but it also contributes zero vote weight. An implementation still needs a stored angle or missing-value convention. That choice is invisible to these histogram counts as long as the zero magnitude is handled consistently.</p>
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
                <p>Clipping limits large entries before a second normalization. That second step can raise entries above 0.2 again. The parameter controls the redistribution of relative contributions, rather than imposing a final upper bound on every descriptor value.</p>
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
                        "When both estimated gradient components are zero, orientation is undefined. Its stored value is a convention and contributes zero weight to the histogram.",
                    },
                    {
                      expression: "every cell of a block flat",
                      reason:
                        "A zero block cannot be divided by its length. An implementation can retain zeros, stabilize the denominator or reject the block. State the policy and its treatment of nearly zero blocks.",
                    },
                    {
                      expression: "a direction halfway between two centers",
                      reason:
                        "Genuinely split in half by the sharing rule, and 0 degrees is such a direction over half a circle, so a clean upright edge reads as two half-full buckets. Moving the bucket edges only moves the halfway points.",
                    },
                    {
                      expression: "the patch does not divide into whole cells",
                      reason:
                        "Choose an explicit crop, padding, resizing or partial-cell policy, or reject the shape. The choice affects coordinates and contributions and must be consistent between training and prediction.",
                    },
                    {
                      expression: "blocks stepping further than their own width",
                      reason:
                        "Cells between two block positions belong to no block and never reach the answer, so part of the patch is described by nothing at all.",
                    },
                    {
                      expression: "two patches of different sizes",
                      reason:
                        "Under the same fixed cell settings, different image grids can produce unequal descriptor lengths. Direct elementwise distance requires compatible layouts; a declared resizing or alignment can provide one.",
                    },
                    {
                      expression: "the patch has been turned",
                      reason:
                        "The method is defined against a fixed axis, so this is outside what it describes. Measured on the scene, a quarter turn moves the answer 5.2331 where its own length is 5, against 2.3e−15 for a change of lighting.",
                    },
                    {
                      expression: "an entry above the cut limit",
                      reason:
                        "Renormalizing after the cut puts it back above the limit, so the limit constrains the ratios inside a block rather than any single entry. On the scene the largest entry ends at 0.5376 against a limit of 0.2.",
                    },
                  ]}
                />
                <KeepInMind>
                  Several rows require a representation policy rather than a mathematical refusal. Keep the cell layout, image extent and normalization conventions with the descriptor. A consumer can then reject incompatible inputs or apply a declared alignment or resizing procedure, instead of comparing entries whose spatial meanings differ.</KeepInMind>
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
              "Unsigned orientations identify a direction with its reverse, so this contrast reversal produces matching unsigned descriptors. Signed orientations preserve the polarity and differ in the example. Whether that polarity should be ignored depends on the task: reversing foreground and background may be irrelevant for one shape detector and meaningful for another. These examples do not establish one convention for every printed-text problem.",
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
              "The cell and block counts are:\n\n```math\ncells: 64/8 = 8 across; 128/8 = 16 down\nblock positions: (8 − 1) × (16 − 1) = 105\nentries per block: 2 × 2 × 9 = 36\ntotal entries: 105 × 36 = 3,780\n```\n\nOverlap describes many cells in several normalized neighborhoods, so the final vector is longer than one nine-bin histogram per cell.",
            ),
            trueFalse(
              "A bucket count that divides 90 exactly would let the description survive a quarter turn.",
              false,
              "A quarter turn changes where cells and blocks occur in the fixed image grid as well as rotating gradient directions. Matching the bin width to ninety degrees would address only bin alignment. The default descriptor changes substantially in the supplied scene, so rotation invariance would require an additional alignment or representation choice.",
            ),
            choice(
              "A tightly cropped image window is resized to half its width and height while HOG cell size stays fixed. What changes when those window sizes produce different cell grids?",
              [
                "The smaller window has roughly one quarter as many cells and a different descriptor length, so entries no longer correspond position by position",
                "Its rates of change are weaker, so every entry comes out smaller",
                "Its directions have turned, so the buckets no longer line up",
                "The cut at 0.2 bites differently at the smaller size",
              ],
              0,
              "With a fixed cell size, changing the image-window dimensions changes the cell grid and usually the descriptor length. This API rejects direct distance comparisons between unequal-length descriptors. If an object merely becomes smaller inside the same window, the length stays fixed but its cell pattern changes. Detection systems can instead compare appropriately resized windows or search an image pyramid with a fixed descriptor geometry.",
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
            exercise("Work the one-edge patch through with the library",["Build the six-by-six vertical step below. With cell_side=3, calculate cell_histograms once using WHOLE_TO_NEAREST and once using the default shared votes. Print total_weight, the cell-grid shape and the top-left cell's nine bins for both rules.", "Call describe with the shared-vote settings. Print descriptor size, vector length, largest entry and the count of entries above 0.2. Compare that final maximum with the intermediate clipping threshold."],`import numpy as np
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
# entries are above 0.2.`,`import numpy as np
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
print(f"largest entry {entries.max():.4f} with {int((entries > 0.2).sum())} entries above 0.2")`,`total weight 48.0 over 2 by 2 cells
top-left cell under whole votes  [12.  0.  0.  0.  0.  0.  0.  0.  0.]
top-left cell under shared votes [6. 0. 0. 0. 0. 0. 0. 0. 6.]
description holds 36 numbers of length 1.0000
largest entry 0.3536 with 8 entries above 0.2`,{...{ hints: ["cell_histograms takes a Picture and answers an object holding one histogram per cell. total_weight, n_cell_rows and n_cell_columns are properties of it, and histogram_at(row, column) is one cell’s nine buckets as an array.", "The shared rule is the default, so the second model needs only the cell side. The whole-vote rule is VoteSharing.WHOLE_TO_NEAREST.", "describe takes the same Picture and answers the finished description. n_values and length are properties of it, and np.asarray turns it into a plain array for max and for a comparison with 0.2."], check: numberCheck("What is the largest entry of the finished description?", 0.3536, 0.0005, "The nonzero entries are clipped together and then renormalized. That second normalization can place them above the clipping value again, so the intermediate clipping level is not a final upper bound on descriptor entries.") },question:"How do edge votes become a normalized HOG descriptor?"}),
            exercise("Turn a ramp across a bucket boundary",["Use the supplied 24-by-24 ramps at nineteen and twenty-one degrees. Read cell (1, 1) from each image under both vote-sharing settings. This cell is away from the image border, so its pixels have the ramp's common gradient direction.", "For each rule, print total cell weight and the fraction in each bin at both angles. Measure the Euclidean distance between the two raw histogram vectors. Compare how gradually the bins change when votes are shared."],`import numpy as np
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
    # rounded to two places, and how far the cell moved between the two.`,`import numpy as np
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
    print(f"  moved {np.linalg.norm(after - before):.2f}")`,`whole_to_nearest
  cell weight 512.0
  shares at 19 degrees [1. 0. 0. 0. 0. 0. 0. 0. 0.]
  shares at 21 degrees [0. 1. 0. 0. 0. 0. 0. 0. 0.]
  moved 724.08
split_between_neighbours
  cell weight 512.0
  shares at 19 degrees [0.55 0.45 0.   0.   0.   0.   0.   0.   0.  ]
  shares at 21 degrees [0.45 0.55 0.   0.   0.   0.   0.   0.   0.  ]
  moved 72.41`,{...{ hints: ["The default cell side is 8, so a 24 pixel ramp is 3 cells by 3 and the cell at row 1, column 1 is the one that touches no border.", "histogram_at(1, 1) answers that cell’s nine buckets as a frozen array. Wrap it in np.asarray so the arithmetic that follows works on a plain array, and the weight is its sum.", "The move between the two angles is the length of the difference between the two histograms, which is np.linalg.norm of one minus the other, the same yardstick Part 1 uses on two lists of brightnesses."], check: numberCheck("How much weight does the middle cell hold, under either rule?", 512, 0.5, "Sharing changes the direction bins receiving each gradient vote, not the total gradient magnitude. The cell keeps its total weight while a small angle change redistributes that weight more gradually.") },question:"Does sharing an edge vote make a small direction change less abrupt?"}),
            exercise("Relight the scene and turn it, and measure both at each stage",["Use the supplied scene and four changed versions: add 0.15, multiply by 1.6, combine both operations, and rotate by ninety degrees. Describe each version with block normalization disabled and with the default clipped L2 normalization.", "For each configuration, print the original descriptor length and its distance to each changed descriptor using six significant figures. Compare the effect of global intensity changes with rotation, which moves both cells and gradient directions."],`import numpy as np
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
# moves it, to six significant figures.`,`import numpy as np
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
        print(f"  {name} moves it {described.distance_to(model.describe(Picture(values))):.6g}")`,`none length 221.49
  shift moves it 8.35981e-14
  scale moves it 132.894
  both moves it 132.894
  turn moves it 265.588
l2_clipped length 5
  shift moves it 1.9318e-15
  scale moves it 1.9759e-15
  both moves it 2.29922e-15
  turn moves it 5.23308`,{...{ hints: ["A model is configured at construction and reads a picture with describe. The only setting that changes between the two runs is block_normalisation, which takes BlockNormalisation.NONE or BlockNormalisation.L2_CLIPPED, the default.", "Each changed copy of the canvas is a plain array until Picture wraps it, and describe wants the Picture. The original canvas stays as it was, since the arithmetic made new arrays rather than writing into it.", "distance_to is a method of one description taking another, and length is a property. A format of .6g shows the tiny moves as powers of ten rather than as 0.000000."], check: numberCheck("How far does the quarter turn move the finished description, under the default rule?", 5.23308, 0.0005, "Normalization nearly removes this uniform relighting, but a quarter turn changes both cell locations and directions measured from fixed image axes. HOG is not generally rotation invariant.") },question:"Which changes survive HOG normalization: relighting or rotating the scene?"}),
            exercise("Ask for three things the method does not define",["Test three invalid configurations: describe a 20-by-20 image with eight-pixel cells, compare descriptors from 48-by-48 and 24-by-24 images, and construct two-cell blocks with block_stride_in_cells=3.", "Catch each refusal and print the name of its class and its message. The first two derive from the library’s own base error. The third is refused at construction, before any picture exists, by the validation the model’s own constructor runs, so it arrives as a validation error rather than as one of the library’s."],`import numpy as np
from oop_ml import MLLibError
from oop_ml.core.computer_vision.oriented_gradients import HistogramOfOrientedGradients
from oop_ml.core.computer_vision.picture import Picture
from pydantic import ValidationError

model = HistogramOfOrientedGradients()
blank = {side: Picture(np.zeros((side, side))) for side in (20, 24, 48)}

# Try each of the three in turn, catching what the library raises, and print
# the class name and the message. The third refusal comes from the
# constructor, so the message is the first entry of its errors().`,`import numpy as np
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
    print(refusal.errors()[0]["msg"])`,`ShapeMismatchError
a 20 by 20 patch does not divide into whole 8 by 8 cells, and the leftover strip would either vote in a cell of a different size or not vote at all
ShapeMismatchError
two descriptions can only be compared position by position, and these are 900 and 144 long, so they were built under different settings
ValidationError
Value error, blocks 2 cells across stepping 3 cells at a time leave cells that no block covers, so those cells would not reach the answer at all; the stride is at most the block's own side`,{...{ hints: ["Blank images are accepted and produce zero descriptors. The distance check fails because the two descriptor arrays have different lengths: 900 and 144.", "The model is a pydantic model, and a rule that spans two of its fields is checked when it is constructed. pydantic wraps that check in a ValidationError whose errors() lists each failure as a dictionary with the message under msg."] },question:"Which image and descriptor configurations does this implementation reject?"}),
          ],
        },
      ]}
    />
  );
}
