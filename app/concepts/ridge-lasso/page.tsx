import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { PenaltyPlayground } from "@/components/widgets/PenaltyPlayground";
import { ShrinkagePathChart } from "@/components/widgets/ShrinkagePathChart";

export const metadata: Metadata = {
  title: "Ridge & Lasso · oop_ml",
  description:
    "Charge the fit for large coefficients and it stops chasing noise, with ridge shrinking every term and lasso switching terms off outright.",
};

export default function RidgeLassoPage() {
  return (
    <ConceptPage
      title="Ridge & Lasso"
      tagline="Charge the fit for large coefficients, and it stops chasing noise."
      prerequisites={
        <>
          This page answers the problem{" "}
          <Link
            href="/concepts/multiple-polynomial-regression"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            multiple and polynomial regression
          </Link>{" "}
          ends on, so read that page first, and its worked shrinkage reuses the
          five people from{" "}
          <Link
            href="/concepts/simple-linear-regression"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            simple linear regression
          </Link>
          .
        </>
      }
      history={
        <>
          <p>
            By the 1960s least squares was running on industrial data, and in
            industrial data the inputs travel together. Temperature, pressure
            and flow rate in a chemical plant all rise and fall as a group, and
            when inputs move together least squares turns unstable. Many
            different coefficient combinations explain the data almost equally
            well, so the fit picks one of them for reasons that are mostly
            noise, often huge coefficients delicately cancelling each other,
            and refitting on next week&rsquo;s data picks a different one.
            Arthur Hoerl, a chemist at DuPont, proposed holding the
            coefficients down on purpose, and published ridge regression with
            Robert Kennard in 1970. The lasso came from Robert Tibshirani in
            1996, a change of penalty with a consequence Hoerl&rsquo;s did not
            have, coefficients that reach exactly zero, so the fit chooses its
            features as it fits.
          </p>
          <p>
            Data is noisy, which can lead to flexible regressions fitting to
            clerical errors, outliers, or other data issues, and the polynomial
            page ended on exactly that, a degree-9 curve transcribing its
            sample. Ridge and lasso prevent the &ldquo;ideal&rdquo; fit for our
            training data, trading a slightly worse fit now for better
            predictions later. This page is about how that trade is arranged.
          </p>
        </>
      }
      playground={<PenaltyPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The box above is the polynomial page&rsquo;s problem, the same
                noisy throw fitted at degree 9, far more bend than a ball
                deserves. What is new is the slider, and the bar chart under
                the curve. Each bar is one of the nine coefficients, and the
                bars are where to look, because the wild wiggling of an
                overgrown fit is built out of large coefficients working
                against each other, one term throwing the curve up and the
                next hauling it back down.
              </p>
              <p>
                The penalty makes largeness itself cost something. With the
                slider near zero the fit answers only to the data, and it
                wiggles. Push the penalty up and every bar shrinks, the
                cancelling tug-of-war unwinds, and the curve calms into
                something a ball could plausibly do, while R² gives up almost
                nothing. Push it far enough and the bars pin to the floor, the
                curve flattens toward a horizontal line, and R² collapses,
                since a fit forbidden from using its coefficients cannot
                explain anything.
              </p>
              <p>
                So the slider runs between two failures, chasing noise at one
                end and ignoring the data at the other, and the useful models
                live in between. Switch between ridge and lasso and watch how
                differently the bars die. That difference is the heart of the
                page.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Everything so far minimised the residual sum of squares alone.
                Ridge and lasso minimise the same misses plus a charge on the
                coefficients, and the two methods differ only in how the
                charge is computed. Ridge charges the sum of the squared
                coefficients, and lasso the sum of their absolute values.
              </p>
              <Equation>{"ridge:  RSS + λ · Σ βⱼ²\nlasso:  RSS + λ · Σ |βⱼ|"}</Equation>
              <p>
                The number λ is the slider, the price per unit of coefficient.
                At λ of zero both methods are ordinary least squares. As λ
                grows, a large coefficient has to earn its size by removing
                more miss than it costs, and coefficients that mostly encode
                noise cannot pay, so they shrink. The intercept is left out of
                the charge, since it only sets the overall level and holding it
                down would punish the data for not being centred at zero.
              </p>
              <p>
                One practical note the widget quietly handles. The charge
                treats every coefficient alike, though a coefficient&rsquo;s
                size depends on its feature&rsquo;s scale, and t⁹ runs
                thousands of times larger than t on this data. So the features
                are standardized first, each column scaled to a common spread
                using the mean and standard deviation from the{" "}
                <Link
                  href="/primers/statistics"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  statistics primer
                </Link>
                , and the bars you watch are on that common scale. Penalising
                unscaled features would punish whichever ones happened to be
                measured in small units.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Shrinkage",
          content: (
            <>
              <p>
                For one feature the ridge answer can be worked by hand, and it
                is worth doing once to see how gentle the machinery is. On the
                regression page&rsquo;s five people the slope was a ratio of
                two sums, the deviation products over the squared deviations,
                200 over 250. Ridge changes exactly one thing. The penalty is
                added to the denominator.
              </p>
              <Equation>{"ridge slope = 200 / (250 + λ)"}</Equation>
              <p>
                So the slope drains smoothly as the price rises, and never
                quite reaches zero.
              </p>
              <Equation>{"λ = 0     slope = 200 / 250 = 0.8\nλ = 50    slope = 200 / 300 ≈ 0.667\nλ = 250   slope = 200 / 500 = 0.4"}</Equation>
              <p>
                The λ of zero row is the ordinary fit from the regression page,
                recovered exactly, which is reassuring. Regularisation contains
                the unpenalised method as its free case rather than replacing
                it.
              </p>
              <p>
                Lasso shrinks by a different arithmetic. Rather than diluting
                the slope through the denominator, it subtracts a fixed amount
                from the numerator&rsquo;s pull, and a subtraction can reach
                zero. Raise λ far enough and the slope does not merely get
                small, it becomes exactly 0, and the feature is out of the
                model altogether. That one difference, dividing down against
                subtracting away, is why the two methods part company in the
                next section.
              </p>
            </>
          ),
        },
        {
          title: "Ridge and Lasso Side by Side",
          content: (
            <>
              <p>
                Run the widget&rsquo;s slider up under ridge and watch the
                bars. All nine shrink together, the noisiest fastest, though
                every bar stays alive, thinner and thinner without ever quite
                dying. Ridge believes every feature deserves some say and
                argues only about how much. The terms readout stays at 9 of 9
                the whole way.
              </p>
              <p>
                Now switch to lasso and run the same slider. The bars do not
                thin evenly, they die. One by one the terms that pull the
                least weight go silent and grey, the readout counts down, and
                what survives is a short list of the terms doing the real
                work. At a moderate penalty the fit often runs on three or
                four of the nine, still scoring well, and the other five were
                by implication decoration.
              </p>
              <p>
                That switching-off is called feature selection, and it is the
                lasso&rsquo;s gift. A model that ends with most coefficients
                at exactly zero is a model you can read, this matters, this
                does not, which in a setting with hundreds of candidate
                features can be worth more than the predictions. Ridge&rsquo;s
                gift is steadiness. By keeping every feature it spreads credit
                across correlated inputs instead of arbitrarily crowning one,
                which is exactly the instability that sent Hoerl looking for
                it.
              </p>
            </>
          ),
        },
        {
          title: "Why a Worse Fit Predicts Better",
          content: (
            <>
              <p>
                Notice what the penalty costs where you can see it. Sliding
                from the free fit to a moderate ridge penalty drops R² by a
                sliver, from nearly 1 to the high 0.9s on this data, while the
                curve goes from frantic to plausible. We paid a little
                explained variation and bought a curve whose shape comes from
                the arc rather than the noise, and a curve shaped by the arc
                is what will land near next throw&rsquo;s measurements. The
                fit is worse on the data we have and better on the data we
                have not seen, which was the trade promised at the top.
              </p>
              <p>
                What this page cannot tell you is where to set the slider.
                Judging that honestly needs <Link href="/concepts/held-out-evaluation" className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400">measurements the fit never saw</Link>,
                held out for scoring, and that idea is large enough to deserve
                its own page rather than a paragraph here. For now the visual
                rule serves. The right penalty is the one past the wiggle and
                short of the flatline, and the plausible stretch in between is
                wide.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Ridge&rsquo;s formula comes from the same move as every
                regression so far, set the derivatives of the objective to
                zero, with one new term along for the ride. The objective is
                the residual sum of squares plus the charge, and
                differentiating with respect to any one coefficient produces
                the old flatness condition plus the charge&rsquo;s own
                derivative, 2λβ.
              </p>
              <Equation>{"∂/∂β [ RSS + λ·Σβ² ]  =  ∂RSS/∂β + 2λβ  =  0"}</Equation>
              <p>
                One equation per coefficient again, still linear, so algebra
                can still finish the job. For a single centred feature the
                ordinary condition said the slope is the product sum over the
                square sum, and the new term moves λ into the denominator.
              </p>
              <Equation>{"−2·Σx(y − βx) + 2λβ = 0\nβ = Σxy / (Σx² + λ)"}</Equation>
              <p>
                which on the five people is 200 over 250 plus λ, the worked
                shrinkage table earned rather than stated. With many features
                the equations bundle into the multiple regression
                page&rsquo;s normal equations with λ added down the diagonal,
                and that addition is also what steadies Hoerl&rsquo;s wild
                solutions, since two correlated inputs can no longer trade
                enormous opposite coefficients between them for free once
                every coefficient pays for its size.
              </p>
              <p>
                Lasso refuses this treatment, and the refusal is the
                interesting part. Its charge is λ·Σ|β|, and the absolute
                value has a corner at zero, no derivative there to set to
                zero, so no equation comes out and no closed form exists.
                What the corner gives instead is the zeroing. Just right of
                zero the charge pulls back with force λ, just left of zero it
                pushes forward with force λ, and when the data&rsquo;s pull
                on a coefficient is weaker than that, the best the
                coefficient can do is stop exactly at the corner. That is why
                lasso subtracts where ridge divides, why its coefficients
                reach zero at a finite penalty, and why the library fits it
                by sweeping one coefficient at a time rather than by a
                formula.
              </p>
              <p>
                Both behaviours are traced below on the worked five. The
                ridge curve is the table&rsquo;s formula at every penalty,
                gliding toward zero without arriving, and the lasso path
                walks straight into it at 400 and stays.
              </p>
              <ShrinkagePathChart />
            </>
          ),
        },
      ]}
    />
  );
}
