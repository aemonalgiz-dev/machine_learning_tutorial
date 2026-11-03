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
import { FeatureScalingPlayground } from "@/components/widgets/FeatureScalingPlayground";
import { HoldOutStandardizer } from "@/components/widgets/HoldOutStandardizer";
import { ModelsByUnit } from "@/components/widgets/ModelsByUnit";
import { OutlierRulers } from "@/components/widgets/OutlierRulers";
import { QuartilePositions } from "@/components/widgets/QuartilePositions";
import { ScalingContracts } from "@/components/widgets/ScalingContracts";
import { UnitDistortion } from "@/components/widgets/UnitDistortion";

export const metadata: Metadata = {
  title: "Feature Scaling · Perceptron Lab",
  description:
    "The units of a measurement can affect its influence on a calculation. Scaling changes those units or ranges, which matters when distances or parameter updates are sensitive to the size of the numbers.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FeatureScalingPage() {
  return (
    <ConceptPage
      lessonId="feature-scaling"
      intuition={lessonIntuitions["feature-scaling"]}
      technicalStart="Part 2. One Map, Two Numbers"
      openingTitle="The Same Person, a Different Unit, a Different Answer"
      playgroundTitle="Compare the same measurements under different scales"
      playgroundIntro="Compare the raw and transformed values. Pay attention to how one large observation changes the scale and how the model's answer responds."
      title="Feature Scaling"
      tagline={"The units of a measurement can affect its influence on a calculation. Scaling changes those units or ranges, which matters when distances or parameter updates are sensitive to the size of the numbers."}
      prerequisites={
        <>
          The mean and the standard deviation come from the{" "}
          <Link href="/primers/statistics" className={link}>
            statistics primer
          </Link>
          , and the median and quartiles are their rank-based cousins, met here
          for the first time. The page measures its claims on the{" "}
          <Link href="/concepts/k-nearest-neighbours" className={link}>

            nearest-neighbor
          </Link>{" "}
          and{" "}
          <Link href="/concepts/gradient-descent-regression" className={link}>
            gradient descent
          </Link>{" "}
          pages&rsquo; crowd, though neither page needs to have been read first;
          what each model does with a distance or a step is restated here as far
          as scaling needs it.
        </>
      }

      playground={<FeatureScalingPlayground />}
      sections={[
        {
          title: "Part 1. When the Unit Decides",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Two columns, two units">
                <p>The same people can be described using centimeters, millimeters or meters without changing their physical heights. A distance calculation still sees the numerical differences supplied to it. When height and weight are combined, their units therefore affect which observations appear nearest.</p>
                <Equation>{"distance² = (height gap)² + (weight gap)²"}</Equation>
                <WorkedExample title="The nearest person to a 150 cm, 45 kg query">
                  <>
                    <p>

                      The nearest person is three centimeters away in height and four
                      kilograms away in weight. Changing the height unit changes its
                      numerical contribution to Euclidean distance.
                    </p>
                    <Equation>{"centimetres: distance² = 3² + 4² = 25\n             height share = 9 / 25 = 0.36\n\nmillimetres: distance² = 30² + 4² = 916\n             height share = 900 / 916 ≈ 0.98\n\nmetres:      distance² = 0.03² + 4² = 16.0009\n             height share = 0.0009 / 16.0009 ≈ 0.00006"}</Equation>
                    <p>
                      The people did not change. The numerical weight given to height
                      changed from almost none of the distance to almost all of it.
                      Scaling makes that choice explicit instead of leaving it to the
                      measurement units.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  A squared distance across columns is a sum in which each
                  column&rsquo;s unit is a hidden weight. Recording a column in
                  smaller units multiplies its say in every distance by the
                  square of the factor.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The neighbors change with the unit" id="2-the-neighbours-change-with-the-unit">
                <p>

                  Let&apos;s see whether that choice changes a prediction. We have a person who is 150 cm tall and weighs 60 kg. Their three nearest neighbors will vote on whether they are a child or an adult. The widget repeats the vote with height in millimeters, centimeters and meters, then with both columns standardized by their own standard deviations. Move the green query and look for positions where the votes disagree.
                </p>
                <UnitDistortion />
                <InAModel title="The vote at 150 cm and 60 kg">
                  <>
<p>

                    In millimeters the three nearest are the people at 147, 145 and 156 cm, whose weights are 41, 57 and 53 kg, and the vote is two children to one adult, so the answer is child. Height&rsquo;s share of the squared distance to each of them is between 0.71 and 1.00, so weight had almost no say.
                  </p>
                  <p>In centimeters the nearest are the 145, 156 and 159 cm people. Two are adults, so the prediction is adult. In meters, height contributes less than 0.015 of the squared distance to these neighbors; weight largely determines which people are nearest. The selected people weigh 61, 57 and 57 kg, and the prediction is again adult. Standardization divides height by 22.8 and weight by 20.8. It produces a fourth set of neighbors, with another two-to-one adult vote.</p>
</>
                </InAModel>
                <KeepInMind>

                  Three of the four readings agree that this person is an adult
                  and one says child, and nothing about the person changed
                  between them. A nearest-neighbor model cannot tell an
                  informative column from a column recorded in small units.
                  Standardizing puts the columns on comparable numerical scales.
                  It does not establish their predictive importance. That needs
                  to be evaluated on the task and data.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The walk slows with the unit">
                <>
<p>A gradient-descent fit changes the line&apos;s intercept and slope a little at a time to reduce its error. Plot the error against those two adjustable values and we get a surface with a low region we want to reach. The steepness along the slope direction depends on the numerical scale of height.</p>
              <p>For this centered example, the mean squared centered height is 521.8 in centimeters. The widget uses this as the slope-direction curvature, with the common factor of two in the mean squared error Hessian omitted. Changing to meters makes that number ten thousand times smaller; changing to millimeters makes it one hundred times larger. The physical measurements are unchanged, while the optimization surface has a different numerical shape.</p>
                <p>Under the same normalization, the intercept-direction curvature is one. A single step size must be safe in the steeper direction, which can make progress in the shallower direction very slow.</p>
</>
                <Equation>{"curvature along the slope = mean of (height − mean height)²\ncondition number = steeper curvature / shallower curvature"}</Equation>
                <ModelsByUnit panel="descent" />
                <InAModel title="Passes to converge, each at half its own divergence threshold">
                  <>
<p>

                    Standardized, both directions curve at exactly one, the condition number is one, and the walk reaches the line in two passes. In meters the slope direction curves at 0.052, the condition number is 19.2, and it takes 374 passes. In centimeters the condition number is 521.8 and it takes 8415. In millimeters it is 52,178, the safe step is 0.0000096, and after twenty thousand passes the walk had the slope right and had moved the level only to 17.0 of the 53.4 it was heading for, so the fit stopped at its cap and reported itself unfinished.
                  </p>
                  <p>Each row uses half of its own divergence threshold. This is a consistent comparison rule, rather than a claim that the chosen rate is the fastest possible rate for every shape.</p>
</>
                </InAModel>
                <KeepInMind>

                  The unit sets the shape of the bowl. Meters happened to do
                  better than centimeters here only because a height spread of
                  0.23 m is nearer to one than 22.8 cm is, which is the number
                  standardizing sets to one on purpose rather than by luck of
                  the unit.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. One Map, Two Numbers",
          content: (
            <>
              <SubSection title="4. Subtract a center, divide by a spread" id="4-subtract-a-centre-divide-by-a-spread">
                <p>The methods below transform each column using a reference value and a scale. Subtracting the reference changes where zero sits; dividing by the scale changes what a numerical difference represents. Each method chooses those two quantities differently.</p>
                <Equation>{"scaled = (value − center) / spread"}</Equation>
                <p>

                  The playground at the top of the page is that line drawn five
                  times. The top row holds one column of raw values, and each
                  row beneath it is the same column after one choice of center
                  and spread, printed at the left. The amber dot is the same
                  value in every row, so the rows are five rulers laid against
                  one number, and the readouts at the right are that number
                  read on five rulers.
                </p>
                <KeepInMind>
                  These five methods use the same subtraction-and-division formula once their references have been fitted. They differ in how they estimate the reference and scale, which also determines which columns they can accept.</KeepInMind>
              </SubSection>

              <SubSection title="5. Five readings of the same two numbers">
                <p>

                  What differs between the five methods is only where the
                  center and the spread are read from, and the whole family
                  fits in a table.
                </p>
                <Equation>{"standardize        center = mean              spread = standard deviation\nmin-max            center = smallest value    spread = largest − smallest\nmax-abs            center = 0                 spread = largest magnitude\nrobust             center = median            spread = third quartile − first quartile\nroot mean square   center = 0                 spread = √(mean of the squares)"}</Equation>
                <>
<p>Standardizing gives a nonconstant training column mean zero and population variance one. A linear coefficient on that column describes the prediction change associated with a one-standard-deviation input change, holding other inputs fixed. Min-max scaling places the fitted minimum at zero and the fitted maximum at one. Later values can fall outside that interval.</p>
                <p>Max-absolute scaling divides without subtracting a center. Zeros stay zero, which helps preserve a sparse representation, and signs are unchanged. Robust scaling subtracts the median, the middle of the sorted values. It divides by the gap between the lower and upper quartiles, the positions one quarter and three quarters through the sorted data under a chosen interpolation rule. Root mean square scaling also leaves zero in place and uses the typical squared magnitude about zero as its scale.</p>
</>
                <KeepInMind>
                  Choose a scale according to what the later calculation should treat as a large difference. These transformations impose different numerical references; none can decide whether a feature is useful or whether an extreme reading is valid.</KeepInMind>
              </SubSection>

              <SubSection title="6. The five readings by hand">
                <p>

                  Press the five readings button, five values of 9, 19, 24, 29
                  and 39, chosen so that every center and spread comes out as a
                  whole number. The mean first.
                </p>
                <Equation>{"9 + 19 + 24 + 29 + 39 = 120,   120 / 5 = 24"}</Equation>
                <WorkedExample>
                  <p>

                    The deviations from 24 are −15, −5, 0, 5 and 15, whose
                    squares are 225, 25, 0, 25 and 225. Their mean is the
                    variance and its square root is the standard deviation, so
                    standardizing reads a center of 24 and a spread of 10,
                    which is what the first row prints. Root mean square runs
                    the same sum on the values themselves rather than on their
                    deviations, and its spread comes out at 26.
                  </p>
                  <Equation>{"225 + 25 + 0 + 25 + 225 = 500,   500 / 5 = 100,   √100 = 10\n81 + 361 + 576 + 841 + 1521 = 3380,   3380 / 5 = 676,   √676 = 26"}</Equation>
                  <>
                    <p>

                      The other scalers use different definitions of center and spread.
                      For these five sorted values, the middle is 24 and the two
                      quartiles are 19 and 29.
                    </p>
                    <Equation>{"min-max: center = 9; spread = 39 − 9 = 30\nmax-abs: center = 0; spread = 39\nrobust: center = 24; spread = 29 − 19 = 10"}</Equation>
                    <p>
                      Put the value 39 through each scaler to compare how those choices
                      affect the result.
                    </p>
                  </>
                  <Equation>{"(39 − 24) / 10 = 1.5\n(39 − 9) / 30 = 1.0\n39 / 39 = 1.0\n(39 − 24) / 10 = 1.5\n39 / 26 = 1.5"}</Equation>
                </WorkedExample>
                <p>
                  The readouts at the right say 1.50, 1.00, 1.00, 1.50 and
                  1.50. Standardize and robust agree here by coincidence rather
                  than by rule, since the sample is symmetric, so its median is
                  its mean, and its two quartiles happen to be exactly one
                  standard deviation apart. The outlier button breaks that
                  coincidence at once, and Part 3 says how.
                </p>
              </SubSection>

              <SubSection title="7. What standardizing promises">
                <p>For a finite, nonconstant training column, standardization gives mean zero and population variance one in exact arithmetic. Let m be the training mean and s the population standard deviation. The following calculation shows what happens to that same training column.</p>
                <Equation>{"zᵢ = (xᵢ − m) / s\nmean(z) = (1/n) Σ (xᵢ − m) / s = (1/s) · (m − m) = 0\nvar(z)  = (1/n) Σ (xᵢ − m)² / s² = s² / s² = 1"}</Equation>
                <WhyThisWorks title="Checking the mean and variance after standardization">
                  <p>
                    The first line is the map. The second says the deviations
                    from a mean always cancel, the statistics primer&rsquo;s
                    balance point, so dividing them by anything still leaves a
                    mean of zero. The third is the whole argument. The mean of
                    the squared deviations is s² by definition, and dividing
                    every deviation by s divides that mean by s², which leaves
                    exactly one.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  If the scaler instead uses the sample standard deviation, computed with divisor n − 1, the transformed training column has population variance (n − 1) / n. Its sample variance is one. Comparisons between implementations need to use the same convention.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Five Rulers Against One Outlier",
          content: (
            <>
              <SubSection title="8. What the other four promise">
                <>
<p>With nonzero spread, min-max scaling places the fitted minimum at zero and maximum at one; every interior value keeps its relative position between them. Max-absolute scaling sends the largest magnitude to one or minus one and preserves zero. Robust scaling places the two fitted quartile markers one unit apart. Their positions relative to zero depend on the median.</p>
                <p>
                  Root mean square makes the mean of the squared scaled values one, since it divided by the square root of exactly that mean.
                </p>
</>
                <KeepInMind>
                  Every one of those promises is about the training rows. A
                  min-max scaler fitted on the crowd&rsquo;s heights, 118 to
                  183, was handed a height of 250 and answered 2.03 without
                  complaint, because the unit interval was a fact about the
                  column it learned from and not a bound it enforces.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. One wild value sets the range">
                <p>
                  Press the outlier button on the playground and the 39
                  becomes 99. The mean jumps from 24 to 36, the min-max spread
                  from 30 to 90 and the max-abs spread from 39 to 99, so under
                  those two methods the four ordinary values are squashed into
                  the first third of the ruler, the 29 landing at 0.22 under
                  min-max and at 0.29 under max-abs. The standardize row shifts
                  as well, since both the mean and the standard deviation feel
                  the new value.
                </p>
                <NumberTable
                  headings={["method", "center, five readings", "spread, five readings", "center, with the 99", "spread, with the 99"]}
                  rows={[
                    ["standardize", "24", "10", "36", "32.2"],
                    ["min-max", "9", "30", "9", "90"],
                    ["max-abs", "0", "39", "0", "99"],
                    ["robust", "24", "10", "24", "10"],
                    ["root mean square", "0", "26", "0", "48.3"],
                  ]}
                  caption="Four methods change their references when 39 becomes 99. The robust references stay unchanged for these five observations."
                />
                <KeepInMind>
                  A single extreme value can determine the min-max range and compress the remaining observations into a small part of the output interval. Max-absolute scaling has a similar dependence on an extreme. Check whether that reading is valid before deciding how to scale it.</KeepInMind>
              </SubSection>

              <SubSection title="10. Median and Interquartile Scaling" id="10-the-median-and-the-quartiles-never-looked">
                <p>The robust row still prints a center of 24 and a spread of 10. For these five sorted values, the median and quartiles are the second, third and fourth entries. Replacing only the largest entry leaves those references unchanged. The new value maps to 7.5, while the other four transformed values stay where they were.</p>
                <Equation>{"(99 − 24) / 10 = 7.5"}</Equation>
                <p>The new extreme value changes the mean-based and range-based scales, moving the ordinary observations as well. The robust scale leaves those observations in place for this example. Which behavior is useful depends on whether the extreme value is valid and what the later calculation needs. A scaler cannot determine whether a reading is a mistake.</p>
                <KeepInMind>
                  Whether an extreme value changes the robust references depends on which sorted positions contribute to the median and quartiles. The next examples compare changing the largest height with changing a height near the middle.</KeepInMind>
              </SubSection>

              <SubSection title="11. Where the quartiles land">
                <>
<p>A quartile position can fall between observations, so we need a rule for estimating its value. This implementation uses the fraction of the last zero-based index: one quarter for the lower quartile, one half for the median and three quarters for the upper quartile. When a position is between two indices, it interpolates between those neighboring values.</p>
                <p>
                  Five values have a last index of four, so the cuts fall at 1, 2 and 3, exactly the second, third and fourth values. Eleven values have a last index of ten, so they fall at 2.5, 5 and 7.5.
                </p>
</>
                <QuartilePositions />
                <WorkedExample title="The crowd's eleven heights">
                  <>
                    <p>
                      The sorted heights are 118, 120, 122, 145, 147, 156, 159, 162,
                      178, 180 and 183. With the interpolation convention used here, the
                      lower quartile lies halfway between 122 and 145; the upper lies
                      halfway between 162 and 178.
                    </p>
                    <Equation>{"lower quartile = (122 + 145) / 2 = 133.5\nmedian = 156\nupper quartile = (162 + 178) / 2 = 170\ninterquartile range = 170 − 133.5 = 36.5"}</Equation>
                    <p>

                      The robust scaler therefore uses 156 as the center and 36.5 as the
                      spread.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  Different quartile conventions can produce different robust scales on the same data. Record the convention when comparing results, along with the observations used to fit it.</KeepInMind>
              </SubSection>

              <SubSection title="12. A height typed in millimeters" id="12-a-height-typed-in-millimetres">
                <p>Suppose a form expects centimeters, but someone enters the tallest height as 1830 millimeters without converting it. The widget compares the original heights with that error and with a middle height entered as 1470 instead of 147. The amber dot always marks the unchanged 156 cm observation. Watch how its transformed position changes when the reference data changes.</p>
                <OutlierRulers />
                <InAModel title="The tallest typed as 1830">
                  <>
<p>
                    As measured, the heights have a mean of 151.8 and a standard deviation of 22.8, a range of 65 from 118, a largest magnitude of 183, a median of 156 with an interquartile range of 36.5, and a root mean square of 153.5. With the 183 typed as 1830 the mean goes to 301.5 and the deviation to 483.8, the range to 1712, the largest magnitude to 1830 and the root mean square to 570.1, so the median person, who read 0.58 on the min-max ruler, now reads 0.02, squashed with everyone else into the first four percent of the interval.
                  </p>
                  <p>The robust references remain 156 and 36.5. The median person still maps to 0.00, while the 1830 reading maps to 45.86, more than 45 fitted interquartile ranges above the median.</p>
</>
                </InAModel>
                <KeepInMind>
                  Now try the middle-height error. Moving the fifth sorted value, 147, to 1470 changes which observations determine the middle positions. The median becomes 159 and the interquartile range 45.5. Robust scaling can resist some extreme changes while still changing when the observations used for its references change.</KeepInMind>
              </SubSection>

              <SubSection title="13. Scaling Without Centering" id="13-root-mean-square-keeps-the-level">
                <p>

                  The last row of the playground looks like standardizing with
                  a different spread, and on a column centered at zero that is
                  exactly what it is, since the root mean square of a
                  zero-mean column is its standard deviation. The crowd&rsquo;s
                  heights are nowhere near zero. Their root mean square is
                  153.5, almost the mean of 151.8, because when every value is
                  about 150 the magnitude about zero is about 150.
                </p>
                <Equation>{"root mean square = √(mean of height²) = 153.5\nstandard deviation = √(mean of (height − 151.8)²) = 22.8"}</Equation>
                <InAModel title="The crowd's heights on the two rulers">
                  <p>Dividing by the RMS of 153.5 places the heights between 0.77 and 1.19, a span of 0.42. Standardizing places them between −1.48 and 1.37, a span of 2.85. RMS scaling measures magnitude relative to zero; standardization first removes the shared mean and measures differences relative to their standard deviation.</p>
                </InAModel>
                <KeepInMind>

                  Leaving zeros unchanged can be useful when zero has a specific meaning or when subtracting a mean would make a sparse array dense. Both max-absolute and RMS scaling do this. Their suitability still depends on the calculation and data; a meaningful zero alone does not determine the best scale.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "The nearest person is three centimeters away in height and four kilograms away in weight. Written in millimeters instead, what share of the squared distance does height carry?",
              ["0.36", "About 0.98", "About 0.00006", "The same share, since the people did not change"],
              1,
              "The height difference changes from 3 cm to 30 mm while the weight difference stays 4 kg. In the raw numerical squared-distance calculation:\n\n```math\nheight share = 30² / (30² + 4²) = 900 / 916 ≈ 0.98\n```\n\nChanging only one column's units changes its numerical weight in that distance.",
            ),
            choice(
              "Standardizing puts two columns on comparable numerical scales. What does that establish?",
              [
                "That each column now contributes equally to what the model predicts",
                "Nothing about predictive importance, which still has to be evaluated on the task and data",
                "That the more informative of the two will now win the vote",
                "That the distance is now being measured in the right units",
              ],
              1,
              "The person is unchanged, but altering height units changes which training people are nearest. Standardization removes that particular dependence on measurement units by expressing each column in its own standard deviations. It does not establish which inputs are informative or which distance is best for the task; those choices still need evaluation.",
            ),
            several(
              "For nonconstant training columns in exact arithmetic, which properties do these fitted transformations have? Use the population variance convention for standardization.",
              [
                "Standardizing leaves the column with a mean of exactly zero and a variance of exactly one",
                "Min-max sends the smallest training value to 0 and the largest to 1, preserving relative positions along the interval",
                "Min-max holds every later value inside the unit interval",
                "Robust sends the two quartiles to points exactly one apart, wherever the median leaves them",
              ],
              [0, 1, 3],
              "These statements describe the rows used to fit each scaler. Min-max applies the stored minimum and range to later values; it does not clip them. A height of 250 cm therefore becomes 2.03 after fitting on 118 to 183 cm. Standardization gives population variance one. Computing sample variance on those same scores instead gives:\n\n```math\nsample variance = n / (n − 1)\n```",
            ),
            trueFalse(
              "With the 39 typed as 99, the robust row of the playground still prints a center of 24 and a spread of 10, and sends the 99 to 7.5.",
              true,
              "In this five-value example, changing the largest reading from 39 to 99 leaves the median and interpolated quartiles unchanged. The robust scaler keeps center 24 and spread 10, so the changed reading becomes 7.5. The mean and the scales based on extremes do change. Standard deviation and interquartile range happened to agree on the original readings; symmetry alone does not guarantee that agreement.",
            ),
            trueFalse(
              "Robust scaling is unaffected by a wild value, whichever value went wild.",
              false,
              "An outlier can change the median or quartiles if it changes which observations determine them. Replacing 183 with 1830 in this column leaves the relevant order positions unchanged. Replacing the middle value 147 with 1470 changes those positions: the median becomes 159 and the interquartile range 45.5. Robust scaling reduces sensitivity to extreme values; it does not remove it.",
            ),
        ],
        },
        {
          title: "Part 4. Fit Once, Apply Everywhere",
          content: (
            <>
              <SubSection title="14. Learned on the training rows">
                <p>A fitted scaler learns its references from the training observations. Later observations use those saved values rather than relearning them from the incoming batch. Otherwise, the same measurement could receive a different transformed value depending on the other records beside it.</p>
                <HoldOutStandardizer />
                <InAModel title="The three tallest held out">
                  <p>
                    With the three tallest adults held out the training rows
                    have a mean height of 141.1 and a deviation of 17.2. The
                    held-out heights of 180, 183 and 178 standardize with those
                    numbers to 2.26, 2.43 and 2.14, a mean of 2.28, which is the
                    right answer. They are more than two spreads above the
                    people the fit saw, and the scaled numbers say so.
                  </p>
                </InAModel>
                <KeepInMind>
                  Standardized held-out rows need not have mean zero and spread
                  one, and usually will not. The promise in step 7 was about
                  the rows the scaler learned from; the held-out rows are
                  measured against those rows, which is what they are for.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Why recomputing on held-out rows is wrong">
                <p>
                  The tempting alternative is to standardize the held-out rows
                  with their own mean and deviation, and the widget&rsquo;s
                  second number line does exactly that. The three tallest
                  people, standardized against each other, come out at −0.16,
                  1.30 and −1.14, which announces that one of them is shorter
                  than average, and the only average they were measured
                  against was their own. The scaler has been refitted on rows
                  the model never saw, which is the leak, and the numbers it
                  produces are on a different scale from the one anything
                  downstream learned.
                </p>
                <InAModel title="A line reading both scales">
                  <>
                    <p>
                      The line fitted on the eight training rows expects height
                      standardized using the training mean and standard deviation.
                    </p>
                    <Equation>{"predicted weight ≈ 43.3 + 14.0 × standardized height"}</Equation>
                    <p>
                      Using those training statistics, its predictions for the three
                      held-out people are 74.8, 77.2 and 73.1 kilograms, against actual
                      weights of 80, 83 and 78. Standardizing those same people with
                      their own statistics instead produces 41.0, 61.4 and 27.4
                      kilograms. The last prediction is for an adult who actually weighs
                      78 kilograms.
                    </p>
                    <p>
                      The mismatch is smaller when the held-out group happens to have a
                      similar mean and spread to the training group. That coincidence
                      cannot make the procedure correct. New inputs must use the
                      coordinate system in which the model was fitted.
                    </p>
                  </>
                </InAModel>
                <KeepInMind>
                  Fit and transform are separate steps on purpose. The fit
                  learns from the training rows and the transform applies what
                  was learned, and a{" "}
                  <Link href="/concepts/pipelines" className={link}>
                    pipeline
                  </Link>{" "}
                  exists so that inside cross-validation the scaler is refitted
                  on each fold&rsquo;s training rows and never on its held-out
                  ones.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Matching by name, a subset or the exact set">
                <>
<p>The scalers in oop_ml store one reference and scale per named column. They match incoming columns by name, so the order can change. They also accept a known subset: a scaler fitted on height and weight can transform height alone. This is a library contract; other implementations may require the full fitted column set.</p>
                <p>An unknown column such as age is refused because the scaler has no fitted reference or scale for it.</p>
</>
                <NumberTable
                  headings={["handed to a scaler fitted on height and weight", "answer"]}
                  rows={[
                    ["height only", "accepted, one scaled column back"],
                    ["weight, height, in that order", "accepted, matched by name"],
                    ["height and age", "refused by name, never learned a scaling for age"],
                    ["age, to the inverse transform", "refused by name, the same way"],
                  ]}
                  caption="A subset is fine; an unknown name is not. A model's predict is stricter and demands the exact set, since a missing column makes its plane unevaluable."
                />
                <KeepInMind>
                  Each known column can be scaled independently. A model that uses several inputs generally needs all of those inputs to evaluate its prediction, which explains why its input contract can be stricter.</KeepInMind>
              </SubSection>

              <SubSection title="17. Back to the original units">
                <p>
                  Because the map is a subtraction and a division, undoing it
                  is a multiplication and an addition, and every scaler here
                  has an inverse that reads an answer back in the units the
                  data came in.
                </p>
                <Equation>{"value = scaled × spread + center"}</Equation>
                <ModelsByUnit panel="inverse" />
                <p>

                  On the crowd&rsquo;s heights the round trip is exact to the
                  last bit for standardizing, min-max and robust, and off by
                  14 and 28 quadrillionths of a centimeter for max-abs and root
                  mean square, which is one or two units in the last place of
                  a number near 150 and is what dividing and then multiplying
                  by the same number costs. The same arithmetic translates a
                  coefficient. A line fitted on standardized height has a
                  slope in kilograms per standard deviation, and dividing by
                  the deviation gives kilograms per centimeter.
                </p>
                <Equation>{"slope in cm = slope in z / spread\nintercept in cm = intercept in z − slope in cm × center"}</Equation>
                <WorkedExample title="The standardized line on the crowd, translated back">
                  <>
                    <p>

                      On standardized height, least squares gives a slope of about 20.33
                      kilograms per standard deviation and an intercept of about 53.36
                      kilograms. To express the same line in centimeters, divide the
                      slope by the training standard deviation and adjust the intercept.
                    </p>
                    <Equation>{"slope in cm = standardized slope / height standard deviation\n            ≈ 20.33 / 22.84 ≈ 0.8901 kg/cm\nintercept in cm = mean weight − slope in cm × mean height\n                ≈ 53.36 − 0.8901 × 151.82 ≈ −81.77 kg"}</Equation>
                    <p>
                      The displayed inputs are rounded; the fit uses the full values.
                      Fitting the raw heights directly gives the same line. Only the
                      coordinates used to describe it have changed.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  Save the fitted scaler with a model that expects scaled inputs. Without those references, new raw observations cannot reliably be put into the coordinates the model learned. If the target itself was scaled, its references are also needed to convert predictions back to the target units.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Which Models Care",
          content: (
            <>
              <SubSection title="18. Anything that measures a distance">
                <p>Scaling changes the distances used by a <Link href="/concepts/k-nearest-neighbours" className={link}>nearest-neighbor</Link>{" "}vote and the squared distances minimized by <Link href="/concepts/k-means" className={link}>k-means</Link>. It also changes the variance that <Link href="/concepts/pca" className={link}>principal component analysis</Link>{" "}tries to retain. A principal direction can combine several columns; changing their scales changes their contributions to that calculation.</p>
                <KeepInMind>

                  For a distance-based model, scaling is a decision about what
                  the distance means, and the decision is made whether or not
                  anyone makes it. Leaving the columns as recorded is the
                  decision that a centimeter and a kilogram are the same size.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Anything that walks">
                <p>Step 3 showed how the numerical scale changes gradient descent on the same line-fitting problem. Network training can also be sensitive to the scales of inputs and intermediate values. <Link href="/concepts/normalisation-layers" className={link}>Normalization layers</Link>{" "}adjust intermediate values during the network calculation. Their references and training behavior differ from a preprocessing scaler fitted once on the input data.</p>
                <KeepInMind>
                  For this unregularized linear fit, changing the input units preserves the least-squares prediction when the solver reaches the corresponding minimum. The number of steps can change substantially. With a fixed iteration budget, even this solver may stop before reaching that result.</KeepInMind>
              </SubSection>

              <SubSection title="20. Anything that penalizes a coefficient" id="20-anything-that-penalises-a-coefficient">
                <p><Link href="/concepts/ridge-lasso" className={link}>Ridge</Link>{" "}adds a penalty on squared feature coefficients, usually leaving the intercept unpenalized. Coefficient size depends on the input unit: the same height effect needs a coefficient one hundred times larger in meters than in centimeters. Its squared penalty is then ten thousand times larger unless we adjust the scaling or penalty.</p>
                <ModelsByUnit panel="ridge" />
                <InAModel title="Weight against height at a penalty of one">
                  <p>In centimeters the ridge coefficient is 0.890 kg per centimeter, close to the least-squares coefficient of 0.890, and R² is 0.9588. In meters, the unpenalized reference is 89.0, while ridge gives 32.5 with the same penalty setting. Its R² is 0.5718 on the same eleven people. In millimeters the ridge coefficient is 0.0890 and the penalty has little effect. On standardized height it is 18.6 kg per standard deviation, compared with 20.3 for least squares, and R² is 0.9521.</p>
                </InAModel>
                <KeepInMind>

                  Standardization lets a shared penalty compare coefficients per standard deviation of their inputs. It does not guarantee a higher score or a smaller penalty effect. Raw-unit penalties can also be appropriate when those units express the intended prior constraint.</KeepInMind>
              </SubSection>

              <SubSection title="21. Trees do not notice">
                <p>A <Link href="/concepts/decision-trees" className={link}>decision tree</Link>{" "}can ask the same question in different units. A threshold of 151.5 centimeters corresponds to 1515 millimeters, sending the same observations to each side. Under positive affine scaling, an exact split search can represent the same splits with transformed thresholds.</p>
                <ModelsByUnit panel="tree" />
                <InAModel title="The same tree four times">
                  <p>
                    On the crowd the tree is one question deep with two leaves
                    under every unit, its root asks whether height is below
                    151.5, or 1515, or 1.515, or −0.014 standard deviations,
                    and its eleven predictions are identical down the table.
                    The tree, its leaves and its accuracy are the same before
                    and after, which is why the tree pages and the ensembles
                    built on them never scaled anything.
                  </p>
                </InAModel>
                <KeepInMind>
                  A strictly increasing transformation preserves the possible partitions of the training observations in an exact axis-aligned split search. Nonlinear transformations can still change midpoint thresholds between those observations. Finite precision and approximate split searches can introduce other differences.</KeepInMind>
              </SubSection>

              <SubSection title="22. Least squares does not notice either">
                <p>For an identified, unregularized least-squares fit with an intercept, converting height from centimeters to meters multiplies the slope by one hundred. The intercept, predicted weights, residuals and R² remain the same. The coefficients change to describe the same prediction in the new unit; this corresponding change is called equivariance.</p>
                <ModelsByUnit panel="least_squares" />
                <InAModel title="The crowd's line in four units">
                  <p>

                    The slope is 0.8901 in centimeters, 89.01 in meters and
                    0.08901 in millimeters, the intercept is −81.77 in all
                    three, and the R² of 0.9588034 agrees across all four rows
                    to better than a billionth. Translated back, the
                    standardized row gives the same 0.8901 and −81.77.
                  </p>
                </InAModel>
                <KeepInMind>

                  Gradient descent minimizes the same objective but can take many updates to approach its minimum. Scaling can therefore change the convergence speed without changing this least-squares solution. Distance-based models and coefficient penalties use input magnitudes in their definitions, so scaling can change their fitted predictions as well.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "Three tall adults are held out, then standardized with their own mean and deviation rather than the training ones. What comes back?",
              [
                "−0.16, 1.30 and −1.14, which place two of the three below their own group mean",
                "Numbers near zero, which is the right answer for rows the fit never saw",
                "A refusal, because the scaler was fitted on other rows",
                "2.26, 2.43 and 2.14, the same answer the training numbers give",
              ],
              0,
              "The only average those three were measured against was their own, so the scaler has been refitted on rows the model never saw. With the training mean of 141.1 and deviation of 17.2 they come out at 2.26, 2.43 and 2.14, which says correctly that they sit more than two spreads above the people the fit did see.",
            ),
            trueFalse(
              "Standardized held-out rows ought to come out with mean zero and spread one, and it is a warning sign when they do not.",
              false,
              "The promise was about the rows the scaler learned from. Held-out rows are measured against those rows, which is exactly what they are for, so they need not have mean zero and spread one and usually will not.",
            ),
            choice(
              "A scaler fitted on height and weight is handed height on its own, and separately a column called age. What happens?",
              [
                "Height alone is transformed, and age is refused",
                "Both are refused, since a transform demands every fitted column",
                "Height alone is transformed, and age is given a center of zero and a spread of one",
                "Both are transformed, since the columns are matched by position",
              ],
              0,
              "Columns are matched by name and never by position, so features may arrive in any order, and a one-column request came back with one column. A column the fit never saw has no center and no spread, so inventing one would answer a question nobody asked. A model’s predict is stricter because it evaluates one expression that needs all of them.",
            ),
            several(
              "Which of these does changing the unit of height leave untouched?",
              [
                "The line plain least squares reaches, and its R² of 0.9588034",
                "A decision tree’s leaves, its eleven predictions and its accuracy",
                "The score a ridge fit reaches on the same eleven people",
                "The number of passes a gradient walk needs to reach the line",
              ],
              [0, 1],
              "Least squares is equivariant, so the slope reads 0.8901 in centimeters and 89.01 in meters while the intercept of −81.77 and the R² agree across all four rows. A tree only compares values within a column, so any order-preserving rescaling moves the threshold along with the values. Ridge reads the size of a coefficient, and in meters its score collapses to 0.5718, while the walk takes two passes standardized and 8415 in centimeters.",
            ),
            choice(
              "Why are ridge and lasso fitted on standardized features?",
              [
                "Because standardizing makes the penalty gentler",
                "Because one penalty then means the same thing for every column, so a single knob can be turned for all of them",
                "Because the penalty is otherwise undefined for a column recorded in meters",
                "Because standardizing raises the score",
              ],
              1,
              "A penalty applies to coefficient sizes, which depend on the units of their input columns. Standardizing lets the same coefficient penalty refer to a one-standard-deviation change in each input. It can improve or reduce a particular validation score; it is a scaling choice that should be kept consistent while selecting the penalty.",
            ),
        ],
        },
        {
          title: "Part 6. Reusing the Fitted Reference on Later Data" , id: "part-6-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="23. What a scaler must specify">
                <p>A transformed value depends on how its reference was fitted. For a standard deviation, record the population or sample divisor. For a quartile, record the interpolation rule. Fit those references on the training rows, then reuse them for later data.</p>
                <p>This implementation matches columns by name. Check whether a requested subset is accepted, and remember that a zero spread is refused rather than silently replaced by one. A value outside the fitted range still follows the same map, even when its scaled value lies beyond that range.</p>
                <p>The inverse should recover the original units. Its round-trip error tells us what numerical precision was lost in applying and reversing the transformation.</p>
                <KeepInMind>
                  The population or sample divisor changes the standard deviation used for scaling. A quartile convention changes the robust reference. Both choices can produce valid numerical outputs, so the implementation must document them rather than relying on an error message.</KeepInMind>
              </SubSection>

              <SubSection title="24. Constant columns, new extremes and invalid readings" id="24-the-edges-each-one-asked">
                <p>The table lists the SDK behavior for these input conditions. The widget below requests the corresponding cases so we can compare the reported results with the contract.</p>
                <DerivationTable
                  expressionHeading="Feature column condition"
                  reasonHeading="What the scaler can compute"
                  rows={[
                    { expression: "no features at all", reason: "refused before anything is read, since there is nothing to learn a center from." },
                    { expression: "an empty column", reason: "refused, since a column is required to hold at least one value." },
                    { expression: "one row", reason: "refused by standardize, min-max and robust, whose spread is zero on one value; accepted by max-abs and root mean square, which read a spread of 170 from a lone 170 and send it to 1." },
                    { expression: "a constant column", reason: "the same split. Three refuse a spread of zero by name; max-abs and root mean square accept a constant 170 and answer a constant 1, and refuse only a column of zeros." },
                    { expression: "a missing or infinite value", reason: "refused where the column is built, before any scaler sees it." },
                    { expression: "six identical observations in a column of eight, for robust", reason: "accepted, with an interquartile range of 0.75, since the third quartile lands just past the run." },
                    { expression: "seven identical observations in a column of eight, for robust", reason: "refused for zero interquartile range, though the column is not constant; both quartiles fall inside the repeated run. In the twelve-observation example, nine repeated values are accepted and ten are refused. The result depends on the run position and interpolation rule." },
                    { expression: "nine values a machine epsilon apart", reason: "accepted, and scaled to between −1.55 and 1.55 by standardizing and to 0 to 1 by min-max; a spread of 2.6 × 10⁻¹⁶ is a spread." },
                    { expression: "a subset of the fitted features", reason: "accepted; one column in, one column out, matched by name." },
                    { expression: "a feature the fit never saw", reason: "refused on the way in and on the way back alike, and the message names what was learned and what was handed over." },
                    { expression: "transform before fit", reason: "refused, and the message says the scaler has not been fitted rather than reporting some missing attribute." },
                    { expression: "two features with one name, or of different lengths", reason: "refused when the columns are gathered, before any scaling is read." },
                    { expression: "a value beyond the fitted range", reason: "accepted; 250 cm through a min-max scaler fitted on 118 to 183 answers 2.03." },
                  ]}
                />
                <ScalingContracts />
              </SubSection>

              <SubSection title="25. Documented rather than defended">
                <p>The table exposes four separate numerical decisions. We should understand what each one allows before treating every accepted column as suitable for modeling.</p>
<ol className="list-decimal space-y-3 pl-6">
<li>A very small positive spread is accepted. Scaling can therefore magnify tiny differences, including differences caused by rounding or measurement noise.</li>
<li>A constant nonzero column can pass through max-absolute or RMS scaling because the divisor is nonzero. It remains constant afterward and still provides no variation.</li>
<li>Robust scaling is refused when the interquartile range is zero. A column can contain some differing observations while its middle half still has no measurable spread.</li>
<li>A new value outside the fitted range is transformed without clipping. It can therefore appear outside the training output range, preserving evidence that it differs from the fitted examples.</li>
</ol>
                <KeepInMind>
                  A finite output is not sufficient evidence that a scaling choice suits the problem. Other libraries may deliberately replace a zero divisor, clip later values or use another quartile convention. Check the documented behavior and decide whether it preserves the information your calculation needs.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Part 6",
          quiz: [
            several(
              "Which of these edges does the library accept rather than refuse?",
              [
                "A constant column of 170, handed to max-abs or root mean square",
                "Six equal readings among the eight values [5, 5, 5, 5, 5, 5, 8, 9], handed to RobustScaler",
                "The nine readings 0, 1e-16, 2e-16, ..., 8e-16, handed to Standardizer",
                "A height of 250 cm, handed to a min-max scaler fitted on 118 to 183",
              ],
              [0, 1, 2, 3],
              "Each case is accepted by this implementation. Max-abs and root-mean-square scaling divide the constant 170 column by 170 and return ones. Robust scaling finds interquartile range 0.75 in the supplied eight-value column because its interpolated upper quartile extends beyond the six equal readings. The tiny but positive spread of the nine readings can be represented here, so they produce finite scores. Min-max returns 2.03 for 250 cm because it does not clip later values to the training interval.",
            ),
            trueFalse(
              "RobustScaler refuses the supplied eight-value column containing seven copies of 5 and one 8, even though the column is not constant.",
              true,
              "Both interpolated quartiles lie within the seven equal readings, making the interquartile range zero. Robust scaling divides by that range, so this implementation rejects the column. Its denominator can be zero even when a value elsewhere in the column differs. The exact repetition count needed depends on sample size and the quartile convention.",
            ),
            choice(
              "A column arrives whose spread, as the scaler reads it, is zero. What does the library do?",
              [
                "Refuses it by name, rather than substituting a spread of one",
                "Substitutes a spread of one, so the column passes through as zeros",
                "Drops the column silently, so one fewer comes out than went in",
                "Accepts it, since dividing by zero gives an infinite value rather than an error",
              ],
              0,
              "This library raises an error when the denominator used by that scaler is zero. The denominator is not always a standard deviation: a constant 170 column has zero standard deviation and range, but max-abs and root-mean-square scaling both use 170 and accept it. A column of zeros gives zero for all those denominators. Other libraries may deliberately handle constant columns differently, so check the implementation's contract.",
            ),
          ],
        },
        {
          title: "Practice. Scaling the Crowd With the Library",
          practice: [
            exercise("Take the vote four times",["Classify a person of 150 cm and 60 kg using their three nearest neighbors. Use KNearestNeighboursClassifier with child labeled 0 and adult labeled 1. Repeat with height recorded in millimeters, centimeters and meters, then with both columns standardized. Convert the query height along with the training heights each time.", "For the standardized comparison, fit Standardizer on the eleven training people and use that same fitted transform for the query. Print each predicted class and the two learned standard deviations. Compare which unit choices change the prediction."],`from oop_ml import Feature, KNearestNeighboursClassifier, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
labels = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

for unit, factor in (("millimetres", 10), ("centimetres", 1), ("metres", 0.01)):
    # Fit a three-neighbour classifier on the heights multiplied by the factor
    # and the weights as they are, predict the query of 150 cm and 60 kg in
    # the same unit, and print the unit and whether the answer is child or adult.
    pass

# Fit a Standardizer on both columns, transform the crowd and the query through
# it, take the same vote, and print the answer and the two spreads it learned.`,`from oop_ml import Feature, KNearestNeighboursClassifier, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
labels = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

for unit, factor in (("millimetres", 10), ("centimetres", 1), ("metres", 0.01)):
    crowd = [Feature("height", [h * factor for h in heights]), Feature("weight", weights)]
    model = KNearestNeighboursClassifier(n_neighbours=3).fit(crowd, Feature("label", labels))
    query = [Feature("height", [150 * factor]), Feature("weight", [60])]
    answer = int(model.predict(query)[0])
    print(f"{unit}: {'adult' if answer == 1 else 'child'}")

scaler = Standardizer().fit([Feature("height", heights), Feature("weight", weights)])
crowd = scaler.transform([Feature("height", heights), Feature("weight", weights)])
query = scaler.transform([Feature("height", [150]), Feature("weight", [60])])
model = KNearestNeighboursClassifier(n_neighbours=3).fit(crowd, Feature("label", labels))
answer = int(model.predict(query)[0])
print(f"standardized: {'adult' if answer == 1 else 'child'}")
height_spread = scaler.scalings["height"].standard_deviation
weight_spread = scaler.scalings["weight"].standard_deviation
print(f"height divided by {height_spread:.1f}, weight divided by {weight_spread:.1f}")`,`millimetres: child
centimetres: adult
metres: adult
standardized: adult
height divided by 22.8, weight divided by 20.8`,{...{ hints: ["The classifier takes a list of Features and a Feature of labels, and predict takes a list of Features of the same names, one value each for a single query.", "Only the height column is multiplied by the factor. The weights, and the query's 60 kg, stay as they are, which is what makes the unit the only thing that changes between the three votes.", "The query must go through the same fitted Standardizer as the crowd, by transform, never through a new one. A fresh fit on a single row has no spread and would be refused.", "predict answers one value per query row, so index the first and turn it into an int to compare it with the labels."], check: numberCheck("By what number does the standardized reading divide the height column?", 22.8, 0.05, "Standardization measures each feature relative to its training spread. Raw unit changes instead alter the relative numerical contributions to distance, even though the person and their class did not change.") },question:"Can a change of units change the predicted class?"}),
            exercise("Five rulers on five readings, then on an outlier",["Fit the five supplied scalers to [9, 19, 24, 29, 39]. Print each fitted center and scale value, followed by its transformed readings. Repeat with the last reading changed from 39 to 99.", "Compare which fitted statistics change after the replacement. Pay particular attention to the mean, standard deviation, median and interquartile range."],`from oop_ml import Feature, MaxAbsScaler, MinMaxScaler, RobustScaler, RootMeanSquareScaler, Standardizer

readings = [9, 19, 24, 29, 39]
with_outlier = [9, 19, 24, 29, 99]
affine = {"min-max": MinMaxScaler, "max-abs": MaxAbsScaler, "robust": RobustScaler, "root mean square": RootMeanSquareScaler}

for values in (readings, with_outlier):
    column = Feature("value", values)
    print(values)
    # Fit a Standardizer on the column and print its mean, standard deviation
    # and the scaled values rounded to two places. Then fit each affine scaler
    # and print its centre, spread and scaled values the same way.`,`from oop_ml import Feature, MaxAbsScaler, MinMaxScaler, RobustScaler, RootMeanSquareScaler, Standardizer

readings = [9, 19, 24, 29, 39]
with_outlier = [9, 19, 24, 29, 99]
affine = {"min-max": MinMaxScaler, "max-abs": MaxAbsScaler, "robust": RobustScaler, "root mean square": RootMeanSquareScaler}

for values in (readings, with_outlier):
    column = Feature("value", values)
    print(values)
    fitted = Standardizer().fit([column])
    learned = fitted.scalings["value"]
    scaled = [round(float(v), 2) for v in fitted.transform([column])[0].values]
    print(f"  standardize: centre {learned.mean:.2f}, spread {learned.standard_deviation:.2f}, scaled {scaled}")
    for name, kind in affine.items():
        fitted = kind().fit([column])
        learned = fitted.scalings["value"]
        scaled = [round(float(v), 2) for v in fitted.transform([column])[0].values]
        print(f"  {name}: centre {learned.centre:.2f}, spread {learned.spread:.2f}, scaled {scaled}")`,`[9, 19, 24, 29, 39]
  standardize: centre 24.00, spread 10.00, scaled [-1.5, -0.5, 0.0, 0.5, 1.5]
  min-max: centre 9.00, spread 30.00, scaled [0.0, 0.33, 0.5, 0.67, 1.0]
  max-abs: centre 0.00, spread 39.00, scaled [0.23, 0.49, 0.62, 0.74, 1.0]
  robust: centre 24.00, spread 10.00, scaled [-1.5, -0.5, 0.0, 0.5, 1.5]
  root mean square: centre 0.00, spread 26.00, scaled [0.35, 0.73, 0.92, 1.12, 1.5]
[9, 19, 24, 29, 99]
  standardize: centre 36.00, spread 32.19, scaled [-0.84, -0.53, -0.37, -0.22, 1.96]
  min-max: centre 9.00, spread 90.00, scaled [0.0, 0.11, 0.17, 0.22, 1.0]
  max-abs: centre 0.00, spread 99.00, scaled [0.09, 0.19, 0.24, 0.29, 1.0]
  robust: centre 24.00, spread 10.00, scaled [-1.5, -0.5, 0.0, 0.5, 7.5]
  root mean square: centre 0.00, spread 48.29, scaled [0.19, 0.39, 0.5, 0.6, 2.05]`,{...{ hints: ["Every scaler is fitted the same way, on a list holding the one Feature, and transform answers a list holding the scaled Feature.", "The Standardizer names its two numbers mean and standard_deviation. The four affine scalers name them center and spread, which is why the solution reads them in two places.", "The scaled Feature's values are an array; rounding each to two places after converting it to a float is what makes the lists readable."], check: numberCheck("What standard deviation does the standardizer read off the column once the 39 has become 99?", 32.19, 0.005, "The outlier changes the mean and standard deviation. In this particular five-value column it leaves the median and interquartile range unchanged because its sorted position stays the same; robust statistics are not unaffected by every possible outlier pattern.") },question:"Which scaling references change when one reading becomes an outlier?"}),
            exercise("Hold out the three tallest adults",["Hold out rows 8, 9 and 10, the three tallest adults. Fit Standardizer on the eight remaining heights, then fit SimpleLinearRegression to their standardized heights and weights. Transform the held-out heights with the training scaler and predict their weights.", "For comparison, fit a second scaler on only the held-out heights and use its scores with the same fitted regression. Print the training mean and standard deviation, the fitted intercept and slope, and each procedure's standardized heights and predicted weights. Also print the actual held-out weights."],`from oop_ml import Feature, SimpleLinearRegression, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]

held = [8, 9, 10]
kept = [row for row in range(11) if row not in held]
training = Feature("height", [heights[row] for row in kept])
held_out = Feature("height", [heights[row] for row in held])

# Fit a Standardizer on the training heights and print its mean and deviation.
# Fit a SimpleLinearRegression on the standardized training heights and the
# training weights, and print its intercept and slope. Then, once with that
# Standardizer and once with a new one fitted on the held-out heights,
# transform the held-out column, predict from the scores, and print both.`,`from oop_ml import Feature, SimpleLinearRegression, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]

held = [8, 9, 10]
kept = [row for row in range(11) if row not in held]
training = Feature("height", [heights[row] for row in kept])
held_out = Feature("height", [heights[row] for row in held])

by_training = Standardizer().fit([training])
learned = by_training.scalings["height"]
print(f"training mean {learned.mean:.1f}, deviation {learned.standard_deviation:.1f}")
training_scores = [float(v) for v in by_training.transform([training])[0].values]
line = SimpleLinearRegression().fit(training_scores, [weights[row] for row in kept])
print(f"line: weight = {line.intercept:.2f} + {line.slope:.2f} times the standardized height")

by_their_own = Standardizer().fit([held_out])
for label, scaler in (("training numbers", by_training), ("their own numbers", by_their_own)):
    scores = [float(v) for v in scaler.transform([held_out])[0].values]
    predicted = [round(float(v), 1) for v in line.predict(scores)]
    print(f"{label}: scores {[round(s, 2) for s in scores]}, predicted {predicted}")
print(f"actual weights {[weights[row] for row in held]}")`,`training mean 141.1, deviation 17.2
line: weight = 43.25 + 13.96 times the standardized height
training numbers: scores [2.26, 2.43, 2.14], predicted [74.8, 77.2, 73.1]
their own numbers: scores [-0.16, 1.3, -1.14], predicted [41.0, 61.4, 27.4]
actual weights [80, 83, 78]`,{...{ hints: ["SimpleLinearRegression takes two plain lists, the standardized heights and the weights, so the scores come out of the transformed Feature's values as floats first.", "The line is fitted once. The only thing that changes between the two readings is which Standardizer transforms the held-out column.", "predict takes a list of standardized heights and answers one weight per height, which can be rounded in a comprehension."], check: numberCheck("What weight does the line predict for the 178 cm adult when the three are standardized with their own numbers?", 27.4, 0.05, "The fitted line expects heights measured using the training mean and standard deviation. Re-centering and rescaling the held-out adults using their own statistics changes what each input number represents. The learned coefficients then operate on inconsistent coordinates.") },question:"What goes wrong if we standardize the held-out people using their own statistics?"}),
            exercise("Ask the scalers about the edges",["Test RobustScaler on the two eight-value columns below, which contain six and seven copies of 5 respectively. Then test MaxAbsScaler on the constant column of 170s, and use MinMaxScaler fitted on the eleven heights to transform a new height of 250 cm.", "Print the robust scaler's interquartile range when fitting succeeds. Catch MLLibError when fitting fails and print its message. Print the transformed constant column and the transformed 250 cm height to two decimal places."],`from oop_ml import Feature, MaxAbsScaler, MinMaxScaler, MLLibError, RobustScaler

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]

for label, values in (("six of eight", [5] * 6 + [8, 9]), ("seven of eight", [5] * 7 + [8])):
    # Fit a RobustScaler on the values. Print the spread it learned when it
    # accepts the column, and the refusal's message when it does not.
    pass

# Fit a MaxAbsScaler on a column of three 170s and print what it answers for
# the same column. Then fit a MinMaxScaler on the crowd's heights and print
# what it answers for a height of 250.`,`from oop_ml import Feature, MaxAbsScaler, MinMaxScaler, MLLibError, RobustScaler

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]

for label, values in (("six of eight", [5] * 6 + [8, 9]), ("seven of eight", [5] * 7 + [8])):
    try:
        spread = RobustScaler().fit([Feature("value", values)]).scalings["value"].spread
        print(f"robust, {label}: accepted, interquartile range {spread:.2f}")
    except MLLibError as refusal:
        print(f"robust, {label}: refused, {refusal}")

constant = Feature("value", [170, 170, 170])
answered = MaxAbsScaler().fit([constant]).transform([constant])[0]
print(f"max-abs, a constant 170: accepted, answers {[round(float(v), 2) for v in answered.values]}")

fitted = MinMaxScaler().fit([Feature("height", heights)])
beyond = float(fitted.transform([Feature("height", [250])])[0].values[0])
print(f"min-max, 250 after fitting on 118 to 183: accepted, answers {beyond:.2f}")`,`robust, six of eight: accepted, interquartile range 0.75
robust, seven of eight: refused, 'value' has a spread of 0.0, so it cannot be rescaled; a column carrying no variation has nothing to divide by
max-abs, a constant 170: accepted, answers [1.0, 1.0, 1.0]
min-max, 250 after fitting on 118 to 183: accepted, answers 2.03`,{...{ hints: ["The refusal happens inside fit, where the spread is read, so the try has to wrap the fit and not only the reading of scalings.", "An affine scaler's learned numbers are on scalings, addressed by the column's name, with properties center and spread.", "Nothing clips. A min-max scaler applies the same subtraction and division to 250 that it applied to the fitted column, which is why the answer is above one."], check: numberCheck("What does the min-max scaler fitted on the crowd's heights answer for 250 cm?", 2.03, 0.005, "The scaler applies its retained training minimum and range to every later input. A value outside that fitted range can produce a result outside the unit interval; this transformation does not clip it.") },question:"How do these scalers handle constant columns and a value beyond the fitted range?"}),
          ],
        },
      ]}
    />
  );
}
