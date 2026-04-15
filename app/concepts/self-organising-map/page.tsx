import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { SelfOrganisingMapPlayground } from "@/components/widgets/SelfOrganisingMapPlayground";

export const metadata: Metadata = {
  title: "Self-Organising Maps · oop_ml",
  description:
    "Drape a small grid of units over unlabelled data and let each person pull the nearest unit and its grid neighbours toward them, so that when it settles, neighbouring units hold neighbouring people, a map and not only a grouping.",
};

export default function SelfOrganisingMapPage() {
  return (
    <ConceptPage
      title="Self-Organising Maps"
      tagline="Drape a grid of units over the data and let every person pull the nearest unit and its neighbours toward them, until the grid is a map of the cloud."
      prerequisites={
        <>
          Which unit is nearest is the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          &rsquo;s distance, and where a unit comes to rest is the{" "}
          <Link
            href="/primers/statistics"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            statistics primer
          </Link>
          &rsquo;s mean, arrived at one person at a time. The whole method is
          the{" "}
          <Link
            href="/concepts/k-means"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            k-means page
          </Link>
          &rsquo;s loop with a grid laid over it, and the rule that moves a
          unit is local in the sense the{" "}
          <Link
            href="/concepts/hopfield-network"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            Hopfield page
          </Link>{" "}
          gave the word, each unit reading only the person in front of it and
          its own place on the grid.
        </>
      }
      history={
        <>
          <p>
            The surface of the brain is covered in maps. In 1937 Wilder
            Penfield, operating on conscious patients in Montreal, stimulated
            points along the cortex and found that neighbouring patches of
            skin were served by neighbouring patches of tissue, a distorted
            but orderly drawing of the body laid across the brain. In the
            1960s David Hubel and Torsten Wiesel found in the visual cortex of
            cats and monkeys that cells preferring one angle of edge sat
            beside cells preferring the next angle along, arranged in columns
            that swept through the orientations in order. Nobody lays those
            maps out. No signal tells a cell which angle it should prefer or
            which neighbour it should agree with, and the question was how a
            sheet of cells could organise itself into an ordered chart of
            whatever it was shown.
          </p>
          <p>
            Christoph von der Malsburg answered it in a model in 1973, with
            cells that competed to respond to an input and cooperated with
            their neighbours when they won, and with David Willshaw in 1976
            showed the same two ingredients would wire a retina onto a sheet
            in the right order. Teuvo Kohonen, at Helsinki University of
            Technology, stripped that to an algorithm in 1982, a grid of units
            each holding a point in the input space, the nearest unit and its
            grid neighbours pulled toward whatever is presented, and showed
            that the grid ends up as an ordered map of the input. His 1988
            phonetic typewriter laid the sounds of Finnish speech across such
            a grid, so that a spoken word traced a path over it, and the
            method has been used since to chart documents, genes and customers
            wherever someone wanted to see the shape of data that carried no
            labels.
          </p>
        </>
      }
      playground={<SelfOrganisingMapPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The box above starts where the k-means page started, eight
                uncoloured people in two clumps, and again the colours were
                put there by the method. What is new is the net. Each small
                square is a unit, a point in the plane that the method is free
                to move, and the lines join each unit to its neighbours on a
                grid that never changes, one row of two to begin with. Fitting
                drapes that net over the people. Every person pulls the
                nearest unit toward them, and pulls its grid neighbours along
                too, a little less, so by the time the map settles each square
                sits among the people it won and the net has stretched across
                the cloud.
              </p>
              <p>
                Press the crowd button, slide the width and height up, and
                watch a larger net unfold over it. The thing to look for is
                that squares which are neighbours on the grid land as
                neighbours among the people. A 3 by 3 net lays a sheet across
                the crowd, with the short people at one corner, the tall at
                the opposite corner and the middle of the crowd between them,
                and reading along a row of the grid reads a path through the
                data. The colours say the same thing, since they run with the
                grid rather than with the order the units happened to be
                numbered in. That is the property k-means cannot express, its
                groups have no idea which other groups they sit beside, and it
                is why the result is called a map.
              </p>
              <p>
                Two honest cautions. Every change to a slider, a dot or a
                button is a fresh fit from the same seed rather than a step of
                one fit, because the schedules that drive the walk are
                fractions of the epoch budget, so a walk of ten epochs is a
                different walk from the first ten of a hundred. And the net can
                come out mirrored, or with a square that won nobody parked
                between the squares that did, which is not a failure but a
                unit doing what its neighbours asked of it.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Fix a grid of units and give each a position in the plane, to
                begin with the position of a randomly drawn person. Then
                present the people one at a time, in a fresh shuffled order
                each epoch, and for each do three things. Compete, find the
                unit nearest the person by the linear algebra primer&rsquo;s
                distance and call it the winner. Cooperate, give every unit a
                score for how near it sits to the winner on the grid, one for
                the winner itself and falling away with grid distance through
                a bell curve. Adapt, move every unit toward the person by the
                rate times its score times the gap.
              </p>
              <Equation>
                {
                  "score_u = exp( −(grid distance from u to winner)² / (2 · radius²) )\nunit_u  ← unit_u + rate · score_u · (person − unit_u)"
                }
              </Equation>
              <p>
                The grid distance in the score is the thing to hold onto. It is
                measured on the grid, where neighbours are one step apart
                whatever their positions in the plane, and never between the
                units&rsquo; positions. That is what makes a unit&rsquo;s
                neighbours follow it. A winner is dragged toward the person,
                and the units beside it on the grid are dragged the same way
                regardless of where they happen to be, so units that are
                neighbours on the grid keep being pulled toward the same
                region and end up beside one another in the plane.
              </p>
              <p>
                Two numbers shrink as the walk goes on. The rate starts at a
                half, so a winner closes half its gap, and falls to a
                hundredth. The radius starts at half the grid&rsquo;s longest
                side, so the first epochs move most of the net at once, and
                falls to a quarter of a step, where a neighbour&rsquo;s score
                is exp(−8) and only the winner moves. Both are set as fractions
                of the epoch budget. The library does stop a walk early when no
                unit moved further than its tolerance in a whole epoch, but with
                the rate ending at a hundredth that happens only when every
                person already sits on the unit that wins them, so in practice
                the epochs run readout equals the slider. There is no total that
                the walk lowers and could be watched for, so the readouts report
                instead how far
                any unit moved on the last epoch, which says whether the map
                has settled, and the quantisation error, the mean distance from
                each person to the unit that won them, which is the
                map&rsquo;s answer to the k-means page&rsquo;s inertia.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                First the rule on made-up numbers. Take a one-by-two map part
                way through its walk, with the left unit at (130, 40) and the
                right unit at (160, 60), and present the person at (180, 80).
                The right unit is nearer, so it wins, and suppose the rate this
                epoch is 0.5 and the radius 1.0. The winner&rsquo;s score is
                one, so it closes half its gap.
              </p>
              <Equation>
                {
                  "gap     = (180, 80) − (160, 60) = (20, 20)\nwinner  = (160, 60) + 0.5 · 1 · (20, 20) = (170, 70)"
                }
              </Equation>
              <p>
                The left unit is one grid step from the winner, so its score is
                exp(−1 / 2), about 0.607, and it moves that fraction of the
                winner&rsquo;s step along its own gap, which is larger because
                it started further away.
              </p>
              <Equation>
                {
                  "gap        = (180, 80) − (130, 40) = (50, 40)\nneighbour  = (130, 40) + 0.5 · 0.607 · (50, 40)\n           = (130, 40) + (15.2, 12.1) = (145.2, 52.1)"
                }
              </Equation>
              <p>
                One person moved both units, the winner by half its gap and
                the neighbour by three tenths of its own, and that is the whole
                rule. Now press the ideal case button, set the width to 2, the
                height to 1 and the epochs to 100, and read what the library
                did with it. One square rests inside each clump, the four short
                people wear one unit&rsquo;s colour and the four tall the
                other&rsquo;s, the map moved 0.107 on its last epoch, and the
                quantisation error is 3.28. Hover a square for its position.
                The squares rest near (123.0, 27.8) and (179.1, 78.2), each
                within three of the clump means the k-means page summed by
                hand, (121, 26) and (181, 80), and neither is on its mean.
              </p>
              <p>
                That gap is the neighbourhood, seen. For as long as the radius
                lasted, every tall person who won the right unit also pulled
                the left unit a little toward the tall clump, and every short
                person pulled the right unit toward the short one, so each
                unit settled on the side of its mean that faces the other. By
                the time the radius had shrunk enough for the pull to stop, the
                rate had shrunk too, and the unit walks toward its own mean in
                steps too small to arrive. Slide the epochs to 200 and both
                squares move closer to the means, because the stretch of the
                walk with the neighbourhood gone is twice as long. Slide the
                width to 1 and the lone unit, with no neighbour to pull it
                anywhere, rests on the mean of everyone, (151, 53), which is
                exactly where a single k-means centre would.
              </p>
            </>
          ),
        },
        {
          title: "A Map, Not Just a Grouping",
          content: (
            <>
              <p>
                k-means answers which group each person is in and nothing
                about how the groups relate. A map answers that too, because
                the grid carries it. Two units adjacent on the grid were
                dragged together for the whole of the wide-radius stretch, so
                they end adjacent among the people, and the grid becomes a
                chart of the cloud that a new person could be placed on and
                read off. Fit a 3 by 3 map to the crowd and the short clump
                takes one corner, the tall clump the opposite corner, and the
                middle of the crowd is spread over the units between them, not
                every one of which wins anybody. A 6 by 6
                map over the same eleven people has far more units than
                people and most of them win nobody, and those units are not
                wasted, they lie along the paths between the people who did
                the pulling, which is the map filling in the cloud it was
                shown.
              </p>
              <p>
                Switch the neighbourhood off and what is left is k-means. With
                the radius at zero the score is one for the winner and zero for
                everyone else, so only the winner moves, and the rule becomes a
                running mean.
              </p>
              <Equation>{"winner ← winner + rate · (person − winner)"}</Equation>
              <p>
                Each new person nudges the unit a fraction of the way toward
                them, which is the mean of the people that unit has won,
                assembled one at a time. k-means computes the same mean in one
                jump, by assigning everyone and moving each centre to the
                average of its group. Same resting points, different
                arithmetic, and the 1 by 1 map above resting on (151, 53) is
                the demonstration. A 1 by k map with its radius gone is k-means
                with k centres updated one person at a time, and everything
                this page adds is in the radius.
              </p>
              <p>
                Both the rate and the radius fall over the run, and each on a
                different curve. The rate falls geometrically, because what
                matters about a rate is its order of magnitude and a geometric
                fall spends most of the walk at small values. The radius falls
                in a straight line, because it is measured in grid steps and
                the middle of the walk should be the middle of the range.
              </p>
              <Equation>
                {
                  "rate(t)    = 0.5 · (0.01 / 0.5)^((t − 1) / (T − 1))\nradius(t)  = r₀ + (0.25 − r₀) · (t − 1) / (T − 1)        r₀ = half the longest side"
                }
              </Equation>
              <p>
                Both are written against T, the epoch budget, so the epochs
                slider does not add epochs to the end of a walk, it stretches
                the whole walk, every stage of it lasting proportionally
                longer. That is why every change is a fresh fit, and it is also
                why the walk runs its full budget in practice. Nothing in it
                stops moving of its own accord, the rate only becomes small, and
                the library&rsquo;s early stop, which asks for no unit to have
                moved at all, is met only by people who already sit on their
                units, when the walk ends after a single epoch.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The mechanism made three moves and each has a line of
                mathematics behind it. Compete is the nearest unit by squared
                distance, the square root dropped because it changes no
                ordering.
              </p>
              <Equation>{"winner = argmin over u of ‖person − unit_u‖²"}</Equation>
              <p>
                Cooperate is the bell curve in grid distance, d(u, winner)
                counted in grid steps, which is one at the winner and falls
                toward zero with distance. At a radius of one a neighbour
                scores 0.607, a diagonal neighbour 0.368 and a unit three steps
                away 0.011.
              </p>
              <Equation>
                {"score_u = exp( −d(u, winner)² / (2 · radius²) )"}
              </Equation>
              <p>
                Adapt is a gradient step. The calculus primer&rsquo;s move on
                half the squared distance from a unit to the person gives a
                slope of minus the gap, so stepping against the slope is
                stepping along the gap, and the rule is that step scaled by
                the rate and by the unit&rsquo;s score.
              </p>
              <Equation>
                {
                  "d/d unit_u of ½ · ‖person − unit_u‖² = −(person − unit_u)\nunit_u ← unit_u − rate · score_u · ( −(person − unit_u) )"
                }
              </Equation>
              <p>
                Each unit is descending its own squared distance to whichever
                person is in front of it, weighted by how close it sits on the
                grid to the winner. There is no single quantity the whole map
                descends, which is why the library reports movement rather
                than a loss and why this page has no staircase.
              </p>
              <p>
                Now why the shrinking radius turns unfolding into settling.
                Hold the rate and the radius fixed for a moment and ask where a
                unit would rest. It is pulled toward every person, each
                weighted by the unit&rsquo;s score against that person&rsquo;s
                winner, and it stops where the pulls balance, at the weighted
                mean.
              </p>
              <Equation>
                {
                  "unit_u = Σ score(u, winner of x) · x  /  Σ score(u, winner of x)"
                }
              </Equation>
              <p>
                With a wide radius every score is close to one, so every
                unit&rsquo;s resting point is close to the grand mean and the
                net is bunched at the centre of the cloud, ordered but tiny.
                That is the unfolding. As the radius falls the weights
                concentrate on the unit&rsquo;s own people, its resting point
                slides out to the mean of what it wins, and at zero it is the
                k-means mean exactly. The order fixed while the radius was wide
                is kept, because the later pulls are smaller and only refine.
                The rate falls with the radius so that the last steps are tiny
                and the map stops chasing whichever person was presented last,
                which is the condition under which a walk of this kind
                converges at all, and it is also why the worked example rests
                two short of its means rather than on them.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
