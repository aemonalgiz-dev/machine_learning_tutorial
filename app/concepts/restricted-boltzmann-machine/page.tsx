import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { BoltzmannPlayground } from "@/components/widgets/BoltzmannPlayground";

export const metadata: Metadata = {
  title: "Restricted Boltzmann Machines · oop_ml",
  description:
    "Learn what a handful of patterns have in common by a local rule, so a damaged copy is rebuilt from that rather than from a stored original, and the hidden layer is the first representation on this site that a model invented for itself.",
};

export default function RestrictedBoltzmannMachinePage() {
  return (
    <ConceptPage
      title="Restricted Boltzmann Machines"
      tagline="Learn what the patterns have in common, and rebuild a damaged copy from that rather than from a stored original."
      prerequisites={
        <>
          The energy is the{" "}
          <Link
            href="/concepts/hopfield-network"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            Hopfield page
          </Link>
          &rsquo;s with a second layer added, every unit reads a weighted sum
          from the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          , and each one turns on with the probability the{" "}
          <Link
            href="/concepts/logistic-regression"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            logistic regression page
          </Link>
          &rsquo;s sigmoid gives that sum. What the machine learns is a
          distribution in the{" "}
          <Link
            href="/primers/statistics"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            statistics primer
          </Link>
          &rsquo;s sense, so this is the first page where the answer is a
          probability rather than a state.
        </>
      }
      history={
        <>
          <p>
            The network on the Hopfield page gives back exactly what it was
            shown, and only that. Hand it a fragment of the T and it returns
            the T, cell for cell, the one it stored, and it has no opinion
            about a T it never saw. Real data does not come as a fixed set.
            Every handwritten seven differs from every other, and a memory
            that could only hand back the sevens it had already met would be
            worthless for reading a new one. In 1983 Geoffrey Hinton and
            Terrence Sejnowski asked for something different, a network whose
            settled states were not a list of stored patterns but a
            distribution, so that it could give back things it had never been
            shown as long as they resembled what it had. They kept
            Hopfield&rsquo;s energy, made each unit switch on with a
            probability set by its energy gap, the rule Ludwig Boltzmann had
            written for the states of a gas in 1868 and the reason for the
            name, and added hidden units to stand for whatever the data does
            not state outright. With David Ackley they published a learning
            rule for it in 1985, and it was local in exactly Hebb&rsquo;s
            sense, each weight reading only its own two ends, once while the
            network looked at data and once while it ran free. The trouble was
            that the second reading needed the network to settle all the way
            to equilibrium, and that took so long that the Boltzmann machine
            spent twenty years as an idea more admired than used.
          </p>
          <p>
            Paul Smolensky cut the network down in 1986, in the Parallel
            Distributed Processing volumes, to two layers with no connections
            inside either, a form he called a harmonium and everyone else now
            calls restricted. The restriction is what makes the mathematics on
            this page short, since with nothing joining a hidden unit to its
            neighbours the whole hidden layer can be updated in one step, but
            learning still waited on equilibrium. Hinton removed that in 2002
            with contrastive divergence, which starts the network at the data,
            lets it run a single step, and uses wherever it got to in place of
            the equilibrium nobody could afford. It is an approximation and
            Hinton said so, and it made the machine trainable in minutes. In
            2006 Hinton, Simon Osindero and Yee-Whye Teh stacked these
            machines, each learning from the hidden layer of the one below, to
            train deep networks a layer at a time when training them all at
            once had failed, and Hinton and Ruslan Salakhutdinov used the same
            stack to compress data far better than principal components could.
            Those two papers ended the long quiet in neural networks, and the
            Boltzmann machine is the work named in Hinton&rsquo;s half of the
            2024 Nobel Prize he shared with Hopfield.
          </p>
        </>
      }
      playground={<BoltzmannPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Start with what is different from the page before. The
                Hopfield network held one weight for every pair of cells, so
                the shapes survived as a table of which cells agreed. Here no
                cell is wired to any other cell. Every cell is wired instead to
                a short row of hidden units, the bars under the shapes, and the
                hidden units are wired to nothing but the cells. Click the T
                and two of the three bars stand up while the third stays down.
                Click the L and a different pair stands. Each shape has become
                a short code over the hidden units, and the code was not given
                to the machine. It invented it, because three hidden units were
                all it had to tell three shapes apart with.
              </p>
              <p>
                Now damage the T, by clicking cells or by pressing damage,
                which flips the same five cells the Hopfield page&rsquo;s first
                scramble flips, and press reconstruct. The probe goes up
                through the wires to the hidden units, which read it and settle
                on a code, and the code comes back down through the same wires
                to say what the cells should be. The shaded grid is that
                answer, each cell darkened by the probability the machine gives
                it. The five damaged cells come back pale or dark according to
                the T rather than according to the probe, because the code the
                probe produced was the T&rsquo;s code, and the code is all the
                machine consults on the way back down. That is the whole
                difference from the Hopfield page in one picture. Nothing
                rolled downhill into a stored copy. The probe was described in
                three numbers and the description was redrawn.
              </p>
              <p>
                The chart is the machine&rsquo;s own measure of how plausible a
                row is, its free energy, which is lower for rows it finds more
                likely. The three stored shapes sit deep and the probe sits
                well above them, because the machine has learned that a T has
                a full top row and a stem, and a T with holes in it fits that
                worse than a T without. Slide the epochs back toward one and
                watch everything rise to the same shallow level as the hollow
                bars, which are the machine before it learned anything, when
                every row was very nearly as plausible as every other. Slide the
                hidden units up to eight and the codes grow longer than they
                need to be, and down to one and the machine can no longer keep
                three shapes apart, so the reconstruction of any of them turns
                into a grey average of all three.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The machine scores every joint state of the cells v and the
                hidden units h with an energy, the Hopfield energy with a
                second layer and a bias for every unit, and the probability of
                a state falls off as its energy rises.
              </p>
              <Equation>
                {
                  "E(v, h) = −Σᵢ aᵢ·vᵢ − Σⱼ bⱼ·hⱼ − Σᵢ Σⱼ vᵢ·wᵢⱼ·hⱼ\nP(v, h) ∝ exp(−E(v, h))"
                }
              </Equation>
              <p>
                Because the only weights run between the two layers, fixing
                the cells leaves every hidden unit with nothing to consult but
                its own weighted sum, so each turns on independently with the
                probability the sigmoid of that sum gives, and the same holds
                the other way round. A whole layer updates in one line of
                arithmetic, and reconstruction is those two lines run once
                each, the cells to the hidden probabilities and the hidden
                probabilities back to the cells, which is what the shaded grid
                shows.
              </p>
              <Equation>
                {
                  "P(hⱼ = 1 | v) = σ( bⱼ + Σᵢ vᵢ·wᵢⱼ )\nP(vᵢ = 1 | h) = σ( aᵢ + Σⱼ wᵢⱼ·hⱼ )"
                }
              </Equation>
              <p>
                Learning is a local rule with the same shape as Hebb&rsquo;s.
                For each weight, measure how often its two ends are on together
                while the cells are clamped to the stored shapes, then measure
                the same thing after the machine has been allowed one step of
                its own, hidden units drawn from their probabilities and the
                cells redrawn from those, and move the weight by the
                difference. Each bias moves by the same difference in the two
                averages of its own unit.
              </p>
              <Equation>
                {"Δwᵢⱼ = rate · ( ⟨vᵢ·hⱼ⟩ data − ⟨vᵢ·hⱼ⟩ one step )"}
              </Equation>
              <p>
                The first term pushes the weight to make what the data shows
                more probable, the second pushes it to make what the machine
                currently dreams less so, and where the two agree the weight
                stops moving. The library runs one such update per epoch over
                all the shapes at once, at a constant rate of 0.1. The
                reconstruction error in the readout is the mean squared gap
                between the shapes and what comes back, reported because it is
                the one cheap thing to watch and not because anything is
                minimising it.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                One figure on this page can be checked by hand, and it is the
                free energy before any learning. The free energy of a row is
                its energy with the hidden layer summed out, the derivation
                below does the sum, and it comes to
              </p>
              <Equation>
                {
                  "F(v) = −Σᵢ aᵢ·vᵢ − Σⱼ ln( 1 + exp( bⱼ + Σᵢ vᵢ·wᵢⱼ ) )"
                }
              </Equation>
              <p>
                With every weight zero the sum inside each logarithm vanishes
                and every term is ln 2, so the free energy is minus the dot of
                the row with the visible bias, minus the number of hidden units
                times ln 2. With the biases zero as well only the last term is
                left, and for three hidden units that is
              </p>
              <Equation>{"F = −3 · ln 2 = −3 · 0.6931 = −2.0794"}</Equation>
              <p>
                The library does not start from zero weights, because identical
                weights would leave every hidden unit computing the same
                function forever. It starts from normal noise of spread 0.01
                with zero biases, and it offers no way to read a model before
                its first epoch, so the API observes the start by fitting once
                at a learning rate of zero for a single epoch, which leaves the
                seeded weights exactly where they were drawn. The hollow bars
                in the chart are that fit, and the readout beneath the chart
                gives the figure for whichever shape is selected, −2.08 for
                the T, −2.10 for the L and −2.10 for the cross, each within
                the noise of the hand figure. Slide the epochs to one to see
                nearly the same picture
                drawn solid, since one update at a rate of 0.1 barely moves
                weights that small.
              </p>
              <p>
                After five hundred epochs everything has moved. Each shape has
                a code over the three hidden units, the T on units 1 and 2, the
                L on 2 and 3 and the cross on 1 and 3, three different pairs
                out of three, and each shape comes back from its own code with
                every cell rounding to what it was. The reconstruction error in
                the readout is 0.0057 over the three shapes, and no single
                shape is above 0.01. The free energies have fallen to −24.50,
                −24.78 and −23.88, more than twenty below where they started.
                Press damage and then reconstruct, and the probe reads as the
                T&rsquo;s code and rebuilds as the T, the stem cell the damage
                switched off coming back near 0.9 and the four cells it
                switched on coming back below a tenth, and it sits at a free
                energy of −11.82, above every shape the machine was shown.
              </p>
            </>
          ),
        },
        {
          title: "A Memory That Generalises",
          content: (
            <>
              <p>
                Set the two pages side by side. The Hopfield network stores a
                fixed list and recall is a fall into the nearest entry, so its
                answer is always one of the stored shapes, cell for cell, or a
                spurious blend it never meant to store. This machine stores
                nothing of the kind. It has learned a distribution over all
                2²⁵ possible grids, in which the three shapes and the grids
                near them are likely and everything else is not, and a probe is
                answered by asking what the likely grids near it look like.
                Damage the T lightly and the answer is the T, because the T is
                the likely grid nearby. Damage it heavily, or draw something
                that is nothing like any shape, and the answer is still a
                proper grid of probabilities, a blend weighted by how much of
                each shape the probe suggests, where the Hopfield network would
                have fallen into whichever valley happened to be nearest and
                reported it with complete confidence.
              </p>
              <p>
                The hidden units are the other half of what was gained. Every
                model before this page worked in the columns it was handed,
                or, on the PCA page, in a rotation of them. Here
                the machine invented three columns of its own, and each stored
                shape is a point in that three-dimensional space, which makes
                it the first learned representation on this site. Ask for one
                hidden unit and the space is too small to hold three shapes
                apart, ask for eight and it is larger than it needs to be, and
                the library&rsquo;s transform hands the codes out as features a
                later model can be fitted on, which is how these machines were
                stacked in 2006.
              </p>
              <p>
                One thing is missing from the readout, and it is missing on
                purpose. Every page that learned by descent reported a loss
                its fit was driving down. Contrastive divergence follows the
                gradient of the log likelihood only approximately, since the
                exact gradient needs an average over the machine&rsquo;s own
                distribution that nobody can compute, and the one-step shortcut
                stands in for it with a bias that more data does not shrink.
                The reconstruction error is shown because it is cheap and
                because a fit whose error does not fall has learned nothing,
                but nothing on this page is minimising it, and the library
                declines to call it a loss. The free energies are honest and
                comparable between rows, but their zero is unknown because the
                total over all grids is never computed, so a single one on its
                own says nothing and only the differences mean anything.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Three claims carried the page. Take the energy and fix the
                cells v. Everything in it that mentions the hidden units is a
                sum of one term per unit, each involving only that unit and its
                own weighted sum, call it zⱼ.
              </p>
              <Equation>
                {
                  "zⱼ = bⱼ + Σᵢ vᵢ·wᵢⱼ\nE(v, h) = −Σᵢ aᵢ·vᵢ − Σⱼ hⱼ·zⱼ"
                }
              </Equation>
              <p>
                So the probability of a hidden configuration given the cells
                factorises into one factor per unit, and each unit is a
                two-state choice between exp(0) and exp(zⱼ), which is a
                sigmoid.
              </p>
              <Equation>
                {
                  "P(h | v) ∝ Πⱼ exp( hⱼ·zⱼ )\nP(hⱼ = 1 | v) = exp(zⱼ) / ( 1 + exp(zⱼ) ) = σ(zⱼ)"
                }
              </Equation>
              <p>
                The same factorisation runs the other way with the roles
                swapped, which is the second conditional in the mechanism. A
                weight within a layer would put a term like hⱼ·hₖ into the
                energy and the product would no longer split, which is what
                the restriction buys and why the derivation is this short.
              </p>
              <p>
                The free energy is what remains after summing the hidden layer
                out. Each unit&rsquo;s two states add to 1 + exp(zⱼ), the sum
                over all 2ⁿ hidden configurations is the product of those, and
                the negative logarithm of a product is the sum of the
                logarithms.
              </p>
              <Equation>
                {
                  "Σₕ exp(−E(v, h)) = exp( Σᵢ aᵢ·vᵢ ) · Πⱼ ( 1 + exp(zⱼ) )\nF(v) = −ln Σₕ exp(−E(v, h)) = −Σᵢ aᵢ·vᵢ − Σⱼ ln( 1 + exp(zⱼ) )"
                }
              </Equation>
              <p>
                Set every weight and bias to zero and each logarithm is ln 2,
                which is the worked example&rsquo;s figure. The probability of
                a row is exp(−F) divided by the same sum taken over every
                possible row, and it is that last sum, over 2²⁵ grids here and
                over every possible image in general, that nobody computes,
                which is why the page compares free energies and never quotes
                a probability.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
