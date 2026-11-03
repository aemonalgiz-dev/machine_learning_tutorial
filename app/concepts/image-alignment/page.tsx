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
  title: "Image Alignment · Perceptron Lab",
  description:
    "Corresponding points in two images provide evidence about how their coordinates relate. Estimating that transformation allows the images to be aligned, with incorrect matches affecting the result.",
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
      playgroundTitle="Which transformation brings these images together?"
      playgroundIntro="Plant a move, turning, scaling and shifting the scene, and watch the method find it again. Compare what it kept with what was actually right, then carry the second picture back and read the difference."
      title="Image Alignment"
      tagline={"Corresponding points in two images provide evidence about how their coordinates relate. Estimating that transformation allows the images to be aligned, with incorrect matches affecting the result."}
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
                Recall the quarter-turn experiment in the keypoints lesson. Every corner was detected again in its expected position, with the same measured strength. But the corresponding descriptors were 1.443376 apart on a distance scale whose maximum is 2.0. That was as far apart as the square&apos;s top-left and top-right corners. We found the location successfully, yet its description changed enough to resemble another corner. Let&apos;s examine what the rotation did to the patch.
              </p>
              <p>The descriptor reads a square of brightness around a keypoint. It subtracts the patch mean and divides by the length of the remaining value pattern, reducing sensitivity to a common brightness shift and positive rescaling. But it still reads the square with the image&apos;s up direction as up.</p>
              <p>Rotate the image and the same physical corner presents its pixels in a different order. A neighboring corner can resemble that turned pattern. We therefore need to examine orientation as well as brightness: which direction should count as up when we describe this particular keypoint?</p>
              <SubSection title="1. The cost, measured three ways">
                <p>The checks use an L-shaped bar with six corners. Turning it by a quarter circle permutes the pixel grid without needing interpolation, so we can first isolate how each descriptor responds to that exact rotation. Later experiments use other angles, where resampling introduces another source of difference.</p>
                <TurnCostLedger />
                <p>At each of the six corners, the original patch descriptor changes by 1.443376 after the quarter turn. The two orientation-aligned descriptions built below remain unchanged in this experiment: the binary descriptor has zero differing bits out of 256, and the gradient descriptor has distance 0.0. But three corners also have binary distance zero from a different corner. Rotation tolerance does not resolve repeated appearances.</p>
              </SubSection>
              <KeepInMind>
                Following the rotation helps corresponding descriptors remain comparable. They also need enough distinguishing information to avoid confusing different locations. The ratio test checks that second issue among the available candidates, but geometric consistency is still needed to assess the proposed matches.</KeepInMind>
            </>
          ),
        },
        {
          title: "Part 2. A Direction That Belongs To The Corner",
          content: (
            <>
              <p>A description can follow an image rotation if its coordinate frame follows the keypoint’s local orientation. We therefore estimate an orientation from nearby brightness or gradients, then describe the patch relative to that estimate. The two methods below obtain that frame in different ways.</p>
              <SubSection title="2. The center of brightness" id="2-the-centre-of-brightness">
                <p>ORB estimates a local orientation from intensity moments. Take a disc of radius four around the corner, with the corner as the origin, rows increasing downward and columns increasing rightward. Multiply each pixel&rsquo;s brightness by its horizontal and vertical offsets, then sum separately. For nonnegative brightness, this gives the direction toward the disc&rsquo;s center of brightness when that center is displaced from the origin.</p>
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
                <p>The SIFT-style rule uses the dominant gradient direction. Each pixel contributes its gradient magnitude to one of thirty-six ten-degree bins. A Gaussian weight gives pixels near the keypoint more influence. The implementation then refines a peak&rsquo;s angle by fitting a parabola through that bin and its two neighbors, allowing angles between the bin centers.</p>
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

                  Two similarly strong orientation peaks can make a single selected direction unstable: a small image change may switch which peak wins. SIFT keeps additional peaks reaching eighty percent of the highest, allowing several oriented keypoints at one position. Here the corner has directions 5.54 and 95 degrees. The centroid rule returns one direction, but it has its own degeneracy: when both moments are zero, there is no preferred direction, and this SDK returns zero by convention.</KeepInMind>
              </SubSection>
              <SubSection title="4. What a quarter turn does to each">
                <p>After this exact quarter turn, every centroid direction changes by a quarter turn with no measured rounding difference. The gradient directions agree with the expected change to within 4.4e-16 radians. These results check the orientation rules on this bar; arbitrary rotations also involve resampling and need not give exact agreement.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Reading The Patch In Its Own Frame",
          content: (
            <>
              <p>Use the estimated orientation as the patch’s reference axis. If that estimate follows the image rotation and the sampling is consistent, corresponding structure is read in the same relative positions. The exact quarter-turn example makes that relationship visible. Arbitrary rotations also introduce resampling and estimation errors.</p>
              <SubSection title="5. Pixel pairs, one bit each">
                <p>The binary descriptor shown here uses 256 fixed pairs of sample positions inside a fifteen-wide square. A seeded generator chooses the pairs once so every image uses the same pattern. Rotate each pair by the keypoint&rsquo;s orientation and round to pixel positions. Comparing the brightness at the two positions produces one bit. The distance between descriptors is the number of differing bits, called Hamming distance. A three-by-three mean filter reduces sensitivity to individual noisy pixels before these comparisons.</p>
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
                <p>The SIFT-style descriptor uses a sixteen-pixel-wide square aligned to the keypoint’s estimated orientation. It divides that square into four-by-four cells and accumulates eight gradient-direction bins per cell, with angles measured relative to the keypoint’s orientation.</p>
<p>A sample distributes its contribution between neighboring spatial cells and orientation bins. This interpolation reduces abrupt changes when a sample moves slightly across a boundary. The resulting 128 counts are normalized, clipped at 0.2 and normalized again to reduce domination by a few large entries. Descriptor comparisons then use Euclidean distance. This is the simplified SIFT-style implementation used here, rather than every detail of the original SIFT pipeline.</p>
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
                  separates the concave corner from its nearest neighbor but is
                  not zero.
                </p>
                <p>Rotation alignment makes identical rotated local patches indistinguishable. These three corners look the same within the binary descriptor&rsquo;s reach, even though their wider surroundings differ. A wider patch can add context, as the histogram descriptor does here. Under the binary reading, their distance ratio is one, so the matcher rejects them as ambiguous.</p>
              </SubSection>
              <InAModel>
                Reference ORB selects binary comparisons for high variability and low correlation, rather than using this random pair pattern. It also uses an image pyramid whose number of levels can be configured. SIFT detects keypoints in scale space and measures its descriptor relative to the selected scale. Both approaches align local descriptions to an estimated orientation; their full detection and sampling procedures go beyond the simplified versions here.</InAModel>
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
              "The top-left corner of the bar has moments of 25.0 rightward and 25.0 downward. What direction does the center of brightness give it?",
              ["45 degrees", "90 degrees", "0 degrees", "135 degrees"],
              0,
              "The direction is the arctangent of the downward moment over the rightward one, and two equal moments give an eighth of a turn, measured from pointing right towards pointing down. The bottom-left corner has the same rightward moment and a downward moment of minus 25.0, and faces minus 45 degrees.",
            ),
            choice(
              "Why does SIFT keep two directions for a corner where two edges meet at equal strength?",
              [
                "The histogram has two equal peaks, and any rule for picking one would pick the other after a turn",
                "Two directions make the descriptor twice as long and therefore more precise",
                "The center of brightness is undefined at such a corner",
                "A corner always has two edges, so every corner gets two directions",
              ],
              0,
              "When several orientation-histogram peaks are strong, SIFT-style assignment can keep multiple oriented keypoints at the same position. That avoids discarding plausible orientations through one arbitrary peak choice. The eighty-percent rule is a stated selection convention. The centroid method uses the direction of local brightness moments instead; that direction can itself be unstable or undefined when the moments nearly cancel.",
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
              "Its sixteen-wide square sees to where the bar's arms end, and the three corners that are bit-identical under the pairs sit 0.306 apart under the histogram. That is small beside the 1.138 that separates the concave corner from its nearest neighbor, which is the difference between context that is barely there and context that is plentiful.",
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
                <p>The playground rotates the shared scene by thirty degrees and shifts it three pixels down and five left about the frame center. This rotation requires resampling rather than simply rearranging the pixel grid. The centroid-oriented binary descriptor finds 40 keypoints per image and retains 15 matches: ten agree with the planted move and five do not. Knowing the move lets us inspect those errors directly.</p>
                <p>The dominant-gradient and histogram combination keeps 34 matches, of which 17 are correct. Thus one third of the binary method&rsquo;s 15 accepted matches are wrong, and half of the histogram method&rsquo;s 34 are wrong. Descriptor agreement still leaves errors for the geometric estimation stage to handle.</p>
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
              <p>A match proposes that two coordinates refer to the same scene location. The planted image changes here use a rotation, uniform scale and translation, called a similarity transform. Under that model, all correct matches should agree on the same four parameters. Real camera motion need not produce this restricted image transformation.</p>
              <Equation>
                {
                  "second = scale × R(angle) × first + shift\n\nR(angle) = [ cos  −sin ]\n           [ sin   cos ]\n\nfour numbers: scale, angle, shift down, shift right"
                }
              </Equation>
              <p>Two correspondences determine a positive-scale, orientation-preserving similarity transform when the two source positions are distinct and the two target positions are distinct. Each contributes two coordinate equations. With more correspondences, the transform can be fitted by least squares, allowing for imperfect agreement.</p>
              <WhyThisWorks title="The closed form">
                <DerivationTable
                  rows={[
                    {
                      expression: "center both sets of positions on their means",
                      reason: "the shift is whatever is left once the turn and scale are known, so it is found last",
                    },
                    {
                      expression: "C = (second − mean)ᵀ (first − mean)",
                      reason: "the two by two cross-covariance, which holds the turn",
                    },
                    {
                      expression: "C = U S Vᵀ,  D = diag(1, det(U Vᵀ)),  R = U D Vᵀ",
                      reason: "the singular value decomposition; D corrects a negative determinant so the fitted transformation preserves orientation",
                    },
                    {
                      expression: "scale = trace(S D) / Σ |first − mean|²",
                      reason: "the scale minimizing squared residuals, using the same reflection correction as the rotation",
                    },
                    {
                      expression: "shift = mean(second) − scale × R × mean(first)",
                      reason: "what carries the first center onto the second",
                    },
                  ]}
                />
                <p>For three positions transformed by a turn of 0.6 radians, scale 1.3 and shift of four down and two left, the recovered parameters agree to within 1.3e-15. The two-position example also agrees within floating-point precision. The closed-form solution avoids an iterative search, but numerical evaluation still involves rounding.</p>
              </WhyThisWorks>
              <KeepInMind>
                The four-parameter model is appropriate for the planted image transformations here. Camera movement in a real scene can require a different model. A homography has eight independent parameters and needs at least four nondegenerate correspondences; it can describe a plane under perspective changes or pure camera rotation under the usual pinhole model. General three-dimensional scenes can also exhibit depth-dependent parallax.</KeepInMind>
            </>
          ),
        },
        {
          title: "Part 6. Let The Matches Vote",
          content: (
            <>
              <p>A similarity transform can be estimated from two nondegenerate matches. If some matches are wrong, fitting them all by least squares lets those mistakes pull the result. RANSAC instead proposes a transform from a small subset and checks how many other matches support it. The next example follows that proposal-and-check process.</p>
              <SubSection title="10. Every pair proposes, the rest agree or do not">
                <p>Take two nondegenerate matches and fit their implied transform. Apply it to every source position and count targets within 1.5 pixels of their proposed partners. That count is the hypothesis&rsquo;s support. For this small example, test every pair, select the greatest support, break ties by lower total error, and refit using the supporting matches. Matches within the tolerance are called inliers; those outside it are outliers. These labels describe agreement with the fitted model, not known correctness.</p>
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
                <p>In this example, pairs containing wrong matches usually propose transforms with little support. Pairs of correct matches agree on a common move. The procedure chooses support rather than averaging every proposal. That can reject outliers, but sufficiently numerous or consistent false matches can still win. The implementation enumerates small sets of pairs and uses a seeded sample when there are many.</p>
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
              "The dominant-gradient rule can assign more than one orientation to a position, producing more descriptors and more candidate matches. Here it retains seventeen correct matches among thirty-four, while centroid-based binary matching has ten correct among fifteen. A longer descriptor alone does not explain the count, and the correct-match proportions are different.",
            ),
            choice(
              "Why can two distinct, correctly corresponding point pairs identify a nondegenerate similarity transform?",
              [
                "A similarity has four numbers and two matched positions give four equations",
                "Two matches are always right, so the fit cannot be contaminated",
                "The singular value decomposition needs exactly two rows",
                "One match fixes the shift and the second fixes the scale, which leaves the turn to the ratio test",
              ],
              0,
              "The transform has four parameters: rotation, positive scale and two translation components. Two distinct correspondences supply enough independent coordinate constraints to recover them in this model. More pairs support a least-squares estimate. A general planar projective transform has eight effective parameters and needs at least four correspondences in a suitable, nondegenerate configuration.",
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
              "Each usable pair proposes one transform, which is then tested against the other matches. On this planted example, proposals from correct pairs receive much broader support than the wrong proposals. The best proposal is refitted using its inlier set. Consistent false correspondences can also form a supported transform in other scenes, so consensus is evidence of geometric agreement, not proof of correct identity.",
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
              <p>Check the recovered transformation by using it to align the images. For each output position, find the corresponding position in the second image and interpolate its neighboring pixels. Agreement after alignment supports the estimate, while occlusion, changed lighting and resampling can leave differences even with a good geometric fit.</p>
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
                <p>The planted transform supplies ground truth for checking the matches. The table compares the method’s inlier/outlier decision with whether each correspondence is correct under that known transform. An ordinary alignment problem does not supply those correctness labels.</p>
<p>For the opening transform, the ten inliers are the ten true matches and the five outliers are the five false matches. After scaling to 0.8 and rotating forty degrees, eleven proposed matches include seven true correspondences, but nine are accepted as inliers. Two incorrect correspondences happen to fall within the 1.5-pixel geometric tolerance. The recovered angle is still 39.97 degrees, showing why an accurate transform does not imply every inlier is a true match.</p>
                <NumberTable
                  headings={["Move", "Matches", "Right", "Kept", "Kept and right", "Turn recovered", "Difference after"]}
                  rows={[
                    ["Turn 30, shift (3, −5)", "15", "10", "10", "10", "30.56", "0.0187"],
                    ["Scale 1.25, turn 25, shift (2, −3)", "13", "7", "7", "7", "25.3", "0.0293"],
                    ["Scale 0.8, turn 40, shift (−4, 2)", "11", "7", "9", "7", "39.97", "0.0299"],
                    ["Scale 1.6, turn 20", "4", "2", "2", "2", "19.95", "none"],
                  ]}
                  caption="The centroid and pairs on four planted moves. The last row fits from only two inliers, the minimum required, so there are no additional supporting matches beyond the fitting pair. This example withholds the aligned-image result."
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
                <p>Orientation alignment does not remove image-scale changes. With a fixed patch width, a smaller object places different structures inside the descriptor window. On this scene, scales 1.25 and 0.8 retain seven correct matches, while scale 1.6 retains only two.</p>
<p>The ORB-style implementation uses an image pyramid to compare several scales: each level is smaller by a factor of 1.2, and keypoints are detected and described at each level. A suitable pair of levels can make corresponding local structures more comparable. The finite scale samples, repeated candidates and resampling still affect matching.</p>
                <PyramidLedger />
                <p>On the opening move, the six-level pyramid finds 126 oriented keypoints, compared with 40 from one level. Descriptions of the same corner at neighboring scales can become close competitors in the ratio test. Here it accepts 32 matches with six correct, compared with 15 matches with ten correct at one level. The six correct matches still recover the transform. More scale samples therefore add useful coverage for scale changes but do not guarantee better matching on every image pair.</p>
              </SubSection>
              <SubSection title="15. A change of viewpoint">
                <p>A similarity transform is suitable for the planted rotation, uniform scaling and translation here. A planar scene seen from different viewpoints may instead require a homography, with eight independent parameters and at least four nondegenerate matches. A general three-dimensional scene can also show parallax, where one homography cannot align every depth. Choose the transformation model before interpreting a mismatch as a bad correspondence.</p>
              </SubSection>
              <SubSection title="16. Repeated structure">
                <p>Repeated patterns can leave several equally plausible local correspondences. A wider patch may add distinguishing context, but it may still repeat. The ratio test can reject these ambiguous proposals instead of making an arbitrary selection. Returning too few matches to estimate a move is a limitation to report, rather than a reason to force a transform.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Recording Coordinate and Resampling Conventions", id: "part-9-implementation-and-failure-contracts",
          content: (
            <>
              <p>The SDK checks whether the requested samples fit inside the image. Orientation discs and rotated descriptor patterns that extend outside it raise an error rather than being padded. A suitable detection border avoids those errors. It also rejects comparisons between descriptor kinds or between binary patterns with different sample pairs, because corresponding entries would no longer describe the same measurements. These checks catch incompatible inputs; they do not guarantee that a valid match is correct.</p>
              <p>Estimating this transform requires at least two nondegenerate correspondences. The estimator skips pairs sharing a position on either side and raises an error if none can propose a transform. It also checks that scale is positive and finite, angle is finite, and the ratio threshold is greater than zero and at most one. A threshold of one is allowed and accepts distance ties, which is why the playground can use it to disable ratio rejection.</p>
              <p>These teaching implementations omit subpixel keypoint refinement, a continuous scale space beyond the pyramid levels, and a learned binary pair pattern. They retain interpolation across neighboring cells and direction bins, together with parabolic refinement of the orientation peak. Stating those choices matters when comparing the measured results with reference ORB or SIFT implementations.</p>
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
              "The estimated transform has nine inliers, including two correspondences that are wrong under the planted ground truth but within the 1.5-pixel tolerance. Its recovered rotation is still close to the known value. An inlier therefore means geometrically consistent within the chosen threshold, not necessarily a true correspondence. Those false inliers can influence the refitted parameters.",
            ),
            choice(
              "On the opening move, six levels of pyramid at a factor of 1.2 found 126 keypoints and got six matches right where one level got ten. Why?",
              [
                "Each corner was found at several neighboring sizes, and those copies were each other's runners-up under the ratio test",
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
              "Estimating a nonzero-scale similarity from two correspondences requires distinct points on both sides. A repeated source paired with different destinations is inconsistent, while different sources paired with one destination would collapse scale to zero. This implementation rejects those degenerate proposal pairs; if no usable pair remains, it cannot estimate a transform.",
            ),
          ],
        },
        {
          title: "Practice. Lining Up Pictures With the Library",
          practice: [
            exercise("Read one corner before and after a quarter turn",["Draw the lesson's bent bar, turn it a quarter circle with numpy, and give the corners of both pictures a direction with the center-of-brightness rule.", "Find the corner at row 14, column 14 in the first picture and the corner it lands on in the second, at row 34, column 14. Print the direction each faces in degrees, then read both with the binary descriptor and print how many of the 256 bits differ."],`import numpy as np
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
# in degrees, and print the Hamming distance between their binary readings.`,`import numpy as np
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
print(f"bits that differ: {reading.distance_to(reading_after):.0f} of {reading.n_values}")`,`before the turn the corner faces 45.00 degrees
after the turn it faces -45.00 degrees
bits that differ: 0 of 256`,{...{ hints: ["A border of 12 keeps every corner's patch inside the picture; the detector reports nothing nearer the frame than that.", "The oriented keypoints carry a row, a column and an angle in radians, so numpy's degrees turns the angle into what the lesson quotes.", "A descriptor is read from a picture and an oriented keypoint, and two descriptors of the same kind answer their distance to each other."], check: numberCheck("What direction, in degrees, does the corner face after the turn?", -45.0, 0.05, "The estimated orientation rotates with this ideal corner, and the descriptor rotates its comparison pattern with it. The bit agreement is measured on this exact quarter-turn example, not guaranteed for arbitrary rotated photographs.") },question:"Does rotating the sampling pattern preserve this corner's descriptor?"}),
            exercise("Recover a planted move from three points",["Construct the supplied similarity transform: scale 1.3, rotation 0.6 radians, row shift 4 and column shift −2. Apply it to the three point coordinates, then recover a SimilarityTransform from the original and transformed point pairs.", "Print the recovered scale, angle in radians and degrees, row and column shifts, and largest absolute difference from the supplied parameters. Two distinct informative pairs can identify this transform; extra pairs let the method minimize coordinate error jointly."],`import numpy as np
from oop_ml.core.computer_vision.alignment import SimilarityTransform

planted = SimilarityTransform(1.3, 0.6, 4.0, -2.0)
points = np.array([[1.0, 2.0], [5.0, 7.0], [3.0, -1.0]])
# Carry the points through the planted move, fit a move from the pairs, and
# print its scale, its turn in radians and degrees, its shift, and the largest
# gap from the planted numbers.`,`import numpy as np
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
print(f"largest gap from the planted numbers {max(gaps):.2e}")`,`scale 1.300000
turn 0.600000 radians, 34.38 degrees
shift 4.000000 down, -2.000000 right
largest gap from the planted numbers 1.33e-15`,{...{ hints: ["A move carries an array of (row, column) points with applied_to, and answers one landing position per point.", "The fit takes the first points and the second points as two arrays of the same shape, and answers a move of the same kind."], check: numberCheck("What turn, in degrees, does the recovered move report?", 34.38, 0.01, "The supplied point pairs recover the planted similarity transform to floating-point precision. Its angle agrees with the planted rotation; enough distinct, informative point correspondences are required to identify the transform.") },question:"Can the point pairs recover the transformation used to move them?"}),
            exercise("Line up a scene you drew yourself",["Use the supplied scene generator so that the numeric checks describe the same scene. Rotate it a quarter turn about the frame center and shift it three pixels down and five left. Run the keypoint, descriptor, matching and geometric-consensus procedure on the pair.","Print both keypoint counts, the retained match count, the inlier and outlier counts, the recovered turn, and the mean pixel difference before and after aligning the second image back. Inliers are matches supporting the fitted transformation; outliers are rejected correspondences."],`import math
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
# the recovered turn in degrees, and the difference before and after.`,`import math
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
print(f"difference before {mean_absolute_difference(first, second):.4f}, after {mean_absolute_difference(first, estimate.aligned(second)):.4f}")`,`keypoints 20 and 16, matches 10
inliers 6, outliers 4
planted turn 90.00 degrees, recovered 90.00 degrees
difference before 0.1805, after 0.0000`,{...{ hints: ["A quarter turn is exact, so every corner lands on a pixel and the matches that are right come back at zero bits.", "A set of descriptors is built from a picture and its oriented keypoints, and matched to another set with the ratio test at its default of 0.8.", "The estimate carries the recovered move as its transform, and aligned carries the second picture back into the first picture's frame."], check: numberCheck("How many matches did the ratio test keep?", 10.0, 0.5, "Some visually similar corners propose incorrect correspondences. The geometric consensus retains the matches agreeing on the planted move, allowing this supplied scene to align despite those outliers.") },question:"Can the supplied scene be aligned despite incorrect corner matches?"}),
            exercise("Turn it twenty degrees instead and see what survives",["Reuse the previous scene but rotate it twenty degrees about the same center instead of ninety, keeping the row and column shifts unchanged. This rotation requires resampling, so the resulting pixel and corner patterns need not match the exact quarter-turn case.", "Run the same detection, description and matching settings. Print the keypoint and match counts, then attempt AlignmentEstimate.of. Catch MLLibError and print its class name and message. Inspect whether enough usable correspondences survive to estimate the transform."],`import math
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
# try to estimate the move and print the name and message of the refusal.`,`import math
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
    print(refusal)`,`keypoints 20 and 40, matches 1
TooFewValuesError
two matches fix a similarity and one cannot; got 1`,{...{ hints: ["The resampled picture has jagged edges where the exact one had straight ones, and the corner detector finds far more candidates in it than in the original.", "The lesson's different scene retains more correspondences under its thirty-degree rotation. Texture and distinctive local patterns can help, but descriptor sampling, interpolation, thresholds and geometry all affect whether this scene yields enough matches."] },question:"What changes when rotation requires resampling the image?"}),
          ],
        },
      ]}
    />
  );
}
