import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, NumberTable, SubSection, WorkedExample, WhyThisWorks } from "@/components/concept/Treatments";
import { RecurrentExplorer } from "@/components/widgets/NetworkBuildingBlocks";

export const metadata: Metadata = { title: "Recurrent Layers · oop_ml", description: "Build a running state for a sequence, then introduce the memory and gates used by LSTMs and GRUs." };

export default function RecurrentLayersPage() {
  return <ConceptPage
      intuition={lessonIntuitions["recurrent-layers"]} title="Recurrent Layers" tagline="Read a sequence one step at a time and carry information forward."
    openingTitle="How Do We Remember What Came Before?"
    technicalStart="Part 2. Controlling What the State Retains"
    prerequisites={<>The <Link href="/concepts/neurons-and-activations">neuron</Link> lesson introduces weights, biases, and activation functions. <Link href="/concepts/backpropagation">Backpropagation</Link> explains the gradients used later in this lesson.</>}

    playgroundIntro="Start with the simple recurrent cell. Follow the first input through the later steps, which all receive zero. Then select LSTM and change the forget gate bias. Compare the cell memory with the visible hidden state."
    playground={<RecurrentExplorer />}
    sections={[
      { title: "Part 1. Carry a State from One Step to the Next", defaultOpen: true, content: <>
        <SubSection title="1. Reuse one update rule">
          <p>A dense layer answers each row from that row alone. Hand it the readings of a sequence one at a time and its fourth answer knows nothing about the first three. For a sentence, a melody or a week of temperatures that is the wrong arrangement, because what a reading means depends on what came before it.</p>
          <p>What is missing is something carried from one step to the next. A recurrent layer keeps a small vector called the hidden state. At every step it reads the current input together with its own previous state, calculates a new state, and hands that state to the next step.</p>
          <p>At the first step, the SDK starts the hidden state at zero. We concatenate the current input with that state, calculate a weighted sum and bias, then apply tanh. The result becomes the next hidden state. The same weights are reused at every step.</p>
          <Equation>{`combined_t = concatenate(input_t, hidden_(t−1))\nhidden_t = tanh(W combined_t + b)`}</Equation>
          <p>W holds one weight for every input value and one for every state value, and b is a bias. The weights on the input decide how strongly a new reading enters the state. The weights on the previous state, called the recurrent weights, decide how much of what was already there carries on. The tanh function then keeps every state value between minus one and one, so the state cannot grow without limit however long the sequence runs.</p>
          <p>The state has a fixed width. It is a learned summary, not a copy of all earlier readings. A model can use the final state to predict something about the sequence, or produce an output at every step.</p>
        </SubSection>
        <WorkedExample title="One signal, followed by zeros">
          <p>The simple cell in the playground has one state value. Its input weight is one, its recurrent weight is one half, and its bias is zero.</p>
          <Equation>{`Initial state = 0\nFirst input = 1\nFirst state = tanh((1 × 1) + (0.5 × 0))\n            = tanh(1) ≈ 0.7616\n\nSecond input = 0\nSecond state = tanh((1 × 0) + (0.5 × 0.7616))\n             ≈ 0.3634`}</Equation>
          <p>The first reading still influences the second state even though the new input is zero. With these chosen weights, its influence becomes smaller as we continue. Different weights can produce different behavior.</p>
          <p>Carry the same rule through all six steps of the playground&rsquo;s default sequence, with every later input at zero.</p>
          <NumberTable headings={["Step", "Input", "Hidden state"]} rows={[["1", "1", "0.7616"], ["2", "0", "0.3634"], ["3", "0", "0.1797"], ["4", "0", "0.0896"], ["5", "0", "0.0448"], ["6", "0", "0.0224"]]} caption="The simple cell over six steps, as the playground’s first table shows it." />
          <p>Each state is a little under half the one before it. The half is the recurrent weight, and the little under is tanh, which returns slightly less than it is given. After six steps the state is 0.0224, so the cell still records that something arrived, though only faintly.</p>
        </WorkedExample>
        <SubSection title="2. Understand why learning through many steps can be difficult">
          <p>To learn from an early input, the final prediction error must influence the weights used at that early step. Backpropagation passes through every intervening state update. Multiplying many small derivatives can make the resulting gradient very small; other weights can make it grow excessively.</p>
          <p>The quantity to watch is a derivative, how far the final state would move if one input moved a little. Going back one step multiplies that derivative by two numbers. One is the recurrent weight, since that is how much of the earlier state entered the later one. The other is the slope of tanh at the state in between, which is one minus the square of that state and is never more than one.</p>
          <WorkedExample title="How far each input can still move the final state">
            <p>The playground reports this derivative for every input of the simple cell, in the panel that opens the gates and the gradient. The last input reaches the final state through one tanh. Each earlier input has one more step to cross.</p>
            <Equation>{`derivative for input 6 = 1 − 0.0224² ≈ 0.9995\nderivative for input 5 ≈ 0.9995 × 0.5 × (1 − 0.0448²) ≈ 0.4987\nderivative for input 4 ≈ 0.4987 × 0.5 × (1 − 0.0896²) ≈ 0.2474\n...\nderivative for input 1 ≈ 0.0519 × 0.5 × (1 − 0.7616²) ≈ 0.0109`}</Equation>
            <NumberTable headings={["Input step", "Derivative of the final state"]} rows={[["1", "0.0109"], ["2", "0.0519"], ["3", "0.1197"], ["4", "0.2474"], ["5", "0.4987"], ["6", "0.9995"]]} caption="The simple cell over six steps. Each row is how far the sixth state moves for a small change to that input." />
            <p>The last input moves the final state almost one for one, and the first moves it about ninety times less. The step from input 2 back to input 1 costs more than the others, because the first state is 0.7616, where tanh is flatter and its slope is about 0.42. Set the playground to twelve steps and the derivative for the first input is about 0.0002.</p>
            <p>Nothing fails when this happens. The cell runs and an error can still be measured on its final state. But the early inputs have almost no say in that state, so the error can teach the weights very little about them.</p>
          </WorkedExample>
          <p>This gives us a reason to change the update rule. We want a controllable route for keeping information, instead of repeatedly transforming all of it in the same way.</p>
        </SubSection>
      </> },
      { title: "Part 2. Controlling What the State Retains", content: <>
        <SubSection title="3. Give an LSTM a separate memory">
          <p>An LSTM, or long short-term memory cell, carries a cell memory as well as a hidden state. A gate is a learned number between zero and one that controls how much of a quantity passes through. There are three gates and one candidate to understand:</p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>The <strong>forget gate</strong> controls how much previous cell memory remains.</li>
            <li>The <strong>input gate</strong> controls how much new candidate information is added.</li>
            <li>The <strong>candidate</strong> supplies proposed new memory values.</li>
            <li>The <strong>output gate</strong> controls how much of the transformed cell memory becomes the hidden state.</li>
          </ol>
          <p>Each is calculated from the current input and previous hidden state. Sigmoid produces the gate values; tanh produces the candidate. The SDK calls the input gate &quot;keep&quot; and the output gate &quot;show.&quot;</p>
          <Equation>{`c_t = f_t ⊙ c_(t−1) + i_t ⊙ candidate_t\nh_t = o_t ⊙ tanh(c_t)`}</Equation>
          <p>The multiplication symbol denotes matching-coordinate products. The memory update adds retained information and new information. Along its direct memory route, the derivative is controlled by the forget gate.</p>
        </SubSection>
        <WorkedExample title="Choose what to retain and what to add">
          <p>Suppose the previous memory is two, the forget gate is eight tenths, the input gate is one quarter, and the candidate is four tenths.</p>
          <Equation>{`Retained memory = 0.8 × 2 = 1.6\nNew contribution = 0.25 × 0.4 = 0.1\nUpdated memory = 1.6 + 0.1 = 1.7`}</Equation>
          <p>We have kept some existing information while adding a smaller new contribution. These are illustrative values. In a trained LSTM, the gates are calculated separately for each step and coordinate.</p>
        </WorkedExample>
        <WorkedExample title="The playground’s LSTM, two steps by hand">
          <p>The playground&rsquo;s cell has one memory value and deliberately simple weights. The candidate reads the input with a weight of one and ignores the previous hidden state. Every gate has zero weights, so each gate is the sigmoid of its bias and takes the same value at every step. The input gate and the output gate have a bias of zero, which gives one half. The forget gate has the bias the slider sets, which is one by default.</p>
          <Equation>{`forget gate = sigmoid(1) ≈ 0.7311\ninput gate = output gate = sigmoid(0) = 0.5\n\nStep 1, input 1, previous memory 0:\ncandidate = tanh(1) ≈ 0.7616\nmemory = (0.7311 × 0) + (0.5 × 0.7616) ≈ 0.3808\nhidden state = 0.5 × tanh(0.3808) ≈ 0.1817\n\nStep 2, input 0, previous memory 0.3808:\ncandidate = tanh(0) = 0\nmemory = (0.7311 × 0.3808) + (0.5 × 0) ≈ 0.2784\nhidden state = 0.5 × tanh(0.2784) ≈ 0.1357`}</Equation>
          <p>After the first step nothing new arrives, so each step multiplies the memory by the forget gate and does nothing else to it. The memory runs 0.3808, 0.2784, 0.2035, 0.1488, 0.1088 and 0.0795 across the six steps. The hidden state is a second, smaller number read off the memory through the output gate. Unlike the simple cell&rsquo;s state, the memory does not pass through tanh on its way to the next step.</p>
          <NumberTable headings={["Forget gate bias", "Forget gate", "Memory after step 2", "Memory after step 6"]} rows={[["−3", "0.0474", "0.0181", "0.0000"], ["0", "0.5000", "0.1904", "0.0119"], ["1", "0.7311", "0.2784", "0.0795"], ["3", "0.9526", "0.3627", "0.2987"]]} caption="The same first input of one at four settings of the playground’s forget gate bias." />
          <p>The memory after the first step is 0.3808 at every setting, because the forget gate multiplies the previous memory and at the first step that is zero. What the gate decides is how much of it is still there later. At a bias of three, 0.2987 of the 0.3808 remains after six steps. At minus three, 0.0181 remains after two.</p>
          <p>A trained cell calculates each gate afresh from the input and the previous hidden state, so it can hold a gate near one for one stretch of a sequence and let it drop for another. The playground fixes the gates so that one slider moves one gate.</p>
        </WorkedExample>
        <SubSection title="4. A GRU uses one carried state">
          <p>A gated recurrent unit, or GRU, combines memory and hidden state into one vector. Its reset gate controls how much previous state is used to construct the candidate. Its update gate controls the mixture of previous state and candidate.</p>
          <Equation>{`r_t = sigmoid(W_r [x_t, h_(t−1)] + b_r)\nz_t = sigmoid(W_z [x_t, h_(t−1)] + b_z)\ncandidate_t = tanh(W_c [x_t, r_t ⊙ h_(t−1)] + b_c)\nh_t = (1 − z_t) ⊙ candidate_t + z_t ⊙ h_(t−1)`}</Equation>
          <p>This is the SDK&apos;s convention: a larger update gate retains more of the previous state. Some implementations use the complementary convention. The reset operation here happens before the candidate&apos;s recurrent multiplication.</p>
          <WorkedExample title="The playground’s GRU, two steps by hand">
            <p>The playground&rsquo;s GRU has one state value. Its reset gate and its update gate have zero weights and zero biases, so both are one half at every step. Its candidate reads the input with a weight of one and the reset previous state with a weight of one half.</p>
            <Equation>{`reset gate = update gate = sigmoid(0) = 0.5\n\nStep 1, input 1, previous state 0:\ncandidate = tanh((1 × 1) + (0.5 × 0.5 × 0)) = tanh(1) ≈ 0.7616\nstate = (0.5 × 0.7616) + (0.5 × 0) ≈ 0.3808\n\nStep 2, input 0, previous state 0.3808:\ncandidate = tanh((1 × 0) + (0.5 × 0.5 × 0.3808)) ≈ tanh(0.0952) ≈ 0.0949\nstate = (0.5 × 0.0949) + (0.5 × 0.3808) ≈ 0.2379`}</Equation>
            <p>The last line of each step is the mixture. Half of the new state is the candidate and half is the previous state carried over unchanged, because the update gate is one half. That carried half does the job the forget gate did in the LSTM, without a separate memory to hold it. Across the six steps the state runs 0.3808, 0.2379, 0.1486, 0.0929, 0.0580 and 0.0363.</p>
          </WorkedExample>
        </SubSection>
      </> },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "The simple cell has an input weight of one, a recurrent weight of one half and a bias of zero. The first input is one and the first state comes out near 0.7616. The second input is zero. What is the second state?",
              [
                "About 0.3634",
                "Zero, since the new input is zero",
                "About 0.7616, unchanged",
                "About 0.5, half of the input weight",
              ],
              0,
              "The update reads the previous state as well as the current input, so the first reading still influences the second state even though the new input is zero. With these chosen weights that influence becomes smaller as the sequence continues, and different weights can produce different behavior.",
            ),
            trueFalse(
              "However long the sequence is, the hidden state keeps the same width.",
              true,
              "The state has a fixed width and is a learned summary rather than a copy of all earlier readings. One update rule with one set of weights is reused at every step, so nothing about the sequence length changes the shape of what is carried. In the playground it is one number whether the sequence has six steps or twelve.",
            ),
            choice(
              "In the simple cell’s example the final state responds to the last input with a derivative of 0.9995 and to the first with 0.0109. What makes the first so much smaller?",
              [
                "Each step back multiplies by the recurrent weight of one half and by the slope of tanh at that step",
                "The first input was smaller than the later ones",
                "The first step used different weights from the last",
                "The state had returned to exactly zero before the final step",
              ],
              0,
              "The derivative has to pass back through every state update between the input and the final state. Each one multiplies it by the recurrent weight, one half here, and by the slope of tanh, which is never more than one. Five such crossings take 0.9995 down to 0.0109, and at twelve steps the first input’s derivative is about 0.0002. The same weights are used at every step, the first input was the only one that was not zero, and the final state was still 0.0224.",
            ),
            several(
              "Which of these describe the LSTM cell as this lesson states it?",
              [
                "The forget gate controls how much previous cell memory remains",
                "The candidate supplies proposed new memory values",
                "Tanh produces the gate values and sigmoid produces the candidate",
                "The output gate controls how much new candidate information is added",
              ],
              [0, 1],
              "There are three gates and one candidate, and each is calculated from the current input and the previous hidden state. Sigmoid produces the gates, since a gate is a number between zero and one, and tanh produces the candidate. Adding new candidate information is the input gate, which the SDK calls keep. The output gate, which the SDK calls show, controls how much of the transformed cell memory becomes the hidden state.",
            ),
            choice(
              "In the GRU convention this lesson uses, what does a larger update gate do?",
              [
                "It retains more of the previous state",
                "It retains more of the candidate",
                "It lets more of the previous state into the candidate",
                "It widens the carried state",
              ],
              0,
              "The carried state is a mixture of candidate and previous state, and in this convention the update gate is the weight on the previous state. Some implementations use the complementary convention, so the equation has to be read rather than the name. Letting previous state into the candidate is the reset gate, which acts before the recurrent multiplication.",
            ),
        ],
        },
      { title: "Part 3. Learning Across Time", content: <>
        <p>Parts 1 and 2 ran the cells forward. Training runs them backward. An error is measured on the output, and each weight is moved according to the derivative of that error with respect to it. A recurrent layer uses the same weights at every step, so the backward pass has to visit every step, from the last to the first, and collect what each one contributes.</p>
        <p>Two things are handed back from each step to the one before it. One is the derivative with respect to the hidden state. In an LSTM the other is the derivative with respect to the cell memory, which travels by its own route. How much of a derivative survives the journey decides how much an early input can teach the weights, and the playground measures it.</p>
        <WorkedExample title="The route back through the LSTM memory, measured">
          <p>Select the LSTM in the playground with the forget gate bias at one, and open the gates and the gradient. The second table there is the derivative of the final hidden state with respect to each input. Start at the last input and work backward.</p>
          <Equation>{`derivative for input 6 = 0.5 × (1 − tanh²(0.0795)) × 0.5 ≈ 0.2484\nderivative for input 5 ≈ 0.2484 × 0.7311 ≈ 0.1816\nderivative for input 4 ≈ 0.1816 × 0.7311 ≈ 0.1328\nderivative for input 3 ≈ 0.1328 × 0.7311 ≈ 0.0971\nderivative for input 2 ≈ 0.0971 × 0.7311 ≈ 0.0710\nderivative for input 1 ≈ 0.0710 × 0.7311 × (1 − 0.7616²) ≈ 0.0218`}</Equation>
          <p>The first line is the output gate, the slope of tanh at the final memory, and the input gate. After that, each step further back multiplies by the forget gate and by nothing else, because in this cell the only way an early input reaches the final state is through the memory. The first input pays one more factor, the slope of tanh at its own candidate of 0.7616. The later candidates sit at zero, where that slope is one.</p>
          <p>Now move the forget gate bias. At three the gate is 0.9526 and the derivative for the first input rises from 0.0218 to 0.0754. At zero the gate is one half and it falls to 0.0033. In the simple cell of Part 1 the factor paid at each step was the recurrent weight times the slope of tanh, and the cell had no way to set that factor apart from the state it was calculating. Here the factor is a gate, a number the cell can learn to hold near one where something is worth keeping.</p>
        </WorkedExample>
        <WhyThisWorks title="Backpropagation through the repeated rule">
          <p>Start at the final step and work backward. Each step receives a derivative from its output and from the state it supplied to the next step. It calculates input derivatives, parameter derivatives, and the derivatives to pass to the preceding state.</p>
          <Equation>{`Total weight gradient = sum of each step's weight contribution\nTotal bias gradient = sum of each step's bias contribution`}</Equation>
          <p>We add the contributions because every step uses the same parameters. LSTM also passes a derivative through the cell memory. The completed NumPy methods account for both the memory route and the route through the hidden state.</p>
        </WhyThisWorks>
        <KeepInMind><p>Gates provide ways to retain information; they do not guarantee perfect memory or prevent all gradient problems. The playground uses different chosen rules to expose the mechanisms, so it does not establish that one architecture will outperform another on a trained task.</p></KeepInMind>
        <p>The original <a href="https://doi.org/10.1162/neco.1997.9.8.1735">LSTM paper</a> addresses learning over long time intervals. The implementation here uses a later, commonly used forget-gate form. <Link href="/concepts/attention">Attention</Link> takes a different route by allowing positions to gather information directly from other positions.</p>
      </> },
        {
          title: "Questions on Part 3",
          quiz: [
            choice(
              "Why are the weight contributions from each step added together?",
              [
                "Every step uses the same parameters",
                "Later steps carry more of the error than earlier ones",
                "Each step keeps its own copy of the weights",
                "Averaging them would make the gradient too small",
              ],
              0,
              "One update rule is reused at every step, so a single set of weights receives a contribution from each step and the total is their sum. An LSTM also passes a derivative through the cell memory, so the completed NumPy methods account for that route as well as the route through the hidden state.",
            ),
            trueFalse(
              "Adding gates guarantees that information is kept and removes gradient problems.",
              false,
              "Gates provide ways to retain information; they do not guarantee perfect memory or prevent all gradient problems. The reason for changing the update rule was a controllable route for keeping information, which is weaker than a promise that nothing is lost.",
            ),
            choice(
              "What does attention do differently from a recurrent layer?",
              [
                "It lets positions gather information directly from other positions",
                "It widens the carried state at every step",
                "It removes the need for a candidate",
                "It replaces tanh with sigmoid throughout",
              ],
              0,
              "A recurrent layer moves information forward only through the carried state, so an early reading reaches a late step by passing through every update in between, which is what makes learning across many steps difficult. Attention takes a different route by allowing positions to gather information directly from other positions.",
            ),
            choice(
              "In the playground’s LSTM the forget gate is 0.7311 and the final hidden state responds to input 6 with a derivative of 0.2484. What is the derivative for input 5?",
              [
                "About 0.1816, the derivative for input 6 multiplied by the forget gate",
                "About 0.2484, since the memory route hands a derivative back unchanged",
                "About 0.1242, since every step back halves the derivative",
                "Zero, since input 5 was zero",
              ],
              0,
              "Along the memory route one step back multiplies the derivative by the forget gate and by nothing else, so 0.2484 becomes 0.1816, then 0.1328, 0.0971 and 0.0710. Halving is roughly what the simple cell of Part 1 did, where the factor was the recurrent weight times the slope of tanh. An input of zero still has a derivative, because the derivative says what a small change to that input would do.",
            ),
            trueFalse(
              "Raising the forget gate bias from one to three raises the derivative that reaches the first input.",
              true,
              "At a bias of one the gate is 0.7311 and the first input’s derivative is 0.0218. At three the gate is 0.9526 and the derivative is 0.0754, because each step back along the memory now keeps more. A gate near one is a route that hands the derivative back almost unchanged, which is what the gates were added for, though nothing guarantees that a trained cell will set them that way.",
            ),
        ],
        },
        {
          title: "Practice. Following a Signal With the Library",
          practice: [
            exercise(
              "Follow one signal through the simple cell",
              ["Build the simple cell of Part 1, with an input weight of one, a recurrent weight of one half and a bias of zero, and hand it a sequence of six steps whose first input is one and whose other inputs are zero. Print the state at every step.", "Then ask how far the final state would move for a small change to each input, by sending a slope of one back from the final step alone. Part 1 gave the states as 0.7616 down to 0.0224 and the derivatives as 0.9995 for the last input down to 0.0109 for the first."],
              `import numpy as np
from oop_ml import SimpleRecurrent

steps = 6
layer = SimpleRecurrent(reads=(steps, 1), n_units=1, answers_every_step=True)
weights = np.zeros_like(layer.weights)
# Set the one row of weights to an input weight of 1.0 and a recurrent
# weight of 0.5, and rebuild the layer with those weights and zero biases.

inputs = np.zeros((1, steps, 1))
inputs[0, 0, 0] = 1.0
# Ask the layer to respond to the inputs. Then build a block of zeros the
# shape of its outputs with a one at the final step, send it back with
# correction_for, and print each step's state beside what was passed down
# to that step's input.`,
              `import numpy as np
from oop_ml import SimpleRecurrent

steps = 6
layer = SimpleRecurrent(reads=(steps, 1), n_units=1, answers_every_step=True)
weights = np.zeros_like(layer.weights)
weights[0] = [1.0, 0.5]
layer = layer.with_parameters(weights, np.zeros_like(layer.biases))

inputs = np.zeros((1, steps, 1))
inputs[0, 0, 0] = 1.0
response = layer.respond_to(inputs)

arriving = np.zeros_like(response.outputs)
arriving[0, -1, 0] = 1.0
slopes = layer.correction_for(response, arriving).passed_down

for step in range(steps):
    print(f"step {step + 1}")
    print(f"  state {response.outputs[0, step, 0]:.4f}")
    print(f"  derivative of the final state {slopes[0, step, 0]:.4f}")`,
              `step 1
  state 0.7616
  derivative of the final state 0.0109
step 2
  state 0.3634
  derivative of the final state 0.0519
step 3
  state 0.1797
  derivative of the final state 0.1197
step 4
  state 0.0896
  derivative of the final state 0.2474
step 5
  state 0.0448
  derivative of the final state 0.4987
step 6
  state 0.0224
  derivative of the final state 0.9995`,
              { hints: ["The cell’s weights are one row holding the input weight first and the recurrent weight second, which is the input and the previous state laid end to end. with_parameters answers a new layer and leaves the old one as it was.", "A block of inputs is rows by steps by values, so one sequence of six steps with one value at each is an array of shape (1, 6, 1).", "response.outputs has the same three axes, since this layer answers at every step. The state at a step is response.outputs[0, step, 0].", "correction_for takes the response and the slope arriving at the outputs, and passed_down is what reaches the inputs. A one at the final step and zeros elsewhere asks about the final state only."], check: numberCheck("What is the derivative of the final state with respect to the first input?", 0.0109, 5e-05, "The derivative crosses five state updates on its way back from the sixth step to the first, and each crossing multiplies it by the recurrent weight of one half and by the slope of tanh at that step. The last input, which crosses none, comes out at 0.9995. That is the difficulty Part 1 describes, measured on six steps.") },
            ),
            exercise(
              "Change the recurrent weight",
              ["Part 1 says that different weights can produce different behavior. Run the same six-step signal through the simple cell at recurrent weights of 0.5, 0.9 and 1.5, and print the final state and the derivative of the final state with respect to the first input at each.", "Guess first which of the three lets the most derivative back to the first input. A larger weight keeps more of the state, so it is tempting to say 1.5."],
              `import numpy as np
from oop_ml import SimpleRecurrent

steps = 6
inputs = np.zeros((1, steps, 1))
inputs[0, 0, 0] = 1.0

for recurrent_weight in (0.5, 0.9, 1.5):
    layer = SimpleRecurrent(reads=(steps, 1), n_units=1, answers_every_step=True)
    # Give the layer an input weight of 1.0, this recurrent weight and zero
    # biases. Respond to the inputs, send a slope of one back from the final
    # step alone, and print the final state and the derivative that reaches
    # the first input.`,
              `import numpy as np
from oop_ml import SimpleRecurrent

steps = 6
inputs = np.zeros((1, steps, 1))
inputs[0, 0, 0] = 1.0

for recurrent_weight in (0.5, 0.9, 1.5):
    layer = SimpleRecurrent(reads=(steps, 1), n_units=1, answers_every_step=True)
    weights = np.zeros_like(layer.weights)
    weights[0] = [1.0, recurrent_weight]
    layer = layer.with_parameters(weights, np.zeros_like(layer.biases))

    response = layer.respond_to(inputs)
    arriving = np.zeros_like(response.outputs)
    arriving[0, -1, 0] = 1.0
    slopes = layer.correction_for(response, arriving).passed_down

    print(f"recurrent weight {recurrent_weight}")
    print(f"  final state {response.outputs[0, -1, 0]:.4f}")
    print(f"  derivative for the first input {slopes[0, 0, 0]:.4f}")`,
              `recurrent weight 0.5
  final state 0.0224
  derivative for the first input 0.0109
recurrent weight 0.9
  final state 0.3102
  derivative for the first input 0.0796
recurrent weight 1.5
  final state 0.8574
  derivative for the first input 0.0061`,
              { hints: ["The loop builds a fresh layer each time, so the three cells differ in the one number written into the second place of the weight row.", "The final state is the last step of the one sequence, response.outputs[0, -1, 0], and the first input’s derivative is passed_down[0, 0, 0].", "One step back multiplies the derivative by the recurrent weight and by the slope of tanh, which is one minus the square of the state. Look at what the state is doing at 1.5 before explaining its derivative."], check: numberCheck("At a recurrent weight of 0.9, what derivative reaches the first input?", 0.0796, 5e-05, "At 0.9 each step back keeps most of the derivative, and 0.0796 arrives where one half let 0.0109 through. At 1.5 the state does not fade at all, ending at 0.8574, yet only 0.0061 arrives, less than at one half. A state near 0.86 sits where tanh is flat, with a slope of about 0.26, so the last step back multiplies by about 0.4 and the earlier ones by not much more. The weight is one of the two factors and the slope of tanh is the other.") },
            ),
            exercise(
              "Move the forget gate",
              ["Build the playground’s LSTM, whose candidate reads the input with a weight of one and whose gates have no weights at all, and run the six-step signal through it at a forget gate bias of one and then of two.", "At a bias of one, Part 2 gave the memory as 0.3808 falling to 0.0795 and Part 3 gave the first input’s derivative as 0.0218. A bias of two is on neither table, so the second half of the output is yours to read."],
              `import numpy as np
from oop_ml import LongShortTermMemory

steps = 6
inputs = np.zeros((1, steps, 1))
inputs[0, 0, 0] = 1.0

for forget_bias in (1.0, 2.0):
    layer = LongShortTermMemory(reads=(steps, 1), n_units=1, answers_every_step=True)
    weights = np.zeros_like(layer.weights)
    biases = np.zeros_like(layer.biases)
    weights[LongShortTermMemory.CANDIDATE] = [1.0, 0.0]
    # Set the forget gate's bias, rebuild the layer with these weights and
    # biases, and respond to the inputs. Print the forget gate at the first
    # step, the cell memory at every step, and the derivative of the final
    # hidden state with respect to the first input.`,
              `import numpy as np
from oop_ml import LongShortTermMemory

steps = 6
inputs = np.zeros((1, steps, 1))
inputs[0, 0, 0] = 1.0

for forget_bias in (1.0, 2.0):
    layer = LongShortTermMemory(reads=(steps, 1), n_units=1, answers_every_step=True)
    weights = np.zeros_like(layer.weights)
    biases = np.zeros_like(layer.biases)
    weights[LongShortTermMemory.CANDIDATE] = [1.0, 0.0]
    biases[LongShortTermMemory.FORGET] = forget_bias
    layer = layer.with_parameters(weights, biases)

    response = layer.respond_to(inputs)
    arriving = np.zeros_like(response.outputs)
    arriving[0, -1, 0] = 1.0
    slopes = layer.correction_for(response, arriving).passed_down

    memory = ", ".join(f"{step.cell[0, 0]:.4f}" for step in response.steps)
    print(f"forget gate bias {forget_bias}")
    print(f"  forget gate {response.steps[0].gates[0][1]:.4f}")
    print(f"  memory {memory}")
    print(f"  derivative for the first input {slopes[0, 0, 0]:.4f}")`,
              `forget gate bias 1.0
  forget gate 0.7311
  memory 0.3808, 0.2784, 0.2035, 0.1488, 0.1088, 0.0795
  derivative for the first input 0.0218
forget gate bias 2.0
  forget gate 0.8808
  memory 0.3808, 0.3354, 0.2954, 0.2602, 0.2292, 0.2019
  derivative for the first input 0.0535`,
              { hints: ["The LSTM stacks its gates down the rows of one weight block and one bias block, and the class names the rows, so the forget gate’s bias is biases[LongShortTermMemory.FORGET].", "response.steps holds one record per step. Each has cell, the memory after that step, and gates, the values the step calculated, in the order the playground lists them, input gate, forget gate, candidate, output gate.", "The derivative comes back the way it did for the simple cell, a one at the final step sent through correction_for and read off passed_down."], check: numberCheck("At a forget gate bias of two, what derivative reaches the first input?", 0.0535, 5e-05, "At a bias of two the forget gate is sigmoid(2), 0.8808, so each step keeps about 88 percent of the memory and 0.2019 of the first step’s 0.3808 is left after six. The derivative crosses the same five steps on its way back and pays 0.8808 at each, which brings 0.0535 to the first input where a bias of one, with its gate of 0.7311, brought 0.0218.") },
            ),
          ],
        },
    ]} />;
}
