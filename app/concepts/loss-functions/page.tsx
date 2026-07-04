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
import { LossCurvesPlayground } from "@/components/widgets/LossCurvesPlayground";
import { LossOnALine } from "@/components/widgets/LossOnALine";
import { MislabelledRow } from "@/components/widgets/MislabelledRow";
import { SoftmaxRow } from "@/components/widgets/SoftmaxRow";
import { ThreeLossesOneBadRow } from "@/components/widgets/ThreeLossesOneBadRow";

export const metadata: Metadata = {
  title: "Loss Functions · oop_ml",
  description:
    "The loss is the number a network is trying to make small, and its shape decides what a wrong answer costs and how hard the correction pushes. Five of them, and three share one gradient.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function LossFunctionsPage() {
  return (
    <ConceptPage
      title="Loss Functions"
      tagline="The number a network is trying to make small, and the slope it hands back."
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
      history={
        <>
          <p>
            Every fit on this site has been a search for the settings that make
            some number as small as possible, and the choice of that number was
            argued over long before anyone had a network to train. Roger
            Boscovich and Christopher Maire measured arcs of the meridian
            across the Papal States in the early 1750s to settle the shape of
            the earth, and the measurements disagreed with each other, as
            measurements do. Boscovich had to say what the best line through
            them was, and the rule he published in 1757 was that the sum of
            the absolute misses should be as small as possible. Adrien-Marie
            Legendre, fitting comet orbits in 1805, chose to square the misses
            before summing them instead, and Carl Friedrich Gauss, who claimed
            to have used the same rule since 1795, gave it its reason in 1809,
            showing that squared error is exactly what to minimise when the
            noise around each measurement follows the bell curve. The two
            rules give different lines through the same measurements, and
            which one is right depends on what the misses are, which nobody
            fitting a line can know from the misses alone.
          </p>
          <p>
            The rest arrived as answers to what those two get wrong. Peter
            Huber&rsquo;s 1964 paper on robust estimation began from the
            observation that a single wild reading can drag a squared-error fit
            anywhere, and proposed a loss that is squared near the truth and
            straight far from it, so a wild reading pulls with a bounded force.
            I. J. Good proposed in 1952 that a forecaster be scored by the
            logarithm of the probability they gave to what actually happened,
            and that score became the loss for every model that answers with a
            probability. John Bridle named the softmax in 1989 when he showed
            that a network&rsquo;s outputs could be read as class probabilities
            and trained by Good&rsquo;s score, and John Nelder and Robert
            Wedderburn had already, in 1972, written down why the sigmoid and
            the softmax are the squashes that make that training clean, under
            the name canonical link.
          </p>
          <p>
            So the page asks six questions in order. What is a loss for, and
            why does it answer with two numbers rather than one? How does each
            of the five price a single miss, in kilograms or in probability?
            What happens when a whole batch of people is scored at once? Which
            squash belongs with which loss, and why do three of the five hand
            the network exactly the same slope? What does each loss do when one
            person&rsquo;s weight has been mistyped? And where does each one
            fail?
          </p>
        </>
      }
      playground={<LossCurvesPlayground />}
      sections={[
        {
          title: "Part 1. What a Loss Is For",
          defaultOpen: true,
          content: (
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
                <p>
                  A miss on its own has a sign, and the sign is the wrong thing
                  to add up, since minus four and four would cancel to nothing
                  while both guesses were wrong. So every loss here first turns
                  a miss into something that cannot be negative, and the five
                  differ in how they do it. Squaring, taking the size, squaring
                  up close and taking the size far out, and for the two losses
                  that price a probability rather than a weight, taking the
                  negative logarithm of the probability the model gave to what
                  was true.
                </p>
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
                  <p>
                    Under squared error the four misses price at 8, 8, 32 and
                    32, which sum to 80, and 80 over 4 rows is 20. Send the
                    same four people twice, eight rows, and the prices sum to
                    160, which over 8 rows is the same 20. The pull on each row
                    halves, from −1, 1, 2, −2 to −0.5, 0.5, 1, −1, because the
                    slope carries the same division, so a batch twice the size
                    steps the network by the same amount rather than twice as
                    far. Absolute error and Huber do the same, 6 staying 6 and
                    17.75 staying 17.75.
                  </p>
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
                <p>
                  The box at the top of the page has one slider, the raw output
                  of a network&rsquo;s last layer for one person, and it draws
                  two charts. The upper one is what each loss charges at every
                  raw output, and the lower one is the slope of that charge,
                  which is the thing a network actually uses, because the slope
                  says which way to move the output and how hard. The value is
                  the number we plot as a training curve and quote when a run
                  is over, and the slope is the number the next step is taken
                  from, so a loss that reported only its value would give a
                  network nothing to do with it.
                </p>
                <p>
                  Both come back from one call, since computing either alone
                  would mean running the squash twice, and the table under the
                  charts checks that they agree with each other. The last
                  column nudges the raw output by a hundred-thousandth either
                  side, measures the cost at both, and divides the difference
                  by the gap, which is the calculus primer&rsquo;s definition
                  of a slope. At the halfway guess the largest disagreement
                  between the slope reported alongside the value and the slope
                  found by nudging is 2.3 parts in a trillion, and across the whole
                  slider it never passes 2.1 parts in ten billion.
                </p>
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
          ),
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
                  <p>
                    The misses of −4, 4, 8 and −8 price at 8, 8, 32 and 32, so
                    the batch costs 80 over 4, which is 20. The pulls are the
                    misses over 4, so −1, 1, 2 and −2. The two people missed by
                    eight kilograms carry 64 of the 80 in cost, four fifths of
                    it, and a third of the pull each, because a miss twice as
                    big costs four times as much and pulls twice as hard.
                  </p>
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
                  <p>
                    The four misses price at 4, 4, 8 and 8, which is 24 over 4,
                    or 6. Every pull is a quarter in size, −0.25, 0.25, 0.25
                    and −0.25, and each person carries exactly a quarter of the
                    batch&rsquo;s pull, the eight-kilogram misses included. The
                    two big misses still carry two thirds of the cost, since a
                    price of eight is twice a price of four; what has changed
                    is that they no longer pull any harder for it.
                  </p>
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
                  <p>
                    The four-kilogram misses are inside the knee and price at 8
                    each, exactly as squared error had them. The eight-kilogram
                    misses are outside, and price at 5 times 8 less 2.5, which
                    is 27.5 each. The batch costs 71 over 4, or 17.75, and the
                    pulls are −1, 1, 1.25 and −1.25, so the big misses pull
                    harder than the small ones but only by a quarter, where
                    squared error had them pulling twice as hard.
                  </p>
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
                  <p>
                    The threshold is a distance in the target&rsquo;s own units,
                    so a knee of 1 means something different on weights in
                    kilograms from what it means on the playground&rsquo;s
                    targets near one half. Set the knee to 1 kilogram on the
                    four and none of them is inside it, the batch costs 5.5,
                    and every pull is a quarter in size, which is absolute error
                    wearing a different name. A knee has to be chosen against
                    the size of the misses it will meet, and the Huber
                    regression on its own page estimates a scale from
                    the residuals and measures its knee in multiples of that;
                    the network loss here takes a fixed number and leaves the
                    choice to you.
                  </p>
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
                  straight and the bend happens inside the loss, for a reason
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
                  <p>
                    At a raw output of zero with the label yes the probability
                    is one half, the price is the logarithm of two, 0.6931, and
                    the pull is 0.5 less 1, which is −0.5. At a raw output of 3
                    the probability is 0.9526, the price falls to 0.0486 and the
                    pull to −0.0474, nearly nothing left to say. At −3 the model
                    is confidently wrong, the price is 3.0486 and the pull is
                    −0.9526, and at −5 the price is 5.0067 and the pull −0.9933.
                  </p>
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
                <p>
                  With three classes, child, teenager and adult, the last layer
                  hands over three scores per person, and the squash has to read
                  across the row rather than down a column. The softmax raises
                  e to each score and divides by the sum, so the three come out
                  positive and summing to one, and the price is again the
                  negative logarithm of the probability on the true class. The
                  slope at every score is the probability of that class minus
                  the truth for that class, which is one on the true class and
                  zero on the rest.
                </p>
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
                <p>
                  On the playground the rose and sky curves lie on top of one
                  another, which is why the sky one is dashed. That is an
                  identity rather than a drawing choice. With two classes, and
                  the second class&rsquo;s score held at zero, the softmax
                  probability of the first class is e to the score over e to
                  the score plus one, which is the sigmoid of the score. The
                  page&rsquo;s softmax reading is built exactly that way, the
                  raw output in the first column and a zero in the second, and
                  the two losses agree on the value, the gradient and the
                  probability at every raw output on the slider.
                </p>
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
          title: "Part 4. The Slope Every Network Starts From",
          content: (
            <>
              <SubSection title="13. Three losses, one subtraction">
                <p>
                  Now look at the gradient chart with the slider at the halfway
                  guess. Three of the five dots are at exactly the same value,
                  −0.5, and that is the fact the page exists to teach. Squared
                  error with a plain output, binary cross-entropy with a
                  sigmoid, and softmax cross-entropy with a softmax all have the
                  same slope at the raw output, the prediction minus the truth
                  over the row count, and it is the simplest expression on the
                  page.
                </p>
                <Equation>{"d loss / d raw output  =  (prediction − truth) / n"}</Equation>
                <p>
                  For squared error the prediction is the raw output itself,
                  zero against a target of one half. For the other two it is
                  the probability the squash produced, one half against a label
                  of one. Both misses are minus one half, and the halfway guess
                  was built so that they would be. Drag the slider to 3 and the
                  dots part, 2.5 against −0.0474, because the prediction now
                  means different things, a number that is two and a half too
                  high and a probability that is nearly right. What the three
                  share is the form, and the numbers agree only at a raw output
                  where a miss in weight and a miss in probability happen to be
                  the same size.
                </p>
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
                  layer that bends by the sigmoid, so the number is measured
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
                <p>
                  That is why the losses here apply their own squash and the
                  last layer is left straight, on the{" "}
                  <Link href="/concepts/backpropagation" className={link}>
                    backpropagation page
                  </Link>{" "}
                  and the{" "}
                  <Link href="/concepts/training-a-network" className={link}>
                    training page
                  </Link>{" "}
                  alike. Put a sigmoid on the last layer as well and the bend is
                  applied twice, once by the layer and once by the loss, and the
                  slope the loss hands back is the slope of the wrong thing.
                </p>
                <KeepInMind>
                  The squash lives inside the loss, so the last layer is left
                  straight. A sigmoid on the last layer under cross-entropy is
                  squashed twice, and a sigmoid on the last layer under squared
                  error pulled by 0.0066 where cross-entropy pulled by 0.9933
                  on the same wrong answer.
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
                  <p>
                    The softmax&rsquo;s own slope is a whole matrix, every
                    output depending on every score, and it is exactly the term
                    that cancels, leaving the probability minus the one-hot
                    truth on every class at once, which is the row of pulls in
                    section 11. Squared error needs no cancellation at all,
                    since it has no squash and its price is already a
                    quadratic in the raw output. Gauss reached the regression
                    case for the bell curve, and the sigmoid and the softmax are
                    the same result for a yes-or-no and for one-of-many. In
                    every case the loss is the negative logarithm of a
                    likelihood and the squash is that likelihood&rsquo;s
                    natural parameter unwound, which is why the pairing is not
                    a convention that hardened.
                  </p>
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
                  bend, where there is one, inside the loss.
                </p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="the loss, and what the loss applies first"
                  rows={[
                    { expression: "how much does this person weigh", reason: "squared error on the raw output, no squash; or absolute error or Huber when some weights cannot be trusted." },
                    { expression: "is this person an adult", reason: "binary cross-entropy, which applies the sigmoid; one output, a label of zero or one." },
                    { expression: "child, teenager or adult", reason: "softmax cross-entropy, which applies the softmax across the row; one output per class, a one-hot truth." },
                    { expression: "a probability from a bent last layer under squared error", reason: "the pairing section 14 measured; it trains, and it stops pulling where it is most wrong." },
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
                <p>
                  Under squared error one row is 99.87 percent of the cost and
                  89 percent of the pull, so whatever the other fifteen people
                  want, the line will move to please the one. Under absolute
                  error the row is still 89 percent of the cost, since a miss
                  of 45 is a large price under any rule, and one sixteenth of
                  the pull, the same as everyone else. Huber is between them,
                  with the bad row capped at a pull of 5 over 16 against the
                  others&rsquo; fractions of a kilogram.
                </p>
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
                <p>
                  With the weight mistyped, the squared-error line drops to a
                  slope of 0.7464 and an intercept of −61.55 and now guesses
                  69.82 kilograms at 176 centimetres, three kilograms lower
                  than before, for a person who has not changed. The Huber
                  line moves to 0.7908 and −66.75, guessing 72.44, a third of
                  a kilogram lower. The absolute error line moves to 0.7983 and
                  −67.72, guessing 72.78, one hundredth of a kilogram lower.
                  The mistyped row is missed by 42.3, 44.9 and 45.3 kilograms
                  by the three lines in turn, so the two robust rules leave it
                  almost exactly as wrong as it was and squared error closes
                  three kilograms of the gap at everyone else&rsquo;s expense.
                </p>
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
                <p>
                  The same cap has a price at the other end of the walk. The
                  readouts show the largest slope left in the neuron after the
                  last step, and for squared error and Huber it is 8 parts in
                  a quadrillion, which is a walk that has stopped. For absolute
                  error it is 0.0926 on the clean fifteen and 0.125 with the
                  outlier, because a sign never shrinks as the guess gets
                  close, so the walk keeps stepping by the full learning rate
                  and settles into a twitch about the answer rather than onto
                  it. The clean absolute-error loss is 0.3609 after four
                  hundred steps and still moving in the third decimal.
                </p>
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
                <p>
                  Cross-entropy has the same problem in a different currency.
                  Take sixteen people, eight children under 152 centimetres and
                  eight adults over it, scored by a fixed rule, the height less
                  152 over 5, and squashed. The rule calls every one of them
                  correctly, the batch costs 0.0854, and the two people nearest
                  the boundary, at 148 and 156 centimetres, cost 0.3711 each
                  and carry a quarter of the pull between them. Now mark the
                  178-centimetre adult as a child.
                </p>
                <MislabelledRow />
                <p>
                  The rule gives that person a probability of 0.9945 of being
                  an adult, and the label now says they are not, so their cost
                  is the negative logarithm of 0.0055, which is 5.2055. The
                  batch cost goes from 0.0854 to 0.4104, with that one row 79
                  percent of the total, and their pull, 0.9945 over 16, is 45
                  percent of the batch&rsquo;s pull. Accuracy moves from 1.0 to
                  0.9375, one person in sixteen, which is the honest size of
                  the mistake, and the loss moved by nearly five times that.
                </p>
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
                <p>
                  A classifier is judged by how many people it called
                  correctly, and it is trained by the loss, and the two can
                  disagree. Change the scale of the rule in the widget above
                  from 5 to 2.5 and then to 10. The accuracy is 1.0 at all
                  three, since the probabilities cross one half at the same
                  height whatever the scale, and the loss is 0.0290, 0.0854 and
                  0.1910, a factor of six apart. The loss rewards confidence on
                  people already called correctly, which accuracy cannot see,
                  and the training page&rsquo;s run has stretches where the
                  loss falls for fifty epochs while the accuracy does not move
                  at all.
                </p>
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
                    { expression: "binary cross-entropy", reason: "a mislabelled row costs 5.2 and pulls by nearly one, with no cap; the value saturates at 36.04 while the gradient does not; and a sigmoid already on the last layer is squashed twice." },
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
      ]}
    />
  );
}
