import type { Metadata } from "next";
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
import { LengthAfterTheMove } from "@/components/widgets/LengthAfterTheMove";
import { MappingRoutes } from "@/components/widgets/MappingRoutes";
import { MarkerLoss } from "@/components/widgets/MarkerLoss";
import { SurvivalSweep } from "@/components/widgets/SurvivalSweep";
import { VocabularyMovePlayground } from "@/components/widgets/VocabularyMovePlayground";

export const metadata: Metadata = {
  title: "Moving a Vocabulary · oop_ml",
  description:
    "Fast vocabulary transfer takes a vocabulary learned somewhere else and says which old rows each new token is made of. An exact spelling is copied, and everything else is decoded to text and read again.",
};

export default function MovingAVocabularyPage() {
  return (
    <ConceptPage
      title="Moving a Vocabulary"
      tagline="Fast vocabulary transfer takes a vocabulary learned somewhere else and says which old rows each new token is made of. An exact spelling is copied, and everything else is decoded to text and read again."
      prerequisites={
        <>
          You need two things from earlier in this section. The first is what a
          vocabulary is, which is a list of spellings with a position for each,
          so that a text becomes a list of positions. The second is byte pair
          encoding, since both vocabularies on this page are learned that way,
          and in particular the marker that says a piece ended a word rather
          than continuing one. Nothing else on this page is new machinery. Every
          other page in this section is about learning a vocabulary; this one is
          about a vocabulary that already exists and has to be used somewhere it
          was not learned.
        </>
      }
      history={
        <>
          <p>
            The problem this answers arrived with the pre-trained language
            model. From 2018 onward the usual way to build a system for a
            particular task stopped being to train something from nothing and
            became to take a model somebody else had trained on very general
            text and adjust it. That model shipped with a vocabulary, learned
            once, from that general text, and fixed before a single weight was
            trained. Anybody applying it to a narrower subject inherited a
            vocabulary chosen for a subject that was not theirs.
          </p>
          <p>
            The two answers available before this one were expensive in
            different ways. Continue training the model on the new subject and
            the vocabulary is unchanged, so the words of that subject keep being
            cut into the same many pieces they were always cut into. Learn a
            vocabulary from the new subject instead and the model has to be
            trained again from the beginning, which is what Iz Beltagy, Kyle Lo
            and Arman Cohan did at the Allen Institute in 2019 when they built a
            model for scientific text and learned its vocabulary from a corpus
            of papers rather than reusing the general one. Their result was
            better on scientific text, and it cost a full pre-training run to
            get.
          </p>
          <p>
            Leonidas Gee and colleagues published the shortcut in 2022, in a
            paper about making models smaller and quicker, under the name fast
            vocabulary transfer. Their observation is the one this page is
            built on. A model whose vocabulary is replaced does not have to
            forget what it learned, because a token of the new vocabulary is
            usually either a token the old one held, whose row can be copied
            outright, or a string the old vocabulary can spell in a handful of
            its own pieces, whose rows averaged together are a far better
            starting point than noise. There is no training in that, only a
            lookup per token. This page asks five questions in order. Why would
            anybody move a vocabulary rather than learn one? What has to be
            decided when a piece of the new vocabulary is looked up in the old?
            What does decoding a piece throw away, and which pieces does it
            throw it away on? What does the move buy on a corpus it was not
            learned from, and where is it worse than doing nothing at all? And
            what can the method not tell us about its own answer?
          </p>
        </>
      }
      playground={<VocabularyMovePlayground />}
      sections={[
        {
          title: "Part 1. Why a Vocabulary Would Ever Move",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. A vocabulary learned on one subject, reading another">
                <p>
                  We need two corpora rather than one, and they should differ in
                  what they are about while agreeing on the letters they are
                  written in. So the first is the eighteen sentences the byte
                  pair page already learns from, about reports and costs and
                  analyses, and the second is eighteen sentences I wrote about
                  bread and pastry. Every character the second uses appears in
                  the first, which was arranged on purpose, since a letter the
                  old corpus never contained would be unreadable for a reason
                  that has nothing to do with moving a vocabulary. What the two
                  do not share is their words.
                </p>
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
                  Half again as long is not a rounding error, and it is the
                  ordinary situation rather than a contrived one. The first
                  vocabulary spent its 85 merges on analysis and estimate and
                  expected, and none of them on dough or butter or pastry, so
                  every word of the second corpus is assembled out of pieces
                  that were frequent somewhere else.
                </p>
                <KeepInMind>
                  A vocabulary is a summary of one corpus and of nothing else.
                  Reading a different corpus with it costs 428 pieces where 276
                  would have done, and no part of that is an error, so nothing
                  anywhere reports a problem.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What starting again would cost">
                <p>
                  Learning the second vocabulary took no time worth measuring.
                  Counting pairs over eighteen sentences 79 times is arithmetic
                  a person could do by hand in an afternoon and a computer does
                  before the request finishes. If that were the whole cost,
                  nobody would ever keep a vocabulary that did not suit their
                  text.
                </p>
                <p>
                  What costs something is the thing that reads the vocabulary.
                  Whatever model sits behind the tokenizer holds one row of numbers per
                  token, and those numbers are learned from the text rather than
                  counted from it. Give every row 256 numbers, which is a width
                  I have chosen here so that the count can be a number rather
                  than an adjective, and the new vocabulary is a table of 32,000
                  numbers, every one of which would start from nothing.
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
                  And the table is only the entrance. Everything behind it was
                  trained against the rows the old table produced, so a table
                  redrawn from noise makes the model&rsquo;s first layer
                  unreadable to its second, and the training that follows is not
                  a small correction. So the cost of changing a vocabulary is 79
                  merges on one side of the tokenizer and 32,000 numbers plus
                  everything trained against them on the other, and it is that
                  gap the method is aimed at.
                </p>
                <KeepInMind>
                  Learning a vocabulary is counting pairs, which is why the
                  pastry vocabulary cost nothing worth measuring to produce. The
                  table that reads it is 32,000 numbers learned from text, and
                  the two are far enough apart that keeping a vocabulary which
                  no longer suits the data can be the cheaper mistake.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Three ways out, and what each of them costs">
                <p>
                  Written down plainly there are three things one can do with a
                  model whose vocabulary no longer suits its data, and it is
                  worth setting them beside each other before any mechanism,
                  because the method below is the third of them and its whole
                  claim is about the second.
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
                  The third row is doing something that reads as too good until
                  one sees where the work went. Nothing is being learned; the
                  method only answers, for every token of the new vocabulary,
                  which rows of the old table it corresponds to. What it cannot
                  do is invent information the old table never held, and the
                  rest of this page is about exactly where that limit falls.
                </p>
                <KeepInMind>
                  The first two rows of that table are the alternatives the
                  method has to beat, and it only has to beat them on cost,
                  since on sequence length the second and third rows are
                  identical by construction.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. What a Move Has to Decide",
          content: (
            <>
              <SubSection title="4. A position is not a name, so nothing travels by number">
                <p>
                  A vocabulary hands a text to a model as a list of positions,
                  and the model finds row 60 of its table by counting to 60.
                  That works because within one vocabulary a position means one
                  thing, and it stops working the moment there are two
                  vocabularies, since the number 60 was assigned by whichever
                  merge happened to be learned sixtieth.
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
                  caption="The only position the two agree on is the first, and they agree there by convention rather than by accident."
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
                  Two vocabularies over the same corpus and the same method
                  still disagree about almost every position, so whatever is
                  going to travel between them has to travel as a spelling.
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
                  The first two rules are lookups and there is nothing in them
                  to go wrong. Everything that can go wrong in a move goes wrong
                  inside the third, which is why it takes the next two parts.
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
                <p>
                  The four-word corpus of the byte pair page teaches a piece
                  made of an l and an o that never ends a word, because the
                  words it comes from are low and lower and the l and the o are
                  followed by a w. Both vocabularies below hold it. Under the
                  copy rule it maps to itself, one row, exactly. Under the third
                  rule it would first become the two letters as plain text, and
                  those two letters read as text are a whole word ending in o,
                  which is a different thing and, on that corpus, an unspellable
                  one.
                </p>
                <KeepInMind>
                  The copy rule is what keeps every shared piece exact within
                  one convention, and it is why the lossy route is reached only
                  by tokens the old vocabulary has never seen in any form.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Seeding one row from several">
                <p>
                  What comes back from the third rule is a list of old
                  positions, and the model half of the method fills the new row
                  with the average of those old rows. That is the step the
                  method is named for, since an average of several vectors is
                  arithmetic rather than training, and it is why the whole thing
                  costs a lookup per token.
                </p>
                <Equation>{"new row for t  =  mean over the old rows the pieces of t point at"}</Equation>
                <p>
                  This page can measure which old rows, and it does not measure
                  the averaging, because the table belongs to the model and
                  there is no such table here. That is an honest gap rather than
                  an omission of something small; whether the average of two
                  rows is a good starting point for a piece is a question about
                  the model, and I have not answered it on this page.
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
                  That is the easiest move that exists, since the two agree
                  about the corpus, the alphabet, the marking convention and the
                  order the merges were learned in. Anything that goes wrong here
                  will go wrong in a harder move as well, which is the reason to
                  look at it first.
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
                  Nothing is lost when the new vocabulary is a prefix of the old
                  one. That is a fact about two fits of one method on one
                  corpus, and it disappears the moment the corpora differ.
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
                  <p>
                    The row for low with its marker decodes to low and is read
                    as lo followed by w with the marker, so it is seeded from
                    those two rows. The row for ewest with its marker decodes to
                    ewest and is read as e, then w, then est with the marker,
                    three rows. The row for widest with its marker takes four,
                    w and i and d and est with the marker. Every piece in those
                    readings is a piece the old model has seen many times, since
                    they are exactly the pieces it was using to spell those
                    words before the new vocabulary existed.
                  </p>
                </WorkedExample>
                <WhyThisWorks title="Why the average of those rows is a sensible start">
                  <p>
                    Before the move, the old model read the word low as two
                    positions and whatever it knew about that word it knew from
                    those two rows arriving together. After the move the word
                    arrives as one position, and the question is what to put
                    there. The average of the two rows is the one point that is
                    equally close to both, so it is the guess that assumes
                    nothing beyond what the pieces already said. It is not a
                    claim that the average is correct; it is a claim that it is
                    much closer to correct than a random draw, and the paper
                    that named the method is an argument that in practice the
                    difference is most of the accuracy.
                  </p>
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
                  Here is the finding this page is built around, and it is small
                  enough to state in one sentence. A piece carries, in its
                  marker, the fact that it did or did not end a word, and
                  decoding is precisely the operation that throws that fact
                  away, so a piece that only ever sat in the middle of a word
                  comes back as a whole word and is read as a different thing
                  entirely.
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
                  It is worth being clear about why this cannot be repaired
                  inside the third rule. Decoding has to produce text, because
                  text is the only thing the old vocabulary knows how to read,
                  and a marker is not part of the text. One could imagine
                  passing the position along beside the text, and then the old
                  vocabulary would need an entry point that encodes a fragment
                  known to sit inside a word, which is a different operation
                  from encoding a text and not one any of these vocabularies
                  offers.
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
                  The second loss is worse and comes from the same step. Take
                  the old vocabulary one merge smaller, so that it stops after
                  two merges and no longer holds the piece made of l and o.
                  Now that piece has to be read again, and its text is a word
                  two letters long ending in o.
                </p>
                <p>
                  No word of those four ends in o. Low ends in w, lower in r,
                  newest and widest in t, so the symbol meaning &ldquo;o at the
                  end of a word&rdquo; was never learned and cannot be. The old
                  vocabulary answers with the row for l and then the row that
                  means it could not say, and that second row is not a piece of
                  the word at all.
                </p>
                <Equation>{`the piece   lo            an l and an o, in the middle of low
its text    "lo"          a word ending in o
read again  l, [UNK]      and no word of this corpus ends in o`}</Equation>
                <p>
                  A new row seeded half from the row for l and half from the row
                  that means &ldquo;something else&rdquo; is not a bad guess in
                  the way a slightly wrong number is a bad guess. The second row
                  is a summary of everything the old model ever failed to read,
                  so averaging it in mixes the token with a category it has
                  nothing to do with.
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
                  Both losses get much larger when the two vocabularies mark
                  opposite ends. A byte pair vocabulary marks the piece that
                  ends a word; a WordPiece vocabulary marks the pieces that
                  continue one, leaving the first piece of a word unmarked. The
                  two describe the same idea and no spelling is shared between
                  them except by accident.
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
                  Two of the seventeen land on a plausible row, and it is worth
                  seeing why. The continuation piece est decodes to
                  the text est, which the byte pair vocabulary reads as the
                  whole word est, and it happens to hold a row for exactly that
                  spelling, so the mapping is right. The word-initial piece low
                  lands on the row for low with its marker in the same way, and
                  that one is right about the letters and wrong about the claim,
                  since a word-initial piece is not a piece that ended a word.
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
                  A token can be a name for something that is not text, and
                  nothing in the method can read it. The useful behaviour is to
                  say so rather than to return an average of no rows.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                  The 57 look better than they are. Only 14 of them are longer
                  than a single character, which is to say that most of what
                  survives by spelling is the shared alphabet, the letters and
                  the letters that end words. The 14 that are longer are the
                  ones worth having, and they are the pieces two corpora of
                  ordinary English cannot help sharing, the word the in both its
                  forms, and, in, and a handful of two-letter runs.
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
                  Nearly half the new vocabulary survives by spelling here, and
                  three quarters of that half is the alphabet the two corpora
                  share rather than anything either of them taught.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What a larger new vocabulary does to that">
                <p>
                  The size of the new vocabulary is a free choice, so it is
                  worth seeing what the choice does to the move rather than
                  guessing. Fit the pastry corpus at nine sizes, move the report
                  vocabulary into each, and count the two routes at each size.
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
                  The reason for all of this was length, so here is the length.
                  The pastry corpus falls from 428 pieces to 276, and one
                  sentence of it, held out of the corpus, falls from 34 pieces to
                  19.
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
                  corpus was paying in the other direction. The running sentence
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
                    A model in production usually has to keep doing the thing it
                    was doing. A vocabulary moved to fit a new subject is a
                    decision that the old subject no longer matters, and where it
                    still does, the comparison to make is over the two corpora
                    together, at which point the old vocabulary costs 691 pieces
                    and the new one costs 781.
                  </p>
                </InAModel>
                <KeepInMind>
                  A vocabulary can only be well fitted to one distribution of
                  text at a time. Moving this one takes 152 pieces off the
                  pastry corpus and adds 242 to the report corpus, and which of
                  those two numbers matters is a fact about what the model will
                  be asked to read.
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
                  The move fills the whole table here because the two corpora
                  share an alphabet. Between corpora that do not, the count of
                  rows it cannot fill is the number to look at before deciding
                  whether the move is worth making.
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
                <p>
                  Read across the rows and the trade is not the one it looks
                  like. Going from 52 rows to 125 costs 63 more tokens that have
                  to be read again, and buys 196 pieces off the corpus. Whether
                  that is a good exchange depends on how much a rebuilt row
                  costs the model, which is exactly the quantity this page
                  cannot measure, so the honest reading of the table is that the
                  right-hand column is the reason to take a larger vocabulary
                  and the middle columns are the reason to be careful about it.
                </p>
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
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="23. Spelling is preserved and position is not">
                <p>
                  Everything measured above follows from one property of the
                  third rule, and it is worth stating as a fact about the method
                  rather than as a result. The only channel between the two
                  vocabularies is text. A piece is not text; a piece is text
                  together with a claim about where in a word it sat, and that
                  claim is written in a marker which is not part of any string
                  the piece stands for.
                </p>
                <p>
                  So the move is exactly as faithful as the copy rule can make
                  it and no more. Where a spelling is shared, the marker travels
                  with it and nothing is lost. Where it is not, the marker
                  cannot travel, because the operation that produces the text
                  for the old vocabulary to read is the operation that removes
                  it. On the two eighteen-sentence corpora that cost 25 of the
                  125 new rows a false claim about position, and there is no
                  choice of decoding that would have avoided it.
                </p>
                <KeepInMind>
                  This is a limit of the channel rather than of the
                  implementation. Any method that moves a vocabulary by
                  spellings alone loses whatever the spellings do not carry.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Nothing here can say whether the move was good">
                <p>
                  Look for the quantity being maximised and there is not one.
                  Every other method in this section has an objective, whether
                  it is the corpus getting shorter or a likelihood going up, and
                  a fit can be compared with another fit by reading that number.
                  A move has no such number. Given the two vocabularies the
                  answer is determined, and there is no dial to turn and nothing
                  to compare.
                </p>
                <p>
                  That absence is not a technicality. What one wants to know is
                  whether the moved model works, and no arrangement of the counts
                  above answers it. Fifty-seven copied of 125 sounds
                  encouraging and 67 read again sounds worrying, and neither
                  number is evidence, because a copied row might be a piece the
                  new corpus uses for something else entirely and a rebuilt row
                  might be a perfectly good average. The only way to know is to
                  run the model on the new corpus, and that is a measurement
                  about a model rather than about a vocabulary.
                </p>
                <KeepInMind>
                  The counts on this page describe the move without scoring it,
                  and the question anybody actually has, which is whether the
                  moved model still works, has to be answered by running it on
                  the new corpus.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. A piece may survive and still be doing another job">
                <p>
                  The last point is the one the copy rule cannot see, and it is
                  the reason the previous section is not merely cautious. A
                  spelling shared by two vocabularies is copied exactly and its
                  row arrives intact, carrying everything the old model learned
                  about that piece. What the spelling does not carry is which
                  words the piece turns up in, and on two corpora about different
                  subjects that can be entirely different.
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
                  The second row is the sharpest of them. In the report corpus
                  the piece is the tail of reran and than, and in the pastry
                  corpus it is the whole word an, so a row that meant &ldquo;the
                  end of a longer word&rdquo; is now being asked to mean an
                  article. The row is copied exactly, nothing was lost in the
                  move, and it is still describing something the new corpus does
                  not do.
                </p>
                <KeepInMind>
                  A copied row arrives with everything the old model learned
                  about that spelling and nothing about which words it learned
                  it from. The five rows above are copied exactly, and not one
                  of them shares a single word between the two corpora.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs on which the
                  method stops being defined rather than becoming approximate,
                  together with what has to be decided in each case and what
                  turns on the decision. Several of them are genuinely open,
                  with defensible answers on either side, and those are the ones
                  worth a reader&rsquo;s attention, since they are the decisions
                  anybody moving a vocabulary has to make and nothing in the
                  method makes for them.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a token whose text has no words in it",
                      reason:
                        "there is nothing to read, so there are no rows and an average over none is not a number. The row has to come from outside the method, and the choices are a random draw, a copy of some default, or refusing the move; nothing here prefers one. Ten of 266 in the byte-level move of section 15.",
                    },
                    {
                      expression: "a piece that never ended a word",
                      reason:
                        "undefined, in the sense that the text it decodes to cannot express what the piece was. Reading that text gives a spelling that claims a word ended; the alternative would be an entry point that encodes a fragment known to sit inside a word, which is a different operation and one these vocabularies do not offer. 25 of the 125 new rows here.",
                    },
                    {
                      expression:
                        "a piece whose last letter never ends a word in the old corpus",
                      reason:
                        "unspellable, and the seeding reaches the label for the unspellable instead. That label summarises everything the old model failed to read, so averaging it in is not a small error but a row about a different subject. Two rows here are nothing else.",
                    },
                    {
                      expression: "two vocabularies that mark opposite ends",
                      reason:
                        "defined, and the copy rule fires almost never, so the whole vocabulary takes the lossy route. Four of 22 copied across conventions against 14 of 22 within one. Translating the conventions before comparing is possible and is a decision about what counts as the same piece, which nothing in the method settles.",
                    },
                    {
                      expression: "how to combine several old rows into one",
                      reason:
                        "an unweighted mean is the usual answer and it is a choice. Weighting by how often each piece occurs, or by its length, or taking the row of the longest piece alone, are all available and all defensible, and the method as stated does not say which. On a token read as four rows the difference is not small.",
                    },
                    {
                      expression: "the token for anything unspellable",
                      reason:
                        "matched by role rather than by spelling, since it is a label and not text. If the old vocabulary has none, which is the case for anything built over byte values, the new one’s label is read as its five characters of text like any other string.",
                    },
                    {
                      expression: "whether the move was worth making",
                      reason:
                        "not a question the method can be asked. There is no objective, so the mapping cannot be compared with a better mapping, and the counts describe the move without scoring it. Only running the model on the new corpus answers it.",
                    },
                    {
                      expression: "a shared spelling used differently",
                      reason:
                        "invisible. The copy rule compares strings, and two corpora can agree on a piece and disagree on every word containing it, as five pieces do in section 25. Nothing short of reading both corpora could tell, and the method reads neither.",
                    },
                    {
                      expression: "a vocabulary that cannot decode faithfully",
                      reason:
                        "outside what the third rule presumes. The whole route runs through text, so a vocabulary whose pieces cannot be turned back into text has no route at all, and one whose decoding is approximate hands the old vocabulary something that was never in either corpus.",
                    },
                  ]}
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
      ]}
    />
  );
}
