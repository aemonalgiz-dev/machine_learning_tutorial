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
  title: "Judging a Classifier · Perceptron Lab",
  description:
    "Correct predictions and different kinds of mistake need to be counted separately. Their consequences determine which evaluation measures tell us whether a classifier is useful.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function JudgingAClassifierPage() {
  return (
    <ConceptPage
      lessonId="judging-a-classifier"
      intuition={lessonIntuitions["judging-a-classifier"]}
      technicalStart="Part 2. Two Questions Asked of One Table"
      openingTitle="Two Models Can Be Equally Accurate and Fail Differently"
      playgroundTitle="See which mistakes a threshold allows"
      playgroundIntro="Look at the false positives and false negatives separately. Move the threshold and watch which kind of mistake becomes more common."
      title="Judging a Classifier"
      tagline={"Correct predictions and different kinds of mistake need to be counted separately. Their consequences determine which evaluation measures tell us whether a classifier is useful."}
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

      playground={<ThresholdMatrix />}
      sections={[
        { id: "part-1-one-number-is-not-a-judgement",
          title: "Part 1. One Number Is Not a Judgment",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twelve people, and two the boundary cannot place">
                <p>

                  The plot contains twelve people, six children and six adults, measured by height and weight. Beside each person is the fitted model&apos;s probability of adulthood. Most are easy to separate, but look at the child at 168 centimeters and 66 kilograms and the adult at 150 centimeters and 50 kilograms. Their measurements overlap the other group. The model gives this child a higher adult score than this adult, so moving a single threshold cannot classify both correctly.
                </p>
                <>
<p>The model assigns an adult probability of 0.8669 to the tall child and 0.4911 to the short adult. At the halfway threshold both are misclassified, giving an accuracy of 0.8333. One error assigns the positive category incorrectly; the other misses it. Keeping those counts separate lets us consider their different consequences.</p>
                <p>
                  Different applications can attach different costs to these
                  two mistakes. This height-and-weight exercise illustrates
                  that distinction; it does not establish a reliable way to
                  determine somebody&rsquo;s age.
                </p>
</>
                <KeepInMind>
                  Accuracy reports the fraction classified correctly. Here that is ten of twelve, leaving two mistakes. The single rate does not retain which mistake types occurred or which people received them.</KeepInMind>
              </SubSection>

              <SubSection title="2. Accuracy on a crowd where adults are rare">
                <p>The twelve-person example has balanced classes. The next example has thirty people, only four of whom are adults, including two whose measurements overlap the children. A rule that always predicts child is correct for twenty-six people while finding no adults. Its accuracy reflects the class proportions rather than an ability to distinguish the groups.</p>
                <AccuracyBaseline />
                <>
<p>The always-child rule scores 0.8667 in this group; with only one adult in a hundred, that same rule would score 0.99. The fitted boundary scores 0.9333 at both the halfway threshold and a threshold of 0.7. The first threshold finds three of four adults and incorrectly calls one child an adult. The second finds two of four adults without incorrectly calling any child an adult. Equal accuracy therefore does not mean equal errors.</p>
                <p>
                  Two classifiers with the identical accuracy, one of which finds half again as many adults as the other, and a third that finds none and is right about two people fewer.
                </p>
</>
                <Equation>{"everybody a child        26 right of 30   =  0.8667     adults found  0 of 4\nthe boundary at 0.5     28 right of 30   =  0.9333     adults found  3 of 4, one child wrongly called\nthe boundary at 0.7     28 right of 30   =  0.9333     adults found  2 of 4, no child wrongly called"}</Equation>
                <KeepInMind>
                  An always-majority classifier supplies a useful baseline: it scores 0.8667 on this crowd without distinguishing any adults. Compare a fitted model with that reference, then inspect the error counts and consequences. A higher accuracy alone does not determine which policy is useful.</KeepInMind>
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
                  The confusion table retains the aggregate outcomes at one threshold. Its counts let us reconstruct the threshold-based rates in the following sections. It does not retain individual identities or probability scores, so ranking and calibration need additional information.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Two Questions Asked of One Table",
          content: (
            <>
              <SubSection title="4. Precision reads along the row of calls">
                <p>Among the people called adult, what fraction actually were adults? That is precision. It uses the top row of this binary table. On the twelve, six people were called adult and five of them were adults.</p>
                <Equation>{"precision  =  true positives / (true positives + false positives)\n           =  5 / (5 + 1)  =  0.8333"}</Equation>
                <TwoReadings />
                <p>Precision helps describe the positive calls when false alarms lead to costly follow-up work. Raising the threshold selects fewer people, but precision improves only if the removed calls contain enough false positives. The recall of that smaller group may also change.</p>
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
                <p>Recall describes how many actual positives were found. Lowering a fixed-score threshold can retain or increase that count, while also admitting false positives. Precision may rise or fall depending on which people enter. Compare both rates and their counts when deciding whether the extra detections justify the follow-up work.</p>
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
                  At a fixed threshold, recall and specificity are rates within the actual positive and negative classes. Changing only the relative class proportions leaves their expected values unchanged if the score distribution within each class remains the same. Precision can change because its denominator combines both classes. This conditional statement does not guarantee identical rates on two different finite samples.</KeepInMind>
              </SubSection>

              <SubSection title="7. A ratio with nothing underneath it">
                <p>
                  Each of these rates is a count over a count, and a count
                  can be zero. Turn the dial in the box above to 0.99, higher
                  than any chance in the crowd, and the model calls nobody an
                  adult. Its precision is then zero over zero. That is not a
                  precision of zero, since a model that made no positive
                  claims has not made a wrong one, and the difference is kept
                  by refusing to return a number rather than by returning 0.
                </p>
                <Equation>{"precision at 0.99   =   0 / (0 + 0)     undefined, nobody was called adult\nrecall on a fold with no adults   =   0 / (0 + 0)     undefined, there was nobody to find\nF1 with precision 0 and recall 0   =   2 · 0 · 0 / (0 + 0)     undefined"}</Equation>
                <p>Recall is undefined when there are no actual adults; specificity is undefined when there are no actual children. Accuracy is defined for any nonempty crowd. This SDK also reports F1 as undefined when its displayed harmonic-mean formula has a zero denominator. Preserve the reason with an undefined result rather than silently treating missing evidence as a measured poor score.</p>
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
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "On the rare crowd of thirty the classifier that calls everybody a child scores 0.8667, which is one minus the share of adults.",
              true,
              "The baseline correctly identifies the twenty-six children and misses all four adults. Its accuracy is the majority-class share. Comparing a fitted model with this baseline helps us see whether a high accuracy comes mainly from the class proportions.",
            ),
            choice(
              "On the rare crowd the fitted boundary at 0.5 and the same boundary at 0.7 both score 0.9333. What separates them?",
              [
                "The first finds three of the four adults and wrongly calls one child, the second finds two and wrongly calls nobody",
                "The first was fitted on the thirty and the second was not",
                "They differ only in how many children they correctly left alone",
                "The second is better once the majority share is subtracted from both",
              ],
              0,
              "At 0.5 there is one missed adult and one child incorrectly labeled adult. At 0.7 there are two missed adults and no children labeled adult. Each cutoff makes two mistakes, so accuracy is equal, but recall and precision describe different results.",
            ),
            choice(
              "What is a false positive here?",
              [
                "A child called an adult",
                "An adult called a child",
                "An adult the model found",
                "A child the model left alone",
              ],
              0,
              "Positive means the class the question is about, adult here, and has nothing to do with good news. The first word says whether the call was right and the second says what the call was, so an adult called a child is the false negative.",
            ),
            trueFalse(
              "Turning the dial to 0.99, above every chance in the crowd, gives the model a precision of zero.",
              false,
              "There are no adult predictions to use as the denominator of precision. This library reports the rate as undefined. That differs from zero precision, which would mean it made adult predictions and every one was wrong.",
            ),
            several(
              "If the score behavior within each class and the decision cutoff stay the same, but the proportions of adults and children change, which rates remain unchanged?",
              ["Recall", "Specificity", "Precision", "Accuracy"],
              [0, 1],
              "Recall measures the share of actual adults detected. Specificity measures the share of actual children correctly rejected. Changing the class proportions alone does not change those within-class rates. Precision and accuracy combine counts from both classes, so they can change with the proportions.",
            ),
        ],
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
                <>
<p>
                  Drag the marker down to 0.3. The short adult&rsquo;s 0.4911 now clears the bar, so all six adults are found and recall is 1.0, while the tall child&rsquo;s 0.8669 still clears it too, so seven people are called adult and six of them are, for a precision of 0.8571. Drag it up to 0.9 and only the three adults above 0.9 are called, so precision is a perfect 1.0 and recall halves to 0.5, with the adults at 0.7376, 0.7684 and 0.4911 now called children.
                </p>
                <p>
                  The model did not change between the two readings, and neither did any chance; the line the calls are read against did.
                </p>
</>
                <KeepInMind>

                  Where to set the threshold is a decision about costs and not
                  a property of the model, and the same fitted chances serve
                  a screening program at a low threshold and a confirmatory
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
                <>
<p>
                  Precision has no such guarantee, because both its numerator and its denominator move. Reading the amber curve at five thresholds on the twelve gives 0.75 at 0.1, 0.8571 at 0.2, 0.8333 at 0.5, 0.75 at 0.8 and 1.0 at 0.9. It rose, fell, fell and rose, and each move is one person crossing the line.
                </p>
                <p>
                  Between 0.2 and 0.49 the seven people above the line include the tall child and every adult; at 0.5 the short adult drops out, taking one true positive from a numerator of six and one person from a denominator of seven, and the ratio falls from six sevenths to five sixths.
                </p>
</>
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
                <p>Plot precision against recall while lowering the threshold. With distinct scores, each step adds one person: an actual adult increases recall, while a child can lower precision without changing recall. Equal scores enter together as a group. The curve records these changes at the distinct score values.</p>
                <PrecisionRecallCurve />
                <>
<p>
                  On the twelve there are twelve distinct chances and so twelve corners. The first three steps add the three most confident adults and precision holds at 1.0 while recall climbs to 0.5; the fourth adds the tall child and precision drops to 0.75 with recall unmoved; three more adults take recall to 1.0 with precision recovering to 0.8571; and the last five steps add the remaining children, lowering precision to 0.5 while recall has nowhere left to go.
                </p>
                <p>The step-sum area is average precision, 0.9151 here. At the final point, everyone is called adult, so precision equals the adult share of the crowd. Several points can have recall equal to one while precision continues to fall as more children are included.</p>
</>
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
                <p>ROC area can also be calculated from positive-negative pairs. There are thirty-six adult-child pairs here. The tall child at 0.8669 outranks the adults at 0.4911, 0.7376 and 0.7684; the other thirty-three pairs are correctly ordered, giving area 0.9167. A ranking unrelated to the labels has expected ROC area 0.5, although a finite random ordering need not trace the diagonal exactly.</p>
                <Equation>{"area under the ROC  =  share of (adult, child) pairs with the adult ranked higher, a tie counting a half\n                    =  33 / 36  =  0.9167 on the twelve\n                    =  102 / 104  =  0.9808 on the rare crowd"}</Equation>
                <KeepInMind>
                  ROC area summarizes ranking across the range of false positive rates. It does not specify the errors or practical value at the chosen operating threshold. Inspect that threshold’s confusion counts as well as the area.</KeepInMind>
              </SubSection>

              <SubSection title="12. What the two pictures answer differently">
                <>
<p>The curves summarize the same scores with different denominators. ROC uses recall and false positive rate, each calculated within one actual class. If class proportions change while both within-class score distributions stay fixed, the expected ROC curve stays unchanged. Precision combines both classes, so its curve also reflects their relative frequency.</p>
                <p>
                  Precision is a share of the people called adult, who are drawn from both classes, so the precision-recall curve knows the prevalence intimately and ends at it.
                </p>
</>
                <NumberTable
                  headings={["crowd", "share adult", "area under the ROC", "constant-score ROC reference", "average precision", "constant-score AP reference"]}
                  rows={[
                    ["the twelve", "0.5000", "0.9167", "0.5", "0.9151", "0.5000"],
                    ["adults rare", "0.1333", "0.9808", "0.5", "0.9167", "0.1333"],
                  ]}
                  caption="Both crowds through the same sweep. Giving everyone one constant score yields ROC area 0.5 and average precision equal to prevalence when both classes are present."
                />
                <>
<p>On the rare crowd, average precision is 0.9167 compared with a constant-score reference of 0.1333. On the twelve, it is 0.9151 compared with 0.5. The two model scores differ by less than 0.002, but their class proportions differ. ROC areas of 0.9808 and 0.9167 share a reference level of 0.5. Those references provide context; they are not lower bounds or proof that one deployment is better.</p>
                <p>
                  When the positive class is rare and the false alarms are what will be looked at, the precision-recall picture is the one that shows what it will cost, since a false positive rate of 0.04 on the rare crowd is one child, and on a crowd of ten thousand children it would be four hundred people to be examined for every few adults found.
                </p>
</>
                <KeepInMind>
                  The curves provide different information. ROC describes the ordering of positives relative to negatives. Precision-recall also exposes how common positives are in the evaluated population. The ROC areas differ here, 0.9808 and 0.9167, because both the fitted models and their crowds differ. This is not an experiment that changes only prevalence while holding class-conditional scores fixed.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. One Number, When One Is Needed",
          content: (
            <>
              <SubSection title="13. The harmonic mean">
                <p>F1 combines precision and recall using their harmonic mean. At threshold 0.9, precision is 1.0 and recall is 0.5. Their arithmetic mean is 0.75; their harmonic mean is 0.6667. F1 gives the lower rate more influence, which makes it one way to emphasize balance. Choosing that summary remains an evaluation decision, not a correction to mathematically wrong averaging.</p>
                <Equation>{"F1  =  2 · precision · recall / (precision + recall)\n\nat 0.9 on the twelve:   2 · 1.0 · 0.5 / (1.0 + 0.5)  =  0.6667     the arithmetic mean would say 0.75\nat 0.5 on the twelve:   2 · 0.8333 · 0.8333 / 1.6667  =  0.8333    the two agree, so any mean of them is 0.8333"}</Equation>
                <WhyThisWorks title="The Harmonic Mean of Precision and Recall">
                  <>
<p>Imagine retaining precision near 1.0 while recall becomes very small. For example, finding only one true adult in an increasingly large adult population makes recall approach zero. The arithmetic mean approaches 0.5, while the harmonic mean approaches zero. This is a limiting comparison: finding one of the twelve-person crowd’s six adults gives positive recall, not zero.</p>
                  <p>Calling everyone adult gives recall of 1.0 and precision equal to prevalence. On the twelve, precision is 0.5 and F1 is 0.6667. The combined score reflects the false positives, but it still needs to be read with the counts and the consequences of those calls.</p>
</>
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
                <p>Fβ adjusts the emphasis within the harmonic mean. Values below one favor precision, while values above one favor recall. The usual alternatives are a half and two. Their squared values, one quarter and four, control the relative weighting in the formula. Beta is a metric preference rather than a direct monetary cost ratio.</p>
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
                  Report which F-score was used and why that balance suits the task. F1 gives precision and recall equal emphasis in this formula; that does not establish that false positives and false negatives have equal practical costs. When actual costs are known, evaluate those consequences directly as well.</KeepInMind>
              </SubSection>

              <SubSection title="15. Choosing a threshold by an F-score, on the rows it was fitted to">
                <p>

                  Once there is one number, the sweep can be searched for the
                  threshold that maximizes it, and the dashed lines in the
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
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "Raising the threshold can lower recall but never raise it.",
              true,
              "Raising it can only turn a call of adult into a call of child, so the true positives can only fall and the false negatives can only rise. The denominator, which is the number of adults, does not depend on the threshold at all, so recall is a falling count over a constant and the indigo curve only ever steps downward.",
            ),
            trueFalse(
              "Precision falls as the threshold rises, for the same reason recall does.",
              false,
              "Precision has no such guarantee, because both its numerator and its denominator move. Read at five thresholds on the twelve it gives 0.75, 0.8571, 0.8333, 0.75 and 1.0, so it rose, fell, fell and rose, and each move is one person crossing the line. A curve with several local peaks is also why a coarse sweep can miss the best point.",
            ),
            choice(
              "The area under the ROC on the twelve is 0.9167. What is that counting?",
              [
                "The share of the thirty-six adult and child pairs in which the adult has the higher chance, which is thirty-three of them",
                "The share of the twelve the model placed correctly at its best threshold",
                "The share of the crowd that is adult",
                "The area under the precision-recall staircase",
              ],
              0,
              "ROC area compares every adult score with every child score, counting a tie as half a successful pair. Here the adult has the higher score in thirty-three of thirty-six pairs.\n\n```math\nAUC = 33 / 36 ≈ 0.9167\n```\n\nA random ranking has an expected area of 0.5. AUC measures ranking across cutoffs; it does not tell us whether the particular cutoff used in an application produces acceptable mistakes.",
            ),
            choice(
              "At a threshold of 0.9 on the twelve, precision is 1.0 and recall is 0.5. Which score reports 0.75?",
              ["The arithmetic mean", "F1", "F½", "F2"],
              0,
              "The arithmetic mean gives equal weight to the two rates. F1 uses their harmonic mean:\n\n```math\nF₁ = 2 × 1 × 0.5 / (1 + 0.5) ≈ 0.6667\n```\n\nF½ gives more weight to precision and is 0.8333 here. F2 gives more weight to recall and is 0.5556. Those choices matter because this model misses half the adults.",
            ),
            several(
              "Which of these hold for F1 on this page?",
              [
                "It ignores the true negatives, so it never rewards the children correctly left alone",
                "Swapping which class is called positive can change F1",
                "A model can buy a good F1 by abandoning recall while keeping precision at 1.0",
                "A threshold chosen by maximizing it over the sweep is a hyperparameter fitted to the rows it was scored on",
              ],
              [0, 1, 3],
              "F1 uses true positives, false positives and false negatives; true negatives do not enter its formula. Changing the positive class changes which counts play those roles and can change the score. Keeping precision high cannot maintain a high F1 if recall becomes very low. Selecting a cutoff to maximize F1 uses the scored data for model selection, so it needs a separate evaluation.",
            ),
        ],
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
                <p>For each class, treat it as positive and combine the other classes as negative. This multiclass table puts actual classes in rows and predicted classes in columns. A class’s recall uses its diagonal count divided by its row total. Its precision divides that same diagonal count by its column total.</p>
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
                  Macro F1 averages the per-class F1 values. Taking the harmonic mean of macro precision and macro recall gives a different summary. Under this SDK’s strict policy, a macro rate is undefined if any required class rate is undefined. Excluding such classes would change which class set the average describes.</KeepInMind>
              </SubSection>

              <SubSection title="19. The width has to be stated">
                <>
<p>
                  A three-class table needs to know it has three classes, and there are two ways it can find out. It can be told, or it can read the true classes of the rows it was handed and count. The second sounds harmless and is where a held-out fold goes wrong, because a fold of a small crowd can easily hold no adults, and a table that counts its classes from the rows then has no column for adults at all.
                </p>
                <p>
                  Switch the widget in section 16 to judge the crowd without its adults and untick the stated width.
                </p>
</>
                <DerivationTable
                  expressionHeading="the judged rows, and whether the width is stated"
                  reasonHeading="what happens"
                  rows={[
                    { expression: "everybody, width inferred", reason: "the true classes run 0, 1, 2 and the table is three by three; identical to stating it." },
                    { expression: "without the adults, width inferred", reason: "refused. The rows’ true classes run 0 and 1, so the inferred table has two columns, and the tall teenager is called class 2, which the table has no column for." },
                    { expression: "without the adults, width stated as three", reason: "accepted. The adult row is empty and the adult column holds the one wrongly called teenager, so adult precision is 0.0, adult recall is undefined, and the macro recall is undefined with it." },
                    { expression: "without the teenagers, width inferred", reason: "refused by name, since the true classes are 0 and 2 and leave a gap, which is nearly always a filtered crowd rather than a two-class problem." },
                    { expression: "everybody, width stated as two", reason: "refused, because the rows name a class 2 that a two-class table cannot hold." },
                    { expression: "everybody, width stated as four", reason: "accepted, with an empty fourth class whose recall is undefined." },
                  ]}
                />
                <>

                <p>
                  Stating the width turns that into a three-by-three table with an empty row, whose recall is undefined and says so. So the width is stated up front and the rows are held to it, which is the rule the fold endpoint of Part 7 uses on every fold.
                </p>
</>
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
                <>
<p>The bin from 0.8 to 1.0 contains four people with mean predicted probability 0.9230. Three are adults, giving an observed fraction of 0.75; the tall child is the other person. The bin from 0.6 to 0.8 contains two people with mean prediction 0.7530, both adults. These are observed bin differences from very small groups.</p>
                <p>The bin from 0.4 to 0.6 contains only the short adult, and the bin from 0.2 to 0.4 is empty. This twelve-person example leaves too little evidence in individual bins to assess calibration precisely. Keep the counts visible when interpreting the plotted gaps.</p>
</>
                <p>The mean predicted adult probability is 0.5000, compared with an observed adult fraction of 0.5. At a finite unpenalized logistic optimum with an intercept, this overall balance follows from the fitting equations. Overall agreement can coexist with differences inside bins. These four-person bin counts do not establish the true calibration error for future people.</p>
                <KeepInMind>

                  Evaluate calibration on observations excluded from fitting. All displayed bin results here use fitting observations. The run used its full 2000-pass budget without meeting its convergence test. That stopping result alone does not establish separation; it can also reflect the optimizer’s rate, tolerance or numerical behavior. Inspect those diagnostics before interpreting the probability estimates.</KeepInMind>
              </SubSection>

              <SubSection title="21. Two scores for a chance, and what each one adds">
                <p>

                  The diagram can be summarized in two numbers, and they
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
                  <p>For these twelve people, calibration error is 0.1672. Much of it comes from the four high-confidence adult predictions, one of which belongs to a child. The Brier score is 0.0983, compared with 0.25 for assigning everyone the class prevalence.</p>
                <p>Brier score reflects more than calibration. A model can improve it by assigning different probabilities to different outcomes without improving calibration. Conversely, assigning 0.5 to everyone in a balanced group can be calibrated while failing to distinguish any individuals.</p>
                </WorkedExample>
                <KeepInMind>
                  Expected calibration error depends on the binning, which here uses five equal-width intervals. Keep that definition when comparing results. Brier score uses no bins and can be compared on the same observations and outcome definition, while the diagram helps locate predicted-versus-observed differences. Neither score removes the need for enough independent evaluation data.</KeepInMind>
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
                  <p>ROC area depends on how positive-negative pairs are ordered, with ties given half credit. A strictly increasing transformation preserves those orders and ties, so it preserves ROC area. The reliability diagram also uses the numerical probability values, which can change under the same transformation.</p>
                </WhyThisWorks>
                <p>A model can rank well while its probability values disagree with observed frequencies. One possible response is to fit a calibration mapping using separate data, then evaluate that mapping on further excluded observations. This page supplies diagnostics for investigating that need; its small training example does not establish which repair would help.</p>
                <KeepInMind>
                  Good ranking and useful probability calibration answer different questions. A constant prevalence estimate can be calibrated without distinguishing individuals. To interpret a prediction near 0.7 as a long-run frequency, investigate calibration on comparable new observations; to decide whether to act, also consider the task and its consequences.</KeepInMind>
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

                  Two things change. The standardizing of heights and weights
                  that the fit needs has to be learned inside each fold, so
                  that a held-out person never lends their mean to the fit
                  that judges them, and the widget below does that. And a
                  fold of two or three people can hold no adults at all,
                  which is the undefined recall of section 7 arriving in
                  practice.
                </p>
                <KeepInMind>

                  A held-out judgment changes none of the definitions on this
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
                <>
<p>The pooled accuracy happens to be 0.8333 for every displayed split. Each row is evaluated once, but that fact does not force the predictions to remain the same: each split refits a different collection of models. Here seven folds give mean fold accuracy 0.8571, while five stratified folds give 0.8. Unequal fold sizes explain why an unweighted fold average can differ from pooled accuracy within one evaluation.</p>
                <p>
                  On the plain five-fold deal the two happen to agree to the last digit, which is arithmetic luck and not a rule.
                </p>
</>
                <>
<p>
                  What settles the question is the fold with no adults, which the plain five-fold deal produces. It holds two people, the refitted boundary wrongly calls one of them an adult, and its recall is zero found over zero present. Averaged, that fold has to contribute something and whatever is chosen is a convention. Pooled, it adds nothing to either side of the ratio, which is right, because a fold with no adults in it has no evidence about finding adults.
                </p>
                <p>
                  So a classifier&rsquo;s folds are pooled, and a spread across folds is reported only for accuracy, which is defined on any fold with anybody in it and reads 0.5 here on every deal.
                </p>
</>
                <Equation>{"pooled     ( Σ TPₖ ) / ( Σ (TPₖ + FNₖ) )      a fold with no adults adds 0 to both\naveraged   (1/k) Σ  TPₖ / (TPₖ + FNₖ)        a fold with no adults has no term to add"}</Equation>
                <KeepInMind>
                  Stratification reduces folds missing a class from one to none at five folds and from four to two at seven in this example. With twelve people in seven folds, some folds contain only one person, so both classes cannot appear in every fold. Pooling preserves the available positive and negative counts, while a zero denominator in the combined totals still remains undefined.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Keeping Class Labels and Score Conventions Consistent" , id: "part-8-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="25. The positive class, threshold rule and undefined rates" id="25-what-a-complete-implementation-specifies">
                <p>A score needs a defined question. Name the positive class and accepted labels, state whether a value equal to the threshold counts as positive, and give a policy for each rate whose denominator can be zero. An F-score also needs its beta value.</p>
                <p>Curves add further choices. Are thresholds taken from every distinct score or a fixed grid? Is precision-recall area a step sum or a trapezoid, and is a conventional first point inserted? How do tied scores contribute to ROC area?</p>
                <p>For several classes, distinguish macro from micro averaging and explain what happens to an undefined class rate. State whether the class count is supplied or inferred. Reliability diagrams need a bin count and a rule for equal-width or equal-count bins; cross-validation summaries need to say whether folds were pooled or their scores averaged.</p>
                <p>To reproduce these results, begin with the label convention: adult is positive, and a score at or above the threshold predicts adult. An empty denominator produces an undefined rate here. That choice matters when comparing software that substitutes zero.</p>
              <p>The threshold sweep uses every hundredth, while the ROC and precision-recall curves use every distinct predicted probability. Average precision uses a step sum, and a tied positive-negative pair receives half credit in the ranking calculation. The page also states its multiclass averaging, calibration-bin and cross-validation pooling conventions beside those calculations. Keep those choices with the report instead of comparing similarly named scores blindly.</p>
              </SubSection>

              <SubSection title="26. No positive calls, missing classes and threshold ties" id="26-the-edges-each-one-run">
                <p>The table describes the request and evaluation contracts for these cases. Distinguish an input rejected before fitting from a metric that is undefined after a valid fit.</p>
                <DerivationTable
                  expressionHeading="Labels or evaluation split"
                  reasonHeading="Which scores can be interpreted"
                  rows={[
                    { expression: "an empty crowd, or one person", reason: "refused before any fit, by the request’s bound of at least two people." },
                    { expression: "two people, one of each class", reason: "refused by the fit, which says that estimating three parameters needs at least three people." },
                    { expression: "one class only", reason: "refused by the fit by name, since a classifier needs both classes. The two-class table itself accepts a crowd of one class and refuses only the rate that has no denominator, recall on a crowd with no adults." },
                    { expression: "a constant column", reason: "refused by the standardizer before the fit, because a column with no spread cannot be scaled." },
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
                    { expression: "a fit that does not converge", reason: "accepted and reported. The fit on the twelve reached its 2000-pass limit without meeting its convergence test. The returned count and flag describe that stopping result; they do not identify its cause." },
                  ]}
                />
                <p>The API reports an iteration count and convergence flag even when the run reaches its budget. That result requires investigation; it does not alone identify complete separation. Calibration error also needs its binning definition alongside the value, while Brier score and a reliability plot provide additional views of the same probability predictions.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            trueFalse(
              "On the sixteen, micro precision, micro recall and accuracy are the same number, 0.875.",
              true,
              "Every person gets exactly one call, so the pooled numerator is the diagonal and the pooled denominator is everybody, and the three figures are one number reported under three names. The macro average is a different question, 0.8778 here, because it gives every class an equal vote however many people it holds.",
            ),
            trueFalse(
              "Macro F1 is the harmonic mean of macro precision and macro recall.",
              false,
              "Macro F1 is the arithmetic mean of the individual classes' F1 scores. Averaging precision and recall first and then taking their harmonic mean is a different procedure. The procedures happen to agree for these predictions because each class has equal precision and recall; that agreement does not define macro F1. This library reports a macro rate as undefined if a required class rate is undefined, rather than silently omitting that class.",
            ),
            choice(
              "An evaluation infers its class count from the supplied labels. Both the true and predicted labels contain only children and teenagers. What did the evaluation return in this example?",
              [
                "It came back two by two with no adult column and every figure defined",
                "It raised, because a class was missing",
                "It reported an undefined recall for the adult class",
                "It reported an accuracy of zero on the adults",
              ],
              0,
              "Neither supplied label list contains class 2, so the evaluation infers two classes and returns a two-by-two table. The defined problem still has three classes. Passing n_classes=3 preserves an adult row and column; adult recall is then undefined because there are no actual adults in this subset.",
            ),
            trueFalse(
              "Applying a strictly increasing transformation to these predicted probabilities preserves the ROC area of 0.9167 but can change the reliability diagram.",
              true,
              "A strictly increasing transformation preserves which score is higher and which scores tie, so the pair comparisons behind ROC area are unchanged. Calibration uses the probability values themselves. Changed values can alter bin membership and mean predicted probabilities without changing the ranking.",
            ),
            several(
              "The example divides the same twelve fixed predictions into folds without refitting the classifier. Which statements hold when those folds are combined?",
              [
                "The pooled accuracy stays 0.8333 for every partition because the same twelve predictions are counted once each",
                "With seven folds, the unweighted mean accuracy is 0.8571 because a one-person fold has the same weight as a two-person fold",
                "Stratifying the deal removes every fold that is missing a class",
                "A fold with no adults adds nothing to either side of the pooled recall",
              ],
              [0, 1, 3],
              "Pooling adds the confusion counts for the same twelve fixed predictions, so their combined accuracy is unchanged. Averaging fold accuracies instead gives each fold equal weight despite their unequal sizes. Stratification cannot put both classes in every fold when some folds contain only one person. A fold with no adults contributes zero actual-adult and true-positive counts to pooled recall. In cross-validation that refits a model for each fold, changing the split can change predictions and the pooled score.",
            ),
        ],
        },
        {
          title: "Practice. Judging the Crowds With the Library",
          practice: [
            exercise("Fill the four cells",["Fit the logistic regression model to the twelve people below. Standardize height and weight first, then train for up to 2,000 passes. Print the adult probabilities for the tall child and the short adult, whose measurements overlap the other class.", "Evaluate the predictions at a cutoff of 0.5. Print all four confusion-table counts, followed by accuracy, precision and recall. Also print epochs_run and converged so we can check whether this run stopped at its convergence criterion or its pass limit."],`from oop_ml import Feature, LogisticRegression, Standardizer

heights = [118, 120, 122, 125, 140, 168, 150, 159, 162, 178, 180, 183]
weights = [24, 25, 28, 31, 45, 66, 50, 57, 61, 78, 80, 83]
is_adult = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

scaled = Standardizer().fit_transform([Feature("height", heights), Feature("weight", weights)])
labels = Feature("is_adult", is_adult)
model = LogisticRegression(learning_rate=1.0, max_epochs=2000, tolerance=1e-6)
# Fit the boundary on the standardised columns and print the chance it gives
# the tall child (position 5) and the short adult (position 6). Then evaluate
# it and print the four cells of the table, the accuracy, the precision and
# the recall, and how the climb ended.`,`from oop_ml import Feature, LogisticRegression, Standardizer

heights = [118, 120, 122, 125, 140, 168, 150, 159, 162, 178, 180, 183]
weights = [24, 25, 28, 31, 45, 66, 50, 57, 61, 78, 80, 83]
is_adult = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

scaled = Standardizer().fit_transform([Feature("height", heights), Feature("weight", weights)])
labels = Feature("is_adult", is_adult)
model = LogisticRegression(learning_rate=1.0, max_epochs=2000, tolerance=1e-6)
model.fit(scaled, labels)
chances = [float(chance) for chance in model.predict_probability(scaled)]
print(f"tall child {chances[5]:.4f}, short adult {chances[6]:.4f}")

evaluation = model.evaluate(scaled, labels)
cells = evaluation.confusion_matrix
print(f"true positives {cells.true_positives}, false negatives {cells.false_negatives}")
print(f"false positives {cells.false_positives}, true negatives {cells.true_negatives}")
print(f"accuracy {evaluation.accuracy:.4f}, precision {evaluation.precision:.4f}, recall {evaluation.recall:.4f}")
print(f"passes run {model.epochs_run}, converged {model.converged}")`,`tall child 0.8669, short adult 0.4911
true positives 5, false negatives 1
false positives 1, true negatives 5
accuracy 0.8333, precision 0.8333, recall 0.8333
passes run 2000, converged False`,{...{ hints: ["fit takes the standardized features and the label Feature, and predict_probability answers one chance per person in the order the rows were given, so positions 5 and 6 are the 168 cm child and the 150 cm adult.", "evaluate pairs the calls at the model’s threshold of one half with the truth and answers an evaluation whose confusion_matrix carries true_positives, false_negatives, false_positives and true_negatives.", "accuracy, precision and recall are evaluation properties. The fitted model records its training passes in epochs_run and whether it met its stopping criterion in converged."], check: numberCheck("What chance does the boundary give the tall child?", 0.8669, 0.0005, "The tall child receives a larger adult score than the short adult. A single threshold cannot label both correctly in this fitted score ordering, which produces the two opposite mistakes in the confusion table.") },question:"Which people does the fitted boundary misclassify?"}),
            exercise("Score the rare crowd beside its baseline",["Of the thirty people below, only four are adults. First evaluate a baseline that predicts child for everyone. Fit the logistic regression model, then evaluate its predictions at cutoffs of 0.5 and 0.7.", "Print accuracy and recall for the baseline. For each fitted-model cutoff, print accuracy, precision and recall. Check how two cutoffs can have the same accuracy while finding different numbers of adults."],`from oop_ml import ClassificationEvaluation, Feature, LogisticRegression, Standardizer

heights = [110, 113, 115, 118, 120, 121, 122, 124, 125, 127, 128, 130, 131, 133, 134,
           136, 137, 139, 140, 142, 144, 145, 147, 149, 152, 155, 150, 156, 178, 183]
weights = [20, 21, 22, 24, 25, 27, 28, 29, 31, 32, 34, 35, 37, 38, 40,
           41, 42, 44, 45, 46, 47, 48, 49, 51, 52, 54, 50, 53, 78, 83]
is_adult = [0] * 26 + [1] * 4

scaled = Standardizer().fit_transform([Feature("height", heights), Feature("weight", weights)])
labels = Feature("is_adult", is_adult)
model = LogisticRegression(learning_rate=1.0, max_epochs=2000, tolerance=1e-6).fit(scaled, labels)
chances = [float(chance) for chance in model.predict_probability(scaled)]

# Evaluate a call of child for everybody and print its accuracy and recall.
# Then for thresholds 0.5 and 0.7, call an adult wherever the chance reaches
# the threshold and print the accuracy, the precision and the recall.`,`from oop_ml import ClassificationEvaluation, Feature, LogisticRegression, Standardizer

heights = [110, 113, 115, 118, 120, 121, 122, 124, 125, 127, 128, 130, 131, 133, 134,
           136, 137, 139, 140, 142, 144, 145, 147, 149, 152, 155, 150, 156, 178, 183]
weights = [20, 21, 22, 24, 25, 27, 28, 29, 31, 32, 34, 35, 37, 38, 40,
           41, 42, 44, 45, 46, 47, 48, 49, 51, 52, 54, 50, 53, 78, 83]
is_adult = [0] * 26 + [1] * 4

scaled = Standardizer().fit_transform([Feature("height", heights), Feature("weight", weights)])
labels = Feature("is_adult", is_adult)
model = LogisticRegression(learning_rate=1.0, max_epochs=2000, tolerance=1e-6).fit(scaled, labels)
chances = [float(chance) for chance in model.predict_probability(scaled)]

lazy = ClassificationEvaluation(is_adult, [0] * 30)
print(f"everybody a child: accuracy {lazy.accuracy:.4f}, recall {lazy.recall:.4f}")
for threshold in (0.5, 0.7):
    calls = [1 if chance >= threshold else 0 for chance in chances]
    judged = ClassificationEvaluation(is_adult, calls)
    print(f"threshold {threshold}: accuracy {judged.accuracy:.4f}, precision {judged.precision:.4f}, recall {judged.recall:.4f}")`,`everybody a child: accuracy 0.8667, recall 0.0000
threshold 0.5: accuracy 0.9333, precision 0.7500, recall 0.7500
threshold 0.7: accuracy 0.9333, precision 1.0000, recall 0.5000`,{...{ hints: ["ClassificationEvaluation takes the true labels followed by the predicted labels. The baseline predicts child, class 0, for all thirty people.", "Compare each predicted probability with the cutoff. A probability at or above it produces class 1; a lower probability produces class 0. Changing the cutoff does not refit the model.", "Recall is a property of the evaluation, the share of the four adults found, and precision the share of the people called adult who were."], check: numberCheck("What recall does the boundary have at a threshold of 0.7?", 0.5, 0.0005, "Raising the threshold removes a true adult detection and a false adult detection here. The total correct count stays the same, while recall and precision expose the changed kinds of mistake.") },question:"Can two thresholds have equal accuracy while finding different numbers of adults?"}),
            exercise("Turn the dial to 0.9, then past everybody",["Use a cutoff of 0.9 for the twelve people. Print precision, recall and F1. Compare F1 with the arithmetic mean of precision and recall: how does each describe a model that finds only half the adults?", "Repeat with a cutoff of 0.99, which produces no adult predictions. Print accuracy and recall. Then request precision, catch the library error, and print its class name and message. Precision divides by the number of adult predictions, so this case has no defined precision."],`from oop_ml import ClassificationEvaluation, Feature, LogisticRegression, MLLibError, Standardizer

heights = [118, 120, 122, 125, 140, 168, 150, 159, 162, 178, 180, 183]
weights = [24, 25, 28, 31, 45, 66, 50, 57, 61, 78, 80, 83]
is_adult = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

scaled = Standardizer().fit_transform([Feature("height", heights), Feature("weight", weights)])
labels = Feature("is_adult", is_adult)
model = LogisticRegression(learning_rate=1.0, max_epochs=2000, tolerance=1e-6).fit(scaled, labels)
chances = [float(chance) for chance in model.predict_probability(scaled)]

# At a threshold of 0.9 print the precision, the recall and the F1 score of
# the calls. Then at 0.99 print the accuracy and the recall, ask for the
# precision, and print the name and the message of what the library raises.`,`from oop_ml import ClassificationEvaluation, Feature, LogisticRegression, MLLibError, Standardizer

heights = [118, 120, 122, 125, 140, 168, 150, 159, 162, 178, 180, 183]
weights = [24, 25, 28, 31, 45, 66, 50, 57, 61, 78, 80, 83]
is_adult = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

scaled = Standardizer().fit_transform([Feature("height", heights), Feature("weight", weights)])
labels = Feature("is_adult", is_adult)
model = LogisticRegression(learning_rate=1.0, max_epochs=2000, tolerance=1e-6).fit(scaled, labels)
chances = [float(chance) for chance in model.predict_probability(scaled)]

at_nine = ClassificationEvaluation(is_adult, [1 if chance >= 0.9 else 0 for chance in chances])
print(f"at 0.9: precision {at_nine.precision:.4f}, recall {at_nine.recall:.4f}, F1 {at_nine.f1_score:.4f}")

nobody = ClassificationEvaluation(is_adult, [1 if chance >= 0.99 else 0 for chance in chances])
print(f"at 0.99: accuracy {nobody.accuracy:.4f}, recall {nobody.recall:.4f}")
try:
    print(nobody.precision)
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")`,`at 0.9: precision 1.0000, recall 0.5000, F1 0.6667
at 0.99: accuracy 0.5000, recall 0.0000
UndefinedMetricError: precision is undefined when nothing was predicted positive`,{...{ hints: ["f1_score is a property of the evaluation beside precision and recall, and it is the harmonic mean of the two.", "Accuracy has twelve observations in its denominator, and recall has six actual adults. Both remain defined at 0.99. Precision divides by the number of predicted adults, which is zero."], check: numberCheck("What F1 score do the calls at 0.9 earn?", 0.6667, 0.0005, "At the higher cutoff the model finds only part of the adult class. F1 reflects the imbalance between precision and recall. When no adult prediction is issued, precision has no denominator and this library reports it as undefined.") },question:"What happens to precision and recall when we raise the threshold?"}),
            exercise("Judge three classes with the width stated",["Fit the three-class model to the sixteen people below after standardizing height and weight. Allow up to 500 training passes. Print precision and recall for each class, followed by macro precision and overall accuracy.", "Next keep only observations whose true class is child or teenager. Build a MultiClassEvaluation for these observations with n_classes=3, then request adult recall. Catch and print the error. The class list still includes adults even though this subset contains none."],`from oop_ml import Feature, MLLibError, MultiClassEvaluation, MultinomialLogisticRegression, Standardizer

heights = [118, 120, 122, 125, 145, 147, 156, 159, 162, 178, 180, 183, 186, 172, 160, 141]
weights = [24, 25, 28, 31, 57, 41, 53, 57, 61, 78, 80, 83, 77, 70, 58, 40]
age_group = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 2, 0]
names = ("child", "teenager", "adult")

scaled = Standardizer().fit_transform([Feature("height", heights), Feature("weight", weights)])
labels = Feature("age_group", age_group)
model = MultinomialLogisticRegression(learning_rate=1.0, max_epochs=500, tolerance=1e-6).fit(scaled, labels)
# Evaluate the model on the sixteen and print each class's precision and
# recall, then the macro precision and the accuracy. Then build a
# MultiClassEvaluation from only the rows that are not adults, with
# n_classes=3, ask for the adult class's recall, and print what is raised.`,`from oop_ml import Feature, MLLibError, MultiClassEvaluation, MultinomialLogisticRegression, Standardizer

heights = [118, 120, 122, 125, 145, 147, 156, 159, 162, 178, 180, 183, 186, 172, 160, 141]
weights = [24, 25, 28, 31, 57, 41, 53, 57, 61, 78, 80, 83, 77, 70, 58, 40]
age_group = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 2, 0]
names = ("child", "teenager", "adult")

scaled = Standardizer().fit_transform([Feature("height", heights), Feature("weight", weights)])
labels = Feature("age_group", age_group)
model = MultinomialLogisticRegression(learning_rate=1.0, max_epochs=500, tolerance=1e-6).fit(scaled, labels)
judged = model.evaluate(scaled, labels)
for index, name in enumerate(names):
    print(f"{name}: precision {judged.precision_for(index):.4f}, recall {judged.recall_for(index):.4f}")
print(f"macro precision {judged.macro_precision:.4f}, accuracy {judged.accuracy:.4f}")

calls = [int(call) for call in model.predict(scaled)]
kept = [position for position, group in enumerate(age_group) if group != 2]
without_adults = MultiClassEvaluation([age_group[position] for position in kept], [calls[position] for position in kept], n_classes=3)
try:
    print(without_adults.recall_for(2))
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")`,`child: precision 1.0000, recall 1.0000
teenager: precision 0.8333, recall 0.8333
adult: precision 0.8000, recall 0.8000
macro precision 0.8778, accuracy 0.8750
UndefinedMetricError: recall for class 2 is undefined because no row belongs to it`,{...{ hints: ["evaluate on a three-class model answers a MultiClassEvaluation whose precision_for and recall_for take a class index, 0 for child, 1 for teenager and 2 for adult, and whose macro_precision and accuracy are properties.", "predict answers one class per row as a float, so int turns each into the class index, and the rows to keep are those whose true class is not 2.", "MultiClassEvaluation takes the true classes, the calls and n_classes, and stating the width is what gives the table an empty adult row rather than a table that quietly shrank."], check: numberCheck("What macro precision does the model earn on the sixteen?", 0.8778, 0.0005, "Macro precision gives each class's precision equal weight. Pooled single-label accuracy gives each person equal weight. Their values can differ because the classes have different sizes.") },question:"How do per-class and pooled scores describe the three-class predictions?"}),
          ],
        },
      ]}
    />
  );
}
