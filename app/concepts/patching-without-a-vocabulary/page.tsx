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
  title: "Patching Without a Vocabulary · Perceptron Lab",
  description:
    "Representing text as bytes avoids dependence on a learned word vocabulary. Grouping nearby bytes into patches reduces the number of positions processed by later layers, changing how local information is combined.",
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
      playgroundTitle="Group the byte stream without looking up words"
      playgroundIntro="Compare the byte count with the patch count. Inspect fixed and adaptive boundaries, especially around stretches whose next bytes are difficult to predict."
      title="Patching Without a Vocabulary"
      tagline={"Representing text as bytes avoids dependence on a learned word vocabulary. Grouping nearby bytes into patches reduces the number of positions processed by later layers, changing how local information is combined."}
      prerequisites={
        <>
          {"The earlier lesson on "}{" "}
          <Link href="/concepts/bytes-and-characters" className={link}>
            bytes and characters
          </Link>{" "}
          {" shows how UTF-8 byte IDs cover unfamiliar spellings. That coverage can produce longer sequences than a fitted subword vocabulary. Here we will group bytes before the larger network processes them. The lesson on "}{" "}
          <Link href="/concepts/hashing-characters" className={link}>
            hashing characters
          </Link>{" "}
          {" addresses embedding-table size. Patching addresses the number of positions passed to later layers. We will use the same eighteen English sentences so the counts remain comparable. "}</>
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
                  Reading every byte preserves unfamiliar spellings, but gives a model more positions to process. Our example sentence becomes 51 byte IDs, compared with 25 IDs under the vocabulary fitted to eighteen report sentences. Across that corpus the counts are 763 and 263.
                </p>
                <p>
                  Could we combine nearby byte representations before the expensive stage that compares positions? A patch is such a group. We will first choose groups of a fixed size, then investigate boundaries chosen from a model’s predictions.
                </p>
                <Equation>
                  {"the sentence, as bytes      51\n" +
                    "the sentence, merged       25\n" +
                    "\n" +
                    "the corpus, as bytes      763\n" +
                    "the corpus, merged        263"}
                </Equation>

                <KeepInMind>
                  Everything measured here uses the same eighteen English
                  sentences and the same held-out sentence the two previous pages
                  use, so the numbers can be laid beside theirs. It is a very
                  small corpus, and Part 4 is entirely about what that does to
                  the method.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Grouping Bytes Without New Vocabulary Entries" id="2-the-repair-that-is-not-available">
                <p>Merging frequent byte sequences would shorten the representation by giving repeated strings vocabulary entries. We have already seen that benefit and its dependence on the fitted corpus. Here we want to investigate grouping bytes without requiring every group to be a stored vocabulary item. Choosing patch boundaries is a different operation from assigning a dictionary ID to a recurring string.</p>
                <p>
                  Could we group bytes without assigning each possible group a permanent vocabulary entry? We can choose boundaries for the current text, then pass the resulting blocks to the next stage. The model would process one representation per block instead of one per byte. Those blocks have no reusable vocabulary IDs; their boundaries and representations are computed for this input.
                </p>
                <KeepInMind>
                  {"A patch needs no dedicated vocabulary entry, but the byte embeddings and the models that encode and process patches still have parameters. Grouping bytes changes the interface; it does not eliminate learned representations."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What a block is, and why it is not an entry in a table">
                <p>
                  {"A patch is a consecutive run of bytes with recorded start and end offsets. A subword token such as cost selects one row from a learned embedding table. A patch containing the four bytes of cost instead supplies those byte values to an encoder, which computes its representation. The SDK here returns the grouped bytes; it does not train that encoder."}
                </p>
                <Equation>
                  {"a merged piece   =  one number, looked up in a table\n" +
                    "a block          =  a run of byte values, and where it starts"}
                </Equation>
                <p>
                  {"A local encoder combines byte representations into patch representations. The larger network then processes fewer positions. A generative model also needs a decoder to produce individual bytes. Patching reduces work in the larger network, but byte-level processing and the boundary predictor have costs too. Choosing boundaries is only one part of replacing a vocabulary-based input pipeline."}
                </p>
                <KeepInMind>
                  {"Repeated byte strings do not receive a reusable patch ID here. They can still share byte embeddings and encoder parameters, so a trained model can learn recurring patterns across their occurrences."}
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
                  {"Take the bytes in order and cut after every fourth one. The final patch may be shorter. For ten bytes, the boundaries and sizes are shown below. This rule needs no fitted corpus; record the patch size with the model so the same input is grouped consistently."}
                </p>
                <Equation>{"10 bytes, patch size 4\nstart offsets: 0, 4, 8\npatch sizes: 4, 4, 2"}</Equation>
                <Equation>
                  {"blocks  =  ⌈ bytes ∕ size ⌉"}
                </Equation>
                <p>
                  {"In 2023, Yu and colleagues introduced MegaByte to model long sequences of bytes using local and global networks. Fixed-size patches let the larger network operate less often while a smaller network handles byte-level details. Our example demonstrates its grouping rule, rather than reproducing the trained architecture."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://arxiv.org/abs/2305.07185">{"Yu et al., MEGABYTE (2023)"}</Link></p>
                <KeepInMind>
                  A fixed size gives an exactly predictable sequence length,
                  which nothing else on this page does, and that turns out to
                  matter for reasons Part 6 comes back to.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Cut the Alvarez sentence into four-byte patches" id="5-the-running-sentence-cut-every-four-bytes">
                <p>
                  {"The 51-byte sentence produces thirteen patches: twelve contain four bytes and the last contains three. Joining their raw bytes recovers the sentence. Individual patches often contain fragments of words, which lets us inspect what the local encoder would need to handle."}
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
                  {"Grouping alone preserves every byte and its order. Fixed boundaries often split words, but this does not prove the eventual model loses information. That depends on how its encoder represents each group."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Where those cuts land, counted against cutting anywhere">
                <p>
                  {"Count the possible cuts across all eighteen sentences. Of the 745 internal byte boundaries, 489 have a letter or digit on both sides. Uniformly selecting one of these boundaries gives the reference rate below. We will use it to compare alignment with this particular definition of a word interior. That is a diagnostic, rather than the objective of a trained patch model."}
                </p>
                <Equation>{"Inside-word reference rate = 489 / 745\n                           ≈ 65.6%"}</Equation>
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
                  {"The orange line shows fixed patch sizes from one to twelve. The inside-word cut rate ranges from 57.0% to 74.5%, around the 65.6% reference. Some sizes align better with these sentences than others. The rule itself does not inspect letters or spaces."}
                </p>
                <p>
                  {"Changing the patch size moves the boundaries, so it can change their alignment with words. It does not teach the rule where words begin. The blue line uses predictions from the text to choose boundaries instead."}
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
                  {"UTF-8 characters can use several bytes, so a fixed cut can divide one character. The 38-character example below uses 40 bytes. Cutting it into four-byte groups illustrates why decoding each patch separately can display replacement marks even though the complete byte sequence is valid."}
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
                  {"Join the original bytes before decoding and the accented letters return intact. The separate replacement marks come from the patch preview. MegaByte permits these byte-level cuts; a local network must handle the resulting fragments. Our all-ASCII corpus contains no multibyte characters, so it cannot measure this case."}
                </p>
                <KeepInMind>
                  {"An entropy-based boundary can divide a UTF-8 character too. Whether it does so more or less often depends on its predictor and the text. The eighteen ASCII sentences cannot establish that comparison."}
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
              "This patcher selects boundaries around runs of bytes. It does not assign every possible patch a vocabulary ID or a dedicated learned embedding row. A later encoder must calculate a vector from the bytes inside each patch. Identical patches can receive identical results from that encoder, but the boundary procedure alone does not create a stored patch vocabulary.",
            ),
            choice(
              "Why can grouping bytes into patches reduce the large sequence model’s pairwise attention work?",
              [
                "The large model’s full pairwise attention table uses patch positions rather than individual byte positions",
                "The small model reading inside a block is the slower of the two",
                "A block stores fewer bytes than it was handed",
                "The bytes are discarded once a block has been formed",
              ],
              0,
              "In the proposed architecture, a local encoder turns each byte group into one vector. The larger sequence model then processes those patch vectors, so its position count is the number of patches. Work still occurs inside the patches. This lesson implements the boundary selection, not the complete local encoder and sequence model.",
            ),
            choice(
              "How often does a cut at a fixed block size land inside a word, across the eighteen sentences?",
              [
                "Between 57.0 and 74.5 percent depending on the size, around a baseline of 65.6 percent",
                "28.8 percent, which is what makes it a real method",
                "Never, because the cuts are regular",
                "It falls steadily as the block size rises",
              ],
              0,
              "Of the 745 possible cut positions inspected here,489 lie between letters or digits, giving the 65.6-percent baseline. The fixed-size rule does not use those character categories when choosing a boundary. A particular width can happen to align better or worse with a particular sentence; changing width does not make it a word-boundary learner.",
            ),
            trueFalse(
              "Cutting at a fixed byte offset can split one character across two blocks, and the text still reads back whole.",
              true,
              "A UTF-8 character may span two blocks. Decoding the blocks separately can show replacement characters because a byte fragment is incomplete. The original bytes remain ordered, so joining those bytes before decoding restores the text. The accented probe demonstrates this at the boundary near offset twelve; the ASCII-only training sentences do not test that case.",
            ),
            trueFalse(
              "Once byte length is known, does fixed-size grouping determine patch count without inspecting the byte values?",
              true,
              "Once the byte length and patch size are known, divide the length into fixed-size groups and retain any final partial group. That determines the patch count without fitting. Size one returns one patch per byte. A size at least as large as a nonempty input returns one patch. Character count is insufficient when a character occupies several bytes.",
            ),
        ],
        },
        {
          title: "Part 3. Cutting Where the Next Byte Is Hard to Guess",
          content: (
            <>
              <SubSection title="8. The idea, before any arithmetic">
                <p>
                  {"Try predicting the next character as you read The repor. The final t may be easier to guess than the first letter of the next word. This suggests a way to allocate work: combine predictable runs, then begin a new patch when the model faces more alternatives. The pattern will not hold at every word boundary."}
                </p>
                <p>
                  {"This resembles the earlier branching idea discussed in the Harris lesson: use changes in possible continuations to help locate boundaries. Pagnoni and colleagues used next-byte prediction uncertainty in the 2024 Byte Latent Transformer. A learned predictor lets the grouping depend on context without requiring a dictionary entry for every patch. The rule can operate on writing without spaces, but its usefulness still depends on the predictor."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://arxiv.org/abs/2412.09871">{"Pagnoni et al., Byte Latent Transformer (2024)"}</Link></p>
                <KeepInMind>
                  {"The boundary rule needs a predictor and its saved parameters. This demonstration stores counts of which bytes followed each context. BLT uses a trained byte-level network. Both avoid a vocabulary of complete patches, while retaining a fitted model."}
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
                  {"For an unseen context, every count is zero. Adding the same positive amount to all 256 counts creates a uniform distribution with entropy 8 bits. Uniform smoothing is a modeling choice; the entropy then follows from that choice. The boundary score alone cannot distinguish this lack of evidence from a genuinely broad predicted distribution."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"The score measures uncertainty under the predictor. To investigate why it is high, inspect how often that context was observed and how its continuations were distributed."}
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Why four byte positions receive nearly the same uncertainty" id="10-four-bytes-worked-by-hand">
                <p>
                  {"Fit a one-byte context model to aab, adding one pseudo-observation to every possible continuation, including those already observed. The padded start context was followed by a once. The context a was followed by a once and b once. The resulting probabilities are shown below."}
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
                  {"Substitute these probabilities into the entropy formula in section 9. The fourth value is 8 bits because its context was unseen. The other values are within five thousandths of that ceiling."}
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
                  {"The position after a has lower entropy than the start context; the unseen b context has the highest. A threshold of 7.996 separates them and produces aab followed by b. The differences are small, so a tiny threshold change can alter the cuts. Small numerical differences do not by themselves make the score unusable; we still need to test the resulting groups."}
                </p>
                <KeepInMind>
                  {"A correct entropy calculation does not guarantee useful patches. Smoothing, context counts and the selected threshold determine which distinctions the rule actually makes."}
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
                  {"The rules can select different boundaries even on familiar text, because a high level need not be a large rise. On a flat stretch at 8 bits, a global threshold below 8 cuts at every position. A positive relative-increase threshold selects no internal position on that plateau."}
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
                  {"Start with a sentence included in the fitted corpus. It contains 34 bytes. At the displayed one-bit threshold, the model produces six patches. Several boundaries align with word starts, but the groups do not reproduce a one-word-per-patch segmentation."}
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
                  {"The four-byte rule produces nine patches on this sentence, with six of its eight internal cuts inside words. The entropy rule produces fewer patches with better word-start alignment in this example. That is evidence about these groupings, rather than proof of a better language model. Use the bars below to see which predicted entropies triggered each cut."}
                </p>
                <UncertaintyProfile />
                <p>
                  {"On the fitted sentence, several entropy rises line up with word starts. Others do not: report is split, and was stays with the preceding fragment. Switch to the held-out sentence and many bars reach 8 bits because the contexts were unseen. Compare those bars with the marked boundaries."}
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
                  {"The four values in section 10 are all within five thousandths of 8 bits. Add-one smoothing contributes substantial probability across the 256 outcomes when a context has few observations. A continuation seen once receives two shares, while the other 255 outcomes each receive one."}
                </p>
                <Equation>
                  {"p(the value that was seen)  =  (n + 1) ∕ (n + 256)"}
                </Equation>
                <p>
                  Under this smoothed counting model, the displayed threshold requires 2,294 matching observations before that continuation receives probability nine tenths. The small teaching corpus supplies far fewer observations for the relevant four-byte contexts, so its predicted uncertainty stays high at many positions. That leaves little separation for a threshold to use. It is a limitation demonstrated for this predictor and corpus, rather than a bound on repetition in real text generally.
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
                  {"The amount of smoothing matters relative to the observations for each context. More data can increase those counts, but rare or unseen contexts may remain. The number of possible four-byte contexts does not imply that every context is rare in a real corpus."}
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
                  {"The left panel uses add-one smoothing. With twenty copies, the displayed inside-word position has entropy 7.4674 bits and the word start has 7.5862 bits. The gap is 0.1189 bits using unrounded values. A low threshold splits this sentence into 22 patches; a threshold between these two scores can separate these positions."}
                </p>
                <p>
                  The right panel credits an unseen byte with a thousandth instead. At twenty copies the same two positions are 0.106 and 1.099, a gap of nearly a whole bit, and a threshold at half a bit falls cleanly between them.
                </p>
</>
                <KeepInMind>
                  {"Both panels use the same sentence and boundary rule. Changing the smoothing changes how strongly the observed counts affect the predicted distribution. Tune that choice using held-out behavior, rather than interpreting a cleaner-looking segmentation as sufficient evidence."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Eight copies recover the words and seven do not">
                <p>
                  {"At the displayed half-bit threshold, seven copies produce sixteen patches. Eight copies produce five larger groups with better word-start alignment. These groups still combine on and the, so they are not a recovered list of the sentence’s words."}
                </p>
                <WorkedExample title="One copy either side of the edge">
                  <Equation>
                    {"seven copies    16 blocks, mixing single bytes and longer fragments\n" +
                      "eight copies     5 blocks, the │cat │sat │on the │mat"}
                  </Equation>
                  <p>
                  {"The block on the contains two words. In this corpus, the context before the makes its first byte predictable enough to remain below the threshold. Smoothing leaves positive uncertainty; the score is low rather than exactly zero."}
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
                  Eight exact copies of one sentence supply 176 bytes, with a very strong repeated pattern. The eighteen varied sentences supply 763 bytes and behave differently: this rule needs a four-byte context, rather than two, before its blocks resemble words. Repetition in a tiny example can make the method look more decisive than it is on varied text.
                </p>
                <KeepInMind>
                  {"Smoothing and the threshold interact with context counts. Select them against the intended task and held-out data. A boundary that matches a word is useful for this diagnostic, but it need not be the best allocation of work in a trained model."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Repeating a corpus is lowering that credit and nothing else">
                <p>
                  {"Repeating the entire corpus adds no new observed continuations, but it changes this smoothed estimator’s balance between counts and pseudo-counts. For this counting model, multiplying all counts by the same factor is exactly equivalent to dividing the smoothing by that factor. Repeated training passes in other models can have different effects."}
                </p>
                <Equation>
                  {"(k·c + s) ∕ (k·n + 256 s)  =  (c + s∕k) ∕ (n + 256 s∕k)"}
                </Equation>
                <p>
                  {"Twenty copies with smoothing 0.001 agree with one copy at smoothing 0.00005 to the reported floating-point tolerance, producing identical patches. This checks the identity above. It does not establish that a small corpus must be badly calibrated: calibration requires comparing predictions with outcomes, rather than inspecting entropy alone."}
                </p>
                <KeepInMind>
                  {"BLT uses a trained byte-level network for the entropy estimates. Here we use a counting model so the probabilities can be inspected. Similar-looking patch boundaries do not establish that the predictors have similar accuracy on new text."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. When Every Continuation Is Predictable" id="17-and-repeating-one-phrase-does-not-help-at-all">
                <p>
                  {"A repeated phrase shows why low entropy need not reveal word boundaries. Fit twenty copies of the cat sat with the same context length and smoothing used above. Each scored position has entropy 0.198144 bits, despite some positions starting words and others falling inside them."}
                </p>
                <WorkedExample title="Eleven positions, one number">
                  <Equation>
                    {"t     h     e     ␣     c     a     t     ␣     s     a     t\n" +
                      "0.198 0.198 0.198 0.198 0.198 0.198 0.198 0.198 0.198 0.198 0.198"}
                  </Equation>
                  <p>
                  {"A global threshold at or above this constant value leaves one patch. Set it below the value and every byte starts a patch. A positive relative-increase threshold leaves one patch because there are no rises. Neither rule picks out the word boundaries in this flat profile."}
                </p>
                </WorkedExample>
                <>
<p>
                  The reason is that in this corpus the start of a word is exactly as predictable as the inside of one. After the space in the cat the only thing that ever came was a c, so the model is as certain there as it is between the t and the h of the. What made section 15 work was that two different words followed the same short stretch, since e followed by a space led sometimes to cat and sometimes to mat.
                </p>
                <p>
                  {"For this counting model, the distribution of next-byte continuations determines entropy. It depends on their relative frequencies and smoothing, not simply on the number of following words. A context with one observed continuation can still have positive entropy."}
                </p>
</>
                <KeepInMind>
                  {"Repeating the phrase can lower its smoothed entropy without creating different scores at its word boundaries. The predictor can fit a repetitive sequence well while providing no useful boundary signal for this word-alignment task."}
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
                  {"Each character in this ASCII corpus uses one byte. With a one-byte context, the predictor has little evidence about its location in a word. In the displayed sweep, a four-byte context reduces the inside-word cut rate below half the one-byte rate. Five bytes improve that rate further. These are results on the fitted corpus, not a general limit on useful context length."}
                </p>
                <p>
                  {"Longer contexts divide observations among more specific patterns. On new text, more contexts may be unseen. We would need a held-out context-length sweep to measure that tradeoff; the table above scores the same sentences used for fitting."}
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
              "The rule estimates uncertainty about the next byte from the preceding context and places cuts according to a stated threshold policy. Uncertainty can rise at word boundaries, but it can also rise because a context was absent from training. The operation does not require spaces or guarantee linguistic word boundaries. It stores a fitted predictor even though it has no vocabulary of patch identities.",
            ),
            trueFalse(
              "A reading of exactly 8 bits means the text genuinely could go several ways at that position.",
              false,
              "An unseen context receives a uniform distribution over 256 bytes under this smoothing policy, which has entropy eight bits. A genuinely ambiguous observed context can also have high entropy. The displayed uncertainty alone cannot tell us which source produced it, so a cut at that value is not evidence that the text truly had many equally plausible continuations.",
            ),
            choice(
              "With the displayed one-bit thresholds, how do the rules treat internal positions on a flat eight-bit plateau?",
              [
                "The level rule cuts at each internal plateau position while the rise rule adds no internal cut there; the full held-out example has 30 versus seven blocks",
                "They agree, since both are read off the same numbers",
                "The rise rule cuts at every position and the level rule at none",
                "Neither cuts, because a plateau carries no information",
              ],
              0,
              "The level rule tests the entropy itself, while the rise rule tests its increase from the previous position. On a high flat plateau, the level can stay above its threshold even though the increase is zero. The rules therefore place different cuts on the same estimated distributions. Which is useful needs a downstream comparison, not merely the fact that one yields fewer patches.",
            ),
            several(
              "Which of these hold for the guesser of Part 4?",
              [
                "With one observation credited to every unseen value, a stretch has to be seen with the same continuation 2,294 times before the guesser is ninety percent sure of it",
                "Twenty copies of the phrase the cat sat score every one of its eleven positions at 0.198144 bits, so the phrase is one block at the displayed half-bit level threshold",
                "Reading a hundred times more text repairs the flatness, even for a stretch that is still rare",
                "Looking back one byte cuts better than looking back four, since a shorter stretch has been seen more often",
              ],
              [0, 1],
              "Seen once with one continuation, the observed value holds two shares against one each for the other 255, which is barely distinguishable from flat. That is a property of the credit and of there being 256 values rather than of the corpus, so more text does not fix it for a stretch that is still rare. The repeated phrase fails the other way, since the start of a word there is exactly as predictable as the inside of one. And on the eighteen sentences context helps, with one byte back putting 63.0 percent of its cuts inside a word and four bytes back 28.8 percent.",
            ),
            trueFalse(
              "Reading twenty copies of one sentence gives the guesser something that one copy with a smaller credit for unseen bytes could not.",
              false,
              "Repeating the identical corpus multiplies its observed counts. In additive smoothing, reducing the per-byte smoothing amount by the same factor gives the same normalized distributions. The twenty-copy and one-copy settings here agree within 1.7e−16 and produce identical patches. This equivalence concerns repeating the same evidence, not collecting varied new observations.",
            ),
        ],
        },
        {
          title: "Part 5. The Bill, and Where It Is Not Worth Paying",
          content: (
            <>
              <SubSection title="19. Length against the bytes and against a learned vocabulary">
                <p>
                  {"Across the fitted corpus, entropy-based grouping produces 129 patches from 763 bytes. Fixed four-byte groups produce 197 patches, and the fitted merged vocabulary produces 263 IDs. The patcher has no dictionary of complete patches, but its context-count predictor still needs storage."}
                </p>
                <Equation>{"Mean bytes per entropy patch = 763 / 129 ≈ 5.9"}</Equation>
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
                  {"For a full pairwise attention table, fewer positions mean fewer position pairs. The comparison below counts those pairs only. It excludes local encoding, prediction and decoding, so it is not a measured overall speedup. BLT’s larger network processes patches while smaller networks handle bytes; its performance must be assessed as a complete architecture."}
                </p>
                <Equation>{"Pair-count ratio = 763² / 129²\n                 ≈ 35"}</Equation>
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
                  {"Several familiar fragments stay together, including expect with its surrounding spaces and low with its hyphen. Other patches contain st or lysis. Most of the unfamiliar surname splits into individual bytes because its preceding four-byte contexts were absent from the corpus. Inspect the displayed cuts rather than assuming each surviving patch is a word."}
                </p>
                </WorkedExample>
                <p>
                  {"The average falls from 5.9 bytes per patch on the fitted corpus to 1.7 on this held-out sentence. This predictor therefore reduces the sequence less effectively here than the fixed four-byte rule. Thirty patch positions still differ substantially from 51 byte positions, and total computation would also depend on the surrounding model."}
                </p>
                <KeepInMind>
                  {"The bytes still reconstruct correctly. To detect reduced compression, track the patch count or average patch size alongside model quality and runtime. More patches can also affect batching, memory use and context limits."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Where the obvious alternative is simply better">
                <p>
                  {"On the held-out sentence, the merged vocabulary produces 25 IDs, the entropy rule produces 30 patches and the fixed rule produces thirteen patches. Fixed grouping gives the shortest sequence in this comparison. The representations differ, so sequence length alone does not rank their trained-model quality or total cost."}
                </p>
                <NumberTable
                  headings={["on this sentence", "pieces", "needed a corpus"]}
                  rows={[
                    ["blocks of 4 bytes", "13", "no"],
                    ["pieces merged from the corpus", "25", "yes, and a table of 137"],
                    ["cut where the next byte was hard to guess", "30", "yes, and no table"],
                    ["one number per byte", "51", "no"],
                  ]}
                  caption="The held-out sentence, ordered by number of positions. The merged vocabulary and entropy predictor were fitted; the fixed and raw-byte rules were not."
                />
                <>
<p>
                  The predictor here was fitted from 763 bytes. Its uncertainty therefore needs to be judged against that limited evidence, rather than treated as the output of a large trained model. Useful adaptive boundaries require a predictor whose uncertainty differentiates positions on new text. These examples do not establish how much training data or computation that capability requires.
                </p>
                <p>
                  {"Unseen contexts become uniform under this predictor’s smoothing rule, triggering more global-threshold cuts. That explains the shorter patches here. Other predictors may respond differently to unfamiliar text, and patch quality still depends on the model that processes them."}
                </p>
</>
                <KeepInMind>
                  {"A fixed patch size makes the position count predictable for a given byte length. That can simplify resource planning. It does not adapt to differences in prediction difficulty, so test the tradeoff against the full model and expected inputs."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. When the Model Chooses Different Patch Boundaries" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="22. The blocks belong to the guesser, not to the text">
                <p>
                  {"Adaptive boundaries depend on the input, the fitted predictor and the boundary settings. Vocabulary-based tokenizers also depend on saved configuration and a fitted vocabulary. The following models illustrate how changing the predictor can change patch boundaries for one sentence."}
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
                  {"The last two models produce six patches with different boundaries. Keeping the count unchanged therefore does not keep the downstream input unchanged. Save the predictor and boundary settings with the model. A fixed text’s boundaries can also be cached; reproducing every possible text requires the configured procedure, just as vocabulary-based tokenization does."}
                </p>
                <KeepInMind>
                  {"Name the predictor and its settings when reporting a segmentation. Different predictors can produce different boundaries, but they can also agree. An unspecified configuration leaves the result underspecified, rather than mathematically undefined."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The threshold is not determined by anything">
                <p>
                  The threshold can change the segmentation substantially. On the eighteen sentences, the sweep ranges from 188 blocks to 18. At 18, each sentence is passed as one whole block, with no internal boundaries. The method supplies no universally preferred threshold, so we need a criterion for deciding which grouping is useful.
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
                  {"At two bits, all 39 selected cuts avoid word interiors under this diagnostic. That does not establish that every useful boundary was found. There are 115 word starts across the corpus, and missing a boundary is different from placing one inside a word. Next-byte entropy is not a calibrated probability that a boundary is correct. To estimate boundary accuracy directly, we would need an appropriate target and evaluation."}
                </p>
                <KeepInMind>
                  {"Entropy has a common unit: bits. Different predictors can assign different distributions to the same context, so their score ranges and useful thresholds may differ. Retest a threshold when the predictor changes."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A block has no identity, which is what a vocabulary was for">
                <p>
                  {"The 129 patches have 77 distinct byte spellings; The followed by a space occurs twelve times. The patcher does not assign that group a reusable vocabulary ID. An encoder can still process all twelve occurrences with shared parameters and learn their recurring structure."}
                </p>
                <Equation>
                  {"129 blocks    77 distinct spellings    The␣ appears 12 times"}
                </Equation>
                <p>
                  A vocabulary entry gives a recurring piece a stable address for looking up one learned row. This patching stage instead supplies grouped representations without assigning each observed group a reusable piece ID. A later model can still learn from those representations, but it is receiving a different interface. Whether that design works well must be evaluated alongside the encoder and downstream model, not inferred from patch counts alone.
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
                <p>Patch boundaries may depend on a fixed width or on a model score. Decide which information must survive each patch and how the procedure handles an incomplete final group before comparing it with a vocabulary-based tokenizer.</p>
                <DerivationTable
                  expressionHeading="Bytes or patch-boundary choice"
                  reasonHeading="What the patcher needs to decide"
                  rows={[{"expression":"a stretch of bytes nobody has seen","reason":"With no context counts, this smoothed predictor returns a uniform distribution and 8 bits of entropy. The boundary score alone does not distinguish missing evidence from a broad predicted distribution. In the held-out sentence, 26 of 51 contexts were unseen."},{"expression":"where to put the threshold","reason":"Entropy is measured in bits. Select a threshold against a useful criterion, such as the quality and compute budget of the downstream model. A threshold tuned for one predictor needs checking with another."},{"expression":"what counts as high","reason":"A global threshold below a flat plateau cuts at every position on it. A positive rise threshold selects no internal position. With the displayed settings, the held-out sentence produces 30 patches one way and 7 the other."},{"expression":"the first byte of a text","reason":"A nonempty sequence needs an initial patch. This SDK makes offset zero its start. The global entropy rule can score the first byte using a padded start context; the relative rule needs a separate convention because no preceding entropy exists."},{"expression":"a block that stops part way through a letter","reason":"Either rule can divide a UTF-8 character. Separate patch previews may then contain replacement marks. Joining the original bytes before decoding restores the text; joining replacement-mark previews need not."},{"expression":"how long a block may be","reason":"Without an explicit length cap, a predictable run may stay in one patch. Set a maximum if the encoder or memory budget requires one. This is an implementation choice, not an unavoidable limit of every entropy-patching system."},{"expression":"how many blocks a text will come to","reason":"Fixed grouping gives the ceiling of byte count divided by patch size. Adaptive grouping depends on the byte sequence and predictor as well as its length. Compute the entropies or use cached boundaries to obtain the count."},{"expression":"which pieces a text has","reason":"Specify the predictor and boundary settings. The four configurations shown produce different segmentations of the same 34 bytes. Reproducing them requires that configuration or cached boundary results."},{"expression":"how often a piece occurs","reason":"Repeated patch byte strings can be counted without vocabulary IDs. Here The followed by a space occurs twelve times. A learned encoder can share parameters across those occurrences even though the grouping stage assigns no reusable patch ID."},{"expression":"a text with nothing in it","reason":"defined, and it is no blocks at all under either rule. A single byte is one block, since the first byte always starts one, and this is the one place the two rules and the fixed size cannot disagree."}]}
                />
                <KeepInMind>
                  {"Keep the predictor and boundary settings with the model. Check patch counts on unfamiliar text, then test the encoder and downstream model. The segmentation examples explain how boundaries are chosen; they do not measure language-model quality."}
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
              "The measured corpus has 763 bytes,129 entropy-selected patches and 263 BPE tokens. That is a shorter sequence for the later patch-level model. A full pairwise-attention term would shrink with the square of the position count, giving the reported approximate 35-fold comparison against byte positions. The complete runtime also includes the fitted boundary predictor, local encoding and decoding, so this is not a measured end-to-end speedup.",
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
              "For the held-out sentence,26 of 51 positions have unseen four-byte contexts and receive the uniform eight-bit distribution. The rule therefore cuts more often than on the familiar corpus: about 1.7 bytes per patch rather than 5.9. This measures reduced compression for this new text. It does not by itself measure the eventual model's quality or total compute.",
            ),
            trueFalse(
              "Across the eighteen sentences the rule produces 129 blocks with 77 distinct spellings, and the run The followed by a space is one of those blocks twelve separate times.",
              true,
              "The patcher returns twelve occurrences of the same byte run; it does not merge them into one vocabulary entry. A downstream encoder can reuse its parameters on those repeated bytes, but that is different from storing one learned row per distinct patch. Counting distinct patch spellings therefore measures repetition without turning the patcher into a tokenizer vocabulary learner.",
            ),
            choice(
              "At a threshold of two bits, not one cut on the eighteen sentences falls inside a word. Why is that not the ideal setting?",
              [
                "All 39 selected cuts avoid word interiors, but there are 115 word starts; missing many boundaries is different from placing a wrong cut",
                "Two bits is outside the range the entropy can take",
                "Those sentences hold no words long enough to cut inside",
                "Two bits sits below the uninformed baseline of 65.6 percent",
              ],
              0,
              "The threshold sweep ranges from 188 blocks to 18, where each sentence becomes one block. The threshold therefore controls how much internal segmentation we obtain. It does not turn the cut score into a calibrated probability that a proposed boundary is correct.",
            ),
            several(
              "Which consequences follow from boundaries depending on the fitted predictor and cut policy?",
              [
                "A threshold tuned for one predictor needs validation when used with another",
                "Removing half the corpus can leave the same number of blocks with different pieces",
                "Reproducing boundaries requires the configured predictor or appropriate cached per-input results",
                "The text can no longer be read back from its blocks",
              ],
              [0, 1, 2],
              "The boundaries are well defined once the fitted predictor, context length, smoothing and cut policy are fixed. Entropy still has the unit bits. What changes across predictors is the distribution being measured and how well it reflects the data. A one-bit threshold is therefore a reproducible setting, but not a calibrated probability that a word boundary is correct.",
            ),
        ],
        },
        {
          title: "Practice. Cutting Bytes Into Blocks With the Library",
          practice: [
            exercise(
              "Cut at a fixed size",
              [
  "Use FixedSizePatcher with patch_size=4 on the Dr. Alvarez sentence and the supplied accented sentence. This patcher counts bytes, without looking for words or character boundaries.",
  "Print the first sentence’s block count and block texts. For the accented sentence print its block count and the start offsets of blocks containing the replacement character when decoded separately.",
  "Finally print the total blocks over the eighteen supplied sentences at sizes 4, 6, 8 and 12. Each sentence starts a new block sequence; do not join the corpus before counting."
],
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
              {
question: "Where can a fixed byte-sized block split a character?",
 hints: [
  "patch(text) returns n_patches and iterable blocks with text and byte-based start/end offsets.",
  "A UTF-8 character can cross a block boundary. Inspect each block’s decoded text for the replacement mark.",
  "Sum patch(text).n_patches separately over the sentences at each size."
], check: numberCheck("How many blocks do the eighteen sentences come to at a block size of 6?", 135, 0.0, "Six-byte blocks produce 135 blocks over the corpus. Each sentence’s final partial block still counts, so its boundaries affect the total as well as the overall byte length.") },
            ),
            exercise(
              "Cut where the next byte is hard to guess, under both rules",
              [
  "Fit EntropyPatcher on twenty copies of the supplied corpus, using order=4, threshold=1.0 and smoothing=0.001. Run both supplied cut rules: absolute uncertainty level and increase from the preceding position.",
  "For each rule print the first corpus sentence’s blocks, the held-out sentence’s block count, the original corpus’s total blocks and average bytes per block to two decimal places.",
  "Finish by counting held-out byte positions whose uncertainty is within a billionth of eight bits. Both fits use the same probability estimates; only the rule deciding where to cut changes."
],
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
              {
question: "How do an uncertainty threshold and a rise threshold make different cuts?",
 hints: [
  "Pass the rule enum at construction and corpus * 20 to fit.",
  "Count blocks over the original corpus for the report, not its twenty repeated training copies.",
  "entropies_of gives the byte-position uncertainty values. Use the supplied near-eight comparison rather than exact floating-point equality."
], check: numberCheck("How many blocks do the eighteen sentences come to under the rise rule?", 79, 0.0, "The rise rule gives 79 blocks over the original corpus. It omits positions whose uncertainty is high but did not rise enough from the preceding position, so its boundaries differ from a simple level threshold.") },
            ),
            exercise(
              "Look further back, on text the guesser has and has not read",
              [
  "Fit the same entropy patcher at context lengths one through six, retaining the previous training repetition, one-bit threshold and smoothing settings. Use the default level rule.",
  "At each context length print total blocks for the original corpus, blocks for the held-out Dr. Alvarez sentence and the number of its byte positions scoring approximately eight bits.",
  "The context length is how many preceding bytes condition the prediction. Compare familiar and held-out text separately; a longer context can become less frequently observed."
],
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
              {
question: "Does a longer byte context help unfamiliar text as much as familiar text?",
 hints: [
  "order is the preceding-byte count for this patcher. Create and fit a fresh model for every order.",
  "Keep the near-eight tolerance used in the preceding exercise. Count the held-out positions independently of its final blocks."
], check: numberCheck("How many patches represent the Dr. Alvarez sentence when the predictor conditions on the previous two bytes?", 25, 0.0, "The held-out sentence uses 25 blocks at a two-byte context. Longer contexts reduce familiar-corpus blocks here while leaving more held-out contexts unobserved.") },
            ),
            exercise(
              "Find the edge between seven copies and eight",
              [
  "Fit the supplied cat sentence at seven, eight and twenty copies with order=2, threshold=0.5 and smoothing=0.001. Print each block layout and the uncertainty at the second byte to four decimal places.",
  "Then fit one copy with smoothing=0.00005. Compare its uncertainties with the twenty-copy fit: print the largest absolute difference and whether their block layouts match.",
  "A cut is a threshold decision. Inspect the second-byte uncertainty before interpreting a sudden change in the number of blocks."
],
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
              {
question: "Why can one more training copy suddenly change the block layout?",
 hints: [
  "The second byte is index 1 of entropies_of(cat). Keep the threshold fixed across the first three fits.",
  "Pair the uncertainty arrays with zip and take the largest absolute difference.",
  "Changing the balance between observed counts and smoothing can move an entire class of positions across the threshold together."
], check: numberCheck("What is the uncertainty at the second byte at seven copies, to four places?", 0.5005, 5e-05, "At seven copies the second byte scores 0.5005 bits, just above the chosen threshold. At eight it is below the threshold, so a small numerical change produces a discrete change in the layout.") },
            ),
          ],
        },
      ]}
    />
  );
}
