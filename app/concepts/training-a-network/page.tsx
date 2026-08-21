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
import { BatchSizeComparison } from "@/components/widgets/BatchSizeComparison";
import { EpochReadout } from "@/components/widgets/EpochReadout";
import { OneStepTrace } from "@/components/widgets/OneStepTrace";
import { SeedLedger } from "@/components/widgets/SeedLedger";
import { StepSizeSweep } from "@/components/widgets/StepSizeSweep";
import { TrainingRunPlayground } from "@/components/widgets/TrainingRunPlayground";
import { TwoLossCurves } from "@/components/widgets/TwoLossCurves";

export const metadata: Metadata = {
  title: "Training a Network · oop_ml",
  description:
    "The loop that uses everything on the pages before this. One step and how far it moves, what a batch is, what an epoch is, how a step size is chosen, and why a falling training loss and a held-out score that has stopped improving are different facts.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function TrainingANetworkPage() {
  return (
    <ConceptPage
      title="Training a Network"
      tagline="Measure, move, repeat. The whole of learning is that, and every hard question on this page is about how far to move and when to stop."
      prerequisites={
        <>
          The chain being trained here is built from the{" "}
          <Link href="/concepts/neurons-and-activations" className={link}>
            neuron
          </Link>{" "}
          and its bend, joined into{" "}
          <Link href="/concepts/dense-layers" className={link}>
            dense layers
          </Link>
          , scored by a{" "}
          <Link href="/concepts/loss-functions" className={link}>
            loss
          </Link>
          , with the slopes coming from{" "}
          <Link href="/concepts/backpropagation" className={link}>
            backpropagation
          </Link>{" "}
          and one of its layers borrowed from the{" "}
          <Link href="/concepts/dropout" className={link}>
            dropout
          </Link>{" "}
          page. None of those is explained again. The two curves in Part 5 are
          the{" "}
          <Link href="/concepts/held-out-evaluation" className={link}>
            held-out evaluation
          </Link>{" "}
          page&rsquo;s measurement taken once an epoch, and the step itself is
          the{" "}
          <Link href="/primers/calculus" className={link}>
            calculus primer&rsquo;s
          </Link>{" "}
          single move.
        </>
      }
      history={
        <>
          <p>
            The move this page repeats was published in 1847 by
            Augustin-Louis Cauchy, in a four-page note to the Comptes Rendus of
            the French Academy of Sciences titled &ldquo;M&eacute;thode
            g&eacute;n&eacute;rale pour la r&eacute;solution des
            syst&egrave;mes d&rsquo;&eacute;quations simultan&eacute;es&rdquo;.
            The problem in front of him was astronomical, a system of
            equations relating observations of a body to the orbit that would
            explain them, and the standard treatment was to eliminate the
            unknowns one at a time, which for a system of any size was
            unmanageable by hand. His proposal was to write the whole system
            as one quantity to be made small, compute the partial derivative
            of that quantity with respect to each unknown, and change every
            unknown a little in the direction that lowers it. He noted that
            the method does not need the equations to be linear and that it
            can be stopped whenever the remaining error is small enough.
          </p>
          <p>
            The other half of the loop, the part where a step is taken from a
            handful of rows rather than from all of them, came from a problem
            that had nothing to do with fitting anything. In 1951 Herbert
            Robbins and Sutton Monro published &ldquo;A Stochastic
            Approximation Method&rdquo; in the Annals of Mathematical
            Statistics, asking how to find the level at which some response
            reaches a target when the response can only be observed with
            noise, as in a dosage trial where each subject gives one uncertain
            reading. Their answer was to keep stepping on the noisy readings
            and to shrink the step as you go, and their theorem gives the
            conditions under which that converges even though no single
            reading is trustworthy. That result is why taking a step from one
            person at a time is a method rather than a mistake, and the
            shrinking step is where every learning-rate schedule since comes
            from.
          </p>
          <p>
            Putting Cauchy&rsquo;s step, Robbins and Monro&rsquo;s noisy
            reading and a network with a hidden layer into one loop is what
            David Rumelhart, Geoffrey Hinton and Ronald Williams demonstrated
            in their 1986 Nature paper &ldquo;Learning representations by
            back-propagating errors&rdquo;. What was left after that was
            practice rather than theory, and two collections wrote it down.
            Yann LeCun, L&eacute;on Bottou, Genevieve Orr and Klaus-Robert
            M&uuml;ller&rsquo;s &ldquo;Efficient BackProp&rdquo; of 1998 is
            the advice on step sizes, shuffling and small batches, and Lutz
            Prechelt&rsquo;s &ldquo;Early Stopping, But When?&rdquo; in the
            same volume is the argument that the epoch to stop at cannot be
            read off the curve the loop can see. This page asks six questions
            in that order. What does one step actually change, and how far
            should it move? What is a batch, and what changes when it is
            small? What is an epoch, and what does it mean for the loss to
            stop falling? How is a step size chosen, and what do too large and
            too small look like when they are measured rather than described?
            What does the loss curve tell you, and what does it hide? And what
            must a complete loop state that this one leaves to whoever writes
            it?
          </p>
        </>
      }
      playground={<TrainingRunPlayground />}
      sections={[
        {
          title: "Part 1. What One Step Changes",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. The crowd, the chain, and what is left to do">
                <p>
                  Sixty people have each been measured twice, and thirty of
                  them belong to one group and thirty to the other. Plotted
                  against their two measurements they fall into two rings, a
                  small one near the middle of the picture and a wider one
                  around it, so the inner group is completely surrounded. No
                  straight boundary can separate them, and the box above
                  measures exactly that. Fitted on the same sixty people, a
                  straight boundary calls 0.583 of them correctly, which is
                  barely better than tossing a coin, and the chain trained
                  below reaches 1.000.
                </p>
                <p>
                  Everything the chain is made of has already been built. Two
                  measurements feed six units that bend, those six feed a
                  single unit that does not, a loss scores the answer against
                  the truth, and a backward walk hands every one of the
                  twenty-five numbers in the chain a slope. What is left is the
                  part none of those pages covered, which is what to do with
                  those slopes, how many times, on which rows, and when to
                  stop.
                </p>
                <p>
                  It is worth saying plainly what the loop adds, since none of
                  it is arithmetic. Something has to count the passes, decide
                  which rows each step reads and in what order, keep whatever
                  is worth looking at afterwards, and say when to stop, and
                  every one of those is a decision somebody makes rather than a
                  quantity anything computes. Section 28 sets them out with
                  what each of them costs.
                </p>
                <KeepInMind>
                  Nothing on this page is a new piece of machinery. The four
                  pieces were built already, and what this page adds is the
                  loop around them and the questions that only come up once
                  they are in one.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. One step, traced through twenty-five numbers">
                <p>
                  Start from an untrained chain, whose twenty-five numbers were
                  drawn at random, and take exactly one step. The backward walk
                  measures the loss on its way forward and hands back one slope
                  for every number. Each number then moves against its own
                  slope, by the same fraction of it, and that fraction is the
                  step size. Nothing else happens.
                </p>
                <Equation>{"every number w:    w  ←  w  −  rate × (slope of the loss at w)"}</Equation>
                <WorkedExample title="Three of the twenty-five, at a step size of a half">
                  <p>
                    The first hidden unit&rsquo;s weight on the first
                    measurement starts at 0.345584 and is handed a slope of
                    0.028119. The slope is positive, which says the loss rises
                    as that weight rises, so the weight goes down, by half of
                    0.028119, and lands on 0.331525. Its bias starts at exactly
                    zero with a slope of &minus;0.038580, so it moves up to
                    0.019290. The output unit&rsquo;s weight on that same
                    hidden unit starts at &minus;0.425192 with a slope of
                    &minus;0.058571, and moves up to &minus;0.395907.
                  </p>
                  <Equation>{"0.345584 − 0.5 × 0.028119   =  0.331525\n0.000000 − 0.5 × (−0.038580)  =  0.019290"}</Equation>
                  <p>
                    Twenty-two more numbers moved the same way at the same
                    moment, and the loss on all sixty people fell from 0.727078
                    to 0.717923.
                  </p>
                </WorkedExample>
                <OneStepTrace />
                <p>
                  The table above is that step in full, and the bars underneath
                  belong to section 5. Notice how small the
                  drop is. One step of a loop that will run two hundred times
                  moved the loss by nine thousandths, and it moved it by
                  changing every number in the chain by a few hundredths at
                  most.
                </p>
                <KeepInMind>
                  A step reads one slope per number and changes every number at
                  once. No number waits its turn and no number is treated
                  differently from any other.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Which numbers move most, and why it is not an accident">
                <p>
                  The twenty-five numbers are not one undifferentiated pile.
                  Eighteen of them belong to the hidden layer, twelve weights
                  and six biases, and seven to the output unit, six weights and
                  one bias. Their slopes are of visibly different sizes, and
                  the largest single slope anywhere in the chain, 0.084723,
                  sits in the output layer.
                </p>
                <NumberTable
                  headings={[
                    "layer",
                    "weights",
                    "biases",
                    "largest weight slope",
                    "largest bias slope",
                  ]}
                  rows={[
                    ["the six bent units", "12", "6", "0.028119", "0.038580"],
                    ["the output unit", "6", "1", "0.084723", "0.004452"],
                  ]}
                  caption="One backward walk on the untrained chain, over all sixty people."
                />
                <p>
                  That the output layer&rsquo;s slopes are the larger ones at
                  the start is what the backpropagation page would predict. A
                  slope deep in the chain is the slope above it multiplied by
                  the weights it passed through and by the bend&rsquo;s own
                  slope, and every one of those factors is smaller than one
                  here, so a slope shrinks the further down the chain it is
                  carried.
                </p>
                <KeepInMind>
                  The largest slope in the chain is a single number worth
                  watching, because it says how much anything anywhere still
                  wants to change, and section 18 uses it as a stopping signal.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. A step size is not a distance">
                <p>
                  It is tempting to read the step size as how far the chain
                  moves, and it is not. The step size multiplies the slope, and
                  the slope has a length of its own that changes at every point
                  of the walk. What the chain actually covers is the step size
                  times that length, measured across all twenty-five numbers at
                  once.
                </p>
                <Equation>{"distance covered  =  rate × ‖slope‖\n\n0.5 × 0.139819  =  0.069910"}</Equation>
                <p>
                  The same step size therefore moves the chain a different
                  distance on every epoch, and moves it further wherever the
                  loss is steep. That is a useful property rather than an
                  awkward one, since the walk slows down of its own accord as
                  it approaches somewhere flat, and it is also the reason a
                  step size that worked on one problem means nothing on
                  another.
                </p>
                <KeepInMind>
                  Quoting a step size without saying what the slopes were like
                  says almost nothing. Two problems whose slopes differ by a
                  factor of a hundred want step sizes differing by a factor of
                  a hundred.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. What the slope promises, and what the step delivers">
                <p>
                  There is a prediction hidden inside every step. The slope
                  says how fast the loss changes right where it was read, so it
                  also says how much the loss ought to fall for a step of a
                  given size, and the two are not the same number. The slope
                  describes the loss only in the immediate neighbourhood of the
                  point it was taken at, and a step carries the chain out of
                  that neighbourhood.
                </p>
                <Equation>{"predicted drop  =  rate × ‖slope‖²\n\n0.5 × 0.139819²  =  0.009775\nactual drop      =  0.009155"}</Equation>
                <WhyThisWorks>
                  <p>
                    Moving each number by &minus;rate times its own slope
                    changes the loss, to first order, by the sum over numbers
                    of the slope times the movement, which is
                    &minus;rate times the sum of the squared slopes. That sum
                    is the squared length of the whole slope, so the predicted
                    drop is the rate times it, and it is positive for any
                    positive rate. This is why a small enough step always
                    lowers the loss, and it is also why the promise is only
                    good for a small enough step.
                  </p>
                </WhyThisWorks>
                <p>
                  The bars in the widget in section 2 are that comparison at
                  eight step sizes, all taken from the same slope at the same
                  untrained chain. At a rate of 0.001 the step delivers 0.9999
                  of what the slope promised, at 0.05 it delivers 0.9936, at
                  0.5 it delivers 0.9366, at 1.0 it delivers 0.8735 and at 5.0
                  it delivers 0.3940. That is the usual caution about small
                  steps arriving as a measurement, and the useful part of it is
                  that the falling off is gradual, so there is no particular
                  rate at which the slope stops being informative.
                </p>
                <p>
                  What that argument does not say is that a small step is
                  better. At a rate of 5.0 the step keeps only 39 percent of
                  its promise and still reaches a loss of 0.688570, lower than
                  the 0.717923 the well-behaved rate of 0.5 reached, because 39
                  percent of a promise ten times as large is still more. Part 2
                  is about where that stops being true.
                </p>
                <KeepInMind>
                  The ratio of the actual drop to the predicted one approaches
                  one as the step shrinks, and a step whose ratio is poor may
                  still be the step that got furthest, since the ratio says
                  how far the slope can be trusted and says nothing about how
                  much ground was covered.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. The Size of the Step",
          content: (
            <>
              <SubSection title="6. Too small, measured">
                <p>
                  A step size too small does not fail loudly. The loop runs,
                  every epoch lowers the loss, nothing comes apart and no
                  number misbehaves, and at the end almost nothing has
                  happened. That
                  is the failure worth being able to recognise, because it
                  looks like a working loop that simply needs more time, and
                  sometimes it is and sometimes it is not.
                </p>
                <WorkedExample title="Two hundred epochs at a step size of 0.001">
                  <p>
                    The loss starts at 0.727078 and finishes at 0.723377, which
                    is a fall of 0.003701 over two hundred epochs. That is
                    about two fifths of what one single step at a rate of 0.5
                    achieved. The accuracy at the end is 0.467, worse than
                    calling everybody the same group, and the boundary the
                    chain draws is still very nearly the arbitrary one it
                    started with.
                  </p>
                </WorkedExample>
                <p>
                  Multiplying the rate by ten makes the difference visible but
                  not sufficient. At 0.01 the loss reaches 0.701984 and the
                  accuracy 0.500, and at 0.1 it reaches 0.623762 and 0.733. The
                  useful range on this problem starts somewhere between 0.1 and
                  0.5, and the run at 0.1 is the interesting one to look at,
                  since it is plainly learning and two hundred epochs cannot say
                  whether it would arrive.
                </p>
                <KeepInMind>
                  A step size too small is indistinguishable from a step size
                  that needs more epochs, because that is what it is. The
                  question is always whether the epochs it needs are epochs you
                  can afford.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The useful range, and how wide it turns out to be">
                <p>
                  Between the rate that does nothing and the rate that comes
                  apart there is a range where the loop simply works, and on
                  this chain it covers at least everything from a half to five,
                  a factor of ten.
                  Every curve in the chart below starts from the identical
                  twenty-five numbers and runs for the same two hundred epochs,
                  so the only thing separating them is the step size.
                </p>
                <StepSizeSweep />
                <p>
                  At 0.5 the loss reaches 0.135431 and every person is called
                  correctly, at 2.0 it reaches 0.024188, and at 5.0 it reaches
                  0.008412. All three end at an accuracy of 1.000. The rate of
                  5.0 is fifty times the rate of 0.1 and ten times the default
                  the box at the top of the page uses, and it reaches the lowest
                  loss of the eight, though it is also the only one of the three
                  whose loss ever rises, on 3 of its 199 readings.
                </p>
                <InAModel>
                  <p>
                    A range that forgiving is a property of a small chain on a
                    clean problem rather than a general fact. What makes the
                    range narrow in practice is depth, since a slope that is a
                    product of many factors varies far more from place to
                    place, and it is why the machinery that comes after this
                    page, momentum and per-number step sizes and normalisation
                    between layers, exists mostly to widen it again.
                  </p>
                </InAModel>
                <KeepInMind>
                  Search the step size on a logarithmic ladder rather than a
                  linear one, since the difference between 0.001 and 0.01
                  matters and the difference between 0.51 and 0.52 does not.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Too large does not have to mean not a number">
                <p>
                  The picture usually drawn of a step size that is too large
                  has the loss shooting off to infinity, and that is one of two
                  things that can happen. The other, which happened here, is
                  that the walk keeps producing perfectly ordinary numbers and
                  simply stops making progress, overshooting the bottom on
                  every step and landing somewhere no better than where it came
                  from.
                </p>
                <WorkedExample title="Two hundred epochs at a step size of twenty">
                  <p>
                    The loss rises on 100 of the 199 consecutive readings,
                    about as often as it falls. It touches 0.591843 at epoch
                    127, which is real progress from the 0.727078 it started
                    at, and then leaves again, finishing at 13.216754, eighteen
                    times worse than the untrained chain. Nothing ever stopped
                    being a number, and the walk could have gone on that way
                    for as long as it was asked to.
                  </p>
                </WorkedExample>
                <p>
                  A rate of one hundred behaves the same way, rising on 77 of
                  the 199 readings, reaching 0.550848 at epoch 193 and
                  finishing at 12.186892. I expected at least one of these to
                  produce a value that is not a number, and on this chain under
                  this loss none of them does, however large the rate. The
                  reason is worth knowing and is in the next section.
                </p>
                <KeepInMind>
                  The signature of a step size that is too large is a loss that
                  rises about as often as it falls, and the best loss it ever
                  reached being much lower than the loss it finished at. Watch
                  both numbers, since the final loss alone hides the second
                  fact.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Whether a walk runs away depends on the objective">
                <p>
                  Switch the objective in the chart above from log-loss to
                  squared error and the same chain, from the same starting
                  numbers, at the same rates, does run away. The reason is
                  that log-loss squashes the chain&rsquo;s raw output into a
                  chance before scoring it, so however large the output grows
                  the slope it produces is bounded, while squared error
                  compares the raw output with the target directly and its
                  slope grows with the output without limit.
                </p>
                <NumberTable
                  headings={[
                    "step size",
                    "first epoch whose loss is not a number",
                    "epoch the weights stop being finite",
                    "largest loss it reached while still a number",
                  ]}
                  rows={[
                    ["0.5", "never", "never", "settles at 0.004273"],
                    ["1.0", "never", "never", "settles at 0.006061"],
                    ["2.0", "155", "157", "7.81 × 10³⁰⁵"],
                    ["5.0", "111", "113", "2.85 × 10³⁰³"],
                    ["20.0", "77", "78", "9.94 × 10³⁰⁵"],
                  ]}
                  caption="Squared error on the same chain and the same start. A larger step runs away sooner, and the loss stops being a number one or two epochs before the twenty-five numbers themselves do."
                />
                <p>
                  The gap between those two columns is worth a sentence. The
                  loss overflows first, while the twenty-five numbers are still
                  finite enough for another step to be built out of them, and
                  it takes one or two more epochs before a step produces a
                  number that is not a number. So the measurement stops saying
                  anything an epoch or two before the chain does, and once the
                  weights have gone there is nothing left to walk from, since
                  every later slope is computed out of them.
                </p>
                <KeepInMind>
                  A step size is only safe or unsafe with respect to a
                  particular objective on a particular chain. The same rate of
                  2.0 is one of the best settings under log-loss here and comes
                  apart at epoch 155 under squared error.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Choosing one, in practice">
                <p>
                  The measurements above suggest a recipe rather than a
                  formula, and it is the one the practice collections give.
                  Start too large deliberately and come down. A rate that
                  thrashes announces itself within a few tens of epochs, since
                  the loss rises about half the time; a rate that is too small
                  looks fine for as long as you care to run it and tells you
                  nothing. Divide by three or ten until the loss falls on
                  nearly every epoch, then take one more division as a margin.
                </p>
                <DerivationTable
                  expressionHeading="what you see"
                  reasonHeading="what it means, and what to do"
                  rows={[
                    {
                      expression: "the loss is not a number after a few epochs",
                      reason:
                        "far too large, and under a bounded objective you may never see this at all. Divide by ten.",
                    },
                    {
                      expression: "the loss rises about as often as it falls",
                      reason:
                        "too large. The best loss reached is far below the final one, which is the tell. Divide by three.",
                    },
                    {
                      expression:
                        "the loss falls on nearly every epoch and is still falling at the end",
                      reason:
                        "the useful range, and possibly the low end of it. Try two or three times larger before adding epochs.",
                    },
                    {
                      expression:
                        "the loss falls by a few thousandths over hundreds of epochs",
                      reason:
                        "too small. Multiply by ten and see whether the shape of the curve changes at all.",
                    },
                  ]}
                />
                <KeepInMind>
                  Whatever rate you settle on belongs to that chain, that
                  objective and that scaling of the measurements. Changing any
                  of the three invalidates it, which is the strongest practical
                  argument for scaling the inputs before training anything.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Batches, and What a Small One Buys",
          content: (
            <>
              <SubSection title="11. A batch is the rows one step is taken from">
                <p>
                  Every step so far read all sixty people, measured the loss
                  over all of them, and moved once. Nothing forces that. The
                  loss is an average over rows and so is every slope in it, so
                  an average over some of the rows is also a number, and a step
                  can be taken against it. The rows a single step is taken from
                  are its batch, and the batch size is the one setting that
                  decides how many steps an epoch contains.
                </p>
                <Equation>{"steps in one epoch  =  ⌈ rows ÷ batch size ⌉\n\n60 ÷ 60  =  1 step        60 ÷ 15  =  4 steps\n60 ÷ 30  =  2 steps       60 ÷ 1   =  60 steps"}</Equation>
                <p>
                  Reading every row before moving is the whole-batch case, and
                  it is what Cauchy described. Reading one row before moving is
                  the other extreme, and it is what the perceptron did and what
                  Robbins and Monro justified. Everything between them is a
                  choice, and the usual arrangement is to shuffle the rows at
                  the start of each epoch and then walk through them in
                  consecutive slices, so no row is used twice in an epoch and
                  no batch is the same batch twice.
                </p>
                <KeepInMind>
                  A batch is about which rows a step reads, and it is unrelated
                  to how many rows you have or to how many epochs you run.
                  Those are three separate settings and a loop must state all
                  three.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What a small batch does to the direction">
                <p>
                  A batch of five people points in a direction, and that
                  direction is not the direction all sixty point in. It is an
                  estimate of it, correct on average over all the batches that
                  might have been drawn, and any particular draw can be a long
                  way off. That difference can be measured directly by asking
                  for the angle between the two directions.
                </p>
                <BatchSizeComparison showAgreement={true} />
                <p>
                  The bars are the cosine of that angle at the untrained chain,
                  averaged over two hundred draws. A batch of every row agrees
                  with the whole crowd exactly, at 1.000, since it is the same
                  calculation. A batch of thirty averages 0.780, a batch of
                  fifteen 0.546, a batch of five 0.332 and a batch of one only
                  0.073, which is very nearly a right angle. And the worst
                  single draw of one person points at &minus;0.785, which is about
                  a hundred and forty-two degrees away from where the crowd
                  wanted to go, so the step taken from that one person made the
                  loss worse on the fifty-nine it did not read.
                </p>
                <p>
                  Even a batch of thirty, half the crowd, produced one draw at
                  &minus;0.0009. Half the data pointing at right angles to what
                  all of it wanted is not a rare pathology, it is what an
                  average over a small sample does, and the loop tolerates it
                  because the next step reads a different half.
                </p>
                <KeepInMind>
                  A small batch does not give a slightly noisier version of the
                  right direction. At a batch of one on this crowd it gives a
                  direction almost unrelated to the right one, and the loop
                  works because those errors cancel across many steps rather
                  than because any of them is nearly right.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. The same sixty epochs at five batch sizes">
                <p>
                  Given how badly a small batch points, the result of actually
                  running it is the surprising part. The curves in the chart
                  above are the same chain from the same starting numbers at
                  the same step size, run for the same sixty epochs, differing
                  only in how many rows each step read. They are not close
                  together.
                </p>
                <NumberTable
                  headings={[
                    "rows per step",
                    "steps in an epoch",
                    "steps in all",
                    "loss after sixty epochs",
                    "accuracy",
                  ]}
                  rows={[
                    ["1", "60", "3600", "0.003141", "1.000"],
                    ["5", "12", "720", "0.026718", "1.000"],
                    ["15", "4", "240", "0.100265", "1.000"],
                    ["30", "2", "120", "0.291703", "0.950"],
                    ["60", "1", "60", "0.536594", "0.767"],
                  ]}
                  caption="One start, one step size of 0.5, sixty epochs each, the loss measured on all sixty people whatever the run stepped on."
                />
                <p>
                  The run that read one person at a time finished at a loss a
                  hundred and seventy times lower than the run that read all
                  sixty, and it got there by taking sixty times as many steps.
                  So what the table shows is that an epoch is a much bigger
                  unit of work once it is cut into pieces, which is a different
                  claim from a small batch being better, and section 16 sets
                  out the three ways of making the comparison.
                </p>
                <KeepInMind>
                  Comparing batch sizes at a fixed number of epochs compares
                  runs that took very different numbers of steps. It is a
                  legitimate comparison and it is not the only one, and a chart
                  that does not say which axis it fixed cannot be read.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What the noise buys, and what it costs">
                <p>
                  The batch of one is also the only one of the five whose loss
                  ever rises. It goes up between consecutive epochs on 5 of the
                  59 occasions, while every other batch size falls on every
                  single one. That is the noise from section 12 arriving as
                  something visible, and it is the thing a small batch is
                  usually credited with, since a step that sometimes goes the
                  wrong way can leave a resting place that a step always going
                  downhill would settle into.
                </p>
                <p>
                  I could not measure that benefit here and I am not going to
                  claim it. This chain reaches an accuracy of 1.000 from every
                  batch size that gets enough steps, so there is no bad resting
                  place for the noise to rescue anything from. What is
                  measurable on this crowd is the cost side, which is that the
                  loss curve of the smallest batch is the only one you cannot
                  read as a straightforward record of progress.
                </p>
                <KeepInMind>
                  The claim that small batches escape poor resting places is
                  about problems that have poor resting places. On a problem
                  small enough to be shown on a page, all the batch size
                  changes is how many steps an epoch contains and how noisy
                  each of them is.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Steps are not free, and are not proportional either">
                <p>
                  If a step on one row cost a sixtieth of a step on sixty rows,
                  the batch size would be nearly free and the smallest would
                  always win. It costs considerably more than that. The
                  arithmetic inside a step is
                  proportional to the rows, but the work around it, building the
                  blocks, walking the chain, rebuilding every layer, is the
                  same whatever the batch holds, and at this size that
                  surrounding work is most of the cost.
                </p>
                <NumberTable
                  headings={[
                    "rows per step",
                    "steps in all",
                    "milliseconds a step",
                    "milliseconds in all",
                  ]}
                  rows={[
                    ["1", "3600", "0.153", "552"],
                    ["5", "720", "0.162", "116"],
                    ["15", "240", "0.174", "42"],
                    ["30", "120", "0.213", "26"],
                    ["60", "60", "0.248", "15"],
                  ]}
                  caption="One run on one ordinary machine, so the absolute figures belong to that machine, and what matters is the ratio, since a step on one row costs 0.62 of a step on sixty."
                />
                <p>
                  So sixty times the steps cost thirty-seven times the time
                  rather than sixty, which is a saving and a small one. The
                  same measurement on a large network on a graphics card comes
                  out very differently, because there the surrounding work is a
                  smaller share and the arithmetic runs on hardware that is
                  idle unless the batch is large, and it is the reason batch
                  sizes in the hundreds are ordinary there and a batch of one
                  is not.
                </p>
                <KeepInMind>
                  How much a batch size costs is a fact about the machine it
                  runs on, so it has to be measured there rather than reasoned
                  about from the method.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Which comparison you are making">
                <p>
                  There are three ways to hold something fixed while varying the
                  batch size, and they answer three different questions. Fixing
                  the epochs asks which run learns most from one pass over the
                  data. Fixing the steps asks which run learns most per update.
                  Fixing the wall-clock time asks which run learns most per
                  second, which is the only one a person waiting for a result
                  actually cares about.
                </p>
                <DerivationTable
                  expressionHeading="held fixed"
                  reasonHeading="what the measurement above says"
                  rows={[
                    {
                      expression: "sixty epochs",
                      reason:
                        "the batch of one wins by a wide margin, at 0.003141 against 0.536594, having taken sixty times as many steps to do it.",
                    },
                    {
                      expression: "sixty steps",
                      reason:
                        "the whole batch is the only run that has finished an epoch. Comparing here compares a run that saw every person against one that saw sixty single people.",
                    },
                    {
                      expression: "fifteen milliseconds",
                      reason:
                        "the whole batch finishes all sixty of its epochs; the batch of one has managed about ninety-eight steps, which is under two of its epochs.",
                    },
                  ]}
                />
                <KeepInMind>
                  Say which of the three you fixed. Most disagreements about
                  batch size are two people fixing different things and
                  reporting the winner.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Epochs, and When the Loss Stops Falling",
          content: (
            <>
              <SubSection title="17. An epoch is one pass over the rows">
                <p>
                  An epoch is a complete pass through the training rows,
                  however many steps that takes. It is a bookkeeping unit
                  rather than a mathematical one, and it exists because it is
                  the natural place to shuffle, to measure, and to decide
                  whether to carry on. When the batch is every row, an epoch and
                  a step are the same thing, which is why the distinction only
                  becomes visible once Part 3 has been read.
                </p>
                <p>
                  The loss reported after an epoch is worth being careful
                  about, because the backward walk measures on its way forward.
                  The number an epoch reports therefore belongs to the chain as
                  it stood before that epoch&rsquo;s step, not after it. That is
                  why the first reading of a run is the untrained loss, and why
                  a run of two hundred epochs reports 0.135431 as its last
                  reading while the chain it finishes with actually stands at
                  0.134309.
                </p>
                <KeepInMind>
                  A loss curve is offset by one step from the chain that
                  produced it. It rarely matters, and it matters exactly when
                  someone compares the last point of a curve with a separately
                  measured final loss and finds they disagree.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Three readings that do not move together">
                <p>
                  A loop can watch three things without any extra data. The
                  loss it measured, the share of the training rows it then
                  calls correctly, and the largest single slope anywhere in the
                  chain. They tell you different things and they do not rise and
                  fall together.
                </p>
                <EpochReadout />
                <p>
                  The loss falls smoothly across the whole run. The accuracy
                  does not, sitting flat for long stretches and then stepping
                  up, because it only counts which side of a half each answer
                  landed on while the loss cares how far from the truth each
                  answer is. A chain can spend fifty epochs becoming more
                  confident about people it was already calling correctly,
                  which lowers the loss and moves the accuracy not at all. And
                  the largest slope rises before it falls, peaking at 0.084723
                  in the very first epoch, dropping to 0.024 by epoch 25, rising
                  again to 0.052 by epoch 75 as the chain finds the bend it
                  needs, and settling to 0.028 by the end.
                </p>
                <KeepInMind>
                  The largest slope is the honest convergence reading, because
                  when nothing anywhere wants to move by more than a whisker,
                  further epochs are buying nothing. A loss that has stopped
                  changing to four decimal places can still have a large slope
                  underneath it.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. What it means for the loss to stop falling">
                <p>
                  On this run it does not stop. The loss falls by 0.3667 over
                  the first hundred epochs and by a further 0.2249 over the
                  second hundred, so it is still falling at a healthy rate when
                  the run ends, and only from epoch 193 onward is it within a
                  hundredth of where it finishes. Every person is called
                  correctly from epoch 180. A loop stopped at 180 and a loop
                  stopped at 200 would be indistinguishable by accuracy and
                  clearly different by loss.
                </p>
                <Equation>{"loss at epoch 1     0.7271        accuracy 0.483\nloss at epoch 50    0.5893        accuracy 0.750\nloss at epoch 100   0.3604        accuracy 0.917\nloss at epoch 200   0.1354        accuracy 1.000"}</Equation>
                <p>
                  So the loss has not stopped falling here, and it would not
                  stop if the run were three times as long, since a chain that
                  can separate its training rows can always separate them more
                  confidently. Something else has to say when to stop, and the
                  three candidates are a fixed budget of epochs, a threshold on
                  the largest slope, and a second set of people the steps were
                  not taken from. Part 5 is about why the third is the only one
                  of the three that answers the question anybody actually has.
                </p>
                <KeepInMind>
                  A training loss that keeps falling is not evidence that more
                  training is worth doing. On a chain with more capacity than
                  its rows can pin down, the training loss falls forever and
                  says nothing about anyone new.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What the Loss Curve Hides",
          content: (
            <>
              <SubSection title="20. Two losses, and only one a loop can see">
                <p>
                  Take fourteen of the sixty people, seven from each group, and
                  train on those alone. Hold the other forty-six back and score
                  them after every epoch too, without ever taking a step from
                  them. Now there are two numbers per epoch. The first is what
                  a loop watching its own progress would see and the second is
                  what it cannot see, and the whole of this part is that the
                  first says almost nothing about the second.
                </p>
                <p>
                  The chain here is given eight bent units rather than six,
                  thirty-three numbers over fourteen people, which is more than
                  enough capacity to describe those fourteen exactly. Three of
                  their labels are then flipped, so that there is something in
                  the training rows the rest of the crowd genuinely does not
                  share.
                </p>
                <TwoLossCurves showAccuracy={true} />
                <p>
                  The two lines separate almost immediately and never come back
                  together. The training loss falls from 0.7210 to 0.0757 over
                  six hundred epochs, and it falls on every one of those six
                  hundred without a single exception. The held-out loss reaches
                  its lowest point of 0.5354 at epoch 73 and then rises on
                  every one of the epochs after it, all the way to 1.6472.
                </p>
                <KeepInMind>
                  A falling training loss and a held-out score that has stopped
                  improving are different facts and the loop can only observe
                  one of them. There is no rearrangement of the training loss
                  that recovers the other.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The epoch the walk should have stopped at">
                <p>
                  Epoch 73 is where the walk should have stopped, and it is
                  invisible from inside. At that epoch the training loss stands at
                  0.3070 and is still falling, and nothing about it announces
                  anything. Every one of the remaining five hundred and
                  twenty-seven epochs lowered the training loss and raised the
                  held-out one.
                </p>
                <NumberTable
                  headings={[
                    "epoch",
                    "training loss",
                    "held-out loss",
                    "training accuracy",
                    "held-out accuracy",
                  ]}
                  rows={[
                    ["0", "0.7210", "0.8087", "0.643", "0.391"],
                    ["50", "0.4898", "0.6304", "0.857", "0.739"],
                    ["100", "0.2048", "0.5987", "0.929", "0.717"],
                    ["200", "0.1206", "0.9123", "0.929", "0.696"],
                    ["400", "0.0904", "1.3017", "1.000", "0.674"],
                    ["600", "0.0757", "1.6472", "1.000", "0.630"],
                  ]}
                  caption="One run, both sets scored at every epoch. The left two columns fall together throughout; the right two part company around epoch 73."
                />
                <p>
                  This is what early stopping is, and it is why it needs a
                  second set of people rather than a cleverer reading of the
                  first. Keep the numbers from the epoch at which the held-out
                  loss was lowest, and throw away everything the walk did
                  afterwards. It costs one extra measurement per epoch and a
                  copy of the chain, and Prechelt&rsquo;s 1998 chapter is about
                  the awkward practical question of how long to keep going
                  after a new low before believing it was the last one.
                </p>
                <KeepInMind>
                  Early stopping is a decision made on rows the steps were not
                  taken from. A loop with no held-out set can be stopped on a
                  budget or on a slope, and cannot be stopped at the right
                  place.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. The two held-out readings disagree with each other">
                <p>
                  Having a held-out set does not settle the question by itself,
                  because there is more than one way to score it. The held-out
                  loss is lowest at epoch 73, and the held-out accuracy is
                  highest at epoch 51, where it reaches 0.7609. Those are
                  twenty-two epochs apart on a six-hundred-epoch run, and they
                  are two defensible answers to the question of when this walk
                  was at its best.
                </p>
                <p>
                  The disagreement has the same source as the one in section
                  18. Accuracy only counts sides and loss counts distances, so
                  a chain can become more confident about people it is calling
                  wrongly, which raises its loss without changing its accuracy
                  at all. Whichever of the two you stop on, say which, since
                  reporting a stopping epoch without saying what it was chosen
                  by is not reporting anything.
                </p>
                <KeepInMind>
                  Pick the held-out measure that matches what the model will be
                  judged by, and stop on that one. Do not pick whichever
                  measure gives the more flattering stopping epoch after the
                  fact.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Without flipped labels the curve flattens rather than turning">
                <p>
                  The rising held-out curve above is the textbook picture, and
                  it needed three flipped labels to produce. Press the other
                  button on the chart and the same fourteen people with the
                  labels as they were drawn give a curve that flattens instead.
                  The held-out loss reaches 0.2469 at epoch 256, and it does
                  rise on every one of the three hundred and forty-four epochs
                  after that, by 0.0113 in total. The held-out accuracy reaches
                  0.9130 at epoch 131 and is still exactly 0.9130 at epoch
                  600.
                </p>
                <p>
                  So the shape of the second curve depends on what there is in
                  the training rows to memorise. With clean labels a chain with
                  spare capacity mostly stops learning anything new, and with
                  three rows contradicting the pattern it spends five hundred
                  epochs learning those three and gets steadily worse at
                  everybody else. The training loss cannot tell the two cases
                  apart at all, finishing under 0.1 in both.
                </p>
                <KeepInMind>
                  Do not expect the held-out curve to turn. Waiting for a
                  visible turn before stopping will run a clean-label fit far
                  longer than it needed, and the flat stretch after the low
                  point is the common case rather than the exception.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What a Seed Fixes, and What It Does Not",
          content: (
            <>
              <SubSection title="24. The same request, sent twice">
                <p>
                  A training loop has at least two sources of randomness, the
                  draw of the starting numbers and the order the rows are
                  visited in, and both are usually controlled by a seed. It is
                  worth knowing precisely what fixing them buys, so the
                  measurement below runs the same configuration twice and then
                  changes one seed at a time.
                </p>
                <SeedLedger show="runs" />
                <p>
                  Two identical requests land on 0.05945412 and 0.05945412, the
                  same to the last bit, which is what makes any of the numbers
                  on this page quotable. Changing only the order the rows are
                  visited in, with the starting numbers untouched, gives
                  0.05903582 instead, so the order is doing real work. And
                  changing that same order seed on a run that takes the whole
                  crowd in one batch changes nothing whatever, both landing on
                  0.53659416.
                </p>
                <KeepInMind>
                  The order the rows are visited in matters only once the epoch
                  is cut into batches. Shuffling a set you are about to average
                  over in full is a no-op, and a loop that seeds its shuffle
                  and then never batches is controlling nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Four starts, four different places">
                <p>
                  What a seed does not fix is which resting place the walk
                  finds. The loss over twenty-five numbers is not a bowl with
                  one bottom, so where the walk ends depends on where it began,
                  and four draws of the starting numbers under the identical
                  loop end up somewhere different each time.
                </p>
                <SeedLedger show="starts" />
                <p>
                  Three of the four call every person correctly and the fourth
                  reaches 0.9667, one person short, and its loss of 0.155376 is
                  about half as much again as the 0.107094 the best of them
                  reached. Note that
                  the fourth also started highest, at 0.821393 against
                  0.698006, though four draws is nowhere near enough to say the
                  two are connected.
                </p>
                <InAModel>
                  <p>
                    This is why a result from one seed is not a result. The
                    convention in any paper reporting a number of this kind is
                    several seeds with a spread quoted, and the reason is
                    visible in four rows here, where the seed moved the final
                    loss by more than most of the changes a person would
                    consider making to the method.
                  </p>
                </InAModel>
                <KeepInMind>
                  A seed makes a run reproducible. It does not make it
                  representative, and those are separate properties that the
                  word deterministic runs together.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. A layer that draws has to survive the step">
                <p>
                  One kind of layer holds a source of randomness of its own,
                  the one that silences a random share of its units on every
                  training pass. Every other layer here can be rebuilt from its
                  numbers at any moment without consequence, and that one
                  cannot, because rebuilding it rebuilds its generator at the
                  same position and the next pass draws exactly what the last
                  one drew.
                </p>
                <SeedLedger show="draws" />
                <p>
                  On the left, one layer is carried across four passes, and no
                  two passes keep the same units. On the right the same layer is
                  rebuilt from the same seed before each pass, and all four
                  passes are identical, which over a whole run would silence the
                  same units every time and leave a permanently narrower layer
                  instead of one that breaks a different partnership on every
                  pass. So a layer holding a generator has to be carried
                  through the step rather than rebuilt from its settings, which
                  is the one place in a walk where a step cannot hand back
                  something newly made.
                </p>
                <KeepInMind>
                  A draw cannot be recomputed, so anything holding one has to
                  survive the step. This is the one exception to the rule that
                  a step produces a new chain and leaves the old one alone.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. The Loop Around the Step, and Its Edges",
          content: (
            <>
              <SubSection title="27. What a complete training loop states">
                <p>
                  Everything above is a setting somebody has to choose, and a
                  loop that leaves any of them unstated cannot be reproduced by
                  anybody else. The list is short enough to write out in full.
                </p>
                <DerivationTable
                  expressionHeading="what must be stated"
                  reasonHeading="why leaving it out breaks the run"
                  rows={[
                    {
                      expression: "the chain and the objective",
                      reason:
                        "the same rate is safe under one objective and runs away under another, as section 9 measures.",
                    },
                    {
                      expression: "how the starting numbers are drawn",
                      reason:
                        "and under which seed, since section 25 shows four draws reaching four places.",
                    },
                    {
                      expression: "the step size, and whether it changes",
                      reason:
                        "a fixed rate and a shrinking one are different methods, and Robbins and Monro’s conditions are about the shrinking kind.",
                    },
                    {
                      expression: "the batch size, and the shuffling",
                      reason:
                        "the batch decides how many steps an epoch holds, and the shuffle seed changes where a batched run lands.",
                    },
                    {
                      expression: "the stopping rule",
                      reason:
                        "a budget of epochs, a threshold on the largest slope, or a held-out score, and which of the two held-out scores.",
                    },
                    {
                      expression: "what is scored, and on which rows",
                      reason:
                        "a loss on the training rows, a loss on held-out rows and an accuracy on either are four different numbers.",
                    },
                    {
                      expression: "which set of numbers is kept at the end",
                      reason:
                        "the last one, or the one from the best held-out epoch. Early stopping is meaningless without saying so.",
                    },
                  ]}
                />
                <KeepInMind>
                  Seven statements, and the first thing to check about any
                  reported result is which of the seven it left out.
                </KeepInMind>
              </SubSection>

              <SubSection title="28. Five choices the loop has to settle, and what each costs">
                <p>
                  Section 27 is the list of things a report has to state.
                  This one is the list of things a loop has to decide before it
                  can run at all, which is nearly the same list read from the
                  other end, and each of the five has more than one defensible
                  answer with a price attached.
                </p>
                <DerivationTable
                  expressionHeading="the choice"
                  reasonHeading="what it buys, and what it costs"
                  rows={[
                    {
                      expression: "the order the rows are visited in",
                      reason:
                        "shuffling once and reusing that order costs nothing after the first pass, and it lets the same rows fall into the same batch on every epoch, which is a pattern the chain can pick up. Reshuffling every epoch costs one pass over the row positions and makes consecutive batches behave like fresh draws. Section 24 measures the case where the choice makes no difference at all, since a step reading every row averages them in any order.",
                    },
                    {
                      expression: "how many rows a step reads",
                      reason:
                        "the whole set gives the direction all the data agrees on and one step per pass. A small batch gives many more steps and a direction that can be almost unrelated to that one, at 0.073 of agreement for a single person in section 12, and it costs the work around a step over again each time, which section 15 measures at 0.62 of a whole-batch step for a step on one row.",
                    },
                    {
                      expression: "when to stop",
                      reason:
                        "a fixed budget costs nothing and says nothing about whether the epochs were worth running. A threshold on the largest slope needs no extra rows and stops where nothing anywhere wants to move, which on a chain that can separate its training rows arrives long after the useful part. A held-out score costs the rows it is read on and a second measurement every epoch, and section 21 is why it is the only one of the three that stops near the right place.",
                    },
                    {
                      expression: "what is kept from each epoch",
                      reason:
                        "keeping only the numbers at the end costs nothing and makes early stopping impossible, since by the time the held-out curve has turned the epoch you wanted is behind you. Keeping a copy of the chain at the best epoch so far costs one copy. Keeping every epoch costs a copy per epoch and is what lets a run be looked at afterwards at any point without being run again.",
                    },
                    {
                      expression:
                        "whether the step size is one number or one per number",
                      reason:
                        "a single rate is one setting to search, and it has to suit the largest slope in the chain and the smallest at the same time, which is the range Part 2 measures. A rate per number adapts to how large that number’s slopes have been and widens the range that works, at the cost of carrying a running figure alongside every weight from one step to the next.",
                    },
                  ]}
                />
                <p>
                  Written out at its smallest the loop is two lines inside a
                  counter, and none of the five choices is visible in either
                  line. They are all decisions about the counter, about which
                  rows the two lines read, and about when the counter stops.
                </p>
                <Equation>{"repeat, once per epoch:\n\n    measurement  ←  score the chain and walk the blame down\n    chain        ←  move every number against its own slope"}</Equation>
                <KeepInMind>
                  None of the five is arithmetic and all five change where a
                  run ends up, which is how two people running what they
                  describe as the same method can report different numbers
                  without either of them having made a mistake.
                </KeepInMind>
              </SubSection>

              <SubSection title="29. Where the loop stops being defined">
                <p>
                  A loop can be handed settings that are not wrong so much as
                  empty, and it is worth going through them once, because
                  several of them run all the way to the end and hand back a
                  perfectly ordinary number. The table gathers the cases, with
                  what the mathematics says in each.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a step size of zero",
                      reason:
                        "every number moves by zero times its slope, so every number stays where it was and the loss after the step is the loss before it, unchanged by construction rather than by luck. That is what makes it the right control in a search over the setting.",
                    },
                    {
                      expression: "a negative step size",
                      reason:
                        "each number moves along its slope instead of against it, so the walk climbs the loss rather than descending it, taking 0.727078 to 0.737475 in one step. The arithmetic is sound and the direction is the wrong one.",
                    },
                    {
                      expression: "zero epochs",
                      reason:
                        "no step is taken, so the numbers that come back are the numbers that went in, which were drawn at random. There is nothing undefined about it, and what it hands back is a draw rather than a fit.",
                    },
                    {
                      expression: "a batch larger than the training set",
                      reason:
                        "a batch is a subset of the rows, and there is nothing past the last one, so asking for two hundred of sixty gives the sixty. The step is then the ordinary whole-batch step of Part 1 under another name.",
                    },
                    {
                      expression: "a batch of one row",
                      reason:
                        "defined, since the loss is an average and an average over one row is that row. What it costs is the direction, which section 12 measures at 0.073 of agreement with the direction all sixty point in.",
                    },
                    {
                      expression: "a batch of no rows",
                      reason:
                        "an average over no rows is a sum of nothing divided by zero, so there is no loss to report and no slope to step against. This is the one batch size that is not a smaller version of the others.",
                    },
                    {
                      expression:
                        "a chain answering one number against targets two wide",
                      reason:
                        "the loss compares an answer with a truth one pair at a time, and one number does not pair with two, so there is no quantity to minimise. Nothing about the data changes that, since it is a disagreement between the chain and the objective.",
                    },
                    {
                      expression: "fewer targets than rows",
                      reason:
                        "the same pairing failure along the other axis. Sixty answers against thirty truths leaves thirty answers with nothing to be scored against, and an average over a set whose size is in dispute has no value.",
                    },
                    {
                      expression:
                        "a measurement that is not a number among the rows",
                      reason:
                        "arithmetic on it answers with the same non-number, so it spreads through the forward pass into the loss and back down into every slope, and the whole chain is unusable after one step rather than one weight being spoilt.",
                    },
                    {
                      expression: "an infinite measurement among the rows",
                      reason:
                        "an infinity carries through multiplication and addition as an infinity, and the moment it meets a zero or is subtracted from another infinity the result is not a number at all, so one unbounded reading can leave the loss undefined for reasons that have nothing to do with the other fifty-nine rows.",
                    },
                    {
                      expression: "a walk whose numbers stop being finite",
                      reason:
                        "the walk has diverged, which section 9 measures at epoch 155 under squared error at a rate of two. The loss goes first and the weights follow, and once a weight is not a number the chain answers the same thing about everybody, so no later step recovers anything.",
                    },
                    {
                      expression: "two layers whose widths disagree",
                      reason:
                        "composition needs the second layer to read exactly as many numbers as the first answers with, and if the two counts differ there is no function to compose. It is a comparison of two integers, so it can be settled before any row is read.",
                    },
                    {
                      expression: "asking a chain that has not been trained",
                      reason:
                        "perfectly defined, and meaningless. The chain answers 0.2369 about the first person, which is the opinion of the numbers it was drawn with, and nothing in the answer distinguishes it from a trained one.",
                    },
                  ]}
                />
                <KeepInMind>
                  The step size is the setting on this page with no natural
                  bound of its own, since zero, negative and enormous are all
                  arithmetically meaningful and only one of them is ever meant.
                  A loop that does not bound it is trusting whoever writes the
                  number.
                </KeepInMind>
              </SubSection>

              <SubSection title="30. How early each of those can be caught">
                <p>
                  The cases above are not all found at the same moment, and the
                  moment is worth knowing, since a walk that only comes apart
                  on its hundred and fifty-fifth pass has spent a hundred and
                  fifty-four passes looking perfectly healthy. Sorted by how
                  early each of them can be known, they fall into four kinds.
                </p>
                <NumberTable
                  headings={[
                    "what has gone wrong",
                    "the earliest it can be known",
                    "what it depends on",
                  ]}
                  rows={[
                    [
                      "two widths that do not meet",
                      "before any row is read",
                      "the arrangement of the chain alone, which is why it is a comparison of two whole numbers",
                    ],
                    [
                      "no rows to average over",
                      "at the first pass that reads that batch",
                      "how the rows were cut, so a loop can meet it at the last batch of an epoch and nowhere else",
                    ],
                    [
                      "a measurement that is not a number",
                      "at the first pass that reads it",
                      "the data, which is fixed before the walk starts, so one scan settles it",
                    ],
                    [
                      "weights that are no longer numbers",
                      "only partway through a run",
                      "the step size, the objective and the chain together, so no amount of looking at the data sees it coming",
                    ],
                  ]}
                  caption="The last two look alike from a distance and are not the same. The runaway walk of section 9 is the fourth kind, since its measurements were finite the whole way through and what stopped being a number was the chain."
                />
                <p>
                  The first line is the one worth dwelling on, because it is
                  the only failure here that can be settled by looking at the
                  chain and nothing else. A layer reading eight numbers cannot
                  follow a layer answering with five, and no data changes that,
                  so the question can be asked while the chain is being put
                  together rather than hours into a run, which is the argument
                  the shapes page makes at length.
                </p>
                <KeepInMind>
                  A loop that has started at all is already past the first
                  line, since that one is settled before the first row. What it
                  can still meet at epoch 157 is a chain whose numbers have
                  stopped being numbers, and the loss went first, two epochs
                  earlier, which was the only warning there was.
                </KeepInMind>
              </SubSection>

              <SubSection title="31. Where this goes next">
                <p>
                  The plain step of section 2 is the beginning of a long list.
                  Momentum carries part of the previous step into the next one,
                  which helps where the slope points across a narrow valley
                  rather than along it. Per-number step sizes give every one of
                  the twenty-five its own rate, adapted from how large its
                  slopes have been, which is what makes the single global rate
                  of Part 2 less critical. Neither is on this page, and both
                  need the step to widen from taking a rate to taking something
                  carrying state of its own, which is the same problem the
                  layer holding a draw already posed in section 26.
                </p>
                <p>
                  What does not change is the shape of the loop. It measures,
                  it moves, it does that again on some rows, and some rule
                  eventually says to stop. Momentum and the rest change what
                  moving means, early stopping changes what stopping means, and
                  the arrangement of the four is the same arrangement Cauchy
                  described in 1847.
                </p>
                <KeepInMind>
                  The hard parts of training are the two decisions this page
                  measured, how far to move and when to stop, and both of them
                  are settled by measurement rather than by derivation.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
