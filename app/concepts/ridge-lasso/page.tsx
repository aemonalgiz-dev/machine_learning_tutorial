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
    "Limit the size of a model's coefficients and examine the trade between fitting and overfitting.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function RidgeLassoPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["ridge-lasso"]}
      technicalStart="Part 2. Two Goals in One Objective"
      openingTitle="A Better Fit Can Make a Worse Prediction"
      playgroundIntro="Increase the penalty and compare the curve and its coefficients. Notice what the model gives up in training fit as the coefficients shrink."
      title="Ridge & Lasso"
      tagline="Limit the size of a model's coefficients and examine the trade between fitting and overfitting."
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

      playground={<PenaltyPlayground />}
      sections={[
        {
          title: "Part 1. Why Restraining a Model Can Help",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Revisit the overfit polynomial">
                <p>
                  The box above is the polynomial page&rsquo;s problem, the
                  same noisy throw fitted at degree 9, far more flexibility than a
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
</>),
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
                <>
                  <p>
                    Regularization minimizes a combined objective. At penalty one, this
                    fit accepts a larger residual sum of squares in exchange for smaller
                    coefficients.
                  </p>
                  <Equation>{"combined objective ≈ residual cost + penalty cost\n                   ≈ 101 + 79 = 180"}</Equation>
                  <p>
                    The unpenalized fit’s residual cost was only about 1.7, but its
                    coefficient penalty would make its combined objective larger.
                    Compare complete objectives when judging which solution the
                    regularized fit should choose.
                  </p>
                </>
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
                <>
                  <p>
                    The regression page’s slope is 0.8 kilograms per centimetre.
                    Expressing height in metres makes the slope eighty kilograms per
                    metre. The height contribution to the prediction stays the same.
                  </p>
                  <Equation>{"in centimetres: 0.8 × 170 = 136\nin metres:      80 × 1.70 = 136\n\ncoefficient ratio = 80 / 0.8 = 100\nsquared-penalty ratio = 100² = 10,000"}</Equation>
                  <p>
                    The predictions are unchanged, but the penalty is not. This is why
                    the units of a feature matter to regularization.
                  </p>
                </>
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
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "At no penalty the positive terms at one moment total 77,446 metres and the negative terms −77,438. What does the lesson take from that?",
              [
                "A moderate prediction built from large opposing pieces is sensitive to the smallest change in any of them",
                "The prediction must be wrong, since the pieces are the size of mountains",
                "The intercept is mis-set, since the terms do not add up to the prediction",
                "The degree is too low for the shape of a throw",
              ],
              0,
              "The prediction there is 20.39, a sensible height for a ball two seconds into a throw, so the answer itself is not what is wrong. Nudge the t⁶ coefficient by a hundredth of a percent and the prediction moves by more than four metres, and that sensitivity is the problem regularisation is for.",
            ),
            trueFalse(
              "The λ that works on this data written as RSS is not the λ that works on the same data written as mean squared error.",
              true,
              "λ is a price rather than an amount, and it only ever means something relative to the objective it sits inside. Dividing the error by the number of readings changes the trade the same λ buys, as do the scale of the features, the scale of the target and any constant the objective carries, which is also why a λ cannot be carried over to other data.",
            ),
            choice(
              "Expressing height in metres rather than centimetres multiplies that slope by a hundred. What happens to its squared penalty?",
              [
                "It is multiplied by ten thousand",
                "It is unchanged, as the prediction is",
                "It is multiplied by a hundred",
                "It is divided by a hundred",
              ],
              0,
              "The contribution to the prediction is the coefficient times the column, so the prediction stays at 136 either way. The penalty charges the coefficient alone, and squaring a hundredfold gives ten thousand, which is how penalising raw coefficients charges for units rather than for complexity and lets the choice of units choose the model.",
            ),
            several(
              "Which of these hold once every column is standardized?",
              [
                "The means and standard deviations are learned from the training rows only and applied unchanged to held-out rows",
                "On centred features the intercept is the prediction at the average of every input, which for the throw is 12.76 metres",
                "A coefficient of 2 on t⁹ and a coefficient of 2 on t still mean different things, since t⁹’s raw values reach 262,144",
                "The intercept has to be charged too, since every parameter in the objective is",
              ],
              [0, 1],
              "Dividing each column by its standard deviation puts every column on a common spread, so a coefficient of 2 means the same thing whichever column it sits on and the penalty can compare them, which is what lets t⁹ be drawn beside t. The intercept sets the overall level of the predictions rather than how they respond to any feature, so penalising it would pull every prediction toward zero rather than toward the data, and it goes uncharged on both of this page’s models. Recomputing the means on the held-out data lets the judge see the answers, which is the leak the pipelines page measures.",
            ),
            choice(
              "The same degree-9 model is fitted to the noisy throw, to the same readings with one moved a metre and a half, and to a fresh set of readings of the same throw. What does section 3’s table show?",
              [
                "Three excellent training scores, three largest coefficients that agree on nothing, 85,263, 76,525 and 28,206, and a penalty of 1 that brings them within two percent of each other",
                "Three fits that agree on their coefficients, because the data barely changed",
                "Training scores that collapse when one reading moves",
                "A curve that changes only near the reading that moved",
              ],
              0,
              "The training scores are 0.997, 0.993 and 0.999, all excellent, and the coefficients behind them disagree by tens of thousands. Small change in the data, large change in the coefficients, large change in the curve between the readings, which is what an unstable model is. At λ = 1 the three largest coefficients are 7.64, 7.80 and 7.81, and that is a stronger case for restraint than the curve looking implausible, because it says the free fit will not survive contact with the next sample.",
            ),
        ],
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
                <>
                  <p>
                    For the five-person dataset, the centred cross-product is 200 and
                    the centred sum of height squares is 250.
                  </p>
                  <Equation>{"ridge slope = 200 / (250 + λ)"}</Equation>
                  <p>
                    Increasing the penalty increases the denominator and shrinks this
                    slope toward zero.
                  </p>
                </>
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
                <>
<p>
                  With several features the coefficients are fitted together, and the one-feature picture needs care to generalise. What ridge does is discourage large overall coefficient magnitude. It generally keeps every feature with a nonzero coefficient, and it steadies the fit when features are correlated, which is the case Hoerl built it for. What it does not do is shrink every coefficient at the same rate, or shrink the noisiest first, or hold an opinion about which features deserve a say.
                </p>
                <p>
                  The path below is every one of the nine polynomial coefficients against log λ, and they cross each other, change sign and shrink at nine different speeds.
                </p>
</>
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
                <>
                  <p>
                    In this one-feature example, lasso subtracts half the penalty from
                    the positive data term before dividing by 250. Once the subtraction
                    exhausts that term, the solution is zero.
                  </p>
                  <Equation>{"positive slope = max(0, 200 − λ/2) / 250\nzero threshold: λ/2 = 200\n                λ = 400"}</Equation>
                  <p>
                    This exact zero is the feature of lasso that the ridge solution does
                    not share in this example.
                  </p>
                </>
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
                  400 and stays. Ridge&rsquo;s indigo path passes 0.31 there
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
                  count is not monotone. It falls from 9 to 6 by λ = 0.056, to
                  4 by 0.178 and to 2 by 3.2, then rises to 3 at 5.6 before
                  falling back to 2 at 10, because a term that was switched off
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
                  <>
<p>
                    A zero coefficient means the fitted model is not currently using that feature. It does not prove the feature has no relationship with the target. With correlated inputs lasso may keep one and drop another that carries nearly the same information, and a different sample can change which. In section 11&rsquo;s valley, switch to lasso at λ = 0.18.
                  </p>
                  <p>
                    On the original sample it keeps both columns, at (4.15, 0.35). Jostle the sample and it drops the second entirely, (4.84, 0). Raise λ past 3 and on both samples it drops the first instead and keeps the second at 2.38, since one unit of the second column does the work of two units of the first at half the absolute cost.
                  </p>
                  <p>
                    Polynomial powers are strongly correlated with each other over a short interval, which makes them a good demonstration of instability and a misleading demonstration of tidy feature selection.
                  </p>
</>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "With a centred cross-product of 200 and a centred sum of squares of 250, what does the one-feature ridge slope do as λ grows?",
              [
                "It shrinks toward zero, because λ is added to the denominator",
                "It reaches zero at λ = 400 and stays there",
                "It grows, because the penalty is added to the numerator",
                "It is unchanged, since the penalty reaches only the intercept",
              ],
              0,
              "Ridge changes exactly one thing about the least-squares ratio, which is the λ added to the sum of squares underneath, so a larger penalty gives a smaller slope and never quite zero. Arriving at zero at 400 and staying is the lasso path on the same two sums, which subtracts from the numerator instead.",
            ),
            trueFalse(
              "Ridge shrinks every coefficient at the same rate.",
              false,
              "What it does is discourage large overall coefficient magnitude. The path of the nine polynomial coefficients against log λ has them crossing each other, changing sign and shrinking at nine different speeds, and nothing in the method shrinks the noisiest first or holds an opinion about which features deserve a say.",
            ),
            choice(
              "Two columns track each other and a jostle moves the least-squares point from (4.61, 0.12) to (5.99, −0.57). What does ridge at λ = 1 do under the same jostle?",
              [
                "It moves from (1.21, 1.78) to (1.31, 1.73), a move of a tenth",
                "It moves further, since the penalty amplifies the disturbance",
                "It does not move at all",
                "It slides along the floor of the valley as least squares does",
              ],
              0,
              "The RSS forms a long shallow valley, because raising one coefficient and lowering the other by half as much barely changes any prediction, and least squares slides along the floor. A long valley meets a circle at one well-defined place, and it meets nothing at all along its own floor. Notice also where ridge went, across to a pair where both coefficients carry some of the effect rather than toward the origin, because two moderate shared coefficients cost less in β² than two large opposing ones while predicting nearly the same.",
            ),
            choice(
              "Why can lasso put a coefficient at exactly zero where ridge cannot?",
              [
                "At the corner every value between −λ and +λ counts as a slope, so zero is the minimum whenever the data’s pull lies inside that range",
                "Its penalty is larger than the squared penalty at every coefficient",
                "It drops the weakest column before the fit begins",
                "Coordinate descent rounds small coefficients down to zero",
              ],
              0,
              "The slope of the squared penalty is 2β, which vanishes at zero, so at zero the only pull is the data’s and the minimum cannot sit there unless the data has no pull at all. A penalty with a corner can overpower a weak data contribution at a finite λ, and a penalty that is smooth at zero never can.",
            ),
            trueFalse(
              "Writing the objective with a half in front of the squared error, or as a mean, would move the one-feature lasso threshold away from λ = 400.",
              true,
              "The half in the subtraction comes from the objective being written as RSS with no factor in front, so the derivative of the squared term carries a 2 that the penalty term does not, and zero is reached once λ/2 exhausts the data term of 200. Change that factor and the threshold moves. The mechanism, a corner that can overpower a weak data contribution at a finite λ, does not.",
            ),
        ],
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
                <>
<p>
                  An ellipse meeting a circle touches it at a point with no special relationship to the axes, so both coefficients come out nonzero. An ellipse meeting a diamond very often touches it at a corner first, because corners stick out, and a corner is a solution with one coefficient at exactly zero. Slide the λ control with lasso selected and watch the green dot ride the diamond&rsquo;s edge until it snaps onto the vertical axis at λ ≈ 3, where the first coefficient is zero from then on.
                </p>
                <p>
                  Lasso produces zeros because the shape of its penalty has corners on the coefficient axes, and ridge does not because a circle has none.
                </p>
</>
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
                <>
<p>
                  What it has instead is the corner. At zero the absolute value admits every slope between −λ and +λ, a subgradient rather than a gradient, and zero is optimal whenever the data&rsquo;s pull on that coefficient lies inside the range. The solver used here is coordinate descent. It sweeps the coefficients one at a time, and for each it holds the others fixed, which reduces the problem to section 13&rsquo;s one-feature case on the current residual, applies the soft threshold, and moves on.
                </p>
                <p>
                  Repeated until nothing moves, that arrives at the lasso solution, one soft threshold at a time.
                </p>
</>
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
        {
          title: "Questions on Parts 6 to 9",
          quiz: [
            choice(
              "Why does lasso produce zeros where ridge does not?",
              [
                "Its penalty is a diamond whose corners lie on the axes, and an expanding ellipse very often touches a corner first",
                "Its penalty is larger, so more coefficients are pushed past zero",
                "An ellipse cannot touch a circle at all",
                "Ridge rounds its smallest coefficients up rather than down",
              ],
              0,
              "A corner is a solution with one coefficient at exactly zero, and corners stick out. An ellipse meeting a circle touches it at a point with no special relationship to the axes, so both coefficients come out nonzero, and a circle has no corners for the contour to meet.",
            ),
            several(
              "Which of these hold for the lasso paths on the nine polynomial terms?",
              [
                "The active count is not monotone, reaching 2 by λ = 3.2 and rising to 3 at λ = 5.6 before falling back to 2",
                "The first term to reach zero is the term whose contribution the others could most cheaply absorb at that λ",
                "With raw polynomial powers lasso can keep t⁵ while dropping t⁴",
                "A model that ends with most coefficients at zero is a list of which features matter",
              ],
              [0, 1, 2],
              "A term that was switched off can come back when a correlated neighbour is shrunk and its share of the work needs picking up. What survives is not a tidy polynomial of some lower degree, and the result is a sparse predictive representation rather than a ranking of importance, since the first term out is the cheapest to absorb on this sample.",
            ),
            trueFalse(
              "The penalty can be chosen by reading the training score.",
              false,
              "Training R² only falls as λ grows, since every penalty is a constraint the free fit did not have, so that side of the chart always prefers λ = 0. The penalty is chosen by performance on data that did not determine the coefficients, and where it matters the choice is confirmed once on data that took no part in choosing it. The same held-out score can choose the degree too. On this split a small penalty lifted degree 2 from 0.989 to 0.996, while λ = 1 was a heavy penalty whatever the degree.",
            ),
            choice(
              "XᵀX on the standardized degree-9 columns has eigenvalues from 0 up to 125.7, a ratio of about 7.6 trillion. What does adding λI at λ = 1 do?",
              [
                "It adds λ to every eigenvalue, so the smallest becomes 1 and the ratio falls to 126.7",
                "It removes the two zero eigenvalues from the matrix",
                "It rescales every eigenvalue by λ",
                "It leaves the ratio alone and shrinks the coefficients separately",
              ],
              0,
              "Two of the eigenvalues are zero to machine precision and the next is one millionth, so solving the plain normal equations means dividing by numbers that are effectively noise, which is where the coefficient of 85,263 came from. Adding λI changes nothing else about the matrix, so the directions the data could not pin down are pinned to zero instead of to noise while the ones it could are barely touched.",
            ),
            trueFalse(
              "A penalty is the right repair for a biased sample or a leak between the training and held-out rows.",
              false,
              "Regularisation helps with excessive variance, correlated features, unstable coefficients and a model more flexible than its data can support. A penalised fit on the wrong columns is a stable fit on the wrong columns, and a missing feature, a shifted distribution or a leak belong to evaluation and to data preparation instead.",
            ),
        ],
        },
        {
          title: "Practice. Restraining the Degree-9 Curve With the Library",
          practice: [
            exercise(
              "Tame the degree-9 curve",
              ["Fit the fifteen noisy readings at degree 9 the way every fit on this page does, power columns from PolynomialFeatures and then every column standardized, and fit RidgeRegression at no penalty and at λ = 1. For each, print the training R squared, the largest coefficient in size, the intercept, and the objective in its two halves, RSS plus λ times the sum of squared coefficients.", "Part 2 quotes 0.997 and a largest coefficient of 85,263 at no penalty, 0.846 and 7.64 at λ = 1, an intercept of 12.76, and an objective at λ = 1 of about 101 plus 79. The page gives the residual cost there only to the nearest whole number."],
              `from oop_ml import Feature, PolynomialFeatures, RidgeRegression, Standardizer

times = Feature("t", [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0])
heights = Feature("h", [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2])

terms = PolynomialFeatures(degree=9).fit([times]).transform([times])
standardized = Standardizer().fit(terms).transform(terms)

for penalty in [0.0, 1.0]:
    # Fit ridge at this penalty on the standardized columns, then print the
    # R squared, the largest coefficient in size, the intercept, and the
    # RSS, the penalty cost and their sum.
    pass`,
              `from oop_ml import Feature, PolynomialFeatures, RidgeRegression, Standardizer

times = Feature("t", [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0])
heights = Feature("h", [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2])

terms = PolynomialFeatures(degree=9).fit([times]).transform([times])
standardized = Standardizer().fit(terms).transform(terms)

for penalty in [0.0, 1.0]:
    model = RidgeRegression(penalty=penalty).fit(standardized, heights)
    evaluation = model.evaluate(standardized, heights)
    largest = max(abs(coefficient.value) for coefficient in model.coefficients)
    squares = sum(coefficient.value ** 2 for coefficient in model.coefficients)
    print(f"penalty {penalty}: R squared {evaluation.r2_score:.3f}, largest coefficient {largest:,.2f}, intercept {model.intercept:.2f}")
    print(f"  RSS {evaluation.residual_sum_of_squares:.2f} + penalty cost {penalty * squares:.2f} = objective {evaluation.residual_sum_of_squares + penalty * squares:.2f}")`,
              `penalty 0.0: R squared 0.997, largest coefficient 85,263.31, intercept 12.76
  RSS 1.68 + penalty cost 0.00 = objective 1.68
penalty 1.0: R squared 0.846, largest coefficient 7.64, intercept 12.76
  RSS 101.04 + penalty cost 79.17 = objective 180.21`,
              { hints: ["PolynomialFeatures and Standardizer are both fitted and then asked to transform, and the standardized columns keep the power columns’ names, t through t^9. RidgeRegression takes them like any other features, and its penalty is a constructor field.", "The coefficients iterate as named pairs with a value each, so the largest in size is a max over abs(coefficient.value) and the penalty’s sum is a sum over coefficient.value squared.", "evaluate answers an object carrying residual_sum_of_squares and r2_score. The penalty cost is λ times the sum of squares, which the fit minimised together with the RSS, and the intercept is uncharged so it stays at 12.76 whatever λ is."], check: numberCheck("What residual sum of squares does the ridge fit at λ = 1 report?", 101.04, 0.01, "The unpenalised fit’s RSS is 1.68, and at λ = 1 the fit accepts an RSS sixty times larger in exchange for coefficients whose squares sum to about 79 rather than to billions, because 101.04 plus 79.17 is the smallest the whole bar can be at that price. The R squared of 0.846 is that trade read as a score, worse on the readings and far steadier between them.") },
            ),
            exercise(
              "Shrink one slope by hand and by library",
              ["Sections 10 and 13 work the one-feature case on the five people, heights centred so the cross-product is 200 and the sum of squares is 250. Fit RidgeRegression and LassoRegression on the centred heights at penalties of 0, 100, 250, 400 and 500, and print each slope beside the formula the page gives for it.", "Ridge should follow 200 / (250 + λ) and lasso should follow max(0, 200 − λ/2) / 250, reaching exactly zero at λ = 400 and staying there. The page says ridge passes 0.31 at that λ and keeps gliding."],
              `from oop_ml import Feature, LassoRegression, RidgeRegression

centred_heights = Feature("height", [-10, -5, 0, 5, 10])
weights = Feature("weight", [58, 66, 68, 74, 74])

for penalty in [0, 100, 250, 400, 500]:
    # Fit ridge and lasso at this penalty, and print each fitted slope
    # beside the page's formula for it.
    pass`,
              `from oop_ml import Feature, LassoRegression, RidgeRegression

centred_heights = Feature("height", [-10, -5, 0, 5, 10])
weights = Feature("weight", [58, 66, 68, 74, 74])

for penalty in [0, 100, 250, 400, 500]:
    ridge = RidgeRegression(penalty=penalty).fit([centred_heights], weights)
    lasso = LassoRegression(penalty=penalty).fit([centred_heights], weights)
    ridge_formula = 200 / (250 + penalty)
    lasso_formula = max(0, 200 - penalty / 2) / 250
    print(f"penalty {penalty}: ridge {ridge.coefficients['height']:.4f} (formula {ridge_formula:.4f}), lasso {lasso.coefficients['height']:.4f} (formula {lasso_formula:.4f})")`,
              `penalty 0: ridge 0.8000 (formula 0.8000), lasso 0.8000 (formula 0.8000)
penalty 100: ridge 0.5714 (formula 0.5714), lasso 0.6000 (formula 0.6000)
penalty 250: ridge 0.4000 (formula 0.4000), lasso 0.3000 (formula 0.3000)
penalty 400: ridge 0.3077 (formula 0.3077), lasso 0.0000 (formula 0.0000)
penalty 500: ridge 0.2667 (formula 0.2667), lasso 0.0000 (formula 0.0000)`,
              { hints: ["Both models take the same list of one feature and the same target, and both read their slope by name, coefficients['height']. Neither charges the intercept, which stays at the mean weight of 68.", "The five heights are 160, 165, 170, 175 and 180, so centring on 170 gives −10 to 10, and the sums the page quotes follow: squares of 100, 25, 0, 25, 100 add to 250, and the cross-products with the centred weights add to 200.", "Lasso at exactly zero prints 0.0000 and not a small number. The corner holds the minimum once λ/2 reaches 200, so from 400 on the slope is exactly zero rather than merely tiny."], check: numberCheck("What slope does ridge report at λ = 400, to four places?", 0.3077, 0.0005, "Ridge adds the penalty to the sum of squares underneath, so at 400 the slope is 200 over 650, and it never reaches zero at any finite λ because dividing by a larger number only ever makes the ratio smaller. Lasso subtracts half the penalty from the 200 on top instead, and at 400 there is nothing left to subtract from, which is the exact zero the two paths part on.") },
            ),
            exercise(
              "Find where the held-out score turns",
              ["Section 18 traces two scores across the penalty. Reproduce the ridge half on the page’s split, which keeps back the readings at t = 0, 0.29, 2.86 and 3.43 and fits on the other eleven, with the power columns and the standardization both learned from the eleven alone. Fit at penalties of 0, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1 and 10 and print both scores each time.", "The training score should only fall as λ grows. The held-out score should climb from ruin at no penalty to 0.993 near λ = 0.0001 and then fall, reaching −0.317 at λ = 1 and −1.405 at 10, which are the degree-9 row of section 20’s table. The page does not say what it reads at 0.001."],
              `from oop_ml import Feature, PolynomialFeatures, RidgeRegression, Standardizer

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
hidden = [0, 1, 10, 12]

training_times = Feature("t", [time for position, time in enumerate(times) if position not in hidden])
training_heights = Feature("h", [height for position, height in enumerate(heights) if position not in hidden])
hidden_times = Feature("t", [times[position] for position in hidden])
hidden_heights = Feature("h", [heights[position] for position in hidden])

powers = PolynomialFeatures(degree=9).fit([training_times])
scaler = Standardizer().fit(powers.transform([training_times]))
training_terms = scaler.transform(powers.transform([training_times]))
hidden_terms = scaler.transform(powers.transform([hidden_times]))

for penalty in [0.0, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1.0, 10.0]:
    # Fit ridge at this penalty on the training share, then print its
    # R squared on the training share and on the hidden share.
    pass`,
              `from oop_ml import Feature, PolynomialFeatures, RidgeRegression, Standardizer

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
hidden = [0, 1, 10, 12]

training_times = Feature("t", [time for position, time in enumerate(times) if position not in hidden])
training_heights = Feature("h", [height for position, height in enumerate(heights) if position not in hidden])
hidden_times = Feature("t", [times[position] for position in hidden])
hidden_heights = Feature("h", [heights[position] for position in hidden])

powers = PolynomialFeatures(degree=9).fit([training_times])
scaler = Standardizer().fit(powers.transform([training_times]))
training_terms = scaler.transform(powers.transform([training_times]))
hidden_terms = scaler.transform(powers.transform([hidden_times]))

for penalty in [0.0, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1.0, 10.0]:
    model = RidgeRegression(penalty=penalty).fit(training_terms, training_heights)
    print(f"penalty {penalty:g}: training R squared {model.score(training_terms, training_heights):.3f}, held-out R squared {model.score(hidden_terms, hidden_heights):.3f}")`,
              `penalty 0: training R squared 0.999, held-out R squared -5710.273
penalty 1e-05: training R squared 0.996, held-out R squared 0.984
penalty 0.0001: training R squared 0.996, held-out R squared 0.993
penalty 0.001: training R squared 0.996, held-out R squared 0.992
penalty 0.01: training R squared 0.993, held-out R squared 0.936
penalty 0.1: training R squared 0.975, held-out R squared 0.638
penalty 1: training R squared 0.876, held-out R squared -0.317
penalty 10: training R squared 0.731, held-out R squared -1.405`,
              { hints: ["The means and standard deviations have to be learned from the training rows only and applied unchanged to the hidden rows, which is why the Standardizer is fitted once on the training terms and then transforms both shares.", "score takes features and a target and answers R squared, so one call on each share gives the two curves of section 18.", "The ruin at no penalty is the polynomial page’s collapse seen again on standardized columns, and a held-out score below zero means the curve is worse on those four readings than a flat guess at their mean."], check: numberCheck("What held-out R squared does ridge reach at λ = 0.001?", 0.992, 0.001, "The turn is near λ = 0.0001, where the held-out score reads 0.993, and at 0.001 it has barely begun to fall. At 0.01 it is 0.936 and by λ = 1 it is below zero, because too much restraint stops the curve from following the arc at all. The training score falls the whole way, from 0.999 to 0.731, which is why nothing on that side of the chart can choose the penalty.") },
            ),
            exercise(
              "Move one reading and refit",
              ["Section 3 fits the same degree-9 model on the noisy throw and on the same readings with one of them moved a metre and a half. Sample B is sample A with the reading at t = 2.0 lifted from 21.0 to 22.5. Fit both samples at no penalty and at λ = 1, and print the training R squared and the largest coefficient in size each time.", "The table in section 3 reads 0.997 and 85,263 for sample A and 0.993 and 76,525 for sample B at no penalty, and 7.64 against 7.80 at λ = 1. It does not give sample B’s training score at λ = 1."],
              `from oop_ml import Feature, PolynomialFeatures, RidgeRegression, Standardizer

times = Feature("t", [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0])
sample_a = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
sample_b = sample_a[:7] + [22.5] + sample_a[8:]

terms = PolynomialFeatures(degree=9).fit([times]).transform([times])
standardized = Standardizer().fit(terms).transform(terms)

# For each sample and each penalty, 0 and 1, fit ridge on the standardized
# columns and print the training R squared and the largest coefficient.`,
              `from oop_ml import Feature, PolynomialFeatures, RidgeRegression, Standardizer

times = Feature("t", [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0])
sample_a = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
sample_b = sample_a[:7] + [22.5] + sample_a[8:]

terms = PolynomialFeatures(degree=9).fit([times]).transform([times])
standardized = Standardizer().fit(terms).transform(terms)

for label, readings in [("A, the noisy throw", sample_a), ("B, one reading moved", sample_b)]:
    heights = Feature("h", readings)
    for penalty in [0.0, 1.0]:
        model = RidgeRegression(penalty=penalty).fit(standardized, heights)
        largest = max(abs(coefficient.value) for coefficient in model.coefficients)
        print(f"sample {label}, penalty {penalty}: training R squared {model.score(standardized, heights):.3f}, largest coefficient {largest:,.2f}")`,
              `sample A, the noisy throw, penalty 0.0: training R squared 0.997, largest coefficient 85,263.31
sample A, the noisy throw, penalty 1.0: training R squared 0.846, largest coefficient 7.64
sample B, one reading moved, penalty 0.0: training R squared 0.993, largest coefficient 76,524.72
sample B, one reading moved, penalty 1.0: training R squared 0.840, largest coefficient 7.80`,
              { hints: ["The times are the same in both samples, so the power columns and their standardization are built once and only the target changes between the two fits.", "A target is a Feature like any other, so sample B is Feature('h', sample_b), and the two fits read the same way as the first problem’s.", "The largest coefficient is a max over abs(coefficient.value). Printing it with a thousands separator, the format :,.2f, makes 85,263.31 readable beside the page’s 85,263."], check: numberCheck("What training R squared does sample B score at λ = 1?", 0.84, 0.001, "The penalty costs sample B a little more training fit than it costs sample A, 0.840 against 0.846, and in exchange its largest coefficient comes down from 76,525 to 7.80, within two percent of sample A’s 7.64. Two fits that agreed on nothing at no penalty agree closely at λ = 1, which is the stability the page is buying.") },
            ),
          ],
        },
      ]}
    />
  );
}
