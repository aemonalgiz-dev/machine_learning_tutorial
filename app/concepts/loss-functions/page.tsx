import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { LossCurvesPlayground } from "@/components/widgets/LossCurvesPlayground";

export const metadata: Metadata = {
  title: "Loss Functions · oop_ml",
  description:
    "The loss is the number the whole network is trying to lower, and its shape decides what a wrong answer costs and how hard the correction pushes. Five of them, and three share one gradient.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function LossFunctionsPage() {
  return (
    <ConceptPage
      title="Loss Functions"
      tagline="The number a network is trying to make small, and the slope it hands back."
      prerequisites={
        <>
          Squared error is the{" "}
          <Link href="/concepts/simple-linear-regression" className={linkClass}>
            line page&rsquo;s
          </Link>{" "}
          loss and log-loss is the{" "}
          <Link href="/concepts/logistic-regression" className={linkClass}>
            logistic page&rsquo;s
          </Link>
          , so both are old friends here. The slope of each comes from the{" "}
          <Link href="/primers/calculus" className={linkClass}>
            calculus primer
          </Link>
          .
        </>
      }
      history={
        <>
          <p>
            Every fit on this site has been a search for the settings that make
            some number as small as possible, and that number has a name, the
            loss. Adrien-Marie Legendre published the first one in 1805, the
            sum of squared misses, as a way to reconcile astronomical
            observations that disagreed with each other, and Carl Friedrich
            Gauss, who claimed to have been using it since 1795, gave it its
            reason in 1809, showing that squared error is exactly what you
            should minimise when the noise is normally distributed. For a
            century and a half that was the loss.
          </p>
          <p>
            The others arrived as answers to what squared error gets wrong.
            Peter Huber&rsquo;s 1964 paper on robust estimation began from the
            observation that a single wild reading can drag a squared-error fit
            anywhere, and proposed a loss that is squared near the truth and
            straight far from it, so an outlier pulls with a bounded force. The
            logarithmic score that I. J. Good proposed in 1952 for judging a
            forecaster, pay the negative log of the probability you gave the
            thing that happened, became the loss for every model that answers
            with a probability, and John Bridle named the softmax in 1989 when
            he showed that a network&rsquo;s outputs could be read as class
            probabilities and trained by that same score.
          </p>
        </>
      }
      playground={<LossCurvesPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The slider in the box above is one number, the raw output of a
                network&rsquo;s last layer, and the five curves are five
                opinions about how much that number costs. Three of them read
                it as a plain prediction of a quantity and compare it to the
                target, which starts at one half. Two of them read it as a
                score to be squashed into a probability and compare that to a
                yes or a no, which starts at yes. The upper chart is the cost,
                the lower chart is the slope of the cost, and the slope is the
                thing a network actually uses, because the slope says which
                way to move.
              </p>
              <p>
                Drag the slider left and right and watch the shapes. Squared
                error is a bowl that steepens without limit, so a miss of five
                costs a hundred times a miss of one half. Absolute error is a
                vee, and its slope is either plus one or minus one however far
                out you go, which is a property rather than a flaw. Huber is
                the bowl until the knee and the vee beyond it. The two
                cross-entropies are the odd ones, flat and cheap on the side
                where the squash agrees with the label and rising like a
                straight line on the side where it does not, and they sit on
                top of one another, which the page will explain.
              </p>
              <p>
                Then look at the gradient chart with the slider at zero. Three
                of the five dots sit on exactly the same value, minus one
                half. That is not a coincidence of the drawing. It is the fact
                this page exists to teach.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                A loss takes a block of raw outputs and a block of truths of
                the same shape and answers with two things that must travel
                together, the cost and the slope of the cost at every raw
                output. The library&rsquo;s convention is to sum over
                everything and divide by the number of rows, so a batch twice
                the size does not cost twice as much, and the gradient carries
                the same division so the step size does not secretly depend on
                the batch. On this page every measurement is one row, so the
                division is by one and the arithmetic can be checked by hand.
              </p>
              <p>
                The three regression losses compare the raw output directly to
                the target. Squared error halves the square of the miss, and
                the half is bookkeeping, there so the slope comes out as a clean
                subtraction rather than carrying a two. Absolute error takes
                the size of the miss and nothing more. Huber takes a
                threshold, squared inside it and straight outside, with the
                two pieces arranged to meet at the knee so the cost has no
                jump and the slope has no gap.
              </p>
              <Equation>{"squared    (p − y)² / 2        slope  p − y\nabsolute   |p − y|             slope  sign(p − y)\nhuber      squared inside d, d·(|p − y| − d/2) outside"}</Equation>
              <p>
                The two classification losses do one thing more before they
                compare. Binary cross-entropy pushes the raw output through
                the sigmoid to get a probability of yes, then charges the
                negative logarithm of the probability it gave to whichever
                answer was true. Softmax cross-entropy does the same across
                several classes, pushing a row of raw scores through the
                softmax and charging the negative logarithm of the probability
                on the true class. The squash belongs to the loss, not to the
                last layer, and that arrangement is deliberate, since it is
                what lets the last layer stay linear and the backward pass
                begin with a subtraction.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked example button, or leave the box as it
                loaded. The target is one half, the label is yes, and the raw
                output is zero, so the three regression losses see a miss of
                minus one half. Squared error charges a quarter, halved, which
                is one eighth, and its slope is the miss itself.
              </p>
              <Equation>{"(0 − 0.5)² / 2 = 0.125        slope  0 − 0.5 = −0.5"}</Equation>
              <p>
                Absolute error charges the size of the miss, one half, and
                pulls by minus one, because its slope is only ever a sign.
                Huber at its default knee of one is inside the knee, so it
                agrees with squared error exactly, one eighth and minus one
                half. The two cross-entropies squash zero first, and the
                sigmoid of zero is one half, so each of them charges the
                negative logarithm of one half.
              </p>
              <Equation>{"σ(0) = 0.5        −ln(0.5) = 0.6931        slope  0.5 − 1 = −0.5"}</Equation>
              <p>
                The readout shows 0.1250 and −0.5000 for squared error, 0.5000
                and −1.0000 for absolute error, 0.1250 and −0.5000 for Huber,
                and 0.6931 and −0.5000 for both cross-entropies, with a
                probability of 0.5000 beside each of those two. Now drag the
                raw output to three. The miss is two and a half. Squared error
                charges half of six and a quarter, which is 3.125, and pulls
                by 2.5. Absolute error charges 2.5 and still pulls by one.
                Huber is outside its knee now and charges one times two and a
                half less one half, which is two, pulling by one, the cap the
                knee was bought for. The sigmoid of three is 0.9526, so binary
                cross-entropy charges only 0.0486 and pulls by 0.9526 minus
                one, which is −0.0474, nearly nothing left to say.
              </p>
            </>
          ),
        },
        {
          title: "Three Losses, One Gradient",
          content: (
            <>
              <p>
                Squared error with a plain output, binary cross-entropy with a
                sigmoid, and softmax cross-entropy with a softmax have the
                same gradient at the raw output, and it is the simplest
                expression on this page, the prediction minus the truth,
                divided by the number of rows. For squared error the
                prediction is the raw output itself. For the other two it is
                the probability the squash produced. Three different
                questions, three different cost formulas, one shared slope.
              </p>
              <Equation>{"d loss / d raw output  =  (prediction − truth) / n"}</Equation>
              <p>
                That is why the three dots coincided at zero. Squared error
                saw a raw output of zero against a truth of one half, and the
                cross-entropies saw a probability of one half against a truth
                of one, and both misses are minus one half. Drag the slider
                to three and they part, 2.5 against −0.047, because the
                prediction now means different things, a plain number that is
                two and a half too high and a probability that is nearly
                right. The form is shared. The numbers agree only where the
                two kinds of miss happen to match, and the worked example was
                built so that they would.
              </p>
              <p>
                The pairing is not a convention that hardened. Each squash is
                the one whose own derivative cancels the loss&rsquo;s, leaving
                the subtraction behind, and that is what a statistician calls
                a canonical link. Gauss found it for the normal distribution,
                and the sigmoid and the softmax are the same result for a yes
                or a no and for one of many. Practically it means the awkward
                derivative never has to be written. The softmax&rsquo;s own
                slope is a whole matrix, every output depending on every
                score, and it is exactly the term that cancels. The library
                checked all three against a finite difference and the largest
                disagreement was two parts in ten billion.
              </p>
              <p>
                Absolute error is on the page to break the pattern. Its slope
                is a sign divided by the row count, so every row pulls with
                the same force whatever its miss, and a single mistyped label
                cannot drag the fit the way it can under squared error, where
                a miss of a hundred pulls a hundred times harder than a miss
                of one. That is what robust means when a textbook says it,
                and the price is the kink at zero, where no slope exists and
                the library commits to zero. Huber pays a smaller price for
                most of the same protection, which is why it takes a
                parameter where the others take none.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The regression three are the calculus primer&rsquo;s move
                applied to a miss. Write e for the miss, prediction minus
                truth, and differentiate.
              </p>
              <Equation>{"d/dp [ e² / 2 ] = e\nd/dp [ |e| ]     = sign(e)\nd/dp [ huber ]   = e inside the knee,  d·sign(e) outside"}</Equation>
              <p>
                The Huber pieces meet because of the term that looks like
                decoration. At the knee, where the size of the miss is d, the
                inner piece gives d squared over two and the outer piece gives
                d times d less d over two, which is the same number, and the
                slopes are d on both sides. Drop the half and the cost jumps at
                the knee, leaving a step an optimiser will happily sit in.
              </p>
              <p>
                Binary cross-entropy is where the cancellation happens. With
                p the sigmoid of the raw output z and y the label, the cost is
                minus y times the log of p, minus one less y times the log of
                one less p. Differentiate with respect to p, then multiply by
                the sigmoid&rsquo;s own slope, which is p times one less p.
              </p>
              <Equation>{"d loss / dp  = −y/p + (1 − y)/(1 − p) = (p − y) / (p(1 − p))\ndp / dz      = p(1 − p)\nd loss / dz  = p − y"}</Equation>
              <p>
                The denominator the cost produced is exactly the factor the
                squash produced, and they cancel. The softmax case is the same
                cancellation with a matrix in place of the factor, and it
                leaves the same subtraction on the true class. Squared error
                needs no cancellation at all, since it has no squash. Three
                routes, one destination, and a network that starts its
                backward pass by subtracting the truth from what it said.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
