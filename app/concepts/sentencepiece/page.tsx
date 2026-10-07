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
import { CrossingMerges } from "@/components/widgets/CrossingMerges";
import { ExactUpToThis } from "@/components/widgets/ExactUpToThis";
import { MarkLadder } from "@/components/widgets/MarkLadder";
import { MarkedSentence } from "@/components/widgets/MarkedSentence";
import { MarkedVocabulary } from "@/components/widgets/MarkedVocabulary";
import { RoundTripPair } from "@/components/widgets/RoundTripPair";
import { SentencePiecePlayground } from "@/components/widgets/SentencePiecePlayground";
import { SizeAgainstPieces } from "@/components/widgets/SizeAgainstPieces";
import { WhichMark } from "@/components/widgets/WhichMark";
import { WithoutSpaces } from "@/components/widgets/WithoutSpaces";

export const metadata: Metadata = {
  title: "SentencePiece · oop_ml",
  description:
    "Treat whitespace as part of the text representation and learn subword pieces from that stream.",
};

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";
const MARK = "▁";

export default function SentencePiecePage() {
  return (
    <ConceptPage
      lessonId="sentencepiece"
      intuition={lessonIntuitions["sentencepiece"]}
      technicalStart="Part 2. The Space as a Symbol"
      openingTitle="Learn the Pieces Before Deciding Where the Words Are"
      playgroundIntro="Follow the space markers through encoding and decoding. Compare the reconstructed text with the input and check which normalisation rules were applied."
      title="SentencePiece"
      tagline="Treat whitespace as part of the text representation and learn subword pieces from that stream."
      prerequisites={
        <>
          One thing from earlier in this section is assumed, which is a scheme
          that starts from single characters and repeatedly joins the commonest
          adjacent pair, since that is the loop running underneath everything
          here. The loop itself is untouched on this page; what changes is what
          it is handed, so the whole argument is about the step that happens
          before any counting starts. No probability appears, and the only
          arithmetic is counting and a rule for breaking a tie.
        </>
      }

      playground={<SentencePiecePlayground />}
      sections={[
        {
          title: "Part 1. Text That Nothing Has Cut Into Words Yet",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. One sentence, one corpus, and the step before everything">
                <p>
                  We carry the same sentence as the other pages in this section,
                  and beside it the same corpus of eighteen short sentences of
                  ordinary English about reports and costs and analyses. The
                  corpus holds 72 distinct words across 133 occurrences and does
                  not contain the sentence, which is the arrangement we want,
                  since a vocabulary is only interesting on text it was not
                  built from.
                </p>
                <Equation>{SENTENCE}</Equation>
                <>
                  <p>
                    The earlier examples first split on whitespace, then learned pieces
                    inside each resulting chunk. A whitespace split leaves Dr., didn’t
                    and low-cost intact. It does not decide whether a full stop ends a
                    sentence or belongs to an abbreviation.
                  </p>
                  <p>
                    A richer pre-tokenizer may split punctuation, contractions or
                    hyphenated expressions as well. Those are additional decisions.
                    SentencePiece lets us train from the text stream without first
                    supplying a linguistic word segmentation.
                  </p>
                </>
                <KeepInMind>
                  There are two questions here and they are usually asked
                  together. Where do the words end, and what pieces should a
                  word be made of? Everything on this page is about refusing to
                  ask the first one.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What the cutting rule is a fact about">
                <>
                  <p>
                    A whitespace split treats each uninterrupted run as one chunk. This
                    is often a convenient starting point for English, although a chunk
                    need not be a linguistic word. A Chinese sentence with no spaces
                    becomes one long chunk. Calling that chunk a word would confuse a
                    formatting boundary with a language boundary.
                  </p>
                  <p>
                    To make that concrete, this page carries five short sentences of
                    Chinese beside the English corpus, written the way Chinese is
                    written, with nothing between the words. Between them they use
                    seven words, the words for research, life, origin, student,
                    very, many and good, and several of those words turn up in more
                    than one sentence. A whitespace split finds five chunks in them,
                    one per line, and reports nothing unusual. The repetition a
                    learner needs is there, and it is inside the chunks, where a
                    rule about spaces cannot see it. Part 5 fits both schemes on
                    these five lines and measures what each finds.
                  </p>
                </>
                <>
                  <p>
                    Character-based subword learning can still find repeated pieces
                    inside those long chunks. It does not inherently require an
                    annotated Chinese segmenter. The distinction is whether a separate
                    word segmentation is required by the training pipeline.
                    SentencePiece provides a framework that can learn directly from
                    unsegmented text.
                  </p>
                </>
                <KeepInMind>
                  <p>
                    A whitespace split finds whitespace boundaries. It does not discover
                    words in a writing system that does not mark them that way. Keep
                    those two jobs separate when judging what the tokenizer has learned.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="3. And what the boundary marker costs">
                <p>
                  There is a second cost, and it is the one that shows up on our
                  own English sentence. A scheme that cuts on spaces has to
                  record somewhere that a word ended, or gluing the pieces back
                  gives one long run of letters, and the usual place to record
                  it is on the last character of each word. That makes the w
                  that ends low a different symbol from the w inside lower, which
                  is a real distinction and is bought at a real price.
                </p>
                <p>
                  Counted on our eighteen sentences the corpus uses 36 distinct
                  characters, the space among them. Marking the end of each word
                  turns the 35 that are not the space into 51 symbols, because
                  sixteen letters appear both inside a word and at the end of
                  one and are held apart, and the full stop only ever ends one.
                  Sixteen rows are spent before a single merge is learned, and
                  the smallest vocabulary that can exist at all is 52.
                </p>
                <p>
                  The holes are worse than the count. A letter that the corpus
                  uses only inside words has no end-of-word symbol, so a word
                  ending in it cannot be spelled. These eighteen sentences
                  contain the letter z, in the word size, and no word in them
                  ends in z. Alvarez does.
                </p>
                <KeepInMind>
                  Marking the end of a word doubles part of the alphabet and
                  leaves gaps in it, and the gaps are exactly where the unusual
                  text is. Both of those are consequences of having cut on
                  spaces, not of the merging loop.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. SentencePiece, stated">
                <p>
                  SentencePiece removes the first question by refusing to answer
                  it. Every run of whitespace in the text is replaced by an
                  ordinary character, one is put at the front, and from then on
                  the text is a single stream of symbols with nothing special
                  about any of them. The learner counts pairs over that stream
                  exactly as before. Decoding joins the pieces and turns every
                  such character back into a space.
                </p>
                <p>
                  Two things follow immediately and both are worth stating
                  before any detail. Nothing in the procedure refers to a
                  language, so the same code runs on English and on Chinese and
                  gets a defensible answer for both. And nothing was thrown away
                  on the way in, so the pieces carry the spaces along with the
                  letters and putting them back is concatenation rather than
                  guesswork.
                </p>
                <p>
                  It is worth saying plainly what SentencePiece is not. It is not
                  a third way of choosing pieces alongside merging and shrinking.
                  It is a treatment of the text that either of those can be run
                  on, and section 13 shows both running on the same four words.
                  The contribution is the step before the learner, which is why
                  this page spends its first half there.
                </p>
                <KeepInMind>
                  The whole idea is that the space stops being a separator and
                  becomes a character the learner counts like any other.
                  Everything else on this page follows from that, the three
                  pieces it costs on our sentence in section 17 and the strange
                  half of the vocabulary in section 11 along with the rest.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Space as a Symbol",
          content: (
            <>
              <SubSection title="5. One mark, in front of every word">
                <p>
                  The character chosen is {MARK}, which Unicode calls lower one
                  eighth block and numbers 9601. It was picked for two
                  properties. It looks like a space, so a marked text is still
                  readable, and it does not turn up in ordinary writing, so
                  nothing is being overloaded. Any character meeting the second
                  of those would serve, and section 21 measures what changes
                  when a different one is used.
                </p>
                <p>
                  The mark goes in front of a word rather than behind it, which
                  is the mirror image of the boundary marker in section 3 and is
                  not merely a matter of taste. A mark in front says a space
                  preceded this, and a space preceded the first word too, so one
                  is prepended to the whole text. Marking the front means no
                  letter is ever doubled, since a letter is a letter wherever it
                  sits and the mark is a symbol of its own.
                </p>
                <Equation>{`hello  world   →   ${MARK}hello${MARK}world`}</Equation>
                <KeepInMind>
                  Every whitespace run becomes exactly one mark and one is put at
                  the front. That is the whole of the transformation, and it is
                  written down here in full because everything that follows
                  depends on there being nothing else to it.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. What that does to the alphabet">
                <p>
                  Compare the two alphabets on the same eighteen sentences.
                  Marking the front leaves the 35 characters that are not the
                  space untouched and adds one symbol, for 36 in all. Marking the
                  end leaves 34 characters that only ever appear inside a word
                  and adds 17 more that are a character with a boundary
                  attached, for 51.
                </p>
                <NumberTable
                  headings={[
                    "where the boundary is recorded",
                    "symbols",
                    "smallest vocabulary",
                    "rows once the corpus runs out",
                  ]}
                  rows={[
                    ["in front of each word", "36", "37", "136"],
                    ["on each word’s last letter", "51", "52", "137"],
                  ]}
                  caption="The same corpus counted two ways. The last column is where each fit stops of its own accord, when no adjacent pair is left that occurs twice."
                />
                <p>
                  Fifteen rows is a small saving on a table of 137 and a large
                  one on a table of 40, and the second is the case that matters.
                  Below 52 rows the marked-at-the-end scheme cannot be fitted at
                  all, because dropping a symbol would leave part of its own
                  training corpus unspellable. The front-marked scheme runs from
                  37 upward.
                </p>
                <KeepInMind>
                  Recording the boundary in front costs one symbol whatever the
                  corpus is. Recording it behind costs one extra symbol for every
                  character that can end a word, which is a number the corpus
                  decides and which nobody chose.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The running sentence, marked">
                <p>
                  Here is the whole transformation on our sentence, with nothing
                  learned and nothing fitted. The sentence is 51 characters of
                  which six are spaces, and it becomes a stream of 52 symbols,
                  the six spaces replaced by six marks and one more put at the
                  front. Cut at the marks it is seven units, one per word, each
                  carrying its own mark.
                </p>
                <MarkedSentence />
                <p>
                  Notice what did not have to be decided. The full stop after Dr.
                  stayed attached to Dr. and the full stop after analysis stayed
                  attached to analysis, and no rule looked at either of them, so
                  the question of whether an abbreviation keeps its stop never
                  came up. The apostrophe in didn&rsquo;t is an ordinary
                  character in an ordinary unit, and so is the hyphen in
                  low-cost. Whether the pieces should divide at any of those
                  places is left entirely to the counting that comes next.
                </p>
                <KeepInMind>
                  Nothing in this step is learned and nothing in it is about
                  English. Applied to the Chinese sentences of section 2 the same
                  transformation puts one mark at the front of each line and
                  changes nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Cutting at the marks, and why that is a separate decision">
                <p>
                  Once the text is one stream, a merge could in principle join
                  any adjacent pair, including a pair with a mark between the two
                  halves. The framework does not allow that. Having marked the
                  text it cuts it at every mark, so each unit is one mark
                  followed by one word, and a piece is never allowed to reach out
                  of its unit.
                </p>
                <>
<p>
                  That second step is a genuine decision rather than a consequence of the first, and it is worth flagging now because the closing part measures what happens without it. Taken together the two steps amount to splitting on whitespace and putting a mark at the front of each piece, which sounds like it has quietly restored the thing the method set out to remove.
                </p>
                <p>
                  It has not, and the difference is precise. The mark is inside the unit, so it is a symbol the learner counts, merges and stores, and it comes back out at the other end. A separator is none of those things.
                </p>
</>
                <WhyThisWorks title="Why cutting at the marks is not the same as cutting on spaces">
                  <p>
                    A separator is deleted and remembered elsewhere. A mark is
                    kept, so it takes part in the arithmetic and appears in the
                    finished rows. On our corpus that makes the alphabet one
                    symbol larger where annotating the letters made it sixteen
                    larger. And the cutting rule is the same rule for every
                    writing system, since a language with no whitespace has one
                    unit per line and everything downstream carries on as
                    normal, which is the case section 19 measures.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  There are two steps and the paper&rsquo;s own defaults set
                  both. Mark every whitespace run, then cut at the marks. The
                  first is what makes the method language-independent and
                  reversible; the second is a convention with a measurable cost,
                  and section 20 measures it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "The eighteen sentences use 36 distinct characters, the space among them. Marking the end of every word turns the 35 that are not the space into how many symbols?",
              ["36", "51", "72", "137"],
              1,
              "Sixteen letters appear both inside a word and at the end of one and have to be held apart, and the full stop only ever ends one. So sixteen rows are spent before a single merge is learned, and the smallest vocabulary that can exist at all under that scheme is 52.",
            ),
            trueFalse(
              "The holes that marking the end of a word leaves in the alphabet sit exactly where the unusual text is.",
              true,
              "A letter the corpus uses only inside words has no end-of-word symbol, so a word ending in it cannot be spelled at all. These eighteen sentences contain z, in the word size, and no word in them ends in z. Alvarez does.",
            ),
            choice(
              "Why does the mark go in front of a word rather than behind it?",
              [
                "A mark in front means no letter is ever doubled, since a letter is a letter wherever it sits and the mark is a symbol of its own",
                "A mark in front reads more naturally when a marked text is printed",
                "A mark in front is what lets a piece reach across a word boundary",
                "A mark in front is what the merging learner requires",
              ],
              0,
              "A mark in front says a space preceded this, and a space preceded the first word too, so one is prepended to the whole text. Recording the boundary in front costs one symbol whatever the corpus is. Recording it behind costs one extra symbol for every character that can end a word, which is a number the corpus decides and nobody chose.",
            ),
            several(
              "Marking every whitespace run and then cutting at every mark amounts to splitting on whitespace and marking each piece. Which of these are the differences the page draws?",
              [
                "The mark is inside the unit, so the learner counts it, merges it and stores it, and it comes back out at the other end",
                "A separator is deleted and remembered elsewhere, so it takes no part in the arithmetic and appears in no finished row",
                "Cutting at the marks is the step that makes the method reversible",
                "Cutting at the marks follows from marking, so it is not a separate decision",
              ],
              [0, 1],
              "There are two steps and they are not the same kind of thing. Marking is what makes the method language-independent and reversible, since nothing is thrown away on the way in. Cutting at the marks is a convention added afterwards, with a measurable cost that the closing part measures. Keeping the mark as a symbol is also cheap, since on this corpus it makes the alphabet one symbol larger where annotating the letters made it sixteen larger.",
            ),
            trueFalse(
              "SentencePiece is a third way of choosing pieces, alongside merging and shrinking.",
              false,
              "It is a treatment of the text that either of those can be run on, and the page runs both on the same four words. The contribution is the step before the learner, which is why neither learner has to know what a mark is; both take units already spelled in symbols with counts.",
            ),
        ],
        },
        {
          title: "Part 3. What Gets Learned Once the Space Is a Symbol",
          content: (
            <>
              <SubSection title="9. Fifteen merges on four words">
                <p>
                  We need something small enough to check by hand, so for the
                  next three sections we drop to four words with their counts,
                  the example the original subword paper worked in its own text.
                  The word low occurs five times, lower twice, newest six times
                  and widest three. Marked, each is its characters with one mark
                  in front, so low is four symbols rather than three and the
                  sixteen word occurrences come to 95 pieces in all.
                </p>
                <Equation>{`low  =  ${MARK}  l  o  w`}</Equation>
                <p>
                  Now run the loop. Count every adjacent pair, weighted by how
                  often the word occurs, take the largest count, join it
                  everywhere, and repeat. Fifteen merges later every word is a
                  single piece and the corpus is 16 pieces, one per occurrence.
                  Drag the control and watch the mark wait.
                </p>
                <MarkLadder />
                <KeepInMind>
                  The loop is untouched. It counts pairs, takes the largest, and
                  joins. The only thing that has changed is that one of the
                  symbols it is counting is a space.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The mark joins last, and a codepoint is why">
                <p>
                  The order the merges arrive in has a shape worth stopping on.
                  The first two build the ending est out of e, s and t at a count
                  of 9. The third and fourth build the word low out of l, o and w
                  at a count of 7. Only then, at the fifth merge and still at a
                  count of 7, does the mark join anything, and what it joins is
                  the finished word.
                </p>
                <NumberTable
                  headings={["merge", "joined", "count", "tied with it"]}
                  rows={[
                    ["0", "e + s", "9", "s + t"],
                    ["1", "es + t", "9", "nothing"],
                    ["2", "l + o", "7", `o + w, ${MARK} + l`],
                    ["3", "lo + w", "7", `${MARK} + lo`],
                    ["4", `${MARK} + low`, "7", "nothing"],
                  ]}
                  caption="Three merges in a row score exactly 7, and at two of them a pair beginning with the mark was among the candidates and was not taken."
                />
                <p>
                  That is not the counting deciding. At merge 2 the pairs l
                  followed by o, o followed by w, and the mark followed by l all
                  occur exactly 7 times, so the objective is indifferent between
                  them and something outside the objective has to choose. The
                  rule in force is that the earlier-sorting pair wins, and the
                  mark is codepoint 9601 where l is 108, so any pair beginning
                  with the mark sorts after every pair beginning with a letter
                  and loses every tie it enters.
                </p>
                <p>
                  Across the whole run of fifteen merges a pair beginning with
                  the mark was among the tied candidates eleven times, and it was
                  taken three times, each of those being a step where it was the
                  only candidate left at that count. So the mark attaches to a
                  word only once nothing else can be built, which is why the
                  vocabulary ends up holding {MARK}low and {MARK}newest rather
                  than {MARK}l and {MARK}n. A mark that sorted before the letters
                  would produce the opposite, and section 21 runs that fit.
                </p>
                <KeepInMind>
                  A tie means the counting has no preference, so whatever breaks
                  it is arbitrary by definition. Here the arbitrary rule and the
                  mark&rsquo;s codepoint together decide that words assemble
                  before their spaces attach, and on these four words that
                  difference is nine of the 27 finished rows, which section 21
                  counts.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. A piece that begins with a space is not a word">
                <p>
                  Look at the finished table on the four words and something odd
                  is there. It holds low, and it also holds {MARK}low, and those
                  are two different rows with two different numbers. The same for
                  newest and {MARK}newest, widest and {MARK}widest. A reader who
                  opens such a vocabulary expecting a list of words finds it half
                  full of things that are a word with a space stuck to the front,
                  which is not a word in any ordinary sense.
                </p>
                <p>
                  It is the right answer, though. The two really are different
                  things and the model reading them should know which it has. The
                  low in low-cost has no space before it and the low in the low
                  readings does, and a scheme that gave them one row could not put
                  the space back afterwards. What looks like duplication is the
                  boundary information, stored in the only place it can be stored
                  once the space is a character.
                </p>
                <KeepInMind>
                  A vocabulary here is a list of pieces of text and not a list of
                  words, and some of those pieces begin with a space. On these
                  four words three of the fifteen learned rows are a row the
                  table already holds with a space added, and on the eighteen
                  sentences the same count is 17 out of 136.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The same, on eighteen sentences">
                <p>
                  On the larger corpus the mark stops waiting. The first merge
                  joins h to e at a count of 32, and the second joins the mark to
                  t at 25, so by the third merge the word the with a space in
                  front of it is a single row. That happens because the is so
                  common that the pair of a space and a t outnumbers almost
                  everything else, which is exactly the behaviour the four words
                  were too small to show.
                </p>
                <MarkedVocabulary />
                <p>
                  Two numbers there are worth carrying away. Of the 99 merges the
                  corpus supports, 42 extend a piece that already begins with the
                  mark, so nearly half the learned table is about where words
                  start. And 17 of the finished rows are a
                  row the table already holds with a space in front of it,
                  {MARK}cost beside cost and {MARK}re beside re among them, so 17
                  rows out of 136 go on keeping the distinction section 11
                  described.
                </p>
                <InAModel>
                  <p>
                    At the scale a language model works at the same pattern holds
                    and is much more visible, since almost every common word
                    appears in the table twice, once with a leading space and
                    once without. It is why a piece printed from such a
                    vocabulary so often looks like it has a stray space in front
                    of it, and why cutting a word off the front of a sentence can
                    change how the rest of it is read.
                  </p>
                </InAModel>
                <KeepInMind>
                  Nearly half the merges go on word beginnings and 17 rows go on
                  holding a word twice, and none of that is waste. It is what
                  storing the spaces inside the pieces costs, and section 17
                  prices the same thing in pieces of text rather than in rows.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Either learner can run on the marked stream">
                <p>
                  Everything so far has used the merging learner, which starts
                  from single symbols and joins. The framework will run the other
                  one just as happily, which starts from a large pool of
                  candidate pieces and drops whichever is least missed until the
                  table is the size asked for. Neither of them knows what a mark
                  is; both take units already spelled in symbols with counts.
                </p>
                <p>
                  Asked for 30 rows on the four words, the merging learner stops
                  at 27 when no pair occurs twice any more, and the shrinking one
                  lands on 30 exactly. They share 23 rows. The seven the
                  shrinking one holds alone are pieces of widest and newest such
                  as id, ide and ewe, and the four the merging one holds alone are
                  lo, low, newest and widest. And yet both spell the unseen word
                  lowest identically, as {MARK}low followed by est.
                </p>
                <WorkedExample title="The same two learners on the eighteen sentences">
                  <p>
                    The difference shows up when the table is larger. Asked for
                    136 rows, the merging fit reads its own corpus in 261 pieces
                    and the held-out sentence in 28. The shrinking fit reads the
                    corpus in 133 pieces, which is one piece per word occurrence,
                    and the same sentence in 37. It has spent its rows learning
                    the corpus by heart, which costs nothing on the corpus and a
                    third more pieces on anything else.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The treatment of the text and the choice of learner are
                  separate decisions. Every claim on this page is about the
                  first, and the numbers were taken with the merging learner
                  because that is the one the earlier pages in this section
                  built.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Out and Back Again",
          content: (
            <>
              <SubSection title="14. Decoding is a replacement">
                <p>
                  Gluing the pieces back is three operations with nothing to
                  decide. Concatenate the pieces, then replace every mark with a
                  space, then drop the one at the very front that was put there
                  when the text was marked. There is no rule about abbreviations,
                  no rule about quotation marks, and nothing that has to remember
                  where the spaces were, because the spaces are in the pieces.
                </p>
                <Equation>{`${MARK}the  ${MARK}low  ${MARK}cost   →   ${MARK}the${MARK}low${MARK}cost   →   the low cost`}</Equation>
                <p>
                  Compare that with what a scheme built on a rule-based front end
                  has to do. Its tokenizer deleted the whitespace and produced
                  words, so its detokenizer has to decide where a space goes back
                  in, and the decision is a language-specific rule again. A full
                  stop takes no space before it in English, a French quotation
                  mark does, and neither of those facts is in the pieces.
                </p>
                <KeepInMind>
                  Decoding is a string operation with no parameters and nothing
                  learned in it. That is the property being bought, and section
                  15 checks that it really holds on a sentence the corpus never
                  contained.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The sentence, out and back">
                <p>
                  Now the claim the page turns on, checked rather than asserted.
                  Both schemes were fitted on the same eighteen sentences until
                  each ran out of pairs occurring twice, giving 136 rows one way
                  and 137 the other. Both were handed the sentence they had never
                  seen, and both had their pieces glued back together.
                </p>
                <RoundTripPair />
                <p>
                  The front-marked fit returns the sentence exactly, character for
                  character, spaces included. The other returns something else,
                  and two things went wrong at once in it.
                </p>
                <Equation>
                  {"Dr. Alvare[UNK]didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  The letter z at the end of
                  Alvarez is a symbol it never learned, for the reason section 3
                  gave, so a stand-in row comes back in its place. And the
                  stand-in carries no boundary, so when the pieces are joined the
                  space after Alvarez is gone and the next word runs into it. One
                  missing symbol cost a letter and a word boundary.
                </p>
                <p>
                  The five words underneath the readings are where the two fits
                  part company in detail. The word analysis is one piece under
                  both, since the corpus contains it. Inside re-analysis. it is
                  three pieces under the front-marked fit and part of two under
                  the other, and the reason is section 11&rsquo;s point read
                  backwards. The row for analysis here is {MARK}analysis, and
                  there is no space before analysis inside re-analysis, so that
                  row cannot apply and the fit falls back to an, aly and sis.
                </p>
                <KeepInMind>
                  The round trip on this sentence is character-for-character
                  identical, all 51 of them, and it is identical because nothing
                  about the input was discarded when the marks went in. Section
                  17 shows the same fit at 45 rows, where it is a good deal
                  worse at reading the sentence and still returns it whole.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. What the exactness rests on">
                <p>
                  It rests on one thing, which is that the transformation into
                  marks is reversible. The moment anything is normalised on the
                  way in, the round trip recovers the normalised text and not the
                  text. The framework&rsquo;s own defaults already normalise
                  three things, and rather than call the round trip exact and
                  leave those unsaid, here they are.
                </p>
                <ExactUpToThis />
                <p>
                  There are three. A run of whitespace of any length and of any
                  kind becomes one mark, so two spaces come back as one and so
                  does a tab, which is the first row above and the third.
                  Whitespace at the two ends of the text is dropped entirely.
                  And a text containing the mark character itself is treated as
                  though it held a space there, which is why the last row went
                  in with one space, one mark and one space and came back with
                  three spaces.
                </p>
                <KeepInMind>
                  The honest statement is that the round trip is exact up to a
                  normalisation somebody chose, and that the normalisation is
                  small and written down. It costs nothing on the running
                  sentence, where the only whitespace is six single spaces
                  between words, and it would cost every level of indentation in
                  a page of code.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "On the four words the mark joins nothing until the fifth merge. Why not sooner?",
              [
                "Its pairs keep tying with pairs of letters, and the tie rule takes the earlier-sorting pair, where the mark at codepoint 9601 sorts after every letter",
                "Its pairs are genuinely rarer than the pairs of letters at that stage",
                "The loop is told to leave pairs containing the mark until the end",
                "A merge may not include the mark until the word it belongs to is complete",
              ],
              0,
              "At merge 2 the pair of l then o, the pair of o then w, and the pair of the mark then l all occur exactly 7 times, so the objective is indifferent and something outside it has to choose. A pair beginning with the mark was among the tied candidates eleven times and was taken three times, each of those being a step where it was the only candidate left at that count, which is why the table ends up holding the marked low and newest rather than the marked l and n.",
            ),
            trueFalse(
              "A finished table that holds low and also holds the marked low is duplication a better scheme would avoid.",
              false,
              "The two really are different things and the model reading them should know which it has. The low in low-cost has no space before it and the low in the low readings does, and a scheme that gave them one row could not put the space back afterwards. What looks like duplication is the boundary information, stored in the only place it can be stored once the space is a character.",
            ),
            choice(
              "Of the 99 merges the eighteen sentences support, how many extend a piece that already begins with the mark?",
              ["3", "17", "42", "99"],
              2,
              "Nearly half the learned table is therefore about where words start. A separate count is that 17 of the 136 finished rows are a row the table already holds with a space in front of it, cost beside cost and re beside re among them. On this larger corpus the mark also stops waiting, since the second merge of all joins it to t at a count of 25.",
            ),
            several(
              "Both schemes were fitted on the eighteen sentences, handed the sentence they had never seen, and had their pieces glued back together. Which of these happened?",
              [
                "The marked-behind fit never learned a symbol for a z at the end of a word, so a stand-in row came back in place of the z in Alvarez",
                "That stand-in carries no boundary, so the space after Alvarez was gone and the next word ran into it",
                "Inside re-analysis the front-marked fit fell back to an, aly and sis, because its row for analysis carries a leading space",
                "The front-marked fit returned the sentence exactly, all 51 characters of it",
              ],
              [0, 1, 2, 3],
              "One missing symbol cost the marked-behind fit a letter and a word boundary at once, and what came back reads Alvare, a stand-in, and didn’t run together. The front-marked fit is exact because nothing about the input was discarded when the marks went in, so gluing back is concatenate, replace every mark with a space, drop the one at the front. Its fallback inside re-analysis costs pieces and not characters, which is the price the next Part measures.",
            ),
            several(
              "The round trip is exact up to a normalisation the defaults chose. Which of these does that normalisation do?",
              [
                "A run of whitespace of any length and any kind becomes one mark, so two spaces come back as one and so does a tab",
                "Whitespace at the two ends of the text is dropped entirely",
                "A text containing the mark character itself is treated as though it held a space there",
                "A full stop ending an abbreviation is separated from the word in front of it",
              ],
              [0, 1, 2],
              "No rule looked at either full stop on the running sentence, which is why the question of whether an abbreviation keeps its stop never came up. The normalisation costs nothing there, where the only whitespace is six single spaces between words, and it would cost every level of indentation in a page of code.",
            ),
        ],
        },
        {
          title: "Part 5. What It Costs",
          content: (
            <>
              <SubSection title="17. Pieces, at the same size">
                <p>
                  The exactness and the language-independence are worth
                  something; the question is what they are worth in the currency
                  everything downstream actually pays in, which is the number of
                  pieces a text becomes. So both schemes were fitted on the same
                  corpus at fourteen sizes and asked for two numbers each, what
                  the whole corpus costs and what the held-out sentence costs.
                </p>
                <SizeAgainstPieces />
                <p>
                  On the corpus the front-marked fit is shorter at every size
                  from 52 rows up, 553 pieces against 648 at the bottom and 261
                  against 263 at the top. That is the fifteen alphabet rows
                  coming back as fifteen extra merges at every size where
                  neither fit has run out of pairs. On the held-out sentence
                  it is shorter at 52 rows and 60, and then the curves cross and
                  it is longer at every size above that, 34 pieces against 28 at
                  80 rows and 28 against 25 at the largest fit.
                </p>
                <NumberTable
                  headings={[
                    "rows",
                    "corpus, marked in front",
                    "corpus, marked behind",
                    "sentence, marked in front",
                    "sentence, marked behind",
                  ]}
                  rows={[
                    ["37", "781", "cannot be fitted", "52", "cannot be fitted"],
                    ["45", "626", "cannot be fitted", "45", "cannot be fitted"],
                    ["52", "553", "648", "43", "45"],
                    ["60", "496", "531", "38", "39"],
                    ["80", "397", "414", "34", "28"],
                    ["100", "333", "344", "34", "27"],
                    ["120", "293", "297", "31", "25"],
                    ["137", "261", "263", "28", "25"],
                  ]}
                  caption="Every row is two fits of the same corpus at the same requested size. Only the front-marked column ever gives the sentence back unchanged."
                />
                <KeepInMind>
                  Three pieces in 25 on this sentence, or about twelve per cent,
                  is what the exact round trip cost at the largest size, and six
                  pieces in 28 is what it cost at 80 rows. Those are the figures
                  to weigh the guarantee against, and they are only figures about
                  this corpus and this sentence.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Where it reads the sentence worse, and why">
                <p>
                  This is the place on the page where the method is beaten by the
                  thing it replaces, so it is worth understanding rather than
                  noting. The front-marked fit spends 42 of its 99 merges on
                  pieces that begin with a space. Those rows are useful only at
                  the start of a word. A word the corpus never contained is
                  usually met somewhere other than at its start, and there they
                  are no help at all.
                </p>
                <p>
                  The stem expect is the cleanest case. The corpus holds expected
                  and not expect, so neither fit has a row for the shorter word.
                  The marked-behind fit reads it as exp, ec and a marked t, three
                  pieces built from interior merges that apply anywhere. The
                  front-marked fit reads it as {MARK}e, x, p, e and ct, five
                  pieces, because its early merges all went into building
                  {MARK}expected and {MARK}e and there is nothing in the table
                  for the middle of a word beginning with ex.
                </p>
                <p>
                  So the trade is between where the rows are spent. Marking the
                  end lets a piece be reused anywhere inside a word and pays for
                  it with a doubled alphabet and unspellable endings. Marking the
                  front keeps the alphabet small and spends the merges on word
                  beginnings, which is excellent on text like the corpus and
                  poorer on text that is not.
                </p>
                <KeepInMind>
                  The front-marked fit is shorter on its own corpus and longer on
                  the held-out sentence, from 70 rows up. Those two come from
                  one cause, which is that 42 of its rows only apply where a word
                  starts, and the corpus is made of words it has seen start.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Text with no spaces at all">
                <p>
                  Now the case the whole method exists for. Take the five short
                  Chinese sentences from section 2 and fit both schemes on them,
                  each asked for 40 rows. Then read back a sentence those five
                  never contain, made of words they do, which is student,
                  research, life and origin run together.
                </p>
                <WithoutSpaces />
                <p>
                  The marked-behind scheme finds one word per line, so it has
                  five very long words to merge inside and almost no repetition
                  across them. It learns three merges, stops at 17 rows however
                  many it was asked for, reads the five lines in 18 pieces and
                  the new sentence in five. The front-marked scheme learns six
                  merges, reaches 18 rows, reads the lines in 15 pieces and the
                  sentence in three, and those three are student, then research
                  and life together, then origin.
                </p>
                <p>
                  The clearest sign of the mismatch is where the first
                  scheme&rsquo;s rows went. Three of its 17 are a character it
                  already holds, kept apart because that character once fell at
                  the end of a line. There are no word boundaries in this writing
                  for a boundary marker to record, so those three rows record the
                  ends of lines, and a piece carrying one puts a space into the
                  decoded text at a place no space belongs.
                </p>
                <KeepInMind>
                  The comparison here is not close and it was not arranged to be.
                  Nothing refused, nothing warned, and the scheme that needed to
                  be told where the words are came back with 17 rows, three of
                  them recording the ends of lines, and read an eight-character
                  sentence in five pieces where the other read it in three.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="20. Whether a piece may cross a space">
                <p>
                  Section 8 flagged this and here it is. Once the space is an
                  ordinary character, nothing in the method forbids a merge from
                  joining a pair with a space between its halves. The counting
                  rule says take the commonest adjacent pair and a pair straddling
                  a space is adjacent like any other. So the question of whether a
                  piece may cross a word boundary has to be answered from
                  outside, and the framework answers it by cutting at every mark,
                  which is a choice rather than a consequence.
                </p>
                <p>
                  What the other answer produces can be measured rather than
                  guessed. Run the same counting on the eighteen sentences with
                  nothing cut and the very first merge of all joins the letter e
                  to the space that follows it, at a count of 39.
                </p>
                <CrossingMerges />
                <>
<p>
                  Thirteen of the first forty merges produce a piece holding a space somewhere other than at its front. By rank 3 the piece is the whole of the word the with a space behind it, by rank 17 it is a space, the, and another space, and by rank 20 it is the ending of one word joined to the whole of the next.
                </p>
                <p>
                  The loop is answering exactly the question it was asked, which is which pair is commonest, and early on the commonest pairs are letters sitting either side of a gap. Forty merges in, thirteen of them have gone on pieces that straddle a boundary.
                </p>
</>
                <KeepInMind>
                  Both answers are defensible and they buy different things.
                  Cutting at the marks guarantees every row is a piece of one
                  word; not cutting lets a common phrase become one row, at the
                  price of spending the early merges on fragments that span two
                  words. Nothing in the counting prefers either, and a scheme
                  that wants both has to state where it switches over.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The mark is a choice, and the choice changes the table">
                <p>
                  Section 10 showed a tie decided by the mark&rsquo;s codepoint,
                  and a codepoint is an accident of which character was picked.
                  So the mark is not neutral, and the way to find out how much it
                  matters is to change it. Here are the same four words fitted
                  twice, once under the usual mark at 9601, which sorts after
                  every letter, and once under an underscore at 95, which sorts
                  before the lowercase letters.
                </p>
                <WhichMark />
                <>
<p>
                  Both tables hold 27 rows and 18 of them agree once the mark is written the same way, so nine rows on each side exist under one mark and not the other. The merges tell the story. Under the late-sorting mark the third, fourth and fifth merges are l with o, lo with w, and then the mark with the finished low.
                </p>
                <p>
                  Under the early-sorting one they are the mark with l, that with o, and that with w, so the word is built outward from the space one letter at a time and the table fills with the mark followed by l, then by lo, then by low, rather than with lo and low.
                </p>
</>
                <p>
                  What did not change is the unseen word, which both fits cut as
                  the marked low followed by est. So the effect is real and it is
                  not catastrophic, and the honest summary is that nine rows of
                  the 27 depend on which character was picked to stand for a
                  space, for a reason that is arithmetic about codepoints and has
                  nothing to do with language.
                </p>
                <KeepInMind>
                  The mark has to be a character no text contains, and there the
                  requirements stop. Every character meeting that requirement
                  gives a different vocabulary, nine rows of 27 different on this
                  small corpus, and nothing in the method says which of them to
                  use.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Language-independent is a claim about the procedure">
                <p>
                  The strongest thing the method can say is that no step in it
                  refers to a language. That is true and it is checkable, and it
                  is much weaker than saying the result is language-independent.
                  A vocabulary is learned from a corpus and carries that
                  corpus&rsquo;s habits permanently, and the corpus is written in
                  some language.
                </p>
                <p>
                  Handed the Chinese sentence of section 19, the fit learned from
                  our eighteen English sentences answers a mark followed by eight
                  stand-in rows, and glued back it is eight stand-ins and nothing
                  else. Every one of the eight characters was unspellable,
                  because the alphabet is whatever the corpus happened to use,
                  and the procedure that produced that vocabulary consulted
                  nothing about English at any point.
                </p>
                <p>
                  The fix, where one is wanted, is not in this method. Starting
                  from the 256 byte values rather than from the characters a
                  corpus used closes the hole, at the cost of longer sequences,
                  and it composes with everything on this page rather than
                  replacing any of it. The marking removed the rule about where
                  English words end; it left the corpus in place, and the corpus
                  is where the alphabet of 36 symbols came from.
                </p>
                <KeepInMind>
                  One procedure for every language does not give one vocabulary
                  for every language. It gives the same fair procedure for
                  building a vocabulary per corpus, and our English fit answers
                  eight stand-in rows for an eight-character Chinese sentence.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs and questions on
                  which the method stops being defined rather than becoming
                  approximate, with what has to be decided in each case and what
                  turns on the decision. Several are genuinely open with
                  defensible answers on either side, and those are the ones worth
                  a reader&rsquo;s attention, since they are the decisions anybody
                  setting this up has to make and nothing in the mathematics makes
                  them.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "which character stands for a space",
                      reason:
                        "undetermined beyond one requirement, that no text contain it. Every admissible character gives a different vocabulary, because the tie rule compares symbols and a symbol has a codepoint. On the four words the mark used here and an underscore each give 27 rows, 18 of which agree, and the nine that differ separate building a word and then attaching its space from growing the word outward from the space.",
                    },
                    {
                      expression: "two pairs with the same count",
                      reason:
                        "the objective is indifferent, so no answer is more correct and a choice has to be imported. Taking the earlier-sorting pair at least makes the fit repeatable where taking whichever was met first makes it depend on the order the texts arrived in. Three consecutive merges on the four words all score 7 and at two of them a pair beginning with the mark was passed over.",
                    },
                    {
                      expression: "whether a piece may cross a space",
                      reason:
                        "a convention rather than a consequence, and the one place the framework adds a rule after having removed one. Left unconstrained the first merge on the eighteen sentences joins a letter to the space after it and 13 of the first 40 pieces span a boundary. Cutting at the marks forbids that and forbids a common phrase becoming one row along with it.",
                    },
                    {
                      expression: "what a run of whitespace meant",
                      reason:
                        "decided, and decided by discarding it. Every run becomes one mark, so two spaces come back as one and so does a tab, and the round trip is exact only up to that. On the running sentence nothing is lost, since its only whitespace is six single spaces; for anything where whitespace carries meaning, indented code most obviously, the text cannot be recovered and the method offers no way to keep it.",
                    },
                    {
                      expression: "a text containing the mark itself",
                      reason:
                        "not distinguishable from a text containing a space there, since the two become the same symbol before anything else happens. Any character chosen makes some text unreproducible; picking one that no ordinary writing uses makes the set of such texts small rather than empty.",
                    },
                    {
                      expression: "whitespace at the very ends of a text",
                      reason:
                        "dropped, which is a decision and not an oversight. Keeping it would need a mark for a trailing space with nothing after it, and that mark would then be a row of the vocabulary earning almost no counts. Cheap to keep and cheap to lose, and the framework loses it.",
                    },
                    {
                      expression: "a character the corpus never used",
                      reason:
                        "unspellable, exactly as for any scheme whose alphabet is what a corpus contained. Marking the space changes nothing about this, which is worth saying because it is easy to read the exact round trip as a guarantee. Our English fit answers eight stand-in rows for an eight-character Chinese sentence. The repair is a byte alphabet and it is a different decision from any on this page.",
                    },
                    {
                      expression: "where a word actually ends",
                      reason:
                        "never asked, and that is the point rather than a gap. The method learns where pieces recur and has no opinion about morphology or about words. Two rows differing only by a leading space are two pieces rather than one word counted twice, and 17 of the 136 rows learned here are a row the table already holds with a space in front of it.",
                    },
                    {
                      expression: "a language written without spaces",
                      reason:
                        "defined and well behaved, since one mark goes at the front of each line and everything after is unchanged. This is the case the method was built for, and the comparison is not close. On five short Chinese sentences it learns six merges and reads a held-out sentence in three pieces, where a scheme splitting on whitespace learns three merges and reads it in five.",
                    },
                    {
                      expression: "a text with no whitespace and no repetition",
                      reason:
                        "one unit, and a vocabulary that is the alphabet plus whatever pairs happened to repeat inside it. Nothing refuses and nothing warns. The count of merges actually learned against the count asked for is the only signal, and it is worth reading, because a fit that stopped early stopped because its corpus ran out of evidence.",
                    },
                  ]}
                />
                <KeepInMind>
                  Four of these are decisions rather than limits, namely which
                  character marks a space, how a tie is broken, whether a piece
                  may cross one, and what a run of whitespace collapses to. Each
                  has defensible answers on both sides and each changes what the
                  finished vocabulary holds, so each belongs in whatever
                  describes a tokenizer rather than being left to whoever
                  implements it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "The stem expect is the cleanest case of the front-marked fit losing. How do the two fits read it?",
              [
                "The marked-behind fit reads it in three pieces built from interior merges, where the front-marked fit reads it in five",
                "The front-marked fit reads it in three and the marked-behind fit in five",
                "Both read it as one piece, since the corpus holds expected",
                "Neither can spell it at all, since the corpus holds expected and not expect",
              ],
              0,
              "Interior merges apply anywhere inside a word, where the front-marked fit’s early merges went into building the marked expected and there is nothing in its table for the middle of a word beginning with ex. 42 of its 99 rows only apply where a word starts, and a word the corpus never contained is usually met somewhere other than at its start.",
            ),
            several(
              "Both schemes were fitted at fourteen sizes on the same corpus. Which of these did that comparison report?",
              [
                "On the corpus the front-marked fit is shorter at every size from 52 rows up, 553 pieces against 648 at the bottom",
                "On the held-out sentence it is shorter at 52 rows and at 60, and longer at every size above that",
                "At the largest fit it reads the held-out sentence in three pieces fewer",
                "Below 52 rows neither scheme can be fitted at all",
              ],
              [0, 1],
              "Those two outcomes come from one cause, which is that 42 of its rows only apply where a word starts and the corpus is made of words it has seen start. At the largest fit the sentence costs 28 pieces against 25, three more and not three fewer, about twelve per cent, and that is what the exact round trip has to be weighed against. Below 52 rows only the marked-behind scheme is impossible. The front-marked one runs from 37 rows, where the corpus costs 781 pieces.",
            ),
            choice(
              "The five short Chinese sentences, both schemes asked for 40 rows. What did the marked-behind scheme do?",
              [
                "It learned three merges and stopped at 17 rows, three of which are a character it already holds, kept apart because that character once fell at the end of a line",
                "It refused, since there are no word boundaries in that writing for a marker to record",
                "It learned six merges, reached 18 rows and read the new sentence in three pieces",
                "It reached all 40 rows and read the five lines in 15 pieces",
              ],
              0,
              "Finding one word per line leaves it five very long words to merge inside and almost no repetition across them, so it reads the five lines in 18 pieces and the new sentence in five where the front-marked scheme reads it in three. A piece carrying one of those three line-end rows puts a space into the decoded text at a place no space belongs, and nothing refused and nothing warned.",
            ),
            trueFalse(
              "Run with nothing cut, the very first merge on the eighteen sentences joins the letter e to the space that follows it, at a count of 39.",
              true,
              "The counting rule says take the commonest adjacent pair, and a pair straddling a space is adjacent like any other, so early on the commonest pairs are letters sitting either side of a gap. Thirteen of the first forty merges produce a piece holding a space somewhere other than at its front, and by rank 3 the piece is the whole of the word the with a space behind it.",
            ),
            several(
              "The closing part separates decisions from limits. Which of these does it name as decisions?",
              [
                "Which character marks a space",
                "How a tie between equally common pairs is broken",
                "Whether a piece may cross a space",
                "What a run of whitespace collapses to",
              ],
              [0, 1, 2, 3],
              "All four have defensible answers on both sides and each changes what the finished vocabulary holds. The mark’s identity alone is worth nine of the 27 rows on the four words, for a reason that is arithmetic about codepoints and has nothing to do with language. What the page does not count as a decision is the alphabet, which is whatever the corpus happened to use. That is why the English fit answers a mark and eight stand-in rows for an eight-character Chinese sentence, and why the repair is to start from the 256 byte values and not any setting here.",
            ),
        ],
        },
        {
          title: "Practice. Marking, Merging and Coming Back With the Library",
          practice: [
            exercise(
              "Fit the four words under two marks",
              ["Part 3 ran fifteen merges on the four words and watched the mark join last, and Part 6 fitted the same words again with an underscore for the mark and found 18 of the 27 rows in common. Fit both with the merging learner, asking for 30 rows. For each, print how many rows the table holds and how many of them begin with the mark, the merges in the order they were learned, and the cut of lowest. Then print how many rows the two tables share.", "The usual mark is the character numbered 9601, which many consoles cannot print, so the script writes every mark as an underscore before printing, which is also what lets the two tables be compared row for row. The count of rows beginning with the mark is not in the lesson for either fit."],
              `from oop_ml import SentencePiece, SubwordAlgorithm

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]

tables = {}
for mark in ["\\u2581", "_"]:
    # Fit a SentencePiece with the merging learner, 30 rows and this mark.
    # Write its rows and its merges with the mark replaced by an underscore.
    # Print the mark's codepoint, the number of rows, how many begin with
    # the mark, the merges as left+right, and the pieces of lowest.
    # Keep the set of rows in tables[mark].
    ...

# Print how many rows the two tables have in common.`,
              `from oop_ml import SentencePiece, SubwordAlgorithm

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]

tables = {}
for mark in ["\\u2581", "_"]:
    model = SentencePiece(
        vocabulary_size=30, algorithm=SubwordAlgorithm.BYTE_PAIR, whitespace_marker=mark
    ).fit(corpus)
    rows = [row.replace(mark, "_") for row in model.vocabulary]
    merges = " ".join(f"{merge.left}+{merge.right}" for merge in model.merges)
    cut = " ".join(model.encode("lowest").texts)
    marked = sum(1 for row in rows if row.startswith("_"))
    print(f"codepoint {ord(mark)}: {len(rows)} rows, {marked} begin with the mark")
    print("  merges:", merges.replace(mark, "_"))
    print("  lowest:", cut.replace(mark, "_"))
    tables[mark] = set(rows)

shared = tables["\\u2581"] & tables["_"]
print(f"{len(shared)} rows in common")`,
              `codepoint 9601: 27 rows, 5 begin with the mark
  merges: e+s es+t l+o lo+w _+low e+w ew+est n+ewest _+newest d+est i+dest w+idest _+widest e+r _low+er
  lowest: _low est
codepoint 95: 27 rows, 14 begin with the mark
  merges: e+s es+t _+l _l+o _lo+w _+n _n+e _ne+w _new+est _+w _w+i _wi+d _wid+est _low+e _lowe+r
  lowest: _low est
18 rows in common`,
              { hints: ["The learner is chosen at construction with algorithm=SubwordAlgorithm.BYTE_PAIR, and the mark with whitespace_marker. Asking for 30 rows is not refused when the corpus runs out of pairs at 27.", "merges is iterable in the order the merges were learned, and each merge has a left and a right. The vocabulary is iterable too, one row at a time.", "Two sets of rows are compared with the & operator, and that only means something once both are written with the same mark."], check: numberCheck("How many of the 27 rows begin with the mark when the mark is an underscore?", 14, 0, "An underscore is codepoint 95 and sorts before every lowercase letter, so a pair beginning with it wins each tie it enters and every word is grown outward from its space, the mark with l, then with lo, then with low. That leaves the mark itself and thirteen pieces that start a word. Under the usual mark at 9601 the same ties go the other way and only five rows begin with it, the mark, low, newest, widest and lower. Both cut lowest identically, so nine rows of 27 turned on a codepoint without changing this answer.") },
            ),
            exercise(
              "Find where the two schemes cross on the sentence",
              ["Part 5 fitted both ways of recording a boundary on the eighteen sentences at fourteen sizes. Its table has the front-marked fit ahead on the held-out sentence at 60 rows, 38 pieces against 39, and behind at 80, and says the curves cross in between. Fit both at 60, 70 and 137 rows, the front-marked one with the merging learner and the other with its byte rows switched off, and at each size print what the corpus costs, what the sentence costs, and whether the sentence comes back exactly.", "The rows at 60 and 137 are in the lesson’s table. The row at 70 is not."],
              `from oop_ml import BytePairEncoding, SentencePiece, SubwordAlgorithm

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

for size in [60, 70, 137]:
    fits = [
        ("in front", SentencePiece(vocabulary_size=size, algorithm=SubwordAlgorithm.BYTE_PAIR)),
        ("behind", BytePairEncoding(vocabulary_size=size, byte_fallback=False)),
    ]
    # Fit each on the sentences. Print the size, the label, the rows the fit
    # reached, the pieces the eighteen sentences cost, the pieces the
    # sentence costs, and whether decoding its ids gives the sentence back.`,
              `from oop_ml import BytePairEncoding, SentencePiece, SubwordAlgorithm

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

for size in [60, 70, 137]:
    fits = [
        ("in front", SentencePiece(vocabulary_size=size, algorithm=SubwordAlgorithm.BYTE_PAIR)),
        ("behind", BytePairEncoding(vocabulary_size=size, byte_fallback=False)),
    ]
    for label, model in fits:
        model.fit(sentences)
        encoding = model.encode(sentence)
        corpus_pieces = sum(model.encode(text).n_tokens for text in sentences)
        exact = model.decode(encoding.ids) == sentence
        print(f"{size} {label}: {model.vocabulary.n_tokens} rows, corpus {corpus_pieces}, "
              f"sentence {encoding.n_tokens}, exact {exact}")`,
              `60 in front: 60 rows, corpus 496, sentence 38, exact True
60 behind: 60 rows, corpus 531, sentence 39, exact False
70 in front: 70 rows, corpus 444, sentence 36, exact True
70 behind: 70 rows, corpus 460, sentence 32, exact False
137 in front: 136 rows, corpus 261, sentence 28, exact True
137 behind: 137 rows, corpus 263, sentence 25, exact False`,
              { hints: ["fit learns in place and also answers the fitted model, so calling it inside the loop is enough.", "A corpus costs the sum of what each of its texts encodes to. encode answers an object with an n_tokens and the ids that decode takes back.", "The front-marked fit stops at 136 rows when asked for 137, since no pair is left that occurs twice, and vocabulary.n_tokens says so."], check: numberCheck("How many pieces does the front-marked fit read the held-out sentence in at 70 rows?", 36, 0, "At 60 rows the front-marked fit is still one piece ahead on the sentence, 38 against 39, and at 70 it is four behind, 36 against 32, so the crossing falls between those two sizes. On the corpus it stays ahead, 444 pieces against 460. Both come from the same place. The fifteen alphabet rows it saved are spent as extra merges, and many of its merges build pieces that begin with a space, which pay on words the corpus has seen start and not on a sentence made of words it never held. Only the front-marked fit gives the sentence back at any size.") },
            ),
            exercise(
              "Measure what the round trip does not keep",
              ["Part 4 said the round trip is exact up to a normalisation, and listed what the defaults discard. A run of whitespace of any length and kind comes back as one space, and whitespace at the two ends is dropped. Fit the four words with the merging learner and send five texts out and back, printing each text, its length, how many pieces it became, what came back and its length.", "The last text is three words laid out over three indented lines. The lesson says this normalisation would cost every level of indentation in a page of code without measuring a case, so count the characters that go in and the characters that come back."],
              `from oop_ml import SentencePiece, SubwordAlgorithm

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]
texts = [
    "low lower",
    "low  lower",
    " low lower ",
    "low\\tlower",
    "low\\n    lower\\n        lowest",
]

model = SentencePiece(vocabulary_size=30, algorithm=SubwordAlgorithm.BYTE_PAIR).fit(corpus)
# For each text, encode it, decode the ids, and print the text with repr so
# the whitespace shows, its length, the number of pieces, what came back,
# its length, and whether it equals the text.`,
              `from oop_ml import SentencePiece, SubwordAlgorithm

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]
texts = [
    "low lower",
    "low  lower",
    " low lower ",
    "low\\tlower",
    "low\\n    lower\\n        lowest",
]

model = SentencePiece(vocabulary_size=30, algorithm=SubwordAlgorithm.BYTE_PAIR).fit(corpus)
for text in texts:
    encoding = model.encode(text)
    back = model.decode(encoding.ids)
    print(f"{text!r} ({len(text)}) -> {encoding.n_tokens} pieces -> {back!r} ({len(back)}), "
          f"exact {back == text}")`,
              `'low lower' (9) -> 2 pieces -> 'low lower' (9), exact True
'low  lower' (10) -> 2 pieces -> 'low lower' (9), exact False
' low lower ' (11) -> 2 pieces -> 'low lower' (9), exact False
'low\\tlower' (9) -> 2 pieces -> 'low lower' (9), exact False
'low\\n    lower\\n        lowest' (28) -> 4 pieces -> 'low lower lowest' (16), exact False`,
              { hints: ["encode answers an object with the ids and an n_tokens, and decode takes the ids and answers a string.", "Writing {text!r} in an f-string prints the text the way Python would write it in source, so a tab shows as a backslash and a t and a line break as a backslash and an n."], check: numberCheck("How many characters come back from the indented text of 28?", 16, 0, "Each line break together with the indentation after it is one run of whitespace, five characters the first time and nine the second, and each run becomes one mark and comes back as one space. So 14 characters of whitespace come back as 2 and the 28 characters come back as 16, with every word intact and the layout gone. Nothing was refused and nothing warned, and the pieces are the same four whether the words were indented or not, which is why the text cannot be recovered from them.") },
            ),
          ],
        },
      ]}
    />
  );
}
