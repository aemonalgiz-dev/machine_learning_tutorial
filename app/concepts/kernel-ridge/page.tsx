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
import { CentringControl } from "@/components/widgets/CentringControl";
import { CostChart } from "@/components/widgets/CostChart";
import { DualWeightLedger } from "@/components/widgets/DualWeightLedger";
import { ExtrapolationView } from "@/components/widgets/ExtrapolationView";
import { GramMatrixView } from "@/components/widgets/GramMatrixView";
import { IdentityLedger } from "@/components/widgets/IdentityLedger";
import { KernelGallery } from "@/components/widgets/KernelGallery";
import { KernelRidgePlayground } from "@/components/widgets/KernelRidgePlayground";
import { MercerProbe } from "@/components/widgets/MercerProbe";
import { PenaltySweepChart } from "@/components/widgets/PenaltySweepChart";

export const metadata: Metadata = {
  title: "Kernel Ridge Regression · Perceptron Lab",
  description:
    "Kernel ridge regression combines comparisons in a transformed feature space with a penalty that controls the fit. The kernel determines the relationships available to the model, while the penalty limits how closely it follows the observations.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KernelRidgePage() {
  return (
    <ConceptPage
      lessonId="kernel-ridge"
      intuition={lessonIntuitions["kernel-ridge"]}
      technicalStart="Part 2. One Number Per Row"
      openingTitle="Build a Curve from Similarities to the Training Points"
      playgroundTitle="Fit a prediction using comparisons with training points"
      playgroundIntro="Compare the ordinary and kernel-based fits. Vary the penalty and watch how closely the prediction follows individual training points."
      title="Kernel Ridge Regression"
      tagline={"Kernel ridge regression combines comparisons in a transformed feature space with a penalty that controls the fit. The kernel determines the relationships available to the model, while the penalty limits how closely it follows the observations."}
      prerequisites={
        <>
          The model being rewritten is the one from the{" "}
          <Link href="/concepts/ridge-lasso" className={link}>
            ridge and lasso
          </Link>{" "}
          page, which owns the penalty and is not re-taught here. The swap
          the rewritten model is then subjected to is the{" "}
          <Link href="/concepts/kernel-trick" className={link}>
            kernel trick
          </Link>
          , which owns the argument for why a kernel stands in for an inner
          product in a space nobody builds. This page takes both as given and
          asks what the fit looks like once they are put together, on the{" "}
          <Link href="/concepts/multiple-polynomial-regression" className={link}>
            polynomial page
          </Link>
          &rsquo;s thrown ball and on the crowd measured by height and weight.
        </>
      }

      playground={<KernelRidgePlayground />}
      sections={[
        {
          title: "Part 1. The Line Written Two Ways",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Ridge as the penalty page left it">
                <>
<p>Ridge regression gives each input feature a coefficient and adds a penalty for coefficient size. With time as its only feature, its prediction is still a straight line. The fifteen ball measurements rise and then fall, so that line fits poorly: its R² is 0.003. We need a richer representation if we want the prediction to follow the trajectory.</p>
                <p>

                  On the fifteen people the line scores 0.890 with a slope of 0.826 kilograms per centimeter. Nothing on this page changes what ridge minimizes.
                </p>
</>
                <Equation>{"minimise  ‖y − Xw‖² + λ‖w‖²"}</Equation>
                <Equation>{"w = (XᵀX + λI)⁻¹ Xᵀ y"}</Equation>
                <p>The earlier system has one row and column for each input feature. If there are p features, it is a p-by-p system. We can express the same ridge prediction using one coefficient for each of the n training observations instead, giving an n-by-n system.</p>
              <p>Those coefficients have different jobs: one weights features, while the other combines comparisons with stored observations. The second form needs inner products between observations. That is where a kernel can replace explicitly constructed feature coordinates. We will first check the equivalent linear forms before changing the comparison.</p>
                <KeepInMind>

                  The penalty page owns the penalty. Everything it says about
                  λ shrinking the weights and about scaling the columns first
                  still holds here, since the objective has not changed.
                  What changes is how the minimizer is written down.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The same line written as a sum over rows">
                <p>The same ridge prediction can be written using one coefficient per training row instead of one per feature. These are called dual coefficients. They combine the training rows to recover the original feature-weight vector. The equivalence below assumes the centering convention returned to in section 17.</p>
                <Equation>{"w = Xᵀ (XXᵀ + λI)⁻¹ y = Xᵀ a"}</Equation>
                <Equation>{"a = (K + λI)⁻¹ y,   K = XXᵀ"}</Equation>
                <p>
                  The vector a contains the dual weights, one for each training row. The n-by-n matrix K records the inner product of every training row with every other row. This is the Gram matrix. The solve uses those comparisons rather than the feature vectors directly. For a new observation, we compare it with each training row and combine the comparisons using a.
                </p>
                <Equation>{"prediction(x) = xᵀw + ȳ = Σᵢ aᵢ (x · xᵢ) + ȳ"}</Equation>
                <WhyThisWorks title="Why the two forms agree">
                  <DerivationTable
                    expressionHeading="step"
                    reasonHeading="why"
                    rows={[
                      { expression: "Xᵀ(XXᵀ + λI) = (XᵀX + λI)Xᵀ", reason: "multiply out both sides; each is XᵀXXᵀ + λXᵀ, because matrix multiplication associates" },
                      { expression: "(XᵀX + λI)⁻¹ Xᵀ(XXᵀ + λI)(XXᵀ + λI)⁻¹ = Xᵀ(XXᵀ + λI)⁻¹", reason: "multiply the left side by the first inverse on the left and the second on the right" },
                      { expression: "(XᵀX + λI)⁻¹ Xᵀ = Xᵀ (XXᵀ + λI)⁻¹", reason: "the same two multiplications on the right side; both inverses exist for any λ above zero" },
                    ]}
                  />
                  <p>Here X contains centered feature columns and no intercept column. Center the target as well, then restore its mean when predicting. This handles the offset separately from the penalized coefficients. An arbitrary row of the kernel table represents a training observation, so exempting that row from the penalty would not exempt an intercept.</p>
                </WhyThisWorks>
                <KeepInMind>

                  The dual form is ridge regression&rsquo;s own minimizer
                  written as a combination of the training rows, and under
                  the plain inner product it has to give the identical line.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Where the features went">
                <p>

                  Take the three people at 169, 170 and 171 centimeters,
                  weighing 64, 70 and 76 kilograms. Centered on their mean of
                  170 the heights are −1, 0 and 1, and the Gram matrix is
                  the three by three table of their products, which is the
                  only thing the solve ever reads about them. The middle row
                  and column are all zero, because the middle person is at
                  the mean and has no centered height to multiply.
                </p>
                <GramMatrixView dataset="three" />
                <p>

                  Switch to the radial basis kernel and the same three people
                  produce a different table, with ones down the diagonal,
                  0.368 for the two pairs a centimeter apart and 0.018 for
                  the pair two centimeters apart. The rows have not changed.
                  What changed is the function that turns two rows into one
                  number, and that function is what the rest of the page
                  varies.
                </p>
                <p>

                  The fifteen throws make a fifteen by fifteen table, and
                  drawn as a heat map the three kernels look nothing alike.
                  The linear kernel&rsquo;s table is the outer product of one
                  column with itself, bright in the corners and zero along
                  the middle where the centered time passes through nought;
                  the radial one is a band along the diagonal, each throw
                  similar to its neighbors in time and to nothing far away.
                </p>
                <GramMatrixView dataset="throw" />
                <p>Eigenvalues describe the independent directions represented by the kernel table. For the linear kernel, fourteen are numerically near zero, the largest of those about 4e−15; the remaining eigenvalue is 22.834. The squared polynomial kernel has three nonzero eigenvalues. The radial kernel has fifteen, with smallest value 8.1e−9. These counts concern this finite set of observations.</p>
                <KeepInMind>
                  The linear system can be solved from the Gram matrix and centered targets. It does not need the explicit transformed coordinates at that stage. Prediction still needs comparisons with the saved training inputs, so those original references have not disappeared.</KeepInMind>
              </SubSection>

              <SubSection title="4. The identity holds on the throw, to the number">
                <p>We can check the linear-kernel implementation against ordinary ridge under matching centering and penalty conventions. The derivation predicts equivalent fitted functions. The display compares their coefficients, scores and sampled predictions, allowing for floating-point differences.</p>
                <IdentityLedger />
                <p>

                  At a penalty of one, ridge reports a slope of 0.261135 and
                  the dual weights, added up through the centered times, give
                  0.261135. Sampled at 81 times across the throw the two
                  lines part by at most 3.7e−14, both score 0.002588, and
                  both answer 12.76 meters at two seconds, which is the mean
                  height because two seconds is the mean time. Drag the
                  penalty through six orders of magnitude and the two
                  columns stay equal to the last printed digit.
                </p>
                <InAModel title="What the control is for">
                  <p>The linear case provides an independently formulated comparison with ordinary ridge. A mismatch can expose a centering or penalty-convention error that a plausible curve would hide. Nonlinear fits can also be checked through small hand-solved matrices or explicit feature maps where available; the linear control is one useful check.</p>
                </InAModel>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. One Number Per Row",
          content: (
            <>
              <SubSection title="5. The dual weights on three people">
                <>
                  <p>

                    The three centered heights are minus one, zero and one; their centered
                    weights are minus six, zero and six. With a ridge penalty of one,
                    the primal calculation is short.
                  </p>
                  <Equation>{"slope = Sxy / (Sxx + λ) = 12 / (2 + 1) = 4"}</Equation>
                  <p>
                    The dual system must recover the same slope through three
                    coefficients, one per training person.
                  </p>
                </>
                <Equation>{"(K + λI) a = y_centred"}</Equation>
                <Equation>{"K + I = [[2, 0, −1], [0, 1, 0], [−1, 0, 2]]"}</Equation>
                <WorkedExample title="The three dual weights">
                  <>
                    <p>
                      The middle equation fixes the middle coefficient at zero. The
                      outer two equations can then be solved together.
                    </p>
                    <Equation>{"a₂ = 0\n2a₁ − a₃ = −6\n−a₁ + 2a₃ = 6\n\nsolution: a₁ = −2, a₂ = 0, a₃ = 2"}</Equation>
                    <p>

                      The fit returns those three coefficients. Recover the ordinary
                      slope by multiplying each coefficient by its training person’s
                      centered height and adding.
                    </p>
                  </>
                  <Equation>{"(−2)(−1) + (0)(0) + (2)(1) = 4"}</Equation>
                  <>
                    <p>

                      Use the recovered slope to predict half a centimeter above the
                      mean height.
                    </p>
                    <Equation>{"prediction = mean weight + slope × centered height\n           = 70 + 4 × 0.5 = 72 kg"}</Equation>
                    <p>
                      Both formulations give this result.
                    </p>
                  </>
                </WorkedExample>
                <p>

                  The person at the mean carries a weight of zero and
                  contributes nothing to any prediction, and the two outer
                  people carry equal and opposite weights. A row at the
                  center of the data tells a straight fit nothing about its
                  slope, and the dual form says so directly where the
                  per-feature form never mentions individual rows at all.
                </p>
              </SubSection>

              <SubSection title="6. A dual weight is a residual divided by the penalty">
                <p>Rearranging the fitted system gives another interpretation of each dual coefficient. It equals that training observation’s residual divided by the penalty. The signs therefore indicate which observations the fitted prediction underestimates and overestimates.</p>
                <Equation>{"K a + λ a = y_centred   ⇒   λ a = y_centred − K a = residuals"}</Equation>
                <Equation>{"aᵢ = residualᵢ / λ"}</Equation>
                <p>
                  On the three people at a penalty of one the fitted weights
                  are 66, 70 and 74 kilograms, the residuals are −2, 0 and 2,
                  and dividing by one gives the dual weights back. On the
                  fifteen throws the ledger lists every row.
                </p>
                <DualWeightLedger />
                <p>
                  Under the linear kernel at a penalty of one the last two
                  columns agree to 3.2e−14, and under the radial kernel to
                  2.7e−15. Drag the penalty down and something worth noticing
                  happens under the linear kernel. The line barely moves,
                  since its score is 0.002593 at a thousandth and 0.002588
                  at one, while the largest dual weight goes from 12.08 to
                  12,105, growing as one over the penalty because the
                  residuals stay where they are and the divisor shrinks.
                </p>
                <KeepInMind>

                  A dual coefficient equals the training residual divided by λ under this solve. An exactly fitted row therefore has coefficient zero. How a nonzero coefficient affects a new query also depends on the kernel: radial influence is local, while a linear kernel is not. Large dual coefficients need not imply a large change in the final function, as this nearly unchanged line demonstrates.</KeepInMind>
              </SubSection>

              <SubSection title="7. What the model keeps instead of coefficients">
                <>
<p>Ordinary ridge regression on this single-feature crowd needs a height coefficient and an intercept. The coefficient, 0.826 kilograms per centimeter, describes how its prediction changes with height. This dual implementation instead retains the training rows and one coefficient for each. Fifteen people therefore require fifteen stored heights and fifteen dual coefficients.</p>
                <p>A dual coefficient describes a training row’s contribution, rather than an original feature’s effect. With the linear kernel we can combine those contributions to recover the ordinary slope, as section 5 did. A radial-kernel prediction has no single constant slope to report, because its response changes with the query’s position.</p>
</>
                <Equation>{"the model = the n training rows + the n dual weights + ȳ"}</Equation>
                <InAModel title="On the fifteen throws">
                  <p>
                    A ridge fit keeps two numbers. The kernel fit keeps the
                    fifteen times, fifteen dual weights and the mean height,
                    31 numbers, and every prediction touches all fifteen
                    rows. Part 5 measures what that costs as the rows grow.
                  </p>
                </InAModel>
                <KeepInMind>
                  This interface exposes dual coefficients rather than one coefficient on each original input feature. For a known finite feature map, feature-space weights can sometimes be reconstructed; the linear example does so. A general radial fit has no single constant coefficient describing its response to each original feature.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "What separates the dual form from ridge’s per-feature form?",
              [
                "It solves a system as wide as the rows rather than as wide as the features, and writes the answer as a combination of the training rows",
                "It minimizes a different objective, with the penalty falling on the rows rather than the features",
                "It carries an intercept that the per-feature form has to do without",
                "It reaches the answer by iteration where the other reaches it in one solve",
              ],
              0,
              "With the linear kernel and the same centering and penalty convention, primal and dual ridge describe the same fitted line. The primal system is indexed by input features; the dual system is indexed by training observations. A solver can solve either linear system without explicitly computing a matrix inverse. Nonlinear kernels change the implied feature representation while retaining the dual organization.",
            ),
            trueFalse(
              "The dual derivation holds whether or not the columns are centered, since the penalty is the same either way.",
              false,
              "The derivation shown here removes the unpenalized intercept by centering inputs and target, then adds the training target mean back to predictions. The simple dual system matches that convention. Other formulations can include an explicit free intercept and its corresponding constraint, so centering is required for this derivation rather than the only possible dual formulation.",
            ),
            trueFalse(
              "A dual weight is a residual divided by the penalty, so a row the fit passes through carries a weight of zero however far from the center it sits.",
              true,
              "The defining system can be rearranged so that each centered-target residual equals penalty times its dual weight. Here penalty is one:\n\n```math\nresiduals = [64 − 66, 70 − 70, 76 − 74] = [−2, 0, 2]\ndual weights = residuals / 1 = [−2, 0, 2]\n```\n\nThis identity uses the same prediction and centering convention as the fitted system.",
            ),
            choice(
              "Under the linear kernel on the throw, the penalty drops from one to a thousandth. What happens?",
              [
                "The line barely moves, 0.002588 against 0.002593, while the largest dual weight goes from 12.08 to 12,105",
                "Both the line and the weights move a great deal",
                "The weights do not change, since they are residuals",
                "The fit is refused, a thousandth being below the smallest penalty accepted",
              ],
              0,
              "In this linear fit, reducing the penalty changes predictions only slightly while dividing similar residuals by a much smaller number. The dual weights therefore become much larger. Their magnitude reflects residuals and the penalty convention; it is not by itself a measure of a training observation's importance.",
            ),
            several(
              "Which of these make up a fitted kernel ridge model on the fifteen throws?",
              [
                "The fifteen times",
                "One dual weight for each row",
                "A coefficient for each feature",
                "The mean height, added back to every prediction",
              ],
              [0, 1, 3],
              "The stored representation includes training times, dual weights and the target mean, plus the kernel and preprocessing configuration. A nonlinear kernel need not expose a finite list of named feature coefficients. For a linear or finite polynomial map, coefficients can be reconstructed if the map is explicitly defined, but that reconstruction is unnecessary for pairwise-kernel prediction.",
            ),
        ],
        },
        {
          title: "Part 3. Swapping the Inner Product for a Kernel",
          content: (
            <>
              <SubSection title="8. The swap, and what stays the same">
                <p>The dual formulation uses inner products between pairs of rows. A valid kernel can compute those inner products in another feature representation without listing its coordinates. Replace the training inner products and the query-to-training inner products with the same kernel. The solve then combines comparisons in that representation.</p>
                <Equation>{"K[i, j] = k(xᵢ, xⱼ)"}</Equation>
                <Equation>{"a = (K + λI)⁻¹ y_centred"}</Equation>
                <Equation>{"prediction(x) = Σᵢ aᵢ k(x, xᵢ) + ȳ"}</Equation>
                <p>The matrix solve and diagonal penalty keep the same form. Changing the comparisons changes the prediction shapes the model can express. A nonlinear kernel can therefore produce a curve in the original time-and-height plot without explicitly building polynomial or other transformed feature columns.</p>
                <NumberTable
                  headings={["kernel", "what it computes on centered rows", "on the throw, penalty 1"]}
                  rows={[
                    ["linear", "a · b", "R² 0.003, a line"],
                    ["polynomial, degree d", "(a · b + 1)ᵈ", "R² 0.981 at degree 2"],
                    ["radial basis, gamma γ", "exp(−γ ‖a − b‖²)", "R² 0.873 at gamma 1"],
                    ["sigmoid, gamma γ, constant c", "tanh(γ a · b + c)", "not always a kernel; section 22"],
                  ]}
                  caption="The four kernels the playground offers, each read from the fit endpoint on the fifteen throws."
                />
                <KeepInMind>
                  Swapping the kernel changes the table the solve reads and
                  nothing about the solve. The three lines above are the
                  complete algorithm, and there is no iteration anywhere on
                  this page.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Polynomial kernels and the degree, on the throw">
                <p>The polynomial kernel raises the inner product plus one to the chosen power. Expanding that expression would include lower powers as well as the highest one. It is related to constructing polynomial features, but the kernel computes the comparisons without building those columns for the fifteen throws.</p>
                <KernelGallery family="polynomial" dataset="throw" values={[1, 2, 3, 4, 5, 6]} />
                <p>

                  Degree 2 follows the arc at 0.981, degree 3 reaches 0.985,
                  and degrees 4, 5 and 6 come out at 0.981, 0.982 and 0.980,
                  so past the square the extra powers buy nothing on this
                  throw at this penalty. What they cost is visible in the
                  condition number of the system, which goes 23.8, 72.4,
                  262, 1061, 4597 and 20,781 as the degree rises, since the
                  largest entries of the Gram matrix are centered times raised
                  to the degree and the smallest stay near zero.
                </p>
                <KeepInMind>
                  On one input, a degree-d polynomial kernel can represent at most degree plus one independent feature directions. The finite Gram matrix may have lower rank if there are too few distinct inputs or dependent features. Here the higher degrees change the score little at this penalty while increasing the condition number substantially.</KeepInMind>
              </SubSection>

              <SubSection title="10. Degree one with a constant is the linear kernel here">
                <p>At degree one, the polynomial kernel includes an added constant, so its Gram matrix differs from the linear kernel’s. In these recorded fits, however, the predictions differ only by numerical rounding: 2.0e−14 for the throw at penalty one and 3.9e−12 for the three-person case. A difference in the kernel formula need not produce a visible difference on a particular fitted example.</p>
                <Equation>{"K_degree1 = K_linear + 11ᵀ"}</Equation>
                <WhyThisWorks title="Why centering makes the constant vanish">
                  <p>

                    The fit centers the rows, so every column of X sums to
                    zero and the Gram matrix K sends the all-ones vector to
                    zero. The fit also centers the target, so y_centred is
                    perpendicular to the all-ones vector. The added 11ᵀ acts
                    only along that vector, and the solve never leaves the
                    space perpendicular to it, so the added term is never
                    touched. Without the centering the textbook reading would
                    hold and the constant would act as a penalized intercept.
                  </p>
                </WhyThisWorks>
                <KeepInMind>

                  Which claims hold depends on what the implementation
                  centers. This one centers both the rows and the target, and
                  under that choice the polynomial kernel at degree one is
                  the linear kernel to the last bits.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The radial basis kernel and gamma, on the throw">
                <p>

                  The radial basis kernel reads two rows as similar when
                  they are close, one at zero distance and falling toward
                  zero as the distance grows, with gamma setting how fast.
                  The row of the Gram matrix for the throw at two seconds
                  reads 1.0 at itself, then 0.919, 0.723, 0.477, 0.273,
                  0.129, 0.054 and 0.018 for the throws stepping outward at
                  gamma 1, so each throw is compared mainly with its
                  neighbors in time.
                </p>
                <KernelGallery family="rbf" dataset="throw" values={[0.01, 0.1, 0.3, 1, 3, 10]} />
                <>
<p>At gamma 0.01, broad comparisons give R² of 0.012. The scores rise to 0.450 at 0.1, 0.797 at 0.3, 0.873 at one and 0.880 at three. At ten the comparisons are more local, the smallest Gram eigenvalue is 0.202 rather than 8.1e−9, and R² is 0.844. Neighboring inputs can still have substantial comparisons; the matrix is not yet the identity.</p>
                <p>At gamma one hundred, the table is closer to the identity and the prediction resembles the restored mean plus narrow contributions around the training inputs.</p>
</>
                <KeepInMind>
                  Gamma controls the inverse squared distance scale of the radial comparison. In this example, very broad comparisons fit poorly and narrow ones become localized around individual readings. Compare gamma and the coefficient penalty together using validation data.</KeepInMind>
              </SubSection>

              <SubSection title="12. Gamma is in the feature's own units, on the crowd">
                <p>Gamma multiplies a squared distance. With one physical input, its units are the inverse square of that input’s units. The distance where the radial comparison falls to exp(−1) is the reciprocal square root of gamma. A gamma suited to time in seconds therefore need not suit height in centimeters.</p>
                <KernelGallery family="rbf" dataset="crowd" values={[1, 0.1, 0.01, 0.001, 0.0003, 0.0001]} />
                <>
<p>

                  At gamma 1 on the crowd the Gram matrix is the identity to four decimals, the smallest eigenvalue 0.99976, so every dual weight is half that person&rsquo;s centered weight and the curve visits each person and returns to the mean of 72 between them. Asked about the person at 173 centimeters it answers 74.0, halfway from the mean to their 76 kilograms, and asked about 174.5, between two people, it answers 72.16.
                </p>
                <p>
                  The score is 0.750, below the line&rsquo;s 0.890. Widen the reach to a hundredth and the score is 0.835; at a thousandth 0.824; at a ten-thousandth the kernel can no longer tell the tallest from the shortest and the score falls to 0.481. Nothing here beats the line, because the crowd was drawn along one.
                </p>
</>
                <KeepInMind>

                  For a pure unit conversion that multiplies every input difference by a common factor, divide gamma by that factor squared to preserve the radial kernel values. Switching from time to height is a different problem, not a unit conversion. In multiple dimensions, feature scaling also determines how differences combine.</KeepInMind>
              </SubSection>

              <SubSection title="13. Three people under three kernels">
                <p>

                  The three people are small enough that every kernel&rsquo;s
                  answer can be read whole. Each fit is asked the same
                  question, what a person of 170.5 centimeters weighs, and
                  each answers from its own three dual weights.
                </p>
                <NumberTable
                  headings={["kernel, penalty 1", "dual weights", "at 170.5 cm", "R²"]}
                  rows={[
                    ["linear", "−2, 0, 2", "72.000", "0.889"],
                    ["polynomial, degree 2", "−1.2, 0, 1.2", "72.400", "0.960"],
                    ["radial basis, gamma 1", "−3.028, 0, 3.028", "72.039", "0.745"],
                  ]}
                  caption="Every number is read from the fit endpoint on the three people; the middle weight is zero under all three because the middle person is at both means."
                />
                <p>The middle coefficient is zero in these three symmetric fits. The inputs are symmetric around 170 and the targets around 70, with the middle target equal to its mean. For these kernel choices, the fitted contributions balance at the middle input. That symmetry does not imply that every nonlinear kernel fit passes through the raw-input mean.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Penalty in the Dual",
          content: (
            <>
              <SubSection title="14. Every diagonal entry takes the penalty">
                <p>The Gram matrix has a row and column for each training observation. None represents an explicit intercept feature, so every diagonal entry receives λ. Exempting an arbitrary training index would define a different regularizer, rather than preserving an unpenalized intercept.</p>
                <Equation>{"K + λI,   every diagonal entry, no exemption"}</Equation>
                <p>This SDK centers the original input columns and the target, solves the kernel system, then adds the target mean to each prediction. For the linear kernel, this reproduces ordinary ridge with an unpenalized intercept. For a nonlinear kernel, centering original inputs does not generally center the transformed features. Adding the target mean therefore does not guarantee that the fitted function passes through the input-mean point or that its predictions average to the target mean.</p>
                <KeepInMind>

                  The exact ordinary-ridge equivalence here applies to the centered linear kernel. To fit a freely optimized unpenalized intercept in a nonlinear feature space, center that feature representation through its kernel comparisons or solve for the intercept explicitly. That is a different convention from simply centering the original inputs and restoring a fixed target mean.</KeepInMind>
              </SubSection>

              <SubSection title="15. A small penalty interpolates and ill-conditions">
                <p>A positive penalty also improves the numerical stability of the solve. The radial kernel matrix is positive definite for distinct inputs, but its smallest eigenvalue on the throw at gamma 1 is only 8.1e−9. The unpenalized system is therefore invertible in exact arithmetic yet sensitive to numerical error. Adding to its diagonal makes the small-eigenvalue directions less fragile.</p>
                <PenaltySweepChart />
                <p>At penalty one billionth, radial training R² is 0.999998. The curve deviates from the mean by as much as 122 meters between readings, its largest dual coefficient is 1.6e7 and the system condition number is 6.2e8. That condition number warns of potentially severe sensitivity; it does not prove that nine digits are lost in every computed answer. At one millionth, R² is 0.99955, the condition number is 5.6e6 and the deviation is 17.8. At one tenth they are 0.987, 57.5 and within 11 meters. At penalty one, R² is 0.873 and the condition number is 6.65.</p>
                <WhyThisWorks title="Why the condition number is what it is">
                  <>
                    <p>Adding a positive penalty to the diagonal increases every eigenvalue by that amount. The condition number compares the largest resulting eigenvalue with the smallest. A large ratio warns that small numerical changes can produce large changes in the solution.</p>
                    <Equation>{"condition number = (largest eigenvalue + λ) / (smallest eigenvalue + λ)"}</Equation>
                    <p>
                      On the throw with gamma one, the largest eigenvalue is about 5.650
                      and the smallest about 8.1 billionths.
                    </p>
                    <Equation>{"at λ = 1:    condition number ≈ 6.650 / 1 ≈ 6.65\nat λ = 10⁻⁹: condition number ≈ 5.650 / (8.1 × 10⁻⁹ + 10⁻⁹)\n                             ≈ 6.2 × 10⁸"}</Equation>
                    <p>The linear Gram matrix has fourteen zero eigenvalues in exact arithmetic. A small penalty gives a condition number around 23 billion here. Large dual components in directions that the linear kernel cannot represent can nevertheless cancel when forming predictions. The fitted line can therefore remain nearly unchanged even when the dual coefficient vector is numerically sensitive.</p>
                  </>
                </WhyThisWorks>
                <KeepInMind>
                  This SDK requires a positive penalty. The unpenalized linear Gram system is singular when its rows are dependent. A Gaussian Gram matrix on distinct inputs is invertible in exact arithmetic, but can be poorly conditioned, as this example shows. Numerical difficulty at zero penalty is not universal for every radial dataset.</KeepInMind>
              </SubSection>

              <SubSection title="16. A large penalty flattens onto the mean">
                <p>As the penalty becomes large, the dual coefficients shrink. For a fixed query, their kernel contributions then approach zero and the prediction approaches the restored target mean. The model becomes less responsive to differences between inputs.</p>
                <NumberTable
                  headings={["penalty", "R², radial gamma 1", "largest weight", "farthest from the mean"]}
                  rows={[
                    ["1", "0.873", "5.640", "6.554"],
                    ["10", "0.353", "1.047", "2.254"],
                    ["100", "0.049", "0.119", "0.302"],
                    ["1000", "0.005", "0.012", "0.031"],
                  ]}
                  caption="The upper end of the sweep on the throws; the largest weight falls by a factor of ten per step, which is the residuals dividing by the penalty."
                />
                <p>

                  By a thousand the curve is within three centimeters of
                  the mean everywhere across the throw and the score is
                  0.005. Under the linear kernel the same thing happens more
                  slowly, its score going from 0.002588 at one to 0.000114 at
                  a thousand, because there was almost nothing to flatten.
                </p>
                <KeepInMind>
                  Between the two ends the penalty is the trade the ridge
                  page describes, and on the throw a tenth scores 0.987 where
                  one scores 0.873. Which of those is right is a held-out
                  question, and the ridge page&rsquo;s cross-validation is
                  where it is answered.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Centering both sides, and the control that caught it" id="17-centring-both-sides-and-the-control-that-caught-it">
                <p>To compare against ordinary ridge with an intercept, the linear-kernel route must use consistent input and target centering. The control below contrasts both-centered and target-only versions. The displayed fixture gives slopes 4.3580 and 4.2841 respectively, showing that a small numerical discrepancy can reflect a different model rather than rounding.</p>
                <CentringControl />
                <>
<p>

                  On the crowd the mistake is not subtle at all. The heights are a hundred and seventy centimeters from the origin, so the uncentered Gram matrix is dominated by that offset, and the half-centered fit reports a slope of 0.0046 kilograms per centimeter where both right fits report 0.8259, and answers 72.80 at the mean height where the right lines answer exactly 72.
                </p>
                <p>
                  Drop the penalty to a thousandth and the right fits rise to 0.8262 while the wrong one stays at 0.0046. On the throw, where the times are near the origin, the wrong slope is 0.0742 against 0.2611, which is the closer-looking version of the same failure.
                </p>
</>
                <KeepInMind>

                  A fit that centers the target and not the rows is
                  answering a different question, and no penalty moves it
                  toward the right one. The linear kernel is what caught it,
                  which is the argument for keeping a control whose right
                  answer is known.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "In this centered linear-kernel regression comparison, using a degree-one polynomial kernel with constant one instead produces different fitted predictions.",
              false,
              "The two kernel functions differ by a constant, but these centered inputs and centered targets make the constant term contribute zero to the fitted predictions. The measured predictions agree up to rounding. This is an equivalence of these fitted models under their centering convention, not an identity between the two kernel functions.",
            ),
            choice(
              "On the fifteen throws the polynomial degree is raised from 2 to 6. What did that buy, and what did it cost?",
              [
                "Nothing on the score past the square, while the condition number went 23.8, 72.4, 262, 1061, 4597 and 20,781",
                "A better score at every degree, at no measurable cost",
                "A worse score at every degree past 2, with the condition number unchanged",
                "Nothing at all, since the Gram matrix is the same table at every degree",
              ],
              0,
              "Degree 2 follows the arc at 0.981 and degree 3 reaches 0.985, and 4, 5 and 6 come out at 0.981, 0.982 and 0.980. The degree sets how many directions the Gram matrix can tell apart, which on one feature is the degree plus one, and the largest entries are centered times raised to the degree while the smallest stay near zero.",
            ),
            trueFalse(
              "Gamma is a pure number, so the gamma of 1 that suited times in seconds is the same reach on heights in centimeters.",
              false,
              "Gamma multiplies a squared distance, so it carries the inverse square of whatever the feature is measured in, and a gamma of 1 is a reach of one unit, one second on the throw and one centimeter on the crowd, whose people stand three apart. At gamma 1 on the crowd the Gram matrix is the identity to four decimals, so the curve visits each person and returns to the mean of 72 between them for a score of 0.750 against the line’s 0.890. Either scale the feature first or expect the useful gamma to change by the square of the unit change, which here was a factor of a hundred to a thousand.",
            ),
            several(
              "Which of these hold for the radial kernel at gamma 1 on the fifteen throws as the penalty is swept?",
              [
                "At a penalty of a billionth the curve scores 0.999998 on the throws and swings 122 meters from the mean between them",
                "At a penalty of a thousand the curve strays at most 0.031 meters from the mean and scores 0.005",
                "The condition number of the system falls as the penalty falls, since a smaller penalty disturbs the Gram matrix less",
                "A penalty of zero would score exactly 1 and is where the sweep ends",
              ],
              [0, 1],
              "The penalty is added to every eigenvalue of the Gram matrix, so the condition number is the largest shifted eigenvalue over the smallest, 6.65 at a penalty of one and 6.2e8 at a billionth, where the smallest Gram eigenvalue of 8.1e−9 is nearly all that holds the system up. A penalty of zero is refused at construction, and the sweep stops at a billionth because that is where the solve still completes. At the other end the dual weights are residuals over the penalty, so a thousand makes every weight small whatever the residuals are and the curve flattens onto the mean.",
            ),
            trueFalse(
              "Centering the target but not the rows gave a fit that still ran and agreed with ridge to within two percent on the fixture it was first measured on.",
              true,
              "The two slopes, 4.2841 and 4.3580, are close enough to overlook in a cursory comparison, but a two-percent discrepancy is not ordinary floating-point rounding here. On the larger example, omitting input centering gives 0.0046 instead of 0.8259 kg/cm. The known linear-kernel equivalence provides a useful correctness check: close-looking predictions are not a substitute for verifying the same objective and intercept convention.",
            ),
        ],
        },
        {
          title: "Part 5. What the Fit Costs",
          content: (
            <>
              <SubSection title="18. The cost grows with the rows, timed">
                <p>
                  The trade the two forms set up is a matrix as wide as the
                  features against a matrix as wide as the rows, and it is a
                  claim about time, so it was timed. Both fits run on drawn
                  data, first with the rows doubling at two features and then
                  with the features doubling at two hundred rows, each timing
                  the median of five runs through the whole fit,
                  boundary checks included.
                </p>
                <CostChart />
                <p>In the recorded benchmark, kernel fitting takes 0.09 milliseconds at fifty rows and 121 milliseconds at sixteen hundred. Ridge stays between 0.02 and 0.06 milliseconds over those cases. The kernel method solves a system indexed by training observations, so increasing the row count enlarges that system. These timings describe one runtime rather than a fixed speed ratio.</p>
                <p>With two hundred rows and the feature count increasing from two to sixty-four, ridge time rises from 0.04 to 0.30 milliseconds and kernel time from 1.2 to 3.1. Building the Gram matrix compares every pair of rows using their features, so its cost also grows with feature width.</p>
                <Equation>{"ridge:  solve p × p,   kernel ridge:  solve n × n"}</Equation>
                <KeepInMind>
                  A dual solve can save work when the feature representation is much wider than the observation count. A full Gram matrix instead becomes expensive for many observations: a million rows require a million-by-million table. The practical comparison also depends on kernel cost, solver and available approximations.</KeepInMind>
              </SubSection>

              <SubSection title="19. The model is the training set">
                <p>
                  Prediction has the same shape. A ridge prediction
                  multiplies p weights; a kernel prediction computes the
                  kernel between the query and every training row and
                  multiplies n weights, so predicting a hundred rows took
                  0.095 milliseconds against fifty training rows and 2.85
                  against sixteen hundred, where ridge stayed near 0.015.
                  What the fitted model has to keep grows the same way, the
                  rows times the features plus one weight per row, 150
                  numbers at fifty rows and 4800 at sixteen hundred, against
                  ridge&rsquo;s three.
                </p>
                <InAModel title="What that means for saving a fitted model">
                  <p>This implementation saves the training rows because prediction compares each query with them. Saving only the dual coefficients would lose that ability. The linear case can be compressed back into ordinary feature coefficients; a general nonlinear fit needs its stored references or another representation of their contributions. A support-vector classifier can instead omit rows whose dual coefficients are zero.</p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What the Model Cannot Do",
          content: (
            <>
              <SubSection title="20. No extrapolation beyond the radial reach">
                <p>A radial comparison approaches zero as a query moves far from a training row. Far from all the rows, nearly every contribution disappears and the restored target mean remains. The throw was observed for four seconds. Asking about six seconds tests that extrapolation behavior.</p>
                <ExtrapolationView />
                <>
<p>

                  At gamma 1 and a penalty of a tenth the curve answers 7.47 meters at five seconds, already off the last throw, 12.46 at six, 12.758 at seven and 12.759998 at eight, against a mean of 12.76. Two seconds past the data the fit has forgotten the ball entirely and is answering the average height of the throw.
                </p>
                <p>
                  The squared polynomial kernel does the opposite and keeps its shape, answering −19.5 at five seconds, −49.8 at six and −136.5 at eight, which is the polynomial page&rsquo;s runaway drawn without columns. The line answers 14.33 at eight seconds and would keep the same slope forever.
                </p>
</>
                <KeepInMind>

                  These outputs follow from the fitted model and its extrapolation behavior. Returning to the mean is not automatically safer or more accurate than continuing a polynomial or line. Outside the observed range, additional domain assumptions or observations are needed to assess the prediction.</KeepInMind>
              </SubSection>

              <SubSection title="21. No coefficient per feature, no intercept to report">
                <p>The SDK does not expose a constant slope for each original input under a general nonlinear kernel. It exposes dual coefficients and a restored target mean. The linear case permits reconstruction of ordinary coefficients and an intercept. A known finite polynomial map also permits feature-space coefficient reconstruction, although those coefficients describe transformed powers and products rather than one effect per original feature.</p>
                <KeepInMind>
                  Do not read the dual weights as importances. Section 6
                  showed they are residuals over the penalty, so the largest
                  weight belongs to the row the fit missed by most, whatever
                  that row had to say about the shape.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. An indefinite kernel is refused by the solver">
                <p>



                  A valid positive-semidefinite kernel produces a Gram matrix with no negative eigenvalues for every finite set of inputs. The sigmoid comparison fails that requirement at many settings. This implementation attempts a Cholesky factorization of the Gram matrix after adding the penalty to its diagonal. That checks the shifted system used by this solve, rather than proving that the original comparison is a valid kernel.
                </p>
                <MercerProbe />
                <>
<p>

                  On the throws at gamma 1 and a constant of −0.5 the smallest eigenvalue of the Gram matrix is −4.313. At every penalty up to 4.3 the sum with the smallest eigenvalue is negative and the fit is refused, in a message naming Mercer&rsquo;s condition. At 4.4 the sum is positive, the factorization goes through, and the fit is accepted with a score of −228, which is a curve far worse than answering the mean; at 5 it scores −4.49, at 10 −0.069, and at 100 it is 0.006, the flat line the penalty forces.
                </p>
                <p>
                  Even at a constant of zero the smallest eigenvalue is −0.878, hidden at a penalty of one, and the accepted fit scores 0.0023.
                </p>
</>
                <KeepInMind>



                  A large enough diagonal penalty can make this particular shifted system positive definite even when the original Gram matrix is indefinite. A successful factorization establishes that the numerical solve can proceed under its checks. It does not supply the usual kernel-ridge interpretation based on a positive-semidefinite kernel and its associated feature-space norm.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A zero penalty has no answer on a singular Gram matrix">
                <p>

                  Under the linear kernel on the fifteen throws the Gram
                  matrix has one nonzero eigenvalue and fourteen at zero,
                  because fifteen rows of one centered feature span one
                  direction. Without the penalty the system to be solved is
                  that rank-one table, which has no unique solution, and
                  under the squared polynomial kernel twelve of the fifteen
                  eigenvalues are zero for the same reason. The radial
                  kernel&rsquo;s table has no exact zero, its smallest at
                  8.1e−9, and section 15 showed what solving near it costs.
                </p>
                <Equation>{"λ = 0:  K a = y_centred has no unique a when K is singular"}</Equation>
                <p>A zero penalty is rejected when this model is constructed. The displayed sweep stops at one billionth, where the example already has condition number 6.2e8. That is the range chosen for this demonstration, not a universal smallest solvable penalty.</p>
                <KeepInMind>
                  For ordinary least squares a zero penalty is the default;
                  for the dual it is a singular system whenever the rows
                  outnumber the directions the kernel can see, which under
                  the linear kernel is whenever there are more rows than
                  features.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Keeping Kernel Parameters and the Solver in Agreement" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="24. Center, regularize and solve under one stated convention" id="24-what-a-complete-implementation-must-specify">
                <p>To reproduce a kernel-ridge prediction, keep the kernel parameters and training rows as part of the fitted model. If the rows and target are centered, record those references and where the target mean is restored. Later query columns must match the fitted feature identities.</p>
                <p>The regularization penalty is added to every diagonal entry of the kernel system. State its minimum accepted value, which solver factorizes the system and how factorization failure is reported. Exposed dual weights describe contributions from training rows; they are not coefficients on the original features.</p>
                <p>This model centers the original inputs and target, adds the penalty to every Gram diagonal entry, and solves by Cholesky factorization. It retains the training inputs and fitted centering references for prediction, matches input columns by name, and exposes copies of learned arrays. The table separates its accepted inputs from the page’s stricter request limits.</p>
              </SubSection>

              <SubSection title="25. Singular comparisons and parameter choices that break the solve" id="25-the-edges-probed">
                <DerivationTable
                  expressionHeading="Data, kernel or regularization"
                  reasonHeading="Whether the system can be solved"
                  rows={[
                    { expression: "empty data, or a missing or non-finite value", reason: "refused at the boundary, in the same words every feature here is refused with; this page refuses fewer than two points a layer earlier." },
                    { expression: "one row", reason: "accepted by the model; the centered row is zero, its dual weight is zero, and every prediction is the one target value. The page refuses it a layer earlier, before the fit." },
                    { expression: "two rows", reason: "accepted; on the first two throws the radial fit scores 0.144 with weights of ±2.082." },
                    { expression: "a constant column", reason: "accepted by the kernel model. With only a constant input, all centered rows coincide; the linear Gram entries are zero, while radial entries are one. The centered targets give the mean prediction in these examples. The page refuses the case because its ordinary-ridge control rejects zero input variance." },
                    { expression: "a constant target", reason: "fits, with every dual weight exactly zero and every prediction the constant; the score is refused as undefined, since R² divides by the target's variance." },
                    { expression: "two rows at the same input", reason: "accepted; equal inputs give duplicate Gram rows and an exact zero eigenvalue. The computed value of 2.4e−17 reflects rounding. A positive penalty makes the shifted system solvable for a valid positive-semidefinite kernel." },
                    { expression: "a penalty of zero or below, a gamma of zero, a negative polynomial constant", reason: "refused at construction, by the model's own field bounds, before any data is seen." },
                    { expression: "a sigmoid kernel whose Gram matrix is indefinite", reason: "the shifted matrix is refused if Cholesky encounters a nonpositive pivot. A penalty greater than the magnitude of the most negative eigenvalue can make the shifted matrix positive definite, without making the original function a valid kernel." },
                    { expression: "a polynomial kernel overflowing on large raw inputs", reason: "at inputs near 1e5 and degree 6 the table loses positive definiteness to rounding and is refused with the Mercer message, which names the wrong cause; only at absurd magnitudes does the non-finite guard fire and name overflow. Documented rather than defended." },
                    { expression: "unfitted use", reason: "reading the dual weights, the training rows or a prediction before fit is refused as not fitted, in a sentence rather than as an attribute error." },
                    { expression: "a query with a feature missing, renamed or added", reason: "refused; prediction demands exactly the fitted feature names, in any order." },
                    { expression: "more than a hundred points, or a curve range that runs backward", reason: "refused with the limit named, a layer before any fit." },
                  ]}
                />
                <p>With one constant input feature, all centered training inputs coincide. The kernel comparison against every stored input is then the same for a given query. Under the displayed kernels and centered targets, the combined prediction is the restored target mean. The ordinary-ridge control rejects the zero-variance input, so the shared page endpoint refuses it even though the kernel model itself accepts it.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            choice(
              "What did the timing find as the rows doubled at two features?",
              [
                "The kernel fit went from 0.09 milliseconds at fifty rows to 121 at sixteen hundred, while ridge stayed between 0.02 and 0.06",
                "Both fits grew at about the same rate",
                "The kernel fit stayed flat while ridge grew",
                "The kernel fit grew in proportion to the number of rows",
              ],
              0,
              "The recorded kernel-fit time rises from 0.09 to 121 milliseconds as rows increase from fifty to sixteen hundred, while the small feature-indexed ridge solve changes little. Dense factorization has cubic asymptotic cost in its system dimension, but these timings also include overhead, matrix construction and optimized-library effects. The dual can be useful when features greatly outnumber observations; a large observation-indexed system can instead be expensive.",
            ),
            trueFalse(
              "Asked about the ball two seconds past the last throw, the radial fit answers close to the mean height of the whole throw.",
              true,
              "At distant times the radial comparisons with every observed time become very small. Their weighted correction fades, leaving the stored mean height of 12.76 meters. The polynomial model instead continues its algebraic shape and predicts −136.5 meters at eight seconds. Neither behavior establishes physical reliability; a mean prediction is not automatically a signal that the model knows its uncertainty.",
            ),
            choice(
              "The sigmoid comparison has a smallest Gram eigenvalue of −4.313 on these throws. At penalty 4.4 the shifted solve succeeds. What does that establish?",
              [
                "The shifted system passes the solver check, but this does not make the unshifted comparison a valid positive-semidefinite kernel",
                "The fit stays refused at every penalty, since the condition is about the kernel rather than about the system",
                "The fit is accepted and does better than answering the mean",
                "The smallest eigenvalue turns positive, so the kernel now satisfies Mercer’s condition",
              ],
              0,
              "The penalty shifts the matrix used by the Cholesky solve. That can make this particular system positive definite without changing the fact that the original Gram matrix is indefinite. The successful computation therefore does not establish the usual positive-semidefinite kernel-ridge interpretation; its poor prediction score is a separate observation.",
            ),
            several(
              "Which of these hold for a penalty of zero?",
              [
                "It is refused when the model is constructed, before any data is seen",
                "Under the linear kernel on the fifteen throws the system is a rank-one table with no unique solution",
                "The radial kernel’s table has an exact zero eigenvalue, so its system is singular too",
                "For ordinary least squares a zero penalty is the default",
              ],
              [0, 1, 3],
              "The linear Gram matrix from one nonconstant centered input has rank one. A degree-two polynomial kernel has at most three independent feature directions on this input, while the distinct-row radial Gram matrix is mathematically positive definite. Its smallest measured eigenvalue is about 8.1e−9, making the lightly penalized system sensitive to numerical errors. A large condition number warns of possible accuracy loss; it does not specify an exact number of digits lost in every solve.",
            ),
            choice(
              "Handed a constant input column, the page’s endpoint refuses. Where does that refusal come from?",
              [
                "From the ridge control fitted beside the kernel model, which refuses a zero-variance column; the kernel model alone accepts the column and answers the mean everywhere",
                "From the kernel model, whose Gram matrix is all zeros and so cannot be factorized",
                "From the solver, which meets a pivot that is not positive and names Mercer’s condition",
                "From the model’s own field bounds at construction, before any data is seen",
              ],
              0,
              "The constant input does not distinguish any pair of observations. A linear kernel on the centered inputs gives a zero Gram matrix; a radial kernel gives a constant matrix instead. With centered targets and positive regularization, both produce zero fitted correction and return the target mean. The endpoint's error comes from the ordinary ridge control fitted beside the kernel model, which rejects the constant input.",
            ),
        ],
        },
        {
          title: "Practice. One Weight Per Row, With the Library",
          practice: [
            exercise("Recover ridge’s slope from three dual weights",["Fit KernelRidgeRegression with LinearKernel and penalty=1 to the three height-weight pairs below. Print its dual_weights and target_mean. Recover the ordinary height slope by multiplying each dual weight by its centered training height and summing.", "Predict the weight at height 170.5 cm. Compare the recovered slope and prediction with the earlier one-feature ridge calculation. Keep the training row order when pairing weights and heights."],`from oop_ml import Feature, KernelRidgeRegression, LinearKernel

heights = [169, 170, 171]
weights = [64, 70, 76]

model = KernelRidgeRegression(kernel=LinearKernel(), penalty=1.0)
# Fit the model to the three people, print its dual weights and target mean,
# recover the slope by adding the weights up through the centred heights,
# and print the weight it predicts at 170.5 cm.`,`from oop_ml import Feature, KernelRidgeRegression, LinearKernel

heights = [169, 170, 171]
weights = [64, 70, 76]

model = KernelRidgeRegression(kernel=LinearKernel(), penalty=1.0)
model.fit([Feature("height", heights)], Feature("weight", weights))

centred = [height - 170 for height in heights]
slope = sum(weight * offset for weight, offset in zip(model.dual_weights, centred))
predicted = float(model.predict([Feature("height", [170.5])])[0])

print(f"dual weights {[round(float(weight), 4) for weight in model.dual_weights]}")
print(f"target mean {model.target_mean:.1f} kg")
print(f"recovered slope {slope:.4f} kg per cm")
print(f"predicted weight at 170.5 cm {predicted:.2f} kg")`,`dual weights [-2.0, 0.0, 2.0]
target mean 70.0 kg
recovered slope 4.0000 kg per cm
predicted weight at 170.5 cm 72.00 kg`,{...{ hints: ["The kernel is a field of the model, so the model is constructed with kernel=LinearKernel() and penalty=1.0, and then fit takes a list holding one Feature of heights and a Feature of weights as the target.", "dual_weights is a property of the fitted model holding one number per training row in the order the rows were given, and target_mean is the mean the fit adds back to every prediction.", "The centered heights are each height less the mean of 170, so the slope is the sum over the three people of dual weight times centered height, which is the arithmetic Part 2 wrote out."], check: numberCheck("What slope do the dual weights add up to through the centered heights, in kilograms per centimeter?", 4.0, 0.0005, "Under the linear kernel, the dual weights recover the same centered-feature slope as the corresponding ridge fit. The two formulations organize the calculation around observations and features respectively.") },question:"Can the dual weights recover the ordinary ridge slope?"}),
            exercise("Take the throw’s gamma to the crowd",["Fit ordinary RidgeRegression to the fifteen people below at penalty=1. Compare it with radial KernelRidgeRegression at gamma values 1, 0.01 and 0.0001, also using penalty=1. Print training R², the largest absolute dual weight and the prediction at 173 cm for each kernel fit.", "Compare how close different people are under each radial kernel. At gamma=1, the three-centimeter gaps give very small cross-similarities. Inspect how the resulting weights relate to the centered target values."],`from oop_ml import Feature, KernelRidgeRegression, RadialBasisKernel, RidgeRegression

heights = [152, 155, 158, 161, 164, 167, 170, 173, 176, 179, 182, 185, 188, 191, 194]
weights = [51, 61, 56, 66, 62, 71, 66, 76, 71, 81, 75, 86, 81, 91, 86]
rows = [Feature("height", heights)]
target = Feature("weight", weights)

# Fit ridge at a penalty of one and print its R2. Then for gamma 1, 0.01 and
# 0.0001 fit the radial kernel at the same penalty and print its R2, its
# largest dual weight in size, and its prediction for 173 cm.`,`from oop_ml import Feature, KernelRidgeRegression, RadialBasisKernel, RidgeRegression

heights = [152, 155, 158, 161, 164, 167, 170, 173, 176, 179, 182, 185, 188, 191, 194]
weights = [51, 61, 56, 66, 62, 71, 66, 76, 71, 81, 75, 86, 81, 91, 86]
rows = [Feature("height", heights)]
target = Feature("weight", weights)

line = RidgeRegression(penalty=1.0).fit(rows, target)
print(f"line R2 {line.score(rows, target):.3f}")

for gamma in (1, 0.01, 0.0001):
    kernel = RadialBasisKernel(gamma=gamma)
    model = KernelRidgeRegression(kernel=kernel, penalty=1.0).fit(rows, target)
    largest = max(abs(float(weight)) for weight in model.dual_weights)
    at_173 = float(model.predict([Feature("height", [173])])[0])
    print(f"gamma {gamma}: R2 {model.score(rows, target):.3f}, largest dual weight {largest:.4f}, at 173 cm {at_173:.2f} kg")`,`line R2 0.890
gamma 1: R2 0.750, largest dual weight 10.4997, at 173 cm 74.00 kg
gamma 0.01: R2 0.835, largest dual weight 9.2864, at 173 cm 72.19 kg
gamma 0.0001: R2 0.481, largest dual weight 15.4921, at 173 cm 72.01 kg`,{...{ hints: ["RadialBasisKernel takes gamma as its one field, and a RidgeRegression at the same penalty is the line to compare against. Both fit on the same list of Features and both score with score(rows, target).", "dual_weights is a numpy array with one entry per person, so the largest in size is the max of abs over it, and predict takes a list holding one Feature of the heights to ask about."], check: numberCheck("What is the largest dual weight, in size, at gamma 1 on the crowd?", 10.4997, 0.0005, "At this short comparison range, different training people have almost no cross-similarity. The dual solve therefore depends heavily on each person's centered target, which explains why the largest absolute weight belongs to a target far from the mean.") },question:"What happens when a kernel width suited to seconds is applied to centimeters?"}),
            exercise("Ask each fit what the ball does after the data",["Fit the three supplied settings to the fifteen throw readings: radial kernel with gamma=1 and penalty=0.1, degree-two polynomial with penalty=1, and linear kernel with penalty=1. Predict height at 5, 6, 7 and 8 seconds using each fitted model.", "Print the four predictions for each model to three decimal places. Also print the radial model's prediction at eight seconds to six decimal places and its retained target mean. Compare their behavior beyond the observed interval with the assumptions of free flight."],`from oop_ml import Feature, KernelRidgeRegression, LinearKernel, PolynomialKernel, RadialBasisKernel

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
rows = [Feature("time", times)]
target = Feature("height", heights)
later = Feature("time", [5.0, 6.0, 7.0, 8.0])

settings = [
    ("radial, gamma 1, penalty 0.1", RadialBasisKernel(gamma=1.0), 0.1),
    ("polynomial, degree 2, penalty 1", PolynomialKernel(degree=2), 1.0),
    ("linear, penalty 1", LinearKernel(), 1.0),
]
# For each setting, fit the model on the throw and print its predictions at
# the four later times. Then print the radial answer at 8 s to six places
# and the mean height the fit adds back.`,`from oop_ml import Feature, KernelRidgeRegression, LinearKernel, PolynomialKernel, RadialBasisKernel

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
rows = [Feature("time", times)]
target = Feature("height", heights)
later = Feature("time", [5.0, 6.0, 7.0, 8.0])

settings = [
    ("radial, gamma 1, penalty 0.1", RadialBasisKernel(gamma=1.0), 0.1),
    ("polynomial, degree 2, penalty 1", PolynomialKernel(degree=2), 1.0),
    ("linear, penalty 1", LinearKernel(), 1.0),
]
for label, kernel, penalty in settings:
    model = KernelRidgeRegression(kernel=kernel, penalty=penalty).fit(rows, target)
    answers = ", ".join(f"{float(height):.3f}" for height in model.predict([later]))
    print(f"{label}: {answers} m at 5, 6, 7 and 8 s")

radial = KernelRidgeRegression(kernel=RadialBasisKernel(gamma=1.0), penalty=0.1).fit(rows, target)
print(f"radial at 8 s to six places {float(radial.predict([Feature('time', [8.0])])[0]):.6f} m")
print(f"mean height {radial.target_mean:.2f} m")`,`radial, gamma 1, penalty 0.1: 7.468, 12.464, 12.758, 12.760 m at 5, 6, 7 and 8 s
polynomial, degree 2, penalty 1: -19.494, -49.782, -88.799, -136.545 m at 5, 6, 7 and 8 s
linear, penalty 1: 13.543, 13.805, 14.066, 14.327 m at 5, 6, 7 and 8 s
radial at 8 s to six places 12.759998 m
mean height 12.76 m`,{...{ hints: ["predict takes a list holding one Feature, and that Feature can hold several times at once, so the four later times go in as one Feature and four predictions come back in the same order.", "The penalty differs between the settings, so build a fresh KernelRidgeRegression for each kernel and penalty rather than refitting one model.", "target_mean is the mean height the fit adds back to every prediction, which is what the radial fit returns to once every kernel term has fallen to nothing."], check: numberCheck("What height does the squared polynomial kernel answer at seven seconds, in meters?", -88.799, 0.001, "The polynomial kernel continues its fitted algebraic pattern beyond the observations. The radial comparisons instead fade with distance, leaving the retained target mean. Neither behavior is a guarantee about a ball outside the measured interval.") },question:"How do the fitted kernels extrapolate beyond the ball's observations?"}),
            exercise("Refuse what is not a kernel, then watch it slip through",["First construct KernelRidgeRegression with a zero penalty and catch the constructor's validation error. Then use the supplied throw data with a sigmoid kernel at gamma 1 and constant -0.5. Try the listed penalties around the point at which its shifted Gram system becomes positive definite.","Print each fitting error's class name and whether its message contains Mercer. For accepted fits, print R². Distinguish the numerical factorization check from a proof that the kernel function is positive semidefinite. A successful solve need not have the usual kernel-ridge interpretation."],`from oop_ml import Feature, KernelRidgeRegression, MLLibError, SigmoidKernel

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
rows = [Feature("time", times)]
target = Feature("height", heights)

# Try to construct a model with a penalty of zero, catch the refusal and
# print the name of its class. Then, with the sigmoid kernel at gamma 1 and
# a constant of -0.5, fit at penalties 1, 4.3, 4.4 and 5: print the class
# of each refusal and whether its message names Mercer, or the R2 of each
# fit that is accepted.`,`from oop_ml import Feature, KernelRidgeRegression, MLLibError, SigmoidKernel

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
rows = [Feature("time", times)]
target = Feature("height", heights)

try:
    KernelRidgeRegression(kernel=SigmoidKernel(), penalty=0.0)
except ValueError as refusal:
    print(f"penalty 0: {type(refusal).__name__} at construction")

kernel = SigmoidKernel(gamma=1.0, constant=-0.5)
for penalty in (1.0, 4.3, 4.4, 5.0):
    model = KernelRidgeRegression(kernel=kernel, penalty=penalty)
    try:
        model.fit(rows, target)
        print(f"penalty {penalty}: accepted, R2 {model.score(rows, target):.1f}")
    except MLLibError as refusal:
        print(f"penalty {penalty}: {type(refusal).__name__}, names Mercer: {'Mercer' in str(refusal)}")`,`penalty 0: ValidationError at construction
penalty 1.0: InvalidValuesError, names Mercer: True
penalty 4.3: InvalidValuesError, names Mercer: True
penalty 4.4: accepted, R2 -228.4
penalty 5.0: accepted, R2 -4.5`,{...{ hints: ["A penalty of zero is refused by the model’s field bounds, so the error is pydantic’s and arrives as a ValueError before fit is ever called. The sigmoid’s refusal comes out of fit and is one of the library’s own, so catch MLLibError there.", "SigmoidKernel takes gamma and constant as its two fields. Build one kernel and a fresh KernelRidgeRegression for each penalty, since the penalty is a field too.", "type(refusal).__name__ gives the class and str(refusal) the message, and the message names Mercer’s condition, so the in operator on the string is enough to confirm it."], check: numberCheck("What R² does the sigmoid fit score once a penalty of 4.4 lets it through?", -228.4, 0.1, "A large diagonal shift can make this particular linear system positive definite even though the original Gram matrix is indefinite. A successful solve therefore does not establish a valid positive-semidefinite kernel or the usual RKHS ridge interpretation. Its poor score is a separate measured result.") },question:"Can regularization make a solve succeed without making its kernel valid?"}),
          ],
        },
      ]}
    />
  );
}
