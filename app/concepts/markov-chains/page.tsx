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
  title: "Markov Chains · oop_ml",
  description:
    "Model the next state using the current one, then follow the consequences over several steps.",
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
      playgroundIntro="Read one row of the transition table as the possible next states from the current state. Compare one step with several repeated steps."
      title="Markov Chains"
      tagline="Model the next state using the current one, then follow the consequences over several steps."
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
                <p>
                  Take the first two chapters of Alice&rsquo;s Adventures in
                  Wonderland, 128 sentences and 16,803 letters once the spaces
                  are gone, and sort every letter into a vowel or a consonant
                  the way Markov sorted Pushkin. A little over a third of them
                  are vowels, 38.14 percent. If the letters were drawn
                  independently, like a coin weighted towards consonants, the
                  chance of a vowel would be 38.14 percent after anything at all,
                  and knowing the letter before would tell us nothing.
                </p>
                <>
<p>
                  It tells us a great deal. After a vowel the next letter is a vowel 14.61 percent of the time, and after a consonant it is a vowel 52.70 percent of the time, so the kind of letter just read moves the chance of a vowel by a factor of more than three and a half.
                </p>
                <p>
                  Two choices were made before any counting. Spaces are dropped, as Markov dropped them, and y is counted as a consonant, which is the usual convention and is wrong for a word like rhythm; a different choice would move every number on the page slightly.
                </p>
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
                  A sequence that behaves this way is a Markov chain, the
                  letters or whatever else it moves between are its states, and
                  pᵢⱼ is the probability of a step from state i to state j. The
                  claim is one of conditional independence. The letter two
                  places back still predicts the next letter, since it predicts
                  the letter in between, and step 17 measures by how much; what
                  the assumption says is that once the letter in between is
                  known, the one before it adds nothing further.
                </p>
                <p>
                  A second assumption is folded into that equation, and it is
                  easy to miss because it has no symbol of its own. The same pᵢⱼ
                  is used at every position of every sentence, in the first
                  chapter and the third alike, so the chain is homogeneous in
                  time. Step 14 checks it by counting each chapter separately.
                </p>
                <KeepInMind>
                  A Markov chain claims that the next state depends on the
                  present one alone, and that the rule for that dependence
                  never changes along the sequence. English satisfies neither
                  claim exactly, and the rest of the page measures by how much.
                </KeepInMind>
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
                <p>
                  Fitting a chain means counting its steps. Every adjacent pair
                  of letters is one observed step from the first letter&rsquo;s
                  state to the second&rsquo;s, and each row of counts divided by
                  its total is that state&rsquo;s row of the table. Nothing is
                  iterated, tuned or searched.
                </p>
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
                  The one-sentence table and the two-chapter table have the same
                  shape, a vowel followed less often by a vowel than a consonant
                  is, and they disagree about how much, 0.2000 against 0.1461.
                  Twelve steps are a very small sample of a habit that 16,675
                  steps describe well.
                </KeepInMind>
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
                <WhyThisWorks title="Why the ratio maximises the likelihood, for any number of states">
                  <p>
                    Write nᵢⱼ for the count of steps from i to j. The log
                    likelihood of every counted step is the sum over i and j of
                    nᵢⱼ ln pᵢⱼ, and the only constraint is that each row sums to
                    one. Row i appears nowhere but in its own terms, so each row
                    can be maximised on its own, with one Lagrange multiplier
                    for its one constraint.
                  </p>
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
                  <p>
                    A count of zero gives a probability of zero, which is why a
                    step the text never took is impossible under the fitted
                    table, the problem the n-grams page spends its middle on.
                    And a state that never began a step has nᵢ = 0, so its row
                    is zero over zero, which is where Part 7 starts.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The counted table is the maximum-likelihood estimate, row by
                  row, and it is conditioned on the first letter of every
                  sentence, which it takes as given and does not try to
                  predict.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What the count leaves out">
                <p>
                  Counting stops at the end of each sentence. The last letter of
                  one sentence and the first of the next are never counted as a
                  step, because nobody wrote them as one, and each sentence is a
                  separate sequence. That is why 16,803 letters give 16,675
                  steps, 128 fewer than one unbroken run of letters would give,
                  one for each sentence.
                </p>
                <p>
                  The first letter of each sentence is a second thing the count
                  leaves out. A chain is a table of steps, and a step needs
                  somewhere to start, so the first state of each sequence is
                  taken as given. Where sentences tend to start is a separate
                  distribution over a separate quantity, and a model that wanted
                  it would have to count it separately; the chain on this page
                  never learns it, and when it scores a sentence in Part 5 it
                  scores every letter but the first.
                </p>
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
              "That is what independence would mean here, and it is exactly what the counts refuse. A vowel follows a vowel 14.61 percent of the time and follows a consonant 52.70 percent of the time, so the letter just read moves the chance of a vowel by a factor of more than three and a half.",
            ),
            trueFalse(
              "Counting y as a vowel rather than a consonant would leave the table unchanged.",
              false,
              "Both choices made before any counting feed straight into the counts, dropping the spaces and treating y as a consonant, and a different choice would move every number on the page slightly. The convention is also wrong for a word like rhythm, which is why it is stated before any figure is quoted.",
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
              "The probability of the text is a product of one table entry per step, and for the vowel row that is p_VV 933 times and 1 − p_VV 5,451 times, which is largest at 933 over 6,384; the same argument holds row by row for any number of states, since no two rows share a parameter. Counting stops at the end of each sentence, so 128 sentences take 128 steps off 16,803 letters, and the first letter of each sentence begins a step without being predicted. A count of zero gives a probability of zero, which is where smoothing enters in Part 6.",
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
                  For two states the speed at which a chain forgets its start is
                  its second eigenvalue exactly, and for more states the largest
                  eigenvalue after the first sets the pace in the long run. A
                  chain whose second eigenvalue has size one never forgets, and
                  Part 7 builds one.
                </KeepInMind>
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
                <p>
                  It is called the stationary distribution. For two states the
                  balance can be solved by hand, since the flow from vowels to
                  consonants has to equal the flow back.
                </p>
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
                  The stationary distribution is a fact about the table and says
                  nothing about any particular walk. Whether a walk actually
                  arrives there is a separate question, and Part 7 has a chain
                  where it never does.
                </KeepInMind>
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
<p>
                  Whether it has exactly one is decided by which states can reach which, and none of the magnitudes matter. If every state can eventually reach every other, the chain has exactly one stationary distribution, which is the theorem of Perron and Frobenius applied to a table of probabilities, and more generally it has exactly one whenever there is a single group of states that a walk can enter and never leave.
                </p>
                <p>
                  A table with every entry above zero satisfies both, which is one of the things smoothing does, and Part 7 is about the tables that fail.
                </p>
</>
                <KeepInMind>
                  Solving and walking give the same answer on a chain like this
                  one. On a chain whose walk cycles, only solving has an answer,
                  and Part 7 says what that answer then means.
                </KeepInMind>
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
                  That agreement is almost guaranteed, and it is worth seeing why before being impressed by it. Take the share of steps that start at each letter and multiply it by the table. What comes out is the share of steps that end at each letter, and the two shares differ only by the first and last letter of each sentence, so the text&rsquo;s own letter shares nearly solve πP = π by construction.
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
                  A chain counted on a text settles close to that text&rsquo;s
                  own shares whether or not the chain describes the text well,
                  so that agreement is no evidence for the chain. Agreement on
                  text the chain never counted is evidence, and here it holds to
                  within a hundredth.
                </KeepInMind>
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
                <p>
                  Whether that drift is the third chapter having different
                  habits or the ordinary variation in a count of a couple of
                  thousand vowels is a question this chain cannot ask, since it
                  has one table and no notion of position. A chain allowed a
                  different table in each chapter would be a different model,
                  with three times as many numbers to count.
                </p>
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
                <p>
                  One letter of memory saves 0.8234 bits on every letter of text
                  the chain had never seen, a fifth of what the frequencies
                  alone cost. On Markov&rsquo;s two classes the saving is 0.0992
                  bits out of a possible one, a tenth. The positions are a
                  common set, chosen so that every model compared in this Part
                  and the next can score every one of them, and 71 positions of
                  the third chapter are set aside because the two letters before
                  them, or the two ending on them, never occurred together in the
                  first two chapters, which matters to the pair chain of Part 6
                  and to nothing here.
                </p>
                <KeepInMind>
                  Bits per letter on text the model never counted is the fair
                  score, since a model scored on its own text is scored partly
                  on what it memorised. The third chapter was never counted by
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
                <p>
                  So of the 0.1052 miss on Alice, about half is the grouping and the rest is the text.
                </p>
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
                <p>
                  Within the length of a short word the chain has forgotten what
                  it was reading, which is Part 3&rsquo;s eigenvalue arithmetic
                  seen on real text. The text has not forgotten, as step 17
                  showed, and the difference between those two statements is
                  exactly what the one-step assumption throws away.
                </p>
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
              "After one step they are far apart, 0.1461 against 0.5270; after two they have crossed, 0.4713 against 0.3263, and after three crossed back, 0.3475 against 0.4027. For two states the gap to the settled share is multiplied at every step by the second eigenvalue, p_VV less p_CV, which is 0.1461 less 0.5270, or −0.3808. The sign is the alternation and the size is the speed, each step leaving 0.3808 of the remaining distance, so by the fifth step both walks are within half a hundredth of 0.3816.",
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
              "On oh my dear Dinah, a single sentence where the two ends are two of its thirteen letters, the gap is 0.3846 against 0.3488; on 128 sentences it is 0.3814 against 0.3816, close but not equal. The checks that count are the ones the construction does not force. The third chapter, never counted, is 39.16 percent vowels, 0.0100 above where the chain settles, and over the letters its largest gap is 0.0097, for d. That agreement is evidence, and it holds to within a hundredth.",
            ),
            trueFalse(
              "The stationary distribution is where every walk ends up, so a chain whose walk never settles has none.",
              false,
              "It is the distribution a single step leaves unchanged, π P = π with the entries summing to one, which is a fact about the table and says nothing about any particular walk. For two states the balance solves by hand, the flow from vowels to consonants, π_V times 0.8539, equal to the flow back, π_C times 0.5270, which puts the chance of a vowel at 0.3816. Whether a walk arrives there is a separate question, and banana’s chain in Part 7 has exactly one stationary distribution, half and half, that no walk reaches, since the walk is certainly at a consonant after every even step.",
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
              "Bits per letter on text the model never counted is the fair score, since a model scored on its own text is scored partly on what it memorised. A uniform guess would cost 4.7549 bits, the letter shares alone 4.0670 and the letter chain 3.2436, all on the same 8,357 positions. On Markov’s two classes the saving is 0.0992 bits out of a possible one, a tenth, because grouping twenty-six letters into two classes leaves far less to predict.",
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
                <p>
                  A chain that remembers two letters needs no new machinery.
                  Make each state a pair of adjacent letters, so the text the
                  becomes the states th and he, and a step from th to he is
                  exactly a prediction of e from the two letters before it. The
                  Markov property holds for pairs as it did for letters, and
                  everything in Parts 2 to 4 applies unchanged, counting
                  included. A chain remembering k letters is a chain whose states
                  are runs of k.
                </p>
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
                  Longer memory always fits the counted text better, and on text
                  the chain never counted it helps only while each state has
                  been seen often enough to trust. On two classes it stops paying
                  at three to five classes, depending on the smoothing, and on
                  twenty-seven letters it stops much sooner.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The table grows as a power of the memory">
                <p>
                  The price of k letters of memory is a table over 27ᵏ possible
                  states, each with a row of 27ᵏ entries. The first two chapters
                  actually produce 27 letters, 363 pairs and 1,982 runs of three,
                  and those are the states each chain holds, since a state never
                  seen gets no row at all.
                </p>
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
                <p>
                  The pair chain ought to beat the letter chain on the third
                  chapter, since it knows strictly more. As counted it cannot be
                  scored at all, because 261 of its steps on the third chapter
                  were never counted in the first two, so it needs smoothing,
                  and the widget sweeps how much.
                </p>
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
<p>
                  The reason is in the shape of the pair table. Additive smoothing adds the same count to every cell of a row, and a row of the pair chain has 363 cells, one for every pair seen anywhere. After th the next state has to begin with h, and in the first two chapters h was followed by only nine different symbols, so at most nine of those 363 cells can ever be right.
                </p>
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
          title: "Part 7. Where the Method Stops Being Defined",
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
<p>
                  There are four things anyone can do, and each costs something. Give the stranded state an even row, which invents an observation that it is followed by everything equally. Send it to itself with certainty, which invents a different observation and changes the chain&rsquo;s structure, since the state becomes a trap that every long walk eventually falls into and that then holds the whole stationary distribution.
                </p>
                <p>
                  Refuse to build the table until text arrives that leaves the state. Or add the same small count to every cell of every row, which gives the stranded row an even spread as a side effect of a choice made for every row at once, and carries the cost Part 6 measured.
                </p>
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
                  What survives is a weaker statement. Averaged over a long walk,
                  the walk spends half its time at each state, and the
                  widget&rsquo;s share of time over the first thousand steps
                  reads 0.5 and 0.5. On a periodic chain the stationary
                  distribution means the share of time and nothing about where
                  the walk will be at any particular step. A smoothing of a half
                  breaks the lockstep, since each state can now repeat, and the
                  smoothed chain settles at 0.5122 for a vowel, where every walk
                  arrives.
                </p>
                <KeepInMind>
                  Banana&rsquo;s chain has exactly one stationary distribution
                  and no walk that reaches it. Having one needs every state
                  reachable from every other, and reaching it needs, besides,
                  that the walk not cycle in lockstep.
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
                  One closed group gives one stationary distribution, with every
                  state outside that group given a share of zero. Two closed
                  groups give infinitely many, and no amount of computation picks
                  one of them, since the choice was made by where the walk began.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. The edges gathered">
                <p>
                  Beside the three cases above there are other places where the
                  definition has nothing to say, or says something that has to be
                  decided before it means anything. Each row is a fact about the
                  mathematics of a counted chain, and several carry a choice that
                  somebody has to make.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
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
                        "one stationary distribution, reached from every start at a rate set in the long run by the second eigenvalue. Any table with every entry above zero is in this case.",
                    },
                    {
                      expression: "every state reaching every other, in lockstep",
                      reason:
                        "one stationary distribution and no limit. It is the long-run share of time, and a walk read at any single step is certainly at one state or another.",
                    },
                    {
                      expression: "one closed group, with states that drain into it",
                      reason:
                        "one stationary distribution, zero on every state outside the group, so a reducible chain is not necessarily ambiguous.",
                    },
                    {
                      expression: "two or more closed groups",
                      reason:
                        "every mixture of the groups’ own distributions is stationary, so there is no single answer, and where the walk starts decides where it settles.",
                    },
                    {
                      expression: "the states of a chain grouped into fewer",
                      reason:
                        "the grouped sequence is not in general a Markov chain, since what happens next can depend on which member of the group the walk is at. Vowels and consonants read off the letter chain’s own writing miss two steps on by 0.0476.",
                    },
                    {
                      expression: "a table that changes along the text",
                      reason:
                        "outside the model. A chain has one table for every position, and a text whose habits drift is given their average.",
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
                "The difficulty is an artefact of toy inputs such as the word spa",
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
              "Having exactly one needs a single closed group of states, and none of the magnitudes matter. banana’s chain cycles in lockstep, so its one stationary distribution, half and half, is the share of time over a long walk and no walk ever settles there, which the widget reads as 0.5 and 0.5 over the first thousand steps. asks is reducible, since the vowel cannot be reached from the consonant, and still has exactly one, all of it on the consonant. rhythm and aeiou give two closed groups, so every mixture is stationary and where the walk starts decides, and spa’s vowel is never left, so its table does not exist until something is decided.",
            ),
          ],
        },
        {
          title: "Practice. Counting Chains With the Library",
          practice: [
            exercise(
              "Count Oh my dear Dinah with the library",
              ["Part 2 counted the thirteen letters of Oh my dear Dinah by hand into twelve steps, a vowel row of 1 and 4 giving 0.2000 and 0.8000, and a consonant row of 3 and 4 giving 0.4286 and 0.5714. Part 4 then solved the balance for a stationary vowel share of 15 over 43. Fit the chain with the library on the same classes and read every one of those numbers off it.", "The y of my is a consonant by the page’s convention, which the class mapping in the starter already makes. The observed share of vowels is 5 of 13, and the page says why it differs from the stationary share on so short a sentence."],
              `from oop_ml import MarkovChain

sentence = "oh my dear dinah"
dinah = [("V" if letter in "aeiou" else "C") for letter in sentence if letter != " "]

# Fit a chain on the one sequence. Print how many steps it counted, then for
# each state its row of counts and its row of probabilities, then the
# stationary vowel share and the sentence's own share of vowels.`,
              `from oop_ml import MarkovChain

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
print(f"observed vowel share {dinah.count('V') / len(dinah):.4f}")`,
              `classes VCCCCVVCCVCVC, 13 letters, 12 steps
after V: counts [1, 4], probabilities [0.2, 0.8]
after C: counts [3, 4], probabilities [0.4286, 0.5714]
stationary vowel share 0.3488
observed vowel share 0.3846`,
              { hints: ["fit takes a list of sequences, and each sequence is a list of state names, so the one sentence goes in as a list holding one list. A bare string is refused, since it would be read as its letters.", "transition_counts has count_of(source, target) and n_transitions, and probability_of(source, target) on the chain reads the table. All of them take the state names.", "stationary_distribution answers a distribution indexed by state name, so indexing it with V reads the vowel share."], check: numberCheck("What stationary vowel share does the chain on Oh my dear Dinah report?", 0.3488, 0.0005, "The flow from vowels to consonants has to equal the flow back, so the vowel share is p_CV over p_CV plus p_VC, which is 3/7 over 3/7 plus 4/5, 15 over 43. The sentence itself is 5 of 13 vowels, 0.3846, and the two differ because the first and last letters of a thirteen-letter sentence are a sizeable part of it; on 128 sentences the same gap is 0.3814 against 0.3816.") },
            ),
            exercise(
              "Walk the Dinah chain forward and watch it forget",
              ["Part 3 carried the two-chapter chain several steps ahead and found the walks from a vowel and from a consonant crossing before settling, with the gap to the settled share shrinking by the table’s second eigenvalue at every step. Do the same on the Dinah chain, whose table is 0.2 and 0.8 after a vowel and 3/7 and 4/7 after a consonant.", "Two steps on from a vowel is a number the page never prints for this chain. The two-chapter chain gave 0.4713 there, and Part 3 says how to get it from the table by hand, the two routes through the letter in between added together."],
              `from oop_ml import MarkovChain

sentence = "oh my dear dinah"
dinah = [("V" if letter in "aeiou" else "C") for letter in sentence if letter != " "]

chain = MarkovChain().fit([dinah])
# For one to six steps, print the chance of a vowel that many steps after a
# vowel and after a consonant. Then print the table's second eigenvalue,
# p_VV less p_CV, and the stationary vowel share the walks settle at.`,
              `from oop_ml import MarkovChain

sentence = "oh my dear dinah"
dinah = [("V" if letter in "aeiou" else "C") for letter in sentence if letter != " "]

chain = MarkovChain().fit([dinah])
for steps in range(1, 7):
    from_vowel = chain.distribution_after("V", steps)["V"]
    from_consonant = chain.distribution_after("C", steps)["V"]
    print(f"{steps} steps on: vowel with chance {from_vowel:.4f} from a vowel, {from_consonant:.4f} from a consonant")

second_eigenvalue = chain.probability_of("V", "V") - chain.probability_of("C", "V")
print(f"second eigenvalue {second_eigenvalue:.4f}")
print(f"settles at {chain.stationary_distribution()['V']:.4f}")`,
              `1 steps on: vowel with chance 0.2000 from a vowel, 0.4286 from a consonant
2 steps on: vowel with chance 0.3829 from a vowel, 0.3306 from a consonant
3 steps on: vowel with chance 0.3411 from a vowel, 0.3530 from a consonant
4 steps on: vowel with chance 0.3506 from a vowel, 0.3479 from a consonant
5 steps on: vowel with chance 0.3484 from a vowel, 0.3491 from a consonant
6 steps on: vowel with chance 0.3489 from a vowel, 0.3488 from a consonant
second eigenvalue -0.2286
settles at 0.3488`,
              { hints: ["distribution_after takes a starting state name and a number of steps, and answers a distribution over the chain’s states indexed by name, so indexing it with V reads the chance of a vowel.", "For two states the second eigenvalue is p_VV less p_CV, read off probability_of. Its sign says whether the walks cross and its size says how much of the remaining distance each step leaves."], check: numberCheck("What chance of a vowel does the Dinah chain give two steps after a vowel?", 0.3829, 0.0005, "The walk passes through a vowel with chance 0.2 and then reaches a vowel with chance 0.2, or passes through a consonant with chance 0.8 and then reaches a vowel with chance 3/7, so 0.04 plus 0.3429, which is the table squared read at the vowel row. The second eigenvalue is 0.2 less 0.4286, so each step leaves 0.2286 of the remaining distance and the sign makes the two walks cross, 0.3829 against 0.3306 after two steps, before both settle at 0.3488.") },
            ),
            exercise(
              "Score the sentence under its own chain",
              ["Part 2 says the counted table is the one under which the counted text is most probable, and that the probability of a text is a product of one table entry per step, given its first letter. Ask the chain for the log probability of Oh my dear Dinah, confirm it by adding the twelve logarithms yourself, and then score a sentence the chain never counted, the classes of banana.", "The two-chapter chain gives its text a log likelihood of −9,773.73 nats. The number for the thirteen-letter sentence is one the page does not print, and the first letter is never scored, which is why thirteen letters give twelve terms."],
              `import math
from oop_ml import MarkovChain

sentence = "oh my dear dinah"
dinah = [("V" if letter in "aeiou" else "C") for letter in sentence if letter != " "]

chain = MarkovChain().fit([dinah])
# Print the log probability the chain gives its own sentence, and the
# probability that is. Add the twelve logarithms by hand from the counts,
# one of 1/5, four of 4/5, three of 3/7 and four of 4/7, and print the sum.
# Then score the classes of the word banana under the same chain.`,
              `import math
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
print(f"log probability of banana's classes {chain.log_probability_of(banana):.4f} nats")`,
              `log probability of the sentence under its own chain -7.2824 nats
probability 0.000688
the twelve logarithms added by hand -7.2824 nats
log probability of banana's classes -2.9882 nats`,
              { hints: ["log_probability_of takes one sequence of state names and answers the sum of the natural logarithms of each step’s probability, given the first state, so the exponential of it is the probability of the twelve steps together.", "The steps in the sentence are one vowel to vowel, four vowel to consonant, three consonant to vowel and four consonant to consonant, so the sum by hand has those four terms with those four counts.", "banana’s classes are C V C V C V, five steps, every one a step the Dinah chain counted, so nothing in it has probability zero."], check: numberCheck("What log probability does the chain give Oh my dear Dinah, in nats?", -7.2824, 0.0005, "Twelve steps, one table entry each, and the logarithm of the product is the sum of the logarithms, one of 1/5, four of 4/5, three of 3/7 and four of 4/7. Part 2 says no other table can give the sentence a larger value, since each row is its counts over its own total, and the same calculation on the two chapters gives −9,773.73 nats. The first letter is taken as given and never scored.") },
            ),
            exercise(
              "Count the three chains where the method stops being defined",
              ["Part 7 counts chains on spa, whose vowel is never left, on banana, whose classes alternate in lockstep, and on rhythm and aeiou together, whose table is the identity. Count all three with the library, as counted and smoothed by a half, and see which question each refuses to answer.", "The page says the first is refused at the fit, the second has exactly one stationary distribution that no walk reaches, and the third has a whole line of them. Smoothed by a half, banana settles at 0.5122 for a vowel and the two words at 0.4545."],
              `from oop_ml import MarkovChain, NonUniqueStationaryDistributionError, TooFewValuesError

groups = {"spa": ["spa"], "banana": ["banana"], "rhythm and aeiou": ["rhythm", "aeiou"]}
for label, words in groups.items():
    sequences = [[("V" if letter in "aeiou" else "C") for letter in word] for word in words]
    # Fit a chain smoothed by a half and print where it settles for a vowel.
    # Then fit the chain as counted, with no smoothing: print the refusal if
    # there is one, otherwise print its table, the chance of a vowel over
    # the first six steps from the first state, and its stationary vowel
    # share, or the refusal if it has no single one.
    pass`,
              `from oop_ml import MarkovChain, NonUniqueStationaryDistributionError, TooFewValuesError

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
        print(f"{label}: as counted, no single answer. {refusal}")`,
              `spa: smoothed to a half, settles at 0.5000 for a vowel
spa: as counted, refused. ['V'] never began a counted step, so each has a row of transitions that is zero over zero. Give a smoothing above zero, or count sequences that leave them
banana: smoothed to a half, settles at 0.5122 for a vowel
banana: as counted, table [[0.0, 1.0], [1.0, 0.0]], chance of a vowel over six steps [0.0, 1.0, 0.0, 1.0, 0.0, 1.0]
banana: as counted, stationary vowel share 0.5000
rhythm and aeiou: smoothed to a half, settles at 0.4545 for a vowel
rhythm and aeiou: as counted, table [[1.0, 0.0], [0.0, 1.0]], chance of a vowel over six steps [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
rhythm and aeiou: as counted, no single answer. this chain has 2 closed groups of states, ('C',), ('V',). A walk that enters one never leaves it, so each has its own stationary distribution and every mixture of them is stationary too; there is no single one to give. A smoothing above zero joins them`,
              { hints: ["A state that never begins a step is refused by fit with TooFewValuesError when the smoothing is zero, and the message names the state. Catching it and continuing is what lets the loop reach the other two.", "stationary_distribution raises NonUniqueStationaryDistributionError when there is more than one closed group of states, and the message names the groups. It still answers on banana, where there is one closed group, even though no walk arrives there.", "distribution_after from the first state of the first word shows the lockstep on banana, certainly a consonant after every even step and certainly a vowel after every odd one."], check: numberCheck("Where does banana’s chain settle for a vowel once smoothed by a half?", 0.5122, 0.0005, "A smoothing of a half adds half a step to every cell, so each state can now repeat and the lockstep is broken. The consonant row becomes 3.5 of 4 to a vowel and the vowel row 2.5 of 3 to a consonant, and the balance gives 0.875 over 0.875 plus 0.8333, which is 0.5122, where every walk now arrives. As counted the table is the flip, with exactly one stationary distribution, half and half, that no walk reaches.") },
            ),
          ],
        },
      ]}
    />
  );
}
