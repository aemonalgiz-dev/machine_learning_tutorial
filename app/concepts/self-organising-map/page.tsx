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
import { EachDecayHeldStill } from "@/components/widgets/EachDecayHeldStill";
import { GridDistanceAgainstDataDistance } from "@/components/widgets/GridDistanceAgainstDataDistance";
import { MapAgainstGrouping } from "@/components/widgets/MapAgainstGrouping";
import { MapFailureTable } from "@/components/widgets/MapFailureTable";
import { OnePresentation } from "@/components/widgets/OnePresentation";
import { ReachAndStepCurves } from "@/components/widgets/ReachAndStepCurves";
import { SeededMapGallery } from "@/components/widgets/SeededMapGallery";
import { SelfOrganisingMapPlayground } from "@/components/widgets/SelfOrganisingMapPlayground";
import { WhatEachCellHolds } from "@/components/widgets/WhatEachCellHolds";

export const metadata: Metadata = pageMetadata("/concepts/self-organising-map", {
  title: "Self-Organizing Maps · Perceptron Lab",
  description:
    "A self-organizing map places representative vectors on a grid. Nearby positions are encouraged to respond to similar observations, giving a spatial summary of data that may have many dimensions.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function SelfOrganisingMapPage() {
  return (
    <ConceptPage
      lessonId="self-organising-map"
      intuition={lessonIntuitions["self-organising-map"]}
      technicalStart="Part 2. One Person, One Presentation"
      openingTitle="A Grouping Is Useful; a Map Can Show More"
      playgroundTitle="Arrange nearby observations on a map"
      playgroundIntro="Follow one example's winning cell and the neighboring cells it updates. Compare their grid positions with the feature values those cells represent."
      title="Self-Organizing Maps"
      tagline={"A self-organizing map places representative vectors on a grid. Nearby positions are encouraged to respond to similar observations, giving a spatial summary of data that may have many dimensions."}
      prerequisites={<>The <Link href="/primers/linear-algebra" className={link}>linear algebra primer</Link> explains vectors and distances. <Link href="/concepts/k-means" className={link}>K-means</Link> introduces representative centers and assignments; this page adds a fixed neighborhood between representatives and compares the resulting updates. The <Link href="/primers/statistics" className={link}>statistics primer</Link> explains averages, which help interpret where representatives move. The local adjustment uses an observation and a representative after the winning grid cell has been identified. For another iterative network update, see the <Link href="/concepts/hopfield-network" className={link}>Hopfield page</Link>.</>}

      playground={<SelfOrganisingMapPlayground />}
      sections={[
        {
          title: "Part 1. Why a Grouping Is Not Yet a Map",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Eleven people and no labels">
                <p>The plot contains eleven people described by height and weight. We supply no category labels. Three observations are short and light, three are tall and heavy, and five lie between them. We want a small map that represents those measurement patterns and places similar representatives near one another.</p>
                <p>

                  K-means gave us a center for each group and assigned observations to those centers. We can compare the centers in measurement space, but the method does not arrange them on a map with a prescribed neighborhood. A self-organizing map adds that arrangement. We will see how neighboring map cells influence one another while they learn.
                </p>
                <KeepInMind>

                  Both methods on this page work on unlabeled measurements. No
                  person here carries an answer, and any color you see was put
                  there by the method rather than read off the data.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a grouping cannot tell you">
                <p>Suppose k-means returns groups numbered 0, 1 and 2. Those IDs identify groups; they do not say which groups resemble one another. The fitted centers do contain measurements we could compare, but the group numbering supplies no neighborhood. A self-organizing map adds an explicit arrangement of neighboring cells.</p>
                <p>

                  You could of course measure afterwards how far apart the three
                  centers landed and rank them yourself. That is a fair thing to
                  do and it is not what a map does. A map fixes the arrangement
                  before it sees any data, as part of the model, and then
                  arranges the answer to fit it.
                </p>
              </SubSection>

              <SubSection title="3. The grid the answer is laid out on">
                <p>Give each cell a fixed place on a small grid and a changeable representative in measurement space. These are two different locations. Cell 1 stays beside cell 2 and two steps from cell 3 on the grid, while its stored height-and-weight vector moves during training. The grid defines which representatives should learn together.</p>
                <p>The fitted four-cell row holds (177.0, 76.8), (160.3, 59.0), (144.1, 46.6) and (123.2, 28.5), in grid order. These are representative vectors, like cluster centers, although their positions need not match a k-means fit. Along this map, height and weight decrease together. A new observation is assigned to its nearest representative and therefore to that representative’s grid position.</p>
                <InAModel title="The claim as one number">
                  <p>For each pair of cells, compare their fixed grid distance with the distance between their learned measurement vectors. Across the six pairs in this four-cell row, the correlation is 0.9902. With neighborhood influence disabled, it is −0.1773 in the comparison fit: much weaker agreement with that grid order. This small comparison illustrates an ordering effect, rather than proving that every winner-only fit has no relationship at all.</p>
                </InAModel>
                <KeepInMind>
                  A map produces a set of prototypes, as a grouping does, and it
                  also produces an arrangement of them that was decided before
                  the data arrived. Everything else on this page is about how
                  the fit makes the prototypes respect that arrangement, and
                  what it costs to do so.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. One Person, One Presentation",
          content: (
            <>
              <SubSection title="4. Compete, cooperate, adapt">
                <p>Initialize the representatives from randomly drawn observations, then present observations one at a time in shuffled passes. Find the representative nearest the current person. That winning cell moves toward the person, and nearby grid cells move too, with an influence that decreases with grid distance. The learning rate controls what fraction of the discrepancy each update removes.</p>
                <Equation>
                  {
                    "winner    = the cell u minimizing ‖person − cell_u‖\nscore_u   = exp( −d(u, winner)² / (2 · reach²) )\ncell_u    ← cell_u + step · score_u · (person − cell_u)"
                  }
                </Equation>
                <p>
                  The letter d in the middle line is a distance counted on the
                  grid, so a cell beside the winner is one away and a cell
                  across a diagonal is the square root of two away. The winner
                  is zero steps from itself, which makes its own score exactly
                  one.
                </p>
                <KeepInMind>

                  After the winning cell is identified, each update uses the observation, the cell’s representative and its fixed grid distance from that winner. Winner selection itself compares all representatives in measurement space. There is no backpropagated target error in this update rule.</KeepInMind>
              </SubSection>

              <SubSection title="5. The winner takes the whole step">
                <p>
                  Take three cells in a row, placed by hand at (120, 30), (150,
                  50) and (180, 70), and show them the person at (156, 53). The
                  middle cell is 6.708 away and the other two are 42.720 and
                  29.411 away, so the middle cell wins. At a step of a half its
                  score of one gives it the full move, which closes half the gap
                  and lands it at (153, 51.5), exactly 3.354 from the person.
                </p>
                <WorkedExample title="The winner, by hand">
                  <Equation>
                    {
                      "gap    = (156, 53) − (150, 50) = (6, 3)\nmove   = 0.5 × 1 × (6, 3) = (3, 1.5)\ncell   = (150, 50) + (3, 1.5) = (153, 51.5)"
                    }
                  </Equation>
                  <p>
                    Its distance from the person went from 6.708 to 3.354, which
                    is exactly half, because the step took exactly half the gap
                    and nothing else touched it.
                  </p>
                </WorkedExample>
              </SubSection>

              <SubSection title="6. The neighbors take a share of it" id="6-the-neighbours-take-a-share-of-it">
                <p>
                  The two cells either side of the winner are one step away on
                  the grid, so at a reach of one cell each of them scores exp of
                  minus a half, which is 0.6065. They move that fraction of the
                  step along their own gaps, and their gaps are much larger,
                  because they started much further from the person.
                </p>
                <Equation>
                  {
                    "gap   = (156, 53) − (120, 30) = (36, 23)\nmove  = 0.5 × 0.6065 × (36, 23) = (10.92, 6.98)\ncell  = (120, 30) + (10.92, 6.98) = (130.92, 36.98)"
                  }
                </Equation>
                <p>The left neighbor moves 12.956 while the winner moves 3.354. Although its neighborhood multiplier is smaller, its initial difference from the observation is much larger. The multiplier scales each cell’s own difference vector, not the winner’s traveled distance.</p>
                <OnePresentation />
                <p>

                  Drag the person and watch which cell wins change. Slide the
                  reach down to zero and the two neighbors stop moving
                  altogether while the winner moves exactly as far as before,
                  which is section 15 in miniature. Slide the step up to one and
                  the winner lands on the person and forgets everything it had
                  learned from anybody else.
                </p>
              </SubSection>

              <SubSection title="7. Everybody ends nearer the person">
                <p>The three distances fall from 42.720, 6.708 and 29.411 to 29.765, 3.354 and 20.492 in this update. Each cell moves along its own line toward the observation. When the effective rate is between zero and one, distance cannot increase. It decreases strictly when the rate and initial difference are nonzero; at zero nothing changes, and at rate one the winner reaches the observation.</p>
                <NumberTable
                  headings={[
                    "cell",
                    "share",
                    "distance before",
                    "distance after",
                    "traveled",
                  ]}
                  rows={[
                    ["(0, 0)", "0.6065", "42.720", "29.765", "12.956"],
                    ["(0, 1), the winner", "1.0000", "6.708", "3.354", "3.354"],
                    ["(0, 2)", "0.6065", "29.411", "20.492", "8.919"],
                  ]}
                  caption="One person, shown once, to three cells at a step of a half and a reach of one cell."
                />
                <WhyThisWorks title="Why it is a step downhill">
                  <p>
                    Write down half the squared distance from one cell to the
                    person and differentiate it with respect to the cell, as the
                    calculus primer does with any squared quantity.
                  </p>
                  <Equation>
                    {
                      "f(cell)      = ½ · ‖person − cell‖²\ndf / d cell  = −(person − cell)"
                    }
                  </Equation>
                  <>
<p>
                    The slope points from the person toward the cell, so stepping against it steps from the cell toward the person, which is exactly the rule with the score and the step as the size of the stride. Each cell is walking downhill on its own squared distance to whichever person is in front of it, scaled by how near it sits to the winner.
                  </p>
                  <p>This implementation fixes the winner metric to Euclidean distance. That matches the squared-distance interpretation of the linear update. Using another metric can be a useful variant, but the winner rule and representative update need to be considered together rather than assuming every choice has the same interpretation.</p>
</>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="8. The distance on the grid is not the distance in the data">
                <p>Finding the winner uses distance in measurement space: compare the person’s height and weight with each stored representative. Sharing the update uses distance on the fixed grid: compare cell positions. The former changes as representatives learn; the latter describes the map’s unchanged neighborhood layout.</p>
                <DerivationTable
                  expressionHeading="quantity"
                  reasonHeading="what it is measured in, and whether it moves"
                  rows={[
                    {
                      expression: "‖person − cell_u‖",
                      reason:
                        "height and weight; changes at every presentation, and decides who wins",
                    },
                    {
                      expression: "d(u, winner)",
                      reason:
                        "steps across the grid; fixed at construction, and decides who follows",
                    },
                  ]}
                />
                <p>If measurement-space distance were used for neighborhood sharing instead of grid distance, the fixed grid would stop controlling that cooperation. Nearby representatives could receive similar updates regardless of whether their map cells are neighbors. That can change the organization or encourage representatives to gather together. The two distances therefore have distinct jobs.</p>
                <KeepInMind>
                  The reach is a fact about the grid, which does not change,
                  rather than about the positions, which the rule is busy
                  changing. That is what stops the cooperation from feeding on
                  itself.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "A map hands back the same kind of prototypes a grouping does. What does it add?",
              [
                "An arrangement of the prototypes fixed before any data arrived, so the order they are stored in means something",
                "Prototypes that sit closer to the people than a grouping’s centers do",
                "A rule that works out how many cells the data needs",
                "A ranking of the groups, measured once the fit has finished",
              ],
              0,
              "A grouping tells you who goes with whom and nothing about how the groups sit relative to one another, since each center was moved only toward the people who chose it. Measuring afterwards how far apart the centers landed and ranking them yourself is a fair thing to do and is not what a map does, because a map fixes the arrangement as part of the model and then arranges the answer to fit it.",
            ),
            trueFalse(
              "The reach and the competition both measure distance in the same units.",
              false,
              "Two distances appear in the rule and they are not the same kind of thing. The competition asks how far a person is from a cell, in centimeters and kilograms, and it changes at every presentation. The cooperation asks how far one cell is from another on the grid, which is counted in cells and never changes at all.",
            ),
            several(
              "Putting the grid distance where the competition’s distance belongs was written down and run. What happened?",
              [
                "The grid stopped mattering, so a row of eight cells and a two by four block fitted identically",
                "The cells collapsed onto one point, since cells that already agree pull each other closer",
                "The fit refused to run at all",
                "Only the winner moved, whatever the reach was set to",
              ],
              [0, 1],
              "The model runs without complaint and reports plausible figures, which is why the two failures had to be found by writing it that way and running it. The reach being a fact about the grid, which does not change, rather than about the positions, which the rule is busy changing, is what stops the cooperation feeding on itself.",
            ),
            choice(
              "The winner at (150, 50) is 6.708 from the person and a neighbor at (120, 30) is 42.720 away. At a step of a half and a reach of one cell, which of the two travels further during that presentation?",
              [
                "The neighbor, 12.956 against the winner’s 3.354",
                "The winner, since its own score is exactly one",
                "They travel the same distance, since the step is the same for both",
                "Neither, since only the winner has a nonzero score",
              ],
              0,
              "The neighbor takes 0.6065 of the step where the winner takes all of it, and still moves further. There is no contradiction, because the share scales a gap rather than a distance, and a cell far from the person has a large gap to take a small share of.",
            ),
            trueFalse(
              "For a learning rate from zero to one and a neighborhood multiplier from zero to one, an updated prototype ends no farther from the current observation than it started.",
              true,
              "The effective update takes a fraction of the vector from the prototype to the current observation. A fraction from zero to one cannot overshoot: zero leaves it unchanged, one reaches the observation, and intermediate fractions move it closer. This statement concerns that one observation; the move can increase its distance from others.",
            ),
        ],
        },
        {
          title: "Part 3. The Reach and the Step, and Why Both Shrink",
          content: (
            <>
              <SubSection title="9. Two numbers falling across the walk">
                <>
<p>This fit decreases both the learning rate and the neighborhood reach across its pass budget. The learning rate follows a geometric schedule from 0.5 to 0.01. It therefore spends a larger fraction of the run making small corrections. Other schedules are possible; these endpoints define the experiment shown here.</p>
                <p>The reach decreases linearly from half the grid’s longest side to 0.25 of a cell. Early updates therefore influence a broad neighborhood, while later updates concentrate near the winner. The linear schedule is one chosen way to make that transition.</p>
</>
                <Equation>
                  {
                    "step(t)   = 0.5 · (0.01 / 0.5)^((t − 1) / (T − 1))\nreach(t)  = r₀ + (0.25 − r₀) · (t − 1) / (T − 1),   r₀ = half the longest side"
                  }
                </Equation>
                <ReachAndStepCurves />
                <p>
                  Both are written against T, the number of passes the run is
                  given, so the epoch slider on the playground does not add
                  passes to the end of a run. It stretches the whole run, every
                  stage of it lasting proportionally longer, which is section
                  14.
                </p>
              </SubSection>

              <SubSection title="10. The reach, counted in cells">
                <p>On a three-by-three grid, the initial reach is 1.5 cells. A side neighbor has multiplier 0.8007 and a diagonal neighbor 0.6412, each applied to its own difference from the current observation. Broad influence encourages neighboring representatives to organize together. At the final reach of 0.25, those multipliers are 0.000335 and about one ten-millionth.</p>
                <NumberTable
                  headings={[
                    "pass",
                    "step",
                    "reach, in cells",
                    "share one cell away",
                    "share across a diagonal",
                  ]}
                  rows={[
                    ["1", "0.5000", "1.500", "0.8007", "0.6412"],
                    ["50", "0.0721", "0.881", "0.5253", "0.2760"],
                    ["100", "0.0100", "0.250", "0.000335", "0.00000011"],
                  ]}
                  caption="A three by three grid over a hundred passes, read off the two curves the fit walks under."
                />
                <p>The endpoint 0.25 was chosen to make influence beyond the winner very weak. A side neighbor’s multiplier is then about one third of a thousandth. It is still nonzero, and the actual displacement also depends on that cell’s difference from the observation. The run approximates winner-focused refinement rather than switching every neighbor off exactly.</p>
              </SubSection>

              <SubSection title="11. The step, as a fraction of the gap">
                <p>The step is a fraction of the difference between a representative and the current observation. A half closes half the gap; a hundredth closes a hundredth. A step of one replaces the winner’s representative with that observation, leaving none of its previous value in this update.</p>
                <p>

                  A fixed step retains the same fraction of each new discrepancy. Its absolute movement still depends on the distance to the current observation. A prototype near one observation can remain far from the next, so a constant learning rate can keep it moving late in training. Reducing the rate reduces that late movement; it does not by itself establish a good arrangement.
                </p>
              </SubSection>

              <SubSection title="12. How many cells still move">
                <>
<p>To make reach easier to inspect, count cells whose neighborhood multiplier is at least 0.001. That is a display threshold for influence, rather than a minimum actual movement. On the shown three-by-three grid, the count is nine for the first eighty-nine passes, five from pass 90 and one from pass 99.</p>
                <p>
                  On a row of six cells it is six, then five from pass 80, three from pass 90 and one at pass 100.
                </p>
</>
                <p>The lower chart in section 9 plots this thresholded influence count. It changes in steps as cells cross the selected coefficient cutoff. Ending at one means only the winner exceeds that cutoff; the Gaussian rule can still give the other cells smaller nonzero updates.</p>
              </SubSection>

              <SubSection title="13. Holding one of them still at a time">
                <p>
                  Two decays, two claims about what they are for, and the way to
                  test them separately is to hold each one still in turn and
                  refit. The people below are eighteen along a gentle arch, the
                  ideal case for a map, since a row of cells can follow a curve
                  and no straight line can. The same eighteen, the same six
                  cells, the same seed, the same hundred passes, four times
                  over.
                </p>
                <EachDecayHeldStill />
                <>
<p>

                  With both shrinking, the map settles, moving 0.2703 on its last pass, describes the people at a mean distance of 7.9669 and arranges itself at 0.9860. Hold the step at a half and the map is still traveling 13.5400 per pass at the end, roughly a fifth of the 74.7 that the settled fit&rsquo;s own six cells span, so it is being dragged a fifth of the way across the map by whoever arrived most recently.
                </p>
                <p>Holding the reach wide gives a small final-pass movement of 0.0278 and a high grid-to-data distance correlation of 0.9979. Yet its six representatives span only 31.2 of the arch rather than 74.7, and mean observation-to-winner distance is 22.7539. The map has settled into a compressed central region, so high ordering correlation alone does not establish that it represents the observations closely.</p>
</>
                <InAModel title="Read Movement Alongside Representation Error">
                  <p>Holding the learning rate fixed gives a smaller mean distance, 6.9227 instead of 7.9669, at the end of these runs. It also leaves a final-pass movement of 13.5400. That fit describes the observed examples more closely by this distance metric at this checkpoint, but has not settled by the movement criterion. Report both rather than calling either one the complete measure of a better map.</p>
                </InAModel>
                <KeepInMind>
                  The shrinking reach is what lets the cells separate and take
                  up their own regions. The shrinking step is what lets the map
                  stop chasing whoever arrived last. Holding either one still
                  costs the thing that one was for, and holding both leaves a
                  map moving 17.9446 per pass and describing its people at
                  21.3833.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. A shorter walk is a different walk">
                <p>
                  Because both curves are written against the pass budget, a run
                  of twenty passes is not the first twenty passes of a run of a
                  hundred. Its tenth pass is already halfway down both curves
                  where the longer run&rsquo;s tenth has barely begun to fall,
                  and its last pass holds exactly the step and the reach the
                  longer run&rsquo;s hundredth holds.
                </p>
                <KeepInMind>
                  Each playground setting starts a fresh fit under the same seed. Changing the pass budget also changes the decay schedule, so a longer-budget result is not a continuation of a shorter run. These fits can be compared as separate outcomes; they should not be presented as consecutive frames of one recorded trajectory.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Winner-Only Updates and Online K-Means", id: "part-4-a-map-with-no-reach-is-the-grouping-method",
          content: (
            <>
              <SubSection title="15. What the rule collapses to">
                <p>
                  Take the reach to zero. The score is then one at the winner
                  and zero everywhere else, so only the winner ever moves, and
                  the whole rule is one line.
                </p>
                <Equation>
                  {"winner ← winner + step · (person − winner)"}
                </Equation>
                <p>Without neighborhood sharing, only the winning representative moves toward the observation. This resembles an online version of k-means. A fixed learning rate gives recent winning observations more influence; it does not generally compute their exact arithmetic mean. Batch k-means instead reassigns the whole dataset and replaces each center with its group mean. The finite procedures can therefore end at different locations.</p>
              </SubSection>

              <SubSection title="16. The same eleven people, both ways">
                <p>
                  So run both on the crowd and compare. Three cells with no
                  reach against three groups, and the two put the same people
                  together, with the furthest-separated pair of prototypes
                  0.0233 apart. The mean distance from a person to their
                  prototype is 5.1887 one way and 5.1912 the other.
                </p>
                <MapAgainstGrouping />
                <p>
                  What they do not agree about is any label. The chain answers 0
                  0 0 0 0 2 2 2 1 1 1 and the grouping method answers 1 1 1 1 1
                  2 2 2 0 0 0, which is the same partition written in different
                  numbers, and it is why the comparison in the readout is about
                  who shares a group rather than about who was given which
                  number.
                </p>
              </SubSection>

              <SubSection title="17. Where the two part company">
                <p>Disabling neighborhood influence still leaves a different update procedure from batch k-means. The map visits one observation at a time under its learning-rate schedule; batch k-means reassigns all observations and recomputes their group means. A finite pass budget can stop either procedure at a different result. The close agreement at three representatives is an outcome of this example, not a guarantee for separated data.</p>
                <p>At four representatives, these two fits assign some people differently. Their farthest matched prototypes are 8.0623 apart. The online fit has mean observation-to-prototype distance 3.5932, compared with 3.6373 for batch k-means. That is a comparison under the displayed mean-distance metric; k-means optimizes squared distances, and neither finite run establishes a general advantage for its method.</p>
                <KeepInMind>
                  With neighborhood influence disabled, the update is a winner-only online clustering rule. It is related to the squared-distance objective of k-means, but its learning-rate schedule and observation order affect the finite result. The same observations can therefore produce different fitted representatives and partitions.</KeepInMind>
              </SubSection>

              <SubSection title="18. What a map will do that a grouping refuses">
                <>
<p>
                  Ask the grouping method for twelve groups over these eleven people and it refuses by name, since a group that nobody chose has no mean to move to. Ask a map for thirty six cells over the same eleven and it fits, and ten of the thirty six win somebody. The other twenty six are not wasted and they are not errors.
                </p>
                <p>Neighborhood updates can place nonwinning cells between representatives that did win training observations. Those cells may provide useful intermediate representatives for later data. Test that behavior rather than assuming every empty training cell will attract a future example.</p>
</>
                <p>Neighborhood sharing also moves cells that have not won an observation. A cell initialized in a crowded region can be influenced by observations won elsewhere through its grid neighbors. This changes the effect of initialization compared with updating winners alone. It does not guarantee that poor starting positions will be repaired.</p>
                <KeepInMind>

                  A cell that won nobody is an ordinary outcome on a map and it
                  is reported rather than hidden. The same request is a refusal
                  for a grouping, and both behaviors are right for what they
                  are computing.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Why can reducing the learning rate late in training help the map's prototypes stabilize?",
              [
                "A prototype can remain far from the next observation even when it is near earlier ones, so a fixed fractional step can keep moving it",
                "Because the gaps themselves get smaller as the map improves",
                "Because the reach is shrinking too, and the two have to stay in proportion",
                "Because a large step would push a cell outside the range of the data",
              ],
              0,
              "The step is a fraction of the current observation-to-prototype gap, so absolute movement depends on that gap. Observations can keep pulling in different directions. A smaller late learning rate reduces those changes, though a small movement alone does not establish a useful map.",
            ),
            several(
              "Eighteen people along an arch, six cells, the same seed and a hundred passes, fitted four times over. Which of these did those runs report?",
              [
                "With both shrinking, the map moved 0.2703 on its last pass and described the people at 7.9669",
                "Holding the step at a half left the map still traveling 13.5400 per pass at the end",
                "Holding the step still gave a mean distance of 6.9227, lower than the settled run’s figure",
                "Holding the reach wide gave the worst arrangement of the four",
              ],
              [0, 1, 2],
              "Holding the reach wide arranged itself better than anything else there, at 0.9979, while describing nobody, since its six cells rest in a knot spanning 31.2 of the arch rather than 74.7 and sit a mean of 22.7539 from their people. The step-held run’s lower mean distance is not the better map either, because a run still traveling 13.5400 per pass is reporting where its cells happened to be when the pass budget ran out, which is why the movement is always printed beside the mean distance.",
            ),
            trueFalse(
              "Sliding the pass budget from twenty up to a hundred continues the shorter run, adding eighty more passes to its end.",
              false,
              "Both schedules are written against the pass budget, so raising it stretches the whole run with every stage lasting proportionally longer. The twenty-pass run is already halfway down both curves at its tenth pass, where the longer run has barely begun to fall, and its last pass holds exactly the step and the reach the longer run’s hundredth holds.",
            ),
            choice(
              "Thirty six cells are fitted to the eleven people and ten of them win somebody. What became of the other twenty six?",
              [
                "They came to rest along the ways between the cells that did win, dragged there by their grid neighbors",
                "They stayed where they started, since nothing ever moved them",
                "They are reported as errors, the way the grouping method refuses twelve groups over eleven people",
                "They collapsed onto the cells that won, so the map holds ten distinct prototypes",
              ],
              0,
              "A prototype can move through neighborhood updates even when it never wins an observation. Unused prototypes are therefore possible when there are many grid cells relative to the dataset. They may become winners for later inputs, but that is not guaranteed. K-means prototypes can also change assignments during fitting, so sharing a starting region does not make their separation impossible.",
            ),
            trueFalse(
              "With the reach switched off, the three-cell chain and k-means put the same people together here, although two groups have different label numbers.",
              true,
              "The chain answers 0 0 0 0 0 2 2 2 1 1 1 where the grouping method answers 1 1 1 1 1 2 2 2 0 0 0, which is the same partition written in different numbers, since nothing in either method ever said which group deserved which number. The prototypes agree closely, the furthest-separated pair sitting 0.0233 apart and the mean distance coming to 5.1887 one way and 5.1912 the other, which is why the comparison in the readout is about who shares a cell. The agreement is not a promise, and at four cells the two methods put different people together, with the furthest prototype pair 8.0623 apart.",
            ),
        ],
        },
        {
          title: "Part 5. What the Finished Map Preserves",
          content: (
            <>
              <SubSection title="19. What each cell holds">
                <p>
                  Here is the finished chain of four over the crowd, drawn
                  twice. On the left is the grid in the arrangement the fit
                  never changed, with the people each cell won written inside
                  it. On the right is where those same four cells actually came
                  to rest among the people.
                </p>
                <WhatEachCellHolds />
                <p>
                  Reading the left panel from one end to the other reads the
                  same order as following the net across the right panel, which
                  is the arrangement claim in a picture. Switch the reach away
                  with the button and the left panel stops reading in any order
                  at all, since the cell holding the three tallest people now
                  sits between a cell holding one of the middling people and the
                  cell holding the three shortest, while the right panel still
                  places every person on a reasonable prototype.
                </p>
              </SubSection>

              <SubSection title="20. Neighboring cells hold similar people" id="20-neighbouring-cells-hold-similar-people">
                <p>
                  Make that measurable. Every pair of cells has two numbers, how
                  many steps apart the two sit on the grid and how far apart
                  they came to rest among the people, and if the map arranged
                  itself the two rise together.
                </p>
                <GridDistanceAgainstDataDistance />
                <p>With neighborhood influence, the six pairwise distances correlate at 0.9902. Without it, the correlation is −0.1773 in this fit, even though its mean representation distance is smaller. This illustrates two different properties: fitting examples closely and arranging representatives consistently with the grid. The small correlation sample does not establish independence or the behavior of every seed.</p>
              </SubSection>

              <SubSection title="21. The grid distance is not the distance between the people">
                <p>

                  Now the qualification the claim is misleading without. Cells
                  that are neighbors hold people who are alike, and it does not
                  follow that a cell two steps away holds people twice as
                  different. On the chain of four the three pairs sitting one
                  step apart came to rest 20.407, 24.364 and 27.717 from each
                  other, so the widest of them is 1.358 times the narrowest for
                  the same reading on the grid. The pair three steps apart rests
                  72.332 from each other, against three times the middle
                  one-step reading, which would be about 73.
                </p>
                <>
<p>
                  A three-by-three grid gives another example of the distortion. Both opposite-corner pairs are 2.83 grid steps apart, but their learned vectors end up 78.831 and 11.344 apart in measurement space. Equal map distances therefore do not mean equal differences between represented observations.
                </p>
                <p>
                  A pair one step apart came to rest 28.622 apart, further than the second of those corner pairs. The closest pair of all, 4.757, sits across a diagonal rather than side by side.
                </p>
</>
                <KeepInMind>
                  The map encourages nearby cells to represent related observations. It does not preserve every original distance, and an unsuccessful fit can distort neighborhoods too. Inspect the fitted representatives before interpreting the grid as an accurate geometric picture of the data.</KeepInMind>
              </SubSection>

              <SubSection title="22. Choosing the Grid Shape" id="22-a-square-grid-over-a-line-has-to-fold">
                <p>These observations vary mainly along one direction. A two-dimensional grid imposes additional neighbor relationships that a one-dimensional chain does not have. In the shown three-by-three fit, some distant map cells represent nearby measurement vectors, and grid-to-data distance correlation is 0.5308 rather than 0.9902. This indicates distortion in this fit; the correlation is not itself an exact measure of a physical fold.</p>
                <GridDistanceAgainstDataDistance
                  gridWidth={3}
                  gridHeight={3}
                  showControl={false}
                />
                <p>Three of the nine cells win no training observations. Grid shape is therefore a modeling choice worth comparing, rather than merely a display setting. A row can suit observations with one dominant variation, while a two-dimensional layout can describe other relationships. The fit and its diagnostics determine whether the chosen layout is useful.</p>
              </SubSection>

              <SubSection title="23. What the arrangement costs">
                <p>
                  The arrangement is paid for and the price is visible. On the
                  chain of four, the arranged map puts every person a mean of
                  5.1435 from their cell and the same chain with the reach taken
                  away puts them 3.5932 away, which is thirty percent closer. On
                  the three by three the two figures are 2.8341 and 0.7117.
                </p>
                <p>While the neighborhood is broad, a representative responds to observations won by nearby cells as well as its own. It can therefore remain between several groups. Later, a smaller learning rate makes further corrections slower. The final representative need not equal the mean of the observations assigned to it.</p>
                <InAModel title="Seen on the two clumps">
                  <p>
                    Draped over the eight people the k-means page summed by
                    hand, whose clump means are the whole numbers (121, 26) and
                    (181, 80), a row of two cells rests at (122.96, 27.77) and
                    (179.05, 78.25). Each one sits on the side of its own
                    clump&rsquo;s mean that faces the other clump, and neither
                    is on its mean. The map moved 0.107 on its last pass and put
                    each person a mean of 3.279 from their cell.
                  </p>
                </InAModel>
                <KeepInMind>
                  In these comparisons, neighborhood influence increases mean representation error while giving the prototypes a useful order. That is a measured tradeoff, not a rule that every map must describe data worse than every clustering fit with the same number of prototypes. Check both representation and organization for the task.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What a Seed Fixes, and What Nothing Fixes",
          content: (
            <>
              <SubSection title="24. The same people from six seeds">
                <p>

                  The seed here decides two things, which people the cells start
                  on and the order the people are shown in on each pass, so a
                  differently seeded fit is genuinely a different walk rather
                  than the same walk relabeled. Here are six of them on the
                  crowd.
                </p>
                <SeededMapGallery />
                <>
<p>
                  All six put the same people together and all six arrange the chain about equally well, correlating between 0.9901 and 0.9904, and describing the people at between 5.1435 and 5.1520. Each of the six is exactly reproducible on its own, since asking the same question twice gives back the identical numbers, and that is what fixing a seed buys; none of the other five reproduces the first.
                </p>
                <p>
                  What varies is the direction, since four of the six lay the chain out with the shortest people at one end and two lay it out the other way round.
                </p>
</>
              </SubSection>

              <SubSection title="25. A label means nothing across fits">
                <p>
                  That reversal is the same warning the grouping method carries,
                  with one extra wrinkle. There, nothing ever told the method
                  which group deserved which number, so two correct fits can
                  agree completely about who goes with whom and disagree about
                  every number. Here, cell 3 is a place as well as a number, and
                  a fit that lays the identical arrangement out backwards has
                  produced the same map read right to left.
                </p>
                <KeepInMind>
                  When comparing independent fits, account for grid reflections or other alignments before comparing numbered cells. Co-assignment measures whether observations stay grouped together. Prototype locations and grid-neighbor relationships provide additional comparisons when the map’s arrangement matters.</KeepInMind>
              </SubSection>

              <SubSection title="26. There is no total the walk lowers">
                <p>A single update moves representatives toward the current observation, but the next observation and winning cell can change. We cannot infer a monotonically decreasing full-dataset objective from that local movement. The displays therefore track movement and representation error directly, rather than presenting every update as guaranteed progress on one fixed loss.</p>
                <p>The largest representative movement in the last pass indicates whether the map is settling. The mean distance from observations to their winning representatives measures how closely it describes the data. A map can settle into an unhelpful arrangement, so neither measurement should be interpreted alone.</p>
                <KeepInMind>
                  When such a fit reports that it converged, it means the cells
                  stopped moving and it does not mean a best answer was reached.
                  Since the step decays toward something small on its own, a
                  settled run is partly the schedule running out rather than the
                  map arriving, which is why the movement is worth reading
                  beside the word.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Specifying the Grid and Its Learning Schedule" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="27. Grid geometry, neighborhood reach and the stopping rule" id="27-what-a-complete-implementation-must-specify">
                <p>To reproduce a self-organizing map, first state its grid: the number and arrangement of cells, and how distance between cells is measured. Next describe how a winning cell and its neighbors move, including the neighborhood shape and how its reach changes during training.</p>
              <p>The run also needs starting cell positions, a learning-rate schedule, the order in which observations are presented and a stopping rule. State whether schedules depend on the pass number or total pass budget. Finally, record the measurement-space distance used to choose a winner and what the returned labels and diagnostics mean. Grid position, fitted feature position and cluster label are different objects.</p>
                <>
<p>

                  This implementation answers all of those. The grid is a rectangle and grid distance is straight-line across it, so a diagonal neighbor is the square root of two away rather than one or two, which is chosen because the reach is stated as a radius, and counting a diagonal as one step would let the same radius reach further across the grid on the diagonal than along a row.
                </p>
                <p>

                  The neighborhood is a bell curve in grid distance. Both schedules are fractions of the pass budget. The cells start on randomly drawn people, the people are reshuffled every pass, and the metric is fixed at straight-line distance for the reason section 7 derives.
                </p>
</>
                <KeepInMind>
                  The fit-level displays compare completed runs at different settings or budgets. The API does not retain a trajectory for those fitted maps. The separate single-observation example shows one controlled update; it should not be confused with frames from a recorded full fit.</KeepInMind>
              </SubSection>

              <SubSection title="28. Empty input, tied winners and a map with too few cells" id="28-the-edges">
                <p>
                  Each row below is a request that was actually made while this
                  page was served, and the sentence beside it is either the
                  refusal&rsquo;s own words or a description of what the fit
                  answered.
                </p>
                <MapFailureTable />
                <>
<p>A fixed broad reach is accepted and, in the displayed experiment, gives low movement and strong ordering correlation but high representation error. That setting is mathematically valid; its usefulness needs the additional measurements. A constant feature is also accepted: if every training value is 60, representatives initialized from those observations stay at 60 on that coordinate, because every update has zero difference there.</p>
                <p>
                  And a query is matched to the fit by column name rather than by position, so the same columns in the other order answer identically while a missing or unknown column is refused.
                </p>
</>
                <>
<p>Rescaling a feature can change which representative is nearest. In this experiment, converting height from centimeters to millimeters leaves the same four groups and changes the ordering correlation from 0.9902 to 0.9892. Height and body weight are strongly related here, so increasing the weight of height in the distance does not change these assignments. The following qualification matters when the columns contain different information.</p>
                <p>The nearly unchanged result here reflects these strongly related columns. It does not establish that units are irrelevant to the method. With differently related measurements, rescaling one column can change the winners and the learned representatives.</p>
</>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            trueFalse(
              "On a fitted map, cells two steps apart on the grid hold people about twice as different as cells one step apart.",
              false,
              "On the chain of four the three pairs sitting one step apart came to rest 20.407, 24.364 and 27.717 from each other, so the widest is 1.358 times the narrowest for the same reading on the grid. What a map preserves is roughly which cells are near which, and not the distances themselves, so reading two steps as twice one step is reading something into the picture that the fit never put there.",
            ),
            choice(
              "The three by three grid over the crowd arranges itself at 0.5308 where the chain of four reaches 0.9902. Why?",
              [
                "These eleven people run essentially along one direction, so a two-dimensional sheet has nowhere to put its second dimension except folded back on itself",
                "Nine cells is too many for eleven people, so three of them won nobody",
                "A diagonal neighbor is counted as two steps, which stretches the grid distances",
                "A square grid starts its cells on randomly drawn people where a chain does not",
              ],
              0,
              "The row and square grid impose different neighborhood structures on the same observations. Here height and weight largely vary together, so a one-dimensional arrangement follows their main pattern more closely by the displayed distance-correlation measure. The lower correlation for the square does not by itself prove a particular fold or isolate its cause. Inspect prototype positions as well as the summary.",
            ),
            several(
              "The arrangement is paid for in how well the map describes the people. Which of these figures does the page report?",
              [
                "On the chain of four, a mean distance of 5.1435 arranged against 3.5932 with the reach taken away",
                "On the three by three, 2.8341 against 0.7117",
                "A map is a worse description of the people than a grouping holding the same number of prototypes, on the same data",
                "A row of two cells over the eight people of the k-means page rests at (122.96, 27.77) and (179.05, 78.25), each on the side of its own clump’s mean that faces the other clump",
              ],
              [0, 1, 2, 3],
              "The cause is in the rule itself. For as long as the reach lasted every cell was dragged toward people its grid neighbors had won, so each ended somewhere between its own people and its neighbors’, and afterwards the step is already too small to walk the rest of the way. The two cells over the eight people, whose clump means are the whole numbers (121, 26) and (181, 80), rest beside those means rather than on them, each pulled toward the other clump, and that map moved 0.107 on its last pass while putting each person a mean of 3.279 from their cell.",
            ),
            choice(
              "Six differently seeded fits of the chain on the crowd. What varied between them?",
              [
                "The direction, since four laid the chain out with the shortest people at one end and two laid it out the other way round",
                "Which people shared a cell",
                "How well the chain arranged itself, which ranged from 0.53 to 0.99",
                "Whether the run settled at all",
              ],
              0,
              "All six put the same people together, arranged the chain between 0.9901 and 0.9904 and described the people at between 5.1435 and 5.1520. Each is exactly reproducible on its own and none of the other five reproduces the first, which is what fixing a seed buys. A fit laying the identical arrangement out backwards is the same map read right to left, so compare two fits by which people share a cell and state the arrangement as a relationship between distances.",
            ),
            trueFalse(
              "Rewriting the crowd’s heights in millimeters left the same four cells winning the same people, with the arrangement moving only from 0.9902 to 0.9892.",
              true,
              "On this dataset, height and weight vary together strongly enough that rescaling height leaves the winning groups unchanged. That is a result of this comparison, not evidence that the distance rule is unit-invariant. Rescaling a feature can change distances and winners on other data, so choose units or standardization deliberately.",
            ),
        ],
        },
        {
          title: "Practice. Draping a Chain Over the Crowd With the Library",
          practice: [
            exercise("Drape the chain of four over the crowd",["Fit four prototypes arranged in one row to the supplied height-and-weight observations. Use 100 passes and seed 3. Let the neighborhood radius decrease from 2.0 grid cells to 0.25; keep the default learning-rate schedule.", "Print each prototype’s final height and weight, then the winning prototype for each person in the original observation order. Also print the largest prototype movement during the final pass. Use that last measurement to check whether the run was still moving when its pass budget ended."],`from oop_ml import Feature, LinearDecaySchedule, SelfOrganisingMap

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
crowd = [Feature("height", heights), Feature("weight", weights)]

# Construct a map of four cells in one row with the reach falling from 2.0 to
# 0.25 over a hundred passes from seed 3, fit it to the crowd, then print where
# each cell rests, which cell won each person, and the last pass's movement.`,`from oop_ml import Feature, LinearDecaySchedule, SelfOrganisingMap

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
crowd = [Feature("height", heights), Feature("weight", weights)]

chain = SelfOrganisingMap(
    grid_width=4,
    grid_height=1,
    neighbourhood_radius=LinearDecaySchedule(start=2.0, end=0.25),
    max_epochs=100,
    random_seed=3,
)
chain.fit(crowd)

for unit in chain.units:
    print(f"cell {unit.position.column + 1} rests at ({unit.weight_for('height'):.1f}, {unit.weight_for('weight'):.1f})")
winners = [int(value) + 1 for value in chain.predict(crowd)]
print(f"cell won by each person {winners}")
print(f"passes run {chain.epochs_run}, furthest cell moved {chain.final_epoch_movement:.4f} on the last pass")`,`cell 1 rests at (177.0, 76.8)
cell 2 rests at (160.3, 59.0)
cell 3 rests at (144.1, 46.6)
cell 4 rests at (123.2, 28.5)
cell won by each person [3, 2, 3, 2, 2, 4, 4, 4, 1, 1, 1]
passes run 100, furthest cell moved 0.1496 on the last pass`,{...{ hints: ["The reach has to be named, because the library cannot know how large the grid is. Part 3 says it falls in a straight line from half the grid’s longest side to a quarter of a cell, which for a row of four is a LinearDecaySchedule from 2.0 to 0.25. The step’s geometric fall from a half to a hundredth is the default and need not be passed.", "units iterates the cells in grid order. Each one has a position with a row and a column, and weight_for reads its resting value along a named feature.", "predict answers the index of the cell that won each person, counting from zero in the same order units iterates, so adding one makes the labels match the cell numbers printed.", "epochs_run and final_epoch_movement are properties of the fitted map, the second being the furthest any cell moved during the last pass."], check: numberCheck("How far did the furthest-moving cell travel during the last pass?", 0.1496, 0.0001, "A small final movement can reflect the shrinking learning-rate schedule as well as proximity to a stable arrangement. Read it alongside the distance from observations to their selected prototypes.") },question:"Where do the map's prototypes finish, and are they still moving?"}),
            exercise("Measure the arrangement, then take the reach away",["Fit the same four-prototype map twice: once with the shrinking neighborhood from the previous challenge, and once with radius zero throughout. Radius zero updates only the winning prototype. For every pair, print their grid distance and their distance in the height-and-weight coordinates.", "For each fit, also calculate the mean distance from every observation to its winning prototype. Compare that nearest-prototype fit with the relationship between grid and feature distances. Does a more orderly grid necessarily put each prototype closer to its assigned observations?"],`from math import hypot

from oop_ml import ConstantSchedule, Feature, LinearDecaySchedule, SelfOrganisingMap

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
crowd = [Feature("height", heights), Feature("weight", weights)]
reaches = {"with the reach": LinearDecaySchedule(start=2.0, end=0.25), "reach taken away": ConstantSchedule(value=0.0)}

for name, reach in reaches.items():
    chain = SelfOrganisingMap(grid_width=4, grid_height=1, neighbourhood_radius=reach, max_epochs=100, random_seed=3).fit(crowd)
    units = list(chain.units)
    print(name)
    # For every pair of cells print the grid distance and the resting distance,
    # then print the mean distance from each person to the cell that won them.`,`from math import hypot

from oop_ml import ConstantSchedule, Feature, LinearDecaySchedule, SelfOrganisingMap

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
crowd = [Feature("height", heights), Feature("weight", weights)]
reaches = {"with the reach": LinearDecaySchedule(start=2.0, end=0.25), "reach taken away": ConstantSchedule(value=0.0)}

for name, reach in reaches.items():
    chain = SelfOrganisingMap(grid_width=4, grid_height=1, neighbourhood_radius=reach, max_epochs=100, random_seed=3).fit(crowd)
    units = list(chain.units)
    print(name)
    for first in range(4):
        for second in range(first + 1, 4):
            steps = units[first].position.distance_to(units[second].position)
            apart = hypot(units[first].weight_for("height") - units[second].weight_for("height"), units[first].weight_for("weight") - units[second].weight_for("weight"))
            print(f"  cells {first + 1} and {second + 1} sit {steps:.0f} apart on the grid and rest {apart:.3f} apart")
    winners = [int(value) for value in chain.predict(crowd)]
    distances = [hypot(height - units[winner].weight_for("height"), weight - units[winner].weight_for("weight")) for height, weight, winner in zip(heights, weights, winners)]
    print(f"  mean distance from a person to their cell {sum(distances) / len(distances):.4f}")`,`with the reach
  cells 1 and 2 sit 1 apart on the grid and rest 24.364 apart
  cells 1 and 3 sit 2 apart on the grid and rest 44.620 apart
  cells 1 and 4 sit 3 apart on the grid and rest 72.332 apart
  cells 2 and 3 sit 1 apart on the grid and rest 20.407 apart
  cells 2 and 4 sit 2 apart on the grid and rest 48.101 apart
  cells 3 and 4 sit 1 apart on the grid and rest 27.717 apart
  mean distance from a person to their cell 5.1435
reach taken away
  cells 1 and 2 sit 1 apart on the grid and rest 18.123 apart
  cells 1 and 3 sit 2 apart on the grid and rest 34.063 apart
  cells 1 and 4 sit 3 apart on the grid and rest 47.364 apart
  cells 2 and 3 sit 1 apart on the grid and rest 51.558 apart
  cells 2 and 4 sit 2 apart on the grid and rest 31.051 apart
  cells 3 and 4 sit 1 apart on the grid and rest 81.417 apart
  mean distance from a person to their cell 3.5932`,{...{ hints: ["ConstantSchedule(value=0.0) is a reach that is zero for the whole run, which is how Part 4 switches the cooperation off and leaves only the winner moving.", "A cell’s position has distance_to, which counts steps on the grid between two positions, and the resting distance is the straight-line gap between the two cells’ heights and weights, which hypot gives from the two differences.", "The mean distance pairs each person with the cell predict names for them, takes the straight-line gap to that cell’s resting height and weight, and averages the eleven gaps."], check: numberCheck("What mean distance from a person to their cell does the chain with the reach taken away report?", 3.5932, 0.0001, "Neighborhood updates encourage neighboring grid cells to remain related, at a cost to this nearest-prototype fit. Removing that constraint gives a lower mean distance here without preserving the same grid arrangement.") },question:"Does preserving grid neighborhoods improve the nearest-prototype fit?"}),
            exercise("Hold each decay still on the arch",["The supplied observations follow an arch. Fit six prototypes in a row under four schedule combinations: both schedules shrink, only the neighborhood shrinks, only the learning rate shrinks, and neither shrinks. Keep the seed and 100-pass budget fixed.", "For each run, print the largest prototype movement in the final pass, the mean observation-to-winner distance, and the range of prototype heights. Together these show whether the prototypes cover the arch, remain near observations, and have stopped moving substantially."],`from math import hypot

from oop_ml import ConstantSchedule, ExponentialDecaySchedule, Feature, LinearDecaySchedule, SelfOrganisingMap

heights = [108, 110, 112, 116, 120, 126, 132, 138, 147, 153, 160, 168, 176, 180, 187, 188, 192, 193]
weights = [30, 39, 51, 57, 68, 71, 79, 80, 85, 82, 82, 76, 75, 65, 60, 48, 41, 30]
arch = [Feature("height", heights), Feature("weight", weights)]
shrinking_step = ExponentialDecaySchedule(start=0.5, end=0.01)
shrinking_reach = LinearDecaySchedule(start=3.0, end=0.25)
held_step = ConstantSchedule(value=0.5)
held_reach = ConstantSchedule(value=3.0)
runs = {
    "both shrink": (shrinking_step, shrinking_reach),
    "the step held at a half": (held_step, shrinking_reach),
    "the reach held wide": (shrinking_step, held_reach),
    "neither shrinks": (held_step, held_reach),
}

for name, (step, reach) in runs.items():
    # Fit six cells in a row to the arch under this step and reach, then print
    # the last pass's movement, the mean distance to a cell, and the cells' span.
    pass`,`from math import hypot

from oop_ml import ConstantSchedule, ExponentialDecaySchedule, Feature, LinearDecaySchedule, SelfOrganisingMap

heights = [108, 110, 112, 116, 120, 126, 132, 138, 147, 153, 160, 168, 176, 180, 187, 188, 192, 193]
weights = [30, 39, 51, 57, 68, 71, 79, 80, 85, 82, 82, 76, 75, 65, 60, 48, 41, 30]
arch = [Feature("height", heights), Feature("weight", weights)]
shrinking_step = ExponentialDecaySchedule(start=0.5, end=0.01)
shrinking_reach = LinearDecaySchedule(start=3.0, end=0.25)
held_step = ConstantSchedule(value=0.5)
held_reach = ConstantSchedule(value=3.0)
runs = {
    "both shrink": (shrinking_step, shrinking_reach),
    "the step held at a half": (held_step, shrinking_reach),
    "the reach held wide": (shrinking_step, held_reach),
    "neither shrinks": (held_step, held_reach),
}

for name, (step, reach) in runs.items():
    chain = SelfOrganisingMap(grid_width=6, grid_height=1, learning_rate=step, neighbourhood_radius=reach, max_epochs=100, random_seed=3).fit(arch)
    units = list(chain.units)
    winners = [int(value) for value in chain.predict(arch)]
    distances = [hypot(height - units[winner].weight_for("height"), weight - units[winner].weight_for("weight")) for height, weight, winner in zip(heights, weights, winners)]
    span = max(unit.weight_for("height") for unit in units) - min(unit.weight_for("height") for unit in units)
    print(f"{name}: moved {chain.final_epoch_movement:.4f} on the last pass, mean distance {sum(distances) / len(distances):.4f}, cells span {span:.1f}")`,`both shrink: moved 0.2703 on the last pass, mean distance 7.9669, cells span 74.7
the step held at a half: moved 13.5400 on the last pass, mean distance 6.9227, cells span 82.0
the reach held wide: moved 0.0278 on the last pass, mean distance 22.7539, cells span 31.2
neither shrinks: moved 17.9446 on the last pass, mean distance 21.3833, cells span 34.1`,{...{ hints: ["Both schedules are fields of the map, learning_rate for the step and neighbourhood_radius for the reach. ExponentialDecaySchedule and LinearDecaySchedule take a start and an end, and ConstantSchedule holds one value for the whole run.", "On a row of six the reach starts at three cells, half the longest side, so a held reach is a constant three and a shrinking one runs from three to a quarter.", "The last pass’s movement is final_epoch_movement, the mean distance is the same calculation as the previous problem, and the span is the gap between the largest and smallest resting height among the six cells."], check: numberCheck("How far was the map still traveling per pass with the step held at a half?", 13.54, 0.0001, "A fixed half-gap learning rate retains the same fraction of each new discrepancy; its absolute movement still depends on that discrepancy. Late observations can continue moving prototypes substantially, so a lower distance at the last pass is not evidence that this schedule converged.") },question:"What happens when the learning-rate or neighborhood schedule stops shrinking?"}),
            exercise("Switch the reach off and compare with the grouping method",["Set the map’s neighborhood radius to zero so only each observation’s winner updates. Fit three prototypes, then fit KMeans with three groups to the same observations. Use seed 3 for both and print each model’s labels in observation order.", "Compare which observations share a label, rather than expecting the label numbers to match. For this dataset, sorting both sets of prototypes by height pairs the corresponding groups. Print those pairs and their largest distance apart. This checks how closely the two finite training procedures agree here."],`from math import hypot

from oop_ml import ConstantSchedule, Feature, KMeans, SelfOrganisingMap

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
crowd = [Feature("height", heights), Feature("weight", weights)]

chain = SelfOrganisingMap(grid_width=3, grid_height=1, neighbourhood_radius=ConstantSchedule(value=0.0), max_epochs=100, random_seed=3).fit(crowd)
grouping = KMeans(n_clusters=3, random_seed=3).fit(crowd)
# Print both labellings, then pair each cell with a centre by sorting both by
# height, print each pair, and print the largest gap between a cell and its centre.`,`from math import hypot

from oop_ml import ConstantSchedule, Feature, KMeans, SelfOrganisingMap

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
crowd = [Feature("height", heights), Feature("weight", weights)]

chain = SelfOrganisingMap(grid_width=3, grid_height=1, neighbourhood_radius=ConstantSchedule(value=0.0), max_epochs=100, random_seed=3).fit(crowd)
grouping = KMeans(n_clusters=3, random_seed=3).fit(crowd)

print(f"chain labels    {[int(value) for value in chain.predict(crowd)]}")
print(f"grouping labels {[int(value) for value in grouping.predict(crowd)]}")
cells = sorted((unit.weight_for("height"), unit.weight_for("weight")) for unit in chain.units)
centres = sorted((centroid.coordinate_for("height"), centroid.coordinate_for("weight")) for centroid in grouping.centroids)
gaps = []
for (cell_height, cell_weight), (centre_height, centre_weight) in zip(cells, centres):
    gaps.append(hypot(cell_height - centre_height, cell_weight - centre_weight))
    print(f"cell ({cell_height:.4f}, {cell_weight:.4f}) beside centre ({centre_height:.4f}, {centre_weight:.4f})")
print(f"furthest-separated pair {max(gaps):.4f} apart")`,`chain labels    [0, 0, 0, 0, 0, 2, 2, 2, 1, 1, 1]
grouping labels [1, 1, 1, 1, 1, 2, 2, 2, 0, 0, 0]
cell (119.9996, 25.6656) beside centre (120.0000, 25.6667)
cell (153.8233, 53.7996) beside centre (153.8000, 53.8000)
cell (180.3333, 80.3333) beside centre (180.3333, 80.3333)
furthest-separated pair 0.0233 apart`,{...{ hints: ["A reach held at zero is ConstantSchedule(value=0.0), and the grouping method is KMeans with n_clusters set to the same three as the chain has cells.", "Both models answer predict with one label per person. Compare which people share a label rather than the labels themselves, since nothing ever told either method which group deserved which number.", "The map’s cells are read through units and weight_for, and the grouping method’s centers through centroids and coordinate_for. Sorting both lists of pairs by height lines the three up."], check: numberCheck("How far apart are the furthest-separated cell and center?", 0.0233, 0.0001, "With zero neighborhood radius only the winning prototype moves, resembling online k-means. The groups happen to agree closely here; fixed fractional updates and finite training do not guarantee the exact batch means or the same partition.") },question:"How close is winner-only map training to the fitted k-means groups?"}),
          ],
        },
      ]}
    />
  );
}
