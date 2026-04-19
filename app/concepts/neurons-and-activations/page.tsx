import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { NeuronPlayground } from "@/components/widgets/NeuronPlayground";
import { ActivationSlopeChart } from "@/components/widgets/ActivationSlopeChart";

export const metadata: Metadata = {
  title: "A Neuron · oop_ml",
  description:
    "One neuron is a weighted sum and a bend. The weights are the whole of what it learns, and the bend is chosen from a short list whose members differ in what they do to a gradient.",
};

export default function NeuronsAndActivationsPage() {
  return (
    <ConceptPage
      title="A Neuron"
      tagline="One weighted sum, one bend, and three numbers that are all it will ever learn."
      prerequisites={
        <>
          This page assumes{" "}
          <Link
            href="/concepts/logistic-regression"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            logistic regression
          </Link>
          , because a neuron with a sigmoid bend is that model exactly, and
          leans on the{" "}
          <Link
            href="/primers/calculus"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            calculus primer
          </Link>
          &rsquo;s slope, since what a bend does to a slope is the whole
          reason there is more than one bend to choose from.
        </>
      }
      history={
        <>
          <p>
            Every model so far took its inputs, weighed them, and read an
            answer off the total, and every one of them stopped there. A
            regression line is a weighted sum with a slope and an intercept,
            and logistic regression is the same sum with a squash on the end.
            The question that produced this page is what happens when the
            answer of one such unit is handed to another as an input, and the
            first step toward it was to give the unit a name. Warren McCulloch
            and Walter Pitts described it in 1943 as a nerve cell that fires
            when the weighted count of its inputs passes a threshold, and
            showed that enough of them wired together could compute any
            logical rule. Frank Rosenblatt&rsquo;s perceptron of 1958, built
            at the Cornell Aeronautical Laboratory, was the first such unit
            that learned its weights from examples rather than having them set
            by hand.
          </p>
          <p>
            The threshold was the trouble. A unit that jumps from off to on
            has no slope anywhere, so the calculus primer&rsquo;s move, follow
            the slope downhill, has nothing to follow, and a chain of such
            units cannot be trained. The sigmoid replaced it because it has a
            slope everywhere, and David Rumelhart, Geoffrey Hinton and Ronald
            Williams showed in 1986 how to walk a gradient backward through a
            chain of sigmoid units. That slope never exceeds a quarter, and
            Sepp Hochreiter&rsquo;s 1991 thesis worked out that a product of
            such factors shrinks to nothing across a deep chain. The
            rectifier, which simply clips negative scores to zero, was shown
            by Xavier Glorot, Antoine Bordes and Yoshua Bengio in 2011 to
            train deep chains where the sigmoid stalled, and it has been the
            default bend ever since. The four buttons in the box above are
            that whole history, side by side.
          </p>
        </>
      }
      playground={<NeuronPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The diagram at the top of the box is the entire model. Two
                inputs come in from the left, each is multiplied by its
                weight, the two products are added together with the bias,
                and the total, called the score, passes through one bend on
                its way out. Three numbers sit on the sliders, two weights and
                a bias, and those three are everything the neuron will ever
                learn. The bend is not learned. It is chosen from the short
                list of buttons, and that choice is the subject of the second
                half of this page.
              </p>
              <p>
                The shaded square is the neuron&rsquo;s answer at every point
                of the plane its two inputs span, and it has a shape worth
                staring at. The score is a weighted sum, which is a tilted
                plane, so there is one straight line along which it is exactly
                zero, drawn dashed, and the score grows in proportion to the
                distance from that line. The shading changes only as you move
                away from the line, never along it. Which side of the line,
                and how far, is the whole of what one neuron knows about the
                plane. Drag a weight slider and the line turns. Drag the bias
                and it slides without turning. Drag the probe dot and watch
                the three readouts follow it.
              </p>
              <p>
                Now press the four buttons in turn. Identity leaves the tilted
                plane a plane. ReLU flattens everything on the negative side
                to zero and leaves the other side alone. The sigmoid squashes
                the plane into the band between zero and one, and tanh into
                the band between minus one and one, each crossing its middle
                exactly on the dashed line. With the sigmoid chosen, the box
                is the logistic regression page over again with two inputs
                instead of one, and that is not a resemblance. A sigmoid
                neuron and a logistic model are the same calculation.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Write the score first, because every bend starts from it. Each
                input is scaled by its own weight, the scaled inputs are
                summed, and the bias is added, a constant that shifts where
                the bend happens without reference to any input.
              </p>
              <Equation>{"z = w₁·x₁ + w₂·x₂ + b"}</Equation>
              <p>
                Then one bend, written f, is applied to that one number, and
                the library offers four.
              </p>
              <Equation>
                {
                  "output = f(z)\n\nidentity   f(z) = z\nReLU       f(z) = max(0, z)\nsigmoid    f(z) = 1 / (1 + e^(−z))\ntanh       f(z) = tanh(z)"
                }
              </Equation>
              <p>
                The reason there is a bend at all is what happens without one.
                Feed the output of a bendless neuron into a second bendless
                neuron and the second computes a weighted sum of a weighted
                sum, which is a single weighted sum with different weights. A
                chain of a hundred of them collapses into one neuron, and
                depth buys nothing. The bend is what makes the second neuron
                worth having, and it belongs to the neuron itself rather than
                to a setting off to the side, because the backward pass will
                need the bend&rsquo;s slope at the very score the forward pass
                used.
              </p>
              <p>
                That last point is why the library&rsquo;s neuron answers with
                two numbers rather than one. Its response carries the score
                and the output together, since a forward pass reads only the
                output but a backward pass needs the score as well, to take
                the slope there. The weights are a plain ordered column with
                no names attached, a deliberate departure from the regression
                pages, where every coefficient was bound to a feature. Past
                the first layer a neuron reads the outputs of other neurons,
                coordinates in a space the network invented, and there is
                nothing to name them after.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked example button, which sets the weights to 2
                and −1, the bias to 0.5, and the probe to the input (1, 1).
                The score is the same under every button, so work it once.
              </p>
              <Equation>{"z = 2·1 + (−1)·1 + 0.5 = 1.5"}</Equation>
              <p>
                Now press the four buttons and read the output each time. The
                identity and ReLU hand the 1.5 straight back, since it is
                positive and ReLU only clips what falls below zero. The sigmoid
                and tanh squash it.
              </p>
              <Equation>
                {
                  "identity   1.5\nReLU       max(0, 1.5) = 1.5\nsigmoid    1 / (1 + e^(−1.5)) = 0.8176\ntanh       tanh(1.5) = 0.9051"
                }
              </Equation>
              <p>
                The slope readout is the derivation section&rsquo;s subject,
                and its four values are worth noting now. The identity and
                ReLU report 1, the sigmoid reports 0.1491, which is 0.8176
                times one minus 0.8176, and tanh reports 0.1807, which is one
                minus 0.9051 squared, to within the rounding. Two of the bends
                passed the score through untouched, and the two that squashed
                it also report a slope well under a quarter, and that pairing
                is not a coincidence.
              </p>
              <p>
                The dashed line is where 2·x₁ − x₂ + 0.5 is zero, which is x₂
                = 2·x₁ + 0.5, and on the window shown it enters at (−1.75, −3)
                and leaves at (1.25, 3). Drag the probe across it to (−1, 1)
                and the score becomes −2.5. The identity reports −2.5, the
                sigmoid a small number below one half, tanh a negative one,
                and ReLU reports exactly zero with a slope of exactly zero,
                which is the rectifier&rsquo;s dead side and the one thing
                about it that the derivation will come back to.
              </p>
            </>
          ),
        },
        {
          title: "Why Softmax Is Not on the List",
          content: (
            <>
              <p>
                Anyone who has met a classifier with more than two classes
                will look for softmax among the buttons and not find it, and
                its absence is a matter of type rather than taste. Each of the
                four bends above reads one number and answers one number.
                Apply one of them to a whole row of neurons and each
                neuron&rsquo;s answer depends on its own score alone, which is
                exactly why a neuron can carry its own bend and why the
                diagram at the top of the box is complete with nothing left
                out.
              </p>
              <p>Softmax reads the whole row at once.</p>
              <Equation>{"softmax(z)ᵢ = e^(zᵢ) / Σⱼ e^(zⱼ)"}</Equation>
              <p>
                Every output shares one denominator, the sum over the entire
                row, so the outputs compete for a fixed total of one. Raise a
                single neuron&rsquo;s score and every other neuron&rsquo;s
                output falls, though nothing about those neurons changed. No
                function of one number can do that, and no single neuron can
                hold it, because a neuron has no neighbours to normalise
                against. Softmax belongs to the output layer, where the whole
                row exists, and the library keeps it there, beside the
                multi-class loss, rather than on the list of bends a neuron
                may own. The classification pages are where it does its work.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The bend is chosen for its slope, so derive the four slopes.
                The identity&rsquo;s is 1 everywhere. ReLU is the line z on
                the positive side and the constant 0 on the negative, so its
                slope is 1 on one side and 0 on the other, a step with no
                in-between. The sigmoid takes three lines of the calculus
                primer&rsquo;s chain rule.
              </p>
              <Equation>
                {
                  "σ(z) = (1 + e^(−z))^(−1)\nσ′(z) = e^(−z) · (1 + e^(−z))^(−2)\n      = σ(z) · (1 − σ(z))"
                }
              </Equation>
              <p>
                The tangent is the sigmoid recentred, tanh(z) = 2·σ(2z) − 1,
                and differentiating that gives 4·σ′(2z), which simplifies to
                1 − tanh²(z). The worked numbers check both. At a score of 1.5
                the sigmoid&rsquo;s output is 0.8176 and 0.8176 × 0.1824 is
                0.1491, and tanh&rsquo;s output is 0.9051 and 1 − 0.9051² is
                0.1807 once the rounding is carried through, which are the
                two slopes the readout shows.
              </p>
              <p>
                Why the slope decides which bend to use comes from the
                calculus primer&rsquo;s chain rule. When a network learns, a
                gradient arrives at each neuron from whatever sits above it
                and is multiplied by the bend&rsquo;s slope at that
                neuron&rsquo;s score before it continues down. The
                sigmoid&rsquo;s slope peaks at exactly one quarter, at a score
                of zero, and is smaller everywhere else, so every sigmoid
                neuron a gradient passes through keeps at most a quarter of
                it. Through ten in a chain that is a quarter to the tenth
                power, under a millionth, in the best case at the single best
                point. Far from zero it is far worse. At a score of six the
                sigmoid&rsquo;s output is 0.9975 and its slope 0.0025, and
                tanh&rsquo;s slope there is about 0.000025. That is
                saturation, the bend has gone flat, and a flat bend passes
                almost nothing back, so the neurons below it stop learning.
                Nothing is broken and nothing raises. The walk just stalls.
              </p>
              <p>
                ReLU escapes this on one side and pays for it on the other.
                Its slope is exactly 1 wherever the score is positive, so a
                gradient passes through untouched however deep the chain,
                which is the reason it took over. Its slope is exactly 0
                wherever the score is negative, so a neuron whose score stays
                negative receives no gradient and can never recover. Tanh
                peaks at 1 rather than a quarter, so it starves a chain four
                times more slowly than the sigmoid does, and it saturates at
                both ends all the same. The chart below lays the four slopes
                over one another.
              </p>
              <ActivationSlopeChart />
            </>
          ),
        },
      ]}
    />
  );
}
