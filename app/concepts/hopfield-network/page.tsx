import { pageMetadata } from "@/lib/seo";
import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
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

export const metadata: Metadata = pageMetadata("/concepts/hopfield-network", {
  title: "Hopfield Networks · Perceptron Lab",
  description:
    "A Hopfield network uses repeated updates to settle toward a stable pattern. Its connections can store associations that help recover a familiar pattern from incomplete or noisy input, though other stable states can also occur.",
});

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function HopfieldNetworkPage() {
  return (
    <ConceptPage
      lessonId="hopfield-network"
      intuition={lessonIntuitions["hopfield-network"]}
      technicalStart="Part 2. Storing Patterns in One Shot"
      openingTitle="Can a Damaged Pattern Find Its Way Back?"
      playgroundTitle="Can a damaged pattern settle back into memory?"
      playgroundIntro="Damage a stored pattern and follow recall one update at a time. Check the final pattern as well as the energy, since settling is not the same as recalling correctly."
      title="Hopfield Networks"
      tagline={"A Hopfield network uses repeated updates to settle toward a stable pattern. Its connections can store associations that help recover a familiar pattern from incomplete or noisy input, though other stable states can also occur."}
      prerequisites={<>The <Link href="/primers/linear-algebra" className={link}>linear algebra primer</Link> explains the matrix and weighted sums used for the connections. The settling argument resembles the finite-state reasoning in <Link href="/concepts/k-means" className={link}>k-means</Link>: under the conditions specified here, every actual change strictly lowers a quantity called energy. With finitely many states, that cannot continue indefinitely. Recall uses discrete cell updates rather than gradient descent.</>}

      playground={<HopfieldPlayground />}
      sections={[
        {
          title: "Part 1. Memory as Settling",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Addressed by content, answered by settling">
                <>
<p>
                  The network has been shown the T, L and cross displayed above, each on twenty-five cells. It does not retain a separate picture to look up during recall. Instead, it stores a weight for each pair of cells, based on how those cells agreed or disagreed across the training shapes. Let&apos;s see how that table of relationships can help recover a damaged pattern.
                </p>
                <p>Recall begins with the supplied pattern, including any damaged cells. Each update uses the other cells and the stored weights to choose a cell’s next state. A pattern is stable when the update rule would leave every cell unchanged. That stable pattern is the recall result, which still needs to be compared with what we hoped to recover.</p>
</>
                <p>Press scramble to flip five cells of the T, then run recall. In this example, the original cells return in one pass and the next pass changes nothing. The displayed energy falls from −3.36 to −11.2.</p>
                <p>Energy is a numerical function of the current cell pattern and the stored connections. Under the update conditions explained below, an update cannot increase it. That helps explain why recall settles, but it does not yet tell us whether the stable pattern will be the one we wanted.</p>
                <KeepInMind>
                  A stable state is a pattern that no single-cell update changes. Starting from a damaged pattern, recall follows updates until it settles. It may recover a stored shape, but it can also reach another stable pattern. There is no guarantee that the result is the nearest stored shape. This ability to recover from a partial or damaged cue is what we mean by associative memory.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A state is one sign per cell">
                <>
<p>
                  Every cell is either lit or dark, and the arithmetic is cleanest if lit is +1 and dark is −1 rather than 1 and 0. The reason is what happens to a pair of cells that are dark together. With 0 and 1 their product is 0, so two cells that are dark in every shape would end up not wired at all, though they agree as perfectly as two cells that are lit in every shape.
                </p>
                <p>
                  With +1 and −1 both kinds of agreement give a product of +1 and both kinds of disagreement give −1, and agreement is the only thing the rule is going to count.
                </p>
</>
                <Equation>{"sᵢ ∈ {−1, +1}        one value per cell, twenty-five of them for a shape on the grid"}</Equation>
                <p>
                  Twenty-five cells give 2²⁵ states, which is 33,554,432, and every one of them is somewhere in the
                  landscape. The T lights nine of the twenty-five, so it is a particular one of those states, and so is
                  the T with five cells flipped. A value that is not +1 or −1, a 0 or a 0.5, is refused rather than
                  rounded, because it describes a state the network cannot be in.
                </p>
                <KeepInMind>
                  Encoding the two cell states as −1 and +1 makes their product indicate agreement: positive for either kind of agreement and negative for disagreement. This is why the representation suits the storage rule.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Storing Patterns in One Shot",
          content: (
            <>
              <SubSection title="3. One number per pair of cells">
                <p>This storage rule calculates the connection matrix directly, without iterative error minimization. For each pair of different cells, multiply their states within each stored pattern, add those products across patterns, and divide by the cell count. Set self-connections to zero. The following examples unpack that calculation.</p>
                <Equation>{"wᵢⱼ = (1/n) · Σ over patterns p of pᵢ · pⱼ        wᵢᵢ = 0"}</Equation>
                <>
<p>
                  The four maps below are the three shapes&rsquo; contributions and the matrix they add up to, with every pair of the twenty-five cells as one small square. Cells 1 and 2 are the first two of the top row; they agree in the T, where both are lit, and disagree in the L and in the cross, so their weight is one agreement less two disagreements over twenty-five cells, which is −0.04.
                </p>
                <p>
                  Cells 1 and 5, the two top corners, agree in the T and in the cross and disagree in the L, so their weight is +0.04, and cells 1 and 21, the two left corners, come to +0.04 the same way.
                </p>
</>
                <OuterProductBuilder example="threeShapes" />
                <KeepInMind>
                  The weight between two cells is a count, agreements less disagreements across the stored shapes, scaled
                  by the cell count. It is the only thing the network learns and it is learned by reading the two cells
                  it joins and nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Calculate the connections among four memory cells" id="4-the-four-cells-worked-by-hand">
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
                <>
<p>
                  Cells 1 and 2 agreed in both patterns, so they pull each other on. Cells 1 and 3 disagreed in both, so they pull apart. Cells 1 and 4 agreed once and disagreed once, and the votes cancel to nothing. The same arithmetic gives w₂₃ = −0.5 and puts a zero in every weight that touches cell 4, since the two patterns disagree there once each way.
                </p>
                <p>
                  The tables below are the two contributions, their sum, and the matrix once the diagonal is cleared, and the row worked above should match the top row of the last table.
                </p>
</>
                <OuterProductBuilder example="fourCells" />
                <WorkedExample title="What the row of zeros says">
                  <p>Cell 4 has no nonzero connections in this example. With the tie rule used here, recall leaves its supplied value unchanged. The two stored patterns disagree only at that cell, so the remaining cells do not identify whether A or B was intended. This shows an ambiguous cue under this storage rule; the load of 0.5 alone is not proof that neither pattern can be stored.</p>
                </WorkedExample>
              </SubSection>

              <SubSection title="5. Dividing by the cell count, and what the sum leaves on the diagonal">
                <p>Dividing all weights by the positive cell count sets their numerical scale. Removing that common factor would leave every nonzero local-field sign unchanged, so the discrete recall updates would be the same in exact arithmetic. Energies would also be scaled by a common factor. The normalization helps compare scales; it does not guarantee identical field magnitudes as more patterns or cells are added.</p>
                <p>
                  Before the diagonal is cleared it holds one particular number. A cell always agrees with itself, so its
                  product with itself is +1 in every pattern, and the sum over the patterns divided by the cell count is
                  the number of patterns per cell, which is the load. On the three shapes the diagonal of the summed
                  matrix reads 0.12 in every position, and on the four-cell pair it reads 0.5, which the shaded diagonal
                  of the third table above shows.
                </p>
                <Equation>{"before clearing   wᵢᵢ = (1/n) · Σ over patterns of pᵢ · pᵢ = (number of patterns) / n = the load"}</Equation>
                <KeepInMind>
                  Load is the number of stored patterns divided by the cell count: 0.12 for three shapes on twenty-five cells and 0.24 for six. It is a useful summary, but recall also depends on the patterns and the starting cue. Part 6 measures those effects.</KeepInMind>
              </SubSection>

              <SubSection title="6. The diagonal is cleared, and what happens when it is not">
                <>
<p>Keeping self-connections adds support for a cell’s current value and can prevent corrections. The energy effect alone does not explain this. Since a binary cell’s value squares to one, a self-weight adds the same constant to every state’s energy. It changes the stated update without changing the relative energy ordering of the states.</p>
                <p>A positive self-weight adds a term with the cell’s current sign to its local field. That reinforces its present state and can prevent a correction. The effect grows with the positive self-weight. This is the case explored by the dial below.</p>
</>
                <Equation>{"with a self weight   hᵢ = wᵢᵢ · sᵢ + Σⱼ≠ᵢ wᵢⱼ · sⱼ        and wᵢᵢ · sᵢ has the sign of sᵢ"}</Equation>
                <>
<p>
                  Turn the dial below on the damaged A. With the diagonal cleared, cell 1 reads +1 and wants to move. At a self weight of 0.5 it reads +0.5 and still moves; at 1.0 it reads exactly 0 and is left as it is, wrong; at 2.0 it reads −1 and the self weight has outvoted every connection, so the damage is now the cell&rsquo;s settled opinion.
                </p>
                <p>
                  Its energy went from 0.5 to −1.5 at a self weight of 1.0, which is the −2 the constant predicts for four cells, and every other state shifted by the same −2. On the scrambled T the largest row of weights away from the diagonal sums to 1.44 in absolute value, and a self weight of 0.75 is already enough to leave none of the five damaged cells able to move.
                </p>
</>
                <SelfConnectionDial />
                <KeepInMind>
                  A self-connection need not raise an error, but a sufficiently large positive value can make damage persist. The Hebbian storage method clears its diagonal so the stated recall rule uses only other cells’ contributions. The separate matrix interface permits the experiment shown here.</KeepInMind>
              </SubSection>

              <SubSection title="7. Nothing was propagated">
                <>
<p>The storage update uses the activities of the two cells joined by a weight. It does not compare the recalled pattern with a supplied target or propagate a prediction error backward. This is a Hebbian storage rule: the accumulated agreements and disagreements determine the connection.</p>
                <p>That local calculation helps explain the biological motivation, but the network remains a simplified mathematical model. Its storage and recall guarantees come from the specified weights and update rules.</p>
</>
                <p>The <Link href="/concepts/hebbian-pca" className={link}>Hebbian principal-components page</Link> also updates connections from locally available activity. Here the activities come from the patterns we want to associate. The rule accumulates pairwise products rather than calculating an error between a prediction and a separate supervised target.</p>
                <KeepInMind>
                  The current fit computes the connection matrix directly from the supplied patterns. It has no iterative loss-convergence criterion. Recall, by contrast, repeats cell updates and reports whether those updates settled.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Recall, One Cell at a Time",
          content: (
            <>
              <SubSection title="8. What a cell reads, and the sign rule">
                <p>A cell sums the current states of the other cells, each multiplied by its connection weight. It takes the sign of that total. A damaged cell is corrected if those weighted contributions favor the original state; that is a possible result, rather than a guarantee for every cue. A zero total leaves the cell unchanged under the tie rule used here.</p>
                <Equation>{"hᵢ = Σⱼ wᵢⱼ · sⱼ        sᵢ ← sign(hᵢ), and sᵢ stays if hᵢ = 0"}</Equation>
                <p>
                  Damage A by flipping its first cell, giving the probe (−1, +1, −1, −1), and let cell 1 read its sum.
                </p>
                <Equation>{"h₁ = w₁₂·s₂ + w₁₃·s₃ + w₁₄·s₄\n   = 0.5·(+1) + (−0.5)·(−1) + 0·(−1) = 1"}</Equation>
                <p>The positive total makes cell 1 become +1, correcting this damaged cell. That weighted sum is called its local field. With a zero diagonal, the cell’s current value does not contribute to its own field. The energy argument in Part 4 depends on this detail.</p>
                <KeepInMind>
                  A cell moves only when its own value disagrees with the sign of what its connections tell it. The rule
                  reads the sign and nothing else, which is why scaling every weight alike changes no answer.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The four-cell probe repaired on the first visit">
                <>
<p>
                  The cells are visited one at a time in a seeded order, and a whole pass is one visit to each. The table below is the four-cell recall opened into its eight visits. The first visit happens to be cell 1, which reads +1, moves, and drops the energy from 0.5 to −1.5, and every later visit finds a cell content where it is.
                </p>
                <p>
                  Cell 4 reads exactly 0 both times it is visited, since nothing is wired to it, and is left alone. The second pass moves nothing, which is the network saying it has settled, and it settled into A.
                </p>
</>
                <FourCellVisits />
                <KeepInMind>
                  A pass with no changes confirms that this sequential recall has reached a fixed point. If the pass limit is reached first, the run has not confirmed settling. The final state could already be stable after the last change, so check it explicitly if that distinction matters.</KeepInMind>
              </SubSection>

              <SubSection title="10. The scrambled T, five flips in fifty visits">
                <>
<p>
                  Now the T with the playground&rsquo;s five cells flipped, under the three shapes. At the probe, the five damaged cells are the ones that disagree with their sums. Cell 8, which is dark and should be lit, reads +0.48; cell 25 reads −0.48; and cells 6, 9 and 24 each read −0.72. Among the twenty undamaged cells the smallest sum in absolute value is 0.24, so none of them is near moving.
                </p>
                <p>
                  Step through the visits below and watch the five come back at visits 11, 12, 14, 19 and 20 of the fifty, in the order the seeded walk happened to reach them.
                </p>
</>
                <RecallStepper panels={["grid"]} />
                <KeepInMind>
                  The visiting order is drawn afresh each pass from a seeded generator, so a seeded network answers the
                  same probe the same way every time while still not walking the cells in the order they were numbered.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Each cell reads the state the previous one left">
                <>
<p>

                  Look at what cell 8 read. At the probe its sum was +0.48, and when it was visited, at visit 12, it read +0.56, because cell 9 had moved at visit 11 in between and cell 9 is one of the cells wired to it. Cell 6 read −0.72 at the probe and −0.96 by visit 19, after three of its neighbors had been repaired.
                </p>
                <p>
                  On the second pass cell 8 reads +0.96 and cell 6 reads −1.04, since by then every damaged cell has moved and every vote points the same way. That is the meaning of one cell at a time. Each visit sees the state the previous visit left behind, and the repairs reinforce one another as they land.
                </p>
</>
                <KeepInMind>
                  Under the one-at-a-time rule no two cells ever act on the same stale picture of each other, which is
                  the property the settling argument needs and the property the all-at-once rule in Part 7 gives up.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "With +1 for lit and −1 for dark, two cells that are dark in every shape end up wired as strongly as two cells that are lit in every shape.",
              true,
              "Both kinds of agreement give a product of +1, so a pair that is dark throughout collects the same count as a pair that is lit throughout. With 0 and 1 the product of two dark cells is 0, and that pair would end up not wired at all although it agrees just as perfectly. Agreement is the only thing the rule counts, which is why the units are chosen so that both kinds come out as the same number.",
            ),
            choice(
              "Cells 1 and 2 are the first two of the top row. They agree in the T and disagree in the L and in the cross. What is the weight between them?",
              ["+0.12", "−0.04", "+0.04", "−1"],
              1,
              "The weight is a count of agreements less disagreements, scaled by the twenty-five cells, so one agreement less two disagreements gives −0.04. Cells 1 and 5, the two top corners, agree twice and disagree once and come out at +0.04 the same way.",
            ),
            trueFalse(
              "Leaving the summed diagonal in place breaks recall because it reshapes the energy landscape.",
              false,
              "It breaks recall, but not for that reason. Every cell’s value squares to one, so a self weight adds the same constant to every state’s energy and reorders nothing. What it changes is the update, where the extra term always carries the sign the cell already has and so votes for staying put. On the scrambled T a self weight of 0.75 already leaves none of the five damaged cells able to move.",
            ),
            choice(
              "Cell 8 read +0.48 at the probe and +0.56 when it was visited at visit 12. What moved it?",
              [
                "Cell 9 had moved at visit 11, and cell 9 is wired to cell 8",
                "The weights are updated as recall proceeds",
                "The visiting order is drawn afresh each pass",
                "The energy had fallen, which rescales every sum",
              ],
              0,
              "Each visit sees the state the previous visit left behind, which is what one cell at a time means. Nothing in the weights changes during recall, and the order of the visits decides when a cell is reached rather than what it reads once it is. By the second pass, with every damaged cell repaired, cell 8 reads +0.96.",
            ),
            several(
              "Which of these hold for the storage rule?",
              [
                              "The weight between two cells is read from those two cells and nothing else",
                              "Storage is one shot, so there is nothing for a fit to converge to",
                              "Dividing by the number of cells changes no answer, since the update reads only the sign of a sum",
                              "Every weight touching cell 4 of the four-cell example is zero, so that cell can never be repaired",
                            ],
              [0, 1, 2, 3],
              "Each connection accumulates products of the two cells it joins across stored patterns. This implementation calculates that sum directly and divides by the number of cells. That factor scales the weights; it is not an average over stored patterns unless those counts happen to agree. In the four-cell example, the stored patterns give opposite contributions for connections to cell 4, so those contributions cancel.",
              {
                "description": "Store A = (+1, +1, −1, −1) and B = (+1, +1, −1, +1).\nFor i ≠ j, use wᵢⱼ = sum over stored patterns p of pᵢpⱼ / 4. Set the diagonal to zero. Recall reads only the sign of each weighted sum; a zero sum leaves the cell unchanged. Storage computes the matrix directly without iterative fitting."
              },
            ),
        ],
        },
        {
          title: "Part 4. The Energy, and Why Recall Must Stop",
          content: (
            <>
              <SubSection title="12. One number for the whole state">
                <p>Energy combines the state and connection weights into one number. Multiply each connection weight by the two cell states, sum over both matrix indices, and multiply by minus one half. Configurations that satisfy more strongly weighted pairwise agreements tend to have lower energy. That measures compatibility with the connection matrix, rather than directly measuring distance from the nearest stored pattern.</p>
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
                  The strict-decrease argument uses symmetric weights, a zero diagonal, one-cell-at-a-time updates and a rule that leaves a cell unchanged at zero field. These conditions belong together. Changing the update schedule or tie behavior requires checking the convergence argument again.</KeepInMind>
              </SubSection>

              <SubSection title="14. Finitely many states, so the walk has to stop">
                <>
<p>Every actual flip strictly lowers the energy. With only 33,554,432 states on twenty-five cells, sequential recall cannot keep visiting new states indefinitely. It eventually reaches a fixed point where no individual cell changes. That point may be a stored shape or an unwanted stable pattern; convergence alone does not establish correct recall.</p>
                <p>Like the k-means argument, this proof combines a nonincreasing quantity with finitely many states. The guarantee concerns settling under the specified sequential updates. It does not identify which stable result a particular cue will reach.</p>
</>
                <Equation>{"sᵢ · hᵢ ≥ 0 for every cell i        which is what a fixed point is"}</Equation>
                <p>A fixed-point check evaluates every cell’s current local field without changing the state. If no cell would move, the pattern stays fixed under any visiting order. The recall pass limit, twenty here, is a separate computation budget. The displayed damaged T settles in two passes and fifty visits; an insufficient budget could stop another run before settling was confirmed.</p>
                <KeepInMind>
                  The guarantee is that recall stops at a local minimum, and nothing in it says the minimum is a shape
                  that was stored. Part 5 is about the minima that were not.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. A cross-section of the landscape">
                <>
<p>
                  The landscape cannot be drawn, but one path through it can. Start at the T and flip, one at a time, every cell that differs from some destination, scoring the energy of each state along the way. To the T&rsquo;s negation all twenty-five cells differ, and the path climbs from −11.2 to a high point of 1.44 after twelve flips and then falls back to exactly −11.2 at the far end, which is Part 5&rsquo;s first point drawn as a curve.
                </p>
                <p>
                  To the L fourteen cells differ, and the path climbs to −3.52 and descends again, a ridge between two wells of equal depth; to the cross twelve differ and the ridge is lower, at −5.28.
                </p>
</>
                <EnergyPath />
                <KeepInMind>
                  On the two displayed paths to the negated T and to the L, only the endpoints are fixed points. The intermediate energies show one cross-section through the state space. They do not describe all starting cues that reach either endpoint; that region depends on the recall dynamics.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What Else the Network Remembers",
          content: (
            <>
              <SubSection title="16. The negation is stored for free">
                <p>In this zero-bias quadratic energy, reversing every cell leaves every pairwise product unchanged. The local fields reverse too, so a fixed point has a negated fixed point at the same energy. This symmetry follows from the current model form. Adding biases or using a different energy can break it.</p>
                <Equation>{"E(−s) = −½ · Σᵢ Σⱼ wᵢⱼ · (−sᵢ)(−sⱼ) = E(s)"}</Equation>
                <NegationCheck />
                <p>The reversed T has energy −11.2 and is a fixed point. Its first five fields are −0.80, −0.96, −0.96, −0.96 and −1.04, the negatives of the T’s corresponding fields. If we reverse the first eighteen T cells, the cue starts at energy −1.12; recall changes seven cells and reaches the reversed T.</p>
<p>This cue is closer in cell count to the reversed pattern, but that does not establish a general nearest-pattern rule. The full connection matrix and update path determine the result.</p>
                <KeepInMind>
                  For these three stable shapes, their negations are stable as well. A cue with many reversed cells may reach a negated shape, another stored shape or a spurious state. If the application distinguishes original from inverted images, it needs an external convention or comparison; this symmetric model alone does not supply one.</KeepInMind>
              </SubSection>

              <SubSection title="17. The odd mixture is a memory nobody gave it">
                <>
<p>Additional stable patterns can appear even though they were not supplied for storage. One candidate is an odd mixture: add three patterns cell by cell and keep the sign, equivalent to a majority vote. For the T, L and cross, that produces six lit cells: the four corners, center and middle of the bottom row. We can then test whether this candidate is stable.</p>
                <p>
                  Score it and no cell wants to move; it is a fixed point at an energy of −7.84, where the shapes themselves are at −11.2, −11.2 and −11.04, and it shares 18, 18 and 20 cells with the three of them, so it equals none.
                </p>
</>
                <UnstoredRests variant="mixture" />
                <p>The mixture’s smallest absolute local field is 0.16, compared with 0.72 for the T. Those values describe resistance to changing an individual cell. They do not determine the whole region of cues that will reach each pattern: that also depends on the other fields and the updates taken during recall.</p>
                <KeepInMind>
                  This mixture is a stable state that was not supplied as a memory. Its energy is higher than the three shapes’ energies in this example, but spurious states are not universally shallower. Since the fitted network retains only the weight matrix, a caller must compare recall with separately retained targets to determine whether the intended memory was recovered.</KeepInMind>
              </SubSection>

              <SubSection title="18. Under six shapes the extra rests are as deep as the real ones">
                <>
<p>

                  Tick store three more shapes in the playground, so the load is 0.24, and scramble the T once, which flips the same five cells as before. The probe now starts at −7.04, five cells move, and it comes to rest at −14.24 in a state with the top row, the bottom row and the center lit, which nobody stored.
                </p>
                <p>
                  Only two of the five cells that moved were among the five damaged. The rest shares 19 cells with the T and 23 with the Z, and its energy is exactly the Z&rsquo;s own, −14.24, so the network is as content there as it is resting in a shape it was given.
                </p>
</>
                <UnstoredRests variant="sixShapes" />
                <p>
                  All six stored shapes are still fixed points, at −11.36 for the T, −12.64, −13.76, −15.52, −14.24 and
                  −11.52, so what the extra shapes eroded is the valleys around them and not the shapes themselves. Each
                  cell&rsquo;s sum now carries the votes of six shapes where it wanted the votes of one, and the votes
                  of the other five can outvote the truth.
                </p>
                <KeepInMind>
                  Storage accepts the larger pattern set, and recall can still settle. Correct recall must be checked separately. Load helps describe the configuration, while exact-pattern stability and corrupted-cue recovery tests reveal different failures.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "A visited cell disagrees with the sign of its sum and flips. By how much does the energy fall?",
              [
                "By exactly twice the size of that cell’s sum",
                "By exactly the size of that cell’s sum",
                "By half the size of that cell’s sum",
                "By an amount that depends on every other cell’s sum as well",
              ],
              0,
              "For symmetric weights with a zero diagonal, flipping a cell against its weighted input lowers energy by twice the magnitude of that input. The sign of the input determines the preferred state, while its magnitude determines this drop. In the displayed visit, an input of −0.72 produces an energy decrease of 1.44.",
            ),
            trueFalse(
              "Every flip strictly lowers the energy and there are finitely many states, so recall must stop in one of the stored shapes.",
              false,
              "Under sequential updates with symmetric zero-diagonal weights and no flips at a zero input, each actual flip lowers energy. Finitely many states then imply settling at a state with no permitted improving flip. That state need not be one of the stored patterns. The demonstrated mixture is another fixed point.",
            ),
            trueFalse(
              "The T with every cell reversed is a fixed point at the T’s own energy of −11.2.",
              true,
              "For this zero-bias bipolar energy, reversing every cell preserves every pairwise product and reverses each weighted input. A fixed point’s negation is therefore also a fixed point with the same energy. These three shapes have distinct negations, giving six such states. Adding biases or changing the energy model can break that symmetry.",
            ),
            several(
              "The three shapes are added cell by cell and the sign kept, giving a state with six lit cells. Which of these hold for it?",
              [
                              "No cell wants to move, so it is a fixed point",
                              "Its energy of −7.84 sits above the shapes, which are at −11.2, −11.2 and −11.04",
                              "It shares 20 cells with the cross, so it is the cross",
                              "The smallest sum any of its cells reads is 0.16, against 0.72 for the least sure cell of the T",
                            ],
              [0, 1, 3],
              "The mixture settles at a state different from every stored shape. Its overlap counts describe resemblance, but they do not determine its attraction region. Recall depends on the local weighted inputs encountered during updates. A probe can therefore settle in an unintended mixture even when a stored shape appears close by a simple cell-agreement count.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "25-cell three-shape memory; majority-sign mixture has 6 lit cells.\nCells whose update would change: 0\nMixture energy: −7.84\nStored-shape energies: −11.20 / −11.20 / −11.04\nCells agreeing with the three shapes: 18 / 18 / 20, out of 25\nSmallest sign-aligned field magnitude: mixture 0.16; T 0.72"
              },
            ),
            trueFalse(
              "Under six shapes the T is still a fixed point, although the scrambled T no longer comes back to it.",
              true,
              "In this six-shape store, the intact T remains fixed while the damaged T reaches an unintended state. Storing a fixed point and recovering it from nearby damage are separate requirements. The higher load is a warning to investigate, not a diagnosis by itself. Comparing the recovered pattern with the intended T and inspecting the update trace reveals the failed recall directly.",
            ),
        ],
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
                    { expression: "second term is the crosstalk, one overlap with each other pattern", reason: "determined by signed overlaps with the other patterns; added contributions can reinforce or cancel one another" },
                  ]}
                />
                <>
                  <p>
                    For cell 1 of pattern A, separate the contribution from its own
                    stored pattern from the contribution of pattern B.
                  </p>
                  <Equation>{"own contribution = 3/4\ncrosstalk = ¼ × (+1) × ((+1)(+1) + (−1)(−1) + (+1)(−1))\n          = ¼\ntotal = 3/4 + 1/4 = 1"}</Equation>
                  <p>
                    That is the field read from the matrix in step 8. In the
                    twenty-five-cell T, the own-pattern contribution is:
                  </p>
                  <Equation>{"own contribution = 24 / 25 = 0.96"}</Equation>
                  <p>
                    The top row’s measured fields are 0.80, 0.96, 0.96, 0.96 and 1.04.
                    Their crosstalk contributions are therefore −0.16, 0, 0, 0 and 0.08.
                    None is large enough in the opposing direction to reverse a cell.
                  </p>
                </>
                <KeepInMind>
                  A stored pattern loses exact fixed-point stability if an opposing crosstalk term reverses one of its local fields. That is one capacity criterion. Recovering corrupted cues is another, and it can deteriorate even while every stored pattern remains stable. Both depend on the chosen patterns and the update rule.</KeepInMind>
              </SubSection>

              <SubSection title="20. Capacity measured on twenty-five cells">
                <p>The recorded experiment uses twenty-five cells, matching the playground. For each stored-pattern count from one to twelve, it draws ten independent sets of random bipolar patterns. It then checks recall from each exact stored pattern and from a version with five cells flipped. Those two tests separate whether a pattern remains stable from whether the network can repair that amount of corruption.</p>
                <CapacityCurve units={25} />
                <p>In these sampled sets, every exact pattern is stable up to four patterns stored, a load of 0.16. With five cells reversed, recovery is 0.90 at three patterns and 0.85 at four. At five patterns, exact recall is 0.86 and corrupted recall 0.62; at six they are 0.683 and 0.383. At twelve, load 0.48, exact recall succeeds 0.117 of the time. These are finite-sample results. The separate fixed-point column tests local stability without running recall.</p>
                <KeepInMind>
                  At twenty-five cells the collapse is gradual. There is no load at which recall is fine and the next at
                  which it fails, which is why the page reports the curve rather than a number.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. A hundred cells and the 0.138 figure">
                <>
<p>The often quoted value near 0.138 patterns per cell comes from large-network analyses of random, unbiased patterns under the classic Hebbian model. It describes a retrieval regime with attractors strongly correlated with the stored patterns. It is not a guarantee that every stored pattern is an exact fixed point or that every recalled bit is correct.</p>
<p>The hundred-cell experiment also tests cues with ten cells reversed. It recovers every tested pattern at five and eight stored patterns, 0.94 at ten and 0.958 at twelve. Different sampled pattern sets can give nonmonotone estimates at individual points, so the increase from ten to twelve does not establish that storing more patterns improves recall.</p>
                <p>
                  At fourteen, a load of 0.14 and the literature&rsquo;s line, exact recall is 0.721; at twenty it is 0.49 and corrupted recall 0.40; at thirty it is 0.037, and at forty a corrupted probe never comes back.
                </p>
</>
                <CapacityCurve units={100} />
                <p>The finite example shows a gradual loss of recall as more patterns are stored. Recall is already imperfect at load 0.10 and still succeeds about half the time at 0.20. The value 0.138 describes an asymptotic capacity result under its assumptions; it is not an exact cutoff for this hundred-cell experiment. The roughly linear growth with network size and the changing error rate need to be interpreted separately.</p>
                <KeepInMind>
                  The asymptotic value concerns a specified random-pattern retrieval model and success criterion. Exact stability, exact corrupted-cue recovery and approximate recovery are different criteria. For a finite set of chosen patterns, report which one was measured alongside the observed recall curve.</KeepInMind>
              </SubSection>

              <SubSection title="22. Shapes against random patterns, and what overlap did not predict">
                <p>Other stored patterns contribute through their overlaps, but one mean overlap value may hide important signed interactions. This comparison reports mean absolute pairwise overlap, the absolute inner product divided by cell count. Zero means orthogonal; one means identical or negated patterns. It also measures recovery over twenty five-cell corruptions per pattern. We can compare the summary with actual recall rather than treating it as a complete predictor.</p>
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
                <>
<p>
                  At three patterns the claim held, since the shapes overlap less than random patterns and recover better, 0.983 against 0.955. At six it did not. The six shapes overlap more on average, 0.195 against 0.157, and every one of them is still a fixed point where only 0.717 of the random patterns are, with recovery at 0.617 against 0.380.
                </p>
                <p>The mean discards where and with which signs the contributions reach each cell. Random patterns can also contain unusually large local interference even when the average overlap is modest. Those details help explain why a coarse pairwise summary need not rank two pattern sets by recall performance.</p>
</>
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
                <>
<p>Updating every cell simultaneously uses the old state for all of the weighted sums. Two changes that would separately lower energy can interact when made together. The sequential proof therefore does not apply, and simultaneous recall can cycle instead of settling. The next small network demonstrates that failure.</p>
                <p>
                  Store the single two-cell pattern (+1, −1), whose only weight is −0.5 between the two cells, and hand the network (+1, +1), whose energy is 0.5. Both cells read −0.5, both flip, and the state is (−1, −1) at the same 0.5. Both now read +0.5, both flip back, and it goes on until the pass limit stops it.
                </p>
</>
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
                  The displayed simultaneous-update run enters a verified two-state cycle. Raising its pass limit would repeat that cycle rather than repair it. A pass-limit exit in an arbitrary run is not by itself proof of cycling; inspect the recorded states or use a separate cycle check.</KeepInMind>
              </SubSection>

              <SubSection title="24. All at once can also settle in the wrong place">
                <>
<p>Simultaneous updates can also settle, including at an unwanted pattern. For the five-cell-damaged T, they restore the T in one changing pass. That example establishes success for this cue, not a general success rate. Reversing the first fifteen T cells creates another cue, sharing ten cells with the T and fifteen with its negation, on which the two update rules reach different results.</p>
                <p>
                  One cell at a time moves ten cells in a single pass, from 0.48 down to −11.2, and rests in the T inverted, the nearer memory. All at once takes four passes, moving 16, 12, 5 and then no cells, with the energy going 0.48, −5.28, −5.44, −8.8, and rests in a state nobody stored that is nonetheless a fixed point.
                </p>
</>
                <UpdateRuleRace variant="halfT" />
                <KeepInMind>
                  Both procedures lower energy on this particular cue, but they reach different fixed points. Sequential updates have the one-cell strict-decrease guarantee. That guarantee still does not select the intended stored shape; simultaneous updates can interact in ways the sequential proof does not cover.</KeepInMind>
              </SubSection>

              <SubSection title="25. Why one at a time is the default, and why the fit has no convergence">
                <>
<p>The interface exposes the two recall procedures by name because their behavior and guarantees differ. Sequential recall is the default. Simultaneous recall remains available so the cycle can be observed and compared with the proof’s assumptions.</p>
                <p>Storage computes the weights directly; recall is the iterative operation. Whether a run settled therefore belongs to a particular supplied cue. The same stored network can settle for one cue and reach the pass limit for another, so the recall record reports that outcome separately.</p>
</>
                <p>The <Link href="/concepts/restricted-boltzmann-machine" className={link}>restricted Boltzmann machine</Link> on the next page is a different associative model. It introduces hidden units and connections between visible and hidden groups, with stochastic conditional updates. Its energy and recall behavior therefore require their own explanation. The symmetric quadratic energy and sequential convergence proof used here cannot simply be transferred to it.</p>
                <KeepInMind>
                  Which rule, which seed, and how many passes are all facts about a recall rather than about the fit, and
                  an implementation should keep them there.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Choosing How Memories Are Stored and Cells Are Updated" , id: "part-8-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="26. Specify the update order and stopping condition for recall" id="26-implementation-and-failure-contracts">
                <p>A memory must use the same cell convention during storage and recall. Here cells hold +1 or −1. The storage rule also specifies its scaling and clears the diagonal so a cell does not vote for itself.</p>
                <p>Recall depends on whether cells update together or one at a time. For sequential updates, the visiting order and its seed matter. Decide what a weighted sum of exactly zero does, and report whether recall stopped because it settled or because it reached the pass limit.</p>
                <p>The energy sign convention and the way new patterns match fitted cells, by name or position, complete the comparison. The table records the library results for the boundary cases below.</p>
                <DerivationTable
                  expressionHeading="Cells, patterns or recall setting"
                  reasonHeading="Effect on storing and recalling a pattern"
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
                <p>The implementation accepts more patterns than cells; that does not promise correct retrieval. Test exact stability and representative corrupted cues rather than relying only on load. The separate weight-matrix interface also accepts self-connections for the dial experiment, while the Hebbian fit clears the diagonal. State which construction produced the matrix before applying the recall guarantee.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 to 8",
          quiz: [
            trueFalse(
              "The measurement at a hundred cells found recall perfect below a load of 0.138 and broken above it.",
              false,
              "In this hundred-cell experiment, exact recall is already imperfect at load 0.10, where 0.94 of patterns return, and still succeeds about half the time at 0.20. The value near 0.138 concerns approximate retrieval in the asymptotic random-pattern model. It does not guarantee perfect bitwise recall below that load or complete failure above it.",
            ),
            choice(
              "Crosstalk is overlap, so patterns that resemble one another should recall worse. What happened at six stored patterns?",
              [
                "The six shapes overlapped more than random patterns and still recalled better",
                "The six shapes overlapped less, which is why they recalled better",
                "The shapes and the random patterns recalled about equally well",
                "Average overlap predicted the better set at every load tried",
              ],
              0,
              "Mean absolute overlap was 0.195 for the shapes against 0.157 for random patterns, and every shape was still a fixed point where only 0.717 of the random patterns were. A mean over pairs is too coarse, because what turns a cell is the signed sum of overlaps arriving at that one cell, so a set of patterns is worth corrupting and testing before it is trusted.",
            ),
            choice(
              "A two-cell network stores (+1, −1) and is handed (+1, +1). What does the all-at-once rule do?",
              [
                "Both cells flip together, and the state loops between (−1, −1) and (+1, +1) until the pass limit",
                "Both cells flip and the state settles in (−1, +1)",
                "Neither cell moves, since each reads exactly zero",
                "The energy falls to −0.5 in a single pass",
              ],
              0,
              "Both cells read −0.5 and move together to (−1, −1), which carries the same energy of 0.5, and from there both read +0.5 and move back. No contrived matrix is needed for this. One cell at a time the first cell visited flips, the second then reads +0.5 with the value it already has and stays, and the walk rests in a stored memory.",
            ),
            trueFalse(
              "A walk that ends at the pass limit under the all-at-once rule is a walk that needed more passes.",
              false,
              "A pass limit does not distinguish a slow recall from a repeating cycle. In the two-cell simultaneous-update example, the states alternate, so increasing the limit only repeats them. The sequential energy-decrease argument does not apply when all cells update from the previous full state. Inspect the state sequence and stopping reason before deciding whether more passes would help.",
            ),
            several(
              "Which of these does the implementation accept without raising?",
              [
                              "Six patterns stored on four cells, a load of 1.5",
                              "A weight matrix with a non-zero diagonal, handed over directly",
                              "A pattern holding a 0",
                              "A weight matrix that is not symmetric",
                            ],
              [0, 1],
              "This implementation accepts a store with more patterns than cells and exposes its load for inspection. That does not guarantee that stored patterns remain fixed or that damaged probes recover. It also permits inspecting a self-connected weight matrix. Non-bipolar state values and asymmetric matrices are rejected under this API’s contract.",
              {
                "description": "This implementation requires pattern entries −1 or +1 and a symmetric weight matrix. Directly supplied matrices may have diagonal self-connections. It reports memory load but imposes no upper bound on the number of stored patterns."
              },
            ),
        ],
        },
        {
          title: "Practice. Storing and Recalling With the Library",
          practice: [
            exercise(
              "Store the four cells and repair the probe",
              [
  "Fit the supplied two four-cell bipolar patterns, then recall the supplied probe formed by flipping the first cell of A.",
  "Print weight matrix, memory load, the specified cell’s weighted input, probe energy, each recall pass’s changes/energy, stopping reason and whether the final pattern equals A."
],
              `from oop_ml import BipolarPattern, Feature, HopfieldNetwork

patterns = [[1, 1, -1, -1], [1, 1, -1, 1]]
cells = [
    Feature(f"cell_{position + 1}", [pattern[position] for pattern in patterns])
    for position in range(4)
]

network = HopfieldNetwork(random_seed=7)
probe = BipolarPattern([-1, 1, -1, -1])
# Fit the network to the cells. Print its weight matrix a row at a time and
# its load. Print what cell 1 reads at the probe. Then take the probe through
# recall_walk and print the energy it starts at, what each pass moved and the
# energy it left, why the walk stopped, and whether it rests in A.`,
              `from oop_ml import BipolarPattern, Feature, HopfieldNetwork

patterns = [[1, 1, -1, -1], [1, 1, -1, 1]]
cells = [
    Feature(f"cell_{position + 1}", [pattern[position] for pattern in patterns])
    for position in range(4)
]

network = HopfieldNetwork(random_seed=7).fit(cells)
print("weights")
for row in network.weights.values:
    print("  " + "  ".join(f"{weight:+.2f}" for weight in row))
print(f"load {network.load:.2f}")

probe = BipolarPattern([-1, 1, -1, -1])
print(f"cell 1 reads {network.weights.weighted_sums_for(probe)[0]:+.2f}")

walk = network.recall_walk(probe)
print(f"energy at the probe {walk.initial_energy:+.2f}")
for sweep in walk:
    print(f"pass {sweep.pass_number} moved {sweep.n_units_changed}, energy {sweep.energy_after:+.2f}")
print(f"stopped because {walk.stopped_because.value}")
print(f"rests in A {walk.result == BipolarPattern(patterns[0])}")`,
              `weights
  +0.00  +0.50  -0.50  +0.00
  +0.50  +0.00  -0.50  +0.00
  -0.50  -0.50  +0.00  +0.00
  +0.00  +0.00  +0.00  +0.00
load 0.50
cell 1 reads +1.00
energy at the probe +0.50
pass 1 moved 1, energy -1.50
pass 2 moved 0, energy -1.50
stopped because settled
rests in A True`,
              { hints: [
  "Use the fixed sequential update settings so later cells can see earlier changes in the same pass.",
  "A settled result means no cell changed on a pass; compare it explicitly with the intended stored pattern."
], check: numberCheck("What energy does the repaired state rest at?", -1.5, 0.005, "The repaired pattern has energy -1.5. Recall also verifies that the settled state equals A; low energy alone would not identify the intended memory."), question: "Can the stored pairwise weights repair a one-cell error?" },
            ),
            exercise(
              "Put the diagonal back",
              [
  "Take the fitted four-cell weight matrix and set its diagonal to 0, 0.5, 1 and 2 in separate experiments. Use the same damaged probe each time.",
  "Print whether self-connections exist, the specified cell’s weighted input and willingness to change, plus probe energy. This deliberately bypasses the zero-diagonal condition used by the standard recall guarantee."
],
              `from oop_ml import BipolarPattern, Feature, HebbianWeights, HopfieldNetwork

patterns = [[1, 1, -1, -1], [1, 1, -1, 1]]
cells = [
    Feature(f"cell_{position + 1}", [pattern[position] for pattern in patterns])
    for position in range(4)
]
network = HopfieldNetwork(random_seed=7).fit(cells)
probe = BipolarPattern([-1, 1, -1, -1])

for self_weight in (0.0, 0.5, 1.0, 2.0):
    values = [list(row) for row in network.weights.values]
    # Put self_weight on the diagonal of values and build a HebbianWeights
    # from it under the network's own cell names. Print whether it reports
    # self connections, what cell 1 reads at the probe, whether cell 1 wants
    # to move, and the probe’s energy under these weights.`,
              `from oop_ml import BipolarPattern, Feature, HebbianWeights, HopfieldNetwork

patterns = [[1, 1, -1, -1], [1, 1, -1, 1]]
cells = [
    Feature(f"cell_{position + 1}", [pattern[position] for pattern in patterns])
    for position in range(4)
]
network = HopfieldNetwork(random_seed=7).fit(cells)
probe = BipolarPattern([-1, 1, -1, -1])

for self_weight in (0.0, 0.5, 1.0, 2.0):
    values = [list(row) for row in network.weights.values]
    for position in range(4):
        values[position][position] = self_weight
    weights = HebbianWeights(values, network.weights.unit_names)

    reads = weights.weighted_sums_for(probe)[0]
    wants_to_move = bool(reads * probe.values[0] < 0)
    print(f"self weight {self_weight:.1f}, self connected {weights.has_self_connections}")
    print(f"  cell 1 reads {reads:+.2f}, wants to move {wants_to_move}")
    print(f"  energy at the probe {weights.energy_of(probe):+.2f}")`,
              `self weight 0.0, self connected False
  cell 1 reads +1.00, wants to move True
  energy at the probe +0.50
self weight 0.5, self connected True
  cell 1 reads +0.50, wants to move True
  energy at the probe -0.50
self weight 1.0, self connected True
  cell 1 reads +0.00, wants to move False
  energy at the probe -1.50
self weight 2.0, self connected True
  cell 1 reads -1.00, wants to move False
  energy at the probe -3.50`,
              { hints: [
  "Keep off-diagonal weights fixed.",
  "Bipolar values have constant squared magnitude, so a diagonal term shifts all state energies equally while still entering an individual update."
], check: numberCheck("What is the probe’s energy at a self weight of 2.0?", -3.5, 0.005, "The probe energy is -3.5. The diagonal shifts every bipolar state’s energy by the same constant while altering individual update sums."), question: "Can self-connections change update decisions without changing energy ranking?" },
            ),
            exercise(
              "Scramble the T, then store one shape more",
              [
  "Use the supplied damaged T under the three-pattern store and then a store also containing the square. For each test whether the intact T is fixed and report its energy.",
  "Recall the same probe with seeds zero through eleven and count exact T recoveries. Keep the damage and update procedure fixed while changing the stored set."
],
              `from oop_ml import BipolarPattern, Feature, HopfieldNetwork

SHAPES = {
    "T": "##### ..#.. ..#.. ..#.. ..#..",
    "L": "#.... #.... #.... #.... #####",
    "cross": "#...# .#.#. ..#.. .#.#. #...#",
    "square": "##### #...# #...# #...# #####",
}
patterns = {
    name: [1 if cell == "#" else -1 for cell in rows.replace(" ", "")]
    for name, rows in SHAPES.items()
}
the_t = BipolarPattern(patterns["T"])

scrambled = list(patterns["T"])
for cell in (6, 8, 9, 24, 25):
    scrambled[cell - 1] *= -1
probe = BipolarPattern(scrambled)

for stored in (["T", "L", "cross"], ["T", "L", "cross", "square"]):
    cells = [
        Feature(f"cell_{position + 1}", [patterns[name][position] for name in stored])
        for position in range(25)
    ]
    # Fit a network to these cells under each seed from 0 to 11, and count
    # the seeds whose recall of the probe is the T. Then print the load,
    # whether the T is a fixed point and at what energy, and the count.`,
              `from oop_ml import BipolarPattern, Feature, HopfieldNetwork

SHAPES = {
    "T": "##### ..#.. ..#.. ..#.. ..#..",
    "L": "#.... #.... #.... #.... #####",
    "cross": "#...# .#.#. ..#.. .#.#. #...#",
    "square": "##### #...# #...# #...# #####",
}
patterns = {
    name: [1 if cell == "#" else -1 for cell in rows.replace(" ", "")]
    for name, rows in SHAPES.items()
}
the_t = BipolarPattern(patterns["T"])

scrambled = list(patterns["T"])
for cell in (6, 8, 9, 24, 25):
    scrambled[cell - 1] *= -1
probe = BipolarPattern(scrambled)

for stored in (["T", "L", "cross"], ["T", "L", "cross", "square"]):
    cells = [
        Feature(f"cell_{position + 1}", [patterns[name][position] for name in stored])
        for position in range(25)
    ]
    recovered = 0
    for seed in range(12):
        network = HopfieldNetwork(random_seed=seed).fit(cells)
        recovered += network.recall(probe) == the_t
    print(f"{len(stored)} shapes stored, load {network.load:.2f}")
    print(f"  the T is a fixed point {network.is_fixed_point(the_t)}, at {network.energy_of(the_t):.2f}")
    print(f"  visiting orders that bring the T back {recovered}")`,
              `3 shapes stored, load 0.12
  the T is a fixed point True, at -11.20
  visiting orders that bring the T back 12
4 shapes stored, load 0.16
  the T is a fixed point True, at -10.72
  visiting orders that bring the T back 8`,
              { hints: [
  "A fixed-point test begins with the intact T; recovery begins with the damaged probe.",
  "Compare final patterns with T, rather than assuming every settled result is the intended memory."
], check: numberCheck("With the square stored as well, how many of the twelve visiting orders bring the T back?", 8, 0, "Eight visiting orders recover T after the square is added. An intact fixed point can remain stored while its damaged probe falls into another attraction region."), question: "Does remaining a fixed point guarantee recovery from a damaged pattern?" },
            ),
            exercise(
              "Run both rules on the two cells",
              [
  "Store the supplied two-cell pattern and recall the [+1,+1] probe. First use simultaneous updates with a six-pass limit, printing every state, changed-cell count, energy and stopping reason.",
  "Then run sequential recall with seeds zero through seven. Print each final state/energy/reason and count results equal to the stored pattern’s negation."
],
              `from oop_ml import BipolarPattern, Feature, HopfieldNetwork, UpdateRule

cells = [Feature("cell_1", [1]), Feature("cell_2", [-1])]
probe = BipolarPattern([1, 1])

# Fit a network with the synchronous update rule and a pass limit of 6, walk
# the probe through it, and print the starting energy, then for each pass how
# many cells moved, the state it left and its energy, then why it stopped.

# Then fit a network under the default rule for each seed from 0 to 7, walk
# the same probe, print where each rests, at what energy and why it stopped,
# and count the seeds that rest in (-1, +1).`,
              `from oop_ml import BipolarPattern, Feature, HopfieldNetwork, UpdateRule

cells = [Feature("cell_1", [1]), Feature("cell_2", [-1])]
probe = BipolarPattern([1, 1])

together = HopfieldNetwork(update_rule=UpdateRule.SYNCHRONOUS, max_passes=6).fit(cells)
walk = together.recall_walk(probe)
print(f"all at once, starting at {walk.initial_energy:+.2f}")
for sweep in walk:
    state = [int(value) for value in sweep.state_after.values]
    print(f"  pass {sweep.pass_number} moved {sweep.n_units_changed} to {state}, energy {sweep.energy_after:+.2f}")
print(f"  stopped because {walk.stopped_because.value}")

print("one at a time")
reversed_pattern = 0
for seed in range(8):
    network = HopfieldNetwork(random_seed=seed).fit(cells)
    walk = network.recall_walk(probe)
    state = [int(value) for value in walk.result.values]
    reversed_pattern += state == [-1, 1]
    print(f"  seed {seed} rests in {state} at {walk.energies[-1]:+.2f}, {walk.stopped_because.value}")
print(f"seeds resting in the stored pattern reversed {reversed_pattern}")`,
              `all at once, starting at +0.50
  pass 1 moved 2 to [-1, -1], energy +0.50
  pass 2 moved 2 to [1, 1], energy +0.50
  pass 3 moved 2 to [-1, -1], energy +0.50
  pass 4 moved 2 to [1, 1], energy +0.50
  pass 5 moved 2 to [-1, -1], energy +0.50
  pass 6 moved 2 to [1, 1], energy +0.50
  stopped because pass limit reached
one at a time
  seed 0 rests in [-1, 1] at -0.50, settled
  seed 1 rests in [-1, 1] at -0.50, settled
  seed 2 rests in [-1, 1] at -0.50, settled
  seed 3 rests in [1, -1] at -0.50, settled
  seed 4 rests in [1, -1] at -0.50, settled
  seed 5 rests in [1, -1] at -0.50, settled
  seed 6 rests in [1, -1] at -0.50, settled
  seed 7 rests in [-1, 1] at -0.50, settled
seeds resting in the stored pattern reversed 4`,
              { hints: [
  "Simultaneous updates use the previous full state for both cells; sequential updates can use the just-changed neighbor.",
  "A symmetric bipolar memory also gives its negated pattern the same energy. Settling therefore need not choose the originally named orientation."
], check: numberCheck("How many of the eight seeds rest in (−1, +1)?", 4, 0, "Four seeds settle in the stored pattern’s negation. Sequential order determines the first flip, while the simultaneous update keeps oscillating in this probe."), question: "Why can simultaneous updates loop while sequential updates settle?" },
            ),
          ],
        },
      ]}
    />
  );
}
