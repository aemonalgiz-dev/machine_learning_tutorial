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
import { AnglesFromTheMean } from "@/components/widgets/AnglesFromTheMean";
import { BedtimeClock } from "@/components/widgets/BedtimeClock";
import { CentringPlayground } from "@/components/widgets/CentringPlayground";
import { ShiftInvariance } from "@/components/widgets/ShiftInvariance";
import { WalkFromTheMean } from "@/components/widgets/WalkFromTheMean";

export const metadata: Metadata = {
  title: "Centring on the Mean · oop_ml",
  description:
    "Subtract each column’s average and divide by nothing, and see which methods were measuring from a zero nobody in the data is near, and which never noticed where zero was.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function CentringOnTheMeanPage() {
  return (
    <ConceptPage
      title="Centring on the Mean"
      tagline="Take each column&rsquo;s average away from every value in it and divide by nothing, and every method that measures from zero starts measuring from the average person."
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
      history={
        <>
          <p>
            When Karl Pearson looked for the line lying closest to a cloud of
            measured points, in his 1901 paper in the Philosophical Magazine
            &ldquo;On lines and planes of closest fit to systems of points in
            space&rdquo;, one of the first things he established was that the best
            line passes through the centroid, the point whose coordinates are the
            means. From then on the natural place to measure a cloud from was its
            own middle, and every principal component calculation since has begun
            by subtracting it. The older analysis-of-variance tables record the
            same habit in their vocabulary, where the sum of squares about the
            mean is the corrected sum of squares, the correction being for the
            mean, and the raw sum of squares about zero is the uncorrected one
            that nobody reports.
          </p>
          <p>
            In regression the argument came later and was sharper. Ralph Bradley
            and Sushil Srivastava, in &ldquo;Correlation in polynomial
            regression&rdquo; in The American Statistician in 1979, showed that
            the strong correlation between a column and its own square, which
            makes curved fits unstable, depends on where that column&rsquo;s zero
            happens to sit and can be removed by moving it. Donald Marquardt, in
            &ldquo;You should standardize the predictor variables in your
            regression models&rdquo; in the Journal of the American Statistical
            Association in 1980, called that kind of trouble nonessential
            ill-conditioning, to separate it from the essential kind that comes
            from two measurements genuinely moving together. David Belsley
            answered in 1984, in &ldquo;Demeaning conditioning diagnostics through
            centering&rdquo;, that centring does not cure the ill-conditioning
            involving the intercept; the intercept at a height of zero is known
            no better than before, it has only stopped being asked for. The
            disagreement was about whether a number that improves after centring
            had measured a difficulty in the data or a difficulty in the question,
            and both sides were partly right, which this page measures on the
            crowd.
          </p>
          <p>
            The ecologists had the opposite worry. Imanuel Noy-Meir, in
            &ldquo;Data transformations in ecological ordination. I. Some
            advantages of non-centering&rdquo; in the Journal of Ecology in 1973,
            argued that for a table of how much of each species was found at each
            site, where zero means a species is absent and is therefore a genuine
            place, leaving the table uncentred can be the right question. Both
            positions survive, since whether zero is a meaningful origin is a fact
            about what the columns measure. The page asks six questions about it
            in order, on eleven people measured by height and weight. What does
            subtracting the mean change, and what does it keep? What does a
            search for the longest direction find when zero is far from everyone?
            Why is fitting an intercept the same thing as centring, and what goes
            wrong for a line or a penalty without one? How does centring change
            the number of steps a gradient walk takes? What happens to the angle
            between two people? And which methods never notice, and where does a
            mean stop being a place to measure from at all?
          </p>
        </>
      }
      playground={<CentringPlayground />}
      sections={[
        {
          title: "Part 1. Moving the Zero to the Average Person",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Where zero sits in the crowd">
                <p>
                  The crowd is eleven people, five children and six adults, with
                  heights between 118 and 183 centimetres and weights between 24
                  and 83 kilograms. Every one of those numbers is measured from
                  zero, and a height of zero and a weight of zero describe nobody
                  in the crowd or anywhere else, so the point every number is
                  measured from is 118 centimetres below the shortest person in
                  it. Centring moves that point to the average person, by taking
                  each column&rsquo;s mean away from every value in the column and
                  dividing what is left by nothing.
                </p>
                <Equation>{"centred value = value − mean of its column"}</Equation>
                <WorkedExample title="The crowd, centred">
                  <p>
                    The eleven heights add to 1670 and the eleven weights to 587,
                    so the average person is 1670 / 11 = 151.82 centimetres tall
                    and weighs 587 / 11 = 53.36 kilograms. The first child, 147 cm
                    and 41 kg, becomes −4.82 and −12.36, a little shorter than the
                    average person and a good deal lighter. The tallest adult, 183
                    cm and 83 kg, becomes 31.18 and 29.64.
                  </p>
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
                  Taking the same number away from every height moves the whole
                  column along its ruler and changes nothing about how the heights
                  sit relative to one another. The 145 cm child and the 147 cm
                  child were two centimetres apart before and are two apart after,
                  and so is every other pair; the largest change in the gap
                  between any two people&rsquo;s heights came out at exactly zero.
                  The spread survives as well, because spread is measured about
                  the mean and the mean moved with the column, so the variance of
                  the heights is 521.79 square centimetres before centring and
                  after it.
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
          ),
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
                    The longest direction from zero runs at 20.09 degrees above
                    the height axis. The arrow from zero to the average person
                    runs at 19.37 degrees, and the cosine between those two is
                    0.99992, so the search found where the crowd is. The first
                    principal component of the centred columns runs at 42.21
                    degrees, the direction in which taller people are also
                    heavier, and its cosine with the uncentred answer is 0.926. On
                    the measured four, whose average person is 170 cm and 68 kg,
                    the uncentred direction is 21.85 degrees against an arrow to
                    the mean at 21.80, while the centred component lies at exactly
                    45.
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
                  <p>
                    Over both columns the eleven people lie a mean squared 26,849.4
                    from zero. Their two variances add to 952.9, which is all the
                    spread there is, and the squared length of the average person,
                    151.82² + 53.36², is 25,896.4. So 96.5 percent of what the
                    uncentred search was making as large as possible is the
                    position of the crowd, and 3.5 percent is how its members
                    differ. On the measured four the split comes out in whole
                    numbers, 33,649 = 125 + 33,524, since 170² + 68² is 33,524.
                  </p>
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
                    With an intercept the slope is 0.890 kg per centimetre and the
                    line explains 0.9588 of the variation in weight, on the usual
                    scale where one is perfect and zero is no better than giving
                    everyone the mean weight. Forced through zero, the slope falls
                    to 0.363 and the share explained to 0.6155, because a line from
                    the origin has to split the difference between the children
                    and the adults. Centre both columns first and the line through
                    zero has a slope of 0.890 again and explains 0.9588 again. Move
                    the zero to 100 cm on the playground and the forced slope
                    becomes 1.007 with 0.9390 explained, better because the point
                    it is forced through is nearer the people.
                  </p>
                </InAModel>
                <KeepInMind>
                  Dropping an intercept is a claim that a person of no height
                  weighs nothing, and on uncentred columns the fit is bent to
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
                  <p>
                    The two curvatures multiply to v and add to 1 + m² + v, so as m
                    grows one of them grows like m² and the other shrinks like v /
                    m². On the crowd m² + v + 1 is 23,571.6 and the product of the
                    two curvatures is the variance, 521.8. Centring sets m to zero,
                    the matrix becomes diagonal, and the curvatures are 1 and v.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Centring removes the coupling between the intercept and each
                  column and leaves every other coupling where it was. Height and
                  weight used as two inputs to one fit keep their correlation of
                  0.979 after centring, since a correlation is measured about the
                  means already, and that is the essential ill-conditioning of the
                  history above, which no shift of zero can reach.
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
                  <p>
                    On centred heights the slope is right after the first pass,
                    0.89008, because the step size was set by the steep direction
                    and a step of that size removes the steep direction&rsquo;s
                    whole error at once. The level then climbs the shallow
                    direction, to 45.53 kg by pass 1000 and 52.21 by pass 2000,
                    and the walk stops itself at pass 8415 with a level of 53.36,
                    the same count the feature scaling page measured for
                    centimetres. On the recorded heights the first pass puts the
                    slope at 0.3634, the through-zero slope of step 7 to four
                    decimals, since the steep direction is almost exactly the line
                    through zero. The next twenty thousand passes creep along the
                    floor of the valley to a slope of 0.3732 and a level of −1.52,
                    against a destination of 0.8901 and −81.77, which is 1.9
                    percent of the way, and the walk stops at its cap unfinished.
                  </p>
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
                  measurements alone, and whether a better condition number after
                  centring means a difficulty was removed or a difficult question
                  stopped being asked is the argument described in the history at
                  the top of the page.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                  <p>
                    From zero, the child&rsquo;s arrow (118, 24) and the
                    adult&rsquo;s arrow (183, 83) are 12.9 degrees apart, since an
                    arrow from zero is fixed by how many kilograms a person carries
                    per centimetre of height, and 24 / 118 and 83 / 183 are not
                    very different ratios. From the average person their arrows
                    are (−33.82, −29.36) and (31.18, 29.64), pointing almost
                    exactly opposite ways, with a cosine of −0.9990 and an angle of
                    177.4 degrees. The most opposite pair after centring is the 120
                    cm child and the 178 cm adult, at −0.9996.
                  </p>
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
                <p>
                  A{" "}
                  <Link href="/concepts/decision-trees" className={link}>
                    decision tree
                  </Link>{" "}
                  asks whether a height is below a threshold, and centring moves
                  the threshold along with the heights. Grown on the crowd, the
                  tree&rsquo;s first question is whether height is below 151.5
                  centimetres; grown on centred heights it asks whether height is
                  below −0.318, which is 151.5 − 151.82, and its eleven answers are
                  the same eleven answers. A least-squares fit of the child or
                  adult label on both columns with an intercept has the same two
                  slopes either way, to within 1.4 × 10⁻¹⁶, because the intercept
                  takes up the shift exactly as step 8 showed.
                </p>
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
                    The circular mean draws each time as a point on the rim of a
                    clock face, averages the points, and reads the time off the
                    direction of the average. For 23:00 and 01:00 it is midnight,
                    with each time an hour either side, and the averaged point lies
                    0.966 of the way out to the rim, which says the two agree
                    closely. A week of bedtimes between half past ten and one in
                    the morning has an arithmetic mean of 13.36, early afternoon,
                    and a circular mean of 23.64, a little after twenty to
                    midnight. Six in the morning and six in the evening have an
                    arithmetic mean of noon and no circular mean at all, since
                    their points average to the centre of the face, 6 × 10⁻¹⁷ from
                    it, and a point at the centre has no direction.
                  </p>
                </InAModel>
                <p>
                  A column of codes has the same trouble more quietly. Numbering
                  four blood groups 1 to 4 gives the column a mean, and taking it
                  away gives every person a number, but no position on that line
                  is a blood group and the gap from group 1 to group 3 is twice the
                  gap from 1 to 2 only because of the order the numbers were
                  handed out in. A column of zeros and ones is the exception worth
                  knowing, since its mean is the share of ones, 6 adults of 11 in
                  the crowd or 0.545, and a centred label measures how much more
                  or less adult than the crowd&rsquo;s average a person is, which
                  is a real quantity.
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
      ]}
    />
  );
}
