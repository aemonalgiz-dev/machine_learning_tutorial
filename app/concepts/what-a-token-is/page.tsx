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
import { RoundTripTable } from "@/components/widgets/RoundTripTable";
import { TokenStripExplorer } from "@/components/widgets/TokenStripExplorer";
import { UnknownAnswerTable } from "@/components/widgets/UnknownAnswerTable";
import { VocabularyGrowthChart } from "@/components/widgets/VocabularyGrowthChart";

export const metadata: Metadata = {
  title: "What a Token Is · oop_ml",
  description:
    "Turn text into pieces with numeric IDs, and examine what those IDs preserve.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function WhatATokenIsPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["what-a-token-is"]}
      technicalStart="Part 2. What a Vocabulary Promises"
      openingTitle="How Can Our Models Read Language?"
      playgroundIntro="Compare the text pieces with their IDs, then inspect the decoded text. An exact round trip depends on which information the scheme retained."
      title="What a Token Is"
      tagline="Turn text into pieces with numeric IDs, and examine what those IDs preserve."
      prerequisites={
        <>
          Nothing before this, beyond the one fact every page in the rest of
          this site rests on, that a model reads a block of numbers and nothing
          else. The{" "}
          <Link href="/concepts/dense-layers" className={link}>
            dense layers
          </Link>{" "}
          page is where that block is first multiplied by something. Every page
          in the section after this one answers the same checklist this page
          ends with, in a different way.
        </>
      }

      playground={<TokenStripExplorer />}
      sections={[
        {
          title: "Part 1. Writing Is Not Numbers",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. One sentence, and what a model can do with it">
                <p>
                  We will use one sentence throughout this page and revisit it
                  in the later tokenization lessons. It contains several useful
                  boundary cases while remaining short enough to inspect.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  The full stop after Dr. belongs to an abbreviation. The
                  apostrophe is part of a contraction. A hyphen joins low-cost,
                  and re- appears at the start of re-analysis. A splitting rule
                  must decide how to handle each case. We will begin with spaces
                  alone so those decisions are easy to see.
                </p>
                <p>
                  The numerical layers on this site need numbers in place of
                  those text pieces. The tokenizer supplies the IDs, and an
                  embedding layer can then look up trainable vectors. If{" "}
                  <span className="font-mono">re-analysis.</span> and{" "}
                  <span className="font-mono">re-analysis</span> are two
                  separate vocabulary entries, as the scheme in Part 3 makes
                  them, they start with separate identities. A model can still
                  learn a relationship between their vectors from context, but
                  the token IDs do not provide that relationship themselves.
                </p>
                <KeepInMind>
                  In these examples, we fix the tokenizer before training the
                  model. Information that tokenization actually discards cannot
                  be recovered exactly from the IDs alone. Giving related forms
                  different IDs is a different issue: their relationship can
                  still be learned from suitable examples.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A piece of text with a number beside it">
                <p>
                  A token is one piece produced by the chosen scheme. For
                  inspection, the SDK keeps that piece beside its ID. The
                  encoding records these tokens in the order they occur, so a
                  reader can check which text each ID represents.
                </p>
                <Equation>
                  {"token       =  ( a piece of text ,  a whole number )\n" +
                    "encoding    =  the tokens one text became, in order"}
                </Equation>
                <p>
                  Cutting the running sentence at every space gives seven
                  pieces, and against the table Part 2 builds those seven pieces
                  carry the numbers 3, 2, 14, 19, 43, 28 and 32. A model sees
                  only that second list. Everything it will ever know about the
                  sentence has to arrive through those seven numbers and through
                  the order they came in.
                </p>
                <WorkedExample title="Seven pieces, seven numbers">
                  <Equation>
                    {"Dr.            3\n" +
                      "Alvarez        2\n" +
                      "didn't        14\n" +
                      "expect        19\n" +
                      "the           43\n" +
                      "low-cost      28\n" +
                      "re-analysis.  32"}
                  </Equation>
                  <p>
                    Notice that the full stop stayed attached to the last piece
                    and that the contraction was left whole. Both of those are
                    consequences of cutting at spaces and nowhere else, and both
                    will be argued with later in the section.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The playground displays both the text piece and its ID.
                  The model uses the ID, while the displayed piece lets us
                  verify the segmentation and vocabulary lookup.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The number says which piece, and nothing else">
                <p>
                  It is tempting to read those seven numbers as measurements,
                  since every other number on this site is one. They are not. A
                  token number is a position in a list, and the only question it
                  answers is which entry of the list this piece is. Nothing
                  follows from one number being larger than another, and nothing
                  follows from two numbers being close.
                </p>
                <p>
                  The list this page builds is in alphabetical order, so
                  neighbouring numbers hold pieces that happen to share a first
                  letter. That produces both kinds of accident at once. The
                  pieces at 29 and 30 are <span className="font-mono">not</span>{" "}
                  and <span className="font-mono">notes</span>, which share three
                  letters and nothing else, and they are as close as two
                  numbers can be. The word{" "}
                  <span className="font-mono">The</span> is at 6 and the
                  word <span className="font-mono">the</span> is at 43, the same
                  word with one letter capitalised, at a different position in
                  the vocabulary.
                </p>
                <WhyThisWorks title="Why the ordering can be anything at all">
                  <p>
                    Any one-to-one assignment of numbers to pieces works
                    equally well, because the model looks each number up in a
                    table of learned rows and reads the row, so the number is
                    only an address. Shuffle the numbers and shuffle the rows
                    with them and the model is unchanged. What must not change
                    is the assignment itself, once anything has been trained
                    against it, since the rows were learned in the order the
                    numbers named and rearranging one without the other points
                    every piece at somebody else&rsquo;s row.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Nothing about likeness can be read off these numbers, in
                  either direction, since 29 and 30 hold unrelated words while 6
                  and 43 hold the same one. Giving the pieces positions that do
                  carry useful relationships is a separate job, introduced in
                  the lessons on word vectors and embedding layers.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. What a Vocabulary Promises",
          content: (
            <>
              <SubSection title="4. A list, and the position each piece holds">
                <p>
                  A vocabulary is a list of pieces, fixed once it is built,
                  with each piece owning its position in the list. Position
                  zero is the first entry, position one the second, and the
                  number a piece goes in as is simply where it sits. There is no
                  second table of numbers to keep in step with the first, which
                  is the whole reason for making the position the number rather
                  than storing a number beside each piece.
                </p>
                <p>
                  The tables on this page are built from six sentences, the
                  running sentence and five more from the same notebook, which
                  is small enough that the whole list fits on a screen and is
                  worth reading through in the playground above. Cutting those
                  six sentences at spaces gives 47 distinct pieces, and the
                  table holds 48 entries, the extra one being the reserved
                  entry Part 4 is about. Cutting them into single characters
                  gives 37 distinct pieces and a table of 38.
                </p>
                <NumberTable
                  headings={["cut into", "distinct pieces", "entries in the table"]}
                  rows={[
                    ["single characters", "37", "38"],
                    ["whole words", "47", "48"],
                  ]}
                  caption="Both counts are over the same six sentences, so the only thing that differs is what counts as a piece."
                />
                <KeepInMind>
                  Fixed means fixed. Adding an entry, removing one, or
                  reordering the list after anything has been trained against
                  it changes what every number means, and there is no signal
                  that this has happened beyond the answers quietly getting
                  worse.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The same piece gets the same number every time">
                <p>
                  The first promise is the one that makes learning possible at
                  all. Whenever the same piece appears, in whatever sentence and
                  in whatever position, the same number comes out. If that were
                  not so, a model that had learned something about a word in one
                  sentence would have learned nothing about the same word in the
                  next, and every occurrence would be a fresh start.
                </p>
                <p>
                  Encoding the running sentence and a second sentence from the
                  same six shows it. The word{" "}
                  <span className="font-mono">the</span> is the fifth piece of
                  the first and the tenth piece of the second, and it carries
                  the number 43 in both.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis.\n" +
                    "  3    2      14     19    43      28        32\n" +
                    "\n" +
                    "The drift was small, though it was larger than the effect she expected.\n" +
                    "  6   15   47    40      44   26  47    27    42   43    17    39     20"}
                </Equation>
                <p>
                  The second line also shows the promise being kept in a way
                  that will annoy a reader. The word{" "}
                  <span className="font-mono">was</span> appears twice in that
                  sentence and is 47 both times, which is the promise working.
                  But <span className="font-mono">The</span> at the front is 6
                  while <span className="font-mono">the</span> further along is
                  43, and <span className="font-mono">expect</span> at 19 and{" "}
                  <span className="font-mono">expected.</span> at 20 are two
                  unrelated entries as far as the table is concerned. The
                  promise is about pieces being identical as strings, and it
                  says nothing about their being the same word.
                </p>
                <KeepInMind>
                  Identical strings get identical numbers, and that is all the
                  promise says. Whether two strings a reader would call the same
                  word end up identical is decided by the cutting rule, not by
                  the table.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The numbers turn back into text">
                <p>
                  The second promise runs the other way. Given a run of numbers,
                  each one is looked up by position and the pieces are glued
                  back together, so a person can read what a model was shown and
                  a model that produces numbers can have its output read. Both
                  matter. Without it a generated sequence would be a list of
                  integers nobody could evaluate.
                </p>
                <Equation>
                  {"encode    text     →  numbers\n" +
                    "decode    numbers  →  text"}
                </Equation>
                <p>
                  Decoding is the shorter half, since it has nothing to decide.
                  Look each number up, refuse any number no entry owns, glue.
                  What varies between schemes is only the glue, and for the
                  whole-word scheme here the glue is a single space, which turns
                  out in Part 5 to be the thing that stops the round trip being
                  exact. Running both halves on the running sentence gives back
                  the sentence character for character, under both cutting
                  rules.
                </p>
                <KeepInMind>
                  The two promises are separate, and a scheme can keep the first
                  and break the second. Every piece having a stable number says
                  nothing about the pieces being gluable back into the writing
                  they came from.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What the size of the table costs">
                <p>
                  The number of entries is not free, because a model gives every
                  entry a row of its own. Whatever a model learns about a piece
                  lives in that row, the rows are learned from the text, and a
                  row belonging to a piece that turns up twice in the training
                  text is learned from two occurrences.
                </p>
                <p>
                  Take a row of 768 numbers, which is an ordinary width. The
                  whole-word table here has 48 entries and the character table
                  has 38, and each entry needs one such row, so the count of
                  numbers a model has to learn is the count of entries
                  multiplied by the width of a row.
                </p>
                <Equation>
                  {"whole words        48 × 768  =  36,864 numbers\n" +
                    "single characters  38 × 768  =  29,184 numbers\n" +
                    "\n" +
                    "36,864 / 29,184  ≈  1.26"}
                </Equation>
                <p>
                  The whole-word table asks for about a quarter more numbers
                  than the character table, and none of them has been learned
                  yet. At the scale of six sentences neither figure means much.
                  What matters is which of the two grows, and how fast, once the
                  text is not six sentences, which is section 11.
                </p>
                <InAModel>
                  <p>
                    The count of entries is a choice nothing later can revise.
                    It fixes how many rows of parameters the model carries
                    before it has read a word, and it fixes the width of the
                    final layer that has to pick one entry out of all of them,
                    so a model over the 48-entry table here would carry roughly
                    a quarter more of both than one over the 38-entry table, on
                    the same six sentences.
                  </p>
                </InAModel>
                <KeepInMind>
                  Every entry costs a row of parameters, and a rare entry is a
                  row learned from very little text. The count of entries is one
                  of the two numbers a scheme is judged on; the other is in
                  Part 3.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "Two token numbers that sit next to each other hold pieces that are related.",
              false,
              "A token number is a position in a list, and the only question it answers is which entry this piece is. The list here is alphabetical, so 29 and 30 hold not and notes, which share three letters and nothing else, while 6 and 43 hold the same word with one letter capitalised. Nearness between two numbers is an accident of the ordering in both directions.",
            ),
            choice(
              "Why does any one-to-one assignment of numbers to pieces work equally well?",
              [
                "The model looks each number up in a table of learned rows and reads the row, so the number is only an address",
                "The model learns the order of the vocabulary while it trains",
                "Alphabetical order already puts related pieces near each other",
                "The embedding layer sorts the rows before reading them",
              ],
              0,
              "Shuffle the numbers and shuffle the rows with them and the model is unchanged. What must not change is the assignment itself once something has been trained against it, since rearranging one without the other points every piece at somebody else’s row.",
            ),
            choice(
              "The word was appears twice in one sentence and is 47 both times, while The is 6 and the is 43. What does that show about the first promise?",
              [
                "It is about pieces being identical as strings, and says nothing about their being the same word",
                "It is broken by the capital, which the table ought to have folded together",
                "It holds within one sentence and not across sentences",
                "It holds for words and not for punctuation",
              ],
              0,
              "Identical strings get identical numbers, and that is the whole of it. Whether two strings a reader would call one word come out identical is decided by the cutting rule rather than by the table.",
            ),
            choice(
              "A row of 768 numbers is an ordinary width. What do the 48 entries of the whole-word table cost in parameters?",
              ["768", "29,184", "36,864", "47,616"],
              2,
              "Every entry gets a row of its own, so 48 entries at 768 numbers each come to 36,864. The character table of 38 entries needs 29,184, so a model over the whole-word table carries roughly a quarter more before it has read a word. It also carries a quarter more in the final layer, which has to pick one entry out of all of them.",
            ),
            several(
              "Once something has been trained against a table, which of these change what every number means?",
              [
                "Adding an entry",
                "Removing an entry",
                "Reordering the list",
                "Encoding a sentence the table has not seen before",
              ],
              [0, 1, 2],
              "Fixed means fixed. Adding, removing and reordering each move pieces to numbers whose rows were learned for other pieces, and there is no signal that it has happened beyond the answers quietly getting worse. Encoding new text is only using the table, and a piece it does not hold is the separate question Part 4 takes up.",
            ),
        ],
        },
        {
          title: "Part 3. Where the Pieces Come From",
          content: (
            <>
              <SubSection title="8. The sentence one character at a time">
                <p>
                  The smallest units worth using are the characters themselves.
                  Every character of the six sentences becomes an entry, spaces
                  and punctuation included, which gives 37 entries. The running
                  sentence then becomes 51 numbers, one for each character it
                  contains, and the space carries a number of its own like
                  everything else.
                </p>
                <Equation>
                  {"D  r  .  ␣  A  l  v  a  r  e  z  ␣  d  i  d  n  '  t  ...\n" +
                    "11 29  5  1 10 24 33 15 29 19 37  1 18 23 18 26  2 31"}
                </Equation>
                <p>
                  Two things follow from a table this small. The first is that
                  almost nothing is ever unseen, since a new sentence in the
                  same language is spelled out of letters the corpus has already
                  met. The second is that a single character carries almost no
                  information about the writing, so a model reading this stream
                  has to learn that the seven characters{" "}
                  <span className="font-mono">A l v a r e z</span> in that order
                  are a name, and it has to learn that before it can learn
                  anything about the person.
                </p>
                <KeepInMind>
                  A character table is small and almost never surprised. The
                  work it saves at the table it hands to the model, which now
                  has to assemble words out of letters for itself.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The sentence one whole word at a time">
                <p>
                  The other end of the trade is to make every run of
                  non-space characters an entry. The six sentences give 47 of
                  those, and the running sentence becomes seven numbers. Each
                  number now carries a great deal, since{" "}
                  <span className="font-mono">low-cost</span> arrives as one
                  thing rather than as eight characters a model must reassemble.
                </p>
                <p>
                  What it costs is visible in the table itself. Because the cut
                  happens only at spaces, the full stop rides along on the last
                  word, so the six sentences give both{" "}
                  <span className="font-mono">re-analysis</span> at 31 and{" "}
                  <span className="font-mono">re-analysis.</span> at 32 as
                  separate entries, and both{" "}
                  <span className="font-mono">She</span> at 5 and{" "}
                  <span className="font-mono">she</span> at 39, and both{" "}
                  <span className="font-mono">The</span> at 6 and{" "}
                  <span className="font-mono">the</span> at 43. Three pairs out
                  of 47 entries hold one word twice over, and each of those six
                  entries has a row of parameters learned from half the text it
                  should have had.
                </p>
                <KeepInMind>
                  Splitting at spaces is the shortest answer there is to where
                  the words are, and it is the baseline the pages after this one
                  each improve on. What it leaves behind is punctuation stuck to
                  the word in front of it, which cost one duplicated entry in a
                  table of 47 here and costs a great many more over real prose.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Sequence length is what everything downstream pays in">
                <p>
                  The running sentence is 51 numbers one way and 7 the other, a
                  little over seven times as many, on the same writing. That
                  ratio is the second of the two numbers a scheme is judged on,
                  and it is the one a model&rsquo;s running cost is measured
                  against.
                </p>
                <NumberTable
                  headings={[
                    "cut into",
                    "entries in the table",
                    "numbers the sentence becomes",
                  ]}
                  rows={[
                    ["single characters", "38", "51"],
                    ["whole words", "48", "7"],
                  ]}
                  caption="The two costs move in opposite directions on the same six sentences, which is the whole of the trade the rest of this section navigates."
                />
                <InAModel>
                  <p>
                    A model that lets every position read every other position
                    does a piece of work for each pair of positions, so its cost
                    grows with the square of the sequence length. Counting the
                    pairs for the running sentence under each rule shows what
                    that does to a ratio of seven.
                  </p>
                  <Equation>
                    {"pairs of positions, by character   51 × 51  =  2,601\n" +
                      "pairs of positions, by word          7 × 7  =     49\n" +
                      "\n" +
                      "2,601 / 49  ≈  53"}
                  </Equation>
                  <p>
                    Seven times as many numbers is roughly fifty times the work
                    by that measure, on a sentence a person reads in a second.
                    Any fixed limit on how much text a model can hold at once is
                    also a limit in numbers rather than in words, so the same
                    limit holds seven times less writing under the character
                    scheme.
                  </p>
                </InAModel>
                <KeepInMind>
                  Fewer entries in the table almost always means more numbers
                  per sentence. Neither number is worth quoting alone, and a
                  scheme that improves one usually pays for it in the other.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Which of the two tables is smaller">
                <p>
                  Character tables are described everywhere as the small ones,
                  and over enough text they are. Over a little text they are
                  not, and the crossover is worth seeing because it is the
                  reason a small experiment can point the wrong way. I fed the
                  six sentences in one at a time and measured both tables after
                  each.
                </p>
                <VocabularyGrowthChart />
                <>
<p>
                  After the first sentence the character table holds 25 entries and the whole-word table holds 8, so the character table is three times the size. It stays larger through the fourth sentence, 37 against 30. Between the fourth and the fifth the lines cross, and by the sixth they are 38 against 48. The character line has almost stopped moving, because the six sentences use 375 characters in all and draw them from an alphabet that was nearly complete after four of them.
                </p>
                <p>
                  The word line has not slowed at all, and it is still adding eight entries a sentence at the sixth.
                </p>
</>
                <WhyThisWorks title="Why one line flattens and the other does not">
                  <p>
                    The set of characters a language writes with is finite and
                    small, so a table over it fills up and then stops. The set
                    of words is not bounded in the same way, since compounds,
                    names, numbers and inflections keep arriving, and any list
                    of them drawn from a finite corpus is missing the next
                    sentence&rsquo;s words. That is the growth Heaps described,
                    a count rising as a power of the amount of text read, which
                    slows without ever flattening.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The claim that character tables are smaller is a claim about
                  the limit, not about any particular corpus. Measured on six
                  sentences the character table is the larger one for four of
                  them, which is exactly the kind of result a small pilot
                  produces and a reader over-reads.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Part 3",
          quiz: [
            trueFalse(
              "Measured on these six sentences, the character table is the larger of the two for four of them.",
              true,
              "After the first sentence it holds 25 entries against the whole-word table’s 8, and it stays larger through the fourth at 37 against 30. The lines cross between the fourth and the fifth and finish at 38 against 48, so the claim that character tables are smaller is a claim about the limit rather than about any particular corpus.",
            ),
            choice(
              "Why has the character line almost stopped moving by the sixth sentence while the word line is still adding eight entries a sentence?",
              [
                "The set of characters a language writes with is finite and small, where compounds, names, numbers and inflections keep arriving",
                "The six sentences were chosen to use the same letters throughout",
                "The character table hands back a stand-in rather than growing",
                "Spaces and punctuation count as characters, which fills that table at once",
              ],
              0,
              "The 375 characters of these six sentences are drawn from an alphabet that was nearly complete after four of them. Any list of words drawn from a finite corpus is missing the next sentence’s words, which is the growth Heaps described, rising as a power of the amount of text read and slowing without ever flattening.",
            ),
            choice(
              "The running sentence is 51 numbers under the character rule and 7 under the whole-word rule. For a model that lets every position read every other position, what does that ratio cost?",
              [
                "Roughly fifty times the work, since the work grows with the square of the sequence length",
                "About seven times the work",
                "Nothing, since the work depends on the size of the table",
                "Roughly seven times the parameters",
              ],
              0,
              "A little over seven times as many numbers is roughly fifty times the work by that measure, on a sentence a person reads in a second. A fixed limit on how much text a model holds at once is a limit in numbers rather than in words, so the same limit holds seven times less writing under the character scheme.",
            ),
            several(
              "Cutting only at spaces leaves which of these as separate entries in the table of 47?",
              [
                "re-analysis and re-analysis.",
                "The and the",
                "low and cost",
                "did and n’t",
              ],
              [0, 1],
              "The full stop rides along on the last word and a capital is a different character, so both of those pairs are two entries, as She and she are. Three pairs out of 47 entries hold one word twice over, and each of those six entries has a row learned from half the text it should have had. A hyphen and an apostrophe are not spaces, so low-cost and didn’t each arrive as one piece.",
            ),
        ],
        },
        {
          title: "Part 4. The Piece It Has Never Seen",
          content: (
            <>
              <SubSection title="12. A vocabulary is finite and writing is not">
                <p>
                  Everything so far assumed the piece being looked up is in the
                  list. The interesting case is the other one, and it is not
                  rare. The same growth measurement says how often it happens.
                  Fitting on the first five sentences and then reading the
                  sixth, which those five have never seen, 8 of its 12 words are
                  absent from the word table while 1 of its 60 characters is
                  absent from the character table.
                </p>
                <NumberTable
                  headings={[
                    "table built from",
                    "unseen in the next sentence, by character",
                    "unseen in the next sentence, by word",
                  ]}
                  rows={[
                    ["1 sentence", "5 of 62", "7 of 10"],
                    ["2 sentences", "6 of 71", "8 of 12"],
                    ["3 sentences", "2 of 60", "7 of 9"],
                    ["4 sentences", "0 of 71", "11 of 13"],
                    ["5 sentences", "1 of 60", "8 of 12"],
                  ]}
                  caption="Each row encodes the sentence that has not arrived yet against tables that have never met it."
                />
                <p>
                  The character column falls to nothing at the fourth sentence
                  and then rises by one at the fifth, because the sixth sentence
                  opens with a capital S and the five before it never used one.
                  The word column does not fall at all. Two thirds of an
                  ordinary sentence is missing from a word
                  table built on five sentences, and the reason the same thing
                  does not happen at the scale of a million words is only that
                  the fraction gets smaller, never that it reaches zero.
                </p>
                <KeepInMind>
                  Something has to happen at a piece the list does not hold, in
                  every scheme, forever. It is not a corner case to be tidied
                  away, and how a scheme answers it is most of that
                  scheme&rsquo;s character.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Substituting a stand-in">
                <p>
                  The common answer is to reserve one entry that means
                  &ldquo;something else&rdquo; and hand its number back for
                  anything the list does not hold. That is the extra entry both
                  tables on this page carry, sitting at number 0, and it is why
                  47 distinct words come to 48 entries. Every text then encodes,
                  whatever is in it, and nothing ever refuses.
                </p>
                <UnknownAnswerTable />
                <p>
                  The first two blocks are the cost. Both sentences are seven
                  words long, both use six words the table holds, and each has
                  one word it does not, so both come out as the same seven
                  numbers. A model shown either of them is shown the identical
                  input.
                </p>
                <KeepInMind>
                  A stand-in buys the guarantee that any text can be encoded.
                  What it spends is the distinction between everything it stands
                  in for, and on a word table over five sentences that was two
                  thirds of the sentence.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What the stand-in throws away">
                <p>
                  It is worth being precise about what is lost, because the
                  loss is total rather than partial. The number 0 does not carry
                  a blurred version of{" "}
                  <span className="font-mono">calibration</span>. It carries
                  nothing about it at all, not its length, not its letters, not
                  whether it was a name or a verb. Reading the numbers back
                  gives the same sentence for both, with the same gap in the
                  same place.
                </p>
                <Equation>
                  {"The calibration drift was larger than expected.\n" +
                    "The temperature drift was larger than expected.\n" +
                    "\n" +
                    "both  →  6  0  15  47  27  42  20\n" +
                    "back  →  The [UNK] drift was larger than expected."}
                </Equation>
                <p>
                  Notice how mild this looks on these two sentences and how bad
                  it would be on a page where the unseen words are the names, the
                  quantities and the technical terms, which is exactly where
                  unseen words concentrate. The words a corpus has already met
                  many times are the common ones, so the pieces a stand-in
                  swallows are disproportionately the ones carrying the content.
                </p>
                <KeepInMind>
                  The stand-in destroys the difference between everything it
                  covers, and what it covers are the rare pieces, which are
                  usually the ones carrying most of what the sentence was about.
                  Every subword scheme later in this section is an attempt to
                  make that entry unreachable in practice.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Refusing instead">
                <p>
                  The other answer is to have no such entry and refuse. The same
                  47 words without a reserved entry give a table of 47, and
                  putting the same sentence to it produces no encoding at all,
                  with the piece it could not place named. That is the third
                  block above.
                </p>
                <p>
                  Refusing is not obviously worse. It is louder, which is
                  usually what one wants from a mistake, and it can be the
                  correct behaviour rather than a limitation. A scheme whose
                  pieces are guaranteed to cover every possible text should
                  never reach a stand-in, so giving it one would hide a fault in
                  the cutting rule behind a plausible-looking encoding. What
                  refusing costs is that it is now the caller&rsquo;s problem,
                  and a system that has to answer something cannot simply
                  decline to read the input.
                </p>
                <DerivationTable
                  expressionHeading="answer at an unseen piece"
                  reasonHeading="what it buys and what it costs"
                  rows={[
                    {
                      expression: "one reserved entry",
                      reason:
                        "every text encodes, and nothing ever fails. All the pieces it stands for become indistinguishable, and they are the rare ones.",
                    },
                    {
                      expression: "refuse",
                      reason:
                        "the failure is visible at the moment it happens, and can be handled deliberately. Something upstream now has to handle it, and a system that must answer cannot.",
                    },
                    {
                      expression: "make the case unreachable",
                      reason:
                        "no reserved entry is needed, because the pieces cover every text by construction. The pieces are then small, so sequences are long, which is the cost section 10 measures.",
                    },
                  ]}
                />
                <KeepInMind>
                  There is no free answer here. A scheme either loses the
                  distinctions it cannot represent, or refuses to encode, or
                  makes its pieces small enough that the case cannot arise and
                  pays in sequence length.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. The table that can never meet an unseen piece">
                <p>
                  The third answer deserves its own section, because it is the
                  one that shows the other two are choices rather than
                  necessities. Text stored on a computer is a sequence of bytes,
                  and there are exactly 256 possible byte values, so a table of
                  all 256 spells every text that can be written and needs no
                  reserved entry and no corpus to be built from.
                </p>
                <p>
                  Put the sentence that carries two letters the six sentences
                  never used to each of the two tables. The character table
                  substitutes twice and gives back{" "}
                  <span className="font-mono">
                    [UNK]ngstr[UNK]m
                  </span>{" "}
                  where the writing said something else. The byte table has
                  nothing unknown to it, comes back exactly, and pays for that
                  in length, 71 numbers against the character table&rsquo;s 69,
                  because the two accented letters take two bytes each.
                </p>
                <WorkedExample title="Counting the same sentence both ways">
                  <p>
                    A plain English letter, digit, space or mark is stored as
                    one byte. A letter outside that basic set is stored as
                    more than one, and the two accented letters here take two
                    each.
                  </p>
                  <Equation>
                    {"Dr. Alvarez didn't expect the low-cost re-analysis in Ångström units.\n" +
                      "\n" +
                      "characters        69\n" +
                      "Å                 two bytes, 195 and 133\n" +
                      "ö                 two bytes, 195 and 182\n" +
                      "everything else   67 characters, one byte each\n" +
                      "\n" +
                      "bytes             67 + 2 + 2  =  71"}
                  </Equation>
                  <p>
                    The character table counts 69 pieces and has no entry for
                    two of them. The byte table counts 71, and every one of the
                    71 is a value from 0 to 255, which the table held before
                    it had read anything. Nothing was added to it for this
                    sentence, and nothing would be added for a sentence in any
                    other script.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Coverage can be made a property of the scheme instead of a
                  property of the corpus, and the price is then paid in sequence
                  length rather than in lost distinctions. Which of those two
                  prices is worth paying is what the schemes in the rest of this
                  section disagree about.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Round Trip",
          content: (
            <>
              <SubSection title="17. Encoding the sentence and reading it straight back">
                <p>
                  The sharpest test of a scheme is to encode a text and decode
                  the numbers immediately, with no model in between, and compare
                  what comes back against what went in, character for character.
                  Anything the scheme discards shows up as a difference, and
                  nothing else does.
                </p>
                <RoundTripTable />
                <p>
                  The running sentence comes back exactly under both rules, and
                  it is the weakest of the three cases, since it has one space
                  between every pair of words and uses only pieces the six
                  sentences already held. The two texts below it are where the
                  schemes part.
                </p>
                <KeepInMind>
                  Encode then decode, and compare against the original string
                  rather than reading the output and judging it acceptable. The
                  differences that matter are small and easy to skim past.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The spacing the word scheme never held">
                <p>
                  The second text is the running sentence with one doubled space
                  and one line break in place of a space. Under the whole-word
                  rule it still becomes the same seven numbers, none of them
                  unseen, and it still decodes without complaint. What comes
                  back has single spaces everywhere and no line break, so it is
                  a different string from the one that went in.
                </p>
                <p>
                  This is not a fault that could be fixed by a bigger table. The
                  whole-word rule keeps runs of non-space characters and keeps
                  nothing about what lay between them, so the information was
                  discarded at the cut and no amount of learning downstream
                  recovers it. Gluing with a single space is a guess made once
                  and applied everywhere.
                </p>
                <KeepInMind>
                  If a scheme does not keep the whitespace, no run of its
                  numbers can reproduce the whitespace. Everything a cut throws
                  away is gone before the model is reached.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. A letter the corpus never used">
                <p>
                  The character rule fails the same two texts for a different
                  reason. On the second text it becomes 52 numbers, one of them
                  the stand-in, because the line break is a character these six
                  sentences never contained, and what comes back has the doubled
                  space preserved and the line break replaced. On the third text
                  it substitutes twice, for the two accented letters.
                </p>
                <p>
                  The distinction between the two failures matters. The
                  character rule could round trip both texts perfectly if the
                  corpus it was built from had contained a line break and an
                  accent, so its failure is a fact about this corpus. The
                  whole-word rule could not round trip the second text however
                  much text it had been built from, so its failure is a fact
                  about the rule. When a scheme reports a loss it is worth
                  asking which of the two kinds it is, since only one of them
                  goes away with more data.
                </p>
                <KeepInMind>
                  A round trip can fail because the table was too small or
                  because the cut discarded something, and those have different
                  remedies. More text fixes the first and never fixes the
                  second.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. What a round trip can and cannot preserve">
                <p>
                  Put the two together and the rule is short. A scheme
                  reproduces exactly what it both keeps and can spell, and
                  nothing else. Keeping means the cut did not discard it;
                  spelling means the table holds the pieces it was cut into.
                </p>
                <p>
                  It follows that any scheme which normalises anything cannot
                  round trip exactly, and this is a choice rather than a defect.
                  Folding capitals together makes{" "}
                  <span className="font-mono">The</span> and{" "}
                  <span className="font-mono">the</span> one entry instead of
                  the two this page has, which is one fewer row of parameters
                  and twice the text to learn it from, and it makes the capital
                  unrecoverable. Later pages in this section normalise a good
                  deal more than case, rewriting quotation marks and escaping
                  characters, and each of those rewritings is a place where the
                  writing that comes back is not the writing that went in. The
                  honest way to describe such a scheme is to say what it
                  discards, not to claim it is lossless.
                </p>
                <KeepInMind>
                  Exact round tripping and normalisation pull against each
                  other, and a scheme is entitled to choose either one. What it
                  should not do is describe itself as lossless while folding two
                  spellings onto one entry.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Idea Stops Being Defined",
          content: (
            <>
              <SubSection title="21. The four things any scheme has to settle">
                <p>
                  Everything on this page reduces to four questions, and every
                  page after it answers the same four differently. Carrying them
                  is enough to read the rest of the section, and enough to
                  compare two schemes that describe themselves in quite
                  different language.
                </p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="what turns on the answer"
                  rows={[
                    {
                      expression: "what are the pieces",
                      reason:
                        "characters, whole words, bytes, or pieces learned from a corpus. This fixes how many entries the table has and how many numbers a sentence becomes, and those two move against each other.",
                    },
                    {
                      expression: "how are they found",
                      reason:
                        "a fixed rule about the writing system, a list somebody wrote down, or a procedure trained on a corpus. A trained procedure inherits whatever that corpus was, including its language and its subject.",
                    },
                    {
                      expression: "what happens at a piece it has never seen",
                      reason:
                        "a reserved entry, a refusal, or a guarantee that the case cannot arise. Each is paid for, in lost distinctions, in a failure the caller must handle, or in sequence length.",
                    },
                    {
                      expression: "is the round trip exact",
                      reason:
                        "whether decoding the numbers gives back the original string character for character. Any normalisation at all means no, and a scheme may reasonably want the normalisation.",
                    },
                  ]}
                />
                <WorkedExample title="The two schemes on this page, answered">
                  <NumberTable
                    headings={[
                      "question",
                      "single characters",
                      "whole words",
                    ]}
                    rows={[
                      ["what are the pieces", "each character", "each run without spaces"],
                      ["how are they found", "the corpus’s characters", "the corpus’s words"],
                      ["at an unseen piece", "one reserved entry", "one reserved entry"],
                      ["round trip exact", "yes, if the table has met every character", "no, the spacing is not kept"],
                      ["entries", "38", "48"],
                      ["numbers per sentence", "51", "7"],
                    ]}
                  />
                </WorkedExample>
                <KeepInMind>
                  Four questions, and a scheme that leaves any of them unstated
                  has not been described. The two numbers underneath, the count
                  of entries and the count of numbers per sentence, are what any
                  two schemes can actually be compared on.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. What is undefined, and what has to be chosen">
                <p>
                  Some of what a scheme has to settle is a genuine choice
                  between defensible answers, and some of it is a case where the
                  idea simply does not extend. The two are worth separating,
                  since arguing about the second is wasted effort. The table
                  gathers both, with what the mathematics says in each.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what is undefined, or what must be decided"
                  rows={[
                    {
                      expression: "a piece the list does not hold",
                      reason:
                        "undefined, and unavoidable. A list is finite and the set of things that can be written is not, so the case arises for every scheme whose pieces are not guaranteed to cover every text. There are three answers and each costs something, which is section 15.",
                    },
                    {
                      expression: "a number outside the list",
                      reason:
                        "undefined, with no choice attached. A table of 48 entries owns the numbers 0 to 47, and 48 names no piece, so there is nothing to decode. This is the case a model generating numbers can walk into, since nothing about a generated number guarantees it is in range.",
                    },
                    {
                      expression: "a text with nothing in it that counts as a piece",
                      reason:
                        "defined, and it is the empty run of numbers. Three spaces become no numbers under the whole-word rule and three numbers under the character rule, and the difference is what each rule counts as a piece rather than a disagreement about the text.",
                    },
                    {
                      expression: "the same piece listed twice",
                      reason:
                        "undefined, because the number of a piece is its position and a piece in two positions has two numbers. Whichever is used, everything learned about that piece is split across two rows, so the list has to hold each piece once and be checked for it.",
                    },
                    {
                      expression: "the reserved entry, decoded",
                      reason:
                        "defined, and it is not the writing it stood for. It decodes to its own spelling, since nothing about what was there survived the substitution. Two texts differing only in an unseen word decode to the identical string, which section 14 measures.",
                    },
                    {
                      expression: "a scheme that normalises, round tripped",
                      reason:
                        "no longer exact, by construction rather than by accident. Folding two spellings onto one entry is the discarding of the difference between them, and the difference cannot be reconstructed from an entry that no longer records it.",
                    },
                    {
                      expression: "closeness between two numbers",
                      reason:
                        "meaningless. The numbers are positions in a list, so a difference between two of them is a fact about the ordering of the list and nothing else. Making nearness mean something requires giving each entry a position in a space, which is a separate construction and the subject of the last pages of this section.",
                    },
                    {
                      expression: "changing the list after training",
                      reason:
                        "well defined and silently wrong, which is the harder failure of the two. Inserting or removing an entry shifts the numbers of everything after it, so every shifted piece points at a row learned for a different piece, and the model goes on running and answers worse.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying. The unseen piece is
                  unavoidable and has no free answer, so a scheme is largely
                  described by what it does there. And the numbers say which
                  piece and nothing more, so any nearness a reader imagines
                  between them has to be built separately before it exists.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            choice(
              "What does the reserved entry at number 0 carry about the word it stood in for?",
              [
                "Nothing at all, not its length, not its letters, not whether it was a name or a verb",
                "A blurred version of the word",
                "Its first letter, which the alphabetical table preserves",
                "Enough to tell one unseen word from another when the numbers are read back",
              ],
              0,
              "Two seven-word sentences, each using six words the table holds and one it does not, come out as the identical seven numbers, so a model shown either is shown the same input. Reading the numbers back gives the same sentence for both, with the same gap in the same place. On a word table built from five sentences that gap covered 8 of the next sentence’s 12 words.",
            ),
            several(
              "Which answers to the unseen piece does the page name?",
              [
                "Reserve one entry meaning something else, which spends the distinction between everything it stands in for",
                "Refuse to encode, which makes the piece the caller’s problem",
                "Make the pieces small enough that the case cannot arise, and pay in sequence length",
                "Add the unseen piece to the table when it is met",
              ],
              [0, 1, 2],
              "There is no free answer here, and how a scheme answers is most of that scheme’s character. The byte table is the unreachable case, since its 256 entries spell every text, and it pays 71 numbers against the character table’s 69 on the sentence with two accented letters. Adding the piece when it is met is not available, because adding an entry after anything has been trained against the table changes what every number means.",
            ),
            choice(
              "Which of these round-trip failures is a fact about the rule rather than about the corpus?",
              [
                "The whole-word rule gives back single spaces everywhere and no line break",
                "The character rule substitutes for a line break these six sentences never contained",
                "The character rule substitutes for two accented letters the six sentences never used",
              ],
              0,
              "The character rule could round trip both texts perfectly had its corpus held a line break and an accent, so more text fixes it. The whole-word rule keeps runs of non-space characters and keeps nothing about what lay between them, so the information was discarded at the cut and no amount of text brings it back.",
            ),
            trueFalse(
              "A scheme that folds The and the onto one entry can still fairly describe itself as lossless.",
              false,
              "Folding the capitals buys one fewer row of parameters and twice the text to learn it from, and it makes the capital unrecoverable. Normalisation and exact round tripping pull against each other, and a scheme is entitled to choose either, but the honest description says what it discards.",
            ),
            trueFalse(
              "A table of 48 entries owns the numbers 0 to 47, so a model that produces the number 48 has produced something with no piece to decode to.",
              true,
              "The number of a piece is its position, and position 48 does not exist in a list of 48. This case has no choice attached, unlike the unseen piece, and it is one a model generating numbers can walk into, since nothing about a generated number guarantees it is in range.",
            ),
        ],
        },
        {
          title: "Practice. Building the Tables and Reading Them Back",
          practice: [
            exercise(
              "Build the whole-word table and number two sentences",
              ["Build the table Part 2 reads from. Count the pieces the six sentences give when they are cut at spaces, sort the distinct ones alphabetically, and put the stand-in in front so that it sits at number 0. Then print the numbers the running sentence and the fifth sentence go in as.", "The running sentence should come out as the seven numbers of section 2, and the fifth as the thirteen of section 5 with the at 43 in both. Then count how many of the entries the six sentences use exactly once, which the page does not print and which is what section 7 means by a row learned from very little text."],
              `from oop_ml import Corpus, Vocabulary, WhitespacePreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
rule = WhitespacePreTokenizer()
counts = Corpus.of(notebook).word_counts(rule)

# Build the vocabulary with "[UNK]" first and the sorted distinct pieces
# after it, and print how many distinct pieces and how many entries there
# are. Print the numbers of the first and the fifth sentence. Then print
# how many entries were met exactly once, and how often the was met.`,
              `from oop_ml import Corpus, Vocabulary, WhitespacePreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
rule = WhitespacePreTokenizer()
counts = Corpus.of(notebook).word_counts(rule)

table = Vocabulary(["[UNK]", *sorted(counts.words)], unknown_token="[UNK]")
print(f"{counts.n_words} distinct pieces, {table.n_tokens} entries")

for sentence in (notebook[0], notebook[4]):
    numbers = table.ids_of(rule.split(sentence).texts)
    print(" ".join(str(number) for number in numbers))

once = sum(counts.count_of(word) == 1 for word in counts.words)
print(f"entries met once: {once} of {counts.n_words}")
print(f"the is met {counts.count_of('the')} times")`,
              `47 distinct pieces, 48 entries
3 2 14 19 43 28 32
6 15 47 40 44 26 47 27 42 43 17 39 20
entries met once: 39 of 47
the is met 9 times`,
              { hints: ["The counts know their distinct pieces as words, and sorted puts those in alphabetical order with the capitals first, which is the order the page’s numbers assume.", "Vocabulary takes the list of entries and, by keyword, which of them is the unknown_token. Putting the stand-in first in the list is what makes it number 0.", "The rule’s split answers a collection whose texts are the pieces alone, and the table’s ids_of turns a sequence of pieces into their numbers.", "count_of answers how many times one piece occurred, so the entries met once are a sum over the distinct pieces of whether that count equals one."], check: numberCheck("How many of the 47 pieces do the six sentences use exactly once?", 39, 0.0, "Thirty-nine of the 47 entries occur once in the six sentences, so 39 of the 48 rows a model would carry are each learned from a single occurrence, while the is met nine times. That is section 7’s point about a rare entry, and it is the usual shape of a word table, a few entries seen often and most of them seen hardly at all.") },
            ),
            exercise(
              "Grow both tables one sentence at a time",
              ["Section 11 fed the six sentences in one at a time and measured both tables after each. Do the same. After each sentence, fit the character scheme on the sentences read so far and count the distinct space-delimited pieces in them, and print the size of each table with its stand-in counted.", "The first, fourth and sixth rows should be the 25 against 8, 37 against 30 and 38 against 48 the page quotes. The page says the lines cross between the fourth and the fifth sentence without printing the fifth row, so read off what the whole-word table holds there."],
              `from oop_ml import CharacterTokenizer, Corpus, WhitespacePreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
rule = WhitespacePreTokenizer()

# For each size from 1 to 6, take the first size sentences, fit a
# character tokenizer with "[UNK]" as its unknown token on them, count
# their distinct pieces under the rule, and print the two table sizes.
# The whole-word table is the distinct pieces and one stand-in.`,
              `from oop_ml import CharacterTokenizer, Corpus, WhitespacePreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
rule = WhitespacePreTokenizer()

for size in range(1, len(notebook) + 1):
    read = notebook[:size]
    characters = CharacterTokenizer(unknown_token="[UNK]").fit(read)
    words = Corpus.of(read).word_counts(rule)
    character_table = characters.vocabulary.n_tokens
    word_table = words.n_words + 1
    print(f"{size} sentences  characters {character_table}  whole words {word_table}")`,
              `1 sentences  characters 25  whole words 8
2 sentences  characters 29  whole words 15
3 sentences  characters 35  whole words 23
4 sentences  characters 37  whole words 30
5 sentences  characters 37  whole words 40
6 sentences  characters 38  whole words 48`,
              { hints: ["A slice of the list up to size is the sentences read so far, and both the tokenizer’s fit and Corpus.of take that list as it is.", "A fitted tokenizer carries its table as vocabulary, and the table’s n_tokens counts every entry, the stand-in included.", "The word counts know n_words, the number of distinct pieces. The page’s whole-word table has one reserved entry on top of those, so add one."], check: numberCheck("How many entries does the whole-word table hold after the fifth sentence?", 40, 0.0, "After five sentences the whole-word table holds 40 entries against the character table’s 37, which is the first row where it is the larger. The character table gained nothing from the fifth sentence, since its alphabet was nearly complete after four, while the word table gained ten there and eight more at the sixth, the line section 11 says has not slowed.") },
            ),
            exercise(
              "Two sentences, one run of numbers, and a table that refuses",
              ["Part 4 put two sentences to the whole-word table that differ in one word the six sentences never used. Encode both against the table with a stand-in, print the numbers, and glue the pieces the numbers name back together with single spaces. Then build the same table without a stand-in and put the first sentence to it.", "The two runs of numbers should be identical, with 0 in the second place, and both should read back as the same sentence with the same gap. The table without a stand-in should refuse, and its refusal should name the piece it could not place."],
              `from oop_ml import Corpus, UnknownTokenError, Vocabulary, WhitespacePreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
rule = WhitespacePreTokenizer()
words = sorted(Corpus.of(notebook).word_counts(rule).words)
texts = [
    "The calibration drift was larger than expected.",
    "The temperature drift was larger than expected.",
]

# Build one table with "[UNK]" in front as its unknown token and one from
# the words alone. For each text print its numbers under the first table
# and the text those numbers read back as. Then ask the second table for
# the numbers of the first text, and print the refusal it raises.`,
              `from oop_ml import Corpus, UnknownTokenError, Vocabulary, WhitespacePreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
rule = WhitespacePreTokenizer()
words = sorted(Corpus.of(notebook).word_counts(rule).words)
texts = [
    "The calibration drift was larger than expected.",
    "The temperature drift was larger than expected.",
]

substituting = Vocabulary(["[UNK]", *words], unknown_token="[UNK]")
closed = Vocabulary(words)

for text in texts:
    numbers = substituting.ids_of(rule.split(text).texts)
    print(" ".join(str(number) for number in numbers))
    print(" ".join(substituting.tokens_of(numbers)))

try:
    closed.ids_of(rule.split(texts[0]).texts)
except UnknownTokenError as refusal:
    print(f"refused: {refusal}")`,
              `6 0 15 47 27 42 20
The [UNK] drift was larger than expected.
6 0 15 47 27 42 20
The [UNK] drift was larger than expected.
refused: token 'calibration' is not in this vocabulary of 47, which has no unknown token to fall back on`,
              { hints: ["A Vocabulary given no unknown_token has no entry to fall back on, so the same list of words without the stand-in is the table that refuses.", "ids_of turns pieces into numbers and tokens_of turns numbers back into pieces, and the whole-word scheme’s glue is a single space, so the reading back is one join.", "The refusal is an UnknownTokenError. Catch it by that name around the call on the second table, and print the exception itself, which is its own sentence."] },
            ),
            exercise(
              "Put two awkward texts to the character table and the byte table",
              ["Fit the character scheme on the six sentences and build the byte scheme, which is fitted on nothing. Encode the sentence with two accented letters and the running sentence with a doubled space and a line break under each, and print how many numbers each text became, how many of them are the stand-in, and whether decoding the numbers gives back the text exactly.", "The character table should substitute twice on the first text and once on the second, as sections 16 and 19 say, and the byte table should come back exact on both. Read off how many numbers the accented sentence costs under bytes."],
              `from oop_ml import ByteTokenizer, CharacterTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
texts = {
    "accented": "Dr. Alvarez didn't expect the low-cost re-analysis in Ångström units.",
    "respaced": "Dr.  Alvarez didn't expect\\nthe low-cost re-analysis.",
}
schemes = {
    "characters": CharacterTokenizer(unknown_token="[UNK]").fit(notebook),
    "bytes": ByteTokenizer(),
}

# For each text and each scheme, encode the text, count the tokens whose
# text is "[UNK]", decode the numbers and compare with the text, and print
# one line. Then print how many entries the byte table holds.`,
              `from oop_ml import ByteTokenizer, CharacterTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
texts = {
    "accented": "Dr. Alvarez didn't expect the low-cost re-analysis in Ångström units.",
    "respaced": "Dr.  Alvarez didn't expect\\nthe low-cost re-analysis.",
}
schemes = {
    "characters": CharacterTokenizer(unknown_token="[UNK]").fit(notebook),
    "bytes": ByteTokenizer(),
}

for label, text in texts.items():
    for name, scheme in schemes.items():
        encoding = scheme.encode(text)
        stand_ins = sum(token.text == "[UNK]" for token in encoding)
        exact = scheme.decode(encoding.ids) == text
        print(f"{label}  {name:10s}  {encoding.n_tokens} numbers  {stand_ins} stand-ins  exact {exact}")

print(f"the byte table holds {schemes['bytes'].vocabulary.n_tokens} entries")`,
              `accented  characters  69 numbers  2 stand-ins  exact False
accented  bytes       71 numbers  0 stand-ins  exact True
respaced  characters  52 numbers  1 stand-ins  exact False
respaced  bytes       52 numbers  0 stand-ins  exact True
the byte table holds 256 entries`,
              { hints: ["Both schemes answer encode with an encoding that knows n_tokens and its ids, and iterating over it gives tokens that each carry text and token_id.", "A substituted piece is a token whose text is the stand-in’s own spelling, so counting the tokens whose text equals \"[UNK]\" counts the substitutions.", "decode takes the encoding’s ids and answers a string. Compare that string with the text using ==, which is the test section 17 asks for in place of reading the output."], check: numberCheck("How many numbers does the accented sentence become under the byte table?", 71, 0.0, "The sentence is 69 characters, and 67 of them are one byte each while the two accented letters are two bytes each, which comes to 71. The character table spends 69 numbers and loses both letters, where the byte table spends two more and loses nothing, because its 256 entries were complete before it read any text. That is section 16’s trade, coverage paid for in length.") },
            ),
          ],
        },
      ]}
    />
  );
}
