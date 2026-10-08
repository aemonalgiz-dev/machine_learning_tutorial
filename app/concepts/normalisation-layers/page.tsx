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
import { ArrangementCurves } from "@/components/widgets/ArrangementCurves";
import { ArrangementSweep } from "@/components/widgets/ArrangementSweep";
import { BackwardCheck } from "@/components/widgets/BackwardCheck";
import { DriftChart } from "@/components/widgets/DriftChart";
import { NormalisationPlayground } from "@/components/widgets/NormalisationPlayground";
import { ReparameterisationCheck } from "@/components/widgets/ReparameterisationCheck";
import { RowAxisDemo } from "@/components/widgets/RowAxisDemo";
import { RunningFiguresChart } from "@/components/widgets/RunningFiguresChart";
import { ScaleShiftUndo } from "@/components/widgets/ScaleShiftUndo";

export const metadata: Metadata = {
  title: "Normalisation Layers · oop_ml",
  description:
    "The values passed between layers can change in scale as a network trains. Normalisation methods control aspects of those scales, but they differ in which values they compare and what they preserve.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function NormalisationLayersPage() {
  return (
    <ConceptPage
      lessonId="normalisation-layers"
      intuition={lessonIntuitions["normalisation-layers"]}
      technicalStart="Part 2. Standardise Inside the Model"
      openingTitle="The Inputs Keep Changing While the Layer Learns"
      playgroundIntro="Check which axis supplies the statistics. Compare the values before and after normalisation, then distinguish learned scale and shift from the measured statistics."
      title="Normalisation Layers"
      tagline={"The values passed between layers can change in scale as a network trains. Normalisation methods control aspects of those scales, but they differ in which values they compare and what they preserve."}
      prerequisites={
        <>
          The move itself is the first row of the{" "}
          <Link href="/concepts/feature-scaling" className={link}>
            feature scaling page
          </Link>
          , subtract a mean and divide by a deviation, and the mean and the
          deviation are the{" "}
          <Link href="/primers/statistics" className={link}>
            statistics primer
          </Link>
          &rsquo;s. The crowd network this page measures on is the{" "}
          <Link href="/concepts/dropout" className={link}>
            dropout page
          </Link>
          &rsquo;s, and the loop that trains it is the{" "}
          <Link href="/concepts/training-a-network" className={link}>
            training page
          </Link>
          &rsquo;s; the backward pass in Part 4 assumes the{" "}
          <Link href="/concepts/backpropagation" className={link}>
            backpropagation page
          </Link>
          , since it is one more layer for the blame to pass through.
        </>
      }

      playground={<NormalisationPlayground />}
      sections={[
        {
          title: "Part 1. The Moving Target",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A layer learns against numbers that keep changing">
                <>
<p>
                  Take the crowd network the dropout page trains, sixteen rectified hidden units reading a person&rsquo;s height and weight, and one output unit reading those sixteen. The output unit&rsquo;s weights are being tuned against the sixteen numbers the hidden layer hands it for each person, and every step of training also moves the hidden layer, so the numbers the output unit was tuned against last epoch are not the numbers it reads this epoch.
                </p>
                <p>
                  I measured how far they move. Over four hundred epochs on the whole crowd, the mean of one hidden unit over the twenty-five people travels from 0.439 to 1.529, and its deviation from 0.819 to 3.097.
                </p>
</>
                <DriftChart />
                <p>
                  Read the two readouts against each other. The largest mean
                  shift from the first epoch to the last is 1.0897, and the
                  largest move any unit&rsquo;s mean makes in a single epoch is
                  0.1375, so the block the output layer reads is being moved
                  underneath the output layer at every step rather than
                  settling, by weights the output layer has no say in. That is
                  the moving target the original paper named internal
                  covariate shift, and on this network the chart above is the
                  measurement of it.
                </p>
                <KeepInMind>
                  A hidden layer&rsquo;s outputs are a distribution the layer
                  above learns against, and that distribution moves whenever
                  the hidden weights move, which is every step. On the crowd
                  network the means of the sixteen units shift by up to 1.09
                  over training and up to 0.14 in one epoch.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What standardising once before the model cannot fix">
                <p>
                  The feature scaling page put height and weight on a common
                  footing once, before the model saw them, and the crowd network
                  here reads them that way. That settles the block the first
                  layer reads and nothing after it. The block the output layer
                  reads is produced by weights that change, so there is no
                  one-off standardisation of it to make, and the only place a
                  standardising step can go is inside the model, between the
                  two layers, recomputed on every pass from whatever is flowing
                  through at that moment.
                </p>
                <>
<p>
                  Switch the chart above to the batch layer and the sixteen lines start at exactly zero and one, because that is what standardising does to them. What happens afterwards is the claim this page has to be plain about. The block the output layer reads still moves, and by more. The largest mean shift over training is 1.3204 against the plain network&rsquo;s 1.0897, and the largest single-epoch move is 0.3113 against 0.1375.
                </p>
                <p>
                  What differs is what moved it. Under the batch layer the mean of what the output layer reads equals the layer&rsquo;s shift to within 1.8e−15 at every epoch, so the location and spread of the block are two explicit parameters per unit that the gradient moves on purpose, rather than a by-product of sixteen weight vectors being adjusted for other reasons.
                </p>
</>
                <KeepInMind>
                  The textbook claim is that the layer holds the distribution
                  steady, and on the crowd network it did not hold, since what
                  the output layer read moved further with the batch layer
                  than without it. What the layer did do is make the location and
                  the spread learned quantities, which is the reading the 2018
                  paper argued for and the one the rest of this page uses.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Standardise Inside the Model",
          content: (
            <>
              <SubSection title="3. The move, on a batch of four">
                <p>
                  Picture four people&rsquo;s readings at two hidden units,
                  chosen so that every statistic comes out whole: (1, 7),
                  (1, 9), (7, 1) and (23, 7). The playground opens on them.
                  A batch layer reads down each column, so for the second unit
                  it has the four numbers 7, 9, 1 and 7 to work with, and the
                  first thing it does is find their mean.
                </p>
                <Equation>{"7 + 9 + 1 + 7 = 24,   24 / 4 = 6"}</Equation>
                <p>
                  The deviations from 6 are 1, 3, −5 and 1, whose squares are
                  1, 9, 25 and 1, and the variance divides their total by the
                  number of rows rather than one fewer, which is the biased
                  form and is the one every implementation of this layer uses
                  on the way forward, for a reason Part 4 comes back to.
                </p>
                <Equation>{"1 + 9 + 25 + 1 = 36,   36 / 4 = 9"}</Equation>
                <WorkedExample title="The second column, standardised">
                  <p>
                    Each value becomes its distance from the mean over the
                    deviation, and the playground prints 0.3333, 1.0000,
                    −1.6667 and 0.3333 under that column. The first column runs
                    the same way, a mean of 8 and a deviation of 9, to
                    −0.7778, −0.7778, −0.1111 and 1.6667. Click any cell and
                    change it, and the whole column answers differently,
                    because the mean it was standardised by has moved.
                  </p>
                  <Equation>{"(7 − 6) / 3 =  0.3333\n(9 − 6) / 3 =  1.0000\n(1 − 6) / 3 = −1.6667\n(7 − 6) / 3 =  0.3333"}</Equation>
                </WorkedExample>
                <InAModel title="Twenty of the crowd">
                  <p>
                    Press An Ideal Case and the block is twenty of the
                    crowd, heights in centimetres down one column and weights
                    in kilograms down the other. The layer reads a mean height
                    of 151.9 and a mean weight of 51.85, deviations of 17.2827
                    and 15.7298, and the first person, 147 centimetres and 41
                    kilograms, comes out as −0.2835 and −0.6898, a little short
                    and rather light for this crowd. That is the feature scaling
                    page&rsquo;s standardisation exactly, made on the block in
                    front of the layer rather than on a table beforehand.
                  </p>
                </InAModel>
                <KeepInMind>
                  A batch layer standardises each feature by the mean and the
                  biased variance of the rows in front of it, so its answer
                  for one row is a fact about the whole batch.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. The small constant inside the root">
                <p>
                  The playground does not print a deviation of 3. It prints
                  3.0000017, and the 1.0000 in the worked column is 0.9999994
                  rounded. That is a small constant, 0.00001 here, added to the
                  variance inside the square root before the layer divides by
                  it. The reason is a column whose four numbers are all the
                  same, which has a variance of zero and would otherwise be a
                  division by zero, and that is an ordinary thing for a hidden
                  block to contain, since a rectified unit that is off for
                  every person in the batch produces exactly that column.
                </p>
                <Equation>{"deviation = √(variance + ε)\n√(9 + 0.00001) = 3.0000017"}</Equation>
                <>
                  <p>
                    Adding epsilon under the square root keeps the denominator positive
                    even when a column has zero variance. The derivative of the
                    reciprocal square root is also finite at zero variance for a fixed
                    positive epsilon. The normalized variance is consequently a little
                    below one.
                  </p>
                  <Equation>{"normalized variance = v / (v + ε)\nworked column: 9 / (9 + 0.00001) ≈ 0.9999989"}</Equation>
                  <p>
                    Type five into every cell of a column. Centring produces zeros, and
                    the normalized output is zero for each row. A learned shift can
                    still move those outputs afterward.
                  </p>
                </>
                <KeepInMind>
                  The epsilon is what makes a constant feature normalise to
                  zeros instead of to nothing, and it is why the deviations on
                  this page carry a seventh decimal.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The scale and the shift give back what standardising took">
                <p>
                  Standardising alone would be a constraint. A layer that could
                  only answer with mean zero and spread one would be forbidden
                  from ever passing on an off-centre signal, and the next layer
                  sometimes needs exactly that. So every normalising layer
                  computes a second line, one learned multiplier and one
                  learned offset per feature, which begin at one and zero so
                  that a fresh layer standardises and does nothing more.
                </p>
                <Equation>{"standardised = (value − mean) / √(variance + ε)\nanswer       = scale · standardised + shift"}</Equation>
                <ScaleShiftUndo />
                <>
<p>
                  Press Undo exactly and the sliders jump to the column&rsquo;s own deviation and mean, 3.0000017 and 6 for the second feature, and the answer is the raw column back again. The largest gap between the answer and the raw block is 8.9e−16, and the first row&rsquo;s 1 comes back as 0.9999999999999991, which is a rounding of the last bit rather than anything the standardising left behind.
                </p>
                <p>
                  Two learned numbers per feature can undo it completely, so the layer costs the network nothing it could represent before. What changed is how the numbers are parameterised. The weights beneath used to have to produce a signal at the right level and the right spread by themselves, and now they produce a standardised one while the scale and shift set the level and the spread.
                </p>
</>
                <WhyThisWorks title="Why the identity is reachable">
                  <p>
                    Write γ for the scale, β for the shift, m for the mean and
                    v for the variance, and set the pair to the very numbers
                    the layer standardised by.
                  </p>
                  <Equation>{"γ = √(v + ε),   β = m\nγ · (x − m) / √(v + ε) + β = (x − m) + m = x"}</Equation>
                  <p>
                    The root cancels the root and the mean cancels the mean,
                    for every row at once, because the same two numbers served
                    every row of the column.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The scale and the shift are what make the layer a
                  reparameterisation rather than a restriction. They are
                  learned by gradient like any weight, and Part 1 measured them
                  moving the block by 1.32 on the crowd network.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Two Purposes, and the Running Figures",
          content: (
            <>
              <SubSection title="6. A row&rsquo;s answer depends on its company">
                <p>
                  Every statistic the batch layer uses is a fact about the
                  batch rather than about the row being answered, and
                  everything awkward about the layer follows from that. In the
                  playground, take rows away under the batch layer down to the
                  two it keeps. The first row, (1, 7), answered −0.7778 and
                  0.3333 among the four; among the two it answers 0.0000 and
                  −1.0000, though not a digit of the reading changed, only
                  the crowd it was standardised by.
                </p>
                <p>
                  That is unusable at prediction time. A request may hold one
                  person or a thousand, and a person&rsquo;s answer cannot be
                  allowed to depend on who else happened to be in the same
                  request, so the layer needs to know which of two things it is
                  doing. While training it standardises by the batch, since
                  that is what the gradient will be taken through. While
                  predicting it standardises by something remembered instead,
                  which the next two steps build.
                </p>
                <KeepInMind>
                  A batch layer has two purposes and behaves differently under
                  each, and it is the one layer besides dropout that cannot be
                  written without being told which is happening. Forgetting to
                  say training costs a slower descent; forgetting to say
                  predicting makes a person&rsquo;s answer depend on the
                  request, so predicting is the default.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. A batch of one cannot be batch-normalised while training">
                <>
<p>
                  Push the first row through on its own while training and the batch is that one row. Its mean is itself, its deviation is the root of zero plus ε, and the layer answers zeros for both features, which is the same answer the constant column got in step 4 and for the same reason: a batch of one carries no spread to standardise by.
                </p>
                <p>
                  Nothing is refused, because a row of zeros is what the arithmetic honestly says, and that is worth knowing, since a training loop fed one row at a time through this layer trains on nothing and raises nothing.
                </p>
</>
                <NumberTable
                  headings={["the row (1, 7) on its own", "answer"]}
                  rows={[
                    ["batch layer, while training", "0.0000, 0.0000"],
                    ["batch layer, predicting, fresh running figures", "0.999995, 6.999965"],
                    ["batch layer, predicting, after a hundred steps", "−0.7778, 0.3334"],
                    ["layer normalisation", "−0.9999994, 0.9999994"],
                    ["RMS normalisation", "0.2000, 1.4000"],
                  ]}
                  caption="The same row under each layer and purpose, read from the widget in step 8. Only the batch layer while training has nothing to divide by."
                />
                <p>
                  While predicting the same row is fine, because the divisor is
                  no longer read from the row. A fresh layer holds a running
                  mean of zero and a running variance of one, so it answers
                  0.999995 and 6.999965, the row itself to within the epsilon,
                  and a layer that has been stepped a hundred times on the
                  four-row batch answers −0.7778 and 0.3334, which is the
                  batch answer of step 3 to three places.
                </p>
                <KeepInMind>
                  One row while training normalises to zeros, and that is an
                  answer rather than an error. The row layers of Part 5 have
                  no such case, because they read their spread from inside the
                  row.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The running figures, and predicting by them">
                <p>
                  What prediction standardises by is a running mean and a
                  running variance, one pair per feature, moved a little toward
                  each batch on every step and consulted only when predicting.
                  They begin at zero and one, which is what an untrained layer
                  believes about its inputs and is why predicting through one
                  is close to an identity rather than an error.
                </p>
                <Equation>{"running = 0.9 · running + 0.1 · batch"}</Equation>
                <WorkedExample title="After one pass and one step">
                  <p>
                    The second column&rsquo;s batch mean is 6 and its batch
                    variance 9, so one step moves the running pair a tenth of
                    the way from 0 and 1 toward them, and the 7 that answered
                    0.3333 while training answers 4.7703 while predicting.
                    Flip the playground to predicting to see it.
                  </p>
                  <Equation>{"running mean     = 0.9 · 0 + 0.1 · 6 = 0.6\nrunning variance = 0.9 · 1 + 0.1 · 9 = 1.8,   √(1.8 + 0.00001) = 1.3416445\n(7 − 0.6) / 1.3416445 = 4.7702651"}</Equation>
                </WorkedExample>
                <p>
                  Same layer, same row, different statistics, and only more
                  steps bring the two answers together. The chart follows them
                  over a hundred steps of the same batch. The widest gap
                  between the predicting answer and the training answer is
                  5.7333 after one step, 1.0433 after ten and 0.0238 after
                  forty-four; it first falls under a hundredth at step 53 and
                  under a thousandth at step 75, and after a hundred steps it
                  is 6.5e−05.
                </p>
                <RunningFiguresChart />
                <>
<p>
                  A tenth of the way each step is the default momentum of 0.9, which keeps nine tenths of what it had, and it is worth saying that some frameworks name the same update by the other number, so a momentum of 0.1 there is this 0.9 and not a different rate. A larger batch makes each step&rsquo;s figures a better estimate of the whole and does nothing to the number of steps the average needs, which is why a batch layer is trained for a good while before anyone trusts its predictions.
                </p>
                <p>
                  On twenty of the crowd the running mean after one step is 15.19 centimetres against a batch mean of 151.9, and a person predicted through that layer would be standardised by a crowd that does not exist.
                </p>
</>
                <KeepInMind>
                  The running figures are state that is neither a setting
                  chosen up front nor a weight learned by gradient. On the
                  worked batch they need 53 steps to bring the predicting
                  answer within a hundredth of the training one.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Where the update happens, and what a forward pass without a step contributes">
                <>
<p>
                  Most implementations move the running figures inside the forward pass, by changing the layer as it answers. The layer measured here does not change anything as it answers. Its training pass carries the batch&rsquo;s mean and variance on the response it hands back, the backward pass carries them on the gradient beside the slopes for the scale and shift, and the step that builds the next layer is where the running figures move, at the same moment the scale and the shift do.
                </p>
                <p>
                  In an ordinary training loop that is once per batch, which is where a mutating implementation would have put it.
                </p>
</>
                <>
<p>
                  The cost of that choice is stated rather than hidden. A forward pass that is never followed by a step contributes nothing to the running figures, so a training pass made for a look rather than for a step leaves prediction where it was. For a training loop that is the correct behaviour, since a batch that was never learned from should not shape what the model believes about its inputs; for a caller used to other frameworks it is a difference, and this is where it is written down.
                </p>
                <p>
                  The playground&rsquo;s predicting toggle takes one real step with a slope of zero arriving, which moves neither the scale nor the shift and folds the batch a tenth of the way in.
                </p>
</>
                <KeepInMind>
                  The running figures update when the layer is stepped, not
                  when it answers. Some implementations also keep the running
                  variance in the unbiased form while the forward pass uses
                  the biased one; here the biased form is used throughout.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "On the crowd network the batch layer held the block the output layer reads steadier than the plain network did.",
              false,
              "It moved further. The largest mean shift over training is 1.3204 against the plain network’s 1.0897, and the largest single-epoch move 0.3113 against 0.1375. What the layer did do is make the location and the spread two explicit parameters per unit that the gradient moves on purpose, rather than a by-product of sixteen weight vectors being adjusted for other reasons.",
            ),
            choice(
              "The second unit’s four readings are 7, 9, 1 and 7, and the playground prints a deviation of 3.0000017 rather than 3. Why?",
              [
                "A small constant is added to the variance inside the square root, so a column with no spread is not a division by zero",
                "The variance divides by one fewer than the number of rows",
                "The learned scale starts a little above one",
                "The running variance has already begun to move",
              ],
              0,
              "The mean is 6 and the squared deviations 1, 9, 25 and 1 total 36, which over four rows is a variance of 9, the biased form. The root is taken of 9 + 0.00001. A rectified unit that is off for every person in the batch produces exactly a constant column, which is an ordinary thing for a hidden block to contain, and the epsilon is what makes such a feature normalise to zeros instead of to nothing.",
            ),
            trueFalse(
              "Setting the scale and shift to the very deviation and mean the layer standardised by returns the raw column.",
              true,
              "The root cancels the root and the mean cancels the mean, for every row at once, because the same two numbers served every row of the column. Pressing Undo exactly leaves the largest gap between the answer and the raw block at 8.9e−16, which is why the layer is a reparameterisation rather than a restriction.",
            ),
            choice(
              "The first row, (1, 7), is pushed through a fresh batch layer on its own while training. What comes back?",
              [
                "Zeros for both features, with nothing refused",
                "−0.7778 and 0.3333, as it answered among the four",
                "A refusal, since a batch of one has no spread to standardise by",
                "0.999995 and 6.999965, the row itself to within the epsilon",
              ],
              0,
              "A batch of one has a mean equal to the row and a deviation of the root of zero plus epsilon, so the layer answers zeros, which is what the arithmetic honestly says. A training loop fed one row at a time through this layer trains on nothing and raises nothing. The row itself to within the epsilon is what the same fresh layer answers while predicting, because then the divisor is the running pair of zero and one and is not read from the row.",
            ),
            several(
              "Which of these hold for the running figures?",
              [
                "They begin at zero and one, which is why predicting through a fresh layer is close to an identity",
                "They move when the layer is stepped rather than when it answers",
                "After one step on the worked batch the second column’s running mean is 0.6 and its running variance 1.8",
                "On the worked batch they need 53 steps to bring the predicting answer within a hundredth of the training one",
              ],
              [0, 1, 2, 3],
              "All four hold. One step moves the pair a tenth of the way from 0 and 1 toward the batch’s 6 and 9, so the 7 that answered 0.3333 while training answers 4.7703 while predicting, and only more steps bring the two together. A larger batch makes each step’s figures a better estimate and does nothing to the number of steps the average needs. A forward pass never followed by a step contributes nothing to them at all.",
            ),
        ],
        },
        {
          title: "Part 4. The Backward Pass Has Three Routes",
          content: (
            <>
              <SubSection title="10. Why the mean is not a constant">
                <>
<p>
                  Now the blame has to pass back through the layer, and the tempting reading is that a standardised value is just the input minus a number over another number, so the slope with respect to the input is one over the deviation. It is wrong in a way that trains. Change one person&rsquo;s reading at a hidden unit and that unit&rsquo;s mean over the batch moves, and with it every other person&rsquo;s standardised value at that unit; the variance moves too.
                </p>
                <p>
                  So one input reaches the loss by three routes, directly through its own standardised value, through the mean, and through the variance, and the gradient has to collect all three.
                </p>
</>
                <KeepInMind>
                  The mean and the deviation are functions of every row in the
                  band, so they are differentiated through and not around.
                  Dropping the two extra routes leaves a block with the right
                  shape that is not the gradient of the loss.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The compact form">
                <p>
                  Write n for the number of rows, z for the standardised block,
                  s for the deviation of each column with the epsilon inside,
                  and d for the slope arriving at the layer&rsquo;s outputs
                  multiplied by the scale. Collecting the three routes gives
                  one line, with the two sums running down each column.
                </p>
                <Equation>{"passed down = (n · d − Σ d − z · Σ (d · z)) / (n · s)"}</Equation>
                <DerivationTable
                  expressionHeading="term"
                  reasonHeading="which route it is"
                  rows={[
                    { expression: "n · d / (n · s)  =  d / s", reason: "the direct route, and the whole of the naive answer" },
                    { expression: "− Σ d / (n · s)", reason: "the mean route; the input moved the column's mean by 1/n, which moved every row's value" },
                    { expression: "− z · Σ (d · z) / (n · s)", reason: "the variance route; the input moved the column's spread, which rescaled every row's value" },
                    { expression: "d scale = Σ (arriving · z),   d shift = Σ arriving", reason: "the two parameter slopes, sums down the rows because one pair serves every row" },
                  ]}
                />
                <WorkedExample title="The second column through the compact form">
                  <>
                    <p>
                      Take the second column of the whole-number four again, 7,
                      9, 1 and 7, which step 3 standardised to 0.3333, 1.0000,
                      −1.6667 and 0.3333 with a deviation of 3. Let the slopes
                      arriving at that column be 2, 4, 6 and 8, and leave the
                      scale at one, so d is the arriving slope itself. The two
                      sums come first, because every row shares them.
                    </p>
                    <Equation>{"Σ d        = 2 + 4 + 6 + 8 = 20\nΣ (d · z)  ≈ 2 × 0.3333 + 4 × 1 + 6 × (−1.6667) + 8 × 0.3333 ≈ −2.6667\nn · s      ≈ 4 × 3 = 12"}</Equation>
                    <p>
                      Each row then takes its own direct term, n times its
                      arriving slope, less the first sum, less its own
                      standardised value times the second sum, all over n
                      times the deviation.
                    </p>
                    <Equation>{"row 1   (4 × 2 − 20 − 0.3333 × (−2.6667)) / 12       ≈ −0.9259\nrow 2   (4 × 4 − 20 − 1 × (−2.6667)) / 12            ≈ −0.1111\nrow 3   (4 × 6 − 20 − (−1.6667) × (−2.6667)) / 12    ≈ −0.0370\nrow 4   (4 × 8 − 20 − 0.3333 × (−2.6667)) / 12       ≈  1.0741\n\ncolumn sum    −0.9259 − 0.1111 − 0.0370 + 1.0741 ≈ 0\nnaive form    d / s ≈ (0.6667, 1.3333, 2, 2.6667), which sums to 6.6667"}</Equation>
                    <p>
                      The first row arrived with a positive slope of 2 and is
                      passed down a negative one. Raising that reading alone
                      raises the column&rsquo;s mean, which lowers every
                      row&rsquo;s standardised value, and the four rows
                      together carry an arriving slope of 20 against the 8 of
                      this row&rsquo;s direct term. The naive form sees only
                      the direct route and reports 0.6667 for the same cell.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  The two parameter slopes are the easy half and come out the
                  same whichever form of the passed-down block is used, which
                  matters in step 13. The variance in that line is the biased
                  one because the derivative is taken with respect to the
                  quantity actually computed, so the forward pass and the
                  backward pass have to agree about which variance that was.
                </p>
                <KeepInMind>
                  The batch layer&rsquo;s backward pass is the direct route
                  with the mean route and the variance route subtracted, all
                  over the deviation.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The naive form measured against a finite difference">
                <p>
                  A finite difference is the oracle, because it knows nothing
                  about routes. Nudge one input up and down by a small step,
                  run the forward pass both ways, and difference the objective,
                  which here is the arriving slope times the outputs, summed.
                  The widget does that for every cell of the whole-number four
                  under a slope that counts up from one across the block, and
                  puts the passed-down block, the naive block
                  and the finite difference side by side.
                </p>
                <BackwardCheck initialLayer="batch" initialBlock={0} />
                <>
<p>
                  The passed-down block agrees with the finite difference to 2.1e−10 across every cell. The naive block misses it by 2.0370, on a block whose largest true slope is 1.0741, so the error is larger than the largest slope it was reporting, and every entry of it is the wrong sign in the first column. There is also a check that needs no oracle at all.
                </p>
                <p>
                  Shifting a whole column by a constant cannot change what a centring layer answers, so the true block&rsquo;s columns must sum to zero, and they do, to 2.2e−16; the naive block&rsquo;s sum to 1.7778 and 6.6667.
                </p>
</>
                <KeepInMind>
                  Measured on the worked batch, the three-route form is within
                  2.1e−10 of a finite difference and the naive form is 2.04
                  away, which is more than the largest slope in the block. The
                  column sum is the cheap structural check, zero for the true
                  gradient and not for the other.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. The two parameter slopes come out identical under both">
                <>
<p>
                  The scale slope on the worked batch is 8.0 and −2.6667, and the shift slope is 16 and 20, and neither number depends on which passed-down form was used, since both are sums over the standardised block and the arriving slope alone. So a check that only looked at what the layer learns for itself would pass the naive form, and a network built on it would train, with plausible magnitudes and a falling loss, on a gradient that is not the gradient of the loss for every layer beneath.
                </p>
                <p>
                  That is why the check has to be on the block passed down, and why the tests behind this page run the finite difference rather than trusting the derivation.
                </p>
</>
                <KeepInMind>
                  A layer&rsquo;s own parameter slopes cannot tell the two
                  forms apart. Only the block it passes down can, and only a
                  finite difference or the column sum tells you which you have.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Reduce Inside the Row Instead",
          content: (
            <>
              <SubSection title="14. Layer normalisation, the same move along the row">
                <p>
                  Everything awkward in Part 3 came from reaching across the
                  batch, and none of it was about normalising. Layer
                  normalisation makes the identical move along the row. The
                  mean and the deviation are read from the numbers one row
                  already holds, so the answer is the same whether the row
                  arrives alone or among a thousand others, and it is the same
                  while training and while predicting because there is nothing
                  that could differ. No running figures, no purpose, no batch.
                  Press Layer in the playground and the bands turn sideways.
                </p>
                <WorkedExample title="The first row, (1, 7), across">
                  <p>
                    Its mean is 4, its deviations are −3 and 3, the mean of
                    their squares is 9, and the deviation is 3.0000017 again,
                    so the row answers −0.9999994 and 0.9999994. Take every
                    other row away and it answers exactly the same.
                  </p>
                  <Equation>{"(1 − 4) / 3.0000017 = −0.9999994,   (7 − 4) / 3.0000017 = 0.9999994"}</Equation>
                </WorkedExample>
                <p>
                  The whole difference between the layers is the index the sum
                  runs over. Write the block as xᵢⱼ, row i and feature j, with
                  n rows and d features.
                </p>
                <Equation>{"batch   mⱼ = (1/n) Σᵢ xᵢⱼ,   vⱼ = (1/n) Σᵢ (xᵢⱼ − mⱼ)²     over the rows, one figure per feature\nlayer   mᵢ = (1/d) Σⱼ xᵢⱼ,   vᵢ = (1/d) Σⱼ (xᵢⱼ − mᵢ)²     over the features, one figure per row"}</Equation>
                <KeepInMind>
                  Layer normalisation is batch normalisation with the sum
                  turned sideways, and every piece of state the batch layer
                  needed falls away with the axis. The scale and shift stay,
                  one pair per feature.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The backward pass along the row">
                <p>
                  The three routes are the same three, with the two sums now
                  running along the row and divided by d rather than n, and
                  the structural check turns with them, since shifting a whole
                  row by a constant cannot change what the layer answers, so
                  the true passed-down block&rsquo;s rows sum to zero. The widget
                  shows it on the three-feature block, because on a row of two
                  numbers something stranger happens that step 16 is about.
                </p>
                <BackwardCheck initialLayer="layer" initialBlock={1} />
                <p>
                  On the three-feature block the passed-down block agrees with
                  the finite difference to 1.5e−09 against a largest true slope
                  of 0.5123, and its rows sum to zero to 4.5e−16, where the
                  naive block misses by 5.3404 and its rows sum to as much as
                  14.1203. Switch the block to the whole-number four and the
                  true block is zero in every cell, with a naive block that
                  says otherwise by 2.0, which is the row of two numbers
                  having nothing to pass down rather than a fault in the check.
                </p>
                <KeepInMind>
                  Same three routes, same finite-difference agreement, and the
                  zero-sum check runs along the row instead of down the column.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. When the row is the wrong axis">
                <>
<p>
                  A row of two numbers has a mean halfway between them and a deviation of half their difference, so each number standardises to exactly one or minus one, whichever side of the mean it was on. That is why the worked row came back as ±0.9999994 whatever its values, and it is what happens if the row layer is put where the batch layer was in step 3, reading a person&rsquo;s height and weight.
                </p>
                <p>
                  Twenty of the crowd go in and twenty rows of 1.0000 and −1.0000 come out, every person&rsquo;s height being the larger number, and the slope through it is zero in every cell, so a network below could not learn anything either.
                </p>
</>
                <RowAxisDemo />
                <>
<p>
                  The widest distance from ±1 across all forty values is 2.6e−09, which is the epsilon, and the twenty people have become one row. Down the columns the same twenty people keep their differences, because a column of twenty heights has a spread worth dividing by. The row is the right axis when the row is wide and its entries are alike in kind, sixteen hidden units reading the same person, or the hundreds of numbers that describe one token in a sequence model, and it is the wrong axis for two measurements in different units.
                </p>
                <p>
                  Which is the sentence that decides between the two layers, and it is a sentence about the data.
                </p>
</>
                <KeepInMind>
                  Layer normalisation asks what a row looks like relative to
                  itself. Two raw features answer only which is larger; sixteen
                  hidden units answer a great deal more. Choose the axis by
                  what a row means.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. RMS normalisation drops the centring">
                <p>
                  RMS normalisation goes one step further along the row and
                  subtracts nothing. It divides the row by its root mean square
                  as it stands, so the row&rsquo;s level survives and only its
                  size is fixed. The finding behind it was empirical, the
                  re-scaling was doing the work and the re-centring was not,
                  and the reward is one reduction instead of two on the way
                  forward and one route fewer on the way back, since there is
                  no mean for an input to reach the loss through.
                </p>
                <WorkedExample title="The first row, (1, 7), by its root mean square">
                  <Equation>{"(1 + 49) / 2 = 25,   √(25 + 0.00001) = 5.000001\n1 / 5.000001 = 0.2000,   7 / 5.000001 = 1.4000"}</Equation>
                  <p>
                    Press RMS in the playground and the mean leaves the margin.
                    The two answers no longer sum to zero, because nothing was
                    subtracted, and the backward widget in step 15 shows the
                    same thing. Under RMS the true block still agrees with the
                    finite difference, to 2.7e−10 on the whole-number four,
                    and its rows sum to as much as 0.8880, since a row shifted
                    by a constant now answers differently.
                  </p>
                </WorkedExample>
                <p>
                  Twenty of the crowd under RMS come out as 1.3622 and 0.3799
                  for the first person, 1.3390 and 0.4549 for the second, rows
                  that stay apart because what the layer kept is each
                  row&rsquo;s proportions and not only which entry was larger.
                  Conventionally the shift is dropped as well as the centring;
                  the layer here keeps a shift defaulting to zero, which is
                  the conventional model exactly and lets one shape serve the
                  family.
                </p>
                <KeepInMind>
                  RMS normalisation is layer normalisation with the mean route
                  removed, forward and backward alike. The row-sum check no
                  longer applies, because a constant shift of the row is now
                  something the layer can see.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "Which check separates the two backward forms without an oracle?",
              [
                "Every column of the passed-down block must sum to zero, since shifting a whole column cannot change what a centring layer answers",
                "The scale and shift slopes must come out positive",
                "The passed-down block must have the same shape as the input",
                "The passed-down block must sum to the arriving slope",
              ],
              0,
              "The true block’s columns sum to zero to 2.2e−16 where the naive block’s sum to 1.7778 and 6.6667. On the second column the three routes give −0.9259, −0.1111, −0.0370 and 1.0741, and the naive form gives 0.6667, 1.3333, 2 and 2.6667. The parameter slopes cannot tell the two forms apart, since both are sums over the standardised block and the arriving slope alone, so the check has to be on the block passed down.",
            ),
            trueFalse(
              "A network built on the naive backward form fails visibly, with a loss that will not fall.",
              false,
              "It trains, with plausible magnitudes and a falling loss, on a gradient that is not the gradient of the loss for every layer beneath. One input reaches the loss by three routes, directly, through the mean and through the variance, and the naive form keeps only the direct one. The scale slope of 8.0 and −2.6667 and the shift slope of 16 and 20 come out the same under both forms, which is why the tests behind this page run the finite difference rather than trusting the derivation.",
            ),
            choice(
              "What is the whole difference between the batch layer and the row layer?",
              [
                "The index the sum runs over",
                "Whether the variance is taken in the biased form",
                "Whether a scale and a shift are learned",
                "Whether an epsilon is added under the square root",
              ],
              0,
              "One reads a mean and a variance down each feature over the rows, the other along each row over the features. Every piece of state the batch layer needed falls away with the axis, the running figures and the purpose alike, and the scale and shift stay, one pair per feature.",
            ),
            trueFalse(
              "A row layer put where the batch layer sat, reading a person’s height and weight, answers twenty rows of 1.0000 and −1.0000.",
              true,
              "A row of two numbers has a mean halfway between them and a deviation of half their difference, so each standardises to exactly one or minus one, whichever side of the mean it was on. The slope through it is zero in every cell, so a network below could learn nothing either. The row is the right axis when a row is wide and alike in kind, and the wrong one for two measurements in different units.",
            ),
            choice(
              "What does RMS normalisation leave out that layer normalisation does?",
              [
                "Subtracting the row’s mean, so the row’s level survives and only its size is fixed",
                "The small constant under the square root",
                "The learned scale, so the answers always have a root mean square of one",
                "The division, so the row is centred and left at its own spread",
              ],
              0,
              "It divides the row by its root mean square as it stands, so the row (1, 7) answers 0.2000 and 1.4000, which no longer sum to zero. There is one reduction instead of two on the way forward and one route fewer on the way back, since there is no mean for an input to reach the loss through. The row-sum check stops applying for the same reason, and twenty of the crowd stay apart as rows where layer normalisation turned them all into 1 and −1.",
            ),
        ],
        },
        {
          title: "Part 6. Weight Normalisation, a Different Animal",
          content: (
            <>
              <SubSection title="18. A direction and a length">
                <p>
                  The fourth layer with normalisation in its name standardises
                  nothing at runtime. Its forward pass is a dense layer&rsquo;s,
                  value for value. What it changes is where the parameters
                  live. Instead of a weight vector per neuron it stores a
                  direction and a length, and rebuilds the vector from the two
                  on the way past. A weight vector has a length and a direction
                  whether anyone stores them apart or not, and they do
                  different jobs, since the direction decides which way the
                  neuron&rsquo;s boundary faces and the length decides how
                  sharply it answers.
                </p>
                <Equation>{"weights = magnitude · direction / ‖direction‖"}</Equation>
                <p>
                  Written the ordinary way neither is a parameter, so gradient
                  descent can only move the length by moving every component at
                  once and hoping the total comes out right, and any step that
                  changes the length also swings the direction. Written this
                  way one number per neuron owns the length, and a step of the
                  direction cannot change the length at all, because the
                  length was divided out.
                </p>
                <KeepInMind>
                  Weight normalisation reparameterises the weights and leaves
                  the function alone. The shared word is the only thing it
                  shares with the three layers above, and the paper&rsquo;s
                  own argument is that this is what the batch layer&rsquo;s
                  benefit looks like once the batch is taken out of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The gradient in the new coordinates, and the term that is easy to lose">
                <p>
                  Write w for the slope with respect to the effective weights,
                  which is a dense layer&rsquo;s ordinary slope and is computed
                  exactly that way, and u for the unit direction. Then per
                  neuron the length&rsquo;s slope is the part of w lying along
                  u, which is the whole of what lengthening the vector can
                  achieve, and the direction&rsquo;s slope is the rest of w,
                  rescaled, with that radial part projected out.
                </p>
                <Equation>{"magnitude slope = w · u\ndirection slope = (magnitude / ‖direction‖) · (w − (w · u) u)"}</Equation>
                <p>
                  Dropping the projection is the mistake this layer is about.
                  It leaves a block with the right shape and plausible
                  magnitudes that trains, and the check is the same finite
                  difference as Part 4. Three neurons read five of the crowd
                  in standard units through a hyperbolic tangent, with stored
                  directions whose lengths are 1, 2.5 and 0.5.
                </p>
                <ReparameterisationCheck />
                <>
<p>
                  The two layers&rsquo; answers differ by exactly 0, because the forward pass is the same arithmetic. The direction slope agrees with the finite difference to 3.6e−10 and the length slope to 1.1e−10, against a largest true direction slope of 2.9973; the unprojected form misses by 1.8286, which is about six tenths of the largest slope it was trying to report.
                </p>
                <p>
                  And there is a structural check here too. Scaling a stored direction by any positive constant leaves every answer unchanged, so the loss is flat along the direction itself and the slope can have no part along it. The projected direction slope dotted with the direction is 8.9e−16, and the unprojected form&rsquo;s is 3.6914.
                </p>
</>
                <KeepInMind>
                  The direction&rsquo;s slope has to have its radial component
                  projected out, and the check that costs nothing is the dot
                  product with the direction, which is zero for the true slope.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Same slope, different destination">
                <>
<p>
                  A reparameterisation that moved the parameters to the same place would be a renaming, so the last thing to check is that it does not. One step at a stride of 0.1 from the same slope lands the weight-normalised layer&rsquo;s effective weights 0.0364 away from where the dense layer&rsquo;s land. The lengths say where the difference went.
                </p>
                <p>
                  Neuron 1 goes from a length of 1 to 1.2286 under weight normalisation and to 1.2347 under the dense layer, neuron 3 from 0.5 to 0.3040 and 0.3247, and under the dense layer part of each step that was meant for the direction changed the length as a side effect, where under weight normalisation only the length&rsquo;s own slope could move it.
                </p>
</>
                <KeepInMind>
                  The same learning rate applied to the same slope arrives
                  somewhere else, which is the claim about the surface the
                  layer makes, and on the fixture it is 0.0364 in the weights
                  after one step.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. What Each Buys on the Crowd Network",
          content: (
            <>
              <SubSection title="21. The experiment">
                <>
<p>
                  Whether any of this helps is a measurement, and the arrangement is the dropout page&rsquo;s. Twenty-five people are too few to hold out a fixed group, so each run deals the crowd into five folds, trains on twenty and holds out five, and repeats until every person has been held out once, so the held-out accuracy is counted over all twenty-five.
                </p>
                <p>
                  Heights and weights are put into standard units using the training rows of each fold only. The whole of that is repeated under five seeds and five arrangements of the same sixteen-unit network, no normalisation, a batch layer between the hidden and output layers, a layer-normalising layer there, an RMS layer there, and a weight-normalised hidden layer with nothing inserted, which is a hundred and twenty-five training runs of four hundred full-batch epochs.
                </p>
</>
                <p>
                  Two honest limits before the numbers. The stride of one was
                  chosen for the plain network on the dropout page and is held
                  the same under every arrangement, so what is compared is the
                  arrangement and not a tuned version of each. And the batch
                  layer comes after the rectifier rather than before it,
                  because here an activation function belongs to the neuron and a normalising
                  layer can only go between layers; the original paper
                  standardises the score before the activation function, and both orders are
                  used in practice.
                </p>
                <KeepInMind>
                  A held-out score on twenty-five people moves by 0.04 per
                  person, so the spread across seeds, and not any one number,
                  is the ruler the comparison is measured with.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. What the sweep found">
                <ArrangementSweep />
                <>
<p>
                  Across the five seeds the plain network trains to 0.992 and holds out at 0.744, the dropout page&rsquo;s numbers, since it is the same network under the same seeds. The batch layer trains to 0.904 and holds out at 0.640, and its seeds spread from 0.60 to 0.68, every one of them below the plain network&rsquo;s mean.
                </p>
                <p>
                  Layer normalisation trains to 0.910 and holds out at 0.696, RMS to 0.870 and 0.720, and weight normalisation to 0.986 and 0.752, spread 0.68 to 0.80, which is the one arrangement whose seeds are level with the plain network&rsquo;s rather than below them.
                </p>
</>
                <NumberTable
                  headings={["arrangement", "training accuracy", "held out", "held out across seeds", "training loss at the end"]}
                  rows={[
                    ["no normalisation", "0.992", "0.744", "0.64 to 0.84", "0.0829"],
                    ["batch layer", "0.904", "0.640", "0.60 to 0.68", "0.2088"],
                    ["layer normalisation", "0.910", "0.696", "0.64 to 0.76", "0.1604"],
                    ["RMS normalisation", "0.870", "0.720", "0.64 to 0.80", "0.2392"],
                    ["weight normalisation", "0.986", "0.752", "0.68 to 0.80", "0.0775"],
                  ]}
                  caption="Means over five seeds, each seed five folds, four hundred epochs of full-batch descent at a stride of one, sixteen hidden units."
                />
                <p>
                  The textbook claim is that normalising the hidden block makes
                  a network train better, and on this crowd it did not hold.
                  The three activation normalisers all trained to a lower
                  accuracy and a higher loss than the plain network at the same
                  stride, and the batch layer held out worse by more than the
                  seed spread can excuse. Weight normalisation, which changes
                  the surface and not the function, finished 0.008 above the
                  plain network on held-out accuracy and 0.0054 below it on
                  loss, which is inside what the seeds move by.
                </p>
                <KeepInMind>
                  On twenty-five people at a fixed stride, none of the four
                  layers raised the held-out score in a way the seeds can
                  distinguish from chance, and the batch layer lowered it,
                  which is as far as five seeds on twenty-five people can
                  carry the comparison.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Speed of training, measured">
                <p>
                  The original claim was about speed rather than accuracy, and
                  that is a different measurement. The curves are one seed on
                  the whole crowd, the loss the backward pass measured after
                  every epoch, and each is timed against a loss of 0.3.
                </p>
                <ArrangementCurves />
                <>
<p>
                  The two row layers get there first, at epoch 16 against the plain network&rsquo;s 77, so the speed claim held for them at the start of training. It did not hold for the batch layer, which crossed 0.3 at epoch 119, and it did not carry through to the end for either row layer, where layer normalisation finished at a loss of 0.1041 against the plain 0.0813 and RMS at 0.4284 with an accuracy of 0.76.
                </p>
                <p>
                  Weight normalisation and the plain network start from the identical loss of 0.9863, because the directions are drawn from the same stream in the same order, cross 0.3 on the same epoch, and part only at the end, 0.0753 against 0.0813.
                </p>
</>
                <p>
                  The lower chart is the batch layer asked two ways after each
                  step, properly by its running figures and again by the
                  batch&rsquo;s own statistics, and the two disagree on 88 of
                  the 400 epochs; at epoch 10 it answers 0.76 one way and 0.72
                  the other. That is the lag of Part 3 seen from inside a
                  training loop, and it is why a loss curve read while training
                  is not quite the curve the deployed model would report.
                </p>
                <KeepInMind>
                  Faster at the start is a claim the row layers kept on this
                  crowd and the batch layer did not, and lower at the end is a
                  claim none of the activation normalisers kept. Time the
                  curve against a threshold and read the end separately.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Reading a small result honestly">
                <>
<p>
                  The network the batch layer was built for was dozens of layers deep, trained on mini-batches of a large dataset, and its drift compounded through every layer. The network here has one hidden layer, trains on its whole twenty-row batch at once, and can only overfit the mixed middle of the crowd, which no method can generalise from.
                </p>
                <p>
                  Between those two lies most of practice, and what the measurements support is narrower than the folklore. A normalising layer changes the surface the gradient descends, and at a given stride that surface can come out easier or harder, so whether it helped is measured across seeds rather than read off the name.
                </p>
</>
                <KeepInMind>
                  Reach for the batch layer when the network is deep and the
                  batches are many, for the row layers when a row is wide and
                  alike in kind or arrives alone, and measure whether either
                  helped rather than reading it off a paper written about a
                  different network.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            choice(
              "What does weight normalisation change?",
              [
                "Where the parameters live, storing a direction and a length in place of a weight vector",
                "The distribution of the hidden block at runtime",
                "Which axis the statistics run along",
                "The activation the neuron applies",
              ],
              0,
              "Its forward pass is a dense layer’s, value for value, and the two layers’ answers differ by exactly 0. Written the ordinary way neither the length nor the direction is a parameter, so descent can only move the length by moving every component at once, and any step that changes the length also swings the direction.",
            ),
            trueFalse(
              "The direction’s slope should keep its radial component, since lengthening the vector is part of what a direction does.",
              false,
              "Scaling a stored direction by any positive constant leaves every answer unchanged, so the loss is flat along the direction itself and its slope can have no part along it. The projected slope dotted with the direction comes to 8.9e−16 where the unprojected form gives 3.6914, and the unprojected block misses the finite difference by 1.8286.",
            ),
            choice(
              "One step at a stride of 0.1 from the same slope. How far apart do the weight-normalised layer’s effective weights and the dense layer’s land?",
              [
                "0.0364, with the difference showing up in the lengths",
                "Exactly 0, since the forward pass is the same arithmetic",
                "0.0054",
                "1.8286",
              ],
              0,
              "A reparameterisation that moved the parameters to the same place would be a renaming. Under the dense layer part of each step meant for the direction changed the length as a side effect, taking neuron 1 to 1.2347 where weight normalisation takes it to 1.2286.",
            ),
            several(
              "Which of these did the measurement on the crowd network find?",
              [
                "The batch layer held out at 0.640 against the plain network’s 0.744, with every seed below the plain mean",
                "Weight normalisation finished 0.008 above the plain network on held-out accuracy, which is inside what the seeds move by",
                "The two row layers crossed a loss of 0.3 at epoch 16 against the plain network’s 77",
                "The three activation normalisers all trained to a higher accuracy than the plain network",
              ],
              [0, 1, 2],
              "The three activation normalisers all trained to a lower accuracy and a higher loss at the same stride. A held-out score on twenty-five people moves by 0.04 per person, so the spread across seeds rather than any single number is the ruler the comparison is measured with.",
            ),
            trueFalse(
              "During training, the batch layer asked by its running figures and asked by the batch’s own statistics disagreed about the accuracy on 88 of the 400 epochs.",
              true,
              "At epoch 10 the layer answers 0.76 one way and 0.72 the other. That is the lag of Part 3 seen from inside a training loop, since the running figures move only a tenth of the way toward each batch per step, and it is why a loss curve read while training is not quite the curve the deployed model would report.",
            ),
        ],
        },
        {
          title: "Part 8. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="25. What a complete implementation must specify">
                <p>
                  A complete implementation states which axis the statistics
                  run along, whether the variance is biased, where the epsilon
                  goes, that the scale and shift exist and what they start at,
                  what the two purposes are and which is the default, how the
                  running figures start and by what rule and at what moment
                  they move, whether the running variance is biased or not,
                  which three routes the backward pass collects, what the
                  parameter slopes are, and, for weight normalisation, that
                  the direction slope has its radial part projected out and
                  what a zero direction means.
                </p>
              </SubSection>

              <SubSection title="26. The edges, each one probed">
                <p>
                  Every row below was run rather than reasoned about, and the
                  behaviours fall into three kinds, refused with a typed error,
                  accepted with an answer that follows from the arithmetic, and
                  accepted with an answer worth knowing about.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "an empty block", reason: "refused; a layer needs at least one row to respond to." },
                    { expression: "one row, batch layer, while training", reason: "accepted, and answers zeros for every feature, since the row is its own batch and has no spread." },
                    { expression: "one row, batch layer, while predicting", reason: "accepted; the divisor is the running figures, and a fresh layer answers the row itself to within the epsilon." },
                    { expression: "one row, layer or RMS", reason: "accepted, exactly as it would be among any others." },
                    { expression: "one feature, batch layer", reason: "accepted; a column of readings still has a spread." },
                    { expression: "one feature, layer normalisation", reason: "accepted, and every row answers zero, since a row of one value has no spread; under RMS each answers one." },
                    { expression: "a constant column, or a constant row", reason: "accepted and answers zeros for it, which is the epsilon doing its job." },
                    { expression: "a value that is not finite", reason: "refused at the boundary, by the same guard every layer's inputs pass through." },
                    { expression: "a block of the wrong width, or a single row without a row axis", reason: "refused, naming the arrangement the layer reads and the one it was handed." },
                    { expression: "a backward step from a prediction pass, or from another layer's response", reason: "refused; the batch layer's backward step needs the statistics its own training pass measured, and a prediction pass standardised by different numbers." },
                    { expression: "a slope arriving in the wrong arrangement", reason: "refused, for every layer." },
                    { expression: "a step with no gradient, or with a plain gradient", reason: "refused; the batch layer steps only by a gradient carrying the batch's mean and variance, and the weight-normalised layer only by one carrying the lengths' slopes." },
                    { expression: "a momentum of one, or an epsilon of zero", reason: "refused at construction; one would never learn, and zero is a division by zero waiting for a constant column. A momentum of zero is accepted and makes prediction follow the last batch." },
                    { expression: "a negative running variance, or a scale of the wrong length", reason: "refused at construction." },
                    { expression: "a scale of zero", reason: "accepted, and the layer answers the shift for every row; nothing forbids it, and the gradient will move it." },
                    { expression: "a direction of all zeros, for weight normalisation", reason: "refused at construction, and a step that lands a direction exactly on zero is refused the same way, since both slopes divide by its length." },
                    { expression: "a negative magnitude", reason: "accepted; the neuron faces the other way, which is a direction and not an error." },
                    { expression: "a batch layer of the wrong width in a stack", reason: "refused when the stack is built, before any row is read." },
                    { expression: "a ragged block in a request", reason: "refused in words, naming the row whose width differs." },
                  ]}
                />
                <p>
                  The single row while training deserves the last word, because
                  it is the edge that is accepted rather than refused and is
                  documented rather than defended. A training loop that feeds
                  one row at a time through a batch layer trains on a block of
                  zeros and raises nothing, which follows from the arithmetic
                  and is still a mistake, and the remedy is the axis of Part 5
                  rather than a guard.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Practice. Standardising a Block With the Library",
          practice: [
            exercise(
              "Standardise the four, then undo it",
              ["The block is the whole-number four of Part 2, two hidden units read for four people. Send it through a fresh BatchNormalization layer while training and print the mean and the deviation the layer read down each column and the standardised block. Step 3 gives means of 8 and 6 and the second column as 0.3333, 1.0000, −1.6667 and 0.3333.", "Print the two deviations to seven places. Step 4 gives the second as 3.0000017 and says only that the first is 9. Then build a second layer whose scale is the first layer’s deviation and whose shift is its mean, send the block through, and print what comes back and its largest gap to the raw block, which step 5 gives as 8.9e−16."],
              `import numpy as np
from oop_ml import BatchNormalization, PassPurpose

block = np.array([[1.0, 7.0], [1.0, 9.0], [7.0, 1.0], [23.0, 7.0]])
layer = BatchNormalization(n_features=2)

# Run one training pass. The response carries batch_mean, deviation and
# outputs. Print the mean, each deviation to seven places, and the outputs
# rounded to four.

# Build BatchNormalization(n_features=2, scale=..., shift=...) from that
# deviation and mean, run the block through it while training, and print the
# outputs and the largest absolute gap to the raw block.`,
              `import numpy as np
from oop_ml import BatchNormalization, PassPurpose

block = np.array([[1.0, 7.0], [1.0, 9.0], [7.0, 1.0], [23.0, 7.0]])
layer = BatchNormalization(n_features=2)

response = layer.respond_to(block, PassPurpose.TRAINING)
print(f"batch mean {response.batch_mean.tolist()}")
print(f"deviation {' and '.join(f'{value:.7f}' for value in response.deviation)}")
print(f"standardised {response.outputs.round(4).tolist()}")

undo = BatchNormalization(n_features=2, scale=response.deviation, shift=response.batch_mean)
undone = undo.respond_to(block, PassPurpose.TRAINING).outputs
print(f"with the scale and shift set to undo it {undone.round(4).tolist()}")
print(f"largest gap to the raw block {np.max(np.abs(undone - block)):.1e}")`,
              `batch mean [8.0, 6.0]
deviation 9.0000006 and 3.0000017
standardised [[-0.7778, 0.3333], [-0.7778, 1.0], [-0.1111, -1.6667], [1.6667, 0.3333]]
with the scale and shift set to undo it [[1.0, 7.0], [1.0, 9.0], [7.0, 1.0], [23.0, 7.0]]
largest gap to the raw block 8.9e-16`,
              { hints: ["respond_to takes the block and the purpose of the pass. A batch layer standardises by the batch only under PassPurpose.TRAINING, and left out the purpose is predicting, which reads the running figures instead.", "A training response from this layer carries more than an ordinary one, batch_mean and deviation, one entry per feature, with the epsilon already inside the deviation.", "The scale and the shift are constructor arguments, one number per feature, and they default to one and zero. Handing the deviation in as the scale and the mean as the shift is the γ = √(v + ε), β = m of step 5."], check: numberCheck("What deviation does the layer read down the first column, to seven places?", 9.0000006, 6e-08, "The first column holds 1, 1, 7 and 23, whose mean is 8 and whose squared deviations 49, 49, 1 and 225 total 324, a biased variance of 81. The layer takes the root of 81 + 0.00001, which is 9.0000006. The same epsilon moved the second column’s deviation by three times as much, to 3.0000017, because 0.00001 is a larger share of a variance of 9 than of 81.") },
            ),
            exercise(
              "Step the running figures a hundred times",
              ["Step 8 says the running figures move a tenth of the way toward the batch each time the layer is stepped, and step 9 says they move at the step and not at the forward pass. Take one training pass over the four, ask the layer for its backward step with a block of zeros arriving, and step it. Print the running mean and running variance, and what the first row answers while predicting. Step 8 gives 0.6 and 1.8 for the second column and 4.7703 for the 7. It does not give the first column.", "Keep going for a hundred steps of the same batch, recording after each the widest gap between the predicting answers and the training answers of the fresh layer. Print the gap after 1, 10 and 100 steps and the first step at which it is under a hundredth, which step 8 gives as 5.7333, 1.0433, 6.5e−05 and step 53."],
              `import numpy as np
from oop_ml import BatchNormalization, PassPurpose

block = np.array([[1.0, 7.0], [1.0, 9.0], [7.0, 1.0], [23.0, 7.0]])
layer = BatchNormalization(n_features=2)
while_training = layer.respond_to(block, PassPurpose.TRAINING).outputs

gaps = []
for step in range(1, 101):
    # Run a training pass, ask for correction_for with zeros arriving, and
    # replace the layer with the one stepped by that correction's gradient
    # at a rate of 0.1.

    # Append the widest absolute gap between the stepped layer's predicting
    # outputs and while_training. On the first step, also print the running
    # mean, the running variance and the first row's predicting answer.
    pass

# Print the gap after 1, 10 and 100 steps and the first step under 0.01.`,
              `import numpy as np
from oop_ml import BatchNormalization, PassPurpose

block = np.array([[1.0, 7.0], [1.0, 9.0], [7.0, 1.0], [23.0, 7.0]])
layer = BatchNormalization(n_features=2)
while_training = layer.respond_to(block, PassPurpose.TRAINING).outputs

gaps = []
for step in range(1, 101):
    response = layer.respond_to(block, PassPurpose.TRAINING)
    layer = layer.stepped_by(layer.correction_for(response, np.zeros_like(block)).gradient, 0.1)
    predicting = layer.respond_to(block).outputs
    gaps.append(np.max(np.abs(predicting - while_training)))
    if step == 1:
        print(f"running mean {layer.running_mean.round(4).tolist()}, running variance {layer.running_variance.round(4).tolist()}")
        print(f"the first row while predicting {predicting[0].round(4).tolist()}")

print(f"widest gap after 1 step {gaps[0]:.4f}, after 10 {gaps[9]:.4f}, after 100 {gaps[99]:.1e}")
print(f"first under a hundredth at step {next(step for step, gap in enumerate(gaps, 1) if gap < 0.01)}")`,
              `running mean [0.8, 0.6], running variance [9.0, 1.8]
the first row while predicting [0.0667, 4.7703]
widest gap after 1 step 5.7333, after 10 1.0433, after 100 6.5e-05
first under a hundredth at step 53`,
              { hints: ["correction_for takes the layer’s own training response and the block of slopes arriving at its outputs. Its gradient carries the batch’s mean and variance beside the slopes for the scale and the shift, which is how the running figures reach the step without the forward pass changing anything.", "stepped_by takes that gradient and a learning rate and answers a new layer. With zeros arriving, the scale and shift slopes are zero, so the rate moves neither of them and the step only folds the batch a tenth of the way into the running figures.", "A layer exposes running_mean and running_variance, one entry per feature. respond_to with no purpose is a predicting pass, which standardises by those and not by the block in front of it."], check: numberCheck("What is the first column’s running variance after one step?", 9.0, 5e-05, "The running variance starts at 1 and the first column’s batch variance is 81, so one step gives 0.9 × 1 + 0.1 × 81 = 9, beside a running mean of 0.9 × 0 + 0.1 × 8 = 0.8. After one step the layer predicts as though that column had a deviation of 3 where the batch has 9, so the 23 that answered 1.6667 while training answers 7.4 while predicting. That one cell is the 5.7333 the widest gap starts at.") },
            ),
            exercise(
              "Three routes against a nudge",
              ["Send the four through the batch layer while training and ask for its backward step under the slope Part 4 uses, counting up from one across the block. Print the block it passes down and that block’s column sums, then the naive block, the arriving slope over the deviation, and its column sums. Step 12 gives the true sums as zero and the naive ones as 1.7778 and 6.6667. Print the scale and shift slopes as well, which step 13 gives as 8.0 and −2.6667, and 16 and 20.", "Then check one cell without trusting either form. Nudge the first row’s first reading up and down by a hundred-thousandth, rerun the training pass each way, total the arriving slope times the outputs, and divide the difference by the width of the nudge. The lesson works the second column by hand and never prints this cell."],
              `import numpy as np
from oop_ml import BatchNormalization, PassPurpose

block = np.array([[1.0, 7.0], [1.0, 9.0], [7.0, 1.0], [23.0, 7.0]])
layer = BatchNormalization(n_features=2)
arriving = np.arange(1.0, 9.0).reshape(4, 2)

# Run a training pass and ask for correction_for(response, arriving). Print
# passed_down and its column sums, the naive block arriving / deviation and
# its column sums, and the gradient's weights and biases, which are the scale
# and shift slopes.

# For a shift of +1e-5 and then -1e-5, copy the block, move entry [0, 0],
# run a training pass and take np.sum(arriving * outputs). Print the
# passed-down slope at [0, 0], the nudged slope and the naive slope.`,
              `import numpy as np
from oop_ml import BatchNormalization, PassPurpose

block = np.array([[1.0, 7.0], [1.0, 9.0], [7.0, 1.0], [23.0, 7.0]])
layer = BatchNormalization(n_features=2)
arriving = np.arange(1.0, 9.0).reshape(4, 2)

response = layer.respond_to(block, PassPurpose.TRAINING)
correction = layer.correction_for(response, arriving)
naive = arriving / response.deviation
print(f"passed down {correction.passed_down.round(4).tolist()}")
print(f"its column sums {np.abs(correction.passed_down.sum(axis=0)).round(4).tolist()}")
print(f"naive form {naive.round(4).tolist()}")
print(f"its column sums {naive.sum(axis=0).round(4).tolist()}")
print(f"scale slopes {correction.gradient.weights.ravel().round(4).tolist()}, shift slopes {correction.gradient.biases.round(4).tolist()}")

totals = []
for shift in (1e-5, -1e-5):
    moved = block.copy()
    moved[0, 0] += shift
    totals.append(np.sum(arriving * layer.respond_to(moved, PassPurpose.TRAINING).outputs))
print(f"first reading of the first row: passed down {correction.passed_down[0, 0]:.4f}, by nudging {(totals[0] - totals[1]) / 2e-5:.4f}, naive {naive[0, 0]:.4f}")`,
              `passed down [[-0.1605, -0.9259], [0.0617, -0.1111], [0.1358, -0.037], [-0.037, 1.0741]]
its column sums [0.0, 0.0]
naive form [[0.1111, 0.6667], [0.3333, 1.3333], [0.5556, 2.0], [0.7778, 2.6667]]
its column sums [1.7778, 6.6667]
scale slopes [8.0, -2.6667], shift slopes [16.0, 20.0]
first reading of the first row: passed down -0.1605, by nudging -0.1605, naive 0.1111`,
              { hints: ["The correction carries passed_down, the slopes at the layer’s inputs, and gradient, whose weights hold the scale slopes, one row per feature, and whose biases hold the shift slopes.", "The naive form treats the mean and the deviation as constants, so it is the arriving slope times the scale over the deviation. The scale is one on a fresh layer, and the response carries the deviation.", "The objective being differenced is the arriving slope times the outputs, summed over the block. The nudged passes have to be training passes, or the layer standardises by its running figures and the three routes are not there to measure."], check: numberCheck("What slope does the layer pass down to the first reading of the first row, to four places?", -0.1605, 0.0005, "In the first column the arriving slopes are 1, 3, 5 and 7, which total 16, and the standardised values are −0.7778, −0.7778, −0.1111 and 1.6667, so the sum of slope times value is 8. The compact form gives (4 × 1 − 16 − (−0.7778) × 8) / (4 × 9), which is −0.1605, and the nudge agrees. The naive form reports 1 / 9 = 0.1111 for the same cell, the wrong sign, and those two sums, 16 and 8, are the shift slope and the scale slope the layer reports for that column.") },
            ),
            exercise(
              "One row, three layers",
              ["Step 6 says a row’s answer under the batch layer depends on its company, and Part 5 says a row layer’s does not. Send the first row, (1, 7), through a fresh batch layer three ways, among the four while training, alone while training, and alone while predicting. Steps 6 and 7 give −0.7778 and 0.3333, then zeros, then 0.999995 and 6.999965.", "Then send the four through LayerNormalization and through RMSNormalization, and the first row alone through each, and print whether the first row’s answer alone is the same as among the four. Step 14 gives ±0.9999994 for the first row and step 17 gives 0.2000 and 1.4000. Print the second row’s answers under RMS on a line of their own, which the lesson does not work."],
              `import numpy as np
from oop_ml import BatchNormalization, LayerNormalization, PassPurpose, RMSNormalization

block = np.array([[1.0, 7.0], [1.0, 9.0], [7.0, 1.0], [23.0, 7.0]])
first = block[:1]

# Build a BatchNormalization of two features and print the first row's
# answer among the four while training, alone while training, and alone
# while predicting.

# For LayerNormalization and RMSNormalization of two features, print the
# four rows' answers, the first row's answer alone, and whether the two
# agree exactly. Then print the second row's answers under RMS to four places.`,
              `import numpy as np
from oop_ml import BatchNormalization, LayerNormalization, PassPurpose, RMSNormalization

block = np.array([[1.0, 7.0], [1.0, 9.0], [7.0, 1.0], [23.0, 7.0]])
first = block[:1]

batch = BatchNormalization(n_features=2)
print(f"batch layer, among the four {batch.respond_to(block, PassPurpose.TRAINING).outputs[0].round(4).tolist()}")
print(f"batch layer, alone while training {batch.respond_to(first, PassPurpose.TRAINING).outputs[0].round(4).tolist()}")
print(f"batch layer, alone while predicting {batch.respond_to(first).outputs[0].round(6).tolist()}")

for name, layer in [("layer normalisation", LayerNormalization(n_features=2)), ("RMS normalisation", RMSNormalization(n_features=2))]:
    among = layer.respond_to(block).outputs
    alone = layer.respond_to(first).outputs
    print(f"{name}, the four rows {among.round(7).tolist()}")
    print(f"{name}, the first row alone {alone[0].round(7).tolist()}, the same as among the four {bool(np.array_equal(alone[0], among[0]))}")
print(f"RMS normalisation, the second row {among[1, 0]:.4f} and {among[1, 1]:.4f}")`,
              `batch layer, among the four [-0.7778, 0.3333]
batch layer, alone while training [0.0, 0.0]
batch layer, alone while predicting [0.999995, 6.999965]
layer normalisation, the four rows [[-0.9999994, 0.9999994], [-0.9999997, 0.9999997], [0.9999994, -0.9999994], [0.9999999, -0.9999999]]
layer normalisation, the first row alone [-0.9999994, 0.9999994], the same as among the four True
RMS normalisation, the four rows [[0.2, 1.3999997], [0.1561737, 1.4055637], [1.3999997, 0.2], [1.3529412, 0.4117647]]
RMS normalisation, the first row alone [0.2, 1.3999997], the same as among the four True
RMS normalisation, the second row 0.1562 and 1.4056`,
              { hints: ["All three layers are built from the number of features they read, n_features=2 here, and all three answer through respond_to with the block and, optionally, the purpose.", "Slicing with block[:1] keeps the first row as a block of one row, which is what a layer reads. Indexing with block[0] would hand over a flat row and be refused.", "The row layers reduce inside each row, so they do the same thing under either purpose and no purpose needs stating. np.array_equal compares two arrays exactly, to the last bit."], check: numberCheck("What does RMS normalisation answer for the larger entry of the second row, (1, 9), to four places?", 1.4056, 0.0005, "The mean of the squares is (1 + 81) / 2 = 41, and the root of 41 with the epsilon inside is about 6.4031, so the row answers 1 / 6.4031 = 0.1562 and 9 / 6.4031 = 1.4056. Under layer normalisation the same row is −1 and 1 to within the epsilon, exactly as the first row is, because a row of two only says which entry is larger. RMS keeps the proportions, so (1, 7) and (1, 9) stay apart as 1.4000 and 1.4056.") },
            ),
          ],
        },
      ]}
    />
  );
}
