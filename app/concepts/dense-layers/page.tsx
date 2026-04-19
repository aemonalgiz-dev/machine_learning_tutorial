import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { DenseForwardPlayground } from "@/components/widgets/DenseForwardPlayground";
import { LayerJoinChecker } from "@/components/widgets/LayerJoinChecker";

export const metadata: Metadata = {
  title: "A Dense Layer and the Forward Pass · oop_ml",
  description:
    "Stack neurons side by side and their weighted sums become one matrix multiply, and a network is a chain of such layers, each reading exactly what the one beneath it answered.",
};

export default function DenseLayersPage() {
  return (
    <ConceptPage
      title="A Dense Layer and the Forward Pass"
      tagline="Neurons side by side become one matrix multiply, and a chain of layers is a chain of agreements about width."
      prerequisites={
        <>
          One neuron, its weighted sum and the bend applied to it, is the{" "}
          <Link
            href="/concepts/neurons-and-activations"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            neurons page
          </Link>
          , and the matrix multiply a layer turns out to be is the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          &rsquo;s. Nothing else is needed.
        </>
      }
      history={
        <>
          <p>
            Frank Rosenblatt built the perceptron at the Cornell Aeronautical
            Laboratory between 1957 and 1958, a single layer of threshold
            units with adjustable weights, and taught it to tell simple shapes
            apart. It learned, which was startling, and the promises made on
            its behalf ran well ahead of it. In 1969 Marvin Minsky and Seymour
            Papert published Perceptrons, a careful account of what one such
            layer can and cannot compute, with exclusive-or as the case it
            cannot, the argument the neurons page walks through. The way out
            was visible inside the proof. A second layer, reading the first
            layer&rsquo;s answers rather than the raw inputs, computes
            exclusive-or easily. The trouble was that nobody had a way to set
            the weights of a layer whose correct answers no one could see, and
            the idea waited.
          </p>
          <p>
            In 1986 David Rumelhart, Geoffrey Hinton and Ronald Williams
            published a way to send an error backward through a stack of
            layers and correct every weight in it, and stacks of dense layers
            became trainable. Three years later George Cybenko proved that a
            single hidden layer of sigmoid neurons, wide enough, can come as
            close as you like to any continuous function on a bounded region,
            so the two-layer picture on this page is not a toy version of
            something larger. It is the smallest network that can do
            everything. This page is the forward half of the story, the part
            every later page assumes. A row goes in at one end, an answer
            comes out at the other, and between them each layer does one
            matrix multiply and one bend.
          </p>
        </>
      }
      playground={<DenseForwardPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The picture above has three columns. Two numbers on the left
                are the row, three neurons in the middle are the hidden layer,
                and the single neuron on the right is the output layer. Every
                neuron in a column reads every number in the column before it,
                which is what dense means, and nothing about a neuron has
                changed since the neurons page. Each hidden neuron holds two
                weights and a bias, forms its score, bends it, and hands the
                bent number on. The output neuron holds three weights, one for
                each number that arrives.
              </p>
              <p>
                Two facts about width fall out of that. A layer of three
                neurons answers with three numbers whether it read two inputs
                or two hundred, so the width a layer answers with is simply
                how many neurons it holds, and it owes nothing to the width it
                reads. And the next layer has to read exactly that many,
                because every one of its neurons needs one weight per arriving
                number. Change a cell in the tables and every node re-prints,
                because there is no stored answer anywhere. There is only the
                pass.
              </p>
              <p>
                Look at the third hidden neuron in the worked setting. Its
                score is −1, the rectifier turns that to 0, and the output
                neuron&rsquo;s weight of 2 on it multiplies nothing, which is
                why that edge is drawn faint. Switch the hidden bend to sigmoid
                and the same score answers 0.2689 instead, the edge wakes up,
                and the output moves from 3 to 1.6391. The bend decides what
                reaches the next layer, and the derivation section shows that
                without it the next layer would have nothing new to read.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                One neuron is a dot product plus a bias, the neurons
                page&rsquo;s weighted sum. Three neurons reading the same row
                are three dot products with that row, and stacking their three
                weight vectors as the rows of a matrix turns the three sums
                into one matrix multiply, the linear algebra primer&rsquo;s.
                The bend is then applied to every entry of the result, since
                each neuron bends only its own score.
              </p>
              <Equation>{"scores  = W · x + b\noutputs = f(scores)"}</Equation>
              <p>
                W has one row per neuron and one column per input, so the
                hidden layer&rsquo;s is 3 by 2 and the output layer&rsquo;s is
                1 by 3, and b holds one bias per neuron. Those two lines are
                the whole of a dense layer. The library keeps the neurons as
                objects, because the neuron is the unit that was learned
                about, and assembles the matrix once when the layer is built,
                so a pass is one multiply per layer rather than a loop over
                neurons. The loop survives only as the observed route, for
                exactly the kind of picture the widget draws.
              </p>
              <p>
                The forward pass is that pair of lines applied once per layer.
                The first layer reads the row, the second reads what the first
                answered, and the last layer&rsquo;s outputs are the
                network&rsquo;s answer. The library keeps every layer&rsquo;s
                inputs, scores and outputs from the pass rather than only the
                final row, because a backward pass needs the score each bend
                was evaluated at, and that is the{" "}
                <Link
                  href="/concepts/backpropagation"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  next page
                </Link>
                &rsquo;s subject.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked example button. The row is (2, 1). The hidden
                layer&rsquo;s weight rows are (1, 2), (−1, 3) and (1, −3) with
                biases 0, 1 and 0, so each hidden score is two products and a
                bias.
              </p>
              <Equation>{"h₁   1·2 + 2·1 + 0 =  4\nh₂  −1·2 + 3·1 + 1 =  2\nh₃   1·2 − 3·1 + 0 = −1"}</Equation>
              <p>
                The rectifier keeps 4 and 2 and turns −1 to 0, so the row the
                output neuron reads is (4, 2, 0). Its weights are (1, −1, 2)
                and its bias is 1.
              </p>
              <Equation>{"y   1·4 − 1·2 + 2·0 + 1 = 3"}</Equation>
              <p>
                The identity bend hands 3 back unchanged and the readout shows
                3. The middle column prints the scores 4, 2 and −1 and the
                outputs 4, 2 and 0, and every one of them is pencil
                arithmetic. Change one weight and work the new scores by hand
                before reading them off the nodes. A dense layer is nothing
                more mysterious than that table of numbers, applied to a row.
              </p>
            </>
          ),
        },
        {
          title: "What a Layer Knows About Its Neighbours",
          content: (
            <>
              <p>
                A dense layer knows two things about itself before any data
                arrives, the width it reads and the width it answers with, and
                the library records each as a tuple of extents rather than as
                a number. For a dense layer the tuple has one entry, (2,) or
                (3,), and the distinction looks pedantic. It stops being
                pedantic the moment a layer answers with something arranged, a
                convolution handing on a stack of pictures, say. A dense layer
                reading a row that holds exactly as many numbers still cannot
                read it, because a row and a stack of pictures are different
                arrangements of the same count, and a check that compared
                counts would wave that mismatch through as an agreement.
                Counts say how many. Tuples say how they are arranged, and the{" "}
                <Link
                  href="/concepts/shapes-and-flattening"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  shape guarantee page
                </Link>{" "}
                is where that bites.
              </p>
              <p>
                The check itself is a comparison of tuples, and it happens
                when the stack is built, not when a row is pushed through.
                Layer 1 reads what layer 0 answers, or the library refuses to
                build the stack at all, naming the seam and both widths. That
                is the two boxes below. Set the four widths, and every verdict
                comes back from the library with no row sent, in the same
                words a real mismatch would produce hours into a training run
                if nobody had checked first.
              </p>
              <LayerJoinChecker />
              <p>
                A stack that exists therefore has a shape of its own, the first
                layer&rsquo;s reads paired with the last layer&rsquo;s answers,
                and the readout in the opening widget prints it as (2,) → (1,).
                Everything between those two ends is internal, already agreed,
                and nobody else&rsquo;s business. The only two facts the data
                supplies are at the ends, how many features a row carries and
                how many numbers the task wants back.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Write the pass as matrices. x is the row as a column vector,
                W₁ and b₁ are the hidden layer&rsquo;s matrix and biases with
                f₁ its bend, and W₂, b₂ and f₂ are the same for the output
                layer.
              </p>
              <Equation>{"h = f₁(W₁ x + b₁)\ny = f₂(W₂ h + b₂)"}</Equation>
              <p>
                An affine map, a bend, an affine map, a bend, and a deeper
                network is the same alternation continued. Now ask what
                happens if both bends are the identity, so that f₁ and f₂ do
                nothing at all. The two lines substitute into one.
              </p>
              <Equation>{"y = W₂ (W₁ x + b₁) + b₂ = (W₂ W₁) x + (W₂ b₁ + b₂)"}</Equation>
              <p>
                That is a single affine map with matrix W₂ W₁ and bias
                W₂ b₁ + b₂, a one-layer network from x straight to y. On the
                worked example the product and the bias are small enough to do
                by hand.
              </p>
              <Equation>{"W₂ W₁      = [1 −1 2] · [[1 2], [−1 3], [1 −3]] = [4 −7]\nW₂ b₁ + b₂ = (1·0 − 1·1 + 2·0) + 1 = 0\ny          = 4·2 − 7·1 + 0 = 1"}</Equation>
              <p>
                Set both bends to identity in the widget and the output
                readout shows 1, and the without-the-bends readout has been
                showing (4, −7)·x + 0 = 1 all along, since the API reports the
                collapsed map beside every pass. Without the bends the two
                layers are one 2-to-1 layer wearing more parameters than the
                three it needs, and depth buys nothing. A hundred stacked
                bendless layers collapse just as completely. The bend is what
                gives the second layer something the first could not express,
                and the{" "}
                <Link
                  href="/concepts/training-a-network"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  training page
                </Link>{" "}
                shows what that buys on a problem no straight line can solve.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
