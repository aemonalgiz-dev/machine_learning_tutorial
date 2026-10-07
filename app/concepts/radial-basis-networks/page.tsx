import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, NumberTable, SubSection, WhyThisWorks, WorkedExample } from "@/components/concept/Treatments";
import { RadialExplorer } from "@/components/widgets/NetworkBuildingBlocks";

export const metadata: Metadata = { title: "Radial Basis Networks · oop_ml", description: "Build local responses from distance to a centre, then learn the centres and widths." };

export default function RadialBasisNetworksPage() {
  return <ConceptPage
      intuition={lessonIntuitions["radial-basis-networks"]} title="Radial Basis Networks" tagline="Represent an input by how strongly it matches several local regions."
    openingTitle="What If a Pattern Matters Only Nearby?"
    technicalStart="Part 2. Calculating and Learning the Response"
    prerequisites={<>The <Link href="/concepts/distance-metrics">distance metrics</Link> lesson explains how coordinates determine closeness. <Link href="/concepts/neurons-and-activations">A neuron</Link> provides another way to build a response from inputs.</>}

    playgroundIntro="Move the input through the three centres. Then increase the width and compare how far each unit responds. The table reports the exact sample used by the plotted curves."
    playground={<RadialExplorer />}
    sections={[
      { title: "Part 1. Describe a Region by Its Centre and Width", defaultOpen: true, content: <>
        <SubSection title="1. Measure distance from a reference point">
          <p>A neuron scores an input by a weighted sum, and a weighted sum has an opinion everywhere. Push the input far enough along the direction of the weights and the score keeps rising, however unlike the training data that input has become. Some patterns do not behave that way. A reading matters when it is close to a particular value and matters less the further it moves from that value, on either side.</p>
          <p>A radial basis unit is built for that case. Where a neuron holds a direction, this unit holds a place, called its centre, and it answers with how close the input is to that place. Three things go into the answer. They are the centre, a distance from it, and a width that says how far still counts as close.</p>
          <p>For one input coordinate, the centre is one number. For several coordinates, it is a vector with one entry per feature. We subtract the centre from the input, square each difference, and add the squared differences. This gives squared Euclidean distance.</p>
          <p>Squaring makes equal displacements on opposite sides contribute equally. The Gaussian unit depends on distance from the centre, not on the direction from which the input approached it. That dependence on radius is why it is called radial.</p>
        </SubSection>
        <SubSection title="2. Let width control the useful neighborhood">
          <p>At the centre, the Gaussian response is one. Farther away, it approaches zero. A narrow width makes the unit respond strongly only near its centre. A wide width allows more distant inputs to produce a substantial response.</p>
          <p>The unit divides the squared distance by twice the square of its width before turning it into a response, so the width sets the scale on which distance is judged. One unit of distance is far for a width of one half and near for a width of three. The playground&rsquo;s three units, read at an input of one, show it.</p>
          <NumberTable headings={["Width of each unit", "Unit centred at −1", "Unit centred at 0", "Unit centred at 1"]} rows={[["0.5", "0.0003", "0.1353", "1.0000"], ["1", "0.1353", "0.6065", "1.0000"], ["2", "0.6065", "0.8825", "1.0000"], ["3", "0.8007", "0.9460", "1.0000"]]} caption="The three responses at an input of one, as the playground’s table reports them at four settings of the width." />
          <p>The unit sitting on the input answers one at every width. At a width of one half the unit two away has all but stopped answering. At a width of three it still answers 0.8007, and the three responses have become hard to tell apart.</p>
          <p>These responses are features for another layer. They do not automatically represent probabilities, and their sum across units does not have to equal one. At a width of one the three responses above add to about 1.74.</p>
        </SubSection>
        <WorkedExample title="One input, three local responses">
          <p>The default input is one. The centres are minus one, zero, and one, and all three widths are one. Twice the squared width is therefore two, which is the divisor in the second calculation.</p>
          <Equation>{`Squared distances = [(1 − (−1))², (1 − 0)², (1 − 1)²]\n                  = [4, 1, 0]\n\nResponses = [exp(−4 / 2), exp(−1 / 2), exp(0)]\n          ≈ [0.1353, 0.6065, 1.0000]`}</Equation>
          <p>The input exactly matches the third centre, so that unit gives its maximum response. The other two still contribute information about the input&apos;s location relative to their regions.</p>
          <p>Now move the input to one half, midway between the second centre and the third.</p>
          <Equation>{`Squared distances = [(0.5 − (−1))², (0.5 − 0)², (0.5 − 1)²]\n                  = [2.25, 0.25, 0.25]\n\nResponses = [exp(−2.25 / 2), exp(−0.25 / 2), exp(−0.25 / 2)]\n          ≈ [0.3247, 0.8825, 0.8825]`}</Equation>
          <p>The second and third units give the same response. The input is half a unit above one centre and half a unit below the other, and a squared distance cannot tell those two apart. No unit answers one now, because the input sits on no centre.</p>
        </WorkedExample>
      </> },
      { title: "Part 2. Calculating and Learning the Response", content: <>
        <SubSection title="3. Write the Gaussian unit">
          <p>For input vector x, centre c, and positive width w, define the squared distance s and output o:</p>
          <Equation>{`s = Σ_k (x_k − c_k)²\no = exp(−s / (2w²))`}</Equation>
          <p>Each piece has one job. The squared distance s is the measurement from Part 1. Dividing it by 2w² judges it against the width. The minus sign makes a larger distance give a smaller exponent, and the exponential turns that exponent into a number between zero and one, which is one exactly when s is zero.</p>
          <p>Both the centre and width can be learned. The SDK stores one centre vector and one width per unit. It records squared distances in the forward response so the backward pass can use the same values.</p>
        </SubSection>
        <SubSection title="4. Find how each parameter affects the output">
          <p>Let g be the arriving derivative of the loss with respect to one unit&apos;s output. Applying the chain rule gives:</p>
          <Equation>{`∂L/∂c_k = g o (x_k − c_k) / w²\n∂L/∂w   = g o s / w³\n∂L/∂x_k = −g o (x_k − c_k) / w²`}</Equation>
          <WhyThisWorks title="Where the three derivatives come from">
            <p>Write the exponent as u, so the output is the exponential of u and the derivative of the output with respect to u is the output itself. What remains is how u changes with a centre coordinate, an input coordinate and the width.</p>
            <Equation>{`u = −s / (2w²),    o = exp(u),    ∂o/∂u = o\n\n∂u/∂c_k = (x_k − c_k) / w²       because ∂s/∂c_k = −2 (x_k − c_k)\n∂u/∂x_k = −(x_k − c_k) / w²      because ∂s/∂x_k = 2 (x_k − c_k)\n∂u/∂w   = s / w³                 because ∂(w⁻²)/∂w = −2 w⁻³`}</Equation>
            <p>Multiplying each line by the output and by the arriving derivative g gives the three results above. The width is the only parameter that ends up cubed, and it does so because it was already squared inside the exponent.</p>
          </WhyThisWorks>
          <WorkedExample title="The playground’s derivatives at the default input">
            <p>Open the parameter derivatives in the playground. It sends a derivative of one into every unit, so g is one for all three, and what the table reports is the derivative of the sum of the three responses. The input is one and every width is one.</p>
            <Equation>{`Centre derivatives, o × (x − c) / w²\nunit centred at −1    0.1353 × (1 − (−1)) / 1² ≈ 0.2707\nunit centred at 0     0.6065 × (1 − 0) / 1² ≈ 0.6065\nunit centred at 1     1.0000 × (1 − 1) / 1² = 0\n\nWidth derivatives, o × s / w³\nunit centred at −1    0.1353 × 4 / 1³ ≈ 0.5413\nunit centred at 0     0.6065 × 1 / 1³ ≈ 0.6065\nunit centred at 1     1.0000 × 0 / 1³ = 0`}</Equation>
            <p>Every centre derivative is positive or zero, because the input lies above the first two centres and moving a centre up, toward the input, raises its response. The unit already on the input has nothing to gain from moving, and nothing to gain from a different width either.</p>
            <p>The nearer of the other two units has the larger centre derivative, 0.6065 against 0.2707. The far unit is displaced twice as much, but its response is less than a quarter of the near unit&rsquo;s, and the derivative is the product of the two. A unit that barely responds to an input learns little from it.</p>
            <p>With every width at one, w² and w³ are both one, so this example cannot show which power of the width each formula carries. Any other width can, and the practice problems at the end run two of them.</p>
          </WorkedExample>
          <p>The centre and input derivatives have opposite signs because moving either one toward the other reduces their distance. Increasing width raises the response away from the centre. At the centre itself, changing width has no effect on the peak value.</p>
          <p>A batch adds parameter contributions across observations. Each input receives the sum of the derivatives from all the units that read it. Training then subtracts a learning-rate-scaled gradient from each parameter.</p>
        </SubSection>
      </> },
      { title: "Part 3. Combine Local Responses into a Prediction", content: <>
        <p>A radial basis network can place a dense output layer after these units. The local responses tell the output layer which regions match the input, and the output weights determine how those matches contribute to a prediction.</p>
        <WorkedExample title="A prediction from three responses">
          <p>Suppose the output layer holds one weight for each unit, 2, −1 and 3, and no bias. These weights are chosen for the illustration and have not been trained. The prediction is each response times its weight, added up, with the responses taken at full precision.</p>
          <Equation>{`At an input of 1, the responses are about [0.1353, 0.6065, 1.0000]\nprediction = (2 × 0.1353) + (−1 × 0.6065) + (3 × 1.0000) ≈ 2.6641\n\nAt an input of 3, the responses are about [0.0003, 0.0111, 0.1353]\nprediction = (2 × 0.0003) + (−1 × 0.0111) + (3 × 0.1353) ≈ 0.3956`}</Equation>
          <p>At an input of one the third unit answers one, so its weight of 3 supplies most of the prediction. At an input of three, two units of distance from the nearest centre, every response is small, and the prediction is small whatever the weights are. Far from all the centres it settles at the output layer&rsquo;s bias, which is zero here. A radial basis network describes the regions around its centres and says very little about anywhere else.</p>
        </WorkedExample>
        <p>This makes feature scale consequential. If one coordinate is measured in thousands and another in tenths, squared Euclidean distance can be dominated by the first. Choose meaningful units or fit <Link href="/concepts/feature-scaling">feature scaling</Link> on the training data before fitting the model.</p>
        <KeepInMind><p>Very narrow units can respond to almost none of the observed data, producing weak learning signals away from their centres. Very wide units can become difficult to distinguish. Widths must stay positive; the SDK refuses a training step that would make one zero or negative.</p></KeepInMind>
        <p>The playground reaches both ends. At a width of 0.2 and an input of three, all three responses are zero to four decimal places and so are all six parameter derivatives, so that input would teach these units nothing. At a width of three and an input of one the responses are 0.8007, 0.9460 and 1.0000, three numbers that tell the output layer almost the same thing.</p>
        <p>The playground displays derivatives of the sum of the three responses so their directions can be inspected. A trained predictor supplies its own loss derivatives, which can have different signs and magnitudes.</p>
      </> },
      { title: "Questions on Parts 1 to 3", quiz: [
        choice(
          "The input is one, the centres are minus one, zero and one, and all three widths are one. What does the third unit answer, and why?",
          [
            "1.0000, because the input exactly matches its centre and the squared distance is zero",
            "0.0000, because the squared distance is zero and the exponent vanishes",
            "0.6065, because its width is one",
            "0.1353, because it is the unit furthest from the input",
          ],
          0,
          "The squared distances are 4, 1 and 0, and the responses are about 0.1353, 0.6065 and 1.0000. At the centre the Gaussian response is one, and farther away it approaches zero. The other two units still contribute information about where the input sits relative to their regions.",
        ),
        trueFalse(
          "The responses of a layer of these units can be read as probabilities over the regions.",
          false,
          "These responses are features for another layer. They do not automatically represent probabilities, and their sum across units does not have to equal one. The unit at the matching centre answers its maximum of one whatever the other two are doing, and at the default input and width the three responses add to about 1.74.",
        ),
        choice(
          "Why do the derivative with respect to a centre coordinate and the derivative with respect to the matching input coordinate have opposite signs?",
          [
            "Because moving either one towards the other reduces the distance between them",
            "Because the width appears squared in one and cubed in the other",
            "Because the response is squared before the chain rule is applied",
            "Because only the centre is learned and the input is not",
          ],
          0,
          "The two are g o (x − c) / w² and its negative. The unit depends on distance from the centre rather than on the direction from which the input approached it, which is why the same displacement read from the two ends carries the two signs.",
        ),
        several(
          "Which of these does the lesson say about the width?",
          [
            "Increasing it raises the response away from the centre",
            "At the centre itself, changing it has no effect on the peak value",
            "It must stay positive, and the SDK refuses a training step that would make one zero or negative",
            "At a width of three and an input of one the three units answer 0.8007, 0.9460 and 1.0000, which are hard to tell apart",
          ],
          [0, 1, 2, 3],
          "All four hold. A narrow width makes a unit respond strongly only near its centre, and the cost is that it can respond to almost none of the observed data, leaving weak learning signals away from the centre. Very wide units run into the opposite trouble, and three responses between 0.80 and 1.00 tell the next layer almost the same thing. The unit sitting on the input answers one at every width, which is why the peak has nothing to gain from a change of width.",
        ),
        trueFalse(
          "At the default input of one, the unit centred at zero has a larger centre derivative than the unit centred at minus one.",
          true,
          "The centre derivative is the unit’s response times its displacement from the input, over the squared width. The unit at minus one is displaced twice as much, but it answers 0.1353 where the unit at zero answers 0.6065, so its derivative is 0.2707 against 0.6065. A unit that barely responds to an input learns little from it, which is the weak learning signal a very narrow unit runs into. The unit centred on the input has a derivative of zero.",
        ),
      ] },
        {
          title: "Practice. Reading the Three Units With the Library",
          practice: [
            exercise(
              "Read the three units at the default input",
              ["Build the playground’s layer, three units centred at minus one, zero and one with every width at one, and hand it an input of one. Print each unit’s squared distance and response, and then the derivative of the sum of the three responses with respect to each centre and each width.", "Part 1 worked the squared distances as 4, 1 and 0 and the responses as 0.1353, 0.6065 and 1.0000, and Part 2 worked the six derivatives. All of them should come back."],
              `import numpy as np
from oop_ml import RadialBasisLayer

layer = RadialBasisLayer(reads=1, n_units=3).with_parameters(
    centres=np.array([[-1.0], [0.0], [1.0]]),
    widths=np.full(3, 1.0),
)
# Ask the layer to respond to an input of 1.0, then send a derivative of one
# into every output with correction_for. For each unit, print its centre,
# the squared distance it measured, its response, and the derivatives of its
# centre and of its width.`,
              `import numpy as np
from oop_ml import RadialBasisLayer

layer = RadialBasisLayer(reads=1, n_units=3).with_parameters(
    centres=np.array([[-1.0], [0.0], [1.0]]),
    widths=np.full(3, 1.0),
)
response = layer.respond_to(np.array([[1.0]]))
correction = layer.correction_for(response, np.ones_like(response.outputs))

for unit in range(3):
    print(f"unit centred at {layer.centres[unit, 0]:.0f}")
    print(f"  squared distance {response.scores[0, unit]:.4f}")
    print(f"  response {response.outputs[0, unit]:.4f}")
    print(f"  centre derivative {correction.gradient.weights[unit, 0]:.4f}")
    print(f"  width derivative {correction.gradient.biases[unit]:.4f}")`,
              `unit centred at -1
  squared distance 4.0000
  response 0.1353
  centre derivative 0.2707
  width derivative 0.5413
unit centred at 0
  squared distance 1.0000
  response 0.6065
  centre derivative 0.6065
  width derivative 0.6065
unit centred at 1
  squared distance 0.0000
  response 1.0000
  centre derivative 0.0000
  width derivative 0.0000`,
              { hints: ["respond_to takes a block with one row per input and one column per coordinate, so a single input of one is np.array([[1.0]]).", "The response carries scores, which for this layer are the squared distances, and outputs, the responses. Both have one row per input and one column per unit.", "correction_for takes the response and the derivative arriving at the outputs. A block of ones the shape of the outputs asks about the sum of the three responses.", "The correction’s gradient holds two blocks under the names every layer shares. Here gradient.weights is the derivative of each centre, one row per unit, and gradient.biases is the derivative of each width."], check: numberCheck("What is the width derivative of the unit centred at minus one?", 0.5413, 5e-05, "The unit centred at minus one answers 0.1353 at a squared distance of 4, and its width derivative is that response times the squared distance over the cubed width, 0.1353 × 4 / 1. Widening it would raise its response at this input. The unit centred on the input has a derivative of zero, since no width changes a peak of one.") },
            ),
            exercise(
              "Find which power of the width the derivative carries",
              ["Part 2 gives the width derivative as the response times the squared distance over the width cubed, and notes that the default width of one cannot show the cube. Run the same input of one at widths of 0.5, 1 and 2, and hold the layer’s width derivative for the unit centred at zero against the formula with the width once and with the width cubed.", "At a width of one the two candidates agree. Look at which of them the layer agrees with at the other two."],
              `import numpy as np
from oop_ml import RadialBasisLayer

for width in (0.5, 1.0, 2.0):
    layer = RadialBasisLayer(reads=1, n_units=3).with_parameters(
        centres=np.array([[-1.0], [0.0], [1.0]]),
        widths=np.full(3, width),
    )
    # Respond to an input of 1.0 and send a derivative of one into every
    # output. For the unit centred at zero, print its response and the width
    # derivative the layer reports. Then compute the response times the
    # squared distance divided by the width, and divided by the width cubed,
    # and print both beside it.`,
              `import numpy as np
from oop_ml import RadialBasisLayer

for width in (0.5, 1.0, 2.0):
    layer = RadialBasisLayer(reads=1, n_units=3).with_parameters(
        centres=np.array([[-1.0], [0.0], [1.0]]),
        widths=np.full(3, width),
    )
    response = layer.respond_to(np.array([[1.0]]))
    correction = layer.correction_for(response, np.ones_like(response.outputs))

    output = response.outputs[0, 1]
    squared_distance = response.scores[0, 1]
    print(f"width {width}")
    print(f"  response of the unit centred at zero {output:.4f}")
    print(f"  width derivative from the layer {correction.gradient.biases[1]:.4f}")
    print(f"  response x squared distance / width {output * squared_distance / width:.4f}")
    print(f"  response x squared distance / width cubed {output * squared_distance / width**3:.4f}")`,
              `width 0.5
  response of the unit centred at zero 0.1353
  width derivative from the layer 1.0827
  response x squared distance / width 0.2707
  response x squared distance / width cubed 1.0827
width 1.0
  response of the unit centred at zero 0.6065
  width derivative from the layer 0.6065
  response x squared distance / width 0.6065
  response x squared distance / width cubed 0.6065
width 2.0
  response of the unit centred at zero 0.8825
  width derivative from the layer 0.1103
  response x squared distance / width 0.4412
  response x squared distance / width cubed 0.1103`,
              { hints: ["The unit centred at zero is the second of the three, so it is column 1 of the outputs and of the scores, and entry 1 of gradient.biases.", "The squared distance the unit measured is in response.scores, so nothing has to be recomputed from the centre.", "width**3 is the width cubed. At 0.5 that is 0.125, so dividing by it multiplies by eight."], check: numberCheck("At a width of 0.5, what width derivative does the layer report for the unit centred at zero?", 1.0827, 5e-05, "At a width of one half the unit answers 0.1353, and the layer reports 1.0827, which is 0.1353 × 1 / 0.125, the response times the squared distance over the width cubed. Dividing by the width once would give 0.2707. At a width of two the layer reports 0.1103 where the single division gives 0.4412. The width was already squared inside the exponent, and differentiating that square is what leaves it cubed.") },
            ),
            exercise(
              "Add the three responses along the curve",
              ["Part 1 says the responses are not probabilities and need not add to one. The playground draws its three curves from 61 inputs spaced evenly from minus three to three. Hand the layer the same 61 inputs in one block, add the three responses at each input, and find where the total is largest, at widths of 0.5, 1 and 2.", "The lesson quotes a total of about 1.74 at an input of one. Find the largest total the default width reaches anywhere on the curve, which the lesson does not quote, and compare it with the total out at an input of three."],
              `import numpy as np
from oop_ml import RadialBasisLayer

inputs = np.linspace(-3, 3, 61).reshape(-1, 1)

for width in (0.5, 1.0, 2.0):
    layer = RadialBasisLayer(reads=1, n_units=3).with_parameters(
        centres=np.array([[-1.0], [0.0], [1.0]]),
        widths=np.full(3, width),
    )
    # Respond to all 61 inputs at once and add the three responses for each
    # input. Print the largest total, the input it is reached at, and the
    # total at the last input, which is 3.`,
              `import numpy as np
from oop_ml import RadialBasisLayer

inputs = np.linspace(-3, 3, 61).reshape(-1, 1)

for width in (0.5, 1.0, 2.0):
    layer = RadialBasisLayer(reads=1, n_units=3).with_parameters(
        centres=np.array([[-1.0], [0.0], [1.0]]),
        widths=np.full(3, width),
    )
    totals = layer.respond_to(inputs).outputs.sum(axis=1)
    highest = int(totals.argmax())
    print(f"width {width}")
    print(f"  largest total {totals[highest]:.4f}")
    print(f"  reached at an input of {inputs[highest, 0]:.1f}")
    print(f"  total at an input of 3 {totals[-1]:.4f}")`,
              `width 0.5
  largest total 1.2707
  reached at an input of 0.0
  total at an input of 3 0.0003
width 1.0
  largest total 2.2131
  reached at an input of 0.0
  total at an input of 3 0.1468
width 2.0
  largest total 2.7650
  reached at an input of 0.0
  total at an input of 3 1.0665`,
              { hints: ["A block of 61 rows and one column is 61 inputs of one coordinate each, and the outputs come back with 61 rows and three columns.", "Summing along axis 1 adds across the three units and leaves one total per input.", "argmax gives the position of the largest total, and the same position in inputs is where it was reached."], check: numberCheck("With every width at one, what is the largest total of the three responses along the curve?", 2.2131, 5e-05, "The total peaks at an input of zero, where the middle unit answers one and the two beside it are each one unit away and answer 0.6065. Nothing holds the total at one. It reaches 2.7650 at a width of two and 1.2707 at a width of one half, and out at an input of three with a width of one it is 0.1468, which is why the responses are features for another layer and not shares of a whole.") },
            ),
          ],
        },
    ]} />;
}
