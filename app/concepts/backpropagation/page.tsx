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
import { BackpropagationPlayground } from "@/components/widgets/BackpropagationPlayground";
import { DependencyPath } from "@/components/widgets/DependencyPath";
import { FiniteDifferenceCheck } from "@/components/widgets/FiniteDifferenceCheck";
import { ForwardTrace } from "@/components/widgets/ForwardTrace";
import { HiddenGradients } from "@/components/widgets/HiddenGradients";
import { LocalResponsibility } from "@/components/widgets/LocalResponsibility";
import { LossStart } from "@/components/widgets/LossStart";
import { OutputNeuronBackward } from "@/components/widgets/OutputNeuronBackward";
import { PassDown } from "@/components/widgets/PassDown";
import { ReluGate } from "@/components/widgets/ReluGate";
import { ShapesTable } from "@/components/widgets/ShapesTable";
import { UpdateThenReforward } from "@/components/widgets/UpdateThenReforward";

export const metadata: Metadata = {
  title: "Backpropagation · Perceptron Lab",
  description:
    "Backpropagation applies the chain rule through a network's calculations. Working backward from the loss gives the derivatives needed to determine how changes to each weight affect that loss.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function BackpropagationPage() {
  return (
    <ConceptPage
      lessonId="backpropagation"
      intuition={lessonIntuitions["backpropagation"]}
      technicalStart="Part 2. Backward Through the Output Neuron"
      openingTitle="Which Weight Should Change?"
      playgroundTitle="Trace an output error back to the weights"
      playgroundIntro="Follow the prediction forward and the gradients backward. Compare a gradient with the loss change produced by a small numerical nudge to that weight."
      title="Backpropagation"
      tagline={"Backpropagation applies the chain rule through a network's calculations. Working backward from the loss gives the derivatives needed to determine how changes to each weight affect that loss."}
      prerequisites={
        <>
          The network is the{" "}
          <Link href="/concepts/dense-layers" className={linkClass}>
            dense layers page&rsquo;s
          </Link>{" "}
          2-3-1 stack, the number being lowered is the squared error from the{" "}
          <Link href="/concepts/loss-functions" className={linkClass}>
            loss functions page
          </Link>
          , and the whole method is the chain rule from the{" "}
          <Link href="/primers/calculus" className={linkClass}>
            calculus primer
          </Link>
          , applied one layer at a time. We follow one example through the
          network and use the interactive diagram to inspect its intermediate values.
        </>
      }

      playground={<BackpropagationPlayground />}
      sections={[
        {
          title: "Part 1. What Training Needs",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. What the forward pass left behind">
                <p>
                  Let&apos;s follow a prediction before trying to work backwards from its error. The row (1, 2) enters a network with two inputs, three hidden neurons and one output neuron. Each hidden neuron forms a weighted score and applies ReLU. The output neuron combines those three activations. Its activation is identity, so its score is also the prediction. We compare that prediction with a target of one using half the squared error.
                </p>
                <ForwardTrace />
                <p>
                  We keep the intermediate values from that calculation. During the backward pass, a derivative can depend on an input or score computed earlier. Saving those values lets us calculate the derivatives without running the forward pass again.
                </p>
                <KeepInMind>
                  The forward pass is a sequence of small computations that
                  transforms an input into a loss, and the backward pass needs
                  the intermediate values it produced along the way. No
                  derivative has appeared yet.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What training needs to know">
                <p>
                  A gradient-descent step needs one number per weight, the
                  slope of the loss with respect to that weight. In plain
                  terms, if this weight went up a little, would the loss rise
                  or fall, and how sharply?
                </p>
                <Equation>{"∂L/∂w, for every w in the network"}</Equation>
                <p>A hidden weight affects the loss through several calculations. It changes its neuron’s score, which changes the activation, which becomes an input to the output neuron. The final prediction then changes the loss. The diagram highlights that dependency path for the chosen weight and displays the intermediate values from the forward pass.</p>
                <DependencyPath />
                <KeepInMind>
                  Backpropagation calculates the loss’s local sensitivity to each parameter. A derivative describes how a sufficiently small change would affect the loss at the current parameter values. It does not divide the existing loss into amounts caused by each weight.</KeepInMind>
              </SubSection>

              <SubSection title="3. Following one weight to the loss">
                <p>
                  Take one neuron rather than the whole layer, and take the
                  output neuron because its route is shortest. Three separate
                  questions can be asked about it. How much does the loss
                  respond to the neuron&rsquo;s output? How much does the
                  neuron&rsquo;s output respond to its score? How much does its
                  score respond to one particular weight? Each has a small,
                  local answer, and the chain rule multiplies them.
                </p>
                <LocalResponsibility />
                <Equation>{"∂L/∂w = (∂L/∂a) · (∂a/∂z) · (∂z/∂w)"}</Equation>
                <WhyThisWorks title="Why a product">
                  <p>
                    A small change in w moves z by ∂z/∂w times as much, that
                    change in z moves a by ∂a/∂z times as much, and that change
                    in a moves L by ∂L/∂a times as much. Three magnifications
                    in a row multiply, which is the calculus primer&rsquo;s
                    chain rule and nothing more.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Along one dependency path, the chain rule multiplies the local derivatives. When a value affects the loss through several paths, their contributions are added. Each layer provides the local derivatives needed to continue that calculation backward.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Backward Through the Output Neuron",
          content: (
            <>
              <SubSection title="4. Beginning at the loss">
                <p>
                  The walk has to start somewhere, and it starts at the loss,
                  which for this page is half the squared miss.
                </p>
                <Equation>{"L = ½ (ŷ − y)²            ∂L/∂ŷ = ŷ − y"}</Equation>
                <p>
                  The half is there so the derivative comes out as a clean
                  subtraction. Two different numbers live at this point and
                  the page will keep them apart. The loss is a value, how wrong
                  the network is. The slope of the loss is a rate, how fast
                  that wrongness changes when the prediction moves.
                </p>
                <LossStart />
                <WorkedExample title="Start with the error at the output neuron">
                  <>
                    <p>
                      The prediction is 5 and the target is 1. This example uses half
                      the squared error as its loss. First calculate the miss, then the
                      loss and its derivative with respect to the prediction.
                    </p>
                    <Equation>{"miss = prediction − target = 5 − 1 = 4\nloss = ½ × miss² = ½ × 4² = 8\n∂loss/∂prediction = prediction − target = 4"}</Equation>
                    <p>
                      That derivative is the first gradient to arrive at the output
                      neuron. It says that a sufficiently small increase in the
                      prediction raises the loss by about four times that increase.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  The backward pass begins with the loss telling the output how
                  a change in the prediction would change the loss. What
                  travels is the slope, not the loss.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Backward through the output neuron">
                <>
                  <p>
                    The output neuron is a useful place to learn the backward
                    calculation because its activation function is the identity: it
                    returns its score unchanged.
                  </p>
                  <Equation>{"output a = g(z) = z\nactivation derivative g′(z) = 1"}</Equation>
                  <p>
                    Call the gradient with respect to the score the delta. To obtain it,
                    multiply the arriving output gradient by the activation derivative.
                  </p>
                </>
                <Equation>{"δ = (∂L/∂a) · g′(z)"}</Equation>
                <p>
                  Then pick one edge, the weight from h₁ into the output. The
                  score is a weighted sum, so its slope with respect to that
                  weight is whatever the weight multiplied, and the
                  weight&rsquo;s gradient is the delta times that.
                </p>
                <Equation>{"z = w₁h₁ + w₂h₂ + w₃h₃ + b\n∂z/∂w₁ = h₁\n∂L/∂w₁ = δ · h₁"}</Equation>
                <OutputNeuronBackward />
                <WorkedExample title="The four numbers">
                  <>
                    <p>
                      The output neuron received inputs 3, 0 and 1. Each weight gradient
                      is the delta multiplied by the input attached to that weight. The
                      bias is added directly, so its multiplier is one.
                    </p>
                    <Equation>{"delta = 4 × 1 = 4\nweight gradients = 4 × (3, 0, 1) = (12, 0, 4)\nbias gradient = 4 × 1 = 4"}</Equation>
                    <p>
                      The first weight has the largest gradient because it multiplied
                      the largest input. The second has a zero gradient on this example
                      because its input was zero.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>

                  The neuron&rsquo;s delta is shared by all of its parameters,
                  while each weight&rsquo;s gradient is the delta scaled by the
                  input that traveled across that edge.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Passing the gradient to the hidden layer">
                <p>We now know the output neuron’s parameter gradients, but keep its current weights in place while calculating the hidden gradients. Changing h₁ changes the output score at a rate of w₁, because h₁ is multiplied by that weight. Multiplying by the output delta therefore gives the loss derivative with respect to h₁. Apply the same rule to the other hidden outputs.</p>
                <Equation>{"∂z_out/∂h₁ = w₁            ∂L/∂h₁ = δ_out · w₁"}</Equation>
                <PassDown />
                <WorkedExample title="The passed-down block">
                  <>
                    <p>
                      Multiply the output delta by the three output weights to pass the
                      gradient back to the hidden outputs.
                    </p>
                    <Equation>{"hidden output gradients = 4 × (1, −1, 2) = (4, −4, 8)"}</Equation>
                    <p>
                      These are the gradients arriving at h₁, h₂ and h₃. Each hidden
                      neuron must still account for its own activation function.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  A layer calculates gradients for its own parameters and also
                  reports how sensitive the loss is to each of its inputs.
                  Those are two different jobs, and the second is what lets
                  the layer beneath do both jobs in turn. That distinction is
                  the whole of the reusable layer interface.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. The Hidden Layer",
          content: (
            <>
              <SubSection title="7. Backward through the rectifier">
                <p>
                  The hidden neurons have an activation function that is not the identity, and
                  this is what changes. For each of them, take the arriving
                  gradient, recall the score the forward pass kept, evaluate
                  the rectifier&rsquo;s derivative at that score, and multiply.
                </p>
                <ReluGate />
                <NumberTable
                  headings={["neuron", "arriving gradient", "original score", "rectifier slope", "delta"]}
                  rows={[
                    ["h₁", "4", "3", "1", "4"],
                    ["h₂", "−4", "−1", "0", "0"],
                    ["h₃", "8", "1", "1", "8"],
                  ]}
                />
                <p>The second hidden neuron has score −1, so ReLU outputs zero and has derivative zero there. Its arriving gradient of −4 is multiplied by that zero derivative. The resulting delta is zero, and this example produces no loss-gradient update for that neuron. A different input may activate it; zero gradient on one example does not establish that the unit is permanently inactive.</p>
                <KeepInMind>
                  The activation derivative scales the arriving gradient. At the displayed scores, sigmoid and tanh pass nonzero fractions of it, while ReLU blocks the negative-score unit. Other scores, zero arriving gradients or floating-point saturation can produce different outcomes.</KeepInMind>
              </SubSection>

              <SubSection title="8. Calculating the hidden gradients">
                <>
                  <p>{"A neuron's delta measures how the final loss responds to its score before activation. Once we know that quantity, each incoming weight contributes through the input it multiplies. The first hidden neuron's delta is 4, and its received inputs are 1 and 2. We can therefore use the same weight-gradient rule already applied to the output neuron."}</p>
                  <Equation>{"weight gradients = 4 × (1, 2) = (4, 8)\nbias gradient = 4 × 1 = 4"}</Equation>
                </>
                <HiddenGradients />
                <KeepInMind>
                  No new rule was introduced. Once a layer has its arriving
                  gradient, every dense layer performs the same backward
                  calculation, whatever sits above or below it.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The four-line rule for a dense layer">
                <p>
                  Everything done by hand above is four lines, and now that
                  each has been used they can be written as a summary rather
                  than a rule to decode.
                </p>
                <Equation>{"δ = arriving ⊙ g′(z)\n∂L/∂W = δ xᵀ\n∂L/∂b = δ\n∂L/∂x = Wᵀ δ"}</Equation>
                <DerivationTable
                  expressionHeading="line"
                  reasonHeading="its job"
                  rows={[
                    { expression: "the delta", reason: "move the arriving gradient through the activation. Section 5 for the identity, section 7 for the rectifier." },
                    { expression: "the weight gradient", reason: "what the layer keeps to update its weights. Section 5, then section 8." },
                    { expression: "the bias gradient", reason: "what the layer keeps to update its biases. A weight on a constant input of one." },
                    { expression: "the input gradient", reason: "what the layer hands down, so the preceding layer has an arriving gradient of its own. Section 6." },
                  ]}
                />
                <p>
                  Two names are worth having now. The arriving block is the
                  slope of the loss at a layer&rsquo;s outputs, which came from
                  the loss for the top layer and from the layer above for
                  everyone else. The passed-down block is the slope at its
                  inputs, which is the next layer down&rsquo;s arriving block.
                  One variable threads the whole walk.
                </p>
                <KeepInMind>
                  Each layer returns gradients for its parameters and a gradient with respect to its inputs. The optimizer uses the parameter gradients. The preceding layer receives the input gradient as its own arriving gradient.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "A distant weight’s effect on the loss is found by multiplying the local effects along the path from the weight to the loss, so every layer only ever has to know its own local effects.",
              true,
              "Along one path, the chain rule multiplies the local derivatives between a parameter and the loss. If a value feeds several paths, their contributions are added. A layer therefore needs its own local derivatives and the loss gradient arriving from later layers. It can calculate its parameter gradients and pass the appropriate input gradient to the preceding layer.",
            ),
            trueFalse(
              "What travels backwards from the loss into the output neuron is the loss itself.",
              false,
              "Two numbers live at that point and the page keeps them apart. The loss is a value, how wrong the network is, and with a prediction of 5 against a target of 1 it is 8. What travels is the slope, a rate, and here it is 4, which says a small increase in the prediction raises the loss by about four times that increase.",
            ),
            choice(
              "The output delta is 4 and the output weights are (1, −1, 2). What arrives at the three hidden outputs h₁, h₂ and h₃?",
              [
                "(4, −4, 8), the delta times each output weight",
                "(12, 0, 4), the delta times each hidden output",
                "(4, 4, 4), the delta handed to each of them unchanged",
                "(3, 0, 1), the hidden outputs themselves",
              ],
              0,
              "h₁ appears in the output score once, multiplied by w₁, so the loss’s sensitivity to h₁ is the output delta times w₁, and the same for the other two. The block (12, 0, 4) is the output neuron’s own weight gradient, the delta times its inputs 3, 0 and 1, which the neuron keeps to update itself rather than passes down. Keeping the gradient and passing the sensitivity are the two different jobs a layer does.",
            ),
            choice(
              "h₂ scored −1, the rectifier turned that into 0 going forward, and a gradient of −4 arrives. What happens?",
              [
                "It passes through unchanged, since the rectifier is linear where it is active",
                "It becomes a delta of 0, so this neuron receives no update from this row",
                "It changes sign, because the score was negative",
                "It is shared out between h₁ and h₃",
              ],
              1,
              "At this negative score, ReLU has derivative zero. The incoming gradient is therefore blocked at this response, giving this neuron zero parameter gradients for this row. Another input can put its score above zero. Sigmoid or tanh would have a nonzero mathematical derivative at this particular score, but neither activation guarantees nonzero parameter gradients in every network.",
            ),
            several(
              "In the SDK’s cached-forward interface, which jobs does a dense layer perform during its backward pass?",
              [
                              "Calculate the gradients of its own parameters",
                              "Report how sensitive the loss is to each of its inputs",
                              "Re-run its forward calculation to recover the scores it needs",
                              "Consult which activation function the layer above used",
                            ],
              [0, 1],
              "The dense layer calculates gradients for its own weights and biases, and calculates the gradient with respect to its inputs. The first result is used for parameter updates; the second lets the preceding layer continue the backward pass. Cached inputs and scores keep these calculations tied to the same forward evaluation.",
              {
                "description": "The forward response already holds the layer’s inputs, scores and activations. The backward call receives this response and the gradient arriving from the layer above. It does not need to reconstruct the forward response."
              },
            ),
        ],
        },
        {
          title: "Part 4. Update and Check",
          content: (
            <>
              <SubSection title="10. Updating the parameters">
                <p>For this gradient-descent step, calculate every derivative using the same parameter state that produced the forward pass. Store the parameter gradients first, then apply the updates. Using an already-updated output weight to calculate a hidden gradient would mix two network states. Keeping the phases separate avoids that mistake.</p>
                <Equation>{"θ_new = θ_old − η · ∂L/∂θ"}</Equation>
                <UpdateThenReforward />
                <WorkedExample title="One step at η = 0.05">
                  <p>
                    The hidden neurons started at (1, 1), (1, −1) and (−1, 1) and the output neuron at (1, −1, 2), with every bias at zero. Every parameter moves by a twentieth of its slope, and h₁ is enough to see the rule at work, since section 8 found its weight gradients to be (4, 8) and its bias gradient 4.
                  </p>
                  <Equation>{"h₁ weights: (1, 1) − 0.05 × (4, 8) = (0.8, 0.6)\nh₁ bias: 0 − 0.05 × 4 = −0.2"}</Equation>
                  <p>
                    The same rule takes the output weights to (0.4, −1, 1.8) with a bias of −0.2 and h₃ to (−1.4, 0.2) with a bias of −0.4, and leaves h₂ exactly where it was, since every one of its gradients was zero. Then the row goes through again, because it must. The weights changed, so the scores and activations changed, and the old intermediate values and the old gradients describe a network that no longer exists.
                  </p>
                  <Equation>{"h₁ score: 0.8 × 1 + 0.6 × 2 − 0.2 = 1.8\nh₃ score: −1.4 × 1 + 0.2 × 2 − 0.4 = −1.4\nprediction: 0.4 × 1.8 + (−1) × 0 + 1.8 × 0 − 0.2 = 0.52\nloss: ½ × (0.52 − 1)² = 0.1152"}</Equation>
                  <p>
                    On the second pass h₃ scores −1.4 and goes dark beside h₂, so only h₁ reaches the output, the prediction is 0.52, and the loss falls from 8 to 0.1152.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Backpropagation calculates the slopes; gradient descent uses
                  the slopes to move the parameters; and the next forward pass
                  has to be run afresh, since the network it would describe is
                  a different one.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Checking a gradient numerically">
                <p>
                  The chain rule&rsquo;s answer can be checked without the
                  chain rule. Take one weight, nudge it up by a tiny ε and
                  measure the loss, nudge it down by ε and measure again, and
                  divide the difference by the width of the nudge.
                </p>
                <Equation>{"[L(w + ε) − L(w − ε)] / 2ε  ≈  ∂L/∂w"}</Equation>
                <FiniteDifferenceCheck />
                <InAModel title="On the weight from h₁ into the output">
                  <p>
                    The chain rule says 12. The nudge, at ε of a millionth,
                    says 11.999999998, a disagreement of 2.3e-9, which is the
                    rounding in a difference of two losses near eight and not
                    a disagreement about the slope. The same check on
                    h₁&rsquo;s weight from x₂ gives 8 against 8.000000001.
                  </p>
                </InAModel>
                <p>A centered finite difference needs two additional loss evaluations for each checked parameter. Backpropagation obtains all parameter gradients in one backward traversal, reusing the forward values. Its cost is typically on the same order as a forward pass, rather than growing by two full passes per parameter. This makes finite differences useful for selected implementation checks and backpropagation practical for training large networks.</p>
                <KeepInMind>
                  Use finite differences to check selected analytical gradients, choosing a step size and tolerance that account for rounding and approximation error. Repeat the checks when changing a layer, loss or backward implementation. A few matching values support the implementation; they do not prove every case correct.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. From Neurons to Layers",
          content: (
            <>
              <SubSection title="12. From one neuron to a layer">
                <p>{"The calculation still has one derivative for every weight when we write it with arrays. The input x is a column of input values. W has one row per neuron and one column per input, so its entries identify those individual connections. The columns z and a hold the scores and activations, and δ holds the corresponding deltas. The weight-gradient matrix has exactly W's shape, letting the optimizer match each derivative to the weight it should update."}</p>
                <ShapesTable />
                <p>
                  Read δ xᵀ back against section 5. A column of deltas times a row of inputs is an outer product, and its entry in row j and column i is δⱼ xᵢ, which is the scalar rule for the weight from input i into neuron j. Read Wᵀ δ back against section 6. Input i&rsquo;s entry is Σⱼ w[j, i] δⱼ, the sum over every neuron of that neuron&rsquo;s delta times the weight on the edge, which is section 6&rsquo;s rule with the routes summed because in general an input feeds every neuron.
                </p>
                <p>
                  The stack then walks its layers from the top down, handing each one the block the layer above passed down.
                </p>
                <KeepInMind>

                  Vectorized backpropagation is not a different method. It
                  performs the same local calculations for many neurons at
                  once, and the matrix lines are the hand calculation written
                  compactly.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Layers without trainable parameters">
                <p>
                  With the mechanism settled, one question about the layer
                  interface is worth settling too. Every layer must return a
                  gradient with respect to its inputs, because the backward
                  walk has to continue through it. Only layers with trainable
                  parameters have parameter gradients. Dense and
                  convolutional layers return both. Flattening, pooling and
                  dropout return an input gradient and no parameter gradient,
                  and they say so with None rather than a block of
                  zeros.
                </p>
                <p>
                  The two meanings must stay distinct. None means this layer has no trainable parameters. A zero tensor would mean this layer has parameters and their gradients happen to be zero, which is what h₂ reported in section 8 and is a fact about this row, not about the layer. The rule cuts the other way as well.
                </p>
                <p>
                  A dense layer handed None when asked to step refuses, because it does have parameters and a missing gradient for them is a mistake in whoever built the backward pass. The stack&rsquo;s report of the largest slope anywhere skips the parameterless layers rather than counting them as zero, so a network made of nothing but pooling reports no movement at all, which is the true answer.
                </p>
                <KeepInMind>
                  The interface distinguishes an absent parameter gradient from a present gradient containing zeros. That lets the update code handle layers without parameters separately from trainable layers that happen to receive zero gradients.</KeepInMind>
              </SubSection>

              <SubSection title="14. Formal derivation">
                <>
                  <p>
                    Take one layer. Each row of its weight matrix belongs to one neuron.
                    The matrix multiplication produces the scores, and the activation
                    function acts on each score separately.
                  </p>
                  <Equation>{"scores:  z = Wx + b\noutputs: a = g(z)"}</Equation>
                  <p>
                    Suppose the gradient of the loss with respect to every output is
                    already known. Because this activation acts separately on each
                    score, its backward calculation multiplies each arriving gradient by
                    the corresponding activation derivative.
                  </p>
                </>
                <Equation>{"∂L/∂zⱼ = ∂L/∂aⱼ · g′(zⱼ)   =   δⱼ"}</Equation>
                <p>
                  Score j is the sum over i of w[j, i] x[i], plus b[j], so its
                  derivative with respect to w[j, i] is x[i] and with respect to
                  b[j] is 1, and the chain rule again gives the two lines the
                  layer keeps. Input i appears in every score, so the loss
                  reaches it through every neuron, and the chain rule sums the
                  routes.
                </p>
                <Equation>{"∂L/∂w[j, i] = δⱼ · xᵢ\n∂L/∂bⱼ = δⱼ\n∂L/∂xᵢ = Σⱼ δⱼ · w[j, i]"}</Equation>
                <p>The input gradient from this layer is the output gradient needed by the preceding layer. We can therefore apply the same rule repeatedly, starting from the loss derivative at the final output and continuing to the original input. Input gradients are not needed to update these weights, but they can be useful for sensitivity analysis or for optimizing an input.</p>
                <p>The backward traversal visits each layer once and combines local derivatives using the values saved during the forward pass. For a dense layer, these operations are matrix products and elementwise multiplications. The saved response supplies the inputs and the activation information this implementation needs.</p>
                <KeepInMind>
                  The matrix derivation applies the same dependencies as the single-example calculation: first pass the gradient through the activation, then calculate the weight, bias and input derivatives. Writing them as arrays lets the rule handle a full layer at once.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            trueFalse(
              "A parameter may be moved as soon as its own gradient is known, since the gradients still to come belong to other parameters.",
              false,
              "All gradients in this backward pass must describe the same parameter values and forward evaluation. Updating a weight before it has been used to propagate an earlier-layer gradient would mix old and new parameter states. This SDK avoids that problem by calculating the full backward result first, then creating the updated stack.",
            ),
            several(
              "What can we conclude from this numerical gradient check?",
              [
                              "The chain rule says 12 and the nudge, at an ε of a millionth, says 11.999999998",
                              "The disagreement of 2.3e-9 is the rounding in a difference of two losses near eight, not a disagreement about the slope",
                              "It costs two forward passes per parameter, which is why it is a check rather than a method",
                              "A disagreement that small shows the chain rule’s answer is only approximate",
                            ],
              [0, 1, 2],
              "The numerical estimate and backpropagated derivative closely agree at the tested parameters. Finite differences introduce approximation error from the step size and rounding error from the loss evaluations and subtraction. One successful check supports this derivative calculation; it does not prove every parameter or activation case is correct. Backpropagation calculates all parameter derivatives together, which is much cheaper than separate numerical checks in a large network.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Weight checked: hidden unit h₁ to the output\nAnalytic derivative: 12\nCentral-difference derivative: 11.999999998\nNudge ε: 0.000001\nUnrounded derivative disagreement: about 2.3e-9\nThe two losses being subtracted are near 8.\nEach central difference evaluates L(w + ε) and L(w − ε)."
              },
            ),
            choice(
              "After every parameter has moved by a twentieth of its slope, what happens when the row (1, 2) goes through again?",
              [
                "h₃ scores −1.4 and goes dark beside h₂, the prediction is 0.52, and the loss falls from 8 to 0.1152",
                "The old gradients still apply, since only the weights changed and not the row",
                "The loss falls to exactly zero, because every gradient was applied in full",
                "h₂ comes back to life, because the gradient that arrived at it was negative",
              ],
              0,
              "A new forward pass is needed because the updated parameters can change every later score and activation. On this row, the second hidden neuron remains inactive and the third has become inactive. The new prediction is 0.52 and the new loss is 0.1152. These measurements show that this update helped this example; further updates need new gradients.",
            ),
            choice(
              "Why does a pooling layer answer None when asked for a parameter gradient, rather than a block of zeros?",
              [
                "A block of zeros would cost more to store",
                "None means the layer has no trainable parameters, where zeros would mean it has parameters whose gradients happen to be zero",
                "Pooling reports no input gradient either, so nothing is passed down",
                "A zero block would stop the backward walk at that layer",
              ],
              1,
              "Pooling has no trainable weights or biases, so there is no parameter-gradient array to return. That differs from a dense layer whose existing parameters happen to receive zero gradients on one input. Pooling still passes an input gradient backward. The stack skips parameterless layers when reporting its largest parameter-gradient magnitude.",
            ),
            trueFalse(
              "Writing the walk as δ xᵀ and Wᵀ δ performs the same local calculations as the hand arithmetic, for many neurons at once.",
              true,
              "Vectorized backpropagation is not a different method. The outer product’s entry in row j and column i is δⱼ xᵢ, which is the scalar rule for the weight from input i into neuron j, and Wᵀ δ sums over every neuron because in general an input feeds all of them. The matrix lines are the hand calculation written compactly.",
            ),
        ],
        },
        {
          title: "Practice. Walking the 2-3-1 Network With the Library",
          practice: [
            exercise(
              "Run the row forward and measure the loss",
              ["The workshop followed one weight's effect on an error. This starter gives a complete two-input network with three ReLU hidden neurons and one linear output. Send its one-row input batch through the stack and compare the output with the supplied target.","Print the hidden outputs, prediction, half-squared loss and derivative of that loss with respect to the prediction. Keep the loss value separate from the derivative that will enter the backward pass."],
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, RectifiedLinear, SquaredError

hidden = DenseLayer([
    Neuron([1, 1], bias=0, activation=RectifiedLinear()),
    Neuron([1, -1], bias=0, activation=RectifiedLinear()),
    Neuron([-1, 1], bias=0, activation=RectifiedLinear()),
])
output = DenseLayer([Neuron([1, -1, 2], bias=0, activation=Identity())])
network = LayerStack([hidden, output])

row = np.array([[1.0, 2.0]])
target = np.array([[1.0]])

# Run the row through the network, then print the hidden outputs, the
# prediction, the loss under SquaredError, and the loss's slope at the prediction.`,
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, RectifiedLinear, SquaredError

hidden = DenseLayer([
    Neuron([1, 1], bias=0, activation=RectifiedLinear()),
    Neuron([1, -1], bias=0, activation=RectifiedLinear()),
    Neuron([-1, 1], bias=0, activation=RectifiedLinear()),
])
output = DenseLayer([Neuron([1, -1, 2], bias=0, activation=Identity())])
network = LayerStack([hidden, output])

row = np.array([[1.0, 2.0]])
target = np.array([[1.0]])

response = network.respond_to(row)
measured = SquaredError().measure(response.outputs, target)

print(f"hidden outputs {response[0].outputs[0].round(4).tolist()}")
print(f"prediction {float(response.outputs[0, 0]):.4f}")
print(f"loss {measured.value:.4f}")
print(f"slope of the loss at the prediction {float(measured.gradient[0, 0]):.4f}")`,
              `hidden outputs [3.0, 0.0, 1.0]
prediction 5.0000
loss 8.0000
slope of the loss at the prediction 4.0000`,
              { hints: ["respond_to takes a block with one row per example, so the single row goes in as a one-row array, and the stack answers with a response you can index by layer.", "The first layer’s response holds the hidden outputs, and the stack’s own outputs are the last layer’s answer, one row and one column here.", "SquaredError().measure takes the outputs and the targets as blocks of the same shape and answers an object carrying both the value and the gradient, which is the loss and its slope kept apart as Part 2 insists."], check: numberCheck("What loss does the library report for the untrained row?", 8.0, 0.001, "The loss measures the prediction error, while its derivative describes the local change in that loss when the prediction changes. The backward pass receives that derivative and combines it with local derivatives inside the network."), question: "What do the untrained network’s forward response and loss tell us separately?" },
            ),
            exercise(
              "Walk the blame back down",
              ["Run backward_pass on the same fixed network, input and target. It computes parameter gradients without applying an update. Read the output layer's weight and bias gradients, followed by those of each hidden neuron.","Print all the requested gradients and the largest absolute parameter-gradient value anywhere in the stack. A hidden layer's weight-gradient matrix has one row per neuron and one column per input; preserve that correspondence when reporting each neuron."],
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, RectifiedLinear, SquaredError

hidden = DenseLayer([
    Neuron([1, 1], bias=0, activation=RectifiedLinear()),
    Neuron([1, -1], bias=0, activation=RectifiedLinear()),
    Neuron([-1, 1], bias=0, activation=RectifiedLinear()),
])
output = DenseLayer([Neuron([1, -1, 2], bias=0, activation=Identity())])
network = LayerStack([hidden, output])

row = np.array([[1.0, 2.0]])
target = np.array([[1.0]])

# Run backward_pass with SquaredError, then print the loss, the output layer's
# weight and bias gradients, each hidden neuron's weight and bias gradients,
# and the largest slope anywhere in the network.`,
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, RectifiedLinear, SquaredError

hidden = DenseLayer([
    Neuron([1, 1], bias=0, activation=RectifiedLinear()),
    Neuron([1, -1], bias=0, activation=RectifiedLinear()),
    Neuron([-1, 1], bias=0, activation=RectifiedLinear()),
])
output = DenseLayer([Neuron([1, -1, 2], bias=0, activation=Identity())])
network = LayerStack([hidden, output])

row = np.array([[1.0, 2.0]])
target = np.array([[1.0]])

backward = network.backward_pass(row, target, SquaredError())
output_gradient = backward[1]
hidden_gradient = backward[0]

print(f"loss {backward.loss:.4f}")
print(f"output weight gradients {output_gradient.weights[0].round(4).tolist()}")
print(f"output bias gradient {float(output_gradient.biases[0]):.4f}")
names = ["h1", "h2", "h3"]
for name, weights, bias in zip(names, hidden_gradient.weights, hidden_gradient.biases):
    print(f"{name} weight gradients {weights.round(4).tolist()}, bias gradient {float(bias):.4f}")
print(f"largest slope anywhere {backward.largest_movement:.4f}")`,
              `loss 8.0000
output weight gradients [12.0, 0.0, 4.0]
output bias gradient 4.0000
h1 weight gradients [4.0, 8.0], bias gradient 4.0000
h2 weight gradients [0.0, 0.0], bias gradient 0.0000
h3 weight gradients [8.0, 16.0], bias gradient 8.0000
largest slope anywhere 16.0000`,
              { hints: ["backward_pass takes the inputs, the targets and the loss, runs the row forward itself, and answers one gradient per layer in the order the stack holds them, so the hidden layer is at position 0 and the output layer at position 1.", "Each gradient carries a weights block with a row per neuron and a column per input, and a biases vector with one entry per neuron, which is exactly the shape of the layer’s own weights, as Part 5 says it must be.", "largest_movement on the backward pass is the biggest single slope over every layer that has parameters to learn."], check: numberCheck("What is the largest slope anywhere in the network on this row?", 16.0, 0.001, "A parameter gradient combines the signal arriving at a neuron with the local activation derivative and the input carried by that connection. The largest magnitude here occurs in the third hidden neuron. That is an observed gradient for this input and target, before any learning-rate scaling."), question: "How does the backward pass distribute the loss derivative among the network’s parameters?" },
            ),
            exercise(
              "Step once and run the row again",
              ["Use the calculated backward pass to create a new network with learning rate 0.05. Print its layer parameters, then run the same input through the new network and measure the new loss.","The original stack remains available. Keep the old and updated responses separate so the final measurement describes the updated parameters, including any ReLU hidden neurons whose scores changed sign."],
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, RectifiedLinear, SquaredError

hidden = DenseLayer([
    Neuron([1, 1], bias=0, activation=RectifiedLinear()),
    Neuron([1, -1], bias=0, activation=RectifiedLinear()),
    Neuron([-1, 1], bias=0, activation=RectifiedLinear()),
])
output = DenseLayer([Neuron([1, -1, 2], bias=0, activation=Identity())])
network = LayerStack([hidden, output])

row = np.array([[1.0, 2.0]])
target = np.array([[1.0]])

backward = network.backward_pass(row, target, SquaredError())
# Step the stack by 0.05 and print the output layer's new weights and bias and
# each hidden neuron's new weights and bias. Then run the row through the
# stepped stack and print the hidden outputs, the prediction and the loss.`,
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, RectifiedLinear, SquaredError

hidden = DenseLayer([
    Neuron([1, 1], bias=0, activation=RectifiedLinear()),
    Neuron([1, -1], bias=0, activation=RectifiedLinear()),
    Neuron([-1, 1], bias=0, activation=RectifiedLinear()),
])
output = DenseLayer([Neuron([1, -1, 2], bias=0, activation=Identity())])
network = LayerStack([hidden, output])

row = np.array([[1.0, 2.0]])
target = np.array([[1.0]])

backward = network.backward_pass(row, target, SquaredError())
stepped = network.stepped_by(backward, 0.05)

output_after = stepped[1]
print(f"output weights after {output_after.weight_matrix[0].round(4).tolist()}, bias {float(output_after.bias_vector[0]):.4f}")
names = ["h1", "h2", "h3"]
for name, weights, bias in zip(names, stepped[0].weight_matrix, stepped[0].bias_vector):
    print(f"{name} weights after {weights.round(4).tolist()}, bias {float(bias):.4f}")

again = stepped.respond_to(row)
print(f"hidden outputs after {again[0].outputs[0].round(4).tolist()}")
print(f"prediction after {float(again.outputs[0, 0]):.4f}")
print(f"loss after {SquaredError().measure(again.outputs, target).value:.4f}")`,
              `output weights after [0.4, -1.0, 1.8], bias -0.2000
h1 weights after [0.8, 0.6], bias -0.2000
h2 weights after [1.0, -1.0], bias 0.0000
h3 weights after [-1.4, 0.2], bias -0.4000
hidden outputs after [1.8, 0.0, 0.0]
prediction after 0.5200
loss after 0.1152`,
              { hints: ["stepped_by returns a new stack. Save that return value rather than assuming the original network changed in place.","Read weight_matrix and bias_vector from each layer of the new stack.","Call respond_to on the updated stack before measuring its loss. The old response still describes the unchanged original stack."], check: numberCheck("What is the loss after one step at 0.05?", 0.1152, 0.0001, "The lower measured loss shows that this update helped on this example. The new parameters also change which hidden ReLU outputs are active. Another input or a different step size would need its own check."), question: "Does one parameter update lower the loss on this input?" },
            ),
            exercise(
              "Check one gradient by nudging",
              ["Check the weight connecting the first hidden neuron to the output using two nearby forward evaluations. Increase only that weight by the supplied epsilon for one evaluation and decrease it for the other, keeping all other parameters fixed.","Use the symmetric difference of their losses to estimate the derivative. Print the analytical gradient, numerical estimate and absolute disagreement at the supplied precision. This is a check of one parameter, rather than another training step."],
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, RectifiedLinear, SquaredError

hidden = DenseLayer([
    Neuron([1, 1], bias=0, activation=RectifiedLinear()),
    Neuron([1, -1], bias=0, activation=RectifiedLinear()),
    Neuron([-1, 1], bias=0, activation=RectifiedLinear()),
])
output = DenseLayer([Neuron([1, -1, 2], bias=0, activation=Identity())])
network = LayerStack([hidden, output])

row = np.array([[1.0, 2.0]])
target = np.array([[1.0]])

backward = network.backward_pass(row, target, SquaredError())
epsilon = 1e-6
analytic = float(backward[1].weights[0, 0])
# For a shift of +epsilon and then -epsilon, copy the output layer's
# weight_matrix, add the shift to the entry at [0, 0], rebuild the layer with
# with_parameters, put it in a fresh LayerStack above the hidden layer, and
# measure the loss. Divide the difference of the two losses by 2 * epsilon, then
# print the chain rule's slope, the nudge's slope and their disagreement.`,
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, RectifiedLinear, SquaredError

hidden = DenseLayer([
    Neuron([1, 1], bias=0, activation=RectifiedLinear()),
    Neuron([1, -1], bias=0, activation=RectifiedLinear()),
    Neuron([-1, 1], bias=0, activation=RectifiedLinear()),
])
output = DenseLayer([Neuron([1, -1, 2], bias=0, activation=Identity())])
network = LayerStack([hidden, output])

row = np.array([[1.0, 2.0]])
target = np.array([[1.0]])

backward = network.backward_pass(row, target, SquaredError())
epsilon = 1e-6
analytic = float(backward[1].weights[0, 0])

losses = []
for shift in (epsilon, -epsilon):
    nudged = np.array(output.weight_matrix)
    nudged[0, 0] += shift
    moved = LayerStack([hidden, output.with_parameters(nudged, output.bias_vector)])
    losses.append(SquaredError().measure(moved.respond_to(row).outputs, target).value)
numerical = (losses[0] - losses[1]) / (2 * epsilon)

print(f"chain rule {analytic:.4f}")
print(f"nudge {numerical:.9f}")
print(f"disagreement {abs(numerical - analytic):.1e}")`,
              `chain rule 12.0000
nudge 11.999999998
disagreement 2.3e-09`,
              { hints: ["weight_matrix is read-only, so copy it with np.array before changing an entry. Row 0, column 0 is the output neuron’s weight on h₁.", "with_parameters builds a new layer of the same shape and activations carrying the nudged weights and the old biases, and LayerStack accepts the untouched hidden layer beside it.", "The central difference is the loss at plus ε less the loss at minus ε, over 2ε. Print it to nine places, or the disagreement rounds away to nothing."], check: numberCheck("What slope does the nudge report for the weight from h₁ into the output, to four places?", 12.0, 0.001, "The close agreement supports the derivative calculation at these parameters and epsilon. Numerical differences still include finite-step approximation and floating-point effects. Checking every parameter this way needs additional forward evaluations, whereas one backward pass can obtain them together."), question: "Does a small numerical nudge agree with the backpropagated gradient?" },
            ),
          ],
        },
      ]}
    />
  );
}
