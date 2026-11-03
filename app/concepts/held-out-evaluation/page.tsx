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
import { ClassifierFoldDeck } from "@/components/widgets/ClassifierFoldDeck";
import { FoldCountTable } from "@/components/widgets/FoldCountTable";
import { FoldDeck } from "@/components/widgets/FoldDeck";
import { FractionTradeTable } from "@/components/widgets/FractionTradeTable";
import { GapCurveChart } from "@/components/widgets/GapCurveChart";
import { HoldOutPlayground } from "@/components/widgets/HoldOutPlayground";
import { LeakTable } from "@/components/widgets/LeakTable";
import { SeedFamilyStrip } from "@/components/widgets/SeedFamilyStrip";
import { ValidationCurveChart } from "@/components/widgets/ValidationCurveChart";

export const metadata: Metadata = {
  title: "Held-Out Evaluation · Perceptron Lab",
  description:
    "Performance on familiar examples can overstate how well a rule predicts new ones. Setting data aside before fitting gives us a separate check of its predictions.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function HeldOutEvaluationPage() {
  return (
    <ConceptPage
      lessonId="held-out-evaluation"
      intuition={lessonIntuitions["held-out-evaluation"]}
      technicalStart="Part 4. Every Row Takes a Turn"
      openingTitle="The Model Has Already Seen the Answers"
      playgroundTitle="Does the fitted rule work on people it has not seen?"
      playgroundIntro="Compare the training score with the held-out score. Change the split and notice that the evaluation itself varies with the examples chosen."
      title="Held-Out Evaluation"
      tagline={"Performance on familiar examples can overstate how well a rule predicts new ones. Setting data aside before fitting gives us a separate check of its predictions."}
      prerequisites={
        <>
          We have fitted models to observations. Now we need to find out how they behave on observations that weren&apos;t used to choose their settings. We will use the{" "}
          <Link href="/concepts/multiple-polynomial-regression" className={link}>
            polynomial page
          </Link>
          &rsquo;s fifteen noisy measurements of a thrown ball and its degree control. Read that example first, at least as far as the degree sweep. When we get to classification, we will use the twelve overlapping people from{" "}
          <Link href="/concepts/judging-a-classifier" className={link}>
            judging a classifier
          </Link>
          , and the section on the leak picks up where the{" "}
          <Link href="/concepts/pipelines" className={link}>
            pipelines page
          </Link>{" "}
          left it.
        </>
      }

      playground={<HoldOutPlayground />}
      sections={[
        {
          title: "Part 1. Why a Training Score Flatters",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Fifteen measurements and a practice booklet">
                <p>

                  Suppose a student practices from a booklet and then takes an exam containing those exact questions. A good score could come from understanding the subject or from remembering the answers. New questions give us a better way to check. A fitted model has a similar problem: it has already used the training observations to choose its settings. We will reserve some of the thrown ball&apos;s fifteen measurements and see how well a curve predicts them.
                </p>
                <>
<p>The activity reserves four measurements and fits the curve to the remaining eleven. At degree 2, the scores are 0.995 on the training observations and 0.989 on the held-out observations. A quadratic describes this illustrated trajectory well; agreement on this split is not a general guarantee about thrown objects.</p>
                <p>At degree 9, the training score rises to 0.999 while the held-out score falls to about −5480. We changed only the number of polynomial terms. The added flexibility lets the curve follow the eleven training measurements closely, but its predictions for the other four become much worse. That is the failure the held-out measurements reveal.</p>
</>
                <KeepInMind>

                  A score on the rows a fit was optimized on measures how well
                  the curve matched those rows. Whether what it learned
                  travels to rows it has not seen is a different question, and
                  only the second one says anything about a measurement of the
                  ball not yet taken.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The training score can only climb">
                <p>For exact, unregularized least-squares fitting, a polynomial family of degree d is contained in the family of degree d + 1. The extra coefficient can be zero, preserving every earlier candidate. The minimum training error therefore cannot increase merely because that family gets larger. Finite-precision solvers can introduce numerical qualifications.</p>
                <Equation>{"best RSS at degree d + 1  ≤  best RSS at degree d\nso   training R² at degree d + 1  ≥  training R² at degree d"}</Equation>
                <GapCurveChart />
                <>
<p>
                  On the fixed split the training curve runs 0.222, 0.995, 0.996, 0.996, 0.996, 0.996, 0.997, 0.997, 0.999 from degree 1 to degree 9, never once falling. The held-out curve is free to do anything, and it rises to 0.989 at degree 2, wanders between 0.966 and 0.993 through degree 5, then reads 0.693, −1.396, −104 and −5479.
                </p>
                <p>

                  Read the argument for what it does not say. Nothing in it mentions the hidden rows, so the guarantee binds only the data the fit was optimized on, and a score that is guaranteed never to fall as the model grows more capable cannot say when to stop.
                </p>
</>
                <KeepInMind>

                  Polynomial degree illustrates how added flexibility can improve training fit without improving prediction. Other controls, such as penalties, tree depth or neighbor count, change the model in different ways; their training scores need not follow this degree curve. Compare settings on validation observations, then keep a separate test outside that selection.</KeepInMind>
              </SubSection>

              <SubSection title="3. What a score on a share means, and why it can fall below zero">
                <p>
                  Both readouts are the regression page&rsquo;s R squared,
                  computed on whichever share they name. The residual sum is
                  the curve&rsquo;s squared misses on that share, and the
                  yardstick it is measured against is the squared misses of a
                  flat line at that same share&rsquo;s own mean. So the
                  held-out score does not ask how the curve compares with a
                  flat line through the training mean; it asks how the curve
                  compares with the best flat line for the four hidden rows
                  themselves, and it can lose that comparison.
                </p>
                <Equation>{"R² on a share  =  1 − RSS on the share / TSS on the share\nTSS on the share  =  Σ (hᵢ − mean of h over that share)²"}</Equation>
                <p>
                  A held-out score below zero therefore means the curve
                  predicts the hidden measurements worse than the average of
                  those four would have, and the degree 9 curve does not lose
                  mildly. Its squared misses on the four hidden rows are about
                  5480 times the spread those rows have about their own mean,
                  because between two of its eleven training points it swings
                  through heights no ball ever reached.
                </p>
                <KeepInMind>

                  With only a few held-out rows, the reference sum of squares can vary substantially from one split to another. If those rows have similar target values, their total sum of squares is small, so a given squared error produces a larger penalty in R². Read the target spread and the prediction errors alongside the ratio.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Split",
          content: (
            <>
              <SubSection title="4. Shuffle, then cut">
                <p>
                  The measurements arrive in time order, from the throw at
                  zero seconds to the landing at four, and cutting an ordered
                  list without shuffling would hold out the whole landing.
                  So the recipe shuffles first. The fifteen positions are
                  permuted by a generator with a stated seed, a stated share
                  of them is taken as the held-out rows, and the rest train.
                  Seeding the shuffle is what lets this page quote the numbers
                  it quotes, since the same seed deals the same rows every
                  time.
                </p>
                <WorkedExample title="The playground&rsquo;s deal">
                  <p>
                    The share is three tenths, which on fifteen rows is four
                    held out and eleven kept, and under the page&rsquo;s seed
                    the four positions that come out are 0, 1, 10 and 12, the
                    first two measurements, the one at 2.86 seconds and the
                    one at 3.43. Those are the amber rings in the playground,
                    and every number in Part 1 was computed on that one deal.
                  </p>
                </WorkedExample>
                <p>

                  The split here rounds the wanted share to a row count and
                  clamps it so that neither side is ever empty,
                  which is why a half of fifteen rows comes out as eight held
                  out and seven kept rather than the other way round, since
                  seven and a half rounds to the even neighbor. It also takes the held-out block from the front of the shuffled
                  order, where the library&rsquo;s own splitter takes it from the
                  end, so the two hide different rows under one seed, which the
                  practice section at the end makes visible.
                </p>
                <KeepInMind>
                  The appropriate split depends on how future predictions will be used. Shuffling is useful for this illustration, but time-ordered records or related observations may need a time or group boundary instead. To reproduce a split, retain the dataset identity and selected row indices, or the exact splitting procedure and its seed.</KeepInMind>
              </SubSection>

              <SubSection title="5. Fit on the training share alone, columns included">
                <p>
                  The held-out rows must touch nothing about the fit, and that
                  rule reaches further than the coefficients. The polynomial
                  page manufactures its columns, the time squared and cubed
                  and so on, from the one measured column, and those columns
                  are rebuilt from the eleven training rows only, so the four
                  hidden rows are transformed afterwards by a recipe that
                  never saw them. For a polynomial the recipe learns nothing
                  from the rows, only the names, so the point is invisible
                  here, and Part 6 measures what happens when the recipe does
                  learn something.
                </p>
                <InAModel title="At degree 2 on the fixed deal">
                  <p>The eleven training observations determine three coefficients. The fitted curve explains a proportion 0.9954 of the training variation and 0.9890 of the held-out variation. The small gap is what we observed for this split and this model. A quadratic has fewer adjustable coefficients than the higher-degree alternatives, but another sample could still produce a different gap.</p>
                </InAModel>
                <KeepInMind>
                  Anything learned from data is part of the fit, whether it is
                  called a coefficient or a preprocessing step, and all of it
                  has to be learned from the training share.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Score the one fit twice, and read the gap">
                <p>The training score describes fit to the observations used to choose the coefficients. The held-out score evaluates predictions for excluded observations. Their gap can signal overfitting, while sampling variation and distribution differences can also affect it. On the fixed split, the gap is 0.006 at degree 2, 0.030 at degree 3, 0.010 at degree 5 and about 5480 at degree 9. Deterioration is already visible at degree 6: held-out R² falls to 0.693 while training R² remains 0.996. This comparison shows worsening prediction, rather than measuring how many observations the model memorized.</p>
                <NumberTable
                  headings={["degree", "training R²", "held-out R²", "gap"]}
                  rows={[
                    ["1", "0.222", "−2.971", "3.19"],
                    ["2", "0.995", "0.989", "0.006"],
                    ["3", "0.996", "0.966", "0.030"],
                    ["4", "0.996", "0.993", "0.003"],
                    ["5", "0.996", "0.986", "0.010"],
                    ["6", "0.996", "0.693", "0.303"],
                    ["7", "0.997", "−1.396", "2.39"],
                    ["9", "0.999", "−5479", "5480"],
                  ]}
                  caption="The fixed deal, eleven measurements training and four judging, one fit per degree."
                />
                <p>On this split, degree 4 has the highest held-out score at 0.993, while degree 2 is lower by 0.004. That small difference depends on which observations were reserved. Selecting the degree from these scores makes the reserved observations validation data, so a separate test is needed to assess the selected procedure.</p>
              </SubSection>

              <SubSection title="7. What the held-out share trades">
                <p>The held-out fraction divides a limited dataset between fitting and evaluation. Reserving fewer rows leaves more observations for fitting but fewer for checking predictions. Reserving more gives a larger evaluation group while reducing the training group. The table refits the degree 2 curve under thirty seeds at each fraction so we can compare those choices across several splits.</p>
                <FractionTradeTable />
                <>
<p>At a tenth of the rows, only two measurements are held out. Across thirty splits the lowest R² is −8.34 and the range is 9.33. A two-row reference variance is sensitive to which measurements were selected. At three tenths the range is 0.043, at four tenths 0.032 and at a half 0.031. It increases to 0.044 at six tenths, where less data remains for fitting. These are the observed results for this curve and dataset.</p>
                <p>
                  The mean training score moves from 0.9957 to 0.9964 over the whole table, because a parabola is easy to fit on six rows or on thirteen.
                </p>
</>
                <KeepInMind>
                  Cross-validation reuses these fifteen observations across several fits. Each measurement can train in four fits and be held out in one, rather than being permanently assigned to one side of a single split. This uses the small dataset more extensively, but it does not create new independent observations or remove uncertainty.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "In exact arithmetic, the best achievable unpenalized least-squares training fit cannot worsen as polynomial degree increases.",
              true,
              "The higher-degree family contains every lower-degree curve by allowing the new coefficient to be zero. Its best training error therefore cannot be larger. This says nothing about held-out error, and a numerical solver still has to find that optimum.",
            ),
            choice(
              "At degree 9 the held-out score reads about −5480. What does a negative held-out score mean?",
              [
                "The curve predicts the four hidden measurements worse than the average of those four would have",
                "The curve predicts worse than a flat line through the training mean",
                "The fit failed to converge on those rows",
                "The rows were cut from the order without being shuffled first",
              ],
              0,
              "Held-out R-squared compares prediction errors with squared variation around the held-out targets’ own mean. A very negative value means those errors greatly exceed that reference. The training-mean baseline is a different comparison, and solver convergence is another question.",
            ),
            choice(
              "Why does the recipe shuffle the fifteen rows before cutting them?",
              [
                "They arrive in time order, so cutting without shuffling would hold out the whole landing",
                "Shuffling raises the held-out score",
                "Shuffling is what makes the deal reproducible",
                "Shuffling decides how many rows are held out",
              ],
              0,
              "The measurements arrive in time order. Shuffling makes this test sample positions across the recorded flight instead of reserving only its final part. That suits the interpolation question here. Forecasting later times would need a chronological evaluation that keeps future observations unavailable during fitting. Record the seed to reproduce the chosen rows.",
            ),
            trueFalse(
              "Only the coefficients have to be learned from the training share.",
              false,
              "Any reference learned from data, such as a mean or a standard deviation, belongs inside the training procedure. This particular polynomial expansion has a fixed mathematical rule once its degree is chosen; fitting it records the column structure rather than estimating numerical statistics. Other preprocessing stages can learn values and must remain inside each training split.",
            ),
            several(
              "Varying the held-out share under thirty seeds, which of these were measured?",
              [
                "At a tenth the jury is two measurements and the lowest verdict is −8.34, with a spread of 9.33",
                "The spread is 0.043 at three tenths, 0.032 at four tenths and 0.031 at a half",
                "Past a half the spread turns back up, reaching 0.044 at six tenths",
                "The mean training score falls sharply as more rows are held out",
              ],
              [0, 1, 2],
              "A small held-out group can have very little target variation, making R-squared sensitive to even modest errors. Reserving more rows can improve that evaluation reference while leaving fewer rows to fit the model. The measured table shows those competing effects for this dataset; it does not set a universal best test fraction.",
            ),
        ],
        },
        {
          title: "Part 3. What a Held-Out Score Estimates",
          content: (
            <>
              <SubSection title="8. Four measurements standing in for every throw">
                <p>We want to estimate performance on new measurements from the process that produced these observations. The four held-out measurements were excluded from fitting, so their score gives evidence about prediction beyond the training sample. Four observations give a very uncertain estimate. Keeping them separate improves the evaluation procedure; it does not make the estimate exact.</p>
                <Equation>{"held-out R²  ≈  R² the fit would earn on measurements never taken\n                 estimated from the few rows held back"}</Equation>
                <KeepInMind>
                  Excluding rows from fitting separates evaluation from training. It does not establish the precision of the score. Repeating the split shows sensitivity to the split within this dataset; independent observations are still needed to investigate how the result transfers beyond it.</KeepInMind>
              </SubSection>

              <SubSection title="9. The seed moves the verdict">
                <p>
                  The way to find out how much a single held-out score is
                  worth is to deal again. The strip below holds out four of the
                  fifteen under thirty different seeds, refits the curve on
                  each training share, and scores each held-out share, so
                  every amber dot is a verdict the playground could have shown
                  instead of the one it does.
                </p>
                <SeedFamilyStrip />
                <>
<p>

                  At degree 2 the thirty held-out scores run from 0.955 to 0.998, with mean 0.988. Mean training score across those fits is 0.996. The degree-four advantage of 0.004 on one fixed split is not enough by itself to establish a reliable improvement. To compare the methods, score both on matching splits and inspect their paired differences. The range of one method’s scores is not a significance threshold for that comparison.
                </p>
                <p>
                  Turn the dial to degree 5 and the lowest verdict is 0.355 against a highest of 0.998, a spread of 0.643, which is the same curve family being called excellent by one deal and poor by another.
                </p>
</>
                <KeepInMind>

                  Changing the split changes which observations judge the fit. The observed ranges, 0.043 for degree two and 0.643 for degree five here, show sensitivity to that choice. They are neither confidence intervals nor cutoffs that a difference between methods must exceed.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Why the verdict is so much noisier than the fit">
                <>
<p>The seed changes both the training observations and the held-out observations. In this example, the degree 2 training scores vary little because each fitted parabola closely follows its eleven training rows. The held-out scores vary more because the omitted positions and the reference spread differ. Both the changed fit and the changed evaluation set can contribute.</p>
                <p>Leaving out measurements near the end of the flight can make the fit predict positions farther from the observations it used. Holding out measurements near the top of the arc creates a different issue: their target heights may be close together, making the R² denominator small. Those effects need to be distinguished from the amount of measurement noise.</p>
</>
                <WhyThisWorks title="Why a small held-out share amplifies the wobble">
                  <>
<p>

                    The score is a ratio, and its denominator is the spread of the held-out rows about their own mean. Four rows drawn from near the peak of the arc have heights within a meter or two of each other, so their total sum of squares is small and any miss at all costs a large fraction of it.
                  </p>
                  <p>

                    Four rows drawn from across the whole flight have heights spanning twenty meters, and the same misses cost almost nothing. The seed decides which of those two juries sits, and the score moves with it even when the curve is nearly the same fit each time.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  The degree 2 fits under these thirty seeds are similar parabolas, yet their held-out scores span 0.043. This demonstrates sensitivity to the chosen rows and their reference variance. It does not establish that this is the dominant source of uncertainty for every small dataset.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Every Row Takes a Turn",
          content: (
            <>
              <SubSection title="11. Dealing the folds">
                <p>
                  A single split spends four rows on judging and never lets
                  them train, and spends eleven on training and never lets
                  them judge. Folding lets every row do both. Shuffle once,
                  cut the fifteen into five folds of three, and then five times
                  over hold one fold out, fit on the other four, and score the
                  hidden one. Every measurement is judged exactly once by a
                  fit that never saw it, and every fit sees twelve of the
                  fifteen rather than eleven.
                </p>
                <FoldDeck />
                <>
<p>

                  Under the page&rsquo;s seed the five folds hold measurements 1, 10 and 12, then 0, 2 and 7, then 8, 9 and 13, then 3, 4 and 6, then 5, 11 and 14, and at degree 2 they score 0.992, 0.992, 0.998, 0.966 and 0.996. The fourth fold holds measurements 3, 4 and 6, three heights between 13 and 19.4 meters near the top of the arc, and it is the one that scores lowest, for the reason section 10 gave.
                </p>
                <p>
                  Fifteen rows do not always divide evenly, and when they do not the extra rows go to the earlier folds, so ten folds of fifteen are five folds of two and five of one.
                </p>
</>
                <KeepInMind>
                  Folding costs one fit per fold, and buys a verdict from
                  every row rather than from a few, with each fit trained on
                  nearly all the data.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The mean across folds">
                <p>This page summarizes the five fold scores by their mean. Repeating that evaluation across polynomial degrees gives a validation curve for comparing those candidates. Each candidate includes preprocessing and regression, refitted inside every fold, so learned preprocessing values come only from that fold’s training observations.</p>
                <ValidationCurveChart />
                <Equation>{"mean across folds  =  (1/k) Σ R²ₖ\nspread across folds  =  max R²ₖ − min R²ₖ"}</Equation>
                <p>
                  At degree 2 the mean is 0.989 and at degree 3 it is 0.989
                  as well, 0.0001 behind, so the folds agree with the throw
                  that a parabola is enough. The fixed deal&rsquo;s preference
                  for degree 4 has gone, since across the folds degree 4 reads
                  0.986. At degree 8 the mean is −1.44, and at degree 9 it is
                  0.71, which is not a recovery. Section 13 explains why the
                  mean at those degrees is not a number to read on its own.
                </p>
                <KeepInMind>

                  Read the mean beside the individual fold results. Degree two is relatively consistent across these folds, while degree eight has a very poor result on one fold. Neither the mean nor the range alone describes uncertainty in a comparison with another method.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. The spread, and what it is not">
                <p>

                  The spread is the best fold score minus the worst. At degree two it is 0.032, so these fold scores are relatively close. At degree eight the scores are 0.979, −10.29, 0.828, 0.916 and 0.369, with mean −1.44 and spread 11.27. They all assess the same degree-eight procedure, but one result is much worse than the others. Keep that failed fold visible instead of treating the mean as a typical result.
                </p>
                <NumberTable
                  headings={["degree", "the five folds", "mean", "spread"]}
                  rows={[
                    ["1", "−0.40, −0.72, −0.23, −3.81, −0.98", "−1.230", "3.580"],
                    ["2", "0.992, 0.992, 0.998, 0.966, 0.996", "0.989", "0.032"],
                    ["5", "0.987, 0.991, 0.997, 0.962, 0.970", "0.981", "0.035"],
                    ["8", "0.979, −10.29, 0.828, 0.916, 0.369", "−1.440", "11.27"],
                  ]}
                  caption="Five folds under the page&rsquo;s seed. Compare the mean with the individual scores and their range."
                />
                <p>The range is not a standard error. It describes the largest and smallest scores among these folds, and it can change when the number or composition of folds changes. It is not a threshold for deciding whether two methods differ. The fold scores also are not independent: any pair of these five fits shares three of its four training folds.</p>
                <KeepInMind>
                  A wide range identifies sensitivity to which fold is held out. Inspect the individual results to find the conditions behind a poor score. A narrow range alone does not establish reliable generalization, and neither range is a confidence interval for the mean.</KeepInMind>
              </SubSection>

              <SubSection title="14. Pooling the held-out predictions is a different number">
                <p>

                  There is a second way to summarize the folds. Instead of
                  scoring each fold&rsquo;s three predictions on their own and
                  averaging the five scores, collect all fifteen held-out
                  predictions, each made by a fit that never saw its row, and
                  score them once against all fifteen measurements. Every row
                  was held out exactly once, so that is one prediction per row
                  of the whole dataset, judged against the whole
                  dataset&rsquo;s spread.
                </p>
                <Equation>{"pooled R²  =  1 − Σ over folds RSSₖ / TSS of all fifteen measurements"}</Equation>
                <p>
                  At degree 2 the pooled score is 0.994 where the mean across
                  folds is 0.989, and the pooled squared error is 0.248 per
                  measurement. They differ because each fold&rsquo;s own score
                  measures its misses against the spread of only three rows,
                  and the fourth fold&rsquo;s three rows from the top of the
                  arc have very little spread, so the same misses cost that
                  fold 0.034 of R squared and cost the pooled figure almost
                  nothing. At degree 8 the two part company harder, −1.44
                  against −2.76.
                </p>
                <KeepInMind>
                  The mean across folds and the pooled score use the same held-out predictions with different reference variances. Both can be reported if that distinction is clear. Classification metrics also need an explicit aggregation rule, especially when some folds have undefined denominators.</KeepInMind>
              </SubSection>

              <SubSection title="15. How many folds, and the fold that cannot be scored">
                <p>
                  Two folds, three, five, ten or fifteen. More folds means each
                  fit sees more of the data and the verdict is built from more
                  fits, and it means more fits to pay for. On fifteen
                  measurements the table runs the degree 2 curve through every
                  choice under one seed.
                </p>
                <FoldCountTable />
                <>
<p>
                  From two folds to five the mean across folds moves from 0.991 to 0.989 and the pooled score from 0.991 to 0.994, which is the difference between fits trained on seven or eight rows and fits trained on twelve. At ten folds five of the folds hold a single measurement, and at fifteen every fold does, which is leave-one-out.
                </p>
                <p>
                  A fold of one row has no spread about its own mean, so its R squared is a ratio with zero underneath, and it is refused by name rather than reported as a number. The mean across folds therefore stops existing at ten folds, while the pooled score carries on, 0.993 at ten and 0.993 at fifteen, because pooling measures the misses against the spread of all fifteen rows and a single held-out row contributes only its miss.
                </p>
</>
                <KeepInMind>

                  Leave-one-out is not free of judgment even though it has no
                  seed. It costs a fit per row, the fifteen fits are almost
                  identical to each other, and its per-fold score is undefined
                  for any metric with the fold&rsquo;s own spread underneath,
                  so it has to be summarized by pooling.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. The out-of-bag cousin">
                <p>
                  The same separation also explains the{" "}
                  <Link href="/concepts/bagging" className={link}>
                    bagging page
                  </Link>
                  &apos;s out-of-bag score. Each member of a bagged committee is fitted on a
                  resample that misses about a third of the rows, so every row
                  can be judged by the members whose resample happened to miss
                  it, with no folds dealt and no extra fits made. The
                  difference from folding is that the number of judges a row
                  gets is a matter of luck rather than exactly one, and with
                  few members some rows get none at all, which that page
                  counts rather than hides.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Degree two scores between 0.955 and 0.998 across thirty splits. Degree four beats it by 0.004 on one fixed split. What can we conclude from that information alone?",
              [
                "The single-split advantage does not establish a reliable improvement; compare both methods on matching splits",
                "It confirms degree 4, since a spread of 0.043 is narrow",
                "It means degree 4 would have won under every seed",
                "It means the fixed deal was an unlucky one",
              ],
              0,
              "The score of one method varies when different rows are held out. Its observed range is not a significance cutoff for a paired model comparison. We need the two methods' differences on matching evaluation observations, along with an appropriate uncertainty assessment.",
            ),
            choice(
              "Why does the held-out score move so much more across seeds than the training score does?",
              [
                "Which four rows sit on the jury decides the spread underneath the ratio, and four rows near the peak have almost none",
                "The fits themselves differ wildly from one seed to the next",
                "The training score is computed at a different degree",
                "The held-out rows are scored against the training share’s mean",
              ],
              0,
              "The fitted parabolas are similar across these splits, but their held-out targets have different spreads. Errors on a few nearly equal peak heights can be large relative to that group’s small variation. The same error sizes on targets spanning more of the flight give a different R-squared.",
            ),
            trueFalse(
              "The best-minus-worst range of five fold scores is neither a standard error nor a significance threshold for comparing two models.",
              true,
              "The range describes these particular fold results. The fits share training observations, so their scores are dependent, and changing the number or composition of folds changes what is being summarized. A close range can indicate consistency without by itself establishing precise uncertainty.",
            ),
            choice(
              "At degree 2 the pooled score is 0.994 where the mean across folds is 0.989. Why do they differ?",
              [
                "Each fold scores its misses against the spread of its own three rows, and the fourth fold’s three come from the top of the arc",
                "Pooling drops the folds whose score is undefined",
                "The pooled score is computed on the training rows",
                "The mean across folds counts each row twice",
              ],
              0,
              "Mean fold R-squared averages ratios that each use a fold’s own target variation. Pooled R-squared combines the held-out prediction errors and compares them with variation across all held-out targets together. Those calculations use different references, so they need not agree even when folds contain equal numbers of rows.",
            ),
            several(
              "Which of these hold at ten and fifteen folds on these fifteen measurements?",
              [
                "A fold of one row has no spread about its own mean, so its R squared is refused by name rather than reported as a number",
                "The mean across folds therefore stops existing at ten folds",
                "The pooled score is undefined there too, since it is built from the same per-fold ratios",
                "Leave-one-out needs no summary, since each fold’s own score is exact",
              ],
              [0, 1],
              "A one-row fold has no variation around its own mean, so its R-squared is undefined. Combining all held-out predictions can still produce a defined pooled R-squared because the complete target set varies. Other well-defined losses could also summarize the predictions. The overlapping training sets mean these fold results are dependent.",
            ),
        ],
        },
        {
          title: "Part 5. Folding a Classifier",
          content: (
            <>
              <SubSection title="17. A plain deal can leave a fold without a class">
                <p>Classification introduces class counts as well as row counts. Accuracy can be calculated for a nonempty fold containing only one class, but that fold cannot assess errors for the absent class. Some rates are undefined: recall for adults needs at least one actual adult. The twelve overlapping people, six children and six adults, show what a plain shuffled split can produce.</p>
                <ClassifierFoldDeck />
                <>
<p>

                  Under the plain deal the five folds hold 1, 2, 2, 0 and 1 adults, so the fourth fold holds two children and no adult and the third holds two adults and no child, so the count of folds missing a class is two. A tree two questions deep is refitted inside each fold. On the third fold it gets neither adult right, because the two it was denied, at 150 and 159 centimeters, are exactly the two adults inside the children&rsquo;s range, and the tree trained without them puts both on the children&rsquo;s side.
                </p>
                <p>
                  On the fourth fold the question of recall cannot be asked at all, since recall is the share of adults found and the fold has no adults to find.
                </p>
</>
                <KeepInMind>
                  Cutting a shuffled order into blocks lets a class clump.
                  With six of twelve the clumping is mild and still leaves
                  folds where one class is absent; with a rare class it is the
                  usual case rather than the unlucky one.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Stratified dealing">
                <p>
                  The repair is to deal each class separately. Split the
                  twelve into a pile of children and a pile of adults, shuffle
                  each pile on its own, and deal each pile round the five folds
                  in turn, so randomness still decides which adult lands in
                  fold two and no longer decides how many do. Switch the deck
                  above to the stratified deal and the five folds hold 1, 2,
                  1, 1 and 1 adults, no fold is missing a class, and recall
                  exists on every fold.
                </p>
                <Equation>{"plain      shuffle all twelve, cut into five blocks\nstratified deal the six children round the folds, then the six adults"}</Equation>
                <p>
                  Stratifying distributes what exists and cannot manufacture
                  what does not. Relabel the crowd so that only one adult
                  remains and deal it stratified, and four of the five folds
                  hold no adult whatever the seed, because one person can only
                  be in one fold. The count of folds missing a class is
                  reported rather than assumed to be zero once the deal is
                  stratified, and on this page that count is 0 for the
                  twelve with six adults and 4 for the twelve with one.
                </p>
                <KeepInMind>
                  This control stratifies by class label and is therefore off for the continuous regression target. For classification, stratification can help distribute the available classes across folds. It does not replace time or group boundaries when those are needed, and it cannot guarantee class presence when too few examples exist.</KeepInMind>
              </SubSection>

              <SubSection title="19. Pool the tables, do not average the rates">
                <>
<p>
                  With the folds scored there are two ways to combine five accuracies into one. Average the five, so each fold counts equally, or add the five folds&rsquo; confusion tables into one table and divide once, so each person counts equally. On the plain deal the averaged accuracy is 0.4667 and the pooled accuracy is 0.5, and on the stratified deal they are 0.8 and 0.8333.
                </p>
                <p>
                  Twelve people do not divide into five equal folds, so averaging gives a fold of two the same vote as a fold of three, and the two disagree by exactly that reweighting.
                </p>
</>
                <Equation>{"pooled     ( Σ rightₖ ) / ( Σ heldₖ )        =  6 / 12  on the plain deal\naveraged   (1/5) Σ  rightₖ / heldₖ           =  0.4667  on the plain deal"}</Equation>
                <>
<p>
                  The reweighting is a nuisance, and the fold with no adults is what settles the question. Recall on that fold is zero found over zero present, and averaging has to do something with it, either drop the fold and average the other four, which gives 0.5 here, or invent a value. Pooling adds zero to the top of the ratio and zero to the bottom and needs no convention, and it reads 2 of 6 adults found, 0.3333, which is the number the twelve people actually earned.
                </p>
                <p>
                  A classifier here is scored by pooling for exactly this reason, with a spread reported only for accuracy, which is the one rate that is defined on any fold with people in it.
                </p>
</>
                <KeepInMind>
                  For accuracy, pooling counts gives each person equal weight. For recall, the relevant denominator is the number of actual positives; for precision, it is the number of predicted positives. Pool the confusion counts first, then calculate the intended rate. A zero denominator in the pooled totals still needs an undefined-result policy. Equal fold sizes alone do not make every pooled rate equal its unweighted fold average.</KeepInMind>
              </SubSection>

              <SubSection title="20. Accuracy is the one rate that may be spread">
                <p>This implementation reports a fold range for accuracy because accuracy is defined on every nonempty fold. Recall or precision can be undefined when their required count is zero. A range computed only from available rates would describe that subset, so the missing folds would need to be reported explicitly.</p>
                <NumberTable
                  headings={["deal", "fold accuracies", "spread", "pooled accuracy"]}
                  rows={[
                    ["plain", "1.000, 0.333, 0.000, 0.500, 0.500", "1.000", "0.5000"],
                    ["stratified", "1.000, 1.000, 1.000, 0.500, 0.500", "0.500", "0.8333"],
                  ]}
                  caption="Five folds of the twelve people under the page&rsquo;s seed, the same fits as the deck above."
                />
                <p>
                  On the plain deal the spread is 1.0, since one fold got
                  everyone right and another got nobody right, and a pooled
                  accuracy of 0.5 sitting over a spread of 1.0 is the same
                  warning the degree 8 curve gave in section 13. Stratified,
                  the spread is 0.5 and the pooled figure 0.8333, and on twelve
                  people a spread of 0.5 is still one person in a fold of two.
                </p>
                <KeepInMind>
                  Before reporting a range, check that every intended fold supplied a defined rate. Accuracy does so for these nonempty folds. Even then, a fold of two people can change its accuracy by one half when one prediction changes.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What Must Stay Inside the Fold",
          content: (
            <>
              <SubSection title="21. Everything learned from data is learned inside the fold">
                <p>

                  Section 5 said the held-out rows must touch nothing about
                  the fit, and a preprocessing step that learns a mean and a
                  spread from the rows is part of the fit. Standardize the
                  columns once over all fifteen measurements before dealing
                  the folds, and every training fold has been scaled by a
                  mean that the held-out rows helped to compute. The table
                  measures what that costs on the throw, for the degree 2
                  terms scaled either before the folds are dealt or refitted
                  inside each fold, under thirty seeds.
                </p>
                <LeakTable />
                <>
<p>For ridge with penalty 0.01, the mean R² is 0.9676 when scaling is fitted beforehand and 0.9669 when scaling is fitted inside each fold. The mean gap is +0.0007. Beforehand scaling gives the higher score for 15 of the 30 seeds, with a largest single-seed gap of 0.019. These results show that the effect changes with the split. They do not establish a general size or direction for leakage from preprocessing.</p>
                <p>At penalty 0.1, the mean gap is +0.014 even though beforehand scaling gives the higher score for only 9 of 30 seeds. At penalty 0.001, the mean gap is +0.00007. The mean magnitude and the count of positive gaps describe different aspects of the results; neither supports a rule that this leakage is always only a few thousandths.</p>
</>
                <KeepInMind>
                  Preprocessing can leak information even when it does not read the target. Its effect depends on what was learned and how the following model uses it. Target-based feature selection introduces another direct path for evaluation answers to affect fitting. This one-input throw has no feature choice to demonstrate, so that comparison belongs to the pipelines example.</KeepInMind>
              </SubSection>

              <SubSection title="22. Why the least-squares fit cannot feel it">
                <p>The unregularized least-squares control is unchanged here by shifting feature columns or dividing them by nonzero scales. With a fitted intercept and the uniquely identified coefficient solution in this example, those changes reexpress the same prediction rule. The observed mean score gap is 7.5 × 10⁻¹⁶ and the largest single-seed gap is 2.9 × 10⁻¹⁴, consistent with floating-point rounding.</p>
                <WhyThisWorks title="Why scaling a column cannot move a least-squares fit">
                  <>
<p>

                    Replace a column c by (c − m) / s. Any fitted height that used c with coefficient b can be written with the new column and coefficient b s, plus b m added to the intercept, so the set of curves the fit can choose from is the same set as before. Least squares picks the best curve in the set, and the same set has the same best, whichever m and s the standardizer learned and from whichever rows.
                  </p>
                  <p>
                    The ridge fit is different because its penalty is on the coefficients themselves, and b s is a different size from b, so the penalty reads the columns through their scale and a scale learned from different rows is a different penalty.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>

                  The effect of leaked preprocessing depends on the model and the transformation. The least-squares control is unchanged in this experiment, while ridge depends on the feature scale. Keeping all learned preprocessing inside each fold gives the intended evaluation procedure without relying on an invariance that another pipeline may not have.</KeepInMind>
              </SubSection>

              <SubSection title="23. The held-out share is spent once">
                <p>We used the validation curve to choose degree 2. Its score of 0.989 therefore helped select a winner among nine candidates. It is no longer an independent final assessment of that choice. A candidate can win partly because it suits the particular validation observations.</p>
              <p>The grid-search lesson isolates that effect by trying twenty-five candidates on a target made of noise. Here the practical next step is the same: keep additional observations outside the selection process, then evaluate the chosen procedure there. Cross-validation supports selection, but it does not make repeatedly reused evidence independent again.</p>
                <KeepInMind>
                  Using a held-out score to choose settings makes those observations part of validation. For a final assessment of the selection procedure, use observations excluded from the entire choice, either a separate test set or an outer cross-validation loop.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "Dealt plain into five folds, the twelve overlapping people leave two folds missing a class. What does that break?",
              [
                "Recall cannot be asked at all on the fold holding no adults, since recall is the share of adults found",
                "Accuracy stops being computable on any fold",
                "The tree cannot be fitted on the other four folds",
                "The pooled accuracy becomes undefined",
              ],
              0,
              "A fold with no adults has no denominator for adult recall. That is different from a fold containing adults whom the tree misses, where recall is a defined zero. Accuracy remains defined on any nonempty fold, and pooled recall can use adult observations from the other folds.",
            ),
            trueFalse(
              "A stratified deal guarantees that no fold is missing a class.",
              false,
              "Stratifying distributes what exists and cannot manufacture what does not. Relabel the crowd so that only one adult remains and four of the five folds hold no adult whatever the seed, since one person can only be in one fold, which is why the count of folds missing a class is reported rather than assumed to be zero once the deal is stratified.",
            ),
            choice(
              "Why does this example pool held-out confusion counts before calculating recall?",
              [
                "Recall on a fold with no adults is zero over zero, and pooling adds zero to both sides of the ratio where averaging needs a convention",
                "Averaging is the slower of the two to compute",
                "Pooling gives every fold an equal vote, whatever its size",
                "Averaging cannot be applied to a confusion table at all",
              ],
              0,
              "Pooling combines the observed adult and detection counts before division, so a fold with no adults contributes no invented recall value. It also preserves one contribution per person when fold sizes differ. Averaging fold-level rates is another summary and needs its own weighting and undefined-value convention.",
            ),
            choice(
              "Standardizing all fifteen measurements before the folds are dealt, for a ridge fit at a penalty of 0.01, cost what?",
              [
                "A mean gap of +0.0007, flattering 15 of the 30 seeds and going the other way on the other 15",
                "A bias of about 0.019 that survived every seed",
                "Nothing at all, since the columns are rebuilt inside each fold anyway",
                "A gap that grew as the penalty was lowered",
              ],
              0,
              "Fitting a scaler on all rows lets the held-out inputs influence their own preprocessing reference, even without reading their targets. Leakage need not raise every observed score. In exact arithmetic, unpenalized least squares with a free intercept can preserve its fitted function under invertible changes of scale; ridge can change because its coefficient penalty depends on that scale. Fit preprocessing inside each training split for the declared evaluation.",
            ),
            trueFalse(
              "After degree 2 is selected using its validation score of 0.989, that score is no longer an independent assessment of the selection procedure.",
              true,
              "The validation results helped choose the degree, so the selected score also reflects that selection. Choosing the highest of several noisy scores can introduce optimism. Assess the complete selection procedure on a further untouched holdout or an outer layer of cross-validation.",
            ),
        ],
        },
        {
          title: "Part 7. Making the Split and Scoring Procedure Reproducible" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="24. Which rows are held out, and what is refitted?" id="24-what-a-complete-implementation-specifies">
                <>
<p>To reproduce an evaluation, record the dataset identity and selected row indices, or enough detail to reconstruct them. Specify how the held-out count is rounded, how rows are ordered or shuffled, fold sizes and any stratification. Also record what is refitted within each fold, the metric and undefined-result policy, and whether the summary averages fold scores or pools predictions.</p>
                <p>Those choices determine which procedure the reported number describes. Retain them alongside the result so another reader can reproduce the comparison.</p>
</>
                <KeepInMind>
                  On this page the deal is three tenths held out, shuffled
                  under one seed, five folds with the extra rows given to the
                  earlier folds, stratified only for the classifier, the
                  whole pipeline refitted inside each fold, R squared read on
                  a fold and reported as undefined where the fold has no
                  spread, the folds averaged for the throw and pooled for the
                  crowd, and the spread the best fold less the worst.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Too few rows, absent classes and unusable scores" id="25-the-edges-each-one-run">
                <p>The table records how the implementation handles small datasets, undefined scores and invalid requests. Some inputs are rejected before fitting; others produce a result with a limitation reported beside it. Check that response rather than assuming every requested split can be fitted and scored.</p>
                <DerivationTable
                  expressionHeading="Training or test split"
                  reasonHeading="What the score can tell us"
                  rows={[
                    { expression: "empty data, or one row", reason: "refused at the door, since a split needs a row on each side; a split of fewer than two rows is refused by name underneath as well." },
                    { expression: "two rows, one held out", reason: "the deal succeeds and the fit is refused, because one training row cannot pin even a straight line, with both counts named." },
                    { expression: "a single held-out row", reason: "its R squared is refused by name, since one row has no spread about its own mean; the fold endpoint reports that fold as undefined and pools the rest, which is how leave-one-out is scored." },
                    { expression: "a constant target", reason: "refused by name, because the yardstick is the target's spread and there is none." },
                    { expression: "a constant input column", reason: "refused by name at the fit, since a column with no spread makes the design singular." },
                    { expression: "a non-finite or enormous coordinate", reason: "a non-finite value cannot be written in the request at all, and a coordinate beyond a million is refused at the door before any fitting begins." },
                    { expression: "more folds than rows", reason: "refused by name, 16 folds need at least 16 rows to give each one something to score on." },
                    { expression: "one fold, or a share of zero or one", reason: "refused at the door; a share so large that one training row remains is refused for the degree it cannot pin." },
                    { expression: "a training fold too small for the degree", reason: "refused with the counts named, so the fold sweep stops where the next degree cannot be pinned." },
                    { expression: "a half of fifteen rows", reason: "accepted as eight held out and seven kept, because seven and a half rounds to the even neighbor; documented rather than defended." },
                    { expression: "a classifier's crowd of one class", reason: "accepted; a tree told the class count answers that class everywhere, scores an accuracy of 1.0, and recall is reported as undefined rather than as zero." },
                    { expression: "one adult among twelve, stratified", reason: "accepted, and four of five folds still hold no adult, because stratifying cannot manufacture a class; the count of folds missing a class says so." },
                    { expression: "a label other than 0 or 1, or an unknown keyword", reason: "refused at the door." },
                    { expression: "reading a score before a fit", reason: "refused by name underneath, and unreachable through this page, which never scores an unfitted curve." },
                    { expression: "a held-out share whose column names differ from the fit's", reason: "refused by name, the expansion needs t and got time; a share missing a manufactured term is refused the same way." },
                    { expression: "predictions and truth of different lengths", reason: "refused by name before any metric is read." },
                  ]}
                />
                <p>The held-out count uses round-half-to-even. A requested half of fifteen rows therefore gives eight held out, not seven. Read the count returned by the implementation rather than assuming a different rounding rule.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Practice. Dealing the Split and the Folds With the Library",
          practice: [
            exercise("Hold out four rows and score the fit twice",["The supplied times and heights describe fifteen measurements of a thrown ball. Reserve three tenths with TrainTestSplitter under seed 4, fit a degree-two curve using only its training rows, then score the fitted curve on both groups.", "This splitter takes its held-out rows from the end of the shuffled order. The page’s fixed demonstration used the beginning, so the hidden times differ even with the same seed. Print the actual held-out times, both R-squared scores and their gap. Compare the scores for these observations rather than assuming that a low-degree curve must generalize well."],`from oop_ml import (
    Dataset,
    Feature,
    MultipleLinearRegression,
    PipelineStep,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    TrainTestSplitter,
)

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
throw = Dataset([Feature("t", times)], Feature("h", heights))

curve = RegressionPipeline(
    steps=PipelineSteps([PipelineStep(name="terms", transformer=PolynomialFeatures(degree=2))]),
    model=MultipleLinearRegression(),
)
# Split the throw with three tenths held out under seed 4 and fit the curve on
# the training half. Then print the held-out times, the training score, the
# held-out score and the gap between them.`,`from oop_ml import (
    Dataset,
    Feature,
    MultipleLinearRegression,
    PipelineStep,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    TrainTestSplitter,
)

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
throw = Dataset([Feature("t", times)], Feature("h", heights))

curve = RegressionPipeline(
    steps=PipelineSteps([PipelineStep(name="terms", transformer=PolynomialFeatures(degree=2))]),
    model=MultipleLinearRegression(),
)
split = TrainTestSplitter(test_fraction=0.3, random_seed=4).split(throw)
curve.fit(split.training.input_features, split.training.target_feature)

hidden = [f"{value:.2f}" for value in split.testing.input_features[0].values]
print(f"held-out times {', '.join(hidden)}")

training = curve.score(split.training.input_features, split.training.target_feature)
held_out = curve.score(split.testing.input_features, split.testing.target_feature)
print(f"training R squared {training:.4f}")
print(f"held-out R squared {held_out:.4f}")
print(f"gap {training - held_out:.4f}")`,`held-out times 0.86, 1.43, 3.14, 4.00
training R squared 0.9963
held-out R squared 0.9924
gap 0.0038`,{...{ hints: ["TrainTestSplitter takes test_fraction and random_seed when you create it. Pass the Dataset to split. The returned DataSplit has training and testing datasets, each exposing input_features and target_feature.", "Call fit with the training dataset’s features and target. Use the testing dataset only when scoring. The pipeline builds its polynomial step during fit, keeping that preparation attached to the fitted model.", "The hidden times are the values of the testing half’s one input feature."], check: numberCheck("What R squared does the curve earn on the four rows the library hid?", 0.9924, 0.0005, "The splitter's hidden times differ from the page's fixed display split. This is a new evaluation of a similar fitted parabola, and the score should be interpreted with those actual held-out rows in view.") },question:"What score does the curve earn on the rows this splitter actually holds out?"}),
            exercise("Deal again thirty times",["One split gives one set of observations on which to judge the curve. Repeat the split under seeds 0 through 29, reserving three tenths each time. Refit the same degree-two procedure on each training group and collect its held-out R-squared.", "Report the lowest and highest held-out scores, their difference and their mean. Use the required-output labels and precision. The range describes sensitivity to these splits; it is not a cutoff for deciding whether another model is better."],`from oop_ml import (
    Dataset,
    Feature,
    MultipleLinearRegression,
    PipelineStep,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    TrainTestSplitter,
)

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
throw = Dataset([Feature("t", times)], Feature("h", heights))

curve = RegressionPipeline(
    steps=PipelineSteps([PipelineStep(name="terms", transformer=PolynomialFeatures(degree=2))]),
    model=MultipleLinearRegression(),
)
held_out_scores = []
for seed in range(30):
    # Split the throw under this seed with three tenths held out, fit the
    # curve on the training half, and append its score on the testing half.
    pass

# Print the lowest score, the highest, the spread between them and the mean,
# each to three places.`,`from oop_ml import (
    Dataset,
    Feature,
    MultipleLinearRegression,
    PipelineStep,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    TrainTestSplitter,
)

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
throw = Dataset([Feature("t", times)], Feature("h", heights))

curve = RegressionPipeline(
    steps=PipelineSteps([PipelineStep(name="terms", transformer=PolynomialFeatures(degree=2))]),
    model=MultipleLinearRegression(),
)
held_out_scores = []
for seed in range(30):
    split = TrainTestSplitter(test_fraction=0.3, random_seed=seed).split(throw)
    curve.fit(split.training.input_features, split.training.target_feature)
    held_out_scores.append(curve.score(split.testing.input_features, split.testing.target_feature))

lowest, highest = min(held_out_scores), max(held_out_scores)
print(f"lowest held-out score {lowest:.3f}")
print(f"highest held-out score {highest:.3f}")
print(f"spread {highest - lowest:.3f}")
print(f"mean {sum(held_out_scores) / len(held_out_scores):.3f}")`,`lowest held-out score 0.955
highest held-out score 0.998
spread 0.043
mean 0.988`,{...{ hints: ["The seed is the random_seed of the splitter, so each pass of the loop builds a new TrainTestSplitter with the same test_fraction and that seed.", "The same pipeline can be fitted again and again. Its fit works on copies of its steps and its model, so the configuration itself is never left fitted and each seed starts clean.", "Use score with each split’s testing input_features and target_feature. Append that returned held-out R-squared before moving to the next seed."], check: numberCheck("What is the spread of the thirty held-out scores, highest less lowest?", 0.043, 0.0005, "Changing the split alone produces a range of scores on this dataset. That range illustrates sensitivity to which rows were held out; it is not a significance threshold for comparing methods. Compare methods on matching splits and consider uncertainty in their paired differences.") },question:"How much does the score change across thirty train-test splits?"}),
            exercise("Fold the throw five ways",["Divide the fifteen observations into five folds under seed 4. Evaluate degree two and degree eight on those same folds, fitting on four folds and scoring the remaining fold each time. Report each fold’s score before calculating its mean and range.", "Compare the full lists of fold scores. Degree eight has one strongly negative result that makes its range much wider. Keep that result in the report and investigate it; a mean alone would hide how differently the procedure behaves across these folds."],`from oop_ml import (
    CrossValidation,
    Dataset,
    Feature,
    KFold,
    MultipleLinearRegression,
    PipelineStep,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
)

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
throw = Dataset([Feature("t", times)], Feature("h", heights))
folds = KFold(n_folds=5, random_seed=4)

for degree in (2, 8):
    curve = RegressionPipeline(
        steps=PipelineSteps([PipelineStep(name="terms", transformer=PolynomialFeatures(degree=degree))]),
        model=MultipleLinearRegression(),
    )
    # Cross-validate the curve over the throw with these folds, then print the
    # five fold scores to three places, and the mean and the spread.`,`from oop_ml import (
    CrossValidation,
    Dataset,
    Feature,
    KFold,
    MultipleLinearRegression,
    PipelineStep,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
)

times = [0.0, 0.29, 0.57, 0.86, 1.14, 1.43, 1.71, 2.0, 2.29, 2.57, 2.86, 3.14, 3.43, 3.71, 4.0]
heights = [0.7, 5.2, 9.5, 13.0, 16.9, 18.1, 19.4, 21.0, 19.6, 19.1, 16.8, 13.6, 11.1, 6.2, 1.2]
throw = Dataset([Feature("t", times)], Feature("h", heights))
folds = KFold(n_folds=5, random_seed=4)

for degree in (2, 8):
    curve = RegressionPipeline(
        steps=PipelineSteps([PipelineStep(name="terms", transformer=PolynomialFeatures(degree=degree))]),
        model=MultipleLinearRegression(),
    )
    result = CrossValidation(folds=folds).evaluate(curve, throw)
    scores = ", ".join(f"{evaluation.r2_score:.3f}" for evaluation in result)
    print(f"degree {degree}: fold scores {scores}")
    print(f"  mean {result.mean_r2_score:.3f}  spread {result.r2_score_spread:.3f}")`,`degree 2: fold scores 0.992, 0.992, 0.998, 0.966, 0.996
  mean 0.989  spread 0.032
degree 8: fold scores 0.979, -10.291, 0.828, 0.916, 0.369
  mean -1.440  spread 11.269`,{...{ hints: ["Create CrossValidation with the folds object. Its evaluate method takes the pipeline and the complete Dataset, then fits and scores a fresh procedure inside each fold.", "The result is iterable, one evaluation per fold, and each evaluation has an r2_score. The summaries are properties of the result, mean_r2_score and r2_score_spread.", "PolynomialFeatures holds the degree. Create a pipeline for each requested degree while reusing the same folds configuration, so the held-out observations match across the two comparisons."], check: numberCheck("What is the mean across the five folds at degree 2?", 0.989, 0.0005, "Every row is evaluated by a fit that excluded it, while the training folds overlap. The degree-two fold scores are relatively close here. The much wider degree-eight variation warns that its mean conceals unstable results; the folds still evaluate the same declared procedure.") },question:"How do the two polynomial degrees behave across the same five folds?"}),
            exercise("Deal the crowd plain and stratified",["The supplied height and weight measurements include children and adults whose measurements overlap. Compare a depth-two decision tree under five shuffled folds and under five stratified folds. Stratification distributes the known classes across the folds before fitting.", "For each split rule, report how many folds lack a class, the pooled accuracy and the range of fold accuracies. Pooled accuracy gives every held-out person equal weight. The range shows how much the fold-level results differ on this small dataset."],`from oop_ml import CrossValidation, Dataset, DecisionTreeClassifier, Feature, KFold

heights = [118, 120, 122, 125, 140, 168, 150, 159, 162, 178, 180, 183]
weights = [24, 25, 28, 31, 45, 66, 50, 57, 61, 78, 80, 83]
is_adult = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
crowd = Dataset([Feature("height", heights), Feature("weight", weights)], Feature("is_adult", is_adult))

for stratified in (False, True):
    folds = KFold(n_folds=5, random_seed=4, stratified=stratified)
    tree = DecisionTreeClassifier(max_depth=2, n_known_classes=2)
    # Deal the crowd with these folds and print how many folds miss a class.
    # Then cross-validate the tree with the same folds and print the pooled
    # accuracy and the accuracy spread.`,`from oop_ml import CrossValidation, Dataset, DecisionTreeClassifier, Feature, KFold

heights = [118, 120, 122, 125, 140, 168, 150, 159, 162, 178, 180, 183]
weights = [24, 25, 28, 31, 45, 66, 50, 57, 61, 78, 80, 83]
is_adult = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
crowd = Dataset([Feature("height", heights), Feature("weight", weights)], Feature("is_adult", is_adult))

for stratified in (False, True):
    folds = KFold(n_folds=5, random_seed=4, stratified=stratified)
    tree = DecisionTreeClassifier(max_depth=2, n_known_classes=2)
    deal = "stratified" if stratified else "plain"
    missing = folds.split(crowd).classes_missing_from_a_fold()
    result = CrossValidation(folds=folds).evaluate_classifier(tree, crowd)
    print(f"{deal} deal: folds missing a class {missing}")
    print(f"  pooled accuracy {result.pooled_accuracy:.4f}  spread {result.accuracy_spread:.4f}")`,`plain deal: folds missing a class 2
  pooled accuracy 0.5000  spread 1.0000
stratified deal: folds missing a class 0
  pooled accuracy 0.8333  spread 0.5000`,{...{ hints: ["KFold takes n_folds, random_seed and stratified when created. Call split on the dataset, then use classes_missing_from_a_fold on the returned folds to count missing-class cases.", "Use evaluate_classifier for the decision tree. Its result provides pooled_accuracy from the combined held-out counts and accuracy_spread from the highest and lowest fold accuracies.", "Set n_known_classes=2 so the tree knows both class labels are possible. A training fold missing a class should not silently redefine the number of possible outputs."], check: numberCheck("What pooled accuracy does the stratified deal report?", 0.8333, 0.0005, "Stratification keeps both classes represented in each of these folds. Pooled accuracy counts every held-out person equally, while a plain mean of unequal-size fold accuracies weights folds equally. Both remain estimates from this small dataset.") },question:"What changes when each class is distributed across the folds?"}),
          ],
        },
      ]}
    />
  );
}
