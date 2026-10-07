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
import { CorpusConditionChart } from "@/components/widgets/CorpusConditionChart";
import { CutLandingChart } from "@/components/widgets/CutLandingChart";
import { PatchExplorer } from "@/components/widgets/PatchExplorer";
import { UncertaintyProfile } from "@/components/widgets/UncertaintyProfile";

export const metadata: Metadata = {
  title: "Patching Without a Vocabulary · oop_ml",
  description:
    "Group byte sequences into patches using fixed sizes or predictability-based boundaries.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PatchingWithoutAVocabularyPage() {
  return (
    <ConceptPage
      lessonId="patching-without-a-vocabulary"
      intuition={lessonIntuitions["patching-without-a-vocabulary"]}
      technicalStart="Part 2. Cutting at a Fixed Size"
      openingTitle="Bytes Solve Coverage and Create a Length Problem"
      playgroundIntro="Compare the byte count with the patch count. Inspect fixed and adaptive boundaries, especially around stretches whose next bytes are difficult to predict."
      title="Patching Without a Vocabulary"
      tagline="Group byte sequences into patches using fixed sizes or predictability-based boundaries."
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

      playground={<PatchExplorer />}
      sections={[
        {
          title: "Part 1. The Length the Bytes Cost",
          defaultOpen: true,
          content: (<>
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
</>),
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
                <>
<p>
                  The orange line is the fixed rule at every block size from one to twelve, and it stays between 57.0 and 74.5 per cent, with the baseline of 65.6 running through the middle of that range. Some sizes are a little better than cutting anywhere and some are worse. That is not a failure of tuning.
                </p>
                <p>
                  A rule that does not read the text cannot know where the words are, so picking a different block size moves the number of blocks without moving the quality of a single cut. The blue line, which is the next Part, is what happens when the text is allowed a say.
                </p>
</>
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
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "A block under this method has an identity and a row the model learns, the way a merged vocabulary’s piece does.",
              false,
              "A block is still several byte values, and what the model gets is a single vector it works out from them. Nothing on this page produces a table, a number for a piece, or anything that could be looked up, so two occurrences of the same word are two runs of bytes that happen to agree and no part of the method notices that they do.",
            ),
            choice(
              "Why is the length that matters the number of blocks rather than the number of bytes?",
              [
                "Only the large model, which reads the sequence of block vectors, is charged the square of the length",
                "The small model reading inside a block is the slower of the two",
                "A block stores fewer bytes than it was handed",
                "The bytes are discarded once a block has been formed",
              ],
              0,
              "The arrangement has two halves. A small model reads the bytes inside a block and produces one vector for it, and a large model reads the sequence of those vectors and never sees a byte at all.",
            ),
            choice(
              "How often does a cut at a fixed block size land inside a word, across the eighteen sentences?",
              [
                "Between 57.0 and 74.5 per cent depending on the size, around a baseline of 65.6 per cent",
                "28.8 per cent, which is what makes it a real method",
                "Never, because the cuts are regular",
                "It falls steadily as the block size rises",
              ],
              0,
              "Of the 745 positions a cut could fall in, 489 have a letter or a digit on both sides, which is the 65.6 per cent an uninformed cut gives. A rule that does not read the text cannot know where the words are, so moving the block size moves the number of blocks without moving the quality of a single cut.",
            ),
            trueFalse(
              "Cutting at a fixed byte offset can split one character across two blocks, and the text still reads back whole.",
              true,
              "A character can take more than one byte, and in the sentence with Ångström in it the two bytes of one letter fall either side of the boundary at offset 12, so neither side of that cut spells anything. Every byte is still there in order, and what has happened is that the small model reading one block is sometimes handed half a letter. On the eighteen English sentences the case never arises, which is why a measurement taken only on English reports this cost as zero.",
            ),
            trueFalse(
              "The fixed rule is the one rule here whose sequence length is known before the text is read.",
              true,
              "The number of blocks is the number of bytes divided by the size, with nothing to fit, nothing to store and nothing that can go stale. At a size of one it is the byte reading again, 51 blocks for 51 bytes, and past the length of the text it is one block with the whole sentence handed to the small model.",
            ),
        ],
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
                  <p>
                    Here is the first of them written out. One value holds
                    2∕257 of the probability and each of the other 255 holds
                    1∕257, and every value contributes its probability times
                    the logarithm of one over that probability.
                  </p>
                  <Equation>
                    {"H(after the start)  =  (2∕257) × log₂(257∕2)  +  255 × (1∕257) × log₂(257)\n" +
                      "                    ≈  0.05452  +  7.94332  =  7.99784"}
                  </Equation>
                  <p>
                    The 255 values nobody saw supply 7.94 of those bits between
                    them. Seeing a once moved one value from one share to two,
                    and against 255 others holding a share each that is a
                    change in the third decimal place.
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
                <>
<p>
                  On text the model knows well the two usually agree, since a word start is both high and higher than the letter before it. They part company on a flat stretch. Where the uncertainty stays at 8 bits for a long run, which is what happens on writing the model has never seen, the first rule cuts at every single position and the second cuts at none of them, because a plateau has no rises.
                </p>
                <p>
                  On our held-out sentence that is 30 blocks under the first rule and 7 under the second, from the identical set of numbers.
                </p>
</>
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
                <WorkedExample title="Solving for nine tenths">
                  <p>
                    Set the probability of the value that was seen to nine
                    tenths and solve for n, the number of times the stretch was
                    seen with that continuation.
                  </p>
                  <Equation>
                    {"(n + 1) ∕ (n + 256)  =  0.9\n" +
                      "n + 1  =  0.9 n + 230.4\n" +
                      "0.1 n  =  229.4\n" +
                      "n  =  2,294"}
                  </Equation>
                  <p>
                    The 256 in the denominator is what makes the number so
                    large. Every sighting has to outweigh the one observation
                    credited to each of the 255 values that never came, and at
                    a single sighting the same expression is 2∕257, which is
                    under one per cent.
                  </p>
                </WorkedExample>
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
                <>
<p>
                  The left panel is the ordinary setting. Twenty copies of the sentence put the position inside a word at 7.4674 bits and the word start at 7.5862, a gap of 0.1189 bits at a height where everything is nearly maximal, and the text comes out as 22 blocks for 22 bytes at every threshold that cuts anything at all.
                </p>
                <p>
                  The right panel credits an unseen byte with a thousandth instead. At twenty copies the same two positions are 0.106 and 1.099, a gap of nearly a whole bit, and a threshold at half a bit falls cleanly between them.
                </p>
</>
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
                  The edge is sharp because of where the threshold of half a
                  bit happens to sit, and the numbers either side of it show
                  how little moved. At seven copies twelve of the 22 positions
                  score 0.5005 bits, which is over the threshold by the
                  narrowest of margins, and with four word starts at 1.2535
                  that makes sixteen positions over the line and sixteen
                  blocks. At eight copies those twelve score 0.4457 and the
                  word starts 1.2253, so only the four are still above it, at
                  the first letters of cat, sat, on and mat, and four cuts
                  make five blocks.
                </p>
                <p>
                  Nothing about the sentence changed between the two. One more
                  copy lowered every uncertainty a little, and a whole class
                  of positions crossed the threshold together. A threshold of
                  0.6 puts the same edge between five copies and six, and one
                  of 0.4 puts it between nine and ten, which is the sense in
                  which the edge belongs to the setting rather than to the
                  writing.
                </p>
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
                <>
<p>
                  The reason is that in this corpus the start of a word is exactly as predictable as the inside of one. After the space in the cat the only thing that ever came was a c, so the model is as certain there as it is between the t and the h of the. What made section 15 work was that two different words followed the same short stretch, since e followed by a space led sometimes to cat and sometimes to mat.
                </p>
                <p>
                  So the uncertainty at a word start measures how many different words the corpus put after that stretch, and a corpus with one word there produces none of it.
                </p>
</>
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
                <>
<p>
                  A byte of context is one letter, and one letter does not tell you where you are in a word, so the first row is close to the uninformed rate for the same reason the fixed rule is. By four bytes the model is looking at most of a short word and the cuts are more than twice as good, and the fifth byte adds little, which is roughly where the improvement stops on a corpus this small.
                </p>
                <p>
                  It stops because a longer stretch occurs less often, so each extra byte of context leaves more of the text scored under stretches the corpus never contained.
                </p>
</>
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
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "What does the uncertainty rule cut on?",
              [
                "Positions where the next byte is hard to guess, measured as the entropy of the guesser’s spread over the 256 values",
                "Positions where a space occurs in the text",
                "Positions where the byte value itself passes a threshold",
                "Positions a learned table has marked as boundaries",
              ],
              0,
              "The difficulty of the guess falls through a word and jumps at the join between two, which is Harris’s observation. Nothing about it is specific to words or to English, and it works on a script with no spaces for the same reason it works on one with them. Nothing has to be stored and something has to be trained, which is a swap rather than a saving.",
            ),
            trueFalse(
              "A reading of exactly 8 bits means the text genuinely could go several ways at that position.",
              false,
              "A stretch the corpus never contained comes out flat, since after the small amount is added every one of the 256 values has the same probability, and a flat spread over 256 outcomes is 8 bits by the definition. The ceiling means either that anything could come next or that nobody knows, and the method cuts at both and cannot tell them apart.",
            ),
            choice(
              "On a run that stays at 8 bits, how do the two cutting rules differ?",
              [
                "The level rule cuts at every position and the rise rule at none, which is 30 blocks against 7 on the held-out sentence",
                "They agree, since both are read off the same numbers",
                "The rise rule cuts at every position and the level rule at none",
                "Neither cuts, because a plateau carries no information",
              ],
              0,
              "On text the model knows well the two usually agree, since a word start is both high and higher than the letter before it. A plateau has no rises, so on the case that actually arises they are opposites, and neither answer is obviously the right one.",
            ),
            several(
              "Which of these hold for the guesser of Part 4?",
              [
                "With one observation credited to every unseen value, a stretch has to be seen with the same continuation 2,294 times before the guesser is ninety per cent sure of it",
                "Twenty copies of the phrase the cat sat score every one of its eleven positions at 0.198144 bits, so the phrase is one block at any threshold",
                "Reading a hundred times more text repairs the flatness, even for a stretch that is still rare",
                "Looking back one byte cuts better than looking back four, since a shorter stretch has been seen more often",
              ],
              [0, 1],
              "Seen once with one continuation, the observed value holds two shares against one each for the other 255, which is barely distinguishable from flat. That is a property of the credit and of there being 256 values rather than of the corpus, so more text does not fix it for a stretch that is still rare. The repeated phrase fails the other way, since the start of a word there is exactly as predictable as the inside of one. And on the eighteen sentences context helps, with one byte back putting 63.0 per cent of its cuts inside a word and four bytes back 28.8 per cent.",
            ),
            trueFalse(
              "Reading twenty copies of one sentence gives the guesser something that one copy with a smaller credit for unseen bytes could not.",
              false,
              "Multiplying every count by a number and then adding a fixed amount to each gives the same spread as leaving the counts alone and adding that amount divided by the number. Measured, twenty copies with a thousandth credited to each unseen byte and one copy with a twenty thousandth agree at every one of the 22 positions to 1.7 parts in 10¹⁶ and cut the sentence into identical blocks, so the corpus-size axis is the credit axis in disguise.",
            ),
        ],
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
                <>
<p>
                  I want to be careful about what this does and does not show. The guesser here read 763 bytes, and a real one reads billions, so the honest statement is that the method needs a model good enough that its uncertainty is informative on text it has not seen, and that nothing on this page establishes how much text that takes.
                </p>
                <p>
                  What the measurement does establish is the direction of the failure. When the guesser is out of its depth the blocks get shorter rather than worse, so the cost lands on the sequence length, which is the one thing the method was bought for.
                </p>
</>
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
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            trueFalse(
              "On the eighteen sentences the uncertainty rule produces a shorter sequence than the merged vocabulary does.",
              true,
              "763 bytes become 129 blocks, a factor of 5.9, where the merged vocabulary on the same text takes 263 numbers, and the uncertainty rule holds no table at all. A model comparing every position with every other does work in proportion to the square of the length, so 129 against 763 is around 35 times less of it.",
            ),
            choice(
              "On the held-out sentence about Dr Alvarez, how do the three readings compare?",
              [
                "The merged vocabulary gives 25 numbers, the fixed rule 13 blocks and the uncertainty rule 30",
                "The uncertainty rule gives the shortest of the three",
                "All three come to about the same length",
                "The fixed rule gives the longest, since it reads nothing",
              ],
              0,
              "26 of the sentence’s 51 positions come out at exactly 8 bits, because the four-byte stretch in front of each never occurred in 763 bytes of text. On text it knows the rule gives 5.9 bytes to a block and here it gives 1.7, so it loses both to the thing it was meant to replace and to a rule with no model behind it at all.",
            ),
            trueFalse(
              "Across the eighteen sentences the rule produces 129 blocks with 77 distinct spellings, and the run The followed by a space is one of those blocks twelve separate times.",
              true,
              "Nothing in the method notices. There are twelve runs of four bytes that happen to agree, and each is presented to the model afresh. A vocabulary is exactly the thing that would have said those twelve are one word, which is what makes a frequent piece cheap and what lets a model gather what it has learned about a word into one row.",
            ),
            choice(
              "At a threshold of two bits, not one cut on the eighteen sentences falls inside a word. Why is that not the ideal setting?",
              [
                "The eighteen sentences hold 115 word starts and the setting found 39 boundaries, so there are too few cuts for any to be wrong",
                "Two bits is outside the range the entropy can take",
                "Those sentences hold no words long enough to cut inside",
                "Two bits sits below the uninformed baseline of 65.6 per cent",
              ],
              0,
              "The threshold does not merely tune the answer, it spans the whole range of possible answers, taking the total from 188 blocks to 18, where 18 is one block per sentence and the grouping has done nothing at all. There is no setting at which the method reports how confident it is in a boundary.",
            ),
            several(
              "Which of these follow from the pieces being a property of the guesser rather than of the text?",
              [
                "A threshold tuned for one model says nothing about what to use for another",
                "Removing half the corpus can leave the same number of blocks with different pieces",
                "A guesser’s uncertainty on a stretch cannot be recovered from anything smaller than the whole model",
                "The text can no longer be read back from its blocks",
              ],
              [0, 1, 2],
              "Nothing here is undefined in the sense of a division by zero, and the bytes are all still there in order. What is undefined is the question of what the pieces of a text are, which has no answer until a model is named and a different answer for every model. A bit of uncertainty means something different for every guesser, so the threshold has no scale attached.",
            ),
        ],
        },
        {
          title: "Practice. Cutting Bytes Into Blocks With the Library",
          practice: [
            exercise(
              "Cut at a fixed size",
              ["Cut the running sentence every four bytes with a FixedSizePatcher and print how many blocks it comes to and what they spell. Then cut the sentence with Ångström in it the same way, and print how many blocks it makes and the offsets at which a block, read on its own, is not text. Last, cut all eighteen sentences at block sizes of 4, 6, 8 and 12 and print the total number of blocks at each.", "The first line should be the thirteen blocks of section 5, the offsets should be the two either side of the split letter in section 7, and the totals for 4, 8 and 12 should be the table of section 6. The table has no row for a size of 6."],
              `from oop_ml.core.natural_language_processing.tokenization.characters.patching import (
    FixedSizePatcher,
)

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
accented = "Dr. \\u00c5ngstr\\u00f6m expected the re-analysis."

# Build a FixedSizePatcher with patch_size=4 and patch the sentence.
# Print n_patches and the text of every block.

# Patch the accented sentence. A block cut part way through a letter
# decodes with the replacement character "\\ufffd" in its text, so print
# n_patches and the start of every block whose text holds one.

# For each size in 4, 6, 8 and 12, add up n_patches over the corpus.`,
              `from oop_ml.core.natural_language_processing.tokenization.characters.patching import (
    FixedSizePatcher,
)

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
accented = "Dr. \\u00c5ngstr\\u00f6m expected the re-analysis."

fours = FixedSizePatcher(patch_size=4)
blocks = fours.patch(sentence)
print(f"{blocks.n_patches} blocks: {[piece.text for piece in blocks]}")

broken = [piece.start for piece in fours.patch(accented) if "\\ufffd" in piece.text]
print(f"accented: {fours.patch(accented).n_patches} blocks, not text at offsets {broken}")

for size in (4, 6, 8, 12):
    cutter = FixedSizePatcher(patch_size=size)
    total = sum(cutter.patch(text).n_patches for text in corpus)
    print(f"every {size:2d} bytes: {total} blocks over the eighteen sentences")`,
              `13 blocks: ['Dr. ', 'Alva', 'rez ', 'didn', "'t e", 'xpec', 't th', 'e lo', 'w-co', 'st r', 'e-an', 'alys', 'is.']
accented: 10 blocks, not text at offsets [8, 12]
every  4 bytes: 197 blocks over the eighteen sentences
every  6 bytes: 135 blocks over the eighteen sentences
every  8 bytes: 102 blocks over the eighteen sentences
every 12 bytes: 72 blocks over the eighteen sentences`,
              { hints: ["FixedSizePatcher takes patch_size and is never fitted. Its patch method takes a text and answers the blocks, which know n_patches and can be looped over.", "Each block carries its text, its start and its end as byte offsets. The accented sentence is written with escapes so that the script holds only plain characters, and nothing here prints a letter a terminal might refuse.", "The corpus total is a sum over the eighteen sentences of each one’s n_patches, with a new patcher for each size."], check: numberCheck("How many blocks do the eighteen sentences come to at a block size of 6?", 135, 0.0, "The number of blocks is the bytes divided by the size and rounded up, taken one sentence at a time. 763 bytes over 6 is a little over 127, and rounding up once for each of the eighteen sentences brings the total to 135. The quality of the cuts has not moved, which is section 6’s point, since a rule that does not read the text only ever changes how many blocks there are.") },
            ),
            exercise(
              "Cut where the next byte is hard to guess, under both rules",
              ["Fit an EntropyPatcher on twenty copies of the eighteen sentences, looking back four bytes, with a threshold of one bit and a thousandth credited to every unseen byte, which are the settings behind Parts 3 and 5. Do it once for each of the two rules of section 11. For each, print the blocks of the first corpus sentence, the number of blocks the running sentence comes to, and the total over the corpus with the bytes per block to two places. Then print how many of the running sentence’s positions score 8 bits.", "Under the level rule you should get the six blocks of section 12, the 30 of section 20 and the 129 of section 19, and 26 positions at the ceiling. Under the rise rule the running sentence should come to the 7 of section 11. The page never puts the rise rule to the whole corpus."],
              `from oop_ml.core.natural_language_processing.tokenization.characters.patching import (
    EntropyPatcher,
    PatchingRule,
)

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

for rule in (PatchingRule.GLOBAL_THRESHOLD, PatchingRule.RELATIVE_INCREASE):
    # Build an EntropyPatcher with order=4, threshold=1.0, smoothing=0.001
    # and this rule, and fit it on corpus * 20. Print the rule's value, the
    # block texts of corpus[0], n_patches for the sentence, and the corpus
    # total with 763 divided by it.
    ...

# entropies_of gives one number per byte. Count the sentence's positions
# that are at 8 bits, allowing for rounding in the last place.`,
              `from oop_ml.core.natural_language_processing.tokenization.characters.patching import (
    EntropyPatcher,
    PatchingRule,
)

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

for rule in (PatchingRule.GLOBAL_THRESHOLD, PatchingRule.RELATIVE_INCREASE):
    guesser = EntropyPatcher(order=4, threshold=1.0, smoothing=0.001, rule=rule).fit(corpus * 20)
    total = sum(guesser.patch(text).n_patches for text in corpus)
    print(rule.value)
    print(f"  the sentence it read: {[piece.text for piece in guesser.patch(corpus[0])]}")
    print(f"  the running sentence: {guesser.patch(sentence).n_patches} blocks")
    print(f"  the corpus: {total} blocks, {763 / total:.2f} bytes to a block")

entropies = guesser.entropies_of(sentence)
flat = sum(value > 8.0 - 1e-9 for value in entropies)
print(f"positions at 8 bits: {flat} of {len(entropies)}")`,
              `global_threshold
  the sentence it read: ['The ', 're', 'port was ', 'expected ', 'on ', 'Monday.']
  the running sentence: 30 blocks
  the corpus: 129 blocks, 5.91 bytes to a block
relative_increase
  the sentence it read: ['The ', 're', 'port was ', 'expected on Monday.']
  the running sentence: 7 blocks
  the corpus: 79 blocks, 9.66 bytes to a block
positions at 8 bits: 26 of 51`,
              { hints: ["EntropyPatcher takes order, threshold, smoothing and rule as keywords, and fit takes a list of texts and answers the fitted patcher, so the two can be chained. corpus * 20 is the list repeated twenty times.", "patch answers the same kind of blocks the fixed rule does, with n_patches and a text on each. A rule is an enum member, and its value is the readable name.", "The uncertainties do not depend on the rule, only the cuts do, so entropies_of from either fitted patcher gives the same numbers. A stretch the corpus never held scores 8 to within rounding, so compare against 8 less a billionth rather than against 8 exactly."], check: numberCheck("How many blocks do the eighteen sentences come to under the rise rule?", 79, 0.0, "An uncertainty is never negative, so a position that has risen more than a bit above the one before it is also above one bit, and every cut the rise rule makes is one the level rule makes too. It makes 61 of the level rule’s 111, which is 79 blocks against 129. On the sentence the guesser read it joins expected, on and Monday into one block, because the uncertainty at those two word starts was above one bit without being a whole bit above the position before.") },
            ),
            exercise(
              "Look further back, on text the guesser has and has not read",
              ["Section 18 lengthens the stretch the guess is conditioned on and watches the corpus come out in fewer blocks. Do the same from one byte back to six, and beside the corpus total print what the page does not, which is the number of blocks the running sentence comes to and how many of its 51 positions score 8 bits.", "The corpus column should be the table of section 18 with a sixth row added. Watch the other two columns move the opposite way, and find the context length at which the sentence the guesser never read is shortest."],
              `from oop_ml.core.natural_language_processing.tokenization.characters.patching import (
    EntropyPatcher,
)

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

for order in (1, 2, 3, 4, 5, 6):
    # Fit an EntropyPatcher with this order, threshold=1.0 and
    # smoothing=0.001 on corpus * 20. Print the order, the corpus total of
    # n_patches, n_patches for the sentence, and how many of the sentence's
    # entropies are within a billionth of 8.
    ...`,
              `from oop_ml.core.natural_language_processing.tokenization.characters.patching import (
    EntropyPatcher,
)

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

for order in (1, 2, 3, 4, 5, 6):
    guesser = EntropyPatcher(order=order, threshold=1.0, smoothing=0.001).fit(corpus * 20)
    read = sum(guesser.patch(text).n_patches for text in corpus)
    unread = guesser.patch(sentence).n_patches
    flat = sum(value > 8.0 - 1e-9 for value in guesser.entropies_of(sentence))
    print(f"{order} back: corpus {read:3d} blocks, running sentence {unread} blocks, {flat:2d} positions at 8 bits")`,
              `1 back: corpus 693 blocks, running sentence 44 blocks,  0 positions at 8 bits
2 back: corpus 338 blocks, running sentence 25 blocks, 10 positions at 8 bits
3 back: corpus 191 blocks, running sentence 27 blocks, 21 positions at 8 bits
4 back: corpus 129 blocks, running sentence 30 blocks, 26 positions at 8 bits
5 back: corpus 110 blocks, running sentence 34 blocks, 31 positions at 8 bits
6 back: corpus  98 blocks, running sentence 38 blocks, 36 positions at 8 bits`,
              { hints: ["order is the number of preceding bytes the guess is conditioned on. Everything else stays as it was in the problem before, with the rule left at its default, which is the level rule.", "entropies_of answers one uncertainty per byte of the text. Summing a comparison over them counts the positions for which it holds."], check: numberCheck("How many blocks does the running sentence come to when the guesser looks back two bytes?", 25, 0.0, "Two bytes back is the shortest the sentence gets. From there every byte of context added makes the corpus shorter and this sentence longer, 27, 30, 34 and 38 blocks, because a longer stretch occurs less often and more of an unread text is scored under stretches the corpus never held, 10 positions at 8 bits with two bytes back and 36 of the 51 with six. One byte back is worse again for the opposite reason, since nothing is at the ceiling and a single letter says too little, which is the first row of the table in section 18.") },
            ),
            exercise(
              "Find the edge between seven copies and eight",
              ["Take the six-word sentence about the cat. For seven, eight and twenty copies of it, fit an EntropyPatcher that looks back two bytes with a threshold of half a bit and a thousandth credited to unseen bytes, and print the blocks it cuts the sentence into, with the uncertainty at the second byte to four places. Then fit one copy with a twenty thousandth credited, and print the largest difference between its uncertainties and those of the twenty copies, and whether the two cut the sentence into the same blocks.", "You should see the sixteen blocks and the five of section 15, and the agreement of section 16 to about sixteen decimal places. Read the uncertainty at the second byte against the threshold at seven copies and at eight, and the sharpness of the edge is explained."],
              `from oop_ml.core.natural_language_processing.tokenization.characters.patching import (
    EntropyPatcher,
)

cat = "the cat sat on the mat"

for copies in (7, 8, 20):
    # Fit with order=2, threshold=0.5, smoothing=0.001 on [cat] * copies.
    # Print the copies, n_patches for cat, the entropy at position 1 to
    # four places, and the block texts.
    ...

# Fit the same settings on twenty copies, and on one copy with smoothing
# 0.001 / 20. Print the largest absolute difference between their
# entropies of cat, and whether their patches of cat are equal.`,
              `from oop_ml.core.natural_language_processing.tokenization.characters.patching import (
    EntropyPatcher,
)

cat = "the cat sat on the mat"

for copies in (7, 8, 20):
    guesser = EntropyPatcher(order=2, threshold=0.5, smoothing=0.001).fit([cat] * copies)
    blocks = guesser.patch(cat)
    second = guesser.entropies_of(cat)[1]
    print(f"{copies:2d} copies: {blocks.n_patches:2d} blocks, second byte at {second:.4f} bits")
    print(f"           {[piece.text for piece in blocks]}")

many = EntropyPatcher(order=2, threshold=0.5, smoothing=0.001).fit([cat] * 20)
one = EntropyPatcher(order=2, threshold=0.5, smoothing=0.001 / 20).fit([cat])
gap = max(abs(a - b) for a, b in zip(many.entropies_of(cat), one.entropies_of(cat)))
print(f"largest difference {gap:.1e}, same blocks {many.patch(cat) == one.patch(cat)}")`,
              ` 7 copies: 16 blocks, second byte at 0.5005 bits
           ['t', 'he ', 'c', 'a', 't ', 's', 'a', 't ', 'o', 'n', ' ', 't', 'he ', 'm', 'a', 't']
 8 copies:  5 blocks, second byte at 0.4457 bits
           ['the ', 'cat ', 'sat ', 'on the ', 'mat']
20 copies:  5 blocks, second byte at 0.1981 bits
           ['the ', 'cat ', 'sat ', 'on the ', 'mat']
largest difference 1.7e-16, same blocks True`,
              { hints: ["[cat] * copies is a list holding the sentence that many times, which is what fit takes. The settings are order=2, threshold=0.5 and smoothing=0.001.", "entropies_of(cat) is one number per byte, so index 1 is the h of the first word, an ordinary position inside a word.", "Two sets of blocks compare equal with == when they cut the text at the same places, and zip pairs the two lists of uncertainties position by position."], check: numberCheck("What is the uncertainty at the second byte at seven copies, to four places?", 0.5005, 5e-05, "The threshold is half a bit, and at seven copies an ordinary position inside a word scores 0.5005, which is over it by about five ten-thousandths, so the rule cuts there, the eleven other positions at the same figure go the same way, and the sentence is letters and fragments. At eight copies the same position scores 0.4457 and is left alone, and only the four word starts are still above the threshold. The edge is where one class of positions crosses a number somebody chose.") },
            ),
          ],
        },
      ]}
    />
  );
}
