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
import { EachDecayHeldStill } from "@/components/widgets/EachDecayHeldStill";
import { GridDistanceAgainstDataDistance } from "@/components/widgets/GridDistanceAgainstDataDistance";
import { MapAgainstGrouping } from "@/components/widgets/MapAgainstGrouping";
import { MapFailureTable } from "@/components/widgets/MapFailureTable";
import { OnePresentation } from "@/components/widgets/OnePresentation";
import { ReachAndStepCurves } from "@/components/widgets/ReachAndStepCurves";
import { SeededMapGallery } from "@/components/widgets/SeededMapGallery";
import { SelfOrganisingMapPlayground } from "@/components/widgets/SelfOrganisingMapPlayground";
import { WhatEachCellHolds } from "@/components/widgets/WhatEachCellHolds";

export const metadata: Metadata = {
  title: "Self-Organising Maps · oop_ml",
  description:
    "Lay a small grid over unlabelled people and let each person pull the nearest cell and its grid neighbours toward them, so that when the grid settles, cells that are neighbours hold people who are alike.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function SelfOrganisingMapPage() {
  return (
    <ConceptPage
      title="Self-Organising Maps"
      tagline="Lay a grid over the people and let every person pull the nearest cell and its neighbours toward them, until the grid is a chart of the crowd."
      prerequisites={
        <>
          Which cell is nearest is the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>
          &rsquo;s distance, and where a cell comes to rest is the{" "}
          <Link href="/primers/statistics" className={link}>
            statistics primer
          </Link>
          &rsquo;s mean, arrived at one person at a time. Read the{" "}
          <Link href="/concepts/k-means" className={link}>
            k-means page
          </Link>{" "}
          first, since this page spends four of its parts saying what a grid
          adds to that loop and one part showing that with the grid switched off
          the two methods are the same method. The rule that moves a cell is
          local in the sense the{" "}
          <Link href="/concepts/hopfield-network" className={link}>
            Hopfield page
          </Link>{" "}
          gave the word, each cell reading only the person in front of it and
          its own place on the grid.
        </>
      }
      history={
        <>
          <p>
            The surface of the brain is covered in maps, and nobody lays them
            out. Wilder Penfield, operating on conscious epilepsy patients at
            the Montreal Neurological Institute through the 1930s, stimulated
            points along the cortex and asked what the patient felt; with Edwin
            Boldrey he published the result in Brain in 1937, a distorted but
            orderly drawing of the body across the tissue, in which neighbouring
            patches of skin are served by neighbouring patches of cortex. David
            Hubel and Torsten Wiesel, recording from single cells in the visual
            cortex of cats at Harvard from 1959, found the same orderliness in a
            quantity nobody had thought of as a place. A cell responds best to
            an edge at one angle, the cell beside it prefers the next angle
            along, and the preference sweeps smoothly across the sheet. No
            signal ever told a cell which angle it should prefer or which of its
            neighbours it should agree with, so the ordering has to be produced
            by the sheet itself out of whatever it was shown, and that was the
            problem.
          </p>
          <p>
            Christoph von der Malsburg gave an answer in Kybernetik in 1973,
            simulating a sheet of cells that competed to respond to a stimulus
            and, when one of them won, strengthened its neighbours along with
            it; orientation preferences arranged themselves across his sheet in
            the order Hubel and Wiesel had recorded. With David Willshaw he
            showed in 1976, in the Proceedings of the Royal Society, that the
            same two ingredients would wire a retina onto a sheet in the right
            order. Both models carried explicit lateral connections between
            cells and a normalisation step to stop the weights running away.
            Teuvo Kohonen, at Helsinki University of Technology, published in
            Biological Cybernetics in 1982 the observation that neither was
            needed. Find the cell whose weights are nearest what was presented,
            move it and every cell within a given number of steps of it on the
            grid toward that input, and shrink both the step and the number of
            steps as the run goes on, and the ordering appears anyway. That is
            the whole algorithm, and it is short enough to state in a paragraph.
          </p>
          <p>
            Kohonen&rsquo;s own demonstrations were not of bodies or of edges.
            His 1988 phonetic typewriter laid the short-time spectra of spoken
            Finnish across such a grid, so that the sounds of a word traced a
            path over it and neighbouring cells answered to sounds a listener
            would call similar, and the method has been used since to chart
            documents, gene expression and customers, wherever somebody wanted
            to see the shape of a table that carried no labels. This page asks
            six questions in order. What does a map answer that a grouping does
            not? What does one person, shown once, do to the grid? How do the
            reach and the step shrink, and what does each of them do on its own?
            How does this relate to the grouping method you already know? What
            does the finished map preserve, and what does it not? And what must
            an implementation of it state, and what does this one refuse?
          </p>
        </>
      }
      playground={<SelfOrganisingMapPlayground />}
      sections={[
        {
          title: "Part 1. Why a Grouping Is Not Yet a Map",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Eleven people and no labels">
                <p>
                  The crowd in the box above is eleven people measured twice
                  over, once for height in centimetres and once for weight in
                  kilograms, with whatever else was known about them thrown
                  away. Three of them are short and light, three are tall and
                  heavy, and five sit in between. Nothing here is a question
                  with an answer to be predicted, so the only thing that can be
                  found is whatever structure the two columns already have.
                </p>
                <p>
                  The k-means page took a crowd like this one and sorted it into
                  a fixed number of groups, each group described by one point
                  that is the average of its members. That answer is useful and
                  it is incomplete in a particular way. It tells you who goes
                  with whom, and it tells you nothing at all about how the
                  groups sit relative to one another.
                </p>
                <KeepInMind>
                  Both methods on this page work on unlabelled measurements. No
                  person here carries an answer, and any colour you see was put
                  there by the method rather than read off the data.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a grouping cannot tell you">
                <p>
                  Suppose the grouping method hands back three groups numbered
                  0, 1 and 2. Is group 0 more like group 1 than it is like group
                  2? The numbers cannot say. Nothing in the method ever compared
                  one group with another; each centre was moved only toward the
                  people who chose it, and the numbering came from whichever
                  order the starting centres happened to be drawn in. Run the
                  same fit from a different seed and the same three groups come
                  back wearing different numbers.
                </p>
                <p>
                  You could of course measure afterwards how far apart the three
                  centres landed and rank them yourself. That is a fair thing to
                  do and it is not what a map does. A map fixes the arrangement
                  before it sees any data, as part of the model, and then
                  arranges the answer to fit it.
                </p>
              </SubSection>

              <SubSection title="3. The grid the answer is laid out on">
                <p>
                  So fix a small grid, say a row of four squares, and give each
                  square a position in the height and weight plane. Call each
                  square a cell. The grid never changes during the fit, so cell
                  1 is beside cell 2 and two steps from cell 3 for the whole
                  run, whatever those cells are doing among the people. What the
                  fit moves is where each cell sits in the plane.
                </p>
                <p>
                  Fitted to the crowd, the four cells come to rest at (177.0,
                  76.8), (160.3, 59.0), (144.1, 46.6) and (123.2, 28.5), reading
                  along the row. Those are the same four prototypes a grouping
                  would produce, except that this time the order they are stored
                  in means something. Reading along the grid reads down through
                  the crowd from the tallest and heaviest to the shortest and
                  lightest, and a fifth person handed to the finished model
                  would land somewhere on that row rather than in a group with
                  no neighbours.
                </p>
                <InAModel title="The claim as one number">
                  <p>
                    Take every pair of cells and write down two things about it,
                    how many steps apart the two sit on the grid, and how far
                    apart they came to rest among the people. On the chain of
                    four over the crowd those two quantities correlate at
                    0.9902. Refit the same four cells with the reach switched
                    off, which is section 15, and the same measurement gives
                    &minus;0.1773, which is no relationship and a different
                    absence of one at every seed.
                  </p>
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
          ),
        },
        {
          title: "Part 2. One Person, One Presentation",
          content: (
            <>
              <SubSection title="4. Compete, cooperate, adapt">
                <p>
                  Start every cell somewhere sensible, on a randomly drawn
                  person, and then show the people one at a time, in a fresh
                  shuffled order each pass through the data. For each person,
                  three things happen. First the cells compete, and the one
                  nearest the person wins. Then they cooperate, and every cell
                  is given a score for how near it sits to the winner on the
                  grid. Then they all adapt, each moving toward the person by
                  its score times a fraction called the step.
                </p>
                <Equation>
                  {
                    "winner    = the cell u minimising ‖person − cell_u‖\nscore_u   = exp( −d(u, winner)² / (2 · reach²) )\ncell_u    ← cell_u + step · score_u · (person − cell_u)"
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
                  Nothing in that rule reaches outside the cell it is updating.
                  A cell needs the person in front of it, its own current
                  position, and how far it sits from the winner on a grid that
                  was fixed before any data arrived. There is no error
                  travelling backward from anywhere, because there is no target
                  to compute an error against.
                </KeepInMind>
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

              <SubSection title="6. The neighbours take a share of it">
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
                <p>
                  So the left cell travelled 12.956 where the winner travelled
                  3.354, and it took the smaller share of the step. There is no
                  contradiction in that, since the share scales a gap rather
                  than a distance, and a cell far from the person has a large
                  gap to take a small share of.
                </p>
                <OnePresentation />
                <p>
                  Drag the person and watch which cell wins change. Slide the
                  reach down to zero and the two neighbours stop moving
                  altogether while the winner moves exactly as far as before,
                  which is section 15 in miniature. Slide the step up to one and
                  the winner lands on the person and forgets everything it had
                  learned from anybody else.
                </p>
              </SubSection>

              <SubSection title="7. Everybody ends nearer the person">
                <p>
                  The three distances before the presentation are 42.720, 6.708
                  and 29.411, and after it they are 29.765, 3.354 and 20.492.
                  Every cell is nearer the person than it was, and that holds
                  for any step between zero and one, because the move is along
                  the straight line from the cell to the person and stops short
                  of arriving.
                </p>
                <NumberTable
                  headings={[
                    "cell",
                    "share",
                    "distance before",
                    "distance after",
                    "travelled",
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
                  <p>
                    The slope points from the person toward the cell, so
                    stepping against it steps from the cell toward the person,
                    which is exactly the rule with the score and the step as the
                    size of the stride. Each cell is walking downhill on its own
                    squared distance to whichever person is in front of it,
                    scaled by how near it sits to the winner. That is also the
                    reason the metric is not a setting to be chosen here. Under
                    a different measure of distance the slope is a different
                    expression, and swapping the measure changes the rule rather
                    than the ruler.
                  </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="8. The distance on the grid is not the distance in the data">
                <p>
                  Two distances appear in the rule and they are not the same
                  kind of thing. The competition asks how far a person is from a
                  cell, which is measured in centimetres and kilograms and
                  changes at every presentation. The cooperation asks how far
                  one cell is from another on the grid, which is measured in
                  cells and never changes at all.
                </p>
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
                <p>
                  Putting the second quantity where the first belongs gives a
                  model that runs without complaint and reports plausible
                  figures, and two things then go wrong that were found by
                  writing it that way and running it. The grid stops mattering,
                  so a row of eight cells and a two by four block fit
                  identically. And the cells collapse onto one point, because
                  cells that already agree pull each other closer, which makes
                  them agree more.
                </p>
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
          title: "Part 3. The Reach and the Step, and Why Both Shrink",
          content: (
            <>
              <SubSection title="9. Two numbers falling across the walk">
                <p>
                  So far the step and the reach have been two fixed numbers. In
                  a real fit both of them fall as the run goes on, and neither
                  falls the same way. The step falls geometrically, from a half
                  to a hundredth, because what matters about a step is its order
                  of magnitude and a geometric fall spends most of the run at
                  small values. The reach falls in a straight line, from half
                  the grid&rsquo;s longest side down to a quarter of a cell,
                  because a reach is counted in cells and the middle of the run
                  should be the middle of its range.
                </p>
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
                <p>
                  On a three by three grid the reach begins at 1.5 cells. A cell
                  one step from the winner then takes 0.8007 of the
                  winner&rsquo;s move and a cell across a diagonal takes 0.6412,
                  so almost the whole grid travels together and the arrangement
                  is settled early, while every cell is still being dragged by
                  everybody else&rsquo;s people. By the last pass the reach is a
                  quarter of a cell, the neighbour&rsquo;s share is 0.000335 and
                  the diagonal&rsquo;s is about a ten-millionth.
                </p>
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
                <p>
                  A quarter of a cell is not an arbitrary stopping place. At
                  that width a cell one step away moves by a third of a
                  thousandth of the winner&rsquo;s move, which is below anything
                  a picture of the map could show, so for practical purposes the
                  run has finished arranging and is refining each cell alone.
                </p>
              </SubSection>

              <SubSection title="11. The step, as a fraction of the gap">
                <p>
                  The step is a fraction of the remaining gap rather than a
                  distance in centimetres and kilograms. A step of a half halves
                  the gap, a step of a hundredth closes a hundredth of it, and a
                  step of one lands the cell exactly on the person. That last
                  case is worth naming, because a cell that lands on the person
                  has forgotten every other person it ever won.
                </p>
                <p>
                  Since the step is a fraction rather than a distance, it does
                  not shrink because the map is getting better. A cell already
                  well placed is dragged just as far by the next person as a
                  badly placed one, so if the step never falls, the map never
                  settles, and what you read at the end is a fact about which
                  person happened to arrive last.
                </p>
              </SubSection>

              <SubSection title="12. How many cells still move">
                <p>
                  The reach is a width, and a width is hard to picture. Count
                  cells instead. Ask how many of them take at least a thousandth
                  of the winner&rsquo;s move, which is the smallest share that
                  could show up in a drawing of the map. On a three by three
                  grid over a hundred passes the answer is nine for the first
                  eighty-nine passes, five from pass 90, and one from pass 99.
                  On a row of six cells it is six, then five from pass 80, three
                  from pass 90 and one at pass 100.
                </p>
                <p>
                  The lower chart in section 9 draws that count. It is a
                  staircase rather than a curve, since a cell is either taking a
                  visible share or it is not, and the staircase says the same
                  thing the reach does in a form that can be counted, since the
                  run begins by moving the whole grid at once and ends by moving
                  the winner alone.
                </p>
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
                <p>
                  With both shrinking, the map settles, moving 0.2703 on its
                  last pass, describes the people at a mean distance of 7.9669
                  and arranges itself at 0.9860. Hold the step at a half and the
                  map is still travelling 13.5400 per pass at the end, roughly a
                  fifth of the 74.7 that the settled fit&rsquo;s own six cells
                  span, so it is being dragged a fifth of the way across the map
                  by whoever arrived most recently. Hold the reach wide instead
                  and the map settles beautifully, at 0.0278, and arranges
                  itself better than anything else here, at 0.9979, while
                  describing nobody. Its six cells span 31.2 of the arch rather
                  than 74.7, so they rest in a knot near the middle and the mean
                  distance from a person to their own cell is 22.7539.
                </p>
                <InAModel title="The reading that has to be honest">
                  <p>
                    Holding the step still gives a mean distance of 6.9227,
                    which is lower than the settled run&rsquo;s 7.9669, and it
                    would be easy to read that as the better map. It is not.
                    That run is still moving 13.5400 per pass, so the number
                    describes where the cells happened to be when the pass
                    budget ran out, and another pass would give a different one.
                    That is why the movement is always reported beside the mean
                    distance rather than instead of it.
                  </p>
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
                  Every change you make in the playground is a fresh fit from
                  the same seed rather than another pass of one fit. Sliding the
                  passes up does not continue a run, it stretches it, and
                  nothing here records the states a run passed through, so
                  drawing six budgets as six frames of one walk would be a small
                  lie.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. A Map With No Reach Is the Grouping Method",
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
                <p>
                  Each person that a cell wins nudges it a fraction of the way
                  toward them, which is a running average of the people that
                  cell has won, assembled one at a time. The grouping method
                  computes the same average in a single jump, by assigning
                  everybody and then moving each centre onto its group&rsquo;s
                  mean. The quantity being computed is the same one, and so are
                  the places it comes to rest; what differs is the arithmetic
                  that gets there.
                </p>
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
                <p>
                  The agreement is not a promise, and two differences survive
                  switching the reach off. This rule visits one person at a time
                  under a step that decays toward something small, so a run with
                  a pass budget can stop short of a resting place; the grouping
                  method reassigns everybody at once and jumps each centre onto
                  the mean, which reaches a resting place in a handful of
                  passes. Neither difference has anywhere to bite when the
                  groups are well separated, which is why they agreed at three
                  cells.
                </p>
                <p>
                  Slide the count up to four in the widget above and the
                  agreement stops. On these eleven people the two methods put
                  different people together, the furthest prototype pair sits
                  8.0623 apart, and the chain describes its people at a mean
                  distance of 3.5932 against the grouping method&rsquo;s 3.6373.
                  The online walk found the better arrangement of the two here,
                  which is luck about which local resting place each one reached
                  rather than a general fact about the methods.
                </p>
                <KeepInMind>
                  A map with the reach switched off is the grouping method
                  written as an online rule, and the two share an objective, a
                  set of resting places and, on separated data, an answer. They
                  do not share a guarantee of reaching the same one of those
                  resting places.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What a map will do that a grouping refuses">
                <p>
                  Ask the grouping method for twelve groups over these eleven
                  people and it refuses by name, since a group that nobody chose
                  has no mean to move to. Ask a map for thirty six cells over
                  the same eleven and it fits, and ten of the thirty six win
                  somebody. The other twenty six are not wasted and they are not
                  errors. They came to rest along the ways between the cells
                  that did win, because their grid neighbours dragged them
                  there, so a person handed to the finished map who falls
                  between two of the winners has a cell of their own to land on.
                </p>
                <p>
                  This is also why the starting positions matter less here than
                  they do for a grouping. There, a centre only ever moves toward
                  people who already chose it, so two centres landing in one
                  clump can never separate, and a careful spreading procedure is
                  worth its cost. Here a cell that has never won anything is
                  still pulled about by its neighbours, so two cells starting in
                  one clump are pushed out of it over the wide-reach passes
                  whether or not either of them has won a single person.
                </p>
                <KeepInMind>
                  A cell that won nobody is an ordinary outcome on a map and it
                  is reported rather than hidden. The same request is a refusal
                  for a grouping, and both behaviours are right for what they
                  are computing.
                </KeepInMind>
              </SubSection>
            </>
          ),
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

              <SubSection title="20. Neighbouring cells hold similar people">
                <p>
                  Make that measurable. Every pair of cells has two numbers, how
                  many steps apart the two sit on the grid and how far apart
                  they came to rest among the people, and if the map arranged
                  itself the two rise together.
                </p>
                <GridDistanceAgainstDataDistance />
                <p>
                  With the reach the two correlate at 0.9902 across the six
                  pairs of a chain of four. With the reach taken away they
                  correlate at &minus;0.1773, which is no relationship, and the
                  sign of that number changes from seed to seed because there is
                  nothing there to have a sign. That second fit is the control
                  the claim needs, since it describes the crowd rather better
                  than the arranged one does and carries no arrangement
                  whatever, so the two properties can be seen apart.
                </p>
              </SubSection>

              <SubSection title="21. The grid distance is not the distance between the people">
                <p>
                  Now the qualification the claim is misleading without. Cells
                  that are neighbours hold people who are alike, and it does not
                  follow that a cell two steps away holds people twice as
                  different. On the chain of four the three pairs sitting one
                  step apart came to rest 20.407, 24.364 and 27.717 from each
                  other, so the widest of them is 1.358 times the narrowest for
                  the same reading on the grid. The pair three steps apart rests
                  72.332 from each other, against three times the middle
                  one-step reading, which would be about 73.
                </p>
                <p>
                  On a three by three grid over the same eleven people it is far
                  worse than that, and it is worth seeing how much worse. The
                  two pairs of cells at opposite corners of the grid are the
                  furthest apart anything can be there, 2.83 steps, and one of
                  those pairs came to rest 78.831 apart while the other came to
                  rest 11.344 apart. A pair one step apart came to rest 28.622
                  apart, further than the second of those corner pairs. The
                  closest pair of all, 4.757, sits across a diagonal rather than
                  side by side.
                </p>
                <KeepInMind>
                  What a map preserves is roughly which cells are near which,
                  and not the distances themselves. Reading a grid position as a
                  measurement, or reading two steps as twice one step, is
                  reading something into the picture that the fit never put
                  there.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. A square grid over a line has to fold">
                <p>
                  Why is the three by three so much worse than the chain?
                  Because these eleven people run essentially along one
                  direction, taller people being heavier, and a two-dimensional
                  sheet laid over a one-dimensional cloud has nowhere to put its
                  second dimension except folded back on itself. The correlation
                  on that fit is 0.5308 against the chain&rsquo;s 0.9902, and
                  the fold is exactly what the difference measures.
                </p>
                <GridDistanceAgainstDataDistance
                  gridWidth={3}
                  gridHeight={3}
                  showControl={false}
                />
                <p>
                  Three of the nine cells there won nobody, and the shape of the
                  grid is a modelling choice rather than a detail. A row of
                  cells suits data with one dominant direction, a square suits
                  data that genuinely spreads two ways, and a square over a line
                  fits and predicts perfectly well while reporting an
                  arrangement whose weaker half is the fold rather than anything
                  about the people.
                </p>
              </SubSection>

              <SubSection title="23. What the arrangement costs">
                <p>
                  The arrangement is paid for and the price is visible. On the
                  chain of four, the arranged map puts every person a mean of
                  5.1435 from their cell and the same chain with the reach taken
                  away puts them 3.5932 away, which is thirty percent closer. On
                  the three by three the two figures are 2.8341 and 0.7117.
                </p>
                <p>
                  The reason is in Part 2. For as long as the reach lasted,
                  every cell was dragged toward people its grid neighbours had
                  won, so each of them ended somewhere between its own people
                  and its neighbours&rsquo;. Afterwards the step is already
                  small, and the cell walks toward its own average in strides
                  too short to arrive.
                </p>
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
                  A map is a worse description of the people than a grouping
                  with the same number of prototypes, on the same data, by a
                  margin you can measure. What it hands back for that is four
                  prototypes stored in an order along which height and weight
                  both fall, so a new person can be placed on the row and read
                  off.
                </KeepInMind>
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
                  than the same walk relabelled. Here are six of them on the
                  crowd.
                </p>
                <SeededMapGallery />
                <p>
                  All six put the same people together and all six arrange the
                  chain about equally well, correlating between 0.9901 and
                  0.9904, and describing the people at between 5.1435 and
                  5.1520. Each of the six is exactly reproducible on its own,
                  since asking the same question twice gives back the identical
                  numbers, and that is what fixing a seed buys; none of the
                  other five reproduces the first. What varies is the direction,
                  since four of the six lay the chain out with the shortest
                  people at one end and two lay it out the other way round.
                </p>
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
                  Compare two fits by which people share a cell, never by which
                  number a person received, and state the arrangement as a
                  relationship between distances rather than as a claim about
                  which cell holds whom.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. There is no total the walk lowers">
                <p>
                  Most of the iterative methods on this site have a number that
                  falls as they run and can be watched. This one has none. Each
                  cell is walking downhill on its own squared distance to
                  whichever person is in front of it, weighted by its share, and
                  the person changes at every presentation while the winners
                  change underneath as the cells move. For a continuous spread
                  of inputs there is no single quantity whose slope this rule is
                  following, which is a result about the algorithm rather than a
                  gap in this implementation.
                </p>
                <p>
                  So the readouts on this page report two things instead. How
                  far the furthest-moving cell travelled during the last pass,
                  which says whether the map has settled, and the mean distance
                  from each person to their own cell, which says whether it
                  describes anybody. Both are needed, as section 13 measured,
                  since a run can score well on either alone.
                </p>
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
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="27. What a complete implementation must specify">
                <p>
                  A description of this method is incomplete until it states the
                  shape of the grid and how many cells it holds, how grid
                  distance is counted, the shape of the neighbourhood and the
                  schedule its reach follows, the schedule the step follows,
                  whether both schedules are written against the pass budget or
                  against the pass number, how many passes are allowed and what
                  else may stop the run early, how the cells are started,
                  whether the people are reshuffled each pass, what the metric
                  in the competition is and whether it can be changed, what a
                  label means, and which of the cell positions, the winners and
                  the two diagnostics it hands back.
                </p>
                <p>
                  This implementation answers all of those. The grid is a
                  rectangle and grid distance is straight-line across it, so a
                  diagonal neighbour is the square root of two away rather than
                  one or two, which is chosen because the reach is stated as a
                  radius, and counting a diagonal as one step would let the same
                  radius reach further across the grid on the diagonal than
                  along a row. The neighbourhood is a bell curve in grid
                  distance. Both schedules are fractions of the pass budget. The
                  cells start on randomly drawn people, the people are
                  reshuffled every pass, and the metric is fixed at
                  straight-line distance for the reason section 7 derives.
                </p>
                <KeepInMind>
                  One thing this implementation does not offer is a recording of
                  the run. It reports where the cells came to rest and nothing
                  about how they got there, so every picture on this page is a
                  finished fit rather than a frame of an animation, and where a
                  section wanted to show a run unfolding it shows several
                  finished runs instead.
                </KeepInMind>
              </SubSection>

              <SubSection title="28. The edges">
                <p>
                  Each row below is a request that was actually made while this
                  page was served, and the sentence beside it is either the
                  refusal&rsquo;s own words or a description of what the fit
                  answered.
                </p>
                <MapFailureTable />
                <p>
                  Three of those deserve a sentence each. A reach that never
                  shrinks is accepted rather than refused, and it produces a map
                  that has settled, arranges itself almost perfectly and
                  describes nobody, which no guard can catch because it is a
                  legitimate answer to a badly chosen setting. A column that
                  never changes is kept exactly, every cell resting at 60 along
                  it, because the gap along a flat column is zero at every
                  presentation and no step in the fit divides by a spread. And a
                  query is matched to the fit by column name rather than by
                  position, so the same columns in the other order answer
                  identically while a missing or unknown column is refused.
                </p>
                <p>
                  One caution that a measurement did not support belongs here
                  too. A method built on distances is usually said to follow
                  whichever column carries the larger numbers, so I rewrote the
                  crowd&rsquo;s heights in millimetres and expected the map to
                  be dragged onto the height axis. It was not. The same four
                  cells won the same people and the arrangement moved from
                  0.9902 to 0.9892, because on this crowd height and weight run
                  together so closely that stretching one barely changes which
                  cell is nearest. On data where the columns are less related
                  the caution would bite, and the honest report is that it did
                  not bite here.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
