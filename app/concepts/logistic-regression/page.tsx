import { pageMetadata } from "@/lib/seo";
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
import { BalanceChart } from "@/components/widgets/BalanceChart";
import { CoefficientExplorer } from "@/components/widgets/CoefficientExplorer";
import { LinearProbabilityFailure } from "@/components/widgets/LinearProbabilityFailure";
import { LogLossExplorer } from "@/components/widgets/LogLossExplorer";
import { LogisticPlayground } from "@/components/widgets/LogisticPlayground";
import {
  LogisticWalkPlayground,
  SEPARATED_STUDENTS,
} from "@/components/widgets/LogisticWalkPlayground";
import { OddsScales } from "@/components/widgets/OddsScales";
import { SigmoidExplorer } from "@/components/widgets/SigmoidExplorer";
import { ThresholdExplorer } from "@/components/widgets/ThresholdExplorer";

export const metadata: Metadata = pageMetadata("/concepts/logistic-regression", {
  title: "Logistic Regression · Perceptron Lab",
  description:
    "Logistic regression estimates the probability of a category from a set of measurements. A decision threshold turns that probability into a yes-or-no prediction, with different thresholds producing different kinds of mistake.",
});

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function LogisticRegressionPage() {
  return (
    <ConceptPage
      lessonId="logistic-regression"
      intuition={lessonIntuitions["logistic-regression"]}
      technicalStart="Part 2. Score, Probability, and Decision"
      openingTitle="A Prediction Between Yes and No"
      playgroundTitle="Estimate the chance of passing from study hours"
      playgroundIntro="Each point records one student's study hours and exam outcome. Click near the bottom to add a failure or near the top to add a pass. Drag a point sideways to change its study hours, then watch how the fitted probability curve changes. We will explain how that curve becomes a yes-or-no decision below."
      title="Logistic Regression"
      tagline={"Logistic regression estimates the probability of a category from a set of measurements. A decision threshold turns that probability into a yes-or-no prediction, with different thresholds producing different kinds of mistake."}
      prerequisites={
        <>
          This page assumes{" "}
          <Link href="/concepts/simple-linear-regression" className={linkClass}>
            simple linear regression
          </Link>{" "}
          and the{" "}
          <Link href="/concepts/gradient-descent-regression" className={linkClass}>
            gradient descent
          </Link>{" "}
          explanation. Here we use the same update idea with a loss for binary outcomes. The{" "}
          <Link href="/primers/statistics" className={linkClass}>
            statistics primer
          </Link>
          &rsquo;s probability half is where odds come from.
        </>
      }

      playground={<LogisticPlayground />}
      sections={[
        {
          title: "Part 1. From Numeric Outcomes to Categories",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A binary prediction problem">
                <p>
                  Each dot above is one student. We know how many hours they studied and whether they passed. We place failures at zero and passes at one, so the plot has two rows of outcomes.
                </p>
                <Equation>{"y = 1 for passed        y = 0 for failed"}</Equation>
                <p>
                  Zero and one encode the two outcomes. The probability we want to predict can lie between them. In our twelve students, everyone below three and a half hours failed, and everyone above five and a half passed. Between those limits the results overlap. For someone who studied four and a half hours, we would like an estimate of the chance of passing.
                </p>
              </SubSection>

              <SubSection title="2. Why a straight-line prediction is not a probability">
                <p>Encoding the outcomes as zero and one lets us try a straight-line prediction first. The arithmetic can fit those numbers, but the resulting rule is not constrained to return a valid probability.</p>
                <LinearProbabilityFailure />
                <p>
                  The line predicts −0.09 after one hour of study and 1.18 after eight hours. Neither is a valid probability. The red portions of the graph show where it leaves the interval from zero to one. We need a rule whose outputs stay in that interval across its input domain, including inputs absent from training.
                </p>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Score, Probability, and Decision",
          content: (
            <>
              <SubSection title="3. Score, probability, and decision">
                <p>Start by combining the measurements into one numerical score. Then convert that score into a value between zero and one. A separate threshold decides when the probability estimate is large enough to predict a pass. Each step has a different purpose.</p>
                <NumberTable
                  headings={["Quantity", "What it is", "Range"]}
                  rows={[
                    ["score z", "the model's unrestricted numerical evidence for passing", "any number"],
                    ["probability p", "the estimated chance of passing", "between 0 and 1"],
                    ["predicted class ŷ", "a pass or a fail, decided by comparing p to a threshold", "0 or 1"],
                  ]}
                />
                <p>
                  The straight-line rule produces the score. A second rule
                  converts it into an estimated probability. Finally, we compare
                  that estimate with a cutoff, called a threshold, to choose pass
                  or fail. Moving the cutoff changes the decision while leaving
                  the probability estimate alone.
                </p>
              </SubSection>

              <SubSection title="4. The linear score">
                <p>Multiply the study hours by a coefficient and add an intercept.
                  The coefficient controls the change in score for another hour;
                  the intercept is the score at zero study hours. Here x stands
                  for hours, β for the coefficient, and α for the intercept.</p>
                <Equation>{"z = β·x + α"}</Equation>
                <>
                  <p>

                    The score can be any real number. Positive scores favor passing,
                    negative scores favor failing, and zero is neutral. The score
                    itself is not a probability. The fitted slope is about 1.69 and the
                    intercept about −7.18.
                  </p>
                  <Equation>{"score after four study hours = 1.69 × 4 − 7.18 = −0.42\nscore after five study hours = 1.69 × 5 − 7.18 = 1.27"}</Equation>
                  <p>
                    These calculations use rounded coefficients. The full fitted values
                    give approximately −0.40 and 1.29. The sigmoid will turn each score
                    into a probability.
                  </p>
                </>
              </SubSection>

              <SubSection title="5. Converting scores with the sigmoid">
                <p>We want a smooth conversion that assigns probabilities near zero to large negative scores and probabilities near one to large positive scores. A score of zero should correspond to one half under this convention. The sigmoid supplies that conversion.</p>
                <Equation>{"p = σ(z) = 1 / (1 + e⁻ᶻ)"}</Equation>
                <WorkedExample>
                  <NumberTable
                    headings={["z", "e⁻ᶻ", "p = 1 / (1 + e⁻ᶻ)"]}
                    rows={[
                      ["−4", "54.6", "0.018"],
                      ["−2", "7.39", "0.119"],
                      ["0", "1", "0.500"],
                      ["2", "0.135", "0.881"],
                      ["4", "0.018", "0.982"],
                    ]}
                  />
                </WorkedExample>
                <SigmoidExplorer />
                <p>In exact arithmetic, a finite score produces a sigmoid value strictly between zero and one. Very large positive or negative scores approach the endpoints. A computer can round an extreme result to an endpoint because its numerical precision is finite.</p>
              </SubSection>

              <SubSection title="6. Why probability changes unevenly">
                <p>
                  The amber steps on the sigmoid above are three moves of
                  exactly one unit along the score axis, at −4, at 0 and at
                  4. Read what each does to the probability.
                </p>
                <NumberTable
                  headings={["from z", "to z", "from p", "to p", "change in p"]}
                  rows={[
                    ["−4", "−3", "0.018", "0.047", "+0.029"],
                    ["0", "1", "0.500", "0.731", "+0.231"],
                    ["4", "5", "0.982", "0.993", "+0.011"],
                  ]}
                />
                <p>A one-unit score change produces a small probability change near either endpoint and a larger change near one half. A prediction already near 98% has little remaining room to increase. The linear score therefore produces an uneven rate of change after the sigmoid conversion.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Odds and Log-Odds",
          content: (
            <>
              <SubSection title="7. Probability and odds">
                <p>
                  If the estimated probability of passing is 0.75, the remaining
                  probability is 0.25 for failing. The first is three times the
                  second. We describe that comparison as odds of three to one.
                  It does not promise exactly three passes in each group of four
                  students; individual groups can turn out differently.
                </p>
                <Equation>{"odds = p / (1 − p)"}</Equation>
                <NumberTable
                  headings={["probability", "odds", "said aloud"]}
                  rows={[
                    ["0.50", "1", "one to one"],
                    ["0.75", "3", "three to one"],
                    ["0.80", "4", "four to one"],
                    ["0.20", "0.25", "one to four"],
                  ]}
                />
                <p>
                  Probability compares the passes with everyone. Odds compare
                  the passes with the fails. They carry the same uncertainty
                  in a different comparison, and the tokens in the widget
                  below are the two comparisons side by side.
                </p>
              </SubSection>

              <SubSection title="8. Log-odds">
                <p>For probabilities strictly between zero and one, odds are positive and can become arbitrarily small or large. Taking their logarithm gives a scale covering all real numbers, matching the unrestricted linear score.</p>
                <Equation>{"log-odds = ln( p / (1 − p) )"}</Equation>
                <p>

                  A probability below one half has odds below one and negative
                  log-odds. A probability of exactly one half has odds of one
                  and log-odds of zero. A probability above one half has odds
                  above one and positive log-odds. Three scales, one center.
                </p>
                <OddsScales />
              </SubSection>

              <SubSection title="9. What logistic regression makes linear">
                <p>
                  Now the defining relationship, which section 4&rsquo;s score
                  and section 8&rsquo;s log-odds turn out to be the same
                  number.
                </p>
                <Equation>{"ln( p / (1 − p) ) = β·x + α"}</Equation>
                <p>
                  Logistic regression models the log-odds with a straight
                  line. The sigmoid is that relationship solved for p, so the
                  two forms are one statement read in two directions.
                </p>
                <Equation>{"p = σ(β·x + α)"}</Equation>
                <p>The coefficient interpretation follows from this scale: an input change adds to the log-odds. Its effect on odds is multiplicative, and its effect on probability depends on the starting probability.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Reading the Fitted Model",
          content: (
            <>
              <SubSection title="10. Reading the intercept">
                <p>At zero hours the score is α on its own.</p>
                <Equation>{"z(0) = α          p(0) = σ(α) = σ(−7.18) = 0.0008"}</Equation>
                <>
<p>
                  The intercept is the log-odds when the input is zero, and the sigmoid of it is the probability there. For these students that is a chance of passing of eight in ten thousand with no study at all, which is the fitted model&rsquo;s baseline. Its practical meaning is only as good as zero is as an input.
                </p>
                <p>

                  Nobody here studied zero hours, so the number is the line&rsquo;s position more than a claim about anyone, exactly as the regression page&rsquo;s intercept of −68 kg was. Centering the hours would make the intercept the log-odds at the average study time instead.
                </p>
</>
              </SubSection>

              <SubSection title="11. Reading the coefficient">
                <p>
                  For every additional hour the score rises by β, which is to
                  say the log-odds rise by β, which is to say the odds are
                  multiplied by e^β.
                </p>
                <Equation>{"β = 1.69          e^β = 5.44"}</Equation>
                <p>
                  Under the fitted model each additional hour multiplies the
                  odds of passing by about 5.4. The widget below picks a
                  starting time and follows one more hour through all three
                  scales.
                </p>
                <CoefficientExplorer />
                <WorkedExample title="One more hour, from two starting points">
                  <NumberTable
                    headings={["", "3 h → 4 h", "5 h → 6 h"]}
                    rows={[
                      ["log-odds", "−2.10 → −0.40, +1.69", "1.29 → 2.99, +1.69"],
                      ["odds", "0.123 → 0.670, × 5.44", "3.65 → 19.8, × 5.44"],
                      ["probability", "0.110 → 0.401, +0.29", "0.785 → 0.952, +0.17"],
                    ]}
                    caption="The log-odds change and the odds multiplier are the same from both starting points. The probability change is not."
                  />
                </WorkedExample>
                <KeepInMind>
                  <p>A nonzero logistic coefficient gives a constant change in log-odds, while the probability change varies across the curve. Under this fitted model, one additional study hour is associated with an odds multiplier of about 5.4. That is a description of the fitted relationship, not evidence that requiring another hour of study would cause those odds to increase by that factor.</p>
                </KeepInMind>
                <p>When β is nonzero, changing α shifts the probability transition along the hours axis and moves its crossing of one half. Changing β alters the transition’s steepness and direction: a positive β rises with x and a negative β falls. With β equal to zero, the prediction is constant at σ(α), so changing α changes the height of that flat prediction.</p>
                <WhyThisWorks title="How steep the curve is">
                  <>
                    <p>
                      The probability changes fastest where it is one half. Its slope
                      with respect to study hours combines the fitted score slope with
                      the sigmoid’s derivative.
                    </p>
                    <Equation>{"dp/dx = βp(1 − p)\nat p = 0.5: dp/dx = β × 0.5 × 0.5 = β/4\nwith β ≈ 1.69: dp/dx ≈ 1.69 / 4 ≈ 0.42 per hour"}</Equation>
                    <p>
                      The curve changes more slowly toward either end. Section 24
                      derives the sigmoid’s derivative.
                    </p>
                  </>
                </WhyThisWorks>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on the Score, the Odds and the Fit",
          quiz: [
            trueFalse(
              "The score the straight line produces is itself a probability.",
              false,
              "The linear score can take any real value. Sigmoid converts it to a probability, and a separate cutoff converts that probability to a pass-or-fail decision. Keeping those quantities separate prevents a cutoff intended for probabilities from being applied to the raw score.",
            ),
            choice(
              "Three moves of exactly one unit along the score axis, at −4, at 0 and at 4. Which buys the largest change in probability?",
              [
                "The move at 0, where the probability is one half",
                "The move at −4, where the probability has the most room to grow",
                "The move at 4, where the model is most confident",
                "All three equally, since the model is linear in its score",
              ],
              0,
              "The score changes linearly with study hours, but probability follows the sigmoid. It changes fastest near a score of zero and becomes less sensitive toward either end. The sigmoid’s maximum slope with respect to score is 0.25; the fitted hours coefficient then determines the rate of change per hour.",
            ),
            choice(
              "A student is given a probability of exactly one half. What are the odds and the log-odds?",
              [
                "Odds of one, and log-odds of zero",
                "Odds of zero, and log-odds of one",
                "Odds of one half, and log-odds of one half",
                "Odds of one, and log-odds of one",
              ],
              0,
              "Odds compare the passes with the fails rather than with everyone, so an even chance is one to one. The logarithm of one is zero, which is why a score of zero is the neutral point of the fitted line.",
            ),
            choice(
              "The fitted slope is about 1.69. What does one more study hour do under this model?",
              [
                "Multiplies the odds of passing by about 5.44",
                "Adds about 1.69 to the probability of passing",
                "Multiplies the probability of passing by about 1.69",
                "Adds about 5.44 to the odds of passing",
              ],
              0,
              "One extra hour adds the fitted coefficient to log-odds. Exponentiating converts that addition into a constant odds multiplier. Using the fitted coefficient gives approximately 5.44. Probability does not have the same constant multiplier: its change depends on the starting probability and stays bounded by one.",
            ),
            trueFalse(
              "The sigmoid of the intercept, 0.0008, is the fitted chance of passing with no study at all, and nobody among the twelve studied zero hours, so it is the line’s position rather than a claim about anyone.",
              true,
              "The intercept is the model’s log-odds at zero study hours, but zero lies outside these students’ observed range. Its sigmoid is therefore an extrapolated model output, not a measured pass frequency for a zero-hour group. Centering hours would instead make the intercept describe the reference study time.",
            ),
        ],
        },
        {
          title: "Part 5. From Probability to a Classification",
          content: (
            <>
              <SubSection title="12. Choosing a classification threshold">
                <p>
                  The model can report a probability and stop there, and often
                  that is the right thing to report. When a yes or a no is
                  needed, a threshold t supplies it.
                </p>
                <Equation>{"ŷ = 1 when p ≥ t          ŷ = 0 when p < t"}</Equation>
                <p>
                  At t = 0.5 the score threshold is zero, and the boundary on
                  the hours axis is where the line crosses zero. For any other
                  threshold the boundary is where the log-odds reach the
                  threshold&rsquo;s own log-odds.
                </p>
                <Equation>{"boundary x = ( logit(t) − α ) / β          logit(t) = ln( t / (1 − t) )\n\nat t = 0.5:  logit(0.5) = 0, so x = −α / β = 7.18 / 1.69 = 4.24 hours"}</Equation>
                <p>
                  The model estimates a probability. A separate threshold
                  converts that probability into a class, and 0.5 is the
                  conventional choice rather than a mandatory one.
                </p>
              </SubSection>

              <SubSection title="13. Moving the decision boundary">
                <p>
                  Slide the threshold below. The curve does not move, and
                  nothing is refitted. What moves is the horizontal line, the
                  boundary on the hours axis, and which students land on which
                  side of it.
                </p>
                <ThresholdExplorer />
                <p>
                  At 0.5 the model gets ten of twelve right, missing the
                  student who failed after five hours and the one who passed
                  after four. Lower the threshold to 0.3 and the boundary
                  moves to 3.74 hours, the four-hour pass is caught, and
                  accuracy rises to 0.917 with nothing about the curve
                  changed. Raise it to 0.8 and the boundary moves to 5.06
                  hours, the five-hour fail is caught instead, and two passes
                  are missed. Changing the decision threshold changes the
                  classifications without changing the fitted model.
                </p>
              </SubSection>

              <SubSection title="14. Different errors and different thresholds">
                <p>
                  Whether 0.3 or 0.8 is better than 0.5 is not a question the
                  model can answer, because it depends on what the two kinds
                  of mistake cost. Suppose the point of the prediction is to
                  offer help to students at risk of failing. Missing a student
                  who needed help is expensive. Offering help to one who did
                  not is cheap. Then the threshold for calling someone a pass
                  should be high, so that more borderline students are flagged
                  as possible fails, at the price of more false alarms.
                </p>
                <p>
                  A useful threshold depends on the consequences of the
                  different mistakes, and choosing it properly belongs to the{" "}
                  <Link href="/concepts/judging-a-classifier" className={linkClass}>
                    judging-a-classifier page
                  </Link>
                  . What this page needs is the fact that the threshold is a
                  policy decision sitting on top of the probabilities, and not
                  part of the model.
                </p>
              </SubSection>

              <SubSection title="15. Accuracy and the confusion matrix">
                <p>
                  The four cells under the threshold widget separate the four
                  things that can happen to a student.
                </p>
                <NumberTable
                  headings={["", "predicted pass", "predicted fail"]}
                  rows={[
                    ["actually passed", "true positive", "false negative"],
                    ["actually failed", "false positive", "true negative"],
                  ]}
                />
                <Equation>{"accuracy = correct predictions / all predictions"}</Equation>
                <p>
                  Click a cell and the students it counts light up. Two things
                  about accuracy are easy to miss. It evaluates thresholded
                  decisions and says nothing about the probabilities that
                  produced them. And it compresses four kinds of outcome into
                  one number, so a model that misses every rare case can
                  still score well. The section 13 numbers make the first
                  point. Accuracy went from 0.833 to 0.917 while the log loss
                  stayed at 0.2933, because the probabilities never changed.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Scoring Probability Predictions",
          content: (
            <>
              <SubSection title="16. Scoring probability predictions">
                <p>Two probability estimates can produce the same category after thresholding. Log loss can still distinguish how much probability each assigned to the outcome that occurred. This is why evaluating probability estimates requires more information than counting correct categories.</p>
                <p>To fit these probabilities, we need an objective that distinguishes estimates even when they lead to the same thresholded decision. The following likelihood calculation gives us one such objective.</p>
              </SubSection>

              <SubSection title="17. Likelihood">
                <p>
                  For one student, ask how much probability the model gave to
                  the outcome that occurred. If they passed that is p, and if
                  they failed it is 1 − p.
                </p>
                <Equation>{"P(yᵢ | pᵢ) = pᵢ        when yᵢ = 1\nP(yᵢ | pᵢ) = 1 − pᵢ    when yᵢ = 0\n\nP(yᵢ | pᵢ) = pᵢ^yᵢ (1 − pᵢ)^(1 − yᵢ)     both cases in one line"}</Equation>
                <p>When yᵢ is 1, the factor involving 1 − pᵢ has exponent zero and equals one; when yᵢ is 0, the factor involving pᵢ equals one instead. Under the model’s assumption that student outcomes are independent given their inputs and the parameters, multiplying these contributions gives the likelihood of the observed outcomes.</p>
                <Equation>{"L = ∏ pᵢ^yᵢ (1 − pᵢ)^(1 − yᵢ)"}</Equation>
                <p>For the fitted curve on these twelve students, the product is 0.0296. Multiplying the probabilities of several uncertain outcomes can give a small number. We compare candidate logistic curves on the same observations, aiming to choose coefficients that maximize this likelihood within the model’s linear-log-odds family.</p>
              </SubSection>

              <SubSection title="18. Log-likelihood and log loss">
                <p>
                  Products are awkward to differentiate and quickly become
                  numbers too small to store, so take the logarithm. Products
                  become sums, and the sums are easy.
                </p>
                <Equation>{"ℓ = Σ [ yᵢ ln(pᵢ) + (1 − yᵢ) ln(1 − pᵢ) ]"}</Equation>
                <p>
                  Turn it negative and average it, and it becomes a loss to
                  be made small, called the binary log loss.
                </p>
                <Equation>{"log loss = −ℓ / n"}</Equation>
                <NumberTable
                  headings={["objective", "on the fitted curve", "better is"]}
                  rows={[
                    ["likelihood L", "0.0296", "higher"],
                    ["log-likelihood ℓ", "−3.520", "higher"],
                    ["log loss −ℓ / n", "0.2933", "lower"],
                  ]}
                  caption="Three readouts of one preference. Whatever curve maximizes the first maximizes the second and minimizes the third, so the fit is the same whichever is used, and implementations generally minimize the third."
                />
              </SubSection>

              <SubSection title="19. Confidence and log loss">
                <p>
                  Per student the loss is −ln(p) for a pass and −ln(1 − p) for
                  a fail, and the two curves say what confidence costs.
                </p>
                <LogLossExplorer />
                <NumberTable
                  headings={["observed", "predicted p", "cost"]}
                  rows={[
                    ["pass", "0.9", "0.105, small"],
                    ["pass", "0.6", "0.511, moderate"],
                    ["pass", "0.1", "2.303, large"],
                    ["fail", "0.9", "2.303, large"],
                    ["fail", "0.1", "0.105, small"],
                  ]}
                />
                <p>

                  The cost climbs without limit as the curve grows confident
                  in the wrong outcome. In the fitted table the two biggest
                  costs are the two students in the mixed middle, 1.536 for
                  the five-hour fail the curve put at 0.785, and 0.914 for the
                  four-hour pass it put at 0.401. Log loss strongly penalizes
                  a confident prediction that assigned little probability to
                  what actually happened.
                </p>
              </SubSection>

              <SubSection title="20. Same accuracy, different probability quality">
                <p>The comparison curve uses half the fitted slope and half the fitted intercept. It still crosses one half at 4.24 hours, so all twelve thresholded decisions remain unchanged and accuracy stays at 0.833. Its log loss is 0.3425 rather than 0.2933. Reducing confidence helps on the wrongly classified students but hurts on the others; the combined loss is higher.</p>
                <p>Maximum-likelihood fitting chooses coefficients according to the assigned probabilities. It does not directly minimize the number of thresholded mistakes. These students illustrate the distinction: section 13 improves the default classification accuracy by changing the threshold while keeping every fitted probability unchanged.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Fitting the Model",
          content: (
            <>
              <SubSection title="21. Fitting on the loss surface">
                <p>Each pair of coefficients, α and β, gives a score and probability for every student, followed by one mean log loss. Plot that loss over the two coefficients to obtain the surface below. The recorded path shows how successive coefficient updates change the loss and the probability curve.</p>
                <LogisticWalkPlayground panels={["surface", "curve"]} maxEpochs={300} />
                <>
                  <p>
                    The walk starts with both coefficients at zero. That assigns a
                    probability of one half to every student, regardless of study hours.
                  </p>
                  <Equation>{"initial log loss = −ln(0.5) = ln 2 ≈ 0.693"}</Equation>
                  <p>The reference fit is near intercept −7.18 and slope 1.69, with loss 0.293. At learning rate 0.5, the first update overshoots and raises loss to 0.743. The displayed path records only 300 passes, while approaching the reference fit can take a few thousand. A stopped path need not have reached the minimum.</p>
                </>
              </SubSection>

              <SubSection title="22. One optimization pass">
                <p>
                  A pass here has the same shape as on the walking page with
                  one extra stage, the squash. Begin with the current α and β.
                  Compute each score zᵢ. Convert each to pᵢ. Compute each
                  student&rsquo;s loss and average. Compute the gradient.
                  Update both coefficients. Draw the new curve.
                </p>
                <p>Move the pass control from the start and compare the curve with the loss trace. At this learning rate, an early update can raise the loss. Later updates use the new probabilities to recalculate the gradient. Inspect those changes rather than assuming every pass improves the objective or makes the curve steeper.</p>
              </SubSection>

              <SubSection title="23. The gradient balance">
                <p>
                  The gradient of the log-likelihood has a form worth
                  remembering, because it looks like something already seen.
                </p>
                <Equation>{"∂ℓ/∂α = Σ (yᵢ − pᵢ)\n∂ℓ/∂β = Σ (yᵢ − pᵢ)·xᵢ"}</Equation>
                <p>

                  The term yᵢ − pᵢ is the gap between what happened and what
                  the curve expected, a residual on a probability scale. At a
                  finite, unpenalized optimum both sums are zero.
                </p>
                <Equation>{"Σ (yᵢ − pᵢ) = 0          Σ (yᵢ − pᵢ)·xᵢ = 0"}</Equation>
                <p>The first condition makes the total predicted probability equal the observed number of passes on the fitted data. The second balances the gaps after weighting by study hours. These are global fitting conditions. They do not establish correct probabilities separately for low-hour and high-hour students, or calibration on new students.</p>
                <BalanceChart />
                <LogisticWalkPlayground panels={["gaps", "traces"]} maxEpochs={300} />
                <p>
                  Scrub the passes and the two totals under the bars, which
                  are the two gradient components, shrink toward zero as the
                  climb settles. The regression page&rsquo;s residuals summed
                  to zero for the same reason, and the gap here is the
                  residual with a probability standing where the prediction
                  stood.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Deriving the Gradient",
          content: (
            <>
              <SubSection title="24. Deriving the sigmoid gradient">
                <p>First differentiate the sigmoid. We can express its derivative using the sigmoid value itself, which will simplify the parameter-gradient calculation.</p>
                <WhyThisWorks title="σ′(z) = σ(z)(1 − σ(z))">
                  <DerivationTable
                    rows={[
                      { expression: "σ(z) = (1 + e⁻ᶻ)⁻¹", reason: "the sigmoid as a power" },
                      { expression: "σ′(z) = −(1 + e⁻ᶻ)⁻² · (−e⁻ᶻ)", reason: "chain rule through the power and the exponential" },
                      { expression: "σ′(z) = e⁻ᶻ / (1 + e⁻ᶻ)²", reason: "tidied" },
                      { expression: "σ′(z) = [1 / (1 + e⁻ᶻ)] · [e⁻ᶻ / (1 + e⁻ᶻ)]", reason: "split into two factors" },
                      { expression: "σ′(z) = σ(z) · (1 − σ(z))", reason: "the second factor is 1 − σ(z), since 1 − 1/(1 + e⁻ᶻ) = e⁻ᶻ/(1 + e⁻ᶻ)" },
                    ]}
                  />
                </WhyThisWorks>
                <SigmoidExplorer showDerivative />
                <p>
                  The sigmoid changes fastest when its output is one half.
                  Substitute that output into the derivative to see the maximum slope.
                </p>
                <Equation>{"Maximum sigmoid slope = 0.5 × (1 − 0.5) = 0.25"}</Equation>
                <p>The slope approaches zero as the output approaches either
                  extreme. This explains why a saturated sigmoid responds so
                  little to a small change in its input score.</p>
              </SubSection>

              <SubSection title="25. Deriving the parameter gradients">
                <p>
                  Take one student and follow β through the chain to their
                  contribution to the log-likelihood.
                </p>
                <Equation>{"ℓᵢ = yᵢ ln(pᵢ) + (1 − yᵢ) ln(1 − pᵢ)\nβ → zᵢ → pᵢ → ℓᵢ"}</Equation>
                <WhyThisWorks title="The chain rule, one student at a time">
                  <DerivationTable
                    rows={[
                      { expression: "∂ℓᵢ/∂pᵢ = yᵢ/pᵢ − (1 − yᵢ)/(1 − pᵢ)", reason: "differentiate the two logarithms" },
                      { expression: "∂pᵢ/∂zᵢ = pᵢ(1 − pᵢ)", reason: "section 24" },
                      { expression: "∂zᵢ/∂β = xᵢ", reason: "the score is linear in β" },
                      { expression: "∂ℓᵢ/∂β = [yᵢ(1 − pᵢ) − (1 − yᵢ)pᵢ] · xᵢ", reason: "multiply the three and clear the denominators" },
                      { expression: "∂ℓᵢ/∂β = (yᵢ − pᵢ)·xᵢ", reason: "expand the bracket, and everything cancels but the gap" },
                      { expression: "∂ℓᵢ/∂α = yᵢ − pᵢ", reason: "the same chain with ∂zᵢ/∂α = 1" },
                    ]}
                  />
                </WhyThisWorks>
                <p>
                  The messy fractions from the logarithms and the p(1 − p)
                  from the sigmoid cancel each other exactly, and what
                  survives is the gap times the input. Only now sum over the
                  students, and the compact gradient of section 23 is the
                  total of these per-student pieces.
                </p>
              </SubSection>

              <SubSection title="26. Why numerical optimization is required">
                <p>
                  Set the two gradients to zero and compare with the
                  regression page. There, the prediction was βxᵢ + α, the
                  conditions were linear in β and α, and algebra solved them.
                  Here pᵢ = σ(βxᵢ + α) wraps the coefficients inside an
                  exponential, and the conditions
                </p>
                <Equation>{"Σ (yᵢ − σ(βxᵢ + α)) = 0          Σ (yᵢ − σ(βxᵢ + α))·xᵢ = 0"}</Equation>
                <p>
                  cannot in general be rearranged into a formula for β and α.
                  The equations exist, and they are the right ones. They do
                  not have a closed-form solution, and that is why the model
                  is fitted by walking. The fit here climbs the log-likelihood
                  by gradient ascent, which is the same thing as descending
                  the log loss, and reports how many passes it took and
                  whether it met its tolerance.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Complete Separation",
          content: (
            <>
              <SubSection title="27. Complete separation">
                <p>
                  Now twelve students with no mixed middle. Every fail is at
                  three and a half hours or less and every pass at five and a
                  half or more, so a boundary anywhere between them classifies
                  everyone perfectly.
                </p>
                <LogisticWalkPlayground points={SEPARATED_STUDENTS} panels={["curve", "traces"]} maxEpochs={2000} />
                <p>
                  Scrub the passes and read the three traces together.
                  Accuracy reaches one by pass 100 and never changes again.
                  The slope keeps growing, 1.05 at pass 100, 2.32 at pass 1000,
                  and 3.50 at pass 5000 if the budget allows it. The log loss
                  keeps falling, 0.133, 0.024, 0.006. Every steepening of the
                  curve makes the observed outcomes more likely, since there
                  is no student in the middle to be wrong about, and the
                  climb never finds a top.
                </p>
                <KeepInMind>
                  <p>With complete separation, increasing the coefficient magnitude can keep improving likelihood without reaching a finite optimum. Quasi-separation can cause the same problem when a separating boundary places some observations exactly on it, none on the wrong side, and at least one strictly on its correct side. A finite stopped run is not a finite maximum-likelihood solution. These cases need to be distinguished from the earlier overlapping-student reference fit.</p>
                </KeepInMind>
              </SubSection>

              <SubSection title="28. Regularizing a separated fit">
                <p>
                  The repair is the{" "}
                  <Link href="/concepts/ridge-lasso" className={linkClass}>
                    ridge page
                  </Link>

                  &rsquo;s. Add a penalty on the size of the coefficients to the
                  loss, and the climb gains a competing cost. Steepening the
                  curve still raises the likelihood and now also raises the
                  penalty, and at some finite slope the two pulls balance.
                  Penalized logistic regression settles on separated data at a
                  finite, less extreme curve, and the probabilities it reports
                  stay away from zero and one.
                </p>
                <InAModel>
                  <p>The example does not fit a penalized alternative. It reports the iteration limit and stopping reason for the unpenalized fit. When the classes are separable, those diagnostics help distinguish a finite stopped run from a claim that the coefficients reached a finite optimum.</p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 10. What the Probability Means",
          content: (
            <>
              <SubSection title="29. What the predicted probability means">
                <p>The model estimates a conditional probability.</p>
                <Equation>{"P(y = 1 | x)"}</Equation>
                <p>For these students, the probability is an estimate of passing conditional on the supplied study hours and the fitted rule. Two students with the same hours receive the same estimate even if their other circumstances differ. Its accuracy and calibration require evaluation, and the fitted association does not establish the effect of changing study time.</p>
                <p>
                  There is also a test the number should pass. If a model
                  assigns many comparable students a probability near 0.8,
                  then about 80 percent of them should turn out to pass. That
                  agreement between stated confidence and observed frequency is
                  calibration, and a model can classify well while being
                  poorly calibrated.
                </p>
                <p>A calibration table groups students into probability bins. Within each bin, compare the average predicted probability with the observed passing fraction, keeping the observation count beside them. For a calibrated model, these quantities should be close across sufficiently large comparable groups, allowing for sampling variation. Finite samples can differ even when the model is calibrated.</p>
                <WorkedExample title="A calibration table on the twelve, which is too few">
                  <NumberTable
                    headings={["probability bin", "students", "mean predicted p", "observed pass rate"]}
                    rows={[
                      ["0 to 0.25", "5", "0.074", "0.00"],
                      ["0.25 to 0.5", "1", "0.401", "1.00"],
                      ["0.5 to 0.75", "1", "0.610", "1.00"],
                      ["0.75 to 1", "5", "0.924", "0.80"],
                    ]}
                    caption="The middle bins contain only one student each, so their rates give very uncertain evidence. These are also the students used to fit the curve. Check calibration on new students, with enough observations to assess the differences."
                  />
                </WorkedExample>
                <p>The lowest bin contains five students who studied three and a half hours or less. Their mean predicted probability is 0.074 and none passed. Five observations provide little evidence about the size of that calibration difference.</p>
<p>The highest bin contains five students who studied five hours or more. Its mean prediction is 0.924 and four passed, so the predicted average exceeds the observed passing rate in this group.</p>
<p>The middle bins each contain one student: the four-hour pass has prediction 0.401 and the four-and-a-half-hour pass has prediction 0.610. A single observed pass gives a bin rate of one, but tells us little about the passing probability of similar students. Keep each bin’s observation count beside its calibration point.</p>
                <KeepInMind>
                  Accuracy and calibration are different tests of the same
                  curve. Part 5 raised the accuracy from 0.833 to 0.917 by
                  moving the threshold without touching a single probability,
                  and this table would not have changed at all, because it
                  reads the probabilities and never the decisions.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 11. Extending to Several Features",
          content: (
            <SubSection title="30. Extending to several features">
              <p>
                So far the score has read one number, the hours. Suppose each
                student were measured twice, hours studied and, say, hours
                slept. Each input gets a coefficient of its own, and the score
                is each input times its coefficient, added up, plus the
                intercept. That weighted sum is the multiple regression
                page&rsquo;s dot product, and everything after it is unchanged.
              </p>
              <Equation>{"z = β₁x₁ + β₂x₂ + α          p = σ(z)\n\nwritten for any number of inputs:  z = β·x + α"}</Equation>
              <p>
                The sigmoid turns the score into a probability exactly as
                before, the log loss scores that probability against what
                happened, and the fit is the same walk with one more direction
                to move in. The gradient gains one component per input, and
                each component is the gap between outcome and probability
                times that input, summed over the students. It is the
                single-input gradient of Part 7 with the second input standing
                where the hours stood.
              </p>
              <Equation>{"∂ℓ/∂βⱼ = Σ (yᵢ − pᵢ)·xᵢⱼ          one such sum for each input j"}</Equation>
              <p>
                Each coefficient changes the log-odds while the other inputs
                are held fixed, so one more hour of study multiplies the odds
                by e to the first coefficient among students who slept the
                same amount, with the same qualification about held-fixed
                comparisons the multiple regression page gave.
              </p>
              <p>At a threshold of one half, the boundary is where z equals zero. With two features and at least one nonzero coefficient, this is a line in the input plane. With three features it is a plane, and the same equation describes a hyperplane in higher dimensions. If all feature coefficients are zero, the prediction is constant instead.</p>
              <Equation>{"boundary at t = 0.5:  β₁x₁ + β₂x₂ + α = 0"}</Equation>
              <p>
                Adding features changes the geometry of the
                boundary and nothing about the mechanism. The{" "}
                <Link href="/concepts/multiclass-classification" className={linkClass}>
                  multiclass page
                </Link>{" "}
                takes the next step, from two classes to many.
              </p>
            </SubSection>
          ),
        },
        {
          title: "Questions on Scoring and Fitting",
          quiz: [
            choice(
  "The same fitted probability model is used before and after lowering its decision threshold. What happens to log loss?",
  [
                  "It stays at 0.2933, because the probabilities never changed",
                  "It falls, since more students are classified correctly",
                  "It rises, since the threshold has moved away from one half",
                  "It becomes undefined once the threshold is below one half",
                ],
  0,
  "Only the decision cutoff changes. It moves the hours boundary and changes which probabilities produce pass decisions, while leaving the fitted probability values intact. Accuracy can therefore change while log loss remains fixed. The two measures evaluate different outputs of the same fitted procedure.",
  {
    "description": "Only the decision threshold changes; do not refit the model or recalculate its probabilities.",
    "data": "Before: threshold 0.5, accuracy 0.833, binary log loss 0.2933\nAfter: threshold 0.3, accuracy 0.917\nBinary log loss is calculated from probabilities and observed labels, not thresholded decisions."
  },
),
            trueFalse(
  "With a decision threshold of 0.5, a student who passed is scored the same by accuracy whether the predicted passing probability is 0.9 or 0.6.",
  true,
  "Both probabilities produce a pass decision at the stated cutoff, so accuracy gives them the same credit. For this observed pass, log loss assigns less loss to the higher probability. It retains a distinction that the binary decision discards.",
),
            choice(
  "Both coefficients start at zero. Under this binary log-loss convention, what is the initial loss?",
  [
                  "About 0.693, because every student is given a probability of one half",
                  "Zero, because the model has not yet made a mistake",
                  "0.293, which is the optimum on this dataset",
                  "0.743, the value the first update reaches",
                ],
  0,
  "Zero coefficients give every student score zero and probability one half. The probability assigned to either observed binary outcome is therefore the same.\n\n```math\nloss = -log(0.5) = log(2) ≈ 0.6931\n```\n\nLater updates change the coefficients and the assigned probabilities; this is the initial loss before those updates.",
  {
    "description": "Use natural logarithms and average the losses over the observations.",
    "data": "score = intercept + slope*hours\nprobability = sigmoid(score)\nloss = mean(-y*log(probability) - (1-y)*log(1-probability))\nInitial intercept = 0; initial slope = 0; labels are binary."
  },
),
            several(
  "Which statements agree with this training report?",
  [
                  "The optimum is near an intercept of −7.18 and a slope of 1.69",
                  "At a learning rate of 0.5 the first update raises the loss before it falls",
                  "The loss falls on every pass, starting from the first",
                  "The walk settles within a few dozen passes",
                ],
  [0, 1],
  "The recorded first update raises loss to 0.743, so this run does not improve on every pass. It later settles near the reported coefficients with loss about 0.293 under the implementation’s stopping rule. The trace distinguishes a stopping report from a guarantee that each step lowers the objective.",
  {
    "description": "This is a recorded run on the overlapping twelve-student example. Interpret the report rather than remembering the plot.",
    "data": "Learning rate: 0.5\nInitial coefficients: intercept 0, slope 0\nLoss: initially 0.693; after first update 0.743; final 0.293\nFinal coefficients: intercept approximately -7.18, slope approximately 1.69\nThe run settles after a few thousand passes."
  },
),
            trueFalse(
  "In this unregularized, separable example, accuracy reaches one by pass 100 and the slope then settles to a finite optimum.",
  false,
  "The accuracy has already reached one, but the slope and log loss keep changing. With completely separable labels and no coefficient penalty, scaling a separating score can keep making the observed labels more probable. The unregularized logistic likelihood has no finite maximizer in this setting. A finite pass budget returns a finite iterate; it does not establish convergence.",
  {
    "description": "The labels are linearly separable and the objective is binary log loss with no coefficient penalty.",
    "data": "Pass | Accuracy | Slope | Log loss\n100 | 1.000 | 1.05 | 0.133\n1000 | 1.000 | 2.32 | 0.024\n5000 | 1.000 | 3.50 | 0.006"
  },
),
        ],
        },
        {
          title: "Practice. Fitting the Twelve Students With the Library",
          practice: [
            exercise(
              "Fit the twelve students",
              ["The workshop separated a model score, its pass probability and the final decision. Now fit the score coefficients from the twelve students' study hours and recorded outcomes using LogisticRegression with learning_rate=0.5.","Print the fitted slope and intercept, the study-hour boundary for probability one half, and the factor by which another hour changes the model's odds. Also report epochs_run and converged. Use the named result format shown by the required-output panel; the coefficients are measured outputs of this fit, not values to enter by hand."],
              `from oop_ml import Feature, LogisticRegression

hours = [1, 1.5, 2, 3, 3.5, 5, 4, 4.5, 5.5, 6, 7, 8]
passed = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

model = LogisticRegression(learning_rate=0.5)
# Fit the model to the hours and outcomes, then print the slope, the
# intercept, the boundary where the probability crosses one half, what one
# more hour multiplies the odds by, and how many passes the climb ran.`,
              `from oop_ml import Feature, LogisticRegression

hours = [1, 1.5, 2, 3, 3.5, 5, 4, 4.5, 5.5, 6, 7, 8]
passed = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

model = LogisticRegression(learning_rate=0.5)
model.fit([Feature("hours", hours)], Feature("passed", passed))

print(f"slope {model.coefficients['hours']:.4f}")
print(f"intercept {model.intercept:.4f}")
print(f"boundary {model.decision_boundary_at('hours'):.2f} hours")
print(f"odds multiplier per hour {model.odds_multiplier_for('hours'):.2f}")
print(f"passes run {model.epochs_run}, converged {model.converged}")`,
              `slope 1.6945
intercept -7.1789
boundary 4.24 hours
odds multiplier per hour 5.44
passes run 6453, converged True`,
              { hints: ["Create the model with the learning rate. Its fit method takes a list of named input Feature objects and one target Feature containing the binary outcomes.", "Read the study-hours coefficient from coefficients using the feature name as its key. Read intercept as a separate model property.", "Both decision_boundary_at and odds_multiplier_for take the feature name. The first returns the hour where the fitted score is zero, giving probability one half. The second exponentiates that feature’s coefficient to obtain its odds multiplier.", "epochs_run reports the number of completed training passes. converged reports whether this implementation’s stopping condition was met."], check: numberCheck("Where does the fitted curve cross one half, in hours?", 4.24, 0.005, "The boundary is where the fitted score is zero, giving probability one half. It describes this model’s decision at a one-half cutoff. It does not say that studying for that many hours guarantees a pass, and the overlapping observations prevent a perfect classification here."), question: "What pass-probability rule does the model learn from these twelve students?" },
            ),
            exercise(
              "Score the probabilities rather than the decisions",
              ["A correct-or-incorrect decision discards information about confidence. Use the fitted probabilities to score the observed outcomes themselves. For a passing student, use the assigned pass probability; for a failing student, use the assigned failure probability.","Print the pass probability and negative-log loss for the five-hour failure and the four-hour pass. Then print the product of the twelve assigned-outcome probabilities and their mean negative-log loss. The starter fits the same model again, so this challenge does not depend on a previous editor's variables."],
              `import math

from oop_ml import Feature, LogisticRegression

hours = [1, 1.5, 2, 3, 3.5, 5, 4, 4.5, 5.5, 6, 7, 8]
passed = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

model = LogisticRegression(learning_rate=0.5).fit([Feature("hours", hours)], Feature("passed", passed))
probabilities = [float(p) for p in model.predict_probability([Feature("hours", hours)])]
# For each student keep the probability the curve gave the outcome that
# happened, p for a pass and 1 - p for a fail, and take minus its logarithm
# as the loss. Print the probability and loss for the students at positions
# 5 and 6 in the lists, then the likelihood and the log loss.`,
              `import math

from oop_ml import Feature, LogisticRegression

hours = [1, 1.5, 2, 3, 3.5, 5, 4, 4.5, 5.5, 6, 7, 8]
passed = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

model = LogisticRegression(learning_rate=0.5).fit([Feature("hours", hours)], Feature("passed", passed))
probabilities = [float(p) for p in model.predict_probability([Feature("hours", hours)])]

assigned = [p if outcome == 1 else 1 - p for p, outcome in zip(probabilities, passed)]
losses = [-math.log(value) for value in assigned]
for position in (5, 6):
    print(f"{hours[position]} hours, passed {passed[position]}: p {probabilities[position]:.3f}, loss {losses[position]:.3f}")

print(f"likelihood {math.prod(assigned):.4f}")
print(f"log loss {sum(losses) / len(losses):.4f}")`,
              `5 hours, passed 0: p 0.785, loss 1.536
4 hours, passed 1: p 0.401, loss 0.914
likelihood 0.0296
log loss 0.2933`,
              { hints: ["predict_probability returns one probability per student in the original input order. Position 5 is the five-hour failure, and position 6 is the four-hour pass.", "For an observed pass, retain its pass probability p. For an observed failure, retain one minus p. Each selected value is the probability the model assigned to what actually happened.", "math.prod multiplies a list together and math.log is the natural logarithm, so a loss is -math.log of the assigned probability."], check: numberCheck("What log loss does the fitted curve earn on the twelve students?", 0.2933, 0.0005, "Under the model’s conditional independent-outcome assumption, the likelihood is a product of the probabilities assigned to the observed outcomes. Mean log loss summarizes their negative logarithms. The two overlapping students receive relatively high losses because the fitted model assigns low probability to what happened to them."), question: "How strongly did the fitted model support the outcomes that actually happened?" },
            ),
            exercise(
              "Move the threshold without refitting",
              ["Keep this fitted curve fixed. At cutoffs 0.3, 0.5 and 0.8, predict a pass whenever the estimated probability reaches the cutoff, including equality. Compare those decisions with the students' recorded outcomes.","For each cutoff, print accuracy and the matching boundary on the hours axis. Use the cutoff's log odds together with the fitted slope and intercept to find that boundary. No refitting is needed: the only change is the rule used to turn probabilities into decisions."],
              `import math

from oop_ml import ClassificationEvaluation, Feature, LogisticRegression

hours = [1, 1.5, 2, 3, 3.5, 5, 4, 4.5, 5.5, 6, 7, 8]
passed = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

model = LogisticRegression(learning_rate=0.5).fit([Feature("hours", hours)], Feature("passed", passed))
probabilities = [float(p) for p in model.predict_probability([Feature("hours", hours)])]
slope, intercept = model.coefficients["hours"], model.intercept

for threshold in (0.3, 0.5, 0.8):
    # Call a pass wherever the probability reaches the threshold, evaluate
    # those decisions against the outcomes, and print the accuracy beside
    # the boundary, (logit(threshold) - intercept) / slope.
    pass`,
              `import math

from oop_ml import ClassificationEvaluation, Feature, LogisticRegression

hours = [1, 1.5, 2, 3, 3.5, 5, 4, 4.5, 5.5, 6, 7, 8]
passed = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

model = LogisticRegression(learning_rate=0.5).fit([Feature("hours", hours)], Feature("passed", passed))
probabilities = [float(p) for p in model.predict_probability([Feature("hours", hours)])]
slope, intercept = model.coefficients["hours"], model.intercept

for threshold in (0.3, 0.5, 0.8):
    decisions = [1 if p >= threshold else 0 for p in probabilities]
    evaluation = ClassificationEvaluation(passed, decisions)
    boundary = (math.log(threshold / (1 - threshold)) - intercept) / slope
    print(f"threshold {threshold}: accuracy {evaluation.accuracy:.3f}, boundary {boundary:.3f} hours")`,
              `threshold 0.3: accuracy 0.917, boundary 3.737 hours
threshold 0.5: accuracy 0.833, boundary 4.237 hours
threshold 0.8: accuracy 0.833, boundary 5.055 hours`,
              { hints: ["A decision is 1 where the probability is at least the threshold and 0 elsewhere, which is one comparison per student.", "Pass observed outcomes first and predicted decisions second to ClassificationEvaluation. Read accuracy from the returned object; confusion_matrix provides the counts for the two classes.", "logit(t) is the natural logarithm of t over 1 − t, and the boundary is where the score reaches it, so subtract the intercept and divide by the slope."], check: numberCheck("What accuracy do the decisions reach at a threshold of 0.3?", 0.917, 0.0005, "The lower cutoff includes the four-hour pass while retaining the five-hour false positive, so these particular decisions improve their accuracy. Raising the cutoff changes which observations are missed. The probabilities and their log loss remain fixed; a different dataset or mistake cost can favor another cutoff."), question: "Which decisions change when we move the cutoff but keep the fitted probabilities?" },
            ),
            exercise(
              "Separate the classes completely",
              ["The new data have no overlapping middle: every failure studied fewer hours than every pass. Fit independent LogisticRegression models with learning_rate=0.5 and budgets of 100, 1000 and 5000 epochs.","For each budget, print the fitted slope, accuracy at the default one-half cutoff, and converged. Compare the coefficient movement with the decisions. Restrict your conclusion to the observed runs and the unregularized model being fitted."],
              `from oop_ml import Feature, LogisticRegression

hours = [1, 1.5, 2, 2.5, 3, 3.5, 5.5, 6, 6.5, 7, 7.5, 8]
passed = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

for budget in (100, 1000, 5000):
    model = LogisticRegression(learning_rate=0.5, max_epochs=budget)
    # Fit the model, then print the slope it reached, its accuracy on the
    # twelve, and whether it converged.`,
              `from oop_ml import Feature, LogisticRegression

hours = [1, 1.5, 2, 2.5, 3, 3.5, 5.5, 6, 6.5, 7, 7.5, 8]
passed = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

for budget in (100, 1000, 5000):
    model = LogisticRegression(learning_rate=0.5, max_epochs=budget)
    model.fit([Feature("hours", hours)], Feature("passed", passed))
    accuracy = model.score([Feature("hours", hours)], Feature("passed", passed))
    print(f"budget {budget}: slope {model.coefficients['hours']:.2f}, accuracy {accuracy:.3f}, converged {model.converged}")`,
              `budget 100: slope 1.05, accuracy 1.000, converged False
budget 1000: slope 2.32, accuracy 1.000, converged False
budget 5000: slope 3.50, accuracy 1.000, converged False`,
              { hints: ["Create a fresh model for each max_epochs budget so every comparison starts from the same initialization.","score reports classification accuracy at the default cutoff. It does not establish that the likelihood has a finite optimum.","On perfectly separable data the unregularized logistic likelihood has no finite maximizer. A numerical stopping rule can still report small updates, so interpret converged together with the stated algorithm and budget."], check: numberCheck("What slope does the model report after the 5000-epoch budget?", 3.5, 0.005, "The runs classify every student correctly while the slope continues to grow. Increasing a separating score can keep assigning the observed labels probabilities closer to one. Without regularization, no finite coefficient attains the best likelihood in this separable setting. Reaching a pass budget or a numerical stopping tolerance is a different condition."), question: "Can perfect classifications make these unregularized coefficients settle?" },
            ),
          ],
        },
      ]}
    />
  );
}
