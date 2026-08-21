import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
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

export const metadata: Metadata = {
  title: "Restricted Boltzmann Machines · oop_ml",
  description:
    "Learn what a handful of shapes have in common by a rule each wire can follow on its own, so a damaged copy is rebuilt from that rather than from a stored original, and the hidden layer is the first description on this site that a model invented for itself.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function RestrictedBoltzmannMachinePage() {
  return (
    <ConceptPage
      title="Restricted Boltzmann Machines"
      tagline="Learn what the shapes have in common, and rebuild a damaged copy from that rather than from a stored original."
      prerequisites={
        <>
          The score a state is given is the{" "}
          <Link href="/concepts/hopfield-network" className={link}>
            associative memory page
          </Link>
          &rsquo;s energy with a second layer added, every unit reads a weighted
          sum from the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>
          , and each one switches on with the probability the{" "}
          <Link href="/concepts/logistic-regression" className={link}>
            logistic regression page
          </Link>
          &rsquo;s sigmoid gives that sum. What is learned here is a
          distribution in the{" "}
          <Link href="/primers/statistics" className={link}>
            statistics primer
          </Link>
          &rsquo;s sense, so this is the first page where the answer to a
          question about one grid is a probability rather than a state.
        </>
      }
      history={
        <>
          <p>
            The network on the associative memory page gives back exactly what
            it was shown. Hand it a damaged T and it returns the T, cell for
            cell, the one it stored, and about a T it never saw it has no
            opinion at all. That is a poor description of most data. Every
            handwritten seven differs from every other, and a memory that could
            only hand back the sevens it had already met would be useless for
            reading a new one. In 1983 Geoffrey Hinton and Terrence Sejnowski,
            in &ldquo;Optimal Perceptual Inference&rdquo;, asked for a network
            whose settled states were a distribution rather than a list, so that
            it could give back things it had never been shown as long as they
            resembled what it had. They kept Hopfield&rsquo;s energy, made each
            unit switch on with a probability set by the energy gap its two
            states leave, which is the rule Ludwig Boltzmann had written for the
            states of a gas in 1868 and the reason for the name, and added
            hidden units to stand for whatever the data does not state outright.
            With David Ackley they published a learning rule for it in 1985, in
            &ldquo;A Learning Algorithm for Boltzmann Machines&rdquo;, and each
            weight in it read only its own two ends, once while the network was
            shown data and once while it ran free.
          </p>
          <p>
            The difficulty was the second reading. It called for the network to
            be left running until it had forgotten where it started, and nobody
            could say in advance how long that took, so the Boltzmann machine
            spent twenty years better admired than used. Paul Smolensky cut the
            network down in 1986, in &ldquo;Information Processing in Dynamical
            Systems&rdquo;, a chapter of the Parallel Distributed Processing
            volumes, to two layers with no wires inside either. He called it a
            harmonium and everyone else now calls it restricted. That is what
            makes the mathematics on this page short, since with nothing joining
            a hidden unit to its neighbours a whole layer can be redrawn in one
            step, though learning still waited on the free running.
          </p>
          <p>
            Hinton removed that wait in 2002, in &ldquo;Training Products of
            Experts by Minimizing Contrastive Divergence&rdquo;. Start the
            network at the data rather than at random, let it run a single step,
            and use wherever it has got to in place of the equilibrium nobody
            could afford. He said plainly that it was an approximation and not
            the gradient, and it made these machines trainable in minutes. In
            2006 Hinton, Simon Osindero and Yee-Whye Teh stacked them in
            &ldquo;A Fast Learning Algorithm for Deep Belief Nets&rdquo;, each
            machine learning from the hidden layer of the one below, which
            trained deep networks a layer at a time when training them all at
            once had failed; and Hinton and Ruslan Salakhutdinov used the same
            stack in &ldquo;Reducing the Dimensionality of Data with Neural
            Networks&rdquo; to compress data further than principal components
            could. Those two papers ended a long quiet in neural networks, and
            the Boltzmann machine is the work named in Hinton&rsquo;s half of
            the 2024 Nobel Prize in Physics he shared with Hopfield.
          </p>
        </>
      }
      playground={<BoltzmannPlayground />}
      sections={[
        {
          title: "Part 1. From a Stored List to a Distribution",
          defaultOpen: true,
          content: (
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
                  which cells agreed with which. Recall was a slide downhill
                  into whichever stored shape lay nearest, and the answer was
                  always one of the three, or one of them with every cell
                  reversed.
                </p>
                <p>
                  Here no cell is wired to any other cell. Every cell is wired
                  instead to a short row of hidden units, the bars under the
                  shapes in the playground, and the hidden units are wired to
                  nothing but the cells. Click the T and two of the three bars
                  stand up while the third stays down. Click the L and a
                  different pair stands. Each shape has become a short code over
                  the hidden units, and nobody gave the machine that code. It
                  arrived at one, because three hidden units were all it had to
                  tell three shapes apart with.
                </p>
                <KeepInMind>
                  Nothing on this page stores a shape. What the three shapes
                  leave behind is a set of weights between the cells and a
                  handful of units that were not in the data at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What it means to learn a distribution">
                <p>
                  Every model on this site before the memory page learned a
                  mapping. Heights and weights went in, an answer came out, and
                  the question the model could answer was always of the form
                  what is the answer for this row. A model of a distribution
                  answers a different question. Handed a grid, it says how
                  plausible that grid is, and it has an opinion about all
                  thirty-three million grids the twenty-five cells can make,
                  though it was only ever shown three of them.
                </p>
                <p>
                  That is a strictly larger claim than a mapping, and it buys
                  three things a mapping cannot. It can be asked about a grid it
                  has never seen, and answer with a number rather than a
                  refusal. It can be asked to produce a grid, since a
                  distribution can be drawn from. And it can be asked to finish
                  a grid, filling in the cells that are missing from the ones
                  that are there, which is the same question a mapping answers
                  only if you decided in advance which cells were the inputs.
                </p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="who can answer it"
                  rows={[
                    {
                      expression: "what answer goes with this row",
                      reason:
                        "a mapping, which is every model on this site up to the memory page.",
                    },
                    {
                      expression: "how plausible is this grid",
                      reason:
                        "a distribution. There is no target column anywhere in this page, and no answer the grids are paired with.",
                    },
                    {
                      expression: "give me a grid",
                      reason:
                        "a distribution, by drawing from it. A mapping has nothing to draw.",
                    },
                    {
                      expression: "fill in the cells I have left out",
                      reason:
                        "a distribution, and for any set of missing cells rather than one fixed set chosen when the model was built.",
                    },
                  ]}
                />
                <KeepInMind>
                  This is an unsupervised model in the strict sense. Nothing is
                  labelled, nothing is predicted, and there is no score against
                  a truth column anywhere on the page, which is exactly why the
                  question of how to judge it comes back in Part 5.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What the hidden units are for">
                <p>
                  A distribution over twenty-five cells has to say something
                  about how the cells depend on one another, since the whole
                  content of the three shapes is that certain cells are lit
                  together. The obvious way to say it is the memory page&rsquo;s
                  way, a weight for every pair, and that is three hundred
                  numbers for twenty-five cells and grows as the square of the
                  grid. The hidden units are the other way. Give the model a few
                  extra switches nobody measured, wire every cell to every
                  switch and no cell to any cell, and the cells become dependent
                  on each other through the switches rather than directly.
                </p>
                <p>
                  So a hidden unit is a fact the machine invents about a grid.
                  Nothing in the data says what it should mean, and after five
                  hundred passes on these three shapes the first unit turns on
                  for the T and the cross and off for the L, which is a fact
                  about the shapes that was never written down anywhere. The
                  three shapes end up at three corners of a small cube, the T at
                  110, the L at 011 and the cross at 101, and that is the first
                  description on this site that a model built for itself rather
                  than being handed.
                </p>
                <InAModel title="What this becomes at scale">
                  <p>
                    On a page of handwritten digits the cells are pixels and the
                    hidden units come out as strokes, a bar here and a curve
                    there, each one turning on for the digits that contain it.
                    Stacking those descriptions, so that a second machine learns
                    from the first one&rsquo;s hidden layer, is what the 2006
                    papers did, and it is why this small model is worth reading
                    about at all.
                  </p>
                </InAModel>
                <KeepInMind>
                  The hidden units are not classes and they are not
                  alternatives. A grid can switch on four of them at once, and
                  the four probabilities then add to four rather than to one.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                <p>
                  Read the three terms as three kinds of preference. The first
                  says how much each cell likes being lit whatever else is
                  happening, the second says the same for each hidden unit, and
                  the third is the only term that ties the two layers together.
                  A large positive weight between a cell and a unit means the
                  pair likes being on together, and a large negative one means
                  it does not.
                </p>
                <KeepInMind>
                  Low energy means plausible, which is the opposite direction
                  from a score, and it is worth fixing now because every number
                  in Part 5 runs the same way.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. No wires inside a layer">
                <p>
                  The restriction is one sentence. No cell is joined to another
                  cell and no hidden unit to another hidden unit, so the energy
                  above contains no term in vᵢ·vₖ and none in hⱼ·hₗ. What that
                  buys is not tidiness. Fix the cells and every hidden unit is
                  left with nothing to consult but its own weighted sum of them,
                  so no hidden unit&rsquo;s decision depends on any other
                  hidden unit&rsquo;s, and the whole layer can be redrawn at
                  once rather than one unit at a time.
                </p>
                <p>
                  On the memory page that was not so. Every cell there read the
                  cells around it, so the cells had to be visited one at a time
                  and the answer depended on the order they were visited in.
                  Here a pass in each direction is a single piece of matrix
                  arithmetic, and the twenty-five cells and three hidden units
                  of this page could be twenty-five thousand and three thousand
                  with no change to the method.
                </p>
                <KeepInMind>
                  Without the restriction the two lines in the next step would
                  each need their own inner loop of sampling, and how long that
                  loop had to run would be nobody&rsquo;s to say. The
                  restriction is what makes them one line each.
                </KeepInMind>
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
                <p>
                  Going up is reading a grid as a code, and going down is
                  drawing a grid from a code. Running the two in turn is a walk
                  over grids that, left alone for long enough, visits each grid
                  as often as the machine believes it deserves, and that walk is
                  the only handle anyone has on a distribution nobody can write
                  down.
                </p>
                <WorkedExample title="Twenty-five cells and one hidden unit">
                  <p>
                    Suppose the weights from the top row of the T into hidden
                    unit 1 are each 0.8, the rest are 0, and unit 1&rsquo;s own
                    weight is −2. Put the T in, whose top row is lit in all five
                    cells, and the sum is 5 × 0.8 − 2, which is 2, so the unit
                    switches on with probability σ(2), about 0.88. Put the L in,
                    whose top row is lit in one cell, and the sum is 0.8 − 2,
                    which is −1.2, so the unit switches on with probability
                    about 0.23. One unit has become a rough test for a full top
                    row.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The second line is what makes this a model of the data rather
                  than a way of shortening it. A model that could only go up
                  would be a feature extractor and nothing more.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Why the product splits">
                <p>
                  It is worth seeing that the first line is forced rather than
                  chosen, because the same argument is what fails the moment a
                  wire is put inside a layer. Fix the cells and write zⱼ for
                  hidden unit j&rsquo;s own weighted sum. Everything in the
                  energy that mentions the hidden units is then a sum of one
                  term per unit, and each term involves only that unit.
                </p>
                <Equation>
                  {"zⱼ = bⱼ + Σᵢ vᵢ·wᵢⱼ\nE(v, h) = −Σᵢ aᵢ·vᵢ − Σⱼ hⱼ·zⱼ"}
                </Equation>
                <WhyThisWorks title="From a sum in the exponent to a product of independent choices">
                  <p>
                    An exponential of a sum is a product of exponentials, so the
                    probability of a whole hidden configuration given the cells
                    factorises into one factor per unit, and a product that
                    factorises is what independence means. Each unit is then a
                    two-way choice between the weight exp(0) for being off and
                    exp(zⱼ) for being on, and normalising those two is the
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
                  Every shortcut on this page comes from that one factorisation.
                  It is the whole of what the word restricted refers to.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. One Learning Step",
          content: (
            <>
              <SubSection title="8. Two counts, one subtraction">
                <p>
                  Learning here is one rule applied to every wire separately,
                  and the rule reads two numbers. Hold the cells at the shapes
                  and count how often a wire&rsquo;s two ends are on together.
                  Then let the machine go for one step of its own, drawing
                  hidden units from their probabilities and cells from those,
                  and count the same thing again. Move the weight by the rate
                  times the difference.
                </p>
                <Equation>
                  {
                    "Δwᵢⱼ = rate · ( ⟨vᵢ·hⱼ⟩ at the data − ⟨vᵢ·hⱼ⟩ after the step )\nΔaᵢ = rate · ( ⟨vᵢ⟩ at the data − ⟨vᵢ⟩ after the step )\nΔbⱼ = rate · ( ⟨hⱼ⟩ at the data − ⟨hⱼ⟩ after the step )"
                  }
                </Equation>
                <p>
                  The first count pushes up the plausibility of what the data
                  actually shows. The second pushes down the plausibility of
                  what the machine currently believes, whether or not the data
                  agrees, and it is what stops the first count simply inflating
                  every weight without bound. Where the two counts agree the
                  wire stops moving, which is the machine saying that what it
                  believes and what it was shown have become the same thing.
                </p>
                <KeepInMind>
                  Nothing here travels backwards from a distant objective. The
                  change to a weight is built from the two units the weight
                  joins and from the rate, and nothing else, which is why this
                  page is worth reading beside a page about backpropagation.
                </KeepInMind>
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
                <p>
                  Read the first update across. Cell 1 is lit in both rows, so
                  the first count for its wire into unit 1 is just the average
                  of that unit&rsquo;s probability, 0.5035. The machine then
                  drew two rows of its own with cell 1 dark in both, so the
                  second count is exactly 0. The weight moves by 0.1 × 0.5035,
                  which is 0.0504, from 0.0013 to 0.0516. The cells&rsquo; own
                  weights move by the same subtraction on how often each cell
                  was lit, and cell 1, lit in both rows and dark in both drawn
                  rows, moves the full 0.1 × (1 − 0), while cell 4, lit in half
                  the rows and in both drawn rows, moves 0.1 × (0.5 − 1) and
                  goes down by 0.05.
                </p>
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
                <p>
                  The hidden units&rsquo; own weights barely move on this step,
                  none of them by as much as a thousandth, and the reason is
                  worth a sentence. Both counts for a hidden unit are averages
                  of a probability that is still very near a half everywhere,
                  because the weights started as noise, so the subtraction very
                  nearly cancels. Breaking that near-cancellation is what the
                  first stretch of any of these fits is spent on, and it is
                  visible again in Part 4.
                </p>
                <KeepInMind>
                  Every number in that table is a count of how often something
                  was on. There is no derivative in the rule as it is applied,
                  which is the whole reason it can be applied wire by wire.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The same rule on twenty-five cells">
                <p>
                  Nothing changes when the grid grows. On the three shapes at
                  three hidden units, the first update finds the wire from cell
                  1 to unit 1 on together 0.4967 of the time at the shapes and
                  0.1681 of the time after the step, and moves that weight from
                  0.00126 to 0.03412, which is 0.1 times the difference to the
                  last digit shown. No single number in that first update moves
                  by more than the rate, and that is not luck. Every quantity in
                  the rule is an average of values between nought and one, so
                  the largest difference two of them can have is one and the
                  largest step is the rate.
                </p>
                <InAModel title="Why these fits are hard to blow up">
                  <p>
                    That bound is the reason this walk is unusually forgiving of
                    a badly chosen rate, where a gradient walk is not. In a
                    gradient walk the step is proportional to an error that a
                    too-large step makes larger, so the two feed each other. Here
                    the step is capped by the rate however bad the rate is, and
                    once the sigmoid saturates the two ends of the chain start to
                    agree and the changes stop growing on their own.
                  </p>
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
                <p>
                  The first count is cheap, since the data is right there. The
                  second is not. Counting under the machine&rsquo;s own
                  distribution means running the up-and-down walk of step 6 until
                  it has forgotten where it started, and how long that takes is
                  not knowable in advance, which makes the true gradient
                  intractable rather than merely slow. What is done instead is to
                  start the walk at the data and stop it after a single
                  alternation, and use whatever it has arrived at.
                </p>
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
                        "the walk run until it has forgotten its start, which nobody can time in advance.",
                    },
                    {
                      expression: "the second count, as it is taken here",
                      reason:
                        "the walk started at the data and stopped after one alternation. This is the substitution, and it is the whole of it.",
                    },
                    {
                      expression: "the error that leaves",
                      reason:
                        "an error of the truncation, not of the sample. Ten thousand more shapes would shrink the noise in both counts and leave this exactly where it is.",
                    },
                  ]}
                />
                <p>
                  That last row is the part that is easy to misread. Most
                  approximations on this site get better with more data. This one
                  does not, because what is wrong with it is where the walk was
                  stopped, and no amount of data changes where the walk was
                  stopped. Running more alternations before reading the second
                  count reduces the error and never removes it.
                </p>
                <KeepInMind>
                  Nothing on this page is descending anything. The step taken is
                  an approximation of a gradient, the approximation is biased,
                  and the bias is a property of the shortcut rather than of the
                  data.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What settled is entitled to mean here">
                <p>
                  A fit stops either when it has used up its passes or when
                  nothing moved. The second condition needs reading carefully,
                  because on every other page of this site a walk that stops
                  moving has arrived somewhere. Here it means the weights stopped
                  moving and nothing more, since nothing was ever climbing a
                  likelihood, and the four-cell set gives the cleanest possible
                  demonstration of the difference.
                </p>
                <WorkedExample title="A walk that stops after ten passes and has not finished">
                  <p>
                    Step through the ledger in step 9 to the tenth update. The
                    machine happens to draw exactly the two rows it was shown, so
                    both counts are the same number for every wire, every
                    difference is zero, and nothing moves at all. The fit
                    therefore stops there and reports itself settled, after ten
                    of the five hundred passes it was allowed, with the two rows
                    still coming back at a mean squared gap of 0.1598 and the
                    first cell rebuilt at 0.65 rather than at 1. The eleventh
                    update in the ledger shows what would have happened had it
                    carried on, and the weights move again immediately.
                  </p>
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
                <p>
                  A reconstruction is the two lines of step 6 run once each. Push
                  a grid up to the hidden units, read what they say, and push
                  that back down to the cells, and what comes out is one
                  probability per cell rather than a grid of noughts and ones.
                  That is the shaded grid in the playground, each cell darkened
                  by the probability the machine gives it.
                </p>
                <p>
                  The important part is what is not consulted on the way back
                  down. The cells the probe held are gone by then. All the return
                  journey has is the code the hidden units settled on, and on
                  these three shapes that code is three numbers. So a
                  reconstruction is not a repair of the grid you handed in. It is
                  a fresh drawing of whatever grid that code describes.
                </p>
                <InAModel title="Twenty-five cells through three numbers">
                  <p>
                    That is also a compression, and a severe one. Everything the
                    machine can say about a grid on the way back has to fit
                    through three probabilities, so a wide hidden layer can
                    rebuild almost anything and a narrow one cannot. Part 6
                    measures where the useful width lies for these three shapes.
                  </p>
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
                <p>
                  The shape of that fall is the thing to look at, because it is
                  not the shape a gradient descent produces. For the first
                  hundred and fifty passes the answer barely moves, eighteen of
                  the twenty-five cells landing on the undamaged T and the gap
                  staying above 0.15, and at a hundred and fifty it is briefly
                  worse at seventeen. Then it collapses, twenty-four cells at two
                  hundred passes, all twenty-five at three hundred with a gap of
                  0.0380, and 0.0061 by five hundred. A run cut short at a
                  hundred and fifty passes would have reported a machine that had
                  learned nothing while it was most of the way to learning
                  everything.
                </p>
                <p>
                  What happened at five hundred is that the damaged grid read as
                  110, which is the T&rsquo;s own code, and the return journey
                  then drew a T. The stem cell the damage switched off comes back
                  near 0.9 and the four cells it switched on come back below a
                  tenth. Nothing rolled downhill into a stored copy, since there
                  is no stored copy anywhere in the machine; the twenty-five
                  cells were summarised as three numbers on the way up, and what
                  came down was drawn from those three numbers with the probe no
                  longer in the picture.
                </p>
                <KeepInMind>
                  The long flat start is symmetry breaking. The weights begin as
                  noise, so every hidden unit is near a half for every shape and
                  the two counts nearly cancel, and the first hundred passes are
                  spent making the units differ from one another at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. A shape the machine was never shown">
                <p>
                  The damaged T is a grid the machine never saw, but it is near
                  one it did. Press the second button on the ladder above and the
                  probe becomes a square, an outline the machine was never given
                  and which is not a damaged copy of anything it was. This is
                  where a distribution and a store of originals part company.
                </p>
                <p>
                  After five hundred passes the square comes back with seventeen
                  of twenty-five cells rounding to the square itself and a gap of
                  0.2263, which is to say it is not rebuilt. What it reads as is
                  010, and that is not any of the three stored codes. Only the
                  second hidden unit rises, which is the unit the L raises, so
                  what returns is the L&rsquo;s stem and foot at probabilities
                  between 0.4 and 0.8, the rest of the square&rsquo;s top row
                  hanging around 0.45, and the square&rsquo;s side walls below a
                  tenth. The machine has described the square as most of an L,
                  because most of an L is the nearest thing in its account of the
                  world.
                </p>
                <KeepInMind>
                  A grid that resembles nothing the machine learned still gets an
                  answer, and the answer is a blend rather than a refusal. There
                  is nothing in a fitted machine that says how far a grid is from
                  anything it was shown, and Part 5 is the closest it comes.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. What the rebuilding gap is and is not">
                <p>
                  The number under the sliders in the playground is the mean
                  squared gap between the three shapes and what comes back from
                  them, and it is the only cheap thing to watch during a fit. It
                  is not what is being minimised. Nothing on this page minimises
                  anything, as step 11 laid out, and this number is not even the
                  quantity the biased step is a biased step towards.
                </p>
                <DerivationTable
                  expressionHeading="what the gap can tell you"
                  reasonHeading="and what it cannot"
                  rows={[
                    {
                      expression: "it did not fall",
                      reason:
                        "the fit learned nothing, and that is worth being able to see in one number.",
                    },
                    {
                      expression: "it fell",
                      reason:
                        "something was learned, though not that the right thing was, and not that the fit is any good.",
                    },
                    {
                      expression: "it is lower for one machine than another",
                      reason:
                        "very little on its own. A hidden layer wide enough to pass a grid through unchanged scores well while describing nothing, which is measured in Part 6.",
                    },
                    {
                      expression: "it reached zero",
                      reason:
                        "every cell was rebuilt exactly, which on three shapes and eight hidden units is closer to copying than to learning.",
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
                  Read this number for the negative case only. A fit whose gap
                  does not fall has plainly learned nothing; a fit whose gap does
                  fall has not thereby been shown to be good.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What a Grid Is Scored By",
          content: (
            <>
              <SubSection title="17. The score, and the reason it has no zero">
                <p>
                  The quantity that compares two grids is the energy of Part 2
                  with the hidden layer summed out rather than sampled, which the
                  restriction makes possible in closed form. It is called the
                  free energy, and lower means the machine finds the grid more
                  plausible.
                </p>
                <Equation>
                  {"F(v) = −Σᵢ aᵢ·vᵢ − Σⱼ ln( 1 + exp( bⱼ + Σᵢ vᵢ·wᵢⱼ ) )"}
                </Equation>
                <p>
                  A probability would be exp(−F) divided by the same quantity
                  summed over every grid, and that sum runs over all
                  thirty-three million grids here and over every possible image
                  in general. Nobody computes it. So a single free energy on its
                  own means nothing at all, and only differences between them
                  carry information, which is why every readout on this page puts
                  a grid&rsquo;s score beside another grid&rsquo;s.
                </p>
                <Equation>{"P(v) = exp( −F(v) ) / Σᵤ exp( −F(u) )"}</Equation>
                <KeepInMind>
                  The free energy is a log probability with an unknown constant
                  subtracted from it, and the constant is the same for every
                  grid, so a difference between two of them is a real difference
                  of log probabilities while a single one is that same real
                  number plus something nobody has computed.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The ordering, measured">
                <p>
                  So the question is what the ranking looks like once the machine
                  has learned. Five grids go to one fit on the three shapes at
                  three hidden units after five hundred passes, and each one is
                  drawn beside what comes back from it.
                </p>
                <StateScores />
                <p>
                  The ordering runs the way it should and the spacing is the
                  informative part. The T scores −24.50, and the L and cross
                  −24.78 and −23.88 beside it. The T with five cells flipped
                  scores −11.82, less than half as deep, which says the machine
                  has learned that a T has a full top row and a stem and that a T
                  with holes in it fits that worse. Thirteen cells scattered at
                  random score −3.71, the square −0.77, and the T with every cell
                  reversed +2.06, above the line entirely.
                </p>
                <p>
                  Two honest qualifications go with that. The square scores worse
                  than the random scatter, so the ranking is not a ranking of how
                  shape-like a grid looks; it is a ranking of how well a grid fits
                  the account the machine built, and a square disagrees with that
                  account more sharply than a scatter does. And the ordering has
                  to be earned. At one pass all five grids score within a tenth of
                  one another, and the damaged T is actually below one of the
                  stored shapes; the probe only rises above every stored shape
                  from about a hundred passes on.
                </p>
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
                    sum over every hidden configuration factorises for the same
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
                  The sum that is done in closed form here is the one over the
                  hidden layer. The sum that is never done is the one over the
                  cells, and those are different sums, which is why the free
                  energy is exact and the probability is not available.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The one figure that can be checked by hand">
                <p>
                  Set every weight to zero and the sum inside each logarithm
                  vanishes, so every term is ln 2, and the free energy of any grid
                  at all is minus the number of hidden units times ln 2. With
                  three hidden units that is a number you can work out on paper.
                </p>
                <Equation>{"F = −3 · ln 2 = −3 · 0.6931 = −2.0794"}</Equation>
                <p>
                  A fit cannot start from zero weights, because units with
                  identical weights compute identical functions and stay
                  identical forever, so it starts from small noise with a spread
                  of 0.01 and both sets of unit weights at zero. The hollow bars
                  in the playground are that starting point, observed by running a
                  single pass at a rate of zero, which adds nothing to what the
                  seed drew. They come out at −2.08 for the T and −2.10 for the L
                  and the cross, and the damaged probe at −2.07, each within the
                  noise in those starting weights of the hand figure.
                </p>
                <WorkedExample title="Where the −2.08 rather than −2.0794 comes from">
                  <p>
                    The starting weights are drawn from a normal spread of 0.01,
                    so a cell&rsquo;s weighted sum into a hidden unit is a sum of
                    up to twenty-five such numbers and lands within a few
                    hundredths of zero rather than at it. Each logarithm is then
                    ln(1 + exp(small)) rather than ln 2 exactly, and three of them
                    move the total by a hundredth or two. Slide the playground to
                    one pass and the solid bars land almost on the hollow ones,
                    since a single update at a rate of 0.1 barely moves weights
                    that small.
                  </p>
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
                <p>
                  The width of the hidden layer is given rather than learned, so
                  it has to be chosen, and the honest way to choose it is to
                  measure. Every bar below is a fresh fit on the same three
                  shapes from the same starting seed for the same five hundred
                  passes, differing only in how many hidden units it was allowed.
                </p>
                <WidthSweep />
                <p>
                  One unit cannot do the job at all. It reads every one of the
                  three shapes as 1, so all three have the same code, and since
                  the code is all the return journey has, all three come back as
                  the same grey average, with the gap at 0.1700 and none of the
                  three rebuilt. Two units give three different codes, which
                  is enough to tell three shapes apart, and the gap falls to
                  0.0351 with two of the three coming back cell for cell. Three
                  units reach 0.0057 and all three shapes.
                </p>
                <p>
                  The reason two units suffice for the codes is that they are
                  simultaneous switches rather than alternatives, so two units
                  offer four codes and not two, and three offer eight. That is
                  also why the three shapes end up at 110, 011 and 101, three
                  different pairs out of three, rather than each shape claiming
                  one unit for itself.
                </p>
                <KeepInMind>
                  The width is the width of the description. Too narrow and two
                  shapes are forced to share a code, which no amount of further
                  learning can undo.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Wider is not reliably better">
                <p>
                  The textbook expectation is that the gap falls as the width
                  grows, and on this fixture it does not. Five units score 0.0165,
                  which is worse than four at 0.0042 and worse than three at
                  0.0057, and then six recovers to 0.0052 and seven reaches
                  0.0024 before eight goes back up to 0.0030. I looked for the
                  monotone curve and it is not there.
                </p>
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
                <p>
                  Two things are going on and they are worth keeping apart. Above
                  three units the width is no longer the constraint, so what the
                  numbers move with is which starting weights were drawn and
                  which way the drawing sent the chain, and the next step
                  measures that effect on its own. It comes to a spread of 0.0157
                  across six seeds at a fixed width of three, which is larger
                  than the 0.0141 the whole sweep from three units to eight
                  covers at a fixed seed. And the gap is not the objective
                  anyway, so a machine that scores 0.0024 has not been shown to
                  have a better account of the shapes than one scoring 0.0057; it
                  has been shown to pass them through more faithfully, which a
                  wide enough layer can do without describing anything.
                </p>
                <KeepInMind>
                  Choose the width from the smallest one that keeps the things
                  you care about apart, and treat differences in the gap above
                  that width as noise until a measurement says otherwise.
                </KeepInMind>
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
                <p>
                  Two fits under one seed agree to the last bit, the largest gap
                  between any two matching weights coming out at exactly 0.0, and
                  their gaps on the shapes are the same number. Two fits under
                  different seeds hold weights 5.25 apart, which is larger than
                  most of the weights themselves. So the seed fixes the machine
                  completely and nothing else about the setup does.
                </p>
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
                <p>
                  What does not survive is which unit stands for what. Under the
                  first seed the T reads as 110 and under the second it reads as
                  011, and neither is more correct. The units have no names and
                  no order, so a machine that has swapped two of them is the same
                  machine wearing different labels, and anything downstream that
                  read unit 1 as though it meant something across fits would be
                  reading a fact about the seed.
                </p>
                <InAModel title="Why that matters once the codes are used">
                  <p>
                    The point of the hidden layer is that a later model can be
                    fitted on the codes rather than on the raw cells. That is
                    fine, since the later model is fitted on codes from one
                    machine and used on codes from the same machine. It stops
                    being fine the moment two machines&rsquo; codes are compared
                    or averaged, and refitting the machine while keeping the
                    downstream model fitted on the old codes is that same
                    comparison made without noticing it.
                  </p>
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
          title: "Part 7. Beside the Memory That Stores Exactly",
          content: (
            <>
              <SubSection title="25. The same shapes given to both">
                <p>
                  Both models on the last two pages have now been given the same
                  three shapes, so they can be put side by side on the same five
                  grids. The memory stores a list and recall is a fall into the
                  nearest entry; this machine stores nothing of the kind and
                  answers by asking what plausible grid its description of the
                  probe would draw.
                </p>
                <MemoryBeside />
                <p>
                  Read the middle and right columns down. The memory answers
                  every one of the five grids with one of the three shapes, cell
                  for cell, or one of them inverted, because those are the only
                  things it can answer with. The machine answers with
                  probabilities, and on three of the five those probabilities
                  round to a stored shape and on two of them they round to no
                  shape at all. The square is where they part most clearly. The
                  memory falls into the L exactly, while the machine gives back a
                  grid that is mostly the L with the rest of the square&rsquo;s
                  top row hanging around a half and nothing else of the square
                  surviving, and nobody stored that grid.
                </p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="the two answers"
                  rows={[
                    {
                      expression: "what can come out",
                      reason:
                        "the memory, one of the stored shapes or its inverse. The machine, any grid of probabilities at all.",
                    },
                    {
                      expression: "a probe near a stored shape",
                      reason:
                        "both repair it. The damaged T comes back as the T under either model.",
                    },
                    {
                      expression: "a probe near nothing",
                      reason:
                        "the memory still names a stored shape, with no signal that it was a poor fit. The machine returns a blend, and its score says how poor a fit it was.",
                    },
                    {
                      expression: "how confident it is",
                      reason:
                        "the memory has no notion of it. The machine has one number per grid, and Part 5 is what that number can and cannot say.",
                    },
                  ]}
                />
                <KeepInMind>
                  Neither answer is better in general. If the world really is a
                  fixed list of shapes and the only damage is noise on top of
                  one of them, the memory is doing the right thing and this
                  machine is adding an unnecessary approximation to it.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. A grid and its reversal">
                <p>
                  There is one difference between the two that is not a matter of
                  degree, and the table above measures it in a single column. The
                  memory&rsquo;s energy is a sum over pairs of cells of a weight
                  times both their values, so reversing every cell flips two
                  signs in every term and leaves the term unchanged. A stored
                  shape and its exact opposite therefore have identical energies,
                  and the opposite is a resting state whether anyone wanted it or
                  not.
                </p>
                <p>
                  Here they do not. Across the five grids the memory&rsquo;s
                  largest difference between a grid and its reversal is exactly
                  0.0, and the machine&rsquo;s is 26.57. The T scores −24.50 and
                  its reversal +2.06, while under the memory both score −11.20.
                  The reason is that the cells run from nought to one rather than
                  from minus one to one, so a cell contributes to the score when
                  it is lit and contributes nothing when it is dark, and each
                  cell has a weight of its own that a reversal reads the wrong way
                  round.
                </p>
                <WhyThisWorks title="Where the symmetry goes">
                  <p>
                    Write the memory&rsquo;s energy as a sum of terms wᵢₖ·sᵢ·sₖ
                    over pairs. Replace every sᵢ by −sᵢ and each term picks up
                    two minus signs, so the whole energy is unchanged and the
                    reversal is exactly as good a state as the original. Now look
                    at this page&rsquo;s free energy. The first term is a sum of
                    aᵢ·vᵢ over the lit cells only, so reversing which cells are
                    lit exchanges it for a different sum entirely, and inside each
                    logarithm the weighted sum changes by the total of that
                    unit&rsquo;s weights rather than by a sign. Nothing in the
                    expression is symmetric under the exchange.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The spurious opposites the memory page had to warn about are
                  not a feature here at all, and the reason is the coding of the
                  cells rather than anything about learning.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="27. What a complete implementation must specify">
                <p>
                  Very little of this method is forced, so a description that
                  does not state its choices cannot be reproduced. The list below
                  is what has to be said, and beside each is what was chosen for
                  the machine behind this page.
                </p>
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
                        "one, which is the usual choice. More reduces the error of Part 3 and never removes it.",
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
                        "a constant 0.1 throughout. A decaying rate makes a fit report itself settled for a trivial reason, as step 12 says.",
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
                        "the starting weights and every draw afterwards, which as Part 6 measures is the entire machine.",
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
                  expressionHeading="the edge"
                  reasonHeading="what should happen"
                  rows={[
                    {
                      expression: "a cell holding 2, or −1",
                      reason:
                        "refused, since a value outside nought to one has no reading in a score written for switches.",
                    },
                    {
                      expression: "a cell holding 0.5",
                      reason:
                        "accepted, and read as a mean rather than a state, which is how a grey pixel is used.",
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
                        "refused, since the two counts would then push the wrong way and the weights would grow without bound.",
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
                        "accepted, where the models that divide by a spread have to refuse it.",
                    },
                    {
                      expression: "a setting the machine does not have",
                      reason:
                        "refused rather than quietly ignored, which is the failure that produces a run at a default nobody chose.",
                    },
                  ]}
                />
                <BoltzmannContracts />
                <p>
                  Three groups are worth reading closely. The refusals about
                  values are about the score having no reading otherwise, since a
                  cell holding 2 or −1 has no place in an energy written for
                  switches, while a cell holding 0.5 is accepted and read as a
                  mean, which is how a grey pixel is used in practice. The
                  refusals about widths and settings all happen before any data
                  is looked at, and a setting the machine does not have is refused
                  rather than quietly ignored, which is the failure that produces
                  a run at a default nobody chose. And the acceptances are as
                  informative as the refusals. A single pattern is accepted,
                  because a distribution over one row is still a distribution. A
                  column that is dark in every pattern is accepted, where the
                  models that divide by a spread have to refuse it. More hidden
                  units than cells is accepted, and produces a description wider
                  than the thing described.
                </p>
                <p>
                  Two rows are worth stating plainly rather than arguing with. A
                  rate of zero is accepted, and the walk then stops after a
                  single pass calling itself settled, which is correct under the
                  definition in step 12 and would mislead anyone who read settled
                  as finished. And a
                  probe with its cells given in a different order is accepted and
                  answers identically, because cells are matched by name rather
                  than by position, which is a promise worth having and one that
                  hides a reordering bug rather than catching it.
                </p>
                <KeepInMind>
                  The acceptances are the rows worth rereading. A refusal is
                  something you will meet the first time you make the mistake,
                  where a machine that quietly went on and answered after a rate
                  of zero, or after a column that never varies, is one you can
                  ship a wrong number out of without ever seeing a message.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
