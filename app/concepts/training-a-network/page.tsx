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
import { BatchSizeComparison } from "@/components/widgets/BatchSizeComparison";
import { EpochReadout } from "@/components/widgets/EpochReadout";
import { OneStepTrace } from "@/components/widgets/OneStepTrace";
import { SeedLedger } from "@/components/widgets/SeedLedger";
import { StepSizeSweep } from "@/components/widgets/StepSizeSweep";
import { TrainingRunPlayground } from "@/components/widgets/TrainingRunPlayground";
import { TwoLossCurves } from "@/components/widgets/TwoLossCurves";

export const metadata: Metadata = {
  title: "Training a Network · Perceptron Lab",
  description:
    "Training repeatedly calculates predictions and measures their errors. Gradients then guide parameter updates, with the update size and sequence of examples affecting how the network changes.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function TrainingANetworkPage() {
  return (
    <ConceptPage
      lessonId="training-a-network"
      intuition={lessonIntuitions["training-a-network"]}
      technicalStart="Part 2. The Size of the Step"
      openingTitle="One Better Guess Is Only the Beginning"
      playgroundTitle="Watch the loss as the network adjusts its parameters"
      playgroundIntro="Compare training and validation curves as the run progresses. Change one training setting at a time and distinguish the number of updates from the number of epochs."
      title="Training a Network"
      tagline={"Training repeatedly calculates predictions and measures their errors. Gradients then guide parameter updates, with the update size and sequence of examples affecting how the network changes."}
      prerequisites={<>The <Link href="/concepts/neurons-and-activations" className={link}>neuron</Link> and <Link href="/concepts/dense-layers" className={link}>dense-layer</Link> pages explain this network’s forward calculation. <Link href="/concepts/loss-functions" className={link}>Loss functions</Link> measure its errors, and <Link href="/concepts/backpropagation" className={link}>backpropagation</Link> calculates the gradients. We will use those gradients repeatedly, compare training and validation results as in <Link href="/concepts/held-out-evaluation" className={link}>held-out evaluation</Link>, and examine how a <Link href="/concepts/dropout" className={link}>dropout layer</Link> keeps its random state. The <Link href="/primers/calculus" className={link}>calculus primer</Link> explains a gradient-descent update.</>}

      playground={<TrainingRunPlayground />}
      sections={[
        {
          title: "Part 1. What One Step Changes",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The crowd, the chain, and what is left to do">
                <p>The example contains sixty observations with two measurements each. Thirty belong to the inner ring and thirty to the surrounding ring. We constructed the rings to make the limitation visible: a straight boundary cannot put the entire inner group on one side and the outer group on the other.</p>
                <p>On these training observations, the linear model has accuracy 0.583. The trained network below reaches 1.000. We will work through how its parameters were adjusted, then examine what these training scores can tell us.</p>
                <p>
                  We have already met the components of this network. Two measurements feed six tanh units, and those activations feed one output unit with no nonlinear activation. The loss compares its prediction with the target, and backpropagation gives a derivative for each of its twenty-five parameters. Now we need to use those derivatives. How large should an update be, which observations should it use, and when have we trained enough?
                </p>
                <p>
                  The training loop controls how we use the calculations. It selects observations for each update, counts passes and records results, then applies a stopping rule. These decisions affect the model we end up with. Section 28 describes the choices and their practical costs.
                </p>
                <KeepInMind>
                  Nothing on this page is a new piece of machinery. The four
                  pieces were built already, and what this page adds is the
                  loop around them and the questions that only come up once
                  they are in one.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. One step, traced through twenty-five numbers">
                <p>Start with randomly initialized weights and zero biases, making twenty-five parameters in total. Run the network forward, measure its loss, and calculate a derivative for each parameter. A gradient-descent update subtracts the learning rate times each derivative. We will inspect one update before repeating it.</p>
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
                    ["the six hidden tangent units", "12", "6", "0.028119", "0.038580"],
                    ["the output unit", "6", "1", "0.084723", "0.004452"],
                  ]}
                  caption="One backward walk on the untrained chain, over all sixty people."
                />
                <p>The largest observed gradients are in the output layer at this initialization. Gradients reaching the hidden layer also pass through output weights and tanh derivatives, which can reduce their magnitudes. Parameter gradients additionally depend on the inputs and how contributions combine across the batch. The output layer need not have the largest gradients in every network or run.</p>
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
                <p>A fixed learning rate can therefore produce different update lengths as the gradient changes. Small gradients make small updates, which may indicate an approach to a stationary point or a region where progress is slow. The same numerical rate can behave differently after changing the loss scale, inputs or architecture.</p>
                <KeepInMind>
                  The learning rate and gradient scale jointly determine update size. If we multiply the entire objective by a constant, dividing the rate by the same constant preserves the basic gradient-descent update. Different problems can also have different curvature, so matching one gradient norm does not establish a suitable rate.</KeepInMind>
              </SubSection>

              <SubSection title="5. What the slope promises, and what the step delivers">
                <p>

                  There is a prediction hidden inside every step. The slope
                  says how fast the loss changes right where it was read, so it
                  also says how much the loss ought to fall for a step of a
                  given size, and the two are not the same number. The slope
                  describes the loss only in the immediate neighborhood of the
                  point it was taken at, and a step carries the chain out of
                  that neighborhood.
                </p>
                <Equation>{"predicted drop  =  rate × ‖slope‖²\n\n0.5 × 0.139819²  =  0.009775\nactual drop      =  0.009155"}</Equation>
                <WhyThisWorks title="Why a sufficiently small negative-gradient step lowers the loss">
                  <p>For a differentiable loss and a nonzero gradient, a small move in the negative-gradient direction reduces the loss to first order. Substituting the update into that linear approximation gives the learning rate times the squared gradient norm as the predicted drop. A sufficiently small positive step reduces the exact loss under these conditions. At a zero gradient, this update does not move.</p>
                </WhyThisWorks>
                <>
<p>
                  The bars in the widget in section 2 are that comparison at eight step sizes, all taken from the same slope at the same untrained chain. At a rate of 0.001 the step delivers 0.9999 of what the slope promised, at 0.05 it delivers 0.9936, at 0.5 it delivers 0.9366, at 1.0 it delivers 0.8735 and at 5.0 it delivers 0.3940.
                </p>
                <p>
                  That is the usual caution about small steps arriving as a measurement, and the useful part of it is that the falling off is gradual, so there is no particular rate at which the slope stops being informative.
                </p>
</>
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
</>),
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
                  is the failure worth being able to recognize, because it
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
                  A small rate may need more updates to make useful progress. At extremely small scales, rounding can also prevent a parameter from changing at all. Compare loss and update magnitudes before deciding whether extra epochs or a larger rate is appropriate.</KeepInMind>
              </SubSection>

              <SubSection title="7. The useful range, and how wide it turns out to be">
                <p>The tested rates from 0.5 through 5 reach useful fits in this run. Every curve starts from the same parameters and uses two hundred epochs, so the comparison isolates the learning rate for this particular initialization. It does not establish that every rate in that interval will work under different starts or settings.</p>
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
                  <p>This broad tested range belongs to this small network and dataset. Stable rates also depend on input scaling, curvature, initialization, activation functions and the objective. Depth can add further difficulties when gradients change substantially across layers. Momentum, adaptive updates and normalization address different parts of these optimization problems; none makes rate selection unnecessary.</p>
                </InAModel>
                <KeepInMind>
                  When the useful rate scale is unknown, test values spaced by factors, such as powers of ten. After locating a useful region, compare closer values. Small numerical differences can matter near an instability threshold, so inspect the curves rather than dismissing them in advance.</KeepInMind>
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
                <p>At a rate of one hundred, loss rises on 77 of the 199 comparisons, reaches 0.550848 at epoch 193 and finishes at 12.186892. The tested log-loss runs remain finite, even though the final fits can be poor. That does not show that arbitrarily large rates are safe. The next section compares how the objective affects these updates.</p>
                <KeepInMind>
                  Repeated loss increases and a final loss far above the best value reached can indicate an unstable learning rate. In minibatch training, some increases can also result from sampling noise. Compare the pattern, update sizes and best checkpoint before changing the rate.</KeepInMind>
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
                <p>The loss becomes non-finite before the parameter update is rejected in these runs. Squaring a large finite residual can overflow while the model parameters are still finite. Subsequent gradients or proposed parameters may then become non-finite too. The API records the first non-finite loss and the later rejection separately; a non-finite loss should already trigger investigation rather than waiting for the parameters to fail.</p>
                <KeepInMind>
                  A step size is only safe or unsafe with respect to a
                  particular objective on a particular chain. The same rate of
                  2.0 is one of the best settings under log-loss here and comes
                  apart at epoch 155 under squared error.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Choosing one, in practice">
                <p>Compare short pilot runs at several learning rates, keeping the initialization and data fixed. Look for meaningful loss reduction, finite values and updates that do not repeatedly undo earlier progress. If a run oscillates strongly, try a smaller rate. If progress is tiny, compare a larger rate while also checking input scale and gradients. A rate selected this way is a starting point to verify across more than one run.</p>
                <DerivationTable
                  expressionHeading="what you see"
                  reasonHeading="what it means, and what to do"
                  rows={[
                    {
                      expression: "the loss is not a number after a few epochs",
                      reason:
                        "check the learning rate, input values and numerical operations. A large rate is one possible cause; reduce it and compare a fresh run.",
                    },
                    {
                      expression: "the loss rises about as often as it falls",
                      reason:
                        "possible instability, especially when the final loss is far above the best reached. Try a smaller rate and account for minibatch noise.",
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
                        "possibly a rate that is too small, but also inspect gradient magnitudes, saturation and input scaling. Compare a larger rate.",
                    },
                  ]}
                />
                <KeepInMind>
                  Recheck the rate after changing the architecture, objective or input scale. Standardizing measurements can make their scales easier to manage, but it does not guarantee stable training or require discarding a previously useful rate without testing it.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "For the first update at learning rate 0.5, what does the gradient predict about the loss change?",
              [
                "A predicted drop of 0.009775 and an actual drop of 0.009155",
                "A predicted drop of 0.009155 and an actual drop of 0.009775",
                "A predicted drop of 0.069910 and an actual drop of 0.009155",
                "Both the same, since the slope is exact at the point it was read",
              ],
              0,
              "The gradient gives a local, first-order estimate of the loss change along the update direction. That predicted decrease depends on the learning rate and squared gradient length. The actual decrease can differ because the gradient changes as the parameters move. The reported parameter displacement of 0.069910 is a distance in parameter space, not a loss decrease.",
            ),
            trueFalse(
              "A step whose actual drop is a poor fraction of its predicted one can still be the step that reached the lowest loss.",
              true,
              "At rate 5.0, the observed decrease is a smaller fraction of the local prediction, yet it is still larger than the decrease at rate 0.5. The ratio measures agreement with a local linear approximation. The final loss measures where the update arrived. A better ratio alone does not select the most useful step size.",
            ),
            choice(
              "Why are the output layer’s slopes the larger ones at the start?",
              [
                "A slope deep in the chain is the slope above it multiplied by the weights it passed through and by the activation’s own slope, and every one of those factors is smaller than one here",
                "The output layer holds more of the twenty-five numbers than the hidden layer does",
                "The step size is applied to the output layer alone",
                "The loss is measured at the output, so only that layer is handed a slope",
              ],
              0,
              "For this initialization and batch, the largest parameter gradient belongs to the output layer. Hidden-layer gradients also depend on the output weights and hidden activation derivatives through the chain rule. Those factors can reduce or amplify a signal, so gradients do not necessarily shrink at every earlier layer. The observed magnitudes are a property of this run.",
            ),
            trueFalse(
              "A step size that is too large always sends the loss off to infinity.",
              false,
              "An excessive learning rate can produce oscillating or worsening loss while every computed value remains finite. That happens in this full-batch cross-entropy run. The last stored pre-update loss is 13.216754; the separately measured final network loss is 4.683362. A different squared-error run becomes non-finite. These are possible failure modes, rather than an exhaustive list.",
            ),
            several(
              "Which of these are signatures of a step size that is too large, as measured on this chain under log-loss?",
              [
                              "The loss rises about as often as it falls, on 100 of the 199 consecutive readings at a rate of 20",
                              "The best loss the walk ever reached, 0.591843 at epoch 127, is far below the 13.216754 it finished at",
                              "The loss falls on every epoch, by a tiny amount each time",
                              "Every number in the chain stops being a number within a few epochs",
                            ],
              [0, 1],
              "The run repeatedly loses progress, and its final reading is much worse than its best. Those are reasons to reduce the step size here. A slowly falling loss is compatible with steps that are too small, but can have other causes. Nonfinite values occurred under a different squared-error run, so they are not required for an excessive step size to be harmful.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Same chain, log-loss, step size 20, 200 readings:\nloss increases: 100 of 199 consecutive comparisons\nlowest recorded loss: 0.591843 at epoch 127\nlast recorded loss: 13.216754\nall weights remain finite during this log-loss run"
              },
            ),
        ],
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
                <p>A full-batch step uses every training row. A single-example step uses one row, connecting this loop to online methods such as the perceptron and the stochastic-approximation work of Robbins and Monro. Minibatches lie between those extremes. Here we reshuffle each epoch and take consecutive slices, visiting each row once. Reshuffling changes the groupings, but it does not guarantee that a particular batch can never recur.</p>
                <KeepInMind>
                  Dataset size, batch size and epoch budget are separate settings with connected effects. Dataset size and batch size determine how many updates make one complete pass, while the epoch budget determines how many such passes the run attempts.</KeepInMind>
              </SubSection>

              <SubSection title="12. What a small batch does to the direction">
                <p>At fixed parameters, averaging gradients from a uniformly sampled batch gives an unbiased estimate of the full-data gradient. A particular sample can still point in a very different direction. The chart measures that difference using the cosine of the angle between the batch gradient and the full-data gradient. Unbiased gradient components do not imply an unbiased or small angle.</p>
                <BatchSizeComparison showAgreement={true} />
                <>
<p>
                  The bars are the cosine of that angle at the untrained chain, averaged over two hundred draws. A batch of every row agrees with the whole crowd exactly, at 1.000, since it is the same calculation. A batch of thirty averages 0.780, a batch of fifteen 0.546, a batch of five 0.332 and a batch of one only 0.073, which is very nearly a right angle.
                </p>
                <p>The worst single-example draw has cosine agreement −0.785, about a hundred and forty-two degrees from the full-data gradient. For a sufficiently small negative-gradient step on that draw, the first-order prediction is an increase in the full-data loss. The angle alone does not measure the exact change after a finite update.</p>
</>
                <p>One sampled batch of thirty has cosine agreement −0.0009, nearly perpendicular to the full-data gradient. Even half this dataset can therefore give a substantially different update direction at this parameter state. Further steps use new batches and also change the parameters, so each estimate must be interpreted where it was measured.</p>
                <KeepInMind>
                  For this initial network, the one-example gradients have low average directional agreement with the full-data gradient. They are still estimates of that gradient under uniform sampling. Stochastic updates can make progress over many draws, but their errors do not cancel exactly along a trajectory whose parameters keep changing.</KeepInMind>
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
                <p>The one-example run finishes with a loss about a hundred and seventy times lower than the full-batch run, while taking sixty times as many updates. Both visit the same number of examples over sixty epochs. Smaller batches change the update frequency and path, as well as the processing overhead. Section 16 compares ways to hold the training budget fixed.</p>
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
                <p>These runs do not demonstrate a generalization benefit from minibatch noise. They evaluate loss on all sixty training examples after each epoch, so the curves use a fixed measurement set. Differences between them come from the parameter trajectories, not from changing the rows used to score each point. Enough updates let each tested batch size reach perfect training accuracy; that result does not establish performance on new examples.</p>
                <KeepInMind>
                  Minibatch noise can alter the optimization path, and in some problems it helps leave a stationary region. This experiment does not isolate that benefit. It compares trajectories, update counts and costs on one small dataset, so we should keep those findings separate from claims about generalization or escaping local minima.</KeepInMind>
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
                <p>In this measurement, sixty times as many updates take thirty-seven times as long. Larger networks and different hardware can have different ratios. A GPU may process a larger batch efficiently by doing more operations in parallel, while memory limits can favor smaller batches. Measure useful progress per unit of time on the hardware and model you intend to use.</p>
                <KeepInMind>
                  How much a batch size costs is a fact about the machine it
                  runs on, so it has to be measured there rather than reasoned
                  about from the method.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Which comparison you are making">
                <p>To compare batch sizes, decide what budget to hold fixed. Equal epochs compare progress after equal passes over the data. Equal updates compare progress per optimization step. Equal elapsed time compares progress within a time budget. These answer different practical questions, and data access, memory or monetary cost may matter too.</p>
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
                        "every tested batch size has completed at least one epoch. The whole-batch run has made sixty full passes; the single-example run has made one. Equal update counts therefore involve different amounts of data processing.",
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
                <p>For the full-batch run shown here, each reading stores the loss measured before that update. The first reading is therefore the untrained loss. After two hundred updates, the last stored reading is 0.135431, while a fresh measurement of the returned network is 0.134309. Other logging loops may record after updates or average minibatch measurements, so check the convention.</p>
                <KeepInMind>
                  A logged loss and a final-model measurement can differ because they were evaluated before and after different updates. State when each curve is measured instead of assuming that every training library uses the same one-step offset.</KeepInMind>
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
                <>
<p>
                  The loss falls smoothly across the whole run. The accuracy does not, sitting flat for long stretches and then stepping up, because it only counts which side of a half each answer landed on while the loss cares how far from the truth each answer is. A chain can spend fifty epochs becoming more confident about people it was already calling correctly, which lowers the loss and moves the accuracy not at all.
                </p>
                <p>
                  And the largest slope rises before it falls, peaking at 0.084723 in the very first epoch, dropping to 0.024 by epoch 25, rising again to 0.052 by epoch 75 as the chain learns the nonlinear relationship it needs, and settling to 0.028 by the end.
                </p>
</>
                <KeepInMind>
                  The largest absolute parameter gradient helps identify whether this objective is locally sensitive to any parameter. A small gradient can indicate a stationary point, but that point may be a minimum, a saddle or a flat region with poor predictions. A rounded-flat loss curve can also hide gradients that still produce meaningful updates.</KeepInMind>
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
                <p>The training loss is still falling when this run ends. Once the classes are separated, cross-entropy can continue rewarding more confident predictions, although numerical limits or other settings may eventually stop that decrease. We need a stopping rule: a training budget, a gradient criterion or a validation measure. A validation measure addresses performance on examples the updates did not use.</p>
                <KeepInMind>
                  Continued reduction of training loss does not establish that more training improves predictions on new data. A model may fit details specific to its training examples. Validation gives a separate measurement to compare with that training progress.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Averaged over two hundred draws at the untrained chain, how well does a batch of one point where all sixty point?",
              [
                "A cosine of 0.073, which is very nearly a right angle",
                "A cosine of 0.332",
                "A cosine of 0.546",
                "A cosine of 0.780",
              ],
              0,
              "Larger batches agree more closely with the full-batch gradient on average in these sampled draws. An individual one-person gradient can point in a direction that initially increases the full-batch loss. That comparison concerns the local derivative of the full-batch objective; it does not by itself measure a finite step’s effect on each of the other fifty-nine observations.",
            ),
            trueFalse(
              "The run reading one person at a time finished at a loss a hundred and seventy times lower than the run reading all sixty, which shows a small batch is better.",
              false,
              "It got there by taking sixty times as many steps, so what the table shows is that an epoch is a much bigger unit of work once it is cut into pieces. Comparing batch sizes at a fixed number of epochs compares runs that took very different numbers of steps, which is a legitimate comparison and not the only one, and a chart that does not say which axis it fixed cannot be read.",
            ),
            several(
              "Which of these hold about what a small batch costs here?",
              [
                "Sixty times the steps cost thirty-seven times the time rather than sixty",
                "This implementation has per-step overhead that is not proportional to the number of rows",
                "The same timing ratio need not hold for a large network on a GPU",
                "A step on one row costs a sixtieth of a step on sixty rows"
              ],
              [0, 1, 2],
              "Single-row steps are not sixty times faster, because they still pay per-step overhead. The 3,600-step run takes about 37 times the total time of the 60-step run on this machine. Larger matrix operations, accelerator utilization and framework overhead can give another setup different ratios.",
              {
                "description": "This is one measurement on the lesson’s small CPU network. Total time and fixed overhead are specific to this implementation and machine.",
                "data": "rows per step | steps in all | milliseconds a step | milliseconds in all\n1 | 3600 | 0.153 | 552\n5 | 720 | 0.162 | 116\n15 | 240 | 0.174 | 42\n30 | 120 | 0.213 | 26\n60 | 60 | 0.248 | 15"
              },
            ),
            trueFalse(
              "The loss a run reports after an epoch belongs to the chain as it stood before that epoch’s step.",
              true,
              "The backward walk measures on its way forward, so the first reading of a run is the untrained loss and a run of two hundred epochs reports 0.135431 as its last reading while the chain it finishes with stands at 0.134309. A loss curve is offset by one step from the chain that produced it, and it matters exactly when someone compares the last point of a curve with a separately measured final loss.",
            ),
            choice(
              "What does the largest absolute parameter gradient tell us that a rounded training loss can hide?",
              [
                "It reports the largest local coordinate sensitivity, which may still be appreciable when the displayed loss looks unchanged.",
                "It falls steadily from the first epoch to the last",
                "It reaches zero exactly when the accuracy reaches one",
                "It is the only one of the three readings that needs no extra data",
              ],
              0,
              "A loss can appear unchanged at the displayed precision while some parameter gradients remain appreciable. The largest absolute gradient reports the steepest coordinate direction at the current parameters. It can help diagnose optimization, but a small value does not prove a global minimum or good validation performance. Read it alongside the unrounded loss and the task’s validation results.",
            ),
        ],
        },
        {
          title: "Part 5. What the Loss Curve Hides",
          content: (
            <>
              <SubSection title="20. Two losses, and only one a loop can see">
                <p>Use fourteen of the sixty observations for updates, with seven from each group. Keep the other forty-six out of those updates and score them after every epoch. The training and validation losses can then be compared directly. The validation loss supplies information that cannot be recovered from the training curve alone.</p>
                <p>This experiment uses eight hidden tanh units and thirty-three parameters. Three of the fourteen training labels are flipped, introducing labels that contradict the original ring pattern. The run below eventually classifies all fourteen training labels correctly, letting us inspect what happens to validation performance as that fit develops.</p>
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
                  Training and validation losses measure different sets of examples. A loop can record both, but only the training examples determine the parameter gradients here. A falling training curve does not tell us whether validation performance is improving.</KeepInMind>
              </SubSection>

              <SubSection title="21. The epoch the walk should have stopped at">
                <p>The lowest validation loss in this run occurs at epoch 73, when training loss is 0.3070 and still falling. Every later recorded epoch lowers training loss while raising validation loss. If validation loss is our selection measure, epoch 73 is the checkpoint we would keep from this completed run.</p>
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
                  caption="One run, both sets scored at every epoch. Training loss falls throughout, while validation loss reaches its minimum around epoch 73 and then rises. Accuracy follows a different pattern."
                />
                <p>Early stopping uses validation results to decide which parameter checkpoint to keep. Save the parameters whenever the selected validation measure improves, then stop after a chosen period without sufficient improvement. Prechelt’s 1998 chapter examines the practical question of how long that period should be.</p>
<p>Because these held-out examples influence checkpoint selection, they form a validation set. Use a separate test set when you need an evaluation that was not also used to choose the model.</p>
                <KeepInMind>
                  A budget limits training cost, a gradient threshold checks local optimization progress, and validation-based stopping checks a selected performance measure on other examples. Choose the rule for the question you need to answer, and record which checkpoint is returned.</KeepInMind>
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
                <p>Accuracy counts correct class decisions; cross-entropy also responds to their assigned probabilities. A model can become more confident in a wrong decision, increasing loss without changing accuracy. State which validation measure selects the checkpoint so the result can be interpreted and compared.</p>
                <KeepInMind>
                  Choose the validation measure based on the intended use before comparing runs. Selecting whichever metric looks best afterward introduces another model-selection choice. Keep a separate test evaluation if you need to estimate performance after those choices.</KeepInMind>
              </SubSection>

              <SubSection title="23. Without flipped labels the curve flattens rather than turning">
                <p>{"The clearly rising held-out curve uses three flipped labels. With the original labels, the curve mostly flattens instead. Its minimum held-out loss is 0.2469 at epoch 256; it rises on every one of the following three hundred and forty-four epochs, by 0.0113 in total. Held-out accuracy reaches 0.9130 at epoch 131 and remains exactly 0.9130 at epoch 600. A small loss change and an unchanged accuracy can therefore describe the same run."}</p>
                <p>In these two runs, changing three training labels substantially changes the validation curve. The corrupted-label run reaches lower training loss while validation performance deteriorates. With the original labels, validation loss improves longer and then changes only slightly. Both finish with training loss below 0.1, so that final training value alone does not distinguish their behavior.</p>
                <KeepInMind>
                  Validation loss need not show a dramatic turn. It can flatten or change by less than a useful improvement threshold. Define patience and the minimum change you consider meaningful, and account for noise in the measurement.</KeepInMind>
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
                  We can vary the initial parameter draw separately from the order in which training rows are visited. The experiment below repeats one configuration, then changes one seed at a time. That lets us inspect what reproducibility means for this implementation and how much each random choice affects the result.
                </p>
                <SeedLedger show="runs" />
                <p>
                  Repeating the same configuration gives 0.05945412 both times. Changing only the row-order seed gives 0.05903582 with the same initial weights. In the full-batch comparison, both order seeds give 0.53659416. Row order changes which observations contribute to intermediate minibatch updates, whereas these full-batch runs use the complete group for each update.
                </p>
                <KeepInMind>
                  For these full-batch runs, reshuffling leaves the same examples in each update and gives matching displayed results. In floating-point arithmetic, a different accumulation order can still cause small rounding differences. Minibatches can have much larger order effects because their intermediate updates use different groups of rows.</KeepInMind>
              </SubSection>

              <SubSection title="25. Four starts, four different places">
                <p>Fixing all random choices can make this implementation repeat a run. Choosing a seed does not guarantee that the resulting fit is a good one. The objective is nonconvex, so different initial parameters can follow different paths and finish at different losses under the same update settings. The next comparison changes only the initialization seed.</p>
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
                  <p>A single-seed run reports what happened from that initialization. Repeating with several seeds helps measure how sensitive the result is to starting conditions. These four runs show a meaningful spread in final loss. When comparing a small change to the method, report enough repetitions to distinguish its effect from that variation.</p>
                </InAModel>
                <KeepInMind>
                  A seed makes a run reproducible. It does not make it
                  representative, and those are separate properties that the
                  word deterministic runs together.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. A layer that draws has to survive the step">
                <p>Dropout keeps a random generator as part of its state. Recreating the layer from the same seed before every pass resets that generator. If the draws have the same shape, each pass then receives the same mask. To keep sampling a sequence of masks, preserve or advance the generator state across updates.</p>
                <SeedLedger show="draws" />
                <>
<p>The left experiment carries one dropout layer through four passes and obtains four different masks. The right experiment recreates the layer from its seed before each pass, producing the same mask four times. Persistently reusing that mask removes the same activations in this demonstration, rather than sampling a new set each pass.</p>
                <p>This SDK carries the dropout layer forward so its generator keeps advancing. Another design could rebuild the object while preserving the current generator state. The requirement is continuity of that state, rather than reuse of one particular object identity.</p>
</>
                <KeepInMind>
                  Random draws can be reproduced from a generator state. Training must retain the intended state progression rather than resetting the seed on every step. This SDK does that by keeping the dropout layer between updates.</KeepInMind>
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
                        "reusing a fixed order keeps the same batch groupings each epoch. Reshuffling changes those groupings and the resulting update sequence. Section 24 compares order seeds; full-batch updates use all rows, apart from possible accumulation-order rounding differences.",
                    },
                    {
                      expression: "how many rows a step reads",
                      reason:
                        "the whole set gives the direction all the data agrees on and one step per pass. A small batch gives many more steps and a direction that can be almost unrelated to that one, at 0.073 of agreement for a single person in section 12, and it costs the work around a step over again each time, which section 15 measures at 0.62 of a whole-batch step for a step on one row.",
                    },
                    {
                      expression: "when to stop",
                      reason:
                        "a fixed budget limits cost. A gradient threshold checks local stationarity on the measured objective. A validation measure checks performance on examples excluded from updates and adds evaluation work. Each rule answers a different stopping question.",
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
                        "a global rate scales every parameter gradient equally. Adaptive methods use per-parameter state to change that scaling based on past gradients. They can help with differing scales, but still require a global rate and other settings to be checked.",
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

              <SubSection title="29. Training settings that produce no useful update" id="29-where-the-loop-stops-being-defined">
                <p>
                  Some settings allow the loop to run while preventing useful learning. The table shows what happens in each case and which conditions should be checked explicitly.
                </p>
                <DerivationTable
                  expressionHeading="Training setting"
                  reasonHeading="What changes in the training run"
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
                        "the loss compares an answer with a truth one pair at a time, and one number does not pair with two, so there is no quantity to minimize. Nothing about the data changes that, since it is a disagreement between the chain and the objective.",
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
                        "the layer’s incoming-value check rejects a non-finite measurement before it enters the forward calculation.",
                    },
                    {
                      expression: "an infinite measurement among the rows",
                      reason:
                        "the layer’s incoming-value check rejects an infinite measurement before the network computes predictions.",
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
                        "defined: the initial chain outputs 0.2369 for the first person. That numerical result does not establish a fitted or reliable prediction; evaluate the model state rather than inferring training from the output format.",
                    },
                  ]}
                />
                <KeepInMind>
                  For descent, this API requires a positive finite learning rate within its configured bound. A zero rate is useful as a no-update control in a separate experiment; a negative rate reverses the local direction. Very large finite rates can still produce unstable or overflowing updates, so valid input is not a guarantee of successful optimization.</KeepInMind>
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
                <>
<p>
                  The plain step of section 2 is the beginning of a long list. Momentum carries part of the previous step into the next one, which helps where the slope points across a narrow valley rather than along it. Per-number step sizes give every one of the twenty-five its own rate, adapted from how large its slopes have been, which is what makes the single global rate of Part 2 less critical.
                </p>
                <p>
                  Neither is on this page, and both need the step to widen from taking a rate to taking something carrying state of its own, which is the same problem the layer holding a draw already posed in section 26.
                </p>
</>
                <p>The loop still produces predictions, measures the objective and applies an update repeatedly. Momentum and adaptive methods change the update and maintain additional optimizer state. Early stopping changes how checkpoints are selected. These methods extend gradient-based optimization rather than making a different kind of prediction problem.</p>
                <KeepInMind>
                  The hard parts of training are the two decisions this page
                  measured, how far to move and when to stop, and both of them
                  are settled by measurement rather than by derivation.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            choice(
              "Fourteen people, eight hidden units, three labels flipped. Where should the walk have stopped, and what was the training loss doing there?",
              [
                "Epoch 73, where the training loss stood at 0.3070 and was still falling",
                "Epoch 73, where the training loss had flattened out",
                "Epoch 51, where the training loss reached its lowest point",
                "Epoch 600, since the training loss fell on every one of the six hundred",
              ],
              0,
              "The held-out loss reaches its lowest point of 0.5354 at epoch 73 and then rises on every epoch after it, all the way to 1.6472, while the training loss falls on all six hundred without exception. Epoch 73 is invisible from inside, since nothing about the training loss announces anything there. Epoch 51 is where the held-out accuracy is highest, which is a different stopping point on the same run.",
            ),
            trueFalse(
              "With the labels as they were drawn rather than flipped, the held-out curve flattens instead of turning.",
              true,
              "The held-out loss reaches 0.2469 at epoch 256 and rises over the three hundred and forty-four epochs after it by 0.0113 in total, and the held-out accuracy reaches 0.9130 at epoch 131 and is still exactly 0.9130 at epoch 600. The training loss cannot tell the two cases apart, finishing under 0.1 in both, so waiting for a visible turn will run a clean-label fit far longer than it needed.",
            ),
            several(
              "Which of these hold of what a seed fixes on this chain?",
              [
                              "Two identical requests, in batches of ten, land on 0.05945412 and 0.05945412, the same to the last bit",
                              "Changing only the order the rows are visited in changes nothing whatever when the run takes the whole crowd in one batch",
                              "Four draws of the starting numbers under the identical loop end up somewhere different each time",
                              "A seed that makes a run reproducible also makes it representative",
                            ],
              [0, 1, 2],
              "Both full-batch runs produce 0.53659416 in this experiment. With batches of ten, changing row order gives a final loss of 0.05903582 because it changes the intermediate updates. Initialization matters too: three of four starting draws classify every person correctly, while the fourth reaches 0.9667 with a loss about half again as large as the best. A fixed seed repeats one run; it does not show that the run represents all plausible starts. Floating-point reduction order can also matter in other full-batch implementations.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Same starting weights, batches of 10, final loss:\nidentical requests: 0.05945412 and 0.05945412\nchanged row-order seed only: 0.05903582\n\nFull batch of 60, two row-order seeds: 0.53659416 and 0.53659416\nFour initial-weight draws under the same loop give different final fits.\nThese are this experiment’s observations, not bitwise guarantees for all implementations."
              },
            ),
            choice(
              "Why must a layer that silences a random share of its units be carried through the step rather than rebuilt from its settings?",
              [
                "Rebuilding it rebuilds its generator at the same position, so the next pass draws exactly what the last one drew",
                "Its numbers cannot be read off without a forward pass",
                "Its slopes are larger than any other layer’s",
                "It holds no numbers to move, so a step would delete it",
              ],
              0,
              "Dropout carries a random-generator state between training passes. Rebuilding it from the same seed before every pass restarts that sequence and repeats the same mask in this example. Preserving the evolving state allows new masks to be drawn. An implementation can preserve that state in several ways; random draws are reproducible when their generator state is known.",
            ),
            choice(
              "Of the ways a training loop can fail, which one can be settled by looking at the chain alone, before a single row is read?",
              [
                "Two layers whose widths disagree, since a layer reading eight numbers cannot follow one answering with five and no data changes that",
                "A step size that is too large, since the loss then rises about as often as it falls",
                "A walk whose numbers stop being numbers partway through, since the loss goes first",
                "A batch larger than the training set, which the loop hands back whole",
              ],
              0,
              "Incompatible adjoining layer shapes can be detected from the network’s declared dimensions before any data is evaluated. Optimization failures, such as non-finite loss or gradients, require evaluating the actual calculations. In this batch API, requesting more rows than the dataset contains returns the available set rather than causing a shape failure.",
            ),
        ],
        },
        {
          title: "Practice. Running the Loop With the Library",
          practice: [
            exercise(
              "Take one step from the untrained chain",
              ["The backpropagation challenge inspected a fixed network. Here the supplied seeds create the sixty labeled people and the initial trainable network reproducibly. Calculate one backward pass and apply one update at learning rate 0.5.","Print the first hidden connection's old weight, gradient and updated weight, together with the largest gradient and losses before and after the update. Measure the updated network again rather than treating the old loss as its new loss."],
              `import numpy as np
from oop_ml import BinaryCrossEntropy, DenseLayer, HyperbolicTangent, Identity, LayerStack, Neuron

people = np.random.default_rng(7)
rows, labels = [], []
for radius, label in ((0.55, 0), (1.5, 1)):
    angles = people.uniform(0.0, 2.0 * np.pi, 30)
    spread = radius + people.normal(0.0, 0.09, 30)
    rows.append(np.column_stack([spread * np.cos(angles), spread * np.sin(angles)]))
    labels.append(np.full(30, float(label)))
rows, labels = np.vstack(rows), np.concatenate(labels)
targets = labels.reshape(-1, 1)
loss = BinaryCrossEntropy()

weights = np.random.default_rng(1)
hidden = DenseLayer([Neuron(weights.normal(0.0, 1.0, 2), bias=0.0, activation=HyperbolicTangent()) for _ in range(6)])
output = DenseLayer([Neuron(weights.normal(0.0, (2.0 / 6) ** 0.5, 6), bias=0.0, activation=Identity())])
network = LayerStack([hidden, output])

# Run one backward pass, step the chain by 0.5, and print the loss before and
# after, the first hidden unit's first weight before, its slope, and its value
# after, and the largest slope anywhere in the chain.`,
              `import numpy as np
from oop_ml import BinaryCrossEntropy, DenseLayer, HyperbolicTangent, Identity, LayerStack, Neuron

people = np.random.default_rng(7)
rows, labels = [], []
for radius, label in ((0.55, 0), (1.5, 1)):
    angles = people.uniform(0.0, 2.0 * np.pi, 30)
    spread = radius + people.normal(0.0, 0.09, 30)
    rows.append(np.column_stack([spread * np.cos(angles), spread * np.sin(angles)]))
    labels.append(np.full(30, float(label)))
rows, labels = np.vstack(rows), np.concatenate(labels)
targets = labels.reshape(-1, 1)
loss = BinaryCrossEntropy()

weights = np.random.default_rng(1)
hidden = DenseLayer([Neuron(weights.normal(0.0, 1.0, 2), bias=0.0, activation=HyperbolicTangent()) for _ in range(6)])
output = DenseLayer([Neuron(weights.normal(0.0, (2.0 / 6) ** 0.5, 6), bias=0.0, activation=Identity())])
network = LayerStack([hidden, output])

backward = network.backward_pass(rows, targets, loss)
stepped = network.stepped_by(backward, 0.5)
after = stepped.backward_pass(rows, targets, loss)

print(f"loss before {backward.loss:.6f}")
print(f"loss after one step {after.loss:.6f}")
print(f"first hidden weight before {network[0].weight_matrix[0, 0]:.6f}")
print(f"its slope {backward[0].weights[0, 0]:.6f}")
print(f"first hidden weight after {stepped[0].weight_matrix[0, 0]:.6f}")
print(f"largest slope anywhere {backward.largest_movement:.6f}")`,
              `loss before 0.727078
loss after one step 0.717923
first hidden weight before 0.345584
its slope 0.028119
first hidden weight after 0.331525
largest slope anywhere 0.084723`,
              { hints: ["The starting weights are drawn with a spread of the square root of two over the fan-in, which is 1 for the two measurements and the root of a third for the six hidden units, in the order the neurons are built. The seed of 1 is what makes the page’s numbers quotable.", "backward_pass measures the loss on its way forward and answers one gradient per layer, so the loss before the step is on the backward pass itself and the hidden layer’s slopes are at position 0.", "stepped_by hands back a new chain. Measuring the loss after the step means running a second backward pass on that chain, or a forward pass and the loss, and reading its loss."], check: numberCheck("What is the loss on all sixty people after one step at 0.5?", 0.717923, 1e-05, "The measured loss decreases after this update on the supplied batch. The gradient described the local behavior before the step; a finite step need not produce exactly its linear prediction of the loss change. Subsequent updates must recalculate derivatives at the new parameters."), question: "What changes after the first supervised update of this network?" },
            ),
            exercise(
              "Run two hundred epochs and read the curve",
              ["Repeat the supervised update for 200 epochs at learning rate 0.5, using all sixty people in every epoch. Save the loss from each backward pass before applying that epoch's update.","Print the requested sampled epochs, the final network's separately measured loss, and the first recorded epoch below the supplied threshold. The last recorded pre-update loss and the final post-update loss describe different parameter states."],
              `import numpy as np
from oop_ml import BinaryCrossEntropy, DenseLayer, HyperbolicTangent, Identity, LayerStack, Neuron

people = np.random.default_rng(7)
rows, labels = [], []
for radius, label in ((0.55, 0), (1.5, 1)):
    angles = people.uniform(0.0, 2.0 * np.pi, 30)
    spread = radius + people.normal(0.0, 0.09, 30)
    rows.append(np.column_stack([spread * np.cos(angles), spread * np.sin(angles)]))
    labels.append(np.full(30, float(label)))
rows, labels = np.vstack(rows), np.concatenate(labels)
targets = labels.reshape(-1, 1)
loss = BinaryCrossEntropy()

weights = np.random.default_rng(1)
hidden = DenseLayer([Neuron(weights.normal(0.0, 1.0, 2), bias=0.0, activation=HyperbolicTangent()) for _ in range(6)])
output = DenseLayer([Neuron(weights.normal(0.0, (2.0 / 6) ** 0.5, 6), bias=0.0, activation=Identity())])
network = LayerStack([hidden, output])

readings = []
# Loop for two hundred epochs: run the backward pass, step by 0.5, and append
# the loss the backward pass measured. Then print the readings at epochs 1, 50,
# 100 and 200, the loss of the finished chain, and the first epoch whose
# reading is below 0.2.`,
              `import numpy as np
from oop_ml import BinaryCrossEntropy, DenseLayer, HyperbolicTangent, Identity, LayerStack, Neuron

people = np.random.default_rng(7)
rows, labels = [], []
for radius, label in ((0.55, 0), (1.5, 1)):
    angles = people.uniform(0.0, 2.0 * np.pi, 30)
    spread = radius + people.normal(0.0, 0.09, 30)
    rows.append(np.column_stack([spread * np.cos(angles), spread * np.sin(angles)]))
    labels.append(np.full(30, float(label)))
rows, labels = np.vstack(rows), np.concatenate(labels)
targets = labels.reshape(-1, 1)
loss = BinaryCrossEntropy()

weights = np.random.default_rng(1)
hidden = DenseLayer([Neuron(weights.normal(0.0, 1.0, 2), bias=0.0, activation=HyperbolicTangent()) for _ in range(6)])
output = DenseLayer([Neuron(weights.normal(0.0, (2.0 / 6) ** 0.5, 6), bias=0.0, activation=Identity())])
network = LayerStack([hidden, output])

readings = []
for epoch in range(1, 201):
    backward = network.backward_pass(rows, targets, loss)
    network = network.stepped_by(backward, 0.5)
    readings.append(backward.loss)

for epoch in (1, 50, 100, 200):
    print(f"loss reported at epoch {epoch} {readings[epoch - 1]:.4f}")
print(f"loss of the finished chain {network.backward_pass(rows, targets, loss).loss:.6f}")
first_below = next(epoch for epoch, value in enumerate(readings, start=1) if value < 0.2)
print(f"first reading below 0.2 at epoch {first_below}")`,
              `loss reported at epoch 1 0.7271
loss reported at epoch 50 0.5893
loss reported at epoch 100 0.3604
loss reported at epoch 200 0.1354
loss of the finished chain 0.134309
first reading below 0.2 at epoch 159`,
              { hints: ["The loop is two lines inside a counter, a backward pass and a step, and the stepped chain replaces the old one each time round.", "The loss on a backward pass belongs to the chain as it stood before that step, so the last reading of two hundred is not the loss of the chain you finish with. One more backward pass on the finished chain gives that.", "enumerate with start=1 numbers the readings by epoch, and next with a generator finds the first one that satisfies the condition."], check: numberCheck("At which epoch does the reported loss first fall below 0.2?", 159, 0.5, "The first threshold crossing is an observation about this seeded run. The recorded loss is measured before each update, so its epoch numbering must stay aligned with that convention. A perfect classification accuracy can coexist with further changes in probability-based loss."), question: "How do repeated full-batch updates change the recorded training loss?" },
            ),
            exercise(
              "Watch a rate of twenty thrash",
              ["Reset to the same seeded network and data, then repeat the 200-epoch loop with learning rate 20. Count how many consecutive pre-update loss readings increase.","Print the rise count, the best recorded loss and its epoch, the last recorded loss, and a separate loss measurement on the final updated network. Check whether the arithmetic remains finite as well as whether the run is useful."],
              `import numpy as np
from oop_ml import BinaryCrossEntropy, DenseLayer, HyperbolicTangent, Identity, LayerStack, Neuron

people = np.random.default_rng(7)
rows, labels = [], []
for radius, label in ((0.55, 0), (1.5, 1)):
    angles = people.uniform(0.0, 2.0 * np.pi, 30)
    spread = radius + people.normal(0.0, 0.09, 30)
    rows.append(np.column_stack([spread * np.cos(angles), spread * np.sin(angles)]))
    labels.append(np.full(30, float(label)))
rows, labels = np.vstack(rows), np.concatenate(labels)
targets = labels.reshape(-1, 1)
loss = BinaryCrossEntropy()

weights = np.random.default_rng(1)
hidden = DenseLayer([Neuron(weights.normal(0.0, 1.0, 2), bias=0.0, activation=HyperbolicTangent()) for _ in range(6)])
output = DenseLayer([Neuron(weights.normal(0.0, (2.0 / 6) ** 0.5, 6), bias=0.0, activation=Identity())])
network = LayerStack([hidden, output])

readings = []
# Loop for two hundred epochs at a rate of 20, recording each backward pass's
# loss. Then print how many consecutive readings rose, the lowest reading and
# its epoch, the last reading, and the loss of the finished chain.`,
              `import numpy as np
from oop_ml import BinaryCrossEntropy, DenseLayer, HyperbolicTangent, Identity, LayerStack, Neuron

people = np.random.default_rng(7)
rows, labels = [], []
for radius, label in ((0.55, 0), (1.5, 1)):
    angles = people.uniform(0.0, 2.0 * np.pi, 30)
    spread = radius + people.normal(0.0, 0.09, 30)
    rows.append(np.column_stack([spread * np.cos(angles), spread * np.sin(angles)]))
    labels.append(np.full(30, float(label)))
rows, labels = np.vstack(rows), np.concatenate(labels)
targets = labels.reshape(-1, 1)
loss = BinaryCrossEntropy()

weights = np.random.default_rng(1)
hidden = DenseLayer([Neuron(weights.normal(0.0, 1.0, 2), bias=0.0, activation=HyperbolicTangent()) for _ in range(6)])
output = DenseLayer([Neuron(weights.normal(0.0, (2.0 / 6) ** 0.5, 6), bias=0.0, activation=Identity())])
network = LayerStack([hidden, output])

readings = []
for epoch in range(1, 201):
    backward = network.backward_pass(rows, targets, loss)
    network = network.stepped_by(backward, 20.0)
    readings.append(backward.loss)

rises = sum(1 for earlier, later in zip(readings, readings[1:]) if later > earlier)
lowest = min(readings)
print(f"readings that rose {rises} of {len(readings) - 1}")
print(f"lowest reading {lowest:.6f} at epoch {readings.index(lowest) + 1}")
print(f"last reading {readings[-1]:.6f}")
print(f"loss of the finished chain {network.backward_pass(rows, targets, loss).loss:.6f}")`,
              `readings that rose 100 of 199
lowest reading 0.591843 at epoch 127
last reading 13.216754
loss of the finished chain 4.683362`,
              { hints: ["Only the rate changes from the previous problem. The chain, the people and the loop are the same.", "zip the readings against themselves shifted by one to compare each reading with the next, and count the pairs where the later one is larger.", "The last reading belongs to the chain before its final step, so the finished chain’s loss is a separate measurement and here it is a very different number."], check: numberCheck("On how many of the 199 consecutive readings did the loss rise?", 100, 0.5, "Frequent rises and a poor final state show that this large rate behaves badly in this deterministic full-batch experiment. Finite numbers alone do not establish successful optimization. The final post-update measurement can differ substantially from the last stored pre-update reading."), question: "What happens when the same network takes much larger updates?" },
            ),
            exercise(
              "Hold forty-six people back and watch two curves",
              ["Fit the supplied eight-hidden-unit network using only the fourteen training people and their deliberately corrupted labels. After each epoch, also measure loss on the other forty-six people without applying an update from their gradients.","Record the training and held-out losses with their epoch numbers and find the epoch with the smallest held-out loss. Because these observations choose when to stop, they are a validation set; a final independent performance claim would require another untouched test set."],
              `import numpy as np
from oop_ml import BinaryCrossEntropy, DenseLayer, HyperbolicTangent, Identity, LayerStack, Neuron

people = np.random.default_rng(7)
rows, labels = [], []
for radius, label in ((0.55, 0), (1.5, 1)):
    angles = people.uniform(0.0, 2.0 * np.pi, 30)
    spread = radius + people.normal(0.0, 0.09, 30)
    rows.append(np.column_stack([spread * np.cos(angles), spread * np.sin(angles)]))
    labels.append(np.full(30, float(label)))
rows, labels = np.vstack(rows), np.concatenate(labels)
targets = labels.reshape(-1, 1)
loss = BinaryCrossEntropy()

splitter = np.random.default_rng(5)
groups = [splitter.permutation(np.flatnonzero(labels == label)) for label in (0.0, 1.0)]
training_index = np.concatenate([group[:7] for group in groups])
held_index = np.concatenate([group[7:] for group in groups])
training_labels = labels[training_index].copy()
flipped = np.random.default_rng(6).choice(14, size=3, replace=False)
training_labels[flipped] = 1.0 - training_labels[flipped]

weights = np.random.default_rng(1)
hidden = DenseLayer([Neuron(weights.normal(0.0, 1.0, 2), bias=0.0, activation=HyperbolicTangent()) for _ in range(8)])
output = DenseLayer([Neuron(weights.normal(0.0, (2.0 / 8) ** 0.5, 8), bias=0.0, activation=Identity())])
network = LayerStack([hidden, output])

# For epochs 0 to 600, run a backward pass on the fourteen training people and
# another on the forty-six held out, record both losses, and step on the first
# only. Then print the first and last training loss, the lowest held-out loss
# with its epoch and the training loss at that epoch, and the last held-out loss.`,
              `import numpy as np
from oop_ml import BinaryCrossEntropy, DenseLayer, HyperbolicTangent, Identity, LayerStack, Neuron

people = np.random.default_rng(7)
rows, labels = [], []
for radius, label in ((0.55, 0), (1.5, 1)):
    angles = people.uniform(0.0, 2.0 * np.pi, 30)
    spread = radius + people.normal(0.0, 0.09, 30)
    rows.append(np.column_stack([spread * np.cos(angles), spread * np.sin(angles)]))
    labels.append(np.full(30, float(label)))
rows, labels = np.vstack(rows), np.concatenate(labels)
targets = labels.reshape(-1, 1)
loss = BinaryCrossEntropy()

splitter = np.random.default_rng(5)
groups = [splitter.permutation(np.flatnonzero(labels == label)) for label in (0.0, 1.0)]
training_index = np.concatenate([group[:7] for group in groups])
held_index = np.concatenate([group[7:] for group in groups])
training_labels = labels[training_index].copy()
flipped = np.random.default_rng(6).choice(14, size=3, replace=False)
training_labels[flipped] = 1.0 - training_labels[flipped]

weights = np.random.default_rng(1)
hidden = DenseLayer([Neuron(weights.normal(0.0, 1.0, 2), bias=0.0, activation=HyperbolicTangent()) for _ in range(8)])
output = DenseLayer([Neuron(weights.normal(0.0, (2.0 / 8) ** 0.5, 8), bias=0.0, activation=Identity())])
network = LayerStack([hidden, output])

history = []
for epoch in range(601):
    backward = network.backward_pass(rows[training_index], training_labels.reshape(-1, 1), loss)
    held = network.backward_pass(rows[held_index], targets[held_index], loss)
    history.append((epoch, backward.loss, held.loss))
    network = network.stepped_by(backward, 1.0)

best = min(history, key=lambda reading: reading[2])
print(f"training loss from {history[0][1]:.4f} to {history[-1][1]:.4f}")
print(f"held-out loss lowest {best[2]:.4f} at epoch {best[0]}, training loss there {best[1]:.4f}")
print(f"held-out loss at the end {history[-1][2]:.4f}")`,
              `training loss from 0.7210 to 0.0757
held-out loss lowest 0.5354 at epoch 73, training loss there 0.3070
held-out loss at the end 1.6472`,
              { hints: ["The starter fixes the split and label changes. Only training gradients should reach stepped_by.","Measuring a backward pass on validation data is harmless to the parameters if you do not apply it. Selecting an epoch using its loss still makes that data part of model selection.","Keep each epoch and both losses in one record. Choose the lowest validation loss and report the training loss recorded at that same epoch."], check: numberCheck("At which epoch is the held-out loss lowest?", 73, 0.5, "The minimum validation loss identifies the stopping point preferred by this split and seeded run. The training loss alone does not identify it. Repeatedly selecting from this same validation trajectory means the reported minimum is model-selection evidence, rather than a final untouched test result."), question: "When does continued fitting stop helping the held-out validation group?" },
            ),
          ],
        },
      ]}
    />
  );
}
