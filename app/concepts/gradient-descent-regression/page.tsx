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
import { ConditioningPlayground } from "@/components/widgets/ConditioningPlayground";
import { CurvatureComparison } from "@/components/widgets/CurvatureComparison";
import { DescentWalkPlayground } from "@/components/widgets/DescentWalkPlayground";
import { FactorNumberLine } from "@/components/widgets/FactorNumberLine";
import { LineSearchPlayground } from "@/components/widgets/LineSearchPlayground";
import { PassInspector } from "@/components/widgets/PassInspector";
import { RateMultiples } from "@/components/widgets/RateMultiples";
import { RateSweepTable } from "@/components/widgets/RateSweepTable";
import { TrajectoryDashboard } from "@/components/widgets/TrajectoryDashboard";

export const metadata: Metadata = {
  title: "Fitting by Walking · Perceptron Lab",
  description:
    "A fitted rule can be improved through repeated adjustments to its coefficients. The gradient describes how the error changes near the current settings, providing a direction in which to try reducing it.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function GradientDescentRegressionPage() {
  return (
    <ConceptPage
      lessonId="gradient-descent-regression"
      intuition={lessonIntuitions["gradient-descent-regression"]}
      technicalStart="Part 3. The Gradient as a Local Direction"
      openingTitle="Finding the Line Without Knowing the Answer"
      playgroundTitle="Can small adjustments find a better line?"
      playgroundIntro="Follow the current line and its error together. Compare a small learning rate with a larger one, and watch whether the error falls or grows."
      title="Fitting by Walking"
      tagline={"A fitted rule can be improved through repeated adjustments to its coefficients. The gradient describes how the error changes near the current settings, providing a direction in which to try reducing it."}
      prerequisites={
        <>
          The line being fitted and the loss being lowered are both from the{" "}
          <Link href="/concepts/simple-linear-regression" className={linkClass}>
            simple linear regression
          </Link>{" "}
          page, and the slope that says which way is downhill is the{" "}
          <Link href="/primers/calculus" className={linkClass}>
            calculus primer
          </Link>
          &rsquo;s derivative.
        </>
      }

      playground={<DescentWalkPlayground />}
      sections={[
        {
          title: "Part 1. Why Fit by Walking?",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The answer we already know">
                <p>

                  Three people, at 165 centimeters and 62 kilograms, 170 and 68,
                  and 175 and 68. The regression page&rsquo;s formula gives
                  their best line in one step, and it is the dashed line in the
                  box above.
                </p>
                <WorkedExample title="The destination">
                  <NumberTable
                    headings={["", "value"]}
                    rows={[
                      ["slope", "0.6 kg per cm"],
                      ["level, the weight predicted at the mean height of 170", "66 kg"],
                      ["intercept, the same line at a height of zero", "−36 kg"],
                      ["mean squared error, the lowest any line can reach", "2.0"],
                    ]}
                  />
                </WorkedExample>
                <p>
                  We already know the best-fitting line for these observations. That gives us a useful way to check a different method: start from another line and improve it through small adjustments. Before starting the updates, let&apos;s see what one adjustment actually changes.
                </p>
              </SubSection>

              <SubSection title="2. Why fit it iteratively anyway?">
                <p>The adjustable settings are called parameters. We first calculate how wrong the current predictions are using a loss function. A small change to each parameter changes that loss; the gradient collects those local rates of change. Gradient descent uses them to propose a step, then recalculates the rates at the new settings.</p>
                <p>
                  So treat this page as a controlled experiment. Gradient
                  descent is being used where it is not needed, on purpose,
                  because the known answer lets us check whether the method
                  arrived, how fast, and what went wrong when it did not. Later
                  models will not always give us a direct solution to compare
                  against.
                </p>
                <KeepInMind>
                  <p>

                    Least squares also has a direct solution. The normal
                    equations describe the condition that solution satisfies,
                    but an implementation can solve the original least-squares
                    problem using a QR factorization or singular value
                    decomposition. Those methods break the input matrix into
                    forms that are easier to solve reliably. We do not need
                    their details for this first walk. Iterative updates are an
                    alternative to a direct solve for this line.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Every Line Is a Point in Parameter Space",
          content: (
            <>
              <SubSection title="3. Level and slope as two adjustable settings">
                <p>
                  The regression page wrote a line as an intercept and a slope.
                  This page writes the same line a different way.
                </p>
                <Equation>{"ŷ = α + β·x                 intercept and slope\nŷ = level + slope·(x − x̄)   level at the mean, and slope"}</Equation>
                <>
                  <p>

                    The level is the prediction at the mean height, which is 170
                    centimeters here. The slope is the predicted change per centimeter.
                    A level of 66 and a slope of 0.6 describe the same line as an
                    intercept of −36 and a slope of 0.6.
                  </p>
                  <Equation>{"intercept = level − slope × mean height\n          = 66 − 0.6 × 170\n          = −36"}</Equation>
                  <p>
                    Only the reference point used to describe the line has changed.
                  </p>
                </>
                <NumberTable
                  headings={["", "intercept and slope", "level and slope"]}
                  rows={[
                    ["the best line for the three people", "α = −36, β = 0.6", "level = 66, slope = 0.6"],
                    ["a flat line at zero", "α = 0, β = 0", "level = 0, slope = 0"],
                    ["what the first setting means", "weight at a height of 0 cm", "weight at the mean height"],
                  ]}
                  caption="Two names for each line, and the same predictions under both. Section 24 shows why the second naming is the one worth walking on."
                />
              </SubSection>

              <SubSection title="4. Searching through possible lines">
                <p>
                  Before any formula and before any walk, hunt for the line by
                  hand. The two sliders below set a level and a slope, the
                  picture draws the line they make with its three residuals,
                  and the readout gives the mean squared error. Try to get the
                  error as low as you can, then press the button to see how
                  close you came.
                </p>
                <LineSearchPlayground panels={["line"]} initialLevel={20} initialSlope={0.2} />
                <p>
                  Each choice of level and slope gives us a line, and we can measure its loss on these observations. Try a few choices by hand. In the next picture we will give each choice a position and use its loss as the height, so we can see where better-fitting lines are located.
                </p>
              </SubSection>

              <SubSection title="5. The loss surface">
                <p>Each location on the two-axis picture represents one pair of line coefficients. The surface height is the mean squared error at that pair. This lets us see fitting as a search over settings while keeping the original prediction error as the quantity being reduced.</p>
                <Equation>{"(level, slope)  ⟼  MSE"}</Equation>
                <LineSearchPlayground panels={["line", "surface"]} initialLevel={20} initialSlope={0.2} />
                <p>
                  Move one slider and watch both panels. In the data plot, we change the line. In the loss plot, we move the point representing that line&apos;s settings. They describe the same adjustment. We previously used algebra to find the minimum; now we will use the slope of this surface to decide which adjustment to try next.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. The Gradient as a Local Direction",
          content: (
            <>
              <SubSection title="6. Changing only the level">
                <p>
                  Before moving in two directions, freeze the slope and move
                  the level alone. The loss becomes a curve over one number,
                  and at the current level that curve has a tangent whose
                  slope says which way is down.
                </p>
                <LineSearchPlayground panels={["slices"]} initialLevel={20} initialSlope={0.2} />
                <p>
                  In the left panel the tangent tilts downward to the right
                  whenever the level is below 66 and upward to the right
                  whenever it is above, so its slope, the derivative of the
                  loss with respect to the level, is negative on one side and
                  positive on the other and is what tells the walk which way
                  to shift the line up or down.
                </p>
              </SubSection>

              <SubSection title="7. Changing only the slope">
                <p>
                  Now the other way round, in the right panel. Freeze the level
                  and rotate the line. The loss is again a curve over one
                  number, its tangent again says which way is down, and the
                  derivative with respect to the slope says whether to tilt the
                  line steeper or flatter.
                </p>
                <p>
                  The two panels ask the same kind of question of two different
                  settings. How does the loss change if this one number moves a
                  little? A derivative is the answer to that question, and a
                  model with two settings has two of them.
                </p>
              </SubSection>

              <SubSection title="8. The gradient">
                <p>Only now put the two derivatives together.</p>
                <Equation>{"∇L = ( ∂L/∂level ,  ∂L/∂slope )"}</Equation>
                <p>The gradient collects both partial derivatives into an arrow in parameter space. Among directions of equal Euclidean length in these chosen coordinates, it gives the greatest local increase in loss. Its negative gives the greatest local decrease. A finite update also needs a suitable step size.</p>
                <LineSearchPlayground panels={["surface"]} showGradient initialLevel={20} initialSlope={0.2} />
                <p>
                  The red arrow is uphill, the green arrow is downhill, and the
                  hollow ring is where one pass at a rate of 0.02 would land.
                  Drag the sliders around the surface and the arrows always
                  cross the contours at right angles, because the direction
                  along a contour is the direction in which the loss does not
                  change at all. Gradient descent moves both settings at once
                  using one arrow assembled from their two partial
                  derivatives.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. One Pass from Start to Finish",
          content: (
            <>
              <SubSection title="9. Anatomy of one pass">
                <p>
                  One update begins with the current parameters. We use them to calculate predictions and residuals, then average the squared residuals to measure loss. The gradient tells us how that loss changes locally with each parameter. We scale it by the learning rate and subtract it from the current parameters. The next update must use the new values.
                </p>
                <PassInspector />
                <p>
                  The inspector starts where the fit starts, a flat line at
                  zero, which is deliberately poor rather than the worst line
                  there is, since arbitrarily bad lines exist. Step through the
                  stages with the buttons, then make the new line current and
                  step through again. The next four sections are the arithmetic
                  of the first pass, and the inspector&rsquo;s numbers are the
                  ones to check them against.
                </p>
              </SubSection>

              <SubSection title="10. Starting predictions and loss">
                <p>
                  At pass zero the level and the slope are both 0, so every
                  prediction is 0 and every residual is the person&rsquo;s
                  whole weight.
                </p>
                <WorkedExample>
                  <NumberTable
                    headings={["centered height x′", "weight y", "prediction ŷ", "residual e", "e²"]}
                    rows={[
                      ["−5", "62", "0", "62", "3844"],
                      ["0", "68", "0", "68", "4624"],
                      ["5", "68", "0", "68", "4624"],
                    ]}
                  />
                  <Equation>{"L = (3844 + 4624 + 4624) / 3 = 13092 / 3 = 4364"}</Equation>
                </WorkedExample>
              </SubSection>

              <SubSection title="11. The level gradient">
                <p>
                  Take one person. Their residual depends on the level, and
                  their squared residual depends on the residual, so the level
                  reaches the loss through a chain of two steps.
                </p>
                <Equation>{"eᵢ = yᵢ − level − slope·x′ᵢ\nLᵢ = eᵢ²\nlevel → eᵢ → Lᵢ"}</Equation>
                <WhyThisWorks title="The chain rule, one person at a time">
                  <DerivationTable
                    rows={[
                      { expression: "∂Lᵢ/∂eᵢ = 2eᵢ", reason: "the derivative of a square" },
                      { expression: "∂eᵢ/∂level = −1", reason: "raising the level by one lowers every residual by one" },
                      { expression: "∂Lᵢ/∂level = 2eᵢ · (−1) = −2eᵢ", reason: "the chain rule multiplies the two" },
                      { expression: "∂L/∂level = −(2/n) Σ eᵢ", reason: "the loss is the mean over people, so average the shares" },
                    ]}
                  />
                </WhyThisWorks>
                <p>
                  Only now put in the numbers. The three residuals are 62, 68
                  and 68, so the level gradient is minus two thirds of their
                  sum.
                </p>
                <Equation>{"∂L/∂level = −(2/3)(62 + 68 + 68) = −132"}</Equation>
              </SubSection>

              <SubSection title="12. The slope gradient">
                <p>

                  Same chain, one change. The slope reaches a residual through
                  that person&rsquo;s centered height, so the middle step is
                  −x′ᵢ instead of −1.
                </p>
                <Equation>{"∂eᵢ/∂slope = −x′ᵢ\n∂Lᵢ/∂slope = −2eᵢ·x′ᵢ\n∂L/∂slope = −(2/n) Σ eᵢ·x′ᵢ"}</Equation>
                <WorkedExample>
                  <NumberTable
                    headings={["person", "residual e", "x′", "level share −(2/3)e", "slope share −(2/3)e·x′"]}
                    rows={[
                      ["165 cm", "62", "−5", "−41.33", "+206.67"],
                      ["170 cm", "68", "0", "−45.33", "0"],
                      ["175 cm", "68", "5", "−45.33", "−226.67"],
                      ["sum", "", "", "−132", "−20"],
                    ]}
                    caption="The person at the mean height contributes to the level gradient and nothing at all to the slope gradient, because rotating the line about the mean does not move it where they stand."
                  />
                </WorkedExample>
                <p>
                  Every observation contributes to the gradient, and what each
                  contributes depends on both its residual and its input. The
                  gradient stage of the inspector shows these two share columns
                  for whatever line it is standing on.
                </p>
              </SubSection>

              <SubSection title="13. The first update">
                <p>The update rule is the same for both settings.</p>
                <Equation>{"θ_new = θ_old − η·∇L"}</Equation>
                <p>With η = 0.02, stepping against the two gradients gives</p>
                <Equation>{"level = 0 − 0.02·(−132) = 2.64\nslope = 0 − 0.02·(−20)  = 0.4"}</Equation>
                <p>
                  Run the new line forward and its loss is 4017.16, down from
                  4364. One pass used the gradient at the old line to produce
                  the new one, and the next pass will read its gradient at the
                  new line rather than the old, which is what makes the walk a
                  walk. The second pass reads residuals of 61.36, 65.36 and
                  63.36, a level gradient of −126.72 and a slope gradient of
                  −6.667, and lands at 5.1744 and 0.5333.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 4",
          quiz: [
            choice(
              "The regression page’s formula already gives these three people their best line in one step. Why walk to it?",
              [
                "Because a known answer is what lets us check whether the walk arrived, how fast, and what went wrong when it did not",
                "Because the walk reaches a lower loss than the formula does",
                "Because the formula needs a matrix inverse and the walk does not",
                "Because three people is too few for the formula to apply",
              ],
              0,
              "The direct least-squares fit gives a reference solution for checking the iterative method's coefficients, loss and stopping behavior. Gradient descent is useful when a comparable direct solve is expensive or unavailable. Logistic regression usually needs an iterative solve too, though that does not prevent checks against other implementations or known special cases. A direct least-squares solver also need not form a matrix inverse.",
            ),
            trueFalse(
  "Using the given reference height, a level of 66 and slope of 0.6 describes the same line as an intercept of -36 and slope of 0.6.",
  true,
  "The centered level is the prediction at the mean height of 170 cm. The original-coordinate intercept is the prediction at height zero:\n\n```math\nintercept = 66 − 0.6 × 170 = −36\n```\n\nThe two coefficient descriptions give the same prediction for every height and therefore the same loss.",
  {
    "description": "Level means the predicted weight at the mean training height.",
    "data": "Reference height = 170 cm\nCentred form: prediction = level + slope*(height-170)\nUncentred form: prediction = intercept + slope*height"
  },
),
            choice(
              "Why do the uphill and downhill arrows always cross the contours at right angles?",
              [
                "Because the direction along a contour is the direction in which the loss does not change at all",
                "Because the two partial derivatives are always equal in size",
                "Because the surface is symmetric about its minimum",
                "Because the learning rate is small enough to keep the step short",
              ],
              0,
              "A contour is where the loss is constant, so moving along one changes nothing and the whole of the change lies across it. The gradient is assembled from the two partial derivatives and points the way the loss increases fastest, and its negative is the direction a pass steps.",
            ),
            choice(
  "From zero level and slope, gradients -132 and -20, and learning rate 0.02, where does the first update land?",
  [
                  "A level of 2.64 and a slope of 0.4, with a loss of 4017.16",
                  "A level of 132 and a slope of 20, with a loss of 0",
                  "A level of 2.64 and a slope of 0.4, with the loss still 4364",
                  "A level of 66 and a slope of 0.6, which is the closed form",
                ],
  0,
  "Subtract the learning rate times each gradient from its current parameter:\n\n```math\nlevel = 0 − 0.02 × (−132) = 2.64\nslope = 0 − 0.02 × (−20) = 0.4\n```\n\nThe resulting line has loss 4017.16. The next pass recalculates both gradients at this new line; reusing the original gradient would be a different update procedure.",
  {
    "description": "Use the centered-height regression and mean squared error shown below.",
    "data": "Height h (cm): [165,170,175]\nWeight y (kg): [62,68,68]\nx = h - 170\nprediction = level + slope*x\nloss = mean((y-prediction)**2)"
  },
),
            trueFalse(
              "Every observation contributes to the gradient, and what each contributes depends on both its residual and its input.",
              true,
              "The level reaches a squared residual through a chain whose middle step is −1, so the level gradient is minus two thirds of the summed residuals, which is −132 here. The slope reaches it through that person’s centered height instead, so each residual is weighted by that height before the sum.",
            ),
        ],
        },
        {
          title: "Part 5. The Complete Walk",
          content: (
            <>
              <SubSection title="14. Following the complete walk">
                <p>
                  Every pass of one walk is recorded, and the dashboard below
                  reads that record off every instrument at once. The scrubber picks a pass and every panel follows it.
                </p>
                <TrajectoryDashboard />
                <>
<p>The parameters move at different speeds. By pass 10, the slope is 0.6 to four decimal places, while the level is only 22.1. The level reaches 64.9 at pass 100 and 65.98 at pass 200. Loss falls quickly at first and then more slowly. Its late-stage excess above the minimum approaches zero geometrically, producing an approximately straight line on a logarithmic scale.</p>
                <p>
                  The gradient shrinks with it. And the fit agrees ever more closely with the closed form, without ever being told what the closed form is.
                </p>
</>
              </SubSection>

              <SubSection title="15. What convergence means">
                <p>
                  The status board on the dashboard separates claims that are
                  easy to run together. Loss is finite. Loss fell during the
                  last pass. The gradient is small. The largest movement is
                  under the tolerance. The distance from the known answer is
                  small. The pass limit was reached. The convergence criterion
                  was met.
                </p>
                <p>
                  Those are different facts, and a run can hold some without
                  the rest. Set the passes allowed to 100 and the loss is
                  finite, falling and near its floor, while the pass limit was
                  hit and the criterion was not met, and the level is still a
                  kilogram from home. A run ending is not the same as a run
                  converging, and converging is not the same as being right.
                </p>
                <KeepInMind>
                  <p>Here we can compare against a known direct solution. Many later optimization problems will not provide one, so we must inspect the gradient, parameter movement and loss history alongside the stopping rule and iteration budget. A stopping status alone does not verify the fit.</p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What the Learning Rate Changes",
          content: (
            <>
              <SubSection title="16. Comparing learning rates">
                <p>
                  Same three people, same flat start, same sixty passes, four
                  rates.
                </p>
                <RateMultiples />
                <p>After sixty passes at rate 0.005, the level is 29.9 and loss is 1306. At 0.02 they are 60.3 and 34.5. At 0.055 the level is 65.94 and loss is 2.004, close to its minimum of 2.0. At 0.07 the slope has reached about −19 million and the loss is growing. The table below compares complete runs at eight rates, including their stopping reasons.</p>
                <RateSweepTable />
              </SubSection>

              <SubSection title="17. Direct, oscillating, slow, and divergent paths">
                <p>

                  The small parabolas under each contour plot are the slope
                  direction on its own, the loss along the slope with the level
                  held at its optimum, and the dots are the first eight passes
                  hopping along it. They show four behaviors.
                </p>
                <NumberTable
                  headings={["Behavior", "What the hops do", "Rate here"]}
                  rows={[
                    ["small but convergent", "every hop closes a little of the gap from the same side, and the budget may run out first", "0.005"],
                    ["directly convergent", "hops close in without ever crossing the bottom", "0.02"],
                    ["oscillating but convergent", "each hop crosses the bottom, and each crossing is smaller than the last", "0.055"],
                    ["divergent", "each crossing is larger than the last, until the numbers stop being usable", "0.07"],
                  ]}
                />
                <p>
                  At 0.055 the slope crosses 0.6 on every pass and still
                  arrives, because the crossings shrink. At 0.07 they grow. The
                  boundary between those two is the threshold the rest of the
                  page is about, and it is at 0.06 for these people.
                </p>
              </SubSection>

              <SubSection title="18. Parameter error versus loss">
                <p>
                  The readouts on this page quote a factor per pass, 0.96 at a
                  rate of 0.02, and it matters what that factor measures. For
                  one direction with curvature c, a pass turns the distance
                  from the optimum into
                </p>
                <Equation>{"e_{k+1} = (1 − ηc)·e_k"}</Equation>
                <p>
                  so the distance, in the parameter&rsquo;s own units, keeps a
                  share of |1 − ηc| per pass. The loss contribution from that
                  direction is quadratic in the distance, so it keeps the
                  square.
                </p>
                <NumberTable
                  headings={["", "the level direction at η = 0.02"]}
                  rows={[
                    ["share of the parameter error kept", "|1 − 0.02 × 2| = 0.96"],
                    ["share of that direction's loss contribution kept", "0.96² = 0.9216"],
                  ]}
                  caption="The 0.96 the box at the top of the page reports is the error-distance factor. It is not the share of loss remaining."
                />
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Why the Threshold Exists",
          content: (
            <>
              <SubSection title="19. Curvature and step size">
                <p>
                  Two bowls, one wide and shallow, one narrow and steep. Start
                  the same distance from the bottom of each and take one pass
                  at the same rate.
                </p>
                <CurvatureComparison />
                <p>For these quadratics, the steeper curve has a larger derivative at the same distance from its minimum. The same learning rate therefore produces a larger update. A rate that reduces error on the shallow curve can overshoot far enough to increase it on the steep curve. The curvature determines the stable range.</p>
              </SubSection>

              <SubSection title="20. Deriving the stability bound">
                <p>Take the bowl to be a quadratic in the distance from its minimum.</p>
                <DerivationTable
                  rows={[
                    { expression: "L(e) = ½·c·e²", reason: "a bowl of curvature c, distance e from its bottom" },
                    { expression: "L′(e) = c·e", reason: "its derivative, the pull toward the bottom" },
                    { expression: "e_new = e − η·c·e = (1 − ηc)·e", reason: "one pass, stepping against the derivative" },
                  ]}
                />
                <p>
                  So every pass multiplies the remaining distance by the same
                  fixed factor, and what the walk does is entirely a question
                  of where that factor sits.
                </p>
                <NumberTable
                  headings={["Factor 1 − ηc", "Behavior"]}
                  rows={[
                    ["between 0 and 1", "same side, closer"],
                    ["exactly 0", "lands on the optimum in one pass"],
                    ["between −1 and 0", "crosses, and still closer"],
                    ["exactly −1", "hops between two places forever"],
                    ["less than −1", "crosses, and farther away"],
                    ["greater than 1", "farther away without crossing"],
                  ]}
                />
                <Equation>{"|1 − ηc| < 1\n0 < η < 2/c"}</Equation>
                <p>With positive curvature, a nonzero parameter error shrinks when the factor has magnitude below one. The bound above gives that range of learning rates. At the upper boundary, the error alternates without shrinking; above it, a nonzero error grows. Starting exactly at the minimum is the trivial exception.</p>
              </SubSection>

              <SubSection title="21. Several curvature directions">
                <p>

                  The surface of section 5 has two directions, and on centered
                  heights each has its own curvature.
                </p>
                <Equation>{"c_level = 2\nc_slope = 2·Var(x′) = 2 × 50/3 = 100/3"}</Equation>
                <WhyThisWorks title="Where the two curvatures come from">
                  <p>
                    A curvature is how quickly a gradient changes as its own
                    setting moves, so the two gradients of Part 4 are what to
                    differentiate once more.
                  </p>
                  <DerivationTable
                    rows={[
                      { expression: "∂L/∂level = −(2/n) Σ eᵢ", reason: "the level gradient of section 11" },
                      { expression: "∂eᵢ/∂level = −1", reason: "raising the level by one lowers every residual by one" },
                      { expression: "∂²L/∂level² = (2/n) Σ 1 = 2", reason: "every person contributes the same 2/n, and there are n of them" },
                      { expression: "∂L/∂slope = −(2/n) Σ eᵢ·x′ᵢ", reason: "the slope gradient of section 12" },
                      { expression: "∂²L/∂slope² = (2/n) Σ x′ᵢ² = 2·Var(x′)", reason: "∂eᵢ/∂slope is −x′ᵢ, and a centered input has mean zero, so the average of x′² is its variance" },
                      { expression: "(2/3)(25 + 0 + 25) = 100/3", reason: "the three people, at centered heights of −5, 0 and 5" },
                    ]}
                  />
                  <p>

                    The level&rsquo;s gradient changes by the same amount per
                    person whatever the heights are, which is why its curvature
                    is 2 for any dataset handed over this way. The slope&rsquo;s
                    gradient changes by a person&rsquo;s squared centered height,
                    so its curvature is set by how spread out the inputs are.
                    That is the fact section 25 uses when it scales the input,
                    and it is the reason the two directions of one surface can
                    be curved so differently.
                  </p>
                </WhyThisWorks>
                <p>
                  Each has its own factor, and the rate has to be safe for
                  both. The two number lines below move together as η changes,
                  and the slope&rsquo;s marker reaches −1 first.
                </p>
                <FactorNumberLine />
                <Equation>{"η = 2 / (100/3) = 0.06"}</Equation>
                <p>A rate below 0.06 is stable in both directions. At exactly 0.06, a nonzero slope error alternates without shrinking, while the level error can still decrease. Above 0.06 the slope error grows. Its greater curvature sets the stability boundary.</p>
              </SubSection>

              <SubSection title="22. Why one direction converges more slowly">
                <p>
                  A rate safe for the steep direction is small for the shallow
                  one. At η = 0.02 the two factors are
                </p>
                <Equation>{"|1 − 0.02 × 2|       = 0.96\n|1 − 0.02 × 100/3|   ≈ 0.333"}</Equation>
                <>
<p>Each pass keeps about one third of the slope error and 96 percent of the level error. After the first dozen passes, almost all remaining parameter error lies in the level direction. The slope error is small, rather than mathematically zero.</p>
                <p>
                  The distance panel on the dashboard in section 14 draws both errors on a log scale, where each is a straight line and the slope&rsquo;s is far steeper. The 477 passes are the level&rsquo;s doing, and nothing is wrong with the slope at all.
                </p>
</>
              </SubSection>

              <SubSection title="23. The best fixed-rate compromise">
                <>
                  <p>
                    For a single direction with curvature c, there is a rate that
                    removes all the remaining error in one step.
                  </p>
                  <Equation>{"rate η = 1/c\nremaining-error factor = 1 − ηc = 1 − (1/c)c = 0"}</Equation>
                  <p>With two different curvatures, one rate cannot eliminate both directional errors in one update. We can choose the rate that minimizes the worst remaining-error factor across the directions.</p>
                </>
                <WhyThisWorks title="Where the compromise sits">
                  <>
                    <p>Let μ be the smallest positive curvature and L the largest. The worst remaining-error factor is the larger magnitude shown below. Minimizing that worst-case factor makes the two extreme factors equal in magnitude and opposite in sign.</p>
                    <Equation>{"worst factor = max(|1 − ημ|, |1 − ηL|)\nbalance condition: 1 − ημ = −(1 − ηL)"}</Equation>
                  </>
                  <Equation>{"η* = 2 / (L + μ)\n\nfor the three people:  η* = 2 / (2 + 100/3) ≈ 0.0566\nworst factor there:    1 − 0.0566 × 2 ≈ 0.8868"}</Equation>
                  <p>
                    That is a little below the threshold of 0.06, not
                    immediately under it. A rate just under the threshold has
                    a slope factor near −1 and spends its passes hopping
                    across the bottom, while η* balances the two directions so
                    neither is the bottleneck. Press η* on the number lines in
                    section 21 to see both markers land at 0.887 from opposite
                    sides.
                  </p>
                </WhyThisWorks>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            choice(
  "For this recurrence at learning rate 0.02, what does the factor 0.96 measure?",
  [
                  "The share of the level’s distance from the optimum kept after one pass, so that direction’s loss contribution keeps the square, 0.9216",
                  "The share of the loss remaining after one pass",
                  "The share of the slope’s distance from the optimum kept after one pass",
                  "How far below the threshold of 0.06 the rate sits",
                ],
  0,
  "For this quadratic direction, the parameter error is multiplied by:\n\n```math\n1 − 0.02 × 2 = 0.96\n```\n\nIts loss contribution is proportional to squared error, so the retained fraction is:\n\n```math\n0.96² = 0.9216\n```\n\nThe slope error has factor about 0.333 at this rate and shrinks much faster. The factors describe separate directions, not the whole loss by one shared multiplier.",
  {
    "description": "Consider the level-direction error in this quadratic example.",
    "data": "level_error_next = (1 - 2*learning_rate)*level_error_current\nAt learning_rate = 0.02, the error factor is 0.96.\nThat direction contributes a constant times level_error**2 to loss."
  },
),
            choice(
  "What sets the learning-rate stability limit of 0.06 in this centered example?",
  [
                  "The slope direction, whose curvature of 100/3 divided into 2 gives 0.06",
                  "The level direction, which tolerates no rate above 0.06",
                  "The mean of the two curvatures",
                  "The rate at which the measured loss stopped falling",
                ],
  0,
  "A pass multiplies the remaining distance in one direction by 1 − ηc, so arriving needs the size of that factor below one, which solves to a bound of two over the curvature. The steepest direction therefore sets the largest safe rate, and the level direction would tolerate any rate below 1 but never gets the chance.",
  {
    "description": "Use plain fixed-step descent on a positive quadratic with these independent directions.",
    "data": "Level curvature = 2\nSlope curvature = 100/3\nA curvature c has error factor 1-learning_rate*c.\nConvergence in a nonzero direction requires the factor magnitude to be less than one."
  },
),
            several(
  "Which behaviors follow from this error recurrence?",
  [
                  "Exactly 0 lands on the optimum in one pass",
                  "Between −1 and 0 crosses the optimum and still comes closer",
                  "Exactly −1 hops between two places forever",
                  "Greater than 1 crosses the optimum and comes closer",
                ],
  [0, 1, 2],
  "A factor greater than one moves further away without crossing at all, which is the one behavior in that list the table does not report. The crossing case is what the parabolas show, since at 0.055 the slope crosses 0.6 on every pass and still arrives because the crossings shrink, where at 0.07 they grow.",
  {
    "description": "Let error mean the signed distance from the optimum along one independent quadratic direction.",
    "data": "error_next = factor*error_current\nfactor = 1-learning_rate*curvature\nAssume a nonzero starting error."
  },
),
            trueFalse(
  "For the two independent directions below, the rate with the smallest worst-case contraction factor is simply the largest rate below the stability limit.",
  false,
  "The best fixed rate for the stated worst-case contraction balances the magnitudes of the two error factors:\n\n```math\nrate = 2 / (2 + 100/3) ≈ 0.0566\n```\n\nThe factors then have opposite signs and magnitude about 0.887. A rate just below 0.06 leaves the slope factor near −1, causing slowly shrinking oscillations. The largest stable rate is therefore not the fastest by this criterion.",
  {
    "description": "Compare the maximum absolute error factor across both directions.",
    "data": "Curvatures: 2 and 100/3\nError factors: 1-2*rate and 1-(100/3)*rate\nStable interval: 0 < rate < 0.06"
  },
),
            choice(
  "With both initial errors nonzero, what is the walk doing after the first dozen passes?",
  [
                  "Walking almost entirely in the level direction",
                  "Walking almost entirely in the slope direction",
                  "Walking in both directions at about the same speed",
                  "Hopping between two places without approaching either",
                ],
  0,
  "The slope error is cut to a third every pass and the level error by four percent, so the slope is at 0.6 to four decimals by pass 10 while the level is at 22.1 then, 64.9 at pass 100 and 65.98 at pass 200. The 477 passes are the level’s doing and nothing is wrong with the slope at all.",
  {
    "description": "Track the two independent centered-coordinate errors.",
    "data": "Initial level error = -66\nInitial slope error = -0.6\nPer-pass factors at rate 0.02: level 0.96; slope approximately 0.333."
  },
),
        ],
        },
        {
          title: "Part 8. Centering, Scaling, and Conditioning",
          content: (
            <>
              <SubSection title="24. Centering the input">
                <p>

                  The page has walked on centered heights throughout, and the
                  reason can now be shown. Below are the same three people
                  handed over three ways, with the loss surface and a walk at
                  the same rate drawn for each.
                </p>
                <ConditioningPlayground />
                <p>
                  On raw heights the two settings are an intercept at a height
                  of zero and a slope, and they are strongly coupled. Rotating
                  the line about the origin swings its height near 170 by
                  hundreds of kilograms, so almost any change in slope has to
                  be repaid by a change in intercept to keep the predictions
                  where they were, and the contours are a valley tilted so
                  steeply that its two curvatures are 0.00115 and 57,835. A
                  rate of 0.02 runs away in four passes, and the largest safe
                  rate is 0.0000346.
                </p>
                <p>

                  Centered, the level is the prediction at the mean input,
                  rotating the line about the mean leaves that prediction
                  untouched, and the two settings stop pulling against each
                  other. The contours line up with the axes, the curvatures are
                  2 and 33.3, and the same rate arrives in 477 passes. Same
                  fit, same loss of 2.0 at the optimum, a different
                  parameterization of it. Centering removes the coupling.
                </p>
              </SubSection>

              <SubSection title="25. Scaling the input">
                <p>

                  Centering does not make the two curvatures equal. The bowl is
                  still seventeen times steeper along the slope than along the
                  level, which is the whole of section 22. Scaling the centered
                  height changes that.
                </p>
                <Equation>{"zᵢ = (xᵢ − x̄) / sₓ"}</Equation>
                <>
<p>

                  Dividing by the standard deviation changes the numerical spread of the input, and the slope&rsquo;s curvature is twice the variance of the input, so it changes that curvature directly. Switch the playground to centered and scaled. Both curvatures are now 2, the contours are circles, and the slope is 2.449 per standard deviation instead of 0.6 per centimeter, which is the same line described in a different unit.
                </p>
                <p>
                  Set the rate to 0.5 and the walk lands on the optimum in one pass, because 1/c is the same for both directions and section 23&rsquo;s compromise no longer has anything to compromise between.
                </p>
</>
                <p>For this one-input quadratic, centering removes the coupling between intercept and slope. Standardizing the input then makes their curvatures equal. With several inputs, centering does not remove correlations between the feature columns, so scaling each column cannot guarantee a circular loss surface. The <Link href="/concepts/feature-scaling" className={linkClass}>feature scaling page</Link>{" "}compares these transformations.</p>
              </SubSection>

              <SubSection title="26. Conditioning">
                <p>The curvature differs by direction. The largest curvature constrains stable step sizes, while the smallest can control slow progress near the minimum. Comparing them gives a measure of how unevenly sensitive the problem is to changes in its parameters.</p>
                <Equation>{"κ = L / μ"}</Equation>
                <NumberTable
                  headings={["Heights handed over", "μ", "L", "κ", "stability boundary, excluded"]}
                  rows={[
                    ["raw", "0.00115", "57,835", "50,000,000", "0.0000346"],
                    ["centered", "2", "33.3", "16.7", "0.06"],
                    ["centered and scaled", "2", "2", "1", "1.0"],
                  ]}
                />
                <p>

                  Near 1, every direction is curved alike and one rate serves
                  all of them. Large, the surface is a narrow valley and any
                  fixed rate is a poor compromise between crawling along it and
                  bouncing off its walls. Centering and scaling took these three
                  people from fifty million to one, and that is not a promise.
                  They often improve the conditioning a great deal, and they do
                  not always repair it, since features can be coupled in ways
                  that a shift and a stretch per column cannot undo.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Stopping Honestly",
          content: (
            <>
              <SubSection title="27. Iteration limits, divergence, and numerical failure">
                <p>
                  A walk can stop for four different reasons, and the reason is
                  part of the result.
                </p>
                <NumberTable
                  headings={["Stopped because", "Evidence", "What can be claimed"]}
                  rows={[
                    ["the stopping criterion was met", "inspect gradient, movement and loss improvement", "the reported criterion was met; verify that the other diagnostics support a sufficiently accurate fit"],
                    ["the budget ran out", "the pass limit was reached while the numbers were still moving", "nothing about convergence; the numbers are where it happened to be"],
                    ["it was diverging", "loss rising pass after pass, parameters and gradient growing", "the rate is too large for this surface"],
                    ["the arithmetic failed", "a NaN or an infinity appeared", "the computation cannot continue"],
                  ]}
                />
                <>
<p>
                  The verdicts in section 16&rsquo;s table draw these lines exactly where they fall. At 0.07 and 0.1 the walk is doomed and has not yet overflowed, so it runs out of its 500 passes holding numbers that are large and useless, and the verdict is that the passes ran out. Only at 0.2 do the coefficients stop being finite inside the budget, and only then is the fit refused by name.
                </p>
                <p>Non-finite values reveal a numerical failure after the updates may already have been growing for many iterations. Inspect the loss and gradient history before relying on that final error. Finite numbers alone do not indicate a stable fit.</p>
</>
              </SubSection>

              <SubSection title="28. Honest stopping criteria">
                <p>
                  The walk stops when no coefficient moved more than 10⁻⁸ in
                  a whole pass. That is a movement tolerance, and a movement is
                  the rate times the gradient.
                </p>
                <Equation>{"Δθ = −η·∇L"}</Equation>
                <p>
                  So a tiny movement can mean the gradient is genuinely small,
                  which is what the test is for. It can also mean the rate is
                  extremely small, so that a large gradient produces a tiny
                  step and the walk declares itself finished while standing
                  halfway down the hill. And it depends on the scale of the
                  parameters, since 10⁻⁸ is a different demand on a level of
                  66 than on a coefficient of 0.0004.
                </p>
                <InAModel>
                  <p>A movement tolerance needs accompanying diagnostics. The dashboard reports parameter movement, gradient size and loss change at each iteration, along with the iteration limit and stopping reason. Those values help us distinguish approaching a stationary point from merely making tiny updates or exhausting the budget. Later problems may have no closed-form answer available for comparison.</p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 8 and 9",
          quiz: [
            choice(
  "Which explanation fits this comparison of the same line-fitting problem in raw and centered coordinates?",
  [
                  "The two settings are strongly coupled, leaving a valley whose two curvatures are 0.00115 and 57,835",
                  "The heights are large enough that the arithmetic overflows",
                  "The loss at the optimum is higher on raw heights than on centered ones",
                  "There is no best line at all when the heights are not centered",
                ],
  0,
  "In raw coordinates, changing slope also changes the predicted weight near the observed height of 170 cm. The intercept must compensate, so the two parameters are strongly coupled. Centering height at 170 separates their effects for this dataset. It improves the curvature ratio while preserving the available lines and their minimum loss of 2.0.",
  {
    "description": "The observations and attainable optimum are unchanged; only the coordinate representation changes.",
    "data": "Raw-coordinate Hessian eigenvalues: approximately 0.00115 and 57835\nRaw-coordinate stable rate limit: approximately 0.0000346\nAt rate 0.02 the raw-coordinate run grows rapidly.\nCentred-coordinate curvatures: 2 and 100/3."
  },
),
            trueFalse(
              "Centering makes the two curvatures equal.",
              false,
              "Centering removes the coupling, and the centered bowl is still seventeen times steeper along the slope than along the level. Scaling is what evens the curvature out, since the slope’s curvature is twice the variance of the input, and once both curvatures are 2 the contours are circles and a rate of 0.5 lands on the optimum in one pass.",
            ),
            several(
              "For a positive quadratic with a fixed learning rate no greater than the reciprocal of its largest curvature, and nonzero error along every eigendirection, which curvature controls stability and asymptotic convergence?",
              [
                "The largest sets stability, because it decides the threshold",
                "The smallest sets the late-stage speed, because its direction is the one still crawling when the others have arrived",
                "The smallest sets the threshold, because it is the direction the walk crawls in",
                "Centering and scaling always bring their ratio to 1",
              ],
              [0, 1],
              "The largest curvature sets the upper stability bound for fixed-step gradient descent. In the nonoscillating rate range stated here, the smallest curvature has the error factor closest to one and converges slowest. At larger stable rates, a steep direction can instead oscillate with factor close to −1 and become the bottleneck. Centering and scaling improve this example's curvature ratio, but cannot remove every correlation or dependency among multiple features.",
            ),
            choice(
  "Why were these two unstable runs not stopped by a non-finite-value error?",
  [
                  "The walk is doomed but has not overflowed, so it runs out of its 500 passes holding numbers that are large and useless",
                  "The loss was still falling at both of those rates",
                  "The movement tolerance was met, so the walk reported convergence",
                  "Both rates sit below the threshold of 0.06",
                ],
  0,
  "These two runs retain finite coefficients throughout the 500-pass budget, so the non-finite-value check does not fire. Their growing parameters still indicate instability. The run at 0.2 eventually overflows and raises an error. Inspect loss, gradients and termination status rather than using the absence of an exception as evidence of convergence.",
  {
    "description": "Interpret the recorded termination status.",
    "data": "Rate | Pass limit | Values at termination | Movement tolerance met\n0.07 | 500 | finite but very large | no\n0.10 | 500 | finite but very large | no\nBoth runs ended because the pass budget was exhausted."
  },
),
            several(
              "The walk stops when no coefficient moved more than 10⁻⁸ in a whole pass. Which of these can produce a movement that small?",
              [
                "A gradient that is genuinely small, which is what the test is for",
                "A rate so small that even a large gradient produces a tiny step",
                "A parameter whose own scale makes 10⁻⁸ a different demand from the one it is on a level of 66",
                "Coefficients that have stopped being finite",
              ],
              [0, 1, 2],
              "Coefficient movement depends on both gradient size and learning rate. A tiny rate can produce a tiny update even far from the optimum, and one absolute tolerance can mean different relative precision for differently scaled parameters. A movement-based stopping rule is useful, but interpret it alongside loss change, gradient size and the reason training ended.",
            ),
        ],
        },
        {
          title: "Practice. Walking to the Known Line With the Library",
          practice: [
            exercise(
              "Take one pass, then two",
              ["The workshop applied a supplied gradient once. Here the regression class calculates the gradient from the current line. Fit two fresh models on the centered heights, using learning_rate=0.02 and budgets of one and two epochs.","For each model, print the level at the mean height, the height coefficient and mean squared error. Compare the second update with the first: its gradient must describe the line after the first update, rather than the original flat line."],
              `from oop_ml import Feature, GradientDescentRegression

centred_heights = Feature("height_from_mean", [-5, 0, 5])
weights = Feature("weight", [62, 68, 68])

for passes in [1, 2]:
    # Fit a walk allowed exactly this many passes at a rate of 0.02, then
    # print its level, its slope and the mean squared error of the line
    # it stopped on.
    pass`,
              `from oop_ml import Feature, GradientDescentRegression

centred_heights = Feature("height_from_mean", [-5, 0, 5])
weights = Feature("weight", [62, 68, 68])

for passes in [1, 2]:
    model = GradientDescentRegression(learning_rate=0.02, max_epochs=passes).fit([centred_heights], weights)
    loss = model.evaluate([centred_heights], weights).mean_squared_error
    print(f"pass {passes}: level {model.intercept:.4f}, slope {model.coefficients['height_from_mean']:.4f}, loss {loss:.2f}")`,
              `pass 1: level 2.6400, slope 0.4000, loss 4017.16
pass 2: level 5.1744, slope 0.5333, loss 3701.83`,
              { hints: ["Set max_epochs to the allowed update count and learning_rate to the shared step size. Fit a new model for each budget.","Because the height feature is already centered, intercept is the predicted weight at mean height. Read the slope from coefficients['height_from_mean'].","Use evaluate on the same feature and target to obtain mean_squared_error for the fitted line. Keep the two models’ printed results in epoch-budget order."], check: numberCheck("What is the loss after the second pass?", 3701.83, 0.01, "The second update recalculates the gradient at the current coefficients. Its lower loss is a measured result for this dataset and step size. It does not establish that an arbitrary learning rate lowers every possible objective."), question: "What changes between the first and second gradient updates?" },
            ),
            exercise(
              "Walk to the known line",
              ["The previous challenge stopped after two updates. Allow GradientDescentRegression up to 500 epochs at learning_rate=0.02, then fit MultipleLinearRegression to the same centered-height feature and weight target as a direct reference.","Print the iterative model's convergence flag and epoch count, both models' levels and slopes to four decimal places, the intercept expressed on the original height scale, and the final mean squared error. The centering reference is 170 cm; account for it when converting the intercept."],
              `from oop_ml import Feature, GradientDescentRegression, MultipleLinearRegression

centred_heights = Feature("height_from_mean", [-5, 0, 5])
weights = Feature("weight", [62, 68, 68])

# Fit the walk at a rate of 0.02 with 500 passes allowed, fit the closed
# form, and print whether the walk converged and after how many passes,
# both fits' level and slope, the intercept at a height of zero, and the
# loss of the line the walk ended on.`,
              `from oop_ml import Feature, GradientDescentRegression, MultipleLinearRegression

centred_heights = Feature("height_from_mean", [-5, 0, 5])
weights = Feature("weight", [62, 68, 68])

walk = GradientDescentRegression(learning_rate=0.02, max_epochs=500).fit([centred_heights], weights)
closed_form = MultipleLinearRegression().fit([centred_heights], weights)

print(f"converged {walk.converged} after {walk.epochs_run} passes")
print(f"walk: level {walk.intercept:.4f}, slope {walk.coefficients['height_from_mean']:.4f}")
print(f"closed form: level {closed_form.intercept:.4f}, slope {closed_form.coefficients['height_from_mean']:.4f}")
print(f"intercept at a height of zero {walk.intercept - walk.coefficients['height_from_mean'] * 170:.2f}")
print(f"loss at the end of the walk {walk.evaluate([centred_heights], weights).mean_squared_error:.4f}")`,
              `converged True after 477 passes
walk: level 66.0000, slope 0.6000
closed form: level 66.0000, slope 0.6000
intercept at a height of zero -36.00
loss at the end of the walk 2.0000`,
              { hints: ["Both models take the same list of features and the same target, and both expose intercept and coefficients, so the comparison is two fits read the same way.", "converged and epochs_run record why training stopped and how many passes it used. With the default tolerance here, convergence means no coefficient changed by more than 10⁻⁸ in a full pass. Reaching max_epochs first gives converged=False.", "The centered intercept is the predicted weight at 170 cm. To express the same line from height zero, subtract the slope times 170 from that intercept."], check: numberCheck("After how many passes does gradient descent at learning_rate=0.02 report convergence?", 477, 0.5, "The models approach the same least-squares prediction on these observations by different computational routes. The reported epoch count is the SDK’s stopping result for this rate, initialization and tolerance. It is not a general iteration requirement for linear regression."), question: "Does repeated updating reach the direct least-squares solution?" },
            ),
            exercise(
              "Sweep the rate across the threshold",
              ["Fit a fresh model at each supplied learning rate with a budget of 500 epochs. The data and initialization stay fixed, so differences come from the update size and its numerical consequences.","Print whether each fit converged, its epoch count and the fitted coefficients. If fitting raises MLLibError, print the error class instead. A model that exhausts its budget still contains coefficients; assess their magnitude and loss separately from the convergence flag."],
              `import warnings
from oop_ml import Feature, GradientDescentRegression, MLLibError

warnings.filterwarnings("ignore", category=RuntimeWarning)
centred_heights = Feature("height_from_mean", [-5, 0, 5])
weights = Feature("weight", [62, 68, 68])

for rate in [0.005, 0.02, 0.055, 0.0566, 0.06, 0.07, 0.1, 0.2]:
    # Fit a walk at this rate with 500 passes allowed. If the library
    # refuses, print the rate and the refusal's class name. Otherwise print
    # whether it converged, the passes it ran, and its level and slope.
    pass`,
              `import warnings
from oop_ml import Feature, GradientDescentRegression, MLLibError

warnings.filterwarnings("ignore", category=RuntimeWarning)
centred_heights = Feature("height_from_mean", [-5, 0, 5])
weights = Feature("weight", [62, 68, 68])

for rate in [0.005, 0.02, 0.055, 0.0566, 0.06, 0.07, 0.1, 0.2]:
    model = GradientDescentRegression(learning_rate=rate, max_epochs=500)
    try:
        model.fit([centred_heights], weights)
    except MLLibError as refusal:
        print(f"rate {rate}: refused, {type(refusal).__name__}")
        continue
    verdict = "converged" if model.converged else "passes ran out"
    print(f"rate {rate}: {verdict} after {model.epochs_run} passes, level {model.intercept:.4g}, slope {model.coefficients['height_from_mean']:.4g}")`,
              `rate 0.005: passes ran out after 500 passes, level 65.57, slope 0.6
rate 0.02: converged after 477 passes, level 66, slope 0.6
rate 0.055: converged after 177 passes, level 66, slope 0.6
rate 0.0566: converged after 172 passes, level 66, slope 0.6
rate 0.06: passes ran out after 500 passes, level 66, slope 8.66e-15
rate 0.07: passes ran out after 500 passes, level -1.218e+45, slope -1.768e+62
rate 0.1: passes ran out after 500 passes, level 3.061e+165, slope -5.842e+183
rate 0.2: refused, DivergenceError`,
              { hints: ["Create each model inside the loop. Reading converged distinguishes the SDK’s stopping criterion from budget exhaustion.","The starter silences floating-point warnings so the SDK’s exception or returned fit is easy to inspect. Use the supplied compact number format for very large coefficients.","A large update can repeatedly cross the optimum or overflow. Compare the actual returned parameters as well as the reported status."], check: numberCheck("After how many passes does gradient descent at learning_rate=0.055 report convergence?", 177, 0.5, "The fitted epoch count belongs to this particular problem and tolerance. At this rate the oscillations shrink enough for the stopping criterion to be met. Crossing the optimum is compatible with convergence when successive deviations become smaller."), question: "How do the update size and the stopping report change across these learning rates?" },
            ),
            exercise(
              "Hand the walk the raw heights, then the scaled ones",
              ["The earlier models received centered heights. First try the raw height measurements at learning_rate=0.02 and print the SDK exception if the fit fails. Then use Standardizer to learn the height mean and standard deviation and fit the transformed feature at learning_rate=0.5.","Print the transformed heights, convergence flag, epoch count, level and slope. The new coefficient is kilograms per training standard deviation of height, so compare it with the original coefficient only after accounting for that unit change."],
              `import warnings
from oop_ml import Feature, GradientDescentRegression, MLLibError, Standardizer

warnings.filterwarnings("ignore", category=RuntimeWarning)
heights = Feature("height", [165, 170, 175])
weights = Feature("weight", [62, 68, 68])

# Fit a walk on the raw heights at a rate of 0.02 and print the name and
# message of the refusal. Then standardise the heights, print the three
# scaled values, walk on them at a rate of 0.5, and print whether it
# converged, after how many passes, and its level and slope.`,
              `import warnings
from oop_ml import Feature, GradientDescentRegression, MLLibError, Standardizer

warnings.filterwarnings("ignore", category=RuntimeWarning)
heights = Feature("height", [165, 170, 175])
weights = Feature("weight", [62, 68, 68])

try:
    GradientDescentRegression(learning_rate=0.02, max_epochs=500).fit([heights], weights)
except MLLibError as refusal:
    print(f"raw heights at 0.02: {type(refusal).__name__}: {refusal}")

scaled_heights = Standardizer().fit_transform([heights])
print(f"scaled heights {[round(float(value), 4) for value in scaled_heights[0].values]}")
model = GradientDescentRegression(learning_rate=0.5, max_epochs=500).fit(scaled_heights, weights)
print(f"scaled heights at 0.5: converged {model.converged} after {model.epochs_run} passes")
print(f"level {model.intercept:.4f}, slope {model.coefficients['height']:.4f} kg per standard deviation")`,
              `raw heights at 0.02: DivergenceError: the fit diverged: the weights overflowed to non-finite values. Lower the learning rate
scaled heights [-1.2247, 0.0, 1.2247]
scaled heights at 0.5: converged True after 2 passes
level 66.0000, slope 2.4495 kg per standard deviation`,
              { hints: ["Use Standardizer.fit_transform on the height feature. The transformed feature retains its name, while its numerical unit changes.","Catch MLLibError around the raw fit without preventing the scaled fit from running afterwards.","The SDK tests convergence by coefficient movement. Reaching the fitted coefficients in one update can still require another epoch to observe sufficiently small movement."], check: numberCheck("What slope does the scaled walk report, in kilograms per standard deviation?", 2.4495, 0.001, "Standardization changes the scale on which the algorithm adjusts the height coefficient. The reported slope is per standard deviation, while the earlier slope was per centimeter. Those coefficients can describe the same predictions after converting between the two feature scales."), question: "Why does changing the height scale change the behavior of the same update algorithm?" },
            ),
          ],
        },
      ]}
    />
  );
}
