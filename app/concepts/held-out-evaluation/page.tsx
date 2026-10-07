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
  title: "Held-Out Evaluation · oop_ml",
  description:
    "Judge predictions on examples excluded from fitting, then examine how much that score can tell us.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function HeldOutEvaluationPage() {
  return (
    <ConceptPage
      lessonId="held-out-evaluation"
      intuition={lessonIntuitions["held-out-evaluation"]}
      technicalStart="Part 4. Every Row Takes a Turn"
      openingTitle="The Model Has Already Seen the Answers"
      playgroundIntro="Compare the training score with the held-out score. Change the split and notice that the evaluation itself varies with the examples chosen."
      title="Held-Out Evaluation"
      tagline="Judge predictions on examples excluded from fitting, then examine how much that score can tell us."
      prerequisites={
        <>
          This page settles a debt. Page after page here has ended by saying
          the honest judge is data the fit never saw, and here that sentence
          gets its machinery. The running example is the{" "}
          <Link href="/concepts/multiple-polynomial-regression" className={link}>
            polynomial page
          </Link>
          &rsquo;s fifteen noisy measurements of a thrown ball and its degree
          dial, so read that page first, at least as far as the degree sweep.
          The section on folding a classifier borrows the twelve overlapping
          people from{" "}
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
                  Think of a student preparing for an exam from a booklet of
                  practice questions. Score them on those same practice
                  questions and you cannot tell two very different students
                  apart, the one who understood the subject and the one who
                  memorised the answer key, since both score perfectly. The
                  only way to separate them is a question they have not seen.
                  Everything on this page is that idea applied to fits, and
                  the fit in question is a curve through the fifteen noisy
                  measurements of the thrown ball.
                </p>
                <>
<p>
                  The playground above has four of the fifteen hidden from the fit and ringed in amber, and the curve is fitted to the eleven indigo measurements alone. At degree 2 the two readouts nearly agree, 0.995 on the training share and 0.989 on the held-out one, since a parabola is what a thrown ball actually does.
                </p>
                <p>
                  At degree 9 the training share reads 0.999 and the held-out share reads about −5480. Nothing about the procedure changed between those two lines except how many polynomial terms the model could use, and the second number is what a curve that has memorised its eleven points does when it is asked about the other four.
                </p>
</>
                <KeepInMind>
                  A score on the rows a fit was optimised on measures how well
                  the curve matched those rows. Whether what it learned
                  travels to rows it has not seen is a different question, and
                  only the second one says anything about a measurement of the
                  ball not yet taken.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The training score can only climb">
                <p>
                  There is a reason the training readout in the playground
                  never falls as the degree rises, and it needs no calculus.
                  Every curve of degree d is also a curve of degree d + 1,
                  namely the one whose top coefficient is zero, so the
                  collection of curves the degree d + 1 fit may choose from
                  contains the whole collection the degree d fit chose from.
                  Least squares picks the best curve in its collection, and a
                  larger collection cannot have a worse best.
                </p>
                <Equation>{"best RSS at degree d + 1  ≤  best RSS at degree d\nso   training R² at degree d + 1  ≥  training R² at degree d"}</Equation>
                <GapCurveChart />
                <>
<p>
                  On the fixed split the training curve runs 0.222, 0.995, 0.996, 0.996, 0.996, 0.996, 0.997, 0.997, 0.999 from degree 1 to degree 9, never once falling. The held-out curve is free to do anything, and it rises to 0.989 at degree 2, wanders between 0.966 and 0.993 through degree 5, then reads 0.693, −1.396, −104 and −5479.
                </p>
                <p>
                  Read the argument for what it does not say. Nothing in it mentions the hidden rows, so the guarantee binds only the data the fit was optimised on, and a score that is guaranteed never to fall as the model grows more capable cannot say when to stop.
                </p>
</>
                <KeepInMind>
                  Every dial on this site, the polynomial degree, the ridge and
                  lasso penalties, a tree&rsquo;s depth, the number of
                  neighbours in a vote, boosting&rsquo;s rounds, moves a model
                  along this chart, and each of them has to be set by the amber
                  curve, since the indigo one has already been shown unable to
                  turn.
                </KeepInMind>
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
                  A held-out share of a few rows has a small yardstick. Its
                  total sum of squares is the spread of only those rows, so a
                  miss of the same size in metres costs far more R squared on
                  four rows than on eleven, which is the first reason a single
                  held-out score has to be read with care.
                </KeepInMind>
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
                  seven and a half rounds to the even neighbour. It also takes the held-out block from the front of the shuffled
                  order, where the library&rsquo;s own splitter takes it from the
                  end, so the two hide different rows under one seed, which the
                  practice section at the end makes visible.
                </p>
                <KeepInMind>
                  Row order in real data is rarely an accident, so the shuffle
                  is on by default and the seed is the thing to write down,
                  since the four rows that were hidden decide the verdict as
                  much as the curve does, and without the seed nobody can deal
                  those four rows again.
                </KeepInMind>
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
                  <p>
                    The eleven training rows fix three coefficients, and the
                    fitted curve is then scored twice. On the eleven it
                    explains 0.9954 of the spread, and on the four hidden rows
                    0.9890, so the gap is 0.0064. That gap is the honest price
                    of fitting to one sample of a noisy world, and it is small
                    because a parabola has too little freedom to memorise
                    eleven points.
                  </p>
                </InAModel>
                <KeepInMind>
                  Anything learned from data is part of the fit, whether it is
                  called a coefficient or a preprocessing step, and all of it
                  has to be learned from the training share.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Score the one fit twice, and read the gap">
                <p>
                  One fit, two verdicts. The training share answers how well
                  the curve matched its examples; the held-out share answers whether what it
                  learned travels, and the difference between them is a
                  signal of possible overfitting, also affected by sampling and distribution differences. On the
                  fixed deal the gap is 0.006 at degree 2, 0.030 at degree 3,
                  0.010 at degree 5 and about 5480 at degree 9, and by that
                  reading the memorisation begins in earnest at degree 6,
                  where the held-out score first drops to 0.693 while the
                  training score sits at 0.996.
                </p>
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
                <p>
                  Notice one thing the table shows that the playground&rsquo;s
                  story does not. The best held-out score on this deal is at
                  degree 4, at 0.993, and degree 2 is 0.004 behind it. A reader
                  who chose the degree by this one held-out score would pick a
                  quartic for a thrown ball, and Part 3 is about whether that
                  0.004 means anything.
                </p>
              </SubSection>

              <SubSection title="7. What the held-out share trades">
                <p>
                  Four rows is a small jury and eleven rows is a small class,
                  and the share sets both at once. Hold out fewer rows and the
                  fit is better fed while the verdict rests on two or three
                  measurements; hold out more and the verdict steadies while
                  the fit starves. The table refits the degree 2 curve under
                  thirty seeds at each share, so each row is a whole family of
                  deals rather than one.
                </p>
                <FractionTradeTable />
                <>
<p>
                  At a tenth of the rows the jury is two measurements, and across thirty deals the lowest verdict is −8.34 with a spread of 9.33, since two rows have almost no spread of their own for a ratio to explain. At three tenths the spread is 0.043, at four tenths 0.032, and at a half 0.031, after which holding out more begins to cost the fit and the spread turns back up to 0.044 at six tenths.
                </p>
                <p>
                  The mean training score moves from 0.9957 to 0.9964 over the whole table, because a parabola is easy to fit on six rows or on thirteen.
                </p>
</>
                <KeepInMind>
                  The share is a choice, and on fifteen rows there is no
                  setting of it that leaves both a well-fed fit and a
                  reliable jury. Part 4 deals the same fifteen so that every
                  measurement trains in four fits and judges in one, which is
                  the only way round that shortage on data this small.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "The training score cannot fall as the degree rises, and the argument for that needs no calculus.",
              true,
              "Every curve of degree d is also a curve of degree d + 1, namely the one whose top coefficient is zero, so the larger collection contains the smaller one and cannot have a worse best. Nothing in the argument mentions the hidden rows, so a score guaranteed never to fall as the model grows more capable cannot say when to stop.",
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
              "Each score is measured against the spread of its own share, so the yardstick on four rows is the spread of those four rows about their own mean. The degree 9 curve’s squared misses there are about 5480 times that spread, because between two of its eleven training points it swings through heights no ball ever reached.",
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
              "An unshuffled cut holds out whichever rows sit at the cut end of the time order, which here is the landing. How many are held out is the share, not the shuffle. The seed is the thing to write down, since the four rows hidden decide the verdict as much as the curve does and without it nobody can deal those four again.",
            ),
            trueFalse(
              "Only the coefficients have to be learned from the training share.",
              false,
              "Anything learned from data is part of the fit, whether it is called a coefficient or a preprocessing step. The polynomial columns here are rebuilt from the eleven training rows alone, and the point is invisible on this page only because that recipe learns the names of its columns and nothing from the rows.",
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
              "Two rows have almost no spread of their own for a ratio to explain, which is why the smallest jury gives the wildest verdicts, and past a half holding out more begins to starve the fit. The mean training score barely moves at all, from 0.9957 to 0.9964 across the whole table, because a parabola is easy to fit on six rows or on thirteen.",
            ),
        ],
        },
        {
          title: "Part 3. What a Held-Out Score Estimates",
          content: (
            <>
              <SubSection title="8. Four measurements standing in for every throw">
                <p>
                  The number we actually want is how well a curve fitted this
                  way would do on measurements of the ball we have not taken
                  yet, and no finite sample can give that number exactly. The
                  held-out score is an estimate of it, computed from four rows
                  the fit did not see, and an estimate from four rows is a
                  guess with a large margin. It is an honest guess where the
                  training score is not, since the four rows were not
                  consulted by the fit, and it is still a guess.
                </p>
                <Equation>{"held-out R²  ≈  R² the fit would earn on measurements never taken\n                 estimated from the few rows held back"}</Equation>
                <KeepInMind>
                  Honest and precise are different properties. The held-out
                  score is honest because the rows were hidden, and its
                  precision is a separate question that only repeating the
                  deal can answer.
                </KeepInMind>
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
                  At degree 2 the thirty verdicts run from 0.955 to 0.998, a spread of 0.043 around a mean of 0.988, while the mean training score across the same thirty fits is 0.996. So the 0.004 by which degree 4 beat degree 2 on the fixed deal is a tenth of the distance the verdict moves when nothing changes except which four rows were hidden, and it settles nothing.
                </p>
                <p>
                  Turn the dial to degree 5 and the lowest verdict is 0.355 against a highest of 0.998, a spread of 0.643, which is the same curve family being called excellent by one deal and poor by another.
                </p>
</>
                <KeepInMind>
                  A difference between two held-out scores means something
                  only when it is larger than the movement the seed alone
                  produces. On this data at this share that movement is
                  0.043 for a parabola and 0.643 for a quintic.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Why the verdict is so much noisier than the fit">
                <>
<p>
                  The two summaries in the strip behave very differently as the seed changes, and the reason is which rows each one reads. The training score is computed on eleven rows and they are the same rows the coefficients were chosen to please, so it barely moves. The held-out score is computed on four rows the curve had no say over, and which four they are decides how hard the question is.
                </p>
                <p>
                  A held-out share that happens to hold the landing, where the ball is moving fastest and the noise costs most, asks a harder question than one that holds four measurements from the top of the arc.
                </p>
</>
                <WhyThisWorks title="Why a small held-out share amplifies the wobble">
                  <>
<p>
                    The score is a ratio, and its denominator is the spread of the held-out rows about their own mean. Four rows drawn from near the peak of the arc have heights within a metre or two of each other, so their total sum of squares is small and any miss at all costs a large fraction of it.
                  </p>
                  <p>
                    Four rows drawn from across the whole flight have heights spanning twenty metres, and the same misses cost almost nothing. The seed decides which of those two juries sits, and the score moves with it even when the curve is nearly the same fit each time.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  Most of the wobble in a held-out score on small data comes
                  from which rows sit on the jury. The fits under the thirty
                  seeds are nearly identical parabolas, and the verdicts still
                  span 0.043.
                </KeepInMind>
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
                  Under the page&rsquo;s seed the five folds hold measurements 1, 10 and 12, then 0, 2 and 7, then 8, 9 and 13, then 3, 4 and 6, then 5, 11 and 14, and at degree 2 they score 0.992, 0.992, 0.998, 0.966 and 0.996. The fourth fold holds measurements 3, 4 and 6, three heights between 13 and 19.4 metres near the top of the arc, and it is the one that scores lowest, for the reason section 10 gave.
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
                <p>
                  The summary of five fold scores on this page is their
                  mean, and read across every degree it is the validation
                  curve, the chart on this site that every dial is set by.
                  The candidate at each degree is the whole pipeline, the
                  column manufacturing and the regression together, refitted
                  inside every fold so no fold ever scores a column built
                  from rows it is about to judge.
                </p>
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
                  The mean across folds is the headline number, and on this
                  data it is a number to act on at degree 2, where the folds
                  sit within 0.032 of each other, and a number to distrust at
                  degree 8, where they sit 11.27 apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. The spread, and what it is not">
                <p>
                  The second number reported is the spread, the best
                  fold&rsquo;s score less the worst&rsquo;s. At degree 2
                  it is 0.032, so the five verdicts nearly agree and the mean
                  stands on firm ground. At degree 8 the five folds read
                  0.979, −10.29, 0.828, 0.916 and 0.369, a spread of 11.27,
                  and the mean of −1.44 above that band is an average of
                  verdicts that have nothing in common. The honest reading is
                  that a degree 8 curve has become a gamble on which three
                  rows it is denied.
                </p>
                <NumberTable
                  headings={["degree", "the five folds", "mean", "spread"]}
                  rows={[
                    ["1", "−0.40, −0.72, −0.23, −3.81, −0.98", "−1.230", "3.580"],
                    ["2", "0.992, 0.992, 0.998, 0.966, 0.996", "0.989", "0.032"],
                    ["5", "0.987, 0.991, 0.997, 0.962, 0.970", "0.981", "0.035"],
                    ["8", "0.979, −10.29, 0.828, 0.916, 0.369", "−1.440", "11.27"],
                  ]}
                  caption="Five folds under the page&rsquo;s seed. The spread is what says whether the mean beside it may be trusted."
                />
                <p>
                  Two things the spread is not. It is not a standard error,
                  since it is a range over five numbers and grows with the
                  number of folds for that reason alone, so it prices the
                  trust in one mean and should not be used as a threshold for
                  choosing between two. And the five verdicts are not
                  independent, because any two of the five fits share three of
                  their four training folds, so the folds agreeing with each
                  other is weaker evidence than five separate experiments
                  agreeing would be.
                </p>
                <KeepInMind>
                  A wide spread means the estimate itself is unreliable, and
                  no single number can say that about itself, so a mean
                  quoted without its spread has left out the one figure that
                  says whether it was a measurement or a lucky deal.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Pooling the held-out predictions is a different number">
                <p>
                  There is a second way to summarise the folds. Instead of
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
                  The mean across folds is what a regressor reports here,
                  and the pooled score is computed for this page from the
                  same fifteen held-out predictions. Neither is wrong; they
                  answer with different yardsticks, and the difference is the
                  argument Part 5 makes about classifiers, where only one of
                  the two survives.
                </KeepInMind>
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
                  Leave-one-out is not free of judgement even though it has no
                  seed. It costs a fit per row, the fifteen fits are almost
                  identical to each other, and its per-fold score is undefined
                  for any metric with the fold&rsquo;s own spread underneath,
                  so it has to be summarised by pooling.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. The out-of-bag cousin">
                <p>
                  One more debt closes here. The{" "}
                  <Link href="/concepts/bagging" className={link}>
                    bagging page
                  </Link>
                  &rsquo;s out-of-bag score is this same idea collected free
                  of charge. Each member of a bagged committee is fitted on a
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
              "At degree 2 the thirty seeded verdicts run from 0.955 to 0.998. What does that say about degree 4 beating degree 2 by 0.004 on the fixed deal?",
              [
                "It settles nothing, since 0.004 is a tenth of the distance the verdict moves when only the hidden rows change",
                "It confirms degree 4, since a spread of 0.043 is narrow",
                "It means degree 4 would have won under every seed",
                "It means the fixed deal was an unlucky one",
              ],
              0,
              "A difference between two held-out scores means something only when it is larger than the movement the seed alone produces. Turn the dial to degree 5 and the lowest verdict is 0.355 against a highest of 0.998, which is one curve family called excellent by one deal and poor by another.",
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
              "The fits under the thirty seeds are nearly identical parabolas and the verdicts still span 0.043. Four rows drawn from across the whole flight have heights spanning twenty metres and the same misses cost almost nothing, where four from the top of the arc sit within a metre or two of each other.",
            ),
            trueFalse(
              "The spread across folds is a range over five numbers rather than a standard error, so it prices the trust in one mean and is not a threshold for choosing between two candidates.",
              true,
              "It grows with the number of folds for that reason alone, and the five verdicts are not independent either, since any two of the five fits share three of their four training folds, so their agreement is weaker evidence than five separate experiments agreeing. At degree 2 the folds sit within 0.032 of each other and the mean of 0.989 stands on firm ground; at degree 8 they sit 11.27 apart and the mean of −1.44 is an average of verdicts with nothing in common.",
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
              "The same misses cost that fold 0.034 of R squared and cost the pooled figure almost nothing, because pooling measures against the spread of all fifteen measurements. At degree 8 the two part company harder, −1.44 against −2.76, and neither is wrong, since they answer with different yardsticks.",
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
              "Pooling measures the misses against the spread of all fifteen rows, and a single held-out row contributes only its miss, so the pooled score carries on, 0.993 at ten folds and 0.993 at fifteen, and leave-one-out has to be summarised that way. It is not free of judgement either, since it costs a fit per row and the fifteen fits are almost identical to each other.",
            ),
        ],
        },
        {
          title: "Part 5. Folding a Classifier",
          content: (
            <>
              <SubSection title="17. A plain deal can leave a fold without a class">
                <p>
                  The throw has a number to predict at every row, so any three
                  rows make a fold that can be scored. A classifier&rsquo;s
                  folds are different, because a fold is only a test of the
                  boundary if it holds people from both sides of it. The
                  twelve overlapping people from judging a classifier, six
                  children and six adults, dealt plain into five folds under
                  the page&rsquo;s seed, show what a shuffle-and-cut can do
                  with two classes.
                </p>
                <ClassifierFoldDeck />
                <>
<p>
                  Under the plain deal the five folds hold 1, 2, 2, 0 and 1 adults, so the fourth fold holds two children and no adult and the third holds two adults and no child, so the count of folds missing a class is two. A tree two questions deep is refitted inside each fold. On the third fold it gets neither adult right, because the two it was denied, at 150 and 159 centimetres, are exactly the two adults inside the children&rsquo;s range, and the tree trained without them puts both on the children&rsquo;s side.
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
                  Stratification is off by default because it is meaningless
                  on a continuous target, and on a classification target it
                  is close to mandatory. Turn it on
                  and still read the count of folds missing a class.
                </KeepInMind>
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
                  Pooled rates weight each fold by its own size, which is the
                  right weighting because a fold holding two people is two
                  people&rsquo;s worth of evidence, and the pooled form needs
                  no convention for an empty denominator. The two forms agree
                  only when every fold is the same size and every rate is
                  defined on every fold.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Accuracy is the one rate that may be spread">
                <p>
                  The regression result reports a spread across folds beside
                  its mean, and the classification result reports one too,
                  for accuracy alone. Accuracy is a count of people got right
                  over a count of people held out, and every fold with anyone
                  in it has both counts, so the five accuracies always exist
                  and their range can be read. Recall and precision cannot be
                  spread the same way, since on the plain deal one fold has no
                  recall to contribute and the range over four numbers would
                  be pretending to be a range over five.
                </p>
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
                  A spread is only honest over rates that exist on every fold.
                  Accuracy always does, so it is the one ranged across
                  folds, and even that range is coarse when a fold
                  holds two people.
                </KeepInMind>
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
                  spread from the rows is part of the fit. Standardise the
                  columns once over all fifteen measurements before dealing
                  the folds, and every training fold has been scaled by a
                  mean that the held-out rows helped to compute. The table
                  measures what that costs on the throw, for the degree 2
                  terms scaled either before the folds are dealt or refitted
                  inside each fold, under thirty seeds.
                </p>
                <LeakTable />
                <>
<p>
                  For a ridge fit at a penalty of 0.01 the mean score is 0.9676 scaled beforehand and 0.9669 scaled inside, a gap of +0.0007 that flattered 15 of the 30 seeds and went the other way on the other 15, with the largest single-seed gap at 0.019. That is the same shape the pipelines page found on its larger measurement, a leak within noise of zero with about half the seeds flattered, because a mean and a spread do not consult the answers and so cannot lean the fit toward them.
                </p>
                <p>
                  Raise the penalty to 0.1 and the gap is +0.014 with 9 of 30 flattered; lower it to 0.001 and it is +0.00007. Measured on the throw, then, the leak is a few thousandths at most, with the seeds divided about evenly on its sign.
                </p>
</>
                <KeepInMind>
                  A step that learns from the rows without reading the target
                  leaks a little and in no particular direction. A step that
                  reads the target, such as choosing a column by its
                  correlation with the answers, leaks a bias that survives
                  every seed, which the pipelines page measures and this
                  page&rsquo;s one-column throw cannot exhibit, since there
                  is no column to choose.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Why the least-squares fit cannot feel it">
                <p>
                  The second row of the table is the control, and it is exact.
                  A least-squares fit with an intercept is unchanged by
                  shifting any column or scaling it, since the intercept
                  absorbs the shift and the coefficient absorbs the scale and
                  the fitted heights come out identical. So it does not matter
                  where the standardiser learned its mean, and the two
                  arrangements agree to the last decimal, a mean gap of
                  7.5 × 10⁻¹⁶ and a largest single-seed gap of 2.9 × 10⁻¹⁴,
                  which is floating-point rounding and nothing else.
                </p>
                <WhyThisWorks title="Why scaling a column cannot move a least-squares fit">
                  <>
<p>
                    Replace a column c by (c − m) / s. Any fitted height that used c with coefficient b can be written with the new column and coefficient b s, plus b m added to the intercept, so the set of curves the fit can choose from is the same set as before. Least squares picks the best curve in the set, and the same set has the same best, whichever m and s the standardiser learned and from whichever rows.
                  </p>
                  <p>
                    The ridge fit is different because its penalty is on the coefficients themselves, and b s is a different size from b, so the penalty reads the columns through their scale and a scale learned from different rows is a different penalty.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  Whether a leak can flatter depends on whether the model
                  reads what leaked. The rule to fit inside the fold is kept
                  anyway, since the same standardiser sits in front of the
                  ridge fit on this page and the neighbour vote on the
                  pipelines page, and only the least-squares fit is immune.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The held-out share is spent once">
                <p>
                  There is a leak the folds cannot close, and this page has
                  already committed it. Section 12 read the validation curve
                  and chose degree 2, and the score it chose by, 0.989, is
                  now the best of nine candidates rather than the score of
                  one, and the best of several noisy estimates is higher than
                  any of them deserves. Nine candidates on a smooth curve make
                  the effect small here, and the{" "}
                  <Link href="/concepts/grid-search" className={link}>
                    grid search page
                  </Link>{" "}
                  measures it on a case built to show it, twenty-five
                  candidates on a target of pure noise, where the winner
                  reported a score no candidate could honestly earn.
                </p>
                <KeepInMind>
                  Once a held-out score has been used to choose, it is a
                  training score for that choice. The score to report is one
                  computed on rows that took no part in the choosing, which
                  means a further share held back from the whole selection or
                  a second layer of folds around the first.
                </KeepInMind>
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
              "On the third fold the tree gets neither adult right, because the two it was denied, at 150 and 159 centimetres, are exactly the two adults inside the children’s range. Dealing each class round the folds in turn takes the adult counts to 1, 2, 1, 1 and 1 and leaves recall defined everywhere.",
            ),
            trueFalse(
              "A stratified deal guarantees that no fold is missing a class.",
              false,
              "Stratifying distributes what exists and cannot manufacture what does not. Relabel the crowd so that only one adult remains and four of the five folds hold no adult whatever the seed, since one person can only be in one fold, which is why the count of folds missing a class is reported rather than assumed to be zero once the deal is stratified.",
            ),
            choice(
              "Why is a classifier summarised by pooling the folds rather than averaging them?",
              [
                "Recall on a fold with no adults is zero over zero, and pooling adds zero to both sides of the ratio where averaging needs a convention",
                "Averaging is the slower of the two to compute",
                "Pooling gives every fold an equal vote, whatever its size",
                "Averaging cannot be applied to a confusion table at all",
              ],
              0,
              "Twelve people do not divide into five equal folds either, so averaging gives a fold of two the same vote as a fold of three. Pooled recall reads 2 of 6 adults found, which is the number the twelve people actually earned, and accuracy is the one rate defined on every fold with anyone in it, which is why it is the only one given a spread.",
            ),
            choice(
              "Standardising all fifteen measurements before the folds are dealt, for a ridge fit at a penalty of 0.01, cost what?",
              [
                "A mean gap of +0.0007, flattering 15 of the 30 seeds and going the other way on the other 15",
                "A bias of about 0.019 that survived every seed",
                "Nothing at all, since the columns are rebuilt inside each fold anyway",
                "A gap that grew as the penalty was lowered",
              ],
              0,
              "A step that learns from the rows without reading the target leaks a little and in no particular direction, since a mean and a spread cannot lean the fit toward the answers. The control row is exact, because a least-squares fit with an intercept is unchanged by any shift or scale and the two arrangements agree to a mean gap of 7.5 × 10⁻¹⁶, where ridge reads the columns through their scale because its penalty is on the coefficients themselves.",
            ),
            trueFalse(
              "Once the validation curve has been read and degree 2 chosen by its 0.989, that score has become a training score for the choice.",
              true,
              "The 0.989 is now the best of nine candidates rather than the score of one, and the best of several noisy estimates is higher than any of them deserves. Nine candidates on a smooth curve keep the effect small here, and the number to report is one computed on rows that took no part in the choosing, a further share held back from the whole selection or a second layer of folds around the first.",
            ),
        ],
        },
        {
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="24. What a complete implementation specifies">
                <>
<p>
                  A held-out evaluation states its deal in full. The share held out and how it is rounded to a row count, whether the rows are shuffled and by what seed, which block of the shuffled order is held out, how many folds and how uneven sizes are handled, whether the folds are stratified and on what column, what is refitted inside every fold, which metric is read on a fold and what happens when that metric is undefined there, whether the folds are averaged or pooled, and what the spread beside the summary is a range of.
                </p>
                <p>
                  Every one of those is a number a reader can check only if it is written down.
                </p>
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

              <SubSection title="25. The edges, each one run">
                <p>
                  What follows is what the code behind this page actually
                  does at every edge a reader might hand it, each row run
                  rather than remembered. Most are refused by name, a few are
                  refused at the door before any fitting begins, two are
                  accepted with a fact reported beside the answer, and one is
                  documented rather than defended.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
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
                    { expression: "a half of fifteen rows", reason: "accepted as eight held out and seven kept, because seven and a half rounds to the even neighbour; documented rather than defended." },
                    { expression: "a classifier's crowd of one class", reason: "accepted; a tree told the class count answers that class everywhere, scores an accuracy of 1.0, and recall is reported as undefined rather than as zero." },
                    { expression: "one adult among twelve, stratified", reason: "accepted, and four of five folds still hold no adult, because stratifying cannot manufacture a class; the count of folds missing a class says so." },
                    { expression: "a label other than 0 or 1, or an unknown keyword", reason: "refused at the door." },
                    { expression: "reading a score before a fit", reason: "refused by name underneath, and unreachable through this page, which never scores an unfitted curve." },
                    { expression: "a held-out share whose column names differ from the fit's", reason: "refused by name, the expansion needs t and got time; a share missing a manufactured term is refused the same way." },
                    { expression: "predictions and truth of different lengths", reason: "refused by name before any metric is read." },
                  ]}
                />
                <p>
                  Every row of that table was run for this page. The one
                  behaviour documented rather than defended is
                  the rounding of the held-out share, which follows the
                  round-half-to-even rule the language uses, so a reader who
                  expects a half of fifteen to hold out seven should read the
                  count the response reports rather than assume it.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Practice. Dealing the Split and the Folds With the Library",
          practice: [
            exercise(
              "Hold out four rows and score the fit twice",
              ["Deal the fifteen measurements of the thrown ball with the library’s own splitter, three tenths held out under seed 4, fit a degree 2 curve on the eleven training rows alone, and score it on both shares.", "The library cuts its held-out block from the end of the shuffled order, where the page’s fixed deal was drawn from the front of the same order, so the four rows it hides under seed 4 are not the four ringed in the playground. Print which times were hidden and both scores. Neither score is a number the page quotes, and the gap between them should still be small, since a parabola has too little freedom to memorise eleven points."],
              `from oop_ml import (
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
# held-out score and the gap between them.`,
              `from oop_ml import (
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
print(f"gap {training - held_out:.4f}")`,
              `held-out times 0.86, 1.43, 3.14, 4.00
training R squared 0.9963
held-out R squared 0.9924
gap 0.0038`,
              { hints: ["TrainTestSplitter takes test_fraction and random_seed at construction, and its split takes the Dataset and answers a DataSplit with a training half and a testing half, each a Dataset of its own with input_features and target_feature.", "Fit on the training half’s input_features and target_feature, then score on the testing half’s. The pipeline rebuilds the squared term inside its fit, so the hidden rows are transformed by a recipe that never saw them.", "The hidden times are the values of the testing half’s one input feature."], check: numberCheck("What R squared does the curve earn on the four rows the library hid?", 0.9924, 0.0005, "The library hid the measurements at 0.86, 1.43, 3.14 and 4.0 seconds, which are not the page’s four, so this is a different jury asking a different question of a nearly identical parabola. It still lands close to the training score, because a degree 2 curve has too little freedom to memorise eleven points, which is why the page’s own fixed deal showed a gap of only 0.0064.") },
            ),
            exercise(
              "Deal again thirty times",
              ["Part 3 says the way to find out what a single held-out score is worth is to deal again. Refit the degree 2 curve under seeds 0 to 29, three tenths held out each time, and collect the thirty held-out scores.", "Print the lowest, the highest, the spread between them and the mean. Part 3 quotes a range of 0.955 to 0.998, a spread of 0.043 and a mean of 0.988, and the library’s splitter is what produced those, so they should come back to the last printed digit."],
              `from oop_ml import (
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
# each to three places.`,
              `from oop_ml import (
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
print(f"mean {sum(held_out_scores) / len(held_out_scores):.3f}")`,
              `lowest held-out score 0.955
highest held-out score 0.998
spread 0.043
mean 0.988`,
              { hints: ["The seed is the random_seed of the splitter, so each pass of the loop builds a new TrainTestSplitter with the same test_fraction and that seed.", "The same pipeline can be fitted again and again. Its fit works on copies of its steps and its model, so the configuration itself is never left fitted and each seed starts clean.", "A score is the held-out R squared, which is score called with the testing half’s input_features and target_feature."], check: numberCheck("What is the spread of the thirty held-out scores, highest less lowest?", 0.043, 0.0005, "The thirty fits are nearly identical parabolas, and the verdicts still run from 0.955 to 0.998, because which four rows sit on the jury decides the spread underneath the ratio. That 0.043 is the movement the seed alone produces, and a difference between two held-out scores means something only when it is larger than that, which is why the 0.004 by which degree 4 beat degree 2 on the fixed deal settles nothing.") },
            ),
            exercise(
              "Fold the throw five ways",
              ["Part 4 lets every row take a turn as the judge. Deal the fifteen measurements into five folds under seed 4 and cross-validate the curve at degree 2 and at degree 8, reading the five fold scores, their mean and their spread each time.", "The folds under this seed are the page’s own, so at degree 2 the five verdicts should be 0.992, 0.992, 0.998, 0.966 and 0.996 with a mean of 0.989 and a spread of 0.032, and at degree 8 the spread should be the 11.27 that makes the mean of −1.44 a number to distrust."],
              `from oop_ml import (
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
    # five fold scores to three places, and the mean and the spread.`,
              `from oop_ml import (
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
    print(f"  mean {result.mean_r2_score:.3f}  spread {result.r2_score_spread:.3f}")`,
              `degree 2: fold scores 0.992, 0.992, 0.998, 0.966, 0.996
  mean 0.989  spread 0.032
degree 8: fold scores 0.979, -10.291, 0.828, 0.916, 0.369
  mean -1.440  spread 11.269`,
              { hints: ["CrossValidation is built from the folds, and its evaluate takes the model and the whole Dataset. It deals the folds, refits the pipeline inside each one, and answers one result.", "The result is iterable, one evaluation per fold, and each evaluation has an r2_score. The summaries are properties of the result, mean_r2_score and r2_score_spread.", "The degree lives on the PolynomialFeatures step, so the pipeline is rebuilt for each degree while the folds stay the same object, which is what keeps the two degrees judged on the same deal."], check: numberCheck("What is the mean across the five folds at degree 2?", 0.989, 0.0005, "Every measurement is judged exactly once by a fit that never saw it, and the five verdicts 0.992, 0.992, 0.998, 0.966 and 0.996 average to 0.989 with a spread of 0.032, so the mean stands on firm ground. At degree 8 the folds read 0.979, −10.291, 0.828, 0.916 and 0.369, a spread of 11.27, and the mean of −1.44 above that band is an average of verdicts that have nothing in common.") },
            ),
            exercise(
              "Deal the crowd plain and stratified",
              ["Part 5 deals the twelve overlapping people into five folds two ways. Fold them with a tree two questions deep, first by a plain shuffle-and-cut and then stratified, and read the count of folds missing a class, the pooled accuracy and the accuracy spread for each deal.", "The plain deal under seed 4 leaves two folds without one of the classes and pools to an accuracy of 0.5 over a spread of 1.0; the stratified deal leaves none and pools to 0.8333 over a spread of 0.5. Both come from the library’s own folding, so all four numbers should match."],
              `from oop_ml import CrossValidation, Dataset, DecisionTreeClassifier, Feature, KFold

heights = [118, 120, 122, 125, 140, 168, 150, 159, 162, 178, 180, 183]
weights = [24, 25, 28, 31, 45, 66, 50, 57, 61, 78, 80, 83]
is_adult = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
crowd = Dataset([Feature("height", heights), Feature("weight", weights)], Feature("is_adult", is_adult))

for stratified in (False, True):
    folds = KFold(n_folds=5, random_seed=4, stratified=stratified)
    tree = DecisionTreeClassifier(max_depth=2, n_known_classes=2)
    # Deal the crowd with these folds and print how many folds miss a class.
    # Then cross-validate the tree with the same folds and print the pooled
    # accuracy and the accuracy spread.`,
              `from oop_ml import CrossValidation, Dataset, DecisionTreeClassifier, Feature, KFold

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
    print(f"  pooled accuracy {result.pooled_accuracy:.4f}  spread {result.accuracy_spread:.4f}")`,
              `plain deal: folds missing a class 2
  pooled accuracy 0.5000  spread 1.0000
stratified deal: folds missing a class 0
  pooled accuracy 0.8333  spread 0.5000`,
              { hints: ["KFold takes n_folds, random_seed and stratified at construction, and its split answers the folds, which can say how many of them miss a class.", "CrossValidation has two entry points, and evaluate_classifier is the one for a classifier. Its result has pooled_accuracy, which adds the folds’ tables and divides once, and accuracy_spread, the best fold less the worst.", "n_known_classes tells the tree the class count, which is what the page’s deal does, so a training fold short of a class would still answer with the full width."], check: numberCheck("What pooled accuracy does the stratified deal report?", 0.8333, 0.0005, "Dealing each class round the folds in turn takes the adult counts to 1, 2, 1, 1 and 1, no fold misses a class, and the pooled table reads 10 of 12 people right. Pooling counts each person once rather than each fold once, which is why it reads 0.8333 where averaging the five fold accuracies reads 0.8, and the spread of 0.5 is still one person in a fold of two.") },
            ),
          ],
        },
      ]}
    />
  );
}
