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

export const metadata: Metadata = {
  title: "k-Means Clustering · oop_ml",
  description:
    "We may want to group similar observations without having labels for those groups. K-means uses nearby centres to assign the observations, then moves the centres to better represent their assigned points.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KMeansPage() {
  return (
    <ConceptPage
      lessonId="k-means"
      intuition={lessonIntuitions["k-means"]}
      technicalStart="Part 2. The Two Steps and the Number They Lower"
      openingTitle="Find the Groups Before Anyone Names Them"
      playgroundIntro="Step through assignment and centre updates separately. Compare the final groups after changing the starting centres or the requested number of groups."
      title="k-Means Clustering"
      tagline={"We may want to group similar observations without having labels for those groups. K-means uses nearby centres to assign the observations, then moves the centres to better represent their assigned points."}
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
          lesson again with centres in place of a ball on a hill.
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
                  Look at what is missing from the box above. Every scatter on this site so far coloured its dots before any model arrived, fails and passes, children and adults. Here every person starts uncoloured, and the colours you see were put there by the method, which was told only how many groups to look for.
                </p>
                <p>
                  The eight people it opens on are two tight clumps, four short and light around 121 centimetres and 26 kilograms, four tall and heavy around 181 and 80, and with k set to 2 the method finds exactly those two clumps.
                </p>
</>
                <>
<p>
                  Press the crowd button for the less tidy version, the classification pages&rsquo; eleven people with their labels stripped away, and notice the method still carves confident groups. It always will. Ask for k groups and k groups come back, whether or not the data has any, which is worth keeping in mind through everything that follows, and Part 4 returns to it.
                </p>
                <p>
                  Drag a dot from one clump toward the other and watch the colours and the X marks renegotiate; the groups are not stored anywhere, they are re-derived from the geometry every time anything moves.
                </p>
</>
                <KeepInMind>
                  Nothing on this page has a label. A grouping is a claim the
                  method makes about the geometry of the people, and the only
                  thing it was told is how many groups to claim.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a group is here">
                <p>
                  The method never defines a group directly. It defines a
                  centre, one point per group, and a group is then whoever is
                  nearer to that centre than to any other. The shading in the
                  playground is that rule painted over the whole plane, and
                  with two centres the boundary between the two shaded regions
                  is a straight line, the set of points exactly as far from
                  one centre as from the other.
                </p>
                <Equation>{"person belongs to group j   if   ‖person − centre_j‖ ≤ ‖person − centre_i‖ for every other i"}</Equation>
                <WhyThisWorks title="Why the boundary between two centres is a straight line">
                  <p>
                    Being equidistant from two points a and b means the two
                    squared distances agree, and expanding both squares
                    cancels the squared length of the person, leaving a
                    condition that is linear in the person&rsquo;s
                    coordinates. On the eight people the resting centres are
                    (121, 26) and (181, 80), so the boundary is the line
                    through their midpoint (151, 53) perpendicular to the
                    segment joining them, and (151, 53) is also the mean of all
                    eight, since the two groups are the same size.
                  </p>
                  <Equation>{"‖x − a‖² = ‖x − b‖²   ⇔   2 x · (b − a) = ‖b‖² − ‖a‖²"}</Equation>
                </WhyThisWorks>
                <p>
                  A person sitting exactly on the boundary has to go somewhere,
                  and either answer is equally correct. The fit here sends them
                  to the lower-numbered group, and I checked that with a person
                  placed at (151, 53), who lands in group 0. The rule matters
                  only in that it must be a rule, so that two fits of identical
                  data cannot disagree for no reason.
                </p>
                <KeepInMind>
                  Groups are regions of nearest centre, so every group this
                  method can find is bounded by straight lines and has no
                  dents. Part 5 is about the data that is not shaped like that.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. A centre is the mean of its group">
                <p>
                  The other half of the definition is where a centre sits.
                  When the loop has come to rest, every centre is the plain
                  mean of the people assigned to it, the statistics
                  primer&rsquo;s balance point, and on the eight people that is
                  arithmetic you can check against the X marks.
                </p>
                <WorkedExample title="The two resting centres">
                  <Equation>{"heights  118 + 120 + 122 + 124 = 484,   484 / 4 = 121\nweights   24 +  25 +  28 +  27 = 104,   104 / 4 =  26"}</Equation>
                  <p>
                    So one centre rests at (121, 26), and the same sums on the
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
                  group&rsquo;s centre, square it, and add up over everyone.
                  The total is called the inertia, and the name is
                  Steinhaus&rsquo;s, since for equal masses it is the sum of
                  the parts&rsquo; moments of inertia about their own centres.
                </p>
                <Equation>{"inertia = Σᵢ ‖personᵢ − centre of their group‖²"}</Equation>
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
                    centre has to serve both clumps from the grand mean
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
                <p>
                  The loop is two steps, and this is the first. Hold the
                  centres where they are and give every person to whichever
                  centre is nearest. Each person&rsquo;s term in the inertia
                  is their squared distance to their own centre, so moving a
                  person to a nearer centre shrinks their term and touches
                  nobody else&rsquo;s, and a person already nearest their own
                  centre stays put. The total cannot rise.
                </p>
                <InAModel title="On the crowd, seed 3, pass 1">
                  <p>
                    After the first update the centres sit at (180.3, 80.3)
                    and (141.1, 43.3) and the inertia under the old assignment
                    is 4127.7. Reassigning moves one person, the one at
                    (162, 61), across to the taller centre, and the inertia
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
                  The second step holds the assignment fixed and moves each
                  centre to the mean of its current members. This is the step
                  that needs an argument, since it is not obvious that the
                  mean is the best place to put a centre rather than merely a
                  reasonable one. It is the best place, exactly. Work one
                  coordinate at a time and ask which value c makes the total
                  squared distance to the group smallest.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="why"
                  rows={[
                    { expression: "T(c) = Σᵢ (xᵢ − c)²", reason: "the group's share of the inertia, as a function of where its centre is" },
                    { expression: "dT/dc = −2 Σᵢ (xᵢ − c) = 0", reason: "a smooth bowl, so its minimum is where the derivative vanishes" },
                    { expression: "Σᵢ xᵢ − n c = 0", reason: "the deviations from c must cancel exactly, the statistics primer's balance point" },
                    { expression: "c = (Σᵢ xᵢ) / n", reason: "the mean, and the only number the deviations cancel around" },
                  ]}
                />
                <p>
                  So the update does not nudge a centre somewhere better, it
                  jumps to the exact minimiser for the current assignment, and
                  the total cannot rise. The widget scores two candidates for
                  the centre of the tall clump, the mean and the coordinate
                  median, under two distances, and the stray person is there
                  to pull them apart.
                </p>
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
                  The update step is the exact minimiser of the inertia for a
                  fixed assignment, because the mean minimises squared
                  Euclidean distance. That word Euclidean is doing real work,
                  and Part 5 collects on it.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Why the loop must settle">
                <p>
                  Put the two facts together. Each assignment lowers the
                  inertia or holds it, each update lowers it or holds it, and
                  there are only finitely many ways to assign eleven people to
                  two groups. A total that never rises, stepping through
                  finitely many states, cannot go on forever and cannot come
                  back to a state it has left with a lower total, so the loop
                  stops. The staircase watches it happen on the crowd, with
                  the inertia read after each half of every pass.
                </p>
                <InertiaChart />
                <p>
                  Both kinds of step take a share of the fall. From the seeded
                  start at 8197.0, the first update takes the total to 4127.7
                  and the first assignment to 4086.8, the second pair to
                  3802.0 and 3724.6, the third to 3483.3 and 3425.6, and the
                  fourth update lands on 3185.9, where the assignment changes
                  nobody. The fifth pass moves no centre at all, and the fit
                  reports itself settled after five passes, which is the
                  number the playground calls passes to rest.
                </p>
                <KeepInMind>
                  Convergence is guaranteed and usually fast, on this site a
                  handful of passes. What is not guaranteed is which resting
                  place the loop reaches, and the dashed line on the chart
                  is the first sign of that. This start rests at 3185.9
                  while the best of ten starts rests at 2952.6.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Following one start pass by pass">
                <>
<p>
                  The stepper below is the same walk as the staircase, drawn on the plane, with the two halves of each pass taken one at a time. On seed 3 the two starting centres are two of the people, (180, 80) and (159, 57), and the first assignment hands eight people to the second of them and three to the first.
                </p>
                <p>
                  Each update drags a centre toward the mean of a group that is still changing, each assignment then moves one more person across, and the two alternate until an update moves no centre and an assignment moves no person.
                </p>
</>
                <LloydStepper />
                <p>
                  Switch to the two small clumps and the walk is over almost
                  before it starts. Seed 3 places the centres on (182, 83) and
                  (118, 24), one in each clump, the first assignment is
                  already the right one, and a single update puts the centres
                  on the two means with the inertia at 64.0. The second pass
                  moves nothing, so the fit reports two passes, one of them
                  spent confirming that the first was enough.
                </p>
                <KeepInMind>
                  A pass is an update followed by an assignment, and the walk
                  stops when an update moves no centre further than a small
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
              "Both halves have to hold at once, and the loop is how they come to. A centre is defined as a point and a group as whoever is nearest to it, so neither half is enough on its own. On the eight people the centre at (121, 26) is the mean of the short four, 484 over 4 and 104 over 4, and the boundary through (151, 53) leaves every one of those four on its side, so both halves hold there and the inertia reads 64.0.",
            ),
            choice(
              "On the eight people the resting centres are (121, 26) and (181, 80). Where does the boundary between the two groups run?",
              [
                "Through their midpoint (151, 53), perpendicular to the segment joining them",
                "Through their midpoint, along the segment joining them",
                "Through (121, 26), perpendicular to the segment joining them",
                "Wherever the fit drew it, since the boundary is stored with the groups",
              ],
              0,
              "Being equidistant from two points means the two squared distances agree, and expanding both squares cancels the squared length of the person, leaving a condition linear in the coordinates. Nothing stores the boundary, which is why dragging a dot renegotiates it. On these eight, (151, 53) is also the mean of all of them, because the two groups are the same size.",
            ),
            choice(
              "Why is moving a centre to the mean of its members the exact minimiser rather than merely a reasonable move?",
              [
                "The mean minimises total squared Euclidean distance, so the centre jumps straight to the best place for the current assignment",
                "Averaging is the only arithmetic a centre can be moved by",
                "Assignment has already lowered the inertia, so the update cannot raise it",
                "The mean is the best place to put a centre under any distance",
              ],
              0,
              "On the tall clump with the stray person the total squared distance is 3698.8 at the mean against 4463.0 at the coordinate median, so the mean wins the total the method tracks. Under Manhattan distance the order reverses, 129.6 against 93.0, and that reversal is what Part 5 collects on.",
            ),
            trueFalse(
              "A fit whose first update already lands on the right centres reports one pass.",
              false,
              "A pass is an update followed by an assignment, and the walk stops when an update moves no centre further than a small tolerance, so the pass that confirms the stop still counts. On the two small clumps at seed 3 the first assignment is already right and the fit reports two passes, one of them spent confirming that the first was enough.",
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
              "All four are the argument. A total that never rises, stepping through finitely many states, cannot go on forever and cannot return to a state it has left with a lower total, so the loop stops. Nothing in that bounds the size of a step, so a pass may lower the inertia by almost nothing, and nothing in it says which resting place is reached, which is why the seeded start on the crowd rests at 3185.9 where the best of ten starts rests at 2952.6.",
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
                  Change the seed on the stepper to 1 and the start is (120, 25) and (178, 78), one centre in each clump; the first assignment is already the winning grouping, and one update reaches 2952.6.
                </p>
</>
                <NumberTable
                  headings={["the crowd, k = 2", "seed 3", "seed 1"]}
                  rows={[
                    ["starting centres", "(180, 80) and (159, 57)", "(120, 25) and (178, 78)"],
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
                <p>
                  The cheapest insurance against a poor start is more starts.
                  Run the whole loop from several seedings, read each
                  one&rsquo;s resting inertia, and keep the lowest. The
                  gallery does that for ten seeds and lines the results up.
                </p>
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
<p>
                  Choosing the starting centres by picking k people at random is the obvious thing, and it has a real weakness. A dense clump holding most of the people is likely to be handed several centres while a sparse one gets none, and the loop cannot recover from that, since it only ever moves a centre to the middle of the people who already chose it.
                </p>
                <p>
                  The seeding the fits here use spreads the start out instead. Pick the first centre uniformly from the people. Then for each remaining centre, find every person&rsquo;s squared distance to the nearest centre already chosen, and pick the next centre from the people with probability in proportion to that squared distance.
                </p>
</>
                <Equation>{"P(next centre is person i) = Dᵢ² / Σⱼ Dⱼ²,   where Dᵢ is the distance from i to the nearest centre so far"}</Equation>
                <p>
                  The rule is not to take the furthest person, which would be
                  deterministic and would chase exactly the stray people Part
                  5 worries about. Sampling in proportion makes a far person
                  likely rather than certain, so the start is spread out
                  without being at the mercy of one strange point. It is also
                  why the starts on the stepper are always two of the people,
                  and why seed 3 on the crowd, having picked (180, 80) first,
                  went on to pick (159, 57) rather than another tall person.
                </p>
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
                <p>
                  The grouping they agree on cuts both bands in half by height. It is the deepest valley this objective has on these people, and the eye can see that each band was meant to be one group.
                </p>
</>
                <KeepInMind>
                  When ten starts agree, the objective has been minimised.
                  Whether the objective was the right one to minimise is a
                  question about the data, and Part 5 is that question.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What k Cannot Tell You",
          content: (
            <>
              <SubSection title="13. Inertia falls with k, all the way to zero">
                <p>
                  One number in this method is never learned, and that is k
                  itself. Slide it upward on the two small clumps and watch
                  the inertia. At one group it is 13096.0, at two it is 64.0,
                  the natural grouping found, and it keeps falling from there,
                  because more centres can only sit closer to people, all the
                  way to zero when every person has a private centre. The
                  falling number cannot choose k for us, since a larger k
                  never costs it anything.
                </p>
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

              <SubSection title="14. The elbow is a judgement">
                <>
<p>
                  What practitioners do is look for the elbow, the k past which the fall flattens, and treat the further gains as bookkeeping rather than structure. On the eight it is unmistakable, since the drop from one group to two is 13032 and the next drop is 25. On the crowd it is less so. The fall from one group to two is 7529.6, from two to three another 2451.0, and from three to four only 279.6, and at three groups 4.8 percent of the total scatter is left.
                </p>
                <p>
                  Three is the reading I would take, and it is a reading, not a calculation.
                </p>
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
                  The elbow is a judgement made by a person reading a curve,
                  and on data without round clumps the curve may offer no
                  elbow at all, as the bands&rsquo; shares of 28.6, 15.4, 10.6
                  and 8.9 percent show, falling steadily with no clear elbow to identify.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The numbers on the groups mean nothing">
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
                  a change can hand the same clump a different colour.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. k groups come back whether or not the data has any">
                <p>
                  The method has no way to answer that there are fewer groups
                  than it was asked for. Press the ideal case, sixteen people
                  in two clear clumps, and set k to 3. The fit obliges, with
                  an inertia of 202.9 against 282.4 at two groups, by cutting
                  one clump into pieces of 5 and 3, and the elbow chart is the
                  only thing that says the third group bought little. On the
                  crowd at six groups the inertia is 54.5 and three of the
                  six groups hold a single person.
                </p>
                <KeepInMind>
                  Every k produces a grouping, every grouping produces
                  confident colours and a lower inertia than the k before.
                  None of that is evidence that the groups exist.
                </KeepInMind>
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
              "Each step lowers the total, so the walk only ever goes downhill, and downhill from where it started is not the deepest valley there is. On the crowd at two groups the ten starts find three different resting values, 2952.6, 3185.9 and 3141.7, and the count of distinct values is the honest measure of how much the start mattered.",
            ),
            choice(
              "The seeding picks each later centre in proportion to the squared distance to the nearest centre already chosen. Why not simply take the furthest person?",
              [
                "That would be deterministic and would chase exactly the stray people Part 5 worries about",
                "The furthest person is usually sitting in the densest clump",
                "It would leave the loop with no guarantee of stopping",
                "The distance to the nearest centre cannot be computed for the furthest person",
              ],
              0,
              "Sampling in proportion makes a far person likely rather than certain, so the start is spread out without being at the mercy of one strange point. It is also why seed 3 on the crowd, having picked (180, 80) first, went on to pick (159, 57) rather than another tall person, and that spread-out start still rested in the second-best place.",
            ),
            trueFalse(
              "On the two parallel bands all ten starts rest at the same inertia of 4504.4, so the method has found the grouping the eye sees.",
              false,
              "Ten starts agreeing means the objective has been minimised, and the grouping they agree on cuts both bands in half by height. Halving the length of a band saves far more squared distance than separating the bands would, so restarts repair a bad start and cannot repair a bad objective.",
            ),
            choice(
              "Inertia keeps falling as k rises, all the way to zero. What does that make it useless for?",
              [
                "Choosing k",
                "Comparing two groupings of the same people at the same k",
                "Reporting how much of the scatter a grouping leaves",
                "Choosing among restarts",
              ],
              0,
              "More centres can only sit closer to people, so a larger k never costs the inertia anything and it always prefers more groups. It still compares groupings at one k, which is exactly what the restarts are kept or discarded on, so it is reported here rather than selected on.",
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
              "Every k produces a grouping, confident colours and a lower inertia than the k before, and none of that is evidence that the groups exist, since a larger k never costs the inertia anything. Nothing refuses a large k, and the elbow chart is the only thing that says the third group on the sixteen people bought little. The numbering is an accident of seeding too, which is why seeds 0 and 6 can find the identical grouping of the crowd at three groups and number the short clump 2 and 1.",
            ),
        ],
        },
        {
          title: "Part 5. Where the Method Fails",
          content: (
            <>
              <SubSection title="17. The shape it can find is round">
                <p>
                  Section 2 showed that a group here is a region of nearest
                  centre, bounded by straight lines and without dents. Two
                  long thin groups lying side by side are not shaped like
                  that, and no pair of centres can describe them. On the two
                  bands the fit cuts each band in half by height, because
                  halving the length of a band saves far more squared
                  distance than separating the bands would, and section 12
                  showed every start agrees. The gallery puts three other
                  definitions of a group beside it on the same people.
                </p>
                <ShapeGallery initial="bands" />
                <>
<p>
                  Density asks whether a person sits within ten units of another and follows the chain, and it recovers both bands with nobody left out. Single linkage merges the two groups with the closest pair of members until two remain, and it recovers them too, since each band is a chain of short steps. The mixture of two bell-shaped components can describe an elongated group and still does not find one here, because it starts from the nearest-centre grouping and only ever climbs; its answer is the same cut, person for person.
                </p>
                <p>
                  That is recorded elsewhere as measured, and I found the same.
                </p>
</>
                <KeepInMind>
                  Minimising squared distance to a centre finds groups that
                  are round, similarly sized and similarly dense. That is
                  what nearest centre means as a definition of a group, not
                  a failure of the implementation.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Two crescents">
                <>
<p>
                  Two arcs curving around each other are the classic case, because no straight line separates them and their centres sit nearly on top of each other. Switch the gallery to the crescents. The nearest-centre fit rests at 7949.1 with ten in each group and gets both arcs nearly right, then swaps the ends, handing the upper arc&rsquo;s person at (173, 58) to the lower group and the lower arc&rsquo;s person at (148, 46) to the upper.
                </p>
                <p>
                  Density and single linkage recover the two arcs exactly, and here the mixture does too, which is worth saying since on the bands it did not; a nearest-centre start that is nearly right can be climbed from, and one that is wholly wrong cannot.
                </p>
</>
                <KeepInMind>
                  Increasing k does not remove the preference for compact groups around a mean. A curved cluster may be divided into several such groups.
                  The alternatives that see it ask a local question, whether
                  each person is near some other member, rather than a global
                  one about a centre.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Unequal sizes">
                <p>Why might k-means divide a large group instead of isolating a small nearby group? Its objective counts the squared distance of every observation. Reducing many distances in a broad group can improve that total more than giving a compact group its own centre.</p>
<p>The unequal-size example makes this visible. There are twenty loosely spread observations and five tightly packed ones. With two centres, the fitted groups have sizes 15 and 10 and inertia 2464.6. The compact five have been combined with part of the broader group.</p>
<p>With three centres, one solution gives the compact five their own group, leaving groups of sizes 11, 9, and 5. Only three of the ten displayed starts find that solution. The seed gallery lets us separate the effect of the objective from the effect of initialization.</p>
<p>The other methods in the comparison use different definitions of a group. Density uses a neighborhood radius, single linkage connects nearby observations, and the mixture model can assign a separate spread to each component. Their different partitions follow from those different assumptions.</p>
                <KeepInMind>
                  A small tight group next to a large loose one is a real
                  structure the objective is built to overlook, because a big
                  group&rsquo;s spread is worth more inertia than a small
                  group&rsquo;s separateness.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. One stray person">
                <>
<p>
                  The mean gives a far person a large say, and the objective is built on means. Add one stray person at 196 centimetres and 14 kilograms to the eight and ask for two groups again. The stray is nearest the tall centre, so they join it, and the update drags that centre from (181, 80) to (184, 66.8), thirteen kilograms off the clump it is supposed to mark, while the inertia goes from 64.0 to 3728.8.
                </p>
                <p>
                  At three groups the stray gets a private centre and the other two return to exactly where they were, inertia 64.0 again. Density, with a radius of six, calls the stray a person in no group and leaves the two clumps alone.
                </p>
</>
                <KeepInMind>
                  Every person is placed in some group, because a nearest
                  centre always exists, and a stray placed in a group moves
                  that group&rsquo;s centre. The method has no way to say
                  that someone belongs nowhere.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The distance is Euclidean because the update is a mean">
                <>
<p>
                  The neighbour pages let you choose what near means, and it is tempting to ask for the same here, Manhattan distance say, for people measured on scales that should not be squared. The method cannot offer it, and the reason is section 6. The update step is a mean, and the mean is the exact minimiser of squared Euclidean distance specifically.
                </p>
                <p>
                  Under Manhattan distance the minimiser is the coordinate median instead, and the widget in section 6 measured the gap, since on the tall four with the stray the Manhattan total is 129.6 at the mean and 93.0 at the median. Keep the mean as the update and swap the distance, and the update step stops lowering the objective, so the convergence argument of section 7 collapses and nothing promises the loop will stop.
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
                <p>
                  Since everything here is distance, the units the features
                  are written in are part of the model. Rewrite the
                  crowd&rsquo;s heights in millimetres and every horizontal gap
                  becomes ten times larger while the vertical gaps stay put,
                  so height alone decides who is near whom. Write them in
                  metres and weight alone does.
                </p>
                <UnitSensitivity />
                <>
<p>
                  At two groups, centimetres and metres agree on the grouping and millimetres do not, splitting the crowd by height into 6 and 5. At three groups it is metres that disagree, moving the person at (147, 41) into the short clump for sizes 4, 3 and 4, while millimetres now agree with centimetres. The inertias are not comparable across the panels at all, 2952.6 against 155104.7 at two groups, because they are in different squared units.
                </p>
                <p>
                  Standardising each feature by its own spread gives a grouping that agrees with the centimetre one at both k on this crowd, which is a fact about this crowd and not a law; what standardising guarantees is only that neither feature outweighs the other by its unit.
                </p>
</>
                <KeepInMind>
                  Two measurements in different units have no natural common
                  distance, and the fit will use whatever the numbers imply.
                  Standardise first, or decide deliberately which feature
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
                  A fitted grouping is k centres in named feature space, and
                  a person the fit never saw is placed by the same rule that
                  placed everyone else, nearest centre, with the centres
                  exactly where the fit left them. That is what makes the
                  playground&rsquo;s shading possible, since every cell of it
                  is a new person asked where they fall. Nothing is refitted,
                  so a new person cannot move a centre, which is the one thing
                  the stray of section 20 could do while the fit was still
                  being made.
                </p>
                <p>
                  The features are matched by name rather than position. Hand
                  the fit weight then height and the answer is the same as
                  height then weight, and I checked that on two people, who
                  came back in their own groups either way. A person missing
                  the weight, or carrying an extra measurement, or with height
                  renamed, is refused, since the distance to a centre cannot
                  be evaluated with a coordinate absent and an extra one has
                  nothing in any centre to be compared against.
                </p>
                <KeepInMind>
                  A fitted grouping is reusable on new people, and it says
                  nothing about whether those people resemble the ones it was
                  fitted on. A person far from every centre is still placed,
                  at the nearest one.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. What the fit reports">
                <p>
                  Beside the labels and the centres, a fit here reports three
                  things worth reading together. The inertia, for comparing
                  groupings at one k. The passes to rest, which is the cheapest
                  sign that the loop stopped by settling rather than by hitting
                  its pass limit of three hundred. And the group sizes, where a
                  zero means a centre that nobody chose.
                </p>
                <InAModel title="An empty group, on purpose">
                  <p>
                    Six identical people at (150, 50) asked for two groups
                    produce two centres at the same point, one group of six
                    and one of nobody, at an inertia of zero, and the fit
                    reports the sizes 6 and 0 rather than failing. Averaging
                    an empty group would produce a centre with no coordinates
                    at all, and every later distance to it would be undefined;
                    the fit leaves such a centre where it was instead and lets
                    the size say what happened.
                  </p>
                </InAModel>
                <KeepInMind>
                  An empty group is worth looking at rather than a bug. It
                  means the start placed a centre badly or k is larger than
                  the people support, and the sizes are where it shows.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Implementation and failure contracts">
                <p>
                  A complete implementation states the number of groups, the
                  seeding rule, how many starts it runs and how it chooses
                  among them, the pass limit and the tolerance that ends a
                  walk, that the distance is squared Euclidean, what it does
                  with an empty group, how a tie in assignment breaks, and
                  which of the labels, centres, inertia, pass count and sizes
                  it returns. Here the defaults are ten starts from a seeding
                  by spread, at most three hundred passes each, stopping when
                  no centre&rsquo;s squared movement exceeds one part in a
                  hundred million, and the fit the playground shows is seeded
                  so the page can quote it.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "no features at all", reason: "refused at the boundary, the same guard every model here shares." },
                    { expression: "a missing or non-finite value", reason: "refused before any centre is placed; a feature must contain only finite values." },
                    { expression: "features of different lengths, or two with one name", reason: "refused by name, at the boundary." },
                    { expression: "one person, one group", reason: "fits, with the centre on that person and an inertia of zero." },
                    { expression: "more groups than people", reason: "refused, since a group would have to be empty from the start; the message names both counts." },
                    { expression: "as many groups as people", reason: "fits, every person a private centre, inertia exactly zero." },
                    { expression: "a constant column", reason: "accepted; the eight with every height set to 150 group by weight alone, inertia 24.0, sizes 4 and 4." },
                    { expression: "identical people, more than one group", reason: "accepted; the seeding falls back to a uniform pick, the spare centre lands on the same point and its group is empty, reported as a size of zero." },
                    { expression: "a person equidistant from two centres", reason: "placed in the lower-numbered group, by one stated rule." },
                    { expression: "k of zero, or a tolerance of zero or less", reason: "refused at construction, before any data is seen." },
                    { expression: "reading the centres or inertia before a fit", reason: "refused by name, with the model's own not-yet-fitted error." },
                    { expression: "new people with the features reordered", reason: "matched by name and accepted; a feature missing, extra or renamed is refused." },
                    { expression: "two long bands, or two crescents", reason: "fitted without complaint and wrongly, since nothing in the objective can notice; documented rather than defended." },
                  ]}
                />
                <p>
                  The last row is the one to remember. The refusals above are
                  all about data the arithmetic cannot process. Data the
                  arithmetic processes happily and describes wrongly is the
                  ordinary case for this method, and the only guard against it
                  is looking at the picture, which is why every section of
                  Part 5 drew one.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            trueFalse(
              "A mixture of two bell-shaped components recovers the two bands, since unlike nearest centre it can describe an elongated group.",
              false,
              "It can describe one and still does not find one here, because it starts from the nearest-centre grouping and only ever climbs, so its answer on the bands is the same cut person for person. On the crescents it does recover the two arcs, which is the difference between a start that is nearly right and one that is wholly wrong.",
            ),
            choice(
              "One stray person at 196 centimetres and 14 kilograms is added to the eight and two groups are asked for. What happens?",
              [
                "The stray joins the tall group and drags its centre from (181, 80) to (184, 66.8)",
                "The stray gets a centre of its own and the two clumps are left where they were",
                "The stray is placed in no group, being far from both centres",
                "The centres do not move, since one person cannot outvote four",
              ],
              0,
              "The inertia goes from 64.0 to 3728.8 and that centre ends thirteen kilograms off the clump it is supposed to mark. At three groups the stray does get a private centre and the other two return to exactly where they were, at 64.0 again. Leaving the stray in no group is what density with a radius of six does, and this method has no way to say that somebody belongs nowhere.",
            ),
            choice(
              "Why can this method not take a choice of distance the way the neighbour pages do?",
              [
                "Keeping the mean as the update and swapping the distance stops the update lowering the objective, so nothing promises the loop will stop",
                "Only Euclidean distance can be evaluated against named features",
                "Manhattan distance has no minimiser to move a centre to",
                "The inertia would then be reported in units that cannot be compared",
              ],
              0,
              "The mean is the exact minimiser of squared Euclidean distance specifically, and under Manhattan the minimiser is the coordinate median instead. Replacing the mean with the median gives a real method with its own name, k-medians, so the metric here follows from the update step rather than being chosen beside it.",
            ),
            trueFalse(
              "Rewriting the crowd’s heights in millimetres makes height alone decide who is near whom, and the two-group fit then splits the crowd by height into 6 and 5.",
              true,
              "Every horizontal gap becomes ten times larger while the vertical gaps stay put, so height alone decides who is near whom, and millimetres split the crowd by height into 6 and 5 where centimetres and metres agree. At three groups it is metres that disagree instead. The inertias cannot be compared across the panels at all, 2952.6 against 155104.7, because they are in different squared units.",
            ),
            several(
              "Which of these hold for a grouping once it is fitted?",
              [
                "A person the fit never saw is placed at the nearest centre and cannot move it",
                "Features are matched by name, so weight then height gives the same answer as height then weight",
                "A person missing the weight is placed by height alone",
                "Six identical people asked for two groups come back with sizes 6 and 0 rather than failing",
              ],
              [0, 1, 3],
              "Nothing is refitted, so the one thing the stray could do while the fit was being made is no longer available, and that is what makes the playground’s shading possible. A missing coordinate is refused, because the distance to a centre cannot be evaluated with one absent. An empty group leaves its centre where it was, since averaging nobody would give a centre with no coordinates and every later distance to it would be undefined.",
            ),
        ],
        },
        {
          title: "Practice. Grouping the People With the Library",
          practice: [
            exercise(
              "Group the eight people and check the centres by hand",
              ["Section 3 says a resting centre is the plain mean of its group and section 4 sums the inertia of the eight people to 64. Fit two groups with the library, seeded with 3 as the playground is, and read the centres, the group sizes, the inertia and the passes to rest off the fitted model.", "Then fit one group and read its inertia, which section 4 gives as 13096.0, the total squared deviation of the eight about their grand mean. Print every centre coordinate to one place and both inertias to one place."],
              `from oop_ml import Feature, KMeans

heights = Feature("height", [118, 120, 122, 124, 178, 180, 182, 184])
weights = Feature("weight", [24, 25, 28, 27, 78, 80, 83, 79])

model = KMeans(n_clusters=2, random_seed=3)
# Fit the model to the two features, print each centre's height and weight,
# the group sizes, the inertia and the passes to rest, then fit one group and
# print its inertia.`,
              `from oop_ml import Feature, KMeans

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
print(f"inertia with one group {one.inertia:.1f}")`,
              `cluster_1 rests at (181.0, 80.0)
cluster_2 rests at (121.0, 26.0)
sizes (4, 4)
inertia 64.0
passes to rest 2
inertia with one group 13096.0`,
              { hints: ["A clusterer takes no target, so fit takes the list of features and nothing else.", "centroids on the fitted model is iterable, one centre per group, and each centre answers coordinate_for a feature name. inertia and iterations_run are properties of the model, and the sizes live on its clustering.", "The group a centre is numbered is an accident of seeding, so the tall clump may come first. What to check is that each centre sits on its clump’s mean."], check: numberCheck("What inertia does the two-group fit report?", 64.0, 0.05, "Within the short clump the height deviations from 121 square to 20 and the weight deviations from 26 to 10, and the tall clump gives 20 and 14, so the total is 64. The one-group fit has to serve both clumps from the grand mean (151, 53) and pays 13096.0, which is the drop the elbow in Part 4 calls unmistakable.") },
            ),
            exercise(
              "Run ten starts on the crowd one at a time",
              ["Section 11 lines up ten single-start fits of the crowd at two groups and finds three different valleys, 2952.6, 3185.9 and 3141.7. Fit the crowd once from each of the seeds 0 to 9 with a single start each, and print every seed’s resting inertia and its passes to rest, which the page does not quote seed by seed.", "Then count the distinct resting values and fit once more with ten starts under seed 0, which is how the playground gets its 2952.6. The library keeps the lowest by a strict comparison, so a later start that only ties an earlier one does not replace it."],
              `from oop_ml import Feature, KMeans

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])

# For each seed from 0 to 9, fit two groups with a single start and print the
# seed, its resting inertia to one place and its passes to rest. Then print how
# many distinct resting values there were, and the inertia of a fit under seed
# 0 that is allowed ten starts.`,
              `from oop_ml import Feature, KMeans

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])

resting = []
for seed in range(10):
    model = KMeans(n_clusters=2, n_initialisations=1, random_seed=seed).fit([heights, weights])
    resting.append(round(model.inertia, 1))
    print(f"seed {seed}: inertia {model.inertia:.1f}, passes to rest {model.iterations_run}")

print(f"distinct resting values {len(set(resting))}")

best = KMeans(n_clusters=2, n_initialisations=10, random_seed=0).fit([heights, weights])
print(f"best of ten starts under seed 0: inertia {best.inertia:.1f}")`,
              `seed 0: inertia 3185.9, passes to rest 5
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
best of ten starts under seed 0: inertia 2952.6`,
              { hints: ["n_initialisations is how many starts one fit runs before keeping the lowest. One start per fit is what makes each seed’s valley visible.", "Each fit is a fresh model, since construction configures and fitting learns, so the loop constructs a new model for every seed.", "A set of the rounded inertias counts the valleys, and the library’s ten-start fit from seed 0 runs exactly the ten starts listed, so its answer is the lowest of them."], check: numberCheck("What inertia does the single start from seed 3 rest at?", 3185.9, 0.05, "Seed 3 is the walk the staircase in section 7 follows, four updates and four assignments down to 3185.9, where one more of the middle people has been pulled into the short group. Five of the ten starts rest at 2952.6, three at 3185.9 and two at 3141.7, and the ten-start fit keeps the lowest, which is why the playground reports 2952.6 and the stepper on seed 3 does not.") },
            ),
            exercise(
              "Add one stray person and watch a centre move",
              ["Section 20 adds a stray at 196 centimetres and 14 kilograms to the eight people and finds the tall centre dragged from (181, 80) to (184, 66.8) at two groups, and the two clumps restored at three groups with the stray given a private centre. Fit both and read the centres and inertias.", "Then ask the density clusterer, with a radius of six and a neighbourhood of two, what it makes of the same nine people. It needs no group count and can leave a person in no group, and section 20 says that is what it does with the stray. Print its labels, where a label of −1 is a person in no group, and how many people it left out."],
              `from oop_ml import DBSCAN, Feature, KMeans

heights = Feature("height", [118, 120, 122, 124, 178, 180, 182, 184, 196])
weights = Feature("weight", [24, 25, 28, 27, 78, 80, 83, 79, 14])

# Fit two groups and three groups under seed 3, printing each fit's centres to
# one place and its inertia to one place. Then fit the density clusterer with
# radius 6 and min_neighbourhood_size 2, and print its labels and how many
# people it left in no group.`,
              `from oop_ml import DBSCAN, Feature, KMeans

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
print(f"people in no group {density.n_noise}")`,
              `2 groups: centres (184.0, 66.8), (121.0, 26.0), inertia 3728.8
3 groups: centres (181.0, 80.0), (121.0, 26.0), (196.0, 14.0), inertia 64.0
density labels [0, 0, 0, 0, 1, 1, 1, 1, -1]
people in no group 1`,
              { hints: ["The same two features fit both group counts, and the stray is the ninth person in each list.", "The density clusterer is constructed with a radius and a min_neighbourhood_size and fitted the same way, with no k. Its labels and n_noise are properties of the fitted model.", "At two groups the stray is nearest the tall centre, joins it, and the update averages them in. At three groups it gets a centre of its own and the other two centres return to the means of their clumps."], check: numberCheck("What inertia does the two-group fit of the nine people report?", 3728.8, 0.05, "The stray joins the tall group and drags its centre thirteen kilograms off the clump it is supposed to mark, and the clump’s four people plus the stray now sit far from a centre that suits none of them, so the inertia rises from 64.0 to 3728.8. At three groups the stray has a private centre and the inertia is 64.0 again. The density clusterer never averages, so it calls the stray a person in no group and leaves the two clumps alone.") },
            ),
            exercise(
              "Rewrite the heights in millimetres",
              ["Section 22 refits the crowd with its heights in millimetres and finds the two-group fit splitting the crowd by height into 6 and 5, where centimetres give 4 and 7. Multiply every height by ten, fit both versions under seed 3, and compare the sizes and the inertias.", "The two inertias cannot be compared with each other at all, since they are in different squared units, and the page gives 155104.7 for millimetres beside 2952.6 for centimetres. Print each fit’s sizes, its labels and its inertia to one place."],
              `from oop_ml import Feature, KMeans

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])
millimetres = Feature("height", [height * 10 for height in heights.values])

# Fit two groups under seed 3 with the heights in centimetres and again with
# the heights in millimetres, and print each fit's sizes, labels and inertia.`,
              `from oop_ml import Feature, KMeans

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])
millimetres = Feature("height", [height * 10 for height in heights.values])

for unit, feature in (("centimetres", heights), ("millimetres", millimetres)):
    model = KMeans(n_clusters=2, random_seed=3).fit([feature, weights])
    labels = [int(label) for label in model.predict([feature, weights])]
    print(f"{unit}: sizes {model.clustering.sizes}, labels {labels}, inertia {model.inertia:.1f}")`,
              `centimetres: sizes (4, 7), labels [0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1], inertia 2952.6
millimetres: sizes (6, 5), labels [1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0], inertia 155104.7`,
              { hints: ["A feature’s values are the numbers it was built from, so a new feature in millimetres is the same name over ten times each value.", "predict on the fitted model gives each person’s group in the order the people were given, and the group numbers are an accident of seeding, so compare which people share a number rather than the numbers themselves.", "Every horizontal gap is ten times larger in millimetres while the vertical gaps stay put, so height alone decides who is near whom."], check: numberCheck("What inertia does the millimetre fit report, to one place?", 155104.7, 0.05, "In millimetres the squared height gaps are a hundred times what they were and the weight gaps are unchanged, so the fit sorts the crowd by height alone, 6 against 5, and its inertia is in squared millimetres, which is why 155104.7 says nothing against 2952.6. Standardise first, or decide deliberately which feature should count for more, since two measurements in different units have no natural common distance.") },
            ),
          ],
        },
      ]}
    />
  );
}
