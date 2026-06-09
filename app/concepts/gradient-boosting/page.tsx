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

export const metadata: Metadata = {
  title: "Gradient Boosting · oop_ml",
  description:
    "Grow small trees in sequence, each fitted to whatever the committee so far still gets wrong, and keep only a fraction of every correction.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function GradientBoostingPage() {
  return (
    <ConceptPage
      title="Gradient Boosting"
      tagline="Small trees grown in sequence, each fitted to whatever the committee so far still gets wrong."
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
      history={
        <>
          <p>
            The question came out of learning theory before anyone had a
            method. Michael Kearns and Leslie Valiant at Harvard asked, in
            1988 and 1989, whether a learner that was only slightly better
            than guessing could be turned into one that was as accurate as
            we liked, and the honest position at the time was that nobody
            knew. Robert Schapire answered yes in 1990, in a paper called
            &ldquo;The strength of weak learnability&rdquo;, with a
            construction that combined weak learners recursively and proved
            the point without being anything a practitioner would run. The
            practical version was AdaBoost, from Yoav Freund and Schapire at
            AT&amp;T Bell Laboratories in 1995, which fits a weak classifier,
            raises the weight of every example it got wrong, fits the next
            classifier on the reweighted examples, and combines them by a
            weighted vote. It worked far better than its own theory could
            explain, and the difficulty of the late 1990s was exactly that.
            The test error kept falling long after the training error had
            reached zero, which every account of overfitting said it should
            not do, and nobody could say what quantity the procedure was
            actually minimising.
          </p>
          <p>
            Three groups reached the same answer at nearly the same time.
            Leo Breiman at Berkeley argued in &ldquo;Arcing classifiers&rdquo;
            in 1998 and in a 1999 paper on prediction games that boosting was
            an optimisation carried out over functions rather than over
            parameters. Jerome Friedman, Trevor Hastie and Robert Tibshirani
            at Stanford showed in &ldquo;Additive logistic regression: a
            statistical view of boosting&rdquo;, published in 2000, that
            AdaBoost was fitting an additive model one term at a time under
            a particular loss, the exponential one, and that the reweighting
            was what that loss looked like from inside. Llew Mason, Jonathan
            Baxter, Peter Bartlett and Marcus Frean at the Australian
            National University said the same in &ldquo;Boosting algorithms
            as gradient descent&rdquo; in 1999. Once the loss was visible the
            recipe could be written for any loss at all, and Friedman did so
            in a 1999 technical report published in 2001 as &ldquo;Greedy
            function approximation: a gradient boosting machine&rdquo;.
            Each round fits a small regression tree to the negative gradient
            of the loss with respect to the current predictions, adds a
            fraction of it, and repeats.
          </p>
          <p>
            That generalisation is what makes this page possible, because
            AdaBoost was a classifier and the thrown ball is a regression.
            Under squared error the negative gradient is the plain residual,
            the height the ball reached less the height the committee so far
            predicts, so the general method reduces to fitting each tree to
            what is still wrong, and that is the form the page works by
            hand. The name is Friedman&rsquo;s, and the modern descendants
            that changed the recipe least and its engineering most, XGBoost
            in 2016 among them, are still fitting trees to gradients.
          </p>
        </>
      }
      playground={<BoostingPlayground />}
      sections={[
        {
          title: "Part 1. Fitting What Is Still Wrong",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Start from the flat mean">
                <p>
                  The page answers six questions in order. What does one
                  round of boosting actually fit, and why is the miss on
                  each reading the direction in which the error falls
                  fastest? How do stumps, each nearly useless alone,
                  assemble into the arc of the throw, and what happens to
                  the misses as they do? What does the learning rate change,
                  and is a small rate with more rounds really the better
                  model once it is measured? How deep should each member
                  be? When do we stop adding rounds, and how would we know?
                  And how does this differ from bagging, which also grows
                  many trees, and from AdaBoost, which also grows them in
                  sequence?
                </p>
                <p>
                  Everything starts from the laziest possible model. The
                  fifteen readings of the full throw have a mean height of
                  12.76 metres, so the first prediction is 12.76 at every
                  time, before any tree exists. That flat line misses the
                  reading at the launch by 12.06 metres, since the ball was
                  at 0.7, and misses the reading at two seconds by 8.24 in
                  the other direction, since the ball was at 21.0. Squaring
                  the fifteen misses and adding them up gives 654.36, which
                  is what every later round is trying to bring down.
                </p>
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
                <p>
                  A stump is a tree one question deep. It asks whether the
                  time is below some threshold and answers with one number
                  on each side, the mean of whatever it was fitted to among
                  the readings on that side. The first thing to notice about
                  a boosting round is that the stump is never shown the
                  heights. It is shown the residuals, and its whole job is
                  to predict the current mistakes.
                </p>
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
                <p>
                  Fitting the residual looks like a rule of thumb, and the
                  word gradient in the name is the claim that it is more
                  than that. Take one reading, hold its true height y still,
                  and ask how the squared error changes as the
                  committee&rsquo;s prediction p for that reading moves. The
                  error is the squared miss with the conventional half in
                  front.
                </p>
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
                  <p>
                    Differentiating (y − p)² by the chain rule gives
                    2·(y − p)·(−1), and the 2 is a nuisance that would ride
                    along into every round. Putting a half in front of the
                    error cancels it, so the derivative comes out as a clean
                    subtraction. Halving the error changes nothing about
                    where its minimum is, since every candidate p is halved
                    alike, so the convention is free. The calculus primer
                    made the same bookkeeping choice for the same reason.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  This is the squared-error case. For absolute error the
                  negative gradient is the sign of the miss, +1 or −1, and
                  for log loss on a classifier it is the label less the
                  predicted probability. The recipe fits whatever the
                  negative gradient is; only for squared error is that the
                  plain residual.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. One round is one gradient step in prediction space">
                <p>
                  The calculus primer walked downhill on a curve by moving a
                  setting a fraction of the slope in the downhill direction.
                  Here the thing being moved is the prediction itself, one
                  per reading, rather than a setting, and a step of size η
                  reads as follows.
                </p>
                <Equation>{"p  ←  p − η·dE/dp  =  p + η·(y − p)"}</Equation>
                <p>
                  That is exactly what a round does, with one substitution.
                  The residual y − p is known for every training reading, and
                  a stump fitted to those residuals is a rule that can say
                  approximately what the residual is for any time, the
                  readings it saw and the times between them alike. So the
                  stump stands in for the gradient, η times its answer is
                  the step, and the walk takes place in the space of
                  possible prediction rules rather than in the space of a
                  few coefficients. On the three readings the step from 6
                  to 4 and 7 was this line applied by hand.
                </p>
                <WhyThisWorks title="Why squared error needs no separate step length per leaf">
                  <p>
                    Friedman&rsquo;s general recipe fits the tree to the
                    gradient and then chooses the best number for each leaf
                    by a small one-dimensional search. Under squared error
                    that search is already done, because a regression
                    leaf&rsquo;s answer is the mean of the residuals it
                    holds and the mean is precisely the constant minimising
                    squared error over those readings. So the fitted stump
                    is the best two-shelf correction there is, before the
                    rate is applied, and the rate is the only dial left.
                  </p>
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
          ),
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
                <p>
                  The first three stumps ask whether t is below 0.43, then
                  below 3.57, then below 0.715, which is the launch, then
                  the landing, then the launch again, because the two ends
                  of the arc are where a flat line is most wrong and each
                  correction leaves the other end as the largest remaining
                  miss. The squared total goes 654.36, 541.09, 434.59,
                  359.77. By ten rounds it is 111.58 and R² is 0.830; by
                  twenty, 28.55 and 0.956; by thirty, 9.82 and 0.985; by
                  sixty, 1.84 and 0.997. The largest single miss handed to
                  round one was 12.06 metres and the largest handed to round
                  sixty is 1.24.
                </p>
                <KeepInMind>
                  Every stump in the sequence is fitted to a different
                  target column, and the columns get smaller. Round sixty is
                  fitting metres and tenths of metres where round one was
                  fitting tens, which is why the late shelves are hard to
                  see on the upper picture and easy to see on the lower one.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The leftover never grows on the training readings">
                <p>
                  A claim worth checking rather than trusting. At a rate of
                  0.3 the squared leftover on the fifteen readings fell at
                  every one of the sixty rounds, and at a rate of 1.0 it fell
                  at every one as well, from 654.36 to 432.27 after the first
                  round and to 0.77 after sixty. I measured both sequences
                  and neither ever went up.
                </p>
                <WhyThisWorks title="Why a rate of one or less cannot make it worse">
                  <p>
                    Inside one leaf the stump answers with the mean of the
                    residuals there, and adding the full mean to every
                    prediction in that leaf lowers the leaf&rsquo;s squared
                    residual to the smallest value a single shared shift can
                    reach. Adding a fraction η of it, for any η between 0
                    and 1, is somewhere between doing nothing and doing
                    that, and squared error is a bowl, so every point on
                    that path is at least as low as the start. Both leaves
                    improve or hold, the total is their sum, and the
                    argument repeats every round.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  This is a statement about the readings the committee was
                  fitted on and about nothing else. Part 5 measures what the
                  same sequence does to readings it never saw, which is a
                  different curve with a turn in it.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. A sum of shelves cannot bend or extrapolate">
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
                    metres for any time before the launch and 1.35 metres
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
                  Boosting inherits every limit of its member. A boosted
                  committee of trees is piecewise constant and cannot
                  extrapolate, however many rounds it runs.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                <p>
                  On the three readings the launch residual of −4 became −2
                  after round one at a rate of a half, which is this line
                  with η at 0.5. On the full throw the first stump is the
                  same stump whatever the rate, t below 0.43 with answers
                  −9.81 and 1.51, and keeping all of it leaves a squared
                  total of 432.27 where keeping three tenths left 541.09.
                  The larger rate takes more of the correction now, and the
                  question the rest of this part asks is whether taking
                  less now and more rounds later ends somewhere better.
                </p>
                <KeepInMind>
                  A rate below one does not make any single round worse at
                  its job. It makes the committee commit to less of each
                  round&rsquo;s opinion, which is shrinkage in the sense the
                  ridge page used the word.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Rate against rounds, measured">
                <p>
                  To measure this we need readings the committee never saw,
                  and here the fifteen-point throw is too small an
                  instrument. The site&rsquo;s seeded deal holds out four of
                  its fifteen readings, at 0.0, 0.29, 2.86 and 3.43 seconds,
                  and the first two lie before the first training reading at
                  0.57, where the previous section showed a tree answers
                  with a flat shelf. The held-out score there is mostly a
                  verdict on extrapolation, and the best any rate reached on
                  it was 0.204. So this part and the next two use the same
                  throw measured sixty times, the button in the playground,
                  which the same deal cuts into forty-two training readings
                  and eighteen held out, and whose held-out times run from
                  0.11 to 3.92 seconds against training times from 0.25 to
                  3.88.
                </p>
                <LearningCurves
                  points={SIXTY_THROW}
                  configurations={[
                    { learningRate: 0.05, maxDepth: 1, label: "rate 0.05" },
                    { learningRate: 0.1, maxDepth: 1, label: "rate 0.1" },
                    { learningRate: 0.3, maxDepth: 1, label: "rate 0.3" },
                    { learningRate: 1.0, maxDepth: 1, label: "rate 1.0" },
                  ]}
                />
                <p>
                  Read the table under the curves. At a rate of 1.0 the
                  training score passes 0.95 at round 14, the held-out score
                  is highest at round 77, where it reads 0.8985, and by
                  round 300 it has come back down to 0.8857. At 0.3 the
                  training score passes 0.95 at round 26, the held-out score
                  peaks at round 217 at 0.8963 and is 0.8951 at 300. At 0.1
                  the training score needs 86 rounds and the held-out score
                  is still rising at round 300, where it reads 0.8914. At
                  0.05 it takes 176 rounds to train and the held-out score
                  at 300 is 0.8794, still short of where the others got.
                </p>
              </SubSection>

              <SubSection title="12. What the small rate bought here, and what it did not">
                <p>
                  The usual claim is that a small rate with many rounds
                  beats a large rate with few, and I measured it on this
                  throw and found that it did not hold. The best held-out
                  scores the four rates reached were 0.8794, 0.8914, 0.8963
                  and 0.8985, within 0.02 of one another and increasing with
                  the rate, and the largest of them belongs to the rate of
                  1.0. What the smaller rates changed was not the height of
                  the peak; it was when the peak came and how gently the
                  curve fell after it. At 1.0 the score had given back 0.013
                  by round 300, at 0.3 it had given back 0.001, and at 0.1 it
                  had not turned at all.
                </p>
                <NumberTable
                  headings={["rate × rounds = 30", "rounds", "training R²", "held-out R²"]}
                  rows={[
                    ["0.1", "300", "0.9817", "0.8914"],
                    ["0.3", "100", "0.9816", "0.8924"],
                    ["1.0", "30", "0.9687", "0.8853"],
                  ]}
                  caption="Three configurations that travel the same total distance, read off the same curves. The two smaller rates reach the same scores and the largest one is slightly behind on both."
                />
                <p>
                  Holding the product of rate and rounds fixed makes the
                  trade visible. At a total step of 30 the rates of 0.1 and
                  0.3 come within 0.001 of each other on both scores, and
                  1.0 is 0.006 behind on the held-out one, so on this throw
                  the rate and the round count trade almost one for one and
                  the smaller rate is buying a wider, flatter plateau rather
                  than a higher one. That is a real thing to buy, since it
                  makes the stopping round of Part 5 far less delicate, and
                  it is not the thing the textbook sentence promises. The
                  claim is usually made about tables with many features,
                  more noise and deeper members, where each round has more
                  room to commit to something spurious, and none of those
                  conditions holds for stumps on a single time column.
                </p>
                <KeepInMind>
                  The rate and the round count are one setting seen from two
                  sides, and halving one without doubling the other changes
                  how far the committee walks in total. Compare rates at
                  matched distances or at each one&rsquo;s own best round,
                  never at a fixed round count.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Past a rate of one">
                <p>
                  The line in section 10 says what happens if the rate is
                  pushed past one, and it is worth reading before the
                  playground refuses it. At a rate of 1.5 a residual r is
                  left as −0.5·r, so every fitted miss changes sign and keeps
                  half its size, and at 2.5 it is left as −1.5·r, larger
                  than it started.
                </p>
                <Equation>{"η = 1.5:   r − 1.5·r = −0.5·r\nη = 2.5:   r − 2.5·r = −1.5·r"}</Equation>
                <p>
                  Between one and two each round overshoots the mistake it
                  just fitted and the leftover still shrinks, though by
                  reflection rather than approach; past two the leftover
                  grows every round and the fit runs away, which is the
                  calculus primer&rsquo;s runaway in prediction space. The
                  library will not construct a committee with a rate above
                  one at all, so the playground slider hands you its refusal
                  in words when you cross that mark rather than a diverging
                  curve. The primer&rsquo;s descent slider is where the
                  runaway itself can be watched.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Depth of Each Member",
          content: (
            <>
              <SubSection title="14. What a member's depth buys per round">
                <p>
                  A stump adds two shelves a round. A member two questions
                  deep can add four, and one of depth d up to 2 to the power
                  d, so depth is how much correction a single round is
                  allowed to express. On data with several features depth
                  also decides whether a member can express an interaction,
                  a rule that depends on two features at once, and a stump
                  cannot. The throw has one feature, time, so there is no
                  interaction to express and depth here is purely a matter
                  of how fast the arc is roughed out.
                </p>
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
                <p>
                  Deeper members reach the training threshold sooner, in 86,
                  26, 19 and 17 rounds, and their held-out score peaks
                  sooner too, at rounds 299, 97, 58 and 36. The peaks
                  themselves are 0.8914, 0.8911, 0.8928 and 0.8875, so the
                  depth changed almost nothing about how good the committee
                  could get on this throw. What it changed was what happens
                  afterwards. At depth one the held-out score has not turned
                  by round 300; at depths two, three and four it has fallen
                  to 0.8802, 0.8783 and 0.8780, giving back 0.011, 0.015
                  and 0.010 of what it had reached, while the training score
                  keeps rising towards 0.9937.
                </p>
                <KeepInMind>
                  Depth and rate both set how much each round commits, and
                  the two interact. A deep member at a small rate can behave
                  like a stump at a large one, which is why the search page
                  varies them together rather than one at a time.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Why boosting wants a weak member and bagging a strong one">
                <p>
                  Push depth to its limit and the reason for keeping the
                  member weak is measured rather than argued. A member six
                  questions deep, kept in full at a rate of 1.0, explains
                  0.9877 of the training spread in its first round and
                  scores 0.8889 on the held-out readings, which is nearly
                  the whole job done by one tree. Its second round nudges
                  the held-out score to 0.8893, and from the fifth round on
                  the training score is 0.9937 and the held-out score is
                  0.8780, where both stay for the remaining 295 rounds
                  because there is nothing left for a later round to fit
                  except noise, and every later round fits it.
                </p>
                <p>
                  The ceiling of 0.9937 is not a failure. Three of the
                  training times appear twice with different heights, at
                  0.77, 3.01 and 3.15 seconds, and no rule that reads only
                  the time can tell the two readings of a pair apart, so
                  their mean is the best any tree can do there and the
                  leftover from those pairs is permanent.
                </p>
                <KeepInMind>
                  Bagging averages its members, so their private mistakes
                  cancel and a deep, unstable member is the right one to
                  hand it. Boosting adds its members up, so a mistake made
                  in round one is carried by every later round, and the
                  member that cannot make a large mistake in one round is
                  the right one to hand it. The fifty deep bagged trees of
                  section 22 score 0.8761 on the held-out readings, and the
                  same depth handed to boosting at the full rate had nothing
                  left to fit after five rounds.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                <p>
                  The round to stop at is the one where the held-out score
                  was highest, and for the three configurations above that
                  is round 5, round 24 and round 77, with held-out scores of
                  0.8963, 0.8915 and 0.8985 there. The price of running to
                  300 instead was 0.018, 0.013 and 0.013 of R². Those are
                  small numbers on eighteen held-out readings, and the
                  held-out page measured how far one seeded deal&rsquo;s
                  verdict moves when the seed changes, so a difference of
                  that size between two configurations is not a finding
                  about the configurations. What the curves do establish is
                  the shape, a rise, a broad top and a slow fall, and that
                  the fall begins hundreds of rounds before the training
                  score stops improving.
                </p>
                <KeepInMind>
                  Stop where readings the committee never saw say to stop,
                  and treat the exact round as a region rather than a point.
                  A small rate makes the region wide, which is the most
                  practical thing it buys.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. No out-of-bag score here">
                <p>
                  Bagging got its honest score for free, because every
                  member missed about a third of the readings and those
                  readings could judge it. Boosting has no such readings.
                  Every round is fitted on every row, so no member has a row
                  it never saw, and the held-out readings have to be supplied
                  from outside, by a deal as above or by the folds the
                  held-out page builds. On the same forty-two training
                  readings the deep bagged trees of Part 6 report an
                  out-of-bag score of 0.9029 beside a held-out score of
                  0.8761, and the boosted stumps can report only the second.
                </p>
                <p>
                  The library builds the plain form of the method and not
                  the stochastic one, where each round is fitted on a random
                  fraction of the rows and the rest can judge it, so there
                  is no out-of-bag estimate to show here, and the page says
                  so rather than inventing one.
                </p>
              </SubSection>

              <SubSection title="20. Rate, rounds and depth as one budget">
                <p>
                  The three settings are one decision about how much
                  correction the committee is allowed to accumulate and how
                  finely it is dispensed. Section 12 held the product of
                  rate and rounds fixed and found the two smaller rates
                  coming within 0.001 of each other; section 15 held the
                  rate fixed and found depth moving the peak from round 299
                  to round 36 without raising it. So a sensible search fixes
                  the depth low, chooses a rate small enough that the plateau
                  is wide, and lets a held-out curve choose the round count,
                  which is the procedure the{" "}
                  <Link href="/concepts/grid-search" className={link}>
                    search page
                  </Link>{" "}
                  lays out with the round count read off the curve rather
                  than gridded.
                </p>
                <KeepInMind>
                  More rounds is cheap to try, since a committee of k rounds
                  is the first k members of a longer one and the whole curve
                  comes from one fit. The API draws every curve on this page
                  that way, fitting once at 300 rounds and scoring each
                  prefix.
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
                <p>
                  The first three bagged members drew 27, 27 and 28 distinct
                  readings of the 42, and every target they were shown is a
                  height between 4.5 and 21.7 metres, the arc itself with
                  some readings doubled and some absent. The first three
                  boosted rounds were shown all 42 readings each time, and
                  their targets are residuals, the largest 10.13, 10.60 and
                  8.67 metres, with squared totals of 1142.7, 952.9 and
                  784.6 falling round by round as the committee explains
                  more of the arc. Read across the bagged row and the
                  pictures are the same shape with different readings; read
                  across the boosted row and the readings are the same and
                  the shape is changing.
                </p>
              </SubSection>

              <SubSection title="22. Averaging cannot add flexibility, summing can">
                <p>
                  Hand the two frames the same stump and the difference in
                  what they make of it is the clearest measurement on the
                  page.
                </p>
                <MemberTargets points={SIXTY_THROW} panel="curves" />
                <p>
                  Fifty bagged stumps score 0.4758 on the training readings
                  and 0.2727 held out, because the average of fifty
                  two-shelf rules is a smoothed two-shelf rule, and no
                  amount of averaging supplies a shape none of the members
                  has. Fifty boosted stumps at a rate of 0.3 score 0.9767
                  and 0.8832, because each stump was fitted to what the
                  others left and the sum of fifty different two-shelf rules
                  is a hundred-shelf staircase. Fifty deep bagged trees
                  score 0.9849 and 0.8761, which is the frame that averages
                  handed the member built for averaging, and it reaches the
                  boosted stumps&rsquo; held-out score within 0.007 by the
                  opposite route.
                </p>
                <DerivationTable
                  expressionHeading="bagging"
                  reasonHeading="gradient boosting"
                  rows={[
                    { expression: "members fitted independently, in any order", reason: "members fitted in sequence, each defined by the ones before it" },
                    { expression: "each member sees a resample of the rows", reason: "each member sees every row" },
                    { expression: "each member is fitted to the heights", reason: "each member is fitted to the current residuals" },
                    { expression: "members averaged with equal weight", reason: "members summed, each scaled by the rate" },
                    { expression: "attacks variance, wants a deep member", reason: "attacks bias, wants a shallow member" },
                    { expression: "more members never hurt", reason: "more rounds eventually hurt" },
                    { expression: "an out-of-bag score comes free", reason: "held-out rows have to be supplied" },
                  ]}
                />
              </SubSection>

              <SubSection title="23. AdaBoost reweights the rows rather than fitting residuals">
                <p>
                  AdaBoost is the other sequential committee, and from a
                  distance it looks the same, one weak member after another,
                  each aimed at what the last got wrong. The mechanism is
                  different in every line. Every round is fitted to the same
                  labels, on the same rows, and what changes between rounds
                  is how much each row counts. A row the last member got
                  wrong has its weight raised, a row it got right has its
                  weight lowered, and the next member is fitted on the
                  reweighted rows, so it is pulled towards the hard cases
                  without ever seeing a residual. The members are then
                  combined by a weighted vote in which a member that did
                  well on its weighted rows gets a louder voice, where a
                  boosted regression gives every round the same rate.
                </p>
                <DerivationTable
                  expressionHeading="gradient boosting"
                  reasonHeading="AdaBoost"
                  rows={[
                    { expression: "the target changes each round, the rows count equally", reason: "the target is fixed, the rows' weights change each round" },
                    { expression: "the member is a regression tree, whatever the task", reason: "the member is a classifier, a stump by default" },
                    { expression: "each member added at the rate η", reason: "each member's voice set by its own weighted error" },
                    { expression: "a rate above one is refused", reason: "a member no better than guessing stops the walk" },
                    { expression: "a mislabelled row leaves a residual that never closes", reason: "a mislabelled row gains weight every round until it dominates" },
                  ]}
                />
                <p>
                  The two are cousins rather than strangers. Friedman,
                  Hastie and Tibshirani showed that AdaBoost is the same
                  stagewise additive fitting under the exponential loss, and
                  seen from the gradient view the reweighting is what that
                  loss&rsquo;s negative gradient looks like when the members
                  are classifiers. The library&rsquo;s AdaBoost is a
                  classifier and the throw is a regression, so there is no
                  side-by-side fit to show on this page, and the contrast is
                  stated rather than measured.
                </p>
              </SubSection>

              <SubSection title="24. What the three share and where they part">
                <NumberTable
                  headings={["", "bagging", "gradient boosting", "AdaBoost"]}
                  rows={[
                    ["members fitted", "in parallel", "in sequence", "in sequence"],
                    ["what a member sees", "a resample of the rows", "every row, the residuals", "every row, reweighted"],
                    ["what a member is", "a deep tree", "a shallow regression tree", "a stump classifier"],
                    ["how members combine", "equal average", "sum at the rate", "weighted vote"],
                    ["what it attacks", "variance", "bias", "bias"],
                    ["free honest score", "out of bag", "none", "none"],
                  ]}
                />
                <KeepInMind>
                  The word ensemble covers all three committees and says
                  nothing about which member any of them wants. Which half
                  of the error a committee attacks, and therefore which
                  member it wants, follows from how it combines its members,
                  averaging for bagging and summing for the two boosters.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="25. What a complete implementation must specify">
                <p>
                  A complete implementation states the loss, since the
                  residual is only the negative gradient of squared error
                  and another loss changes both the start and what each
                  round fits; the starting constant; the member and every
                  setting it carries, its maximum depth and the fewest rows
                  a split and a leaf may hold; the number of rounds; the
                  learning rate and the range it is allowed; whether a
                  per-leaf step length is searched after the tree is fitted
                  or the leaf mean is taken as it is; whether any row
                  subsampling happens per round, which is what would give
                  an out-of-bag estimate; how a committee of fewer rounds
                  relates to a longer one; and how a query at a time outside
                  the readings is answered. Each of those is a place two
                  implementations can quietly disagree while both report a
                  fit.
                </p>
              </SubSection>

              <SubSection title="26. The edges, probed">
                <p>
                  Every row below was tried against the library and, where
                  the API&rsquo;s door lets it through, against the API. Some
                  are refused, some are accepted with an answer worth
                  knowing, and some are accepted and documented rather than
                  defended.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "no features, or an empty column", reason: "refused by name before any round runs, by the guard every model here shares." },
                    { expression: "a single reading", reason: "accepted by the library. The mean is the reading, every member is one leaf, the committee answers that height everywhere, and asking for R² is refused because a single height has no spread to explain. The API's door refuses it a layer earlier, at two readings." },
                    { expression: "two readings", reason: "accepted. At a rate of one the first stump reproduces both exactly and R² is 1.0 after one round." },
                    { expression: "every height the same", reason: "accepted as a fit, the committee predicts that height and every member is a single leaf; scoring it is refused, since R² is undefined with nothing to explain. The API returns that refusal in the library's words." },
                    { expression: "every time the same", reason: "accepted. No question can separate the readings, every member is a single leaf answering zero, the committee predicts the mean height and R² is exactly 0.0." },
                    { expression: "two readings at one time with different heights", reason: "accepted, and the pair share their mean for ever. Forty rounds on heights of 4 and 8 at two seconds predict 6.0 for both and leave R² at 0.8." },
                    { expression: "a non-finite height or time", reason: "refused by the library as not finite. The API's door refuses it first, since a non-finite number fails its magnitude bound." },
                    { expression: "a learning rate above 1, or of 0", reason: "refused when the committee is constructed, before any data is seen. That refusal is a construction error rather than a library error, which is why the API refuses a rate past 1 in its own words rather than handing it on." },
                    { expression: "zero rounds, or a depth of 0", reason: "refused at construction for the same reason." },
                    { expression: "a leaf minimum larger than the reading count", reason: "accepted, and documented rather than defended. Every member becomes a single leaf answering zero, the committee is the flat mean and R² is 0.0, with nothing raised." },
                    { expression: "more rounds than the door allows", reason: "refused at the door, at 300 for a fit and at 60 for the stepper, which lays every round out and is about the early ones." },
                    { expression: "predicting before fitting", reason: "refused by name, with the model's own name in the message." },
                    { expression: "a feature named differently at prediction", reason: "refused by name; the message says which names were expected and which arrived." },
                    { expression: "a time outside the readings", reason: "accepted, and answered with the outermost shelf for ever, 0.80 metres before the launch and 1.35 after four seconds on the hundred-round fit." },
                    { expression: "a committee cut to fewer rounds", reason: "identical to a fresh fit of that many rounds, to the last bit, because each round depends only on the rounds before it. The learning curves rely on this and a test pins it." },
                  ]}
                />
                <p>
                  Two of those deserve the extra sentence. The leaf-minimum
                  row is the case where a model fits, predicts and scores
                  without ever having learned anything, and nothing in the
                  library or the API says so, since a flat mean is a legal
                  answer; that one is on the reader to notice. And the
                  learning rate&rsquo;s bound is enforced by the constructor
                  rather than by a data check, which is the right place for
                  a setting whose failure does not depend on the data, and
                  it means the refusal is not one the API can translate,
                  only anticipate.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
