import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { DescentWalkPlayground } from "@/components/widgets/DescentWalkPlayground";
import { RateSweepTable } from "@/components/widgets/RateSweepTable";

export const metadata: Metadata = {
  title: "Fitting by Walking · oop_ml",
  description:
    "The line page solved for its answer in one step. This page reaches the same line by walking downhill on the loss, one small step per pass, and shows what the step size decides, including when the walk runs away.",
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
            Augustin-Louis Cauchy described the method in 1847, in a note about
            solving systems of equations in astronomy, and the idea is the one
            the calculus primer already has: the derivative points uphill, so
            step the other way. For fitting a straight line the method is
            entirely unnecessary, because Legendre and Gauss had a formula for
            the answer forty years before Cauchy wrote, and the formula is exact
            while the walk only ever approaches.
          </p>
          <p>
            It matters anyway, for two reasons. The first is that the formula
            requires inverting a matrix, and Haskell Curry, writing in 1944
            during the war, was already pointing out that for large problems the
            walk is cheaper than the inverse. The second is more important: for
            almost every model after this page there is no formula. The logistic
            page has no closed form, the neural network pages have nothing like
            one, and the walk is what they all use. This page fits the one model
            where the right answer is independently known, so that the walk can
            be watched arriving at it and its failures can be seen for what they
            are.
          </p>
        </>
      }
      playground={<DescentWalkPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The scrubber in the box above moves through one walk. It is not
                refitting at each position; the library was asked once, recorded
                every pass it took, and the slider steps through that record. So
                the sequence of bold lines really is the sequence the walk went
                through, in order.
              </p>
              <p>
                Start at pass zero. The line is flat and sits at zero, which is
                the worst guess available and deliberately where the walk
                begins. Drag right and the line lifts and tilts toward the dashed
                line, which is the answer the closed form gives in one step with
                no walking at all. The staircase underneath is the loss, and it
                only ever falls.
              </p>
              <p>
                Then push the step size up. There is a threshold printed in the
                readout, and below it the walk arrives, slowly at small steps and
                briskly nearer the threshold. Above it the walk does not arrive
                slowly; it does not arrive at all. Each pass overshoots by more
                than the last, and far enough above the threshold the library
                refuses the fit by name rather than handing back a line made of
                infinities. That cliff is the thing worth understanding about the
                method, and the last two sections are about where it is.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The loss is the same one the line page minimised, the mean of the
                squared misses. What is new is refusing to solve for its minimum
                and instead asking, at whichever line you currently hold, which
                direction makes it smaller.
              </p>
              <Equation>{"loss(level, slope) = (1/n) Σ ( weightᵢ − level − slope · (heightᵢ − mean) )²"}</Equation>
              <p>
                Differentiating that with respect to each of the two numbers
                gives the two components of the gradient. Both come out as sums
                over the residuals, which are the misses the current line makes.
              </p>
              <Equation>{"residualᵢ  =  weightᵢ − level − slope · (heightᵢ − mean)\n\n∂loss/∂level  =  −(2/n) Σ residualᵢ\n∂loss/∂slope  =  −(2/n) Σ residualᵢ · (heightᵢ − mean)"}</Equation>
              <p>
                A pass reads those two numbers at the line it is standing on and
                steps against them, scaled by the step size. Then it reads them
                again at the new line, which is what makes it a walk rather than
                a single correction.
              </p>
              <Equation>{"level  ←  level  −  rate · ∂loss/∂level\nslope  ←  slope  −  rate · ∂loss/∂slope"}</Equation>
              <p>
                The 2/n in front is the sample count, not the step size, and
                confusing the two is a real mistake with a memorable symptom. In
                this library an early version used the rate there instead of the
                row count, which scaled every gradient by a hundred and made the
                walk diverge on data it should have handled easily. The walk
                stops when no coefficient moved further than a tolerance in a
                whole pass, and the library&rsquo;s tolerance is 1e-8.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                The box opens on three people, at 165 centimetres and 62
                kilograms, 170 and 68, and 175 and 68, with the step size at
                0.02. Their average height is 170, so the heights the fit
                actually sees are −5, 0 and +5, and the first pass can be done
                with a pencil.
              </p>
              <p>
                The starting line is flat at zero, so every residual is just the
                person&rsquo;s weight and the loss is the mean of the squared
                weights.
              </p>
              <Equation>{"loss at the start  =  (62² + 68² + 68²) / 3  =  13092 / 3  =  4364"}</Equation>
              <p>
                Now the two gradient components. The level&rsquo;s is minus two
                thirds of the residuals added up. The slope&rsquo;s weights each
                residual by that person&rsquo;s centred height, so the middle
                person contributes nothing at all and the two ends contribute
                −5 times 62 and +5 times 68.
              </p>
              <Equation>{"∂/∂level  =  −(2/3)(62 + 68 + 68)          =  −132\n∂/∂slope  =  −(2/3)(−5·62 + 0·68 + 5·68)  =  −20"}</Equation>
              <p>
                Step against both at a rate of 0.02, which is to say add 0.02
                times 132 and 0.02 times 20.
              </p>
              <Equation>{"level  =  0 + 0.02 · 132  =  2.64\nslope  =  0 + 0.02 ·  20  =  0.4\nloss   =  4017.1563"}</Equation>
              <p>
                Those are the numbers the readout shows at pass one. The second
                pass reads its gradient at the line the first one landed on,
                which is what makes the arithmetic compound: the residuals are
                now 61.36, 65.36 and 63.36, giving a level gradient of −126.72
                and a slope gradient of −6.667, and the walk lands at 5.1744 and
                0.5333.
              </p>
              <p>
                It keeps going for 477 passes and then stops, having moved less
                than the tolerance. Where it stops is the point: a slope of 0.6
                and a level of 66, at a loss of exactly 2.0, which is precisely
                what the closed form answers in one step. The walk is slower and
                it is not more approximate.
              </p>
            </>
          ),
        },
        {
          title: "When the Step Is Too Big",
          content: (
            <>
              <p>
                The table below hands the library&rsquo;s own model each of eight
                step sizes on those same three people and reports what it said.
              </p>
              <RateSweepTable />
              <p>
                Read the rightmost column first, because it is the one doing the
                work. It is the share of its remaining error one pass keeps, and
                the table divides where that number crosses one. At 0.02 a pass
                keeps 0.96 of the error and the walk settles in 477 passes; at
                0.05 it keeps 0.90 and settles in 194. At 0.06 it keeps exactly
                1.0000, which is the threshold, and the walk neither shrinks nor
                grows: it oscillates and never arrives. Past that the error grows
                every pass, 1.3333 at a rate of 0.07 and 2.3333 at 0.1.
              </p>
              <p>
                Notice what the verdicts do and do not say, because the boundary
                is less dramatic than it sounds. Only the largest rate, 0.2, is
                actually refused, and it is refused because at 5.6667 per pass
                the coefficients stop being finite and the library will not hand
                back a fit made of infinities. At 0.07 and 0.1 the walk is
                equally doomed and simply has not overflowed yet, so it runs out
                of its 500 passes holding numbers that are large and useless.
                Divergence is not an error the library detects at the cliff. It
                is an error it detects when the arithmetic finally breaks, which
                can be many passes later.
              </p>
              <p>
                The two smallest rates are the mirror image of the same problem.
                At 0.005 a pass keeps 0.99 of the error, which is a perfectly
                convergent walk, and after 500 passes it has still not arrived.
                Nothing warns about that either. A run that stops on its pass
                limit is reporting numbers it was still moving away from, and the
                only honest reading of the verdict is that the answer is not
                ready.
              </p>
              <p>
                The threshold is not a tuning constant. It falls out of the
                curvature of the loss, and the loss here is a bowl whose steepness
                differs in the two directions. In the level direction the
                curvature is 2, and in the slope direction it is twice the
                variance of the centred heights. One pass multiplies whatever
                error remains by one minus the rate times the curvature, so each
                direction keeps its own share.
              </p>
              <Equation>{"level keeps   1 − rate · 2                  =  1 − 0.04    =  0.96\nslope keeps   1 − rate · 2 · variance       =  1 − 2/3     =  0.333\n\nthe walk arrives only while both sizes stay below one"}</Equation>
              <p>
                Two things follow, and the readout shows both. The walk arrives
                only when the steeper direction stays inside the bound, so the
                threshold is set by the steepest curvature, which here is the
                slope&rsquo;s, at 2 over 100/3, or 0.06. And the speed of arrival
                is set by the shallowest, because the slope has thrown away two
                thirds of its error before the level has thrown away four
                percent of its. The 477 passes are the level&rsquo;s doing.
                Nothing is wrong with the slope at all.
              </p>
              <p>
                That is also the quiet argument for centring the heights, which
                the library does before fitting. On these people the threshold on
                centred heights is 0.06, and on raw heights it would be
                0.0000346, some seventeen hundred times smaller. A step size that
                works perfectly on centred data diverges immediately on the same
                data uncentred, which is the{" "}
                <Link href="/concepts/feature-scaling" className={linkClass}>
                  feature scaling
                </Link>{" "}
                page&rsquo;s point arriving from an unexpected direction.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The bound on the step size is worth deriving because it explains
                everything the table shows. Work in one direction at a time, and
                write the distance from the answer as the error. A pass moves the
                coefficient by the rate times the gradient, and for a quadratic
                loss the gradient is the curvature times the error.
              </p>
              <Equation>{"error after  =  error before  −  rate · curvature · error before\n             =  error before · (1 − rate · curvature)"}</Equation>
              <p>
                So each pass multiplies the error by the same fixed factor. If the
                size of that factor is below one the error shrinks geometrically
                and the walk converges; if it is above one the error grows
                geometrically and the walk runs away. Setting the size below one
                and solving gives the bound.
              </p>
              <Equation>{"| 1 − rate · curvature |  <  1\n0  <  rate · curvature  <  2\nrate  <  2 / curvature"}</Equation>
              <p>
                The curvature that matters is the largest one, since every
                direction has to shrink and one runaway direction is enough. On
                the worked people the slope&rsquo;s curvature is twice the
                variance of the centred heights, which is 2 times 50/3, so the
                bound is 2 divided by 100/3, which is 0.06 exactly.
              </p>
              <p>
                The same expression explains why a rate just under the threshold
                is fastest and why one far under is slow. At a rate of 2 over the
                curvature the factor is exactly −1 and the walk oscillates
                forever without shrinking; a little below that it converges in
                the fewest passes; far below, the factor is close to 1 and each
                pass throws away almost nothing. And the ratio between the
                largest and smallest curvature bounds how good the compromise can
                be, because one number has to serve both directions. That ratio
                has a name, the condition number, and improving it is exactly
                what centring and scaling the inputs does.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
