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
    "Ridge regression rewritten so the data appears only inside inner products, one weight per training row instead of per feature, and then the inner product swapped for a kernel.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KernelRidgePage() {
  return (
    <ConceptPage
      title="Kernel Ridge Regression"
      tagline="Ridge regression written as a sum over the rows it was fitted on, which is the form a kernel can be slotted into."
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
      history={
        <>
          <p>
            Arthur Hoerl and Robert Kennard published ridge regression in
            1970 as a repair for least squares on correlated columns, and
            their solve is a matrix as wide as the features. Twenty-eight
            years later Craig Saunders, Alexander Gammerman and Volodya Vovk,
            at Royal Holloway, University of London, wrote the same solution the other
            way round. Their 1998 paper &ldquo;Ridge Regression Learning
            Algorithm in Dual Variables&rdquo; noticed that the ridge answer
            can be written as a weighted sum of the training rows, with one
            weight per row and a matrix as wide as the rows, and that in that
            form the data enters only through inner products between rows.
            The support vector machines of the early 1990s had just made the
            1964 observation of Aizerman, Braverman and Rozonoer famous, that
            a method reading its data only through inner products can have
            them replaced by a kernel, and Saunders and his colleagues applied
            that replacement to ridge regression and gave the result its name.
          </p>
          <p>
            The form itself is older than the name. Danie Krige, estimating
            gold grades on the Witwatersrand in 1951, predicted the grade at
            an unsampled site as a weighted sum over the sampled ones, with
            the weights chosen from how the sites related pairwise, and
            Georges Matheron formalised that into kriging in the 1960s.
            George Kimeldorf and Grace Wahba showed in 1971 that a smoothing
            problem penalised in a reproducing kernel space always has a
            minimiser that is a finite combination of kernel functions placed
            at the data points, one coefficient per observation, which is the
            reason the model on this page keeps its training rows and learns a
            number for each. What none of that settles, and what this page has
            to be plain about, is that a weight per row is not a weight per
            feature. A ridge coefficient says what a centimetre of height is
            worth; a dual weight says how much one measured person pulls on
            every prediction, and no per-feature sentence can be read off it.
          </p>
          <p>
            The page asks six questions in order. How can ridge regression
            be rewritten so the data appears only inside inner products? What
            does the model learn when it learns one number per row? What
            happens when the inner product is swapped for a kernel? What does
            the penalty do in this form? What does the fit cost as the data
            grows? And what can the model not do, and what does it refuse?
          </p>
        </>
      }
      playground={<KernelRidgePlayground />}
      sections={[
        {
          title: "Part 1. The Line Written Two Ways",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Ridge as the penalty page left it">
                <p>
                  The ridge page fits a line to the thrown ball and to the
                  crowd by choosing one weight per feature, and it chooses
                  the weights by solving a system as wide as there are
                  features. On the fifteen throws there is one feature, the
                  time, and the line that comes out scores an R² of 0.003,
                  since the ball goes up and comes down and a line can do
                  only one of those. On the fifteen people the line scores
                  0.890 with a slope of 0.826 kilograms per centimetre.
                  Nothing on this page changes what ridge minimises.
                </p>
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
          ),
        },
        {
          title: "Part 2. One Number Per Row",
          content: (
            <>
              <SubSection title="5. The dual weights on three people">
                <p>
                  On the three people the whole solve can be done by hand.
                  Centred, the heights are −1, 0 and 1 and the weights are
                  −6, 0 and 6, and at a penalty of one the ridge slope is 12
                  divided by 2 plus 1, which is 4. The dual form has to reach
                  the same 4 by a different route, through three numbers,
                  one per person.
                </p>
                <Equation>{"(K + λI) a = y_centred"}</Equation>
                <Equation>{"K + I = [[2, 0, −1], [0, 1, 0], [−1, 0, 2]]"}</Equation>
                <WorkedExample title="The three dual weights">
                  <p>
                    The middle row of the system reads 1 × a₂ = 0, so the
                    middle person&rsquo;s weight is exactly zero. The outer
                    two rows read 2a₁ − a₃ = −6 and −a₁ + 2a₃ = 6, which
                    give a₁ = −2 and a₃ = 2. The fit returns −2, 0 and 2, and
                    the slope is recovered by multiplying each weight by its
                    person&rsquo;s centred height and adding.
                  </p>
                  <Equation>{"(−2)(−1) + (0)(0) + (2)(1) = 4"}</Equation>
                  <p>
                    At 170.5 centimetres both forms answer 72.0 kilograms,
                    the mean of 70 plus half a centimetre at slope 4.
                  </p>
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
                <p>
                  Ridge regression on the crowd keeps three numbers, a
                  weight for height, an intercept, and nothing else, and
                  &ldquo;0.826 kilograms per centimetre&rdquo; is a sentence
                  about height. The dual model keeps every training row and
                  a weight for each, so on fifteen people it keeps fifteen
                  heights and fifteen weights, and a prediction is a sum over
                  all of them. There is no per-feature number to report. It
                  is possible to add the weights up through the centred
                  heights and recover the slope, as section 5 did, only
                  because under the linear kernel there is a slope to
                  recover; under the radial kernel there is not, and the
                  playground says so rather than inventing one.
                </p>
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
                <p>
                  At gamma 0.01 every throw looks like every other and the
                  fit is a slightly bent line at 0.012. At 0.1 it reaches
                  0.450, at 0.3 it follows the arc at 0.797, at 1 it scores
                  0.873, at 3 it peaks at 0.880, and by 10 each throw is
                  similar only to itself, the smallest Gram eigenvalue has
                  risen from 8.1e−9 at gamma 1 to 0.202, and the curve dips
                  toward the mean between the throws for a score of 0.844.
                  At a hundred the table is the identity to four decimals and
                  the fit is the mean plus a bump at each throw.
                </p>
                <KeepInMind>
                  Gamma is a reach in the feature&rsquo;s units. At a hundredth
                  the fit could not bend and scored 0.012; at ten it bent
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
                <p>
                  At gamma 1 on the crowd the Gram matrix is the identity to
                  four decimals, the smallest eigenvalue 0.99976, so every
                  dual weight is half that person&rsquo;s centred weight and
                  the curve visits each person and returns to the mean of 72
                  between them. Asked about the person at 173 centimetres it
                  answers 74.0, halfway from the mean to their 76 kilograms,
                  and asked about 174.5, between two people, it answers
                  72.16. The score is 0.750, below the line&rsquo;s 0.890.
                  Widen the reach to a hundredth and the score is 0.835; at
                  a thousandth 0.824; at a ten-thousandth the kernel can no
                  longer tell the tallest from the shortest and the score
                  falls to 0.481. Nothing here beats the line, because the
                  crowd was drawn along one.
                </p>
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
                  <p>
                    Adding λ to the diagonal adds λ to every eigenvalue of
                    K, so the ratio of the largest to the smallest becomes
                    (largest + λ) over (smallest + λ). On the throw at gamma 1
                    the largest is 5.650, so at λ = 1 the ratio is 6.65 and
                    at λ = 1e−9 it is 5.650 over 1e−9 plus 8.1e−9, which is
                    6.2e8. The linear kernel&rsquo;s Gram matrix has fourteen
                    eigenvalues at zero, so its condition number at a
                    billionth is 2.3e10, and yet its fit does not change,
                    because the target already lies in the one direction the
                    table can see.
                  </p>
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
                <p>
                  On the crowd the mistake is not subtle at all. The heights
                  are a hundred and seventy centimetres from the origin, so
                  the uncentred Gram matrix is dominated by that offset, and
                  the half-centred fit reports a slope of 0.0046 kilograms
                  per centimetre where both right fits report 0.8259, and
                  answers 72.80 at the mean height where the right lines
                  answer exactly 72. Drop the penalty to a thousandth and
                  the right fits rise to 0.8262 while the wrong one stays
                  at 0.0046. On the throw, where the times are near the
                  origin, the wrong slope is 0.0742 against 0.2611, which is
                  the closer-looking version of the same failure.
                </p>
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
                <p>
                  At gamma 1 and a penalty of a tenth the curve answers 7.47
                  metres at five seconds, already off the last throw, 12.46
                  at six, 12.758 at seven and 12.759998 at eight, against a
                  mean of 12.76. Two seconds past the data the fit has
                  forgotten the ball entirely and is answering the average
                  height of the throw. The squared polynomial kernel does the
                  opposite and keeps its shape, answering −19.5 at five
                  seconds, −49.8 at six and −136.5 at eight, which is the
                  polynomial page&rsquo;s runaway drawn without columns. The
                  line answers 14.33 at eight seconds and would keep the
                  same slope forever.
                </p>
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
                <p>
                  On the throws at gamma 1 and a constant of −0.5 the
                  smallest eigenvalue of the Gram matrix is −4.313. At every
                  penalty up to 4.3 the sum with the smallest eigenvalue is
                  negative and the fit is refused, in a message naming
                  Mercer&rsquo;s condition. At 4.4 the sum is positive, the factorisation goes
                  through, and the fit is accepted with a score of −228,
                  which is a curve far worse than answering the mean; at 5
                  it scores −4.49, at 10 −0.069, and at 100 it is 0.006, the
                  flat line the penalty forces. Even at a constant of zero
                  the smallest eigenvalue is −0.878, hidden at a penalty of
                  one, and the accepted fit scores 0.0023.
                </p>
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
      ]}
    />
  );
}
