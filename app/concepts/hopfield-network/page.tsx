import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { HopfieldPlayground } from "@/components/widgets/HopfieldPlayground";
import { FourUnitRecall } from "@/components/widgets/FourUnitRecall";

export const metadata: Metadata = {
  title: "Hopfield Networks · oop_ml",
  description:
    "Store a handful of patterns in a web of weights by a local rule, then hand the network a damaged copy and watch it fall back into the original by lowering an energy.",
};

export default function HopfieldNetworkPage() {
  return (
    <ConceptPage
      title="Hopfield Networks"
      tagline="Store a handful of patterns in a web of weights, then hand the net a damaged copy and watch it fall back into the original."
      prerequisites={
        <>
          The weights form a matrix and every cell reads a weighted sum of the
          others, which is the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          &rsquo;s dot product, and the argument that the walk must stop is
          the one the{" "}
          <Link
            href="/concepts/k-means"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            k-means page
          </Link>{" "}
          made, that a total which can only fall over finitely many states has
          to come to rest. Nothing here descends a gradient, so the calculus
          primer can sit this one out.
        </>
      }
      history={
        <>
          <p>
            A file on a computer is found by its address. Ask the machine for
            the bytes at a location and it hands them over, and ask it for the
            file whose contents are roughly these and it has no idea what you
            mean. Memory in animals runs the other way. A few bars of a song
            bring back the whole of it, a face glimpsed across a room brings
            back a name, and the cue that does the retrieving is a damaged
            fragment of the thing retrieved. In 1949 Donald Hebb proposed in
            The Organization of Behavior how a brain might build such a
            memory, that when two neurons fire together the connection between
            them should strengthen, and the rule was plausible precisely
            because it was local, each synapse needing to know only about the
            two cells it joins. What nobody had shown was that a network built
            on that rule could store several things and give any of them back.
          </p>
          <p>
            John Hopfield was a physicist at Caltech, and in 1982 he saw the
            problem through the physics of magnets. A magnetic material is a
            crowd of atoms each pointing up or down, every atom nudged by its
            neighbours, and the crowd settles into whichever arrangement has
            the lowest energy. He wrote down an energy for a network of
            two-state units joined by Hebb&rsquo;s weights and showed that
            recall is nothing more than the network sliding downhill in it,
            with each stored pattern sitting at the bottom of its own valley.
            A damaged copy is a point part way up a slope, and rolling down
            restores the original. Daniel Amit, Hanoch Gutfreund and Haim
            Sompolinsky worked out in 1985 how many valleys a network of n
            units can hold before they run into one another, about 0.138n, and
            in 2024 Hopfield shared the Nobel Prize in Physics with Geoffrey
            Hinton for the work this page describes.
          </p>
        </>
      }
      playground={<HopfieldPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The small grids at the top are the shapes the network was
                shown, and the first thing to know is that it did not keep
                them. Nothing in the network is a T. What it holds is one
                number for every pair of cells, each saying whether those two
                cells tended to agree or disagree across the shapes it saw.
                Two cells that were both lit in every shape are wired to pull
                each other on, two that always disagreed pull each other
                apart, and a pair that agreed as often as not is barely wired
                at all. The shapes survive only as the pattern of agreement
                between their cells.
              </p>
              <p>
                Recall is each cell asking its neighbours what it should be.
                Click a few cells of the probe to damage it, or press scramble
                to flip five at once, then press recall. On each pass every
                cell in turn adds up what the other twenty-four are telling
                it, weighted by how strongly it is wired to each, and takes
                the majority verdict. A cell that was wrongly flipped finds
                most of its connections voting against it and flips back,
                while a cell that was right finds them voting to keep it. The
                right-hand grid steps through the passes, and the staircase
                beside it is the energy, a single number that falls with every
                cell that moves and holds still when nothing does.
              </p>
              <p>
                Picture a landscape with a valley at each stored shape. A
                damaged copy is a point part way up a slope, and recall is a
                ball rolling down. That picture explains two things worth
                trying. Flip well over half the cells and the ball rolls into
                the negative image, every cell reversed, which the network
                stores without being asked because a state and its opposite
                sit at exactly the same energy. And tick the box to store
                three more shapes, then start from the T and scramble it once
                more, which flips the same five cells as before. Six valleys
                on twenty-five cells crowd one another, and the same five
                flips that fell back into the T now come to rest in a shape no
                one stored.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Storing is one shot, with no loop and no error to chase. For
                every pair of cells, multiply their values in each stored
                pattern, which gives +1 when the two agree and −1 when they
                disagree, add up over the patterns, and divide by the number
                of cells. A cell is never wired to itself.
              </p>
              <Equation>
                {
                  "wᵢⱼ = (1/n) · Σ over patterns p of pᵢ · pⱼ        wᵢᵢ = 0"
                }
              </Equation>
              <p>
                Recalling is the update rule, applied to one cell at a time in
                a random order until a whole pass changes nothing. Each cell
                reads a weighted sum of the others and takes its sign, and a
                sum of exactly zero leaves the cell as it was.
              </p>
              <Equation>{"sᵢ ← sign( Σⱼ wᵢⱼ · sⱼ )"}</Equation>
              <p>
                The cells are visited one at a time on purpose. Updating all
                of them at once from the same old state lets two cells each
                move in a direction that would have helped on its own and
                together make things worse, and the network can then flip
                back and forth forever. The library offers that rule too,
                because the failure is instructive, but this page uses the one
                that is guaranteed to stop, and the guarantee comes from the
                energy.
              </p>
              <Equation>{"E = −½ · Σᵢ Σⱼ wᵢⱼ · sᵢ · sⱼ"}</Equation>
              <p>
                Every flip the rule makes lowers it, the derivation at the
                bottom shows why, and there are only finitely many states a
                network of n cells can be in, 2ⁿ of them. A number that
                strictly falls can never revisit a state, so the walk cannot
                cycle and must run out of places to go. Where it runs out is a
                state no single cell wants to change, a fixed point of the
                rule, and for a lightly loaded network that is one of the
                stored patterns. It is the k-means argument again with the
                inertia swapped for an energy.
              </p>
              <p>
                Notice what is absent. There is no target, no loss and no
                gradient. The change to the weight between two cells is
                computed from those two cells and nothing else, which is
                Hebb&rsquo;s rule and the reason this part of the site exists.
                A weight deep inside every earlier model was corrected by a
                signal that began at the loss and travelled back through
                everything in between. Here a synapse reads the two neurons it
                joins, and that is all a piece of tissue could plausibly do.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Four cells and two patterns are small enough to do entirely by
                hand. Store A = (+1, +1, −1, −1) and B = (+1, +1, −1, +1),
                which agree everywhere except the last cell. The weight
                between cells 1 and 2 adds their product in each pattern and
                divides by four, and the other weights in the first row go the
                same way.
              </p>
              <Equation>
                {
                  "w₁₂ = ¼ · ((+1)(+1) + (+1)(+1)) = ¼ · 2 =  0.5\nw₁₃ = ¼ · ((+1)(−1) + (+1)(−1)) = ¼ · (−2) = −0.5\nw₁₄ = ¼ · ((+1)(−1) + (+1)(+1)) = ¼ · 0 =  0"
                }
              </Equation>
              <p>
                Cells 1 and 2 agreed in both patterns, so they pull each other
                on. Cells 1 and 3 disagreed in both, so they pull apart. Cells
                1 and 4 agreed once and disagreed once, and the votes cancel
                to nothing. The same arithmetic gives w₂₃ = −0.5 and puts a
                zero in every weight that touches cell 4, since the two
                patterns disagree there once each way. The table below is the
                matrix the library built, and it should match.
              </p>
              <FourUnitRecall />
              <p>
                Now damage A by flipping its first cell, giving the probe (−1,
                +1, −1, −1), and let cell 1 read its weighted sum.
              </p>
              <Equation>
                {
                  "h₁ = w₁₂·s₂ + w₁₃·s₃ + w₁₄·s₄\n   = 0.5·(+1) + (−0.5)·(−1) + 0·(−1) = 1"
                }
              </Equation>
              <p>
                The sum is positive, so cell 1 becomes +1 and the damage is
                undone. Every other cell, read before or after, finds its sum
                agreeing with the value it already holds, or exactly zero, so
                nothing else moves in whichever order the library visits them.
                The energy is a sum over pairs, and it drops from 0.5 to −1.5.
              </p>
              <Equation>
                {
                  "before   E = −(w₁₂·s₁s₂ + w₁₃·s₁s₃ + w₂₃·s₂s₃) = −(−0.5 − 0.5 + 0.5) =  0.5\nafter    E = −( 0.5 + 0.5 + 0.5) = −1.5"
                }
              </Equation>
              <p>
                The readout above reports exactly that, one cell moved on the
                first pass with the energy falling from 0.5 to −1.5, then a
                second pass that moved nothing, which is the network saying it
                has settled, and it settled into A. One more thing is visible
                in the matrix and worth carrying into the next section. That
                row of zeros means the network holds no opinion about cell 4
                at all. The two patterns agree everywhere but there, so their
                votes about that cell cancel exactly, and it is the first sign
                of a network asked to hold more than it can, two patterns that
                are nearly the same over only four cells, a load of 0.5.
              </p>
            </>
          ),
        },
        {
          title: "How Much a Net Can Hold",
          content: (
            <>
              <p>
                The number that predicts failure is the load, patterns stored
                per cell, which the readout under the widget reports. Amit,
                Gutfreund and Sompolinsky&rsquo;s figure is that a large
                network recalls reliably up to about 0.138 patterns per cell,
                and past it the valleys around the stored patterns give way,
                so a probe comes to rest in states that nobody stored.
                Three shapes over twenty-five cells is a load of 0.12, just
                under the figure, and six is 0.24, well past it. At sizes you
                can actually draw the collapse is gradual rather than sharp,
                but the direction is not in doubt.
              </p>
              <Equation>{"capacity ≈ 0.138 · n patterns"}</Equation>
              <p>
                What overloading looks like is not an error. Scramble the T
                once with three shapes stored and it comes back in two passes,
                the energy falling from −3.36 to the T&rsquo;s own resting
                −11.2. Tick store three more, so the load is 0.24, and the very
                same scramble comes to rest at −14.24, a state with the top
                row, the bottom row and the centre cell lit that nobody
                stored. It is a perfectly good fixed point, no cell wants to
                move and the network is exactly as content there as it is
                resting in the Z, one of the shapes it was actually given. The
                six stored shapes are still resting states too.
                What the extra patterns eroded is the valleys around them,
                because each cell&rsquo;s weighted sum now carries the votes
                of six patterns where it wanted the votes of one, and the
                crosstalk between them can outvote the truth.
              </p>
              <p>
                Two things make it worse. Patterns that resemble one another
                produce more crosstalk than patterns that do not, which is why
                the widget&rsquo;s first three shapes were chosen for how
                little they overlap. And beyond the negative
                images, which are stored for free, mixtures of stored patterns
                become resting states of their own once three or more are in,
                the sign of their sum cell by cell, shallower valleys than the
                real ones while the load is light and every bit as deep once
                it is not, as the rest at the Z&rsquo;s own energy above
                already showed. The four-cell example was
                the extreme case of both, two patterns alike in three cells of
                four at a load of 0.5, and the network could not even hold an
                opinion about the one cell that told them apart.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Two claims carried the mechanism, that a flip only ever lowers
                the energy and that the storage rule makes each stored pattern
                a resting state. Take the energy first and pick one cell i.
                Because the matrix is symmetric and the diagonal is zero,
                every term of the energy that mentions sᵢ collects into a
                single product with the cell&rsquo;s own weighted sum, and
                that sum does not mention sᵢ at all.
              </p>
              <Equation>
                {
                  "hᵢ = Σⱼ wᵢⱼ · sⱼ\nE  = −sᵢ · hᵢ + (terms that do not involve sᵢ)"
                }
              </Equation>
              <p>
                The rule flips cell i only when its value disagrees with the
                sign of hᵢ, and then it sets sᵢ to that sign. The change in
                energy is the change in sᵢ times −hᵢ, and since the new value
                has the sign of hᵢ where the old one had the opposite, the
                change is a drop of twice the sum&rsquo;s size.
              </p>
              <Equation>
                {"ΔE = −(sᵢ new − sᵢ old) · hᵢ = −2 · |hᵢ|"}
              </Equation>
              <p>
                Every flip is a strict fall, so a state cannot be revisited,
                and there are only 2ⁿ states, so the walk has to stop, at a
                state where no cell wants to move. That is the entire proof,
                and it leans on the symmetry and the zero diagonal, which is
                why the library checks the first and the storage rule enforces
                the second.
              </p>
              <p>
                Now the storage rule. It has to make each stored pattern a
                state in which no cell wants to move, so put a stored pattern
                p into cell i&rsquo;s weighted sum and split the sum into the
                part that came from p itself and the part from every other
                stored pattern q.
              </p>
              <Equation>
                {
                  "hᵢ = (1/n) · Σⱼ≠ᵢ Σ over patterns q of qᵢ · qⱼ · pⱼ\n   = pᵢ · (n − 1)/n  +  (1/n) · Σ over q ≠ p of qᵢ · (Σⱼ≠ᵢ qⱼ · pⱼ)"
                }
              </Equation>
              <p>
                The first term is p&rsquo;s own contribution, where every pⱼ ·
                pⱼ is one, and it has the sign of pᵢ with a size of nearly
                one. With a single pattern stored that is the whole sum, so
                every cell of p agrees with its own weighted sum and p is a
                resting state by construction. The second term is the
                crosstalk, one overlap between p and each other stored
                pattern, small when the patterns are nearly orthogonal and
                growing with every pattern added, which is the capacity limit
                written as a formula. In the worked example, cell 1 of A has
                pᵢ · (n − 1)/n = ¾ and a crosstalk from B of ¼ · (+1) ·
                ((+1)(+1) + (−1)(−1) + (+1)(−1)) = ¼, and the two add to the
                1 read off the matrix above.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
