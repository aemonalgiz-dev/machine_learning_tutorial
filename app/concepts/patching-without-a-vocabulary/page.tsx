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
import { CorpusConditionChart } from "@/components/widgets/CorpusConditionChart";
import { CutLandingChart } from "@/components/widgets/CutLandingChart";
import { PatchExplorer } from "@/components/widgets/PatchExplorer";
import { UncertaintyProfile } from "@/components/widgets/UncertaintyProfile";

export const metadata: Metadata = {
  title: "Patching Without a Vocabulary · oop_ml",
  description:
    "Group a text's bytes back into larger pieces by cutting where the next byte is hard to guess, so a model settles the boundaries and no list has to hold them.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PatchingWithoutAVocabularyPage() {
  return (
    <ConceptPage
      title="Patching Without a Vocabulary"
      tagline="Group the bytes back into larger pieces by cutting where the next one is hard to guess, so a model settles the boundaries and no list has to hold them."
      prerequisites={
        <>
          Two pages from earlier in this section, and this one finishes the
          argument they start. The page on{" "}
          <Link href="/concepts/bytes-and-characters" className={link}>
            bytes and characters
          </Link>{" "}
          reads a text as the units it is already made of, which removes the
          unfamiliar piece completely and charges two to three times the
          sequence length for it, and it ends by saying that the readings there
          are usually paired with something that groups the bytes back together
          before the expensive part of the model. This is that something. The
          page on{" "}
          <Link href="/concepts/hashing-characters" className={link}>
            hashing characters
          </Link>{" "}
          is the other way of doing without a stored table, and it attacks the
          width of the table rather than the length of the sequence, so the two
          answers are to two different halves of the same bill. The sentence and
          the eighteen English sentences here are the ones both those pages use.
        </>
      }
      history={
        <>
          <p>
            Zellig Harris had the idea in 1955 and no computer to run it on. He
            was at the University of Pennsylvania working on how a linguist
            arriving at an unwritten language could find its units without
            already knowing them, and in &ldquo;From Phoneme to Morpheme&rdquo;
            he proposed counting, at each position in a word, how many different
            sounds could follow what had been heard so far. Inside a word that
            count is small, since only a few continuations make anything; at the
            end of one it jumps, because any word at all can come next. He cut
            where the count rose. Everything on this page is that proposal with
            the count of possible continuations replaced by a measurement of how
            uncertain a model is, which Shannon had defined seven years earlier
            at Bell Labs and which he applied to English himself in 1951, asking
            people to guess the next letter of a text and reporting that a
            reader of English is uncertain by around one bit a letter rather
            than the four and a bit an alphabet of that size allows.
          </p>
          <p>
            The problem that brought it back was arithmetic rather than
            linguistic. Lili Yu, D&aacute;niel Simig, Colin Flaherty, Armen
            Aghajanyan, Luke Zettlemoyer and Mike Lewis, at Meta AI in 2023,
            wanted a model that read raw bytes, which removes the tokenizer and
            everything wrong with it, and found that the sequences were far too
            long for a model that compares every position with every other. Their
            answer in &ldquo;MegaByte: Predicting Million-byte Sequences with
            Multiscale Transformers&rdquo; was to cut the bytes into blocks of a
            fixed size, give a small model the bytes inside each block and a
            large one a single vector per block. Piotr Nawrot and colleagues had
            done the same partition inside the model the year before in
            &ldquo;Hierarchical Transformers Are More Efficient Language
            Models&rdquo;. Neither rule looks at the text, and Part 2 here is
            what that costs.
          </p>
          <p>
            Artidoro Pagnoni, Ram Pasunuru, Pedro Rodriguez, Lili Yu, Luke
            Zettlemoyer, Mike Lewis, Ari Holtzman, Srinivasan Iyer and their
            co-authors put Harris&rsquo;s rule back in 2024. Their Byte Latent
            Transformer trains a small byte-level language model, asks it at
            every position how uncertain it is about the next byte, and begins a
            new block wherever that uncertainty is high, so a stretch the model
            has seen a thousand times is swallowed into one long block and the
            positions it cannot call get a block each. The title of the paper,
            &ldquo;Byte Latent Transformer: Patches Scale Better Than
            Tokens&rdquo;, is the claim, and the two rules for deciding what
            counts as high are both theirs. What their small transformer does,
            the model behind this page does with counts of how often one short
            stretch of bytes was followed by each of the 256 possible next ones,
            because the rule for cutting is the idea and the thing doing the
            guessing is interchangeable.
          </p>
          <p>
            The page answers six questions in order. What exactly does reading
            bytes cost, and why is the obvious repair the one thing that has been
            given up? What does the simplest possible grouping do, and where do
            its cuts actually land when they are counted? What would it mean to
            let the text choose the boundaries, and what is the quantity that
            chooses them? What has to be true of the corpus before that quantity
            says anything at all, which is where my own first attempt at this
            went wrong? What is the whole arrangement worth in sequence length,
            and against which alternative? And where does the method stop being
            defined?
          </p>
        </>
      }
      playground={<PatchExplorer />}
      sections={[
        {
          title: "Part 1. The Length the Bytes Cost",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Where this picks up, and the bill it picks up">
                <p>
                  The previous page ended on a bill. Our sentence about Dr
                  Alvarez is 51 bytes, and the vocabulary merged out of eighteen
                  ordinary English sentences reads it as 25 numbers. Across all
                  eighteen of those sentences the byte reading takes 763 numbers
                  and the merged one takes 263, which is a little under three
                  times as many for the same writing, and a model that compares
                  every position with every other does work in proportion to the
                  square of it.
                </p>
                <Equation>
                  {"the sentence, as bytes      51\n" +
                    "the sentence, merged       25\n" +
                    "\n" +
                    "the corpus, as bytes      763\n" +
                    "the corpus, merged        263"}
                </Equation>
                <p>
                  So the coverage guarantee is real and it is not free. Nothing
                  can be unfamiliar to a table holding all 256 byte values, and
                  what that buys is paid for in a sequence nearly three times as
                  long, in around eight times the work for the expensive part of
                  a model, and in a distance nearly three times as far for
                  anything the model has to relate across a paragraph. This page
                  is the attempt to get most of that back.
                </p>
                <KeepInMind>
                  Everything measured here uses the same eighteen English
                  sentences and the same held-out sentence the two previous pages
                  use, so the numbers can be laid beside theirs. It is a very
                  small corpus, and Part 4 is entirely about what that does to
                  the method.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The repair that is not available">
                <p>
                  There is an obvious way to shorten a sequence of bytes, and we
                  have already spent two pages refusing it. Find the runs that
                  recur, give each of them an entry in a table, and read a
                  frequent word as one number instead of three. That is what
                  merging does, it is why the merged reading is three times
                  shorter, and it is exactly the thing being given up, since a
                  table learned from a corpus is what fails on writing the corpus
                  never met.
                </p>
                <p>
                  What is left is a narrower question. We may not keep a list of
                  which runs of bytes are worth a name, but nothing stops us
                  deciding, for a particular text, where one piece ends and the
                  next begins. The pieces will not be named and nothing will
                  recognise one when it comes round again. They will merely be
                  boundaries, and the sequence a model reads will be as long as
                  the number of boundaries rather than as long as the text.
                </p>
                <KeepInMind>
                  Grouping and naming are separable, and this page keeps only the
                  first. Everything a vocabulary bought beyond shortening the
                  sequence stays given up, which is the subject of Part 6.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What a block is, and why it is not an entry in a table">
                <p>
                  A piece here is a run of consecutive bytes with a start and an
                  end, and it is several numbers rather than one. That is the
                  difference from everything earlier in this section. When a
                  merged vocabulary reads the word cost as one piece, that piece
                  has an identity, a number, and a row of its own that the model
                  learns; when this method groups the four bytes of cost into one
                  block, the block is still four byte values and what the model
                  gets is a single vector it works out from them.
                </p>
                <Equation>
                  {"a merged piece   =  one number, looked up in a table\n" +
                    "a block          =  a run of byte values, and where it starts"}
                </Equation>
                <p>
                  So the arrangement has two halves. A small model reads the
                  bytes inside a block and produces one vector for it, and a
                  large model reads the sequence of those vectors and never sees
                  a byte at all. Only the second of those is charged the square
                  of the sequence length, which is why the length that matters
                  is the number of blocks and not the number of bytes. This page
                  is about where the boundaries go, which is the whole of the
                  question a tokenizer would have answered.
                </p>
                <KeepInMind>
                  Nothing on this page produces a table, a number for a piece, or
                  anything that could be looked up. Two occurrences of the same
                  word are two runs of bytes that happen to agree, and no part of
                  the method notices that they do.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Cutting at a Fixed Size",
          content: (
            <>
              <SubSection title="4. The simplest rule there is">
                <p>
                  Start with the rule that reads nothing. Take the bytes in
                  order, cut after every fourth one, and let the last block be
                  short if the count does not divide. Ten bytes at a block size
                  of four are blocks of four, four and two, beginning at offsets
                  0, 4 and 8. There is nothing to fit, nothing to store and
                  nothing that can go stale, and the number of blocks is the
                  number of bytes divided by the size, which is known before the
                  text is read.
                </p>
                <Equation>
                  {"blocks  =  ⌈ bytes ∕ size ⌉"}
                </Equation>
                <p>
                  It is worth being clear that this is a real method and not a
                  straw one. It is what MegaByte does, and the block size is the
                  only knob. The argument for it is that the small model reading
                  the bytes inside a block can learn to repair whatever the cut
                  broke, so the boundaries need not be good ones, they need only
                  be regular. Whether that argument holds is an empirical
                  question about the model rather than about the cutting, and it
                  is not one this page can settle.
                </p>
                <KeepInMind>
                  A fixed size gives an exactly predictable sequence length,
                  which nothing else on this page does, and that turns out to
                  matter for reasons Part 6 comes back to.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The running sentence, cut every four bytes">
                <p>
                  Here is the whole of it on our sentence, which is 51 bytes and
                  therefore comes to 13 blocks, twelve of four bytes and a last
                  one of three. Read the blocks across and the sentence is
                  perfectly recoverable, since nothing has been lost, but read
                  each block on its own and almost none of them is anything.
                </p>
                <WorkedExample title="Fifty-one bytes in thirteen blocks">
                  <Equation>
                    {"Dr. │Alva│rez │didn│'t e│xpec│t th│e lo│w-co│st r│e-an│alys│is."}
                  </Equation>
                  <p>
                    Two of the twelve cuts fall where a word begins, at the start
                    of Alvarez and at the start of didn&rsquo;t. One falls
                    between a letter and the apostrophe. The other nine fall
                    inside a word, and re-analysis arrives spread across four
                    blocks, beginning with the r at the end of one and finishing
                    with is and the full stop at the start of another.
                  </p>
                </WorkedExample>
                <p>
                  The playground above is set to this by default, and dragging
                  the block size moves every cut at once. At a size of one the
                  method is the byte reading again, 51 blocks for 51 bytes and
                  nothing bought; at a size past the length of the text it is one
                  block and the small model has been handed the whole sentence.
                </p>
                <KeepInMind>
                  The cuts are not bad in a way that loses information. Every
                  byte is still there, in order, exactly once, and the sentence
                  can be read straight back off the blocks. What has been lost is
                  any correspondence between where a block ends and where
                  anything in the writing ends.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Where those cuts land, counted against cutting anywhere">
                <p>
                  One sentence is an anecdote, so put the rule to all eighteen
                  and count. There are 763 bytes across them, which leaves 745
                  positions a cut could fall in, and 489 of those 745 have a
                  letter or a digit on both sides. Cutting at a position chosen
                  with no regard for the text therefore lands inside a word 65.6
                  per cent of the time, and that number is the thing every rule
                  on this page has to beat.
                </p>
                <NumberTable
                  headings={[
                    "cut every",
                    "blocks",
                    "cuts inside a word",
                    "of all its cuts",
                  ]}
                  rows={[
                    ["1 byte", "763", "489 of 745", "65.6%"],
                    ["4 bytes", "197", "102 of 179", "57.0%"],
                    ["8 bytes", "102", "48 of 84", "57.1%"],
                    ["12 bytes", "72", "31 of 54", "57.4%"],
                  ]}
                  caption="All eighteen sentences, 763 bytes between them. The first row is every position there is, which is where the 65.6 per cent comes from."
                />
                <CutLandingChart />
                <p>
                  The orange line is the fixed rule at every block size from one
                  to twelve, and it stays between 57.0 and 74.5 per cent, with
                  the baseline of 65.6 running through the middle of that range.
                  Some sizes are a little better than cutting anywhere and some
                  are worse. That is not a failure of tuning. A rule that does
                  not read the text cannot know where the words are, so picking a
                  different block size moves the number of blocks without moving
                  the quality of a single cut. The blue line, which is the next
                  Part, is what happens when the text is allowed a say.
                </p>
                <KeepInMind>
                  The right way to read the orange line is that it stays around
                  the baseline rather than falling below it, and which side it
                  lands on at a given size is which sentences happened to have
                  their spaces in convenient places for that size.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. A block can also stop part way through a letter">
                <p>
                  There is a second cost, and it is the one that surprises people
                  who have only tested on English. A character can take more than
                  one byte, so a boundary that falls at a fixed offset can land
                  in the middle of one, and neither side of that cut spells
                  anything at all. Take our sentence with a Scandinavian unit of
                  length written into it, 38 characters and 40 bytes, and cut it
                  every four bytes.
                </p>
                <WorkedExample title="Two positions that stand for no letter">
                  <Equation>
                    {"Dr. │Ång│str�│�m e│xpec│ted │the │re-a│naly│sis."}
                  </Equation>
                  <p>
                    The two marks are one letter, the o with its diaeresis, whose
                    two bytes fell either side of the boundary at offset 12. The
                    third block ends with a byte that begins a character it does
                    not contain and the fourth begins with a byte that only ever
                    continues one, so read on its own neither is text.
                  </p>
                </WorkedExample>
                <p>
                  This is the design rather than a defect, and MegaByte&rsquo;s
                  blocks do exactly the same. The bytes are all still there and
                  the text comes back whole when the blocks are read in order;
                  what has happened is that the small model reading one block is
                  sometimes handed half a letter, and it has to learn to work
                  with that. On the eighteen English sentences the case never
                  arises, which is the point worth carrying, since a measurement
                  taken only on English reports that this cost is zero.
                </p>
                <KeepInMind>
                  The uncertainty rule in the next Part can do this too, since it
                  also cuts between bytes and knows nothing about characters.
                  What it does not do is cut at a position chosen without regard
                  for the text, so it reaches the case less often rather than not
                  at all.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Cutting Where the Next Byte Is Hard to Guess",
          content: (
            <>
              <SubSection title="8. The idea, before any arithmetic">
                <p>
                  Read the sentence about the report one letter at a time and ask
                  yourself, after each, what comes next. After The r you are
                  fairly sure of an e, and after The repor you are practically
                  certain of a t. Then the word ends, and what follows is a space
                  and then anything at all, because the sentence could have gone
                  on to say almost any word. The difficulty of the guess falls
                  through a word and jumps at the join between two.
                </p>
                <p>
                  That is Harris&rsquo;s observation, and it gives a rule that
                  needs no list. Begin a new piece wherever the next thing is hard
                  to guess. Nothing about it is specific to words or to English;
                  it says only that a boundary is a place where what has gone
                  before stops determining what comes next, which is a statement
                  about the writing rather than about a language, and it works on
                  a script with no spaces for the same reason it works on one
                  with them.
                </p>
                <KeepInMind>
                  Notice what this needs before it can run. Somebody has to be
                  doing the guessing, and how good the pieces are is entirely a
                  fact about how good that guesser is. Nothing has to be stored,
                  and something has to be trained, which is a swap rather than a
                  saving.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Uncertainty, measured in bits">
                <p>
                  To turn that into a rule we need a number for how hard a guess
                  is. The guesser produces, at each position, a probability for
                  every one of the 256 values the next byte could take, and the
                  quantity we want is Shannon&rsquo;s entropy of that spread. It
                  is zero when one value has all the probability and largest when
                  the 256 are equally likely, in which case it is exactly 8,
                  since 8 bits is what it takes to name one of 256 things.
                </p>
                <Equation>
                  {"H  =  − Σ  p(v) log₂ p(v)          0 ≤ H ≤ 8"}
                </Equation>
                <p>
                  The guesser used throughout this page counts, over a corpus,
                  how often each stretch of four bytes was followed by each byte
                  value, and then reads a probability off those counts. Every
                  value gets a small amount added to its count so that nothing has
                  probability zero, which also means a stretch of bytes the corpus
                  never contained comes out flat and therefore at exactly 8 bits.
                  That last case is not a detail and Part 5 is largely about it.
                </p>
                <WhyThisWorks title="Why a stretch nobody has seen scores the highest possible number">
                  <p>
                    The counts after an unseen stretch are all zero, so after the
                    small amount is added every one of the 256 values has the same
                    probability, and a spread with 256 equally likely outcomes is
                    8 bits by the definition above. That is arithmetic rather
                    than a modelling choice. What it means in practice is that the
                    quantity being thresholded confuses two entirely different
                    situations, a position where the text genuinely could go
                    several ways and a position where the guesser has nothing to
                    say, and reports both as maximum uncertainty.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Eight bits is the ceiling and it means one of two things, either
                  that anything could come next or that nobody knows. The method
                  cuts at both and cannot tell them apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Four bytes, worked by hand">
                <p>
                  Before anything at scale, here is the smallest example that
                  contains the whole calculation. Count over the single text aab,
                  looking back one byte, and credit every unseen byte value with
                  one observation. Two stretches were seen. The start of a text
                  was followed by a once, and a was followed by a once and b once.
                </p>
                <WorkedExample title="The text aabb under a model that read aab">
                  <Equation>
                    {"after the start   a has 2∕257, the other 255 have 1∕257 each\n" +
                      "after a           a and b have 2∕258, the other 254 have 1∕258\n" +
                      "after b           never seen, so all 256 have 1∕256"}
                  </Equation>
                  <Equation>
                    {"a      a      b      b\n" +
                      "7.99784   7.99572   7.99572   8.00000"}
                  </Equation>
                  <p>
                    Every number can be checked from the definition in section 9
                    with nothing more than a logarithm. The fourth is exactly 8,
                    because the stretch in front of it never occurred. The other
                    three are within three thousandths of it.
                  </p>
                </WorkedExample>
                <p>
                  So the ordering is right. The position after a is less uncertain
                  than the position after nothing, which is less uncertain than
                  the position after b. And the ordering is useless, because the
                  three numbers a threshold would have to separate differ in the
                  third decimal place. A threshold of 7.996 does cut this text
                  once, between the third byte and the fourth, giving aab and b,
                  and a threshold anywhere a person would think to put one gives
                  either one block or four.
                </p>
                <KeepInMind>
                  The arithmetic is correct and the answer is unusable, which is
                  a different kind of problem from a bug and is the subject of
                  Part 4. Nothing about the definition of uncertainty guarantees
                  that its values are spread out enough for a threshold to fall
                  between them.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The two rules for saying a number is high">
                <p>
                  Given a number at every position there are two ways to decide
                  which positions begin a block, and the Byte Latent Transformer
                  offers both. The first cuts wherever the uncertainty is above a
                  threshold. The second cuts wherever it is more than a threshold
                  above the previous position&rsquo;s, which the paper calls an
                  approximate monotonic constraint and which is much closer to
                  what Harris actually proposed, since he was watching for a rise
                  rather than for a level.
                </p>
                <Equation>
                  {"above a level      cut at i  when  H(i) > t\n" +
                    "risen by a step    cut at i  when  H(i) − H(i−1) > t"}
                </Equation>
                <p>
                  On text the model knows well the two usually agree, since a
                  word start is both high and higher than the letter before it.
                  They part company on a flat stretch. Where the uncertainty
                  stays at 8 bits for a long run, which is what happens on writing the
                  model has never seen, the first rule cuts at every single
                  position and the second cuts at none of them, because a plateau
                  has no rises. On our held-out sentence that is 30 blocks under
                  the first rule and 7 under the second, from the identical set of
                  numbers.
                </p>
                <KeepInMind>
                  These are not two settings of one rule. On the case that
                  actually arises they are opposites, and neither answer is
                  obviously the right one, which is the first of several places
                  the method leaves a choice to whoever is implementing it.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. A sentence the model read, cut">
                <p>
                  Now the case where it works. The model here counted the
                  eighteen sentences, so one of them is text it knows thoroughly,
                  and the sentence about a report expected on Monday is 34
                  bytes. Cutting wherever the uncertainty passes one bit gives six
                  blocks, and five of them are words.
                </p>
                <WorkedExample title="Thirty-four bytes in six blocks">
                  <Equation>
                    {"The │re│port was │expected │on │Monday."}
                  </Equation>
                  <p>
                    Four of the five cuts fall exactly where a word begins. The
                    fifth falls inside report, after the re, because several
                    words in this corpus begin that way and the model was
                    genuinely unsure which one was coming. No cut falls before
                    was, so that word rides along in the block with port, which
                    is the same rule declining to cut where it was not uncertain.
                  </p>
                </WorkedExample>
                <p>
                  Compare that with the fixed rule on the same 34 bytes, which
                  gives nine blocks and puts six of its eight cuts inside a word.
                  The uncertainty rule makes fewer pieces and better ones at the
                  same time, which is the claim the whole method rests on. The
                  chart below is the number the cut is made from, one bar per
                  byte, and the pattern is what to look at rather than any
                  individual bar.
                </p>
                <UncertaintyProfile />
                <p>
                  On the sentence it read the bars fall through each word and
                  jump at every space, and the blue bars land on the jumps. Switch
                  to the sentence it did not read and the shape is gone; more
                  than half the bars stand flat against the ceiling, the green
                  ticks marking word starts no longer line up with anything, and
                  the rule cuts at almost every position because almost every
                  position is above one bit.
                </p>
                <KeepInMind>
                  Across all eighteen sentences the rule makes 129 blocks and puts
                  32 of its 111 cuts inside a word, which is 28.8 per cent against
                  the 65.6 per cent an uninformed cut gives. That is the method
                  working. Every number in this section is measured on text the
                  guesser was counted over.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What the Corpus Has to Do First",
          content: (
            <>
              <SubSection title="13. Why every uncertainty comes out near its ceiling">
                <p>
                  The four numbers in section 10 were all within three
                  thousandths of 8, and that was not an accident of a tiny
                  corpus. It is what crediting every unseen byte value with one
                  observation does. There are 256 values, so a stretch seen once
                  with one continuation arrives at a spread where the observed
                  value holds two shares and the other 255 hold one each, and
                  that is barely distinguishable from flat.
                </p>
                <Equation>
                  {"p(the value that was seen)  =  (n + 1) ∕ (n + 256)"}
                </Equation>
                <p>
                  Solve that for nine tenths and the answer is 2,294. A stretch of
                  bytes has to be observed with the same continuation two thousand
                  times before the model is ninety per cent sure of it, and no
                  teaching corpus and very few real ones give any particular
                  four-byte stretch two thousand occurrences. So at the ordinary
                  setting every position of every text comes out near 8 bits, every
                  position looks equally uncertain, and there is no threshold that
                  separates anything from anything.
                </p>
                <KeepInMind>
                  This is a property of how much an unseen byte is credited with
                  and of how many byte values there are, rather than of the
                  corpus. Reading a hundred times more text does not fix it for a
                  stretch that is still rare, and every stretch of four bytes is
                  rare when there are 256 to the fourth of them.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Crediting an unseen byte with less">
                <p>
                  The repair is to credit an unseen byte value with far less than
                  one observation. Take the smallest corpus that can show it, one
                  six-word sentence about a cat, read some number of times, and
                  watch two of its positions as the amount credited falls. The
                  third byte is inside the word the; the fifth is the first letter
                  of the word after it.
                </p>
                <CorpusConditionChart />
                <p>
                  The left panel is the ordinary setting. Twenty copies of the
                  sentence put the position inside a word at 7.4674 bits and the
                  word start at 7.5862, a gap of 0.1189 bits at a height where
                  everything is nearly maximal, and the text comes out as 22
                  blocks for 22 bytes at every threshold that cuts anything at
                  all. The right panel credits an unseen byte with a thousandth
                  instead. At twenty copies the same two positions are 0.106 and
                  1.099, a gap of nearly a whole bit, and a threshold at half a
                  bit falls cleanly between them.
                </p>
                <KeepInMind>
                  I did not expect the difference to be this stark. The two
                  panels come from the same corpus under the same rule, and the
                  only thing that changed between them is a number nothing in the
                  method tells you how to set.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Eight copies recover the words and seven do not">
                <p>
                  The green markers under the right panel say which corpus sizes
                  produced blocks that are the sentence&rsquo;s words. There is a
                  sharp edge and it is between seven copies and eight. At seven
                  the sentence still comes to 16 blocks, letters and fragments; at
                  eight it comes to five, and they are the words.
                </p>
                <WorkedExample title="One copy either side of the edge">
                  <Equation>
                    {"seven copies    16 blocks, and none of them is a word\n" +
                      "eight copies     5 blocks, the │cat │sat │on the │mat"}
                  </Equation>
                  <p>
                    The word on is swallowed into the block with the that follows
                    it, at both sizes and at every larger one, because on was only
                    ever followed by the in this corpus. Nothing was uncertain
                    there, so nothing was cut, which is precisely what the rule
                    promises to do.
                  </p>
                </WorkedExample>
                <p>
                  Eight copies of one sentence is 176 bytes. It is worth saying
                  plainly how little that is, and how much it depends on the
                  sentence being repeated exactly rather than on there being 176
                  bytes of English. On the eighteen sentences, which are 763 bytes
                  of genuinely varied writing, the same rule needs a context of
                  four bytes rather than two to produce anything word-shaped at
                  all.
                </p>
                <KeepInMind>
                  The threshold and the amount credited to an unseen byte are two
                  free numbers, and whether the method produces words or letters
                  depends on both of them together with how much text was read.
                  None of the three has a value the mathematics prefers.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Repeating a corpus is lowering that credit and nothing else">
                <p>
                  The chart in section 14 sweeps how many copies of the sentence
                  were read, and it is fair to ask whether reading the same text
                  twice can possibly teach a model anything. It cannot, and the
                  arithmetic says so exactly. Multiplying every count by a number
                  and then adding a fixed amount to each is the same spread as
                  leaving the counts alone and adding that amount divided by the
                  number.
                </p>
                <Equation>
                  {"(k·c + s) ∕ (k·n + 256 s)  =  (c + s∕k) ∕ (n + 256 s∕k)"}
                </Equation>
                <p>
                  Measured, twenty copies of the sentence with a thousandth
                  credited to each unseen byte and one copy with a twenty
                  thousandth credited agree at every one of the 22 positions to
                  1.7 parts in 10¹⁶, and cut the sentence into identical blocks.
                  So the horizontal axis of that chart is really the credit axis
                  in disguise, and the honest reading of the whole Part is that
                  the model has to be either confident or badly calibrated before
                  its uncertainties separate anything, and a small corpus can only
                  buy the second.
                </p>
                <KeepInMind>
                  A real model of this kind is a small transformer trained on a
                  great deal of text, and its confidence comes from having read
                  the text. The demonstration on this page arrives at a similar
                  shape by turning a dial instead, and that is worth saying out
                  loud beside the numbers it produces.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. And repeating one phrase does not help at all">
                <p>
                  It would be convenient if a bigger corpus were the whole answer,
                  and it is not, which the smallest possible case shows. Count
                  twenty copies of the phrase the cat sat, at the same context
                  length and the same credit that recovered the words in section
                  15, and score the phrase itself. Every position comes out at
                  0.198144 bits. Not close to each other; equal.
                </p>
                <WorkedExample title="Eleven positions, one number">
                  <Equation>
                    {"t     h     e     ␣     c     a     t     ␣     s     a     t\n" +
                      "0.198 0.198 0.198 0.198 0.198 0.198 0.198 0.198 0.198 0.198 0.198"}
                  </Equation>
                  <p>
                    The phrase comes out as one block whatever threshold is
                    chosen, since a flat run has no position above the others and
                    no rise for the second rule to find.
                  </p>
                </WorkedExample>
                <p>
                  The reason is that in this corpus the start of a word is exactly
                  as predictable as the inside of one. After the space in the cat
                  the only thing that ever came was a c, so the model is as certain
                  there as it is between the t and the h of the. What made section
                  15 work was that two different words followed the same short
                  stretch, since e followed by a space led sometimes to cat and
                  sometimes to mat. So the uncertainty at a word start measures
                  how many different words the corpus put after that stretch, and
                  a corpus with one word there produces none of it.
                </p>
                <KeepInMind>
                  A corpus can be arbitrarily large and still fail this. The
                  model fits it perfectly and reports low uncertainty everywhere,
                  which is exactly what a well-fitted model should do, and the
                  only thing that has gone wrong is that the quantity being
                  thresholded is flat.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. How far back the guesser looks">
                <p>
                  The last free number is how many preceding bytes the guess is
                  conditioned on, and on the eighteen sentences it does more than
                  the threshold does. Looking back one byte is barely better than
                  cutting anywhere, and each byte added shortens the sequence and
                  improves the cuts at the same time.
                </p>
                <NumberTable
                  headings={[
                    "bytes looked back at",
                    "blocks",
                    "cuts inside a word",
                    "of all its cuts",
                  ]}
                  rows={[
                    ["1", "693", "425 of 675", "63.0%"],
                    ["2", "338", "167 of 320", "52.2%"],
                    ["3", "191", "68 of 173", "39.3%"],
                    ["4", "129", "32 of 111", "28.8%"],
                    ["5", "110", "25 of 92", "27.2%"],
                  ]}
                  caption="All eighteen sentences at a threshold of one bit. Cutting anywhere at all gives 65.6 per cent, which is where the first row nearly is."
                />
                <p>
                  A byte of context is one letter, and one letter does not tell
                  you where you are in a word, so the first row is close to the
                  uninformed rate for the same reason the fixed rule is. By four
                  bytes the model is looking at most of a short word and the cuts
                  are more than twice as good, and the fifth byte adds little,
                  which is roughly where the improvement stops on a corpus this
                  small. It stops because a longer stretch occurs less often, so
                  each extra byte of context leaves more of the text scored under
                  stretches the corpus never contained.
                </p>
                <KeepInMind>
                  Every number in this Part is measured on a corpus of 763 bytes,
                  which is small enough that a reader can check any of it and far
                  too small for the conclusions to transfer. What does transfer is
                  the shape of the dependence, which is that the pieces are a
                  function of the guesser and the guesser has at least three
                  settings.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Bill, and Where It Is Not Worth Paying",
          content: (
            <>
              <SubSection title="19. Length against the bytes and against a learned vocabulary">
                <p>
                  Now the number the whole exercise is for. Across the eighteen
                  sentences, 763 bytes become 129 blocks when they are cut by
                  uncertainty, which is a factor of 5.9, and 197 blocks when they
                  are cut every four bytes. The merged vocabulary on the same
                  eighteen sentences takes 263 numbers, so on this text the
                  uncertainty rule produces a shorter sequence than the learned
                  table does, while holding no table at all.
                </p>
                <NumberTable
                  headings={[
                    "reading",
                    "the sentence",
                    "the corpus",
                    "table entries",
                  ]}
                  rows={[
                    ["one number per byte", "51", "763", "256"],
                    ["blocks of 4 bytes", "13", "197", "none"],
                    ["cut where the next byte was hard to guess", "30", "129", "none"],
                    ["pieces merged from the eighteen sentences", "25", "263", "137"],
                  ]}
                  caption="The corpus column is the eighteen sentences themselves, which the last two rows were built from. The sentence column is a sentence none of them saw, and the ordering is not the same."
                />
                <InAModel>
                  <p>
                    Read the corpus column and the case is made. A model comparing
                    every position with every other does work in proportion to the
                    square of the length, so 129 against 763 is around 35 times
                    less of it, and the small model that reads the bytes inside a
                    block is cheap because it only ever looks at one block. That
                    is the arrangement the Byte Latent Transformer is built on,
                    and its claim is that at a fixed budget the blocks scale better
                    than a learned vocabulary&rsquo;s pieces do.
                  </p>
                </InAModel>
                <KeepInMind>
                  The two columns disagree and the corpus column is the flattering
                  one, since it is the only text the guesser has ever read. The
                  next two sections are the other column.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. A sentence the guesser never read">
                <p>
                  Put our sentence about Dr Alvarez to the same model. It is 51
                  bytes, it is ordinary English, it shares most of its words with
                  the corpus, and 26 of its 51 positions come out at exactly 8
                  bits, because the four-byte stretch in front of each of them
                  never occurred in 763 bytes of text. The rule cuts at every one
                  of those and at several more.
                </p>
                <WorkedExample title="Fifty-one bytes in thirty blocks">
                  <Equation>
                    {"Dr. A│l│v│a│r│e│z│ │d│i│d│n│'│t│ expect │t│h│e │low-│c│o│st│ │r│e│-│a│n│a│lysis."}
                  </Equation>
                  <p>
                    Two stretches survive. The run expect appears in the corpus
                    inside expected and comes through as one block with its
                    spaces, and low with its hyphen comes through as another. The
                    surname is one byte to a block from beginning to end, because
                    none of the four-byte stretches inside it occurs anywhere in
                    the eighteen sentences.
                  </p>
                </WorkedExample>
                <p>
                  So the method has not degraded gracefully. On text it knows it
                  gives 5.9 bytes to a block; on text one sentence away from that
                  it gives 1.7, which is worse than cutting every four bytes and
                  is most of the way back to reading the raw bytes. A model would
                  be paying nearly the full byte-level cost on exactly the writing
                  that a byte-level model exists to handle.
                </p>
                <KeepInMind>
                  The failure is quiet. Nothing goes wrong, nothing is lost, and
                  the sentence reads back perfectly from its blocks. The only
                  symptom is 30 blocks where the same rule gives 6 on a 34-byte
                  sentence it has read, and a count is not something anything
                  downstream complains about.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Where the obvious alternative is simply better">
                <p>
                  On that sentence the merged vocabulary from two pages ago reads
                  it as 25 numbers and the uncertainty rule as 30 blocks, so the
                  thing this page is describing loses to the thing it was meant to
                  replace, on the case that matters. And it loses to the fixed rule
                  too, which takes 13 blocks and has no model behind it at all.
                </p>
                <NumberTable
                  headings={["on this sentence", "pieces", "needed a corpus"]}
                  rows={[
                    ["blocks of 4 bytes", "13", "no"],
                    ["pieces merged from the corpus", "25", "yes, and a table of 137"],
                    ["cut where the next byte was hard to guess", "30", "yes, and no table"],
                    ["one number per byte", "51", "no"],
                  ]}
                  caption="A sentence none of the three fitted methods was built from, ordered by what it costs."
                />
                <p>
                  I want to be careful about what this does and does not show. The
                  guesser here read 763 bytes, and a real one reads billions, so
                  the honest statement is that the method needs a model good
                  enough that its uncertainty is informative on text it has not
                  seen, and that nothing on this page establishes how much text
                  that takes. What the measurement does establish is the direction
                  of the failure. When the guesser is out of its depth the blocks
                  get shorter rather than worse, so the cost lands on the sequence
                  length, which is the one thing the method was bought for.
                </p>
                <KeepInMind>
                  A fixed block size is the safe choice in exactly the case the
                  uncertainty rule is worst in, since its sequence length is the
                  same on writing the model knows and writing it has never met.
                  That is a real argument for MegaByte&rsquo;s rule, and it is
                  the argument the measurements here support most strongly.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="22. The blocks belong to the guesser, not to the text">
                <p>
                  Everything else in this section produces pieces that are a
                  property of the text and of a table somebody can inspect. Here
                  the pieces are a property of a model, and changing the model
                  changes them with nothing to say that either answer is the
                  right one. Take one sentence the guesser knows and read it under
                  four of them.
                </p>
                <NumberTable
                  headings={["the guesser", "blocks", "the last word comes out as"]}
                  rows={[
                    ["looking back 2 bytes", "15", "Mon, day."],
                    ["looking back 3 bytes", "7", "Mond, ay."],
                    ["looking back 4 bytes", "6", "Monday."],
                    ["looking back 4, half the sentences", "6", "on Monday. as one block"],
                  ]}
                  caption="The same 34 bytes, four models, four different sets of pieces. The last two make the same number of blocks and not the same blocks."
                />
                <p>
                  The fourth row is the one worth stopping at. Half the corpus was
                  removed, the sentence still comes to six blocks, and the pieces
                  are different, so a downstream model trained on one of these is
                  reading a different sequence from a model trained on the other
                  even where the counts agree. A learned vocabulary has no
                  equivalent of this, since a table is a small artefact somebody
                  can ship and read, whereas a guesser&rsquo;s uncertainty on a
                  particular stretch cannot be recovered from anything smaller
                  than the whole model.
                </p>
                <KeepInMind>
                  Nothing here is undefined in the sense of a division by zero.
                  What is undefined is the question &ldquo;what are the pieces of
                  this text&rdquo;, which has no answer until a model is named,
                  and a different answer for every model.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The threshold is not determined by anything">
                <p>
                  The number the cut is made at has no value the mathematics
                  prefers, and it does not merely tune the answer, it spans the
                  whole range of possible answers. On the eighteen sentences it
                  takes the total from 188 blocks to 18, and 18 is one block per
                  sentence, meaning the model has been handed each sentence whole
                  and the grouping has done nothing at all.
                </p>
                <NumberTable
                  headings={["threshold, in bits", "blocks", "cuts inside a word"]}
                  rows={[
                    ["0.25", "188", "66 of 170"],
                    ["1.00", "129", "32 of 111"],
                    ["1.50", "88", "13 of 70"],
                    ["2.00", "57", "0 of 39"],
                    ["3.00", "18", "0 of 0"],
                  ]}
                  caption="All eighteen sentences, looking back four bytes. At three bits every sentence is one block, so there are no cuts to sort."
                />
                <p>
                  The row at two bits is the interesting one. Not a single cut
                  falls inside a word, which sounds ideal until you notice that
                  the eighteen sentences have 115 word starts and this setting
                  found 39 boundaries, so the reason none of them is wrong is that
                  there are too few of them for any to be. There is no setting at
                  which the method reports how confident it is in a boundary, and
                  no quantity it produces that a person could threshold on
                  instead.
                </p>
                <KeepInMind>
                  A free parameter that trades two things off is ordinary. This
                  one has no scale attached, since a bit of uncertainty means
                  something different for every guesser, so a threshold tuned for
                  one model says nothing about what to use for another.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A block has no identity, which is what a vocabulary was for">
                <p>
                  The deepest limit here is not a degenerate input. It is the
                  method working exactly as designed. Across the eighteen
                  sentences the rule produces 129 blocks with 77 distinct
                  spellings between them, and the run The followed by a space is
                  one of those blocks twelve separate times. Nothing in the method
                  notices. There are twelve runs of four bytes that happen to
                  agree, and each of them is presented to the model afresh.
                </p>
                <Equation>
                  {"129 blocks    77 distinct spellings    The␣ appears 12 times"}
                </Equation>
                <p>
                  A vocabulary is exactly the thing that would have said those
                  twelve are one word, which is what makes a frequent piece cheap
                  and what lets a model gather up everything it has learned about
                  a word across all its occurrences into one row. Nothing
                  downstream here can count how often a piece appeared or look up
                  what was learned about it, because there is no piece to look up.
                  Handing that job to the model is a real design and it is not a
                  free one.
                </p>
                <KeepInMind>
                  The small model reading a block does the work a table row would
                  have done, and it does it again for every occurrence. Whether
                  that is worth the sequence length it buys is a question about a
                  particular model at a particular size, and it is not settled by
                  anything on this page.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Where the arithmetic decides nothing">
                <p>
                  Gathered in one place, these are the inputs on which the method
                  stops being defined rather than becoming approximate, together
                  with what has to be decided and what turns on it. The ones with
                  a genuine choice attached are the ones worth a reader&rsquo;s
                  attention, since nothing in the mathematics makes them and
                  somebody has to.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what is undefined, or what must be decided"
                  rows={[
                    {
                      expression: "a stretch of bytes nobody has seen",
                      reason:
                        "defined, and it says the wrong thing. With no counts every value is equally likely, so the uncertainty is exactly 8 bits, which is also what a position genuinely open to anything gives. The two are indistinguishable in the number the cut is made from, and 26 of the 51 positions of our sentence are the first kind.",
                    },
                    {
                      expression: "where to put the threshold",
                      reason:
                        "a decision with no scale attached. On the same eighteen sentences it spans 188 blocks down to 18, and 18 is one whole sentence per block. A bit of uncertainty means something different for every guesser, so a value tuned against one says nothing about another.",
                    },
                    {
                      expression: "what counts as high",
                      reason:
                        "a decision between two rules that are opposites on the case that arises. Above a level cuts at every position of a flat run; risen by a step cuts at none of them. On our held-out sentence the identical numbers give 30 blocks one way and 7 the other, and neither is obviously right.",
                    },
                    {
                      expression: "the first byte of a text",
                      reason:
                        "not decided by the rule, since there is no previous position to compare it with and no context in front of it. It is made the start of a block by convention, which every implementation does and none derives.",
                    },
                    {
                      expression: "a block that stops part way through a letter",
                      reason:
                        "not text, and both rules can produce it, since both cut between bytes and neither has any notion of a character. On a sentence with two accented letters a fixed size of four leaves two positions where neither side of the cut spells anything.",
                    },
                    {
                      expression: "how long a block may be",
                      reason:
                        "unbounded under the uncertainty rule, and that is a problem rather than a freedom. A stretch the guesser is sure of is never cut, so a wholly predictable text is a single block however long it is, and whatever reads the bytes inside a block has to be sized for a length nothing bounds.",
                    },
                    {
                      expression: "how many blocks a text will come to",
                      reason:
                        "not a function of the text at all, so it cannot be known before the guesser has read it. A fixed size gives the byte count divided by the size; here two texts of equal length differ by a factor of three depending on whether the model has met writing like them.",
                    },
                    {
                      expression: "which pieces a text has",
                      reason:
                        "undefined until a guesser is named, and different for each one. Four models cut the same 34 bytes four ways, and two of them make six blocks that are not the same six. A table can be shipped and inspected; the pieces here can only be recovered by running the model.",
                    },
                    {
                      expression: "how often a piece occurs",
                      reason:
                        "outside the method entirely, which is what was given up. No block has a name, so two occurrences of the same run of bytes share nothing, and 12 of the 129 blocks in the corpus are the same four bytes with no part of the method aware of it.",
                    },
                    {
                      expression: "a text with nothing in it",
                      reason:
                        "defined, and it is no blocks at all under either rule. A single byte is one block, since the first byte always starts one, and this is the one place the two rules and the fixed size cannot disagree.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying. The quantity being thresholded
                  cannot tell a genuinely open position from a position the
                  guesser knows nothing about, and it reports both at the ceiling.
                  And the pieces are a property of the guesser rather than of the
                  text, so &ldquo;how is this text cut up&rdquo; is a question
                  with no answer until somebody says which model is doing the
                  cutting.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
