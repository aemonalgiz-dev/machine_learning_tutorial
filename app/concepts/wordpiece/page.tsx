import { pageMetadata } from "@/lib/seo";
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
import { ContinuationCuts } from "@/components/widgets/ContinuationCuts";
import { MarkedAgainstEnded } from "@/components/widgets/MarkedAgainstEnded";
import { MergeOrderColumns } from "@/components/widgets/MergeOrderColumns";
import { PairScoreBoard } from "@/components/widgets/PairScoreBoard";
import { PairScoreScatter } from "@/components/widgets/PairScoreScatter";
import { ShorteningCurve } from "@/components/widgets/ShorteningCurve";
import { WordPiecePlayground } from "@/components/widgets/WordPiecePlayground";

export const metadata: Metadata = pageMetadata("/concepts/wordpiece", {
  title: "WordPiece · Perceptron Lab",
  description:
    "WordPiece represents text through reusable pieces and a longest-match encoding rule. The teaching implementation builds its vocabulary using pair scores, making the distinction between vocabulary learning and later encoding explicit.",
});

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function WordPiecePage() {
  return (
    <ConceptPage
      lessonId="wordpiece"
      intuition={lessonIntuitions["wordpiece"]}
      technicalStart="Part 2. The Score That Replaces the Count"
      openingTitle="A Common Pair May Only Have Common Halves"
      playgroundTitle="Which pair earns a place in the vocabulary?"
      playgroundIntro="Compare candidate pairs under raw counts and the relative-frequency score. Then inspect how continuation markers affect the longest-match encoding."
      title="WordPiece"
      tagline={"WordPiece represents text through reusable pieces and a longest-match encoding rule. The teaching implementation builds its vocabulary using pair scores, making the distinction between vocabulary learning and later encoding explicit."}
      prerequisites={
        <>
          You need the merging loop from the previous page, which is the whole
          of what this one inherits. Start every word spelled out in single
          symbols, count how often each adjacent pair occurs across the corpus,
          join the best pair everywhere, and repeat until the vocabulary is the
          size you asked for. Everything on this page is about the word{" "}
          <em>best</em> in that sentence, and about a second change that follows
          from the first. No probability is needed beyond the idea that two
          things happening together can be commoner or rarer than the two
          happening independently.
        </>
      }

      playground={<WordPiecePlayground />}
      sections={[
        {
          title: "Part 1. What a Pair Count Cannot Tell You",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Where this starts, and the one thing that changes">
                <p>

                  The earlier merge loop chose a neighboring pair from counts in the corpus. We can keep that loop while changing the reason one pair is preferred. This teaching trainer still builds words from small symbols and adds selected combinations until it reaches the requested vocabulary size; its selection score is the part we now need to understand.
                </p>
                <p>
                  We now have a separate question to ask of that scoring rule: did a pair occur often because its halves belong together, or because both halves occur almost everywhere? The next example compares those possibilities before giving the relative-frequency calculation.
                </p>
                <>
                  <p>
                    The teaching implementation keeps the same merge loop but changes
                    the score used to select its next pair. It rewards pairs whose parts
                    occur together more strongly relative to their individual counts.
                  </p>
                  <p>
                    We use the same held-out sentence and eighteen-sentence training
                    corpus as the earlier examples. Later we compare a second,
                    independent choice: longest-match encoding instead of replaying
                    merges.
                  </p>
                </>
                <Equation>{SENTENCE}</Equation>
                <KeepInMind>
                  {"This comparison keeps the corpus and starting symbols fixed while changing the pair-selection score. The first chosen pair differs on both displayed corpora. Later, we separately change the boundary markers and encoding rule."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The commonest pair is common because its halves are">
                <>
<p>
                  {"Before merging, the eighteen sentences have 87 adjacent pairs occurring at least twice. The most common is h followed by e, with 32 occurrences, largely inside the. We can compare that count with the frequency of each component."}
                </p>
                <p>
                  {"The h symbol appears 36 times and e appears 98 times. Most h occurrences are followed by e, while many e occurrences appear elsewhere. Raw frequency and the association ratio describe different properties; these counts alone do not establish why the pair occurs."}
                </p>
</>
                <p>
                  {"Plot each candidate’s pair count horizontally and its association ratio vertically. This lets us compare common combinations with combinations whose parts occur together relative to their separate frequencies. The rankings need not agree."}
                </p>
                <PairScoreScatter />
                <p>
                  They do not. The commonest pair sits low, only the 32nd best
                  of the 87 candidates by the other figure. The pair highest
                  up the chart is o followed by f, which occurs three times and
                  is the whole of the word of. Every o that starts a word in
                  this corpus is one of six, every f that sits inside a word is
                  one of three, and half of those o&rsquo;s and all of those
                  f&rsquo;s are in the same three places. Counted on its own it
                  has 45 of the 87 candidates ahead of it, which puts it in the
                  lower half.
                </p>
                <KeepInMind>
                  {"A large count measures repeated adjacency. The ratio measures a different feature of the same corpus: how that count compares with the individual component counts. Either can define a merge objective; neither identifies linguistic structure by itself."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What we wanted to ask instead">
                <p>
                  A frequent pair may simply contain two individually frequent symbols. To distinguish that case, this implementation compares the pair count with the counts of its components. A pair that occurs more often than those separate frequencies would suggest receives a stronger association score. This is a rule for choosing merges, not proof that a joined piece has a linguistic meaning or will help every downstream model.
                </p>
                <p>
                  {"The pair count supplies the numerator. Multiplying the two component counts supplies the denominator. That gives the association ratio below. This is a chosen scoring rule, rather than the only possible way to use these counts."}
                </p>
                <KeepInMind>
                  {"Choose the score according to what the vocabulary is intended to support, then evaluate the result. Here we can inspect how an association preference changes the selected entries compared with raw frequency."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Score That Replaces the Count",
          content: (
            <>
              <SubSection title="4. Dividing by what the two halves predict">
                <p>
                  Each candidate pair is scored by how often the two are
                  adjacent, divided by the product of how often each of them
                  occurs anywhere in the corpus. The pair with the largest such
                  figure wins the turn.
                </p>
                <Equation>
                  {"score(a, b)  =  count(a, b) / ( count(a) × count(b) )"}
                </Equation>
                <p>
                  The denominator changes what we reward. Common components make it large, so a frequent pair can still receive a small score. Rare components make it small, which can give a rare pair a high score. When each component appears only in this pair, the ratio is the reciprocal of the pair count. That illustrates the preference for rare, tightly associated pairs; it does not mean every such pair outranks every other candidate.
                </p>
                <WhyThisWorks title="Where the division comes from">
                  <p>
                    We can connect the ratio to a local log-probability comparison. Treat symbol shares and a candidate pair&apos;s share as fixed values. Replacing two symbol factors with one candidate factor gives the difference below. This comparison helps explain the score, but it does not refit and normalize a new vocabulary model.
                  </p>
                  <Equation>
                    {"log p(ab)  −  log p(a)  −  log p(b)"}
                  </Equation>
                  <p>
                    Substituting the count divided by the corpus total for each share leaves the log of the ratio score times that total. At one merge step the total is common to the candidates, so ranking these local differences gives the same order as ranking the ratio. A full likelihood change after a merge would also account for changed counts and normalization.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  What the rule ranks is the gain one occurrence of the pair
                  makes, not the gain all of its occurrences make together. Those
                  two orderings are not the same, and section 20 shows a corpus
                  on which they disagree.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The same eleven pairs under both figures">
                <p>
                  We need a corpus small enough to check by hand, so for the
                  next three sections we drop to four words with their counts,
                  the same four the previous page worked on. The word low occurs
                  five times, lower twice, newest six times and widest three,
                  sixteen occurrences in all, spelled in eleven distinct
                  symbols. Eleven pairs of adjacent symbols exist across them,
                  and here they are with both figures, orderable either way.
                </p>
                <PairScoreBoard />
                <WorkedExample title="Why the less frequent pair receives the higher score">
                  <>
                    <p>
                      The pair e followed by s occurs nine times. Its two parts occur
                      seventeen and nine times. The pair i followed by d occurs three
                      times, and each part occurs three times.
                    </p>
                    <Equation>{"score(e, s) = 9 / (17 × 9) = 1/17 ≈ 0.0588\nscore(i, d) = 3 / (3 × 3) = 1/3 ≈ 0.3333"}</Equation>
                    <p>
                      The second pair occurs less often but receives the larger ratio
                      score because its parts always occur together in this corpus.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  {"The count ranking puts e followed by s near the top. The ratio puts i followed by d above it. The table makes that difference visible on the same candidates, without treating either ordering as a complete measure of vocabulary quality."}
                </p>
                <KeepInMind>
                  We need both symbol counts and pair counts. Once we have those, evaluating a candidate adds a multiplication and a division. That gives a similar counting workflow to BPE, with some extra work for the association score.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Where the two orders part">
                <p>
                  {"Run both selection rules from the same starting symbols. Each merge changes the sequences that will be counted next, so later columns compare evolving candidate sets rather than two permanent rankings of the original pairs."}
                </p>
                <MergeOrderColumns />
                <>
<p>
                  On the four words the two part at the very first merge, counting taking e followed by s and the score taking i followed by d. On the eighteen sentences they part at the first merge too, counting taking h followed by e at 32 occurrences and the score taking o followed by f at three.
                </p>
                <p>
                  {"Both displayed corpora choose different first merges under the two scores. They can still learn some of the same pieces later. The claim is about these runs, not proof that the rules never agree on a step."}
                </p>
</>
                <InAModel>
                  {"At a larger vocabulary budget, both rules may eventually include many common words, but their selected entries and order can still differ. This page does not measure a large production vocabulary, so the small runs cannot establish how much that difference is diluted at scale."}
                </InAModel>
                <KeepInMind>
                  Because the corpus is respelled after every turn, the choice at
                  turn one changes what the candidates even are at turn two, so
                  the two columns above are not two orderings of one list. On the
                  four words they end up sharing seven of their twelve merged
                  pieces and reaching them in unrelated orders.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What the score prefers, and what it refuses to buy">
                <p>
                  {"On the four-word corpus, i and d occur three times each and always together. Their ratio exceeds that of e and s, which occur seventeen and nine times and are adjacent nine times. More generally, the rule favors a high ratio, rather than guaranteeing every rare bound pair beats every common pair."}
                </p>
                <>
<p>
                  {"In the eighteen-sentence example, count scoring spends its first six merges on he, the, st, re, ed and The. Those pieces reflect repeated combinations in common words. Ratio scoring may learn them later; it does not forbid them."}
                </p>
                <p>

                  The score rule spends its first six turns on of, ex, exp, ly, Dr and Dr., of which of and Dr. are whole words of the corpus and ex and exp are the front of expect and expected. Those are recognizably different kinds of thing.
                </p>
</>
                <KeepInMind>
                  {"An association-based choice can save fewer immediate pieces than a more frequent pair. Part 4 measures that cost on these corpora. A different ordering can also leave different later opportunities, so the initial preference does not determine every final compression result."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "Why compare an adjacent pair’s count with the individual counts of its two pieces?",
              [
                "h occurs 36 times and e occurs 98; the ratio accounts for those component frequencies instead of using the pair count alone.",
                "32 occurrences is too few to rely on",
                "The pair spans the gap between two words",
                "A pair of single letters cannot be a vocabulary row",
              ],
              0,
              "Common pieces can have a large adjacent-pair count simply because each occurs often. Comparing their joint count with their individual counts helps distinguish frequent co-occurrence from unusually concentrated association. This is the local score used by the teaching implementation; it does not prove the pieces form a meaningful linguistic unit.",
            ),
            choice(
              "What does the score divide the pair count by?",
              [
                "The product of how often each half occurs anywhere in the corpus",
                "The number of distinct words the pair occurs in",
                "The total number of symbols in the corpus",
                "The count of the commoner of the two halves",
              ],
              0,
              "The denominator is the product of the component counts. Large counts reduce the ratio unless the pair count grows enough to compensate. This can favor rare, tightly associated pairs over more frequent ones.",
            ),
            trueFalse(
              "At fixed shares, dropping the common corpus total and the increasing logarithm preserves the ranking of the local comparison, leaving the ratio score.",
              true,
              "At fixed shares, replacing two symbol factors with a candidate-pair factor gives its log share minus the logs of the component shares. Converting shares to counts introduces a corpus total common to every candidate, so this local comparison ranks candidates like the ratio score. It is not the full change obtained by refitting all probabilities after a merge.",
            ),
            choice(
              "On the four words, e followed by s occurs nine times with halves occurring seventeen and nine times, and i followed by d occurs three times with each half occurring three times. Which does the score take?",
              [
                "i followed by d",
                "e followed by s",
                "Whichever occurs in more distinct words",
                "Neither, because both halves are too common",
              ],
              0,
              "One third against one seventeenth, because i and d are only ever seen beside each other inside widest. Ordered by the count the two swap ends, which is a different question producing a different answer on the same eleven rows.",
            ),
            several(
              "Which of these describe the first six turns on the eighteen sentences?",
              [
                "Counting assembles he, the, st, re, ed and The",
                "The score assembles of, ex, exp, ly, Dr and Dr.",
                "Of the score’s six, of and Dr. are whole words of the corpus",
                "The two rules part at the very first turn, counting taking h followed by e at 32 occurrences and the score taking o followed by f at three",
              ],
              [0, 1, 2, 3],
              "There is no corpus on this page where the two agree for even one turn, and on both of them they part at the very first merge. The count rule buys the frequent pairing of frequent symbols, every one of its six a fragment of a very common word, where the score buys of whole and the front of expect and expected. A change of one word in the rule sounds like a refinement and produces a different vocabulary from the first row onwards.",
            ),
        ],
        },
        {
          title: "Part 3. Marking the Piece That Continues a Word",
          content: (
            <>
              <SubSection title="8. A letter is two symbols, depending on where it sits">
                <p>
                  {"This WordPiece convention distinguishes a word’s first piece from its continuations. A continuation uses the prefix ##, so low begins as l, ##o and ##w. Decoding can join the marked pieces into words and separate the unmarked starts with spaces. This records word grouping under the pre-tokenizer’s convention, not every original whitespace character."}
                </p>
                <WorkedExample title="Eleven symbols for ten letters">
                  <p>
                    The four words use ten distinct letters, and the spelling
                    turns them into eleven symbols, because w appears both at the
                    start of widest and inside low, lower and newest, and those
                    are two different symbols. Counted separately the
                    word-initial w occurs three times and the continuing ##w
                    occurs thirteen. On the eighteen sentences the same split
                    turns 35 distinct characters into 49 symbols, and the
                    end-marked spelling turns the same 35 into 51.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Both spellings do the same job, which is to record the word
                  boundary inside the symbols so that decoding is a string
                  operation rather than a second piece of bookkeeping. They
                  differ in which end of the word carries the record, and section
                  12 shows that this is not a cosmetic difference.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Why the mark sits on the continuation and not between words">
                <p>
                  {"Merges stay within words because words are counted separately. A separate space or boundary symbol would not by itself lift that constraint. The continuation marker is instead a convention for representing a piece’s position and reconstructing word grouping."}
                </p>
                <p>
                  {"The implementation trains with an internal marker on each word’s first symbol, then translates learned entries into the visible ## continuation form. Keeping these two spellings separate avoids leaving a continuation prefix inside a joined piece. That internal spelling also affects the lexical tie rule discussed later."}
                </p>
                <KeepInMind>
                  {"Both marker conventions retain word-position information. An arbitrary learned piece set cannot always be converted one entry at a time into an equivalent vocabulary using the other convention: an entry may need different forms depending on where it is allowed. Section 12 compares their coverage on this corpus."}
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Cutting a word by longest match, with the merges forgotten">
                <>
                  <p>
                    WordPiece also uses a different encoding rule: it searches the final
                    vocabulary for the longest matching piece at the current position.
                    BPE replays learned merges in order. This is a separate design
                    choice from the score used to select pieces during training. A
                    vocabulary alone does not specify how an input should be segmented.
                  </p>
                </>
                <DerivationTable
                  expressionHeading="the step"
                  reasonHeading="what it does"
                  rows={[
                    {
                      expression: "start at the first character",
                      reason:
                        "and look only among the pieces that may start a word, since a continuation cannot",
                    },
                    {
                      expression: "take the longest piece that fits",
                      reason:
                        "longest rather than first, so widest is cut after wid and not after w",
                    },
                    {
                      expression: "advance past it and repeat",
                      reason:
                        "now looking only among continuations, which is a different set of pieces",
                    },
                    {
                      expression: "if nothing fits, give up on the word",
                      reason:
                        "the whole word becomes one stand-in token, not the one character that failed",
                    },
                  ]}
                />
                <WorkedExample title="A word the corpus never held">
                  <p>
                    Fitted on the four words to ten merges, the vocabulary holds
                    low and ##est among its rows. The word lowest, which the
                    corpus never contained, is cut by taking the longest opening
                    piece that fits, which is low rather than l or lo, then the
                    longest continuation that fits the rest, which is ##est. Two
                    pieces, and gluing them back gives lowest again. The word
                    widest is cut as wid and ##est, which is the same rule
                    preferring the three-letter opening over the one-letter one.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  {"Encoding consults the final vocabulary and longest-match rule, without replaying merge ranks. The tokenizer must still carry its continuation convention, pre-tokenizer, unknown-word policy and length limit. Learned row order is not the segmentation priority used by this decoder."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Where WordPiece splits the Alvarez sentence" id="11-the-running-sentence-and-where-the-marks-fall">
                <p>
                  The four vocabulary sizes give different divisions of the Dr. Alvarez sentence. In each displayed word, its first piece has no continuation mark and later pieces do. That convention makes the retained word boundaries visible independently of how much of the word was merged into each entry. It describes these encoded words rather than a separate claim about their grammatical structure.
                </p>
                <ContinuationCuts />
                <p>At the largest tested vocabulary size, the seven-word sentence uses 29 pieces. Dr. and the are complete vocabulary entries; low is followed by a continuation piece for the hyphen. The pre-tokenizer kept low-cost together, so that internal boundary came from vocabulary encoding. Alvarez uses six pieces because the complete name was absent from the training corpus.</p>
                <KeepInMind>
                  {"For successfully represented words under this convention, the first piece is unmarked and later pieces carry ##. An unknown word also returns one unmarked stand-in. Counting those starts therefore counts pre-tokenized words, without implying that every word was recovered faithfully."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The mark decides which words cannot be spelled at all">
                <p>
                  {"The retained starting symbols differ under the two marker conventions. A continuation-marked fit needs an opening form at the beginning and continuation forms later. An end-marked fit needs the appropriate final form. Learned pieces inherit these position constraints, so the two vocabularies can cover different new words."}
                </p>
                <MarkedAgainstEnded />
                <p>
                  Of the 35 characters the eighteen sentences use, thirteen never
                  open a word and eighteen never end one. So Alvarez, which ends
                  in a z and no word of the corpus ends in z, is spelled in six
                  pieces by the continuation-marked vocabulary and defeats the
                  end-marked one. The word zebra, which begins with a z and no
                  word of the corpus begins with z, is exactly the other way
                  round. The word you defeats both, since no word here starts
                  with y or ends with u.
                </p>
                <InAModel>
                  {"We can supply additional single-character forms to improve coverage rather than relying only on positions observed in this corpus. The required number depends on the alphabet. An alternative is byte fallback. No finite character selection should be described as covering every possible script without stating what it includes."}
                </InAModel>
                <KeepInMind>
                  {"In this corpus-derived alphabet, a letter seen in one position is not automatically supplied in every other form. That coverage policy is separate from the pair score. Additional alphabet entries or fallback can change it."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What the Change Costs",
          content: (
            <>
              <SubSection title="13. The same corpus, the same merges, two rules">
                <p>
                  {"To isolate the score, hold the corpus, symbol spelling and merge budget fixed. Then compare encoded length after each run. Length matters to a downstream model’s work, though it is not the only vocabulary property worth evaluating."}
                </p>
                <ShorteningCurve />
                <p>
                  {"Ratio scoring uses more corpus pieces than count scoring at the displayed intermediate budgets. At ten merges the lengths are 614 and 504; at sixty they are 411 and 302. The count run exhausts eligible pairs after 84 merges at 254 pieces, while the ratio run takes 107 merges to reach 256. These measurements concern this controlled representation, not a universal ordering."}
                </p>
                <KeepInMind>
                  {"In the shown runs, association scoring exchanges shorter intermediate encodings for different vocabulary entries. At exhaustion the lengths are close. The table measures that trade-off without establishing a general winner on other data."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Whole vocabularies of the same size">
                <p>
                  The previous section held the spelling fixed to isolate the
                  score. A reader choosing between the two schemes is not
                  choosing a score, though, they are choosing a whole scheme, so
                  here are complete fits of each at the same requested size,
                  measured on the eighteen sentences and on the sentence kept out
                  of them.
                </p>
                <NumberTable
                  headings={[
                    "vocabulary asked for",
                    "the corpus, marked",
                    "the corpus, end-marked",
                    "the sentence, marked",
                    "the sentence, end-marked",
                  ]}
                  rows={[
                    ["52", "640", "648", "44", "45"],
                    ["74", "556", "440", "38", "30"],
                    ["90", "501", "374", "36", "27"],
                    ["110", "411", "317", "34", "27"],
                    ["130", "343", "277", "31", "25"],
                    ["150", "269", "263", "29", "25"],
                    ["200", "254", "263", "29", "25"],
                  ]}
                  caption="Both schemes fitted on the same eighteen sentences at each size, then made to read the same held-out sentence. At 150 and 200 the end-marked fit has run out of pairs and learned 137 rows either way."
                />
                <p>At vocabulary size 130, count-based merging uses 277 pieces for the corpus and 25 for the held-out sentence. This relative-frequency trainer uses 343 and 31. The selection score has therefore not produced the shortest representation in this comparison.</p>
                <p>The count-based trainer stops at 137 rows after exhausting eligible pairs. This trainer continues to 157. At those different endpoints, the corpus counts are 263 and 254 respectively, while the held-out counts are 25 and 29. Comparing endpoints alone would mix the effect of the scoring rule with the effect of vocabulary size.</p>
                <KeepInMind>
                  {"At most displayed budgets, count-based encoding is shorter on this corpus and probe. At the smallest budget, the initial alphabets differ, and at the largest budget the corpus ordering changes. Read the rows rather than assuming the same scheme wins at every size."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Where it is worse, where it is better, and the crossing">
                <p>
                  {"At the final exhausted fits, the association-trained vocabulary uses 254 corpus pieces versus 263 for the end-marked count fit. It also has twenty more learned rows. That endpoint comparison combines different vocabulary sizes and marker conventions, so it does not isolate the association score alone."}
                </p>
                <p>
                  The second thing that table does not show is what happened to
                  the sentence. At every one of those sizes the
                  continuation-marked fit reads it with nothing unspellable and
                  gives it back exactly, and at every one of those sizes the
                  end-marked fit leaves one piece of it unspellable and never
                  gives the sentence back exactly, because of the z at the end of
                  Alvarez. A shorter reading that has lost a character is not
                  obviously the better reading.
                </p>
                <KeepInMind>
                  {"Length and coverage describe different outcomes. The no-fallback end-marked fit is shorter at most listed budgets but loses a symbol in this probe. The continuation fit retains this sentence. A choice between them should account for both the encoding contract and the intended downstream use."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A word is lost whole, or not at all">
                <p>
                  {"If the greedy search cannot cover a word, this decoder replaces the whole word with one unknown entry. It also does so for words above its configured length limit. Retaining a partial prefix or using fallback would be alternative policies; whole-word replacement is not logically required by longest match."}
                </p>
                <WorkedExample title="Two schemes meeting the same impossible word">
                  <p>
                  {"With lox, the missing x produces different results. The no-fallback BPE fit retains lo and emits an unknown entry for the remainder. WordPiece emits one unknown entry for the entire word. Neither reconstructs lox exactly."}
                </p>
                </WorkedExample>
                <p>
                  {"A retained prefix conveys part of the spelling; a whole-word unknown conveys only that a word was present. Neither guarantees how the model will interpret it. The distinction matters when comparing unknown-token counts, because one policy discards a symbol and the other can discard many characters."}
                </p>
                <KeepInMind>
                  Under this scheme an unspellable word costs exactly one piece,
                  which makes a text full of them look short. Length and coverage
                  have to be read together, or a vocabulary that cannot spell
                  anything will look excellent.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Why mark the piece that continues a word rather than give the space a symbol of its own?",
              [
                "A space symbol would merge with whatever sits beside it, so a piece could span the gap between two words",
                "The score cannot be computed for a symbol that sits between two words",
                "Marking continuations means nothing has to be stripped at a join",
                "A space cannot be written with two leading hashes",
              ],
              0,
              "This learner counts and merges pieces within pre-tokenized words, so no candidate pair crosses those regions. Continuation markers distinguish the start of a word from its later pieces and guide encoding/decoding. The marker alone is not the boundary enforcement: the permitted merge regions are part of the tokenizer’s specification too.",
            ),
            trueFalse(
              "The two markings are the same fact written on different pieces, so the two vocabularies can spell the same words.",
              false,
              "The boundary markings distinguish different positional forms of a character. These fitted vocabularies need not contain every form, so their coverage differs even when the corpus contains the same underlying letters. Here Alvarez lacks a required BPE ending, zebra lacks a WordPiece opening, and you cannot be fully encoded by either fit.",
            ),
            trueFalse(
              "With tokenizer settings fixed, longest-match WordPiece encoding uses the vocabulary entries rather than replaying their learned merge order.",
              true,
              "The cut takes the longest opening piece that fits and then the longest continuation that fits the rest, and never consults the merges, so lowest becomes low and ##est and widest becomes wid and ##est. The count-scored scheme replays its merges instead and arrives at lo, w and est with its marker for the same word. One consequence is that exactly one piece per word carries no mark, so the count of unmarked pieces in any cut is the number of words.",
            ),
            several(
              "Which of these were measured when the two complete schemes were fitted at a vocabulary of 130?",
              [
                "The count-scored scheme reads the corpus in 277 pieces where this one needs 343",
                "The sentence costs 31 pieces under this scheme against 25",
                "The score-driven scheme reads the corpus in fewer pieces at every size",
                "The end-marked fit gives the sentence back exactly and this one does not",
              ],
              [0, 1],
              "At the requested size of 130, BPE encodes the training corpus in fewer pieces than this WordPiece fit. The continuation-marked fit, however, preserves the supplied probe exactly while the end-marked BPE fit substitutes one position. These measurements compare compression and coverage separately. They do not establish a universally best vocabulary size or tokenizer.",
            ),
            choice(
              "Both schemes are asked to read lox, whose x the corpus never contained. What is the difference?",
              [
                "The count-scored one answers lo and then a stand-in, where this one answers a single stand-in for the whole word",
                "The count-scored one refuses to answer and this one does not",
                "This one answers lo and then a stand-in, where the count-scored one answers a single stand-in",
                "Both answer a single stand-in, and only the reported length differs",
              ],
              0,
              "This WordPiece policy replaces the entire unspellable word with one unknown token. The BPE comparison retains known pieces around an unknown position. Neither policy recovers the missing x, but retaining lo is not inherently false information. The choice controls how partial spelling information and unknown-word boundaries are presented to the downstream model.",
            ),
        ],
        },
        {
          title: "Part 5. Two Decisions the Score Does Not Make",
          content: (
            <>
              <SubSection title="17. Two candidates the score cannot separate">
                <p>
                  {"The initial ratio scores tie at one third for i followed by d and word-initial w followed by i. Each symbol count and pair count is three. The scoring formula therefore needs a tie rule before training can choose its next merge."}
                </p>
                <NumberTable
                  headings={["pair", "together", "each half", "the score"]}
                  rows={[
                    ["##i ##d", "3", "3 and 3", "0.3333"],
                    ["w ##i", "3", "3 and 3", "0.3333"],
                  ]}
                  caption="The two candidates at the top of the first turn on the four words, and the figures that fail to separate them."
                />
                <>
<p>
                  Any tie-break at all is added from outside. The choice made here is to compare the two candidates as text and take the smaller, which at least makes the answer independent of the order the corpus&rsquo;s texts arrived in. Because the comparison happens in the spelling the merges are learned in, where a word&rsquo;s first symbol carries a mark of its own, what actually decides is the position of that mark in the character table against the position of the letter i.
                </p>
                <p>
                  The mark is at 9601 and i is at 105, so i comes first, and the vocabulary contains ##id and does not contain wi.
                </p>
</>
                <KeepInMind>
                  {"The internal marker’s code point settles this lexical tie. It provides repeatability, not evidence that the chosen entry is linguistically better. Equal immediate scores can still lead to different later entries or evaluations."}
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The fewest times a pair may be seen, as a filter and as a stopping test">
                <p>
                  A minimum pair count lets us exclude candidates supported by very little evidence. But when should we apply that filter? We could remove rare candidates before ranking them, or rank everything and stop if the winner is too rare. Those procedures need not choose the same merges.
                </p>
                <p>
                  Under counting the two readings coincide, since the winner
                  always has the largest count and a failing winner means every
                  candidate fails. Under this score they come apart completely,
                  because the winner can be a rare pair while common pairs are
                  still unmerged. Set the minimum to three on the four words and
                  measure both.
                </p>
                <NumberTable
                  headings={["reading", "merges learned", "what it ends with"]}
                  rows={[
                    [
                      "filter the candidates",
                      "10",
                      "##id, wid, lo, ##st, low, ##est, ##ew, new, newest, widest",
                    ],
                    [
                      "test the winner and stop",
                      "5",
                      "##id, wid, lo, ##st, low",
                    ],
                  ]}
                  caption="The same corpus and the same minimum of three, read the two ways."
                />
                <p>
                  {"Ranking every pair first would stop after five merges when the winner fails the minimum count. Filtering first instead continues to ten and learns ##est, ##ew, new, newest and widest from eligible pairs. The example shows why an apparently minor ordering of filtering and ranking belongs in the algorithm’s contract."}
                </p>
                <KeepInMind>
                  A stopping rule that worked with counts can behave differently after we change the score. This example gives us a specific condition to test when reusing a merge loop.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. When Rare Pairs Win and Words Cannot Be Read" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="19. A ratio has a denominator, and a bound pair is not infinitely good">
                <p>
                  The score is a division, and the first question to ask of any
                  division is what happens as the denominator shrinks. Suppose
                  two symbols occur only ever beside each other, which is the
                  case the rule was built to reward. Then how often the pair
                  occurs and how often each half occurs are all the same number,
                  so the score is that number divided by its own square, which is
                  one over the number.
                </p>
                <Equation>
                  {"score  =  c / ( c × c )  =  1 / c"}
                </Equation>
                <p>
                  Among pairs whose components occur only together, the ratio falls as the count rises. The table compares a pair observed twice with pairs observed more often. This preference may conflict with an aim such as reducing the corpus&apos;s encoded length, because a common pair offers more opportunities to shorten it.
                </p>
                <NumberTable
                  headings={[
                    "how often the pair occurs",
                    "the score",
                    "against a pair bound twice",
                    "which is taken",
                  ]}
                  rows={[
                    ["2", "0.5000", "0.5000", "tied"],
                    ["3", "0.3333", "0.5000", "the rarer"],
                    ["5", "0.2000", "0.5000", "the rarer"],
                    ["9", "0.1111", "0.5000", "the rarer"],
                  ]}
                  caption="Two pairs on one corpus, each of whose halves never occurs apart from its partner, one of them seen twice and the other seen as often as the left column says."
                />
                <p>
                  It is also worth saying what is <em>not</em> undefined for an observed candidate. Both component counts include the candidate&apos;s occurrences, so both are positive. Counting only occurrences outside the pair would be a different score; for a perfectly bound pair it would create a zero denominator.
                </p>
                <KeepInMind>
                  A minimum count can remove the rarest candidates, but among the perfectly bound pairs that remain, this ratio still prefers the smaller count. The filter does not change the score&apos;s underlying preference.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. What the ratio is not maximizing" id="20-what-the-ratio-is-not-maximising">
                <p>
                  The local comparison in section 4 describes one occurrence using fixed shares. Multiplying it by the pair count gives a count-weighted proxy. That proxy can rank candidates differently from the ratio alone. Neither calculation is the exact corpus likelihood change after all vocabulary probabilities are refitted.
                </p>
                <Equation>
                  {"count-weighted proxy  =  count(a, b) × log( N × score(a, b) )"}
                </Equation>
                <p>
                  On the four-word corpus of 79 symbols, the count-weighted proxy is largest for s followed by t, at 19.55. The ratio selects i followed by d, whose proxy value is 9.81. Raw pair counting selects e followed by s, whose value is 13.83. This gives us three different rankings of the same candidates. The proxy&apos;s winner is fourth under the ratio and joint first under counts, where it loses the alphabetical tie-break.
                </p>
                <WhyThisWorks title="Why the multiplication is left out">
                  <p>

                    The count multiplier gives frequent pairs more influence when we estimate a total change. Our teaching implementation instead ranks the per-occurrence association score. That choice favors association over raw frequency. It is not a calculation of the full change in corpus likelihood after refitting the vocabulary probabilities, and should not be presented as one.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The association score and the count-weighted proxy choose different pairs on the first turn of this example. Keep their meanings separate from a fully refitted likelihood comparison.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. When the greedy cut can fail, and when it cannot">
                <p>
                  Could taking the longest available piece prevent us from completing a word? It can: the chosen prefix may leave a suffix that the continuation vocabulary cannot represent, even though a shorter prefix would have allowed a complete split. Let&apos;s examine which vocabulary entries make that possible.
                </p>
                <p>
                  {"For this learned vocabulary, every continuation piece retains its single-character components as vocabulary entries. If a character lacks a continuation form, no learned continuation can hide that absence. Within the supported length and marker policies, greedy decoding therefore succeeds whenever a valid split exists. The general greedy counterexample above applies to vocabularies that do not retain this component coverage."}
                </p>
                <NumberTable
                  headings={["over every word up to four letters", "count"]}
                  rows={[
                    ["words spellable from the ten letters", "11,110"],
                    ["cut successfully", "1,755"],
                    ["refused at the first character", "7,777"],
                    ["refused later", "1,578"],
                    ["refused although some other division existed", "0"],
                  ]}
                  caption="Every word of one to four letters over the small corpus's alphabet, cut by the ten-merge vocabulary, with every refusal checked against an exhaustive search for any division at all."
                />
                <p>
                  {"All 1,578 later failures in this finite enumeration contain l or n after the first character. Neither has a continuation form in this corpus. An exhaustive search finds no alternate split for those cases. Removing base entries from another vocabulary can break that component-coverage property; adding suitable single-character forms can restore it."}
                </p>
                <KeepInMind>
                  {"Keeping the required single-character forms guarantees a complete greedy split for inputs using those forms, subject to the decoder’s length and reserved-marker policies. It does not guarantee the minimum possible token count. A vocabulary missing base forms can admit a split that greedy longest match overlooks."}
                </KeepInMind>
              </SubSection>

              <SubSection title="22. The vocabulary still carries its corpus">
                <p>
                  {"The vocabulary still reflects its training corpus. While that vocabulary remains fixed, later model training does not automatically change its entries or segmentation. Adapting the tokenizer is possible, but requires keeping its token IDs and the consuming model compatible."}
                </p>
                <p>
                  The exhausted training vocabulary contains 157 rows and uses 1.91 pieces per word on its own eighteen-sentence corpus. The held-out dial-and-diode sentence uses 2.38, while the running sentence uses 4.14. Reading those measurements together shows how a familiar subject can still produce a different segmentation cost when its spellings and combinations were not represented by the fitted entries.
                </p>
                <KeepInMind>
                  {"Evaluate the vocabulary on representative inputs beyond its training corpus. Both corpus choice and scoring rule can affect the resulting lengths and coverage. Neither the association ratio nor a familiar language label guarantees graceful behavior on a new domain."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Choices the pair score does not settle" id="23-where-the-method-has-nothing-to-say">
                <p>The pair score ranks candidates, but it does not define every part of a tokenizer. Rare pairs, ties and words containing unavailable pieces still require explicit choices. Those choices affect both the learned vocabulary and what it can read.</p>
                <DerivationTable
                  expressionHeading="Pair score or vocabulary condition"
                  reasonHeading="What the merge rule leaves to us"
                  rows={[
                    {
                      expression: "two pairs with the same score",
                      reason:
                        "the rule is indifferent, so no answer is more correct. Some order must be imposed and any order is arbitrary; comparing the candidates as text at least makes the fit repeatable, where taking whichever was met first makes it depend on the order the texts arrived in. On the four words the first turn is such a tie and it is settled by one character sitting at 9601 and another at 105.",
                    },
                    {
                      expression: "a pair whose halves never occur apart",
                      reason:
                        "The score becomes the reciprocal of the pair count when the components occur only together. This favors rarer perfectly bound pairs. A minimum count removes candidates below its threshold, but does not remove that preference among the remaining candidates.",
                    },
                    {
                      expression: "a pair seen exactly once",
                      reason:
                        "A minimum count controls which candidates are eligible. Distinct whole words can still share repeated internal pairs. If the intended policy is to exclude rare pairs, apply that filter before ranking; stopping on an ineligible winner can discard other eligible pairs.",
                    },
                    {
                      expression: "the pair that most raises the likelihood",
                      reason:
                        "This implementation maximizes the association ratio. A count-weighted local log-score proxy instead prefers the candidate valued at 19.55 over the selected candidate valued at 9.81. Computing the actual likelihood change would also require updating and normalizing the vocabulary probabilities.",
                    },
                    {
                      expression: "a vocabulary smaller than the alphabet",
                      reason:
                        "there is nothing to give. The floor is one row per symbol the corpus is spelled in, plus whatever stands in for the unspellable, and a letter used both at the start of a word and inside one counts as two symbols. On the eighteen sentences that floor is 50, and on the same corpus spelled with the other mark it is 52.",
                    },
                    {
                      expression: "a vocabulary larger than the corpus can fill",
                      reason:
                        "the loop runs out of pairs occurring often enough and stops. The size asked for is a ceiling and not a promise; on the eighteen sentences 200 and 157 are the same fit.",
                    },
                    {
                      expression:
                        "a character seen only inside words, at the start of one",
                      reason:
                        "unspellable, and easy to miss, because the character is there. Marking continuations makes a letter at the start a different symbol from the same letter in the middle, and thirteen of this corpus’s thirty-five characters never open a word. Marking the other end of a word moves that hole rather than closing it, since eighteen of the same thirty-five characters never end one.",
                    },
                    {
                      expression: "a word one piece short of spellable",
                      reason:
                        "This decoder returns one unknown entry for the whole word. Keeping a partial prefix or applying fallback would be other policies. Compare recovered spelling as well as token count, since whole-word substitution can make a lossy encoding appear short.",
                    },
                    {
                      expression: "the shortest reading of a word",
                      reason:
                        "Longest match seeks a left-to-right split and does not in general minimize token count. In the vocabulary tested here, retaining the component symbols ensures a complete split whenever the necessary symbols are available. A vocabulary missing single-symbol fallbacks can require backtracking to find a split that greedy decoding misses.",
                    },
                    {
                      expression: "which of two schemes is better",
                      reason:
                        "At vocabulary size 130, the count-based fit uses 66 fewer corpus pieces and six fewer probe pieces, but the no-fallback version loses a symbol. The smallest and exhausted endpoints have different length relationships. Compare the actual budget, coverage and length rather than assigning a universal winner.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"Record how ties, minimum counts, word-position forms and encoding failures are handled. These settings work together with the vocabulary and longest-match decoder. A pair score alone is not a complete tokenizer specification."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "At the first merge on the four words, i followed by d and w followed by i both score one third. How is the tie settled?",
              [
                "The two candidates are compared as text and the smaller is taken",
                "The pair occurring in more words is taken",
                "The pair whose halves are rarer is taken",
                "Both are merged and the loop moves on",
              ],
              0,
              "Any tie-break at all is added from outside, and this one at least makes the answer independent of the order the texts arrived in. The comparison happens in the spelling the merges are learned in, where the word-initial mark sits at 9601 and i at 105, so the vocabulary gets ##id and not wi.",
            ),
            trueFalse(
              "Applying the minimum count to the winning pair rather than to the candidates behaves the same way under either scoring rule.",
              false,
              "Under counting the two readings coincide, since the winner always has the largest count and a failing winner means every candidate fails. Under this score the winner can be rare while common pairs are still unmerged, so at a minimum of three on the four words the winner test stops after five merges and leaves ##est, ##ew, new, newest and widest unlearned while reporting itself finished.",
            ),
            choice(
              "Two symbols occur only ever beside each other, c times each. What does the rule score that pair?",
              [
                "One over c, so the score falls as the pair gets commoner",
                "c, so the score rises as the pair gets commoner",
                "One, whatever c is",
                "Nothing, since the division is undefined when the halves never occur apart",
              ],
              0,
              "For two pieces that occur only together c times, the score becomes:\n\n```math\nc / (c × c) = 1 / c\n```\n\nWithin that special class of perfectly associated pairs, smaller counts receive larger ratio scores. That is a property of the scoring rule; a minimum-count policy can separately restrict which rare pairs are eligible.",
            ),
            several(
              "Which statements hold for the pair with the largest count-weighted proxy in the four-word example?",
              [
                "It is s followed by t, gaining 19.55",
                "It is ranked fourth by the score",
                "It is joint first by the count, and loses that tie on alphabetical order",
                "It is the pair the score takes at the first turn",
              ],
              [0, 1, 2],
              "The count-weighted fixed-share proxy favors s followed by t, with proxy value 19.55. The ratio rule favors i followed by d, whose count-weighted proxy value is 9.81. Those latter numbers are proxy values, not the ratio scores themselves. Neither comparison is an exact corpus likelihood gain after refitting all symbol probabilities.",
              { description: "Compare the measured candidates from the four-word corpus. A score rank of one is best; equal counts are ordered alphabetically.", data: "Pair    Count-weighted proxy    Score rank    Count rank\ns + t   19.55                   4             joint 1\ni + d    9.81                   1             below 1\ne + s   13.83                   below 1       joint 1" },
            ),
            trueFalse(
              "For this learner’s unpruned merge-built vocabulary, greedy WordPiece succeeds exactly when an allowed vocabulary segmentation exists.",
              true,
              "Every merged continuation entry is built from single-character continuation entries retained by this learner. If a successful alternative division exists, those base entries can spell the remainder after the longest opening match. That is why greedy failure and unspellability coincide under this unpruned inventory. Pruning required base entries or importing a different vocabulary can remove that guarantee.",
            ),
        ],
        },
        {
          title: "Practice. Scoring, Marking and Cutting With the Library",
          practice: [
            exercise(
              "Cut lowest by longest match on the four words",
              [
  "Fit WordPiece and BPE on the supplied repeated four-word corpus at twenty-two rows, disabling byte fallback for BPE.",
  "Print the WordPiece vocabulary size, merge count and row spellings. Then print each model’s pieces and counts for lowest, widest and lox.",
  "WordPiece uses ## to mark a continuation after a word’s first piece. Its encoding takes the longest available match at each position; the BPE comparison replays its learned merges. Inspect lox to compare how an unspellable word is handled."
],
              `from oop_ml import BytePairEncoding, WordPiece

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]

marked = WordPiece(vocabulary_size=22).fit(corpus)
ended = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
# Print how many rows and merges the marked fit holds and its rows in order.
# Then for lowest, widest and lox print the pieces under each fit and how
# many there are.`,
              `from oop_ml import BytePairEncoding, WordPiece

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]

marked = WordPiece(vocabulary_size=22).fit(corpus)
ended = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
print(f"{marked.vocabulary.n_tokens} rows after {marked.n_merges} merges")
print(" ".join(marked.vocabulary))
for word in ["lowest", "widest", "lox"]:
    first = marked.encode(word).texts
    second = ended.encode(word).texts
    print(f"{word}: {' '.join(first)} ({len(first)}) | count-scored: {' '.join(second)} ({len(second)})")`,
              `22 rows after 10 merges
[UNK] l n w ##d ##e ##i ##o ##r ##s ##t ##w ##id wid lo ##st low ##er lower ##est ##ew new
lowest: low ##est (2) | count-scored: lo w est</w> (3)
widest: wid ##est (2) | count-scored: widest</w> (1)
lox: [UNK] (1) | count-scored: lo [UNK] (2)`,
              {
question: "What does longest-match WordPiece do differently from replaying BPE merges?",
 hints: [
  "Both constructors take vocabulary_size and both fit the same corpus.",
  "Use model.vocabulary and n_merges for the fit report, and encode(word).texts for the segmentation.",
  "A continuation needs its ## spelling in the vocabulary. An available word-initial spelling cannot automatically be reused in that position."
], check: numberCheck("How many pieces does lowest come to under the continuation-marked fit?", 2, 0, "WordPiece uses two pieces for lowest. The available opening low is followed by ##est, while the BPE vocabulary’s merge procedure gives a different cut.") },
            ),
            exercise(
              "Fit both schemes at one size and compare",
              [
  "Fit WordPiece and end-marked BPE at requested sizes one hundred and one hundred thirty using the same eighteen training sentences. Disable byte fallback for BPE.",
  "For each fit print actual rows, total corpus tokens, held-out Dr. Alvarez sentence tokens, its unknown-piece count and exact round-trip result.",
  "Keep coverage beside length in the report. A shorter sequence containing an unknown stand-in has lost information that a longer exact sequence may retain."
],
              `from oop_ml import BytePairEncoding, WordPiece

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

for size in [100, 130]:
    fits = [
        ("marked", WordPiece(vocabulary_size=size).fit(sentences)),
        ("end-marked", BytePairEncoding(vocabulary_size=size, byte_fallback=False).fit(sentences)),
    ]
    # For each fit print the size, its label, the rows in its vocabulary, the
    # pieces the eighteen sentences cost, the pieces the sentence costs, how
    # many of those are the stand-in [UNK], and whether decoding gives the
    # sentence back exactly.`,
              `from oop_ml import BytePairEncoding, WordPiece

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

for size in [100, 130]:
    fits = [
        ("marked", WordPiece(vocabulary_size=size).fit(sentences)),
        ("end-marked", BytePairEncoding(vocabulary_size=size, byte_fallback=False).fit(sentences)),
    ]
    for label, model in fits:
        encoding = model.encode(sentence)
        corpus_pieces = sum(model.encode(text).n_tokens for text in sentences)
        stand_ins = sum(1 for piece in encoding.texts if piece == "[UNK]")
        exact = model.decode(encoding.ids) == sentence
        print(f"{size} {label}: {model.vocabulary.n_tokens} rows, corpus {corpus_pieces}, "
              f"sentence {encoding.n_tokens}, stand-ins {stand_ins}, exact {exact}")`,
              `100 marked: 100 rows, corpus 446, sentence 34, stand-ins 0, exact True
100 end-marked: 100 rows, corpus 344, sentence 27, stand-ins 1, exact False
130 marked: 130 rows, corpus 343, sentence 31, stand-ins 0, exact True
130 end-marked: 130 rows, corpus 277, sentence 25, stand-ins 1, exact False`,
              {
question: "How do two vocabularies of the same requested size behave on new text?",
 hints: [
  "Sum model.encode(text).n_tokens over the unchanged training corpus.",
  "Count \"[UNK]\" in the probe encoding’s texts.",
  "Compare the probe’s decoded IDs with the original string, rather than accepting a plausible-looking reconstruction."
], check: numberCheck("How many pieces does the corpus cost under the continuation-marked fit at 100 rows?", 446, 0, "WordPiece uses 446 corpus pieces at one hundred rows. Its merge scoring allocates rows differently from frequency-driven BPE, so the same requested budget need not give the same compression.") },
            ),
            exercise(
              "Fit to exhaustion and price three texts per word",
              [
  "Fit WordPiece on the eighteen supplied sentences with vocabulary_size=600, allowing it to stop when no eligible repeated pair remains.",
  "Print actual vocabulary and merge counts. For the joined corpus, supplied neighbor sentence and Dr. Alvarez sentence, print tokens, whitespace-delimited word count and tokens per word to two decimal places.",
  "Finally print how many distinct whitespace-delimited corpus words already exist as complete vocabulary rows. This describes the fitted inventory, not a promise about future words."
],
              `from oop_ml import WordPiece

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
neighbour = "The dial was set and the diode tested."

model = WordPiece(vocabulary_size=600).fit(sentences)
# Print the rows and merges learned. Then for the corpus joined into one
# text, the neighbour sentence and the running sentence, print the pieces,
# the words and the pieces per word to two places. Finally count the
# distinct words of the corpus that are rows of the vocabulary.`,
              `from oop_ml import WordPiece

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
neighbour = "The dial was set and the diode tested."

model = WordPiece(vocabulary_size=600).fit(sentences)
print(f"{model.vocabulary.n_tokens} rows after {model.n_merges} merges")

texts = {"corpus": " ".join(sentences), "neighbour": neighbour, "running": sentence}
for label, text in texts.items():
    pieces = model.encode(text).n_tokens
    words = len(text.split())
    print(f"{label}: {pieces} pieces over {words} words, {pieces / words:.2f} per word")

distinct = sorted({word for text in sentences for word in text.split()})
whole = [word for word in distinct if word in model.vocabulary]
print(f"{len(whole)} of {len(distinct)} distinct words are single rows")`,
              `157 rows after 107 merges
corpus: 254 pieces over 133 words, 1.91 per word
neighbour: 19 pieces over 8 words, 2.38 per word
running: 29 pieces over 7 words, 4.14 per word
24 of 72 distinct words are single rows`,
              {
question: "How far does a vocabulary specialized to one corpus transfer to nearby text?",
 hints: [
  "Read vocabulary.n_tokens after fitting instead of assuming the requested ceiling was reached.",
  "Use the same whitespace word definition for every denominator.",
  "A word-initial complete WordPiece entry has no ## prefix. Test the exact corpus-word spelling for vocabulary membership."
], check: numberCheck("How many of the 72 distinct words of the corpus are single rows of the vocabulary?", 24, 0, "Twenty-four distinct corpus words are complete vocabulary rows. Familiar text can reuse them directly, while new words often require several known parts.") },
            ),
            exercise(
              "Spell the words each marking cannot",
              [
  "Fit WordPiece and BPE to exhaustion on the supplied eighteen sentences, using the large requested budget and disabling BPE byte fallback.",
  "Encode Alvarez, zebra, you, old and hour with both. Print their pieces and counts in the supplied order.",
  "Compare unknown markers as well as counts. WordPiece distinguishes initial and continuation entries; this BPE distinguishes word-ending entries, so merely seeing a letter somewhere in the training text does not guarantee every needed spelling."
],
              `from oop_ml import BytePairEncoding, WordPiece

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

marked = WordPiece(vocabulary_size=600).fit(sentences)
ended = BytePairEncoding(vocabulary_size=600, byte_fallback=False).fit(sentences)
# For Alvarez, zebra, you, old and hour print the pieces under each fit and
# how many there are.`,
              `from oop_ml import BytePairEncoding, WordPiece

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

marked = WordPiece(vocabulary_size=600).fit(sentences)
ended = BytePairEncoding(vocabulary_size=600, byte_fallback=False).fit(sentences)
for word in ["Alvarez", "zebra", "you", "old", "hour"]:
    first = marked.encode(word).texts
    second = ended.encode(word).texts
    print(f"{word}: {' '.join(first)} ({len(first)}) | end-marked: {' '.join(second)} ({len(second)})")`,
              `Alvarez: A ##l ##v ##ar ##e ##z (6) | end-marked: A l v a re [UNK] (6)
zebra: [UNK] (1) | end-marked: z e b r a</w> (5)
you: [UNK] (1) | end-marked: y o [UNK] (3)
old: o ##l ##d (3) | end-marked: o l d</w> (3)
hour: h ##o ##u ##r (4) | end-marked: h o u r</w> (4)`,
              {
question: "Can the same letters be spellable in one word position and missing in another?",
 hints: [
  "Read each input as one complete word using encode(word).texts.",
  "WordPiece can replace an unspellable whole word with one stand-in. The BPE comparison can retain known pieces around an unknown position.",
  "For a failed position, check which boundary-marked form would have been needed."
], check: numberCheck("How many pieces does Alvarez cost under the continuation-marked vocabulary?", 6, 0, "WordPiece spells Alvarez in six pieces. BPE also returns six pieces here but includes an unknown ending, so equal length conceals different coverage.") },
            ),
          ],
        },
      ]}
    />
  );
}
