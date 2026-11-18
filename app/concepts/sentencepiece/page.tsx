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

export const metadata: Metadata = pageMetadata("/concepts/sentencepiece", {
  title: "SentencePiece · Perceptron Lab",
  description:
    "SentencePiece learns text pieces without requiring a separate word-splitting step first. Its explicit representation of whitespace affects how pieces join and how encoded text can be reconstructed.",
});

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";
const MARK = "▁";

export default function SentencePiecePage() {
  return (
    <ConceptPage
      lessonId="sentencepiece"
      intuition={lessonIntuitions["sentencepiece"]}
      technicalStart="Part 2. The Space as a Symbol"
      openingTitle="Learn the Pieces Before Deciding Where the Words Are"
      playgroundTitle="Make spaces part of the text the tokenizer learns"
      playgroundIntro="Follow the space markers through encoding and decoding. Compare the reconstructed text with the input and check which normalization rules were applied."
      title="SentencePiece"
      tagline={"SentencePiece learns text pieces without requiring a separate word-splitting step first. Its explicit representation of whitespace affects how pieces join and how encoded text can be reconstructed."}
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
                  We will reuse the eighteen-sentence corpus and the held-out sentence from the earlier lessons. The corpus contains 72 distinct words across 133 occurrences. Keeping the text fixed lets us examine what changes when spacing is represented differently before the merging loop begins.
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
                  A pre-tokenizer is a preliminary rule that splits text before the learned vocabulary works on it. Such a rule might separate punctuation or contractions as well as spaces. Each choice restricts which later pieces can span those boundaries.
                </p>
                <p>
                  SentencePiece lets us train from a text stream without first supplying linguistic word segmentation. The implementation still has input normalization and configuration choices, so we will inspect what its space marker preserves and what it changes.
                </p>
                </>
                <KeepInMind>
                  {"We can learn subword pieces without first labeling linguistic words. A preliminary whitespace policy may still divide the input into chunks. Keep that formatting choice separate from discovering word boundaries."}
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
                  {"The five Chinese examples use recurring combinations corresponding to research, life, origin, student, very, many and good. A whitespace splitter gives one chunk per unspaced line. A subword learner can still count repetition inside those chunks. Part 5 compares two symbol conventions on these same inputs."}
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
                  {"The earlier end-marked representation attaches boundary information to each word’s last character. That creates distinct internal and final forms for some letters. A separate boundary symbol is another choice; the initial whitespace split alone does not require attaching it to a letter."}
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
                  {"These extra forms and missing endings follow from the corpus-derived end-marker convention. They are not unavoidable consequences of splitting on whitespace. A different alphabet or boundary representation can change both."}
                </KeepInMind>
              </SubSection>

              <SubSection title="4. SentencePiece, stated">
                <p>
                  {"Represent the preceding whitespace with a reserved marker, then let that marker participate in vocabulary learning. The teaching implementation prefixes a marker to each whitespace-delimited unit. Decoding joins its pieces and replaces markers with spaces, removing the dummy initial space. The normalization details determine which original spacing survives."}
                </p>
                <p>
                  {"The same marker procedure can run on English and Chinese without a language-specific word segmenter. Its usefulness still depends on the data and configuration. It preserves the normalized spacing representation, not necessarily the original characters and whitespace."}
                </p>
                <p>
                  SentencePiece supports learners such as BPE and unigram; it is not a competing merge score. In this lesson we focus on how it prepares text, especially how it represents spaces, before the learner runs. Section 13 compares both learners on the same four words. The implementation details here describe the site&apos;s teaching version, rather than every option in the external library.
                </p>
                <KeepInMind>
                  {"The key change is making a space marker available as a learnable symbol. That changes the alphabet, eligible pieces and decoding rule. The later measurements show the effects for this corpus."}
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
                  {"The usual marker is ▁, Unicode’s lower one eighth block at code point 9601. It makes a space visible in a piece listing. It is also a real character that can appear in input, so a tokenizer must specify how literal occurrences are distinguished or normalized. Section 21 changes the marker to inspect this implementation’s tie-breaking."}
                </p>
                <p>
                  Here the marker goes before a word to represent a preceding space. We also insert a dummy initial marker so the first word follows the same convention; the original text need not actually begin with a space. Because the marker is its own symbol, an ordinary letter does not need a separate identity merely because it ends a word.
                </p>
                <Equation>{`hello  world   →   ${MARK}hello${MARK}world`}</Equation>
                <KeepInMind>
                  {"In the teaching version, whitespace-delimited chunks receive a leading marker. Runs of whitespace collapse and leading or trailing whitespace is discarded. This transformation is simple, but it already makes choices about the text that decoding cannot undo."}
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
                  {"A separate leading marker adds one symbol to this alphabet. The attached-final-marker convention instead introduces distinct final forms for characters observed at word ends. These are counts for the selected representations, not a requirement that every tokenizer use either alphabet."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Make the spaces visible in the Alvarez sentence" id="7-the-running-sentence-marked">
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
                  {"Neither example applied an abbreviation or contraction rule before learning. The periods, apostrophe and hyphen remain ordinary symbols within their whitespace chunks. The learned pieces may later split at those characters, but that is a different operation from a linguistic word-boundary decision."}
                </p>
                <KeepInMind>
                  {"No parameters are learned during this transformation. On the five unspaced Chinese lines it adds one marker per line. The later subword learner still needs corpus evidence to choose useful entries."}
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Cutting at the marks, and why that is a separate decision">
                <p>
                  {"The site’s teaching implementation learns within marker-prefixed whitespace units, so a learned piece cannot cross between them. That is a restriction in addition to representing spaces as symbols. Other configurations can permit cross-whitespace pieces."}
                </p>
                <>
<p>
                  That second step is a separate design choice. Together, these steps resemble splitting on whitespace and placing a marker at the start of each resulting piece. Later we will disable the restriction and measure how it changes the learned vocabulary, so we can distinguish the effect of marking spaces from the effect of restricting merges.
                </p>
                <p>
                  {"The marker remains inside each unit. It can be counted, merged and stored, then converted back to a space. This gives a different symbol representation from discarding spaces, even though both preparations can initially use the same whitespace boundaries."}
                </p>
</>
                <WhyThisWorks title="Why cutting at the marks is not the same as cutting on spaces">
                  <p>
                  {"A deleted separator needs some other convention or retained information to reconstruct it. Here the marker carries that information in the piece sequence. This uses one separate alphabet symbol instead of boundary-specific letter forms. On unspaced lines, the marker only records the start; it does not discover linguistic words."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"Space marking and restricting cross-space pieces are separate choices. The teaching defaults use both. Reversibility additionally depends on normalization, literal-marker handling and character coverage, which Part 4 checks."}
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
              "A leading marker records that a word starts after a boundary. This implementation also inserts a dummy boundary before the first word, even when the input has no leading space. One separate marker symbol is sufficient. The end-marked scheme instead distinguishes each ordinary character from its word-final form, so the extra inventory depends on which characters end words in the corpus.",
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
              "Representing spaces with a separate marker and restricting where pieces may cross are different operations. The marker can retain boundaries in the normalized text; splitting at it imposes a later boundary policy on vocabulary learning. On this corpus, the separate marker adds one alphabet symbol, while word-final variants add sixteen. Exact recovery still depends on coverage and on what the earlier normalization retained.",
            ),
            trueFalse(
              "SentencePiece is a third way of choosing pieces, alongside merging and shrinking.",
              false,
              "SentencePiece provides a way to prepare text and train a subword model. The learner can use BPE or the unigram algorithm; those remain different vocabulary-learning procedures. Here the comparison changes the spacing representation while using either learner, so a front marker should not be mistaken for a third pair-selection objective.",
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
                  {"Apply the weighted pair-merging loop to these marked units. After fifteen merges, each of the four word types is a single marked piece and the corpus has sixteen pieces. The control lets us inspect how the leading marker participates in that particular merge order."}
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
                  {"At the third merge, l with o, o with w and the marker with l all score seven. The SDK breaks the tie lexically. The marker’s code point 9601 sorts after l at 108, so the pair starting with l wins. That ordering concerns these characters, rather than every letter in Unicode."}
                </p>
                <p>
                  {"In this fifteen-merge run, a marker-starting pair appears among top candidates eleven times and is selected three times, each without a tied alternative. The alphabetic tie rule helps explain why words assemble internally before the marker attaches in this example. The larger corpus need not follow that order."}
                </p>
                <KeepInMind>
                  {"Equal immediate counts leave the tie rule to choose a pair. Here the chosen marker and lexical order affect intermediate vocabulary entries. Section 21 measures nine differing rows out of 27 after changing the marker on the same four-word corpus."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. A piece that begins with a space is not a word">
                <p>
                  {"The table contains both low and ▁low, as well as analogous forms for newest and widest. They represent different text substrings: one has a leading space marker and one does not. A piece vocabulary is therefore not a list of linguistic words."}
                </p>
                <p>
                  {"The low substring inside low-cost and the ▁low substring after a space contain different boundary information. Separate entries make those contexts available in the piece sequence. This is one way to retain spacing; a separate marker piece can also carry the boundary instead of joining the word."}
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
                  everything else, which is exactly the behavior the four words
                  were too small to show.
                </p>
                <MarkedVocabulary />
                <p>
                  {"Of the 99 learned merges, 42 extend a marker-prefixed piece. Seventeen vocabulary entries have counterparts consisting of the same text without the leading marker, including cost and re. Those counts describe recurring space-prefixed fragments, not evidence that every such merge identifies a complete word."}
                </p>
                <InAModel>
                  <p>
                  {"The dummy prefix gives the beginning of text the same marker form as a word after normalized whitespace. An unmarked internal substring is different: low inside low-cost lacks that leading marker. The vocabulary may retain both marked and unmarked entries when the learned combinations support them."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"The marker-prefixed entries encode boundary context as well as letters. They can be useful, but they also use vocabulary rows. Assess whether that allocation improves coverage, sequence length or a downstream task rather than declaring all duplication either wasteful or necessary."}
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
                  {"At 136 requested rows, BPE uses 261 pieces for the training corpus and 28 for the probe. The unigram version uses one piece per training word occurrence, or 133 pieces, but 37 for the probe. That is a comparison of these two inputs, not a guarantee of a one-third penalty on every unfamiliar text."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  {"Text preparation and the learning algorithm are separate settings. Most measurements here use BPE; this section also compares the unigram learner. Keep the reported algorithm and normalization policy with the resulting vocabulary."}
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
                  {"A pre-tokenizer can instead retain source offsets, separator strings or explicit boundary markers. Its detokenizer may use that information, or may apply a language-specific spacing convention. SentencePiece’s marker representation avoids needing to infer the normalized spaces from punctuation alone, but other tokenizers are not inherently unable to preserve them."}
                </p>
                <KeepInMind>
                  {"With this marker convention, decoding joins pieces, replaces markers and removes the dummy prefix. It uses configured marker behavior without learning a separate punctuation-spacing model. Successful recovery still depends on symbol coverage and normalization."}
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
                  {"This particular 51-character sentence reconstructs exactly because its characters are covered and its six single spaces match the normalization policy. The same fit at 45 rows retains the sentence too, despite using more pieces. Those checks do not establish preservation of arbitrary original whitespace."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. What the exactness rests on">
                <p>
                  {"The round trip recovers the representation retained by normalization and the vocabulary. The teaching version collapses whitespace runs and discards edge whitespace. The external SentencePiece library also supports configurable character normalization, with an NFKC-based default; it should not be described as only these small whitespace rules."}
                </p>
                <p className="text-sm"><a className="underline underline-offset-4" href="https://github.com/google/sentencepiece/blob/master/doc/normalization.md">SentencePiece normalization and whitespace options</a></p>
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
                  {"For the probe sentence, normalization leaves the original text unchanged. For indented code, collapsing whitespace would remove information. The external library exposes normalization and whitespace options; this simplified teaching interface does not implement all of them."}
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
              "The end-marked vocabulary lacks the final-z symbol needed by Alvarez. Decoding loses that letter and its following boundary. The front-marked fit represents this sentence completely and reconstructs it exactly. Its longer fallback inside re-analysis costs more pieces while retaining the characters. This particular sentence has ordinary single spaces, so whitespace normalization does not change it; the later layout probes show where exact recovery stops.",
            ),
            several(
              "The round trip is exact up to a normalization the defaults chose. Which of these does that normalization do?",
              [
                "A run of whitespace of any length and any kind becomes one mark, so two spaces come back as one and so does a tab",
                "Whitespace at the two ends of the text is dropped entirely",
                "A text containing the mark character itself is treated as though it held a space there",
                "A full stop ending an abbreviation is separated from the word in front of it",
              ],
              [0, 1, 2],
              "No rule looked at either full stop on the sentence about Dr. Alvarez, which is why the question of whether an abbreviation keeps its stop never came up. The normalization costs nothing there, where the only whitespace is six single spaces between words, and it would cost every level of indentation in a page of code.",
            ),
        ],
        },
        {
          title: "Part 5. What It Costs",
          content: (
            <>
              <SubSection title="17. Pieces, at the same size">
                <p>
                  {"At matched requested sizes, compare encoded length on training text and the probe separately. The marker representation also changes required alphabet size and coverage, so equal row budgets do not isolate a single causal factor. Sequence length is useful evidence, rather than the only cost downstream."}
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
                  {"At the largest fits, the front-marked probe uses three more pieces than the lossy no-fallback end-marked encoding’s 25. At 80 rows the difference is six against 28. The intact round trip matters, but other alphabet or fallback choices could change this comparison; space marking is not the only route to retaining the text."}
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Where it reads the sentence worse, and why">
                <p>
                  In this run, 42 of the 99 merges create pieces beginning with the space marker. Those entries apply at word starts and cannot be reused as ordinary internal pieces. That helps explain the comparison with the earlier representation. A marker can preserve useful boundary information while also limiting where a learned piece matches.
                </p>
                <p>
                  {"For expect, the end-marked encoding uses exp, ec and marked t. The front-marked version uses ▁e, x, p, e and ct. Its learned word-start entries help other spellings but leave this probe stem longer. Inspecting the entries explains the difference without implying every domain shift has the same effect."}
                </p>
                <p>
                  {"The conventions make different pieces available and allocate their budgets differently. This front-marked fit is shorter on its training corpus and longer on the held-out sentence at the larger listed sizes. Neither outcome proves a universal property of familiar or unfamiliar text."}
                </p>
                <KeepInMind>
                  {"From 70 rows upward, the displayed corpus and probe lengths favor different fits. Many marker-prefixed entries apply only at word starts, but other differences include alphabet size and merge history. These measurements do not isolate one exclusive cause."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Text with no spaces at all">
                <p>
                  {"For an unspaced example, fit both representations to five short Chinese lines at a requested size of 40. The probe combines characters and familiar word sequences into a line absent from training. This tests how the representations reuse pieces without supplied word segmentation."}
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
                  {"Three of the end-marked vocabulary’s seventeen rows are character-final forms. In these inputs they record line ends, because the training splitter found no spaces within a line. That uses rows on a boundary convention different from Chinese linguistic word boundaries; decoding behavior must be checked against the original text."}
                </p>
                <KeepInMind>
                  {"Both fits return usable encodings on this finite example. The end-marked fit uses five pieces on the eight-character probe; the front-marked fit uses three. The difference follows the particular corpus and representation, rather than showing that a whitespace-based subword learner cannot process Chinese."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. When Merges Cross Spaces and Normalization Changes the Text" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="20. Whether a piece may cross a space">
                <p>
                  {"Treating spaces as symbols permits candidate pieces that include them, unless another rule excludes those candidates. The teaching version restricts learning to marker-prefixed units. This section measures an unrestricted alternative, separating boundary eligibility from the pair-frequency score."}
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
                  {"Thirteen of the first forty learned entries include a marker away from their beginning. This reflects frequent fragments crossing whitespace in this corpus. Other unrestricted corpora can choose different early merges."}
                </p>
</>
                <KeepInMind>
                  {"Restricting cross-space pieces keeps each learned entry within a whitespace unit. Allowing them can create common phrases or smaller fragments across spaces. Either can be configured as one policy; a two-stage switch is another possible design rather than a requirement for combining useful pieces."}
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
                <p>Both fits encode the unseen word as marked low followed by est. Elsewhere, nine of the 27 vocabulary rows change when we replace the space marker. Those changes arise from the implementation’s code-point tie-break. The marker’s visual resemblance to a space does not make that numerical ordering neutral.</p>
                <KeepInMind>
                  {"The marker needs a policy that distinguishes it from literal input, or documents their normalization together. Changing its code point can alter lexical ties, as the nine differing rows show here. Different marker choices need not change every corpus’s learned vocabulary."}
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Language-independent is a claim about the procedure">
                <p>
                  {"The procedure does not require a language-specific word segmenter. Its fitted vocabulary still depends on the languages and spellings in the training text. Using one general algorithm does not make every resulting vocabulary equally effective for every language."}
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
                  The marker removes the need to supply an English-style word split before vocabulary learning. It does not make the starting alphabet independent of the corpus: this fitted version still has 36 symbols. Starting from all 256 byte values is a separate way to cover encoded unfamiliar characters, with a potential sequence-length cost. That change can be combined with the marking convention instead of replacing it.
                </p>
                <KeepInMind>
                  {"The same training procedure can build vocabularies from different languages. Coverage and efficiency still need to be measured. This English-trained example cannot retain the eight Chinese characters without a wider alphabet or fallback, so the shared procedure alone does not establish fairness."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Boundaries, unknown symbols and reversible decoding" id="23-where-the-method-has-nothing-to-say">
                <p>Treating spaces as symbols changes which merges are possible. Normalization and unknown-symbol handling can also affect whether decoding recovers the original text. Check these promises separately from the vocabulary size.</p>
                <DerivationTable
                  expressionHeading="Space marker or merge choice"
                  reasonHeading="Effect on segmentation and recovery"
                  rows={[
                    {
                      expression: "which character stands for a space",
                      reason:
                        "a choice that must remain distinguishable from literal text. Its codepoint can also affect this implementation's tie-breaking. On the four-word corpus, the usual marker and underscore each produce 27 rows, of which 18 match after marker normalization. The nine differences reflect whether tied merges build a word internally or grow it from its leading marker. Different markers need not change every vocabulary, but they do in this example.",
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
                        "This teaching version collapses each whitespace run, so tabs or repeated spaces cannot be recovered exactly. That matters for indented code. The external library has configurable normalization and whitespace behavior; the restriction here belongs to the selected interface and settings.",
                    },
                    {
                      expression: "a text containing the mark itself",
                      reason:
                        "not distinguishable from a text containing a space there, since the two become the same symbol before anything else happens. Any character chosen makes some text unreproducible; picking one that no ordinary writing uses makes the set of such texts small rather than empty.",
                    },
                    {
                      expression: "whitespace at the very ends of a text",
                      reason:
                        "Leading and trailing whitespace is discarded by this teaching preparation. Retaining it would require a different preparation policy, not necessarily new vocabulary rows: the existing marker could represent a trailing space. The external library provides a whitespace-normalization option.",
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
                        "An unspaced line becomes one marker-prefixed unit. The subword learner can find repetition inside it without a supplied word segmenter. On these five lines, the front-marked fit uses three pieces on the probe versus five for the compared end-marked fit.",
                    },
                    {
                      expression: "a text with no whitespace and no repetition",
                      reason:
                        "one unit, with a vocabulary made from the alphabet and the pairs that repeat within it. The fit may finish without an error even when it learns fewer merges than requested. Compare the achieved size with the requested size: here an early stop means no remaining pair meets the repetition rule.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"Document the marker, lexical tie rule, cross-space constraints and normalization policy. Each can affect what the vocabulary learns or what decoding preserves. Those settings belong with the saved tokenizer so another environment can reproduce its behavior."}
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
              "The end-marked fit represents expect with reusable internal fragments. The front-marked fit devoted early merges to marked expected, and those pieces cannot simply be reused in the middle of another word. In this fitted vocabulary, 42 of 99 learned entries are restricted to word starts. Their usefulness depends on which new words and positions the test text contains.",
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
              "The front-marked fit is shorter on the displayed training corpus, while the probe ordering reverses above sixty rows. At the largest fits, the probe lengths are 28 and 25, and only the front-marked one retains the original sentence under these no-fallback policies. Marker-restricted entries, required alphabet size and merge history all differ, so this comparison does not isolate one cause. The front-marked alphabet supports a request of 37 rows, where the corpus uses 781 pieces.",
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
              "The end-marked fit learns three merges and has seventeen rows, including three character-final forms. Those forms record ends of the supplied unspaced lines rather than annotated Chinese word boundaries. It uses eighteen pieces on the training lines and five on the probe, compared with three on the probe for the front-marked fit. Both procedures can learn repeated pieces inside a line.",
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
              "The marker, normalization policy, learner and boundary restrictions are configurable choices in this comparison. Changing the marker alone changes nine of the 27 rows in the small case because tied merges use code-point ordering. The character-based trainer's starting alphabet is limited to the characters observed in its corpus. Handling an eight-character Chinese sentence with eight unknown entries shows that limit. A complete byte alphabet is another representation choice; increasing this character vocabulary's budget cannot create missing initial symbols by itself.",
            ),
        ],
        },
        {
          title: "Practice. Marking, Merging and Coming Back With the Library",
          practice: [
            exercise(
              "Fit the four words under two marks",
              [
  "Fit the supplied four-word corpus with SentencePiece’s BYTE_PAIR learner twice, using its default whitespace marker and an underscore marker. Request thirty rows from each.",
  "For each fit print the actual vocabulary size, rows beginning with its marker, learned merge pairs and lowest’s pieces. Display either marker as an underscore so the report is readable.",
  "Replace each marker with an underscore for display and for the final shared-row comparison. This compares piece structure after marker renaming, rather than literal marker spellings. Alphabetical tie-breaking during fitting still uses the real code points."
],
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
              {
question: "Can changing a boundary marker change which merge wins a tie?",
 hints: [
  "Set algorithm=SubwordAlgorithm.BYTE_PAIR and whitespace_marker at construction.",
  "Read the actual vocabulary size after fitting; a requested ceiling need not be reached.",
  "Keep the marker-normalized row sets for the final intersection. The comparison deliberately treats the two marker spellings as equivalent."
], check: numberCheck("How many of the 27 rows begin with the mark when the mark is an underscore?", 14, 0, "With an underscore marker, fourteen rows begin with that mark. Its different code-point ordering changes tied merge choices in this implementation, although both fits segment lowest identically here.") },
            ),
            exercise(
              "Find where the two schemes cross on the sentence",
              [
  "Compare a front-marked SentencePiece BYTE_PAIR fit with the end-marked BPE fit at requested sizes 60, 70 and 137. Disable byte fallback on the end-marked model.",
  "At each setting print the actual vocabulary size, total corpus tokens, held-out Dr. Alvarez sentence tokens and whether decoding that sentence is exact.",
  "Use the same eighteen training sentences. Length and exact recovery are separate outcomes, and the actual size can finish below its requested ceiling."
],
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
              {
question: "Which boundary convention shortens familiar text, and which preserves the new sentence?",
 hints: [
  "Fit a fresh model for each requested size and convention.",
  "Sum encode(text).n_tokens over the corpus and inspect the held-out sentence separately.",
  "Test decode(encoding.ids) == sentence. Comparing token counts cannot detect a lost character or space."
], check: numberCheck("How many pieces does the front-marked fit read the held-out sentence in at 70 rows?", 36, 0, "At seventy requested rows the front-marked fit uses 36 pieces for the held-out sentence. It is longer than the comparison there, while still recovering the sentence exactly.") },
            ),
            exercise(
              "Measure what the round trip does not keep",
              [
  "Fit the supplied four-word corpus with the front-marked BYTE_PAIR learner. Encode and decode all five probe strings, including repeated spaces, a tab and indented lines.",
  "For each probe print its escaped original text and length, token count, escaped decoded text and length, and exact-equality result.",
  "The default normalization collapses whitespace runs and trims outer whitespace. An exact comparison against the original layout will reveal that loss even when every word survives."
],
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
              {
question: "What layout information disappears during whitespace normalization?",
 hints: [
  "Use repr or an f-string’s !r conversion so tabs, line breaks and indentation are visible.",
  "Compare decode(encode(text).ids) with the original input, not with an already normalized copy."
], check: numberCheck("How many characters are in the decoded version of the supplied 28-character indented text?", 16, 0, "Sixteen characters return from the indented input. The words remain but the distinct line breaks and indentation have collapsed into ordinary spaces.") },
            ),
          ],
        },
      ]}
    />
  );
}
