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
import { DropoutBlockPass } from "@/components/widgets/DropoutBlockPass";
import { DropoutPlayground } from "@/components/widgets/DropoutPlayground";
import { DropoutSweep } from "@/components/widgets/DropoutSweep";
import { ExperimentReadout } from "@/components/widgets/ExperimentReadout";
import { MemorisationCurves } from "@/components/widgets/MemorisationCurves";
import { UnitLeaningChart } from "@/components/widgets/UnitLeaningChart";

export const metadata: Metadata = {
  title: "Dropout · oop_ml",
  description:
    "Randomly mask activations during training and measure whether the network generalises better.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function DropoutPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["dropout"]}
      technicalStart="Part 2. One Draw"
      openingTitle="What if a Useful Neuron Is Missing?"
      playgroundIntro="Compare the original activations with one masked draw, then draw again. Notice the difference between a training pass and a prediction pass."
      title="Dropout"
      tagline="Randomly mask activations during training and measure whether the network generalises better."
      prerequisites={
        <>
          The row of units this page silences is a{" "}
          <Link href="/concepts/dense-layers" className={link}>
            dense layer&rsquo;s
          </Link>{" "}
          answer, the blame it sends back is the{" "}
          <Link href="/concepts/backpropagation" className={link}>
            backpropagation page&rsquo;s
          </Link>{" "}
          arriving slope, and the argument that the two modes agree is a mean
          taken over a coin toss, which is the{" "}
          <Link href="/primers/statistics" className={link}>
            statistics primer&rsquo;s
          </Link>{" "}
          expectation in its simplest form. The crowd the page measures on is
          the{" "}
          <Link href="/concepts/bagging" className={link}>
            bagging page&rsquo;s
          </Link>{" "}
          tangled crowd, and the training against held-out comparison is the{" "}
          <Link href="/concepts/held-out-evaluation" className={link}>
            held-out evaluation page&rsquo;s
          </Link>
          .
        </>
      }

      playground={<DropoutPlayground />}
      sections={[
        {
          title: "Part 1. Why a Network Memorises",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A wide network on a mixed crowd">
                <>
<p>
                  Take the tangled crowd from the bagging page, twenty-five people measured by height and weight, twelve of them children and thirteen adults, with the middle of the crowd mixed on purpose so that no smooth boundary separates the two. Give a network sixteen rectified hidden units, which for twenty rows of two numbers is far more than it needs, and train it hard, four hundred full-batch steps at a stride of one.
                </p>
                <p>
                  It learns the mixed middle person by person. Held out fold by fold, five folds so every person is left out once and averaged over five seeds, it calls 99.2 percent of the rows it trained on correctly and 74.4 percent of the people it did not see.
                </p>
</>
                <MemorisationCurves showLoss={false} />
                <p>
                  Under the first seed, whose folds the chart pools, the
                  training accuracy reaches 0.89 by epoch 100, 0.96 by 200 and
                  0.99 by 400, and the held-out accuracy climbs too, from 0.64
                  to 0.76 to 0.84. Memorising did not visibly cost held-out
                  accuracy on this seed, and I am not going to pretend it did;
                  what it produced is the gap between the two lines, a
                  quarter of the crowd across the five seeds, which is the
                  network reporting a score it will not keep.
                </p>
                <KeepInMind>
                  A network with more capacity than its data can pin down
                  fits the training rows to a standard it cannot reach on new
                  ones. The gap between those two accuracies, and not the
                  training accuracy, is the number to watch.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Units that lean on one another">
                <p>
                  Here is what memorising looks like from inside the layer.
                  Silence one hidden unit at prediction time, leaving the
                  other fifteen as they were, and ask how much of the training
                  accuracy survives. If every unit had learned something
                  useful on its own, losing one would cost a little; if the
                  units had learned to work in particular pairs, losing the
                  wrong one would take its partner&rsquo;s contribution down
                  with it.
                </p>
                <UnitLeaningChart />
                <>
<p>
                  On the network trained without dropout, eleven of the sixteen units can be silenced at no cost at all, and the whole fit turns out to rest on two of them. Silencing the thirteenth unit drops the training accuracy from 1.00 to 0.76 and silencing the twelfth drops it to 0.84, with the sixteenth, third and fourteenth costing 0.12, 0.08 and 0.04.
                </p>
                <p>
                  The right-hand panel is the same measurement on a network trained with dropout at one half, and Part 7 comes back to it; for now notice that silencing any one of its sixteen units changes its accuracy by exactly nothing.
                </p>
</>
                <KeepInMind>
                  The failure dropout addresses has a shape. A wide layer
                  trained to convergence arrives at units that are useful only
                  together, and the fit is fragile in exactly the places
                  those partnerships sit.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What dropout proposes">
                <>
<p>
                  The ensemble cure, many networks averaged, fixes this by making the partnerships disagree with one another, and it costs as many trainings as there are members. Dropout gets the same effect from one training run by breaking the partnerships as they form. On every training pass, each unit in the layer is independently silenced with some probability, so a unit that only means something beside its neighbour finds the neighbour missing on a share of the passes and is pushed toward carrying weight by itself.
                </p>
                <p>
                  Nothing is penalised and no weight is shrunk. The layer is made unreliable while it learns, and section 23 measures what the units did about that.
                </p>
</>
                <p>
                  Each pass therefore trains a different thinned network, and
                  since the thinnings share one set of weights, the thing that
                  is used afterwards is something like the average of all of
                  them. That framing is the paper&rsquo;s and it explains what
                  the method is worth; the framing that explains the mechanism
                  is the one above, that a feature which works only alongside
                  a specific partner now gets a bad score a share of the
                  time.
                </p>
                <KeepInMind>
                  Dropout is a rule about training passes. The network&rsquo;s
                  shape and objective are the same with the layer in as out,
                  and the layer exists so that the layers above it cannot
                  depend on any one unit below.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. One Draw",
          content: (
            <>
              <SubSection title="4. A coin over every unit">
                <p>
                  The box at the top of the page holds one row of four units,
                  the kind of numbers a dense layer answers with, and shows it
                  twice. On the left is one training pass. A coin was tossed
                  over every unit, the ones that lost are greyed out and send
                  nothing on, and the ones that survived have been raised, so
                  a bar that would have stood at 1 stands at 2. On the right
                  is the same row while predicting, where no coin is tossed and
                  nothing is scaled.
                </p>
                <Equation>{"training     out_j = value_j · m_j / (1 − p),   m_j ∈ {0, 1}\npredicting   out_j = value_j"}</Equation>
                <WorkedExample title="Four units, p of one half, seed 10">
                  <>
                    <p>
                      The four units hold 1, 2, 3 and 4. The drop probability is one
                      half. Inverted dropout rescales each surviving value by the
                      reciprocal of the keep probability.
                    </p>
                    <Equation>{"keep probability = 1 − 0.5 = 0.5\nsurvivor multiplier = 1 / 0.5 = 2"}</Equation>
                    <p>
                      Every surviving value doubles. Under seed 10, the first draw keeps
                      the first and third units and silences the second and fourth.
                    </p>
                  </>
                  <Equation>{"1 · 2 = 2,   2 · 0 = 0,   3 · 2 = 6,   4 · 0 = 0\ntraining reads    2, 0, 6, 0\npredicting reads  1, 2, 3, 4"}</Equation>
                  <p>
                    Press the worked example button above and the bars show
                    exactly that. Press draw again and the left side changes,
                    under seed 3 the draw keeps the third and fourth instead
                    and the row reads 0, 0, 6, 8, while the right side never
                    changes at all.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  One training pass is one draw, so which units survive
                  changes from pass to pass while the scale on a survivor is
                  fixed by the probability, and a predicting pass draws
                  nothing and scales nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. A separate draw for every row">
                <p>
                  A layer answers a whole batch at once, one row per person,
                  and the coin is tossed separately over every entry of the
                  block rather than once per unit for the batch. The grid
                  below pushes the worked row through three times as three
                  rows of one block, and the mask differs from row to row.
                </p>
                <DropoutBlockPass showBackward={false} />
                <p>
                  Under seed 10 the three rows keep two, three and two units,
                  and no two rows keep the same set. A mask shared across the
                  batch would let a unit rely on its neighbour for the whole
                  batch and only lose it on the next one, which is a much
                  weaker version of the rule; drawing per row means the
                  partnership is broken for some people on every pass.
                </p>
                <KeepInMind>
                  The draw is independent per unit and per row. Two people in
                  the same batch go through two different thinned networks.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The drop probability is the one knob">
                <p>
                  The probability can sit anywhere in the half-open interval
                  from zero up to but not including one, and the scale follows
                  it. At zero nothing is silenced, the scale is 1, and the
                  layer is an expensive way of doing nothing, which is exactly
                  what a control in a search over this setting needs. At one
                  every unit would be silenced and the scale would be a
                  division by zero, and the layer refuses to be built.
                </p>
                <NumberTable
                  headings={["drop probability", "scale 1 / (1 − p)", "the worked row, first draw under seed 10"]}
                  rows={[
                    ["0", "1", "1, 2, 3, 4, every unit kept, mean over draws exact"],
                    ["0.25", "1.333", "1.333, 0, 4, 0"],
                    ["0.5", "2", "2, 0, 6, 0"],
                    ["0.999", "1000", "a legal layer whose survivors are raised a thousandfold"],
                    ["1", "refused", "silences the whole layer and leaves nothing to scale"],
                  ]}
                  caption="Slide the probability above the bars and the scale label on the survivors moves with it."
                />
                <KeepInMind>
                  Zero is permitted and is the identity; one is refused at
                  construction, before any data arrives, because it leaves
                  nothing to scale.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Why the Survivors Are Scaled Up",
          content: (
            <>
              <SubSection title="7. What the next layer reads shrinks">
                <p>
                  The raising is the half of the idea that is easy to skip.
                  The next layer reads a weighted sum of these units, and
                  silencing half of them lowers that sum by half on average.
                  On the worked row the four units total 10, and the first
                  draw&rsquo;s survivors, 1 and 3, total 4 before any scaling.
                  A network trained on sums of that size and then asked to
                  predict with every unit present would meet inputs about
                  twice as large as any it was trained on.
                </p>
                <p>
                  So the survivors are raised by one over the keep
                  probability, and the doubled survivors total 8, which is
                  nearer the 10 the whole row would have sent. Nearer and not
                  equal, because the claim is about the average over many
                  draws and not about this one.
                </p>
                <WhyThisWorks>
                  <p>
                    On any pass a unit sends 0 with probability p and its value
                    over 1 − p with probability 1 − p, so the mean of what it
                    sends is the statistics primer&rsquo;s weighted sum of the
                    two outcomes.
                  </p>
                  <Equation>{"E[out_j] = p · 0 + (1 − p) · value_j / (1 − p) = value_j"}</Equation>
                  <p>
                    The 1 − p the draw supplies and the 1 − p the scaling
                    divides by cancel exactly at every p short of one, and what
                    remains is the unit untouched, which is what a predicting
                    pass sends. Expectation is linear, so the same line covers
                    the weighted sum the next layer reads. The layer is
                    unbiased by construction rather than approximately.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Silencing lowers what the next layer reads and raising the
                  survivors restores it on average, so the layer above sees
                  inputs of the same size while learning and while answering.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The average lands on the predicting output">
                <p>
                  A claim about an average is checked by averaging. The chart
                  under the bars at the top of the page follows the mean of
                  each unit&rsquo;s training output over four hundred draws
                  from one seeded layer, and each line settles onto the dashed
                  line at that unit&rsquo;s predicting output.
                </p>
                <WorkedExample title="Four hundred draws under seed 10">
                  <p>
                    The four units survive 200, 192, 190 and 204 of the four
                    hundred draws, and a unit&rsquo;s mean output is its
                    survival count over the draws times its doubled value.
                  </p>
                  <Equation>{"u1   200 / 400 · 2 = 1.00\nu2   192 / 400 · 4 = 1.92\nu3   190 / 400 · 6 = 2.85\nu4   204 / 400 · 8 = 4.08"}</Equation>
                  <p>
                    Against predicting outputs of 1, 2, 3 and 4 the largest
                    gap is 0.15, and the first unit lands on its target
                    exactly, two hundred survivals being precisely half. The
                    road there is not smooth. After ten draws the means are
                    1.0, 2.4, 2.4 and 4.8, and after a hundred they are 1.08,
                    2.04, 2.58 and 3.76.
                  </p>
                </WorkedExample>
                <p>
                  The worked example is the derivation&rsquo;s cancellation
                  with a count in place of a probability, 192 of 400 in place
                  of one half, which is why the means land near the targets
                  rather than on them. The survival share of any finite run
                  is close to 1 − p and not equal to it.
                </p>
                <KeepInMind>
                  The average is a promise about many passes, not about any
                  one. That is the only kind of promise a training loop needs,
                  since it takes many passes.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. How far one pass is from the average">
                <p>
                  What the derivation does not say is that any single pass is
                  close. Over the four hundred draws every unit of the worked
                  row was silenced at least once and doubled at least once, so
                  a unit holding 4 sent 0 on some passes and 8 on others,
                  while its average settled at 4.08. The spread of one pass is
                  on the order of the value itself, and it shrinks only in the
                  average, roughly as one over the square root of the number
                  of draws.
                </p>
                <WhyThisWorks title="How wide the spread is, worked for one unit">
                  <>
                    <p>
                      The spread can be worked from the same two outcomes the
                      mean was. A unit holding v sends 0 with probability p and
                      v over 1 − p otherwise. Its variance is the mean of the
                      square of what it sends, less the square of its mean,
                      and the standard deviation is the square root of that.
                    </p>
                    <Equation>{"E[out²]   = (1 − p) · (v / (1 − p))²  =  v² / (1 − p)\nVar[out]  = v² / (1 − p) − v²        =  v² · p / (1 − p)\nsd[out]   = v · √(p / (1 − p))\n\nat p = 0.5     sd[out] = v"}</Equation>
                    <p>
                      At one half the standard deviation of a single pass is
                      the value itself, which is the sense in which the spread
                      is on the order of the value. The mean of n independent
                      draws has that standard deviation divided by the square
                      root of n, and at four hundred draws the square root is
                      twenty.
                    </p>
                    <Equation>{"unit    value    sd of one pass    sd of the mean of 400    gap measured\nu1      1        1                 1 / 20 = 0.05            0.00\nu2      2        2                 2 / 20 = 0.10            0.08\nu3      3        3                 3 / 20 = 0.15            0.15\nu4      4        4                 4 / 20 = 0.20            0.08"}</Equation>
                    <p>
                      None of the four measured gaps of section 8 is larger
                      than the figure the arithmetic allows it. A hundred times
                      as many draws would shrink each of those figures by a
                      factor of ten and no further, which is why the chart
                      settles slowly.
                    </p>
                  </>
                </WhyThisWorks>
                <InAModel title="On the network trained with dropout at one half">
                  <ExperimentReadout panel="averaging" />
                  <>
<p>
                    The output layer here is straight, so its raw score is a weighted sum of what dropout sends and the derivation applies to it exactly. The largest predicting score in the crowd is 61.3 in magnitude. A single thinned pass puts some person&rsquo;s score as far as 62.0 from where the predicting pass puts it, and the mean over four hundred thinned passes is still 1.39 away, because four hundred is not many draws when the numbers being averaged swing by sixty.
                  </p>
                  <p>
                    After the squash into a chance the widest gap is 0.077, and that gap does not shrink with more draws. The mean of the squashed scores is not the squash of the mean score, so the agreement between the two modes holds for the sum the next layer reads and stops being exact at the next activation function.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  The two modes agree in expectation, for the linear sum the
                  next layer reads. Past a nonlinearity the agreement is
                  approximate, and on the crowd network one pass was as far
                  as 62.0 from the predicting score.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Where the scaling goes">
                <p>
                  There are two places to put the correction, and they are not
                  equally good. The original recipe trained with silencing
                  alone and scaled the weights down by the keep probability at
                  prediction time, which makes a saved model impossible to
                  evaluate without knowing the probability it was trained
                  with. The inverted form scales the survivors up while
                  training, and prediction becomes the identity, so the layer
                  disappears once learning is over.
                </p>
                <Equation>{"original     training  out = value · m          predicting  out = value · (1 − p)\ninverted     training  out = value · m / (1 − p)   predicting  out = value"}</Equation>
                <p>
                  Both agree in expectation, by the same cancellation, and the
                  right-hand bars at the top of the page are the proof that
                  the inverted form is the one running here. The predicting pass
                  returns the row bit for bit, and the endpoint behind the
                  widget returns that answer rather than asserting it.
                </p>
                <KeepInMind>
                  Inverted dropout puts the whole of the arithmetic on the
                  training side, so a trained model predicts with nothing to
                  remember about how it was trained.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "Silencing one hidden unit at a time, on the network trained without dropout, showed what?",
              [
                "Each unit costs about a sixteenth of the training accuracy",
                "Eleven of the sixteen cost nothing at all, and silencing the thirteenth takes the training accuracy from 1.00 to 0.76",
                "Every unit is dead, so nothing changes",
                "The accuracy rises, since the network was overfitted",
              ],
              1,
              "The whole fit rests on two units, with the twelfth taking it to 0.84 and the sixteenth, third and fourteenth costing 0.12, 0.08 and 0.04. A wide layer trained to convergence arrives at units that are useful only together, and the fit is fragile in exactly the places those partnerships sit.",
            ),
            choice(
              "How is the coin tossed when a layer answers a whole batch?",
              [
                "Once per unit, shared across every row of the batch",
                "Separately over every entry, so two people in one batch go through different thinned networks",
                "Once per batch, so the whole block is either kept or dropped",
                "Once per epoch",
              ],
              1,
              "A mask shared across the batch would let a unit rely on its neighbour for the whole batch and lose it only on the next one, which is a much weaker version of the rule. Under seed 10 the three rows of the worked block keep two, three and two units, and no two rows keep the same set.",
            ),
            choice(
              "The worked row holds 1, 2, 3 and 4 and the drop probability is one half. Under seed 10 the first draw keeps the first and third units. What does the training pass send on?",
              [
                "2, 0, 6, 0",
                "1, 0, 3, 0",
                "0.5, 0, 1.5, 0",
                "2, 4, 6, 8",
              ],
              0,
              "Each survivor is multiplied by one over the keep probability, which is 2 here, and each silenced unit sends nothing. Leaving the survivors at 1 and 3 would hand the next layer a total of 4 where the whole row totals 10, and the doubled survivors total 8, which is nearer. Nearer and not equal, because the scaling restores the sum on average over many draws and not on this one.",
            ),
            trueFalse(
              "Because the layer is unbiased, a training pass and a predicting pass agree exactly rather than only on average.",
              false,
              "The agreement holds for the linear sum the next layer reads and stops being exact at the next activation function, since the mean of the squashed scores is not the squash of the mean score. On the crowd network one thinned pass put a person’s score as far as 62.0 from the predicting score, and the mean over four hundred thinned passes was still 1.39 away. After the squash the widest gap is 0.077, and that one does not shrink with more draws.",
            ),
            trueFalse(
              "The inverted form puts the whole of the arithmetic on the training side, so a predicting pass returns the row bit for bit.",
              true,
              "The original recipe trained with silencing alone and scaled the weights down by the keep probability at prediction time, which makes a saved model impossible to evaluate without knowing the probability it was trained with. Both forms agree in expectation, by the same cancellation. The inverted one scales the survivors up while training, so prediction is the identity and the layer disappears once learning is over.",
            ),
        ],
        },
        {
          title: "Part 4. The Mask Is a Draw",
          content: (
            <>
              <SubSection title="11. A zero that survived">
                <p>
                  The layer has to remember which entries it silenced, because
                  the backward pass needs the same mask on the way down, and
                  there is a tempting shortcut. The outputs are right there, a
                  zero in them looks like a dropped unit, so why not read the
                  mask back off the answers. The block below shows why not.
                  Its rows hold exact zeros, the kind a rectified layer hands
                  upward, and a rose outline marks every entry where the mask
                  read off the outputs disagrees with the mask the layer
                  actually drew.
                </p>
                <DropoutBlockPass showBackward={false} initialPreset="rectified" />
                <p>
                  Under seed 10 four of the twelve entries are misfiled, and
                  every one of them is a zero that survived. The first row
                  holds 0, 2, 0 and 4, the draw keeps its first and third
                  units, and the row sends on 0, 0, 0, 0, because doubling
                  nothing is nothing. Read off the outputs, that row would be
                  recorded as entirely dropped, its blame set to zero
                  everywhere, and two units that were present on the pass
                  would learn nothing from it.
                </p>
                <KeepInMind>
                  A zero in the output is ambiguous between dropped and kept
                  but already zero, and nothing in the outputs can tell the
                  two apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. How common exact zeros are">
                <p>
                  This would be a curiosity if exact zeros were rare where
                  the layer lives, and they are the ordinary case. A rectified
                  unit answers 0 for every negative score, and most of a
                  scanned digit&rsquo;s border is 0, so a dropout layer above
                  either of those meets zeros on every pass. On the crowd
                  network trained with dropout at one half, one training pass
                  through the hidden layer produces four hundred readings,
                  sixteen units for each of twenty-five people.
                </p>
                <ExperimentReadout panel="keptZeros" />
                <p>
                  Of those four hundred readings, 282 are exactly zero, and
                  the mask keeps 142 of them. Reading the mask back off the
                  outputs would misfile 142 of 400 entries on that one pass,
                  more than a third, quietly and with nothing raised, and the
                  network would still train and its loss would still fall.
                </p>
                <KeepInMind>
                  Above a rectified layer the shortcut is wrong on a third of
                  the entries of every pass, and nothing about the training
                  run would announce it.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. A draw against a derivable fact">
                <p>
                  So the layer carries the mask on its response, already
                  scaled and ready to multiply, and its backward step refuses
                  a response that arrives without one rather than guess. The{" "}
                  <Link href="/concepts/pooling" className={link}>
                    pooling page&rsquo;s
                  </Link>{" "}
                  layer took the opposite decision and recomputes its winners
                  instead of storing them, and the difference between the two
                  is the whole point. A pooling winner is a function of
                  numbers the response already holds. A mask is a draw, and
                  nothing that survives the forward pass can reproduce it.
                </p>
                <p>A seeded dropout layer must be reproducible across a sequence of passes while still producing new masks on later passes. Its random generator therefore advances after every draw.</p>
<p>The layer keeps that generator state when a training step occurs. Reconstructing a seeded generator from its initial seed after every step would repeat the same mask, permanently removing the same contributions instead of varying them across training passes.</p>
<p>The chart uses four hundred successive draws from one generator. Under the same seed and call sequence, repeating the experiment reproduces those draws. An unseeded construction does not promise the same sequence on another run.</p>
                <KeepInMind>
                  The mask is carried because nothing that survives the
                  forward pass can reproduce a draw, where a pooling winner
                  can be recomputed from numbers the response already holds.
                  The generator is runtime state rather than learned state,
                  which is the same line a tree&rsquo;s generator sits on.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Backward Pass Through a Mask",
          content: (
            <>
              <SubSection title="14. Blame through the same mask">
                <p>
                  The backward pass hands every layer the slope of the loss at
                  its outputs and asks for the slope at its inputs. For this
                  layer the answer is one multiplication. A unit that was
                  silenced contributed nothing to the loss, so it is owed
                  nothing back, and a unit that survived was amplified by the
                  scale on the way up, so its blame is amplified by the same
                  scale on the way down. Both of those are multiplication by
                  the scaled mask, which is why the mask is stored already
                  scaled.
                </p>
                <Equation>{"passed_down_j = arriving_j · m_j / (1 − p)"}</Equation>
                <DropoutBlockPass />
                <p>
                  With a block of ones arriving, what is passed down is the
                  mask itself. Under seed 10 the three rows of the worked block
                  pass down 2, 0, 2, 0 and 2, 0, 2, 2 and 0, 2, 2, 0. The
                  layer has no weights of its own, so it reports no parameter
                  gradient at all rather than a block of zeros, which would be
                  a small lie about having something to learn.
                </p>
                <KeepInMind>
                  The backward step is the forward step&rsquo;s multiplication
                  applied to the arriving blame, with the same mask and the
                  same scale, and nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Checking it against a finite difference">
                <p>
                  A backward step that is wrong by a constant factor still
                  trains. Forgetting the scale on the way back gives a slope
                  too small by the keep probability everywhere, the network
                  still converges, and the effective learning rate is quietly
                  not the one that was configured. The check that settles it
                  is the one the backpropagation page uses everywhere, a
                  finite difference. Nudge one input up and down by a hair,
                  rerun the forward pass under the same seed so the same mask
                  is drawn, and difference a weighted total of the outputs.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="why"
                  rows={[
                    { expression: "S(inputs) = Σ arriving · out(inputs)", reason: "a scalar summary whose slope at each input is the passed-down block, by the chain rule" },
                    { expression: "(S(x + h) − S(x − h)) / 2h", reason: "the central difference at one entry, with h of one millionth" },
                    { expression: "same seed both times", reason: "so the mask is the one the forward pass drew, without which the two runs would be different networks" },
                    { expression: "largest gap 2.1e−09", reason: "on the worked block under seed 10; the forward pass is linear once the mask is drawn, so the gap is rounding" },
                  ]}
                />
                <p>
                  The widget in section 14 shows the finite difference beside
                  the passed-down block and reports the largest gap between
                  them, 2.1e−09 on the worked block and 4.1e−09 on the
                  rectified one. An implementation that forgot the scale would
                  disagree by a factor of two at every kept entry, and one that
                  read the mask off the outputs would disagree at every kept
                  zero.
                </p>
                <KeepInMind>
                  Agreement with a finite difference is what makes the
                  backward step a claim rather than an assertion, and the
                  check has to draw the same mask on both sides.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A kept zero is paid in full">
                <p>
                  Now the rectified block through the backward step. Its first
                  row sent on nothing but zeros, and the blame passed down to
                  it is 2, 0, 6, 0 under an arriving slope of 1, 2, 3, 4,
                  because the first and third units were present on the pass
                  and their blame is the arriving slope times the scale of 2.
                  The two entries with the identical output of zero, one kept
                  and one dropped, are owed entirely different amounts, and
                  nothing in the answers distinguishes them.
                </p>
                <WorkedExample title="The first row, by both masks">
                  <>
                    <p>
                      The row holds 0, 2, 0 and 4, and the draw kept its first
                      and third units, so the scaled mask the layer carries is
                      2, 0, 2, 0. Multiply the arriving slope by it entry by
                      entry. Then do the same with the mask the shortcut would
                      have read off the outputs, which are all zero.
                    </p>
                    <Equation>{"arriving slope         1,  2,  3,  4\n\nmask the layer drew    2,  0,  2,  0\npassed down            1 × 2,  2 × 0,  3 × 2,  4 × 0   =   2, 0, 6, 0\n\nmask read off outputs  0,  0,  0,  0\npassed down            1 × 0,  2 × 0,  3 × 0,  4 × 0   =   0, 0, 0, 0"}</Equation>
                    <p>
                      The shortcut returns nothing to the two units that were
                      present. Their inputs were zero on this pass, and the
                      slope at those inputs was not.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  That is the whole argument for storing the mask, made with
                  numbers. Press the rectified block button in section 14 and
                  the passed-down grid shows the zeros that were still paid,
                  outlined in rose where the shortcut would have paid nothing.
                </p>
                <KeepInMind>
                  A unit that survived the draw and happened to read zero is
                  owed the full scaled blame; the output cannot say so, and
                  the mask can.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Two Purposes",
          content: (
            <>
              <SubSection title="17. Why a layer needs to know why it is running">
                <p>
                  A dense layer, a convolution, a pooling window and a
                  flattening all do exactly the same thing whether the network
                  is learning or answering. This layer does not, and it cannot
                  be written without being told which is happening. Silencing
                  units while answering would make the model&rsquo;s prediction
                  a matter of luck, so the silencing has to stop, and the only
                  way it can stop is if the pass says what it is for. The{" "}
                  <Link href="/concepts/normalisation-layers" className={link}>
                    batch normalisation layer
                  </Link>{" "}
                  has the same need from the other direction, standardising by
                  the batch in front of it while learning and by remembered
                  figures while answering.
                </p>
                <p>
                  So every forward pass here carries a purpose, one of exactly
                  two, training or predicting, and a layer that does not care
                  ignores it. It is a closed pair of names rather than a
                  true-or-false switch, so that a call site reads as what it
                  means and a wrong value is a mistake in the caller&rsquo;s
                  source rather than a plausible-looking boolean.
                </p>
                <KeepInMind>
                  Two layers in the vocabulary behave differently while
                  learning, and both of them need the pass to say which mode it
                  is in.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What forgetting each one costs">
                <p>
                  There are two ways to get the purpose wrong, and they are
                  not equally bad. Forget to say training and the network never
                  drops anything, so it trains as the plain network would.
                  Forget to say predicting and every answer the model gives is
                  drawn from a coin.
                </p>
                <ExperimentReadout panel="purposes" />
                <p>The two mode errors have different effects. First, take the network trained with a dropout probability of one half. In prediction mode, its classification accuracy on this crowd is 0.84.</p>
<p>Leaving dropout active makes the prediction depend on a fresh mask. Across twenty calls, accuracy is 0.84 on fifteen calls and 0.80 on five. The class decisions change less than the probabilities: one observation&apos;s predicted adult probability ranges from 0.29 to 1.00 across those calls, compared with 0.996 in prediction mode.</p>
<p>Second, omitting dropout during training means the intended regularization never takes place. The zero-dropout and no-dropout versions in the matched experiment produce identical outputs. The mode setting therefore determines whether the model actually receives the intervention being studied.</p>
                <KeepInMind>
                  Forgetting to say training gave the plain network, which
                  differed from the idle-layer one by exactly 0.0 on the
                  crowd. Forgetting to say predicting put one person anywhere
                  from 0.29 to 1.00 adult across twenty calls.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Why the default is predicting">
                <>
<p>
                  Given that asymmetry the default is chosen to protect against the worse mistake. A pass that does not say why it is running is a predicting pass, so a caller who forgets gets a slightly slower descent rather than a random model. The backward pass states training for itself, since a backward pass is training by definition and a dropout layer that answered deterministically inside one would have the gradient describe a network the step is not about to build, so an ordinary training loop never thinks about the purpose at all.
                </p>
                <p>
                  The only place a caller says it is when reading a training-mode answer on purpose, which is what the experiment above did to measure the swing.
                </p>
</>
                <KeepInMind>
                  The default is predicting because the worse mistake to
                  forget is the other one, and the backward pass says training
                  for itself.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            trueFalse(
              "The mask can be read back off the outputs, since a dropped unit sends zero.",
              false,
              "A zero in the output is ambiguous between dropped and kept but already zero, and nothing in the outputs tells the two apart. On the crowd network at one half, 282 of the 400 readings in a single training pass are exactly zero and the mask keeps 142 of them, so the shortcut would misfile more than a third of the entries, quietly, while the network went on training and its loss went on falling.",
            ),
            choice(
              "The pooling layer recomputes its winners and this one stores its mask. Why the difference?",
              [
                "Recomputing a pooling winner is cheaper than storing it",
                "A pooling winner is a function of numbers the response already holds, where a mask is a draw",
                "A dropout layer has no response object to recompute from",
                "Pooling runs only while predicting",
              ],
              1,
              "Nothing that survives the forward pass can reproduce a draw, so the layer carries the mask on its response, already scaled and ready to multiply, and its backward step refuses a response that arrives without one rather than guess. The generator is runtime state rather than learned state, which is the same line a tree’s generator sits on.",
            ),
            trueFalse(
              "Having no weights of its own, the layer reports no parameter gradient at all, rather than a block of zeros.",
              true,
              "A block of zeros would be a small lie about having something to learn. What the layer does pass down is the arriving blame times the scaled mask, so with a block of ones arriving, what comes down is the mask itself. On the rectified block’s first row an arriving slope of 1, 2, 3, 4 comes down as 2, 0, 6, 0, although every output in that row was zero.",
            ),
            choice(
              "What happens to an implementation that forgets the scale on the way back down?",
              [
                "It raises on the first step",
                "It still converges, with the effective learning rate quietly not the one that was configured",
                "It produces non-finite gradients",
                "It trains only the units that were dropped",
              ],
              1,
              "A backward step wrong by a constant factor still trains, and the slope is too small by the keep probability everywhere. What settles it is a finite difference, rerunning the forward pass under the same seed so the same mask is drawn, which agrees to 2.1e−09 on the worked block and 4.1e−09 on the rectified one. Forgetting the scale would disagree by a factor of two at every kept entry.",
            ),
            choice(
              "Which way of getting the pass purpose wrong is worse, and which way does the default guard?",
              [
                "Forgetting training is worse, and the default is training",
                "Forgetting predicting is worse, and the default is predicting",
                "Both are equally bad, so there is no default",
                "Forgetting predicting is worse, and the default is training",
              ],
              1,
              "Forgetting to say training gave the plain network, which differed from the idle-layer one by exactly 0.0 on this crowd, so the cost is a slightly slower descent. Forgetting to say predicting put one person anywhere from 0.29 to 1.00 adult across twenty calls, against 0.996 in prediction mode. The backward pass states training for itself, so an ordinary training loop never thinks about the purpose at all.",
            ),
        ],
        },
        {
          title: "Part 7. Dropout Measured on the Crowd",
          content: (
            <>
              <SubSection title="20. The experiment">
                <>
<p>
                  Whether dropout helps is a measurement, and at this scale the measurement has to be arranged carefully or the answer is noise. Twenty-five people are too few to hold out a fixed group, so each run deals the crowd into five folds, trains on twenty and holds out five, and repeats until every person has been held out once, so the held-out accuracy is counted over all twenty-five.
                </p>
                <p>
                  Heights and weights are put into standard units using the training rows of each fold only, so no held-out person&rsquo;s measurements reach the fit. The whole of that is repeated under five seeds, each seeding the weights, the deal and the draws together, at three settings, no dropout layer at all, dropout at 0.2, and dropout at 0.5, which is seventy-five training runs of four hundred epochs.
                </p>
</>
                <KeepInMind>
                  A held-out score on twenty-five people moves by 0.04 per
                  person, so the spread across seeds, and not any one number,
                  is the ruler the comparison is measured with.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. What the sweep found">
                <DropoutSweep />
                <>
<p>
                  Across the five seeds the plain network trains to 0.992 and holds out at 0.744. Dropout at 0.2 trains to 0.950 and holds out at 0.752, and dropout at 0.5 trains to 0.886 and holds out at 0.728. The gap between training and held-out accuracy narrows from 0.248 to 0.198 to 0.158, and it narrows almost entirely from the training side; the held-out means are 0.008 above and 0.016 below the plain network&rsquo;s, where the seeds at any one setting spread from 0.64 to 0.84.
                </p>
                <p>
                  The textbook claim is that dropout raises held-out accuracy, and on this crowd it did not hold in any way the seed spread can distinguish from chance. What it did do is stop the network reporting a training score it would not keep.
                </p>
</>
                <NumberTable
                  headings={["setting", "training accuracy", "held out", "gap", "held out across seeds"]}
                  rows={[
                    ["no dropout", "0.992", "0.744", "0.248", "0.64 to 0.84"],
                    ["dropout at 0.2", "0.950", "0.752", "0.198", "0.68 to 0.80"],
                    ["dropout at 0.5", "0.886", "0.728", "0.158", "0.64 to 0.80"],
                  ]}
                  caption="Means over five seeds, each seed five folds, four hundred epochs of full-batch descent at a stride of one, sixteen hidden units."
                />
                <KeepInMind>
                  On twenty-five people dropout closed a third of the gap
                  between training and held-out accuracy without measurably
                  improving the held-out accuracy. That is what the seeds
                  support. The method is for capacity the data cannot pin
                  down, and twenty-five people pin very little, so its visible
                  work here is on the gap.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. What training under dropout looks like">
                <p>
                  The curves of the first seed show the other thing dropout
                  changes, which is the loss the training loop can see. The
                  backward pass measures its loss on the way forward, and under
                  dropout that is the loss of one thinned network, a different
                  one every epoch.
                </p>
                <MemorisationCurves />
                <>
<p>
                  Without dropout the measured loss rises between consecutive readings on only 1 of 99 occasions. At 0.2 it rises on 40 of 99 and at 0.5 on 48 of 99, about as often as it falls, while the accuracy read while predicting still climbs underneath. At the end of the four hundred epochs the plain network stands at 0.99 trained and 0.84 held out on this seed, dropout at 0.2 at 0.97 and 0.80, and dropout at 0.5 at 0.89 and 0.72.
                </p>
                <p>
                  This is the seed on which the plain network did best of the five, and on it dropout helped least, which is worth seeing beside the averages.
                </p>
</>
                <KeepInMind>
                  Under dropout the training loss is a noisy reading of a
                  different network each epoch. Judge progress by the
                  predicting-mode accuracy, or by the loss read while
                  predicting, and not by the number the backward pass reports.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. What the network stopped leaning on">
                <p>
                  The silencing measurement of section 2 is where dropout
                  shows what it did, whatever the held-out score says. Trained
                  on the whole crowd without it, the network rests on two
                  units, and silencing the thirteenth alone costs 0.24 of its
                  training accuracy. Trained with dropout at one half, the
                  same network stands at 0.84 with every unit present and at
                  0.84 with any one of the sixteen silenced, a mean drop of
                  0.000 and a largest drop of 0.000, and none of the sixteen
                  units is dead, so the insensitivity is not a network that has
                  nothing left to lose.
                </p>
                <p>
                  That is the co-adaptation of the paper&rsquo;s title, removed
                  and measured. The plain network came to rest on two units,
                  and losing the thirteenth costs it 0.24; the dropped network
                  can lose any one of its sixteen and stay at 0.84. On this
                  crowd the second network is not measurably better at new
                  people, and it is a great deal less fragile.
                </p>
                <KeepInMind>
                  Dropout&rsquo;s most reliable effect at any scale is on how
                  the fit is distributed across the units. Whether that buys
                  held-out accuracy depends on how much capacity the data
                  leaves unpinned.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Where it earns its keep">
                <>
<p>
                  The network the method was built for had sixty million parameters and two dense layers of 4096 units each above a stack of convolutions, and the paper reports it overfitting badly without dropout and not with it. The network on this page has sixteen hidden units and twenty-five people, and the only thing it can overfit is the mixed middle of the crowd, which no method can generalise from because there is nothing there to generalise.
                </p>
                <p>
                  Between those two lies most of practice, and the rule of thumb the measurements support is that dropout is a way of spending capacity you already have more carefully. It is not a substitute for having enough data, and on data this small its visible effect is on the gap and on the fragility rather than on the score.
                </p>
</>
                <KeepInMind>
                  Reach for dropout when the network is wide relative to the
                  rows and the gap between training and held-out accuracy is
                  large, and measure whether it helped across seeds rather
                  than on one run.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="25. What a complete implementation states">
                <p>
                  A complete implementation states the drop probability and
                  its legal range, whether the scaling happens at training or
                  at prediction time, that the draw is independent per entry
                  and per row, what the layer does under each purpose and
                  which purpose is the default, that the mask is carried on
                  the response and what the backward step does when it is
                  missing, what the backward step passes down and that it
                  reports no parameter gradient, how the generator is seeded
                  and what stepping the layer does to it, and that the layer
                  reads and answers the same arrangement so it can be placed
                  anywhere in a sound stack.
                </p>
              </SubSection>

              <SubSection title="26. The edges, probed">
                <p>
                  Every row below was run rather than reasoned about. A refusal is a
                  typed error with a message written to be read; an acceptance
                  is what the layer did instead.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "a drop probability of 1, or above, or below 0", reason: "refused at construction, in the layer's own words, since 1 silences the whole layer and leaves nothing to scale." },
                    { expression: "a drop probability that is not a finite number", reason: "refused at construction; a nan is not a probability and a word is not a number." },
                    { expression: "a drop probability of 0", reason: "accepted; the layer is the identity, keeps everything, and reports no gap at all." },
                    { expression: "a drop probability of 0.999", reason: "accepted; the scale is 1000, large and finite, and a survivor is raised a thousandfold." },
                    { expression: "a width of 0, a negative width, a fractional width", reason: "refused at construction; every extent must be a whole number of at least one, inside an arrangement too." },
                    { expression: "a block with no rows", reason: "refused; a layer needs at least one row to respond to." },
                    { expression: "a batch of one row", reason: "accepted, while training and while predicting, since the draw is per row and one row is a row." },
                    { expression: "a block of the wrong width, or one dimension", reason: "refused; the layer reads a stated arrangement and says which it got." },
                    { expression: "a non-finite entry, or a block that is not numeric", reason: "refused before the draw; inputs must contain only finite values." },
                    { expression: "a backward step handed a predicting response", reason: "refused; the response carries no mask, and guessing one from the outputs is the mistake Part 4 is about." },
                    { expression: "a backward step whose arriving block is the wrong shape or row count", reason: "refused, naming both arrangements." },
                    { expression: "a backward step whose arriving block holds a nan", reason: "accepted, and the nan passes down through the mask; the layer checks the arriving block's arrangement and not its finiteness. Documented rather than defended." },
                    { expression: "a backward step handed another dropout layer's response of the same shape", reason: "accepted, with the other layer's mask; two layers of one arrangement cannot be told apart by the response. Documented rather than defended, since no stack can produce it." },
                    { expression: "no seed", reason: "accepted; the layer draws from fresh entropy and two such layers answer differently." },
                    { expression: "stepping the layer", reason: "answers with the same layer, so the generator keeps its place and the next pass draws a new mask." },
                    { expression: "a dropout layer of the wrong width inside a stack", reason: "refused when the stack is built, before any data, naming the two arrangements that do not join." },
                  ]}
                />
                <p>
                  The two accepted edges in the backward step are the ones
                  worth knowing about. The arrangement check settles that the
                  arriving block and the response belong together, and a
                  non-finite slope is a fault of the layer above rather than of
                  this one; the same-shape case is a response carrying no
                  record of which layer produced it, which a stack never
                  produces because it pairs each layer with its own response
                  by construction.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 7 and 8",
          quiz: [
            trueFalse(
              "Across the five seeds dropout narrowed the gap between training and held-out accuracy without measurably raising the held-out accuracy.",
              true,
              "The gap narrowed from 0.248 to 0.198 at 0.2 and to 0.158 at 0.5, almost entirely from the training side. The plain network holds out at 0.744, dropout at 0.2 at 0.752 and dropout at 0.5 at 0.728, where the seeds at any one setting spread from 0.64 to 0.84, so the held-out differences cannot be told from chance. The textbook claim that dropout raises held-out accuracy did not hold on this crowd.",
            ),
            choice(
              "Why does the training loss stop falling steadily once dropout is on?",
              [
                "The step size has become too large",
                "The backward pass measures the loss of one thinned network, a different one every epoch",
                "Held-out rows have leaked into the fit",
                "The scale on the survivors inflates the loss",
              ],
              1,
              "Without dropout the measured loss rises between consecutive readings on only 1 of 99 occasions, at 0.2 on 40 of 99 and at 0.5 on 48 of 99, which is about as often as it falls, while the accuracy read while predicting still climbs underneath. Judge progress by the predicting-mode accuracy, or by the loss read while predicting, rather than by the number the backward pass reports.",
            ),
            several(
              "Which of these hold of the network trained with dropout at one half?",
              [
                "It stands at 0.84 with every unit present and at 0.84 with any one of the sixteen silenced",
                "The largest drop from silencing a single unit is 0.000",
                "The insensitivity is because most of its units are dead",
                "The plain network, by contrast, loses 0.24 when its thirteenth unit is silenced",
              ],
              [0, 1, 3],
              "None of the sixteen units is dead, so this is not a network with nothing left to lose. That is the co-adaptation of the paper’s title, removed and measured. On this crowd the dropped network is not measurably better at new people, and it is a great deal less fragile.",
            ),
            trueFalse(
              "Dropout can stand in for data the network does not have, which is why its clearest effect on these twenty-five people was on the held-out score.",
              false,
              "Dropout is a way of spending capacity you already have more carefully, and it is not a substitute for having enough data. Twenty-five people pin very little down, and the only thing this network can overfit is the mixed middle of the crowd, where there is nothing to generalise from. Its visible effect here was on the gap and on the fragility, and the held-out means sat 0.008 above and 0.016 below the plain network’s.",
            ),
            several(
              "Which of these edges does the layer accept?",
              [
                "A drop probability of 0",
                "A drop probability of 0.999",
                "A drop probability of exactly 1",
                "A backward step handed a predicting response",
              ],
              [0, 1],
              "At zero the layer is the identity and keeps everything, which is what a control in a search over this setting needs. At 0.999 the scale is 1000, large and finite, so a survivor is raised a thousandfold. A probability of 1 silences the whole layer and leaves nothing to scale, so it is refused at construction. A predicting response carries no mask, and guessing one from the outputs is the mistake Part 4 is about, so the backward step refuses it.",
            ),
        ],
        },
        {
          title: "Practice. Drawing Masks With the Library",
          practice: [
            exercise(
              "One draw, and then four hundred",
              ["Build the worked layer of Part 2, a Dropout reading four units with a drop probability of one half under seed 10, and send the row 1, 2, 3, 4 through it once while predicting and once while training. Part 2 says the predicting pass returns the row untouched and the first training draw reads 2, 0, 6, 0.", "Then build the layer afresh under the same seed and send the row through four hundred times while training, keeping every output. Print how many times each unit survived and the mean of what each unit sent, which section 8 gives as 200, 192, 190 and 204 survivals and means of 1.00, 1.92, 2.85 and 4.08. Finish with a count the lesson does not make, the number of the four hundred passes on which all four units were silenced at once and the next layer was sent nothing at all."],
              `import numpy as np
from oop_ml import Dropout, PassPurpose

row = np.array([[1.0, 2.0, 3.0, 4.0]])

# Build Dropout(reads=4, drop_probability=0.5, random_seed=10). Print what a
# predicting pass and then a training pass send on for the row.

# Build the same layer again, run four hundred training passes on the row and
# stack their outputs into one array of shape (400, 4). Print each unit's
# survival count, each unit's mean output to two places, and the number of
# passes on which every unit was silenced.`,
              `import numpy as np
from oop_ml import Dropout, PassPurpose

row = np.array([[1.0, 2.0, 3.0, 4.0]])

layer = Dropout(reads=4, drop_probability=0.5, random_seed=10)
print(f"predicting reads {layer.respond_to(row).outputs[0].tolist()}")
print(f"training reads {layer.respond_to(row, PassPurpose.TRAINING).outputs[0].tolist()}")

layer = Dropout(reads=4, drop_probability=0.5, random_seed=10)
sent = np.array([layer.respond_to(row, PassPurpose.TRAINING).outputs[0] for _ in range(400)])
survived = sent > 0
print(f"times kept {survived.sum(axis=0).tolist()}")
print(f"mean sent {sent.mean(axis=0).round(2).tolist()}")
print(f"passes with every unit silenced {int((~survived).all(axis=1).sum())}")`,
              `predicting reads [1.0, 2.0, 3.0, 4.0]
training reads [2.0, 0.0, 6.0, 0.0]
times kept [200, 192, 190, 204]
mean sent [1.0, 1.92, 2.85, 4.08]
passes with every unit silenced 26`,
              { hints: ["respond_to takes a block with one row per example and, as its second argument, the purpose of the pass. Left out, the purpose is PassPurpose.PREDICTING, which is the default Part 6 argues for.", "The layer’s generator advances on every training pass, so one layer called four hundred times gives four hundred different draws. Building a new layer under the same seed starts the sequence again, which is why the second half builds its own.", "Every value in this row is above zero, so here a unit survived a pass exactly when what it sent is above zero. That is safe for this row only, and Part 4 is about the rows where it is not. A pass silenced everything when no unit survived it."], check: numberCheck("On how many of the four hundred training passes were all four units silenced at once?", 26, 0.5, "Each unit is silenced with probability one half, independently, so all four go together with probability one sixteenth, which over four hundred passes is 25 in expectation. This seed gave 26. On those passes the next layer read a row of zeros where the predicting pass sends a total of 10, which is how far one pass can sit from the average that section 8 measured.") },
            ),
            exercise(
              "Send blame back through a mask the outputs cannot show",
              ["The block below is the rectified block of Part 4, three rows that already hold exact zeros. Send it through the layer once while training, and print the outputs, which entries the layer’s own mask kept, and which entries a mask read back off the outputs would have called kept. Section 11 says four of the twelve disagree.", "Then ask the layer for its backward step with a slope of 1, 2, 3, 4 arriving at every row. Print what it passes down, whether it reports a parameter gradient, and the total blame it passes down beside the total the shortcut’s mask would have passed. Section 16 gives the first row as 2, 0, 6, 0. Last, hand the backward step a predicting response and print what the layer says."],
              `import numpy as np
from oop_ml import Dropout, MLLibError, PassPurpose

block = np.array([[0.0, 2.0, 0.0, 4.0], [3.0, 0.0, 0.0, 1.0], [0.0, 0.0, 5.0, 0.0]])
arriving = np.array([[1.0, 2.0, 3.0, 4.0]] * 3)
layer = Dropout(reads=4, drop_probability=0.5, random_seed=10)

# Run one training pass. The response carries outputs and the scaled mask,
# kept. Print the outputs, the mask as 0s and 1s, the mask read off the
# outputs as 0s and 1s, and how many entries the two disagree on.

# Ask the layer for correction_for(response, arriving). Print passed_down,
# whether gradient is None, the total passed down, and the total the
# shortcut would pass, which is arriving times 2 wherever an output is nonzero.

# Try correction_for with a predicting response and print the refusal.`,
              `import numpy as np
from oop_ml import Dropout, MLLibError, PassPurpose

block = np.array([[0.0, 2.0, 0.0, 4.0], [3.0, 0.0, 0.0, 1.0], [0.0, 0.0, 5.0, 0.0]])
arriving = np.array([[1.0, 2.0, 3.0, 4.0]] * 3)
layer = Dropout(reads=4, drop_probability=0.5, random_seed=10)

response = layer.respond_to(block, PassPurpose.TRAINING)
kept = response.kept > 0
read_back = response.outputs != 0
print(f"outputs {response.outputs.tolist()}")
print(f"mask the layer drew {kept.astype(int).tolist()}")
print(f"mask read off outputs {read_back.astype(int).tolist()}")
print(f"misfiled {int((kept != read_back).sum())} of {kept.size}")

correction = layer.correction_for(response, arriving)
print(f"passed down {correction.passed_down.tolist()}")
print(f"parameter gradient is None, {correction.gradient is None}")
print(f"total blame passed down {correction.passed_down.sum():.1f}")
print(f"total the shortcut would pass {(arriving * 2.0 * read_back).sum():.1f}")

try:
    layer.correction_for(layer.respond_to(block), arriving)
except MLLibError as refusal:
    print(f"refused, {refusal}")`,
              `outputs [[0.0, 0.0, 0.0, 0.0], [6.0, 0.0, 0.0, 2.0], [0.0, 0.0, 10.0, 0.0]]
mask the layer drew [[1, 0, 1, 0], [1, 0, 1, 1], [0, 1, 1, 0]]
mask read off outputs [[0, 0, 0, 0], [1, 0, 0, 1], [0, 0, 1, 0]]
misfiled 4 of 12
passed down [[2.0, 0.0, 6.0, 0.0], [2.0, 0.0, 6.0, 8.0], [0.0, 4.0, 6.0, 0.0]]
parameter gradient is None, True
total blame passed down 34.0
total the shortcut would pass 16.0
refused, a dropout layer's backward step needs the mask its own forward pass drew, and this response carries none -- it came from a prediction pass or from another layer`,
              { hints: ["A training pass through Dropout answers a response with one more thing on it than an ordinary one, kept, the mask already multiplied by the scale. An entry was kept where that is above zero.", "correction_for takes the response the layer itself produced and the block of slopes arriving from above, and answers an object with passed_down, the slopes at the layer’s inputs, and gradient, which is None for a layer with nothing to learn.", "A predicting response carries no mask. The layer refuses it with one of the library’s own errors, all of which derive from MLLibError, so wrap that call in try and except."], check: numberCheck("How much blame in total does the layer pass down for this block?", 34.0, 0.05, "The mask kept seven of the twelve entries, and each one passes down its arriving slope times the scale of 2, which comes to 2 + 6 in the first row, 2 + 6 + 8 in the second and 4 + 6 in the third. Four of those seven sat at inputs of exactly zero, so their outputs were zero too, and a mask read off the outputs would have passed down 16 of the 34 and left the other 18 unpaid with nothing raised.") },
            ),
            exercise(
              "Train with and without, then silence one unit at a time",
              ["The starter builds the network of Part 1 on the tangled crowd twice from the same seed, sixteen rectified hidden units under one straight output, once plain and once with a dropout layer at one half between the two. Train each for four hundred full-batch steps at a rate of 1 under BinaryCrossEntropy, then measure its accuracy on the crowd while predicting. A person is called an adult when the raw score is at least zero.", "Then repeat section 2’s measurement. Take what the hidden layer answers, zero one column at a time, hand the thinned block straight to the output layer, and score it. Print the intact accuracy, the lowest accuracy with one unit silenced, how many units cost nothing, and the mean drop over the sixteen. The lesson gives the plain network 1.00 intact, 0.76 at worst and eleven units costing nothing, and gives the dropped network a mean drop of 0.000. It does not give the plain network’s mean drop."],
              `import numpy as np
from oop_ml import BinaryCrossEntropy, DenseLayer, Dropout, Identity, LayerStack, Neuron, RectifiedLinear

crowd = np.array([
    (147, 41, 0), (156, 53, 1), (145, 57, 0), (159, 57, 1), (162, 61, 1), (120, 25, 0), (122, 28, 0),
    (118, 24, 0), (180, 80, 1), (183, 83, 1), (178, 78, 1), (145, 45, 0), (145, 55, 1), (151, 45, 1),
    (151, 55, 0), (157, 45, 0), (157, 55, 1), (148, 50, 1), (154, 50, 0), (160, 50, 1), (147, 58, 0),
    (153, 58, 1), (150, 42, 1), (156, 42, 0), (143, 50, 0),
], dtype=float)
rows = (crowd[:, :2] - crowd[:, :2].mean(axis=0)) / crowd[:, :2].std(axis=0)
labels = crowd[:, 2]

for name, extra in [("plain", []), ("dropout at 0.5", [Dropout(reads=16, drop_probability=0.5, random_seed=1001)])]:
    draw = np.random.default_rng(1)
    hidden = DenseLayer([Neuron(draw.normal(0.0, 1.0, 2), bias=0.0, activation=RectifiedLinear()) for _ in range(16)])
    output = DenseLayer([Neuron(draw.normal(0.0, 0.125 ** 0.5, 16), bias=0.0, activation=Identity())])
    network = LayerStack([hidden, *extra, output])
    # Four hundred times, replace the network with the one stepped at 1.0 by
    # its own backward pass on the rows and the labels as a column.

    # Print the intact accuracy. Then, for each of the sixteen hidden units,
    # zero that column of the hidden layer's outputs, send the block through
    # the last layer of the network, and score it. Print the lowest of the
    # sixteen accuracies, how many equal the intact one, and the mean drop.`,
              `import numpy as np
from oop_ml import BinaryCrossEntropy, DenseLayer, Dropout, Identity, LayerStack, Neuron, RectifiedLinear

crowd = np.array([
    (147, 41, 0), (156, 53, 1), (145, 57, 0), (159, 57, 1), (162, 61, 1), (120, 25, 0), (122, 28, 0),
    (118, 24, 0), (180, 80, 1), (183, 83, 1), (178, 78, 1), (145, 45, 0), (145, 55, 1), (151, 45, 1),
    (151, 55, 0), (157, 45, 0), (157, 55, 1), (148, 50, 1), (154, 50, 0), (160, 50, 1), (147, 58, 0),
    (153, 58, 1), (150, 42, 1), (156, 42, 0), (143, 50, 0),
], dtype=float)
rows = (crowd[:, :2] - crowd[:, :2].mean(axis=0)) / crowd[:, :2].std(axis=0)
labels = crowd[:, 2]

for name, extra in [("plain", []), ("dropout at 0.5", [Dropout(reads=16, drop_probability=0.5, random_seed=1001)])]:
    draw = np.random.default_rng(1)
    hidden = DenseLayer([Neuron(draw.normal(0.0, 1.0, 2), bias=0.0, activation=RectifiedLinear()) for _ in range(16)])
    output = DenseLayer([Neuron(draw.normal(0.0, 0.125 ** 0.5, 16), bias=0.0, activation=Identity())])
    network = LayerStack([hidden, *extra, output])
    for _ in range(400):
        network = network.stepped_by(network.backward_pass(rows, labels.reshape(-1, 1), BinaryCrossEntropy()), 1.0)

    intact = np.mean((network.respond_to(rows).outputs.ravel() >= 0) == labels)
    answers = np.array(network[0].respond_to(rows).outputs)
    silenced = []
    for unit in range(16):
        thinned = answers.copy()
        thinned[:, unit] = 0.0
        scores = network[len(network) - 1].respond_to(thinned).outputs.ravel()
        silenced.append(np.mean((scores >= 0) == labels))
    free = sum(accuracy == intact for accuracy in silenced)
    print(f"{name}: intact {intact:.2f}, lowest with one unit silenced {min(silenced):.2f}, units costing nothing {free}, mean drop {intact - np.mean(silenced):.4f}")`,
              `plain: intact 1.00, lowest with one unit silenced 0.76, units costing nothing 11, mean drop 0.0400
dropout at 0.5: intact 0.84, lowest with one unit silenced 0.84, units costing nothing 16, mean drop 0.0000`,
              { hints: ["backward_pass takes the rows, the targets as a block of one column, and the loss, and it states the training purpose for itself, so the dropout layer draws a fresh mask on every one of the four hundred steps without being told to.", "respond_to with no purpose is a predicting pass, where the dropout layer is the identity. That is why the hidden layer’s outputs can be handed straight to the last layer for both networks, skipping the dropout layer in the one that has it.", "A stack is indexed by position, the hidden layer at 0 and the output layer at len(network) - 1. The trained layers are the ones inside the stepped network, not the hidden and output you built before the loop."], check: numberCheck("What is the mean drop in training accuracy over the sixteen units of the plain network, to four places?", 0.04, 5e-05, "Eleven units cost nothing, and the other five cost 0.24, 0.16, 0.12, 0.08 and 0.04, which total 0.64 and average 0.04 over sixteen. The mean hides the shape. A mean drop of 0.04 reads like a fit spread evenly, where in fact one unit carries a quarter of the accuracy alone. The dropped network’s mean and its largest drop are both zero, which is the difference section 23 is pointing at.") },
            ),
          ],
        },
      ]}
    />
  );
}
