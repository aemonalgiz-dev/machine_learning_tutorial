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
import { LengthAfterTheMove } from "@/components/widgets/LengthAfterTheMove";
import { MappingRoutes } from "@/components/widgets/MappingRoutes";
import { MarkerLoss } from "@/components/widgets/MarkerLoss";
import { SurvivalSweep } from "@/components/widgets/SurvivalSweep";
import { VocabularyMovePlayground } from "@/components/widgets/VocabularyMovePlayground";

export const metadata: Metadata = pageMetadata("/concepts/moving-a-vocabulary", {
  title: "Moving a Vocabulary · Perceptron Lab",
  description:
    "Vocabulary entries depend on the boundary rules that produced them. Moving pieces to another tokenization scheme can remove distinctions or make several entries map to the same representation.",
});

export default function MovingAVocabularyPage() {
  return (
    <ConceptPage
      lessonId="moving-a-vocabulary"
      intuition={lessonIntuitions["moving-a-vocabulary"]}
      technicalStart="Part 2. What a Move Has to Decide"
      openingTitle="The Same Token ID Can Mean Something Else"
      playgroundTitle="What happens when a vocabulary meets different writing?"
      playgroundIntro="Follow each source entry through decoding and re-encoding. Check for entries that collapse together or acquire a different segmentation."
      title="Moving a Vocabulary"
      tagline={"Vocabulary entries depend on the boundary rules that produced them. Moving pieces to another tokenization scheme can remove distinctions or make several entries map to the same representation."}
      prerequisites={
        <>
          We will use what we know about vocabulary IDs and byte-pair encoding, including its end-of-word marker. This time a vocabulary and its learned vectors already exist. We want to adapt them to text about a different subject. Which rows can we reuse, and what should we do for pieces the old vocabulary never represented?
        </>
      }

      playground={<VocabularyMovePlayground />}
      sections={[
        {
          title: "Part 1. Why a Vocabulary Would Ever Move",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A vocabulary learned on one subject, reading another">
                <>
<p>
                  A vocabulary fitted to reports may use several small pieces for an ordinary bakery word. A second vocabulary fitted to bread and pastry may represent that word more compactly. If a trained model changes vocabulary, what should happen to the numerical rows it already learned?
                </p>
                <p>
                  We will compare two eighteen-sentence corpora, one about reports and one about baking. They use the same underlying characters, so the first comparison concerns reusable pieces rather than an unknown-character failure.
                </p>

</>
                <p>
                  Fit the first corpus until it runs out of pairs it has seen
                  twice and it gives 137 rows from 85 merges. Hand it the second
                  corpus and it reads it in 428 pieces. Fit the second corpus on
                  its own and it gives 125 rows from 79 merges, and reads itself
                  in 276.
                </p>
                <NumberTable
                  headings={[
                    "the vocabulary",
                    "rows",
                    "merges",
                    "reads the new corpus in",
                  ]}
                  rows={[
                    ["learned from reports", "137", "85", "428 pieces"],
                    ["learned from pastry", "125", "79", "276 pieces"],
                  ]}
                  caption="Two fits of the same method on two corpora of the same size, and one of them is reading text it was not built from."
                />
                <p>
                  {"The report vocabulary uses substantially more pieces on the pastry corpus than a vocabulary fitted to that text. Its learned pieces favor the words frequent in reports. This measured domain change motivates adapting the vocabulary; it does not establish a typical penalty for every transfer."}
                </p>
                <KeepInMind>
                  {"A fitted vocabulary reflects its training data and selection rules. The new corpus still encodes, but its longer sequences may add work. Measure that change explicitly when adapting to another distribution."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What starting again would cost">
                <p>
                  {"Learning these small vocabularies is inexpensive compared with training a large model. But the tokenizer is only part of the system: its IDs address model parameters whose learned behavior we want to retain."}
                </p>
                <p>

                  The model&apos;s input table associates a learned row with each token ID. For the illustrative width of 256 values per row, the new vocabulary would need a table of 32,000 numerical values. Initializing that table is separate from learning the vocabulary&apos;s counts. The example width makes the storage calculation concrete; it is not a property every model must share.
                </p>
                <NumberTable
                  headings={["the table", "rows", "numbers per row", "numbers"]}
                  rows={[
                    ["learned from reports", "137", "256", "35,072"],
                    ["learned from pastry", "125", "256", "32,000"],
                    ["a small language model", "32,000", "768", "24,576,000"],
                  ]}
                  caption="The third row is not a fit on this page; it is the same multiplication at a size a real model works at."
                />
                <p>
                  {"Replacing vocabulary entries can disrupt the input vectors the later network expects. A generative model’s output rows and biases may also need to match the new IDs, including any tied input/output parameters. Transfer initializes those changed rows; further training and evaluation determine how well the adapted model works."}
                </p>
                <KeepInMind>
                  {"Separate the cost of choosing token strings from the cost of adapting learned parameters to those strings. Reusing compatible rows can provide a useful starting point, while retaining the old vocabulary may avoid adaptation work at the cost of longer sequences."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Three ways out, and what each of them costs">
                <p>
                  Before moving any rows, let&apos;s compare the available choices for a model whose vocabulary no longer suits its data. The table shows the alternatives and their costs. We will then investigate the third approach and compare its starting point with learning new rows from scratch.
                </p>
                <DerivationTable
                  expressionHeading="what to do"
                  reasonHeading="what it costs"
                  rows={[
                    {
                      expression: "keep the old vocabulary",
                      reason:
                        "nothing is retrained, and the new corpus costs 428 pieces rather than 276 for as long as the model is used. Every piece is work for whatever reads it, forever.",
                    },
                    {
                      expression: "learn a new one and start the model again",
                      reason:
                        "the new corpus costs 276 pieces, and all 32,000 numbers of the new table start from noise, along with the retraining of everything that reads them.",
                    },
                    {
                      expression: "learn a new one and move the old rows into it",
                      reason:
                        "the new corpus costs the same 276 pieces, because the vocabulary really is the new one, and the table starts from what the old model knew rather than from noise.",
                    },
                  ]}
                />
                <p>
                  {"The transfer procedure identifies which old rows can initialize each new token row. It does not train the model or guarantee that the selected values suit the new contexts. That distinction lets us inspect mapping correctness separately from adaptation quality."}
                </p>
                <KeepInMind>
                  {"Learning the new vocabulary supplies its sequence length. The transfer policy affects its starting parameters and the training needed afterward. Compare task performance as well as cost when choosing among the alternatives."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. What a Move Has to Decide",
          content: (
            <>
              <SubSection title="4. A position is not a name, so nothing travels by number">
                <p>
                  {"An ID addresses a row within its own vocabulary. ID 60 can name different pieces in two fits because their alphabets and merge histories assign entries differently. The merge number itself is not the ID: alphabet and reserved entries occupy rows too."}
                </p>
                <NumberTable
                  headings={[
                    "position",
                    "in the reports vocabulary",
                    "in the pastry vocabulary",
                  ]}
                  rows={[
                    ["0", "[UNK]", "[UNK]"],
                    ["40", "s", "v"],
                    ["60", "as, ending a word", "dou"],
                    ["80", "ed, ending a word", "ru"],
                    ["100", "le", "eg"],
                    ["124", "first, ending a word", "y., ending a word"],
                  ]}
                  caption="The reserved unknown entry shares its role by convention. Inspect the other rows by token identity rather than assuming equal IDs mean equal pieces."
                />
                <p>
                  So there is nothing to carry across by number, and the
                  question the method has to answer is what a token of the new
                  vocabulary corresponds to in the old one. The only thing the
                  two vocabularies have in common is that both are made of
                  strings, so whatever is going to travel has to travel by
                  spelling.
                </p>
                <KeepInMind>
                  {"Independent vocabulary fits can assign different IDs to the same piece. Copy rows by a verified identity mapping, including the boundary convention, rather than by their numeric addresses alone."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The three rules, in the order they are tried">
                <p>
                  For each token of the new vocabulary in turn, three rules are
                  tried and the first that applies answers. The first is about
                  the token that means &ldquo;something was here and I cannot
                  say what&rdquo;, which is a label rather than text and whose
                  opposite number in the old vocabulary is the token with the
                  same job, whatever either of them is spelled. The second is
                  the copy rule, which fires when the old vocabulary holds this
                  exact spelling, marker and all. The third is everything else.
                </p>
                <Equation>{`for each token t of the new vocabulary

  1.  t is the label for the unspellable        →   the old label
  2.  t is spelled in the old vocabulary too    →   that one row
  3.  otherwise                                 →   read the text of t with the old vocabulary`}</Equation>
                <p>
                  The third rule is the interesting one and it has two steps.
                  Decoding turns the token into the text it stands for, and then
                  the old vocabulary encodes that text and hands back however
                  many pieces it needs. So a token that the old vocabulary never
                  held is seeded from the rows of the pieces that spell it,
                  which is a statement the old model can actually be asked to
                  make.
                </p>
                <KeepInMind>
                  {"Special-token matching and exact copying avoid the decode-and-re-encode route. They still require compatible token roles and boundary conventions. The third rule adds further risks when it changes the context in which a fragment is interpreted."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Why the exact spelling is taken first">
                <p>
                  It looks at first as though the second rule is a shortcut for
                  the third, since a token the old vocabulary already holds
                  would surely come back as itself when read again. It does not,
                  and the reason is the whole of Part 4, so here it is enough to
                  see it once on one piece.
                </p>
                <>
<p>
                  The four-word corpus of the byte pair page teaches a piece made of an l and an o that never ends a word, because the words it comes from are low and lower and the l and the o are followed by a w. Both vocabularies below hold it. Under the copy rule it maps to itself, one row, exactly.
                </p>
                <p>
                  Under the third rule it would first become the two letters as plain text, and those two letters read as text are a whole word ending in o, which is a different thing and, on that corpus, an unspellable one.
                </p>
</>
                <KeepInMind>
                  The copy rule is what keeps every shared piece exact within
                  one convention, and it is why the lossy route is reached only
                  by tokens the old vocabulary has never seen in any form.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Seeding one row from several">
                <p>
                  {"For a newly composed token, this policy initializes its row as the mean of the selected old rows. Finding those rows includes decoding and re-encoding, and then reading every component vector; its cost is not one constant-time lookup per token."}
                </p>
                <Equation>{"new row for t  =  mean over the old rows the pieces of t point at"}</Equation>
                <p>
                  We can identify which old token rows a proposed transfer would use, but there is no trained embedding table in this experiment. It therefore does not measure whether averaging selected rows gives a useful new representation. That quality question needs an actual model and evaluation, beyond checking that the bookkeeping selects the intended pieces.
                </p>
                <p>
                  One case has to be handled before the averaging can even be
                  attempted, which is a token with no old rows at all. An
                  average over nothing is not a number, so such a token is
                  reported as having nothing rather than quietly handed an empty
                  list, and whoever builds the table has to find it a row from
                  somewhere else.
                </p>
                <KeepInMind>
                  The method has a tokenizer half and a model half. Everything
                  measured on this page is the first half, which answers which
                  old rows each new token is made of, and the second half is one
                  average per row.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "Why might changing a fitted model’s vocabulary require more work than learning the replacement tokenizer itself?",
              [
                "Learning the new vocabulary is 79 merges, while the table that reads it is 32,000 numbers learned from text, with everything behind it trained against the old rows",
                "A vocabulary learned on the wrong corpus reads the new text in fewer pieces once the model has adapted",
                "The old vocabulary can be extended with the merges the new one would have learned",
                "Counting pairs is cheap only on eighteen sentences, and on a real corpus the merges dominate",
              ],
              0,
              "Changing the vocabulary also changes which input pieces the embedding rows represent. Randomly initializing all replacement rows discards information the model previously learned to use. This example has only 79 tokenizer merges but 32,000 embedding values, along with later weights that depend on those representations. Transfer provides an initialization for the changed table; whether it reduces the required retraining still needs evaluation.",
            ),
            trueFalse(
              "A token keeps its number across the move, so row 60 of the old table seeds row 60 of the new one.",
              false,
              "An ID identifies a piece within one particular vocabulary. The same integer in another vocabulary may identify a different piece, because reserved entries, the starting alphabet and learned merges determine the row order. Transfer must match token identity rather than assume that equal row numbers have equal meanings.",
            ),
            choice(
              "The copy rule looks like a shortcut for the third rule, since a token the old vocabulary already holds would surely come back as itself. Why is it not?",
              [
                "The third rule returns pieces in a different order, so the average would be taken over the wrong rows",
                "Decoding a piece that never ended a word turns it into a whole word, which is a different thing and on some corpora an unspellable one",
                "The third rule refuses any token the old vocabulary already holds",
                "The copy rule compares positions where the third rule compares spellings",
              ],
              1,
              "The shared piece lo can be copied exactly under the common boundary convention. Decoding it and then encoding the isolated text would instead treat the final o as a word ending. That can produce different source pieces. The direct-copy rule therefore preserves a shared entry that re-encoding would not necessarily reproduce.",
            ),
            trueFalse(
              "Reading the pastry corpus with the report vocabulary costs 428 pieces where 276 would have done, and nothing anywhere reports a problem.",
              true,
              "The report vocabulary learned recurring pieces from the report corpus rather than the baking corpus. It can still represent the baking text, but uses 428 pieces instead of the baking vocabulary's 276. A longer valid encoding does not trigger an unknown-token error merely because another fitted vocabulary would be shorter. It is a measured mismatch in compression on this text.",
            ),
        ],
        },
        {
          title: "Part 3. The Move on Four Words",
          content: (
            <>
              <SubSection title="8. Two vocabularies over the same four words">
                <p>
                  Before the eighteen sentences, a corpus small enough to check
                  by hand, which is the one the byte pair page works its merges
                  on. Four words with their counts, low five times, lower twice,
                  newest six times and widest three. Fit it twice, once stopping
                  after three merges and once after ten, and we have two
                  vocabularies of 15 and 22 rows over identical text.
                </p>
                <p>
                  {"The two fits share their corpus, alphabet and merge order, differing only in where they stop. That makes exact reuse easy to inspect. Failures found here identify a possible mechanism, rather than proving every more complex transfer must fail the same way."}
                </p>
                <KeepInMind>
                  Two fits of one method on one corpus at two sizes are not
                  independent. The smaller one&rsquo;s merges are the first
                  three of the larger one&rsquo;s, which is a fact we are about
                  to use.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Shrinking a vocabulary asks nothing of the move">
                <p>
                  Take the ten-merge vocabulary as the old one and the
                  three-merge vocabulary as the new one, which is the direction
                  somebody takes who wants a smaller model rather than a
                  better-fitting one. All 15 tokens are answered by the first
                  two rules, 14 of them copied and one of them the label for the
                  unspellable, and not one token has to be read again.
                </p>
                <p>
                  The reason is the ordering. Merges are learned one at a time
                  and each one adds a row, so a fit that stops early holds
                  exactly the first rows of a fit that goes on longer. Shrinking
                  a vocabulary learned from the same corpus is therefore a pure
                  copy, and none of the machinery of Part 4 is reached at all.
                </p>
                <KeepInMind>
                  {"When the target vocabulary is an exact prefix of the source, these selected rows copy directly. The encoding can still change because removed long tokens no longer exist, so exact row copying is not preservation of the whole model’s behavior."}
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Growing it asks for seven readings">
                <p>
                  Turn the move around, so the three-merge vocabulary is the old
                  one and the ten-merge vocabulary is the new one, and seven
                  tokens are now strings the old vocabulary never held. Fourteen
                  are still copied, and the seven that are not are seeded from
                  2.86 old rows each on average.
                </p>
                <MappingRoutes />
                <p>
                  Read down the right-hand column of the growing direction and
                  the seven readings are visible one at a time. Six of them are
                  words or word endings and come back as the pieces that spell
                  them. The seventh is the piece made of an e and a w, which
                  comes back carrying an end-of-word marker it never had, and
                  section 12 is about that.
                </p>
                <KeepInMind>
                  A move between two fits of one corpus copies whatever the
                  smaller fit already held and reads the rest. Seven of
                  twenty-two here, and the ratio gets worse as the two
                  vocabularies get further apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. What a rebuilt whole word gets">
                <p>
                  The case the method was designed for is a new token that is a
                  whole common word. The ten-merge vocabulary has a row for low
                  with its marker, and the three-merge vocabulary does not,
                  since it stopped before that merge. Decoded, the new token is
                  the text low, and the old vocabulary spells that text in two
                  pieces it does have.
                </p>
                <WorkedExample title="Three of the seven, by hand">
                  <>
<p>
                    The row for low with its marker decodes to low and is read as lo followed by w with the marker, so it is seeded from those two rows. The row for ewest with its marker decodes to ewest and is read as e, then w, then est with the marker, three rows. The row for widest with its marker takes four, w and i and d and est with the marker.
                  </p>
                  <p>
                    Every piece in those readings is a piece the old model has seen many times, since they are exactly the pieces it was using to spell those words before the new vocabulary existed.
                  </p>
</>
                </WorkedExample>
                <WhyThisWorks title="Why the average of those rows is a sensible start">
                  <>
<p>
                  {"For two old vectors, their mean is the midpoint and minimizes their summed squared distances. That makes it a simple initialization. A nonlinear language model does not generally treat the midpoint of two token vectors as equivalent to processing their two positions, so evaluate the adapted model."}
                </p>
                  <p>
                  {"Gee and colleagues’ 2022 Fast Vocabulary Transfer work used vocabulary-based initialization to reduce adaptation costs in language-model compression. Its results motivate comparing reuse with random initialization. This page measures only tokenizer mappings; it supplies no trained-model accuracy comparison of those initializers."}
                </p>
                <p className="text-sm"><a className="underline underline-offset-4" href="https://aclanthology.org/2022.emnlp-industry.41/">{"Gee et al.: Fast Vocabulary Transfer for Language Model Compression (2022)"}</a></p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  Where a new token is a word the old vocabulary spelled in
                  several pieces, the move is doing the thing it advertises, and
                  the rows it averages are rows the old model genuinely used to
                  read that word.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What Decoding Throws Away",
          content: (
            <>
              <SubSection title="12. A piece is not a word, and decoding cannot say so">
                <p>
                  {"In this end-marked encoding, a fragment carries boundary information that plain decoded letters do not retain. Re-encoding those letters as an isolated word can add an end marker. That is the specific interface mismatch examined below."}
                </p>
                <p>
                  The seventh reading of the last section is the instance. The
                  new vocabulary has a row for the two letters e and w with no
                  marker, which is what the middle of newest looks like. Decoded
                  it is the text ew. Handed that text, the old vocabulary sees a
                  word two letters long, spells it as e followed by w with the
                  marker on it, and hands back those two rows. The marker was
                  never in the original piece and there is no text that could
                  have kept it out.
                </p>
                <MarkerLoss />
                <Equation>{`the piece   ew            an e and a w, neither ending a word
its text    "ew"          the marker is gone, and no text can hold it
read again  e, w${"</w>"}       the w now says a word ended here`}</Equation>
                <p>
                  This rule decodes the new piece to text and asks the old tokenizer to encode that text. The old tokenizer therefore loses the marker describing where the piece occurred inside a word. Preserving that information would require a fragment-encoding interface with an explicit boundary context. The tokenizers used here do not provide that operation.
                </p>
                <KeepInMind>
                  The copy rule exists because of this. Within one convention it
                  maps every shared piece exactly, so only the tokens the old
                  vocabulary never held reach the third rule; between two
                  vocabularies that share no spellings, all of them do.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. A piece the old vocabulary cannot spell at all">
                <p>

                  With the old vocabulary stopped after two merges, the combined l-and-o piece is absent. Encoding the new fragment therefore asks the old tokenizer to analyze its text again. Treating that fragment as a whole word makes o an end-of-word symbol, which is different from its position inside the larger word that originally supplied it. The fragment interface has changed the boundary context.
                </p>
                <p>
                  {"None of the four training words ends in o, so this fitted alphabet lacks the marked final-o symbol. The fallback becomes l followed by the unknown ID. A tokenizer designed with a fuller base alphabet could avoid this particular missing-symbol failure."}
                </p>
                <Equation>{`the piece   lo            an l and an o, in the middle of low
its text    "lo"          a word ending in o
read again  l, [UNK]      and no word of this corpus ends in o`}</Equation>
                <p>
                  {"Including an unknown row supplies fallback information, not the missing fragment’s exact representation. Its content depends on how the old model trained that row. Here no embedding table is fitted, so we can flag the fallback mapping but cannot measure the resulting vector error."}
                </p>
                <KeepInMind>
                  A piece whose last letter never ends a word in the old corpus
                  cannot be read again at all, however ordinary the letters look.
                  It is the end-of-word marking that makes that possible, and
                  the same marking is what makes decoding mechanical.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Crossing a marking convention">
                <p>
                  {"These two schemes use different boundary markers: end-marked BPE distinguishes word endings, while WordPiece marks continuations. Some literal strings can still match, but matching strings do not automatically guarantee matching boundary roles. Translate or verify those roles before treating a copy as exact reuse."}
                </p>
                <p>
                  Move a ten-merge byte pair vocabulary into a WordPiece
                  vocabulary of the same 22 rows over the same four words and
                  the copy rule fires four times. Seventeen tokens take the
                  third rule, and five of those come back as nothing but the
                  stand-in, because they are single letters marked as
                  continuations and their text is a one-letter word ending in a
                  letter no word of the corpus ends in.
                </p>
                <NumberTable
                  headings={["the move", "tokens", "copied", "read again"]}
                  rows={[
                    ["between two byte pair fits", "22", "14", "7"],
                    ["into the other convention", "22", "4", "17"],
                  ]}
                  caption="Same corpus, same size, same number of merges. The only difference is which end of a word each vocabulary marks."
                />
                <p>
                  Two of the seventeen cases happen to reach plausible rows. The continuation piece est becomes plain text est, which the old vocabulary treats as a whole word and can represent with a matching spelling. The word-initial piece low similarly reaches a whole-word low entry. Its letters match, but its original boundary role does not. A matching spelling therefore needs closer inspection.
                </p>
                <KeepInMind>
                  The copy rule compares spellings, and two conventions have
                  almost no spellings in common, so 17 of the 22 tokens went
                  through decoding here where 7 did between two fits that shared
                  a convention.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. A token that names no text at all">
                <p>
                  There is one more shape, and it is the case where the third
                  rule produces nothing rather than something wrong. A
                  vocabulary built over byte values gives every byte a printable
                  name, including the bytes that are spaces and tabs and line
                  breaks, so it holds tokens whose text is whitespace.
                </p>
                <p>
                  Decode one of those and the text is a single space. Hand a
                  space to a vocabulary whose first step is to find the words,
                  and it finds no words, so it returns nothing at all. Fit a
                  byte-level vocabulary of 266 rows over the four words and move
                  the byte pair vocabulary into it, and exactly 10 of the 266
                  come back with nothing, which are the ten byte values that are
                  whitespace.
                </p>
                <p>
                  Those ten are reported as having no rows rather than being
                  handed an empty list, which matters because the model half
                  divides by the number of rows. Ten rows out of 266 have to
                  come from somewhere other than this method, and the method is
                  at least able to say which ten.
                </p>
                <KeepInMind>
                  {"Whitespace is text, but this source tokenizer discards it while finding words. A whitespace-only decoded token therefore yields no source IDs. Report that unmapped row and apply an explicit initialization policy."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "Taking the ten-merge vocabulary as the old one and the three-merge vocabulary as the new one, every token is answered without any decoding.",
              true,
              "The two fits use the same corpus, deterministic merge order and boundary convention. The shorter run therefore retains the initial entries of the longer run. In this transfer, fourteen entries copy directly and the unknown entry receives its designated mapping. If the training corpus or settings differ, shrinking the row count alone no longer guarantees this prefix relationship.",
            ),
            choice(
              "Why does the current text-based transfer rule change ew’s boundary form when it re-encodes that isolated fragment?",
              [
                "Decoding has to produce text, because text is the only thing the old vocabulary knows how to read, and a marker is not part of the text",
                "The old vocabulary holds no row for that piece, so it has to invent one",
                "The marker is added by the new vocabulary after the reading, not by the old one",
                "The two letters are too short for the old vocabulary to place them inside a word",
              ],
              0,
              "Handed the text ew the old vocabulary sees a word two letters long and spells it as e followed by w with the marker on it. One could imagine passing the position along beside the text, and then the old vocabulary would need an entry point that encodes a fragment known to sit inside a word, which is a different operation from encoding a text and not one any of these vocabularies offers.",
            ),
            choice(
              "Take the old vocabulary one merge smaller so it no longer holds the piece made of l and o. What comes back when that piece is read again?",
              [
                "Nothing, so the token is reported as having no rows",
                "The row for l and the row for o, which is a worse spelling but an honest one",
                "The row for l and the row that means it could not say, which is a summary of everything the old model ever failed to read",
                "The row for low with its marker, since that is the nearest spelling the old vocabulary holds",
              ],
              2,
              "The old vocabulary never needed word-final o: the four training words end in w, r or t. Encoding isolated lo therefore returns l followed by the unknown entry. Averaging those source rows would mix a known letter representation with the generic unknown representation. The transfer can report that mapping, but cannot infer the missing fragment-specific representation from it.",
            ),
            choice(
              "Moving a byte pair vocabulary into a WordPiece vocabulary of the same 22 rows, the copy rule fires four times where between two fits sharing a convention it fired fourteen. What accounts for that?",
              [
                "The WordPiece fit learned different merges from the same corpus",
                "The two conventions mark opposite ends, so almost no spelling is shared between them except by accident",
                "WordPiece holds more single characters, and single characters are never copied",
                "The copy rule compares the pieces a token decodes to rather than the token itself",
              ],
              1,
              "These implementations attach different boundary meanings to their entries: BPE marks word endings, while WordPiece marks continuations. Seventeen of the 22 target entries therefore require re-encoding, and five map only to the old unknown entry. Even low maps to a word-final version under the old tokenizer. Matching readable letters does not establish matching boundary semantics.",
            ),
            choice(
              "Fit a byte-level vocabulary of 266 rows over the four words and move the ten-merge byte pair vocabulary into it. What happens to the tokens whose text is whitespace?",
              [
                "They come back with no rows at all, because a space handed to a vocabulary whose first step is to find the words finds none",
                "They map to the label for the unspellable, since the byte pair vocabulary has no row for a space",
                "They are copied, since both vocabularies name their bytes the same way",
                "They are read as the end-of-word marker, which is the nearest thing to a space the byte pair vocabulary holds",
              ],
              0,
              "Ten target tokens decode to whitespace alone. The old tokenizer removes that whitespace before finding words, so their source-ID mappings are empty. This differs from mapping to one unknown-token row. The transfer report marks those tokens as unmapped because averaging zero source rows cannot initialize an embedding; another initialization policy is needed.",
            ),
        ],
        },
        {
          title: "Part 5. The Move Between Two Domains",
          content: (
            <>
              <SubSection title="16. What survives, what is read again, and what is lost">
                <p>
                  Back to the eighteen sentences about reports and the eighteen
                  about pastry. The old vocabulary is 137 rows and the new one
                  is 125, and the move answers every one of the 125. Fifty-seven
                  are copied because the old vocabulary holds their spellings,
                  one is the label for the unspellable, and the remaining 67 are
                  read again, from 2.63 old rows each on average.
                </p>
                <p>
                  {"Of the 57 exact copies, 14 contain more than one character. Many other copies come from the shared alphabet. Their value depends on how the model used them; a single-character row is not automatically less useful than a longer fragment."}
                </p>
                <NumberTable
                  headings={["how the new row was seeded", "tokens"]}
                  rows={[
                    ["copied, an exact spelling the old vocabulary held", "57"],
                    ["of those, longer than one character", "14"],
                    ["read again from the old vocabulary’s pieces", "67"],
                    ["the label for anything unspellable", "1"],
                    ["nothing at all", "0"],
                  ]}
                  caption="Every token of the new vocabulary is accounted for, and the first and third rows are the two halves of the method."
                />
                <KeepInMind>
                  {"Nearly half the target entries copy by exact spelling here, largely because the alphabets overlap. This counts reusable row identities, not how much useful learned behavior they preserve."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What a larger new vocabulary does to that">
                <p>
                  Let&apos;s fit the pastry corpus at nine vocabulary sizes. For each one, transfer the report vocabulary and count how many rows use each transfer route. That shows how the chosen size changes the amount of exact reuse and composed initialization.
                </p>
                <SurvivalSweep />
                <p>
                  The copied count climbs from 47 to 57 and then stops, while
                  the count read again goes from 4 to 67. That shape follows
                  from what a merge buys. The first rows a fit learns are its
                  alphabet, which the two corpora share almost entirely; every
                  row after that is a piece the pastry corpus found frequent,
                  and the longer and more particular those pieces get, the less
                  likely the report corpus is to have found the same string
                  frequent.
                </p>
                <KeepInMind>
                  At 52 rows, 47 of them are copied and the new corpus still
                  costs 472 pieces; at 125 rows only 57 are copied and it costs
                  276. What survives a move depends on how far the new
                  vocabulary was allowed to grow.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The same two losses, at this size">
                <p>
                  The pieces from Part 4 are not a property of a toy corpus, and
                  the counts here say how common they are. Of the 67 tokens read
                  again, 35 never ended a word, and 25 of those come back from
                  the old vocabulary with a marker on their last piece, claiming
                  a word ended where the original piece claimed nothing of the
                  kind.
                </p>
                <p>
                  Twelve of the 67 reach the label for the unspellable somewhere
                  in their reading, and two of those reach nothing else. Those
                  two are the letters k and x with the end-of-word marker, which
                  the pastry corpus needs for rack and Mix and the report corpus
                  never needs, since no word of eighteen sentences about
                  analyses ends in either letter. Their new rows would be
                  averages of one row, and that row means &ldquo;something I
                  could not read&rdquo;.
                </p>
                <NumberTable
                  headings={["among the 67 read again", "tokens"]}
                  rows={[
                    ["never ended a word", "35"],
                    ["came back claiming a word ended", "25"],
                    ["reached the label for the unspellable", "12"],
                    ["reached nothing else", "2"],
                  ]}
                  caption="The first two rows are the marker being lost; the second two are the old alphabet being narrower than the new corpus needs."
                />
                <KeepInMind>
                  Twenty-five of the sixty-seven tokens that had to be read
                  again came back saying something about position that was not
                  true of them, and the only way to know which twenty-five is to
                  compare the markers on both sides, which is what the counts
                  above are doing.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. What the move buys, and what it does not">
                <p>
                  {"The new pastry vocabulary encodes its training corpus more compactly. The separate held-out sentence also uses fewer pieces under it. These are tokenizer-length measurements; transferring embeddings does not cause the sequence reduction."}
                </p>
                <LengthAfterTheMove />
                <p>
                  One thing about those numbers has to be said plainly, because
                  it is easy to read the page as claiming more than it does. The
                  276 is not something the move achieved. The new vocabulary
                  reads the new corpus in exactly the pieces a vocabulary
                  learned fresh on that corpus would, because it is a vocabulary
                  learned fresh on that corpus. Moving the old rows into it
                  changes nothing whatever about how text is cut.
                </p>
                <p>
                  What the move buys is the second column of section 3, the
                  32,000 numbers that would otherwise have started from noise.
                  The sequence length is bought by learning a new vocabulary,
                  which anybody can do; the move is about what it costs to
                  actually use one.
                </p>
                <KeepInMind>
                  Every number about length on this page is a fact about the two
                  vocabularies and not about the move. The move&rsquo;s own
                  contribution is invisible to a tokenizer and shows up only in
                  what the model has to relearn.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Where the move is worse than doing nothing">
                <p>
                  The report corpus was the model&rsquo;s home, and after the
                  move it is not read well at all. Under the old vocabulary the
                  eighteen report sentences cost 263 pieces; under the new one
                  they cost 505, which is worse than the penalty the pastry
                  corpus was paying in the other direction. The sentence about Dr. Alvarez
                  of this section goes from 25 pieces to 37.
                </p>
                <p>
                  It gets worse than length on that sentence. Under the old
                  vocabulary one piece of it comes back as the stand-in, the z of
                  Alvarez, and under the new one five do. The four that were
                  added are the apostrophe, both hyphens, and the x of expect,
                  since the pastry corpus uses none of the first three and uses
                  an x only at the end of Mix. Switch the widget above to the
                  sentence of the old domain to see the two readings side by
                  side.
                </p>
                <InAModel>
                  <p>
                  {"If the model will still process report text, evaluate that domain as well as pastry text. Adapting a vocabulary does not require deciding the old domain no longer matters; mixed-domain training and a combined evaluation are alternatives."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"A vocabulary can represent several domains, although a fixed budget may require tradeoffs. Here the new fit shortens pastry text while lengthening report text. Weight those measurements according to the input distribution the application expects."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. How much of the new table the move fills">
                <p>
                  Counted at the width of 256 chosen in section 2, the new table
                  is 32,000 numbers. Every row of it has at least one old row to
                  average, so the move fills all 32,000, which is the number that
                  would otherwise have been drawn from noise.
                </p>
                <p>
                  512 of those numbers, being the two rows seeded only from the
                  label for the unspellable, are filled with something that
                  carries nothing about the token it was given to. Two rows of
                  125 is 1.6 per cent of the table, and the method at least names
                  which two rather than leaving them to be found later.
                </p>
                <KeepInMind>
                  {"Every target entry receives at least one source ID in this mapping, partly because an unknown-token fallback can be returned. That is weaker than saying the alphabets match or every row receives informative reusable content. Whitespace mappings in the earlier comparison show a different unmapped case."}
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Choosing how large the new vocabulary should be">
                <p>
                  Section 17 measured the two routes across nine sizes, and the
                  same nine fits say what each size costs in length, so the
                  choice can be made with both columns in view rather than one.
                </p>
                <NumberTable
                  headings={[
                    "rows asked for",
                    "rows learned",
                    "copied",
                    "read again",
                    "the new corpus",
                  ]}
                  rows={[
                    ["52", "52", "47", "4", "472 pieces"],
                    ["70", "70", "52", "17", "399 pieces"],
                    ["90", "90", "56", "33", "346 pieces"],
                    ["110", "110", "56", "53", "306 pieces"],
                    ["125", "125", "57", "67", "276 pieces"],
                    ["137", "125", "57", "67", "276 pieces"],
                  ]}
                  caption="The last two rows are the same fit, since the corpus runs out of pairs it has seen twice at 125 rows."
                />
                <p>Increasing the table from 52 to 125 rows makes the corpus representation 196 pieces shorter while adding 63 pieces whose rows need to be rebuilt. The benefit is reduced sequence length; the cost includes learning useful values for the changed rows. This experiment measures the token counts and row mappings, not the downstream training cost, so it cannot settle that tradeoff by itself.</p>
                <KeepInMind>
                  The size of the new vocabulary is chosen the same way it is
                  chosen without any move at all, by what the sequences cost.
                  What the move adds is that the count read again grows from 4 to
                  67 across that same range, and nothing on this page says what
                  one of those costs.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What Is Lost When IDs Travel Through Text" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="23. Spelling is preserved and position is not">
                <p>
                  The third rule passes only decoded text between the vocabularies. A vocabulary piece may also carry a boundary role, recorded by a marker that is not part of that text. The transfer therefore cannot preserve every part of the original piece&apos;s interpretation through this interface.
                </p>
                <p>
                  {"The exact-copy route retains the matching token representation under compatible conventions. The plain-text route can lose boundary context. In this example 25 target entries return a different boundary interpretation. A richer fragment-encoding interface could preserve that context, but these tokenizer APIs do not expose it."}
                </p>
                <KeepInMind>
                  This is a limit of the channel rather than of the
                  implementation. Any method that moves a vocabulary by
                  spellings alone loses whatever the spellings do not carry.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Nothing here can say whether the move was good">
                <p>
                  {"This transfer policy deterministically constructs a mapping rather than optimizing a loss. We can still compare policies using mapping checks, adaptation cost and task performance. Those evaluations need to be supplied; the procedure does not define one universal score itself."}
                </p>
                <>
<p>
                  {"Copy and re-encoding counts help describe how the new table is initialized. They do not establish model quality by themselves. A copied piece can be used differently in the new corpus, while an average of several old rows may provide a useful start."}
                </p>
                <p>
                  The only way to know is to run the model on the new corpus, and that is a measurement about a model rather than about a vocabulary.
                </p>
</>
                <KeepInMind>
                  The counts on this page describe the move without scoring it,
                  and the question anybody actually has, which is whether the
                  moved model still works, has to be answered by running it on
                  the new corpus.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. A piece may survive and still be doing another job">
                <p>
                  Even an exact row copy has a limit. The spelling and vector survive, but the new corpus may use that spelling in different words or contexts. Copying gives us an initialization from what the old model learned. It does not establish that the vector already suits the new subject.
                </p>
                <NumberTable
                  headings={[
                    "the piece",
                    "in the reports it spells",
                    "in the pastry it spells",
                  ]}
                  rows={[
                    ["lo", "low", "hollow."],
                    ["an, ending a word", "reran, than", "an"],
                    ["st, ending a word", "August, lowest", "crust, last, rest"],
                    ["ar", "early., summary.", "board, starter"],
                    ["te", "team, tests", "minutes."],
                  ]}
                  caption="Five pieces the copy rule maps exactly, with every word each of them appears inside on either side. No word is shared by any of the five rows."
                />
                <p>
                  The copied row can preserve its exact numerical contents while being used in a different context. In the report corpus, an is a tail inside reran or than; in the pastry corpus, it can be the whole word an. Copying provides an initialization, but successful adaptation requires testing how the model learns to use that row under the new segmentation.
                </p>
                <KeepInMind>
                  A copied row arrives with everything the old model learned
                  about that spelling and nothing about which words it learned
                  it from. The five rows above are copied exactly, and not one
                  of them shares a single word between the two corpora.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Unknown pieces and boundaries that cannot survive the transfer" id="26-where-the-method-has-nothing-to-say">
                <p>Moving between vocabularies can lose information at more than one point. Check whether the old IDs can be decoded, whether the resulting text retains its boundaries, and whether the new vocabulary can represent that text.</p>
                <DerivationTable
                  expressionHeading="Token or boundary information"
                  reasonHeading="What survives the vocabulary change"
                  rows={[{"expression":"a token whose text has no words in it","reason":"there is nothing to read, so there are no rows and an average over none is not a number. The row has to come from outside the method, and the choices are a random draw, a copy of some default, or refusing the move; nothing here prefers one. Ten of 266 in the byte-level move of section 15."},{"expression":"a piece that never ended a word","reason":"undefined, in the sense that the text it decodes to cannot express what the piece was. Reading that text gives a spelling that claims a word ended; the alternative would be an entry point that encodes a fragment known to sit inside a word, which is a different operation and one these vocabularies do not offer. 25 of the 125 new rows here."},{"expression":"a piece whose last letter never ends a word in the old corpus","reason":"This source alphabet cannot represent the required word-final symbol and falls back to its unknown row. That row’s learned content depends on the source model; the tokenizer mapping alone does not measure its numerical error."},{"expression":"two vocabularies that mark opposite ends","reason":"defined, and the copy rule fires almost never, so the whole vocabulary takes the lossy route. Four of 22 copied across conventions against 14 of 22 within one. Translating the conventions before comparing is possible and is a decision about what counts as the same piece, which nothing in the method settles."},{"expression":"how to combine several old rows into one","reason":"an unweighted mean is the usual answer and it is a choice. Weighting by how often each piece occurs, or by its length, or taking the row of the longest piece alone, are all available and all defensible, and the method as stated does not say which. On a token read as four rows the difference is not small."},{"expression":"the token for anything unspellable","reason":"Match an unknown token by its role when both schemes have one. A byte-based tokenizer can also choose to reserve special tokens; absence of an unknown row is not a property of every byte vocabulary."},{"expression":"whether the move was worth making","reason":"Compare transfer policies through mapping validity, adaptation work and model evaluations. The deterministic mapping does not supply a universal downstream quality score."},{"expression":"a shared spelling used differently","reason":"invisible. The copy rule compares strings, and two corpora can agree on a piece and disagree on every word containing it, as five pieces do in section 25. Nothing short of reading both corpora could tell, and the method reads neither."},{"expression":"a vocabulary that cannot decode faithfully","reason":"outside what the third rule presumes. The whole route runs through text, so a vocabulary whose pieces cannot be turned back into text has no route at all, and one whose decoding is approximate hands the old vocabulary something that was never in either corpus."}]}
                />
                <KeepInMind>
                  Three of these are decisions rather than limits, namely how
                  several rows are combined, what happens to a token with no
                  rows at all, and whether two conventions are translated before
                  being compared. Each has defensible answers on both sides and
                  each changes what the moved table starts from, so each belongs
                  in whatever describes a move rather than being left to an
                  implementation.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            trueFalse(
              "Moving the old rows into the pastry vocabulary is what takes that corpus from 428 pieces to 276.",
              false,
              "The new tokenizer determines the pieces, so its baking-corpus encoding already has length 276 whether embedding rows are transferred or freshly initialized. Transfer changes the numerical initialization of its 32,000 embedding values. It does not change token boundaries. Measuring its benefit requires running the model, in addition to counting tokens.",
            ),
            choice(
              "What does the move do to the corpus the model came from?",
              [
                "Nothing, since the copied rows keep the old corpus readable",
                "It costs it 263 pieces where the old vocabulary cost 505",
                "It costs it 505 pieces where the old vocabulary cost 263, which is worse than the penalty the pastry corpus was paying in the other direction",
                "It costs it about the same, since the two corpora share an alphabet",
              ],
              2,
              "The new vocabulary uses 37 pieces for the Dr. Alvarez sentence instead of 25, and its unknown-token count rises from one to five. Across the two supplied corpora, the totals are 781 and 691 respectively. These results show a tradeoff for these two training distributions. A vocabulary can also be trained on a mixture; the choice should reflect the text the model is expected to receive.",
            ),
            several(
              "Which of these hold of the move between the two eighteen-sentence corpora?",
              [
                "Of the 67 tokens read again, 35 never ended a word, and 25 of those come back with a marker on their last piece",
                "Twelve of the 67 reach the label for the unspellable somewhere in their reading, and two reach nothing else",
                "Only 14 of the 57 copied tokens are longer than a single character",
                "The 57 copied tokens are mostly pieces the two corpora both taught",
              ],
              [0, 1, 2],
              "Most shared spellings are alphabet entries. Fourteen longer pieces also occur in both fitted vocabularies. The word-final k and x needed by rack and Mix have no corresponding final-symbol entries in the report vocabulary, so their new rows map only to the unknown source row. Shared characters do not guarantee every required boundary-specific symbol exists.",
            ),
            trueFalse(
              "Fifty-seven copied against sixty-seven read again is evidence that the moved model will work.",
              false,
              "The counts describe mapping coverage, not the adapted model's quality. A copied row can be used in a different context, as an is across these corpora. A row initialized by averaging can be useful or poor. Evaluate the transferred model on the intended tasks, including any additional training, before claiming that the mapping improved it.",
            ),
            trueFalse(
              "Fitting the pastry corpus at nine sizes and moving the report vocabulary into each, the copied count climbs from 47 to 57 and then stops, while the count read again goes from 4 to 67.",
              true,
              "In this size sweep, the copied count rises from 47 to 57 while re-encoded entries rise from four to 67. Many shared rows are alphabet entries. The baking corpus becomes shorter under its own larger vocabulary, but the counts measure mapping coverage rather than adapted-model quality. The source corpus and tokenizer settings determine whether a different sweep shares more learned pieces.",
            ),
        ],
        },
        {
          title: "Practice. Moving the Four-Word Vocabularies With the Library",
          practice: [
            exercise(
              "Shrink the ten-merge vocabulary and grow the three-merge one",
              [
  "Learn BPE vocabularies of 15 and 22 rows from the supplied four-word corpus, with byte fallback disabled. Compare transferring from the larger table to the smaller one with transferring in the opposite direction.",
  "Print each fitted size and merge count. For each transfer print the target-token count, how many target spellings are absent from the old table and the average number of source IDs used to seed those newly spelled tokens.",
  "An unchanged spelling can copy an old row directly. A new spelling must first be decoded and encoded using the old tokenizer; this exercise inspects that mapping, not trained embedding quality."
],
              `from oop_ml import BytePairEncoding, VocabularyTransfer

counts = {"low": 5, "lower": 2, "newest": 6, "widest": 3}
corpus = [" ".join(word for word, count in counts.items() for _ in range(count))]
small = BytePairEncoding(vocabulary_size=15, byte_fallback=False).fit(corpus)
large = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
print(f"small: {small.vocabulary.n_tokens} rows from {small.n_merges} merges")
print(f"large: {large.vocabulary.n_tokens} rows from {large.n_merges} merges")

for label, old, new in [("shrinking", large, small), ("growing", small, large)]:
    # Move the old vocabulary into the new one, collect the mappings whose
    # token the old vocabulary does not hold, and print how many there are
    # and the mean number of old rows they are seeded from, to two places.
    pass`,
              `from oop_ml import BytePairEncoding, VocabularyTransfer

counts = {"low": 5, "lower": 2, "newest": 6, "widest": 3}
corpus = [" ".join(word for word, count in counts.items() for _ in range(count))]
small = BytePairEncoding(vocabulary_size=15, byte_fallback=False).fit(corpus)
large = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
print(f"small: {small.vocabulary.n_tokens} rows from {small.n_merges} merges")
print(f"large: {large.vocabulary.n_tokens} rows from {large.n_merges} merges")

for label, old, new in [("shrinking", large, small), ("growing", small, large)]:
    move = VocabularyTransfer.between(old, new)
    read_again = [mapping for mapping in move if mapping.target_token not in old.vocabulary]
    old_rows = sum(mapping.n_source_ids for mapping in read_again)
    mean_rows = old_rows / len(read_again) if read_again else 0.0
    print(f"{label}: {len(move)} tokens, {len(read_again)} read again, {mean_rows:.2f} old rows each")`,
              `small: 15 rows from 3 merges
large: 22 rows from 10 merges
shrinking: 15 tokens, 0 read again, 0.00 old rows each
growing: 22 tokens, 7 read again, 2.86 old rows each`,
              {
question: "What must be mapped when a smaller vocabulary grows?",
 hints: [
  "VocabularyTransfer.between(old, new) produces one mapping per target token.",
  "A newly spelled token has target_token absent from old.vocabulary. Each such mapping exposes n_source_ids.",
  "Handle an empty set of new spellings explicitly when reporting its average. Shrinking can need no re-encoding."
], check: numberCheck("For the seven newly spelled target tokens, how many source vocabulary rows are used per token on average?", 2.86, 0.005, "Growing seeds each newly spelled token from about 2.86 old rows on average. Shrinking needs no such re-encoding because this smaller vocabulary is an initial portion of the larger learned table.") },
            ),
            exercise(
              "Follow one piece through decoding",
              [
  "Inspect two transfer mappings that look straightforward by spelling. Move the three-merge BPE vocabulary into the ten-merge one and print the old pieces used for ew.",
  "Then fit a two-merge vocabulary of fourteen rows, transfer it into the same ten-merge target, and print the old pieces used for lo. Disable byte fallback in these BPE fits.",
  "For the narrower transfer print the number of new target spellings and how many of them use the old unknown ID, including their names. An isolated piece can be re-encoded as a complete word even when it originally belonged inside one."
],
              `from oop_ml import BytePairEncoding, VocabularyTransfer

counts = {"low": 5, "lower": 2, "newest": 6, "widest": 3}
corpus = [" ".join(word for word, count in counts.items() for _ in range(count))]
small = BytePairEncoding(vocabulary_size=15, byte_fallback=False).fit(corpus)
narrow = BytePairEncoding(vocabulary_size=14, byte_fallback=False).fit(corpus)
large = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)

growing = VocabularyTransfer.between(small, large)
# Print the old tokens the piece "ew" is seeded from in the growing move.

narrowed = VocabularyTransfer.between(narrow, large)
# Print the old tokens the piece "lo" is seeded from in the narrowed move,
# then count the tokens read again in that move and how many of them have
# the old vocabulary's unknown id among their source ids.`,
              `from oop_ml import BytePairEncoding, VocabularyTransfer

counts = {"low": 5, "lower": 2, "newest": 6, "widest": 3}
corpus = [" ".join(word for word, count in counts.items() for _ in range(count))]
small = BytePairEncoding(vocabulary_size=15, byte_fallback=False).fit(corpus)
narrow = BytePairEncoding(vocabulary_size=14, byte_fallback=False).fit(corpus)
large = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)

growing = VocabularyTransfer.between(small, large)
piece = growing.for_token("ew")
print(f"ew is read by the three-merge vocabulary as {small.vocabulary.tokens_of(piece.source_ids)}")

narrowed = VocabularyTransfer.between(narrow, large)
piece = narrowed.for_token("lo")
print(f"lo is read by the two-merge vocabulary as {narrow.vocabulary.tokens_of(piece.source_ids)}")

read_again = [mapping for mapping in narrowed if mapping.target_token not in narrow.vocabulary]
unknown = narrow.vocabulary.unknown_id
reaching = [mapping.target_token for mapping in read_again if unknown in mapping.source_ids]
print(f"{len(read_again)} tokens read again, {len(reaching)} reaching the stand-in: {reaching}")`,
              `ew is read by the three-merge vocabulary as ('e', 'w</w>')
lo is read by the two-merge vocabulary as ('l', '[UNK]')
8 tokens read again, 1 reaching the stand-in: ['lo']`,
              {
question: "Does decoding an isolated vocabulary piece preserve its word position?",
 hints: [
  "for_token(name) retrieves one mapping. old.vocabulary.tokens_of(mapping.source_ids) shows its source spellings.",
  "A two-merge fit has vocabulary_size=14 on this corpus.",
  "Check membership of old.vocabulary.unknown_id in each new spelling’s source_ids, rather than checking only the mapping length."
], check: numberCheck("How many target token spellings require re-encoding when transferring from the two-merge vocabulary to the ten-merge vocabulary?", 8, 0.5, "Eight target spellings need re-encoding from the two-merge table. Lo reaches an unknown row because the old end-marked vocabulary cannot spell its isolated final o, even though its characters occur in other positions.") },
            ),
            exercise(
              "Cross into a vocabulary that marks the other end",
              [
  "Fit the supplied four-word corpus with a 22-row WordPiece tokenizer and a 22-row BPE tokenizer with byte fallback disabled. Transfer from the BPE vocabulary to WordPiece.",
  "Print copied target spellings, excluding the shared unknown spelling, and their count. Then print the number re-encoded and the spellings mapped solely to the unknown source ID.",
  "Finally show the old pieces used for ##est and low. WordPiece marks continuations while this BPE marks word endings, so a plausible letter sequence may carry a different boundary claim."
],
              `from oop_ml import BytePairEncoding, VocabularyTransfer, WordPiece

counts = {"low": 5, "lower": 2, "newest": 6, "widest": 3}
corpus = [" ".join(word for word, count in counts.items() for _ in range(count))]
large = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
word_piece = WordPiece(vocabulary_size=22).fit(corpus)

crossing = VocabularyTransfer.between(large, word_piece)
# Count the copied tokens other than the label for the unspellable, the
# tokens read again, and the tokens whose only source id is the old
# vocabulary's unknown id, then print the readings of "##est" and "low".`,
              `from oop_ml import BytePairEncoding, VocabularyTransfer, WordPiece

counts = {"low": 5, "lower": 2, "newest": 6, "widest": 3}
corpus = [" ".join(word for word, count in counts.items() for _ in range(count))]
large = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
word_piece = WordPiece(vocabulary_size=22).fit(corpus)

crossing = VocabularyTransfer.between(large, word_piece)
unknown = word_piece.vocabulary.unknown_token
copied = [mapping.target_token for mapping in crossing if mapping.target_token in large.vocabulary and mapping.target_token != unknown]
read_again = [mapping for mapping in crossing if mapping.target_token not in large.vocabulary]
stand_in = large.vocabulary.unknown_id
stand_in_alone = [mapping.target_token for mapping in read_again if mapping.source_ids == (stand_in,)]
print(f"copied {len(copied)}: {copied}")
print(f"read again {len(read_again)}, seeded from the stand-in alone {len(stand_in_alone)}: {stand_in_alone}")
for token in ("##est", "low"):
    print(f"{token} is read as {large.vocabulary.tokens_of(crossing.for_token(token).source_ids)}")`,
              `copied 4: ['l', 'n', 'w', 'lo']
read again 17, seeded from the stand-in alone 5: ['##d', '##e', '##i', '##o', '##s']
##est is read as ('est</w>',)
low is read as ('low</w>',)`,
              {
question: "Can two tokenizers share readable letters but disagree about boundary meaning?",
 hints: [
  "Inspect target_token and source_ids on every transfer mapping.",
  "An unknown-only mapping has a one-element source_ids tuple containing the old unknown_id.",
  "Use for_token and tokens_of to inspect the two named mappings. A single source row does not by itself mean the boundary semantics match."
], check: numberCheck("How many of the seventeen re-encoded target tokens map only to the old unknown-token entry?", 5, 0.5, "Five new target spellings map only to the unknown source row. The mapping procedure decodes them as isolated text, which changes the position assumed by the old end-marked vocabulary.") },
            ),
            exercise(
              "Ask for a token whose text is not text",
              [
  "Fit the supplied corpus with a 266-row byte-level BPE vocabulary and the ten-merge end-marked BPE vocabulary. Transfer from the end-marked vocabulary into the byte-level one.",
  "Print the target size and number of unmapped tokens. For each unmapped token, decode its target ID and print the resulting single character’s integer value and escaped spelling.",
  "The older tokenizer discards whitespace before encoding words. A whitespace-only target token can therefore produce no source IDs at all. Use escaped spellings so tabs and line breaks remain visible in the report."
],
              `from oop_ml import ByteLevelBytePairEncoding, BytePairEncoding, VocabularyTransfer

counts = {"low": 5, "lower": 2, "newest": 6, "widest": 3}
corpus = [" ".join(word for word, count in counts.items() for _ in range(count))]
large = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
byte_level = ByteLevelBytePairEncoding(vocabulary_size=266).fit(corpus)

move = VocabularyTransfer.between(large, byte_level)
# Print how many mappings there are and how many have no source ids, then
# for each token without a row decode it on its own and print the byte
# value of the character that comes back beside its escaped spelling.`,
              `from oop_ml import ByteLevelBytePairEncoding, BytePairEncoding, VocabularyTransfer

counts = {"low": 5, "lower": 2, "newest": 6, "widest": 3}
corpus = [" ".join(word for word, count in counts.items() for _ in range(count))]
large = BytePairEncoding(vocabulary_size=22, byte_fallback=False).fit(corpus)
byte_level = ByteLevelBytePairEncoding(vocabulary_size=266).fit(corpus)

move = VocabularyTransfer.between(large, byte_level)
print(f"{move.n_mappings} tokens, {move.n_unmapped} with no rows at all")
for token in move.unmapped_tokens:
    text = byte_level.decode([byte_level.vocabulary.id_of(token)])
    print(f"byte {ord(text):>2} is {ascii(text)}")`,
              `266 tokens, 10 with no rows at all
byte  9 is '\\t'
byte 10 is '\\n'
byte 11 is '\\x0b'
byte 12 is '\\x0c'
byte 13 is '\\r'
byte 28 is '\\x1c'
byte 29 is '\\x1d'
byte 30 is '\\x1e'
byte 31 is '\\x1f'
byte 32 is ' '`,
              {
question: "What happens when a target token decodes to whitespace alone?",
 hints: [
  "n_unmapped and unmapped_tokens identify the mappings without source IDs.",
  "Look up the target token’s ID, decode it with the byte-level model, then use ord and ascii on the result.",
  "Keep these empty mappings distinct from a mapping to an unknown row. They require different handling before any embedding average could be formed."
], check: numberCheck("How many of the 266 target tokens have no source IDs after re-encoding?", 10, 0.5, "Ten target tokens have no source rows. Each decodes to a whitespace character that the older tokenizer removes before it looks for words.") },
            ),
          ],
        },
      ]}
    />
  );
}
