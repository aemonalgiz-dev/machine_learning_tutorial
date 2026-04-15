import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { FeatureScalingPlayground } from "@/components/widgets/FeatureScalingPlayground";

export const metadata: Metadata = {
  title: "Feature Scaling · oop_ml",
  description:
    "Put every column on the same footing by subtracting a centre and dividing by a spread, and see why five ways of choosing those two numbers answer five different worries.",
};

export default function FeatureScalingPage() {
  return (
    <ConceptPage
      title="Feature Scaling"
      tagline="Subtract a centre, divide by a spread, and a model can no longer mistake the units of a column for its importance."
      prerequisites={
        <>
          The mean and the standard deviation come from the{" "}
          <Link
            href="/primers/statistics"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            statistics primer
          </Link>
          , and the median and quartiles are their rank-based cousins, met here
          for the first time. Nothing else is needed, though the section on
          when the scale lies points forward to the pages where scaling earns
          its keep.
        </>
      }
      history={
        <>
          <p>
            In 1884 Francis Galton opened an anthropometric laboratory at the
            International Health Exhibition in London and measured thousands of
            visitors, their height, their weight, the strength of their grip,
            the keenness of their sight. Every trait arrived in its own unit,
            and to say how widely a trait varied he sorted its values into rank
            order and read off the quartiles, the points a quarter and three
            quarters of the way along the list. Karl Pearson, putting
            Galton&rsquo;s biometry onto an algebraic footing, named the
            standard deviation in 1893, and it became the spread every later
            method reached for by default. The two spreads on this page are
            those two men&rsquo;s answers to the same question, and they still
            disagree about the same thing, which is how much a wild value
            should count.
          </p>
          <p>
            The problem that forced scaling onto every practitioner arrived
            with methods that compare columns to each other. Robert Sokal and
            Peter Sneath, building numerical taxonomy in 1963, measured the
            distance between organisms across dozens of characters at once and
            argued for standardising each character first, so that no single
            measurement, large only because of its unit, could decide how alike
            two specimens were. John Tukey had shown in 1960 that mixing a
            small share of wilder values into a normal sample was enough to
            make the standard deviation a poor summary of its spread, and Peter
            Huber&rsquo;s 1964 paper gave that unease a theory. The median and
            the quartiles Galton had used eighty years earlier came back as a
            deliberate choice, a spread that a handful of outliers cannot
            reach.
          </p>
        </>
      }
      playground={<FeatureScalingPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Height in centimetres and weight in kilograms sit on different
                scales for no reason a model should care about, and a model that
                measures distance between rows or penalises the size of a
                coefficient will read those units as facts. The top line above
                holds one column of raw values. The five rows beneath it are the
                same column after five corrections, each one subtracting a
                centre and dividing by a spread, and each one choosing those
                two numbers differently.
              </p>
              <p>
                Watch the amber dot. It is the same value in every row, and the
                readouts at the right are that one number read on five rulers.
                Under standardizing it sits one and a half spreads above the
                mean. Under min-max and max-abs it sits at exactly 1, because it
                is the largest value and both of those methods send the largest
                value to the end of their ruler. Nothing about the value changed
                between rows, only what it was measured against.
              </p>
              <p>
                Now press the outlier button, or drag the amber dot to the far
                right yourself, and watch which rows move. Min-max and max-abs
                squash the other four values toward zero, because one wild
                value now sets the spread for all of them. The standardize row
                shifts too, since the mean and the standard deviation both feel
                the outlier. The robust row does not move by a hair. Its centre
                and spread come from the median and the quartiles, which never
                looked at the largest value, so the outlier flies off the end
                of that ruler and leaves everyone else exactly where they were.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Every method on this page is one line of arithmetic, applied to
                each column on its own.
              </p>
              <Equation>{"scaled = (value − centre) / spread"}</Equation>
              <p>
                What differs is only where the two numbers come from, and the
                whole family fits in a table.
              </p>
              <Equation>{"standardize        centre = mean              spread = standard deviation\nmin-max            centre = smallest value    spread = largest − smallest\nmax-abs            centre = 0                 spread = largest magnitude\nrobust             centre = median            spread = third quartile − first quartile\nroot mean square   centre = 0                 spread = √(mean of the squares)"}</Equation>
              <p>
                Each row of the table is an answer to a different worry.
                Standardizing leaves a column with mean zero and spread one, so
                a coefficient fitted on it answers how much the target moves
                per standard deviation, which is comparable across columns.
                Min-max lands everything in the unit interval, which is what an
                image pipeline or a bounded activation wants. Max-abs divides
                without centring, so a zero stays a zero, a sparse column stays
                sparse and the sign survives. Robust reads the median and the
                quartiles, which ignore the tails entirely. Root mean square
                divides by magnitude about zero and keeps the level, on the
                view that where a column sits is information rather than
                nuisance.
              </p>
              <p>
                One rule holds for all five. The centre and spread are learned
                from the training rows and then reused, unchanged, on every row
                that comes later. Recomputing them on held-out data would centre
                the test rows on a mean the model never saw, which is a leak,
                and would feed the fitted coefficients numbers on a different
                scale from the ones they were fitted to. The library keeps fit
                and transform as separate steps for exactly this reason.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the tidy sample button, five values of 9, 19, 24, 29 and
                39, chosen so that every centre and spread comes out as a whole
                number. The mean first.
              </p>
              <Equation>{"9 + 19 + 24 + 29 + 39 = 120,   120 / 5 = 24"}</Equation>
              <p>
                The deviations from 24 are −15, −5, 0, 5 and 15, whose squares
                are 225, 25, 0, 25 and 225. Their mean is the variance and its
                square root is the standard deviation, so standardizing reads a
                centre of 24 and a spread of 10, which is what the first row
                prints. Root mean square runs the same sum on the values
                themselves rather than on their deviations, and its spread
                comes out at 26.
              </p>
              <Equation>{"225 + 25 + 0 + 25 + 225 = 500,   500 / 5 = 100,   √100 = 10\n81 + 361 + 576 + 841 + 1521 = 3380,   3380 / 5 = 676,   √676 = 26"}</Equation>
              <p>
                The rest follow from the sorted list. Min-max takes the smallest
                value, 9, as its centre and the range, 39 minus 9, as a spread
                of 30. Max-abs centres on zero and divides by the largest
                magnitude, 39. Robust takes the middle value, 24, as its centre,
                and the library places the quartiles a quarter and three
                quarters of the way along the sorted list, which for five values
                is exactly the second and the fourth, 19 and 29, so the spread
                is 10. Now put the 39 through all five, which is the amber dot
                when the tidy sample is showing.
              </p>
              <Equation>{"(39 − 24) / 10 = 1.5\n(39 − 9) / 30 = 1.0\n39 / 39 = 1.0\n(39 − 24) / 10 = 1.5\n39 / 26 = 1.5"}</Equation>
              <p>
                The readouts at the right say 1.50, 1.00, 1.00, 1.50 and 1.50.
                Standardize and robust agree here by coincidence rather than by
                rule. The sample is symmetric, so its median is its mean, and
                its two quartiles happen to sit exactly one standard deviation
                apart, so the interquartile range and the standard deviation
                are the same 10. The outlier button breaks that coincidence at
                once, and the next section says how.
              </p>
            </>
          ),
        },
        {
          title: "When the Scale Lies",
          content: (
            <>
              <p>
                Press the outlier button and the 39 becomes 99. The mean jumps
                from 24 to 36, the min-max spread from 30 to 90 and the max-abs
                spread from 39 to 99, so under those two methods the four
                ordinary values are squashed into the first third of the ruler,
                the 29 landing at 0.22 under min-max and at 0.29 under max-abs.
                The robust row still prints a centre of 24 and a spread of 10. The median and the quartiles are positions in the sorted
                list, and replacing the largest value with a larger one changes
                no position, so the 99 lands at 7.5, far off the end of that
                ruler, while the other four sit precisely where the tidy sample
                left them. One method is honest about the outlier by moving
                everything. Another is honest about it by moving nothing but the
                outlier. Which honesty you want depends on whether the wild
                value is a measurement or a mistake.
              </p>
              <p>
                Whether any of this matters depends entirely on the model. A{" "}
                <Link
                  href="/concepts/k-nearest-neighbours"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  nearest-neighbour
                </Link>{" "}
                model adds up squared differences column by column, so a column
                recorded in grams contributes a million times the squared
                differences the same column would in kilograms, and nearest is
                quietly decided by that one column alone.{" "}
                <Link
                  href="/concepts/ridge-lasso"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  Ridge
                </Link>{" "}
                penalises the sum of the squared coefficients, and a column
                whose numbers run small, a height recorded in kilometres rather
                than centimetres, needs a coefficient a hundred thousand times
                larger to do the same work, so the penalty falls hardest on
                whichever column happens to be recorded in the largest units,
                an accident of bookkeeping the fit reports as a fact about the
                data. Neither model can tell the difference from the inside.
              </p>
              <p>
                A{" "}
                <Link
                  href="/concepts/decision-trees"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  decision tree
                </Link>{" "}
                never notices. Every split asks whether a value is above a
                threshold, and the rows that go left when asked about 165
                centimetres go left when asked about 1.65 metres, because any
                rescaling that keeps the order moves the threshold along with
                the values. The tree, its leaves and its accuracy are identical
                before and after, which is why the tree pages and the ensembles
                built on them never scaled anything. Scaling is not a ritual to
                perform on every dataset. It is a correction for models that
                measure, and a no-op for models that only compare.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                All five methods are one affine map, a subtraction followed by
                a division, and what a method promises is whatever that map
                fixes. Standardizing promises a variance of exactly one, and
                three lines show why. Write m for the mean and s for the
                population standard deviation, so that s² is the mean of the
                squared deviations, and put every value through the map.
              </p>
              <Equation>{"zᵢ = (xᵢ − m) / s\nmean(z) = (1/n) Σ (xᵢ − m) / s = (1/s) · (m − m) = 0\nvar(z)  = (1/n) Σ (xᵢ − m)² / s² = s² / s² = 1"}</Equation>
              <p>
                The first line is the map. The second says the deviations from
                a mean always cancel, the statistics primer&rsquo;s balance
                point, so dividing them by anything still leaves a mean of zero.
                The third is the whole argument. The mean of the squared
                deviations is s² by definition, and dividing every deviation by
                s divides that mean by s², which leaves exactly one. It is exact
                only because the library measures s with the population
                divisor n. Divide by n − 1 instead and the standardized
                variance comes out at (n − 1) / n, close to one and not one.
              </p>
              <p>
                The same move reads the promise off every other row of the
                table. Min-max sends the smallest value to 0 and the largest to
                1 and fixes nothing in between. Robust sends the two quartiles
                to points exactly one apart, at whatever position the median
                leaves them, so the middle half of the column always spans one
                unit. Root mean square makes the mean of the squared scaled
                values one, since it divided by the square root of exactly that
                mean. None of them is more correct than the others. Each fixes
                the one thing its worry was about, and leaves the rest of the
                column to fall where the data puts it.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
