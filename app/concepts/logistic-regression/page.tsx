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
    "Model a probability with a straight line in the log-odds, fit it by likelihood, turn it into a decision with a threshold, and keep those four things apart.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function LogisticRegressionPage() {
  return (
    <ConceptPage
      title="Logistic Regression"
      tagline="A straight line in the log-odds, a probability out of the sigmoid, and a decision only when you ask for one."
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
      history={
        <>
          <p>
            The curve is older than the problem. Pierre-François Verhulst, in
            Brussels in 1838, wrote it down to describe a population that
            grows quickly while it is small and slows as it approaches
            whatever the land can support, and he named it the logistic curve
            in 1845. Raymond Pearl and Lowell Reed rediscovered the same curve
            in 1920 and fitted it to the census population of the United
            States, and neither they nor Verhulst were modelling a
            probability. The S shape entered statistics through bioassay,
            where Chester Bliss in 1934 was estimating how the fraction of
            insects killed rises with the dose of an insecticide, and his
            probit used the cumulative normal for the rise. Joseph Berkson, at
            the Mayo Clinic, argued in a 1944 paper in the Journal of the
            American Statistical Association that the logistic curve served
            the same purpose and was easier to work with, and he coined the
            word logit for the log of the odds, which is the quantity this
            page&rsquo;s line is straight in. The argument between the two
            curves ran for a decade, and they answer nearly the same thing,
            since they differ mostly in the tails.
          </p>
          <p>
            Every model before this page predicts a number, and a category
            outcome does not want one. Did the patient recover, did the
            student pass. A straight line pointed at zeros and ones predicts
            one and a half and minus two, and the difficulty underneath is
            deeper than the range. The thing being modelled is a probability,
            and no single person ever shows you one; each student either
            passed or did not, and the chance that someone studying four and a
            half hours passes has to be inferred from the students near them.
            David Cox&rsquo;s 1958 paper on the regression analysis of binary
            sequences put the logit on a line with whatever inputs a study had
            measured, and Jerome Cornfield, working with the Framingham heart
            study, fitted the multiple logistic to the risk of coronary heart
            disease from age, blood pressure, cholesterol and smoking,
            published with Truett and Kannel in 1967. That is the model a
            doctor is handed today, one slope per risk factor, and it is the
            model this page fits to twelve students and their hours. Berkson
            could not fit it the way we will, by walking down the loss, since
            the fit has no closed form and the iterations were expensive by
            hand, so he proposed a shortcut estimator instead; the walk is why
            this page follows the fitting-by-walking page. This page keeps
            four things apart that are easy to run together, modelling a
            probability, fitting the model, turning the probability into a
            decision, and judging what came out, and they arrive in that
            order.
          </p>
        </>
      }
      playground={<LogisticPlayground />}
      sections={[
        {
          title: "Part 1. From Numeric Outcomes to Categories",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. A binary prediction problem">
                <p>
                  Each dot in the box above is one student. The input x is the
                  number of hours they studied, and the outcome y is whether
                  they passed. Fails sit on the floor of the plot and passes
                  on the ceiling, because the outcome is one or the other with
                  nothing between.
                </p>
                <Equation>{"y = 1 for passed        y = 0 for failed"}</Equation>
                <p>
                  Zero and one are labels, and nothing more. Passing is not
                  one unit more than failing, and the model will not treat it
                  so. The twelve students the page works with have a mixed
                  middle. Below three and a half hours everyone failed, above
                  five and a half everyone passed, and between them the two
                  outcomes are tangled together. Someone at four and a half
                  hours might go either way, and the model is going to use the
                  hours to estimate how likely each way is.
                </p>
              </SubSection>

              <SubSection title="2. Why a straight-line prediction is not a probability">
                <p>
                  The obvious first attempt is the regression page&rsquo;s
                  line, fitted to the zeros and ones as if they were numbers.
                </p>
                <LinearProbabilityFailure />
                <p>
                  A straight line can produce any value. A probability has to
                  stay between zero and one. This line predicts −0.09 for a
                  student who studied one hour and 1.18 for one who studied
                  eight, and neither is a chance of anything. The red
                  stretches are every input at which the line has stopped
                  meaning what it was asked to mean. A probability model has
                  to return a value between zero and one for every possible
                  input, not only for the inputs it happened to see.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Score, Probability, and Decision",
          content: (
            <>
              <SubSection title="3. Score, probability, and decision">
                <p>
                  Three quantities run through this page, and keeping them
                  separate is most of understanding the model.
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
                  They are related, and each is computed from the one before,
                  and they are not the same thing. The score is what the
                  straight line produces. The probability is what the score
                  becomes. The decision is a rule laid on top of the
                  probability, and it is the only one of the three that has a
                  threshold in it.
                </p>
              </SubSection>

              <SubSection title="4. The linear score">
                <p>Start with the calculation every linear model starts with.</p>
                <Equation>{"z = β·x + α"}</Equation>
                <p>
                  z can be any real number. Under the model a positive score
                  favours passing, a negative score favours failing, and a
                  score of exactly zero is neutral. What z is not is a
                  probability. It is the familiar weighted sum, and the fitted
                  values for the twelve students are β = 1.69 and α = −7.18,
                  so a student who studied four hours scores 1.69 × 4 − 7.18 =
                  −0.40, slightly against, and one who studied five scores
                  1.29, moderately for.
                </p>
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
                  A probability of 0.75 is three passes in every four
                  students. Said the other way, it is three passes for every
                  one fail, and that is the odds, three to one.
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
                <p>
                  The intercept is the log-odds when the input is zero, and
                  the sigmoid of it is the probability there. For these
                  students that is a chance of passing of eight in ten
                  thousand with no study at all, which is the fitted
                  model&rsquo;s baseline. Its practical meaning is only as good
                  as zero is as an input. Nobody here studied zero hours, so
                  the number is the line&rsquo;s position more than a claim
                  about anyone, exactly as the regression page&rsquo;s
                  intercept of −68 kg was. Centring the hours would make the
                  intercept the log-odds at the average study time instead.
                </p>
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
                  <p>
                    The slope of the probability curve in x is dp/dx = β p(1
                    − p), which is the sigmoid&rsquo;s own derivative times
                    β. At p = 0.5 that is β / 4, so the fitted curve rises at
                    1.69 / 4 ≈ 0.42 per hour where it crosses one half, and
                    more slowly everywhere else. Section 24 derives the
                    sigmoid&rsquo;s derivative.
                  </p>
                </WhyThisWorks>
              </SubSection>
            </>
          ),
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
                <p>
                  The walk starts at α = 0, β = 0, which is a flat curve at
                  one half for everyone and a log loss of ln 2 = 0.693. It
                  heads for the bottom of the bowl at (−7.18, 1.69) and a loss
                  of 0.293. At a rate of 0.5 the first stride overshoots, the
                  loss rises to 0.743 before it falls, which the walking page
                  explained, and the climb settles after a few thousand passes.
                  Fitting logistic regression means searching parameter space
                  for the probability curve with the lowest log loss.
                </p>
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
                  The derivative is p(1 − p), largest at p = 0.5 where it is
                  exactly one quarter, and vanishing as p approaches either
                  end. The sigmoid changes fastest around one half and
                  flattens near its extremes, which is section 6 again, now
                  with the formula.
                </p>
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
                <WorkedExample title="A calibration table on the twelve, which is too few">
                  <NumberTable
                    headings={["probability bin", "students", "mean predicted p", "observed pass rate"]}
                    rows={[
                      ["0 to 0.25", "5", "0.074", "0.00"],
                      ["0.25 to 0.5", "1", "0.401", "1.00"],
                      ["0.5 to 0.75", "1", "0.610", "1.00"],
                      ["0.75 to 1", "5", "0.924", "0.80"],
                    ]}
                    caption="The shape is right at the ends and the middle bins hold one student each, which says nothing. And these are the students the curve was fitted to. Calibration has to be judged on students it never saw."
                  />
                </WorkedExample>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 11. Extending to Several Features",
          content: (
            <SubSection title="30. Extending to several features">
              <p>
                With several inputs the score is the multiple regression
                page&rsquo;s dot product, and everything after it is unchanged.
              </p>
              <Equation>{"z = β·x + α          p = σ(z)"}</Equation>
              <p>
                Each coefficient changes the log-odds while the other inputs
                are held fixed, with the same qualification about held-fixed
                comparisons the multiple regression page gave. The threshold of
                one half falls where z = 0, and with two features that is a
                line across the plane of the two inputs. With three it is a
                plane, and with more it is a flat surface in more dimensions
                than can be drawn. Adding features changes the geometry of the
                boundary and nothing about the mechanism. The{" "}
                <Link href="/concepts/multiclass-classification" className={linkClass}>
                  multiclass page
                </Link>{" "}
                takes the next step, from two classes to many.
              </p>
            </SubSection>
          ),
        },
      ]}
    />
  );
}
