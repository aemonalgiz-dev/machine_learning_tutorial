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
import { AnglesFromTheMean } from "@/components/widgets/AnglesFromTheMean";
import { BedtimeClock } from "@/components/widgets/BedtimeClock";
import { CentringPlayground } from "@/components/widgets/CentringPlayground";
import { ShiftInvariance } from "@/components/widgets/ShiftInvariance";
import { WalkFromTheMean } from "@/components/widgets/WalkFromTheMean";

export const metadata: Metadata = {
  title: "Centering on the Mean · Perceptron Lab",
  description:
    "Subtracting the mean expresses each measurement relative to the average. The differences between observations stay the same, while zero becomes a useful reference for their departures from that average.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function CentringOnTheMeanPage() {
  return (
    <ConceptPage
      lessonId="centring-on-the-mean"
      intuition={lessonIntuitions["centring-on-the-mean"]}
      technicalStart="Part 1. Moving the Zero to the Average Person"
      openingTitle="Move Zero to Somewhere Useful"
      playgroundTitle="Move the origin without moving people apart"
      playgroundIntro="Compare the original coordinates with the centered ones. Watch which distances stay fixed when the origin moves to the mean."
      title="Centering on the Mean"
      tagline={"Subtracting the mean expresses each measurement relative to the average. The differences between observations stay the same, while zero becomes a useful reference for their departures from that average."}
      prerequisites={
        <>
          The mean comes from the{" "}
          <Link href="/primers/statistics" className={link}>
            statistics primer
          </Link>{" "}
          and nothing else from it is needed. This page is the first half of the{" "}
          <Link href="/concepts/the-standard-score" className={link}>
            standard score
          </Link>

          , the half that is not about scale, and the wider family of centers
          and spreads is on the{" "}
          <Link href="/concepts/feature-scaling" className={link}>
            feature scaling
          </Link>{" "}
          page. The methods it is measured on live on the{" "}
          <Link href="/concepts/pca" className={link}>
            principal component
          </Link>
          ,{" "}
          <Link href="/concepts/gradient-descent-regression" className={link}>
            gradient descent
          </Link>{" "}
          and{" "}
          <Link href="/concepts/distance-and-similarity" className={link}>
            distance and similarity
          </Link>{" "}

          pages, and what each of them does is restated here as far as centering
          needs it.
        </>
      }

      playground={<CentringPlayground />}
      sections={[
        {
          title: "Part 1. Moving the Zero to the Average Person",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Where zero sits in the crowd">
                <p>The eleven people&apos;s coordinates express their heights and weights relative to zero. To ask who is above or below this group&apos;s average, we can use the mean as a new reference point. Subtracting the reference changes the coordinates without changing the people or their units.</p>
                <p>For each column, subtract its mean from every measurement. The result is a deviation from that column&apos;s average, and the operation is called centering. A centered height still measures a difference in centimeters.</p>
                <Equation>{"centered value = value − mean of its column"}</Equation>
                <WorkedExample title="The crowd, centered">
                  <>
                    <p>

                      The eleven heights add to 1670 centimeters and the eleven weights
                      to 587 kilograms. Divide each total by the number of people to
                      find the center of that column.
                    </p>
                    <Equation>{"mean height = 1670 / 11 ≈ 151.82 cm\nmean weight = 587 / 11 ≈ 53.36 kg"}</Equation>
                    <p>

                      Now subtract the corresponding mean from each measurement. The
                      first child is 147 centimeters tall and weighs 41 kilograms. The
                      tallest adult is 183 centimeters tall and weighs 83 kilograms.
                    </p>
                    <Equation>{"first child:   (147 − 1670/11, 41 − 587/11) ≈ (−4.82, −12.36)\ntallest adult: (183 − 1670/11, 83 − 587/11) ≈ (31.18, 29.64)"}</Equation>
                    <p>

                      Negative values mean below the column average; positive values
                      mean above it. The units remain centimeters and kilograms.
                    </p>
                  </>
                  <NumberTable
                    headings={["height", "weight", "centered height", "centered weight"]}
                    rows={[
                      ["147", "41", "−4.82", "−12.36"],
                      ["156", "53", "4.18", "−0.36"],
                      ["145", "57", "−6.82", "3.64"],
                      ["159", "57", "7.18", "3.64"],
                      ["162", "61", "10.18", "7.64"],
                      ["120", "25", "−31.82", "−28.36"],
                      ["122", "28", "−29.82", "−25.36"],
                      ["118", "24", "−33.82", "−29.36"],
                      ["180", "80", "28.18", "26.64"],
                      ["183", "83", "31.18", "29.64"],
                      ["178", "78", "26.18", "24.64"],
                    ]}
                    caption="Centering subtracts each column’s mean without changing its unit or rescaling its differences."
                  />
                </WorkedExample>
                <KeepInMind>

                  Centering learns the mean of each column and nothing else, and
                  its output keeps the column&rsquo;s unit. The playground at the
                  top of the page draws the crowd with its zero where the sliders
                  put it, and the button marked for the average person moves the
                  zero to 151.82 and 53.36.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What the subtraction keeps">
                <p>

                  Taking the same number away from every height moves the whole column along its ruler and changes nothing about how the heights sit relative to one another. The 145 cm child and the 147 cm child were two centimeters apart before and are two apart after, and so is every other pair; the largest change in the gap between any two people&rsquo;s heights came out at exactly zero.
                </p>
                <p>

                  The spread survives as well, because spread is measured about the mean and the mean moved with the column, so the variance of the heights is 521.79 square centimeters before centering and after it.
                </p>
                <Equation>{"(xᵢ − m) − (xⱼ − m) = xᵢ − xⱼ\nvariance of (x − m) = variance of x"}</Equation>
                <p>

                  What centering removes is the level, the part of every value
                  that the whole crowd shares. The standard score is this step
                  followed by a division by the spread, and doing the two in that
                  order agrees with standardizing the recorded columns to within
                  2.5 × 10⁻¹⁶, a unit or two in the last place of numbers near
                  one, since standardizing was going to take the mean away first
                  in any case.
                </p>
                <KeepInMind>

                  Centering removes the common location from the transformed values. The mean can still be retained as fitted state, allowing the original values to be reconstructed. Whether a later calculation should use departures from that mean depends on the question it is meant to answer.</KeepInMind>
              </SubSection>

              <SubSection title="3. The promise, and the last few bits">
                <p>

                  A centered column averages exactly zero, and the reason is one
                  line of algebra. The mean is the value that a column&rsquo;s
                  excesses and shortfalls balance around, so the deviations from
                  it always add to nothing, and a column of deviations therefore
                  has a mean of nothing too.
                </p>
                <Equation>{"Σ (xᵢ − m) = Σ xᵢ − n m = n m − n m = 0"}</Equation>
                <WorkedExample title="Zero, in floating point">
                  <p>The centered heights average 5.2 × 10⁻¹⁵ and the centered weights −3.2 × 10⁻¹⁵. The mean height 151.8181&hellip; cannot be represented exactly in finite binary arithmetic. Rounding when the mean and subsequent calculations are stored can leave this small residue, about one part in 10¹⁶ of the original values. Tests therefore compare the centered mean with zero using a tolerance.</p>
                </WorkedExample>
                <KeepInMind>

                  Only the mean makes this promise. Centering on the median, as the
                  robust scaler on the{" "}
                  <Link href="/concepts/feature-scaling" className={link}>
                    feature scaling
                  </Link>{" "}
                  page does, leaves a column whose middle value is zero and whose
                  average usually is not, and everything this page measures about
                  the mean would have to be measured again for it.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. A Direction Measured From the Wrong Place",
          content: (
            <>
              <SubSection title="4. The longest direction from zero points at the crowd">
                <p><Link href="/concepts/pca" className={link}>Principal component analysis</Link> looks for directions of variation around the data’s mean. The directional search illustrated here adds squared projections measured from zero. Those are deviations from the mean only after centering. On the raw height and weight coordinates, the same calculation also includes the mean’s location and can be strongly influenced by where the crowd sits relative to zero.</p>
                <CentringPlayground panels={["direction"]} />
                <InAModel title="On the crowd, measured from zero">
                  <p>

                    The longest direction from zero runs at 20.09 degrees above the height axis. The arrow from zero to the average person runs at 19.37 degrees, and the cosine between those two is 0.99992, so the search found where the crowd is. The first principal component of the centered columns runs at 42.21 degrees, the direction in which taller people are also heavier, and its cosine with the uncentered answer is 0.926.
                  </p>
                  <p>

                    On the four height and weight measurements, whose average person is 170 cm and 68 kg, the uncentered direction is 21.85 degrees against an arrow to the mean at 21.80, while the centered component lies at exactly 45.
                  </p>
                </InAModel>
                <KeepInMind>

                  The uncentered search answered where the rows are. It came back
                  as a unit direction with a share of the total attached, computed
                  correctly, and nothing about it signals that the question it
                  answered is a different one from the question a principal
                  component is meant to answer.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Length splits into location and spread">
                <p>For one column, mean squared value equals population variance plus squared mean. The first term measures variation around the mean; the second measures the mean’s distance from zero. Apply this identity separately to height and weight, then add their coordinate contributions for the raw two-dimensional calculation.</p>
                <Equation>{"For each column:\nmean of x² = population variance of x + (mean of x)²\n\nSummed across the recorded height and weight coordinates:\n26,849.4 ≈ 952.9 + 25,896.4"}</Equation>
                <WorkedExample title="The crowd&rsquo;s squared length, split">
                  <>
                    <p>In these recorded height and weight coordinates, about 3.5 percent of mean squared distance from zero comes from variation around the mean, and about 96.5 percent from the mean’s location. Height uses centimeters and weight uses kilograms, so this sum is a coordinate-space quantity depending on those chosen units. It is not height variance alone or one physical squared unit.</p>
                    <Equation>{"mean squared distance from zero\n  = sum of column variances + squared length of column means\n  ≈ 952.9 + 25,896.4\n  ≈ 26,849.4  (figures rounded independently)"}</Equation>
                    <p>
                      Four height and weight pairs make the same split with whole numbers.
                    </p>
                    <Equation>{"squared length of the mean = 170² + 68² = 33,524\nmean squared distance from zero = 125 + 33,524 = 33,649"}</Equation>
                  </>
                </WorkedExample>
                <KeepInMind>

                  The uncentered direction claimed 0.9946 of the squared length,
                  which looks better than the 0.9897 of the variance the centered
                  component claims. The two shares are fractions of different
                  totals, and the first is larger because most of its total is one
                  big number, the location, that a single direction can point at.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Move the zero and the answer moves with it">
                <p>

                  If the uncentered direction were a fact about the people, it
                  would not care where their heights were measured from. Record
                  every height as the distance above a mark on the wall, which
                  changes no gap between any two people, and the uncentered answer
                  turns, while the centered component stays exactly where it was.
                  Drag the height slider on the playground to watch it happen.
                </p>
                <NumberTable
                  headings={["heights measured from", "longest direction from zero", "its share", "first component, centered"]}
                  rows={[
                    ["0 cm", "20.09°", "0.9946", "42.21°"],
                    ["50 cm", "28.59°", "0.9954", "42.21°"],
                    ["100 cm", "45.32°", "0.9980", "42.21°"],
                    ["118 cm, the shortest person", "54.79°", "0.9871", "42.21°"],
                    ["150 cm", "78.91°", "0.8909", "42.21°"],
                  ]}
                  caption="The mark turns the uncentered answer through almost sixty degrees. At 100 cm it lands about three degrees from the centered one, which is the case where an uncentered analysis looks right by luck."
                />
                <KeepInMind>

                  The centered component is the same at every mark, because
                  centering takes away whatever the mark added before the search
                  begins. A principal component fit that centers for itself gave
                  exactly the same direction on the recorded columns as on columns
                  centered beforehand, a gap of 0.0, so centering first costs it
                  nothing, and an implementation that skipped its own centering
                  would hand back the uncentered direction of step 4 with no
                  warning at all.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            several(
              "What does a column keep when it is centered?",
              [
                "Its unit",
                "Its spread",
                "Every gap between two of its values",
                "Where it was",
              ],
              [0, 1, 2],
              "Subtracting the same mean from every height preserves centimeters as the unit and leaves every pairwise height difference unchanged. The height variance remains 521.79 cm². The mean moves to zero; recovering the original heights requires keeping the subtracted mean.",
            ),
            trueFalse(
              "Centering a column on its median also leaves a column that averages zero.",
              false,
              "Subtracting the mean makes the deviations sum to zero. Subtracting the median places the median at zero, but the mean need not be zero. The two results agree when the original mean and median happen to be equal.",
            ),
            choice(
              "The longest direction from zero runs at 20.09 degrees and the first principal component of the centered columns at 42.21. What did the uncentered search find?",
              [
                "A slightly less accurate version of the centered component",
                "The direction in which the whole crowd sits, at a cosine of 0.99992 to the arrow from zero to the average person",
                "The direction along which the people spread least",
                "Nothing usable, since the search failed to settle",
              ],
              1,
              "The uncentered calculation maximizes squared distance from the origin. The centered calculation maximizes variation around the mean. Their reported shares, 0.9946 and 0.9897, divide by different totals, so the larger share does not identify a better component. Much of the uncentered total comes from the position of the mean.",
            ),
            choice(
              "Of the mean squared distance of the eleven people from zero, about how much comes from variation between people?",
              ["About 3.5 percent", "About half", "About 96.5 percent", "About 99.5 percent"],
              0,
              "For each column, mean squared value equals population variance plus squared mean. Adding that identity across the raw height and weight coordinates gives:\n\n```math\n26,849.4 ≈ 952.9 + 25,896.4\nvariation share ≈ 952.9 / 26,849.4 ≈ 3.5%\n```\n\nThe totals are rounded independently. Most squared distance from this origin comes from the mean's location. Because height and weight use different units, this raw-coordinate comparison also depends on those units.",
              { description: "Use the raw height and weight coordinates together, as in the direction comparison. These are sums of squared coordinate values in the recorded units, not height variance alone. Compare the sum of population variances with the mean squared distance from zero.", data: "Mean squared coordinate distance = 26,849.4\nSum of population column variances = 952.9\nSquared coordinate length of the mean = 25,896.4" },
            ),
            trueFalse(
              "Recording every height as the distance above a mark on the wall turns the uncentered direction, while the centered component stays exactly where it was.",
              true,
              "Changing the height reference shifts every person by the same amount. Subtracting the new column means removes that shift, so the centered data and their principal direction are unchanged. The uncentered calculation measures from the chosen origin, so its direction can change with that reference.",
            ),
        ],
        },
        {
          title: "Part 3. Lines Forced Through Zero",
          content: (
            <>
              <SubSection title="7. A line with no intercept">
                <p>

                  A line predicting weight from height has two numbers, a slope
                  and an intercept, and the intercept is the weight it predicts at
                  a height of zero. Drop the intercept and the line is forced
                  through zero height and zero weight, which on the crowd is 118
                  centimeters from the shortest person, so the line has to swing
                  to reach it.
                </p>
                <Equation>{"with an intercept    weight = b₀ + b₁ × height\nthrough zero         weight = b₁ × height"}</Equation>
                <CentringPlayground panels={["line"]} />
                <InAModel title="Weight on height, both ways">
                  <p>

                    With an intercept the slope is 0.890 kg per centimeter and the line explains 0.9588 of the variation in weight, on the usual scale where one is perfect and zero is no better than giving everyone the mean weight. Forced through zero, the slope falls to 0.363 and the share explained to 0.6155, because a line from the origin has to split the difference between the children and the adults.
                  </p>
                  <p>

                    Center both columns first and the line through zero has a slope of 0.890 again and explains 0.9588 again. Move the zero to 100 cm on the playground and the forced slope becomes 1.007 with 0.9390 explained, better because the point it is forced through is nearer the people.
                  </p>
                </InAModel>
                <KeepInMind>

                  Dropping the intercept forces the prediction to be zero when its input is zero. On raw columns, that point lies 118 centimeters below the shortest measured person. When both height and weight are centered, zero instead denotes their respective means, and the least-squares line can pass through that paired zero without changing the original fitted relationship.</KeepInMind>
              </SubSection>

              <SubSection title="8. Centering is what an intercept does" id="8-centring-is-what-an-intercept-does">
                <p>

                  The centered line through zero and the line with an intercept
                  agreed on the slope, and that agreement is an identity. The
                  least-squares intercept always sends the line through the
                  average person, so fitting an intercept is the same as centering
                  both columns and fitting through zero, and the intercept is what
                  appears when the centering is undone.
                </p>
                <Equation>{"b₀ = mean weight − b₁ × mean height\n−81.77 = 53.36 − 0.8901 × 151.82"}</Equation>
                <WorkedExample title="What the intercept means, twice">
                  <p>

                    On the recorded heights the intercept is −81.77 kg, the weight
                    the line gives a person of no height, an extrapolation 118
                    centimeters past the shortest child that describes nobody. On
                    centered heights the intercept is 53.36 kg, the weight the line
                    gives the average person, which is the mean weight exactly. The
                    slope is 0.8901 in both, so the two are one line with the zero
                    of its height axis in two places. On the four height and weight measurements the
                    same pair is a slope of 0.6 with intercepts of −34 and 68.
                  </p>
                </WorkedExample>
                <KeepInMind>

                  Centering before a fit with an intercept leaves the slope where it
                  was and moves the intercept to the average person, where it can
                  be read. The case where centering changes the fitted line itself
                  is the one in step 7, a fit told to have no intercept.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. A penalty that reaches the intercept">
                <p>
                  A{" "}
                  <Link href="/concepts/ridge-lasso" className={link}>
                    ridge
                  </Link>{" "}

                  line adds the squared size of its slope to what it minimizes,
                  and leaves the intercept out of that penalty on purpose, since
                  shrinking the intercept would pull the line towards a weight of
                  zero at a height of zero, the very point step 7 forced it
                  through. Because the intercept is exempt, a ridge line with an
                  intercept is exactly a ridge line through zero on centered
                  columns, at any penalty.
                </p>
                <NumberTable
                  headings={["penalty", "slope, intercept exempt", "slope, centered and through zero", "slope, recorded and through zero", "explained, recorded and through zero"]}
                  rows={[
                    ["1", "0.88992", "0.88992", "0.36342", "0.6155"],
                    ["100", "0.87484", "0.87484", "0.36328", "0.6155"],
                  ]}
                  caption="The first two slopes agree to within 2 × 10⁻¹⁵ at both penalties. The third fit constrains the intercept to zero instead of estimating it."
                />
                <p>This ridge implementation exempts its intercept from the penalty. Holding that intercept at zero is a different constraint, illustrated by the through-zero fit. Its slope changes little as the penalty rises from 1 to 100 because those penalty values are small relative to the squared-input contribution in these raw units. Here the missing intercept has a much larger effect than that additional penalty.</p>
                <KeepInMind>

                  Penalizing the intercept makes a preference for zero depend on the coordinate origin. Exempting it avoids that penalty on the mean level. Centering both inputs and target is another way to separate the mean from penalized deviations. Whether to penalize the intercept remains a modeling choice, rather than a universal implementation requirement.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        { id: "part-4-how-centring-changes-a-walk",
          title: "Part 4. How Centering Changes a Walk",
          content: (
            <>
              <SubSection title="10. Two columns pointing almost the same way">
                <p>

                  A least-squares fit with an intercept treats the intercept as the
                  weight on a column of ones, one for every person, fitted beside
                  the height column. On the recorded heights those two columns
                  point almost the same way, since every height is somewhere near
                  150 times one, and the cosine between them is 0.9889. Centering
                  makes the height column add to zero, which is exactly the
                  condition for it to be at right angles to the column of ones,
                  and the cosine becomes 2.3 × 10⁻¹⁶.
                </p>
                <Equation>{"cosine(ones, height) = Σ heightᵢ / (√n × √(Σ heightᵢ²))\nΣ (heightᵢ − m) = 0, so cosine(ones, centered height) = 0"}</Equation>
                <p>
                  Two columns that point the same way make the bowl a{" "}
                  <Link href="/concepts/gradient-descent-regression" className={link}>
                    gradient walk
                  </Link>{" "}

                  descends into long and narrow. Along its two natural directions
                  its curvatures are 0.0221 and 23,571.5 on the recorded heights,
                  a condition number of 1,064,838, and 1 and 521.8 on centered
                  heights, a condition number of 521.8.
                </p>
                <WhyThisWorks title="How centering changes the curvature of squared error">
                  <p>The mean squared error has a Hessian equal to twice the mean outer product of the design rows. The reported curvature values use the matrix below without that common factor of two. For a column of ones beside height, its entries depend on mean height m and height variance v. Its determinant is v.</p>
                  <Equation>{"[ 1    m     ]\n[ m    m² + v ]"}</Equation>
                  <>
                    <p>Let c₁ and c₂ denote the eigenvalues of this normalized curvature matrix. Their sum and product explain how a large mean can leave one direction much less curved than the other.</p>
                    <Equation>{"c₁c₂ = v\nc₁ + c₂ = 1 + m² + v"}</Equation>
                    <p>As the mean grows with variance fixed, one eigenvalue grows roughly with its square while the other shrinks. On this crowd their sum is 23,571.6 and product 521.8. Centering sets the mean to zero, leaving a diagonal matrix whose eigenvalues are one and v. The common factor of two in the full Hessian does not change their ratio or the condition number.</p>
                  </>
                </WhyThisWorks>
                <KeepInMind>

                  Centering removes the coupling between the intercept and each
                  column and leaves every other coupling where it was. Height and
                  weight used as two inputs to one fit keep their correlation of
                  0.979 after centering, since a correlation is measured about the
                  means already, and that is ill-conditioning caused by strongly related features.
                  Shifting the origin cannot remove that dependence.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The walk, pass by pass">
                <p>
                  Here is what the two bowls do to a walk. Each walk steps at half
                  the rate that would make it diverge, the rule the{" "}
                  <Link href="/concepts/feature-scaling" className={link}>
                    feature scaling
                  </Link>{" "}
                  page gave every walk it compared, and each is capped at twenty
                  thousand passes. The chart plots how much of the way to the
                  least-squares line the slope and the level have come.
                </p>
                <WalkFromTheMean />
                <InAModel title="Twenty thousand passes against 8415">
                  <p>Centering separates the mean level from variation in height, making the two parameter directions easier to optimize independently in this example.</p>
<p>For centered heights, the first update reaches a slope of 0.89008. The learning rate was chosen for the steep direction, so that component of the quadratic error is corrected immediately. The level changes more slowly and reaches 53.36 when the run stops at pass 8415.</p>
<p>For the original heights, the steep direction is close to the through-zero line. The first slope is 0.3634, but later updates make slow progress along the remaining shallow direction. After twenty thousand passes, the slope is 0.3732 and the level is −1.52, compared with the fitted solution&apos;s 0.8901 and −81.77.</p>
<p>The run reaches its update limit before converging. Centering has not changed the regression task; it has changed the parameter geometry encountered by this particular update procedure.</p>
                </InAModel>
                <KeepInMind>

                  Both walks were heading for the same line, and a closed-form
                  solve reaches it from either column in one step. The condition
                  number of 521.8 still left on centered heights is the variance of
                  the heights in square centimeters, a matter of units, and
                  dividing by the spread on the feature scaling page takes it to
                  one.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. A column and its own square">
                <p>A quadratic prediction can use height and height squared as separate columns. Across 118 to 183 cm, these columns are strongly correlated: their correlation is 0.9980. If we center height before squaring, the squared feature records distance from the mean in either direction. Its correlation with centered height is −0.229 on this crowd. The transformation changes how the same quadratic relationship is parameterized.</p>
                <NumberTable
                  headings={["heights", "correlation with the square", "condition number", "weight on height", "weight on the square", "explained"]}
                  rows={[
                    ["recorded", "0.9980", "1,245,454", "0.0652", "0.0027573", "0.96213"],
                    ["centered", "−0.229", "1073", "0.9024", "0.0027573", "0.96213"],
                  ]}
                  caption="The curve is the same curve both times, with the same weight on the square and the same share explained. The weight on height changed meaning, from the slope of the curve at a height of zero to its slope at the average height."
                />
                <KeepInMind>

                  Centering before forming the square reduces this example’s correlation between the first-order and squared terms. It does not remove arbitrary dependence among features, and it leaves the correlation between two original measured columns unchanged. Improved conditioning also does not supply evidence for extrapolation beyond the observed range.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Forced through zero on the recorded columns, the slope falls from 0.890 to 0.363 and the share explained from 0.9588 to 0.6155. What happens if both columns are centered first?",
              [
                "The slope falls further, since the centered heights are smaller numbers",
                "The slope is 0.890 again and the share explained 0.9588 again",
                "The line can no longer be fitted without an intercept",
                "The slope recovers and the share explained does not",
              ],
              1,
              "On recorded measurements, removing the intercept forces the fitted line through height zero and weight zero, restricting which lines are available. Centering both columns makes zero represent their means. The least-squares line with a free intercept already passes through those means, so a centered through-zero fit recovers its slope and R².",
            ),
            trueFalse(
              "Centering before a fit that has an intercept moves the fitted slope.",
              false,
              "It leaves the slope where it was and moves the intercept to the average person, where it can be read. The least-squares intercept always sends the line through the average person, so fitting an intercept is the same as centering both columns and fitting through zero, and the intercept is what appears when the centering is undone.",
            ),
            choice(
              "Why does a ridge line leave its intercept out of the penalty?",
              [
                "The intercept is not a slope, so a squared size is not defined for it",
                "Shrinking it would pull the line towards a weight of zero at a height of zero",
                "The intercept is always small once the columns are centered",
                "Penalizing it would make the fit slower to solve",
              ],
              1,
              "Penalizing the intercept favors a target value near zero at the input origin. Changing that origin would then change the fit's preference. Leaving the intercept unpenalized allows the line's level to follow the data while the penalty controls its slopes. With both input and target centered, the equivalent ridge fit can use a zero intercept.",
            ),
            choice(
              "The two curvatures on the recorded heights are 0.0221 and 23,571.5, a condition number of 1,064,838. What are they after centering?",
              [
                "0.0221 and 521.8",
                "1 and 521.8",
                "1 and 1",
                "Unchanged, since centering moves the bowl rather than reshaping it",
              ],
              1,
              "Centering makes the height column add to zero, which is exactly the condition for it to be at right angles to the column of ones that carries the intercept, so the matrix becomes diagonal. The 521.8 left over is the variance of the heights in square centimeters, a matter of units, and dividing by the spread takes it to one.",
            ),
            several(
              "Which problems does centering address in this comparison?",
              [
                              "The coupling between the intercept and a column",
                              "The correlation of 0.979 between height and weight used as two inputs",
                              "The correlation of 0.9980 between height and height squared",
                              "The reliability of extrapolating to a person of no height",
                            ],
              [0, 2],
              "A correlation is measured about the means already, so shifting the origin cannot touch a dependence between two different measurements. Squaring after centering measures distance from the average person in either direction, which is a different shape from the height, and the correlation falls to −0.229. A better condition number changes which parameter describes the central prediction and makes no extrapolation safer.",
              {
                "description": "Fit an unpenalized regression with an intercept. For the polynomial comparison, replace h and h² with h − mean(h) and (h − mean(h))². Height and weight are shifted by their own fixed column means.\n\nMeasured correlations:\nheight with weight: 0.979\nheight with height²: 0.9980\ncentered height with its square: −0.229"
              },
            ),
        ],
        },
        {
          title: "Part 5. Angles From the Average Person",
          content: (
            <>
              <SubSection title="13. Every person points the same way from zero">
                <p>
                  The cosine between two people treats each of them as an arrow
                  from zero and asks how nearly the two arrows point the same way,
                  whatever their lengths. Measured from zero height and zero
                  weight, every arrow in the crowd points up and to the right at a
                  shallow angle, the children&rsquo;s as much as the
                  adults&rsquo;, so every pair looks alike; the smallest cosine
                  between any two people is 0.9748, between the 118 cm child and
                  the 183 cm adult.
                </p>
                <Equation>{"cosine(a, b) = (a · b) / (‖a‖ ‖b‖)"}</Equation>
                <AnglesFromTheMean />
                <InAModel title="The smallest child and the tallest adult">
                  <>
                    <p>
                      From zero, the child at (118, 24) and the adult at (183, 83) point
                      only 12.9 degrees apart. Both arrows have positive height and
                      weight coordinates. Their weight-to-height ratios are:
                    </p>
                    <Equation>{"child: 24 / 118 ≈ 0.203\nadult: 83 / 183 ≈ 0.454"}</Equation>
                    <p>

                      From the average person, their coordinates instead become
                      approximately (−33.82, −29.36) and (31.18, 29.64). Those arrows
                      point almost opposite ways: their cosine is −0.9990 and their
                      angle is 177.4 degrees. The most opposite pair after centering is
                      the 120 centimeter child and the 178 centimeter adult, with cosine
                      −0.9996.
                    </p>
                  </>
                </InAModel>
                <KeepInMind>

                  Measured from zero, the cosine compares weight per centimeter
                  and nothing else. Measured from the average person, it compares
                  which way from average each person lies. On data where zero means
                  none, a count of each word in a document for instance, the first
                  of those is often the question wanted, which is why the{" "}
                  <Link href="/concepts/distance-and-similarity" className={link}>
                    distance and similarity
                  </Link>{" "}

                  page uses the angle uncentered.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Correlation is a cosine after centering" id="14-correlation-is-a-cosine-after-centring">
                <p>

                  The same move made on the columns rather than the people gives a
                  familiar number. The cosine between the height column and the
                  weight column, each taken as an arrow of eleven numbers, is
                  0.97439 on the recorded values. Center both and it is 0.97919,
                  and the correlation between height and weight is 0.97919 as
                  well, because a correlation is defined as exactly that cosine.
                </p>
                <Equation>{"correlation(x, y) = Σ (xᵢ − x̄)(yᵢ − ȳ) / √(Σ (xᵢ − x̄)² × Σ (yᵢ − ȳ)²)\n                  = cosine(x − x̄, y − ȳ)"}</Equation>
                <KeepInMind>

                  The positive column means contribute strongly to the raw cosine in this crowd, giving 0.974. Positive entries alone do not guarantee a cosine near one; their relative patterns also matter. Centering removes the mean contribution before comparing departures, which here gives the correlation.</KeepInMind>
              </SubSection>

              <SubSection title="15. Nearness by angle, before and after">
                <p>

                  Now put the two angles to work in a vote. Each person in turn is
                  held out, their three nearest among the other ten vote on
                  whether they are a child or an adult, and the votes are counted
                  right or wrong. The widget in step 13 shows the tally under its
                  two panels. By angle from zero 10 of the 11 votes are right, by
                  angle from the average person all 11 are, and by straight-line
                  distance 9 of 11 whether the columns were centered or not.
                </p>
                <NumberTable
                  headings={["three nearest chosen by", "recorded columns", "centered columns"]}
                  rows={[
                    ["straight-line distance", "9 of 11", "9 of 11"],
                    ["angle", "10 of 11", "11 of 11"],
                  ]}
                  caption="The straight-line vote cannot tell the two sets of columns apart. The angle vote gave one person a different answer."
                />
                <KeepInMind>

                  One vote among eleven people is not evidence that centered angles
                  classify better in general. What it shows is that the angle is a
                  different rule after centering where the straight line is the
                  same rule, and that the average person, sitting at the new zero,
                  has no arrow and so no angle to anyone, the undefined case the
                  distance and similarity page ends on.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. The Methods That Never Notice",
          content: (
            <>
              <SubSection title="16. Any gap between two people">
                <p>

                  A straight-line distance is built from the gap in each column,
                  and a gap is one value minus another, so the mean both values
                  lost cancels out of it. Every method built only on those gaps
                  sees the same crowd before and after centering, and the table
                  below fits each of them twice to show it.
                </p>
                <Equation>{"(aᵢ − m) − (bᵢ − m) = aᵢ − bᵢ"}</Equation>
                <ShiftInvariance />
                <InAModel title="Before and after, measured">
                  <p>The 110 pairwise distances agree to within 5.1 × 10⁻¹⁴ in these recorded coordinates. Because height is in centimeters and weight in kilograms, the combined coordinate distance is not measured simply in centimeters. The three-person distance vote scores 9 of 11 both ways, and <Link href="/concepts/k-means" className={link}>k-means</Link> finds the same two groups with total squared coordinate distance 2952.607 to their centers.</p>
                </InAModel>
                <KeepInMind>

                  A shared shift cancels from every difference. A method that only
                  ever subtracts one person from another, or one person from a
                  center that moves with them, cannot notice where zero was put.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. A threshold, a group and a slope">
                <>
                  <p>

                    A decision tree asks whether a height is below a threshold. Centering
                    shifts the threshold by the same amount as every height. The first
                    split on this crowd uses 151.5 centimeters.
                  </p>
                  <Equation>{"centered threshold = 151.5 − 1670/11 ≈ −0.318 cm"}</Equation>
                  <p>
                    The eleven predictions stay the same. A least-squares fit with an
                    intercept also preserves its predictions: the intercept absorbs the
                    shift, as step 8 showed. Its slopes agree between the two coordinate
                    systems to within floating-point rounding.
                  </p>
                </>
                <KeepInMind>

                  The methods centering does nothing for build their answers from
                  differences, from order within a column, or from a fit with a
                  free intercept. The ones it changes, the uncentered direction,
                  the line through zero, the penalized intercept, the walk and the
                  angle, all measure something from zero itself.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Empty Columns, Constant Values and Missing References", id: "part-7-where-centring-stops-being-defined",
          content: (
            <>
              <SubSection title="18. Nothing to average, and one value">
                <p>An empty column has no arithmetic mean because its count is zero. A centering routine therefore needs an explicit empty-input policy; this implementation rejects it. A single value or constant column does have a mean. Once that mean is known, centering only subtracts it, so a zero spread causes no extra division problem.</p>
                <DerivationTable
                  expressionHeading="the column"
                  reasonHeading="what the mathematics says"
                  rows={[
                    {
                      expression: "an empty column",
                      reason:
                        "the mean is 0 / 0, which has no value, so there is no center and no centered column. Refusing is the one answer that invents nothing; returning zero would put a center on a column that has none.",
                    },
                    {
                      expression: "one value, 170",
                      reason:
                        "defined. The mean is 170 and the centered column is a single 0, which is correct and says nothing about how people differ, since one person is not a crowd.",
                    },
                    {
                      expression: "a constant column, 7, 7, 7",
                      reason:
                        "defined, and it centers to 0, 0, 0 exactly. The standard score of the same column is 0 / 0, because it goes on to divide by a spread of zero; centering divides by nothing, so the case that stopped the standard score is ordinary here.",
                    },
                    {
                      expression: "a missing or infinite value",
                      reason:
                        "the sum is not a number, or is infinite, and so is the mean, and every value in the column is then centered by it, so one bad entry reaches every other value in the column through the mean they share.",
                    },
                    {
                      expression: "a column of counts, mostly 0",
                      reason:
                        "defined, and every zero becomes minus the mean, so a column that was mostly zeros has none left. Where zero meant none, that meaning is gone and a sparse column is dense; the scalers that divide without centering exist for this case.",
                    },
                  ]}
                />
                <KeepInMind>

                  A single observation or constant column centers to zeros. Those zeros report the absence of within-column variation in the supplied data. A following method can retain the feature, ignore it or reject it according to its own requirements; the centering operation itself is defined.</KeepInMind>
              </SubSection>

              <SubSection title="19. A mean learned on other rows">
                <p>
                  When some people are held out to test on, the mean has to come
                  from the training rows alone and then be taken away from the
                  held-out rows unchanged. That is perfectly well defined, and the
                  answer it gives looks wrong at first sight, since the held-out
                  rows no longer average zero.
                </p>
                <Equation>{"held-out centered value = held-out value − training mean"}</Equation>
                <InAModel title="The three tallest held out">
                  <p>

                    Without the three tallest adults the other eight have a mean
                    height of 141.125 cm. The held-out heights of 180, 183 and 178
                    center on that to 38.875, 41.875 and 36.875, which average
                    39.21, far from zero and correctly so, since they are three
                    people taller than anyone the mean was learned from. Centered on
                    their own mean of 180.33 they become −0.33, 2.67 and −2.33,
                    which says that one of the three tallest people in the crowd is
                    below average, and the only average in sight is their own.
                  </p>
                </InAModel>
                <KeepInMind>

                  Centering held-out rows on their own mean is defined arithmetic
                  and the wrong operation, since it hands a model numbers measured
                  from a different zero from the one it learned on. The{" "}
                  <Link href="/concepts/the-standard-score" className={link}>
                    standard score
                  </Link>{" "}

                  page measured what that costs a fitted line, and centering
                  alone makes the same mistake, since the division the standard
                  score adds afterwards does not move the zero the held-out rows
                  were measured from.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. A mean that is not a place">
                <p>
                  A mean is always a number, and it is a place only when the
                  column&rsquo;s numbers are positions along a line. Times of day
                  are positions around a circle. Two bedtimes, eleven at night and
                  one in the morning, written as 23 and 1 hours after midnight,
                  have an arithmetic mean of 12, which is noon, the one time of
                  day neither of them is near, and measured from noon each is 11
                  hours away.
                </p>
                <BedtimeClock />
                <InAModel title="Bedtimes on a clock face">
                  <p>
                    The circular mean draws each time as a point on the rim of a clock face, averages the points, and reads the time off the direction of the average. For 23:00 and 01:00 it is midnight, with each time an hour either side, and the averaged point lies 0.966 of the way out to the rim, which says the two agree closely.
                  </p>
                  <p>

                    A week of bedtimes between half past ten and one in the morning has an arithmetic mean of 13.36, early afternoon, and a circular mean of 23.64, a little after twenty to midnight. Six in the morning and six in the evening have an arithmetic mean of noon and no circular mean at all, since their points average to the center of the face, 6 × 10⁻¹⁷ from it, and a point at the center has no direction.
                  </p>
                </InAModel>
                <p>
                  A column of codes has the same trouble more quietly. Numbering four blood groups 1 to 4 gives the column a mean, and taking it away gives every person a number, but no position on that line is a blood group and the gap from group 1 to group 3 is twice the gap from 1 to 2 only because of the order the numbers were handed out in.
                </p>
                <p>A column of zero-and-one indicators is useful here because its mean is the fraction of ones. In this example six of eleven people have the adult label. Subtracting that fraction from each indicator centers the column. A positive result means that the indicator is one, above its sample mean; it does not measure a person as being more adult. The calculation describes the coding of this label.</p>
                <KeepInMind>

                  Choose a representation that respects what the numbers mean. Times of day can use sine and cosine coordinates or a circular mean. For a categorical code, an indicator per category is one option; an arbitrary numbering does not create meaningful distances between categories. Applying ordinary centering to those numbers alone does not resolve that choice.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            choice(
              "Measured from zero, the smallest cosine between any two of the eleven people is 0.9748. Why is every pair so alike?",
              [
                "The crowd really is homogeneous in height and weight",
                "Every arrow from zero points up and to the right at a shallow angle, so the cosine compares weight per centimeter and nothing else",
                "The cosine ignores length, and these people differ mostly in length",
                "Eleven people are too few for the measure to separate",
              ],
              1,
              "From the recorded origin, all height-weight vectors point in similar directions and their cosines are high. After centering, the 118 cm child and 183 cm adult lie on nearly opposite sides of the mean, giving a cosine of −0.9990. These compare different reference points. Uncentered cosine can be appropriate when zero has a useful meaning, such as no occurrences of a word in a document.",
            ),
            trueFalse(
              "For two nonconstant columns, centering both turns the cosine between them into their Pearson correlation.",
              true,
              "Pearson correlation is the dot product of the centered columns divided by their lengths, which is their cosine. Here the recorded columns have cosine 0.97439; after centering it is 0.97919. Centering changes the question from their directions relative to zero to how their deviations from their own means vary together.",
            ),
            several(
              "Which of these see the same crowd before and after centering?",
              [
                              "The straight-line distance between two people",
                              "A decision tree’s split",
                              "k-means asked for two groups",
                              "The cosine between two people",
                            ],
              [0, 1, 2],
              "A shared shift cancels from every difference, so the 110 distances agree to within 5.1 × 10⁻¹⁴ centimeters and k-means finds the same two groups with the same total of 2952.607. A tree’s threshold shifts by the same amount as every height and the eleven predictions stay the same. The cosine measures from zero itself, which is why moving zero changes it.",
              {
                "description": "Subtract the same fixed vector of column means from every person. Shift a tree’s thresholds and k-means starting centers by the corresponding amounts as well. Compare the same observations and use the same tie rules. We are checking the resulting partitions and distances, rather than whether an arbitrary fresh fit happens to choose the same solution."
              },
            ),
            trueFalse(
              "When a model was trained using a fitted mean, centering held-out rows on their own mean gives the model inconsistent coordinates.",
              true,
              "The training mean is 141.125 cm. Using it gives held-out centered heights of 38.875, 41.875 and 36.875 cm. Their positive values correctly place them above the training mean. Using the held-out mean instead gives −0.33, 2.67 and −2.33 cm relative to a different group. Those numbers no longer use the reference the model learned.",
            ),
            choice(
              "Two bedtimes at eleven at night and one in the morning are written as 23 and 1 hours after midnight. What do the two kinds of mean give?",
              [
                "Both give midnight, since the two times are an hour either side of it",
                "The arithmetic mean is noon, which neither is near, and the circular mean is midnight",
                "The arithmetic mean is midnight and the circular mean is undefined",
                "Neither mean exists, since the times wrap around",
              ],
              1,
              "Clock times wrap around at midnight, so their numerical positions on a line do not capture their closeness. The circular mean represents each time as a direction on a clock face and averages those directions. The 23:00 and 01:00 readings point symmetrically around midnight, giving midnight as their mean direction. Their mean vector has length 0.966, indicating close agreement. Opposite times, such as 06:00 and 18:00, cancel to a zero vector and have no unique circular mean.",
            ),
        ],
        },
        { id: "practice-centring-the-crowd-with-the-library",
          title: "Practice. Centering the Crowd With the Library",
          practice: [
            exercise(
              "Centre the crowd",
              [
  "Fit MeanCentrer on the height and weight columns for these eleven people. Print each learned mean and the first person's centered height and weight.",
  "Print centered heights’ mean and their variance before and after centering. Use the same variance convention for both. A tiny nonzero mean can reflect floating-point rounding."
],
              `from statistics import pvariance

from oop_ml import Feature, MeanCentrer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
height = Feature("height", heights)
weight = Feature("weight", weights)

centrer = MeanCentrer()
# Fit the centrer on both columns and print the centre it learned for each.
# Then transform the columns and print the first child's centred pair, the
# mean of the centred heights, and the variance of the heights before and
# after centring.`,
              `from statistics import pvariance

from oop_ml import Feature, MeanCentrer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
height = Feature("height", heights)
weight = Feature("weight", weights)

centrer = MeanCentrer()
centrer.fit([height, weight])
for scaling in centrer.scalings:
    print(f"{scaling.name} centre {scaling.centre:.2f}")

centred_height, centred_weight = centrer.transform([height, weight])
centred_heights = [float(value) for value in centred_height.values]
print(f"first child centred ({centred_heights[0]:.2f}, {float(centred_weight.values[0]):.2f})")
print(f"mean of centred heights {sum(centred_heights) / len(centred_heights):.1e}")
print(f"variance before {pvariance(heights):.2f}, after {pvariance(centred_heights):.2f}")`,
              `height centre 151.82
weight centre 53.36
first child centred (-4.82, -12.36)
mean of centred heights 5.2e-15
variance before 521.79, after 521.79`,
              { hints: [
  "Fit stores one mean per feature; transform subtracts the matching mean from each value.",
  "A constant shift changes location but preserves deviations between measurements. Compare variances rather than expecting every transformed value to shrink."
], check: numberCheck("What is the first child’s centered height, in centimeters?", -4.82, 0.005, "The first centered height is -4.82 cm. Its negative sign means below this fitted sample mean, while its unit remains centimeters."), question: "What changes when height and weight use their sample means as zero?" },
            ),
            exercise(
              "Force the line through zero, then centre first",
              [
  "Fit weight from height three ways: recorded values with an intercept, recorded values constrained through zero, and both columns centered before a through-zero fit.",
  "Print slopes and R-squared values for all three, plus the first fit’s intercept. Use the same eleven people and retain the target’s centering as well as the input’s."
],
              `from oop_ml import Feature, MeanCentrer, MultipleLinearRegression

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
height = Feature("height", heights)
weight = Feature("weight", weights)
centred_height, centred_weight = MeanCentrer().fit([height, weight]).transform([height, weight])

# Fit weight from height three ways and print each slope and the share it
# explains: with an intercept on the recorded columns, forced through zero on
# the recorded columns, and forced through zero on the centred columns. Print
# the intercept of the first fit as well.`,
              `from oop_ml import Feature, MeanCentrer, MultipleLinearRegression

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
height = Feature("height", heights)
weight = Feature("weight", weights)
centred_height, centred_weight = MeanCentrer().fit([height, weight]).transform([height, weight])

with_intercept = MultipleLinearRegression().fit([height], weight)
through_zero = MultipleLinearRegression(fit_intercept=False).fit([height], weight)
centred_zero = MultipleLinearRegression(fit_intercept=False).fit([centred_height], centred_weight)

print(f"with an intercept: slope {with_intercept.coefficients['height']:.4f}, intercept {with_intercept.intercept:.2f}, explains {with_intercept.score([height], weight):.4f}")
print(f"through zero: slope {through_zero.coefficients['height']:.4f}, explains {through_zero.score([height], weight):.4f}")
print(f"centred, through zero: slope {centred_zero.coefficients['height']:.4f}, explains {centred_zero.score([centred_height], centred_weight):.4f}")`,
              `with an intercept: slope 0.8901, intercept -81.77, explains 0.9588
through zero: slope 0.3634, explains 0.6155
centred, through zero: slope 0.8901, explains 0.9588`,
              { hints: [
  "A through-zero constraint on raw measurements describes a different family of lines.",
  "Centering both columns moves their means to the origin, where the fitted line can pass without that extra restriction."
], check: numberCheck("What slope does the line forced through zero have on the recorded columns?", 0.3634, 0.0005, "The raw through-zero fit has slope 0.3634. Requiring a zero intercept in the original measurement coordinates restricts the line and changes its slope."), question: "Can centering preserve a fitted line while changing its intercept?" },
            ),
            exercise(
              "Centre the held-out rows on the training mean",
              [
  "Fit a centrer on the supplied eight training heights, then transform the three held-out heights using that stored reference.",
  "Print the training mean, held-out centered values and their mean. As a deliberately different procedure, center the held-out values on their own mean and print that mean and result. Compare the two reference origins."
],
              `from oop_ml import Feature, MeanCentrer

training_heights = [147, 156, 145, 159, 162, 120, 122, 118]
held_out_heights = [180, 183, 178]

centrer = MeanCentrer()
# Fit the centrer on the eight training heights and print the mean it
# learned. Transform the three held-out heights with it and print them and
# their mean. Then fit a second centrer on the three held-out heights alone
# and print its mean and what it makes of them.`,
              `from oop_ml import Feature, MeanCentrer

training_heights = [147, 156, 145, 159, 162, 120, 122, 118]
held_out_heights = [180, 183, 178]

centrer = MeanCentrer()
centrer.fit([Feature("height", training_heights)])
print(f"training mean {centrer.scalings['height'].centre:.3f}")

centred = [float(value) for value in centrer.transform([Feature("height", held_out_heights)])[0].values]
print(f"held out, centred on the training mean: {centred[0]:.3f}, {centred[1]:.3f}, {centred[2]:.3f}")
print(f"their mean {sum(centred) / len(centred):.2f}")

own = MeanCentrer().fit([Feature("height", held_out_heights)])
own_centred = [float(value) for value in own.transform([Feature("height", held_out_heights)])[0].values]
print(f"centred on their own mean of {own.scalings['height'].centre:.2f}: {own_centred[0]:.2f}, {own_centred[1]:.2f}, {own_centred[2]:.2f}")`,
              `training mean 141.125
held out, centred on the training mean: 38.875, 41.875, 36.875
their mean 39.21
centred on their own mean of 180.33: -0.33, 2.67, -2.33`,
              { hints: [
  "Fit on training and call transform on held-out values without fitting again.",
  "The second centrer is a comparison showing what changes when the test group chooses its own zero."
], check: numberCheck("What do the three held-out heights average once centered on the training mean?", 39.21, 0.005, "The held-out centered mean is about 39.21 cm. That group is taller than the training reference, so its correctly transformed values need not average zero."), question: "Which mean should transform people the model has not seen?" },
            ),
            exercise(
              "Walk to the line from recorded heights and from centred ones",
              [
  "Run the supplied regression gradient procedures on recorded heights and on heights centered with the training mean. Use the separate supplied learning rates and twenty-thousand-pass limit.",
  "For each report slope, intercept, passes run and convergence flag. These rates depend on each problem’s curvature, so compare the complete procedures rather than claiming that only the input representation changed."
],
              `from oop_ml import Feature, GradientDescentRegression, MeanCentrer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
height = Feature("height", heights)
weight = Feature("weight", weights)
centred_height = MeanCentrer().fit([height]).transform([height])[0]

for label, column, rate in (("recorded", height, 2.1212e-05), ("centred", centred_height, 0.000958249)):
    walk = GradientDescentRegression(learning_rate=rate, max_epochs=20000)
    # Fit the walk to the weights from this column and print the slope and
    # the level it reached, how many passes it ran, and whether it converged.`,
              `from oop_ml import Feature, GradientDescentRegression, MeanCentrer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
height = Feature("height", heights)
weight = Feature("weight", weights)
centred_height = MeanCentrer().fit([height]).transform([height])[0]

for label, column, rate in (("recorded", height, 2.1212e-05), ("centred", centred_height, 0.000958249)):
    walk = GradientDescentRegression(learning_rate=rate, max_epochs=20000)
    walk.fit([column], weight)
    print(f"{label} heights: slope {walk.coefficients['height']:.4f}, level {walk.intercept:.2f}, passes {walk.epochs_run}, converged {walk.converged}")`,
              `recorded heights: slope 0.3732, level -1.52, passes 20000, converged False
centred heights: slope 0.8901, level 53.36, passes 8415, converged True`,
              { hints: [
  "Keep the target weights and stopping rule fixed.",
  "Use the supplied rate for the matching representation, then inspect the convergence flag as well as the final coefficients."
], check: numberCheck("What slope has gradient descent reached on the recorded heights after twenty thousand passes?", 0.3732, 0.0005, "After the limit the raw-height procedure has slope 0.3732 and has not converged. A final coefficient should be read beside its stopping status."), question: "Does centering change how quickly this gradient procedure reaches its line?" },
            ),
          ],
        },
      ]}
    />
  );
}
