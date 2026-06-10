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
    "A Markov chain lets the next state depend on the current one and nothing earlier, so fitting it is counting and dividing. Counted on Alice, one letter of memory saves a fifth of the bits a letter costs, and misses what the text does two letters on by a tenth.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function MarkovChainsPage() {
  return (
    <ConceptPage
      title="Markov Chains"
      tagline="A Markov chain counts which letter follows which and divides each row by its total, and that one table then says where a walk goes next, where it settles in the long run, and what it has no way to remember."
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
      history={
        <>
          <p>
            Every law of large numbers proved before the twentieth century was
            proved for independent trials. Jacob Bernoulli&rsquo;s, published in
            1713, concerned repeated draws that do not influence one another,
            and Pafnuty Chebyshev&rsquo;s of 1867 still assumed independence, so
            nobody had shown whether the average of a long run of dependent
            events settles at all. Pavel Nekrasov, in Moscow, argued in 1902
            that independence was necessary for the law to hold, and drew a
            conclusion about free will from it. Andrei Markov, Chebyshev&rsquo;s
            student at St Petersburg, set out to refute him, and his 1906 paper
            extending the law of large numbers to quantities that depend on
            each other did it with the simplest dependence he could write down,
            a sequence in which each trial depends on the one immediately before
            it and on nothing earlier. He showed that the averages of such a
            sequence still settle, and the place they settle is what Part 4 of
            this page calls the stationary distribution.
          </p>
          <p>
            Markov&rsquo;s chains were an abstraction until 1913, when he wanted
            an example nobody could call contrived and counted one out of
            Pushkin. He took the first 20,000 letters of Eugene Onegin, removed
            the spaces and the punctuation, marked each letter as a vowel or a
            consonant, and counted how often each kind followed each kind, and
            his paper to the Imperial Academy of Sciences, &ldquo;An example of
            statistical investigation of the text Eugene Onegin concerning the
            connection of samples in chains&rdquo;, reported that a vowel was far
            less likely after a vowel than after a consonant, which is exactly
            the dependence the independent law could not cover. This page
            repeats his count on the first two chapters of Alice&rsquo;s
            Adventures in Wonderland, and English gives the same shape. Shannon
            took the counting in another direction in 1948. His &ldquo;A
            Mathematical Theory of Communication&rdquo; builds text from letter
            counts with no memory, then with one letter of it, then two, calls
            the dependent ones discrete Markoff processes, and prints what each
            writes, and Part 5 does the same with Alice.
          </p>
          <p>
            What the method needed next was an account of when a chain has
            exactly one place to settle. Oskar Perron proved in 1907 that a
            matrix of positive entries has one eigenvector with every entry
            positive, and Georg Frobenius extended the result to matrices with
            zeros in 1912, which is where the conditions of Part 7 come from,
            that every state be reachable from every other and that the walk
            not cycle in lockstep. The best-known use of the answer is Sergey
            Brin and Lawrence Page&rsquo;s 1998 paper on the search engine that
            became Google, which ranks a web page by the share of time a random
            walk along links spends on it, the stationary distribution of a very
            large chain, and which adds a small probability of jumping to any
            page at all so that the chain has only one. That repair is Part
            7&rsquo;s smoothing under another name.
          </p>
          <p>
            The page asks six questions in order. What goes wrong if letters are
            treated as independent draws, and what did Markov assume instead?
            What does fitting a chain count, and why is dividing the counts the
            best answer the text allows? What does the chain predict several
            steps ahead, and how quickly does it forget where it started? Where
            does it settle, and do the letters of the text agree? What does one
            letter of memory buy on a chapter the chain never counted, what does
            it throw away, and what does a longer memory cost? And where does
            the question of where a chain settles stop having an answer?
          </p>
        </>
      }
      playground={<MarkovPlayground />}
      sections={[
        {
          title: "Part 1. Letters That Remember the Letter Before",
          defaultOpen: true,
          content: (
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
                <p>
                  It tells us a great deal. After a vowel the next letter is a
                  vowel 14.61 percent of the time, and after a consonant it is a
                  vowel 52.70 percent of the time, so the kind of letter just
                  read moves the chance of a vowel by a factor of more than
                  three and a half. Two choices were made before any counting.
                  Spaces are dropped, as Markov dropped them, and y is counted
                  as a consonant, which is the usual convention and is wrong for
                  a word like rhythm; a different choice would move every number
                  on the page slightly.
                </p>
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
          ),
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
                <p>
                  Run the same tally over all 128 sentences of the first two
                  chapters and the table in step 3 comes out. A vowel began
                  6,384 steps and was followed by a vowel in 933 of them, and a
                  consonant began 10,291 steps and was followed by a vowel in
                  5,423, so the vowel row is 933 over 6,384 and the consonant
                  row 5,423 over 10,291.
                </p>
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
                <p>
                  The curve peaks where its slope is zero, which is where 933
                  over p_VV equals 5,451 over 1 − p_VV, and that is p_VV = 933 ⁄
                  6,384. The same argument runs separately for every row, since
                  each row&rsquo;s entries appear only in the steps that start
                  from that row&rsquo;s state. Summed over both rows, the counted
                  text has a log likelihood of −9,773.73 nats under its own
                  table, and every other table gives it less.
                </p>
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
                  <p>
                    The table from step 4 has p_VC = 4 ⁄ 5 and p_CV = 3 ⁄ 7, so
                    the balance puts the chain at a vowel with probability 3 ⁄ 7
                    divided by 3 ⁄ 7 plus 4 ⁄ 5, which is 15 ⁄ 43, or 0.3488. The
                    sentence itself is five vowels in thirteen letters, 0.3846.
                    The two disagree, and step 13 is about why they almost never
                    do on a long text.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The stationary distribution is a fact about the table and says
                  nothing about any particular walk. Whether a walk actually
                  arrives there is a separate question, and Part 7 has a chain
                  where it never does.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Solved rather than walked to">
                <p>
                  Walking a thousand steps and reading off where the walk ended
                  finds the stationary distribution on a chain like this one, and
                  slowly on a chain that forgets slowly. Solving finds it
                  directly. The equation πP = π says π(P − I) = 0, a set of
                  linear equations one of which is always implied by the others,
                  since every row of P sums to one. Replacing that one with the
                  requirement that π sums to one leaves a system with a single
                  solution whenever the chain has exactly one stationary
                  distribution.
                </p>
                <Equation>
                  {"π (P − I)  =  0,   with one of its equations replaced by   Σⱼ πⱼ  =  1"}
                </Equation>
                <p>
                  Whether it has exactly one is decided by which states can reach
                  which, and none of the magnitudes matter. If every state can
                  eventually reach every other, the chain has exactly one
                  stationary distribution, which is the theorem of Perron and
                  Frobenius applied to a table of probabilities, and more
                  generally it has exactly one whenever there is a single group
                  of states that a walk can enter and never leave. A table with
                  every entry above zero satisfies both, which is one of the
                  things smoothing does, and Part 7 is about the tables that fail.
                </p>
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
                <p>
                  That agreement is almost guaranteed, and it is worth seeing why
                  before being impressed by it. Take the share of steps that
                  start at each letter and multiply it by the table. What comes
                  out is the share of steps that end at each letter, and the two
                  shares differ only by the first and last letter of each
                  sentence, so the text&rsquo;s own letter shares nearly solve
                  πP = π by construction. On oh my dear Dinah, a single sentence
                  where the two ends are two of its thirteen letters, the gap is
                  0.3846 against 0.3488. On 128 sentences it is 0.3814 against
                  0.3816.
                </p>
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
                <p>
                  Part of the gap is not English at all. Grouping twenty-six
                  letters into two classes throws away which vowel and which
                  consonant, and a sequence of classes read off a letter chain is
                  not in general a Markov chain itself. The second view of the
                  widget runs the same check on 20,000 symbols the letter chain
                  wrote, where one letter of memory is true by construction, and
                  the vowel-and-consonant chain still misses two letters on,
                  0.4560 against 0.4084. So of the 0.1052 miss on Alice, about
                  half is the grouping and the rest is the text.
                </p>
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
                <p>
                  On Markov&rsquo;s two classes this is cheap, since six classes
                  of memory is only 64 possible states, and the widget scores the
                  third chapter at every length of memory from none to six. Each
                  class remembered helps less than the one before, 0.9651 bits
                  with none, 0.8659 with one, 0.8402 with two, 0.8336 with
                  three, 0.8309 with four and 0.8284 with five. At six, one step
                  of the third chapter is a run of seven classes the first two
                  chapters never produced, so the chain as counted calls it
                  impossible and gives the whole chapter a probability of zero.
                </p>
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
                <p>
                  Two costs follow. The count of steps stays at about twenty
                  thousand whatever the memory, so each state&rsquo;s row is
                  estimated from fewer and fewer of them, 774.7 per state at one
                  letter and 10.4 at three. And the arithmetic on the table grows
                  with its size. Finding where a chain settles is a linear solve,
                  whose work grows roughly as the cube of the number of states,
                  and 1,982 cubed is about 160 times 363 cubed, so going from two
                  letters of memory to three multiplies that work by about a
                  hundred and sixty while the text it is counted on stays exactly
                  as long.
                </p>
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
                <p>
                  The reason is in the shape of the pair table. Additive
                  smoothing adds the same count to every cell of a row, and a row
                  of the pair chain has 363 cells, one for every pair seen
                  anywhere. After th the next state has to begin with h, and in
                  the first two chapters h was followed by only nine different
                  symbols, so at most nine of those 363 cells can ever be right.
                  At a smoothing of a half each row is given 181.5 invented
                  steps, against an average of 57.3 real ones, and almost all of
                  the invented ones go to pairs that cannot follow. Drawn at that
                  setting the pair chain writes thaqogsedke umuoumts, and the
                  last sample in step 15 shows the rest of it.
                </p>
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
                <p>
                  There are four things anyone can do, and each costs something.
                  Give the stranded state an even row, which invents an
                  observation that it is followed by everything equally. Send it
                  to itself with certainty, which invents a different
                  observation and changes the chain&rsquo;s structure, since the
                  state becomes a trap that every long walk eventually falls into
                  and that then holds the whole stationary distribution. Refuse
                  to build the table until text arrives that leaves the state.
                  Or add the same small count to every cell of every row, which
                  gives the stranded row an even spread as a side effect of a
                  choice made for every row at once, and carries the cost Part 6
                  measured.
                </p>
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
                <p>
                  The stationary distribution exists and is unique, half and
                  half, since a step turns a half-and-half distribution into
                  itself. No walk ever arrives at it. A walk from a consonant is
                  certainly at a consonant after every even number of steps and
                  certainly at a vowel after every odd one, forever, which makes
                  it a chain of period two, and its second eigenvalue is 0 − 1 =
                  −1, so the distance from settled is multiplied by one at every
                  step and never shrinks.
                </p>
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
                <p>
                  What breaks uniqueness is two closed groups, and the word asks
                  shows that reducibility alone does not. Its classes are V C C
                  C, so the vowel is left once for a consonant and never returned
                  to, and it cannot be reached from the consonant, which makes the
                  chain reducible. It still has exactly one stationary
                  distribution, all of it on the consonant, because only one
                  group of states is closed, and the vowel the word started from
                  holds no share at all. Smoothing joins the two words&rsquo;
                  classes into one group again, and the smoothed chain settles at
                  0.4545 for a vowel.
                </p>
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
      ]}
    />
  );
}
