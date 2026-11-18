import { pageMetadata } from "@/lib/seo";
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

export const metadata: Metadata = pageMetadata("/concepts/neurons-and-activations", {
  title: "A Neuron · Perceptron Lab",
  description:
    "An artificial neuron has weights, a bias and an activation function. The weights control each input's contribution, the bias shifts the combined value, and the activation determines how that value becomes an output.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function NeuronsAndActivationsPage() {
  return (
    <ConceptPage
      lessonId="neurons-and-activations"
      intuition={lessonIntuitions["neurons-and-activations"]}
      technicalStart="Part 3. The Four Activation Functions"
      openingTitle="What Is Inside an Artificial Neuron?"
      playgroundTitle="How do weights, bias and activation change the output?"
      playgroundIntro="Change one weight, the bias, or the activation at a time. Compare the weighted score with the final output so you can see which operation changed it."
      title="A Neuron"
      tagline={"An artificial neuron has weights, a bias and an activation function. The weights control each input's contribution, the bias shifts the combined value, and the activation determines how that value becomes an output."}
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
                  Our neuron reads a person&apos;s height and weight. We standardize both inputs using the group&apos;s mean and standard deviation, as in the feature-scaling lesson. A value of one then means one standard deviation above that measurement&apos;s mean. This gives the two weights a comparable input scale. The plot shows three standard deviations in each direction, which contains this example&apos;s observations.
                </p>
                <p>

                  The crowd&rsquo;s mean height is 151.48 centimeters with a deviation of 15.61, and its mean weight 51.48 kilograms with a deviation of 14.45.
                </p>
</>
                <Equation>
                  {
                    "x₁ = (height − 151.48) / 15.61\nx₂ = (weight − 51.48) / 14.45"
                  }
                </Equation>
                <WorkedExample title="Two profiles with the same body-weight input">
                  <>
<p>
                    We want to see what the height input contributes, so we will
                    compare two profiles with the same body-weight input. Both
                    are one standard deviation above the mean body weight. One
                    is taller than average and the other is shorter.
                  </p>
                  <p>
                    We will call them the tall heavy person and the short heavy
                    person in the later calculations. Their coordinates are shown
                    separately below, so we can follow the same inputs through
                    each activation function.
                  </p>
                  <NumberTable headings={["Profile", "Height input x₁", "Body-weight input x₂"]}
                    rows={[["Tall heavy person", "1", "1"], ["Short heavy person", "−1", "1"]]} />
                  <p>

                    The taller profile corresponds to about 167.1 centimeters
                    and 65.9 kilograms. For comparison, the first recorded child
                    in the crowd measures 147 centimeters and 41 kilograms,
                    giving standardized inputs of −0.287 and −0.725. Both input
                    profiles in the table can also be selected on the activity&apos;s grid.
                  </p>
</>
                </WorkedExample>
                <KeepInMind>

                  The neuron never sees centimeters or kilograms. It sees
                  two standardized numbers, and everything it learns is
                  written in those units, so a weight of 2 on height means
                  two units of score per standard deviation of height rather
                  than per centimeter.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The weighted sum and the bias">
                <p>Each input has a matching weight. The neuron multiplies each input by that weight, adds the products, and then adds the bias. The bias changes the score even when all the inputs are zero. In this example, training can change the two weights and the bias; the activation function is selected separately.</p>
<p>The word weight has two meanings here. A person’s body weight is the second input. A neuron’s weights are the multipliers applied to its inputs. We use x₁ and x₂ for the input values to keep them separate.</p>
                <Equation>{"z = w₁·x₁ + w₂·x₂ + b"}</Equation>
                <WorkedExample title="Calculate the score for the taller, heavier profile">
                  <>
                    <p>
                      Set the neuron weights to two and minus one, with bias one
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
                  The score uses the same calculation as a linear regression model: multiply the inputs by coefficients and add an intercept. Here we call those coefficients weights and the intercept a bias. A weighted sum with a constant added is also called an affine transformation.</KeepInMind>
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
                <InAModel title="Compare scores at the four input corners">
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
                <p>The dashed line marks the input pairs whose weighted score is zero. At that score, sigmoid outputs one half, tanh outputs zero, and ReLU changes from its flat region to its rising region. These are different responses to the same score. To find the line for the current weights, set the score to zero and solve for the second input.</p>
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
                  Changing a weight can rotate the zero-score line; changing the bias moves it without changing its direction. The line separates positive from negative scores. Section 21 uses it to explain which class boundaries this neuron can represent.</KeepInMind>
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
                  <p>The fitted plane has weights 3.00 and −1.50 and an intercept of 0.50, matching the combined calculation above. On this sampled surface its R² is 1.0 and its largest residual is 0.0. For the taller, heavier profile, the first neuron scores 1.5. Both the two-neuron chain and the combined neuron output 2.0.</p>
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
<p>The four activations on this page process one score at a time. If we apply one of them to a row of neuron scores, each output depends on its own score. It does not depend on the other scores in the row. This is called an elementwise operation, and it lets us place the activation inside each neuron in the diagram.</p>
                <p>During training, the SDK keeps the score alongside the output so it can evaluate the activation’s derivative at that score. Other implementations can store different intermediate values; the important requirement is being able to calculate the derivative used by the backward pass.</p>
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
              "Both input weights are zero and the bias stays at 0.5. What happens to the dashed line of zero score?",
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
              "A sequence of affine transformations combines into one weight matrix and one bias. Adding more such layers changes the parameterization but does not add nonlinear relationships. In this example, the combined rule has weights 3.00 and −1.50 and bias 0.50; the displayed plane fit reproduces its predictions to the reported precision.",
            ),
            trueFalse(
              "Inserting a nonlinear activation makes representations possible that a single affine transformation could not produce, without guaranteeing that a fitted network uses them.",
              true,
              "A nonlinear activation allows the composed network to produce relationships that one affine transformation cannot represent. The actual parameters still matter: some settings or restricted input regions give an affine result. Here the sigmoid chain outputs 0.9764 for the tall-heavy profile while the combined affine rule outputs 2.0. The full displayed surface shows how the relationship changes across inputs.",
            ),
        ],
        },
        {
          title: "Part 3. The Four Activation Functions",
          content: (
            <>
              <SubSection title="9. The identity">
                <p>Identity returns the score unchanged, with a slope of one everywhere. The taller, heavier profile outputs 1.5 and the shorter, heavier profile outputs −2.5. An output layer predicting a quantity such as body weight needs a way to produce values beyond zero and one. Identity permits that range, while sigmoid would constrain the output.</p>
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
                <p>Directly evaluating the written sigmoid formula can overflow when the score is strongly negative, because its exponential becomes too large for floating-point storage. The implementation uses an equivalent stable form.</p>
                <p>At the tested control limits, weights of ten and bias −10 give score −210 at the low-input corner and output 6.28 × 10⁻⁹². At the opposite corner, the score is 190 and the floating-point result rounds to one. The mathematical sigmoid remains strictly between zero and one for every finite score; numerical storage has finite precision.</p>
                <KeepInMind>
                  <p>{"A sigmoid turns a score into an output between zero and one. That range is useful for a binary probability, but the interpretation also depends on the model and its training objective. A bounded value is not automatically a dependable probability estimate. Section 20 develops that distinction; next we compare how the sigmoid and tanh pass a learning signal backward."}</p>
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The hyperbolic tangent">
                <p>Hyperbolic tangent, usually written tanh, maps scores into the interval from minus one to one and outputs zero when the score is zero. Unlike sigmoid, it can supply both negative and positive inputs to the next layer. That can help optimization in some networks, though it does not guarantee easier training. The taller, heavier profile outputs 0.9051 and the shorter, heavier profile outputs −0.9866.</p>
                <Equation>{"tanh(z) = 2·σ(2z) − 1"}</Equation>
                <WorkedExample title="Relating tanh to sigmoid for the taller, heavier profile">
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
                  The activation’s slope is one factor in the gradient passed backward. A small slope reduces that signal at this step. The weights and the rest of the network also affect the final parameter gradients, so activation choice alone does not determine whether training will work.</KeepInMind>
              </SubSection>

              <SubSection title="14. Deriving the four slopes">
                <p>Identity has slope one. ReLU has slope one for a positive score and zero for a negative score, with the zero-score convention stated earlier. The table derives sigmoid’s slope using the chain rule. Its final form can be calculated from the sigmoid output, so an implementation that saves that output can reuse it during the backward pass.</p>
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
                <WorkedExample title="Compare activation slopes for the two input profiles">
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
                  Compare the derivatives in the plot. Identity has slope one everywhere. ReLU has slope one on its positive side and zero on its negative side. The hyperbolic tangent reaches one at zero and becomes flatter farther away. Sigmoid peaks at one quarter and also becomes flatter. These slopes help us understand how an activation affects a passing gradient; the surrounding weights matter too.
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
                <p>Sigmoid and tanh approach fixed output limits as their scores become large in magnitude. Their curves then have small local derivatives: a change in score produces little change in output. This behavior is called saturation. During a backward pass, that small derivative reduces the gradient passing through this activation.</p>
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
                <p>At score 6, the sigmoid derivative is about 0.0025 and the tanh derivative about 0.000025. This page calls a response saturated when its derivative falls below one hundredth of that activation’s peak derivative.</p>
<p>The fitted neuron uses standardized height and weight, with coefficients about 2.55 and 1.29. The person measured at 120 centimeters and 25 kilograms receives score −7.38 and sigmoid derivative 0.000622. The person at 183 centimeters and 83 kilograms receives score 8.12 and the smallest derivative in this group, 0.000298.</p>
<p>Six of the twenty-five supplied profiles fall below the stated relative threshold. That diagnoses sensitivity at these inputs; it does not establish how the neuron responds to every possible profile.</p>
                <KeepInMind>

                  Saturation depends on the weighted score, including the bias. Large inputs or weights can push its magnitude into a region with a small activation derivative, although their contributions can also cancel. Standardizing inputs helps control their scale; it does not prevent saturation by itself.</KeepInMind>
              </SubSection>

              <SubSection title="17. Ten neurons in a chain">
                <p>
                  For this calculation, isolate the activation derivatives in a chain of ten sigmoid units. Each derivative is at most one quarter, so their product is largest when all ten scores are zero. The full network gradient also includes the intervening weights; we are examining the activation contribution on its own.
                </p>
                <Equation>
                  {"0.25¹⁰ = 9.537 × 10⁻⁷\n0.1491¹⁰ = 5.4 × 10⁻⁹"}
                </Equation>
                <p>
                  The product of ten sigmoid derivatives is under a millionth even at their maximum. At the example slope of 0.1491, the second calculation gives a still smaller product. Tanh can have derivative one near zero, while ReLU has derivative one throughout its positive side. These avoid this particular contraction where their derivatives are near one. But a network&apos;s gradient also passes through weights, and inactive ReLU units have zero derivative, so neither activation guarantees a healthy gradient through the whole network. Very small gradients can make learning slow without raising an error, as the{" "}
                  <Link href="/concepts/training-a-network" className={link}>
                    training page
                  </Link>{" "}
                  shows happening.
                </p>
                <KeepInMind>
                  A larger learning rate multiplies all parameter updates. It can increase a small update, but it does not fix unequal gradient shrinkage across layers and may make other updates unstable. Activation choice and the scale of the weights both need attention.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The rectifier&rsquo;s dead side">
                <p>ReLU has a zero derivative wherever its score is negative. For such an example, the loss sends no gradient through this activation to its weights or inputs. If a unit has a negative score for every training example, ordinary gradient updates from those examples cannot change its own weights or bias. This is called a dead ReLU.</p>
<p>That state can persist, but it is not necessarily permanent. In a hidden layer, earlier layers may change the inputs the unit receives. Optimizer state or regularization may also change its parameters. The failure to watch for is a unit that keeps producing zero and contributes no learning signal through its activation.</p>
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
<p>{"Floating-point rounding can make a sigmoid's calculated derivative exactly zero. After scaling the fitted neuron's three numbers by ten, the child of 120 centimeters has a score of −73.8. Its output is extremely close to zero, and the complement rounds to exactly 1. In the mirror case on the positive side, the output itself rounds to exactly 1, leaving a calculated derivative of 0. These are limits of the numerical representation, rather than flat regions in the exact sigmoid function."}</p>
                <p>At that scale, three supplied profiles have a calculated sigmoid derivative of exactly 0.0. The exact mathematical derivative is positive at every finite score; floating-point rounding can still make this implementation report zero.</p>
</>
                <KeepInMind>
                  A dead ReLU produces zero for every supplied training example, so those examples send no loss gradient through its activation. Initialization that suits the input scale and a suitable learning rate can reduce the risk. Leaky ReLU changes the activation itself by retaining a small nonzero slope for negative scores. None of these choices guarantees that every unit remains useful.</KeepInMind>
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

                  At a quarter of the fitted scale, no supplied profile meets this page’s saturation threshold. At twenty times that scale, almost all do. This experiment changes the parameters while keeping the inputs fixed. In a network, initialization should account for the number and scale of its inputs so that signals and gradients remain usable across layers.</KeepInMind>
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
  "Which conclusions are supported by this fitted-neuron diagnostic report?",
  [
    "The supplied child reading lies where sigmoid changes only weakly as its score changes",
    "Six observations have a local sigmoid slope below one hundredth of its maximum",
    "In exact real arithmetic, multiplying a finite score by ten makes its sigmoid derivative exactly zero",
    "Dividing the fitted coefficients by four preserves every observation's local sigmoid derivative"
  ],
  [0, 1],
  "The child's recorded derivative is small, and six slopes fall below the stated fraction of the sigmoid peak. Changing coefficient scale moves the points at which sigmoid is evaluated, so their local derivatives can change. The mathematical derivative is positive at every finite score; an exactly zero computed derivative in a highly scaled run reflects finite-precision arithmetic, not a new exact plateau in the mathematical function.",
  {
    "description": "These are recorded diagnostics for the course sigmoid implementation on the fixed twenty-five-person example, not a universal guarantee about floating-point sigmoid implementations.",
    "data": "Weights at the fitted scale: approximately 2.55 and 1.29\n120 cm, 25 kg example: score approximately -7.38; sigmoid derivative approximately 0.000622\nAt fitted scale: 6 of 25 derivatives are below 0.0025\nAfter multiplying all fitted coefficients by 10: at least one computed derivative is exactly zero\nAt one quarter of the fitted scale: the same six observations are not all below that flatness cutoff."
  },
),
            trueFalse(
              "Raising the learning rate reliably solves the small-gradient problem in a chain of ten sigmoid neurons.",
              false,
              "Each sigmoid derivative is at most one quarter, so multiplying ten contributes less than one millionth even when all ten scores are zero. This calculation isolates activation derivatives; a network also has weight factors and possibly other paths. A larger learning rate can increase the resulting update, but it does not change these derivatives. A rate large enough for one small gradient can make other updates unstable.",
            ),
            several(
  "Replace sigmoid with ReLU while keeping these fitted scores fixed. Which claims follow?",
  [
                  "12 of the 25 people land on the dead side, with an output and a slope of exactly 0",
                  "The other 13 pass through at a slope of exactly 1",
                  "With fixed inputs and these loss-gradient updates alone, a unit that scores negatively for every training row gets no update through ReLU",
                  "Some people sit between the two, with a slope between 0 and 1",
                ],
  [0, 1, 2],
  "For these nonzero scores, ReLU has derivative zero or one. A unit that is inactive on every fixed training input receives no loss gradient through those responses. Earlier-layer changes, other parameter updates or a different activation can change that situation in a larger model. Initialization and the learning rate affect the risk; a small positive bias is not a universal guarantee against dead units.",
  {
    "description": "Use ReLU(z)=max(0,z), with derivative zero for negative scores and one for positive scores. No independent weight decay, noise or reinitialization is applied.",
    "data": "Among 25 observations, 12 scores are negative and 13 are positive; none is zero.\nFor the dead-unit statement, assume all inputs reaching that unit have negative scores and weights are updated only through its local ReLU gradient."
  },
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
                  crowd, with standardized height and weight as its two
                  features, and it settles on a coefficient of 2.5537 for
                  height, 1.2944 for weight and an intercept of 0.1396,
                  after 7527 passes of the gradient climb. Hand those three
                  numbers to one neuron as its two weights and its bias,
                  choose the sigmoid, and show it the same people.
                </p>
                <LogisticTwinChart />
                <InAModel title="Both routes on the whole crowd">
                  <p>

                    The child of 147 centimeters and 41 kilograms scores
                    −1.5321, and the model&rsquo;s probability of adulthood
                    is 0.177694 while the neuron&rsquo;s output is 0.177694.
                    The adult of 156 centimeters and 53 kilograms scores
                    1.0151 and both routes answer 0.734019. Over all
                    twenty-five people the largest gap between the two is
                    1.1 × 10⁻¹⁶, which is one rounding of a double, and
                    the button in the box at the top of the page loads the
                    same three numbers so you can drag the probe over the
                    crowd yourself.
                  </p>
                </InAModel>
                <KeepInMind>
                  A sigmoid neuron with these parameters performs the same forward calculation as the fitted logistic regression model. Training the parameters under a logistic objective gives that calculation its classification interpretation. The dense-layers page connects several neurons so later ones can combine their outputs.</KeepInMind>
              </SubSection>

              <SubSection title="21. What one neuron cannot do">
                <>
<p>For nonzero weights, the zero-score boundary is a straight line. The fitted neuron classifies 17 of the 25 supplied people correctly, an accuracy of 0.68. The eight errors are ringed dark in the map. Nearby children and adults can have similar height and weight, so moving the line to correct one example may misclassify another. This particular fit illustrates the limitation; its score alone does not prove the best accuracy attainable by every straight-line classifier.</p>
                <p>Changing the activation among the monotone functions used here does not create a curved classification boundary. To represent a more complex region, the network needs to combine several responses.</p>
</>
                <WhyThisWorks title="Why these monotone activations cannot solve exclusive-or">
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
                    This argument assumes that raising the score never lowers
                    the output. Such an activation is called monotone
                    nondecreasing. Identity, ReLU, sigmoid and tanh all have
                    that property. An activation that rises and then falls
                    would need a different argument; the claim is about these
                    monotone activations followed by one output threshold.
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
                  With these monotone activations and one output threshold, a single neuron produces a straight-line class boundary when its weights are nonzero. The exclusive-or argument shows why some label patterns require a combination of neurons. The crowd example shows the errors made by one fitted boundary, rather than a proof of the best possible fit.</KeepInMind>
              </SubSection>

              <SubSection title="22. Why softmax is not on the list">
                <p>The <Link href="/concepts/multiclass-classification" className={link}>multiclass page</Link> uses softmax to turn a row of class scores into a row of values that sum to one. Each value depends on all the scores, because they share a denominator. That differs from the scalar activations here, which process one score at a time.</p>
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
                <p>A scalar activation cannot perform that normalization from one score alone. This SDK therefore applies softmax where the full score vector is available, alongside the multiclass loss. Softmax can also be used elsewhere in a network, such as in attention; it is outside this playground’s scalar neuron interface.</p>
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
          title: "Part 7. Specifying the Inputs and Activation Before Using a Neuron", id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="23. The neuron needs an input shape, an activation and a parameter state" id="23-what-a-complete-implementation-states">
                <p>
                  Start with the three components we introduced: weights, a bias
                  and an activation function. Each input needs its matching weight,
                  so their count and order must agree. The SDK requires at least one
                  input. The bias supplies the part of the score that does not depend
                  on an input value.
                </p>
                <p>
                  The activation also needs a derivative for training. Keep the
                  function and its derivative together, including the chosen slope
                  at ReLU&rsquo;s corner. Calculate sigmoid in a numerically stable
                  form and state the activation&rsquo;s output range.
                </p>
                <p>
                  Retain the score as well as the output when the backward operation
                  needs it. When connecting neurons, remember that a chain containing
                  only affine operations is still one affine rule. Softmax needs a
                  vector of scores because each output depends on the other scores.
                </p>
              </SubSection>

              <SubSection title="24. Failure contracts">
                <p>The rows below compare two validation layers. The playground checks its own request limits before creating a neuron. A direct SDK call can accept some configurations outside those page limits, so the table identifies which layer accepts or rejects each case.</p>
                <DerivationTable
                  expressionHeading="Inputs, weights or activation"
                  reasonHeading="What the neuron can compute"
                  rows={[
                    { expression: "a neuron with no weights", reason: "refused by the SDK, which requires at least one input; the playground additionally requires exactly two weights for its two input axes." },
                    { expression: "a neuron with one weight", reason: "accepted, and it is the logistic page’s single-input model; the playground’s request asks for two because its plane has two axes." },
                    { expression: "a non-finite weight or bias", reason: "refused in words, and it cannot be written in a request at all, since JSON has no way to spell infinity or a non-number." },
                    { expression: "a row of the wrong length", reason: "refused; the weight count is the input width, and three values against two weights is named as a length mismatch." },
                    { expression: "an empty row, or a non-finite or non-numeric value in it", reason: "refused, each by the same guard every column passes through." },
                    { expression: "integers, or booleans, as inputs", reason: "accepted and converted to floating point, so true reads as 1 and false as 0. Validate input types separately if that conversion is inappropriate for the application." },
                    { expression: "one person", reason: "answered; a neuron responds to a row and has no notion of a dataset, so one row is the ordinary case." },
                    { expression: "both weights zero, a constant column", reason: "accepted; with the displayed bias of 0.5, every input has the same nonzero score, so the plot has no zero-score line." },
                    { expression: "a weight or probe beyond 10, or a lattice finer than 41 cells", reason: "refused at the door as a request larger than the page allows, with the limit named." },
                    { expression: "unfitted use", reason: "nothing to refuse; a neuron is built complete from its three numbers and has no fit of its own. Fitting is the training page’s job." },
                    { expression: "mismatched feature names", reason: "not detectable from shape alone; weights match inputs by position, so callers must keep feature order consistent." },
                    { expression: "softmax requested as an activation function", reason: "refused by this scalar activation interface; softmax needs the whole vector of scores." },
                    { expression: "the rectifier at a score of exactly zero", reason: "slope 0 by convention, the negative side’s answer; the curve’s middle sample reports it." },
                    { expression: "a score of −210 under the sigmoid", reason: "6.28 × 10⁻⁹², with no overflow and no warning, because the sigmoid is computed in its stable form." },
                    { expression: "a score of 190 under the sigmoid", reason: "exactly 1, with a calculated derivative of exactly 0 because of floating-point rounding." },
                    { expression: "a lattice window that does not open upward", reason: "refused in words, naming which input’s low edge is not below its high edge." },
                  ]}
                />
                <p>Two accepted inputs need particular care. Boolean values are converted to ones and zeros; callers who need strictly numeric measurements must check their types before passing them in. Feature order is a separate issue: swapping height and body weight leaves the row width unchanged, so a shape check cannot detect the mistake. The caller must preserve the meaning of each input position. The dense-layers page checks widths when connecting several neurons.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            trueFalse(
  "Give a sigmoid neuron the same ordered inputs, coefficients and intercept as a binary logistic regression model. In exact arithmetic, the two produce the same probabilities.",
  true,
  "Both calculations multiply the same ordered inputs by the same coefficients, add the bias, and apply sigmoid. Their probabilities therefore agree in exact arithmetic. The tiny gap reported here comes from floating-point evaluation. With only one input, the same correspondence uses one weight.",
  {
    "description": "Both use the same sigmoid function.",
    "data": "Logistic probability = sigmoid(w @ x + b)\nNeuron output = sigmoid(w @ x + b)\nInput preparation and coefficient order are identical."
  },
),
            choice(
  "Why can this fitted single affine neuron still miss people despite a long completed optimization run?",
  [
                  "They lie in the crowd’s tangled middle, which does not sort along any straight line",
                  "The sigmoid saturates on those eight and passes nothing back",
                  "The climb stopped at 7527 passes, before those eight were fitted",
                  "Their height and weight were not standardized with the rest",
                ],
  0,
  "This fitted neuron has nonzero input weights, so its threshold boundary is a straight line in the height-weight plane. The labels in the middle are mixed in a way that one such line cannot separate. The measured fit gets 17 of the 25 labels right. The issue is the permitted boundary shape, rather than a guarantee that every zero-weight configuration has a line to draw.",
  {
    "description": "Interpret the stated geometry and completed run.",
    "data": "The twenty-five-person dataset contains a tangled middle that no straight boundary separates perfectly.\nThe inputs are consistently standardised.\nThe completed sigmoid fit correctly labels 17 of 25.\nThe eight remaining errors occur in that inseparable middle."
  },
),
            trueFalse(
              "Replacing sigmoid with another monotone activation, one whose output never falls when its score rises, lets one affine-score neuron solve exclusive-or using one output threshold.",
              false,
              "The two yes corners and the two no corners have the same total affine score. They cannot put all yes scores above one score threshold and all no scores below it. A monotone activation followed by a threshold preserves that limitation. This does not rule out an arbitrary nonmonotone activation. Composing several ordinary neurons is the route the next lesson develops.",
            ),
            choice(
              "Three neurons scoring 2, 1 and 0.1 come out of softmax at 0.6590, 0.2424 and 0.0986. Only the third score moves, to 5. What happens to the first neuron’s answer?",
              [
                "It falls by a factor of 14.1, to 0.0466, although nothing about that neuron changed",
                "It stays at 0.6590, since its own score did not move",
                "It rises, because the row still has to sum to one",
                "It is undefined until the row is renormalized",
              ],
              0,
              "Every output shares one denominator and the three compete for a fixed total of one. No function of a single number can do that, and no single neuron can hold it, since a neuron has no neighbors to normalize against. That is why softmax belongs to an output layer rather than to the list of activations a neuron may own.",
            ),
            trueFalse(
  "Under this input contract, swapping height and weight changes the score without triggering a width error.",
  true,
  "The input width check counts values; it cannot identify what they measure. A correctly sized row is paired with the weights by position, so reversing height and weight changes the calculation without causing a width error. Boolean inputs can also be converted to zeros and ones. Keep the feature order and intended data types explicit when preparing a row.",
  {
    "description": "The input array contains two ordered standardized coordinates; the width check does not inspect field names.",
    "data": "Expected input: [height, weight] = [1,2]\nSwapped input: [2,1]\nWeights: [2,-1]\nBias: 0.5"
  },
),
        ],
        },
        {
          title: "Practice. Building the Neuron With the Library",
          practice: [
            exercise(
              "Apply the neuron to two height and weight profiles",
              ["The workshop combined two light readings. Here the two inputs are standardized height and weight profiles, using the neuron from the lesson. Keep its weights and bias fixed while trying each of the four activation objects.","For both supplied people, print the neuron's score and output to four decimal places under every activation. The score is the weighted sum with its bias; the activation reads that score. There is no training in this challenge."],
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
              { hints: ["A neuron is built complete from its weights as a list, its bias and an activation object. There is nothing to fit, so it answers straight away.", "respond_to takes one row, a list with one value per weight, and answers an object carrying both of the neuron’s numbers as score and output.", "The score is computed before the activation is applied, so it is the same number on all four lines. If it moves, the activation has been put in the wrong place."], check: numberCheck("What does the sigmoid neuron answer for the short heavy person, to four places?", 0.0759, 0.0005, "The sigmoid maps the short-heavy profile’s negative score to a small positive output. Changing the activation changes that output while leaving the weights, bias and score fixed. These are two standardized feature values, rather than raw centimeters and kilograms."), question: "What changes when the same weighted sum uses a different activation?" },
            ),
            exercise(
              "Read the slope a gradient is multiplied by",
              ["The previous challenge compared activation outputs. Now inspect the local derivative, which describes how much the output changes for a small change in score. Call of and derivative_at on the supplied score array for each activation.","Print both outputs and derivatives to four decimal places. Then raise each sigmoid derivative to the tenth power and print that activation-only factor in scientific notation. This isolates ten identical activation derivatives; a full network gradient also includes weights and other paths."],
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
              { hints: ["of and derivative_at each take a numpy array of scores and answer an array of the same shape, so both worked scores go in together and come back as a pair.", "A chain multiplies the gradient by one slope per neuron, so ten neurons at one score keep that slope to the tenth power. Python’s ** raises to a power, and a format of .2e prints the result in scientific notation."], check: numberCheck("What slope does the sigmoid report at a score of 1.5, to four places?", 0.1491, 0.0005, "The derivative is positive at this score, but smaller than one. Repeated multiplication of such local derivatives can reduce a backward signal substantially. The sigmoid derivative can be expressed using its output; whether an implementation caches that output or recomputes it is a separate choice."), question: "How much of a backward signal can each activation pass at these scores?" },
            ),
            exercise(
              "Build the logistic twin",
              ["A logistic model combines standardized height and weight with learned coefficients. Fit the supplied model, then build a sigmoid Neuron using its two coefficients in height-then-weight order and its intercept as the bias.","Print the fitted coefficients and training metadata. Send the same transformed rows through both routes, printing the first person's score and probability, the largest probability difference over the crowd, and classification accuracy. Keep the fitted standardization reference unchanged."],
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
              { hints: ["A fitted model’s coefficients can be read by name, as model.coefficients[\"height\"], and its intercept and epochs_run are properties. All three raise rather than answer before fit.", "The neuron’s weights go in as a list in the order the fit saw the columns, height then weight, with the intercept as its bias. The rows are standardized, since that is what the model was fitted on.", "predict_probability answers one probability per row; its values property is the plain array, which lines up with the rows by position for a zip."], check: numberCheck("What coefficient does the fit put on standardized height, to four places?", 2.5537, 0.0005, "The neuron and logistic model apply the same score-to-probability calculation when their feature order, standardization, coefficients and bias match. Agreement here checks that correspondence; it does not establish predictive accuracy on people excluded from fitting."), question: "Can one sigmoid neuron reproduce the fitted model’s probabilities?" },
            ),
            exercise(
              "Take a census of the flat and the dead",
              ["Reuse the fitted score rule in three configurations: ReLU, the original sigmoid, and a sigmoid with both weights and the bias multiplied by ten. For each configuration, evaluate the local derivative at every supplied person's score.","Print the count of exactly zero derivatives, the count below one hundredth of that activation's peak derivative, and the smallest derivative. These counts describe the supplied profiles; they do not establish that a neuron is permanently inactive for every possible input."],
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
              { hints: ["Collect scores with respond_to, then pass their NumPy array to derivative_at. Apply the derivative to scores rather than to already activated outputs.","Multiplying every weight and the bias by the same positive amount preserves the zero-score boundary while changing the scores' magnitudes.","Summing a Boolean array counts its true entries. The small-derivative count includes any exactly zero derivatives too."], check: numberCheck("For how many of the twenty-five profiles does ReLU have a zero local derivative?", 12, 0.5, "For these supplied profiles, twelve ReLU scores fall on the inactive side and therefore have zero local derivative. The others have derivative one. That is an observation about this batch at the current parameters; other inputs or changed upstream representations can behave differently."), question: "Which supplied profiles receive a zero or very small activation derivative?" },
            ),
          ],
        },
      ]}
    />
  );
}
