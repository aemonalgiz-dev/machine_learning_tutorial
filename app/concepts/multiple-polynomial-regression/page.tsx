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
import { ContributionComposer } from "@/components/widgets/ContributionComposer";
import { DegreeSweepChart } from "@/components/widgets/DegreeSweepChart";
import { DesignMatrixBuilder } from "@/components/widgets/DesignMatrixBuilder";
import { DuplicateColumnsSlider } from "@/components/widgets/DuplicateColumnsSlider";
import { GapCurveChart } from "@/components/widgets/GapCurveChart";
import { HoldOutPlayground } from "@/components/widgets/HoldOutPlayground";
import { LiftedFeaturePlayground } from "@/components/widgets/LiftedFeaturePlayground";
import { PlaneSlicesPlayground } from "@/components/widgets/PlaneSlicesPlayground";
import { PolynomialAssembler } from "@/components/widgets/PolynomialAssembler";
import { PolynomialPlayground } from "@/components/widgets/PolynomialPlayground";
import { ResidualPatternChart } from "@/components/widgets/ResidualPatternChart";

export const metadata: Metadata = {
  title: "Multiple & Polynomial Regression · oop_ml",
  description:
    "Add more measurements or curved features while keeping the same idea of fitting coefficients.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function MultiplePolynomialRegressionPage() {
  return (
    <ConceptPage
      lessonId="multiple-polynomial-regression"
      intuition={lessonIntuitions["multiple-polynomial-regression"]}
      technicalStart="Part 3. Features Can Be Constructed"
      openingTitle="When One Input Cannot Explain Enough"
      playgroundIntro="Compare how the prediction changes when another input or a higher polynomial degree is available. A closer fit to the displayed points is only the first check."
      title="Multiple & Polynomial Regression"
      tagline="Add more measurements or curved features while keeping the same idea of fitting coefficients."
      prerequisites={
        <>
          This page builds directly on{" "}
          <Link href="/concepts/simple-linear-regression" className={linkClass}>
            simple linear regression
          </Link>
          , and the matrix form at the end leans on the{" "}
          <Link href="/primers/linear-algebra" className={linkClass}>
            linear algebra primer
          </Link>
          &rsquo;s vectors, dot products and matrix multiplication.
        </>
      }

      playground={<PlaneSlicesPlayground />}
      sections={[
        {
          title: "Part 1. From One Input to Several",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Why one input may not be enough">
                <p>
                  Simple regression predicted weight from height alone, and
                  height alone runs out quickly. People of the same height
                  weigh different amounts, and a line that only reads height
                  has to give all of them the same answer.
                </p>
                <WorkedExample>
                  <p>
                    Two of the twenty people in the box above are 168 cm tall.
                    One is 31 and weighs 64.9 kg, the other is 60 and weighs
                    74.3 kg. A line fitted on height alone predicts 67.24 kg
                    for both, because 168 is all it can see.
                  </p>
                  <p>
                    Let the model read age as well and the two predictions
                    part company, 64.95 kg for the younger person and 69.41 kg
                    for the older one. Neither is exact. Both are closer than
                    the single number the line was forced to give.
                  </p>
                </WorkedExample>
                <p>
                  That is the whole motivation. Some of the difference between
                  people of one height goes with another measured variable, and
                  multiple regression lets several inputs contribute to one
                  prediction.
                </p>
              </SubSection>

              <SubSection title="2. Building a prediction from several contributions">
                <p>
                  Take one person before taking a whole dataset. With two
                  inputs the prediction is
                </p>
                <Equation>{"ŷ = β₁x₁ + β₂x₂ + α"}</Equation>
                <p>
                  and it is easiest to read as three separate pieces that get
                  added up.
                </p>
                <NumberTable
                  headings={["Contribution", "Calculation"]}
                  rows={[
                    ["height contribution", "β₁ × height"],
                    ["age contribution", "β₂ × age"],
                    ["intercept", "α"],
                    ["prediction", "the sum of all three"],
                  ]}
                />
                <p>
                  Below, the three pieces are laid end to end along a number
                  line. The coefficients start at the values the fit chose for
                  the twenty people, and every slider is yours after that. Push
                  the age coefficient negative and watch its block turn round
                  and walk the prediction backwards.
                </p>
                <ContributionComposer />
                <p>
                  Each input contributes its value multiplied by its
                  coefficient, and the contributions are added. That sentence
                  is the entire model, and everything else on this page is
                  either a way of seeing it or a way of fitting it.
                </p>
              </SubSection>

              <SubSection title="3. The dot-product form">
                <p>
                  Once the pieces are familiar, group them. Put the inputs in
                  one vector and the coefficients in another,
                </p>
                <Equation>{"x = (x₁, x₂)        β = (β₁, β₂)"}</Equation>
                <p>and the weighted sum collapses to a dot product.</p>
                <DerivationTable
                  rows={[
                    { expression: "β₁x₁ + β₂x₂ + α", reason: "the sum from section 2" },
                    { expression: "(x₁, x₂) · (β₁, β₂) + α", reason: "the same products, written as a dot product" },
                    { expression: "x · β + α", reason: "the vectors named" },
                  ]}
                />
                <p>
                  Nothing was added and nothing was hidden. The dot product is
                  compact notation for the weighted sum already calculated by
                  hand, and the{" "}
                  <Link href="/primers/linear-algebra" className={linkClass}>
                    linear algebra primer
                  </Link>{" "}
                  called it the shape of every linear prediction for exactly
                  this reason. With twenty inputs the expression stays three
                  symbols long.
                </p>
              </SubSection>

              <SubSection title="4. Reading one coefficient">
                <p>
                  Take the height coefficient first. Hold age at one value,
                  raise height by one centimetre, and read the prediction
                  again.
                </p>
                <WorkedExample>
                  <NumberTable
                    headings={["", "Record A", "Record B", "Record C"]}
                    rows={[
                      ["height", "170", "171", "170"],
                      ["age", "35", "35", "36"],
                      ["prediction", "66.86 kg", "67.51 kg", "67.02 kg"],
                    ]}
                    caption="A to B changes height alone and the prediction moves by 0.651 kg, the height coefficient. A to C changes age alone and it moves by 0.154 kg, the age coefficient."
                  />
                </WorkedExample>
                <p>
                  So a coefficient describes how the prediction changes with
                  one input while the other inputs in the model stay where they
                  are. Any two records that differ in one input only will
                  differ in prediction by exactly that input&rsquo;s
                  coefficient.
                </p>
                <KeepInMind>
                  <p>
                    &ldquo;Holding the others fixed&rdquo; describes the
                    coefficient mathematically. It does not promise that the
                    dataset contains that comparison. If height and age are
                    strongly related in the data, or if some combinations barely
                    occur, then the coefficient is resting on comparisons the
                    data represents thinly, and it can swing a long way when a
                    few rows change. In the twenty people here, taller people
                    are on the whole younger, with a correlation of −0.46, so
                    &ldquo;same age, one centimetre taller&rdquo; is a
                    comparison the data supports less well than the arithmetic
                    suggests.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Seeing Multiple Regression Geometrically",
          content: (
            <>
              <SubSection title="5. From a line to a plane">
                <p>
                  With one input the prediction rule was a line. Give it a
                  second input and the rule needs another direction to change
                  in.
                </p>
                <NumberTable
                  headings={["Inputs", "Prediction shape"]}
                  rows={[
                    ["one", "a line"],
                    ["two", "a plane"],
                    ["three or more", "a flat surface in more dimensions than can be drawn"],
                  ]}
                />
                <p>
                  Picture the height-and-weight scatter from the regression
                  page, height across and weight up, with its fitted line. Now
                  let age run into the depth of the page. Every person moves
                  back or forward according to their age, and the line, which
                  had no opinion about depth, extends into a sheet that can tilt
                  along the new direction too. That sheet is the plane in the
                  box at the top of the page, and pressing &ldquo;face the
                  height axis&rdquo; up there looks along the age direction so
                  the room flattens back into the familiar scatter.
                </p>
                <p>
                  Adding a second input gives the prediction rule one more
                  direction it can change in. That is all a plane is.
                </p>
              </SubSection>

              <SubSection title="6. Slicing the regression plane">
                <p>
                  A plane is hard to read as a whole and easy to read one
                  direction at a time. The two flat panels under the room are
                  cuts through it.
                </p>
                <p>
                  Fix an age and the plane seen against height is a straight
                  line, drawn in indigo on the wireframe, and its slope is the
                  height coefficient, 0.651 kg per centimetre. Fix a height and
                  the plane seen against age is another straight line, in amber,
                  with slope 0.154 kg per year. Slide either fixed value and
                  the cut moves across the plane while its slope does not
                  change, because a plane tilts by the same amount everywhere.
                </p>
                <p>
                  That is section 4&rsquo;s &ldquo;holding the other input
                  fixed&rdquo; made literal. A coefficient is the slope of the
                  plane along one axis, and the cut is what you see when you
                  stand at a fixed value of the other axis and look.
                </p>
              </SubSection>

              <SubSection title="7. Residuals and least squares in several dimensions">
                <p>
                  The people do not sit on the plane, and that part is
                  familiar. Each person has a measured weight, the plane
                  produces a predicted weight at their height and age, and the
                  vertical gap between them is the residual, exactly as on the
                  regression page.
                </p>
                <Equation>{"eᵢ = yᵢ − ŷᵢ"}</Equation>
                <p>
                  Switch on the residual drops in the box above to see them,
                  green where the person sits above the plane and rose where
                  they sit below it. The residual sum of squares still squares
                  and adds those drops, 214.2 for the twenty people, and the
                  fit is still the plane that makes that total as small as it
                  can be. R² reads 0.865, the share of the weight variation
                  that height and age explain together.
                </p>
                <p>
                  Multiple regression changes the shape of the prediction
                  surface and nothing about how it is judged. Residuals, RSS
                  and the least-squares rule carry over untouched.
                </p>
              </SubSection>

              <SubSection title="8. Fitting coefficients together">
                <p>
                  It is tempting to imagine the fit working one input at a
                  time, fitting height, locking it, then fitting age on what is
                  left. It does not, and the twenty people show why it cannot.
                </p>
                <WorkedExample>
                  <NumberTable
                    headings={["Model", "kg per cm of height", "kg per year of age"]}
                    rows={[
                      ["height alone", "0.574", ""],
                      ["age alone", "", "−0.119"],
                      ["height and age together", "0.651", "+0.154"],
                    ]}
                    caption="The age coefficient changes sign. On its own age appears to go with lower weight, because taller people in this sample happen to be younger. Beside height, which absorbs that, age goes with higher weight."
                  />
                </WorkedExample>
                <p>
                  Changing one coefficient changes what the others need to do,
                  so the fit chooses all of them at once. RSS is a bowl over
                  every coefficient together, the same bowl the regression
                  page drew over a slope and an intercept, with one more
                  direction per input, and the least-squares answer is its one
                  lowest point. Each coefficient is chosen in the context of
                  every other input in the model, which is why adding or
                  removing an input can move every coefficient, not only the
                  one that came or went.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Features Can Be Constructed",
          content: (
            <>
              <SubSection title="9. Constructing features">
                <p>
                  Now the thrown ball. Its height rises and then falls, and a
                  straight line cannot rise and then fall, however it is
                  placed. A model with transformed input columns can fit a curve, though, and it
                  does not need a second measurement to do it. A new input can
                  be calculated from an old one.
                </p>
                <p>
                  Start with time t, and manufacture t² from it.
                </p>
                <NumberTable
                  headings={["time t", "squared time t²"]}
                  rows={[
                    ["0", "0"],
                    ["1", "1"],
                    ["2", "4"],
                    ["3", "9"],
                    ["4", "16"],
                  ]}
                  caption="A second column, built from the first before any fitting starts."
                />
                <p>
                  A model can receive transformed versions of an existing input
                  as extra inputs, and the fit neither knows nor cares that one
                  column was made from another. Polynomial regression is
                  nothing more than this. It builds the power columns and hands
                  the widened table to the machinery of Parts 1 and 2.
                </p>
              </SubSection>

              <SubSection title="10. Adding t²">
                <p>The two-input model on those two columns is</p>
                <Equation>{"ĥ = β₁·t + β₂·t² + α"}</Equation>
                <p>
                  and it can be read two ways. As multiple regression it has
                  two inputs, t and t², two coefficients and an intercept, and
                  the prediction is still a weighted sum. As a function of time
                  it is curved, since a nonzero coefficient on t² makes a parabola.
                </p>
                <>
                  <p>
                    The two drawings show the same fit. On the left, time is plotted
                    against height, producing a parabola. On the right, time and squared
                    time are separate coordinates, and the fitted prediction is a plane.
                  </p>
                  <Equation>{"squared-time coordinate = t² = t × t"}</Equation>
                  <p>
                    Actual inputs cannot move freely around that plane: squared time is
                    determined by time. The highlighted path follows that constraint.
                    Reading the plane along this path gives the curve on the left.
                  </p>
                </>
                <LiftedFeaturePlayground />
                <p>
                  The table under the pictures fits the data twice, once as a
                  degree-2 curve in t and once as a plane over two inputs that
                  happen to be called t and t², and the two sets of numbers
                  agree to every digit. They are one fit. The curve in the
                  original input is a plane in the constructed features, which
                  is the page&rsquo;s central claim.
                </p>
              </SubSection>

              <SubSection title="11. How a linear model produces a curve">
                <p>
                  This deserves its own moment, because &ldquo;linear&rdquo;
                  is doing something specific. A model counts as linear
                  regression when its coefficients enter linearly,
                </p>
                <Equation>{"ŷ = β₁φ₁(x) + β₂φ₂(x) + α"}</Equation>
                <>
                  <p>
                    The feature functions may themselves be nonlinear. Here, one keeps
                    the original time and the other squares it.
                  </p>
                  <Equation>{"φ₁(t) = t\nφ₂(t) = t²"}</Equation>
                  <p>
                    The prediction is nonlinear in time but linear in the coefficients
                    being fitted. That second property is what allows the same linear
                    least-squares fitting method to work.
                  </p>
                </>
                <p>
                  Below, the five basic shapes 1, t, t², t³ and t⁴ are drawn
                  unscaled along the top. Each slider scales one of them, the
                  scaled shapes are dashed in their own colours, and the solid
                  line is their sum. The sliders start on the coefficients
                  recovered from the ideal throw.
                </p>
                <PolynomialAssembler />
                <p>
                  Every curve this widget can draw is assembled by adding
                  scaled copies of fixed shapes, and the only things a fit
                  chooses are the amounts. Polynomial regression produces a
                  curved prediction while remaining a linear model in the
                  parameters it learns, and that is why the straight
                  line&rsquo;s solver handles it without modification.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "Two of the twenty people are 168 cm tall, one aged 31 and weighing 64.9 kg, the other aged 60 and weighing 74.3 kg. What does the line fitted on height alone predict for them?",
              [
                "67.24 kg for both, because 168 is all it can see",
                "64.95 kg and 69.41 kg",
                "64.9 kg and 74.3 kg, since a fitted line passes through its data",
                "The mean weight of the twenty people",
              ],
              0,
              "A line that reads only height has to give everyone of one height the same answer. Letting the model read age as well is what parts the two predictions, to 64.95 kg and 69.41 kg. Neither of those is exact, and both are closer than the single number the line was forced to give.",
            ),
            trueFalse(
              "A coefficient describes how the prediction changes with one input while the others stay where they are, so the dataset must contain that comparison.",
              false,
              "Holding the others fixed describes the coefficient mathematically and promises nothing about the data. Among these twenty people taller people are on the whole younger, with a correlation of −0.46, so same age and one centimetre taller is a comparison the data supports less well than the arithmetic suggests. A coefficient resting on thinly represented comparisons can swing a long way when a few rows change.",
            ),
            several(
              "Which of these hold for the plane fitted to the twenty people?",
              [
                "Fix an age and read the plane against height, and the cut is a straight line whose slope is the height coefficient, 0.651 kg per centimetre",
                "The residual is the vertical gap between a person’s measured weight and the plane’s prediction, and squaring and adding those gaps gives 214.2 for the twenty people",
                "Sliding the fixed age across its range changes the slope of the height cut",
                "The fit works one input at a time, fitting height, locking it, then fitting age on what is left",
              ],
              [0, 1],
              "A plane tilts by the same amount everywhere, so moving the cut changes where it sits and never its slope, and 0.651 is section 4’s one centimetre taller at a fixed age made literal. The fit cannot go one input at a time because changing one coefficient changes what the others need to do, so least squares chooses all of them at once as the single lowest point of one bowl over every coefficient together. Residuals, RSS and the least-squares rule carry over from the straight line untouched.",
            ),
            choice(
              "Why does polynomial regression still count as linear regression?",
              [
                "Its coefficients enter linearly, whatever the feature functions do to the input",
                "Its predictions are a straight line in the original input",
                "The powers of t are themselves linear functions of t",
                "It is linear up to degree 1 and only approximately linear above that",
              ],
              0,
              "The feature functions may be nonlinear, and here one keeps the original time while the other squares it. The prediction is nonlinear in time and linear in the coefficients being fitted, and that second property is what lets the straight line’s own solver handle it without modification.",
            ),
            trueFalse(
              "The degree-2 curve in t and the plane over the two columns t and t² are one fit, and the two sets of numbers agree to every digit.",
              true,
              "The data is fitted twice, once as a curve in t and once as a plane over inputs that happen to be called t and t², and the numbers agree to every digit because the fit neither knows nor cares that one column was made from the other. Squared time is determined by time, so the actual inputs follow a path across that plane rather than moving freely over it, and reading the plane along that path gives the curve.",
            ),
        ],
        },
        {
          title: "Part 4. Work the Ball Example",
          content: (
            <>
              <SubSection title="12. The ball's physical relationship">
                <p>
                  Physics writes the height of a thrown ball as
                </p>
                <Equation>{"h(t) = h₀ + v₀·t − ½·g·t²"}</Equation>
                <p>
                  with h₀ the starting height, v₀ the vertical launch speed and
                  g the acceleration due to gravity. Line that up against the
                  regression and every term has a partner.
                </p>
                <NumberTable
                  headings={["Regression term", "Physical meaning"]}
                  rows={[
                    ["α", "starting height h₀"],
                    ["β₁", "launch speed v₀"],
                    ["β₂", "−½ g, negative one half of gravity’s acceleration"],
                  ]}
                />
                <>
                  <p>
                    The simulated throw starts at ground level with an upward speed of
                    twenty metres per second.
                  </p>
                  <Equation>{"height h(t) = 20t − 4.9t²\ngravity magnitude g = −2 × coefficient on t²\n                    = −2 × (−4.9) = 9.8 m/s²"}</Equation>
                  <p>
                    The coefficient of squared time is minus half the gravitational
                    acceleration. Its value is not the acceleration itself.
                  </p>
                </>
              </SubSection>

              <SubSection title="13. Recovering the ideal curve">
                <p>
                  Take the noiseless case first. Five exact readings of the
                  throw at t = 0, 1, 2, 3 and 4 are the &ldquo;ideal
                  case&rdquo; button below. Press it, set the degree to 2, and
                  read the chips.
                </p>
                <PolynomialPlayground />
                <WorkedExample title="What comes back">
                  <NumberTable
                    headings={["", "generating equation", "recovered by the fit"]}
                    rows={[
                      ["intercept", "0", "0.00"],
                      ["on t", "20", "20.00"],
                      ["on t²", "−4.9", "−4.90"],
                      ["R²", "", "1.000"],
                    ]}
                  />
                  <p>
                    The steps were exactly the ones Part 3 described. Generate
                    exact heights, construct the t² column, fit two inputs,
                    read off the coefficients. Nothing in the fit knows any
                    physics. It minimised squared misses over a table with a t
                    column and a t² column, and the physics came out because
                    the physics is what generated the data.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  <p>
                    R² is exactly 1 here and that is the correct answer, not a
                    warning. The data has no noise and the model has the right
                    form, so a perfect score is what should happen. Section 21
                    is about when the same number means something else.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Comparing degrees zero, one, and two">
                <p>
                  Do not jump from a straight line to a degree-9 curve. The
                  useful comparison is the three smallest models on the same
                  five ideal points.
                </p>
                <NumberTable
                  headings={["Degree", "Can do", "Fitted rule", "RSS", "R²"]}
                  rows={[
                    ["0", "one constant, no relationship with time", "ĥ = 10.6", "337.74", "0.000"],
                    ["1", "rise or fall, never both", "ĥ = 0.4·t + 9.8", "336.14", "0.005"],
                    ["2", "one turning point", "ĥ = 20·t − 4.9·t²", "0.00", "1.000"],
                  ]}
                  caption="Degree 0 is the mean of the heights, the baseline R² measures against. Drag the degree slider above between 1 and 2 to see the middle two."
                />
                <p>
                  The straight line barely improves on the mean, because the
                  best line through a symmetric arc is almost flat. The
                  parabola explains everything. The difference between a
                  useless model and a perfect one was one manufactured column,
                  and the lesson is that a model can fail because the inputs
                  it was given cannot express the pattern in the data.
                </p>
              </SubSection>

              <SubSection title="15. Residual patterns and underfitting">
                <p>
                  The degree-1 model is not just worse by the numbers. Its
                  misses have a shape. Plot each residual against time and the
                  line&rsquo;s residuals are negative at both ends and
                  positive in the middle, which is the arc it could not draw,
                  left over in the errors.
                </p>
                <ResidualPatternChart />
                <p>
                  On the ideal throw the parabola&rsquo;s residuals are zero.
                  On the noisy throw they are a scatter with no obvious curve,
                  which is what residuals look like when the model has taken
                  the structure and left the noise. A visible pattern in the
                  residuals says the model has left systematic structure
                  unexplained, and that is worth checking on any fit, not only
                  polynomial ones.
                </p>
                <p>
                  This has a name. A model too rigid to represent the pattern
                  in the data is underfitting. It shows large systematic
                  residuals, a poor training score and poor predictions, and
                  on the ball the straight line is the textbook case.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Increasing Polynomial Degree",
          content: (
            <>
              <SubSection title="16. What polynomial degree permits">
                <p>
                  Each degree adds one power of t as a new column, and each
                  power buys the curve the possibility of one more turn.
                </p>
                <NumberTable
                  headings={["Degree", "Highest power", "Turning points at most"]}
                  rows={[
                    ["1", "t", "0"],
                    ["2", "t²", "1"],
                    ["3", "t³", "2"],
                    ["d", "tᵈ", "d − 1"],
                  ]}
                />
                <p>
                  The word is permits. A higher degree allows a more complex
                  shape and does not require it. A degree-4 curve may turn
                  three times, and the fitted coefficients decide how many of
                  those turns actually appear. On the ideal throw a degree-4
                  fit puts 0.00 on t³ and 0.00 on t⁴ and draws the same
                  parabola as degree 2, because the extra turns would not help.
                  Section 11&rsquo;s sliders are the place to feel this. Every
                  shape is available and the amounts decide which powers contribute to the curve
                  up.
                </p>
              </SubSection>

              <SubSection title="17. Adding measurement noise">
                <p>
                  Real readings of a thrown ball carry error, a wobble of the
                  hand or the ruler that says nothing about the next throw.
                  The noise slider in section 13&rsquo;s box adds exactly that.
                  It takes fifteen exact readings of the same 20t − 4.9t²
                  throw and shifts each by its own draw, scaled to the amount
                  you choose, and the &ldquo;show the true throw&rdquo; box
                  draws the arc the readings came from.
                </p>
                <p>
                  What you see with noise on is three things at once. There is
                  the true height, dashed. There is the noise, the vertical gap
                  from the dashed curve to each dot. And there is the observed
                  height, the dot itself, which is all the model is ever shown.
                  The fit sees the measured values and not the hidden
                  relationship that produced them, and every question about
                  overfitting comes from that fact.
                </p>
              </SubSection>

              <SubSection title="18. Why training fit improves with degree">
                <p>
                  Now sweep the degree upward on the fifteen noisy readings,
                  refitting at each step and scoring on the same fifteen.
                </p>
                <DegreeSweepChart />
                <p>
                  The bars can only rise or hold still, and there is a formal
                  reason. The degree-3 model contains every degree-2 model,
                  since it can set the coefficient on t³ to zero and reproduce
                  the degree-2 fit exactly, and the same holds one degree up
                  from any degree. So the best degree-3 fit is at least as good
                  on the training rows as the best degree-2 fit, and it may use
                  the new column to do better. Training R² for nested models
                  can only rise or stay unchanged as terms are added.
                </p>
                <p>
                  Degree 2 reads 0.996 here and degree 9 reads 0.997, with 10
                  coefficients doing the work of 3. Every step past 2 bought
                  almost nothing on the training rows, and the next Part is
                  about what it cost.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Underfitting and Overfitting",
          content: (
            <>
              <SubSection title="19. Holding back data for evaluation">
                <p>
                  The argument against the high-degree curve is usually that
                  it looks implausible, and a stronger argument is available.
                  Split the readings. Fit on some of them and keep the rest
                  hidden, and let the hidden ones judge.
                </p>
                <p>
                  Below, four of the fifteen noisy readings are hidden from the
                  fit and from you. Pick a degree, decide where you think the
                  four missing dots fall, and then reveal them.
                </p>
                <HoldOutPlayground concealable />
                <p>
                  A model should be judged, at least in part, by observations
                  it did not use to fit itself. The training score measures how
                  well the curve fits where it was told to fit. The held-out
                  score measures whether what it learned travels.
                </p>
              </SubSection>

              <SubSection title="20. Overfitting">
                <p>
                  Trace both scores across every degree and the picture
                  arrives in one chart.
                </p>
                <GapCurveChart />
                <p>
                  Training R² climbs from 0.222 at degree 1 to 0.999 at degree
                  9 and never falls. The held-out score rises to 0.989 at
                  degree 2, holds near there through degree 5, drops to 0.693
                  at degree 6, and then collapses, −104 at degree 8 and −5479
                  at degree 9. A curve that scores 0.999 on the eleven readings
                  it was fitted to is wrong by street widths on the four it was
                  not.
                </p>
                <p>
                  That is overfitting. Flexibility improves the reproduction
                  of the training sample while harming predictions on new
                  observations. The signs are very low training error, large
                  and unstable coefficients, sensitivity to individual
                  measurements and residuals on the training data that are
                  tiny while errors elsewhere grow. At degree 9 the
                  coefficient on t⁴ is −229.5 and on t⁵ is +169.5, two huge
                  terms cancelling each other almost everywhere and not quite
                  cancelling between the points.
                </p>
              </SubSection>

              <SubSection title="21. When a perfect training score is meaningful">
                <p>
                  Section 13 scored 1.000 and was right to. Section 20 is
                  heading toward 1.000 and is wrong. The number is the same
                  and the situations are not.
                </p>
                <NumberTable
                  headings={["Case", "Training R² = 1", "What it means"]}
                  rows={[
                    ["noiseless quadratic data, degree 2", "expected", "the correct form recovered the exact relationship"],
                    ["noisy data, degree near the number of points", "suspicious", "the curve is likely reproducing the noise"],
                  ]}
                />
                <p>
                  A score becomes concerning because of how it was achieved
                  and whether the model generalises, and not merely because it
                  is high. Fourteen noisy points and a degree-13 curve will
                  score exactly 1 by threading every one of them, and that
                  says nothing about the fifteenth.
                </p>
              </SubSection>

              <SubSection title="22. Balancing model flexibility">
                <p>
                  Set the three fits from section 19 beside each other in your
                  head, degree 1, degree 2 and degree 9, all on the same
                  eleven training points and judged by the same four hidden
                  ones. The first is too stiff to follow the arc and misses
                  both groups. The second follows the arc and scores well on
                  both. The third follows the eleven exactly and misses the
                  four badly.
                </p>
                <p>
                  Too little flexibility leaves structure unfitted. Too much
                  reacts to the particular sample it was handed, noise
                  included. A useful model sits between those, and the way to
                  find it is performance on data outside the fit, which is the
                  question the{" "}
                  <Link href="/concepts/held-out-evaluation" className={linkClass}>
                    evaluation page
                  </Link>{" "}
                  takes up properly. None of the three is the simple model or
                  the advanced one. They differ in flexibility, and that is
                  the only axis this comparison is about.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            choice(
              "The ideal throw fits a coefficient of −4.9 on t². What gravitational acceleration does that imply?",
              [
                "9.8 m/s², because the coefficient is minus half of it",
                "4.9 m/s², which is the coefficient with its sign removed",
                "−4.9 m/s², read straight off the fit",
                "20 m/s², which is the launch speed",
              ],
              0,
              "Physics writes the squared-time term as minus half g, so the coefficient’s value is not the acceleration itself. Doubling it and changing the sign recovers 9.8. Nothing in the fit knows any physics, and the physics came out because the physics is what generated the data.",
            ),
            trueFalse(
              "On the ideal throw the degree-2 fit scores an R² of exactly 1, and that is the correct answer rather than a warning sign.",
              true,
              "The data has no noise and the model has the right form, so a perfect score is what should happen. The same number means something else on the noisy readings at a high degree, where it is reached by threading points rather than by having the right form. Fourteen noisy points under a degree-13 curve would score exactly 1 by threading every one of them and say nothing about the fifteenth.",
            ),
            several(
              "Which of these does the lesson say about raising the degree?",
              [
                "A higher degree allows a more complex shape and does not require it, so on the ideal throw a degree-4 fit puts 0.00 on t³ and 0.00 on t⁴ and draws the same parabola as degree 2",
                "Training R² for nested models can only rise or stay unchanged as terms are added",
                "On the fifteen noisy readings degree 9 scores far better on the training rows than degree 2 does",
                "The straight line through the five ideal readings improves substantially on the mean",
              ],
              [0, 1],
              "Each power buys the curve the possibility of one more turn, and the fitted coefficients decide how many appear, which is why the extra turns stay at zero on the ideal throw. A degree-3 model contains every degree-2 model, since it can put zero on t³, so its best training fit is at least as good, but on the noisy readings degree 2 reads 0.996 and degree 9 reads 0.997, ten coefficients doing the work of three. And the best line through a symmetric arc is almost flat, so on the ideal throw degree 1 scores 0.005 against the mean’s 0.000.",
            ),
            choice(
              "Across the degrees on the noisy readings, what does the held-out score do?",
              [
                "Rises to 0.989 at degree 2, holds near there through degree 5, then collapses to −5479 by degree 9",
                "Rises with degree throughout, as the training score does",
                "Peaks at degree 9, where the training score peaks too",
                "Falls steadily from degree 1 onward",
              ],
              0,
              "The training score climbs from 0.222 at degree 1 to 0.999 at degree 9 and never falls, while the held-out score drops to 0.693 at degree 6 and then collapses, reaching −104 at degree 8. A curve scoring 0.999 on the eleven readings it was fitted to is wrong by street widths on the four it was not.",
            ),
            several(
              "Which of these does the lesson name as signs of overfitting?",
              [
                "Very low training error",
                "Large and unstable coefficients",
                "Training residuals that are tiny while errors elsewhere grow",
                "Residuals negative at both ends and positive in the middle",
              ],
              [0, 1, 2],
              "The last is the underfitting signature, the arc the straight line could not draw left over in its errors. The other three travel together at degree 9, where the coefficient on t⁴ is −229.5 and on t⁵ is +169.5, two huge terms cancelling each other almost everywhere and not quite cancelling between the points.",
            ),
        ],
        },
        {
          title: "Part 7. Matrix Form",
          content: (
            <>
              <SubSection title="23. Building the design matrix">
                <p>
                  Everything so far can be written in one line if the data is
                  arranged as a matrix. Start from the table anyone would write
                  down for the ideal throw, and rearrange it in stages.
                </p>
                <DesignMatrixBuilder />
                <p>
                  The result is a matrix X with one row per observation and one
                  column per input, a coefficient vector β, and their product,
                  which is the vector of predictions.
                </p>
                <Equation>{"ŷ = Xβ"}</Equation>
                <p>
                  The leading column of ones is the intercept&rsquo;s seat. If
                  α is to live inside β, X has to carry a column that
                  multiplies it, and multiplying a column of ones by α adds the
                  same α to every prediction. Leave that column out and the
                  normal equations below solve for a model with no intercept
                  at all.
                </p>
              </SubSection>

              <SubSection title="24. Predicting the dataset with matrix multiplication">
                <p>
                  Choose one row of X in the third stage above, say row 2, and
                  it is the vector (1, 1, 1). Dot it with (α, β₁, β₂) and you
                  get
                </p>
                <Equation>{"ĥ₂ = α + β₁·1 + β₂·1 = 0 + 20 − 4.9 = 15.1"}</Equation>
                <>
                  <p>
                    This is section 2’s weighted sum for one observation. Row 4 contains
                    the intercept feature, time and squared time.
                  </p>
                  <Equation>{"row 4 prediction = (1, 3, 9) · (0, 20, −4.9)\n                 = 0 + 60 − 44.1\n                 = 15.9"}</Equation>
                  <p>
                    Matrix multiplication performs this dot product for every row at
                    once. The result is the whole column of predictions.
                  </p>
                </>
              </SubSection>

              <SubSection title="25. The normal equations">
                <p>
                  The derivation is the regression page&rsquo;s, in vector
                  form. The residuals are a vector, RSS is that vector dotted
                  with itself, and the bowl&rsquo;s floor is where every
                  partial derivative is zero at once.
                </p>
                <WhyThisWorks>
                  <DerivationTable
                    rows={[
                      { expression: "e = y − Xβ", reason: "the residuals, all of them, as one vector" },
                      { expression: "RSS = (y − Xβ)ᵀ(y − Xβ)", reason: "a vector dotted with itself is the sum of its squares" },
                      { expression: "∇β RSS = −2Xᵀ(y − Xβ)", reason: "differentiate with respect to every coefficient at once" },
                      { expression: "Xᵀ(y − Xβ) = 0", reason: "the floor of the bowl, gradient zero" },
                      { expression: "XᵀX β = Xᵀy", reason: "rearranged, the normal equations" },
                    ]}
                  />
                  <p>
                    With one input and the intercept column, the two rows of
                    XᵀX β = Xᵀy are exactly the two equations the regression
                    page solved by substitution. The powers of t change what
                    the columns of X hold and nothing about the derivation.
                  </p>
                </WhyThisWorks>
                <p>
                  Keeping track of shapes is most of the work of reading this,
                  so here they are for n observations and p columns of X,
                  where p counts the column of ones.
                </p>
                <NumberTable
                  headings={["Object", "Shape", "For the ideal throw"]}
                  rows={[
                    ["X", "n × p", "5 × 3"],
                    ["β", "p × 1", "3 × 1"],
                    ["y", "n × 1", "5 × 1"],
                    ["Xβ", "n × 1", "5 × 1"],
                    ["XᵀX", "p × p", "3 × 3"],
                    ["Xᵀy", "p × 1", "3 × 1"],
                  ]}
                  caption="Each multiplication is legal because the inner dimensions agree, and the normal equations are p equations in p unknowns."
                />
                <p>
                  The normal equations describe the condition the least-squares
                  solution satisfies. They do not say to compute (XᵀX)⁻¹Xᵀy by
                  forming the inverse, and in practice nobody should. A working
                  implementation solves the system directly, and numerical
                  libraries usually go further and avoid forming XᵀX at all,
                  using a QR decomposition or a singular value decomposition of
                  X, which are better behaved when columns are nearly
                  dependent. A unique solution also needs enough independent
                  information in the columns, which is the next section.
                </p>
              </SubSection>

              <SubSection title="26. Dependent feature columns">
                <p>
                  Suppose one column holds t and another holds 2t. The second
                  says nothing the first did not, and the fit has no way to
                  decide how much of the effect belongs to each.
                </p>
                <DuplicateColumnsSlider />
                <p>
                  Every position of the slider is a different pair of
                  coefficients and the identical set of predictions, so the
                  residuals are identical too and RSS gives the fit no reason
                  to prefer any of them. The bowl has a flat valley floor
                  instead of a single lowest point, XᵀX has no inverse, and
                  the normal equations have infinitely many solutions.
                </p>
                <p>
                  The name for this is collinearity, and for an exact copy
                  like 2t it is perfect multicollinearity. A coefficient
                  cannot be uniquely identified when its column can be
                  reconstructed from the others. The fit behind this page
                  refuses such a table outright rather than picking one of the
                  infinitely many answers, and the nearly-dependent case, where
                  two columns are almost but not quite copies, is one of the
                  things{" "}
                  <Link href="/concepts/ridge-lasso" className={linkClass}>
                    ridge regression
                  </Link>{" "}
                  exists to handle.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Boundaries and Forward Connections",
          content: (
            <>
              <SubSection title="27. Extrapolation and numerical scale">
                <p>
                  High-degree polynomials behave dramatically outside the
                  interval they were fitted on. Section 13&rsquo;s box has a
                  range control for this. Load the full throw, set the degree
                  to 9, and switch from the observed range to a little beyond
                  and then far beyond. The training points stay where they
                  are, and the curve leaves the frame.
                </p>
                <WorkedExample title="Two fits, past the last measurement">
                  <NumberTable
                    headings={["Time", "Degree 2 predicts", "Degree 9 predicts"]}
                    rows={[
                      ["6 s", "−56.7 m", "20,906 m"],
                      ["8 s", "−153.5 m", "1,130,430 m"],
                      ["−2 s", "−58.8 m", "−18,516 m"],
                    ]}
                    caption="Both fits score above 0.995 on the readings between 0 and 4 seconds. Neither has any idea what happens after."
                  />
                </WorkedExample>
                <p>
                  Even the parabola&rsquo;s answers are wrong, since a real ball
                  stops at the ground rather than continuing below it, and the
                  degree-9 curve is wrong by a kilometre within two seconds of
                  the last reading. A curve that fits well within the measured
                  interval may be unreliable the moment it leaves it, and
                  nothing in the training score can warn you.
                </p>
                <p>
                  A quieter problem comes from the columns themselves. The
                  powers of t live on very different scales.
                </p>
                <NumberTable
                  headings={["", "t", "t²", "t³", "t⁴"]}
                  rows={[
                    ["at t = 4", "4", "16", "64", "256"],
                    ["at t = 4 after centring t on 2", "2", "4", "8", "16"],
                  ]}
                  caption="Centring shifts the time axis so its middle is zero. The same throw, the same curve, and the largest column entry falls from 256 to 16."
                />
                <p>
                  Wide differences in scale make XᵀX badly conditioned, so its
                  solution swings on the last digits of the data. Centring and
                  scaling the input before raising it to powers is the usual
                  remedy, and the{" "}
                  <Link href="/concepts/feature-scaling" className={linkClass}>
                    feature scaling page
                  </Link>{" "}
                  takes that up in full.
                </p>
              </SubSection>

              <SubSection title="28. Where evaluation and regularization enter">
                <p>
                  This page ends on two questions it has raised and not
                  answered, and they are different questions.
                </p>
                <p>
                  How do we decide which degree predicts new data best?
                  Section 19 held back four readings once. Doing that
                  systematically, with every reading taking a turn as the
                  judge, is cross-validation, and choosing a degree by it is
                  what the{" "}
                  <Link href="/concepts/held-out-evaluation" className={linkClass}>
                    held-out evaluation
                  </Link>{" "}
                  and{" "}
                  <Link href="/concepts/grid-search" className={linkClass}>
                    grid search
                  </Link>{" "}
                  pages do.
                </p>
                <p>
                  How do we restrain a flexible model without throwing away
                  the inputs it needs? Keep the degree-9 columns and penalise
                  large coefficients, so the t⁴ and t⁵ terms cannot reach
                  −229 and +169 in the first place. That is{" "}
                  <Link href="/concepts/ridge-lasso" className={linkClass}>
                    ridge and lasso
                  </Link>
                  , and it also answers section 26&rsquo;s nearly-dependent
                  columns.
                </p>
                <InAModel>
                  <p>
                    Regularisation is one response to overfitting and not the
                    only one. Choosing a smaller degree, gathering more
                    readings, or selecting columns are all responses too, and
                    which is right depends on the question. What every one of
                    them needs is a way of scoring a model on data it did not
                    see, which is why evaluation comes before regularisation in
                    the order of this site.
                  </p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 7 and 8",
          quiz: [
            choice(
              "What is the leading column of ones in X for?",
              [
                "It is the intercept’s seat, since α needs a column to multiply",
                "It puts the other columns on a comparable scale",
                "It records how many observations there are",
                "It is what makes XᵀX invertible",
              ],
              0,
              "Multiplying a column of ones by α adds the same α to every prediction. Leave that column out and the normal equations solve for a model with no intercept at all. The column does nothing for invertibility, which needs enough independent information in the other columns, and nothing for scale, which is section 27’s separate problem.",
            ),
            trueFalse(
              "If one column holds t and another holds 2t, the normal equations have infinitely many solutions.",
              true,
              "The second column says nothing the first did not, so every pair of coefficients along that trade gives identical predictions, identical residuals and the same RSS. The bowl has a flat valley floor instead of a single lowest point and XᵀX has no inverse. The fit behind this page refuses such a table outright rather than picking one of the answers.",
            ),
            trueFalse(
              "The normal equations say to compute the solution by forming the inverse of XᵀX.",
              false,
              "They describe the condition the least-squares solution satisfies and say nothing about how to reach it. A working implementation solves the system directly, and numerical libraries usually avoid forming XᵀX at all, using a QR decomposition or a singular value decomposition, which behave better when the columns are nearly dependent.",
            ),
            choice(
              "A degree-9 fit on the full throw is read beyond the interval it was fitted on. What happens?",
              [
                "It is wrong by a kilometre within two seconds of the last reading, and nothing in the training score warns you",
                "It flattens out, because the high powers lose their influence",
                "It stays reliable, since it fitted the training points so closely",
                "It cannot be read outside the fitted range at all",
              ],
              0,
              "High-degree polynomials behave dramatically outside the interval they were fitted on. Even the parabola’s answers are wrong out there, since a real ball stops at the ground rather than continuing below it, so the fitted interval is a boundary on both models rather than only on the flexible one.",
            ),
            choice(
              "Why does the lesson say to centre and scale the input before raising it to powers?",
              [
                "The powers of t live on very different scales, which makes XᵀX badly conditioned, so its solution swings on the last digits of the data",
                "So that the degree-9 curve stays bounded beyond the last reading",
                "So that the column of ones can be left out of X",
                "So that the fitted curve passes through the origin",
              ],
              0,
              "At t = 4 the columns t, t², t³ and t⁴ read 4, 16, 64 and 256, and centring t on 2 brings the largest entry down to 16, the same throw and the same curve. This is a quieter problem than extrapolation and separate from it. Scaling does nothing about a curve read beyond the fitted interval, where even the parabola is wrong because a real ball stops at the ground.",
            ),
        ],
        },
        {
          title: "Practice. Fitting the Twenty People and the Thrown Ball",
          practice: [
            exercise(
              "Fit the plane to the twenty people",
              ["Fit weight from height and age together for the twenty people of Part 1, and read the two coefficients, the intercept, the residual sum of squares and R squared off the fitted model. Then ask it for the two 168 cm people, aged 31 and aged 60.", "Part 2 quotes a height coefficient of 0.651 kg per centimetre, an age coefficient of 0.154 kg per year, an RSS of 214.2 and an R squared of 0.865, and Part 1 quotes 64.95 kg and 69.41 kg for the two people. The intercept is the one number the page’s prose never quotes."],
              `from oop_ml import Feature, MultipleLinearRegression

heights = [186, 186, 173, 163, 152, 167, 168, 152, 152, 195, 179, 161, 170, 194, 190, 188, 168, 172, 180, 153]
ages = [48, 34, 64, 23, 54, 64, 31, 65, 64, 21, 55, 20, 45, 42, 30, 36, 60, 36, 27, 55]
weights = [82.5, 78.6, 67.8, 61.0, 55.7, 70.2, 64.9, 55.0, 60.1, 78.9, 78.8, 54.9, 70.7, 79.5, 77.2, 75.5, 74.3, 69.8, 78.8, 61.7]

inputs = [Feature("height", heights), Feature("age", ages)]
target = Feature("weight", weights)

# Fit the plane, print its two coefficients, its intercept, its RSS and
# its R squared, and print what it predicts for the two 168 cm people,
# aged 31 and aged 60.`,
              `from oop_ml import Feature, MultipleLinearRegression

heights = [186, 186, 173, 163, 152, 167, 168, 152, 152, 195, 179, 161, 170, 194, 190, 188, 168, 172, 180, 153]
ages = [48, 34, 64, 23, 54, 64, 31, 65, 64, 21, 55, 20, 45, 42, 30, 36, 60, 36, 27, 55]
weights = [82.5, 78.6, 67.8, 61.0, 55.7, 70.2, 64.9, 55.0, 60.1, 78.9, 78.8, 54.9, 70.7, 79.5, 77.2, 75.5, 74.3, 69.8, 78.8, 61.7]

inputs = [Feature("height", heights), Feature("age", ages)]
target = Feature("weight", weights)

model = MultipleLinearRegression().fit(inputs, target)
evaluation = model.evaluate(inputs, target)

print(f"height coefficient {model.coefficients['height']:.3f} kg per cm")
print(f"age coefficient {model.coefficients['age']:.3f} kg per year")
print(f"intercept {model.intercept:.2f} kg")
print(f"RSS {evaluation.residual_sum_of_squares:.1f}")
print(f"R squared {evaluation.r2_score:.3f}")

two_people = model.predict([Feature("height", [168, 168]), Feature("age", [31, 60])])
print(f"168 cm and 31 years {float(two_people[0]):.2f} kg")
print(f"168 cm and 60 years {float(two_people[1]):.2f} kg")`,
              `height coefficient 0.651 kg per cm
age coefficient 0.154 kg per year
intercept -49.12 kg
RSS 214.2
R squared 0.865
168 cm and 31 years 64.95 kg
168 cm and 60 years 69.41 kg`,
              { hints: ["A Feature is a named column, Feature(name, values). The model takes a list of them for the inputs and one more for the target, and the data goes to fit rather than to the constructor.", "Coefficients are read by name, model.coefficients['height'], so the order the features were given in never matters. The intercept is a property of its own.", "evaluate answers an object carrying the residual sum of squares and R squared as properties. predict takes the same named features with one value per person, so two people are two values in each list."], check: numberCheck("What intercept does the plane report, in kilograms?", -49.12, 0.01, "The intercept is the plane’s value at zero height and zero age, a person who does not exist, and it is negative because the plane has to pass through weights of 54.9 to 82.5 kg at heights of 152 to 195 cm and ages of 20 to 65. It is the α of section 2’s prediction, the piece every prediction starts from before the two contributions are added on.") },
            ),
            exercise(
              "Manufacture the power columns and recover the physics",
              ["Take the five exact readings of the throw from Part 4, manufacture the power columns with PolynomialFeatures, and fit them with the same MultipleLinearRegression that fitted the plane. Do it at degree 1, degree 2 and degree 4, printing each fit’s intercept, coefficients and R squared.", "Section 14 scored the straight line at 0.005 and the parabola at 1.000, and section 13 recovered 20 on t and −4.9 on t². Part 5 claims a degree-4 fit puts 0.00 on t³ and t⁴ and draws the same parabola. The gravity is minus two times the coefficient on t²."],
              `from oop_ml import Feature, MultipleLinearRegression, PolynomialFeatures

times = Feature("t", [0, 1, 2, 3, 4])
heights = Feature("h", [0, 15.1, 20.4, 15.9, 1.6])

for degree in [1, 2, 4]:
    # Build the power columns for this degree, fit them, and print the
    # intercept, every named coefficient and the R squared. At degree 2,
    # also print the gravity the t^2 coefficient implies.
    pass`,
              `from oop_ml import Feature, MultipleLinearRegression, PolynomialFeatures

times = Feature("t", [0, 1, 2, 3, 4])
heights = Feature("h", [0, 15.1, 20.4, 15.9, 1.6])

for degree in [1, 2, 4]:
    powers = PolynomialFeatures(degree=degree).fit([times])
    terms = powers.transform([times])
    model = MultipleLinearRegression().fit(terms, heights)
    fitted = ", ".join(f"{coefficient.name} {coefficient.value:.2f}" for coefficient in model.coefficients)
    print(f"degree {degree}: intercept {model.intercept:.2f}, {fitted}, R squared {model.score(terms, heights):.3f}")
    if degree == 2:
        print(f"gravity implied by the t^2 coefficient {-2 * model.coefficients['t^2']:.2f} m/s^2")`,
              `degree 1: intercept 9.80, t 0.40, R squared 0.005
degree 2: intercept 0.00, t 20.00, t^2 -4.90, R squared 1.000
gravity implied by the t^2 coefficient 9.80 m/s^2
degree 4: intercept -0.00, t 20.00, t^2 -4.90, t^3 0.00, t^4 -0.00, R squared 1.000`,
              { hints: ["PolynomialFeatures(degree=2) is fitted on the input features and then transforms them into the power columns, named t and t^2. Those columns go to MultipleLinearRegression like any other features.", "The coefficients iterate as named pairs, and one can also be read by name, so the gravity is -2 * model.coefficients['t^2'].", "A coefficient that prints as -0.00 is a number such as -3e-13, zero to every digit shown. The fit lands on the parabola to within rounding rather than exactly, which is what Part 5’s 0.00 on t³ and t⁴ means in practice."], check: numberCheck("What coefficient does the degree-2 fit put on t^2?", -4.9, 0.005, "The readings were generated by 20t − 4.9t², and the fit minimised squared misses over a table with a t column and a t² column, so the physics came out because the physics is what generated the data. Doubling the coefficient and changing its sign gives 9.8, the gravitational acceleration, because physics writes the squared-time term as minus half g.") },
            ),
            exercise(
              "Trace both scores across every degree",
              ["Reproduce the chart of Part 6. The page keeps back four of the fifteen noisy readings, the ones at t = 0, 0.29, 2.86 and 3.43, fits every degree from 1 to 9 on the other eleven, and scores each fit on both shares.", "The training score should climb from 0.222 to 0.999 and never fall. The held-out score should reach 0.989 at degree 2, hold near there through degree 5, drop to 0.693 at degree 6 and collapse to −5479 at degree 9. The page quotes degree 2’s held-out score and not degree 4’s."],
              `from oop_ml import Feature, MultipleLinearRegression, PolynomialFeatures

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
hidden = [0, 1, 10, 12]

training_times = Feature("t", [time for position, time in enumerate(times) if position not in hidden])
training_heights = Feature("h", [height for position, height in enumerate(heights) if position not in hidden])
hidden_times = Feature("t", [times[position] for position in hidden])
hidden_heights = Feature("h", [heights[position] for position in hidden])

for degree in range(1, 10):
    # Build the power columns from the training times only, fit on the
    # training share, and print the R squared on the training share and
    # on the hidden share.
    pass`,
              `from oop_ml import Feature, MultipleLinearRegression, PolynomialFeatures

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
hidden = [0, 1, 10, 12]

training_times = Feature("t", [time for position, time in enumerate(times) if position not in hidden])
training_heights = Feature("h", [height for position, height in enumerate(heights) if position not in hidden])
hidden_times = Feature("t", [times[position] for position in hidden])
hidden_heights = Feature("h", [heights[position] for position in hidden])

for degree in range(1, 10):
    powers = PolynomialFeatures(degree=degree).fit([training_times])
    model = MultipleLinearRegression().fit(powers.transform([training_times]), training_heights)
    training_score = model.score(powers.transform([training_times]), training_heights)
    held_out_score = model.score(powers.transform([hidden_times]), hidden_heights)
    print(f"degree {degree}: training R squared {training_score:.3f}, held-out R squared {held_out_score:.3f}")`,
              `degree 1: training R squared 0.222, held-out R squared -2.971
degree 2: training R squared 0.995, held-out R squared 0.989
degree 3: training R squared 0.996, held-out R squared 0.966
degree 4: training R squared 0.996, held-out R squared 0.993
degree 5: training R squared 0.996, held-out R squared 0.986
degree 6: training R squared 0.996, held-out R squared 0.693
degree 7: training R squared 0.997, held-out R squared -1.396
degree 8: training R squared 0.997, held-out R squared -104.059
degree 9: training R squared 0.999, held-out R squared -5479.352`,
              { hints: ["Fit the power columns on the training times only, then transform both the training times and the hidden times with that same fitted PolynomialFeatures, so the two shares are expanded the same way.", "score takes features and a target and answers R squared, so one call on the training share and one on the hidden share gives the two curves of Part 6.", "A held-out R squared below zero means the curve is worse on those four readings than a flat guess at their mean would have been."], check: numberCheck("What held-out R squared does the degree-4 fit reach?", 0.993, 0.001, "Degrees 2 to 5 all hold near 0.99 on the four hidden readings, the plateau Part 6 describes before the drop to 0.693 at degree 6, and degree 4 sits at the top of it. The eleven training readings can pin a parabola with a little to spare, and the extra columns neither help nor yet hurt until degree 6, where they start fitting the particular wobble of the eleven.") },
            ),
            exercise(
              "Hand the fit a column it cannot tell apart",
              ["Suppose we give the fit a time column and a second column containing twice every time. We have added a column, but have we added any information? Build the two columns for the five times below. Include the constant column used for the intercept, then ask NumPy how many independent columns the resulting table has.","Print the number of columns, the number of independent columns, and whether they are equal. That comparison tells us whether these measurements can determine one unique set of coefficients. We check the table directly because a numerical solver can sometimes return coefficients for a singular table without raising an error."],
              `import numpy as np

times = np.array([0.0, 1.0, 2.0, 3.0, 4.0])
# Stack a constant column, times, and twice times as columns of one table.
# Print its column count, its matrix rank, and whether the rank equals
# the number of columns.`,
              `import numpy as np

times = np.array([0.0, 1.0, 2.0, 3.0, 4.0])
design = np.column_stack([np.ones(len(times)), times, 2 * times])
rank = np.linalg.matrix_rank(design)
print("columns", design.shape[1])
print("independent columns", rank)
print("unique coefficients", bool(rank == design.shape[1]))`,
              `columns 3
independent columns 2
unique coefficients False`,
              {"hints":["np.column_stack puts the three arrays beside each other. Its shape tells you the row and column counts.","np.linalg.matrix_rank counts independent columns. The time column and twice-time column contribute only one independent direction between them."],"question":"Can the fit tell time apart from twice the same time?"},
            ),
          ],
        },
      ]}
    />
  );
}
