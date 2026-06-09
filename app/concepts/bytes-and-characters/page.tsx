import type { Metadata } from "next";
import Link from "next/link";
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
import { AlphabetGrowthChart } from "@/components/widgets/AlphabetGrowthChart";
import { ByteCharacterExplorer } from "@/components/widgets/ByteCharacterExplorer";
import { ByteCharacterRoundTrip } from "@/components/widgets/ByteCharacterRoundTrip";
import { LearnedReadingFailures } from "@/components/widgets/LearnedReadingFailures";
import { PartialByteRun } from "@/components/widgets/PartialByteRun";
import { ScriptCostChart } from "@/components/widgets/ScriptCostChart";

export const metadata: Metadata = {
  title: "Bytes and Characters · oop_ml",
  description:
    "Read a text as the bytes or the characters it is already made of, so that no piece can ever be unfamiliar, and pay for it in length.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function BytesAndCharactersPage() {
  return (
    <ConceptPage
      title="Bytes and Characters"
      tagline="Read a text as the units it is already made of, so that no piece can ever be unfamiliar, and pay for it in length."
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
      history={
        <>
          <p>
            Ken Thompson and Rob Pike had a concrete problem at Bell Labs in
            1992. Plan 9 was being rewritten to hold text from every writing
            system rather than only from Latin ones, and every tool in it read a
            file as a stream of bytes. A proposal in front of the X/Open group
            would have let a byte belonging to one character reappear in the
            middle of another, which meant that searching for a short string
            could match in the middle of a longer one and that no program could
            tell, from a byte, whether it was standing at the start of a
            character. On the second of September, over dinner in a New Jersey
            diner, Thompson worked out the encoding now called UTF-8 and sketched
            it on a placemat, and the two of them had Plan 9 converted within the
            week. Pike and Thompson described it the following January at the
            USENIX conference in a paper whose title is written in three scripts,
            &ldquo;Hello World, or Καλημέρα κόσμε, or こんにちは 世界&rdquo;. The
            property Thompson insisted on that evening, that a byte announces
            whether it begins a character or continues one, is the reason section
            15 can say of any stopping point in a run of bytes whether it lands
            in the middle of a letter.
          </p>
          <p>
            Reading a text one character at a time is older than any of that as a
            way of building a model, and it kept being returned to for one
            reason. Ilya Sutskever, James Martens and Geoffrey Hinton, at
            Toronto in 2011, trained a recurrent network to generate English
            one character at a time in &ldquo;Generating Text with Recurrent
            Neural Networks&rdquo;, and Alex Graves did the same in
            &ldquo;Generating Sequences With Recurrent Neural Networks&rdquo; in
            2013. What they were escaping was a word vocabulary of a hundred
            thousand entries that still could not spell a name, and what they
            paid was that the model had to assemble every word out of letters
            before it could learn anything about the word. Yoon Kim, Yacine
            Jernite, David Sontag and Alexander Rush kept both halves in
            &ldquo;Character-Aware Neural Language Models&rdquo; in 2016 by
            reading a word through its characters and then predicting whole
            words.
          </p>
          <p>
            The byte answer arrived with the large models. Alec Radford and
            colleagues merged over the 256 byte values rather than over
            characters for the second version of their language model in 2019,
            and Linting Xue and colleagues went the whole way in 2022 with
            &ldquo;ByT5: Towards a Token-Free Future with Pre-trained
            Byte-to-Byte Models&rdquo;, a model with no tokenizer at all. Their
            argument was that a learned vocabulary is a separate artefact that
            has to be trained, shipped and kept in step with the model, that it
            ages as the language it was fitted to changes, and that it handles
            misspellings and unusual spellings badly. Their measured cost was
            sequences three to four times longer. A year later Aleksandar
            Petrov, Emanuele La Malfa, Philip Torr and Adel Bibi turned that cost
            into a question about who pays it, in &ldquo;Language Model
            Tokenizers Introduce Unfairness Between Languages&rdquo;, and Part 5
            here is that question asked of the two readings on this page.
          </p>
          <p>
            The page answers six questions in order. What does a piece it has
            never seen actually cost a vocabulary that was learned from a corpus?
            What is left if we refuse to learn one and read the units the writing
            is already made of? What exactly does a fixed alphabet of 256
            guarantee, and what does it not? Where do a byte and a character part
            company, and what does each reading then promise when the numbers are
            read back? What does all this cost in sequence length, and why is
            that bill not shared evenly between languages? And where does the
            method stop being defined at all?
          </p>
        </>
      }
      playground={<ByteCharacterExplorer />}
      sections={[
        {
          title: "Part 1. What an Unfamiliar Piece Costs",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. One sentence, and eighteen sentences it is not in">
                <p>
                  Every page in this section carries the same sentence, and this
                  one carries beside it the eighteen sentences the merging page
                  is built from. They are ordinary English about reports and
                  costs and analyses, they were written so that every character
                  the sentence uses turns up somewhere in them, and they do not
                  contain the sentence. That last part is the whole arrangement,
                  since a vocabulary is only interesting on writing it was not
                  built from.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>
                  Merging pairs over those eighteen sentences until no pair is
                  left that occurs twice gives a table of 137 entries after 85
                  merges, and it reads the sentence above as 25 numbers. That is
                  a good vocabulary doing exactly what it was fitted to do, and
                  25 is roughly half of what either reading on this page will
                  need for the same sentence. We are going to spend this Part on
                  what it cannot do, and then the rest of the page on the answer
                  that gives up the 25 in exchange.
                </p>
                <KeepInMind>
                  Everything measured here uses one corpus of eighteen English
                  sentences and one sentence held out of them, which is small
                  enough that every number can be checked by hand. The two
                  failures in the next two sections, a symbol never seen in that
                  position and a script never seen at all, do not go away at any
                  size of corpus.
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
                <p>
                  The reason is worth having in full, because it is not the
                  reason it looks like. The corpus does contain the letter z, in
                  the word size, so the letter is not missing from the alphabet.
                  What is missing is the letter z <em>at the end of a word</em>,
                  which is a different symbol in a scheme that marks where words
                  end, and no word in those eighteen sentences finishes with one.
                  So one of the 25 numbers is the stand-in entry, meaning
                  &ldquo;something was here&rdquo;, and a stand-in carries no
                  word boundary because it carries nothing at all. Losing the
                  letter costs one character; losing the boundary means
                  everything after it is read as part of the word in front, which
                  is why the surname and the contraction come back joined.
                </p>
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
                  The third block is where the method stops working rather than
                  works badly. Twenty-one characters of Greek become 18 numbers,
                  seventeen of which are the same stand-in, and what returns is
                  seventeen copies of that stand-in with the spaces gone and a
                  full stop at the end. A model shown this is not shown a
                  degraded sentence. It is shown the fact that something it could
                  not read was there, seventeen times over, and nothing in those
                  numbers distinguishes the sentence from any other Greek
                  sentence with the same count of letters.
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
                  There are two directions out of this. One is to keep learning a
                  vocabulary and to make it a better one, wider, fitted to more
                  languages, refitted when it ages. That helps, and it never
                  finishes, because whatever corpus it was fitted to is finite
                  and the set of things people write is not. The other is to stop
                  learning a vocabulary at all and to read the text as the units
                  it is already made of, so that the question of an unfamiliar
                  piece has no way of arising.
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
                  This page is about the second direction. It buys away the
                  unfamiliar piece completely under one of its two versions, and
                  what it spends is sequence length, which is what everything
                  downstream is charged in.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                  A character table is still learned from a corpus, and it still
                  reserves an entry for what the corpus did not contain. It is
                  smaller and less surprised than a merged one, and it is the
                  same kind of object.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Every byte there is">
                <p>
                  The second version goes one level down and stops needing a
                  corpus. A text stored on a computer is a run of bytes, a byte
                  holds one of exactly 256 values, and so a table with one entry
                  per byte value spells every text that can be stored, in any
                  script, whether or not anybody has ever written it. Nothing is
                  fitted. The table is complete before the first text is read and
                  it is the same table for everyone.
                </p>
                <Equation>
                  {"a byte value  =  a whole number from 0 to 255\n" +
                    "the table     =  all 256 of them, in order\n" +
                    "the number    =  the byte value itself"}
                </Equation>
                <p>
                  The number an entry goes in as is the byte value, so there is
                  nothing to look up in either direction. What does need a
                  decision is how to write the entries down, since a table is
                  read by people and 68 of the 256 values have nothing visible to
                  stand for them, the control characters and the space among
                  them. The usual answer, and the one used here, lets the other
                  188 stand for themselves and lends those 68 a shape from a
                  block of letters no byte value occupies, which is why the space
                  shows up as Ġ in the playground above. The choice is arbitrary
                  in every respect except that it is fixed, and it does not
                  affect a single number.
                </p>
                <KeepInMind>
                  There is no stand-in entry here, deliberately. Nothing can be
                  unfamiliar to a table that already holds every byte value, so
                  an entry meaning &ldquo;something else&rdquo; could never
                  legitimately be reached, and a table that had one would hide a
                  fault behind a plausible-looking answer rather than showing it.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The running sentence, taken all the way through">
                <p>
                  Here is the whole of it on our sentence, which is 51 characters
                  long and happens to be 51 bytes long as well. The first four
                  numbers under each reading are below, and they are the same
                  four numbers for a different reason in each case.
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
                  On this sentence the two readings are the same length and both
                  are exact. That agreement is a fact about English rather than
                  about the readings, and Part 4 is what happens to it as soon as
                  the writing is not English.
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
                <p>
                  The answer is arithmetic rather than principle. Unicode has
                  room for 1,114,112 codepoints, a model gives every entry of the
                  table a row of numbers to learn, and at an ordinary width of
                  768 that comes to 855,638,016 numbers, which is more than the
                  whole of many complete language models, for a table almost
                  every row of which no text will ever touch. The byte table at
                  the same width costs 196,608, which is 4,352 times fewer.
                </p>
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
                  A table with a row for every codepoint would be complete, and
                  at 855,638,016 numbers it would cost more than many whole
                  models, which is why the complete table on this page is the
                  byte one. Making the character case affordable means giving up
                  on storing a table at all, which is what the page after this one
                  is about.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What the Fixed Alphabet Guarantees",
          content: (
            <>
              <SubSection title="9. Nothing can be unfamiliar, and what that sentence means exactly">
                <p>
                  The guarantee is worth stating carefully, because it is
                  narrower than it sounds and it is genuinely absolute inside its
                  own boundary. Every text that can be stored is a run of bytes;
                  every byte holds one of 256 values; the table holds all 256. So
                  for any text at all, in any script, in any language, every
                  piece the reading produces is in the table, and the lookup
                  cannot fail.
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
                  Every one of the twelve sentences in Part 5 comes back exactly
                  under the byte reading, whatever writing system it is in. That
                  is what the construction forces rather than a good result on a
                  hard test, and a result of anything else would mean the byte
                  mapping had gone wrong.
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
                <p>
                  The green line is the honest qualification. Only 103 byte values
                  are ever touched by all thirty texts together, so 153 entries of
                  the byte table have never been used and are being carried
                  anyway. That is what the guarantee costs when it is paid in
                  entries rather than in coverage.
                </p>
                <KeepInMind>
                  A character table is finished when the writing stops
                  surprising it, and the writing does not stop. A byte table is
                  finished before it starts, and pays for that by holding entries
                  most texts never reach.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. What the guarantee does not buy">
                <p>
                  It is easy to over-read what has been bought, so here is the
                  boundary drawn plainly. The guarantee says every text can be
                  turned into numbers and turned back again. It says nothing
                  whatever about those numbers being useful to a model that has
                  never met writing of that kind before.
                </p>
                <p>
                  The Chinese sentence in Part 5 is the sharpest instance. The
                  byte reading turns it into 18 numbers and gives it back
                  exactly, and a model trained only on English has seen those
                  particular byte values in almost no context and knows nothing
                  whatever about what they spell. Representable and learnable are
                  separate questions, and only the first has been settled here.
                </p>
                <InAModel>
                  <p>
                    The difference shows up as where the failure moves rather
                    than as whether there is one. Under a learned vocabulary an
                    unfamiliar text fails at the tokenizer, before the model is
                    reached, and there is nothing the model can do about it.
                    Under a byte reading the same text arrives intact and fails,
                    if it fails, inside the model, where more training data can
                    still change the answer. That is the case for the method,
                    and it is a weaker case than &ldquo;nothing is
                    unfamiliar&rdquo; sounds.
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
                  Everything so far has quietly used one sentence in which the
                  two readings agree, and it is time to stop. The encoding that
                  turns characters into bytes does not use the same number of
                  bytes for every character. It uses one byte for the characters
                  of basic English, two for most accented Latin letters and for
                  Greek, Cyrillic, Hebrew and Arabic, three for the Indic scripts
                  and for Chinese, Japanese and Korean, and four for the rest,
                  emoji included.
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
                  That is why the running sentence came to 51 either way. It is
                  written entirely in characters that take one byte each, so the
                  two readings cut it in exactly the same places and differ only
                  in which number each piece goes in as. An English sentence
                  cannot show the difference between the two methods on this
                  page, and any measurement taken only on English will report
                  that there is none.
                </p>
                <KeepInMind>
                  The two readings coincide on basic English and on nothing else.
                  A benchmark that establishes they behave alike has established
                  it about one alphabet.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Where the two readings stop agreeing about length">
                <p>
                  Put two more texts beside the running sentence, the sentence
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
                    ["the running sentence", "51", "51", "0"],
                    ["with two Scandinavian letters", "69", "71", "2"],
                    ["one sentence of Greek", "21", "38", "17"],
                  ]}
                  caption="The character table was fitted to eighteen English sentences, so the last column is a fact about those sentences rather than about characters."
                />
                <p>
                  Both columns move at once and they move for different reasons.
                  The byte count rises because those characters need more than one
                  byte, which is a fact about the encoding and would be the same
                  for any corpus. The last column rises because the corpus never
                  met those characters, which is a fact about the eighteen
                  sentences and would fall to zero if they had. Only the first of
                  those two goes away with more data.
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
                  The sharpest test of any of this is to encode a text, decode
                  the numbers immediately with no model in between, and compare
                  what returns against what went in. Anything the reading
                  discarded shows up, and nothing else does. Here are the same
                  three texts under both readings.
                </p>
                <ByteCharacterRoundTrip />
                <p>
                  The byte reading is exact three times out of three and would be
                  exact on any text put to it. The character reading is exact on
                  the first and loses two characters on the second and seventeen
                  on the third, and what it gives back in place of them is the
                  stand-in&rsquo;s own spelling, so the two Scandinavian letters
                  come back as a word with two square-bracketed markers embedded
                  in it. The failure is the same shape as the merged
                  vocabulary&rsquo;s in Part 1, and it is smaller only because a
                  character table is surprised less often than a table of merged
                  pieces.
                </p>
                <KeepInMind>
                  Reading a text as its characters gives an exact round trip on
                  text spelled in characters the corpus met, which is a
                  conditional promise. Reading it as its bytes gives an exact
                  round trip, with no condition attached.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. A run of numbers that is not text">
                <p>
                  There is one place where the byte reading can produce something
                  the character reading cannot, and it is the price of the same
                  design that made the guarantee possible. A character takes
                  between one and four bytes, so a run of byte numbers can stop
                  part way through a character, and such a run does not stand for
                  any text at all. It is not an unfamiliar piece and it is not a
                  refusal. It is a run of numbers with no reading.
                </p>
                <Equation>
                  {"é          =  195  169\n" +
                    "195 alone  =  �\n" +
                    "169 alone  =  �"}
                </Equation>
                <p>
                  What comes back in place of a broken position is the mark
                  above, which means that a character stood here and could not be
                  read. Of the 256 numbers in the table, exactly 128 stand for a
                  character on their own and the other 128 do not, since they only
                  ever continue the number in front of them. That is not an edge
                  case reached by malformed input. It is what a model generating
                  numbers one at a time walks into every time it is interrupted,
                  and the widget below shows how often. The Greek sentence has 38
                  numbers and 17 of its 38 stopping points land in the middle of a
                  letter; the English sentence has 24 numbers and none of them do.
                </p>
                <PartialByteRun />
                <p>
                  How narrow this is can be measured directly. Drawing runs of
                  numbers uniformly at random, 546 of 2000 runs of length two are
                  text, 209 of 2000 at length four, 24 at length eight, and none
                  at all of the two thousand runs of length sixteen. Almost every
                  run of byte numbers is not writing, so a model reading bytes
                  spends part of its capacity learning which runs are, before it
                  can learn anything about what they say.
                </p>
                <KeepInMind>
                  The honest answer at a broken run is a mark saying a character
                  stood here and could not be read, one per broken position,
                  rather than a refusal. A decoder that refused would refuse most
                  of a half-finished generation, and 17 of the 38 stopping points
                  in the Greek reading above are exactly that case.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Cost, and Who Pays It",
          content: (
            <>
              <SubSection title="16. Length against a vocabulary that was learned">
                <p>
                  Now the bill. The merged vocabulary from Part 1 reads the
                  running sentence as 25 numbers and the byte reading takes 51, a
                  little over twice as many. Across the whole eighteen-sentence
                  corpus the merged reading takes 263 and the byte reading takes
                  763, which is 2.90 times as many on writing that is entirely
                  English.
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
                    A model that lets every position read every other position
                    does a piece of work for each pair of positions, so its cost
                    grows with the square of the sequence length. Nearly three
                    times the numbers is therefore around eight times the work on
                    the same writing, and any fixed limit on how much a model can
                    hold at once holds a third as much of it. That is why reading
                    bytes is expensive rather than merely long, and why it is
                    usually paired with a step that groups the bytes back into
                    larger units before the expensive part of the model sees
                    them.
                  </p>
                </InAModel>
                <KeepInMind>
                  Two to three times the sequence length is the standing price of
                  refusing to learn a vocabulary, measured here on English, where
                  the byte reading is at its cheapest.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Two numbers, and they move against each other">
                <p>
                  A reading is judged on two numbers together, how many entries
                  its table holds and how many numbers a text becomes, and it is
                  worth noticing that the three readings on this page do not order
                  the same way on both. The byte table is the largest of the three
                  at 256 entries and ties for the longest sequences. The character
                  table is the smallest at 37 and gives sequences of the same
                  length. The merged table is in between on entries and shortest
                  on sequences.
                </p>
                <p>
                  Which is to say that on this corpus, and on English generally,
                  the byte reading is worse than the character reading on both
                  numbers at once. It carries nearly seven times the entries for
                  exactly the same sequence length and the same exact round trip. Anybody
                  measuring the two on English alone should conclude that the byte
                  reading is a strictly worse choice, and on English alone they
                  would be right.
                </p>
                <KeepInMind>
                  The byte reading buys nothing at all on text written in basic
                  English. Everything it is worth is bought on text that is not,
                  which is the argument for measuring it on something else before
                  choosing.
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
                <KeepInMind>
                  A reader of English pays nothing for the guarantee and a reader
                  of Chinese pays three times over on this measure, and neither
                  of them chose their writing system. That is the fairness
                  question, and section 19 is what happened when I measured the
                  quantity a model is actually charged for instead.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The bill measured per sentence, which is a different answer">
                <p>
                  I expected the per-character ratios to settle it and they do
                  not, and the reason is worth more than the ratios were. A model
                  is charged for the numbers a text becomes, not for the numbers
                  per character, and the same meaning takes a different number of
                  characters in different writing systems. Measure the twelve
                  sentences by what they actually cost and the ordering changes.
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
                  The Chinese sentence is the cheapest of the twelve. It pays the
                  worst multiplier on the page and still costs 18 numbers against
                  English&rsquo;s 24, because it says the same thing in six
                  characters where English takes twenty-four. Hindi is the most
                  expensive at 48, twice the English figure, and it gets there
                  with fewer characters than English uses. So the textbook
                  statement that a byte reading charges non-Latin scripts three
                  times as much did not hold when I measured the thing a model is
                  actually charged for, and the language it is worst for on this
                  list is not one of the three-byte ones.
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
                  Quote the ratio and the total together or neither. The ratio
                  says what the writing system costs per character and the total
                  says what the model is charged, and on these twelve sentences
                  they disagree about which language is worst off.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
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
                  The word café can be written two ways that look identical on
                  the page. One spells the last letter as a single codepoint; the
                  other spells it as a plain e followed by a codepoint meaning
                  &ldquo;put an acute accent on the thing before me&rdquo;. Those
                  are 4 characters and 5 characters, 5 bytes and 6 bytes, and they
                  are different texts by every comparison a computer makes, so a
                  model reads them as different words. Emoji make it worse, since
                  a tinted thumb is two codepoints, a family is five and a Welsh
                  flag is seven, and a reader would call each of those one mark.
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
                  There are three defensible answers and each costs something.
                  Counting codepoints is simple and splits marks a reader
                  considers single. Counting what Unicode calls grapheme clusters
                  matches a reader and needs a large body of tables that has to be
                  shipped and updated. Rewriting every text into one preferred
                  spelling before reading it makes the two cafés the same word and
                  makes the round trip inexact, which is a real loss for anything
                  that has to reproduce its input. The byte reading avoids the
                  question entirely, and pays for that by having no notion of a
                  character at all.
                </p>
                <KeepInMind>
                  A character count is only defined once somebody says which of
                  those three a character is. The counts on this page are
                  codepoints, and a page that quotes character counts without
                  saying so has quoted a number that is not determined.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. A byte carries no meaning, and no notion of how often it occurs">
                <p>
                  The deeper limit here is no degenerate input at all. It is the
                  method working exactly as designed. A byte is a unit of
                  storage, it was never a unit of meaning, and nothing in either
                  reading makes it one. A model reading bytes therefore has to
                  learn that a particular run of them is a word before it can
                  learn anything about the word, and it has to learn that afresh
                  for every spelling, every inflection and every script.
                </p>
                <p>
                  The distance it must look across grows in the same proportion
                  as the sequence. A paragraph that fitted in a thousand numbers
                  under the merged vocabulary takes 2,900 under the byte reading,
                  so anything the model has to relate across that paragraph is
                  nearly three times further away than it was. That is the 2.90
                  from section 16 read as a distance rather than as a cost.
                </p>
                <p>
                  And there is nothing here that knows a piece is common. The
                  whole of what a learned vocabulary buys is that frequent things
                  become cheap, since the merging spends its entries on what
                  recurs and leaves the rest to be spelled out. Both readings on
                  this page charge for every character alike, so the three-letter
                  word the costs three numbers every time it appears and would
                  still cost three if it were the only word in the language.
                  Giving that up is what buys the coverage guarantee, and putting
                  it back is the job of whatever groups the bytes into larger
                  units afterwards.
                </p>
                <KeepInMind>
                  These two methods have no model of the writing beyond how it is
                  stored. Everything a learned vocabulary knew about which pieces
                  matter has been handed to the model, along with a sequence three
                  times as long to find it in.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs on which the method
                  stops being defined rather than becoming approximate, together
                  with what has to be decided in each case and what turns on the
                  decision. The ones with a genuine choice attached are the ones
                  worth a reader&rsquo;s attention, since nothing in the
                  mathematics makes them and somebody has to.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what is undefined, or what must be decided"
                  rows={[
                    {
                      expression: "a character the corpus never used",
                      reason:
                        "undefined for a character reading and unreachable for a byte one. A set of characters gathered from any finite text is missing the next text’s characters, so the case arises forever; a table of all 256 byte values cannot meet it, since every text is a run of byte values by construction.",
                    },
                    {
                      expression: "what counts as one character",
                      reason:
                        "a decision with three defensible answers. Codepoints are simple and split a tinted thumb into two; grapheme clusters match a reader and need Unicode’s segmentation tables; normalising first merges the two spellings of café and makes the round trip inexact. Every character count on this page is codepoints, and the choice changes the counts by up to a factor of seven on the marks in section 20.",
                    },
                    {
                      expression: "a run of numbers that stops mid-character",
                      reason:
                        "not text, and the encoding says so rather than leaving it open. Of the 256 numbers, 128 only ever continue the number before them, so 17 of the 38 stopping points in the Greek reading stand for nothing. Refusing such a run and marking each broken position are both defensible; refusing means refusing most of a half-finished generation.",
                    },
                    {
                      expression: "a number outside the table",
                      reason:
                        "undefined, with no choice attached. A table of 256 entries owns the numbers 0 to 255 and 256 names nothing, so there is nothing to read. This is the case a model generating numbers can walk into, since nothing about a generated number guarantees it is in range.",
                    },
                    {
                      expression: "a run of codepoints that is not text",
                      reason:
                        "outside the guarantee, and this is where the word “every” in “every text is a run of bytes” does its work. The encoding has no spelling for the codepoints reserved for pairing up in another encoding, so a string carrying one is not text and there is nothing to read. The guarantee covers every text, which is not the same as every possible run of codepoints.",
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
                        "outside the method entirely, in both readings. Neither has any notion of frequency, so a common word and a rare one cost in proportion to their spelling and nothing else. That is exactly what a learned vocabulary is for, and giving it up is what makes the coverage guarantee possible.",
                    },
                    {
                      expression: "whether the sequence length is affordable",
                      reason:
                        "not a question about the method, and the method cannot answer it. Two to three times the numbers is around eight times the work for a model that compares every pair of positions, so the readings here are usually paired with something that groups the bytes back together before the expensive part of the model. Where to put that grouping is a separate design and not a repair to this one.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying. What counts as one character is
                  a decision, not a fact, so any character count has to say which
                  decision it made. And the coverage guarantee is about text
                  specifically, which is why it can be absolute and why it stops
                  where text stops.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
