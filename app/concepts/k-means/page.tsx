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
import { CentreChoice } from "@/components/widgets/CentreChoice";
import { ElbowChart } from "@/components/widgets/ElbowChart";
import { InertiaChart } from "@/components/widgets/InertiaChart";
import { KMeansPlayground } from "@/components/widgets/KMeansPlayground";
import { LloydStepper } from "@/components/widgets/LloydStepper";
import { SeedGallery } from "@/components/widgets/SeedGallery";
import { ShapeGallery } from "@/components/widgets/ShapeGallery";
import { UnitSensitivity } from "@/components/widgets/UnitSensitivity";

export const metadata: Metadata = pageMetadata("/concepts/k-means", {
  title: "k-Means Clustering · Perceptron Lab",
  description:
    "Clustering groups observations without requiring category labels. K-means alternates between assigning points to nearby centers and moving each center to the mean of its assigned points.",
});

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KMeansPage() {
  return (
    <ConceptPage
      lessonId="k-means"
      intuition={lessonIntuitions["k-means"]}
      technicalStart="Part 2. The Two Steps and the Number They Lower"
      openingTitle="Find the Groups Before Anyone Names Them"
      playgroundTitle="Watch observations choose their nearest center"
      playgroundIntro="Step through assignment and center updates separately. Compare the final groups after changing the starting centers or the requested number of groups."
      title="k-Means Clustering"
      tagline={"Clustering groups observations without requiring category labels. K-means alternates between assigning points to nearby centers and moving each center to the mean of its assigned points."}
      prerequisites={
        <>
          Distance between two people comes from the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>{" "}
          and the mean from the{" "}
          <Link href="/primers/statistics" className={link}>
            statistics primer
          </Link>
          , and those two ideas are the entire method. The{" "}
          <Link href="/primers/calculus" className={link}>
            calculus primer
          </Link>

          &rsquo;s two-valley curve is worth having seen, since Part 3 is that
          lesson again with centers in place of a ball on a hill.
        </>
      }

      playground={<KMeansPlayground />}
      sections={[
        {
          title: "Part 1. Groups Without Labels",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Eight people and no answers">
                <>
<p>

                  In our earlier classification examples, the children and adults were labeled before we trained a model. Here we give the method measurements without those labels. We ask it to form a chosen number of groups, and the colors in the plot show the groups it found.
                </p>
                <p>

                  The eight people it opens on are two tight clumps, four short and light around 121 centimeters and 26 kilograms, four tall and heavy around 181 and 80, and with k set to 2 the method finds exactly those two clumps.
                </p>
</>
                <>
<p>Load the less tidy crowd: the same eleven people used in classification, with their labels removed. The method still assigns them to the requested centers even if the measurements do not contain clearly separated natural groups.</p>
              <p>That is a consequence of the task we gave it. K-means seeks a low-distance partition for a chosen number of centers; it does not first prove that this many meaningful types exist. Distinct data, initialization and empty-group handling also affect which fitted groups are returned. Part 4 examines how to judge a partition instead of trusting its colors.</p>
                <p>

                  Drag a dot from one clump toward the other and watch the colors and the X marks renegotiate; the groups are not stored anywhere, they are re-derived from the geometry every time anything moves.
                </p>
</>
                <KeepInMind>
                  Nothing on this page has a label. A grouping is a claim the
                  method makes about the geometry of the people, and the only
                  thing it was told is how many groups to claim.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a group is here">
                <p>Each group has a representative point called its center. Assign an observation to the nearest center, using the same rule for every observation. The shaded regions show which center would receive a person at each position. With two centers, the boundary is the straight line where the two distances are equal.</p>
                <Equation>{"person belongs to group j   if   ‖person − centre_j‖ ≤ ‖person − centre_i‖ for every other i"}</Equation>
                <WhyThisWorks title="Why the boundary between two centers is a straight line">
                  <p>

                    Being equidistant from two points a and b means the two
                    squared distances agree, and expanding both squares
                    cancels the squared length of the person, leaving a
                    condition that is linear in the person&rsquo;s
                    coordinates. On the eight people the resting centers are
                    (121, 26) and (181, 80), so the boundary is the line
                    through their midpoint (151, 53) perpendicular to the
                    segment joining them, and (151, 53) is also the mean of all
                    eight, since the two groups are the same size.
                  </p>
                  <Equation>{"‖x − a‖² = ‖x − b‖²   ⇔   2 x · (b − a) = ‖b‖² − ‖a‖²"}</Equation>
                </WhyThisWorks>
                <p>An observation can be equally close to two centers. The implementation resolves that tie by choosing the lower group ID. In the displayed test, the observation at (151, 53) goes to group 0. Either assignment has the same distance cost, but a documented tie rule makes repeated predictions consistent.</p>
                <KeepInMind>

                  Groups are regions of nearest center, so every group this
                  method can find is bounded by straight lines and has no
                  dents. Part 5 is about the data that is not shaped like that.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. A center is the mean of its group" id="3-a-centre-is-the-mean-of-its-group">
                <p>

                  The other half of the definition is where a center sits.
                  When the loop has come to rest, every center is the plain
                  mean of the people assigned to it, the statistics
                  primer&rsquo;s balance point, and on the eight people that is
                  arithmetic you can check against the X marks.
                </p>
                <WorkedExample title="The two resting centers">
                  <Equation>{"heights  118 + 120 + 122 + 124 = 484,   484 / 4 = 121\nweights   24 +  25 +  28 +  27 = 104,   104 / 4 =  26"}</Equation>
                  <p>

                    So one center rests at (121, 26), and the same sums on the
                    tall four put the other at (181, 80). The playground
                    reports both to the decimal, and the group sizes 4 and 4.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A resting grouping is nothing more mysterious than groups
                  sitting on their own means, with each person nearer their
                  own group&rsquo;s mean than any other. Both halves have to
                  hold at once, and the loop in Part 2 is how they come to.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Two Steps and the Number They Lower",
          content: (
            <>
              <SubSection title="4. Inertia, the total the method watches">
                <p>

                  Before the loop, the number it is trying to make small.
                  Take every person, measure the distance to their own
                  group&rsquo;s center, square it, and add up over everyone.
                  The total is called the inertia, and the name is
                  Steinhaus&rsquo;s, since for equal masses it is the sum of
                  the parts&rsquo; moments of inertia about their own centers.
                </p>
                <Equation>{"inertia = Σᵢ ‖personᵢ − center of their group‖²"}</Equation>
                <WorkedExample title="Inertia of the eight at rest">
                  <p>
                    Within the short clump the height deviations from 121 are
                    −3, −1, 1 and 3, whose squares sum to 20, and the weight
                    deviations from 26 are −2, −1, 2 and 1, squares summing to
                    10. The tall clump gives 20 again for heights and 14 for
                    weights.
                  </p>
                  <Equation>{"inertia = 20 + 10 + 20 + 14 = 64"}</Equation>
                  <p>

                    The playground reads 64.0 exactly. Set k to 1 and the one
                    center has to serve both clumps from the grand mean
                    (151, 53), and the inertia is 13096.0, which is the total
                    squared deviation of the eight about their mean, the
                    statistics primer&rsquo;s spread with no divisor.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Inertia is measured in squared units of the features, so a
                  value on its own means little. What carries information is
                  how it compares between two groupings of the same people at
                  the same k.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The assignment step can only lower it">
                <p>First hold the centers fixed and assign every person to the nearest one. Moving a person to a nearer center reduces that person’s squared-distance contribution without changing anyone else’s. If the person is already assigned to a nearest center, the contribution stays the same. This assignment step therefore cannot increase the total.</p>
                <InAModel title="On the crowd, seed 3, pass 1">
                  <p>

                    After the first update the centers sit at (180.3, 80.3)
                    and (141.1, 43.3) and the inertia under the old assignment
                    is 4127.7. Reassigning moves one person, the one at
                    (162, 61), across to the taller center, and the inertia
                    falls to 4086.8. Section 8 steps through the whole walk.
                  </p>
                </InAModel>
                <KeepInMind>
                  Assignment lowers the inertia one term at a time, and when
                  no person can do better by switching, it leaves the total
                  exactly where it was.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The update step can only lower it">
                <p>

                  Now keep the group memberships fixed and move each center. Where should it go? We want the location with the smallest total squared distance to its members. We can answer one coordinate at a time. The calculation below shows why the group&apos;s mean minimizes that total.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="why"
                  rows={[
                    { expression: "T(c) = Σᵢ (xᵢ − c)²", reason: "the group's share of the inertia, as a function of where its center is" },
                    { expression: "dT/dc = −2 Σᵢ (xᵢ − c) = 0", reason: "a smooth bowl, so its minimum is where the derivative vanishes" },
                    { expression: "Σᵢ xᵢ − n c = 0", reason: "the deviations from c must cancel exactly, the statistics primer's balance point" },
                    { expression: "c = (Σᵢ xᵢ) / n", reason: "the mean, and the only number the deviations cancel around" },
                  ]}
                />
                <p>For fixed memberships, the mean gives the center with the smallest total squared distance. The update moves directly there, so this step cannot increase the total either. The widget compares the mean and coordinate median under different distance objectives. Adding a stray observation makes the difference between them easier to see.</p>
                <CentreChoice />
                <InAModel title="The tall four and the stray, five people">
                  <p>
                    The mean is (184.0, 66.8) and the median (182.0, 79.0).
                    The total squared distance is 3698.8 at the mean against
                    4463.0 at the median, so the mean wins the total the
                    method tracks. Under Manhattan distance the order reverses,
                    129.6 at the mean against 93.0 at the median, and section
                    21 is what that reversal costs.
                  </p>
                </InAModel>
                <KeepInMind>

                  For fixed group assignments, the mean minimizes the sum of squared Euclidean distances. That is why this update cannot increase the objective. Changing the distance rule may require a different center update, which we examine in Part 5.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Why the loop must settle">
                <p>Assignment and updating each reduce the inertia or keep it unchanged. There are finitely many assignments of eleven people to two groups, and deterministic tie rules let the procedure settle on a stable assignment. The staircase records the total after each half of a pass. This explains why the loop can stop without establishing that its final assignment is the best possible one.</p>
                <InertiaChart />
                <p>

                  Both kinds of step take a share of the fall. From the seeded
                  start at 8197.0, the first update takes the total to 4127.7
                  and the first assignment to 4086.8, the second pair to
                  3802.0 and 3724.6, the third to 3483.3 and 3425.6, and the
                  fourth update lands on 3185.9, where the assignment changes
                  nobody. The fifth pass moves no center at all, and the fit
                  reports itself settled after five passes, which is the
                  number the playground calls passes to rest.
                </p>
                <KeepInMind>
                  The alternating steps reach a stable result under the usual exact-arithmetic conditions, but a practical run also has an iteration limit and a movement tolerance. Neither convergence nor a small movement establishes the global minimum. Here this start settles at 3185.9, while the best of ten starts gives 2952.6.</KeepInMind>
              </SubSection>

              <SubSection title="8. Following one start pass by pass">
                <>
<p>

                  The stepper below is the same walk as the staircase, drawn on the plane, with the two halves of each pass taken one at a time. On seed 3 the two starting centers are two of the people, (180, 80) and (159, 57), and the first assignment hands eight people to the second of them and three to the first.
                </p>
                <p>

                  Each update drags a center toward the mean of a group that is still changing, each assignment then moves one more person across, and the two alternate until an update moves no center and an assignment moves no person.
                </p>
</>
                <LloydStepper />
                <p>

                  Switch to the two small clumps and the walk is over almost
                  before it starts. Seed 3 places the centers on (182, 83) and
                  (118, 24), one in each clump, the first assignment is
                  already the right one, and a single update puts the centers
                  on the two means with the inertia at 64.0. The second pass
                  moves nothing, so the fit reports two passes, one of them
                  spent confirming that the first was enough.
                </p>
                <KeepInMind>

                  A pass is an update followed by an assignment, and the walk
                  stops when an update moves no center further than a small
                  tolerance. The pass that confirms the stop still counts, so
                  a fit that was right after one update reports two passes.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "A resting grouping is groups sitting on their own means, with each person nearer their own group’s mean than any other.",
              true,
              "A converged Lloyd-style grouping meets both conditions: each nonempty cluster center is its coordinate mean, and each observation is assigned to a nearest center under the stated tie rule. For the shorter four people:\n\n```math\nmean height = 484 / 4 = 121\nmean weight = 104 / 4 = 26\n```\n\nTheir assignments are consistent with the two centers, and the total inertia is 64.0. A tolerance-limited numerical fit approximates these conditions.",
            ),
            choice(
              "On the eight people the resting centers are (121, 26) and (181, 80). Where does the boundary between the two groups run?",
              [
                "Through their midpoint (151, 53), perpendicular to the segment joining them",
                "Through their midpoint, along the segment joining them",
                "Through (121, 26), perpendicular to the segment joining them",
                "Wherever the fit drew it, since the boundary is stored with the groups",
              ],
              0,
              "The boundary consists of coordinates equally distant from the two centers. Equating and expanding the squared distances leaves a linear equation, giving the perpendicular bisector between them. Predictions are obtained by comparing distances, so no boundary line needs to be stored separately. The midpoint is also the overall mean here because both groups contain four people.",
            ),
            choice(
              "Why is moving a center to the mean of its members the exact minimizer rather than merely a reasonable move?",
              [
                "The mean minimizes total squared Euclidean distance, so the center jumps straight to the best place for the current assignment",
                "Averaging is the only arithmetic a center can be moved by",
                "Assignment has already lowered the inertia, so the update cannot raise it",
                "The mean is the best place to put a center under any distance",
              ],
              0,
              "On the tall clump with the stray person the total squared distance is 3698.8 at the mean against 4463.0 at the coordinate median, so the mean wins the total the method tracks. Under Manhattan distance the order reverses, 129.6 against 93.0, and that reversal is what Part 5 collects on.",
            ),
            trueFalse(
              "A fit whose first update already lands on the right centers reports one pass.",
              false,
              "A pass is an update followed by an assignment, and the walk stops when an update moves no center further than a small tolerance, so the pass that confirms the stop still counts. On the two small clumps at seed 3 the first assignment is already right and the fit reports two passes, one of them spent confirming that the first was enough.",
            ),
            several(
              "Which of these are what the argument that the loop stops actually rests on?",
              [
                "Assignment lowers the inertia or holds it",
                "The update lowers the inertia or holds it",
                "There are finitely many ways to assign the people to the groups",
                "A total that never rises cannot come back to a state it has left with a lower total",
              ],
              [0, 1, 2, 3],
              "Both assignment and center updates cannot increase the objective. With finitely many assignments and a consistent tie and stopping rule, the procedure can terminate at a stable assignment; strict decreases cannot return to an earlier higher-cost state. Nonincrease alone would not rule out cycling among equal-cost states without a tie policy. None of this guarantees the globally smallest inertia, so multiple starts can still reach different solutions.",
            ),
        ],
        },
        {
          title: "Part 3. Where the Loop Settles",
          content: (
            <>
              <SubSection title="9. A rest is a local minimum, and the start decides which">
                <>
<p>
                  The staircase stopped at 3185.9 and the dashed line sat at 2952.6, so the loop rested somewhere that was not the lowest place available. This is the calculus primer&rsquo;s two-valley curve with a different ball. Each step lowers the total, so the walk only ever goes downhill, and downhill from where it started is not the same as the deepest valley there is.
                </p>
                <p>

                  Change the seed on the stepper to 1 and the start is (120, 25) and (178, 78), one center in each clump; the first assignment is already the winning grouping, and one update reaches 2952.6.
                </p>
</>
                <NumberTable
                  headings={["the crowd, k = 2", "seed 3", "seed 1"]}
                  rows={[
                    ["starting centers", "(180, 80) and (159, 57)", "(120, 25) and (178, 78)"],
                    ["inertia at the start", "8197.0", "5047.0"],
                    ["passes to rest", "5", "2"],
                    ["resting inertia", "3185.9", "2952.6"],
                    ["group sizes at rest", "6 and 5", "4 and 7"],
                  ]}
                  caption="Two starts on the same eleven people. Both walks only ever went downhill, and they finished in different places."
                />
                <KeepInMind>
                  The loop finds a local minimum of the inertia. Two runs on
                  identical data from different starts can rest in genuinely
                  different groupings, and neither is a bug.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Restarts, and the best of ten">
                <p>Try several starting configurations, complete the loop for each, and keep the result with the lowest inertia. Repeated starts increase our chance of finding a better solution without proving that we found the global minimum. The gallery compares ten seeds.</p>
                <SeedGallery />
                <>
<p>
                  On the crowd at two groups the ten starts find three different valleys. Five of them rest at 2952.6, which pairs the three short people with the person at (147, 41) against the other seven; three rest at 3185.9, with one more of the middle people, at (145, 57), pulled into the short group; and two rest at 3141.7, the three short people alone against everyone else.
                </p>
                <p>
                  The fit the playground shows is the usual ten starts from one seed, and it keeps the lowest by a strict comparison, so a later start that only ties an earlier one does not replace it. At three groups the same ten starts all rest at 501.6 with sizes 3, 5 and 3, which is the three clumps the eye sees, and the only thing that differs between the panels is which clump got which number.
                </p>
</>
                <KeepInMind>
                  Restarts cost k times the seeding and a few passes each, and
                  buy a better chance at the deepest valley. They do not
                  guarantee it, and the gallery&rsquo;s count of distinct
                  resting values is the honest measure of how much the start
                  mattered.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Seeding by spread">
                <>
<p>Choosing k observations uniformly at random can place several centers in a dense group while giving a sparse group none. Later updates may remain in that poor arrangement because each center follows the observations currently assigned to it. A more spread-out start can reduce this risk.</p>
                <p>The seeding used here starts with one observation chosen uniformly. For each later center, measure each observation’s squared distance to its nearest center already chosen. Use those squared distances as sampling weights. Observations poorly covered by the existing centers are then more likely to supply the next one.</p>
</>
                <Equation>{"P(next center is person i) = Dᵢ² / Σⱼ Dⱼ²,   where Dᵢ is the distance from i to the nearest center so far"}</Equation>
                <p>This rule samples in proportion to squared distance rather than always choosing the farthest observation. A poorly represented observation is more likely to be selected, but an extreme outlier can still strongly influence that probability. The chosen centers are observed points; on seed three, the crowd starts from (180, 80) and then (159, 57).</p>
                <KeepInMind>
                  A good seeding lowers the chance of a bad valley and does
                  not remove it. Seed 3 on the crowd is a spread-out start
                  that still rests in the second-best place.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. When restarts cannot help">
                <>
<p>
                  Restarts repair a bad start. They cannot repair a bad objective, and the two bands on the gallery are the case that separates those. Twenty-two people lie on two parallel bands fourteen kilograms apart, each band far longer than the gap between them, and at two groups every one of the ten starts rests at exactly the same inertia, 4504.4, with eleven people in each group.
                </p>
                <p>The displayed solutions cut both bands by height rather than keeping each constructed band together. That partition has lower within-center squared distance in this comparison. Agreement among ten starts supports its recurrence here, but does not by itself prove that it is the global minimum.</p>
</>
                <KeepInMind>

                  Repeated starts help assess sensitivity to initialization. Agreement across them does not prove global optimality, and even a global minimum of inertia need not match the groups intended by the application.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What k Cannot Tell You",
          content: (
            <>
              <SubSection title="13. Inertia falls with k, all the way to zero">
                <p>The fitting procedure takes k as a supplied setting. The best achievable inertia cannot increase when we allow another center, because the earlier centers remain an available choice. It can reach zero when each distinct observed position has a center. In the displayed eight-person example, inertia falls from 13096.0 at one group to 64.0 at two and eventually zero. Inertia alone therefore favors more centers rather than determining a useful count.</p>
                <ElbowChart />
                <NumberTable
                  headings={["k", "1", "2", "3", "4", "5", "6", "7", "8"]}
                  rows={[["inertia, the eight", "13096.0", "64.0", "39.0", "19.0", "9.0", "5.0", "2.5", "0.0"]]}
                  caption="Each entry is the best of ten starts. At k = 3 the fit splits the short clump into pairs, sizes 4, 2 and 2, and at k = 8 every person is alone."
                />
                <KeepInMind>
                  Inertia compares groupings of the same people at the same k.
                  Across different k it always prefers more groups, so it
                  cannot select k, and it is reported here rather than
                  selected on.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The elbow is a judgment" id="14-the-elbow-is-a-judgement">
                <>
<p>
                  What practitioners do is look for the elbow, the k past which the fall flattens, and treat the further gains as bookkeeping rather than structure. On the eight it is unmistakable, since the drop from one group to two is 13032 and the next drop is 25. On the crowd it is less so. The fall from one group to two is 7529.6, from two to three another 2451.0, and from three to four only 279.6, and at three groups 4.8 percent of the total scatter is left.
                </p>
                <p>Three groups is a candidate suggested by the change in this curve. That interpretation still needs to be checked against the purpose of the grouping.</p>
</>
                <NumberTable
                  headings={["people", "k = 1", "k = 2", "k = 3", "k = 4", "k = 5"]}
                  rows={[
                    ["the eight", "13096.0", "64.0", "39.0", "19.0", "9.0"],
                    ["the crowd", "10482.2", "2952.6", "501.6", "222.0", "92.0"],
                    ["an ideal case", "23590.4", "282.4", "202.9", "128.7", "107.4"],
                    ["two bands", "15738.8", "4504.4", "2417.0", "1670.7", "1394.6"],
                  ]}
                  caption="The two bands have no elbow to find. The share of the total left after each k is 28.6, 15.4, 10.6 and 8.9 percent, a curve with no clear change in slope, because no number of round groups describes two long thin ones."
                />
                <KeepInMind>

                  The elbow is a judgment made by a person reading a curve,
                  and on data without round clumps the curve may offer no
                  elbow at all, as the bands&rsquo; shares of 28.6, 15.4, 10.6
                  and 8.9 percent show, falling steadily with no clear elbow to identify.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Cluster IDs Across Fits" id="15-the-numbers-on-the-groups-mean-nothing">
                <p>
                  A classifier&rsquo;s label 1 means the same thing in every
                  fit, because the data said what 1 was. A clusterer&rsquo;s
                  group 1 means whichever group the seeding happened to number
                  first. In the seed gallery at three groups, seed 0 and seed
                  6 find the identical grouping of the crowd and give the
                  short clump the numbers 2 and 1 respectively, and the
                  gallery has to compare which people share a group rather
                  than compare the numbers to see that they agree.
                </p>
                <KeepInMind>

                  The grouping is real, meaning which people ended up
                  together. The numbering is an accident of seeding, and
                  nothing downstream should ever lean on it. Refitting after
                  a change can hand the same clump a different color.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. k groups come back whether or not the data has any">
                <p>On the sixteen-person ideal case, asking for three centers splits one of the two visible clumps into groups of five and three. Inertia falls from 282.4 to 202.9. That reduction does not establish a useful third category. For the eleven-person crowd at six groups, inertia is 54.5 and three groups contain only one person. Requested centers can also be empty, as Part 6 shows.</p>
                <KeepInMind>

                  A valid request can produce a numerical partition without revealing meaningful categories. Lower inertia rewards shorter squared distances, while the purpose of the grouping supplies a separate criterion for usefulness.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "Two runs on identical data from different starts can rest in genuinely different groupings, and neither is a bug.",
              true,
              "Each run improves or preserves inertia relative to its own start, but different starts can lead to different local solutions. These ten runs finish at three distinct inertia values. Comparing them shows initialization matters; choosing the smallest observed value improves this set of runs without proving the global optimum has been found.",
            ),
            choice(
              "The seeding picks each later center in proportion to the squared distance to the nearest center already chosen. Why not simply take the furthest person?",
              [
                "That would be deterministic and would chase exactly the stray people Part 5 worries about",
                "The furthest person is usually sitting in the densest clump",
                "It would leave the loop with no guarantee of stopping",
                "The distance to the nearest center cannot be computed for the furthest person",
              ],
              0,
              "Always selecting the farthest observation can repeatedly favor extreme or isolated observations. Squared-distance sampling instead makes distant observations more likely without selecting the farthest with certainty. It improves the spread of starts in expectation, but remains sensitive to outliers and does not guarantee the best final grouping. The supplied seed still reaches a suboptimal observed solution.",
            ),
            trueFalse(
              "On the two parallel bands all ten starts rest at the same inertia of 4504.4, so the method has found the grouping the eye sees.",
              false,
              "The ten runs agree on a partition that cuts both bands by height. That repeated agreement does not prove a global optimum, and it does not establish that the partition matches the groups we intended to recover. Squared distance rewards reducing variation along the long bands; that objective can favor splitting them rather than separating them. Restarts address initialization, not a mismatch between the objective and the intended grouping.",
            ),
            choice(
              "The best attainable inertia cannot increase as k grows and can reach zero when every distinct observation has a center. What can minimizing inertia alone not decide?",
              [
                "Choosing k",
                "Comparing two groupings of the same people at the same k",
                "Reporting how much of the scatter a grouping leaves",
                "Choosing among restarts",
              ],
              0,
              "Adding centers cannot worsen the global optimum because an extra center can be left unused or duplicate an existing one. Minimizing this objective alone therefore favors more clusters rather than balancing compactness against complexity. Inertia remains useful for comparing starts at fixed k, and its changes can inform an elbow heuristic. Separate local fits may not follow a perfectly monotone sequence.",
            ),
            several(
              "Which of these were measured when the method was asked for more groups than the data holds?",
              [
                "On sixteen people in two clear clumps, k of 3 cuts one clump into pieces of 5 and 3, at an inertia of 202.9 against 282.4 at two groups",
                "On the crowd at six groups, three of the six groups hold a single person",
                "The fit refuses a k larger than the number of groups the data supports",
                "The lower inertia at six groups on the crowd is evidence that the crowd holds six clumps",
              ],
              [0, 1],
              "A requested count within the implementation's row-count limits can split a visually coherent group into several clusters. Lower inertia then reflects extra centers, not proof that extra natural groups exist. Inspect the decrease alongside stability and the purpose of the grouping. Counts exceeding the available rows are a separate invalid-input case. Cluster numbers themselves are arbitrary and can change between equivalent fits.",
            ),
        ],
        },
        {
          title: "Part 5. When Nearest-Center Groups Do Not Fit the Data" , id: "part-5-where-the-method-fails",
          content: (
            <>
              <SubSection title="17. Compact Groups and Long Bands" id="17-the-shape-it-can-find-is-round">
                <p>Nearest-center regions have straight boundaries, but that does not make every fitted group literally round. In the parallel-band example, keeping each long band together is representable by a separating line. The squared-distance objective instead prefers cutting across the bands because the reduction in their long-direction spread is larger. The gallery compares methods with different objectives.</p>
                <ShapeGallery initial="bands" />
                <>
<p>With the displayed radius and density settings, the density method recovers both constructed bands. Single linkage also recovers them by connecting short within-band steps. The fitted two-component Gaussian mixture instead returns the cross-band cut in this run. A Gaussian mixture can represent elongated components, but initialization and local likelihood optimization affect which solution it reaches.</p>

</>
                <KeepInMind>

                  Squared Euclidean distance favors compact assignments around their means. Elongation, unequal spread or unequal density can make that objective prefer a partition different from the one we intended. Those tendencies do not require every fitted cluster to be round or equally sized.</KeepInMind>
              </SubSection>

              <SubSection title="18. Two crescents">
                <>
<p>

                  Two arcs curving around each other are the classic case, because no straight line separates them and their centers sit nearly on top of each other. Switch the gallery to the crescents. The nearest-center fit rests at 7949.1 with ten in each group and gets both arcs nearly right, then swaps the ends, handing the upper arc&rsquo;s person at (173, 58) to the lower group and the lower arc&rsquo;s person at (148, 46) to the upper.
                </p>
                <p>In the crescent example, density, single linkage and the displayed mixture fit recover the constructed groups. The mixture result differs from its band result. This illustrates that a method’s possible representations and the solution reached by one fitting procedure are separate questions.</p>
</>
                <KeepInMind>

                  Increasing k can divide a curved pattern into several nearest-center regions. That may help approximate it, but does not identify one curved group automatically. Density and single linkage use local connections; mixture models offer another alternative by modeling each component’s distribution.</KeepInMind>
              </SubSection>

              <SubSection title="19. Unequal sizes">
                <p>Why might k-means divide a large group instead of isolating a small nearby group? Its objective counts the squared distance of every observation. Reducing many distances in a broad group can improve that total more than giving a compact group its own center.</p>
<p>The unequal-size example makes this visible. There are twenty loosely spread observations and five tightly packed ones. With two centers, the fitted groups have sizes 15 and 10 and inertia 2464.6. The compact five have been combined with part of the broader group.</p>
<p>With three centers, one solution gives the compact five their own group, leaving groups of sizes 11, 9, and 5. Only three of the ten displayed starts find that solution. The seed gallery lets us separate the effect of the objective from the effect of initialization.</p>
<p>The other methods in the comparison use different definitions of a group. Density uses a neighborhood radius, single linkage connects nearby observations, and the mixture model can assign a separate spread to each component. Their different partitions follow from those different assumptions.</p>
                <KeepInMind>
                  A small compact group beside a broad group can be merged because reducing distances for many broad-group observations improves inertia more. The result depends on separation, scale and counts; the method does not invariably overlook every small group.</KeepInMind>
              </SubSection>

              <SubSection title="20. One stray person">
                <>
<p>

                  The mean gives a far person a large say, and the objective is built on means. Add one stray person at 196 centimeters and 14 kilograms to the eight and ask for two groups again. The stray is nearest the tall center, so they join it, and the update drags that center from (181, 80) to (184, 66.8), thirteen kilograms off the clump it is supposed to mark, while the inertia goes from 64.0 to 3728.8.
                </p>
                <p>

                  At three groups the stray gets a private center and the other two return to exactly where they were, inertia 64.0 again. Density, with a radius of six, calls the stray a person in no group and leaves the two clumps alone.
                </p>
</>
                <KeepInMind>

                  Every person is placed in some group, because a nearest
                  center always exists, and a stray placed in a group moves
                  that group&rsquo;s center. The method has no way to say
                  that someone belongs nowhere.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The distance is Euclidean because the update is a mean">
                <>
<p>The assignment and update rules must minimize the same objective. Here assignments use squared Euclidean distance, and the update uses its minimizing representative, the mean. Changing the distance while leaving the mean update in place would break that agreement. A different distance may require a different representative and therefore a different clustering procedure.</p>
                <p>

                  Under Manhattan distance the minimizer is the coordinate median instead, and the widget in section 6 measured the gap, since on the tall four with the stray the Manhattan total is 129.6 at the mean and 93.0 at the median. Keep the mean as the update and swap the distance, and the update step stops lowering the objective, so the convergence argument of section 7 collapses and nothing promises the loop will stop.
                </p>
</>
                <p>
                  Replacing the mean with the median gives a real method with
                  its own name, k-medians, which is not offered here,
                  so the fits on this page take no distance choice at all. On
                  the tall four alone the two candidates nearly tie, 34.0
                  against 35.0 for squared distance and 14.0 against 14.0 for
                  Manhattan, since with an even count of people any weight
                  between the middle two is a median; the stray is what pulls
                  them apart.
                </p>
                <KeepInMind>
                  The metric here follows from the update step rather than
                  being chosen beside it. Changing the distance while keeping
                  the mean does not give k-means with a different notion of
                  near; it gives a loop with no guarantee of stopping.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Units decide the answer">
                <p>Changing a feature’s units changes its contribution to the squared distances. Millimeters make height differences much larger numerically; meters make them much smaller relative to weight. Either feature can then dominate without becoming the only feature used.</p>
                <UnitSensitivity />
                <>
<p>

                  At two groups, centimeters and meters agree on the grouping and millimeters do not, splitting the crowd by height into 6 and 5. At three groups it is meters that disagree, moving the person at (147, 41) into the short clump for sizes 4, 3 and 4, while millimeters now agree with centimeters. The inertias are not comparable across the panels at all, 2952.6 against 155104.7 at two groups, because they are in different squared units.
                </p>
                <p>

                  Standardizing each feature by its own spread gives a grouping that agrees with the centimeter one at both k on this crowd, which is a fact about this crowd and not a law; what standardizing guarantees is only that neither feature outweighs the other by its unit.
                </p>
</>
                <KeepInMind>

                  Two measurements in different units have no natural common
                  distance, and the fit will use whatever the numbers imply.
                  Standardize first, or decide deliberately which feature
                  should count for more, and the{" "}
                  <Link href="/concepts/feature-scaling" className={link}>
                    feature scaling page
                  </Link>{" "}
                  is the place that decision is made.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What a Fitted Grouping Promises",
          content: (
            <>
              <SubSection title="23. New people are placed, not relearned">
                <p>

                  A fitted grouping is k centers in named feature space, and
                  a person the fit never saw is placed by the same rule that
                  placed everyone else, nearest center, with the centers
                  exactly where the fit left them. That is what makes the
                  playground&rsquo;s shading possible, since every cell of it
                  is a new person asked where they fall. Nothing is refitted,
                  so a new person cannot move a center, which is the one thing
                  the stray of section 20 could do while the fit was still
                  being made.
                </p>
                <p>This SDK matches features by name. Reversing the supplied order of height and weight leaves both tested assignments unchanged. Missing, extra or renamed features are rejected because the coordinates must correspond to those used to fit the centers. That behavior is an input-contract choice, separate from the k-means update itself.</p>
                <KeepInMind>

                  A fitted grouping is reusable on new people, and it says
                  nothing about whether those people resemble the ones it was
                  fitted on. A person far from every center is still placed,
                  at the nearest one.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. What the fit reports">
                <p>Read the inertia together with the pass count and group sizes. Inertia compares the fitted objective at a fixed k. The pass count helps distinguish a settled fit from one stopped by the limit of three hundred passes. Group sizes reveal whether any center received no observations. A low objective alone does not tell us all of those things.</p>
                <InAModel title="An empty group, on purpose">
                  <p>With six identical observations at (150, 50) and two requested centers, both centers occupy that point. The tie rule assigns all six observations to group zero, leaving sizes six and zero with inertia zero. An empty group has no mean to compute. This implementation retains its previous center rather than producing an undefined update.</p>
                </InAModel>
                <KeepInMind>

                  An empty group can result from coincident centers, ties or the assignment path, as well as a poorly suited center count. Inspect the observations and the empty-group policy before interpreting the fitted sizes.</KeepInMind>
              </SubSection>

              <SubSection title="25. Record initial centers, assignments and convergence rules" id="25-implementation-and-failure-contracts">
                <p>The requested number of clusters does not fully identify a fit. Initial centers, the number of starts, the rule for choosing a winning start and the stopping conditions all affect the result. Here distance is squared Euclidean; empty groups and tied assignments still need explicit handling.</p>
                <p>The defaults use ten starts with spread-based seeding and at most three hundred passes per start. A run stops when no center has a squared movement greater than one part in a hundred million. The playground uses a fixed seed so its numbers can be reproduced.</p>
                <p>Keep the labels, centers, inertia, pass count and group sizes available together. They tell us where the observations went, how much within-group variation remains and how the run ended.</p>
                <DerivationTable
                  expressionHeading="Points or clustering setting"
                  reasonHeading="Effect on centers and assignments"
                  rows={[
                    { expression: "no features at all", reason: "refused at the boundary, the same guard every model here shares." },
                    { expression: "a missing or non-finite value", reason: "refused before any center is placed; a feature must contain only finite values." },
                    { expression: "features of different lengths, or two with one name", reason: "refused by name, at the boundary." },
                    { expression: "one person, one group", reason: "fits, with the center on that person and an inertia of zero." },
                    { expression: "more groups than people", reason: "refused, since a group would have to be empty from the start; the message names both counts." },
                    { expression: "as many groups as people", reason: "fits with zero inertia when each observed position receives a center. Duplicate positions can still leave some group IDs empty." },
                    { expression: "a constant column", reason: "accepted; the eight with every height set to 150 group by weight alone, inertia 24.0, sizes 4 and 4." },
                    { expression: "identical people, more than one group", reason: "accepted; the seeding falls back to a uniform pick, the spare center lands on the same point and its group is empty, reported as a size of zero." },
                    { expression: "a person equidistant from two centers", reason: "placed in the lower-numbered group, by one stated rule." },
                    { expression: "k of zero, or a tolerance of zero or less", reason: "refused at construction, before any data is seen." },
                    { expression: "reading the centers or inertia before a fit", reason: "refused by name, with the model's own not-yet-fitted error." },
                    { expression: "new people with the features reordered", reason: "matched by name and accepted; a feature missing, extra or renamed is refused." },
                    { expression: "two long bands, or two crescents", reason: "the numeric fit is accepted, but its nearest-center partition can differ from the constructed groups. Inspect the result against the intended grouping." },
                  ]}
                />
                <p>Inputs can satisfy every arithmetic requirement while still producing groups that are unhelpful for the intended use. Inspect the assignments and group sizes, consider whether the distance and representation match the problem, and evaluate any later task that uses the groups. The pictures in Part 5 make several such mismatches visible in two dimensions.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            trueFalse(
              "A mixture of two bell-shaped components recovers the two bands, since unlike nearest center it can describe an elongated group.",
              false,
              "It can describe one and still does not find one here, because it starts from the nearest-center grouping and only ever climbs, so its answer on the bands is the same cut person for person. On the crescents it does recover the two arcs, which is the difference between a start that is nearly right and one that is wholly wrong.",
            ),
            choice(
              "One stray person at 196 centimeters and 14 kilograms is added to the eight and two groups are asked for. What happens?",
              [
                "The stray joins the tall group and drags its center from (181, 80) to (184, 66.8)",
                "The stray gets a center of its own and the two clumps are left where they were",
                "The stray is placed in no group, being far from both centers",
                "The centers do not move, since one person cannot outvote four",
              ],
              0,
              "The inertia goes from 64.0 to 3728.8 and that center ends thirteen kilograms off the clump it is supposed to mark. At three groups the stray does get a private center and the other two return to exactly where they were, at 64.0 again. Leaving the stray in no group is what density with a radius of six does, and this method has no way to say that somebody belongs nowhere.",
            ),
            choice(
              "Why can this method not take a choice of distance the way the neighbor pages do?",
              [
                "Keeping the mean as the update and swapping the distance stops the update lowering the objective, so nothing promises the loop will stop",
                "Only Euclidean distance can be evaluated against named features",
                "Manhattan distance has no minimizer to move a center to",
                "The inertia would then be reported in units that cannot be compared",
              ],
              0,
              "The mean is the exact minimizer of squared Euclidean distance specifically, and under Manhattan the minimizer is the coordinate median instead. Replacing the mean with the median gives a real method with its own name, k-medians, so the metric here follows from the update step rather than being chosen beside it.",
            ),
            trueFalse(
              "Converting the height column from centimeters to millimeters greatly increases its relative contribution to raw squared distance; this two-cluster run then gives groups of six and five.",
              true,
              "Only height is multiplied by ten, so its squared differences receive one hundred times their previous weight while weight differences remain present. That changes the fitted memberships here. The reported inertias use different relative coordinate scales, so comparing their magnitudes does not establish which grouping is better. Standardization or task-specific weights would define other distance choices to evaluate.",
            ),
            several(
              "Which of these hold for a grouping once it is fitted?",
              [
                "A person the fit never saw is placed at the nearest center and cannot move it",
                "Features are matched by name, so weight then height gives the same answer as height then weight",
                "A person missing the weight is placed by height alone",
                "Six identical people asked for two groups come back with sizes 6 and 0 rather than failing",
              ],
              [0, 1, 3],
              "Nothing is refitted, so the one thing the stray could do while the fit was being made is no longer available, and that is what makes the playground’s shading possible. A missing coordinate is refused, because the distance to a center cannot be evaluated with one absent. An empty group leaves its center where it was, since averaging nobody would give a center with no coordinates and every later distance to it would be undefined.",
            ),
        ],
        },
        {
          title: "Practice. Grouping the People With the Library",
          practice: [
            exercise("Group the eight people and check the centres by hand",["Fit KMeans with two clusters and random_seed=3 to the eight height-weight pairs below. Print each center, cluster sizes, inertia and iterations_run. Check each center against the coordinate means of its assigned people.", "Repeat with one cluster and print its inertia. Round centers and inertias to one decimal place. Compare the squared-distance cost of representing both separated groups with a single center."],`from oop_ml import Feature, KMeans

heights = Feature("height", [118, 120, 122, 124, 178, 180, 182, 184])
weights = Feature("weight", [24, 25, 28, 27, 78, 80, 83, 79])

model = KMeans(n_clusters=2, random_seed=3)
# Fit the model to the two features, print each centre's height and weight,
# the group sizes, the inertia and the passes to rest, then fit one group and
# print its inertia.`,`from oop_ml import Feature, KMeans

heights = Feature("height", [118, 120, 122, 124, 178, 180, 182, 184])
weights = Feature("weight", [24, 25, 28, 27, 78, 80, 83, 79])

model = KMeans(n_clusters=2, random_seed=3)
model.fit([heights, weights])

for centre in model.centroids:
    print(f"{centre.name} rests at ({centre.coordinate_for('height'):.1f}, {centre.coordinate_for('weight'):.1f})")
print(f"sizes {model.clustering.sizes}")
print(f"inertia {model.inertia:.1f}")
print(f"passes to rest {model.iterations_run}")

one = KMeans(n_clusters=1, random_seed=3).fit([heights, weights])
print(f"inertia with one group {one.inertia:.1f}")`,`cluster_1 rests at (181.0, 80.0)
cluster_2 rests at (121.0, 26.0)
sizes (4, 4)
inertia 64.0
passes to rest 2
inertia with one group 13096.0`,{...{ hints: ["A clusterer takes no target, so fit takes the list of features and nothing else.", "centroids on the fitted model is iterable, one center per group, and each center answers coordinate_for a feature name. inertia and iterations_run are properties of the model, and the sizes live on its clustering.", "The group a center is numbered is an accident of seeding, so the tall clump may come first. What to check is that each center sits on its clump’s mean."], check: numberCheck("What inertia does the two-group fit report?", 64.0, 0.05, "Every fitted center equals its assigned group's coordinate mean. Combining the separated groups into one center greatly increases within-group squared distance on these data.") },question:"Do the fitted centers equal their groups' coordinate means?"}),
            exercise("Run ten starts on the crowd one at a time",["Fit two clusters to the eleven people once per seed from 0 through 9, with n_initialisations=1. Print each seed's final inertia and iteration count. Count distinct inertia values after rounding to one decimal place.", "Then fit n_initialisations=10 under seed 0 and print the retained inertia. This implementation keeps the best objective among its starts, retaining the earlier result on an exact tie."],`from oop_ml import Feature, KMeans

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])

# For each seed from 0 to 9, fit two groups with a single start and print the
# seed, its resting inertia to one place and its passes to rest. Then print how
# many distinct resting values there were, and the inertia of a fit under seed
# 0 that is allowed ten starts.`,`from oop_ml import Feature, KMeans

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])

resting = []
for seed in range(10):
    model = KMeans(n_clusters=2, n_initialisations=1, random_seed=seed).fit([heights, weights])
    resting.append(round(model.inertia, 1))
    print(f"seed {seed}: inertia {model.inertia:.1f}, passes to rest {model.iterations_run}")

print(f"distinct resting values {len(set(resting))}")

best = KMeans(n_clusters=2, n_initialisations=10, random_seed=0).fit([heights, weights])
print(f"best of ten starts under seed 0: inertia {best.inertia:.1f}")`,`seed 0: inertia 3185.9, passes to rest 5
seed 1: inertia 2952.6, passes to rest 2
seed 2: inertia 3185.9, passes to rest 2
seed 3: inertia 3185.9, passes to rest 5
seed 4: inertia 2952.6, passes to rest 2
seed 5: inertia 2952.6, passes to rest 2
seed 6: inertia 3141.7, passes to rest 2
seed 7: inertia 2952.6, passes to rest 2
seed 8: inertia 2952.6, passes to rest 2
seed 9: inertia 3141.7, passes to rest 2
distinct resting values 3
best of ten starts under seed 0: inertia 2952.6`,{...{ hints: ["n_initialisations is how many starts one fit runs before keeping the lowest. One start per fit is what makes each seed’s valley visible.", "Construct a new KMeans model for each seed so that each fit starts from that seed's initialization.", "A set of the rounded inertias counts the valleys, and the library’s ten-start fit from seed 0 runs exactly the ten starts listed, so its answer is the lowest of them."], check: numberCheck("What inertia does the single start from seed 3 rest at?", 3185.9, 0.05, "Different initial centers reach different local solutions on this crowd. The multi-start fit retains the lowest recorded inertia, rather than treating one seeded result as the unique grouping.") },question:"Do different starting centers reach the same final grouping?"}),
            exercise("Add one stray person and watch a centre move",["Add the person at 196 cm and 14 kg to the eight observations. Fit KMeans with two and three clusters under seed 3. Print the centers and inertia for both fits. Compare which cluster receives the added person.", "Fit DBSCAN to the same nine people with radius=6 and min_neighbourhood_size=2. Print labels and n_noise. Unlike this k-means procedure, DBSCAN can mark an observation as noise, using label −1, rather than assign it to a cluster."],`from oop_ml import DBSCAN, Feature, KMeans

heights = Feature("height", [118, 120, 122, 124, 178, 180, 182, 184, 196])
weights = Feature("weight", [24, 25, 28, 27, 78, 80, 83, 79, 14])

# Fit two groups and three groups under seed 3, printing each fit's centres to
# one place and its inertia to one place. Then fit the density clusterer with
# radius 6 and min_neighbourhood_size 2, and print its labels and how many
# people it left in no group.`,`from oop_ml import DBSCAN, Feature, KMeans

heights = Feature("height", [118, 120, 122, 124, 178, 180, 182, 184, 196])
weights = Feature("weight", [24, 25, 28, 27, 78, 80, 83, 79, 14])

for k in (2, 3):
    model = KMeans(n_clusters=k, random_seed=3).fit([heights, weights])
    centres = ", ".join(
        f"({centre.coordinate_for('height'):.1f}, {centre.coordinate_for('weight'):.1f})"
        for centre in model.centroids
    )
    print(f"{k} groups: centres {centres}, inertia {model.inertia:.1f}")

density = DBSCAN(radius=6, min_neighbourhood_size=2).fit([heights, weights])
print(f"density labels {[int(label) for label in density.labels]}")
print(f"people in no group {density.n_noise}")`,`2 groups: centres (184.0, 66.8), (121.0, 26.0), inertia 3728.8
3 groups: centres (181.0, 80.0), (121.0, 26.0), (196.0, 14.0), inertia 64.0
density labels [0, 0, 0, 0, 1, 1, 1, 1, -1]
people in no group 1`,{...{ hints: ["The same two features fit both group counts, and the stray is the ninth person in each list.", "The density clusterer is constructed with a radius and a min_neighbourhood_size and fitted the same way, with no k. Its labels and n_noise are properties of the fitted model.", "At two groups the stray is nearest the tall center, joins it, and the update averages them in. At three groups it gets a center of its own and the other two centers return to the means of their clumps."], check: numberCheck("What inertia does the two-group fit of the nine people report?", 3728.8, 0.05, "The distant person pulls a mean-based center away from the original tall group. Adding a third center can isolate that person; the density method instead applies its neighborhood rule and can leave a point unassigned.") },question:"How does one distant person affect the fitted groups?"}),
            exercise("Rewrite the heights in millimetres",["Fit the supplied people twice under seed 3, once with height in centimeters and once after converting height to millimeters. Leave weights in kilograms. Print each fit's group sizes, labels and inertia to one decimal place.","Compare which people share a group, rather than comparing the arbitrary group IDs. The numeric inertias use different relative feature scales, so their magnitudes are not a fair comparison of grouping quality."],`from oop_ml import Feature, KMeans

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])
millimetres = Feature("height", [height * 10 for height in heights.values])

# Fit two groups under seed 3 with the heights in centimetres and again with
# the heights in millimetres, and print each fit's sizes, labels and inertia.`,`from oop_ml import Feature, KMeans

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])
millimetres = Feature("height", [height * 10 for height in heights.values])

for unit, feature in (("centimetres", heights), ("millimetres", millimetres)):
    model = KMeans(n_clusters=2, random_seed=3).fit([feature, weights])
    labels = [int(label) for label in model.predict([feature, weights])]
    print(f"{unit}: sizes {model.clustering.sizes}, labels {labels}, inertia {model.inertia:.1f}")`,`centimetres: sizes (4, 7), labels [0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1], inertia 2952.6
millimetres: sizes (6, 5), labels [1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0], inertia 155104.7`,{...{ hints: ["A feature’s values are the numbers it was built from, so a new feature in millimeters is the same name over ten times each value.", "predict on the fitted model gives each person’s group in the order the people were given, and the group numbers are an accident of seeding, so compare which people share a number rather than the numbers themselves.", "Every horizontal gap is ten times larger in millimeters while the vertical gaps stay put, so height alone decides who is near whom."], check: numberCheck("What inertia does the millimeter fit report, to one place?", 155104.7, 0.05, "Changing centimeters to millimeters magnifies the height contribution to this mixed-coordinate squared-distance objective while leaving kilograms unchanged. The resulting inertia is not in squared millimeters alone, and its magnitude is not directly comparable with the old objective.") },question:"Can changing height units change the grouping?",hints:["Convert only the height values and preserve feature names. A change of units leaves the observed people unchanged.","Group labels can be permuted by seeding, so compare memberships and sizes rather than insisting that one group keeps its numeric label.","Height differences receive a larger numerical contribution after the conversion. Weight still contributes; it has not been removed from the distance."]}),
          ],
        },
      ]}
    />
  );
}
