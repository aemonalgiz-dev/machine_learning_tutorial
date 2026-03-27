import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { PolynomialPlayground } from "@/components/widgets/PolynomialPlayground";

export const metadata: Metadata = {
  title: "Multiple & Polynomial Regression · oop_ml",
  description:
    "Model a relationship with several inputs at once, or one that curves, and see that both are the same machinery as the straight line.",
};

export default function MultiplePolynomialRegressionPage() {
  return (
    <ConceptPage
      title="Multiple & Polynomial Regression"
      tagline="Several inputs at once, and relationships that bend, on the same machinery as the straight line."
      prerequisites={
        <>
          This page builds directly on{" "}
          <Link
            href="/concepts/simple-linear-regression"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            simple linear regression
          </Link>
          , and the derivation leans on the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          &rsquo;s vectors and dot products.
        </>
      }
      history={
        <>
          <p>
            The straight line answered one question with one input, weight from
            height, and real questions rarely stay that small. A person&rsquo;s
            weight depends on their height, though also on their age, their
            build, how much they exercise, and the astronomers who gave us least
            squares had it worse, an orbit&rsquo;s shape tangled up in its tilt
            and its timing all at once. So the method had to grow in two
            directions almost immediately. It had to take several inputs at the
            same time, with the fit sorting out how much each one matters, and
            it had to handle relationships that bend, since plenty of the world
            does not run in straight lines. A thrown ball rises and falls. Fuel
            use drops with speed and then climbs again. Crop yield rises with
            fertiliser until more starts to hurt.
          </p>
          <p>
            The surprise, and the reason both extensions share this page, is
            that neither one required new machinery. Both are the same least
            squares fit we already derived, pointed at a wider table of
            numbers, and the curved case turns out to be the several-input case
            wearing a disguise.
          </p>
        </>
      }
      playground={<PolynomialPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The dots in the box above are measurements of a thrown ball,
                its height at each moment in time. No straight ruler can follow
                a ball. It rises, turns over and falls, so a straight line cut
                through the arc misses nearly everything, and you can see that
                by dragging the degree slider down to 1 and watching R²
                collapse.
              </p>
              <p>
                The degree slider controls how bendy a curve the fit is allowed
                to use. Degree 1 is the straight line. Degree 2 may bend once,
                which is exactly what a thrown ball needs, and you can watch it
                settle onto the arc. Each further degree buys another possible
                bend, and the fit will spend every bend it is given.
              </p>
              <p>
                That last habit is the thing to watch for. Push the degree
                toward 9 and the curve starts threading through individual
                points, wiggling between them in ways no ball ever moved. The
                score keeps climbing while the curve gets less believable,
                which is a tension this page ends on.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Start with the several-inputs half, because it is the honest
                foundation. With one input the model was a line with one slope.
                With several inputs each one gets a slope of its own, and the
                prediction adds up every input&rsquo;s contribution.
              </p>
              <Equation>{"ŷ = β₁x₁ + β₂x₂ + … + βₖxₖ + α"}</Equation>
              <p>
                For weight predicted from height and age, the model would carry
                one coefficient saying how weight moves per centimetre and
                another saying how it moves per year, and each is read holding
                the others fixed, the height coefficient comparing people of
                the same age who differ in height. Fitting works exactly as
                before. The residual sum of squares is still the target, and it
                is minimised over all the coefficients at once. In the language
                of the linear algebra primer the prediction is one dot product,
                the input vector dotted with the coefficient vector, which is
                why that primer called the dot product the shape of every
                linear prediction.
              </p>
              <p>
                Now the curved half, and the disguise. Suppose the input is
                time t and the relationship bends. Build a second column by
                squaring the first, so each measurement carries t and t². Then
                fit the several-input model to those two columns as though they
                were unrelated features.
              </p>
              <Equation>{"ŷ = β₁·t + β₂·t² + α"}</Equation>
              <p>
                Read as a function of t, that is a parabola, a curve. Read as
                the fitting machinery reads it, it is a plain two-input linear
                model, since the coefficients still enter as multiply and add,
                and the fit neither knows nor cares that the second column was
                manufactured from the first. Higher degrees just add more
                manufactured columns, t³ and t⁴ and so on. So polynomial
                regression is multiple regression whose extra features are
                powers, and the underlying mechanics of how we build the
                regression remain almost identical to the straight line&rsquo;s.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Physics says a ball thrown upward at 20 metres per second has
                height 20t minus half of gravity&rsquo;s 9.8 times t², so its
                true arc is
              </p>
              <Equation>{"h = 20·t − 4.9·t²"}</Equation>
              <p>
                Press the worked example button above, which loads five exact
                measurements of that throw, and set the degree to 2. The fit
                comes back with the coefficient on t reading 20.00, the
                coefficient on t² reading −4.90, the intercept reading 0.00 and
                R² reading 1.000. The method has recovered the launch speed and
                the pull of gravity from five data points, which is worth a
                pause. Nothing in the fit knows any physics. It only minimised
                squared misses over a table with a t column and a t² column,
                and the physics fell out because the physics is what generated
                the data.
              </p>
              <p>
                Now drag the degree down to 1 on the same points. The best
                straight line through a symmetric arc is nearly flat, and R²
                collapses to about 0.005. Same data, same machinery, and the
                difference between explaining everything and explaining nothing
                was whether we handed the fit the column it needed.
              </p>
            </>
          ),
        },
        {
          title: "Too Much of a Good Thing",
          content: (
            <>
              <p>
                If one manufactured column rescued the straight line, it is
                tempting to keep going, and the widget will let you. Load the
                full throw, fifteen noisy measurements, and walk the degree
                upward. R² climbs with every step, since an extra bend can only
                fit the data at least as well, and by degree 8 or 9 the curve
                passes close to nearly every point.
              </p>
              <p>
                Look at the curve rather than the score, though. Between the
                points it swings in ways no thrown ball ever moved, diving and
                recovering to catch individual measurements, and each of those
                measurements carries noise, a wobble of the hand or the ruler
                that says nothing about the next throw. The high-degree fit is
                spending its bends memorising that noise. Ask it for a
                prediction between two points and it answers with the wiggle,
                confidently and wrongly.
              </p>
              <p>
                So a score of 1.000 on the data we fitted is not the goal, it
                is the warning. The fit has stopped modelling the relationship
                and started transcribing the sample. What we want is a way to
                keep the flexible model and restrain it, and that is exactly
                what{" "}
                <Link
                  href="/concepts/ridge-lasso"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  ridge and lasso
                </Link>{" "}
                are for.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The derivation is the straight line&rsquo;s, widened. The
                residual sum of squares now depends on every coefficient at
                once,
              </p>
              <Equation>{"RSS(β₁, …, βₖ, α) = Σ(yᵢ − ŷᵢ)²"}</Equation>
              <p>
                and its lowest point is where the ground is flat in every
                direction, so we take one partial derivative per coefficient,
                the intercept included, and set them all to zero. That produces
                k + 1 equations in k + 1 unknowns, one flatness condition per
                setting, and unlike the pair we solved by substitution on the
                regression page, a bundle this size wants the matrix language
                of the{" "}
                <Link
                  href="/primers/linear-algebra"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  linear algebra primer
                </Link>
                . Collect the data into a matrix X, one row per example and one
                column per feature, and the whole bundle collapses to one line,
                the normal equations.
              </p>
              <Equation>{"XᵀX β = Xᵀy"}</Equation>
              <p>
                Solving that system is what the library does when it fits this
                page&rsquo;s widget, and the straight line&rsquo;s formulas are
                what the system reduces to when X has a single feature column.
                One derivation covers every page so far, which is the economy
                the mechanism section promised. The powers of t change what the
                columns hold and nothing about how they are solved.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
