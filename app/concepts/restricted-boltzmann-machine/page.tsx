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
  InAModel,
  KeepInMind,
  NumberTable,
  SubSection,
  WhyThisWorks,
  WorkedExample,
} from "@/components/concept/Treatments";
import { BoltzmannContracts } from "@/components/widgets/BoltzmannContracts";
import { BoltzmannPlayground } from "@/components/widgets/BoltzmannPlayground";
import { MemoryBeside } from "@/components/widgets/MemoryBeside";
import { RebuildLadder } from "@/components/widgets/RebuildLadder";
import { SeedSpread } from "@/components/widgets/SeedSpread";
import { StateScores } from "@/components/widgets/StateScores";
import { StepLedger } from "@/components/widgets/StepLedger";
import { WidthSweep } from "@/components/widgets/WidthSweep";

export const metadata: Metadata = pageMetadata("/concepts/restricted-boltzmann-machine", {
  title: "Restricted Boltzmann Machines · Perceptron Lab",
  description:
    "A restricted Boltzmann machine relates observed values to hidden variables through a probability model. Learning their interactions provides a way to represent patterns shared across the observations.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function RestrictedBoltzmannMachinePage() {
  return (
    <ConceptPage
      lessonId="restricted-boltzmann-machine"
      intuition={lessonIntuitions["restricted-boltzmann-machine"]}
      technicalStart="Part 2. What the Word Restricted Buys"
      openingTitle="Learn What the Patterns Have in Common"
      playgroundTitle="Let visible and hidden units update one another"
      playgroundIntro="Compare the visible input, hidden responses, and reconstruction. Repeat the reconstruction to see the role of sampling rather than treating one result as guaranteed."
      title="Restricted Boltzmann Machines"
      tagline={"A restricted Boltzmann machine relates observed values to hidden variables through a probability model. Learning their interactions provides a way to represent patterns shared across the observations."}
      prerequisites={<>The <Link href="/concepts/hopfield-network" className={link}>Hopfield page</Link> introduces energy-based descriptions of patterns. An RBM changes the connection structure and gives states probabilities. Its conditional updates use the <Link href="/primers/linear-algebra" className={link}>linear algebra primer’s</Link> weighted sums and the <Link href="/concepts/logistic-regression" className={link}>sigmoid</Link>. The <Link href="/primers/statistics" className={link}>statistics primer</Link> explains distributions and expected values, which we use to describe sampling and learning.</>}

      playground={<BoltzmannPlayground />}
      sections={[
        {
          title: "Part 1. From a Stored List to a Distribution",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Where the memory page left the three shapes">
                <p>
                  The three shapes at the top of this page are the ones the{" "}
                  <Link href="/concepts/hopfield-network" className={link}>
                    associative memory page
                  </Link>{" "}
                  stored, a T, an L and a cross, each drawn on a grid of
                  twenty-five cells. That network held one weight for every pair
                  of cells, and the shapes survived inside it as a table of
                  which cells agreed with which. During recall, individual
                  cell updates reduced or preserved the network&rsquo;s energy
                  until it settled. A stored shape could be recovered, but
                  other stable patterns were also possible. Recall did not
                  guarantee the nearest stored shape.
                </p>
                <>
<p>
                  This time, the visible cells have no connections to one another. They connect to the hidden units shown as bars below the shapes. The hidden units also have no connections among themselves. Click the T and watch the hidden responses: two of the three bars rise while the other stays low. We will work out what those responses represent.
                </p>
                <p>Click the L and a different pair of hidden responses becomes large. The training procedure was never given those hidden codes as answers. It adjusted the connections so the hidden and visible units could model the training patterns together. Three hidden units provide a compact description here; they are not class labels for the three shapes.</p>
</>
                <KeepInMind>
                  The fitted model keeps connection weights and biases, rather than a separate list of training images for lookup. Those parameters are learned from the three shapes and determine probabilities for visible and hidden configurations.</KeepInMind>
              </SubSection>

              <SubSection title="2. What it means to learn a distribution">
                <p>A supervised predictor might read a person&apos;s measurements and estimate one specified target. Here the question concerns an entire grid: which arrangements should receive more probability? Twenty-five binary cells allow many possible grids, while the training set contains only three shapes. We need a model that uses those examples to describe regularities across arrangements it has not observed.</p>
                <p>A joint distribution gives a probability model for the cells together. We can use it to compare how plausible complete grids are, sample proposed grids, or condition on some cells while considering the rest. A supervised mapping can also make predictions for unseen inputs; novelty is not the distinction. The difference here is that we are modeling the whole arrangement rather than fixing one particular set of inputs and targets in advance.</p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="who can answer it"
                  rows={[
                    {
                      expression: "what answer goes with this row",
                      reason:
                        "a predictor with the specified input and output convention; many earlier models have this form.",
                    },
                    {
                      expression: "how plausible is this grid",
                      reason:
                        "a distribution. There is no target column anywhere in this page, and no answer the grids are paired with.",
                    },
                    {
                      expression: "give me a grid",
                      reason:
                        "a generative model, by sampling. A conditional predictor can also be sampled when it supplies a probability distribution.",
                    },
                    {
                      expression: "fill in the cells I have left out",
                      reason:
                        "a distribution, and for any set of missing cells rather than one fixed set chosen when the model was built.",
                    },
                  ]}
                />
                <KeepInMind>

                  The training data has no separate target labels for the hidden units. The model learns from observed arrangements and can still predict missing visible values or produce samples. We therefore need evaluation measures suited to the learned distribution, which Part 5 discusses.</KeepInMind>
              </SubSection>

              <SubSection title="3. What the hidden units are for">
                <>
<p>
                  A distribution over twenty-five cells has to say something about how the cells depend on one another, since the whole content of the three shapes is that certain cells are lit together. The obvious way to say it is the memory page&rsquo;s way, a weight for every pair, and that is three hundred numbers for twenty-five cells and grows as the square of the grid.
                </p>
                <p>Introduce hidden binary units and connect every visible cell to those units. Although visible cells have no direct connections to each other, they can become dependent through the hidden layer. A hidden state can make a combination of visible values more likely than those values would be independently.</p>
</>
                <>
<p>The hidden units receive no target meanings. Their responses are learned from repeated visible patterns. After five hundred passes here, the first unit responds strongly to the T and cross but weakly to the L. That is a useful distinction in this fit, rather than a named concept we explicitly taught the unit.</p>
                <p>The rounded hidden responses summarize the T as 110, the L as 011 and the cross as 101 in this fit. These are learned combinations of active units, not labels supplied with the training data. The reconstruction calculation uses the underlying probabilities rather than only these rounded codes.</p>
</>
                <InAModel title="What this becomes at scale">
                  <p>
                    With image data, hidden units can learn responses to recurring pixel patterns, such as strokes, though a unit need not acquire such a clear interpretation. The 2006 work explored learning further representations from these hidden activations. Our small shape example lets us inspect the first such representation directly.
                  </p>
                </InAModel>
                <KeepInMind>
                  Hidden units are binary variables that can be active together. Their conditional probabilities therefore do not have to sum to one. This differs from a softmax over mutually exclusive class labels.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. What the Word Restricted Buys",
          content: (
            <>
              <SubSection title="4. The score a joint state is given">
                <p>
                  Write v for the twenty-five cells and h for the hidden units,
                  both holding zeros and ones. Every joint state of the two gets
                  an energy, which is the memory page&rsquo;s energy with a
                  second layer and a weight of its own for every unit, and the
                  probability of a state falls off as its energy climbs.
                </p>
                <Equation>
                  {
                    "E(v, h) = −Σᵢ aᵢ·vᵢ − Σⱼ bⱼ·hⱼ − Σᵢ Σⱼ vᵢ·wᵢⱼ·hⱼ\nP(v, h) ∝ exp( −E(v, h) )"
                  }
                </Equation>
                <p>The visible biases favor individual cells being on. Hidden biases do the same for hidden units. The connection term favors or discourages a visible and hidden unit being on together, according to the weight’s sign. These contributions determine which joint configurations receive lower energy.</p>
                <KeepInMind>
                  Under this model, lower energy corresponds to higher probability after normalization. Keep that direction in mind when interpreting the energies in Part 5: a larger energy is not a stronger match.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. No wires inside a layer">
                <p>The restricted connections make conditional calculations simpler. Once the visible cells are fixed, hidden units have no direct interactions left with each other. Each can therefore be sampled from its own weighted input. The same reasoning applies to visible cells when the hidden layer is fixed.</p>
                <p>The Hopfield convergence proof used sequential cell updates because each cell depended on the others’ current states. Here, fixing one layer makes the units in the other conditionally independent. Their probabilities can be computed together with a matrix operation, followed by separate binary draws. Larger layers use the same rule but require more computation and may need longer sampling chains to mix.</p>
                <KeepInMind>
                  Connections within a layer would couple its conditional unit states. We could still sample them sequentially or enumerate a small group, but the simple product of independent binary conditionals would no longer apply. The restriction makes that particular calculation inexpensive.</KeepInMind>
              </SubSection>

              <SubSection title="6. The two conditionals, which are the whole of a pass">
                <p>
                  Because of the restriction, each hidden unit switches on
                  independently of the others with the probability the sigmoid
                  gives its own weighted sum, and each cell does the same given
                  the hidden units. Those two lines are everything the machine
                  ever does with a grid.
                </p>
                <Equation>
                  {
                    "P(hⱼ = 1 | v) = σ( bⱼ + Σᵢ vᵢ·wᵢⱼ )\nP(vᵢ = 1 | h) = σ( aᵢ + Σⱼ wᵢⱼ·hⱼ )"
                  }
                </Equation>
                <p>Alternating conditional samples produces a chain of visible and hidden states. With suitable mixing, long runs sample the model’s joint distribution. In a large model we usually cannot enumerate all those states, so conditional sampling gives us a practical way to estimate quantities under that distribution. A short run need not have reached it.</p>
                <WorkedExample title="Twenty-five cells and one hidden unit">
                  <>
                    <p>
                      Suppose hidden unit 1 gives each pixel in the top row a weight of
                      0.8 and gives every other pixel zero weight. Its bias is −2. The T
                      lights all five top-row pixels; the L lights only one.
                    </p>
                    <Equation>{"T score = 5 × 0.8 − 2 = 2\nP(unit on | T) = sigmoid(2) ≈ 0.88\n\nL score = 1 × 0.8 − 2 = −1.2\nP(unit on | L) = sigmoid(−1.2) ≈ 0.23"}</Equation>
                    <p>
                      This unit acts as a rough detector for a full top row. Its output
                      is a probability of switching on, so it need not make the same
                      sampled choice every time.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  The visible conditional lets hidden states generate candidate visible patterns. Going from a visible observation to hidden probabilities also provides a feature representation. These are two uses of the same joint probability model.</KeepInMind>
              </SubSection>

              <SubSection title="7. Why the product splits">
                <p>
                  Fix the visible cells and write zⱼ for the hidden unit&apos;s weighted input. Because hidden units have no connections to one another, each term involving a hidden unit depends only on that unit once the visible state is fixed. This is what lets the conditional distribution factor. Adding connections within the hidden layer would break that calculation.
                </p>
                <Equation>
                  {"zⱼ = bⱼ + Σᵢ vᵢ·wᵢⱼ\nE(v, h) = −Σᵢ aᵢ·vᵢ − Σⱼ hⱼ·zⱼ"}
                </Equation>
                <WhyThisWorks title="From a sum in the exponent to a product of independent choices">
                  <p>

                    An exponential of a sum is a product of exponentials, so the
                    probability of a whole hidden configuration given the cells
                    factorizes into one factor per unit, and a product that
                    factorizes is what independence means. Each unit is then a
                    two-way choice between the weight exp(0) for being off and
                    exp(zⱼ) for being on, and normalizing those two is the
                    sigmoid.
                  </p>
                  <Equation>
                    {
                      "P(h | v) ∝ Πⱼ exp( hⱼ·zⱼ )\nP(hⱼ = 1 | v) = exp(zⱼ) / ( 1 + exp(zⱼ) ) = σ(zⱼ)"
                    }
                  </Equation>
                  <p>
                    Put one wire between two hidden units and the energy grows a
                    term in hⱼ·hₗ, which belongs to both factors at once, so the
                    product no longer splits and neither unit can be settled
                    without the other. The same argument with the roles swapped
                    gives the second conditional.
                  </p>
                </WhyThisWorks>
                <KeepInMind>

                  Every shortcut on this page comes from that one factorization.
                  It is the whole of what the word restricted refers to.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "The hidden units are alternatives, so the probabilities a grid gives them add to one.",
              false,
              "Each hidden probability describes a separate binary unit, rather than one choice from a set of classes. Several units can be active together, so their probabilities need not sum to one. They are conditionally independent when the visible grid is fixed; after averaging over different grids, the hidden units need not remain independent.",
            ),
            several(
              "What does modeling a distribution buy that a mapping cannot?",
              [
                "It can be asked about a grid it has never seen and answer with a number rather than a refusal",
                "It can be asked to produce a grid, since a distribution can be drawn from",
                "It can be asked to finish a grid, filling in the missing cells from the ones that are there",
                "It keeps each of the three shapes so they can be read back cell for cell",
              ],
              [0, 1, 2],
              "A joint probability model describes possible configurations of the visible cells, with hidden units helping represent their dependencies. That gives us a basis for comparing configurations and asking conditional questions about missing cells. A fixed input-to-output mapping can also be designed for reconstruction, but it does not automatically provide that joint probability distribution.",
            ),
            choice(
              "What does the restriction buy?",
              [
                "No hidden unit’s decision depends on any other’s, so the whole layer can be redrawn at once",
                "The energy loses its term for each cell’s own preference",
                "The probability of a grid becomes computable, since the sum over grids splits",
                "The learning rule no longer needs its second count",
              ],
              0,
              "Removing within-layer connections makes hidden units conditionally independent given the visible cells, and visible cells conditionally independent given the hidden units. Each conditional update is therefore easy to calculate. Exact visible probabilities still require a normalizing sum over possible visible configurations. This API does not compute that expensive sum.",
            ),
            choice(
              "A hidden unit gives each top-row pixel a weight of 0.8 and every other pixel zero, with a bias of −2. The T lights all five top-row pixels and the L lights one. What does the unit do?",
              [
                "It switches on with probability about 0.88 for the T and about 0.23 for the L",
                "It switches on for the T and stays off for the L, every time",
                "It switches on with probability about 0.23 for the T",
                "It does nothing, since the bias cancels the weights",
              ],
              0,
              "The weighted sum comes out positive for the T and negative for the L, and the sigmoid turns those into probabilities, so the unit acts as a rough detector for a full top row. Its output is a probability of switching on rather than a decision, so it need not make the same sampled choice every time.",
            ),
            trueFalse(
              "Fixing the cells is what lets the whole hidden layer be redrawn at once, so a wire between two hidden units would not change that.",
              false,
              "A connection between two hidden units would make their conditional distribution depend on their joint states, even with the visible cells fixed. Independent sigmoid draws would no longer sample that distribution correctly. A small coupled layer could be handled by exact enumeration; a larger one may require a different inference or sampling procedure.",
            ),
        ],
        },
        {
          title: "Part 3. One Learning Step",
          content: (
            <>
              <SubSection title="8. Two counts, one subtraction">
                <p>For each connection, estimate how often its visible and hidden ends are on together when the visible layer is held at the data. Then start from the data, sample a hidden layer and a reconstructed visible layer, and estimate the association again. The update uses the difference. Stopping after this short reconstruction gives the approximation used here.</p>
                <Equation>
                  {
                    "Δwᵢⱼ = rate · ( ⟨vᵢ·hⱼ⟩ at the data − ⟨vᵢ·hⱼ⟩ after the step )\nΔaᵢ = rate · ( ⟨vᵢ⟩ at the data − ⟨vᵢ⟩ after the step )\nΔbⱼ = rate · ( ⟨hⱼ⟩ at the data − ⟨hⱼ⟩ after the step )"
                  }
                </Equation>
                <p>The data association raises support for relationships observed in the examples. The model association counteracts relationships the current model already produces. Matching the estimated associations can make a particular update zero. It does not prove that the entire learned distribution equals the data distribution, especially when the second association comes from a short sampled run.</p>
                <KeepInMind>
                  The connection update uses a difference of visible-hidden associations. It is not a backpropagated error from a separate output target. Computing the associations still depends on the current model and sampled configurations, even though the final weight update uses the pair of units it connects.</KeepInMind>
              </SubSection>

              <SubSection title="9. The step traced on four cells">
                <p>
                  Twenty-five cells and three hidden units is a table of
                  seventy-five wires, so the rule is easier to check on
                  something smaller. Take two rows of four cells, both lit in
                  the first two, both dark in the third, and differing in the
                  fourth. Two hidden units, the same rate of 0.1, and the same
                  starting weights drawn small so that every unit begins near a
                  half for every row.
                </p>
                <StepLedger />
                <>
                  <p>
                    Cell 1 is on in both observed rows. The observed association with
                    hidden unit 1 is therefore the average of that unit’s activation
                    probabilities, about 0.5035. In the two reconstructed rows, cell 1
                    is off, so the reconstructed association is zero.
                  </p>
                  <Equation>{"weight update = rate × (observed association − reconstructed association)\n              ≈ 0.1 × (0.5035 − 0)\n              ≈ 0.0504"}</Equation>
                  <p>
                    The weight moves from about 0.0013 to about 0.0516 using the
                    full-precision values. The same subtraction is performed for every
                    connection.
                  </p>
                </>
                <NumberTable
                  headings={[
                    "the first update on four cells",
                    "cell 1",
                    "cell 2",
                    "cell 3",
                    "cell 4",
                  ]}
                  rows={[
                    ["lit how often in the two rows", "1.0", "1.0", "0.0", "0.5"],
                    ["lit how often in the two drawn rows", "0.0", "0.5", "0.5", "1.0"],
                    ["change to the cell’s own weight", "+0.10", "+0.05", "−0.05", "−0.05"],
                  ]}
                  caption="The rate is 0.1 throughout, so each change is a tenth of the difference of the two rows above it."
                />
                <p>The hidden biases change by less than a thousandth on this step. At the small initial weights, their activation probabilities are close to one half for both observed and reconstructed rows, so the two estimated means nearly cancel. Later updates can make units respond more selectively, but that progression is not guaranteed to take the same number of passes in another fit.</p>
                <KeepInMind>
                  The associations are means of visible-hidden products, using conditional probabilities where the implementation can average over a binary choice. The applied update is a subtraction of those statistics. Its connection to a likelihood derivative is derived in section 11.</KeepInMind>
              </SubSection>

              <SubSection title="10. The same rule on twenty-five cells">
                <>
                  <p>
                    On the three shapes, the first connection has an observed
                    association of about 0.4967 and a reconstructed association of about
                    0.1681. Apply the same update rule.
                  </p>
                  <Equation>{"weight change ≈ 0.1 × (0.4967 − 0.1681) ≈ 0.03286\nnew weight ≈ 0.00126 + 0.03286 ≈ 0.03412"}</Equation>
                  <p>
                    Every association lies between zero and one. Their difference
                    therefore has magnitude at most one, so this update cannot change a
                    weight by more than the learning rate.
                  </p>
                </>
                <InAModel title="Why these fits are hard to blow up">
                  <p>The bounded association difference limits the size of an individual update for a given learning rate. It does not make every rate safe or useful. Large updates can saturate the probabilities or give poor learning, so inspect the resulting model instead of treating the bound as a convergence guarantee.</p>
                </InAModel>
                <KeepInMind>
                  A rule with no backward pass in it is not the same as a rule
                  with no derivative behind it. The next step is about where the
                  derivative went.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Why this is an approximation and not the gradient">
                <p>
                  The rule is not arbitrary. Differentiate the log likelihood of
                  the data with respect to a weight and the answer really is a
                  difference of two counts, the first taken with the cells held
                  at the data and the second taken under the machine&rsquo;s own
                  distribution.
                </p>
                <Equation>
                  {
                    "∂ ln P(v) / ∂wᵢⱼ = ⟨vᵢ·hⱼ⟩ at the data − ⟨vᵢ·hⱼ⟩ under the model"
                  }
                </Equation>
                <p>The data-conditioned association is easy to estimate. The exact model association averages over the model’s distribution, which is expensive to enumerate for a large grid. Sampling can estimate it, but a chain may mix slowly. This implementation instead starts at the data and stops after a single alternation, trading the exact likelihood gradient for a cheaper approximation.</p>
                <DerivationTable
                  expressionHeading="the quantity"
                  reasonHeading="what it costs and what it is"
                  rows={[
                    {
                      expression: "the first count",
                      reason:
                        "one pass up from the data. Exact, and the same in the true rule and the shortcut.",
                    },
                    {
                      expression: "the second count, as the derivative asks for it",
                      reason:
                        "the model expectation, calculated exactly in a sufficiently small model or estimated from samples that adequately explore its distribution.",
                    },
                    {
                      expression: "the second count, as it is taken here",
                      reason:
                        "the walk started at the data and stopped after one alternation. This is the substitution, and it is the whole of it.",
                    },
                    {
                      expression: "the error that leaves",
                      reason:
                        "a short-chain estimate has initialization bias as well as sampling variation. More data alone does not guarantee that the chain has mixed; the bias can also change as the fitted model changes.",
                    },
                  ]}
                />
                <p>More training examples do not by themselves make a short sampling chain reach equilibrium. Increasing the number of alternations can improve that approximation when the chain mixes sufficiently, but finite runs still have sampling error and possible bias. The number of alternations is therefore part of the training method, rather than an incidental speed setting.</p>
                <KeepInMind>
                  Contrastive divergence uses a biased approximation to the likelihood gradient. An individual update is not guaranteed to improve likelihood, and a small reconstruction error does not certify that the model distribution is good. The approximation depends on the sampling procedure and current fitted parameters.</KeepInMind>
              </SubSection>

              <SubSection title="12. When a Sampled Update Becomes Zero" id="12-what-settled-is-entitled-to-mean-here">
                <p>The fit stops at its pass budget or when the measured update is zero. A zero sampled update does not certify a likelihood optimum: the data and reconstruction associations can coincide on that draw and differ on the next. The four-cell example below separates that stopping condition from successful learning.</p>
                <WorkedExample title="A walk that stops after ten passes and has not finished">
                  <>
<p>
                    Step through the ledger in step 9 to the tenth update. The machine happens to draw exactly the two rows it was shown, so both counts are the same number for every wire, every difference is zero, and nothing moves at all. The fit therefore stops there and reports itself settled, after ten of the five hundred passes it was allowed, with the two rows still coming back at a mean squared gap of 0.1598 and the first cell rebuilt at 0.65 rather than at 1.
                  </p>
                  <p>
                    The eleventh update in the ledger shows what would have happened had it carried on, and the weights move again immediately.
                  </p>
</>
                </WorkedExample>
                <p>
                  On the three shapes the opposite happens. At five hundred
                  passes and a constant rate the fit has not settled and reports
                  so, because the drawing keeps the counts jittering, and that is
                  the ordinary case rather than a failed one. A rate that decays
                  towards zero would make it report itself settled for the
                  trivial reason that the steps had become too small to see.
                </p>
                <KeepInMind>
                  Settled here means the weights stopped moving. It does not
                  mean a best fit was found, and on a small set it can mean a
                  single lucky draw froze a machine that had barely started.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Rebuilding a Grid",
          content: (
            <>
              <SubSection title="13. What a reconstruction is">
                <p>The displayed reconstruction passes the supplied grid through the hidden representation and then computes visible probabilities from it. Each shaded cell shows a probability of being on, rather than an already-sampled binary state. Keep those probabilities separate from the samples used in the training chain.</p>
                <p>The return calculation uses the hidden representation. It does not consult an answer key identifying damaged pixels in the original grid. With three hidden numbers here, the reconstruction depends on what those numbers retained about the input and what the visible connections learned to produce from them.</p>
                <InAModel title="Twenty-five cells through three numbers">
                  <p>This displayed reconstruction maps twenty-five visible values through three hidden probabilities and back again. The smaller representation constrains the decoder, but a continuous probability vector is not limited to just eight possible values. Increasing width changes what can be represented and how training proceeds; it does not automatically produce an accurate reconstruction or distribution.</p>
                </InAModel>
                <KeepInMind>
                  A reconstruction is deterministic here, because both halves use
                  probabilities rather than draws. That is a choice made so the
                  picture is readable, and it means the return journey is
                  strictly speaking fed hidden averages rather than hidden
                  states.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Watching the damage come out">
                <p>
                  Take the T with the same five cells flipped that the memory
                  page&rsquo;s first scramble flips, and put it through machines
                  that have learned for different lengths of time. Every grid
                  below is a separate fit from the same starting weights, so the
                  fit at ten passes really is the first ten passes of the fit at
                  five hundred.
                </p>
                <RebuildLadder />
                <>
<p>For the first hundred and fifty passes in this run, the damaged-T reconstruction changes little. Eighteen of the twenty-five thresholded cells match the original T, the squared gap stays above 0.15, and at pass 150 only seventeen cells match. A plateau can occur under several optimization methods, so its shape alone does not identify contrastive divergence or prove that no learning has occurred.</p>
                <p>At two hundred passes, twenty-four cells match. At three hundred, all twenty-five match and the gap is 0.0380; by five hundred it is 0.0061. Cutting off at pass 150 would miss the later improvement in this particular reconstruction. That does not establish how much of the entire probability distribution has been learned.</p>
</>
                <p>At five hundred passes, the damaged grid’s hidden probabilities round to 110, the same summary as the T. The deterministic return calculation uses those probabilities. It restores the damaged stem cell near 0.9 and returns the four incorrectly lit cells below one tenth. The learned connections produce that reconstruction from the hidden representation; they do not look up a saved original image.</p>
                <KeepInMind>
                  Early in this fit, hidden probabilities are near one half for the shapes and the data/reconstruction associations nearly cancel. As their responses become more distinct, the measured reconstructions improve. This illustrates the development of a useful representation in this run rather than a fixed symmetry-breaking timetable.</KeepInMind>
              </SubSection>

              <SubSection title="15. A shape the machine was never shown">
                <p>
                  The damaged T is a grid the machine never saw, but it is near
                  one it did. Press the second button on the ladder above and the
                  probe becomes a square, an outline the machine was never given
                  and which is not a damaged copy of anything it was. This is
                  where a distribution and a store of originals part company.
                </p>
                <>
<p>
                  After five hundred passes the square comes back with seventeen of twenty-five cells rounding to the square itself and a gap of 0.2263, which is to say it is not rebuilt. What it reads as is 010, and that is not any of the three stored codes. Only the second hidden unit rises, which is the unit the L raises, so what returns is the L&rsquo;s stem and foot at probabilities between 0.4 and 0.8, the rest of the square&rsquo;s top row hanging around 0.45, and the square&rsquo;s side walls below a tenth.
                </p>
                <p>The square activates one part of the learned representation, leading to a partial L-like reconstruction. This is a response of the fitted conditional calculations, rather than an explicit search for whichever training shape is nearest.</p>
</>
                <KeepInMind>
                  The fitted network returns conditional probabilities for an unfamiliar grid too. That output is not automatically evidence that the grid resembles the training data. Part 5 compares free-energy scores within the same fit, while reconstruction measures a different property.</KeepInMind>
              </SubSection>

              <SubSection title="16. What the rebuilding gap is and is not">
                <p>The displayed reconstruction gap is the mean squared difference between the observed shapes and their deterministic reconstructions. It is an inexpensive diagnostic, but it is not the likelihood objective approximated by contrastive divergence. Changes in this gap and in the learned distribution need not track each other.</p>
                <DerivationTable
                  expressionHeading="what the gap can tell you"
                  reasonHeading="and what it cannot"
                  rows={[
                    {
                      expression: "it did not fall",
                      reason:
                        "this reconstruction diagnostic did not improve. Other properties of the model distribution may still have changed.",
                    },
                    {
                      expression: "it fell",
                      reason:
                        "the deterministic reconstructions became closer to those examples. That alone does not establish better likelihood or generalization.",
                    },
                    {
                      expression: "it is lower for one machine than another",
                      reason:
                        "it establishes better reconstruction on the measured examples, but not necessarily a better probability distribution. Width and the training procedure affect the result.",
                    },
                    {
                      expression: "it reached zero",
                      reason:
                        "every measured visible probability matches its target under this diagnostic. Evaluate unseen cases and the learned distribution before drawing a broader conclusion.",
                    },
                  ]}
                />
                <p>
                  On the three shapes at three hidden units it falls from 0.2437
                  after one pass to 0.0057 after five hundred, and no single
                  shape ends above 0.01. A quarter is roughly what a machine that
                  answers half for every cell scores, since each cell is then
                  half away from a nought or a one, which is why the number
                  starts there.
                </p>
                <KeepInMind>
                  Use the gap to track reconstruction quality on a stated set of examples. A decrease supports that limited claim, and a flat curve says only that this diagnostic has not improved. Judging the learned distribution requires additional evaluation.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "This update cannot change a weight by more than the learning rate.",
              true,
              "In this update, each averaged binary association lies between zero and one. The magnitude of the difference between two such averages is therefore at most one, which bounds a weight update by the learning rate. That bounds one update; repeated updates can still accumulate, and a large rate can still harm learning.",
            ),
            choice(
              "Why does the error in the second count not shrink as more data arrives?",
              [
                "What is wrong with it is where the walk was stopped, and no amount of data changes that",
                "The second count is taken from too few drawn grids",
                "The first count is biased the other way and swamps it",
                "The rate is held constant rather than decaying",
              ],
              0,
              "The model-side association estimate comes from a short chain started at the observed data, rather than an exact draw from the model’s equilibrium distribution. More training examples can reduce sampling noise without removing that approximation bias. Longer chains can improve mixing, but improvement is not guaranteed to be monotone for every finite run. Exact enumeration is possible for sufficiently small models and becomes expensive as the state space grows.",
            ),
            trueFalse(
              "On the four-cell set the fit reports itself settled after ten passes while the two rows still come back at a gap of 0.1598.",
              true,
              "The stopping rule checks the sampled update, not exact maximum-likelihood convergence. At this pass, the sampled model associations happen to match the data associations, producing a zero update and a settled flag. Reconstruction error remains 0.1598. Another random draw can produce a nonzero update, so this flag does not prove the model distribution or reconstructed probabilities have stopped changing.",
            ),
            choice(
              "What does the return journey of a reconstruction have to work from?",
              [
                "The code the hidden units settled on, with the probe no longer in the picture",
                "The probe’s cells together with the code",
                "Whichever of the three shapes the probe is nearest to",
                "The free energy the probe scored on the way up",
              ],
              0,
              "The reconstruction stage uses the hidden representation to calculate visible-cell probabilities. It does not retain a separate direct copy of every original pixel or automatically clamp known cells during reconstruction. A narrow representation can lose distinctions between grids. Returning plausible cell probabilities is therefore different from guaranteeing repair of the input pattern.",
            ),
            choice(
              "A fit on the damaged T is cut short at a hundred and fifty passes. What does it report?",
              [
                "Seventeen of the twenty-five cells on the undamaged T and a gap above 0.15, from a machine most of the way to learning everything",
                "Twenty-four cells on the T, since the collapse begins at a hundred passes",
                "All twenty-five cells, since the damaged T reads as 110 from the first pass",
                "A gap of 0.0380, about halfway between the start and the finish",
              ],
              0,
              "At 150 passes the reconstructed grid still has substantial error, while this same run improves later. A flat early reconstruction curve does not establish that learning has finished. Hidden units can change their roles during training, but these measurements alone do not identify one unique cause of the delay. Gradient-based training can also have plateaus.",
            ),
        ],
        },
        {
          title: "Part 5. What a Grid Is Scored By",
          content: (
            <>
              <SubSection title="17. Free Energy and Relative Probability" id="17-the-score-and-the-reason-it-has-no-zero">
                <p>To compare visible grids, sum over the hidden configurations in the probability model. The restriction lets that sum be calculated without listing every hidden state. Its negative logarithm, before the shared normalization constant, is the free energy. Lower free energy means a grid has higher probability under this fitted model.</p>
                <Equation>
                  {"F(v) = −Σᵢ aᵢ·vᵢ − Σⱼ ln( 1 + exp( bⱼ + Σᵢ vᵢ·wᵢⱼ ) )"}
                </Equation>
                <p>A normalized probability divides exp(−F) by a sum over possible visible grids, called the partition function. The widget does not calculate that normalizer, so it shows free-energy comparisons within one fit instead. A single score has no universal cutoff separating familiar from unfamiliar inputs, and scores from different fits need not be directly comparable.</p>
<p>Exact normalization can be practical for a small RBM. Instead of listing all thirty-three million visible grids here, we could sum over the eight hidden states and factor the visible contributions. It becomes expensive when both layers are large. The current display chooses not to perform that calculation; it is not mathematically unavailable in this example.</p>
                <Equation>{"P(v) = exp( −F(v) ) / Σᵤ exp( −F(u) )"}</Equation>
                <KeepInMind>
                  Negative log probability equals free energy plus a fitted model’s log partition function. That constant is shared by all grids under the same fit. Differences in free energy therefore equal differences in negative log probability: lower free energy means higher probability. Comparing different fits also requires accounting for their different normalizers.</KeepInMind>
              </SubSection>

              <SubSection title="18. The ordering, measured">
                <p>
                  So the question is what the ranking looks like once the machine
                  has learned. Five grids go to one fit on the three shapes at
                  three hidden units after five hundred passes, and each one is
                  drawn beside what comes back from it.
                </p>
                <StateScores />
                <p>After training, the T has free energy −24.50, the L −24.78 and the cross −23.88. The damaged T is higher at −11.82, so this fit assigns it lower probability than those training shapes. The random scatter scores −3.71, the square −0.77 and the reversed T +2.06. Their order compares compatibility under the learned distribution. Crossing zero or halving an energy value has no special probability interpretation.</p>
                <>
<p>The square receives a worse score than the random scatter. The score measures compatibility with the learned distribution, rather than how much a grid resembles an organized shape to us. A shape absent from training can disagree with the learned relationships more strongly than an unstructured pattern does.</p>
                <p>
                  And the ordering has to be earned. At one pass all five grids score within a tenth of one another, and the damaged T is actually below one of the stored shapes; the probe only rises above every stored shape from about a hundred passes on.
                </p>
</>
                <KeepInMind>
                  A grid the machine never saw can be scored, and the score is
                  comparable with a grid it did see. That single fact is what a
                  distribution has and a list of stored originals does not.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Summing the hidden layer out">
                <p>
                  The closed form is worth deriving once, because it is the only
                  place on the page where the restriction pays off in a way that
                  looks like algebra rather than like speed.
                </p>
                <WhyThisWorks title="Why a sum over 2ⁿ hidden states is a product of n terms">
                  <p>

                    Take the energy with the cells fixed and zⱼ as before. The
                    sum over every hidden configuration factorizes for the same
                    reason the conditional did, and each unit contributes its two
                    states, 1 for off and exp(zⱼ) for on. The sum over all 2ⁿ
                    configurations is therefore the product of n small sums, and
                    the negative logarithm of a product is the sum of the
                    logarithms.
                  </p>
                  <Equation>
                    {
                      "Σₕ exp( −E(v, h) ) = exp( Σᵢ aᵢ·vᵢ ) · Πⱼ ( 1 + exp(zⱼ) )\nF(v) = −ln Σₕ exp( −E(v, h) ) = −Σᵢ aᵢ·vᵢ − Σⱼ ln( 1 + exp(zⱼ) )"
                    }
                  </Equation>
                  <p>
                    With eight hidden units that turns a sum over 256 states into
                    eight logarithms, and with eight hundred it turns a sum over a
                    number with 241 digits in it into eight hundred logarithms.
                    Put one wire between two hidden units and the product stops
                    splitting and the sum has to be done as written.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The hidden-state sum for a fixed visible grid factors into a closed-form free energy. Obtaining normalized probabilities also requires the partition function. That can be evaluated in small RBMs, including by enumerating hidden states, but is expensive for large layers. This SDK display reports free energies rather than normalized grid probabilities.</KeepInMind>
              </SubSection>

              <SubSection title="20. The one figure that can be checked by hand">
                <p>Set the connection weights and both bias sets to zero. Each hidden weighted input is then zero, so each softplus term equals ln 2 and the visible-bias term is zero. With three hidden units, the free energy is the same for every visible grid and can be checked directly.</p>
                <Equation>{"F = −3 · ln 2 = −3 · 0.6931 = −2.0794"}</Equation>
                <>
<p>Small random connection weights give hidden units different starting responses. This fit draws them with a spread of 0.01 and initializes both sets of biases at zero. The hollow bars show that starting configuration using a pass with zero learning rate. Random initialization avoids relying on training noise alone to separate initially identical units.</p>
                <p>
                  They come out at −2.08 for the T and −2.10 for the L and the cross, and the damaged probe at −2.07, each within the noise in those starting weights of the hand figure.
                </p>
</>
                <WorkedExample title="Where the −2.08 rather than −2.0794 comes from">
                  <>
<p>
                    The starting weights are drawn from a normal spread of 0.01, so a cell&rsquo;s weighted sum into a hidden unit is a sum of up to twenty-five such numbers and lands within a few hundredths of zero rather than at it. Each logarithm is then ln(1 + exp(small)) rather than ln 2 exactly, and three of them move the total by a hundredth or two.
                  </p>
                  <p>At one learning pass, the solid free-energy bars remain close to the initial hollow bars. That is an observed small change in this diagnostic, rather than a bound on every individual parameter update. Section 9 shows that a connection can change by more than its small initial magnitude.</p>
</>
                </WorkedExample>
                <KeepInMind>
                  Before any learning every grid scores about the same, which is
                  the machine saying it has no opinion yet. The whole spread in
                  step 18 was made by the five hundred passes.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Choosing the Width, and What the Seed Fixes",
          content: (
            <>
              <SubSection title="21. How many hidden units are enough">
                <p>The hidden-layer width is a configuration choice. The comparison below changes that width while keeping the data, seed and five-hundred-pass budget fixed. Every bar is a new fit, so the result includes both the effect of available representation and the learning path taken at that width.</p>
                <WidthSweep />
                <p>In this run, one hidden unit gives all three shapes the rounded code 1 and a reconstruction gap of 0.1700, with none rebuilt cell for cell. Two units give three distinct rounded codes and reduce the gap to 0.0351, rebuilding two shapes. Three units reach 0.0057 and rebuild all three. The decoder uses continuous hidden probabilities, so identical rounded codes alone do not prove that the underlying representations are identical.</p>
                <p>Two binary hidden units have four possible joint states, and three have eight. The rounded codes 110, 011 and 101 illustrate simultaneous activation rather than one unit per class. Those binary-state counts help describe the probability model. They do not count all possible hidden-probability vectors used by this deterministic reconstruction.</p>
                <KeepInMind>
                  A narrow hidden layer can limit which distributions and reconstructions the model represents. Compare its actual outputs and evaluation results; counting rounded hidden codes is only one diagnostic and does not establish every representation limit.</KeepInMind>
              </SubSection>

              <SubSection title="22. Wider is not reliably better">
                <p>Increasing hidden width does not lower the measured reconstruction gap at every step in this experiment. Five units give 0.0165, compared with 0.0042 for four and 0.0057 for three. Six gives 0.0052, seven 0.0024 and eight 0.0030. Additional capacity changes what the model can represent, while the initialization and finite training procedure affect what it actually learns.</p>
                <NumberTable
                  headings={["hidden units", "gap on the three shapes", "shapes rebuilt cell for cell"]}
                  rows={[
                    ["1", "0.1700", "0 of 3"],
                    ["2", "0.0351", "2 of 3"],
                    ["3", "0.0057", "3 of 3"],
                    ["4", "0.0042", "3 of 3"],
                    ["5", "0.0165", "3 of 3"],
                    ["7", "0.0024", "3 of 3"],
                  ]}
                  caption="Every row is a fresh fit from the same seed for five hundred passes, so the only thing that differs is the width."
                />
                <>
<p>At width three, this run already reconstructs all three shapes after thresholding. Wider models can still change the probabilities and learned distribution. Their differences also reflect initialization and finite training. The reconstruction gap varies by 0.0157 across six seeds at width three, compared with 0.0141 across the tested widths from three to eight under one seed. These comparisons show sensitivity to the setup without isolating a single cause.</p>
                <p>A gap of 0.0024 demonstrates more accurate deterministic reconstruction on these examples than 0.0057. It does not alone establish higher likelihood, better samples or better predictions on new inputs. Those questions need their own measurements.</p>
</>
                <KeepInMind>
                  Choose width using the behavior the application needs, including performance beyond the fitted examples. Repeat promising settings under more than one seed. A smaller representation may be useful, but distinct rounded training codes alone are not enough to select it.</KeepInMind>
              </SubSection>

              <SubSection title="23. What a seed fixes">
                <p>
                  Every fit on this page starts from small random weights and
                  draws a coin for every unit at every pass, so a seed decides
                  quite a lot. The clean way to find out how much is to fit the
                  same shapes six times under six seeds, and then fit the first
                  one a second time.
                </p>
                <SeedSpread />
                <p>Repeating the same seed and setup gives identical matching weights in this experiment, with largest gap 0.0 and equal reconstruction gaps. Changing the seed produces matching-position weight differences as large as 5.25. Reproduction therefore needs the seed together with the data, configuration, implementation and sequence of random operations. The seed does not determine the model independently of those choices.</p>
                <KeepInMind>
                  Every figure quoted on this page is quoted under one seed and
                  is reproducible only because of it. That is the right way round
                  for a teaching page and the wrong way round for a claim about
                  the method.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. What survives a change of seed, and what does not">
                <p>
                  What survives is the job getting done. Every one of the six
                  seeds gives the three shapes three different codes, and the gap
                  on the shapes runs from 0.0057 to 0.0215 across them, a spread
                  of 0.0157, so the worst seed is about four times the best and
                  all six have learned to tell the shapes apart.
                </p>
                <p>The T’s rounded code is 110 under the first seed and 011 under the second. No target meaning was assigned to either hidden coordinate. Permuting the hidden units and their matching parameters preserves an RBM’s distribution, but independent fits need not differ only by a permutation. A downstream model must stay paired with the representation on which it was trained.</p>
                <InAModel title="Why that matters once the codes are used">
                  <p>A later predictor can use the hidden codes as features, but those codes belong to this fitted representation. Another fit can assign different meanings to its hidden units. Keep the representation paired with any downstream model trained on it; replacing one without refitting the other can silently change the input meaning.</p>
                </InAModel>
                <KeepInMind>
                  A hidden unit&rsquo;s meaning is fixed by one fit and by
                  nothing more general than that. Two correct fits can agree
                  entirely about which shapes differ and disagree about every
                  number they use to say so.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Comparing Recall and Reconstruction", id: "part-7-beside-the-memory-that-stores-exactly",
          content: (
            <>
              <SubSection title="25. The same shapes given to both">
                <p>Give both fitted models the same probe grids and compare their outputs. Hopfield recall updates a binary state through learned pairwise connections until it settles or reaches a budget. The RBM display maps a visible probe to hidden probabilities and then to reconstructed visible probabilities. Neither procedure directly looks up the nearest image in a retained list.</p>
                <MemoryBeside />
                <>
<p>For the five probes shown here, Hopfield recall reaches one of the stored shapes or a negation. Other probes can reach spurious states or stop at the pass limit. The RBM reconstruction gives probabilities; three displayed results round to a training shape and two do not. These are outcomes of the selected fits and cues, rather than all outputs each model is allowed to produce.</p>
                <p>
                  The square is where they part most clearly. The memory falls into the L exactly, while the machine gives back a grid that is mostly the L with the rest of the square&rsquo;s top row hanging around a half and nothing else of the square surviving, and nobody stored that grid.
                </p>
</>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="the two answers"
                  rows={[
                    {
                      expression: "what can come out",
                      reason:
                        "Hopfield recall returns a binary state, which may be stored, negated, spurious or unfinished. The RBM display returns visible probabilities computed from its fitted parameters.",
                    },
                    {
                      expression: "a probe near a stored shape",
                      reason:
                        "both recover the displayed damaged T under these fitted settings; this is not guaranteed for every nearby cue.",
                    },
                    {
                      expression: "a probe near nothing",
                      reason:
                        "either model still returns a result. Check the Hopfield state and stopping record; compare the RBM free energy with reference inputs from the same fit. Neither output alone certifies a familiar input.",
                    },
                    {
                      expression: "how confident it is",
                      reason:
                        "the memory has no notion of it. The machine has one number per grid, and Part 5 is what that number can and cannot say.",
                    },
                  ]}
                />
                <KeepInMind>
                  The models answer different questions. Hopfield recall can be useful for repairing cues when the stored patterns and their attraction regions support it. An RBM models a probability distribution and can also provide hidden features or samples. Choose and evaluate the behavior needed by the application rather than assuming a fixed list of possible images guarantees correct Hopfield recall.</KeepInMind>
              </SubSection>

              <SubSection title="26. A grid and its reversal">
                <p>The zero-bias Hopfield energy shown earlier is unchanged when every bipolar cell is reversed. If a pattern is a fixed point, its negation is too. The RBM’s learned biases and cross-layer interactions do not enforce that same complement symmetry. That is a difference in model constraints, rather than a universal consequence of using different numerical encodings.</p>
                <p>Across the five measured grids, Hopfield’s largest energy difference between a grid and its reversal is 0.0, while the RBM’s largest free-energy difference is 26.57. The T and reversed T score −24.50 and +2.06 under this RBM, compared with −11.20 for both under Hopfield. This fitted RBM assigns the two grids different probabilities. Its learned biases and connections determine that asymmetry.</p>
                <WhyThisWorks title="Where the symmetry goes">
                  <>
<p>Reversing all bipolar Hopfield states multiplies each pairwise term by two minus signs, leaving the energy unchanged. In the RBM, complementing a visible state replaces v with one minus v. The visible-bias sum and hidden weighted inputs generally change, so the resulting free energy need not be equal. Particular RBM parameters can still make a symmetric distribution.</p>
                  <p>The RBM formula permits asymmetry; it does not require it. For example, zero weights and zero biases give every visible binary grid the same probability.</p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  This fitted RBM distinguishes the T from its complement, while the zero-bias Hopfield model enforces equal energies for negated states. The difference comes from the allowed energy terms and fitted parameters. Recoding binary states alone would not remove or create the same symmetry.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Recording the Sampling and Learning Choices" , id: "part-8-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="27. The machine state needed to reproduce a training run" id="27-what-a-complete-implementation-must-specify">
                <p>Reproducing a fit requires its unit convention, connection and bias initialization, sampling procedure and stopping rules. The list pairs those choices with the settings used here. Different choices can change the model even when its hidden-layer width is unchanged.</p>
                <DerivationTable
                  expressionHeading="what must be stated"
                  reasonHeading="what is chosen here"
                  rows={[
                    {
                      expression: "how many hidden units",
                      reason:
                        "given rather than learned, three for the shapes on this page and a slider in the playground.",
                    },
                    {
                      expression: "how the weights start",
                      reason:
                        "normal noise with a spread of 0.01 and both sets of unit weights at zero. Identical weights would leave every unit computing one function forever.",
                    },
                    {
                      expression: "how many alternations before the second count",
                      reason:
                        "one in this implementation. More alternations can reduce initialization bias when the chain mixes, while a finite estimate can retain sampling variation and bias.",
                    },
                    {
                      expression: "whether the chain samples",
                      reason:
                        "it does. Passing probabilities forward instead would make it a deterministic map with a fixed point rather than a walk over grids.",
                    },
                    {
                      expression: "whether the counts sample",
                      reason:
                        "they do not. The expected value estimates the same quantity as a draw from it and carries less noise.",
                    },
                    {
                      expression: "the rate, and whether it decays",
                      reason:
                        "a constant 0.1 throughout. A decaying rate may trigger an update-size tolerance without establishing a likelihood optimum.",
                    },
                    {
                      expression: "how the rows are grouped",
                      reason:
                        "one update per pass over all the rows at once. Splitting them into small batches is the standard practical choice and is left out.",
                    },
                    {
                      expression: "what settled means, and what it does not",
                      reason:
                        "no single number moved further than a tolerance in a whole pass. Nothing about a best fit is claimed, and step 12 shows a walk stopping after ten passes.",
                    },
                    {
                      expression: "what values a cell may hold",
                      reason:
                        "anything from nought to one, with a value in between read as a mean rather than a state. This page&rsquo;s own grids only ever send nought or one.",
                    },
                    {
                      expression: "what the seed fixes",
                      reason:
                        "the initialization and subsequent random sequence under the same implementation, configuration and call order.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of those are usually left implicit and both change the
                  answer. Whether the chain samples decides what the second count
                  is even a count of, and how many alternations are run decides
                  how far the step is from the gradient it is standing in for.
                </KeepInMind>
              </SubSection>

              <SubSection title="28. Every edge, probed rather than asserted">
                <p>
                  Here is the list of edges the page claims to handle, with what
                  each one should do. Underneath it is the same list run against
                  the machine behind this page when you loaded it, so the two can
                  be read against each other rather than taken on trust.
                </p>
                <DerivationTable
                  expressionHeading="Visible-cell or sampling condition"
                  reasonHeading="What the binary model can accept"
                  rows={[
                    {
                      expression: "a cell holding 2, or −1",
                      reason:
                        "refused, since a value outside nought to one has no reading in a score written for switches.",
                    },
                    {
                      expression: "a cell holding 0.5",
                      reason:
                        "accepted, and read as a mean rather than a state, which is how a gray pixel is used.",
                    },
                    {
                      expression: "a cell holding a value that is not a number",
                      reason:
                        "refused, before any weight is drawn.",
                    },
                    {
                      expression: "one pattern only",
                      reason:
                        "accepted, since a distribution over one row is still a distribution.",
                    },
                    {
                      expression: "patterns of differing widths",
                      reason:
                        "refused, naming which two disagreed and by how much.",
                    },
                    {
                      expression: "no patterns at all",
                      reason: "refused, since there is nothing to learn from.",
                    },
                    {
                      expression: "more hidden units than cells",
                      reason:
                        "accepted, and produces a description wider than the thing described.",
                    },
                    {
                      expression: "no hidden units, or no learning passes",
                      reason:
                        "refused at construction, before any data is looked at.",
                    },
                    {
                      expression: "a learning rate of zero",
                      reason:
                        "accepted, and the walk stops after a single pass calling itself settled, which is correct and misleading at once.",
                    },
                    {
                      expression: "a negative learning rate",
                      reason:
                        "refused by this implementation’s nonnegative-rate requirement. Reversing the update sign is not a guarantee of unbounded weights.",
                    },
                    {
                      expression: "a weight read, or a rebuild asked for, before learning",
                      reason:
                        "refused, saying that the machine has to be learned from patterns first.",
                    },
                    {
                      expression: "a probe of the wrong width",
                      reason:
                        "refused, with the two counts of cells named.",
                    },
                    {
                      expression: "a probe naming a cell that was never there",
                      reason:
                        "refused, and separately from the width, since the counts can match while the names do not.",
                    },
                    {
                      expression: "a probe with its cells reordered",
                      reason:
                        "accepted, and answers identically, since cells are matched by name rather than by position.",
                    },
                    {
                      expression: "hidden units handed in where cells were wanted",
                      reason:
                        "refused, since the two layers are asked for by name and they are different names.",
                    },
                    {
                      expression: "a cell that is dark in every pattern",
                      reason:
                        "accepted; the RBM rule does not divide by the feature’s variance. Other models can also support constant features with suitable conventions.",
                    },
                    {
                      expression: "a setting the machine does not have",
                      reason:
                        "refused rather than quietly ignored, which is the failure that produces a run at a default nobody chose.",
                    },
                  ]}
                />
                <BoltzmannContracts />
                <p>The boundary checks reflect different mathematical requirements. For the binary-unit formulation, values must lie in the supported range. The implementation also accepts fractional values in that range as mean activations, which allows gray pixels to be supplied without pretending they are sampled binary states.</p>
<p>Shape and configuration checks occur before fitting. Unknown settings are rejected so a caller cannot silently run a default configuration instead of the one intended.</p>
<p>Some unusual inputs remain valid. A single pattern can define an empirical distribution. A column that is always zero need not cause division by a feature spread. More hidden units than visible units are also permitted, although the resulting hidden representation is wider than its input.</p>
                <p>A zero learning rate leaves every parameter unchanged and can satisfy the update-size stopping test immediately. That is a no-update run, not evidence of a trained optimum. A probe whose named cells arrive in a different order is another accepted case: the implementation deliberately restores fitted name order. That matching supports equivalent inputs; it does not detect a measurement assigned the wrong name.</p>
                <KeepInMind>
                  An accepted input tells us that a computation is supported, rather than that the resulting model is useful. Check the stopping reason, the data convention and the relevant evaluation measure. Constant features and named reordering can be valid; a zero-rate run simply needs to be identified as such.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 8",
          quiz: [
            several(
              "Which of these hold for the free energy?",
              [
                "Lower means the machine finds the grid more plausible",
                "For comparing grids within one fixed model, free-energy differences determine probability ratios without knowing the partition function",
                "The sum done in closed form is the one over the hidden layer, not the one over the cells",
                "With eight hidden units it turns a sum over 256 hidden states into eight logarithms"
              ],
              [0, 1, 2, 3],
              "Free energy sums out the hidden configurations. Lower free energy means greater visible probability within one fitted model. For two grids, the shared normalizing constant cancels:\n\n```math\nlog[p(v₁) / p(v₂)] = F(v₂) − F(v₁)\n```\n\nThe restricted connections let the hidden-state sum factorize. Obtaining an absolute probability still requires the visible-state normalizing constant, which this API does not calculate.",
              {
                "description": "Use a binary restricted Boltzmann machine with conditionally independent hidden units. Its visible probability is p(v) = exp(−F(v)) / Z, where the same Z normalizes every visible grid under this fixed model. There are eight hidden units."
              },
            ),
            trueFalse(
              "The ranking of free energies after five hundred passes is a ranking of how shape-like a grid looks.",
              false,
              "The fitted model assigns the random scatter lower free energy than the unseen square. Its ranking reflects the distribution learned from these training grids, not a general human judgment of how recognizable a shape is. Check the training examples and the intended use before interpreting that ranking.",
            ),
            choice(
              "How should the width of the hidden layer be chosen?",
              [
                "Take the smallest width that keeps the things you care about apart, and treat differences above it as noise",
                "Take the width with the smallest gap, since the gap falls as the width grows",
                "Take one unit per shape, so each shape can claim a unit of its own",
                "Take the widest layer affordable, since a wider description is always a better one",
              ],
              0,
              "One unit reads all three shapes as 1, so the gap stays at 0.1700 and none of the three is rebuilt, while two units offer four codes and the gap falls to 0.0351. Above three units the curve is not monotone, since five score 0.0165 against four at 0.0042, and the spread across six seeds at a fixed width of three is 0.0157, larger than the 0.0141 the whole sweep from three units to eight covers.",
            ),
            several(
              "Which of these hold of the machine behind this page?",
              [
                              "A rate of zero is accepted, and the walk then stops after a single pass calling itself settled",
                              "A probe with its cells given in a different order is accepted and answers identically",
                              "A grid and its reversal score identically, as they do under the memory",
                              "A cell that is dark in every pattern is refused, since a column that never varies has no spread to divide by",
                            ],
              [0, 1],
              "With zero rate the parameters do not move, so this stopping test reports convergence without learning. Reordering correctly named columns preserves the query; this is deliberate column matching, not a reordering bug. A mislabeled column can still be wrong. Constant zero columns are ordinary binary observations. Complementing a binary image is not an RBM symmetry in general.",
              {
                "description": "This SDK matches probe columns by cell name, not arrival order. It accepts zero learning rate and constant-valued visible columns. Its convergence test checks parameter movement. Unlike a sign-symmetric Hopfield memory, an RBM can assign different probabilities to a binary grid and its complement."
              },
            ),
            trueFalse(
              "Two RBMs can assign identical visible probabilities while giving their hidden units different coordinate labels.",
              true,
              "Permuting the hidden units together with their biases and connecting weights leaves the visible model unchanged. The hidden code coordinates are therefore not automatically aligned between fits. A downstream model that reads one fit’s codes needs a compatible coordinate order; equality of visible probabilities alone does not supply it.",
            ),
        ],
        },
        {
          title: "Practice. Learning the Three Shapes With the Library",
          practice: [
            exercise(
              "Learn the three shapes and read their codes",
              [
  "Fit the supplied binary shape dataset with three hidden units, five hundred passes, constant rate 0.1 and seed zero.",
  "Print the hidden code for T, L and cross, mean squared reconstruction difference, passes run and convergence flag. Keep the code-threshold and reconstruction conventions used in the starter."
],
              `from oop_ml import Feature, RestrictedBoltzmannMachine

T = [int(cell == "#") for cell in "#####..#....#....#....#.."]
L = [int(cell == "#") for cell in "#....#....#....#....#####"]
CROSS = [int(cell == "#") for cell in "#...#.#.#...#...#.#.#...#"]
shapes = [T, L, CROSS]
cells = [Feature(f"cell_{position + 1}", [shape[position] for shape in shapes]) for position in range(25)]

# Construct the machine with three hidden units, five hundred passes and a seed
# of 0, fit it to the cells, then print each shape's code, the mean squared
# gap on the three shapes, the passes run and whether the walk settled.`,
              `from oop_ml import Feature, RestrictedBoltzmannMachine

T = [int(cell == "#") for cell in "#####..#....#....#....#.."]
L = [int(cell == "#") for cell in "#....#....#....#....#####"]
CROSS = [int(cell == "#") for cell in "#...#.#.#...#...#.#.#...#"]
shapes = [T, L, CROSS]
cells = [Feature(f"cell_{position + 1}", [shape[position] for shape in shapes]) for position in range(25)]

machine = RestrictedBoltzmannMachine(n_hidden_units=3, max_epochs=500, random_seed=0)
machine.fit(cells)

for name, probabilities in zip(["T", "L", "cross"], machine.hidden_probabilities(cells).values):
    code = "".join(str(round(float(value))) for value in probabilities)
    print(f"the {name} reads as {code}")
print(f"mean squared gap on the three shapes {machine.reconstruction_error(cells):.4f}")
print(f"passes run {machine.epochs_run}, settled {machine.converged}")`,
              `the T reads as 110
the L reads as 011
the cross reads as 101
mean squared gap on the three shapes 0.0057
passes run 500, settled False`,
              { hints: [
  "The fitted model’s hidden activations and thresholded code are different representations.",
  "A good reconstruction does not imply that the training stopping condition was met."
], check: numberCheck("What mean squared gap does the fit report on the three shapes?", 0.0057, 0.0001, "The reconstruction mean squared difference is about 0.0057. The fit reaches its pass ceiling while reporting that its convergence criterion was not met."), question: "Which hidden codes does this small generative model learn for the three shapes?" },
            ),
            exercise(
              "Score five grids the machine never saw",
              [
  "Use the unchanged fitted model to print free energies of the supplied T, damaged T, random grid, square and reversed T.",
  "Print the damaged-T versus T free-energy difference and the corresponding probability ratio. Use full-precision energies for the ratio rather than their two-decimal display values."
],
              `from math import exp

from oop_ml import Feature, RestrictedBoltzmannMachine

T = [int(cell == "#") for cell in "#####..#....#....#....#.."]
L = [int(cell == "#") for cell in "#....#....#....#....#####"]
CROSS = [int(cell == "#") for cell in "#...#.#.#...#...#.#.#...#"]
shapes = [T, L, CROSS]
cells = [Feature(f"cell_{position + 1}", [shape[position] for shape in shapes]) for position in range(25)]
SQUARE = [int(cell == "#") for cell in "######...##...##...######"]
DAMAGED_T = [1 - value if position in (5, 7, 8, 23, 24) else value for position, value in enumerate(T)]
SCATTER = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1]
REVERSED_T = [1 - value for value in T]

machine = RestrictedBoltzmannMachine(n_hidden_units=3, max_epochs=500, random_seed=0).fit(cells)
probes = {"the T": T, "the T with five cells flipped": DAMAGED_T, "thirteen cells at random": SCATTER, "the square": SQUARE, "the T reversed": REVERSED_T}
# Build one block of features over the same cell names holding the five grids,
# print each grid's free energy to two places, then print how far the damaged T
# sits above the T and the exponential of that difference.`,
              `from math import exp

from oop_ml import Feature, RestrictedBoltzmannMachine

T = [int(cell == "#") for cell in "#####..#....#....#....#.."]
L = [int(cell == "#") for cell in "#....#....#....#....#####"]
CROSS = [int(cell == "#") for cell in "#...#.#.#...#...#.#.#...#"]
shapes = [T, L, CROSS]
cells = [Feature(f"cell_{position + 1}", [shape[position] for shape in shapes]) for position in range(25)]
SQUARE = [int(cell == "#") for cell in "######...##...##...######"]
DAMAGED_T = [1 - value if position in (5, 7, 8, 23, 24) else value for position, value in enumerate(T)]
SCATTER = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1]
REVERSED_T = [1 - value for value in T]

machine = RestrictedBoltzmannMachine(n_hidden_units=3, max_epochs=500, random_seed=0).fit(cells)
probes = {"the T": T, "the T with five cells flipped": DAMAGED_T, "thirteen cells at random": SCATTER, "the square": SQUARE, "the T reversed": REVERSED_T}
block = [Feature(f"cell_{position + 1}", [grid[position] for grid in probes.values()]) for position in range(25)]
energies = [float(value) for value in machine.free_energy(block)]

for name, energy in zip(probes, energies):
    print(f"{name:>29} {energy:+.2f}")
difference = energies[1] - energies[0]
print(f"the damaged T sits {difference:.4f} above the T")
print(f"the machine finds the T {exp(difference):.0f} times as probable as the damaged T")`,
              `                        the T -24.50
the T with five cells flipped -11.82
     thirteen cells at random -3.71
                   the square -0.77
               the T reversed +2.06
the damaged T sits 12.6836 above the T
the machine finds the T 322422 times as probable as the damaged T`,
              { hints: [
  "Both patterns share the same fitted model, so its unknown normalizing constant cancels in their probability ratio.",
  "Lower free energy means higher model probability. Use the sign of that relationship before exponentiating the difference."
], check: numberCheck("How many times as probable as the damaged T does the machine find the T?", 322422, 1, "The complete T is about 322422 times as probable under this fitted model. The comparison uses its free-energy difference, not an independently known absolute probability."), question: "How does the fitted model rank complete and damaged grids?" },
            ),
            exercise(
              "Measure the width instead of guessing it",
              [
  "Refit the same three shapes with hidden widths one through eight, retaining seed zero, five hundred passes and all other settings.",
  "Print mean squared reconstruction difference and distinct thresholded code count for every width. This is a fixed-budget comparison, not a search proving the best possible objective at each width."
],
              `from oop_ml import Feature, RestrictedBoltzmannMachine

T = [int(cell == "#") for cell in "#####..#....#....#....#.."]
L = [int(cell == "#") for cell in "#....#....#....#....#####"]
CROSS = [int(cell == "#") for cell in "#...#.#.#...#...#.#.#...#"]
shapes = [T, L, CROSS]
cells = [Feature(f"cell_{position + 1}", [shape[position] for shape in shapes]) for position in range(25)]

for width in range(1, 9):
    # Fit a machine of this width for five hundred passes from seed 0, count
    # the distinct codes the three shapes get, and print both beside the gap.
    pass`,
              `from oop_ml import Feature, RestrictedBoltzmannMachine

T = [int(cell == "#") for cell in "#####..#....#....#....#.."]
L = [int(cell == "#") for cell in "#....#....#....#....#####"]
CROSS = [int(cell == "#") for cell in "#...#.#.#...#...#.#.#...#"]
shapes = [T, L, CROSS]
cells = [Feature(f"cell_{position + 1}", [shape[position] for shape in shapes]) for position in range(25)]

for width in range(1, 9):
    machine = RestrictedBoltzmannMachine(n_hidden_units=width, max_epochs=500, random_seed=0).fit(cells)
    codes = {"".join(str(round(float(value))) for value in row) for row in machine.hidden_probabilities(cells).values}
    print(f"{width} hidden units: gap {machine.reconstruction_error(cells):.4f}, {len(codes)} distinct codes")`,
              `1 hidden units: gap 0.1700, 1 distinct codes
2 hidden units: gap 0.0351, 3 distinct codes
3 hidden units: gap 0.0057, 3 distinct codes
4 hidden units: gap 0.0042, 3 distinct codes
5 hidden units: gap 0.0165, 3 distinct codes
6 hidden units: gap 0.0052, 3 distinct codes
7 hidden units: gap 0.0024, 3 distinct codes
8 hidden units: gap 0.0030, 3 distinct codes`,
              { hints: [
  "Count unique complete hidden codes, not individually active bits.",
  "A wider model and a particular finite optimization run are separate factors; inspect the measured errors rather than expecting monotonicity."
], check: numberCheck("What mean squared gap do two hidden units reach?", 0.0351, 0.0001, "Two hidden units give error about 0.0351 and distinct codes for the three supplied shapes. A distinct code is possible before reconstruction becomes nearly exact."), question: "Does giving the model more hidden units always improve this finite training run?" },
            ),
            exercise(
              "Watch a fit call itself settled",
              [
  "Fit the supplied two four-cell observations with two hidden units, seed zero and a five-hundred-pass ceiling.",
  "Print actual passes, settled flag, mean squared reconstruction difference and every reconstructed cell for the first observation. Compare the stopping decision with the remaining reconstruction error."
],
              `from oop_ml import Feature, RestrictedBoltzmannMachine

rows = [[1, 1, 0, 0], [1, 1, 0, 1]]
cells = [Feature(f"cell_{position + 1}", [row[position] for row in rows]) for position in range(4)]

# Fit a machine with two hidden units for up to five hundred passes from seed 0.
# Print the passes run against the cap and whether it settled, the mean
# squared gap, and what each cell comes back as for the first row.`,
              `from oop_ml import Feature, RestrictedBoltzmannMachine

rows = [[1, 1, 0, 0], [1, 1, 0, 1]]
cells = [Feature(f"cell_{position + 1}", [row[position] for row in rows]) for position in range(4)]

machine = RestrictedBoltzmannMachine(n_hidden_units=2, max_epochs=500, random_seed=0).fit(cells)

print(f"passes run {machine.epochs_run} of {machine.max_epochs}, settled {machine.converged}")
print(f"mean squared gap {machine.reconstruction_error(cells):.4f}")
for feature in machine.reconstruct(cells):
    print(f"{feature.name} comes back at {float(feature.values[0]):.2f} for the first row")`,
              `passes run 10 of 500, settled True
mean squared gap 0.1598
cell_1 comes back at 0.65 for the first row
cell_2 comes back at 0.70 for the first row
cell_3 comes back at 0.42 for the first row
cell_4 comes back at 0.49 for the first row`,
              { hints: [
  "Use the returned convergence status without translating it into perfect reconstruction.",
  "Inspect all four reconstructed probabilities; a small update criterion and a correct binary target are different conditions."
], check: numberCheck("After how many passes does the four-cell fit stop?", 10, 0.5, "The learner stops after ten passes with visible reconstruction error remaining. Its settled flag reports the implemented stopping rule, not perfect recovery of every training bit."), question: "What does the learner’s settled flag actually establish?" },
            ),
          ],
        },
      ]}
    />
  );
}
