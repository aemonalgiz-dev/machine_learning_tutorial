import type { Metadata } from "next";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { LineFitPlayground } from "@/components/widgets/LineFitPlayground";

export const metadata: Metadata = {
  title: "Simple linear regression · oop_ml",
  description:
    "The oldest learning algorithm there is: fit a straight line to points, and let the misses it accepts teach you what 'best fit' means.",
};

export default function SimpleLinearRegressionPage() {
  return (
    <ConceptPage
      title="Simple linear regression"
      tagline="Draw the one straight line that comes closest to a cloud of points — and watch what 'closest' actually means."
      prerequisites={
        <>
          You only need to know what a straight line is — that{" "}
          <em>y = slope × x + intercept</em> tilts as the slope changes and
          slides up and down as the intercept changes. Everything else is built
          up here.
        </>
      }
      history={
        <>
          <p>
            Around 1800, astronomers had a maddening problem. Each night they
            measured the position of a comet or a planet, and each measurement
            disagreed slightly with the last — the instruments were imperfect
            and the sky does not hold still to be measured. They had more
            observations than unknowns, and no two observations quite agreed, so
            there was no single answer that fit them all. What do you do with a
            hundred noisy measurements of something that has one true value?
          </p>
          <p>
            Legendre and Gauss gave the same answer, and it founded the field:
            do not look for the line that passes through the points, because
            none does. Look for the line that makes the total <em>miss</em> as
            small as possible — specifically the sum of the squared distances
            from each point to the line. Squared, so that a big miss counts for
            much more than a small one and so that misses above and below cannot
            cancel out. That rule — <em>least squares</em> — is the ancestor of
            every model on this site, and it is still the first thing anyone
            learns.
          </p>
        </>
      }
      playground={<LineFitPlayground />}
      layperson={
        <>
          <p>
            Imagine scattering a handful of dots on paper and being asked to lay
            a single straight ruler down so it sits as fairly among them as
            possible — not favouring any one dot, just threading the middle of
            the crowd.
          </p>
          <p>
            Drag a dot in the box above and watch the blue line lean toward it.
            The short grey stalks are the <strong>misses</strong>: how far each
            dot sits from the line. The line is placed so that those misses,
            taken together, are as small as they can be. Move one dot far away
            and you can feel the line get tugged — that dot is now missing by a
            lot, and the rule cares a great deal about large misses.
          </p>
          <p>
            The <strong>R²</strong> readout is a report card from 0 to 1: how
            much of the dots&rsquo; scatter the line manages to explain. Points
            already in a neat line score near 1; a shapeless cloud scores near
            0, because no straight line can explain a shape that has none.
          </p>
        </>
      }
      technical={
        <>
          <p>
            The model is <code>ŷ = βx + α</code>, and fitting it means choosing
            the slope <code>β</code> and intercept <code>α</code> that minimise
            the residual sum of squares,{" "}
            <code>Σ(yᵢ − ŷᵢ)²</code>. Setting the two partial derivatives to
            zero gives a closed form — no iteration needed:
          </p>
          <p className="font-mono text-sm">
            β = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)² , α = ȳ − β·x̄
          </p>
          <p>
            The grey sticks are the residuals <code>yᵢ − ŷᵢ</code>; the fit
            makes their squared sum stationary, which is why one distant point
            moves the line so much — its residual is large and its{" "}
            <em>square</em> dominates the objective. R² is{" "}
            <code>1 − RSS/TSS</code>: the residual sum of squares against the
            total sum of squares <code>Σ(yᵢ − ȳ)²</code>, i.e. the share of the
            variance the line accounts for.
          </p>
          <p>
            The fit you are watching is computed by{" "}
            <code>SimpleLinearRegression</code> in the{" "}
            <code>oop_ml</code> library, over its HTTP API — the same code the
            library&rsquo;s own tests pin, not a re-derivation in JavaScript.
            Feed it points with an identical <code>x</code> everywhere and the
            denominator <code>Σ(xᵢ − x̄)²</code> is zero: the slope is
            undetermined, and the library refuses with a typed error rather than
            returning a nonsense line.
          </p>
        </>
      }
    />
  );
}
