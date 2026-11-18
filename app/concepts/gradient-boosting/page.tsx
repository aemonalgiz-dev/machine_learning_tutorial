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
import { BoostingPlayground } from "@/components/widgets/BoostingPlayground";
import { DescentChart } from "@/components/widgets/DescentChart";
import { LearningCurves } from "@/components/widgets/LearningCurves";
import { MemberTargets } from "@/components/widgets/MemberTargets";
import { RoundStepper } from "@/components/widgets/RoundStepper";
import {
  NOISY_THROW,
  SIXTY_THROW,
  THREE_READINGS,
} from "@/components/widgets/gradientBoostingFixtures";

export const metadata: Metadata = pageMetadata("/concepts/gradient-boosting", {
  title: "Gradient Boosting · Perceptron Lab",
  description:
    "Boosting builds a prediction in stages. Each additional model targets a correction to the current result, allowing a sequence of limited adjustments to describe a more complicated relationship.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function GradientBoostingPage() {
  return (
    <ConceptPage
      lessonId="gradient-boosting"
      intuition={lessonIntuitions["gradient-boosting"]}
      technicalStart="Part 1. Fitting What Is Still Wrong"
      openingTitle="Let the Next Tree Work on What Is Still Wrong"
      playgroundTitle="Watch each tree address the errors left behind"
      playgroundIntro="Step through the boosting rounds. Compare the current prediction, the remaining errors, and the correction supplied by the next tree."
      title="Gradient Boosting"
      tagline={"Boosting builds a prediction in stages. Each additional model targets a correction to the current result, allowing a sequence of limited adjustments to describe a more complicated relationship."}
      prerequisites={
        <>
          This page assumes{" "}
          <Link href="/concepts/bagging" className={link}>
            bagging
          </Link>{" "}
          for contrast, the{" "}
          <Link href="/concepts/decision-trees" className={link}>
            decision tree
          </Link>{" "}
          in its regression form, where a leaf answers with the mean of the
          readings it holds, and the{" "}
          <Link href="/primers/calculus" className={link}>
            calculus primer
          </Link>
          , since the word gradient in the name is earned rather than
          decorative. The{" "}
          <Link href="/concepts/held-out-evaluation" className={link}>
            held-out evaluation
          </Link>{" "}
          page&rsquo;s seeded deal is used here as an instrument and not
          explained again.
        </>
      }

      playground={<BoostingPlayground />}
      sections={[
        {
          title: "Part 1. Fitting What Is Still Wrong",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Start from the flat mean">
                <>
<p>
                  Let&apos;s start with one prediction and examine the errors it leaves behind. A boosting round fits another small model to help correct those errors. We will follow the thrown ball&apos;s measurements through successive rounds and work out why squared error leads us to fit the residuals. Then we can see what the learning rate changes.
                </p>
                <p>
                  As we add rounds, we will also need to decide how deep each tree should be and when to stop. We can check those choices on held-out data. Along the way, we will compare boosting with bagging and with AdaBoost, since growing many trees does not always mean combining them in the same way.
                </p>
</>
                <p>Let&apos;s begin with a constant prediction for the full throw. Its fifteen measured heights have a mean of 12.76 meters, so before fitting any tree the model predicts 12.76 at every time.</p>
              <p>That flat line predicts too high near launch and too low near the peak. The sum of its squared misses is 654.36. Each later boosting round will fit a correction to the mistakes left by the current prediction, so keep the prediction and the remaining errors separate.</p>
                <Equation>{"prediction₀(t) = mean of the heights\nresidualᵢ = hᵢ − prediction(tᵢ)"}</Equation>
                <p>
                  On the three readings the page works by hand, heights of
                  2, 6 and 10 at one, two and three seconds, the mean is 6
                  and the residuals are −4, 0 and 4, with squares adding to
                  32. The signs matter. A residual says how far off the
                  prediction is and in which direction, and the direction
                  is what the next round needs.
                </p>
                <KeepInMind>
                  The starting constant is the mean because the mean is the
                  single number with the smallest squared error on the
                  training heights. Under a different loss the right start
                  is different, the median for absolute error, and the
                  residuals are then measured from that instead.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A stump fitted to the misses">
                <p>A stump is a tree with one question and a constant answer on each side of the split. In squared-error boosting, its targets are the residuals: the differences between the measured heights and the current predictions. Each leaf predicts the mean residual among the readings it receives. The stump therefore estimates a correction to the current model.</p>
                <WorkedExample title="Round one on the three readings">
                  <p>
                    The residuals are −4, 0 and 4. The stump&rsquo;s best
                    question is whether t is below 1.5, which puts the −4
                    alone on the left and the 0 and 4 together on the right,
                    so it answers −4 on the left and their mean, 2, on the
                    right. At a learning rate of a half, half of each answer
                    is added to the flat 6.
                  </p>
                  <Equation>{"left:   6 + 0.5·(−4) = 4\nright:  6 + 0.5·(2)  = 7\npredictions   4, 7, 7\nresiduals     2−4, 6−7, 10−7   =   −2, −1, 3\nsquared total 4 + 1 + 9 = 14"}</Equation>
                </WorkedExample>
                <p>
                  On the full throw the first stump asks whether t is below
                  0.43, the midpoint between the second and third readings,
                  and answers −9.81 on the left, the mean of the two launch
                  residuals −12.06 and −7.56, and 1.51 on the right, the
                  mean of the other thirteen. Adding three tenths of that
                  takes the flat 12.76 to 9.82 for the two early readings
                  and 13.21 for the rest, and the squared total falls from
                  654.36 to 541.09.
                </p>
                <KeepInMind>
                  The member is fitted to the residuals and to nothing
                  else. Two rounds fitted on the same data can produce very
                  different stumps, because the residuals are different
                  data each time.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Why the miss is the direction downhill">
                <p>Why fit the residuals? Consider one reading with a fixed measured height y. If the current prediction p changes slightly, we want to know which direction reduces its squared error. That rate of change is the gradient with respect to the prediction. The error below includes a conventional factor of one half.</p>
                <Equation>{"E = ½·(y − p)²\ndE/dp = −(y − p)"}</Equation>
                <p>
                  The slope of the error with respect to the prediction is
                  minus the residual. Downhill is the direction that lowers
                  the error, which is the opposite of the slope, so downhill
                  is the residual&rsquo;s own direction and its own size. A
                  reading the committee under-predicts by 4 wants its
                  prediction raised, and the residual says 4; a reading it
                  over-predicts by 4 wants it lowered, and the residual says
                  −4.
                </p>
                <WhyThisWorks title="Where the half goes">
                  <p>Multiplying every candidate squared error by one half leaves its minimizing prediction unchanged. The factor cancels the two from differentiating the square, making the negative gradient equal to the residual. Without that factor, the gradient is twice as large and the learning-rate convention must account for it.</p>
                </WhyThisWorks>
                <KeepInMind>
                  For absolute error, a negative subgradient is the sign of the residual, with a convention needed at zero. For binary log loss differentiated with respect to the score before sigmoid, it is the label minus predicted probability. The quantity fitted in a boosting round therefore depends on both the loss and the coordinates in which we differentiate.</KeepInMind>
              </SubSection>

              <SubSection title="4. One round is one gradient step in prediction space">
                <p>Gradient descent changes a quantity in the direction that reduces an error. Here the quantities are the current predictions, one for each training reading. The symbol η controls the size of that change.</p>
                <Equation>{"p  ←  p − η·dE/dp  =  p + η·(y − p)"}</Equation>
                <>
<p>We know the residual at each training time, but a useful prediction rule must also work at other times. A stump fitted to the residuals supplies such a rule. Multiplying its output by η gives the correction added to the existing prediction. Repeating that process changes the prediction function, rather than adjusting only a fixed list of coefficients.</p>
                <p>On the three readings, the fitted stump approximates the residual vector. Adding its scaled outputs gives predictions 4, 7 and 7. A direct independent update using each exact residual would give different values; the stump restricts the correction to two constant regions.</p>
</>
                <WhyThisWorks title="Why squared error needs no separate step length per leaf">
                  <p>Friedman’s procedure fits a tree to the negative gradient, then chooses the correction in each leaf by a one-dimensional search. For squared error, the leaf’s mean residual already minimizes the error among constant corrections for that group. The fitted stump therefore supplies the best piecewise-constant correction for the chosen split before the learning rate reduces its size.</p>
                </WhyThisWorks>
                <KeepInMind>
                  A round is a single step, and nothing is refitted from
                  scratch; the previous rounds stay exactly as they were and
                  the new stump is added on top of them.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The whole recipe">
                <p>
                  With the start, the residual and the step in hand, the
                  method is four lines and a loop.
                </p>
                <Equation>{"prediction₀ = mean of the heights\nfor each round r = 1 … R\n    residualᵢ = hᵢ − prediction(tᵢ)          for every reading\n    fit a small tree to the residuals\n    prediction ← prediction + η · tree"}</Equation>
                <DerivationTable
                  expressionHeading="the line"
                  reasonHeading="what it settles"
                  rows={[
                    { expression: "the mean start", reason: "the level of the heights, so no tree has to explain it and every tree is a correction" },
                    { expression: "the residual", reason: "the negative gradient of squared error, one per reading, signed" },
                    { expression: "the small tree", reason: "an approximation to that gradient that can answer at times it did not see" },
                    { expression: "the rate η", reason: "how much of each correction to keep, the same step size the primer's walk had" },
                    { expression: "the round count R", reason: "how far to walk, and the setting Part 5 is about" },
                  ]}
                />
                <KeepInMind>
                  Nothing in the loop resamples. Every round sees every
                  reading, and what changes from round to round is the
                  target column rather than the rows, which is the fact
                  Part 6 turns on.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Watching the Rounds Assemble",
          content: (
            <>
              <SubSection title="6. Two rounds on three readings by hand">
                <p>
                  Round one left predictions of 4, 7 and 7 and residuals of
                  −2, −1 and 3. Round two fits a stump to those.
                </p>
                <WorkedExample title="Round two, and the two after it">
                  <p>
                    The best question is now whether t is below 2.5, which
                    groups the −2 and −1 on the left, mean −1.5, with the 3
                    alone on the right. Half of each is kept.
                  </p>
                  <Equation>{"left:   4 − 0.75 = 3.25     and     7 − 0.75 = 6.25\nright:  7 + 1.5  = 8.5\npredictions   3.25, 6.25, 8.5\nresiduals     −1.25, −0.25, 1.5\nsquared total 3.875"}</Equation>
                  <p>
                    Round three asks the same question, t below 2.5, answers
                    −0.75 and 1.5, and moves the predictions to 2.875, 5.875
                    and 9.25 with a squared total of 1.344. Round four goes
                    back to t below 1.5, answers −0.875 and 0.4375, and
                    leaves 0.482. Each round takes whichever of the two
                    possible questions removes more of what is left, and
                    the two alternate as the leftover shifts between the
                    ends.
                  </p>
                </WorkedExample>
                <p>
                  The stepper runs the same three readings, and the lower
                  picture shows the two-shelf stump each round fits to the
                  bars it is handed.
                </p>
                <RoundStepper
                  points={THREE_READINGS}
                  learningRate={0.5}
                  rounds={20}
                  domain={{ xMin: 0, xMax: 4, yMin: 0, yMax: 12 }}
                />
                <p>
                  The bars below carry the same run onward. Round zero is
                  the flat mean&rsquo;s leftover of 32, one round cuts it to
                  14, two leave 3.875, and by the eighteenth round the
                  leftover reads zero to six decimals, since three readings
                  at three distinct times can be matched exactly by enough
                  shelves.
                </p>
                <DescentChart />
                <KeepInMind>
                  Set the playground to the three readings, a rate of 0.50
                  and one round, then two, and the shelves pass through
                  exactly these numbers. The arithmetic here is the whole
                  method; nothing is added at scale except more readings and
                  more rounds.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The full throw, one round at a time">
                <p>
                  Now the fifteen readings at a rate of 0.3. The upper
                  picture is the committee&rsquo;s answer after the current
                  round, with the previous answer left faint behind it; the
                  lower picture is what the next round is handed, every
                  reading&rsquo;s miss as a bar, with the stump the round
                  fits to those misses drawn over them. Step forward and
                  watch the bars shrink.
                </p>
                <RoundStepper points={NOISY_THROW} learningRate={0.3} rounds={60} />
                <>
<p>
                  The first three stumps ask whether t is below 0.43, then below 3.57, then below 0.715, which is the launch, then the landing, then the launch again, because the two ends of the arc are where a flat line is most wrong and each correction leaves the other end as the largest remaining miss. The squared total goes 654.36, 541.09, 434.59, 359.77.
                </p>
                <p>

                  By ten rounds it is 111.58 and R² is 0.829; by twenty, 28.55 and 0.956; by thirty, 9.82 and 0.985; by sixty, 1.84 and 0.997. The largest single miss handed to round one was 12.06 meters and the largest handed to round sixty is 1.24.
                </p>
</>
                <KeepInMind>

                  The total squared residual decreases through these rounds, so later corrections are generally smaller. Individual residuals need not decrease in every update: observations sharing a leaf receive the same correction. The lower panel makes those remaining differences easier to inspect.</KeepInMind>
              </SubSection>

              <SubSection title="8. The leftover never grows on the training readings">
                <p>We can check the training-error claim directly. At learning rates 0.3 and 1.0, squared residual error decreases in every one of the sixty recorded rounds. At rate 1.0, it begins at 654.36, falls to 432.27 after the first round and reaches 0.77 after sixty. These runs demonstrate the decrease for these data and fitted corrections.</p>
                <WhyThisWorks title="Why a rate of one or less cannot make it worse">
                  <>
<p>
                    Inside one leaf the stump answers with the mean of the residuals there, and adding the full mean to every prediction in that leaf lowers the leaf&rsquo;s squared residual to the smallest value a single shared shift can reach. Adding a fraction η of it, for any η between 0 and 1, is somewhere between doing nothing and doing that, and squared error is a bowl, so every point on that path is at least as low as the start.
                  </p>
                  <p>A round cannot increase the training squared error under these conditions: each leaf improves or keeps its error, and the total is the sum across leaves. This argument concerns training error. It does not promise that another round helps with new observations.</p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  This is a statement about the readings the committee was
                  fitted on and about nothing else. Part 5 measures what the
                  same sequence does to readings it never saw, which is a
                  different curve with a turn in it.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. A sum of constant predictions is still a step function">
                <p>
                  The fitted curve is built entirely out of shelves, since
                  every member is a tree and a tree&rsquo;s answer is
                  constant between its thresholds. A hundred stumps hold two
                  hundred shelves between them and the arc in the playground
                  is the staircase they add up to, close enough at that
                  count to read as a curve and still a staircase.
                </p>
                <InAModel title="Beyond the last reading">
                  <p>

                    The same hundred-round fit at a rate of 0.3 answers 0.80
                    meters for any time before the launch and 1.35 meters
                    for any time after four seconds, for ever, because
                    outside the readings every stump is on its outermost
                    shelf and there is no slope anywhere in the model to
                    continue. The polynomial page&rsquo;s curve swings
                    wildly beyond the last reading and this one holds its
                    last shelf, and a reader should trust neither, since
                    each is the model&rsquo;s own shape showing where no
                    reading constrains it.
                  </p>
                </InAModel>
                <KeepInMind>
                  A sum of ordinary regression-tree outputs remains piecewise constant. Outside all their thresholds it stays on an outer constant region, so it cannot continue a numerical trend there. Aggregation can still increase the complexity of the partition compared with one member.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "A boosting round fits its member to the heights.",
              false,
              "The stump is never shown the heights. It is shown the residuals, and its whole job is to predict the current mistakes, which is why two rounds fitted on the same readings can produce very different stumps. Nothing in the loop resamples, so what changes from round to round is the target column rather than the rows.",
            ),
            choice(
              "For half the squared error, why is the residual the negative derivative with respect to the current prediction?",
              [
                "Because the slope of the error with respect to the prediction is minus the residual, so downhill is the residual's own direction and its own size",
                "Because squaring the miss makes every residual positive, and positive is downhill",
                "Because the residual is the largest number available at that reading",
                "Because a leaf answers with the mean of the residuals it holds",
              ],
              0,
              "Holding the observed height fixed, differentiate with respect to its predicted height:\n\n```math\nloss = ½ × (observed − predicted)²\nderivative = predicted − observed = −residual\n```\n\nIncreasing an underprediction moves in the negative-gradient direction. The half removes a factor of two without changing the minimizer. A stump approximates these residual targets across its leaves rather than fitting each row independently.",
            ),
            choice(
              "The first prediction on the fifteen readings is their mean height of 12.76 meters. Why the mean?",
              [
                "It is the single number with the smallest squared error on the training heights",
                "It is halfway between the lowest and the highest reading",
                "It is what the first stump would have answered anyway",
                "It is the start every loss shares, whatever the loss",
              ],
              0,
              "The starting constant is whichever single number the loss likes best, and for squared error that is the mean. Under absolute error the right start is the median instead, and the residuals are then measured from that, which is one of the places a different loss changes the recipe rather than just the arithmetic.",
            ),
            several(
              "Which of these hold for the squared leftover on the readings the committee was fitted on?",
              [
                "At a rate of 0.3 it fell at every one of the sixty rounds",
                "At a rate of 1.0 it also fell at every one, from 654.36 to 0.77 after sixty",
                "Adding a fraction of a leaf's mean residual lands somewhere between doing nothing and the lowest a single shared shift can reach",
                "The argument repeats every round, since both leaves improve or hold and the total is their sum",
              ],
              [0, 1, 2, 3],
              "All four hold. Both sequences were measured and neither ever went up, and the reason is that squared error is a bowl, so every point on the path from nothing to the full leaf mean is at least as low as the start, in each leaf and therefore in their sum. It is a statement about the training readings and nothing else, since the held-out curve in Part 5 has a turn in it.",
            ),
            trueFalse(
              "A hundred-round fit at a rate of 0.3 answers 1.35 meters for any time after four seconds, for ever.",
              true,
              "Beyond the largest observed time, every regression tree follows an outermost leaf whose value is constant. Summing these tree outputs therefore stays constant as time increases further. This model returns a value outside its training range, but cannot continue a rising or falling physical trajectory there. Boosting can combine many breakpoints; it does not create a slope outside all those breakpoints.",
            ),
        ],
        },
        {
          title: "Part 3. The Learning Rate",
          content: (
            <>
              <SubSection title="10. Keeping a fraction of each correction">
                <p>
                  A round fits a stump to the residuals and could add all of
                  it. The learning rate says how much to add instead, and
                  the effect on a single reading is easy to follow. If the
                  stump answers the residual r exactly for that reading,
                  adding η of it leaves a residual of (1 − η)·r for the next
                  round.
                </p>
                <Equation>{"residual after the round = r − η·r = (1 − η)·r"}</Equation>
                <>
<p>
                  On the three readings the launch residual of −4 became −2 after round one at a rate of a half, which is this line with η at 0.5. On the full throw the first stump is the same stump whatever the rate, t below 0.43 with answers −9.81 and 1.51, and keeping all of it leaves a squared total of 432.27 where keeping three tenths left 541.09.
                </p>
                <p>A larger learning rate applies more of the current correction. A smaller rate leaves more error for later trees to address. To compare those choices fairly, we need to examine the rate together with the number of rounds.</p>
</>
                <KeepInMind>
                  Using a rate below one applies only part of the fitted correction. In this squared-error example, the full leaf-mean correction minimizes error for the chosen leaves, so a smaller rate generally improves less in that one round. It may produce a more useful sequence after later rounds and validation.</KeepInMind>
              </SubSection>

              <SubSection title="11. Rate against rounds, measured">
                <>
<p>
                  To measure this we need readings the committee never saw, and here the fifteen-point throw is too small an instrument. The site&rsquo;s seeded deal holds out four of its fifteen readings, at 0.0, 0.29, 2.86 and 3.43 seconds, and the first two lie before the first training reading at 0.57, where the previous section showed a tree answers with a flat shelf.
                </p>
                <p>
                  The held-out score there is mostly a verdict on extrapolation, and the best any rate reached on it was 0.204. So this part and the next two use the same throw measured sixty times, the button in the playground, which the same deal cuts into forty-two training readings and eighteen held out, and whose held-out times run from 0.11 to 3.92 seconds against training times from 0.25 to 3.88.
                </p>
</>
                <LearningCurves
                  points={SIXTY_THROW}
                  configurations={[
                    { learningRate: 0.05, maxDepth: 1, label: "rate 0.05" },
                    { learningRate: 0.1, maxDepth: 1, label: "rate 0.1" },
                    { learningRate: 0.3, maxDepth: 1, label: "rate 0.3" },
                    { learningRate: 1.0, maxDepth: 1, label: "rate 1.0" },
                  ]}
                />
                <>
<p>
                  Read the table under the curves. At a rate of 1.0 the training score passes 0.95 at round 14, the held-out score is highest at round 77, where it reads 0.8985, and by round 300 it has come back down to 0.8857. At 0.3 the training score passes 0.95 at round 26, the held-out score peaks at round 217 at 0.8963 and is 0.8951 at 300.
                </p>
                <p>
                  At 0.1 the training score needs 86 rounds and the held-out score is still rising at round 300, where it reads 0.8914. At 0.05 it takes 176 rounds to train and the held-out score at 300 is 0.8794, still short of where the others got.
                </p>
</>
              </SubSection>

              <SubSection title="12. What the small rate bought here, and what it did not">
                <>
<p>Smaller learning rates are often paired with more rounds, but that does not guarantee the highest held-out score. In this experiment, the best scores for the four rates are 0.8794, 0.8914, 0.8963 and 0.8985. They differ by less than 0.02, and the largest belongs to rate 1.0. The comparison needs to be made on the stated data rather than assumed from the rate alone.</p>
                <p>Within this sweep, smaller rates delay the best observed round and can make the score change less sharply near it. At rate 1.0 the held-out score drops about 0.013 from its peak by round 300; at 0.3 it drops about 0.001. Rate 0.1 has not clearly turned within the displayed budget, so we have not established its eventual peak.</p>
</>
                <NumberTable
                  headings={["rate × rounds = 30", "rounds", "training R²", "held-out R²"]}
                  rows={[
                    ["0.1", "300", "0.9817", "0.8914"],
                    ["0.3", "100", "0.9816", "0.8924"],
                    ["1.0", "30", "0.9687", "0.8853"],
                  ]}
                  caption="Three configurations with the same product of learning rate and round count. That product is a comparison convention, not an exact traveled distance; the two smaller rates give similar scores here."
                />
                <>
<p>
                  Holding the product of rate and rounds fixed makes the trade visible. At a total step of 30 the rates of 0.1 and 0.3 come within 0.001 of each other on both scores, and 1.0 is 0.006 behind on the held-out one, so on this throw the rate and the round count trade almost one for one and the smaller rate is buying a wider, flatter plateau rather than a higher one.
                </p>
                <p>A wider plateau makes the stopping round in Part 5 less sensitive to a small change in the round count. That is the benefit observed here. Different results are possible with noisier data, more features or deeper trees, where an individual round can fit more accidental detail. Stumps fitted to a single time column give us a narrower experiment.</p>
</>
                <KeepInMind>
                  Learning rate and round count interact, but their product is not an exact measure of distance through prediction space. Compare them under the practical constraint that matters: an available training budget, a round limit or validation-selected stopping. Matching their product is one useful comparison for this demonstration.</KeepInMind>
              </SubSection>

              <SubSection title="13. Past a rate of one">
                <p>If a correction exactly matches an individual residual, a rate of 1.5 reverses that residual and leaves half its magnitude. A rate of 2.5 reverses it and increases its magnitude. For a shared leaf correction, the same factor applies to the leaf’s mean residual, rather than necessarily to every observation in the leaf.</p>
                <Equation>{"η = 1.5:   r − 1.5·r = −0.5·r\nη = 2.5:   r − 2.5·r = −1.5·r"}</Equation>
                <p>For a nonzero leaf mean under squared error, rates between one and two overshoot but still reduce the portion of error removable by that shared correction. Rates above two increase it. Individual residuals can behave differently within a leaf. This SDK permits only rates up to one, so the playground reports a validation error rather than running those larger steps.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Depth of Each Member",
          content: (
            <>
              <SubSection title="14. What a member's depth buys per round">
                <>
<p>
                  A stump adds two shelves a round. A member two questions deep can add four, and one of depth d up to 2 to the power d, so depth is how much correction a single round is allowed to express. On data with several features depth also decides whether a member can express an interaction, a rule that depends on two features at once, and a stump cannot.
                </p>
                <p>
                  The throw has one feature, time, so there is no interaction to express and depth here is purely a matter of how fast the arc is roughed out.
                </p>
</>
                <NumberTable
                  headings={["depth, rate 0.1", "training R² after one round", "held-out R² after one round"]}
                  rows={[
                    ["1", "0.0619", "−0.0641"],
                    ["2", "0.1512", "0.0423"],
                    ["3", "0.1737", "0.0826"],
                    ["4", "0.1842", "0.0875"],
                    ["6", "0.1877", "0.0900"],
                  ]}
                  caption="One round at a tenth of the correction, on the sixty-measurement throw. A deeper member takes a larger first step, and past depth three the gain is small, since one time column offers only so many shelves worth having."
                />
              </SubSection>

              <SubSection title="15. Depth measured on the throw">
                <p>
                  The same curves as before, with the rate held at 0.1 and
                  the depth varied instead.
                </p>
                <LearningCurves
                  points={SIXTY_THROW}
                  configurations={[
                    { learningRate: 0.1, maxDepth: 1, label: "depth 1" },
                    { learningRate: 0.1, maxDepth: 2, label: "depth 2" },
                    { learningRate: 0.1, maxDepth: 3, label: "depth 3" },
                    { learningRate: 0.1, maxDepth: 4, label: "depth 4" },
                  ]}
                />
                <>
<p>
                  Deeper members reach the training threshold sooner, in 86, 26, 19 and 17 rounds, and their held-out score peaks sooner too, at rounds 299, 97, 58 and 36. The peaks themselves are 0.8914, 0.8911, 0.8928 and 0.8875, so the depth changed almost nothing about how good the committee could get on this throw. What it changed was what happens afterwards.
                </p>
                <p>
                  At depth one the held-out score has not turned by round 300; at depths two, three and four it has fallen to 0.8802, 0.8783 and 0.8780, giving back 0.011, 0.015 and 0.010 of what it had reached, while the training score keeps rising towards 0.9937.
                </p>
</>
                <KeepInMind>
                  Depth and rate both set how much each round commits, and
                  the two interact. A deep member at a small rate can behave
                  like a stump at a large one, which is why the search page
                  varies them together rather than one at a time.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Why boosting wants a weak member and bagging a strong one">
                <>
<p>
                  Push depth to its limit and the reason for keeping the member weak is measured rather than argued. A member six questions deep, kept in full at a rate of 1.0, explains 0.9877 of the training spread in its first round and scores 0.8889 on the held-out readings, which is nearly the whole job done by one tree.
                </p>
                <p>The second round changes held-out R² to 0.8893. From the fifth round onward, training R² remains 0.9937 and held-out R² remains 0.8780 in the recorded run. Later corrections do not improve this fit. Repeated input times with different observed heights impose the remaining squared-error limit described next.</p>
</>
                <p>
                  The ceiling of 0.9937 is not a failure. Three of the
                  training times appear twice with different heights, at
                  0.77, 3.01 and 3.15 seconds, and no rule that reads only
                  the time can tell the two readings of a pair apart, so
                  their mean is the best any tree can do there and the
                  leftover from those pairs is permanent.
                </p>
                <KeepInMind>
                  Bagging fits its members separately and averages their outputs. Boosting fits additions to the current prediction, so later rounds can correct earlier errors. Shallow trees and smaller learning rates limit what each correction can change, but neither guarantees better validation performance. The examples compare these design choices rather than establishing one required tree depth for each method.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "On this throw a small rate with many rounds reached a higher held-out peak than a large rate with few.",
              false,
              "The best held-out scores the four rates reached were 0.8794, 0.8914, 0.8963 and 0.8985, within 0.02 of one another and increasing with the rate, so the largest belongs to the rate of 1.0. What the smaller rates changed was when the peak arrived and how gently the curve fell after it, not how high it got.",
            ),
            choice(
              "So what did the smaller rates buy here?",
              [
                "A wider, flatter plateau, which makes the stopping round far less delicate",
                "A higher held-out peak, by about 0.02 of R²",
                "Fewer rounds to reach the training threshold",
                "An out-of-bag estimate the larger rates cannot report",
              ],
              0,
              "Holding the product of rate and rounds fixed at a total step of 30 brings the rates of 0.1 and 0.3 within 0.001 of each other on both scores, so on this throw the two trade almost one for one. The textbook claim is made about tables with many features, more noise and deeper members, and none of those conditions holds for stumps on a single time column.",
            ),
            choice(
              "At a rate of 2.5 a fitted residual r is left as −1.5·r. What follows?",
              [
                "The leftover grows every round and the fit runs away",
                "The leftover shrinks by reflection rather than by approach",
                "The sign flips while the size stays exactly as it was",
                "The committee converges faster than it does at a rate of one",
              ],
              0,
              "In this hypothetical scalar correction, the new residual is the old residual multiplied by one minus the learning rate. A factor of −1.5 reverses its sign and increases its magnitude, so repeating that update diverges. The page's implementation accepts learning rates only up to one; the larger-rate example illustrates the recurrence rather than an executable supported configuration.",
            ),
            several(
              "With the rate held at 0.1 and the depth varied, which of these were measured?",
              [
                "The training threshold was reached in 86, 26, 19 and 17 rounds",
                "The held-out peaks were 0.8914, 0.8911, 0.8928 and 0.8875",
                "At depth one the held-out score had not turned by round 300",
                "Deeper members raised the held-out peak substantially",
              ],
              [0, 1, 2],
              "Depth moved the peak from round 299 to round 36 and changed almost nothing about how high it got. What it changed is what happens afterwards, since at depths two, three and four the score falls back to 0.8802, 0.8783 and 0.8780 while the training score keeps climbing towards 0.9937.",
            ),
            trueFalse(
              "The training score ceiling of 0.9937 is a property of the readings rather than of the members.",
              true,
              "Three of the training times appear twice with different heights, at 0.77, 3.01 and 3.15 seconds, and no rule that reads only the time can tell the two readings of a pair apart. Their mean is the best any tree can do there, so the leftover from those pairs is permanent, and a member six questions deep at the full rate reaches the same 0.9937 and stops there too. A deeper or stronger member would not lift it.",
            ),
        ],
        },
        {
          title: "Part 5. When to Stop",
          content: (
            <>
              <SubSection title="17. Training keeps falling, held-out turns">
                <p>
                  Section 8 showed the training leftover can only fall, and
                  the previous part showed the held-out score reaching a
                  peak. Put both on one picture, for three configurations
                  chosen because their turns are easy to see, and the
                  training scores are the dashed lines.
                </p>
                <LearningCurves
                  points={SIXTY_THROW}
                  showTraining
                  configurations={[
                    { learningRate: 1.0, maxDepth: 1, label: "rate 1.0, depth 1" },
                    { learningRate: 0.3, maxDepth: 2, label: "rate 0.3, depth 2" },
                    { learningRate: 1.0, maxDepth: 3, label: "rate 1.0, depth 3" },
                  ]}
                />
                <p>
                  Take the third configuration, depth three at the full
                  rate. Its training score is 0.914 after one round, 0.9934
                  after ten, and reaches its ceiling of 0.9937 soon after,
                  while its held-out score peaks at round 5 at 0.8963, is
                  0.8785 by round 10, and stays at 0.8780 from round 20
                  onward. The stumps at the full rate do the same thing more
                  slowly, peaking at round 77 at 0.8985 and reading 0.8857
                  at round 300 while the training score rises from 0.9819
                  to 0.9914 over the same rounds.
                </p>
                <KeepInMind>
                  The training curve is the wrong instrument for choosing the
                  round count, by construction. It falls for the same reason
                  the fit works, and it would go on falling if the heights
                  were pure noise.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Reading the stopping round">
                <>
<p>The best recorded validation rounds for the three displayed configurations are 5, 24 and 77, with scores 0.8963, 0.8915 and 0.8985. Running to round 300 instead reduces those scores by about 0.018, 0.013 and 0.013. Validation can guide stopping, but selecting the highest observed score makes this group part of model selection. Assess the selected procedure separately and account for uncertainty from the small validation group.</p>
                <p>
                  What the curves do establish is the shape, a rise, a broad top and a slow fall, and that the fall begins hundreds of rounds before the training score stops improving.
                </p>
</>
                <KeepInMind>
                  Stop where readings the committee never saw say to stop,
                  and treat the exact round as a region rather than a point.
                  A small rate makes the region wide, which is the most
                  practical thing it buys.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. No out-of-bag score here">
                <>
<p>Bagging provides out-of-bag observations because each tree omits some training rows. The boosting runs here fit every round on every row, so they do not provide the same evaluation. Set aside validation observations or use cross-validation to choose settings, then keep a separate assessment for the final model.</p>
                <p>
                  On the same forty-two training readings the deep bagged trees of Part 6 report an out-of-bag score of 0.9029 beside a held-out score of 0.8761, and the boosted stumps can report only the second.
                </p>
</>
                <p>The runs here use the full training dataset in every round. Stochastic boosting samples a fraction of rows for each round and can use the omitted rows for some diagnostics. Those diagnostics need their own interpretation because later trees depend on earlier rounds; they are not automatically the bagging procedure applied to the final ensemble.</p>
              </SubSection>

              <SubSection title="20. Rate, rounds and depth as one budget">
                <p>Learning rate controls the size of each added correction, round count controls how many are added, and tree depth controls the complexity available to each correction. These settings interact, so compare the complete fitted procedure.</p>
<p>In the measured experiment, the two smaller rates give scores within 0.001 when rate times round count is fixed. Changing depth moves the held-out peak from round 299 to round 36 without substantially raising it. A practical search can compare a few depths and rates while using a separate validation curve to choose the stopping round. Small rates and shallow trees are candidates to test, not universal requirements. The <Link href="/concepts/grid-search" className={link}>grid-search lesson</Link> explains how to evaluate such choices.</p>
                <KeepInMind>
                  More rounds is cheap to try, since a committee of k rounds
                  is the first k members of a longer one and the whole curve
                  comes from one fit. Every curve on this page is drawn that
                  way, fitting once at 300 rounds and scoring each prefix.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Boosting Beside Bagging and AdaBoost",
          content: (
            <>
              <SubSection title="21. Same target on different rows, or same rows with a changing target">
                <p>
                  Bagging and boosting both grow many trees on the same
                  readings, and what each tree is shown is the whole
                  difference. A bagged member is fitted to the heights, on a
                  resample that drew some readings twice and missed others.
                  A boosted member is fitted to every reading, on a target
                  column that is not the heights at all.
                </p>
                <MemberTargets points={SIXTY_THROW} panel="targets" />
                <>
<p>

                  The first three bagged members drew 27, 27 and 28 distinct readings of the 42, and every target they were shown is a height between 4.5 and 21.7 meters, the arc itself with some readings doubled and some absent. The first three boosted rounds were shown all 42 readings each time, and their targets are residuals, the largest 10.13, 10.60 and 8.67 meters, with squared totals of 1142.7, 952.9 and 784.6 falling round by round as the committee explains more of the arc.
                </p>
                <p>
                  Read across the bagged row and the pictures are the same shape with different readings; read across the boosted row and the readings are the same and the shape is changing.
                </p>
</>
              </SubSection>

              <SubSection title="22. Why fitting corrections changes the ensemble" id="22-averaging-cannot-add-flexibility-summing-can">
                <p>
                  Hand the two frames the same stump and the difference in
                  what they make of it is the clearest measurement on the
                  page.
                </p>
                <MemberTargets points={SIXTY_THROW} panel="curves" />
                <>
<p>

                  Fifty bagged stumps score 0.4758 on the training readings and 0.2727 held out here. Fifty boosted stumps at rate 0.3 score 0.9767 and 0.8832. Both an average and a sum of stumps can form a multi-step curve: each distinct split can add a breakpoint. The difference is how those pieces were fitted. Bagged stumps independently fit resampled original heights; each boosted stump fits errors left by the current ensemble. On this dataset, those successive corrections follow the arc much better.
                </p>
                <p>
                  Fifty deep bagged trees score 0.9849 and 0.8761, which is the frame that averages handed the member built for averaging, and it reaches the boosted stumps&rsquo; held-out score within 0.007 by the opposite route.
                </p>
</>
                <DerivationTable
                  expressionHeading="bagging"
                  reasonHeading="gradient boosting"
                  rows={[
                    { expression: "members fitted independently, in any order", reason: "members fitted in sequence, each defined by the ones before it" },
                    { expression: "each member sees a resample of the rows", reason: "each member sees every row" },
                    { expression: "each member is fitted to the heights", reason: "each member is fitted to the current residuals" },
                    { expression: "members averaged with equal weight", reason: "members summed, each scaled by the rate" },
                    { expression: "often reduces sensitivity by averaging varied fits", reason: "fits successive corrections; tree complexity remains a setting to evaluate" },
                    { expression: "more members can stabilize an average; finite accuracy can fluctuate", reason: "more rounds can overfit, so compare validation performance" },
                    { expression: "bootstrap omissions support an internal out-of-bag estimate", reason: "these full-row fits require separate validation observations" },
                  ]}
                />
              </SubSection>

              <SubSection title="23. AdaBoost reweights the rows rather than fitting residuals">
                <>
<p>AdaBoost also fits members sequentially, concentrating later work on earlier mistakes. In its usual classification form, it keeps the original labels and changes the weight given to each training row. Squared-error gradient boosting changes the target values to the current residuals instead.</p>
                <p>
                  A row the last member got wrong has its weight raised, a row it got right has its weight lowered, and the next member is fitted on the reweighted rows, so it is pulled towards the hard cases without ever seeing a residual. The members are then combined by a weighted vote in which a member that did well on its weighted rows gets a louder voice, where a boosted regression gives every round the same rate.
                </p>
</>
                <DerivationTable
                  expressionHeading="gradient boosting"
                  reasonHeading="AdaBoost"
                  rows={[
                    { expression: "the target changes each round, the rows count equally", reason: "the target is fixed, the rows' weights change each round" },
                    { expression: "the member is a regression tree, whatever the task", reason: "the member is a classifier, a stump by default" },
                    { expression: "each member added at the rate η", reason: "each member's voice set by its own weighted error" },
                    { expression: "a rate above one is refused", reason: "a member no better than guessing stops the walk" },
                    { expression: "a mislabeled target can attract repeated corrections, depending on the loss and model", reason: "a repeatedly misclassified row can gain weight; later correct classifications can lower it" },
                  ]}
                />
                <p>Friedman, Hastie and Tibshirani related AdaBoost to additive fitting under exponential loss. This explains why reweighting observations and fitting corrections can be connected through a choice of loss. The AdaBoost implementation here classifies labels, while the ball example predicts heights, so this comparison explains the procedures rather than claiming a matched experiment.</p>
              </SubSection>

              <SubSection title="24. What the three share and where they part">
                <NumberTable
                  headings={["", "bagging", "gradient boosting", "AdaBoost"]}
                  rows={[
                    ["members fitted", "in parallel", "in sequence", "in sequence"],
                    ["what a member sees", "a resample of the rows", "every row, the residuals", "every row, reweighted"],
                    ["members used in these examples", "deep trees", "shallow regression trees", "stump classifiers"],
                    ["how members combine", "equal average", "sum at the rate", "weighted vote"],
                    ["what it attacks", "variance", "bias", "bias"],
                    ["internal evaluation in these examples", "out-of-bag estimate", "separate validation", "separate validation"],
                  ]}
                />
                <KeepInMind>
                  An ensemble combines several fitted predictors. Its behavior depends on both how those predictors are trained and how their outputs are combined. Averaging independent fits can reduce sample sensitivity; fitting successive corrections changes what the later members learn. Neither construction divides all error neatly into one half that it alone can fix.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            trueFalse(
              "The training curve can choose the round count, provided it is read carefully.",
              false,
              "It is the wrong instrument by construction, because it falls for the same reason the fit works and would go on falling if the heights were pure noise. On these configurations the held-out fall begins hundreds of rounds before the training score stops improving, so only readings the committee never saw can say where to stop.",
            ),
            choice(
              "Why can the committees on this page report no out-of-bag estimate?",
              [
                "Every round is fitted on every row, so no member has a row it never saw",
                "The targets are residuals rather than heights, so the estimate would be in the wrong units",
                "The committee is piecewise constant, and the estimate needs a slope",
                "The round count is too large for the estimate to be computed",
              ],
              0,
              "Every tree in this implementation is fitted using all training rows, so there is no bootstrap omission set for a bagging-style out-of-bag prediction. The separate held-out set is still available for evaluation. Stochastic boosting can omit rows at individual rounds and use those omissions to monitor improvement, but later residuals depend on earlier fitted stages; that is not automatically the same estimate as independent bagging votes.",
            ),
            choice(
              "Both ensembles use fifty one-question regression trees, yet boosting predicts this arc much better. Which description correctly distinguishes how they were trained?",
              [
                "Bagging independently fits resampled original targets; boosting fits each new stump to residuals of the current ensemble",
                "Every boosted stump independently fits the same original heights",
                "The boosted members were allowed more depth",
                "The bagged members were combined by a weighted vote rather than a plain average",
              ],
              0,
              "Averages and sums of one-dimensional stumps can both have several breakpoints. Boosting's later stumps are fitted to the current residuals, so they address errors the earlier combination still makes. Bagging fits original targets on separate resamples. Their different results here follow from those procedures, not a two-step-versus-hundred-step expressiveness rule.",
            ),
            several(
              "Which of these describe AdaBoost rather than the boosted regression on this page?",
              [
                "Every round is fitted to the same labels, and what changes between rounds is how much each row counts",
                "A row the last member got wrong has its weight raised and a row it got right has its weight lowered",
                "Every round is added with the same rate, whatever it got right",
                "Each member is fitted to what the members before it left over",
              ],
              [0, 1],
              "In the usual discrete AdaBoost procedure, each round fits the original class labels with updated observation weights, and the final class decision combines weighted member votes. This squared-error boosting procedure fits residual targets and adds each tree with the stated learning rate. Both are stagewise additive methods, but the loss and fitting procedure determine how observations and members are weighted.",
            ),
            trueFalse(
              "How models are combined influences which base-model settings are useful for the ensemble.",
              true,
              "Bagging often benefits from data-sensitive trees because averaging can reduce their variability. Boosting fits each new tree to remaining errors, so later rounds can correct earlier predictions; they do not simply preserve every earlier mistake. Shallow trees and small learning rates can control the size of each correction, but deeper members can also be appropriate. Choose these settings through validation of the combined model.",
            ),
        ],
        },
        {
          title: "Part 7. Reproducing the Sequence of Residual Fits" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="25. The loss, starting prediction and rules for each tree" id="25-what-a-complete-implementation-must-specify">
                <p>Before comparing two boosting runs, check the loss and the starting prediction. Ordinary residuals give the negative gradient for squared error; a different loss can change both the initial constant and the quantities each tree must fit.</p>
                <p>Then compare the trees and updates: maximum depth, minimum rows in a split and leaf, round count, learning rate and its permitted range. Some procedures search for a step length in each fitted leaf, while others keep the leaf mean. That choice changes the correction added to the model.</p>
                <p>Check whether rows are subsampled and what any omitted-row diagnostic actually estimates. Also check whether a shorter fit reproduces the start of a longer one and how queries outside the observed time range are handled. Two implementations called boosting can differ on these choices.</p>
              </SubSection>

              <SubSection title="26. What happens when another boosting round cannot help?" id="26-the-edges-probed">
                <p>The table records the behavior checked in the SDK and, where the page accepts the input, in the interactive example. An accepted fit can still give an unhelpful result, so validation errors and prediction behavior both matter.</p>
                <DerivationTable
                  expressionHeading="Training data or boosting setting"
                  reasonHeading="What happens during fitting"
                  rows={[
                    { expression: "no features, or an empty column", reason: "refused by name before any round runs, by the guard every model here shares." },
                    { expression: "a single reading", reason: "accepted. The mean is the reading, every member is one leaf, the committee answers that height everywhere, and asking for R² is refused because a single height has no spread to explain. This page's door refuses it a layer earlier, at two readings." },
                    { expression: "two readings", reason: "with distinct input times and different target heights, a rate-one stump can separate the two and gives R² of 1.0 after one round." },
                    { expression: "every height the same", reason: "accepted as a fit, the committee predicts that height and every member is a single leaf; scoring it is refused, since R² is undefined with nothing to explain. That refusal reaches the page unchanged, in the words it was raised in." },
                    { expression: "every time the same", reason: "accepted. No question can separate the readings, every member is a single leaf answering zero, the committee predicts the mean height and R² is exactly 0.0." },
                    { expression: "two readings at one time with different heights", reason: "the pair cannot be distinguished by time alone. In the forty-round example, heights 4 and 8 at two seconds both receive prediction 6.0. Their conflicting targets leave a residual error that a time-only rule cannot remove." },
                    { expression: "a non-finite height or time", reason: "refused as not finite. This page's door refuses it first, since a non-finite number fails its magnitude bound." },
                    { expression: "a learning rate above 1, or of 0", reason: "refused when the committee is constructed, before any data is seen. That refusal comes from construction rather than from reading data, which is why a rate past 1 is refused in this page's own words rather than handed on." },
                    { expression: "zero rounds, or a depth of 0", reason: "refused at construction for the same reason." },
                    { expression: "a leaf minimum larger than the reading count", reason: "accepted. No eligible split is possible, so each correction is a zero leaf and the fitted prediction remains the training mean. For a nonconstant target its training R² is 0.0." },
                    { expression: "more rounds than the door allows", reason: "refused at the door, at 300 for a fit and at 60 for the stepper, which lays every round out and is about the early ones." },
                    { expression: "predicting before fitting", reason: "refused by name, with the model's own name in the message." },
                    { expression: "a feature named differently at prediction", reason: "refused by name; the message says which names were expected and which arrived." },
                    { expression: "a time outside the readings", reason: "accepted, and answered with the outermost shelf for ever, 0.80 meters before the launch and 1.35 after four seconds on the hundred-round fit." },
                    { expression: "a committee cut to fewer rounds", reason: "identical to a fresh fit of that many rounds, to the last bit, because each round depends only on the rounds before it. The learning curves rely on this and a test pins it." },
                  ]}
                />
                <p>A large minimum leaf size can leave every correction at zero, so the fitted prediction remains the learned training mean. That is still a fitted baseline, even though no split was possible. The learning-rate bounds are checked when the model is constructed. Distinguish those setting checks from conditions that depend on the supplied observations.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Practice. Fitting the Throw Round by Round With the Library",
          practice: [
            exercise("Run the first round on the fifteen readings",["Fit GradientBoostingRegressor to the fifteen throw readings with n_rounds=1, learning_rate=0.3 and max_depth=1. This starts with a constant prediction and fits one stump to the remaining errors.", "Print initial_prediction, the first stump's split threshold and its two leaf predictions. Evaluate the model on these readings and print the residual sum of squares and R². Compare the leaf corrections with the initial model's residuals."],`from oop_ml import Feature, GradientBoostingRegressor

times = Feature("t", [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0])
heights = Feature("h", [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2])

model = GradientBoostingRegressor(n_rounds=1, learning_rate=0.3, max_depth=1)
# Fit the model, print its starting constant, the first member's threshold and
# its two leaf answers, then the residual sum of squares and R squared on the
# readings, each to two places except R squared to three.`,`from oop_ml import Feature, GradientBoostingRegressor

times = Feature("t", [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0])
heights = Feature("h", [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2])

model = GradientBoostingRegressor(n_rounds=1, learning_rate=0.3, max_depth=1)
model.fit([times], heights)

print(f"starting constant {model.initial_prediction:.2f}")
stump = model.members[0].root
print(f"first stump asks t < {stump.split.threshold:.2f}")
print(f"answers {stump.left.prediction:.2f} on the left and {stump.right.prediction:.2f} on the right")

evaluation = model.evaluate([times], heights)
print(f"squared total after one round {evaluation.residual_sum_of_squares:.2f}")
print(f"R squared after one round {evaluation.r2_score:.3f}")`,`starting constant 12.76
first stump asks t < 0.43
answers -9.81 on the left and 1.51 on the right
squared total after one round 541.09
R squared after one round 0.173`,{...{ hints: ["A stump is a tree whose max_depth is 1, and the member depth is a field on the boosting model itself. The rate and the round count are the other two fields, and the data goes to fit.", "initial_prediction is the flat start, a property of the fitted model. members is a tuple of the fitted trees in order, so the first round’s stump is at position zero.", "A tree’s root is a node holding a split with a threshold, and a stump’s root has a leaf on each side, each answering with a prediction. The left leaf answers strictly below the threshold.", "evaluate pairs every prediction with its reading and exposes residual_sum_of_squares and r2_score as properties."], check: numberCheck("What squared total does the committee leave after one round, to two places?", 541.09, 0.005, "The initial constant is the training mean, and the first stump is fitted to its residuals. Adding a learning-rate-scaled correction reduces the training residual sum of squares; the reported R squared measures that reduction against the constant baseline.") },question:"What does the first correction learn from the ball's prediction errors?"}),
            exercise("Watch the squared leftover fall",["Fit fresh stump-based boosting models with 10, 20, 30 and 60 rounds at learning_rate=0.3. Print training residual sum of squares and R² for each.", "Repeat with 60 rounds at learning_rate=1.0. Keep the data and maximum tree depth fixed. These deterministic fits share the same initial rounds when their settings match, so comparing round budgets is equivalent to inspecting stages of the same procedure."],`from oop_ml import Feature, GradientBoostingRegressor

times = Feature("t", [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0])
heights = Feature("h", [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2])

# For 10, 20, 30 and 60 rounds at a rate of 0.3, fit a committee of stumps and
# print its squared total to two places and its R squared to three. Then do
# the same for sixty rounds at a rate of 1.0.`,`from oop_ml import Feature, GradientBoostingRegressor

times = Feature("t", [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0])
heights = Feature("h", [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2])

for rounds in (10, 20, 30, 60):
    model = GradientBoostingRegressor(n_rounds=rounds, learning_rate=0.3, max_depth=1)
    evaluation = model.fit([times], heights).evaluate([times], heights)
    print(f"rate 0.3, {rounds} rounds: squared total {evaluation.residual_sum_of_squares:.2f}, "
          f"R squared {evaluation.r2_score:.3f}")

full = GradientBoostingRegressor(n_rounds=60, learning_rate=1.0, max_depth=1)
evaluation = full.fit([times], heights).evaluate([times], heights)
print(f"rate 1.0, 60 rounds: squared total {evaluation.residual_sum_of_squares:.2f}, "
      f"R squared {evaluation.r2_score:.4f}")`,`rate 0.3, 10 rounds: squared total 111.58, R squared 0.829
rate 0.3, 20 rounds: squared total 28.55, R squared 0.956
rate 0.3, 30 rounds: squared total 9.82, R squared 0.985
rate 0.3, 60 rounds: squared total 1.84, R squared 0.997
rate 1.0, 60 rounds: squared total 0.77, R squared 0.9988`,{...{ hints: ["fit answers the fitted model itself, so a fit and an evaluate can be chained on one line.", "The round count and the rate are fields of the constructor, so a loop over round counts constructs a fresh model each time.", "R squared is one minus the squared total over the flat mean’s 654.36, so the two numbers on each line are the same miss in different units."], check: numberCheck("What R squared does the sixty-round committee at a rate of 1.0 reach on the readings, to four places?", 0.9988, 5e-05, "These additional rounds reduce error on the readings used to fit them. The high training score does not establish a good forecast or held-out result; those require separate evaluation.") },question:"How do additional boosting rounds change the training error?"}),
            exercise("Give the committee two readings at one time",["Use times [1, 2, 2, 3] with heights [2, 4, 8, 10]. Fit forty boosting rounds with learning_rate=0.5 and max_depth=1. The repeated time has two different recorded heights; inspect whether the model can give those rows different predictions.", "Print the time, measured height and prediction for each row, followed by R² and the residual sum of squares. A deterministic model using only time must assign the same prediction to both rows at time two."],`from oop_ml import Feature, GradientBoostingRegressor

times = Feature("t", [1, 2, 2, 3])
heights = Feature("h", [2, 4, 8, 10])

model = GradientBoostingRegressor(n_rounds=40, learning_rate=0.5, max_depth=1)
# Fit the model, print its prediction at each reading to two places, then its
# R squared to two places and its squared total to two places.`,`from oop_ml import Feature, GradientBoostingRegressor

times = Feature("t", [1, 2, 2, 3])
heights = Feature("h", [2, 4, 8, 10])

model = GradientBoostingRegressor(n_rounds=40, learning_rate=0.5, max_depth=1)
model.fit([times], heights)

for time, height, predicted in zip(times.values, heights.values, model.predict([times])):
    print(f"t = {time:.0f}, reading {height:.0f}, prediction {predicted:.2f}")

evaluation = model.evaluate([times], heights)
print(f"R squared {evaluation.r2_score:.2f}")
print(f"squared total {evaluation.residual_sum_of_squares:.2f}")`,`t = 1, reading 2, prediction 2.00
t = 2, reading 4, prediction 6.00
t = 2, reading 8, prediction 6.00
t = 3, reading 10, prediction 10.00
R squared 0.80
squared total 8.00`,{...{ hints: ["predict answers one prediction per reading in the order the readings were given, and a feature’s values are the numbers it was built from, so the three can be zipped together.", "The pair at two seconds lands in the same leaf of every stump, since no threshold on time separates them, so every round gives both the same correction.", "The squared total is the two misses of 2 each, squared and summed, and R squared is one minus that over the spread of the four heights about their mean."], check: numberCheck("What R squared does the committee reach on the four readings, to two places?", 0.8, 0.005, "The two observations at the same input must receive the same prediction from a deterministic time-only rule. Their different heights leave an irreducible contribution to squared error unless more informative inputs are supplied.") },question:"Can a model distinguish two heights recorded at the same time?"}),
            exercise("Hand the same stump to both frames",["Use the supplied seeded split of sixty throw readings into forty-two training rows and eighteen held-out rows. Fit fifty bagged stumps, fifty bagged unrestricted trees and fifty boosted stumps at learning_rate=0.3.", "Print each model's training and held-out R² to four decimal places, then the unrestricted bagging model's out-of-bag score. Compare their results on the same held-out observations rather than their training fits alone."],`import numpy as np
from oop_ml import BaggingRegressor, DecisionTreeRegressor, Feature, GradientBoostingRegressor

times = [0.11, 0.16, 0.25, 0.33, 0.46, 0.54, 0.58, 0.59, 0.64, 0.77, 0.77, 0.81, 1.04, 1.05, 1.11, 1.12, 1.21, 1.25, 1.32, 1.61, 1.64, 1.69, 1.81, 1.84, 1.89, 1.94, 2.04, 2.04, 2.05, 2.06, 2.11, 2.15, 2.16, 2.2, 2.37, 2.45, 2.49, 2.57, 2.73, 2.9, 3.0, 3.01, 3.01, 3.11, 3.15, 3.15, 3.21, 3.28, 3.31, 3.36, 3.41, 3.42, 3.45, 3.51, 3.67, 3.79, 3.8, 3.85, 3.88, 3.92]
heights = [1.7, 3.2, 5.1, 4.6, 6.5, 9.7, 9.3, 10.4, 11.9, 10.0, 12.9, 14.8, 15.1, 14.4, 17.3, 16.6, 18.4, 16.8, 15.6, 19.3, 19.0, 21.0, 20.4, 17.8, 18.5, 21.7, 21.4, 19.4, 20.4, 21.1, 21.1, 21.7, 20.7, 20.1, 19.5, 21.2, 16.0, 18.8, 18.1, 14.7, 16.4, 14.8, 17.1, 14.6, 15.4, 16.2, 14.3, 11.6, 10.2, 14.5, 11.1, 10.1, 10.9, 9.5, 8.7, 5.5, 5.3, 3.3, 4.5, 1.6]

held = set(np.random.default_rng(4).permutation(60)[:18].tolist())
train_t = Feature("t", [t for i, t in enumerate(times) if i not in held])
train_h = Feature("h", [h for i, h in enumerate(heights) if i not in held])
test_t = Feature("t", [t for i, t in enumerate(times) if i in held])
test_h = Feature("h", [h for i, h in enumerate(heights) if i in held])

# Fit fifty bagged stumps and fifty deep bagged trees under seed 7, and fifty
# boosted stumps at a rate of 0.3, then print each committee's training and
# held-out score to four places and the deep trees' out-of-bag score.`,`import numpy as np
from oop_ml import BaggingRegressor, DecisionTreeRegressor, Feature, GradientBoostingRegressor

times = [0.11, 0.16, 0.25, 0.33, 0.46, 0.54, 0.58, 0.59, 0.64, 0.77, 0.77, 0.81, 1.04, 1.05, 1.11, 1.12, 1.21, 1.25, 1.32, 1.61, 1.64, 1.69, 1.81, 1.84, 1.89, 1.94, 2.04, 2.04, 2.05, 2.06, 2.11, 2.15, 2.16, 2.2, 2.37, 2.45, 2.49, 2.57, 2.73, 2.9, 3.0, 3.01, 3.01, 3.11, 3.15, 3.15, 3.21, 3.28, 3.31, 3.36, 3.41, 3.42, 3.45, 3.51, 3.67, 3.79, 3.8, 3.85, 3.88, 3.92]
heights = [1.7, 3.2, 5.1, 4.6, 6.5, 9.7, 9.3, 10.4, 11.9, 10.0, 12.9, 14.8, 15.1, 14.4, 17.3, 16.6, 18.4, 16.8, 15.6, 19.3, 19.0, 21.0, 20.4, 17.8, 18.5, 21.7, 21.4, 19.4, 20.4, 21.1, 21.1, 21.7, 20.7, 20.1, 19.5, 21.2, 16.0, 18.8, 18.1, 14.7, 16.4, 14.8, 17.1, 14.6, 15.4, 16.2, 14.3, 11.6, 10.2, 14.5, 11.1, 10.1, 10.9, 9.5, 8.7, 5.5, 5.3, 3.3, 4.5, 1.6]

held = set(np.random.default_rng(4).permutation(60)[:18].tolist())
train_t = Feature("t", [t for i, t in enumerate(times) if i not in held])
train_h = Feature("h", [h for i, h in enumerate(heights) if i not in held])
test_t = Feature("t", [t for i, t in enumerate(times) if i in held])
test_h = Feature("h", [h for i, h in enumerate(heights) if i in held])

stump = DecisionTreeRegressor(max_depth=1)
committees = (
    ("bagged stumps", BaggingRegressor(n_members=50, random_seed=7, base_model=stump)),
    ("deep bagged trees", BaggingRegressor(n_members=50, random_seed=7)),
    ("boosted stumps", GradientBoostingRegressor(n_rounds=50, learning_rate=0.3, max_depth=1)),
)
for name, committee in committees:
    committee.fit([train_t], train_h)
    print(f"{name}: training {committee.score([train_t], train_h):.4f}, "
          f"held out {committee.score([test_t], test_h):.4f}")

print(f"deep bagged trees, out of bag {committees[1][1].out_of_bag_score():.4f}")`,`bagged stumps: training 0.4758, held out 0.2727
deep bagged trees: training 0.9849, held out 0.8761
boosted stumps: training 0.9767, held out 0.8832
deep bagged trees, out of bag 0.9029`,{...{ hints: ["The bagging frame takes a base_model, the prototype every member copies, and its default is a deep tree. A stump handed in makes every member a stump. The boosting model takes its member depth as a field of its own.", "Each model fits the single time input Feature against the height target. Use score with either the training time/height pair or the held-out pair to obtain R².", "out_of_bag_score exists on the bagged committees only, because every boosted round is fitted on every row and so no member has a row it never saw."], check: numberCheck("What held-out R squared do the fifty boosted stumps reach, to four places?", 0.8832, 5e-05, "Boosting fits later stumps to the errors of the current ensemble, while bagging averages stumps fitted independently to resampled targets. Either combination can have several breakpoints; the difference here is how those stumps are fitted and combined. The reported advantage belongs to this shared held-out split.") },question:"How do bagged and boosted trees compare on the same held-out readings?"}),
          ],
        },
      ]}
    />
  );
}
