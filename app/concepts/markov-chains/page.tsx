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
import { MarkovCountTable } from "@/components/widgets/MarkovCountTable";
import { MarkovEdges } from "@/components/widgets/MarkovEdges";
import { MarkovForgetting } from "@/components/widgets/MarkovForgetting";
import { MarkovLikelihoodCurve } from "@/components/widgets/MarkovLikelihoodCurve";
import { MarkovMemorySweep } from "@/components/widgets/MarkovMemorySweep";
import { MarkovPlayground } from "@/components/widgets/MarkovPlayground";
import { MarkovSamples } from "@/components/widgets/MarkovSamples";
import { MarkovShares } from "@/components/widgets/MarkovShares";
import { MarkovSmoothingSweep } from "@/components/widgets/MarkovSmoothingSweep";
import { MarkovTwoStep } from "@/components/widgets/MarkovTwoStep";

export const metadata: Metadata = {
  title: "Markov Chains · Perceptron Lab",
  description:
    "A Markov chain represents a process through states and the probabilities of moving between them. Its next-state prediction depends on the current state, making the choice of what a state includes important.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function MarkovChainsPage() {
  return (
    <ConceptPage
      lessonId="markov-chains"
      intuition={lessonIntuitions["markov-chains"]}
      technicalStart="Part 2. Counting Is the Whole Fit"
      openingTitle="How Much of the Past Do We Need?"
      playgroundTitle="Where can the next step take us?"
      playgroundIntro="Read one row of the transition table as the possible next states from the current state. Compare one step with several repeated steps."
      title="Markov Chains"
      tagline={"A Markov chain represents a process through states and the probabilities of moving between them. Its next-state prediction depends on the current state, making the choice of what a state includes important."}
      prerequisites={
        <>
          The same assumption applied to words rather than letters is the
          subject of the{" "}
          <Link href="/concepts/n-grams" className={link}>
            n-grams page
          </Link>
          , which carries the argument about steps a model never counted in
          full, so this page borrows its conclusions rather than repeating
          them. A chain whose states cannot be seen, only guessed at from what
          they produce, is the model on the{" "}
          <Link href="/concepts/segmenting-with-a-hidden-model" className={link}>
            segmenting with a hidden model
          </Link>{" "}
          page. Beyond those, all this page asks is multiplying a row of
          numbers by a table.
        </>
      }

      playground={<MarkovPlayground />}
      sections={[
        {
          title: "Part 1. Letters That Remember the Letter Before",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Letters are not independent draws">
                <p>Take the first two chapters of Alice&apos;s Adventures in Wonderland. After removing spaces, our example contains 16,803 letters in 128 sentences. We classify each letter as a vowel or consonant, following the kind of question Markov asked of Pushkin&apos;s text. Vowels account for 38.14 percent.</p>
              <p>If we drew each category independently using that overall frequency, the chance of a vowel would be the same after every previous letter. Knowing whether the preceding letter was a vowel or consonant would tell us nothing. Let&apos;s compare that assumption with the actual transitions in this text.</p>
                <>
<p>
                  The preceding letter does help. In this text, a vowel follows a vowel 14.61 percent of the time, but follows a consonant 52.70 percent of the time. That is a difference of more than a factor of three and a half. A model that uses the previous letter&apos;s category can represent a pattern that independent draws would miss.
                </p>
                <p>Before counting, we remove spaces and classify y as a consonant. These are rules for the written symbols, rather than a complete phonetic analysis: y can represent a vowel sound in a word such as rhythm. Changing the preprocessing would change some of the resulting counts and probabilities.</p>
</>
                <NumberTable
                  headings={[
                    "the letter before",
                    "letters counted after it",
                    "share that are vowels",
                  ]}
                  rows={[
                    ["anything", "16,803", "0.3814"],
                    ["a vowel", "6,384", "0.1461"],
                    ["a consonant", "10,291", "0.5270"],
                  ]}
                  caption="The first two chapters, spaces removed, y counted as a consonant. Under independence all three rows would read the same."
                />
                <KeepInMind>
                  The problem Markov was solving is in the second and third
                  rows. A model of letters as independent draws gives every row
                  the first row&rsquo;s number, and on this text it is wrong by
                  0.2353 after a vowel and by 0.1456 after a consonant.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The assumption Markov made instead">
                <p>
                  Markov&rsquo;s way out was to let each letter depend on the
                  letter before it and on nothing earlier. Once we know the
                  current letter is a consonant, the chance that the next is a
                  vowel is 0.5270 whether the consonant followed a vowel,
                  followed two consonants, or opened the sentence. The whole
                  history of the text is allowed to matter only through the one
                  letter it left us at.
                </p>
                <Equation>
                  {"P(Xₜ₊₁ = j | Xₜ = i, Xₜ₋₁, …, X₀)  =  P(Xₜ₊₁ = j | Xₜ = i)  =  pᵢⱼ"}
                </Equation>
                <p>
                  A sequence satisfying this assumption is a Markov chain. Its possible conditions are called states, and pᵢⱼ is the probability of moving from state i to state j. The assumption is conditional independence: once we know the current state, earlier states add no further information about the next one. That still allows a state two steps back to predict a later state indirectly, through the intervening transition. Step 17 measures this relationship in our example.
                </p>
                <p>We also reuse the same transition probabilities at every position. This is called time homogeneity. A state has the same outgoing rule in the first chapter as in the third. Step 14 compares the chapter counts to examine that additional modeling assumption.</p>
                <KeepInMind>
                  The one-step Markov assumption limits which history the model uses. Reusing one transition table everywhere is a separate time-homogeneity assumption. This page’s model uses both; neither should be mistaken for a guarantee that English follows the resulting probabilities exactly.</KeepInMind>
              </SubSection>

              <SubSection title="3. The whole model is one table">
                <p>
                  With two states there are four probabilities, and they fit in
                  a table whose rows are the letter now and whose columns are
                  the letter next. Each row is a complete answer to the question
                  of what comes next, so each row sums to one, 0.1461 and 0.8539
                  after a vowel, 0.5270 and 0.4730 after a consonant. Nothing
                  else is learned.
                </p>
                <Equation>
                  {"P  =  [ p_VV  p_VC ]  =  [ 0.1461  0.8539 ]\n      [ p_CV  p_CC ]     [ 0.5270  0.4730 ]"}
                </Equation>
                <p>
                  The convention here is the usual one in probability, rows for
                  where a step starts, and a distribution over the states
                  written as a row that the table multiplies from the right.
                  Some texts, particularly in linear algebra, put the starting
                  state in the columns instead, and every equation on this page
                  would then be transposed with nothing about the chain changed.
                </p>
                <KeepInMind>
                  A two-state chain is four numbers, of which two are free,
                  since each row must sum to one. A chain over the twenty-seven
                  symbols of Part 5 is 729 numbers, of which 702 are free, and
                  that growth is what Part 6 is about.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Counting Is the Whole Fit",
          content: (
            <>
              <SubSection title="4. One sentence counted by hand">
                <p>For this fully observed, time-homogeneous model without smoothing, fitting consists of counting adjacent transitions and normalizing each outgoing row. More elaborate choices, such as hidden states or shared parameters, need different fitting procedures.</p>
                <p>
                  Alice calling her cat is short enough to do with a pencil. Oh
                  my dear Dinah is thirteen letters once the spaces go, and each
                  is marked below as a vowel or a consonant, with the y of my
                  counted as a consonant by the page&rsquo;s convention.
                </p>
                <MarkovCountTable text="sentence" />
                <WorkedExample title="Oh my dear Dinah">
                  <p>
                    The classes run V C C C C V V C C V C V C, which gives
                    twelve steps. A vowel is followed by a vowel once, in ea,
                    and by a consonant four times, in oh, ar, in and ah. A
                    consonant is followed by a vowel three times, in de, di and
                    na, and by a consonant four times, in hm, my, yd and rd.
                  </p>
                  <Equation>
                    {"after a vowel       1 + 4 = 5 steps    p_VV = 1 ⁄ 5 = 0.2000    p_VC = 4 ⁄ 5 = 0.8000\nafter a consonant   3 + 4 = 7 steps    p_CV = 3 ⁄ 7 = 0.4286    p_CC = 4 ⁄ 7 = 0.5714"}
                  </Equation>
                </WorkedExample>
                <KeepInMind>
                  The fit is a tally and a division, and the division is by how
                  many times a state began a step, which is not how many times
                  it occurred. The final h of Dinah occurred and began nothing,
                  so eight consonants give seven steps.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The same count on two chapters">
                <>
                  <p>
                    Across all 128 sentences, vowels start 6,384 transitions and
                    consonants start 10,291. Count where each kind of transition goes,
                    then divide by its row total.
                  </p>
                  <Equation>{"P(vowel | vowel) = 933 / 6,384 ≈ 0.1461\nP(consonant | vowel) = 5,451 / 6,384 ≈ 0.8539\nP(vowel | consonant) = 5,423 / 10,291 ≈ 0.5270\nP(consonant | consonant) = 4,868 / 10,291 ≈ 0.4730"}</Equation>
                  <p>
                    Each row sums to one because it covers every observed destination
                    from that starting state.
                  </p>
                </>
                <Equation>
                  {"p_VV  =  933 ⁄ 6,384  =  0.1461          p_CV  =  5,423 ⁄ 10,291  =  0.5270"}
                </Equation>
                <MarkovCountTable text="chapters" />
                <KeepInMind>
                  The one-sentence and two-chapter estimates both put a vowel after a vowel less often than after a consonant. Their vowel-to-vowel estimates differ, 0.2000 versus 0.1461. The larger count gives more evidence for estimating those transitions, but does not by itself verify the model’s memory assumption.</KeepInMind>
              </SubSection>

              <SubSection title="6. Why dividing the counts is the best answer the text allows">
                <p>
                  The division is not a convention. Among every table we could
                  write down, it is the one under which the counted text is most
                  probable. The probability of the text is a product of one table
                  entry per step, and the vowel row enters that product 933
                  times as p_VV and 5,451 times as 1 − p_VV, so the logarithm of
                  the product, for that row, is a curve in p_VV alone.
                </p>
                <Equation>
                  {"log L(p_VV)  =  933 · ln p_VV  +  5,451 · ln(1 − p_VV)"}
                </Equation>
                <MarkovLikelihoodCurve />
                <>
                  <p>
                    The likelihood is largest where its derivative is zero. Equate the
                    two terms and solve for the vowel-to-vowel probability.
                  </p>
                  <Equation>{"933 / p_VV = 5,451 / (1 − p_VV)\n933(1 − p_VV) = 5,451p_VV\np_VV = 933 / (933 + 5,451) = 933 / 6,384"}</Equation>
                  <p>
                    The same argument applies to each row separately. A row’s entries
                    appear only in transitions leaving that row’s state. The fitted
                    table gives the observed text a log likelihood of −9,773.73 nats,
                    the largest available under this model.
                  </p>
                </>
                <WhyThisWorks title="Why the ratio maximizes the likelihood, for any number of states">
                  <p>Let nᵢⱼ count transitions from state i to state j. Their log likelihood adds a count-weighted logarithm for each transition probability. A row’s parameters appear only in that row’s terms, so we can optimize rows separately while requiring each to sum to one. The auxiliary λ below is a Lagrange multiplier enforcing that constraint. The derivative argument applies to positive-count entries; zero-count entries reach the boundary at zero in the unsmoothed fit.</p>
                  <DerivationTable
                    expressionHeading="step"
                    reasonHeading="why"
                    rows={[
                      {
                        expression: "maximise Σⱼ nᵢⱼ ln pᵢⱼ   subject to   Σⱼ pᵢⱼ = 1",
                        reason: "one row at a time, since no two rows share a parameter",
                      },
                      {
                        expression: "L = Σⱼ nᵢⱼ ln pᵢⱼ − λ (Σⱼ pᵢⱼ − 1)",
                        reason: "one multiplier for the row’s one constraint",
                      },
                      {
                        expression: "∂L ⁄ ∂pᵢⱼ = nᵢⱼ ⁄ pᵢⱼ − λ = 0",
                        reason: "so every entry of the row is its count over λ",
                      },
                      {
                        expression: "Σⱼ nᵢⱼ ⁄ λ = 1   ⇒   λ = nᵢ",
                        reason: "the constraint fixes λ as the number of steps that began in i",
                      },
                      {
                        expression: "p̂ᵢⱼ = nᵢⱼ ⁄ nᵢ",
                        reason: "the count over the row total",
                      },
                    ]}
                  />
                  <p>Without smoothing, an unobserved transition receives probability zero, making it impossible under the fitted model. A state with no observed departures poses a different problem: there is no outgoing total by which to divide. Part 7 examines the choices required for that missing row.</p>
                </WhyThisWorks>
                <KeepInMind>
                  The counted table is the maximum-likelihood estimate, row by
                  row, and it is conditioned on the first letter of every
                  sentence, which it takes as given and does not try to
                  predict.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What the count leaves out">
                <p>Each sentence is counted as a separate sequence. We do not invent a transition from its last letter to the first letter of the next sentence. The 16,803 letters therefore provide 16,675 transitions: one fewer transition than letters within each of the 128 sentences.</p>
                <p>The transition model conditions on the first state of a sequence. It does not learn how that first state was selected. A model of sentence beginnings would need a separate initial-state distribution. Here the sentence score begins with the transition to its second letter.</p>
                <KeepInMind>
                  The chain&rsquo;s probability of a sentence is the probability
                  of its steps given its first letter, and the join between two
                  sentences is not a step at all.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "If letters really were drawn independently, the share of vowels following a vowel would match the share following a consonant.",
              true,
              "Under an independent-letter model with a common vowel probability, the previous letter class would not change the next-vowel probability. The measured proportions, 14.61 percent after a vowel and 52.70 percent after a consonant, differ greatly. That is evidence against this simple independence model, rather than a demand that finite-sample counts match exactly under independence.",
            ),
            trueFalse(
              "Counting y as a vowel rather than a consonant would leave the table unchanged.",
              false,
              "Changing which letters count as vowels changes the state sequence and can change the transition counts. Removing spaces is another modeling choice that determines which letters become adjacent. The stated V/C mapping is an orthographic convention for this example, not a full account of pronunciation; words such as rhythm show that distinction.",
            ),
            choice(
              "Oh my dear Dinah is thirteen letters once the spaces are dropped. How many steps does it contribute?",
              ["Eleven", "Twelve", "Thirteen", "Twenty-six"],
              1,
              "A step is one adjacent pair, so a run of thirteen letters holds twelve of them. The last letter ends a step without beginning one, which is the same fact that leaves a state with no row at all in Part 7.",
            ),
            choice(
              "What does fitting this chain to a text involve?",
              [
                "Counting every adjacent pair, then dividing each row of counts by its own total",
                "Choosing a learning rate and stepping until the table stops changing",
                "Trying many candidate tables and keeping whichever scores best on held-out text",
                "Starting from a guessed table and repeating passes until successive ones agree",
              ],
              0,
              "Nothing is iterated, tuned or searched. One pass over the text produces the finished table, because each row is a count of steps divided by its own total. The other three describe fitting procedures that other models need and this one does not.",
            ),
            several(
              "Which of these hold for the count on the first two chapters?",
              [
                "Dividing each row of counts by its own total gives the table under which the counted text is most probable",
                "16,803 letters give 16,675 steps, because the join between two sentences is never counted as one",
                "The first letter of each sentence is predicted by the chain like any other letter",
                "A step the text never took is given a small probability so that nothing is impossible",
              ],
              [0, 1],
              "For the unsmoothed conditional likelihood, each row is fitted from the transitions leaving that state. The maximum-likelihood next-state probabilities are its observed relative counts. Sentence boundaries do not contribute cross-sentence transitions, so:\n\n```math\n16,803 letters − 128 sentence starts = 16,675 transitions\n```\n\nThe model conditions on each first state. Unobserved transitions receive zero probability unless a smoothing rule is added.",
            ),
          ],
        },
        {
          title: "Part 3. Several Steps Ahead",
          content: (
            <>
              <SubSection title="8. Two steps is the table used twice">
                <p>
                  Ask where the chain will be two letters after a vowel. The
                  walk has to pass through a letter in between, which is a vowel
                  with probability 0.1461 and a consonant with probability
                  0.8539, and from each of those the second step goes by that
                  state&rsquo;s own row. Adding the two routes gives the chance
                  of a vowel two letters on.
                </p>
                <Equation>
                  {"P(vowel two on | vowel now)  =  0.1461 × 0.1461  +  0.8539 × 0.5270  =  0.4713"}
                </Equation>
                <p>
                  Doing that for every pair of states at once is multiplying the
                  table by itself, and n steps is the table raised to the nth
                  power. A starting distribution written as a row π₀ is carried
                  n steps by multiplying on the right.
                </p>
                <Equation>{"πₙ  =  π₀ Pⁿ          Pᵐ⁺ⁿ  =  Pᵐ Pⁿ"}</Equation>
                <KeepInMind>
                  Every prediction a chain makes further ahead is built from the
                  one-step table, so it can be no better than the one-step
                  assumption. Step 17 sets the 0.4713 above beside what the text
                  actually does two letters on.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. How quickly the start is forgotten">
                <p>
                  Start one walk at a vowel and another at a consonant and
                  follow the chance of a vowel in each. After one step they are
                  far apart, 0.1461 against 0.5270. After two they have crossed,
                  0.4713 against 0.3263, after three they have crossed back,
                  0.3475 against 0.4027, and by the fifth step both are within
                  half a hundredth of 0.3816, which is where every walk ends up
                  and the subject of Part 4.
                </p>
                <MarkovForgetting />
                <p>
                  The crossing is not noise. For a two-state chain the gap
                  between a walk and where it settles is multiplied at every
                  step by one number, the table&rsquo;s second eigenvalue, which
                  for two states is the difference between the two chances of a
                  vowel, and here it is negative.
                </p>
                <Equation>
                  {"λ₂  =  p_VV − p_CV  =  0.1461 − 0.5270  =  −0.3808\n\ndistance from settled after n steps  =  distance at the start × |λ₂|ⁿ"}
                </Equation>
                <p>
                  The sign is the alternation, since a vowel makes a consonant
                  likely and a consonant makes a vowel fairly likely, so the walk
                  overshoots in each direction in turn. The size is the speed,
                  since each step leaves 0.3808 of the remaining distance, 0.6184
                  at the start from a vowel, 0.2355 after one step, 0.0897 after
                  two, and 0.00004 after ten.
                </p>
                <KeepInMind>
                  For this mixing two-state chain, the magnitude of the second eigenvalue gives the exact geometric contraction factor. In larger finite chains, nontrivial eigenvalues help describe long-run convergence, but multiple modes and the starting distribution also matter. Eigenvalues of magnitude one can prevent convergence from some starts.</KeepInMind>
              </SubSection>

              <SubSection title="10. Twenty-seven states forget almost as fast">
                <p>
                  The same question can be asked of a chain over every letter
                  and the space, counted on the same two chapters. There is no
                  single pair of walks to compare now, so for each number of
                  steps the second view of the widget above takes the worst of
                  the twenty-seven starts, the one still furthest from where the
                  chain settles. Distance here is the largest difference, over
                  every set of symbols, between the chance the walk gives it and
                  the chance the settled distribution gives it.
                </p>
                <Equation>{"distance(π, σ)  =  ½ Σⱼ |πⱼ − σⱼ|"}</Equation>
                <p>
                  The worst start for the first four steps is q, which is
                  followed by u 95 percent of the time, so a walk from q knows
                  where it is going for longer than a walk from anywhere else. It
                  is 0.9264 from settled after one step, 0.4918 after two, 0.1580
                  after three and 0.0442 after four. From the fifth step the
                  worst start is v, and by the tenth the worst distance is
                  0.00004.
                </p>
                <KeepInMind>
                  A letter chain on this text forgets where it started within a
                  few letters, which is shorter than most words, and that is a
                  statement about the chain. Step 17 shows the text remembering
                  further back than the chain does.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Where It Settles",
          content: (
            <>
              <SubSection title="11. A distribution one step leaves alone">
                <p>
                  Every walk in Part 3 approached the same place, a chance of a
                  vowel of 0.3816. That distribution has a property that makes
                  it findable without walking. Take it as the starting
                  distribution, carry it one step, and it comes back unchanged,
                  since the vowels turning into consonants are exactly balanced
                  by the consonants turning into vowels.
                </p>
                <Equation>{"π P  =  π          Σⱼ πⱼ  =  1"}</Equation>
                <p>A stationary distribution is unchanged by a transition. Probability may flow between its states, but the incoming and outgoing amounts balance overall. For two states, equating the flow in the two directions lets us solve that distribution by hand.</p>
                <Equation>
                  {"π_V × p_VC  =  π_C × p_CV\n\nπ_V  =  p_CV ⁄ (p_CV + p_VC)  =  0.5270 ⁄ (0.5270 + 0.8539)  =  0.3816"}
                </Equation>
                <WorkedExample title="Oh my dear Dinah again">
                  <>
                    <p>
                      The vowel-to-consonant probability is four fifths, and the
                      consonant-to-vowel probability is three sevenths. Substituting
                      them into the balance formula gives the long-run vowel share.
                    </p>
                    <Equation>{"stationary vowel share = (3/7) / (3/7 + 4/5)\n                       = 15/43 ≈ 0.3488\nobserved vowel share = 5/13 ≈ 0.3846"}</Equation>
                    <p>
                      They differ on this short sentence. Step 13 explains why the gap
                      is usually much smaller on a long text.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  A stationary distribution is unchanged by the transition table. It does not mean that a sampled endpoint is certain, or that every starting distribution approaches it. Part 7 separates stationarity, convergence of distributions and long-run time averages.</KeepInMind>
              </SubSection>

              <SubSection title="12. Solved rather than walked to">
                <>
                  <p>
                    Repeatedly updating the probability distribution approaches
                    stationarity on a finite irreducible, aperiodic chain. A single
                    sampled endpoint is only one observation, not a distribution.
                    Solving the balance equations finds the stationary probabilities
                    directly.
                  </p>
                  <Equation>{"πP = π\nπ(P − I) = 0\nΣᵢ πᵢ = 1"}</Equation>
                  <p>
                    One balance equation is redundant because every row of the
                    transition matrix sums to one. Replace that equation with the
                    requirement that the probabilities sum to one. When the chain has a
                    unique stationary distribution, the resulting system has one
                    solution.
                  </p>
                </>
                <Equation>
                  {"π (P − I)  =  0,   with one of its equations replaced by   Σⱼ πⱼ  =  1"}
                </Equation>
                <>
<p>For a finite chain, uniqueness depends on the pattern of possible transitions. If every state can reach every other, there is one stationary distribution. More generally, uniqueness holds when there is only one closed communicating class: one mutually reachable group that cannot be left. Transient states can feed that group without changing uniqueness.</p>
                <p>Making every transition strictly positive ensures both communication between states and freedom from a fixed return period. It can therefore produce a unique stationary distribution that repeated distribution updates approach. Smoothing changes the model to obtain those properties; Part 7 shows why that change needs interpretation.</p>
</>
                <KeepInMind>
                  For this chain, repeated distribution updates and the balance equations identify the same limiting probabilities. A periodic chain can still have a stationary distribution even when updates from a known state keep oscillating. Time-averaged occupation is a separate question.</KeepInMind>
              </SubSection>

              <SubSection title="13. The long-run shares against the text">
                <p>
                  The chain settles at a vowel with probability 0.3816, and
                  38.14 percent of the letters it was counted on are vowels. On
                  the letter chain the agreement is as close, the largest gap
                  over all twenty-seven symbols being 0.0019, and the widget
                  draws the settled share of every symbol beside its share of
                  the text.
                </p>
                <MarkovShares />
                <>
<p>
                  This agreement partly follows from how the transition table was estimated. Weighting its rows by the observed proportions of starting letters gives the proportions of ending letters. Those counts differ mainly at sentence boundaries, so the empirical letter frequencies nearly satisfy the stationary equation by construction. That check alone is weak evidence that the model captures all of the text&apos;s sequential structure.
                </p>
                <p>
                  On oh my dear Dinah, a single sentence where the two ends are two of its thirteen letters, the gap is 0.3846 against 0.3488. On 128 sentences it is 0.3814 against 0.3816.
                </p>
</>
                <Equation>
                  {"Σᵢ (share of steps starting at i) × pᵢⱼ  =  share of steps ending at j"}
                </Equation>
                <p>
                  The informative checks are the ones the construction does not
                  force. The third chapter, never counted, is 39.16 percent
                  vowels, 0.0100 above where the chain settles, and over the
                  letters its largest gap is 0.0097, for d, which the chain
                  settles at 0.0350 and the chapter uses 0.0447 of the time. A
                  walk of 20,000 letters drawn from the chain itself lands within
                  0.0054 of the settled shares for every symbol.
                </p>
                <KeepInMind>
                  Agreement with the training text’s overall letter frequencies is largely built into the transition counts. It is a useful consistency check, but weak evidence for the one-step memory assumption. Frequencies in excluded text provide another check; neither comparison alone evaluates the full sequential structure.</KeepInMind>
              </SubSection>

              <SubSection title="14. One table for the whole book">
                <p>
                  Step 2 said the same table is used at every position. Count
                  each chapter on its own and the vowel row drifts, a vowel
                  following a vowel 13.96 percent of the time in the first
                  chapter, 15.29 in the second and 17.01 in the third, while the
                  consonant row barely moves, 52.56, 52.85 and 53.41.
                </p>
                <NumberTable
                  headings={[
                    "counted on",
                    "letters",
                    "vowel after a vowel",
                    "vowel after a consonant",
                    "where it settles, vowel",
                  ]}
                  rows={[
                    ["the first chapter", "8,601", "0.1396", "0.5256", "0.3792"],
                    ["the second chapter", "8,202", "0.1529", "0.5285", "0.3842"],
                    ["the third chapter", "6,874", "0.1701", "0.5341", "0.3916"],
                  ]}
                  caption="Each chapter counted as a chain of its own. The chain the page uses is the first two together."
                />
                <p>Different chapter counts may reflect a changing process or ordinary sampling variation. This homogeneous fit stores only one transition table, so it does not explicitly represent a change by chapter. Giving each chapter a separate table would introduce more quantities to estimate from the available text.</p>
                <KeepInMind>
                  Homogeneity is an assumption of its own, separate from the
                  one-step memory, and a text can break it while keeping the
                  memory. The chain gives the third chapter the first two
                  chapters&rsquo; table either way.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What One Letter of Memory Buys",
          content: (
            <>
              <SubSection title="15. The chain writing">
                <p>
                  Drawing from a chain is walking it at random. Start at a
                  letter, draw the next from that letter&rsquo;s row, and repeat.
                  Shannon printed exactly this in 1948, English written by counts
                  with no memory and then with one and two letters of it, and the
                  same exercise on Alice is below, every sample started from the
                  same seed so that the only thing changing is the memory.
                </p>
                <MarkovSamples />
                <p>
                  With no memory the letters come in the right proportions, a
                  great deal of e and of space, and in no order at all. One
                  letter of memory gives something the eye accepts as the shape
                  of English, thing rs bof te an, with real short words turning
                  up by accident because the pairs in them are common. Two
                  letters, which is a chain whose states are pairs of letters,
                  writes then es ing pook all a, and three writes the geotuy of
                  thought, where most of the short words are words.
                </p>
                <KeepInMind>
                  The one-letter sample is the plainest picture of what one
                  letter of memory knows, which pairs of letters go together, and
                  of what it does not know, which runs of pairs make a word.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Scoring a chapter the chain never counted">
                <p>
                  The samples show what the chain knows without putting a
                  number on it. To measure it, read the
                  third chapter one letter at a time, ask the chain for the
                  probability of each letter given the one before it, and average
                  the logarithm, in bits, over every letter scored. The obvious
                  alternative knows only how common each letter is, and it is the
                  chain&rsquo;s own stationary distribution used as though every
                  letter were drawn afresh.
                </p>
                <Equation>
                  {"bits per letter  =  −(1 ⁄ M) Σ over scored positions of  log₂ P(letter | what the model remembers)"}
                </Equation>
                <NumberTable
                  headings={["model", "what it remembers", "bits, third chapter"]}
                  rows={[
                    ["letter shares alone", "nothing", "4.0670"],
                    ["the letter chain", "one letter", "3.2436"],
                    ["vowel and consonant shares alone", "nothing", "0.9651"],
                    ["the vowel-and-consonant chain", "one class", "0.8659"],
                  ]}
                  caption="Letters are scored on 8,357 positions of the third chapter and classes on 6,506, the same positions for both rows of each pair. A uniform guess would cost 4.7549 bits over twenty-seven symbols and exactly 1 over two classes."
                />
                <p>On the scored positions, one letter of memory reduces average loss by 0.8234 bits compared with the frequency-only baseline. For vowel/consonant classes, the average reduction is 0.0992 bits. These are averages, not identical savings at every position. The comparison uses a common set that all the listed unsmoothed models can score. It excludes 71 positions with unseen pair contexts or destinations, so it does not measure the probability of the complete unfiltered chapter.</p>
                <KeepInMind>

                  Bits per letter on text the model never counted is the fair
                  score, since a model scored on its own text is scored partly
                  on what it memorized. The third chapter was never counted by
                  any chain on this page.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What the chain says two letters on, and what the text does">
                <p>
                  Step 8 had the chain say that two letters after a vowel the
                  chance of another vowel is 0.4713. The text can be asked the
                  same question directly, by counting every pair of letters two
                  apart. In the first two chapters the answer is 0.3661, and in
                  the third, never counted, 0.3727. The chain is wrong about its
                  own text by more than a tenth, on a question built entirely
                  from the table that text produced.
                </p>
                <MarkovTwoStep />
                <p>
                  Three letters on the error changes sign, the chain saying
                  0.3475 and the text 0.4036, and by five letters the two agree
                  to within a few thousandths. That is structure spanning three
                  letters, which no table of pairs can hold.
                </p>
                <>
<p>
                  Part of the gap is not English at all. Grouping twenty-six letters into two classes throws away which vowel and which consonant, and a sequence of classes read off a letter chain is not in general a Markov chain itself. The second view of the widget runs the same check on 20,000 symbols the letter chain wrote, where one letter of memory is true by construction, and the vowel-and-consonant chain still misses two letters on, 0.4560 against 0.4084.
                </p>
                <p>The simulated letter chain produces a vowel/consonant two-step gap of 0.0476 even though its letter-level Markov assumption is true by construction. Grouping states can therefore explain part of the mismatch in principle. Comparing that simulation with Alice’s gap of 0.1052 is not an exact additive decomposition of the text’s error.</p>
</>
                <KeepInMind>
                  A chain&rsquo;s prediction two steps ahead is its table
                  squared, and the text&rsquo;s own count two steps apart is a
                  separate measurement. Where they differ the text has a pattern
                  the chain cannot represent, and here they differ by 0.1052.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. How long the current letter stays useful">
                <p>
                  The same fact looks different from the chain&rsquo;s side. Ask
                  the letter chain to predict the third chapter several letters
                  ahead, using the table raised to that power, and score it in
                  bits as before. One letter ahead it scores 3.2906, two ahead
                  3.9570, three ahead 4.0624, and by six ahead 4.0792, which is
                  the score of the letter shares alone on the same positions.
                </p>
                <NumberTable
                  headings={["letters ahead", "bits per letter"]}
                  rows={[
                    ["1", "3.2906"],
                    ["2", "3.9570"],
                    ["3", "4.0624"],
                    ["4", "4.0764"],
                    ["6", "4.0792"],
                    ["10", "4.0792"],
                    ["letter shares alone", "4.0792"],
                  ]}
                  caption="The letter chain with a smoothing of a half, scored on the 7,940 positions of the third chapter that have ten letters before them."
                />
                <p>After a few transitions, this chain’s predictions depend little on the starting letter. The text can retain longer relationships, which the multi-step comparison exposes. The model’s loss of dependence on its start does not establish that the underlying language has equally short memory.</p>
                <KeepInMind>
                  The chain&rsquo;s memory fades as fast as its table mixes,
                  whatever the text does. A model that should use more than one
                  letter of the past has to be given more than one letter, which
                  is Part 6.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 to 5",
          quiz: [
            trueFalse(
              "Started from a vowel and from a consonant, the two walks’ chances of a vowel cross over before settling, because the table’s second eigenvalue is negative.",
              true,
              "For this two-state chain, deviation from the stationary vowel share is multiplied at each step by the second eigenvalue. Its negative sign reverses the deviation and its magnitude controls contraction:\n\n```math\nsecond eigenvalue = p_VV − p_CV ≈ −0.3808\n```\n\nThe starting-from-vowel and starting-from-consonant distributions therefore alternate around the stationary share. Their distance shrinks because the factor's magnitude is below one.",
            ),
            choice(
              "The chain settles at a vowel with probability 0.3816 and the text it was counted on is 38.14 percent vowels. Why is that agreement no evidence for the chain?",
              [
                "Multiplying the share of steps that start at each letter by the table gives the share that end at each letter, and the two differ only by the first and last letter of every sentence, so the text’s own shares nearly solve the balance by construction",
                "Because maximum likelihood guarantees that the settled shares equal the text’s shares exactly",
                "Because the third chapter was used to choose the table",
                "Because the agreement is a coincidence of this particular text",
              ],
              0,
              "Transition counts approximately balance their empirical starting-state and ending-state shares, differing at sequence boundaries. That makes similarity between fitted stationary shares and training shares a weak independent check. The short Dinah sequence shows a larger boundary effect than the long chapters. Agreement with held-out state frequencies gives some additional evidence, but matching overall frequencies alone does not test whether one-step and multi-step dependencies are correct.",
            ),
            trueFalse(
              "The stationary distribution is where every walk ends up, so a chain whose walk never settles has none.",
              false,
              "A stationary distribution is unchanged by a transition step. The alternating banana chain has the stationary half-and-half distribution, which remains unchanged if used initially. Starting certainly in one class instead produces alternating next-step distributions and does not converge to that stationary distribution.",
            ),
            choice(
              "Scored on the third chapter, which no chain counted, what did one letter of memory buy over the letter shares alone?",
              [
                "0.8234 bits on every letter, 3.2436 against 4.0670, a fifth of what the frequencies alone cost",
                "Nothing, since the chain was counted on different chapters",
                "4.7549 bits, the cost of a uniform guess over twenty-seven symbols",
                "0.0992 bits, the same saving as on the two classes",
              ],
              0,
              "On the same held-out positions, uniform symbol probabilities cost 4.7549 bits per letter, empirical letter frequencies cost 4.0670, and the one-letter chain costs 3.2436. The improvement over the frequency baseline is:\n\n```math\n4.0670 − 3.2436 = 0.8234 bits per letter\n```\n\nThis comparison measures predictive log loss on unseen text, with the same symbol and boundary conventions. The two-class problem has less symbol uncertainty to begin with and a smaller measured improvement.",
            ),
            trueFalse(
              "The chain’s prediction that a vowel follows two letters after a vowel 47.13 percent of the time agrees with what the first two chapters actually do two letters on.",
              false,
              "Counting every pair of letters two apart in the first two chapters gives 0.3661, and in the third chapter 0.3727, so the chain is wrong about its own text by more than a tenth on a question built entirely from the table that text produced. Three letters on the error changes sign, 0.3475 against 0.4036, and by five letters the two agree to within a few thousandths. About half of the 0.1052 miss is the grouping into two classes, since on 20,000 symbols the letter chain itself wrote, where one letter of memory is true by construction, the vowel-and-consonant chain still misses two letters on, 0.4560 against 0.4084.",
            ),
          ],
        },
        {
          title: "Part 6. Longer Memory, and What It Costs",
          content: (
            <>
              <SubSection title="19. A longer memory is a chain on longer states">
                <p>A state can include more history. In the text <code>the</code>, the two-letter state <code>th</code> is followed by <code>he</code>, predicting the new letter e from the preceding pair. The next-step rule still uses only its current state, but that state now contains two letters. Runs of k letters extend the same construction.</p>
                <Equation>
                  {"P(xₜ₊₁ | xₜ, xₜ₋₁)  =  P( (xₜ, xₜ₊₁) | (xₜ₋₁, xₜ) )"}
                </Equation>
                <MarkovMemorySweep />
                <>
<p>
                  On Markov&rsquo;s two classes this is cheap, since six classes of memory is only 64 possible states, and the widget scores the third chapter at every length of memory from none to six. Each class remembered helps less than the one before, 0.9651 bits with none, 0.8659 with one, 0.8402 with two, 0.8336 with three, 0.8309 with four and 0.8284 with five.
                </p>
                <p>
                  At six, one step of the third chapter is a run of seven classes the first two chapters never produced, so the chain as counted calls it impossible and gives the whole chapter a probability of zero.
                </p>
</>
                <p>
                  With a smoothing of a half, so that nothing is impossible, the
                  curve turns at three classes, reading 0.8359 there and then
                  0.8409, 0.8673 and 0.9589, and the longest memory ends up
                  nearly as bad as none. That is the n-grams page&rsquo;s width
                  trade in miniature, since each longer state is seen fewer times
                  and the invented counts start to outweigh the real ones.
                </p>
                <KeepInMind>
                  On a common set of scored positions, an unsmoothed higher-order maximum-likelihood model can reproduce the shorter-context rule. Its best achievable training likelihood therefore cannot be lower under those conditions. Smoothing, different scored positions and performance on new text are separate comparisons. The held-out examples show that longer context can help and can also perform worse.</KeepInMind>
              </SubSection>

              <SubSection title="20. The table grows as a power of the memory">
                <p>There are 27ᵏ possible k-letter states. This general-purpose implementation stores a dense transition table over the states it actually observed: 27 letters, 363 pairs or 1,982 triples in these chapters. That storage design includes many zero entries. It is not an unavoidable cost of longer context: a specialized model can store only legal overlapping transitions or use a sparse representation.</p>
                <NumberTable
                  headings={[
                    "letters remembered",
                    "possible states",
                    "states seen",
                    "cells in the table",
                    "cells ever counted",
                    "steps per state",
                  ]}
                  rows={[
                    ["1", "27", "27", "729", "363", "774.7"],
                    ["2", "729", "363", "131,769", "1,982", "57.3"],
                    ["3", "19,683", "1,982", "3,928,324", "5,049", "10.4"],
                  ]}
                  caption="Counted on the first two chapters. At three letters, 99.87 percent of the table was never counted, and an average state began about ten steps."
                />
                <>
                  <p>
                    Longer memory spreads roughly the same number of observed
                    transitions across more states. The average falls from about 774.7
                    transitions per state with one letter of memory to 10.4 with three.
                    A dense stationary-distribution solve also grows roughly cubically
                    with the number of states.
                  </p>
                  <Equation>{"relative solve work ≈ (1,982 / 363)³ ≈ 163"}</Equation>
                  <p>
                    Moving from two letters of memory to three can therefore multiply
                    the dense solve work by about 160 without providing any additional
                    training text.
                  </p>
                </>
                <KeepInMind>
                  Each extra letter of memory multiplies the possible states by
                  27 while the text stays the same length. The table fills with
                  cells nobody counted, and a chain can only be as good as the
                  counts in its rows.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Where the longer memory loses to the shorter one">
                <p>A pair state retains more history, but also requires estimates for more transitions. In the third chapter, 261 transitions were absent from the training chapters. Their zero fitted probabilities prevent a finite log score without smoothing. Extra context therefore creates a data requirement as well as a modeling opportunity.</p>
                <MarkovSmoothingSweep />
                <p>
                  At a smoothing of a hundredth the pair chain scores 2.8355 bits
                  against the letter chain&rsquo;s 3.2438, so two letters of
                  memory are worth another 0.41 bits. At a half it scores 3.9628,
                  and at one it scores 4.4876, worse than the letter shares alone
                  at 4.0677, so a chain that remembers two letters has become a
                  worse model of the chapter than one that remembers none. The
                  letter chain, over the same range, moves only from 3.2436 to
                  3.2645.
                </p>
                <>
<p>Additive smoothing in this implementation assigns a count to each of the pair table’s 363 destination states. After <code>th</code>, a legal overlapping destination must begin with h. Only nine such destinations were observed in training. Other symbol continuations could be legal but unseen; destinations beginning with another letter are structurally impossible in this overlapping-state construction.</p>
                <p>
                  At a smoothing of a half each row is given 181.5 invented steps, against an average of 57.3 real ones, and almost all of the invented ones go to pairs that cannot follow. Drawn at that setting the pair chain writes thaqogsedke umuoumts, and the last sample in step 15 shows the rest of it.
                </p>
</>
                <InAModel title="What a working model does instead">
                  <p>
                    The smoothings that work here know which cells are
                    structurally impossible, or fall back on the letter chain
                    when a pair is rare, which is the interpolation the{" "}
                    <Link href="/concepts/n-grams" className={link}>
                      n-grams page
                    </Link>{" "}
                    describes. And the setting that wins in the sweep was read
                    off the chapter being scored, which flatters it in the way
                    the page on{" "}
                    <Link href="/concepts/grid-search" className={link}>
                      searching for a setting
                    </Link>{" "}
                    measures.
                  </p>
                </InAModel>
                <KeepInMind>
                  A longer memory spreads its counts over more cells, and the
                  naive repair for the empty ones spends probability on steps
                  that cannot happen. Across the sweep the pair chain went from
                  0.41 bits better than one letter of memory to 0.42 bits worse
                  than none.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. States With No Observed Next Step" , id: "part-7-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="22. A state that is never left">
                <p>
                  Count a chain on the one word spa. Its classes are C C V, so
                  there are two steps, a consonant to a consonant and a
                  consonant to a vowel, and the vowel ends the word and begins
                  nothing. The vowel&rsquo;s row of the table is its count of
                  steps to a vowel, zero, divided by its count of steps, also
                  zero, and zero over zero is not a probability. The table does
                  not exist until something is decided.
                </p>
                <MarkovEdges initial={3} />
                <p>
                  This is not confined to toy words. A chain on the first two
                  chapters remembering three letters has two such states, oud
                  and phy, which occur only as the last three letters of a
                  sentence, one ending she said aloud and the other let s try
                  geography, and nowhere else in 128 sentences.
                </p>
                <>
<p>An unobserved departure needs an explicit policy. Assigning an even row introduces equal probability for every next state. Assigning a self-transition instead makes that state absorbing: once entered, it cannot be left. That can substantially change long-run behavior, although other closed classes may still exist elsewhere in the chain.</p>
                <p>Another policy refuses the fit until outgoing evidence exists. Additive smoothing instead supplies a positive amount to every candidate transition, giving an unseen row an even distribution as a consequence. Part 6 showed that smoothing must also respect which transitions are structurally possible.</p>
</>
                <KeepInMind>
                  A state that is only ever a last state has no row, and
                  whatever row it is given is an assumption rather than a count.
                  Smoothing makes that assumption for every row at once.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A chain whose walk never settles">
                <p>
                  Count a chain on banana. Its classes alternate, C V C V C V,
                  so a consonant is always followed by a vowel and a vowel by a
                  consonant, and the table is the flip, ones off the diagonal and
                  zeros on it.
                </p>
                <MarkovEdges initial={0} />
                <>
                  <p>
                    The alternating chain has a unique stationary distribution: half
                    vowel, half consonant. Starting from a known consonant never
                    approaches that distribution. The state is certainly a consonant
                    after every even step and certainly a vowel after every odd step.
                  </p>
                  <Equation>{"second eigenvalue = 0 − 1 = −1\nmagnitude of the remaining-error factor = |−1| = 1"}</Equation>
                  <p>
                    The distribution alternates instead of settling. Starting at the
                    stationary distribution would preserve it, but a known starting
                    state does not converge to it. This chain has period two.
                  </p>
                </>
                <p>

                  Averaging over time answers a different question from predicting one particular step. In this alternating chain, a long path spends half its steps in each state, even though a distribution concentrated on one starting state never settles. Starting with the stationary half-and-half distribution would preserve it at every step. Positive smoothing allows repeated states and makes the next-step distributions from either known starting class converge; with smoothing 0.5, the stationary vowel probability is 0.5122.
                </p>
                <KeepInMind>

                  This finite alternating chain has one stationary distribution, yet a known starting state produces oscillating next-step distributions. Irreducibility is sufficient for a finite chain to have a unique stationary distribution, but it is not necessary. A unique closed communicating class gives uniqueness; if that class is also aperiodic, the distributions converge to it from any starting state.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. More than one place to settle">
                <p>
                  Count a chain on two words that share no class, rhythm, which
                  is all consonants under the page&rsquo;s convention, and aeiou.
                  A consonant only ever follows a consonant and a vowel a vowel,
                  so the table is the identity, and a walk that starts in one
                  class never leaves it.
                </p>
                <MarkovEdges initial={1} />
                <p>
                  Each class on its own is a stationary distribution, all
                  consonant or all vowel, and so is every mixture of the two, a
                  third and two thirds, a half and a half, any split at all,
                  since each part stays where it is. The stationary distribution
                  is no longer a single thing to be solved for, the linear system
                  of step 12 has a whole line of solutions, and the chain&rsquo;s
                  long run depends entirely on where it starts.
                </p>
                <>
<p>
                  What breaks uniqueness is two closed groups, and the word asks shows that reducibility alone does not. Its classes are V C C C, so the vowel is left once for a consonant and never returned to, and it cannot be reached from the consonant, which makes the chain reducible. It still has exactly one stationary distribution, all of it on the consonant, because only one group of states is closed, and the vowel the word started from holds no share at all.
                </p>
                <p>
                  Smoothing joins the two words&rsquo; classes into one group again, and the smoothed chain settles at 0.4545 for a vowel.
                </p>
</>
                <KeepInMind>
                  For a finite chain, one closed communicating class gives a unique stationary distribution, with zero stationary mass on transient states. Multiple closed classes permit mixtures of their stationary distributions. The starting distribution and absorption probabilities determine the eventual mixture; periodicity separately affects whether step-by-step distributions converge.</KeepInMind>
              </SubSection>

              <SubSection title="25. Empty transitions, unseen states and tied decisions" id="25-the-edges-gathered">
                <p>The table records other cases where the counts alone do not define a usable chain. Each response belongs to a specific choice about unseen states, normalization or querying. State those choices when comparing two counted models.</p>
                <DerivationTable
                  expressionHeading="Sequence or transition evidence"
                  reasonHeading="What the chain can estimate"
                  rows={[
                    {
                      expression: "no sequences, or an empty one",
                      reason:
                        "there are no states and no steps, so there is nothing to divide. A chain needs at least one state before it exists.",
                    },
                    {
                      expression: "a sequence of one state",
                      reason:
                        "it names a state and counts no step. If the state appears nowhere else, it is a state never left and the row above applies.",
                    },
                    {
                      expression: "a state never left",
                      reason:
                        "its row is zero over zero. An even row, a certain step to itself, a refusal and additive smoothing are the four ways out, and each is an assumption about something nobody observed.",
                    },
                    {
                      expression: "a step never counted, from a state that was left",
                      reason:
                        "defined, and zero. Any text containing that step has probability zero and log probability minus infinity, a claim the model is making, and a false one, about text a reader can see.",
                    },
                    {
                      expression: "a state never seen",
                      reason:
                        "it has no row and no column, so the chain can neither score a step into it nor walk from it. The states are fixed by the counted text, and the third chapter held 71 positions where the pair chain met a pair it had never counted.",
                    },
                    {
                      expression: "the first state of a sequence",
                      reason:
                        "not a step, so it is never scored. The chain learns where sequences go and nothing about where they start, which needs a count of its own.",
                    },
                    {
                      expression: "the join between two sequences",
                      reason:
                        "not a step, since nobody observed one. Counting it would invent a transition from the last letter of one sentence to the first of the next.",
                    },
                    {
                      expression: "every state reaching every other, no lockstep",
                      reason:
                        "a finite irreducible, aperiodic chain has one stationary distribution approached from every start. Nontrivial eigenvalues help describe the convergence rate. Strictly positive transition tables meet these conditions.",
                    },
                    {
                      expression: "every state reaching every other, in lockstep",
                      reason:
                        "a finite irreducible periodic chain has one stationary distribution, but updates from a known state need not converge to it. Long-run time averages can still approach the stationary shares.",
                    },
                    {
                      expression: "one closed group, with states that drain into it",
                      reason:
                        "one stationary distribution, zero on every state outside the group, so a reducible chain is not necessarily ambiguous.",
                    },
                    {
                      expression: "two or more closed groups",
                      reason:
                        "mixtures of the closed classes’ stationary distributions are stationary. The starting distribution and absorption probabilities determine their weights; periodic classes may prevent stepwise convergence.",
                    },
                    {
                      expression: "the states of a chain grouped into fewer",
                      reason:
                        "the grouped sequence is not in general a Markov chain, since what happens next can depend on which member of the group the walk is at. Vowels and consonants read off the letter chain’s own writing miss two steps on by 0.0476.",
                    },
                    {
                      expression: "a table that changes along the text",
                      reason:
                        "outside this time-homogeneous model. A time-inhomogeneous Markov chain can use transition probabilities that change by position.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying away. A state never left has
                  no row until someone decides one, and more counted text that
                  leaves it would settle the matter. A chain with more than one
                  closed group has no single place to settle, and more text of
                  the same kind never changes that.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            trueFalse(
              "At a smoothing of one the pair chain scores worse on the third chapter than the letter shares alone, which remember nothing.",
              true,
              "It scores 4.4876 bits against 4.0677 for the shares alone, where at a smoothing of a hundredth it scored 2.8355, 0.41 bits better than the letter chain. Additive smoothing adds the same count to every one of a row’s 363 cells, and after th the next state has to begin with h, which was followed by only nine different symbols, so at most nine of those cells can ever be right. At a half each row is given 181.5 invented steps against an average of 57.3 real ones, and the letter chain over the same range moves only from 3.2436 to 3.2645.",
            ),
            choice(
              "As counted, with no smoothing, what does the vowel-and-consonant chain that remembers six classes say about the third chapter?",
              [
                "That it has probability zero, because one step of the chapter is a run of seven classes the first two chapters never produced",
                "That it is the best of the seven lengths of memory, at 0.8284 bits",
                "That it costs exactly one bit per class, the price of a uniform guess",
                "Nothing, since 64 states are too many to count on two chapters",
              ],
              0,
              "A chain remembering six classes is a chain on runs of six, only 64 possible states, so the counting is cheap. The trouble is that a step the text never took has probability zero, and one step of the third chapter is a run the first two chapters never produced, so the whole chapter is impossible. Each class remembered helped less than the one before, 0.9651 bits with none down to 0.8284 with five, and with a smoothing of a half the curve turns at three classes, reading 0.8359 there and 0.9589 at six, nearly as bad as none.",
            ),
            several(
              "Which of these hold for the chain that remembers three letters?",
              [
                "Two of its states, oud and phy, appear only at the ends of sentences",
                "Those states begin no steps, so their rows would divide zero by zero",
                "The difficulty is an artifact of toy inputs such as the word spa",
                "Additive smoothing gives those rows an even spread as a side effect of a choice made for every row at once",
              ],
              [0, 1, 3],
              "A state that only ever ends a sentence starts no step, so its row has no total to divide by, and zero over zero is not a probability. The same gap appears on the real chapters, one state ending she said aloud and the other let s try geography, rather than only on a toy word, and the row is missing rather than zero, so the table does not exist until something is decided. Smoothing decides it for every row at once, and carries the cost Part 6 measured.",
            ),
            several(
              "Which of these chains have exactly one stationary distribution?",
              [
                "banana’s, where a consonant is always followed by a vowel and a vowel by a consonant",
                "asks’, whose vowel is left once for a consonant and never returned to",
                "rhythm and aeiou counted together, whose table is the identity",
                "spa’s, as counted with no smoothing",
              ],
              [0, 1],
              "For these finite chains, uniqueness follows from having one closed communicating class. Banana has one and is periodic: a known starting state oscillates, while its stationary half-and-half starting distribution stays fixed. The reducible asks chain also has one closed class, the consonant. The identity table from rhythm and aeiou has two closed classes and multiple stationary mixtures. Unsmoothed spa lacks a defined outgoing row under this fitted-table convention.",
            ),
          ],
        },
        {
          title: "Practice. Counting Chains With the Library",
          practice: [
            exercise("Count Oh my dear Dinah with the library",["Use the starter's V/C sequence for Oh my dear Dinah to fit MarkovChain. Print its letter count, transition count, both transition-count rows and their probabilities. Then print the stationary vowel share and the sentence's observed vowel share.", "The supplied mapping removes spaces and treats y as a consonant. Keep that convention while comparing the library output with the earlier hand count. The stationary share describes the fitted transition rule, so it need not equal one short sequence's vowel fraction."],`from oop_ml import MarkovChain

sentence = "oh my dear dinah"
dinah = [("V" if letter in "aeiou" else "C") for letter in sentence if letter != " "]

# Fit a chain on the one sequence. Print how many steps it counted, then for
# each state its row of counts and its row of probabilities, then the
# stationary vowel share and the sentence's own share of vowels.`,`from oop_ml import MarkovChain

sentence = "oh my dear dinah"
dinah = [("V" if letter in "aeiou" else "C") for letter in sentence if letter != " "]

chain = MarkovChain().fit([dinah])
counts = chain.transition_counts
print(f"classes {''.join(dinah)}, {len(dinah)} letters, {counts.n_transitions} steps")
for source in ("V", "C"):
    row = [counts.count_of(source, target) for target in ("V", "C")]
    table = [round(chain.probability_of(source, target), 4) for target in ("V", "C")]
    print(f"after {source}: counts {row}, probabilities {table}")

settled = chain.stationary_distribution()
print(f"stationary vowel share {settled['V']:.4f}")
print(f"observed vowel share {dinah.count('V') / len(dinah):.4f}")`,`classes VCCCCVVCCVCVC, 13 letters, 12 steps
after V: counts [1, 4], probabilities [0.2, 0.8]
after C: counts [3, 4], probabilities [0.4286, 0.5714]
stationary vowel share 0.3488
observed vowel share 0.3846`,{...{ hints: ["fit takes a list of sequences, and each sequence is a list of state names, so the one sentence goes in as a list holding one list. A bare string is refused, since it would be read as its letters.", "transition_counts has count_of(source, target) and n_transitions, and probability_of(source, target) on the chain reads the table. All of them take the state names.", "stationary_distribution answers a distribution indexed by state name, so indexing it with V reads the vowel share."], check: numberCheck("What stationary vowel share does the chain on Oh my dear Dinah report?", 0.3488, 0.0005, "The stationary vowel share balances expected flow in each direction under the fitted transition table. It need not equal the empirical vowel fraction of one short sentence, whose beginning and ending also affect the counts.") },question:"Can the letter sequence recover the counted transition table and its stationary distribution?"}),
            exercise("Walk the Dinah chain forward and watch it forget",["Use the fitted Dinah chain to calculate the vowel probability after one through six steps, first starting from V and then from C. Print both probabilities at each step.", "Print the second eigenvalue, p_VV minus p_CV, and the stationary vowel probability. Compare whether the two probability sequences approach it from alternating sides. This repeats the earlier chapter example on the shorter sentence."],`from oop_ml import MarkovChain

sentence = "oh my dear dinah"
dinah = [("V" if letter in "aeiou" else "C") for letter in sentence if letter != " "]

chain = MarkovChain().fit([dinah])
# For one to six steps, print the chance of a vowel that many steps after a
# vowel and after a consonant. Then print the table's second eigenvalue,
# p_VV less p_CV, and the stationary vowel share the walks settle at.`,`from oop_ml import MarkovChain

sentence = "oh my dear dinah"
dinah = [("V" if letter in "aeiou" else "C") for letter in sentence if letter != " "]

chain = MarkovChain().fit([dinah])
for steps in range(1, 7):
    from_vowel = chain.distribution_after("V", steps)["V"]
    from_consonant = chain.distribution_after("C", steps)["V"]
    print(f"{steps} steps on: vowel with chance {from_vowel:.4f} from a vowel, {from_consonant:.4f} from a consonant")

second_eigenvalue = chain.probability_of("V", "V") - chain.probability_of("C", "V")
print(f"second eigenvalue {second_eigenvalue:.4f}")
print(f"settles at {chain.stationary_distribution()['V']:.4f}")`,`1 steps on: vowel with chance 0.2000 from a vowel, 0.4286 from a consonant
2 steps on: vowel with chance 0.3829 from a vowel, 0.3306 from a consonant
3 steps on: vowel with chance 0.3411 from a vowel, 0.3530 from a consonant
4 steps on: vowel with chance 0.3506 from a vowel, 0.3479 from a consonant
5 steps on: vowel with chance 0.3484 from a vowel, 0.3491 from a consonant
6 steps on: vowel with chance 0.3489 from a vowel, 0.3488 from a consonant
second eigenvalue -0.2286
settles at 0.3488`,{...{ hints: ["distribution_after takes a starting state name and a number of steps, and answers a distribution over the chain’s states indexed by name, so indexing it with V reads the chance of a vowel.", "For two states the second eigenvalue is p_VV less p_CV, read off probability_of. Its sign says whether the walks cross and its size says how much of the remaining distance each step leaves."], check: numberCheck("What chance of a vowel does the Dinah chain give two steps after a vowel?", 0.3829, 0.0005, "The two-step prediction includes both possible intermediate letter classes. The negative second eigenvalue explains alternating sides of the stationary share while the distribution approaches it for this aperiodic chain.") },question:"How does the next-letter distribution change over repeated steps?"}),
            exercise("Score the sentence under its own chain",["Score the V/C sequence of Oh my dear Dinah with log_probability_of. Confirm the result by adding the natural logarithm of each of its twelve transition probabilities. Print the log probability, its exponential and your manual log sum, then score the V/C sequence of banana with the same fitted chain.", "The first state is supplied rather than predicted, leaving twelve transition terms for thirteen letters. These scores describe the class sequences, not probabilities for the exact English letters or words."],`import math
from oop_ml import MarkovChain

sentence = "oh my dear dinah"
dinah = [("V" if letter in "aeiou" else "C") for letter in sentence if letter != " "]

chain = MarkovChain().fit([dinah])
# Print the log probability the chain gives its own sentence, and the
# probability that is. Add the twelve logarithms by hand from the counts,
# one of 1/5, four of 4/5, three of 3/7 and four of 4/7, and print the sum.
# Then score the classes of the word banana under the same chain.`,`import math
from oop_ml import MarkovChain

sentence = "oh my dear dinah"
dinah = [("V" if letter in "aeiou" else "C") for letter in sentence if letter != " "]

chain = MarkovChain().fit([dinah])

log_probability = chain.log_probability_of(dinah)
print(f"log probability of the sentence under its own chain {log_probability:.4f} nats")
print(f"probability {math.exp(log_probability):.6f}")

by_hand = math.log(1 / 5) + 4 * math.log(4 / 5) + 3 * math.log(3 / 7) + 4 * math.log(4 / 7)
print(f"the twelve logarithms added by hand {by_hand:.4f} nats")

banana = [("V" if letter in "aeiou" else "C") for letter in "banana"]
print(f"log probability of banana's classes {chain.log_probability_of(banana):.4f} nats")`,`log probability of the sentence under its own chain -7.2824 nats
probability 0.000688
the twelve logarithms added by hand -7.2824 nats
log probability of banana's classes -2.9882 nats`,{...{ hints: ["log_probability_of takes one sequence of state names and answers the sum of the natural logarithms of each step’s probability, given the first state, so the exponential of it is the probability of the twelve steps together.", "The steps in the sentence are one vowel to vowel, four vowel to consonant, three consonant to vowel and four consonant to consonant, so the sum by hand has those four terms with those four counts.", "banana’s classes are C V C V C V, five steps, every one a step the Dinah chain counted, so nothing in it has probability zero."], check: numberCheck("What log probability does the chain give Oh my dear Dinah, in nats?", -7.2824, 0.0005, "Conditioning on the first class leaves one transition term for each later letter. Adding natural-log transition probabilities calculates the same sequence score without multiplying many small numbers.") },question:"What probability does the fitted chain assign to each sentence?"}),
            exercise("Count the three chains where the method stops being defined",["For spa, banana and the separate sequences rhythm and aeiou, fit a chain with smoothing=0.5 and print its stationary vowel share. Then try each case without smoothing. Print any fit error; for successful fits, print the transition table and vowel probabilities over steps zero through five.","Request a stationary distribution from each successful unsmoothed fit and catch any non-uniqueness error. Compare three distinct issues: an outgoing row with no observations, deterministic alternation and separate closed classes. Use the smoothed stationary shares as a comparison, not evidence that the original sequences had those transitions."],`from oop_ml import MarkovChain, NonUniqueStationaryDistributionError, TooFewValuesError

groups = {"spa": ["spa"], "banana": ["banana"], "rhythm and aeiou": ["rhythm", "aeiou"]}
for label, words in groups.items():
    sequences = [[("V" if letter in "aeiou" else "C") for letter in word] for word in words]
    # Fit a chain smoothed by a half and print where it settles for a vowel.
    # Then fit the chain as counted, with no smoothing: print the refusal if
    # there is one, otherwise print its table, the chance of a vowel over
    # the first six steps from the first state, and its stationary vowel
    # share, or the refusal if it has no single one.
    pass`,`from oop_ml import MarkovChain, NonUniqueStationaryDistributionError, TooFewValuesError

groups = {"spa": ["spa"], "banana": ["banana"], "rhythm and aeiou": ["rhythm", "aeiou"]}
for label, words in groups.items():
    sequences = [[("V" if letter in "aeiou" else "C") for letter in word] for word in words]
    smoothed = MarkovChain(smoothing=0.5).fit(sequences)
    print(f"{label}: smoothed to a half, settles at {smoothed.stationary_distribution()['V']:.4f} for a vowel")
    try:
        chain = MarkovChain().fit(sequences)
    except TooFewValuesError as refusal:
        print(f"{label}: as counted, refused. {refusal}")
        continue
    table = [[round(chain.probability_of(source, target), 2) for target in ("V", "C")] for source in ("V", "C")]
    walk = [round(chain.distribution_after(sequences[0][0], steps)["V"], 2) for steps in range(6)]
    print(f"{label}: as counted, table {table}, chance of a vowel over six steps {walk}")
    try:
        print(f"{label}: as counted, stationary vowel share {chain.stationary_distribution()['V']:.4f}")
    except NonUniqueStationaryDistributionError as refusal:
        print(f"{label}: as counted, no single answer. {refusal}")`,`spa: smoothed to a half, settles at 0.5000 for a vowel
spa: as counted, refused. ['V'] never began a counted step, so each has a row of transitions that is zero over zero. Give a smoothing above zero, or count sequences that leave them
banana: smoothed to a half, settles at 0.5122 for a vowel
banana: as counted, table [[0.0, 1.0], [1.0, 0.0]], chance of a vowel over six steps [0.0, 1.0, 0.0, 1.0, 0.0, 1.0]
banana: as counted, stationary vowel share 0.5000
rhythm and aeiou: smoothed to a half, settles at 0.4545 for a vowel
rhythm and aeiou: as counted, table [[1.0, 0.0], [0.0, 1.0]], chance of a vowel over six steps [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
rhythm and aeiou: as counted, no single answer. this chain has 2 closed groups of states, ('C',), ('V',). A walk that enters one never leaves it, so each has its own stationary distribution and every mixture of them is stationary too; there is no single one to give. A smoothing above zero joins them`,{...{ hints: ["A state that never begins a step is refused by fit with TooFewValuesError when the smoothing is zero, and the message names the state. Catching it and continuing is what lets the loop reach the other two.", "stationary_distribution raises NonUniqueStationaryDistributionError when there is more than one closed group of states, and the message names the groups. It still answers on banana, where there is one closed group, even though no walk arrives there.", "distribution_after from the first state of the first word shows the lockstep on banana, certainly a consonant after every even step and certainly a vowel after every odd one."], check: numberCheck("Where does banana’s chain settle for a vowel once smoothed by a half?", 0.5122, 0.0005, "Positive smoothing permits repeated states and breaks the deterministic alternation, so next-step distributions can converge. Without smoothing the alternating chain still has a stationary half-and-half distribution: it stays unchanged if used as the starting distribution, while a start concentrated on one class oscillates.") },question:"How do missing transitions, periodicity and separate closed groups affect the chain?",hints:["With no smoothing, fit refuses a state that has no observed outgoing step. Catch TooFewValuesError so the other examples can still run.","stationary_distribution raises NonUniqueStationaryDistributionError for multiple closed groups. It still answers for the alternating banana chain; existence of a stationary distribution does not imply convergence from a particular starting state.","Use distribution_after from the first state of the word to observe the alternating distributions, then compare with positive smoothing."]}),
          ],
        },
      ]}
    />
  );
}
