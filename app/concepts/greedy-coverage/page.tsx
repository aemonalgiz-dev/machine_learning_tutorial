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
                  We work on the same two corpora the merging pages use, so that
                  nothing in the comparison is a difference of data. The small
                  one is four words with their counts, low five times, lower
                  twice, newest six times and widest three, sixteen occurrences
                  in all. The large one is eighteen short sentences of ordinary
                  English about reports and costs and analyses, 72 distinct words
                  across 133 occurrences. Neither contains the sentence this
                  section carries everywhere.
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
                  Applying a piece to a word is a scan from the left. Wherever the
                  piece matches on positions nothing has claimed, claim them and
                  skip past the match; otherwise move along one and look again.
                  The pieces already chosen are applied first, in the order they
                  were chosen, and a candidate is then worth whatever it can still
                  find. That is the only mechanism on the page, and it is why the
                  order pieces were chosen in is part of the model rather than an
                  accident of the fit.
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
                  That is the structural difference between the two methods, and
                  it is worth naming here rather than in the comparison, since it
                  follows from the objective alone. Merging builds long pieces out
                  of short ones and keeps every rung, so a word that fails to match
                  the long piece still matches the rungs. Coverage buys pieces
                  outright and buys no rungs, because a rung covers positions its
                  parent already covers and is therefore worth nothing at the
                  moment the parent is in.
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
              "Already chosen pieces are applied first, in the order they were chosen, and a candidate is worth whatever it can still find, so its value only falls. Single symbols are not candidates at all, because the alphabet is in the vocabulary anyway and a single symbol covers nothing that was not already going to be its own token.",
            ),
        ],
        },
        {
          title: "Part 3. A Hard Problem With a Known Guarantee",
          content: (
            <>
              <SubSection title="8. Choosing the best set is not something anyone can do">
                <p>
                  Notice what the rule is an approximation to. The question we
                  actually want answered is which set of k pieces covers the most
                  positions, and that question has nothing greedy in it. Taking
                  the best piece first is one way to build a set of k; there are
                  many others, and no reason yet to think the first is the best.
                </p>
                <>
<p>
                  The question is a known one and the answer is that it cannot be computed. Choosing k sets to cover as much of a universe as possible is weighted maximum coverage, whose decision form is the set covering problem on Karp&rsquo;s 1972 list, and no method is known that answers it exactly without, in the worst case, examining a number of subsets that grows exponentially in the number of candidates.
                </p>
                <p>
                  The eighteen sentences supply 815 candidates and the rule runs for 69 turns on them, so the exact answer would mean weighing 815 things taken 69 at a time, which is not a search anybody runs.
                </p>
</>
                <KeepInMind>
                  The greedy rule is not a shortcut somebody took to save effort
                  on an easy problem. The exact problem is intractable, and every
                  practical answer to it is an approximation of some kind.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What the guarantee promises, and what it does not">
                <>
<p>
                  What makes this particular approximation worth building a method on is that it is not merely a heuristic. Coverage is a monotone submodular function of a set of pieces, which means two things. Adding a piece never lowers the coverage, and a piece added to a larger set never covers more than the same piece added to a smaller one, since the larger set has already taken some of what it would have claimed.
                </p>
                <p>
                  For any function with those two properties, the greedy rule run for k turns reaches at least 1 &minus; 1/e of what the best set of k could reach.
                </p>
</>
                <Equation>{"greedy coverage after k turns   ≥   (1 − 1/e) × best coverage any k pieces reach"}</Equation>
                <>
<p>
                  That fraction is 0.632, and Feige&rsquo;s 1998 result says no polynomial method improves on it in general. So the honest reading of the guarantee is narrow, and it is worth being exact about, because it is often quoted as though it said more. It is a worst case over every possible input, so it promises nothing about a typical corpus.
                </p>
                <p>
                  It bounds coverage and says nothing at all about sequence length, which is the quantity anything reading the pieces actually pays. And it compares the rule to the best set of the same size rather than to any absolute standard, so a problem on which every set is bad has a guarantee that is satisfied by something bad.
                </p>
</>
                <WhyThisWorks title="Where the fraction comes from">
                  <>
<p>
                    Let the best set of k pieces cover a total of B. At any point, the k pieces of that best set together cover at least B minus whatever the greedy rule has already taken, so at least one of them covers a kth of that shortfall, and the greedy rule takes something at least as good.
                  </p>
                  <p>
                    So the shortfall shrinks by a factor of at least 1 &minus; 1/k every turn, and after k turns what is left is at most B(1 &minus; 1/k) raised to the k, which approaches B/e from below. What has been taken is therefore at least B(1 &minus; 1/e).
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  Submodularity is what the argument rests on, and here it is
                  simply the fact that a position can only be covered once. The
                  guarantee is about coverage against the best coverage, and no
                  result on this page bounds how long the resulting text will be.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Where the rule falls short, on two words">
                <p>
                  A worst-case fraction is easier to think about beside a case
                  where the rule really does lose something, and two words are
                  enough. Take costing three times and costly three times, which
                  is 39 positions. The best single piece is cost, four positions in
                  six word occurrences, worth 24, and nothing beats it, so the
                  first turn is forced and correct. With two pieces to spend the
                  rule takes cost and then the ending ing with its mark, and
                  reaches 33.
                </p>
                <BestTwoRows />
                <>
<p>
                  The best pair, found by enumerating every pair of candidates rather than by another heuristic, is the two whole words, which cover all 39 between them. The rule reaches 84.6% of that, which is comfortably above the 63.2% the theorem allows and still a real loss, and the loss was locked in by a first move that was the best available at the time.
                </p>
                <p>
                  The cost in the currency that matters is larger than the cost in coverage. Under the two pieces the rule chose, the six word occurrences read as 15 pieces, since costly comes apart as cost, then l, then a marked y. Under the best pair they read as 6, one per word.
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

              <SubSection title="12. The two units on the four words, where I expected a tie">
                <>
                  <p>
                    I originally expected character counting to make the marked ending
                    tie with newest. That counted the extra end marker for the ending
                    but forgot to count it for the whole word.
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
                  The whole run comes out the same four pieces in the same order, at 42, 21, 20 and 12 rather than 36, 18, 15 and 10. So on this corpus the unit changes every number and no decision, and the claim I had written down does not reproduce. The arithmetic of why is worth following, since it says when the claim would have been right.
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
                  The claim is repairable, and repairing it shows exactly what kind
                  of corpus is needed. The extra character goes to word-final
                  candidates only, so the flip needs a word-final candidate close
                  behind a word-internal one. Take test, rest and best three times
                  each, against stem, stop and stub five times each, which is 96
                  positions and 120 characters.
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
              "What exactly does the 1 − 1/e guarantee promise?",
              [
                "That after k turns the rule reaches at least 0.632 of what the best set of k pieces could reach",
                "That the rule covers at least 0.632 of every position in the corpus",
                "That the resulting text is at most 1/0.632 times the shortest reading possible",
                "That the rule is within 0.632 of the best set on a typical corpus",
              ],
              0,
              "It is a worst case over every possible input, so it promises nothing about a typical corpus, and it compares the rule to the best set of the same size rather than to any absolute standard, so a problem on which every set is bad has a guarantee satisfied by something bad. It also bounds coverage and says nothing about sequence length, which is the quantity anything reading the pieces actually pays.",
            ),
            several(
              "Coverage is a monotone submodular function of a set of pieces. What do those properties say here?",
              [
                "Adding a piece never lowers the coverage",
                "A piece added to a larger set never covers more than the same piece added to a smaller one",
                "The bound they give is on how long the resulting text will be",
                "The greedy rule is therefore optimal at every size",
              ],
              [0, 1],
              "The larger set has already taken some of what the piece would have claimed, and here that is simply the fact that a position can only be covered once. The two properties buy a bound and not optimality, since greedy choice is optimal at one piece and can be beaten from two onward. And the bound is on coverage against the best coverage of the same size. Nothing on the page bounds sequence length, which is what anything reading the pieces pays.",
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
              "The best pair, found by enumerating every pair of candidates rather than by another heuristic, is the two whole words. The rule reaches 84.6% of that coverage, comfortably above the 63.2% the theorem allows and still a real loss, and the cost in the currency that matters is larger than the cost in coverage.",
            ),
            trueFalse(
              "Counting characters rather than positions makes the marked ending est tie with newest on the four words.",
              false,
              "That was the expectation written down first, and it counted the extra end marker for the ending while forgetting it for the whole word. Both candidates end a word, so newest gains 6 and the ending gains 9, and since the gap to close was 9, closing it by 3 leaves the ending 6 behind at 36 against 42.",
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
                  The shape of that profile is the submodularity of Part 3 made
                  visible. Each piece chosen removes positions from every candidate
                  still standing, so the value of the best remaining candidate can
                  only fall, and the sequence 62, 42, 35, 34, 24, 21, 21, 16 is
                  monotone all the way down to a tail of twos. The flat stretches
                  are ties, runs where several pieces were each worth the same, and
                  the longest of them is thirteen turns in a row each worth two.
                </p>
                <KeepInMind>
                  The falling profile is guaranteed rather than observed, since a
                  piece cannot be worth more later than it was worth earlier. What
                  the corpus decides is how quickly it falls and where it reaches
                  zero.
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
                    At the scale a language model works at, tens of thousands of
                    rows over billions of words, the two effects measured below are
                    the ones to expect to survive, since both follow from the
                    objective rather than from this corpus. They are a shorter
                    reading of the text the pieces were chosen from, and a longer
                    reading of text they were not. How large either is at that
                    scale is not something this page measures, and eighteen
                    sentences would be a poor guide to it.
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
                  whole. Counted across the running sentence, 24 of coverage&rsquo;s
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
          title: "Part 6. Where the Method Stops Being Defined",
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
                  The last section suggests a repair, and it is worth measuring
                  rather than assuming. Candidates are runs of two or more symbols
                  with no upper limit, so if the limit is lowered the whole-word
                  rows become unbuyable and the rule has to spend its budget on
                  shorter pieces. Nothing in the objective says where that limit
                  should be, and the two readings do not agree about where it
                  should be either.
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

              <SubSection title="22. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs on which the method
                  stops being defined rather than becoming approximate, together
                  with what has to be decided in each case and what turns on the
                  decision. Several are genuinely open questions with defensible
                  answers on either side, and those are the ones worth attention,
                  since they are the decisions anybody setting this up has to make
                  and nothing in the mathematics makes them.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    { expression: "the unit a covering is counted in", reason: "undecided by the objective, which says to cover the most text and does not say what text is measured in. Counting positions and counting characters are both natural and differ by one per word-final position; on three endings against three openings the first is chosen by the second, at 30 against 27 one way and 36 against 30 the other." },
                    { expression: "two candidates covering the same amount", reason: "the objective is indifferent, so no answer is more correct. A choice must be made and any choice is arbitrary; taking the lexicographically smaller at least makes the fit repeatable, where taking whichever was met first makes it depend on the order the words arrived in. Ties are common rather than rare here, and on the eighteen sentences thirteen consecutive turns were each worth exactly two." },
                    { expression: "the best set of a given size", reason: "not what the rule finds, and not something anyone can find. The exact problem is weighted maximum coverage, whose decision form has been known to be NP-complete since 1972, and greedy choice can be beaten from two pieces onward, by 6 positions in 39 on the two-word corpus of section 10." },
                    { expression: "how far short the rule can fall", reason: "bounded, at 1 − 1/e of the best set of the same size, which is 63.2%, and no polynomial method does better in general. The bound is worst case over every input rather than typical; the two-word corpus reaches 84.6% of the best pair, and nothing predicts that in advance." },
                    { expression: "how long a text will be", reason: "outside the guarantee entirely. Coverage is bounded against the best coverage and sequence length is not bounded against anything, and the two come apart in practice, since the vocabulary that reads the training corpus in 296 pieces reads a held-out sentence in 32 where a merged one of the same size reads it in 27." },
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
              "The corpus uses expected and never the bare stem, so coverage buys expecte and merging keeps exp and ec as rungs it climbed. Across the running sentence 24 of coverage’s 32 pieces are bare single symbols against 17 of merging’s 27, and merging’s mean piece is the shorter of the two at 3.04 characters against 3.77.",
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
              ["Part 2 ran the rule on low, lower, newest and widest and watched four turns cover all 79 positions, 36, then 18, then 15, then 10, with the fit stopping at 16 tokens however many were asked for. Fit the four words asking for 40, and print the rows reached and each chosen piece with what it covered. Then fit merging at 16 rows with its byte rows switched off, and under both print what the corpus costs in pieces and how lower and lowest are cut.", "The lesson gives lowest as six single symbols against three under merging. What it does not give is what the four-word corpus itself costs under a merged vocabulary of the same 16 rows."],
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
              { hints: ["chosen_pieces is iterable in the order the pieces were chosen, each with a piece and the coverage it had at the moment it was taken, and it has a total_coverage of its own.", "A corpus costs the sum of what each of its texts encodes to, and encode answers an object with an n_tokens and the texts of its pieces.", "Both fits write the end-of-word mark as </w> on a word’s last symbol, so low</w> is the word low and not the first three letters of lower."], check: numberCheck("How many pieces does the four-word corpus cost under merging at 16 rows?", 48, 0, "At 16 rows merging has made four joins, es, est with its mark, lo and ew, and every one is a rung on the way to a word and not a word, so the sixteen word occurrences still cost 48 pieces. Coverage spent the same four rows on the four whole words and reads the corpus in 16, one piece per occurrence. The price is on the other side. Lowest matches none of the four words and comes back as six symbols, where merging’s rungs read it in three.") },
            ),
            exercise(
              "Spend one, two and three pieces on costing and costly",
              ["Part 3 took costing three times and costly three times, 39 positions, and showed the rule spending two pieces on cost and the ending ing with its mark, reaching 33 and reading the six words in 15 pieces, where the best pair is the two whole words, covering all 39 and reading them in 6. The two words are spelled in nine symbols, so with the stand-in the alphabet takes ten rows, and asking for 11, 12 and 13 rows buys one, two and three pieces.", "Fit at each of the three sizes and print the pieces chosen with what each covered, the total covered, and what the corpus costs in pieces. The lesson stops at two pieces. The third is where coverage and length come apart most plainly."],
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
              { hints: ["n_chosen_pieces is how many pieces the fit took, and each chosen piece carries the coverage it had when it was taken, so the figures fall from one piece to the next.", "total_coverage adds those up, and the corpus cost is the sum of encode(text).n_tokens over the two texts."], check: numberCheck("How many pieces does the corpus cost once the rule has chosen three?", 12, 0, "The third piece is the ending ly with its mark, worth 6, and with it every one of the 39 positions is covered, exactly as the best pair covers them. The six words still cost 12 pieces, two each, where the two whole words cost 6. Full coverage only says no symbol is left standing alone. It does not say how many pieces the covering is made of, which is why Part 3 insists that the guarantee bounds coverage and says nothing about how long the text will be.") },
            ),
            exercise(
              "Move the ceiling on how long a piece may be",
              ["Part 6 fitted the eighteen sentences at 100 tokens under several ceilings on the longest piece. With no ceiling the corpus costs 296 pieces and the held-out sentence 32, and capped at five symbols they cost 324 and 28, against merging’s 344 and 27. Fit coverage with the ceiling at 5, at 6 and at its default of 16, and merging once, all at 100 rows. For each print the first four pieces chosen, what the corpus and the sentence cost, and how the word expect is cut.", "The setting at six is one the lesson’s prose does not quote, and the cut of expect says why the sentence gets shorter where it does."],
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
              { hints: ["The ceiling is max_piece_length at construction, counted in symbols, and 16 is its default, which the lesson found stops binding past eight.", "chosen_pieces is iterable in the order the pieces were taken, so the first four are the first four turns.", "Each coverage fit takes a couple of seconds, since every run of symbols up to the ceiling is a candidate at every turn."], check: numberCheck("How many pieces does the corpus cost with the longest piece capped at six symbols?", 304, 0, "Six sits between the lesson’s two settings on the corpus, 304 against 296 with no ceiling and 324 at five, and it buys nothing on the sentence, which still costs 32. The cut of expect shows why. At six the rule buys the six unmarked symbols of expect out of expected, and the word expect ends in a marked t, so that piece does not occur in it and the word comes back as six letters. At five it buys expec, which is inside both, and the word costs two pieces. Those four pieces are the whole of the sentence’s gain from 32 to 28.") },
            ),
          ],
        },
      ]}
    />
  );
}
