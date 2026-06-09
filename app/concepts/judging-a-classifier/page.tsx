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
import { AccuracyBaseline } from "@/components/widgets/AccuracyBaseline";
import { MulticlassTable } from "@/components/widgets/MulticlassTable";
import { PooledFoldsTable } from "@/components/widgets/PooledFoldsTable";
import { PrecisionRecallCurve } from "@/components/widgets/PrecisionRecallCurve";
import { ReliabilityDiagram } from "@/components/widgets/ReliabilityDiagram";
import { RocCurve } from "@/components/widgets/RocCurve";
import { SweepChart } from "@/components/widgets/SweepChart";
import { ThresholdMatrix } from "@/components/widgets/ThresholdMatrix";
import { TwoReadings } from "@/components/widgets/TwoReadings";

export const metadata: Metadata = {
  title: "Judging a Classifier · oop_ml",
  description:
    "Accuracy is one number and it hides two different mistakes. The confusion matrix keeps them apart, precision and recall ask two different questions of it, the threshold trades one mistake for the other, and a chance has to be measured before it is believed.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function JudgingAClassifierPage() {
  return (
    <ConceptPage
      title="Judging a Classifier"
      tagline="Four cells, two questions, a dial that trades one mistake for the other, and a chance that has to earn its meaning."
      prerequisites={
        <>
          The model being judged is the{" "}
          <Link href="/concepts/logistic-regression" className={link}>
            logistic regression
          </Link>{" "}
          page&rsquo;s, fitted there and only judged here, so its answer is
          a chance of being adult rather than a verdict. The three-class
          table in Part 5 judges the{" "}
          <Link href="/concepts/multiclass-classification" className={link}>
            multiclass
          </Link>{" "}
          page&rsquo;s model. Part 7 leans on the{" "}
          <Link href="/concepts/held-out-evaluation" className={link}>
            held-out evaluation
          </Link>{" "}
          page for why a score on the fitted rows flatters and how folds
          repair it, and does not teach that again.
        </>
      }
      history={
        <>
          <p>
            The four cells came from medicine before they had a name. Jacob
            Yerushalmy, a statistician at the United States Public Health
            Service, was asked in 1947 how to compare the chest X-ray
            techniques then used to screen for tuberculosis, and his paper in
            Public Health Reports pointed out that a technique has two
            separate failure rates, the share of the diseased it misses and
            the share of the healthy it flags, which he called sensitivity
            and specificity. The problem underneath was that the two could
            not be compared as one number, since a reader who called more
            films positive improved the first and worsened the second, so
            any single score quietly chose how to weigh a missed case against
            a false alarm. That is the same problem this page meets with a
            child called an adult and an adult called a child, and the same
            two rates appear in Part 2 as recall and specificity.
          </p>
          <p>
            The curve came from radar. At the University of Michigan in
            1954, Peterson, Birdsall and Fox published &ldquo;The theory of
            signal detectability&rdquo;, which treated a receiver deciding whether a blip was a target as
            a decision under uncertainty, and showed that the receiver&rsquo;s
            whole behaviour, at every setting of its threshold, was one
            curve of detections against false alarms. Wilson Tanner and John
            Swets carried it into psychology the same year, and Lee Lusted
            argued in Science in 1971 that a diagnostic test should be
            reported the same way. James Hanley and Barbara McNeil showed in
            1982, in Radiology, that the area under that curve is the
            probability that a randomly chosen positive case is ranked above
            a randomly chosen negative one, which is the number Part 3
            counts directly on the crowd rather than integrating.
          </p>
          <p>
            Precision and recall came from libraries. Allen Kent and his
            colleagues at Western Reserve University proposed in 1955 that a
            literature search be judged by two factors, the share of the
            relevant documents it recovered and the share of what it
            recovered that was relevant, and Cyril Cleverdon&rsquo;s Cranfield
            experiments on indexing languages through the late 1950s and
            1960s measured both across thousands of queries and found that
            every indexing system traded one against the other. Keith van
            Rijsbergen&rsquo;s 1979 textbook folded the two into the one
            effectiveness measure whose complement is the F-score of Part 4.
            Glenn Brier, a weather forecaster, had already asked in 1950 how
            to score a forecast that says &ldquo;seventy percent chance of
            rain&rdquo;, and his answer is the score Part 6 puts on a
            classifier&rsquo;s chances. The page asks six questions in order.
            Why is one number not a judgement? What two questions does the
            table answer? What does the threshold trade, and what do the two
            pictures of that trade show? How are two rates folded into one
            when one is needed? What changes with three classes? And is a
            chance of 0.7 seven in ten?
          </p>
        </>
      }
      playground={<ThresholdMatrix />}
      sections={[
        {
          title: "Part 1. One Number Is Not a Judgement",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Twelve people, and two the boundary cannot place">
                <p>
                  Twelve people are in the box above, six children and six
                  adults measured by height and weight, and each is labelled
                  with the chance the fitted model gives them of being an
                  adult. Ten of them are easy. Two are not, since there is a
                  child at 168 centimetres and 66 kilograms who is built like
                  an adult, and an adult at 150 centimetres and 50 kilograms
                  who is built like a child, and no boundary drawn from height
                  and weight can put those two on the right side at once.
                </p>
                <p>
                  The model gives the tall child a chance of 0.8669 and the
                  short adult a chance of 0.4911, and with the dial at the
                  halfway mark it calls the first an adult and the second a
                  child. Accuracy reports 0.8333 and stops. The colours in the
                  box say more, that one child was called an adult and one
                  adult was called a child, and those are different mistakes
                  that a reader may care about very differently. If the
                  question were whether to admit somebody to an adult ward,
                  one of them is paperwork and the other is a safeguarding
                  failure.
                </p>
                <KeepInMind>
                  Accuracy adds the two kinds of mistake together and reports
                  the total, and on the twelve that total is two people out
                  of twelve with no record of which two.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Accuracy on a crowd where adults are rare">
                <p>
                  On the twelve the two classes are balanced, so accuracy is
                  merely coarse. Where one class is rare it is misleading.
                  Take thirty people of whom four are adults, two of them
                  child-sized, and consider the laziest classifier there is,
                  which calls everybody a child. It finds no adult at all and
                  it is right about twenty-six people in thirty.
                </p>
                <AccuracyBaseline />
                <p>
                  The lazy classifier scores 0.8667, which is one minus the
                  share of adults, and it would score 0.99 on a crowd where
                  one person in a hundred was an adult. The fitted boundary
                  at the halfway threshold scores 0.9333, finds three of the
                  four adults and wrongly calls one child. The same boundary
                  at a threshold of 0.7 also scores 0.9333, finds two of the
                  four and wrongly calls nobody. Two classifiers with the
                  identical accuracy, one of which finds half again as many
                  adults as the other, and a third that finds none and is
                  right about two people fewer.
                </p>
                <Equation>{"everybody a child        26 right of 30   =  0.8667     adults found  0 of 4\nthe boundary at 0.5     28 right of 30   =  0.9333     adults found  3 of 4, one child wrongly called\nthe boundary at 0.7     28 right of 30   =  0.9333     adults found  2 of 4, no child wrongly called"}</Equation>
                <KeepInMind>
                  Read accuracy beside the share of the majority class, since
                  that share is what a classifier that learned nothing would
                  score. On the rare crowd it is 0.8667 before any fitting is
                  done, and the fit has to be judged on the distance above it
                  and on which people it found.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The four cells">
                <p>
                  What replaces the one number is a table of four. Every
                  person is either an adult or a child, and the model either
                  called them an adult or did not, so each person falls into
                  exactly one of four cells according to what was true and
                  what was said. Two of the cells are the model being right
                  and two are the model being wrong in the two different
                  ways.
                </p>
                <Equation>{"                      is adult          is child\ncalled adult       true positive     false positive\ncalled child       false negative    true negative"}</Equation>
                <WorkedExample title="The twelve at the halfway threshold">
                  <p>
                    Six adults, of whom five clear the threshold and one, the
                    short one at 0.4911, does not. Six children, of whom five
                    fall below it and one, the tall one at 0.8669, does not.
                    Every rate on this page is a ratio of these four numbers.
                  </p>
                  <Equation>{"true positives    5        false negatives   1\nfalse positives   1        true negatives    5"}</Equation>
                </WorkedExample>
                <p>
                  The words are a convention worth fixing once. Positive means
                  the class the question is about, adult here, and has nothing
                  to do with good news. A false positive is a child called an
                  adult and a false negative is an adult called a child, so
                  the first word says whether the call was right and the
                  second says what the call was.
                </p>
                <KeepInMind>
                  The table is the whole record of what happened, and every
                  rate on this page throws some of it away. Keep the table
                  beside any rate you quote, since a reader can rebuild every
                  rate from the four cells and cannot rebuild the cells from
                  a rate.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Two Questions Asked of One Table",
          content: (
            <>
              <SubSection title="4. Precision reads along the row of calls">
                <p>
                  Suppose the model has just called somebody an adult. How
                  much should we believe it? That question only concerns the
                  people it called adult, which is the top row of the table,
                  and asks what share of that row is on the diagonal. On the
                  twelve the model called six people adult and five of them
                  were.
                </p>
                <Equation>{"precision  =  true positives / (true positives + false positives)\n           =  5 / (5 + 1)  =  0.8333"}</Equation>
                <TwoReadings />
                <p>
                  Precision is the rate to watch when a false alarm is what
                  costs. A test that sends every flagged person for an
                  expensive second examination wants the flags to be right,
                  and it can raise its precision by flagging fewer people,
                  which is exactly the move the next question punishes.
                </p>
                <KeepInMind>
                  Precision is a statement about the model&rsquo;s positive
                  calls and says nothing about the adults it never called.
                  A model that calls one obvious adult and nobody else has a
                  precision of 1.0.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Recall reads down the column of adults">
                <p>
                  Now ask the other question. Of the adults in the crowd, how
                  many did the model find? That concerns only the people who
                  really are adults, which is the left column of the table,
                  and again asks what share is on the diagonal. There are six
                  adults and the model found five.
                </p>
                <Equation>{"recall  =  true positives / (true positives + false negatives)\n        =  5 / (5 + 1)  =  0.8333"}</Equation>
                <p>
                  The two rates share a numerator and differ in what sits
                  underneath, and switching the buttons above between
                  precision and recall shows the highlighted cells turning
                  from the row to the column. On the twelve they come out
                  equal, which is a convenience of this crowd rather than a
                  rule, since there happen to be six of each class and one
                  miss in each direction. On the rare crowd at the halfway
                  threshold they also happen to agree, at 0.75, and at a
                  threshold of 0.7 they part to 1.0 and 0.5.
                </p>
                <p>
                  Recall is the rate to watch when a miss is what costs. A
                  screening test wants to find every case and will accept
                  false alarms to do it, and it can raise its recall by
                  calling more people, which is the move precision punishes.
                  The two are the same table read in two directions, and
                  which one a field quotes first says mostly which mistake
                  that field is more afraid of.
                </p>
                <KeepInMind>
                  Recall is also called sensitivity, and in signal detection
                  the true positive rate, and all three are the left column
                  of the table read the same way.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Specificity, and the false positive rate">
                <p>
                  Nothing so far has looked at the children except to count
                  the wrongly called ones. Specificity is recall for the other
                  class, the share of the children the model left alone, and
                  it reads down the right column. Its complement, the share of
                  children the model wrongly called adult, is the false
                  positive rate, which is the horizontal axis of the curve in
                  Part 3.
                </p>
                <DerivationTable
                  expressionHeading="the rate"
                  reasonHeading="the question it answers, and its value on the twelve at 0.5"
                  rows={[
                    { expression: "accuracy      (TP + TN) / everybody", reason: "of everybody, how many were called rightly? 10 of 12, 0.8333." },
                    { expression: "precision     TP / (TP + FP)", reason: "of the people called adult, how many are? 5 of 6, 0.8333." },
                    { expression: "recall        TP / (TP + FN)", reason: "of the adults, how many were found? 5 of 6, 0.8333." },
                    { expression: "specificity   TN / (TN + FP)", reason: "of the children, how many were left alone? 5 of 6, 0.8333." },
                    { expression: "false positive rate   FP / (TN + FP)", reason: "of the children, how many were wrongly called? 1 of 6, 0.1667, which is one minus the specificity." },
                  ]}
                />
                <p>
                  On the rare crowd the difference between the two columns is
                  plain. The boundary at 0.5 has a specificity of 0.9615,
                  because twenty-five of twenty-six children were left alone,
                  and a recall of 0.75, because three of four adults were
                  found. Both are read off the same table, and a report that
                  quoted only the first would be describing how well the
                  model does on the class it was not asked about.
                </p>
                <KeepInMind>
                  Recall and specificity are the two rates that depend only on
                  the ranking of the people and not on how many of each class
                  there are, which is why the curve built from them in Part 3
                  has a coin&rsquo;s diagonal on any crowd, where precision
                  depends on how many of each class there are as well as on
                  the ranking.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. A ratio with nothing underneath it">
                <p>
                  Each of these rates is a count over a count, and a count
                  can be zero. Turn the dial in the box above to 0.99, higher
                  than any chance in the crowd, and the model calls nobody an
                  adult. Its precision is then zero over zero. That is not a
                  precision of zero, since a model that made no positive
                  claims has not made a wrong one, and the library says so by
                  refusing to return a number rather than by returning 0.
                </p>
                <Equation>{"precision at 0.99   =   0 / (0 + 0)     undefined, nobody was called adult\nrecall on a fold with no adults   =   0 / (0 + 0)     undefined, there was nobody to find\nF1 with precision 0 and recall 0   =   2 · 0 · 0 / (0 + 0)     undefined"}</Equation>
                <p>
                  Recall has the same gap when there are no adults to find,
                  which no threshold can cause on a fixed crowd and which a
                  held-out fold of a small crowd causes easily, as Part 7
                  shows. Accuracy has a denominator whenever there is anybody
                  at all, and specificity whenever there is a child. A tool
                  that quietly substitutes zero for any of these turns a fact
                  about the data into a poor score for the model, and every
                  rate on this page comes back as undefined where its
                  denominator is empty.
                </p>
                <KeepInMind>
                  An undefined rate is information. It says the question could
                  not be asked of this data, which is different from the
                  answer being bad, and averaging it away with a convention
                  destroys exactly that distinction.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. The Threshold Trades One Mistake for the Other",
          content: (
            <>
              <SubSection title="8. A chance is not a verdict">
                <p>
                  The model in the box does not say adult or child. It says
                  0.4911, and somebody has to decide what to do with that.
                  The logistic regression page introduced the threshold as
                  the number a chance is compared against, and this page
                  treats it as a dial, because the boundary and every chance
                  were computed once and the dial only moves the line between
                  the two calls. Nothing refits when it turns, and the four
                  cells change only because people cross the line.
                </p>
                <SweepChart series={["precision", "recall"]} />
                <p>
                  Drag the marker down to 0.3. The short adult&rsquo;s 0.4911
                  now clears the bar, so all six adults are found and recall
                  is 1.0, while the tall child&rsquo;s 0.8669 still clears it
                  too, so seven people are called adult and six of them are,
                  for a precision of 0.8571. Drag it up to 0.9 and only the
                  three adults above 0.9 are called, so precision is a
                  perfect 1.0 and recall halves to 0.5, with the adults at
                  0.7376, 0.7684 and 0.4911 now called children. The model
                  did not change between the two readings, and neither did
                  any chance; the line the calls are read against did.
                </p>
                <KeepInMind>
                  Where to set the threshold is a decision about costs and not
                  a property of the model, and the same fitted chances serve
                  a screening programme at a low threshold and a confirmatory
                  test at a high one.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Recall can only fall as the threshold rises, and precision need not">
                <p>
                  Raising the threshold can only turn a call of adult into a
                  call of child, never the reverse, so the true positives can
                  only fall and the false negatives can only rise. Recall is
                  the true positives over the number of adults, and the number
                  of adults does not depend on the threshold at all, so recall
                  is a falling count over a constant and cannot rise. That is
                  why the indigo curve above only ever steps downward.
                </p>
                <Equation>{"threshold up   ⇒   TP can only fall,  FN can only rise\nrecall  =  TP / (TP + FN)     where TP + FN is the number of adults, fixed\n\nso recall never rises as the threshold rises"}</Equation>
                <p>
                  Precision has no such guarantee, because both its numerator
                  and its denominator move. Reading the amber curve at five
                  thresholds on the twelve gives 0.75 at 0.1, 0.8571 at 0.2,
                  0.8333 at 0.5, 0.75 at 0.8 and 1.0 at 0.9. It rose, fell,
                  fell and rose, and each move is one person crossing the
                  line. Between 0.2 and 0.49 the seven people above the line
                  include the tall child and every adult; at 0.5 the short
                  adult drops out, taking one true positive from a numerator
                  of six and one person from a denominator of seven, and the
                  ratio falls from six sevenths to five sixths.
                </p>
                <NumberTable
                  headings={["threshold", "called adult", "of whom adults", "precision", "recall"]}
                  rows={[
                    ["0.1", "8", "6", "0.7500", "1.0000"],
                    ["0.2", "7", "6", "0.8571", "1.0000"],
                    ["0.5", "6", "5", "0.8333", "0.8333"],
                    ["0.8", "4", "3", "0.7500", "0.5000"],
                    ["0.9", "3", "3", "1.0000", "0.5000"],
                  ]}
                  caption="Five readings of the sweep on the twelve. Recall steps down and never up; precision moves both ways."
                />
                <KeepInMind>
                  A curve of precision against the threshold can have several
                  local peaks, so reading its best point off a coarse sweep
                  can miss the true peak between two readings. This
                  page&rsquo;s sweep reads every hundredth, and its curves in
                  the next two sections are read at every distinct chance
                  instead, where nothing can be missed.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The precision-recall curve, and the area under its steps">
                <p>
                  Put the two rates against each other rather than against the
                  threshold, and the threshold becomes a position along the
                  curve. Start with it above the highest chance, where nobody
                  is called, and lower it through each person&rsquo;s chance
                  in turn. Every step adds one person to those called adult.
                  If they were an adult, recall moves right; if they were a
                  child, precision drops. Nothing else can happen, so the
                  curve is a staircase, and it is drawn as one.
                </p>
                <PrecisionRecallCurve />
                <p>
                  On the twelve there are twelve distinct chances and so
                  twelve corners. The first three steps add the three most
                  confident adults and precision holds at 1.0 while recall
                  climbs to 0.5; the fourth adds the tall child and precision
                  drops to 0.75 with recall unmoved; three more adults take
                  recall to 1.0 with precision recovering to 0.8571; and the
                  last five steps add the remaining children, lowering
                  precision to 0.5 while recall has nowhere left to go. The
                  area under the steps is the average precision, 0.9151 here,
                  and the rightmost precision is always the share of the crowd
                  that is adult, since calling everybody adult finds every
                  adult and is right about a prevalence&rsquo;s worth of
                  them.
                </p>
                <Equation>{"average precision  =  Σ  (recall gained at the corner) × (precision at the corner)\n                   =  (1/6)·1 + (1/6)·1 + (1/6)·1 + 0·0.75 + (1/6)·0.8 + (1/6)·0.8333 + (1/6)·0.8571 + 0 + …\n                   =  0.9151"}</Equation>
                <KeepInMind>
                  The area is a sum of steps and deliberately not a trapezoid,
                  because precision between two corners is not on the line
                  joining them. And the curve begins at the first corner
                  rather than at a conventional point of precision 1.0 and
                  recall 0, since at that point nobody has been called and
                  precision is undefined.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The receiver operating characteristic, and a count of pairs">
                <p>
                  The other picture swaps precision for the false positive
                  rate and puts recall up the vertical axis. It starts at the
                  origin, where nobody is called and neither rate has anything
                  in its numerator, and ends at the top right, where everybody
                  is called. Lowering the threshold through an adult moves it
                  up by one sixth, and through a child moves it right by one
                  sixth, so a model whose chances rank every adult above every
                  child climbs the whole left edge before crossing the top.
                </p>
                <RocCurve />
                <p>
                  The area under the curve has a meaning that can be counted
                  rather than integrated. Pair each adult with each child,
                  thirty-six pairs on the twelve, and ask in how many the
                  adult&rsquo;s chance is the higher. The tall child at 0.8669
                  outranks three adults, the short one at 0.4911 and two more
                  at 0.7376 and 0.7684, and every other pair is in the right
                  order, so thirty-three of thirty-six are, and the area is
                  0.9167. A coin would draw the diagonal and score 0.5.
                </p>
                <Equation>{"area under the ROC  =  share of (adult, child) pairs with the adult ranked higher, a tie counting a half\n                    =  33 / 36  =  0.9167 on the twelve\n                    =  102 / 104  =  0.9808 on the rare crowd"}</Equation>
                <KeepInMind>
                  The area judges the ranking and not the threshold. A model
                  can have a high area and be useless at the one threshold it
                  is deployed at, since the area averages over every
                  threshold including the ones nobody would choose.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What the two pictures answer differently">
                <p>
                  The two curves are built from the same sweep and disagree
                  about what a good model looks like when one class is rare,
                  because one of them reads a column of the table and the
                  other reads a row. Recall and the false positive rate are
                  each a share of one class, so the ROC does not know how many
                  of each class there are, and its diagonal is a coin&rsquo;s
                  curve on any crowd. Precision is a share of the people
                  called adult, who are drawn from both classes, so the
                  precision-recall curve knows the prevalence intimately and
                  ends at it.
                </p>
                <NumberTable
                  headings={["crowd", "share adult", "area under the ROC", "a coin’s ROC area", "average precision", "a coin’s average precision"]}
                  rows={[
                    ["the twelve", "0.5000", "0.9167", "0.5", "0.9151", "0.5000"],
                    ["adults rare", "0.1333", "0.9808", "0.5", "0.9167", "0.1333"],
                  ]}
                  caption="Both crowds through the same sweep. A coin’s area under the ROC is 0.5 on any crowd; a coin’s average precision is the share of the crowd that is adult."
                />
                <p>
                  On the rare crowd the model&rsquo;s average precision is
                  0.9167 against a floor of 0.1333, where on the twelve it is
                  0.9151 against a floor of 0.5, so the rare crowd&rsquo;s figure
                  is the larger achievement though the two numbers are within
                  0.002 of each other.
                  The ROC area reads 0.9808 and 0.9167 against the same floor
                  of 0.5 on both. When the positive class is rare and the
                  false alarms are what will be looked at, the
                  precision-recall picture is the one that shows what it will
                  cost, since a false positive rate of 0.04 on the rare crowd
                  is one child, and on a crowd of ten thousand children it
                  would be four hundred people to be examined for every few
                  adults found.
                </p>
                <KeepInMind>
                  Neither picture is the right one. The ROC compares rankings
                  across crowds of different make-up; the precision-recall
                  curve says what the calls will be worth on this crowd. The
                  textbook says the ROC is insensitive to prevalence, and on
                  these two crowds the areas differ, 0.9808 against 0.9167,
                  because they are two different fits on two different crowds
                  and not one ranking scored twice.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. One Number, When One Is Needed",
          content: (
            <>
              <SubSection title="13. The harmonic mean">
                <p>
                  Sometimes two rates have to become one, to rank candidate
                  models or to put a figure in a report. The obvious way is
                  to average them, and it is wrong in a specific way. At a
                  threshold of 0.9 the twelve give a precision of 1.0 and a
                  recall of 0.5, and the arithmetic mean of those is 0.75,
                  which is a respectable-looking score for a model that
                  missed half the adults. The harmonic mean is 0.6667, and it
                  is lower because the harmonic mean is pulled towards
                  whichever rate is worse.
                </p>
                <Equation>{"F1  =  2 · precision · recall / (precision + recall)\n\nat 0.9 on the twelve:   2 · 1.0 · 0.5 / (1.0 + 0.5)  =  0.6667     the arithmetic mean would say 0.75\nat 0.5 on the twelve:   2 · 0.8333 · 0.8333 / 1.6667  =  0.8333    the two agree, so any mean of them is 0.8333"}</Equation>
                <WhyThisWorks title="Why the harmonic mean cannot be gamed">
                  <p>
                    Send recall to zero while keeping precision at 1.0, which
                    a model does by calling one obvious adult and nobody
                    else. The arithmetic mean reports 0.5, half marks for
                    finding almost nothing. The harmonic mean reports 0, since
                    the numerator carries the product of the two rates and a
                    zero in either makes it zero. The same holds the other way
                    round, calling everybody adult for a recall of 1.0 and a
                    precision equal to the prevalence, and the harmonic mean
                    of 1.0 and 0.5 on the twelve is 0.6667 again. A model
                    cannot buy a good F1 by abandoning one of the two rates
                    entirely.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  F1 ignores the true negatives completely, so it does not
                  reward a model for the children it correctly left alone. On
                  the rare crowd that is the point, since those twenty-six
                  correct rejections are what let accuracy flatter. It also
                  means F1 is not symmetric between the classes, and swapping
                  which class is called positive changes it.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Leaning the mean with beta">
                <p>
                  F1 weighs the two rates equally, and nothing says they
                  should be. The general form carries a number beta that says
                  how many times more recall matters than precision, and the
                  usual pair of alternatives are a half, which leans towards
                  precision, and two, which leans towards recall. At a half
                  the recall is weighted a quarter as much in the denominator;
                  at two it is weighted four times as much.
                </p>
                <Equation>{"F_β  =  (1 + β²) · precision · recall / (β² · precision + recall)\n\nat 0.9 on the twelve, precision 1.0 and recall 0.5:\n   F½   =  1.25 · 0.5 / (0.25 + 0.5)  =  0.8333\n   F1   =  2 · 0.5 / (1 + 0.5)        =  0.6667\n   F2   =  5 · 0.5 / (4 + 0.5)        =  0.5556"}</Equation>
                <SweepChart series={["f_half", "f_one", "f_two"]} showPeaks initialThreshold={0.9} />
                <p>
                  The three curves agree wherever precision and recall agree,
                  which on the twelve is the whole stretch from 0.5 to 0.73
                  where both are 0.8333, and part company wherever the two
                  rates do. At 0.9, where precision is perfect and recall is
                  half, the precision-leaning score says 0.8333 and the
                  recall-leaning one says 0.5556, and the reader who is
                  choosing between them is choosing which mistake to forgive.
                </p>
                <KeepInMind>
                  Beta is a statement about costs in the same way the
                  threshold is, and it belongs to the person deploying the
                  model rather than to the model. Reporting an F-score without
                  its beta, or F1 without saying the costs were judged equal,
                  hides that decision inside a number.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Choosing a threshold by an F-score, on the rows it was fitted to">
                <p>
                  Once there is one number, the sweep can be searched for the
                  threshold that maximises it, and the dashed lines in the
                  chart above mark where each F-score peaks. On the twelve all
                  three peak at 0.18, which is the lowest threshold in the
                  long flat stretch from 0.18 to 0.49 where every adult is
                  found and only the tall child is wrongly called, and the
                  sweep reports the lowest tied threshold rather than choosing
                  among equals. On the rare crowd the three part.
                </p>
                <NumberTable
                  headings={["crowd", "F½ peaks at", "value", "F1 peaks at", "value", "F2 peaks at", "value"]}
                  rows={[
                    ["the twelve", "0.18", "0.8824", "0.18", "0.9231", "0.18", "0.9677"],
                    ["adults rare", "0.51", "0.9375", "0.51", "0.8571", "0.14", "0.9091"],
                  ]}
                  caption="Where each F-score peaks over the sweep at every hundredth, the lowest threshold reported on a tie."
                />
                <p>
                  On the rare crowd the recall-leaning score sends the
                  threshold down to 0.14, where all four adults are found and
                  two children are wrongly called, and the other two hold it
                  at 0.51, just above the one child the model gives a chance
                  of 0.5072, where three adults are found and nobody is
                  wrongly called. Those are two defensible deployments of one
                  model, and beta is what chose between them.
                </p>
                <InAModel title="What the chosen threshold is worth">
                  <p>
                    Every threshold on this page was chosen on the rows the
                    boundary was fitted to, and the peak of a curve read off
                    the fitting rows is optimistic in the same way a training
                    score is. The{" "}
                    <Link href="/concepts/grid-search" className={link}>
                      grid search page
                    </Link>{" "}
                    measures how much the best of many candidates flatters,
                    and a threshold is a candidate like any other, so it
                    should be chosen on held-out rows and reported on rows
                    held out again, which is the nested procedure that page
                    describes.
                  </p>
                </InAModel>
                <KeepInMind>
                  A threshold read off the sweep is a hyperparameter fitted to
                  the data it was scored on, and its score is a training
                  score.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. More Than Two Classes",
          content: (
            <>
              <SubSection title="16. The K by K table">
                <p>
                  With children, teenagers and adults there are three ways to
                  be right and six ways to be wrong, and the table grows to
                  three rows by three columns, the true class down the rows
                  and the call across the columns. The diagonal is the right
                  answers and every other cell names a particular confusion,
                  this class taken for that one. The
                  crowd below is the multiclass page&rsquo;s thirteen with
                  three people added who confuse the classes, a teenager built
                  like an adult, an adult built like a teenager, and a tall
                  child.
                </p>
                <MulticlassTable />
                <p>
                  With everybody judged and the width stated, fourteen of the
                  sixteen are on the diagonal, for an accuracy of 0.875. The
                  two off it are the tall teenager, called an adult, and the
                  short adult, called a teenager, and the tall child was
                  placed correctly. Those two cells say something a two-class
                  table cannot, that the model confuses teenagers with adults
                  in both directions and never confuses either with a child.
                </p>
                <KeepInMind>
                  The off-diagonal cells are usually the most useful part of
                  the table, since they say which classes the model cannot
                  tell apart, and a single accuracy figure discards them
                  entirely.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Each class has its own precision and recall">
                <p>
                  Precision and recall survive the move to three classes, and
                  they stop being single numbers. Each class gets its own
                  pair, read off its own row and column of the table exactly
                  as in Part 2, with that class standing as the positive one
                  and the other two together as the negative.
                </p>
                <WorkedExample title="The teenager row and column">
                  <p>
                    Six people are teenagers, five of them called teenagers
                    and one called an adult, so recall for the teenager class
                    is five sixths. Six people were called teenagers, five of
                    them teenagers and one an adult, so precision for the
                    class is also five sixths. For adults the figures are four
                    of five each way, 0.8, and for children five of five.
                  </p>
                  <Equation>{"teenager   precision  5 / 6  =  0.8333     recall  5 / 6  =  0.8333     F1  0.8333\nadult      precision  4 / 5  =  0.8000     recall  4 / 5  =  0.8000     F1  0.8000\nchild      precision  5 / 5  =  1.0000     recall  5 / 5  =  1.0000     F1  1.0000"}</Equation>
                </WorkedExample>
                <p>
                  A model can be excellent on the common class and useless on
                  the rare one, and that is exactly the fact a single number
                  hides. The per-class figures are what a report should show
                  when the classes are of different sizes or different
                  importance, and they are one row of the table each.
                </p>
                <KeepInMind>
                  A class&rsquo;s precision is undefined when the model never
                  called it, and its recall is undefined when nobody belongs
                  to it. Both happen routinely on a held-out fold of a small
                  crowd, and section 19 shows the widget doing both.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Macro and micro are two different questions">
                <p>
                  Three precisions can be collapsed to one in two ways, and
                  they answer different questions. Averaging the three
                  per-class figures, which is called the macro average, gives
                  every class an equal vote however many people it holds.
                  Pooling the counts first and dividing once, the micro
                  average, gives every person an equal vote and lets the
                  common classes dominate.
                </p>
                <Equation>{"macro precision  =  (1.0000 + 0.8333 + 0.8000) / 3  =  0.8778\nmicro precision  =  (5 + 5 + 4) / (5 + 6 + 5)      =  14 / 16  =  0.8750"}</Equation>
                <p>
                  On this crowd the two are close, 0.8778 against 0.8750,
                  because the classes are nearly the same size. The micro
                  figure is worth a second look, because where every person
                  gets exactly one call the pooled numerator is the diagonal
                  and the pooled denominator is everybody, so micro precision,
                  micro recall and accuracy are the same number, 0.875 here,
                  reported under three names, and the widget shows all three
                  so the reader can see that they agree.
                </p>
                <KeepInMind>
                  Macro F1 is the mean of the per-class F1 scores and not the
                  harmonic mean of macro precision and macro recall, which is
                  a different number and not a standard one however
                  reasonable it looks. And a macro average is undefined
                  whenever any class&rsquo;s rate is, because averaging over
                  the classes that happen to be defined would quietly change
                  the question.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The width has to be stated">
                <p>
                  A three-class table needs to know it has three classes, and
                  there are two ways it can find out. It can be told, or it
                  can read the true classes of the rows it was handed and
                  count. The second sounds harmless and is where a held-out
                  fold goes wrong, because a fold of a small crowd can easily
                  hold no adults, and a table that counts its classes from the
                  rows then has no column for adults at all. Switch the widget
                  in section 16 to judge the crowd without its adults and
                  untick the stated width.
                </p>
                <DerivationTable
                  expressionHeading="the judged rows, and whether the width is stated"
                  reasonHeading="what the library does"
                  rows={[
                    { expression: "everybody, width inferred", reason: "the true classes run 0, 1, 2 and the table is three by three; identical to stating it." },
                    { expression: "without the adults, width inferred", reason: "refused. The rows’ true classes run 0 and 1, so the inferred table has two columns, and the tall teenager is called class 2, which the table has no column for." },
                    { expression: "without the adults, width stated as three", reason: "accepted. The adult row is empty and the adult column holds the one wrongly called teenager, so adult precision is 0.0, adult recall is undefined, and the macro recall is undefined with it." },
                    { expression: "without the teenagers, width inferred", reason: "refused by name, since the true classes are 0 and 2 and leave a gap, which is nearly always a filtered crowd rather than a two-class problem." },
                    { expression: "everybody, width stated as two", reason: "refused, because the rows name a class 2 that a two-class table cannot hold." },
                    { expression: "everybody, width stated as four", reason: "accepted, with an empty fourth class whose recall is undefined." },
                  ]}
                />
                <p>
                  The quiet case is the one the refusal above narrowly avoids.
                  I measured a version of this crowd without the short adult,
                  where the model places the tall teenager correctly, so that
                  no judged row was called adult, and the inferred table came
                  back two by two with no adult column and every figure
                  defined, a table that is silently the wrong shape. Stating
                  the width turns that into a three-by-three table with an
                  empty row, whose recall is undefined and says so. The
                  library therefore lets a caller state the width and holds
                  the rows to it, which is the rule the fold endpoint of
                  Part 7 uses on every fold.
                </p>
                <KeepInMind>
                  The width of a table is a fact about the problem and not
                  about the rows in front of you. State it, and let an absent
                  class show up as an empty row with an undefined recall
                  rather than as a table that quietly shrank.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What a Chance Means",
          content: (
            <>
              <SubSection title="20. A 0.7 is not seven in ten unless measured">
                <p>
                  Everything so far has judged the calls, and a call throws
                  away the chance it came from. The model said 0.7376 about
                  one adult and 0.9546 about another, and if those numbers
                  mean what they say then, among many people given a chance
                  near 0.75, about three in four should turn out to be
                  adults. Whether they do is a separate question from whether
                  the calls were right, and it is answered by binning the
                  chances and counting.
                </p>
                <ReliabilityDiagram />
                <p>
                  On the twelve the bin from 0.8 to 1.0 holds four people at
                  a mean chance of 0.9230, and three of the four are adults,
                  a share of 0.75 against a promise of 0.92, since the tall
                  child is one of the four. The bin from 0.6 to 0.8 holds two people
                  at a mean of 0.7530 and both are adults. The bin from 0.4 to
                  0.6 holds one person, the short adult, and the bin from 0.2
                  to 0.4 holds nobody. Twelve people cannot fill five bins,
                  so most of what the diagram says here is that twelve is too
                  few, which is a fair thing for it to say.
                </p>
                <p>
                  Over everybody the model balances, with a mean chance of
                  0.5000 against an observed adult rate of 0.5, which a
                  logistic fit with an intercept does on its fitting rows
                  because the fit itself demands it. The balance in the large
                  and the gaps in the bins are both true at once, and only
                  the bins can see that the chances above 0.8 are too high.
                </p>
                <KeepInMind>
                  Calibration is judged on people the model never saw, and
                  every number in this section is read on the rows the
                  boundary was fitted to, where a fit that separated the
                  classes has every reason to push its chances towards 0 and
                  1. This fit ran its full 2000 passes without converging,
                  which is what a nearly separable crowd does to it, so its
                  confident chances are an artefact of how long it walked as
                  much as a statement about the people.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Two scores for a chance, and what each one adds">
                <p>
                  The diagram can be summarised in two numbers, and they
                  measure different things. The expected calibration error
                  takes each bin&rsquo;s gap between its mean chance and its
                  observed share, weights it by how many people the bin
                  holds, and averages. The Brier score skips the bins and
                  takes every person&rsquo;s squared gap between their chance
                  and their outcome, 1 for an adult and 0 for a child.
                </p>
                <Equation>{"expected calibration error  =  Σ_bins  (people in bin / everybody) · | mean chance − observed share |\nBrier score                 =  (1 / n) Σ_people  (chance − outcome)²"}</Equation>
                <WorkedExample title="The two scores on the three crowds">
                  <NumberTable
                    headings={["crowd", "people", "expected calibration error", "Brier score", "Brier score of guessing the prevalence"]}
                    rows={[
                      ["the twelve", "12", "0.1672", "0.0983", "0.2500"],
                      ["adults rare", "30", "0.0580", "0.0382", "0.1156"],
                      ["an ideal case", "19", "0.0776", "0.0414", "0.2493"],
                    ]}
                    caption="Every figure read on the fitting rows. The last column is what a model that gave everybody the crowd’s adult share as their chance would score, which is the prevalence times one minus itself."
                  />
                  <p>
                    On the twelve the calibration error is 0.1672, most of it
                    the four confident people of whom one was a child, and
                    the Brier score is 0.0983 against the 0.25 that guessing
                    the prevalence for everybody would earn. The Brier score
                    rewards a chance for being near the right end as well as
                    for being honest, so a model can lower it by ranking
                    better without becoming better calibrated, and a model
                    can be perfectly calibrated and score badly by saying
                    0.5 about everybody on a balanced crowd.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The calibration error depends on how the bins are drawn,
                  five equal fifths here, and a different binning gives a
                  different number from the same chances. The Brier score
                  needs no bins and is the one to compare across models; the
                  diagram is the one to look at to see where a model is over
                  or under confident.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Ranking and calibration are separate qualities">
                <p>
                  The area under the ROC and the reliability diagram can
                  disagree completely about one model, and the reason is in
                  what each reads. The area counts pairs and asks only which
                  of two chances is the higher. Squash every chance towards
                  0.5, or stretch every chance towards the ends, and as long
                  as the order of the people is untouched the area is
                  untouched, at 0.9167 on the twelve, while the diagram moves
                  every dot.
                </p>
                <WhyThisWorks title="Why any order-preserving change leaves the area alone">
                  <p>
                    The area is the share of adult-child pairs in which the
                    adult&rsquo;s chance exceeds the child&rsquo;s. Apply any
                    rising function to every chance, and a pair that was in
                    order stays in order and a pair that was out of order
                    stays out of order, so the count is unchanged. The
                    reliability diagram reads the chances&rsquo; values and
                    not their order, so the same change moves every bin&rsquo;s
                    mean and can move people between bins.
                  </p>
                </WhyThisWorks>
                <p>
                  This is why the two are reported separately and why a
                  model with a high area can still be untrustworthy when its
                  0.7 is read as seven in ten. The repair for that is a
                  second, small fit that maps the model&rsquo;s chances onto
                  observed frequencies on held-out rows, which this library
                  does not provide and which this page therefore only names.
                  What it does provide is the diagram and the two scores,
                  which say whether such a repair is needed.
                </p>
                <KeepInMind>
                  A high area under the ROC says the model orders people
                  well. A low calibration error says its chances can be read
                  as frequencies. A model needs both before a chance of 0.7
                  can be acted on as seven in ten, and one does not imply the
                  other.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Judging on Rows the Fit Never Saw",
          content: (
            <>
              <SubSection title="23. Every number so far is a training score">
                <p>
                  The twelve in the box are the twelve the boundary was fitted
                  to, and so are the thirty and the sixteen. Every rate, both
                  curves, every peak and every bin above is therefore a
                  training score, and the{" "}
                  <Link href="/concepts/held-out-evaluation" className={link}>
                    held-out evaluation page
                  </Link>{" "}
                  is about why that flatters and how dealing the crowd into
                  folds and judging each on the rows it was not fitted to
                  repairs it. That argument is not repeated here. What this
                  page adds is what happens when the thing being folded is a
                  table rather than a single squared error.
                </p>
                <p>
                  Two things change. The standardising of heights and weights
                  that the fit needs has to be learned inside each fold, so
                  that a held-out person never lends their mean to the fit
                  that judges them, and the widget below does that. And a
                  fold of two or three people can hold no adults at all,
                  which is the undefined recall of section 7 arriving in
                  practice.
                </p>
                <KeepInMind>
                  A held-out judgement changes none of the definitions on this
                  page. It changes which people the table is counted over, and
                  on small crowds that is the difference between a score and a
                  guess.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Pool the folds&rsquo; tables">
                <p>
                  With the twelve dealt into folds and the boundary refitted
                  inside each, there are two ways to combine the folds into
                  one verdict. Average each fold&rsquo;s accuracy, so each
                  fold counts equally, or add the folds&rsquo; tables into one
                  table and divide once, so each person counts equally. The
                  widget deals the same twelve four ways and reports both.
                </p>
                <PooledFoldsTable />
                <p>
                  The pooled column reads 0.8333 on every row, because every
                  person is held out in exactly one fold whatever the deal,
                  so adding the folds&rsquo; tables always rebuilds one table
                  of the same twelve people. The averaged column does not.
                  Dealt seven ways it says 0.8571, because twelve people do
                  not divide into seven equal folds and averaging gives a
                  fold of one the same vote as a fold of two, and dealt five
                  ways with the classes balanced it says 0.8. On the plain
                  five-fold deal the two happen to agree to the last digit,
                  which is arithmetic luck and not a rule.
                </p>
                <p>
                  What settles the question is the fold with no adults, which
                  the plain five-fold deal produces. It holds two people, the
                  refitted boundary wrongly calls one of them an adult, and
                  its recall is zero found over zero present. Averaged, that
                  fold has to contribute something and whatever is chosen is a
                  convention. Pooled, it adds nothing to either side of the
                  ratio, which is right, because a fold with no adults in it
                  has no evidence about finding adults. So the library pools
                  a classifier&rsquo;s folds, and reports a spread across
                  folds only for accuracy, which is defined on any fold with
                  anybody in it and reads 0.5 here on every deal.
                </p>
                <Equation>{"pooled     ( Σ TPₖ ) / ( Σ (TPₖ + FNₖ) )      a fold with no adults adds 0 to both\naveraged   (1/k) Σ  TPₖ / (TPₖ + FNₖ)        a fold with no adults has no term to add"}</Equation>
                <KeepInMind>
                  Balancing the deal so each fold keeps the class proportions
                  cuts the folds missing a class from one to none at five
                  folds and from four to two at seven, and cannot reach zero
                  there, since twelve people in seven folds leaves folds of a
                  single person. Stratifying makes the empty fold rare, and
                  pooling is what lets the one that still happens add nothing
                  rather than a convention.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="25. What a complete implementation specifies">
                <p>
                  A complete implementation of these judgements states which
                  class is positive and what labels it accepts, whether the
                  threshold comparison is at or above, what it does with a
                  denominator of zero for each rate, whether its curves are
                  read at every distinct score or at a fixed grid, whether the
                  area under the precision-recall curve is a step sum or a
                  trapezoid and whether a conventional first point is added,
                  how ties in the scores are counted in the ROC area, which
                  beta an F-score uses, whether a multiclass average is macro
                  or micro and what it does when a class&rsquo;s rate is
                  undefined, whether the class width is stated or inferred,
                  how many bins a reliability diagram uses and whether they
                  are equal in width or in count, and whether folds are
                  pooled or averaged.
                </p>
                <p>
                  The choices on this page are these. Adult is positive and
                  the labels are 0 and 1; a person is called adult at or
                  above the threshold; an empty denominator gives an
                  undefined rate rather than zero; the sweep reads every
                  hundredth and both curves read every distinct chance; the
                  average precision is a step sum with no conventional first
                  point; a tied pair counts a half; the three betas are a
                  half, one and two; both multiclass averages are reported and
                  the macro one is undefined if any class is; the width can
                  be stated and is inferred otherwise; five equal-width bins;
                  and folds are pooled, with a spread for accuracy alone.
                </p>
              </SubSection>

              <SubSection title="26. The edges, each one run">
                <p>
                  Every row below was run against the library, through the
                  API where the page can reach it and directly where it
                  cannot.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "an empty crowd, or one person", reason: "refused before any fit, by the request’s bound of at least two people." },
                    { expression: "two people, one of each class", reason: "refused by the fit, which says that estimating three parameters needs at least three people." },
                    { expression: "one class only", reason: "refused by the fit by name, since a classifier needs both classes. The two-class table itself accepts a crowd of one class and refuses only the rate that has no denominator, recall on a crowd with no adults." },
                    { expression: "a constant column", reason: "refused by the standardiser before the fit, because a column with no spread cannot be scaled." },
                    { expression: "a non-finite measurement", reason: "refused at the boundary by the request, which bounds every measurement; handed directly to the table, a non-finite label is refused as not finite." },
                    { expression: "a label that is not 0 or 1, or a chance handed in as a label", reason: "refused by the two-class table by name, which says which value it found; a threshold has to be applied before anything reaches it." },
                    { expression: "labels and calls of different lengths", reason: "refused, naming both lengths." },
                    { expression: "nobody called adult, or no adult present, or precision and recall both zero", reason: "precision, recall and F1 respectively are undefined and refused by name; accuracy and the other rates are still returned." },
                    { expression: "a threshold of 0 or 1", reason: "refused at construction, since the model’s threshold is bounded to the open interval and the request’s is too." },
                    { expression: "more folds than the endpoint allows", reason: "refused by the request above ten folds; ten folds of twelve people are accepted, and a fold of one person is scored." },
                    { expression: "unfitted use", reason: "refused with the model’s own not-fitted error, before any judging can begin." },
                    { expression: "a renamed, missing or reordered feature", reason: "a renamed or missing feature is refused, naming what was expected and what arrived; reordered features are matched by name and accepted." },
                    { expression: "a three-class table with the width inferred from one class, or from rows that leave a gap", reason: "refused by name in both cases, since there is nothing to discriminate between and a gap is nearly always a filtered crowd." },
                    { expression: "a stated width narrower than a class present", reason: "refused, naming the class outside the table." },
                    { expression: "a stated width wider than the classes present", reason: "accepted, with an empty class whose recall is undefined and whose emptiness makes every macro average undefined." },
                    { expression: "a rate asked of a class the table does not have", reason: "refused, naming the span the table covers." },
                    { expression: "a fit that does not converge", reason: "accepted and reported. The fit on the twelve ran its full 2000 passes without converging, which a separable crowd causes, and the page says so where it quotes the chances." },
                  ]}
                />
                <p>
                  Two of those are documented rather than defended. A fit
                  that never converges is the logistic regression page&rsquo;s
                  complete-separation case, and this page reports the passes
                  run and the flag rather than refusing, because the chances
                  it produces are still a ranking even where their values have
                  run away. And the reliability reading needs bins, and a
                  different binning gives a different calibration error from
                  the same chances, so that number is reported with its
                  binning and the Brier score beside it.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
