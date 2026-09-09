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
    "Hide some of the data from the fit, then let the hidden share judge it, and find out how much one such verdict is worth.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function HeldOutEvaluationPage() {
  return (
    <ConceptPage
      title="Held-Out Evaluation"
      tagline="Hide some data from the fit, let the hidden share be the judge, and then ask how far to trust the judge."
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
      history={
        <>
          <p>
            The embarrassment arrived before the remedy. In 1931 Selmer Larson,
            working on the regression equations that American colleges were
            fitting to predict a student&rsquo;s grades from entrance tests,
            published a paper in the Journal of Educational Psychology titled
            The Shrinkage of the Coefficient of Multiple Correlation, and the
            title was the finding. An equation fitted to one cohort correlated
            well with that cohort&rsquo;s grades and noticeably worse with the
            next cohort&rsquo;s, every time, and the more predictors the
            equation carried the further it fell. The researchers could see
            the fall only when a second cohort arrived, which might be a year
            later, and until then they had no way of knowing how much of an
            equation&rsquo;s fit was the students it had been fitted to.
          </p>
          <p>
            The remedy was to manufacture the second cohort out of the first.
            Fit on half the students and score on the other half, which
            Charles Mosier, in a 1951 paper in Educational and Psychological
            Measurement, named cross-validation and set out as a design rather
            than a habit. Peter Lachenbruch and Ray Mickey showed in 1968 that
            for a discriminant rule one could hold out a single case at a
            time and refit for each, and Mervyn Stone in 1974 and Seymour
            Geisser in 1975, working separately, gave the fold-by-fold version
            its general form and its argument, that every row can take a turn
            as the judge and the fit that is finally used can still see nearly
            all of the data. Ron Kohavi&rsquo;s 1995 comparison of the
            variants, run over many datasets, is the paper behind the modern
            habit of ten stratified folds, and it measured the two cautions
            this page repeats on fifteen rows, that a single split is a noisy
            judge and that folds have to be dealt with the classes in mind.
          </p>
          <p>
            The page asks six questions in order. Why does a score on the rows
            the fit saw flatter, and by how much here? What does a single
            held-out split do, and how is the deal made? What does a held-out
            score estimate, and how far does it move when the deal changes?
            What does folding add, and what does the spread across folds mean?
            How should a classifier be folded and its folds combined? And what
            leaks when a step that learns from data is fitted before the
            split, measured on the throw?
          </p>
        </>
      }
      playground={<HoldOutPlayground />}
      sections={[
        {
          title: "Part 1. Why a Training Score Flatters",
          defaultOpen: true,
          content: (
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
                <p>
                  The playground above has four of the fifteen hidden from the
                  fit and ringed in amber, and the curve is fitted to the
                  eleven indigo measurements alone. At degree 2 the two
                  readouts nearly agree, 0.995 on the training share and 0.989
                  on the held-out one, since a parabola is what a thrown ball
                  actually does. At degree 9 the training share reads 0.999
                  and the held-out share reads about −5480. Nothing about the
                  procedure changed between those two lines except how many
                  bends the curve was allowed, and the second number is what a
                  curve that has memorised its eleven points does when it is
                  asked about the other four.
                </p>
                <KeepInMind>
                  A score on the rows a fit was optimised on measures how well
                  the curve bent to those rows. Whether what it learned
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
                <p>
                  On the fixed split the training curve runs 0.222, 0.995,
                  0.996, 0.996, 0.996, 0.996, 0.997, 0.997, 0.999 from degree
                  1 to degree 9, never once falling. The held-out curve is
                  free to do anything, and it rises to 0.989 at degree 2,
                  wanders between 0.966 and 0.993 through degree 5, then
                  reads 0.693, −1.396, −104 and −5479. Read the argument for
                  what it does not say. Nothing in it mentions the hidden rows,
                  so the guarantee binds only the data the fit was optimised
                  on, and a score that is guaranteed never to fall as the
                  model grows more capable cannot say when to stop.
                </p>
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
          ),
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
                  seven and a half rounds to the even neighbour. It also cuts
                  the held-out block from the end of the shuffled order, so an
                  unshuffled split holds out the tail.
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
                  the curve bent, the held-out share answers whether what it
                  learned travels, and the difference between them is a
                  measurement of how much of the fit was memorisation. On the
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
                <p>
                  At a tenth of the rows the jury is two measurements, and
                  across thirty deals the lowest verdict is −8.34 with a spread
                  of 9.33, since two rows have almost no spread of their own
                  for a ratio to explain. At three tenths the spread is 0.043,
                  at four tenths 0.032, and at a half 0.031, after which
                  holding out more begins to cost the fit and the spread turns
                  back up to 0.044 at six tenths. The mean training score moves
                  from 0.9957 to 0.9964 over the whole table, because a
                  parabola is easy to fit on six rows or on thirteen.
                </p>
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
                <p>
                  At degree 2 the thirty verdicts run from 0.955 to 0.998, a
                  spread of 0.043 around a mean of 0.988, while the mean
                  training score across the same thirty fits is 0.996. So the
                  0.004 by which degree 4 beat degree 2 on the fixed deal is a
                  tenth of the distance the verdict moves when nothing changes
                  except which four rows were hidden, and it settles nothing.
                  Turn the dial to degree 5 and the lowest verdict is 0.355
                  against a highest of 0.998, a spread of 0.643, which is the
                  same curve family being called excellent by one deal and
                  poor by another.
                </p>
                <KeepInMind>
                  A difference between two held-out scores means something
                  only when it is larger than the movement the seed alone
                  produces. On this data at this share that movement is
                  0.043 for a parabola and 0.643 for a quintic.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Why the verdict is so much noisier than the fit">
                <p>
                  The two summaries in the strip behave very differently as
                  the seed changes, and the reason is which rows each one
                  reads. The training score is computed on eleven rows and
                  they are the same rows the coefficients were chosen to
                  please, so it barely moves. The held-out score is computed
                  on four rows the curve had no say over, and which four they
                  are decides how hard the question is. A held-out share that
                  happens to hold the landing, where the ball is moving
                  fastest and the noise costs most, asks a harder question
                  than one that holds four measurements from the top of the
                  arc.
                </p>
                <WhyThisWorks title="Why a small held-out share amplifies the wobble">
                  <p>
                    The score is a ratio, and its denominator is the spread of
                    the held-out rows about their own mean. Four rows drawn
                    from near the peak of the arc have heights within a metre
                    or two of each other, so their total sum of squares is
                    small and any miss at all costs a large fraction of it.
                    Four rows drawn from across the whole flight have heights
                    spanning twenty metres, and the same misses cost almost
                    nothing. The seed decides which of those two juries sits,
                    and the score moves with it even when the curve is nearly
                    the same fit each time.
                  </p>
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
                <p>
                  Under the page&rsquo;s seed the five folds hold measurements
                  1, 10 and 12, then 0, 2 and 7, then 8, 9 and 13, then 3, 4
                  and 6, then 5, 11 and 14, and at degree 2 they score 0.992,
                  0.992, 0.998, 0.966 and 0.996. The fourth fold holds
                  measurements 3, 4 and 6, three heights between 13 and 19.4
                  metres near the top of the arc, and it is the one that
                  scores lowest, for the reason section 10 gave. Fifteen rows
                  do not always divide evenly, and when they do not the
                  extra rows go to the earlier folds, so ten
                  folds of fifteen are five folds of two and five of one.
                </p>
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
                <p>
                  From two folds to five the mean across folds moves from
                  0.991 to 0.989 and the pooled score from 0.991 to 0.994,
                  which is the difference between fits trained on seven or
                  eight rows and fits trained on twelve. At ten folds five of
                  the folds hold a single measurement, and at fifteen every
                  fold does, which is leave-one-out. A fold of one row has no
                  spread about its own mean, so its R squared is a ratio with
                  zero underneath, and it is refused by name rather than
                  reported as a number. The mean across folds therefore
                  stops existing at ten folds, while the pooled score carries
                  on, 0.993 at ten and 0.993 at fifteen, because pooling
                  measures the misses against the spread of all fifteen rows
                  and a single held-out row contributes only its miss.
                </p>
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
                <p>
                  Under the plain deal the five folds hold 1, 2, 2, 0 and 1
                  adults, so the fourth fold holds two children and no adult
                  and the third holds two adults and no child, so the count
                  of folds missing a class is two. A tree two questions deep
                  is refitted inside each fold. On the third fold it gets
                  neither adult right, because the two it was denied, at 150
                  and 159 centimetres, are exactly the two adults inside the
                  children&rsquo;s range, and the tree trained without them
                  puts both on the children&rsquo;s side. On the fourth fold the question
                  of recall cannot be asked at all, since recall is the share
                  of adults found and the fold has no adults to find.
                </p>
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
                <p>
                  With the folds scored there are two ways to combine five
                  accuracies into one. Average the five, so each fold counts
                  equally, or add the five folds&rsquo; confusion tables into
                  one table and divide once, so each person counts equally.
                  On the plain deal the averaged accuracy is 0.4667 and the
                  pooled accuracy is 0.5, and on the stratified deal they are
                  0.8 and 0.8333. Twelve people do not divide into five equal
                  folds, so averaging gives a fold of two the same vote as a
                  fold of three, and the two disagree by exactly that
                  reweighting.
                </p>
                <Equation>{"pooled     ( Σ rightₖ ) / ( Σ heldₖ )        =  6 / 12  on the plain deal\naveraged   (1/5) Σ  rightₖ / heldₖ           =  0.4667  on the plain deal"}</Equation>
                <p>
                  The reweighting is a nuisance, and the fold with no adults
                  is what settles the question. Recall on that fold is zero found over
                  zero present, and averaging has to do something with it,
                  either drop the fold and average the other four, which
                  gives 0.5 here, or invent a value. Pooling adds zero to the
                  top of the ratio and zero to the bottom and needs no
                  convention, and it reads 2 of 6 adults found, 0.3333, which
                  is the number the twelve people actually earned. A classifier
                  here is scored by pooling for exactly this reason, with a
                  spread reported only for accuracy, which is the one rate that
                  is defined on any fold with people in it.
                </p>
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
                <p>
                  For a ridge fit at a penalty of 0.01 the mean score is
                  0.9676 scaled beforehand and 0.9669 scaled inside, a gap of
                  +0.0007 that flattered 15 of the 30 seeds and went the other
                  way on the other 15, with the largest single-seed gap at
                  0.019. That is the same shape the pipelines page found on
                  its larger measurement, a leak within noise of zero with
                  about half the seeds flattered, because a mean and a spread
                  do not consult the answers and so cannot lean the fit toward
                  them. Raise the penalty to 0.1 and the gap is +0.014 with 9
                  of 30 flattered; lower it to 0.001 and it is +0.00007.
                  Measured on the throw, then, the leak is a few thousandths
                  at most, with the seeds divided about evenly on its sign.
                </p>
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
                  <p>
                    Replace a column c by (c − m) / s. Any fitted height that
                    used c with coefficient b can be written with the new
                    column and coefficient b s, plus b m added to the
                    intercept, so the set of curves the fit can choose from is
                    the same set as before. Least squares picks the best curve
                    in the set, and the same set has the same best, whichever
                    m and s the standardiser learned and from whichever rows.
                    The ridge fit is different because its penalty is on the
                    coefficients themselves, and b s is a different size from
                    b, so the penalty reads the columns through their scale
                    and a scale learned from different rows is a different
                    penalty.
                  </p>
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
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="24. What a complete implementation specifies">
                <p>
                  A held-out evaluation states its deal in full. The share
                  held out and how it is rounded to a row count, whether the
                  rows are shuffled and by what seed, which block of the
                  shuffled order is held out, how many folds and how uneven
                  sizes are handled, whether the folds are stratified and on
                  what column, what is refitted inside every fold, which
                  metric is read on a fold and what happens when that metric
                  is undefined there, whether the folds are averaged or
                  pooled, and what the spread beside the summary is a range
                  of. Every one of those is a number a reader can check only
                  if it is written down.
                </p>
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
      ]}
    />
  );
}
