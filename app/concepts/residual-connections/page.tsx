import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, SubSection, WorkedExample } from "@/components/concept/Treatments";
import { ResidualExplorer } from "@/components/widgets/NetworkBuildingBlocks";

export const metadata: Metadata = { title: "Residual Connections · oop_ml", description: "A new layer may only need to improve a representation we already have. A residual connection carries the input forward so the layer can learn a correction rather than having to recreate the entire representation." };

export default function ResidualConnectionsPage() {
  return <ConceptPage
      lessonId="residual-connections"
      intuition={lessonIntuitions["residual-connections"]} title="Residual Connections" tagline={"A new layer may only need to improve a representation we already have. A residual connection carries the input forward so the layer can learn a correction rather than having to recreate the entire representation."}
    openingTitle="Do We Need to Rebuild a Useful Representation?"
    technicalStart="Part 2. The Two Routes Through the Calculation"
    prerequisites={<>Read <Link href="/concepts/dense-layers">dense layers</Link> for forward transformations and <Link href="/concepts/backpropagation">backpropagation</Link> for derivatives through a network.</>}

    playgroundIntro="Set the branch weight to zero to see the shortcut preserve the input. Then change the weight and follow both the output calculation and its derivative. Try a negative weight to see why a shortcut is not a guarantee against gradient cancellation."
    playground={<ResidualExplorer />}
    sections={[
      { title: "Part 1. Learn an Adjustment", defaultOpen: true, content: <>
        <SubSection title="1. Keep the input available">
          <p>Call the original input x and the branch&apos;s transformation F. The residual output is their sum:</p>
          <Equation>{`y = x + F(x)`}</Equation>
          <p>The branch can increase, decrease, or otherwise modify coordinates. It is not limited to making a small change. &quot;Residual&quot; describes how we express the desired result relative to the input, not a constraint on the branch&apos;s magnitude.</p>
        </SubSection>
        <WorkedExample title="An adjustment to one value">
          <p>The playground uses a one-neuron branch with tanh activation and zero bias. At the default input and weight:</p>
          <Equation>{`Input = 1\nBranch weight = 0.5\nF(1) = tanh(0.5 × 1) ≈ 0.4621\nResidual output = 1 + 0.4621 ≈ 1.4621`}</Equation>
          <p>The input contributes directly as well as influencing the branch. The result is therefore different from simply sending the input through that neuron.</p>
        </WorkedExample>
        <SubSection title="2. Match the arrangements before adding">
          <p>Each input coordinate must have a corresponding branch-output coordinate. A residual addition therefore requires the same shape on both routes. A flattened image and a two-dimensional image can hold the same number of values without having the same arrangement.</p>
          <p>The SDK checks exact input and output shapes when constructing the wrapper. It does not silently reshape them or learn a projection on the shortcut. Larger architectures can introduce such projections explicitly when dimensions change.</p>
        </SubSection>
      </> },
      { title: "Part 2. The Two Routes Through the Calculation", content: <>
        <SubSection title="3. Add both input derivatives">
          <p>Training moves every weight by the slope of the loss with respect to it, and that slope reaches a weight only by travelling back down through every layer above it. A plain layer hands the slope on through its own derivative, which for a tanh neuron is never larger than the size of its weight, and in the playground&rsquo;s branch at the default setting it is 0.3932. The shortcut was added for what it does on this way back, so the second route has to be followed as carefully as the first.</p>
          <p>A change to the input affects the result through the branch and through the shortcut. Backpropagation must include both contributions. For a scalar input:</p>
          <Equation>{`dy/dx = 1 + F′(x)\n\nFor F(x) = tanh(w x):\nF′(x) = w × (1 − tanh²(w x))\n\nAt x = 1 and w = 0.5:\nF′(1) ≈ 0.5 × (1 − 0.4621²) ≈ 0.3932\ndy/dx ≈ 1 + 0.3932 = 1.3932`}</Equation>
          <WorkedExample title="Both routes, measured on the playground branch">
            <p>Send a slope of one back into the playground&rsquo;s branch on its own and it hands down 0.3932, the branch derivative above. Wrap the same branch in the shortcut, send the same slope of one, and what arrives at the input is 1.3932.</p>
            <Equation>{`slope handed down by the branch alone        ≈ 0.3932\nslope handed down by branch and shortcut   ≈ 1 + 0.3932 = 1.3932`}</Equation>
            <p>The difference between the two is exactly the one the shortcut contributes. Nothing about the branch changed between the two measurements, which is the point of the wrapper. It leaves the branch as it was and adds a route beside it.</p>
          </WorkedExample>
          <p>The shortcut contributes a derivative of one. It provides a direct route around the branch&apos;s transformations. For vectors, the corresponding expression uses the identity matrix and the branch&apos;s Jacobian.</p>
        </SubSection>
        <SubSection title="4. Keep parameter learning inside the branch">
          <p>The direct shortcut has no parameters. Its gradient contribution concerns the input. The branch still calculates the derivatives of its own weights and biases, just as it would without the wrapper.</p>
          <Equation>{`input_gradient = arriving_gradient + branch_input_gradient\nparameter_gradient = branch_parameter_gradient`}</Equation>
          <WorkedExample title="The weight’s own slope, with and without the shortcut">
            <p>The playground&rsquo;s branch has one weight. Moving that weight moves the branch output through the tanh, and the shortcut takes no part, because the shortcut carries the input and the input does not depend on the weight. With a slope of one arriving at the output, the weight&rsquo;s slope therefore comes out the same whichever way the branch is wrapped.</p>
            <Equation>{`dy/dw = x × (1 − tanh²(w x))\n\nAt x = 1 and w = 0.5, with the tanh taken at full precision:\ndy/dw = 1 × (1 − tanh²(0.5)) ≈ 0.7864\n\nweight slope, branch alone          ≈ 0.7864\nweight slope, branch and shortcut   ≈ 0.7864`}</Equation>
            <p>So a training step moves the branch&rsquo;s weight by the same amount with the shortcut as without it. What the shortcut changes is what the layers beneath receive, 1.3932 in the previous step against 0.3932, and in a deep chain that difference is the whole story, which Part 3 measures.</p>
          </WorkedExample>
          <p>The implementation returns the branch&apos;s parameter gradient and rebuilds the wrapper around the updated branch after a training step. The forward response retains the branch response, so its backward calculation uses the values from the same pass.</p>
        </SubSection>
      </> },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "Calling the connection residual means the branch is restricted to making a small change.",
              false,
              "The branch can increase, decrease, or otherwise modify coordinates and is not limited in magnitude. The word describes how the desired result is expressed relative to the input, which is a choice about the form of the calculation rather than a constraint on the branch.",
            ),
            choice(
              "The playground branch answers about 0.4621 at an input of one and a branch weight of 0.5. What is the residual output?",
              [
                "About 1.4621",
                "About 0.4621",
                "About 0.5",
                "About 1.0",
              ],
              0,
              "The output is the input plus the transformation, so the input contributes directly as well as influencing the branch. That is what makes the result different from simply sending the input through that neuron.",
            ),
            several(
              "Which of these hold about matching the two routes?",
              [
                "A residual addition requires the same shape on both routes",
                "The SDK checks exact input and output shapes when the wrapper is constructed",
                "A flattened image and a two-dimensional image can hold the same number of values without having the same arrangement",
                "The wrapper learns a projection on the shortcut when the dimensions differ",
              ],
              [0, 1, 2],
              "Each input coordinate needs a corresponding branch-output coordinate, so an equal count of values is not enough and the arrangement has to agree too. The SDK neither reshapes silently nor learns a projection; larger architectures introduce such projections explicitly when dimensions change.",
            ),
            choice(
              "At an input of one and a branch weight of 0.5, what is the derivative of the residual output with respect to the input?",
              [
                "About 1.3932",
                "About 0.3932",
                "Exactly 1, from the shortcut",
                "About 1.4621",
              ],
              0,
              "A change to the input reaches the result through the branch and through the shortcut, and backpropagation includes both contributions. The shortcut contributes exactly one, 0.3932 is the branch's contribution on its own, and 1.4621 is the forward output rather than a derivative.",
            ),
            trueFalse(
              "With a slope of one arriving at the output, the playground branch’s weight comes back with the same slope, 0.7864, whether or not the branch is wrapped in the shortcut.",
              true,
              "The shortcut carries the input, and the input does not depend on the weight, so moving the weight moves the result through the branch alone and the shortcut takes no part. What the wrapper changes is what the layers beneath receive, 1.3932 against 0.3932, not how the branch’s own parameters are corrected. The direct shortcut has no parameters of its own, and the implementation rebuilds the wrapper around the updated branch after a training step.",
            ),
        ],
        },
      { title: "Part 3. Why Deep Networks Use Shortcuts", content: <>
        <p>A long chain asks its derivative to pass through every transformation. Residual connections introduce additional routes through the chain and make it straightforward for a block to preserve its input. This helps explain their usefulness in deep networks, including image models and transformers.</p>
        <p>The failure the shortcut repairs is a product. On the way back, the slope arriving at the top of a chain is multiplied at each plain layer by that layer&rsquo;s own derivative, and a product of many factors each smaller than one is very small. The bottom of such a chain receives almost no slope, learns almost nothing, and reports no error, because the loss at the top still falls while the layers nearer the top do the learning. A shortcut turns the factor at each block into a sum, one plus the branch&rsquo;s derivative, and a chain of such sums has a route from the top to the bottom along which nothing is multiplied by any weight at all.</p>
        <WorkedExample title="The playground neuron, stacked thirty deep">
          <p>Take the playground&rsquo;s branch at its default weight of 0.5, stack copies of it so that each reads what the one before answered, and hand the chain an input of one. The derivative at the bottom of the plain chain is one factor per layer multiplied together, and each factor is a tanh slope times 0.5, so no factor exceeds a half. In the residual chain each block adds its input back, so each factor is one plus a branch derivative instead.</p>
          <Equation>{`depth    plain chain dy/dx     residual chain dy/dx\n  1      0.3932                 1.3932\n  2      0.1865                 1.8188\n  5      0.0229                 2.5053\n 10      0.0007                 2.5763\n 30      6.8 × 10⁻¹⁰            2.5768`}</Equation>
          <p>Thirty plain layers hand the bottom layer less than a billionth of the slope that arrived at the top, so it is barely trained however long the run goes on, and nothing in the loss says so. Thirty residual layers hand it 2.5768. The residual chain&rsquo;s output has grown as well, to 29.68, since once the branch&rsquo;s tanh saturates each block adds almost exactly one to what it read. The branch&rsquo;s derivative there is near zero, so each block passes the slope through at almost exactly one, which is why the residual figure stops moving after about ten layers.</p>
        </WorkedExample>
        <p>Read forward, the same addition says that a block whose branch has learned nothing yet is harmless. At a branch weight of zero the playground&rsquo;s output is its input, where a plain neuron at a weight of zero answers zero whatever it was given. A network can therefore be made deeper without first being made worse, which is the observation the residual formulation was introduced to explain.</p>
        <KeepInMind><p>The complete derivative is a sum. A negative branch derivative can cancel the shortcut&apos;s contribution, and repeated residual blocks can still amplify or reduce gradients. A shortcut improves the structure of the learning problem; it does not promise that every gradient or every training run will behave well.</p><p>The playground can show the cancellation, though not at every input. At an input of one the branch derivative never falls below −0.4477, which it reaches at a weight of about −0.77, so the combined derivative never falls below 0.5523 there. At an input of zero the branch derivative is simply the weight, so a weight of −1 gives a combined derivative of exactly 0 and a weight of −2 gives −1, a branch pulling against its own shortcut.</p></KeepInMind>
        <p>The residual formulation is developed in <a href="https://arxiv.org/abs/1512.03385">Deep Residual Learning for Image Recognition</a>. The skip connections on the <Link href="/concepts/u-net">U-Net</Link> page serve a related purpose of preserving information, but that model concatenates selected feature maps rather than applying this elementwise addition.</p>
      </> },
        {
          title: "Questions on Part 3",
          quiz: [
            choice(
              "Why can a shortcut fail to protect a gradient?",
              [
                "The complete derivative is a sum, so a negative branch derivative can cancel the shortcut's contribution",
                "The shortcut contributes a derivative smaller than one",
                "The branch gradient replaces the shortcut's rather than adding to it",
                "The shortcut is dropped once the branch has parameters",
              ],
              0,
              "The shortcut contributes a derivative of one, but the branch contributes alongside it and the two add, so a negative branch derivative can cancel it. At an input of zero the branch derivative is the weight itself, and a weight of −1 in the playground gives a combined derivative of exactly 0. Repeated residual blocks can still amplify or reduce gradients.",
            ),
            trueFalse(
              "Thirty plain copies of the playground’s neuron at its default weight hand the bottom of the chain less than a billionth of the slope that arrived at the top, where thirty residual copies hand it 2.5768.",
              true,
              "Each plain layer multiplies the slope by a tanh slope times 0.5, so thirty of them multiply it by thirty factors each below a half, and the measured figure is 6.8 × 10⁻¹⁰. Each residual block adds one to its branch’s derivative instead, and once the branch saturates it passes the slope through at almost exactly one, which is why the residual figure settles at 2.5768 after about ten layers.",
            ),
            trueFalse(
              "The skip connections on the U-Net page are the same elementwise addition as a residual connection.",
              false,
              "They serve a related purpose of preserving information, but that model concatenates selected feature maps rather than adding them coordinate by coordinate. Concatenation keeps both sets of values side by side, where this addition requires the shapes to agree so the values can be summed.",
            ),
            choice(
              "What does a residual connection change about a long chain?",
              [
                "It introduces additional routes through the chain and makes it straightforward for a block to preserve its input",
                "It shortens the chain the derivative has to pass through",
                "It removes the need for the branch to calculate its own derivatives",
                "It guarantees that every training run behaves well",
              ],
              0,
              "A long chain asks its derivative to pass through every transformation, and the shortcut adds a route around each branch. A block whose branch has learned nothing yet answers its input, so a network can be made deeper without first being made worse. A shortcut improves the structure of the learning problem; it does not promise that every gradient or every training run will behave well.",
            ),
            choice(
              "At an input of zero, which branch weight makes the combined derivative exactly zero?",
              ["−1", "−0.5", "0", "−2"],
              0,
              "At an input of zero the tanh sits at its steepest, so the branch derivative is simply the weight and the combined derivative is one plus the weight. A weight of −0.5 leaves 0.5, a weight of 0 leaves the shortcut’s one, and a weight of −2 gives −1, a branch pulling against its own shortcut. At an input of one no weight in the playground’s range cancels the shortcut, since the combined derivative never falls below 0.5523 there.",
            ),
        ],
        },
        {
          title: "Practice. Following Both Routes With the Library",
          practice: [
            exercise(
              "Follow both routes at the playground’s default",
              ["Build the playground’s branch, one neuron with a weight of 0.5, a bias of zero and a tanh activation, wrap it in a residual connection, and hand both the branch on its own and the wrapped block an input of one. Read the branch output and the residual output off the two responses.", "Then send a slope of one back into each and print what arrives at the input. Part 2 arrived at 0.3932 through the branch alone and 1.3932 through branch and shortcut together, and the difference between the two should be exactly the one the shortcut contributes."],
              `import numpy as np
from oop_ml import DenseLayer, HyperbolicTangent, Neuron, Residual

branch = DenseLayer([Neuron([0.5], 0.0, HyperbolicTangent())])
block = Residual(branch)
inputs = np.array([[1.0]])

# Ask the branch and the block to respond to the input, print the branch
# output and the residual output, then send a slope of one back into each
# with correction_for and print what each passes down to the input.`,
              `import numpy as np
from oop_ml import DenseLayer, HyperbolicTangent, Neuron, Residual

branch = DenseLayer([Neuron([0.5], 0.0, HyperbolicTangent())])
block = Residual(branch)
inputs = np.array([[1.0]])

branch_response = branch.respond_to(inputs)
response = block.respond_to(inputs)
print(f"branch output {branch_response.outputs[0, 0]:.4f}")
print(f"residual output {response.outputs[0, 0]:.4f}")

arriving = np.ones_like(response.outputs)
branch_slope = branch.correction_for(branch_response, arriving).passed_down[0, 0]
slope = block.correction_for(response, arriving).passed_down[0, 0]
print(f"slope through the branch alone {branch_slope:.4f}")
print(f"slope through branch and shortcut {slope:.4f}")`,
              `branch output 0.4621
residual output 1.4621
slope through the branch alone 0.3932
slope through branch and shortcut 1.3932`,
              { hints: ["A layer answers through respond_to, which takes a block with one row per example, so a single input of one goes in as a one by one array.", "The response carries outputs, and the first row’s first entry is the one number this block answers with.", "correction_for takes the response the layer produced and the slope arriving at its outputs, and what it hands down to the input is passed_down. A block of ones the same shape as the outputs is the slope of one."], check: numberCheck("What slope arrives at the input through branch and shortcut together?", 1.3932, 0.0005, "The branch alone hands down 0.3932, its weight times the slope of the tanh at 0.5, and the shortcut hands down the arriving slope of one unchanged. The two routes add, and nothing about the branch changed between the two measurements.") },
            ),
            exercise(
              "Look for the weight that cancels the shortcut",
              ["Part 3 says a negative branch derivative can cancel the shortcut’s contribution, and that the playground cannot show it at every input. Build the block at several settings and print the output and the combined derivative at each, at an input of one with weights 0.5, −0.5, −0.77 and −2, and at an input of zero with weights −1 and −2.", "At an input of one the combined derivative should never fall below about 0.55, however negative the weight. At an input of zero the branch derivative is simply the weight, so a weight of −1 should give exactly zero and a weight of −2 should turn the derivative negative."],
              `import numpy as np
from oop_ml import DenseLayer, HyperbolicTangent, Neuron, Residual

settings = [(1.0, 0.5), (1.0, -0.5), (1.0, -0.77), (1.0, -2.0), (0.0, -1.0), (0.0, -2.0)]
for value, weight in settings:
    # Build a residual block around a one-neuron tanh branch with this weight,
    # respond to the input, send a slope of one back, and print the input,
    # the weight, the output and the slope passed down, to four places.
    pass`,
              `import numpy as np
from oop_ml import DenseLayer, HyperbolicTangent, Neuron, Residual

settings = [(1.0, 0.5), (1.0, -0.5), (1.0, -0.77), (1.0, -2.0), (0.0, -1.0), (0.0, -2.0)]
for value, weight in settings:
    block = Residual(DenseLayer([Neuron([weight], 0.0, HyperbolicTangent())]))
    response = block.respond_to(np.array([[value]]))
    correction = block.correction_for(response, np.ones_like(response.outputs))
    print(
        f"input {value:+.2f} weight {weight:+.2f}: "
        f"output {response.outputs[0, 0]:+.4f} slope {correction.passed_down[0, 0]:+.4f}"
    )`,
              `input +1.00 weight +0.50: output +1.4621 slope +1.3932
input +1.00 weight -0.50: output +0.5379 slope +0.6068
input +1.00 weight -0.77: output +0.3531 slope +0.5523
input +1.00 weight -2.00: output +0.0360 slope +0.8587
input +0.00 weight -1.00: output +0.0000 slope +0.0000
input +0.00 weight -2.00: output +0.0000 slope -1.0000`,
              { hints: ["The branch is rebuilt inside the loop, since a neuron’s weight is fixed when it is constructed.", "The combined derivative is one plus the branch derivative, and the branch derivative is the weight times one minus the square of the tanh, which at an input of zero is the weight itself.", "A plus sign in the format, as in {slope:+.4f}, prints the sign of every number, which is what makes the negative derivative at an input of zero and a weight of −2 stand out."], check: numberCheck("What is the combined derivative at an input of one and a branch weight of −0.5?", 0.6068, 0.0005, "The branch derivative there is −0.5 times one minus the square of tanh(−0.5), which is −0.3932, and the shortcut adds one, leaving 0.6068. At an input of one the tanh is never steep enough for any weight in the playground’s range to cancel the shortcut, and the lowest the combined derivative reaches is 0.5523, at a weight of about −0.77.") },
            ),
            exercise(
              "Read the weight’s own slope with and without the shortcut",
              ["Part 2 says the shortcut has no parameters and leaves the branch’s own gradient exactly as it was. Check it. Send a slope of one back into the branch alone and into the wrapped block, and read the slope on the branch’s weight and on its bias from each correction’s gradient.", "The two weight slopes should agree to every printed digit, as should the two bias slopes, because the shortcut carries the input and the input does not depend on either parameter."],
              `import numpy as np
from oop_ml import DenseLayer, HyperbolicTangent, Neuron, Residual

branch = DenseLayer([Neuron([0.5], 0.0, HyperbolicTangent())])
block = Residual(branch)
inputs = np.array([[1.0]])

branch_response = branch.respond_to(inputs)
response = block.respond_to(inputs)
arriving = np.ones_like(response.outputs)
# Take the gradient from each correction and print the weight slope and the
# bias slope it holds, for the branch alone and for the wrapped block.`,
              `import numpy as np
from oop_ml import DenseLayer, HyperbolicTangent, Neuron, Residual

branch = DenseLayer([Neuron([0.5], 0.0, HyperbolicTangent())])
block = Residual(branch)
inputs = np.array([[1.0]])

branch_response = branch.respond_to(inputs)
response = block.respond_to(inputs)
arriving = np.ones_like(response.outputs)
alone = branch.correction_for(branch_response, arriving).gradient
wrapped = block.correction_for(response, arriving).gradient

print(f"weight slope, branch alone {alone.weights[0, 0]:.4f}")
print(f"weight slope, wrapped {wrapped.weights[0, 0]:.4f}")
print(f"bias slope, branch alone {alone.biases[0]:.4f}")
print(f"bias slope, wrapped {wrapped.biases[0]:.4f}")`,
              `weight slope, branch alone 0.7864
weight slope, wrapped 0.7864
bias slope, branch alone 0.7864
bias slope, wrapped 0.7864`,
              { hints: ["A correction carries two things, passed_down for the layer beneath and gradient for the layer’s own parameters.", "The gradient holds a weights block with one row per neuron and a biases vector with one entry per neuron, so this branch’s single weight is at row 0, column 0."], check: numberCheck("What slope does the branch’s weight receive inside the wrapped block?", 0.7864, 0.0005, "The weight’s slope is the input times one minus the square of the tanh, which at an input of one and a weight of 0.5 is 0.7864, and it is the same number with the shortcut as without it. The wrapper changes what the layers beneath receive, 1.3932 against 0.3932, and leaves the branch’s own corrections untouched.") },
            ),
            exercise(
              "Stack the neuron thirty deep",
              ["Part 3 stacks copies of the playground’s neuron and measures what reaches the bottom. Build two chains of thirty layers, one of plain copies of the branch and one of residual copies, feed each an input of one layer by layer, keeping every response, and then walk a slope of one back down through the responses in reverse.", "Print the final output and the slope that reaches the input for each chain, the slope to ten places. The plain chain should hand the input well under a billionth and the residual chain about 2.58, which is the product against the sum."],
              `import numpy as np
from oop_ml import DenseLayer, HyperbolicTangent, Neuron, Residual

for shortcut in (False, True):
    layers = []
    for _ in range(30):
        branch = DenseLayer([Neuron([0.5], 0.0, HyperbolicTangent())])
        layers.append(Residual(branch) if shortcut else branch)
    # Pass an input of one up through the layers in order, keeping each
    # response, then pass a slope of one back down through the responses in
    # reverse. Print the final output and the slope that reaches the input.`,
              `import numpy as np
from oop_ml import DenseLayer, HyperbolicTangent, Neuron, Residual

for shortcut in (False, True):
    layers = []
    for _ in range(30):
        branch = DenseLayer([Neuron([0.5], 0.0, HyperbolicTangent())])
        layers.append(Residual(branch) if shortcut else branch)
    block = np.array([[1.0]])
    responses = []
    for layer in layers:
        responses.append(layer.respond_to(block))
        block = responses[-1].outputs
    arriving = np.ones_like(block)
    for layer, response in zip(reversed(layers), reversed(responses)):
        arriving = layer.correction_for(response, arriving).passed_down
    kind = "residual" if shortcut else "plain"
    print(f"{kind} chain of 30: output {block[0, 0]:.4f}, slope at the input {arriving[0, 0]:.10f}")`,
              `plain chain of 30: output 0.0000, slope at the input 0.0000000007
residual chain of 30: output 29.6829, slope at the input 2.5767800599`,
              { hints: ["Each layer reads what the one before it answered, so the block handed to the next respond_to is the previous response’s outputs.", "The backward walk needs each layer paired with the response it produced, so keep the responses in a list and walk both lists in reverse together.", "What one layer passes down is what arrives at the layer beneath it, so the arriving block is overwritten at every step on the way down."], check: numberCheck("What slope reaches the input through the residual chain of thirty?", 2.5768, 0.0005, "Each plain layer multiplies the slope by a tanh slope times 0.5, so thirty of them leave 6.8 × 10⁻¹⁰ of what arrived at the top. Each residual block adds one to its branch’s derivative instead, and once the branch’s tanh saturates, which happens as the chain’s output climbs towards 29.68, each block passes the slope through at almost exactly one. The figure therefore settles at 2.5768 after about ten layers.") },
            ),
          ],
        },
    ]} />;
}
