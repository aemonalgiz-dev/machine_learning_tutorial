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
  title: "Feature Scaling · oop_ml",
  description:
    "Put feature values on suitable scales and see which models notice the change.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FeatureScalingPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["feature-scaling"]}
      technicalStart="Part 2. One Map, Two Numbers"
      openingTitle="The Same Person, a Different Unit, a Different Answer"
      playgroundIntro="Compare the raw and transformed values. Pay attention to how one large observation changes the scale and how the model's answer responds."
      title="Feature Scaling"
      tagline="Put feature values on suitable scales and see which models notice the change."
      prerequisites={
        <>
          The mean and the standard deviation come from the{" "}
          <Link href="/primers/statistics" className={link}>
            statistics primer
          </Link>
          , and the median and quartiles are their rank-based cousins, met here
          for the first time. The page measures its claims on the{" "}
          <Link href="/concepts/k-nearest-neighbours" className={link}>
            nearest-neighbour
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
                <p>
                  The crowd is eleven people, five children and six adults,
                  with heights between 118 and 183 centimetres and weights
                  between 24 and 83 kilograms. A model that asks how far apart
                  two people are adds up the gap in each column, squared, and
                  the height gap is counted in centimetres while the weight gap
                  is counted in kilograms, as if a centimetre and a kilogram
                  were the same size. Nothing in the arithmetic knows they are
                  not.
                </p>
                <Equation>{"distance² = (height gap)² + (weight gap)²"}</Equation>
                <WorkedExample title="The nearest person to a 150 cm, 45 kg query">
                  <>
                    <p>
                      The nearest person is three centimetres away in height and four
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

              <SubSection title="2. The neighbours change with the unit">
                <p>
                  Now let the unit decide a real question. A person of 150 cm
                  and 60 kg is put to the crowd and their three nearest
                  neighbours vote on whether they are a child or an adult. The
                  widget takes that vote four times, with the heights written
                  in millimetres, in centimetres and in metres, and then with
                  both columns standardized so that each is measured in its own
                  spreads. Drag the green query about to find the people the
                  four readings disagree on.
                </p>
                <UnitDistortion />
                <InAModel title="The vote at 150 cm and 60 kg">
                  <>
<p>
                    In millimetres the three nearest are the people at 147, 145 and 156 cm, whose weights are 41, 57 and 53 kg, and the vote is two children to one adult, so the answer is child. Height&rsquo;s share of the squared distance to each of them is between 0.71 and 1.00, so weight had almost no say.
                  </p>
                  <p>
                    In centimetres the nearest are the 145, 156 and 159 cm people and the vote goes two adults to one, so the answer is adult. In metres the height column is worth nothing, the share falls below 0.015, and the three nearest are the people weighing 61, 57 and 57 kg, an adult again. Standardized, height is divided by 22.8 and weight by 20.8, the two columns have comparable numerical scales, and the answer is adult by the same two-to-one vote over a fourth set of neighbours.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  Three of the four readings agree that this person is an adult
                  and one says child, and nothing about the person changed
                  between them. A nearest-neighbour model cannot tell an
                  informative column from a column recorded in small units.
                  Standardizing puts the columns on comparable numerical scales.
                  It does not establish their predictive importance. That needs
                  to be evaluated on the task and data.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The walk slows with the unit">
                <>
<p>
                  A model fitted by walking downhill feels the unit differently. Predicting weight from height by gradient descent means stepping down a bowl with one direction for the line&rsquo;s level and one for its slope, and how steeply the bowl curves along the slope direction is set by the mean of the squared centred heights, a number that is 521.8 in centimetres, ten thousand times smaller in metres, and one hundred times larger in millimetres.
                </p>
                <p>
                  The level direction always curves at one. One step size has to serve both directions, so it is set by the steeper one and crawls along the shallower.
                </p>
</>
                <Equation>{"curvature along the slope = mean of (height − mean height)²\ncondition number = steeper curvature / shallower curvature"}</Equation>
                <ModelsByUnit panel="descent" />
                <InAModel title="Passes to converge, each at half its own divergence threshold">
                  <>
<p>
                    Standardized, both directions curve at exactly one, the condition number is one, and the walk reaches the line in two passes. In metres the slope direction curves at 0.052, the condition number is 19.2, and it takes 374 passes. In centimetres the condition number is 521.8 and it takes 8415. In millimetres it is 52,178, the safe step is 0.0000096, and after twenty thousand passes the walk had the slope right and had moved the level only to 17.0 of the 53.4 it was heading for, so the fit stopped at its cap and reported itself unfinished.
                  </p>
                  <p>
                    Every row walked at its own best safe rate, so what the table compares is the shape of the bowl under each unit.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  The unit sets the shape of the bowl. Metres happened to do
                  better than centimetres here only because a height spread of
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
              <SubSection title="4. Subtract a centre, divide by a spread">
                <p>
                  Every correction on this page is one line of arithmetic,
                  applied to each column on its own. Pick a number to call the
                  column&rsquo;s centre and a number to call its spread, take
                  the centre away from every value, and divide what is left by
                  the spread. What a method learns from a column is those two
                  numbers and nothing else, and what it does to a value is
                  this.
                </p>
                <Equation>{"scaled = (value − centre) / spread"}</Equation>
                <p>
                  The playground at the top of the page is that line drawn five
                  times. The top row holds one column of raw values, and each
                  row beneath it is the same column after one choice of centre
                  and spread, printed at the left. The amber dot is the same
                  value in every row, so the rows are five rulers laid against
                  one number, and the readouts at the right are that number
                  read on five rulers.
                </p>
                <KeepInMind>
                  A scaler is a map from one number line to another, fixed by
                  two learned numbers. Everything downstream, the fit, the
                  refusals, the inverse, is shared by the whole family, because
                  the family differs in nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Five readings of the same two numbers">
                <p>
                  What differs between the five methods is only where the
                  centre and the spread are read from, and the whole family
                  fits in a table.
                </p>
                <Equation>{"standardize        centre = mean              spread = standard deviation\nmin-max            centre = smallest value    spread = largest − smallest\nmax-abs            centre = 0                 spread = largest magnitude\nrobust             centre = median            spread = third quartile − first quartile\nroot mean square   centre = 0                 spread = √(mean of the squares)"}</Equation>
                <>
<p>
                  Each row is an answer to a different worry. Standardizing leaves a column with mean zero and spread one, so a coefficient fitted on it says how much the target moves per standard deviation of that column, which can be compared across columns. Min-max lands everything in the unit interval, which is what an image pipeline or a bounded activation wants.
                </p>
                <p>
                  Max-abs divides without centring, so a zero stays a zero, a sparse column stays sparse and the sign survives. Robust reads the median and the quartiles, which never look at the ends of the column. Root mean square divides by magnitude about zero and keeps the level, on the view that a column&rsquo;s level is information.
                </p>
</>
                <KeepInMind>
                  None of the five is more correct than the others. Each fixes
                  the one thing its worry was about and leaves the rest of the
                  column to fall where the data puts it.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The five readings by hand">
                <p>
                  Press the five readings button, five values of 9, 19, 24, 29
                  and 39, chosen so that every centre and spread comes out as a
                  whole number. The mean first.
                </p>
                <Equation>{"9 + 19 + 24 + 29 + 39 = 120,   120 / 5 = 24"}</Equation>
                <WorkedExample>
                  <p>
                    The deviations from 24 are −15, −5, 0, 5 and 15, whose
                    squares are 225, 25, 0, 25 and 225. Their mean is the
                    variance and its square root is the standard deviation, so
                    standardizing reads a centre of 24 and a spread of 10,
                    which is what the first row prints. Root mean square runs
                    the same sum on the values themselves rather than on their
                    deviations, and its spread comes out at 26.
                  </p>
                  <Equation>{"225 + 25 + 0 + 25 + 225 = 500,   500 / 5 = 100,   √100 = 10\n81 + 361 + 576 + 841 + 1521 = 3380,   3380 / 5 = 676,   √676 = 26"}</Equation>
                  <>
                    <p>
                      The other scalers use different definitions of centre and spread.
                      For these five sorted values, the middle is 24 and the two
                      quartiles are 19 and 29.
                    </p>
                    <Equation>{"min-max: centre = 9; spread = 39 − 9 = 30\nmax-abs: centre = 0; spread = 39\nrobust: centre = 24; spread = 29 − 19 = 10"}</Equation>
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
                <p>
                  What a method promises is whatever its map fixes, and
                  standardizing promises a mean of exactly zero and a variance
                  of exactly one. Three lines show why. Write m for the mean
                  and s for the population standard deviation, so that s² is
                  the mean of the squared deviations, and put every value
                  through the map.
                </p>
                <Equation>{"zᵢ = (xᵢ − m) / s\nmean(z) = (1/n) Σ (xᵢ − m) / s = (1/s) · (m − m) = 0\nvar(z)  = (1/n) Σ (xᵢ − m)² / s² = s² / s² = 1"}</Equation>
                <WhyThisWorks>
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
                  The variance comes out at exactly one only because the spread
                  is measured with the population divisor n. Divide by n − 1
                  instead and the standardized variance is (n − 1) / n, close
                  to one and not one, which is a convention to know when two
                  implementations disagree in the third decimal.
                </KeepInMind>
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
<p>
                  The same move reads the promise off every other row of the table. Min-max sends the smallest training value to 0 and the largest to 1 and fixes nothing in between. Max-abs sends the value of largest magnitude to 1 or −1 and leaves zero where it was. Robust sends the two quartiles to points exactly one apart, at whatever position the median leaves them, so the middle half of the column always spans one unit.
                </p>
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
                  headings={["method", "centre, five readings", "spread, five readings", "centre, with the 99", "spread, with the 99"]}
                  rows={[
                    ["standardize", "24", "10", "36", "32.2"],
                    ["min-max", "9", "30", "9", "90"],
                    ["max-abs", "0", "39", "0", "99"],
                    ["robust", "24", "10", "24", "10"],
                    ["root mean square", "0", "26", "0", "48.3"],
                  ]}
                  caption="The three rows that read the ends of the column move; the one that reads its middle does not."
                />
                <KeepInMind>
                  Min-max is the most outlier-sensitive of the five, because
                  one value sets the spread for every other. A reading a
                  thousand times too large compresses the whole remaining
                  column into the first thousandth of the interval, and nothing
                  about the result looks wrong.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The median and the quartiles never looked">
                <p>
                  The robust row still prints a centre of 24 and a spread of
                  10. The median and the quartiles are positions in the sorted
                  list, and replacing the largest value with a larger one
                  changes no position, so the 99 lands at 7.5, far off the end
                  of that ruler, while the other four are precisely where the
                  five readings left them.
                </p>
                <Equation>{"(99 − 24) / 10 = 7.5"}</Equation>
                <p>
                  One method is honest about the outlier by moving everything.
                  Another is honest about it by moving nothing except the
                  outlier. Which honesty you want depends on whether the wild
                  value is a measurement or a mistake, and a scaler cannot know
                  which, so the choice is yours and the page can only show what
                  each choice costs.
                </p>
                <KeepInMind>
                  Robust scaling is immune to how far out a wild value goes, and
                  it is not immune to which value went wild. The next two steps
                  show both halves of that on the crowd.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Where the quartiles land">
                <>
<p>
                  A quarter of the way along a sorted list is rarely a whole position, so a rule is needed for what the first quartile of eleven values means. The rule followed here, and by most others, reads the quartiles at a quarter, a half and three quarters of the last index, interpolating between two neighbours when the position is not whole.
                </p>
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
                      The robust scaler therefore uses 156 as the centre and 36.5 as the
                      spread.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  Another convention for the quartiles, and there are several
                  in use, gives a different robust spread on the same column.
                  Two robust scalers that disagree in the second decimal are
                  usually disagreeing about this rule and not about the data.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. A height typed in millimetres">
                <p>
                  The outlier the crowd is likely to meet is a mistake of
                  units, one person&rsquo;s height entered as 1830 because the
                  form said millimetres. The widget puts the crowd&rsquo;s
                  eleven heights through the five rulers as measured, then with
                  the tallest person typed as 1830, then with a middle person,
                  the 147, typed as 1470. The amber dot is the 156 cm person,
                  the median, whom each method ought to leave alone.
                </p>
                <OutlierRulers />
                <InAModel title="The tallest typed as 1830">
                  <>
<p>
                    As measured, the heights have a mean of 151.8 and a standard deviation of 22.8, a range of 65 from 118, a largest magnitude of 183, a median of 156 with an interquartile range of 36.5, and a root mean square of 153.5. With the 183 typed as 1830 the mean goes to 301.5 and the deviation to 483.8, the range to 1712, the largest magnitude to 1830 and the root mean square to 570.1, so the median person, who read 0.58 on the min-max ruler, now reads 0.02, squashed with everyone else into the first four percent of the interval.
                  </p>
                  <p>
                    The robust row still reads 156 and 36.5, the median person still reads 0.00, and the 1830 lands at 45.86 on that ruler, which is where a value 45 interquartile ranges above the median belongs.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  Now press the middle button. The 147 was the fifth value in
                  sorted order, and typing it as 1470 sends it to the end, so
                  every value above it moves down one rank and the median
                  becomes 159 and the interquartile range 45.5. Robust scaling
                  did not notice the size of the mistake and did notice its
                  rank. Only a wild value that was already at an end of the
                  column leaves the robust numbers untouched.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Root mean square keeps the level">
                <p>
                  The last row of the playground looks like standardizing with
                  a different spread, and on a column centred at zero that is
                  exactly what it is, since the root mean square of a
                  zero-mean column is its standard deviation. The crowd&rsquo;s
                  heights are nowhere near zero. Their root mean square is
                  153.5, almost the mean of 151.8, because when every value is
                  about 150 the magnitude about zero is about 150.
                </p>
                <Equation>{"root mean square = √(mean of height²) = 153.5\nstandard deviation = √(mean of (height − 151.8)²) = 22.8"}</Equation>
                <InAModel title="The crowd's heights on the two rulers">
                  <p>
                    Dividing by 153.5 puts every height between 0.77 and 1.19,
                    all bunched near one, with the shortest child and the
                    tallest adult 0.42 apart. Standardizing puts the same
                    people between −1.48 and 1.37, 2.85 apart. The first ruler
                    kept the fact that everyone is about a metre and a half
                    tall and had little room left for the differences between
                    them, where standardizing removed the shared level first
                    and used the whole ruler for the differences.
                  </p>
                </InAModel>
                <KeepInMind>
                  Root mean square scaling and max-abs scaling are the two that
                  do not centre, and they are the right choice exactly when the
                  level or the zero means something, a structural zero in a
                  sparse column, a sign that carries information. On a column
                  like height, where the level is the same for everyone, they
                  spend the ruler on what everyone shares.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "The nearest person is three centimetres away in height and four kilograms away in weight. Written in millimetres instead, what share of the squared distance does height carry?",
              ["0.36", "About 0.98", "About 0.00006", "The same share, since the people did not change"],
              1,
              "The gap becomes 30 rather than 3, and 30 squared is 900 of a total of 916. Recording a column in smaller units multiplies its say in every squared distance by the square of the factor, which is why the same gap in metres carries about 0.00006 instead.",
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
              "Three of the four readings of the 150 cm and 60 kg query answer adult and the millimetre reading answers child, over four different sets of neighbours, and nothing about the person changed between them, because a nearest-neighbour model cannot tell an informative column from a column recorded in small units. Scaling makes the weighting an explicit choice instead of leaving it to the measurement units, and that is all it does; whether height or weight carries the answer still has to be evaluated on the task and data.",
            ),
            several(
              "Which of these promises does the page say a fitted scaler keeps?",
              [
                "Standardizing leaves the column with a mean of exactly zero and a variance of exactly one",
                "Min-max sends the smallest training value to 0 and the largest to 1, and fixes nothing in between",
                "Min-max holds every later value inside the unit interval",
                "Robust sends the two quartiles to points exactly one apart, wherever the median leaves them",
              ],
              [0, 1, 3],
              "Every promise is about the training rows. A min-max scaler fitted on the crowd’s heights of 118 to 183 was handed a height of 250 and answered 2.03 without complaint, because the unit interval was a fact about the column it learned from and not a bound it enforces. The variance of exactly one also depends on the population divisor n, since a sample divisor leaves (n − 1) / n.",
            ),
            trueFalse(
              "With the 39 typed as 99, the robust row of the playground still prints a centre of 24 and a spread of 10, and sends the 99 to 7.5.",
              true,
              "The median and the quartiles are positions in the sorted list, and replacing the largest value with a larger one changes no position, so the other four values sit precisely where the five readings left them. The mean jumps from 24 to 36, the min-max spread from 30 to 90 and the max-abs spread from 39 to 99, which squashes the four ordinary values into the first third of those rulers, the 29 landing at 0.22 under min-max and 0.29 under max-abs. Standardize and robust agreed on the five readings only because that sample is symmetric, and this is the move that breaks the coincidence.",
            ),
            trueFalse(
              "Robust scaling is unaffected by a wild value, whichever value went wild.",
              false,
              "It is immune to how far out a wild value goes and not to which one it was. Typing the tallest person’s 183 as 1830 leaves the centre at 156 and the spread at 36.5 untouched, but typing the middle 147 as 1470 sends it to the end of the sorted list and moves the median to 159 and the interquartile range to 45.5.",
            ),
        ],
        },
        {
          title: "Part 4. Fit Once, Apply Everywhere",
          content: (
            <>
              <SubSection title="14. Learned on the training rows">
                <p>
                  A scaler is fitted like any model, and what it learns is its
                  centre and spread, read from the rows it was shown. Those two
                  numbers are then reused, unchanged, on every row that comes
                  later, whether that row is a held-out person, a new person
                  next year, or the same training row put through again. The
                  widget below lets you hold people out of the crowd and watch
                  what the remaining rows teach the scaler and where the
                  held-out rows then land.
                </p>
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
<p>
                  A scaler learns one centre and spread per named column, and a transform matches the columns it is handed by name and never by position, so features may arrive in any order. Two rules follow, and they differ from the rule a model&rsquo;s predict follows. A scaler fitted on height and weight will transform height alone, since scaling one column of a held-out set is a legitimate thing to want, and measured, a one-column request came back with one column.
                </p>
                <p>
                  It refuses a column called age that it never saw, because a column the fit never saw has no centre and no spread, and inventing one would answer a question nobody asked.
                </p>
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
                  Subset in, exact out is not a contradiction. A scaler
                  transforms columns one at a time and can do without any of
                  them; a model evaluates one expression that needs all of
                  them.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Back to the original units">
                <p>
                  Because the map is a subtraction and a division, undoing it
                  is a multiplication and an addition, and every scaler here
                  has an inverse that reads an answer back in the units the
                  data came in.
                </p>
                <Equation>{"value = scaled × spread + centre"}</Equation>
                <ModelsByUnit panel="inverse" />
                <p>
                  On the crowd&rsquo;s heights the round trip is exact to the
                  last bit for standardizing, min-max and robust, and off by
                  14 and 28 quadrillionths of a centimetre for max-abs and root
                  mean square, which is one or two units in the last place of
                  a number near 150 and is what dividing and then multiplying
                  by the same number costs. The same arithmetic translates a
                  coefficient. A line fitted on standardized height has a
                  slope in kilograms per standard deviation, and dividing by
                  the deviation gives kilograms per centimetre.
                </p>
                <Equation>{"slope in cm = slope in z / spread\nintercept in cm = intercept in z − slope in cm × centre"}</Equation>
                <WorkedExample title="The standardized line on the crowd, translated back">
                  <>
                    <p>
                      On standardized height, least squares gives a slope of about 20.33
                      kilograms per standard deviation and an intercept of about 53.36
                      kilograms. To express the same line in centimetres, divide the
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
                  The inverse needs the fitted numbers, so a scaler travels
                  with the model it fed. A saved model whose scaler was
                  discarded still predicts, in standardized units that nobody
                  can convert back.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Which Models Care",
          content: (
            <>
              <SubSection title="18. Anything that measures a distance">
                <p>
                  Part 1 measured it on a{" "}
                  <Link href="/concepts/k-nearest-neighbours" className={link}>
                    nearest-neighbour
                  </Link>{" "}
                  vote, and the same sum of squared column gaps is inside{" "}
                  <Link href="/concepts/k-means" className={link}>
                    k-means
                  </Link>
                  , whose centres are chosen by it, and inside{" "}
                  <Link href="/concepts/pca" className={link}>
                    principal component analysis
                  </Link>
                  , whose first direction follows whichever column has the
                  largest variance in whatever unit it was recorded in. Every
                  one of these reads a column&rsquo;s unit as its importance,
                  because the unit is a factor on every gap in that column and
                  the square of a factor on every squared gap.
                </p>
                <KeepInMind>
                  For a distance-based model, scaling is a decision about what
                  the distance means, and the decision is made whether or not
                  anyone makes it. Leaving the columns as recorded is the
                  decision that a centimetre and a kilogram are the same size.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Anything that walks">
                <p>
                  Step 3 measured it on gradient descent. Two passes
                  standardized, 374 in metres, 8415 in centimetres, and an
                  unfinished walk in millimetres, all to the same line, and the
                  difference was the shape of the bowl. A network trained by
                  the same descent has this problem at every layer, which is
                  why the{" "}
                  <Link href="/concepts/normalisation-layers" className={link}>
                    normalisation layers
                  </Link>{" "}
                  exist, standardizing inside the network what feature scaling
                  standardizes at its door.
                </p>
                <KeepInMind>
                  The line the walk reaches is the same in every unit; only the
                  number of steps to reach it changes. For a walking solver,
                  scaling is a fact about the solver and not about the answer.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Anything that penalises a coefficient">
                <p>
                  <Link href="/concepts/ridge-lasso" className={link}>
                    Ridge
                  </Link>{" "}
                  adds the squared size of every coefficient to what it
                  minimises, and the size of a coefficient depends on the unit
                  its column is in. A column recorded in metres needs a
                  coefficient one hundred times larger than the same column in
                  centimetres to do the same work, so its squared penalty is ten
                  thousand times as large, and the fit reports that
                  accident of bookkeeping as a fact about the data.
                </p>
                <ModelsByUnit panel="ridge" />
                <InAModel title="Weight against height at a penalty of one">
                  <p>
                    In centimetres the ridge coefficient is 0.890 kg per
                    centimetre, next to the least-squares 0.890, and the fit
                    scores 0.9588. In metres the coefficient should be 89.0
                    and the penalty holds it to 32.5, and the score collapses
                    to 0.5718 on the same eleven people. In millimetres the
                    coefficient is 0.0890 and the penalty barely touches it.
                    Standardized, the coefficient is 18.6 kg per standard
                    deviation against a least-squares 20.3, and the score is
                    0.9521.
                  </p>
                </InAModel>
                <KeepInMind>
                  Standardizing did not make the penalty gentle here; it bit
                  harder on the standardized column than on the centimetre
                  one. What it did is make one penalty mean the same thing for
                  every column, so that a single knob can be turned for all of
                  them, which is the reason ridge and lasso are fitted on
                  standardized features and not a promise about the score.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Trees do not notice">
                <p>
                  A{" "}
                  <Link href="/concepts/decision-trees" className={link}>
                    decision tree
                  </Link>{" "}
                  never notices. Every split asks whether a value is above a
                  threshold, and the rows that go left when asked about 151.5
                  centimetres go left when asked about 1515 millimetres,
                  because any rescaling that keeps the order moves the
                  threshold along with the values.
                </p>
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
                  A method that only compares values within a column is
                  invariant to any order-preserving rescaling of that column.
                  Trees, forests and boosted trees are all of that kind, and
                  scaling their inputs changes the printed thresholds and
                  nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Least squares does not notice either">
                <p>
                  Plain least squares is equivariant to the unit, and the word
                  means that the answer changes in exactly the way the unit
                  did. Measure height in metres instead of centimetres and the
                  slope is multiplied by one hundred, the intercept, the
                  fitted weights, the residuals and the R² are untouched, and
                  the line is the same line.
                </p>
                <ModelsByUnit panel="least_squares" />
                <InAModel title="The crowd's line in four units">
                  <p>
                    The slope is 0.8901 in centimetres, 89.01 in metres and
                    0.08901 in millimetres, the intercept is −81.77 in all
                    three, and the R² of 0.9588034 agrees across all four rows
                    to better than a billionth. Translated back, the
                    standardized row gives the same 0.8901 and −81.77.
                  </p>
                </InAModel>
                <KeepInMind>
                  The same objective, minimised by gradient descent in step 3,
                  did notice the unit. Least squares reaches its minimum in one
                  algebraic step and a walk reaches it in many, so what noticed
                  was the walk. Scaling matters to the gradient walk of step 3,
                  to the penalty of step 20 and to the distances of step 18;
                  the tree and the closed-form line are untouched by it because
                  neither adds columns together or reads the size of a
                  coefficient.
                </KeepInMind>
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
                "−0.16, 1.30 and −1.14, which announces that one of the three is shorter than average",
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
                "Height alone is transformed, and age is given a centre of zero and a spread of one",
                "Both are transformed, since the columns are matched by position",
              ],
              0,
              "Columns are matched by name and never by position, so features may arrive in any order, and a one-column request came back with one column. A column the fit never saw has no centre and no spread, so inventing one would answer a question nobody asked. A model’s predict is stricter because it evaluates one expression that needs all of them.",
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
              "Least squares is equivariant, so the slope reads 0.8901 in centimetres and 89.01 in metres while the intercept of −81.77 and the R² agree across all four rows. A tree only compares values within a column, so any order-preserving rescaling moves the threshold along with the values. Ridge reads the size of a coefficient, and in metres its score collapses to 0.5718, while the walk takes two passes standardized and 8415 in centimetres.",
            ),
            choice(
              "Why are ridge and lasso fitted on standardized features?",
              [
                "Because standardizing makes the penalty gentler",
                "Because one penalty then means the same thing for every column, so a single knob can be turned for all of them",
                "Because the penalty is otherwise undefined for a column recorded in metres",
                "Because standardizing raises the score",
              ],
              1,
              "Standardizing bit harder here than centimetres did, taking the coefficient to 18.6 kilograms per standard deviation against a least-squares 20.3 and scoring 0.9521 where the centimetre fit scored 0.9588. The point is that the size of a coefficient depends on its column’s unit, so without standardizing the fit reports an accident of bookkeeping as a fact about the data.",
            ),
        ],
        },
        {
          title: "Part 6. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="23. What a scaler must specify">
                <p>
                  A complete implementation states how the centre and the
                  spread are read, including the population or sample divisor
                  for a standard deviation and the interpolation rule for a
                  quartile; that the fit reads the training rows only and the
                  transform reuses those numbers; how columns are matched,
                  which is by name here, and whether a subset is accepted;
                  what a zero spread does, which is refuse rather than
                  substitute a one; that an inverse exists and what its round
                  trip costs; and what happens to a value outside the fitted
                  range, which is that it is scaled by the same map and lands
                  wherever that puts it.
                </p>
                <KeepInMind>
                  Two of those are where implementations part company
                  silently. A sample divisor gives a standardized variance of
                  (n − 1) / n, and a different quartile convention gives a
                  different robust spread, and neither raises anything.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The edges, each one asked">
                <p>
                  Every row below was tried rather than reasoned about, and the
                  widget under the table tries the same list again on every
                  load, so the table cannot go stale without the widget saying
                  so.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "no features at all", reason: "refused before anything is read, since there is nothing to learn a centre from." },
                    { expression: "an empty column", reason: "refused, since a column is required to hold at least one value." },
                    { expression: "one row", reason: "refused by standardize, min-max and robust, whose spread is zero on one value; accepted by max-abs and root mean square, which read a spread of 170 from a lone 170 and send it to 1." },
                    { expression: "a constant column", reason: "the same split. Three refuse a spread of zero by name; max-abs and root mean square accept a constant 170 and answer a constant 1, and refuse only a column of zeros." },
                    { expression: "a missing or infinite value", reason: "refused where the column is built, before any scaler sees it." },
                    { expression: "six identical values of eight, for robust", reason: "accepted, with an interquartile range of 0.75, since the third quartile lands just past the run." },
                    { expression: "seven identical values of eight, for robust", reason: "refused for a spread of zero, though the column is not constant; both quartiles fall inside the run. Nine of twelve is accepted and ten of twelve refused, so the rule is about three quarters." },
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
                  In every one of these the alternative is a number that looks
                  fine. A spread quietly set to one, a constant column quietly
                  zeroed, a robust spread quietly taken from the wrong pair, an
                  out-of-range value quietly pinned to the edge, all fit and
                  all predict. The refusals exist so that a case where the
                  arithmetic has stopped meaning anything is refused outright
                  instead of being answered with a number.
                </KeepInMind>
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
                "Six identical values of eight, handed to robust",
                "Nine values each one machine epsilon apart, handed to standardize",
                "A height of 250 cm, handed to a min-max scaler fitted on 118 to 183",
              ],
              [0, 1, 2, 3],
              "Every one of the four is accepted, and each answer is a number that looks fine. Max-abs and root mean square read a spread of 170 from the constant column and answer a constant 1, refusing only a column of zeros. Six identical values of eight leave an interquartile range of 0.75, since the third quartile lands just past the run, where seven of eight put both quartiles inside it and are refused. A spread of 2.6 × 10⁻¹⁶ is a spread, so the nine values are scaled to between −1.55 and 1.55. And 250 cm comes back as 2.03, because the unit interval was a fact about the fitted column and not a bound the scaler enforces.",
            ),
            trueFalse(
              "A robust scaler refuses seven identical values of eight for a spread of zero, though the column is not constant.",
              true,
              "Both quartiles fall inside the run of seven equal values, so the interquartile range is zero and there is nothing to divide by, even though the eighth value differs. Nine identical values of twelve are accepted and ten of twelve refused, so the rule is about three quarters of the column. The refusal exists so that a case where the arithmetic has stopped meaning anything is refused outright instead of being answered with a spread quietly taken from the wrong pair.",
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
              "A spread quietly set to one fits and predicts, and nobody learns that the column carried nothing, which is why the refusal is the contract here. The spread is read differently by each scaler, so the same constant 170 has no spread for standardize, min-max and robust and a spread of 170 for max-abs and root mean square, which accept it and answer a constant 1; even those two refuse a column of zeros.",
            ),
          ],
        },
        {
          title: "Practice. Scaling the Crowd With the Library",
          practice: [
            exercise(
              "Take the vote four times",
              ["Part 1 puts a person of 150 cm and 60 kg to the crowd and lets their three nearest neighbours vote, once with the heights in millimetres, once in centimetres, once in metres, and once with both columns standardized. Take the same four votes with KNearestNeighboursClassifier, where a label of 0 is a child and 1 is an adult.", "Part 1 arrives at child for millimetres and adult for the other three. For the standardized vote, fit a Standardizer on the crowd and put the query through the same one, and print the two spreads it divides by."],
              `from oop_ml import Feature, KNearestNeighboursClassifier, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
labels = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

for unit, factor in (("millimetres", 10), ("centimetres", 1), ("metres", 0.01)):
    # Fit a three-neighbour classifier on the heights multiplied by the factor
    # and the weights as they are, predict the query of 150 cm and 60 kg in
    # the same unit, and print the unit and whether the answer is child or adult.
    pass

# Fit a Standardizer on both columns, transform the crowd and the query through
# it, take the same vote, and print the answer and the two spreads it learned.`,
              `from oop_ml import Feature, KNearestNeighboursClassifier, Standardizer

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
print(f"height divided by {height_spread:.1f}, weight divided by {weight_spread:.1f}")`,
              `millimetres: child
centimetres: adult
metres: adult
standardized: adult
height divided by 22.8, weight divided by 20.8`,
              { hints: ["The classifier takes a list of Features and a Feature of labels, and predict takes a list of Features of the same names, one value each for a single query.", "Only the height column is multiplied by the factor. The weights, and the query's 60 kg, stay as they are, which is what makes the unit the only thing that changes between the three votes.", "The query must go through the same fitted Standardizer as the crowd, by transform, never through a new one. A fresh fit on a single row has no spread and would be refused.", "predict answers one value per query row, so index the first and turn it into an int to compare it with the labels."], check: numberCheck("By what number does the standardized reading divide the height column?", 22.8, 0.05, "The crowd's heights have a standard deviation of 22.8 and the weights one of 20.8, so after standardizing a gap of one spread in either column counts the same in the squared distance. In millimetres the height column owned at least 0.71 of every squared distance and the vote went two children to one; in the other three readings it went two adults to one, over three different sets of neighbours, and nothing about the person changed.") },
            ),
            exercise(
              "Five rulers on five readings, then on an outlier",
              ["Part 2 puts the five readings 9, 19, 24, 29 and 39 through five rulers and reads the 39 as 1.5, 1.0, 1.0, 1.5 and 1.5. Fit all five scalers on that column and print each one's centre, spread and scaled values, then do the same with the 39 typed as 99, which is the outlier button of Part 3.", "Part 3 says the mean jumps to 36 and the robust row does not move. The standard deviation the standardizer reads off the outlier column is a number the lesson never prints."],
              `from oop_ml import Feature, MaxAbsScaler, MinMaxScaler, RobustScaler, RootMeanSquareScaler, Standardizer

readings = [9, 19, 24, 29, 39]
with_outlier = [9, 19, 24, 29, 99]
affine = {"min-max": MinMaxScaler, "max-abs": MaxAbsScaler, "robust": RobustScaler, "root mean square": RootMeanSquareScaler}

for values in (readings, with_outlier):
    column = Feature("value", values)
    print(values)
    # Fit a Standardizer on the column and print its mean, standard deviation
    # and the scaled values rounded to two places. Then fit each affine scaler
    # and print its centre, spread and scaled values the same way.`,
              `from oop_ml import Feature, MaxAbsScaler, MinMaxScaler, RobustScaler, RootMeanSquareScaler, Standardizer

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
        print(f"  {name}: centre {learned.centre:.2f}, spread {learned.spread:.2f}, scaled {scaled}")`,
              `[9, 19, 24, 29, 39]
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
  root mean square: centre 0.00, spread 48.29, scaled [0.19, 0.39, 0.5, 0.6, 2.05]`,
              { hints: ["Every scaler is fitted the same way, on a list holding the one Feature, and transform answers a list holding the scaled Feature.", "The Standardizer names its two numbers mean and standard_deviation. The four affine scalers name them centre and spread, which is why the solution reads them in two places.", "The scaled Feature's values are an array; rounding each to two places after converting it to a float is what makes the lists readable."], check: numberCheck("What standard deviation does the standardizer read off the column once the 39 has become 99?", 32.19, 0.005, "The mean moves from 24 to 36 and every deviation from it changes, so the standard deviation moves from 10 to 32.19 and the four ordinary values are pressed together on that ruler as well as on the min-max and max-abs ones. The robust row alone still reads 24 and 10, because the median and the quartiles are positions in the sorted list and the 99 holds the same position the 39 did, so it is sent to 7.5 while the other four stay where they were.") },
            ),
            exercise(
              "Hold out the three tallest adults",
              ["Part 4 holds the three tallest adults, rows 8, 9 and 10 of the crowd, out of the fit and standardizes their heights two ways, with the mean and deviation of the eight training rows and with their own. Build a Standardizer on the eight, fit the least-squares line on the standardized training heights with SimpleLinearRegression, and read the three held-out people both ways.", "Part 4 arrives at scores of 2.26, 2.43 and 2.14 against the training numbers and −0.16, 1.30 and −1.14 against their own, with predicted weights of 74.8, 77.2 and 73.1 kilograms by the first route and 41.0, 61.4 and 27.4 by the second, for people who weigh 80, 83 and 78."],
              `from oop_ml import Feature, SimpleLinearRegression, Standardizer

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
# transform the held-out column, predict from the scores, and print both.`,
              `from oop_ml import Feature, SimpleLinearRegression, Standardizer

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
print(f"actual weights {[weights[row] for row in held]}")`,
              `training mean 141.1, deviation 17.2
line: weight = 43.25 + 13.96 times the standardized height
training numbers: scores [2.26, 2.43, 2.14], predicted [74.8, 77.2, 73.1]
their own numbers: scores [-0.16, 1.3, -1.14], predicted [41.0, 61.4, 27.4]
actual weights [80, 83, 78]`,
              { hints: ["SimpleLinearRegression takes two plain lists, the standardized heights and the weights, so the scores come out of the transformed Feature's values as floats first.", "The line is fitted once. The only thing that changes between the two readings is which Standardizer transforms the held-out column.", "predict takes a list of standardized heights and answers one weight per height, which can be rounded in a comprehension."], check: numberCheck("What weight does the line predict for the 178 cm adult when the three are standardized with their own numbers?", 27.4, 0.05, "Against their own mean of the three, the 178 cm adult comes out at −1.14, the shortest of a group of three and apparently well below average, and the line, which learned that a standardized height of −1.14 belongs to a child of the training rows, answers 27.4 kg for an adult who weighs 78. Against the training mean of 141.1 and deviation of 17.2 the same person is 2.14 spreads above the people the fit saw and is predicted at 73.1 kg.") },
            ),
            exercise(
              "Ask the scalers about the edges",
              ["Part 6 says that six identical values of eight are accepted by the robust scaler with an interquartile range of 0.75 and seven of eight are refused, that max-abs accepts a constant column of 170 and answers a constant 1, and that a min-max scaler fitted on heights of 118 to 183 answers 2.03 for 250. Ask the library all four.", "Catch the one refusal with the library's own base error and print its message, and print the accepted answers to two places."],
              `from oop_ml import Feature, MaxAbsScaler, MinMaxScaler, MLLibError, RobustScaler

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]

for label, values in (("six of eight", [5] * 6 + [8, 9]), ("seven of eight", [5] * 7 + [8])):
    # Fit a RobustScaler on the values. Print the spread it learned when it
    # accepts the column, and the refusal's message when it does not.
    pass

# Fit a MaxAbsScaler on a column of three 170s and print what it answers for
# the same column. Then fit a MinMaxScaler on the crowd's heights and print
# what it answers for a height of 250.`,
              `from oop_ml import Feature, MaxAbsScaler, MinMaxScaler, MLLibError, RobustScaler

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
print(f"min-max, 250 after fitting on 118 to 183: accepted, answers {beyond:.2f}")`,
              `robust, six of eight: accepted, interquartile range 0.75
robust, seven of eight: refused, 'value' has a spread of 0.0, so it cannot be rescaled; a column carrying no variation has nothing to divide by
max-abs, a constant 170: accepted, answers [1.0, 1.0, 1.0]
min-max, 250 after fitting on 118 to 183: accepted, answers 2.03`,
              { hints: ["The refusal happens inside fit, where the spread is read, so the try has to wrap the fit and not only the reading of scalings.", "An affine scaler's learned numbers are on scalings, addressed by the column's name, with properties centre and spread.", "Nothing clips. A min-max scaler applies the same subtraction and division to 250 that it applied to the fitted column, which is why the answer is above one."], check: numberCheck("What does the min-max scaler fitted on the crowd's heights answer for 250 cm?", 2.03, 0.005, "The scaler learned a centre of 118 and a spread of 65, and 250 less 118 over 65 is 2.03. The unit interval was a fact about the column it learned from and not a bound it enforces, so a value beyond the fitted range lands wherever the same map puts it, and that is evidence that it differs from the fitted examples rather than an error.") },
            ),
          ],
        },
      ]}
    />
  );
}
