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
  title: "Normalization Layers · Perceptron Lab",
  description:
    "Normalization changes the reference and scale of values passed through a network. The values grouped for that calculation distinguish methods such as batch and layer normalization and affect their behavior during training and prediction.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function NormalisationLayersPage() {
  return (
    <ConceptPage
      lessonId="normalisation-layers"
      intuition={lessonIntuitions["normalisation-layers"]}
      technicalStart="Part 2. Standardize Inside the Model"
      openingTitle="The Inputs Keep Changing While the Layer Learns"
      playgroundTitle="Compare what each normalization rule changes"
      playgroundIntro="Check which axis supplies the statistics. Compare the values before and after normalization, then distinguish learned scale and shift from the measured statistics."
      title="Normalization Layers"
      tagline={"Normalization changes the reference and scale of values passed through a network. The values grouped for that calculation distinguish methods such as batch and layer normalization and affect their behavior during training and prediction."}
      prerequisites={<>The <Link href="/concepts/feature-scaling" className={link}>feature-scaling page</Link> introduces subtracting a mean and dividing by a standard deviation. The <Link href="/primers/statistics" className={link}>statistics primer</Link> explains those quantities. We reuse the <Link href="/concepts/dropout" className={link}>dropout page’s</Link> network and the <Link href="/concepts/training-a-network" className={link}>training loop</Link>. Part 4 applies <Link href="/concepts/backpropagation" className={link}>backpropagation</Link> through statistics calculated from the layer’s own inputs.</>}

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
                  Recall the network from the dropout lesson. Its sixteen ReLU hidden units read height and weight, and the output unit reads their activations. During training we update both layers. So, while the output unit is learning how to use those sixteen values, the hidden layer is changing the values it supplies. We can measure those changes instead of assuming they are small.
                </p>
                <p>The recorded run follows four hundred epochs on all twenty-five people. During that run, one hidden unit’s mean activation changes from 0.439 to 1.529, while its standard deviation changes from 0.819 to 3.097. The output layer is learning from inputs whose scale is changing.</p>
</>
                <DriftChart />
                <p>
                  Across this run, the largest shift in a hidden unit&apos;s mean is 1.0897. The largest mean change within one epoch is 0.1375. The inputs reaching the output layer therefore change during training. The original batch-normalization paper called changes in internal distributions internal covariate shift. These mean and standard-deviation traces show aspects of that change, but they do not describe the full distributions or establish why normalization might help.
                </p>
                <KeepInMind>
                  A hidden layer&rsquo;s outputs are a distribution the layer
                  above learns against, and that distribution moves whenever
                  the hidden weights move, which is every step. On the crowd
                  network the means of the sixteen units shift by up to 1.09
                  over training and up to 0.14 in one epoch.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What standardizing once before the model cannot fix" id="2-what-standardising-once-before-the-model-cannot-fix">
                <p>The feature-scaling lesson standardized the measured inputs before they entered the model. That fixes the reference for the first layer, but a later layer reads activations produced by weights that keep changing. Here we insert a normalization step between layers. During batch-normalization training, it measures the current batch, meaning the examples processed together on this pass. During prediction it uses saved statistics instead. We will keep those two behaviors separate.</p>
                <>
<p>

                  Switch the chart above to the batch layer and the sixteen lines start at exactly zero and one, because that is what standardizing does to them. What happens afterwards is the claim this page has to be plain about. The block the output layer reads still moves, and by more. The largest mean shift over training is 1.3204 against the plain network&rsquo;s 1.0897, and the largest single-epoch move is 0.3113 against 0.1375.
                </p>
                <p>
                  What differs is what moved it. Under the batch layer the mean of what the output layer reads equals the layer&rsquo;s shift to within 1.8e−15 at every epoch, so the location and spread of the block are two explicit parameters per unit that the gradient moves on purpose, rather than a by-product of sixteen weight vectors being adjusted for other reasons.
                </p>
</>
                <KeepInMind>
                  These measurements do not show a fixed output distribution: the learned scale and shift can move it during training. Santurkar and colleagues’ 2018 analysis argues that optimization smoothness helps explain batch normalization’s benefits, rather than reduced internal distribution drift alone. The traces here measure means and spreads; they do not establish that optimization explanation by themselves.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        { id: "part-2-standardise-inside-the-model",
          title: "Part 2. Standardize Inside the Model",
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
                <p>For this column, subtracting the mean gives deviations 1, 3, −5 and 1. Their squares are 1, 9, 25 and 1. This SDK divides the squared-deviation total by the number of rows, using the population-form batch variance in its forward calculation. The backward calculation must differentiate that same rule. Some implementations use a different variance convention for the running estimate used at prediction time.</p>
                <Equation>{"1 + 9 + 25 + 1 = 36,   36 / 4 = 9"}</Equation>
                <WorkedExample title="The second column, standardized">
                  <p>

                    Each value becomes its distance from the mean over the
                    deviation, and the playground prints 0.3333, 1.0000,
                    −1.6667 and 0.3333 under that column. The first column runs
                    the same way, a mean of 8 and a deviation of 9, to
                    −0.7778, −0.7778, −0.1111 and 1.6667. Click any cell and
                    change it, and the whole column answers differently,
                    because the mean it was standardized by has moved.
                  </p>
                  <Equation>{"(7 − 6) / 3 =  0.3333\n(9 − 6) / 3 =  1.0000\n(1 − 6) / 3 = −1.6667\n(7 − 6) / 3 =  0.3333"}</Equation>
                </WorkedExample>
                <InAModel title="Twenty of the crowd">
                  <p>

                    Press An Ideal Case and the block is twenty of the
                    crowd, heights in centimeters down one column and weights
                    in kilograms down the other. The layer reads a mean height
                    of 151.9 and a mean weight of 51.85, deviations of 17.2827
                    and 15.7298, and the first person, 147 centimeters and 41
                    kilograms, comes out as −0.2835 and −0.6898, a little short
                    and rather light for this crowd. That is the feature scaling
                    page&rsquo;s standardization exactly, made on the block in
                    front of the layer rather than on a table beforehand.
                  </p>
                </InAModel>
                <KeepInMind>

                  A batch layer standardizes each feature by the mean and the
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
                  <p>Adding a fixed positive epsilon keeps the denominator positive when a column’s variance is zero. The reciprocal square root also has a finite derivative there. For positive variance, the normalized variance is below one by the ratio shown next. A constant column still has normalized variance zero.</p>
                  <Equation>{"normalized variance = v / (v + ε)\nworked column: 9 / (9 + 0.00001) ≈ 0.9999989"}</Equation>
                  <p>

                    Type five into every cell of a column. Centering produces zeros, and
                    the normalized output is zero for each row. A learned shift can
                    still move those outputs afterward.
                  </p>
                </>
                <KeepInMind>

                  The epsilon is what makes a constant feature normalize to
                  zeros instead of to nothing, and it is why the deviations on
                  this page carry a seventh decimal.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The scale and the shift give back what standardizing took" id="5-the-scale-and-the-shift-give-back-what-standardising-took">
                <p>After standardizing, this implementation applies a learned scale and shift for each feature. They start at one and zero, leaving the standardized values unchanged initially. The extra parameters let training choose a useful offset and amplitude instead of requiring every output feature to retain the normalized reference. They do not recover information removed by every possible normalization rule.</p>
                <Equation>{"standardized = (value − mean) / √(variance + ε)\nanswer       = scale · standardized + shift"}</Equation>
                <ScaleShiftUndo />
                <>
<p>

                  Press Undo exactly and the sliders jump to the column&rsquo;s own deviation and mean, 3.0000017 and 6 for the second feature, and the answer is the raw column back again. The largest gap between the answer and the raw block is 8.9e−16, and the first row&rsquo;s 1 comes back as 0.9999999999999991, which is a rounding of the last bit rather than anything the standardizing left behind.
                </p>
                <p>For this one fixed batch, we can choose scale and shift from its statistics and recover the original values. That explains the identity check below. A learned pair stays fixed across examples and batches, though, while training-time batch statistics can change. The check therefore does not prove that one learned pair undoes normalization for every possible batch.</p>
</>
                <WhyThisWorks title="Why the identity is reachable">
                  <p>

                    Write γ for the scale, β for the shift, m for the mean and
                    v for the variance, and set the pair to the very numbers
                    the layer standardized by.
                  </p>
                  <Equation>{"γ = √(v + ε),   β = m\nγ · (x − m) / √(v + ε) + β = (x − m) + m = x"}</Equation>
                  <p>
                    The root cancels the root and the mean cancels the mean,
                    for every row at once, because the same two numbers served
                    every row of the column.
                  </p>
                </WhyThisWorks>
                <KeepInMind>

                  The learned scale and shift change the parameterization of the signals passed onward. They can undo the standardization for a chosen fixed set of statistics. Whether the resulting normalization helps optimization or preserves a useful representation across changing inputs requires a separate argument or measurement.</KeepInMind>
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
                  the crowd it was standardized by.
                </p>
                <p>For ordinary prediction, this SDK aims to give the same example the same result regardless of the other examples in its request. It therefore uses stored statistics instead of measuring the prediction batch. During training, it uses current-batch statistics and differentiates through them. Some other evaluation procedures deliberately adapt statistics at prediction time, so the two-mode choice belongs to this interface.</p>
                <KeepInMind>
                  The batch-normalization layer uses current statistics during training and saved statistics during prediction. Selecting the wrong mode changes the calculation and can prevent the running state from being updated as intended. This SDK defaults to prediction mode and requests training mode explicitly in its backward-pass helper.</KeepInMind>
              </SubSection>

              <SubSection title="7. Batch Normalization With One Observation" id="7-a-batch-of-one-cannot-be-batch-normalised-while-training">
                <>
<p>

                  Push the first row through on its own while training and the batch is that one row. Its mean is itself, its deviation is the root of zero plus ε, and the layer answers zeros for both features, which is the same answer the constant column got in step 4 and for the same reason: a batch of one carries no spread to standardize by.
                </p>
                <p>This implementation accepts the one-row batch. Centering produces zero for every feature, so the affine output is the learned shift, initially zero. The input gradient and scale gradient vanish for this batch, while the shift and later layers may still receive gradients. It removes the example’s varying input information rather than making every part of the network unable to train.</p>
</>
                <NumberTable
                  headings={["the row (1, 7) on its own", "answer"]}
                  rows={[
                    ["batch layer, while training", "0.0000, 0.0000"],
                    ["batch layer, predicting, fresh running figures", "0.999995, 6.999965"],
                    ["batch layer, predicting, after a hundred steps", "−0.7778, 0.3334"],
                    ["layer normalization", "−0.9999994, 0.9999994"],
                    ["RMS normalization", "0.2000, 1.4000"],
                  ]}
                  caption="The same row under each layer and purpose, read from the widget in step 8. The training batch variance is zero for a single observation; epsilon still supplies a positive denominator."
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

                  A one-row batch supplies no across-example variation for these batch statistics. Row normalization instead uses the features within the example, so it can work without other examples. Its own behavior still depends on feature count and variation, as Part 5 explains.</KeepInMind>
              </SubSection>

              <SubSection title="8. The running figures, and predicting by them">
                <p>

                  What prediction standardizes by is a running mean and a
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
                  Here momentum 0.9 means retaining nine tenths of the previous estimate and adding one tenth of the new batch statistic. Some frameworks call the new-statistic weight momentum instead, so their 0.1 can describe this same update. A larger representative batch can make a batch statistic less noisy, but it does not change the retention factor or erase the running estimate&apos;s history. Check the update convention when moving between implementations.
                </p>
                <p>On twenty measured people, the initial running height mean moves from zero to 15.19 centimeters after one update, while the current batch mean is 151.9. Predictions using that early running estimate can differ substantially from training-mode outputs. The estimate reflects its initialization and update history, not a new measured population.</p>
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
<p>A training-mode forward call without an update leaves these running statistics unchanged. That differs from frameworks that update them during forward evaluation. If a caller wants to calibrate statistics on representative batches without changing scale and shift, it must use this SDK’s state-update path deliberately. Neither timing convention is inherently correct for every use.</p>
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
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Movement of the block read by the output layer:\n                         plain network  batch-normalised\nlargest mean shift       1.0897         1.3204\nlargest epoch-to-epoch move 0.1375       0.3113\nLower movement would mean steadier by these measures."
              },
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
              "This column’s raw population standard deviation is 3. The layer adds epsilon to its variance before taking the square root, giving the slightly larger displayed denominator. Epsilon also keeps the denominator positive for a constant column. After centering, that constant column normalizes to zeros rather than producing a division by zero.",
            ),
            trueFalse(
              "Setting the scale and shift to the very deviation and mean the layer standardized by returns the raw column.",
              true,
              "For this same batch, choosing the scale as the exact normalization denominator and the shift as the batch mean reverses the transformation. The tiny reconstruction gap is floating-point error. This shows that scale and shift can reproduce the input for a fixed batch; one pair of learned values need not undo every future batch’s different statistics.",
            ),
            choice(
              "The first row, (1, 7), is pushed through a fresh batch layer on its own while training. What comes back?",
              [
                "Zeros for both features, with nothing refused",
                "−0.7778 and 0.3333, as it answered among the four",
                "A refusal, since a batch of one has no spread to standardize by",
                "0.999995 and 6.999965, the row itself to within the epsilon",
              ],
              0,
              "With one observation per feature, each batch mean equals that observation and the centered values are zero. A fresh layer therefore outputs zeros in training mode. The input gradient through this normalization is also zero, although a learned shift can still update. Prediction uses stored running statistics instead, so this fresh layer gives a different result.",
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
              "In this SDK, stepping the layer updates its running mean and variance toward the current batch statistics. A forward training call without a step leaves them unchanged. Repeated updates on this same batch bring prediction outputs closer to training outputs. Under suitable sampling assumptions, larger batches can reduce statistical noise, but they do not change the configured moving-average coefficient.",
              {
                "description": "This SDK starts running mean at 0 and running variance at 1. A training forward pass saves batch statistics; the following step updates each running statistic as 0.9 × old + 0.1 × batch.\n\nWorked column: 7, 9, 1, 7; batch mean 6; biased variance 9.\nScale = 1; shift = 0; ε = 0.00001.\nRepeated steps on this same batch first put the largest predicting/training difference below 0.01 at step 53."
              },
            ),
        ],
        },
        {
          title: "Part 4. The Backward Pass Has Three Routes",
          content: (
            <>
              <SubSection title="10. Why the mean is not a constant">
                <>
<p>{"The backward calculation must include how the group statistics depend on the inputs. Treating the mean and deviation as constants would suggest simply dividing each arriving derivative by the deviation. But changing one person's hidden activation also changes that unit's batch mean and variance, affecting the normalized values of the other people. Those additional dependencies contribute to the correct gradient."}</p>
                <p>

                  So one input reaches the loss by three routes, directly through its own standardized value, through the mean, and through the variance, and the gradient has to collect all three.
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

                  Write n for the number of rows, z for the standardized block,
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
                      9, 1 and 7, which step 3 standardized to 0.3333, 1.0000,
                      −1.6667 and 0.3333 with a deviation of 3. Let the slopes
                      arriving at that column be 2, 4, 6 and 8, and leave the
                      scale at one, so d is the arriving slope itself. The two
                      sums come first, because every row shares them.
                    </p>
                    <Equation>{"Σ d        = 2 + 4 + 6 + 8 = 20\nΣ (d · z)  ≈ 2 × 0.3333 + 4 × 1 + 6 × (−1.6667) + 8 × 0.3333 ≈ −2.6667\nn · s      ≈ 4 × 3 = 12"}</Equation>
                    <p>

                      Each row then takes its own direct term, n times its
                      arriving slope, less the first sum, less its own
                      standardized value times the second sum, all over n
                      times the deviation.
                    </p>
                    <Equation>{"row 1   (4 × 2 − 20 − 0.3333 × (−2.6667)) / 12       ≈ −0.9259\nrow 2   (4 × 4 − 20 − 1 × (−2.6667)) / 12            ≈ −0.1111\nrow 3   (4 × 6 − 20 − (−1.6667) × (−2.6667)) / 12    ≈ −0.0370\nrow 4   (4 × 8 − 20 − 0.3333 × (−2.6667)) / 12       ≈  1.0741\n\ncolumn sum    −0.9259 − 0.1111 − 0.0370 + 1.0741 ≈ 0\nnaive form    d / s ≈ (0.6667, 1.3333, 2, 2.6667), which sums to 6.6667"}</Equation>
                    <p>The first row’s arriving derivative is positive, at 2, but its input derivative is negative. Changing this input affects both the column mean and variance, and therefore the normalized values in other rows as well. Those shared effects outweigh its direct contribution here. The summed arriving derivative is 20, compared with 8 in this row’s direct numerator term; the full formula also includes the variance contribution. Treating the statistics as fixed instead gives 0.6667.</p>
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
                <p>A finite-difference check gives an independent numerical comparison. Nudge one input slightly upward and downward, recompute the batch statistics for each forward pass, and compare the resulting weighted sum of outputs. The weights are the arriving derivatives, so this scalar check tests the backward calculation’s input gradient. The widget compares that result with the full formula and the fixed-statistics shortcut for every cell.</p>
                <BackwardCheck initialLayer="batch" initialBlock={0} />
                <>
<p>{"The backward calculation agrees with finite differences to 2.1e−10 across the block. Treating the batch statistics as fixed produces an error of 2.0370, larger than the largest true slope of 1.0741. Every derivative in its first column also has the wrong sign. The problem is the missing dependence through the shared statistics, rather than harmless rounding. We can check that dependence another way without using a reference derivative."}</p>
                <p>

                  Shifting a whole column by a constant cannot change what a centering layer answers, so the true block&rsquo;s columns must sum to zero, and they do, to 2.2e−16; the naive block&rsquo;s sum to 1.7778 and 6.6667.
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
<p>The scale gradients are 8.0 and −2.6667; the shift gradients are 16 and 20. These depend on the normalized values and arriving derivatives, so they do not identify an incorrect formula for the gradient passed to earlier layers. Checking only the normalization layer’s own parameter gradients could therefore miss this error. Correct parameter shapes or a decreasing training loss would not prove that the earlier gradients are correct.</p>
                <p>
                  That is why the check has to be on the block passed down, and why the tests behind this page run the finite difference rather than trusting the derivation.
                </p>
</>
                <KeepInMind>
                  Check the input gradient as well as the scale and shift gradients. Finite differences compare numerical derivatives, while the zero-sum property supplies a useful necessary condition. A zero column sum alone is not sufficient to prove that every derivative is correct.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Reduce Inside the Row Instead",
          content: (
            <>
              <SubSection title="14. Layer normalization, the same move along the row" id="14-layer-normalisation-the-same-move-along-the-row">
                <p>Layer normalization measures across the features of one example rather than across examples. It subtracts that row’s mean and divides by its own deviation. Other rows therefore do not affect its result. In this implementation, the calculation is the same during training and prediction, with no running batch statistics. Select Layer in the playground to see the normalization axis change.</p>
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

                  Layer normalization is batch normalization with the sum
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
                <p>On the three-feature block, the input gradient agrees with finite differences to 1.5e−09, compared with a largest gradient magnitude of 0.5123. Its row sums are zero to 4.5e−16. The fixed-statistics shortcut misses by 5.3404 and has row sums as large as 14.1203.</p>
<p>On the two-feature block, the correct input gradients are tiny and round to zero at the displayed precision. The shortcut still differs by about 2.0. The positive epsilon means those small derivatives need not be exactly zero.</p>
                <KeepInMind>
                  Same three routes, same finite-difference agreement, and the
                  zero-sum check runs along the row instead of down the column.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. When the row is the wrong axis">
                <>
<p>For two unequal values, subtracting their mean produces opposite deviations of the same magnitude. Without epsilon, dividing by their standard deviation would give exactly minus one and one. With positive epsilon, the magnitudes are slightly below one and depend on the difference between the inputs. The row (1, 7) therefore gives approximately ±0.9999994, rather than that same value for every possible row.</p>
                <p>For these twenty height-and-weight rows, height is always the larger raw number. Layer normalization makes all outputs very close to (1, −1), erasing the row mean and leaving very little variation at this scale. The input derivatives are correspondingly tiny, rather than exactly zero merely because there are two features.</p>
</>
                <RowAxisDemo />
                <>
<p>Across these forty outputs, the largest departure from ±1 is 2.6e−09. The normalized rows are almost indistinguishable in this example. Column-wise normalization instead compares each height with other heights and each body weight with other body weights. Row-wise normalization compares centimeters directly with kilograms here, so changing either unit can alter that comparison.</p>
<p>Layer normalization is often useful on a vector of related hidden features, such as a token representation. It still removes a row-wise reference and changes scale, so choose the axis according to what information the application should preserve.</p>
                <p>
                  Which is the sentence that decides between the two layers, and it is a sentence about the data.
                </p>
</>
                <KeepInMind>

                  Layer normalization describes features relative to the other features in the same example. With only two raw values and a small epsilon, the result can be almost just their ordering. A wider hidden vector can retain more relative structure, but the choice still depends on what those features mean.</KeepInMind>
              </SubSection>

              <SubSection title="17. RMS normalization drops the centering" id="17-rms-normalisation-drops-the-centring">
                <p>RMS normalization divides by the row’s root mean square without first subtracting its mean. It preserves relative proportions within the row while changing their overall scale. Zhang and Sennrich’s 2019 paper tested whether that simpler rescaling could retain the benefits of layer normalization in their models. Removing centering saves work and removes the mean-subtraction dependency from the backward calculation; it does not establish that centering is unnecessary for every task.</p>
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

                  With RMS normalization, the first two rows are [1.3622, 0.3799] and [1.3390, 0.4549]. They remain different because the operation preserves within-row proportions rather than centering first. Conventional RMSNorm omits a shift. This implementation includes a shift initialized to zero; it matches that no-shift form while the shift stays zero, but learning a nonzero shift changes the model.
                </p>
                <KeepInMind>

                  RMS normalization is layer normalization with the mean route
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
                "Every column of the passed-down block must sum to zero, since shifting a whole column cannot change what a centering layer answers",
                "The scale and shift slopes must come out positive",
                "The passed-down block must have the same shape as the input",
                "The passed-down block must sum to the arriving slope",
              ],
              0,
              "The true block’s columns sum to zero to 2.2e−16 where the naive block’s sum to 1.7778 and 6.6667. On the second column the three routes give −0.9259, −0.1111, −0.0370 and 1.0741, and the naive form gives 0.6667, 1.3333, 2 and 2.6667. The parameter slopes cannot tell the two forms apart, since both are sums over the standardized block and the arriving slope alone, so the check has to be on the block passed down.",
            ),
            trueFalse(
              "A network built on the naive backward form fails visibly, with a loss that will not fall.",
              false,
              "A falling training loss does not verify that every backward derivative is correct. Changing an input changes the direct normalized value and also the batch mean and variance. Dividing the incoming derivative by the stored denominator keeps only the direct contribution. A numerical input-derivative check can expose the missing routes even when scale and shift gradients are correct.",
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
              "With two unequal features, centering places them at equal and opposite distances from their row mean. Without epsilon, normalization would reduce them to a sign pair. With this layer’s positive epsilon, the outputs are close to that pair and the input derivatives can be very small, but they are not generally exactly zero. That loses much of the magnitude information that distinguishes these height-and-weight rows.",
            ),
            choice(
              "What does RMS normalization leave out that layer normalization does?",
              [
                "Subtracting the row’s mean, so the row’s level survives and only its size is fixed",
                "The small constant under the square root",
                "The learned scale, so the answers always have a root mean square of one",
                "The division, so the row is centered and left at its own spread",
              ],
              0,
              "It divides the row by its root mean square as it stands, so the row (1, 7) answers 0.2000 and 1.4000, which no longer sum to zero. There is one reduction instead of two on the way forward and one route fewer on the way back, since there is no mean for an input to reach the loss through. The row-sum check stops applying for the same reason, and twenty of the crowd stay apart as rows where layer normalization turned them all into 1 and −1.",
            ),
        ],
        },
        { id: "part-6-weight-normalisation-a-different-animal",
          title: "Part 6. Weight Normalization, a Different Animal",
          content: (
            <>
              <SubSection title="18. A direction and a length">
                <p>Weight normalization changes how a dense layer stores its weights, rather than normalizing its activation batch. It keeps a nonzero direction vector and a scalar multiplier for each neuron. Dividing the direction vector by its norm gives a unit vector; multiplying by the scalar reconstructs the effective weights.</p>
<p>This SDK permits a negative scalar. Its absolute value is the weight vector’s norm, and its sign can reverse the orientation. The forward result matches a dense layer using those reconstructed weights and the same activation.</p>
                <Equation>{"weights = magnitude · direction / ‖direction‖"}</Equation>
                <p>With ordinary weight coordinates, an update may change both norm and orientation. Some updates change only one; rotation is not inevitable. In the normalized coordinates, changing the direction while keeping the scalar fixed leaves the effective norm unchanged. Changing the scalar controls that norm and can reverse orientation if its sign changes.</p>
                <KeepInMind>

                  Weight normalization keeps the family of dense-layer functions while changing their parameter coordinates. Gradient descent in those coordinates generally follows a different path. Salimans and Kingma proposed this as a way to separate weight scale from direction without batch-dependent activation statistics.</KeepInMind>
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
                <p>The direction-gradient formula removes the radial component associated with rescaling the stored direction. Omitting that projection can produce an incorrect gradient with a plausible shape and magnitude. The finite-difference check below uses three neurons with tanh activation on five standardized examples. Their stored direction norms are 1, 2.5 and 0.5.</p>
                <ReparameterisationCheck />
                <>
<p>{"The two forward implementations differ by exactly 0 because they perform the same arithmetic. Their gradient checks reveal the distinction: the direction derivative agrees to 3.6e−10 and the length derivative to 1.1e−10, with a largest true direction slope of 2.9973. Omitting the projection misses by 1.8286, about six tenths of that largest slope. Identical predictions alone therefore do not establish that the parameter derivatives are correct."}</p>
                <p>
                  And there is a structural check here too. Scaling a stored direction by any positive constant leaves every answer unchanged, so the loss is flat along the direction itself and the slope can have no part along it. The projected direction slope dotted with the direction is 8.9e−16, and the unprojected form&rsquo;s is 3.6914.
                </p>
</>
                <KeepInMind>
                  The true direction gradient is orthogonal to the stored direction because positive rescaling leaves the effective weights unchanged. Their dot product is a useful structural check. It is an additional condition to test, rather than a substitute for the full derivative calculation.</KeepInMind>
              </SubSection>

              <SubSection title="20. Same slope, different destination">
                <>
<p>Changing parameter coordinates can change the effective weight update produced by the same numerical learning rate. In the displayed example, one step at 0.1 leaves the effective weights 0.0364 away from the ordinary dense-layer update. Comparing the resulting norms shows part of that difference.</p>
                <p>For neuron 1, the effective norm changes from 1 to 1.2286 under weight normalization and to 1.2347 under the dense-layer update. For neuron 3, it changes from 0.5 to 0.3040 and 0.3247 respectively. The ordinary update changes the weight components directly. The normalized update changes the scalar and direction coordinates separately, producing a different effective step.</p>
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
<p>This experiment repeats the dropout page’s five-fold evaluation. Each model trains on twenty of the twenty-five observations and predicts the remaining five, until every observation has an out-of-fold prediction. Repeating the split and initialization seeds helps inspect the variability of this small-sample comparison.</p>
                <p>

                  Heights and weights are put into standard units using the training rows of each fold only. The whole of that is repeated under five seeds and five arrangements of the same sixteen-unit network, no normalization, a batch layer between the hidden and output layers, a layer-normalizing layer there, an RMS layer there, and a weight-normalized hidden layer with nothing inserted, which is a hundred and twenty-five training runs of four hundred full-batch epochs.
                </p>
</>
                <p>The comparison keeps the learning rate at one, the value chosen for the plain network in the dropout lesson. It therefore compares these arrangements under one shared setting, rather than a separately tuned version of each.</p>
                <p>In this SDK, the activation belongs inside the neuron, so the normalization layer follows the rectifier. The original batch-normalization paper normalizes the score before activation. Both orders occur in practice, and the placement is part of what defines the experiment.</p>
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

                  Layer normalization trains to 0.910 and holds out at 0.696, RMS to 0.870 and 0.720, and weight normalization to 0.986 and 0.752, spread 0.68 to 0.80, which is the one arrangement whose seeds are level with the plain network&rsquo;s rather than below them.
                </p>
</>
                <NumberTable
                  headings={["arrangement", "training accuracy", "held out", "held out across seeds", "training loss at the end"]}
                  rows={[
                    ["no normalization", "0.992", "0.744", "0.64 to 0.84", "0.0829"],
                    ["batch layer", "0.904", "0.640", "0.60 to 0.68", "0.2088"],
                    ["layer normalization", "0.910", "0.696", "0.64 to 0.76", "0.1604"],
                    ["RMS normalization", "0.870", "0.720", "0.64 to 0.80", "0.2392"],
                    ["weight normalization", "0.986", "0.752", "0.68 to 0.80", "0.0775"],
                  ]}
                  caption="Means over five seeds, each seed five folds, four hundred epochs of full-batch descent at a stride of one, sixteen hidden units."
                />
                <p>At the shared learning rate, the three activation-normalization arrangements finish with lower training accuracy and higher training loss than the plain network. The batch-normalized arrangement also has lower held-out scores in these runs. Weight normalization finishes 0.008 higher in mean held-out accuracy and 0.0054 lower in training loss than the plain comparison. These are results under one common rate, not independently tuned optima or a general ranking of the methods.</p>
                <KeepInMind>
                  The repeated runs show how these implementations behave on this small dataset under a fixed configuration. The small mean differences and variability limit any claim of improvement, while the batch-normalized configuration performs worse in the tested runs. Further datasets and tuning would be needed for a broader comparison.</KeepInMind>
              </SubSection>

              <SubSection title="23. Speed of training, measured">
                <p>We can also compare how many epochs each run needs to reach a chosen loss. The curves below use one seed on the full crowd and a threshold of 0.3. This measures progress per epoch, not elapsed training time; normalization also adds work within an epoch.</p>
                <ArrangementCurves />
                <>
<p>The two row-normalization runs first reach the threshold at epoch 16, compared with epoch 77 for the plain network. The batch-normalized run reaches it at epoch 119. Fewer epochs to this threshold do not guarantee the best final fit: layer normalization finishes at loss 0.1041 versus 0.0813 for the plain network, while RMS finishes at 0.4284 and accuracy 0.76.</p>
                <p>

                  Weight normalization and the plain network start from the identical loss of 0.9863, because the directions are drawn from the same stream in the same order, cross 0.3 on the same epoch, and part only at the end, 0.0753 against 0.0813.
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
                  claim none of the activation normalizers kept. Time the
                  curve against a threshold and read the end separately.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Interpreting the Small-Sample Comparison" id="24-reading-a-small-result-honestly">
                <>
<p>Batch normalization was introduced and evaluated with deep networks and minibatch training. This page uses one hidden layer and a full training fold of twenty observations per update. That difference in architecture and batch regime matters. The mixed labels make fitting and generalization difficult here, but the small experiment does not prove that no method can learn a useful pattern.</p>
                <p>

                  Between those two lies most of practice, and what the measurements support is narrower than the folklore. A normalizing layer changes the surface the gradient descends, and at a given stride that surface can come out easier or harder, so whether it helped is measured across seeds rather than read off the name.
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
              "What does weight normalization change?",
              [
                "Where the parameters live, storing a direction and a length in place of a weight vector",
                "The distribution of the hidden block at runtime",
                "Which axis the statistics run along",
                "The activation the neuron applies",
              ],
              0,
              "Weight normalization stores a direction vector and a separate magnitude for each neuron, then forms the effective weight vector from them. A dense layer stores the effective vector directly. Both can represent the same forward calculation, but gradient descent acts on different parameters and can therefore follow different update paths. Ordinary dense updates do not necessarily change both length and direction on every step.",
            ),
            trueFalse(
              "The direction’s slope should keep its radial component, since lengthening the vector is part of what a direction does.",
              false,
              "Scaling a stored direction by any positive constant leaves every answer unchanged, so the loss is flat along the direction itself and its slope can have no part along it. The projected slope dotted with the direction comes to 8.9e−16 where the unprojected form gives 3.6914, and the unprojected block misses the finite difference by 1.8286.",
            ),
            choice(
              "One step at a stride of 0.1 from the same slope. How far apart do the weight-normalized layer’s effective weights and the dense layer’s land?",
              [
                "0.0364, with the difference showing up in the lengths",
                "Exactly 0, since the forward pass is the same arithmetic",
                "0.0054",
                "1.8286",
              ],
              0,
              "The two layers start with equal effective weights, but their gradients refer to different parameterizations. The same numerical learning rate can therefore produce different effective weights after one update. The comparison demonstrates changed optimization behavior; equal forward expressiveness does not require identical training trajectories.",
            ),
            several(
              "Which of these did the measurement on the crowd network find?",
              [
                              "The batch layer held out at 0.640 against the plain network’s 0.744, with every seed below the plain mean",
                              "Weight normalization finished 0.008 above the plain network on held-out accuracy, which is inside what the seeds move by",
                              "The two row layers crossed a loss of 0.3 at epoch 16 against the plain network’s 77",
                              "The three activation normalizers all trained to a higher accuracy than the plain network",
                            ],
              [0, 1, 2],
              "The three activation normalizers all trained to a lower accuracy and a higher loss at the same stride. A held-out score on twenty-five people moves by 0.04 per person, so the spread across seeds rather than any single number is the ruler the comparison is measured with.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "arrangement | training accuracy | held out | held out across seeds | training loss at the end\nno normalisation | 0.992 | 0.744 | 0.64 to 0.84 | 0.0829\nbatch layer | 0.904 | 0.640 | 0.60 to 0.68 | 0.2088\nlayer normalisation | 0.910 | 0.696 | 0.64 to 0.76 | 0.1604\nRMS normalisation | 0.870 | 0.720 | 0.64 to 0.80 | 0.2392\nweight normalisation | 0.986 | 0.752 | 0.68 to 0.80 | 0.0775\n\nSeed-0 epoch when training loss first falls below 0.3:\nplain: 77; layer normalisation: 16; RMS normalisation: 16."
              },
            ),
            trueFalse(
              "The same batch-normalization layer can give different predictions using the current batch statistics and using its running statistics.",
              true,
              "Training uses statistics from the current batch. Prediction uses a moving estimate gathered over earlier updates. Those estimates can lag or differ from the current batch, so the two modes need not produce identical predictions. The experiment observes that difference during training.",
            ),
        ],
        },
        {
          title: "Part 8. Using the Same Normalization Conventions Throughout" , id: "part-8-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="25. Axes, running statistics and the backward pass" id="25-what-a-complete-implementation-must-specify">
                <p>Start by identifying the axis over which the statistics are measured. The variance divisor and position of epsilon affect the result, as do the initial scale and shift parameters.</p>
                <p>Training and prediction can use different statistics. Record which purpose is the default, how running values are initialized, when and how they update, and whether the running variance uses a bias correction. These are necessary to explain why the same row can receive different outputs in the two modes.</p>
                <p>For the backward pass, account for all three gradient routes and the scale and shift gradients. Weight normalization has a separate constraint: its direction gradient removes the radial component. A zero direction needs explicit treatment because it supplies no direction to normalize.</p>
              </SubSection>

              <SubSection title="26. A single row, constant features and other revealing inputs" id="26-the-edges-each-one-probed">
                <p>

                  Every row below was run rather than reasoned about, and the
                  behaviors fall into three kinds, refused with a typed error,
                  accepted with an answer that follows from the arithmetic, and
                  accepted with an answer worth knowing about.
                </p>
                <DerivationTable
                  expressionHeading="Batch or prediction condition"
                  reasonHeading="Which statistics the layer uses"
                  rows={[
                    { expression: "an empty block", reason: "refused; a layer needs at least one row to respond to." },
                    { expression: "one row, batch layer, while training", reason: "accepted; its centered values are zero, and the output is the learned shift, initially zero." },
                    { expression: "one row, batch layer, while predicting", reason: "accepted; the divisor is the running figures, and a fresh layer answers the row itself to within the epsilon." },
                    { expression: "one row, layer or RMS", reason: "accepted, exactly as it would be among any others." },
                    { expression: "one feature, batch layer", reason: "accepted; multiple observations can supply across-row variance for the single feature. A constant column uses the epsilon rule." },
                    { expression: "one feature, layer normalization", reason: "accepted; one-feature layer normalization centers to zero before the affine step. RMS preserves the input sign and gives a magnitude below or near one for a nonzero input, depending on epsilon; zero remains zero." },
                    { expression: "a constant column, or a constant row", reason: "accepted; centering a constant normalization group produces zeros before scale and shift. RMS does not center, so a nonzero constant row need not produce zeros." },
                    { expression: "a value that is not finite", reason: "refused at the boundary, by the same guard every layer's inputs pass through." },
                    { expression: "a block of the wrong width, or a single row without a row axis", reason: "refused, naming the arrangement the layer reads and the one it was handed." },
                    { expression: "a backward step from a prediction pass, or from another layer's response", reason: "a prediction response without recorded batch statistics is refused. The type check does not identify which batch-normalization instance produced a same-shaped statistics response; callers must retain the matching response." },
                    { expression: "a slope arriving in the wrong arrangement", reason: "refused, for every layer." },
                    { expression: "a step with no gradient, or with a plain gradient", reason: "refused; the batch layer steps only by a gradient carrying the batch's mean and variance, and the weight-normalized layer only by one carrying the lengths' slopes." },
                    { expression: "a momentum of one, or an epsilon of zero", reason: "refused at construction; one would never learn, and zero is a division by zero waiting for a constant column. A momentum of zero is accepted and makes prediction follow the last batch." },
                    { expression: "a negative running variance, or a scale of the wrong length", reason: "refused at construction." },
                    { expression: "a scale of zero", reason: "accepted; the output equals the shift. A subsequent update changes the zero scale only if its computed gradient is nonzero." },
                    { expression: "a direction of all zeros, for weight normalization", reason: "refused at construction, and a step that lands a direction exactly on zero is refused the same way, since both slopes divide by its length." },
                    { expression: "a negative magnitude", reason: "accepted; the neuron faces the other way, which is a direction and not an error." },
                    { expression: "a batch layer of the wrong width in a stack", reason: "refused when the stack is built, before any row is read." },
                    { expression: "a ragged block in a request", reason: "refused in words, naming the row whose width differs." },
                  ]}
                />
                <p>With one observation per batch, this per-feature batch-normalization rule removes the varying input values during training. It returns the shift and passes zero input gradients for that batch. If the task requires single-example updates, consider row normalization on a suitable feature representation or prediction-mode use of representative fixed statistics. The choice depends on what information and training behavior the application needs.</p>
              </SubSection>
            </>
          ),
        },
        { id: "practice-standardising-a-block-with-the-library",
          title: "Practice. Standardizing a Block With the Library",
          practice: [
            exercise(
              "Standardise the four, then undo it",
              [
  "Send the supplied four-observation, two-feature block through a fresh BatchNormalization layer in training mode. Print batch means, epsilon-adjusted deviations to seven decimals and standardized outputs.",
  "Build a second layer with scale equal to those deviations and shift equal to those means. Apply it in training mode to the same block; print reconstruction and largest absolute difference from the original."
],
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
              { hints: [
  "Batch statistics combine observations down each feature column.",
  "The denominator includes epsilon, so use the actual response deviation rather than a rounded display value when setting the inverse scale."
], check: numberCheck("What deviation does the layer read down the first column, to seven places?", 9.0000006, 6e-08, "The first deviation is about 9.0000006. Epsilon is included before the square root, so it differs slightly from the raw standard deviation."), question: "Can learned scale and shift undo a batch’s standardization?" },
            ),
            exercise(
              "Step the running figures a hundred times",
              [
  "Use the supplied batch and repeated training/update loop. After one update print running means/variances and the first row’s predicting output.",
  "Continue through one hundred steps. Compare prediction outputs with the fresh training-mode reference, reporting maximum gaps after one, ten and one hundred steps and the first step below 0.01."
],
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
              { hints: [
  "In this library the running-state update occurs when the layer is stepped, not merely during its forward response.",
  "Zero upstream derivatives isolate that running-state behavior from learned scale/shift updates."
], check: numberCheck("What is the first column’s running variance after one step?", 9.0, 5e-05, "The first running variance becomes 9.0. It is still moving from the initial stored state toward the batch statistic, so prediction and training outputs can differ."), question: "When do running statistics start resembling the repeated batch?" },
            ),
            exercise(
              "Three routes against a nudge",
              [
  "For the supplied four-by-two block, pass the stated increasing upstream derivatives backward through its training response. Print input derivatives and column sums, the naive upstream/deviation result and sums, and scale/shift gradients.",
  "Independently perturb the first input cell up and down by 0.00001. Recompute the supplied scalar objective and compare its finite-difference derivative with the backward result and naive result."
],
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
              { hints: [
  "Changing one input also changes its column’s batch mean and variance.",
  "Use fresh forward responses for both perturbations; keep the upstream coefficient block fixed for the scalar objective."
], check: numberCheck("What slope does the layer pass down to the first reading of the first row, to four places?", -0.1605, 0.0005, "The full derivative is -0.1605 and agrees with the input perturbation. The naive division misses how changing one observation also changes its batch mean and variance."), question: "Why does the batch-normalization derivative include other observations?" },
            ),
            exercise(
              "One row, three layers",
              [
  "Compare the first supplied row under BatchNormalization among all four observations, alone in training mode and alone in predicting mode. Keep the fresh-layer settings stated in the starter.",
  "Apply LayerNormalization and RMSNormalization to all four and to the first row alone. Print complete outputs and equality checks, then RMS outputs for the second row separately."
],
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
              { hints: [
  "Batch normalization pools statistics across observations; layer and RMS forms here operate within each row.",
  "RMS normalization divides by a root-mean-square scale without subtracting the row mean."
], check: numberCheck("What does RMS normalization answer for the larger entry of the second row, (1, 9), to four places?", 1.4056, 0.0005, "The larger second-row RMS output is 1.4056. This rule retains the within-row ratio because it scales without first subtracting the mean."), question: "Which normalization depends on the other observations in a batch?" },
            ),
          ],
        },
      ]}
    />
  );
}
