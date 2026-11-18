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
import { ApertureSlide } from "@/components/widgets/ApertureSlide";
import { DescriptorCard } from "@/components/widgets/DescriptorCard";
import { KeypointWorkbench } from "@/components/widgets/KeypointWorkbench";
import { MatchBoard } from "@/components/widgets/MatchBoard";
import { SceneLedger } from "@/components/widgets/SceneLedger";
import { SuppressionLadder } from "@/components/widgets/SuppressionLadder";
import { WhyACorner } from "@/components/widgets/WhyACorner";
import { WithoutCorners } from "@/components/widgets/WithoutCorners";

export const metadata: Metadata = pageMetadata("/concepts/keypoints-and-descriptors", {
  title: "Keypoints and Descriptors · Perceptron Lab",
  description:
    "Distinctive image locations can be matched across photographs taken from different viewpoints. A descriptor gives each location a numerical account of its surroundings so candidate matches can be compared.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KeypointsAndDescriptorsPage() {
  return (
    <ConceptPage
      lessonId="keypoints-and-descriptors"
      intuition={lessonIntuitions["keypoints-and-descriptors"]}
      technicalStart="Part 3. Scoring A Corner"
      openingTitle="Find Places You Can Recognize Again" openingId="find-places-you-can-recognise-again"
      playgroundTitle="Find image locations we could recognize again"
      playgroundIntro="Compare the detected locations with their descriptors and proposed matches. Check whether a strong local match also makes sense in the two pictures."
      title="Keypoints and Descriptors"
      tagline={"Distinctive image locations can be matched across photographs taken from different viewpoints. A descriptor gives each location a numerical account of its surroundings so candidate matches can be compared."}
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
<p>Suppose we photograph the same scene twice after moving the camera. Which position in the second image corresponds to a corner in the first? To answer, we need locations worth comparing and a way to describe the image near each one.</p>
              <p>Our drawn scene is 48 pixels on each side. It contains a square, a disc, a diagonal bar and three small crosses, with a brightness ramp making one side lighter. We know where those objects were placed, so we can check whether a proposed match found the same feature or merely a similar-looking piece elsewhere.</p>
                <p>We could describe a patch at every image position, but many patches are uninformative. A flat region looks much like another flat region. Along a straight edge, several positions can also look alike. Choosing locally distinctive positions can reduce both the later computation and the ambiguity.</p>
</>
                <p>A five-wide patch fits at 1,936 of the scene&rsquo;s 2,304 pixels. Those positions produce 815 distinct descriptor vectors. Of the positions, 1,179 share their descriptor with at least one other position, and the largest identical group contains 86 positions. Comparing those 86 descriptors alone cannot recover which location each came from.</p>
                <NumberTable
                  headings={["what was counted", "on the scene above"]}
                  rows={[
                    ["pixels", "2,304"],
                    ["positions a five-wide patch fits at", "1,936"],
                    ["descriptions that are distinct", "815"],
                    ["positions sharing theirs with another", "1,179"],
                    ["largest group agreeing exactly", "86"],
                  ]}
                  caption="Many positions have identical local descriptors, which prevents the descriptors alone from identifying their locations."
                />
                <KeepInMind>

                  In this scene, many positions have identical local descriptions. A descriptor can accurately record brightness around a pixel without identifying its location. We need to check distinctiveness as well as the cost of describing every position.</KeepInMind>
              </SubSection>

              <SubSection title="2. Most positions cannot say where they came from">
                <>
<p>
                  Let&apos;s try it. Take a five-pixel-wide patch from the middle of the bright square&apos;s left edge. Slide the comparison window down the edge and measure its distance from that patch. Five of the fifteen positions give distance zero, so the local patch cannot tell those positions apart.
                </p>
                <p>
                  Not nearly zero; the same numbers in the same order. Slide the same window past the corner instead and exactly one stop matches, which is the corner itself.
                </p>
</>
                <ApertureSlide />
                <p>
                  This is the aperture problem. Imagine looking at a long straight edge through a small hole. Movement across the edge changes the visible patch, but movement along it may leave the patch looking the same. We then lack evidence for one component of motion. A corner contains changes in two directions, so moving it either way can change what we see.
                </p>
                <KeepInMind>

                  A useful candidate changes its local appearance when the window moves in either direction. That helps us locate it within its neighborhood. It does not make the appearance unique across the image: several repeated corners can still look identical.</KeepInMind>
              </SubSection>

              <SubSection title="3. Find, describe, match">
                <p>First find positions whose surrounding brightness pattern changes when the window moves in different directions. These are candidate keypoints. Describe a small neighborhood around each selected position, then compare those descriptions between images. We will check both whether a position can be located reliably and whether its appearance can be matched distinctively.</p>
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
                <p>For the next measurements, use a clean square with brightness one on a zero background, without the workbench scene&rsquo;s brightness ramp. Inspect a corner, the middle of an edge four pixels from any corner, and a flat background patch. The drawing shows the nine gradient vectors in a three-by-three window at each location. Each arrow points toward increasing brightness; its length records how rapidly brightness changes.</p>
                <WhyACorner show="probes" />
                <p>The flat patch has no gradient arrows. At the straight edge they all point right, so brightness changes in only one direction. At the corner some point right and others point down. The edge has long arrows too; a corner score needs to recognize variation in different directions rather than merely large gradients.</p>
                <KeepInMind>
                  These ideal patches contain brightness changes in zero, one or two independent directions. We will measure how much gradient variation the window contains along its weakest direction. Real images can give small nonzero responses even where the underlying surface looks flat.</KeepInMind>
              </SubSection>

              <SubSection title="5. Three averaged products hold all of it">
                <p>Summarize the local gradients using their mean squared horizontal response, mean squared vertical response and mean cross-product. These quantities form a small symmetric matrix at each position. The corner scores used here read that matrix to ask whether the neighborhood contains variation in more than one direction.</p>
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
                    window and the usual center-weighted gradient estimate, the
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

                  Each matrix summarizes gradients across a neighborhood. A single gradient vector describes change at one location; averaging the outer products lets different directions within the window contribute to the score.</KeepInMind>
              </SubSection>

              <SubSection title="6. Without the averaging there are no corners at all">
                <p>The averaging window combines evidence from several gradient directions. At a single pixel there is only one gradient vector, so its outer-product matrix has at most one nonzero direction. A score requiring two nonzero directions would therefore reject every position. The window supplies the local evidence that makes a corner distinguishable from one edge.</p>
                <WhyACorner show="window" />
                <p>The second row detects the four intended corners. A one-pixel window detects none because it cannot collect the neighboring gradient variation used by this rule. Wider windows can merge responses from nearby structure, which is the different failure examined in Part 7.</p>
                <KeepInMind>

                  One gradient&rsquo;s outer product has at most one nonzero eigenvalue. Combining gradients from different directions can produce two. This is why this corner measure uses a neighborhood rather than a single gradient.</KeepInMind>
              </SubSection>

              <SubSection title="7. Two numbers settle a two by two symmetric matrix">
                <p>The matrix’s trace and determinant determine its two eigenvalues, although they do not determine its orientation. We can calculate the scores below from those two quantities without a separate numerical eigensolver at every pixel. Keep that distinction between the eigenvalues and the complete matrix.</p>
                <Equation>
                  {`trace        =  across energy + down energy

determinant  =  across energy × down energy − shared term × shared term

eigenvalues  =  ( trace ± √( trace² − 4 × determinant ) ) / 2`}
                </Equation>
                <p>The trace adds the two eigenvalues, so it measures total gradient energy without distinguishing its direction. The determinant multiplies them. It is zero if either direction has zero variation, but a large product alone does not guarantee that the two values are balanced. We will compare these quantities with a score based directly on the smaller eigenvalue.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Scoring A Corner",
          content: (
            <>
              <SubSection title="8. The energy cannot tell a corner from an edge">
                <p>The trace is a possible score because it measures total gradient energy. It is zero on the flat patch and large where brightness changes. On this square it reads 11.555556 at the corner and 10.666667 in the middle of the edge. Both positions therefore have strong responses, although only the corner is locally identifiable in two directions.</p>
                <NumberTable
                  headings={["position", "total energy", "share of the corner"]}
                  rows={[
                    ["a corner", "11.555556", "1.000000"],
                    ["the middle of an edge", "10.666667", "0.923077"],
                    ["flat ground", "0.000000", "0.000000"],
                  ]}
                  caption="Both the edge and corner have strong total gradient energy; their responses differ much less than either differs from flat ground."
                />
                <p>A threshold between 10.666667 and 11.555556 separates the corner from the edge on this clean square. The corner&rsquo;s energy is only a factor of 1.083333 higher, though. Gradient energy grows with squared contrast, so an edge with five percent more contrast already outscores this corner. A threshold that worked here may fail when different parts of an image have different contrasts.</p>
              </SubSection>

              <SubSection title="9. Along a straight edge the shape term is exactly zero">
                <p>
                  The corner&apos;s determinant is 30.222222, while the middle of the edge gives zero. In this ideal example, that zero comes from a rank-deficient matrix: the gradients provide variation in only one direction. It is not just a small nonzero determinant rounded for display.
                </p>
                <WhyThisWorks title="Why gradients along one direction give a zero determinant">
                  <>
<p>In the ideal straight-edge window shown here, all nonzero gradients are parallel. Their outer products are multiples of the same rank-one matrix, so averaging preserves rank one. One eigenvalue is therefore zero, which makes the determinant zero too. Noise, texture or another edge within the window can change this result.</p>
                  <p>Increasing the contrast scales the nonzero eigenvalue but leaves the zero eigenvalue unchanged. Widening the window also preserves rank one as long as it contains only that same ideal straight-edge pattern.</p>
</>
                </WhyThisWorks>
                <p>Flat ground also has determinant 0.0, because all three gradient averages are zero there. The ideal straight edge and flat region therefore receive the same determinant score for different reasons. The corner gives 30.222222, a positive value that separates it from both in this example; a ratio against zero would not be meaningful.</p>
              </SubSection>

              <SubSection title="10. The Smaller Eigenvalue as a Corner Score" id="10-the-ordering-everybody-quotes-does-not-exist">
                <p>The smaller eigenvalue measures variation along the direction with the least gradient energy. A strong response requires variation even in that weakest direction. On the clean square it is 4.0 at each corner and 0.0 along the edges and on the flat background.</p>
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
                <p>The ideal straight edge receives the same score as flat ground under the smaller-eigenvalue measure. It has strong change across the edge but no local evidence locating a point along it. A corner provides change in both directions. The score is measuring that locatability rather than total brightness change.</p>
                <KeepInMind>
                  The scores measure different properties. Total energy is high at both a corner and an edge. The smaller eigenvalue is zero at the ideal straight edge, while the Harris score is negative there. A large gradient alone is not enough evidence for a distinctive keypoint.</KeepInMind>
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
                <p>The Harris score is 24.880988 at the corner, 0.0 on flat ground and −4.551111 along the edge. At the ideal edge the determinant is zero while the squared-trace penalty is positive, so subtraction gives a negative response. The smaller-eigenvalue score also rejects that edge, but assigns it zero rather than a negative value.</p>
                <p>
                  Those three figures use a sensitivity of 0.04, and each is
                  one subtraction from numbers already worked above.
                </p>
                <Equation>{"corner  =  30.222222 − 0.04 × 11.555556²  ≈  30.222222 − 5.341235  ≈  24.880988\nedge    =  0 − 0.04 × 10.666667²          ≈  −4.551111\nground  =  0 − 0.04 × 0²                  =  0"}</Equation>
                <p>The sensitivity controls how strongly Harris penalizes an unbalanced pair of eigenvalues. Values from 0.04 to 0.06 are common starting choices; their suitability still depends on the images and detection threshold. There is also a mathematical upper limit: the determinant of a real symmetric two-by-two matrix is at most a quarter of its squared trace. At a sensitivity of 0.25 or above, no positive score is possible. Even 0.24 makes this square&rsquo;s corner response −1.825185, so the detector finds none.</p>
                <WhyThisWorks title="Deriving the Harris response from the two eigenvalues">
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
                  The smaller-eigenvalue score avoids Harris&rsquo;s extra sensitivity parameter, but both methods still need a window and detection threshold. Multiplying contrast scales the smaller eigenvalue quadratically and the Harris response to the fourth power. Neither score makes a fixed threshold automatically transferable between different lighting conditions.</KeepInMind>
              </SubSection>

              <SubSection title="12. One corner, one place">
                <p>The corner response spreads over nearby pixels. On the square, 32 pixels exceed a threshold of 0.5, so we need a way to select fewer locations. This implementation considers candidates from strongest to weakest and skips any that are too close to an already selected location. This is called non-maximum suppression. It enforces spacing between selected points; a skipped candidate does not itself suppress later ones.</p>
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

              <SubSection title="13. Excluding a corner must not promote its neighbor" id="13-excluding-a-corner-must-not-promote-its-neighbour">
                <p>A descriptor needs a complete patch around its position, so some candidates are too close to the frame to describe. This implementation performs greedy suppression before omitting selected points that lack a complete patch. Those omitted points still suppress their neighbors. Filtering candidates before suppression would therefore select a different set.</p>
                <SuppressionLadder show="border" />
                <>
<p>
                  Dropping a candidate first means the corner inside the border never gets to suppress anything, so the pixel on its shoulder survives and is reported in its place. On a square whose corners sit two pixels from the frame, at a border of three, that answers four places rather than one, three of them a single pixel off, scoring 3.5556 where the corners they stand beside score 4.0.
                </p>
                <p>The returned count and strengths can look plausible even when nearby shoulder pixels replace the intended maxima. Under our policy, a maximum can suppress its neighborhood before being omitted for lacking a complete descriptor patch. This preserves the meaning of the selected positions rather than treating every valid patch location as an equivalent replacement.</p>
</>
                <KeepInMind>

                  With this descending-score policy, applying the minimum score before suppression does not remove a weaker candidate that could have displaced a stronger one. Border filtering is different: excluding a strong candidate early can allow a nearby, weaker one to survive. The ordering of these steps is part of the detector&rsquo;s behavior.</KeepInMind>
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
              "Only 815 of them are distinct. The other 1,179 positions share a description with at least one other, and the largest group that agree exactly runs to 86 positions, which cannot say where they came from however carefully they are compared. The trouble is not mainly how many positions there are, it is that most of them are indistinguishable from their neighbors.",
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
              "An ideal straight edge changes strongly across its normal but not along its length. Its structure tensor therefore has one large eigenvalue and one zero eigenvalue. Flat ground has no change in either direction, giving two zeros. The smaller eigenvalue is zero in both cases because neither supports localization in every direction; the trace still distinguishes their total gradient energy.",
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
              "For this positive-semidefinite structure tensor, determinant cannot exceed one quarter of squared trace. Subtracting a sensitivity of at least one quarter times squared trace therefore leaves no positive response. Smaller sensitivities tune the preference between balanced directional variation and strong one-direction edges. Harris responses also change with intensity scale, so compare thresholds under a stated image and filter convention.",
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
              "If a true strong corner near the frame is removed before nonmaximum suppression, a weaker nearby pixel may survive in its place. In the supplied square, three reported positions shift by one pixel despite a plausible count. This implementation suppresses weaker local responses before applying the descriptor-border requirement, so it does not replace an unusable corner with a nearby weaker location.",
            ),
        ],
        },
        {
          title: "Part 4. Describing What Surrounds A Place",
          content: (
            <>
              <SubSection title="14. A position is not something to match on">
                <p>A keypoint’s coordinates identify where it is in one image. After the camera moves, those coordinates change. To establish a correspondence, compare the appearance around the point instead of expecting its original coordinates to match. That local appearance description is called a descriptor.</p>
                <p>The descriptor begins with the five-by-five brightness patch around the selected point, read as twenty-five values in pixel order. A uniform brightness offset changes all those values, even when the local structure is unchanged. Uniform contrast scaling changes their size as well. We need to specify which of those appearance changes the comparison should ignore.</p>
              </SubSection>

              <SubSection title="15. Take out the mean, divide out the length">
                <p>Subtracting the patch mean removes a uniform additive brightness offset. For a patch with nonzero variation, dividing the centered vector by its length also removes positive uniform contrast scaling. The resulting unit vectors can be compared by Euclidean distance, from zero for identical descriptors to two for opposite ones. This does not establish invariance to rotation, shadows or arbitrary lighting changes.</p>
                <Equation>
                  {`centered      =  patch − mean of patch

description  =  centered / length of centered

distance     =  length of ( one description − the other )`}
                </Equation>
                <DescriptorCard show="patch" />
                <WorkedExample>
                  <>
                    <p>

                      The patch contains nine bright pixels with value one and sixteen
                      background pixels with value zero. Find its mean, subtract it,
                      then compute the length of the centered vector.
                    </p>
                    <Equation>{"mean = 9 / 25 = 0.36\ncentred bright pixel = 1 − 0.36 = 0.64\ncentred background pixel = 0 − 0.36 = −0.36\nsquared length = 9 × 0.64² + 16 × (−0.36)² = 5.76\nlength = √5.76 = 2.4"}</Equation>
                    <p>

                      Divide every centered value by that length.
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
                  Adding ten to every pixel changes this corner descriptor by 1.2 × 10⁻¹⁵. Multiplying every pixel by three changes it by 2.0 × 10⁻¹⁶. The algebra predicts invariance for these transformations, while floating-point subtraction and division leave tiny residual differences. Compare within a numerical tolerance rather than requiring bit-for-bit equality.
                </p>
                <p>
                  On a scale whose maximum is 2, moving by 10⁻¹⁵ is nothing, but it is rounding rather than identity and the difference is worth stating.
                </p>
</>
                <DescriptorCard show="distances" />
                <>
<p>

                  The other rows of that drawing are the ones that give the scale its meaning. Two different corners of the same square sit 1.443376 apart. A corner against its own picture with the brightness reversed sits at 2.0, the furthest two descriptions can be. And two patches of flat ground, one outside the square and one inside it, sit at exactly 0.0 from each other, because neither has any variation to normalize and both come back as twenty-five zeros.
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
                  A flat patch becomes a zero vector after mean subtraction, so it cannot be divided by a nonzero length. This SDK returns a zero descriptor by convention. All such flat patches then have distance zero from one another, regardless of their original brightness. The caller should not treat that agreement as evidence of a distinctive match.</KeepInMind>
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
<p>A quarter turn maps pixels directly onto the grid without interpolation. All 47 selected locations move to the expected coordinates and retain their strengths in this experiment. Rotating by a right angle preserves the square window and exchanges the gradient axes, leaving the trace and determinant unchanged.</p>
                <p>
                  The descriptions do not survive it at all. On the square, all four corners end up 1.443376 from their own turned selves, which is precisely the distance between that square&rsquo;s top-left corner and its top-right one. On the workbench scene, where the brightness ramp makes no two corners quite alike, the corresponding pairs come out between 0.052724 and 1.545328 apart, and not one of them at zero.
                </p>
</>
                <KeepInMind>

                  The selected positions survive this quarter turn, but their frame-aligned descriptors change. A nearest-descriptor search may then favor a different corner. Estimating a local orientation is one way to make the descriptions more comparable; ambiguous proposals still need rejection checks.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Matching Two Lists",
          content: (
            <>
              <SubSection title="18. The nearest description, and why its distance says nothing">
                <p>For each descriptor in one image, search the other image’s descriptors for the nearest. If that second list is nonempty, it has a nearest entry even when no true correspondence exists. We need a way to reject ambiguous or unconvincing proposals before treating them as matches.</p>
                <p>An absolute distance cutoff needs to be chosen for the descriptor and image conditions. Noise, patch content and the amount of appearance change affect what distances are plausible. A cutoff alone also misses a different question: are several candidates almost equally close?</p>
              </SubSection>

              <SubSection title="19. Ask instead whether the nearest is much nearer">
                <p>Lowe’s ratio test compares the nearest descriptor distance with the second-nearest. A small ratio indicates that the preferred candidate is substantially closer than its competitor. A ratio near one indicates ambiguity. This is a test of distinctiveness among the available candidates, not proof that the selected point is correct.</p>
                <Equation>
                  {`ratio  =  distance to the nearest / distance to the second nearest`}
                </Equation>
                <MatchBoard />
                <>
<p>
                  Three arrangements, on the three buttons above. One square photographed twice, moved down four rows and right five columns, gives four matches, each at a distance of exactly 0.0 against a runner-up at 1.443376, so each ratio is 0.0 and each winner is the corner that moved by the known shift. The same square searched for in a picture holding two identical copies of it gives four matches at a distance of 0.0 against a runner-up also at 0.0, which is a ratio of 1.0 and is refused.
                </p>
                <p>A faint ripple breaks the exact descriptor tie in the second picture. The first ratio is 0.980729, still above the acceptance threshold, so the matcher rejects it. This time the ratio is calculated from two nonzero distances rather than assigned by the zero-distance convention.</p>
</>
                <KeepInMind>
                  Rejecting these four matches is useful: the local descriptions cannot distinguish the two identical squares. Additional context might resolve the correspondence, but this ratio test does not have that information. Selecting one copy would conceal the ambiguity.</KeepInMind>
              </SubSection>

              <SubSection title="20. Two equally good answers, and a zero over a zero">
                <p>For the identical squares, both nearest distances are zero. Their ratio is undefined. This SDK assigns a ratio of one to that case so the usual threshold rejects it as ambiguous. The value is a convention chosen to express the tie, not the result of dividing zero by zero.</p>
                <p>Assigning zero instead would make a perfect tie look maximally distinctive under this test. Repeated patterns occur in brick walls and window grids, so the convention matters beyond our drawn squares. Another implementation could reject ties directly instead of assigning a numeric ratio.</p>
              </SubSection>

              <SubSection title="21. The whole method on the shared scene, and six matches it should have refused">
                <p>Now match the workbench scene to a version with a uniform brightness and contrast change, without moving any objects. This removes geometric changes from the test. The detector finds 47 locations in each image. Of the 47 proposed correspondences, the ratio test keeps 32 and rejects 15; all 15 rejections are on the repeated crosses.</p>
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
                  When two distances are both close to floating-point precision, their ratio can be unstable even though their absolute difference is tiny. Exact tie handling alone does not catch these near-ties. An absolute tolerance, mutual-match checks or a later geometric consistency test can provide additional rejection criteria.</KeepInMind>
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
              "For a nonconstant patch, subtracting its mean cancels a common additive offset. Dividing by the centered vector's length cancels a positive contrast multiplier. The resulting signed unit vectors have Euclidean distance zero when identical and two when exact negatives. Physical lighting changes may be more complicated than this uniform affine-intensity model.",
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
                "Neither has any variation to normalize, so both come back as twenty-five zeros and every such answer matches every other equally well",
                "They happen to share a mean brightness",
                "The distance is clipped below at zero",
                "Flat patches are left out of the descriptor stage",
              ],
              0,
              "A constant patch has a zero centered vector, whose unit-length normalization is undefined. This implementation returns a zero descriptor by convention. Different flat intensities can therefore receive identical descriptors and provide no distinctive local pattern. Selecting corners helps find patches with variation in more than one direction.",
            ),
            trueFalse(
              "After a quarter turn the description recognizes a corner as a different corner rather than failing to match it.",
              true,
              "The patch descriptor uses fixed image axes. After a quarter turn, one square corner's arrangement can resemble a different original corner, creating a wrong correspondence rather than simply a large distance. The ideal square's corner strengths survive this ninety-degree grid rotation, but that does not make the descriptors rotation invariant or guarantee repeatability under arbitrary sampled rotations.",
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
              "Those six wrong correspondences have very small best and runner-up distances dominated by rounding. Their ratios still fall below the acceptance threshold, so the ratio alone fails to mark them as ambiguous. An explicit tolerance or duplicate-pattern policy can address near-equal numerical distances. This experiment shows a limitation of the current exact-distance convention, not that ambiguity below rounding can never be detected.",
            ),
        ],
        },
        {
          title: "Part 6. What It Costs, And Where It Is Worse",
          content: (
            <>
              <SubSection title="22. What the method costs">
                <p>
                  Keeping 47 keypoints saves work in the later description and matching stages. Detecting them still requires a score at all 2,304 pixels, including the gradient passes and averaged products. We should include that full-image work when measuring the total cost.
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
                <p>Each descriptor has twenty-five entries, so selecting fewer points reduces storage. Our brute-force matcher compares every descriptor in one list with every descriptor in the other, which makes its pair count grow with the product of the list lengths. The displayed times were measured on the API server. Their scopes also differ: the dense timer covers pair distances, while the sparse timer includes descriptor construction and matching. Treat the counts as the clearer comparison here, not the timings as a controlled benchmark.</p>
                <InAModel>
                  For brute-force dense matching, increasing both image dimensions by four gives roughly sixteen times as many valid patch positions and 256 times as many descriptor pairs. A keypoint method can reduce that cost, but its selected count is not resolution invariant. Window size, thresholds, separation and the newly visible image detail all affect how many points it finds.</InAModel>
              </SubSection>

              <SubSection title="23. Where looking at everything wins">
                <p>Consider the drawn horizon below, shifted down by three rows. Each image contains a perfectly straight brightness boundary with no corners. The smaller-eigenvalue response is zero everywhere, so this detector returns no keypoints. It cannot use the edge&rsquo;s position to recover even the vertical part of the movement.</p>
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
                  A corner-based method can miss useful evidence when an image contains only straight edges or flat regions. Dense comparisons can still recover motion across an edge, although movement along a uniform edge remains ambiguous. Choose the representation for the information the task needs.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. When Corners and Patches Stop Being Distinctive" , id: "part-7-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="24. Six choices the method does not make for you">
                <p>The detector and matcher require several choices: averaging-window size, minimum score, separation between selected points, border exclusion, patch size and the maximum accepted distance ratio. They control different stages. Some affect what the detector treats as a corner; others affect whether a descriptor fits or a proposed match is distinctive. Choose them for the image scale and validate them against known correspondences.</p>
                <p>Widening the averaging window changes the evidence contributing to each score. On this square, increasing its side from three to nine lowers the top-left corner&rsquo;s score from 4.0 to 1.62963 and increases the selected count from 4 to 25. The larger window combines gradients from nearby corners and spreads their response. With the other settings fixed, it no longer localizes just the four intended corners.</p>
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
                  caption="With the other settings fixed, a three-by-three window selects the four intended corners of this square."
                />
                <KeepInMind>
                  Report the detector settings alongside a keypoint count. Here, changing only the averaging window changes the returned count from 0 to 4, 12, 16 or 25. Those counts describe this detector configuration, not an independent count of objects or geometric corners in the image.</KeepInMind>
              </SubSection>

              <SubSection title="25. What a description of this kind never claims">
                <p>Detecting a repeatable position does not guarantee a stable or unique descriptor. The following cases separate changes of orientation and scale from repeated structure and brightness boundaries. Each can undermine a match for a different reason.</p>
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

              <SubSection title="26. Flat patches, straight edges and missing corner evidence" id="26-where-it-stops-being-defined">
                <p>The table distinguishes inputs that make a required quantity undefined from cases handled by an explicit convention. A missing descriptor norm or an ambiguous distance ratio needs a stated response, so the caller can distinguish a fallback from measured evidence.</p>
                <DerivationTable
                  expressionHeading="Window or local image pattern"
                  reasonHeading="Effect on detecting and describing a point"
                  rows={[
                    {
                      expression: "a window of a single pixel",
                      reason: "The outer product of a single gradient has rank at most one. Its smaller eigenvalue is zero, so this score detects no corners with a one-pixel window, even when the image contains geometric corners.",
                    },
                    {
                      expression: "a window with an even side",
                      reason: "An even-sized window needs an explicit alignment convention because it has no central pixel. This SDK requires an odd side for both averaging windows and descriptor patches; other implementations can define an offset or interpolate.",
                    },
                    {
                      expression: "a window straddling a perfectly straight edge",
                      reason: "For an ideal straight edge with parallel nonzero gradients throughout the window, the matrix has rank one. Its smaller eigenvalue and determinant are zero. Texture, noise or another structure within the window can change that response.",
                    },
                    {
                      expression: "a Harris sensitivity of a quarter or more",
                      reason: "For this symmetric two-by-two matrix, the determinant is at most a quarter of the squared trace. A sensitivity of 0.25 or more therefore prevents a positive Harris score. On this square, even 0.24 gives a corner response of −1.825185 and detects no points.",
                    },
                    {
                      expression: "a patch with no variation in it",
                      reason: "Mean subtraction gives a zero vector, so unit-length normalization is undefined. This SDK returns twenty-five zeros. All flat patches then have the same descriptor, which provides no evidence for choosing between them.",
                    },
                    {
                      expression: "a place within half a patch of the frame",
                      reason: "A complete descriptor patch does not fit at this position. The SDK omits it rather than padding it. Padding is another possible policy, but the invented boundary values can affect the resulting comparison.",
                    },
                    {
                      expression: "a set of one description to search in",
                      reason: "A single candidate has no second-nearest distance, so the ratio test cannot be evaluated. The caller needs to reject it or specify a separate acceptance rule.",
                    },
                    {
                      expression: "two candidates at exactly the same distance",
                      reason: "If both distances are positive and equal, their ratio is one. If both are zero, division is undefined; this SDK assigns one so the ordinary threshold rejects the tie.",
                    },
                    {
                      expression: "two candidates differing only by rounding",
                      reason: "When both distances are near numerical precision, rounding can dominate their ratio. On the relit shared scene, six of the thirty-two accepted matches are incorrect near-ties, with ratios from 0.5726 to 0.7219.",
                    },
                    {
                      expression: "two places with identical scores",
                      reason: "Equal scores need a deterministic ordering if they compete during suppression. This SDK breaks ties by row and then column. Other documented orderings are possible.",
                    },
                    {
                      expression: "a peak that does not sit on a pixel",
                      reason: "The detector reports whole-pixel positions. The underlying feature need not lie on that grid, and this does not by itself establish a universal localization-error bound. A local curve fit can estimate a subpixel position under additional assumptions.",
                    },
                    {
                      expression: "a picture with no corner in it",
                      reason: "If no response exceeds the threshold after suppression and border checks, the detector returns an empty list. An ideal horizon can still contain useful edge-position information that this corner representation discards.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two limitations matter when interpreting the matches. An ideal straight edge provides local evidence across the edge but not along it. Repeated patterns can also produce several nearly identical descriptors, making ratios of tiny distances unreliable. A later check should test whether proposed correspondences agree on a plausible image transformation.</KeepInMind>
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
              "The ratio requires a nearest and a second-nearest candidate. With only one target descriptor, that ratio is undefined and this API raises an error. Another matching procedure could use an absolute-distance criterion, but it would be answering a different question. Two equally good candidates use the stated ratio-one convention, which is a separate case.",
            ),
        ],
        },
        {
          title: "Practice. Scoring, Describing And Matching The Square",
          practice: [
            exercise("Score the square’s corner, edge and ground",["Use the supplied bright square to inspect three positions: its top-left corner, the middle of its left edge and flat background. Print the structure tensor's trace and determinant, the smaller-eigenvalue score, and the Harris score at each.", "Calculate Harris responses at sensitivities 0.04 and 0.06. Print all values to six decimal places, then the corner's 0.06 response to four places. Compare changing sensitivity with changing the scoring rule."],`import numpy as np
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

# Print the corner's Harris score at 0.06 on a line of its own, to four places.`,`import numpy as np
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

print(f"corner, Harris at 0.06: {strict.at(6, 6):.4f}")`,`corner
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
corner, Harris at 0.06: 22.2104`,{...{ hints: ["CornerResponse.of takes the picture and, optionally, a measure. With no measure it scores by the smaller eigenvalue. HarrisMeasure takes its sensitivity as a keyword.", "The tensor’s trace and determinant are each a picture of their own, one number per pixel, so their values are indexed by row and column like any array.", "A response answers one position through at(row, column), which is less to hold than its whole table of scores."], check: numberCheck("What does the corner score under Harris at a sensitivity of 0.06, to four places?", 22.2104, 0.0005, "Increasing Harris sensitivity increases the penalty applied to total local gradient energy. The corner score changes, while the smaller-eigenvalue criterion has no such sensitivity parameter.") },question:"How do a corner, an edge and a flat patch differ under corner scores?"}),
            exercise("Describe one corner and measure how far it is from the others",["Describe the square’s top-left corner by its five-wide patch, print the twenty-five numbers as five rows, and then print how far that description is from the top-right corner’s, from the bottom-right corner’s, from the same corner with every pixel raised by ten, and from the same corner with the brightness reversed.", "Compare the neighboring and diagonally opposite corners before running the distance calculation. Predict which patch entries differ. Adding an offset should disappear under centering; reversing contrast negates the normalized deviation pattern."],`import numpy as np
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

# Print the distance to the bottom-right corner on a line of its own, to four places.`,`import numpy as np
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

print(f"opposite corner: {top_left.distance_to(bottom_right):.4f}")`,`-0.150000  -0.150000  -0.150000  -0.150000  -0.150000
-0.150000  -0.150000  -0.150000  -0.150000  -0.150000
-0.150000  -0.150000   0.266667   0.266667   0.266667
-0.150000  -0.150000   0.266667   0.266667   0.266667
-0.150000  -0.150000   0.266667   0.266667   0.266667
to the top-right corner 1.443376
to the bottom-right corner 1.666667
to itself, ten brighter 1.2e-15
to itself, reversed 2.000000
opposite corner: 1.6667`,{...{ hints: ["A Keypoint is a row, a column and a strength. The strength plays no part in the description, so any finite number will do for a place you chose by hand.", "A description’s values are one flat run of twenty-five numbers read row by row, so reshape(5, 5) puts them back in the patch’s own arrangement.", "distance_to compares two descriptor vectors. The opposite corner places its bright three-by-three region in the opposite quadrant: the two bright regions share the center pixel, while some dark entries also agree. Count all differing positions when predicting the distance."], check: numberCheck("How far is the top-left corner’s description from the bottom-right corner’s, to four places?", 1.6667, 0.0005, "Opposite corners disagree over more positions in their normalized patches than adjacent corners do. Adding a uniform brightness offset disappears during centering, while reversing contrast changes the descriptor direction.") },question:"Which image changes alter the corner's patch descriptor?"}),
            exercise("Match a moved square, then a square against its twin",["Photograph one square twice, the second time moved down four rows and right five columns, as Part 5 does. The starter finds and describes the corners of every picture. Match the first picture’s descriptions against the moved one’s and print where each match went, its distance, its runner-up’s distance and its ratio. Then match a single seven-wide square against a picture holding two identical copies of it, once with the ratio test turned off so that every match is reported, and once with it on.", "For the moved square, inspect the best and runner-up descriptor distances. For the duplicate squares, compare maximum_ratio=1.0 with the default threshold. Equal best alternatives should be treated as ambiguity rather than evidence of a unique correspondence."],`import numpy as np
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
# how many matches each of the two kept.`,`import numpy as np
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
print(f"kept by the test {len(described['one'].matched_to(described['twins']))}")`,`(6, 6) to (10, 11)
  distance 0.0000, runner-up 1.4434, ratio 0.0000
(6, 14) to (10, 19)
  distance 0.0000, runner-up 1.4434, ratio 0.0000
(14, 6) to (18, 11)
  distance 0.0000, runner-up 1.4434, ratio 0.0000
(14, 14) to (18, 19)
  distance 0.0000, runner-up 1.4434, ratio 0.0000
ratios on the twins [1.0, 1.0, 1.0, 1.0]
reported with the test off 4
kept by the test 0`,{...{ hints: ["matched_to is called on one set of descriptions with the other as its argument, and what it answers can be looped over. Each match carries first, second, distance, runner_up_distance and ratio.", "A match’s first and second are descriptions, and a description knows the keypoint it was cut around, which is where the row and column are.", "maximum_ratio is the largest ratio still counted as a match. At one, everything is kept, which is the only way to see a ratio the test would otherwise have refused."], check: numberCheck("On the moved square, how far away is each match’s runner-up, to four places?", 1.4434, 0.0005, "The unique moved counterpart is clearly closer than the runner-up. Identical copies create equally good alternatives, so the ratio test rejects their ambiguity under this implementation's stated equal-distance convention.") },question:"Can the ratio test distinguish a unique moved match from identical alternatives?"}),
            exercise("Search a set that holds one description",["Part 7 lists a set of one description as a case where the ratio test cannot be asked. Describe the square’s corners, keep only the strongest one as the set to search in, and try to match all four corners against it. Catch what the library raises and print its name and its message.", "A nearest-descriptor search can still return its only candidate, but this API's ratio test needs a runner-up. Distinguish finding a nearest candidate from measuring how distinctive it is."],`import numpy as np
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
# the library's refusal.`,`import numpy as np
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
    print(refusal)`,`asking with 4, searching in 1
TooFewValuesError
the ratio test needs a runner-up to compare against, so it needs at least two descriptors to search in; got 1`,{...{ hints: ["peaks takes a limit, the most places it will hand back, and it hands them back strongest first."] },question:"Why does a ratio test need at least two candidate descriptors?"}),
          ],
        },
      ]}
    />
  );
}
