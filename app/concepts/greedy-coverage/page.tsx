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
import { BestTwoRows } from "@/components/widgets/BestTwoRows";
import { CoverClaims } from "@/components/widgets/CoverClaims";
import { CoverageGains } from "@/components/widgets/CoverageGains";
import { CoverageLengths } from "@/components/widgets/CoverageLengths";
import { GreedyCoveragePlayground } from "@/components/widgets/GreedyCoveragePlayground";
import { LengthCeiling } from "@/components/widgets/LengthCeiling";
import { TwoVocabularies } from "@/components/widgets/TwoVocabularies";
import { UnitRivals } from "@/components/widgets/UnitRivals";

export const metadata: Metadata = {
  title: "Greedy Coverage · oop_ml",
  description:
    "There is only so much room in a vocabulary. Instead of choosing the most frequent pair to merge, we can ask which new piece covers the most text that our earlier choices have not already covered.",
};

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function GreedyCoveragePage() {
  return (
    <ConceptPage
      lessonId="greedy-coverage"
      intuition={lessonIntuitions["greedy-coverage"]}
      technicalStart="Part 2. One Turn at a Time"
      openingTitle="Which New Piece Covers the Most Text?"
      playgroundTitle="Which piece covers the most unread text?"
      playgroundIntro="Inspect each candidate's additional coverage after the earlier choices. Compare what changes when coverage is measured using a different unit."
      title="Greedy Coverage"
      tagline={"There is only so much room in a vocabulary. Instead of choosing the most frequent pair to merge, we can ask which new piece covers the most text that our earlier choices have not already covered."}
      prerequisites={
        <>
          Two things from earlier in this section. Something has already decided
          where the words are before any of this runs, so everything below takes
          a text cut into words on its spaces and asks what the pieces{" "}
          <em>inside</em> a word should be. And you will get more from this page
          having read the one on byte pair encoding, since the whole argument
          here is with the rule that page describes. No probability appears
          below, and no calculus. Counting positions, and one classical result
          about counting them greedily, is the whole of it.
        </>
      }

      playground={<GreedyCoveragePlayground />}
      sections={[
        {
          title: "Part 1. What Merging Was Maximising",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The corpus, the sentence, and what is being chosen">
                <p>
                  Suppose our vocabulary has room for only a few reusable pieces. A piece is useful if it can spell positions in the words we need to represent. Once another selected piece already handles those positions, counting them again would exaggerate the next candidate’s benefit. That is the coverage question this lesson investigates.
                </p>
                <p>
                  We use the same two corpora as the merging lessons. The small corpus has low five times, lower twice, newest six times and widest three: sixteen word occurrences. The larger corpus has eighteen report-related sentences, with 72 distinct words across 133 occurrences. Neither contains the sentence we will test.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>
                  Each word is written out as its characters, and the last
                  character of each word carries a mark saying a space follows
                  it, which is what keeps a piece that ends a word apart from the
                  same letters inside one. Counted that way the four words hold
                  79 positions, weighted by how often each word occurs, and the
                  eighteen sentences hold 648. Those two numbers are what a
                  vocabulary is being asked to cover, and they are the quantity
                  every measurement below is a fraction of.
                </p>
                <KeepInMind>
                  A position is one symbol of one occurrence of a word, so a
                  symbol inside a word seen six times is worth six positions. The
                  whole of this page is an argument about how to spend a budget
                  of vocabulary rows on those positions.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A pair that merges often is not a piece that covers a lot">
                <p>
                  Merging scores a candidate by how many times two symbols sit
                  next to each other, and it can only ever consider two symbols
                  at a time, because that is what a merge is. On the eighteen
                  sentences the winner of that contest is h followed by the
                  marked e, adjacent 31 times, and the runners-up are t followed
                  by h at 20, r followed by e at 17, and T followed by h at 12.
                  Nothing longer is in the running, since nothing longer exists
                  yet.
                </p>
                <>
                  <p>
                    Coverage multiplies a candidate’s occurrence count by the number of
                    symbol positions it covers.
                  </p>
                  <Equation>{"he:      31 × 2 = 62\nanalys:   7 × 6 = 42\nexpecte:  5 × 7 = 35\nre:      17 × 2 = 34"}</Equation>
                  <p>
                    The most frequent pair still wins here, but the remaining order
                    changes. Longer pieces can cover more text despite occurring less
                    often.
                  </p>
                </>
                <NumberTable
                  headings={["candidate", "occurs", "positions each", "covers"]}
                  rows={[
                    ["he⎵", "31", "2", "62"],
                    ["analys", "7", "6", "42"],
                    ["expecte", "5", "7", "35"],
                    ["re", "17", "2", "34"],
                    ["was⎵", "8", "3", "24"],
                    ["cos", "7", "3", "21"],
                  ]}
                  caption="The first six pieces chosen on the eighteen sentences, with the arithmetic that chose them. A trailing ⎵ marks a piece that ends a word."
                />
                <>
<p>
                  The difference is not a refinement of the same idea. A merge count answers how many pieces one join removes from the corpus, which for a pair is how often the pair occurs; a coverage figure answers how much of the corpus a row of the table would account for, which is that occurrence count multiplied by the length of the piece.
                </p>
                <p>
                  Merging cannot ask the second question at all, because it has no candidate longer than two symbols to ask it about, and reaches analys only by making five separate joins and scoring each of them on its own.
                </p>
</>
                <KeepInMind>
                  Frequency and coverage are two different numbers, and on this
                  corpus they disagree from the second candidate onward. A piece
                  seen 7 times can be worth more than a pair seen 17 times, since
                  it is three times as long.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The objective, stated plainly">
                <p>
                  So state the thing the vocabulary is for, and then choose to
                  maximise it. Every position in every word should lie under some
                  piece of more than one symbol, because a position left bare is a
                  whole token spent on one character. A vocabulary of a given size
                  is good to the extent that it covers those positions, and each
                  word counts as often as it occurs.
                </p>
                <Equation>{"covers(p)  =  Σ over words w   count(w) × (positions of w that p claims)"}</Equation>
                <p>
                  The rule is then the shortest one on this site. Take the
                  candidate covering the most positions nothing has covered yet,
                  add it to the vocabulary, and repeat until the budget is spent
                  or nothing is left to cover. Candidates are every run of two or
                  more symbols the corpus contains. Single symbols are not
                  candidates, since the alphabet is in the vocabulary anyway and a
                  single symbol covers nothing that was not already going to be
                  its own token.
                </p>
                <Equation>{"take   argmax over candidates p   covers(p) restricted to positions still bare"}</Equation>
                <KeepInMind>
                  There are no merges here, no probabilities and no likelihood. A
                  piece is in the vocabulary because at the moment it was chosen
                  it covered more of what was still bare than anything else did.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. One Turn at a Time",
          content: (
            <>
              <SubSection title="4. What a piece covers, and what it leaves bare">
                <p>
                  To apply a piece, scan the word from the left. When it matches positions that are still unclaimed, claim them and move past the match. Otherwise move forward one position and try again. We apply selected pieces in their selection order before evaluating a new candidate, so earlier choices affect which positions remain available. The model must retain that order to repeat the same encoding.
                </p>
                <WorkedExample title="The word widest, and two candidates for it">
                  <>
                    <p>
                      Widest has six symbol positions and appears three times. The
                      marked ending est covers three of those positions. It also appears
                      in newest, which occurs six times.
                    </p>
                    <Equation>{"ending in widest = 3 positions × 3 occurrences = 9\nending in both words = 3 × (3 + 6) = 27\nwhole widest = 6 × 3 = 18"}</Equation>
                    <p>
                      The shorter piece wins because its coverage across more words
                      outweighs the extra positions covered by the whole word.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  A candidate is scored against what is left rather than against
                  the bare corpus, so its value falls as other pieces are chosen.
                  A piece worth 27 at the first turn can be worth nothing at the
                  third.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The first pick on four words">
                <>
<p>
                  Run the rule on low, lower, newest and widest and the first turn goes to newest with its mark, six positions in a word seen six times, which covers 36. Its nearest rivals are ewest with the mark and newes, both five positions in the same six occurrences and worth 30, and then est with the mark, three positions across nine occurrences and worth 27.
                </p>
                <p>
                  Merging&rsquo;s own first choice on this corpus is the pair e followed by s, which appears nine times; here that pair is not even a separate candidate, since every run containing it is one.
                </p>
</>
                <CoverClaims />
                <>
                  <p>
                    Drag the control and watch covered positions fill. The marked ending
                    est loses the first turn to newest because the complete word covers
                    more weighted positions.
                  </p>
                  <Equation>{"newest = 6 × 6 = 36\nmarked est = 3 × 9 = 27"}</Equation>
                  <p>
                    This choice comes from the coverage objective. It makes no judgment
                    about which candidate is a meaningful word or suffix.
                  </p>
                </>
                <KeepInMind>
                  The first piece chosen on this corpus is a whole common word.
                  That is the objective working correctly rather than a
                  degenerate case, since a whole word is exactly the piece that
                  covers the most of its own occurrences.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The next three, and where the corpus runs out">
                <>
                  <p>
                    Once newest is selected, positions it covers no longer earn credit
                    for overlapping candidates. The marked ending can now earn credit
                    only in widest, so the next choice is the whole word. The remaining
                    choices finish the coverage.
                  </p>
                  <Equation>{"newest: 6 × 6 = 36\nwidest: 6 × 3 = 18\nlow:    3 × 5 = 15\nlower:  5 × 2 = 10\ntotal covered = 36 + 18 + 15 + 10 = 79"}</Equation>
                  <p>
                    Those four selections cover every weighted symbol position in this
                    corpus.
                  </p>
                </>
                <DerivationTable
                  expressionHeading="the turn"
                  reasonHeading="what it covered, and why"
                  rows={[
                    { expression: "newest⎵  36", reason: "six positions in a word seen six times, the largest product available" },
                    { expression: "widest⎵  18", reason: "six positions in a word seen three times; its ending had shared nine occurrences until the first turn took six of them" },
                    { expression: "low⎵  15", reason: "three positions in a word seen five times. The unmarked low never wins, since the word low ends in a marked w and does not contain it" },
                    { expression: "lower⎵  10", reason: "five positions in a word seen twice, and after it nothing is bare" },
                  ]}
                />
                <p>
                  The fit then stops, at 16 tokens, however many were asked for.
                  There is no candidate left that covers a position, so asking for
                  40 rows or 300 gives the same four pieces. That is the same shape
                  of ceiling merging has, where the loop runs out of pairs seen
                  twice, arrived at from a different direction. Here the ceiling is
                  reached when the corpus is entirely covered.
                </p>
                <KeepInMind>
                  The size asked for is an upper bound and not a promise. What is
                  actually learned is a fact about the corpus, and on four words
                  the corpus is exhausted after four pieces.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Encoding replays the pieces, and there is no ladder under them">
                <p>
                  To read a new word, spell it in symbols and apply the chosen
                  pieces in rank order, exactly as the fit did. Whatever a piece
                  claims is a token; whatever stays bare is a single symbol. So
                  lower comes back as one piece, and the unseen unwidest comes back
                  as u, then n, then widest with its mark, because the chosen piece
                  really does occur inside it.
                </p>
                <WorkedExample title="lowest, which those four words never contained">
                  <>
<p>
                    Spelled out it is l, o, w, e, s and the marked t. None of the four chosen pieces occurs in it. Low with its mark cannot apply, since it needs a marked w and lowest carries a bare w in the middle; lower with its mark needs a marked r; and the two long pieces are not there at all.
                  </p>
                  <p>
                    So the answer is six single symbols, none of the six positions covered. A merged vocabulary of the same size answers the same word in three pieces, because it built est with the mark on the way to newest and kept it.
                  </p>
</>
                </WorkedExample>
                <p>
                  Merging creates longer pieces through intermediate pieces, retaining those earlier entries as possible fallbacks. The coverage rule selects a whole candidate for the positions it newly covers. Once a larger piece already covers those positions, selecting a smaller piece within it adds no coverage there. This difference follows from what the two selection objectives reward.
                </p>
                <KeepInMind>
                  The chosen pieces are not built from one another, so nothing
                  guarantees that a prefix of a chosen piece is also in the
                  vocabulary. A word that nearly matches gets no credit for
                  nearly.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "How does coverage score a candidate?",
              [
                "Its occurrence count multiplied by the number of symbol positions it covers",
                "How many times its two symbols sit next to each other",
                "Its occurrence count on its own",
                "The number of distinct words it turns up in",
              ],
              0,
              "On the eighteen sentences he scores 31 × 2 = 62 and analys scores 7 × 6 = 42, which puts a piece seen 7 times above the pair re seen 17 times. A merge count answers how many pieces one join removes from the corpus; a coverage figure answers how much of the corpus a row of the table would account for.",
            ),
            trueFalse(
              "On the four words the first turn goes to the marked ending est, because it reaches two of them.",
              false,
              "Newest with its mark wins, six positions in a word seen six times for 36, against the ending’s 3 × 9 = 27. The first piece chosen is a whole common word, which is the objective working correctly rather than a degenerate case, since a whole word is exactly the piece that covers the most of its own occurrences.",
            ),
            trueFalse(
              "Asking for 300 rows on the four-word corpus gives the same four pieces as asking for 40.",
              true,
              "Newest, widest, low and lower cover 36, 18, 15 and 10 positions, which is all 79, so no candidate is left that covers anything and the fit stops at 16 tokens however many were asked for. The size asked for is an upper bound and not a promise. Merging has the same shape of ceiling reached from the other direction, when its loop runs out of pairs seen twice.",
            ),
            choice(
              "Handed lowest, the four chosen pieces answer six single symbols. Why?",
              [
                "None of the four occurs in it, since low needs a marked w and lower needs a marked r",
                "Lowest is longer than any piece in the vocabulary",
                "The pieces are applied from the right, and lowest ends differently",
                "Lowest was in the corpus, so its positions had already been claimed",
              ],
              0,
              "A merged vocabulary of the same size answers that word in three pieces, because it built the marked est on the way to newest and kept it. Coverage buys pieces outright and buys no rungs, since a rung covers positions its parent already covers and is therefore worth nothing the moment the parent is in.",
            ),
            several(
              "Which of these follow from scoring a candidate against what is still bare?",
              [
                "A piece worth 27 at the first turn can be worth nothing at the third",
                "The order the pieces were chosen in is part of the model rather than an accident of the fit",
                "Nothing guarantees that a prefix of a chosen piece is also in the vocabulary",
                "A bare position can always be bought, since single symbols are candidates too",
              ],
              [0, 1, 2],
              "The tokenizer applies selected pieces first, in their learned order, and scores later candidates on the unclaimed spans that remain. Single symbols are already available as fallbacks, so the selection stage considers longer pieces. A chosen piece can prevent another candidate from using an overlapping span.",
            ),
        ],
        },
        {
          title: "Part 3. When a Coverage Guarantee Applies",
          id: "part-3-a-hard-problem-with-a-known-guarantee",
          content: (
            <>
              <SubSection title="8. Why choosing the best combination is difficult" id="8-choosing-the-best-set-is-not-something-anyone-can-do">
                <p>
                  Choosing the largest immediate gain may rule out a better combination later. To understand that difficulty, first consider a related mathematical problem: choose up to k sets of positions to maximize the weight of their union. We will then check how its assumptions compare with this tokenizer&apos;s rules.
                </p>
                <>
<p>
                  That set problem is weighted maximum coverage. Its general form is NP-hard, so no polynomial-time exact algorithm is known for all inputs. This does not make an exact answer impossible: exhaustive search and other exact methods can solve suitable instances. The difficulty is how the work grows in the worst case.
                </p>
                <p>
                  The eighteen sentences supply 815 candidate pieces, and this fit selects 69. Enumerating every possible selection of that size would be an enormous search. Greedy selection gives us a manageable procedure, while leaving open how far its result is from the best achievable one.
                </p>
</>
                <KeepInMind>
                  Exact methods can be useful for small cases. We will use one below to check a two-piece result. For larger cases, a guarantee needs a theorem whose assumptions match the actual objective and selection rule.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What the guarantee promises, and what it does not">
                <>
<p>
                  For ordinary weighted set coverage, selecting a candidate adds every position in its set to a union. Overlaps are allowed and each position&apos;s weight is counted once. This objective is monotone: adding a set cannot lower coverage. It is submodular: the same set can add no more to a larger union than to a smaller union contained within it.
                </p>
                <p>
                  For a nonnegative monotone submodular objective that is zero for the empty set, selecting the largest marginal gain at each step has the following bound under a budget of k equally costly selections:
                </p>
</>
                <Equation>{"greedy coverage after k turns   ≥   (1 − 1/e) × best coverage any k pieces reach"}</Equation>
                <>
<p>
                  This is a worst-case bound of about 0.632 relative to the best selection of the same size. It applies to the weighted-union formulation just described. Our tokenizer adds a different constraint: an occurrence must lie wholly on unclaimed positions, and pieces are applied in rank order. A partial overlap rejects the entire occurrence instead of adding its still-uncovered positions. The theorem therefore does not establish this bound for the tokenizer.
                </p>
                <p>
                  Even for the weighted-union problem, the bound concerns covered positions. It does not bound the number of tokens needed to encode new text. We need to measure that separately, using text beyond the training corpus.
                </p>
</>
                <WhyThisWorks title="Where the fraction comes from">
                  <>
<p>
                    In the weighted-union problem, let the best k sets cover weight B. If our current coverage is C, those optimal sets together can still add at least the remaining gap. At least one can therefore add a kth of that gap. Greedy selection chooses a set with a gain at least that large.
                  </p>
                  <p>
                    Each selection reduces the remaining gap to at most the fraction shown below. Applying that relation k times gives the stated coverage bound. The proof depends on being able to add a set&apos;s uncovered positions even when other positions in that set are already covered.
                  </p>
                  <Equation>{"gap after one more selection ≤ (1 − 1/k) × current gap\ngap after k selections ≤ B(1 − 1/k)^k ≤ B/e\ncoverage after k selections ≥ B(1 − 1/e)"}</Equation>
</>
                </WhyThisWorks>
                <KeepInMind>
                  Here is where the tokenizer differs. In the symbols a b c d, choosing b c first blocks a b c, leaving a and d as single symbols. Choosing a b c first covers three positions and blocks b c. The same two pieces give different coverage in different orders. This is not the order-independent union used in the proof.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Where the rule falls short, on two words">
                <p>
                  Let&apos;s check a small tokenizer case directly. Take costing three times and costly three times, giving 39 symbol positions. The best first piece is cost, covering four positions in each of six word occurrences. With two selections allowed, the greedy rule takes cost and then the marked ending ing, reaching 33 positions.
                </p>
                <BestTwoRows />
                <>
<p>
                  Enumerating the possible pairs finds a better result: the two whole words cover all 39 positions. Greedy selection reaches 84.6% of that coverage. The first choice had the largest immediate gain, but it prevented the better two-piece combination.
                </p>
                <p>
                  Encoding length shows another cost. With the greedy pieces, the six word occurrences require 15 tokens; costly becomes cost followed by l and a marked y. With the two whole words, they require six tokens. Coverage and encoded length describe different aspects of the result.
                </p>
</>
                <KeepInMind>
                  Greedy choice is optimal at one piece and can be beaten from two
                  onward. Here the shortfall is 6 positions in 39 and 9 pieces in
                  15, and nothing in the rule could have seen it coming, since at
                  the moment of choosing, cost really was the best piece available.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Unit the Covering Is Counted In",
          content: (
            <>
              <SubSection title="11. A position, or the characters underneath it">
                <p>
                  The objective says to cover the most text, and there are two
                  defensible readings of what a covered amount of text is. One
                  counts positions of the spelled word, so the marked final symbol
                  of a word is one position like any other. The other counts
                  characters, and then the marked final symbol stands for two
                  things, the letter and the fact that a word ended, so it is worth
                  two.
                </p>
                <Equation>{"in positions    t⎵  is  1\nin characters   t⎵  is  2, the letter and the boundary"}</Equation>
                <p>
                  Neither reading is wrong, and the difference is not uniform. It
                  adds exactly one to every candidate that ends a word, once per
                  occurrence, and nothing to a candidate that does not. So a short
                  suffix gains proportionally more than a long word does, and the
                  ordering of two candidates can change. Whether it does is a
                  question about a corpus rather than about the rule.
                </p>
                <KeepInMind>
                  The unit has to be stated, because both readings are natural and
                  they are not the same function. Everything else on this page
                  counts positions, which is the reading that treats a symbol of
                  the spelled word as the unit of account.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Counting the end marker for both candidates" id="12-the-two-units-on-the-four-words-where-i-expected-a-tie">
                <>
                  <p>
                    It is easy to count the extra end marker for the short ending and overlook it for the whole word. Apply the same character-counting convention to both candidates:
                  </p>
                  <Equation>{"marked est, counting characters = 4 × 9 = 36\nmarked newest, counting characters = 7 × 6 = 42"}</Equation>
                  <p>
                    There is no tie. The longer word gains from the changed unit too.
                    The marked ewest candidate also reaches 36, which still leaves it
                    below newest.
                  </p>
                </>
                <UnitRivals />
                <>
<p>
                  The run selects the same four pieces in the same order, now with scores of 42, 21, 20 and 12 instead of 36, 18, 15 and 10. The unit changes every score here without changing a selection. We need a different comparison to see when the unit can change the winner.
                </p>
                <p>
                  Both leading candidates end a word, so both collect one extra character per occurrence, which is worth 6 to newest and 9 to the ending. The ending does gain more, and the gap it had to close was 9, so closing it by 3 leaves it 6 behind.
                </p>
</>
                <KeepInMind>
                  Counting characters does not, on these four words, choose a
                  different piece. A shorter candidate gains more from the change
                  than a longer one does, which is why a flip is possible at all,
                  and here it gains three and needed nine.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Six words where the unit really does decide">
                <p>
                  For the winner to change, the extra weight must close the original score gap. A word-final candidate can gain on an internal one because only the former contains the marker. Try test, rest and best three times each, against stem, stop and stub five times each. This corpus has 96 symbol positions and 120 characters under the two conventions.
                </p>
                <>
                  <p>
                    The second corpus exposes a difference that the first did not. The
                    opening st occurs fifteen times, while the marked ending est occurs
                    nine times. Counting the end marker as a separate character changes
                    only the latter’s length.
                  </p>
                  <Equation>{"symbol positions: st = 2 × 15 = 30; marked est = 3 × 9 = 27\ncharacters:       st = 2 × 15 = 30; marked est = 4 × 9 = 36"}</Equation>
                  <p>
                    The winner changes. Switch to the second corpus in the widget to
                    compare both columns.
                  </p>
                </>
                <NumberTable
                  headings={["candidate", "occurs", "in positions", "in characters"]}
                  rows={[
                    ["st", "15", "30 ←", "30"],
                    ["est⎵", "9", "27", "36 ←"],
                    ["stem⎵", "5", "20", "25"],
                    ["st⎵", "9", "18", "27"],
                  ]}
                  caption="Two units, one corpus, different first pieces. The arrow marks the leader in each column, and neither margin is a tie, so no tie-break is involved."
                />
                <p>
                  The consequence runs past the first turn. Counting positions the
                  run is st at 30 then est with its mark at 27; counting characters
                  it is est with the mark at 36 then st at 30. Both vocabularies
                  end up holding both pieces, and they hold them in the opposite
                  order, which matters because the order is what encoding replays.
                  A word that contains both is cut differently by the two.
                </p>
                <KeepInMind>
                  The unit is a decision the rule does not make, and on a corpus
                  where a common ending competes with a common opening it decides
                  which is bought first. Any description of this scheme that omits
                  the unit has left out something that changes the vocabulary.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "For ordinary weighted set coverage, what does the 1 − 1/e guarantee promise?",
              [
                "After k selections, greedy weighted-union coverage reaches at least 0.632 of the optimal coverage using up to k sets",
                "That the rule covers at least 0.632 of every position in the corpus",
                "That the resulting text is at most 1/0.632 times the shortest reading possible",
                "That the rule is within 0.632 of the best set on a typical corpus",
              ],
              0,
              "For nonnegative weighted set coverage, the bound compares greedy union coverage with the best union under the same selection budget. It gives no bound on encoded sequence length. The tokenizer's rejection of partially overlapping occurrences changes the problem, so we cannot transfer the guarantee to it.",
            ),
            several(
              "In ordinary weighted set coverage, what do monotonicity and submodularity mean?",
              [
                "Adding a piece never lowers the coverage",
                "A set adds no more weight to a larger union than to a smaller union contained within it",
                "The bound they give is on how long the resulting text will be",
                "The greedy rule is therefore optimal at every size",
              ],
              [0, 1],
              "Adding a set cannot reduce a union's coverage. As that union grows, more of the new set's positions may already be counted, so its marginal contribution cannot increase. These properties apply to set union. Rejecting a whole occurrence because part overlaps, as the tokenizer does, needs a separate analysis.",
            ),
            choice(
              "On costing and costly, three times each, the rule spends two pieces and reaches 33 of the 39 positions. What does the best pair do?",
              [
                "Covers all 39, and reads the six word occurrences in 6 pieces against the rule’s 15",
                "Covers all 39, and reads them in 15 pieces as well",
                "Covers 36, and reads them in 9 pieces",
                "Covers 33, so the rule was already optimal",
              ],
              0,
              "The two whole words cover all 39 positions and encode the six word occurrences in six tokens. The greedy result covers 33 positions and needs 15 tokens. This small exhaustive comparison shows the cost of an immediate choice without relying on a guarantee for a different coverage problem.",
            ),
            trueFalse(
              "Counting characters rather than positions makes the marked ending est tie with newest on the four words.",
              false,
              "Both candidates contain an end marker. Counting that extra character raises newest's score from 36 to 42 and the ending's from 27 to 36. The ending gains more, but newest remains ahead by six.",
            ),
            choice(
              "Where does the unit genuinely change what gets bought?",
              [
                "On test, rest and best against stem, stop and stub, where the opening st and the marked ending est swap places",
                "On the four words, where the whole run comes out in a different order",
                "Nowhere, since the extra character is added to every candidate alike",
                "On the eighteen sentences, where the first turn changes hands",
              ],
              0,
              "The extra character goes to word-final candidates only, so a flip needs a word-final candidate close behind a word-internal one. Counting positions the run is st at 30 then the marked est at 27; counting characters it is the marked est at 36 then st at 30, and both vocabularies hold both pieces in the opposite order, which matters because the order is what encoding replays.",
            ),
        ],
        },
        {
          title: "Part 5. The Vocabulary This Produces, and What It Costs",
          content: (
            <>
              <SubSection title="14. Eighteen sentences, and the pieces that come out">
                <p>
                  On the larger corpus the rule runs for 69 turns before nothing is
                  left to cover, reaching 121 tokens in all, and it covers 576 of
                  the 648 positions. The 72 that stay bare are positions no run of
                  two or more symbols can reach any more, which are the leftovers
                  between chosen pieces.
                </p>
                <CoverageGains />
                <p>
                  In this run the selected gains begin 62, 42, 35, 34, 24, 21, 21 and 16, then continue down to twos. Equal adjacent values mean the selected pieces contributed the same amount on their respective turns. This profile describes the measured run; it is not a proof that the tokenizer&apos;s order-dependent objective is submodular.
                </p>
                <KeepInMind>
                  As pieces claim spans, they remove opportunities from overlapping candidates. Inspect the recorded gains to see how that affects this corpus. The weighted-union theorem above cannot by itself establish a guarantee for these non-overlapping selections.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Two vocabularies of the same size">
                <p>
                  Ask both methods for 100 tokens on this corpus and both learn 48
                  rows above the same 51-symbol alphabet, which makes the
                  comparison a fair one. Twelve of the 96 rows are shared. The rest
                  are not, and the difference has a clear shape rather than being
                  scattered.
                </p>
                <TwoVocabularies />
                <p>
                  Eighteen of the 48 rows chosen by coverage are whole words of the
                  corpus, against 8 of merging&rsquo;s 48, and the mean piece is
                  3.77 characters long against 3.04. Merging&rsquo;s vocabulary is
                  full of the rungs it climbed, aly and analy and analysi on the way
                  to analysis, ex and exp and ecte on the way to expected. Coverage
                  holds analys and expecte and nothing else from either family,
                  because once analys is in, no shorter piece inside it is worth
                  anything.
                </p>
                <InAModel>
                  <p>
                    The two vocabularies favour different kinds of pieces in this experiment. Their objectives help explain the preference, but eighteen sentences cannot establish which will encode a much larger training or held-out corpus more efficiently. That comparison needs its own data and evaluation.
                  </p>
                </InAModel>
                <KeepInMind>
                  Two methods at 100 rows on one corpus produced 48 rows each and
                  agreed on 12. What a vocabulary is made of is decided by what is
                  being maximised, and both are answering their own question
                  correctly.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. What the training corpus costs">
                <p>
                  Read the corpus the pieces were chosen from and coverage wins at
                  every size, which it ought to, since covering that corpus is
                  precisely what it was maximising. At 60 tokens it reads the 133
                  word occurrences in 475 pieces against merging&rsquo;s 531; at
                  100 it is 296 against 344; at 121, where it has run out of
                  positions, it is 267 against 295.
                </p>
                <CoverageLengths />
                <p>
                  That is 56 pieces saved at 60 tokens, 48 at 100 and 28 at 121,
                  and it is a direct consequence of buying long pieces. A row that
                  covers six positions removes five pieces from the corpus every
                  time it is used, where a row that covers two removes one. The two
                  ceilings differ as well, since coverage stops at 121 tokens when
                  the corpus is covered and merging continues to 137 before it runs
                  out of pairs seen twice.
                </p>
                <KeepInMind>
                  On the corpus it was chosen from, this vocabulary is shorter at
                  every size tried. That result is not evidence of anything, since
                  it is the objective reporting on itself, and the next section is
                  where the question is actually asked.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What the held-out sentence costs, which is where this is worse">
                <>
<p>
                  Switch the widget above to the sentence none of the eighteen contained and the ordering changes hands. Up to 65 tokens coverage is still ahead, reading the sentence in 35 pieces at 60 where merging needs 39. At 70 they have crossed, 35 against 32, and merging leads at every larger size, 32 against 28 at 80, 32 against 27 at 100, and 30 against 25 at 121.
                </p>
                <p>
                  This is the place on the page where the method is worse than the one it is offered against, and the margin is 5 pieces on a sentence of seven words.
                </p>
</>
                <NumberTable
                  headings={["vocabulary", "corpus, by coverage", "corpus, by merging", "sentence, by coverage", "sentence, by merging"]}
                  rows={[
                    ["52", "648", "648", "45", "45"],
                    ["60", "475", "531", "35", "39"],
                    ["70", "404", "460", "35", "32"],
                    ["80", "359", "414", "32", "28"],
                    ["100", "296", "344", "32", "27"],
                    ["121", "267", "295", "30", "25"],
                  ]}
                  caption="Both counted in pieces, both fitted on the same eighteen sentences. At 52 rows both vocabularies are the alphabet and agree exactly."
                />
                <p>
                  Reading either pair of columns alone settles the question the
                  wrong way. The corpus columns say coverage is better at every
                  size and the sentence columns say merging is better from 70
                  onward, and both are correct measurements of different things.
                  Which one to believe depends entirely on whether the text a model
                  will read resembles the text the vocabulary was chosen from.
                </p>
                <KeepInMind>
                  The training corpus and a held-out sentence disagree about which
                  method is better, and they disagree at every size above the
                  crossover. The crossover here is at 70 tokens, which is well
                  below any size a person would actually choose.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Why a long piece is a brittle piece">
                <p>
                  The reason for that reversal is one word, and switching the
                  comparison widget to its second panel shows it. The corpus uses
                  expected and never the bare stem, so coverage buys expecte, seven
                  positions across five occurrences. Handed expected it answers two
                  pieces. Handed expect, which the corpus does not contain, it
                  answers e, x, p, e, c and the marked t, six single letters,
                  because expecte is not inside expect and nothing shorter was ever
                  bought.
                </p>
                <p>
                  Merging, at the same size, answers expect in three pieces, exp
                  and ec and the marked t, all of which are rungs it climbed on the
                  way to expected and kept. The same happens to analysis, which
                  coverage reads as analys and the marked is where merging reads it
                  whole. Counted across the sentence about Dr. Alvarez, 24 of coverage&rsquo;s
                  32 pieces are bare single symbols against 17 of merging&rsquo;s
                  27.
                </p>
                <NumberTable
                  headings={["word", "by coverage", "by merging"]}
                  rows={[
                    ["expected, in the corpus", "expecte + d⎵", "expected⎵"],
                    ["expect, not in the corpus", "6 single letters", "exp + ec + t⎵"],
                    ["analysis", "analys + is⎵", "analysis⎵"],
                  ]}
                  caption="The same two vocabularies of 100 tokens, reading three words. Coverage is one piece behind on the words the corpus holds and three behind on the word it does not."
                />
                <p>
                  So the length that wins on the training corpus is the same length
                  that loses on new text, and it is one property rather than two. A
                  piece of seven symbols covers seven positions wherever it occurs
                  and occurs in fewer distinct words than a piece of three. Nothing
                  in the objective values the ability to fall back gracefully,
                  since falling back never happens on the corpus being covered.
                </p>
                <KeepInMind>
                  Coverage buys length, and length is exactly what an unseen word
                  fails to match. Merging&rsquo;s rungs are not chosen for that
                  purpose either; they are a side effect of the way it builds, and
                  they turn out to be worth 5 pieces on this sentence.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What Coverage Leaves Out of a Word" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="19. Coverage has no opinion about what a piece is for">
                <p>
                  The objective is a statement about positions and counts, and
                  there is nothing else in it. It cannot prefer a piece that
                  corresponds to a prefix, a stem or a syllable over one that does
                  not, because it has no representation of any of those. A piece is
                  a run of symbols that appears often enough and is long enough,
                  and every run of symbols in the corpus is a candidate on equal
                  terms.
                </p>
                <p>
                  That is not a complaint about the rule; it is the content of the
                  definition. On the eighteen sentences the rule buys expecte,
                  which is the stem expect with the first letter of its ending
                  glued on, and analys, which is analysis with its last two letters
                  missing. Both are correct answers to the question asked, and both
                  would be rejected by anybody dividing those words by hand. The
                  information that would settle it is not in the objective, and
                  adding it means changing what is maximised rather than tuning
                  anything.
                </p>
                <KeepInMind>
                  A vocabulary that is optimal by this measure need not be good for
                  a model, since the measure never mentions a model. It answers how
                  much text is accounted for and nothing about how the accounting
                  is divided.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. A word seen once covers as much as a word seen often">
                <p>
                  Length and frequency enter the objective as a product, so they
                  substitute for one another freely. A word of eight symbols seen a
                  single time is worth 8, and a pair of symbols seen four times is
                  worth 8 as well, and the rule cannot distinguish them. Merging
                  can, and does, since its usual stopping condition refuses any pair
                  seen fewer than twice.
                </p>
                <p>
                  Of the 72 distinct words in the eighteen sentences, 54 occur
                  exactly once. At 100 tokens, 10 of the 48 rows coverage chose are
                  whole words seen once, among them Tuesday with its full stop,
                  Monday with its full stop, dropped, August and Nobody. At 121
                  tokens it is 13 of 69. Merging, at every one of those sizes,
                  spends none.
                </p>
                <NumberTable
                  headings={["vocabulary", "rows above the alphabet", "rows on words seen once, by coverage", "by merging"]}
                  rows={[
                    ["80", "28", "4", "0"],
                    ["100", "48", "10", "0"],
                    ["121", "69", "13", "0"],
                  ]}
                  caption="Fifty-four of the seventy-two distinct words occur exactly once. A row spent on one of them shortens the training corpus once and can never be used on any other text."
                />
                <p>
                  Whether that is memorisation or good value is genuinely open, and
                  the answer differs by which text is being read. On the corpus
                  those rows earn their keep, since a whole word bought as one row
                  removes every position of it but one. On any other text they are
                  dead weight, and
                  they are dead weight that displaced a shorter, commoner piece
                  which would have earned something everywhere. Merging&rsquo;s
                  frequency floor is a decision about the same question, made in the
                  other direction and made without measuring.
                </p>
                <KeepInMind>
                  The objective offers no way to say that a piece seen once is worth
                  less than a piece seen often, because a longer piece makes up the
                  difference exactly. Any frequency floor is a rule imposed from
                  outside.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. How long a piece may be, which nothing decides">
                <p>
                  We can test a possible repair by limiting candidate length. Currently candidates can contain any run of two or more symbols. A shorter maximum would rule out some whole-word entries and force selection among shorter pieces. The objective does not choose that limit for us, and the two evaluations below need not favour the same setting.
                </p>
                <LengthCeiling />
                <>
<p>
                  At the same 100 tokens, allowing pieces of any length reads the corpus in 296 pieces and the held-out sentence in 32. Capping at five symbols reads the corpus in 324 and the sentence in 28, which is 28 pieces worse on the corpus and 4 better on the sentence, and it cuts the rows spent on words seen once from 10 to 2.
                </p>
                <p>
                  Capping at three goes too far in that direction, 384 and 29. Past eight the ceiling stops binding at all, since the pieces the rule wanted were shorter than that anyway.
                </p>
</>
                <KeepInMind>
                  The longest piece allowed is a real dial and the objective is
                  silent about it. On this corpus one setting is best for the text
                  the pieces were chosen from and a different one is best for the
                  text they were not, which is the same disagreement Part 5 found,
                  arriving through a different door.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Meaning, tied choices and the size of the vocabulary" id="22-where-the-method-has-nothing-to-say">
                <p>Covering more character positions does not tell us whether a piece is a useful word part. The cases below separate the coverage objective from the decisions about ties, vocabulary size and which pieces we allow.</p>
                <DerivationTable
                  expressionHeading="Coverage decision"
                  reasonHeading="What the objective does and does not settle"
                  rows={[
                    { expression: "the unit a covering is counted in", reason: "undecided by the objective, which says to cover the most text and does not say what text is measured in. Counting positions and counting characters are both natural and differ by one per word-final position; on three endings against three openings the first is chosen by the second, at 30 against 27 one way and 36 against 30 the other." },
                    { expression: "two candidates covering the same amount", reason: "the objective is indifferent, so no answer is more correct. A choice must be made and any choice is arbitrary; taking the lexicographically smaller at least makes the fit repeatable, where taking whichever was met first makes it depend on the order the words arrived in. Ties are common rather than rare here, and on the eighteen sentences thirteen consecutive turns were each worth exactly two." },
                    { expression: "the best set of a given size", reason: "Greedy selection does not search every combination. Exact search on the small two-word case finds a pair covering six more positions than the greedy pair. Larger cases require a choice of search method and computational budget." },
                    { expression: "how far short the rule can fall", reason: "The 1 − 1/e theorem applies to ordinary weighted set union. This tokenizer rejects partially overlapping occurrences and depends on selection order, so that theorem supplies no bound for its result. The two-word example reaches 84.6% of the best pair's coverage by direct measurement." },
                    { expression: "how long a text will be", reason: "Measure encoded length separately from coverage. Here a coverage vocabulary encodes the training corpus in 296 pieces but needs 32 for a held-out sentence. A merged vocabulary of the same size needs 27 for that sentence." },
                    { expression: "the longest a piece may be", reason: "a decision with no answer in the objective. Uncapped, the rule buys whole words; capped at five symbols on the eighteen sentences it reads the corpus 28 pieces longer and the held-out sentence 4 pieces shorter. Which of those is the right trade is a fact about the text a model will read." },
                    { expression: "a word the corpus saw exactly once", reason: "worth covering, and by construction worth exactly as much as a short piece seen several times, since the objective multiplies length by count. Refusing such a piece is a frequency floor imposed from outside; accepting it spends a row that can never be used on any other text. Fifty-four of the seventy-two distinct words here occur once, and ten of forty-eight rows go on them." },
                    { expression: "whether a chosen piece is a sensible unit", reason: "not a question the objective can be asked. It scores runs of symbols by how much they account for, so a piece that stops one letter short of a stem is exactly as good as one that does not, and expecte and analys are both bought. Supplying that judgement means maximising something else." },
                    { expression: "a vocabulary smaller than the alphabet", reason: "there is nothing to give. The floor is one row per symbol the corpus is spelled in, plus whatever stands in for the unspellable, since dropping a symbol leaves part of the training corpus itself unreadable. On the eighteen sentences that floor is 52." },
                    { expression: "a vocabulary larger than the corpus can fill", reason: "the rule runs out of positions and stops. The size asked for is a ceiling and not a promise, and the number reached is a fact about the corpus; on the four words every position is covered after four pieces and asking for 300 gives the same four." },
                    { expression: "a symbol the corpus used only inside words, at the end of one", reason: "unspellable, and shared with every scheme that marks where a word ends rather than being anything to do with coverage. The letter z appears in the eighteen sentences, in size, and no word there ends in it, so Alvarez cannot be spelled and the stand-in that replaces it carries no word boundary." },
                  ]}
                />
                <KeepInMind>
                  Four of these are decisions rather than limits, namely the unit,
                  the tie-break, the longest piece allowed and whether a piece seen
                  once may be bought. Each has defensible answers on both sides and
                  each changes what the finished vocabulary holds, so each belongs
                  in whatever describes a tokenizer rather than being left to
                  whoever writes it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            trueFalse(
              "On the corpus the pieces were chosen from, coverage reads the text in fewer pieces at every size tried.",
              true,
              "It reads the 133 word occurrences in 475 pieces at 60 tokens against merging’s 531, 296 against 344 at 100, and 267 against 295 at 121. The page also says that result is not evidence of anything, since covering that corpus is precisely what the rule was maximising and this is the objective reporting on itself.",
            ),
            choice(
              "On the held-out sentence the ordering changes hands at 70 tokens. What is doing that?",
              [
                "Coverage buys length and no rungs, so expect matches nothing it holds and comes back as six single letters",
                "Coverage ran out of positions at 121 tokens and stopped learning",
                "Merging’s pieces are longer on average, so more of them match",
                "The sentence holds words the corpus does not, which coverage refuses to encode",
              ],
              0,
              "The corpus uses expected and never the bare stem, so coverage buys expecte and merging keeps exp and ec as rungs it climbed. Across the sentence about Dr. Alvarez 24 of coverage’s 32 pieces are bare single symbols against 17 of merging’s 27, and merging’s mean piece is the shorter of the two at 3.04 characters against 3.77.",
            ),
            trueFalse(
              "The objective has no way to prefer a piece that is a stem or a syllable over one that is not.",
              true,
              "It is a statement about positions and counts and has no representation of a prefix, a stem or a syllable, which is why it buys expecte, the stem with the first letter of its ending glued on, and analys, analysis with its last two letters missing. Both are correct answers to the question asked, and the information that would settle them is not in the objective at all, so supplying it means maximising something else.",
            ),
            choice(
              "Why can the rule not tell a word of eight symbols seen once from a pair of symbols seen four times?",
              [
                "Length and frequency enter the objective as a product, so they substitute for one another freely",
                "Both are refused, since a candidate has to occur at least twice",
                "The rule only ever scores the longest candidate available",
                "The two cover the same positions as each other",
              ],
              0,
              "Both are worth 8, and nothing in the objective says a piece seen once is worth less. Of the 72 distinct words in the eighteen sentences 54 occur exactly once, and at 100 tokens 10 of the 48 rows coverage chose are whole words seen once, where merging spends none at any of those sizes because its stopping condition refuses a pair seen fewer than twice.",
            ),
            several(
              "At 100 tokens, capping the longest piece allowed at five symbols did which of these?",
              [
                "Read the corpus in 324 pieces rather than 296",
                "Read the held-out sentence in 28 pieces rather than 32",
                "Cut the rows spent on words seen once from 10 to 2",
                "Left one setting best for the text the pieces were chosen from and a different one best for the held-out sentence",
              ],
              [0, 1, 2, 3],
              "The cap trades 28 pieces on the corpus for 4 on the sentence, so it does not improve both readings at once, and nothing in the objective says where the limit should be. Capping at three goes too far at 384 and 29, and past eight the ceiling stops binding at all, since the pieces the rule wanted were shorter than that anyway. It is the disagreement between the corpus and the held-out sentence again, arriving through a different door.",
            ),
        ],
        },
        {
          title: "Practice. Covering, Falling Short and Capping With the Library",
          practice: [
            exercise(
              "Cover the four words, and merge them to the same size",
              [
  "Use the repeated low, lower, newest and widest corpus to compare greedy coverage with pair merging at the same fitted vocabulary size.",
  "Request 40 rows from the coverage learner. Print its actual size, each chosen piece with the new positions it covered, and total coverage. Fit BPE at that actual size with byte fallback disabled.",
  "For both fits, print the total corpus-token count and the pieces and counts for lower and lowest. Lowest is absent from the corpus, so this separates fitting familiar words from reusing their parts."
],
              `from oop_ml import BytePairEncoding, GreedyCoverageTokenizer

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]

covering = GreedyCoverageTokenizer(vocabulary_size=40).fit(corpus)
merging = BytePairEncoding(vocabulary_size=16, byte_fallback=False).fit(corpus)
# Print the rows the covering fit reached, then each chosen piece with the
# positions it covered and the total covered.
# For each fit print what the four texts cost in pieces, then the pieces of
# lower and of lowest and how many there are.`,
              `from oop_ml import BytePairEncoding, GreedyCoverageTokenizer

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]

covering = GreedyCoverageTokenizer(vocabulary_size=40).fit(corpus)
merging = BytePairEncoding(vocabulary_size=16, byte_fallback=False).fit(corpus)
print(f"asked 40, reached {covering.vocabulary.n_tokens}")
for chosen in covering.chosen_pieces:
    print(f"  {chosen.piece} covers {chosen.coverage}")
print(f"  total {covering.chosen_pieces.total_coverage}")

for label, model in [("coverage", covering), ("merging", merging)]:
    pieces = sum(model.encode(text).n_tokens for text in corpus)
    print(f"{label}: corpus {pieces} pieces")
    for word in ["lower", "lowest"]:
        cut = model.encode(word).texts
        print(f"  {word}: {' '.join(cut)} ({len(cut)})")`,
              `asked 40, reached 16
  newest</w> covers 36
  widest</w> covers 18
  low</w> covers 15
  lower</w> covers 10
  total 79
coverage: corpus 16 pieces
  lower: lower</w> (1)
  lowest: l o w e s t</w> (6)
merging: corpus 48 pieces
  lower: lo w e r</w> (4)
  lowest: lo w est</w> (3)`,
              {
question: "Does covering familiar words also help spell a new one?",
 hints: [
  "chosen_pieces records the selection order. Each selection exposes piece and coverage; total_coverage adds newly covered positions.",
  "The coverage fit may stop before its requested size. Use the same actual row budget for the BPE comparison.",
  "Sum encoding.n_tokens over all corpus strings, then inspect encoding.texts separately for the two test words."
], check: numberCheck("How many pieces does the four-word corpus cost under merging at 16 rows?", 48, 0, "BPE uses 48 pieces for this corpus at sixteen rows. Coverage spends its learned entries on the complete familiar words, while BPE’s intermediate parts are more useful on lowest.") },
            ),
            exercise(
              "Spend one, two and three pieces on costing and costly",
              [
  "The supplied corpus contains costing and costly three times each. Give the coverage learner room for one, then two, then three learned pieces and compare coverage with encoded length.",
  "Fit at vocabulary sizes 11, 12 and 13, which include ten reserved/alphabet rows for this corpus. Print each selected piece and its new coverage, the total positions covered and the corpus-token count.",
  "Coverage counts positions reached by selected pieces. Encoded length counts the pieces actually needed to write the corpus. Keep the two measurements separate."
],
              `from oop_ml import GreedyCoverageTokenizer

corpus = ["costing costing costing", "costly costly costly"]

for size in [11, 12, 13]:
    model = GreedyCoverageTokenizer(vocabulary_size=size).fit(corpus)
    # Print how many pieces were chosen, each piece with its coverage, the
    # total covered out of 39, and the pieces the two texts cost.`,
              `from oop_ml import GreedyCoverageTokenizer

corpus = ["costing costing costing", "costly costly costly"]

for size in [11, 12, 13]:
    model = GreedyCoverageTokenizer(vocabulary_size=size).fit(corpus)
    chosen = ", ".join(f"{piece.piece} {piece.coverage}" for piece in model.chosen_pieces)
    covered = model.chosen_pieces.total_coverage
    pieces = sum(model.encode(text).n_tokens for text in corpus)
    print(f"{model.n_chosen_pieces} chosen: {chosen}")
    print(f"  covers {covered} of 39, corpus {pieces} pieces")`,
              `1 chosen: cost 24
  covers 24 of 39, corpus 21 pieces
2 chosen: cost 24, ing</w> 9
  covers 33 of 39, corpus 15 pieces
3 chosen: cost 24, ing</w> 9, ly</w> 6
  covers 39 of 39, corpus 12 pieces`,
              {
question: "Can complete coverage still leave a longer encoding?",
 hints: [
  "Read n_chosen_pieces and chosen_pieces from each fresh fit.",
  "total_coverage measures covered positions. Sum encode(text).n_tokens for encoded length; one measurement cannot substitute for the other."
], check: numberCheck("How many pieces does the corpus cost once the rule has chosen three?", 12, 0, "The third learned piece completes coverage but leaves twelve encoded pieces. Selecting whole words would give a shorter representation here, so complete coverage does not establish a shortest encoding.") },
            ),
            exercise(
              "Move the ceiling on how long a piece may be",
              [
  "A long selected piece may cover much familiar text while missing a shorter word we later need. Test that trade-off on expect and the held-out Dr. Alvarez sentence.",
  "Fit GreedyCoverageTokenizer at vocabulary_size=100 with max_piece_length values 5, 6 and 16. For each print its first four selections, total corpus tokens, held-out sentence tokens and expect’s pieces. Fit BPE at the same budget for a separate comparison.",
  "The limit counts the symbols used by this learner, including its end marker. Keep all other settings fixed."
],
              `from oop_ml import BytePairEncoding, GreedyCoverageTokenizer

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

for ceiling in [5, 6, 16]:
    model = GreedyCoverageTokenizer(vocabulary_size=100, max_piece_length=ceiling).fit(sentences)
    # Print the ceiling, the first four chosen pieces, the pieces the
    # eighteen sentences cost, the pieces the sentence costs, and the cut of
    # the word expect.

merging = BytePairEncoding(vocabulary_size=100, byte_fallback=False).fit(sentences)
# Print the same three readings under merging.`,
              `from oop_ml import BytePairEncoding, GreedyCoverageTokenizer

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

for ceiling in [5, 6, 16]:
    model = GreedyCoverageTokenizer(vocabulary_size=100, max_piece_length=ceiling).fit(sentences)
    first = [chosen.piece for chosen in model.chosen_pieces][:4]
    corpus_pieces = sum(model.encode(text).n_tokens for text in sentences)
    print(f"ceiling {ceiling}: first {' '.join(first)}")
    print(f"  corpus {corpus_pieces}, sentence {model.encode(sentence).n_tokens}, "
          f"expect: {' '.join(model.encode('expect').texts)}")

merging = BytePairEncoding(vocabulary_size=100, byte_fallback=False).fit(sentences)
corpus_pieces = sum(merging.encode(text).n_tokens for text in sentences)
print(f"merging: corpus {corpus_pieces}, sentence {merging.encode(sentence).n_tokens}, "
      f"expect: {' '.join(merging.encode('expect').texts)}")`,
              `ceiling 5: first he</w> analy re expec
  corpus 324, sentence 28, expect: expec t</w>
ceiling 6: first he</w> analys re expect
  corpus 304, sentence 32, expect: e x p e c t</w>
ceiling 16: first he</w> analys expecte re
  corpus 296, sentence 32, expect: e x p e c t</w>
merging: corpus 344, sentence 27, expect: exp ec t</w>`,
              {
question: "How does limiting piece length change what the vocabulary can reuse?",
 hints: [
  "max_piece_length is a constructor setting. Six and sixteen can admit pieces that five excludes.",
  "List chosen_pieces in learned order and inspect the first four; use each selection’s piece.",
  "Compare expect with the selected piece’s exact spelling. A marked final character is different from the same character inside a longer word."
], check: numberCheck("How many pieces does the corpus cost with the longest piece capped at six symbols?", 304, 0, "The six-symbol limit gives 304 corpus pieces. Its selected expect is an internal spelling from expected, so it does not match the marked ending of the complete word expect.") },
            ),
          ],
        },
      ]}
    />
  );
}
