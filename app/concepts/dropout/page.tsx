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
  title: "Dropout · Perceptron Lab",
  description:
    "Dropout randomly removes some activations during training. The network therefore trains with changing combinations of available units, which can reduce overfitting without guaranteeing better predictions on every task.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function DropoutPage() {
  return (
    <ConceptPage
      lessonId="dropout"
      intuition={lessonIntuitions["dropout"]}
      technicalStart="Part 2. One Draw"
      openingTitle="What if a Useful Neuron Is Missing?"
      playgroundTitle="Remove some neuron outputs for one training pass"
      playgroundIntro="Compare the original activations with one masked draw, then draw again. Notice the difference between a training pass and a prediction pass."
      title="Dropout"
      tagline={"Dropout randomly removes some activations during training. The network therefore trains with changing combinations of available units, which can reduce overfitting without guaranteeing better predictions on every task."}
      prerequisites={<>Dropout modifies the outputs of a <Link href="/concepts/dense-layers" className={link}>dense layer</Link> and passes derivatives backward as explained in <Link href="/concepts/backpropagation" className={link}>backpropagation</Link>. The <Link href="/primers/statistics" className={link}>statistics primer</Link> introduces the expected value used to explain the scaling rule. We reuse the height-and-weight examples from <Link href="/concepts/bagging" className={link}>bagging</Link> and compare results on rows excluded from training, as in <Link href="/concepts/held-out-evaluation" className={link}>held-out evaluation</Link>.</>}

      playground={<DropoutPlayground />}
      sections={[
        { id: "part-1-why-a-network-memorises",
          title: "Part 1. Why a Network Memorizes",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A wide network on a mixed crowd">
                <>
<p>
                  Let&apos;s return to the tangled crowd from the bagging lesson: twenty-five people measured by height and weight, twelve children and thirteen adults. We deliberately mixed the labels in the middle. For each training fold we give a network sixteen ReLU hidden units and twenty of the people, then run four hundred full-batch updates with a learning rate of one. How closely will it fit those people, and how well will that carry over to the five held out?
                </p>
                <p>Across five folds and five seeds, training accuracy averages 99.2 percent while held-out accuracy averages 74.4 percent. Each person is held out once in each five-fold evaluation. The network fits its training labels much more closely than it predicts labels excluded from fitting.</p>
</>
                <MemorisationCurves showLoss={false} />
                <p>For the first seed, training accuracy rises from 0.89 at epoch 100 to 0.96 at epoch 200 and 0.99 at epoch 400. Held-out accuracy also rises, from 0.64 to 0.76 to 0.84. This run does not show held-out performance getting worse as training continues. It shows a gap between training and held-out performance. Across five seeds that gap is about a quarter of the observations, so the training score alone would overstate the performance we measured on excluded people.</p>
                <KeepInMind>
                  The training-versus-held-out gap shows that the training score overstates performance on these excluded examples. Check both scores: narrowing the gap by reducing training accuracy alone would not establish better predictions on new data.</KeepInMind>
              </SubSection>

              <SubSection title="2. Units that lean on one another">
                <p>We can also test how sensitive the fitted network is to individual hidden units. Set one unit’s contribution to zero during prediction and measure the change in accuracy. This is an ablation test. A large drop shows dependence on that unit for these examples; it does not by itself prove memorization or identify a particular pair of co-dependent units.</p>
                <UnitLeaningChart />
                <>
<p>In this fitted network, removing eleven of the sixteen units one at a time leaves training accuracy unchanged. Removing the thirteenth lowers it from 1.00 to 0.76; removing the twelfth lowers it to 0.84. Removing the sixteenth, third and fourteenth lowers accuracy by 0.12, 0.08 and 0.04 respectively. These tests identify sensitivity to individual removals, rather than proving that only two units matter jointly.</p>
                <p>
                  The right-hand panel is the same measurement on a network trained with dropout at one half, and Part 7 comes back to it; for now notice that silencing any one of its sixteen units changes its accuracy by exactly nothing.
                </p>
</>
                <KeepInMind>
                  A network may rely heavily on particular activations or combinations of them. Dropout perturbs which activations are available during training. We will measure whether that changes individual-unit sensitivity and held-out performance, rather than assuming either effect.</KeepInMind>
              </SubSection>

              <SubSection title="3. What dropout proposes">
                <>
<p>One response is to train several networks and combine their predictions. Dropout uses a different construction: on each training pass, a random mask sets some activations to zero. The remaining units must learn with different neighbors available on different passes. These thinned networks share weights, giving an ensemble-like effect within one training run. They are not independently trained models, and dropout does not guarantee the same predictions or benefit as averaging such models.</p>
                <p>This dropout layer does not directly subtract a penalty from a weight or shrink the weights as a separate operation. It changes the activations used during training. The resulting random objective can have a regularizing effect, which we will investigate by measuring the trained network rather than assuming it improved.</p>
</>
                <p>The dropout paper describes the masks as many thinned networks that share parameters. This gives an ensemble interpretation, while the implemented training step remains a mask applied to activations. Prediction without a mask is a practical approximation to combining those thinned networks; it is not generally their exact average after nonlinear operations.</p>
                <KeepInMind>
                  Dropout preserves the declared input and output shape and uses the same base loss formula. It changes the activations and therefore the losses and gradients seen during training. Averaging over masks defines a different training objective from always using every activation.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. One Draw",
          content: (
            <>
              <SubSection title="4. A coin over every unit">
                <p>The playground shows the same row in training and prediction modes. During training, each activation is randomly retained or set to zero. At a drop probability of one half, a retained value is doubled. During ordinary prediction, this inverted-dropout implementation leaves every value unchanged.</p>
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
                    Select Reset the neuron outputs and dropout rate to reproduce
                    these bars. Press draw again and the training outputs change;
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
                <p>Under seed 10, the three displayed rows retain two, three and two entries, with different masks. This implementation draws independently for every row and unit. Sharing one mask across a batch would create a different correlation pattern; shared masks are useful in some dropout variants, but they are not the rule being demonstrated here.</p>
                <KeepInMind>
                  Mask entries are independent across rows and units in this implementation. Two observations can receive different masks, and they can also receive the same mask by chance.</KeepInMind>
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
                <p>Without rescaling, retaining each activation with probability one half halves its expected contribution to the next weighted sum. It does not halve every individual draw. The displayed row totals 10; its first draw retains values 1 and 3, totaling 4 before scaling. Prediction with every value present would therefore use a different expected input scale from unscaled training.</p>
                <p>
                  So the survivors are raised by one over the keep
                  probability, and the doubled survivors total 8, which is
                  nearer the 10 the whole row would have sent. Nearer and not
                  equal, because the claim is about the average over many
                  draws and not about this one.
                </p>
                <WhyThisWorks title="Why dividing surviving outputs by their survival probability preserves the mean">
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
                  Scaling preserves each activation’s expected value and the next affine sum’s expected value. Individual training passes still fluctuate, and nonlinear operations can change the relation between those averages and the ordinary prediction.</KeepInMind>
              </SubSection>

              <SubSection title="8. The average lands on the predicting output">
                <p>The chart averages each unit’s output over four hundred successive masks from one seeded layer. The sample means approach the prediction-time values with fluctuations. A finite run can finish above or below its expected value rather than landing exactly on it.</p>
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
                  The second unit survived 192 of the 400 draws. Its average
                  therefore lands near the prediction-time value without matching
                  it exactly. The scaling rule uses the probability of survival;
                  a finite run has an observed survival share that can differ from
                  that probability.
                </p>
                <KeepInMind>
                  The scaling rule preserves an expectation over masks. It does not guarantee a particular sample mean or successful training. The next sections measure the variation of individual draws and what happens after a nonlinear activation.</KeepInMind>
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
                <WhyThisWorks title="Derive the variance introduced by masking one unit">
                  <>
                    <p>
                      The spread can be worked from the same two outcomes the
                      mean was. A unit holding v sends 0 with probability p and
                      v over 1 − p otherwise. Its variance is the mean of the
                      square of what it sends, less the square of its mean,
                      and the standard deviation is the square root of that.
                    </p>
                    <Equation>{"E[out²]   = (1 − p) · (v / (1 − p))²  =  v² / (1 − p)\nVar[out]  = v² / (1 − p) − v²        =  v² · p / (1 − p)\nsd[out]   = |v| · √(p / (1 − p))\n\nat p = 0.5     sd[out] = |v|"}</Equation>
                    <p>At a drop probability of one half, a single draw’s standard deviation equals the activation’s magnitude. For n independent draws of the same fixed activation, the sample mean has that standard deviation divided by the square root of n. At four hundred draws, the square root is twenty.</p>
                    <Equation>{"unit    value    sd of one pass    sd of the mean of 400    gap measured\nu1      1        1                 1 / 20 = 0.05            0.00\nu2      2        2                 2 / 20 = 0.10            0.08\nu3      3        3                 3 / 20 = 0.15            0.15\nu4      4        4                 4 / 20 = 0.20            0.08"}</Equation>
                    <p>In this run, all four measured gaps are at most one standard error. A standard error describes the scale of sampling variation; it is not an upper bound on an observed gap. Increasing the draw count by a factor of a hundred reduces each standard error by a factor of ten, without guaranteeing the same reduction in a particular realized error.</p>
                  </>
                </WhyThisWorks>
                <InAModel title="On the network trained with dropout at one half">
                  <ExperimentReadout panel="averaging" />
                  <>
<p>
                    The output layer here is straight, so its raw score is a weighted sum of what dropout sends and the derivation applies to it exactly. The largest predicting score in the crowd is 61.3 in magnitude. A single thinned pass puts some person&rsquo;s score as far as 62.0 from where the predicting pass puts it, and the mean over four hundred thinned passes is still 1.39 away, because four hundred is not many draws when the numbers being averaged swing by sixty.
                  </p>
                  <p>After sigmoid, the largest observed probability gap is 0.077. Averaging sigmoid outputs need not equal applying sigmoid to the average score. More draws reduce Monte Carlo sampling error, but they do not remove that underlying difference between the two calculations. The specific finite-sample gap may still change as draws are added.</p>
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
                <p>The original convention leaves retained values unscaled during training and applies the keep-probability correction at prediction time. That correction can be incorporated into the saved weights. Inverted dropout instead scales retained activations during training, so prediction needs no dropout scaling. Both conventions are usable when training and prediction follow the matching rule.</p>
                <Equation>{"original     training  out = value · m          predicting  out = value · (1 − p)\ninverted     training  out = value · m / (1 − p)   predicting  out = value"}</Equation>
                <p>
                  Both agree in expectation, by the same cancellation, and the
                  right-hand bars at the top of the page are the proof that
                  the inverted form is the one running here. The predicting pass
                  returns the row bit for bit, and the endpoint behind the
                  widget returns that answer rather than asserting it.
                </p>
                <KeepInMind>
                  Inverted dropout leaves ordinary prediction unchanged at this layer: no random mask is drawn and no scale factor is applied. The rest of the model still needs its learned parameters and normal input conventions.</KeepInMind>
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
              "Removing some individual units reduces accuracy on this same training set, while removing others leaves the predicted labels unchanged. The largest observed drop identifies a unit this fitted network depends on for those decisions. A one-unit removal experiment does not identify every interaction between units or establish robustness on new data.",
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
              "This implementation draws a separate keep/drop decision for each entry in the batch. Under seed 10, the three rows retain different sets of units. Sharing a mask across rows is another possible dropout design, but it creates different correlations between their forward responses. Here the per-entry mask is the contract to reproduce.",
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
              "The retained entries are scaled by the inverse keep probability, so this draw sends [2, 0, 6, 0]. Each individual input activation is preserved in expectation across mask draws. A particular draw need not preserve its sum, and being closer to the original sum is not the reason this scaling is used.",
              {
                "description": "Use inverted dropout: during training, a kept value is divided by the keep probability. A dropped value becomes zero. Prediction uses the unmasked row without this scaling."
              },
            ),
            trueFalse(
              "Because the layer is unbiased, a training pass and a predicting pass agree exactly rather than only on average.",
              false,
              "Inverted dropout preserves each activation’s expected value, not its exact value on a particular training pass. A following affine operation preserves that expectation, but a nonlinear activation generally does not commute with averaging. More mask draws reduce sampling error in an estimated mean; they do not remove a systematic difference caused by that nonlinearity.",
            ),
            trueFalse(
              "The inverted form puts the whole of the arithmetic on the training side, so a predicting pass returns the row bit for bit.",
              true,
              "Inverted dropout scales retained activations during training and acts as the identity during prediction. The earlier convention leaves retained training activations unscaled and applies a keep-probability correction at prediction. These conventions place the correction at different points; they do not imply every trained network has identical predictions. A saved model needs to preserve the convention used.",
            ),
        ],
        },
        {
          title: "Part 4. The Mask Is a Draw",
          content: (
            <>
              <SubSection title="11. A zero that survived">
                <p>{"The backward pass needs the mask drawn during the matching forward pass. A zero output cannot tell us whether an entry was dropped, because the incoming activation may already have been zero. The block below includes exact zeros of the kind ReLU produces. A rose outline marks positions where inferring the mask from outputs would disagree with the recorded draw."}</p>
                <DropoutBlockPass showBackward={false} initialPreset="rectified" />
                <p>{"Under seed 10, four of the twelve positions are misidentified, all of them zero-valued activations that were retained. The first row contains 0, 2, 0 and 4. The mask retains its first and third entries, so the displayed output is 0, 0, 0, 0. Treating those outputs as evidence that the whole row was dropped would incorrectly set every input derivative to zero, removing the training signal for the two retained positions."}</p>
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
                <p>{"Of the four hundred values, 282 were already zero before masking, and the mask retains 142 of those zero entries. Their outputs still look identical to entries that were dropped. Inferring the mask from the output would therefore misclassify 142 of 400 positions on this pass, more than a third. The network can continue training with that mistake, so a falling loss would not reveal it."}</p>
                <KeepInMind>
                  In the displayed pass, inferring the mask from zero outputs misidentifies more than a third of the entries. The exact proportion depends on the activations and draw. Retaining the actual mask prevents this ambiguity regardless of that proportion.</KeepInMind>
              </SubSection>

              <SubSection title="13. A draw against a derivable fact">
                <p>
                  So the layer carries the mask on its response, already
                  scaled and ready to multiply, and its backward step refuses
                  a response that arrives without one rather than guess. The{" "}
                  <Link href="/concepts/pooling" className={link}>
                    pooling page&rsquo;s
                  </Link>{" "}
                  layer instead recomputes its winners from values the response already stores. A pooling winner is determined by those values. A dropout mask came from a random draw, so we must retain the mask or enough random state to reproduce that exact draw.
                </p>
                <p>A seeded dropout layer must be reproducible across a sequence of passes while still producing new masks on later passes. Its random generator therefore advances after every draw.</p>
<p>The layer keeps that generator state when a training step occurs. Reconstructing a seeded generator from its initial seed after every step would repeat the same mask, permanently removing the same contributions instead of varying them across training passes.</p>
<p>The chart uses four hundred successive draws from one generator. Under the same seed and call sequence, repeating the experiment reproduces those draws. An unseeded construction does not promise the same sequence on another run.</p>
                <KeepInMind>
                  The saved activations do not determine which entries the random mask retained. Keep the mask, or preserve enough generator state and call history to reproduce it. A pooling winner, by contrast, is determined by the input values and the pooling rule.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Backward Pass Through a Mask",
          content: (
            <>
              <SubSection title="14. Blame through the same mask">
                <p>{"The backward pass receives derivatives of the loss with respect to the dropout outputs and returns derivatives with respect to its inputs. A dropped entry has no route through this pass, so its input derivative is zero. A retained entry was multiplied by the training scale, so its arriving derivative is multiplied by that same scale. The stored scaled mask describes both cases."}</p>
                <Equation>{"passed_down_j = arriving_j · m_j / (1 − p)"}</Equation>
                <DropoutBlockPass />
                <p>With an arriving block of ones, the input gradient equals the scaled mask. Under seed 10, the three rows pass back 2, 0, 2, 0; 2, 0, 2, 2; and 0, 2, 2, 0. Dropout has no learned parameters, so its parameter gradient is absent. That differs from a trainable layer whose existing parameters happen to receive zero gradients.</p>
                <KeepInMind>
                  The backward step is the forward step&rsquo;s multiplication
                  applied to the arriving blame, with the same mask and the
                  same scale, and nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Checking it against a finite difference">
                <p>Leaving out the scale in the backward calculation multiplies the gradients passed to earlier layers by the keep probability. That changes their updates, and does not guarantee the same convergence. Check the derivative by holding the mask fixed while nudging each input up and down. Replaying a generator from the same state and call sequence is one way to recover the matching mask.</p>
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
                  The finite-difference check compares the implemented backward calculation with the derivative of the same fixed-mask forward function. Using a different random mask for the two nudges would compare different functions instead.</KeepInMind>
              </SubSection>

              <SubSection title="16. Derivatives for Retained Zero Activations" id="16-a-kept-zero-is-paid-in-full">
                <p>{"For the rectified block, the first row's output contains only zeros, but its input derivatives are 2, 0, 6, 0 when the arriving derivatives are 1, 2, 3, 4. The first and third entries were retained and use the scale of 2. An entry that was retained with a zero activation and an entry that was dropped therefore need different derivatives, despite having identical displayed outputs."}</p>
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
                <p>The numerical example shows why the mask must distinguish retained zeros from dropped entries. Select the rectified block in section 14. The outlined cells mark nonzero input derivatives that would be lost if the mask were inferred from the all-zero output row.</p>
                <KeepInMind>
                  A retained zero activation still has a local multiplier equal to the keep-probability scale. Its input derivative therefore follows the arriving derivative and that scale. The output value alone cannot identify that multiplier; the saved mask can.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Two Purposes",
          content: (
            <>
              <SubSection title="17. Why a layer needs to know why it is running">
                <p>Dropout needs different behavior for training and ordinary prediction. The training path samples a mask; the ordinary prediction path uses all activations. This SDK passes an explicit purpose through every layer. <Link href="/concepts/normalisation-layers" className={link}>Batch normalization</Link> also uses that purpose to choose current-batch or stored statistics.</p>
<p>Some applications deliberately keep dropout active for repeated inference calls, often called Monte Carlo dropout. That is a separate evaluation procedure, rather than an accidental omission of prediction mode.</p>
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
                <p>In a network using dropout as its only mode-dependent layer, selecting prediction mode during training omits the intended masking. Selecting training mode during ordinary prediction introduces a fresh mask. These are different changes, so inspect the output variation and training effects separately.</p>
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
<p>{"This implementation makes an unspecified forward pass a predicting pass, which avoids introducing random masking into an ordinary prediction. Its backward path explicitly selects training behavior when preparing the dropout calculation. That keeps the stored mask and the derivative aligned with the training computation the SDK expects, rather than leaving every caller to remember the mode. This is an implementation convention; calculating a derivative in general does not always mean we intend to train."}</p>
                <p>
                  The only place a caller says it is when reading a training-mode answer on purpose, which is what the experiment above did to measure the swing.
                </p>
</>
                <KeepInMind>
                  The default prediction mode gives a deterministic pass through this dropout layer. The SDK’s backward-pass helper explicitly requests training mode so its saved mask matches the gradient calculation. Other callers can choose a mode deliberately.</KeepInMind>
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
              "An output zero can mean the entry was dropped or that a retained input was already zero. The output values cannot distinguish those cases. The saved mask records which derivative path was retained, including retained zero-valued inputs. Reconstructing a mask from nonzero outputs can therefore give an incorrect backward calculation even when the forward output looks correct.",
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
              "The random mask is not determined by the input values alone, so this API saves it in the forward response for reuse in the backward pass. Reproducing it would require the same random-generator state and draw order. A predicting response has no training mask, and the backward API rejects it. Pooling winners, by contrast, can be found again from their saved input values.",
            ),
            trueFalse(
              "Having no weights of its own, the layer reports no parameter gradient at all, rather than a block of zeros.",
              true,
              "The layer has no trainable parameters, so it returns no parameter-gradient array. It still calculates input derivatives by applying the same scaled mask used in the forward pass. A retained input of zero can have a nonzero derivative, which is why the all-zero output row does not imply an all-zero backward result.",
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
              "The backward pass must include the same retained-entry scale as the forward calculation. Omitting it makes those derivatives too small by the keep probability. A numerical gradient check must hold the random mask fixed across the nearby evaluations; otherwise it compares different functions. With keep probability one half, a missing correction gives a factor-of-two discrepancy at retained entries with a nonzero upstream derivative.",
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
              "In this SDK, a direct forward call defaults to prediction mode, while backward_pass requests training mode. If a custom training loop accidentally uses prediction mode, dropout supplies no masking. If evaluation uses training mode, repeated predictions can vary because new masks are drawn. Their practical effects depend on the task, so neither mistake has a universal severity ranking.",
            ),
        ],
        },
        {
          title: "Part 7. Dropout Measured on the Crowd",
          content: (
            <>
              <SubSection title="20. The experiment">
                <>
<p>Twenty-five observations give a small and variable held-out estimate. This experiment uses five folds: train on twenty and score the other five, then repeat until each person has been excluded from one fit. Combining those predictions uses all twenty-five observations for evaluation without training a model on the observation it is predicting.</p>
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
                <p>The held-out mean changes little compared with the variation observed across these five seeds. The sweep therefore provides limited evidence of a generalization improvement from either dropout setting on this small dataset. Training accuracy falls more substantially, so the narrower training-versus-held-out gap should not be mistaken for a corresponding improvement on excluded examples.</p>
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
                  The gap narrows mainly because dropout reduces training accuracy. The held-out means remain close to the no-dropout comparison in these runs. This shows a change in how closely the model fits its training labels, rather than demonstrating that the changed fit predicts new labels better.</KeepInMind>
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
                  Dropout’s sampled training loss measures the current masked computation and can be noisy. Prediction-mode training and validation measurements answer a different question about the model used for ordinary inference. Record which mode and which data produced each curve; both can help explain a run.</KeepInMind>
              </SubSection>

              <SubSection title="23. What the network stopped leaning on">
                <p>The single-unit ablations test a different property from held-out accuracy. Without dropout, removing the thirteenth unit lowers training accuracy by 0.24. With dropout at one half, accuracy is 0.84 with all units present and remains 0.84 after any one of the sixteen removals. The mean and largest accuracy drops are both 0.000 in that test. None of those units is inactive on every example.</p>
                <p>The dropout paper uses co-adaptation to describe features relying on particular other features. This ablation experiment is consistent with less reliance on any one unit, but does not directly measure all pairwise dependencies or prove co-adaptation has been removed. What it establishes is unchanged class accuracy under each tested single-unit removal. The probability outputs and larger removals could still behave differently.</p>
                <KeepInMind>
                  For this fitted network, dropout changes sensitivity to the tested unit removals without a clear improvement in held-out accuracy. Those are separate findings. Measure the property you need rather than assuming either is dropout’s most reliable effect at every scale.</KeepInMind>
              </SubSection>

              <SubSection title="24. Where it earns its keep">
                <>
<p>A prominent early use was AlexNet, with about sixty million parameters and two 4096-unit fully connected hidden layers above its convolutions. Its authors used dropout in those dense layers to reduce overfitting. This page tests a much smaller network on twenty-five observations. Its mixed labels and small sample limit what we can conclude, but they do not prove that no useful generalization is possible.</p>
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
          title: "Part 8. Keeping Training Masks Out of Prediction" , id: "part-8-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="25. Probability, scaling and the lifetime of a mask" id="25-what-a-complete-implementation-states">
                <p>A dropout layer needs to make its two modes unambiguous. State the drop probability and its legal range, whether scaling happens during training or prediction, and which mode a call uses by default. Prediction should not accidentally inherit a training mask.</p>
                <p>During training, each entry in each row receives an independent draw. The response carries the resulting mask so the backward pass can follow the same choices. Check what happens when that mask is missing, what gradient passes to the preceding layer, and that there is no parameter gradient to update.</p>
                <p>Reproducing a run also requires the generator seed and the effect of stepping the layer on that generator. The input and output arrangements stay the same, which is what allows dropout to fit between compatible layers.</p>
              </SubSection>

              <SubSection title="26. Zero dropout, complete dropout and invalid masks" id="26-the-edges-probed">
                <p>
                  Every row below was run rather than reasoned about. A refusal is a
                  typed error with a message written to be read; an acceptance
                  is what the layer did instead.
                </p>
                <DerivationTable
                  expressionHeading="Dropout setting or input"
                  reasonHeading="What happens to the activations"
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
                    { expression: "a backward step whose arriving block holds a nan", reason: "accepted; the NaN can pass into the returned input gradient because this backward check validates arrangement rather than finiteness." },
                    { expression: "a backward step handed another dropout layer's response of the same shape", reason: "accepted with the supplied response’s mask. Shape alone does not identify its producer; the normal stack backward pass pairs responses with their own layer positions." },
                    { expression: "no seed", reason: "accepted; the layer initializes its generator without a supplied seed, so separate constructions need not reproduce the same sequence. Their masks can still coincide by chance." },
                    { expression: "stepping the layer", reason: "returns the same layer, preserving its generator state for the next draw. A subsequent mask can coincide with an earlier one by chance." },
                    { expression: "a dropout layer of the wrong width inside a stack", reason: "refused when the stack is built, before any data, naming the two arrangements that do not join." },
                  ]}
                />
                <p>Matching arrangements establishes that the arriving derivatives and response have compatible shapes. It does not establish that every derivative is finite or that the response came from this dropout layer. The normal stack path retains the correct layer-response pairing. Direct callers must preserve that pairing and validate non-finite gradients where needed.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 7 and 8",
          quiz: [
            trueFalse(
              "In this comparison the training-to-held-out gap shrank at both dropout rates, while neither held-out mean improved by more than 0.008.",
              true,
              "The gaps shrink from 0.248 to 0.198 and 0.158. The held-out mean rises by 0.008 at drop probability 0.2 and falls by 0.016 at 0.5. Those descriptive results do not establish a reliable improvement; overlapping seed ranges alone are not a statistical test. The clearest observed changes here are the smaller training gap and the single-unit ablation results.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "setting | training accuracy | held out | gap | held out across seeds\nno dropout | 0.992 | 0.744 | 0.248 | 0.64 to 0.84\ndropout at 0.2 | 0.950 | 0.752 | 0.198 | 0.68 to 0.80\ndropout at 0.5 | 0.886 | 0.728 | 0.158 | 0.64 to 0.80"
              },
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
              "For this fitted dropout network, removing any one hidden unit leaves training accuracy unchanged. That is evidence of reduced dependence on individual units for these decisions, not proof that all interactions between units disappeared. The held-out comparison also does not establish a reliable improvement on new observations. Keep robustness to this ablation separate from generalization.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Held-out accuracy, one fitted network at each setting:\nDropout p = 0.5, all 16 units present: 0.84\nDropout p = 0.5, any one unit silenced: 0.84\nDropout p = 0.5, units that are always inactive: 0\nPlain network: silencing unit 13 reduces accuracy by 0.24."
              },
            ),
            trueFalse(
              "Dropout supplies the missing real-world examples when a training dataset is too small.",
              false,
              "Dropout masks parts of the network while training. It can change how the model uses its capacity, but it does not provide new observations of the underlying problem. Whether it improves held-out predictions still has to be measured.",
            ),
            several(
              "Which of these requests meet this dropout layer’s contract?",
              [
                              "A drop probability of 0",
                              "A drop probability of 0.999",
                              "A drop probability of exactly 1",
                              "A backward step handed a predicting response",
                            ],
              [0, 1],
              "At zero the layer is the identity and keeps everything, which is what a control in a search over this setting needs. At 0.999 the scale is 1000, large and finite, so a survivor is raised a thousandfold. A probability of 1 silences the whole layer and leaves nothing to scale, so it is refused at construction. A predicting response carries no mask, and guessing one from the outputs is the mistake Part 4 is about, so the backward step refuses it.",
              {
                "description": "The SDK accepts finite drop probabilities p with 0 ≤ p < 1. Backpropagation requires the mask saved in a training response. A predicting response does not carry a training mask."
              },
            ),
        ],
        },
        {
          title: "Practice. Drawing Masks With the Library",
          practice: [
            exercise(
              "One draw, and then four hundred",
              [
  "Build the supplied four-unit Dropout with probability 0.5 and seed 10. Print one predicting output and one training output for [1,2,3,4].",
  "Rebuild from that seed, record four hundred consecutive training outputs and print per-unit survival counts, mean outputs and number of passes with all units dropped."
],
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
              { hints: [
  "Prediction does not draw a mask. Training advances the layer’s random generator each time.",
  "These inputs are strictly positive, so positive output identifies survival here. That shortcut fails when an input already equals zero."
], check: numberCheck("On how many of the four hundred training passes were all four units silenced at once?", 26, 0.5, "Twenty-six of these four hundred draws drop all four units. A small layer can produce an entirely zero training output even though each unit has a nonzero keep probability."), question: "What stays the same on average when individual units are randomly removed?" },
            ),
            exercise(
              "Send blame back through a mask the outputs cannot show",
              [
  "Apply the supplied training dropout layer to the three-row block containing existing zeros. Print outputs, its actual kept mask, an output-derived mask and their disagreement count.",
  "Using the same response, pass the supplied upstream derivatives backward. Print input derivatives, whether parameter gradient is None and actual/shortcut derivative totals. Finally attempt the backward call with a predicting response and print its refusal."
],
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
              { hints: [
  "Use response.kept for the training mask; an output zero may have been kept from a zero input.",
  "correction_for needs its own forward training response so it can apply the exact same mask and scale."
], check: numberCheck("What is the sum of the input derivatives returned for this block?", 34.0, 0.05, "The actual input-derivative total is 34. The saved mask includes retained zero-valued inputs whose derivatives an output-derived mask would incorrectly discard."), question: "Can output zeros reveal which dropout entries were actually removed?" },
            ),
            exercise(
              "Train with and without, then silence one unit at a time",
              [
  "Train the supplied plain and dropout networks from the same starting seed for four hundred full-batch updates at rate 1. Predict with a raw score threshold of zero.",
  "For each trained model print intact accuracy, worst accuracy after silencing each hidden column in turn, number of removals causing no accuracy drop and mean drop. Evaluate the same supplied crowd for both."
],
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
              { hints: [
  "Use the stepped network’s hidden/output layers, not the original pre-training objects.",
  "During evaluation dropout is the identity. Zero one copied hidden column before the final layer for each removal experiment."
], check: numberCheck("What is the mean drop in training accuracy over the sixteen units of the plain network, to four places?", 0.04, 5e-05, "The plain network’s mean accuracy drop is 0.0400. This removal experiment measures its dependence on individual trained units for this same dataset."), question: "Does training with dropout change sensitivity to losing one hidden unit?" },
            ),
          ],
        },
      ]}
    />
  );
}
