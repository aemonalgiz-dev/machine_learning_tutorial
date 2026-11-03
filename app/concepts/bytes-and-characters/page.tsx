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
import { AlphabetGrowthChart } from "@/components/widgets/AlphabetGrowthChart";
import { ByteCharacterExplorer } from "@/components/widgets/ByteCharacterExplorer";
import { ByteCharacterRoundTrip } from "@/components/widgets/ByteCharacterRoundTrip";
import { LearnedReadingFailures } from "@/components/widgets/LearnedReadingFailures";
import { PartialByteRun } from "@/components/widgets/PartialByteRun";
import { ScriptCostChart } from "@/components/widgets/ScriptCostChart";

export const metadata: Metadata = {
  title: "Bytes and Characters · Perceptron Lab",
  description:
    "Text has several units of representation. A visible character can involve multiple code points or bytes, affecting how text is stored and how much input a model has to process.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function BytesAndCharactersPage() {
  return (
    <ConceptPage
      lessonId="bytes-and-characters"
      intuition={lessonIntuitions["bytes-and-characters"]}
      technicalStart="Part 2. Reading the Units the Text Is Already Made Of"
      openingTitle="A Tiny Alphabet Can Spell a Very Long Sentence"
      playgroundTitle="How many bytes does one character need?"
      playgroundIntro="Compare the number of characters with the number of bytes. Inspect a character represented by multiple bytes and check the decoded result."
      title="Bytes and Characters"
      tagline={"Text has several units of representation. A visible character can involve multiple code points or bytes, affecting how text is stored and how much input a model has to process."}
      prerequisites={
        <>
          Two things from earlier in this section. The page on{" "}
          <Link href="/concepts/what-a-token-is" className={link}>
            what a token is
          </Link>{" "}
          sets out the table that turns pieces of writing into numbers and what
          it can do at a piece it has never seen, and the page on{" "}
          <Link href="/concepts/byte-pair-encoding" className={link}>
            byte pair encoding
          </Link>{" "}
          builds a vocabulary out of a corpus by merging. This page is what is
          left once we refuse to build one at all. The corpus, the sentence and
          the merged vocabulary here are the ones that page uses, so its numbers
          and these can be read together.
        </>
      }

      playground={<ByteCharacterExplorer />}
      sections={[
        {
          title: "Part 1. What an Unfamiliar Piece Costs",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. One sentence, and eighteen sentences it is not in">
                <p>
                  We will reuse the eighteen-sentence corpus from the merging lesson and test on the same held-out sentence. The corpus contains every character needed by that sentence, but not the sentence itself. This lets us check whether the representation can handle a new arrangement of familiar characters before trying unfamiliar symbols.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>

                  The fitted merging vocabulary has 137 entries after 85 merges and represents the held-out sentence with 25 IDs. That is a compact result for this text. Character and byte readings will use more positions for the same sentence, but they make different promises about unfamiliar input. We will compare those promises without treating a shorter sequence as sufficient evidence of better model behavior.
                </p>
                <KeepInMind>
                  {"The examples use eighteen English fitting sentences and a held-out sentence. They expose missing word-final symbols and unfamiliar scripts in this fitted vocabulary. A larger corpus can repair particular gaps; the byte method instead provides coverage independently of which texts were fitted."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The name that came back wrong">
                <p>
                  Encode the sentence against the merged table, then read the
                  numbers straight back and compare what returns against what
                  went in, character for character. It does not return. The
                  surname loses its last letter and the space after it, and the
                  next word runs into what is left.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis.\n" +
                    "Dr. Alvare[UNK]didn't expect the low-cost re-analysis."}
                </Equation>
                <p>The training corpus contains z inside size, but no word ending in z. This tokenizer distinguishes an interior character from its word-final form, so the needed final symbol is absent even though the visible letter occurred in training.</p>
                <p>The unknown-symbol ID cannot restore that missing letter or its word boundary. Decoding therefore joins the following word to the incomplete surname. Alphabet coverage must include the symbol variants the encoding scheme actually uses.</p>
                <KeepInMind>
                  A vocabulary learned from a corpus can fail on a text spelled
                  entirely in letters that corpus used, because what it holds are
                  the pieces the corpus happened to form and not the letters it
                  happened to contain.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. A sentence in a script the corpus never met">
                <p>
                  Now put something harder to the same table. The first text
                  below is our sentence, the second is the same sentence with two
                  Scandinavian letters in it, and the third is one short sentence
                  of Greek. What comes back after the numbers are read again is
                  underneath each.
                </p>
                <LearnedReadingFailures />
                <p>
                  {"The Greek input has 21 characters and becomes 18 IDs, seventeen of them the unknown ID. Decoding returns those stand-ins and a final period, with the spaces lost. The IDs no longer distinguish many of the original letters or boundaries. Another input that produces the same unknown pattern is indistinguishable to a model receiving only those IDs."}
                </p>
                <KeepInMind>
                  The stand-in destroys the difference between everything it
                  covers, so a text made mostly of unfamiliar pieces arrives as a
                  text with almost no information in it. Both texts below the
                  first are ordinary writing, and one of them was reduced to
                  eighteen numbers of which one is a full stop.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Two ways out, and the one this page takes">
                <p>
                  {"We can improve coverage by fitting on more representative text, or guarantee base coverage by including all permitted units. Those approaches can be combined: a learned vocabulary can retain complete byte fallback. Here we first examine characters and bytes without learned merges so their coverage and length are easy to compare."}
                </p>
                <p>
                  The second direction has two versions and they are not the same
                  one. Reading a text as its characters gives one number per
                  character, and reading it as its bytes gives one number per
                  byte. On the English sentence above those are the same length
                  and it is tempting to treat them as one idea. They are not, and
                  Part 4 is about exactly where they come apart.
                </p>
                <KeepInMind>
                  {"Character and byte inputs expose the difference between a fitted alphabet and a complete base inventory. Byte coverage prevents missing-byte lookups, often at the cost of more positions. The resulting runtime depends on how the model processes those positions."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Reading the Units the Text Is Already Made Of",
          content: (
            <>
              <SubSection title="5. Every character the corpus used">
                <p>
                  The first version takes the characters themselves as the
                  units. Gather every distinct character the corpus contains,
                  spaces and punctuation included, put them in a fixed order, and
                  the table is finished. There is no counting of pairs, no
                  merging, no size to choose and nothing to stop early. Fitting
                  is one pass that collects a set.
                </p>
                <p>
                  On the eighteen sentences that set has 36 members, so the table
                  has 37 entries once one is reserved to stand in for anything
                  else. Compare that with the 137 the merging produced from the
                  same text, and with the 256 the next section arrives at. A
                  character table is the smallest thing here that can still spell
                  the corpus it came from.
                </p>
                <WhyThisWorks title="Why the order is codepoint order and not first-seen order">
                  <p>
                    Any one-to-one assignment of numbers to entries works, so the
                    order is free to be chosen for another reason. Putting the
                    characters in the order Unicode gives them makes the table a
                    function of which characters the corpus used and of nothing
                    else, so shuffling the sentences and fitting again gives the
                    identical table. Ordering them by first appearance would make
                    the numbers depend on which sentence happened to arrive
                    first, which is a fact about the file rather than about the
                    language.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"This character table is fitted to the corpus and includes an unknown entry. It has fewer entries than the merged table in this example. Unlike the byte inventory below, its coverage can change when new text uses characters absent from the fitting corpus."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Every byte there is">
                <p>
                  {"Encode text as UTF-8 and treat each resulting byte as a unit. There are exactly 256 byte values, so a fixed inventory can cover all of them without fitting. Every successfully encoded input then has a byte sequence this inventory can represent. This guarantee does not include malformed input rejected by the UTF-8 encoder."}
                </p>
                <Equation>
                  {"a byte value  =  a whole number from 0 to 255\n" +
                    "the table     =  all 256 of them, in order\n" +
                    "the number    =  the byte value itself"}
                </Equation>
                <p>
                  The number an entry goes in as is the byte value, so there is nothing to look up in either direction. What does need a decision is how to write the entries down, since a table is read by people and 68 of the 256 values have nothing visible to stand for them, the control characters and the space among them.
                </p>
                <p>
                  The usual answer, and the one used here, lets the other 188 stand for themselves and lends those 68 a shape from a block of letters no byte value occupies, which is why the space shows up as Ġ in the playground above. The choice is arbitrary in every respect except that it is fixed, and it does not affect a single number.
                </p>
                <KeepInMind>
                  There is no stand-in entry here, deliberately. Nothing can be
                  unfamiliar to a table that already holds every byte value, so
                  an entry meaning &ldquo;something else&rdquo; could never
                  legitimately be reached, and a table that had one would hide a
                  fault behind a plausible-looking answer rather than showing it.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The Alvarez sentence as characters and bytes" id="7-the-running-sentence-taken-all-the-way-through">
                <p>
                  {"The running sentence contains 51 code points and 51 UTF-8 bytes. Its boundaries agree under both readings, but its IDs differ. The first four pieces below show how the fitted character positions differ from fixed byte values."}
                </p>
                <WorkedExample title="The first four pieces of the sentence, twice">
                  <Equation>
                    {"as bytes        D    r    .    ␣\n" +
                      "                68  114   46   32\n" +
                      "\n" +
                      "as characters   D    r    .    ␣\n" +
                      "                 7   28    4    1"}
                  </Equation>
                  <p>
                    Under the byte reading, 68 is the byte value of D and would
                    be 68 whatever corpus anybody had read. Under the character
                    reading, 7 is where D happens to sit once the 36 characters
                    of these eighteen sentences are put in order, and a corpus
                    without a capital A in it would have made D a 6. The two
                    tables agree about the cut and disagree about everything
                    after it.
                  </p>
                </WorkedExample>
                <p>
                  Read either run of numbers back and the sentence returns
                  character for character, including both full stops, the
                  apostrophe, the hyphens and every space. Neither reading
                  reached a stand-in, and the merged table on the same sentence
                  reached one and lost a space.
                </p>
                <KeepInMind>
                  {"Both readings reproduce this ASCII sentence with 51 positions. Non-ASCII characters can appear in English too. The agreement follows from this text’s encoded characters, rather than its language label."}
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Why there is no table with a row for every character">
                <p>
                  A reader who has followed section 6 will ask the obvious
                  question. If a byte table can be complete because there are only
                  256 byte values, why not a character table that is complete
                  because Unicode has a fixed number of characters? The number a
                  piece goes in as would simply be its codepoint, no corpus, no
                  stand-in, one number per character rather than one per byte.
                </p>
                <>
                  <p>
                    Allocating a learned row for every possible Unicode code point would
                    make a very large embedding table, including many rows that text
                    never uses. Compare that with one row per byte value at the same
                    width.
                  </p>
                  <Equation>{"code-point table = 1,114,112 × 768 = 855,638,016 values\nbyte table = 256 × 768 = 196,608 values\nstorage ratio = 1,114,112 / 256 = 4,352"}</Equation>
                  <p>
                    The smaller table is the attraction of byte inputs. Later sections
                    measure their cost in sequence length.
                  </p>
                </>
                <NumberTable
                  headings={["one entry per", "entries", "numbers at a width of 768"]}
                  rows={[
                    ["character the corpus used", "37", "28,416"],
                    ["piece merged from the corpus", "137", "105,216"],
                    ["byte value", "256", "196,608"],
                    ["codepoint Unicode has room for", "1,114,112", "855,638,016"],
                  ]}
                  caption="The first two are fitted to the eighteen sentences; the last two are the same whatever has been read."
                />
                <KeepInMind>
                  {"A separate 768-value row for every code-point slot would require the large table above. Byte inputs give complete base coverage with only 256 rows. Other designs can reduce storage through hashing, shared parameters or smaller representations; they need not abandon tables entirely."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "The merged table reads the sentence as 25 numbers and does not give it back. What went wrong?",
              [
                "The corpus never contained the letter z",
                "The corpus contains z but no word ending in z, and a letter at the end of a word is a different symbol",
                "The surname is longer than any merged piece",
                "The table was fitted to too few merges",
              ],
              1,
              "The held-out surname contains a character absent from the fitted vocabulary. Its unknown stand-in also loses the boundary information needed by this decoder, so the reconstructed surname and following contraction join together. The shorter sequence therefore fails two checks: preserving the original spelling and preserving its spacing. Inspect decoded text as well as token count.",
            ),
            trueFalse(
              "This Greek probe becomes seventeen unknown stand-ins followed by a period. Another probe with that same sequence cannot be distinguished from it by these IDs alone.",
              true,
              "All seventeen unseen Greek pieces map to the same reserved ID, while the final period keeps its own ID. Whitespace boundaries are also absent from this merged sequence. The IDs preserve very little of the original distinctions, and the model cannot reconstruct those distinctions from them alone.",
            ),
            choice(
              "The first piece of the sentence is D, which goes in as 68 under the byte reading and as 7 under the character reading. What could a different corpus change?",
              [
                "The 7 and not the 68",
                "The 68 and not the 7",
                "Both numbers",
                "Neither number",
              ],
              0,
              "The 68 is the byte value of D and would be 68 whatever anybody had read. The 7 is where D happens to sit once the 36 characters of these eighteen sentences are put in the order Unicode gives them, so a corpus without a capital A in it would have made D a 6. Shuffling the same sentences changes neither, since that order depends on which characters were used and on nothing else.",
            ),
            trueFalse(
              "The byte table has no stand-in entry because no text has yet needed one.",
              false,
              "It has none deliberately. Nothing can be unfamiliar to a table that already holds every byte value, so an entry meaning something else could never legitimately be reached, and a table that had one would hide a fault behind a plausible-looking answer rather than showing it.",
            ),
            choice(
              "Why is the complete table on this page the byte one rather than a table with a row per Unicode codepoint?",
              [
                "A codepoint table would still leave characters out",
                "At a width of 768 it would come to 855,638,016 values, more than many whole models",
                "Codepoints are not fixed, so the table would have to be refitted",
                "A codepoint table cannot give an exact round trip",
              ],
              1,
              "A table covering the entire Unicode code-point range would be much larger than a 256-entry byte table. A learned character table stays small by including only observed characters, but then needs a policy for unseen ones. Byte encoding uses a compact complete byte alphabet and represents some characters with several IDs. These are different coverage/storage tradeoffs, not proof that character tables are unaffordable in every design.",
            ),
        ],
        },
        {
          title: "Part 3. What the Fixed Alphabet Guarantees",
          content: (
            <>
              <SubSection title="9. Nothing can be unfamiliar, and what that sentence means exactly">
                <p>
                  A byte table contains all 256 possible byte values. Once text has been encoded successfully into bytes, every value in that encoded sequence has an entry; there is no missing-byte vocabulary case. The guarantee is about representing that byte sequence. The choice of text encoding and the handling of invalid input remain separate parts of the interface.
                </p>
                <Equation>
                  {"text  →  bytes  →  numbers  →  bytes  →  text"}
                </Equation>
                <p>
                  Notice what has happened to the argument. Coverage stopped
                  being a property of the corpus and became a property of the
                  scheme. A character table covers whatever its corpus covered
                  and no more, so its guarantee is a statement about eighteen
                  sentences; the byte table&rsquo;s guarantee is a statement about
                  arithmetic, and reading a million more texts would not improve
                  it because there is nothing left to improve.
                </p>
                <KeepInMind>
                  {"All twelve example sentences round trip under the byte reading. Given successful UTF-8 encoding and the matching correct decoder, preserving every byte guarantees reconstruction. A failure should prompt us to inspect the full encoding and decoding pipeline."}
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The table that grows and the table that cannot">
                <p>
                  The clearest way to see the difference is to let one language
                  arrive at a time. Start with the eighteen English sentences,
                  add one short sentence of French, then German, and so on
                  through twelve languages, counting after each how many distinct
                  characters everything so far has used and how many distinct byte
                  values it has touched.
                </p>
                <AlphabetGrowthChart />
                <p>
                  The character count starts at 36 and ends at 117, and it is
                  still climbing steeply at the last sentence, with Greek adding
                  13 and Russian another 13 and the Chinese sentence adding 4 more
                  from six characters of text. Nothing about that curve suggests
                  it is about to flatten, since Han alone has tens of thousands
                  of characters and these texts have met six of them. The byte table is
                  256 at every point on the chart, including at the left edge
                  before any of the twelve arrived.
                </p>
                <p>Across these thirty texts, 103 byte values are used. The complete byte vocabulary still reserves 256 entries, leaving 153 unused in this collection. That extra coverage lets the same vocabulary represent other encoded text, although it costs entries that this particular collection does not use.</p>
                <KeepInMind>
                  {"A fitted character inventory grows when new text introduces new code points. The fixed byte inventory remains at 256 entries, including byte values this collection never uses. That is a storage choice in exchange for corpus-independent base coverage."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. What the guarantee does not buy">
                <p>
                  {"The byte inventory guarantees coverage of successfully encoded bytes. It does not establish that a model understands the text or has learned useful patterns for a new language. Tokenization and model competence need separate tests."}
                </p>
                <p>
                  {"The Chinese example becomes 18 byte IDs and decodes exactly. That successful conversion does not tell us how a model trained on different text will use it. The model’s training and task performance, rather than byte coverage alone, determine whether those inputs support a useful answer."}
                </p>
                <InAModel>
                  <p>
                  {"The fitted merging example loses unfamiliar pieces before the model receives them. Byte coverage preserves those pieces for a model to process. That removes one representational failure, while leaving the learning problem unresolved. A learned tokenizer with complete byte fallback can also preserve them."}
                </p>
                </InAModel>
                <KeepInMind>
                  What the fixed alphabet removes is one specific failure, the
                  one where the writing cannot be represented at all. Every other
                  difficulty is still there and some of them are made worse, which
                  is Part 6.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. A Byte Is Not a Character",
          content: (
            <>
              <SubSection title="12. One character, one to four bytes">
                <p>
                  Our running sentence uses ASCII only, so each of its code points occupies one UTF-8 byte. That is why its character and byte counts agree. UTF-8 does not use a fixed number of bytes for every code point.
                </p>
                <p>
                  The selected é and θ below use two bytes, 报 uses three, and 👍 uses four. A script can include characters from more than one encoded range, so these are examples rather than fixed costs assigned to whole languages.
                </p>
                <NumberTable
                  headings={["one character", "bytes it takes"]}
                  rows={[
                    ["a Latin letter, r", "1"],
                    ["an accented Latin letter, é", "2"],
                    ["a Greek letter, θ", "2"],
                    ["a Han character, 报", "3"],
                    ["a raised thumb, 👍", "4"],
                  ]}
                  caption="Measured on one character at a time, so the count is the character’s own cost with nothing else in the text."
                />
                <p>
                  The sentence about Dr. Alvarez therefore comes to 51 positions under either reading, though the IDs have different meanings. An English sentence with an accented name, a curved quotation mark or an emoji can already need more bytes than code points.
                </p>
                <KeepInMind>
                  Every ASCII code point occupies one UTF-8 byte. Agreement on
                  these examples does not establish equal lengths for all English
                  writing or for other scripts.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Where the two readings stop agreeing about length">
                <p>
                  Put two more texts beside the sentence about Dr. Alvarez, the sentence
                  itself with a unit of length written into it that carries two
                  Scandinavian letters, and one short sentence of Greek, and the
                  disagreement appears immediately. The accented text is 69
                  characters and 71 bytes, since two of its characters take two
                  bytes each. The Greek sentence is 21 characters and 38 bytes,
                  nearly twice as many.
                </p>
                <NumberTable
                  headings={[
                    "text",
                    "characters",
                    "bytes",
                    "what the character reading could not spell",
                  ]}
                  rows={[
                    ["the sentence about Dr. Alvarez", "51", "51", "0"],
                    ["with two Scandinavian letters", "69", "71", "2"],
                    ["one sentence of Greek", "21", "38", "17"],
                  ]}
                  caption="The character table was fitted to eighteen English sentences, so the last column is a fact about those sentences rather than about characters."
                />
                <p>
                  {"The columns change for different reasons. Multi-byte characters raise the byte count under UTF-8 regardless of the fitting corpus. Missing-character substitutions depend on which characters the fitted alphabet contains. More representative fitting text can fix those substitutions; it does not change the UTF-8 byte lengths."}
                </p>
                <KeepInMind>
                  Wherever a text uses a character that needs more than one byte,
                  the character reading is the shorter of the two, and on the
                  Greek sentence it is shorter by seventeen numbers it spent
                  stand-ins on.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The round trip, each way">
                <p>
                  {"Encode each text and decode it immediately, without a model. Compare the returned string with the input. If they differ, inspect the tokenizer and decoder to see whether a rule discarded information, an unknown entry substituted it, or the implementation failed to reproduce it."}
                </p>
                <ByteCharacterRoundTrip />
                <p>
                  The byte round trip succeeds on all three tested inputs. The character vocabulary succeeds on the first, but replaces two characters in the second and seventeen in the third with its stand-in spelling. That is why the Scandinavian letters reappear as bracketed markers. The byte scheme avoids that vocabulary loss for successfully encoded input; exact text reconstruction also depends on using the matching decoding rules.
                </p>
                <p>
                  {"Both the character and merged examples lose spellings through unknown substitution. The character inventory covers more of these particular inputs. That is a result for the fitted alphabets and symbol rules here, rather than a guarantee for every character tokenizer."}
                </p>
                <KeepInMind>
                  {"The fitted character reading reconstructs inputs whose code points it covers. The byte reading reconstructs every successfully UTF-8-encoded input when decoded with its matching rules. Generated byte sequences can still be malformed, as the next example shows."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. A run of numbers that is not text">
                <p>
                  A Unicode code point uses between one and four bytes in UTF-8. A generated byte sequence may stop inside that encoding or contain another invalid arrangement. Every byte still has a table entry, but that fact alone does not make the sequence valid encoded text. The decoder needs an explicit policy for invalid sequences rather than treating vocabulary coverage as a decoding guarantee.
                </p>
                <Equation>
                  {"é          =  195  169\n" +
                    "195 alone  =  �\n" +
                    "169 alone  =  �"}
                </Equation>
                <p>
                  {"The replacement mark indicates that the decoder could not read a valid character sequence at that point. Byte 195 starts a two-byte sequence and needs a continuation; byte 169 is a continuation and cannot start a character by itself. An incremental decoder can buffer an unfinished prefix instead of immediately replacing it."}
                </p>
                <p>
                  Values from 0 to 127 are complete one-byte UTF-8 sequences, including ASCII letters and control characters. The remaining byte values do not decode as single characters on their own. Some continue a multi-byte sequence; some can begin one. Others, including 192 and 193 and values above 244, are forbidden in well-formed UTF-8.
                </p>
                <p>
                  A vocabulary entry for every byte therefore does not make every possible run of those entries valid text. The decoder must still interpret their sequence under the encoding rules.
                </p>
                <p>
                  {"Stopping a byte sequence can leave an unfinished character. For the Greek sentence, 17 of its 38 byte stopping points fall inside a letter. The 24-byte English example has none. A model interrupted after a complete character does not have this problem, so the stopping position matters."}
                </p>
                <PartialByteRun />
                <p>
                  {"For uniformly random byte runs, 546 of 2000 length-two samples are valid UTF-8, 209 at length four and 24 at length eight; none of the 2000 length-sixteen samples are valid. These counts concern uniform random bytes, not a trained model’s distribution. A generative model must learn useful sequence patterns, and a decoder still needs a malformed-output policy."}
                </p>
                <KeepInMind>
                  {"This SDK uses replacement characters for malformed final byte sequences. Rejecting the sequence or buffering an incomplete prefix are other interface choices. The Greek prefix test has 17 unfinished stopping points out of 38, so choose the behavior deliberately when displaying partial generation."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "One sentence of each of twelve languages is added in turn. What happens to the two table sizes?",
              [
                "Both climb, the character count faster",
                "The character count climbs from 36 to 117 and is still rising, while the byte table is 256 at every point",
                "The character count settles once Greek and Russian have been added",
                "The byte table grows to 103, which is what the twelve texts touch",
              ],
              1,
              "Nothing about that curve suggests it is about to flatten, since Han alone has tens of thousands of characters and these texts have met six of them. Only 103 byte values are ever touched by all thirty texts, so 153 entries are carried unused, which is what the guarantee costs when it is paid in entries rather than in coverage.",
            ),
            trueFalse(
              "Because every byte value is in the table, a model that has only ever read English can read a Chinese sentence.",
              false,
              "The byte tokenizer can encode the Chinese text without unknown pieces. That guarantees representation at this boundary, not that an English-trained model understands its language or performs the task. Model capability still depends on training and evaluation. A vocabulary failure and a model-capability failure occur at different stages.",
            ),
            choice(
              "Why did the sentence about Dr. Alvarez come to 51 numbers under both readings?",
              [
                "The two tables were fitted to the same corpus",
                "It is written entirely in characters that take one byte each, so the two readings cut it in the same places",
                "The character table reserves an entry for anything else, which makes up the difference",
                "Both readings drop the spaces",
              ],
              1,
              "Every code point in this particular sentence belongs to ASCII, whose UTF-8 representation uses one byte each. Its byte and code-point counts therefore agree. English text can still contain accented names, typographic punctuation or emoji, so English alone does not guarantee equal counts. UTF-8 length depends on the code points actually present.",
            ),
            trueFalse(
              "The learned character tokenizer preserves this text exactly when all its characters are in the vocabulary; the byte tokenizer covers every UTF-8-encodable input string.",
              true,
              "On these probes, the character tokenizer preserves the familiar sentence but substitutes unknown entries for unfamiliar accented and Greek characters. The byte tokenizer preserves each complete UTF-8 encoding exactly. That guarantee concerns the complete encoded input; arbitrary generated byte sequences or prefixes can still be invalid UTF-8.",
            ),
            several(
              "A run of byte numbers can stop part way through a character. Which of these hold of such a run?",
              [
                "Exactly 128 of the 256 numbers stand for a character on their own",
                "17 of the Greek sentence’s 38 stopping points land in the middle of a letter, against none of the English sentence’s 24",
                "It is an unfamiliar piece, so it comes back as the stand-in",
                "It arises only when the input was malformed",
              ],
              [0, 1],
              "ASCII bytes each form a complete character, while bytes above that range cannot stand alone as valid UTF-8 characters. A prefix ending inside a multibyte sequence is incomplete. This decoder replaces such incomplete sequences when each prefix is decoded separately. A streaming decoder could instead buffer them until more bytes arrive or the stream ends.",
            ),
        ],
        },
        {
          title: "Part 5. The Cost, and Who Pays It",
          content: (
            <>
              <SubSection title="16. Length against a vocabulary that was learned">
                <p>
                  {"Compare the lengths on familiar text. The merged vocabulary uses 25 IDs for the running sentence; byte reading uses 51. Across the eighteen-sentence corpus, the totals are 263 and 763, giving the displayed length ratio of 2.90. These counts describe the supplied corpus, rather than English text in general."}
                </p>
                <NumberTable
                  headings={["reading", "the sentence", "the corpus", "entries"]}
                  rows={[
                    ["pieces merged from the corpus", "25", "263", "137"],
                    ["every character the corpus used", "51", "763", "37"],
                    ["every byte value", "51", "763", "256"],
                  ]}
                  caption="One sentence and eighteen sentences, all counted in numbers, and the sentence is not in the corpus."
                />
                <InAModel>
                  <p>
                  {"Suppose we concatenate each complete corpus reading into one sequence and apply an operation that compares every position with every other position. Its pair count grows with the square of sequence length, so the squared length ratio below estimates that operation’s work ratio. Processing sentences separately would instead require summing their individual pair counts."}
                </p>
                  <Equation>
                    {"763 / 263    ≈  2.90\n" + "2.90 × 2.90  ≈  8.4"}
                  </Equation>
                  <p>
                  {"Under that combined-sequence assumption, the roughly threefold length increase gives roughly eight times as many position pairs. A fixed token context budget would also fit less of this text under byte reading. Other operations and batching choices can have different costs."}
                </p>
                  <p>
                    That is why reading bytes is expensive rather than merely long, and why it is usually paired with a step that groups the bytes back into larger units before the expensive part of the model sees them.
                  </p>
                </InAModel>
                <KeepInMind>
                  {"Byte reading takes about two to three times as many positions as this fitted merging vocabulary on the supplied examples. This is a measured length comparison, not a fixed multiplier for every text or byte-based model."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Two numbers, and they move against each other">
                <p>
                  Compare table size with sequence length. On these examples, the byte table has 256 entries and ties for the longest sequences. The character table has 37 entries and gives sequences of the same length. The merged table lies between them in entry count and gives the shortest sequences. There is no single ordering that makes one representation smallest in both respects.
                </p>
                <p>

                  On this corpus, the byte reading carries nearly seven times the entries for the same sequence length and exact round trip. Those measurements favor the fitted character table on these examples. They do not settle English writing in general, because a new accented name can exceed the fitted alphabet. Coverage on new text remains part of the comparison.
                </p>
                <KeepInMind>
                  On this basic-English example, byte encoding does not shorten the sequence. Its fixed alphabet becomes more useful when the input contains characters absent from the training corpus. We should test that case before judging the representation from familiar English text alone.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The bill measured per character">
                <p>
                  So take one short sentence with one meaning, the report arrived
                  late, and write it in twelve languages. The ratio between the
                  two readings on each is the multiplier the byte reading charges
                  for that writing system, and it is not a small spread.
                </p>
                <ScriptCostChart />
                <p>
                  English pays exactly 1.00, since every character it uses takes
                  one byte. French, German and Spanish pay between 1.03 and 1.04,
                  because only one character in each sentence is accented, and
                  Polish pays 1.15. Greek pays 1.81, Russian 1.85 and Arabic 1.84,
                  which is two bytes a letter diluted by the spaces and the full
                  stop, which take one each. Japanese and Chinese pay exactly
                  3.00, since every character in both sentences takes three bytes
                  and neither sentence contains a space.
                </p>
                <WorkedExample title="Where the Greek sentence’s 1.81 comes from">
                  <p>
                    The Greek sentence is 21 characters. Seventeen of them are
                    Greek letters at two bytes each, and the other four are
                    three spaces and a full stop at one byte each.
                  </p>
                  <Equation>
                    {"Η έκθεση έφτασε αργά.\n" +
                      "\n" +
                      "letters               17 × 2  =  34 bytes\n" +
                      "spaces and stop        4 × 1  =   4 bytes\n" +
                      "\n" +
                      "bytes                 34 + 4  =  38\n" +
                      "bytes per character  38 / 21  ≈  1.81"}
                  </Equation>
                  <p>
                  {"In the Greek, Russian and Arabic examples, letters take two bytes while the spaces and final period take one. Those separators bring each sentence’s average below two bytes per code point. A sequence containing only two-byte code points would reach two; other punctuation can have different byte lengths."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  {"Bytes per code point differ across these examples. English is at 1.00 and Chinese at 3.00, but that ratio alone does not compare the total input positions for an equivalent message. The next table counts those totals."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The bill measured per sentence, which is a different answer">
                <p>
                  {"The same message can use different numbers of code points in different writing systems. Compare the total byte IDs per supplied sentence as well as the bytes per code point. The ordering changes because those are different measurements."}
                </p>
                <NumberTable
                  headings={["language", "characters", "bytes", "bytes per character"]}
                  rows={[
                    ["Chinese", "6", "18", "3.00"],
                    ["Polish", "20", "23", "1.15"],
                    ["English", "24", "24", "1.00"],
                    ["Spanish", "23", "24", "1.04"],
                    ["German", "24", "25", "1.04"],
                    ["Japanese", "11", "33", "3.00"],
                    ["Korean", "13", "33", "2.54"],
                    ["French", "32", "33", "1.03"],
                    ["Arabic", "19", "35", "1.84"],
                    ["Russian", "20", "37", "1.85"],
                    ["Greek", "21", "38", "1.81"],
                    ["Hindi", "18", "48", "2.67"],
                  ]}
                  caption="The same sentence twelve ways, ordered by what the byte reading actually charges for it."
                />
                <p>
                  The Chinese sentence is the cheapest of the twelve. It pays the worst multiplier on the page and still costs 18 numbers against English&rsquo;s 24, because it says the same thing in six characters where English takes twenty-four. Hindi is the most expensive at 48, twice the English figure, and it gets there with fewer characters than English uses.
                </p>
                <p>
                  {"Bytes per code point and tokens per message measure different costs. Chinese and Japanese have the largest ratios here, while Hindi has the largest total byte count. One short translation per language cannot establish a general language multiplier. The supplied text and tokenizer both matter."}
                </p>
                <WhyThisWorks title="Why a shorter reading can still be an empty one">
                  <p>
                    It is tempting to conclude from this that a short reading is a
                    good one, and the merged vocabulary from Part 1 is the
                    counterexample. It reads the English sentence as 8 numbers,
                    every one of them a real piece, and it reads the Chinese
                    sentence as 6 numbers, every one of them the stand-in. The
                    shorter reading is the one that carries nothing. Sequence
                    length is only comparable between two readings that both
                    represent the text.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"Report both the ratio and the total, with the input text. They answer different cost questions. A broader comparison between languages would need representative collections rather than one translation each."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What Counts as One Character?" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="20. What counts as one character has to be decided">
                <p>
                  Reading a text as its characters requires knowing what one
                  character is, and that question has no answer the method
                  supplies. The obvious reading is one codepoint, which is what
                  every count on this page uses, and it disagrees with what a
                  reader would point at in several ordinary cases.
                </p>
                <p>
                  The word café can use one code point for the accented letter,
                  or an e followed by a combining acute accent. A code point is
                  the numerical identifier Unicode assigns to a character or
                  other encoded unit. These spellings contain four and five code
                  points respectively, even when they look identical to a reader.
                  Their UTF-8 encodings use five and six bytes.
                </p>
                <p>
                  Comparing the raw code-point sequences distinguishes the two
                  spellings. Unicode normalization can instead put canonically
                  equivalent spellings into a shared form. A tokenizer that does
                  no such normalization may therefore give them different IDs;
                  one that normalizes first may treat them alike. We need to know
                  which operation was applied before interpreting the result.
                </p>
                <p>

                  A displayed emoji can also contain several code points. The
                  tinted thumb, family and Welsh flag used in the table below
                  contain two, five and seven respectively. Other family emoji
                  sequences can have different lengths. A reader can still
                  recognize each displayed example as one mark.
                </p>
                <NumberTable
                  headings={["one thing a reader would point at", "characters", "bytes"]}
                  rows={[
                    ["café, with one entry for the accented letter", "4", "5"],
                    ["café, with the accent as a mark of its own", "5", "6"],
                    ["a raised thumb", "1", "4"],
                    ["the same thumb, tinted", "2", "8"],
                    ["a family", "5", "18"],
                    ["the flag of Wales", "7", "28"],
                  ]}
                  caption="Every one of these comes back exactly under the byte reading, which does not need to have an opinion about any of it."
                />
                <p>
                  Counting code points is straightforward, but can split a mark
                  a reader considers single. Unicode&apos;s extended grapheme clusters
                  group code points into useful units for operations such as
                  moving a text cursor. They approximate user-perceived
                  characters under documented rules; language and application
                  needs can still require tailoring.
                </p>
                <p>
                  Normalizing first answers a separate question about equivalent
                  spellings. It can make the two cafés share a representation,
                  but does not guarantee one code point per visible mark. It also
                  changes the original sequence, so exact reconstruction needs
                  additional information if that distinction matters.
                </p>
                <p>
                  The byte reading avoids the question entirely, and pays for that by having no notion of a character at all.
                </p>
                <KeepInMind>
                  State whether a length counts bytes, code points or grapheme
                  clusters, and whether normalization happened first. The
                  character counts on this page count code points in the supplied
                  spelling. A different choice can produce a different length.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. A byte carries no meaning, and no notion of how often it occurs">
                <p>
                  {"A byte value is a storage unit, not a predefined word or meaning. The model has to learn patterns across byte sequences, including spellings and their uses. Shared patterns can transfer across words and languages; nothing here requires learning every form entirely from scratch or finishing spelling before learning meaning."}
                </p>
                <p>
                  {"Longer token sequences can also separate related passages by more positions. If a passage followed this corpus’s 2.90 length ratio, a thousand merged-token positions would become about 2,900 byte positions. That is a hypothetical use of the measured ratio; the ratio for a particular paragraph must be counted."}
                </p>
                <p>
                  {"This fixed byte inventory does not allocate a shorter code just because a word is common. The word “the” still requires three byte IDs for its three ASCII letters. Learned merging can give recurring sequences their own entries. That can shorten them, though frequency is not the only design choice a learned tokenizer can make."}
                </p>
                <p>
                  The longer sequence is the cost of using a complete byte alphabet here. A later grouping stage can reduce the number of positions processed together, but it needs its own rule for choosing groups. We should keep that grouping decision separate from the byte table&apos;s coverage guarantee.
                </p>
                <KeepInMind>
                  {"Character and byte readings supply small units without learned multi-character pieces. The model or a later grouping stage must handle larger patterns. Their sequence-length cost depends on the text; the nearly threefold corpus ratio above is one example."}
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Encoding choices and text that cannot be recovered" id="22-where-the-method-has-nothing-to-say">
                <p>We have to choose what a character means before assigning IDs. We also need a policy for malformed input and text the chosen representation cannot recover. The byte and codepoint routes make different promises in these cases.</p>
                <DerivationTable
                  expressionHeading="Text or encoding condition"
                  reasonHeading="What the representation must decide"
                  rows={[
                    {
                      expression: "a character the corpus never used",
                      reason:
                        "This fitted character vocabulary uses its unknown entry for an absent code point. A fixed byte vocabulary covers all successfully encoded byte values. A finite fitting corpus may miss a later character, but not every later text must introduce one.",
                    },
                    {
                      expression: "what counts as one character",
                      reason:
                        "a choice that must be stated. Code-point counts can split one displayed mark into several units. Extended grapheme clusters approximate user-perceived characters under Unicode’s segmentation rules. Normalization is a separate preprocessing choice; it can merge canonical spellings without guaranteeing one code point per mark. The character counts on this page count the supplied code points.",
                    },
                    {
                      expression: "a run of numbers that stops mid-character",
                      reason:
                        "A final incomplete UTF-8 sequence is malformed. Of 256 byte values, 128 do not form complete single-byte characters. In the Greek example, 17 of 38 byte stopping points are unfinished. A decoder can replace or reject malformed final input; an incremental decoder can buffer a valid but unfinished prefix.",
                    },
                    {
                      expression: "a number outside the table",
                      reason:
                        "an invalid ID for this vocabulary. Its 256 entries use IDs 0 to 255, so 256 has no associated byte. Validate IDs supplied through an API. A model whose output head selects only among those 256 entries cannot normally generate 256 through that selection; this case concerns malformed or incompatible input to the decoder.",
                    },
                    {
                      expression: "a run of codepoints that is not text",
                      reason:
                        "outside strict UTF-8’s input contract. A Python string can contain an isolated surrogate code point, but a surrogate is not a Unicode scalar value and the strict UTF-8 encoder rejects it. State the malformed-input policy rather than treating every possible Python string as well-formed Unicode text.",
                    },
                    {
                      expression: "a text with nothing in it",
                      reason:
                        "defined, and it is the empty run of numbers under both readings. Three spaces are three numbers under both, since a space is a character and a byte like any other, and this is the one place these readings are less surprising than a scheme that cuts at spaces.",
                    },
                    {
                      expression: "which encoding the bytes are in",
                      reason:
                        "assumed rather than derived, and it is the assumption the whole page rests on. The same text in a different encoding is a different run of bytes and therefore different numbers, so a model trained on bytes is trained on one encoding. Nothing in a run of bytes says which one it is, which is why the choice has to be fixed once and stated.",
                    },
                    {
                      expression: "how often a piece occurs",
                      reason:
                        "Neither fixed reading shortens a sequence because it is frequent. Character count and UTF-8 byte length determine these positions. Learned merges can compress recurring patterns while retaining complete byte fallback, so frequency compression and coverage can coexist.",
                    },
                    {
                      expression: "whether the sequence length is affordable",
                      reason:
                        "Count positions on the target text, then measure the model’s cost. Dense pairwise attention grows quadratically in one sequence’s length, while other operations scale differently. Grouping bytes into larger units can reduce later work without changing the base inventory’s coverage.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"Specify the input encoding, the unit being counted and the malformed-input policy. Complete byte coverage prevents missing-byte vocabulary entries; it does not make every arbitrary byte sequence valid UTF-8 or decide what a reader perceives as one character."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            several(
              "What does refusing to learn a vocabulary cost, as measured on this page?",
              [
                "Two to three times the sequence length on English, 263 pieces against 763 across the corpus",
                "Around eight times the work in a model whose cost grows with the square of the sequence length",
                "Three numbers for the word the every time it appears, however common it is",
                "The exact round trip",
              ],
              [0, 1, 2],
              "The byte tokenizer guarantees coverage using a fixed 256-entry table, but gives every UTF-8 byte its own ID. The character tokenizer gives each known code point one ID. Neither combines recurring multi-character pieces, which is the sequence-length saving the later learned vocabularies pursue. The cost differs across the actual characters and text being encoded.",
            ),
            trueFalse(
              "For the supplied ASCII English probe, byte tokenization uses more vocabulary entries without reducing sequence length compared with the fitted character tokenizer.",
              true,
              "The byte table has 256 entries versus 37, while both encode this probe in 51 IDs and recover it exactly. The character table therefore uses less vocabulary storage for this example at the same sequence length. The byte table’s extra entries provide broader coverage, which the ASCII probe does not exercise.",
            ),
            choice(
              "Measured by the numbers a model is actually charged for, which of the twelve sentences is cheapest?",
              ["English, at 24", "Chinese, at 18", "Greek, at 38", "Hindi, at 48"],
              1,
              "The supplied Chinese sentence has the smallest total byte count despite needing three bytes per code point. Its wording uses fewer code points than the English translation. Hindi has the largest byte count in this small collection. Writing-system encoding and translation length both contribute, so one example per language cannot establish a universal ranking.",
            ),
            trueFalse(
              "A shorter reading of a text is the better reading of it.",
              false,
              "The merged vocabulary reads the English sentence as 8 numbers, every one of them a real piece, and the Chinese sentence as 6 numbers, every one of them the stand-in. The shorter reading is the one that carries nothing. Sequence length is only comparable between two readings that both represent the text.",
            ),
            choice(
              "The word café can be written two ways that look identical on the page. What follows?",
              [
                "They are the same text, since nothing visible distinguishes them",
                "They are 4 characters and 5 characters, and different texts by every comparison a computer makes",
                "Rewriting both into one preferred spelling costs nothing",
                "The byte reading can tell them apart and the character reading cannot",
              ],
              1,
              "A precomposed accented letter and a base letter followed by a combining mark can look identical while having different code points and UTF-8 bytes. A tokenizer initially receives different strings; whether a model treats them similarly depends on its processing and training. Normalizing both to one representation removes that source distinction unless it is recorded separately. State whether character counts mean code points, user-perceived characters or bytes.",
            ),
        ],
        },
        {
          title: "Practice. Reading Text as Bytes and as Characters",
          practice: [
            exercise(
              "Read three texts as characters and as bytes",
              [
  "A character table can only name characters it has learned. A byte table already has an entry for every byte. Compare what happens when each meets unfamiliar letters.",
  "Fit CharacterTokenizer on corpus. Construct ByteTokenizer without fitting it. Print the vocabulary sizes, then encode every text in texts in its listed order.",
  "For each text and tokenizer, print the number of token IDs, the number of unknown stand-ins, and whether decoding its IDs exactly recovers the original string. Use the labels and line layout shown in Expected output."
],
              `from oop_ml import ByteTokenizer, CharacterTokenizer

corpus = [
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
texts = {
    "running": "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "accented": "Dr. Alvarez didn't expect the low-cost re-analysis in Ångström units.",
    "greek": "Η έκθεση έφτασε αργά.",
}

# Fit a CharacterTokenizer on the corpus and build a ByteTokenizer, and
# print how many entries each table holds. Then, for each text under each
# reading, print the count of numbers, the count of tokens whose text is
# the table's unknown token, and whether decode gives the text back.`,
              `from oop_ml import ByteTokenizer, CharacterTokenizer

corpus = [
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
texts = {
    "running": "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "accented": "Dr. Alvarez didn't expect the low-cost re-analysis in Ångström units.",
    "greek": "Η έκθεση έφτασε αργά.",
}

readings = {"characters": CharacterTokenizer().fit(corpus), "bytes": ByteTokenizer()}
for name, reading in readings.items():
    print(f"{name} table: {reading.vocabulary.n_tokens} entries")

for label, text in texts.items():
    for name, reading in readings.items():
        encoding = reading.encode(text)
        stand_in = reading.vocabulary.unknown_token
        unseen = sum(token.text == stand_in for token in encoding)
        exact = reading.decode(encoding.ids) == text
        print(f"{label:9s} {name:10s} {encoding.n_tokens} numbers  {unseen} unseen  exact {exact}")`,
              `characters table: 37 entries
bytes table: 256 entries
running   characters 51 numbers  0 unseen  exact True
running   bytes      51 numbers  0 unseen  exact True
accented  characters 69 numbers  2 unseen  exact False
accented  bytes      71 numbers  0 unseen  exact True
greek     characters 21 numbers  17 unseen  exact False
greek     bytes      38 numbers  0 unseen  exact True`,
              {
question: "Can both tokenizers preserve text they did not learn?",
 hints: [
  "CharacterTokenizer().fit(corpus) learns the character table. ByteTokenizer() needs no corpus.",
  "encoding.n_tokens counts IDs. Iterating an encoding gives tokens with text; compare that text with the vocabulary’s unknown_token. A byte vocabulary has no unknown token.",
  "Pass encoding.ids to decode and compare the returned string with the original using ==. A shorter encoding can still have lost information."
], check: numberCheck("How many numbers does the Greek sentence become under the byte reading?", 38, 0.0, "The Greek probe needs 38 byte IDs and is recovered exactly. Its shorter character encoding contains unknown stand-ins, so the count alone does not measure how much information was retained.") },
            ),
            exercise(
              "Charge one sentence in twelve languages",
              [
  "The supplied dictionary expresses a short message in twelve languages. Measure the length of each supplied translation rather than assuming that equal meaning gives equal token counts.",
  "Encode each translation with ByteTokenizer. Print its language label, Python character count, byte-token count and bytes per character to two decimal places.",
  "Finish with the total character and byte counts and their overall ratio. Keep the dictionary’s order. Print the language labels rather than the translations so the report works in consoles without every script."
],
              `from oop_ml import ByteTokenizer

sentences = {
    "English": "The report arrived late.",
    "French": "Le rapport est arrivé en retard.",
    "German": "Der Bericht kam zu spät.",
    "Spanish": "El informe llegó tarde.",
    "Polish": "Raport dotarł późno.",
    "Greek": "Η έκθεση έφτασε αργά.",
    "Russian": "Отчёт пришёл поздно.",
    "Arabic": "وصل التقرير متأخرا.",
    "Hindi": "रिपोर्ट देर से आई।",
    "Korean": "보고서가 늦게 도착했다.",
    "Japanese": "報告書は遅れて届いた。",
    "Chinese": "报告迟到了。",
}
reading = ByteTokenizer()

# For each language, encode its sentence and print the language, the
# number of characters, the number of bytes, and the ratio to two places.
# Keep running totals of both counts and print them with their ratio.`,
              `from oop_ml import ByteTokenizer

sentences = {
    "English": "The report arrived late.",
    "French": "Le rapport est arrivé en retard.",
    "German": "Der Bericht kam zu spät.",
    "Spanish": "El informe llegó tarde.",
    "Polish": "Raport dotarł późno.",
    "Greek": "Η έκθεση έφτασε αργά.",
    "Russian": "Отчёт пришёл поздно.",
    "Arabic": "وصل التقرير متأخرا.",
    "Hindi": "रिपोर्ट देर से आई।",
    "Korean": "보고서가 늦게 도착했다.",
    "Japanese": "報告書は遅れて届いた。",
    "Chinese": "报告迟到了。",
}
reading = ByteTokenizer()

total_characters = 0
total_bytes = 0
for language, sentence in sentences.items():
    n_bytes = reading.encode(sentence).n_tokens
    total_characters += len(sentence)
    total_bytes += n_bytes
    print(f"{language:9s} {len(sentence):3d} characters {n_bytes:3d} bytes  {n_bytes / len(sentence):.2f}")

print(f"all twelve: {total_characters} characters, {total_bytes} bytes")
print(f"bytes per character over all twelve: {total_bytes / total_characters:.2f}")`,
              `English    24 characters  24 bytes  1.00
French     32 characters  33 bytes  1.03
German     24 characters  25 bytes  1.04
Spanish    23 characters  24 bytes  1.04
Polish     20 characters  23 bytes  1.15
Greek      21 characters  38 bytes  1.81
Russian    20 characters  37 bytes  1.85
Arabic     19 characters  35 bytes  1.84
Hindi      18 characters  48 bytes  2.67
Korean     13 characters  33 bytes  2.54
Japanese   11 characters  33 bytes  3.00
Chinese     6 characters  18 bytes  3.00
all twelve: 231 characters, 371 bytes
bytes per character over all twelve: 1.61`,
              {
question: "How many byte tokens do equivalent messages need in different scripts?",
 hints: [
  "len(text) counts Python Unicode code points. ByteTokenizer.encode(text).n_tokens counts UTF-8 bytes.",
  "Accumulate both counts across the translations. Calculate the overall ratio from those totals, rather than averaging the individual ratios."
], check: numberCheck("How many numbers do the twelve sentences cost altogether under the byte reading?", 371, 0.0, "The supplied translations require 371 byte tokens altogether. Their lengths reflect both the writing system and the wording of each translation; this small comparison does not establish a universal cost for a language.") },
            ),
            exercise(
              "Stop a run of byte numbers at every position",
              [
  "A complete UTF-8 character may occupy several bytes. Test whether a stream stopped after any individual byte can still be decoded without a replacement character.",
  "For the Greek, English and Chinese strings in the starter, encode the complete text, then decode every nonempty prefix of its IDs, including the complete sequence.",
  "Count prefixes whose decoded string contains the Unicode replacement character, and print that count beside the number of stopping positions for each language."
],
              `from oop_ml import ByteTokenizer

sentences = {
    "Greek": "Η έκθεση έφτασε αργά.",
    "English": "The report arrived late.",
    "Chinese": "报告迟到了。",
}
BROKEN = "\\ufffd"
reading = ByteTokenizer()

# For each sentence, take the ids of its encoding as a list. For every
# cut from 1 to the number of ids, decode the first cut ids and count the
# cuts whose decoded string contains BROKEN. Print the count for each.`,
              `from oop_ml import ByteTokenizer

sentences = {
    "Greek": "Η έκθεση έφτασε αργά.",
    "English": "The report arrived late.",
    "Chinese": "报告迟到了。",
}
BROKEN = "\\ufffd"
reading = ByteTokenizer()

for language, sentence in sentences.items():
    numbers = list(reading.encode(sentence).ids)
    broken = 0
    for cut in range(1, len(numbers) + 1):
        if BROKEN in reading.decode(numbers[:cut]):
            broken += 1
    print(f"{language}: {broken} of {len(numbers)} stopping points are not text")`,
              `Greek: 17 of 38 stopping points are not text
English: 0 of 24 stopping points are not text
Chinese: 12 of 18 stopping points are not text`,
              {
question: "What happens if a byte stream stops in the middle of a character?",
 hints: [
  "Convert encoding.ids to a list, then slice it at cut positions from 1 through its full length.",
  "The byte decoder replaces an incomplete UTF-8 sequence with the character �. Test whether that character occurs in each decoded prefix.",
  "A stopping position between characters is complete even when the next character would need several bytes."
], check: numberCheck("How many of the Chinese probe’s 18 byte prefixes end inside a UTF-8 character?", 12, 0.0, "Twelve Chinese prefixes end inside a multibyte character. The complete eighteen-byte sequence still decodes correctly; the failures concern stopping positions, not the ability to represent the complete message.") },
            ),
            exercise(
              "Price the byte reading against a vocabulary that was learned",
              [
  "The byte tokenizer preserves the complete text but spends an ID on every byte. Compare that length with a vocabulary learned from the supplied eighteen sentences.",
  "Fit BytePairEncoding on corpus with vocabulary_size=300 and byte_fallback=False. Print the fitted vocabulary size and merge count. Encode the Dr. Alvarez sentence, then print its token count and decoded text.",
  "Add the token counts over corpus for the fitted tokenizer and for ByteTokenizer. Print both totals and the byte total divided by the merged total, rounded to two decimal places. Check the decoded sentence as well as the length."
],
              `from oop_ml import BytePairEncoding, ByteTokenizer

corpus = [
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

# Fit BytePairEncoding(byte_fallback=False, vocabulary_size=300) on the
# corpus and print its table size and number of merges. Encode the
# sentence, print how many numbers it became and what they decode to.
# Then total the numbers the corpus costs under the merged reading and
# under a ByteTokenizer, and print both with their ratio to two places.`,
              `from oop_ml import BytePairEncoding, ByteTokenizer

corpus = [
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

merged = BytePairEncoding(byte_fallback=False, vocabulary_size=300).fit(corpus)
print(f"{merged.vocabulary.n_tokens} entries after {merged.n_merges} merges")

encoding = merged.encode(sentence)
print(f"the sentence: {encoding.n_tokens} numbers")
print(merged.decode(encoding.ids))

reading = ByteTokenizer()
merged_cost = sum(merged.encode(text).n_tokens for text in corpus)
byte_cost = sum(reading.encode(text).n_tokens for text in corpus)
print(f"the corpus: {merged_cost} merged, {byte_cost} as bytes")
print(f"ratio {byte_cost / merged_cost:.2f}")`,
              `137 entries after 85 merges
the sentence: 25 numbers
Dr. Alvare[UNK]didn't expect the low-cost re-analysis.
the corpus: 263 merged, 763 as bytes
ratio 2.90`,
              {
question: "How much shorter is a learned vocabulary, and what can it fail to preserve?",
 hints: [
  "The requested vocabulary size is a ceiling. The learner can stop before reaching it when no eligible repeated pair remains.",
  "Use vocabulary.n_tokens and n_merges for the learned table. Sum encode(text).n_tokens separately over the same corpus for each tokenizer.",
  "The held-out surname contains a character position the fitted vocabulary cannot spell. decode reveals the resulting substitution and spacing loss."
], check: numberCheck("How many times as many numbers does the corpus cost as bytes as it does merged, to two places?", 2.9, 0.005, "The byte encoding is about 2.90 times as long on this corpus. That is a result for these sentences and settings. The learned encoding is shorter here but fails the held-out sentence’s exact round trip.") },
            ),
          ],
        },
      ]}
    />
  );
}
