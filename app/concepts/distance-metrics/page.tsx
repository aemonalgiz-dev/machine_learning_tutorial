import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { MetricNeighboursPlayground } from "@/components/widgets/MetricNeighboursPlayground";
import { UnitShapesGallery } from "@/components/widgets/UnitShapesGallery";

export const metadata: Metadata = {
  title: "What Near Means · oop_ml",
  description:
    "Nearest neighbours, k-means and the self-organising map all lean on a distance, and there is more than one. Six of them, and the shape of one unit away under each is the whole difference.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function DistanceMetricsPage() {
  return (
    <ConceptPage
      title="What Near Means"
      tagline="Six answers to one question, and the shape of one unit away under each."
      prerequisites={
        <>
          The vector and its length come from the{" "}
          <Link href="/primers/linear-algebra" className={linkClass}>
            linear algebra primer
          </Link>
          , and the model being refitted here is the one from the{" "}
          <Link href="/concepts/k-nearest-neighbours" className={linkClass}>
            k-nearest neighbours
          </Link>{" "}
          page, which took its distance for granted.
        </>
      }
      history={
        <>
          <p>
            Straight-line distance is Euclid&rsquo;s, written down around 300 BC
            and so familiar that it takes an effort to notice it is a choice.
            The effort was made properly in 1896, when Hermann Minkowski,
            working on the geometry of numbers, described a whole family of
            distances indexed by one number and showed that the straight line is
            only the case where that number is two. Setting it to one gives the
            distance a taxi drives on a grid of streets, and pushing it to
            infinity gives the largest single gap, which carries Pafnuty
            Chebyshev&rsquo;s name. Three of the six on this page are one family
            with one dial.
          </p>
          <p>
            The other three were each invented because a straight line answered
            the wrong question. Richard Hamming, at Bell Labs in 1950, needed to
            know how many positions two punched-card codes differed in, since
            that count is exactly how many errors a code can survive, and the
            size of the difference was irrelevant. Gerard Salton and colleagues
            at Cornell, building the SMART retrieval system through the 1960s and
            publishing the vector space model in 1975, needed two documents on
            the same subject to count as close whether one was a paragraph or a
            book, so they compared the direction of the word counts and threw the
            length away. And Godfrey Lance and William Williams, classifying
            plant communities at the CSIRO in Canberra in 1966, needed a small
            absolute difference between two rare species to matter as much as a
            large one between two common ones, so they divided each gap by the
            size of the numbers it sat between.
          </p>
        </>
      }
      playground={<MetricNeighboursPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The crowd in the box above is the one from the nearest
                neighbours page, and the model is the same model. The only thing
                changing is what the word near means. Switch the metric and
                watch two things move at once: which people the query point
                actually calls its neighbours, and the shaded map of what the
                model would answer everywhere else.
              </p>
              <p>
                It is worth being clear about how large this choice is. The page
                is not offering six ways to compute roughly the same number.
                Take two people three centimetres and four kilograms apart. Under
                Euclidean distance they are 5 apart. Under Manhattan, 7. Under
                Chebyshev, 4. Under Hamming, 1, the largest value that metric
                has, because both of their measurements differ and it counts
                nothing else. And under cosine, 0.00019, which is very nearly
                zero, because two people of similar build point in almost the
                same direction from the origin however different their size.
              </p>
              <p>
                Those are not disagreements about precision. They are
                disagreements about what the question was. A metric is not a
                setting you tune for accuracy; it is a statement about which
                differences you consider real, and it deserves to be chosen
                deliberately rather than defaulted into.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                A distance takes two rows of numbers and answers with one number.
                To count as a distance in the mathematical sense it has to obey
                three rules, which are less pedantic than they look: a row is
                zero from itself and nothing else, the distance from here to
                there equals the distance from there to here, and going by way of
                a third point can never be shorter than going direct. All six
                here obey the first two, and five obey the third.
              </p>
              <p>
                Three of them are one formula. Take the gaps along each feature,
                raise each to a power, add them up, and take that root back off
                again.
              </p>
              <Equation>{"minkowski, order p    ( Σ |gap|^p ) ^ (1/p)\n\n    p = 1    the gaps added up          Manhattan\n    p = 2    the straight line           Euclidean\n    p -> ∞   the largest single gap      Chebyshev"}</Equation>
              <p>
                The other three each break the pattern in a different place.
                Hamming ignores the size of every gap and counts how many
                features differ at all, divided by how many there are. Cosine
                ignores the lengths of both rows and compares only the direction
                between them, as one minus a normalised dot product. Canberra
                keeps the sizes but scales each gap by the magnitude of the two
                numbers it sits between, so a gap of one between two and three
                counts for far more than a gap of one between two hundred and two
                hundred and one.
              </p>
              <Equation>{"hamming     (features that differ) / (features)\ncosine      1 − (a · b) / (|a| |b|)\ncanberra    Σ |gap| / (|first| + |second|)"}</Equation>
              <p>
                Cosine is the one that fails the third rule, and it fails it
                because it is not really measuring a distance between points at
                all, but an angle between directions. It also has a genuine blind
                spot: the origin has no direction, so a row of all zeros sits
                exactly one away from everything, itself included.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Take the two people the box starts with, one 150 centimetres and
                45 kilograms, the other 147 and 41. The gaps are 3 and 4, which
                is the triangle every schoolchild meets, so the first three
                answers can be read straight off.
              </p>
              <Equation>{"gaps  3 and 4\n\nmanhattan   3 + 4                  = 7\neuclidean   √(3² + 4²) = √25       = 5\nchebyshev   max(3, 4)              = 4"}</Equation>
              <p>
                Hamming asks a different question and gets a blunt answer. Both
                features differ, two out of two, so the distance is 1, the
                largest it can be. Two people identical in height but a kilogram
                apart would score one half. It is the wrong metric for
                measurements that vary continuously, and the right one for
                answers that are yes or no.
              </p>
              <p>
                Cosine needs the two lengths and the dot product. The dot product
                is 150 times 147 plus 45 times 41, which is 23,895, and the
                lengths are the square roots of 24,525 and 23,290.
              </p>
              <Equation>{"a · b     = 150·147 + 45·41 = 23895\n|a|       = √24525 = 156.6046\n|b|       = √23290 = 152.6106\n\nsimilarity = 23895 / (156.6046 · 152.6106) = 0.99981\ncosine     = 1 − 0.99981                    = 0.00019"}</Equation>
              <p>
                Canberra divides each gap by the sum of the pair it separates,
                3 over 297 and 4 over 86, which is 0.0101 and 0.0465, summing to
                0.0566. Notice that the weight fell almost entirely on the
                second feature, even though its gap is only one larger, because
                weight is a smaller number than height and Canberra reads a gap
                relative to what it is a gap between. Every one of those figures
                is in the readout above, and every one is pinned by a test.
              </p>
            </>
          ),
        },
        {
          title: "The Shape of One Unit Away",
          content: (
            <>
              <p>
                The quickest way to feel what a metric does is to ask it which
                points are exactly one away from a fixed centre. Under Euclidean
                distance the answer is a circle, which is what the word means.
                Under Manhattan it is a diamond, because to stay at a total of
                one you must trade horizontal movement for vertical one for one.
                Under Chebyshev it is a square, because only the larger gap
                counts, so you can move freely in the other direction until it
                overtakes.
              </p>
              <UnitShapesGallery />
              <p>
                Measured on the same lattice, the square holds 441 cells within
                one unit, the circle 317, and the diamond 221. That ordering is
                not an accident of the drawing. The diamond sits inside the
                circle, which sits inside the square, for every centre and every
                radius, which is the geometric statement of the fact that raising
                the order can only make a distance smaller.
              </p>
              <p>
                Hamming&rsquo;s panel looks broken and is not. It can only ever
                answer zero, a half or one, so of the 1681 cells on the lattice
                exactly 1600 sit at its maximum of one and the remaining 81 form
                a cross through the centre, the cells that happen to share a
                height or a weight with it. There is no curve to draw because
                there is no gradual falling away.
              </p>
              <p>
                Now click a panel to move the centre, because that is the control
                that separates the six into two kinds. The circle, the diamond,
                the square and the cross are the same shapes wherever you put
                them, and their counts change only where the shape runs off the
                edge of the lattice. Cosine and Canberra are not. Move the centre
                to (1, 1) and cosine&rsquo;s region becomes a wedge of 861 cells
                with 41 on its boundary, and Canberra&rsquo;s becomes 413 with
                46, and both change again at the next centre you pick. Their
                notion of one unit depends on where they are standing, which for
                Canberra is the entire point of it.
              </p>
              <p>
                The origin, which is where the gallery starts, is the worst place
                to stand for both of them, and instructively so. Cosine shades
                every cell at exactly one, because the origin has no direction
                for anything to point away from. Canberra shades only the two
                axes, because dividing a gap by the sum of the pair it separates
                gives exactly one whenever the other number is zero. Two metrics
                that work perfectly well elsewhere have nothing to say at the
                one point the reader is most likely to try first, and a model
                that hands them data centred on zero inherits that silence.
              </p>
            </>
          ),
        },
        {
          title: "Why k-Means Cannot Choose",
          content: (
            <>
              <p>
                The nearest neighbours model takes its metric as a setting, and
                this page has been switching it freely. It would be reasonable to
                expect every method that measures distance to offer the same
                dial. The k-means page does not, and the reason is worth having,
                because it is a fact about that algorithm rather than a
                simplification of it.
              </p>
              <p>
                k-means alternates two steps: put every point with its nearest
                centre, then move each centre to the mean of the points it now
                holds. The argument that it must settle rests on both steps
                lowering the same total, and the second one lowers it because the
                mean is exactly the point that minimises the sum of squared
                distances to a group. That is a fact about squared Euclidean
                distance specifically. Under Manhattan the minimiser is the
                median, not the mean, so the update step stops lowering the total
                it is supposed to be lowering and the convergence argument
                collapses.
              </p>
              <p>
                So the library puts the metric on the neighbour models, where it
                is a genuine choice, and leaves it off k-means, where offering it
                would be offering something that does not work. There is a method
                that does what the expectation wants, k-medoids, and it differs
                precisely in replacing the mean with an actual member of the
                group, which is what makes it safe under any metric at all.
              </p>
              <p>
                The other place this bites is scale, and the{" "}
                <Link href="/concepts/feature-scaling" className={linkClass}>
                  feature scaling
                </Link>{" "}
                page is the answer to it. Five of these six metrics read raw
                magnitudes, so a feature measured in grams will drown one
                measured in kilograms whatever metric you pick. Cosine is the
                exception, and it is exempt only because it throws length away
                before it starts.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The one derivation worth doing is the limit that produces
                Chebyshev, because it explains why the largest gap is the
                sensible reading of an infinite order rather than a convention.
                Take the gaps and call the largest of them M. Pull it out of the
                sum.
              </p>
              <Equation>{"( Σ |gap|^p ) ^ (1/p)  =  M · ( Σ (|gap| / M)^p ) ^ (1/p)"}</Equation>
              <p>
                Every ratio inside that sum is at most one, and the one belonging
                to the largest gap is exactly one. So as p grows, every term
                except the largest is a number below one raised to a growing
                power, and each of them falls toward zero. The sum tends to
                however many gaps tied for largest, call it t, and the whole
                expression tends to M times the p-th root of t.
              </p>
              <Equation>{"as p -> ∞     t ^ (1/p)  ->  1        so the distance -> M"}</Equation>
              <p>
                The p-th root of any fixed number tends to one, so the tie count
                stops mattering and the answer is the largest gap alone. That is
                also why the sweep in the readout falls as the order rises, 7 at
                order one, 5.584 at one and a half, 5 at two, 4.285 at four,
                4.022 at ten, and 4 in the limit. It is a decreasing sequence
                converging on the maximum, and the pinned numbers show it doing
                so.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
