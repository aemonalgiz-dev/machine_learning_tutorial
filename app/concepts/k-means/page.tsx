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
    "Sort unlabelled people into k groups by repeating two steps, assign everyone to the nearest centre, then move each centre to the mean of its group, and follow what that loop can and cannot find.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KMeansPage() {
  return (
    <ConceptPage
      title="k-Means Clustering"
      tagline="Sort unlabelled data into k groups, with nothing but distance and the mean."
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
      history={
        <>
          <p>
            Every page so far was handed its answers. The regression pages knew
            each person&rsquo;s weight and the classification pages knew who
            was a child, so a fit always had something to be right or wrong
            about. A great deal of data arrives with no answers at all,
            measurements of customers, cells, documents, stars, and the
            question changes character. It stops being how do we predict the
            label and becomes whether the data has natural groups in it at
            all, and if so, where they are.
          </p>
          <p>
            The method on this page was found at least three times. Hugo
            Steinhaus posed it in 1956, in a short note to the Polish Academy
            of Sciences on dividing a material body into parts, asking for
            the division that made the parts&rsquo; moments of inertia about
            their own centres of mass as small as possible in total, which for
            equal unit masses is exactly the quantity this page calls
            inertia. Stuart Lloyd met the same problem at Bell Labs in 1957
            from the other end. Pulse-code modulation has to stand in for a
            continuous signal with a fixed handful of levels, and Lloyd
            asked which levels lose the least in mean squared error. His
            answer was a pair of conditions, each level at the mean of the
            signal values assigned to it and each boundary midway between two
            levels, and a loop that enforced them in turn; it circulated as a
            technical note and was not published until 1982, in the IEEE
            Transactions on Information Theory. Our heights alone, sorted into
            k levels, are his problem in one dimension. Edward Forgy described
            the batch loop for clustering in a 1965 abstract in Biometrics,
            and James MacQueen gave the method its name in 1967 at the Fifth
            Berkeley Symposium, in a paper that updated each centre as every
            observation arrived rather than once per pass. The seeding rule
            Part 3 uses came much later, from David Arthur and Sergei
            Vassilvitskii in 2007, with a proof that choosing the starting
            centres by spread keeps the expected inertia within a factor of
            the best possible that grows only with the logarithm of k.
          </p>
          <p>
            The page asks six questions in order. What does the method compute
            when all it is told is a number k? What is inertia, and why must
            the two-step loop come to rest? Where does it come to rest, and
            why does that depend on where it started? What can k not tell us,
            and what can inertia not choose? Where does the method fail, and
            what does the failure look like on people measured by height and
            weight? And what does a fitted grouping promise about people it
            has never seen?
          </p>
        </>
      }
      playground={<KMeansPlayground />}
      sections={[
        {
          title: "Part 1. Groups Without Labels",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Eight people and no answers">
                <p>
                  Look at what is missing from the box above. Every scatter on
                  this site so far coloured its dots before any model arrived,
                  fails and passes, children and adults. Here every person
                  starts uncoloured, and the colours you see were put there by
                  the method, which was told only how many groups to look for.
                  The eight people it opens on are two tight clumps, four short
                  and light around 121 centimetres and 26 kilograms, four tall
                  and heavy around 181 and 80, and with k set to 2 the method
                  finds exactly those two clumps.
                </p>
                <p>
                  Press the crowd button for the less tidy version, the
                  classification pages&rsquo; eleven people with their labels
                  stripped away, and notice the method still carves confident
                  groups. It always will. Ask for k groups and k groups come
                  back, whether or not the data has any, which is worth
                  keeping in mind through everything that follows, and Part 4
                  returns to it. Drag
                  a dot from one clump toward the other and watch the colours
                  and the X marks renegotiate; the groups are not stored
                  anywhere, they are re-derived from the geometry every time
                  anything moves.
                </p>
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
          ),
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
                <p>
                  The stepper below is the same walk as the staircase, drawn
                  on the plane, with the two halves of each pass taken one at
                  a time. On seed 3 the two starting centres are two of the
                  people, (180, 80) and (159, 57), and the first assignment
                  hands eight people to the second of them and three to the
                  first. Each update drags a centre toward the mean of a group
                  that is still changing, each assignment then moves one more
                  person across, and the two alternate until an update moves
                  no centre and an assignment moves no person.
                </p>
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
          title: "Part 3. Where the Loop Settles",
          content: (
            <>
              <SubSection title="9. A rest is a local minimum, and the start decides which">
                <p>
                  The staircase stopped at 3185.9 and the dashed line sat at
                  2952.6, so the loop rested somewhere that was not the
                  lowest place available. This is the calculus primer&rsquo;s
                  two-valley curve with a different ball. Each step lowers the
                  total, so the walk only ever goes downhill, and downhill
                  from where it started is not the same as the deepest valley
                  there is. Change the seed on the stepper to 1 and the start
                  is (120, 25) and (178, 78), one centre in each clump; the
                  first assignment is already the winning grouping, and one
                  update reaches 2952.6.
                </p>
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
                <p>
                  On the crowd at two groups the ten starts find three
                  different valleys. Five of them rest at 2952.6, which pairs
                  the three short people with the person at (147, 41) against
                  the other seven; three rest at 3185.9, with one more of the
                  middle people, at (145, 57), pulled into the short group;
                  and two rest at 3141.7, the three short people alone
                  against everyone else.
                  The fit the playground shows is the usual
                  ten starts from one seed, and it keeps the lowest by a
                  strict comparison, so a later start that only ties an
                  earlier one does not replace it. At three groups the same
                  ten starts all rest at 501.6 with sizes 3, 5 and 3, which is
                  the three clumps the eye sees, and the only thing that
                  differs between the panels is which clump got which number.
                </p>
                <KeepInMind>
                  Restarts cost k times the seeding and a few passes each, and
                  buy a better chance at the deepest valley. They do not
                  guarantee it, and the gallery&rsquo;s count of distinct
                  resting values is the honest measure of how much the start
                  mattered.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Seeding by spread">
                <p>
                  Choosing the starting centres by picking k people at random
                  is the obvious thing, and it has a real weakness. A dense
                  clump holding most of the people is likely to be handed
                  several centres while a sparse one gets none, and the loop
                  cannot recover from that, since it only ever moves a centre
                  to the middle of the people who already chose it. The
                  seeding the fits here use spreads the start out instead.
                  Pick the first centre uniformly from the people. Then for
                  each remaining centre, find every person&rsquo;s squared
                  distance to the nearest centre already chosen, and pick the
                  next centre from the people with probability in proportion
                  to that squared distance.
                </p>
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
                <p>
                  Restarts repair a bad start. They cannot repair a bad
                  objective, and the two bands on the gallery are the case
                  that separates those. Twenty-two people lie on two parallel
                  bands fourteen kilograms apart, each band far longer than
                  the gap between them, and at two groups every one of the
                  ten starts rests at exactly the same inertia, 4504.4, with
                  eleven people in each group. The grouping they agree on cuts
                  both bands in half by height. It is the deepest valley this
                  objective has on these people, and the eye can see that
                  each band was meant to be one group.
                </p>
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
                <p>
                  What practitioners do is look for the elbow, the k past
                  which the fall flattens, and treat the further gains as
                  bookkeeping rather than structure. On the eight it is
                  unmistakable, since the drop from one group to two is 13032
                  and the next drop is 25. On the crowd it is less so. The
                  fall from one group to two is 7529.6, from two to three
                  another 2451.0, and from three to four only 279.6, and at
                  three groups 4.8 percent of the total scatter is left. Three
                  is the reading I would take, and it is a reading, not a
                  calculation.
                </p>
                <NumberTable
                  headings={["people", "k = 1", "k = 2", "k = 3", "k = 4", "k = 5"]}
                  rows={[
                    ["the eight", "13096.0", "64.0", "39.0", "19.0", "9.0"],
                    ["the crowd", "10482.2", "2952.6", "501.6", "222.0", "92.0"],
                    ["an ideal case", "23590.4", "282.4", "202.9", "128.7", "107.4"],
                    ["two bands", "15738.8", "4504.4", "2417.0", "1670.7", "1394.6"],
                  ]}
                  caption="The two bands have no elbow to find. The share of the total left after each k is 28.6, 15.4, 10.6 and 8.9 percent, a curve that bends nowhere in particular, because no number of round groups describes two long thin ones."
                />
                <KeepInMind>
                  The elbow is a judgement made by a person reading a curve,
                  and on data without round clumps the curve may offer no
                  elbow at all, as the bands&rsquo; shares of 28.6, 15.4, 10.6
                  and 8.9 percent show, falling steadily with no bend to read.
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
                <p>
                  Density asks whether a person sits within ten units of
                  another and follows the chain, and it recovers both bands
                  with nobody left out. Single linkage merges the two groups
                  with the closest pair of members until two remain, and it
                  recovers them too, since each band is a chain of short
                  steps. The mixture of two bell-shaped components can
                  describe an elongated group and still does not find one
                  here, because it starts from the nearest-centre grouping
                  and only ever climbs; its answer is the same cut, person
                  for person. That is recorded elsewhere as measured, and I
                  found the same.
                </p>
                <KeepInMind>
                  Minimising squared distance to a centre finds groups that
                  are round, similarly sized and similarly dense. That is
                  what nearest centre means as a definition of a group, not
                  a failure of the implementation.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Two crescents">
                <p>
                  Two arcs curving around each other are the classic case,
                  because no straight line separates them and their centres
                  sit nearly on top of each other. Switch the gallery to the
                  crescents. The nearest-centre fit rests at 7949.1 with ten
                  in each group and gets both arcs nearly right, then swaps the
                  ends, handing the upper arc&rsquo;s person at (173, 58) to
                  the lower group and the lower arc&rsquo;s person at
                  (148, 46) to the upper. Density and single linkage recover
                  the two arcs exactly, and here the mixture does too, which
                  is worth saying since on the bands it did not; a
                  nearest-centre start that is nearly right can be climbed
                  from, and one that is wholly wrong cannot.
                </p>
                <KeepInMind>
                  A group that bends is invisible to this method at every k.
                  The alternatives that see it ask a local question, whether
                  each person is near some other member, rather than a global
                  one about a centre.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Unequal sizes">
                <p>
                  The objective also prefers groups of similar spread. Put
                  twenty people spread loosely beside five packed tightly just
                  to their right and ask for two groups. The fit cuts the
                  loose twenty by height into fifteen and five, and hands the
                  tight five to the smaller part, for sizes 15 and 10 at an
                  inertia of 2464.6, because cutting the big loose group saves
                  more squared distance than isolating a small tight one. Asking for three
                  groups finally gives the five their own centre, sizes 11, 9
                  and 5, at the price of cutting the loose group in two
                  anyway, and only three of ten starts find that valley,
                  which the seed gallery of section 10 shows under its last
                  button. Switch the gallery above to the unequal sizes and
                  the other three definitions all separate the five at two
                  groups, density because the gap to them is wider than its
                  radius, single linkage because that gap is wider than any
                  step inside either group, and the mixture because it has a
                  spread per component to give the loose group.
                </p>
                <KeepInMind>
                  A small tight group next to a large loose one is a real
                  structure the objective is built to overlook, because a big
                  group&rsquo;s spread is worth more inertia than a small
                  group&rsquo;s separateness.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. One stray person">
                <p>
                  The mean gives a far person a large say, and the objective
                  is built on means. Add one stray person at 196 centimetres
                  and 14 kilograms to the eight and ask for two groups again.
                  The stray is nearest the tall centre, so they join it, and
                  the update drags that centre from (181, 80) to (184, 66.8),
                  thirteen kilograms off the clump it is supposed to mark,
                  while the inertia goes from 64.0 to 3728.8. At three groups
                  the stray gets a private centre and the other two return to
                  exactly where they were, inertia 64.0 again. Density, with a
                  radius of six, calls the stray a person in no group and
                  leaves the two clumps alone.
                </p>
                <KeepInMind>
                  Every person is placed in some group, because a nearest
                  centre always exists, and a stray placed in a group moves
                  that group&rsquo;s centre. The method has no way to say
                  that someone belongs nowhere.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The distance is Euclidean because the update is a mean">
                <p>
                  The neighbour pages let you choose what near means, and it
                  is tempting to ask for the same here, Manhattan distance
                  say, for people measured on scales that should not be
                  squared. The method cannot offer it, and the reason is
                  section 6. The update step is a mean, and the mean is the
                  exact minimiser of squared Euclidean distance specifically.
                  Under Manhattan distance the minimiser is the coordinate
                  median instead, and the widget in section 6 measured the
                  gap, since on the tall four with the stray the Manhattan
                  total is 129.6 at the mean and 93.0 at the median. Keep the mean
                  as the update and swap the distance, and the update step
                  stops lowering the objective, so the convergence argument of
                  section 7 collapses and nothing promises the loop will stop.
                </p>
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
                <p>
                  At two groups, centimetres and metres agree on the grouping
                  and millimetres do not, splitting the crowd by height into
                  6 and 5. At three groups it is metres that disagree, moving
                  the person at (147, 41) into the short clump for sizes 4, 3
                  and 4, while millimetres now agree with centimetres. The
                  inertias are not comparable across the panels at all, 2952.6
                  against 155104.7 at two groups, because they are in different
                  squared units. Standardising each feature by its own spread
                  gives a grouping that agrees with the centimetre one at both
                  k on this crowd, which is a fact about this crowd and not a
                  law; what standardising guarantees is only that neither
                  feature outweighs the other by its unit.
                </p>
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
      ]}
    />
  );
}
