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
import { AgainstMerging } from "@/components/widgets/AgainstMerging";
import { EstimationRounds } from "@/components/widgets/EstimationRounds";
import { PieceLosses } from "@/components/widgets/PieceLosses";
import { SentencePair } from "@/components/widgets/SentencePair";
import { ShrinkingTrace } from "@/components/widgets/ShrinkingTrace";
import { SpellingLadder } from "@/components/widgets/SpellingLadder";
import { UnigramPlayground } from "@/components/widgets/UnigramPlayground";
import { WordLattice } from "@/components/widgets/WordLattice";

export const metadata: Metadata = {
  title: "The Unigram Language Model · oop_ml",
  description:
    "Start from a large vocabulary and remove what is least missed. Every piece carries a probability, so a word has many possible cuts and one of them is most likely.",
};

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function UnigramLanguageModelPage() {
  return (
    <ConceptPage
      title="The Unigram Language Model"
      tagline="Start from a large vocabulary and remove what is least missed, which is the opposite direction from merging. Every piece carries a probability, so a word has many possible cuts and one of them is most likely."
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
      history={
        <>
          <p>
            Taku Kudo published the method at the Association for Computational
            Linguistics meeting in 2018, in a paper called &ldquo;Subword
            Regularization: Improving Neural Network Translation Models with
            Multiple Subword Candidates&rdquo;. The problem he was working on
            was not vocabulary size, which byte pair encoding had already
            settled well enough, but the fact that a translation model trained
            on subword pieces only ever sees one cut of each word. Cutting is
            ambiguous, and the model has no way to learn that a word it met as
            three pieces in training is the same word when a different corpus
            offers it as two. He wanted to hand the model several cuts of the
            same word during training, in proportion to how plausible each was,
            and that is impossible with a merge list, since replaying merges in
            rank order gives exactly one answer with no notion of how good it is.
          </p>
          <p>
            So he needed a model that assigns a number to a cut, and he built
            the simplest one that does. Give every piece a probability, treat a
            word as pieces drawn independently from that table, and a cut of a
            word then has a probability which is the product of its pieces&rsquo;
            probabilities. Estimating those probabilities from a corpus is the
            classic expectation-maximisation problem, since which cut produced
            each word is exactly the thing that was not observed. The vocabulary
            itself is then chosen by starting far too large and dropping the
            pieces the corpus can most easily do without. Mike Schuster and
            Kaisuke Nakajima had used a likelihood criterion in 2012, in work on
            Japanese and Korean voice search, but they scored a <em>merge</em> by
            it and still grew the vocabulary upward; Kudo ran the whole
            procedure in the other direction.
          </p>
          <p>
            Later the same year Kudo and John Richardson released SentencePiece,
            a tokenizer that ships both this method and byte pair encoding
            behind one interface, which is why the two are so often offered as a
            switch. ALBERT, XLNet and T5 all read pieces chosen this way. Kaj
            Bostrom and Greg Durrett compared the two at matched vocabulary
            sizes in 2020 and reported that the unigram model&rsquo;s pieces sit
            closer to where a linguist would cut. This page asks six questions in
            order. What does merging leave undecided that a probability settles?
            What does giving a piece a probability actually change about how a
            word is cut? How is the likeliest cut found, when a six-letter word
            has twenty-eight of them? What is one piece worth, and how is that
            measured? How does the shrinking proceed, and where does it stop?
            And where, on the corpus in front of us, does this method cost more
            than the one it is usually offered against?
          </p>
        </>
      }
      playground={<UnigramPlayground />}
      sections={[
        {
          title: "Part 1. What Merging Leaves Undecided",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. The corpus, the sentence, and what is being chosen">
                <p>
                  Every page in this section carries the same sentence, and this
                  one carries two corpora beside it. The large one is eighteen
                  short sentences of ordinary English about reports and costs
                  and analyses, holding 72 distinct words across 133 occurrences
                  and spelled in 51 symbols. The small one is four words with
                  their counts, low five times, lower twice, newest six times
                  and widest three, which is the example the original subword
                  paper worked through and is small enough that every number on
                  this page can be checked by hand. Neither corpus contains the
                  sentence.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>
                  What is being chosen, in both cases, is a set of pieces. Any
                  set that contains every symbol the corpus uses can spell any
                  text written in those symbols, so the question is never
                  whether a vocabulary works but which of the enormous number of
                  workable ones to take. Written out in characters the large
                  corpus is 648 pieces long and the sentence is 45; the smallest
                  vocabulary that can exist on it is 52 rows, one per symbol
                  plus one for anything unspellable.
                </p>
                <KeepInMind>
                  A tokenizer is judged on text it has not seen. Every number on
                  this page is either about a corpus a vocabulary was learned
                  from or about a sentence that was deliberately kept out of it,
                  and the two often point in opposite directions.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A piece is in the vocabulary because of the moment it was added">
                <p>
                  Byte pair encoding grows the vocabulary. It starts at single
                  characters and repeatedly joins the commonest adjacent pair,
                  so a piece exists because at some step it was the best
                  available join. Nothing later revisits that decision. Once a
                  piece has been added, every later count is taken on a corpus
                  already respelled to use it, which means the whole rest of the
                  run is conditioned on a choice made when very little was known.
                </p>
                <p>
                  Look at what that does on the four words. Merging them to a
                  vocabulary of 22 rows makes newest and low into single pieces,
                  but lower occurs only twice and never gets one; it comes out
                  as lo, then w, then e, then r with its end-of-word mark, four
                  pieces for a word the corpus definitely contains. The pieces are all
                  frequent and the cut is defensible at every step, and yet the
                  finished vocabulary spends four rows on a word it holds and
                  cannot say that spelling it whole would have been better.
                </p>
                <p>
                  The deeper trouble is that the merge list gives one answer and
                  offers no way to ask how good it is. Replay the merges on a
                  word and you get a cut; there is no second cut to compare it
                  with and no number attached to either. That is fine when the
                  cut is the only thing wanted, and it is exactly what fails when
                  a model would learn more from meeting several cuts of the same
                  word.
                </p>
                <KeepInMind>
                  A merge list holds no number that could be used to compare one
                  cut of a word with another, so it cannot notice that spelling
                  lower whole would have cost three pieces fewer than the four it
                  hands back. Giving every piece a probability is what supplies
                  that number, and everything else on this page follows from
                  having it.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Running the procedure the other way round">
                <p>
                  Kudo&rsquo;s change is easier to state than it looks. Instead
                  of starting small and adding, start with a vocabulary far
                  larger than anything wanted, give every piece in it a
                  probability, and then remove pieces, a fraction at a time,
                  choosing at each step the ones whose loss would cost the
                  corpus least. A piece survives not because of a step it won
                  long ago but because, right now, with the whole rest of the
                  vocabulary present, the corpus would be measurably harder to
                  spell without it.
                </p>
                <p>
                  That is a statement about the whole vocabulary rather than
                  about one greedy join, and it is only possible because there
                  is now a number to compare. The number is the corpus&rsquo;s
                  likelihood under the model, which is what the next two parts
                  build.
                </p>
                <KeepInMind>
                  Growing and shrinking optimise different quantities, so they
                  arrive at different vocabularies given the same corpus and the
                  same budget. Part 5 measures how different, and at 100 rows on
                  the eighteen sentences one of them spends all 48 of its
                  learned rows on whole words of the corpus while the other
                  spends 8 of its 48 that way.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. What a Probability on a Piece Buys",
          content: (
            <>
              <SubSection title="4. Every piece gets a number, and the numbers add to one">
                <p>
                  The model is a table. On the left, every piece; on the right, a
                  probability, and the probabilities over the whole table add to
                  one. Nothing else. To start it off, take every substring the
                  corpus contains, count how often each occurs, and give each one
                  its share of the total count, so a substring seen twice as
                  often begins twice as likely.
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
                  <p>
                    The piece est, with the mark saying a word ended there,
                    occurs once inside newest and once inside widest. Newest
                    occurs 6 times and widest 3, so the candidate is credited
                    with 9. The candidates are ranked by that count multiplied
                    by how many symbols the piece spans, which is 3 here for a
                    score of 27, so that a long piece is not automatically beaten
                    by the letters inside it. Every single symbol is kept
                    whatever it scores, since a vocabulary that cannot spell the
                    corpus has no likelihood at all.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The starting table is deliberately far too large, and it is
                  not a guess about what the pieces ought to be. On the eighteen
                  sentences it holds 866 candidates against a finished
                  vocabulary of 137, and choosing which 137 is the whole of the
                  method.
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
                  The row worth looking at is the fourth. Merging the same four
                  words to a vocabulary of 22 rows cuts lowest as lo, then w,
                  then est with its mark, and that cut is here, ranked fourth,
                  holding 3.10% of the word. It is not wrong; it is one of the
                  28 and it is a perfectly ordinary member of the list. What
                  merging cannot do is see the other 27, so it cannot notice that
                  three of them are more probable and that one of them is fifteen
                  times as probable.
                </p>
                <p>
                  Switch the widget to lower and the gap is wider. The starting
                  table gives lower spelled whole 92.90% of the word, and the
                  merged vocabulary&rsquo;s four-piece cut ranks twelfth of
                  sixteen. Switch to newest, which merging does learn whole, and
                  the two agree at 85.45%, which is worth seeing as well, since
                  the point is not that merging is usually wrong.
                </p>
                <KeepInMind>
                  A probability turns one cut into a ranked list of cuts, and
                  the ranking is what merging never had. On lowest the cut
                  merging produces sits fourth of 28 at 3.10%, which is a fact
                  neither method could state before there was a number on each
                  spelling.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The probability of the word itself">
                <p>
                  There are now two different questions about a word and they
                  have two different answers. The first is which spelling is
                  likeliest, which is a maximum over the list. The second is how
                  probable the word is at all, which is the total over the list,
                  since the model could have produced the word by any of those
                  routes and they are alternatives rather than requirements.
                </p>
                <Equation>{"P(word)  =  Σ over spellings s of the word   P(s)"}</Equation>
                <p>
                  The total is never below the maximum, and the two are equal
                  exactly when the word has one spelling only. Dividing one
                  spelling&rsquo;s probability by the word&rsquo;s total gives
                  that spelling&rsquo;s share, which is what the widget above
                  prints, and the shares over a word&rsquo;s spellings add to
                  one. Those shares are the thing Kudo wanted in the first place,
                  since drawing a spelling in proportion to its share is exactly
                  how a model gets to see several cuts of one word.
                </p>
                <WhyThisWorks title="Why the total is the more natural quantity, and the maximum is what gets used">
                  <p>
                    The total is what the model actually says about the word,
                    and it is the quantity the estimation in Part 4 improves.
                    The maximum is a convenience. A tokenizer has to hand a model
                    one sequence of ids, so it hands over the likeliest
                    spelling, and the pruning step in section 14 uses the maximum
                    too, because computing the exact drop in the total for every
                    candidate piece would mean running the sum for every word
                    against every piece. That substitution is Kudo&rsquo;s, it is
                    an approximation rather than a definition, and it is what
                    makes the whole procedure affordable.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Which spelling is likeliest is a maximum over the list, and
                  how probable the word is at all is a total over it. Both read
                  the same table and the next Part computes them the same way,
                  so nothing is being paid twice for having two questions.
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
                  Twenty-eight spellings for a six-symbol word is already too
                  many to list at any real scale, and the count grows roughly
                  like two to the power of the word length. Nothing is enumerated
                  in practice, and the reason nothing has to be is a change of
                  view. Stop thinking about which pieces a word is made of and
                  think instead about the positions <em>between</em> its symbols.
                  A word of six symbols has seven positions, numbered 0 to 6, and
                  a piece is a step from one position to a later one.
                </p>
                <WordLattice />
                <p>
                  A spelling of the word is then a walk from position 0 to
                  position 6 taking any steps available, and the count of walks
                  is the count of spellings. Seventeen pieces of the starting
                  table span a pair of these positions, and those seventeen steps
                  admit exactly 28 walks. The picture is worth the paragraph
                  because it converts a question about sets of pieces into a
                  question about paths through a small graph, and paths through a
                  graph are something we know how to search without listing them.
                </p>
                <KeepInMind>
                  Once a piece is an arc between two positions, a spelling is a
                  walk, and the search for the best walk never has to build a
                  walk. Seventeen arcs stand for 28 spellings on a word of six
                  symbols, and the gap between those two numbers is what the
                  rest of this Part exploits.
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
                  Replacing the maximum with a sum answers the other question at
                  the same cost. Where the first recurrence keeps the best route
                  into each position, the second keeps the total over all routes
                  into it, and its last entry is the probability of the word.
                  Both are one pass over the same arcs.
                </p>
                <Equation>{"total(j)  =  Σ over pieces p ending at j   total(start of p) × P(p)"}</Equation>
                <KeepInMind>
                  Two recurrences, identical except that one takes a maximum
                  where the other takes a sum. That is the entire difference
                  between the likeliest spelling and the probability of the word.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Two rules settle every tie">
                <p>
                  Two spellings can reach exactly the same score, as low with est
                  and lowe with st do above, and then the recurrence has to be
                  told what to prefer. The first rule is fewer pieces, which is
                  the one worth having, since a model reading the answer pays per
                  piece. The second, for a tie that survives the first, is the
                  longer piece at the earliest position where two spellings
                  differ.
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
                  A tie means the model is genuinely indifferent, so no rule for
                  breaking it is more correct than another. What a rule does buy
                  is that two runs on the same corpus give the same answer,
                  rather than an answer that depends on the order the words
                  arrived in.
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
                  Words are short, so this is not the reason anything on this
                  page is slow. The usual repair, where it matters, is to hold
                  the pieces in a structure that lets the spans starting at a
                  position be enumerated in one walk, which takes the cost to n
                  times the length of the longest piece. That is an optimisation
                  of this search rather than a different search.
                </p>
                <InAModel>
                  <p>
                    At the scale a real tokenizer runs at the vocabulary is tens
                    of thousands of pieces and the encoding is done on billions
                    of words, so the difference between those two costs is the
                    difference between a usable tokenizer and an unusable one.
                    The arithmetic is unchanged.
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
          title: "Part 4. Estimating the Numbers, and Pricing a Piece",
          content: (
            <>
              <SubSection title="12. The probabilities are not known">
                <p>
                  Everything so far assumed the table. The frequencies it was
                  seeded from are a reasonable start and they are not the answer,
                  because they count every occurrence of every substring
                  including the ones that overlap, and a word was in truth
                  produced by one spelling rather than by all of them at once.
                  What we would like is the probability of each piece given how
                  the corpus was actually spelled, and how the corpus was
                  actually spelled is precisely what nobody observed.
                </p>
                <p>
                  That shape of problem has a standard treatment. Guess the
                  probabilities, work out what the hidden thing probably was
                  given the guess, then re-estimate the probabilities as though
                  that were what happened, and repeat. Each round raises the
                  corpus&rsquo;s likelihood or leaves it alone, so the walk
                  climbs and settles, though it settles at a local maximum rather
                  than the best one that exists.
                </p>
                <KeepInMind>
                  The hidden quantity is which spelling produced each word. Once
                  that is named, the estimation is the ordinary one, and the two
                  recurrences of Part 3 are exactly the machinery it needs.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Expectation, then maximisation">
                <p>
                  The first step asks how often each piece was probably used. For
                  a piece spanning two positions of a word, the chance that the
                  word&rsquo;s spelling went through that arc is the total over
                  routes reaching its start, times the piece&rsquo;s own
                  probability, times the total over routes finishing from its
                  end, divided by the total over all routes through the word. The
                  second recurrence of section 9 supplies the first of those and
                  its mirror running the other way supplies the third. Multiply
                  by how often the word occurs, add up over the corpus, and every
                  piece has an expected count.
                </p>
                <Equation>{"expected count of p  =  Σ over words w   count(w) × P(the spelling of w goes through p)"}</Equation>
                <p>
                  The second step is a division. Give each piece its share of the
                  expected counts, which are no longer whole numbers but are
                  otherwise exactly what counting would have produced had the
                  spellings been visible.
                </p>
                <EstimationRounds />
                <p>
                  The panel above works the smallest corpus that has a choice in
                  it. One word ab, seen once, with the three pieces a, b and ab
                  all at a third. The word can be spelled whole at a third or in
                  two pieces at a ninth, so the word&rsquo;s own probability is
                  four ninths and the one-piece spelling holds three quarters of
                  it. The expected counts are therefore 0.75 for ab and 0.25 each
                  for a and b, adding to 1.25, and the division gives 0.6, 0.2
                  and 0.2. A second round takes the whole spelling to 0.882.
                </p>
                <p>
                  The second panel is where I found something I had not expected.
                  Run the same two steps on the four words and the model does not
                  merely improve, it becomes certain. Low spelled whole goes from
                  0.020 to 0.265 to 0.312 and then stops, at exactly five
                  sixteenths, which is the share of the corpus that word
                  occupies. Meanwhile lo, which no occurrence needs, goes from
                  0.028 to 0.011 to 0.000134 and keeps falling. The likeliest
                  spelling of lowest never changes, and its score falls from
                  &minus;7.30 to &minus;9.45 to &minus;18.39 to &minus;36.75 to
                  &minus;73.50, roughly doubling every round.
                </p>
                <KeepInMind>
                  On a corpus of four repeated words there is nothing left for
                  the model to be uncertain about, so it stops being uncertain,
                  and a word the corpus does not contain becomes arbitrarily
                  improbable while remaining spellable. That is correct
                  behaviour on a corpus this degenerate rather than a fault, and
                  it is worth seeing because it is what a real corpus does a
                  little of everywhere.
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
                  On the four words the answer is stark. Four pieces carry the
                  entire corpus. Dropping newest costs 91.26 nats of likelihood,
                  low costs 85.04, widest 45.63 and lower 34.02, and those four
                  are the four words themselves. On the eighteen sentences the
                  ranking is the frequency ranking of the corpus&rsquo;s own
                  words, with the at 339.32, capitalised The at 229.02, was at
                  187.94, expected at 88.02 and analysis at 85.65.
                </p>
                <KeepInMind>
                  A piece is priced by what its absence would cost, measured on
                  the likeliest spelling rather than on the full total. That
                  substitution is an approximation and it is deliberate, since
                  the exact quantity would need a fresh pass over every word for
                  every candidate.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Most pieces are worth nothing at all">
                <p>
                  The measurement that surprised me is in the readouts above
                  rather than in the bars. On the four words, 34 of the 38 pieces
                  the pruning is allowed to touch cost exactly zero. On the
                  eighteen sentences it is 745 of 815, which is 91% of them.
                  These are not small numbers rounded down; they are zero to the
                  last bit, which means the objective has no preference at all
                  about whether those pieces stay.
                </p>
                <p>
                  There are two ways a piece gets there and both are ordinary. It
                  may lie on no word&rsquo;s likeliest spelling, in which case
                  removing it changes nothing by construction. Or it may lie on
                  one, and the spelling that replaces it may be exactly as
                  probable, which happens whenever two arcs cover the same
                  symbols at the same total score. Either way the objective is
                  indifferent about whether that piece stays.
                </p>
                <p>
                  So the ranking that decides which pieces survive separates a
                  handful of pieces from each other and leaves the great majority
                  tied at the bottom, and among those the order has to come from
                  somewhere else. Here it comes from alphabetical order, which
                  is arbitrary and at least repeatable. Ask the four words for 22
                  tokens and the six pieces
                  kept above the four words themselves are de, des, dest, er, es
                  and est, which are the first six in alphabetical order among 34
                  candidates the objective could not tell apart.
                </p>
                <KeepInMind>
                  Between two sizes, the pieces a vocabulary gains are often
                  pieces the objective had no opinion about. Anything read into
                  which of them appeared is being read into a tie-break rather
                  than into the corpus.
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
                  A large seed is not a cost to be minimised. Everything the
                  method can ever choose has to be in it, so a seed that is too
                  small removes options before any evidence has been consulted,
                  which is the very failure the whole design was arranged to
                  avoid. At a real scale the seed is capped, typically at a few
                  times the target size, and that cap is the one place where a
                  piece is discarded on frequency alone.
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
                  The pieces are not removed one at a time, and the reason is
                  that the losses were all measured against the same table.
                  Remove one piece and every other piece&rsquo;s loss is in
                  principle different, since a word that had been leaning on the
                  removed piece now leans somewhere else. Recomputing after every
                  removal would be correct and would cost a full pass per piece,
                  so instead a fixed share is dropped at once and everything is
                  re-estimated before the next round.
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
                  Two things stop the shrinking. The obvious one is reaching the
                  size asked for. The other is that a single symbol is never a
                  candidate for removal, whatever it costs, because a vocabulary
                  that cannot spell every symbol the corpus uses assigns some
                  word a probability of zero and the whole corpus a likelihood of
                  zero, at which point nothing can be compared with anything.
                  Asking for fewer rows than the alphabet has is therefore
                  refused rather than approximated.
                </p>
                <KeepInMind>
                  The share dropped per round is a trade between how often the
                  losses are refreshed and how long the fit takes. Dropping
                  everything in one round would use figures measured on a table
                  that no longer exists.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What the vocabulary turned out to be made of">
                <p>
                  Here is the result I did not predict, and it is the most
                  informative thing on the page. Take the eighteen sentences,
                  ask for 100 tokens, and look at what the 48 pieces above the
                  alphabet actually are. Every single one of them is a whole word
                  of the corpus with its end-of-word mark, and there is not a
                  stem or a suffix or a frequent letter pair among them. At 80
                  the same thing holds for all 28, and only at 137, once the
                  corpus has run short of words to buy, do 15 pieces appear that
                  are something else, among them Augus and the apostrophe
                  followed by t.
                </p>
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
                    A word that occurs three times contributes its likelihood
                    three times, and spelling it as one piece rather than eight
                    replaces eight small probabilities with one larger one. The
                    saving is largest exactly where the corpus repeats itself
                    most, which for any corpus is at whole frequent words. A
                    fragment, by contrast, only pays where it is shared between
                    words, and on a corpus of 72 distinct words there is not much
                    sharing to be had.
                  </p>
                </WhyThisWorks>
                <InAModel>
                  <p>
                    This corpus is 133 word occurrences, so 100 rows really can
                    hold most of it and the method is behaving reasonably by
                    doing so. On billions of words no vocabulary holds the words,
                    the repetition that pays is in endings and stems and common
                    prefixes, and the pieces come out looking much more like
                    pieces. The direction of the effect survives the change of
                    scale even though this extreme form of it does not, which is
                    what Bostrom and Durrett measured when they found these
                    vocabularies sitting closer to morphological boundaries.
                  </p>
                </InAModel>
                <KeepInMind>
                  What a vocabulary is made of is decided by what is being
                  maximised, not by the size it was given. Two methods at 100
                  rows on one corpus produced 48 whole words and 8.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Against a vocabulary of the same size grown by merging">
                <p>
                  The honest comparison is at matched sizes, since the two
                  methods reach different vocabularies at the same budget and
                  neither can be given the other&rsquo;s. Fit both on the
                  eighteen sentences at fourteen sizes and count two things at
                  each, what the corpus costs in pieces and what the one held-out
                  sentence costs.
                </p>
                <AgainstMerging />
                <p>
                  On the corpus the shrunk vocabulary wins everywhere and wins by
                  a lot. At 80 tokens it reads the corpus in 324 pieces against
                  merging&rsquo;s 414; at 137 it reads it in 133 against 263,
                  which is a little over half. And 133 is the floor, since
                  the corpus holds 133 word occurrences and one piece per word is
                  the fewest pieces any vocabulary can achieve. It reaches that
                  floor at 130 tokens and merging never comes near it.
                </p>
                <p>
                  On the held-out sentence it loses everywhere, and this is the
                  place on the page where the method is worse than the thing it
                  is usually offered against. At 80 tokens the shrunk vocabulary
                  reads the sentence in 40 pieces where merging reads it in 28.
                  At 137 the gap narrows to 28 against 25 and it never closes.
                  The same property is behind both columns. A vocabulary of whole
                  words is unbeatable on the words it holds and has almost
                  nothing to offer a word it does not, so the sentence&rsquo;s
                  expect, which the corpus never wrote without its ending, comes
                  back at 137 as six single letters.
                </p>
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
                  The training corpus and a held-out sentence disagree about
                  which method is better, at every size, on this corpus. Reading
                  either column alone would settle the question the wrong way.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The sentence at three sizes">
                <p>
                  It is worth seeing the pieces themselves rather than the
                  counts, since the two kinds of mistake look completely
                  different.
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
                  Gluing pieces back is mechanical. Concatenate them, then turn
                  every end-of-word mark into a space. The marks are inside the
                  pieces, so no separate record of where the spaces were is
                  needed, and the round trip is exact on any text spelled
                  entirely in symbols the corpus taught. The control sentence,
                  which is written in exactly those symbols, reads as 9 pieces at
                  a vocabulary of 137 and comes back exactly.
                </p>
                <p>
                  The running sentence does not come back, at any size, and the
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
                  This is a fact about spelling words with a mark on the last
                  character, and it is shared with every method in this section
                  that spells them that way. Nothing about probabilities makes it
                  better or worse.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="22. Pieces drawn independently, which language is not">
                <p>
                  The name says the assumption out loud, which is unusual and is
                  worth crediting. A unigram model over pieces is a model in
                  which each piece is drawn without reference to the pieces
                  around it, so the probability of a spelling is a product with
                  no conditioning in it anywhere. That is false about language in
                  the most obvious way available. The probability that the next
                  piece is ing depends enormously on whether the piece before it
                  was play or the.
                </p>
                <p>
                  Two consequences follow and they are different in kind. The
                  first is that the model&rsquo;s probability for a word is not a
                  serious estimate of anything, and nothing on this page or in
                  the method treats it as one; it is a score used to compare
                  spellings of the same word and to compare vocabularies, both of
                  which are relative judgements the independence assumption
                  affects far less. The second is that the assumption is what
                  makes the arithmetic a dynamic programme at all. A model in
                  which a piece depends on the one before it would need a state
                  per piece at every position and the lattice would grow by that
                  factor.
                </p>
                <p>
                  So the assumption is not a shortcut that could be dropped for
                  more accuracy at more cost. It is what buys the search, and any
                  richer model is a different method rather than this one tuned
                  up.
                </p>
                <KeepInMind>
                  The independence is load-bearing. It is the reason the likeliest
                  spelling can be found without enumerating spellings, and it is
                  the reason the number attached to a spelling should be read as
                  a comparison and not as a belief about language.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Shrinking is greedy too, in the other direction">
                <p>
                  Part 1 said that merging is greedy and never revisits a piece
                  it added. It is worth being exact about what shrinking fixes
                  and what it does not, because the improvement is real and
                  smaller than it first looks. Each removal here is chosen with
                  the whole current vocabulary in view, which is genuinely better
                  than choosing a join with almost nothing in view. But a piece
                  once removed is gone, and its loss was computed while every
                  other piece was still present.
                </p>
                <p>
                  The case that shows the gap is a pair of pieces that stand in
                  for each other. Suppose two pieces cover the same ground, so
                  that with both present each is nearly free and both are ranked
                  near the bottom. Drop one, and the other has become valuable;
                  drop them in the same round, as a round dropping a quarter of
                  the table well might, and the corpus loses something neither
                  loss predicted. Nothing in the procedure reconsiders the second
                  in the light of the first having gone, and nothing brings a
                  dropped piece back if it turns out to have been needed.
                </p>
                <p>
                  The measured shadow of this is section 15. When 91% of the
                  removable pieces on a corpus price at exactly zero, a great
                  many of them are zero <em>because something else is there</em>,
                  and the ranking cannot distinguish those from the ones that are
                  zero outright. Making the rounds smaller reduces the exposure
                  and makes the fit proportionately slower, and there is no
                  setting at which the effect is absent.
                </p>
                <KeepInMind>
                  Both methods are greedy and neither finds the best vocabulary
                  of a given size. What shrinking buys is that its greed operates
                  with more information, not that it has stopped being greedy.
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
                <p>
                  A sharper version of the same gap is available inside one
                  vocabulary, and the lattice of Part 3 is what makes it easy to
                  ask about. Leave the arcs exactly where they are and give every
                  one of them a cost of one instead of a log probability, and the
                  same recurrence answers a different question, which is the
                  fewest pieces this vocabulary can spell the word in. Sequence
                  length is what everything downstream pays in, so that is a
                  reasonable thing to want, and there is no reason the two
                  answers have to agree, since two common pieces can outscore one
                  rare one.
                </p>
                <p>
                  I expected them to disagree often and measured it rather than
                  asserting it. Over 88 words at a vocabulary of 200, comprising
                  every word of the corpus and sixteen held-out ones, exactly one
                  comes out longer than it needed to be.
                </p>
                <WorkedExample title="The one word where they part">
                  <p>
                    That word is didn&rsquo;t. The vocabulary holds the two-symbol
                    piece &rsquo;t with its end-of-word mark, so five pieces are
                    available. The model takes six, splitting the apostrophe from
                    the t, because the apostrophe and the marked t are common
                    enough separately to beat the joined piece. Scored whole, the
                    six-piece spelling comes to &minus;2122.86 and the five-piece
                    one to &minus;2246.46. Fewer pieces, less probable, and the
                    model is choosing correctly by its own objective while giving
                    the longer answer.
                  </p>
                </WorkedExample>
                <p>
                  One word in 88 is not a crisis, and the small number is the
                  honest finding here rather than a disappointing one. What it
                  shows is that on this corpus likelihood and length agree almost
                  always without being the same thing. Making the count the
                  objective on both sides, so that the vocabulary is chosen to
                  keep the corpus short and the cut is the shortest one that
                  vocabulary allows, is a separate method with its own answers,
                  and the arithmetic it needs is the arithmetic already on this
                  page with the arc costs changed.
                </p>
                <p>
                  The other half of the gap has no measurement here and I will
                  not pretend otherwise. Whether these pieces make a better input
                  for a model to learn from is a question about the model, not
                  about the tokenizer, and nothing on this page trains one.
                </p>
                <KeepInMind>
                  The likeliest cut is the answer to the question the method
                  asks. Whether it is the useful cut depends on what reads it,
                  and the two came apart once in 88 words here on length alone.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs on which the method
                  does not become approximate but stops being defined, together
                  with what has to be decided in each case and what turns on the
                  decision. Several of them are genuine open choices with
                  defensible answers on both sides, and those are the ones worth
                  a reader&rsquo;s attention, since they are the decisions
                  anybody implementing this has to make and nothing in the
                  mathematics makes them.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a vocabulary that cannot spell some word",
                      reason:
                        "undefined, not merely bad. That word has probability zero, the corpus is a product containing a zero, and its log likelihood is minus infinity, so no two such vocabularies can be compared and the ranking that drives the whole procedure has nothing to rank. This is why a single symbol is never a candidate for removal and why a vocabulary smaller than the alphabet is refused rather than approximated; on the eighteen sentences that floor is 52 rows.",
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
                        "not what is measured. The definition is the fall in the corpus’s total probability, summed over every spelling of every word; what is computed is the fall in the likeliest spelling’s probability, over the words that were using the piece. The substitution is what keeps a round affordable, and it means the reported price is a lower bound on the true one rather than the true one.",
                    },
                    {
                      expression: "the best vocabulary of a given size",
                      reason:
                        "not what is found, and not findable by this procedure. Pieces are removed a fraction at a time on prices measured while every other piece was still present, so a piece that would have become valuable once its substitute went is never reconsidered. Making the fraction smaller reduces the exposure and slows the fit; nothing removes it.",
                    },
                    {
                      expression: "the best estimate of the probabilities",
                      reason:
                        "also not what is found. Alternating expectation and re-estimation climbs to a local maximum of the corpus likelihood, and which one it climbs to is decided by where it started, which here is the seed frequencies. Nothing checks whether a better maximum exists elsewhere and nothing could, short of starting again from somewhere else.",
                    },
                    {
                      expression: "how many rounds of re-estimation to run",
                      reason:
                        "a decision with no principled answer here, since the walk converges rather than terminating. Too few and the prices are measured against probabilities that have not settled; too many and, on a small corpus, the model becomes certain in the way section 13 measures, where a word the corpus lacks falls from a score of −7.30 to −73.50 in four rounds while its spelling never changes.",
                    },
                    {
                      expression: "a symbol the corpus never used",
                      reason:
                        "unspellable, and the model must still answer something. Scoring it a fixed amount below the rarest piece in the table keeps the arithmetic finite and makes any spelling that avoids it win, which is the right ordering; what it cannot do is say which symbol was there. A byte alphabet removes the case entirely and pays in pieces, and there is no third option that keeps the symbol without enlarging the alphabet.",
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
                        "outside the method entirely. Nothing in a probability over pieces knows that a prefix is a prefix, so a piece spanning a prefix and a root is exactly as admissible as any other. What this method has instead is a tendency, measured rather than designed, which is that maximising likelihood on a corpus with repetition in it prefers pieces that recur, and pieces that recur in a real language are often the ones a linguist would name.",
                    },
                    {
                      expression: "a corpus with no repetition in it",
                      reason:
                        "defined, and it answers the question asked rather than the one intended. Every substring occurs once, so every candidate has the same frequency and the seed is ordered by length alone; there is no evidence about what a piece is worth because nothing is ever spelled twice. The four-word corpus is the opposite extreme and shows the same shape from the other side, where four pieces carry the entire corpus and 34 of 38 others are worth exactly nothing.",
                    },
                  ]}
                />
                <KeepInMind>
                  Four of these are decisions rather than limits, namely how the
                  ties among worthless pieces are ordered, how large a fraction
                  each round drops, how many rounds of re-estimation to run, and
                  what an unspellable symbol scores. Each has defensible answers
                  on both sides and each changes the finished vocabulary, so each
                  belongs in whatever describes a tokenizer rather than being
                  left to whoever writes it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
