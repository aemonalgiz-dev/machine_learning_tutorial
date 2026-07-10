import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { DropoutPlayground } from "@/components/widgets/DropoutPlayground";

export const metadata: Metadata = {
  title: "Dropout · oop_ml",
  description:
    "While learning, silence a random share of a layer's units on every pass so no unit can lean on another. While predicting, silence none, and the scaling that makes those two agree is the whole trick.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function DropoutPage() {
  return (
    <ConceptPage
      title="Dropout"
      tagline="Silence a random share of the units while learning, none while predicting, and make the two agree by arithmetic."
      prerequisites={
        <>
          The row of units this page silences is a{" "}
          <Link href="/concepts/dense-layers" className={linkClass}>
            dense layer&rsquo;s
          </Link>{" "}
          answer, and the argument that the two modes agree is a mean taken
          over a coin toss, which is the{" "}
          <Link href="/primers/statistics" className={linkClass}>
            statistics primer&rsquo;s
          </Link>{" "}
          expectation in its simplest dress.
        </>
      }
      history={
        <>
          <p>
            By 2012 the networks doing best on hard problems held far more
            weights than there were rows to pin them down, and they overfit in
            a particular way. A unit deep inside a wide layer would learn to be
            useful only in the company of some other unit, a partnership that
            scored well on the training rows and fell apart on anything new.
            The known cure was to train many separate networks and average
            their answers, the ensemble idea of the bagging pages, and for
            networks that already took days to train once it was out of reach.
          </p>
          <p>
            Geoffrey Hinton, with Nitish Srivastava, Alex Krizhevsky, Ilya
            Sutskever and Ruslan Salakhutdinov, posted the answer in July 2012
            under the title Improving neural networks by preventing
            co-adaptation of feature detectors, and the full account appeared
            in 2014 as Dropout, a simple way to prevent neural networks from
            overfitting. Silence a random half of a layer&rsquo;s units on
            every training pass and no unit can count on any other being
            there, so each is pushed toward being useful alone, and every pass
            trains a different thinned network sharing one set of weights,
            which is an ensemble for the price of one model. That same year
            Krizhevsky, Sutskever and Hinton put it into the two widest layers
            of the network that won the 2012 ImageNet contest, and it has been
            in nearly every large network since. Their recipe scaled the
            weights down at prediction time. The inverted form on this page
            scales the survivors up while training instead, which is what
            every current library does, because it leaves prediction as plain
            arithmetic with nothing to remember.
          </p>
        </>
      }
      playground={<DropoutPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The box above holds one row of four units, the sort of numbers
                a dense layer answers with, and shows it twice. On the left is
                one training pass. A coin was tossed over every unit, the ones
                that lost are greyed out and send nothing on, and the ones that
                survived have been raised, so a bar that would have stood at 1
                stands at 2, with a dashed outline where it would have stood
                untouched. On the right is the same row while predicting,
                where no coin is tossed, nothing is silenced and nothing is
                scaled. Press draw again and the left side changes while the
                right side never does.
              </p>
              <p>
                Why break a layer on purpose. A unit in a wide layer can learn
                to be useful only alongside a particular neighbour, a detector
                that means nothing on its own and something in combination,
                and a network full of such pairings does well on the rows it
                trained on and badly on anything new. If the neighbour
                vanishes on half the passes, that pairing becomes a losing
                bet, and every unit is pushed toward carrying weight by
                itself. Nothing is penalised and no weight is shrunk. The
                layer is simply made unreliable while it learns, and the units
                adapt to the unreliability.
              </p>
              <p>
                The raising is the half of the idea that is easy to skip, and
                the chart under the bars is about it. Slide the drop
                probability and watch the scale above the survivors move with
                it. Each line in the chart is the mean of one unit&rsquo;s
                training output over four hundred draws, and each settles onto
                the dashed line at that unit&rsquo;s predicting output.
                Silencing lowers what the next layer reads, raising the
                survivors restores it on average, and so the layer above sees
                the same thing while learning and while answering, which is
                what lets a model be trained one way and used another.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                On a training pass the layer draws one number per unit, a 1
                with probability 1 − p and a 0 with probability p, where p is
                the drop probability, and multiplies the unit by that number
                over 1 − p. On a predicting pass it does nothing at all.
              </p>
              <Equation>{"training     out_j = value_j · m_j / (1 − p),   m_j ∈ {0, 1}\npredicting   out_j = value_j"}</Equation>
              <p>
                The division is the scaling. Silencing a share p of the units
                lowers the weighted sum the next layer computes by that same
                share on average, so a network trained with dropout and then
                asked to predict with every unit present would meet inputs at
                a size it had never been trained on. There are two places to
                put the correction. The original recipe scaled everything down
                at prediction time, which makes a saved model impossible to
                evaluate without knowing the p it was trained with. The
                inverted form scales the survivors up while training, and
                prediction becomes the identity, so the layer disappears once
                learning is over. The library does the inverted form, and the
                right-hand bars are the proof that it does.
              </p>
              <p>
                The draw is independent for every unit and for every row of a
                batch, which is what the mechanism asks for, since a mask
                shared across the batch would let a unit rely on its neighbour
                for the whole batch and only lose it on the next one. On the
                way back the layer multiplies the arriving blame by the very
                same mask, so a silenced unit is owed nothing and a survivor
                has its blame raised by the same factor its output was. The
                layer has no weights of its own, and its step returns the
                layer itself rather than a rebuilt copy, which matters more
                than it sounds. Rebuilding would rebuild the generator, a
                seeded network would then draw the identical mask on every
                pass, and a layer that silences the same units forever is not
                dropout, it is a smaller network with an odd initialisation.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked example button. Four units holding 1, 2, 3
                and 4, a drop probability of one half, and the seed the page is
                written against, which is 10. At p of one half the scale is 1
                over 1 − 0.5, which is 2, so every survivor is doubled. Under
                this seed the first draw keeps the first and third units and
                silences the second and fourth.
              </p>
              <Equation>{"1 · 2 = 2,   2 · 0 = 0,   3 · 2 = 6,   4 · 0 = 0\ntraining reads    2, 0, 6, 0\npredicting reads  1, 2, 3, 4"}</Equation>
              <p>
                That is the whole of one pass, and the bars show exactly it.
                The average takes longer. Over four hundred draws under this
                seed the four units survive 200, 192, 190 and 204 times, and a
                unit&rsquo;s mean output is its survival count over the draws,
                times its doubled value.
              </p>
              <Equation>{"u1   200 / 400 · 2 = 1.00\nu2   192 / 400 · 4 = 1.92\nu3   190 / 400 · 6 = 2.85\nu4   204 / 400 · 8 = 4.08"}</Equation>
              <p>
                Against predicting outputs of 1, 2, 3 and 4 the largest gap is
                0.15, and the first unit lands on its target exactly, two
                hundred survivals being precisely half. The chips under the
                chart show those counts and means, and the lines show the road
                there. After ten draws the means are 1.0, 2.4, 2.4 and 4.8,
                nowhere near, and after a hundred they are 1.08, 2.04, 2.58
                and 3.76. The average is not a promise about any one pass. It
                is a promise about many, which is the only kind a training
                loop needs.
              </p>
            </>
          ),
        },
        {
          title: "The Mask Is a Draw",
          content: (
            <>
              <p>
                The layer has to remember which units it silenced, because the
                backward pass needs the same mask on the way down, and there is
                a tempting shortcut. The outputs are right there, a zero in
                them looks like a dropped unit, so why not read the mask back
                off the answers. Press the button that puts a zero into the
                first unit and the box shows why not. Under the worked seed
                the first unit survives, its label says kept, and its output
                is 0 all the same, because doubling nothing is nothing. Read
                off the outputs, that unit would be recorded as dropped, its
                blame set to zero, and a unit that was present on the pass
                would learn nothing from it.
              </p>
              <p>
                Exact zeros are not rare where this layer lives. A rectified
                unit answers 0 for every negative score, and most of a scanned
                digit&rsquo;s border is 0, so a layer above either of those
                would misfile survivors on every pass, quietly, with nothing
                raised. The library therefore carries the mask on the response
                itself, already scaled and ready to multiply, and its backward
                step refuses a response that arrives without one rather than
                guess. The pooling page&rsquo;s layer took the opposite
                decision and recomputes its winners instead of storing them,
                and the difference between the two is the whole point. A
                pooling winner is a function of numbers the response already
                holds. A mask is a draw, and nothing that survives the forward
                pass can reproduce it.
              </p>
              <p>
                The draw is also why draw again moves to a fresh seed rather
                than asking the same layer twice. A seeded layer is
                reproducible over a sequence of passes rather than one at a
                time, so the four hundred draws behind the chart are one
                layer&rsquo;s generator advancing four hundred times, the way
                it would inside a training loop, and the same seed gives the
                same four hundred every time.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The claim the chart makes is that the mean of a unit&rsquo;s
                training output is its predicting output, and it is a two-term
                expectation. On any pass the unit sends 0 with probability p
                and value over 1 − p with probability 1 − p, so the mean over
                passes is the statistics primer&rsquo;s weighted sum of the two
                outcomes.
              </p>
              <Equation>{"E[out_j] = p · 0 + (1 − p) · value_j / (1 − p) = value_j"}</Equation>
              <p>
                The 1 − p the draw supplies and the 1 − p the scaling divides
                by cancel exactly, at every p short of 1, and what remains is
                the unit untouched, which is precisely what a predicting pass
                sends. The layer is unbiased by construction rather than
                approximately, and the worked example is the same cancellation
                with a count in place of a probability, 192 of 400 survivals
                in place of one half, which is why its means land near the
                targets rather than on them. The survival share of any finite
                run is close to 1 − p, not equal to it.
              </p>
              <p>
                The next layer reads a weighted sum, and expectation is linear,
                so the same line covers it. The mean of the weighted sum of
                dropped and scaled units is the weighted sum of the values,
                the number the layer would have read with nothing dropped at
                all, and that is the agreement between the two modes that lets
                a model trained under dropout predict without it. What the
                derivation does not say is that any single pass is close. The
                spread of one pass is large, on the order of the value itself
                at p of one half, and it shrinks only in the average, roughly
                as one over the square root of the number of draws, which is
                the road the lines in the chart travel.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
