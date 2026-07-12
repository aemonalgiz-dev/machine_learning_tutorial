import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { PooledFoldsTable } from "@/components/widgets/PooledFoldsTable";
import { ThresholdMatrix } from "@/components/widgets/ThresholdMatrix";

export const metadata: Metadata = {
  title: "Judging a Classifier · oop_ml",
  description:
    "Accuracy is one number and it hides two different mistakes. The confusion matrix keeps them apart, precision and recall read it two ways, and the threshold a classifier commits at is a dial we can turn.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function JudgingAClassifierPage() {
  return (
    <ConceptPage
      title="Judging a Classifier"
      tagline="Four cells, four ratios, and a dial that trades one mistake for the other."
      prerequisites={
        <>
          The model being judged is the{" "}
          <Link href="/concepts/logistic-regression" className={linkClass}>
            logistic regression
          </Link>{" "}
          page&rsquo;s, whose answer is a chance rather than a verdict, and the
          folding at the end is the{" "}
          <Link href="/concepts/held-out-evaluation" className={linkClass}>
            held-out evaluation
          </Link>{" "}
          page&rsquo;s applied to a classifier.
        </>
      }
      history={
        <>
          <p>
            Accuracy is the obvious score and it has been failing people for a
            long time. The vocabulary that replaced it came from wartime radar,
            where operators had to decide whether a blip was an aircraft, and
            where calling nothing an aircraft and missing a real one are
            catastrophes of very different kinds. The analysis of that trade
            became signal detection theory, and the receiver operating
            characteristic that goes with it is named for those receivers.
          </p>
          <p>
            Medicine formalised the same four cells as sensitivity and
            specificity, and information retrieval arrived at a different pair.
            Cyril Cleverdon, running the Cranfield experiments on library
            indexing through the late 1950s and 1960s, needed to know both what
            share of the documents a search returned were relevant and what
            share of the relevant documents it found, and those two became
            precision and recall. They are the same table read along its rows
            rather than its columns, and which pair a field uses says mostly
            which mistake that field is more afraid of.
          </p>
        </>
      }
      playground={<ThresholdMatrix />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Twelve people are in the box above, six children and six adults,
                and each is labelled with the chance the fitted model gives them
                of being an adult. Ten of them are easy. Two are not: there is a
                child at 168 centimetres who looks adult by any measurement, and
                an adult at 150 who looks like a child. No boundary drawn from
                height and weight can place those two correctly, so the model
                gets them wrong, and the colours say which way.
              </p>
              <p>
                That is the first thing the matrix buys. Accuracy would say
                0.8333 and stop. The matrix says one child was called an adult
                and one adult was called a child, which are different mistakes
                that may matter very differently. If the question were whether to
                admit somebody to an adult ward, one of those errors is
                paperwork and the other is a safeguarding failure.
              </p>
              <p>
                Now move the threshold. Nothing refits: the boundary and every
                chance were computed once, and the dial only moves the line
                between calling somebody adult and calling them child. Drag it
                down and the misses vanish while the false alarms grow; drag it
                up and the reverse. The two curves at the bottom are that trade
                drawn out, and there is no setting where both are perfect,
                because the two overlapping people are in the way.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                A model that answers with a chance has not yet made a decision.
                Turning a chance into a verdict needs a threshold, and every
                verdict then falls into one of four cells according to what was
                said and what was true.
              </p>
              <Equation>{"                      is adult        is child\ncalled adult      true positive   false positive\ncalled child      false negative  true negative"}</Equation>
              <p>
                All four rates on this page are ratios of those cells, and the
                only difference between them is which total sits underneath. Read
                the table down its first column and you get recall, the share of
                actual adults the model found. Read across its first row and you
                get precision, the share of the people it called adult who
                really were. Specificity is recall for the other class, and
                accuracy is the diagonal over everything.
              </p>
              <Equation>{"accuracy     (TP + TN) / everything\nprecision     TP / (TP + FP)      of those called adult, how many were\nrecall        TP / (TP + FN)      of the actual adults, how many were found\nspecificity   TN / (TN + FP)      recall, for the other class"}</Equation>
              <p>
                One of those four can be undefined. If the threshold is high
                enough that nobody at all is called adult, precision is zero
                over zero, and the library reports that as nothing rather than as
                zero, because a model that made no positive claims has not made
                bad ones. Accuracy, recall and specificity always have a
                denominator as long as both classes are present.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Leave the threshold at the halfway mark and count the box by
                hand. Six adults, of whom five are called adult and one, the
                short one, is not. Six children, of whom five are called child
                and one, the tall one, is not.
              </p>
              <Equation>{"true positives   5        false negatives  1\nfalse positives  1        true negatives   5"}</Equation>
              <p>
                Every rate on this fixture comes out as the same number, which
                is a convenience for checking rather than a general fact. There
                are six of each class and exactly one miss in each direction, so
                every ratio is five over six.
              </p>
              <Equation>{"accuracy     10 / 12  =  0.8333\nprecision     5 /  6  =  0.8333\nrecall        5 /  6  =  0.8333\nspecificity   5 /  6  =  0.8333"}</Equation>
              <p>
                Now move the dial to three tenths. The short adult&rsquo;s chance
                is enough to clear that bar, so she is found, and recall becomes
                a perfect 1.000. Nothing is free: the same move keeps the tall
                child wrongly called, so of the seven people now called adult six
                are, and precision falls to six sevenths, 0.8571.
              </p>
              <p>
                Move it to nine tenths instead. Now nothing is wrongly called
                adult at all and precision is a perfect 1.000, but only three of
                the six adults clear the bar, so recall halves to 0.500. Neither
                of those is the model getting better or worse. The model never
                changed. Only the price being paid for a wrong call did.
              </p>
            </>
          ),
        },
        {
          title: "Folding a Classifier",
          content: (
            <>
              <p>
                Judging on the training rows is the mistake the held-out page is
                about, so these figures should really come from folding. That
                raises a question with two plausible answers: to combine the
                folds, do you average each fold&rsquo;s accuracy, or add the
                folds&rsquo; tables together and divide once at the end?
              </p>
              <PooledFoldsTable />
              <p>
                The table deals the same twelve people four different ways. Look
                at the pooled column first: it reads 0.8333 on every row, four
                times. That is not luck. Every person is held out in exactly one
                fold whatever the deal, so adding the folds&rsquo; tables always
                reconstructs the same twelve rows, and the same table can only
                give one answer.
              </p>
              <p>
                The averaged column does not do that. Dealt seven ways it says
                0.8571 where the pooled figure says 0.8333, because twelve people
                do not divide into seven equal folds and averaging gives a fold
                of one the same vote as a fold of two. Dealt five ways with the
                classes balanced it says 0.8000. Three different answers about
                one crowd, decided by how the cards fell.
              </p>
              <p>
                The argument that settles it, though, is not the wobble. It is
                recall on a fold that happens to hold no adults at all, which the
                five-fold deal produces. That fold&rsquo;s recall is zero over
                zero. Averaged, it has to contribute something, and whatever is
                chosen is a convention rather than a measurement. Pooled, it
                contributes nothing to either side of the ratio, which is exactly
                right, because a fold with no adults in it has no evidence about
                finding adults. So the library pools, and offers the averaged
                figure only for accuracy, which is always defined.
              </p>
              <p>
                Two more things the table shows. Balancing the deal so each fold
                keeps the class proportions cuts the folds missing a class from
                one to none at five folds, and from four to two at seven, and
                cannot get it to zero there. Twelve people in seven folds leaves
                folds of a single person, and one person cannot carry two
                classes however carefully you deal. Stratifying makes the problem
                rare; nothing makes it impossible. And the spread across folds is
                reported alongside the pooled figure for a reason: at 0.5 on this
                crowd it says plainly that twelve people are too few to be
                confident about, which a single tidy 0.8333 would hide.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Two things here can be shown rather than asserted, and the first
                explains why the curves in the box move the way they do.
              </p>
              <p>
                Raising the threshold can only ever turn a call of adult into a
                call of child, never the reverse. So as the threshold rises the
                true positives can only fall and the false negatives can only
                rise, which fixes the direction of recall completely.
              </p>
              <Equation>{"threshold up   →   TP falls,  FN rises\nrecall = TP / (TP + FN)   with TP + FN fixed at the number of adults\n\nso recall never rises as the threshold rises"}</Equation>
              <p>
                The denominator there is worth noticing: the number of actual
                adults does not depend on the threshold at all, so recall is
                simply the falling numerator over a constant, and it can only
                fall. Precision has no such guarantee, because both its
                numerator and its denominator move, which is why the amber curve
                is not monotone while the indigo one must be.
              </p>
              <p>
                The second is the pooling claim. Write each fold&rsquo;s table as
                counts, and note that a rate over the pooled table is a sum of
                numerators over a sum of denominators, where averaging is a mean
                of ratios.
              </p>
              <Equation>{"pooled     ( Σ TPₖ ) / ( Σ (TPₖ + FPₖ) )\naveraged   (1/k) Σ  TPₖ / (TPₖ + FPₖ)"}</Equation>
              <p>
                Those two agree exactly when every denominator is the same, and
                differ otherwise, which is the whole of the disagreement in the
                table above. The pooled form is a weighted mean of the folds&rsquo;
                rates with each fold weighted by its own size, and that is the
                right weighting, because a fold holding one person is one
                person&rsquo;s worth of evidence. And the pooled form needs no
                convention for an empty denominator, since a fold with none of a
                class adds zero to both the top and the bottom, which is the
                behaviour the averaged form has to legislate.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
