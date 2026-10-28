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

export const metadata: Metadata = {
  title: "Logistic Regression · oop_ml",
  description:
    "Suppose our answer needs to be yes or no. We can first estimate a probability from the measurements, then decide how large that probability needs to be before we choose yes.",
};

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
      tagline={"Suppose our answer needs to be yes or no. We can first estimate a probability from the measurements, then decide how large that probability needs to be before we choose yes."}
      prerequisites={
        <>
          This page assumes{" "}
          <Link href="/concepts/simple-linear-regression" className={linkClass}>
            simple linear regression
          </Link>{" "}
          and the{" "}
          <Link href="/concepts/gradient-descent-regression" className={linkClass}>
            fitting-by-walking
          </Link>{" "}
          page, whose walk this page repeats on a different loss. The{" "}
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
                <p>
                  The obvious first attempt is the regression page&rsquo;s
                  line, fitted to the zeros and ones as if they were numbers.
                </p>
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
                <p>
                  We want a chance of passing, but our calculation begins with a
                  number that can be any size. We also need a rule for deciding
                  when to call the outcome a pass. Those are different jobs, so
                  let&apos;s give each result its own name.
                </p>
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
                    The score can be any real number. Positive scores favour passing,
                    negative scores favour failing, and zero is neutral. The score
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
                <p>
                  Whatever turns a score into a probability should send large
                  negative scores near zero, send large positive scores near
                  one, send zero to exactly one half, and do all of that
                  smoothly. The sigmoid does.
                </p>
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
                <p>
                  The sigmoid converts an unrestricted score into a value
                  between zero and one, and it never quite reaches either end.
                  A finite score always gives a probability strictly inside
                  the band.
                </p>
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
                <p>
                  The same step in the score buys a small change near zero, the
                  largest change near one half, and a small change again near
                  one. The model is linear in its score, and its probability
                  does not move by a constant amount. That is not a flaw to be
                  fixed. A model that has already assigned a 98% chance has
                  less room to become more convinced, and the curve says so.
                </p>
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
                <p>
                  Odds run from zero up to infinity, and a straight-line score
                  runs from minus infinity to plus infinity, so the two still
                  do not match. Take the logarithm of the odds and they do.
                </p>
                <Equation>{"log-odds = ln( p / (1 − p) )"}</Equation>
                <p>
                  A probability below one half has odds below one and negative
                  log-odds. A probability of exactly one half has odds of one
                  and log-odds of zero. A probability above one half has odds
                  above one and positive log-odds. Three scales, one centre.
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
                <p>
                  This is the bridge the page is built on. The model is not
                  linear in the probability, which section 6 showed, and it
                  is not linear in the odds. It is linear in the log-odds, and
                  every reading of a coefficient in the next Part is a reading
                  on that scale.
                </p>
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
                  Nobody here studied zero hours, so the number is the line&rsquo;s position more than a claim about anyone, exactly as the regression page&rsquo;s intercept of −68 kg was. Centring the hours would make the intercept the log-odds at the average study time instead.
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
                  <p>
                    A logistic coefficient is a constant change in log-odds
                    and a constant multiplier of odds, and never a constant
                    change in probability. And it is an association in the
                    fitted data. It does not say that making a student study
                    one more hour would multiply their odds by 5.4, only that
                    students who studied an hour more had odds about 5.4 times
                    higher in this sample.
                  </p>
                </KeepInMind>
                <p>
                  The two sliders in the widget also show what each setting
                  controls. Moving α slides the whole transition left or
                  right, changing the probability at every study time and
                  where the curve crosses one half. Moving β changes how sharp
                  the transition is and, through zero, which way it runs. A
                  positive β rises with x, a negative one falls, and a zero
                  gives a flat line at σ(α).
                </p>
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
              "The score can be any real number, positive favouring passing and negative favouring failing. The probability is what the score becomes once the sigmoid has it, and the decision is a separate rule laid on top of that probability. Only the decision has a threshold in it.",
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
              "The model is linear in its score, and its probability does not move by a constant amount. The sigmoid changes fastest where its output is one half, with a maximum slope of 0.25, and flattens toward either end, which is why a model that has already assigned a 98% chance has less room to become more convinced. On the fitted curve that steepest rate is about 0.42 per hour, the slope of 1.69 divided by four.",
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
              "An extra hour raises the score, and so the log-odds, by the slope. Raising a logarithm by the slope multiplies the quantity itself by e to that slope, which here is 5.44. A probability could not be multiplied this way, since it is bounded above by one.",
            ),
            trueFalse(
              "The sigmoid of the intercept, 0.0008, is the fitted chance of passing with no study at all, and nobody among the twelve studied zero hours, so it is the line’s position rather than a claim about anyone.",
              true,
              "The intercept is the log-odds when the input is zero, and its practical meaning is only as good as zero is as an input. Nobody here studied zero hours, exactly as nobody on the regression page was zero centimetres tall, so the eight in ten thousand positions the curve rather than describing a student. Centring the hours would make the intercept the log-odds at the average study time instead.",
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
                <p>
                  Take a student who passed and two predictions for them, p =
                  0.9 and p = 0.6. Both become a pass at a threshold of 0.5,
                  so accuracy cannot tell them apart. The first assigned more
                  probability to what actually happened, and it should count
                  as the better prediction. A student who failed, predicted at
                  0.1 or at 0.4, is the same story from the other side.
                </p>
                <p>
                  Fitting a probability model needs a score that separates
                  predictions which make the same decision at different
                  confidence. Accuracy is not it, and the next three sections
                  build the one that is.
                </p>
              </SubSection>

              <SubSection title="17. Likelihood">
                <p>
                  For one student, ask how much probability the model gave to
                  the outcome that occurred. If they passed that is p, and if
                  they failed it is 1 − p.
                </p>
                <Equation>{"P(yᵢ | pᵢ) = pᵢ        when yᵢ = 1\nP(yᵢ | pᵢ) = 1 − pᵢ    when yᵢ = 0\n\nP(yᵢ | pᵢ) = pᵢ^yᵢ (1 − pᵢ)^(1 − yᵢ)     both cases in one line"}</Equation>
                <p>
                  The exponent trick is worth reading once. When yᵢ = 1 the
                  second factor has exponent zero and vanishes, and when yᵢ =
                  0 the first does. Multiply over every student and the
                  result is the likelihood, the probability the model assigned
                  to the complete set of outcomes that happened.
                </p>
                <Equation>{"L = ∏ pᵢ^yᵢ (1 − pᵢ)^(1 − yᵢ)"}</Equation>
                <p>
                  For the fitted curve on the twelve students the product is
                  0.0296. That is small, and it should be, since it is the
                  chance of twelve specific things all happening. What matters
                  is that it is larger than any other curve makes it.
                </p>
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
                  caption="Three readouts of one preference. Whatever curve maximises the first maximises the second and minimises the third, so the fit is the same whichever is used, and implementations generally minimise the third."
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
                  four-hour pass it put at 0.401. Log loss strongly penalises
                  a confident prediction that assigned little probability to
                  what actually happened.
                </p>
              </SubSection>

              <SubSection title="20. Same accuracy, different probability quality">
                <p>
                  The second curve in the table above has half the fitted
                  slope and half the fitted intercept. It crosses one half at
                  the same 4.24 hours, so it makes exactly the same twelve
                  decisions and has exactly the same accuracy of 0.833. Its
                  log loss is 0.3425 against the fitted curve&rsquo;s 0.2933,
                  because it is less sure about the students it is right
                  about, and being less sure costs.
                </p>
                <p>
                  Logistic regression is fitted to probability quality. It
                  maximises the likelihood, and it does not directly choose
                  the boundary that produces the fewest classification
                  mistakes. On these students the two happen to agree. They
                  need not, and section 13 already showed a threshold that
                  beats the fitted curve&rsquo;s default accuracy without
                  touching its probabilities.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Fitting the Model",
          content: (
            <>
              <SubSection title="21. Fitting on the loss surface">
                <p>
                  Two parameters, α and β. Every pair gives twelve scores,
                  twelve probabilities and one log loss, so the loss is a
                  surface over the pair, and fitting is the fitting-by-walking
                  page&rsquo;s search across it. The surface below is the log
                  loss over intercept and slope, and the path is the
                  climb itself, recorded pass by pass.
                </p>
                <LogisticWalkPlayground panels={["surface", "curve"]} maxEpochs={300} />
                <>
                  <p>
                    The walk starts with both coefficients at zero. That assigns a
                    probability of one half to every student, regardless of study hours.
                  </p>
                  <Equation>{"initial log loss = −ln(0.5) = ln 2 ≈ 0.693"}</Equation>
                  <p>
                    The optimum on this dataset is near intercept −7.18 and slope 1.69,
                    with loss 0.293. At learning rate 0.5, the first update overshoots
                    and the loss rises to 0.743 before falling. It settles after a few
                    thousand passes. Fitting means finding coefficients whose
                    probability predictions minimize the loss.
                  </p>
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
                <p>
                  Scrub the widget above one pass at a time from the start and
                  watch the curve panel. The first few passes lurch, because
                  the rate is bold, and after that the curve steepens
                  steadily into place. Logistic regression repeatedly turns
                  inputs into probabilities, measures their loss, and adjusts
                  its coefficients, and nothing else.
                </p>
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
                  finite, unpenalised optimum both sums are zero.
                </p>
                <Equation>{"Σ (yᵢ − pᵢ) = 0          Σ (yᵢ − pᵢ)·xᵢ = 0"}</Equation>
                <p>
                  The first says the total of the predicted probabilities
                  equals the number of passes, so the curve is right on
                  average. The second says the gaps also balance after
                  weighting by hours, so the curve is right on average at the
                  low end and the high end separately. The bars below are the
                  gaps on the fitted curve, student by student.
                </p>
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
                <p>
                  The derivation needs the sigmoid&rsquo;s own derivative
                  first, and it is the tidiest in the subject.
                </p>
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
                  <p>
                    Perfect classification does not guarantee that
                    unpenalised logistic regression has a finite fitted
                    coefficient. On separated data, or on data where one class
                    can be separated on part of the range, the maximum
                    likelihood is only approached and never reached, and what
                    is reported at the end is wherever the pass budget ran
                    out, honestly labelled as not converged. Overlap is not
                    a nuisance to logistic regression. It is what holds the
                    answer finite.
                  </p>
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
                  Penalised logistic regression settles on separated data at a
                  finite, less extreme curve, and the probabilities it reports
                  stay away from zero and one.
                </p>
                <InAModel>
                  <p>
                    No penalised climb is fitted on this page, so the toggle
                    that would set one beside the unpenalised climb above is
                    not here. What the page shows instead is the pass budget
                    and the honest verdict, which is the minimum a separated
                    fit should come with.
                  </p>
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
                <p>
                  For the students that is the estimated chance of passing,
                  given the hours supplied and the fitted model. It does not
                  mean the student is partly passed, or that the model knows
                  the true chance, or that study time is the only thing that
                  matters, or that study time causes the outcome, or that two
                  students at the same hours are in the same circumstances. It
                  is a model-based estimate conditioned on the one feature it
                  was given.
                </p>
                <p>
                  There is also a test the number should pass. If a model
                  assigns many comparable students a probability near 0.8,
                  then about 80 percent of them should turn out to pass. That
                  agreement between stated confidence and observed frequency is
                  calibration, and a model can classify well while being
                  poorly calibrated.
                </p>
                <p>
                  Reading a calibration table takes three steps. Sort the
                  students by the probability the curve gave them and cut that
                  range into bins. Inside each bin, average the predicted
                  probabilities, which is what the curve claimed on average for
                  those students. Then count how many of them actually passed,
                  which is what happened. A calibrated curve has the two
                  columns agree in every bin that holds enough students for a
                  rate to mean anything.
                </p>
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
                <p>
                  The lowest bin holds the five students who studied three and
                  a half hours or less. The curve put them at 0.074 on average
                  and none of them passed. That is a lower observed rate, but
                  five students give little evidence about the size of the
                  difference. The
                  highest bin holds the five who studied five hours or more.
                  The curve put them at 0.924 on average and four of the five
                  passed, the five-hour fail being the exception, so the curve
                  claimed a little more there than it delivered. The two middle
                  bins are the four-hour pass at 0.401 and the
                  four-and-a-half-hour pass at 0.610, one student each, and a
                  each observed rate is therefore either zero or one. A rate
                  calculated from one student tells us very little about the
                  chance of passing for similar students.
                </p>
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
              <p>
                The threshold of one half falls where z = 0, and with two
                features that is a line across the plane of the two inputs.
                Every student on one side of it is called a pass and every
                student on the other a fail, however far from the line they
                sit. With three it is a plane, and with more it is a flat
                surface in more dimensions than can be drawn.
              </p>
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
  "The threshold is a decision rule laid on top of the probabilities and not part of the model, so sliding it moves the boundary on the hours axis and nothing else. Accuracy evaluates the thresholded decisions and says nothing about the probabilities that produced them, which is why it can change while the log loss, which reads only the probabilities, cannot. Raise the threshold to 0.8 instead and the boundary moves to 5.06 hours, the five-hour fail is caught and two passes are missed.",
  {
    "description": "Only the decision threshold changes; do not refit the model or recalculate its probabilities.",
    "data": "Before: threshold 0.5, accuracy 0.833, binary log loss 0.2933\nAfter: threshold 0.3, accuracy 0.917\nBinary log loss is calculated from probabilities and observed labels, not thresholded decisions."
  },
),
            trueFalse(
  "With a decision threshold of 0.5, a student who passed is scored the same by accuracy whether the predicted passing probability is 0.9 or 0.6.",
  true,
  "Both predictions cross a threshold of one half, so both count as a correct pass and accuracy cannot separate them. The first gave more probability to what actually happened and ought to count as the better prediction, which is why fitting needs a loss over probabilities rather than a count of correct decisions.",
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
  "Both coefficients at zero make every score zero, and the sigmoid of zero is one half for every student whatever their hours. Giving a half to each outcome costs the negative logarithm of a half, which is ln 2. The optimum of 0.293 and the overshoot of 0.743 both come later in the same walk.",
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
  "The first update at that rate overshoots, taking the loss to 0.743 before it begins to fall, so the descent is not downhill from the very first step. It settles after a few thousand passes rather than a few dozen, and the optimum it reaches carries a loss of 0.293.",
  {
    "description": "This is a recorded run on the overlapping twelve-student example. Interpret the report rather than remembering the plot.",
    "data": "Learning rate: 0.5\nInitial coefficients: intercept 0, slope 0\nLoss: initially 0.693; after first update 0.743; final 0.293\nFinal coefficients: intercept approximately -7.18, slope approximately 1.69\nThe run settles after a few thousand passes."
  },
),
            trueFalse(
  "In this unregularised, separable example, accuracy reaches one by pass 100 and the slope then settles to a finite optimum.",
  false,
  "The accuracy has already reached one, but the slope and log loss keep changing. With completely separable labels and no coefficient penalty, scaling a separating score can keep making the observed labels more probable. The unregularised logistic likelihood has no finite maximiser in this setting. A finite pass budget returns a finite iterate; it does not establish convergence.",
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
              { hints: ["The inputs go in as a list of Feature objects and the outcome as one Feature of zeros and ones. Construction takes the learning rate; the data goes to fit.", "coefficients is addressable by the feature’s name, and intercept is a property of its own.", "decision_boundary_at and odds_multiplier_for each take the feature’s name. The first is minus the intercept over the slope, where the score is zero; the second is e to the slope.", "epochs_run and converged are the walk’s own record of how it ended."], check: numberCheck("Where does the fitted curve cross one half, in hours?", 4.24, 0.005, "The boundary is where the fitted score is zero, giving probability one half. It describes this model’s decision at a one-half cutoff. It does not say that studying for that many hours guarantees a pass, and the overlapping observations prevent a perfect classification here."), question: "What pass-probability rule does the model learn from these twelve students?" },
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
              { hints: ["predict_probability answers one probability per student, in the order the hours were given, so position 5 is the five-hour fail and position 6 the four-hour pass.", "The probability assigned to what happened is p when the outcome is 1 and 1 − p when it is 0, which is the exponent trick of Part 6 written as a choice.", "math.prod multiplies a list together and math.log is the natural logarithm, so a loss is -math.log of the assigned probability."], check: numberCheck("What log loss does the fitted curve earn on the twelve students?", 0.2933, 0.0005, "Under the model’s conditional independent-outcome assumption, the likelihood is a product of the probabilities assigned to the observed outcomes. Mean log loss summarises their negative logarithms. The two overlapping students receive relatively high losses because the fitted model assigns low probability to what happened to them."), question: "How strongly did the fitted model support the outcomes that actually happened?" },
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
              { hints: ["A decision is 1 where the probability is at least the threshold and 0 elsewhere, which is one comparison per student.", "ClassificationEvaluation pairs the actual outcomes with the decisions, in that order, and accuracy is a property of it. Its confusion_matrix holds the four counts under the widget in Part 5.", "logit(t) is the natural logarithm of t over 1 − t, and the boundary is where the score reaches it, so subtract the intercept and divide by the slope."], check: numberCheck("What accuracy do the decisions reach at a threshold of 0.3?", 0.917, 0.0005, "The lower cutoff includes the four-hour pass while retaining the five-hour false positive, so these particular decisions improve their accuracy. Raising the cutoff changes which observations are missed. The probabilities and their log loss remain fixed; a different dataset or mistake cost can favour another cutoff."), question: "Which decisions change when we move the cutoff but keep the fitted probabilities?" },
            ),
            exercise(
              "Separate the classes completely",
              ["The new data have no overlapping middle: every failure studied fewer hours than every pass. Fit independent LogisticRegression models with learning_rate=0.5 and budgets of 100, 1000 and 5000 epochs.","For each budget, print the fitted slope, accuracy at the default one-half cutoff, and converged. Compare the coefficient movement with the decisions. Restrict your conclusion to the observed runs and the unregularised model being fitted."],
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
              { hints: ["Create a fresh model for each max_epochs budget so every comparison starts from the same initialisation.","score reports classification accuracy at the default cutoff. It does not establish that the likelihood has a finite optimum.","On perfectly separable data the unregularised logistic likelihood has no finite maximiser. A numerical stopping rule can still report small updates, so interpret converged together with the stated algorithm and budget."], check: numberCheck("What slope has the climb reached when a budget of 5000 passes runs out?", 3.5, 0.005, "These supplied runs achieve perfect classification while their slopes continue growing. Perfect separation lets the unregularised likelihood approach its supremum with increasingly large coefficients; it does not provide a finite maximum-likelihood coefficient. Numerical tolerance and regularisation are separate considerations."), question: "Can perfect classifications make these unregularised coefficients settle?" },
            ),
          ],
        },
      ]}
    />
  );
}
