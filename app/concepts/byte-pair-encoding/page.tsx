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
import { AlphabetComparison } from "@/components/widgets/AlphabetComparison";
import { ByteFallbackRepair } from "@/components/widgets/ByteFallbackRepair";
import { BytePairPlayground } from "@/components/widgets/BytePairPlayground";
import { MergeLadder } from "@/components/widgets/MergeLadder";
import { MorphemeConstraint } from "@/components/widgets/MorphemeConstraint";
import { PieceCountCurve } from "@/components/widgets/PieceCountCurve";
import { SentenceCuts } from "@/components/widgets/SentenceCuts";
import { SuperwordMerges } from "@/components/widgets/SuperwordMerges";
import { TieBranches } from "@/components/widgets/TieBranches";

export const metadata: Metadata = {
  title: "Byte Pair Encoding · oop_ml",
  description:
    "Start from single characters and repeatedly join the commonest adjacent pair. The merges, in the order they were learned, are the model.",
};

const MARKER = "</w>";
const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function BytePairEncodingPage() {
  return (
    <ConceptPage
      title="Byte Pair Encoding"
      tagline="Start from single characters and repeatedly join the commonest adjacent pair. The merges, in the order they were learned, are the model."
      prerequisites={
        <>
          You need only one thing from earlier in this section, which is that
          something has already decided where the words are before any of this
          runs. Everything below takes a text already cut into words on its
          spaces and asks a different question, which is what the pieces{" "}
          <em>inside</em> a word should be. No probability and no calculus
          appear on this page. Counting, and a rule for what to do when two
          counts are equal, is the whole of it.
        </>
      }
      history={
        <>
          <p>
            Philip Gage published the method in February 1994 in The C
            Users Journal, as a compression scheme, under the name byte pair
            encoding. His problem was that the usual dictionary compressors of
            the day were slow to decompress, and his idea was to find the pair
            of adjacent bytes that occurs most often in a file, replace every
            occurrence with a byte value the file does not use, record the
            substitution in a table, and repeat until no byte values are left.
            Decompression is then a matter of undoing the table, which is
            almost free. Nothing about the idea is linguistic, and Gage was not
            thinking about words at all.
          </p>
          <p>
            Rico Sennrich, Barry Haddow and Alexandra Birch, at the University
            of Edinburgh, borrowed it in 2016 for a problem that had nothing to
            do with file size. A neural translation model reads a fixed
            vocabulary, in those years typically thirty to fifty thousand
            words, and translation is open in a way that vocabulary cannot be,
            since a text will contain names, numbers, compounds and inflections
            that the training data never held. The usual repair was to emit a
            marker for an unknown word and patch it afterwards from a
            dictionary, which cannot work for a German compound that has no
            dictionary entry, or for a name that has to be transliterated
            character by character. Their paper, &ldquo;Neural Machine
            Translation of Rare Words with Subword Units&rdquo;, argued that a
            rare word can be translated by translating its parts, and adapted
            Gage&rsquo;s loop to merge characters rather than bytes, stopping
            when the vocabulary reaches whatever size was asked for. The
            replacement table stopped being a compression artefact and became
            the model.
          </p>
          <p>
            Three years later Alec Radford and colleagues changed the alphabet
            for the second version of their language model, merging over the
            256 byte values rather than over characters, so that no text
            anywhere can contain a symbol the vocabulary lacks. Taku Kudo and
            John Richardson&rsquo;s SentencePiece reached the same guarantee
            from the other side, keeping a character alphabet and adding a row
            per byte value underneath it for anything the alphabet lacks, under
            the name byte fallback; that is what the Llama and Gemma tokenizers
            were trained with, and section 12 is about why it is needed at all.
          </p>
          <p>
            This page asks six questions in order. Why does a vocabulary of
            whole words fail on a sentence it has not seen, and why is a
            vocabulary of characters not the answer? What does the merging loop
            actually do to a corpus? Why are the merges in the order they were
            learned the whole of the model? The method is usually sold on the
            promise that nothing it reads is ever out of vocabulary, so what is
            that promise actually true of, and what does closing the gap cost?
            What does a vocabulary size buy, and where does it stop buying
            anything? And what do the three variants change, each of which
            changes exactly one thing?
          </p>
        </>
      }
      playground={<BytePairPlayground />}
      sections={[
        {
          title: "Part 1. What a Fixed Vocabulary Cannot Read",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. One sentence, and a corpus that never contained it">
                <p>
                  Every page in this section carries the same sentence, and this
                  one carries a corpus beside it. The sentence is the one below,
                  and I wrote the corpus myself, eighteen short sentences of
                  ordinary English about reports and costs and analyses, chosen
                  so that every character the sentence uses turns up somewhere
                  in them and so that the words are plausible neighbours of the
                  sentence&rsquo;s own. The corpus does not contain the
                  sentence, and that is the whole arrangement we are going to
                  study, since a vocabulary is only interesting on text it was
                  not built from.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>
                  Cut on its spaces the sentence is seven words, and the corpus
                  holds 72 distinct words across 133 occurrences. Five of the
                  seven are absent from it, namely Alvarez, didn&rsquo;t,
                  expect, low-cost and re-analysis with its full stop attached.
                  The corpus does have expected, and lower, and cost, and
                  analysis, which is exactly the situation a real corpus is
                  always in.
                </p>
                <KeepInMind>
                  A tokenizer is judged on text it has not seen. Anything that
                  reads its own training corpus perfectly has told us nothing,
                  so every number on this page is either about the corpus the
                  merges were learned from or about a sentence that was
                  deliberately kept out of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A vocabulary of whole words">
                <p>
                  Suppose we make the vocabulary out of the words the corpus
                  contains. That is 72 rows, and reading the sentence is then a
                  lookup per word. Two of the seven are found, the and the
                  abbreviation Dr. with its full stop. The other five are not,
                  and there is nothing the vocabulary can do about them except
                  hand back a single row meaning &ldquo;something was here and I
                  cannot say what&rdquo;. Five sevenths of the sentence arrives
                  at the model as that row, five times over, with nothing to tell
                  the five apart.
                </p>
                <p>
                  Making the vocabulary larger does not fix this, it only moves
                  the boundary. Whatever number we stop at, the words past it
                  are mostly words the corpus saw once, and a table built from
                  any corpus at all has a long tail of exactly that kind. A
                  proper name is the clearest case, since there is no size of
                  word table that contains the names.
                </p>
                <KeepInMind>
                  A vocabulary of whole words cannot spell a word it never met,
                  and the words it never met are not a rare accident. On this
                  corpus and this sentence they are five of seven.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. A vocabulary of single characters">
                <p>
                  The opposite choice has the opposite problem. Give the
                  vocabulary one row per character and almost nothing is
                  unspellable, since the sentence is made of characters and
                  every character it uses does turn up somewhere in the corpus.
                  The corpus uses 36 distinct characters, and the table comes to
                  51 rows rather than 36 because a character that ends a word is
                  kept apart from the same character inside one, for a reason
                  section 5 comes to. Either way it is a very small table, and
                  the sentence encodes to 45 pieces where a word vocabulary
                  needed 7, while the corpus goes from 133 words to 648 pieces.
                </p>
                <p>
                  I wrote almost, and the qualification is not a hedge. One of
                  those 45 pieces has no row in that table of 51, on a sentence
                  every character of which the corpus contains, and the reason
                  is the same distinction between 36 and 51 that the paragraph
                  above passed over. Sections 11 and 12 are about it, and it is
                  the most useful thing on this page.
                </p>
                <NumberTable
                  headings={["vocabulary", "rows", "the sentence", "the corpus"]}
                  rows={[
                    ["whole words", "72", "7 pieces, 5 of them unspellable", "133 pieces"],
                    ["single characters", "51", "45 pieces, 1 of them unspellable", "648 pieces"],
                  ]}
                  caption="Two extremes on the same corpus and the same sentence, both counted by the code behind this page."
                />
                <p>
                  Length is not a cosmetic cost. Whatever reads these pieces
                  spends work per piece, and a model that has to look at 45
                  positions to see one sentence is spending most of its capacity
                  learning that l followed by o followed by w spells a word it
                  will meet a thousand times. It also has to carry information
                  much further, since the beginning and the end of a thought are
                  now six times as far apart as they were.
                </p>
                <KeepInMind>
                  Neither table is wrong; they are the two ends of one trade,
                  where a word table reads this sentence in 7 lookups and cannot
                  spell 5 of them, and a character table takes 45 and cannot
                  spell 1. The useful question is whether anything lives in
                  between, and on this corpus there are 85 settings in between.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Byte pair encoding, between the two">
                <p>
                  Byte pair encoding is the thing in between, and the way it
                  gets there is worth stating before any detail. It does not
                  decide what a piece ought to be. It starts at the character
                  end, where almost nothing is unspellable, and then repeatedly
                  buys one shorter sequence with one more row of the table,
                  always buying whichever row shortens the corpus most. A
                  frequent word
                  is bought early and ends up as one piece; a rare one is never
                  bought and stays as a few pieces that are themselves frequent.
                </p>
                <p>
                  So the vocabulary size stops being a choice between two
                  regimes and becomes a dial. At the smallest setting we have
                  the character vocabulary; turning it up trades rows for
                  length, one row at a time, and every setting in between is
                  available. On the corpus above, a fit that has made no merge at
                  all reads the sentence in 46 pieces, and 85 merges later reads
                  it in 26, while the corpus falls from 648 pieces to 263.
                </p>
                <KeepInMind>
                  The method is one loop with one rule, run as many times as the
                  size we asked for allows. What it leaves behind at every
                  stopping point is a vocabulary that can spell any text written
                  in the symbols the corpus used, which is the property the word
                  table did not have. Symbols, not characters, and the gap
                  between those two words is section 11.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Growing a Vocabulary One Pair at a Time",
          content: (
            <>
              <SubSection title="5. Spelling a word, and marking where it ends">
                <p>
                  We need a corpus small enough to work by hand, so for the next
                  four sections we drop to four words with their counts, which is
                  the example Sennrich and colleagues worked in their own paper.
                  The word low occurs five times, lower twice, newest six times
                  and widest three, sixteen occurrences in all. Every word is
                  written out as its characters, and the last character of each
                  word carries a marker saying that a space follows it.
                </p>
                <Equation>{`low  =  l  o  w${MARKER}`}</Equation>
                <p>
                  The marker matters more than it looks. It makes the w that ends
                  low a different symbol from the w inside lower, which is
                  correct, since the two behave differently and a piece that ends
                  words is a different thing from a piece that continues them.
                  It also makes gluing the pieces back together a purely
                  mechanical operation, because the spaces are recorded in the
                  pieces rather than remembered separately. Counted this way the
                  four words are spelled in 11 distinct symbols and the corpus is
                  79 pieces long.
                </p>
                <WhyThisWorks title="Why the marker goes on the last character rather than between words">
                  <p>
                    A separate space symbol would be one more thing for the loop
                    to merge, and it would merge greedily with whatever sits
                    beside it, so a piece could end up straddling the gap between
                    two words before any word had been assembled. Putting the
                    marker on the last character instead keeps every merge inside
                    one word by construction, since the words are counted
                    separately and no pair ever spans two of them. Part 5 lifts
                    exactly this restriction on purpose, and the first thing that
                    happens there is worth seeing.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The end-of-word marker is not decoration. It separates
                  word-final pieces from word-internal ones, and it is what makes
                  gluing the pieces back together give the spaces back.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Counting adjacent pairs">
                <p>
                  Now count. For every word, look at each adjacent pair of
                  symbols and add the word&rsquo;s own count to that
                  pair&rsquo;s total, so a pair inside a word that occurs six
                  times is worth six. Nothing else is counted, and in particular
                  a pair that straddles two words is not a pair at all, because
                  the words are held apart.
                </p>
                <Equation>{"count(a, b)  =  Σ over words w   occurrences(w) × (times ab is adjacent inside w)"}</Equation>
                <WorkedExample title="The first count, on the four words">
                  <p>
                    The pair e followed by s occurs once in newest and once in
                    widest, so it scores 6 + 3 = 9. The pair s followed by the
                    marked t scores the same 9, for the same reason. w followed
                    by e occurs in lower and in newest, scoring 2 + 6 = 8, and l
                    followed by o occurs in low and lower, scoring 5 + 2 = 7.
                    Twelve distinct pairs exist in all, and the largest count
                    among them is 9.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The count is weighted by how often a word occurs, not by how
                  many distinct words contain the pair. A pair that appears once
                  inside a very common word beats a pair appearing in many rare
                  ones, which is what makes the method learn frequent words whole.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Joining the commonest pair, and repeating">
                <p>
                  Take the pair with the largest count, replace every occurrence
                  of it everywhere in the corpus with a single new symbol which
                  is the two written together, and add that symbol to the
                  vocabulary. Then count again on the respelled corpus and do it
                  once more. That is the whole loop, and it stops when the
                  vocabulary has reached the size we asked for, or earlier if no
                  pair is left that occurs at least twice.
                </p>
                <DerivationTable
                  expressionHeading="the step"
                  reasonHeading="what it does"
                  rows={[
                    { expression: "count every adjacent pair", reason: "weighted by how often each word occurs, and never across a word boundary" },
                    { expression: "take the largest count", reason: "which is exactly the number of pieces this merge is about to remove from the corpus" },
                    { expression: "join it everywhere", reason: "every occurrence at once, so the corpus is respelled in one pass" },
                    { expression: "add the joined symbol", reason: "one new row of the vocabulary, and one new merge on the record" },
                    { expression: "repeat", reason: "until the vocabulary is the size asked for, or nothing occurs twice any more" },
                  ]}
                />
                <p>
                  Notice what the count means once the merge is made. Joining a
                  pair that occurs nine times removes nine pieces from the
                  corpus, exactly, because each occurrence was two symbols and is
                  now one. So the count is not a proxy for anything; it is the
                  saving, in pieces, that the merge is about to make.
                </p>
                <KeepInMind>
                  Each merge costs one row of the vocabulary and saves as many
                  pieces as the pair was seen times. Taking the largest count is
                  taking the biggest saving available right now, which is not the
                  same as the biggest saving available over the whole run, and
                  Part 6 measures the difference.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Ten merges on four words">
                <p>
                  Run the loop ten times on the four words and the vocabulary
                  assembles itself in front of us. Drag the control and watch the
                  spellings shorten. The first merge joins e and s at 9; the
                  second joins that new es to the marked t, also at 9, so after
                  two steps the ending est with its marker is a single symbol
                  shared by newest and widest. By the seventh merge the whole
                  word low with its marker is one piece, and by the tenth every
                  one of the four words is a single piece.
                </p>
                <MergeLadder />
                <NumberTable
                  headings={["merges", "vocabulary", "the corpus, in pieces"]}
                  rows={[
                    ["0", "12", "79"],
                    ["1", "13", "70"],
                    ["2", "14", "61"],
                    ["3", "15", "54"],
                    ["5", "17", "42"],
                    ["7", "19", "31"],
                    ["10", "22", "22"],
                  ]}
                  caption="Every drop is the count that chose the merge, so the corpus falls by 9, then 9, then 7, and so on down to 3."
                />
                <InAModel>
                  <p>
                    Ten merges is a toy. A language model asks for tens of
                    thousands of rows, learned from a corpus of billions of words
                    rather than sixteen, and the loop is the same loop. What changes at that scale is
                    where the merges stop being letters joining into endings and
                    start being whole common words joining into single rows,
                    which happens early and then continues for a very long time.
                  </p>
                </InAModel>
                <p>
                  This walk, and the twenty-two-row table it ends on, are the
                  method exactly as Sennrich and colleagues published it, with
                  nothing added underneath. That is deliberate, because it keeps
                  the table small enough to read a row at a time; section 12
                  adds something underneath it and says what that costs.
                </p>
                <KeepInMind>
                  Sixteen word occurrences, eleven symbols, ten merges, and the
                  corpus falls from 79 pieces to 22. At the end every word of
                  the corpus is one piece, which is what running the loop until
                  it runs out looks like on a corpus this small.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. The Merges Are the Model",
          content: (
            <>
              <SubSection title="9. Encoding replays the merges in the order they were learned">
                <p>
                  Here is the part that is easy to miss. What the fit produced is
                  not really a list of pieces, it is a list of merges with an
                  order on them, and the order is load-bearing. To encode a new
                  word, spell it in characters with the marker on the last one,
                  then look for the earliest-learned merge that applies anywhere
                  in it, apply it, and look again. Stop when no learned merge
                  applies.
                </p>
                <Equation>{"rank of a merge  =  its position in the order it was learned, and earlier is applied first"}</Equation>
                <WorkedExample title="The word lowest, which those four words never contained">
                  <p>
                    Spelled out it is l, o, w, e, s, and the marked t. The
                    earliest applicable merge is the first one learned, e with s,
                    giving l, o, w, es, marked t. The next earliest that applies
                    is the second, es with marked t, giving l, o, w, est with the
                    marker. Then the third, l with o. After that nothing applies,
                    because lo followed by w was never merged, and the answer is
                    three pieces, lo and w and est with its marker. Every one of
                    the three is a symbol the corpus taught, and the last one
                    carries the fact that a word ended there.
                  </p>
                </WorkedExample>
                <p>
                  Reversing two merges gives a different tokenizer even though
                  the set of pieces is the same, since a merge only applies to
                  what the merges before it left behind. That is why a vocabulary
                  cannot be shipped as a set of strings, and why two people
                  holding the same rows will disagree about how to cut a word
                  unless they also agree on the order.
                </p>
                <KeepInMind>
                  The model is the ordered list of merges. The vocabulary is what
                  falls out of it, and the encoding of a new word is a replay of
                  the training run restricted to that word.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The running sentence, cut by a corpus that never saw it">
                <p>
                  Back to the eighteen sentences and the sentence they do not
                  contain. Fitted to the point where the corpus has no adjacent
                  pair left that it saw twice, the fit has learned 137 rows and
                  the sentence comes out as 26 pieces. Every one of the five
                  words the corpus never held is spelled, which is what the
                  method was for, and the way they are spelled is worth looking
                  at carefully.
                </p>
                <SentenceCuts />
                <p>
                  Two of the cuts land where no linguist would have cut, and a
                  third only looks as though it did. The hyphenated low-cost
                  comes apart as lo, w, the hyphen on its own, and cost with its
                  marker, so the first half is split between a piece that ends in
                  the wrong place and a leftover letter. The prefix in
                  re-analysis does come out as re, which looks like morphology
                  and is not, since re was merged at a count of 17 gathered from
                  every word in the corpus holding those two letters, were and
                  results among them. And analysis comes apart as analysi and
                  then a final s carrying the full stop.
                </p>
                <p>
                  That last one had a reason I did not expect, and the six
                  readings under the widget are what found it. The vocabulary
                  does hold a row for analysis; handed the word on its own it
                  answers one piece. But a row carries an end-of-word marker, and
                  in the sentence the word ends in a full stop rather than in an
                  s, so the row cannot apply and the fit falls back to the
                  longest thing that can. The same happens to cost, which is one
                  piece alone and the last of four inside low-cost. The clearest
                  case of it is expected against expect, where the corpus holds
                  the longer word and not the shorter, so expected is one piece
                  and its own stem is three.
                </p>
                <KeepInMind>
                  The pieces are frequent substrings of one particular corpus and
                  nothing else. A row for a word is a row for that word ending
                  where it ended in the corpus, so attaching a full stop, or a
                  hyphen, or nothing at all where a suffix used to be, can cost
                  several pieces without changing a letter.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Nothing is out of vocabulary, except a character">
                <p>
                  Gluing the pieces back is mechanical. Concatenate them, then
                  turn every marker into a space. Because the markers are inside
                  the pieces, no separate record of where the spaces were is
                  needed, and the round trip is exact on any text spelled
                  entirely in symbols the corpus taught. That last clause is
                  doing more work than it looks as though it is.
                </p>
                <p>
                  The sentence this method is usually sold with is that nothing
                  it reads is ever out of vocabulary. That sentence is true of
                  words and false of characters, which is worth separating out
                  carefully, since the two cases behave nothing alike. A word
                  the corpus never held is written out of smaller pieces and
                  arrives intact, and that is the whole achievement of Part 1. A
                  character the corpus never held has no smaller pieces to be
                  written out of, so there is nothing for the same mechanism to
                  do.
                </p>
                <p>
                  The reason is the loop rather than any choice made around it.
                  A merge joins two symbols that already exist, so every row the
                  fit ever adds is built from rows that were already there, and
                  the rows that were already there are the alphabet the corpus
                  arrived in. No vocabulary size can invent an alphabet row. Ask
                  for a thousand and the alphabet is still whatever the corpus
                  happened to contain.
                </p>
                <p>
                  Our own sentence falls into that hole, and I want to be exact
                  about how, because it is narrower than the usual telling. The
                  corpus does contain the letter z, in the word size. What it
                  does not contain is any word ending in z, and since section 5
                  a letter that ends a word has been a different symbol from the
                  same letter inside one. So the symbol z-at-the-end-of-a-word
                  was never in the alphabet, no merge could ever have produced
                  it, and Alvarez ends in exactly that. The sentence uses no
                  character the corpus lacks and is still not spellable.
                </p>
                <p>
                  Reading it under the method exactly as published, with nothing
                  underneath the alphabet, the encoder hands back the stand-in
                  row and the sentence comes to 25 pieces. Gluing them gives
                  this, and the space is gone because a stand-in carries no
                  marker and the marker was attached to the symbol it replaced.
                </p>
                <Equation>{"Dr. Alvarez didn't   →   Dr. Alvare[UNK]didn't"}</Equation>
                <p>
                  Nothing was raised, and nothing about the fit was wrong; the
                  size was met, the merges are the merges, and every number the
                  fit reports about itself is correct. A text went in and a
                  shorter, different text came out, with no signal anywhere that
                  it had. That is the half of this worth dwelling on, because a
                  refusal can be caught and handled and a silent substitution
                  cannot, and the further a text sits from the corpus the more
                  of it goes. The Greek sentence in the next section reads as 22
                  pieces under the published method, 21 of them the same
                  stand-in, and what comes back from gluing those is a run of
                  stand-ins with a full stop on the end.
                </p>
                <KeepInMind>
                  A merge can only join what exists, so the alphabet is a fact
                  about the corpus that no vocabulary size reaches. A character
                  outside it, or a character in a position outside it, becomes
                  one stand-in that says something was here and nothing about
                  what, and the round trip returns text that is not the text
                  that went in without saying so.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Giving every character a spelling">
                <p>
                  The repair is available because every character already has a
                  spelling in something smaller than itself. Written out for
                  storage, any character at all is a run of one to four bytes,
                  and there are exactly 256 byte values whatever any corpus did.
                  Give the table a row for each of those values, written so that
                  it cannot be mistaken for a letter, and a character with no row
                  of its own goes out as the rows of its bytes rather than as a
                  stand-in. This is usually called byte fallback, and it is what
                  SentencePiece offers under that name.
                </p>
                <Equation>{"the letter A   =   byte 65   =   the row <0x41>"}</Equation>
                <p>
                  It costs one more row than 256. A word whose last character
                  had to be written in bytes still has to record that a word
                  ended there, and the marker was attached to a character that
                  no longer has a piece, so the marker gets a row of its own. It
                  is 257 rows in all, and they are the same 257 rows whatever
                  the corpus was, since nothing about them is learned.
                </p>
                <ByteFallbackRepair />
                <p>
                  On the running sentence the repair costs exactly one piece, 26
                  against 25, and the interesting part is that not one of the 26
                  is a byte row. The letter z has a row already; what it lacked
                  was a row for z at the end of a word. So the fit writes the
                  ordinary z and then the marker on its own, the space comes
                  back, and the 256 byte rows are never reached at all. On this
                  sentence the whole repair is the 257th row.
                </p>
                <p>
                  The other two texts are where the bytes do the work. The word
                  café goes from four pieces, the last a stand-in with the
                  accent gone for good, to six, the accented e written as the
                  two byte rows for 195 and 169. The Greek sentence goes from 22
                  pieces that cannot be read back to 46 that can, 42 of the 46
                  being byte rows, so 25 characters arrive as 46 positions and
                  whatever reads them has to work back up from bytes to letters
                  nobody taught it. A vocabulary fitted to Greek would do far
                  better than that, which is the honest thing to say about it,
                  and the alternative on offer here was the text not arriving.
                </p>
                <NumberTable
                  headings={["text", "as published", "with byte fallback", "round trip"]}
                  rows={[
                    ["the running sentence", "25 pieces", "26 pieces, 0 of them bytes", "was lossy, now exact"],
                    ["a sentence with an accent", "14 pieces", "16 pieces, 3 of them bytes", "was lossy, now exact"],
                    ["a sentence in Greek", "22 pieces", "46 pieces, 42 of them bytes", "was lossy, now exact"],
                    ["the eighteen-sentence corpus", "263 pieces", "263 pieces", "exact either way"],
                  ]}
                  caption="The same 85 merges over the same 51 symbols in every column. The corpus row is the one to notice, since the repair costs the text it was fitted to nothing at all."
                />
                <KeepInMind>
                  257 rows, added once and learned from nothing, buy the
                  guarantee the method is usually described as already having.
                  They cost nothing on the corpus, one piece on the running
                  sentence, and on a text in another script they cost about two
                  pieces per character, which is the character-level regime this
                  whole method exists to escape.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Choosing the Size",
          content: (
            <>
              <SubSection title="13. The number asked for, and the rows that result">
                <p>
                  Adding 257 rows raises a bookkeeping question, and the answer
                  shows on the readouts, so it is worth saying rather than
                  leaving to be discovered. The number we ask for bounds only
                  what the corpus taught, which is the alphabet, the stand-in
                  and the merges. The 257 sit underneath that and outside the
                  budget, so asking for 54 gives a table of 311 rows and asking
                  for 137 gives one of 394.
                </p>
                <NumberTable
                  headings={["asked for", "merges", "learned from the corpus", "rows in the table"]}
                  rows={[
                    ["52", "0", "52", "309"],
                    ["54", "2", "54", "311"],
                    ["100", "48", "100", "357"],
                    ["137", "85", "137", "394"],
                    ["300", "85", "137", "394"],
                  ]}
                  caption="The gap is 257 at every row and never moves, because nothing about those rows depends on the corpus or on the size."
                />
                <p>
                  Counting them inside the budget instead is the other
                  defensible answer, and it is the one SentencePiece takes. The
                  price of it is a hard floor of 257 on every vocabulary, which
                  would make the twenty-two-row table of section 8 impossible to
                  ask for, and that table is the only reason section 8 can be
                  read a row at a time. The price of the choice made here is the
                  one the table above shows, which is that the number asked for
                  is not the width of the table, so a model sized from it alone
                  would be 257 rows short.
                </p>
                <KeepInMind>
                  Two numbers describe one fit, and the number a person types is
                  the smaller of them. What the size bounds is what a corpus can
                  teach; the rows that spell what no corpus taught are a floor
                  under every fit and are the same floor in all of them.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What one more merge is worth">
                <p>
                  The vocabulary size is the one number a person setting this up
                  actually chooses, so it deserves a curve rather than a rule of
                  thumb. Fit the eighteen sentences at fifteen different sizes
                  and measure two things at each, what the whole corpus costs in
                  pieces and what the one held-out sentence costs.
                </p>
                <PieceCountCurve />
                <p>
                  Both curves fall steeply at first and then flatten, which is
                  the shape the counting guarantees. The first merge is worth the
                  largest count in the corpus, the second the largest count in
                  what is left, and so on downward, so each merge saves no more
                  than the one before it. On this corpus the first merge joins h
                  to the marked e and saves 31 pieces; the second joins t to the
                  he-with-a-marker that first merge produced, saves 19, and gives
                  the word the a row of its own.
                </p>
                <KeepInMind>
                  Merges arrive in decreasing order of what they are worth, so
                  the curve of length against vocabulary size can only ever
                  flatten. There is no size at which it suddenly starts paying
                  again.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Where the curve stops falling">
                <p>
                  It flattens completely at 137 rows here. Asking for 150, or
                  200, or 300 gives exactly 137, because the loop also stops when
                  no adjacent pair is left that occurs at least twice, and a pair
                  seen once is a fact about one word rather than about the
                  language. So the size asked for is a ceiling and not a promise,
                  and the number actually learned is a fact about the corpus.
                </p>
                <NumberTable
                  headings={["asked for", "learned", "merges", "corpus", "sentence"]}
                  rows={[
                    ["52", "52", "0", "648", "46"],
                    ["66", "66", "14", "484", "37"],
                    ["80", "80", "28", "414", "29"],
                    ["100", "100", "48", "344", "28"],
                    ["120", "120", "68", "297", "26"],
                    ["137", "137", "85", "263", "26"],
                    ["300", "137", "85", "263", "26"],
                  ]}
                  caption="The corpus and the sentence are both counted in pieces. Everything from 137 upward is the same fit."
                />
                <p>
                  There is a floor at the other end too, and it is also the
                  corpus&rsquo;s to set rather than ours. The smallest vocabulary
                  that can exist is one row per symbol the corpus is spelled in
                  plus one stand-in row, which is 52 here. Below that the request
                  cannot be met at all, since dropping a symbol would leave part
                  of the training corpus itself unspellable.
                </p>
                <KeepInMind>
                  Two numbers bound the dial and neither is chosen by the person
                  turning it. The alphabet sets the floor and the supply of
                  repeated pairs sets the ceiling, and on a small corpus the two
                  can be much closer together than expected.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. What the number trades">
                <p>
                  Between those bounds the size is a real trade, and it is worth
                  naming both sides plainly. A larger vocabulary means shorter
                  sequences, so whatever reads the pieces does less work per
                  sentence and carries information a shorter distance. It also
                  means more rows, and in a language model each row is an entire
                  vector to learn, so the parameter count grows with the
                  vocabulary while the number of times each new row is seen in
                  training falls.
                </p>
                <p>
                  That second effect is the one that decides where to stop in
                  practice. The rows a large vocabulary buys are, by
                  construction, the ones that were merged last, which is to say
                  the least frequent ones, so each of them is seen fewer times
                  than every row before it. Past some point the sequence gets
                  barely shorter while the table fills with rows the model has
                  almost no evidence about, and on this corpus that point is
                  visible in the table above, where going from 100 rows to 137
                  buys the sentence two pieces.
                </p>
                <InAModel>
                  <p>
                    Published models ask for tens of thousands of rows, and the
                    ones meant to read many languages at once ask for a few
                    hundred thousand, since every writing system they must cover
                    wants its own frequent pieces and the ones that do not get
                    them fall back to long runs of short pieces. That is the same
                    trade as the table above with a much larger corpus behind it.
                  </p>
                </InAModel>
                <KeepInMind>
                  A vocabulary size buys sequence length with parameters and with
                  evidence per row. The curve tells us what the first of those
                  costs; nothing on this page measures the second, and that is
                  the honest position, since it depends on the model reading the
                  pieces rather than on the tokenizer.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Three Things One Can Change",
          content: (
            <>
              <SubSection title="17. Starting from bytes rather than characters">
                <p>
                  Section 12 gave a character alphabet a byte spelling to fall
                  back on. The first variant goes further and makes bytes the
                  alphabet outright. Every string, in any script, is some
                  sequence of bytes when written out in the usual encoding, and
                  there are exactly 256 byte values, so an alphabet of all 256
                  needs no corpus to fill it. Run the identical merging loop over
                  byte sequences and there is no character alphabet anywhere in
                  the fit, no stand-in row, and nothing underneath.
                </p>
                <p>
                  The two are easy to confuse and they are genuinely different.
                  Under section 12 every merge is over characters and a byte
                  appears only where a character has no row, so the merges know
                  what a letter is. Here every merge is over bytes from the first
                  step, so the early merges are spent reassembling the letters a
                  character fit started with, and a merge is free to join the
                  second half of one character to the first half of the next.
                </p>
                <AlphabetComparison />
                <p>
                  Both fits return all three texts exactly, so the widget is not
                  a comparison of what survives. It is a comparison of length,
                  and the ordering changes with the text. On the running sentence
                  the byte fit is longer, 29 pieces against 26. On the accented
                  sentence it is longer by one, 17 against 16. On the Greek
                  sentence the two are exactly level at 46.
                </p>
                <KeepInMind>
                  A byte alphabet is complete because of what it is rather than
                  because of what it has seen, so nothing about a corpus can
                  leave a hole in it. Adding byte rows underneath a character
                  alphabet reaches the same guarantee by a different route, and
                  the two differ in what the merges are allowed to see.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What the byte alphabet costs">
                <p>
                  It is not free, and this is the place on the page where a
                  variant is worse than the thing beside it. Fitted to the same
                  eighteen sentences with the same number of merges, the byte
                  alphabet reads the running sentence as 29 pieces where the
                  character alphabet reads it as 26, and reads the corpus as 282
                  pieces where the character alphabet reads it as 263. It is
                  paying for two things, the byte values this corpus never uses,
                  which are 220 of the 256 and which no merge can ever be spent
                  on, and the spaces, which it carries as real symbols attached
                  to the word that follows rather than as a marker.
                </p>
                <NumberTable
                  headings={["alphabet", "rows in the table", "merges", "the sentence", "the corpus", "Greek"]}
                  rows={[
                    ["characters, bytes underneath", "394", "85", "26 pieces", "263 pieces", "46 pieces"],
                    ["bytes", "341", "85", "29 pieces", "282 pieces", "46 pieces"],
                  ]}
                  caption="The same corpus and the same number of merges, so the only difference between the two rows is what each merged over. Both return every text exactly."
                />
                <p>
                  Two things go the other way, and both are worth having. The
                  byte fit&rsquo;s table is the smaller of the two, 341 rows
                  against 394, since it needs no character alphabet and no
                  stand-in on top of its 256 and so pays for completeness once
                  rather than twice. And on a single word with no space after it
                  the byte fit is the shorter reading, since café is five pieces
                  there against six, the sixth being the end-of-word marker a
                  character fit has to emit on its own once the last character
                  went out as bytes.
                </p>
                <KeepInMind>
                  On text written in the corpus&rsquo;s own script, merging over
                  bytes is longer, by 3 pieces in 26 on the sentence and 19 in
                  263 on the corpus. What it buys is that the alphabet stops
                  being a fact about the corpus at all, and the two large
                  families of published models have taken the two different
                  routes to that, one merging over bytes and one keeping
                  characters with bytes underneath.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Letting a piece cross a space">
                <p>
                  The second variant lifts the rule that has been in force since
                  section 5, which is that a merge never joins two symbols
                  belonging to different words. That rule was never argued for;
                  it followed from counting the words separately. Lift it and a
                  very common two-word sequence can become one row, which is
                  worth two positions every time it occurs.
                </p>
                <p>
                  It cannot be lifted from the start, though, and the reason is
                  the same greedy counting as everywhere else. With the boundary
                  gone from the first merge, the commonest adjacent pairs in a
                  corpus are things like the letter that ends one common word
                  followed by the letter that starts the next, and the loop would
                  spend its early merges on those and never build the words at
                  all. So the fit runs in two stages, ordinary merging within
                  words up to a size stated in advance, then merging with the
                  boundary ignored for whatever room is left.
                </p>
                <Equation>{"stage one   merge within words, up to a stated size\nstage two   merge over whole texts, up to the size asked for"}</Equation>
                <KeepInMind>
                  Lifting the boundary forbids nothing, it only permits more. A
                  merge that stays inside a word can still win in the second
                  stage, and one that crosses a boundary may stop in the middle
                  of the word on the far side.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. What a small corpus actually learns there">
                <p>
                  Here the measurement was more interesting than the description.
                  Run the second stage on our four-word corpus and it does not
                  learn phrases at all, because that corpus has no phrases in it,
                  only the same four words repeated. What it learns instead is a
                  word doubled, newest followed by newest and low followed by
                  low, which is a perfectly correct answer to the question it was
                  asked and a useless vocabulary row.
                </p>
                <SuperwordMerges />
                <p>
                  Two things in that small run are worth naming. The second
                  stage learned three merges and only two of them produced a row
                  that spans a space, since the third joined an e to a marked r
                  inside lower, which is the point about permitting rather than
                  requiring. And a row spanning a space is not obliged to be two
                  whole words.
                </p>
                <p>
                  On the eighteen sentences the stage does what the idea
                  promises. Eight merges are learned after the lift and all eight
                  produce a row spanning a space, six of them joining two
                  complete words, of with the, and with the, report with was,
                  rewrote with the, analysis with was, and the abbreviation Dr.
                  with Bell. A seventh joins costing to the row that already held
                  and the, so it spans three words. The eighth is the one that
                  makes the point about starting anywhere, since it joins the an
                  that ends than to the following the, and an is not a word of
                  these eighteen sentences at all.
                </p>
                <KeepInMind>
                  A corpus of repeated words teaches repeated words. Whether this
                  variant is worth its rows depends entirely on whether the
                  corpus contains phrases that recur, which is a property of the
                  text and not of the method.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Merges that respect a word’s joints">
                <p>
                  The third variant goes the other way and forbids something. The
                  complaint it answers is section 10&rsquo;s, that the pieces are
                  frequent substrings and have no opinion about where a prefix
                  ends. Take a corpus of undo, untie, redo and retie, ten times
                  each. Merging by count alone builds do and tie and un and re as
                  symbols first, and then, since un followed by do is now as
                  frequent as anything left, it joins them, and the row undo
                  exists as a single piece with the prefix buried inside it.
                </p>
                <p>
                  The repair is not a rule added to the loop. It is a change to
                  how the words are spelled before the loop starts. Cut each word
                  at its joints and hand each part to the counter as if it were a
                  word of its own, and then a pair straddling a joint is never
                  adjacent, is never counted, and cannot be proposed. The loop is
                  untouched.
                </p>
                <MorphemeConstraint />
                <KeepInMind>
                  Forbidding a merge and never letting it be adjacent are two
                  different implementations of the same constraint, and the
                  second needs no new machinery. Where the joints come from is a
                  separate question, and the constraint is only as good as
                  whatever answers it.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. What that constraint costs">
                <p>
                  It costs length, and on this corpus it costs a factor of two.
                  Both fits were asked for thirty rows. The unconstrained one
                  learns nine merges, ends at 19 rows, and reads the forty words
                  of the corpus as 40 pieces, one per word. The constrained one
                  learns the same first five merges and then stops, at 15 rows,
                  because every part is by then a single symbol and every pair
                  that remains straddles a joint. It reads the same forty words
                  as 80 pieces, two per word.
                </p>
                <NumberTable
                  headings={["merges may", "learned", "rows", "undo reads as", "forty words"]}
                  rows={[
                    ["cross a joint", "9", "19", "1 piece", "40 pieces"],
                    ["not cross a joint", "5", "15", "2 pieces", "80 pieces"],
                  ]}
                  caption="Both were asked for thirty rows. The constrained vocabulary is exactly the first fifteen entries of the other."
                />
                <p>
                  What is bought for that doubling is that the un in undo is the
                  same row as the un in untie, and the do in undo the same row as
                  the do in redo, so a model reading these pieces can see the
                  shared structure that the unconstrained vocabulary merged away.
                  Whether that is worth twice the sequence length is not
                  something this corpus can settle, and I have not measured it
                  against a model here.
                </p>
                <KeepInMind>
                  The constraint makes the vocabulary a prefix of the
                  unconstrained one, stopping where the unconstrained fit would
                  have started joining across joints. It buys visible structure
                  and it pays in pieces, and on this corpus the payment is
                  exactly double.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="23. The tie the counts cannot break">
                <p>
                  Go back to the very first merge on the four words. The pair e
                  followed by s scores 9, and so does the pair s followed by the
                  marked t. The rule says take the largest count and there are
                  two largest counts, so at this point the method has run out of
                  instructions. Any tie-break at all is something added from
                  outside, and the usual choice is whichever pair the
                  implementation happened to meet first, which makes the answer
                  depend on the order the texts arrived in.
                </p>
                <TieBranches />
                <p>
                  What the two branches actually do is worth measuring rather
                  than asserting, because the usual claim is that a tie changes
                  everything downstream. Here it does not. Taking either branch
                  and finishing the fit leaves the corpus at 22 pieces, and nine
                  of the ten rows are identical; the branches differ in one row,
                  es on one side against st with its marker on the other, and the
                  word lowest comes out as the same three pieces either way. The second tie, three pairs at 6 four merges
                  later, is the interesting one, since all three branches again
                  leave the corpus at 22 pieces and one of them cuts lowest as
                  two pieces rather than three.
                </p>
                <KeepInMind>
                  A tie means the objective is genuinely indifferent, so no
                  tie-break is more correct than another. What a tie-break does
                  decide is how words the corpus never contained will be cut,
                  which is the only thing that was ever in question.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Greedy merging is not shortest merging">
                <p>
                  Section 7 noted that taking the largest count is the biggest
                  saving available now, and that this is not the same as the
                  biggest saving available over a run. The method is a greedy
                  one, and greedy methods are not generally optimal. Here that is
                  not a worry to be waved at, since on a corpus small enough we
                  can enumerate every sequence of merges and know the answer.
                </p>
                <p>
                  Take three words, report twice, taste eight times and state ten
                  times, which is 102 pieces spelled in characters. Three pairs
                  tie for first place at 18, s followed by t, t followed by a,
                  and t followed by the marked e, and every one of them saves the
                  same 18. Take any of them and one merge leaves the corpus at
                  84. But the branches part immediately afterwards, and the
                  branch beginning with t followed by a is two merges from a
                  corpus of 66 while the branch beginning with s followed by t
                  cannot do better than 74.
                </p>
                <NumberTable
                  headings={["merges", "greedy", "shortest reachable", "the gap"]}
                  rows={[
                    ["1", "84", "84", "0"],
                    ["2", "74", "66", "8"],
                    ["3", "64", "56", "8"],
                    ["4", "54", "46", "8"],
                  ]}
                  caption="Every sequence of up to four merges was enumerated, so the right column is the shortest that exists rather than the shortest anything found."
                />
                <p>
                  Eight pieces on a corpus of 102 is about eight per cent, held
                  steady out to four merges, and the loss is locked in by the
                  first move. So the method is a heuristic for shortening a
                  corpus and not a solution to it, and the two failures compound,
                  since the first move here was a tie and the tie-break chose the
                  losing branch. Nothing in the counting could have seen that
                  coming, because at the moment of choosing, the three candidates
                  were worth exactly the same.
                </p>
                <KeepInMind>
                  Byte pair encoding does not minimise sequence length for a
                  given vocabulary size. It takes the largest immediate saving,
                  which on this corpus is eight per cent short of the best
                  reachable at every budget from two merges on.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. A vocabulary carries one corpus, and everything else backs off">
                <p>
                  The merges are a summary of one corpus and of nothing else.
                  That is the source of the method&rsquo;s power, since it is how
                  frequent things become cheap without anybody deciding which
                  things are frequent, and it is also permanent in a way that is
                  easy to underestimate. Whatever that corpus over-represented is
                  now cheap forever, and whatever it under-represented is now
                  expensive forever, and neither can be argued with later,
                  because the vocabulary is fixed before the model that reads it
                  is trained.
                </p>
                <p>
                  On our eighteen sentences the row for expected exists and the
                  row for expect does not, because those sentences use the past
                  tense and never the bare stem. Nothing is wrong with
                  that fit; it is the right answer for that corpus. But every
                  text this vocabulary ever reads will be cut that way, so a text
                  written mostly in the present tense pays three pieces for a
                  word this one pays one for, and no amount of evidence
                  afterwards can move the row.
                </p>
                <p>
                  Which is why what happens on the way down matters more than
                  which rows a vocabulary holds. A piece the merges never built
                  cannot be reached at all, so the word is written out of smaller
                  pieces instead, and how small those get is what decides whether
                  a text is readable or merely present. A text from a different
                  domain backs off to short pieces and gets somewhat longer, the
                  way expect goes from one piece to three here. A text in a
                  script the corpus never contained backs off all the way to
                  bytes, and the Greek sentence of section 12 arrives as 46
                  pieces for 25 characters, which is worse than the character
                  vocabulary Part 1 rejected. In every one of those cases the
                  vocabulary was doing exactly what it was fitted to do.
                </p>
                <KeepInMind>
                  Two corpora of the same language give two different
                  vocabularies, and neither is wrong. A vocabulary is fairly
                  faulted for how badly it degrades on text it was not built
                  from, which is a property of how far down it has to go, and
                  unfairly faulted for which pieces it happens to hold.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs on which the
                  method stops being defined rather than becoming approximate,
                  together with what has to be decided in each case and what
                  turns on the decision. Several of them are genuinely open
                  questions with defensible answers on either side, and those are
                  the ones worth a reader&rsquo;s attention, since they are the
                  decisions anybody setting this up has to make and nothing in
                  the mathematics makes for them.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    { expression: "two pairs with the same count", reason: "the objective is indifferent, so no answer is more correct. A choice must be made and any choice is arbitrary; taking the earliest in some fixed order at least makes the fit repeatable, where taking whichever was met first makes it depend on the order the texts arrived in. On the four-word corpus the first tie changes one row of ten and no piece count." },
                    { expression: "a vocabulary smaller than the alphabet", reason: "there is nothing to give. The floor is one row per symbol the corpus is spelled in, plus whatever stands in for the unspellable, since dropping a symbol leaves part of the training corpus itself unreadable. On the eighteen sentences that floor is 52." },
                    { expression: "a vocabulary larger than the corpus can fill", reason: "the loop runs out of pairs occurring twice and stops. The size asked for is a ceiling, not a promise, and the number learned is a fact about the corpus; 300 and 137 are the same fit here." },
                    { expression: "a pair seen exactly once", reason: "a decision rather than a fact. Merging it is a row spent on one word, which is memorisation; refusing it means a corpus of entirely distinct words learns nothing at all. Any threshold is a guess at where a count stops being a coincidence." },
                    { expression: "the shortest corpus a given number of merges could reach", reason: "not what the method finds. Greedy choice is optimal at one merge and can be beaten from two onward, by eight pieces in 102 on the three-word corpus of section 24, and finding the true optimum means searching a space that grows with every merge." },
                    { expression: "a character the corpus never used", reason: "unspellable, and permanently so, since a merge only ever joins two symbols that already exist and therefore no vocabulary size can invent an alphabet row. What to do instead is a decision. One stand-in row loses the character and any word boundary attached to it, and loses them silently; a spelling in bytes keeps both, at 257 rows once and, on the Greek sentence, at 46 pieces for 25 characters." },
                    { expression: "a symbol the corpus used only inside words, at the end of one", reason: "also unspellable, and much easier to miss, because the character is there. Marking word ends makes a letter at the end a different symbol from the same letter in the middle, which is what makes decoding mechanical and what leaves this hole. Alvarez falls into it on a corpus containing size, and the repair there costs a single piece, since the letter has a row and only its position did not." },
                    { expression: "how to count rows that no corpus taught", reason: "a decision with nothing in the mathematics to settle it. Counting the 257 against the size asked for puts that number as a hard floor under every vocabulary, which makes the twenty-two-row table of section 8 impossible to ask for at all; leaving them outside it means the number asked for is not the width of the table, and 137 here comes with 394 rows." },
                    { expression: "where a word’s parts begin and end", reason: "outside the method entirely. Nothing in counting adjacent pairs can distinguish a boundary between two morphemes from any other position, so a piece spanning a prefix and a root is exactly as good to the loop as any other piece. Supplying the joints from elsewhere is the third variant, and it costs twice the pieces on the corpus of section 22." },
                    { expression: "whether a piece may cross a space", reason: "a convention rather than a consequence. Counting words separately makes it impossible; counting whole texts makes it possible from the first merge, at which point the loop spends its early rows on letters that happen to sit either side of a gap. Doing one and then the other needs a transition point, and nothing determines where that goes." },
                    { expression: "a corpus with no phrase in it", reason: "defined, and it answers the question asked rather than the one intended. On the four-word corpus, lifting the boundary produces rows for newest followed by newest and low followed by low, because the only thing that recurs across a space there is a word beside a copy of itself. Correct, and useless, which is the shape of most degenerate cases here." },
                  ]}
                />
                <KeepInMind>
                  Five of these are decisions rather than limits, namely the
                  tie-break, the count below which a pair is ignored, the
                  alphabet, how the rows that no corpus taught are counted, and
                  whether a piece may cross a space. Each has defensible answers
                  on both sides and each changes either what the finished
                  vocabulary can spell or what its stated size means, so each
                  belongs in whatever describes a tokenizer rather than being
                  left to an implementation.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
