import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { TrainingRunPlayground } from "@/components/widgets/TrainingRunPlayground";

export const metadata: Metadata = {
  title: "Training a Small Network · oop_ml",
  description:
    "Everything on the pages before this, run in a loop: forward, loss, backward, step, for a few hundred passes on a problem no straight line can solve, with the loss falling and the decision region bending.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function TrainingANetworkPage() {
  return (
    <ConceptPage
      title="Training a Small Network"
      tagline="Four pages of machinery, put in a loop, on a problem a line cannot solve."
      prerequisites={
        <>
          This page assembles the four before it: the{" "}
          <Link href="/concepts/neurons-and-activations" className={linkClass}>
            neuron
          </Link>{" "}
          and its bend, the{" "}
          <Link href="/concepts/dense-layers" className={linkClass}>
            dense layer
          </Link>{" "}
          and the forward pass, the{" "}
          <Link href="/concepts/loss-functions" className={linkClass}>
            loss
          </Link>{" "}
          that scores it, and{" "}
          <Link href="/concepts/backpropagation" className={linkClass}>
            backpropagation
          </Link>{" "}
          walking the blame back down. Nothing new is introduced here except
          repetition.
        </>
      }
      history={
        <>
          <p>
            The pieces existed separately for a long time before anybody put
            them in this loop. Frank Rosenblatt&rsquo;s perceptron of 1958
            learned a straight boundary and could not learn a bent one, a limit
            Marvin Minsky and Seymour Papert set out precisely in their 1969
            book, whose worked case was exclusive-or, one of the two presets
            below. Their point was narrow and correct and was widely read as
            broader than it was: a single unit cannot do it, and a layer of
            units feeding another can, but nobody had a way to train the layers
            in between.
          </p>
          <p>
            The way was found repeatedly and ignored twice. Seppo Linnainmaa
            published the reverse-mode differentiation that backpropagation is
            in 1970, Paul Werbos applied it to networks in his 1974 thesis, and
            it was the 1986 paper by David Rumelhart, Geoffrey Hinton and Ronald
            Williams that finally made the field pay attention. What that paper
            showed is exactly what the box below does: put a layer of bent units
            under an output unit, run this loop, and a boundary no line could
            draw appears.
          </p>
        </>
      }
      playground={<TrainingRunPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The box above holds one training run. The library was asked once
                and the endpoint recorded what happened, so the replay slider
                steps through a single network learning rather than through a
                series of separate fits. Drag it from the left and watch two
                things move together: the shaded regions bending into place, and
                the marker sliding down the loss curve beside them.
              </p>
              <p>
                Start at epoch zero, before any step has been taken. The
                weights are random, so the boundary is an arbitrary line through
                the middle of the data and the accuracy is about a coin toss.
                Drag right and it bends. On the two rings it closes into a
                circle around the inner one, which is a shape no straight
                boundary has available. On exclusive-or it becomes a pair of
                diagonal bands.
              </p>
              <p>
                The readout carries the control that makes the point measurable
                rather than rhetorical. Beside the network&rsquo;s accuracy is
                what the logistic page&rsquo;s model manages on the same people,
                fitted with the same library: 0.583 on the rings and 0.500 on
                exclusive-or, which is exactly what guessing gets. The network
                reaches 1.000 on both.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The loop is four lines, and each line is a page. Push the rows
                up through the stack, score the answers against the truth, walk
                the blame back down to get a slope for every weight, and step
                every weight against its slope. Then do it again.
              </p>
              <Equation>{"repeat, once per epoch:\n\n    backward  =  stack.backward_pass(rows, targets, loss)\n    stack     =  stack.stepped_by(backward, rate)"}</Equation>
              <p>
                That really is all of it. The backward pass runs the network
                forward on its way in, so the loss it reports belongs to the
                stack as it stood before the step, and the step produces a new
                stack rather than modifying the old one. That immutability is
                why the endpoint can record the run at all: each epoch&rsquo;s
                stack is a separate object, and nothing that has been written
                down changes later.
              </p>
              <p>
                The network itself is two layers. Two inputs feed six units that
                bend, and those six feed one unit that does not, because the
                loss applies its own squash and the loss-functions page derives
                why the last layer should therefore stay straight. That is
                twenty-five numbers in total, twelve weights and six biases in
                the hidden layer and six weights and one bias in the output.
              </p>
              <Equation>{"2 → 6   bent      12 weights + 6 biases\n6 → 1   straight   6 weights + 1 bias\n                    ────────────────────\n                    25 parameters"}</Equation>
              <p>
                Twenty-five is small enough to be worth stating. This is not a
                large model doing something inscrutable. It is twenty-five
                numbers, nudged two hundred times, and it separates a problem
                that a line provably cannot.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Leave the settings alone and the box runs the rings at six
                hidden units, a step size of a half, for two hundred epochs. The
                run starts with random weights, so before any learning the loss
                is 0.7271, which is close to the natural logarithm of two,
                0.6931, and it is close for a reason. A network that has learned
                nothing should answer about a half to everybody, and the log-loss
                of answering exactly a half is exactly log 2.
              </p>
              <Equation>{"loss of answering one half to everybody  =  −log(0.5)  =  0.6931\nthe untrained network's loss             =  0.7271"}</Equation>
              <p>
                Two hundred epochs later the loss is 0.1343 and every one of the
                sixty people is called correctly. Along the way the accuracy at
                epoch one is 0.483, worse than a coin toss, and at epoch fifty
                it is 0.750. Exclusive-or is quicker, reaching 1.000 by epoch
                fifty and finishing at a loss of 0.0232.
              </p>
              <p>
                One detail in the readout repays attention. The accuracy does
                not climb smoothly alongside the loss. It can sit still for many
                epochs while the loss keeps falling, because accuracy only
                counts which side of a half each answer landed on, and the loss
                cares how far from the truth each answer is. A network can spend
                fifty epochs becoming much more confident about people it was
                already calling correctly, which lowers the loss and moves the
                accuracy not at all.
              </p>
              <p>
                Press the new starting weights button a few times. The same
                people, the same settings, a different random start, and the
                run takes a visibly different path to a similar place. That is
                the calculus primer&rsquo;s two-valley caution again: the loss
                here is not a bowl with one bottom, and where the walk ends
                depends on where it began.
              </p>
            </>
          ),
        },
        {
          title: "Why a Straight Line Cannot",
          content: (
            <>
              <p>
                Both presets were chosen because the impossibility is provable
                rather than merely observed, and exclusive-or is the case with
                the shortest proof. Four clumps sit in the four quadrants, and
                diagonally opposite clumps share a class. A single unit computes
                a weighted sum and then bends it, and any bend that is
                monotone preserves order, so the question reduces to what the
                weighted sums can do.
              </p>
              <Equation>{"score at (1, 1)    =   w₁ + w₂ + b\nscore at (−1, −1)  =  −w₁ − w₂ + b\nscore at (1, −1)   =   w₁ − w₂ + b\nscore at (−1, 1)   =  −w₁ + w₂ + b\n\nfirst pair summed   =  2b\nsecond pair summed  =  2b"}</Equation>
              <p>
                The two clumps of one class total the same score as the two
                clumps of the other, for every choice of weights and bias there
                is. Separating them would require both of one pair to sit above
                a threshold and both of the other to sit below it, which would
                make the first total larger than the second. They are equal. So
                no single unit can do it, whatever bend it uses, and the readout
                showing a straight boundary at exactly 0.500 is that proof
                arriving as a measurement.
              </p>
              <p>
                The rings fail for a different and more intuitive reason: the
                inner ring is surrounded by the outer one, so any line that
                separates part of the inner ring from the outer must cut through
                the outer ring somewhere. A straight boundary manages 0.583 there
                rather than 0.500 only because the ring is sampled unevenly
                enough for a line to catch a few more than half by luck.
              </p>
              <p>
                What the hidden layer buys is composition. Each of the six units
                draws its own straight boundary and bends it, and the output unit
                takes a weighted sum of those six bent answers. A sum of bent
                things is not bent in one direction, so the boundary it can
                express is not a line, and with enough units it can be very
                nearly any shape at all. That is the universal approximation
                result, proved by George Cybenko in 1989 and by Kurt Hornik in
                1991, and it is worth knowing that it promises a network exists
                rather than promising this loop will find it.
              </p>
              <p>
                Drop the hidden units to two and the gap between what exists and
                what this loop finds becomes visible. The same run on the rings
                reaches 0.883 rather than 1.000, and its loss stops falling at
                0.2842. Two bent boundaries summed can close a region in
                principle, so a two-unit network that separates these rings very
                likely exists; two hundred epochs from this particular start did
                not arrive at it. The width is not doing something mysterious.
                It is the number of straight boundaries the output unit has to
                build its curve out of, and with only two there is far less room
                for the walk to find an arrangement that works.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                One epoch is the composition of the four previous pages, and
                writing it out once is the clearest way to see that nothing on
                this page is new. Take the two-layer network, write z for a
                weighted sum and a for a bent one.
              </p>
              <Equation>{"forward     z¹ = W¹x + b¹        a¹ = tanh(z¹)\n            z² = W²a¹ + b²       p  = sigmoid(z²)\n\nloss        L  = −y log p − (1 − y) log(1 − p),  averaged over rows"}</Equation>
              <p>
                The backward walk starts with the loss-functions page&rsquo;s
                canonical pairing, which is why the output layer was left
                straight. The sigmoid&rsquo;s derivative cancels the
                loss&rsquo;s, and the slope at the output score is a
                subtraction.
              </p>
              <Equation>{"∂L/∂z²  =  (p − y) / n"}</Equation>
              <p>
                From there the chain rule does the rest, exactly as the
                backpropagation page derives it. The output layer&rsquo;s weight
                slopes are that subtraction against the hidden answers; what
                passes down to the hidden layer is that subtraction sent back
                through the output weights; and the hidden layer&rsquo;s own
                slopes are what arrives, multiplied by the slope of its bend at
                the scores it formed.
              </p>
              <Equation>{"∂L/∂W²  =  (∂L/∂z²)ᵀ a¹\narriving =  W²ᵀ (∂L/∂z²)\n∂L/∂z¹  =  arriving  ⊙  (1 − tanh²(z¹))\n∂L/∂W¹  =  (∂L/∂z¹)ᵀ x"}</Equation>
              <p>
                Then every parameter steps against its own slope, which is the
                calculus primer&rsquo;s single move applied twenty-five times,
                and the epoch is over. Repeating it is the entire remaining
                content of training, and the loop in the mechanism section is
                that repetition with the arithmetic left where it belongs, inside
                the layers.
              </p>
              <p>
                The one thing this derivation cannot supply is a guarantee. The
                loss is not a bowl in these twenty-five numbers, so the walk
                arrives at a resting place rather than at the resting place, and
                the new starting weights button is the demonstration. Everything
                after this page in the wider subject, momentum, better
                initialisation, normalisation between layers, is machinery for
                making that walk arrive somewhere good more reliably.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
