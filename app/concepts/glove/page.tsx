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
import { GloveCooccurrenceTable } from "@/components/widgets/GloveCooccurrenceTable";
import { GlovePlayground } from "@/components/widgets/GlovePlayground";
import { GloveRatios } from "@/components/widgets/GloveRatios";
import { GloveRowsAgainstVectors } from "@/components/widgets/GloveRowsAgainstVectors";
import { GloveStepRules } from "@/components/widgets/GloveStepRules";
import { GloveTableCost } from "@/components/widgets/GloveTableCost";
import { GloveWeightingCurve } from "@/components/widgets/GloveWeightingCurve";
import { GloveWindowSweep } from "@/components/widgets/GloveWindowSweep";

export const metadata: Metadata = {
  title: "GloVe · Perceptron Lab",
  description:
    "GloVe learns vectors from word co-occurrence counts. Their comparisons are fitted to patterns in the counts, providing a compact representation of information drawn from the wider text collection.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function GlovePage() {
  return (
    <ConceptPage
      lessonId="glove"
      intuition={lessonIntuitions["glove"]}
      technicalStart="Part 3. What The Vectors Are Asked To Reproduce"
      openingTitle="Count the Neighbors Once, Then Fit Their Relationships" openingId="count-the-neighbours-once-then-fit-their-relationships"
      playgroundTitle="What do repeated word pairs tell the model?"
      playgroundIntro="Compare an observed pair count with the value reconstructed by the vectors and biases. Inspect how the weighting changes the contribution of rare and frequent pairs."
      title="GloVe"
      tagline={"GloVe learns vectors from word co-occurrence counts. Their comparisons are fitted to patterns in the counts, providing a compact representation of information drawn from the wider text collection."}
      prerequisites={
        <>
          Every word here ends up as a short list of numbers, and two words are
          compared by the{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            cosine
          </Link>{" "}
          {" similarity of their directions. The fit uses "}{" "}
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

      playground={<GlovePlayground />}
      sections={[
        {
          title: "Part 1. Counting Or Predicting",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twenty-four sentences, and two halves that never mix">
                <>
<p>
                  We will use twenty-four sentences, twelve about a chef and twelve about an astronomer. The cooking sentences include onion, garlic, flour, salt, soup and broth. The astronomy sentences include moon, star, orbit, telescope, comet and nebula. Knowing how the corpus is constructed lets us check whether the learned representation reflects its topic pattern.
                </p>
                <p>
                  The content words are separate, while both topics use the, and, with, in, of, into and for. In this corpus, those shared words occur across subjects. We will compare their context statistics with words that help distinguish cooking from astronomy.
                </p>
</>
                <p>The collection contains 216 word occurrences over 37 distinct words. Its small size lets us inspect the context-count table and check particular equations by hand. Those checks connect the fitted vectors to the observations used to learn them.</p>
                <KeepInMind>
                  {"The fit receives no topic labels. We use the known chef and astronomy groups to inspect its learned relationships, alongside neighbor lists and reconstruction error. Two mean cosines are useful diagnostics, rather than the whole score."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What counting a corpus keeps">
                <p>Counting nearby words gives each vocabulary word a row describing its observed contexts. A context window defines which positions contribute and how much. The resulting co-occurrence table supplies the evidence that GloVe tries to represent with shorter vectors.</p>
                <Equation>{"row(w)[v] = how often v occurred within reach of w, discounted by how far"}</Equation>
                <p>
                  {"The table aggregates the chosen window events. It retains weighted pair frequencies while discarding which sentence supplied them and which side of the center each context occupied. Other contextual information, such as joint multiword patterns, is not recoverable from these pair totals."}
                </p>
                <KeepInMind>
                  {"After counting, GloVe trains on the 281 observed pair entries rather than rereading each individual context occurrence. Those entries summarize the selected pair statistics, not every property of the original text."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What walking a corpus keeps">
                <p>Prediction-based methods can update selected vectors while scanning the text, without first materializing a dense vocabulary-by-vocabulary count table. GloVe instead fits observed co-occurrence statistics. The distinction concerns the training information and objective; sparse storage can also avoid allocating every possible count cell.</p>
                <p>
                  {"A window-based update uses the current pair, but its parameters accumulate evidence across many such updates. GloVe makes the aggregate counts explicit instead. Repeating the corpus increases those counts and the number of scanned occurrences, while the set of distinct observed pairs can remain unchanged."}
                </p>
                <KeepInMind>
                  A window-based training pass revisits individual context occurrences. GloVe first aggregates co-occurrence counts and fits those statistics. Repeating our corpus changes the total counts, but leaves 281 distinct observed pairs to represent, while the number of context occurrences grows from 720 to 5,760. This gives us a concrete way to compare the work performed by the two training arrangements.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Fitting the table itself">
                <p>
                  {"Pennington, Socher and Manning introduced GloVe, Global Vectors, in 2014. They combined corpus-wide co-occurrence statistics with a compact vector model. Give each word an input vector and a context vector, plus one bias for each role. Fit their dot product and biases to the log observed count, using the weighting described below."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://aclanthology.org/D14-1162/">{"Pennington, Socher and Manning: GloVe: Global Vectors for Word Representation (2014)"}</Link></p>
                <Equation>{"w(i) · w̃(j) + b(i) + b̃(j)   should equal   log X(ij)"}</Equation>
                <>
<p>
                  That is one equation for every pair that ever co-occurred, and the fit is a weighted least squares problem over those equations and nothing else. The name is Global Vectors, and the word global is the claim that the quantity being fitted was computed over the whole corpus rather than a window at a time.
                </p>
                <p>
                  Where the counts on the right come from is Part 2; why the logarithm rather than the count is Part 3; why the equations cannot all count the same is Part 4; and what a walk over them does is Part 5.
                </p>
</>
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
</>),
        },
        {
          title: "Part 2. The Table, Built Once",
          content: (
            <>
              <SubSection title="5. How far near reaches, and what a neighbor is worth" id="5-how-far-near-reaches-and-what-a-neighbour-is-worth">
                <p>

                  Two decisions turn a corpus into a table and neither of them has
                  a right answer. The first is how far near reaches. Count only the
                  word next door and hardly anything co-occurs with anything;
                  count twenty positions away and every word in a sentence
                  co-occurs with every other. The second is whether a neighbor
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
                  {"The window and distance weighting determine the table before this fit begins. To change them, recount the text or retain positional summaries rich enough to recombine. The final aggregated table alone cannot reconstruct every alternative context rule."}
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
                  <>
<p>
                    The row for the reads chef 1.5, stirs 1.5, soup 1.0. The row for chef reads the 1.5, stirs 1.0. The row for stirs reads the 1.5, chef 1.0, soup 0.5. The row for soup reads the 1.0, stirs 0.5. Every pair is counted from both ends, so the table is symmetric and each of those five numbers appears twice; the ten filled cells add to 11.0.
                  </p>
                  <p>
                    Two of them are below one, soup beside stirs in each direction, because those two words met once and two positions apart. Give every position inside the reach one full count instead and the same five numbers become 2.0, 2.0, 1.0, 1.0 and 1.0, adding to 14.0, with nothing below one at all.
                  </p>
</>
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

                  A word can be its own neighbor. In this corpus and stands two
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
                <p>The pair of words &quot;the&quot; and &quot;and&quot; has this table&apos;s largest count, at 16.5. A frequent pair need not be the most useful one for distinguishing subjects. GloVe fits the logarithm of each observed count, with a separate weighting function controlling its contribution to the objective. Part 4 shows how that weight reduces the influence of small, poorly supported counts and stops growing after its cutoff. Count size alone does not determine the error a pair contributes.</p>
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
                <>
<p>
                  Suppose we want to know what separates chef from astronomer. The obvious move is to ask how often each of them is found beside some probe word, and the raw figures do not answer it. A probe that stands beside both of them, like the, comes out common beside both and tells them apart in no way; a probe that stands beside neither comes out rare beside both and tells them apart in no way either.
                </p>
                <p>
                  {"A context occurring at similar conditional rates for both words has a ratio near one. A context much more common beside one can distinguish them. Being rare beside both does not itself imply a ratio near one, and two zero counts make the ratio undefined."}
                </p>
</>
                <Equation>{"P(k | i) / P(k | j)     far from one where k belongs to one word alone"}</Equation>
                <p>
                  A probability ratio compares how two words relate to the same context. Contexts associated similarly with both give ratios near one, while distinguishing contexts can give very different ratios. Let&apos;s calculate these on our small corpus and also check what happens when a required count is zero.
                </p>
                <GloveRatios />
                <p>
                  {"The is the only probe with positive observed counts beside both chef and astronomer, giving ratio 0.7319. Eight probes have a positive chef count but a zero astronomer count; three have the reverse. Twenty-five are unobserved beside either. Only the first case gives a finite positive ratio suitable for taking its logarithm without further smoothing."}
                </p>
                <KeepInMind>
                  {"This small corpus supplies few finite positive ratios for that pair of words. A larger corpus can improve coverage, but cannot guarantee positive counts for every relevant context. Smoothing and the observed-pair objective are separate choices for dealing with sparse evidence."}
                </KeepInMind>
              </SubSection>

              <SubSection title="9. From a ratio to a dot product">
                <p>
                  {"The paper motivates its model through ratios of context probabilities and differences between word vectors. Choosing a dot-product interaction and a positive exponential map gives a convenient log-bilinear form. These are modeling assumptions, not the only mathematical way to represent such ratios."}
                </p>
                <DerivationTable
                  expressionHeading="Expression"
                  reasonHeading="What changed"
                  rows={[{"expression":"F(w(i) − w(j), w̃(k)) = P(k|i) / P(k|j)","reason":"What we are asking for. Two words are compared through a probe word, and only their difference is allowed to matter, since it is the difference between two words that a ratio describes."},{"expression":"F((w(i) − w(j)) · w̃(k))","reason":"Choose a dot product to turn the paired vector arguments into one scalar interaction. This is a bilinear modeling choice; being a scalar ratio does not mathematically require this particular reduction."},{"expression":"F(a − b) = F(a) / F(b)","reason":"An exponential map turns differences into ratios. With positive continuity and a nontrivial scale convention, this functional relation motivates an exponential family; the scale can be absorbed into the vectors."},{"expression":"exp(w(i) · w̃(k)) ∝ X(ik) / X(i)","reason":"So take F to be the exponential. The ratio then comes out right for every pair whenever each side alone is proportional to the probability of the probe beside the word."},{"expression":"w(i) · w̃(k) = log X(ik) − log X(i)","reason":"Taking logs of an equality gives the shown relation. A proportional form can also carry an additive context-dependent constant; the following bias terms allow that adjustment."},{"expression":"w(i) · w̃(k) + b(i) + b̃(k) = log X(ik)","reason":"A term that does not depend on the probe can be carried by the word as a spare number. A second spare number is added for the probe, because the table is symmetric and the two roles should not be told apart."}]}
                />
                <WhyThisWorks title="Why the logarithm is what makes a dot product possible">
                  <p>
                  {"The logarithm converts a probability ratio into a difference. A bilinear dot product can then model that relation with additive biases. This motivates the GloVe objective; it does not prove that no other model could represent ratios or fit counts directly."}
                </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="10. The two spare numbers, and the sum at the end">
                <>
<p>
                  The two bias terms can account for broad frequency effects. A frequent word such as the has large counts across much of its row. Without those biases, the dot products would have to account for that baseline as well as the particular associations. Separating the terms gives the fit another way to represent the counts.
                </p>
                <p>
                  {"The biases give the model a way to represent broad row and column effects. They are learned jointly with the vectors, so the objective does not force a unique split between frequency effects and pair-specific dot products."}
                </p>
</>
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
                  {"Adding the input and context vectors is an output convention used in the paper. It can combine information from both roles, but a variance reduction or better task score is an empirical question. The objective fits the two tables jointly; it does not prove that their sum is always best."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "One walk of the corpus makes 720 readings of a neighbor against a table holding 281 entries. Repeat the corpus eight times over. What happens to those two numbers?",
              [
                "The readings reach 5,760 and the table stays at 281",
                "Both grow eightfold, to 5,760 and 2,248",
                "The readings stay at 720 and the table reaches 2,248",
                "Both stay exactly where they were",
              ],
              0,
              "The number of neighbor readings grows from 720 to 5,760. The table still has 281 nonzero cells because the repeated sentences introduce no new word pairs, but every stored count is multiplied by eight. GloVe can train on those aggregated cells rather than revisiting every original occurrence during each training pass. Constructing the counts still requires processing the input.",
            ),
            trueFalse(
              "Every count in the table is a whole number.",
              false,
              "A neighbor d positions away adds 1 ÷ d, so the word next door counts once and the word two away counts a half. Of the 281 filled cells, 86 are below one, and a count below one has a negative logarithm, which is the thing Part 5 measures the consequences of.",
            ),
            several(
              "Which of these hold for the table built from the twenty-four sentences?",
              [
                              "It is symmetric, because every pair is counted from both ends",
                              "281 of its 1,369 cells hold anything at all",
                              "No cell can have the same word for its row and its column",
                              "The largest count is the beside and, at 16.5",
                            ],
              [0, 1, 3],
              "Counting both directions makes this table symmetric. It has 281 nonzero cells and 79.5% of its cells are zero. The largest count is 16.5 for the beside and. A self-pair is possible when two occurrences of the same word are nearby. Here and is two positions from another and in two sentences, producing a total self-pair count of 2.0.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Twenty-four sentences, reach 2, distance-weighted counts.\nEvery context pair is counted from both ends.\nVocabulary: 37 words; table: 37 × 37 = 1,369 cells.\nNonzero cells: 281.\nLargest count: the beside and, 16.5.\nSelf-pair and beside and: 2.0."
              },
            ),
            choice(
              "Why does the objective compare the dot product against the logarithm of a count rather than against the count?",
              [
                "Because logarithms turn the probability ratios motivating GloVe into differences that its vector model can represent",
                "Because the logarithm keeps every target positive, which the fit requires",
                "Because it shrinks the largest counts enough that no weighting is needed",
                "Because only a logarithm makes the table symmetric",
              ],
              0,
              "GloVe's motivation uses ratios of context probabilities to compare words. Taking logarithms converts multiplicative ratios into differences, which can be modeled with vector dot products and bias terms. This motivates the log-count objective; it does not make that objective the only possible use of a dot product. Counts below one have negative logarithms, including 86 positive cells in this table.",
            ),
            trueFalse(
              "Of the 37 words in the vocabulary, exactly one was seen beside both chef and astronomer.",
              true,
              "Only the has positive counts beside both chef and astronomer in this small table. Its reported conditional-probability ratio is 0.7319. Eight context words occur beside chef alone, three beside astronomer alone, and twenty-five beside neither. Ratios for these sparse observations can have a zero denominator or be undefined, so the motivating ratio argument cannot be read as a reliable measured ratio for every pair here.",
            ),
        ],
        },
        {
          title: "Part 4. Not Every Pair Is Worth The Same",
          content: (
            <>
              <SubSection title="11. Weighting Observed Counts" id="11-a-pair-seen-half-a-time-is-not-evidence">
                <p>
                  {"The weighting function reduces the relative influence of low-count pairs and caps how much their weights can grow. A pair observed once still supplies evidence; the issue is how much trust and objective weight to give that evidence. Each term also depends on its squared prediction error."}
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
                  {"Beyond the cap, the weight remains one even as the count grows. The log-count target and residual can still change. The cap limits the weighting multiplier, rather than fixing the pair’s loss or proving that the most frequent pair is always uninformative."}
                </p>
                <GloveWeightingCurve />
                <p>
                  {"At cap 7.5, ten pairs reach the flat part of the weight curve. The commonest pair’s share of summed weights falls from 1.90% to 1.08%, and the ten commonest pairs’ share from 12.65% to 10.77%. Their actual share of the loss also depends on their residuals."}
                </p>
                <KeepInMind>
                  {"If every count is below the cap, changing the cap multiplies every weight by the same factor. Their relative shares stay fixed, but the objective value and update scales can change. Putting the cap at the largest count therefore preserves the shares shown here, not every aspect of the fit."}
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
                  headings={["how the equations are weighted","the ten commonest pairs’ share of total weight"]}
                  rows={[
                    ["every pair alike", "3.56%"],
                    ["in proportion to the count", "17.57%"],
                    ["the published rule, cap at 100", "12.65%"],
                    ["the published rule, cap at 7.5", "10.77%"],
                  ]}
                  caption="Shares of the summed weighting coefficients for the observed pairs. These percentages do not include squared residuals and are not percentages of the fitted loss."
                />
                <p>
                  {"The three-quarter exponent gives the ten commonest pairs a smaller share of total weight than count-proportional weighting. Lowering the cap below the largest observed count changes those relative shares further. Choosing another cap above all counts still rescales the weights uniformly and can affect optimization."}
                </p>
                <KeepInMind>
                  At this corpus size, we exercise only one part of the weighting function. None of these observations demonstrates how its cap affects much larger counts. Keep that limitation in mind when comparing this small run with training on a larger corpus.
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
                  {"Each pass visits all 281 observed pairs in a freshly shuffled order. For one pair, calculate its log-count residual, multiply its squared value by the weight, and update the two vectors and two biases. Those vectors contain multiple parameters, so this is not just four scalar values."}
                </p>
                <p>
                  {"The recorded pass total falls from 18.9335 to 0.5550 over 25 passes at these settings. A plateau can arise from optimization, limited capacity or the selected data and objective. It does not establish that the corpus has run out of useful information."}
                </p>
              </SubSection>

              <SubSection title="15. The number recorded is not the number minimized" id="15-the-number-recorded-is-not-the-number-minimised">
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
                  {"For a finished parameter set, recompute the objective without updating it. The online pass totals remain useful diagnostics, but they score pairs under changing parameters. Compare training schemes with the same frozen evaluation procedure when deciding which fits the objective better."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A published step rule that is not adaptive here">
                <p>
                  {"Adagrad accumulates squared gradients for each parameter and uses that history to adjust its step. Frequently large gradients lead to a larger denominator. This is a statement about gradient history, not a direct count of how far the parameter has traveled."}
                </p>
                <Equation>{"step = base rate × slope ÷ √(sum of that parameter’s squared slopes so far)"}</Equation>
                <p>
                  {"The compared released-style rule initializes its accumulator at one and adds the new squared gradient after taking a step. The other rule starts at zero and includes the current square. Initial scale matters when accumulated gradients stay small; corpus size alone does not guarantee that the difference disappears."}
                </p>
                <GloveStepRules />
                <>
<p>
                  The two curves come from one walk, with everything identical except those two lines, so the same counts, the same weights, the same starting vectors, the same shuffled order and the same arithmetic for one pair&rsquo;s slopes. Measured at the end of all twenty-five passes, the largest amount any slope was divided by under the released rule is 1.0860 and the smallest is 1.0000, and since a running sum only ever grows those are also the extremes over the whole fit, so every step the released rule took was the base rate times the slope to within nine per cent, from the first pass to the last.
                </p>
                <p>
                  Under the accumulating rule the same two figures are 0.0049 and 1.2331, a factor of two hundred and fifty between one parameter and another.
                </p>
</>
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
                  {"The released-style denominators stay close to one in this experiment, so their adaptive scaling is modest. They remain adaptive. A different dataset or gradient history can change the comparison, and the two update rules are not guaranteed to become identical in larger training."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Where the reach decides the answer">
                <p>
                  {"Inverse-distance weighting permits counts below one. Their frequency depends on the window, document content and how often pairs recur. A larger window changes all these observed contributions; it does not determine the signs of log counts independently of the corpus."}
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
                <>
<p>
                  {"At reach one, every selected event contributes an integer count, so no positive count is below one. This setting yields weak topic separation in the shown fits. That does not identify 158 observed pairs as universally insufficient to learn anything."}
                </p>
                <p>
                  {"At reach five, negative log-count targets are represented jointly by biases and dot products. Their division is not uniquely identified: a transformation can shift contributions between the terms. A small mean bias alone therefore does not demonstrate that a correct amount of frequency information failed to be absorbed."}
                </p>
                <p>
                  At a reach of two the same mean dot product is +0.0510.
                </p>
</>
                <p>
                  {"All three shown reach-two starts give positive topic separation, while one of three starts is negative at reaches three and five. That is an observed association with these settings. The experiment changes the context evidence as well as the log-count distribution, so it does not isolate target sign as the cause."}
                </p>
                <KeepInMind>
                  {"Window width changes which associations the model fits and their weights. Inspect both the fitted loss and the intended retrieval behavior. Larger corpora can still contain many rare weighted pairs, so negative log counts are not a concern restricted to this small example."}
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
                  {"Nearest-neighbor accuracy and average topic separation evaluate different properties. A ranking is still a measurable result, and can be the more relevant criterion when the application actually returns neighbors. Use both where they inform the intended task."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            trueFalse(
              "On this corpus the cap is what holds the commonest pair back.",
              false,
              "The largest count is 16.5, below the cap of 100, so no pair reaches the constant-weight region. The three-quarter power changes their relative weights: the ten most common pairs' share of the total weight falls from 17.57% under count-proportional weighting to 12.65% under this power. These are weight shares, not measured shares of the final loss, which also depends on each pair's error.",
            ),
            choice(
              "Changing the cap from 100 to 16.5, the largest count in this table, does what to each pair's share of the total weight?",
              [
                "It leaves the shares unchanged: every weight is rescaled by the same factor, and no count exceeds the new cap",
                "It halves the share carried by the single commonest pair",
                "It raises the share carried by the rarest pairs",
                "It makes every pair count the same",
              ],
              0,
              "At a cap of 16.5, two pairs reach weight one. All other weights are rescaled by the same factor relative to a cap of 100, so their shares of total weight stay the same. At 7.5, ten pairs reach the cap. They all involve the, and the most common pair's share of total weight falls from 1.90% to 1.08%. A pair's contribution to the loss also depends on its prediction error.",
            ),
            trueFalse(
              "Recomputed where the walk stopped, the objective of the finished fit comes out below the total the last pass recorded.",
              true,
              "The recorded pass total scores pairs one at a time while updates change the parameters. objective_value() instead scores every pair using the same final parameters. Here the final objective is 0.5148 and the last recorded total is 0.5550. With an extremely small learning rate the two measurements nearly agree, which supports the explanation that changing parameters cause the observed gap. The recomputed value need not be lower for every possible training run.",
            ),
            choice(
              "Which statement describes this optimizer comparison after 25 passes?",
              [
                              "The objective stopped at 4.9571 rather than 0.5148, and the halves separated by 0.0306 rather than 0.1966",
                              "Nothing measurable, since the two rules are indistinguishable at every corpus size",
                              "The fit diverged and returned no answer at all",
                              "The same objective, reached nine times more slowly",
                            ],
              0,
              "The released-rule run has a larger objective and a smaller within-minus-across cosine gap here. Starting its accumulated squares at one makes adaptation weak on this small corpus. These two runs do not establish a universal runtime ratio or prove what happens at every corpus size.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "                                    objective at rest  within-minus-across cosine\naccumulate squares before scaling     0.5148             0.1966\nreleased rule: initial sum 1, add after 4.9571             0.0306\n\nBoth use this same small corpus and pass budget."
              },
            ),
            several(
              "Which of these are true of the reach on this corpus?",
              [
                "It decides how many counts fall below one, and so the sign of most of the logarithms",
                "At reach one no count is below one, but the measured separation gaps still vary around zero",
                "At a reach of five more than half the counts are below one and the mean logarithm has gone negative",
                "The reach is chosen before fitting; to use a different reach, its co-occurrence counts must be constructed"
              ],
              [0, 1, 2, 3],
              "A larger reach includes more distant neighbors, each with a smaller contribution. Here that changes both the fraction of fractional counts and the mean of their logarithms. Reach one avoids negative logarithms, yet its three separation gaps remain small and have mixed signs. The count table is an input to fitting, so a new reach needs the corresponding counts; an implementation may recompute or cache them.",
              {
                "description": "A neighbor d positions away contributes 1/d to its pair count. Changing the maximum reach changes which neighbors enter the count table. The final column reports within-half mean cosine minus across-half mean cosine for three training starts.",
                "data": "reach | pairs | counts below one | mean logarithm | how far the halves came apart, three starts\n1 | 158 | 0 (0%) | +0.6623 | −0.0171, +0.0483, +0.0001\n2 | 281 | 86 (30.6%) | +0.2617 | +0.1966, +0.1314, +0.2284\n3 | 390 | 178 (45.6%) | +0.0101 | +0.0043, +0.0541, −0.0039\n5 | 474 | 246 (51.9%) | −0.1523 | +0.0156, +0.0123, −0.0076"
              },
            ),
        ],
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
                  caption="Repeating the corpus holds both the vocabulary and observed-pair set fixed for this comparison. New text drawn from a fixed vocabulary could also keep the vocabulary unchanged while adding different pair evidence."
                />
                <>
<p>
                  {"With new text, the number of distinct observed pairs may also grow. Dense storage allocates all 1,369 possible cells here; sparse storage can allocate only the nonzero entries. The retained eight-coordinate output has 296 values, while fitting requires additional vectors, biases and working arrays."}
                </p>
                <p>
                  Thirty-seven words is small enough that holding a square array is the obvious thing to do; four hundred thousand words is not, and every implementation at that size holds the filled cells alone.
                </p>
</>
                <KeepInMind>
                  {"Counting requires reading the text and selected windows. Fitting then revisits the distinct observed pair entries. Dense count storage grows quadratically with vocabulary, while sparse storage follows observed pairs. These are separate costs; no single vocabulary-squared formula describes every stage."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Where comparing the raw counts still wins">
                <p>
                  {"Compare the learned vectors with cosine on the raw context rows. The count baseline needs no iterative vector fit or initialization, but it still uses the chosen window, tokenization and distance weighting."}
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
                  {"The raw rows score better on the reported top-five grouping check, while the learned vectors score better on the mean topic-gap check. This small example illustrates a tradeoff between criteria, not a reason to expect every small-corpus GloVe fit to lose."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Missing Co-occurrences and Unreliable Neighbors", id: "part-7-where-glove-stops-being-defined",
          content: (
            <>
              <SubSection title="21. A pair that never co-occurred has no logarithm">
                <p>
                  {"GloVe fits positive observed counts, because their logarithms are finite. An unobserved pair has no direct residual term in this objective. Shared parameters can still constrain its eventual comparison indirectly through the observed pairs."}
                </p>
                <>
<p>

                  That is a different kind of silence from a term whose target is zero. A term with a target of zero would be a statement, namely that those two words should have a dot product canceling their two spare numbers; a missing term is no statement, and the fit is free to place those two words anywhere the other terms leave room for.
                </p>
                <p>

                  On this corpus 1,088 of the 1,369 cells are empty, so 79.5% of the pairs the vocabulary can form are pairs the objective never mentions, and every judgment a fitted table makes about one of them is a side effect of the pairs it did mention.
                </p>
</>
                <p>
                  {"A zero-count term is omitted. Equivalently, define its limiting contribution as zero under this weighting, rather than evaluate 0×log(0). In implementation, skip the absent pair so the undefined logarithm is never computed."}
                </p>
              </SubSection>

              <SubSection title="22. The table is built once, so its choices are frozen">
                <p>

                  Two decisions are made before the first equation exists, how far
                  near reaches and what a neighbor at a distance is worth, and after
                  that the fit reads their consequences rather than the corpus.
                  Nothing computed during the fit can revisit either one, and no
                  quantity the fit produces turns over as the reach passes a good
                  value.
                </p>
                <>
<p>
                  Both are genuine choices with something measurable turning on them. The reach settles what fraction of the counts fall below one and so the sign of most of the logarithms, which Part 5 measured as none of them at a reach of one and 51.9% of them at a reach of five, with the answer failing at both ends.
                </p>
                <p>
                  The distance rule settles whether a count is a whole number at all, and a rule giving every position one full count would remove every fraction and with it every negative logarithm, at the cost of treating a word five away as the equal of a word next door.
                </p>
</>
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
                  {"The bilinear vector interactions make the objective nonconvex. A finite shuffled training run reaches a parameter state that depends on initialization, updates and the supplied counts; it is not guaranteed to reach a local optimum. Retain those settings so the result can be investigated."}
                </p>
                <p>
                  Worse for anyone hoping to compare two fits, the objective cannot
                  distinguish a set of vectors from a rotation of it. Turn every
                  vector in both tables by the same rotation and every dot product is
                  unchanged, so every term of the objective is unchanged, so the
                  rotated answer is exactly as good. Individual coordinates describe the axes of this particular fit.
                  They do not automatically name a feature, and another fit can
                  use a different orientation.
                </p>
                <KeepInMind>
                  Anything read off these vectors has to survive a rotation, which a
                  cosine does and a coordinate does not. Averaging two fits&rsquo;
                  tables together, or handing one fit&rsquo;s vectors to something
                  trained on another&rsquo;s, is numerically possible but generally
                  unjustified before the representations are aligned. A coordinate
                  in one fit need not measure the same direction in the other.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Pairs With No Counts and Vectors With No Direction" id="24-where-the-method-stops-being-defined">
                <p>No co-occurrence count means there is no positive pair observation for this objective to fit. Separately, a zero vector cannot take part in a cosine comparison. The table keeps missing evidence apart from an undefined comparison.</p>
                <DerivationTable
                  expressionHeading="Count or vocabulary condition"
                  reasonHeading="Effect on fitting and comparing vectors"
                  rows={[{"expression":"a pair that never co-occurred","reason":"undefined, and therefore absent. The logarithm of zero is not a number, so the pair has no equation, and the objective makes no claim about where those two words go. This is not a target of zero, which would be a claim; it is the absence of one. Here it is 1,088 of 1,369 cells."},{"expression":"a count below one","reason":"defined, and its logarithm is negative, which the two spare numbers must absorb or the dot products will carry. Whether a count can be below one is decided by the distance rule, and how often it is is decided by the reach: 0% of counts at a reach of one against 51.9% at a reach of five."},{"expression":"a vocabulary of one word","reason":"Repeated occurrences of the same token can supply a self-co-occurrence count. A one-word vocabulary therefore does not necessarily have an empty objective; the sentence layout and window decide."},{"expression":"a corpus in which no two words fall within reach","reason":"the same, for a different reason. Every cell of the table is zero, so every term is missing, and a fit would leave every vector exactly where its starting draw put it while reporting an objective of zero."},{"expression":"a word that occurs once","reason":"defined, and its whole row is one sentence’s worth of company. Nothing in the answer marks it as such, since it gets a vector of the same width and a cosine against it comes back to four decimal places like any other. A minimum count declines to answer for such a word rather than answering better, and where the threshold goes is a judgment."},{"expression":"a word absent from the corpus","reason":"there is no row in the table, so no equation, so no vector. The honest answer is a refusal rather than a default position the corpus never implied."},{"expression":"the individual coordinates of a vector","reason":"numerically defined in the axes of this fit. Rotating both tables together leaves every dot product and the objective unchanged, so the objective does not assign a fixed interpretation to an individual coordinate. Within-fit cosine comparisons survive such a rotation."},{"expression":"comparing two fits coordinate by coordinate","reason":"numerically computable, but generally not meaningful before alignment. Averaging two fits or reusing a model trained on another fit’s vectors assumes matching coordinate systems, which separate training runs do not guarantee."},{"expression":"more unknowns than equations","reason":"permitted, and usual. At this page’s width the fit chooses 666 numbers against 281 equations, so the objective alone does not determine the answer even before the walk’s arbitrariness is counted; what settles it is where the draw started and which local answer the walk reached."},{"expression":"where to put the cap on the weights","reason":"The cap changes relative multipliers when it crosses observed counts. Above all counts it changes their common scale, which can still affect objective values and updates. The displayed percentages are shares of weights, not residual-weighted losses."},{"expression":"how wide to make the vectors","reason":"Width controls capacity, storage and computation. Choose it using appropriate development evidence; the training objective alone does not supply a universal semantic optimum."},{"expression":"the sum of the two tables, read as the answer","reason":"a choice rather than a consequence. The two tables are asked the same question by a symmetric table and the objective is indifferent between reporting their sum, one of them, or any other combination; the published argument for the sum is about averaging away noise."},{"expression":"which of two words stood first","reason":"outside what the table represents. Every pair is counted from both ends, so the table is symmetric by construction and cannot tell the chef stirs from stirs the chef. Order is discarded when the corpus is counted, not when the vectors are fitted."},{"expression":"which sense of a word is meant","reason":"A static row combines the spelling’s uses. It does not select a sense per occurrence and need not occupy a midpoint between sense groups."}]}
                />
                <KeepInMind>
                  {"The objective fits observed pairs through shared parameters. Evaluate the resulting vectors on the comparisons the application needs, and align separate fits before combining their coordinates. Missing direct pair evidence and coordinate ambiguity are limitations to handle, rather than reasons that all such comparisons are impossible."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            trueFalse(
              "On this corpus the fitted vectors beat the raw rows of counts on both of the two questions the page asks.",
              false,
              "They win one and lose one. The raw rows put 74.7% of the five nearest content words in the same half against the fit's 67.3%, and they do it with 37 numbers per word where the fit uses 8; the fit separates the halves by 0.1966 against the raw rows' 0.1404.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "                                 raw count rows  fitted vectors\nnumbers per word                  37              8\nfive nearest content words in half 74.7%           67.3%\nwithin-minus-across cosine         0.1404          0.1966"
              },
            ),
            choice(
              "Why do the raw rows separate the two halves by only 0.1404?",
              [
                "Shared function-word context coordinates contribute to cross-topic similarity, reducing the reported within-minus-across cosine gap",
                "The rows are too short to carry the distinction",
                "The rows were counted at a reach too small to reach across a sentence",
                "The rows were never passed through the three-quarter weighting",
              ],
              0,
              "The two topics share function words such as the and and. Those shared context coordinates can contribute to dot products between rows from different topics. The reported cross-topic mean cosine is 0.4756, which reduces the within-minus-across gap. A shared context word need not occur beside every content word for this effect to appear.",
            ),
            trueFalse(
              "A pair of words that never co-occurred contributes no term to the objective at all.",
              true,
              "The implementation evaluates the log-count objective for the 281 positive cells and omits the 1,088 zero cells. It does not evaluate the real logarithm of zero. A missing pair therefore has no direct loss term, although the parameters it would use are constrained by other observed pairs. Assigning a zero target would be a different model: it would ask that pair's dot product and biases to sum to zero.",
            ),
            choice(
              "The weight of a count of zero is zero. What does that buy?",
              [
                "A way of writing the sum over every pair of words that gives the same number as the sum over the filled cells",
                "A statement that two words which never co-occurred should end up far apart",
                "A repair for the 1,088 pairs the objective never mentions",
                "A guarantee that the fit is pinned down by its own objective",
              ],
              0,
              "Defining the weight as zero at count zero is consistent with omitting unobserved pairs. The implementation skips those cells so it never multiplies zero by an undefined logarithm. This does not turn a missing observation into evidence of dissimilarity. The fit still has 281 observed pair terms and 666 scalar parameters in this configuration.",
            ),
            several(
              "Turn every vector in both tables by the same rotation. Which of these hold?",
              [
                "Every dot product is unchanged, so the rotated answer is exactly as good",
                "Averaging the rotated table with the original gives a table at least as good as either",
                "Reusing one fit’s vectors in a model trained on an unaligned fit has no general guarantee",
                "The cosine between two words changes, which is why the page reports coordinates instead"
              ],
              [0, 2],
              "The same orthogonal rotation preserves every dot product when applied to both tables, so the GloVe objective is unchanged. It also preserves within-table cosines. Averaging the original and rotated vectors is numerically defined, but need not preserve their dot products or produce an equally good fit. Separately trained tables need alignment before coordinate-wise operations or a downstream model can be interpreted consistently.",
            ),
        ],
        },
        {
          title: "Practice. Counting The Table, Then Fitting It",
          practice: [
            exercise(
              "Count the table, once",
              [
  "Fit the supplied twenty-four sentences at vector width eight and context window two. Inspect the stored cooccurrence table before interpreting learned vectors.",
  "Print vocabulary size, total/filled cells, count sum, the/and and and/and counts and number of positive counts below one. Then print weights of the smallest and largest positive counts and their ratio."
],
              `from oop_ml import GloVe

corpus = """the chef chops onion and garlic
the chef stirs soup with butter and salt
the chef stirs onion and garlic in the pan
the chef bakes bread with flour in the oven
the chef stirs salt and pepper into the broth
the chef bakes bread and stirs the broth
flour and butter and salt in the pan
the chef chops onion for the soup and the broth
garlic and pepper in the soup with bread
the chef bakes flour and butter into bread in the oven
onion and garlic and salt in the broth
the chef stirs the soup in the pan with pepper
the astronomer watches the star and the planet
the astronomer charts the orbit of the moon
the comet and the meteor orbit the star
the telescope watches the galaxy and the nebula
the moon orbits the planet with gravity
the astronomer watches the eclipse of the moon with the telescope
the comet orbits the star and the astronomer charts the orbit
the telescope watches the nebula and the galaxy
the astronomer charts the meteor and the comet with the telescope
the planet orbits the star and the moon orbits the planet
the eclipse of the star and the eclipse of the moon
gravity and the orbit of the galaxy and the nebula""".splitlines()

model = GloVe(dimension=8, window=2, epochs=25, learning_rate=0.05, random_seed=0)
model.fit(corpus)
table = model.cooccurrence
counts = table.counts
filled = counts[counts > 0]
# Print the word count, the cell count and the filled count, the total of the
# counts, the two cells named above, how many filled cells are below one, and
# the weights of the smallest and largest counts with their ratio.`,
              `from oop_ml import GloVe

corpus = """the chef chops onion and garlic
the chef stirs soup with butter and salt
the chef stirs onion and garlic in the pan
the chef bakes bread with flour in the oven
the chef stirs salt and pepper into the broth
the chef bakes bread and stirs the broth
flour and butter and salt in the pan
the chef chops onion for the soup and the broth
garlic and pepper in the soup with bread
the chef bakes flour and butter into bread in the oven
onion and garlic and salt in the broth
the chef stirs the soup in the pan with pepper
the astronomer watches the star and the planet
the astronomer charts the orbit of the moon
the comet and the meteor orbit the star
the telescope watches the galaxy and the nebula
the moon orbits the planet with gravity
the astronomer watches the eclipse of the moon with the telescope
the comet orbits the star and the astronomer charts the orbit
the telescope watches the nebula and the galaxy
the astronomer charts the meteor and the comet with the telescope
the planet orbits the star and the moon orbits the planet
the eclipse of the star and the eclipse of the moon
gravity and the orbit of the galaxy and the nebula""".splitlines()

model = GloVe(dimension=8, window=2, epochs=25, learning_rate=0.05, random_seed=0)
model.fit(corpus)
table = model.cooccurrence
counts = table.counts
filled = counts[counts > 0]

print(f"words {table.n_words}, cells {counts.size}, filled {filled.size}")
print(f"counts add to {table.total:.1f}")
print(f"the beside and {table.count_between('the', 'and'):.1f}")
print(f"and beside and {table.count_between('and', 'and'):.1f}")
print(f"filled cells below one {int((filled < 1).sum())}")

smallest = model.weight_of_count(float(filled.min()))
largest = model.weight_of_count(float(filled.max()))
print(f"weight of {filled.min():.1f} is {smallest:.4f}")
print(f"weight of {filled.max():.1f} is {largest:.4f}")
print(f"ratio {largest / smallest:.2f}")`,
              `words 37, cells 1369, filled 281
counts add to 552.0
the beside and 16.5
and beside and 2.0
filled cells below one 86
weight of 0.5 is 0.0188
weight of 16.5 is 0.2589
ratio 13.77`,
              { hints: [
  "cooccurrence.counts is the word-by-context matrix. Use positive entries for both count limits and filled-cell statistics.",
  "weight_of_count applies the fitted model’s weighting function; it is separate from the cooccurrence count itself."
], check: numberCheck("What is the ratio of the largest count’s weight to the smallest count’s?", 13.77, 0.01, "The weighting ratio is about 13.77. This weighting function increases the influence of larger observed counts without making its weight equal to the count."), question: "Which context counts does GloVe actually fit, and how are they weighted?" },
            ),
            exercise(
              "Run the fit and read where it stopped",
              [
  "Use the supplied fitted GloVe model. Convert the first and last recorded mean losses to summed pair losses using each record’s n_pairs.",
  "Print pass count, pairs per pass, first/last totals, the stated decreasing-history check and objective_value() evaluated at the final parameters."
],
              `from oop_ml import GloVe

corpus = """the chef chops onion and garlic
the chef stirs soup with butter and salt
the chef stirs onion and garlic in the pan
the chef bakes bread with flour in the oven
the chef stirs salt and pepper into the broth
the chef bakes bread and stirs the broth
flour and butter and salt in the pan
the chef chops onion for the soup and the broth
garlic and pepper in the soup with bread
the chef bakes flour and butter into bread in the oven
onion and garlic and salt in the broth
the chef stirs the soup in the pan with pepper
the astronomer watches the star and the planet
the astronomer charts the orbit of the moon
the comet and the meteor orbit the star
the telescope watches the galaxy and the nebula
the moon orbits the planet with gravity
the astronomer watches the eclipse of the moon with the telescope
the comet orbits the star and the astronomer charts the orbit
the telescope watches the nebula and the galaxy
the astronomer charts the meteor and the comet with the telescope
the planet orbits the star and the moon orbits the planet
the eclipse of the star and the eclipse of the moon
gravity and the orbit of the galaxy and the nebula""".splitlines()

model = GloVe(dimension=8, window=2, epochs=25, learning_rate=0.05, random_seed=0)
model.fit(corpus)
history = model.history
# Print how many passes ran and how many pairs each visited, the first and
# last pass totals, whether the history fell, and the objective at rest.`,
              `from oop_ml import GloVe

corpus = """the chef chops onion and garlic
the chef stirs soup with butter and salt
the chef stirs onion and garlic in the pan
the chef bakes bread with flour in the oven
the chef stirs salt and pepper into the broth
the chef bakes bread and stirs the broth
flour and butter and salt in the pan
the chef chops onion for the soup and the broth
garlic and pepper in the soup with bread
the chef bakes flour and butter into bread in the oven
onion and garlic and salt in the broth
the chef stirs the soup in the pan with pepper
the astronomer watches the star and the planet
the astronomer charts the orbit of the moon
the comet and the meteor orbit the star
the telescope watches the galaxy and the nebula
the moon orbits the planet with gravity
the astronomer watches the eclipse of the moon with the telescope
the comet orbits the star and the astronomer charts the orbit
the telescope watches the nebula and the galaxy
the astronomer charts the meteor and the comet with the telescope
the planet orbits the star and the moon orbits the planet
the eclipse of the star and the eclipse of the moon
gravity and the orbit of the galaxy and the nebula""".splitlines()

model = GloVe(dimension=8, window=2, epochs=25, learning_rate=0.05, random_seed=0)
model.fit(corpus)
history = model.history
n_pairs = history[0].n_pairs

print(f"passes {history.n_epochs}, pairs per pass {n_pairs}")
print(f"first pass total {history.mean_losses[0] * n_pairs:.4f}")
print(f"last pass total {history.mean_losses[-1] * n_pairs:.4f}")
print(f"history fell {history.fell}")
print(f"objective at rest {model.objective_value():.4f}")`,
              `passes 25, pairs per pass 281
first pass total 18.9335
last pass total 0.5550
history fell True
objective at rest 0.5148`,
              { hints: [
  "Recorded pass losses were measured while parameters changed between pairs.",
  "objective_value recomputes every term at the same final parameter state. It is not a stored last-pass number."
], check: numberCheck("What objective_value() does the model report at its final parameter values, to four decimal places?", 0.5148, 0.0005, "The final recomputed objective is 0.5148. It uses one final parameter state, whereas recorded pass terms were evaluated during successive updates."), question: "Why can the recomputed objective differ from the last recorded pass?" },
            ),
            exercise(
              "Ask the vectors the two questions",
              [
  "Use the supplied fifteen cooking and fifteen astronomy content words; exclude the shared function words from the pair means.",
  "Print mean within-topic cosine, mean cross-topic cosine and their difference. Then print moon’s five nearest words, allowing the full vocabulary in that neighbor search."
],
              `from itertools import combinations
from statistics import mean

from oop_ml import GloVe

corpus = """the chef chops onion and garlic
the chef stirs soup with butter and salt
the chef stirs onion and garlic in the pan
the chef bakes bread with flour in the oven
the chef stirs salt and pepper into the broth
the chef bakes bread and stirs the broth
flour and butter and salt in the pan
the chef chops onion for the soup and the broth
garlic and pepper in the soup with bread
the chef bakes flour and butter into bread in the oven
onion and garlic and salt in the broth
the chef stirs the soup in the pan with pepper
the astronomer watches the star and the planet
the astronomer charts the orbit of the moon
the comet and the meteor orbit the star
the telescope watches the galaxy and the nebula
the moon orbits the planet with gravity
the astronomer watches the eclipse of the moon with the telescope
the comet orbits the star and the astronomer charts the orbit
the telescope watches the nebula and the galaxy
the astronomer charts the meteor and the comet with the telescope
the planet orbits the star and the moon orbits the planet
the eclipse of the star and the eclipse of the moon
gravity and the orbit of the galaxy and the nebula""".splitlines()

cooking = "bakes bread broth butter chef chops flour garlic onion oven pan pepper salt soup stirs".split()
astronomy = "astronomer charts comet eclipse galaxy gravity meteor moon nebula orbit orbits planet star telescope watches".split()

model = GloVe(dimension=8, window=2, epochs=25, learning_rate=0.05, random_seed=0)
model.fit(corpus)
# Print the mean cosine between two words of the same half, the mean cosine
# between a word of each half, the gap between them, and the five words
# nearest moon with their similarities.`,
              `from itertools import combinations
from statistics import mean

from oop_ml import GloVe

corpus = """the chef chops onion and garlic
the chef stirs soup with butter and salt
the chef stirs onion and garlic in the pan
the chef bakes bread with flour in the oven
the chef stirs salt and pepper into the broth
the chef bakes bread and stirs the broth
flour and butter and salt in the pan
the chef chops onion for the soup and the broth
garlic and pepper in the soup with bread
the chef bakes flour and butter into bread in the oven
onion and garlic and salt in the broth
the chef stirs the soup in the pan with pepper
the astronomer watches the star and the planet
the astronomer charts the orbit of the moon
the comet and the meteor orbit the star
the telescope watches the galaxy and the nebula
the moon orbits the planet with gravity
the astronomer watches the eclipse of the moon with the telescope
the comet orbits the star and the astronomer charts the orbit
the telescope watches the nebula and the galaxy
the astronomer charts the meteor and the comet with the telescope
the planet orbits the star and the moon orbits the planet
the eclipse of the star and the eclipse of the moon
gravity and the orbit of the galaxy and the nebula""".splitlines()

cooking = "bakes bread broth butter chef chops flour garlic onion oven pan pepper salt soup stirs".split()
astronomy = "astronomer charts comet eclipse galaxy gravity meteor moon nebula orbit orbits planet star telescope watches".split()

model = GloVe(dimension=8, window=2, epochs=25, learning_rate=0.05, random_seed=0)
model.fit(corpus)

within = mean(model.similarity(a, b) for half in (cooking, astronomy) for a, b in combinations(half, 2))
across = mean(model.similarity(a, b) for a in cooking for b in astronomy)
print(f"within a half {within:.4f}")
print(f"across the halves {across:.4f}")
print(f"gap {within - across:.4f}")

for near in model.most_similar("moon", 5):
    print(f"{near.word} {near.similarity:.4f}")`,
              `within a half 0.1188
across the halves -0.0778
gap 0.1966
orbits 0.9826
of 0.9799
planet 0.9536
astronomer 0.9336
orbit 0.8815`,
              { hints: [
  "Use each within-topic pair once and every cooking/astronomy pair.",
  "The neighbor list answers a different question from a content-only mean; shared function words remain eligible there."
], check: numberCheck("What is the mean cosine over all distinct pairs within the supplied cooking and astronomy lists, to four decimal places?", 0.1188, 0.0005, "The same-topic content mean is 0.1188. Read it beside the cross-topic mean and individual neighbors before judging the representation."), question: "Do the learned vectors separate topics while keeping useful neighbors?" },
            ),
            exercise(
              "Widen the reach to the published five",
              [
  "Refit the supplied GloVe corpus at context windows one, two and five, keeping all other settings fixed.",
  "For each print positive pair count, percentage of positive counts below one, mean log count and mean learned word-role bias. These biases are the extra scalar terms alongside the vectors."
],
              `from math import log
from statistics import mean

from oop_ml import GloVe

corpus = """the chef chops onion and garlic
the chef stirs soup with butter and salt
the chef stirs onion and garlic in the pan
the chef bakes bread with flour in the oven
the chef stirs salt and pepper into the broth
the chef bakes bread and stirs the broth
flour and butter and salt in the pan
the chef chops onion for the soup and the broth
garlic and pepper in the soup with bread
the chef bakes flour and butter into bread in the oven
onion and garlic and salt in the broth
the chef stirs the soup in the pan with pepper
the astronomer watches the star and the planet
the astronomer charts the orbit of the moon
the comet and the meteor orbit the star
the telescope watches the galaxy and the nebula
the moon orbits the planet with gravity
the astronomer watches the eclipse of the moon with the telescope
the comet orbits the star and the astronomer charts the orbit
the telescope watches the nebula and the galaxy
the astronomer charts the meteor and the comet with the telescope
the planet orbits the star and the moon orbits the planet
the eclipse of the star and the eclipse of the moon
gravity and the orbit of the galaxy and the nebula""".splitlines()

for reach in (1, 2, 5):
    model = GloVe(dimension=8, window=reach, epochs=25, learning_rate=0.05, random_seed=0)
    model.fit(corpus)
    # Collect the filled counts of the table, then print the reach, how many
    # pairs there are, the share below one, the mean logarithm of a count and
    # the mean of the word-role spare numbers.`,
              `from math import log
from statistics import mean

from oop_ml import GloVe

corpus = """the chef chops onion and garlic
the chef stirs soup with butter and salt
the chef stirs onion and garlic in the pan
the chef bakes bread with flour in the oven
the chef stirs salt and pepper into the broth
the chef bakes bread and stirs the broth
flour and butter and salt in the pan
the chef chops onion for the soup and the broth
garlic and pepper in the soup with bread
the chef bakes flour and butter into bread in the oven
onion and garlic and salt in the broth
the chef stirs the soup in the pan with pepper
the astronomer watches the star and the planet
the astronomer charts the orbit of the moon
the comet and the meteor orbit the star
the telescope watches the galaxy and the nebula
the moon orbits the planet with gravity
the astronomer watches the eclipse of the moon with the telescope
the comet orbits the star and the astronomer charts the orbit
the telescope watches the nebula and the galaxy
the astronomer charts the meteor and the comet with the telescope
the planet orbits the star and the moon orbits the planet
the eclipse of the star and the eclipse of the moon
gravity and the orbit of the galaxy and the nebula""".splitlines()

for reach in (1, 2, 5):
    model = GloVe(dimension=8, window=reach, epochs=25, learning_rate=0.05, random_seed=0)
    model.fit(corpus)
    counts = model.cooccurrence.counts
    filled = [float(count) for count in counts[counts > 0]]
    below = sum(1 for count in filled if count < 1)
    print(f"reach {reach}, {len(filled)} pairs, {below / len(filled):.1%} below one")
    print(f"  mean logarithm {mean(log(count) for count in filled):.4f}")
    print(f"  mean spare number {float(model.biases.mean()):.4f}")`,
              `reach 1, 158 pairs, 0.0% below one
  mean logarithm 0.6623
  mean spare number 0.1436
reach 2, 281 pairs, 30.6% below one
  mean logarithm 0.2617
  mean spare number 0.0700
reach 5, 474 pairs, 51.9% below one
  mean logarithm -0.1523
  mean spare number -0.0169`,
              { hints: [
  "Inspect only positive counts before taking logarithms.",
  "Read the word-role biases from model.biases and compare them with the fixed count statistics; they are different quantities."
], check: numberCheck("What is the mean logarithm of a count at a reach of five?", -0.1523, 0.0005, "The mean log count is -0.1523. At this reach many positive fractional counts lie below one, which gives them negative logarithms before any fitting."), question: "How does context reach change the count distribution the model must fit?" },
            ),
          ],
        },
      ]}
    />
  );
}
