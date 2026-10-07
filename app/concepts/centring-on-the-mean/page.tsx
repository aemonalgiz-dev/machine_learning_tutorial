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
  title: "Centring on the Mean · oop_ml",
  description:
    "Subtract each feature's mean and measure values relative to the average observation.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function CentringOnTheMeanPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["centring-on-the-mean"]}
      technicalStart="Part 1. Moving the Zero to the Average Person"
      openingTitle="Move Zero to Somewhere Useful"
      playgroundIntro="Compare the original coordinates with the centred ones. Watch which distances stay fixed when the origin moves to the mean."
      title="Centring on the Mean"
      tagline="Subtract each feature's mean and measure values relative to the average observation."
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
          , the half that is not about scale, and the wider family of centres
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
          pages, and what each of them does is restated here as far as centring
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
                <p>
                  The crowd is eleven people, five children and six adults, with heights between 118 and 183 centimetres and weights between 24 and 83 kilograms. Every one of those numbers is measured from zero, and a height of zero and a weight of zero describe nobody in the crowd or anywhere else, so the point every number is measured from is 118 centimetres below the shortest person in it.
                </p>
                <p>
                  Centring moves that point to the average person, by taking each column&rsquo;s mean away from every value in the column and dividing what is left by nothing.
                </p>
                <Equation>{"centred value = value − mean of its column"}</Equation>
                <WorkedExample title="The crowd, centred">
                  <>
                    <p>
                      The eleven heights add to 1670 centimetres and the eleven weights
                      to 587 kilograms. Divide each total by the number of people to
                      find the centre of that column.
                    </p>
                    <Equation>{"mean height = 1670 / 11 ≈ 151.82 cm\nmean weight = 587 / 11 ≈ 53.36 kg"}</Equation>
                    <p>
                      Now subtract the corresponding mean from each measurement. The
                      first child is 147 centimetres tall and weighs 41 kilograms. The
                      tallest adult is 183 centimetres tall and weighs 83 kilograms.
                    </p>
                    <Equation>{"first child:   (147 − 1670/11, 41 − 587/11) ≈ (−4.82, −12.36)\ntallest adult: (183 − 1670/11, 83 − 587/11) ≈ (31.18, 29.64)"}</Equation>
                    <p>
                      Negative values mean below the column average; positive values
                      mean above it. The units remain centimetres and kilograms.
                    </p>
                  </>
                  <NumberTable
                    headings={["height", "weight", "centred height", "centred weight"]}
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
                    caption="The centred columns are still in centimetres and kilograms. The scaler learned one number per column and divided every centred value by exactly one."
                  />
                </WorkedExample>
                <KeepInMind>
                  Centring learns the mean of each column and nothing else, and
                  its output keeps the column&rsquo;s unit. The playground at the
                  top of the page draws the crowd with its zero where the sliders
                  put it, and the button marked for the average person moves the
                  zero to 151.82 and 53.36.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What the subtraction keeps">
                <p>
                  Taking the same number away from every height moves the whole column along its ruler and changes nothing about how the heights sit relative to one another. The 145 cm child and the 147 cm child were two centimetres apart before and are two apart after, and so is every other pair; the largest change in the gap between any two people&rsquo;s heights came out at exactly zero.
                </p>
                <p>
                  The spread survives as well, because spread is measured about the mean and the mean moved with the column, so the variance of the heights is 521.79 square centimetres before centring and after it.
                </p>
                <Equation>{"(xᵢ − m) − (xⱼ − m) = xᵢ − xⱼ\nvariance of (x − m) = variance of x"}</Equation>
                <p>
                  What centring removes is the level, the part of every value
                  that the whole crowd shares. The standard score is this step
                  followed by a division by the spread, and doing the two in that
                  order agrees with standardising the recorded columns to within
                  2.5 × 10⁻¹⁶, a unit or two in the last place of numbers near
                  one, since standardising was going to take the mean away first
                  in any case.
                </p>
                <KeepInMind>
                  A centred column keeps its unit, its spread, its shape and every
                  gap inside it, and loses where it was. Whether losing where it
                  was matters is a question about the method that reads the column
                  next, and the rest of the page measures it method by method.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The promise, and the last few bits">
                <p>
                  A centred column averages exactly zero, and the reason is one
                  line of algebra. The mean is the value that a column&rsquo;s
                  excesses and shortfalls balance around, so the deviations from
                  it always add to nothing, and a column of deviations therefore
                  has a mean of nothing too.
                </p>
                <Equation>{"Σ (xᵢ − m) = Σ xᵢ − n m = n m − n m = 0"}</Equation>
                <WorkedExample title="Zero, in floating point">
                  <p>
                    The centred heights average 5.2 × 10⁻¹⁵ and the centred
                    weights −3.2 × 10⁻¹⁵. The mean height of 151.8181&hellip;
                    repeats forever and cannot be written exactly in binary, so
                    each of the eleven subtractions is off in its last bit and the
                    leftovers do not quite cancel. That residue is about one part
                    in 10¹⁶ of the numbers involved, and it is why a test of a
                    centred column compares its mean with zero to a tolerance.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Only the mean makes this promise. Centring on the median, as the
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
                <p>
                  A{" "}
                  <Link href="/concepts/pca" className={link}>
                    principal component
                  </Link>{" "}
                  search asks which direction the people spread along most. It
                  measures, along each candidate direction, how far every person
                  lies from zero, squares those distances and adds them up, and
                  that total is a measure of spread only when zero is the average
                  person. Hand the same search the recorded columns, where zero is
                  a person of no height and no weight, and the direction it
                  returns is the one along which the people lie furthest from that
                  point, which is the direction in which the whole crowd sits.
                </p>
                <CentringPlayground panels={["direction"]} />
                <InAModel title="On the crowd, measured from zero">
                  <p>
                    The longest direction from zero runs at 20.09 degrees above the height axis. The arrow from zero to the average person runs at 19.37 degrees, and the cosine between those two is 0.99992, so the search found where the crowd is. The first principal component of the centred columns runs at 42.21 degrees, the direction in which taller people are also heavier, and its cosine with the uncentred answer is 0.926.
                  </p>
                  <p>
                    On the measured four, whose average person is 170 cm and 68 kg, the uncentred direction is 21.85 degrees against an arrow to the mean at 21.80, while the centred component lies at exactly 45.
                  </p>
                </InAModel>
                <KeepInMind>
                  The uncentred search answered where the rows are. It came back
                  as a unit direction with a share of the total attached, computed
                  correctly, and nothing about it signals that the question it
                  answered is a different one from the question a principal
                  component is meant to answer.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Length splits into location and spread">
                <p>
                  The reason is an identity that holds for any column of numbers.
                  The mean squared distance of the values from zero is their
                  variance plus the square of their mean, so a column far from
                  zero carries most of its squared length as location, and a
                  search for the direction of largest squared length is mostly a
                  search for the location.
                </p>
                <Equation>{"mean of x² = variance of x + (mean of x)²\n26,849.4 = 952.9 + 25,896.4"}</Equation>
                <WorkedExample title="The crowd&rsquo;s squared length, split">
                  <>
                    <p>
                      The average squared distance from zero contains two contributions:
                      variation between people and the position of the average person.
                      For the eleven people, only about 3.5 percent comes from
                      variation. The remaining 96.5 percent comes from where the whole
                      crowd sits relative to zero.
                    </p>
                    <Equation>{"mean squared distance from zero\n  = sum of column variances + squared length of column means\n  ≈ 952.9 + 25,896.4\n  ≈ 26,849.4  (figures rounded independently)"}</Equation>
                    <p>
                      The measured four make the same split with whole numbers.
                    </p>
                    <Equation>{"squared length of the mean = 170² + 68² = 33,524\nmean squared distance from zero = 125 + 33,524 = 33,649"}</Equation>
                  </>
                </WorkedExample>
                <KeepInMind>
                  The uncentred direction claimed 0.9946 of the squared length,
                  which looks better than the 0.9897 of the variance the centred
                  component claims. The two shares are fractions of different
                  totals, and the first is larger because most of its total is one
                  big number, the location, that a single direction can point at.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Move the zero and the answer moves with it">
                <p>
                  If the uncentred direction were a fact about the people, it
                  would not care where their heights were measured from. Record
                  every height as the distance above a mark on the wall, which
                  changes no gap between any two people, and the uncentred answer
                  turns, while the centred component stays exactly where it was.
                  Drag the height slider on the playground to watch it happen.
                </p>
                <NumberTable
                  headings={["heights measured from", "longest direction from zero", "its share", "first component, centred"]}
                  rows={[
                    ["0 cm", "20.09°", "0.9946", "42.21°"],
                    ["50 cm", "28.59°", "0.9954", "42.21°"],
                    ["100 cm", "45.32°", "0.9980", "42.21°"],
                    ["118 cm, the shortest person", "54.79°", "0.9871", "42.21°"],
                    ["150 cm", "78.91°", "0.8909", "42.21°"],
                  ]}
                  caption="The mark turns the uncentred answer through almost sixty degrees. At 100 cm it lands about three degrees from the centred one, which is the case where an uncentred analysis looks right by luck."
                />
                <KeepInMind>
                  The centred component is the same at every mark, because
                  centring takes away whatever the mark added before the search
                  begins. A principal component fit that centres for itself gave
                  exactly the same direction on the recorded columns as on columns
                  centred beforehand, a gap of 0.0, so centring first costs it
                  nothing, and an implementation that skipped its own centring
                  would hand back the uncentred direction of step 4 with no
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
              "What does a column keep when it is centred?",
              [
                "Its unit",
                "Its spread",
                "Every gap between two of its values",
                "Where it was",
              ],
              [0, 1, 2],
              "Centring subtracts a number and divides by nothing, so the heights are still in centimetres. The variance is 521.79 square centimetres before and after, because spread is measured about the mean and the mean moved with the column, and the largest change in the gap between any two people’s heights came out at exactly zero. What is lost is the level, the part of every value the whole crowd shares.",
            ),
            trueFalse(
              "Centring a column on its median also leaves a column that averages zero.",
              false,
              "Only the mean makes that promise, because the mean is the value a column’s excesses and shortfalls balance around. Centring on the median, as the robust scaler does, leaves a column whose middle value is zero and whose average usually is not, so everything this page measures about the mean would have to be measured again for it.",
            ),
            choice(
              "The longest direction from zero runs at 20.09 degrees and the first principal component of the centred columns at 42.21. What did the uncentred search find?",
              [
                "A slightly less accurate version of the centred component",
                "The direction in which the whole crowd sits, at a cosine of 0.99992 to the arrow from zero to the average person",
                "The direction along which the people spread least",
                "Nothing usable, since the search failed to settle",
              ],
              1,
              "It came back as a unit direction with a share of the total attached, computed correctly, and nothing about it signals that the question it answered is a different one. Its share of 0.9946 looks better than the centred component’s 0.9897 only because the two are fractions of different totals, and most of the first total is the location.",
            ),
            choice(
              "Of the mean squared distance of the eleven people from zero, about how much comes from variation between people?",
              ["About 3.5 percent", "About half", "About 96.5 percent", "About 99.5 percent"],
              0,
              "The mean of x² is the variance plus the square of the mean, which here splits 26,849.4 into 952.9 and 25,896.4. A column far from zero carries most of its squared length as location, so a search for the direction of largest squared length is mostly a search for where the crowd sits.",
            ),
            trueFalse(
              "Recording every height as the distance above a mark on the wall turns the uncentred direction, while the centred component stays exactly where it was.",
              true,
              "The mark changes no gap between any two people, and the uncentred answer turns anyway, which is the sign that it was never a fact about the people. The centred component is the same at every mark, because centring takes away whatever the mark added before the search begins, and a component fit that centres for itself gave the same direction on the recorded columns as on columns centred beforehand, a gap of 0.0.",
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
                  centimetres from the shortest person, so the line has to swing
                  to reach it.
                </p>
                <Equation>{"with an intercept    weight = b₀ + b₁ × height\nthrough zero         weight = b₁ × height"}</Equation>
                <CentringPlayground panels={["line"]} />
                <InAModel title="Weight on height, both ways">
                  <p>
                    With an intercept the slope is 0.890 kg per centimetre and the line explains 0.9588 of the variation in weight, on the usual scale where one is perfect and zero is no better than giving everyone the mean weight. Forced through zero, the slope falls to 0.363 and the share explained to 0.6155, because a line from the origin has to split the difference between the children and the adults.
                  </p>
                  <p>
                    Centre both columns first and the line through zero has a slope of 0.890 again and explains 0.9588 again. Move the zero to 100 cm on the playground and the forced slope becomes 1.007 with 0.9390 explained, better because the point it is forced through is nearer the people.
                  </p>
                </InAModel>
                <KeepInMind>
                  Dropping an intercept is a claim that a person of no height
                  weighs nothing, and on uncentred columns the fitted line is constrained to
                  honour that claim across a gap of 118 centimetres. On centred
                  columns zero is the average person, the average person does have
                  the average weight, and the same claim costs nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Centring is what an intercept does">
                <p>
                  The centred line through zero and the line with an intercept
                  agreed on the slope, and that agreement is an identity. The
                  least-squares intercept always sends the line through the
                  average person, so fitting an intercept is the same as centring
                  both columns and fitting through zero, and the intercept is what
                  appears when the centring is undone.
                </p>
                <Equation>{"b₀ = mean weight − b₁ × mean height\n−81.77 = 53.36 − 0.8901 × 151.82"}</Equation>
                <WorkedExample title="What the intercept means, twice">
                  <p>
                    On the recorded heights the intercept is −81.77 kg, the weight
                    the line gives a person of no height, an extrapolation 118
                    centimetres past the shortest child that describes nobody. On
                    centred heights the intercept is 53.36 kg, the weight the line
                    gives the average person, which is the mean weight exactly. The
                    slope is 0.8901 in both, so the two are one line with the zero
                    of its height axis in two places. On the measured four the
                    same pair is a slope of 0.6 with intercepts of −34 and 68.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Centring before a fit with an intercept leaves the slope where it
                  was and moves the intercept to the average person, where it can
                  be read. The case where centring changes the fitted line itself
                  is the one in step 7, a fit told to have no intercept.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. A penalty that reaches the intercept">
                <p>
                  A{" "}
                  <Link href="/concepts/ridge-lasso" className={link}>
                    ridge
                  </Link>{" "}
                  line adds the squared size of its slope to what it minimises,
                  and leaves the intercept out of that penalty on purpose, since
                  shrinking the intercept would pull the line towards a weight of
                  zero at a height of zero, the very point step 7 forced it
                  through. Because the intercept is exempt, a ridge line with an
                  intercept is exactly a ridge line through zero on centred
                  columns, at any penalty.
                </p>
                <NumberTable
                  headings={["penalty", "slope, intercept exempt", "slope, centred and through zero", "slope, recorded and through zero", "explained, recorded and through zero"]}
                  rows={[
                    ["1", "0.88992", "0.88992", "0.36342", "0.6155"],
                    ["100", "0.87484", "0.87484", "0.36328", "0.6155"],
                  ]}
                  caption="The first two slopes agree to within 2 × 10⁻¹⁵ at both penalties. The third is an intercept penalised without limit, held at zero whatever it costs."
                />
                <p>
                  The ridge fitted here always exempts its intercept, so a penalty
                  of some middling size on the intercept cannot be shown with it.
                  What can be shown is the far end, an intercept held at zero,
                  which is the line of step 7 with a penalty added, and its slope
                  barely moves as the penalty rises from 1 to 100 because a slope
                  of 0.36 is cheap to hold. The damage there was done by the
                  missing intercept, and the penalty adds almost nothing to it.
                </p>
                <KeepInMind>
                  A penalised intercept makes the fit depend on where each
                  column&rsquo;s zero happens to be, which steps 6 and 7 measured
                  going wrong. An implementation either exempts the intercept, or
                  centres the columns so the intercept a penalty would shrink is
                  already near zero, and one that penalises every weight alike
                  needs the second.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. How Centring Changes a Walk",
          content: (
            <>
              <SubSection title="10. Two columns pointing almost the same way">
                <p>
                  A least-squares fit with an intercept treats the intercept as the
                  weight on a column of ones, one for every person, fitted beside
                  the height column. On the recorded heights those two columns
                  point almost the same way, since every height is somewhere near
                  150 times one, and the cosine between them is 0.9889. Centring
                  makes the height column add to zero, which is exactly the
                  condition for it to be at right angles to the column of ones,
                  and the cosine becomes 2.3 × 10⁻¹⁶.
                </p>
                <Equation>{"cosine(ones, height) = Σ heightᵢ / (√n × √(Σ heightᵢ²))\nΣ (heightᵢ − m) = 0, so cosine(ones, centred height) = 0"}</Equation>
                <p>
                  Two columns that point the same way make the bowl a{" "}
                  <Link href="/concepts/gradient-descent-regression" className={link}>
                    gradient walk
                  </Link>{" "}
                  descends into long and narrow. Along its two natural directions
                  its curvatures are 0.0221 and 23,571.5 on the recorded heights,
                  a condition number of 1,064,838, and 1 and 521.8 on centred
                  heights, a condition number of 521.8.
                </p>
                <WhyThisWorks>
                  <p>
                    The curvature of the mean squared error is twice the mean of
                    the outer products of the design&rsquo;s rows. For a column of
                    ones beside a height column that is twice the matrix below,
                    with m the mean height and v its variance, and its determinant
                    is v whatever m is.
                  </p>
                  <Equation>{"[ 1    m     ]\n[ m    m² + v ]"}</Equation>
                  <>
                    <p>
                      Write the two curvatures as c₁ and c₂, the mean height as m, and
                      the height variance as v. Their sum and product explain why a
                      large mean creates a narrow valley.
                    </p>
                    <Equation>{"c₁c₂ = v\nc₁ + c₂ = 1 + m² + v"}</Equation>
                    <p>
                      As the mean grows, one curvature grows roughly with its square
                      while the other shrinks. On this crowd the sum is 23,571.6 and the
                      product is 521.8. Centring sets the mean to zero, leaving a
                      diagonal matrix with curvatures one and v.
                    </p>
                  </>
                </WhyThisWorks>
                <KeepInMind>
                  Centring removes the coupling between the intercept and each
                  column and leaves every other coupling where it was. Height and
                  weight used as two inputs to one fit keep their correlation of
                  0.979 after centring, since a correlation is measured about the
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
                  number of 521.8 still left on centred heights is the variance of
                  the heights in square centimetres, a matter of units, and
                  dividing by the spread on the feature scaling page takes it to
                  one.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. A column and its own square">
                <p>
                  A curve through the crowd uses height and height squared as two
                  columns, and on the recorded heights those two are nearly the
                  same column, since between 118 and 183 cm a square rises almost
                  in a straight line with the height. Their correlation is 0.9980.
                  Centre the heights before squaring and the square measures
                  distance from the average person in either direction, which is a
                  different shape from the height, and the correlation falls to
                  −0.229.
                </p>
                <NumberTable
                  headings={["heights", "correlation with the square", "condition number", "weight on height", "weight on the square", "explained"]}
                  rows={[
                    ["recorded", "0.9980", "1,245,454", "0.0652", "0.0027573", "0.96213"],
                    ["centred", "−0.229", "1073", "0.9024", "0.0027573", "0.96213"],
                  ]}
                  caption="The curve is the same curve both times, with the same weight on the square and the same share explained. The weight on height changed meaning, from the slope of the curve at a height of zero to its slope at the average height."
                />
                <KeepInMind>
                  This is the collinearity centring removes, a correlation made by
                  where zero sits. It leaves a correlation between two different
                  measurements alone, and a better condition number after centring does not make
                  extrapolation to an unobserved zero-height person more reliable.
                  It changes which parameter describes the central prediction.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Forced through zero on the recorded columns, the slope falls from 0.890 to 0.363 and the share explained from 0.9588 to 0.6155. What happens if both columns are centred first?",
              [
                "The slope falls further, since the centred heights are smaller numbers",
                "The slope is 0.890 again and the share explained 0.9588 again",
                "The line can no longer be fitted without an intercept",
                "The slope recovers and the share explained does not",
              ],
              1,
              "Dropping an intercept is a claim that a person of no height weighs nothing, and on the recorded columns the line has to honour that across a gap of 118 centimetres. On centred columns zero is the average person, the average person does have the average weight, and the claim costs nothing. Moving the zero only part of the way, to 100 cm, gives 1.007 and 0.9390.",
            ),
            trueFalse(
              "Centring before a fit that has an intercept moves the fitted slope.",
              false,
              "It leaves the slope where it was and moves the intercept to the average person, where it can be read. The least-squares intercept always sends the line through the average person, so fitting an intercept is the same as centring both columns and fitting through zero, and the intercept is what appears when the centring is undone.",
            ),
            choice(
              "Why does a ridge line leave its intercept out of the penalty?",
              [
                "The intercept is not a slope, so a squared size is not defined for it",
                "Shrinking it would pull the line towards a weight of zero at a height of zero",
                "The intercept is always small once the columns are centred",
                "Penalising it would make the fit slower to solve",
              ],
              1,
              "That is exactly the point a line through zero is forced through and which cost it half its explanatory share. Because the intercept is exempt, a ridge line with an intercept is exactly a ridge line through zero on centred columns, at any penalty, and an implementation that instead penalises every weight alike needs the columns centred.",
            ),
            choice(
              "The two curvatures on the recorded heights are 0.0221 and 23,571.5, a condition number of 1,064,838. What are they after centring?",
              [
                "0.0221 and 521.8",
                "1 and 521.8",
                "1 and 1",
                "Unchanged, since centring moves the bowl rather than reshaping it",
              ],
              1,
              "Centring makes the height column add to zero, which is exactly the condition for it to be at right angles to the column of ones that carries the intercept, so the matrix becomes diagonal. The 521.8 left over is the variance of the heights in square centimetres, a matter of units, and dividing by the spread takes it to one.",
            ),
            several(
              "Which of these does centring repair?",
              [
                "The coupling between the intercept and a column",
                "The correlation of 0.979 between height and weight used as two inputs",
                "The correlation of 0.9980 between height and height squared",
                "The reliability of extrapolating to a person of no height",
              ],
              [0, 2],
              "A correlation is measured about the means already, so shifting the origin cannot touch a dependence between two different measurements. Squaring after centring measures distance from the average person in either direction, which is a different shape from the height, and the correlation falls to −0.229. A better condition number changes which parameter describes the central prediction and makes no extrapolation safer.",
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
                      angle is 177.4 degrees. The most opposite pair after centring is
                      the 120 centimetre child and the 178 centimetre adult, with cosine
                      −0.9996.
                    </p>
                  </>
                </InAModel>
                <KeepInMind>
                  Measured from zero, the cosine compares weight per centimetre
                  and nothing else. Measured from the average person, it compares
                  which way from average each person lies. On data where zero means
                  none, a count of each word in a document for instance, the first
                  of those is often the question wanted, which is why the{" "}
                  <Link href="/concepts/distance-and-similarity" className={link}>
                    distance and similarity
                  </Link>{" "}
                  page uses the angle uncentred.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Correlation is a cosine after centring">
                <p>
                  The same move made on the columns rather than the people gives a
                  familiar number. The cosine between the height column and the
                  weight column, each taken as an arrow of eleven numbers, is
                  0.97439 on the recorded values. Centre both and it is 0.97919,
                  and the correlation between height and weight is 0.97919 as
                  well, because a correlation is defined as exactly that cosine.
                </p>
                <Equation>{"correlation(x, y) = Σ (xᵢ − x̄)(yᵢ − ȳ) / √(Σ (xᵢ − x̄)² × Σ (yᵢ − ȳ)²)\n                  = cosine(x − x̄, y − ȳ)"}</Equation>
                <KeepInMind>
                  The uncentred column cosine is pulled towards one by the level of
                  both columns, whatever their relationship, since two columns of
                  large positive numbers are two arrows pointing into the same
                  corner. It said 0.974 here, close to the correlation only
                  because height and weight really are closely related in this
                  crowd.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Nearness by angle, before and after">
                <p>
                  Now put the two angles to work in a vote. Each person in turn is
                  held out, their three nearest among the other ten vote on
                  whether they are a child or an adult, and the votes are counted
                  right or wrong. The widget in step 13 shows the tally under its
                  two panels. By angle from zero 10 of the 11 votes are right, by
                  angle from the average person all 11 are, and by straight-line
                  distance 9 of 11 whether the columns were centred or not.
                </p>
                <NumberTable
                  headings={["three nearest chosen by", "recorded columns", "centred columns"]}
                  rows={[
                    ["straight-line distance", "9 of 11", "9 of 11"],
                    ["angle", "10 of 11", "11 of 11"],
                  ]}
                  caption="The straight-line vote cannot tell the two sets of columns apart. The angle vote gave one person a different answer."
                />
                <KeepInMind>
                  One vote among eleven people is not evidence that centred angles
                  classify better in general. What it shows is that the angle is a
                  different rule after centring where the straight line is the
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
                  sees the same crowd before and after centring, and the table
                  below fits each of them twice to show it.
                </p>
                <Equation>{"(aᵢ − m) − (bᵢ − m) = aᵢ − bᵢ"}</Equation>
                <ShiftInvariance />
                <InAModel title="Before and after, measured">
                  <p>
                    The 110 distances between two different people agree to within
                    5.1 × 10⁻¹⁴ centimetres, the three-person vote by distance
                    scores 9 of 11 both ways, and{" "}
                    <Link href="/concepts/k-means" className={link}>
                      k-means
                    </Link>{" "}
                    asked for two groups finds the same two groups with the same
                    total squared distance to their centres, 2952.607, both times.
                  </p>
                </InAModel>
                <KeepInMind>
                  A shared shift cancels from every difference. A method that only
                  ever subtracts one person from another, or one person from a
                  centre that moves with them, cannot notice where zero was put.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. A threshold, a group and a slope">
                <>
                  <p>
                    A decision tree asks whether a height is below a threshold. Centring
                    shifts the threshold by the same amount as every height. The first
                    split on this crowd uses 151.5 centimetres.
                  </p>
                  <Equation>{"centred threshold = 151.5 − 1670/11 ≈ −0.318 cm"}</Equation>
                  <p>
                    The eleven predictions stay the same. A least-squares fit with an
                    intercept also preserves its predictions: the intercept absorbs the
                    shift, as step 8 showed. Its slopes agree between the two coordinate
                    systems to within floating-point rounding.
                  </p>
                </>
                <KeepInMind>
                  The methods centring does nothing for build their answers from
                  differences, from order within a column, or from a fit with a
                  free intercept. The ones it changes, the uncentred direction,
                  the line through zero, the penalised intercept, the walk and the
                  angle, all measure something from zero itself.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where Centring Stops Being Defined",
          content: (
            <>
              <SubSection title="18. Nothing to average, and one value">
                <p>
                  The mean of a column is its sum divided by its count, and for a
                  column with nothing in it that is zero over zero. There is then
                  no centre to subtract, and whoever is asked for one faces the
                  same three choices a spread of zero forces on the standard score,
                  which are to refuse, to invent a number, or to hand back
                  something that is not a number. The cases around it are
                  better behaved than they look, because centring divides by
                  nothing.
                </p>
                <DerivationTable
                  expressionHeading="the column"
                  reasonHeading="what the mathematics says"
                  rows={[
                    {
                      expression: "an empty column",
                      reason:
                        "the mean is 0 / 0, which has no value, so there is no centre and no centred column. Refusing is the one answer that invents nothing; returning zero would put a centre on a column that has none.",
                    },
                    {
                      expression: "one value, 170",
                      reason:
                        "defined. The mean is 170 and the centred column is a single 0, which is correct and says nothing about how people differ, since one person is not a crowd.",
                    },
                    {
                      expression: "a constant column, 7, 7, 7",
                      reason:
                        "defined, and it centres to 0, 0, 0 exactly. The standard score of the same column is 0 / 0, because it goes on to divide by a spread of zero; centring divides by nothing, so the case that stopped the standard score is ordinary here.",
                    },
                    {
                      expression: "a missing or infinite value",
                      reason:
                        "the sum is not a number, or is infinite, and so is the mean, and every value in the column is then centred by it, so one bad entry reaches every other value in the column through the mean they share.",
                    },
                    {
                      expression: "a column of counts, mostly 0",
                      reason:
                        "defined, and every zero becomes minus the mean, so a column that was mostly zeros has none left. Where zero meant none, that meaning is gone and a sparse column is dense; the scalers that divide without centring exist for this case.",
                    },
                  ]}
                />
                <KeepInMind>
                  One value and a constant column are fine for the arithmetic and
                  of no use to anything after it. A centred column of zeros is the
                  correct answer to centring such a column, and what to do with a
                  column that carries nothing is a decision for the method that
                  reads it next.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. A mean learned on other rows">
                <p>
                  When some people are held out to test on, the mean has to come
                  from the training rows alone and then be taken away from the
                  held-out rows unchanged. That is perfectly well defined, and the
                  answer it gives looks wrong at first sight, since the held-out
                  rows no longer average zero.
                </p>
                <Equation>{"held-out centred value = held-out value − training mean"}</Equation>
                <InAModel title="The three tallest held out">
                  <p>
                    Without the three tallest adults the other eight have a mean
                    height of 141.125 cm. The held-out heights of 180, 183 and 178
                    centre on that to 38.875, 41.875 and 36.875, which average
                    39.21, far from zero and correctly so, since they are three
                    people taller than anyone the mean was learned from. Centred on
                    their own mean of 180.33 they become −0.33, 2.67 and −2.33,
                    which says that one of the three tallest people in the crowd is
                    below average, and the only average in sight is their own.
                  </p>
                </InAModel>
                <KeepInMind>
                  Centring held-out rows on their own mean is defined arithmetic
                  and the wrong operation, since it hands a model numbers measured
                  from a different zero from the one it learned on. The{" "}
                  <Link href="/concepts/the-standard-score" className={link}>
                    standard score
                  </Link>{" "}
                  page measured what that costs a fitted line, and centring
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
                    A week of bedtimes between half past ten and one in the morning has an arithmetic mean of 13.36, early afternoon, and a circular mean of 23.64, a little after twenty to midnight. Six in the morning and six in the evening have an arithmetic mean of noon and no circular mean at all, since their points average to the centre of the face, 6 × 10⁻¹⁷ from it, and a point at the centre has no direction.
                  </p>
                </InAModel>
                <p>
                  A column of codes has the same trouble more quietly. Numbering four blood groups 1 to 4 gives the column a mean, and taking it away gives every person a number, but no position on that line is a blood group and the gap from group 1 to group 3 is twice the gap from 1 to 2 only because of the order the numbers were handed out in.
                </p>
                <p>
                  A column of zeros and ones is the exception worth knowing, since its mean is the share of ones, 6 adults of 11 in the crowd or 0.545, and a centred label measures how much more or less adult than the crowd&rsquo;s average a person is, which is a real quantity.
                </p>
                <KeepInMind>
                  Whether a column&rsquo;s mean is a meaningful place is a question
                  about what the numbers measure, and nothing in the arithmetic can
                  answer it. A time of day wants its sine and cosine as two
                  columns, or a circular mean in place of the ordinary one, and a
                  code wants one column per value; centring either as it stands
                  returns a number for every row, correctly computed, measured
                  from a place that does not exist.
                </KeepInMind>
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
                "Every arrow from zero points up and to the right at a shallow angle, so the cosine compares weight per centimetre and nothing else",
                "The cosine ignores length, and these people differ mostly in length",
                "Eleven people are too few for the measure to separate",
              ],
              1,
              "From the average person the same 118 cm child and 183 cm adult are at a cosine of −0.9990, nearly opposite, because the comparison is now which way from average each one lies. Neither reading is wrong. On data where zero means none, a count of each word in a document for instance, the uncentred question is often the one wanted.",
            ),
            trueFalse(
              "Centring two columns turns the cosine between them into their correlation.",
              true,
              "A correlation is defined as exactly that cosine. On the recorded columns the cosine is 0.97439 and centred it is 0.97919, which is the correlation. The uncentred figure is pulled towards one by the level of both columns, whatever their relationship, and here it happened to land close only because height and weight really are closely related in this crowd.",
            ),
            several(
              "Which of these see the same crowd before and after centring?",
              [
                "The straight-line distance between two people",
                "A decision tree’s split",
                "k-means asked for two groups",
                "The cosine between two people",
              ],
              [0, 1, 2],
              "A shared shift cancels from every difference, so the 110 distances agree to within 5.1 × 10⁻¹⁴ centimetres and k-means finds the same two groups with the same total of 2952.607. A tree’s threshold shifts by the same amount as every height and the eleven predictions stay the same. The cosine measures from zero itself, which is why moving zero changes it.",
            ),
            trueFalse(
              "Centring held-out rows on their own mean is defined arithmetic and the wrong operation.",
              true,
              "Without the three tallest adults the other eight have a mean height of 141.125 cm, and the held-out heights centre on that to 38.875, 41.875 and 36.875, far from zero and correctly so. On their own mean of 180.33 they become −0.33, 2.67 and −2.33, which says one of the three tallest people in the crowd is below average, and hands the model numbers measured from a different zero from the one it learned on.",
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
              "A mean is always a number and it is a place only when the column’s numbers are positions along a line. The circular mean reads the time off the direction of the averaged point on the rim, which here lies 0.966 of the way out, saying the two agree closely. Six in the morning and six in the evening have no circular mean at all, since their points average to the centre of the face and a point at the centre has no direction.",
            ),
        ],
        },
        {
          title: "Practice. Centring the Crowd With the Library",
          practice: [
            exercise(
              "Centre the crowd",
              ["Centre the eleven people with the library, read the centre it learned for each column, and check what Part 1 says a centred column keeps and loses.", "Part 1 quotes a mean height of 151.82 and a mean weight of 53.36, the first child at (−4.82, −12.36) once centred, centred heights that average 5.2 × 10⁻¹⁵ rather than exactly zero, and a variance of 521.79 before centring and after it. Print all of those."],
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
              { hints: ["fit takes a list of Feature objects. What it learned is in scalings, one per column, each with a name and a centre, and a spread of exactly one, since centring divides by nothing.", "transform answers a list of Feature objects in the same order, and each one’s values are the centred numbers.", "pvariance from the standard library is the variance about the mean, which is the figure the page quotes; the mean of the centred heights is a sum over a count and will not be exactly zero."], check: numberCheck("What is the first child’s centred height, in centimetres?", -4.82, 0.005, "The first child is 147 centimetres tall and the mean height is 1670 over 11, so the centred value is 147 less 151.82. Negative means below the column average, the unit is still centimetres, and the variance is 521.79 either way, because spread is measured about the mean and the mean moved with the column.") },
            ),
            exercise(
              "Force the line through zero, then centre first",
              ["Part 3 fits weight from height three ways. Fit the line with an intercept on the recorded columns, then force it through zero on the recorded columns, then force it through zero on columns centred first, and read the slope and the share of the variation explained each time.", "Part 3 quotes 0.890 and 0.9588 with an intercept of −81.77, then 0.363 and 0.6155 through zero, then 0.890 and 0.9588 again once both columns are centred. The third fit should agree with the first to every printed digit."],
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
              { hints: ["fit_intercept is a field of the model, set at construction, and False is what forces the line through zero.", "coefficients is addressable by the feature’s name, intercept is a property, and score answers the share explained on the usual scale where one is perfect and zero is no better than guessing the mean weight.", "The centred fit takes the centred height and the centred weight, both from the one centrer fitted on both columns."], check: numberCheck("What slope does the line forced through zero have on the recorded columns?", 0.3634, 0.0005, "Dropping the intercept is a claim that a person of no height weighs nothing, and on the recorded columns the line has to honour it across a gap of 118 centimetres, so it swings down to split the difference between the children and the adults and explains only 0.6155. On centred columns zero is the average person, who does have the average weight, and the same claim costs nothing, which is why the centred fit through zero recovers the 0.8901 of the fit with an intercept.") },
            ),
            exercise(
              "Centre the held-out rows on the training mean",
              ["Part 7 holds out the three tallest adults and says their centre has to come from the eight training rows alone. Fit a centrer on the eight, use it to centre the three held-out heights, and then do the wrong thing on purpose by centring the three on their own mean.", "Part 7 quotes a training mean of 141.125, held-out values of 38.875, 41.875 and 36.875 averaging 39.21, and −0.33, 2.67 and −2.33 on their own mean of 180.33. Print all of them."],
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
              { hints: ["A centrer fitted on one Feature can transform another Feature of the same name, which is exactly how a held-out row gets the training mean taken away unchanged.", "scalings is addressable by the column’s name, and the centre is the mean it learned.", "The second centrer is fitted on the held-out heights themselves, which is the defined arithmetic the page calls the wrong operation."], check: numberCheck("What do the three held-out heights average once centred on the training mean?", 39.21, 0.005, "The three are taller than anyone the mean was learned from, so centred on 141.125 they sit far above zero, and correctly so. Centred on their own mean of 180.33 one of the three tallest people in the crowd comes out below average, which hands a model numbers measured from a different zero from the one it learned on.") },
            ),
            exercise(
              "Walk to the line from recorded heights and from centred ones",
              ["Part 4 says the recorded heights make the bowl a gradient walk descends into long and narrow, and centring does not. Run the page’s two walks, one on the recorded heights and one on heights centred first, each stepping at half the rate that would make it diverge and each capped at twenty thousand passes, and read where each stops.", "Part 4 quotes a walk on the recorded heights that is still at a slope of 0.3732 and a level of −1.52 after all twenty thousand passes, against the fitted line’s 0.8901 and −81.77, and a centred walk that reaches a level of 53.36 when it stops at pass 8415. The two rates in the starter are one over twice the larger curvature the page quotes, 23,571.5 on the recorded heights and 521.8 on the centred ones."],
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
              { hints: ["learning_rate and max_epochs are set at construction, and the data goes to fit as a list of one Feature and the target Feature.", "coefficients is addressable by the column’s name, which the centrer kept as height, and intercept is the level.", "epochs_run and converged are the walk’s own record. A walk that used all twenty thousand passes reports converged False, which is what happens on the recorded heights."], check: numberCheck("What slope has the walk on the recorded heights reached after twenty thousand passes?", 0.3732, 0.0005, "On the recorded heights the column of ones and the height column point almost the same way, with curvatures of 0.0221 and 23,571.5 along the bowl’s two natural directions, so the first pass corrects the steep direction to a slope near the through-zero line’s 0.3634 and every later pass crawls along the shallow one. Centring makes the two columns perpendicular, the curvatures become 1 and 521.8, and the same walk lands on the fitted line at pass 8415.") },
            ),
          ],
        },
      ]}
    />
  );
}
