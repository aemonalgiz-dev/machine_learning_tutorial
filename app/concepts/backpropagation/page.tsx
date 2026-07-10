import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { BackpropagationPlayground } from "@/components/widgets/BackpropagationPlayground";

export const metadata: Metadata = {
  title: "Backpropagation · oop_ml",
  description:
    "The loss's slope with respect to every weight in the chain, computed by walking the chain backward once, each layer handing down what the layer below needs and keeping its own correction.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function BackpropagationPage() {
  return (
    <ConceptPage
      title="Backpropagation"
      tagline="Every weight's slope, from one walk back down the chain."
      prerequisites={
        <>
          The network is the{" "}
          <Link href="/concepts/dense-layers" className={linkClass}>
            dense layers page&rsquo;s
          </Link>{" "}
          2-3-1 stack, the number being lowered is the squared error from the{" "}
          <Link href="/concepts/loss-functions" className={linkClass}>
            loss functions page
          </Link>
          , and the whole method is the chain rule from the{" "}
          <Link href="/primers/calculus" className={linkClass}>
            calculus primer
          </Link>
          , applied one layer at a time and more carefully than it has been
          so far.
        </>
      }
      history={
        <>
          <p>
            The logistic regression page fitted one neuron by walking against
            the slope of its loss, and that slope was easy to write down
            because every weight touched the loss directly. Put a layer of
            neurons underneath and that stops being true. A hidden
            weight&rsquo;s effect on the loss passes through the neurons above
            it, so its slope is a product of several pieces, and in the 1960s
            nobody had a routine for finding those pieces for every weight at
            once. Marvin Minsky and Seymour Papert&rsquo;s 1969 book
            Perceptrons proved what a single learned layer could not do,
            exclusive-or among other things, and with no way to train the
            hidden layer that would repair it, most work on networks stopped.
          </p>
          <p>
            The mathematics that repairs it is the chain rule run in reverse,
            and it was found more than once by people with different
            problems. Henry Kelley in 1960 and Arthur Bryson in 1961 used it in
            optimal control, adjusting a rocket&rsquo;s flight path one stage
            at a time. Seppo Linnainmaa&rsquo;s 1970 master&rsquo;s thesis at
            the University of Helsinki wrote the general form down as a way of
            tracking how rounding error accumulates through a long
            computation, which is reverse-mode automatic differentiation under
            its modern name. Paul Werbos argued in his 1974 Harvard thesis
            that the same reverse walk would train a multilayer network, and
            David Rumelhart, Geoffrey Hinton and Ronald Williams showed in a
            1986 paper in Nature that hidden units trained this way learned
            useful internal representations of their inputs. Their paper gave
            the method its name and its audience, and every deep network since
            has been trained by some descendant of the four lines on this
            page.
          </p>
        </>
      }
      playground={<BackpropagationPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Read the diagram above in two directions. Left to right is the
                forward pass the dense layers page built, each neuron forming
                a score and bending it, and the loss beneath the output is the
                number the whole network wants to lower. Right to left is this
                page. Every neuron now also shows the slope that arrived at it
                from above, and every edge shows the slope of the loss with
                respect to its weight, which is the one thing a gradient step
                needs to know about that weight.
              </p>
              <p>
                The question the page answers is how to find all of those
                slopes without treating each weight on its own. The obvious
                route, nudge one weight, remeasure the loss, divide, is honest,
                and it is what the readout at the bottom does for whichever
                weight you point it at, but it costs two forward passes per
                parameter. Backpropagation finds every slope in one walk from
                the loss back down to the row, for roughly the price of a
                second forward pass. Each layer receives the slope of the loss
                at its own outputs, works out what its own weights want from
                that, and hands down the slope at its inputs, which is exactly
                what the layer beneath needs to do the same.
              </p>
              <p>
                Press the step button to see what the slopes are for. Every
                parameter moves against its own slope, scaled by the learning
                rate, the loss falls, and the diagram is redrawn from the
                stepped network so the walk can be continued from where it
                landed. Slide the learning rate up and the walk overshoots,
                the calculus primer&rsquo;s lesson about step size with
                thirteen weights to get wrong at once.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                One layer&rsquo;s backward step is four lines, and the method
                is those four lines applied to each layer in turn, top to
                bottom. Call the slope of the loss at a layer&rsquo;s outputs
                its arriving block. For the top layer it comes from the loss
                itself, and the loss functions page showed that for squared
                error on a linear output that slope is simply prediction minus
                truth. Every output was a score with a bend applied, so the
                first line turns a slope at the outputs into a slope at the
                scores by multiplying by the bend&rsquo;s own slope where the
                forward pass evaluated it. That product is the delta, and it
                is the amber number beneath each neuron.
              </p>
              <Equation>{"δ = arriving × g′(score)"}</Equation>
              <p>
                A score is a weighted sum plus a bias, so its slope with
                respect to any one weight is the delta times whatever that
                weight multiplied, the input on that edge, and its slope with
                respect to the bias is the delta alone. Those two lines are
                what the layer keeps for itself. The fourth line is what it
                hands down. The layer beneath needs the slope of the loss at
                its outputs, which are this layer&rsquo;s inputs, and input i
                reached the loss through every neuron of this layer, so its
                slope is the sum over those neurons of delta times the weight
                on that edge.
              </p>
              <Equation>{"∂L/∂w[j, i] = δ[j] × input[i]\n∂L/∂b[j]    = δ[j]\npassed down[i] = Σⱼ δ[j] × w[j, i]"}</Equation>
              <p>
                The library&rsquo;s stack threads a single variable through
                that walk. It starts as the loss&rsquo;s slope, each layer
                answers with a correction holding its own gradient and the
                block it passed down, and the passed-down block becomes the
                arriving block for the layer beneath. Nothing about a
                layer&rsquo;s insides leaks into the walk, which is what lets
                the same loop serve a dense layer and, on later pages, a
                convolution or a pooling window. When the walk ends the step
                is one subtraction per parameter, the weight minus the learning
                rate times its slope, and the library builds a new stack from
                the moved numbers rather than editing the old one.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked example button. The row is (1, 2), the target
                is 1, the three hidden neurons are rectifiers with weights
                (1, 1), (1, −1) and (−1, 1) and no biases, and the output
                neuron is linear with weights (1, −1, 2) and no bias. Going up,
                the hidden scores are 3, −1 and 1. The rectifier keeps 3, 0
                and 1, and the output neuron forms 3 × 1 + 0 × (−1) + 1 × 2,
                which is 5. Squared error against a target of 1 is 16 halved,
                so the loss reads 8.0000, and its slope at the output is the
                miss itself, 4.
              </p>
              <p>
                Now the output layer&rsquo;s own gradient, by hand. Its bend
                is the identity, whose slope is 1 everywhere, so its delta is
                the arriving 4 unchanged. Each weight&rsquo;s slope is that
                delta times what the weight read, and the weights read the
                hidden outputs 3, 0 and 1.
              </p>
              <Equation>{"∂L/∂w = 4 × (3, 0, 1) = (12, 0, 4)        ∂L/∂b = 4"}</Equation>
              <p>
                The edge from h₁ into the output shows ∂ 12, and the readout
                beneath the diagram is checking that very weight. Nudge it up
                by a millionth, remeasure the loss, nudge it down, remeasure,
                divide the difference by the width of the nudge, and the
                figure agrees with 12 to better than a millionth. That is not
                a coincidence of this example. The chain rule computes the
                exact derivative, and the check is there so that nobody has to
                take the four lines on trust.
              </p>
              <p>
                The block the output layer hands down is its delta times its
                weights, 4 × (1, −1, 2) = (4, −4, 8), and those three numbers
                are what arrive at h₁, h₂ and h₃. The rectifier&rsquo;s slope
                is 1 where the score was positive and 0 where it was not, so
                the hidden deltas are 4, 0 and 8. The middle neuron scored −1,
                its slope is 0, and every slope belonging to it comes out
                exactly zero. It learns nothing from this row, which is the
                rectifier&rsquo;s known hazard shown rather than described.
                The other two multiply their deltas by the row (1, 2), giving
                (4, 8) for h₁ and (8, 16) for h₃, and 16 is the largest slope
                anywhere in the network.
              </p>
              <p>
                One step at a learning rate of 0.05 moves every parameter by a
                twentieth of its slope. The output weights become (0.4, −1,
                1.8) with a bias of −0.2, h₁ becomes (0.8, 0.6) with a bias of
                −0.2, and h₃ becomes (−1.4, 0.2) with a bias of −0.4. Run the
                row through again and h₁ scores 1.8 while h₃ now scores −1.4
                and goes dark beside h₂, so the output is 0.4 × 1.8 − 0.2,
                which is 0.52, and the loss falls from 8.0000 to 0.1152. The
                readout shows both figures before you press anything, and
                pressing the step button makes the stepped numbers the
                network&rsquo;s own.
              </p>
            </>
          ),
        },
        {
          title: "A Gradient May Be None",
          content: (
            <>
              <p>
                Every layer in the walk answers with a correction, and a
                correction holds two things, the block passed down and the
                layer&rsquo;s own gradient. The first is never absent. Every
                layer sits on something, so every layer owes the layer beneath
                a slope at its inputs. The second can be absent, and the
                library says so with an honest None rather than a block of
                zeros.
              </p>
              <p>
                A pooling window has nothing to learn. It picks a maximum or
                takes an average, and there is no number inside it a gradient
                could move. A flattening layer only rearranges, and a dropout
                layer only silences. All three still route blame downward, and
                all three answer None when asked what their own parameters
                want, because they have none. A zero-filled block of the right
                shape would pass every type check and would step to no effect,
                and it would be a small lie about having something to learn.
                The stack&rsquo;s report of the largest slope anywhere skips
                those layers rather than counting them as zero, so a network
                made of nothing but pooling reports no movement at all, which
                is the true answer.
              </p>
              <p>
                The rule cuts the other way too. A dense layer handed None when
                it is asked to step refuses, because it does have parameters,
                and a missing gradient for them is not a quiet case but a
                mistake in whoever built the backward pass. Absence is declared
                where it is real and rejected where it is not, the same
                discipline the library applies to a backend that declines to
                provide a model rather than forgetting to.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Take one layer. Its outputs are a = g(z), where g is the bend
                applied to each score on its own, and its scores are z = Wx +
                b, one row of W per neuron. Suppose the slope of the loss with
                respect to every output is already known, and call it the
                arriving block. Because g acts on each score alone, the chain
                rule through the bend is a plain product, one per neuron.
              </p>
              <Equation>{"∂L/∂zⱼ = ∂L/∂aⱼ · g′(zⱼ)   =   δⱼ"}</Equation>
              <p>
                Score j is the sum over i of w[j, i] x[i], plus b[j], so its
                derivative with respect to w[j, i] is x[i] and with respect to
                b[j] is 1, and the chain rule again gives the two lines the
                layer keeps. Input i appears in every score, so the loss
                reaches it through every neuron, and the chain rule sums the
                routes.
              </p>
              <Equation>{"∂L/∂w[j, i] = δⱼ · xᵢ\n∂L/∂bⱼ = δⱼ\n∂L/∂xᵢ = Σⱼ δⱼ · w[j, i]"}</Equation>
              <p>
                That last line is the induction. The slope of the loss with
                respect to this layer&rsquo;s inputs is, by definition, the
                slope of the loss with respect to the outputs of the layer
                beneath, which is exactly the arriving block that layer needs
                to run the same three lines. The base case is the loss itself,
                whose slope at the final output the loss functions page already
                worked out, and the walk ends at the row, whose slope nobody
                needs but which costs nothing to report. Every layer is visited
                once, every slope is computed once, and the arithmetic is a
                handful of matrix products against blocks the forward pass
                already built, which is why the forward responses keep their
                scores rather than only their outputs.
              </p>
              <p>
                Compare the nudge. A finite difference needs two extra forward
                passes per parameter, so for this small network that is
                twenty-six passes to learn what one backward walk learns, and
                for a network of a million weights it is two million. The
                agreement the readout prints is the reason the nudge is a
                check and not a method.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
