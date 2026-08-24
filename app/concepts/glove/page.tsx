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
import { GloveCooccurrenceTable } from "@/components/widgets/GloveCooccurrenceTable";
import { GlovePlayground } from "@/components/widgets/GlovePlayground";
import { GloveRatios } from "@/components/widgets/GloveRatios";
import { GloveRowsAgainstVectors } from "@/components/widgets/GloveRowsAgainstVectors";
import { GloveStepRules } from "@/components/widgets/GloveStepRules";
import { GloveTableCost } from "@/components/widgets/GloveTableCost";
import { GloveWeightingCurve } from "@/components/widgets/GloveWeightingCurve";
import { GloveWindowSweep } from "@/components/widgets/GloveWindowSweep";

export const metadata: Metadata = {
  title: "GloVe · oop_ml",
  description:
    "Count which words appear near which once, then fit vectors whose dot products reproduce the logarithms of those counts.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function GlovePage() {
  return (
    <ConceptPage
      title="GloVe"
      tagline="GloVe counts which words appeared near which, once, and then fits vectors whose dot products have to reproduce the logarithms of those counts."
      prerequisites={
        <>
          Every word here ends up as a short list of numbers, and two words are
          compared by the{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            cosine
          </Link>{" "}
          between their lists, which is an angle rather than a distance. The fit
          itself is{" "}
          <Link href="/concepts/gradient-descent-regression" className={link}>
            gradient descent
          </Link>{" "}
          on a least squares objective, so that is used without being explained
          again. The method this one was written against is{" "}
          <Link href="/concepts/word2vec" className={link}>
            word2vec
          </Link>
          , and Part 1 says what it does differently, though nothing later depends
          on having read that page.
        </>
      }
      history={
        <>
          <p>
            By 2013 there were two ways of turning a corpus into word vectors and
            they had almost nothing in common. The older way builds a table.
            Zellig Harris in 1954 and J. R. Firth in 1957 had argued that what a
            linguist can observe about a word&rsquo;s meaning is the company it
            keeps, and by 1990 Scott Deerwester, Susan Dumais and their colleagues
            were making that arithmetic in &ldquo;Indexing by latent semantic
            analysis&rdquo;, counting which word appeared in which document and
            squeezing the resulting table down; Kevin Lund and Curt Burgess did
            the same with a sliding window in 1996 under the name Hyperspace
            Analogue to Language. The complaint against the whole family was that
            it used the corpus statistics well and did badly on the word analogy
            question that had just become the standard test, because a plain
            decomposition tries to reproduce every cell of the table equally and
            the commonest words own most of the cells.
          </p>
          <p>
            The newer way never builds a table at all. Tomáš Mikolov and
            colleagues at Google in 2013 slid a window along the corpus and
            corrected a few vectors at every position, and the vectors that came
            out answered the analogy question far better. What nobody could say
            was why. The training touches one window at a time and never consults
            how often two words co-occurred in all, so the corpus statistics that
            the older family used directly are, in the newer one, being
            rediscovered from scratch on every pass. That was the epistemic
            problem, and it was uncomfortable, since there were two families of
            method, each using half of the available evidence, and no account at
            all of which half the analogy result had come out of.
          </p>
          <p>
            Jeffrey Pennington, Richard Socher and Christopher Manning, at
            Stanford, published &ldquo;GloVe: Global Vectors for Word
            Representation&rdquo; at the 2014 conference on empirical methods in
            natural language processing in Doha. Their observation was that the
            useful thing in the table is not a co-occurrence probability but the
            ratio of two of them. Their example compares ice with steam through
            four probe words. Solid is far likelier beside ice, gas far likelier
            beside steam, water is likely beside both and fashion beside neither,
            so the two raw probabilities are useless for water and fashion and the
            ratio is near one for exactly those two and far from one for the other
            two. Working backwards from a model of ratios pins the objective down
            to a weighted least squares fit of the logarithm of the counts, which
            is what the method is. The name says the fit reads a statistic
            computed over the whole corpus, and the released vector files, trained
            on six billion tokens of Wikipedia and newswire and later on a much
            larger crawl of the web, are a large part of why the method spread.
          </p>
          <p>
            The step rule the paper takes is John Duchi, Elad Hazan and Yoram
            Singer&rsquo;s adaptive method of 2011, chosen because word counts are
            so unevenly spread that no single step size suits both the commonest
            word and the rarest. The program the authors released does not
            implement it quite as the paper describes, and Part 5 measures what
            that costs on a corpus this size. Omer Levy, Yoav Goldberg and Ido
            Dagan reported in 2015 that much of the reported gap between this
            family and the window-sliding one came from preprocessing and
            hyperparameter choices rather than from the algorithms, which is worth
            knowing before reading any comparison of the two, including the one in
            Part 6 of this page.
          </p>
          <p>
            This page asks six questions in order. What does counting a corpus
            keep that walking it repeatedly does not, and the other way round? How
            is the table of who appeared near whom actually built, and what do the
            two decisions inside it settle? What exactly are the vectors asked to
            reproduce, and why the logarithm of a count? Why can the equations not
            all count the same, and what does the cap on their weights hold back?
            What does one pass over a table cost against one pass over the text?
            And where does the method stop being defined?
          </p>
        </>
      }
      playground={<GlovePlayground />}
      sections={[
        {
          title: "Part 1. Counting Or Predicting",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Twenty-four sentences, and two halves that never mix">
                <p>
                  Everything on this page is fitted to one small corpus, and it is
                  worth knowing exactly what is in it before any method touches
                  it. Twenty-four sentences, twelve about a chef and twelve about
                  an astronomer. The cooking half uses onion, garlic, flour, salt,
                  soup, broth and the rest; the astronomy half uses moon, star,
                  orbit, telescope, comet and nebula. No content word appears in
                  both halves. What the two halves do share is seven words that
                  carry no topic at all, the, and, with, in, of, into and for, and
                  those seven turn out to matter more here than anything else.
                </p>
                <p>
                  That comes to 216 word occurrences over 37 distinct words. The
                  sentences are ordinary English rather than the nonsense a page
                  about sliding a window can afford, and the reason is that this
                  method reads a table rather than a stream of positions, so a
                  corpus small enough to print is also small enough to check by
                  hand, which is what Part 2 does.
                </p>
                <KeepInMind>
                  The one fact hidden from every fit on this page is that the
                  corpus has two halves. Nobody tells a fit which half a word came
                  from, so the two numbers this page keeps reporting, how alike two
                  words of one half are and how alike a word of each are, are the
                  whole score.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What counting a corpus keeps">
                <p>
                  The older way of using a corpus is to count it. Walk along every
                  sentence once, and for each word write down which words turned
                  up within a couple of positions of it. What comes out is a square
                  table with a row and a column for every word, and a word&rsquo;s
                  row is a description of that word made entirely of company.
                </p>
                <Equation>{"row(w)[v] = how often v occurred within reach of w, discounted by how far"}</Equation>
                <p>
                  The description is complete in a strong sense. Everything the
                  corpus has to say about which words go with which is now in the
                  table, and the corpus can be put away. What has gone is the
                  order and the sentence boundaries, so nothing afterwards can tell
                  which sentence a count came from or which of two words stood
                  first, and the two halves of our corpus are now two shaded blocks
                  with nothing between them.
                </p>
                <KeepInMind>
                  The table is the corpus, for every purpose that follows. A method
                  that reads it has seen everything the text had to say about
                  company, and has seen it once, which for these twenty-four
                  sentences means 281 entries standing in for 216 word occurrences.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What walking a corpus keeps">
                <p>
                  The newer family never builds that table. It slides a window
                  along the text and, at each position, corrects a few vectors so
                  that a word predicts the words beside it, then starts again from
                  the beginning and does it once more. What it buys is that nothing
                  ever exists which is as wide as the vocabulary squared, so a
                  corpus of billions of words can be walked where it could not be
                  tabulated.
                </p>
                <p>
                  What it never sees is the whole. A correction at one position
                  knows about that position and nothing else, and no step in the
                  procedure asks how often two words co-occurred in all. On our
                  corpus one walk of the text makes 720 readings of a neighbour
                  against a table that has 281 entries; repeat the corpus eight
                  times over and the first number reaches 5,760 while the second
                  stays exactly where it was, since the words and the pairs they
                  form have not changed.
                </p>
                <KeepInMind>
                  A window-sliding method never reads a summary, so on every pass it
                  pays again to re-derive, one position at a time, the statistic a
                  counting method wrote down before it started. That is the
                  observation this page&rsquo;s method begins from, and the two
                  numbers above, 281 against 720 and then 281 against 5,760, are what
                  it is an observation about.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Fitting the table itself">
                <p>
                  GloVe is what happens when we keep the table and fit it directly.
                  Give every word a short vector. Then ask that the vectors of two
                  words, multiplied together coordinate by coordinate and added up,
                  come out at the logarithm of how often those two words occurred
                  near each other, with a spare number for each word to absorb how
                  common that word is on its own.
                </p>
                <Equation>{"w(i) · w̃(j) + b(i) + b̃(j)   should equal   log X(ij)"}</Equation>
                <p>
                  That is one equation for every pair that ever co-occurred, and
                  the fit is a weighted least squares problem over those equations
                  and nothing else. The name is Global Vectors, and the word global
                  is the claim that the quantity being fitted was computed over the
                  whole corpus rather than a window at a time. Where the counts on
                  the right come from is Part 2; why the logarithm rather than the
                  count is Part 3; why the equations cannot all count the same is
                  Part 4; and what a walk over them does is Part 5.
                </p>
                <InAModel title="On this corpus">
                  <p>
                    The table holds 281 pairs that ever co-occurred, so the fit has
                    281 equations. At the width this page uses it has two tables of
                    296 numbers, one for each word&rsquo;s two roles, and two more
                    of 37, one spare number per word per role, which is 666 numbers
                    to choose. There are more unknowns than equations, and no fit on
                    this page is therefore pinned down by its own objective, which
                    Part 7 comes back to.
                  </p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. The Table, Built Once",
          content: (
            <>
              <SubSection title="5. How far near reaches, and what a neighbour is worth">
                <p>
                  Two decisions turn a corpus into a table and neither of them has
                  a right answer. The first is how far near reaches. Count only the
                  word next door and hardly anything co-occurs with anything;
                  count twenty positions away and every word in a sentence
                  co-occurs with every other. The second is whether a neighbour
                  five positions away should count for as much as one standing
                  immediately alongside.
                </p>
                <Equation>{"a neighbour d positions away adds 1 / d to the count"}</Equation>
                <p>
                  The usual answer to the second question, and the one this page
                  uses throughout, is one over the distance, so the word next door
                  counts once, the word two away counts a half and the word five
                  away counts a fifth. That is why these counts are not whole
                  numbers, and it matters much more than it looks, because a count
                  of a half has a negative logarithm and a count of two does not.
                  Part 5 measures what that does.
                </p>
                <KeepInMind>
                  Both decisions are taken before a single equation exists, and
                  nothing in the fit can revisit them. Changing either one means
                  counting the corpus again from the start.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. One sentence, counted by hand">
                <p>
                  Take the sentence the chef stirs the soup on its own, with a
                  reach of two. From the first the, at the front, chef is one away
                  and adds a whole count and stirs is two away and adds a half.
                  From chef, both the and stirs are one away and add a whole count
                  each, and the second the is two away and adds a half. Carry on to
                  the end of the sentence and every cell is settled.
                </p>
                <WorkedExample title="Five words, ten filled cells">
                  <p>
                    The row for the reads chef 1.5, stirs 1.5, soup 1.0. The row
                    for chef reads the 1.5, stirs 1.0. The row for stirs reads the
                    1.5, chef 1.0, soup 0.5. The row for soup reads the 1.0, stirs
                    0.5. Every pair is counted from both ends, so the table is
                    symmetric and each of those five numbers appears twice; the ten
                    filled cells add to 11.0. Two of them are below one, soup
                    beside stirs in each direction, because those two words met
                    once and two positions apart. Give every position inside the
                    reach one full count instead and the same five numbers become
                    2.0, 2.0, 1.0, 1.0 and 1.0, adding to 14.0, with nothing below
                    one at all.
                  </p>
                </WorkedExample>
                <GloveCooccurrenceTable />
                <p>
                  The widget above starts on that sentence, so every cell in it can
                  be checked against the paragraph. Add the second sentence and the
                  count for the beside chef becomes 3.0, which is the same pair
                  counted twice, while soup beside stirs stays at 0.5 because that
                  pair occurred once. Switching to the whole corpus is the same rule
                  again, thirty-seven words wide.
                </p>
                <KeepInMind>
                  A word can be its own neighbour. In this corpus and stands two
                  positions from another and in two sentences, so the cell where
                  the row and the column are both and holds 2.0, and it is the only
                  cell of that kind in the table.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The same rule on all twenty-four sentences">
                <p>
                  Thirty-seven words give a table of 1,369 cells, and 281 of them
                  hold anything at all, so 79.5% of it is blank. The counts run
                  from 0.5, whose logarithm is −0.6931, to 16.5, whose logarithm is
                  2.8034, and every count in the table adds to 552.0. Of the 281
                  filled cells, 86 are below one, which is 30.6%, and the mean
                  logarithm of a count is +0.2617.
                </p>
                <p>
                  The largest count in the whole table is the beside and, at 16.5.
                  Those two words tell nothing apart, they simply stand beside each
                  other more often than any other pair does, and the equation for
                  that pair would carry more of the objective than any other unless
                  the weighting of Part 4 held it back.
                </p>
                <KeepInMind>
                  The blank 79.5% is the two halves of the corpus never meeting, plus
                  every other pair of words that happened not to stand near each
                  other, rather than anything having gone wrong. The objective has no
                  equation for a single one of those 1,088 cells, which is where Part
                  7 begins.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What The Vectors Are Asked To Reproduce",
          content: (
            <>
              <SubSection title="8. Why a ratio rather than a probability">
                <p>
                  Suppose we want to know what separates chef from astronomer. The
                  obvious move is to ask how often each of them is found beside some
                  probe word, and the raw figures do not answer it. A probe that
                  stands beside both of them, like the, comes out common beside both
                  and tells them apart in no way; a probe that stands beside neither
                  comes out rare beside both and tells them apart in no way either.
                  What does tell them apart is the ratio of the two figures, since a
                  probe belonging to one word and not the other gives a ratio far
                  from one while a probe belonging to both, or to neither, gives a
                  ratio near one.
                </p>
                <Equation>{"P(k | i) / P(k | j)     far from one where k belongs to one word alone"}</Equation>
                <p>
                  The ratio cancels what the two words share and what neither has,
                  and leaves what separates them. That is the observation the whole
                  method is built backwards from, and it is worth seeing on the
                  running corpus straight away, because on a corpus this small it
                  runs into its own limit at once.
                </p>
                <GloveRatios />
                <p>
                  Of the 37 words in the vocabulary, exactly one, the, was seen
                  beside both chef and astronomer. Its ratio is 0.7319, near one,
                  which is the ratio correctly reporting that the separates nothing.
                  Eight words were seen beside chef alone, so their ratios would
                  divide by zero and do not exist; three were seen beside astronomer
                  alone, so their ratios are zero; and twenty-five were seen beside
                  neither word, so there is nothing to divide either way.
                </p>
                <KeepInMind>
                  The ratio is the quantity the method was designed around, and it
                  exists only where both counts do. On a corpus of billions of words
                  the pairs anyone cares about have both counts comfortably; on
                  twenty-four sentences almost none of them do, which is why the
                  widget above finds one usable ratio out of thirty-seven words.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. From a ratio to a dot product">
                <p>
                  Asking that some function of the vectors reproduce that ratio, and
                  asking that it depend on the two words only through the difference
                  between their vectors, pins the form down almost completely.
                  Nothing is chosen along the way except the two requirements
                  themselves.
                </p>
                <DerivationTable
                  expressionHeading="Expression"
                  reasonHeading="What changed"
                  rows={[
                    {
                      expression: "F(w(i) − w(j), w̃(k)) = P(k|i) / P(k|j)",
                      reason:
                        "What we are asking for. Two words are compared through a probe word, and only their difference is allowed to matter, since it is the difference between two words that a ratio describes.",
                    },
                    {
                      expression: "F((w(i) − w(j)) · w̃(k))",
                      reason:
                        "A ratio is a single number, so the two vector arguments have to be reduced to one. The dot product is the reduction that keeps the linear structure of the space, which is what makes the difference of two vectors meaningful in the first place.",
                    },
                    {
                      expression: "F(a − b) = F(a) / F(b)",
                      reason:
                        "Reading the requirement off directly. Differences on the inside have to become ratios on the outside, and the exponential is the only continuous function with that property.",
                    },
                    {
                      expression: "exp(w(i) · w̃(k)) ∝ X(ik) / X(i)",
                      reason:
                        "So take F to be the exponential. The ratio then comes out right for every pair whenever each side alone is proportional to the probability of the probe beside the word.",
                    },
                    {
                      expression: "w(i) · w̃(k) = log X(ik) − log X(i)",
                      reason:
                        "Take logarithms of that proportionality. The second term is the total of the whole row, which depends on the word i and not at all on the probe k.",
                    },
                    {
                      expression: "w(i) · w̃(k) + b(i) + b̃(k) = log X(ik)",
                      reason:
                        "A term that does not depend on the probe can be carried by the word as a spare number. A second spare number is added for the probe, because the table is symmetric and the two roles should not be told apart.",
                    },
                  ]}
                />
                <WhyThisWorks title="Why the logarithm is what makes a dot product possible">
                  <p>
                    A dot product adds. Counting multiplies, in the sense that the
                    number of times two words co-occur scales with how often each of
                    them occurs. A logarithm is exactly the operation that turns
                    multiplication into addition, so it is what lets a sum of
                    products stand in for a quantity built out of ratios. Take
                    logarithms out of the derivation and there is no arrangement of
                    dot products that reproduces a ratio, which is why the objective
                    fits the logarithms of the counts rather than the counts.
                  </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="10. The two spare numbers, and the sum at the end">
                <p>
                  The two spare numbers are doing real work and it is easy to miss
                  what. A word like the occurs beside almost everything, so every
                  count in its row is large. Without a spare number to carry that
                  fact, the dot products in that row would all have to be large, and
                  the would end up close to every word in the table. The spare number
                  absorbs the part of a count that is explained by how common the two
                  words are on their own, and leaves the dot product carrying only
                  what is particular to the pair.
                </p>
                <p>
                  Each word therefore ends the fit with two vectors and two spare
                  numbers, one of each for its role as the word of a pair and one for
                  its role as the probe. Because the table is symmetric the two
                  vector tables are asked the same question and differ only in where
                  they started, and the published choice is to add them together and
                  report the sum.
                </p>
                <Equation>{"the vector reported for word i is w(i) + w̃(i)"}</Equation>
                <KeepInMind>
                  Adding the two tables is a choice rather than a consequence.
                  Nothing in the derivation prefers the sum to either table on its
                  own; the argument for it is that two estimates of one quantity
                  added together carry less of the noise than either does, which is
                  a claim about variance and not about the objective.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Not Every Pair Is Worth The Same",
          content: (
            <>
              <SubSection title="11. A pair seen half a time is not evidence">
                <p>
                  If every equation counted the same, the fit would work as hard at
                  reproducing a pair seen once as a pair seen a thousand times, and
                  the pair seen once is mostly an accident of which sentences were
                  collected. So each equation carries a weight, and the weight rises
                  with the count until it stops.
                </p>
                <Equation>{"weight(x) = (x ÷ the cap) ^ alpha   below the cap,   and exactly 1 at or above it"}</Equation>
                <p>
                  The exponent is three quarters in the published rule, which sits
                  between counting in proportion to the count and counting every
                  pair alike, and the paper reports it as the value that worked
                  rather than one derived from anything. On our corpus at the
                  published cap of 100, the smallest count of 0.5 earns a weight of
                  0.0188 and the largest of 16.5 earns 0.2589, so the commonest
                  pair&rsquo;s equation counts about fourteen times the rarest
                  one&rsquo;s.
                </p>
                <KeepInMind>
                  The weight of a count of zero is zero. That is what lets the
                  objective be written as a sum over every pair of words while
                  touching only the pairs that occurred, and Part 7 says why the
                  tidiness of that is not the same as having answered anything about
                  the pairs that did not.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The cap, and what it holds back">
                <p>
                  The weight stops rising at a cap, and above it seeing a pair more
                  often makes its equation no more important than it already was.
                  The reason is the pair at the top of our own table. The commonest
                  pair of words in a corpus is a pair of function words, which is the
                  pair that separates the least, and without a cap it would carry the
                  largest single share of the objective.
                </p>
                <GloveWeightingCurve />
                <p>
                  Slide the cap down and watch the tallest ticks pass under the flat
                  part of the curve. At 7.5, ten pairs reach the cap, every one of
                  them a pair involving the, and the share of the whole objective
                  carried by the single commonest pair falls from 1.90% to 1.08%
                  while the ten commonest fall from 12.65% to 10.77%.
                </p>
                <KeepInMind>
                  Putting the cap exactly at the largest count in the table changes
                  nothing at all. At a cap of 16.5 two pairs sit precisely on it and
                  every share is identical to the shares at 100, because the curve
                  only ever flattens what lies beyond the cap and there is nothing
                  beyond it.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. What the weighting does on a corpus this size">
                <p>
                  The weighting has two jobs, holding back pairs seen too few times
                  to be evidence and holding back pairs seen so often that they would
                  decide the fit alone. On our corpus it only ever does the first,
                  because the largest count in the table is 16.5 and the published
                  cap is 100, so nothing is common enough to be held back.
                </p>
                <NumberTable
                  headings={[
                    "how the equations are weighted",
                    "the ten commonest pairs’ share of the objective",
                  ]}
                  rows={[
                    ["every pair alike", "3.56%"],
                    ["in proportion to the count", "17.57%"],
                    ["the published rule, cap at 100", "12.65%"],
                    ["the published rule, cap at 7.5", "10.77%"],
                  ]}
                  caption="Measured on the twenty-four sentences at a reach of two. The first row is what ten pairs out of 281 come to when nothing is weighted, and the last is the only row where the cap does anything."
                />
                <p>
                  Read the middle two rows together. Moving from a weight
                  proportional to the count to the published three-quarter power
                  takes the ten commonest pairs from 17.57% of the objective down to
                  12.65%, so the flattening is real and it is the whole of what the
                  weighting achieves here. The cap contributes nothing until it is
                  moved below the largest count, which is a setting the paper would
                  never use.
                </p>
                <KeepInMind>
                  The two halves of the weighting are separable and only one of them
                  is exercised at this size. That is a fact about the corpus rather
                  than the method, and it is worth carrying, since a demonstration on
                  twenty-four sentences cannot show the cap doing the job it was put
                  there for.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Running The Fit",
          content: (
            <>
              <SubSection title="14. The objective falling, pass by pass">
                <p>
                  A fit is a number of passes over the pairs. Each pass visits all
                  281 of them in an order shuffled afresh, and for each one computes
                  how far the current vectors and spare numbers are from the
                  logarithm of that pair&rsquo;s count, squares it, weights it, and
                  moves the four parameters involved a little way towards agreement.
                </p>
                <p>
                  At the settings this page uses, a width of eight and a reach of
                  two, the summed pair terms fall from 18.9335 in the first pass to
                  0.5550 in the twenty-fifth. The playground at the top of the page
                  draws that curve for whatever settings are chosen, and the useful
                  habit is to watch the shape rather than the value, since a curve
                  that flattens early usually means the corpus has run out of things
                  to say rather than that the fit has finished.
                </p>
              </SubSection>

              <SubSection title="15. The number recorded is not the number minimised">
                <p>
                  There is a trap in that curve. Each pass&rsquo;s total was
                  accumulated while the parameters were moving, since a pair visited
                  early in a pass is scored against different vectors from a pair
                  visited late. So the recorded number is not the objective at any
                  one set of parameters, and it cannot be, unless nothing moved.
                </p>
                <p>
                  Recomputed where the walk actually stopped, the objective on that
                  fit is 0.5148, below the 0.5550 the last pass recorded, and the
                  difference is the parameters having improved during the pass being
                  measured. The two numbers can be made to agree exactly by making
                  the fit stand still. Run one pass at a base step of a millionth of
                  a millionth and the recorded total is 22.1272 and the recomputed
                  objective differs from it by less than a billionth, which is the
                  agreement test for the arithmetic and also the demonstration that
                  the gap in an ordinary fit is entirely the movement.
                </p>
                <KeepInMind>
                  The number to quote for a finished fit is the one recomputed at
                  rest, and it is the readout the playground shows. The per-pass
                  totals are worth watching for their shape and are not comparable
                  with an objective, or with each other across two different step
                  rules, which is exactly what the next step has to be careful about.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A published step rule that is not adaptive here">
                <p>
                  How large a step should a parameter take? Word counts are so
                  unevenly spread that no single answer suits both a word like the,
                  which occurs sixty-one times here, and a word like oven, which
                  occurs twice, so the published rule gives each parameter its own.
                  Every parameter
                  keeps a running sum of the squares of the slopes it has been
                  handed, and its step is divided by the square root of that sum, so
                  a parameter that has already moved a great deal moves less than one
                  that has barely moved at all.
                </p>
                <Equation>{"step = base rate × slope ÷ √(sum of that parameter’s squared slopes so far)"}</Equation>
                <p>
                  The program the authors released does it slightly differently. It
                  starts every running sum at one rather than at zero, and it adds
                  each new square after taking the step rather than before. On a
                  corpus of billions of words that difference disappears within the
                  first few thousand pairs, because the sums grow far past one and
                  the starting value stops mattering. On a corpus of twenty-four
                  sentences it never disappears at all.
                </p>
                <GloveStepRules />
                <p>
                  The two curves come from one walk, with everything identical
                  except those two lines, so the same counts, the same weights, the
                  same starting vectors, the same shuffled order and the same
                  arithmetic for one pair&rsquo;s slopes. Measured at the end of all
                  twenty-five passes, the largest amount any slope was divided by
                  under the released rule is 1.0860 and the smallest is 1.0000, and
                  since a running sum only ever grows those are also the extremes
                  over the whole fit, so every step the released rule took was the
                  base rate times the slope to within nine per cent, from the first
                  pass to the last. Under the accumulating rule the same two figures
                  are 0.0049 and 1.2331, a factor of two hundred and fifty between
                  one parameter and another.
                </p>
                <p>
                  What that costs is not subtle. The accumulating rule takes the
                  objective to 0.5148 and the released rule leaves it at 4.9571, nine
                  times higher, over the same twenty-five passes. At the wider reach
                  and the published width of fifty the two are 0.0334 and 8.8708. And
                  it reaches the answer rather than only the objective, since the
                  accumulating rule separates the two halves of the corpus by 0.1966
                  and the released rule by 0.0306.
                </p>
                <KeepInMind>
                  The released rule is one whose starting value stops mattering after
                  the first moments of a real training run, and there the two rules
                  are indistinguishable. What it is not, at this size, is adaptive,
                  and a reader who knew only the name of the step rule would have
                  assumed otherwise and never checked the objective it stopped at.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Where the reach decides the answer">
                <p>
                  A count below one has a negative logarithm, and the objective asks
                  the dot product and the two spare numbers to reproduce it. How many
                  counts come out below one is decided entirely by the reach, because
                  a neighbour further away contributes a smaller fraction and a pair
                  needs several occurrences before its fractions add past one.
                </p>
                <GloveWindowSweep />
                <NumberTable
                  headings={[
                    "reach",
                    "pairs",
                    "counts below one",
                    "mean logarithm",
                    "how far the halves came apart, three starts",
                  ]}
                  rows={[
                    ["1", "158", "0 (0%)", "+0.6623", "−0.0171, +0.0483, +0.0001"],
                    ["2", "281", "86 (30.6%)", "+0.2617", "+0.1966, +0.1314, +0.2284"],
                    ["3", "390", "178 (45.6%)", "+0.0101", "+0.0043, +0.0541, −0.0039"],
                    ["5", "474", "246 (51.9%)", "−0.1523", "+0.0156, +0.0123, −0.0076"],
                  ]}
                  caption="Every row is twenty-five passes at a width of eight. The last column is the mean cosine between two words of one half minus the mean cosine between words of different halves, once for each of three starting draws."
                />
                <p>
                  At a reach of one nothing is below one, because every neighbour is
                  next door and contributes a whole count, and the fit still fails,
                  since 158 pairs is too little of the corpus to see anything by. At
                  a reach of five more than half the counts are below one and the
                  mean logarithm has gone negative. The spare numbers ought to absorb
                  that mean and after twenty-five passes they have not. The mean
                  spare number is −0.0169, an order of magnitude too small, and the
                  mean dot product over the pairs that co-occurred is −0.1359, so the
                  negative has ended up in the dot products, which is where the
                  meaning was supposed to be. At a reach of two the same mean dot
                  product is +0.0510.
                </p>
                <p>
                  The last column is what that does to the answer. At a reach of two
                  all three starts put words of one half nearer to each other than to
                  words of the other, and by a wide margin. At three and at five one
                  start in three comes out negative, which is a fit that has placed
                  cooking words nearer to astronomy words than to each other. The
                  reach that works on this corpus is the one where the fractions have
                  had a chance to add past one and the logarithms are mostly positive.
                </p>
                <KeepInMind>
                  The reach decides more than how much context a word is given. It
                  decides the sign of most of the logarithms the fit is trying to
                  reproduce, and on sentences this short that is what settles whether
                  an answer comes out at all. On a corpus where every count runs into
                  the hundreds the question does not arise, which is why the published
                  defaults are wider than anything that works here.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What the fit put near what">
                <p>
                  Asked for the words nearest moon, the fit at this page&rsquo;s
                  settings answers orbits at 0.9826, then of, then planet, astronomer
                  and orbit, so four of the five come from the astronomy half and the
                  fifth is a function word. Asked for the words nearest chef it
                  answers stirs, then of, then orbits, moon and eclipse, which is one
                  word from the right half and three from the wrong one.
                </p>
                <p>
                  Across every content word in the corpus, 67.3% of the five nearest
                  content words come from the same half. The function words crowd
                  those lists because they occur beside everything and therefore end
                  up near everything, which is the effect the spare numbers exist to
                  remove and only partly do; try the buttons in the playground and
                  the, of and and turn up in most of the lists.
                </p>
                <KeepInMind>
                  A nearest-word list is the only reading of these vectors that most
                  people ever look at, and it is a weaker measurement than the two
                  mean cosines, since it reports an order among words rather than a
                  quantity. Every comparison this page makes between two fits is made
                  on the two mean cosines for that reason.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What A Table Costs",
          content: (
            <>
              <SubSection title="19. One pass over the table against one pass over the text">
                <p>
                  The argument for reading a summary is that the summary stops
                  growing before the corpus does. To see that separately from
                  everything else, repeat the corpus whole, one copy then two then
                  four then eight, which leaves the vocabulary and the set of pairs
                  exactly where they were while doubling how much text there is to
                  walk.
                </p>
                <GloveTableCost />
                <NumberTable
                  headings={[
                    "copies of the corpus",
                    "word occurrences",
                    "distinct words",
                    "terms in one pass over the table",
                    "readings in one pass over the text",
                  ]}
                  rows={[
                    ["1", "216", "37", "281", "720"],
                    ["2", "432", "37", "281", "1,440"],
                    ["4", "864", "37", "281", "2,880"],
                    ["8", "1,728", "37", "281", "5,760"],
                  ]}
                  caption="Repeating the corpus is deliberately artificial. It is the only way to hold the vocabulary fixed while the amount of text grows, and it isolates the claim that a pass over the table costs the number of distinct pairs and nothing else."
                />
                <p>
                  What the repetition hides is that on real text the number of
                  distinct pairs does keep growing, only far more slowly than the
                  text does, and that the table itself grows as the square of the
                  vocabulary whether or not the cells are filled. Here it is 1,369
                  numbers, of which 1,088 are zero, against the 296 numbers of the
                  fitted vectors. Thirty-seven words is small enough that holding a
                  square array is the obvious thing to do; four hundred thousand
                  words is not, and every implementation at that size holds the
                  filled cells alone.
                </p>
                <KeepInMind>
                  Two costs are being traded here and they grow differently. Counting
                  is paid once, and what it costs grows as the square of the
                  vocabulary; walking is paid on every pass, and what it costs grows
                  with the amount of text. At thirty-seven words the whole table is
                  1,369 numbers and the two readouts above show the counting taking a
                  small fraction of the time the fit takes; at four hundred thousand
                  words, which is the size of vocabulary the published vectors cover,
                  the same square array would hold a hundred and sixty billion cells,
                  so the answer to which cost is bearable changes with the corpus.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Where comparing the raw counts still wins">
                <p>
                  There is an obvious alternative to fitting the table, which is
                  reading it. Two words can be compared by taking their whole rows of
                  counts and measuring the cosine between them, which needs no fit, no
                  starting draw, no step rule and no seed. On this corpus that
                  alternative wins one of the two questions the page has been asking,
                  and it would be dishonest to leave that out.
                </p>
                <GloveRowsAgainstVectors />
                <p>
                  Asked for the five words nearest onion, the raw rows answer salt,
                  garlic, butter, pepper and flour, all five from the cooking half.
                  The fitted vectors answer gravity, flour, into, garlic and oven, so
                  the nearest word of all comes from the wrong half. Asked of every
                  content word in turn, and counting only content words on either
                  side so that the seven shared words cannot muddy it, the raw rows
                  put 74.7% of the five nearest in the same half against the
                  fit&rsquo;s 67.3%, and they do it with 37 numbers per word where the
                  fit uses 8.
                </p>
                <p>
                  On the other question the ordering reverses. Averaged over all
                  pairs, the fit puts words of one half 0.1966 further apart from
                  words of the other than from each other, and the raw rows manage
                  0.1404. The raw rows lose there because every row is dominated by
                  the seven shared words, so all thirty-seven rows already point
                  broadly the same way and the mean cosine across the halves comes out
                  at 0.4756 rather than near zero.
                </p>
                <KeepInMind>
                  A method whose whole argument is about vocabularies of hundreds of
                  thousands and corpora of billions should be expected to lose at
                  thirty-seven words to the table it is compressing, and on one of the
                  two questions it does. The measurement is evidence about this
                  demonstration rather than about the method at the size it was built
                  for.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where GloVe Stops Being Defined",
          content: (
            <>
              <SubSection title="21. A pair that never co-occurred has no logarithm">
                <p>
                  The objective is a sum over pairs, and the quantity each term
                  compares against is the logarithm of a count. The logarithm of zero
                  is not a number. So a pair that never co-occurred has no term at
                  all, the sum runs over the pairs that were seen, and it says nothing
                  whatever about the rest.
                </p>
                <p>
                  That is a different kind of silence from a term whose target is
                  zero. A term with a target of zero would be a statement, namely that
                  those two words should have a dot product cancelling their two spare
                  numbers; a missing term is no statement, and the fit is free to
                  place those two words anywhere the other terms leave room for. On
                  this corpus 1,088 of the 1,369 cells are empty, so 79.5% of the
                  pairs the vocabulary can form are pairs the objective never
                  mentions, and every judgement a fitted table makes about one of them
                  is a side effect of the pairs it did mention.
                </p>
                <p>
                  The weight is what makes the omission consistent rather than ad hoc.
                  The weight of a count of zero is zero, so writing the sum over all
                  pairs of words and writing it over the filled cells give the same
                  number, and the missing logarithms are never evaluated. That is a
                  tidy way of stating the omission rather than a way of repairing it,
                  since the objective still has 281 terms however it is written down.
                </p>
              </SubSection>

              <SubSection title="22. The table is built once, so its choices are frozen">
                <p>
                  Two decisions are made before the first equation exists, how far
                  near reaches and what a neighbour at a distance is worth, and after
                  that the fit reads their consequences rather than the corpus.
                  Nothing computed during the fit can revisit either one, and no
                  quantity the fit produces turns over as the reach passes a good
                  value.
                </p>
                <p>
                  Both are genuine choices with something measurable turning on them.
                  The reach settles what fraction of the counts fall below one and so
                  the sign of most of the logarithms, which Part 5 measured as none of
                  them at a reach of one and 51.9% of them at a reach of five, with
                  the answer failing at both ends. The distance rule settles whether a
                  count is a whole number at all, and a rule giving every position one
                  full count would remove every fraction and with it every negative
                  logarithm, at the cost of treating a word five away as the equal of
                  a word next door.
                </p>
                <KeepInMind>
                  A hyperparameter that can be swept during a fit is a different kind
                  of thing from one baked into the data the fit reads. Sweeping the
                  reach means counting the corpus again for every value, which is
                  cheap on twenty-four sentences and is the expensive half of the
                  whole procedure on a real one.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A walk to a local answer over a fixed table">
                <p>
                  The objective is a sum of squares in quantities that multiply each
                  other, so it is not convex, and the walk visits the pairs in a
                  shuffled order and arrives at a local answer. A fit therefore
                  inherits two kinds of arbitrariness at once, the draw it started
                  from and the table it was handed, and neither is visible in the
                  answer it returns.
                </p>
                <p>
                  Worse for anyone hoping to compare two fits, the objective cannot
                  distinguish a set of vectors from a rotation of it. Turn every
                  vector in both tables by the same rotation and every dot product is
                  unchanged, so every term of the objective is unchanged, so the
                  rotated answer is exactly as good. Individual coordinates therefore
                  carry no meaning at all, and the third coordinate of one fit has no
                  relation to the third coordinate of another.
                </p>
                <KeepInMind>
                  Anything read off these vectors has to survive a rotation, which a
                  cosine does and a coordinate does not. Averaging two fits&rsquo;
                  tables together, or handing one fit&rsquo;s vectors to something
                  trained on another&rsquo;s, is undefined rather than approximate,
                  because the two answers were never written in the same coordinates.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Where the method stops being defined">
                <p>
                  Several inputs leave the method with nothing to compute rather than
                  something approximate to compute, and a few more leave it with a
                  real choice whose cost is worth knowing. The table gathers both,
                  with what the mathematics says in each case.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a pair that never co-occurred",
                      reason:
                        "undefined, and therefore absent. The logarithm of zero is not a number, so the pair has no equation, and the objective makes no claim about where those two words go. This is not a target of zero, which would be a claim; it is the absence of one. Here it is 1,088 of 1,369 cells.",
                    },
                    {
                      expression: "a count below one",
                      reason:
                        "defined, and its logarithm is negative, which the two spare numbers must absorb or the dot products will carry. Whether a count can be below one is decided by the distance rule, and how often it is is decided by the reach: 0% of counts at a reach of one against 51.9% at a reach of five.",
                    },
                    {
                      expression: "a vocabulary of one word",
                      reason:
                        "there is no pair. A single word co-occurs with nothing, the table is one cell holding zero, the sum has no terms, and there is no quantity to minimise.",
                    },
                    {
                      expression: "a corpus in which no two words fall within reach",
                      reason:
                        "the same, for a different reason. Every cell of the table is zero, so every term is missing, and a fit would leave every vector exactly where its starting draw put it while reporting an objective of zero.",
                    },
                    {
                      expression: "a word that occurs once",
                      reason:
                        "defined, and its whole row is one sentence’s worth of company. Nothing in the answer marks it as such, since it gets a vector of the same width and a cosine against it comes back to four decimal places like any other. A minimum count declines to answer for such a word rather than answering better, and where the threshold goes is a judgement.",
                    },
                    {
                      expression: "a word absent from the corpus",
                      reason:
                        "there is no row in the table, so no equation, so no vector. The honest answer is a refusal rather than a default position the corpus never implied.",
                    },
                    {
                      expression: "the individual coordinates of a vector",
                      reason:
                        "undefined as quantities. Rotating both tables by one rotation leaves every dot product, and so the whole objective, exactly where it was, so the coordinates are one arbitrary choice among infinitely many that fit equally well. Only rotation-invariant readings mean anything.",
                    },
                    {
                      expression: "comparing two fits coordinate by coordinate",
                      reason:
                        "undefined for the same reason, and so is averaging two fits’ tables or feeding one fit’s vectors to something trained on another’s.",
                    },
                    {
                      expression: "more unknowns than equations",
                      reason:
                        "permitted, and usual. At this page’s width the fit chooses 666 numbers against 281 equations, so the objective alone does not determine the answer even before the walk’s arbitrariness is counted; what settles it is where the draw started and which local answer the walk reached.",
                    },
                    {
                      expression: "where to put the cap on the weights",
                      reason:
                        "a real choice about which pairs are allowed to decide the answer, with nothing inside the fit to settle it. Below the largest count it holds the commonest pairs back, measured here as the commonest pair’s share falling from 1.90% to 1.08%; at or above the largest count it does nothing whatever.",
                    },
                    {
                      expression: "how wide to make the vectors",
                      reason:
                        "a real choice with no principle behind it. Too few numbers and words that should differ are forced together; too many and each word can be described independently of every other, which is what the compression was for. No quantity computed during the fit turns over as the width passes a good value.",
                    },
                    {
                      expression: "the sum of the two tables, read as the answer",
                      reason:
                        "a choice rather than a consequence. The two tables are asked the same question by a symmetric table and the objective is indifferent between reporting their sum, one of them, or any other combination; the published argument for the sum is about averaging away noise.",
                    },
                    {
                      expression: "which of two words stood first",
                      reason:
                        "outside what the table represents. Every pair is counted from both ends, so the table is symmetric by construction and cannot tell the chef stirs from stirs the chef. Order is discarded when the corpus is counted, not when the vectors are fitted.",
                    },
                    {
                      expression: "which sense of a word is meant",
                      reason:
                        "outside what the method represents. One row per spelling, so a word used two ways contributes both sets of company to one row and settles somewhere between, and there is no second vector for the second sense to occupy.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of those lines carry most of the weight in practice. The
                  objective is silent about four fifths of the pairs a vocabulary can
                  form, which is a much larger silence than it looks and is not
                  repaired by the weight of a zero count being zero; and the
                  coordinates carry no meaning individually, which rules out comparing
                  or combining two fits and rules in cosines.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
