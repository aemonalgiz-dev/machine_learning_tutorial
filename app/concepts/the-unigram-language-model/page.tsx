import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
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
import { AgainstMerging } from "@/components/widgets/AgainstMerging";
import { EstimationRounds } from "@/components/widgets/EstimationRounds";
import { PieceLosses } from "@/components/widgets/PieceLosses";
import { SentencePair } from "@/components/widgets/SentencePair";
import { ShrinkingTrace } from "@/components/widgets/ShrinkingTrace";
import { SpellingLadder } from "@/components/widgets/SpellingLadder";
import { UnigramPlayground } from "@/components/widgets/UnigramPlayground";
import { WordLattice } from "@/components/widgets/WordLattice";

export const metadata: Metadata = {
  title: "The Unigram Language Model · Perceptron Lab",
  description:
    "A unigram tokenizer assigns probabilities to candidate pieces and compares complete segmentations. Vocabulary selection balances the available pieces against how well their combinations describe the observed text.",
};

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function UnigramLanguageModelPage() {
  return (
    <ConceptPage
      lessonId="the-unigram-language-model"
      intuition={lessonIntuitions["the-unigram-language-model"]}
      technicalStart="Part 3. Finding the Likeliest Cut"
      openingTitle="Keep the Pieces Whose Removal Would Hurt Most"
      playgroundTitle="Which complete segmentation has the higher probability?"
      playgroundIntro="Compare alternative segmentations of the same word. Distinguish the best segmentation's probability from the total over all possible segmentations."
      title="The Unigram Language Model"
      tagline={"A unigram tokenizer assigns probabilities to candidate pieces and compares complete segmentations. Vocabulary selection balances the available pieces against how well their combinations describe the observed text."}
      prerequisites={
        <>
          Two things from earlier in this section. Something has already decided
          where the words are, so everything below takes a text cut on its
          spaces and asks what the pieces <em>inside</em> a word should be. And
          you will get more from this page having read the one on byte pair
          encoding, since the contrast between growing a vocabulary and
          shrinking one runs through all of it. What is new here is a
          probability. Every piece carries one, spellings are multiplied out and
          added up, and the arithmetic is done in logarithms so that products of
          many small numbers stay readable.
        </>
      }

      playground={<UnigramPlayground />}
      sections={[
        {
          title: "Part 1. What Merging Leaves Undecided",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The corpus, the sentence, and what is being chosen">
                <>
<p>
                  Merging commits to one sequence of joins. Here we want to compare alternative ways of representing the same word, with a score attached to each complete segmentation. That requires a probability for each available piece.
                </p>
                <p>
                  We use two familiar corpora: eighteen report-related sentences, and the four-word low, lower, newest and widest example from the earlier merging lesson. The small case lets us follow the scoring decisions before comparing the larger vocabulary.
                </p>
                <p>
                  Neither corpus contains the sentence below. The large corpus has 72 distinct words across 133 occurrences. This implementation also distinguishes a character inside a word from its marked word-final form, giving it 51 initial symbols. Keep that convention in view when comparing its symbol count with an ordinary alphabet count.
                </p>
</>
                <Equation>{SENTENCE}</Equation>
                <p>
                  Both approaches choose an inventory of pieces, but its starting symbols still determine what can be covered. In this representation, symbols include the relevant boundary forms as well as visible letters. The large corpus initially has 648 pieces and the sentence 45; the stated starting table needs 52 rows including the stand-in. Once coverage is defined, the remaining choices concern which additional pieces improve the objective.
                </p>
                <KeepInMind>
                  {"Training-corpus measurements show what the vocabulary fits; held-out examples show how it represents other text. Keep those two uses separate. A tokenizer can compress its own corpus well while offering poor pieces for a new word."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A piece is in the vocabulary because of the moment it was added">
                <p>
                  The BPE trainer starts from small symbols and repeatedly commits to a selected adjacent merge. Later rounds count pairs in the representation produced by earlier choices; this trainer does not return to reconsider a merge. The unigram approach will instead keep several candidate pieces available while estimating their usefulness, which creates a different way to compare alternative segmentations.
                </p>
                <p>
                  {"After ten BPE merges on the four-word corpus, lower remains lo, w, e and marked r. Its two occurrences contribute eight pieces. A whole lower entry would shorten those occurrences, but the earlier merge choices have already spent the fixed budget elsewhere. That is a limitation of this greedy training procedure."}
                </p>
                <p>
                  {"Ordinary deterministic BPE returns one segmentation from its ranked merges. It does not attach a probability distribution to alternative segmentations. We can still compare token counts or add a separate scoring model; the unigram approach builds probability-based comparison into the tokenizer itself."}
                </p>
                <KeepInMind>
                  {"A merge list specifies how to encode, while a piece-probability table lets us score multiple complete encodings. Those are different kinds of information. The probability score is not the same as the number of pieces, which we can count for either tokenizer."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Running the procedure the other way round">
                <p>
                  The unigram approach begins with a large candidate vocabulary and assigns probabilities to its pieces. We then estimate how much worse the corpus would be represented if particular pieces were removed. Pruning the least useful candidates gradually reduces the vocabulary. A piece&apos;s value is reconsidered alongside the alternatives still available, rather than fixed by an earlier merge decision.
                </p>
                <p>
                  That is a statement about the whole vocabulary rather than
                  about one greedy join, and it is only possible because there
                  is now a number to compare. The number is the corpus&rsquo;s
                  likelihood under the model, which is what the next two parts
                  build.
                </p>
                <KeepInMind>
                  {"The procedures use different construction criteria and produce different entries on this corpus. At 100 rows, the shrinking method uses all 48 learned entries for complete corpus words; BPE uses eight of its 48 that way. Equal size does not imply equal structure."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. What a Probability on a Piece Buys",
          content: (
            <>
              <SubSection title="4. Every piece gets a number, and the numbers add to one">
                <p>
                  {"Start with candidate pieces and give each a positive probability. In this teaching implementation, substring frequencies initialize those probabilities. A separate frequency-times-length ranking selects candidates when the seed budget is limited. The normalized table supplies the model used in the next calculations."}
                </p>
                <p>
                  On the four words that gives 49 candidates, since those four
                  words have 49 distinct substrings between them once the
                  end-of-word mark is counted as part of the letter it rides on.
                  The commonest is e, which occurs 17 times and gets probability
                  0.068. The pieces es, est with its mark, s, st with its mark
                  and t with its mark all occur 9 times and all get 0.036.
                </p>
                <WorkedExample title="Counting a candidate on the four words">
                  <>
                    <p>
                      The marked ending occurs in newest six times and widest three
                      times. This initialization ranks candidates by their frequency
                      multiplied by their symbol length.
                    </p>
                    <Equation>{"candidate count = 6 + 3 = 9\ncoverage score = 9 × 3 = 27"}</Equation>
                    <p>
                      Keeping every single symbol ensures that the vocabulary can still
                      spell the training corpus, regardless of each symbol’s score.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  {"The eighteen sentences supply 866 candidates before pruning, compared with a final request of 137 entries. A large seed leaves alternatives available for the probability model to compare. Its memory and fitting cost still matter."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. A word has many spellings, and each of them has a probability">
                <p>
                  Now the consequence that makes this a different method rather
                  than a different heuristic. If a word is pieces drawn one
                  after another from that table, and the draws do not depend on
                  each other, then the probability of a particular spelling is
                  the product of its pieces&rsquo; probabilities. Every way of
                  cutting the word into pieces the table holds is a spelling, so
                  a word does not have a cut; it has a whole set of them, each
                  with a number.
                </p>
                <Equation>{"P(spelling)  =  p(piece 1) × p(piece 2) × … × p(piece k)"}</Equation>
                <p>
                  Products of many numbers below one fall very fast, so
                  everything from here on is done in logarithms, where the
                  product becomes a sum and the numbers stay comparable. A log
                  probability is always at most zero, and less negative means
                  more likely.
                </p>
                <Equation>{"log P(spelling)  =  log p(piece 1) + log p(piece 2) + … + log p(piece k)"}</Equation>
                <KeepInMind>
                  Fewer pieces is not automatically more probable. A spelling in
                  two rare pieces can score below a spelling in three common
                  ones, and section 24 shows a measured case where exactly that
                  happens.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Twenty-eight spellings of one word">
                <p>
                  Take lowest, which the four words never contain, and ask the
                  starting table for every spelling of it. There are 28. The
                  likeliest is lo followed by west with the mark, which takes
                  46.81% of everything the model gives that word. Next come low
                  with est, and lowe with st, at 20.06% each, and those two are
                  tied exactly rather than nearly, because the frequencies
                  behind them happen to multiply to the same number.
                </p>
                <SpellingLadder />
                <p>
                  {"The BPE segmentation of lowest is fourth in this unigram model’s list, with a conditional share of 3.10%. Three alternatives receive higher scores under this table. That ranking evaluates BPE’s returned pieces using a different model; it does not prove a BPE scoring error."}
                </p>
                <p>
                  {"For lower, the initial unigram table gives the whole-word segmentation a conditional share of 92.90%; BPE’s four-piece split ranks twelfth of sixteen. For newest, both choose the whole word, whose share is 85.45%. The comparison shows agreement as well as disagreement between the two procedures."}
                </p>
                <KeepInMind>
                  {"Adding a probability table lets us rank alternative segmentations. Under this table, BPE’s lowest segmentation ranks fourth of 28. BPE itself did not claim to maximize that probability."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The probability of the word itself">
                <p>
                  {"The best segmentation is the path with the largest product of piece probabilities. To account for all valid segmentations of a fixed word, add those products. This marginal quantity includes every path that spells that word, rather than selecting just one."}
                </p>
                <Equation>{"P(word)  =  Σ over spellings s of the word   P(s)"}</Equation>
                <p>
                  {"The path sum is at least as large as its largest term. With positive path probabilities, equality holds only when one path is available. Divide a path’s value by the sum to obtain its conditional probability given this word. Those conditional probabilities support sampling several segmentations of the same input."}
                </p>
                <WhyThisWorks title="Why the total is the more natural quantity, and the maximum is what gets used">
                  <>
<p>
                  {"Fitting uses the total over segmentations, while ordinary encoding returns a highest-scoring path. The SDK also supports sampling a path. For pruning, this teaching implementation measures the change in the best path at fixed surviving scores, which is a cheaper proxy than recomputing and refitting the full marginal model."}
                </p>
                  <p>
                  {"Keep that proxy separate from the exact marginal objective and from production implementations. It makes the smaller teaching model inspectable, but does not provide the exact cost of removing and re-estimating a candidate."}
                </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"The maximum and the sum use the same piece lattice. Each can be computed without listing every complete path. They require their own calculations, so sharing the graph does not make the second result computationally free."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Finding the Likeliest Cut",
          content: (
            <>
              <SubSection title="8. Positions rather than letters">
                <p>
                  {"A six-symbol word has seven boundary positions, numbered zero through six. A candidate piece connects its starting position to its ending position. There can be exponentially many complete segmentations, but many share the same prefix or suffix calculation. That makes a table over positions useful."}
                </p>
                <WordLattice />
                <p>
                  {"For lowest, seventeen available piece spans form 28 complete paths through the positions. Each path spells the same word. We can reuse the best score or total at an intermediate position instead of recomputing it for every path."}
                </p>
                <KeepInMind>
                  {"The lattice stores available spans rather than an explicit list of segmentations. A best-path calculation can then reconstruct its chosen path from saved decisions. It avoids enumerating every path, rather than never constructing one at all."}
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The recurrence, read backwards">
                <p>
                  Here is the observation the whole search rests on. Suppose we
                  already know, for every position, the best score achievable
                  over the rest of the word from that position onward. Then the
                  best score from a position is found by trying each piece that
                  starts there, adding its log probability to the already-known
                  best score of wherever that piece ends, and taking the largest.
                  The best score for the whole word is the answer at position 0.
                </p>
                <Equation>{"best(i)  =  max over pieces p starting at i   [ log P(p) + best(end of p) ]"}</Equation>
                <p>
                  The score at the last position is zero, since spelling nothing
                  costs nothing, so the table is filled from the end of the word
                  backwards and each entry only ever reads entries to its right.
                  Recording, alongside each best score, how long the winning
                  first piece was is enough to read the spelling itself back off
                  the table afterwards, walking forward from position 0.
                </p>
                <WorkedExample title="The last three positions of lowest">
                  <p>
                    Position 6 is the end and scores 0. Position 5 has one piece
                    available, t with its mark, so it scores that
                    piece&rsquo;s log probability and nothing else. Position 4
                    has two, s alone leading to position 5, and st with the mark
                    leading straight to the end; the second is the more probable
                    of the two here, so position 4 records it. Continue leftward
                    and position 0 comes out at lo followed by west with the
                    mark, which is the walk drawn in indigo above.
                  </p>
                </WorkedExample>
                <p>
                  {"For the marginal total, sum the contributions entering each position instead of retaining only the best. Initialize position zero with total one, then process positions forward. This has similar span-processing complexity to the best-path pass, while using log-sum-exp in the actual implementation for numerical stability."}
                </p>
                <Equation>{"total(j)  =  Σ over pieces p ending at j   total(start of p) × P(p)"}</Equation>
                <KeepInMind>
                  {"Maximizing selects one path; summing retains the contribution of every path. The graph and reusable position states are shared, but the arithmetic and numerical treatment differ."}
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Two rules settle every tie">
                <p>
                  {"Equal path scores need a reproducible choice. This decoder first prefers fewer pieces, then the longer piece at the earliest differing position. Those preferences resolve ties in this scoring objective; they do not establish which segmentation will help every downstream task most."}
                </p>
                <p>
                  A third rule sounds necessary and is not, and the argument is
                  short enough to give. If two spellings agree up to some
                  position and their pieces starting at that position have the
                  same length, then those pieces span the same symbols, so they
                  are the same piece, so the spellings have not yet differed
                  after all. Two rules therefore settle every case, and the
                  reason the recurrence runs from the end of the word rather than
                  the start is that this reading falls directly out of it.
                </p>
                <KeepInMind>
                  {"A tie gives equal probability scores to the candidate paths. The tie rule makes their selection reproducible. A downstream model or another evaluation criterion can still prefer one of them."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. What one word costs to spell">
                <p>
                  The work is worth stating plainly, since it is charged once per
                  word every time anything is encoded. For a word of n symbols
                  there are about n squared over two spans to consider, and
                  looking each one up means joining the symbols it covers, which
                  is itself work proportional to its length. Done in the most
                  direct way, that is proportional to n cubed for one word.
                </p>
                <p>
                  {"A trie can enumerate vocabulary matches from each position without repeatedly constructing every possible substring. With maximum piece length L, that gives a bound proportional to n times L for a word of length n. The best-path recurrence remains the same."}
                </p>
                <InAModel>
                  <p>
                  {"At high text volumes, repeated substring work can become significant even if individual words are short. Measure the implementation on its intended input lengths and throughput requirements before deciding which optimization is needed."}
                </p>
                </InAModel>
                <KeepInMind>
                  The search is one pass over the arcs of one word, whichever
                  question is being asked, and it never enumerates a spelling.
                  What it costs is decided by how quickly the arcs leaving a
                  position can be found.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "Merged to 22 rows, the four words spell lower in four pieces although the corpus plainly contains it. What does a merge list lack that would let it notice?",
              [
                "A number attached to a cut, so one cut of a word can be compared with another",
                "A count of how often lower occurs in the corpus",
                "A row for every symbol the corpus uses",
                "A way to replay its merges on a word",
              ],
              0,
              "The merge list specifies which joins to replay. It does not assign probabilities to alternative complete segmentations, so it cannot compare them by likelihood. A unigram model supplies a probability for each piece and uses those probabilities to score complete paths. This adds a comparison criterion; it does not guarantee that the best-scoring path is the shortest.",
            ),
            trueFalse(
              "A spelling in fewer pieces is always the more probable one.",
              false,
              "A spelling in two rare pieces can score below a spelling in three common ones, since what is compared is a product of the pieces’ own probabilities rather than a count of them. Fewer pieces is the tie-break rule when two spellings reach exactly the same score, which is a different thing from a guarantee.",
            ),
            choice(
              "Which spelling of lowest receives the greatest probability under this illustrative unigram table?",
              [
                "lo | west",
                "low | est",
                "l | ow | est",
                "All three have the same probability because they spell the same word",
              ],
              0,
              "The product for lo followed by west is greatest. Two spellings of the same word can have different probabilities because they use different pieces. A merge procedure's chosen spelling does not by itself tell us which product is greatest.",
              { description: "Multiply the probabilities of the pieces in each candidate. These invented probabilities refer to one fixed vocabulary; its other entries carry the remaining probability.", data: "lo: 0.20    west: 0.10\nlow: 0.05   est: 0.30\nl: 0.10     ow: 0.05\nCandidates: lo | west; low | est; l | ow | est" },
            ),
            several(
              "What does putting a probability on every piece buy?",
              [
                "A word has a whole set of spellings, each with a number, rather than one cut",
                "A total over those spellings, which is what the model says about the word at all",
                "A share per spelling, so a model can be shown several cuts of one word drawn in proportion",
                "A guarantee that the likeliest spelling is also the shortest",
              ],
              [0, 1, 2],
              "Piece probabilities let us score alternative segmentations. Summing their probabilities gives the word's probability under this model; taking the maximum identifies its most probable segmentation. The sum is at least as large as the maximum. Dividing a path's probability by the sum gives that path's share, which the expectation step uses when estimating piece counts.",
            ),
            trueFalse(
              "Finding the likeliest spelling of a word and finding the probability of the word are the same pass over the same arcs, with a maximum in one where the other has a sum.",
              true,
              "One recurrence keeps the highest-scoring route into each position. The other sums the probabilities of all routes into it. Neither needs to enumerate every full spelling: the six-symbol example uses seventeen arcs to represent 28 paths. The sum is at least the maximum and exceeds it when another path has positive probability.",
            ),
        ],
        },
        {
          title: "Part 4. Estimating the Numbers, and Pricing a Piece",
          content: (
            <>
              <SubSection title="12. The probabilities are not known">
                <p>
                  {"Substring counts include overlapping possibilities, whereas a complete segmentation chooses a compatible set of pieces. The observed word does not tell us which segmentation to treat as its hidden explanation. Fitting estimates piece probabilities while accounting for those alternative paths; it need not claim that an actual author generated the word by drawing these pieces."}
                </p>
                <p>
                  {"Expectation-maximization alternates two calculations. First estimate each piece’s expected use under the current conditional path probabilities. Then update the piece probabilities from those counts. Exact EM does not reduce its marginal objective, but convergence need not find a global optimum. Finite iterations and numerical safeguards require their own checks."}
                </p>
                <KeepInMind>
                  {"The unobserved quantity in this model is the segmentation. Forward and backward path totals let us compute its expected piece counts without committing to one guessed path."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Expectation, then maximization" id="13-expectation-then-maximisation">
                <>
<p>
                  The first step asks how often each piece was probably used. For a piece spanning two positions of a word, the chance that the word&rsquo;s spelling went through that arc is the total over routes reaching its start, times the piece&rsquo;s own probability, times the total over routes finishing from its end, divided by the total over all routes through the word.
                </p>
                <p>
                  The second recurrence of section 9 supplies the first of those and its mirror running the other way supplies the third. Multiply by how often the word occurs, add up over the corpus, and every piece has an expected count.
                </p>
</>
                <Equation>{"expected count of p  =  Σ over words w   count(w) × P(the spelling of w goes through p)"}</Equation>
                <p>
                  The second step is a division. Give each piece its share of the
                  expected counts, which are no longer whole numbers but are
                  otherwise exactly what counting would have produced had the
                  spellings been visible.
                </p>
                <EstimationRounds />
                <>
<p>
                  {"The smallest example has one observed word, ab, and candidate pieces a, b and ab initialized equally. There are two complete paths: the whole-word entry or the two single characters. The display gives the whole-word path a conditional share of three quarters."}
                </p>
                <p>
                  {"The expected counts are 0.75 for ab and 0.25 each for a and b. Normalizing them gives new piece probabilities 0.6, 0.2 and 0.2. After the next round, the probability assigned to the whole-word piece is about 0.882. Piece probability and conditional path share are different quantities here."}
                </p>
</>
                <>
<p>
                  The second panel shows a more concentrated fit on the four repeated words. The probability of the whole-word piece low rises from 0.020 to 0.265 to 0.312, approaching its corpus share of five sixteenths. We need to distinguish that piece probability from the probability of a particular segmentation conditioned on the word.
                </p>
                <p>
                  The piece lo loses probability through the displayed iterations, from 0.028 to 0.011 to 0.000134. The preferred segmentation of lowest stays the same while its log score falls from minus 7.30 through minus 9.45, minus 18.39 and minus 36.75 to minus 73.50. A fixed best path does not imply a fixed probability: the probabilities assigned to its pieces can keep changing as the corpus fit shifts mass elsewhere.
                </p>
</>
                <KeepInMind>

                  This small corpus rewards whole-word entries very strongly. Alternative spellings can become extremely unlikely even while remaining representable. A new word assembled from those low-probability pieces may therefore receive a tiny score. The behavior follows the training objective on these repeated forms; it is a reason to test held-out words too.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What a piece is worth">
                <p>
                  Now the question the whole method turns on. Take one piece out
                  of the table and ask how much worse the corpus gets. For every
                  word whose likeliest spelling uses that piece, spell it again
                  with the piece gone, and add up the fall in score, weighted by
                  how often the word occurs. A word whose likeliest spelling did
                  not use the piece contributes nothing at all, because its best
                  route is untouched.
                </p>
                <Equation>{"loss(p)  =  Σ over words w whose best spelling uses p   count(w) × [ best score with p  −  best score without p ]"}</Equation>
                <p>
                  That last observation is what makes the step affordable. There
                  is no need to re-spell the whole corpus once per candidate
                  piece, only the words that were actually using it, and on any
                  real corpus most pieces sit in the likeliest spelling of very
                  few words.
                </p>
                <PieceLosses />
                <p>
                  {"With the fitted four-word table, the best-path removal proxy gives newest a loss of 91.26 nats, low 85.04, widest 45.63 and lower 34.02. These are the four complete corpus words. The larger corpus’s leading entries also include common words such as the and The. The numbers describe the fixed-table proxy, not an exactly refitted marginal likelihood loss."}
                </p>
                <KeepInMind>
                  {"The removal score compares best-path log scores before and after deleting a piece while retaining the other scores. It is a useful approximation for ranking candidates. Its numerical value is not generally equal to, or a bound on, the full marginal loss after removal and re-estimation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Most pieces are worth nothing at all">
                <p>
                  {"The best-path removal proxy is zero for 34 of the 38 removable candidates in the four-word example and 745 of 815 in the sentence corpus. Removing those entries leaves the chosen best-path scores unchanged at this step. Their other paths may still contribute to the full marginal likelihood."}
                </p>
                <p>
                  {"An entry can have zero best-path loss because no selected path uses it, or because an equally scored alternative remains after removal. That says the proxy is indifferent. It does not say that all path probabilities or later pruning rounds are unchanged."}
                </p>
                <p>
                  {"The SDK breaks equal removal losses lexically. With 22 tokens requested on the four-word corpus, the extra retained pieces include de, des, dest, er, es and est. Those choices reflect ties in the current proxy, not evidence that these fragments are the most useful linguistic units."}
                </p>
                <KeepInMind>
                  {"Some retained entries are selected among tied removal costs. Read those entries as consequences of the tie rule and current vocabulary, rather than attaching meaning to the exact list without additional evidence."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Shrinking, and Where It Stops",
          content: (
            <>
              <SubSection title="16. The seed, and how large it is">
                <p>
                  The starting vocabulary is every substring the corpus contains,
                  up to a length bound, and on these two corpora the bound never
                  bites, so the number is a fact about the corpus. The four words
                  supply 49 candidates. The eighteen sentences supply 866, which
                  is worth pausing on, since the vocabulary they end at is 137
                  and the alphabet alone is 51.
                </p>
                <p>
                  {"The seed limits what can survive later pruning. Too small a seed can exclude useful candidates, while a large one increases storage and fitting work. This implementation protects the alphabet and ranks the remaining substrings using frequency and length before applying the seed cap."}
                </p>
                <KeepInMind>
                  Of the 866 candidates the eighteen sentences supply, 729 are
                  thrown away before the fit is finished. Which 729 is the
                  question the corpus is being asked, so a seed small enough to
                  be tidy would be answering part of that question by leaving
                  candidates out.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Three quarters at a time">
                <p>
                  {"This implementation removes a group of candidates in each pruning round. Their losses were measured with the other candidates still present, so simultaneous removals can interact. Recomputing after each removal would account for those interactions more often, at a higher cost, but would still be a greedy procedure."}
                </p>
                <ShrinkingTrace />
                <p>
                  Each round keeps three quarters of what is there, or the size
                  asked for if that is larger, so the fall is geometric until the
                  last round lands on the target exactly. The four words go 49,
                  36, 27, 20, 15 in four rounds. The eighteen sentences go 866,
                  649, 486, 364, 273, 204, 153, 136 in seven. Two rounds of
                  re-estimation run before every size check, so the probabilities
                  reported at the end were estimated on the pieces reported at
                  the end.
                </p>
                <p>
                  {"Single-symbol entries are protected so the training corpus remains spellable. The tokenizer rejects a requested size below its required alphabet and unknown entry. Removing needed symbol coverage would require a different fallback policy or yield unusable scores for some training words."}
                </p>
                <KeepInMind>
                  The share dropped per round is a trade between how often the
                  losses are refreshed and how long the fit takes. Dropping
                  everything in one round would use figures measured on a table
                  that no longer exists.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What the vocabulary turned out to be made of">
                <>
<p>
                  {"At a requested size of 100 on the sentence corpus, all 48 entries above the required symbols are complete corpus words with end markers. This small fit uses its budget very differently from BPE, rather than necessarily discovering stems or suffixes."}
                </p>
                <p>
                  At 80 the same thing holds for all 28, and only at 137, once the corpus has run short of words to buy, do 15 pieces appear that are something else, among them Augus and the apostrophe followed by t.
                </p>
</>
                <NumberTable
                  headings={[
                    "vocabulary",
                    "pieces above the alphabet",
                    "of those, whole corpus words",
                    "by merging",
                  ]}
                  rows={[
                    ["80", "28", "28", "6 of 28"],
                    ["100", "48", "48", "8 of 48"],
                    ["137", "85", "70", "18 of 85"],
                  ]}
                  caption="Both methods fitted to the same eighteen sentences at each size. The last column is what a merge-grown vocabulary of that size holds."
                />
                <p>
                  A merge-grown vocabulary of the same size is nothing like it.
                  At 100 tokens it holds 8 whole words among its 48 learned
                  pieces and the rest are fragments, and at 137 it holds 18 of
                  85. Given the same corpus and the same budget, one method
                  spends 48 rows of 48 on words and the other spends 8.
                </p>
                <WhyThisWorks title="Why likelihood buys whole words first">
                  <p>
                  {"A complete entry for a frequent word can contribute strongly to this model’s training likelihood, especially when the vocabulary budget can hold much of a tiny corpus. Fragments can contribute through shared use across words. Which candidates rank highest depends on their probabilities, the alternatives and the corpus; complete words are not guaranteed to win on every dataset."}
                </p>
                </WhyThisWorks>
                <InAModel>
                  <p>
                  {"The corpus has only 72 distinct words, so a 100-row vocabulary can devote much of its learned budget to whole forms. On larger and more varied text, recurring subword units can become useful alternatives. Results about alignment with morphological boundaries require their own empirical comparison; they do not follow merely from increasing corpus size."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"The training criterion affects which entries fit into a fixed budget. On these same inputs at 100 rows, the methods select 48 whole-word entries and eight respectively. Vocabulary size also matters, as the other rows show."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Against a vocabulary of the same size grown by merging">
                <p>Compare the two methods at matched vocabulary sizes. We fit both to the eighteen sentences at fourteen sizes and measure the number of pieces used for the training corpus and the held-out sentence. Their vocabulary-construction procedures can reach different final sizes from the same requested budget, so matching the actual sizes matters.</p>
                <AgainstMerging />
                <p>
                  {"On training text, the shrinking method is shorter at the nontrivial listed budgets. At 80 entries it uses 324 pieces versus 414; at 137 it reaches one piece per word occurrence, or 133 versus 263. That is the minimum under this within-word representation, which does not permit one piece to cover several words."}
                </p>
                <>
<p>
                  {"On the held-out sentence, the methods tie at the alphabet-only setting, then the shrinking method uses more pieces at every larger listed size. The gap is 40 versus 28 pieces at 80 entries and 28 versus 25 at 137. These are tokenizer-length results for this probe."}
                </p>
                <p>
                  The same property is behind both columns. A vocabulary of whole words is unbeatable on the words it holds and has almost nothing to offer a word it does not, so the sentence&rsquo;s expect, which the corpus never wrote without its ending, comes back at 137 as six single letters.
                </p>
</>
                <NumberTable
                  headings={[
                    "vocabulary",
                    "corpus, by probability",
                    "corpus, by merging",
                    "sentence, by probability",
                    "sentence, by merging",
                  ]}
                  rows={[
                    ["52", "648", "648", "45", "45"],
                    ["80", "324", "414", "40", "28"],
                    ["100", "229", "344", "32", "27"],
                    ["120", "146", "297", "30", "25"],
                    ["137", "133", "263", "28", "25"],
                    ["200", "133", "263", "29", "25"],
                  ]}
                  caption="At 52 both vocabularies are the alphabet and agree exactly. Merging runs out of pairs worth joining at 137 and answers 137 above it; the shrinking has candidates to spare and keeps going."
                />
                <KeepInMind>
                  {"The corpus-length result and held-out length result favor different methods after the shared starting point. Neither column alone measures every aspect of tokenizer quality, especially because the probe also contains an unavailable symbol."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The sentence at three sizes">
                <p>
                  Let&apos;s inspect the actual pieces in both cases. Their counts alone do not show whether a spelling failed because a useful piece was absent or because the scoring chose another path.
                </p>
                <SentencePair />
                <p>
                  At the smallest vocabulary neither method has learned anything
                  and both hand back 45 single symbols. At 80 the shrunk
                  vocabulary has picked up the and cost, which are corpus words
                  that happen to appear in the sentence, and everything else is
                  still letters. Merging at the same size has exp, ec, lo, re and
                  analysi, none of which is a word, and reads the sentence in 28.
                </p>
                <p>
                  At 137 the shrunk vocabulary manages Dr. and the and analysis
                  with its full stop, three whole words of the corpus, and the
                  hyphenated -cost, which is the tail of high-cost. It still
                  spells expect letter by letter, because the corpus only ever
                  wrote expected. That is what a vocabulary made of whole words
                  does when it meets a word it has not got, and it is why the
                  three-piece gap in the counts above sits where it does.
                </p>
                <KeepInMind>
                  Both vocabularies are a summary of one corpus, and what they
                  differ in is what the summary is made of. A word the summary
                  holds costs one piece either way; expect, which neither holds,
                  costs six under the vocabulary of words and three under the
                  vocabulary of fragments, and that is most of the
                  sentence&rsquo;s three-piece gap at 137.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The round trip">
                <p>
                  Decoding concatenates the pieces and interprets their end-of-word marks using this scheme&apos;s spacing rule. The control sentence has the required symbols, uses 9 pieces with the 137-entry vocabulary, and reconstructs exactly in this test. That result establishes the round trip for the retained representation; arbitrary spacing changes or unavailable boundary symbols need their own coverage checks.
                </p>
                <p>
                  The sentence about Dr. Alvarez does not come back, at any size, and the
                  reason is precise. The corpus contains the letter z, in the
                  word size, but no word in it ends in z, and a word-final letter
                  is a different symbol from the same letter inside a word.
                  Alvarez ends in the symbol the corpus never wrote. The encoder
                  hands back its stand-in row, the stand-in carries no
                  end-of-word mark, and gluing the pieces therefore loses the
                  space that was attached to it.
                </p>
                <Equation>{"Alvarez didn't   →   Alvare[UNK]didn't"}</Equation>
                <KeepInMind>
                  {"This failure follows from the corpus-derived final-symbol alphabet and the SDK’s unknown-token policy. An augmented alphabet or byte fallback could change coverage. Probabilistic segmentation alone does not supply those missing entries."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "One word ab, seen once, with the pieces a, b and ab each at a third. After one round of expectation and re-estimation, what probability does ab hold?",
              [
                "0.6, since the expected counts are 0.75 for ab and 0.25 each for a and b, and 0.75 is divided by their total of 1.25",
                "0.75, since the one-piece spelling holds three quarters of the word",
                "A third, since one round cannot move a table that started even",
                "0.882, since the two-piece spelling is dropped at once",
              ],
              0,
              "The whole-word path receives 75 percent of the posterior segmentation probability. That contributes an expected count of 0.75 for ab. The separate path also contributes expected counts for a and b, so the re-estimation step must normalize all expected counts together. The updated probabilities are 0.6 for ab and 0.2 for each single character. A second round raises ab to about 0.882. A posterior path share and a re-estimated piece probability are different quantities.",
            ),
            trueFalse(
              "On the eighteen sentences, 745 of the 815 pieces the pruning may touch price at exactly zero.",
              true,
              "The pruning score measures the drop in a training word's best segmentation score when a piece is removed. A piece absent from every best path therefore has zero score under this criterion. A replacement path with exactly the same score also gives zero loss. Here 745 of 815 removable pieces have exactly zero loss, rather than small values rounded away. Alphabetical ordering resolves those ties. In the four-word case, only the whole-word pieces have positive removal costs, including 91.26 nats for newest and 85.04 for low.",
            ),
            choice(
              "Why is a fixed share of the table dropped each round rather than one piece at a time?",
              [
                "Every loss was measured against the same table, and recomputing after each removal would be correct and would cost a full pass per piece",
                "Removing one at a time risks dropping a single symbol",
                "The losses are tied, so no single piece can be chosen at all",
                "It is the only way to land on the target size exactly",
              ],
              0,
              "Remove one piece and every other piece’s loss is in principle different, since a word leaning on the removed piece now leans somewhere else. Each round keeps three quarters of what is there, or the size asked for if that is larger, so the eighteen sentences go 866, 649, 486, 364, 273, 204, 153, 136 in seven rounds with re-estimation between them.",
            ),
            choice(
              "At 100 tokens on the eighteen sentences, what are the 48 pieces above the alphabet?",
              [
                "Every one of them is a whole word of the corpus with its end-of-word mark",
                "Eight are whole words and the rest are fragments",
                "They are stems, suffixes and frequent letter pairs",
                "Fifteen are whole words and the rest are letter pairs",
              ],
              0,
              "All 48 learned pieces are complete words from this corpus. Repeated words receive repeated weight in the fitting objective, and the small collection gives whole-word entries a substantial benefit. The BPE comparison has eight whole words among its 48 learned pieces. At 137 unigram rows, fifteen learned pieces are fragments instead. These counts describe the fitted inventories, not a requirement that unigram vocabularies always contain mostly whole words.",
            ),
            trueFalse(
              "The shrunk vocabulary reads both the corpus and the held-out sentence in fewer pieces than merging does.",
              false,
              "On the corpus it wins everywhere and by a lot, reading it in 133 pieces at 137 tokens against merging’s 263, and 133 is the floor since the corpus holds 133 word occurrences. On the held-out sentence it loses everywhere, 40 pieces against 28 at 80 tokens and 28 against 25 at 137, and the gap never closes. Reading either column alone would settle the question the wrong way.",
            ),
        ],
        },
        {
          title: "Part 6. Independent Pieces and a Vocabulary That May Prune the Wrong Candidate" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="22. Pieces drawn independently, which language is not">
                <p>
                  {"A unigram piece model multiplies piece probabilities without conditioning each one on its neighbors. Real text has such dependencies: an ing piece can be more plausible after play than after the. The independence assumption makes this a simplified model for scoring and choosing segmentations."}
                </p>
                <>
<p>
                  {"The resulting values are probabilities within the model’s assumed piece process. They need not be calibrated probabilities for natural-language words. Relative segmentation and vocabulary comparisons still depend on that assumption, so their downstream usefulness requires evaluation."}
                </p>
                <p>
                  {"Independence lets a position summarize all earlier paths without retaining the preceding piece identity. A model conditioned on the previous piece could still use dynamic programming, but would require additional states and transitions."}
                </p>
</>
                <p>
                  {"A richer dependency model changes both the scoring assumption and computational cost. It need not require enumerating every path. The unigram design chooses a particularly small state representation."}
                </p>
                <KeepInMind>
                  {"Independent piece scores permit a simple position-based dynamic program. Read its probability comparisons under that modeling assumption, and evaluate the segmentations separately for the intended application."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Shrinking is greedy too, in the other direction">
                <p>
                  Pruning evaluates a piece in the context of the vocabulary currently available. That can account for alternatives that a local merge rule does not consider. But the removal is still a commitment: once a piece is gone, a later change can make it useful again without bringing it back. Removing several pieces based on their separate current costs also need not preserve those costs jointly.
                </p>
                <>
<p>
                  The case that shows the gap is a pair of pieces that stand in for each other. Suppose two pieces cover the same ground, so that with both present each is nearly free and both are ranked near the bottom. Drop one, and the other has become valuable; drop them in the same round, as a round dropping a quarter of the table well might, and the corpus loses something neither loss predicted.
                </p>
                <p>
                  Nothing in the procedure reconsiders the second in the light of the first having gone, and nothing brings a dropped piece back if it turns out to have been needed.
                </p>
</>
                <p>
                  {"The many zero proxy losses show that the ranking leaves many candidates tied; they do not reveal exactly how many are redundant substitutes. Smaller removal batches allow more frequent re-estimation, while retaining greedy and proxy approximations. Removing one at a time avoids the particular interaction of simultaneous deletion, though it still need not find the global best vocabulary."}
                </p>
                <KeepInMind>
                  {"Pruning remains greedy and approximate. It compares existing alternative segmentations before committing to removals, but does not guarantee a globally optimal vocabulary. A given run may still happen to find an optimum; the procedure does not certify that fact."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Likelihood is not usefulness">
                <p>
                  The objective is the corpus&rsquo;s probability, and the thing
                  anybody actually wants is a vocabulary that reads new text
                  well. Those are different quantities and the page has already
                  measured them coming apart, in section 19, where the vocabulary
                  that halves the corpus reads the held-out sentence three pieces
                  longer than its rival at the same size.
                </p>
                <>
<p>
                  A sharper version of the same gap is available inside one vocabulary, and the lattice of Part 3 is what makes it easy to ask about. Leave the arcs exactly where they are and give every one of them a cost of one instead of a log probability, and the same recurrence answers a different question, which is the fewest pieces this vocabulary can spell the word in.
                </p>
                <p>
                  {"Minimum token count is another reasonable objective because sequence length affects later computation. It can disagree with maximum path probability: common separate pieces can outscore a rare combined entry. Neither criterion alone measures downstream learning quality."}
                </p>
</>
                <p>
                  {"The finite check compares best-probability and minimum-piece segmentations for 88 words at vocabulary size 200: all corpus words plus sixteen held-out words. Exactly one word receives more pieces under the probability objective."}
                </p>
                <WorkedExample title="The one word where they part">
                  <p>
                  {"The word is didn't, using the straight apostrophe in the actual probe. Its vocabulary includes the joined final piece 't with the end marker, allowing a five-piece path. The model instead chooses six pieces because the separate apostrophe and marked t have a higher probability product. The complete log scores are −2122.86 for six pieces and −2246.46 for five. The longer path is better under this fitted probability score."}
                </p>
                </WorkedExample>
                <p>
                  {"Best-probability decoding and minimum-piece decoding differ on one of these 88 words. They often agree on this sample while remaining different objectives. Optimizing token count in vocabulary selection would be another design choice, with its own evaluation requirements."}
                </p>
                <p>
                  These measurements describe the tokenizer&apos;s vocabulary and segmentation costs. They do not measure how well a downstream model learns from those pieces, because no such model is trained here. Comparing that outcome requires keeping the model experiment separate from the evidence about the tokenizer itself.
                </p>
                <KeepInMind>
                  The likeliest cut is the answer to the question the method
                  asks. Whether it is the useful cut depends on what reads it,
                  and the two came apart once in 88 words here on length alone.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. What piece probabilities and pruning cannot determine" id="25-where-the-method-has-nothing-to-say">
                <p>Piece probabilities do not settle the treatment of an unknown symbol or choose a pruning schedule. These details determine which complete spellings remain available, so they belong beside the likelihood when we describe the tokenizer.</p>
                <DerivationTable
                  expressionHeading="Vocabulary or competing spelling"
                  reasonHeading="What the probability model can choose"
                  rows={[
                    {
                      expression: "a vocabulary that cannot spell some word",
                      reason:
                        "assigned zero probability. The corpus then has log likelihood minus infinity, leaving no finite likelihood comparison between proposals with that failure. This implementation protects single-symbol coverage and rejects requested sizes below its required alphabet. On the eighteen-sentence example that floor is 52 rows.",
                    },
                    {
                      expression: "two spellings with the same probability",
                      reason:
                        "the model is genuinely indifferent, so no answer is more correct. Something must still be chosen, and taking fewer pieces first at least chooses the thing the reader downstream pays for; the remaining case, equal score and equal count, is settled by the longer piece at the first position where the spellings differ. On the four words, low with est and lowe with st tie at 20.06% of the word each.",
                    },
                    {
                      expression: "two pieces whose removal costs the same",
                      reason:
                        "far more common than the tie above, and the ordinary case rather than the edge one. On the eighteen sentences 745 of the 815 removable pieces price at exactly zero, so which of them survives to a given size is decided by whatever orders the ties. Ordering them alphabetically at least makes the fit repeatable; ordering them by whichever was met first makes the vocabulary depend on the order the texts arrived in.",
                    },
                    {
                      expression: "the exact cost of removing a piece",
                      reason:
                        "The SDK computes a fixed-table best-path log-score loss. A full marginal calculation would sum every path and specify whether probabilities are renormalized or re-estimated after removal. The proxy is not generally a lower bound on that different quantity.",
                    },
                    {
                      expression: "the best vocabulary of a given size",
                      reason:
                        "not what is found, and not findable by this procedure. Pieces are removed a fraction at a time on prices measured while every other piece was still present, so a piece that would have become valuable once its substitute went is never reconsidered. Making the fraction smaller reduces the exposure and slows the fit; nothing removes it.",
                    },
                    {
                      expression: "the best estimate of the probabilities",
                      reason:
                        "Exact EM improves or preserves its objective but need not reach a global optimum. A finite run can stop before convergence, and this implementation also uses a numerical floor for zero expected counts. Initialization and iteration count therefore belong in the experiment description.",
                    },
                    {
                      expression: "how many rounds of re-estimation to run",
                      reason:
                        "a decision with no principled answer here, since the walk converges rather than terminating. Too few and the prices are measured against probabilities that have not settled; too many and, on a small corpus, the model becomes certain in the way section 13 measures, where a word the corpus lacks falls from a score of −7.30 to −73.50 in four rounds while its spelling never changes.",
                    },
                    {
                      expression: "a symbol the corpus never used",
                      reason:
                        "The SDK gives an absent single symbol a penalized finite score, then encoding maps an unavailable entry to the unknown token. That retains a finite path score but not the missing character. An augmented character alphabet, byte fallback or explicit refusal would be alternative coverage policies.",
                    },
                    {
                      expression:
                        "a symbol the corpus used only inside words, at the end of one",
                      reason:
                        "the same hole, and much easier to miss, because the character is present. Marking word ends makes a letter at the end a different symbol from the same letter in the middle, which is what makes gluing the pieces back mechanical and what leaves this gap. Alvarez falls into it on a corpus that contains the word size.",
                    },
                    {
                      expression: "a word’s morphological joints",
                      reason:
                        "outside the method entirely. Nothing in a probability over pieces knows that a prefix is a prefix, so a piece spanning a prefix and a root is exactly as admissible as any other. What this method has instead is a tendency, measured rather than designed, which is that maximizing likelihood on a corpus with repetition in it prefers pieces that recur, and pieces that recur in a real language are often the ones a linguist would name.",
                    },
                    {
                      expression: "a corpus with no repetition in it",
                      reason:
                        "If every candidate substring truly occurs once, their frequency ranking ties and the seed’s length preference becomes important. Distinct whole words alone do not ensure that condition: they can share substrings. The four-word corpus instead contains many repeated forms and has 34 of 38 candidates tied at zero best-path removal loss.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"Document how removal ties are ordered, how much each pruning round removes, how many fitting iterations run and how missing symbols are handled. These settings can alter the returned vocabulary even when the high-level probability model is unchanged."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Part 6",
          quiz: [
            trueFalse(
              "The independence assumption is a shortcut that could be dropped for more accuracy at more cost.",
              false,
              "Independence is what lets a path score use the same probability for a piece regardless of the preceding piece. If probabilities depend on the previous piece, the search must also track that piece as state at each position. Such a model is possible, but it changes both the probability model and the recurrence. More dependence would also need evidence that the resulting predictions improve; extra computation alone does not establish that.",
            ),
            choice(
              "What does shrinking fix about merging’s greed, and what does it leave?",
              [
                "Each removal is chosen with the whole current vocabulary in view, but a piece once removed is gone and its loss was computed while every other piece was still present",
                "It reconsiders every remaining piece after each removal, so no piece is ever mispriced",
                "It finds the best vocabulary of a given size, which merging cannot",
                "It brings a dropped piece back when the corpus turns out to need it",
              ],
              0,
              "Neither greedy procedure guarantees the global best vocabulary. In simultaneous pruning, two alternatives can each appear cheap to remove while the other remains, yet be costly to remove together. The reported 91 percent zero best-path losses show many ties under the proxy; they do not establish how many are such substitutable pairs.",
            ),
            choice(
              "Give every arc a cost of one instead of a log probability and the same recurrence answers the fewest pieces a vocabulary can spell a word in. Over 88 words at a vocabulary of 200, how many come out longer than they needed to be?",
              ["Exactly one", "None", "Eight", "Sixteen"],
              0,
              "Only didn't has a longer probability-optimal segmentation in this comparison. The vocabulary allows a five-piece path, but the six-piece path has the larger probability product. The apostrophe and marked t are more probable separately than as the joined piece. On these 88 probes, the two objectives usually agree while remaining mathematically different.",
            ),
            trueFalse(
              "The six-piece spelling of didn’t scores higher than the five-piece one the same vocabulary allows, so the model is choosing correctly by its own objective while giving the longer answer.",
              true,
              "Scored whole, the six-piece spelling comes to minus 2122.86 and the five-piece one to minus 2246.46, and less negative means more likely. Sequence length is what everything downstream pays in, so wanting the shorter answer is reasonable, and making the count the objective on both sides is a separate method rather than a repair to this one.",
            ),
            several(
              "Which of these are decisions the mathematics does not make, and so belong in whatever describes a tokenizer?",
              [
                "How the ties among worthless pieces are ordered",
                "How large a fraction each round drops",
                "How many rounds of re-estimation to run",
                "What a symbol the corpus never used scores",
              ],
              [0, 1, 2, 3],
              "Tie order, pruning fraction and the re-estimation stopping rule are implementation choices. Each can affect the fitted vocabulary or fitting work. Alphabetical tie order is repeatable, while pruning fewer entries refreshes removal scores more often. The trainer also protects the single-symbol entries needed to represent its training alphabet, so it rejects a requested size below that protected inventory. That restriction belongs to this trainer's coverage contract.",
            ),
        ],
        },
        {
          title: "Practice. Shrinking, Pricing and Cutting With the Library",
          practice: [
            exercise(
              "Shrink the four words to 22 rows",
              [
  "Fit the supplied four-word corpus with the unigram vocabulary learner and BPE at twenty-two rows. Disable byte fallback for BPE.",
  "Print the unigram fit’s vocabulary. For lower and lowest print its best segmentation, piece count and log probability to two decimal places, followed by BPE’s pieces and count.",
  "The unigram learner removes candidate pieces during fitting. Search the fitted vocabulary rather than reusing a segmentation possible only in its initial candidate set."
],
              `from oop_ml import BytePairEncoding, UnigramLanguageModel

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]

# Fit a UnigramLanguageModel and a BytePairEncoding at 22 rows, the second
# with byte_fallback=False. Print the rows of the first, in order.
# For lower and lowest print the likeliest spelling under the first, how many
# pieces it has and its log probability to two places, then the pieces the
# second cuts the word into and how many there are.`,
              `from oop_ml import BytePairEncoding, UnigramLanguageModel

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]

shrunk = UnigramLanguageModel(vocabulary_size=22).fit(corpus)
merged = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
print(" ".join(shrunk.vocabulary))

for word in ["lower", "lowest"]:
    best = shrunk.best_segmentation(word)
    cut = merged.encode(word).texts
    print(f"{word}: {' '.join(best.pieces)} ({best.n_tokens}) at {best.log_probability:.2f}")
    print(f"  merged: {' '.join(cut)} ({len(cut)})")`,
              `[UNK] d e i l n o r</w> s t</w> w w</w> newest</w> low</w> widest</w> lower</w> dest</w> est</w> er</w> des es de
lower: lower</w> (1) at -2.09
  merged: lo w e r</w> (4)
lowest: l o w est</w> (4) at -25.70
  merged: lo w est</w> (3)`,
              {
question: "Does the most probable segmentation have the same pieces as BPE?",
 hints: [
  "best_segmentation(word) exposes pieces, n_tokens and log_probability.",
  "The </w> suffix is part of the learned spelling of a word-ending piece.",
  "BPE.encode(word).texts shows the separate comparison. The two learning objectives need not favor the same inventory or cut."
], check: numberCheck("What log probability does the fitted model assign to the most probable segmentation of lowest, to two places?", -25.7, 0.005, "The fitted unigram model scores lowest at about -25.70. Its very low-probability remaining components can spell the word, while the familiar lower has a complete learned row.") },
            ),
            exercise(
              "Take two vocabularies of the same size apart",
              [
  "Fit unigram and BPE vocabularies at ninety and one hundred rows on the eighteen supplied sentences, with BPE byte fallback disabled.",
  "For each fit print how many learned rows are complete corpus words, how many learned rows it has in total, total corpus tokens and held-out Dr. Alvarez sentence tokens.",
  "For these particular vocabularies the first fifty-two rows are reserved and alphabet entries. Exclude them from the learned-row comparison, and keep the end marker when deciding whether a row spells a complete word."
],
              `from oop_ml import BytePairEncoding, UnigramLanguageModel

sentences = [
    "The report was expected on Monday.",
    "The costs were lower than the first estimate.",
    "We reviewed the results and rewrote the summary.",
    "Dr. Bell asked for the analysis of the samples.",
    "A second analysis agreed with the first analysis.",
    "The low readings weren't expected.",
    "The team rechecked the costing and the totals.",
    "Every report carries the date and the analyst's name.",
    "The revised estimate was lower again.",
    "Nobody expected the samples to arrive early.",
    "The cost of the analysis was the reason.",
    "The analysts reran the tests on Tuesday.",
    "The lowest cost was the reason the report was late.",
    "The reviewers expected a lower estimate.",
    "The high-cost option was dropped.",
    "The size of the August batch was fixed.",
    "Dr. Bell rewrote the costing and the report.",
    "The analysis was expected to cost less.",
]
sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."
words = {word + "</w>" for text in sentences for word in text.split()}

for size in [90, 100]:
    fits = [
        ("shrunk", UnigramLanguageModel(vocabulary_size=size).fit(sentences)),
        ("merged", BytePairEncoding(vocabulary_size=size, byte_fallback=False).fit(sentences)),
    ]
    # For each fit take the learned pieces, count how many are in words,
    # and print the size, the label, that count out of how many were learned,
    # the pieces the eighteen sentences cost and the pieces the sentence costs.`,
              `from oop_ml import BytePairEncoding, UnigramLanguageModel

sentences = [
    "The report was expected on Monday.",
    "The costs were lower than the first estimate.",
    "We reviewed the results and rewrote the summary.",
    "Dr. Bell asked for the analysis of the samples.",
    "A second analysis agreed with the first analysis.",
    "The low readings weren't expected.",
    "The team rechecked the costing and the totals.",
    "Every report carries the date and the analyst's name.",
    "The revised estimate was lower again.",
    "Nobody expected the samples to arrive early.",
    "The cost of the analysis was the reason.",
    "The analysts reran the tests on Tuesday.",
    "The lowest cost was the reason the report was late.",
    "The reviewers expected a lower estimate.",
    "The high-cost option was dropped.",
    "The size of the August batch was fixed.",
    "Dr. Bell rewrote the costing and the report.",
    "The analysis was expected to cost less.",
]
sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."
words = {word + "</w>" for text in sentences for word in text.split()}

for size in [90, 100]:
    fits = [
        ("shrunk", UnigramLanguageModel(vocabulary_size=size).fit(sentences)),
        ("merged", BytePairEncoding(vocabulary_size=size, byte_fallback=False).fit(sentences)),
    ]
    for label, model in fits:
        learned = list(model.vocabulary)[52:]
        whole = sum(1 for piece in learned if piece in words)
        corpus_pieces = sum(model.encode(text).n_tokens for text in sentences)
        sentence_pieces = model.encode(sentence).n_tokens
        print(f"{size} {label}: {whole} of {len(learned)} learned pieces are whole words, "
              f"corpus {corpus_pieces}, sentence {sentence_pieces}")`,
              `90 shrunk: 38 of 38 learned pieces are whole words, corpus 274, sentence 32
90 merged: 8 of 38 learned pieces are whole words, corpus 374, sentence 27
100 shrunk: 48 of 48 learned pieces are whole words, corpus 229, sentence 32
100 merged: 8 of 48 learned pieces are whole words, corpus 344, sentence 27`,
              {
question: "How do equally large vocabularies divide their rows between whole words and reusable parts?",
 hints: [
  "Slice list(model.vocabulary) after its first 52 entries for this fixture.",
  "Build a set of corpus words with </w> attached before testing learned-row membership.",
  "Measure corpus length and held-out length independently. A row devoted to one familiar whole word may offer little to another word."
], check: numberCheck("How many tokens represent the training corpus under the unigram vocabulary at 90 rows?", 274, 0, "At ninety rows the unigram vocabulary gives 274 corpus tokens. It spends its learned rows on complete familiar words here, which shortens training text without giving the same benefit on the held-out sentence.") },
            ),
            exercise(
              "Find the word whose likeliest cut is not its shortest",
              [
  "Fit the unigram learner at vocabulary_size=200 on the supplied eighteen sentences. Inspect the supplied didn’t probe using the exact apostrophe spelling in the code.",
  "Print its best segmentation, count and log probability. Independently score the supplied five-piece alternative by summing its pieces’ log probabilities.",
  "Print the score of the joined apostrophe/final-t piece, the combined score of those characters kept separate, and total corpus tokens. This compares the model’s probability objective with a shortest-piece objective."
],
              `from oop_ml import UnigramLanguageModel

sentences = [
    "The report was expected on Monday.",
    "The costs were lower than the first estimate.",
    "We reviewed the results and rewrote the summary.",
    "Dr. Bell asked for the analysis of the samples.",
    "A second analysis agreed with the first analysis.",
    "The low readings weren't expected.",
    "The team rechecked the costing and the totals.",
    "Every report carries the date and the analyst's name.",
    "The revised estimate was lower again.",
    "Nobody expected the samples to arrive early.",
    "The cost of the analysis was the reason.",
    "The analysts reran the tests on Tuesday.",
    "The lowest cost was the reason the report was late.",
    "The reviewers expected a lower estimate.",
    "The high-cost option was dropped.",
    "The size of the August batch was fixed.",
    "Dr. Bell rewrote the costing and the report.",
    "The analysis was expected to cost less.",
]
shorter = ["d", "i", "d", "n", "'t</w>"]

model = UnigramLanguageModel(vocabulary_size=200).fit(sentences)
# Print the likeliest spelling of didn't, its piece count and its log
# probability to two places. Print the same three things for shorter, whose
# score is the sum of its pieces' log probabilities.
# Print the log probability of "'t</w>" and of "'" plus "t</w>", then the
# number of pieces the eighteen sentences cost.`,
              `from oop_ml import UnigramLanguageModel

sentences = [
    "The report was expected on Monday.",
    "The costs were lower than the first estimate.",
    "We reviewed the results and rewrote the summary.",
    "Dr. Bell asked for the analysis of the samples.",
    "A second analysis agreed with the first analysis.",
    "The low readings weren't expected.",
    "The team rechecked the costing and the totals.",
    "Every report carries the date and the analyst's name.",
    "The revised estimate was lower again.",
    "Nobody expected the samples to arrive early.",
    "The cost of the analysis was the reason.",
    "The analysts reran the tests on Tuesday.",
    "The lowest cost was the reason the report was late.",
    "The reviewers expected a lower estimate.",
    "The high-cost option was dropped.",
    "The size of the August batch was fixed.",
    "Dr. Bell rewrote the costing and the report.",
    "The analysis was expected to cost less.",
]
shorter = ["d", "i", "d", "n", "'t</w>"]

model = UnigramLanguageModel(vocabulary_size=200).fit(sentences)
best = model.best_segmentation("didn't")
print(f"likeliest: {' '.join(best.pieces)} ({best.n_tokens}) at {best.log_probability:.2f}")

score = sum(model.log_probability_of(piece) for piece in shorter)
print(f"shorter: {' '.join(shorter)} ({len(shorter)}) at {score:.2f}")

joined = model.log_probability_of("'t</w>")
apart = model.log_probability_of("'") + model.log_probability_of("t</w>")
print(f"joined {joined:.2f}, apart {apart:.2f}")

corpus_pieces = sum(model.encode(text).n_tokens for text in sentences)
print(f"corpus: {corpus_pieces} pieces")`,
              `likeliest: d i d n ' t</w> (6) at -2122.86
shorter: d i d n 't</w> (5) at -2246.46
joined -726.53, apart -602.93
corpus: 133 pieces`,
              {
question: "Can the more probable segmentation contain more pieces?",
 hints: [
  "best_segmentation returns the chosen cut and its complete log_probability.",
  "log_probability_of expects the exact vocabulary spelling, including </w> where present.",
  "Compare the scores of the two alternatives. A less negative log score means higher probability, regardless of how many pieces it uses."
], check: numberCheck("What log probability does the vocabulary assign to the single joined piece 't</w>, to two places?", -726.53, 0.005, "The joined piece scores about -726.53. Keeping its characters separate is more probable under this fitted inventory, so the best probability path uses an extra piece.") },
            ),
          ],
        },
      ]}
    />
  );
}
