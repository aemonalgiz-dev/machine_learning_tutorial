import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import {
  DerivationTable,
  KeepInMind,
  NumberTable,
  SubSection,
  WorkedExample,
} from "@/components/concept/Treatments";
import { CapacityCurve } from "@/components/widgets/CapacityCurve";
import { EnergyPath } from "@/components/widgets/EnergyPath";
import { FourCellVisits } from "@/components/widgets/FourCellVisits";
import { HopfieldPlayground } from "@/components/widgets/HopfieldPlayground";
import { NegationCheck } from "@/components/widgets/NegationCheck";
import { OuterProductBuilder } from "@/components/widgets/OuterProductBuilder";
import { RecallStepper } from "@/components/widgets/RecallStepper";
import { SelfConnectionDial } from "@/components/widgets/SelfConnectionDial";
import { UnstoredRests } from "@/components/widgets/UnstoredRests";
import { UpdateRuleRace } from "@/components/widgets/UpdateRuleRace";

export const metadata: Metadata = {
  title: "Hopfield Networks · oop_ml",
  description:
    "Store a handful of patterns in a web of weights by a local rule, then hand the network a damaged copy and watch it fall back into the original by lowering an energy.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function HopfieldNetworkPage() {
  return (
    <ConceptPage
      title="Hopfield Networks"
      tagline="Store a handful of patterns in a web of weights, then hand the network a damaged copy and watch it fall back into the original."
      prerequisites={
        <>
          The weights form a matrix and every cell reads a weighted sum of the others, which is the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>
          &rsquo;s dot product, and the argument that the walk must stop is the one the{" "}
          <Link href="/concepts/k-means" className={link}>
            k-means page
          </Link>{" "}
          made, that a total which can only fall over finitely many states has to come to rest. Nothing here descends a
          gradient, so the calculus primer can sit this one out.
        </>
      }
      history={
        <>
          <p>
            A file on a computer is found by its address. Ask the machine for the bytes at a location and it hands them
            over, and ask it for the file whose contents are roughly these and it has no way to answer. Memory in animals
            runs the other way, since a few bars of a song bring back the whole of it and the cue that does the retrieving
            is a damaged fragment of the thing retrieved. Donald Hebb, at McGill, proposed in The Organization of Behavior
            in 1949 how a brain might build such a memory, that when two neurons fire together the connection between them
            should strengthen, and the proposal was plausible precisely because it was local, each synapse needing to know
            only about the two cells it joins. What nobody had shown was that a network built on that rule could store
            several things and give any of them back on demand, though the ingredients were in print well before the
            answer, since Shun-ichi Amari had described a network of threshold units storing patterns by just such a
            correlation rule in 1972.
          </p>
          <p>
            John Hopfield was a physicist, at Caltech and at Bell Laboratories, and in &ldquo;Neural networks and physical
            systems with emergent collective computational abilities&rdquo;, published in 1982, he saw the problem through
            the physics of magnets. A magnetic material is a crowd of atoms each pointing up or down, every atom nudged by
            its neighbours, and the crowd settles into whichever arrangement has the lowest energy. He wrote down an energy
            for a network of two-state units joined by Hebb&rsquo;s weights, updated one unit at a time, and showed that
            every update lowers it, so recall is the network sliding downhill with each stored pattern at the bottom of its
            own valley, and a damaged copy is a point part way up a slope. William Little had used the same kind of network
            in 1974 with every unit updated at once, which is the rule that can loop forever, and the choice between the two
            is one of this page&rsquo;s parts. Daniel Amit, Hanoch Gutfreund and Haim Sompolinsky, at the Hebrew University
            of Jerusalem, worked out in 1985 how many valleys a network of n units can hold before they run into one another,
            about 0.138n, and in 2024 Hopfield shared the Nobel Prize in Physics with Geoffrey Hinton for the work this
            page describes.
          </p>
          <p>
            The page asks seven questions in order. What does it mean to remember by settling rather than by looking up?
            How are patterns written into weights in one shot, and why is a cell never wired to itself? How does a damaged
            copy repair itself one cell at a time? Why must the repair stop? What else does the network remember that
            nobody stored? How many patterns can it hold, measured rather than quoted? And why one cell at a time rather
            than all at once?
          </p>
        </>
      }
      playground={<HopfieldPlayground />}
      sections={[
        {
          title: "Part 1. Memory as Settling",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Addressed by content, answered by settling">
                <p>
                  The small grids at the top of the playground are the shapes the network was shown, a T, an L and a
                  cross on twenty-five cells, and the first thing to know is that it did not keep them. Nothing in the
                  network is a T. What it holds is one number for every pair of cells, saying whether those two cells
                  tended to agree or disagree across the shapes it saw, and the shapes survive only as that pattern of
                  agreement. Recall starts from whatever state the network is handed and lets each cell ask the others
                  what it should be, until no cell wants to change, and the place it stops is the answer.
                </p>
                <p>
                  Press scramble in the playground, which flips five cells of the T, then recall. The five come back in
                  one pass, a second pass moves nothing, and the number beside the grid falls from −3.36 to −11.2 and
                  holds there. That number is an energy, and the whole page is about why it only ever falls and what
                  it falls into. Picture a landscape with a valley at each stored shape. A damaged copy is a point part
                  way up a slope, and recall is a ball rolling down.
                </p>
                <KeepInMind>
                  A memory here is a resting state, a state no single cell wants to leave, and recall is the walk to the
                  nearest one. The network answers a damaged copy of a thing with the thing, which is what makes it an
                  associative memory rather than a lookup.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A state is one sign per cell">
                <p>
                  Every cell is either lit or dark, and the arithmetic is cleanest if lit is +1 and dark is −1 rather
                  than 1 and 0. The reason is what happens to a pair of cells that are dark together. With 0 and 1 their
                  product is 0, so two cells that are dark in every shape would end up not wired at all, though they agree
                  as perfectly as two cells that are lit in every shape. With +1 and −1 both kinds of agreement give a
                  product of +1 and both kinds of disagreement give −1, and agreement is the only thing the rule is
                  going to count.
                </p>
                <Equation>{"sᵢ ∈ {−1, +1}        one value per cell, twenty-five of them for a shape on the grid"}</Equation>
                <p>
                  Twenty-five cells give 2²⁵ states, which is 33,554,432, and every one of them is somewhere in the
                  landscape. The T lights nine of the twenty-five, so it is a particular one of those states, and so is
                  the T with five cells flipped. A value that is not +1 or −1, a 0 or a 0.5, is refused rather than
                  rounded, because it describes a state the network cannot be in.
                </p>
                <KeepInMind>
                  Bipolar values are a choice of units, and the choice is what makes &ldquo;these two cells agree&rdquo;
                  come out as the same number whether they agree by both being lit or both being dark.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Storing Patterns in One Shot",
          content: (
            <>
              <SubSection title="3. One number per pair of cells">
                <p>
                  Storing is one shot, with no loop and no error to chase. For every pair of cells, multiply their values
                  in each stored shape, which gives +1 when the two agree and −1 when they disagree, add up over the
                  shapes, and divide by the number of cells. A cell is never wired to itself, and the next steps say why
                  that clause is the one to get right.
                </p>
                <Equation>{"wᵢⱼ = (1/n) · Σ over patterns p of pᵢ · pⱼ        wᵢᵢ = 0"}</Equation>
                <p>
                  The four maps below are the three shapes&rsquo; contributions and the matrix they add up to, with every
                  pair of the twenty-five cells as one small square. Cells 1 and 2 are the first two of the top row; they
                  agree in the T, where both are lit, and disagree in the L and in the cross, so their weight is one
                  agreement less two disagreements over twenty-five cells, which is −0.04. Cells 1 and 5, the two top
                  corners, agree in the T and in the cross and disagree in the L, so their weight is +0.04, and cells 1
                  and 21, the two left corners, come to +0.04 the same way.
                </p>
                <OuterProductBuilder example="threeShapes" />
                <KeepInMind>
                  The weight between two cells is a count, agreements less disagreements across the stored shapes, scaled
                  by the cell count. It is the only thing the network learns and it is learned by reading the two cells
                  it joins and nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. The four cells worked by hand">
                <p>
                  Four cells and two patterns are small enough to do entirely on paper, and the page carries them
                  alongside the T. Store A = (+1, +1, −1, −1) and B = (+1, +1, −1, +1), which agree everywhere except
                  the last cell. The weight between cells 1 and 2 adds their product in each pattern and divides by
                  four, and the rest of the first row goes the same way.
                </p>
                <Equation>
                  {
                    "w₁₂ = ¼ · ((+1)(+1) + (+1)(+1)) = ¼ · 2 =  0.5\nw₁₃ = ¼ · ((+1)(−1) + (+1)(−1)) = ¼ · (−2) = −0.5\nw₁₄ = ¼ · ((+1)(−1) + (+1)(+1)) = ¼ · 0 =  0"
                  }
                </Equation>
                <p>
                  Cells 1 and 2 agreed in both patterns, so they pull each other on. Cells 1 and 3 disagreed in both,
                  so they pull apart. Cells 1 and 4 agreed once and disagreed once, and the votes cancel to nothing. The
                  same arithmetic gives w₂₃ = −0.5 and puts a zero in every weight that touches cell 4, since the two
                  patterns disagree there once each way. The tables below are the two contributions, their sum, and the
                  matrix once the diagonal is cleared, and the row worked above should match the top row of the last
                  table.
                </p>
                <OuterProductBuilder example="fourCells" />
                <WorkedExample title="What the row of zeros says">
                  <p>
                    The network holds no opinion about cell 4 at all. The two patterns agree everywhere but there, so
                    their votes about that cell cancel exactly, and a cell wired to nothing can never be repaired. It is
                    the first sign of a network asked to hold more than it can, two patterns that are nearly the same over
                    only four cells, at a load of 0.5 patterns per cell.
                  </p>
                </WorkedExample>
              </SubSection>

              <SubSection title="5. Dividing by the cell count, and what the sum leaves on the diagonal">
                <p>
                  The division by the number of cells is a choice of units. The sum a cell reads from its connections
                  becomes an average over the other cells rather than a total, so it stays the same size as the network
                  grows, and since the update rule only ever looks at the sign of that sum, the division changes no
                  answer anywhere. It scales every energy by the same factor too, so comparisons between states are
                  untouched.
                </p>
                <p>
                  Before the diagonal is cleared it holds one particular number. A cell always agrees with itself, so its
                  product with itself is +1 in every pattern, and the sum over the patterns divided by the cell count is
                  the number of patterns per cell, which is the load. On the three shapes the diagonal of the summed
                  matrix reads 0.12 in every position, and on the four-cell pair it reads 0.5, which the shaded diagonal
                  of the third table above shows.
                </p>
                <Equation>{"before clearing   wᵢᵢ = (1/n) · Σ over patterns of pᵢ · pᵢ = (number of patterns) / n = the load"}</Equation>
                <KeepInMind>
                  The load is patterns stored per cell, 0.12 for three shapes on twenty-five cells and 0.24 for six, and
                  it is the number that predicts failure in Part 6.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The diagonal is cleared, and what happens when it is not">
                <p>
                  Leave the diagonal at its summed value and the network stops recalling anything, and the reason is
                  worth stating carefully because the obvious reason is wrong. A self weight does not change the energy
                  landscape at all. Every cell&rsquo;s value squares to one, so a self weight adds the same constant to
                  every state&rsquo;s energy and reorders nothing. What it changes is the update. The sum a cell reads
                  gains a term that is the self weight times the cell&rsquo;s own value, and that term always agrees
                  with the sign the cell already has, so it is a vote for staying put that grows with the self weight.
                </p>
                <Equation>{"with a self weight   hᵢ = wᵢᵢ · sᵢ + Σⱼ≠ᵢ wᵢⱼ · sⱼ        and wᵢᵢ · sᵢ has the sign of sᵢ"}</Equation>
                <p>
                  Turn the dial below on the damaged A. With the diagonal cleared, cell 1 reads +1 and wants to move. At
                  a self weight of 0.5 it reads +0.5 and still moves; at 1.0 it reads exactly 0 and is left as it is,
                  wrong; at 2.0 it reads −1 and the self weight has outvoted every connection, so the damage is now the
                  cell&rsquo;s settled opinion. Its energy went from 0.5 to −1.5 at a self weight of 1.0, which is the
                  −2 the constant predicts for four cells, and every other state shifted by the same −2. On the
                  scrambled T the largest row of weights away from the diagonal sums to 1.44 in absolute value, and a
                  self weight of 0.75 is already enough to leave none of the five damaged cells able to move.
                </p>
                <SelfConnectionDial />
                <KeepInMind>
                  Nothing raises and nothing looks wrong when the diagonal is left in. The network fits, answers, and
                  hands back whatever it was given, which is why the storage rule clears the diagonal itself rather than
                  trusting a caller to.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Nothing was propagated">
                <p>
                  Notice what is absent from the rule. There is no target, no loss and no gradient. The change to the
                  weight between two cells is computed from those two cells and nothing else, which is Hebb&rsquo;s
                  proposal and the reason this part of the site exists. A weight deep inside every earlier model on the
                  site was corrected by a signal that began at the loss and travelled back through everything in
                  between, and the two units the weight joins had very little to do with the size of its correction.
                  Here a synapse reads the two neurons it joins, and that is all a piece of tissue could plausibly do.
                </p>
                <p>
                  The{" "}
                  <Link href="/concepts/hebbian-pca" className={link}>
                    Hebbian principal components page
                  </Link>{" "}
                  used the same locality to find a direction; this page uses it to store a memory, and neither of them
                  ever sees a target.
                </p>
                <KeepInMind>
                  Storage is local and one shot. There is nothing to converge, and a fit that reports how many passes it
                  took would be describing an event that did not happen.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Recall, One Cell at a Time",
          content: (
            <>
              <SubSection title="8. What a cell reads, and the sign rule">
                <p>
                  Recall is each cell asking its neighbours what it should be. A cell adds up what every other cell is
                  telling it, each vote weighted by how strongly the two are wired, and takes the sign of the total. A
                  cell wrongly flipped finds most of its connections voting against it and flips back, while a cell that
                  was right finds them voting to keep it. A total of exactly zero leaves the cell as it was, so a tie is
                  never a coin toss.
                </p>
                <Equation>{"hᵢ = Σⱼ wᵢⱼ · sⱼ        sᵢ ← sign(hᵢ), and sᵢ stays if hᵢ = 0"}</Equation>
                <p>
                  Damage A by flipping its first cell, giving the probe (−1, +1, −1, −1), and let cell 1 read its sum.
                </p>
                <Equation>{"h₁ = w₁₂·s₂ + w₁₃·s₃ + w₁₄·s₄\n   = 0.5·(+1) + (−0.5)·(−1) + 0·(−1) = 1"}</Equation>
                <p>
                  The sum is positive, so cell 1 becomes +1 and the damage is undone. The literature calls the sum the
                  local field, and because the diagonal is zero a cell&rsquo;s own value contributes nothing to its own
                  sum, which is the fact Part 4 leans on.
                </p>
                <KeepInMind>
                  A cell moves only when its own value disagrees with the sign of what its connections tell it. The rule
                  reads the sign and nothing else, which is why scaling every weight alike changes no answer.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The four-cell probe repaired on the first visit">
                <p>
                  The cells are visited one at a time in a seeded order, and a whole pass is one visit to each. The table
                  below is the four-cell recall opened into its eight visits. The first visit happens to be cell 1, which
                  reads +1, moves, and drops the energy from 0.5 to −1.5, and every later visit finds a cell content
                  where it is. Cell 4 reads exactly 0 both times it is visited, since nothing is wired to it, and is left
                  alone. The second pass moves nothing, which is the network saying it has settled, and it settled into
                  A.
                </p>
                <FourCellVisits />
                <KeepInMind>
                  Settling is detected by a pass that changes nothing, so even a probe that is already a memory costs one
                  pass to discover that. The walk reports which of its two exits it took, settled or the pass limit, and
                  the two mean opposite things about the state that came back.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The scrambled T, five flips in fifty visits">
                <p>
                  Now the T with the playground&rsquo;s five cells flipped, under the three shapes. At the probe, the five
                  damaged cells are the ones that disagree with their sums. Cell 8, which is dark and should be lit, reads
                  +0.48; cell 25 reads −0.48; and cells 6, 9 and 24 each read −0.72. Among the twenty undamaged cells the
                  smallest sum in absolute value is 0.24, so none of them is near moving. Step through the visits below
                  and watch the five come back at visits 11, 12, 14, 19 and 20 of the fifty, in the order the seeded walk
                  happened to reach them.
                </p>
                <RecallStepper panels={["grid"]} />
                <KeepInMind>
                  The visiting order is drawn afresh each pass from a seeded generator, so a seeded network answers the
                  same probe the same way every time while still not walking the cells in the order they were numbered.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Each cell reads the state the previous one left">
                <p>
                  Look at what cell 8 read. At the probe its sum was +0.48, and when it was visited, at visit 12, it read
                  +0.56, because cell 9 had moved at visit 11 in between and cell 9 is one of the cells wired to it. Cell
                  6 read −0.72 at the probe and −0.96 by visit 19, after three of its neighbours had been repaired. On the
                  second pass cell 8 reads +0.96 and cell 6 reads −1.04, since by then every damaged cell has moved and
                  every vote points the same way. That is the meaning of one cell at a time. Each visit sees the state
                  the previous visit left behind, and the repairs reinforce one another as they land.
                </p>
                <KeepInMind>
                  Under the one-at-a-time rule no two cells ever act on the same stale picture of each other, which is
                  the property the settling argument needs and the property the all-at-once rule in Part 7 gives up.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Energy, and Why Recall Must Stop",
          content: (
            <>
              <SubSection title="12. One number for the whole state">
                <p>
                  The staircase in the playground is a single number computed from the state and the weights. For every
                  pair of cells, multiply the weight joining them by the two values, add up over all pairs, and take
                  minus a half of the total. Low energy means many pairs agree with the sign of the weight between them,
                  which is what &ldquo;this state resembles the stored shapes&rdquo; amounts to.
                </p>
                <Equation>{"E = −½ · Σᵢ Σⱼ wᵢⱼ · sᵢ · sⱼ"}</Equation>
                <p>
                  Under the three shapes the T and the L each have an energy of −11.2 and the cross −11.04, and the
                  scrambled T starts at −3.36. On the four cells the sum runs over three pairs with a non-zero weight, and the damaged
                  probe and the repaired A come out at 0.5 and −1.5.
                </p>
                <Equation>
                  {
                    "before   E = −(w₁₂·s₁s₂ + w₁₃·s₁s₃ + w₂₃·s₂s₃) = −(−0.5 − 0.5 + 0.5) =  0.5\nafter    E = −( 0.5 + 0.5 + 0.5) = −1.5"
                  }
                </Equation>
                <KeepInMind>
                  The energy is not a loss. Nothing is fitted to it and nothing descends its gradient. It is a bookkeeping
                  number whose one property, that every flip lowers it, is what turns a rule about cells into a
                  guarantee about the whole network.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Every flip lowers it by twice what the cell read">
                <p>
                  Pick one cell. Because the matrix is symmetric and the diagonal is zero, every term of the energy that
                  mentions that cell collects into a single product of its value with its own weighted sum, and the sum
                  does not mention the cell at all. The rule flips the cell only when its value disagrees with the sign of
                  the sum, and then sets it to that sign, so the change is a drop of exactly twice the sum&rsquo;s size.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="why"
                  rows={[
                    { expression: "E = −sᵢ · hᵢ + (terms without sᵢ)", reason: "symmetry lets the two halves of each pair combine, and wᵢᵢ = 0 keeps sᵢ out of hᵢ" },
                    { expression: "ΔE = −(sᵢ new − sᵢ old) · hᵢ", reason: "only the first term moves when one cell moves" },
                    { expression: "sᵢ new = sign(hᵢ), sᵢ old = −sign(hᵢ)", reason: "the rule only flips a cell that disagrees with its sum" },
                    { expression: "ΔE = −2 · |hᵢ|", reason: "a strict fall whenever the sum is not zero, and no move at all when it is" },
                  ]}
                />
                <p>
                  The stepper below draws the energy by visit rather than by pass. Cell 9 read −0.72 and its flip dropped
                  the energy by 1.44, from −3.36 to −4.80; cell 8 read +0.56 and dropped it by 1.12, to −5.92; cell 24
                  read −0.72, to −7.36; cells 6 and 25 each read −0.96 and each dropped it by 1.92, to −9.28 and then to
                  −11.2. The five drops add to 7.84, which is the whole distance from the probe to the T.
                </p>
                <RecallStepper panels={["energy"]} />
                <KeepInMind>
                  The argument leans on the symmetry and on the zero diagonal, and on nothing else. The matrix is checked
                  for symmetry when it is built, and the diagonal is the storage rule&rsquo;s own responsibility.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Finitely many states, so the walk has to stop">
                <p>
                  Every flip is a strict fall, so a state can never be revisited, and there are only 33,554,432 states on
                  twenty-five cells, so the walk has to run out of places to go. Where it runs out is a state no single
                  cell wants to change, a local minimum of the energy and a fixed point of the rule, and for a lightly
                  loaded network that is one of the stored shapes. It is the k-means argument again with the inertia
                  swapped for an energy, and it is unusually short for a convergence result about a network.
                </p>
                <Equation>{"sᵢ · hᵢ ≥ 0 for every cell i        which is what a fixed point is"}</Equation>
                <p>
                  That condition can be checked in one pass without settling at all, and it is stronger than one settling
                  run, since it is a statement about every visiting order at once. The pass limit on a recall, twenty
                  here, is therefore a guard rather than the stopping condition. The scrambled T under three shapes took
                  two passes and fifty visits and reports that it settled, and no probe on this page under the
                  one-at-a-time rule has ever reached the limit.
                </p>
                <KeepInMind>
                  The guarantee is that recall stops at a local minimum, and nothing in it says the minimum is a shape
                  that was stored. Part 5 is about the minima that were not.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. A cross-section of the landscape">
                <p>
                  The landscape cannot be drawn, but one path through it can. Start at the T and flip, one at a time,
                  every cell that differs from some destination, scoring the energy of each state along the way. To the
                  T&rsquo;s negation all twenty-five cells differ, and the path climbs from −11.2 to a high point of 1.44
                  after twelve flips and then falls back to exactly −11.2 at the far end, which is Part 5&rsquo;s first
                  point drawn as a curve. To the L fourteen cells differ, and the path climbs to −3.52 and descends
                  again, a ridge between two wells of equal depth; to the cross twelve differ and the ridge is lower,
                  at −5.28.
                </p>
                <EnergyPath />
                <KeepInMind>
                  On the paths to the negation and to the L only the two ends are fixed points. Every state in between
                  has at least one cell that wants to move, which is what makes each end a memory and the ridge between
                  them the reason a probe on one side falls one way.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What Else the Network Remembers",
          content: (
            <>
              <SubSection title="16. The negation is stored for free">
                <p>
                  The energy multiplies two cell values in every term, so reversing every cell leaves every product, and
                  the energy, exactly where it was. Every weighted sum reverses along with the cell it belongs to, so a
                  state where every cell agrees with its sum becomes another such state. If a shape is a fixed point then
                  so is the shape with every cell reversed, at the identical energy, and no implementation can avoid it,
                  because it follows from the form of the energy and not from anything the storage rule did.
                </p>
                <Equation>{"E(−s) = −½ · Σᵢ Σⱼ wᵢⱼ · (−sᵢ)(−sⱼ) = E(s)"}</Equation>
                <NegationCheck />
                <p>
                  The reversed T has the T&rsquo;s own energy of −11.2, no cell wants to move, its first five cells read −0.80, −0.96,
                  −0.96, −0.96 and −1.04 where the T&rsquo;s read the same numbers positive, and it shares no cell at all
                  with the T. Which valley a probe falls into is decided by which is nearer. Reverse the first eighteen
                  cells of the T, which can be done by clicking them in the playground, and the probe starts at −1.12,
                  seven cells move, and it comes to rest in the T inverted.
                </p>
                <KeepInMind>
                  Storing three shapes stores six memories, and a probe more than half wrong comes back reversed. A caller
                  who needs the original has to compare the answer with its negation, since the network cannot tell them
                  apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The odd mixture is a memory nobody gave it">
                <p>
                  Fixed points that were never stored exist too, and the reliable family is the mixture. Take the three
                  shapes, add them cell by cell, and keep the sign, so a cell is lit where at least two of the three are
                  lit. On the T, the L and the cross that gives six lit cells, the four corners, the centre and the
                  middle of the bottom row. Score it and no cell wants to move; it is a fixed point at an energy of −7.84,
                  where the shapes themselves are at −11.2, −11.2 and −11.04, and it shares 18, 18 and 20 cells with the
                  three of them, so it equals none.
                </p>
                <UnstoredRests variant="mixture" />
                <p>
                  The smallest sum any cell of the mixture reads is 0.16 in absolute value, against 0.72 for the least
                  sure cell of the T, so the valley is shallow as well as high, and a probe has to be nearer the mixture
                  than any shape to fall into it.
                </p>
                <KeepInMind>
                  A spurious state is a minimum like any other, only shallower while the load is light. The network has no
                  way to tell a caller which kind of rest it found, since it kept no copy of what it stored.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Under six shapes the extra rests are as deep as the real ones">
                <p>
                  Tick store three more shapes in the playground, so the load is 0.24, and scramble the T once, which
                  flips the same five cells as before. The probe now starts at −7.04, five cells move, and it comes to
                  rest at −14.24 in a state with the top row, the bottom row and the centre lit, which nobody stored.
                  Only two of the five cells that moved were among the five damaged. The rest shares 19 cells with the T
                  and 23 with the Z, and its energy is exactly the Z&rsquo;s own, −14.24, so the network is as content
                  there as it is resting in a shape it was given.
                </p>
                <UnstoredRests variant="sixShapes" />
                <p>
                  All six stored shapes are still fixed points, at −11.36 for the T, −12.64, −13.76, −15.52, −14.24 and
                  −11.52, so what the extra shapes eroded is the valleys around them and not the shapes themselves. Each
                  cell&rsquo;s sum now carries the votes of six shapes where it wanted the votes of one, and the votes
                  of the other five can outvote the truth.
                </p>
                <KeepInMind>
                  Overloading is not an error. Nothing raises, the walk settles, and the state it settles in is a perfectly
                  good fixed point. The only sign is the load, which is why the playground reports it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. How Much a Network Can Hold",
          content: (
            <>
              <SubSection title="19. The crosstalk in a cell&rsquo;s sum">
                <p>
                  Why a stored shape is a fixed point, and why it stops being one, are the same calculation. Put a stored
                  shape p into cell i&rsquo;s weighted sum and split the sum into the part that came from p itself and the
                  part from every other stored shape q.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="why"
                  rows={[
                    { expression: "hᵢ = (1/n) · Σⱼ≠ᵢ Σ over patterns q of qᵢ · qⱼ · pⱼ", reason: "the storage rule written into the sum, with j ≠ i because the diagonal is zero" },
                    { expression: "   = pᵢ · (n − 1)/n  +  (1/n) · Σ over q ≠ p of qᵢ · (Σⱼ≠ᵢ qⱼ · pⱼ)", reason: "the q = p term has every pⱼ · pⱼ equal to one, leaving n − 1 of them" },
                    { expression: "first term has the sign of pᵢ, size (n − 1)/n", reason: "with one pattern stored this is the whole sum, so p is a fixed point by construction" },
                    { expression: "second term is the crosstalk, one overlap with each other pattern", reason: "small when the patterns are nearly orthogonal, growing with every pattern added" },
                  ]}
                />
                <p>
                  On the four cells, cell 1 of A has an own term of 3/4 and a crosstalk from B of ¼ · (+1) · ((+1)(+1) +
                  (−1)(−1) + (+1)(−1)) = ¼, and the two add to the 1 read off the matrix in step 8. On the T under three
                  shapes the own term is 24/25 = 0.96 for every cell, and the sums the T&rsquo;s cells actually read are
                  0.80, 0.96, 0.96, 0.96 and 1.04 across the top row, so the crosstalk there is −0.16, 0, 0, 0 and
                  +0.08. It never came near the 0.96 it would take to turn a cell.
                </p>
                <KeepInMind>
                  Capacity is the point at which the crosstalk in some cell&rsquo;s sum outgrows that cell&rsquo;s own
                  term. It is a statement about overlap between the stored patterns, and it is why the answer depends on
                  which patterns were stored as well as on how many.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Capacity measured on twenty-five cells">
                <p>
                  I measured it rather than quoting it. At the playground&rsquo;s size, twenty-five cells, the measurement stores
                  from one to twelve random bipolar patterns, ten independent sets at each count, and asks two questions
                  of every stored pattern, whether it comes back unchanged when presented exactly and whether it comes
                  back when five cells are reversed first, which is what the scramble does.
                </p>
                <CapacityCurve units={25} />
                <p>
                  Every pattern is a fixed point up to four stored, a load of 0.16, and with five cells reversed the
                  recovery is 0.90 at three patterns and 0.85 at four. At five patterns exact recall drops to 0.86 and
                  corrupted recall to 0.62; at six, the playground&rsquo;s overloaded case, they are 0.683 and 0.383; at
                  twelve, a load of 0.48, an exact probe comes back unchanged 0.117 of the time. The fixed-point column
                  is the exact question asked without settling, and it tracks the exact column within a few hundredths.
                </p>
                <KeepInMind>
                  At twenty-five cells the collapse is gradual. There is no load at which recall is fine and the next at
                  which it fails, which is why the page reports the curve rather than a number.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. A hundred cells and the 0.138 figure">
                <p>
                  The figure in the literature, 0.138 patterns per cell, is the load at which errorless recall breaks
                  down as the network grows without bound, and a hundred cells is where it starts to mean something.
                  The same measurement there, with ten of the hundred cells reversed for the corrupted probe, gives every
                  pattern back at five and eight patterns stored, 0.94 of them at ten, a load of 0.10, and 0.958 at
                  twelve, which is higher than at ten and is sampling noise with ten sets per point. At fourteen, a load
                  of 0.14 and the literature&rsquo;s line, exact recall is 0.721; at twenty it is 0.49 and corrupted
                  recall 0.40; at thirty it is 0.037, and at forty a corrupted probe never comes back.
                </p>
                <CapacityCurve units={100} />
                <p>
                  So the textbook claim did not hold as written here. Recall is already imperfect at a load of 0.10 and is
                  still working half the time at 0.20, and 0.138 is a fair marker for where it starts going badly rather
                  than a description of what happens at a hundred cells. The honest summary is that the capacity is
                  linear in the number of cells with a constant near a seventh, and that the failure is an erosion rather
                  than a cliff.
                </p>
                <KeepInMind>
                  The 0.138 is an asymptotic result about random patterns and an exact probe. At any size that can be
                  drawn, and for any patterns a person would choose, the measured curve is the number to use.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Shapes against random patterns, and what overlap did not predict">
                <p>
                  The derivation says crosstalk is overlap, so patterns that resemble one another should recall worse than
                  patterns that do not. The measurement takes the mean absolute overlap of each pair of stored patterns, their
                  inner product over the cell count, so 0 is orthogonal and 1 is identical or opposite, beside how often
                  a five-cell corruption of each pattern settles back into it, twenty corruptions per pattern.
                </p>
                <NumberTable
                  headings={["stored", "load", "mean overlap", "still fixed points", "recovered from five flips"]}
                  rows={[
                    ["three shapes", "0.12", "0.067", "1.000", "0.983"],
                    ["three random patterns", "0.12", "0.120", "1.000", "0.955"],
                    ["six shapes", "0.24", "0.195", "1.000", "0.617"],
                    ["six random patterns", "0.24", "0.157", "0.717", "0.380"],
                  ]}
                  caption="Recall on twenty-five cells, the random rows averaged over ten sets. The three shapes were chosen for how little they overlap, and at that load the claim holds; at six the shapes overlap more than the random patterns on average and still recall far better."
                />
                <p>
                  At three patterns the claim held, since the shapes overlap less than random patterns and recover
                  better, 0.983 against 0.955. At six it did not. The six shapes overlap more on average, 0.195 against
                  0.157, and every one of them is still a fixed point where only 0.717 of the random patterns are, with
                  recovery at 0.617 against 0.380. A mean over pairs is too coarse a summary of crosstalk, because what
                  turns a cell is the sum of overlaps arriving at that one cell with their signs, and six random patterns
                  on twenty-five cells will by chance contain some pair, or some cell, where that sum is large.
                </p>
                <KeepInMind>
                  Correlated patterns produce crosstalk, and the crosstalk is what eats the valleys, but the average
                  overlap did not predict which of two sets at the same load would recall better, so a set of patterns
                  is worth measuring, by corrupting each and asking whether it comes back, before it is trusted.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. One Cell at a Time, or All at Once",
          content: (
            <>
              <SubSection title="23. All at once can loop forever">
                <p>
                  The obvious way to implement recall is to compute every cell&rsquo;s sum from the current state and move
                  all of them together, and the settling argument does not cover it, because two cells can each move in a
                  direction that would have lowered the energy on its own while together they raise it. No contrived
                  matrix is needed. Store the single two-cell pattern (+1, −1), whose only weight is −0.5 between the two
                  cells, and hand the network (+1, +1), whose energy is 0.5. Both cells read −0.5, both flip,
                  and the state is (−1, −1) at the same 0.5. Both now read +0.5, both flip back, and it goes on until the
                  pass limit stops it.
                </p>
                <UpdateRuleRace variant="twoUnits" />
                <p>
                  One cell at a time, the first cell visited reads −0.5, flips, and the second then reads +0.5 with the
                  value it already has and stays, so the first pass reaches −0.5 and a second pass confirms that nothing
                  moves, in a stored memory. Which memory
                  depends on which cell the seed visited first. Seeds 0, 1, 2 and 7 give (−1, +1); seeds 3 to 6 give
                  (+1, −1). A probe sitting equally close to two memories really can settle into either, and the visiting
                  order is what decides.
                </p>
                <KeepInMind>
                  The all-at-once failure is a two-state loop that runs forever, and its energy never falls. A walk that
                  ends at the pass limit under that rule is not a walk that needed more passes.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. All at once can also settle in the wrong place">
                <p>
                  The loop is the failure the theory predicts, and it is not the only one. On the scrambled T under three
                  shapes the all-at-once rule moves the five damaged cells in one pass and reaches the T, so it often
                  works. Reverse the first fifteen cells of the T instead, a probe that shares ten cells with the T and
                  fifteen with its negation, and the two rules part company. One cell at a time moves ten cells in a
                  single pass, from 0.48 down to −11.2, and rests in the T inverted, the nearer memory. All at once takes
                  four passes, moving 16, 12, 5 and then no cells, with the energy going 0.48, −5.28, −5.44, −8.8, and
                  rests in a state nobody stored that is nonetheless a fixed point.
                </p>
                <UpdateRuleRace variant="halfT" />
                <KeepInMind>
                  The energy fell at every pass in that second walk, and the rule still ended somewhere worse, because
                  sixteen cells acting on one stale picture overshot the valley they were all aiming at. The
                  one-at-a-time rule cannot overshoot, since each visit sees the last.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Why one at a time is the default, and why the fit has no convergence">
                <p>
                  Both rules are offered, because refusing to implement the broken one would hide the single most
                  instructive fact about this model, and the caller has to name the one they mean rather than flip a
                  switch, since the two are different algorithms with different guarantees. The default is the one with
                  a proof behind it. Every other iterative model on this site reports whether its fit converged; this one
                  deliberately does not, because its fit is one shot and there is nothing to converge. The thing that
                  iterates is recall, which happens once per probe and can settle for one probe and hit the pass limit
                  for another in the same call, so whether a settling converged is a fact about one recall and is
                  reported on the walk that recorded it.
                </p>
                <p>
                  One more thing an implementation should not do is stand a{" "}
                  <Link href="/concepts/restricted-boltzmann-machine" className={link}>
                    restricted Boltzmann machine
                  </Link>{" "}
                  in for this model. It also takes a state and answers with a state, but it has no weight between two
                  visible units, so there is no symmetric matrix over the cells and no diagonal to clear, and summing
                  out its hidden units leaves an energy that is not quadratic in the state, so a state and its negation
                  no longer share an energy and the negation is no longer a fixed point, which is the check in
                  step 16 failing on a model that otherwise looks the part.
                </p>
                <KeepInMind>
                  Which rule, which seed, and how many passes are all facts about a recall rather than about the fit, and
                  an implementation should keep them there.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="26. Implementation and failure contracts">
                <p>
                  A complete implementation states the value convention, +1 and −1 rather than 1 and 0; the storage rule
                  with its scaling and its cleared diagonal; the update rule, one cell at a time or all at once, and the
                  visiting order and its seed under the first; what a weighted sum of exactly zero does; the stopping
                  condition and the pass limit, and which of the two ended a given recall; the energy and its sign
                  convention; and how new patterns are matched to the fitted cells, by name or by position. Every row
                  below was run, and the table reports what came back.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "no cells at all", reason: "refused at the boundary, by the same guard every feature on the site passes through." },
                    { expression: "one cell", reason: "refused; a network needs at least two cells to have a connection." },
                    { expression: "one pattern", reason: "fits; every weight off the diagonal is +1/4 or −1/4 on four cells, and the load is 0.25." },
                    { expression: "a cell lit in every pattern", reason: "fits; it is wired to each other cell by that cell’s values summed over the patterns, which on three four-cell patterns gives −0.25 to each of the others." },
                    { expression: "a value of 0 in a pattern", reason: "refused, naming the cell at fault, since a 0 is not a state the network can be in." },
                    { expression: "a non-finite value", reason: "refused at the boundary as a non-finite value, before the bipolar check is reached." },
                    { expression: "cells holding different numbers of patterns", reason: "refused, naming the two lengths." },
                    { expression: "two cells with one name", reason: "refused; a matrix addressed by name cannot hold two rows under one." },
                    { expression: "more patterns than cells", reason: "fits, at a load of 1.5 for six patterns on four cells, and 5 of the 6 stored patterns are still fixed points. Nothing warns." },
                    { expression: "the same pattern stored twice", reason: "fits; every weight is exactly doubled, so the answers are unchanged and the load is not." },
                    { expression: "a pattern and its negation stored together", reason: "fits, with weights exactly those of storing the first pattern twice, since the negation contributes the same products; the second pattern recalls as the first, reversed." },
                    { expression: "recall before fit", reason: "refused as not fitted, in a sentence rather than as an attribute error." },
                    { expression: "a probe of the wrong width", reason: "refused, naming both widths." },
                    { expression: "a table missing a fitted cell, or with an unknown one", reason: "refused, listing the fitted cells against the supplied ones; a missing cell leaves a row of the matrix with nothing to read." },
                    { expression: "a table with the cells reordered", reason: "accepted; the cells are matched by name and come back in the fitted order." },
                    { expression: "a probe that is already at rest", reason: "one pass, moving no cells, and the walk reports that it settled." },
                    { expression: "a weighted sum of exactly zero", reason: "the cell is left as it is, and a state whose only disagreement is a zero sum is reported as a fixed point." },
                    { expression: "a pass limit below one", reason: "refused at construction by the field bound." },
                    { expression: "an unknown keyword at construction", reason: "refused rather than silently dropped, which is the configuration mistake a default would otherwise hide." },
                    { expression: "all at once on the two-cell oscillator", reason: "completes rather than raises; six sweeps, every one moving both cells, and the walk reports the pass limit with the energy at 0.5 where it started." },
                    { expression: "a matrix with a non-zero diagonal handed to the weights", reason: "accepted on purpose and reported as self-connected, so the lesson of step 6 can be demonstrated rather than forbidden." },
                    { expression: "an asymmetric matrix handed to the weights", reason: "refused, because without symmetry the settling argument does not hold." },
                  ]}
                />
                <p>
                  Two rows deserve the emphasis. More patterns than cells is accepted and nothing warns, because the load
                  is a number a caller can read and the failure is a gradual erosion rather than a state the fit can
                  detect. And a self-connected matrix is accepted by the container while the storage rule never produces
                  one, since refusing it there would move the lesson out of the rule and into the container, leaving
                  nothing able to show what a self connection does.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
