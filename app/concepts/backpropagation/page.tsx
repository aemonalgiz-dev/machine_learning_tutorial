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
  title: "Backpropagation · oop_ml",
  description:
    "A network can contain many weights between an input and its prediction. Backpropagation works backwards through those calculations to find how each weight contributed to a change in the loss.",
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
      playgroundIntro="Follow the prediction forward and the gradients backward. Compare a gradient with the loss change produced by a small numerical nudge to that weight."
      title="Backpropagation"
      tagline={"A network can contain many weights between an input and its prediction. Backpropagation works backwards through those calculations to find how each weight contributed to a change in the loss."}
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
                  Backpropagation reverses something, so start with the thing
                  it reverses. One row, (1, 2), goes into the 2-3-1 network.
                  Each hidden neuron forms a score from the row, the rectifier
                  applies ReLU to each score, the output neuron forms
                  a score from the three activations, its activation function is the identity
                  so that score is the prediction, and the prediction is
                  measured against the target of 1 by half the squared miss.
                </p>
                <ForwardTrace />
                <p>
                  Six kinds of intermediate value, and every one of them is
                  kept. That is not tidiness. The backward pass is about to ask
                  for each of them by name, and a forward pass that discarded
                  its scores would have to be run again to recover them.
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
                <p>
                  On the logistic regression page that question had a short
                  answer, because a single neuron&rsquo;s weight sat one step
                  from the loss. A hidden weight here does not. Its effect
                  travels through its own neuron&rsquo;s score and activation function, then
                  through the output neuron&rsquo;s score, then through the
                  prediction, and only then into the loss. The widget draws
                  that route for whichever hidden weight you choose, with the
                  values the forward pass kept at every stop, and calculates
                  nothing.
                </p>
                <DependencyPath />
                <KeepInMind>
                  Backpropagation exists to calculate how much each parameter
                  contributed to the final loss. The mechanism comes next; the
                  goal is only that.
                </KeepInMind>
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
                  A distant weight&rsquo;s effect can be found by multiplying
                  the local effects along the path from the weight to the
                  loss. Every layer only ever has to know its own local
                  effects.
                </KeepInMind>
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
                <WorkedExample title="At the worked row">
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
                  input that travelled across that edge.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Passing the gradient to the hidden layer">
                <p>
                  The output neuron can now update its own weights. The hidden
                  layer still knows nothing, because nobody has told it how
                  its outputs affected the loss. So ask one concrete question.
                  How did changing h₁ affect the output score? By w₁ per unit,
                  since h₁ appears in the score once, multiplied by w₁. The
                  loss&rsquo;s sensitivity to h₁ is therefore the output delta
                  times w₁, and the same for the other two.
                </p>
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
                <p>
                  The middle row is the one to look at. h₂ scored −1, the
                  rectifier turned that into 0 going forward, and going
                  backward its slope at −1 is 0, so an arriving −4 becomes a
                  delta of 0. This neuron receives no update from this row.
                  Nothing it does reaches the loss on this row, so nothing on
                  this row can tell it what to do. Whether a neuron can get
                  stuck that way for good belongs to the activation and
                  regularisation material, not here.
                </p>
                <KeepInMind>
                  The activation derivative controls whether and how strongly
                  the arriving gradient passes through the neuron. Switch the
                  activation function above to a sigmoid or a tangent and every neuron
                  receives something, and none receives all of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Calculating the hidden gradients">
                <>
                  <p>
                    Once its delta is known, a hidden neuron follows the same rule as
                    the output neuron. The first hidden neuron has delta 4 and received
                    inputs 1 and 2.
                  </p>
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
                  Four lines per layer, applied top to bottom, and the third
                  and fourth are different things. Keep the gradient; pass the
                  sensitivity.
                </KeepInMind>
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
              "A small change in a weight moves the score by ∂z/∂w times as much, that change moves the activation by ∂a/∂z times as much, and that change moves the loss by ∂L/∂a times as much. Three magnifications in a row multiply, which is the calculus primer’s chain rule and nothing more. It is what lets a hidden weight, whose effect travels through its own neuron, then the output neuron, then the prediction, still be handled one local step at a time.",
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
              "The rectifier’s slope at −1 is 0, so the arriving gradient is multiplied by nothing. Nothing this neuron does reaches the loss on this row, so nothing on this row can tell it what to do. Switch the activation to a sigmoid or a tangent and every neuron receives something, and none receives all of it.",
            ),
            several(
              "Which of these are jobs a layer does during the backward pass?",
              [
                "Calculate the gradients of its own parameters",
                "Report how sensitive the loss is to each of its inputs",
                "Re-run its forward calculation to recover the scores it needs",
                "Consult which activation function the layer above used",
              ],
              [0, 1],
              "Those two jobs are the whole of the reusable layer interface, and the second is what lets the layer beneath do both in turn. The scores were kept by the forward pass, and once a layer has its arriving gradient every dense layer performs the same four lines whatever sits above or below it.",
            ),
        ],
        },
        {
          title: "Part 4. Update and Check",
          content: (
            <>
              <SubSection title="10. Updating the parameters">
                <p>
                  Calculating gradients and applying them are two phases, and
                  they must not overlap. In the first, backpropagation computes
                  and stores every gradient while no parameter moves. Moving
                  one early would change the scores and activations the
                  remaining gradients are still being computed from. In the
                  second, every parameter takes one step against its own
                  gradient, scaled by the learning rate.
                </p>
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
                <p>
                  That is why the nudge is useful, and why it is a check
                  rather than a method. It costs two forward passes per
                  parameter, so it is the right tool for confirming that an
                  implementation of the four lines is correct and the wrong
                  tool for training anything, where one backward walk finds
                  every slope at once for about the price of a second forward
                  pass.
                </p>
                <KeepInMind>
                  Finite differences validate an implementation. They are too
                  expensive to train with, and once the analytic gradient is
                  trusted they have done their job.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. From Neurons to Layers",
          content: (
            <>
              <SubSection title="12. From one neuron to a layer">
                <p>
                  Every calculation so far was on scalars, one neuron and one
                  weight at a time. A layer does the same thing for several
                  neurons at once, and the scalars become vectors and
                  matrices. The input x is a column of the layer&rsquo;s
                  inputs, W has a row per neuron and a column per input, z and
                  a are columns with one entry per neuron, δ is a column of
                  the same length, and the weight gradient has exactly
                  W&rsquo;s shape, because there is one slope per weight.
                </p>
                <ShapesTable />
                <p>
                  Read δ xᵀ back against section 5. A column of deltas times a row of inputs is an outer product, and its entry in row j and column i is δⱼ xᵢ, which is the scalar rule for the weight from input i into neuron j. Read Wᵀ δ back against section 6. Input i&rsquo;s entry is Σⱼ w[j, i] δⱼ, the sum over every neuron of that neuron&rsquo;s delta times the weight on the edge, which is section 6&rsquo;s rule with the routes summed because in general an input feeds every neuron.
                </p>
                <p>
                  The stack then walks its layers from the top down, handing each one the block the layer above passed down.
                </p>
                <KeepInMind>
                  Vectorised backpropagation is not a different method. It
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
                  This is a decision about types and interfaces rather than
                  about the derivation. Absence is declared where it is real
                  and rejected where it is not.
                </KeepInMind>
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
                <p>
                  That last line is the induction. The slope of the loss with respect to this layer&rsquo;s inputs is, by definition, the slope of the loss with respect to the outputs of the layer beneath, which is exactly the arriving block that layer needs to run the same three lines. The base case is the loss itself, whose slope at the final output section 4 worked out, and the walk ends at the row, whose slope nobody needs but which costs nothing to report.
                </p>
                <p>
                  Every layer is visited once, every slope is computed once, and the arithmetic is a handful of matrix products against blocks the forward pass already built, which is why the forward responses keep their scores rather than only their outputs.
                </p>
                <KeepInMind>
                  This is the compact form of reasoning the page has already
                  followed by hand. Nothing in it is new; it is the same walk
                  with the row and the network left unspecified.
                </KeepInMind>
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
              "Calculating and applying are two phases and they must not overlap. Moving one parameter early would change the scores and activations that the remaining gradients are still being computed from, so every gradient is stored first and every parameter steps afterwards.",
            ),
            several(
              "Which of these hold of the finite-difference check on the weight from h₁ into the output?",
              [
                "The chain rule says 12 and the nudge, at an ε of a millionth, says 11.999999998",
                "The disagreement of 2.3e-9 is the rounding in a difference of two losses near eight, not a disagreement about the slope",
                "It costs two forward passes per parameter, which is why it is a check rather than a method",
                "A disagreement that small shows the chain rule’s answer is only approximate",
              ],
              [0, 1, 2],
              "Both figures are answers to the same question and they agree, and the same check on h₁’s weight from x₂ gives 8 against 8.000000001. A finite difference subtracts two nearby losses, and the digits lost in that subtraction are what the gap is made of. One backward walk finds every slope at once for about the price of a second forward pass, so once the analytic gradient is trusted the nudge has done its job.",
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
              "The weights changed, so the scores and activations changed, and the old intermediate values and the old gradients describe a network that no longer exists, which is why the row has to go through again. h₂ did not move at all, since its delta was 0, and h₃ moved to (−1.4, 0.2) with a bias of −0.4 and now scores −1.4, so two of the three hidden neurons are dark on the second pass. One step at η = 0.05 takes the loss from 8 to 0.1152 and no further.",
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
              "Zero gradients are exactly what h₂ reported, and that was a fact about one row and not about the layer. The rule cuts both ways, since a dense layer handed None refuses, and the stack’s report of the largest slope anywhere skips the parameterless layers, so a network made of nothing but pooling reports no movement at all.",
            ),
            trueFalse(
              "Writing the walk as δ xᵀ and Wᵀ δ performs the same local calculations as the hand arithmetic, for many neurons at once.",
              true,
              "Vectorised backpropagation is not a different method. The outer product’s entry in row j and column i is δⱼ xᵢ, which is the scalar rule for the weight from input i into neuron j, and Wᵀ δ sums over every neuron because in general an input feeds all of them. The matrix lines are the hand calculation written compactly.",
            ),
        ],
        },
        {
          title: "Practice. Walking the 2-3-1 Network With the Library",
          practice: [
            exercise(
              "Run the row forward and measure the loss",
              ["Build the 2-3-1 network of Part 1 with the library, three rectified hidden neurons with weights (1, 1), (1, −1) and (−1, 1) and one linear output neuron with weights (1, −1, 2), every bias zero. Send the row (1, 2) through it and score the answer against the target of 1 by half the squared miss.", "Part 1 traced the hidden outputs to (3, 0, 1), and Part 2 arrived at a prediction of 5, a loss of 8 and a slope of 4 at the prediction. Read all of those off the library and confirm them."],
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
              { hints: ["respond_to takes a block with one row per example, so the single row goes in as a one-row array, and the stack answers with a response you can index by layer.", "The first layer’s response holds the hidden outputs, and the stack’s own outputs are the last layer’s answer, one row and one column here.", "SquaredError().measure takes the outputs and the targets as blocks of the same shape and answers an object carrying both the value and the gradient, which is the loss and its slope kept apart as Part 2 insists."], check: numberCheck("What loss does the library report for the untrained row?", 8.0, 0.001, "The prediction is 5 and the target is 1, so the miss is 4 and half its square is 8. The slope printed beside it is 4, the miss itself, and that slope rather than the loss is what travels back into the output neuron.") },
            ),
            exercise(
              "Walk the blame back down",
              ["Ask the stack for one backward pass on the same row and read off every gradient Parts 2 and 3 worked by hand, the output neuron’s (12, 0, 4) with a bias gradient of 4, and the three hidden neurons’ weight and bias gradients.", "Part 3 only worked h₁’s gradients in full. Print h₃’s as well, and the largest slope anywhere in the network, a number the lesson never quotes."],
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
              { hints: ["backward_pass takes the inputs, the targets and the loss, runs the row forward itself, and answers one gradient per layer in the order the stack holds them, so the hidden layer is at position 0 and the output layer at position 1.", "Each gradient carries a weights block with a row per neuron and a column per input, and a biases vector with one entry per neuron, which is exactly the shape of the layer’s own weights, as Part 5 says it must be.", "largest_movement on the backward pass is the biggest single slope over every layer that has parameters to learn."], check: numberCheck("What is the largest slope anywhere in the network on this row?", 16.0, 0.001, "h₃ has a delta of 8, since 8 arrives at it and the rectifier’s slope at its score of 1 is 1, and its weight from x₂ multiplied an input of 2, so that one gradient is 16. It outranks the output neuron’s 12 because the second input is the largest number in the row.") },
            ),
            exercise(
              "Step once and run the row again",
              ["Take one step at the learning rate of 0.05 from the backward pass, read the new weights off the stepped stack, and send the row through again.", "Part 4 says the output weights become (0.4, −1, 1.8) with a bias of −0.2, that h₃ goes dark beside h₂ on the second pass, and that the loss falls from 8 to 0.1152. Confirm each of those from the library."],
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
              { hints: ["stepped_by takes the backward pass and the learning rate and answers a new stack, leaving the old one untouched, which is Part 4’s rule that calculating and applying are two phases, kept by construction.", "A dense layer exposes weight_matrix, a row per neuron, and bias_vector, one entry per neuron. Index the stepped stack by position to reach each layer.", "The old response describes a network that no longer exists, so call respond_to on the stepped stack rather than reusing anything from the first pass."], check: numberCheck("What is the loss after one step at 0.05?", 0.1152, 0.0001, "The prediction on the second pass is 0.52, so the miss is 0.48 and half its square is 0.1152. One step took the loss from 8 to 0.1152, and two of the three hidden neurons now score below zero, so only h₁, at 1.8, reaches the output on this pass.") },
            ),
            exercise(
              "Check one gradient by nudging",
              ["Check the chain rule’s 12 for the weight from h₁ into the output without the chain rule. Nudge that one weight up by a millionth and measure the loss, nudge it down by a millionth and measure again, and divide the difference by the width of the nudge.", "Part 4 reports 11.999999998 against 12, a disagreement of 2.3e-9. Print the chain rule’s slope, the nudge’s slope to nine places, and the disagreement between them."],
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
              { hints: ["weight_matrix is read-only, so copy it with np.array before changing an entry. Row 0, column 0 is the output neuron’s weight on h₁.", "with_parameters builds a new layer of the same shape and activations carrying the nudged weights and the old biases, and LayerStack accepts the untouched hidden layer beside it.", "The central difference is the loss at plus ε less the loss at minus ε, over 2ε. Print it to nine places, or the disagreement rounds away to nothing."], check: numberCheck("What slope does the nudge report for the weight from h₁ into the output, to four places?", 12.0, 0.001, "The nudge says 11.999999998 and the chain rule says 12, and the 2.3e-9 between them is the rounding in a difference of two losses near eight. It cost two forward passes for this one weight, where the backward pass of the previous problem found all thirteen slopes at once, which is why the nudge is a check and not a method.") },
            ),
          ],
        },
      ]}
    />
  );
}
