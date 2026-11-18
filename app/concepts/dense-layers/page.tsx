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
import { BlockPass } from "@/components/widgets/BlockPass";
import { CarvingSweep } from "@/components/widgets/CarvingSweep";
import { ChainChecker } from "@/components/widgets/ChainChecker";
import { DenseForwardPlayground } from "@/components/widgets/DenseForwardPlayground";
import { FoldLines } from "@/components/widgets/FoldLines";
import { LayerJoinChecker } from "@/components/widgets/LayerJoinChecker";
import { MatrixForm } from "@/components/widgets/MatrixForm";
import { ResponseLedger } from "@/components/widgets/ResponseLedger";
import { RouteAgreement } from "@/components/widgets/RouteAgreement";
import { SharedRowLedger } from "@/components/widgets/SharedRowLedger";
import { WidthAgainstDepth } from "@/components/widgets/WidthAgainstDepth";

export const metadata: Metadata = pageMetadata("/concepts/dense-layers", {
  title: "A Dense Layer and the Forward Pass · Perceptron Lab",
  description:
    "A dense layer applies several neurons to the same inputs. Each neuron learns its own weighted combination, producing a collection of outputs that another layer can use.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function DenseLayersPage() {
  return (
    <ConceptPage
      lessonId="dense-layers"
      intuition={lessonIntuitions["dense-layers"]}
      technicalStart="Part 2. The Matrix Form"
      openingTitle="Several Neurons Read the Same Example"
      playgroundTitle="Follow the inputs through a layer of neurons"
      playgroundIntro="Follow one example through the neurons. Compare each neuron's inputs, score, and activated output before following the next layer."
      title="A Dense Layer and the Forward Pass"
      tagline={"A dense layer applies several neurons to the same inputs. Each neuron learns its own weighted combination, producing a collection of outputs that another layer can use."}
      prerequisites={<>The <Link href="/concepts/neurons-and-activations" className={link}>neurons page</Link> introduces weights, bias and activation. The <Link href="/primers/linear-algebra" className={link}>linear algebra primer</Link> explains the matrix multiplication used here. We will follow the same input row again in <Link href="/concepts/backpropagation" className={link}>backpropagation</Link>, where the saved values from this forward pass are used to calculate gradients.</>}

      playground={<DenseForwardPlayground />}
      sections={[
        {
          title: "Part 1. Many Neurons, One Row",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Three neurons reading the same two numbers">
                <p>
                  Take one person in standardized units: (1, 2) means one standard deviation taller than average and two heavier. One neuron reads this row and returns one output. What if we want several different responses to the same measurements? We can give the row to three neurons, each with its own weights and bias. Their outputs form the next layer&apos;s input.
                </p>
                <p>
                  Nothing about any neuron has changed. Each still holds one weight per input and a bias, forms its score, applies its activation function, and passes on the output.
                </p>
                <SharedRowLedger />
                <WorkedExample title="The three scores">
                  <>
                    <p>
                      All three neurons read the same input, (1, 2), but each has its
                      own weights. Their biases are zero. Calculate their scores
                      separately before applying the rectifier.
                    </p>
                    <Equation>{"neuron 1: 1 × 1 + 1 × 2 + 0 = 3\nneuron 2: 1 × 1 + (−1) × 2 + 0 = −1\nneuron 3: (−1) × 1 + 1 × 2 + 0 = 1\n\nReLU(3, −1, 1) = (3, 0, 1)"}</Equation>
                    <p>
                      The next layer receives the three outputs as one row. Switching to
                      sigmoid keeps the scores unchanged but changes their outputs.
                    </p>
                    <Equation>{"sigmoid(3, −1, 1) ≈ (0.9526, 0.2689, 0.7311)"}</Equation>
                  </>
                </WorkedExample>
                <KeepInMind>
                  A dense layer contains several neurons that read the same input row. Each neuron has its own weights and bias, so each can produce a different response to that input.</KeepInMind>
              </SubSection>

              <SubSection title="2. Why the widths inside a layer cannot disagree">
                <p>Every neuron in this dense layer receives the same row. A neuron with two weights needs two input values; one with three weights needs three. Putting both in the same layer leaves no row width that can satisfy them.</p>
                <p>The SDK checks the neurons’ input widths when constructing the layer. For widths of two and three, it reports “every neuron in a layer reads the same row, so they must agree on its width, got [2, 3]”. The mismatch is caught before a forward pass starts.</p>
                <Equation>{"a layer of m neurons over n inputs holds exactly n weights in every neuron"}</Equation>
                <p>
                  The neurons page already made the count of weights the
                  input width, since a dot product with a row of another
                  length is undefined. A layer inherits that and adds one
                  rule on top, that all of its members hold the same count.
                  That rule is the first link in a chain that ends with a
                  whole network&rsquo;s shape being decidable before any data
                  exists, which Part 4 is about.
                </p>
                <KeepInMind>
                  The width a layer reads belongs to the layer, and every
                  neuron in it holds exactly that many weights. A group whose
                  neurons disagree is refused when it is built.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Input Width and Output Width" id="3-the-width-answered-owes-nothing-to-the-width-read">
                <p>Three neurons produce three outputs whether each reads two inputs or two hundred. The input width must match the data or preceding layer. The output width is the number of neurons we choose for this layer, and it determines how many inputs the next layer must accept. Choosing widths is one part of designing a network, alongside its depth, connections and activation functions.</p>
                <Equation>{"reads (n,)   answers (m,)        here (2,) and (3,)"}</Equation>
                <p>Widening a hidden layer changes its output width and the next layer’s required input width. It does not change how many values this layer reads. In the playground, the hidden layer reads (2,) and outputs (3,). The output layer must therefore read (3,); its single neuron produces (1,).</p>
                <KeepInMind>
                  A layer&rsquo;s two widths are independent. What it reads is
                  decided by whatever feeds it; what it answers is how many
                  neurons it holds.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Counting the parameters">
                <>
                  <p>
                    A dense layer has one weight for every input-output connection and
                    one bias per output neuron. Count the two layers separately.
                  </p>
                  <Equation>{"hidden layer = 2 inputs × 3 neurons + 3 biases = 9\noutput layer = 3 inputs × 1 neuron + 1 bias = 4\nnetwork total = 9 + 4 = 13"}</Equation>
                  <p>
                    The playground reports the same total.
                  </p>
                </>
                <Equation>{"parameters in a layer = m · n + m\n\nhidden  3 · 2 + 3 =  9\noutput  1 · 3 + 1 =  4\nnetwork              13"}</Equation>
                <p>The thirteen learned parameters determine the weighted sums in this network. Activations then transform those scores. Changing a parameter changes the next forward calculation; the playground updates each displayed score and output so we can trace its effect. Part 3 explains the intermediate values a pass saves for training.</p>
                <InAModel title="On the crowd">
                  <>
                    <p>
                      Both networks in Part 5 read two measurements and produce one
                      answer. The first has one hidden layer of six neurons; the second
                      has two hidden layers of three. Count weights and biases layer by
                      layer.
                    </p>
                    <Equation>{"one hidden layer:  (2 × 6 + 6) + (6 × 1 + 1) = 25\ntwo hidden layers: (2 × 3 + 3) + (3 × 3 + 3) + (3 × 1 + 1) = 25"}</Equation>
                    <p>
                      They have the same parameter count. That lets us compare the
                      effects of their different arrangements without also changing how
                      many parameters they can learn.
                    </p>
                  </>
                </InAModel>
                <KeepInMind>
                  A dense layer with m neurons and n inputs has m · n weights and m biases. That parameter count grows with both widths. Processing a large batch also requires space for its intermediate scores and outputs.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Matrix Form",
          content: (
            <>
              <SubSection title="5. Stacking the weight rows into a matrix">
                <p>
                  Each hidden neuron&rsquo;s weights are a row of two numbers,
                  and three such rows stacked one under another are a matrix
                  with three rows and two columns. Nothing has been computed
                  yet; the three neurons&rsquo; weights have only been written
                  down together. But written that way, the three dot products
                  the last section formed one at a time are one matrix
                  multiply, the linear algebra primer&rsquo;s, and the three
                  biases are one vector added afterwards.
                </p>
                <Equation>{"z = W x + b\n\nW = [  1   1 ]      x = [ 1 ]      b = [ 0 ]      z = [  3 ]\n    [  1  −1 ]          [ 2 ]          [ 0 ]          [ −1 ]\n    [ −1   1 ]                         [ 0 ]          [  1 ]"}</Equation>
                <MatrixForm />
                <WorkedExample title="Row two of the multiply">
                  <>
                    <p>
                      Choose the second neuron. Its row of W lights up beside the input
                      vector. That row performs the same calculation we worked through
                      in section 1.
                    </p>
                    <Equation>{"z₂ = 1 × 1 + (−1) × 2 + 0 = −1"}</Equation>
                    <p>
                      Each matrix row computes one neuron’s score. Matrix multiplication
                      collects those separate calculations into one operation.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  A layer&rsquo;s weight matrix has one row per neuron and one
                  column per input. The matrix multiply is the layer&rsquo;s
                  dot products, all at once; it introduces no new arithmetic.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Why the matrix has the shape it has">
                <p>
                  The shape of W is (neurons, inputs), and both the order and
                  the reason for it are worth having straight, because the
                  transposed convention is common and reads differently. A
                  row of W is a neuron, so reading across a row gives one
                  neuron&rsquo;s weights in input order, and the number of
                  rows is the width the layer answers with. A column of W is
                  an input, so reading down a column gives every
                  neuron&rsquo;s weight on that one input, and the number of
                  columns is the width the layer reads.
                </p>
                <Equation>{"W is (m, n)         W x is (m, n)(n, 1) = (m, 1)"}</Equation>
                <p>
                  The multiply conforms exactly when the matrix&rsquo;s column
                  count equals the row&rsquo;s length, which is section
                  2&rsquo;s agreement about width said in the primer&rsquo;s
                  vocabulary. The hidden layer&rsquo;s W is (3, 2) and reads a
                  row of two; the output layer&rsquo;s is (1, 3) and reads the
                  three hidden outputs. Each neuron is kept as its own object,
                  because the neuron is the unit that was learned about, and
                  the matrix is assembled once when the layer is built, so a
                  pass is one multiply per layer rather than a loop over
                  neurons.
                </p>
                <KeepInMind>
                  Rows are neurons, columns are inputs, and the shape (m, n)
                  is the layer&rsquo;s two widths in the order answered,
                  read. A transposed convention holds the same numbers the
                  other way round, and the page keeps to this one.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. A block of people in one multiply">
                <p>
                  One person is one row. Three people are three rows stacked
                  into a block, and the same matrix multiply handles all of
                  them in one call, because multiplying a block by the
                  transposed weight matrix forms every person&rsquo;s dot
                  product with every neuron at once. The block that comes out
                  has one row per person still, and one column per neuron,
                  so a layer keeps the people axis and replaces the other
                  axis with its own width.
                </p>
                <Equation>{"Z = X Wᵀ + b        (rows, n)(n, m) = (rows, m)"}</Equation>
                <p>To calculate every person’s score at every neuron, each row of X must be paired with a neuron’s weight vector. Both are stored as rows, while matrix multiplication pairs a row on the left with a column on the right. Transposing W puts each neuron’s weights into a column without changing their values. Entry (i, j) of the product is then the score for person i at neuron j, before adding the bias.</p>
                <p>
                  The bias vector is added to every row alike, because a
                  neuron&rsquo;s bias does not depend on which person it is
                  reading. Nothing in one row of Z depends on any other row
                  of X, so a block is not a new kind of input. It is several
                  separate passes that happen to share one call.
                </p>
                <BlockPass />
                <WorkedExample title="Three people through the two layers">
                  <p>Stack the profiles (1, 2), (0, 0) and (−1, 0.5) into a block of shape (3, 2). The rows describe the taller, heavier person, a person at both measurement means, and a person one deviation shorter and half a deviation heavier.</p>
<p>After ReLU, the hidden output block has shape (3, 3), with rows (3, 0, 1), (0, 0, 0) and (0, 0, 1.5). The final output block has shape (3, 1), holding 5, 0 and 3. The calculation below follows the third row separately.</p>
                  <p>
                    The first person is the row worked in section 1. The third
                    person&rsquo;s row of each block is the same arithmetic on
                    different inputs.
                  </p>
                  <Equation>{"person (−1, 0.5)\n\nneuron 1: 1 × (−1) + 1 × 0.5 = −0.5          ReLU → 0\nneuron 2: 1 × (−1) + (−1) × 0.5 = −1.5       ReLU → 0\nneuron 3: (−1) × (−1) + 1 × 0.5 = 1.5        ReLU → 1.5\n\noutput:   1 × 0 + (−1) × 0 + 2 × 1.5 = 3"}</Equation>
                  <p>
                    The average person scores zero at every neuron, because every bias is zero.
                  </p>
                </WorkedExample>
                <p>
                  The third button sends a row three numbers wide. The
                  request lets it through on purpose, so that the layer meets
                  it, and the layer refuses it with &ldquo;this layer reads
                  (2,), got a block arranged (3,)&rdquo;. That sentence is
                  quoted word for word, and Part 4 says why it is phrased
                  in terms of an arrangement rather than a count.
                </p>
                <KeepInMind>
                  The matrix form&rsquo;s real payoff is a whole block of
                  people in one multiply. The first axis of every block is the
                  people, and each layer keeps it.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The activation function is applied one entry at a time">
                <p>
                  After the weighted sums, each neuron applies its activation to its own score. An elementwise activation therefore keeps the shape of z, and we can apply it across the layer in one call. Softmax behaves differently: each output depends on the whole row of scores. That is why it is treated separately from the four elementwise activations here.
                </p>
                <Equation>{"a = f(z), entry by entry\n\nrectifier   (3, −1, 1) → (3, 0, 1)\nsigmoid     (3, −1, 1) → (0.9526, 0.2689, 0.7311)\ntangent     (3, −1, 1) → (0.9951, −0.7616, 0.7616)"}</Equation>
                <p>In this SDK, each neuron owns its activation function. A layer can therefore mix an identity activation with a sigmoid. The tested mixed layer returns (3, 0.2689) for the supplied row. A shared activation across the layer is a common design choice that also permits one vectorized activation call across the output block. It is not required by the definition of a dense layer.</p>
                <KeepInMind>
                  An elementwise activation preserves the score block’s shape. When every neuron uses the same activation, the SDK applies it in one call to the whole block. Mixed activations require applying the appropriate function to each neuron’s column.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "A layer holds three neurons, and each neuron holds two weights and a bias. What does the layer read, and what does it answer with?",
              [
                "It reads (2,) and answers (3,)",
                "It reads (3,) and answers (2,)",
                "It reads (2,) and answers (2,)",
                "It reads (6,) and answers (1,)",
              ],
              0,
              "Every neuron in a layer is handed the same row, so the count of weights each one holds is the width the layer reads, and a group whose neurons disagree about it is refused when it is built. The width answered is how many neurons there are, three here, and it owes nothing to the width read. Three neurons answer with three numbers whether they read two inputs or two hundred.",
            ),
            choice(
              "A hidden layer of three neurons over two inputs, and an output layer of one neuron over three, hold how many numbers between them?",
              ["6", "9", "13", "26"],
              2,
              "Count a weight for each input-to-neuron connection and a bias for each neuron. The hidden layer has six weights and three biases; the output layer has three weights and one bias. There are thirteen trainable parameters altogether. Intermediate scores and activations are calculated from them and are not additional trainable parameters.",
            ),
            choice(
              "The weight matrix here is arranged as (neurons, inputs). What does reading down one of its columns give?",
              [
                "One neuron’s weights, in input order",
                "Every neuron’s weight on one input",
                "The biases",
                "The scores for one person",
              ],
              1,
              "A row of W is a neuron and a column of W is an input, so the number of rows is the width the layer answers with and the number of columns is the width it reads. The transposed convention is common and holds the same numbers the other way round, which is why the order is worth having straight.",
            ),
            trueFalse(
  "A batch with shape (3,2) passed through this hidden layer has output shape (3,3).",
  true,
  "A layer keeps the people axis and replaces the other axis with its own width, so three rows of two become three rows of three, one column per neuron. The rows are (3, 0, 1), (0, 0, 0) and (0, 0, 1.5), and the output layer then answers a (3, 1) block holding 5, 0 and 3. Each row is a separate pass, and nothing in one person’s row depends on anyone else’s.",
  {
    "description": "Batch dimension is first and each neuron returns one scalar.",
    "data": "Inputs per observation: 2\nHidden neurons: 3\nInput batch: 3 observations"
  },
),
            several(
  "Which statements hold for the oop_ml dense layer described here?",
  [
                  "It is applied to each score on its own, so the outputs have the scores’ shape",
                  "A layer that mixes them, a straight first neuron and a sigmoid second, is accepted",
                  "Softmax is one of the four offered here",
                  "Switching the rectifier for the sigmoid changes the scores (3, −1, 1)",
                ],
  [0, 1],
  "After the multiply each neuron transforms only its own score, which is what lets one call serve a whole block. Each neuron carries its own activation function, so a mixed layer is accepted, and a uniform layer is ordinary practice rather than a law. Softmax is left out because it reads a whole row of scores to answer any one of them. Switching the activation leaves the scores (3, −1, 1) alone and changes only the outputs, (3, 0, 1) under the rectifier and about (0.9526, 0.2689, 0.7311) under the sigmoid.",
  {
    "description": "Use the course implementation rather than assuming every framework has the same constructor interface.",
    "data": "Each neuron may have its own scalar activation. The supported scalar choices here are identity, sigmoid, tanh and ReLU.\nAt the example input, preactivation scores are [3,-1,1]."
  },
),
        ],
        },
        {
          title: "Part 3. The Forward Pass",
          content: (
            <>
              <SubSection title="9. What one layer keeps from a pass">
                <p>{"The layer returns a record containing its inputs, scores and activated outputs. Keeping them together prevents a backward pass from accidentally pairing values from different forward calls. Scores and outputs have the same shape because matching positions describe the same neuron and observation; the input block has the same observation count."}</p>
                <ResponseLedger />
                <p>
                  On the running row the hidden layer&rsquo;s response holds
                  inputs (1, 2), scores (3, −1, 1) and outputs (3, 0, 1), and
                  the output layer&rsquo;s holds inputs (3, 0, 1), score 5 and
                  output 5. The response reports two facts about itself
                  besides, how many rows went through and how many neurons
                  answered, which are the two axes of its blocks.
                </p>
                <KeepInMind>
                  A layer&rsquo;s response is three aligned blocks, what it
                  read, what it scored and what it answered. The next layer
                  reads the third; the other two are kept for a reason the
                  next section gives.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The chain, each layer reading what the one beneath answered">
                <p>
                  The forward pass is section 5&rsquo;s two lines applied
                  once per layer, with one rule joining them. The first layer
                  reads the person, every later layer reads what the layer
                  beneath answered, and the last layer&rsquo;s outputs are the
                  network&rsquo;s answer. Written as matrices, with a subscript
                  for the layer, the whole of the running network is four
                  lines.
                </p>
                <Equation>{"z₁ = W₁ x + b₁        h = f₁(z₁)\nz₂ = W₂ h + b₂        y = f₂(z₂)"}</Equation>
                <WorkedExample title="The four lines at the row">
                  <>
                    <p>
                      The hidden scores are (3, −1, 1). ReLU turns them into (3, 0, 1),
                      which become the output neuron’s inputs. Its weights are (1, −1,
                      2) and its bias is zero.
                    </p>
                    <Equation>{"output score = 1 × 3 + (−1) × 0 + 2 × 1 + 0 = 5\nidentity(5) = 5"}</Equation>
                    <p>
                      The second connection contributes nothing because it multiplies a
                      zero, which is why the playground draws it faint. Changing the
                      hidden activation to sigmoid makes that input nonzero and changes
                      the final answer.
                    </p>
                    <Equation>{"sigmoid hidden outputs ≈ (0.9526, 0.2689, 0.7311)\nfinal output ≈ 1 × 0.9526 − 0.2689 + 2 × 0.7311 ≈ 2.1457"}</Equation>
                    <p>
                      Using the hyperbolic tangent for the hidden activation gives a
                      final output of about 3.2798.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  One response is kept per layer and the whole list handed
                  back, with the last layer&rsquo;s outputs
                  reachable directly so that an ordinary caller never indexes
                  into the list at all. A deeper network is the same
                  alternation continued, an affine map, an activation function, an affine
                  map, an activation function, for as many layers as were stacked.
                </p>
                <KeepInMind>
                  The pass is a chain in which the block handed to each layer
                  is the previous response&rsquo;s outputs, and the first
                  block is the caller&rsquo;s own. The answer is the last
                  layer&rsquo;s outputs and nothing more.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Why the scores are kept, and the inputs too">
                <p>A forward pass produces the values the next layer needs. Training also needs derivatives, which describe how a small change would affect the result. The SDK keeps the inputs, scores and outputs from this pass so its backward calculation can reuse them. Different activations need different saved quantities. For example, the sigmoid derivative can be calculated from its output, while an activation can also be differentiated from its input score. Keeping all three is this implementation&apos;s choice, rather than a requirement to recover every score from an output.</p>
                <p>A weight’s gradient also depends on the input value it multiplied. Saving the input block in the layer’s response lets the backward calculation use the same values that produced these scores.</p>
                <Equation>{"kept per layer:   inputs, scores, outputs\nread forward:     outputs only\nread backward:    all three"}</Equation>
                <p>The <Link href="/concepts/backpropagation" className={link}>backpropagation page</Link> uses these saved blocks in reverse layer order. Keeping each layer’s inputs in its own response avoids reconstructing them from the preceding layer’s outputs. The backward calculation can read the required values directly from the matching response.</p>
                <KeepInMind>
                  This response caches the intermediate values used by the
                  backward calculation. The inputs are needed for the weight
                  derivatives. An activation derivative can use its score or,
                  for functions such as sigmoid, its saved output. The cache
                  avoids repeating the forward calculation.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Why a pass says why it is happening">
                <p>Dense, convolutional and pooling layers use the same forward calculation during training and prediction. Some other layers behave differently. Dropout randomly removes selected activations during training. Batch normalization uses the current batch’s statistics while training and stored statistics when predicting.</p>
                <p>
                  So every pass here states its purpose, predicting or training, and hands it to every layer whether or not the layer reads it, so that a layer which starts caring later does not change the interface for the rest.
                </p>
                <Equation>{"purpose ∈ {predicting, training}        the default is predicting"}</Equation>
                <p>This API defaults to predicting. That keeps dropout inactive and makes batch normalization use its stored statistics. A training pass must request training behavior so those layers operate as intended. Using the wrong purpose can change both the outputs and the model state; the effect is more than a change in learning speed. The <Link href="/concepts/dropout" className={link}>dropout page</Link> demonstrates the difference.</p>
                <KeepInMind>
                  A pass carries its purpose. A dense layer ignores it, and
                  the layers that cannot ignore it are the reason it exists.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Two routes to one answer, and how far apart they are">
                <p>The SDK provides two ways to inspect a dense layer. The matrix implementation processes a block efficiently. The neuron-by-neuron route returns the separate calculations for a single row, which is useful for the diagram. Tests compare the results so the display and the computation used in training stay consistent.</p>
                <p>The results can differ slightly because floating-point products may be accumulated in a different order. Compare them with a numerical tolerance rather than requiring every stored bit to match.</p>
                <RouteAgreement />
                <InAModel title="Measured">
                  <p>
                    On the running network, two and three inputs wide, the two routes agree exactly, a gap of 0. On a seeded layer of eight neurons reading eight inputs the largest gap in the scores is 4.4 × 10⁻¹⁶, and on sixty-four neurons reading sixty-four inputs, 4,160 parameters, it is 7.1 × 10⁻¹⁵ in the scores and 5.3 × 10⁻¹⁵ in the outputs.
                  </p>
                  <p>{"The two implementations can add the same sixty-four products in different orders. Floating-point addition does not preserve every small contribution equally in every order, which explains a difference in the fifteenth decimal place. The scores beneath the sliders agree apart from their last digit or two."}</p>
                </InAModel>
                <KeepInMind>
                  The loop and the multiply are the same calculation, and
                  they are not the same floating-point calculation. Agreement
                  between them is asserted with a tolerance, never with
                  equality.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Shapes and the Join",
          content: (
            <>
              <SubSection title="14. A shape is a pair of tuples, not a pair of numbers">
                <p>A shape records how values are arranged along each axis. A dense layer reads a row, so its input shape has one entry, such as (2,). Its output shape might be (3,). Python uses a trailing comma to distinguish a one-entry tuple from a parenthesized number. A convolution instead works with several axes: channels, height and width.</p>
                <p>A convolution’s output can contain the same total number of values as a dense layer expects and still have the wrong arrangement. A stack of feature maps has separate channel, height and width axes. A dense layer expects one feature axis, so a flattening operation is needed to connect these representations.</p>
                <Equation>{"dense        reads (2,)          answers (3,)\nconvolution  reads (1, 28, 28)   answers (8, 26, 26)\n\n8 · 26 · 26 = 5408 = (5408,) as a count, and not as an arrangement"}</Equation>
                <p>Equal element counts therefore do not establish that two layers can connect. The <Link href="/concepts/shapes-and-flattening" className={link}>shapes and flattening page</Link> follows the conversion from feature maps to a feature row. Reporting complete shape tuples makes a missing conversion visible, even when both sides hold 5408 numbers.</p>
                <KeepInMind>
                  A layer&rsquo;s shape is what it reads and what it answers,
                  each an arrangement. A dense layer&rsquo;s arrangements are
                  one-entry tuples, and the comma in (2,) is not decoration.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Two layers join when one answers what the other reads">
                <p>
                  Two layers fit together when the one above reads exactly
                  what the one beneath answers, and that is a sentence about
                  two shapes, so it belongs to the shape rather than to
                  whichever loop is assembling a network. The two boxes
                  below state their four widths and nothing else. Set them,
                  and the verdict comes back with no row
                  sent, in the same words a real mismatch would produce hours
                  into a training run if nobody had checked first.
                </p>
                <Equation>{"above follows beneath   ⇔   beneath.answers == above.reads"}</Equation>
                <LayerJoinChecker />
                <p>
                  Only the seam is checked. The left box&rsquo;s reads and the
                  right box&rsquo;s answers are the network&rsquo;s two ends,
                  which the data and the task decide, and a layer reading
                  eight and answering five joins one reading five and
                  answering eight without complaint, since the seam between
                  them holds.
                </p>
                <KeepInMind>
                  A join is one equality between two tuples. It is settled by
                  the layers&rsquo; own shapes, and no data is needed to ask
                  it.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. The whole chain is checked at construction, and the seam is named">
                <p>The stack constructor checks every adjacent pair of layers before accepting the network. If an output shape differs from the next input shape, construction fails with the two shapes identified. This validates the configured connections before processing a batch. Each layer still validates the actual block it receives during a forward pass.</p>
                <p>For three layers, the constructor checks two adjacent joins. These checks compare shape tuples and do not need a training batch or a forward calculation.</p>
                <ChainChecker />
                <WorkedExample title="A chain of three">
                  <p>
                    Layers reading 2 and answering 3, reading 3 and answering
                    4, reading 4 and answering 1 make a stack that reads (2,)
                    and answers (1,) across two seams, holding thirty
                    parameters. Change the last layer to read 5 and the stack
                    refuses to be built, with &ldquo;layer 1 answers with (4,) and
                    layer 2 reads (5,)&rdquo;. Break the first seam as well and
                    it is the first that is named, since the walk stops at
                    the first seam that fails.
                  </p>
                  <p>
                    The thirty is section 4&rsquo;s count taken once per
                    layer, and the two seams are the two places where one
                    layer&rsquo;s answering width has to equal the next
                    layer&rsquo;s reading width.
                  </p>
                  <Equation>{"parameters = (2 × 3 + 3) + (3 × 4 + 4) + (4 × 1 + 1) = 9 + 16 + 5 = 30\n\nseam 0 to 1:  answers (3,)  reads (3,)   holds\nseam 1 to 2:  answers (4,)  reads (4,)   holds\n\nwith the last layer reading 5\nseam 1 to 2:  answers (4,)  reads (5,)   refused"}</Equation>
                </WorkedExample>
                <WhyThisWorks title="Why the check belongs to an object">
                  <p>
                    A rule spanning several values belongs to an object that
                    enforces it in its constructor, so that a value of that
                    type cannot exist in a broken state. That is the same
                    reason a feature set validates its columns together and a
                    layer validates its neurons&rsquo; widths together. A free
                    check function has to be remembered by every caller, and
                    a constructor that refuses does not.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The stack rejects incompatible layer shapes before training begins and identifies the join that failed. This catches arrangement errors early; it does not guarantee that the resulting network will learn a useful model.</KeepInMind>
              </SubSection>

              <SubSection title="17. Only the two ends are the data's business">
                <p>The stack reports the first layer’s input shape and the final layer’s output shape. Here that is (2,) → (1,). The two input positions match our measurements. The single output matches this prediction task. Other tasks can require a vector, such as one score per class. The intermediate shapes describe how the network transforms those inputs.</p>
                <Equation>{"stack reads (2,)  ←  two measurements per person\nstack answers (1,)  →  one number per person"}</Equation>
                <p>The first layer checks the incoming block against its declared input shape. Each later layer also checks the block it receives, although the stack has already checked that its configured joins agree. Shape checks still cannot identify a semantic mistake such as swapping height and body-weight columns: the row would have the right width.</p>
                <p>For example, (2, 1) produces 2 in this network, while (1, 2) produces 5. The weights are matched to inputs by position. A caller must keep the feature order used to build or train the network.</p>
                <KeepInMind>
                  Two widths belong to the data, the first layer&rsquo;s reads
                  and the last layer&rsquo;s answers. The first layer checks
                  the one it can; the order of the columns is the
                  caller&rsquo;s to keep.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "At the running row the hidden outputs under the rectifier are (3, 0, 1), and the output neuron holds weights (1, −1, 2) and no bias under the identity. What does the network answer?",
              ["5", "6", "4", "2"],
              0,
              "The three hidden outputs contribute through their matching output weights. Their contributions total 5, and the identity activation leaves that score unchanged. The middle connection contributes zero because its hidden output is zero. With identity in the hidden layer too, the negative hidden score would contribute instead, producing 6 for the same input.",
            ),
            choice(
              "Why does this SDK's layer response cache scores as well as outputs?",
              [
                "So the forward pass can be repeated without the inputs",
                "To supply intermediate values directly when calculating activation derivatives during training",
                "Because the next layer reads the scores rather than the outputs",
                "To compare the matrix multiply against the loop",
              ],
              1,
              "The SDK saves inputs, scores and outputs from the same forward pass for its backward calculation. That is a convenient cache policy. It does not mean every activation requires its original score: the sigmoid derivative can be calculated from the saved sigmoid output. Weight derivatives also need the inputs that produced those outputs.",
            ),
            trueFalse(
  "Under this SDK's exact per-sample shape check, a convolution output of (8,26,26) cannot directly enter a dense layer that expects (5408,).",
  true,
  "The convolution output is arranged as eight grids, each with 26 rows and 26 columns. The dense layer expects one flat row of 5,408 values. These shapes contain the same number of entries, but the SDK compares their arrangements too. A flattening layer makes the intended conversion explicit.",
  {
    "description": "This stack checks exact per-sample shape tuples and does not insert a flattening operation automatically.",
    "data": "Convolution output shape: (8,26,26)\nDense input shape: (5408,)\nBoth contain 5408 values."
  },
),
            several(
  "Under this stack-building contract, which statements hold for the three layers?",
  [
                  "The stack reads (2,) and answers (1,) across two seams",
                  "It holds thirty parameters",
                  "Changing the last layer to read 5 is refused when the stack is built, before any row exists",
                  "With the first seam broken as well, the refusal names the first seam",
                ],
  [0, 1, 2, 3],
  "The three layers hold 30 weights and biases altogether. The stack takes its input shape from the first layer and its output shape from the last. Each intermediate output must match the next layer’s input shape. The constructor reports the first mismatch, including the layer positions and the two incompatible shapes.",
  {
    "description": "Each dense neuron has one weight per input and one bias. The stack constructor checks adjacent shape tuples in order and stops at the first mismatch.",
    "data": "Layer widths: 2 -> 3 -> 4 -> 1"
  },
),
            trueFalse(
              "Handing the running network (2, 1) in place of (1, 2) is caught by the first layer’s width check.",
              false,
              "Both rows contain two values, so both pass the width check. The first weight still multiplies the first value and the second weight still multiplies the second. Reversing the values therefore changes the output from 5 to 2. Keep feature order consistent when preparing inputs; a shape check cannot check their meaning.",
            ),
        ],
        },
        {
          title: "Part 5. Width and Depth",
          content: (
            <>
              <SubSection title="18. Two layers without a nonlinear activation are one layer">
                <p>
                  Before asking what a second layer buys, ask what it buys
                  when only affine operations occur between the two. Set both activation functions to the
                  identity and the four lines of section 10 substitute into
                  one, a single affine map from the person straight to the
                  answer with matrix W₂ W₁ and bias W₂ b₁ + b₂.
                </p>
                <Equation>{"y = W₂ (W₁ x + b₁) + b₂ = (W₂ W₁) x + (W₂ b₁ + b₂)"}</Equation>
                <WorkedExample title="The collapsed map at the row">
                  <>
                    <p>
                      Multiply the output weight row by the hidden weight matrix. This
                      combines the two affine transformations into a single weight row.
                      All biases are zero in this example.
                    </p>
                    <Equation>{"combined weights = (1 − 1 − 2, 1 + 1 + 2) = (−2, 4)\noutput at (1, 2) = (−2) × 1 + 4 × 2 = 6"}</Equation>
                    <p>
                      Set both activation functions to identity in the playground. The
                      stack and the combined transformation both return six.
                    </p>
                  </>
                </WorkedExample>
                <>
                  <p>
                    With identity activations, both layers together perform one affine
                    transformation from two inputs to one output. They use thirteen
                    parameters to express something that needs only three. Adding more
                    affine layers does not change that limitation. A nonlinear
                    activation between layers allows the network to represent functions
                    outside that class.
                  </p>
                </>
                <KeepInMind>
                  <p>
                    Two affine transformations combine into one. A nonlinear activation
                    between them is what allows additional layers to expand the kinds of
                    function the network can represent. Identity is also an activation
                    function, but it does not provide that expansion.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Combining ReLU Responses" id="19-what-one-rectifier-folds-and-what-a-layer-of-them-carves">
                <>
                  <p>
                    A ReLU neuron has two regimes: it outputs zero when its score is
                    negative, and it outputs its score when the score is positive. With
                    two inputs, the change between regimes happens along a straight line
                    where the score is zero.
                  </p>
                  <p>
                    The output layer combines several such responses. The resulting
                    score is affine within each region of the input plane, with its
                    slope able to change where a hidden neuron switches regime. Its zero
                    contour can therefore contain multiple straight segments. This is
                    what a piecewise-linear decision boundary means.
                  </p>
                </>
                <Equation>{"y = Σⱼ vⱼ · max(0, wⱼ · x + bⱼ) + c\n\nunit j is flat where wⱼ · x + bⱼ < 0 and tilted where it is not"}</Equation>
                <FoldLines />
                <InAModel title="Three creases on the crowd">
                  <p>{"The best three-unit run, from seed 2, classifies every one of the twenty-five people correctly at a loss of 0.0725. The units have weights (−5.912, −2.63), (−4.088, −2.577) and (5.092, 2.849) on standardized height and weight, with biases −1.853, −0.069 and −0.528. Each unit changes from zero to a linear response across one line. Those three lines have similar angles in this run, and the final classification boundary changes direction only where it crosses one of them."}</p>
                  <p>{"With two units, there are only two lines where the ReLU responses switch between zero and a weighted score. In this experiment the resulting boundary does not enclose the children in the middle, and the best run misclassifies four adults. Those lines are the changes in activation regions called creases above."}</p>
                </InAModel>
                <KeepInMind>
                  <p>
                    Each hidden ReLU introduces a line where its response changes from
                    zero to its score. Combining neurons lets the output score use
                    different slopes in different regions. More units provide more
                    possible changes, although training must still find useful weights.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Width on the crowd, measured">
                <>
                  <p>
                    A sufficiently wide network with suitable nonlinear activations can
                    approximate continuous functions on a bounded input domain. That
                    existence result does not tell us which widths will train
                    successfully on this particular dataset. I compared six widths and
                    six starting seeds, using fifteen hundred epochs at a fixed learning
                    rate. A fitted logistic classifier provides a reference.
                  </p>
                </>
                <CarvingSweep />
                <NumberTable
                  headings={["hidden units", "parameters", "starts calling everyone", "mean accuracy over six starts", "best start's loss"]}
                  rows={[
                    ["1", "5", "0 of 6", "0.707", "0.3606"],
                    ["2", "9", "0 of 6", "0.840", "0.2711"],
                    ["3", "13", "1 of 6", "0.887", "0.0725"],
                    ["4", "17", "2 of 6", "0.913", "0.0548"],
                    ["6", "25", "4 of 6", "0.960", "0.0388"],
                    ["8", "33", "6 of 6", "1.000", "0.0347"],
                  ]}
                  caption="Rectifier hidden layers on the crowd, learning rate 0.5, 1500 epochs, six seeds each. The straight boundary calls 17 of 25, an accuracy of 0.68."
                />
                <>
                  <p>
                    The best one-unit run classifies twenty-one of the twenty-five
                    people correctly. A single ReLU followed by an affine output and a
                    threshold still gives a half-plane decision region, or a constant
                    prediction. Its higher accuracy than this fitted logistic reference
                    does not demonstrate a more complex boundary; the training
                    objectives and resulting fitted boundaries can differ.
                  </p>
                  <p>
                    One of the six starts leaves that unit inactive for every person and
                    reaches only 0.52 accuracy. Two units reach 0.84 from every start.
                    Three classify everyone correctly from one start; four do so from
                    two starts, six from four and eight from all six. In these runs,
                    extra width improves the reliability of finding a successful fit.
                  </p>
                </>
                <KeepInMind>
                  One tested three-unit network fits all twenty-five examples. At width eight, all six tested initializations reach correct classifications. This experiment shows that extra width can help this training procedure find a fit; it does not establish a minimum width for reliable training in general.</KeepInMind>
              </SubSection>

              <SubSection title="21. Width against depth at twenty-five parameters">
                <>
                  <p>
                    Section 4 showed that one hidden layer of six neurons and two hidden
                    layers of three have the same twenty-five parameters. The deeper
                    network’s second layer reads features already transformed by the
                    first. Its activation regions, viewed in the original input
                    coordinates, need not be separated by single straight lines.
                  </p>
                  <p>
                    This can make depth useful for representing some functions
                    compactly. It does not guarantee easier training or better accuracy
                    at a fixed parameter count. On this crowd, the deeper arrangement
                    was less reliable.
                  </p>
                </>
                <WidthAgainstDepth />
                <NumberTable
                  headings={["architecture", "parameters", "starts calling everyone", "mean accuracy", "loss when everyone is called"]}
                  rows={[
                    ["2 → 6 → 1", "25", "4 of 6", "0.960", "0.0388 to 0.0577"],
                    ["2 → 3 → 3 → 1", "25", "2 of 6", "0.887", "0.0045 and 0.0060"],
                    ["2 → 6 → 6 → 1", "67", "6 of 6", "1.000", "0.0013 to 0.0037"],
                  ]}
                  caption="The same loop, the same six seeds. Loss is the average log loss over the twenty-five people at the end of the run."
                />
                <>
                  <p>
                    The wide model classifies everyone correctly from four starts, while
                    the deeper model does so from two. In the deeper model’s worst run,
                    two of its three second-layer neurons are inactive for the whole
                    crowd and accuracy is 0.76.
                  </p>
                  <p>When the deeper model succeeds, its best average log loss is 0.0045, compared with 0.0388 for the wide model. Both runs classify everyone correctly. The lower loss means a higher average log probability for the true classes; it does not require a higher true-class probability for every individual. Two layers of six succeed from every tested start, with losses below 0.004. These results describe this training experiment.</p>
                </>
                <KeepInMind>
                  At the same parameter count, the wider arrangement reaches correct classifications more often across these starts. The successful deeper runs achieve a lower average log loss. Comparing both measurements helps distinguish how often training finds a fit from the probabilities produced once it does.</KeepInMind>
              </SubSection>

              <SubSection title="22. What the guarantee promises and what the loop finds">
                <p>An approximation theorem concerns the existence of suitable parameters. The tables test whether this training procedure finds suitable parameters from particular initializations. Three hidden units can fit this example, as seed 2 demonstrates, but five of the six runs at that width do not reach the same fit. Existence alone does not establish that an optimizer will find the parameters.</p>
                <p>
                  One of the six starts at eight units ended with a unit dead for everyone, contributing a constant, and it still called every person correctly with the seven that were left, at a loss of 0.0813 against the 0.0347 of the best start.
                </p>
                <Equation>{"a network exists        ≠        this walk from this start arrives"}</Equation>
                <p>A rectified unit returns zero whenever its score is non-positive. In this experiment the first layer reads fixed measurements. If a unit returns zero for every training row, it receives no gradient through those responses and these updates cannot move it back into use. That is a dead ReLU in this setting. In a deeper network, changing an earlier layer can change the inputs reaching the unit, so current inactivity alone does not prove that it will stay inactive. Initialization and the update rule both matter. The <Link href="/concepts/training-a-network" className={link}>
                    training page
                  </Link> follows the complete update loop.</p>
                <KeepInMind>
                  The three-unit result is demonstrated by a fitted run, rather than supplied by the general approximation theorem. Reporting all six starts also shows how often this training procedure reaches that result. A representable function and a reliably trained model are different questions.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Making the Layer Read the Intended Coordinates" , id: "part-6-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="23. The shapes, weights and outputs a layer must declare" id="23-what-a-complete-implementation-states">
                <p>A dense layer&apos;s implementation must make its arrangements explicit before a forward pass. The reader needs to know which coordinate every weight multiplies and where every result goes.</p>
<ol className="list-decimal space-y-2 pl-6">
<li>State the input and output shapes. Every neuron must have one weight per input coordinate.</li>
<li>Fix the neuron order and the matrix convention. Here the weight matrix has neurons as rows and inputs as columns.</li>
<li>Keep the batch axis separate from each example&apos;s shape. A response retains the inputs, scores, and activated outputs from the same pass.</li>
<li>Specify the activation rule. This implementation can use different activations for different neurons and does not change its behavior with pass purpose.</li>
</ol>
<p>A layer stack checks the shape at every join when it is constructed. If a join is invalid, the error identifies the adjacent layers and their arrangements. Its overall shape then runs from the first layer&apos;s input to the last layer&apos;s output.</p>
              </SubSection>

              <SubSection title="24. Failure contracts">
                <p>The table distinguishes the playground’s request limits from the SDK’s layer checks. Some configurations are rejected before the layer is constructed; others reach the layer and are validated there. The rows name which check applies.</p>
                <DerivationTable
                  expressionHeading="Layer configuration"
                  reasonHeading="What the layer accepts and returns"
                  rows={[
                    { expression: "a layer with no neurons", reason: "refused, ‘a layer needs at least one neuron’; a layer answering nothing has no width for the next layer to agree with." },
                    { expression: "neurons of different widths in one layer", reason: "refused, ‘every neuron in a layer reads the same row, so they must agree on its width, got [2, 3]’." },
                    { expression: "a layer of one neuron", reason: "accepted; it reads (2,) and answers (1,), grouping one neuron in the layer interface." },
                    { expression: "a stack with no layers", reason: "refused, ‘a stack needs at least one layer’; there is no network to describe." },
                    { expression: "a stack of one layer", reason: "accepted; it has no seams and its shape is the layer’s own." },
                    { expression: "a seam that does not hold", reason: "refused at construction, naming the seam and both arrangements, before any row exists." },
                    { expression: "a block with no rows", reason: "refused, ‘a layer needs at least one row to respond to’; the request refuses it a layer earlier." },
                    { expression: "a block of one row", reason: "accepted; one person is the ordinary case, and a layer has no notion of a dataset." },
                    { expression: "a row of the wrong width", reason: "refused by the first layer, ‘this layer reads (2,), got a block arranged (3,)’, and nothing downstream is reached." },
                    { expression: "a single row handed over flat, not as a block", reason: "refused, ‘a layer reads a block whose first axis is the rows, got 1 dimensions’." },
                    { expression: "a three-dimensional block into a dense layer", reason: "refused as an arrangement mismatch, ‘this layer reads (2,), got a block arranged (2, 1)’, which is the shape page’s case." },
                    { expression: "a non-finite value in a row", reason: "refused, ‘inputs must contain only finite values’; it cannot be written in a request at all, since JSON cannot spell it." },
                    { expression: "text in a row", reason: "refused, ‘inputs must be readable as a float array’." },
                    { expression: "integers, or booleans, in a row", reason: "accepted and converted to floating point, so true reads as 1. Check input types separately if this conversion is unwanted." },
                    { expression: "a non-finite weight or bias", reason: "refused when the neuron is built, in words, before any layer holds it." },
                    { expression: "an overflow produced inside a layer", reason: "the response can contain a non-finite output; a following layer rejects it with ‘inputs must contain only finite values’. The caller must check a final output when no following layer performs that check." },
                    { expression: "mixed activation functions in one layer", reason: "accepted, and answers (3, 0.2689) at the row with a straight first neuron and a sigmoid second." },
                    { expression: "softmax requested as an activation function", reason: "refused by this scalar activation interface; softmax needs all scores in the vector." },
                    { expression: "a width of zero, or a boolean, as an extent", reason: "refused, ‘n_inputs extents must be at least 1, got 0’ and ‘n_inputs must be whole numbers, not bools’, because true would otherwise read as a width of one." },
                    { expression: "a step handed no gradient", reason: "refused, ‘a dense layer has parameters and needs a gradient to step by’; absence is for layers with nothing to learn." },
                    { expression: "new parameters of the wrong shape", reason: "refused, ‘this layer’s weights are (3, 2), got (2, 3)’, so a transposed matrix cannot be installed quietly." },
                    { expression: "a row with its columns swapped", reason: "not detectable from width alone; (2, 1) answers 2 where (1, 2) answers 5. The caller must keep each feature in the position used when fitting or building the network." },
                    { expression: "unfitted use", reason: "nothing to refuse; a layer is built complete from its neurons and has no fit of its own. Fitting is the training page’s job." },
                    { expression: "a weight beyond a million, a block of more than six rows, a chain of more than six layers, or a width beyond eight", reason: "refused at the door as a request larger than the page allows, with the limit named." },
                  ]}
                />
                <p>
                  The layer checks its incoming values for finiteness. Its calculation can still overflow even when the inputs and parameters are finite. This implementation checks that result when the next layer reads it, so the final output also needs a check by the caller.
                </p>
                <p>
                  The swapped-column example has the correct input width, so it passes the shape check. Each weight multiplies the value at its matching position; the layer has no feature names to compare. The caller must preserve the feature order used when building or fitting the network.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
  "With both activations set to identity, what do these thirteen parameters express?",
  [
                  "A function neither layer could express on its own",
                  "One affine map from two inputs to one output, which needs three parameters",
                  "A piecewise-linear boundary of several segments",
                  "Nothing, since the identity discards the scores",
                ],
  1,
  "With identity activations, the two layers combine into one weight matrix and bias. In the zero-bias example, the combined weight row is (−2, 4). For input (1, 2):\n\n```math\n(-2 × 1) + (4 × 2) = 6\n```\n\nBoth routes produce that result. A nonlinear operation between layers permits relationships that this single affine map cannot represent.",
  {
    "description": "Every neuron includes a bias. There is no additional nonlinear operation between the layers.",
    "data": "Architecture: two inputs -> three hidden neurons -> one output neuron\nBoth layers use identity activations."
  },
),
            choice(
  "With at least one nonzero input weight, where does a two-input ReLU neuron switch between its zero and affine regions?",
  [
                  "At the origin",
                  "Along a straight line where its score is zero",
                  "Wherever the output layer’s weight on it is zero",
                  "Nowhere, since the rectifier is continuous",
                ],
  1,
  "For a negative score, ReLU outputs zero. For a positive score, it outputs the score itself. With two inputs and a nonzero weight vector, the zero-score boundary is a straight line. Combining several such responses gives a surface with affine regions whose slopes can change at these boundaries. This is the piecewise-linear behavior shown here.",
  {
    "description": "The bias is finite and at least one input weight is nonzero.",
    "data": "score = w1*x1 + w2*x2 + bias\noutput = max(0,score)"
  },
),
            trueFalse(
  "One three-unit network classifies every observation correctly, while five other starts at that width do not. This shows that three units can represent the labels even though most of these optimization runs did not find such a fit.",
  true,
  "The run with seed 2 classified all the supplied observations correctly at three units, so that width can represent these labels. Other starts at the same width failed to find such a fit. In this comparison, all six starts succeeded at eight units. Those results describe the tested data and optimization settings; they do not guarantee that increasing width will always make training succeed.",
),
            choice(
  "What does this six-start comparison tell us about the two equally sized networks?",
  [
    "The wider network found perfect classifications more often here, while the deeper network reached the lower best log loss",
    "The deeper network performed better in every recorded run",
    "The wider network always had the lower log loss",
    "Equal parameter counts make the two architectures equivalent"
  ],
  0,
  "The wider network classified every observation correctly in four starts, compared with two starts for the deeper one. The deeper network nevertheless reached the lower best log loss, assigning more probability to the observed labels in that fit. Equal parameter count controls one aspect of size; these six runs do not establish a general advantage for width or depth.",
  {
    "description": "Both architectures have 25 fitted parameters and use the same six starting seeds and the same crowd.",
    "data": "Hidden widths | Runs classifying all 25 correctly | Best log loss\n[6] | 4 of 6 | 0.0388\n[3,3] | 2 of 6 | 0.0045"
  },
),
            trueFalse(
  "In this implementation, a non-finite result is checked on the way out of the same layer.",
  false,
  "This implementation checks a layer’s incoming values for finiteness. A non-finite output from an earlier layer can therefore be rejected when the next layer reads it, rather than when it is first produced. Finite inputs and parameters can still overflow during calculation. Callers also need to check the final output because there is no following layer to perform that input check.",
  {
    "description": "Trace the documented validation placement.",
    "data": "Each layer checks its incoming values. It does not run an additional outgoing finiteness scan. If another layer follows, that next layer checks the values it receives."
  },
),
        ],
        },
        {
          title: "Practice. Running the Row and the Block With the Library",
          practice: [
            exercise(
              "Send three people through as one block",
              ["The earlier neuron accepted one person's two features. Build the supplied two-layer network and send all three people as one batch, with one person per row. Each hidden neuron reads both columns; the output neuron combines the three hidden responses.","Print the input and output shape for each layer, then the hidden scores, hidden outputs and final responses. Repeat with sigmoid hidden activations while keeping weights and biases fixed. Preserve the three-person order in every printed list."],
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, RectifiedLinear, Sigmoid

hidden_weights = [[1, 1], [1, -1], [-1, 1]]
people = np.array([[1.0, 2.0], [0.0, 0.0], [-1.0, 0.5]])

hidden = DenseLayer([Neuron(weights, bias=0, activation=RectifiedLinear()) for weights in hidden_weights])
output = DenseLayer([Neuron([1, -1, 2], bias=0, activation=Identity())])
network = LayerStack([hidden, output])

# Send the block through the network. For each layer's response print the
# shape of its inputs and of its outputs, then print the hidden scores, the
# hidden outputs and the network's answers.

# Build the same hidden layer under Sigmoid, stack it under the same output
# layer, send the block through, and print the three answers to four places
# and the third person's on a line of its own.`,
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, RectifiedLinear, Sigmoid

hidden_weights = [[1, 1], [1, -1], [-1, 1]]
people = np.array([[1.0, 2.0], [0.0, 0.0], [-1.0, 0.5]])

hidden = DenseLayer([Neuron(weights, bias=0, activation=RectifiedLinear()) for weights in hidden_weights])
output = DenseLayer([Neuron([1, -1, 2], bias=0, activation=Identity())])
network = LayerStack([hidden, output])

response = network.respond_to(people)
for position, layer_response in enumerate(response):
    print(f"layer {position} read {layer_response.inputs.shape} and answered {layer_response.outputs.shape}")
print(f"hidden scores {response[0].scores.tolist()}")
print(f"hidden outputs {response[0].outputs.tolist()}")
print(f"answers {response.outputs.ravel().tolist()}")

squashed = DenseLayer([Neuron(weights, bias=0, activation=Sigmoid()) for weights in hidden_weights])
answers = LayerStack([squashed, output]).respond_to(people).outputs.ravel()
print(f"answers under the sigmoid {answers.round(4).tolist()}")
print(f"third person under the sigmoid {answers[2]:.4f}")`,
              `layer 0 read (3, 2) and answered (3, 3)
layer 1 read (3, 3) and answered (3, 1)
hidden scores [[3.0, -1.0, 1.0], [0.0, 0.0, 0.0], [-0.5, -1.5, 1.5]]
hidden outputs [[3.0, 0.0, 1.0], [0.0, 0.0, 0.0], [0.0, 0.0, 1.5]]
answers [5.0, 0.0, 3.0]
answers under the sigmoid [2.1457, 1.0, 1.8303]
third person under the sigmoid 1.8303`,
              { hints: ["respond_to takes a block whose first axis is the people, so the (3, 2) array goes in as it is, and the stack answers with one response per layer that you can loop over or index by position.", "Each layer’s response carries inputs, scores and outputs as arrays, the three blocks of section 9. The stack’s own outputs are the last layer’s, a (3, 1) block, and ravel flattens it to three numbers.", "A layer cannot change its activation function once built, so make a second hidden layer from the same weights with Sigmoid() and put it in a new LayerStack with the output layer you already have."], check: numberCheck("What does the network answer for the third person, (−1, 0.5), with the hidden layer under the sigmoid, to four places?", 1.8303, 0.0005, "The hidden scores stay fixed when only the activation changes. Sigmoid gives each score a smooth positive output, so all three hidden responses contribute to the final linear combination. The resulting difference is due to activation choice, rather than a change in fitted parameters."), question: "How does a layer keep three people separate while applying the same neurons?" },
            ),
            exercise(
              "Collapse two straight layers into one map",
              ["With identity activations, the two layers apply only matrix multiplication and addition of biases. Combine those operations into a single weight matrix and bias vector. This example gives the hidden and output layers nonzero biases, so the bias path must be included.","Print the combined parameters and compare the original stack's predictions with the combined map on the same three people. The SDK stores a row per neuron in each weight matrix; check the multiplication order against those shapes."],
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron

hidden_weights = [[1, 1], [1, -1], [-1, 1]]
hidden_biases = [0.5, -1.0, 2.0]
people = np.array([[1.0, 2.0], [0.0, 0.0], [-1.0, 0.5]])

hidden = DenseLayer([
    Neuron(weights, bias=bias, activation=Identity())
    for weights, bias in zip(hidden_weights, hidden_biases)
])
output = DenseLayer([Neuron([1, -1, 2], bias=0.25, activation=Identity())])
network = LayerStack([hidden, output])

# Form the combined weight row and the combined bias from the two layers'
# weight_matrix and bias_vector, and print them, the bias to four places.

# Print the stack's answers for the three people, and the single map's answers
# for the same three, each to four places.`,
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron

hidden_weights = [[1, 1], [1, -1], [-1, 1]]
hidden_biases = [0.5, -1.0, 2.0]
people = np.array([[1.0, 2.0], [0.0, 0.0], [-1.0, 0.5]])

hidden = DenseLayer([
    Neuron(weights, bias=bias, activation=Identity())
    for weights, bias in zip(hidden_weights, hidden_biases)
])
output = DenseLayer([Neuron([1, -1, 2], bias=0.25, activation=Identity())])
network = LayerStack([hidden, output])

combined_weights = output.weight_matrix @ hidden.weight_matrix
combined_bias = output.weight_matrix @ hidden.bias_vector + output.bias_vector
print(f"combined weights {combined_weights[0].tolist()}")
print(f"combined bias {combined_bias[0]:.4f}")

stacked = network.respond_to(people).outputs.ravel()
collapsed = people @ combined_weights[0] + combined_bias[0]
print(f"the stack answers {stacked.round(4).tolist()}")
print(f"the one map answers {collapsed.round(4).tolist()}")`,
              `combined weights [-2.0, 4.0]
combined bias 5.7500
the stack answers [11.75, 5.75, 9.75]
the one map answers [11.75, 5.75, 9.75]`,
              { hints: ["A dense layer exposes weight_matrix, one row per neuron and one column per input, and bias_vector, one entry per neuron. The output layer’s matrix is (1, 3) and the hidden layer’s is (3, 2), so their product in that order is (1, 2).", "The combined bias is the output matrix times the hidden bias vector, plus the output layer’s own bias vector. It comes back as an array of one entry.", "The single map applied to a block is the block times the combined weight row, plus the combined bias. With numpy that is people @ combined_weights[0] + combined_bias[0]."], check: numberCheck("What is the combined bias, W₂ b₁ + b₂?", 5.75, 0.0005, "The hidden biases affect the output through the output weights, and the output bias contributes separately. Their combined effect is the final bias of the single map. Equality of the two predictions follows from composing these affine operations with identity activations."), question: "Can two identity-activation layers be replaced by one weighted map, including their biases?" },
            ),
            exercise(
              "Let a stack refuse a broken seam",
              ["Each supplied pair gives a layer's input width and output width, with the first layer listed first. Build the zero-weight layers and try each chain. The zeros isolate shape compatibility from any learned numerical behavior.","For a valid stack, print its input width, output width and total number of weights and biases. For an invalid chain, catch and print the shape error. Check each adjoining pair: a layer must receive the number of values produced by the previous layer."],
              `from oop_ml import DenseLayer, Identity, LayerStack, Neuron, ShapeMismatchError

chains = [
    [(2, 3), (3, 4), (4, 1)],
    [(2, 3), (3, 4), (5, 1)],
    [(2, 3), (5, 4), (5, 1)],
    [(8, 5), (5, 8)],
]

for widths in chains:
    layers = [
        DenseLayer([Neuron([0.0] * reads, bias=0, activation=Identity()) for _ in range(answers)])
        for reads, answers in widths
    ]
    # Try to build a LayerStack from the layers. If it is refused, print the
    # refusal. Otherwise print what the stack reads and answers and its
    # parameter count, the size of every weight matrix and bias vector summed.`,
              `from oop_ml import DenseLayer, Identity, LayerStack, Neuron, ShapeMismatchError

chains = [
    [(2, 3), (3, 4), (4, 1)],
    [(2, 3), (3, 4), (5, 1)],
    [(2, 3), (5, 4), (5, 1)],
    [(8, 5), (5, 8)],
]

for widths in chains:
    layers = [
        DenseLayer([Neuron([0.0] * reads, bias=0, activation=Identity()) for _ in range(answers)])
        for reads, answers in widths
    ]
    try:
        stack = LayerStack(layers)
    except ShapeMismatchError as refusal:
        print(f"{widths} refused, {refusal}")
        continue
    parameters = sum(layer.weight_matrix.size + layer.bias_vector.size for layer in stack)
    print(f"{widths} reads {stack.shape.reads}, answers {stack.shape.answers}, holds {parameters} parameters")`,
              `[(2, 3), (3, 4), (4, 1)] reads (2,), answers (1,), holds 30 parameters
[(2, 3), (3, 4), (5, 1)] refused, layer 1 answers with (4,) and layer 2 reads (5,)
[(2, 3), (5, 4), (5, 1)] refused, layer 0 answers with (3,) and layer 1 reads (5,)
[(8, 5), (5, 8)] reads (8,), answers (8,), holds 93 parameters`,
              { hints: ["A layer is built from its neurons, one neuron per answered width and one weight per read width, which is what the comprehension in the starter does. Building the layers never fails here. Stacking them is what can.", "LayerStack checks every seam in its constructor and raises ShapeMismatchError at the first one that does not hold, so wrap the construction in try and except and print the exception itself.", "A stack that exists has a shape with reads and answers, and it can be looped over layer by layer. Each dense layer’s weight_matrix.size plus bias_vector.size is its m × n + m."], check: numberCheck("How many parameters does the stack of a layer reading 8 and answering 5 under a layer reading 5 and answering 8 hold?", 93, 0.5, "Count every layer’s weights and biases, including the final layer’s biases. A stack can have the same input and output width while containing a narrower intermediate representation. Compatible widths permit the connection; they do not imply the stack preserves every input."), question: "Which layer shapes can be connected, and how many parameters do the valid stacks contain?" },
            ),
          ],
        },
      ]}
    />
  );
}
