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
import { Word2vecCombinations } from "@/components/widgets/Word2vecCombinations";
import { Word2vecBookSpace } from "@/components/widgets/Word2vecBookSpace";
import { Word2vecLongerTraining } from "@/components/widgets/Word2vecLongerTraining";
import { Word2vecPairStep } from "@/components/widgets/Word2vecPairStep";
import { Word2vecPlayground } from "@/components/widgets/Word2vecPlayground";
import { Word2vecRareWord } from "@/components/widgets/Word2vecRareWord";
import { Word2vecSampler } from "@/components/widgets/Word2vecSampler";
import { Word2vecSeeds } from "@/components/widgets/Word2vecSeeds";
import { Word2vecTree } from "@/components/widgets/Word2vecTree";
import { Word2vecTwoTables } from "@/components/widgets/Word2vecTwoTables";
import { Word2vecWindowPairs } from "@/components/widgets/Word2vecWindowPairs";

export const metadata: Metadata = {
  title: "Word2vec · Perceptron Lab",
  description:
    "Word2vec learns word vectors through prediction tasks involving nearby words. Shared patterns of use shape the vectors, allowing their numerical relationships to reflect regularities in the training text.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function Word2vecPage() {
  return (
    <ConceptPage
      lessonId="word2vec"
      intuition={lessonIntuitions["word2vec"]}
      technicalStart="Part 3. Which Side Predicts Which"
      openingTitle="Learn a Word by Trying to Predict Its Neighbors" openingId="learn-a-word-by-trying-to-predict-its-neighbours"
      playgroundTitle="Move word vectors by changing their neighbors"
      playgroundIntro="Inspect the center-context training pairs before the learned neighbors. Compare the resulting similarities across training settings and random starts."
      title="Word2vec"
      tagline={"Word2vec learns word vectors through prediction tasks involving nearby words. Shared patterns of use shape the vectors, allowing their numerical relationships to reflect regularities in the training text."}
      prerequisites={
        <>
          {"The negative-sampling example turns dot products into binary scores with the "}{" "}
          <Link href="/concepts/logistic-regression" className={link}>
            logistic function
          </Link>
          , and every step is one step of{" "}
          <Link href="/concepts/gradient-descent-regression" className={link}>
            gradient descent
          </Link>
          , so both of those are used here without being explained again. Words
          are compared by the{" "}
          <Link href="/concepts/distance-metrics" className={link}>
            cosine
          </Link>{" "}
          similarity between their vectors throughout. It measures the cosine of their angle: vectors pointing in the same direction have similarity one, even if their lengths differ. The linked lesson compares that directional similarity with distance.
        </>
      }

      playground={<Word2vecPlayground />}
      sections={[
        { id: "part-1-counting-a-words-neighbours",
          title: "Part 1. Counting a Word’s Neighbors",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Two lists of words that never meet">
                <>
<p>
                  What evidence will these vectors learn from? Our corpus contains two hundred sentences, each five to eight words long. Every sentence uses one of two word lists. The first contains twenty forms of play, stay, say, walk and talk; the second contains eleven words about money, including stock, bond, market and price. The lists never mix within a sentence. That separation gives us a pattern to look for in the learned vectors.
                </p>
                <p>
                  That comes to 1,311 word occurrences across 31 distinct words, and no word appears in both lists.
                </p>
</>
                <p>
                  These generated sentences are deliberately artificial. We sample from the two word lists without writing grammatical sentences, so we know which contextual pattern the experiment supplies. If the learned vectors separate the lists, we can check that result against the construction. It would not establish that the method had learned grammar or a general account of meaning.
                </p>
                <KeepInMind>
                  {"The training receives no list labels. We use within-list and cross-list mean cosines to inspect whether the learned vectors reflect the constructed separation. Those measures do not test all the relationships an embedding may need."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The table counting gives you">
                <p>One possible representation counts nearby words. In this experiment, a neighbor one position away contributes more than one farther away, using the stated inverse-distance weighting. Each row of the resulting word-context table describes the contexts observed for one word.</p>
                <Equation>{"row(w)[v] = how often v occurred within reach of w, discounted by how far"}</Equation>
                <p>The count rows already separate the constructed word lists. Their mean within-list cosine is 0.8558, while cross-list rows have a cosine of zero because they share no observed context coordinates. The table has 961 cells, including 440 zero counts. That size motivates looking for a more compact representation, rather than treating zero counts as information that is always useless.</p>
                <p>The first three chapters of the book provide a less controlled comparison with 364 vocabulary words. A count vector then has one coordinate per context word. Comparing that representation with a learned shorter vector lets us examine what the reduction preserves on text whose groups were not arranged for the experiment.</p>
                <Word2vecBookSpace />
                <>
<p>
                  The toggle is the rest of this page in one control. The same words are drawn twice, once from a row of 364 counts and once from a vector of 24 numbers that a fit produced, and the figure to watch is how much of the spread three directions can hold. For the counted rows it is 19.8%, so the picture is showing a fifth of what is there and the description really is as wide as it looks.
                </p>
                <p>
                  {"The learned vectors’ three plotted directions retain 76.4% of their measured spread. That makes this projection easier to inspect, but a larger plotted share does not by itself establish a better representation."}
                </p>
</>
                <KeepInMind>
                  Counting works, and on a corpus this size it works very well.
                  What follows is not a repair of a broken method; it is a
                  reaction to what that table costs once the corpus is not thirty
                  one words.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What a fixed width would have to buy">
                <p>
                  The trouble with describing a word by a row of the counting
                  table is that the row is as wide as the vocabulary. Thirty one
                  words give a row of 31 numbers, and the whole table is 961; a
                  vocabulary of forty thousand words, which is a modest one, gives
                  a row of forty thousand and a table of 1.6 billion. The table
                  grows as the square of the vocabulary while the number of
                  distinct pairs that actually occur grows nothing like as fast,
                  so the zeros take over.
                </p>
                <>
<p>
                  {"Fix the retained width at twelve coordinates per word. The output then grows linearly with vocabulary size. Training also uses an output table of comparable size; the table below counts only the retained vectors, against a dense count matrix rather than sparse storage."}
                </p>
                <p>
                  What has to survive the squeezing is the comparisons rather than the counts, so that words of one list still come out near each other and words of different lists still do not.
                </p>
</>
                <NumberTable
                  headings={["vocabulary", "cells in the counting table", "numbers at a fixed width of 12"]}
                  rows={[
                    ["31", "961", "372"],
                    ["1,000", "1,000,000", "12,000"],
                    ["40,000", "1,600,000,000", "480,000"],
                  ]}
                  caption="The first row is measured on the corpus this page uses; the other two are the same two formulas, the square of the vocabulary against twelve times it."
                />
                <KeepInMind>
                  {"A fixed-width representation is a capacity choice, not a guarantee that all useful context distinctions survive. We can test what it retains by checking the comparisons needed for the task."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        { id: "part-2-predicting-a-neighbour-instead",
          title: "Part 2. Predicting a Neighbor Instead",
          content: (
            <>
              <SubSection title="4. The change of question">
                <p>
                  {"Mikolov and colleagues introduced the word2vec architectures in 2013 to learn useful word representations efficiently from large text collections. Instead of explicitly decomposing a count table, train a small prediction model on nearby words, then use its input vectors as the representation. The training task supplies evidence about context without labeled word-similarity pairs."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://arxiv.org/abs/1301.3781">{"Mikolov et al.: Efficient Estimation of Word Representations in Vector Space (2013)"}</Link></p>
                <p>
                  {"Walked and walking occur in the same constructed list, while market occurs in the other. Their training pairs therefore offer different context evidence. Sharing statistical patterns can encourage related vectors, but the objective does not require identical vectors for every word in a group."}
                </p>
                <WhyThisWorks title="Why an impossible task is the right one to set">
                  <p>
                  {"The exact next context word remains uncertain even in this controlled corpus. A probability model can represent that uncertainty rather than choose one correct neighbor for every occurrence. Similar context distributions can make related representations useful; they do not require all twenty words to occupy one point."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"The training objective measures the prediction task. It provides useful diagnostics, while the retained vectors need additional checks for the way they will be used."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Sliding a window over the corpus">
                <p>

                  The corpus becomes training data by sliding a window along
                  every sentence. At each position one word is the center and the
                  words within reach on either side are its context, and that
                  pairing is one piece of training. Nothing more elaborate than
                  that happens; there is no parse, no grammar, and no notion of
                  which side a neighbor was on.
                </p>
                <p>
                  {"Use walk walked talks, bond market price, and walked talks walk to inspect the window mechanics. These nine word occurrences provide twelve skip-gram pairs at reach one. They are enough to demonstrate an update, but much too limited for claims about general language relationships."}
                </p>
                <Word2vecWindowPairs />
                <p>
                  At a reach of one those three sentences give twelve pieces of
                  training one way round and nine the other, and the difference
                  is the whole of Part 3. Widening the reach to two takes the
                  first count to eighteen and leaves the second at nine.
                </p>
                <InAModel title="On the two-list corpus">
                  <p>
                    At a reach of three the same rule gives 3,968 pairs in the
                    first pass, and the reach is redrawn at random between one
                    and three at every position rather than held fixed, which
                    means a word right next door falls inside the window three
                    times as often as a word three away. That is a distance
                    weighting achieved by a coin toss instead of a formula, and
                    it is why the pair count differs slightly from one pass to the
                    next, 3,968 in the first, then 3,865, then 3,901.
                  </p>
                </InAModel>
                <KeepInMind>
                  {"In these implementations, context is defined by a window within each sentence, without left-versus-right labels. Filtering rare tokens before constructing windows can bring the remaining words closer. Other window and position rules are possible, so record this preprocessing choice."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Scoring a pair with a dot product">
                <p>
                  {"Assign separate input and output vectors to each word. Their dot product scores a center–context pair. Its sign reflects alignment, while its magnitude also depends on both lengths. In negative sampling, sigmoid turns this score into a binary probability for the observed-versus-noise classification objective. It is not a normalized probability over all neighboring words."}
                </p>
                <Equation>{"score = u · h        probability = 1 / (1 + exp(−score))"}</Equation>
                <p>
                  {"Observed pairs receive label 1; sampled noise pairs receive label 0. A sampled pair need not be linguistically impossible or absent elsewhere in the corpus. Gradient updates increase or decrease its dot-product score according to that training label, rather than directly minimizing Euclidean distance between word vectors."}
                </p>
                <Equation>{"cost = −log(probability) when the pair occurred,  −log(1 − probability) when it did not"}</Equation>
                <Word2vecPairStep />
                <WorkedExample title="One pair, three rows, by hand">
                  <>
                    <p>

                      Put the input word at (0.5, 0). Give the true neighbor vector (1,
                      0), and give two sampled alternatives vectors (−1, 0) and (0, 1).
                      Their dot products are 0.5, −0.5 and zero. Sigmoid converts those
                      scores into the probabilities used by the loss.
                    </p>
                    <Equation>{"true pair probability = sigmoid(0.5) ≈ 0.622459\nfirst sampled probability = sigmoid(−0.5) ≈ 0.377541\nsecond sampled probability = sigmoid(0) = 0.5"}</Equation>
                    <p>
                      The true pair has target one; each sampled pair has target zero.
                      Calculate each cost with that target before adding them.
                    </p>
                    <Equation>{"true pair loss = −ln(0.622459) ≈ 0.474077\nfirst sampled loss = −ln(1 − 0.377541) ≈ 0.474077\nsecond sampled loss = −ln(1 − 0.5) ≈ 0.693147\ntotal loss ≈ 0.474077 + 0.474077 + 0.693147 ≈ 1.641301"}</Equation>
                    <p>
                      The update direction for the input vector is approximately
                      (0.755081, −0.5), before multiplication by the learning rate. The
                      sampled rows contribute to that direction as well as to the loss.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  The tables give a word separate roles as an input and as a
                  predicted output. Their dot product can then change without
                  requiring the two vectors to be identical. If one table were
                  tied to both roles, a word&apos;s self-score would be its squared
                  vector length, always nonnegative but not necessarily large.
                  That would impose a constraint the two-table model avoids.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Throwing the model away">
                <p>
                  When the passes are over there are two tables of exactly the
                  same size, 372 numbers each on this corpus. One holds a vector
                  per word for when the word is read; the other holds a row per
                  word for when the word is being predicted. The answer is the
                  first table, and the second is deleted.
                </p>
                <Word2vecTwoTables />
                <>
<p>
                  {"The output table assigns higher sigmoid scores to the listed verb forms than to the money words for walked. These scores evaluate the binary training objective. They do not sum to a context-word distribution, so 0.28 is not a 28% next-neighbor probability."}
                </p>
                <p>
                  {"The mean binary score is 0.2672 for verb forms and 0.0061 for money words in this query. That shows separation under the training objective. Calling the model unconfident from those scores alone would ignore the negative-sampling ratio and noise distribution."}
                </p>
</>
                <KeepInMind>
                  {"This SDK retains the input-vector table for word comparisons. Keeping or combining output vectors is another representation choice. Evaluate that choice under the intended task; the training objective alone does not identify one universally best stored table."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "Two rows of the counting table give a cosine of 0.8558 on average within a list and exactly 0.0000 across the two. Why exactly zero?",
              [
                "Two words from different lists share no neighbor at all, so their rows are perpendicular",
                "The cosine was clipped at zero before being reported",
                "A table with 45.8% of its cells at zero compares any two of its rows at zero",
                "The discount leaves a neighbor three away contributing nothing",
              ],
              0,
              "No sentence is drawn from both lists, so no word of one list ever turns up within reach of a word of the other, and no coordinate is nonzero in both rows. The zeros alone do not do it, since two rows of one list compare at 0.8558 in the same table, and a neighbor three away still counts a third.",
            ),
            trueFalse(
              "What has to survive a fixed width of twelve numbers is the comparisons between words, not the counts themselves.",
              true,
              "The twelve coordinates are learned for predicting nearby words. The objective does not ask them to reconstruct all 31 context counts. In this experiment we judge the resulting vectors by whether they distinguish the two supplied word groups. A short vector can preserve useful comparisons without preserving every original count.",
            ),
            choice(
              "Why does every word get two vectors rather than one?",
              [
                "Separate tables let the input role and predicted-output role learn independently instead of tying their scores to one shared vector",
                "One is for skip-gram and the other for the bag of words",
                "The second table is what the negatives are drawn from",
                "A single table could not be rotated without changing the cost",
              ],
              0,
              "One table represents a word when it is read; the other represents it as a prediction target. Tying the tables would constrain their dot products, including making a self-score equal to a squared length. Separate tables allow the two roles to learn independently. The implementation on this page retains the input table for later word comparisons.",
            ),
            several(
              "Which of these are true of the window word2vec slides along a sentence?",
              [
                              "Word order inside the window is discarded",
                              "Sentence boundaries stop the window",
                              "A word dropped for being too rare is removed before the windows are formed, so its neighbors become each other’s neighbors",
                              "On the two-list corpus the reach is redrawn at random between one and three at every position",
                            ],
              [0, 1, 2, 3],
              "The window determines which nearby word occurrences become training examples. This implementation does not label a neighbor as left or right and does not parse a sentence's grammar. It redraws the window radius, so nearby occurrences are included more often than distant ones. That sampling changes the number of pairs from pass to pass: the reported counts are 3,968, 3,865 and 3,901.",
              {
                "description": "This lesson’s word2vec setup uses ordinary unordered skip-gram/CBOW contexts. It removes words below its minimum-count threshold before building windows, never crosses sentence boundaries and draws a reach uniformly from 1 through 3 at each remaining position. It does not use a positional or directional context variant."
              },
            ),
            trueFalse(
              "The second table is deleted because it had learned nothing useful.",
              false,
              "The output table learned binary scores for distinguishing observed word-context pairs from sampled noise pairs. For walked, its reported sigmoid scores average 0.2672 over the verb forms and 0.0061 over the money words. These are not a normalized distribution over neighboring words. Choosing to retain only the input table does not mean the output table learned nothing; either table or a combination can be evaluated for the intended use.",
            ),
        ],
        },
        {
          title: "Part 3. Which Side Predicts Which",
          content: (
            <>
              <SubSection title="8. The center predicting each neighbor" id="8-the-centre-predicting-each-neighbour">
                <p>

                  The first arrangement is skip-gram. Read the center
                  word&rsquo;s vector, and use it to predict each of its context
                  words in turn, one piece of training per neighbor. At a
                  position with three words in its window the center word&rsquo;s
                  vector is read three times, corrected three times, and each of
                  the three neighbors has its row corrected once.
                </p>
                <Equation>{"score for neighbour v of the centre w   =   u(v) · h(w)"}</Equation>
                <p>
                  {"Skip-gram creates one training example per selected context word. That often gives more updates than CBOW from the same token sequence. Runtime and the quality of rare-word representations still depend on the objective, sampling and implementation; pair count alone does not settle either."}
                </p>
              </SubSection>

              <SubSection title="9. The neighbors predicting the center" id="9-the-neighbours-predicting-the-centre">
                <p>

                  The second arrangement runs the same window the other way.
                  Average the vectors of all the context words into one vector,
                  and use that average to predict the center word. One piece of
                  training per position, whatever the reach, and the correction
                  the average receives is shared out equally among the words that
                  went into it.
                </p>
                <Equation>{"h = the mean of the context vectors        score = u(centre) · h"}</Equation>
                <p>
                  {"The continuous bag-of-words model, or CBOW, ignores context order and uses the context summary to predict the center. Here it averages the vectors, so each context vector receives a fraction of the gradient to that average. That update is not automatically weaker in every meaningful sense than a skip-gram update."}
                </p>
                <WorkedExample title="The twelve and the nine, counted">
                  <>
                    <p>

                      Part 2 left two counts unexplained. At a reach of one the
                      three short sentences gave twelve pieces of training one
                      way round and nine the other. Take the first of them,
                      walk walked talks. The middle word has a neighbor on
                      each side and each end word has one neighbor.
                    </p>
                    <NumberTable
                      headings={["center", "words within reach", "pieces, center predicting", "pieces, neighbors predicting"]}
                      rows={[
                        ["walk", "walked", "1", "1"],
                        ["walked", "walk, talks", "2", "1"],
                        ["talks", "walked", "1", "1"],
                      ]}
                      caption="One sentence of three words at a reach of one. The other two sentences have the same shape."
                    />
                    <Equation>{"centre predicting each neighbour = (1 + 2 + 1) × 3 sentences = 12\nneighbours predicting the centre = (1 + 1 + 1) × 3 sentences = 9"}</Equation>
                    <p>

                      The first arrangement counts neighbors and the second
                      counts positions. Widen the reach to two and every word
                      of a three-word sentence has two neighbors, so the first
                      count becomes eighteen. The second stays at nine, because
                      a position is still one average and one prediction
                      however many vectors went into the average.
                    </p>
                  </>
                </WorkedExample>
              </SubSection>

              <SubSection title="10. What swapping the direction changes">
                <p>
                  {"Skip-gram produces 3,968 training pairs in the stated pass, while CBOW produces 1,311 context summaries. CBOW updates several context rows per summary, so this ratio is not a runtime ratio. The following table compares their resulting representations under the chosen training settings."}
                </p>
                <Word2vecCombinations word="walked" />
                <p>
                  {"At the doubled initial learning rate, negative-sampling skip-gram gives a topic gap of 0.8266 and CBOW gives 0.2813. The objectives and update patterns differ as well as their pair counts, so this experiment does not isolate number of training examples as the cause."}
                </p>
                <KeepInMind>
                  {"Skip-gram and CBOW use the same contexts in different prediction arrangements. Compare speed and representation quality for the actual corpus and settings. A larger corpus does not automatically decide which tradeoff wins."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Making the Arithmetic Affordable",
          content: (
            <>
              <SubSection title="11. Why scoring every word is out of the question">
                <p>So far we scored one center-context pair. To define a normalized probability over possible context words, we score the center against every context row and apply softmax. The probabilities then sum to one across the vocabulary. Calculating that objective touches every output row for each training pair, which becomes costly as the vocabulary grows.</p>
                <Equation>{"P(v | w) = exp(u(v) · h(w)) / Σ over every word v′ of exp(u(v′) · h(w))"}</Equation>
                <p>
                  {"Full softmax updates every output row for each pair. This example is small enough for that cost to be modest; a much larger vocabulary multiplies the work at every training step. The following alternatives reduce output scoring work using different objectives or factorizations."}
                </p>
                <KeepInMind>
                  {"Negative sampling changes the objective to binary discrimination. Hierarchical softmax keeps a normalized distribution by parameterizing paths through a tree. The latter is exact for its tree model, but is not generally the same distribution family as a flat linear softmax with the same embedding width."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. A handful of wrong answers instead">
                <p>

                  The first answer replaces the question &ldquo;which of the
                  thirty one words is the neighbor&rdquo; with a much easier
                  one. Take the word that really did appear, and take five words
                  drawn at random, and ask of each of the six separately whether
                  it is a real neighbor or a random word. That is six
                  independent yes-or-no judgments, six rows touched, and the
                  number six does not grow when the vocabulary does.
                </p>
                <Equation>{"cost = −log σ(u(v) · h)  −  Σ over the k drawn words of log(1 − σ(u(v′) · h))"}</Equation>
                <p>Negative sampling trains a binary discrimination task for observed word-context pairs and sampled alternatives. Those separate scores do not form a normalized next-word distribution over the whole vocabulary. Repeated updates encourage the model to distinguish the observed pairs from its noise samples, which is a different objective from full softmax prediction.</p>
                <WhyThisWorks title="Why contrasting against noise is enough">
                  <>
<p>
                    A model that only ever saw true pairs could satisfy every one of them by making all vectors identical and very long, since then every score is large and every probability near one. The drawn words are what stops that, because the same trick would make their probabilities near one too and they are asked for zero.
                  </p>
                  <p>
                  {"Negative examples prevent the all-high-score solution from satisfying the binary labels. The learned geometry must balance observed and sampled evidence, but many parameter settings can do so. Identical contexts do not prove that the stored vectors must become identical."}
                </p>
</>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="13. Where the wrong answers come from">
                <p>
                  {"The noise distribution controls which alternatives receive updates. Sampling by frequency emphasizes common words; uniform sampling gives relatively more attention to rare words. Neither is automatically useless. Compare the resulting representations under the task."}
                </p>
                <p>

                  Word2vec raises each count to the power three quarters before
                  normalizing, which sits between the two. The exponent has no
                  derivation behind it; the paper reports it as the value that
                  worked, and it has stayed.
                </p>
                <Equation>{"share of the draw for word w  ∝  count(w) ^ 0.75"}</Equation>
                <Word2vecSampler />
                <WorkedExample title="Three words, counts of a thousand, ten and one">
                  <>
<p>
                    In proportion to frequency the three shares are 0.989120, 0.009891 and 0.000989, so the rarest word is drawn about once in a thousand draws. At the three-quarters power they become 0.964091, 0.030487 and 0.005421, so the rarest word is drawn five and a half times as often as before and the commonest gives up two and a half points of share.
                  </p>
                  <p>
                    On the two-list corpus the counts are much flatter, running from 73 down to 17, so the effect is correspondingly smaller, and the odds between the commonest and rarest word fall from 4.2941 to 2.9830.
                  </p>
</>
                </WorkedExample>
                <KeepInMind>
                  {"The three-quarters exponent changes a highly skewed count distribution more than this comparatively flat one. That explains why its effect differs across these examples; it does not prove that another exponent would make a real-text draw useless."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. A path down a tree instead of a sweep">
                <p>Hierarchical softmax keeps a normalized probability model while organizing its calculation as a binary tree. Words occupy the leaves. Each internal node has weights for a binary decision, and a word’s probability is the product of the decision probabilities on its path. Scoring one observed word therefore uses that path rather than every vocabulary row.</p>
                <Equation>{"P(v | w) = Π over the branch points on v’s path of σ(±  u(node) · h(w))"}</Equation>
                <p>
                  {"Complementary branch probabilities define a normalized distribution over the leaves of a finite tree. Scoring a target touches only the nodes on its path. A Huffman tree minimizes expected binary code length for its given symbol frequencies; it does not guarantee the fastest implementation or the best learned representation."}
                </p>
                <Word2vecTree />
                <WorkedExample title="The six-word corpus, arranged">
                  <p>
                    Walk, walked and talks appear twice each and bond, market and
                    price once each. The tree puts walk and walked two steps from
                    the root and the other four three steps down, so the average
                    number of choices per word occurrence is 2.5556 against the
                    six rows a sweep would touch. Five branch points serve six
                    words, which is the general rule, since a tree over n words has
                    n − 1 branch points, so the table of rows is one row shorter
                    than the table a sweep would need.
                  </p>
                </WorkedExample>
              </SubSection>

              <SubSection title="15. What the tree saves, honestly">
                <p>
                  With this small vocabulary, hierarchical softmax uses an average of 4.9008 branch decisions per target instead of scoring all 31 words. That is about six times fewer output decisions than a full sweep. Against this negative-sampling setup&apos;s six output rows, however, the difference is only about one row. These operation counts help explain the methods; they are not measured runtime ratios.
                </p>
                <>
<p>
                  {"Here the Huffman tree’s mean path length is close to that of a balanced tree. The modest frequency range leaves less opportunity to shorten common-word paths. The larger synthetic comparison below uses a more skewed frequency distribution."}
                </p>
                <p>
                  Give the same construction counts that fall as one over the rank, which is roughly how word counts really fall, and at forty thousand words the average path is 10.7469 against the balanced tree&rsquo;s 15.2877.
                </p>
</>
                <NumberTable
                  headings={["vocabulary", "rows a sweep touches", "a path, flat counts", "a path, realistic counts", "drawn wrong answers"]}
                  rows={[
                    ["31", "31", "4.97", "4.14", "6"],
                    ["1,000", "1,000", "9.98", "7.52", "6"],
                    ["40,000", "40,000", "15.36", "10.75", "6"],
                  ]}
                  caption="Rows touched per training pair. Every figure is computed from the arrangement itself; the counts in the realistic column fall as one over the word’s rank."
                />
                <KeepInMind>
                  {"For five noise samples, negative sampling evaluates six binary output terms per pair. Hierarchical softmax evaluates a target’s path. Their relative operation count changes with the tree and vocabulary, and they optimize different models. Both can produce useful word vectors; normalization alone does not establish better geometry."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "The bag of words produces 1,311 pieces of training in a pass on this corpus. Why that number?",
              [
                "One per word occurrence, whatever the reach",
                "One per sentence",
                "One per distinct word",
                "One per neighbor of each center word",
              ],
              0,
              "Continuous bag of words makes one prediction for each center position by averaging its context vectors. This corpus supplies 1,311 such positions in a pass. Skip-gram makes a prediction for each selected neighbor instead, producing 3,968 pairs in the reported pass. That gives skip-gram more prediction updates here; elapsed runtime also depends on the implementation and settings.",
            ),
            trueFalse(
              "At the published first step the bag of words with drawn wrong answers still separated the two lists.",
              false,
              "At initial learning rate 0.025, the bag-of-words fit has a within-minus-across cosine gap of 0.0034, compared with 0.7033 for skip-gram. At 0.05 the gaps are 0.2813 and 0.8266 respectively. The smaller-rate bag-of-words run barely distinguishes these lists after five passes. This comparison does not establish that it must always use a larger rate; more updates or different data could change the result.",
            ),
            choice(
              "Why does word2vec raise each count to the power three quarters before drawing negatives?",
              [
                "It sits between drawing in proportion to frequency and drawing uniformly, and the paper reports it as the value that worked",
                "It is derived from the logistic function the pairs are scored with",
                "It is what makes the shares add to one",
                "It guarantees every word is drawn at least once in a pass",
              ],
              0,
              "Sampling directly in proportion to frequency favors common words. Uniform sampling gives rare and common words equal probability. Raising counts to three quarters keeps common words more likely while reducing that imbalance. The exponent is an empirical design choice, not a value forced by the objective. Here the counts range from 17 to 73, so the imbalance is modest compared with a large natural-language corpus.",
            ),
            several(
              "Which of these are true of arranging the vocabulary as the leaves of a binary tree?",
              [
                "The leaf probabilities sum to one, giving an exactly normalized tree distribution rather than a truncated probability sum",
                "A tree over n words has n − 1 branch points, so its table is one row shorter than a sweep would need",
                "On the two-list corpus Huffman’s arrangement saves more than a whole branch point over a tree that split evenly",
                "The number of rows touched is six, whatever the vocabulary holds"
              ],
              [0, 1],
              "Branch probabilities sum to one and complete root-to-leaf paths partition that probability. Hierarchical softmax therefore defines a normalized distribution, although its parameterization is different from a flat softmax. A full binary tree with n leaves has n − 1 internal nodes. Here Huffman saves only about 0.0534 decisions over the evenly split tree; touching six rows belongs to the separately configured negative-sampling comparison.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Vocabulary: 31 words.\nHierarchical softmax uses a full binary tree with one leaf per word.\nEvery branch assigns complementary probabilities to its two children.\nAverage decisions per target, weighted by corpus use:\nHuffman tree: 4.9008\nevenly split tree: 4.9542\nNegative-sampling comparison: 1 positive + 5 negative rows."
              },
            ),
            trueFalse(
              "Which of the tree and negative sampling touches fewer rows depends on the size of the vocabulary.",
              true,
              "With five negative samples, each negative-sampling update scores one positive target and five sampled targets. That configured count stays fixed as the vocabulary grows, although repeated samples can reuse a row. A tree update follows the target's path, whose length depends on the tree and word frequency. Hierarchical softmax defines a normalized distribution over the vocabulary; negative sampling uses a different training objective.",
            ),
        ],
        },
        {
          title: "Part 5. Running a Fit",
          content: (
            <>
              <SubSection title="16. The objective falling, pass by pass">
                <p>
                  {"The recorded mean loss describes the sampled training examples in each pass. Different draws introduce variation, so use repeated or fixed evaluation samples when comparing runs. Their losses can still estimate a common expected objective when the sampling protocol is the same."}
                </p>
                <InAModel title="Five passes, skip-gram, drawn wrong answers">
                  <p>
                    The mean cost per pair goes 3.1279, 2.1612, 2.0865, 2.0813
                    and 2.0872 across the five passes, so almost all of the fall
                    happens in the first pass and the last pass is very slightly
                    worse than the one before it. That rise is real and is not a
                    bug, since the walk is stochastic, the negatives are redrawn every
                    time, and a mean over 3,892 pairs of a quantity that depends
                    on the draw moves about a little.
                  </p>
                </InAModel>
                <p>
                  {"Inspect both the loss value and its trend. A flat or rising curve can reflect an unsuitable learning rate, sampling variation, limited capacity or other issues. A quick plateau does not prove that every useful pattern in the corpus has been learned."}
                </p>
                <KeepInMind>
                  {"Training loss measures the objective being optimized. A lower value need not improve the word-comparison task, as Part 7 illustrates. Use that distinction when deciding which evaluations to run."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. A published default that fails here">
                <p>
                  The step size starts at a stated value and falls linearly
                  towards a floor across every position of every pass, so the
                  first corrections are large and the last are tiny. The value the
                  original program ships with is 0.025, and on this corpus one of
                  the four arrangements does not work at that value.
                </p>
                <>
<p>
                  {"At learning rate 0.025, this CBOW run leaves within-list and cross-list cosines both near 1. The representation provides little topic separation by that measure. This is an outcome of these updates, not the initial state: the input vectors start as small signed random values rather than all pointing the same way."}
                </p>
                <p>
                  Doubling the step size to 0.05 takes the same arrangement to 0.9929 and 0.7116, a difference of 0.2813, and the verb form is gone from the list.
                </p>
</>
                <NumberTable
                  headings={["arrangement", "at 0.025, apart by", "at 0.05, apart by"]}
                  rows={[
                    ["skip-gram, drawn wrong answers", "0.7033", "0.8266"],
                    ["skip-gram, a tree", "1.8525", "1.5348"],
                    ["bag of words, drawn wrong answers", "0.0034", "0.2813"],
                    ["bag of words, a tree", "1.7818", "1.9445"],
                  ]}
                  caption="The mean cosine within a list minus the mean cosine across the two, after five passes at a width of twelve and a reach of three."
                />
                <>
<p>
                  This is worth dwelling on because it is a published default producing a result that looks like a working fit. Nothing raises, the cost curve falls from 4.1568 to 2.8830, and the nearest-word list for a verb form is full of verb forms. It is only the second number, how alike two words from different lists came out, that says the fit answered the same thing for everything.
                </p>
                <p>
                  {"A default is a starting setting, not a guarantee for every corpus and objective. Here an initial rate of 0.05 improves the reported separation for this arrangement. Check the effect on the chosen evaluation rather than assuming corpus size alone explains it."}
                </p>
</>
                <KeepInMind>
                  {"Check cross-group comparisons as well as within-group ones. A representation that gives nearly every pair a high cosine can look good if only the within-group score is reported."}
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The four combinations, side by side">
                <p>
                  {"The two architectures and two objectives give four training arrangements. Their cosine values share the same numerical definition, but a task evaluation is needed to decide which geometry is useful. Compare settings under a documented training and evaluation protocol."}
                </p>
                <p>The two tree fits report mean cross-list cosines of −0.5570 and −0.9618; the negative-sampling fits report 0.1696 and 0.7116. These numbers come from different training objectives, so a more negative value does not by itself mean a better representation. Tree decisions and sampled pair decisions apply different constraints. Negative sampling trains dot products between input and output vectors to distinguish observed pairs from sampled alternatives. It does not require the stored word vectors to become perpendicular, and these measurements do not establish a universal angle for unrelated words.</p>
                <Word2vecCombinations word="walked" />
                <p>
                  What can be compared is whether the lists came apart, and at
                  the doubled step all four separate them. What can also be
                  compared is the nearest-word lists, and there the four agree on
                  the answer to the question anybody would ask and disagree on
                  everything else. Asked for the five words nearest walked, all
                  four return five verb forms and no word about money; between
                  them they name ten different words, and only one word, talking,
                  appears in all four lists.
                </p>
                <KeepInMind>
                  {"All four runs return verb-form neighbors for walked, but their top-five lists differ. That shows agreement on this broad grouping without agreement on the finer ranking. It does not prove that the competing rankings are equally useful for another task."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. What a seed fixes">
                <p>
                  {"The seed controls the initialization and random choices in this implementation. With the same inputs, code and numeric environment, repeated runs are reproducible. A different seed may change the result; it does not guarantee that every output will differ."}
                </p>
                <Word2vecSeeds />
                <p>
                  The twelve coordinates of walked from the two starts have
                  nothing in common. Across the whole table the mean gap
                  coordinate by coordinate is 0.7816 and the largest single gap
                  is 2.5336, which is larger than most of the coordinates
                  themselves. Yet the cosine between any two words comes out
                  almost the same in both, with the two runs&rsquo; lists of
                  pairwise similarities correlating at 0.9996 and differing by
                  0.0073 on average.
                </p>
                <KeepInMind>
                  {"The two runs have strongly correlated pairwise cosines but different coordinates. Shared rotations can account for some coordinate differences; the remaining geometry can differ too. Use invariant comparisons or align the spaces before drawing conclusions from coordinate changes."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. The Cost, and Where Counting Still Wins",
          content: (
            <>
              <SubSection title="20. What a fit costs, in numbers">
                <p>
                  The training cost is the number of pieces of training times the
                  number of rows each touches. Five passes of skip-gram over this
                  corpus is 19,519 pairs, each touching one word vector and six
                  rows under drawn wrong answers, so 136,633 row corrections. The
                  bag of words makes 1,311 pairs a pass, so 6,555 across five,
                  though each of those corrects every word in its window rather
                  than one.
                </p>
                <p>
                  The storage cost is two tables of one row per word, which is
                  744 numbers here, of which 372 are kept. That is the number to
                  compare against the counting table&rsquo;s 961 cells, and on
                  this corpus the saving is modest, since twelve is not much
                  smaller than thirty one. The comparison is worth making anyway,
                  because both numbers are exact and both scale in known ways, one
                  as the square of the vocabulary and the other as twelve times
                  it.
                </p>
                <NumberTable
                  headings={["what", "measured on this corpus"]}
                  rows={[
                    ["word occurrences", "1,311"],
                    ["distinct words", "31"],
                    ["training pairs, five passes of skip-gram", "19,519"],
                    ["training pairs, five passes of the bag of words", "6,555"],
                    ["rows touched per pair, drawn wrong answers", "6"],
                    ["rows touched per pair, a tree", "4.9008 on average"],
                    ["numbers kept", "372"],
                    ["numbers discarded", "372"],
                    ["cells in the counting table", "961"],
                  ]}
                />
                <KeepInMind>
                  Every one of those figures grows with the corpus except the width,
                  which is chosen before any text is read. That is what is
                  being traded, a training cost that grows with how much text
                  there is, against a description of each word whose size was
                  settled in advance.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Where counting still wins">
                <p>
                  {"Raw count rows give zero cross-list cosine by construction, while the displayed negative-sampling word2vec fits retain positive cross-list cosine. Counts therefore separate the two groups more directly under this criterion. They still require a window and weighting rule, and this comparison does not establish universal superiority over every word2vec arrangement."}
                </p>
                <p>
                  {"The count rows have disjoint support across these lists, making their cosine zero. A twelve-dimensional space can also hold vectors from two orthogonal groups. Word2vec’s nonzero cross-list score is therefore not forced simply by reducing 31 coordinates to 12. Its objective and training determine the observed geometry."}
                </p>
                <NumberTable
                  headings={["method", "same list", "across lists", "numbers per word"]}
                  rows={[
                    ["comparing rows of counts", "0.8558", "0.0000", "31"],
                    ["skip-gram, drawn wrong answers", "0.9962", "0.1696", "12"],
                    ["bag of words, drawn wrong answers", "0.9929", "0.7116", "12"],
                  ]}
                  caption="Mean cosines for the two negative-sampling fits shown, after five passes at initial learning rate 0.05. The count baseline uses the stated context and weighting choices."
                />
                <KeepInMind>
                  {"This controlled corpus is useful for inspecting pair construction, losses and updates. It is too limited to establish performance on broader language tasks. Keep those purposes separate when interpreting the comparison."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. When the Corpus Supplies Too Little Context", id: "part-7-where-word2vec-stops-being-defined",
          content: (
            <>
              <SubSection title="22. The objective is not what anyone wanted">
                <p>
                  {"The optimizer is trained on the neighbor objective. The retained vectors may later be used for another purpose, so evaluate that use directly. Training loss remains a diagnostic of the specified objective, even when it is not a complete measure of embedding quality."}
                </p>
                <Word2vecLongerTraining />
                <>
<p>
                  Measured on this corpus, they do. Going from five passes to ten to twenty, the mean cost per pair falls at every step, 2.0872 to 2.0617 to 2.0267, exactly as the fit intends. The separation of the two lists rises to 0.8404 at ten passes and then falls back to 0.7397 at twenty, and the mean cosine within a list falls from 0.9962 to 0.8510, so the verb forms are coming apart from each other while the objective keeps improving.
                </p>
                <p>
                  A reader watching only the cost curve would have concluded that twenty passes was better than ten.
                </p>
</>
                <KeepInMind>

                  Choosing how long to train, or how wide to make the vectors, or
                  what to draw negatives from, cannot be settled from inside the
                  fit. It needs a judgment made outside the method, on a task
                  someone actually cares about, and where that task does not
                  exist there is no defined notion of a better set of vectors.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Two runs are both right and not comparable">
                <p>
                  {"The objective is nonconvex, and finite stochastic training can reach different parameter settings from different starts. They need not be equally good: compare objective estimates under a shared protocol and evaluate the intended downstream behavior."}
                </p>
                <>
<p>
                  Worse for anyone hoping to compare two fits, the objective is invariant to a whole family of transformations of the answer. Rotate every vector in the kept table and every row in the discarded table by the same rotation and every dot product is unchanged, so the cost is unchanged, so the rotated answer is exactly as good.
                </p>
                <p>
                  {"A shared orthogonal rotation changes the coordinate system while preserving all input–output dot products. That makes raw coordinates basis-dependent. They can still be used by a model that shares or aligns that basis."}
                </p>
</>
                <KeepInMind>
                  {"Averaging independently fitted tables or swapping one into a downstream model is numerically defined. Without alignment, however, the operation may mix incompatible axes and damage useful relationships. Align and evaluate before combining representations."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A word seen twice">
                <p>
                  {"A word seen twice has context evidence from only those occurrences, across repeated passes. Further optimization can change its vector, but cannot supply new observed contexts. Its reliability also depends on how informative the shared surrounding patterns are, not only its count."}
                </p>
                <Word2vecRareWord />
                <p>
                  Put a made-up word into two sentences of the corpus and fit four
                  times from four starts. How alike it comes out to walked is
                  0.8790, 0.9591, 0.9448 and 0.9532, a spread of 0.0801, while the
                  same comparison for walk, which appears 42 times, spreads by
                  0.0025 across the same four starts, thirty one times narrower.
                  The three words the rare one lands nearest change from run to
                  run, naming played first once, saying twice and say once.
                </p>
                <p>

                  Nothing in the answer marks the difference. The rare word gets a
                  vector of the same twelve numbers, and a cosine against it comes
                  back to four decimal places like any other. The usual response
                  is a minimum count, which declines to answer for a rare word
                  rather than answering it better, and where the threshold goes
                  is a judgment rather than a fact. Below it a word has no
                  vector, and it is also removed from the sentences before the
                  windows are formed, so the words on either side of it become
                  neighbors.
                </p>
                <KeepInMind>
                  {"Occurrence count is one warning sign for weak evidence. Variation across seeds, context diversity and held-out behavior provide other checks. A minimum count is a preprocessing choice that trades coverage against the evidence available for each retained word."}
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Words Without Context and Comparisons Without Evidence" id="25-where-the-method-stops-being-defined">
                <p>A word with no usable context supplies no context-based training evidence. A zero vector also has no cosine direction. These failures need different explanations even if both prevent a useful neighbor list.</p>
                <DerivationTable
                  expressionHeading="Word or context evidence"
                  reasonHeading="What the training pairs can teach"
                  rows={[{"expression":"a vocabulary of one word","reason":"Repeated copies of one token can form self-context pairs, but negative sampling cannot draw a distinct alternative and a one-leaf hierarchical tree supplies no branch decisions. This implementation needs the required vocabulary and objective conditions to be checked."},{"expression":"a word that occurs once","reason":"defined, and determined mostly by where it started. Its vector accumulates the corrections of one window and nothing else, which is why a minimum count exists; the threshold is a judgment, not a fact about the data."},{"expression":"a corpus of one-word sentences","reason":"no window ever contains a neighbor, so no pair is ever formed and no correction is ever made. Every vector is exactly where it started, and nothing in the fit distinguishes that from a fit that converged."},{"expression":"a reach wider than the sentence","reason":"defined, and the same as a reach of the sentence’s length, since the window stops at the boundary. Wider reaches therefore stop changing the answer, which is not a failure but does make a swept parameter flat for a reason unrelated to the data."},{"expression":"the individual coordinates of a vector","reason":"Coordinates are defined in a chosen basis. A shared orthogonal rotation preserves training dot products; coordinate-specific interpretation requires retaining that basis."},{"expression":"comparing two runs coordinate by coordinate","reason":"A raw comparison is numerically defined but can mix unaligned axes. Align the spaces or compare invariant relationships; observed differences may include changed geometry as well as orientation."},{"expression":"the recorded cost, read as quality","reason":"Training loss measures the stated objective. Samples introduce variation, but comparisons can estimate the same expected loss under a common protocol. Lower training loss need not mean better retrieval or analogy results."},{"expression":"how long to train, decided from inside the fit","reason":"A stopping rule can use convergence diagnostics or a training budget. To choose for generalization or downstream usefulness, use suitable held-out evaluation rather than assuming every additional pass helps."},{"expression":"the width of the vectors","reason":"Width controls capacity, memory and computation. Compare candidate sizes against the intended task; additional coordinates need not always help or force independent word behavior."},{"expression":"a word absent from the corpus","reason":"there is no vector to return. The method learns one row per word it saw, so a word it did not see has no position, and the honest answer is a refusal rather than a default vector, which would be a position the corpus never implied."},{"expression":"asking which sense of a word is meant","reason":"A static row combines updates from every use of a spelling. It does not choose an occurrence-specific sense and need not settle at a geometric midpoint."}]}
                />
                <KeepInMind>
                  {"Retain the training setup with the vectors and evaluate the comparisons they will support. Account for coordinate alignment when combining runs, and use downstream evidence alongside the objective curve when choosing settings."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            trueFalse(
              "A word that occurs twice gets a trustworthy vector if the fit is given enough extra passes.",
              false,
              "Extra passes reuse the same two observed contexts; they do not supply new examples of the rare word's usage. Across the four starts, its cosine to walked ranges from 0.8790 to 0.9591. Walk, observed 42 times, has a much smaller reported spread of 0.0025. This illustrates sensitivity to initialization in this experiment. A minimum-count threshold can exclude poorly supported words, but it also removes their vocabulary entries.",
            ),
            choice(
              "The two tree fits report cosines of −0.5570 and −0.9618 across the lists where the two negative sampling fits report 0.1696 and 0.7116. What does that show?",
              [
                "The fitted geometries differ under the two objectives; these cross-list cosines alone do not establish a universal quality ranking",
                "The tree separating the lists about four times better",
                "That the tree fits had not finished converging",
                "That a cosine is not defined for vectors fitted through a tree",
              ],
              0,
              "The objectives constrain different dot products, so the cross-list cosines do not share a universal quality scale. Negative sampling does not require unrelated stored vectors to become perpendicular. We can compare whether each fit recovers the known list separation on this corpus, alongside its cost and stability across starts.",
            ),
            trueFalse(
              "On this corpus, raw count rows have a larger within-minus-across cosine gap than the skip-gram negative-sampling run at initial learning rate 0.05.",
              true,
              "The count representation has a within-minus-across cosine gap of 0.8558. The reported skip-gram run has a gap of 0.8266. By that particular measure, counting separates these deliberately constructed groups slightly more clearly. It also stores more context coordinates per word. This small comparison cannot decide which representation will work better on a large corpus or another task.",
            ),
            choice(
              "Going from five passes to ten to twenty, the mean cost per pair falls at every step. What happened to the vectors?",
              [
                "The separation rose to 0.8404 at ten passes and fell back to 0.7397 at twenty, with the within-list cosine falling from 0.9962 to 0.8510",
                "They improved at every step, as the cost did",
                "They stopped changing after ten passes",
                "They separated the lists further at twenty passes, but became harder to read",
              ],
              0,
              "The training objective scores word-context predictions, while this comparison scores the separation between two known word lists. Improving the first does not guarantee improving the second. Choose a model using a measure related to its intended use, rather than assuming that the lowest training cost must give the most useful vectors.",
            ),
            several(
              "Rotating every vector in both tables by the same rotation leaves every dot product, and so the cost, unchanged. Which of these follow?",
              [
                "The objective does not assign a unique interpretation to an individual coordinate, and independent runs need not align their coordinate axes",
                "Coordinate-wise averaging of unaligned runs has no guarantee of preserving either learned representation",
                "A cosine or a distance survives the rotation and can be read off",
                "Two runs from different starts disagree about which words are alike"
              ],
              [0, 1, 2],
              "A common orthogonal rotation preserves dot products, Euclidean distances and cosines. Individual coordinate labels are therefore not fixed by the objective. Averaging unaligned tables is a computable operation, but it need not preserve either geometry. This symmetry alone does not determine whether two independently trained runs learn similar or different within-fit relationships.",
            ),
        ],
        },
        {
          title: "Practice. Fitting the Two Lists With the Library",
          practice: [
            exercise(
              "Fit the two lists and score them with two numbers",
              [
  "Fit the supplied two-hundred-sentence verb/money corpus with width twelve, context window three, five passes, initial rate 0.05 and seed zero. Use the stated skip-gram negative-sampling configuration.",
  "Print within-group mean cosine, cross-group mean cosine and their difference, then walked/market cosine. Keep all supplied word groups and pair definitions fixed."
],
              `import random
from itertools import combinations
from statistics import mean

from oop_ml import Word2Vec

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

draw = random.Random(11)
corpus = []
for _ in range(100):
    for words in (VERBS, MONEY):
        length = draw.randint(5, 8)
        corpus.append(" ".join(draw.choice(words) for _ in range(length)))

# Fit Word2Vec with the settings in the task and keep its embeddings.

# within: the mean similarity over every pair inside VERBS and inside MONEY.
# across: the mean similarity over every pair with one word from each list.

# Print within, across and their difference to four places,
# then the similarity of walked and market.`,
              `import random
from itertools import combinations
from statistics import mean

from oop_ml import Word2Vec

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

draw = random.Random(11)
corpus = []
for _ in range(100):
    for words in (VERBS, MONEY):
        length = draw.randint(5, 8)
        corpus.append(" ".join(draw.choice(words) for _ in range(length)))

model = Word2Vec(dimension=12, window=3, epochs=5, learning_rate=0.05, random_seed=0)
vectors = model.fit(corpus).embeddings

within = mean(
    vectors.similarity(first, second)
    for group in (VERBS, MONEY)
    for first, second in combinations(group, 2)
)
across = mean(vectors.similarity(verb, money) for verb in VERBS for money in MONEY)

print(f"within a list:     {within:.4f}")
print(f"across the two:    {across:.4f}")
print(f"apart by:          {within - across:.4f}")
print(f"walked and market: {vectors.similarity('walked', 'market'):.4f}")`,
              `within a list:     0.9962
across the two:    0.1696
apart by:          0.8266
walked and market: 0.1757`,
              { hints: [
  "Use distinct within-group pairs and every cross-group pair.",
  "A large within-group similarity is informative only beside the cross-group comparison."
], check: numberCheck("By how much does the mean cosine within a list exceed the mean cosine across the two, to four places?", 0.8266, 5e-05, "The mean cosine gap is 0.8266 for this fit. It separates the two supplied groups far more clearly than the within-group mean alone would establish."), question: "Does the fitted skip-gram representation distinguish the two supplied word groups?" },
            ),
            exercise(
              "Run the published first step on the bag of words",
              [
  "Fit the supplied continuous-bag-of-words negative-sampling setup at initial rates 0.025 and 0.05, retaining width twelve, window three, five passes and seed zero.",
  "Print within/cross-group mean cosines, their difference and market’s five nearest words for each fit. This compares two finite training runs, not an inherent failure of one rate on all corpora."
],
              `import random
from itertools import combinations
from statistics import mean

from oop_ml import Word2Vec, Word2VecArchitecture

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

draw = random.Random(11)
corpus = []
for _ in range(100):
    for words in (VERBS, MONEY):
        length = draw.randint(5, 8)
        corpus.append(" ".join(draw.choice(words) for _ in range(length)))

for rate in (0.025, 0.05):
    # Fit the bag of words at this first step and keep its embeddings.

    # Compute within and across exactly as in the first problem.

    # Print the rate, within, across, their difference,
    # and the five words nearest market.
    pass`,
              `import random
from itertools import combinations
from statistics import mean

from oop_ml import Word2Vec, Word2VecArchitecture

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

draw = random.Random(11)
corpus = []
for _ in range(100):
    for words in (VERBS, MONEY):
        length = draw.randint(5, 8)
        corpus.append(" ".join(draw.choice(words) for _ in range(length)))

for rate in (0.025, 0.05):
    model = Word2Vec(
        dimension=12,
        window=3,
        architecture=Word2VecArchitecture.CONTINUOUS_BAG_OF_WORDS,
        epochs=5,
        learning_rate=rate,
        random_seed=0,
    )
    vectors = model.fit(corpus).embeddings
    within = mean(
        vectors.similarity(first, second)
        for group in (VERBS, MONEY)
        for first, second in combinations(group, 2)
    )
    across = mean(vectors.similarity(verb, money) for verb in VERBS for money in MONEY)
    nearest = " ".join(vectors.most_similar("market", 5).words)
    print(f"step {rate}: within {within:.4f}  across {across:.4f}  apart by {within - across:.4f}")
    print(f"  nearest market: {nearest}")`,
              `step 0.025: within 0.9907  across 0.9873  apart by 0.0034
  nearest market: trade stock cash bond stays
step 0.05: within 0.9929  across 0.7116  apart by 0.2813
  nearest market: cash trade bond fund bank`,
              { hints: [
  "Keep the objective and corpus fixed when changing initial rate.",
  "Read the cross-group similarity as well as the attractive-looking nearest-word list."
], check: numberCheck("With initial learning rate 0.025, how much does the within-list mean cosine exceed the across-list mean cosine, to four decimal places?", 0.0034, 5e-05, "The gap is only 0.0034 at the smaller rate after this fixed training budget. Nearly equal within/cross similarity reveals that the two groups remain poorly distinguished."), question: "Can a low learning rate leave two groups nearly indistinguishable after the fixed budget?" },
            ),
            exercise(
              "Count how long the tree’s paths are",
              [
  "Build the supplied Huffman tree from the corpus’s word-occurrence counts.",
  "Print the largest and smallest word counts. Then print the average number of branch decisions per word occurrence and the number of vocabulary words at each depth. For the average, weight each path by how often its word appears; for the depth counts, count each vocabulary word once."
],
              `import random
from collections import Counter

from oop_ml import HuffmanTree

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

draw = random.Random(11)
corpus = []
for _ in range(100):
    for words in (VERBS, MONEY):
        length = draw.randint(5, 8)
        corpus.append(" ".join(draw.choice(words) for _ in range(length)))

occurrences = Counter(" ".join(corpus).split())
words = sorted(occurrences)
counts = [occurrences[word] for word in words]
print(f"commonest {max(counts)}, rarest {min(counts)}")

# Build the tree from the counts.

# Print its average path per occurrence to four places.

# Count how many words sit at each depth and print one line per depth.`,
              `import random
from collections import Counter

from oop_ml import HuffmanTree

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

draw = random.Random(11)
corpus = []
for _ in range(100):
    for words in (VERBS, MONEY):
        length = draw.randint(5, 8)
        corpus.append(" ".join(draw.choice(words) for _ in range(length)))

occurrences = Counter(" ".join(corpus).split())
words = sorted(occurrences)
counts = [occurrences[word] for word in words]
print(f"commonest {max(counts)}, rarest {min(counts)}")

tree = HuffmanTree.from_counts(counts)
print(f"average path: {tree.expected_depth(counts):.4f}")

depths = Counter(tree.code_of(position).depth for position in range(tree.n_words))
for depth in sorted(depths):
    print(f"depth {depth}: {depths[depth]} words")`,
              `commonest 73, rarest 17
average path: 4.9008
depth 4: 4 words
depth 5: 21 words
depth 6: 6 words`,
              { hints: [
  "A common word contributes its path length once per occurrence to the weighted average.",
  "Use each word’s code length for its depth, then group distinct words by that length."
], check: numberCheck("How many of the 31 words sit five branch points down?", 21, 0, "Twenty-one vocabulary words have depth five. Those are distinct word counts by depth; the average path instead weights each word by its corpus occurrence count."), question: "How many branch decisions does this Huffman tree require per word occurrence?" },
            ),
          ],
        },
      ]}
    />
  );
}
