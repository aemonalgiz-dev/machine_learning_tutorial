import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { BoostingPlayground } from "@/components/widgets/BoostingPlayground";

export const metadata: Metadata = {
  title: "Gradient Boosting · oop_ml",
  description:
    "Grow small trees in sequence, each fitted to whatever the running total still gets wrong, and keep every correction modest.",
};

export default function GradientBoostingPage() {
  return (
    <ConceptPage
      title="Gradient Boosting"
      tagline="Small trees grown in sequence, each fitted to whatever the running total still gets wrong."
      prerequisites={
        <>
          This page assumes{" "}
          <Link
            href="/concepts/bagging"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            bagging
          </Link>{" "}
          for contrast and leans on the{" "}
          <Link
            href="/primers/calculus"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            calculus primer
          </Link>
          , since the word gradient in the name is earned, not decorative. The
          members here are regression trees, the classifier&rsquo;s sibling
          whose leaves answer with the mean of the people they hold.
        </>
      }
      history={
        <>
          <p>
            Bagging and the forest grow their experts in parallel, each
            ignorant of the rest, and the committee&rsquo;s intelligence lives
            entirely in the vote. Through the 1990s a different question was
            being worked, whether many weak models could be grown in sequence,
            each one aimed at the mistakes of the models before it. Yoav
            Freund and Robert Schapire answered yes for classification with
            AdaBoost in 1995, reweighting the hard examples so each new member
            stared hardest at them, and Jerome Friedman then saw the general
            pattern in 1999. Fitting each new member to the errors of the
            running total is gradient descent, the calculus primer&rsquo;s
            walk, taken not in a space of settings but in the space of
            predictions themselves. He named the method gradient boosting, and
            its descendants have won more tabular-data competitions than any
            other family of model.
          </p>
        </>
      }
      playground={<BoostingPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The points are the thrown ball again, and the members here are
                stumps, trees a single question deep, each able to say only
                one number left of its split and another right of it. A stump
                alone is almost useless, a two-shelf approximation of an arc.
                The slider shows what a sequence of them becomes.
              </p>
              <p>
                Set the rounds to 1 and the fit is a crude pair of shelves.
                Walk it upward and each new round fits a stump not to the
                ball but to whatever the running total still gets wrong,
                adds a fraction of that correction, and hands the remainder
                to the next round. By ten rounds the shelves have roughed out
                the arc, and by a hundred they trace it closely. The model is
                built out of its own mistakes, each round a small apology for
                the one before.
              </p>
              <p>
                Push the rounds far enough and a familiar warning appears.
                The corrections start chasing the measurement noise, R²
                closes on 1.000, and the curve grows the small jitters of a
                fit that has begun memorising. Even a committee of the
                weakest members finds its way to the site&rsquo;s oldest
                failure if allowed to correct forever.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The recipe is short. Start with the laziest possible model,
                predicting the mean of the targets for everyone. Compute what
                it gets wrong, person by person, the residuals. Fit a stump
                to those residuals, so the stump&rsquo;s whole job is
                predicting the current mistakes, and add a fraction η of its
                output to the running total. Then recompute the residuals and
                repeat.
              </p>
              <Equation>{"prediction₀ = ȳ\nresidualᵢ = yᵢ − prediction(xᵢ)\nprediction ← prediction + η · stump fitted to the residuals"}</Equation>
              <p>
                The word gradient is earned by the middle line. For squared
                error, the residual y − p is exactly the negative slope of
                the error with respect to the prediction itself, so fitting a
                stump to the residuals and stepping by η is the calculus
                primer&rsquo;s walk, downhill on the error, with the step
                direction supplied by a tree instead of a formula. Each round
                is one gradient step taken in prediction space, and η is the
                same learning rate the primer&rsquo;s slider taught, timid
                when small, reckless when large.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked example button, which loads three clean
                points, and the whole method can be run by hand. The targets
                are 2, 6 and 10 at t of 1, 2 and 3, and the learning rate
                slider should sit at 0.50.
              </p>
              <Equation>{"round 0   predict the mean, 6, everywhere\nresiduals   2−6, 6−6, 10−6   =   −4, 0, 4"}</Equation>
              <p>
                Round one fits a stump to those residuals. The best single
                split is t below 1.5, putting the −4 alone on the left and
                the 0 and 4 together on the right, so the stump answers −4 on
                the left and their mean, 2, on the right. Half of each
                correction is kept.
              </p>
              <Equation>{"left:   6 + 0.5·(−4) = 4\nright:  6 + 0.5·(2)  = 7\npredictions   4, 7, 7      residuals   −2, −1, 3"}</Equation>
              <p>
                Round two fits a stump to the new residuals, and the best
                split is now t below 2.5, grouping the −2 and −1 on the left,
                mean −1.5, with the 3 alone on the right.
              </p>
              <Equation>{"left:   4 − 0.75 = 3.25     and     7 − 0.75 = 6.25\nright:  7 + 1.5  = 8.5\npredictions   3.25, 6.25, 8.5"}</Equation>
              <p>
                Set the rounds slider to 1 and then 2 and the fitted shelves
                pass through exactly these numbers. Two rounds in and the
                predictions have crept from a flat 6 toward the targets of 2,
                6 and 10, each round correcting a piece of what remained,
                which is the entire method seen whole.
              </p>
            </>
          ),
        },
        {
          title: "The Two Dials",
          content: (
            <>
              <p>
                Boosting exposes the same trade every page since the
                polynomial has met, though split across two dials that pull
                against each other. More rounds means more corrections, and
                eventually corrections to the noise. A larger learning rate
                means each round commits harder, arriving faster and
                overshooting sooner, and the primer&rsquo;s intuition carries
                straight over. The classic practice is to keep η small and
                spend more rounds, buying a smoother approach with
                computation.
              </p>
              <p>
                Try the extremes above. At η of 1.00 the fit lunges, tracing
                the points quickly and roughly, and at 0.05 it creeps, still
                far from the arc after fifty rounds and impeccably smooth on
                the way. Where to stop is the question the site keeps
                meeting, and the honest answer is unchanged, data the fit
                never saw. Unlike bagging, boosting&rsquo;s members are
                sequential and share everything, so no out-of-bag shortcut
                exists here, and the held-out discipline has to be supplied
                from outside the model.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
