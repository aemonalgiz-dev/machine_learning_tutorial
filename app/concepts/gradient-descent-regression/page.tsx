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
  title: "Fitting by Walking · oop_ml",
  description:
    "The line page solved for its answer in one step. This page reaches the same line by walking downhill on the loss, and because the answer is already known, the walk can be judged honestly at every pass.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function GradientDescentRegressionPage() {
  return (
    <ConceptPage
      title="Fitting by Walking"
      tagline="The same line as the closed form, reached one small step at a time."
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
      history={
        <>
          <p>
            Augustin-Louis Cauchy presented the method to the Paris Academy in
            1847, in a short note titled &ldquo;Méthode générale pour la
            résolution des systèmes d&rsquo;équations simultanées&rdquo;, and
            his problem was astronomical. Fitting an orbit meant solving the
            normal equations Legendre and Gauss had left behind, and Cauchy
            wanted a way of reaching their answer without the elimination, by
            starting anywhere and moving in the direction the sum of squares
            falls fastest. He gave the direction, the negative of the
            derivative, and left the size of each step to be chosen, which is
            still the part that goes wrong. For fitting a straight line the
            walk is entirely unnecessary, since the formula on the regression
            page is exact and forty years older than his note, and I fit this
            page&rsquo;s three people with that formula in one step before
            letting the walk start.
          </p>
          <p>
            Haskell Curry, doing applied work for the war effort in 1944,
            wrote up the method of steepest descent for nonlinear problems and
            noted what wartime computing had made clear, that for large
            problems the walk is cheaper than the solve. Herbert Robbins and
            Sutton Monro showed in 1951 that the walk still arrives when each
            step uses a noisy estimate of the slope rather than the slope
            itself, which is what stepping on one row at a time does, and
            Bernard Widrow and Ted Hoff at Stanford in 1960 built a device
            that fitted a linear unit exactly that way, one measurement at a
            time, correcting its weights by the error on each. Their rule is
            this page&rsquo;s update with the mean taken over a single row.
            For almost every model after this page there is no formula. The
            logistic page has no closed form and the network pages have
            nothing like one, so the walk is what they all use, and this page
            fits the one model where the right answer is independently known,
            so that we can watch the walk arriving at it and see its failures
            for what they are.
          </p>
        </>
      }
      playground={<DescentWalkPlayground />}
      sections={[
        {
          title: "Part 1. Why Fit by Walking?",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. The answer we already know">
                <p>
                  Three people, at 165 centimetres and 62 kilograms, 170 and 68,
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
                  Nothing on this page will improve on those numbers. They are
                  the destination, and everything the walk does can be judged
                  by how close to them it gets and how long it takes. Do not
                  start the walk yet.
                </p>
              </SubSection>

              <SubSection title="2. Why fit it iteratively anyway?">
                <p>
                  Some models have a direct least-squares solution. Many of the
                  important ones do not, and for those the only route to a fit
                  is to start somewhere, ask which way makes the loss smaller,
                  move a little that way, and repeat. That method needs four
                  things and nothing else. A current set of parameters, a loss,
                  the gradient of that loss, and a rule for the update.
                </p>
                <p>
                  So treat this page as a controlled experiment. Gradient
                  descent is being used where it is not needed, on purpose,
                  because the known answer lets us check whether the method
                  arrived, how fast, and what went wrong when it did not. On
                  the logistic page and every page after it, that check will
                  not be available.
                </p>
                <KeepInMind>
                  <p>
                    The direct solution is a system of linear equations, the
                    normal equations from the polynomial page. It does not mean
                    computing a matrix inverse, and a careful implementation
                    solves the system through a QR or singular value
                    decomposition rather than forming one. The walk&rsquo;s
                    advantage on large problems is against that solve, not
                    against an inversion nobody should be doing.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                <p>
                  The level is the prediction at the mean height, 170 here, and
                  the slope is the predicted change per centimetre either side
                  of it. The line has not changed. A slope of 0.6 and a level
                  of 66 is exactly the line with a slope of 0.6 and an
                  intercept of −36, since 66 − 0.6 × 170 is −36. Only the way
                  of naming it has changed.
                </p>
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
                  Every combination of level and slope defines one candidate
                  line, and every candidate line earns one loss. That is the
                  whole of what the walk is going to search through, and doing
                  it by hand first makes the next section&rsquo;s picture
                  obvious rather than abstract.
                </p>
              </SubSection>

              <SubSection title="5. The loss surface">
                <p>
                  Now put the two settings on two axes. Level across, slope up,
                  and at every pair the mean squared error the line there
                  earns, shaded darker where it is larger.
                </p>
                <Equation>{"(level, slope)  ⟼  MSE"}</Equation>
                <LineSearchPlayground panels={["line", "surface"]} initialLevel={20} initialSlope={0.2} />
                <p>
                  Move a slider and both panels move together. That is the
                  central picture of the page. Fitting a line can be seen as
                  moving a line through the data, or as moving a point across
                  an error surface, and those are the same act. The
                  regression page found the bottom of this surface by algebra.
                  This page is going to walk down to it.
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
                <p>
                  Each component describes one direction. Together they are an
                  arrow in the plane of section 5, and it points the way the
                  loss increases fastest. Its negative points the way the loss
                  decreases fastest, and that is the direction a pass steps.
                </p>
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
                  A pass is a fixed sequence, and it is worth seeing it as one
                  before seeing any of its arithmetic. Use the current
                  settings. Make predictions. Take residuals. Square and average
                  them into the loss. Read the gradient. Scale it by the
                  learning rate. Update both settings. Begin again from the new
                  ones.
                </p>
                <PassInspector />
                <p>
                  The inspector starts where the library starts, a flat line at
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
                    headings={["centred height x′", "weight y", "prediction ŷ", "residual e", "e²"]}
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
                  that person&rsquo;s centred height, so the middle step is
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
          title: "Part 5. The Complete Walk",
          content: (
            <>
              <SubSection title="14. Following the complete walk">
                <p>
                  The library records every pass of one walk, and the
                  dashboard below reads that record off every instrument at
                  once. The scrubber picks a pass and every panel follows it.
                </p>
                <TrajectoryDashboard />
                <p>
                  Four things are visible here that a single loss curve hides.
                  The two settings move at very different speeds. The slope is
                  at 0.6 to four decimals by pass 10, while the level is at
                  22.1 then, 64.9 at pass 100 and 65.98 at pass 200. The loss
                  drops fast at first and slowly later, and on the log scale
                  the late part is a straight line, which is geometric
                  approach. The gradient shrinks with it. And the fit agrees
                  ever more closely with the closed form, without ever being
                  told what the closed form is.
                </p>
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
                  <p>
                    One of those instruments is a luxury. The distance from
                    the closed form can be read here because the closed form
                    is known. On the logistic page and every page after it,
                    there is no known optimum to measure against, and the
                    remaining instruments, the gradient, the movement, the loss
                    change and the budget, are all a run has.
                  </p>
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
                <p>
                  At 0.005 the walk is heading the right way and is nowhere
                  near arriving, level 29.9 after sixty passes with a loss of
                  1306. At 0.02 it is at 60.3 with a loss of 34.5. At 0.055 it
                  is at 65.94 with a loss of 2.004, close enough that the
                  difference is the fourth decimal. At 0.07 the slope is at
                  −19 million and the record had to stop before the numbers
                  overflowed. The table below asks the library itself for a
                  plain fit at eight rates and reports what it said.
                </p>
                <RateSweepTable />
              </SubSection>

              <SubSection title="17. Direct, oscillating, slow, and divergent paths">
                <p>
                  The small parabolas under each contour plot are the slope
                  direction on its own, the loss along the slope with the level
                  held at its optimum, and the dots are the first eight passes
                  hopping along it. They show four behaviours.
                </p>
                <NumberTable
                  headings={["Behaviour", "What the hops do", "Rate here"]}
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
                <p>
                  At the same distance from its minimum the steeper bowl has
                  the larger derivative, so the same rate takes a larger step
                  on it. A rate that creeps politely down the shallow bowl can
                  leap clean across the steep one and land farther from the
                  bottom than it started. A learning rate is safe or unsafe
                  only relative to a curvature.
                </p>
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
                  headings={["Factor 1 − ηc", "Behaviour"]}
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
                <p>
                  Shrinking needs the size of the factor below one, and solving
                  that for η gives the bound. The walk arrives for any rate
                  between zero and two over the curvature, and runs away above
                  it.
                </p>
              </SubSection>

              <SubSection title="21. Several curvature directions">
                <p>
                  The surface of section 5 has two directions, and on centred
                  heights each has its own curvature.
                </p>
                <Equation>{"c_level = 2\nc_slope = 2·Var(x′) = 2 × 50/3 = 100/3"}</Equation>
                <p>
                  Each has its own factor, and the rate has to be safe for
                  both. The two number lines below move together as η changes,
                  and the slope&rsquo;s marker reaches −1 first.
                </p>
                <FactorNumberLine />
                <Equation>{"η = 2 / (100/3) = 0.06"}</Equation>
                <p>
                  The steepest direction sets the largest safe learning rate.
                  The level direction would tolerate any rate below 1, and it
                  never gets the chance, because the slope direction runs away
                  at 0.06.
                </p>
              </SubSection>

              <SubSection title="22. Why one direction converges more slowly">
                <p>
                  A rate safe for the steep direction is small for the shallow
                  one. At η = 0.02 the two factors are
                </p>
                <Equation>{"|1 − 0.02 × 2|       = 0.96\n|1 − 0.02 × 100/3|   ≈ 0.333"}</Equation>
                <p>
                  so the slope error is cut to a third every pass and the level
                  error is cut by four percent. The slope has thrown away two
                  thirds of its error before the level has thrown away four
                  percent of its, and after the first dozen passes the walk is
                  entirely a walk in the level direction. The distance panel on
                  the dashboard in section 14 draws both errors on a log scale,
                  where each is a straight line and the slope&rsquo;s is far
                  steeper. The 477 passes are the level&rsquo;s doing, and
                  nothing is wrong with the slope at all.
                </p>
              </SubSection>

              <SubSection title="23. The best fixed-rate compromise">
                <p>
                  For one direction, η = 1/c sets its factor to zero and lands
                  on the optimum in a single pass. With two curvatures no one
                  rate can do that for both, and the best fixed rate is a
                  compromise between them.
                </p>
                <WhyThisWorks title="Where the compromise sits">
                  <p>
                    Call the smallest curvature μ and the largest L. The worst
                    factor at a rate η is the larger of |1 − ημ| and |1 − ηL|,
                    and the rate that makes it smallest is the one where the
                    two are equal in size and opposite in sign, 1 − ημ = −(1 −
                    ηL).
                  </p>
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
          title: "Part 8. Centering, Scaling, and Conditioning",
          content: (
            <>
              <SubSection title="24. Centering the input">
                <p>
                  The page has walked on centred heights throughout, and the
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
                  Centred, the level is the prediction at the mean input,
                  rotating the line about the mean leaves that prediction
                  untouched, and the two settings stop pulling against each
                  other. The contours line up with the axes, the curvatures are
                  2 and 33.3, and the same rate arrives in 477 passes. Same
                  fit, same loss of 2.0 at the optimum, a different
                  parameterisation of it. Centring removes the coupling.
                </p>
              </SubSection>

              <SubSection title="25. Scaling the input">
                <p>
                  Centring does not make the two curvatures equal. The bowl is
                  still seventeen times steeper along the slope than along the
                  level, which is the whole of section 22. Scaling the centred
                  height changes that.
                </p>
                <Equation>{"zᵢ = (xᵢ − x̄) / sₓ"}</Equation>
                <p>
                  Dividing by the standard deviation changes the numerical
                  spread of the input, and the slope&rsquo;s curvature is twice
                  the variance of the input, so it changes that curvature
                  directly. Switch the playground to centred and scaled. Both
                  curvatures are now 2, the contours are circles, and the
                  slope is 2.449 per standard deviation instead of 0.6 per
                  centimetre, which is the same line described in a different
                  unit. Set the rate to 0.5 and the walk lands on the optimum
                  in one pass, because 1/c is the same for both directions and
                  section 23&rsquo;s compromise no longer has anything to
                  compromise between.
                </p>
                <p>
                  Centring and scaling are related and distinct. Centring
                  removes the coupling between the settings. Scaling evens out
                  the curvature across them. Each helps on its own, and the{" "}
                  <Link href="/concepts/feature-scaling" className={linkClass}>
                    feature scaling page
                  </Link>{" "}
                  does both routinely for reasons this page has now earned.
                </p>
              </SubSection>

              <SubSection title="26. Conditioning">
                <p>
                  The two curvatures do two different jobs. The largest sets
                  stability, since it decides the threshold. The smallest sets
                  the late-stage speed, since its direction is the one still
                  crawling when the others have arrived. Their ratio describes
                  how uneven the surface is, and it has a name.
                </p>
                <Equation>{"κ = L / μ"}</Equation>
                <NumberTable
                  headings={["Heights handed over", "μ", "L", "κ", "largest safe rate"]}
                  rows={[
                    ["raw", "0.00115", "57,835", "50,000,000", "0.0000346"],
                    ["centred", "2", "33.3", "16.7", "0.06"],
                    ["centred and scaled", "2", "2", "1", "1.0"],
                  ]}
                />
                <p>
                  Near 1, every direction is curved alike and one rate serves
                  all of them. Large, the surface is a narrow valley and any
                  fixed rate is a poor compromise between crawling along it and
                  bouncing off its walls. Centring and scaling took these three
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
                    ["it converged", "small gradient, small movement, small loss improvement", "the walk is at a minimum to within the tolerance"],
                    ["the budget ran out", "the pass limit was reached while the numbers were still moving", "nothing about convergence; the numbers are where it happened to be"],
                    ["it was diverging", "loss rising pass after pass, parameters and gradient growing", "the rate is too large for this surface"],
                    ["the arithmetic failed", "a NaN or an infinity appeared", "the computation cannot continue"],
                  ]}
                />
                <p>
                  The library&rsquo;s verdicts in section 16&rsquo;s table draw
                  these lines exactly where they fall. At 0.07 and 0.1 the walk
                  is doomed and has not yet overflowed, so it runs out of its
                  500 passes holding numbers that are large and useless, and
                  the verdict is that the passes ran out. Only at 0.2 do the
                  coefficients stop being finite inside the budget, and only
                  then does the library refuse by name. Non-finite arithmetic
                  detects the wreck, not the beginning of the skid, which can
                  be many passes earlier. A run should be read by its loss and
                  gradient over time, which is the dashboard&rsquo;s middle row,
                  and not by whether it happened to crash.
                </p>
              </SubSection>

              <SubSection title="28. Honest stopping criteria">
                <p>
                  The library stops when no coefficient moved more than 10⁻⁸ in
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
                  <p>
                    Keeping a movement tolerance is fine. What makes it honest
                    is exposing the evidence alongside it, which the dashboard
                    does. The movement, the gradient size and the loss change
                    at every pass, the pass limit, and the reason the run
                    stopped. With those in view a reader can tell a walk that
                    arrived from a walk that gave up, and on the pages that
                    follow, where no closed form waits at the bottom to check
                    against, those instruments are the only way to know.
                  </p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
