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

export const metadata: Metadata = {
  title: "A Dense Layer and the Forward Pass · oop_ml",
  description:
    "Group neurons into a layer and pass their outputs to the next layer.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function DenseLayersPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["dense-layers"]}
      technicalStart="Part 2. The Matrix Form"
      openingTitle="Several Neurons Read the Same Example"
      playgroundIntro="Follow one example through the neurons. Compare each neuron's inputs, score, and activated output before following the next layer."
      title="A Dense Layer and the Forward Pass"
      tagline="Group neurons into a layer and pass their outputs to the next layer."
      prerequisites={
        <>
          One neuron, its weighted sum and the activation function applied to it, is the{" "}
          <Link href="/concepts/neurons-and-activations" className={link}>
            neurons page
          </Link>
          , and the matrix multiply a layer turns out to be is the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>
          &rsquo;s. The row the page works by hand is the same row the{" "}
          <Link href="/concepts/backpropagation" className={link}>
            backpropagation page
          </Link>{" "}
          sends back down, so what is kept here is what is needed there.
        </>
      }

      playground={<DenseForwardPlayground />}
      sections={[
        {
          title: "Part 1. Many Neurons, One Row",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Three neurons reading the same two numbers">
                <p>
                  Take one person from the crowd the classification pages keep returning to, written in standard units so that (1, 2) means one deviation taller than average and two deviations heavier. The neurons page hands that row to one neuron and gets one number back. Hand the same row to three neurons at once and three numbers come back, and that is the whole of what a layer adds.
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
                  A layer is several neurons that all read the identical row.
                  The row is shared, and every neuron forms its own score
                  from it with its own weights.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Why the widths inside a layer cannot disagree">
                <p>
                  Because every neuron in the layer is handed the same row, a neuron expecting a different number of inputs is not an odd member of the group, it is one that can never be fed. Give the layer a neuron holding two weights and another holding three and there is no row that satisfies both.
                </p>
                <p>
                  So the width a layer reads is a fact about the group, settled when the group is formed, and a group that cannot agree on it is refused at construction rather than discovered when a row arrives. I tried it, and the refusal reads &ldquo;every neuron in a layer reads the same row, so they must agree on its width, got [2, 3]&rdquo;.
                </p>
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

              <SubSection title="3. The width answered owes nothing to the width read">
                <p>
                  Three neurons answer with three numbers whether they read
                  two inputs or two hundred, so the width a layer answers with
                  is how many neurons it holds, and nothing about the row it
                  reads bears on it. The two widths are separate choices. The
                  first is forced by whatever feeds the layer; the second is
                  free, and choosing it is what designing a network mostly
                  consists of.
                </p>
                <Equation>{"reads (n,)   answers (m,)        here (2,) and (3,)"}</Equation>
                <p>
                  Widening a layer changes what the next layer must expect and
                  changes nothing about what this one accepts, which is why a
                  network&rsquo;s shape is a chain of separate equalities
                  rather than one number carried the whole way through. On the
                  playground the hidden layer reads (2,) and answers (3,), and
                  the output layer reads (3,) and answers (1,), and the second
                  pair is a consequence of the first only at its left end.
                </p>
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
                <p>
                  Thirteen numbers is small enough to write out, and the
                  point of doing so is that nothing else exists. There is no
                  stored answer anywhere in a layer, only these numbers and
                  the two lines of arithmetic that Part 2 writes down. Change
                  a cell in the playground and every node re-prints, because
                  nothing from the last pass is kept that a new one could
                  reuse.
                </p>
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
                  A dense layer is m · n weights and m biases and nothing
                  else. The count grows with the product of the two widths,
                  which is what makes wide layers reading wide rows expensive.
                </KeepInMind>
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
                <p>
                  The transpose is bookkeeping and not a new operation. A
                  matrix product pairs each row of its left factor with each
                  column of its right factor. The people are the rows of X,
                  and section 5 wrote the neurons as the rows of W, so W is
                  turned on its side to put each neuron&rsquo;s weights in a
                  column. The entry in row i and column j of the product is
                  then person i&rsquo;s dot product with neuron j, the same
                  score section 1 formed for one person and one neuron.
                </p>
                <p>
                  The bias vector is added to every row alike, because a
                  neuron&rsquo;s bias does not depend on which person it is
                  reading. Nothing in one row of Z depends on any other row
                  of X, so a block is not a new kind of input. It is several
                  separate passes that happen to share one call.
                </p>
                <BlockPass />
                <WorkedExample title="Three people through the two layers">
                  <p>
                    The tall heavy person (1, 2), someone exactly average at (0, 0), and someone a deviation shorter and half a deviation heavier at (−1, 0.5) go in as a block of shape (3, 2). The hidden layer answers a (3, 3) block whose rows are (3, 0, 1), (0, 0, 0) and (0, 0, 1.5), since the third person&rsquo;s scores were (−0.5, −1.5, 1.5) and the rectifier kept only the last, and the output layer answers a (3, 1) block holding 5, 0 and 3.
                  </p>
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
                  After the multiply, each neuron transforms only its own score,
                  so the activation function is applied to every entry of z on its own and
                  the result has z&rsquo;s shape. That is what lets a whole
                  layer share one activation function applied to one block in a single call,
                  and it is why softmax is not among the four activation functions here,
                  since softmax reads a whole row of scores to answer any one
                  of them, which the neurons page sets out.
                </p>
                <Equation>{"a = f(z), entry by entry\n\nrectifier   (3, −1, 1) → (3, 0, 1)\nsigmoid     (3, −1, 1) → (0.9526, 0.2689, 0.7311)\ntangent     (3, −1, 1) → (0.9951, −0.7616, 0.7616)"}</Equation>
                <p>
                  Each neuron carries its own activation function, so nothing in the
                  mathematics stops a layer from mixing them, and a layer
                  whose first neuron is straight and whose second is a sigmoid
                  is accepted; I checked, and it answers (3, 0.2689)
                  at the row. A uniform layer is a fact about ordinary
                  practice rather than a law, and it is the case a vectorised
                  pass can exploit, since one activation function over a whole block is one
                  call where a mixed layer needs one per column.
                </p>
                <KeepInMind>
                  The activation function acts on each score alone, which is what makes it
                  one call over a block. A layer may mix activation functions; nearly every
                  layer in practice does not.
                </KeepInMind>
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
              "A dense layer is m times n weights plus m biases and nothing else, which gives 2 × 3 + 3 = 9 for the hidden layer and 3 × 1 + 1 = 4 for the output layer. Six counts the hidden weights alone and nine stops at the hidden layer. Thirteen is small enough to write out, and the point of writing it out is that nothing else exists, so changing a cell re-prints every node because nothing from the last pass is kept that a new one could reuse.",
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
              "Three people handed to the hidden layer as a block of shape (3, 2) come out as a block of shape (3, 3).",
              true,
              "A layer keeps the people axis and replaces the other axis with its own width, so three rows of two become three rows of three, one column per neuron. The rows are (3, 0, 1), (0, 0, 0) and (0, 0, 1.5), and the output layer then answers a (3, 1) block holding 5, 0 and 3. Each row is a separate pass, and nothing in one person’s row depends on anyone else’s.",
            ),
            several(
              "Which of these hold of the activation function inside a layer?",
              [
                "It is applied to each score on its own, so the outputs have the scores’ shape",
                "A layer that mixes them, a straight first neuron and a sigmoid second, is accepted",
                "Softmax is one of the four offered here",
                "Switching the rectifier for the sigmoid changes the scores (3, −1, 1)",
              ],
              [0, 1],
              "After the multiply each neuron transforms only its own score, which is what lets one call serve a whole block. Each neuron carries its own activation function, so a mixed layer is accepted, and a uniform layer is ordinary practice rather than a law. Softmax is left out because it reads a whole row of scores to answer any one of them. Switching the activation leaves the scores (3, −1, 1) alone and changes only the outputs, (3, 0, 1) under the rectifier and about (0.9526, 0.2689, 0.7311) under the sigmoid.",
            ),
        ],
        },
        {
          title: "Part 3. The Forward Pass",
          content: (
            <>
              <SubSection title="9. What one layer keeps from a pass">
                <p>
                  A layer asked about a row answers with more than the row it
                  hands on. It keeps three blocks together, the block it read,
                  the scores it formed, and the outputs it answered with, and
                  it keeps them as one object so that the three cannot be
                  separated or mispaired. The scores and the outputs share a
                  shape, since the same entry in each describes the same
                  neuron on the same person, and the inputs share the row
                  count.
                </p>
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
                <p>
                  A forward pass on its own would need only the outputs. The scores are kept because training needs the slope of each activation function at the point where the activation function was evaluated, and that point is the score, not the output. Under the rectifier the output 0 of the second hidden neuron could have come from a score of −1 or −100, and its slope is zero either way, but under the sigmoid the slope at a score of −1 is one number and at −100 another, and from an output alone the score would have to be recovered by running the layer again.
                </p>
                <p>
                  The inputs are kept for the same reason, since the correction owed to a layer&rsquo;s weights multiplies by what the layer read, and the forward pass is the only thing that knows it.
                </p>
                <Equation>{"kept per layer:   inputs, scores, outputs\nread forward:     outputs only\nread backward:    all three"}</Equation>
                <p>
                  The{" "}
                  <Link href="/concepts/backpropagation" className={link}>
                    backpropagation page
                  </Link>{" "}
                  is where those three blocks are spent, walking the same row
                  back down this same network, and it is not repeated here.
                  What belongs here is only the design decision that makes it
                  a plain reversed loop rather than a reconstruction of what
                  each layer once read. An earlier version of this design kept
                  only the scores and outputs, and the backward walk had to
                  rebuild the list of inputs by shifting the outputs down one
                  and pushing the caller&rsquo;s row on the front, which was
                  rebuilding something the forward pass had known and thrown
                  away.
                </p>
                <KeepInMind>
                  A response keeps the score because the slope of an activation function is
                  taken at the score, and keeps the inputs because the weight
                  correction multiplies by them. Both would otherwise have to
                  be recomputed.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Why a pass says why it is happening">
                <p>
                  A dense layer does the same arithmetic whether the network is learning or answering, and so do a convolution and a pooling window. Two layers do not. A dropout layer damages its own answers on purpose while learning, and a batch normalisation layer standardises by the batch in front of it while learning and by remembered statistics while answering.
                </p>
                <p>
                  So every pass here states its purpose, predicting or training, and hands it to every layer whether or not the layer reads it, so that a layer which starts caring later does not change the interface for the rest.
                </p>
                <Equation>{"purpose ∈ {predicting, training}        the default is predicting"}</Equation>
                <p>
                  The default is predicting, and the direction is chosen
                  deliberately. Forgetting to say training costs a slightly
                  slower descent; forgetting to say predicting would make every
                  answer the model gives a matter of luck. The playground says
                  its passes ran for predicting, which it states out loud
                  even though it is the default, and the{" "}
                  <Link href="/concepts/dropout" className={link}>
                    dropout page
                  </Link>{" "}
                  is where the other value earns its keep.
                </p>
                <KeepInMind>
                  A pass carries its purpose. A dense layer ignores it, and
                  the layers that cannot ignore it are the reason it exists.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Two routes to one answer, and how far apart they are">
                <p>
                  The definition of a layer is a loop, ask each neuron in turn, and the matrix multiply is that loop written as one call. Both are kept, the multiply for every fit and the loop as an observed route for anyone who wants to see one neuron&rsquo;s arithmetic, and a test asserts that they agree, because a fast path and a slow path with nothing between them are two implementations rather than one calculation read two ways.
                </p>
                <p>
                  They agree to within floating point and not to the last bit, since the multiply sums the products in a different order than a loop does.
                </p>
                <RouteAgreement />
                <InAModel title="Measured">
                  <p>
                    On the running network, two and three inputs wide, the two routes agree exactly, a gap of 0. On a seeded layer of eight neurons reading eight inputs the largest gap in the scores is 4.4 × 10⁻¹⁶, and on sixty-four neurons reading sixty-four inputs, 4,160 parameters, it is 7.1 × 10⁻¹⁵ in the scores and 5.3 × 10⁻¹⁵ in the outputs.
                  </p>
                  <p>
                    A dot product of sixty-four terms summed in two different orders parts in the fifteenth decimal place, and the scores in the table beneath the sliders differ only in their last digit or two.
                  </p>
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
                <p>
                  A dense layer knows two things about itself before any data arrives, the width it reads and the width it answers with, and each is recorded as a tuple of extents rather than as a number. For a dense layer the tuple has one entry, (2,) or (3,), and the distinction looks pedantic. It stops being pedantic the moment a layer answers with something arranged, a convolution handing on a stack of pictures, say.
                </p>
                <p>
                  A dense layer reading a row that holds exactly as many numbers still cannot read it, because a row and a stack of pictures are different arrangements of the same count, and a check that compared counts would wave that mismatch through as an agreement.
                </p>
                <Equation>{"dense        reads (2,)          answers (3,)\nconvolution  reads (1, 28, 28)   answers (8, 26, 26)\n\n8 · 26 · 26 = 5408 = (5408,) as a count, and not as an arrangement"}</Equation>
                <p>
                  A count says how many numbers there are and a tuple says
                  how they are arranged, and the{" "}
                  <Link href="/concepts/shapes-and-flattening" className={link}>
                    shape guarantee page
                  </Link>{" "}
                  is where that difference bites, with a flatten layer as the
                  bridge. On
                  this page every tuple has one entry, and the refusals still
                  print the tuples, because a refusal that printed
                  &ldquo;5408 and 5408&rdquo; on the case the check exists to
                  catch would send a reader looking for a bug in the check
                  rather than for the missing layer.
                </p>
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
                <p>
                  An answer nobody is obliged to read is not a guarantee. A caller can ask whether two layers join, discard the answer, and discover the disagreement inside a matrix multiply later. So the check is not left to the caller. A stack of layers refuses to exist unless every seam holds, and a stack that has been built is one whose shape is already known to be sound, so no forward pass anywhere re-establishes it.
                </p>
                <p>
                  The check is a walk down a list of integers, two comparisons for three layers, and it costs nothing that could be measured.
                </p>
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
                  A network that cannot work is refused when it is built, in
                  integer comparisons, before a row is read, and the refusal
                  names the seam. That is the whole claim of the network
                  pages and this is where it is kept.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Only the two ends are the data's business">
                <p>
                  A stack that exists has a shape of its own, the first
                  layer&rsquo;s reads paired with the last layer&rsquo;s
                  answers, and the playground prints it as (2,) → (1,).
                  Everything between those two ends is internal, already
                  agreed, and nobody else&rsquo;s business. The data supplies
                  two facts. The first layer&rsquo;s width has to match how
                  many measurements a person carries, and the last
                  layer&rsquo;s has to match what the task wants back, one
                  number for a regression or a yes-or-no decision, one per
                  class otherwise.
                </p>
                <Equation>{"stack reads (2,)  ←  two measurements per person\nstack answers (1,)  →  one number per person"}</Equation>
                <p>
                  The first of those is checked by the first layer itself the moment a block arrives, which is the refusal section 7 provoked with a row of width three. Nothing downstream checks anything, because every interior seam was settled when the stack was built. And a mismatch the widths cannot see stays invisible, since a row handed over with height and weight swapped has the right width and is scored wrongly with nothing raised.
                </p>
                <p>
                  I sent (2, 1) through the running network and it answered 2 where (1, 2) answers 5. The weights carry no names and match inputs by position, so the order is the contract, and this is documented rather than defended.
                </p>
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
              "The output score is 1 × 3 + (−1) × 0 + 2 × 1 = 5, and the identity leaves it there. The middle connection contributes nothing because it multiplies a zero, which is why the playground draws it faint. Six is what the same weights answer when both activation functions are the identity and the −1 gets through, and 2 is the answer to the row with its two columns swapped.",
            ),
            choice(
              "Why does a layer’s response keep the scores as well as the outputs?",
              [
                "So the forward pass can be repeated without the inputs",
                "Because training needs the slope of the activation function at the point it was evaluated, and that point is the score",
                "Because the next layer reads the scores rather than the outputs",
                "To compare the matrix multiply against the loop",
              ],
              1,
              "Under the rectifier an output of 0 could have come from a score of −1 or of −100 and the slope is zero either way, but under the sigmoid the slope at −1 is one number and at −100 another, so from an output alone the score would have to be recovered by running the layer again. The inputs are kept for the matching reason, since the correction owed to a layer’s weights multiplies by what the layer read.",
            ),
            trueFalse(
              "A convolution answering (8, 26, 26) hands on 5408 numbers, and a dense layer reading (5408,) still cannot read them.",
              true,
              "A count says how many numbers there are and a tuple says how they are arranged, and a stack of pictures and a row are different arrangements of the same count. A check that compared counts would wave that mismatch through as an agreement. The refusals print the tuples for that reason, since one reading 5408 and 5408 would send a reader looking for a bug in the check rather than for the missing layer.",
            ),
            several(
              "Layers reading 2 and answering 3, reading 3 and answering 4, and reading 4 and answering 1 are stacked. Which of these hold?",
              [
                "The stack reads (2,) and answers (1,) across two seams",
                "It holds thirty parameters",
                "Changing the last layer to read 5 is refused when the stack is built, before any row exists",
                "With the first seam broken as well, the refusal names the first seam",
              ],
              [0, 1, 2, 3],
              "All four hold. The count is (2 × 3 + 3) + (3 × 4 + 4) + (4 × 1 + 1) = 30, and the stack’s own shape is the first layer’s reads paired with the last layer’s answers. A stack refuses to exist unless every seam holds, in the words “layer 1 answers with (4,) and layer 2 reads (5,)”, and the walk stops at the first seam that fails, so that is the one it names.",
            ),
            trueFalse(
              "Handing the running network (2, 1) in place of (1, 2) is caught by the first layer’s width check.",
              false,
              "A row with the height and the weight swapped has exactly the right width, so nothing is raised and the network answers 2 where it answers 5 on the correct row. The weights carry no names and match inputs by position, so the order is the contract, and that is documented rather than defended.",
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

              <SubSection title="19. What one rectifier folds, and what a layer of them carves">
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
                  <p>
                    The best run at three units, from seed 2, calls every one of the twenty-five people correctly at a loss of 0.0725, and its three creases have weights (−5.912, −2.63), (−4.088, −2.577) and (5.092, 2.849) on standardised height and weight, with biases −1.853, −0.069 and −0.528. All three run across the plane at similar angles, and the boundary between the two shaded regions turns only where it meets one of them.
                  </p>
                  <p>
                    At two units there are two creases and the boundary cannot close around the children in the middle, and the best run leaves four adults wrongly called.
                  </p>
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
                  On this crowd three creases are enough to exist and eight
                  are needed to be found reliably. Width past what the
                  boundary needs is buying the loop more ways to arrive, and
                  that is a fact about the loop rather than about the
                  boundary.
                </KeepInMind>
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
                  <p>
                    When the deeper model succeeds, its best log loss is 0.0045,
                    compared with 0.0388 for the wide model. Both predict the correct
                    classes, but the deeper run assigns them higher probabilities. Two
                    layers of six succeed from every tested start, with losses below
                    0.004. These outcomes describe this training experiment, not a
                    universal advantage of width or depth.
                  </p>
                </>
                <KeepInMind>
                  At equal parameter count, depth did not beat width on this
                  crowd in accuracy and did beat it in loss when it arrived.
                  Which of those matters depends on what the network is for,
                  and neither is the textbook&rsquo;s clean win.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. What the guarantee promises and what the loop finds">
                <p>
                  The universal approximation results promise that a network exists. Every number in the two tables above is about whether this loop, from this start, found it, and the gap between the two is the honest content of the section. Three units suffice for this crowd, since seed 2 proves it, and five of the six starts at three units did not get there.
                </p>
                <p>
                  One of the six starts at eight units ended with a unit dead for everyone, contributing a constant, and it still called every person correctly with the seven that were left, at a loss of 0.0813 against the 0.0347 of the best start.
                </p>
                <Equation>{"a network exists        ≠        this walk from this start arrives"}</Equation>
                <p>
                  The dead units are the rectifier&rsquo;s own hazard, the
                  neurons page&rsquo;s dead side met in a layer. A unit whose
                  score is at or below zero for every person answers zero to
                  all of them, its slope is zero everywhere it is evaluated,
                  and nothing on any row can tell it what to do, so it stays
                  where it is for the rest of the run. Whether it dies depends
                  on the start, which is why the count is reported per seed.
                  Everything after this page that is not a layer, momentum,
                  better initialisation, normalisation between layers, is
                  machinery for making the walk arrive somewhere good more
                  often, and the{" "}
                  <Link href="/concepts/training-a-network" className={link}>
                    training page
                  </Link>{" "}
                  runs the loop itself.
                </p>
                <KeepInMind>
                  The theorem says a network of three units exists for this
                  crowd, and seed 2 found it; the other five starts did not,
                  and a report giving only the first number would be quoting
                  the theorem as if it were the loop.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="23. What a complete implementation states">
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
                <p>
                  Every row below was probed. The playground&rsquo;s request
                  refuses some of these at the door, with its own bounds,
                  before the layer is reached, and where that happens the
                  row says what the layer itself does when asked directly.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "a layer with no neurons", reason: "refused, ‘a layer needs at least one neuron’; a layer answering nothing has no width for the next layer to agree with." },
                    { expression: "neurons of different widths in one layer", reason: "refused, ‘every neuron in a layer reads the same row, so they must agree on its width, got [2, 3]’." },
                    { expression: "a layer of one neuron", reason: "accepted; it reads (2,) and answers (1,), and is the neurons page’s model wearing a layer." },
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
                    { expression: "integers, or booleans, in a row", reason: "accepted and coerced, so true reads as 1; documented rather than defended." },
                    { expression: "a non-finite weight or bias", reason: "refused when the neuron is built, in words, before any layer holds it." },
                    { expression: "an overflow produced inside a layer", reason: "accepted by the layer that produced it and refused by the next, ‘inputs must contain only finite values’, one seam later than it began; a response does not scan its own outputs, by decision." },
                    { expression: "mixed activation functions in one layer", reason: "accepted, and answers (3, 0.2689) at the row with a straight first neuron and a sigmoid second." },
                    { expression: "softmax requested as an activation function", reason: "refused; it is not on the list and cannot be, since it reads a row." },
                    { expression: "a width of zero, or a boolean, as an extent", reason: "refused, ‘n_inputs extents must be at least 1, got 0’ and ‘n_inputs must be whole numbers, not bools’, because true would otherwise read as a width of one." },
                    { expression: "a step handed no gradient", reason: "refused, ‘a dense layer has parameters and needs a gradient to step by’; absence is for layers with nothing to learn." },
                    { expression: "new parameters of the wrong shape", reason: "refused, ‘this layer’s weights are (3, 2), got (2, 3)’, so a transposed matrix cannot be installed quietly." },
                    { expression: "a row with its columns swapped", reason: "not detectable; (2, 1) answers 2 where (1, 2) answers 5, with nothing raised. Positional weights are the contract. Documented rather than defended." },
                    { expression: "unfitted use", reason: "nothing to refuse; a layer is built complete from its neurons and has no fit of its own. Fitting is the training page’s job." },
                    { expression: "a weight beyond a million, a block of more than six rows, a chain of more than six layers, or a width beyond eight", reason: "refused at the door as a request larger than the page allows, with the limit named." },
                  ]}
                />
                <p>
                  Two rows deserve a second look. The overflow row is a decision rather than an omission, since a layer&rsquo;s response is built once per layer per call, and scanning every block on the way out as well as on the way in would double the check for a value that finite inputs and finite weights can still produce, so it is caught one seam later, where the next layer scans what it is given.
                </p>
                <p>
                  And the swapped-columns row is the price of a unit that reads unnamed coordinates from the layer beneath it. Past the first layer there are no names to check against, so the first layer cannot have them either, and the order a caller assembles a row in is the whole of the agreement.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "With both activation functions set to the identity, what do the running network’s thirteen parameters express?",
              [
                "A function neither layer could express on its own",
                "One affine map from two inputs to one output, which needs three parameters",
                "A piecewise-linear boundary of several segments",
                "Nothing, since the identity discards the scores",
              ],
              1,
              "Two affine transformations compose into one, with matrix W₂W₁ and bias W₂b₁ + b₂, and stacking more affine layers does not change that. At the running row the combined weights are (−2, 4) and the answer is 6 by either route. A nonlinear activation between the layers is what lets further layers widen the kinds of function the network can represent. Identity is an activation function and simply does not provide that widening.",
            ),
            choice(
              "A rectifier neuron reading two inputs changes regime where?",
              [
                "At the origin",
                "Along a straight line where its score is zero",
                "Wherever the output layer’s weight on it is zero",
                "Nowhere, since the rectifier is continuous",
              ],
              1,
              "The neuron answers zero while its score is negative and its score once the score is positive, so with two inputs the changeover is the line where the score is zero. The output layer combines several such responses, which makes its score affine within each region of the plane with its slope able to change where a hidden neuron switches regime. That is what a piecewise-linear decision boundary means.",
            ),
            trueFalse(
              "Three hidden units are enough to call every one of the twenty-five people correctly, yet five of the six starts at three units did not find such a network.",
              true,
              "Seed 2 found it, at a loss of 0.0725, which proves a network of three units exists for this crowd. The other five starts did not arrive, and it takes eight units before all six starts call everyone. Width past what the boundary needs buys the loop more ways to arrive, which is a fact about the loop and not about the boundary.",
            ),
            choice(
              "One hidden layer of six neurons and two hidden layers of three both hold twenty-five parameters. How did they compare over the same six starts on the crowd?",
              [
                "The wide one called everyone from four starts and the deep one from two, and when the deep one arrived its loss was lower",
                "The deep one called everyone from more starts and at a lower loss",
                "The wide one called everyone from more starts and at a lower loss",
                "They called everyone from the same number of starts",
              ],
              0,
              "The wide arrangement called all twenty-five people from four of six starts against two of six for the deep one, whose worst run left two of its three second-layer neurons inactive for the whole crowd at an accuracy of 0.76. When the deep one did arrive its best log loss was 0.0045 against 0.0388, so it gave the right classes higher probabilities. Equal parameter counts make this a comparison of arrangement alone, and the result describes this experiment rather than a general advantage of width or depth.",
            ),
            trueFalse(
              "A non-finite value produced inside a layer is caught on the way out of that same layer.",
              false,
              "It is caught one seam later, where the next layer scans what it is given. A response is built once per layer per call, and scanning every block on the way out as well as on the way in would double the check for a value that finite inputs and finite weights can still produce, so the placement is a decision rather than an omission.",
            ),
        ],
        },
        {
          title: "Practice. Running the Row and the Block With the Library",
          practice: [
            exercise(
              "Send three people through as one block",
              ["Build the running network with the library, three rectifier neurons holding (1, 1), (1, −1) and (−1, 1) under one identity neuron holding (1, −1, 2), every bias zero. Hand it section 7’s three people as one block and print, for each layer, the shape of the block it read and the block it answered, then the hidden scores, the hidden outputs and the three answers.", "Section 7 gives the hidden outputs as (3, 0, 1), (0, 0, 0) and (0, 0, 1.5) and the answers as 5, 0 and 3. Then rebuild the hidden layer under the sigmoid and send the same block through. Section 10 quotes 2.1457 for the first person. The lesson never says what the third person gets."],
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
              { hints: ["respond_to takes a block whose first axis is the people, so the (3, 2) array goes in as it is, and the stack answers with one response per layer that you can loop over or index by position.", "Each layer’s response carries inputs, scores and outputs as arrays, the three blocks of section 9. The stack’s own outputs are the last layer’s, a (3, 1) block, and ravel flattens it to three numbers.", "A layer cannot change its activation function once built, so make a second hidden layer from the same weights with Sigmoid() and put it in a new LayerStack with the output layer you already have."], check: numberCheck("What does the network answer for the third person, (−1, 0.5), with the hidden layer under the sigmoid, to four places?", 1.8303, 0.0005, "The third person’s hidden scores are (−0.5, −1.5, 1.5) whatever the activation function is. The rectifier turned the two negative ones to zero, which is how the answer came to 3. The sigmoid lets all three through as about 0.3775, 0.1824 and 0.8176, and the output neuron’s weights (1, −1, 2) combine those into 1.8303.") },
            ),
            exercise(
              "Collapse two straight layers into one map",
              ["Section 18 says two layers with only the identity between them are one affine map, with matrix W₂ W₁ and bias W₂ b₁ + b₂, and works it at the row with every bias zero, so the bias half of the formula is never exercised. Here the hidden neurons are given biases 0.5, −1 and 2 and the output neuron 0.25.", "Read the two weight matrices and bias vectors off the layers, form the combined weights and the combined bias, and print both. Then print what the stack answers for the three people beside what the single map answers for them. The combined weights should still be section 18’s (−2, 4)."],
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
              { hints: ["A dense layer exposes weight_matrix, one row per neuron and one column per input, and bias_vector, one entry per neuron. The output layer’s matrix is (1, 3) and the hidden layer’s is (3, 2), so their product in that order is (1, 2).", "The combined bias is the output matrix times the hidden bias vector, plus the output layer’s own bias vector. It comes back as an array of one entry.", "The single map applied to a block is the block times the combined weight row, plus the combined bias. With numpy that is people @ combined_weights[0] + combined_bias[0]."], check: numberCheck("What is the combined bias, W₂ b₁ + b₂?", 5.75, 0.0005, "The output neuron weighs the three hidden biases by (1, −1, 2), which gives 0.5 + 1 + 4 = 5.5, and its own bias adds 0.25. The average person at (0, 0) is answered with exactly that, since the weights multiply zeros, and the stack and the single map agree on all three people because nothing between the two layers changes a slope.") },
            ),
            exercise(
              "Let a stack refuse a broken seam",
              ["Each chain below is a list of (reads, answers) pairs, bottom layer first. The first is section 16’s chain of three, the second changes its last layer to read 5, the third breaks the first seam as well, and the fourth is section 15’s layer reading eight and answering five under one reading five and answering eight.", "For each chain build the layers from zero weights, since a seam check reads shapes and never weights, and try to stack them. Print what a stack that exists reads and answers and how many parameters it holds, and print the refusal of one that does not. Section 16 says the first chain holds thirty parameters. The lesson does not count the fourth."],
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
              { hints: ["A layer is built from its neurons, one neuron per answered width and one weight per read width, which is what the comprehension in the starter does. Building the layers never fails here. Stacking them is what can.", "LayerStack checks every seam in its constructor and raises ShapeMismatchError at the first one that does not hold, so wrap the construction in try and except and print the exception itself.", "A stack that exists has a shape with reads and answers, and it can be looped over layer by layer. Each dense layer’s weight_matrix.size plus bias_vector.size is its m × n + m."], check: numberCheck("How many parameters does the stack of a layer reading 8 and answering 5 under a layer reading 5 and answering 8 hold?", 93, 0.5, "The lower layer holds 8 × 5 + 5 = 45 and the upper one 5 × 8 + 8 = 48. Only the seam between them is checked, where an answer of (5,) meets a read of (5,), so a stack that reads eight and answers eight is built without complaint. The two broken chains are each refused at the first seam that fails, which is why the third is named at layers 0 and 1 although its second seam is broken as well.") },
            ),
          ],
        },
      ]}
    />
  );
}
