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
    "The loss's slope with respect to every weight in the chain, computed by walking the chain backward once, each layer handing down what the layer below needs and keeping its own correction.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function BackpropagationPage() {
  return (
    <ConceptPage
      title="Backpropagation"
      tagline="Every weight's slope, from one walk back down the chain."
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
          , applied one layer at a time and more carefully than it has been
          so far. The page works one row through one small network by hand,
          and every number in it is on the diagram above.
        </>
      }
      history={
        <>
          <p>
            The logistic regression page fitted one neuron by walking against
            the slope of its loss, and that slope was easy to write down
            because every weight touched the loss directly. Put a layer of
            neurons underneath and that stops being true. A hidden
            weight&rsquo;s effect on the loss passes through the neurons above
            it, so its slope is a product of several pieces, and the question
            of which hidden weight deserves how much of the blame for an error
            at the output had a name in the 1960s, the credit assignment
            problem, and no routine answer. Frank Rosenblatt&rsquo;s
            perceptron of 1958, built at the Cornell Aeronautical Laboratory,
            learned only its final layer. Marvin Minsky and Seymour
            Papert&rsquo;s 1969 book Perceptrons proved what a single learned
            layer could not do, exclusive-or among other things, and with no
            way to train the hidden layer that would repair it, most work on
            networks stopped.
          </p>
          <p>
            The mathematics that repairs it is the chain rule run in reverse,
            and it was found more than once by people with different
            problems. Henry Kelley in 1960 and Arthur Bryson in 1961 used it in
            optimal control, adjusting a rocket&rsquo;s flight path one stage
            at a time. Seppo Linnainmaa&rsquo;s 1970 master&rsquo;s thesis at
            the University of Helsinki wrote the general form down as a way of
            tracking how rounding error accumulates through a long
            computation, which is reverse-mode automatic differentiation under
            its modern name. Paul Werbos argued in his 1974 Harvard thesis
            that the same reverse walk would train a multilayer network, and
            David Rumelhart, Geoffrey Hinton and Ronald Williams showed in
            &ldquo;Learning representations by back-propagating errors&rdquo;,
            in Nature in 1986, that hidden units trained this way learned
            useful internal representations of their inputs. Their paper gave
            the method its name and its audience, and every deep network
            since has been trained by some descendant of the four lines on
            this page, which I work by hand on a 2-3-1 network small enough
            that every number fits on the diagram above.
          </p>
        </>
      }
      playground={<BackpropagationPlayground />}
      sections={[
        {
          title: "Part 1. What Training Needs",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. What the forward pass left behind">
                <p>
                  Backpropagation reverses something, so start with the thing
                  it reverses. One row, (1, 2), goes into the 2-3-1 network.
                  Each hidden neuron forms a score from the row, the rectifier
                  bends each score into an activation, the output neuron forms
                  a score from the three activations, its bend is the identity
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
                  travels through its own neuron&rsquo;s score and bend, then
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
          ),
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
                  <p>
                    The prediction is 5 and the target is 1, so the loss is
                    ½ × 16 = 8 and its slope is 5 − 1 = 4. The 4 is the first
                    thing that arrives anywhere. It arrives at the output
                    neuron, and it says that raising the prediction by a small
                    amount raises the loss by four times that amount. Call it
                    the arriving gradient, now that it is clear what is
                    arriving and where.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The backward pass begins with the loss telling the output how
                  a change in the prediction would change the loss. What
                  travels is the slope, not the loss.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Backward through the output neuron">
                <p>
                  The output neuron is the simplest place to learn every
                  operation, because its bend is the identity. Its score is z
                  and its activation is a = g(z), and for the identity g′(z)
                  is 1 everywhere. Define the delta as the arriving gradient
                  after it has passed through the activation.
                </p>
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
                  <p>
                    The delta is 4 × 1 = 4. The weight from h₁ read 3, so its
                    gradient is 4 × 3 = 12. The other two read 0 and 1, so the
                    block of weight gradients is 4 × (3, 0, 1) = (12, 0, 4).
                    The bias is a weight on an input that is always 1, so its
                    gradient is 4 × 1 = 4.
                  </p>
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
                  <p>
                    4 × (1, −1, 2) = (4, −4, 8). Those three numbers leave the
                    output layer and arrive at h₁, h₂ and h₃ as their own
                    arriving gradients.
                  </p>
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
                  The hidden neurons have a bend that is not the identity, and
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
                  bend above to a sigmoid or a tangent and every neuron
                  receives something, and none receives all of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Calculating the hidden gradients">
                <p>
                  With a delta in hand, each hidden neuron does exactly what
                  the output neuron did. h₁&rsquo;s delta is 4 and it read the
                  row (1, 2), so its weight gradients are 4 × (1, 2) = (4, 8)
                  and its bias gradient is 4.
                </p>
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
                    Every parameter moves by a twentieth of its slope. The
                    output weights become (0.4, −1, 1.8) with a bias of −0.2,
                    h₁ becomes (0.8, 0.6) with a bias of −0.2, h₂ does not
                    move, and h₃ becomes (−1.4, 0.2) with a bias of −0.4. Then
                    the row goes through again, because it must. The weights
                    changed, so the scores and activations changed, and the
                    old intermediate values and the old gradients describe a
                    network that no longer exists. On the second pass h₃
                    scores −1.4 and goes dark beside h₂, the prediction is
                    0.52, and the loss falls from 8 to 0.1152.
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
                  Read δ xᵀ back against section 5. A column of deltas times a
                  row of inputs is an outer product, and its entry in row j
                  and column i is δⱼ xᵢ, which is the scalar rule for the
                  weight from input i into neuron j. Read Wᵀ δ back against
                  section 6. Input i&rsquo;s entry is Σⱼ w[j, i] δⱼ, the sum
                  over every neuron of that neuron&rsquo;s delta times the
                  weight on the edge, which is section 6&rsquo;s rule with the
                  routes summed because in general an input feeds every
                  neuron. The stack then walks its layers from the top down,
                  handing each one the block the layer above passed down.
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
                  The two meanings must stay distinct. None means this layer
                  has no trainable parameters. A zero tensor would mean this
                  layer has parameters and their gradients happen to be zero,
                  which is what h₂ reported in section 8 and is a fact about
                  this row, not about the layer. The rule cuts the other way as
                  well. A dense layer handed None when asked to step refuses,
                  because it does have parameters and a missing gradient for
                  them is a mistake in whoever built the backward pass. The
                  stack&rsquo;s report of the largest slope anywhere skips the
                  parameterless layers rather than counting them as zero, so a
                  network made of nothing but pooling reports no movement at
                  all, which is the true answer.
                </p>
                <KeepInMind>
                  This is a decision about types and interfaces rather than
                  about the derivation. Absence is declared where it is real
                  and rejected where it is not.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Formal derivation">
                <p>
                  Take one layer. Its outputs are a = g(z), where g is the bend
                  applied to each score on its own, and its scores are z = Wx +
                  b, one row of W per neuron. Suppose the slope of the loss with
                  respect to every output is already known, and call it the
                  arriving block. Because g acts on each score alone, the chain
                  rule through the bend is a plain product, one per neuron.
                </p>
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
                  That last line is the induction. The slope of the loss with
                  respect to this layer&rsquo;s inputs is, by definition, the
                  slope of the loss with respect to the outputs of the layer
                  beneath, which is exactly the arriving block that layer needs
                  to run the same three lines. The base case is the loss itself,
                  whose slope at the final output section 4 worked out, and
                  the walk ends at the row, whose slope nobody needs but which
                  costs nothing to report. Every layer is visited once, every
                  slope is computed once, and the arithmetic is a handful of
                  matrix products against blocks the forward pass already
                  built, which is why the forward responses keep their scores
                  rather than only their outputs.
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
      ]}
    />
  );
}
