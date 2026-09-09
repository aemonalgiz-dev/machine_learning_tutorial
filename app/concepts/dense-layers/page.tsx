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
    "Many neurons reading the same row become one matrix multiply, a network is a chain of such layers each reading what the one beneath answered, and a chain whose widths do not agree is refused before any row is read.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function DenseLayersPage() {
  return (
    <ConceptPage
      title="A Dense Layer and the Forward Pass"
      tagline="Neurons side by side become one matrix multiply, and a chain of layers is a chain of agreements about width."
      prerequisites={
        <>
          One neuron, its weighted sum and the bend applied to it, is the{" "}
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
      history={
        <>
          <p>
            Frank Rosenblatt built the perceptron at the Cornell Aeronautical
            Laboratory in Buffalo between 1957 and 1958, and described it in
            &ldquo;The perceptron: a probabilistic model for information
            storage and organization in the brain&rdquo; in Psychological
            Review in 1958. The Mark I machine had layers in the sense this
            page means, a bank of units each reading the same retina of
            photocells and a second bank reading the first, and it learned
            to tell simple shapes apart. Only the last bank learned. The
            connections into the middle bank were wired at random and left
            alone, because nobody knew how to set them; a unit in the middle
            of a network has no correct answer anyone can write down for it,
            so nothing could tell it which way to change. Marvin Minsky and
            Seymour Papert&rsquo;s Perceptrons, in 1969, proved what a single
            learned layer could not compute, exclusive-or among other things,
            and the field largely stopped, since the repair was visibly a
            second learned layer and there was no way to train one.
          </p>
          <p>
            David Rumelhart, Geoffrey Hinton and Ronald Williams supplied the
            way in 1986, in &ldquo;Learning representations by
            back-propagating errors&rdquo; in Nature, and the name they used
            for the middle bank, hidden units, is the one still in use. Three years
            later George Cybenko proved that one hidden layer of sigmoid
            units, wide enough, comes as close as you like to any continuous
            function on a bounded region, Kurt Hornik extended the result in
            1991, and Moshe Leshno, Vladimir Lin, Allan Pinkus and Shimon
            Schocken showed in 1993 that the bend can be anything that is not
            a polynomial, which admits the rectifier this page trains with.
            Those theorems say a network exists, and say nothing about
            whether a training loop finds it, a gap this page measures on
            twenty-five people rather than takes on trust. The word dense is
            recent. The layer was a fully connected layer for decades, and
            dense is the name the Keras library gave it in 2015, which has
            largely displaced the older one.
          </p>
          <p>
            The page asks six questions in order. What is a layer, and why is
            it one object rather than a list of neurons? Why does its
            arithmetic become one matrix multiply, and why does the matrix
            have the shape it has? What does a forward pass through several
            layers produce, and why does each layer keep its scores as well
            as its outputs? How do two layers join, and how can a network
            that cannot work be refused before any row is read? What do width
            and depth buy on a crowd of real people? And what must an
            implementation state, and refuse?
          </p>
        </>
      }
      playground={<DenseForwardPlayground />}
      sections={[
        {
          title: "Part 1. Many Neurons, One Row",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Three neurons reading the same two numbers">
                <p>
                  Take one person from the crowd the classification pages
                  keep returning to, written in standard units so that (1, 2)
                  means one deviation taller than average and two deviations
                  heavier. The neurons page hands that row to one neuron and
                  gets one number back. Hand the same row to three neurons at
                  once and three numbers come back, and that is the whole of
                  what a layer adds. Nothing about any neuron has changed.
                  Each still holds one weight per input and a bias, forms its
                  score, bends it, and hands the bent number on.
                </p>
                <SharedRowLedger />
                <WorkedExample title="The three scores">
                  <p>
                    The first neuron holds (1, 1), so its score is 1 + 2 = 3.
                    The second holds (1, −1), so its score is 1 − 2 = −1. The
                    third holds (−1, 1), so its score is −1 + 2 = 1. The
                    rectifier keeps 3 and 1 and turns −1 to 0, and the row the
                    next layer will read is (3, 0, 1). Switch the bend to the
                    sigmoid and the same three scores answer 0.9526, 0.2689
                    and 0.7311 instead; the scores did not move, only what
                    was made of them.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A layer is several neurons that all read the identical row.
                  The row is shared, and every neuron forms its own score
                  from it with its own weights.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Why the widths inside a layer cannot disagree">
                <p>
                  Because every neuron in the layer is handed the same row, a
                  neuron expecting a different number of inputs is not an odd
                  member of the group, it is one that can never be fed. Give
                  the layer a neuron holding two weights and another holding
                  three and there is no row that satisfies both. So the width
                  a layer reads is a fact about the group, settled when the
                  group is formed, and a group that cannot agree on it is
                  refused at construction rather than discovered when a row
                  arrives. I tried it, and the refusal reads
                  &ldquo;every neuron in a layer reads the same row, so they
                  must agree on its width, got [2, 3]&rdquo;.
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
                <p>
                  Every neuron holds one weight per input and one bias, so a
                  layer&rsquo;s parameter count is its two widths multiplied
                  together, plus one bias per neuron. The hidden layer of the
                  running example holds three times two weights and three
                  biases, nine numbers; the output layer holds three weights
                  and one bias, four; the network holds thirteen, and the
                  playground&rsquo;s readout counts them the same way.
                </p>
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
                  <p>
                    The networks Part 5 trains on the crowd read the same two
                    measurements and answer one number. One hidden layer of
                    six rectifiers is 2 · 6 + 6 and then 6 · 1 + 1, which is
                    twenty-five parameters, and two hidden layers of three is
                    2 · 3 + 3, then 3 · 3 + 3, then 3 · 1 + 1, which is also
                    twenty-five. That coincidence is what lets width be set
                    against depth there with nothing else changed.
                  </p>
                </InAModel>
                <KeepInMind>
                  A dense layer is m · n weights and m biases and nothing
                  else. The count grows with the product of the two widths,
                  which is what makes wide layers reading wide rows expensive.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                  <p>
                    Choose the second neuron and its row of W lights up beside
                    the whole of x. The entry of z it produces is
                    1 · 1 + (−1) · 2 + 0 = −1, which is exactly the dot
                    product section 1 formed for it. Every row of the multiply
                    is one neuron&rsquo;s arithmetic, and the multiply is the
                    three of them written once.
                  </p>
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
                <BlockPass />
                <WorkedExample title="Three people through the two layers">
                  <p>
                    The tall heavy person (1, 2), someone exactly average at
                    (0, 0), and someone a deviation shorter and half a
                    deviation heavier at (−1, 0.5) go in as a block of shape
                    (3, 2). The hidden layer answers a (3, 3) block whose
                    rows are (3, 0, 1), (0, 0, 0) and (0, 0, 1.5), since the
                    third person&rsquo;s scores were (−0.5, −1.5, 1.5) and
                    the rectifier kept only the last, and the output layer
                    answers a (3, 1) block holding 5, 0 and 3. The average
                    person scores zero at every neuron, because every bias is
                    zero.
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

              <SubSection title="8. The bend is applied one entry at a time">
                <p>
                  After the multiply, each neuron bends only its own score,
                  so the bend is applied to every entry of z on its own and
                  the result has z&rsquo;s shape. That is what lets a whole
                  layer share one bend applied to one block in a single call,
                  and it is why softmax is not among the four bends here,
                  since softmax reads a whole row of scores to answer any one
                  of them, which the neurons page sets out.
                </p>
                <Equation>{"a = f(z), entry by entry\n\nrectifier   (3, −1, 1) → (3, 0, 1)\nsigmoid     (3, −1, 1) → (0.9526, 0.2689, 0.7311)\ntangent     (3, −1, 1) → (0.9951, −0.7616, 0.7616)"}</Equation>
                <p>
                  Each neuron carries its own bend, so nothing in the
                  mathematics stops a layer from mixing them, and a layer
                  whose first neuron is straight and whose second is a sigmoid
                  is accepted; I checked, and it answers (3, 0.9526)
                  at the row. A uniform layer is a fact about ordinary
                  practice rather than a law, and it is the case a vectorised
                  pass can exploit, since one bend over a whole block is one
                  call where a mixed layer needs one per column.
                </p>
                <KeepInMind>
                  The bend acts on each score alone, which is what makes it
                  one call over a block. A layer may mix bends; nearly every
                  layer in practice does not.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                  <p>
                    z₁ is (3, −1, 1) and h is (3, 0, 1). The output
                    neuron&rsquo;s weights are (1, −1, 2), so z₂ is
                    1 · 3 − 1 · 0 + 2 · 1 = 5, and its bend is the identity,
                    so y is 5. The −1 on the second edge multiplies a zero and
                    contributes nothing, which is why the playground draws
                    that edge faint. Under a sigmoid hidden bend h becomes
                    (0.9526, 0.2689, 0.7311), the edge wakes, and y moves to
                    2.1457; under the tangent it is 3.2798.
                  </p>
                </WorkedExample>
                <p>
                  One response is kept per layer and the whole list handed
                  back, with the last layer&rsquo;s outputs
                  reachable directly so that an ordinary caller never indexes
                  into the list at all. A deeper network is the same
                  alternation continued, an affine map, a bend, an affine
                  map, a bend, for as many layers as were stacked.
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
                  A forward pass on its own would need only the outputs. The
                  scores are kept because training needs the slope of each
                  bend at the point where the bend was evaluated, and that
                  point is the score, not the output. Under the rectifier the
                  output 0 of the second hidden neuron could have come from a
                  score of −1 or −100, and its slope is zero either way, but
                  under the sigmoid the slope at a score of −1 is one number
                  and at −100 another, and from an output alone the score
                  would have to be recovered by running the layer again. The
                  inputs are kept for the same reason, since the correction
                  owed to a layer&rsquo;s weights multiplies by what the layer
                  read, and the forward pass is the only thing that knows it.
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
                  A response keeps the score because the slope of a bend is
                  taken at the score, and keeps the inputs because the weight
                  correction multiplies by them. Both would otherwise have to
                  be recomputed.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Why a pass says why it is happening">
                <p>
                  A dense layer does the same arithmetic whether the network
                  is learning or answering, and so do a convolution and a
                  pooling window. Two layers do not. A dropout layer damages
                  its own answers on purpose while learning, and a batch
                  normalisation layer standardises by the batch in front of it
                  while learning and by remembered statistics while
                  answering. So every pass here states its purpose, predicting
                  or training, and hands it to every layer whether or not the
                  layer reads it, so that a layer which starts caring later
                  does not change the interface for the rest.
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
                  The definition of a layer is a loop, ask each neuron in
                  turn, and the matrix multiply is that loop written as one
                  call. Both are kept, the multiply for every fit and
                  the loop as an observed route for anyone who wants to see
                  one neuron&rsquo;s arithmetic, and a test asserts that they
                  agree, because a fast path and a slow path with nothing
                  between them are two implementations rather than one
                  calculation read two ways. They agree to within floating
                  point and not to the last bit, since the multiply sums the
                  products in a different order than a loop does.
                </p>
                <RouteAgreement />
                <InAModel title="Measured">
                  <p>
                    On the running network, two and three inputs wide, the two
                    routes agree exactly, a gap of 0. On a seeded layer of
                    eight neurons reading eight inputs the largest gap in the
                    scores is 4.4 × 10⁻¹⁶, and on sixty-four neurons reading
                    sixty-four inputs, 4,160 parameters, it is 7.1 × 10⁻¹⁵ in
                    the scores and 5.3 × 10⁻¹⁵ in the outputs. A dot product
                    of sixty-four terms summed in two different orders parts
                    in the fifteenth decimal place, and the scores in the
                    table beneath the sliders differ only in their last digit
                    or two.
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
                  A dense layer knows two things about itself before any data
                  arrives, the width it reads and the width it answers with,
                  and each is recorded as a tuple of extents rather
                  than as a number. For a dense layer the tuple has one
                  entry, (2,) or (3,), and the distinction looks pedantic. It
                  stops being pedantic the moment a layer answers with
                  something arranged, a convolution handing on a stack of
                  pictures, say. A dense layer reading a row that holds
                  exactly as many numbers still cannot read it, because a row
                  and a stack of pictures are different arrangements of the
                  same count, and a check that compared counts would wave that
                  mismatch through as an agreement.
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
                  An answer nobody is obliged to read is not a guarantee. A
                  caller can ask whether two layers join, discard the answer,
                  and discover the disagreement inside a matrix multiply
                  later. So the check is not left to the
                  caller. A stack of layers refuses to exist unless every
                  seam holds, and a stack that has been built is one whose
                  shape is already known to be sound, so no forward pass
                  anywhere re-establishes it. The check is a walk down a list
                  of integers, two comparisons for three layers, and it costs
                  nothing that could be measured.
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
                  The first of those is checked by the first layer itself the
                  moment a block arrives, which is the refusal section 7
                  provoked with a row of width three. Nothing downstream
                  checks anything, because every interior seam was settled
                  when the stack was built. And a mismatch the widths cannot
                  see stays invisible, since a row handed over with height
                  and weight swapped has the right width and is scored
                  wrongly with nothing raised. I sent (2, 1) through the running
                  network and it answered 2 where (1, 2) answers 5. The
                  weights carry no names and match inputs by position, so the
                  order is the contract, and this is documented rather than
                  defended.
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
          title: "Part 5. Width and Depth",
          content: (
            <>
              <SubSection title="18. Two layers without a bend are one layer">
                <p>
                  Before asking what a second layer buys, ask what it buys
                  when nothing bends between the two. Set both bends to the
                  identity and the four lines of section 10 substitute into
                  one, a single affine map from the person straight to the
                  answer with matrix W₂ W₁ and bias W₂ b₁ + b₂.
                </p>
                <Equation>{"y = W₂ (W₁ x + b₁) + b₂ = (W₂ W₁) x + (W₂ b₁ + b₂)"}</Equation>
                <WorkedExample title="The collapsed map at the row">
                  <p>
                    W₂ W₁ is [1 −1 2] against the three rows (1, 1),
                    (1, −1), (−1, 1), which is (1 − 1 − 2, 1 + 1 + 2) =
                    (−2, 4), and the bias is zero. At (1, 2) that answers
                    −2 + 8 = 6, and setting both bends to identity in the
                    playground makes the output readout say 6 as well, since
                    the collapsed map is reported beside every pass and
                    checked against a bendless stack.
                  </p>
                </WorkedExample>
                <p>
                  Without the bends the two layers are one map from two
                  numbers to one, wearing thirteen parameters where three
                  would do, and a hundred stacked bendless layers collapse
                  just as completely. The neurons page made the same point
                  for two neurons in a chain; this is the matrix version, and
                  it is why every layer between the first and the last has a
                  bend.
                </p>
                <KeepInMind>
                  Two affine maps compose to one affine map, so without a
                  bend a second layer adds parameters and no new shapes. The
                  bend is what gives it anything the first layer could not
                  already express.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. What one rectifier folds, and what a layer of them carves">
                <p>
                  With a rectifier as the bend, a hidden unit answers zero on
                  one side of a straight line through the plane and its score
                  on the other, so each hidden unit puts one crease into the
                  surface the output neuron builds. The output neuron adds up
                  its weighted creases, and a sum of functions that are each
                  flat on one side of a line and tilted on the other is a
                  surface made of flat facets, whose boundary against zero is
                  a chain of straight segments that can only turn where a
                  crease crosses it. So one hidden layer of rectifiers carves
                  a region bounded by straight pieces, with at most as many
                  turns as there are units.
                </p>
                <Equation>{"y = Σⱼ vⱼ · max(0, wⱼ · x + bⱼ) + c\n\nunit j is flat where wⱼ · x + bⱼ < 0 and tilted where it is not"}</Equation>
                <FoldLines />
                <InAModel title="Three creases on the crowd">
                  <p>
                    The best run at three units, from seed 2, calls every one
                    of the twenty-five people correctly at a loss of 0.0725,
                    and its three creases have weights (−5.912, −2.63),
                    (−4.088, −2.577) and (5.092, 2.849) on standardised height
                    and weight, with biases −1.853, −0.069 and −0.528. All
                    three run across the plane at similar angles, and the
                    boundary between the two shaded regions turns only where
                    it meets one of them. At two units there are two creases
                    and the boundary cannot close around the children in the
                    middle, and the best run leaves four adults wrongly called.
                  </p>
                </InAModel>
                <KeepInMind>
                  A hidden rectifier is a crease, and one hidden layer of them
                  carves the plane into straight-sided pieces. The number of
                  units is the number of creases available.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Width on the crowd, measured">
                <p>
                  The theorems in the history say a wide enough layer can
                  come as close as you like to any boundary. What they do not
                  say is what happens on twenty-five people for a training
                  loop of fifteen hundred epochs at a fixed stride, so I ran
                  it, at six widths from one unit to eight, from six starting
                  seeds each, with the logistic page&rsquo;s straight boundary
                  on the same people as the control.
                </p>
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
                <p>
                  One unit is one crease, so the boundary is one straight line
                  bent once, and the best start manages 21 of 25, an accuracy
                  of 0.84, which is already better than the straight
                  boundary&rsquo;s 0.68. One of its six starts ends at 0.52
                  with the unit dead, switched off for every person, at a
                  loss of 0.6923, which is a network answering about a half
                  to everyone. Two units reach 0.84 from every start and no
                  further, and the best of them leaves four adults of
                  middling height and weight wrongly called among the
                  children. Three units can close the boundary, and do from
                  one start in six. From there widening buys reliability
                  rather than capacity, since four units succeed from two
                  starts, six from four and eight from all six.
                </p>
                <KeepInMind>
                  On this crowd three creases are enough to exist and eight
                  are needed to be found reliably. Width past what the
                  boundary needs is buying the loop more ways to arrive, and
                  that is a fact about the loop rather than about the
                  boundary.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Width against depth at twenty-five parameters">
                <p>
                  Section 4 noticed that one hidden layer of six and two
                  hidden layers of three hold the same twenty-five numbers, so
                  the two can be set against each other with only the
                  arrangement changed. A second hidden layer reads the first
                  layer&rsquo;s creased surface rather than the plane, so its
                  creases are bent already, and the textbook expectation is
                  that depth buys more shape per parameter. On this crowd it
                  did not buy more accuracy.
                </p>
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
                <p>
                  The wide layer called everyone from four starts and the deep
                  arrangement from two, and the deep one&rsquo;s worst start
                  finished at 0.76 with two of its three second-layer units
                  dead, so it was working with one bent crease. But look at
                  the losses. When the deep network does arrive, it arrives
                  far more confidently, 0.0045 against the wide layer&rsquo;s
                  best of 0.0388, a factor of nearly nine at the same
                  parameter count, and two layers of six reach everyone from
                  every start at losses under 0.004. Depth bought a sharper
                  boundary and a less reliable walk, and the two came out
                  together.
                </p>
                <KeepInMind>
                  At equal parameter count, depth did not beat width on this
                  crowd in accuracy and did beat it in loss when it arrived.
                  Which of those matters depends on what the network is for,
                  and neither is the textbook&rsquo;s clean win.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. What the guarantee promises and what the loop finds">
                <p>
                  The universal approximation results promise that a network
                  exists. Every number in the two tables above is about
                  whether this loop, from this start, found it, and the gap
                  between the two is the honest content of the section. Three
                  units suffice for this crowd, since seed 2 proves it, and
                  five of the six starts at three units did not get there. One
                  of the six starts at eight units ended with a unit dead for
                  everyone, contributing a constant, and it still called every
                  person correctly with the seven that were left, at a loss of
                  0.0813 against the 0.0347 of the best start.
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
                <p>
                  A complete dense layer states the width it reads and the
                  width it answers with, as arrangements; that every neuron in
                  it holds exactly the read width in weights; the order its
                  neurons answer in, since that order is what the next
                  layer&rsquo;s weights are aligned to; the shape convention
                  of its weight matrix, rows for neurons and columns for
                  inputs here; that a block&rsquo;s first axis is the rows and
                  every axis after it must match what the layer reads; that a
                  response carries the inputs, the scores and the outputs
                  together; that the bend is applied entry by entry and may
                  in principle differ per neuron; and that the pass carries a
                  purpose which this layer ignores. A complete stack states
                  that every seam is checked at construction, that the
                  refusal names the seam by position and both arrangements,
                  that its own shape is the first layer&rsquo;s reads and the
                  last layer&rsquo;s answers, and that no interior width is
                  re-checked during a pass.
                </p>
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
                    { expression: "mixed bends in one layer", reason: "accepted, and answers (3, 0.9526) at the row with a straight first neuron and a sigmoid second." },
                    { expression: "softmax requested as a bend", reason: "refused; it is not on the list and cannot be, since it reads a row." },
                    { expression: "a width of zero, or a boolean, as an extent", reason: "refused, ‘n_inputs extents must be at least 1, got 0’ and ‘n_inputs must be whole numbers, not bools’, because true would otherwise read as a width of one." },
                    { expression: "a step handed no gradient", reason: "refused, ‘a dense layer has parameters and needs a gradient to step by’; absence is for layers with nothing to learn." },
                    { expression: "new parameters of the wrong shape", reason: "refused, ‘this layer’s weights are (3, 2), got (2, 3)’, so a transposed matrix cannot be installed quietly." },
                    { expression: "a row with its columns swapped", reason: "not detectable; (2, 1) answers 2 where (1, 2) answers 5, with nothing raised. Positional weights are the contract. Documented rather than defended." },
                    { expression: "unfitted use", reason: "nothing to refuse; a layer is built complete from its neurons and has no fit of its own. Fitting is the training page’s job." },
                    { expression: "a weight beyond a million, a block of more than six rows, a chain of more than six layers, or a width beyond eight", reason: "refused at the door as a request larger than the page allows, with the limit named." },
                  ]}
                />
                <p>
                  Two rows deserve a second look. The overflow row is a
                  decision rather than an omission, since a layer&rsquo;s
                  response is built once per layer per call, and scanning every block
                  on the way out as well as on the way in would double the
                  check for a value that finite inputs and finite weights can
                  still produce, so it is caught one seam later, where the
                  next layer scans what it is given. And the swapped-columns
                  row is the price of a unit that reads unnamed coordinates
                  from the layer beneath it. Past the first layer there are no
                  names to check against, so the first layer cannot have them
                  either, and the order a caller assembles a row in is the
                  whole of the agreement.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
