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
import { LossCurvesPlayground } from "@/components/widgets/LossCurvesPlayground";
import { LossOnALine } from "@/components/widgets/LossOnALine";
import { MislabelledRow } from "@/components/widgets/MislabelledRow";
import { SoftmaxRow } from "@/components/widgets/SoftmaxRow";
import { ThreeLossesOneBadRow } from "@/components/widgets/ThreeLossesOneBadRow";

export const metadata: Metadata = {
  title: "Loss Functions · oop_ml",
  description:
    "Choose a numerical cost for prediction errors and see how the choice changes learning.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function LossFunctionsPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["loss-functions"]}
      technicalStart="Part 2. Three Ways to Price a Miss in Kilograms"
      openingTitle="How Wrong Was That Prediction?"
      playgroundIntro="Move a prediction away from its target and compare the loss curves. Read the loss value and its slope separately, especially for large errors."
      title="Loss Functions"
      tagline="Choose a numerical cost for prediction errors and see how the choice changes learning."
      prerequisites={
        <>
          Squared error is the{" "}
          <Link href="/concepts/simple-linear-regression" className={link}>
            line page&rsquo;s
          </Link>{" "}
          loss and log-loss is the{" "}
          <Link href="/concepts/logistic-regression" className={link}>
            logistic page&rsquo;s
          </Link>
          , so both are old friends here. The slope of each comes from the{" "}
          <Link href="/primers/calculus" className={link}>
            calculus primer
          </Link>
          , and the layer that hands its raw output to the loss is the{" "}
          <Link href="/concepts/dense-layers" className={link}>
            dense layer
          </Link>
          .
        </>
      }

      playground={<LossCurvesPlayground />}
      sections={[
        {
          title: "Part 1. What a Loss Is For",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A guess, a truth, and a price">
                <p>
                  Take the four people the PCA page measured, 180, 160, 175 and
                  165 centimetres, weighing 78, 58, 63 and 73 kilograms, and
                  draw a line through their mean point with a slope of 0.6
                  kilograms per centimetre. The line guesses a weight for each
                  of them, 74, 62, 71 and 65, and each guess misses. The
                  question a loss answers is how much those four misses should
                  cost, as one number, so that a better line is one with a
                  smaller number and the search for it can begin.
                </p>
                <NumberTable
                  headings={["person", "guessed", "measured", "miss, guess less truth"]}
                  rows={[
                    ["180 cm", "74", "78", "−4"],
                    ["160 cm", "62", "58", "4"],
                    ["175 cm", "71", "63", "8"],
                    ["165 cm", "65", "73", "−8"],
                  ]}
                  caption="The measured four under the slope-0.6 line. Every batch number on this page is worked from these four misses."
                />
                <>
<p>
                  A miss on its own has a sign, and the sign is the wrong thing to add up, since minus four and four would cancel to nothing while both guesses were wrong. So every loss here first turns a miss into something that cannot be negative, and the five differ in how they do it.
                </p>
                <p>
                  Squaring, taking the size, squaring up close and taking the size far out, and for the two losses that price a probability rather than a weight, taking the negative logarithm of the probability the model gave to what was true.
                </p>
</>
                <KeepInMind>
                  A loss is a rule for pricing a miss, and the rule is a
                  choice made before the fitting starts. The measured four are
                  missed by the same four amounts under every rule on this page
                  and the prices come out 20, 6 and 17.75, and a fit that
                  lowers one of those numbers is not obliged to lower the
                  others.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. One number for the whole batch">
                <p>
                  A network is scored on many people at once, and the loss has
                  to say what the whole batch costs. Every loss on this page
                  does the same two things with the individual prices, adds
                  them up and divides by the number of rows. The division is
                  what keeps a batch of forty comparable with a batch of four,
                  since without it the loss would double whenever the batch
                  did, and so would the slope the network steps against.
                </p>
                <Equation>{"loss  =  ( price of miss 1 + price of miss 2 + … + price of miss n ) / n"}</Equation>
                <WorkedExample title="The four, and the four twice over">
                  <>
                    <p>
                      A mean loss stays the same when the entire batch is duplicated.
                      Here are the original four costs and the duplicated total.
                    </p>
                    <Equation>{"original mean = (8 + 8 + 32 + 32) / 4 = 80/4 = 20\nduplicated mean = (2 × 80) / 8 = 20"}</Equation>
                    <p>
                      Each duplicate receives half the original per-row gradient, but
                      there are twice as many contributions. Their sum, and therefore
                      the parameter gradient, is unchanged. Absolute error and Huber
                      preserve their respective means in the same way.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  The division is by rows, not by every number in the block. A
                  network answering two quantities per person is scored as twice
                  the cost of one answering one, which is what keeps the slope
                  free of the output width. Some libraries divide by the total
                  count instead, and some do not divide at all, which changes
                  what a learning rate means by a factor of the batch size.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The value and the slope are different things">
                <>
<p>
                  The box at the top of the page has one slider, the raw output of a network&rsquo;s last layer for one person, and it draws two charts. The upper one is what each loss charges at every raw output, and the lower one is the slope of that charge, which is the thing a network actually uses, because the slope says which way to move the output and how hard.
                </p>
                <p>
                  The value is the number we plot as a training curve and quote when a run is over, and the slope is the number the next step is taken from, so a loss that reported only its value would give a network nothing to do with it.
                </p>
</>
                <>
<p>
                  Both come back from one call, since computing either alone would mean running the squash twice, and the table under the charts checks that they agree with each other. The last column nudges the raw output by a hundred-thousandth either side, measures the cost at both, and divides the difference by the gap, which is the calculus primer&rsquo;s definition of a slope.
                </p>
                <p>
                  At the halfway guess the largest disagreement between the slope reported alongside the value and the slope found by nudging is 2.3 parts in a trillion, and across the whole slider it never passes 2.1 parts in ten billion.
                </p>
</>
                <InAModel title="Where the check is allowed to disagree">
                  <p>
                    Drag the raw output to the target, one half. Absolute error
                    has a corner there, no slope exists, and the slope reported
                    is zero; the nudge, straddling the corner symmetrically,
                    also finds zero to within 3 parts in a trillion. Drag it to
                    1.5, which is exactly the Huber knee. The two pieces of the
                    Huber loss meet at a value of 0.5 and a slope of 1, and the
                    nudge, straddling a point where the curvature changes,
                    disagrees by 2.5 parts in a million, a thousand times more
                    than anywhere else on the chart and still agreement to
                    five decimals.
                  </p>
                </InAModel>
                <KeepInMind>
                  The gradient is the slope of the value, checked here by
                  measurement rather than taken from the formula. Two losses
                  can agree on the value at a raw output and disagree on the
                  slope, and it is the slope that decides where the next step
                  goes.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Three Ways to Price a Miss in Kilograms",
          content: (
            <>
              <SubSection title="4. Squared error, the bowl">
                <p>
                  Square the miss, halve it, and that is the price. The half is
                  bookkeeping and nothing more; it is there so the slope comes
                  out as the miss itself rather than twice the miss, and a
                  library that leaves it out reports values twice as large and
                  gradients twice as steep, which the learning rate then has to
                  absorb. Writing p for the guess and y for the truth, the
                  price and its slope are these.
                </p>
                <Equation>{"price  =  (p − y)² / 2\nslope  =  p − y"}</Equation>
                <WorkedExample title="The four under squared error">
                  <>
                    <p>
                      The prediction errors are minus four, four, eight and minus eight
                      kilograms. Half-squared error magnifies the larger errors.
                    </p>
                    <Equation>{"individual costs = ½ × (16, 16, 64, 64) = (8, 8, 32, 32)\nmean loss = (8 + 8 + 32 + 32) / 4 = 20\noutput gradients = (−4, 4, 8, −8) / 4 = (−1, 1, 2, −2)\nlarge-error share of cost = 64 / 80 = 0.8"}</Equation>
                    <p>
                      The two larger misses account for eighty percent of the loss.
                      Their gradients are also twice as large in magnitude as those of
                      the smaller misses.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  That growth is the whole character of squared error. On the
                  playground the bowl steepens without limit, so a raw output
                  of 3 against a target of one half costs 3.125 and pulls by
                  2.5, and a raw output of −5 costs 15.125 and pulls by −5.5.
                  Nothing caps it, and section 17 is what that does when one of
                  the misses is not a miss at all.
                </p>
                <KeepInMind>
                  Squared error makes a miss of eight kilograms cost four times
                  a miss of four and pull twice as hard. That is the right
                  rule when the noise around each measurement is bell-shaped,
                  which is Gauss&rsquo;s 1809 argument, and it is the wrong
                  rule when some of the misses are not noise.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Absolute error, the vee">
                <p>
                  Take the size of the miss and stop. The price grows in a
                  straight line, and its slope is only ever plus one, minus one,
                  or nothing at all, because the size of a miss changes at the
                  same rate however large the miss already is.
                </p>
                <Equation>{"price  =  |p − y|\nslope  =  sign(p − y)"}</Equation>
                <WorkedExample title="The four under absolute error">
                  <>
                    <p>
                      Absolute error keeps each miss’s magnitude without squaring it.
                      Its derivative depends on the sign of the miss, not its size.
                    </p>
                    <Equation>{"mean absolute loss = (4 + 4 + 8 + 8) / 4 = 6\noutput gradients = (−1, 1, 1, −1) / 4\n                 = (−0.25, 0.25, 0.25, −0.25)"}</Equation>
                    <p>
                      The larger misses still contribute more to the loss. They no
                      longer produce larger output gradients.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  The corner at zero is the price of that. Where the guess
                  equals the truth no slope exists, and the slope reported there
                  is zero, which on the playground is the one point where
                  the amber dot on the gradient chart is neither at 1 nor at
                  −1. It also means the slope never shrinks as the guess gets
                  close, so a walk under absolute error keeps stepping at full
                  size right up to the answer and then past it, which section
                  19 measures.
                </p>
                <KeepInMind>
                  Under absolute error every person pulls with the same force
                  whatever their miss. The fit that minimises it runs through
                  the median of the misses rather than their mean, which is why
                  it shrugs off a wild reading and also why it is the wrong loss
                  if the mean is what you wanted.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Huber, the bowl with a knee">
                <p>
                  Huber takes a threshold, written d here, and is squared error
                  inside it and absolute error outside it, with the outer piece
                  shifted so the two meet without a jump. Small misses are
                  corrected smoothly and the corner at zero is gone, while a
                  miss beyond the knee pulls by exactly d and no more.
                </p>
                <Equation>{"|p − y| ≤ d      price  =  (p − y)² / 2          slope  =  p − y\n|p − y| > d      price  =  d · (|p − y| − d/2)    slope  =  d · sign(p − y)"}</Equation>
                <WorkedExample title="The four under Huber with a knee of 5 kilograms">
                  <>
                    <p>
                      With Huber threshold five, the four-kilogram misses use the
                      quadratic branch. The eight-kilogram misses use the linear branch.
                    </p>
                    <Equation>{"cost at magnitude 4 = ½ × 4² = 8\ncost at magnitude 8 = 5 × (8 − 5/2) = 27.5\nmean loss = (8 + 8 + 27.5 + 27.5) / 4 = 17.75\noutput gradients = (−4, 4, 5, −5) / 4\n                 = (−1, 1, 1.25, −1.25)"}</Equation>
                    <p>
                      Large misses can still produce larger gradients here, but the
                      threshold caps that growth.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  The d/2 in the outer piece looks like decoration and is not.
                  At a miss of exactly d the inner piece gives d squared over
                  two and the outer gives d times d less d over two, the same
                  number, and the slopes are d on both sides. Drop the d/2 and
                  the price jumps at the knee, which leaves a step an optimiser
                  can stop in. On the playground the knee is at 1 and the
                  worked check in section 3 lands on it.
                </p>
                <InAModel title="The knee is in kilograms">
                  <>
<p>
                    The threshold is a distance in the target&rsquo;s own units, so a knee of 1 means something different on weights in kilograms from what it means on the playground&rsquo;s targets near one half. Set the knee to 1 kilogram on the four and none of them is inside it, the batch costs 5.5, and every pull is a quarter in size, which is absolute error wearing a different name.
                  </p>
                  <p>
                    A knee has to be chosen against the size of the misses it will meet, and the Huber regression on its own page estimates a scale from the residuals and measures its knee in multiples of that; the network loss here takes a fixed number and leaves the choice to you.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  Huber is squared error for the people the line nearly gets
                  right and absolute error for the people it does not, with the
                  threshold saying where one becomes the other, in the
                  target&rsquo;s units.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Where one person's miss goes">
                <p>
                  The three rules are easiest to compare on one batch at once.
                  The widget below draws a line of your choosing through the
                  people, scores every miss under all three losses, and shows
                  each person&rsquo;s own cost as a bar and their share of the
                  batch&rsquo;s pull in the table. Start with the measured four
                  and the slope-0.6 line, then tilt the line and watch which
                  bars grow fastest.
                </p>
                <LossOnALine />
                <p>
                  On the four, the two eight-kilogram misses carry 80 percent of
                  the cost under squared error, 67 percent under absolute
                  error and 77 percent under Huber, and their share of the pull
                  is 67, 50 and 56 percent. Squared error is the only one of
                  the three whose pull share keeps growing with the miss, and
                  the bars make the difference visible before any of the
                  arithmetic is read.
                </p>
                <WorkedExample title="Where the six percentages come from">
                  <>
                    <p>
                      A share of the cost is one person&rsquo;s price over the
                      sum of the four prices. The prices are the ones sections 4
                      to 6 worked, (8, 8, 32, 32) under squared error, (4, 4, 8, 8)
                      under absolute error and (8, 8, 27.5, 27.5) under Huber with
                      a knee of 5 kilograms. Add the two eight-kilogram
                      people&rsquo;s prices and divide by the total.
                    </p>
                    <Equation>{"squared error    (32 + 32) / 80        = 0.80\nabsolute error   (8 + 8) / 24          ≈ 0.67\nHuber, knee 5    (27.5 + 27.5) / 71    ≈ 0.77"}</Equation>
                    <p>
                      A share of the pull is built the same way from the
                      gradients, with their signs dropped first. Two people
                      pulling the line in opposite directions are both still
                      pulling, so it is the sizes that are added. The gradients
                      are (−1, 1, 2, −2), (−0.25, 0.25, 0.25, −0.25) and
                      (−1, 1, 1.25, −1.25).
                    </p>
                    <Equation>{"squared error    (2 + 2) / (1 + 1 + 2 + 2)              ≈ 0.67\nabsolute error   (0.25 + 0.25) / (4 × 0.25)             = 0.50\nHuber, knee 5    (1.25 + 1.25) / (1 + 1 + 1.25 + 1.25)  ≈ 0.56"}</Equation>
                    <p>
                      Half the people hold half the pull under absolute error
                      because every gradient is the same size. Under squared
                      error the same two hold two thirds of it, and Huber&rsquo;s
                      knee sits between the two.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  The cost measures how badly the line misses the batch and
                  the pull measures who moves it next. Under squared error both
                  belong mostly to the same two people, and under absolute
                  error the cost still does while the pull is spread a quarter
                  each.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Two Ways to Price a Wrong Probability",
          content: (
            <>
              <SubSection title="8. A score is not a probability until it is squashed">
                <p>
                  When the question is whether someone is an adult rather than
                  how much they weigh, the last layer still hands over a plain
                  number, a score that can be anything from far below zero to
                  far above it, and a score cannot be compared to a yes or a
                  no. The logistic page&rsquo;s answer was to push the score
                  through the sigmoid, which turns any number into a
                  probability between zero and one, and that squash is the first
                  thing both classification losses do, so the last layer stays
                  straight and the activation function happens inside the loss, for a reason
                  section 14 measures.
                </p>
                <Equation>{"p  =  σ(z)  =  1 / (1 + e^(−z))"}</Equation>
                <p>
                  On the playground the raw output of zero squashes to exactly
                  one half, which is the network saying it cannot tell, and
                  that is why the page&rsquo;s halfway guess is a raw output of
                  zero rather than a probability of zero. A raw output of 3
                  squashes to 0.9526 and of −3 to 0.0474.
                </p>
                <KeepInMind>
                  The two classification losses read the raw output as a score
                  to squash, and the three regression losses read it as the
                  prediction itself. The playground&rsquo;s table says which is
                  which beside every row.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Binary cross-entropy, the price of a probability">
                <p>
                  Once the score is a probability of yes, the price is the
                  negative logarithm of the probability the model gave to
                  whichever answer was actually true. A model that gave the
                  truth a probability of one pays nothing, one that gave it a
                  half pays the logarithm of two, and one that gave it almost
                  nothing pays without limit. Writing y for the label, one for
                  yes and zero for no, the two cases fold into one line.
                </p>
                <Equation>{"price  =  −y · log(p) − (1 − y) · log(1 − p)\nslope at the raw output  =  p − y"}</Equation>
                <WorkedExample title="The halfway guess, then a confident one">
                  <>
                    <p>
                      For a positive label, a raw score of zero gives a probability of
                      one half. Binary cross-entropy and its derivative with respect to
                      that score are:
                    </p>
                    <Equation>{"probability = sigmoid(0) = 0.5\nloss = −ln(0.5) ≈ 0.6931\nscore gradient = 0.5 − 1 = −0.5"}</Equation>
                    <p>
                      A score of three raises the correct-label probability to about
                      0.9526 and reduces the loss to about 0.0486. Negative scores
                      favour the wrong class: at minus three the loss is about 3.0486,
                      and at minus five it is about 5.0067.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  Two shapes are worth noticing on the playground. On the side
                  where the squash agrees with the label the curve is flat and
                  cheap, and on the side where it does not the curve rises like
                  a straight line of slope one, since the logarithm of a
                  sigmoid far out is the raw output itself. And the pull never
                  exceeds one in size however wrong the model is, because a
                  probability minus a label cannot.
                </p>
                <KeepInMind>
                  Cross-entropy prices a probability, and its slope at the raw
                  output is the probability minus the label. A confidently
                  wrong answer costs the raw output, roughly, and pulls by
                  nearly one; a confidently right one costs almost nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The value has a ceiling and the gradient does not">
                <p>
                  A sigmoid pushed far enough saturates to exactly zero or
                  exactly one in double precision, and the logarithm of exactly
                  zero is minus infinity, which would poison the average for a
                  row that was merely very wrong. So the probability is clipped
                  away from both ends before the logarithm is taken, by one
                  machine epsilon, and the price stops growing at the
                  negative logarithm of that, which is 36.0437.
                </p>
                <p>
                  Machine epsilon is the gap between one and the next number
                  double precision can represent. A probability clipped to
                  sit at least that far from zero and from one always has a
                  finite logarithm, and the largest price the clip allows is
                  the logarithm of that gap with its sign changed.
                </p>
                <Equation>{"machine epsilon   ε ≈ 2.22 × 10⁻¹⁶\nceiling           −ln(ε) ≈ 36.0437"}</Equation>
                <InAModel title="Measured on one row">
                  <p>
                    A score of 30 with the label no costs 30.0010 and pulls by
                    1.0 to thirteen decimals. A score of 40 costs 36.0437, the
                    ceiling, and pulls by exactly 1.0. The gradient is a
                    subtraction of two finite numbers and needs no clipping, so
                    it is exact where the value is capped, and a network keeps
                    being pushed the right way past the point where its
                    reported loss has stopped rising.
                  </p>
                </InAModel>
                <KeepInMind>
                  Past a score of about 36 the value reported by binary
                  cross-entropy is a floor of the arithmetic rather than a
                  fact about the miss, and the gradient is not. A training
                  curve that flattens at 36 per confidently wrong row is the
                  clip, not convergence.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Softmax cross-entropy, one of many">
                <>
<p>
                  With three classes, child, teenager and adult, the last layer hands over three scores per person, and the squash has to read across the row rather than down a column. The softmax raises e to each score and divides by the sum, so the three come out positive and summing to one, and the price is again the negative logarithm of the probability on the true class.
                </p>
                <p>
                  The slope at every score is the probability of that class minus the truth for that class, which is one on the true class and zero on the rest.
                </p>
</>
                <Equation>{"pₖ  =  e^(zₖ) / Σⱼ e^(zⱼ)\nprice  =  −log(p on the true class)\nslope at zₖ  =  pₖ − yₖ"}</Equation>
                <SoftmaxRow />
                <WorkedExample title="Scores of 1, 2 and 3 with adult true">
                  <p>
                    The probabilities are 0.0900, 0.2447 and 0.6652, the price
                    is the negative logarithm of 0.6652, which is 0.4076, and
                    the pulls are 0.0900, 0.2447 and −0.3348. The true class is
                    pushed up by one less its probability and each wrong class
                    is pushed down by its own probability, so the three pulls
                    sum to zero, which the readout reports as −1.1 parts in ten
                    quadrillion. Switch the true class to child and the price
                    becomes 2.4076, the negative logarithm of 0.0900, with the
                    child score pulled up by 0.9100.
                  </p>
                </WorkedExample>
                <p>
                  Tick the box that adds a hundred to every score and nothing
                  changes, the same probabilities, the same price, the same
                  pulls to the last digit. The softmax only ever reads the
                  differences between the scores, which is why the row maximum
                  is subtracted before e is raised to anything;
                  written literally, e to the hundred-and-three overflows
                  nothing but e to a thousand does.
                </p>
                <KeepInMind>
                  Softmax cross-entropy pushes the true class&rsquo;s score up
                  and every other class&rsquo;s score down by its own
                  probability, and the pulls on a row always sum to zero. Only
                  the gaps between scores matter, never their level.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The two-class softmax is the sigmoid">
                <>
<p>
                  On the playground the rose and sky curves lie on top of one another, which is why the sky one is dashed. That is an identity rather than a drawing choice. With two classes, and the second class&rsquo;s score held at zero, the softmax probability of the first class is e to the score over e to the score plus one, which is the sigmoid of the score.
                </p>
                <p>
                  The page&rsquo;s softmax reading is built exactly that way, the raw output in the first column and a zero in the second, and the two losses agree on the value, the gradient and the probability at every raw output on the slider.
                </p>
</>
                <Equation>{"e^z / (e^z + e^0)  =  1 / (1 + e^(−z))  =  σ(z)"}</Equation>
                <InAModel title="Where they part, and why it does not matter">
                  <p>
                    They part only where the value is clipped, because the two
                    losses clip at different floors. Binary cross-entropy caps
                    at 36.0437, as section 10 measured. The softmax loss floors
                    its probabilities at the smallest positive double instead,
                    so at scores of 40 and 0 with the second class true it
                    reports 40.0 where the sigmoid reports 36.0437. The
                    gradients agree exactly at both, 1 and −1 against 1, and
                    training never reads the value.
                  </p>
                </InAModel>
                <KeepInMind>
                  A yes-or-no question can be asked with one sigmoid output or
                  with two softmax outputs, and the answers, prices and pulls
                  are the same until the value is clipped.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "Every loss on the page adds the individual prices and divides by the number of rows. What does the division buy?",
              [
                "It keeps a batch of forty comparable with a batch of four, since otherwise the loss and the slope would double whenever the batch did",
                "It keeps the loss between zero and one, so runs on different data can be compared",
                "It removes the sign from each miss, which is what makes the prices add up",
                "It makes the loss independent of how many quantities the network answers per person",
              ],
              0,
              "The mean of a batch is unchanged when the batch is duplicated, which is the point. The four cost (8 + 8 + 32 + 32) / 4 = 20 under squared error, and the four twice over cost 160 / 8 = 20. The division is by rows and not by every number in the block, so a network answering two quantities per person is scored as twice the cost of one answering one.",
            ),
            trueFalse(
              "A library that leaves the half out of squared error reports values twice as large and gradients twice as steep.",
              true,
              "The half is bookkeeping, there so the slope comes out as the miss itself rather than twice the miss. Leaving it out changes both the number reported and the step taken from it, and the learning rate then has to absorb the factor of two. That is one of the conventions a loss curve does not show.",
            ),
            several(
              "The slope-0.6 line misses the measured four by four, four, eight and eight kilograms. Which of these hold of the pulls?",
              [
                "Under squared error the eight-kilogram misses pull twice as hard as the four-kilogram ones",
                "Under absolute error all four pull by a quarter, whatever their miss",
                "Under Huber with a knee of 5 kilograms the eight-kilogram misses pull by 1.25, which is the knee over the row count",
                "With the knee set to 1 kilogram none of the four is inside it, and every pull is a quarter",
              ],
              [0, 1, 2, 3],
              "All four hold. The gradients are (−1, 1, 2, −2) under squared error, a quarter in size everywhere under absolute error, and (−1, 1, 1.25, −1.25) under Huber at a knee of 5, where the two large misses are capped at 5 / 4. A knee of 1 kilogram is smaller than every miss, so the batch costs 5.5 and Huber is absolute error wearing a different name, which is why a knee has to be chosen against the size of the misses it will meet.",
            ),
            trueFalse(
              "Once binary cross-entropy’s value has hit its ceiling of 36.0437, a confidently wrong row has stopped being pushed.",
              false,
              "The value is clipped and the gradient is not. The gradient is a subtraction of two finite numbers, so it is exact where the value is capped, and a score of 40 with the label no pulls by exactly 1.0 while reporting the ceiling. A training curve that flattens at 36 per confidently wrong row is the clip rather than convergence.",
            ),
            several(
              "Which of these hold of softmax cross-entropy as the page measures it?",
              [
                "Adding a hundred to every score leaves the probabilities, the price and the pulls unchanged to the last digit",
                "The pulls on one row sum to zero",
                "With two classes and the second score held at zero it is the sigmoid loss exactly",
                "It caps its price at the same 36.0437 as binary cross-entropy",
              ],
              [0, 1, 2],
              "The softmax only ever reads the gaps between scores, never their level, which is why the row maximum is subtracted before anything is exponentiated. The true class is pushed up by one less its probability and each wrong class pushed down by its own, so the pulls cancel. The two losses agree on value, gradient and probability everywhere except the clip, where the softmax floors at the smallest positive double and reports 40.0 against the sigmoid’s 36.0437.",
            ),
        ],
        },
        {
          title: "Part 4. The Slope Every Network Starts From",
          content: (
            <>
              <SubSection title="13. Three losses, one subtraction">
                <p>
                  Now look at the gradient chart with the slider at the halfway
                  guess. Four of the five dots are at exactly the same value,
                  −0.5. One of the four is Huber, which sits there only because
                  a miss of one half is inside its knee of 1, where it is
                  squared error under another name. The other three are the
                  fact the page exists to teach. Squared
                  error with a plain output, binary cross-entropy with a
                  sigmoid, and softmax cross-entropy with a softmax all have the
                  same slope at the raw output, the prediction minus the truth
                  over the row count, and it is the simplest expression on the
                  page.
                </p>
                <Equation>{"d loss / d raw output  =  (prediction − truth) / n"}</Equation>
                <>
<p>
                  For squared error the prediction is the raw output itself, zero against a target of one half. For the other two it is the probability the squash produced, one half against a label of one. Both misses are minus one half, and the halfway guess was built so that they would be. Drag the slider to 3 and the dots part, 2.5 against −0.0474, because the prediction now means different things, a number that is two and a half too high and a probability that is nearly right.
                </p>
                <p>
                  What the three share is the form, and the numbers agree only at a raw output where a miss in weight and a miss in probability happen to be the same size.
                </p>
</>
                <KeepInMind>
                  Under its own squash each of the three canonical losses hands
                  the network prediction minus truth, and a backward pass
                  begins with a subtraction whatever the question was.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Why the squash belongs to the loss">
                <p>
                  Tick the playground&rsquo;s last box and a grey dashed curve
                  appears, a sigmoid output scored by squared error, which is
                  the pairing a reader might reach for first, since it is a
                  probability compared to a label by the loss that has been on
                  every page. It is computed here through a one-neuron
                  layer that applies the sigmoid, so the number is measured
                  rather than argued. At the halfway guess it costs 0.125 and
                  pulls by −0.125, a quarter of what cross-entropy pulls.
                </p>
                <InAModel title="Confidently wrong under the wrong pairing">
                  <p>
                    Drag the slider to −5 with the label yes. The probability
                    is 0.0067, the model is as wrong as the slider allows, and
                    cross-entropy pulls by −0.9933. The sigmoid scored by
                    squared error pulls by −0.0066, a hundred and fifty times
                    less, because its slope carries the sigmoid&rsquo;s own
                    slope as a factor, which is p times one less p and is
                    nearly zero exactly where the model is most wrong, so the
                    pairing pulls least on the rows where the model most needs
                    pulling, and a network trained under it can spend a long
                    time being confidently wrong about the same people.
                  </p>
                </InAModel>
                <>
                  <p>
                    The binary and multiclass cross-entropy implementations used on this
                    site expect raw scores, also called logits. They apply sigmoid or
                    softmax internally, so the preceding output layer uses identity.
                  </p>
                  <p>
                    Other APIs accept probabilities instead. A probability-based loss
                    must receive the appropriate normalized probabilities. Check the
                    loss interface: adding sigmoid before a loss that already expects
                    logits applies it twice and changes the model being optimized.
                  </p>
                </>
                <KeepInMind>
                  <p>
                    Match the output layer to the loss interface. The cross-entropy
                    losses in this SDK take logits, so pass raw scores. A loss
                    documented to take probabilities has a different contract. Squared
                    error with a sigmoid output is another valid objective, but its
                    gradient can become very small for confidently wrong predictions.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The canonical link">
                <p>
                  The coincidence has a mechanism. Each squash is the one whose
                  own derivative cancels the loss&rsquo;s, leaving the
                  subtraction behind, and that is what Nelder and Wedderburn
                  called a canonical link. Binary cross-entropy is where the
                  cancellation is easiest to watch. With p the sigmoid of the
                  raw output z and y the label, differentiate the price with
                  respect to p, then multiply by the sigmoid&rsquo;s own slope.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="what happened"
                  rows={[
                    { expression: "d price / dp  =  −y/p + (1 − y)/(1 − p)", reason: "differentiate the two logarithms with respect to the probability" },
                    { expression: "              =  (p − y) / (p (1 − p))", reason: "put the two fractions over one denominator" },
                    { expression: "dp / dz  =  p (1 − p)", reason: "the sigmoid's own slope, the logistic page's result" },
                    { expression: "d price / dz  =  (p − y) / (p (1 − p)) · p (1 − p)  =  p − y", reason: "the chain rule; the denominator the price produced is the factor the squash produced, and they cancel" },
                  ]}
                />
                <WhyThisWorks title="The softmax case, and the regression case">
                  <>
<p>
                    The softmax&rsquo;s own slope is a whole matrix, every output depending on every score, and it is exactly the term that cancels, leaving the probability minus the one-hot truth on every class at once, which is the row of pulls in section 11. Squared error needs no cancellation at all, since it has no squash and its price is already a quadratic in the raw output.
                  </p>
                  <p>
                    Gauss reached the regression case for the bell curve, and the sigmoid and the softmax are the same result for a yes-or-no and for one-of-many. In every case the loss is the negative logarithm of a likelihood and the squash is that likelihood&rsquo;s natural parameter unwound, which is why the pairing is not a convention that hardened.
                  </p>
</>
                </WhyThisWorks>
                <p>
                  Absolute error and Huber are on the page to break the
                  pattern on purpose. Their slopes are a sign and a capped miss,
                  neither of them prediction minus truth, and that difference
                  is the whole reason to use them, which Part 5 measures.
                </p>
                <KeepInMind>
                  Every canonical pairing hands back prediction minus truth
                  because the squash was chosen so that its own derivative
                  cancels the loss&rsquo;s, and the two robust losses hand back
                  something else because they were chosen to cap the pull
                  instead.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Which loss goes with which last layer">
                <p>
                  The pairing follows from the question, so it can be written
                  as a table, with the last layer straight in every row and the
                  activation function, where there is one, inside the loss.
                </p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="the loss, and what the loss applies first"
                  rows={[
                    { expression: "how much does this person weigh", reason: "squared error on the raw output, no squash; or absolute error or Huber when some weights cannot be trusted." },
                    { expression: "is this person an adult", reason: "binary cross-entropy, which applies the sigmoid; one output, a label of zero or one." },
                    { expression: "child, teenager or adult", reason: "softmax cross-entropy, which applies the softmax across the row; one output per class, a one-hot truth." },
                    { expression: "a sigmoid probability scored with squared error", reason: "the pairing section 14 measured; it trains, and it stops pulling where it is most wrong." },
                  ]}
                />
                <KeepInMind>
                  The last layer answers with raw scores and the loss decides
                  what they mean, so the loss is chosen by the question being
                  asked and the squash comes with it rather than being added to
                  the layer.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What a Loss Does to an Outlier",
          content: (
            <>
              <SubSection title="17. One mistyped weight">
                <p>
                  Take the fifteen people of the line page&rsquo;s ideal case,
                  who lie close to one line, and suppose the ninth of them, 176
                  centimetres and 72.5 kilograms, was entered with the digits
                  swapped as 27.5. Nothing about the person changed, and one
                  number in the table did. Score all sixteen under the line
                  that fits the clean fifteen, slope 0.7968 and intercept
                  −67.44, and the mistyped row misses by 45.29 kilograms where
                  nobody else misses by more than a kilogram or so.
                </p>
                <NumberTable
                  headings={["loss", "value over 16 rows", "the mistyped row's share of the cost", "its share of the pull"]}
                  rows={[
                    ["squared error", "64.18", "0.9987", "0.892"],
                    ["absolute error", "3.17", "0.892", "0.0625, which is one sixteenth"],
                    ["Huber, knee 5 kg", "13.46", "0.994", "0.478"],
                  ]}
                  caption="The ideal fifteen and the mistyped person, scored under the clean least squares line, with a knee of five kilograms."
                />
                <>
                  <p>
                    Under squared error, the corrupted row accounts for 99.87 percent of
                    the loss and 89 percent of the summed gradient magnitudes. Under
                    absolute error, it receives the same output-gradient magnitude as
                    every other row. Huber caps it at the threshold divided by the batch
                    size.
                  </p>
                  <Equation>{"absolute-error gradient magnitude = 1/16 = 0.0625\nHuber maximum gradient magnitude = 5/16 = 0.3125"}</Equation>
                  <p>
                    These are gradients with respect to individual predictions.
                    Parameter gradients also include the inputs through which those
                    predictions were made.
                  </p>
                </>
                <KeepInMind>
                  None of the three rules can tell a mistyped weight from a
                  real one, since all any of them sees is a miss of 45. What
                  the rule fixes is how much say that miss gets, and on the
                  same row the three give it 89, 6 and 48 percent of the pull.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Three losses, three lines">
                <p>
                  Now let each loss fit its own line. The widget walks one
                  linear neuron down each loss for four hundred steps from a
                  flat line at the mean weight, on the same people, and draws
                  the three lines it arrives at. Tick the switch to swap in the
                  mistyped weight and watch which lines move.
                </p>
                <ThreeLossesOneBadRow />
                <p>
                  On the clean fifteen all three lines nearly coincide. Squared
                  error lands on the closed-form least squares line to within
                  1.1 parts in ten trillion, Huber lands on the same line
                  because every miss is inside its knee, and absolute error
                  settles a little away, slope 0.7993 against 0.7968, since the
                  median line and the mean line are not quite the same line.
                  Each guesses about 72.79 kilograms for the person at 176
                  centimetres.
                </p>
                <>
<p>
                  With the weight mistyped, the squared-error line drops to a slope of 0.7464 and an intercept of −61.55 and now guesses 69.82 kilograms at 176 centimetres, three kilograms lower than before, for a person who has not changed. The Huber line moves to 0.7908 and −66.75, guessing 72.44, a third of a kilogram lower. The absolute error line moves to 0.7983 and −67.72, guessing 72.78, one hundredth of a kilogram lower.
                </p>
                <p>
                  The mistyped row is missed by 42.3, 44.9 and 45.3 kilograms by the three lines in turn, so the two robust rules leave it almost exactly as wrong as it was and squared error closes three kilograms of the gap at everyone else&rsquo;s expense.
                </p>
</>
                <KeepInMind>
                  One digit swap moved the squared-error guess for everyone
                  near 176 centimetres by three kilograms and the absolute
                  error guess by a hundredth of one. If the 27.5 had been a
                  real weight the squared-error line would have been right to
                  move, and no loss can tell from the number whether it was.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Robust is a statement about the pull">
                <p>
                  What the word robust means, when a textbook says it, is that
                  no single row can pull harder than a fixed amount. Absolute
                  error caps the pull at one over the row count and Huber at
                  the knee over the row count, and squared error caps it
                  nowhere. The cost is not what is capped; the mistyped row is
                  most of the cost under all three rules, and it is only under
                  the two robust ones that being most of the cost does not
                  make it most of the say.
                </p>
                <>
<p>
                  The same cap has a price at the other end of the walk. The readouts show the largest slope left in the neuron after the last step, and for squared error and Huber it is 8 parts in a quadrillion, which is a walk that has stopped. For absolute error it is 0.0926 on the clean fifteen and 0.125 with the outlier, because a sign never shrinks as the guess gets close, so the walk keeps stepping by the full learning rate and settles into a twitch about the answer rather than onto it.
                </p>
                <p>
                  The clean absolute-error loss is 0.3609 after four hundred steps and still moving in the third decimal.
                </p>
</>
                <KeepInMind>
                  A capped pull is what makes a loss robust, and a pull that
                  never shrinks is what stops absolute error settling. Huber
                  caps the pull at the knee and lets it shrink to zero inside
                  the knee, which is why its walk stopped at 8 parts in a
                  quadrillion on the same people where absolute error was still
                  stepping by 0.125.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. A mislabelled adult">
                <>
                  <p>
                    Cross-entropy can also be sensitive to incorrect labels. Take
                    sixteen people: eight children below 152 centimetres and eight
                    adults above it. A fixed rule assigns a score from height, then a
                    sigmoid probability.
                  </p>
                  <Equation>{"score = (height − 152) / 5\nP(adult) = sigmoid(score)"}</Equation>
                  <p>
                    The rule classifies all sixteen correctly and has mean loss about
                    0.0854. The two people nearest the boundary, at 148 and 156
                    centimetres, each cost about 0.3711. Now change the 178-centimetre
                    adult’s label to child.
                  </p>
                </>
                <MislabelledRow />
                <>
                  <p>
                    The model still assigns that person about 0.9945 probability of
                    adulthood, but the changed label now penalizes that confidence.
                    Calculate the loss using the full score rather than rounded
                    probabilities.
                  </p>
                  <Equation>{"score = (178 − 152) / 5 = 5.2\nincorrect-label loss = −ln(1 − sigmoid(5.2)) ≈ 5.2055\nscore gradient contribution = sigmoid(5.2) / 16 ≈ 0.0622\naccuracy = 15 / 16 = 0.9375"}</Equation>
                  <p>
                    The mean loss rises to about 0.4104, with this row contributing
                    seventy-nine percent of the total. Accuracy records one wrong label;
                    cross-entropy additionally measures how confidently the model
                    disagrees with it.
                  </p>
                </>
                <KeepInMind>
                  Cross-entropy charges without limit for a confident answer
                  the label contradicts, and the pull on a mislabelled row is
                  nearly one, the largest any row can have. Nothing in the loss
                  caps it, and a mislabelled crowd trains towards its labels.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where Each Loss Fails",
          content: (
            <>
              <SubSection title="21. The loss is not the score">
                <>
<p>
                  A classifier is judged by how many people it called correctly, and it is trained by the loss, and the two can disagree. Change the scale of the rule in the widget above from 5 to 2.5 and then to 10. The accuracy is 1.0 at all three, since the probabilities cross one half at the same height whatever the scale, and the loss is 0.0290, 0.0854 and 0.1910, a factor of six apart.
                </p>
                <p>
                  The loss rewards confidence on people already called correctly, which accuracy cannot see, and the training page&rsquo;s run has stretches where the loss falls for fifty epochs while the accuracy does not move at all.
                </p>
</>
                <KeepInMind>
                  Accuracy counts which side of one half each answer landed on
                  and has no slope, so descent cannot follow it, which is the
                  reason a network is trained on the loss and judged on the
                  score. On the sixteen people the score was 1.0 at every scale
                  and the loss varied six-fold, so the two have to be reported
                  separately.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Where each of the five fails">
                <p>
                  Every loss on this page fails somewhere, and the failures are
                  measured above rather than listed from memory.
                </p>
                <DerivationTable
                  expressionHeading="the loss"
                  reasonHeading="where it fails"
                  rows={[
                    { expression: "squared error", reason: "one mistyped weight took 89 percent of the pull and moved the line three kilograms; it is the maximum-likelihood rule for bell-shaped noise and the wrong rule when the misses include mistakes." },
                    { expression: "absolute error", reason: "no slope at zero, no curvature anywhere, so descent twitches by 0.125 at the answer instead of settling; and it fits the median, which is not the mean when the misses are skewed." },
                    { expression: "Huber", reason: "a knee in the wrong units is one of the other two in disguise: at 1 kilogram on the four it was absolute error, and at 50 it would be squared error. The knee has to be chosen against the misses." },
                    { expression: "binary cross-entropy", reason: "a mislabelled row costs 5.2 and pulls by nearly one, with no cap; the value saturates at 36.04 while the gradient does not; and this SDK expects logits, so an additional sigmoid before the loss changes the objective." },
                    { expression: "softmax cross-entropy", reason: "needs the class width stated to build the one-hot truth, and a class index beyond that width or below zero has no meaning; with one class the price is always zero and nothing is learned." },
                  ]}
                />
                <KeepInMind>
                  Squared error moved three kilograms for one mistyped weight
                  and absolute error would not stop stepping for a clean one,
                  and cross-entropy charged 5.2 for one wrong label. Each of
                  those is the loss doing what its formula says, so choosing
                  one is a claim about what the misses in the data are, and it
                  is worth making that claim out loud before the fit.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="23. What a loss must specify">
                <p>
                  A complete implementation states what it divides by, the
                  rows or every entry or nothing; whether squared error carries
                  the half; the units the Huber knee is measured in and what
                  happens exactly at the knee; which branch absolute error
                  takes at a tie; whether the classification losses apply
                  their own squash, so that a caller knows to leave the last
                  layer straight; how the probabilities are clipped before the
                  logarithm and at what floor; what shape the truth takes, a
                  column of zeros and ones or a one-hot block; and that the
                  value and the gradient are produced by one call, so a caller
                  cannot get one without the other.
                </p>
                <KeepInMind>
                  Most of those decisions are invisible in a loss curve, and a
                  learning rate tuned under one convention is wrong under
                  another by exactly the factor the convention hides.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The edges, probed">
                <p>
                  Each row below was tried rather than reasoned about, and the
                  page&rsquo;s own request refuses at the door the cases the
                  arithmetic lets through.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "an empty batch", reason: "the documented contract promises a refusal, and the arithmetic divides by zero rows and answers not-a-number with a warning; recorded rather than repaired, and the request refuses it at the door before the batch is ever measured." },
                    { expression: "one row", reason: "accepted; the division is by one and the batch value is the row's own price, 32 for a miss of eight under squared error." },
                    { expression: "outputs and truths of different shapes", reason: "refused by name, since the two blocks describe the same rows." },
                    { expression: "a not-a-number in the outputs", reason: "passes through; the value and the gradient are not-a-number and nothing is raised. The layers check finiteness on the way in; the losses do not." },
                    { expression: "an infinite output", reason: "squared error answers infinity; cross-entropy saturates to its 36.04 ceiling with a gradient of exactly one, since the stable sigmoid handles the overflow." },
                    { expression: "a Huber knee of zero, negative, or not finite", reason: "refused at construction; at zero it is absolute error with an extra branch and below zero it is nothing at all." },
                    { expression: "absolute error at an exact tie", reason: "accepted, gradient zero; no slope exists and the branch taken is the one that pulls nowhere." },
                    { expression: "Huber exactly at the knee", reason: "both pieces answer a price of 0.5 at a knee of one and a slope of one, to the last bit on one side and to one part in a trillion on the other." },
                    { expression: "a label of one half", reason: "accepted, and read as a soft label; at the halfway guess it costs the logarithm of two and pulls nowhere. The request refuses anything but zero and one." },
                    { expression: "a label of two", reason: "accepted, and nonsense, a pull of minus 1.5 at the halfway guess; the request refuses it." },
                    { expression: "a class index beyond the row", reason: "the one-hot builder raises a bare index error, written for an interpreter rather than for a reader; the request refuses it with the width named." },
                    { expression: "a negative class index", reason: "wraps silently to the last column, since that is what a negative index does to a numpy block; the request refuses it." },
                    { expression: "a softmax row of one class", reason: "accepted; the probability is always one, the price always zero, and nothing is learned." },
                    { expression: "every height the same, in the descent", reason: "refused by the line fit before the standardising could divide by a spread of zero, because a column carrying no variation has nothing to divide by." },
                    { expression: "unfitted use, or mismatched feature names", reason: "not applicable; a loss holds no fitted state and reads no names, only two blocks of the same shape." },
                  ]}
                />
                <p>
                  The empty batch is the one worth dwelling on, because it is
                  the case where the documented contract and the actual
                  behaviour disagree. The contract says an empty block is
                  refused, and the arithmetic divides a sum of nothing by zero
                  rows, which numpy answers with not-a-number and a warning
                  rather than an exception. It is documented here rather than
                  defended, the request refuses the case at the door, and
                  nothing behind this page was changed to serve it.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 7",
          quiz: [
            choice(
              "With the slider at the halfway guess, squared error, binary cross-entropy and softmax cross-entropy all report a slope of −0.5. What do the three share?",
              [
                "Each hands back the prediction minus the truth over the row count, where the prediction is the raw output for squared error and the squashed probability for the other two",
                "They report the same slope at every raw output, since they are one loss written three ways",
                "Each applies the sigmoid to the raw output before comparing it with the truth",
                "Each caps its pull at one half, however large the miss",
              ],
              0,
              "Each squash is the one whose own derivative cancels the loss’s and leaves the subtraction behind, which is the canonical link. The numbers agree at the halfway guess because a raw output of zero against a target of one half and a probability of one half against a label of one are both a miss of minus one half. At a raw output of 3 they part, 2.5 against −0.0474. Huber’s dot sits at −0.5 too, but only because that miss is inside its knee of 1.",
            ),
            choice(
              "A sigmoid output scored by squared error is the pairing a reader reaches for first. At a raw output of minus five with the label yes, cross-entropy pulls by 0.9933 and this pairing by 0.0066. Why?",
              [
                "Its slope carries the sigmoid’s own slope as a factor, which is nearly zero exactly where the model is most wrong",
                "Squared error divides by the row count twice in this arrangement",
                "The sigmoid saturates, so the squared-error value is clipped and the gradient with it",
                "Squared error reads the raw output as the prediction, so it never sees the probability at all",
              ],
              0,
              "The factor is the probability times one less the probability, and far out it is tiny, so the pairing pulls least on the rows that most need pulling. A network trained under it can spend a long time being confidently wrong about the same people. At the halfway guess it is milder rather than broken, costing 0.125 and pulling by 0.125, a quarter of what cross-entropy pulls.",
            ),
            several(
              "Which of these hold of what Part 5 measured?",
              [
                "With one weight mistyped as 27.5, the squared-error guess at 176 centimetres fell by about three kilograms",
                "After four hundred steps absolute error was still stepping, where squared error and Huber had stopped",
                "Relabelling the 178-centimetre adult as a child made that one row 79 percent of the batch’s loss",
                "Under the two robust losses the mistyped row stopped being most of the cost",
              ],
              [0, 1, 2],
              "The squared-error line guesses 69.82 kilograms at 176 centimetres where it guessed 72.79, while absolute error moved by a hundredth of a kilogram. Squared error and Huber end with 8 parts in a quadrillion of slope left, and absolute error is still at 0.125 with the outlier, because a sign never shrinks as the guess gets close. The relabelled row costs 5.2055 and lifts the mean loss from 0.0854 to 0.4104. The mistyped row is most of the cost under all three rules, and what the robust rules cap is its say, 6 and 48 percent of the pull against 89.",
            ),
            trueFalse(
              "On the sixteen people the height rule called everyone correctly at scales of 2.5, 5 and 10, while its loss ran from 0.0290 to 0.1910.",
              true,
              "The probabilities cross one half at the same height whatever the scale, so the accuracy is 1.0 at all three, and the loss read 0.0290, 0.0854 and 0.1910. The loss rewards confidence on people already called correctly, which accuracy cannot see. Accuracy also has no slope for descent to follow, which is why a network is trained on the loss and judged on the score, and why the two are reported separately.",
            ),
            trueFalse(
              "On the empty batch, the documented contract and the arithmetic behind it agree.",
              false,
              "They disagree, and the page records it rather than defending it. The contract says an empty block is refused, while the arithmetic divides a sum of nothing by zero rows, which numpy answers with not-a-number and a warning rather than an exception. The request refuses the case at the door and nothing behind the page was changed to serve it.",
            ),
        ],
        },
        {
          title: "Practice. Pricing Misses With the Library",
          practice: [
            exercise(
              "Price the measured four three ways",
              ["The line of slope 0.6 through the mean point is weight = 0.6 × height − 34, and it guesses 74, 62, 71 and 65 kilograms for the measured four. Score those guesses against the measured weights under SquaredError, AbsoluteError and HuberError with a threshold of 5, and print each loss’s value and its four gradients.", "Part 2 worked these by hand as 20, 6 and 17.75, with gradients (−1, 1, 2, −2), a quarter in size everywhere, and (−1, 1, 1.25, −1.25). Then score the same four under Huber at knees of 1, 6 and 50 kilograms. Section 6 gives 5.5 for the first and section 22 says the last would be squared error. The knee of 6 is not on the page."],
              `import numpy as np
from oop_ml import AbsoluteError, HuberError, SquaredError

heights = np.array([180.0, 160.0, 175.0, 165.0])
measured = np.array([[78.0], [58.0], [63.0], [73.0]])
guessed = (0.6 * heights - 34.0).reshape(-1, 1)

# Measure the guesses against the measured weights under SquaredError,
# AbsoluteError and HuberError(threshold=5.0). Print each value to four
# places and each loss's four gradients.

# Measure under HuberError at thresholds of 1, 6 and 50 and print each value
# to four places.`,
              `import numpy as np
from oop_ml import AbsoluteError, HuberError, SquaredError

heights = np.array([180.0, 160.0, 175.0, 165.0])
measured = np.array([[78.0], [58.0], [63.0], [73.0]])
guessed = (0.6 * heights - 34.0).reshape(-1, 1)

for name, loss in [("squared error", SquaredError()), ("absolute error", AbsoluteError()), ("Huber, knee 5", HuberError(threshold=5.0))]:
    scored = loss.measure(guessed, measured)
    print(f"{name:14} value {scored.value:.4f}, gradients {scored.gradient.ravel().tolist()}")

for knee in (1.0, 6.0, 50.0):
    scored = HuberError(threshold=knee).measure(guessed, measured)
    print(f"Huber, knee {knee:g} value {scored.value:.4f}")`,
              `squared error  value 20.0000, gradients [-1.0, 1.0, 2.0, -2.0]
absolute error value 6.0000, gradients [-0.25, 0.25, 0.25, -0.25]
Huber, knee 5  value 17.7500, gradients [-1.0, 1.0, 1.25, -1.25]
Huber, knee 1 value 5.5000
Huber, knee 6 value 19.0000
Huber, knee 50 value 20.0000`,
              { hints: ["A loss is built with no arguments, apart from HuberError, which takes its threshold. Its measure takes the outputs and the truths as two blocks of the same shape, one row per person and one column here.", "measure answers one object carrying both the value and the gradient, which is section 3’s rule that a caller cannot get one without the other. The gradient has the outputs’ shape, and ravel flattens it to four numbers.", "The threshold is in the target’s own units, kilograms here, so HuberError(threshold=6.0) puts the two four-kilogram misses inside the knee and the two eight-kilogram ones outside it."], check: numberCheck("What does Huber charge the measured four at a knee of 6 kilograms?", 19.0, 0.0005, "The four-kilogram misses are inside the knee and cost 8 each, as under squared error. The eight-kilogram misses are outside it and cost 6 × (8 − 6 / 2) = 30 each, so the batch costs (8 + 8 + 30 + 30) / 4 = 19. Widen the knee to 50 and every miss is inside it, which gives squared error’s 20. Narrow it to 1 and none is, which gives 5.5.") },
            ),
            exercise(
              "Score one row of three class scores",
              ["Section 11 scores a row of 1, 2 and 3 for child, teenager and adult. For each of the three classes in turn taken as the true one, build the one-hot truth, measure the row under SoftmaxCrossEntropy, and print the price, the three pulls and what the pulls sum to.", "With adult true the lesson gives a price of 0.4076 and pulls of 0.0900, 0.2447 and −0.3348, and with child true a price of 2.4076. It never scores the row with teenager true. Finish by adding a hundred to every score with adult true and printing the price again."],
              `import numpy as np
from oop_ml import SoftmaxCrossEntropy

scores = np.array([[1.0, 2.0, 3.0]])
classes = ["child", "teenager", "adult"]

# For each class position, build the one-hot truth for one row of three
# classes, measure the scores against it, and print the class name, the price
# to four places, the pulls rounded to four places, and the pulls' sum.

# Add 100 to every score, measure with adult true, and print the price.`,
              `import numpy as np
from oop_ml import SoftmaxCrossEntropy

scores = np.array([[1.0, 2.0, 3.0]])
classes = ["child", "teenager", "adult"]

loss = SoftmaxCrossEntropy()
for position, name in enumerate(classes):
    truth = SoftmaxCrossEntropy.one_hot([position], 3)
    scored = loss.measure(scores, truth)
    pulls = scored.gradient[0]
    print(f"{name:8} true, price {scored.value:.4f}, pulls {pulls.round(4).tolist()}, sum {pulls.sum():.1e}")

shifted = loss.measure(scores + 100.0, SoftmaxCrossEntropy.one_hot([2], 3))
print(f"adult true with 100 added to every score, price {shifted.value:.4f}")`,
              `child    true, price 2.4076, pulls [-0.91, 0.2447, 0.6652], sum -1.1e-16
teenager true, price 1.4076, pulls [0.09, -0.7553, 0.6652], sum -1.1e-16
adult    true, price 0.4076, pulls [0.09, 0.2447, -0.3348], sum -1.1e-16
adult true with 100 added to every score, price 0.4076`,
              { hints: ["SoftmaxCrossEntropy.one_hot takes a list with one class position per row and the number of classes, and answers a block with a one in the true column and zeros elsewhere. Child is position 0 and adult is position 2.", "The loss applies the softmax itself, so hand it the raw scores and not probabilities. measure answers the value and a gradient with one pull per class score.", "The pull on each score is that class’s probability minus its truth, so you can read the three probabilities back off the pulls by adding one to the pull on the true class."], check: numberCheck("What is the price of the row when teenager is the true class, to four places?", 1.4076, 0.0005, "The softmax gives the three classes 0.0900, 0.2447 and 0.6652 whichever one is true, and the price is the negative logarithm of the probability on the true one, here 0.2447. The three prices are 2.4076, 1.4076 and 0.4076, exactly one apart, because the scores are one apart and the price of a class is the logarithm of the sum less that class’s own score.") },
            ),
            exercise(
              "Walk one line down each loss with a mistyped weight",
              ["The sixteen rows below are the ideal fifteen and the person at 176 centimetres entered a second time with 27.5 kilograms. Section 18 walks one linear neuron down each loss for four hundred steps at a rate of 0.1, from a flat line at the mean weight, on heights standardised to zero mean and unit spread and weights measured from their mean. Do the same with a one-neuron DenseLayer in a LayerStack.", "For each loss print the slope and intercept in kilograms per centimetre and kilograms, the guess at 176 centimetres, and the largest slope left in the neuron after the last step. Section 18 gives 0.7464 and −61.55 guessing 69.82 for squared error, 0.7908 and −66.75 guessing 72.44 for Huber, and 0.7983 and −67.72 guessing 72.78 for absolute error, and section 19 says absolute error is still stepping by 0.125."],
              `import numpy as np
from oop_ml import AbsoluteError, DenseLayer, HuberError, Identity, LayerStack, Neuron, SquaredError

heights = np.array([152, 155, 158, 161, 164, 167, 170, 173, 176, 179, 182, 185, 188, 191, 194, 176], dtype=float)
weights = np.array([54.2, 55.4, 58.7, 60.5, 63.2, 66.2, 67.4, 70.7, 72.5, 75.2, 78.2, 79.4, 82.7, 84.5, 87.2, 27.5])
inputs = ((heights - heights.mean()) / heights.std()).reshape(-1, 1)
targets = (weights - weights.mean()).reshape(-1, 1)
losses = [("squared error", SquaredError()), ("absolute error", AbsoluteError()), ("Huber, knee 5", HuberError(threshold=5.0))]

for name, loss in losses:
    line = LayerStack([DenseLayer([Neuron([0.0], bias=0.0, activation=Identity())])])
    # Four hundred times, run a backward pass on the inputs and targets under
    # this loss and replace the line with the one stepped by it at 0.1.

    # Undo the standardising: the slope is the neuron's weight over the
    # heights' spread, and the intercept is the mean weight plus the bias less
    # the slope times the mean height. Print them, the guess at 176, and the
    # largest_movement of one more backward pass.`,
              `import numpy as np
from oop_ml import AbsoluteError, DenseLayer, HuberError, Identity, LayerStack, Neuron, SquaredError

heights = np.array([152, 155, 158, 161, 164, 167, 170, 173, 176, 179, 182, 185, 188, 191, 194, 176], dtype=float)
weights = np.array([54.2, 55.4, 58.7, 60.5, 63.2, 66.2, 67.4, 70.7, 72.5, 75.2, 78.2, 79.4, 82.7, 84.5, 87.2, 27.5])
inputs = ((heights - heights.mean()) / heights.std()).reshape(-1, 1)
targets = (weights - weights.mean()).reshape(-1, 1)
losses = [("squared error", SquaredError()), ("absolute error", AbsoluteError()), ("Huber, knee 5", HuberError(threshold=5.0))]

for name, loss in losses:
    line = LayerStack([DenseLayer([Neuron([0.0], bias=0.0, activation=Identity())])])
    for _ in range(400):
        line = line.stepped_by(line.backward_pass(inputs, targets, loss), 0.1)

    slope = line[0].weight_matrix[0, 0] / heights.std()
    intercept = weights.mean() + line[0].bias_vector[0] - slope * heights.mean()
    left = line.backward_pass(inputs, targets, loss).largest_movement
    print(f"{name:14} slope {slope:.4f}, intercept {intercept:.2f}, guess at 176 cm {slope * 176 + intercept:.2f}, slope left {left:.4f}")`,
              `squared error  slope 0.7464, intercept -61.55, guess at 176 cm 69.82, slope left 0.0000
absolute error slope 0.7983, intercept -67.72, guess at 176 cm 72.78, slope left 0.1250
Huber, knee 5  slope 0.7908, intercept -66.75, guess at 176 cm 72.44, slope left 0.0000`,
              { hints: ["backward_pass takes the inputs, the targets and the loss and answers the gradients, and stepped_by takes that and a learning rate and answers a new stack. Nothing is changed in place, so the loop reassigns the line each time.", "The stack holds one layer, at position 0. Its weight_matrix is one by one and its bias_vector has one entry, and both are in standardised units until you convert them.", "A backward pass reports largest_movement, the biggest slope anywhere in the network. A walk that has settled reports something near zero there, and one still stepping reports the size of its step."], check: numberCheck("What does the Huber line guess for the person at 176 centimetres, to two places?", 72.44, 0.005, "The clean fifteen put that person at about 72.79 kilograms under every loss. One mistyped row pulls the squared-error guess down to 69.82, because nothing caps how hard a miss of 45 kilograms pulls. Huber caps that row’s pull at the knee over the row count, 5 / 16, so its line gives up only a third of a kilogram, and it still settles, with no slope left, where absolute error is left stepping by 0.125.") },
            ),
            exercise(
              "Relabel one adult and watch the loss, not the accuracy",
              ["The sixteen people of section 20 are scored by the rule score = (height − 152) / scale, and BinaryCrossEntropy applies the sigmoid itself. For scales of 2.5, 5 and 10, print the mean loss and the accuracy under the true labels, then the mean loss and the accuracy with the 178-centimetre adult relabelled as a child.", "Section 21 gives the three clean losses as 0.0290, 0.0854 and 0.1910 at an accuracy of 1.0, and section 20 gives 0.4104 for the relabelled batch at a scale of 5. The relabelled losses at the other two scales are not on the page. Before running, decide which scale the wrong label will hurt most."],
              `import numpy as np
from oop_ml import BinaryCrossEntropy

heights = np.array([112, 118, 124, 130, 135, 140, 144, 148, 156, 160, 165, 170, 174, 178, 183, 188], dtype=float)
labels = np.array([0] * 8 + [1] * 8, dtype=float).reshape(-1, 1)
relabelled = labels.copy()
relabelled[13] = 0.0

loss = BinaryCrossEntropy()
for scale in (2.5, 5.0, 10.0):
    scores = ((heights - 152.0) / scale).reshape(-1, 1)
    called_adult = scores >= 0.0
    # Measure the scores against the true labels and against the relabelled
    # ones. Print the scale, each mean loss to four places, and each accuracy,
    # the share of rows where called_adult agrees with the label being one.`,
              `import numpy as np
from oop_ml import BinaryCrossEntropy

heights = np.array([112, 118, 124, 130, 135, 140, 144, 148, 156, 160, 165, 170, 174, 178, 183, 188], dtype=float)
labels = np.array([0] * 8 + [1] * 8, dtype=float).reshape(-1, 1)
relabelled = labels.copy()
relabelled[13] = 0.0

loss = BinaryCrossEntropy()
for scale in (2.5, 5.0, 10.0):
    scores = ((heights - 152.0) / scale).reshape(-1, 1)
    called_adult = scores >= 0.0
    clean = loss.measure(scores, labels).value
    flipped = loss.measure(scores, relabelled).value
    clean_accuracy = np.mean(called_adult == (labels == 1.0))
    flipped_accuracy = np.mean(called_adult == (relabelled == 1.0))
    print(f"scale {scale:4}: loss {clean:.4f} at accuracy {clean_accuracy:.4f}, relabelled loss {flipped:.4f} at accuracy {flipped_accuracy:.4f}")`,
              `scale  2.5: loss 0.0290 at accuracy 1.0000, relabelled loss 0.6790 at accuracy 0.9375
scale  5.0: loss 0.0854 at accuracy 1.0000, relabelled loss 0.4104 at accuracy 0.9375
scale 10.0: loss 0.1910 at accuracy 1.0000, relabelled loss 0.3535 at accuracy 0.9375`,
              { hints: ["BinaryCrossEntropy takes raw scores, so hand it the scores as they are, a block of sixteen rows and one column, beside labels of the same shape. Passing probabilities would apply the sigmoid twice.", "measure answers an object with a value, the mean loss over the sixteen rows. The same scores are measured twice, once against each block of labels.", "A sigmoid is above one half exactly where its score is above zero, so the rule calls someone an adult when their score is at least zero, and accuracy is the mean of where that agrees with the label."], check: numberCheck("What is the mean loss at a scale of 2.5 with the 178-centimetre adult relabelled as a child, to four places?", 0.679, 0.0005, "At a scale of 2.5 that person’s score is (178 − 152) / 2.5 = 10.4, and a confidently wrong answer costs roughly its raw score, so the one row costs about 10.4 and a sixteenth of that lands on a batch whose clean loss was 0.0290. The sharpest rule had the lowest clean loss and pays the most for the wrong label, while the accuracy reads 15 of 16 at every scale. The loss measures how confidently the model disagrees with a label, and accuracy only counts that it does.") },
            ),
          ],
        },
      ]}
    />
  );
}
