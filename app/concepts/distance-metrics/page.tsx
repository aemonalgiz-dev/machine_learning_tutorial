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
import { DensityUnderMetrics } from "@/components/widgets/DensityUnderMetrics";
import { DimensionCurse } from "@/components/widgets/DimensionCurse";
import { DistanceAxioms } from "@/components/widgets/DistanceAxioms";
import { FarFromOrigin } from "@/components/widgets/FarFromOrigin";
import { MetricNeighboursPlayground } from "@/components/widgets/MetricNeighboursPlayground";
import { PairComparisonTable } from "@/components/widgets/PairComparisonTable";
import { PairMeasurer } from "@/components/widgets/PairMeasurer";
import { UnitShapesGallery } from "@/components/widgets/UnitShapesGallery";
import { UnitsRefit } from "@/components/widgets/UnitsRefit";
import {
  CODE_PAIRS,
  COUNT_PAIRS,
} from "@/components/widgets/distanceMetricsFixtures";

export const metadata: Metadata = {
  title: "What Near Means · oop_ml",
  description:
    "A distance is one number for two people, and there is more than one way to get it. Six of them, the rules any of them has to keep, what changes when the units change, which models can choose, and what happens to nearest as the features multiply.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function DistanceMetricsPage() {
  return (
    <ConceptPage
      title="What Near Means"
      tagline="Six answers to one question, the rules any answer has to keep, and what the answer is worth once there are two hundred columns."
      prerequisites={
        <>
          The vector, its length and the dot product come from the{" "}
          <Link href="/primers/linear-algebra" className={linkClass}>
            linear algebra primer
          </Link>
          , and the model being refitted all through this page is the one from
          the{" "}
          <Link href="/concepts/k-nearest-neighbours" className={linkClass}>
            k-nearest neighbours
          </Link>{" "}
          page, which took its distance for granted. The{" "}
          <Link href="/concepts/feature-scaling" className={linkClass}>
            feature scaling
          </Link>{" "}
          page is the answer to the question Part 3 raises, and this page
          leans on it rather than repeating it.
        </>
      }
      history={
        <>
          <p>
            Straight-line distance is Euclid&rsquo;s, and it is so familiar
            that it takes an effort to notice it is a choice at all. The effort
            was made in 1896, when Hermann Minkowski published the first part
            of his Geometrie der Zahlen in Leipzig. He was counting lattice
            points inside convex bodies, and to do that he needed a notion of
            length for which a given convex body was the set of points within
            one unit of the centre, so he turned the definition around and
            let the body define the distance. Every symmetric convex shape
            gives a distance, and the family indexed by one exponent, of
            which the straight line is the case at two, is the one that carries
            his name. Setting the exponent to one gives the distance a taxi
            drives on a grid of streets, and letting it grow without bound
            gives the largest single gap, which carries Pafnuty
            Chebyshev&rsquo;s name because his work on approximation measured
            error by its worst case. Three of the six on this page are that
            one family with one dial, and the gallery in Part 2 is
            Minkowski&rsquo;s picture, the shape of one unit away, drawn for
            each of them.
          </p>
          <p>
            The other three were each invented because a straight line
            answered the wrong question. Richard Hamming, at Bell Labs, had
            the relay computers of the late 1940s reject his weekend jobs
            whenever a single parity check failed, and in &ldquo;Error
            detecting and error correcting codes&rdquo;, in the Bell System
            Technical Journal in 1950, he set out codes that could locate an
            error rather than only report one. What that needs is a count of
            the positions in which two code words differ, since a code can
            correct as many errors as half the smallest such count, and the
            size of any difference is irrelevant to it. Gerard Salton and his
            students at Cornell built the SMART retrieval system through the
            1960s, and in &ldquo;A vector space model for automatic
            indexing&rdquo; in 1975 Salton, Wong and Yang treated a document
            as a vector of term counts. A long document on a subject and a
            short one on the same subject then sit far apart by any length,
            so they compared the directions of the two vectors and threw the
            lengths away, which is the cosine measure. Godfrey Lance and
            William Williams, writing classification programs at the CSIRO
            in Canberra and publishing them in the Computer Journal in 1966,
            were sorting sites by counts of the species found at each, and a
            difference of one plant in a species seen twice mattered to them
            as much as a difference of fifty in a species seen everywhere, so
            they divided each gap by the size of the two counts it sat
            between.
          </p>
          <p>
            The page asks six questions in order. What is a distance, and
            what must any candidate promise? What do the six say about one
            pair of people, and about the whole crowd? What happens to all
            of them when the units change? When is direction the question
            rather than length, and when are the numbers labels or counts
            rather than measurements? Which models can be handed a metric,
            and why can k-means not? And what is nearest worth once there are
            two hundred columns?
          </p>
        </>
      }
      playground={<MetricNeighboursPlayground />}
      sections={[
        {
          title: "Part 1. What a Distance Is",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Two people, one number">
                <p>
                  The crowd in the box above is the one from the nearest
                  neighbours page, five children and six adults measured by
                  height and weight, and the ringed person at 150 centimetres
                  and 45 kilograms is the one being classified. That page
                  found the three nearest people and let them vote, and it
                  never said what nearest meant, because everyone assumed
                  the straight line. Switch the metric in the box and two
                  things move at once, which people the ringed person
                  actually consults and the shaded map of what the model
                  would answer everywhere else. Under four of the six
                  metrics the three consulted are the same three and the
                  answer is child; under cosine the third voter is a
                  different adult and the answer is adult; under Hamming
                  every person in the crowd is at exactly the same distance
                  and the vote is decided by whoever happens to come first.
                </p>
                <p>
                  A distance is a rule that takes two rows of numbers and
                  answers with one number, and everything a neighbour model
                  does follows from that number, since it learns nothing at
                  fit time beyond remembering the rows. That makes the
                  choice of distance the counterpart of the objective
                  function in a fitted model rather than a setting to tune.
                  Take the ringed person and the person nearest to them, at
                  147 and 41, three centimetres and four kilograms apart.
                  Under the straight line they are 5 apart, under the taxi
                  grid 7, under the largest gap 4, under Hamming 1, which is
                  the largest value it can give, and under cosine 0.000189,
                  which is very nearly zero because two people of similar
                  build point in almost the same direction from the origin
                  however different their size. Those are six answers to six
                  different questions, and the rest of the page is about what
                  each question is and which data it suits.
                </p>
                <KeepInMind>
                  A metric is a statement about which differences between two
                  people count as real, and by how much. It is chosen before
                  the model sees any data and nothing in the fit can correct
                  it, so it deserves to be chosen rather than defaulted into.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The three rules a distance keeps">
                <p>
                  Not every rule that turns two rows into a number deserves
                  the name. A distance has to put a person at zero from
                  themselves and at more than zero from anyone else, it has
                  to answer the same whichever person is named first, and
                  going by way of a third person can never be shorter than
                  going direct. The third rule is the one that does work,
                  since it is what lets a search prune, if the way station is
                  far from the query then everything near the way station is
                  far too, and it is what makes a distance behave like the
                  word suggests.
                </p>
                <Equation>{"d(a, a) = 0,  and  d(a, b) > 0  whenever a ≠ b\nd(a, b) = d(b, a)\nd(a, b) ≤ d(a, c) + d(c, b)"}</Equation>
                <p>
                  Take three people of one height, 150 centimetres, weighing
                  45, 52 and 60 kilograms. They lie on a line, so under the
                  three p-norms the two legs by way of the middle person sum
                  to the direct route exactly, 7 plus 8 against 15. Under
                  cosine the direct route is 0.003962 and the two legs are
                  0.000892 and 0.001095, which sum to 0.001987, about half
                  of it. Going by way of the middle person is shorter than
                  going direct, so cosine fails the third rule, and it fails
                  it on three ordinary people rather than on some contrived
                  arrangement. The other five pass on this triple, Hamming
                  with 0.5 plus 0.5 against 0.5 and Canberra with 0.0722
                  plus 0.0714 against 0.1429.
                </p>
                <DistanceAxioms />
                <p>
                  The reason cosine fails is that it is an angle wearing the
                  vocabulary of a distance. One minus the cosine of an angle
                  is not additive along a path the way the angle itself is,
                  and for a small angle it grows with the square of the
                  angle, so halving the angle quarters the number and two
                  halves sum to less than the whole. It also fails the first
                  rule at one point. A row of all zeros has no direction, and
                  the last column of the table shows the origin at distance
                  1 from itself under cosine and at 0 under every other
                  metric.
                </p>
                <KeepInMind>
                  Five of the six here are distances in the mathematical
                  sense. Cosine is not, and nothing in a brute-force
                  neighbour search depends on the missing rule, since every
                  pair is measured directly. A spatial index that prunes by
                  the triangle inequality would depend on it, which is one
                  reason such an index is not offered here.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. One pair under six">
                <p>
                  Now the pair the page works by hand, the ringed person at
                  (150, 45) against their nearest at (147, 41). The gaps are
                  3 and 4, which is the triangle every schoolchild meets, so
                  the first three answers can be read straight off.
                </p>
                <Equation>{"gaps  3 and 4\n\nmanhattan   3 + 4                  = 7\neuclidean   √(3² + 4²) = √25       = 5\nchebyshev   max(3, 4)              = 4"}</Equation>
                <WorkedExample title="The other three by hand">
                <p>
                  Hamming asks whether each feature agrees and counts the
                  ones that do not, as a share of the features there are.
                  Both differ, two out of two, so the distance is 1. Two
                  people identical in height and a kilogram apart in weight
                  would score one half, and so would two people identical in
                  height and forty kilograms apart. Cosine needs the two
                  lengths and the dot product. The dot product is 150 times
                  147 plus 45 times 41, which is 23,895, and the lengths are
                  the square roots of 24,525 and 23,290.
                </p>
                <Equation>{"a · b     = 150·147 + 45·41 = 23895\n|a|       = √24525 = 156.6046\n|b|       = √23290 = 152.6106\n\nsimilarity = 23895 / (156.6046 · 152.6106) = 0.99981\ncosine     = 1 − 0.99981                    = 0.00019"}</Equation>
                <p>
                  Canberra divides each gap by the sum of the pair it
                  separates, 3 over 297 and 4 over 86, which is 0.0101 and
                  0.0465, summing to 0.0566. The weight fell almost entirely
                  on the second feature even though its gap is only one
                  larger, because 41 and 45 are smaller numbers than 147 and
                  150 and Canberra reads a gap relative to what it is a gap
                  between.
                </p>
                </WorkedExample>
                <PairMeasurer panel="working" />
                <KeepInMind>
                  Three of the six read the gaps and differ only in how they
                  combine them. The other three each throw something away
                  first, the size of every gap for Hamming, the lengths of
                  both rows for cosine, and the units of every column for
                  Canberra, and in each case the thing thrown away is the
                  thing that carries no meaning in the data it was built for.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. The crowd under six">
                <p>
                  The same six rules applied to the whole crowd decide who
                  votes. The three p-norms consult the same three people for this
                  query, since a person nearer in every gap is nearer however
                  the gaps are combined, and the three sit at 5, 10 and 13 by the straight line, 7, 14 and
                  17 by the taxi grid, and 4, 8 and 12 by the largest gap.
                  Two of the three are children, and the answer is child.
                  Canberra keeps the same three in the same order, at
                  0.0566, 0.1012 and 0.1346, and answers child.
                </p>
                <InAModel title="Where cosine parts company">
                  <p>
                    Cosine keeps the first two, at 0.000189 and 0.000650,
                    and for its third voter passes over the child at
                    (145, 57) in favour of the adult at (159, 57), at
                    0.001392. Two adults out of three, and the answer flips
                    to adult. Raise k to five and cosine admits the child at
                    (122, 28) from the far clump, at 0.002168, a person the
                    straight line does not reach at five, where it consults
                    the middle five and answers adult, because that child is
                    small in both measurements and therefore points almost
                    exactly where the query points. Under Hamming every person in the crowd is at
                    exactly 1, the model has nothing to rank by, and the
                    shaded map is one colour everywhere.
                  </p>
                </InAModel>
                <KeepInMind>
                  The p-norms disagree about how far and, when the gaps all
                  point one way, agree about who is nearest, which is why
                  switching among them in the box above changes the numbers
                  in the table and seldom the vote. Cosine and
                  Hamming ask different questions and can change the vote.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. One Formula, One Dial",
          content: (
            <>
              <SubSection title="5. The Minkowski family">
                <p>
                  Manhattan, Euclidean and Chebyshev are one formula. Take
                  the gaps along each feature, raise each to a power, add
                  them up, and take that root back off again. The power is
                  the dial, and the three names are three settings of it.
                </p>
                <Equation>{"minkowski, order p    ( Σ |gap|^p ) ^ (1/p)\n\n    p = 1    the gaps added up          Manhattan\n    p = 2    the straight line           Euclidean\n    p → ∞    the largest single gap      Chebyshev"}</Equation>
                <p>
                  Raising the order shifts weight onto whichever single gap
                  is largest. On the worked gap of 3 and 4 the sweep from
                  one to infinity is a falling sequence, and every value in
                  it was computed rather than interpolated.
                </p>
                <NumberTable
                  headings={["order p", "distance"]}
                  rows={[
                    ["1", "7.000"],
                    ["1.5", "5.584"],
                    ["2", "5.000"],
                    ["3", "4.498"],
                    ["4", "4.285"],
                    ["10", "4.022"],
                    ["∞", "4.000"],
                  ]}
                  caption="The p-norm of the gap (3, 4) at seven orders. It falls from the gaps added up to the larger gap alone, and it never rises."
                />
                <KeepInMind>
                  Only three orders have names, and the neighbour models
                  here accept any order at all, so an order of
                  three is a legitimate choice that no name covers. An order
                  below one is accepted too, and Part 8 records that it is
                  not a distance.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The shape of one unit away">
                <p>
                  The quickest way to feel what a metric does is to ask it
                  which points are exactly one away from a fixed centre.
                  Under Euclidean distance the answer is a circle, which is
                  what the word means. Under Manhattan it is a diamond,
                  because to stay at a total of one you must trade
                  horizontal movement for vertical one for one. Under
                  Chebyshev it is a square, because only the larger gap
                  counts, so you can move freely in the other direction
                  until it overtakes. Each panel below is a lattice of 41 by
                  41 cells a tenth apart, every cell asked how far it is
                  from the centre.
                </p>
                <UnitShapesGallery />
                <p>
                  Hamming&rsquo;s panel looks broken and is not. It can only
                  ever answer zero, a half or one, so of the 1681 cells
                  exactly 1600 sit at its maximum of one and the remaining 81
                  form a cross through the centre, the cells that happen to
                  share a horizontal or a vertical value with it. There is no
                  curve to draw because there is no gradual falling away.
                </p>
                <p>
                  Now click a panel to move the centre, because that is the
                  control that separates the six into two kinds. The circle,
                  the diamond, the square and the cross are the same shapes
                  wherever you put them, and their counts change only where
                  the shape runs off the edge of the lattice. Cosine and
                  Canberra are not. Move the centre to (1, 1) and
                  cosine&rsquo;s region becomes a half-plane of 861 cells
                  with 41 on its boundary, and Canberra&rsquo;s becomes 413
                  with 46, and both change again at the next centre you
                  pick. Their notion of one unit depends on where they are
                  standing, which for Canberra is the entire point of it.
                </p>
                <p>
                  The origin, which is where the gallery starts, is the worst
                  place to stand for both of them. Cosine shades every one of
                  the 1681 cells at exactly one, because the origin has no
                  direction for anything to point away from. Canberra shades
                  only the two axes, 81 cells within one and 80 at exactly
                  one, because dividing a gap by the sum of the pair it
                  separates gives exactly one whenever the other number is
                  zero. Two metrics that work well elsewhere have nothing to
                  say at the one point a reader is most likely to try first,
                  and a model that hands them data centred on zero inherits
                  that silence.
                </p>
                <KeepInMind>
                  The p-norms are translation invariant, which is the formal
                  name for the shapes not moving. Cosine and Canberra read
                  the coordinates themselves rather than only the gaps
                  between them, so where the data sits matters to them, and
                  centring the data, which is harmless to the p-norms, is
                  the one thing that breaks both.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Diamond inside circle inside square">
                <p>
                  Measured on the lattice, the diamond holds 221 cells within
                  one unit, the circle 317 and the square 441, and the
                  boundaries run 40, 12 and 80 cells. That ordering is not an
                  accident of the drawing. The diamond sits inside the
                  circle, which sits inside the square, for every centre and
                  every radius, and the argument is short.
                </p>
                <WhyThisWorks>
                  <p>
                    Take a gap vector and scale it so that its Manhattan
                    length is one, which means the absolute gaps sum to one
                    and each is therefore at most one. A number at most one
                    raised to a higher power gets smaller, so the sum of the
                    gaps raised to any p above one is at most the sum of the
                    gaps themselves, which is one, and the p-th root of a
                    number at most one is at most one. So a point one away
                    under Manhattan is at most one away under every higher
                    order, and the same argument between any two orders
                    gives the nesting all the way up. Raising the order can
                    only shrink a distance, and the shapes swell to match.
                  </p>
                  <Equation>{"p ≤ q   implies   ||gap||_q  ≤  ||gap||_p"}</Equation>
                </WhyThisWorks>
                <p>
                  The same fact read from the worked pair is the sweep in the
                  previous step, 7 down to 4 as the order rises, and read
                  from a model it says that raising the order can never push
                  a person further away, only nearer or the same.
                </p>
                <KeepInMind>
                  Raising the order shrinks every distance and swells the
                  unit shape to match, and the lattice counts 221, 317 and
                  441 are that one fact counted on a grid.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Why the limit is the largest gap">
                <p>
                  The one derivation worth doing is the limit that produces
                  Chebyshev, because it explains why the largest gap is the
                  sensible reading of an infinite order rather than a
                  convention. Call the largest gap M and pull it out of the
                  sum.
                </p>
                <WhyThisWorks title="The derivation">
                  <Equation>{"( Σ |gap|^p ) ^ (1/p)  =  M · ( Σ (|gap| / M)^p ) ^ (1/p)"}</Equation>
                  <p>
                    Every ratio inside that sum is at most one, and the one
                    belonging to the largest gap is exactly one. So as p
                    grows, every term except the largest is a number below
                    one raised to a growing power, and each of them falls
                    toward zero. The sum tends to however many gaps tied for
                    largest, call it t, and the whole expression tends to M
                    times the p-th root of t.
                  </p>
                  <Equation>{"as p → ∞     t ^ (1/p)  →  1        so the distance  →  M"}</Equation>
                  <p>
                    The p-th root of any fixed number tends to one, so the
                    tie count stops mattering and the answer is the largest
                    gap alone.
                  </p>
                </WhyThisWorks>
                <p>
                  On the worked gap the sweep passes 4.285 at order four and
                  4.022 at order ten on its way to 4, which is the smaller
                  gap of 3 being raised to a power and vanishing beside the
                  larger one.
                </p>
                <KeepInMind>
                  Chebyshev is the metric to reach for when a person is
                  unacceptable if they are far off on any one feature,
                  whatever the others say, since it reads the worst feature
                  and nothing else.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Units, and Why Scaling Comes First",
          content: (
            <>
              <SubSection title="9. A distance adds unlike things">
                <p>
                  Every one of the p-norms adds a gap in centimetres to a gap
                  in kilograms as if they were the same kind of number, and
                  they are only comparable because the crowd happens to span
                  about sixty of each. Nothing in the formula knows that. On
                  the worked pair the height column is doing 0.512 of the
                  squared-gap arithmetic across the crowd, which is roughly
                  half, and it is half by luck of the units rather than by
                  any decision.
                </p>
                <p>
                  Put the weights into grams, which changes no person, and
                  the same pair is 4000.001 apart by the straight line where
                  it was 5, with the height gap of 3 contributing 9 to a
                  squared total of 16,000,009, so the distance is the weight
                  gap of 4000 with a correction in the seventh significant
                  figure.
                </p>
                <PairMeasurer panel="column" />
                <KeepInMind>
                  A distance over several features is a sum over those
                  features, and a sum hands the answer to whichever term is
                  largest. The units decide which term that is, and units
                  are a choice the data collector made for reasons of their
                  own.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Weight in grams, weight in tonnes">
                <p>
                  Refit the whole crowd with its weights multiplied by a
                  thousand and the height column&rsquo;s share of the
                  arithmetic falls from 0.512 to about one millionth. On this
                  particular crowd the three people the query consults come
                  back the same three, at 4000.001, 8000.002 and 12000.001,
                  because the ranking by weight alone happens to agree with
                  the ranking by both, and the vote is still child. That is
                  the quiet version of the failure, a model that has stopped
                  reading one of its columns and gives no sign of it.
                </p>
                <InAModel title="Weight in tonnes">
                  <p>
                    Divide the weights by a thousand instead and height does
                    0.999999 of the arithmetic. Now the order changes. The
                    person at (145, 57), who was third at 13, comes second at
                    5.000014, and the person at (156, 53), who was second at
                    10, drops to third at 6.000005, because the model is now
                    ranking by height with weight as a tie-break too small
                    to see. The vote happens to survive here, two children
                    of three either way, and on a crowd where the reordered
                    person carried the other label it would not.
                  </p>
                </InAModel>
                <UnitsRefit />
                <KeepInMind>
                  Grams silence the height column and tonnes silence the
                  weight column, and in either case the model has become a
                  one-feature model with nothing in its output to say so.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Standardise first">
                <p>
                  The repair is to put every column on a scale of its own
                  spread before measuring anything, which is the whole
                  subject of the{" "}
                  <Link href="/concepts/feature-scaling" className={linkClass}>
                    feature scaling
                  </Link>{" "}
                  page and is not repeated here. Standardised, the query is
                  at (−0.080, −0.403) in units of standard deviations, its
                  three nearest are the same three as the raw fit at 0.233,
                  0.466 and 0.618, and the height column does 0.464 of the
                  arithmetic, which is close to the 0.512 it did by accident
                  and now holds whatever units the data arrived in.
                </p>
                <p>
                  The standardised panel of the widget above fits the scaler
                  on the crowd and passes the query through the same
                  scalings, in that order. Fitting it on the crowd and the
                  query together would let the query move the mean it is
                  then measured against, which the{" "}
                  <Link href="/concepts/pipelines" className={linkClass}>
                    pipelines
                  </Link>{" "}
                  page measures as a leak.
                </p>
                <KeepInMind>
                  Everywhere else on this site standardising is a
                  convenience that makes a fit better conditioned. For a
                  distance it is part of being correct, because an
                  unstandardised distance is reading whichever column has
                  the biggest numbers and calling it nearness.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Which metrics are exempt, measured">
                <p>
                  It would be convenient if some of the six were immune to
                  units, and one of them is. Canberra divides each gap by the
                  size of the values it sits between, so multiplying a column
                  by a thousand multiplies the gap and its denominator alike,
                  and the pair reads 0.0566 in kilograms and 0.0566 in
                  grams, identical to the last bit. Hamming is exempt too,
                  trivially, since it asks only whether two values are equal
                  and a thousand times equal values are still equal.
                </p>
                <p>
                  Cosine is the one I expected to be exempt and is not, and
                  the measurement is what corrected me. Cosine ignores the
                  length of a row, so scaling a whole person, both of their
                  measurements together, leaves it unchanged, which Part 4
                  shows. Scaling one column is a different operation. It
                  rotates every row toward the axis of the rescaled column
                  by a different amount, and the pair that measured 0.000189
                  in kilograms measures 0.0000000318 in grams, six thousand
                  times smaller. In grams the whole crowd points almost
                  straight up the weight axis, the largest cosine distance
                  in the crowd shrinks from 0.00901 to 0.00000125, and
                  although the first three voters happen to survive, the
                  ranking from the fourth onward is different. Standardised,
                  cosine changes its answer outright, consulting the child
                  at (147, 41) and the two smallest children from the far
                  clump at 0.0105, 0.175 and 0.182, and answering child
                  where the raw fit answered adult.
                </p>
                <KeepInMind>
                  Canberra and Hamming do not need scaling. Cosine needs it
                  as much as the p-norms do, and the belief that it does not
                  comes from confusing the row it ignores the length of
                  with the column whose units changed.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Direction, Codes and Counts",
          content: (
            <>
              <SubSection title="13. Cosine as an angle">
                <p>
                  Draw a line from the origin to each person and cosine
                  measures the angle between the two lines, as one minus its
                  cosine, and nothing else. Scale the nearest person&rsquo;s
                  whole row by two, so that they stand at (294, 82), and the
                  straight-line distance to the query goes from 5 to 148.68
                  while cosine stays at 0.000189 to the last digit, because
                  the doubled person lies on the same line from the origin.
                  Scale by ten and the straight line reads 1369.5 and cosine
                  still reads 0.000189.
                </p>
                <PairMeasurer panel="row" />
                <p>
                  The extreme case is (1, 1) against (100, 100), which cosine
                  puts at 0.0000000000000002, an epsilon from zero, and the
                  straight line at 140.007. If magnitude carries meaning, and
                  for a person&rsquo;s height and weight it plainly does,
                  that is the wrong answer. If the rows are word counts and
                  a long document should resemble a short one on the same
                  subject, it is exactly the right one, and it is why text is
                  usually handled with angles.
                </p>
                <KeepInMind>
                  Cosine is invariant to scaling a row and not to scaling a
                  column, which is the distinction Part 3 turned on. It is
                  the metric for data where a row&rsquo;s size is an accident
                  of how much of it was collected.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Where cosine has no answer">
                <p>
                  Three things follow from cosine being an angle. The range
                  runs from zero to two, since one minus a cosine can reach
                  two only for rows pointing exactly opposite, and (3, 4)
                  against (−3, −4) does reach 2.0. On data that cannot go
                  below zero, counts and shares and measurements of people,
                  two rows are at most a right angle apart and the distance
                  never exceeds one. A row of all zeros has no direction at
                  all, and it is reported at distance 1 from
                  everything, itself included, which is the convention the
                  wider ecosystem follows and the reason the gallery&rsquo;s
                  cosine panel is one flat colour at the origin.
                </p>
                <p>
                  A query at the origin under cosine is therefore at exactly
                  1 from every one of the eleven people, and the neighbour
                  model consults the first three by index because it has
                  nothing else to go on. The third consequence is the one
                  Part 1 measured, that the triangle inequality fails, so a
                  search that prunes by it would prune wrongly. Rounding adds
                  a small fourth. A row against its own direction lands an
                  epsilon or two from zero rather than on it, and the
                  implementation clamps a distance of minus two times ten to the sixteenth
                  back to zero so that it cannot sort ahead of a genuine
                  zero.
                </p>
                <KeepInMind>
                  Cosine has a blind spot at the origin and no triangle
                  inequality anywhere. Neither matters to a brute-force
                  neighbour search on data that never reaches the origin,
                  and both matter the moment the data is centred.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Hamming reads labels">
                <p>
                  Suppose the first column is a colour encoded as 0, 1 or 2
                  and the second is a size. There is no sense in which colour
                  2 is further from colour 0 than colour 1 is, and every
                  metric on this page except Hamming would insist otherwise.
                  Two people whose colours are two apart are 2.0 apart by
                  the straight line and 1.0 by Canberra, two people whose
                  colours are one apart are 1.0 and 1.0, and Hamming puts
                  both pairs at 0.5, one feature of two disagreeing, which is
                  the only honest answer.
                </p>
                <PairComparisonTable pairs={CODE_PAIRS} />
                <p>
                  Hamming is reported as a share rather than a count, so
                  that 0.25 means one feature in four whether there are four
                  features or four hundred, and so that it sits on the same
                  scale whatever the width of the table.
                </p>
                <KeepInMind>
                  Hamming is the one metric here that treats values as labels
                  rather than quantities, and therefore the only one that
                  means anything on categorical codes. On measurements that
                  vary continuously it answers 1 for almost every pair,
                  which is what happened to the crowd.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Exact equality, and the trap in it">
                <p>
                  Hamming asks whether two floating-point numbers are equal,
                  and equality on floats is exact. The last row of the table
                  above compares 0.3 against 0.1 plus 0.2, which are one
                  binary digit apart, and Hamming counts that as a
                  disagreement worth 0.5 where the straight line reads it as
                  a distance of 0.00000000000000006. For the categorical
                  codes Hamming is meant for, integers written down rather
                  than computed, that is the right behaviour. For anything
                  that has been through an arithmetic step it is a trap.
                </p>
                <KeepInMind>
                  Hand Hamming values that were assigned, never values that
                  were calculated. A standardised column is calculated, so
                  standardising before a Hamming distance turns every
                  feature into a disagreement.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Canberra reads a gap against its size">
                <p>
                  Suppose the two columns are counts, a rare species beside a
                  common one, and two sites differ by one in each. The
                  straight line reads the two gaps alike. Canberra reads the
                  first gap against the size of the counts it sits between
                  and the second the same way, and the same gap of one is
                  worth 1.0 between zero and one, 0.333 between one and two,
                  and 0.005 between a hundred and a hundred and one.
                </p>
                <PairComparisonTable pairs={COUNT_PAIRS} showCanberraTerms />
                <p>
                  That is the point of it and also the catch. A gap from a
                  thousandth to two thousandths is worth exactly what a gap
                  from one to two is worth, 0.333, so on data that merely
                  happens to straddle zero Canberra amplifies noise, while
                  on counts, where going from none to one genuinely is a
                  bigger event than going from a hundred to a hundred and
                  one, it is saying what you want said. Where both values
                  are zero the term is 0 over 0, and it is defined here
                  as zero, because the two rows agree on that feature and
                  agreement should not cost anything. That is why the last
                  pair in the table, zero against zero in the first column,
                  reads 0 plus 1.
                </p>
                <KeepInMind>
                  Every Canberra term lies between zero and one whatever the
                  units, which is what makes it the one option that tolerates
                  unstandardised input, and it pays for that by being most
                  sensitive exactly where the values are smallest.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Which Models Can Choose",
          content: (
            <>
              <SubSection title="18. The neighbour models take any distance">
                <p>
                  The nearest neighbours regressor and classifier take the
                  metric as a setting, since a neighbour model learns nothing
                  and the metric is the whole of its opinion. The six named
                  metrics are a closed set, so a misspelling is refused
                  rather than silently defaulted, and beyond the six the
                  model accepts any object that can measure every query
                  against every stored row. An order-three p-norm, which no
                  name covers, ranks the worked crowd&rsquo;s nearest three at
                  4.498, 8.996 and 12.28, between the Euclidean 5, 10, 13
                  and the Chebyshev 4, 8, 12 as Part 2 says it must.
                </p>
                <KeepInMind>
                  A metric nobody has named yet is a subclass with one
                  method, and the neighbour models will use it without
                  knowing it is new. The six names cover the six worth
                  spelling, and anything else that can measure a query
                  against a stored row is accepted beside them.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Density and linkage take one too">
                <p>
                  Two of the clusterers take the same setting, and each for
                  the same reason, that all the model ever asks of a distance
                  is a comparison. The density clusterer asks whether one
                  person is within a radius of another and groups whoever is
                  connected by such steps; single, complete and average
                  linkage ask which two groups are nearest and merge them.
                  Any of the six answers either question. What changes is
                  that the radius is in the metric&rsquo;s own units, and
                  twenty means something different under each.
                </p>
                <DensityUnderMetrics />
                <InAModel title="The crowd at a radius of twenty">
                  <p>
                    Under Euclidean and Manhattan the density clusterer finds
                    the three clumps, the far children, the middle five and
                    the far adults, with nobody left out. Under Chebyshev,
                    where twenty is a wider net because only the larger gap
                    counts, the middle five and the far adults fuse into one
                    group and it finds two. Widen the radius to thirty and
                    Euclidean and Chebyshev fuse everyone into one group
                    while Manhattan, reading every gap at full size, still
                    finds three. Shrink it to five and Manhattan leaves six
                    people in no group at all where Euclidean leaves two.
                    Under cosine, Hamming and Canberra a radius of twenty is
                    larger than any distance in the crowd, so each finds one
                    group, and cosine needs a radius of a thousandth to see
                    two, at which it also leaves the person at (147, 41) in
                    none.
                  </p>
                </InAModel>
                <p>
                  Single linkage cut at two groups gives a cleaner reading of
                  what each metric thinks the crowd is. Four of the six cut
                  the three far children off from the other eight, Euclidean
                  making its first merge at 2.236 and its last at 23.35 and
                  Manhattan at 3 and 33. Cosine cuts by direction instead,
                  and puts the person at (147, 41) with the three far
                  children, because all four are small in both measurements
                  and point the same way. Hamming, with every pair at 1, has
                  nothing to merge by, and its cut leaves one person alone
                  and says nothing about the crowd.
                </p>
                <KeepInMind>
                  A radius or a merge height is a distance, so it belongs to
                  the metric it was measured under and does not transfer.
                  Twenty is a fact about Euclidean centimetres and kilograms
                  and means nothing under cosine.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Why k-means cannot">
                <p>
                  It would be reasonable to expect every method that measures
                  distance to offer the same dial, and the k-means page does
                  not. The reason is a fact about the algorithm rather than a
                  simplification of it. k-means alternates two steps, put
                  every person with the nearest centre and then move each
                  centre to the mean of the people it now holds, and the
                  argument that it must settle rests on both steps lowering
                  one total. The second step lowers it because the mean is
                  the point that minimises the sum of squared distances to a
                  group, and that is a fact about squared Euclidean distance
                  specifically.
                </p>
                <p>
                  Measured on the crowd&rsquo;s weight column, whose mean is
                  53.36 and whose median is 57, the total squared gap from
                  the mean is 4742.5 and from the median 4888.0, so the mean
                  wins on squares. The total absolute gap from the mean is
                  191.6 and from the median 188.0, so the median wins on
                  absolute gaps, which are Manhattan&rsquo;s currency. Hand
                  k-means Manhattan and its update step moves the centre to
                  the wrong place for the total it is supposed to be
                  lowering, the convergence argument collapses, and what is
                  left is a loop with no guarantee.
                </p>
                <NumberTable
                  headings={["centre", "total squared gap", "total absolute gap"]}
                  rows={[
                    ["mean, 53.36", "4742.5", "191.6"],
                    ["median, 57", "4888.0", "188.0"],
                  ]}
                  caption="The crowd’s eleven weights against two candidate centres. Each centre wins the column whose total it minimises, and the update step of k-means computes the mean."
                />
                <p>
                  So the metric is a setting on the neighbour models and on
                  the density and linkage clusterers, where it is a genuine
                  choice, and is absent from{" "}
                  <Link href="/concepts/k-means" className={linkClass}>
                    k-means
                  </Link>
                  , where offering it would be offering something that does
                  not work. The method that does what the expectation wants
                  is k-medoids, which replaces the mean with an actual member
                  of the group, and it is not built here.
                </p>
                <KeepInMind>
                  A model can take a metric only if every step it makes is
                  defined by comparisons alone. The moment a step computes a
                  centre, the centre&rsquo;s arithmetic has chosen the metric
                  already.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Ward and the map are Euclidean for the same reason">
                <p>
                  The same line runs through two other places. Ward linkage
                  merges whichever pair of groups adds least to the spread
                  about a group mean, so it computes a mean and inherits
                  k-means&rsquo; restriction, and pairing it with Manhattan
                  is refused at construction with a message that says so
                  rather than producing a number the rule does not describe.
                  The{" "}
                  <Link href="/concepts/self-organising-map" className={linkClass}>
                    self-organising map
                  </Link>{" "}
                  moves a winning unit a step along the negative gradient of
                  half the squared Euclidean distance, which is a different
                  step from the one Manhattan&rsquo;s gradient would take, so
                  it refuses the setting for a reason one step removed from
                  the mean.
                </p>
                <Equation>{"ward with manhattan  →  refused at construction\n\n\"ward linkage merges whichever pair adds least to the spread about a group mean, and a mean minimises squared Euclidean distance and no other\""}</Equation>
                <KeepInMind>
                  Single, complete and average linkage summarise a block of
                  pairwise distances and take any metric. Ward reads the
                  group means and takes Euclidean alone, and the
                  implementation branches on exactly that property rather than on the
                  linkage&rsquo;s name.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. How the Numbers Are Computed",
          content: (
            <>
              <SubSection title="22. Every query against every stored row">
                <p>
                  A neighbour model at prediction time measures every query
                  against every remembered row, so the answer is a table
                  with one row per query and one column per stored person.
                  The general way to build it is to line every query up
                  against every stored row, subtract, and reduce over the
                  features, which produces a three-dimensional array of
                  queries by rows by features before the reduction collapses
                  it. Five hundred queries against twenty thousand stored
                  rows over twenty features is two hundred million numbers
                  at eight bytes each, 1.6 gigabytes for an answer that
                  occupies 80 megabytes.
                </p>
                <p>
                  Four of the six metrics have no way round that array, so the
                  queries are taken a block at a time, with the block sized
                  so the pairing array stays under 64 megabytes, and
                  the loop changes only the peak memory and never the
                  arithmetic, so the blocked and unblocked answers agree bit
                  for bit. The other two reduce to a matrix multiply and
                  never build the array at all.
                </p>
                <KeepInMind>
                  The cost of a neighbour model is paid at prediction rather
                  than at fit, and it is proportional to queries times stored
                  rows times features. Nothing about the metric changes that
                  product; what changes is whether the intermediate has to
                  exist.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Euclidean by a matrix multiply">
                <p>
                  Open the square in the Euclidean formula and the expensive
                  part becomes a single matrix product. The two squared-norm
                  terms are one pass over each input, and the cross term is
                  every query dotted with every stored row, which is the
                  product of the query block with the transposed stored
                  block.
                </p>
                <Equation>{"||a − b||²  =  ||a||²  −  2 a · b  +  ||b||²"}</Equation>
                <p>
                  On the worked pair the three routes agree. The definition
                  gives 5, the expansion on the raw coordinates gives
                  4.999999999999273, and the centred expansion gives 5. The expansion
                  is off in the thirteenth decimal on numbers around a
                  hundred and fifty, which is the first sign of what the next
                  step shows. Cosine takes the same route, since after each
                  row is scaled to unit length the whole table is one matrix
                  product of unit rows.
                </p>
                <KeepInMind>
                  The matrix product is the same arithmetic rearranged so
                  that a linear algebra routine can do the cross term in
                  blocked, threaded code, and the only thing it changes is
                  where the rounding happens, which is why it is exact
                  wherever that rounding is harmless.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Why it shifts to the mean first">
                <p>
                  Recovering a small number by subtracting two large nearly
                  equal ones is the classic way to lose it, and the expansion
                  is that pattern exactly. Put two people at coordinates near
                  a million, a millionth apart along one feature. The
                  definition gives 0.0000010000076, which is right to the
                  digits the input carries. The expansion on the raw
                  coordinates gives exactly 0.0, the entire distance gone,
                  because the two squared lengths are each about two
                  million million and their difference is smaller than the
                  rounding in either. Widen the gap to a thousandth and the
                  raw expansion still gives 0.0. Only at a gap of one do the
                  three routes agree again, at 1.0 each.
                </p>
                <FarFromOrigin />
                <p>
                  Both symptoms come from the coordinates being far from the
                  origin rather than from the people being close together,
                  so the implementation subtracts the stored rows&rsquo; mean from
                  both inputs before expanding. Shifting every point equally
                  leaves every distance unchanged while making each squared
                  length a number the size of the spread rather than of the
                  offset, and on the pathological pair the shifted expansion
                  returns the definition&rsquo;s answer exactly. The shift is
                  also why the crowd with a constant height column, in Part
                  8, reports its second neighbour at 7.999999999999999 rather
                  than 8, since the arithmetic is now done on deviations and
                  rounds where the definition would not. A clamp at zero
                  stays regardless, because the square root of a tiny
                  negative is not a number and would propagate silently
                  through a mean.
                </p>
                <KeepInMind>
                  The expansion is safe only once the numbers it subtracts are
                  the size of the spread rather than of the offset. Centring
                  costs one subtraction per value and turns a formula that
                  fails on real coordinates into one that agrees with the
                  definition to the last bit.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. The Curse of Dimensionality",
          content: (
            <>
              <SubSection title="25. Nearest against farthest">
                <p>
                  Every distance on this page was measured in two features,
                  and two is where distance works best. Add columns and
                  something happens to the word nearest that no choice of
                  metric undoes. Draw two hundred rows at random in one
                  feature, measure every row against every other, and ask
                  for each row how much further its farthest neighbour is
                  than its nearest, as a ratio to the nearest. The median of
                  that ratio is 369.8, so a typical row has a neighbour
                  hundreds of times nearer than the rest. Keep the same rows
                  and add features, each drawn the same way, and the median
                  falls to 28.3 in two, 4.50 in five, 1.98 in ten, 0.544 in
                  fifty and 0.235 in two hundred. At two hundred features the
                  nearest row is only about a quarter nearer than the
                  farthest, so the k nearest is very nearly a random subset
                  wearing a disguise.
                </p>
                <Equation>{"relative contrast  =  (farthest − nearest) / nearest,   one ratio per row, the median over rows"}</Equation>
                <DimensionCurse />
                <p>
                  Richard Bellman named the curse of dimensionality in 1957,
                  for the way the volume of a box grows with its dimension,
                  and Beyer, Goldstein, Ramakrishnan and Shaft asked the
                  question this widget answers in &ldquo;When is nearest
                  neighbor meaningful?&rdquo; in 1999. Their result is that
                  when the spread of distances from a query grows more slowly
                  than their average, which it does for independent
                  features, every point ends up about equally far away and
                  nearest stops being a property of the data.
                </p>
                <KeepInMind>
                  This is a property of distance itself rather than of any
                  implementation of it, and the mean of the same ratio,
                  which is the measure I first recorded, tells the same
                  story at 3248 in one feature and 0.238 in two
                  hundred. Nothing in the fit can see that its neighbours
                  have become arbitrary.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Which metric keeps the most contrast">
                <p>
                  The six do not lose contrast at the same rate. At two
                  hundred features the medians are 0.540 for cosine, 0.297
                  for Manhattan, 0.266 for Canberra, 0.235 for Euclidean and
                  0.193 for Chebyshev, so the ordering runs from the metric
                  that reads only the angle down to the one that reads only
                  the worst feature, with the p-norms in order of their
                  exponent. Hamming on continuous rows is at zero throughout,
                  since every pair disagrees on every feature and every
                  distance is exactly 1.
                </p>
                <NumberTable
                  headings={["metric", "median contrast at 200 features"]}
                  rows={[
                    ["cosine", "0.540"],
                    ["Manhattan", "0.297"],
                    ["Canberra", "0.266"],
                    ["Euclidean", "0.235"],
                    ["Chebyshev", "0.193"],
                    ["Hamming", "0"],
                  ]}
                  caption="Two hundred uniform rows at seed zero. Lower exponents keep more contrast, and the angle keeps the most."
                />
                <p>
                  That the lower exponents hold up better is the result of
                  Aggarwal, Hinneburg and Keim in 2001, who found that
                  Manhattan beats Euclidean in high dimensions and that
                  fractional orders below one beat both, and it is why Manhattan is
                  the steadier choice on data with many columns. Cosine keeps the most
                  here, which is part of why text, with its thousands of
                  columns, is handled with angles. In two features cosine is
                  the outlier the other way, with a median of 128,032 and a
                  mean of 2,694,429, because a few rows have another row
                  almost exactly on their line from the origin and the ratio
                  divides by a nearest distance near zero.
                </p>
                <KeepInMind>
                  The differences between the metrics at two hundred features
                  are real and small. Choosing cosine over Euclidean roughly
                  doubles the contrast, and roughly double a quarter is still
                  a half, which is a long way from the hundreds a single
                  feature offered.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. What to do about it">
                <p>
                  Since the loss is a property of distance, the remedies
                  are all about having fewer columns or better ones. The{" "}
                  <Link href="/concepts/pca" className={linkClass}>
                    principal component analysis
                  </Link>{" "}
                  page keeps the few directions the data actually varies
                  along, which is the usual first move before a neighbour
                  model on wide data, and the measurement above is the reason
                  it is usual. Standardising, from Part 3, does not help
                  here, since the drawn features already share a scale, and
                  neither does any metric on its own. The fractional orders
                  that Aggarwal, Hinneburg and Keim recommend are available
                  here, since the p-norm takes any positive order,
                  and Part 8 records the price, which is that below one the
                  triangle inequality fails.
                </p>
                <KeepInMind>
                  When a neighbour model on many columns scores badly, the
                  first question is how many columns rather than which
                  metric, and the answer is usually to reduce them before
                  measuring anything.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="28. What an implementation must specify and refuse">
                <p>
                  A complete implementation states which metrics it names
                  and whether an unnamed one can be supplied, what order the
                  p-norm family accepts, how Hamming compares floating-point
                  values, what Canberra does with a zero over zero, what
                  cosine does with a row of zeros and with rounding either
                  side of one, whether Euclidean is computed by definition or
                  by expansion and, if by expansion, what it centres on,
                  how a pairing array is bounded, how ties in a ranking are
                  broken, and which models may take the metric and which
                  refuse it. Every row below was probed.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "no people at all", reason: "refused at the site's boundary before any distance is measured; a request must carry at least one person." },
                    { expression: "one person", reason: "refused by the classifier as a single class, since there is nothing to discriminate between; a lone row is a valid stored set for the distance itself." },
                    { expression: "more neighbours asked for than people", reason: "refused, in the implementation's own words, 12 neighbours were asked for and only 11 rows were supplied." },
                    { expression: "a constant column", reason: "accepted by every metric; the crowd with every height at 150 ranks its three nearest at 4, 7.999999999999999 and 11.999999999999998, the odd digits being the centred expansion's rounding. The standardizer refuses the same column, because its spread is zero." },
                    { expression: "a value that is not finite", reason: "refused at the implementation's boundary, feature_values must contain only finite values, and the request layer cannot carry one in the first place, since JSON has no spelling for it." },
                    { expression: "a query on a stored person", reason: "accepted; that person is at exactly 0.0 and votes first." },
                    { expression: "the same person stored twice", reason: "accepted; both copies sit at 5.0, both are consulted, and ties are broken by index, so the earlier copy comes first." },
                    { expression: "a query at the origin under cosine", reason: "accepted; every person is at exactly 1.0 and the first three by index vote, which is the documented blind spot rather than a refusal." },
                    { expression: "a query at the origin under Canberra", reason: "accepted; every person is at exactly 2.0, since both terms divide a value by itself." },
                    { expression: "0.3 against 0.1 + 0.2 under Hamming", reason: "counted as a disagreement, 0.5 of two features, because equality on floats is exact; documented rather than defended." },
                    { expression: "a p-norm order below one", reason: "accepted; the order 0.5 puts the worked pair at 13.93, above Manhattan's 7, and on the three points (0, 0), (1, 1) and (1, 0) the direct route is 4.0 where the two legs sum to 2.0, so it is not a distance. Documented rather than refused." },
                    { expression: "an unknown metric name", reason: "refused at the boundary; the six names are a closed set and euclidian is not one of them." },
                    { expression: "an unfitted model asked to predict", reason: "refused by name as not yet fitted, rather than as an index error from an empty store." },
                    { expression: "a query with a feature renamed or missing", reason: "refused, expecting features height, weight and getting height, mass. Reordered features are accepted, since matching is by name." },
                    { expression: "ward linkage with any metric but Euclidean", reason: "refused at construction, with the reason in the message." },
                    { expression: "the density clusterer with a radius of zero", reason: "refused at construction; a radius must be positive." },
                    { expression: "the linkage clusterer on one person, cut at two groups", reason: "refused, since 2 groups were asked for and 1 row(s) were supplied. On two people the cut is made and there is no merge to report." },
                    { expression: "a coordinate beyond a million", reason: "refused at the site's own boundary as a bound on hand-entered data; the implementation itself has no such limit." },
                  ]}
                />
                <p>
                  The two rows that deserve a second look are the ones that
                  are accepted. An order below one and a Hamming comparison
                  of computed floats both give a number that a caller can
                  use, and both give one that is not what the caller probably
                  meant. Each is documented rather than refused,
                  because the first is a legitimate request in a
                  high-dimensional setting and the second is correct on the
                  data Hamming exists for.
                </p>
                <KeepInMind>
                  What is refused here is refused by name, and what is
                  accepted and strange is written down, so that no number
                  comes back with its meaning left to be guessed at.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
