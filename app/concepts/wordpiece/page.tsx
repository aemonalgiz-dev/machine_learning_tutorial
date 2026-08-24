import type { Metadata } from "next";
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
    "The same merging, scored differently. A pair is judged by how much more often it occurs than its two halves would predict.",
};

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function WordPiecePage() {
  return (
    <ConceptPage
      title="WordPiece"
      tagline="The same merging, scored differently. A pair is judged by how much more often it occurs than its two halves would predict, which prefers a pair of rare symbols over a pair of common ones and changes the vocabulary from the very first merge."
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
      history={
        <>
          <p>
            Mike Schuster and Kaisuke Nakajima, working on voice search at
            Google, published &ldquo;Japanese and Korean Voice Search&rdquo; at
            the 2012 signal processing conference, and the problem they had was
            not the problem the merging idea was invented for. Japanese is
            written without spaces, so a speech recogniser for it has no word
            boundaries to start from, and the segmenters available then were
            hand-built, language-specific and slow to run inside a recogniser.
            Korean has spaces but glues so many suffixes onto a stem that a word
            list of any size still misses most of what people say. They wanted
            one inventory of pieces, learned from data, that would serve both
            languages and leave nothing unreadable, and they called the pieces
            wordpieces.
          </p>
          <p>
            The rule they described for choosing a piece is the thing this page
            is about. Rather than take the commonest pair, they asked which
            single new piece would most raise the likelihood of the training
            data under a model that treats the pieces as independent draws, and
            added that one. Their reported result was that the wordpiece system
            beat the word system on both languages while keeping the inventory
            small, and that nothing had to be known about either language for it
            to work. Four years later Yonghui Wu and colleagues at the same lab
            used a wordpiece vocabulary for their translation system and made
            the method visible outside speech, and in 2018 Jacob Devlin, Ming
            Wei Chang, Kenton Lee and Kristina Toutanova used one for the
            language model they called BERT, which is where most readers meet
            it, and which is where the convention of writing two hashes in front
            of a piece that continues a word comes from.
          </p>
          <p>
            This page asks five questions in order. Why does taking the
            commonest pair choose badly, and what exactly is wrong with a count?
            What figure replaces it, and what does that figure measure? Which
            pairs does it prefer, and which does it now refuse to buy? What does
            marking a piece that continues a word do to the vocabulary and to
            the cut? And what does the whole change cost, in the only currency
            anything downstream cares about, which is how many pieces a sentence
            becomes?
          </p>
        </>
      }
      playground={<WordPiecePlayground />}
      sections={[
        {
          title: "Part 1. What a Pair Count Cannot Tell You",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Where this starts, and the one thing that changes">
                <p>
                  We start where the previous page ended. A corpus is cut into
                  words, every word is written out in single symbols, and a loop
                  runs. Count every pair of adjacent symbols, weighting each by
                  how often its word occurs, take the best pair, replace every
                  occurrence of it with the two symbols written together, and go
                  round again. Each turn adds one row to the vocabulary, so the
                  loop stops when the vocabulary is the size that was asked for.
                </p>
                <p>
                  WordPiece is that loop with one word changed. Where the
                  earlier method reads &ldquo;take the pair that occurs most
                  often&rdquo;, this one reads &ldquo;take the pair that occurs
                  most often <em>relative to how often its two halves occur on
                  their own</em>&rdquo;. Everything else on this page follows
                  from that, including a second change to how words are spelled
                  which is not a matter of taste but a consequence of the first.
                  We carry the same sentence every page in this section carries,
                  and the same eighteen short sentences of ordinary English to
                  learn from, none of which is the sentence.
                </p>
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
                <p>
                  Take the eighteen sentences and count every adjacent pair
                  once, before any merging. There are 87 pairs that occur at
                  least twice, and the commonest of them is h followed by e, at
                  32 occurrences, which comes almost entirely from the word the.
                  That looks like a discovery until you look at the two halves
                  on their own. The letter h occurs 36 times in the corpus and
                  the letter e occurs 98 times, so nearly every h in the corpus
                  is followed by an e, and the pair is frequent chiefly because
                  e is everywhere.
                </p>
                <p>
                  Put every candidate on a chart, with how often it occurs
                  across the bottom and, up the side, how often it occurs
                  compared with what its halves alone would lead you to expect.
                  If the two figures said the same thing the points would form a
                  rising line and there would be nothing to argue about.
                </p>
                <PairScoreScatter />
                <p>
                  They do not. The commonest pair sits low, and the pair highest
                  up the chart is o followed by f, which occurs three times and
                  is the whole of the word of. Every o that starts a word in
                  this corpus is one of six, every f that sits inside a word is
                  one of three, and half of those o&rsquo;s and all of those
                  f&rsquo;s are in the same three places. Counted on its own it
                  is the 32nd best of the 87 candidates by the other figure,
                  which is roughly the middle.
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
                  What a vocabulary row is worth is not how often its two halves
                  happen to be adjacent, but whether those halves belong
                  together, so that a model reading the joined piece learns
                  something it could not get from the two separately. The test
                  for belonging together is comparison against chance. If the
                  two halves were sprinkled through the corpus independently of
                  one another, how often would they land next to each other by
                  accident, and how does that compare with how often they
                  actually do?
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
          ),
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
                  The denominator is the whole of the idea. Two halves that are
                  each common make it large, so a pair of common symbols has to
                  be extraordinarily frequent together to score well; two halves
                  that are each rare make it small, so a pair of rare symbols
                  needs only to be seen together a few times. A pair whose halves
                  never appear apart from each other scores highest of all,
                  because then the numerator and both parts of the denominator
                  are counting the same occurrences.
                </p>
                <WhyThisWorks title="Where the division comes from">
                  <p>
                    Think of the corpus as a bag of symbols, and give it the
                    simplest possible model, one in which each symbol is drawn
                    on its own with a probability equal to its share of the bag.
                    The model&rsquo;s log likelihood of the corpus is then the
                    sum over symbols of how often each occurs times the log of
                    its share. Now merge a pair. Every one of its occurrences
                    stops being two draws and becomes one, so the corpus gains,
                    per occurrence, exactly this.
                  </p>
                  <Equation>
                    {"log p(ab)  −  log p(a)  −  log p(b)"}
                  </Equation>
                  <p>
                    Turning shares back into counts, and noticing that the
                    corpus total appears in every candidate and so cannot change
                    which of them is largest, that quantity ranks the candidates
                    in exactly the order the division above does. So the figure
                    is not an invention with a likelihood story attached
                    afterwards. It is what the likelihood gain per occurrence
                    reduces to once the constant is dropped.
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
                <WorkedExample title="Two pairs, worked">
                  <p>
                    The pair e followed by s occurs nine times, once inside
                    newest and once inside widest, weighted by six and three.
                    Across the whole corpus e occurs 17 times and s occurs nine,
                    so the score is 9 divided by 17 times 9, which is one
                    seventeenth, or 0.0588. The pair i followed by d occurs three
                    times, all of them inside widest. Across the whole corpus i
                    occurs three times and d occurs three times, so the score is
                    3 divided by 3 times 3, which is one third, or 0.3333. The
                    second pair is seen a third as often as the first and scores
                    nearly six times as well.
                  </p>
                </WorkedExample>
                <p>
                  Ordered by the count, e followed by s is at the top and i
                  followed by d is near the bottom. Ordered by the score they
                  swap ends. That is not a small perturbation of one ordering
                  into another; it is a different question producing a different
                  answer on the same eleven rows.
                </p>
                <KeepInMind>
                  Every number in that table comes from one pass over the corpus.
                  The score costs a division per candidate and one extra count
                  per symbol, so nothing about this is more expensive than
                  counting pairs was.
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
                <p>
                  On the four words the two part at the very first merge,
                  counting taking e followed by s and the score taking i followed
                  by d. On the eighteen sentences they part at the first merge
                  too, counting taking h followed by e at 32 occurrences and the
                  score taking o followed by f at three. There is no corpus on
                  this page where the two agree for even one turn, which is worth
                  saying because a change of one word in the rule sounds like a
                  refinement and here it produces a different vocabulary from the
                  first row onwards.
                </p>
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
                <p>
                  What it will not buy is the row that a count-driven run buys
                  first, which is the frequent pairing of two frequent symbols.
                  On the eighteen sentences the count rule spends its first six
                  turns assembling he, the, st, re, ed and The, every one of them
                  a very common fragment of a very common word. The score rule
                  spends its first six turns on of, ex, exp, ly, Dr and Dr., of
                  which of and Dr. are whole words of the corpus and ex and exp
                  are the front of expect and expected. Those are recognisably
                  different kinds of thing.
                </p>
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
                <p>
                  Here is the second real difference, and it is a consequence of
                  the first rather than a separate idea. A count-driven scheme
                  encodes a new word by replaying its merges in the order they
                  were learned, so the order is part of the model. WordPiece
                  throws the order away and keeps only the finished vocabulary.
                  To cut a word, start at its first character, take the longest
                  vocabulary piece that spells a prefix of what is left, advance
                  past it, and repeat, looking up every piece after the first in
                  its continuation form.
                </p>
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

              <SubSection title="11. The running sentence, and where the marks fall">
                <p>
                  Fitted on the eighteen sentences, here is the running sentence
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
                <p>
                  Any tie-break at all is added from outside. The choice made
                  here is to compare the two candidates as text and take the
                  smaller, which at least makes the answer independent of the
                  order the corpus&rsquo;s texts arrived in. Because the
                  comparison happens in the spelling the merges are learned in,
                  where a word&rsquo;s first symbol carries a mark of its own,
                  what actually decides is the position of that mark in the
                  character table against the position of the letter i. The mark
                  is at 9601 and i is at 105, so i comes first, and the
                  vocabulary contains ##id and does not contain wi.
                </p>
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
                  A score computed from one occurrence is a fact about one word,
                  so every implementation of this refuses to merge a pair seen
                  fewer than some small number of times. There are two ways to
                  read that rule and they are not the same rule. Either the
                  minimum filters the candidates before the best is chosen, or it
                  is a test applied to the winner, which ends the run when the
                  winner fails it.
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
                  A rule that behaves identically under one scoring and
                  catastrophically differently under another is exactly the kind
                  of thing that survives a change of scoring unexamined. Under
                  counting there is no difference to notice.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
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
                  That is not a large number, and worse, it falls as the pair gets
                  commoner. Two symbols bound together nine times score one ninth;
                  two symbols bound together twice score one half. So among pairs
                  that are perfectly bound, the rule prefers the rarest, which is
                  the reverse of what anybody wants from a vocabulary, and the
                  division above is where that comes from rather than any choice
                  an implementation made.
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
                  It is also worth saying what is <em>not</em> undefined here.
                  Because the two halves are counted everywhere including inside
                  the pair, the denominator can never reach zero, so the division
                  is always safe. A version that counted only the halves&rsquo;
                  free occurrences would divide by nothing at all for a perfectly
                  bound pair, and would be undefined rather than infinitely good,
                  which is a distinction worth keeping straight, since the second
                  reading is the intuitive one and it is the one that breaks.
                </p>
                <KeepInMind>
                  Among perfectly bound pairs the score is one over the count, so
                  the strongest evidence of belonging together is scored worse the
                  more of it there is. Any implementation reaching that region is
                  making an arbitrary choice, and the minimum count of section 18
                  is the usual way of keeping out of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. What the ratio is not maximising">
                <p>
                  Section 4 derived the score as the likelihood gain one
                  occurrence of a merge produces. The gain the whole corpus makes
                  is that quantity multiplied by how many occurrences there are,
                  and the rule does not do the multiplication. So the pair that
                  raises the corpus likelihood most is not generally the pair
                  this rule takes.
                </p>
                <Equation>
                  {"total gain  =  count(a, b) × log( N × score(a, b) )"}
                </Equation>
                <p>
                  On the four words, where the corpus is 79 symbols long, that
                  total is largest for the pair s followed by t, at 19.55. The
                  pair the score takes, i followed by d, gains 9.81, and the pair
                  counting takes, e followed by s, gains 13.83. So neither rule
                  takes the pair that most raises the quantity the score was
                  derived from, and the pair that does is ranked fourth by the
                  score and joint first by the count, losing that tie on
                  alphabetical order.
                </p>
                <WhyThisWorks title="Why the multiplication is left out">
                  <p>
                    Doing it properly would restore most of what the count rule
                    was criticised for in Part 1, since the factor in front is the
                    count and a common pair carries a large one. The published
                    rule is the per-occurrence figure, which is a deliberate lean
                    away from frequency and towards association, rather than an
                    approximation to the total that somebody failed to finish. It
                    is worth knowing that it is not the greedy maximiser of the
                    likelihood it is usually described as maximising.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The rule greedily maximises association per occurrence, where
                  the derivation it is usually presented with would maximise total
                  likelihood gain, and on the four words those pick different
                  pairs at the very first turn.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. When the greedy cut can fail, and when it cannot">
                <p>
                  Taking the longest piece at each position is greedy, and the
                  worry that goes with any greedy rule is that it takes too much
                  early and leaves a remainder it cannot finish, when some other
                  division of the same word would have worked. It is worth being
                  precise about when that can happen, because it is a fact about
                  the vocabulary rather than about the cut.
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

              <SubSection title="23. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs on which the method
                  is not approximate but undefined, together with what has to be
                  decided in each case and what turns on the decision. Some are
                  genuinely open, with defensible answers on both sides, and those
                  are the ones worth attention, since they are decisions anybody
                  implementing this has to make and nothing in the mathematics
                  makes them.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "two pairs with the same score",
                      reason:
                        "the rule is indifferent, so no answer is more correct. Some order must be imposed and any order is arbitrary; comparing the candidates as text at least makes the fit repeatable, where taking whichever was met first makes it depend on the order the texts arrived in. On the four words the first turn is such a tie and it is settled by one character sitting at 9601 and another at 105.",
                    },
                    {
                      expression: "a pair whose halves never occur apart",
                      reason:
                        "scored one over its own count, which falls as the evidence grows. The division is safe, since each half is counted everywhere including inside the pair; it is the intuitive version, dividing by the halves’ free occurrences, that is undefined rather than infinite. Either way the rule stops discriminating usefully in this region and a minimum count is what keeps a run out of it.",
                    },
                    {
                      expression: "a pair seen exactly once",
                      reason:
                        "a decision rather than a fact. Its score is computed from one word, so merging it memorises that word; refusing it means a corpus of entirely distinct words learns nothing. And the refusal has to be a filter on the candidates rather than a test on the winner, or under this score the run ends early with common pairs unmerged.",
                    },
                    {
                      expression: "the pair that most raises the likelihood",
                      reason:
                        "not what the rule takes. The rule compares the gain one occurrence makes and never multiplies by how many occurrences there are, so on the four words it takes a pair gaining 9.81 while a pair gaining 19.55 is available. Restoring the multiplication would restore most of the preference for frequency the rule exists to avoid, so this is a choice rather than an oversight.",
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
                        "not asked for, and here not different either. Longest match is greedy, but with every symbol of the corpus in the vocabulary a single character is always available at any position after the first, so the cut succeeds whenever any division does. Cap the alphabet, as a real vocabulary does, and the guarantee goes with it.",
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
      ]}
    />
  );
}
