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
  title: "Kernel Ridge Regression · oop_ml",
  description:
    "Ridge regression gives us a way to control a fit, but its original features may not describe the relationship well. Kernel comparisons let us apply the same idea in a transformed feature space.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KernelRidgePage() {
  return (
    <ConceptPage
      lessonId="kernel-ridge"
      intuition={lessonIntuitions["kernel-ridge"]}
      technicalStart="Part 2. One Number Per Row"
      openingTitle="Build a Curve from Similarities to the Training Points"
      playgroundIntro="Compare the ordinary and kernel-based fits. Vary the penalty and watch how closely the prediction follows individual training points."
      title="Kernel Ridge Regression"
      tagline={"Ridge regression gives us a way to control a fit, but its original features may not describe the relationship well. Kernel comparisons let us apply the same idea in a transformed feature space."}
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
<p>
                  The ridge page fits a line to the thrown ball and to the crowd by choosing one weight per feature, and it chooses the weights by solving a system as wide as there are features. On the fifteen throws there is one feature, the time, and the line that comes out scores an R² of 0.003, since the ball goes up and comes down and a line can do only one of those.
                </p>
                <p>
                  On the fifteen people the line scores 0.890 with a slope of 0.826 kilograms per centimetre. Nothing on this page changes what ridge minimises.
                </p>
</>
                <Equation>{"minimise  ‖y − Xw‖² + λ‖w‖²"}</Equation>
                <Equation>{"w = (XᵀX + λI)⁻¹ Xᵀ y"}</Equation>
                <p>
                  The matrix being inverted is p by p, where p counts the
                  features. That is the fact to hold onto, because the whole
                  page is about finding a second way to write w whose matrix
                  is n by n, where n counts the rows, and then noticing what
                  the second way lets us do that the first cannot.
                </p>
                <KeepInMind>
                  The penalty page owns the penalty. Everything it says about
                  λ shrinking the weights and about scaling the columns first
                  still holds here, since the objective has not changed.
                  What changes is how the minimiser is written down.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The same line written as a sum over rows">
                <p>
                  Ridge&rsquo;s answer can be pushed through to a second
                  form. Instead of one weight per feature it becomes one
                  weight per training row, and the fitted w is the sum of
                  the rows, each multiplied by its own weight. The two forms
                  describe the same line, and the derivation is three lines
                  of algebra with one honest condition on it, which section
                  17 returns to.
                </p>
                <Equation>{"w = Xᵀ (XXᵀ + λI)⁻¹ y = Xᵀ a"}</Equation>
                <Equation>{"a = (K + λI)⁻¹ y,   K = XXᵀ"}</Equation>
                <p>
                  The vector a is called the dual weights, and it has one
                  entry per row. The matrix K is n by n and holds the inner
                  product of every training row with every other, and it is
                  called the Gram matrix. Nothing else about the rows
                  survives into the solve. A prediction is then an inner
                  product too, the new row against each training row,
                  weighted by a.
                </p>
                <Equation>{"prediction(x) = xᵀw = Σᵢ aᵢ (x · xᵢ) + ȳ"}</Equation>
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
                  <p>
                    The condition is that X is what the derivation says it
                    is, a matrix of centred columns with no intercept
                    column, since the intercept is exempt from the penalty
                    on the left and there is no way to exempt one row of K on
                    the right. Centring both the columns and the target does
                    the intercept&rsquo;s job instead.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The dual form is ridge regression&rsquo;s own minimiser
                  written as a combination of the training rows, and under
                  the plain inner product it has to give the identical line.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Where the features went">
                <p>
                  Take the three people at 169, 170 and 171 centimetres,
                  weighing 64, 70 and 76 kilograms. Centred on their mean of
                  170 the heights are −1, 0 and 1, and the Gram matrix is
                  the three by three table of their products, which is the
                  only thing the solve ever reads about them. The middle row
                  and column are all zero, because the middle person is at
                  the mean and has no centred height to multiply.
                </p>
                <GramMatrixView dataset="three" />
                <p>
                  Switch to the radial basis kernel and the same three people
                  produce a different table, with ones down the diagonal,
                  0.368 for the two pairs a centimetre apart and 0.018 for
                  the pair two centimetres apart. The rows have not changed.
                  What changed is the function that turns two rows into one
                  number, and that function is what the rest of the page
                  varies.
                </p>
                <p>
                  The fifteen throws make a fifteen by fifteen table, and
                  drawn as a heat map the three kernels look nothing alike.
                  The linear kernel&rsquo;s table is the outer product of one
                  column with itself, bright in the corners and zero along
                  the middle where the centred time passes through nought;
                  the radial one is a band along the diagonal, each throw
                  similar to its neighbours in time and to nothing far away.
                </p>
                <GramMatrixView dataset="throw" />
                <p>
                  The eigenvalues under each table say how many directions
                  the table can tell apart. Under the linear kernel fourteen
                  of the fifteen are zero to within rounding, the largest at
                  about 4e−15, and one is 22.834; a rank-one table can fit
                  exactly one direction, which is a line. The squared
                  polynomial kernel has three nonzero eigenvalues and the
                  radial kernel has fifteen, its smallest 8.1e−9.
                </p>
                <KeepInMind>
                  Once the Gram matrix exists the features are gone. The
                  solve reads an n by n table of pairwise comparisons and
                  nothing else, which is exactly the property that lets a
                  kernel be swapped in.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. The identity holds on the throw, to the number">
                <p>
                  A derivation is a claim, and the fifteen throws are where
                  it is checked. Fit ridge regression feature by feature and
                  the dual form row by row under the plain inner product, at
                  the same penalty, and compare everything that can be
                  compared.
                </p>
                <IdentityLedger />
                <p>
                  At a penalty of one, ridge reports a slope of 0.261135 and
                  the dual weights, added up through the centred times, give
                  0.261135. Sampled at 81 times across the throw the two
                  lines part by at most 3.7e−14, both score 0.002588, and
                  both answer 12.76 metres at two seconds, which is the mean
                  height because two seconds is the mean time. Drag the
                  penalty through six orders of magnitude and the two
                  columns stay equal to the last printed digit.
                </p>
                <InAModel title="What the control is for">
                  <p>
                    Under the radial basis kernel there is no independent
                    right answer to compare a kernel fit against, so a bug
                    that produced a plausible curve would go unseen. Under
                    the linear kernel there is one, and it is ridge exactly.
                    Section 17 shows the bug that this control found, which
                    came within two percent of the right slope and was wrong
                    for a reason.
                  </p>
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
                    The three centred heights are minus one, zero and one; their centred
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
                      centred height and adding.
                    </p>
                  </>
                  <Equation>{"(−2)(−1) + (0)(0) + (2)(1) = 4"}</Equation>
                  <>
                    <p>
                      Use the recovered slope to predict half a centimetre above the
                      mean height.
                    </p>
                    <Equation>{"prediction = mean weight + slope × centred height\n           = 70 + 4 × 0.5 = 72 kg"}</Equation>
                    <p>
                      Both formulations give this result.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  The person at the mean carries a weight of zero and
                  contributes nothing to any prediction, and the two outer
                  people carry equal and opposite weights. A row at the
                  centre of the data tells a straight fit nothing about its
                  slope, and the dual form says so directly where the
                  per-feature form never mentions individual rows at all.
                </p>
              </SubSection>

              <SubSection title="6. A dual weight is a residual divided by the penalty">
                <p>
                  There is a plainer reading of what each weight is, and it
                  holds under every kernel. Rearrange the system that defines
                  the weights and the left side becomes the fitted values,
                  so the weights are the misses of the fit, each divided by
                  the penalty.
                </p>
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
                  A dual weight is a scaled residual. A row the fit passes
                  through has a weight of zero however far from the centre it
                  is, and a row the fit misses badly pulls hard on every
                  prediction near it, so the largest weight on the throw went
                  from 12 to 12,105 when the penalty fell from one to a
                  thousandth while the line hardly moved.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What the model keeps instead of coefficients">
                <>
<p>
                  Ridge regression on the crowd keeps three numbers, a weight for height, an intercept, and nothing else, and &ldquo;0.826 kilograms per centimetre&rdquo; is a sentence about height. The dual model keeps every training row and a weight for each, so on fifteen people it keeps fifteen heights and fifteen weights, and a prediction is a sum over all of them.
                </p>
                <p>
                  There is no per-feature number to report. It is possible to add the weights up through the centred heights and recover the slope, as section 5 did, only because under the linear kernel there is a slope to recover; under the radial kernel there is not, and the playground says so rather than inventing one.
                </p>
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
                  Kernel ridge regression has no coefficients, and no
                  implementation could supply them, since in the space a
                  kernel implies the features have no names for a weight to
                  be bound to.
                </KeepInMind>
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
                "It minimises a different objective, with the penalty falling on the rows rather than the features",
                "It carries an intercept that the per-feature form has to do without",
                "It reaches the answer by iteration where the other reaches it in one solve",
              ],
              0,
              "Nothing on this page changes what ridge minimises. The matrix ridge inverts is as wide as the features and the dual’s is as wide as the rows, and under the plain inner product the two describe the same line. There is no iteration anywhere here.",
            ),
            trueFalse(
              "The dual derivation holds whether or not the columns are centred, since the penalty is the same either way.",
              false,
              "The condition is that the rows come in centred with no intercept column. The intercept is exempt from the penalty in the per-feature form and there is no way to exempt one row of the Gram matrix on the other side, so centring both the columns and the target does the intercept’s job instead.",
            ),
            trueFalse(
              "A dual weight is a residual divided by the penalty, so a row the fit passes through carries a weight of zero however far from the centre it sits.",
              true,
              "Rearranging the system that defines the weights puts the fitted values on the left, so the penalty times a weight is that row’s miss. On the three people at a penalty of one the fitted weights are 66, 70 and 74 kilograms, the residuals are −2, 0 and 2, and dividing by one gives the dual weights back.",
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
              "The residuals stay where they are and the divisor shrinks, so the weights grow as one over the penalty. That is also why a weight is not an importance, since the largest one belongs to the row the fit missed by most whatever that row had to say about the shape.",
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
              "That is 31 numbers against ridge’s three, and every prediction touches all fifteen rows. There is no per-feature number to report and no implementation could supply one, since in the space a kernel implies the features have no names for a weight to be bound to. A slope can be recovered under the linear kernel only because there is a slope there to recover.",
            ),
        ],
        },
        {
          title: "Part 3. Swapping the Inner Product for a Kernel",
          content: (
            <>
              <SubSection title="8. The swap, and what stays the same">
                <p>
                  Everything in Part 1 reads the rows through one function,
                  the inner product of two of them. The kernel trick page
                  argues that any function which is an inner product in some
                  expanded space, whether or not that space is ever built,
                  can stand in for it, and this page takes that as given.
                  Replace the inner product wherever it appears, in the Gram
                  matrix and in the prediction, and nothing else about the
                  fit changes.
                </p>
                <Equation>{"K[i, j] = k(xᵢ, xⱼ)"}</Equation>
                <Equation>{"a = (K + λI)⁻¹ y_centred"}</Equation>
                <Equation>{"prediction(x) = Σᵢ aᵢ k(x, xᵢ) + ȳ"}</Equation>
                <p>
                  The solve is the same solve, the penalty is the same
                  penalty on the same diagonal, and the dual weights are
                  still the residuals over the penalty. What the swap buys is
                  a curve, drawn without a single manufactured column, in the
                  original picture of time against height.
                </p>
                <NumberTable
                  headings={["kernel", "what it computes on centred rows", "on the throw, penalty 1"]}
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
                <p>
                  The polynomial kernel raises the inner product plus one to
                  a power, and the plus one is what lets every lower power
                  ride along with the highest. On the fifteen throws the
                  degree does what the polynomial page&rsquo;s manufactured
                  columns did, except that no column is ever built.
                </p>
                <KernelGallery family="polynomial" dataset="throw" values={[1, 2, 3, 4, 5, 6]} />
                <p>
                  Degree 2 follows the arc at 0.981, degree 3 reaches 0.985,
                  and degrees 4, 5 and 6 come out at 0.981, 0.982 and 0.980,
                  so past the square the extra powers buy nothing on this
                  throw at this penalty. What they cost is visible in the
                  condition number of the system, which goes 23.8, 72.4,
                  262, 1061, 4597 and 20,781 as the degree rises, since the
                  largest entries of the Gram matrix are centred times raised
                  to the degree and the smallest stay near zero.
                </p>
                <KeepInMind>
                  The degree sets how many directions the Gram matrix can
                  tell apart, and on one feature that is the degree plus one.
                  Raising it past what the data needed left the score where it
                  was on this throw and multiplied the condition number by
                  about four per degree.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Degree one with a constant is the linear kernel here">
                <p>
                  The textbook reading is that the polynomial kernel at
                  degree one is not the linear kernel, because the plus one
                  adds a constant to every entry of the Gram matrix and a
                  constant entry is a feature that is always one. I measured
                  it and found the two fits identical here. On the
                  throw at a penalty of one the two curves part by 2.0e−14,
                  and on the three people by 3.9e−12, which is the arithmetic
                  of a solve and not a difference of model.
                </p>
                <Equation>{"K_degree1 = K_linear + 11ᵀ"}</Equation>
                <WhyThisWorks title="Why centring makes the constant vanish">
                  <p>
                    The fit centres the rows, so every column of X sums to
                    zero and the Gram matrix K sends the all-ones vector to
                    zero. The fit also centres the target, so y_centred is
                    perpendicular to the all-ones vector. The added 11ᵀ acts
                    only along that vector, and the solve never leaves the
                    space perpendicular to it, so the added term is never
                    touched. Without the centring the textbook reading would
                    hold and the constant would act as a penalised intercept.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Which claims hold depends on what the implementation
                  centres. This one centres both the rows and the target, and
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
                  neighbours in time.
                </p>
                <KernelGallery family="rbf" dataset="throw" values={[0.01, 0.1, 0.3, 1, 3, 10]} />
                <>
<p>
                  At gamma 0.01 every throw looks like every other and the fit is a curve that is nearly straight at 0.012. At 0.1 it reaches 0.450, at 0.3 it follows the arc at 0.797, at 1 it scores 0.873, at 3 it peaks at 0.880, and by 10 each throw is similar only to itself, the smallest Gram eigenvalue has risen from 8.1e−9 at gamma 1 to 0.202, and the curve dips toward the mean between the throws for a score of 0.844.
                </p>
                <p>
                  At a hundred the table is the identity to four decimals and the fit is the mean plus a bump at each throw.
                </p>
</>
                <KeepInMind>
                  Gamma is a reach in the feature&rsquo;s units. At a hundredth
                  the fit was too inflexible to follow the curve and scored 0.012; at ten it followed the curve
                  only within a fraction of a second of each throw and dipped
                  toward the mean between them. It has to be chosen, and the
                  penalty page&rsquo;s cross-validation is the way to choose it.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Gamma is in the feature's own units, on the crowd">
                <p>
                  Gamma multiplies a squared distance, so it carries the
                  inverse square of whatever the feature is measured in.
                  The gamma of 1 that suited times in seconds is a reach of
                  one second; applied to heights in centimetres it is a reach
                  of one centimetre, and the people are three apart.
                </p>
                <KernelGallery family="rbf" dataset="crowd" values={[1, 0.1, 0.01, 0.001, 0.0003, 0.0001]} />
                <>
<p>
                  At gamma 1 on the crowd the Gram matrix is the identity to four decimals, the smallest eigenvalue 0.99976, so every dual weight is half that person&rsquo;s centred weight and the curve visits each person and returns to the mean of 72 between them. Asked about the person at 173 centimetres it answers 74.0, halfway from the mean to their 76 kilograms, and asked about 174.5, between two people, it answers 72.16.
                </p>
                <p>
                  The score is 0.750, below the line&rsquo;s 0.890. Widen the reach to a hundredth and the score is 0.835; at a thousandth 0.824; at a ten-thousandth the kernel can no longer tell the tallest from the shortest and the score falls to 0.481. Nothing here beats the line, because the crowd was drawn along one.
                </p>
</>
                <KeepInMind>
                  The same gamma means different things in seconds and
                  centimetres. Either scale the feature first, as the
                  kernel-trick page does, or expect the useful gamma to
                  change by the square of the unit change, which here was a
                  factor of a hundred to a thousand.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Three people under three kernels">
                <p>
                  The three people are small enough that every kernel&rsquo;s
                  answer can be read whole. Each fit is asked the same
                  question, what a person of 170.5 centimetres weighs, and
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
                <p>
                  The middle weight is zero under every kernel, for the
                  reason section 6 gave. The middle person weighs the mean,
                  every one of these fits passes through the mean, so their
                  residual is zero and so is their weight. The outer weights
                  differ because the kernels differ about how much the outer
                  two people resemble each other, 1 against −1 under the
                  linear kernel and 0.018 under the radial one.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Penalty in the Dual",
          content: (
            <>
              <SubSection title="14. Every diagonal entry takes the penalty">
                <p>
                  On the ridge page the penalty matrix has a zero in its
                  first slot so the intercept is not shrunk, and the page
                  records the bug that came from zeroing that slot when there
                  was no intercept column to exempt. The dual system has no
                  columns at all. Its matrix is indexed by training rows on
                  both sides, and no row is an intercept, so the penalty is
                  added to every entry of the diagonal with no exemption.
                </p>
                <Equation>{"K + λI,   every diagonal entry, no exemption"}</Equation>
                <p>
                  Exempting row zero would leave one arbitrary person
                  unpenalised, a fit that still runs, still draws a curve,
                  and is quietly wrong. What does the intercept&rsquo;s job
                  instead is the centring. Both the rows and the target have
                  their means removed before the solve and the target mean is
                  added back to every prediction, which is why every fit on
                  this page passes through the mean point and why the throw
                  answers exactly 12.76 at two seconds under any kernel.
                </p>
                <KeepInMind>
                  Ridge exempts its intercept from the penalty; the dual has
                  no intercept to exempt and centres instead. The two are the
                  same rule reached two ways, and section 17 shows what
                  centring only half of the data does.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. A small penalty interpolates and ill-conditions">
                <p>
                  The ridge page describes the penalty as a trade of fit
                  against restraint. In the dual there is a second thing it
                  does that has no counterpart on that page, since the Gram
                  matrix of a radial kernel on distinct rows is positive
                  definite and only barely, its smallest eigenvalue on the
                  throw at gamma 1 being 8.1e−9, and adding the penalty to
                  the diagonal is what makes the solve possible at all.
                </p>
                <PenaltySweepChart />
                <p>
                  At a penalty of a billionth the radial curve scores
                  0.999998 on the throws and swings 122 metres from the mean
                  between them, the largest dual weight is 1.6e7 and the
                  condition number of the system is 6.2e8, which is nine
                  digits of accuracy lost from sixteen. At a millionth the
                  score is still 0.99955 with a condition number of 5.6e6 and
                  a swing of 17.8; at a tenth it is 0.987 with a condition
                  number of 57.5 and the curve stays within 11 metres of the
                  mean; at one, 0.873 and 6.65.
                </p>
                <WhyThisWorks title="Why the condition number is what it is">
                  <>
                    <p>
                      Adding a positive penalty to the diagonal shifts every eigenvalue
                      by that amount. The condition number compares the largest shifted
                      eigenvalue with the smallest.
                    </p>
                    <Equation>{"condition number = (largest eigenvalue + λ) / (smallest eigenvalue + λ)"}</Equation>
                    <p>
                      On the throw with gamma one, the largest eigenvalue is about 5.650
                      and the smallest about 8.1 billionths.
                    </p>
                    <Equation>{"at λ = 1:    condition number ≈ 6.650 / 1 ≈ 6.65\nat λ = 10⁻⁹: condition number ≈ 5.650 / (8.1 × 10⁻⁹ + 10⁻⁹)\n                             ≈ 6.2 × 10⁸"}</Equation>
                    <p>
                      The linear kernel has fourteen zero eigenvalues and a condition
                      number around 23 billion at the smaller penalty. Its fitted curve
                      still changes very little here because the target lies in the one
                      direction its Gram matrix represents.
                    </p>
                  </>
                </WhyThisWorks>
                <KeepInMind>
                  The penalty is not optional here in the way it is optional
                  for least squares. At zero the radial solve is numerically
                  hopeless and the fit passes through every training row,
                  and a zero penalty is refused at construction
                  rather than at the solve.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A large penalty flattens onto the mean">
                <p>
                  At the other end the penalty dominates and the curve goes
                  flat. With the dual weights being residuals over the
                  penalty, a large penalty makes every weight small whatever
                  the residuals are, and a prediction is the mean plus a sum
                  of small numbers.
                </p>
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
                  By a thousand the curve is within three centimetres of
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

              <SubSection title="17. Centring both sides, and the control that caught it">
                <p>
                  The derivation in section 2 holds on centred data. Both
                  the target and the rows have to have their means removed,
                  and when this model was first built here only
                  the target was. The result is the most instructive kind of
                  bug, a fit that still ran, still drew a plausible line and
                  agreed with ridge to within two percent, 4.2841 against
                  4.3580 on the fixture it was first measured on.
                </p>
                <CentringControl />
                <>
<p>
                  On the crowd the mistake is not subtle at all. The heights are a hundred and seventy centimetres from the origin, so the uncentred Gram matrix is dominated by that offset, and the half-centred fit reports a slope of 0.0046 kilograms per centimetre where both right fits report 0.8259, and answers 72.80 at the mean height where the right lines answer exactly 72.
                </p>
                <p>
                  Drop the penalty to a thousandth and the right fits rise to 0.8262 while the wrong one stays at 0.0046. On the throw, where the times are near the origin, the wrong slope is 0.0742 against 0.2611, which is the closer-looking version of the same failure.
                </p>
</>
                <KeepInMind>
                  A fit that centres the target and not the rows is
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
              "The polynomial kernel at degree one is not the linear kernel, because the plus one adds a constant to every entry of the Gram matrix.",
              false,
              "That is the textbook reading, and measured the two fits are identical here, parting by 2.0e−14 on the throw and 3.9e−12 on the three people. This fit centres the rows and the target, so the added term acts only along the all-ones vector and the solve never leaves the space perpendicular to it. Without the centring the textbook reading would hold and the constant would act as a penalised intercept.",
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
              "Degree 2 follows the arc at 0.981 and degree 3 reaches 0.985, and 4, 5 and 6 come out at 0.981, 0.982 and 0.980. The degree sets how many directions the Gram matrix can tell apart, which on one feature is the degree plus one, and the largest entries are centred times raised to the degree while the smallest stay near zero.",
            ),
            trueFalse(
              "Gamma is a pure number, so the gamma of 1 that suited times in seconds is the same reach on heights in centimetres.",
              false,
              "Gamma multiplies a squared distance, so it carries the inverse square of whatever the feature is measured in, and a gamma of 1 is a reach of one unit, one second on the throw and one centimetre on the crowd, whose people stand three apart. At gamma 1 on the crowd the Gram matrix is the identity to four decimals, so the curve visits each person and returns to the mean of 72 between them for a score of 0.750 against the line’s 0.890. Either scale the feature first or expect the useful gamma to change by the square of the unit change, which here was a factor of a hundred to a thousand.",
            ),
            several(
              "Which of these hold for the radial kernel at gamma 1 on the fifteen throws as the penalty is swept?",
              [
                "At a penalty of a billionth the curve scores 0.999998 on the throws and swings 122 metres from the mean between them",
                "At a penalty of a thousand the curve strays at most 0.031 metres from the mean and scores 0.005",
                "The condition number of the system falls as the penalty falls, since a smaller penalty disturbs the Gram matrix less",
                "A penalty of zero would score exactly 1 and is where the sweep ends",
              ],
              [0, 1],
              "The penalty is added to every eigenvalue of the Gram matrix, so the condition number is the largest shifted eigenvalue over the smallest, 6.65 at a penalty of one and 6.2e8 at a billionth, where the smallest Gram eigenvalue of 8.1e−9 is nearly all that holds the system up. A penalty of zero is refused at construction, and the sweep stops at a billionth because that is where the solve still completes. At the other end the dual weights are residuals over the penalty, so a thousand makes every weight small whatever the residuals are and the curve flattens onto the mean.",
            ),
            trueFalse(
              "Centring the target but not the rows gave a fit that still ran and agreed with ridge to within two percent on the fixture it was first measured on.",
              true,
              "4.2841 against 4.3580, which is close enough to read as rounding. On the crowd the same mistake is not subtle at all, reporting a slope of 0.0046 kilograms per centimetre where both right fits report 0.8259, and dropping the penalty moves the right fits and leaves the wrong one where it is. The linear kernel is what caught it, which is the argument for keeping a control whose right answer is known.",
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
                <p>
                  On the machine I measured on, the kernel fit took 0.09
                  milliseconds at fifty rows and 121 milliseconds at sixteen
                  hundred, roughly a thousandfold for a thirty-twofold
                  increase in rows, which is the n-cubed solve of an n by n
                  system, while ridge stayed between 0.02 and 0.06
                  milliseconds throughout. Growing the features instead,
                  from two to sixty-four at two hundred rows, took ridge from
                  0.04 to 0.30 milliseconds and the kernel fit from 1.2 to
                  3.1, the kernel&rsquo;s share coming from building the Gram
                  matrix, which touches every feature once per pair of rows.
                </p>
                <Equation>{"ridge:  solve p × p,   kernel ridge:  solve n × n"}</Equation>
                <KeepInMind>
                  The dual is a saving when the features outnumber the rows,
                  which is what an expanded space does to a small dataset,
                  and a cost when the rows outnumber the features. A million
                  rows make a million by million table, and the saving runs
                  the other way.
                </KeepInMind>
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
                  <p>
                    A saved kernel ridge model is its training rows. There
                    is no smaller description of the fit, since every
                    prediction needs the kernel against each row, and a
                    document that dropped them would silently lose the
                    ability to predict. The support vector machine on the
                    kernel-trick page keeps only the rows that touch its
                    margin, which is the one respect in which it is the
                    smaller model.
                  </p>
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
                <p>
                  A radial kernel is a bump around each training row, and a
                  query far from every row is similar to none of them, so
                  every term in its prediction is near zero and what is left
                  is the mean. The throw was measured for four seconds. Ask
                  the radial fit what the ball is doing at six.
                </p>
                <ExtrapolationView />
                <>
<p>
                  At gamma 1 and a penalty of a tenth the curve answers 7.47 metres at five seconds, already off the last throw, 12.46 at six, 12.758 at seven and 12.759998 at eight, against a mean of 12.76. Two seconds past the data the fit has forgotten the ball entirely and is answering the average height of the throw.
                </p>
                <p>
                  The squared polynomial kernel does the opposite and keeps its shape, answering −19.5 at five seconds, −49.8 at six and −136.5 at eight, which is the polynomial page&rsquo;s runaway drawn without columns. The line answers 14.33 at eight seconds and would keep the same slope forever.
                </p>
</>
                <KeepInMind>
                  None of the three answers is a fact about the ball. The
                  radial fit&rsquo;s return to the mean is the least
                  dangerous of them only because a mean is a number a reader
                  recognises as ignorance, where a polynomial&rsquo;s −136
                  looks like a prediction.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. No coefficient per feature, no intercept to report">
                <p>
                  Two things ridge reports that this model cannot. A
                  coefficient per feature, for the reason section 7 gave,
                  and an intercept, because there was never an intercept
                  column. What there is instead is the target mean, added
                  back to every prediction, and on the crowd it is 72
                  kilograms. Under the linear kernel a slope and an
                  intercept can be reconstructed from the weights and the
                  mean, and the centring widget does exactly that to compare
                  against ridge; under any other kernel the reconstruction
                  has nothing to reconstruct.
                </p>
                <KeepInMind>
                  Do not read the dual weights as importances. Section 6
                  showed they are residuals over the penalty, so the largest
                  weight belongs to the row the fit missed by most, whatever
                  that row had to say about the shape.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. An indefinite kernel is refused by the solver">
                <p>
                  Not every function of two rows is a kernel. A kernel&rsquo;s
                  Gram matrix has no negative eigenvalue on any set of rows,
                  which is Mercer&rsquo;s condition, and the sigmoid kernel
                  fails it for many settings. The solve uses a Cholesky
                  factorisation, which succeeds exactly when the matrix it
                  is given is positive definite, so the factorisation is
                  also the test, and the fit is refused at the first pivot
                  that is not positive.
                </p>
                <MercerProbe />
                <>
<p>
                  On the throws at gamma 1 and a constant of −0.5 the smallest eigenvalue of the Gram matrix is −4.313. At every penalty up to 4.3 the sum with the smallest eigenvalue is negative and the fit is refused, in a message naming Mercer&rsquo;s condition. At 4.4 the sum is positive, the factorisation goes through, and the fit is accepted with a score of −228, which is a curve far worse than answering the mean; at 5 it scores −4.49, at 10 −0.069, and at 100 it is 0.006, the flat line the penalty forces.
                </p>
                <p>
                  Even at a constant of zero the smallest eigenvalue is −0.878, hidden at a penalty of one, and the accepted fit scores 0.0023.
                </p>
</>
                <KeepInMind>
                  The refusal guards the arithmetic only. A large enough penalty can make an indefinite
                  system positive definite, and what comes out then is the
                  minimiser of nothing, so a sigmoid fit that runs is not
                  thereby a kernel fit.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A zero penalty has no answer on a singular Gram matrix">
                <p>
                  Under the linear kernel on the fifteen throws the Gram
                  matrix has one nonzero eigenvalue and fourteen at zero,
                  because fifteen rows of one centred feature span one
                  direction. Without the penalty the system to be solved is
                  that rank-one table, which has no unique solution, and
                  under the squared polynomial kernel twelve of the fifteen
                  eigenvalues are zero for the same reason. The radial
                  kernel&rsquo;s table has no exact zero, its smallest at
                  8.1e−9, and section 15 showed what solving near it costs.
                </p>
                <Equation>{"λ = 0:  K a = y_centred has no unique a when K is singular"}</Equation>
                <p>
                  A penalty of zero is refused when the model is
                  constructed, before any data is seen, and this page
                  refuses it a layer earlier still. The sweep in section 15
                  stops at a billionth for the same reason, since that is
                  where the solve still completes and the condition number
                  is already 6.2e8.
                </p>
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
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="24. What a complete implementation must specify">
                <p>
                  A complete implementation states which kernel and which
                  of its parameters, whether it centres the rows and the
                  target and where the target mean is put back, that the
                  penalty is added to every diagonal entry, which solver
                  factorises the system and what it does when the
                  factorisation fails, whether the dual weights are exposed
                  and that they are not coefficients, that the training rows
                  are kept and are part of the saved model, how the query
                  features are matched to the fitted ones, and the smallest
                  penalty it will accept.
                </p>
                <p>
                  The model here centres both, adds the penalty everywhere,
                  solves by Cholesky, keeps the rows, matches features by
                  name, exposes the dual weights and the training rows as
                  copies, and refuses a penalty that is not positive at
                  construction. Every row of the table below was run against
                  it.
                </p>
              </SubSection>

              <SubSection title="25. The edges, probed">
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "empty data, or a missing or non-finite value", reason: "refused at the boundary, in the same words every feature here is refused with; this page refuses fewer than two points a layer earlier." },
                    { expression: "one row", reason: "accepted by the model; the centred row is zero, its dual weight is zero, and every prediction is the one target value. The page refuses it a layer earlier, before the fit." },
                    { expression: "two rows", reason: "accepted; on the first two throws the radial fit scores 0.144 with weights of ±2.082." },
                    { expression: "a constant column", reason: "accepted by the kernel model, whose Gram matrix is all zeros so the weights are the centred targets over the penalty and every prediction is the mean; this page refuses it, because the ridge control fitted beside it refuses a zero-variance column." },
                    { expression: "a constant target", reason: "fits, with every dual weight exactly zero and every prediction the constant; the score is refused as undefined, since R² divides by the target's variance." },
                    { expression: "two rows at the same input", reason: "accepted; the Gram matrix has two equal rows and a zero eigenvalue at 2.4e−17, and the penalty makes the system solvable." },
                    { expression: "a penalty of zero or below, a gamma of zero, a negative polynomial constant", reason: "refused at construction, by the model's own field bounds, before any data is seen." },
                    { expression: "a sigmoid kernel whose Gram matrix is indefinite", reason: "refused at the solve, when the Cholesky factorisation meets a non-positive pivot, with a message naming Mercer's condition; a penalty larger than the negative eigenvalue lets it through, documented in section 22." },
                    { expression: "a polynomial kernel overflowing on large raw inputs", reason: "at inputs near 1e5 and degree 6 the table loses positive definiteness to rounding and is refused with the Mercer message, which names the wrong cause; only at absurd magnitudes does the non-finite guard fire and name overflow. Documented rather than defended." },
                    { expression: "unfitted use", reason: "reading the dual weights, the training rows or a prediction before fit is refused as not fitted, in a sentence rather than as an attribute error." },
                    { expression: "a query with a feature missing, renamed or added", reason: "refused; prediction demands exactly the fitted feature names, in any order." },
                    { expression: "more than a hundred points, or a curve range that runs backward", reason: "refused with the limit named, a layer before any fit." },
                  ]}
                />
                <p>
                  The constant column deserves the extra sentence, because
                  the two models on this page treat it oppositely. The kernel
                  model alone accepts it and answers the mean everywhere,
                  since with no spread in the column there is nothing for a
                  kernel to compare; the ridge control fitted beside it for
                  the comparison refuses, so the page&rsquo;s endpoint
                  refuses, and the refusal belongs to ridge rather than to
                  the dual.
                </p>
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
              "That is the cubed cost of solving a system as wide as the rows, roughly a thousandfold for a thirty-twofold increase. Growing the features instead took ridge from 0.04 to 0.30 milliseconds and the kernel fit from 1.2 to 3.1, its share coming from building the Gram matrix. So the dual is a saving when the features outnumber the rows and a cost when the rows outnumber the features.",
            ),
            trueFalse(
              "Asked about the ball two seconds past the last throw, the radial fit answers close to the mean height of the whole throw.",
              true,
              "At gamma 1 and a penalty of a tenth it answers 12.46 at six seconds, 12.758 at seven and 12.759998 at eight, against a mean of 12.76, because a query far from every row resembles none of them and every term in the sum is near zero. The squared polynomial kernel does the opposite and answers −136.5 at eight, which is the more dangerous of the two only because a mean is a number a reader recognises as ignorance.",
            ),
            choice(
              "The sigmoid kernel at gamma 1 and a constant of −0.5 has a smallest Gram eigenvalue of −4.313. What happens once the penalty passes 4.3?",
              [
                "The factorisation goes through and the fit is accepted, scoring −228 at 4.4, so a sigmoid fit that runs is not thereby a kernel fit",
                "The fit stays refused at every penalty, since the condition is about the kernel rather than about the system",
                "The fit is accepted and does better than answering the mean",
                "The smallest eigenvalue turns positive, so the kernel now satisfies Mercer’s condition",
              ],
              0,
              "The solve uses a Cholesky factorisation, which succeeds exactly when the matrix it is handed is positive definite, so the factorisation is also the test and the refusal guards the arithmetic only. A large enough penalty can make an indefinite system positive definite and what comes out then is the minimiser of nothing. Even at a constant of zero the smallest eigenvalue is −0.878, hidden at a penalty of one.",
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
              "Fifteen rows of one centred feature span one direction, so fourteen of the linear table’s eigenvalues are zero and twelve of fifteen are under the squared polynomial kernel. The radial table has no exact zero, its smallest sitting at 8.1e−9, and solving near it is what costs nine digits of accuracy out of sixteen at a penalty of a billionth.",
            ),
            choice(
              "Handed a constant input column, the page’s endpoint refuses. Where does that refusal come from?",
              [
                "From the ridge control fitted beside the kernel model, which refuses a zero-variance column; the kernel model alone accepts the column and answers the mean everywhere",
                "From the kernel model, whose Gram matrix is all zeros and so cannot be factorised",
                "From the solver, which meets a pivot that is not positive and names Mercer’s condition",
                "From the model’s own field bounds at construction, before any data is seen",
              ],
              0,
              "With no spread in the column there is nothing for a kernel to compare, so the Gram matrix is all zeros, the system is the penalty times the identity, the dual weights are the centred targets over the penalty and every prediction is the mean. That is a fit, not a refusal, and the factorisation has nothing to object to. The refusal belongs to the ridge control the page fits beside it for the comparison, which refuses a zero-variance column, so the page’s endpoint refuses and the reason is ridge’s rather than the dual’s.",
            ),
        ],
        },
        {
          title: "Practice. One Weight Per Row, With the Library",
          practice: [
            exercise(
              "Recover ridge’s slope from three dual weights",
              ["Part 2 solved the dual system on the three people by hand and found dual weights of minus two, nought and two, then recovered ridge’s slope of four by multiplying each weight by its person’s centred height and adding. Fit the same model with the library under the linear kernel at a penalty of one, read the dual weights and the target mean off it, recover the slope the same way, and ask it for the weight of someone 170.5 centimetres tall.", "The weights should come back whole, the slope should be 4, and the prediction should be 72 kilograms, which is the mean weight plus half a centimetre of slope."],
              `from oop_ml import Feature, KernelRidgeRegression, LinearKernel

heights = [169, 170, 171]
weights = [64, 70, 76]

model = KernelRidgeRegression(kernel=LinearKernel(), penalty=1.0)
# Fit the model to the three people, print its dual weights and target mean,
# recover the slope by adding the weights up through the centred heights,
# and print the weight it predicts at 170.5 cm.`,
              `from oop_ml import Feature, KernelRidgeRegression, LinearKernel

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
print(f"predicted weight at 170.5 cm {predicted:.2f} kg")`,
              `dual weights [-2.0, 0.0, 2.0]
target mean 70.0 kg
recovered slope 4.0000 kg per cm
predicted weight at 170.5 cm 72.00 kg`,
              { hints: ["The kernel is a field of the model, so the model is constructed with kernel=LinearKernel() and penalty=1.0, and then fit takes a list holding one Feature of heights and a Feature of weights as the target.", "dual_weights is a property of the fitted model holding one number per training row in the order the rows were given, and target_mean is the mean the fit adds back to every prediction.", "The centred heights are each height less the mean of 170, so the slope is the sum over the three people of dual weight times centred height, which is the arithmetic Part 2 wrote out."], check: numberCheck("What slope do the dual weights add up to through the centred heights, in kilograms per centimetre?", 4.0, 0.0005, "The dual weights are −2, 0 and 2 and the centred heights are −1, 0 and 1, so the sum is 2 + 0 + 2. That is ridge’s own slope of 4 from Part 2, 12 over 2 plus 1, reached by a system as wide as the rows rather than the features, and the person at the mean contributes nothing to it.") },
            ),
            exercise(
              "Take the throw’s gamma to the crowd",
              ["Part 3 says the gamma of 1 that suited times in seconds is a reach of one centimetre on the crowd, whose people stand three apart, and that the radial fit scores 0.750 there against the line’s 0.890. Fit the line and the radial kernel at gamma 1, a hundredth and a ten-thousandth on the fifteen people, all at a penalty of one, and print each fit’s R², its largest dual weight and its answer for the person at 173 centimetres.", "At gamma 1 the Gram matrix is the identity to four decimals, so Part 3 says every dual weight is half that person’s centred weight. The largest of them is a number the page does not print, and the fifteen weights say whose it is."],
              `from oop_ml import Feature, KernelRidgeRegression, RadialBasisKernel, RidgeRegression

heights = [152, 155, 158, 161, 164, 167, 170, 173, 176, 179, 182, 185, 188, 191, 194]
weights = [51, 61, 56, 66, 62, 71, 66, 76, 71, 81, 75, 86, 81, 91, 86]
rows = [Feature("height", heights)]
target = Feature("weight", weights)

# Fit ridge at a penalty of one and print its R2. Then for gamma 1, 0.01 and
# 0.0001 fit the radial kernel at the same penalty and print its R2, its
# largest dual weight in size, and its prediction for 173 cm.`,
              `from oop_ml import Feature, KernelRidgeRegression, RadialBasisKernel, RidgeRegression

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
    print(f"gamma {gamma}: R2 {model.score(rows, target):.3f}, largest dual weight {largest:.4f}, at 173 cm {at_173:.2f} kg")`,
              `line R2 0.890
gamma 1: R2 0.750, largest dual weight 10.4997, at 173 cm 74.00 kg
gamma 0.01: R2 0.835, largest dual weight 9.2864, at 173 cm 72.19 kg
gamma 0.0001: R2 0.481, largest dual weight 15.4921, at 173 cm 72.01 kg`,
              { hints: ["RadialBasisKernel takes gamma as its one field, and a RidgeRegression at the same penalty is the line to compare against. Both fit on the same list of Features and both score with score(rows, target).", "dual_weights is a numpy array with one entry per person, so the largest in size is the max of abs over it, and predict takes a list holding one Feature of the heights to ask about."], check: numberCheck("What is the largest dual weight, in size, at gamma 1 on the crowd?", 10.4997, 0.0005, "At gamma 1 the Gram matrix is the identity to four decimals, so with a penalty of one the system is twice the identity and every dual weight is half that person’s centred weight. The shortest person weighs 51 kilograms against a mean of 72, a centred weight of −21, and half of that is 10.5 in size; the last digits are where the identity holds only to four decimals. It is the largest because that person sits farthest from the mean weight, not because they matter most to the shape.") },
            ),
            exercise(
              "Ask each fit what the ball does after the data",
              ["Part 6 asks the radial fit what the ball is doing two seconds past the last throw and finds it has forgotten the ball. Fit the widget’s three settings on the fifteen throws, the radial kernel at gamma 1 and a penalty of a tenth, the squared polynomial kernel at a penalty of one, and the line at a penalty of one, and ask each for the height at five, six, seven and eight seconds.", "The radial answers should land on 7.47, 12.46, 12.758 and 12.759998 against a mean of 12.76, and the polynomial ones on −19.5, −49.8 and −136.5 at five, six and eight. What the polynomial kernel answers at seven seconds is a number the page does not quote."],
              `from oop_ml import Feature, KernelRidgeRegression, LinearKernel, PolynomialKernel, RadialBasisKernel

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
# and the mean height the fit adds back.`,
              `from oop_ml import Feature, KernelRidgeRegression, LinearKernel, PolynomialKernel, RadialBasisKernel

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
print(f"mean height {radial.target_mean:.2f} m")`,
              `radial, gamma 1, penalty 0.1: 7.468, 12.464, 12.758, 12.760 m at 5, 6, 7 and 8 s
polynomial, degree 2, penalty 1: -19.494, -49.782, -88.799, -136.545 m at 5, 6, 7 and 8 s
linear, penalty 1: 13.543, 13.805, 14.066, 14.327 m at 5, 6, 7 and 8 s
radial at 8 s to six places 12.759998 m
mean height 12.76 m`,
              { hints: ["predict takes a list holding one Feature, and that Feature can hold several times at once, so the four later times go in as one Feature and four predictions come back in the same order.", "The penalty differs between the settings, so build a fresh KernelRidgeRegression for each kernel and penalty rather than refitting one model.", "target_mean is the mean height the fit adds back to every prediction, which is what the radial fit returns to once every kernel term has fallen to nothing."], check: numberCheck("What height does the squared polynomial kernel answer at seven seconds, in metres?", -88.799, 0.001, "Part 6 quotes −49.8 at six seconds and −136.5 at eight, and seven sits between them on the same runaway. The polynomial kernel raises the inner product plus one to a power, and the inner product with a time far past the data keeps growing, so the curve keeps its shape; the radial kernel’s every term has fallen to nothing by then and what is left is the mean of 12.76.") },
            ),
            exercise(
              "Refuse what is not a kernel, then watch it slip through",
              ["Part 7 says a penalty of zero is refused at construction, before any data is seen, and Part 6 says the sigmoid kernel at gamma 1 and a constant of −0.5 has a smallest Gram eigenvalue of −4.313 on the throws, so the fit is refused at every penalty up to 4.3 and accepted from 4.4. Make both refusals happen, and then let the sigmoid fit through.", "The refusal at construction is pydantic’s, from the model’s own field bounds; the refusal at the solve is the library’s own and names Mercer’s condition. The accepted fit at 4.4 should score −228, which is a curve far worse than answering the mean."],
              `from oop_ml import Feature, KernelRidgeRegression, MLLibError, SigmoidKernel

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
rows = [Feature("time", times)]
target = Feature("height", heights)

# Try to construct a model with a penalty of zero, catch the refusal and
# print the name of its class. Then, with the sigmoid kernel at gamma 1 and
# a constant of -0.5, fit at penalties 1, 4.3, 4.4 and 5: print the class
# of each refusal and whether its message names Mercer, or the R2 of each
# fit that is accepted.`,
              `from oop_ml import Feature, KernelRidgeRegression, MLLibError, SigmoidKernel

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
        print(f"penalty {penalty}: {type(refusal).__name__}, names Mercer: {'Mercer' in str(refusal)}")`,
              `penalty 0: ValidationError at construction
penalty 1.0: InvalidValuesError, names Mercer: True
penalty 4.3: InvalidValuesError, names Mercer: True
penalty 4.4: accepted, R2 -228.4
penalty 5.0: accepted, R2 -4.5`,
              { hints: ["A penalty of zero is refused by the model’s field bounds, so the error is pydantic’s and arrives as a ValueError before fit is ever called. The sigmoid’s refusal comes out of fit and is one of the library’s own, so catch MLLibError there.", "SigmoidKernel takes gamma and constant as its two fields. Build one kernel and a fresh KernelRidgeRegression for each penalty, since the penalty is a field too.", "type(refusal).__name__ gives the class and str(refusal) the message, and the message names Mercer’s condition, so the in operator on the string is enough to confirm it."], check: numberCheck("What R² does the sigmoid fit score once a penalty of 4.4 lets it through?", -228.4, 0.1, "The smallest eigenvalue of the sigmoid’s Gram matrix is −4.313, so at every penalty up to 4.3 the shifted system still has a negative eigenvalue, the Cholesky factorisation meets a pivot that is not positive, and the fit is refused naming Mercer’s condition. At 4.4 the shift is enough to make the system positive definite, the factorisation goes through, and what comes out is the minimiser of nothing, scoring −228 where answering the mean would score zero.") },
            ),
          ],
        },
      ]}
    />
  );
}
