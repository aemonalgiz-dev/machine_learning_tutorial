import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { CentringControl } from "@/components/widgets/CentringControl";
import { KernelRidgePlayground } from "@/components/widgets/KernelRidgePlayground";

export const metadata: Metadata = {
  title: "Kernel Ridge Regression · oop_ml",
  description:
    "Ridge regression rearranged so the rows appear only inside dot products, then those dot products swapped for a kernel, draws a curve through the data without one manufactured column.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KernelRidgePage() {
  return (
    <ConceptPage
      title="Kernel Ridge Regression"
      tagline="A curve through the data, with no column ever manufactured to bend it."
      prerequisites={
        <>
          The model being rearranged is the one from the{" "}
          <Link href="/concepts/ridge-lasso" className={linkClass}>
            ridge and lasso
          </Link>{" "}
          page, the swap it is subjected to is the{" "}
          <Link href="/concepts/kernel-trick" className={linkClass}>
            kernel trick
          </Link>
          , and the curve it is compared against is the one the{" "}
          <Link
            href="/concepts/multiple-polynomial-regression"
            className={linkClass}
          >
            polynomial regression
          </Link>{" "}
          page drew by building extra columns.
        </>
      }
      history={
        <>
          <p>
            The polynomial page fits a curve by manufacturing columns. Given a
            height, it invents the height squared and the height cubed and hands
            all three to a straight-line method, which draws a curve in the
            original picture without ever leaving straight-line territory. It
            works, and it does not scale. Two features at degree three need nine
            columns; twenty features at degree three need over seventeen hundred,
            and every one of them has to be built, stored and multiplied.
          </p>
          <p>
            The escape was noticed in 1964, when Mark Aizerman, Emmanuil
            Braverman and Lev Rozonoer, working in Moscow on pattern
            recognition, observed that a method which touches its data only
            through dot products never needs the expanded columns at all, only
            the dot products they would have produced. That observation sat
            mostly unused for thirty years until the support vector machines of
            the 1990s made it famous, and it applies far more widely than to
            classifiers. Craig Saunders, Alexander Gammerman and Volodya Vovk
            published the ridge regression case in 1998, and it is one of the
            tidiest applications there is, because ridge regression has a closed
            form and so does its kernelised twin. There is no iteration on this
            page at all.
          </p>
        </>
      }
      playground={<KernelRidgePlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Two fits are drawn in the box above on the same points at the
                same penalty. The bold indigo curve is kernel ridge regression
                through whichever kernel is selected, and the grey line behind it
                is ordinary ridge regression. Start on the linear kernel and the
                two coincide exactly, one drawn over the other. That is the
                control, and it is the first thing to establish: the kernelised
                model is not a different model with a family resemblance, it is
                the same model, and under the linear kernel it must give the
                identical answer.
              </p>
              <p>
                Now press the thrown ball and leave the kernel linear. The line
                scores an R² of 0.003, which is to say it explains nothing, and
                it could not be otherwise, because the ball goes up and comes
                down and a line can only do one of those. Switch to the radial
                basis kernel and the bold curve follows the arc, at 0.873, and
                drop the penalty to a tenth and it follows at 0.987.
              </p>
              <p>
                No column was manufactured to make that happen. The points are
                still one number in and one number out. The only thing that
                changed is the function used to compare two rows, and that is the
                entire content of the page.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Ridge regression, as the penalty page left it, solves for one
                weight per feature. There is a second way to write the same
                answer, in which the solution is a weighted sum of the training
                rows rather than a weight per column, and the two are the same
                line written differently.
              </p>
              <Equation>{"weights per feature      w = (XᵀX + λI)⁻¹ Xᵀy\nweights per row          w = Xᵀ(XXᵀ + λI)⁻¹ y"}</Equation>
              <p>
                The second form is the useful one because of what appears in it.
                The matrix XXᵀ holds the dot product of every pair of training
                rows and nothing else, and to predict, the new row appears only
                as its dot product against each training row. The features
                themselves have vanished from the calculation. Only comparisons
                between rows remain.
              </p>
              <p>
                Once that is true the swap is available. Replace every dot
                product with a kernel, a function that returns what the dot
                product would have been had both rows first been expanded into
                some larger space. The number of weights is now one per training
                row rather than one per feature, which is why they are called
                dual weights and why the readout above shows one per point.
              </p>
              <Equation>{"K[i, j] = kernel(row i, row j)\ndual weights   α = (K + λI)⁻¹ y_centred\nprediction     Σ αᵢ · kernel(new row, row i)  +  mean"}</Equation>
              <p>
                One practical consequence is worth noticing. The cost of ridge
                regression grows with the number of features; the cost of this
                grows with the number of rows. For twenty features at degree
                three the swap is an enormous saving. For a million rows it is a
                million by million matrix, and the saving runs the other way.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                The box opens on three points, at (1, 6), (2, 12) and (3, 18),
                which sit exactly on the line y = 6x. Under the linear kernel at
                a penalty of one, every number in the fit is whole. The means are
                2 and 12, and the penalty pulls the slope down from the 6 the
                points really have to 4.
              </p>
              <Equation>{"means            x̄ = 2,   ȳ = 12\nridge fit        slope 4,  intercept 4\ndual weights     −2,  0,  +2"}</Equation>
              <p>
                Those three dual weights are the interesting part, and the slope
                can be recovered from them by hand. Each weight multiplies its
                own row&rsquo;s distance from the mean, and the products are
                added up.
              </p>
              <Equation>{"(−2)·(1 − 2)  +  0·(2 − 2)  +  (+2)·(3 − 2)\n    =  2  +  0  +  2\n    =  4        which is the slope ridge found"}</Equation>
              <p>
                Notice which rows did the work. The middle point, sitting exactly
                at the mean, carries a weight of zero and contributes nothing at
                all. The two outer points carry equal and opposite weights. A
                point at the centre of the data tells a linear fit nothing about
                its slope, and the dual form says so out loud in a way the
                per-feature form never does.
              </p>
              <p>
                Switch to the radial basis kernel at a gamma of one, penalty
                still one, and the same three points behave differently. The
                weights become −3.028, 0 and +3.028, there is no slope left to
                report because the fit is not a line, and at x = 2.5 the curve
                answers 14.039 where the straight line answers exactly 14. The
                squared kernel answers 14.4 at the same place, from weights of
                −1.2 and +1.2. Every one of those figures is in the readout and
                pinned by a test.
              </p>
            </>
          ),
        },
        {
          title: "Centre the Features, Not Only the Target",
          content: (
            <>
              <p>
                The identity that licenses the whole page, the two ways of
                writing the ridge solution, holds on centred data. Both the
                target and the inputs have to have their means removed. When this
                was first built in the library only the target was centred, and
                the result is the most instructive kind of bug: the fit still
                worked, still drew a plausible line, and was quietly wrong.
              </p>
              <CentringControl />
              <p>
                At a penalty of one the two correct fits agree on a slope of
                4.000, and the version that centred only the target reports
                0.800. Read those two numbers cold, without the right answer to
                hand, and 0.8 is not obviously absurd for a shrunk slope. What
                gives it away is the mean point. A ridge fit always passes
                through the mean of its data, and the correct lines answer exactly
                12 at x = 2, where the target-only line answers 13.6 and sails
                past the ring.
              </p>
              <p>
                Drag the penalty down and the diagnosis becomes unambiguous. As
                the penalty vanishes the shrinkage should vanish with it and the
                fit should recover the slope the points really have, which is 6.
                The two correct fits climb to 6.00. The target-only version goes
                to 0.857 and stops. It is not a fit that is slightly
                over-penalised. It is a fit that is answering a different
                question, and no amount of tuning moves it toward the right one.
              </p>
              <p>
                The linear kernel is what caught it, which is the argument for
                having a control at all. Under the radial basis kernel there is
                no independently known right answer to compare against, so the
                wrong version looked entirely reasonable. Under the linear kernel
                there is: the answer must be ridge regression, exactly, and the
                original numbers were 4.2841 against ridge&rsquo;s 4.3580. Close
                enough to read as rounding, and far too big to be rounding.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The identity is three lines, and worth seeing because it is not
                obvious that the two forms describe the same line at all. Start
                from the claim and multiply out both sides of the middle step.
              </p>
              <Equation>{"claim      (XᵀX + λI)⁻¹ Xᵀ  =  Xᵀ (XXᵀ + λI)⁻¹\n\nsince      Xᵀ(XXᵀ) + λXᵀ  =  (XᵀX)Xᵀ + λXᵀ\n           Xᵀ(XXᵀ + λI)   =  (XᵀX + λI)Xᵀ"}</Equation>
              <p>
                Both sides of that last line are the same matrix, because
                matrix multiplication associates and Xᵀ can be pushed through
                from either side. Now multiply on the left by the inverse of the
                first bracket and on the right by the inverse of the second, and
                the claim falls out.
              </p>
              <Equation>{"(XᵀX + λI)⁻¹ · Xᵀ(XXᵀ + λI) · (XXᵀ + λI)⁻¹\n    =  (XᵀX + λI)⁻¹ · (XᵀX + λI) · Xᵀ · (XXᵀ + λI)⁻¹\n\nleft side  →  (XᵀX + λI)⁻¹ Xᵀ\nright side →  Xᵀ (XXᵀ + λI)⁻¹"}</Equation>
              <p>
                Both inverses exist for any penalty above zero, which is the
                other quiet gift of the penalty and the reason this page has no
                iteration in it. The unpenalised version of either form can be
                singular; adding λ to the diagonal makes both invertible, so the
                closed form always has an answer.
              </p>
              <p>
                Two things the derivation shows that the pictures do not. The
                left-hand form is a matrix as wide as the features and the
                right-hand form is a matrix as wide as the rows, which is the
                cost trade named in the mechanism. And the step where Xᵀ is
                pushed through requires X to be what it claims, centred columns,
                which is exactly the assumption the previous section watched
                being broken.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
