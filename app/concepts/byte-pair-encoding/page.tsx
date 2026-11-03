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
  title: "Byte Pair Encoding · Perceptron Lab",
  description:
    "Byte pair encoding builds reusable pieces by repeatedly merging frequent neighboring pairs. The learned merge order determines how new text is divided and which combinations share a vocabulary entry.",
};

const MARKER = "</w>";
const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function BytePairEncodingPage() {
  return (
    <ConceptPage
      lessonId="byte-pair-encoding"
      intuition={lessonIntuitions["byte-pair-encoding"]}
      technicalStart="Part 2. Growing a Vocabulary One Pair at a Time"
      openingTitle="A New Word Can Be Made from Familiar Pieces"
      playgroundTitle="Watch repeated pairs become vocabulary entries"
      playgroundIntro="Inspect the adjacent-pair counts and follow one merge at a time. Then encode a word absent from the training text using the pieces that were learned."
      title="Byte Pair Encoding"
      tagline={"Byte pair encoding builds reusable pieces by repeatedly merging frequent neighboring pairs. The learned merge order determines how new text is divided and which combinations share a vocabulary entry."}
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

      playground={<BytePairPlayground />}
      sections={[
        {
          title: "Part 1. What a Fixed Vocabulary Cannot Read",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. One sentence, and a corpus that never contained it">
                <p>
                  Suppose the training text contains lower and analysis, but never the complete expression low-cost re-analysis. A vocabulary containing only whole words would have trouble with that new expression. Could reusable parts give us a way to spell it?
                </p>
                <p>
                  We will use eighteen short sentences about reports and costs. They supply the training corpus, meaning the text from which we count repeated patterns. The sentence shown below is kept out of that corpus so we can test a new arrangement of familiar characters.
                </p>
                <p>
                  The held-out sentence is absent from the corpus. We can therefore test how the learned pieces represent new text, while using familiar characters so that unknown-character handling does not obscure the first example.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>
                  {"Splitting this sentence on spaces gives seven words. The eighteen training sentences contain 72 distinct words across 133 occurrences. Five probe words are absent as complete entries: Alvarez, didn’t, expect, low-cost and re-analysis with its period. Related forms such as expected, lower, cost and analysis are present. That gives us a concrete reason to try reusable pieces."}
                </p>
                <KeepInMind>
                  {"Use the training text to inspect how merges are learned, then use held-out text to check how the resulting pieces apply elsewhere. Encoding the training corpus is informative about compression, but cannot establish coverage of new inputs by itself."}
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
                  {"A larger whole-word vocabulary can cover more known words, but it cannot guarantee coverage of future names, spellings or compounds. The issue is the lack of a way to compose an absent entry from smaller known pieces."}
                </p>
                <KeepInMind>
                  A vocabulary of whole words cannot spell a word it never met,
                  and the words it never met are not a rare accident. On this
                  corpus and this sentence they are five of seven.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. A vocabulary of single characters">
                <p>
                  {"The character-based starting point uses 36 visible characters from this corpus. With the chosen end-marker convention, internal and word-final forms are distinct, giving 51 starting symbols. Whether a new input is representable depends on those forms, rather than just whether its visible letters appeared somewhere."}
                </p>
                <p>
                  Either way it is a very small table, and the sentence encodes to 45 pieces where a word vocabulary needed 7, while the corpus goes from 133 words to 648 pieces.
                </p>
                <p>
                  One of the 45 initial pieces has no row in the table of 51, even though the corpus contains every character in the sentence. The extra distinction is the position of a symbol inside a word: a letter at the end has a different form from that letter elsewhere. We need to inspect those starting symbols as well as the visible alphabet to understand this failure.
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
                  {"Longer sequences give the downstream model more positions to process and increase the token distance between related text. The resulting computation and learning difficulty depend on the model. This page measures sequence length; it does not measure how much model capacity is spent learning spelling."}
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
                  {"BPE starts with small symbols and repeatedly joins a frequent neighboring pair. Each learned joined symbol adds a vocabulary entry and can shorten later encodings. The rule favors repeated combinations, but it does not explicitly choose words, stems or suffixes. A frequent complete word may eventually become one piece."}
                </p>
                <p>
                  {"The requested size controls how many merges may be learned. For this corpus, the no-merge encoding with fallback uses 46 pieces for the held-out sentence. After 85 merges it uses 26. The training corpus falls from 648 to 263 pieces. Requested size and actual final size can differ when no eligible pair remains."}
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
</>),
        },
        {
          title: "Part 2. Growing a Vocabulary One Pair at a Time",
          content: (
            <>
              <SubSection title="5. Spelling a word, and marking where it ends">
                <p>
                  {"For a hand-checkable example, use low five times, lower twice, newest six times and widest three times. These are the four word counts used in the familiar subword BPE example. Here each word is spelled as characters, with an end marker attached to its last character. The marker records a word boundary under this tokenizer’s spacing convention."}
                </p>
                <Equation>{`low  =  l  o  w${MARKER}`}</Equation>
                <p>
                  {"The final w in low has a different starting symbol from the internal w in lower. That lets learned pieces distinguish word-final and internal positions. Decoding replaces end markers with spaces; it does not recover arbitrary original whitespace. The four-word corpus has 11 distinct starting symbols and 79 weighted character pieces."}
                </p>
                <WhyThisWorks title="Why the marker goes on the last character rather than between words">
                  <p>
                  {"The within-word constraint comes from counting and merging each word separately. An end marker attached to a character is one way to retain word boundaries for decoding. A separate boundary symbol could also remain protected by the same constraint; it would not automatically allow cross-word merges. Part 5 explicitly changes which pairs are eligible."}
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
                  <>
                    <p>
                      The pair e followed by s occurs once in newest and once in widest.
                      Weight those occurrences by how often each word appeared in the
                      corpus. Do the same for the other candidates.
                    </p>
                    <Equation>{"e + s:         6 + 3 = 9\ns + marked t:  6 + 3 = 9\nw + e:         2 + 6 = 8\nl + o:         5 + 2 = 7"}</Equation>
                    <p>
                      There are twelve distinct candidate pairs, and the largest count
                      is nine. Two candidates share that count, so choosing the next
                      merge also needs a tie rule.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  {"Weight each adjacency by its word’s occurrence count. A pair in one very common word can outrank a pair spread across several rare words. This favors frequency, without guaranteeing that every common word will become a complete piece at a given budget."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Joining the commonest pair, and repeating">
                <p>
                  Choose the pair with the largest count and replace its non-overlapping occurrences with a joined symbol. Add that symbol to the vocabulary, then count adjacent pairs again in the updated corpus. Repeating this changes which longer pieces can become candidates. In this implementation, we stop at the requested vocabulary size, or earlier when no pair occurs at least twice.
                </p>
                <DerivationTable
                  expressionHeading="the step"
                  reasonHeading="what it does"
                  rows={[
                    { expression: "count every adjacent pair", reason: "weighted by how often each word occurs, and never across a word boundary" },
                    { expression: "take the largest count", reason: "the largest weighted adjacency count; overlapping occurrences can make the actual saving smaller" },
                    { expression: "join it everywhere", reason: "non-overlapping occurrences, scanning each word from left to right" },
                    { expression: "add the joined symbol", reason: "one new row of the vocabulary, and one new merge on the record" },
                    { expression: "repeat", reason: "until the vocabulary is the size asked for, or nothing occurs twice any more" },
                  ]}
                />
                <p>
                  {"For these candidate pairs, occurrences do not overlap, so merging a pair counted nine times removes nine weighted pieces. Repeated-symbol pairs need care: aa occurs twice in aaa, but left-to-right non-overlapping replacement can merge only one of those occurrences. The SDK counts adjacent pairs and then applies non-overlapping merges."}
                </p>
                <KeepInMind>
                  {"The learner chooses the largest adjacent-pair count. On this example that is also the largest immediate piece saving. In general, overlapping occurrences can make count and saving differ. Even an immediate best saving does not guarantee the shortest encoding after several merges."}
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Ten merges on four words">
                <p>
                  Run the loop ten times on the four words and the vocabulary assembles itself in front of us. Drag the control and watch the spellings shorten. The first merge joins e and s at 9; the second joins that new es to the marked t, also at 9, so after two steps the ending est with its marker is a single symbol shared by newest and widest.
                </p>
                <p>
                  {"By merge seven, low with its marker is one piece. After ten merges, newest and widest are whole pieces too, while lower is still lo, w, e and marked r. Its two occurrences account for the remaining difference between 22 corpus pieces and sixteen word occurrences."}
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
                  {"The same weighted-pair loop can be run with a much larger vocabulary budget and corpus. Efficient implementations avoid recounting every pair from scratch after each merge. A larger budget can assemble longer recurring pieces, but the result depends on the corpus and stopping rule."}
                </p>
                </InAModel>
                <p>
                  {"The ten-merge run keeps the complete learned table small enough to inspect: eleven starting symbols, one unknown entry and ten joined symbols. Section 12 adds fallback entries and explains why they are counted separately in this implementation."}
                </p>
                <KeepInMind>
                  {"Ten merges reduce the sixteen word occurrences from 79 pieces to 22. Three word types have become single pieces; lower still uses four. The run stops because we requested ten merges, not because no eligible pair remains."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "The sentence is seven words and the word vocabulary built from the corpus has 72 rows. How many of the seven does it find?",
              ["Two", "Five", "Seven", "None, since the corpus does not contain the sentence"],
              0,
              "This fitted whole-word vocabulary contains only the and Dr. from the probe, so the other five words share the unknown entry. A larger or different corpus could add those spellings, including names, but a fixed learned table can still meet unfamiliar words. The issue is coverage of the actual probe, not an inability of word tables to contain names.",
              {"description":"Use these values and conventions.","data":"Text: Dr. Alvarez didn't expect the low-cost re-analysis.\nOf these whole words, the training vocabulary contains Dr. and the. It contains none of the other whole words. Punctuation remains attached."},
            ),
            trueFalse(
              "Every character the sentence uses turns up somewhere in the corpus, so the character vocabulary can spell all of it.",
              false,
              "One of the 45 pieces has no row. The table has 51 rows rather than 36 because a character that ends a word is kept apart from the same character inside one, and the corpus holds no word ending in z while the sentence contains Alvarez. A character in a position the corpus never used is as unspellable as a character it never used at all.",
            ),
            choice(
              "What do the two extreme tables cost on this sentence?",
              [
                "7 pieces for the word table and 45 for the character table",
                "45 for the word table and 7 for the character table",
                "26 for the word table and 45 for the character table",
                "Both read it in the same number of pieces",
              ],
              0,
              "They are the two ends of one trade. The word table reads the sentence in 7 lookups and cannot spell 5 of them, the character table takes 45 and cannot spell 1. Length is not cosmetic, since whatever reads the pieces spends work per piece and has to carry information six times as far.",
              {"description":"Use these values and conventions.","data":"Text: Dr. Alvarez didn't expect the low-cost re-analysis.\nThe word scheme emits one ID per space-separated word, including an unknown ID when needed.\nThe character scheme emits one ID per non-space character. Its end marker attaches to the last character and adds no extra piece."},
            ),
            choice(
              "Why is the end-of-word marker attached to the last character rather than given a symbol of its own?",
              [
                "It makes the corpus faster to count",
                "It keeps every merge inside one word, and it puts the spaces into the pieces so gluing them back is mechanical",
                "It stops two identical words being confused with each other",
                "It marks which pieces are whole words and which are fragments",
              ],
              1,
              "This implementation learns within pre-tokenized word regions and marks their final character. The marker distinguishes a word-final w from an internal w and helps decoding recover word separation. A separate marker is another possible design if its merge and boundary rules are specified. Preventing cross-word merges depends on the permitted regions, not solely on attaching the marker to a character.",
            ),
            trueFalse(
              "A pair occurring once inside a very common word can outscore a pair occurring in many rare words.",
              true,
              "Pair counts are weighted by word occurrences, so one frequent word can contribute more than many rare words. For the nine nonoverlapping occurrences in this example, merging removes nine token positions. Counts and actual savings can differ for overlapping occurrences of a pair, such as repeated identical symbols. The replay rule determines which occurrences can be replaced together.",
            ),
        ],
        },
        {
          title: "Part 3. The Merges Are the Model",
          content: (
            <>
              <SubSection title="9. Encoding replays the merges in the order they were learned">
                <p>
                  {"The fitted tokenizer includes an ordered merge list as well as a vocabulary. To encode, spell a word in its starting symbols, find the earliest learned merge that applies and join its leftmost occurrence. Repeat until no learned merge applies. The stored order resolves competing possible combinations."}
                </p>
                <Equation>{"rank of a merge  =  its position in the order it was learned, and earlier is applied first"}</Equation>
                <WorkedExample title="The word lowest, which those four words never contained">
                  <p>
                    Spelled out it is l, o, w, e, s, and the marked t. The earliest applicable merge is the first one learned, e with s, giving l, o, w, es, marked t. The next earliest that applies is the second, es with marked t, giving l, o, w, est with the marker. Then the third, l with o.
                  </p>
                  <p>
                    After that nothing applies, because lo followed by w was never merged, and the answer is three pieces, lo and w and est with its marker. Every one of the three is a symbol the corpus taught, and the last one carries the fact that a word ended there.
                  </p>
                </WorkedExample>
                <p>
                  {"Competing applicable merges can produce different encodings when their priorities change. A set of vocabulary strings alone does not specify those priorities. Store the merge ranks and the tokenizer’s starting-symbol and boundary conventions with the entries."}
                </p>
                <KeepInMind>
                  The model is the ordered list of merges. The vocabulary is what
                  falls out of it, and the encoding of a new word is a replay of
                  the training run restricted to that word.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Read the Alvarez sentence with a vocabulary learned elsewhere" id="10-the-running-sentence-cut-by-a-corpus-that-never-saw-it">
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
                  {"The low-cost encoding is lo, w, the hyphen and marked cost. Those are frequency-based units rather than a proposed linguistic analysis. A split inside low can be useful for encoding even when it is not a morpheme boundary."}
                </p>
                <p>
                  {"The re piece in re-analysis resembles a prefix, but its count of 17 also includes occurrences within were and results. The training objective did not identify a prefix category. The remainder becomes analysi followed by a piece containing the final s and period."}
                </p>
                <p>
                  {"The vocabulary contains marked analysis, which encodes analysis alone as one piece. In the probe, the final period changes the word-final form, so that entry cannot apply. Inspecting the standalone and punctuated spellings explains the longer encoding without assuming the tokenizer knows grammatical stems."}
                </p>
                <p>
                  The same happens to cost, which is one piece alone and the last of four inside low-cost. The clearest case of it is expected against expect, where the corpus holds the longer word and not the shorter, so expected is one piece and its own stem is three.
                </p>
                <KeepInMind>
                  {"Pieces reflect repeated substrings and their boundary forms. Punctuation or a suffix can change which ranked merges apply. That can increase piece count even when much of the visible spelling is shared."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Nothing is out of vocabulary, except a character">
                <p>
                  Decoding concatenates the stored pieces and interprets each boundary marker using the scheme&apos;s spacing convention. This recovers the retained text when every required symbol was represented. Coverage must include the boundary-specific forms of those symbols, not merely the visible letters. A marker convention also needs to be distinguished from preserving every possible original spacing pattern.
                </p>
                <p>
                  {"A new word can be encoded from smaller learned symbols if every required starting symbol is covered. A wholly new character, or a missing word-final form, can break that coverage when fallback is disabled. Word-level novelty and starting-symbol coverage are separate questions."}
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

                  The held-out sentence exposes that boundary distinction at z. The corpus contains the letter inside size, but no training word ends with it. Our representation treats an end-of-word letter as a different starting symbol. Recognizing ordinary z therefore does not establish coverage for z at a word boundary.
                </p>
                <p>
                  So the symbol z-at-the-end-of-a-word was never in the alphabet, no merge could ever have produced it, and Alvarez ends in exactly that. The sentence uses no character the corpus lacks and is still not spellable.
                </p>
                <p>
                  {"With byte fallback disabled, this SDK maps the missing final symbol to its unknown entry. The sentence uses 25 pieces. Decoding loses both the z and its attached boundary marker, producing the altered text below. This is the policy of the demonstrated implementation, rather than a required unknown-symbol policy for every BPE tokenizer."}
                </p>
                <Equation>{"Dr. Alvarez didn't   →   Dr. Alvare[UNK]didn't"}</Equation>
                <p>
                  {"Encoding returns an unknown-token ID rather than raising an exception. A caller can detect that ID, or compare the decoded text with the input. If the caller checks neither, the substitution and lost boundary may pass unnoticed. A successful method call therefore does not establish a lossless round trip."}
                </p>
                <p>
                  {"On the Greek probe, the same no-fallback fit emits 22 pieces, including 21 unknown entries. Decoding cannot reconstruct the missing characters. The next section tests a fallback policy that retains them."}
                </p>
                <KeepInMind>
                  {"Merging cannot construct a starting symbol absent from the alphabet. This no-fallback implementation uses an unknown entry when that occurs. Other implementations can reject the input or retain it through a fallback encoding; the choice belongs in the tokenizer’s contract."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Giving every character a spelling">
                <p>
                  {"For valid Unicode text, UTF-8 spells each character using one to four bytes, drawn from 256 possible byte values. Give those values reserved vocabulary entries. A missing character can then use byte entries instead of losing its identity in an unknown token. The spelling must be reserved so it cannot collide with ordinary text pieces."}
                </p>
                <p>
                  This is usually called byte fallback, and it is what SentencePiece offers under that name.
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
                  The repaired held-out sentence uses 26 pieces instead of 25, but none is a byte fallback row. The ordinary z already exists; it is the end-of-word form that was missing. Encoding z and the boundary marker separately preserves the text. In this case the extra marker row, the 257th added row, provides the repair before any of the 256 byte rows are needed.
                </p>
                <p>
                  The other two texts are where the bytes do the work. The word café goes from four pieces, the last a stand-in with the accent gone for good, to six, the accented e written as the two byte rows for 195 and 169. The Greek sentence goes from 22 pieces that cannot be read back to 46 that can, 42 of the 46 being byte rows, so 25 characters arrive as 46 positions and whatever reads them has to work back up from bytes to letters nobody taught it.
                </p>
                <p>This vocabulary was fitted to the report corpus, so its segmentation of Greek is not evidence about a vocabulary trained on representative Greek text. The fallback preserves the ability to encode the example. How efficiently a fitted vocabulary represents a language is a separate question that requires suitable training and evaluation text.</p>
                <NumberTable
                  headings={["text", "as published", "with byte fallback", "round trip"]}
                  rows={[
                    ["the sentence about Dr. Alvarez", "25 pieces", "26 pieces, 0 of them bytes", "was lossy, now exact"],
                    ["a sentence with an accent", "14 pieces", "16 pieces, 3 of them bytes", "was lossy, now exact"],
                    ["a sentence in Greek", "22 pieces", "46 pieces, 42 of them bytes", "was lossy, now exact"],
                    ["the eighteen-sentence corpus", "263 pieces", "263 pieces", "exact either way"],
                  ]}
                  caption="The same 85 merges over the same 51 symbols in every column. The corpus row is the one to notice, since the repair costs the text it was fitted to nothing at all."
                />
                <KeepInMind>
                  {"This implementation adds 257 structural entries: all byte values and a separate word-boundary marker. They leave training-corpus length unchanged and add one piece to this held-out sentence. The Greek probe is longer because unfamiliar characters need byte spellings. Coverage and compactness remain separate measures."}
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
                  In this implementation, the requested vocabulary budget covers the corpus alphabet, the stand-in and the learned merges. The 257 fallback rows are additional. Consequently a request for 54 gives 311 total rows, while a request for 137 gives 394. Read the total table size when estimating storage, rather than assuming the request is a cap on every row.
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
                  {"SentencePiece includes its required entries in the requested vocabulary budget. Enabling byte fallback reserves 256 byte pieces in addition to its other required symbols. The exact minimum therefore depends on that tokenizer’s configuration, rather than being universally 257. Our small example keeps fallback disabled to expose the eleven-symbol, ten-merge table."}
                </p>
                <p>
                  The price of the choice made here is the one the table above shows, which is that the number asked for is not the width of the table, so a model sized from it alone would be 257 rows short.
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
                  {"Hold the corpus and other settings fixed, then vary the requested vocabulary size. Measure training-corpus length and held-out sentence length separately. Size is one design choice among several, including starting alphabet, boundary convention and minimum pair count."}
                </p>
                <PieceCountCurve />
                <p>
                  {"Both measured curves fall rapidly at first and later flatten. The first merge joins h to marked e and saves 31 training pieces. The second joins t to that result, saves 19 and creates marked the. Training frequency determines those choices; an individual held-out text need not benefit from every merge."}
                </p>
                <KeepInMind>
                  {"Each additional applicable merge can only shorten an existing deterministic encoding. How much it shortens a particular held-out text depends on which pieces occur there. The displayed flattening is a measured pattern, rather than a guarantee of identical diminishing returns on every text."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Where the curve stops falling">
                <p>
                  {"The learned part stops at 137 entries here. Requests for 150, 200 and 300 all reach that same fit because no adjacent pair meets the minimum count of two. That minimum is a configured policy. A once-observed pair could still be meaningful; the count alone does not settle its linguistic value."}
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
                  Increasing the vocabulary can shorten the encoded sequences, reducing the number of positions a later model must process. It also adds embedding rows to learn and store. Some new pieces occur rarely, so their vectors receive little training evidence. We need to compare both sequence lengths and table costs for the text we expect to use.
                </p>
                <p>
                  {"Larger budgets can add rare pieces whose downstream embeddings receive limited training evidence. That is one reason to examine both length and table cost. On this tokenizer’s probe, increasing learned size from 100 to 137 saves two pieces. No downstream model is trained here, so this table cannot locate its optimal vocabulary size."}
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
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "Two people holding the same set of rows can still cut a new word differently, unless they also agree on the order the merges were learned in.",
              true,
              "What the fit produced is an ordered list of merges, and the order is load-bearing, since a merge only applies to what the merges before it left behind. Reversing two merges gives a different tokenizer out of the same rows, which is why a vocabulary cannot be shipped as a set of strings. Encoding lowest replays the merges in rank order, e with s, then es with the marked t, then l with o, and stops when nothing learned applies.",
            ),
            choice(
              "The vocabulary holds a row for analysis, and the sentence still comes out as analysi followed by a final s carrying the full stop. Why?",
              [
                "The row was learned too late in the order to apply",
                "A row carries an end-of-word marker, and here the word ends in a full stop rather than in an s",
                "The word occurs only once in the corpus",
                "The merges were replayed in the wrong order",
              ],
              1,
              "Encoding replays the learned merges inside the permitted word region; it does not choose the longest vocabulary string independently. Word-final markers and punctuation change which symbol sequences are available. A row learned for a complete word therefore need not be usable inside a longer or differently punctuated spelling. Check the actual marked pieces and merge ranks when explaining this result.",
            ),
            trueFalse(
              "With byte fallback disabled, increasing only the requested vocabulary budget eventually gives a row for every character a future text might contain.",
              false,
              "A merge joins two symbols that already exist, so every row the fit adds is built from rows that were already there, and those are the alphabet the corpus arrived in. Ask for a thousand and the alphabet is still whatever the corpus happened to hold, which is why a character outside it becomes a stand-in and the round trip silently returns different text.",
            ),
            choice(
              "What did adding the 257 fallback rows cost on the sentence about Dr. Alvarez?",
              [
                "Nothing, since the sentence needed no byte row",
                "One piece, 26 against 25, and none of the 26 is a byte row",
                "Twenty-one pieces, one per stand-in replaced",
                "It roughly doubled the length, as it does on the Greek sentence",
              ],
              1,
              "The letter z has a row already and what it lacked was a row for z at the end of a word, so the fit writes the ordinary z and then the marker on its own, and the space comes back. The 256 byte rows are never reached here, and the whole repair is the 257th row. On the Greek sentence the bytes do the work, 42 of 46 pieces.",
            ),
            several(
              "Which of these hold of fitting the eighteen sentences at different sizes?",
              [
                "Asking for 150, 200 or 300 learned rows gives the same 137 each time",
                "No merge saves more pieces than the merge before it, so the curve of length against size can only flatten",
                "A size below 52 is met by leaving out the rarest symbols",
                "Going from 100 rows to 137 shortens the sentence by about as much as the first 48 merges did",
              ],
              [0, 1],
              "This implementation stops when no eligible pair meets its repetition threshold or when it reaches the requested learned-vocabulary budget. The threshold is a training policy, not proof that a once-seen pair has no linguistic value. The base alphabet and unknown entry also set a minimum feasible learned size. Report actual fitted size and held-out length, because a larger request need not produce another merge or the same saving on new text.",
            ),
        ],
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
                  and the ordering changes with the text. On the sentence about Dr. Alvarez
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
                  It is not free, and this is the place on the page where a variant is worse than the thing beside it. Fitted to the same eighteen sentences with the same number of merges, the byte alphabet reads the sentence about Dr. Alvarez as 29 pieces where the character alphabet reads it as 26, and reads the corpus as 282 pieces where the character alphabet reads it as 263.
                </p>
                <p>
                  {"This byte fit reserves all 256 byte entries even though the corpus uses only 36 values. It also explicitly represents spaces, while the character fit uses end markers. These are storage and representation differences. Unused byte entries do not themselves explain why the encoded corpus is longer."}
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
                  {"For these same-corpus fits, byte-level merging uses 29 rather than 26 pieces on the probe, and 282 rather than 263 on training text. Both cover the shown inputs. A different corpus or spacing convention can reverse a length comparison, as the isolated café example already illustrates."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Letting a piece cross a space">
                <p>
                  {"The second variant permits eligible pairs across original word boundaries. A repeated phrase can then become one piece. The number of saved positions depends on how many pieces represented that phrase before the merge; joining two existing pieces saves one position per non-overlapping occurrence."}
                </p>
                <p>
                  {"Cross-boundary merging can also begin at the character stage. It may then learn frequent fragments spanning spaces before assembling whole words. The two-stage variant demonstrated here first learns within words, then permits broader merges to influence the kind of units it learns."}
                </p>
                <p>
                  So the fit runs in two stages, ordinary merging within words up to a size stated in advance, then merging with the boundary ignored for whatever room is left.
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
                  {"On the four-word corpus, the second stage learns repeated-word combinations such as newest newest and low low. Those combinations reflect how this artificial corpus was constructed. Whether such entries are useful depends on the intended input, rather than on their being repeated words alone."}
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
                  On the eighteen sentences the stage does what the idea promises. Eight merges are learned after the lift and all eight produce a row spanning a space, six of them joining two complete words, of with the, and with the, report with was, rewrote with the, analysis with was, and the abbreviation Dr. with Bell.
                </p>
                <p>
                  A seventh joins costing to the row that already held and the, so it spans three words. The eighth is the one that makes the point about starting anywhere, since it joins the an that ends than to the following the, and an is not a word of these eighteen sentences at all.
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
                  The constrained vocabulary gives un the same row in undo and untie, and do the same row in undo and redo. Those shared entries make the recurring parts available to the model instead of merging them into unrelated whole forms. The measured cost here is twice the sequence length. Whether the shared structure improves a model enough to justify that cost requires a model experiment, which this tokenizer comparison does not provide.
                </p>
                <KeepInMind>
                  {"On this particular prefix-and-root corpus, the constrained entries match the first fifteen entries of the unconstrained fit. It uses twice as many pieces but preserves the supplied boundaries. Constraints can change merge order on other data; a constrained vocabulary is not generally a prefix of an unconstrained vocabulary."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Tied Merges and Characters the Corpus Never Saw" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="23. The tie the counts cannot break">
                <p>
                  {"The first pair counts tie: e followed by s and s followed by marked t both score nine. Counts alone do not select one. This SDK chooses the lexicographically smaller pair, making the result independent of input order for the same weighted corpus. Other tie rules can produce different learned entries."}
                </p>
                <TieBranches />
                <p>
                  What the two branches actually do is worth measuring rather than asserting, because the usual claim is that a tie changes everything downstream. Here it does not. Taking either branch and finishing the fit leaves the corpus at 22 pieces, and nine of the ten rows are identical; the branches differ in one row, es on one side against st with its marker on the other, and the word lowest comes out as the same three pieces either way.
                </p>
                <p>
                  The second tie, three pairs at 6 four merges later, is the interesting one, since all three branches again leave the corpus at 22 pieces and one of them cuts lowest as two pieces rather than three.
                </p>
                <KeepInMind>
                  {"Tied pairs have the same immediate count score. A repeatable tie rule makes training reproducible, but the branches can differ in later compression or held-out segmentation. Equality at the current step does not make every downstream consequence equivalent."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Greedy merging is not shortest merging">
                <p>
                  {"On the next corpus, the most frequent candidate also gives the largest immediate saving because its occurrences do not overlap. We can enumerate short sequences of merges to test whether that greedy choice also minimizes length after several steps."}
                </p>
                <p>
                  Take three words, report twice, taste eight times and state ten times, which is 102 pieces spelled in characters. Three pairs tie for first place at 18, s followed by t, t followed by a, and t followed by the marked e, and every one of them saves the same 18. Take any of them and one merge leaves the corpus at 84.
                </p>
                <p>
                  But the branches part immediately afterwards, and the branch beginning with t followed by a is two merges from a corpus of 66 while the branch beginning with s followed by t cannot do better than 74.
                </p>
                <WorkedExample title="The second merge on each branch, counted">
                  <>
                    <p>After merging <span className="font-mono">s + t</span>, the two frequent words are:</p>
<Equation>{"taste: t, a, st, e</w>\nstate: st, a, t, e</w>"}</Equation>
<p>The largest next-pair count is 10. If the first merge instead joins <span className="font-mono">t + a</span>, the remaining forms are:</p>
<Equation>{"taste: ta, s, t, e</w>\nstate: s, ta, t, e</w>\ncount of (t, e</w>): 8 + 10 = 18"}</Equation>
<p>That pair remains available in both words, giving the second branch a larger next saving despite an equal first-step score.</p>
                    <Equation>{"after s + t:   best pair left scores 10,   84 − 10 = 74\nafter t + a:   t + marked e scores 8 + 10 = 18,   84 − 18 = 66"}</Equation>
                    <p>
                      The first merge spent the same 18 either way. What
                      differed is what it left behind, and the count that chose
                      it could not see that far.
                    </p>
                  </>
                </WorkedExample>
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
                  {"The selected greedy branch remains eight pieces above the shortest enumerated encoding at budgets two through four. Relative to the original 102 pieces, that gap is about eight percent. The first count cannot evaluate later opportunities without looking ahead, which is why this example distinguishes a local heuristic from a global search."}
                </p>
                <KeepInMind>
                  {"BPE does not generally minimize corpus length at a fixed merge budget. Here the selected frequency-greedy branch is eight pieces above the enumerated best at budgets two, three and four. Overlapping pair occurrences add a separate reason that an adjacency count need not equal the immediate saving."}
                </KeepInMind>
              </SubSection>

              <SubSection title="25. A vocabulary carries one corpus, and everything else backs off">
                <p>
                  {"The fitted merges summarize recurring combinations in the training corpus. Once deployed, a fixed tokenizer keeps applying those same entries and ranks. Its favored spellings can therefore reflect an unrepresentative training source. Retraining or adapting the tokenizer can change that representation, but requires compatible handling of the downstream model’s token IDs."}
                </p>
                <p>
                  {"The supplied corpus includes expected but not expect. The fitted tokenizer encodes the longer word as one piece and the shorter stem as three. While this tokenizer stays fixed, later text does not change that segmentation. Adaptation is possible, but is a separate operation from training the model on already encoded inputs."}
                </p>
                <p>
                  {"When no large learned piece applies, smaller pieces retain the spelling if the alphabet or fallback covers it. A domain change can increase sequence length, but need not do so for every text. Measure the intended domain’s encodings rather than inferring length from the domain label alone."}
                </p>
                <p>
                  For the Greek sentence, the byte fallback uses 46 pieces to cover 25 characters. That is a longer sequence than a character table with the required entries would need. It illustrates the separate questions of coverage and compactness: the fitted vocabulary can retain unfamiliar writing while representing it less efficiently.
                </p>
                <KeepInMind>
                  {"Different corpora can produce different useful vocabularies. Compare coverage, length, reproducibility and downstream cost on the intended inputs. The learned entries themselves are appropriate to examine when they explain an unwanted segmentation or unequal representation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="26. What merge counts cannot choose for us" id="26-where-the-method-has-nothing-to-say">
                <p>The instruction to merge the most frequent pair leaves several decisions open. Tied counts need a repeatable rule, unavailable characters need a policy, and the requested vocabulary size may exceed what the corpus can provide.</p>
                <DerivationTable
                  expressionHeading="Merge or vocabulary condition"
                  reasonHeading="How it affects BPE"
                  rows={[
                    { expression: "two pairs with the same count", reason: "Counts tie at this step, so a tie rule is needed. This SDK uses lexical pair order. The first tie changes one learned row but not the final corpus count in the shown run; other ties can change later compression and probe encodings." },
                    { expression: "a vocabulary smaller than the alphabet", reason: "there is nothing to give. The floor is one row per symbol the corpus is spelled in, plus whatever stands in for the unspellable, since dropping a symbol leaves part of the training corpus itself unreadable. On the eighteen sentences that floor is 52." },
                    { expression: "a vocabulary larger than the corpus can fill", reason: "the loop runs out of pairs occurring twice and stops. The size asked for is a ceiling, not a promise, and the number learned is a fact about the corpus; 300 and 137 are the same fit here." },
                    { expression: "a pair seen exactly once", reason: "The minimum frequency is configurable. A once-occurring pair can be merged if allowed. A corpus of distinct whole words may still contain repeated internal pairs, so forbidding count-one merges does not necessarily prevent learning." },
                    { expression: "the shortest corpus a given number of merges could reach", reason: "not what the method finds. Greedy choice is optimal at one merge and can be beaten from two onward, by eight pieces in 102 on the three-word corpus of section 24, and finding the true optimum means searching a space that grows with every merge." },
                    { expression: "a character the corpus never used", reason: "unspellable, and permanently so, since a merge only ever joins two symbols that already exist and therefore no vocabulary size can invent an alphabet row. What to do instead is a decision. One stand-in row loses the character and any word boundary attached to it, and loses them silently; a spelling in bytes keeps both, at 257 rows once and, on the Greek sentence, at 46 pieces for 25 characters." },
                    { expression: "a symbol the corpus used only inside words, at the end of one", reason: "also unspellable, and much easier to miss, because the character is there. Marking word ends makes a letter at the end a different symbol from the same letter in the middle, which is what makes decoding mechanical and what leaves this hole. Alvarez falls into it on a corpus containing size, and the repair there costs a single piece, since the letter has a row and only its position did not." },
                    { expression: "how to count rows that no corpus taught", reason: "The requested budget can include or exclude structural fallback entries. This SDK adds 257 entries outside the learned budget, so a learned size of 137 gives 394 total rows. Another implementation may include bytes, required alphabet symbols and meta symbols within its total budget." },
                    { expression: "where a word’s parts begin and end", reason: "outside the method entirely. Nothing in counting adjacent pairs can distinguish a boundary between two morphemes from any other position, so a piece spanning a prefix and a root is exactly as good to the loop as any other piece. Supplying the joints from elsewhere is the third variant, and it costs twice the pieces on the corpus of section 22." },
                    { expression: "whether a piece may cross a space", reason: "a convention rather than a consequence. Counting words separately makes it impossible; counting whole texts makes it possible from the first merge, at which point the loop spends its early rows on letters that happen to sit either side of a gap. Doing one and then the other needs a transition point, and nothing determines where that goes." },
                    { expression: "a corpus with no phrase in it", reason: "The constructed repeated-word text teaches repeated-word combinations. Here the learned rows include newest newest and low low. Their usefulness must be assessed against the intended text; the algorithm has followed its supplied count objective." },
                  ]}
                />
                <KeepInMind>
                  {"Document the alphabet, boundary handling, tie rule, minimum pair count and vocabulary budget convention. Together with the learned entries and ranks, these settings determine what the tokenizer returns. A count table alone does not supply all of those decisions."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            several(
              "Which of these hold of the byte-alphabet fit against the character fit on the same eighteen sentences?",
              [
                "It reads the sentence about Dr. Alvarez as 29 pieces where the character fit reads 26",
                "Its table is the smaller of the two, 341 rows against 394",
                "Both fits return all three texts exactly",
                "It reads the Greek sentence in fewer pieces",
              ],
              [0, 1, 2],
              "The two fits use the same number of pieces for this Greek probe, but differ on familiar text and total vocabulary storage. Unused byte rows consume vocabulary capacity; they do not directly add tokens to an encoding. Sequence length also depends on retained spaces, boundary conventions and which merges the budget permits. A byte-alphabet learner can spend early merges assembling multibyte characters that a character-based learner starts with.",
            ),
            several(
              "Which of these hold of the fit that respects the joints in undo, untie, redo and retie?",
              [
                "It learns the same first five merges as the unconstrained fit and then stops, at 15 rows",
                "It reads the forty words as 80 pieces where the unconstrained fit reads them as 40",
                "It forbids a merge across a joint by adding a rule to the merging loop",
                "It reaches the thirty rows both fits were asked for",
              ],
              [0, 1],
              "The repair is a change to how the words are spelled before the loop starts, not a rule inside it. Each word is cut at its joints and each part handed to the counter as a word of its own, so a pair straddling a joint is never adjacent and cannot be proposed, and the loop is untouched. Once every part is a single symbol every pair that remains straddles a joint, so the fit stops at 15 of the thirty rows asked for. What the doubling in length buys is that the un in undo is the same row as the un in untie, and the do in undo the same row as the do in redo.",
            ),
            choice(
              "Why is the rule against merging across a word boundary lifted only after a first stage rather than from the start?",
              [
                "The counting is undefined until the words exist as single symbols",
                "The commonest adjacent pairs would be a letter ending one word beside a letter starting the next, so the early merges would never build the words",
                "A row spanning a space cannot be glued back without a separate record of the spaces",
                "The first stage is what supplies the end-of-word markers",
              ],
              1,
              "Allowing cross-boundary pairs changes which candidates can use the merge budget. In this experiment, staging the change first learns within-word pieces, then permits broader combinations. That is a design choice to test, not a guarantee that across-gap pairs always have the largest early count or that one staging policy is best for every corpus.",
            ),
            trueFalse(
              "When two pairs tie for the largest count, the counting is genuinely indifferent between them, and what the tie-break decides is how words the corpus never contained will be cut.",
              true,
              "A tied current count gives no preference under that immediate score. The tie rule still selects a merge and can change later candidates, later training length and unseen-word encodings. Some branches in this example reach the same training length, while another tie changes lowest. The exhaustive next example shows that equal first-step savings need not imply equal later savings.",
            ),
            choice(
              "On report twice, taste eight times and state ten times, every sequence of merges was enumerated. What did that show?",
              [
                "The greedy run reaches the shortest corpus at every budget",
                "Every branch reaches the same length in the end",
                "The branch beginning with t followed by a reaches 66 in two merges where the branch beginning with s followed by t cannot do better than 74",
                "The greedy run is optimal once it is past the first tie",
              ],
              2,
              "All three first merges save exactly 18, so nothing in the counting could have seen the difference coming, and the branches part immediately afterwards. The gap of eight pieces on a corpus of 102 holds steady out to four merges and is locked in by the first move, which makes the method a heuristic for shortening a corpus rather than a solution to it.",
            ),
        ],
        },
        {
          title: "Practice. Growing and Reading a Vocabulary With the Library",
          practice: [
            exercise(
              "Replay the ten merges on the four words",
              [
  "The starter gives repeated occurrences of low, lower, newest and widest. Learn a vocabulary from those occurrences, then test a word that was absent: lowest.",
  "Fit BytePairEncoding with vocabulary_size=22 and byte_fallback=False. Print each learned merge in order, including its left piece, right piece, merged spelling and score. Then print the vocabulary size, lowest’s pieces and count, and its decoded text.",
  "Here a merge score is the pair’s weighted occurrence count. The library resolves equal scores alphabetically; keep the corpus and settings fixed so your report follows that rule."
],
              `from oop_ml import BytePairEncoding

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]

model = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
# Print each merge in the order it was learned, with the count that chose
# it, then the number of rows in the vocabulary. Encode the word lowest,
# print its pieces and how many there are, and decode the ids back to text.`,
              `from oop_ml import BytePairEncoding

corpus = [
    "low low low low low",
    "lower lower",
    "newest newest newest newest newest newest",
    "widest widest widest",
]

model = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
for rank, merge in enumerate(model.merges, start=1):
    print(f"merge {rank:2d}: {merge.left} + {merge.right} -> {merge.merged} at {merge.score:.0f}")
print(f"rows {model.vocabulary.n_tokens}")

encoding = model.encode("lowest")
print(f"lowest -> {' '.join(encoding.texts)} in {encoding.n_tokens} pieces")
print(f"decoded {model.decode(encoding.ids)}")`,
              `merge  1: e + s -> es at 9
merge  2: es + t</w> -> est</w> at 9
merge  3: l + o -> lo at 7
merge  4: e + w -> ew at 6
merge  5: ew + est</w> -> ewest</w> at 6
merge  6: n + ewest</w> -> newest</w> at 6
merge  7: lo + w</w> -> low</w> at 5
merge  8: d + est</w> -> dest</w> at 3
merge  9: i + dest</w> -> idest</w> at 3
merge 10: w + idest</w> -> widest</w> at 3
rows 22
lowest -> lo w est</w> in 3 pieces
decoded lowest`,
              {
question: "Which repeated pairs become vocabulary entries, and how do they spell an unseen word?",
 hints: [
  "Pass vocabulary_size and byte_fallback to the constructor, then the corpus to fit.",
  "model.merges records the learned order. Each merge exposes left, right, merged and score.",
  "encoding.texts shows pieces, encoding.ids supplies decode, and encoding.n_tokens gives their count. The </w> marker belongs to a word ending."
], check: numberCheck("What count chose the seventh merge, the one that joins lo to the marked w?", 5, 0, "The seventh merge has score 5 because that marked form of low occurs five times. Its score refers to occurrences in this corpus, rather than to a probability or a measure of meaning.") },
            ),
            exercise(
              "Turn the size dial on the eighteen sentences",
              [
  "Allowing another learned piece can shorten familiar text, but the saving may be different on the Dr. Alvarez sentence. Compare the two lengths as the vocabulary budget grows.",
  "Fit BytePairEncoding at requested sizes 52, 54, 66, 80, 100, 137 and 300, leaving byte fallback enabled. For each fit print the learned-row count excluding its 257 structural fallback rows, the merge count, the total corpus tokens and the held-out sentence tokens.",
  "Use the supplied sentences unchanged and report the actual fitted size when the learner stops below the requested budget."
],
              `from oop_ml import BytePairEncoding

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

for size in [52, 54, 66, 80, 100, 137, 300]:
    model = BytePairEncoding(vocabulary_size=size).fit(sentences)
    # Print the size asked for, the rows the corpus taught (the table less
    # the 257 byte rows), the number of merges, the pieces the corpus costs
    # under this fit and the pieces the sentence costs.`,
              `from oop_ml import BytePairEncoding

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

for size in [52, 54, 66, 80, 100, 137, 300]:
    model = BytePairEncoding(vocabulary_size=size).fit(sentences)
    taught = model.vocabulary.n_tokens - 257
    corpus_pieces = sum(model.encode(text).n_tokens for text in sentences)
    sentence_pieces = model.encode(sentence).n_tokens
    print(f"asked {size:3d}: taught {taught:3d} rows in {model.n_merges:2d} merges, "
          f"corpus {corpus_pieces} pieces, sentence {sentence_pieces}")`,
              `asked  52: taught  52 rows in  0 merges, corpus 648 pieces, sentence 46
asked  54: taught  54 rows in  2 merges, corpus 598 pieces, sentence 44
asked  66: taught  66 rows in 14 merges, corpus 484 pieces, sentence 37
asked  80: taught  80 rows in 28 merges, corpus 414 pieces, sentence 29
asked 100: taught 100 rows in 48 merges, corpus 344 pieces, sentence 28
asked 137: taught 137 rows in 85 merges, corpus 263 pieces, sentence 26
asked 300: taught 137 rows in 85 merges, corpus 263 pieces, sentence 26`,
              {
question: "What does a larger vocabulary buy on the training text and on a new sentence?",
 hints: [
  "With fallback enabled, vocabulary.n_tokens includes 257 structural rows. Subtract those only for the displayed learned-row count.",
  "Fit a fresh model at every size. Compute corpus length by summing encode(text).n_tokens over sentences.",
  "Keep the corpus and held-out sentence separate. A merge can help one without appearing in the other."
], check: numberCheck("How many pieces does the sentence come to at 54 rows, two merges in?", 44, 0, "At the requested learned size of 54, the held-out sentence uses 44 pieces. The first two merges help this sentence, but the size sweep is needed to see how later savings differ between familiar and held-out text.") },
            ),
            exercise(
              "Read the sentence as published, then with every character spellable",
              [
  "A vocabulary learned from English sentences may leave parts of a new name or a Greek sentence unrepresentable. Compare the library’s end-marked BPE with and without its byte-fallback repair.",
  "Fit both versions on sentences with vocabulary_size=137. Encode each probe with each fit, in the supplied order. Print its token count, the number of pieces spelled as <0x..> byte rows, and either exact or the changed decoded text.",
  "The settings and corpus otherwise stay the same. Print the decoded string only on a mismatch so the successful Greek round trip does not require the console to display Greek."
],
              `from oop_ml import BytePairEncoding

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
greek = "Η ανάλυση ήταν φθηνότερη."

published = BytePairEncoding(vocabulary_size=137, byte_fallback=False).fit(sentences)
repaired = BytePairEncoding(vocabulary_size=137).fit(sentences)
# For each fit and each text, encode it and decode the ids. Print the number
# of pieces, how many of them are byte rows (spelled <0x..>), and then either
# the word exact or the decoded text, when it is not the text that went in.`,
              `from oop_ml import BytePairEncoding

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
greek = "Η ανάλυση ήταν φθηνότερη."

published = BytePairEncoding(vocabulary_size=137, byte_fallback=False).fit(sentences)
repaired = BytePairEncoding(vocabulary_size=137).fit(sentences)
for label, model in [("as published", published), ("every character spellable", repaired)]:
    for text in [sentence, greek]:
        encoding = model.encode(text)
        decoded = model.decode(encoding.ids)
        byte_rows = sum(1 for piece in encoding.texts if piece.startswith("<0x"))
        outcome = "exact" if decoded == text else f"came back as {decoded}"
        print(f"{label}: {encoding.n_tokens} pieces, {byte_rows} byte rows, {outcome}")`,
              `as published: 25 pieces, 0 byte rows, came back as Dr. Alvare[UNK]didn't expect the low-cost re-analysis.
as published: 22 pieces, 0 byte rows, came back as [UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK][UNK].
every character spellable: 26 pieces, 0 byte rows, exact
every character spellable: 46 pieces, 42 byte rows, exact`,
              {
question: "Can byte fallback repair a learned tokenizer’s missing characters?",
 hints: [
  "byte_fallback=True is the default; pass False for the comparison without the repair.",
  "Byte-fallback pieces have texts beginning with <0x. Count those pieces in encoding.texts.",
  "Compare model.decode(encoding.ids) with the original string. The absence of an exception does not establish an exact round trip."
], check: numberCheck("How many of the Greek sentence’s pieces are byte rows under the repaired fit?", 42, 0, "The repaired Greek encoding contains 42 byte-fallback pieces. The remaining pieces represent boundaries and punctuation already covered by this fit. Verify recovery independently of the piece count.") },
            ),
            exercise(
              "Keep the merges off a word’s joints",
              [
  "The supplied words undo, untie, redo and retie share prefixes and endings. Compare freely merging their characters with a fit that first separates the known parts.",
  "Fit both models at vocabulary_size=30. Disable byte fallback on the unconstrained BPE. Use the supplied pattern pre-tokenizer for the constrained fit so merges cannot join pieces on opposite sides of its cuts.",
  "For each fit print its merge and vocabulary counts, the total tokens for the forty word occurrences, the learned merged spellings in order, and undo’s pieces. A boundary is a constraint supplied by us, not a linguistic discovery by the learner."
],
              `from oop_ml import (
    BytePairEncoding,
    MorphemeConstrainedBytePairEncoding,
    PatternPreTokenizer,
)

words = ["undo", "untie", "redo", "retie"]
corpus = [" ".join(word for word in words for _ in range(10))]
joints = PatternPreTokenizer(pattern="un|re|do|tie")

plain = BytePairEncoding(vocabulary_size=30, byte_fallback=False).fit(corpus)
constrained = MorphemeConstrainedBytePairEncoding(
    vocabulary_size=30, morph_splitter=joints
).fit(corpus)
# For each fit print the number of merges, the rows in its vocabulary and
# the pieces the corpus costs, then the merged symbols in order and the
# pieces of undo.`,
              `from oop_ml import (
    BytePairEncoding,
    MorphemeConstrainedBytePairEncoding,
    PatternPreTokenizer,
)

words = ["undo", "untie", "redo", "retie"]
corpus = [" ".join(word for word in words for _ in range(10))]
joints = PatternPreTokenizer(pattern="un|re|do|tie")

plain = BytePairEncoding(vocabulary_size=30, byte_fallback=False).fit(corpus)
constrained = MorphemeConstrainedBytePairEncoding(
    vocabulary_size=30, morph_splitter=joints
).fit(corpus)
for label, model in [("may cross a joint", plain), ("may not cross a joint", constrained)]:
    pieces = sum(model.encode(text).n_tokens for text in corpus)
    print(f"{label}: {model.n_merges} merges, {model.vocabulary.n_tokens} rows, forty words as {pieces} pieces")
    print(f"  merges {' '.join(merge.merged for merge in model.merges)}")
    print(f"  undo -> {' '.join(model.encode('undo').texts)}")`,
              `may cross a joint: 9 merges, 19 rows, forty words as 40 pieces
  merges do</w> ie</w> re tie</w> un redo</w> retie</w> undo</w> untie</w>
  undo -> undo</w>
may not cross a joint: 5 merges, 15 rows, forty words as 80 pieces
  merges do</w> ie</w> re tie</w> un
  undo -> un do</w>`,
              {
question: "What changes when merging cannot cross a known prefix boundary?",
 hints: [
  "The pre-tokenizer supplies the allowed regions before pairs are counted. Merging cannot undo that separation.",
  "Read n_merges, vocabulary.n_tokens and each merge.merged from the fit.",
  "The corpus is one string here. Its encoding counts all forty occurrences, while encoding undo shows one local consequence of the constraint."
], check: numberCheck("How many pieces does the constrained fit read the forty words as?", 80, 0, "The constrained fit uses 80 pieces for the forty word occurrences. It preserves the supplied two-part boundaries and stops when every remaining possible join crosses one of them.") },
            ),
          ],
        },
      ]}
    />
  );
}
