import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { KnnPlayground } from "@/components/widgets/KnnPlayground";

export const metadata: Metadata = {
  title: "k-Nearest Neighbours · oop_ml",
  description:
    "No training at all. A new point is classified by finding the k stored points nearest to it and letting them vote.",
};

export default function KNearestNeighboursPage() {
  return (
    <ConceptPage
      title="k-Nearest Neighbours"
      tagline="No training at all. Find the k stored examples nearest the new one, and let them vote."
      prerequisites={
        <>
          The distance between two points, the length of their difference, is
          the whole engine here, and it comes from the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          . The scaling section leans on the{" "}
          <Link
            href="/primers/statistics"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            statistics primer
          </Link>
          &rsquo;s standard deviation.
        </>
      }
      history={
        <>
          <p>
            Every classifier so far assumes a shape. Logistic regression
            assumes the boundary between the classes is a straight cut, and a
            decision tree assumes it is built of axis-aligned boxes, and when
            the assumption fits the world these models are compact and quick.
            In 1951 Evelyn Fix and Joseph Hodges, writing a technical report
            for the US Air Force, asked what could be done when you refuse to
            assume any shape at all, and their answer is almost embarrassingly
            plain. Classify a new case the way its closest recorded cases went.
            No fitted curve, no boundary formula, just resemblance. A 1967
            result by Thomas Cover and Peter Hart gave the plainness some
            teeth, showing that with enough data even consulting a single
            nearest neighbour can never do worse than twice the best possible
            error, and the method has been a standard tool ever since, the
            model you reach for when you trust your examples more than any
            shape you could impose on them.
          </p>
        </>
      }
      playground={<KnnPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The dots in the box above are people we have already measured
                and labelled, amber for children and indigo for adults, placed
                by height and weight. The ringed point is someone new, measured
                but not yet labelled, and the question is which group they
                belong to.
              </p>
              <p>
                The method answers the way a person would. Look at whoever the
                new arrival most resembles. The dashed lines reach out to the k
                stored people nearest the query, those neighbours each vote
                their own label, and the majority wins. Drag the ringed point
                around and watch the lines grab different neighbours and the
                answer follow.
              </p>
              <p>
                Notice what never happened. Nothing was fitted. There is no
                slope, no curve, no training step, and the model is nothing
                more than the stored examples plus a rule for consulting them.
                All the work happens at the moment of the question, which is
                why the shaded regions redraw the instant you move a single
                stored point.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The whole method is three steps, and the first is the linear
                algebra primer&rsquo;s distance. Each person is a vector of
                measurements, and the distance between two people is the
                length of their difference.
              </p>
              <Equation>{"distance = √((height₁ − height₂)² + (weight₁ − weight₂)²)"}</Equation>
              <p>
                Compute that distance from the query to every stored person,
                keep the k smallest, and let those k labels vote, majority
                rules. That is the entire mechanism, which is itself the
                lesson. Where regression compressed the data into a few fitted
                numbers and then discarded it, this method keeps every example
                and compresses nothing.
              </p>
              <p>
                The number k is the one dial, and it is kept odd here so a
                two-class vote cannot tie. What it trades is the subject of a
                later section, though the short version is that k sets how
                local the decision is, one neighbour listens to a single
                nearby voice, fifteen neighbours poll the whole
                neighbourhood.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked example button, which places the query at a
                height of 150 cm and a weight of 45 kg, and work the distances
                by hand to the five people nearest it. Each difference below
                is a multiple of the 3-4-5 triangle from the linear algebra
                primer, so every root comes out clean.
              </p>
              <Equation>{"child at (147, 41)   difference (3, 4)     distance  5\nadult at (156, 53)   difference (6, 8)     distance 10\nchild at (145, 57)   difference (5, 12)    distance 13\nadult at (159, 57)   difference (9, 12)    distance 15\nadult at (162, 61)   difference (12, 16)   distance 20"}</Equation>
              <p>
                Now read the votes at each k, checking against the widget as
                you go. At k of 1 only the child at distance 5 is consulted,
                and the answer is child. At k of 3 the voters are two children
                and one adult, two to one, child again. At k of 5 the two
                adults at distances 15 and 20 join, the vote is three adults
                to two children, and the answer flips to adult.
              </p>
              <p>
                Slide k from 3 to 5 above and watch that flip happen. Not one
                point moved and not one label changed, yet the answer
                reversed, because k decides how wide a circle of opinion is
                consulted, and this query sits close to a few children inside
                a neighbourhood that leans adult.
              </p>
            </>
          ),
        },
        {
          title: "What k Trades",
          content: (
            <>
              <p>
                The shaded regions show the model&rsquo;s answer at every spot
                on the plane, and sliding k redraws them in a way worth
                staring at. At k of 1 the map is jagged. Every stored person
                commands their own island of territory, including any point
                that sits oddly among the other class, so one mislabelled or
                unusual person bends the map around them. That is memorising,
                the same failure the polynomial page met at degree 9, wearing
                a different costume.
              </p>
              <p>
                Raise k and the islands dissolve. Each decision now polls a
                wider circle, stray voices are outvoted by their
                surroundings, and the frontier between amber and indigo
                smooths out. Push k toward the size of the whole dataset,
                though, and the poll stops being local at all, every query
                consults nearly everyone, and the answer drifts toward
                whichever class simply has more members. Small k trusts each
                example too much, large k trusts the crowd too much, and the
                honest choice again needs data held out from the decision,
                the same open thread the penalty page left hanging.
              </p>
            </>
          ),
        },
        {
          title: "The Scaling Trap",
          content: (
            <>
              <p>
                One quiet assumption is doing load-bearing work in every
                distance above, and it is the method&rsquo;s best-known trap.
                The distance formula adds the two squared differences as
                though a centimetre of height and a kilogram of weight were
                the same size of thing. Here that happens to be roughly fair,
                since the heights span about 65 units and the weights about
                60, so both measurements get a real say.
              </p>
              <p>
                Now imagine the heights had been recorded in millimetres. The
                same people, the same facts, though every height difference
                is suddenly ten times larger, and squared it is a hundred
                times larger. Distance becomes height with a rounding error
                for weight, the vote listens to one measurement only, and
                nothing in the method complains, since the arithmetic is
                perfectly happy. The answers are just quietly worse.
              </p>
              <p>
                The repair is the statistics primer&rsquo;s. Divide each
                feature by its own standard deviation before measuring
                distances, so every feature speaks in the same unit, its own
                typical spread. A model that runs on distances inherits the
                units of its data, and evening those units out is not a
                refinement here, it is part of using the method correctly.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
