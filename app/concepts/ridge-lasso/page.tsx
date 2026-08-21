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
import { ContributionTugOfWar } from "@/components/widgets/ContributionTugOfWar";
import { OneCoefficientObjective } from "@/components/widgets/OneCoefficientObjective";
import { PenaltyCurvesPlayground } from "@/components/widgets/PenaltyCurvesPlayground";
import { PenaltyGeometryPlayground } from "@/components/widgets/PenaltyGeometryPlayground";
import { PenaltyPlayground } from "@/components/widgets/PenaltyPlayground";
import { RefitSensitivityPlayground } from "@/components/widgets/RefitSensitivityPlayground";
import { RegularisationPathDashboard } from "@/components/widgets/RegularisationPathDashboard";
import { ShrinkagePathChart } from "@/components/widgets/ShrinkagePathChart";
import { SoftThresholdSlider } from "@/components/widgets/SoftThresholdSlider";

export const metadata: Metadata = {
  title: "Ridge & Lasso · oop_ml",
  description:
    "See why an excellent training fit can be unstable, put coefficient size into the objective, and watch ridge and lasso answer that cost differently.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function RidgeLassoPage() {
  return (
    <ConceptPage
      title="Ridge & Lasso"
      tagline="Charge the fit for large coefficients, and it stops chasing noise."
      prerequisites={
        <>
          This page answers the problem{" "}
          <Link href="/concepts/multiple-polynomial-regression" className={linkClass}>
            multiple and polynomial regression
          </Link>{" "}
          ends on, so read that page first, and its worked shrinkage reuses the
          five people from{" "}
          <Link href="/concepts/simple-linear-regression" className={linkClass}>
            simple linear regression
          </Link>
          .
        </>
      }
      history={
        <>
          <p>
            Arthur Hoerl was a statistician at DuPont working on chemical
            process data, where temperature, pressure and flow rate rise and
            fall together, and he had watched least squares do something on
            that data that he described plainly. The fitted coefficients were
            far too large, some had the wrong sign, and refitting on the next
            batch produced a different set. The cause was the correlation
            among the inputs, since when two columns carry nearly the same
            information many combinations of coefficients explain the data
            almost equally well and the fit picks among them on noise. Hoerl
            and Robert Kennard published &ldquo;Ridge Regression: Biased
            Estimation for Nonorthogonal Problems&rdquo; in Technometrics in
            1970, and the title says what they were proposing to give up.
            Least squares is unbiased and its coefficients were still useless,
            so they added a constant to the diagonal of the matrix the normal
            equations invert and proved there is always some positive constant
            for which the expected squared error of the coefficients falls.
            The name came from the ridge analysis Hoerl had used on response
            surfaces in the 1950s, and their tool for choosing the constant
            was the ridge trace, a plot of every coefficient against the
            penalty, read by eye until the coefficients stopped swinging.
            Andrey Tikhonov had published the same addition to the diagonal
            in 1963 for ill-posed problems in physics, which is why the method
            carries two names.
          </p>
          <p>
            Robert Tibshirani, at the University of Toronto, published
            &ldquo;Regression Shrinkage and Selection via the Lasso&rdquo; in
            1996, and its opening problem was the one ridge leaves behind.
            Ridge shrinks every coefficient and drops none, so a fit with
            forty inputs still has forty coefficients to report, and the other
            route, subset selection, keeps or drops each input outright and is
            as unstable as the deep trees on the later pages, a small change
            in the data changing which inputs survive. Tibshirani credited Leo
            Breiman&rsquo;s nonnegative garrote of 1995 with the idea of a
            continuous shrinkage that can reach zero, and his change to
            Hoerl&rsquo;s penalty is one exponent, absolute values in place of
            squares. That is the whole reason the two methods share a page and
            behave so differently on it, since the absolute value has a corner
            at zero and the square does not, and a corner is what lets a
            coefficient come to rest exactly there. The polynomial page ended
            on a degree-9 curve transcribing its sample, and both methods are
            answers to it, though I want to be plain that neither is free.
            Both trade a worse fit on the people we have for a better
            prediction on the people we have not measured, and this page is
            about how that trade is arranged, starting with what goes wrong
            before it names the cure.
          </p>
        </>
      }
      playground={<PenaltyPlayground />}
      sections={[
        {
          title: "Part 1. Why Restraining a Model Can Help",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Revisit the overfit polynomial">
                <p>
                  The box above is the polynomial page&rsquo;s problem, the
                  same noisy throw fitted at degree 9, far more bend than a
                  ball deserves. Set the penalty slider to its lowest and the
                  fit answers only to the data. It scores 0.997 on the fifteen
                  readings, and on the polynomial page the same curve scored
                  −5479 on four readings held back from it. The training score
                  and the held-out score are not measuring the same thing, and
                  the whole of this page follows from the gap between them.
                </p>
                <p>
                  Look at the bars under the curve rather than the curve. Each
                  is one of the nine coefficients. They are what the fit
                  actually chose, and everything the curve does between the
                  readings is built out of them.
                </p>
              </SubSection>

              <SubSection title="2. Large contributions that cancel">
                <p>
                  Bars alone do not show how the terms interact, so pick one
                  moment in time and take the prediction there apart. Each
                  term contributes its coefficient times its column, positives
                  stack upward and negatives stack downward, and the prediction
                  is where the stack ends.
                </p>
                <ContributionTugOfWar />
                <WorkedExample title="At t = 2, with no penalty">
                  <p>
                    The positive terms add up to 77,446 metres. The negative
                    terms add up to −77,438. The intercept is 12.76, and the
                    prediction is 20.39, a sensible height for a ball two
                    seconds into a throw, assembled out of pieces the size of
                    mountains that cancel to within eight metres of each other.
                  </p>
                  <p>
                    At a penalty of 1 the same prediction is 17.69, built from
                    positives totalling 5.2 and negatives totalling −0.2.
                  </p>
                </WorkedExample>
                <p>
                  A moderate prediction produced by large opposing pieces is
                  sensitive to the smallest change in any of them. Nudge the
                  t⁶ coefficient by a hundredth of a percent and the prediction
                  moves by more than four metres. That sensitivity is the
                  problem regularisation is for, and it is worth seeing before
                  any penalty is mentioned.
                </p>
              </SubSection>

              <SubSection title="3. Sensitivity to the training sample">
                <p>
                  Coefficient size matters because of what it does when the
                  data changes. Below, the same degree-9 model is fitted three
                  times, on the noisy throw, on the same readings with one of
                  them moved a metre and a half, and on a fresh set of readings
                  of the same throw with its own noise.
                </p>
                <RefitSensitivityPlayground />
                <NumberTable
                  headings={["Sample", "Training R²", "Largest coefficient, no penalty", "Largest coefficient, λ = 1"]}
                  rows={[
                    ["A, the noisy throw", "0.997", "85,263", "7.64"],
                    ["B, one reading moved", "0.993", "76,525", "7.80"],
                    ["C, fresh noise", "0.999", "28,206", "7.81"],
                  ]}
                  caption="Three excellent training scores, three sets of coefficients that agree on nothing, and one penalty that brings them within two percent of each other."
                />
                <p>
                  Small change in the data, large change in the coefficients,
                  large change in the curve between the readings. That is what
                  an unstable model is, and it is a stronger case for restraint
                  than the curve looking implausible, because it says the fit
                  will not survive contact with the next sample.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Two Goals in One Objective",
          content: (
            <>
              <SubSection title="4. Fit versus restraint">
                <p>
                  There are two things to want from a fit. It should match the
                  observed data, and it should not depend on extreme
                  coefficients to do it. Section 3 offers exactly that choice.
                  Sample A with no penalty scores 0.997 with a largest
                  coefficient of 85,263. At λ = 1 it scores 0.846 with a largest
                  coefficient of 7.64.
                </p>
                <p>
                  So the question is not whether the second model fits worse.
                  It does. The question is how much training error you would
                  accept in exchange for a model that does not fall apart when
                  one reading moves, and that is a trade rather than a
                  correction. Regularisation makes the trade deliberately.
                </p>
              </SubSection>

              <SubSection title="5. The regularised objective">
                <p>
                  Write the trade down as one number to minimise, made of two
                  parts.
                </p>
                <Equation>{"total objective = data error + coefficient cost\ntotal objective = RSS + λ · penalty"}</Equation>
                <p>
                  RSS is the residual sum of squares from every regression
                  page so far, and asks how well the model fits the readings.
                  The penalty asks how costly the coefficients are. λ sets the
                  relative price of the two. Below, the objective is drawn at
                  every λ on the path in its two halves, grey for RSS and
                  colour for λ times the penalty, and the fit at each λ is the
                  set of coefficients that made the whole bar shortest.
                </p>
                <RegularisationPathDashboard model="ridge" panels={["objective", "curve"]} />
                <p>
                  That last point matters. Regularised regression is not
                  choosing the model with the smallest RSS. At λ = 1 the RSS is
                  101 where the unpenalised fit reached 1.7, and the fit accepts
                  that because 101 plus a coefficient cost of 79 is less than
                  what any wilder set of coefficients would total. A
                  regularised fit takes more training error on purpose to reach
                  a lower total.
                </p>
              </SubSection>

              <SubSection title="6. What λ controls">
                <NumberTable
                  headings={["λ", "What the fit cares about", "What happens"]}
                  rows={[
                    ["0", "training error only", "ordinary least squares comes back exactly"],
                    ["moderate", "error and coefficient size", "coefficients shrink, RSS rises a little"],
                    ["very large", "coefficient size dominates", "the penalised coefficients head to zero and the curve toward the intercept alone"],
                  ]}
                />
                <p>
                  λ does not set a coefficient. It changes the trade that
                  decides them all, which is why sliding it moves every bar in
                  the box at the top of the page at once. The path above is
                  drawn on a log scale because the useful values run from a
                  thousandth to ten, and a linear slider would spend most of
                  its length past the point where anything interesting happens.
                </p>
                <KeepInMind>
                  <p>
                    A value of λ means nothing on its own. It is a price, and
                    the same number buys a different amount of restraint
                    depending on the scale of the features, the scale of the
                    target, whether the error is summed or averaged, and any
                    constant the objective carries. The λ that works here is
                    not the λ that works on other data, or on this data written
                    as mean squared error rather than RSS. It only ever means
                    something relative to the objective it sits inside.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Why Features Must Be Put on Comparable Scales",
          content: (
            <>
              <SubSection title="7. Why feature scale matters">
                <p>
                  Take the regression page&rsquo;s five people and their slope
                  of 0.8 kilograms per centimetre. Measure the same heights in
                  metres instead and the slope becomes 80 kilograms per metre.
                  The predictions are identical, since 0.8 × 170 and 80 × 1.70
                  are the same number. Only the coefficient changed, by a
                  factor of a hundred, and its squared penalty changed by ten
                  thousand.
                </p>
                <WorkedExample title="The same five people, twice">
                  <NumberTable
                    headings={["Height in", "Ordinary slope", "β²", "Ridge slope at λ = 50"]}
                    rows={[
                      ["centimetres", "0.8 kg per cm", "0.64", "0.667 kg per cm"],
                      ["metres", "80 kg per m", "6400", "0.040 kg per m"],
                    ]}
                    caption="0.040 kg per metre is 0.0004 kg per centimetre. The same data, the same λ, and one fit is shrunk by a sixth while the other is all but switched off."
                  />
                </WorkedExample>
                <p>
                  A large coefficient can mean a feature matters a great deal,
                  or it can mean the feature was measured in small units.
                  Penalising raw coefficients charges for units rather than for
                  complexity, and the choice of units ends up choosing the
                  model.
                </p>
              </SubSection>

              <SubSection title="8. Standardizing before regularisation">
                <p>
                  The repair is the{" "}
                  <Link href="/primers/statistics" className={linkClass}>
                    statistics primer
                  </Link>
                  &rsquo;s z-score, applied to every feature column before the
                  fit.
                </p>
                <Equation>{"zⱼ = (xⱼ − x̄ⱼ) / sⱼ"}</Equation>
                <p>
                  Subtracting the mean centres the column. Dividing by its
                  standard deviation puts every column on a common spread, so a
                  coefficient of 2 means the same thing whichever column it
                  sits on, and the penalty can compare them. Every fit on this
                  page does this. The bars in the box at the top are
                  coefficients on standardized columns, which is why t⁹, whose
                  raw values reach 262,144, can be drawn beside t.
                </p>
                <p>
                  Centring also settles the intercept. On centred features the
                  intercept is the prediction at the average of every input,
                  which for the throw is the mean height, 12.76 metres. That
                  number sets the overall level of the predictions rather than
                  how they respond to any feature, and penalising it would pull
                  every prediction toward zero rather than toward the data.
                  So the coefficients are charged and the intercept is not,
                  on both of this page&rsquo;s models.
                </p>
                <KeepInMind>
                  <p>
                    That is a convention rather than a law, and libraries
                    differ on it. And the means and standard deviations must
                    be learned from the training rows only, then applied
                    unchanged to any held-out rows. Recomputing them on the
                    held-out data lets the judge see the answers, which is the
                    leak the{" "}
                    <Link href="/concepts/pipelines" className={linkClass}>
                      pipelines page
                    </Link>{" "}
                    measures.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Ridge Regression",
          content: (
            <>
              <SubSection title="9. Ridge's squared penalty">
                <p>Ridge charges the sum of the squared coefficients.</p>
                <Equation>{"RSS + λ · Σ βⱼ²"}</Equation>
                <p>
                  Before combining it with anything, look at what β² costs for
                  one coefficient. Zero costs nothing, 1 costs 1, 2 costs 4, 4
                  costs 16. Moving away from zero becomes increasingly
                  expensive, a positive and a negative coefficient of the same
                  size cost the same, and the curve is smooth everywhere,
                  including at zero.
                </p>
                <PenaltyCurvesPlayground />
                <p>
                  The slope readout is the part to notice now and use later.
                  The slope of β² is 2β, which at zero is zero. Near zero,
                  ridge barely pushes at all, and that is why its coefficients
                  approach zero without arriving. The other panel is Part 5.
                </p>
              </SubSection>

              <SubSection title="10. Ridge shrinkage by hand">
                <p>
                  For one feature the ridge answer can be worked out
                  completely, and the conditions are worth stating because
                  the formula depends on them. One feature. Feature and target
                  both centred, so the intercept is handled separately and
                  drops out. And the objective written as RSS, not a mean and
                  not halved.
                </p>
                <Equation>{"Σ (yᵢ − βxᵢ)² + λβ²"}</Equation>
                <p>
                  Ordinary least squares on centred data gives the slope as a
                  ratio of two sums, and ridge changes exactly one thing about
                  it.
                </p>
                <Equation>{"β = Σxᵢyᵢ / Σxᵢ²          ordinary\nβ = Σxᵢyᵢ / (Σxᵢ² + λ)    ridge"}</Equation>
                <p>
                  On the regression page&rsquo;s five people the two sums are
                  200 and 250, so the ridge slope is 200 over 250 plus λ.
                </p>
                <WorkedExample>
                  <NumberTable
                    headings={["λ", "denominator", "ridge slope"]}
                    rows={[
                      ["0", "250", "200 / 250 = 0.8"],
                      ["50", "300", "200 / 300 = 0.667"],
                      ["250", "500", "200 / 500 = 0.4"],
                      ["1000", "1250", "200 / 1250 = 0.16"],
                    ]}
                    caption="The λ of zero row is the regression page's fit, recovered exactly. The numerator never changes; the denominator grows without limit, so the slope drains toward zero and never reaches it."
                  />
                </WorkedExample>
                <p>
                  The whole objective is drawn below over the slope, RSS as a
                  parabola with its floor at 0.8, the penalty as a second
                  parabola with its floor at zero, and their sum. Slide λ and
                  the sum&rsquo;s lowest point slides toward zero.
                </p>
                <OneCoefficientObjective />
                <p>
                  The indigo curve on the shrinkage path below is that formula
                  fitted at every penalty from 0 to 500. The amber curve is
                  Part 5.
                </p>
                <ShrinkagePathChart />
              </SubSection>

              <SubSection title="11. Ridge with correlated features">
                <p>
                  With several features the coefficients are fitted together,
                  and the one-feature picture needs care to generalise. What
                  ridge does is discourage large overall coefficient magnitude.
                  It generally keeps every feature with a nonzero coefficient,
                  and it steadies the fit when features are correlated, which
                  is the case Hoerl built it for. What it does not do is
                  shrink every coefficient at the same rate, or shrink the
                  noisiest first, or hold an opinion about which features
                  deserve a say. The path below is every one of the nine
                  polynomial coefficients against log λ, and they cross each
                  other, change sign and shrink at nine different speeds.
                </p>
                <RegularisationPathDashboard model="ridge" panels={["paths", "scores"]} />
                <p>
                  The right-hand panel is the point of the exercise. The
                  training score only ever falls as λ rises, since every
                  penalty is a constraint the free fit did not have. The
                  held-out score, on four readings the fit never saw, climbs
                  from ruin at no penalty to 0.993 near λ = 0.0001 and only then
                  begins to fall. Restraint buys prediction, up to a point, and
                  Part 7 is about finding the point.
                </p>
                <p>
                  Why correlated features are steadied is a geometric fact and
                  deserves its own picture. Below, two columns track each
                  other, the second close to twice the first, and the residual
                  sum of squares is drawn over every pair of coefficients.
                </p>
                <PenaltyGeometryPlayground />
                <WorkedExample title="Reading the valley">
                  <p>
                    The RSS forms a long shallow valley, because raising the
                    first coefficient and lowering the second by half as much
                    barely changes any prediction. Least squares sits at the
                    valley&rsquo;s lowest point, (4.61, 0.12). Tick &ldquo;jostle
                    the sample&rdquo; and the target is disturbed by a fraction
                    of its spread, and the least-squares point slides along
                    the floor to (5.99, −0.57), a move of one and a half in the
                    first coefficient from a change that barely dented the fit.
                  </p>
                  <p>
                    Ridge at λ = 1 sits at (1.21, 1.78), and after the same
                    jostle at (1.31, 1.73). It moved a tenth. The circle is the
                    set of coefficient pairs with the same squared penalty as
                    the solution, and the solution is where an RSS contour first
                    touches that circle. A long valley meets a circle at one
                    well-defined place; it meets nothing at all along its own
                    floor.
                  </p>
                </WorkedExample>
                <p>
                  Notice also where ridge went. Not toward the origin along
                  the line from the least-squares point, but across, to a pair
                  where both coefficients carry some of the effect. Two large
                  opposing coefficients cost a great deal in β², and two
                  moderate shared ones cost less while predicting nearly the
                  same, so ridge picks a smaller and steadier pair from among
                  the many that fit similarly. That is the whole of what
                  &ldquo;spreading credit across correlated inputs&rdquo; means,
                  and it is a consequence of the circle rather than a belief
                  about features.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Lasso Regression",
          content: (
            <>
              <SubSection title="12. Lasso's absolute-value penalty">
                <p>Lasso charges the sum of the absolute values instead.</p>
                <Equation>{"RSS + λ · Σ |βⱼ|"}</Equation>
                <p>
                  For one coefficient the cost is 0, 1, 2, 4 for β of 0, 1, 2,
                  4, a straight line either side of zero. Go back to section
                  9&rsquo;s widget and drag β across both panels. Ridge is a
                  bowl, smooth at the bottom. Lasso is a V with a corner at
                  zero, and its slope is +1 on one side and −1 on the other,
                  the same size everywhere and undefined exactly at the corner.
                </p>
                <p>
                  So lasso pulls toward zero with constant force, however small
                  the coefficient already is, where ridge&rsquo;s pull fades
                  as the coefficient does. The corner is what makes the
                  difference in the next two sections.
                </p>
              </SubSection>

              <SubSection title="13. Lasso shrinkage by hand">
                <p>
                  Same conditions as section 10, one centred feature, RSS
                  without a half. Write the two sums as S for short.
                </p>
                <Equation>{"Sₓᵧ = Σxᵢyᵢ = 200        Sₓₓ = Σxᵢ² = 250"}</Equation>
                <p>
                  For a positive slope the lasso answer subtracts from the
                  numerator rather than adding to the denominator.
                </p>
                <Equation>{"β = (Sₓᵧ − λ/2) / Sₓₓ     while λ/2 < Sₓᵧ\nβ = 0                     once λ/2 ≥ Sₓᵧ"}</Equation>
                <p>
                  The data pulls the slope away from zero with a force of 200.
                  The penalty removes λ/2 of that pull, and what remains is
                  divided by 250. Once λ/2 reaches 200, at λ = 400, nothing
                  remains and the slope is exactly zero.
                </p>
                <SoftThresholdSlider />
                <p>
                  The half comes from the objective being written as RSS with
                  no factor in front, so that the derivative of the squared
                  term carries a 2 the penalty term does not. Write the
                  objective with a half, or as a mean, and the threshold moves.
                  The mechanism does not.
                </p>
                <p>
                  The amber path in section 10&rsquo;s shrinkage chart is this
                  formula fitted at every λ, and it walks straight into zero at
                  400 and stays. Ridge&rsquo;s indigo path passes 0.16 there
                  and keeps gliding.
                </p>
              </SubSection>

              <SubSection title="14. Why lasso reaches zero">
                <p>
                  Return to section 10&rsquo;s two panels, which draw the same
                  RSS parabola under both penalties, and slide λ upward. The
                  ridge minimum moves toward zero continuously and sits just
                  beside it however far λ goes. The lasso minimum arrives at
                  zero at λ = 400 and stays there for every λ after.
                </p>
                <WhyThisWorks title="Why the corner holds the minimum">
                  <p>
                    At any coefficient other than zero the objective has a
                    slope, and the minimum is where that slope is zero. The
                    slope of RSS at β is −2(Sₓᵧ − Sₓₓβ), and the slope of the
                    ridge penalty is 2λβ, which vanishes at zero, so at β = 0
                    the only pull is the data&rsquo;s, and the minimum cannot
                    sit there unless the data has no pull at all.
                  </p>
                  <p>
                    The lasso penalty has no single slope at zero. Just to the
                    right its slope is +λ, just to the left it is −λ, and every
                    value between −λ and +λ counts as a slope at the corner.
                    Zero is the minimum whenever the data&rsquo;s pull, 2Sₓᵧ,
                    lies inside that range, which is whenever λ ≥ 2Sₓᵧ, or
                    λ/2 ≥ Sₓᵧ. A whole range of data pulls is balanced at the
                    corner, and that range is what the flat stretch in section
                    13&rsquo;s map draws.
                  </p>
                </WhyThisWorks>
                <p>
                  Lasso can remove a coefficient because a penalty with a
                  corner can overpower a weak data contribution at a finite λ.
                  A penalty that is smooth at zero never can.
                </p>
              </SubSection>

              <SubSection title="15. Sparse models and feature selection">
                <p>
                  On the nine polynomial terms the lasso paths below do what
                  the one-feature arithmetic predicts. Coefficients arrive at
                  the zero line and stay, the count of active terms falls, and
                  the fitted curve keeps its shape on fewer and fewer terms.
                </p>
                <RegularisationPathDashboard model="lasso" panels={["paths", "scores"]} />
                <p>
                  Two things on that chart are easy to over-read. The active
                  count is not monotone. It falls from 9 to 5 by λ = 0.06 and
                  rises to 6 at λ = 0.1, because a term that was switched off
                  came back when a correlated neighbour was shrunk and its share
                  of the work needed picking up. And the first term to reach
                  zero is not the least important term in any objective sense.
                  It is the term whose contribution the others could most
                  cheaply absorb at that λ, on this sample.
                </p>
                <p>
                  A model that ends with most coefficients at exactly zero is
                  smaller and easier to inspect, and in a setting with hundreds
                  of candidate features that can be worth more than the
                  predictions. It is a sparse predictive representation, and it
                  is not a list of which features matter.
                </p>
                <KeepInMind>
                  <p>
                    A zero coefficient means the fitted model is not currently
                    using that feature. It does not prove the feature has no
                    relationship with the target. With correlated inputs lasso
                    may keep one and drop another that carries nearly the same
                    information, and a different sample can change which. In
                    section 11&rsquo;s valley, switch to lasso at λ = 0.18. On
                    the original sample it keeps both columns, at (4.15, 0.35).
                    Jostle the sample and it drops the second entirely, (4.84,
                    0). Raise λ past 3 and on both samples it drops the first
                    instead and keeps the second at 2.38, since one unit of
                    the second column does the work of two units of the first
                    at half the absolute cost. Polynomial powers are strongly
                    correlated with each other over a short interval, which
                    makes them a good demonstration of instability and a
                    misleading demonstration of tidy feature selection.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Ridge and Lasso Compared",
          content: (
            <>
              <SubSection title="16. Ridge and lasso side by side">
                <p>
                  Everything above used the same data, the same
                  standardization, the same degree-9 columns, the same
                  held-out split and the same λ scale, so the two can be set
                  beside each other fairly.
                </p>
                <NumberTable
                  headings={["", "Ridge", "Lasso"]}
                  rows={[
                    ["penalty", "squared magnitude, Σβ²", "absolute magnitude, Σ|β|"],
                    ["one-feature solution", "divide the pull by Sₓₓ + λ", "subtract λ/2 from the pull, then divide"],
                    ["typical coefficient pattern", "many smaller values, rarely an exact zero", "some exact zeros"],
                    ["correlated features", "often shares the weight between them", "may keep one and drop another"],
                    ["path as λ grows", "smooth", "kinks where a coefficient reaches zero"],
                    ["closed form with many features", "yes, section 21", "no, section 22"],
                    ["main use", "stability and shrinkage", "shrinkage and sparsity"],
                  ]}
                />
                <p>
                  Neither is the better method. Ridge is the one to reach for
                  when many features each carry a little signal and the
                  problem is instability. Lasso is the one to reach for when
                  the model has to be small enough to read, or when most of the
                  features are believed to be irrelevant. Both are available at
                  once, in the elastic net, which is a share of each penalty.
                </p>
              </SubSection>

              <SubSection title="17. The geometry of their penalties">
                <p>
                  The clearest account of why one produces zeros and the other
                  does not is section 11&rsquo;s valley, with the toggle set to
                  lasso. For two coefficients the RSS contours are ellipses.
                  Ridge&rsquo;s penalty is a circle, and the solution is where
                  the expanding circle first touches the best available
                  contour. Lasso&rsquo;s penalty is a diamond, |β₁| + |β₂|
                  constant, and its corners lie on the axes, exactly where one
                  coefficient is zero.
                </p>
                <p>
                  An ellipse meeting a circle touches it at a point with no
                  special relationship to the axes, so both coefficients come
                  out nonzero. An ellipse meeting a diamond very often touches
                  it at a corner first, because corners stick out, and a corner
                  is a solution with one coefficient at exactly zero. Slide the
                  λ control with lasso selected and watch the green dot ride
                  the diamond&rsquo;s edge until it snaps onto the vertical
                  axis at λ ≈ 3, where the first coefficient is zero from then
                  on. Lasso produces zeros because the shape of its penalty has
                  corners on the coefficient axes, and ridge does not because a
                  circle has none.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Choosing the Penalty",
          content: (
            <>
              <SubSection title="18. Training error versus validation error">
                <p>
                  The dashboard below is every instrument on one λ. Pick a
                  penalty and read the objective, the coefficients, the fitted
                  curve and the two scores together.
                </p>
                <RegularisationPathDashboard
                  model="ridge"
                  panels={["objective", "paths", "scores", "curve"]}
                  allowModelToggle
                />
                <p>
                  The pattern to see is in the scores panel. Training R² only
                  falls as λ grows. Held-out R² rises first, because the
                  unpenalised fit was memorising the eleven training readings,
                  and then falls, because too much restraint stops the curve
                  from following the arc at all. Under ridge the turn is near
                  λ = 0.0001 on this split, and under lasso near 0.1. Those
                  numbers belong to this data, this standardization and this
                  split, and to nothing else.
                </p>
                <p>
                  The penalty is chosen by performance on data that did not
                  determine the coefficients. Nothing on the training side of
                  the chart can choose it, since that side always prefers λ = 0.
                </p>
              </SubSection>

              <SubSection title="19. Choosing λ">
                <p>
                  The old rule on this page said the right penalty is past the
                  wiggle and short of the flatline, and the box at the top
                  still shows what that means. Keep it as a picture of the
                  trade and not as a procedure. A curve that looks moderate is
                  not evidence that it will predict well, and two λ values that
                  produce curves you could not tell apart by eye can differ by a
                  tenth in held-out score.
                </p>
                <p>
                  The procedure is the one section 18 previews. Fit several
                  candidate values of λ on the training rows. Score each on
                  held-out rows, or better, let every row take a turn as the
                  judge, which is cross-validation. Choose by that score, and
                  where it matters, confirm the choice once on data that took
                  no part in choosing it. The{" "}
                  <Link href="/concepts/held-out-evaluation" className={linkClass}>
                    held-out evaluation
                  </Link>{" "}
                  and{" "}
                  <Link href="/concepts/grid-search" className={linkClass}>
                    grid search
                  </Link>{" "}
                  pages do this properly, including the part where the winning
                  score flatters itself.
                </p>
              </SubSection>

              <SubSection title="20. Degree selection versus regularisation">
                <p>
                  Both reduce overfitting and they make different choices.
                  Choosing a lower degree removes whole columns from the model.
                  Ridge keeps every column and shrinks its coefficient. Lasso
                  keeps the columns and may zero some, and with raw polynomial
                  powers it can keep t⁵ while dropping t⁴, so what survives is
                  not a tidy polynomial of some lower degree.
                </p>
                <WorkedExample title="Held-out R² over degree and λ, ridge, on the same split">
                  <NumberTable
                    headings={["Degree", "λ ≈ 0", "λ = 0.01", "λ = 1", "λ = 10"]}
                    rows={[
                      ["2", "0.989", "0.996", "−1.373", "−1.993"],
                      ["5", "0.988", "0.966", "−0.272", "−1.642"],
                      ["9", "0.929", "0.936", "−0.317", "−1.405"],
                    ]}
                    caption="Flexibility has two controls, and validation can choose both. The best cell here is degree 2 with a small penalty, and degree 9 with the right penalty is close behind."
                  />
                </WorkedExample>
                <p>
                  Two things in that table are worth a look. Degree 2 is
                  already the right shape for a ball, and a small penalty still
                  helped it, from 0.989 to 0.996. And λ = 1 is a heavy penalty
                  on eleven standardized rows whatever the degree, which is
                  section 6&rsquo;s caution in numbers.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Formal Derivation",
          content: (
            <>
              <SubSection title="21. Deriving ridge">
                <p>
                  In the matrix language of the polynomial page, the ridge
                  objective and its solution follow in four lines.
                </p>
                <DerivationTable
                  rows={[
                    { expression: "J(β) = ‖y − Xβ‖² + λ‖β‖²", reason: "RSS as a squared length, plus λ times the squared length of β" },
                    { expression: "∇J = −2Xᵀ(y − Xβ) + 2λβ", reason: "the polynomial page's gradient, plus the penalty's own derivative" },
                    { expression: "Xᵀ(y − Xβ) = λβ", reason: "set the gradient to zero and divide by −2" },
                    { expression: "(XᵀX + λI) β = Xᵀy", reason: "collect β, the normal equations with λ down the diagonal" },
                  ]}
                />
                <p>
                  With one centred feature XᵀX is the single number Σx², and
                  the last line is section 10&rsquo;s formula. With the
                  intercept in play it is either kept out of β and fitted
                  separately on centred data, as this page does, or the
                  identity matrix gets a zero in the intercept&rsquo;s position
                  so that it alone goes uncharged. And as on the polynomial
                  page, the system is solved directly rather than by forming
                  an inverse.
                </p>
                <WhyThisWorks title="Why λI steadies the solution">
                  <p>
                    XᵀX for the standardized degree-9 columns on the fifteen
                    readings has eigenvalues running from 0 up to 125.7. Two of
                    them are zero to machine precision and the next is one
                    millionth, so the ratio of largest to smallest is about
                    7.6 trillion, and solving the plain normal equations means
                    dividing by numbers that are effectively noise. That is
                    where the coefficients of 85,263 come from.
                  </p>
                  <p>
                    Adding λI adds λ to every eigenvalue and changes nothing
                    else about the matrix. At λ = 1 the smallest becomes 1 and
                    the ratio falls to 126.7. The directions the data could
                    not pin down are pinned to zero instead of to noise, and
                    the directions it could pin down are barely touched.
                  </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="22. Why lasso requires a different solver">
                <Equation>{"J(β) = ‖y − Xβ‖² + λ‖β‖₁"}</Equation>
                <p>
                  The same first step fails on the second term. |β| has no
                  ordinary derivative at zero, so there is no gradient to set to
                  zero and no linear system to solve, and lasso has no
                  normal-equations solution with many features. It does have
                  one with a single standardized feature, which is section 13,
                  and in a few special designs, but nothing that plays the role
                  of (XᵀX + λI)⁻¹.
                </p>
                <p>
                  What it has instead is the corner. At zero the absolute value
                  admits every slope between −λ and +λ, a subgradient rather
                  than a gradient, and zero is optimal whenever the data&rsquo;s
                  pull on that coefficient lies inside the range. The solver
                  used here is coordinate descent. It sweeps the coefficients
                  one at a time, and for each it holds the others fixed, which
                  reduces the problem to section 13&rsquo;s one-feature case
                  on the current residual, applies the soft threshold, and moves
                  on. Repeated until nothing moves, that arrives at the lasso
                  solution, one soft threshold at a time.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Boundaries and Forward Connections",
          content: (
            <SubSection title="23. What regularisation does and does not tell us">
              <p>
                After standardization and shrinkage a coefficient is not the
                number it was on the earlier pages. It is biased toward zero on
                purpose. Its size depends on the preprocessing and on λ, and it
                was chosen partly for the stability of the predictions rather
                than to describe the feature. A ridge coefficient of 0.3 on
                standardized t⁴ is a statement about what this fit decided at
                this λ, and not a measurement of how height depends on the
                fourth power of time.
              </p>
              <InAModel>
                <p>
                  Regularisation helps with the problems this page showed,
                  excessive variance, correlated features, unstable
                  coefficients and a model more flexible than its data can
                  support. It does not repair a missing feature, a biased
                  sample, a wrongly recorded target, data whose distribution
                  has shifted since it was collected, a leak between the
                  training rows and the held-out rows, or a model of the wrong
                  form altogether. A penalised fit on the wrong columns is a
                  stable fit on the wrong columns.
                </p>
                <p>
                  Those belong to{" "}
                  <Link href="/concepts/held-out-evaluation" className={linkClass}>
                    evaluation
                  </Link>{" "}
                  and to data preparation, and the honest position for this
                  page is that a penalty is one control among several, chosen
                  by the same held-out score everything else is.
                </p>
              </InAModel>
            </SubSection>
          ),
        },
      ]}
    />
  );
}
