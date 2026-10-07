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
import { ActivationSlopeChart } from "@/components/widgets/ActivationSlopeChart";
import { BendGallery } from "@/components/widgets/BendGallery";
import { ChainCollapse } from "@/components/widgets/ChainCollapse";
import { DeadUnitCensus } from "@/components/widgets/DeadUnitCensus";
import { LogisticTwinChart } from "@/components/widgets/LogisticTwinChart";
import { NeuronPlayground } from "@/components/widgets/NeuronPlayground";

export const metadata: Metadata = {
  title: "A Neuron · oop_ml",
  description:
    "Build one artificial neuron from inputs, weights, a bias, and an activation function.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function NeuronsAndActivationsPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["neurons-and-activations"]}
      technicalStart="Part 3. The Four Activation Functions"
      openingTitle="What Is Inside an Artificial Neuron?"
      playgroundIntro="Change one weight, the bias, or the activation at a time. Compare the weighted score with the final output so you can see which operation changed it."
      title="A Neuron"
      tagline="Build one artificial neuron from inputs, weights, a bias, and an activation function."
      prerequisites={
        <>
          The first example needs multiplication and addition. The connection to{" "}
          <Link href="/concepts/logistic-regression" className={link}>
            logistic regression
          </Link>{" "}
          comes later. The measurements use the standard units explained in the{" "}
          <Link href="/concepts/feature-scaling" className={link}>
            feature scaling
          </Link>{" "}
          page. For the sections about gradients, refer to the{" "}
          <Link href="/primers/calculus" className={link}>
            calculus primer
          </Link>{" "}
          for derivatives, which measure how an output changes as its input changes.
        </>
      }

      playground={<NeuronPlayground />}
      sections={[
        {
          title: "Part 1. One Person Through One Neuron",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Two measurements in standard units">
                <>
<p>
                  A neuron here reads two numbers about a person, their height and their weight, and it reads them after the feature scaling page&rsquo;s standardisation, so that each is the number of standard deviations above the crowd&rsquo;s mean. Done that way the two inputs share a scale, the two weights the neuron puts on them can be compared, and the whole crowd fits in a window three deviations each way, which is the square the box above draws.
                </p>
                <p>
                  The crowd&rsquo;s mean height is 151.48 centimetres with a deviation of 15.61, and its mean weight 51.48 kilograms with a deviation of 14.45.
                </p>
</>
                <Equation>
                  {
                    "x₁ = (height − 151.48) / 15.61\nx₂ = (weight − 51.48) / 14.45"
                  }
                </Equation>
                <WorkedExample title="Two people the page keeps coming back to">
                  <>
<p>
                    The first person in the crowd is a child of 147 centimetres and 41 kilograms, who standardises to (−0.287, −0.725), a little short and rather light. The page&rsquo;s worked person is one deviation above the mean in both measurements, at (1, 1), which is 167.1 centimetres and 65.9 kilograms, and the page calls them the tall heavy person.
                  </p>
                  <p>
                    A second worked person at (−1, 1) is a deviation short and a deviation heavy, and the page calls them the short heavy person. Both are cells of the lattice the box draws, so every number they produce can be read off it.
                  </p>
</>
                </WorkedExample>
                <KeepInMind>
                  The neuron never sees centimetres or kilograms. It sees
                  two standardised numbers, and everything it learns is
                  written in those units, so a weight of 2 on height means
                  two units of score per standard deviation of height rather
                  than per centimetre.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The weighted sum and the bias">
                <p>
                  The neuron multiplies each input by its own weight, adds
                  the two products, and adds a third number, the bias, which
                  shifts the total without reference to either input. The
                  result is called the score, and the three numbers the
                  neuron holds, two weights and a bias, are everything it
                  will ever learn. One wording trap is worth naming once.
                  The neuron&rsquo;s weights are the multipliers it holds,
                  and a person&rsquo;s weight is the second input, and the
                  page keeps the two apart by calling the inputs x₁ and x₂.
                </p>
                <Equation>{"z = w₁·x₁ + w₂·x₂ + b"}</Equation>
                <WorkedExample title="The worked neuron on the tall heavy person">
                  <>
                    <p>
                      The worked neuron has weights two and minus one, with bias one
                      half. For the person at (1, 1), multiply each input by its own
                      weight and add the bias.
                    </p>
                  </>
                  <Equation>{"z = 2·1 + (−1)·1 + 0.5 = 1.5"}</Equation>
                  <>
                    <p>
                      For the person at (−1, 1), only the first input changes.
                    </p>
                    <Equation>{"score = 2 × (−1) + (−1) × 1 + 0.5 = −2.5"}</Equation>
                    <p>
                      Choosing a different activation leaves these scores unchanged. The
                      activation is applied after the weighted sum and bias.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  The score is a weighted sum plus a constant, which is the
                  regression pages&rsquo; linear model with the coefficients
                  renamed. Nothing about it is new, and its three numbers
                  are the entire learnable content of a neuron.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The score across the whole plane">
                <p>
                  The score is a weighted sum, so over the plane of the two
                  inputs it is a tilted plane, rising in one direction and
                  falling in the opposite one. In the box above the shaded
                  square is that plane seen from above, indigo where the
                  score is positive and amber where it is negative, darker
                  the further from zero. Drag a weight slider and the tilt
                  changes. Drag the bias and the whole plane rises or falls
                  without tilting.
                </p>
                <InAModel title="The worked neuron at the four corners">
                  <p>
                    With weights 2 and −1 and a bias of 0.5, the corner
                    three deviations short and three light scores −2.5, the
                    corner three tall and three heavy scores 3.5, the corner
                    three tall and three light scores 9.5, and the corner
                    three short and three heavy scores −8.5. Height counts
                    twice as much as weight and in the opposite direction,
                    so the extreme scores belong to the tall-light and
                    short-heavy corners rather than the diagonal ones.
                  </p>
                </InAModel>
                <KeepInMind>
                  Along any line of constant score the shading does not
                  change at all. The score varies only as you move across
                  those lines, so one neuron knows exactly one direction in
                  the plane, and how far a person lies along it.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Where the score is zero">
                <p>
                  Among all those lines of constant score one matters most,
                  the one along which the score is exactly zero, drawn
                  dashed in the box. Every activation function on the page&rsquo;s list
                  crosses its own middle there, the sigmoid at one half, the
                  tangent at zero, the rectifier at the point where it
                  starts to rise. Set the score to zero and solve for the
                  second input.
                </p>
                <Equation>
                  {"2·x₁ − x₂ + 0.5 = 0\nx₂ = 2·x₁ + 0.5"}
                </Equation>
                <p>
                  On the window the box draws, that line enters at (−1.75,
                  −3) and leaves at (1.25, 3). Double the bias to 1 and it
                  enters at (−2, −3) and leaves at (1, 3), the same slope
                  shifted half a unit left. Set both weights to 1 and the
                  bias to 0 and it runs corner to corner. Set both weights
                  to 0 and there is no line at all, because the score is
                  then the bias everywhere, 0.5 at every cell of the
                  lattice, and the box draws nothing dashed.
                </p>
                <KeepInMind>
                  A weight turns the zero line and a bias slides it. Where
                  it lies, and which side a person falls on, is the whole of
                  what one neuron can say about the plane, and section 21
                  measures what that costs on the crowd.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The activation function, and the two numbers a neuron answers with">
                <p>
                  After the score comes one activation function, a function of a single
                  number written f, and the neuron&rsquo;s output is the activation function
                  applied to the score. The activation function is chosen from a short list
                  and is not learned. Press the four buttons in the box with
                  the tall heavy person selected and the score stays at 1.5
                  every time while the output changes.
                </p>
                <Equation>
                  {
                    "output = f(z)\n\nidentity   f(1.5) = 1.5\nReLU       f(1.5) = max(0, 1.5) = 1.5\nsigmoid    f(1.5) = 1 / (1 + e^(−1.5)) = 0.8176\ntanh       f(1.5) = tanh(1.5) = 0.9051"
                  }
                </Equation>
                <>
                  <p>
                    Conceptually, the neuron produces one output for the next layer.
                    This SDK also returns the intermediate score so that a backward pass
                    can evaluate the activation derivative at the same score. That saved
                    value is part of the implementation, not a second signal sent to the
                    next neuron.
                  </p>
                  <p>
                    Weights are kept in input order. In a hidden layer, those inputs are
                    outputs from earlier neurons, so they need not correspond directly
                    to named measurements such as height and weight.
                  </p>
                </>
                <KeepInMind>
                  The score comes first and the activation function second, and the neuron
                  keeps both numbers because the backward pass will ask for
                  the score. The activation function is a choice made when the neuron is
                  built, and the rest of this page is about what that choice
                  does.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Why Nonlinear Activations Matter",
          content: (
            <>
              <SubSection title="6. Two affine transformations reduce to one">
                <p>
                  The reason for the activation function is what happens without one. Hand
                  the worked neuron&rsquo;s output to a second neuron that
                  has one weight and one bias and no nonlinear activation, and the second
                  neuron computes a weighted sum of a weighted sum. Multiply
                  it out and it is a single weighted sum with different
                  numbers in it. The widget below builds exactly that chain
                  and then asks the multiple-regression page&rsquo;s plane
                  fit whether the surface that comes out is a plane.
                </p>
                <Equation>
                  {
                    "second reads   1.5 · (2·x₁ − x₂ + 0.5) − 0.25\n            =  3·x₁ − 1.5·x₂ + 0.5"
                  }
                </Equation>
                <ChainCollapse />
                <InAModel title="With the identity between them">
                  <p>
                    The plane fit through the chain&rsquo;s surface comes
                    back with weights 3.00 and −1.50 and an intercept of
                    0.50, an R² of exactly 1.0 and a largest residual of
                    exactly 0.0, which are the collapsed neuron&rsquo;s
                    numbers to the last bit. The tall heavy person scores
                    1.5 in the first neuron, and 2.0 comes out of the chain
                    and out of the collapsed neuron alike.
                  </p>
                </InAModel>
                <KeepInMind>
                  <p>
                    A chain using only identity activations still performs one affine
                    transformation, however many neurons it contains. Its parameters can
                    be combined into one set of weights and one bias. The extra stages
                    have not expanded what it can represent.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="7. A nonlinear activation changes what the chain can represent">
                <p>
                  Now press the sigmoid button in the widget. The first
                  neuron&rsquo;s score is still 1.5, its output is now
                  0.8176, and the second neuron reads that instead, so the
                  chain answers 0.9764 for the tall heavy person where the
                  collapsed neuron still says 2.0. Over the whole window the
                  surface is no longer flat, and the plane fit says so.
                </p>
                <NumberTable
                  headings={["activation function between", "plane fit R²", "largest residual", "chain output at the tall heavy person"]}
                  rows={[
                    ["identity", "1.0000", "0.0000", "2.0000"],
                    ["ReLU", "0.8067", "4.4978", "2.0000"],
                    ["sigmoid", "0.8852", "0.5650", "0.9764"],
                    ["tanh", "0.8117", "1.2629", "1.1077"],
                  ]}
                  caption="The least-squares plane through the chain’s surface under each activation function, with the second neuron at a weight of 1.5 and a bias of −0.25. The rectifier’s chain still answers 2.0 at the tall heavy person because 1.5 is on its live side; the residual comes from the half of the window it flattened."
                />
                <WhyThisWorks title="Why a chain without a nonlinear activation collapses">
                  <>
                    <p>
                      Write the first affine transformation with weights W₁ and bias b₁,
                      and the second with W₂ and b₂. Expand the brackets to see that the
                      composition has one combined weight matrix and one combined bias.
                    </p>
                    <Equation>{"W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂)\ncombined weights = W₂W₁\ncombined bias = W₂b₁ + b₂"}</Equation>
                    <p>
                      Inserting a nonlinear activation changes the calculation.
                    </p>
                    <Equation>{"output = W₂f(W₁x + b₁) + b₂"}</Equation>
                    <p>
                      In general, this cannot be reduced to one affine transformation
                      because the nonlinear function cannot be distributed through the
                      matrix multiplication. Particular parameters or restricted input
                      regions can still produce an affine result. The nonlinear
                      activation makes additional representations possible; it does not
                      guarantee that every fitted network uses them.
                    </p>
                  </>
                </WhyThisWorks>
                <KeepInMind>
                  <p>
                    A nonlinear activation can make a chain express functions that a
                    single affine transformation cannot. ReLU, sigmoid and hyperbolic
                    tangent provide nonlinear responses; identity does not. Part 4
                    compares their derivatives to explain how the choice also affects
                    learning.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Applying an activation to one score">
                <>
<p>
                  Each of the four activation functions reads one number and answers one number, so applied to a whole row of neurons it treats every neuron&rsquo;s score on its own, and the answer of one neuron depends on nothing another neuron did. That is why the diagram at the top of the box is complete with the activation function drawn inside the neuron rather than beside the layer, and why a neuron can carry its own activation function.
                </p>
                <p>
                  It is also why the score has to travel with the output, since a backward pass needs the activation function&rsquo;s slope at that neuron&rsquo;s own score and nowhere else.
                </p>
</>
                <KeepInMind>
                  Each activation object in this library provides the function
                  and its derivative. The function produces the output; the
                  derivative is used when calculating gradients. The four
                  functions here act on one score at a time. Section 22 compares
                  them with softmax, which depends on several scores together.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "The tall heavy person scores 1.5 through the worked neuron. What do the four activation buttons change?",
              [
                "The output only, since the activation is applied after the weighted sum and the bias",
                "Both the score and the output, since the activation is part of the sum",
                "The score only, which the next neuron reads",
                "Neither, since the neuron reports the score whatever is chosen",
              ],
              0,
              "The score is the weighted sum plus the bias, and the activation comes after it. Pressing the buttons leaves the score at 1.5 while the output moves, from 1.5 under the identity and the rectifier to 0.8176 under the sigmoid and 0.9051 under the tangent.",
            ),
            trueFalse(
              "Along any line of constant score the shading does not change, so one neuron knows exactly one direction in the plane and how far a person lies along it.",
              true,
              "The score varies only as you move across those lines. A weight turns the line of zero score and a bias slides it, and where that line lies, with which side a person falls on, is the whole of what one neuron can say about the plane.",
            ),
            choice(
              "Both weights are set to zero. What happens to the dashed line of zero score?",
              [
                "There is none, because the score is then the bias everywhere",
                "It passes through the origin",
                "It runs corner to corner across the window",
                "It stays where it was, since only the bias moves it",
              ],
              0,
              "With both weights at zero the score is 0.5 at every cell of the lattice and the box draws nothing dashed. Setting both weights to 1 and the bias to 0 is what runs the line corner to corner.",
            ),
            trueFalse(
              "A chain of neurons using only identity activations can represent more than one weighted sum plus a constant, because it holds more parameters.",
              false,
              "Composing two affine transformations leaves one combined weight matrix and one combined bias, so however many stages the chain has it still performs one affine transformation. The plane fit through the chain’s surface comes back with weights 3.00 and −1.50, an intercept of 0.50, an R² of exactly 1.0 and a largest residual of exactly 0.0, which are the collapsed neuron’s numbers to the last bit.",
            ),
            trueFalse(
              "Inserting a nonlinear activation makes representations possible that a single affine transformation could not produce, without guaranteeing that a fitted network uses them.",
              true,
              "The nonlinear function cannot be distributed through the matrix multiplication, so the chain no longer collapses, and particular parameters or restricted input regions can still produce an affine result. With the sigmoid in place the chain answers 0.9764 for the tall heavy person where the collapsed neuron still says 2.0, so on this surface the flatness has genuinely gone.",
            ),
        ],
        },
        {
          title: "Part 3. The Four Activation Functions",
          content: (
            <>
              <SubSection title="9. The identity">
                <p>
                  The identity does nothing to the score, so its output is
                  the score and its slope is 1 everywhere. The tall heavy
                  person comes out at 1.5 and the short heavy person at
                  −2.5, and nothing is squashed or clipped. It is on the
                  list so that a network whose last layer predicts a
                  quantity, a weight in kilograms say, can end in an
                  ordinary neuron rather than a special case, since a
                  sigmoid there would trap every answer between zero and
                  one.
                </p>
                <Equation>{"f(z) = z            f′(z) = 1"}</Equation>
                <BendGallery />
                <KeepInMind>
                  <p>
                    Identity is useful when a layer should pass its score through
                    unchanged. It often appears at an output layer that predicts an
                    unrestricted quantity or supplies logits to a loss. It is valid
                    elsewhere too, but consecutive affine layers without a nonlinear
                    operation can be combined into one.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The rectifier">
                <p>
                  The rectifier keeps a positive score and replaces a
                  negative one with zero, so it is the score on one side of
                  zero and flat on the other. The tall heavy person, scoring
                  1.5, comes through untouched at 1.5. The short heavy
                  person, scoring −2.5, comes out at exactly 0, and so does
                  everyone else on that side of the dashed line, however far
                  from it they are. Its output has no ceiling and a floor of
                  zero.
                </p>
                <Equation>
                  {"f(z) = max(0, z)     f′(z) = 1 for z > 0,  0 for z < 0"}
                </Equation>
                <>
                  <p>
                    At exactly zero, ReLU has no single derivative: the left and right
                    slopes differ. This implementation uses zero as its backward
                    convention there. Zero scores can occur, for example with zero
                    inputs or parameters, so the convention should be stated rather than
                    assumed irrelevant.
                  </p>
                </>
                <KeepInMind>
                  The rectifier is two straight lines meeting at zero, which
                  is why its slope is either exactly 1 or exactly 0 and never
                  anything between, and section 18 counts what the zero half
                  costs on the crowd.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The sigmoid">
                <p>
                  The sigmoid is the logistic regression page&rsquo;s
                  squash, and it maps any score into the open interval
                  between zero and one, crossing one half at a score of
                  zero. The tall heavy person&rsquo;s 1.5 becomes 0.8176 and
                  the short heavy person&rsquo;s −2.5 becomes 0.0759. Neither
                  end is ever reached exactly in principle, though in
                  floating point it is, and section 18 says what happens
                  then.
                </p>
                <Equation>{"f(z) = 1 / (1 + e^(−z))"}</Equation>
                <p>
                  The formula as written overflows for a large negative
                  score, since e to the 800 is beyond what a double can
                  hold, and the sigmoid here is computed in a form that
                  does not. I checked it at the edge of what the box can
                  reach. A neuron with both weights at 10 and a bias of −10,
                  shown the corner ten deviations short and ten light, scores
                  −210 and answers 6.28 × 10⁻⁹², a tiny number rather than a
                  warning, and the same neuron at the opposite corner scores
                  190 and answers exactly 1.
                </p>
                <KeepInMind>
                  <p>
                    A sigmoid output lies between zero and one and can represent a
                    binary probability when the model and training objective give it
                    that interpretation. Its bounded response can also be useful inside
                    some architectures. Section 20 examines the probability
                    interpretation; the following sections compare its learning
                    behaviour with tanh.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The hyperbolic tangent">
                <p>
                  The tangent is the sigmoid recentred, stretched to run
                  from minus one to one and crossing zero at a score of
                  zero, so a neuron carrying it answers a number centred on
                  zero rather than on one half, which the next layer tends
                  to find easier to read. The tall heavy person comes out at
                  0.9051 and the short heavy person at −0.9866, already close
                  to the floor at a score of only −2.5.
                </p>
                <Equation>{"tanh(z) = 2·σ(2z) − 1"}</Equation>
                <WorkedExample title="The recentring checked at the tall heavy person">
                  <>
                    <p>
                      To recover tanh at score 1.5, evaluate sigmoid at twice that
                      score, double the result and subtract one.
                    </p>
                    <Equation>{"tanh(1.5) = 2 × sigmoid(3) − 1 ≈ 0.9051"}</Equation>
                    <p>
                      The two functions are related by changes to both the input scale
                      and the output scale.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  <p>
                    Tanh is related to sigmoid by rescaling its input and recentering
                    and rescaling its output. Both have small derivatives far from zero.
                    Part 4 compares how quickly those derivatives shrink.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. How the Activation Changes the Gradient",
          content: (
            <>
              <SubSection title="13. Why the slope decides">
                <p>
                  When a network learns, a gradient arrives at each neuron
                  from whatever sits above it, saying how the loss would
                  change if that neuron&rsquo;s output moved. To turn that
                  into how the loss would change if the score moved, which
                  is what the weights need, the calculus primer&rsquo;s chain
                  rule multiplies it by the activation function&rsquo;s slope at the very
                  score the forward pass produced. Every neuron a gradient
                  passes through on its way down multiplies it by one such
                  factor, and the{" "}
                  <Link href="/concepts/backpropagation" className={link}>
                    backpropagation page
                  </Link>{" "}
                  follows one all the way.
                </p>
                <Equation>{"∂loss/∂z = ∂loss/∂output · f′(z)"}</Equation>
                <KeepInMind>
                  An activation function is chosen for its slope, since the slope is what
                  the gradient is multiplied by. An activation function whose slope is small
                  everywhere starves everything beneath it, whatever its
                  output looks like.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Deriving the four slopes">
                <p>
                  The identity&rsquo;s slope is 1 and the rectifier&rsquo;s
                  is 1 on the live side and 0 on the dead side, both read
                  straight off the definition. The sigmoid takes three lines
                  of the chain rule, and its slope comes out as a function
                  of its own output, which is why a backward pass never has
                  to recompute the exponential.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="why"
                  rows={[
                    { expression: "σ(z) = (1 + e^(−z))^(−1)", reason: "the sigmoid written as a power, ready for the chain rule" },
                    { expression: "σ′(z) = e^(−z) · (1 + e^(−z))^(−2)", reason: "the power rule on the outside, times the derivative of the inside, which is −e^(−z), and the two minus signs cancel" },
                    { expression: "σ′(z) = σ(z) · (1 − σ(z))", reason: "e^(−z) / (1 + e^(−z)) is 1 − σ(z), and the remaining factor is σ(z)" },
                    { expression: "tanh′(z) = 4·σ′(2z) = 1 − tanh²(z)", reason: "differentiate 2·σ(2z) − 1 and substitute the sigmoid’s slope back in" },
                  ]}
                />
                <WorkedExample title="The slopes at the two worked people">
                  <>
                    <p>
                      At score 1.5, sigmoid and hyperbolic tangent both have relatively
                      small derivatives. Calculate them from the corresponding outputs.
                    </p>
                    <Equation>{"sigmoid output ≈ 0.8176\nsigmoid derivative ≈ 0.8176 × (1 − 0.8176) ≈ 0.1491\n\ntanh output ≈ 0.9051\ntanh derivative ≈ 1 − 0.9051² ≈ 0.1807"}</Equation>
                    <p>
                      At score minus 2.5, the sigmoid derivative is about 0.0701 and the
                      tanh derivative about 0.0266. These small multipliers reduce the
                      gradient passed back through the activation.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  Both squashing activation functions have slopes that are a function of
                  their own output, and both slopes fall toward zero as the
                  output nears either end of its range. The rectifier&rsquo;s
                  slope is a step, and the identity&rsquo;s is a constant.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The four slopes side by side">
                <p>
                  Laid over one another the four slopes tell the whole story
                  of which activation function to use where. The identity and the rectifier
                  reach 1 and stay there, the tangent reaches 1 at a score
                  of zero and falls away on both sides, and the sigmoid
                  reaches a quarter at its best and falls away just as fast.
                </p>
                <ActivationSlopeChart />
                <KeepInMind>
                  <p>
                    The largest derivative is one for identity, one on the positive side
                    of ReLU, one quarter for sigmoid, and one for tanh. Sigmoid reaches
                    its maximum derivative at output one half.
                  </p>
                  <Equation>{"maximum sigmoid derivative = 0.5 × (1 − 0.5) = 0.25"}</Equation>
                  <p>
                    Changing weights changes the score at which the activation is
                    evaluated. It does not change this bound on the sigmoid’s own
                    derivative.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Saturation And Dead Units",
          content: (
            <>
              <SubSection title="16. The flat ends of the sigmoid and the tangent">
                <p>
                  An activation function that squashes has to go flat somewhere, and once it
                  has, its slope is close to zero and it passes almost
                  nothing back. That is saturation, and the table below reads
                  the two squashing activation functions at whole-number scores off the
                  curve the box samples.
                </p>
                <NumberTable
                  headings={["score z", "sigmoid output", "sigmoid slope", "tanh output", "tanh slope"]}
                  rows={[
                    ["0", "0.5000", "0.2500", "0.0000", "1.0000"],
                    ["1", "0.7311", "0.1966", "0.7616", "0.4200"],
                    ["2", "0.8808", "0.1050", "0.9640", "0.0707"],
                    ["3", "0.9526", "0.0452", "0.9951", "0.0099"],
                    ["4", "0.9820", "0.0177", "0.9993", "0.0013"],
                    ["6", "0.9975", "0.0025", "1.0000", "0.000025"],
                  ]}
                  caption="Outputs and slopes at whole-number scores, read from the sampled curves. The negative scores mirror these, with the outputs reflected and the slopes the same."
                />
                <p>
                  By a score of 6 the sigmoid&rsquo;s slope is 0.0025, a
                  hundredth of its peak, and the tangent&rsquo;s is
                  0.000025, which is why the tangent looks so much steeper
                  at zero and is no better off two units out. The page uses
                  a hundredth of the peak as its working definition of
                  saturated, and on the neuron the logistic model fitted to
                  the crowd, whose weights are 2.55 and 1.29, the child of
                  120 centimetres and 25 kilograms scores −7.38 and has a
                  sigmoid slope of 0.000622, the adult of 183 centimetres
                  and 83 kilograms scores 8.12 and has the crowd&rsquo;s
                  smallest slope, 0.000298, and six of the twenty-five
                  people are under the hundredth.
                </p>
                <KeepInMind>
                  Saturation is about the size of the score, and the score
                  is a weighted sum, so a neuron saturates when its weights
                  are large or its inputs are, which is one more reason the
                  inputs arrive standardised.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Ten neurons in a chain">
                <p>
                  The trouble compounds. A gradient passing back through
                  ten sigmoid neurons in a chain is multiplied by ten slopes,
                  each at most a quarter, so in the best case, with every one
                  of the ten scores exactly zero, it keeps a quarter to the
                  tenth power.
                </p>
                <Equation>
                  {"0.25¹⁰ = 9.537 × 10⁻⁷\n0.1491¹⁰ = 5.4 × 10⁻⁹"}
                </Equation>
                <p>
                  Under a millionth at the single best point, and the second
                  line, at the tall heavy person&rsquo;s slope of 0.1491, is
                  two hundred times smaller than that. The tangent peaks at
                  1 rather than a quarter, so a chain of tangent neurons
                  starves four times more slowly per layer and starves all
                  the same once the scores drift from zero. The rectifier
                  passes the gradient through at exactly 1 wherever the
                  score is positive, however long the chain, and that is
                  the whole reason it took over. Nothing is broken in a
                  starved chain and nothing raises; the walk just stalls,
                  which the{" "}
                  <Link href="/concepts/training-a-network" className={link}>
                    training page
                  </Link>{" "}
                  shows happening.
                </p>
                <KeepInMind>
                  Ten sigmoid slopes multiply to under a millionth at their
                  very best, and no learning rate recovers what the chain has
                  multiplied away, since the rate scales the product it is
                  given rather than restoring what the squashes removed.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The rectifier&rsquo;s dead side">
                <p>
                  The rectifier escapes saturation on one side and pays for
                  it on the other. Wherever the score is negative its slope
                  is exactly 0, so a person on that side of the line
                  contributes nothing to the gradient at all, and a neuron
                  whose score is negative for every person it is shown
                  receives no gradient from anyone and cannot move its
                  weights to change that. The unit is dead, and since the
                  only thing that could move its weights is the gradient it
                  no longer receives, it stays that way.
                </p>
                <InAModel title="The fitted neuron under the rectifier">
                  <p>
                    Give the neuron the logistic model fitted to the crowd
                    a rectifier instead of its sigmoid, and 12 of the 25
                    people land on the dead side with an output of exactly 0
                    and a slope of exactly 0. The other 13 pass through at
                    a slope of exactly 1. Nothing is in between, because the
                    rectifier has no in between.
                  </p>
                </InAModel>
                <>
<p>
                  A sigmoid can die too, in floating point. Scale the fitted neuron&rsquo;s three numbers by ten and the child of 120 centimetres scores −73.8, whose sigmoid output rounds to a number so close to zero that one minus it is exactly 1, and the mirror case on the other side rounds the output to exactly 1, where the output times one minus the output is exactly 0.
                </p>
                <p>
                  Three people in the crowd have a slope of exactly 0.0 at that scale, which is saturation having become death, and I mention it because a reader who believes the sigmoid&rsquo;s slope is always positive will meet a zero and go looking for a bug that is not there.
                </p>
</>
                <KeepInMind>
                  A dead rectifier unit is a neuron no gradient reaches. The
                  usual guards are a small positive bias at the start and a
                  learning rate that cannot fling the weights across zero in
                  one step, and the leaky rectifier, which gives the dead
                  side a small slope, is the repair that changes the activation function
                  itself.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. A census of the crowd">
                <p>
                  The widget below starts from the fitted neuron and scales
                  its two weights and its bias together, which leaves the
                  dashed line where it is and steepens the score everywhere
                  else. Each person is filled in proportion to the slope at
                  their score, so as the scale rises the people far from the
                  line fade to rings, and the counts say how many have gone.
                </p>
                <DeadUnitCensus />
                <NumberTable
                  headings={["scale", "sigmoid saturated", "sigmoid dead", "tanh saturated", "tanh dead"]}
                  rows={[
                    ["0.25", "0 of 25", "0", "0 of 25", "0"],
                    ["1", "6 of 25", "0", "6 of 25", "0"],
                    ["4", "10 of 25", "0", "16 of 25", "6"],
                    ["10", "17 of 25", "3", "23 of 25", "7"],
                    ["20", "23 of 25", "5", "23 of 25", "16"],
                  ]}
                  caption="The census at five scales of the fitted neuron. Saturated is a slope under a hundredth of the activation function’s peak, dead is a slope of exactly zero, and the dead are counted among the saturated."
                />
                <KeepInMind>
                  At a quarter of the fitted scale nobody in the crowd is
                  flat, and at twenty times it almost everyone is. The
                  weights decide it, which is why a network&rsquo;s starting
                  weights are chosen small and its inputs are standardised
                  before anything else is tried.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 to 5",
          quiz: [
            choice(
              "Why is the identity on the list of activation functions at all?",
              [
                "So a layer predicting an unrestricted quantity can end in an ordinary neuron",
                "Because it is the cheapest of the four to compute",
                "Because a chain of identity neurons can represent what a chain with a nonlinear activation cannot",
                "Because the other three are defined in terms of it",
              ],
              0,
              "A sigmoid at an output layer would trap every answer between zero and one, which is wrong for a quantity such as a weight in kilograms. The identity is valid elsewhere too, though consecutive affine layers with no nonlinear operation between them can be combined into one.",
            ),
            choice(
              "How large can the sigmoid’s derivative get?",
              [
                "A quarter, reached at an output of one half",
                "One, reached at a score of zero",
                "One, the same as the identity’s",
                "There is no bound, since it depends on the weights",
              ],
              0,
              "The slope is the output times one minus the output, which is largest at a half. The tangent reaches 1 at a score of zero and falls away on both sides. Changing the weights changes the score the activation is read at and does not change this bound.",
            ),
            several(
              "The neuron fitted to the crowd keeps its sigmoid, with weights 2.55 and 1.29. Which of these hold on the twenty-five people?",
              [
                "The child of 120 centimetres and 25 kilograms scores −7.38, where the sigmoid’s slope is 0.000622",
                "Six of the twenty-five people sit where the slope is under a hundredth of the sigmoid’s peak",
                "Scaling the three fitted numbers by ten leaves every slope positive, since the sigmoid never reaches either end in principle",
                "At a quarter of the fitted scale the same six people are still flat",
              ],
              [0, 1],
              "Saturation is about the size of the score, and scaling the weights and the bias together leaves the dashed line where it is while steepening the score everywhere else. At a quarter of the fitted scale nobody in the crowd is flat, at the fitted scale six are, and at ten times it three people have a slope of exactly 0.0, because in floating point the output has rounded to exactly 0 or exactly 1 and the output times one minus the output is then zero.",
            ),
            trueFalse(
              "Raising the learning rate recovers the gradient that a chain of ten sigmoid neurons has multiplied away.",
              false,
              "Ten slopes each at most a quarter leave under a millionth even at the single best point, where every one of the ten scores is exactly zero, and at the tall heavy person’s slope of 0.1491 the product is two hundred times smaller than that. The rate scales the product it is handed rather than restoring what the squashes removed, so nothing raises and the walk simply stalls.",
            ),
            several(
              "The neuron fitted to the crowd is given a rectifier instead of its sigmoid. Which of these follow?",
              [
                "12 of the 25 people land on the dead side, with an output and a slope of exactly 0",
                "The other 13 pass through at a slope of exactly 1",
                "A neuron whose score is negative for everyone it sees cannot move its weights to change that",
                "Some people sit between the two, with a slope between 0 and 1",
              ],
              [0, 1, 2],
              "Nothing is in between, because the rectifier has no in between. A dead unit receives no gradient from anyone, and the gradient is the only thing that could move its weights, so it stays dead. The usual guards are a small positive bias at the start and a learning rate that cannot fling the weights across zero in one step, with the leaky rectifier the repair that changes the activation itself.",
            ),
        ],
        },
        {
          title: "Part 6. One Neuron Against Logistic Regression",
          content: (
            <>
              <SubSection title="20. A sigmoid neuron is the logistic model">
                <p>
                  Fit the logistic regression page&rsquo;s model to the
                  crowd, with standardised height and weight as its two
                  features, and it settles on a coefficient of 2.5537 for
                  height, 1.2944 for weight and an intercept of 0.1396,
                  after 7527 passes of the gradient climb. Hand those three
                  numbers to one neuron as its two weights and its bias,
                  choose the sigmoid, and show it the same people.
                </p>
                <LogisticTwinChart />
                <InAModel title="Both routes on the whole crowd">
                  <p>
                    The child of 147 centimetres and 41 kilograms scores
                    −1.5321, and the model&rsquo;s probability of adulthood
                    is 0.177694 while the neuron&rsquo;s output is 0.177694.
                    The adult of 156 centimetres and 53 kilograms scores
                    1.0151 and both routes answer 0.734019. Over all
                    twenty-five people the largest gap between the two is
                    1.1 × 10⁻¹⁶, which is one rounding of a double, and
                    the button in the box at the top of the page loads the
                    same three numbers so you can drag the probe over the
                    crowd yourself.
                  </p>
                </InAModel>
                <KeepInMind>
                  A neuron with a sigmoid activation function and logistic regression are
                  the same calculation, weights, a bias and a squash, and
                  the logistic page&rsquo;s single-input model is the same
                  neuron with one weight. Nothing about the unit is new, and
                  the dense layers page is where the difficulty starts, by
                  feeding one such neuron&rsquo;s output into another.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. What one neuron cannot do">
                <>
<p>
                  The dashed line in the twin&rsquo;s map is straight, because a weighted sum is zero along a straight line for every choice of weights and bias, and the crowd&rsquo;s tangled middle does not sort along any straight line. The fitted neuron calls 17 of the 25 people correctly, an accuracy of 0.68, and the eight it misses are the ones ringed dark in the map, all of them inside the tangle, where a child and an adult of nearly the same height and weight sit on opposite sides of whatever line is drawn.
                </p>
                <p>
                  Section 4 said one neuron knows one direction in the plane, and this is the price.
                </p>
</>
                <WhyThisWorks title="Why no nonlinear activation rescues it">
                  <p>
                    Write the score at the four corners of exclusive-or,
                    where the answer is yes when exactly one of two inputs is
                    on.
                  </p>
                  <Equation>
                    {
                      "z(0,0) = b              z(1,0) = w₁ + b\nz(0,1) = w₂ + b         z(1,1) = w₁ + w₂ + b\n\nz(0,1) + z(1,0) = w₁ + w₂ + 2b = z(0,0) + z(1,1)"
                    }
                  </Equation>
                  <>
<p>
                    The two yes corners and the two no corners carry the same total score, for every weight and bias there is. Exclusive-or asks for both yes corners above a threshold and both no corners below it, which would make the left-hand total exceed twice the threshold while the right-hand total falls short of it, and those two totals are the same number.
                  </p>
                  <p>
                    The argument never touches the activation function, only the assumption that a higher score never means a lower output, which every activation function on the list satisfies, so no cleverer squash escapes it.
                  </p>
</>
                </WhyThisWorks>
                <p>
                  Composition does escape it, which is what the{" "}
                  <Link href="/concepts/dense-layers" className={link}>
                    dense layers page
                  </Link>{" "}
                  builds and the{" "}
                  <Link href="/concepts/training-a-network" className={link}>
                    training page
                  </Link>{" "}
                  trains on exclusive-or itself. Two neurons each draw a
                  line, and a third reading both can say yes between the
                  lines and no outside them.
                </p>
                <KeepInMind>
                  One neuron draws one straight line, and its ceiling is a
                  fact about the unit rather than a weakness of any activation function.
                  The crowd&rsquo;s 17 of 25 is what that ceiling costs on
                  data with a tangled middle.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Why softmax is not on the list">
                <p>
                  Anyone who has met the{" "}
                  <Link href="/concepts/multiclass-classification" className={link}>
                    multi-class page
                  </Link>{" "}
                  will look for softmax among the four buttons and not find
                  it, and its absence is a matter of what it reads rather
                  than of taste. Each activation function on the list reads one score and
                  answers one output. Softmax reads a whole row of scores at
                  once and answers a row that sums to one.
                </p>
                <Equation>{"softmax(z)ᵢ = e^(zᵢ) / Σⱼ e^(zⱼ)"}</Equation>
                <InAModel title="Three scores, one of them moved">
                  <p>
                    Three neurons scoring 2, 1 and 0.1 come out of softmax
                    at 0.6590, 0.2424 and 0.0986. Move only the third score,
                    from 0.1 to 5, and the outputs become 0.0466, 0.0171 and
                    0.9362. Nothing about the first neuron changed and its
                    answer fell by a factor of 14.1, because every output
                    shares one denominator and the three compete for a fixed
                    total of one.
                  </p>
                </InAModel>
                <p>
                  No function of one number can do that, and no single
                  neuron can hold it, since a neuron has no neighbours to
                  normalise against. Softmax belongs to an output layer,
                  where the whole row exists, and it is kept there
                  beside the multi-class loss rather than on the list of
                  activation functions a neuron may own.
                </p>
                <KeepInMind>
                  Softmax is an activation function for a vector of scores.
                  It is outside this playground&rsquo;s scalar activation
                  interface because one output depends on the other scores too.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Implementation And Failure Contracts",
          content: (
            <>
              <SubSection title="23. What a complete implementation states">
                <p>
                  A complete neuron states how many inputs it reads, which
                  is its number of weights and cannot be zero; the order its
                  weights match its inputs in, since they carry no names;
                  that it holds a bias; which activation function it applies and what that
                  activation function&rsquo;s slope is, so that the two travel together;
                  what the slope is at the rectifier&rsquo;s kink; that the
                  sigmoid is computed in a form that cannot overflow; the
                  range each activation function&rsquo;s output lies in; and that it answers
                  with the score and the output both, since the backward
                  pass needs the score. It also states what a chain of them
                  does when only affine operations occur between them, which is collapse,
                  and why softmax needs a vector-valued interface.
                </p>
              </SubSection>

              <SubSection title="24. Failure contracts">
                <p>
                  Every row below was probed. The playground&rsquo;s request
                  refuses some of these at the door, with its own bounds,
                  before the neuron is reached, and where that happens the
                  row says what the neuron itself does when asked directly.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "a neuron with no weights", reason: "refused; a neuron with no inputs is a constant wearing a neuron’s name, and the request asks for exactly two weights before any neuron is built." },
                    { expression: "a neuron with one weight", reason: "accepted, and it is the logistic page’s single-input model; the playground’s request asks for two because its plane has two axes." },
                    { expression: "a non-finite weight or bias", reason: "refused in words, and it cannot be written in a request at all, since JSON has no way to spell infinity or a non-number." },
                    { expression: "a row of the wrong length", reason: "refused; the weight count is the input width, and three values against two weights is named as a length mismatch." },
                    { expression: "an empty row, or a non-finite or non-numeric value in it", reason: "refused, each by the same guard every column passes through." },
                    { expression: "integers, or booleans, as inputs", reason: "accepted and coerced to floating point, so true reads as 1 and false as 0; documented rather than defended." },
                    { expression: "one person", reason: "answered; a neuron responds to a row and has no notion of a dataset, so one row is the ordinary case." },
                    { expression: "both weights zero, a constant column", reason: "accepted; the score is the bias everywhere, 0.5 at every cell, and there is no zero line to draw." },
                    { expression: "a weight or probe beyond 10, or a lattice finer than 41 cells", reason: "refused at the door as a request larger than the page allows, with the limit named." },
                    { expression: "unfitted use", reason: "nothing to refuse; a neuron is built complete from its three numbers and has no fit of its own. Fitting is the training page’s job." },
                    { expression: "mismatched feature names", reason: "not detectable; the weights carry no names and match inputs by position, so the order is the contract. Documented rather than defended." },
                    { expression: "softmax requested as an activation function", reason: "refused; it is not on the list and cannot be, since it reads a row." },
                    { expression: "the rectifier at a score of exactly zero", reason: "slope 0 by convention, the negative side’s answer; the curve’s middle sample reports it." },
                    { expression: "a score of −210 under the sigmoid", reason: "6.28 × 10⁻⁹², with no overflow and no warning, because the sigmoid is computed in its stable form." },
                    { expression: "a score of 190 under the sigmoid", reason: "exactly 1, with a slope of exactly 0, which is where saturation has become a dead unit in floating point." },
                    { expression: "a lattice window that does not open upward", reason: "refused in words, naming which input’s low edge is not below its high edge." },
                  ]}
                />
                <p>
                  The two rows that deserve a second look are the ones that
                  are accepted. Booleans coerce quietly, so a column of
                  yes-and-no flags becomes ones and zeros without anyone
                  saying so, and the positional weights mean a row handed
                  over with its height and weight swapped is scored wrongly
                  with nothing raised. Both are the price of a unit that
                  reads unnamed coordinates from the layer beneath it, and
                  the dense layers page is where the shape checks that catch
                  a wrong width live.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            trueFalse(
              "Handing the logistic regression fit’s three numbers to one sigmoid neuron reproduces that model’s probabilities, with the largest gap over the twenty-five people at 1.1 × 10⁻¹⁶.",
              true,
              "A neuron with a sigmoid activation and logistic regression are the same calculation, weights, a bias and a squash. That gap is one rounding of a double, and the logistic page’s single-input model is the same neuron with one weight.",
            ),
            choice(
              "The fitted neuron calls 17 of the 25 people correctly. Why does it miss the other eight?",
              [
                "They lie in the crowd’s tangled middle, which does not sort along any straight line",
                "The sigmoid saturates on those eight and passes nothing back",
                "The climb stopped at 7527 passes, before those eight were fitted",
                "Their height and weight were not standardised with the rest",
              ],
              0,
              "A weighted sum is zero along a straight line for every choice of weights and bias, so the dashed line is straight and a child and an adult of nearly the same height and weight sit on opposite sides of whatever line is drawn. One neuron knows one direction in the plane, and an accuracy of 0.68 is what that costs here.",
            ),
            trueFalse(
              "A cleverer squash would let one neuron answer exclusive-or.",
              false,
              "The two yes corners and the two no corners carry the same total score for every weight and bias there is, so the argument never touches the activation function. It assumes only that a higher score never means a lower output, which every activation on the list satisfies. Composition is what escapes it, with two neurons each drawing a line and a third reading both.",
            ),
            choice(
              "Three neurons scoring 2, 1 and 0.1 come out of softmax at 0.6590, 0.2424 and 0.0986. Only the third score moves, to 5. What happens to the first neuron’s answer?",
              [
                "It falls by a factor of 14.1, to 0.0466, although nothing about that neuron changed",
                "It stays at 0.6590, since its own score did not move",
                "It rises, because the row still has to sum to one",
                "It is undefined until the row is renormalised",
              ],
              0,
              "Every output shares one denominator and the three compete for a fixed total of one. No function of a single number can do that, and no single neuron can hold it, since a neuron has no neighbours to normalise against. That is why softmax belongs to an output layer rather than to the list of activations a neuron may own.",
            ),
            trueFalse(
              "A row handed to the neuron with its height and weight swapped is scored wrongly with nothing raised, because the weights are kept in input order and carry no names.",
              true,
              "A row of the wrong length is refused, since the weight count is the input width, but a row of the right length is matched to the weights by position and nothing checks what each value means. Booleans coerce just as quietly, which turns a column of yes-and-no flags into ones and zeros without anyone saying so. Both are the price of a unit that reads unnamed coordinates from the layer beneath it.",
            ),
        ],
        },
        {
          title: "Practice. Building the Neuron With the Library",
          practice: [
            exercise(
              "Push the two worked people through the worked neuron",
              ["Part 1 builds a neuron with weights 2 and −1 and a bias of one half, and reads the tall heavy person at (1, 1) and the short heavy person at (−1, 1) through it. Build that neuron with Neuron once for each of the four activations and ask it about both people with respond_to.", "The score should be 1.5 and −2.5 every time, whichever activation is chosen, and only the output should change from line to line. Part 3 gives the tall heavy person’s outputs as 1.5, 1.5, 0.8176 and 0.9051. Print both people’s score and output to four places."],
              `from oop_ml import HyperbolicTangent, Identity, Neuron, RectifiedLinear, Sigmoid

bends = [("identity", Identity()), ("rectifier", RectifiedLinear()),
         ("sigmoid", Sigmoid()), ("tangent", HyperbolicTangent())]
tall_heavy = [1.0, 1.0]
short_heavy = [-1.0, 1.0]

for name, bend in bends:
    neuron = Neuron([2.0, -1.0], 0.5, bend)
    # Ask the neuron about both people, and print each person's score and
    # output to four places on one line per activation.`,
              `from oop_ml import HyperbolicTangent, Identity, Neuron, RectifiedLinear, Sigmoid

bends = [("identity", Identity()), ("rectifier", RectifiedLinear()),
         ("sigmoid", Sigmoid()), ("tangent", HyperbolicTangent())]
tall_heavy = [1.0, 1.0]
short_heavy = [-1.0, 1.0]

for name, bend in bends:
    neuron = Neuron([2.0, -1.0], 0.5, bend)
    tall = neuron.respond_to(tall_heavy)
    short = neuron.respond_to(short_heavy)
    print(f"{name}: tall heavy score {tall.score:.4f} output {tall.output:.4f}, "
          f"short heavy score {short.score:.4f} output {short.output:.4f}")`,
              `identity: tall heavy score 1.5000 output 1.5000, short heavy score -2.5000 output -2.5000
rectifier: tall heavy score 1.5000 output 1.5000, short heavy score -2.5000 output 0.0000
sigmoid: tall heavy score 1.5000 output 0.8176, short heavy score -2.5000 output 0.0759
tangent: tall heavy score 1.5000 output 0.9051, short heavy score -2.5000 output -0.9866`,
              { hints: ["A neuron is built complete from its weights as a list, its bias and an activation object. There is nothing to fit, so it answers straight away.", "respond_to takes one row, a list with one value per weight, and answers an object carrying both of the neuron’s numbers as score and output.", "The score is computed before the activation is applied, so it is the same number on all four lines. If it moves, the activation has been put in the wrong place."], check: numberCheck("What does the sigmoid neuron answer for the short heavy person, to four places?", 0.0759, 0.0005, "The score is two times minus one, less one, plus one half, which is −2.5 whatever the activation, and the sigmoid maps −2.5 to one over one plus e to the 2.5, which is 0.0759. The same score comes out of the rectifier as exactly 0 and of the tangent as −0.9866, already close to its floor, which is Part 3’s point that the four functions read one score and differ only in what they do to it.") },
            ),
            exercise(
              "Read the slope a gradient is multiplied by",
              ["Part 4 says an activation is chosen for its slope, because the slope at the score the forward pass produced is what a gradient is multiplied by on its way back. Every activation object answers two questions about an array of scores, of for the output and derivative_at for the slope. Ask all four about the two worked scores, 1.5 and −2.5.", "Part 4 gives the sigmoid’s slope at 1.5 as 0.1491 and the tangent’s as 0.1807, and at −2.5 as 0.0701 and 0.0266. Part 5 multiplies ten sigmoid slopes together. Print the outputs and slopes to four places, then what ten sigmoid neurons in a chain keep of a gradient at each worked person’s slope, which at the short heavy person’s slope the lesson does not print."],
              `import numpy as np
from oop_ml import HyperbolicTangent, Identity, RectifiedLinear, Sigmoid

bends = [("identity", Identity()), ("rectifier", RectifiedLinear()),
         ("sigmoid", Sigmoid()), ("tangent", HyperbolicTangent())]
scores = np.array([1.5, -2.5])

for name, bend in bends:
    # Print the activation's output and slope at both scores, to four places.
    pass

# Print what ten sigmoid neurons keep of a gradient at the tall heavy
# person's slope and at the short heavy person's, in scientific notation,
# beside the quarter to the tenth that a score of exactly zero would keep.`,
              `import numpy as np
from oop_ml import HyperbolicTangent, Identity, RectifiedLinear, Sigmoid

bends = [("identity", Identity()), ("rectifier", RectifiedLinear()),
         ("sigmoid", Sigmoid()), ("tangent", HyperbolicTangent())]
scores = np.array([1.5, -2.5])

for name, bend in bends:
    outputs = bend.of(scores)
    slopes = bend.derivative_at(scores)
    print(f"{name}: at 1.5 output {outputs[0]:.4f} slope {slopes[0]:.4f}, "
          f"at -2.5 output {outputs[1]:.4f} slope {slopes[1]:.4f}")

tall, short = Sigmoid().derivative_at(scores)
print(f"ten sigmoid neurons keep {tall ** 10:.2e} at the tall heavy person's slope")
print(f"and {short ** 10:.2e} at the short heavy person's")
print(f"against {0.25 ** 10:.3e} with every one of the ten scores at zero")`,
              `identity: at 1.5 output 1.5000 slope 1.0000, at -2.5 output -2.5000 slope 1.0000
rectifier: at 1.5 output 1.5000 slope 1.0000, at -2.5 output 0.0000 slope 0.0000
sigmoid: at 1.5 output 0.8176 slope 0.1491, at -2.5 output 0.0759 slope 0.0701
tangent: at 1.5 output 0.9051 slope 0.1807, at -2.5 output -0.9866 slope 0.0266
ten sigmoid neurons keep 5.45e-09 at the tall heavy person's slope
and 2.87e-12 at the short heavy person's
against 9.537e-07 with every one of the ten scores at zero`,
              { hints: ["of and derivative_at each take a numpy array of scores and answer an array of the same shape, so both worked scores go in together and come back as a pair.", "A chain multiplies the gradient by one slope per neuron, so ten neurons at one score keep that slope to the tenth power. Python’s ** raises to a power, and a format of .2e prints the result in scientific notation."], check: numberCheck("What slope does the sigmoid report at a score of 1.5, to four places?", 0.1491, 0.0005, "The sigmoid’s slope is its own output times one minus that output, and at 1.5 the output is 0.8176, so the slope is 0.8176 times 0.1824. Part 4 derives it in that form so a backward pass never recomputes the exponential, and ten such slopes multiplied together leave 5.4 × 10⁻⁹, two hundred times less than the millionth that ten peak slopes of a quarter would keep.") },
            ),
            exercise(
              "Build the logistic twin",
              ["Part 6 fits the logistic regression page’s model to the crowd on standardised height and weight and reads a coefficient of 2.5537 on height, 1.2944 on weight and an intercept of 0.1396 after 7527 passes. Standardise the crowd with Standardizer, fit LogisticRegression, and hand the fitted three numbers to a Neuron with a Sigmoid activation.", "Part 6 says the child of 147 centimetres and 41 kilograms scores −1.5321 and that the model’s probability and the neuron’s output both come to 0.177694, with the largest gap over the twenty-five people at 1.1 × 10⁻¹⁶. Print the fitted numbers, the first person through both routes, the largest gap, and the accuracy of 0.68."],
              `from oop_ml import Feature, LogisticRegression, Neuron, Sigmoid, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145,
           151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55,
           45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1,
            1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0]

measured = [Feature("height", heights), Feature("weight", weights)]
standardised = Standardizer().fit(measured).transform(measured)
label = Feature("is_adult", is_adult)
rows = list(zip(standardised[0].values, standardised[1].values))

model = LogisticRegression().fit(standardised, label)
# Print the two coefficients, the intercept and the passes run. Build a sigmoid
# neuron from the same three numbers and compare the two routes on the first
# person. Then print the largest gap between them over all twenty-five people,
# and the model's accuracy on the crowd.`,
              `from oop_ml import Feature, LogisticRegression, Neuron, Sigmoid, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145,
           151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55,
           45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1,
            1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0]

measured = [Feature("height", heights), Feature("weight", weights)]
standardised = Standardizer().fit(measured).transform(measured)
label = Feature("is_adult", is_adult)
rows = list(zip(standardised[0].values, standardised[1].values))

model = LogisticRegression().fit(standardised, label)
print(f"height {model.coefficients['height']:.4f}, weight {model.coefficients['weight']:.4f}, "
      f"intercept {model.intercept:.4f}, after {model.epochs_run} passes")

twin = Neuron([model.coefficients["height"], model.coefficients["weight"]], model.intercept, Sigmoid())
probabilities = model.predict_probability(standardised).values

first = twin.respond_to(rows[0])
print(f"first person: score {first.score:.4f}, model {probabilities[0]:.6f}, neuron {first.output:.6f}")
gaps = [abs(twin.respond_to(row).output - probability) for row, probability in zip(rows, probabilities)]
print(f"largest gap over the crowd {max(gaps):.1e}")
print(f"accuracy {model.score(standardised, label):.2f}")`,
              `height 2.5537, weight 1.2944, intercept 0.1396, after 7527 passes
first person: score -1.5321, model 0.177694, neuron 0.177694
largest gap over the crowd 1.1e-16
accuracy 0.68`,
              { hints: ["A fitted model’s coefficients can be read by name, as model.coefficients[\"height\"], and its intercept and epochs_run are properties. All three raise rather than answer before fit.", "The neuron’s weights go in as a list in the order the fit saw the columns, height then weight, with the intercept as its bias. The rows are standardised, since that is what the model was fitted on.", "predict_probability answers one probability per row; its values property is the plain array, which lines up with the rows by position for a zip."], check: numberCheck("What coefficient does the fit put on standardised height, to four places?", 2.5537, 0.0005, "The climb settles on 2.5537 for height against 1.2944 for weight, so height counts about twice as much as weight in the fitted score. Handing those two and the intercept to a sigmoid neuron reproduces every probability to one rounding of a double, because a sigmoid neuron and logistic regression are the same calculation, weights, a bias and a squash.") },
            ),
            exercise(
              "Take a census of the flat and the dead",
              ["Part 5 gives the fitted neuron a rectifier in place of its sigmoid and finds 12 of the 25 people on the dead side with a slope of exactly 0. With the sigmoid kept, six people sit where the slope is under a hundredth of its peak of a quarter, and with the three fitted numbers scaled by ten, three people have a slope of exactly 0.0 in floating point. Run all three censuses.", "For each, build the neuron, find every person’s score with respond_to, and read the slope at each score with derivative_at. Print how many slopes are exactly zero, how many are under a hundredth of the peak, and the smallest slope to six places. The count under the hundredth at ten times the fitted scale is a number the lesson does not print."],
              `import numpy as np
from oop_ml import Feature, LogisticRegression, Neuron, RectifiedLinear, Sigmoid, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145,
           151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55,
           45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1,
            1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0]

measured = [Feature("height", heights), Feature("weight", weights)]
standardised = Standardizer().fit(measured).transform(measured)
label = Feature("is_adult", is_adult)
rows = list(zip(standardised[0].values, standardised[1].values))

model = LogisticRegression().fit(standardised, label)
fitted = [model.coefficients["height"], model.coefficients["weight"]]

trials = [("rectifier", RectifiedLinear(), 1, 1.0), ("sigmoid", Sigmoid(), 1, 0.25),
          ("sigmoid at ten times", Sigmoid(), 10, 0.25)]
for name, bend, scale, peak in trials:
    neuron = Neuron([weight * scale for weight in fitted], model.intercept * scale, bend)
    # Collect every person's score, read the slope at each, and print how many
    # are exactly zero, how many are under a hundredth of the peak, and the
    # smallest, to six places.`,
              `import numpy as np
from oop_ml import Feature, LogisticRegression, Neuron, RectifiedLinear, Sigmoid, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145,
           151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55,
           45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1,
            1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0]

measured = [Feature("height", heights), Feature("weight", weights)]
standardised = Standardizer().fit(measured).transform(measured)
label = Feature("is_adult", is_adult)
rows = list(zip(standardised[0].values, standardised[1].values))

model = LogisticRegression().fit(standardised, label)
fitted = [model.coefficients["height"], model.coefficients["weight"]]

trials = [("rectifier", RectifiedLinear(), 1, 1.0), ("sigmoid", Sigmoid(), 1, 0.25),
          ("sigmoid at ten times", Sigmoid(), 10, 0.25)]
for name, bend, scale, peak in trials:
    neuron = Neuron([weight * scale for weight in fitted], model.intercept * scale, bend)
    scores = np.array([neuron.respond_to(row).score for row in rows])
    slopes = bend.derivative_at(scores)
    print(f"{name}: {int(np.sum(slopes == 0.0))} dead, "
          f"{int(np.sum(slopes < peak / 100))} under a hundredth of the peak, "
          f"smallest slope {slopes.min():.6f}")`,
              `rectifier: 12 dead, 12 under a hundredth of the peak, smallest slope 0.000000
sigmoid: 0 dead, 6 under a hundredth of the peak, smallest slope 0.000298
sigmoid at ten times: 3 dead, 17 under a hundredth of the peak, smallest slope 0.000000`,
              { hints: ["respond_to answers one row at a time, so a comprehension over rows collects the twenty-five scores, and derivative_at then reads all twenty-five slopes from that array in one call.", "Scaling the two weights and the bias by the same factor leaves the dashed line where it is and multiplies every score by the factor, which is what pushes people onto the flat ends.", "A boolean array summed with np.sum counts how many entries are true, so slopes == 0.0 counts the dead and slopes < peak / 100 counts the saturated, the dead among them."], check: numberCheck("How many of the twenty-five people does the rectifier leave dead?", 12, 0.5, "The rectifier’s slope is exactly 0 wherever the score is negative, and the fitted score is negative for twelve people, every one of them on the far side of the dashed line. Those twelve contribute nothing to the gradient at all, and the other thirteen pass it through at a slope of exactly 1, with nothing in between because the rectifier has no in between.") },
            ),
          ],
        },
      ]}
    />
  );
}
