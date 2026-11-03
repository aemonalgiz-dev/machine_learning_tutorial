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
import { LineFitPlayground } from "@/components/widgets/LineFitPlayground";
import { LossBowlPlayground } from "@/components/widgets/LossBowlPlayground";
import { SquaresChart } from "@/components/widgets/SquaresChart";

export const metadata: Metadata = {
  title: "Simple Linear Regression · Perceptron Lab",
  description:
    "Linear regression represents a relationship with a straight line. Fitting the line means choosing its slope and intercept according to the differences between observed and predicted values.",
};

export default function SimpleLinearRegressionPage() {
  return (
    <ConceptPage
      lessonId="simple-linear-regression"
      intuition={lessonIntuitions["simple-linear-regression"]}
      technicalStart="Part 3. What Best-Fitting Means"
      openingTitle="One Line, Five Different Answers"
      playgroundTitle="How does moving one person change the fitted line?"
      playgroundIntro="Choose Five height and weight pairs, then drag one person's point. Will the fitted line move closer to that person at the expense of the others? Compare their prediction errors as the line is fitted again."
      title="Simple linear regression"
      tagline={"Linear regression represents a relationship with a straight line. Fitting the line means choosing its slope and intercept according to the differences between observed and predicted values."}
      prerequisites={
        <>
          You only need to know what a straight line is. It has a slope that
          tilts it and an intercept that slides it up and down. The derivation at
          the end also leans on the{" "}
          <Link
            href="/primers/calculus"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            calculus primer
          </Link>
          , though everything before it stands on its own.
        </>
      }

      playground={<LineFitPlayground />}
      sections={[
        {
          title: "Part 1. What Problem Regression Solves",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Paired observations">
                <p>
                  Let&apos;s use five people whose heights and weights we have measured. We will keep returning to these same observations as we work out how to choose a line.
                </p>
                <Equation>{"height (cm):  160   165   170   175   180\nweight (kg):   58    66    68    74    74"}</Equation>
                <p>
                  Each person contributes one input and one observed outcome, and
                  together they make one point on the plot above. The input is
                  written x and the outcome y, so person one is the pair
                  (160, 58).
                </p>
                <p>Which measurement is the input depends on the question. Here we use height to predict weight. Reversing those roles creates a different prediction problem, even though the observations come from the same people. The fitting criterion measures errors in whichever quantity we chose as the output.</p>
              </SubSection>

              <SubSection title="2. A line as a prediction rule">
                <p>
                  A line on this plot is a rule for guessing. Pick a height along
                  the bottom, go straight up until you meet the line, and read
                  across to the weight it predicts. Do that for 165 and the line
                  answers; do it for 172 and it answers just as readily, even
                  though nobody in the data is 172 tall.
                </p>
                <p>
                  Written down, that rule is
                </p>
                <Equation>{"ŷ = βx + α"}</Equation>
                <NumberTable
                  headings={["symbol", "what it is"]}
                  rows={[
                    ["x", "the input, a height"],
                    ["ŷ", "the predicted outcome, said y-hat"],
                    ["β", "the slope"],
                    ["α", "the intercept"],
                  ]}
                />
                <p>
                  The hat distinguishes a prediction, ŷ, from the observed value, y. Keeping the two symbols separate lets us describe the error between what the line predicted and what we measured. Part 2 works through those gaps.
                </p>
              </SubSection>

              <SubSection title="3. Slope and intercept">
                <p>
                  Two numbers position a line, and they do different jobs.
                </p>
                <p>

                  The slope says how much the prediction changes for each unit of
                  input. A slope of 0.8 means one more centimeter of height
                  raises the predicted weight by 0.8 kg. Its units are the
                  outcome&rsquo;s over the input&rsquo;s, kilograms per
                  centimeter, which is worth remembering because it makes the
                  number readable.
                </p>
                <p>
                  The intercept says where the line sits when the input is zero,
                  and its job is mostly to slide the line up and down until it
                  runs through the data. Change the slope in the box above and the
                  line pivots. Change the intercept and it shifts without tilting.
                </p>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Measuring the Errors of a Candidate Line",
          content: (
            <>
              <SubSection title="4. One prediction and its residual">
                <p>For the shortest person, compare the observed weight with the candidate line&apos;s prediction. The difference records both the size of the miss and its direction. We call the observed value minus the prediction a residual.</p>
                <Equation>{"residual = measured − predicted\ne = y − ŷ = 58 − 60 = −2"}</Equation>
                <p>
                  The sign says which way the line missed. A positive residual
                  means the point sits above the line and the prediction was too
                  low. A negative residual means the point sits below and the
                  prediction was too high. Zero means the line went through the
                  point.
                </p>
                <KeepInMind>
                  <p>
                    A residual is measured <em>vertically</em>, not
                    perpendicular to the line. The gray stalks in the box above
                    run straight up and down for that reason.
                  </p>
                  <p>Ordinary least squares measures the error in the predicted output. Height is treated as the supplied input in this calculation, so the residual is a vertical difference in weight. Minimizing perpendicular distances would answer a different fitting question.</p>
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Residuals across the dataset">
                <p>
                  One residual per person, so a line produces five of them here.
                  For the line that predicts 60, 64, 68, 72 and 76,
                </p>
                <NumberTable
                  headings={["height", "measured weight", "predicted", "residual"]}
                  rows={[
                    ["160", "58", "60", "−2"],
                    ["165", "66", "64", "+2"],
                    ["170", "68", "68", "0"],
                    ["175", "74", "72", "+2"],
                    ["180", "74", "76", "−2"],
                  ]}
                />
                <p>

                  Each row is one gray stalk on the plot. The middle person sits
                  exactly on the line and has no stalk at all.
                </p>
              </SubSection>

              <SubSection title="6. Why errors cannot simply be added">
                <p>
                  The obvious way to score a whole line is to add up its
                  residuals, and it does not work.
                </p>
                <Equation>{"(−2) + (+2) + 0 + (+2) + (−2) = 0"}</Equation>
                <p>The total is zero even though the line misses four of the five observed weights. A perfect fit would also give zero. The signed total therefore cannot distinguish a perfect fit from errors that cancel. It can still help identify a systematic tendency to overpredict or underpredict.</p>
                <p>
                  The problem is the signs. Missing by 2 above and 2 below is
                  reported as not missing at all, so what is needed is a way of
                  counting a miss as a miss regardless of direction.
                </p>
              </SubSection>

              <SubSection title="7. Squared error and RSS">
                <p>
                  Squaring each residual does that. A negative squared is
                  positive, so nothing cancels, and it has a second effect worth
                  seeing clearly.
                </p>
                <NumberTable
                  headings={["residual", "squared"]}
                  rows={[
                    ["1", "1"],
                    ["2", "4"],
                    ["4", "16"],
                  ]}
                />
                <p>Doubling a residual quadruples its squared contribution. One residual of 4 contributes 16, the same total as four residuals of 2. The objective therefore gives a large individual miss more influence than an absolute-error objective would.</p>
                <p>
                  Add the squares and a whole line collapses to one number, the
                  residual sum of squares.
                </p>
                <Equation>{"RSS = Σ (yᵢ − ŷᵢ)²"}</Equation>
                <p>
                  The box below draws it. Each square has a residual for its
                  side, so its area is that residual squared, and RSS is the
                  total shaded area.
                </p>
                <SquaresChart />
                <KeepInMind>
                  <p>
                    RSS is a total, not an average, and its units are the square
                    of the outcome&rsquo;s. An RSS of 16 on these five people is
                    16 squared kilograms, and it is not an answer to &ldquo;how
                    far off was the line, typically&rdquo;.
                  </p>
                  <p>RSS compares lines evaluated on the same observations. Its size also depends on the number of observations and their units, so scores from different datasets need further context. An average loss can make the number of observations explicit.</p>
                  <p>
                    Squaring is also a choice rather than a definition of error.
                    Other loss functions treat a large miss differently, and the
                    loss functions page takes that up.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "The same paired measurements can support height-to-weight and weight-to-height fits, even though the two prediction problems generally produce different lines.",
              true,
              "The measurements remain paired, but choosing a different target changes which mistakes are minimized. The reverse fit has a slope different from the reciprocal of the forward fit, so it is a new fit rather than the same equation rearranged.",
            ),
            trueFalse(
              "Ordinary least squares measures a residual as the perpendicular distance from the point to the line.",
              false,
              "Ordinary least squares holds the observed input fixed and compares the predicted target with the observed target. On a plot with input horizontal and target vertical, that difference is vertical. Minimizing perpendicular distances would define another fitting objective.",
            ),
            choice(
              "A candidate line predicts 60, 64, 68, 72 and 76 for the five people. Why is adding up its five residuals a poor way to score it?",
              [
                              "The five residuals add to zero, and a line that predicted every weight exactly would report the same total",
                              "A residual carries no sign, so there is nothing to add up",
                              "The residuals are measured perpendicular to the line, which is the wrong distance",
                              "Five people is too few for any total to mean anything",
                            ],
              0,
              "Overestimates and underestimates cancel in the signed total. This candidate has a zero total despite missing four observations. A signed total can help inspect bias, but it cannot by itself distinguish these errors from a perfect fit.",
              {
                "description": "Residual = observed weight − predicted weight. Compare the candidate predictions in the question with these observations.",
                "data": "height (cm): 160 165 170 175 180\nweight (kg):  58  66  68  74  74"
              },
            ),
            choice(
              "Under squared error, one residual of 4 costs the same as how many separate residuals of 2?",
              ["Two", "Four", "Eight", "Sixteen"],
              1,
              "A residual twice as large contributes four times as much squared error. Four of the smaller residuals therefore have the same total penalty as the larger one. The objective gives large individual misses more influence than an absolute-error objective would.",
            ),
            several(
              "Which of these hold for the residual sum of squares as this page describes it?",
              [
                "Its units are the square of the outcome’s, so an RSS of 16 on these five people is 16 squared kilograms",
                "For a fixed line it cannot decrease when observations are added, even if its prediction quality has not worsened",
                "It answers how far off the line was, typically",
                "For comparing fit quality, it should be read alongside a baseline scored on the same observations"
              ],
              [0, 1, 3],
              "RSS is a sum of squared residuals and has squared outcome units. Each extra observation adds a nonnegative contribution for a fixed line; a perfectly predicted extra row adds zero. It is not a typical miss in kilograms. Comparing models on the same observations avoids confusing more rows with worse predictions.",
            ),
        ],
        },
        {
          title: "Part 3. What Best-Fitting Means",
          content: (
            <>
              <SubSection title="8. Comparing candidate lines">
                <>
                  <p>
                    Once we have chosen residual sum of squares as the criterion, we can
                    compare candidate lines by one number. A smaller value means smaller
                    total squared errors on these observations.
                  </p>
                </>
                <>
                  <p>
                    The widget at the top fits the line automatically. Select Five height and weight pairs to reproduce these values, then drag a point and watch the
                    fitted line and its residuals change. Each new dataset has its own
                    best-fitting coefficients.
                  </p>
                </>
                <p>For this criterion, the best-fitting line is the one with the smallest residual sum of squares. That definition concerns the observed data; usefulness on new observations needs another check.</p>
              </SubSection>

              <SubSection title="9. The error surface">
                <p>The score depends on both slope and intercept. Plot those two coefficients along the horizontal axes and RSS vertically. Each position on the resulting surface represents one candidate line, with its height showing that line’s total squared error.</p>
                <LossBowlPlayground />
                <p>When the input values vary, this least-squares surface has a unique minimum. The bowl in the activity shows how changing either coefficient increases the error away from that minimum. The constant-input case later explains when uniqueness fails.</p>
                <p>We can search for the minimum by checking how the score changes as each coefficient changes. Part 6 uses derivatives to carry out that calculation.</p>
              </SubSection>

              <SubSection title="10. The least-squares solution">
                <p>
                  Here is the fitted rule. Let&apos;s read what its slope and intercept mean for the people in our table, then derive how the fit chose them.
                </p>
                <Equation>{"β = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²\n\nα = ȳ − β·x̄"}</Equation>
                <p>The bars denote means, so x̄ is the mean height. The numerator adds the products of paired height and weight deviations. Positive products indicate departures in the same direction; negative products indicate opposite departures. The denominator adds squared height deviations. Dividing gives the fitted change in predicted weight per centimeter of height.</p>
                <p>For unweighted least squares with an intercept, the fitted line passes through the pair of sample means. Once the slope is known, that requirement determines the intercept.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Fitting the Five People by Hand",
          content: (
            <>
              <SubSection title="11. One table, one calculation">
                <p>
                  The whole fit is one table and two divisions. Means first, then
                  deviations, then the two columns that get summed.
                </p>
                <WorkedExample>
                  <Equation>{"x̄ = 850 / 5 = 170        ȳ = 340 / 5 = 68"}</Equation>
                  <NumberTable
                    headings={["x", "y", "x − x̄", "y − ȳ", "product", "(x − x̄)²"]}
                    rows={[
                      ["160", "58", "−10", "−10", "100", "100"],
                      ["165", "66", "−5", "−2", "10", "25"],
                      ["170", "68", "0", "0", "0", "0"],
                      ["175", "74", "5", "6", "30", "25"],
                      ["180", "74", "10", "6", "60", "100"],
                    ]}
                    caption="Sum the last two columns: 200 and 250."
                  />
                  <Equation>{"β = 200 / 250 = 0.8\nα = 68 − 0.8 × 170 = 68 − 136 = −68"}</Equation>
                  <p>So the best-fitting line for these five people is</p>
                  <Equation>{"ŷ = 0.8x − 68"}</Equation>
                </WorkedExample>
              </SubSection>

              <SubSection title="12. Reading the fitted slope and intercept">
                <p>

                  The slope is 0.8 kilograms per centimeter. Within the range
                  these people cover, from 160 to 180 cm, one extra centimeter of
                  height goes with 0.8 kg more predicted weight.
                </p>
                <p>
                  &ldquo;Goes with&rdquo; is deliberate. The line says these two
                  measurements move together in this data, and it says nothing
                  about what would happen to somebody&rsquo;s weight if their
                  height changed.
                </p>
                <p>

                  The intercept is −68 kg, which is the predicted weight of a
                  person zero centimeters tall. That is not a claim about
                  anything. Zero is far outside the range of anybody measured, and
                  the intercept&rsquo;s job here is to position the line rather
                  than to mean something on its own.
                </p>
              </SubSection>

              <SubSection title="13. Predictions, residuals, and RSS">
                <p>
                  Run every height through the fitted line and the rest follows.
                </p>
                <WorkedExample>
                  <NumberTable
                    headings={["height", "prediction", "measured", "residual", "squared"]}
                    rows={[
                      ["160", "0.8×160 − 68 = 60", "58", "−2", "4"],
                      ["165", "0.8×165 − 68 = 64", "66", "+2", "4"],
                      ["170", "0.8×170 − 68 = 68", "68", "0", "0"],
                      ["175", "0.8×175 − 68 = 72", "74", "+2", "4"],
                      ["180", "0.8×180 − 68 = 76", "74", "−2", "4"],
                    ]}
                  />
                  <Equation>{"RSS = 4 + 4 + 0 + 4 + 4 = 16"}</Equation>
                  <p>
                    The residuals also sum to zero, which is the observation
                    section 6 warned not to trust as a score, and is nonetheless
                    true of every fit here.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  <p>
                    That the residuals sum to zero is a consequence of how this
                    line was fitted, not a general property of good models. It
                    follows from fitting an intercept by least squares, and the
                    derivation in Part 6 shows exactly where it comes from, since
                    the intercept equation <em>is</em> the statement that they
                    sum to zero.
                  </p>
                  <p>
                    Fit without an intercept, or by a different loss, and the
                    residuals generally will not.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Measuring Whether the Best Line Is Useful",
          content: (
            <>
              <SubSection title="14. Best line versus useful line">
                <p>Least squares can choose a line even when the observations contain no useful predictive pattern. The existence of fitted coefficients therefore does not establish that the input helps predict the output.</p>
                <p>Select the no-pattern example in the activity. The fitting procedure still returns coefficients because it can minimize RSS even when a straight line captures little useful relationship. To decide whether that fit helps, compare it with a simple baseline and check predictions on observations excluded from fitting.</p>
                <p>
                  Answering the second claim needs something to compare against.
                </p>
              </SubSection>

              <SubSection title="15. The mean-only baseline">
                <p>
                  The simplest possible model ignores height entirely and guesses
                  the same weight for everybody. If it has to be one number, the
                  mean weight of 68 kg is the best single number available, since
                  the mean is precisely the constant with the smallest squared
                  error.
                </p>
                <p>
                  Drawn on the plot that is a flat horizontal line at 68. It uses
                  none of the information in the input, so any line worth fitting
                  ought to beat it.
                </p>
              </SubSection>

              <SubSection title="16. Measuring variation with TSS">
                <p>
                  Score that baseline the same way any line is scored, by the sum
                  of its squared misses.
                </p>
                <WorkedExample>
                  <Equation>{"weight − mean:   −10    −2     0     6     6\nsquared:         100     4     0    36    36\n\nTSS = 176"}</Equation>
                </WorkedExample>
                <p>
                  That total has its own name, the total sum of squares, and two
                  readings. It is the squared error of the mean-only baseline, and
                  it is a measure of how much the weights vary at all. Both
                  readings are the same number, which is what makes it the right
                  thing to compare against, since it is how much variation was
                  there for a line to account for.
                </p>
              </SubSection>

              <SubSection title="17. Comparing the line with R²">
                <p>
                  Now the two numbers sit side by side. The baseline scored 176
                  and the fitted line scored 16, so the line removed 160 of the
                  176.
                </p>
                <Equation>{"R² = 1 − RSS / TSS\n   = 1 − 16 / 176\n   = 1 − 0.0909\n   = 0.909"}</Equation>
                <p>
                  Read the ratio in two steps. RSS over TSS is the fraction of the
                  baseline&rsquo;s error still left after fitting, about 9%. One
                  minus that is the fraction the line accounted for, about 91%.
                </p>
              </SubSection>

              <SubSection title="18. What R² does and does not say">
                <p>
                  Stated carefully, the number says this. The fitted linear
                  relationship with height accounts for about 91% of the variation
                  in weight among these five measurements.
                </p>
                <p>The score does not establish that height causes weight. The same 0.909 could appear if another influence affected both. It also gives no evidence about heights outside the measured range of 160 to 180 cm. A line can improve on a constant while still missing a curved relationship, so we need to inspect the errors as well as the score.</p>
                <KeepInMind>
                  <p>
                    R² computed this way, on the same rows the line was fitted to
                    and with an intercept, cannot fall below zero. The
                    least-squares line can always match the flat baseline by
                    setting its slope to zero, so it never does worse.
                  </p>
                  <p>On observations excluded from fitting, this score can be negative. It then means the model made larger squared errors than a constant equal to that evaluation group&apos;s mean. The negative result is valid: the chosen model performed worse than the reference used in the score.</p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 to 5",
          quiz: [
            trueFalse(
              "An ordinary least-squares line with a freely fitted intercept passes through the point formed by the two sample means.",
              true,
              "The intercept is defined as whatever value puts the line there, which is what the formula subtracting the slope times the mean height from the mean weight says. The slope decides the tilt and the intercept then slides the line until it runs through that point.",
            ),
            choice(
              "The baseline scored 176 and the fitted line scored 16, giving an R-squared of 0.909. Stated carefully, what does that number say?",
              [
                "The fitted linear relationship with height accounts for about 91% of the variation in weight among these five measurements",
                "Height causes about 91% of a person’s weight",
                "A prediction from the line will land within about 9% of the measured weight",
                "A line was the right shape to fit, with about 9% of the fit still to find",
              ],
              0,
              "This R-squared compares the fitted line’s squared errors with the mean-only baseline on the same five measurements. It reports how much of that baseline error the fitted relationship removes. It does not establish causation, accuracy for another person or whether a straight line is the right functional form.",
            ),
            choice(
              "The total sum of squares of 176 has two readings on this page. Which pair?",
              [
                "The squared error of the mean-only baseline, and a measure of how much the weights vary at all",
                "The squared error of the fitted line, and a measure of how much the heights vary",
                "The total of the five residuals, and the shaded area of the squares",
                "The error left after fitting, and the error the line removed",
              ],
              0,
              "Predicting mean weight for everyone gives the total sum of squares. The same quantity measures total squared variation around that mean. Using it as the baseline gives the line’s residual error a reference on the same observations and in the same units.",
            ),
            trueFalse(
              "Since R-squared computed on the rows the line was fitted to cannot fall below zero, a negative value is always a sign that something was computed wrongly.",
              false,
              "On its training rows, ordinary least squares with a free intercept can do at least as well as the mean-only line, provided total variation is nonzero. On new rows, its errors can exceed the squared deviations around those rows’ own observed mean. That produces a valid negative R-squared; the observed mean is the reference used by this score.",
            ),
            several(
              "Which of these are true of the fit on the five people?",
              [
                              "The slope of 0.8 is in kilograms per centimeter, the outcome’s units over the input’s",
                              "The intercept of minus 68 kg is the predicted weight of a person zero centimeters tall, and is not a claim about anything",
                              "The five residuals of the fitted line add to zero",
                              "The fitted line’s residual sum of squares on these five people is 16",
                            ],
              [0, 1, 2, 3],
              "All four hold. Reading the slope in units is what makes the number readable, and the intercept’s job here is to position the line rather than to mean something on its own, since zero is far outside the range anybody was measured at. Running every height through the line gives residuals of minus 2, 2, 0, 2 and minus 2, which square to a total of 16 and add to zero. The zero total is a consequence of fitting an intercept by least squares rather than a general property of good models, and fitting without one, or by a different loss, generally breaks it.",
              {
                "description": "Fit unpenalized ordinary least squares with a freely fitted intercept. Its resulting prediction rule is weight_hat = 0.8 × height − 68.",
                "data": "height (cm): 160 165 170 175 180\nweight (kg):  58  66  68  74  74"
              },
            ),
        ],
        },
        {
          title: "Part 6. Deriving the Least-Squares Line",
          content: (
            <>
              <SubSection title="19. Deriving the intercept">
                <p>At the minimum of this differentiable error surface, changing either coefficient by a sufficiently small amount cannot lower the score. We therefore set the partial derivative with respect to the slope and the partial derivative with respect to the intercept to zero. The later curvature check establishes why the stationary solution is a minimum.</p>
                <p>Written with both controls visible, the score is</p>
                <Equation>{"RSS(α, β) = Σ (yᵢ − βxᵢ − α)²"}</Equation>
                <p>Differentiate with respect to the intercept first.</p>
                <DerivationTable
                  rows={[
                    {
                      expression: "∂RSS/∂α = Σ 2(yᵢ − βxᵢ − α)·(−1)",
                      reason: "Chain rule, one term at a time",
                    },
                    {
                      expression: "        = −2 Σ (yᵢ − βxᵢ − α)",
                      reason: "Pull the constants out of the sum",
                    },
                    {
                      expression: "Σ (yᵢ − βxᵢ − α) = 0",
                      reason: "Set it to zero, and divide by −2",
                    },
                    {
                      expression: "Σyᵢ − β Σxᵢ − n·α = 0",
                      reason: "Split the sum, α added n times",
                    },
                    {
                      expression: "α = ȳ − β·x̄",
                      reason: "Divide through by n, giving the means",
                    },
                  ]}
                />
                <p>
                  The third line is worth a second look, because it says the
                  residuals add to zero. That was not imposed on the model; it
                  fell out of asking for the flattest point in the intercept
                  direction, which is why section 13 could rely on it.
                </p>
              </SubSection>

              <SubSection title="20. Deriving the slope">
                <p>Now the other direction.</p>
                <DerivationTable
                  rows={[
                    {
                      expression: "∂RSS/∂β = Σ 2(yᵢ − βxᵢ − α)·(−xᵢ)",
                      reason: "Chain rule again, and β multiplies xᵢ",
                    },
                    {
                      expression: "Σ xᵢ(yᵢ − βxᵢ − α) = 0",
                      reason: "Set to zero and divide by −2",
                    },
                    {
                      expression: "Σ xᵢ(yᵢ − βxᵢ − ȳ + β·x̄) = 0",
                      reason: "Substitute the α just derived",
                    },
                    {
                      expression: "Σ xᵢ(yᵢ − ȳ) = β Σ xᵢ(xᵢ − x̄)",
                      reason: "Gather the β terms on one side",
                    },
                    {
                      expression: "β = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²",
                      reason: "Center both sums, which subtracts zero from each",
                    },
                  ]}
                />
                <WhyThisWorks title="Why the last step subtracts nothing">
                  <p>
                    Going from xᵢ to (xᵢ − x̄) in both sums looks like it changed
                    them, and it did not. What was subtracted from the top is
                  </p>
                  <Equation>{"Σ x̄(yᵢ − ȳ) = x̄ · Σ(yᵢ − ȳ) = x̄ · 0 = 0"}</Equation>
                  <p>

                    since the deviations of any column sum to zero, and the same
                    argument empties the term taken from the bottom. Both sums are
                    unchanged, and the centered form is the one that reads as a
                    comparison of joint movement against the input&rsquo;s own.
                  </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="21. Why the solution is a minimum">
                <p>
                  Setting derivatives to zero finds a flat place, and flat places
                  include the tops of hills. One more argument is needed to know
                  which this is.
                </p>
                <p>Each residual is an affine expression in the slope and intercept. Along any straight path through those coefficients, its square is an upward-opening quadratic or a constant. Adding those squares preserves that property. This makes RSS convex: a stationary solution is a global minimum, rather than a separate local minimum that hides a better fit elsewhere.</p>
                <p>When the heights vary, the surface curves upward in every coefficient direction and the minimum is unique. Constant heights leave a flat direction along which different slope and intercept pairs have the same score. Part 7 explains that case.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. When a Unique Line Cannot Be Identified",
          content: (
            <SubSection title="22. Every input the same">
              <p>
                Suppose all five people are exactly 170 cm tall, with the weights
                unchanged. Every height deviation is then zero.
              </p>
              <Equation>{"xᵢ − x̄ = 0  for every person\nΣ(xᵢ − x̄)² = 0"}</Equation>
              <p>
                The slope formula would divide by zero. That means these observations do not identify a unique slope. It does not mean that no line can make predictions for them.
              </p>
              <p>
                A prediction at 170 cm is still perfectly available, and it is the
                mean weight of 68 kg, which is the best constant guess as always.
                What cannot be determined is how the prediction should
                <em> change</em> as height changes, because height never changed.
                Infinitely many slope and intercept pairs pass through (170, 68),
                every one of them fits the data equally well, and nothing in the
                data prefers any of them.
              </p>
              <InAModel>
                <p>The same issue appears more gradually when an input barely varies. Small changes in the observations can then cause large changes in its estimated coefficient. We need enough relevant variation to distinguish the effect represented by that coefficient.</p>
                <p>The SDK’s <code>SimpleLinearRegression</code> class rejects a constant input column because its interface promises an identified slope. A separate constant predictor can still return the mean weight.</p>
              </InAModel>
            </SubSection>
          ),
        },
        {
          title: "Part 8. Boundaries of the Model",
          content: (
            <>
              <SubSection title="23. Outliers and squared error">
                <p>
                  Drag one dot in the box at the top well away from the others and
                  watch the line lean toward it. That pull is the squaring from
                  section 7 doing exactly what it was chosen to do, since a
                  residual of 10 contributes a hundred where a residual of 2
                  contributes four.
                </p>
                <p>The scatter plot alone does not identify why an observation is unusual. It could be a rare observation from the intended population, a recording error, a different population, or a relationship affected by an unrecorded variable. We need information about how that record was produced before choosing a response.</p>
                <p>The response depends on where the unusual observation came from and which population the prediction should describe. A documented measurement error may need correction. A genuine observation from the intended population needs investigation rather than automatic removal because it fits poorly.</p>
              </SubSection>

              <SubSection title="24. Extrapolation">
                <p>
                  The people measured here run from 160 to 180 cm. A prediction
                  inside that range interpolates, and the data has something to
                  say about it. A prediction well outside it extrapolates, and the
                  data has not been asked.
                </p>
                <p>
                  The line does not know the difference. It continues in both
                  directions forever, which is how it produced an intercept of
                  −68 kg at a height of zero, and that number is what the
                  arithmetic says rather than what anyone should believe.
                </p>
                <p>An intercept can position a useful fitted line even when its prediction at zero has no physical interpretation. Check the input range before interpreting that coefficient as a prediction about an actual person.</p>
              </SubSection>

              <SubSection title="25. Association, causation, and generalization">
                <p>
                  Two last boundaries, both about what the fit is evidence for.
                </p>
                <p>
                  A regression quantifies an association. Height and weight move
                  together in this data and the slope says by how much, and none
                  of that establishes that one produces the other. Other things
                  affect both, and the model has no way to distinguish a direct
                  influence from a shared cause. The slope is not a prediction
                  about what would happen if somebody grew taller.
                </p>
                <p>
                  And the R² of 0.909 describes how well the line fits the five
                  people used to build it. That is not the same question as how
                  well it predicts a sixth person, and a model can score well on
                  the first while doing poorly on the second.
                </p>
                <InAModel>
                  <p>Holding observations aside before fitting gives us a separate check of prediction performance. The held-out evaluation page distinguishes that evidence from how closely a model fits the observations used to choose its coefficients.</p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 to 8",
          quiz: [
            choice(
              "Where does the fact that the residuals add to zero come from?",
              [
                "Setting the derivative of the score with respect to the intercept to zero",
                "Setting the derivative with respect to the slope to zero",
                "It was imposed on the model as a constraint before any fitting happened",
                "It holds for any model that fits its data closely enough",
              ],
              0,
              "It fell out of asking for the flattest point in the intercept direction, so the intercept equation simply is the statement that the residuals sum to zero. Nothing imposed it, and fitting without an intercept or by a different loss generally loses it.",
            ),
            trueFalse(
              "Setting both derivatives to zero is on its own enough to know the answer found is the lowest point of the surface.",
              false,
              "Zero derivatives alone do not rule out a maximum. Here the loss is a sum of squared expressions that are affine in the slope and intercept, giving an upward-curving convex surface. A stationary solution is therefore a global minimum. It is unique when the inputs have nonzero variation; constant inputs leave a flat direction of equally good coefficients.",
            ),
            choice(
              "Suppose all five people are exactly 170 cm tall, with the weights unchanged. What has actually failed?",
              [
                              "How the prediction should change as height changes cannot be determined, though a prediction at 170 cm is still available",
                              "There is no line at all, so no prediction can be made",
                              "The mean weight of 68 kg stops being the best constant guess",
                              "The slope is still computable, but is almost entirely noise",
                            ],
              0,
              "Constant heights leave no height deviations from which to identify a slope. Every slope paired with an appropriate intercept can give the same mean-weight prediction at 170 cm. With very little height variation, the slope may still be computable, but small measurement changes can have a large effect on it.",
              {
                "description": "The five weights are 58, 66, 68, 74 and 74 kg. Replace every height with 170 cm. Fit unpenalized least squares with an intercept."
              },
            ),
            several(
              "A point sits well away from the others and the line leans toward it. Which of these hold?",
              [
                "The pull is the squaring doing what it was chosen to do, since a residual of 10 contributes a hundred where a residual of 2 contributes four",
                "A confirmed measurement or entry error is a reason to correct the record, or exclude it if it cannot be recovered",
                "The scatter plot alone proves which process produced the unusual point",
                "Deleting whatever sits far from the line is a sound way to arrive at a model that is right"
              ],
              [0, 1],
              "Squaring gives a large residual a larger contribution to the objective. It does not identify the cause of that residual. An unusual point may be genuine, mistyped, outside the target population or evidence of a missing input. Investigate its origin and the intended prediction population before deciding whether to correct, keep or exclude it.",
            ),
            trueFalse(
              "An R-squared of 0.909 on the five training people does not, by itself, establish how accurately the line will predict a sixth person.",
              true,
              "Training R-squared describes these fitted observations. It may be encouraging, but cannot substitute for evaluation on new cases. Holding data out before fitting or using an appropriate cross-validation scheme helps estimate predictive performance on comparable unseen observations.",
            ),
        ],
        },
        {
          title: "Practice. Fitting the Five People With the Library",
          practice: [
            exercise(
              "Fit the five people and predict a sixth",
              ["The five measured people give us a relationship to fit. Use SimpleLinearRegression on the supplied heights and weights, then ask the fitted model about a person who is 172 cm tall. This applies the calculation you worked through in the lesson.","Print the fitted slope in kilograms per centimeter, the intercept in kilograms, and the predicted weight. Keep the height and weight lists paired in their original order. Use the labels and precision in the required-output panel when printing."],
              `from oop_ml import SimpleLinearRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]

model = SimpleLinearRegression()
# Fit the model to the heights and weights, print its slope and intercept,
# and print the weight it predicts for a height of 172.`,
              `from oop_ml import SimpleLinearRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]

model = SimpleLinearRegression()
model.fit(heights, weights)

print(f"slope {model.slope:.4f} kg per cm")
print(f"intercept {model.intercept:.4f} kg")

predicted = float(model.predict([172])[0])
print(f"predicted weight at 172 cm {predicted:.2f} kg")`,
              `slope 0.8000 kg per cm
intercept -68.0000 kg
predicted weight at 172 cm 69.60 kg`,
              { hints: ["Create the model with SimpleLinearRegression(). Pass the data lists to its fit method, with heights first and weights second.", "After fitting, slope and intercept are properties of the model. Reading them before fit raises an error because no coefficients have been learned yet.", "predict takes a list of heights and answers one prediction per height, so a single height still goes in as a list of one."], check: numberCheck("What weight does the model predict for 172 cm, in kilograms?", 69.6, 0.05, "The prediction reads the fitted line at a height inside the observed range. Its output is an estimate in kilograms, rather than a new measurement of that person. Being inside the range avoids extrapolation, but does not establish that this small sample describes everyone."), question: "What weight does the line predict for someone we have not measured?" },
            ),
            exercise(
              "Score the line against the flat guess",
              ["The first challenge produced a fitted line. This starter fits that same line again so the challenge can run on its own. Compare its squared prediction errors with the errors of the constant mean-weight prediction.","Print the residual sum of squares, total sum of squares and R squared from the evaluation. Independently recover R squared from the two sums, then print mean squared error. Keep the supplied labels and precision so the tests can identify each result."],
              `from oop_ml import SimpleLinearRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]

model = SimpleLinearRegression().fit(heights, weights)
evaluation = model.evaluate(heights, weights)
# Print the residual sum of squares, the total sum of squares, R squared,
# one minus RSS over TSS, and the mean squared error.`,
              `from oop_ml import SimpleLinearRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]

model = SimpleLinearRegression().fit(heights, weights)
evaluation = model.evaluate(heights, weights)

rss = evaluation.residual_sum_of_squares
tss = evaluation.total_sum_of_squares
print(f"RSS {rss:.1f}")
print(f"TSS {tss:.1f}")
print(f"R squared {evaluation.r2_score:.4f}")
print(f"1 - RSS / TSS {1 - rss / tss:.4f}")
print(f"mean squared error {evaluation.mean_squared_error:.2f}")`,
              `RSS 16.0
TSS 176.0
R squared 0.9091
1 - RSS / TSS 0.9091
mean squared error 3.20`,
              { hints: ["evaluate returns an evaluation object that pairs each prediction with its observed weight. Read the reported quantities as properties of that object.", "The evaluation object also contains the residuals. Squaring and summing those values provides an independent check on residual_sum_of_squares, allowing for ordinary floating-point rounding."], check: numberCheck("What mean squared error does the evaluation report?", 3.2, 0.01, "Mean squared error averages the squared residuals over the five observations. It has units of squared kilograms, as does each squared residual. Averaging removes the direct dependence on the number of entries, but comparisons across populations still require comparable targets and sampling."), question: "How much does the fitted line improve on predicting the same weight for everyone?" },
            ),
            exercise(
              "Swap the roles",
              ["The scatter contains the same pairs when we exchange the axes, but the prediction question changes. Fit a second model with weight as the input and height as the target.","Print both slopes with their units, the reciprocal of the forward slope, and the product of the two fitted slopes. Use those values to investigate whether reversing a fitted prediction is equivalent to solving its equation backwards."],
              `from oop_ml import SimpleLinearRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]

forward = SimpleLinearRegression().fit(heights, weights)
# Fit a second model that predicts height from weight, then print its slope,
# the reciprocal of the forward slope, and the product of the two slopes.`,
              `from oop_ml import SimpleLinearRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]

forward = SimpleLinearRegression().fit(heights, weights)
reverse = SimpleLinearRegression().fit(weights, heights)

print(f"forward slope {forward.slope:.4f} kg per cm")
print(f"reverse slope {reverse.slope:.4f} cm per kg")
print(f"reciprocal of the forward slope {1 / forward.slope:.4f}")
print(f"product of the two slopes {forward.slope * reverse.slope:.4f}")`,
              `forward slope 0.8000 kg per cm
reverse slope 1.1364 cm per kg
reciprocal of the forward slope 1.2500
product of the two slopes 0.9091`,
              { hints: ["The same class fits either way round. What changes is which list goes first in fit.", "Least squares minimizes vertical misses, and swapping the roles changes which measurement is vertical. That is why the two lines differ."], check: numberCheck("What slope does the reversed fit report, in centimeters per kilogram?", 1.1364, 0.001, "The reverse model minimizes height errors, while the forward model minimizes weight errors. Ordinary least squares therefore produces different lines for these imperfect pairs. Their slope product equals squared correlation here because both fits use the same paired observations, fitted intercepts and nonzero variances."), question: "Does predicting height from weight recover the same fitted line?" },
            ),
            exercise(
              "Ask for a line that cannot be identified",
              ["All five people now have the same height, while their weights still differ. There is no variation in the input from which to identify a unique slope. Investigate how this SDK handles that case.","Attempt the fit, catch MLLibError, and print the exception's class name followed by its message. A constant mean-weight predictor could still be defined, but this class declines to report an identified regression slope."],
              `from oop_ml import SimpleLinearRegression, MLLibError

heights = [170, 170, 170, 170, 170]
weights = [58, 66, 68, 74, 74]

# Try to fit the line. Catch the library's own error, and print the
# name of its class and its message.`,
              `from oop_ml import SimpleLinearRegression, MLLibError

heights = [170, 170, 170, 170, 170]
weights = [58, 66, 68, 74, 74]

try:
    SimpleLinearRegression().fit(heights, weights)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)`,
              `AllSameValuesError
input_values must not be constant (zero variance)`,
              { hints: ["The denominator used for the slope depends on variation in height. It is zero for this input, even though the weights vary.","Put the fit inside try and except MLLibError. type(error).__name__ gives the exception class name; str(error) gives its message."], question: "Can these constant heights identify a unique regression slope?" },
            ),
          ],
        },
      ]}
    />
  );
}
