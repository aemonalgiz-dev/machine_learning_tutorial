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
import { AlignmentPlayground } from "@/components/widgets/AlignmentPlayground";
import { DescriptorFrames } from "@/components/widgets/DescriptorFrames";
import { OrientationBoard } from "@/components/widgets/OrientationBoard";
import { PyramidLedger } from "@/components/widgets/PyramidLedger";
import { RansacGallery } from "@/components/widgets/RansacGallery";
import { TurnCostLedger } from "@/components/widgets/TurnCostLedger";

export const metadata: Metadata = {
  title: "Image Alignment · oop_ml",
  description:
    "Give each keypoint a direction so its description survives a turn, match the descriptions, and recover the camera's move from the matches.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function ImageAlignmentPage() {
  return (
    <ConceptPage
      lessonId="image-alignment"
      intuition={lessonIntuitions["image-alignment"]}
      technicalStart="Part 2. A Direction That Belongs To The Corner"
      openingTitle="Two Photographs Of One Scene"
      playgroundIntro="Plant a move, turning, scaling and shifting the scene, and watch the method find it again. Compare what it kept with what was actually right, then carry the second picture back and read the difference."
      title="Image Alignment"
      tagline="Give each keypoint a direction so its description survives a turn, match the descriptions, and recover the camera's move from the matches."
      prerequisites={
        <>
          This lesson picks up exactly where the{" "}
          <Link href="/concepts/keypoints-and-descriptors" className={link}>
            keypoints and descriptors
          </Link>{" "}
          lesson stops, at the measured failure of its descriptor under a turn,
          and it reads gradients the way the{" "}
          <Link href="/concepts/filters-and-edges" className={link}>
            filters and edges
          </Link>{" "}
          lesson computes them. The move at the end is a two-by-two matrix and a
          shift, which the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>{" "}
          covers.
        </>
      }
      playground={<AlignmentPlayground />}
      sections={[
        {
          title: "Part 1. What A Turn Does To A Description",
          content: (
            <>
              <p>
                The keypoints lesson ends on an admission with a number in it.
                After a quarter turn of the picture, every corner is found again
                in exactly the place it should be, with its strength agreeing to
                the last bit, and the descriptions of the corresponding corners
                sit 1.443376 apart on a scale whose maximum is 2.0. That is the
                same distance a square&rsquo;s top-left corner sits from its own
                top-right corner. After the turn the descriptor does not recognise
                a corner as itself. It recognises it as some other corner.
              </p>
              <p>
                The reason is where the patch is read from. The descriptor is the
                square of brightness around the keypoint, with its mean removed
                and its length divided out, and the square is cut with the
                picture&rsquo;s up as up. Turn the picture and the brightness
                around the corner turns with it, so the square is now cut across a
                different arrangement of the same pixels. Two corners of one
                square differ from each other in precisely that way, by a turn, so
                a description that cannot tell a corner from its turned self also
                cannot tell it from its neighbours.
              </p>
              <SubSection title="1. The cost, measured three ways">
                <p>
                  The bar below is the shape the keypoints lesson&rsquo;s own
                  checks use, an L rather than a square, because an L has six
                  corners that differ from one another by what surrounds them.
                  It is turned a quarter circle, which is the one turn that lands
                  every pixel exactly on a pixel, so that whatever changes
                  changed because of the turn and not because of any blurring on
                  the way. Each corner is then compared with its turned self under
                  three descriptions.
                </p>
                <TurnCostLedger />
                <p>
                  The patch descriptor pays the keypoints lesson&rsquo;s 1.443376
                  at every one of the six corners. The two descriptions this
                  lesson builds pay nothing at all, zero bits of 256 and a distance
                  of 0.0, because each is read in a frame that turned with the
                  corner. Hold on to the nearest-other column, though, because it
                  is the other half of what a description is for. Three of the
                  six corners read as zero bits from some other corner too, and
                  Part 3 says why.
                </p>
              </SubSection>
              <KeepInMind>
                A description that does not move under a turn is necessary and
                not sufficient. It also has to differ from the descriptions of
                the other corners, or matching has nothing to choose between. The
                whole of this lesson is the first property; the ratio test from
                the keypoints lesson is what guards the second.
              </KeepInMind>
            </>
          ),
        },
        {
          title: "Part 2. A Direction That Belongs To The Corner",
          content: (
            <>
              <p>
                If the patch is going to be read in a frame that turns with the
                picture, the corner has to supply that frame, which means it has
                to supply a direction of its own. Two usual answers, and both are
                built from the brightness around the corner, so both turn when it
                does.
              </p>
              <SubSection title="2. The centre of brightness">
                <p>
                  The first is ORB&rsquo;s. Take a disc of radius four around the
                  corner and treat every pixel&rsquo;s brightness as a weight.
                  The weights are heavier on the bright side of the corner, so
                  the centre of mass of the disc sits off its middle, and the
                  direction from the corner to that centre is the direction the
                  corner faces. Written as the two moments of the disc, with the
                  corner at the origin, rows running down and columns running
                  right,
                </p>
                <Equation>
                  {
                    "m_right = Σ column × brightness\nm_down = Σ row × brightness\n\ndirection = atan2(m_down, m_right)"
                  }
                </Equation>
                <WorkedExample title="The top-left corner of the bar">
                  <p>
                    The corner at row 14, column 14 has brightness below it and
                    to its right and nothing above or to its left. The disc gives
                    equal moments of 25.0 rightward and 25.0 downward, so the
                    direction is an eighth of a turn, 45 degrees measured from
                    pointing right towards pointing down, which is the same
                    convention the gradient field uses. The corner at row 34,
                    column 14 has its brightness above and to the right, moments
                    of 25.0 and minus 25.0, and faces minus 45 degrees. Same
                    arithmetic, opposite sign, which is what a direction that
                    belongs to the corner should do.
                  </p>
                </WorkedExample>
              </SubSection>
              <SubSection title="3. The dominant gradient">
                <p>
                  The second is SIFT&rsquo;s. Instead of asking where the
                  brightness is, ask which way it rises. Every pixel of the disc
                  has a gradient, a direction and a sharpness, from the filters
                  lesson. Sort the directions into thirty-six bins of ten degrees
                  and let each pixel add its sharpness to its bin, weighted by a
                  bell so the pixels nearest the corner count most. The fullest
                  bin is the direction, refined by fitting a parabola through it
                  and its two neighbours so that the answer is not stuck to a
                  multiple of ten.
                </p>
                <OrientationBoard />
                <p>
                  On the top-left corner the histogram has two equal peaks, at
                  bins 18 and 27 with 14.198 in each, because two edges meet
                  there at equal strength and the brightness rises across both,
                  rightward across the left edge and downward across the top one.
                  The refined directions come out at 5.54 degrees and 95 degrees.
                  Neither is the centroid&rsquo;s 45, and that is fine. A
                  direction is only required to turn with the corner, not to
                  agree with another rule&rsquo;s.
                </p>
                <KeepInMind title="Two peaks, two keypoints">
                  A tie between two peaks is the one case a single direction
                  cannot survive. Pick either by any rule and the turned picture
                  picks the other. SIFT&rsquo;s answer is to keep every peak
                  within eighty percent of the highest as a direction of its own,
                  so a corner where two edges meet equally becomes two keypoints
                  at one position, facing 5.54 and 95 degrees, and both travel.
                  The centre of brightness has no such case, since a disc has one
                  centre of mass, and it gives every corner exactly one direction.
                </KeepInMind>
              </SubSection>
              <SubSection title="4. What a quarter turn does to each">
                <p>
                  Turn the bar a quarter circle and every centroid direction moves
                  by exactly a quarter circle, with no rounding at all, because
                  the turn permutes whole pixels and the moments are sums of them.
                  The gradient directions move by a quarter circle to within
                  4.4e-16 radians, for the same reason one step later, since the
                  turn permutes the gradients and the histogram is a sum of
                  those. Both are the property the frame needs, and both are
                  measured rather than assumed.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Reading The Patch In Its Own Frame",
          content: (
            <>
              <p>
                With a direction in hand, the patch is read with that direction
                as its first axis. Whatever is read then comes out the same before
                and after a turn, because the turn moves the direction and the
                reading with it. Two readings, matching the two directions.
              </p>
              <SubSection title="5. Pixel pairs, one bit each">
                <p>
                  ORB&rsquo;s reading is the simplest description there is. Draw
                  256 pairs of positions inside a fifteen-wide square, once, from
                  a seeded generator, so that every corner in every picture reads
                  the same pairs. Turn the pairs to the corner&rsquo;s direction,
                  round them to pixels, and for each pair answer one question. Is
                  the first pixel darker than the second? The description is 256
                  bits, and the distance between two descriptions is how many
                  bits differ, which is a count rather than a length. The pixels
                  are read through a three by three mean, because a single pixel
                  is noisy and a bit flips when it is.
                </p>
                <DescriptorFrames />
                <p>
                  The corner at row 14, column 14 faces 45 degrees. After the
                  quarter turn it is at row 34, column 14 and faces minus 45
                  degrees, and the pairs, turned with it, land on the same
                  brightness they landed on before. The 256 bits are identical,
                  zero of them differ, and 96 of them are ones.
                </p>
              </SubSection>
              <SubSection title="6. A grid of gradient counts">
                <p>
                  SIFT&rsquo;s reading is the oriented gradients lesson&rsquo;s
                  idea, turned to the corner. A sixteen-wide square in the
                  corner&rsquo;s frame is cut into four by four cells, and each
                  cell counts which way the brightness rises in eight directions,
                  every direction measured relative to the corner&rsquo;s own.
                  Each sample is shared between the two nearest cells along each
                  axis and the two nearest direction bins, in proportion to how
                  near it sits, so that a sample on a cell boundary does not jump
                  whole from one cell to the other under a change of a fraction
                  of a pixel. The 128 counts are normalised to unit length, any
                  entry above 0.2 is clipped so that one sharp edge cannot
                  dominate, and the result is normalised again. Two readings are
                  compared by ordinary distance.
                </p>
                <p>
                  On the same corner the two histograms, before and after the
                  turn, are at distance 0.0, as the roses above show cell by
                  cell.
                </p>
              </SubSection>
              <SubSection title="7. What neither can do">
                <p>
                  Read in its own frame, a bright right-angled corner is a bright
                  quadrant, whichever corner of the bar it is. Within the seven
                  pixels the pairs reach, the top-left corner, the bottom-left
                  corner and the bottom-right corner of the bar&rsquo;s upright
                  are bit-identical to each other, which is the zero in the
                  nearest-other column of Part 1. The histogram&rsquo;s wider
                  square sees to where the bar&rsquo;s arms end and still tells
                  them apart, by 0.306, which is small beside the 1.138 that
                  separates the concave corner from its nearest neighbour but is
                  not zero.
                </p>
                <p>
                  That is the repeated-structure problem the keypoints lesson
                  names, now with a reason. A rotation-invariant description
                  cannot distinguish two things that differ only by a rotation,
                  and two convex corners of one shape differ only by a rotation.
                  What breaks the tie is context, and context is what a wider
                  patch buys. The ratio test refuses the three ambiguous corners
                  under the binary reading, at a ratio of exactly one, rather
                  than guessing.
                </p>
              </SubSection>
              <InAModel>
                ORB reads 256 pairs over a thirty-one-wide patch, learned rather
                than drawn at random so that the bits are uncorrelated, on a
                pyramid of eight sizes. SIFT reads four by four cells of four
                pixels, exactly the grid here, at the size and position a scale
                space settles on. Neither changes the two ideas above, a direction
                that turns with the corner and a reading taken in that
                direction&rsquo;s frame.
              </InAModel>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "After a quarter turn the patch descriptor from the keypoints lesson no longer finds the corner at all.",
              false,
              "The corner is found again exactly where it should be, with its strength agreeing to the last bit. What fails is the description, which sits 1.443376 from its turned self, the distance between two different corners of one square. The keypoints belong to the scene and the descriptions belonged to the frame.",
            ),
            choice(
              "The top-left corner of the bar has moments of 25.0 rightward and 25.0 downward. What direction does the centre of brightness give it?",
              ["45 degrees", "90 degrees", "0 degrees", "135 degrees"],
              0,
              "The direction is the arctangent of the downward moment over the rightward one, and two equal moments give an eighth of a turn, measured from pointing right towards pointing down. The bottom-left corner has the same rightward moment and a downward moment of minus 25.0, and faces minus 45 degrees.",
            ),
            choice(
              "Why does SIFT keep two directions for a corner where two edges meet at equal strength?",
              [
                "The histogram has two equal peaks, and any rule for picking one would pick the other after a turn",
                "Two directions make the descriptor twice as long and therefore more precise",
                "The centre of brightness is undefined at such a corner",
                "A corner always has two edges, so every corner gets two directions",
              ],
              0,
              "A tie is the one case a single direction cannot survive. Keeping every peak within eighty percent of the highest turns the corner into two keypoints at one position, facing 5.54 and 95 degrees on the bar, and both travel through the turn. The centroid rule gives exactly one direction because a disc has one centre of mass.",
            ),
            several(
              "Which of these hold of the binary reading on the bar?",
              [
                "The same 256 pairs are read for every corner in every picture, drawn once from a seed",
                "Its distance is a count of differing bits rather than a length",
                "Three convex corners of the bar read as identical bit strings",
                "It is read from the raw pixels, since smoothing would blur the corner",
              ],
              [0, 1, 2],
              "The pairs are drawn once so that two pictures are comparable at all, and the Hamming distance counts bits. The three bright quadrants are bit-identical within the pattern's seven-pixel reach, which the nearest-other column shows as zeros. The pixels are read through a three by three mean, because a single pixel is noisy and a bit flips when it is.",
            ),
            trueFalse(
              "The gradient histogram tells the three ambiguous convex corners apart, if only by a little.",
              true,
              "Its sixteen-wide square sees to where the bar's arms end, and the three corners that are bit-identical under the pairs sit 0.306 apart under the histogram. That is small beside the 1.138 that separates the concave corner from its nearest neighbour, which is the difference between context that is barely there and context that is plentiful.",
            ),
          ],
        },
        {
          title: "Part 4. Matching Across The Turn",
          content: (
            <>
              <p>
                Matching is the keypoints lesson&rsquo;s ratio test, unchanged.
                Each description in the first picture finds its nearest in the
                second, and the match is kept only when the nearest is enough
                nearer than the second nearest, at Lowe&rsquo;s threshold of 0.8.
                It applies to a count of bits exactly as it applies to a distance,
                since it compares two of the same thing.
              </p>
              <SubSection title="8. The opening move">
                <p>
                  The playground&rsquo;s opening move turns the shared scene by
                  thirty degrees and shifts it three pixels down and five to the
                  left, about the middle of the frame. Thirty degrees lands no
                  pixel on a pixel, so the turned picture is resampled and nothing
                  about it is exact, which is the case that matters. With the
                  centre of brightness and the pixel pairs, the method finds 40
                  keypoints in each picture and the ratio test keeps 15 matches.
                  Ten of those are right, which the page can say because it
                  planted the move. Five are wrong, and they are wrong for the
                  reason Part 3 gives, since the scene&rsquo;s square has four
                  corners that look alike in their own frames.
                </p>
                <p>
                  With the dominant gradient and the histogram, the same scene
                  gives 34 matches of which 17 are right, more of both because a
                  symmetric corner is two keypoints under that rule. Either way
                  about a third of what survives the ratio test is wrong, and that
                  is the input the next two parts have to work with.
                </p>
                <NumberTable
                  headings={["Pair of rules", "Keypoints", "Matches kept", "Right", "Wrong"]}
                  rows={[
                    ["Centroid and pairs", "40 and 40", "15", "10", "5"],
                    ["Gradient and histogram", "40 and 40", "34", "17", "17"],
                  ]}
                  caption="The opening move, a thirty-degree turn and a shift of three down and five left. A match is right when the planted move carries its first position to within 1.5 pixels of its second."
                />
              </SubSection>
              <SubSection title="9. Turning the ratio test off">
                <p>
                  Set the ratio threshold to one in the playground and every
                  keypoint keeps its nearest match. On the opening move that is 40
                  matches of which 16 are right, so the ratio test had refused 25
                  matches to lose 6 right ones. Whether that trade was worth it is
                  the question Part 6 answers, since what comes next can cope
                  with wrong matches up to a point and not beyond it.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Two Matches Fix The Move",
          content: (
            <>
              <p>
                A match is a claim that one position in the first picture is one
                position in the second. If the camera moved rigidly, then every
                true match is explained by the same move, which here is a turn, a
                change of scale and a shift. That is a similarity transform, and
                it has four numbers in it.
              </p>
              <Equation>
                {
                  "second = scale × R(angle) × first + shift\n\nR(angle) = [ cos  −sin ]\n           [ sin   cos ]\n\nfour numbers: scale, angle, shift down, shift right"
                }
              </Equation>
              <p>
                Two matched positions give four equations, two coordinates each,
                so two matches fix the four numbers exactly. More matches than two
                make the fit a least-squares one, and the closed form for it is
                short enough to read.
              </p>
              <WhyThisWorks title="The closed form">
                <DerivationTable
                  rows={[
                    {
                      expression: "centre both sets of positions on their means",
                      reason: "the shift is whatever is left once the turn and scale are known, so it is found last",
                    },
                    {
                      expression: "C = (second − mean)ᵀ (first − mean)",
                      reason: "the two by two cross-covariance, which holds the turn",
                    },
                    {
                      expression: "C = U S Vᵀ,  R = U Vᵀ",
                      reason: "the singular value decomposition, with a sign fixed so that R is a turn and not a reflection",
                    },
                    {
                      expression: "scale = trace(S) / Σ |first − mean|²",
                      reason: "the ratio of the spreads, read off the singular values",
                    },
                    {
                      expression: "shift = mean(second) − scale × R × mean(first)",
                      reason: "what carries the first centre onto the second",
                    },
                  ]}
                />
                <p>
                  Measured on three positions under a planted turn of 0.6 radians,
                  a scale of 1.3 and a shift of four down and two left, the
                  recovered four numbers agree with the planted ones to 1.3e-15,
                  which is the arithmetic and not an approximation. Two positions
                  recover them exactly as well.
                </p>
              </WhyThisWorks>
              <KeepInMind>
                Four numbers is a choice, and it is the choice that makes two
                matches enough. A picture taken from a different place rather than
                the same place with the camera turned is related to the first by a
                perspective transform, which has eight numbers, needs four matches
                to fix and is not what this lesson fits. On a flat scene
                photographed twice from one spot, four numbers is exactly right.
              </KeepInMind>
            </>
          ),
        },
        {
          title: "Part 6. Let The Matches Vote",
          content: (
            <>
              <p>
                Two matches fix the move, and a third of the matches are wrong.
                Fitting all fifteen at once would average the wrong ones into the
                answer. Fitting two at a time and asking the others whether they
                agree does not, and that is the whole of the method the world
                calls RANSAC.
              </p>
              <SubSection title="10. Every pair proposes, the rest agree or do not">
                <p>
                  Take two matches, fit the move they imply, carry every first
                  position through it, and count how many land within 1.5 pixels
                  of their matched second position. That count is the
                  pair&rsquo;s support. Try every pair, keep the pair with the
                  most support, breaking ties by the smaller total error, and
                  refit the move on everyone who supported the winner. The matches
                  that did not support it are the outliers, and they are reported
                  rather than discarded, because which matches were wrong is half
                  of what the method tells you.
                </p>
                <RansacGallery />
                <p>
                  On the opening move the 15 matches make 105 pairs, of which 104
                  propose anything, since one pair shares a position and fixes
                  nothing. Twenty pairs explain only themselves. The pairs made of
                  two right matches, 45 of the 104, propose nearly the same move
                  as one another and explain up to ten matches, and ten pairs
                  reach that ten. The winner proposes a turn of 30.51 degrees at a
                  scale of 1.0, and the refit on the ten matches it explains lands
                  at 30.56 degrees, 0.56 from the planted thirty, with the
                  inliers sitting 0.56 pixels on average from where the move sends
                  them.
                </p>
              </SubSection>
              <SubSection title="11. Counting beats averaging">
                <p>
                  The reason to count agreement rather than average proposals is
                  visible in the bars. A wrong match paired with anything proposes
                  a move almost nobody agrees with, so wrong matches are not
                  outvoted, they are simply never elected. An average would have
                  let all five wrong matches pull on the answer; the vote lets
                  them propose and then ignores them. With few matches every pair
                  is tried in a fixed order, so the answer is the same on every
                  run; with many, a seeded sample of pairs is tried, which is what
                  the name describes.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            choice(
              "On the opening move the centroid and pairs keep 15 matches. How many are right, and why are the others wrong?",
              [
                "Ten are right; the wrong ones match corners that look alike in their own frames, such as the four corners of the scene's square",
                "Fifteen are right, since the ratio test only keeps a match it is sure of",
                "Five are right; the turn blurs most corners beyond recognition",
                "Ten are right; the wrong ones are keypoints the turn moved off the picture",
              ],
              0,
              "A rotation-invariant description cannot distinguish two things that differ only by a rotation, and the square's corners differ only by a rotation. The page can count the right ones because it planted the move, and a match is right when that move carries its first position to within 1.5 pixels of its second.",
            ),
            trueFalse(
              "The gradient and histogram pair keeps more matches than the centroid and pairs on the opening move because its descriptor is longer.",
              false,
              "It keeps 34 against 15 because a symmetric corner is two keypoints under the dominant gradient rule, one per peak, so there are more keypoints to match. The share that is right is about the same, 17 of 34 against 10 of 15.",
            ),
            choice(
              "Why are two matches enough to fix the move?",
              [
                "A similarity has four numbers and two matched positions give four equations",
                "Two matches are always right, so the fit cannot be contaminated",
                "The singular value decomposition needs exactly two rows",
                "One match fixes the shift and the second fixes the scale, which leaves the turn to the ratio test",
              ],
              0,
              "A turn, a scale and a shift down and right are four numbers, and each matched position contributes two coordinates. More matches make the fit a least-squares one by the closed form in Part 5, which recovers a planted move to 1.3e-15. A perspective change would have eight numbers and need four matches.",
            ),
            several(
              "Which of these describe the vote in Part 6 on the opening move?",
              [
                "Every pair of matches proposes a move and is scored by how many matches land within 1.5 pixels of where it sends them",
                "Twenty of the 104 proposals explain only the two matches that made them",
                "The winner is refitted on every match that supported it, and the rest are reported as outliers",
                "The five wrong matches are outvoted after being averaged into the proposal",
              ],
              [0, 1, 2],
              "Wrong matches are never averaged in at all. Paired with anything, a wrong match proposes a move almost nobody agrees with, so it is never elected, which is the difference between counting support and averaging proposals. The ten pairs that explain ten matches are all pairs of two right ones.",
            ),
            trueFalse(
              "With the ratio test turned off, the vote still has something to work with, since 16 of the 40 matches are right.",
              true,
              "Setting the threshold to one keeps every nearest match, 40 of them with 16 right. The vote can cope with wrong matches up to a point, and the playground shows where the point is, since the recovered move is still within half a degree of the planted one there, with one wrong match kept and one right one refused.",
            ),
          ],
        },
        {
          title: "Part 7. Carrying The Picture Back",
          content: (
            <>
              <p>
                A recovered move is a claim about where every pixel went, and the
                claim can be checked by using it. Carry the second picture back
                through the inverse of the move, reading each output pixel from
                where it came from by interpolating between its four neighbours,
                and lay it over the first. If the move is right the two pictures
                agree almost everywhere.
              </p>
              <SubSection title="12. One number for the whole alignment">
                <p>
                  The mean absolute difference between the first picture and the
                  second is 0.1755 on the opening move. After the second is
                  carried back by the recovered move it is 0.0187, a drop of more
                  than nine tenths, and what remains is the resampling, twice
                  over, plus the half-degree the turn is off by. With the gradient
                  and histogram pair the recovered turn is 29.86 degrees, 0.14
                  off, and the difference after is 0.0186. Set the turn to a
                  quarter circle and the whole chain becomes exact again, 32
                  matches of 32 right, a recovered turn of 90.0 degrees, and a
                  difference after of 0.0.
                </p>
              </SubSection>
              <SubSection title="13. The method&rsquo;s verdict against the truth">
                <p>
                  The playground draws a two-by-two count that no method can
                  draw for itself, because the page planted the move and the
                  method did not. Down the side, whether the method kept a match
                  as an inlier or refused it as an outlier. Across the top,
                  whether the match was right. On the opening move the ten
                  inliers are the ten right matches and the five outliers are the
                  five wrong ones, with nothing in the two cells that would mean
                  a mistake. Shrink the scene to 0.8 and turn it forty degrees and
                  the count changes. Eleven matches, seven right, nine kept, so
                  two wrong matches were kept because they happened to land
                  within 1.5 pixels of where the move sends them, and the
                  recovered turn is still 39.97 degrees.
                </p>
                <NumberTable
                  headings={["Move", "Matches", "Right", "Kept", "Kept and right", "Turn recovered", "Difference after"]}
                  rows={[
                    ["Turn 30, shift (3, −5)", "15", "10", "10", "10", "30.56", "0.0187"],
                    ["Scale 1.25, turn 25, shift (2, −3)", "13", "7", "7", "7", "25.3", "0.0293"],
                    ["Scale 0.8, turn 40, shift (−4, 2)", "11", "7", "9", "7", "39.97", "0.0299"],
                    ["Scale 1.6, turn 20", "4", "2", "2", "2", "19.95", "none"],
                  ]}
                  caption="The centroid and pairs on four planted moves. The last row recovers the move from two matches, which is the fewest that can, and carries nothing back because two inliers leave no outlier to test the claim against."
                />
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Where It Stops Working",
          content: (
            <>
              <SubSection title="14. A change of size">
                <p>
                  Nothing in Parts 2 and 3 handles a change of scale. A corner
                  seen from twice as far away has a patch half the width, and a
                  reading over a fixed fifteen pixels sees different things in it.
                  The table in Part 7 shows how much the readings tolerate on
                  this scene anyway, a scale of 1.25 or 0.8 with seven right
                  matches, and 1.6 with two, which is the edge. ORB&rsquo;s answer
                  is a pyramid, the picture at several sizes, each 1.2 times
                  smaller than the last, with keypoints found and described at
                  every size so that a corner seen from further away is described
                  at the size where it looks as it did.
                </p>
                <PyramidLedger />
                <p>
                  On the opening move, where the scale does not change, the
                  pyramid measured worse than expected and the reason is worth
                  knowing. Six levels find 126 keypoints where one level finds 40,
                  because every corner is found again at each neighbouring size,
                  and those copies are each other&rsquo;s runners-up. The ratio
                  test then refuses the true match, and six of 32 matches are
                  right where ten of 15 were. The move is still recovered, from
                  the six. So the pyramid is kept for the changes of size a single
                  level cannot reach and is not switched on by default.
                </p>
              </SubSection>
              <SubSection title="15. A change of viewpoint">
                <p>
                  Two photographs from one spot with the camera turned are related
                  by four numbers. Two photographs from two spots are related by
                  eight, a perspective transform, and a four-number fit of an
                  eight-number move explains the matches near one part of the
                  scene and not the rest. The vote then elects whichever part had
                  the most keypoints, which is an answer, but not the one asked
                  for. Fitting the eight numbers needs four matches a proposal and
                  the same vote, and it is the usual next step.
                </p>
              </SubSection>
              <SubSection title="16. Repeated structure">
                <p>
                  A brick wall, a window grid, a keyboard. Every corner reads the
                  same in its own frame, the ratio test correctly refuses every
                  match, and the method answers nothing rather than something
                  wrong. That is the better of the two failures and is still a
                  failure, and a wider patch helps only until the structure
                  repeats at that width too.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Implementation And Failure Contracts",
          content: (
            <>
              <p>
                Every refusal is by name and happens before an answer could be
                wrong. A disc or a turned pattern that would read outside the
                picture is refused with the border a detection needs to avoid it,
                rather than padded with invented pixels. A reading of one kind
                cannot be compared with a reading of the other, and two binary
                readings from different pair patterns cannot be compared either,
                since the bits would not mean the same thing. A set of readings
                mixing kinds is refused at construction.
              </p>
              <p>
                A move cannot be fixed from fewer than two matches, and two
                matches that share a position on either side fix nothing, so a set
                of matches in which every pair shares a position is refused by
                name rather than answered with a transform that explains nothing.
                A scale that is not positive, an angle that is not finite and a
                ratio threshold outside the half-open unit interval are each
                refused where they are given.
              </p>
              <p>
                What is deliberately absent is said as plainly. No sub-pixel
                refinement of a keypoint&rsquo;s position, no scale space finer
                than the pyramid&rsquo;s levels, and no learned pair pattern, which
                are what separate these readings from their reference
                implementations. The two refinements that cost nothing and matter
                are kept, sharing each sample between neighbouring cells and bins
                rather than rounding it into one, and refining the orientation
                peak with a parabola rather than taking a bin&rsquo;s centre.
              </p>
            </>
          ),
        },
        {
          title: "Questions on Parts 7 to 9",
          quiz: [
            choice(
              "The mean pixel difference between the two pictures of the opening move falls from 0.1755 to 0.0187 once the second is carried back. What accounts for the 0.0187 that remains?",
              [
                "Resampling the picture twice, and the half degree the recovered turn is off by",
                "The five wrong matches, which were averaged into the move",
                "The ratio test, which refused matches the carrying back needed",
                "The pyramid, which blurred the picture at every level",
              ],
              0,
              "The wrong matches were refused as outliers, not averaged in, and the pyramid is not used on the opening move. What remains is the turn by thirty degrees being interpolated on the way out and again on the way back, plus a turn recovered at 30.56 degrees rather than 30. A quarter turn, which is exact, brings the difference to 0.0.",
            ),
            trueFalse(
              "On the scene shrunk to 0.8 and turned forty degrees, every match the method kept was right.",
              false,
              "Eleven matches, seven right and nine kept, so two wrong matches were kept because they happened to land within 1.5 pixels of where the recovered move sends them. The move itself is recovered at 39.97 degrees, which is the method tolerating two wrong inliers rather than being misled by them.",
            ),
            choice(
              "On the opening move, six levels of pyramid at a factor of 1.2 found 126 keypoints and got six matches right where one level got ten. Why?",
              [
                "Each corner was found at several neighbouring sizes, and those copies were each other's runners-up under the ratio test",
                "The smaller levels have fewer pixels, so their descriptions are noisier",
                "The pyramid turns the picture as well as shrinking it",
                "Six levels take longer and the matching was stopped early",
              ],
              0,
              "A copy of the same corner one level away is almost as near as the true match, so the ratio of nearest to second nearest rises past 0.8 and the true match is refused. The move is still recovered from the six, and the pyramid is kept for the changes of size a single level cannot reach rather than switched on by default.",
            ),
            several(
              "Which of these are refused by name rather than answered?",
              [
                "A pattern that, turned to the keypoint's direction, would read outside the picture",
                "Comparing a binary reading with a gradient histogram",
                "Fitting a move from one match",
                "A scene whose two views are related by a perspective change",
              ],
              [0, 1, 2],
              "A pattern reading outside the picture, a comparison across kinds and a fit from one match are contracts, each refused where it is given with the reason. A perspective change is not refused, because nothing in the matches announces it. The four-number fit simply explains part of the scene and not the rest, which Part 8 names as the limitation it is.",
            ),
            trueFalse(
              "A set of matches in which every pair shares a position on one side is refused, because such pairs fix no move.",
              true,
              "Two matches that share a first position or a second position give three distinct points rather than four, and a similarity cannot be read off them. When every pair is like that there is no proposal to vote on, and the refusal says so rather than returning a transform that explains nothing.",
            ),
          ],
        },
        {
          title: "Practice. Lining Up Pictures With the Library",
          practice: [
            exercise(
              "Read one corner before and after a quarter turn",
              ["Draw the lesson's bent bar, turn it a quarter circle with numpy, and give the corners of both pictures a direction with the centre-of-brightness rule.", "Find the corner at row 14, column 14 in the first picture and the corner it lands on in the second, at row 34, column 14. Print the direction each faces in degrees, then read both with the binary descriptor and print how many of the 256 bits differ."],
              `import numpy as np
from oop_ml.core.computer_vision.alignment import (
    BinaryDescriptor, IntensityCentroidRule, oriented_keypoints_of,
)
from oop_ml.core.computer_vision.picture import Picture

values = np.zeros((49, 49))
values[14:35, 14:23] = 1.0
values[14:20, 14:35] = 1.0
bar = Picture(values)
turned = Picture(np.rot90(values))

rule = IntensityCentroidRule()
# Orient the keypoints of both pictures with a border of 12, pick out the
# corner at (14, 14) and its turned self at (34, 14), print their directions
# in degrees, and print the Hamming distance between their binary readings.`,
              `import numpy as np
from oop_ml.core.computer_vision.alignment import (
    BinaryDescriptor, IntensityCentroidRule, oriented_keypoints_of,
)
from oop_ml.core.computer_vision.picture import Picture

values = np.zeros((49, 49))
values[14:35, 14:23] = 1.0
values[14:20, 14:35] = 1.0
bar = Picture(values)
turned = Picture(np.rot90(values))

rule = IntensityCentroidRule()
before = oriented_keypoints_of(bar, rule, border=12)
after = oriented_keypoints_of(turned, rule, border=12)
corner = next(k for k in before if (k.row, k.column) == (14, 14))
twin = next(k for k in after if (k.row, k.column) == (34, 14))

print(f"before the turn the corner faces {np.degrees(corner.angle):.2f} degrees")
print(f"after the turn it faces {np.degrees(twin.angle):.2f} degrees")
reading = BinaryDescriptor.of(bar, corner)
reading_after = BinaryDescriptor.of(turned, twin)
print(f"bits that differ: {reading.distance_to(reading_after):.0f} of {reading.n_values}")`,
              `before the turn the corner faces 45.00 degrees
after the turn it faces -45.00 degrees
bits that differ: 0 of 256`,
              { hints: ["A border of 12 keeps every corner's patch inside the picture; the detector reports nothing nearer the frame than that.", "The oriented keypoints carry a row, a column and an angle in radians, so numpy's degrees turns the angle into what the lesson quotes.", "A descriptor is read from a picture and an oriented keypoint, and two descriptors of the same kind answer their distance to each other."], check: numberCheck("What direction, in degrees, does the corner face after the turn?", -45.0, 0.05, "The corner faced 45 degrees before, down and to the right where its brightness is. A counter-clockwise quarter turn carries that to minus 45 degrees, which is the direction turning with the corner. The pattern of pairs turns with it too, which is why no bit differs.") },
            ),
            exercise(
              "Recover a planted move from three points",
              ["Build a move with a scale of 1.3, a turn of 0.6 radians and a shift of four down and two to the left, carry three points through it, and fit a move back from the pairs.", "Part 5 says two pairs fix the four numbers and more make the fit a least-squares one. Print the recovered four numbers, the turn in degrees, and the largest gap between the recovered numbers and the planted ones."],
              `import numpy as np
from oop_ml.core.computer_vision.alignment import SimilarityTransform

planted = SimilarityTransform(1.3, 0.6, 4.0, -2.0)
points = np.array([[1.0, 2.0], [5.0, 7.0], [3.0, -1.0]])
# Carry the points through the planted move, fit a move from the pairs, and
# print its scale, its turn in radians and degrees, its shift, and the largest
# gap from the planted numbers.`,
              `import numpy as np
from oop_ml.core.computer_vision.alignment import SimilarityTransform

planted = SimilarityTransform(1.3, 0.6, 4.0, -2.0)
points = np.array([[1.0, 2.0], [5.0, 7.0], [3.0, -1.0]])
landed = planted.applied_to(points)

recovered = SimilarityTransform.from_pairs(points, landed)
print(f"scale {recovered.scale:.6f}")
print(f"turn {recovered.angle:.6f} radians, {np.degrees(recovered.angle):.2f} degrees")
print(f"shift {recovered.row_shift:.6f} down, {recovered.column_shift:.6f} right")
gaps = [
    abs(recovered.scale - 1.3),
    abs(recovered.angle - 0.6),
    abs(recovered.row_shift - 4.0),
    abs(recovered.column_shift + 2.0),
]
print(f"largest gap from the planted numbers {max(gaps):.2e}")`,
              `scale 1.300000
turn 0.600000 radians, 34.38 degrees
shift 4.000000 down, -2.000000 right
largest gap from the planted numbers 1.33e-15`,
              { hints: ["A move carries an array of (row, column) points with applied_to, and answers one landing position per point.", "The fit takes the first points and the second points as two arrays of the same shape, and answers a move of the same kind."], check: numberCheck("What turn, in degrees, does the recovered move report?", 34.38, 0.01, "A turn of 0.6 radians is 34.38 degrees. Three pairs over-determine the four numbers and the closed form recovers them to around 1e-15, which is the arithmetic rather than an approximation, so the degrees come back as the planted ones to every printed place.") },
            ),
            exercise(
              "Line up a scene you drew yourself",
              ["Draw a scene of your own, turn it a quarter circle about the middle of the frame with a shift of three down and five to the left, and run the whole method on the pair.", "Print how many keypoints each picture has, how many matches the ratio test kept, how many the vote named inliers and outliers, the turn it recovered, and the mean pixel difference between the pictures before and after the second is carried back."],
              `import math
import numpy as np
from oop_ml.core.computer_vision.alignment import (
    AlignmentEstimate, DescriptorSet, IntensityCentroidRule, SimilarityTransform,
    mean_absolute_difference, oriented_keypoints_of,
)
from oop_ml.core.computer_vision.picture import Picture

canvas = np.zeros((64, 64))
canvas[14:35, 14:23] = 1.0          # an L
canvas[14:20, 14:35] = 1.0
canvas[40:50, 36:46] = 0.8          # a square
canvas[8:14, 44:50] = 0.6           # a smaller, dimmer square
rows, columns = np.ogrid[:64, :64]
canvas[(rows - 46) ** 2 + (columns - 14) ** 2 <= 25] = 0.9   # a disc
for step in range(10):               # a diagonal bar
    canvas[52 - step, 50 + step : 53 + step] = 0.7
first = Picture(canvas)

angle = math.radians(90)
centre = np.array([31.5, 31.5])
turn = np.array([[math.cos(angle), -math.sin(angle)], [math.sin(angle), math.cos(angle)]])
shift = centre - turn @ centre + np.array([3.0, -5.0])
move = SimilarityTransform(1.0, angle, float(shift[0]), float(shift[1]))
second = move.warp(first)
# Orient the keypoints of both pictures (border 12, at most 40 each), read them
# with the binary descriptor, match, estimate the move, and print the counts,
# the recovered turn in degrees, and the difference before and after.`,
              `import math
import numpy as np
from oop_ml.core.computer_vision.alignment import (
    AlignmentEstimate, DescriptorSet, IntensityCentroidRule, SimilarityTransform,
    mean_absolute_difference, oriented_keypoints_of,
)
from oop_ml.core.computer_vision.picture import Picture

canvas = np.zeros((64, 64))
canvas[14:35, 14:23] = 1.0          # an L
canvas[14:20, 14:35] = 1.0
canvas[40:50, 36:46] = 0.8          # a square
canvas[8:14, 44:50] = 0.6           # a smaller, dimmer square
rows, columns = np.ogrid[:64, :64]
canvas[(rows - 46) ** 2 + (columns - 14) ** 2 <= 25] = 0.9   # a disc
for step in range(10):               # a diagonal bar
    canvas[52 - step, 50 + step : 53 + step] = 0.7
first = Picture(canvas)

angle = math.radians(90)
centre = np.array([31.5, 31.5])
turn = np.array([[math.cos(angle), -math.sin(angle)], [math.sin(angle), math.cos(angle)]])
shift = centre - turn @ centre + np.array([3.0, -5.0])
move = SimilarityTransform(1.0, angle, float(shift[0]), float(shift[1]))
second = move.warp(first)

rule = IntensityCentroidRule()
before = oriented_keypoints_of(first, rule, border=12, limit=40)
after = oriented_keypoints_of(second, rule, border=12, limit=40)
matches = DescriptorSet.binary(first, before).matched_to(DescriptorSet.binary(second, after))
estimate = AlignmentEstimate.of(matches)

print(f"keypoints {len(before)} and {len(after)}, matches {len(matches)}")
print(f"inliers {estimate.n_inliers}, outliers {len(estimate.outliers)}")
print(f"planted turn {math.degrees(move.angle):.2f} degrees, recovered {math.degrees(estimate.transform.angle):.2f} degrees")
print(f"difference before {mean_absolute_difference(first, second):.4f}, after {mean_absolute_difference(first, estimate.aligned(second)):.4f}")`,
              `keypoints 20 and 16, matches 10
inliers 6, outliers 4
planted turn 90.00 degrees, recovered 90.00 degrees
difference before 0.1805, after 0.0000`,
              { hints: ["A quarter turn is exact, so every corner lands on a pixel and the matches that are right come back at zero bits.", "A set of descriptors is built from a picture and its oriented keypoints, and matched to another set with the ratio test at its default of 0.8.", "The estimate carries the recovered move as its transform, and aligned carries the second picture back into the first picture's frame."], check: numberCheck("How many matches did the ratio test keep?", 10.0, 0.5, "Twenty keypoints in the first picture and sixteen in the second give ten matches, of which the vote keeps six as inliers and names four as outliers. The four are corners of the squares and the L that look alike in their own frames, which is Part 3's repeated-structure case, and the turn is recovered exactly from the six.") },
            ),
            exercise(
              "Turn it twenty degrees instead and see what survives",
              ["Keep the scene from the last problem and turn it twenty degrees rather than a quarter circle, so that no pixel lands on a pixel and the second picture is resampled.", "Run the same pipeline. On this scene the ratio test is left with a single match, and fixing a move from one match is refused by name rather than answered. Catch the refusal and print it."],
              `import math
import numpy as np
from oop_ml.core.computer_vision.alignment import (
    AlignmentEstimate, DescriptorSet, IntensityCentroidRule, SimilarityTransform,
    mean_absolute_difference, oriented_keypoints_of,
)
from oop_ml.core.computer_vision.picture import Picture

canvas = np.zeros((64, 64))
canvas[14:35, 14:23] = 1.0          # an L
canvas[14:20, 14:35] = 1.0
canvas[40:50, 36:46] = 0.8          # a square
canvas[8:14, 44:50] = 0.6           # a smaller, dimmer square
rows, columns = np.ogrid[:64, :64]
canvas[(rows - 46) ** 2 + (columns - 14) ** 2 <= 25] = 0.9   # a disc
for step in range(10):               # a diagonal bar
    canvas[52 - step, 50 + step : 53 + step] = 0.7
first = Picture(canvas)

from oop_ml.core.exceptions import MLLibError

angle = math.radians(20)
centre = np.array([31.5, 31.5])
turn = np.array([[math.cos(angle), -math.sin(angle)], [math.sin(angle), math.cos(angle)]])
shift = centre - turn @ centre + np.array([3.0, -5.0])
move = SimilarityTransform(1.0, angle, float(shift[0]), float(shift[1]))
second = move.warp(first)
# Detect, describe and match as before, print how many matches survived, then
# try to estimate the move and print the name and message of the refusal.`,
              `import math
import numpy as np
from oop_ml.core.computer_vision.alignment import (
    AlignmentEstimate, DescriptorSet, IntensityCentroidRule, SimilarityTransform,
    mean_absolute_difference, oriented_keypoints_of,
)
from oop_ml.core.computer_vision.picture import Picture

canvas = np.zeros((64, 64))
canvas[14:35, 14:23] = 1.0          # an L
canvas[14:20, 14:35] = 1.0
canvas[40:50, 36:46] = 0.8          # a square
canvas[8:14, 44:50] = 0.6           # a smaller, dimmer square
rows, columns = np.ogrid[:64, :64]
canvas[(rows - 46) ** 2 + (columns - 14) ** 2 <= 25] = 0.9   # a disc
for step in range(10):               # a diagonal bar
    canvas[52 - step, 50 + step : 53 + step] = 0.7
first = Picture(canvas)

from oop_ml.core.exceptions import MLLibError

angle = math.radians(20)
centre = np.array([31.5, 31.5])
turn = np.array([[math.cos(angle), -math.sin(angle)], [math.sin(angle), math.cos(angle)]])
shift = centre - turn @ centre + np.array([3.0, -5.0])
move = SimilarityTransform(1.0, angle, float(shift[0]), float(shift[1]))
second = move.warp(first)

rule = IntensityCentroidRule()
before = oriented_keypoints_of(first, rule, border=12, limit=40)
after = oriented_keypoints_of(second, rule, border=12, limit=40)
matches = DescriptorSet.binary(first, before).matched_to(DescriptorSet.binary(second, after))
print(f"keypoints {len(before)} and {len(after)}, matches {len(matches)}")

try:
    AlignmentEstimate.of(matches)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)`,
              `keypoints 20 and 40, matches 1
TooFewValuesError
two matches fix a similarity and one cannot; got 1`,
              { hints: ["The resampled picture has jagged edges where the exact one had straight ones, and the corner detector finds far more candidates in it than in the original.", "Every refusal the library makes derives from one base class, so catching that one catches whichever specific refusal this turns out to be.", "The lesson's own scene survives a thirty-degree turn with fifteen matches because its shapes are more distinct within a patch than this one's; a scene with more texture inside each shape would too."] },
            ),
          ],
        },
      ]}
    />
  );
}
