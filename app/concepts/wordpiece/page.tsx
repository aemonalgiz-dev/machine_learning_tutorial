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

export const metadata: Metadata = {
  title: "WordPiece · oop_ml",
  description:
    "A tokenizer needs reusable word parts and a consistent way to find them in new text. We will look at the pair-scoring rule used here to build a WordPiece vocabulary, then its longest-match encoding rule.",
};

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
      tagline={"A tokenizer needs reusable word parts and a consistent way to find them in new text. We will look at the pair-scoring rule used here to build a WordPiece vocabulary, then its longest-match encoding rule."}
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
                  Start with the merge loop from the previous lesson. Write each word in single symbols, count adjacent pairs across the corpus, then join the pair selected by the scoring rule. Repeat until the vocabulary reaches the requested size.
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
                  Nothing about the loop changes. The same corpus, the same
                  spelling into symbols, the same greedy join repeated until the
                  vocabulary is full. What changes is which pair wins each turn,
                  and that turns out to change the vocabulary from the first
                  turn onwards.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The commonest pair is common because its halves are">
                <>
<p>
                  Take the eighteen sentences and count every adjacent pair once, before any merging. There are 87 pairs that occur at least twice, and the commonest of them is h followed by e, at 32 occurrences, which comes almost entirely from the word the. That looks like a discovery until you look at the two halves on their own.
                </p>
                <p>
                  The letter h occurs 36 times in the corpus and the letter e occurs 98 times, so nearly every h in the corpus is followed by an e, and the pair is frequent chiefly because e is everywhere.
                </p>
</>
                <p>
                  Put every candidate on a chart, with how often it occurs
                  across the bottom and, up the side, how often it occurs
                  compared with what its halves alone would lead you to expect.
                  If the two figures said the same thing the points would form a
                  rising line and there would be nothing to argue about.
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
                  A large count answers the question &ldquo;how often do these
                  two turn up next to each other&rdquo;, and that is not the
                  question. Two very common symbols will turn up next to each
                  other often whether or not they have anything to do with one
                  another.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What we wanted to ask instead">
                <p>
                  A frequent pair may simply contain two individually frequent symbols. To distinguish that case, this implementation compares the pair count with the counts of its components. A pair that occurs more often than those separate frequencies would suggest receives a stronger association score. This is a rule for choosing merges, not proof that a joined piece has a linguistic meaning or will help every downstream model.
                </p>
                <p>
                  Written out that way the fix is almost forced. We already have
                  how often the pair occurs. We can get how often each half
                  occurs anywhere, which is one more pass over the same counts.
                  The comparison is a division.
                </p>
                <KeepInMind>
                  A count answers how often two symbols are adjacent, which is a
                  perfectly good question and not the one a vocabulary row is for.
                  Everything below is one way of asking the intended question with
                  the counts already to hand.
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
                  Ordered by the count, e followed by s is at the top and i
                  followed by d is near the bottom. Ordered by the score they
                  swap ends. That is not a small perturbation of one ordering
                  into another; it is a different question producing a different
                  answer on the same eleven rows.
                </p>
                <KeepInMind>
                  We need both symbol counts and pair counts. Once we have those, evaluating a candidate adds a multiplication and a division. That gives a similar counting workflow to BPE, with some extra work for the association score.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Where the two orders part">
                <p>
                  Run both rules over the same spelling of the same corpus and
                  put the results side by side. Each column is a full run, since
                  every turn counts the corpus the turn before it left, so a
                  disagreement at one step carries forward into every step after
                  it.
                </p>
                <MergeOrderColumns />
                <>
<p>
                  On the four words the two part at the very first merge, counting taking e followed by s and the score taking i followed by d. On the eighteen sentences they part at the first merge too, counting taking h followed by e at 32 occurrences and the score taking o followed by f at three.
                </p>
                <p>
                  There is no corpus on this page where the two agree for even one turn, which is worth saying because a change of one word in the rule sounds like a refinement and here it produces a different vocabulary from the first row onwards.
                </p>
</>
                <InAModel>
                  At the scale a real vocabulary is built at, thirty thousand
                  rows over billions of words, the divergence is the same but the
                  effect is diluted, since both rules eventually buy most of the
                  frequent words whole. What differs is the order they are bought
                  in and therefore which of them fits inside the budget, and what
                  the leftover rows are spent on when the frequent words have all
                  been bought.
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
                  Read the formula for what it favours and one sentence covers
                  it. A pair of rare symbols that are only ever seen beside each
                  other beats a pair of common symbols that are merely adjacent a
                  great deal. On the four words that is i and d, which occur three
                  times each and always together inside widest, beating e and s,
                  which occur seventeen and nine times and are adjacent nine of
                  those times.
                </p>
                <>
<p>
                  What it will not buy is the row that a count-driven run buys first, which is the frequent pairing of two frequent symbols. On the eighteen sentences the count rule spends its first six turns assembling he, the, st, re, ed and The, every one of them a very common fragment of a very common word.
                </p>
                <p>
                  The score rule spends its first six turns on of, ex, exp, ly, Dr and Dr., of which of and Dr. are whole words of the corpus and ex and exp are the front of expect and expected. Those are recognisably different kinds of thing.
                </p>
</>
                <KeepInMind>
                  Preferring rare-but-bound pairs is the intended behaviour and
                  also the cost, since a row spent on a rare pair shortens the
                  corpus less than a row spent on a common one. Part 4 measures
                  how much less.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "The commonest adjacent pair in the eighteen sentences is h followed by e, at 32 occurrences. Why is that not a discovery?",
              [
                "h occurs 36 times and e occurs 98, so nearly every h is followed by an e and the pair is frequent chiefly because e is everywhere",
                "32 occurrences is too few to rely on",
                "The pair spans the gap between two words",
                "A pair of single letters cannot be a vocabulary row",
              ],
              0,
              "Two very common symbols will turn up next to each other often whether or not they have anything to do with one another. What a vocabulary row is worth is whether its halves belong together, which is a comparison against chance rather than a count.",
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
              "The denominator is the product of the component counts. Large counts reduce the ratio unless the pair count grows enough to compensate. This can favour rare, tightly associated pairs over more frequent ones.",
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
                  A vocabulary of pieces has to record where the spaces were, or
                  the pieces cannot be glued back into a sentence. The previous
                  page did that by marking the last symbol of each word, so that
                  the w ending low is a different symbol from the w inside lower.
                  WordPiece marks the other end. A piece that continues a word is
                  written with two leading hashes and a piece that starts one is
                  written plainly, so low is l, then ##o, then ##w.
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
                  A separate symbol standing for the space would be one more
                  thing for the loop to merge, and it would merge with whatever
                  sits beside it, so a piece could span the gap between two words
                  before any word had been assembled. Marking a symbol instead
                  keeps every merge inside one word by construction, since the
                  words are counted separately and no pair ever spans two of
                  them.
                </p>
                <p>
                  Given that, the choice is which end to mark, and both work.
                  What has to be watched is that joining two marked symbols
                  produces something sensible. Marking word starts, joining is
                  always safe, since a word-initial symbol is only ever the left
                  half of a merge and a mark at the far left of the left half
                  stays at the far left of the result. Marking continuations, the
                  arithmetic has to strip the mark from the right half at every
                  join, or two hashes end up in the middle of a piece.
                </p>
                <KeepInMind>
                  The two markings are the same fact written on different pieces,
                  and a vocabulary in one form can be rewritten into the other
                  symbol by symbol. What cannot be rewritten is which words the
                  vocabulary can spell, which is section 12.
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
                  Because the merges are not consulted, they are not part of what
                  a fitted scheme has to carry. The vocabulary is the model, and
                  the order the rows were learned in is only the history of how
                  it was built.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Where WordPiece splits the Alvarez sentence" id="11-the-running-sentence-and-where-the-marks-fall">
                <p>
                  Fitted on the eighteen sentences, here is the sentence about Dr. Alvarez
                  cut at four vocabulary sizes. Watch the marks rather than the
                  pieces. Exactly one piece per word carries no mark, and it is
                  always the first, so a reader can find the word boundaries by
                  eye without knowing anything about the corpus.
                </p>
                <ContinuationCuts />
                <p>
                  At the largest size the sentence is 29 pieces for seven words.
                  Two of the words come out whole, Dr. with its full stop and the
                  word the, and low arrives as one piece with the hyphen after it
                  marked as a continuation, which is the pre-tokenizer&rsquo;s
                  doing rather than the vocabulary&rsquo;s, since nothing split
                  low-cost into two words. The name Alvarez costs six pieces,
                  which is the honest price of a word the corpus never held.
                </p>
                <KeepInMind>
                  Marks fall on continuations, so the count of unmarked pieces in
                  any cut is the number of words. That is a useful property to
                  have by construction rather than by convention, and it is what
                  makes gluing the pieces back a matter of stripping marks and
                  joining.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The mark decides which words cannot be spelled at all">
                <p>
                  Now the part that is not cosmetic. Marking continuations means
                  the first character of a word must have been seen starting some
                  word of the corpus, and the rest must have been seen inside
                  one. Marking ends means the last character must have been seen
                  ending some word. Those are different requirements and the
                  corpus satisfies them in different places, so the two spellings
                  fail on different words.
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
                  At real scale this hole is smaller but not gone, and it is why
                  a real vocabulary usually adds every single character of the
                  script in both forms whether the corpus used them that way or
                  not. The cost is a few hundred rows and the benefit is that no
                  word is ever lost for a reason as arbitrary as which end of it
                  a rare letter sits at.
                </InAModel>
                <KeepInMind>
                  Whichever end is marked, the vocabulary needs the corpus to
                  have used each character in that position, and a character used
                  only in the other position is no help at all. This is not a
                  failure of the scoring rule; it is the price of recording the
                  word boundary inside a symbol.
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
                  Something downstream will read these pieces, and it spends work
                  per piece, so the length of a text in pieces is the currency
                  everything is bought with. To price the scoring rule on its own
                  we hold everything else fixed. The same corpus, the same
                  spelling into symbols, the same number of merges, and only the
                  choice of which pair to take at each turn differs.
                </p>
                <ShorteningCurve />
                <p>
                  The score-driven line is above the count-driven one at every
                  budget on both corpora, which is what a rule that deliberately
                  buys rare pairs must produce. On the eighteen sentences, ten
                  merges take the corpus from 648 pieces to 504 under counting
                  and to 614 under the score, and sixty merges reach 302 against
                  411. The count-driven run then runs out of pairs occurring
                  twice after 84 merges, at 254 pieces, and the score-driven run
                  needs 107 merges to reach 256.
                </p>
                <KeepInMind>
                  Choosing by the score costs pieces at every budget short of
                  exhaustion, on both corpora, and the two rules end up at
                  practically the same place once there is nothing left to merge.
                  What is bought with those pieces is a different set of rows
                  along the way.
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
                <p>
                  The middle of the table is the honest headline. At a vocabulary
                  of 130 the count-scored scheme reads the corpus in 277 pieces
                  and the sentence in 25, where this one needs 343 and 31, which
                  is 24 per cent more on the corpus and six pieces more on seven
                  words. The two columns cross only at the very end, where the
                  count-scored fit has exhausted its pairs at 137 rows and this
                  one keeps merging to 157, at which point the corpus figures are
                  254 against 263 and the sentence figures are still 29 against
                  25.
                </p>
                <KeepInMind>
                  On this corpus, at every size a reader would actually choose,
                  the older scheme gives shorter text. That is worth stating
                  plainly, because the usual presentation of this method skips it
                  and the number is not small.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Where it is worse, where it is better, and the crossing">
                <p>
                  So why use it at all? Two things in that table point the other
                  way, and one of them is not about length. The first is the
                  crossing at the end. The count-scored run stops learning at 137
                  rows because nothing occurs twice any more, and 254 against 263
                  says that when both are allowed to finish, the score-driven one
                  ends up marginally shorter on the corpus it was built from. It
                  simply takes twenty more rows to get there.
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
                  The comparison is not one number. The end-marked scheme wins on
                  length at every practical size here, and loses on coverage of
                  this particular sentence at every size, and which of those
                  matters depends entirely on what the text is going to be used
                  for.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A word is lost whole, or not at all">
                <p>
                  One more consequence of cutting by longest match rather than by
                  replaying merges. When the cut fails partway through a word,
                  there is no sensible way to continue, since the pieces already
                  chosen were chosen on the assumption that the rest would work
                  out. So the whole word is thrown away and replaced by a single
                  stand-in token.
                </p>
                <WorkedExample title="Two schemes meeting the same impossible word">
                  <p>
                    Fitted on the four words, both schemes are asked to read lox,
                    whose x the corpus never contained. The count-scored one
                    answers lo and then a stand-in, keeping two of the three
                    letters. This one answers a single stand-in for the whole
                    word. Neither can spell it, and they differ in how much of
                    the wreckage they hand on.
                  </p>
                </WorkedExample>
                <p>
                  Which of those is better is genuinely open. Handing on lo tells
                  a model something, and it also tells it something false, since
                  lo now appears in a context it never appears in. Handing on one
                  stand-in tells the model only that a word was here, which is
                  less information and no misinformation. What is not open is
                  that the two are different, and a count of unspellable pieces
                  means different things under the two schemes.
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
              "Marking a symbol keeps every merge inside one word by construction, since the words are counted separately and no pair ever spans two of them. Marking continuations does cost something at each join, because the mark has to be stripped from the right half or two hashes end up in the middle of a piece.",
            ),
            trueFalse(
              "The two markings are the same fact written on different pieces, so the two vocabularies can spell the same words.",
              false,
              "A vocabulary in one form can be rewritten into the other symbol by symbol, and what cannot be rewritten is which words it can spell. Of the 35 characters these sentences use, thirteen never open a word and eighteen never end one, so Alvarez defeats the end-marked spelling, zebra defeats the continuation-marked one, and you defeats both.",
            ),
            trueFalse(
              "Under longest match the vocabulary is the model, and the order the rows were learned in is only the history of how it was built.",
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
              "The older scheme gives shorter text at every size a reader would actually choose, 24 per cent more on the corpus here, and the two columns cross only at the very end, where the count-scored fit has run out of pairs at 137 rows and this one keeps merging to 157. Coverage runs the other way, since at every size the continuation-marked fit gives the sentence back exactly and the end-marked one leaves one piece unspellable because of the z at the end of Alvarez. A shorter reading that has lost a character is not obviously the better reading, which is why length and coverage are reported together.",
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
              "When a longest-match cut fails partway through a word there is no sensible way to continue, because the pieces already chosen were chosen on the assumption that the rest would work out. Handing on lo tells a model something and also something false, and handing on one stand-in is less information and no misinformation.",
            ),
        ],
        },
        {
          title: "Part 5. Two Decisions the Score Does Not Make",
          content: (
            <>
              <SubSection title="17. Two candidates the score cannot separate">
                <p>
                  Go back to the very first merge on the four words. The pair i
                  followed by d scores one third, and so does the pair w followed
                  by i, and for the same reason, since i, d and the word-initial
                  w each occur three times and each of those pairs occurs three
                  times. The rule says take the largest score and there are two
                  largest scores, so at this point the method has run out of
                  instructions.
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
                  A codepoint is deciding which of two equally good rows the
                  vocabulary gets, and every later turn is downstream of that.
                  There is nothing to defend here beyond repeatability; a tie
                  means the rule is indifferent and any answer is as correct as
                  any other.
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
                  The second reading stops at five merges, on a candidate seen
                  twice, and leaves ##est, ##ew, new, newest and widest unlearned
                  although each of them comes from a pair occurring three times or
                  more. So the rule that was meant to keep coincidences out of the
                  vocabulary instead threw away most of the vocabulary, and it did
                  so quietly, since the run reports itself finished. Filtering the
                  candidates gets all ten.
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

              <SubSection title="20. What the ratio is not maximising">
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
                    The count multiplier gives frequent pairs more influence when we estimate a total change. Our teaching implementation instead ranks the per-occurrence association score. That choice favours association over raw frequency. It is not a calculation of the full change in corpus likelihood after refitting the vocabulary probabilities, and should not be presented as one.
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
                  Every merged continuation piece is built out of continuation
                  symbols that are themselves in the vocabulary, so at any
                  position after the first there is always a single-character
                  piece available as a fallback. That means the cut can only fail
                  after the first character if some character has no continuation
                  form at all, and in that case no division of the word succeeds
                  either. The greedy rule therefore refuses nothing that a search
                  would have found.
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
                  All 1,578 of the later refusals are words containing an l or an
                  n after the first character, and those two letters open words in
                  this corpus without ever appearing inside one, so they have no
                  continuation form. What each of those refusals reports is the
                  missing symbol rather than a division the rule failed to find.
                  Where a real vocabulary caps its alphabet and drops rare single
                  characters, that guarantee is gone and the greedy failure
                  becomes reachable, which is an argument for keeping the alphabet
                  complete rather than for searching over divisions.
                </p>
                <KeepInMind>
                  With every symbol of the corpus in the vocabulary in both forms,
                  a greedy left-to-right cut is not an approximation to anything;
                  it succeeds exactly when success is possible. Drop symbols from
                  the alphabet and that stops being true.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. The vocabulary still carries its corpus">
                <p>
                  Changing what makes a pair worth merging does not change where
                  the counts came from. The rows are a summary of one corpus, and
                  whatever that corpus over-represented is cheap forever after,
                  because the vocabulary is fixed before anything that reads it is
                  trained.
                </p>
                <p>
                  Fitted to exhaustion on the eighteen sentences the vocabulary
                  reaches 157 rows and reads its own corpus at 1.91 pieces per
                  word, since analysis, expected and costing are all single rows
                  and so is estimate with its full stop attached. A sentence in
                  the same register but not in the corpus, &ldquo;The dial was set
                  and the diode tested.&rdquo;, costs 2.38 pieces per word. The
                  running sentence, which is about the same subject in the same
                  language, costs 4.14.
                </p>
                <KeepInMind>
                  Two corpora of the same language give two different
                  vocabularies, and neither is wrong. What can be faulted is how
                  badly a vocabulary degrades on text it was not built from, and
                  that is not something the scoring rule can repair.
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
                        "The score becomes the reciprocal of the pair count when the components occur only together. This favours rarer perfectly bound pairs. A minimum count removes candidates below its threshold, but does not remove that preference among the remaining candidates.",
                    },
                    {
                      expression: "a pair seen exactly once",
                      reason:
                        "a decision rather than a fact. Its score is computed from one word, so merging it memorises that word; refusing it means a corpus of entirely distinct words learns nothing. And the refusal has to be a filter on the candidates rather than a test on the winner, or under this score the run ends early with common pairs unmerged.",
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
                        "lost whole rather than in part, because a cut that fails partway has already committed to pieces chosen on the assumption the rest would work. Keeping the successful prefix would hand on a piece in a context it never occurs in; discarding it hands on less and asserts nothing. Both are defensible and they measure differently, since an unspellable word costs one piece here and several under the other scheme.",
                    },
                    {
                      expression: "the shortest reading of a word",
                      reason:
                        "Longest match seeks a left-to-right split and does not in general minimize token count. In the vocabulary tested here, retaining the component symbols ensures a complete split whenever the necessary symbols are available. A vocabulary missing single-symbol fallbacks can require backtracking to find a split that greedy decoding misses.",
                    },
                    {
                      expression: "which of two schemes is better",
                      reason:
                        "not a question the method answers. On the eighteen sentences the count-scored fit is shorter at every practical size, by 66 pieces on the corpus and 6 on the held-out sentence at a vocabulary of 130, and cannot spell that sentence at any size. Length and coverage are separate axes and nothing here combines them.",
                    },
                  ]}
                />
                <KeepInMind>
                  Four of these are decisions rather than limits, namely the
                  tie-break, the count below which a pair is ignored and how that
                  count is applied, which end of a word carries the mark, and what
                  to hand on when a word cannot be spelled. Each has defensible
                  answers on both sides and each changes what the finished
                  vocabulary can and cannot read, so each belongs in whatever
                  describes a tokenizer rather than being left to whoever writes
                  the loop.
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
              "The numerator and both parts of the denominator are counting the same occurrences, so the score is c divided by its own square. Among perfectly bound pairs the rule therefore prefers the rarest, and the division is where that comes from rather than any choice an implementation made.",
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
              "Multiplying the local log-score difference by the number of occurrences changes the ranking. The proxy selects s followed by t at 19.55, while the ratio selects i followed by d at 9.81. This comparison uses fixed shares; it does not claim these are exact refitted corpus likelihood gains.",
              { description: "Compare the measured candidates from the four-word corpus. A score rank of one is best; equal counts are ordered alphabetically.", data: "Pair    Count-weighted proxy    Score rank    Count rank\ns + t   19.55                   4             joint 1\ni + d    9.81                   1             below 1\ne + s   13.83                   below 1       joint 1" },
            ),
            trueFalse(
              "With every symbol of the corpus in the vocabulary in both forms, the greedy left-to-right cut succeeds exactly when some division of the word into vocabulary pieces exists.",
              true,
              "Every merged continuation piece is built out of continuation symbols that are themselves in the vocabulary, so after the first character there is always a single-character fallback, and the cut can only fail where a character has no continuation form at all, in which case no division succeeds either. All 1,578 of the later refusals on the four words contain an l or an n after the first character, two letters that open words there without ever appearing inside one. Where a real vocabulary caps its alphabet and drops rare single characters that guarantee is gone, which is an argument for keeping the alphabet complete rather than for searching over divisions.",
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
  "Print actual vocabulary and merge counts. For the joined corpus, supplied neighbour sentence and Dr. Alvarez sentence, print tokens, whitespace-delimited word count and tokens per word to two decimal places.",
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
question: "How far does a vocabulary specialised to one corpus transfer to nearby text?",
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
