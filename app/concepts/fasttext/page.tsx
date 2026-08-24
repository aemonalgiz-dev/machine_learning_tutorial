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
import { FasttextBuckets } from "@/components/widgets/FasttextBuckets";
import { FasttextHeldOut } from "@/components/widgets/FasttextHeldOut";
import { FasttextNeighbours } from "@/components/widgets/FasttextNeighbours";
import { FasttextPieces } from "@/components/widgets/FasttextPieces";
import { FasttextPlayground } from "@/components/widgets/FasttextPlayground";
import { FasttextReduction } from "@/components/widgets/FasttextReduction";
import { FasttextSpelling } from "@/components/widgets/FasttextSpelling";
import { FasttextUnseenWord } from "@/components/widgets/FasttextUnseenWord";

export const metadata: Metadata = {
  title: "FastText · oop_ml",
  description:
    "The same training as word2vec, with each word also standing for the short pieces of its spelling, so that a word the corpus never held still has an answer.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FasttextPage() {
  return (
    <ConceptPage
      title="FastText"
      tagline="FastText changes one thing about word2vec, that a word also stands for the short pieces of its spelling, and what that buys is an answer for a word the training text never held."
      prerequisites={
        <>
          This page changes one part of{" "}
          <Link href="/concepts/word2vec" className={link}>
            word2vec
          </Link>{" "}
          and leaves the rest alone, so the window, the scoring and the passes
          are used here without being explained again. Words are compared by the{" "}
          <Link href="/concepts/distance-metrics" className={link}>
            cosine
          </Link>{" "}
          between their vectors throughout, which is an angle rather than a
          distance, and{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            what a vector for a word is for
          </Link>{" "}
          is assumed rather than argued.
        </>
      }
      history={
        <>
          <p>
            By 2015 word vectors were being trained on languages other than
            English, and a difficulty that hardly shows in English became hard to
            ignore. A Czech or a Finnish verb has dozens of written forms, a
            German noun compounds without limit, and Arabic writes much of its
            grammar inside the word rather than beside it, so a vocabulary read
            off a corpus of those languages is mostly forms that occurred a
            handful of times, with the forms of one word scattered across it as
            unrelated entries. Each form got its own row, learned from its own few
            occurrences, and nothing connected two forms of one verb except
            whatever the corpus happened to show about both.
          </p>
          <p>
            The obvious repair was to build a word out of its parts, and it had
            been tried. Andrei Alexandrescu and Katrin Kirchhoff described a word
            in 2006, in &ldquo;Factored neural language models&rdquo;, as a bundle
            of features rather than a single symbol. Minh-Thang Luong, Richard
            Socher and Christopher Manning built word vectors from morphemes in
            2013, in &ldquo;Better word representations with recursive neural
            networks for morphology&rdquo;, and Jan Botha and Phil Blunsom added
            morpheme vectors together in 2014 in &ldquo;Compositional morphology
            for word representations and language modelling&rdquo;. All of them
            needed something to say where a word&rsquo;s parts are, which is a
            morphological analyser, which has to be built per language and is
            wrong some of the time.
          </p>
          <p>
            Piotr Bojanowski, Edouard Grave, Armand Joulin and Tomas Mikolov, at
            Facebook AI Research in Paris, removed that requirement in
            &ldquo;Enriching word vectors with subword information&rdquo;, posted
            in 2016 and published in Transactions of the Association for
            Computational Linguistics in 2017. Their parts are every run of three
            to six characters inside the word, which needs no analyser and knows
            nothing about morphology, and a word&rsquo;s vector is the sum of its
            own row and the rows of its runs. They reported the largest gains on
            exactly the languages that had prompted the work, German, Czech,
            Russian and Arabic among them, and on rare words in all of them. The
            released program, which also carried the text classifier of Joulin,
            Grave, Bojanowski and Mikolov, gave the method the name it has now,
            and the pre-trained vectors published with it covered a great many
            languages read off Wikipedia. The one piece of machinery they took off
            a shelf was the hash that decides where a run of characters is kept,
            designed by Glenn Fowler, Landon Curt Noll and Phong Vo around 1991
            for purposes with nothing to do with language.
          </p>
          <p>
            This page asks five questions in order. What does a method that learns
            one position per word do when it meets a word it never saw? What
            exactly are a word&rsquo;s pieces, and where are they kept? Is an
            answer built from pieces alone any good, measured against a group the
            word belongs to and a group it does not? What do the pieces cost, in
            numbers held and in rows two unrelated pieces have to share? And where
            does the method stop being defined?
          </p>
        </>
      }
      playground={<FasttextPlayground />}
      sections={[
        {
          title: "Part 1. The Word With No Row",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Two lists of words, and the form left out of one">
                <p>
                  Everything on this page is fitted to one small corpus, and what
                  matters about it is not only what it holds but what it
                  deliberately does not. Two hundred sentences of five to eight
                  words each, every sentence drawn from one of two word lists and
                  never from both. One list holds twenty forms of five verbs,
                  play, stay, say, walk and talk, in their various endings; the
                  other holds eleven words about money, stock, bond, market, price
                  and so on. That comes to 1,311 word occurrences across 31
                  distinct words, and no word appears in both lists.
                </p>
                <p>
                  The verb list holds play, plays, player and played. It does not
                  hold playing. Every short run of letters that playing is made of
                  turns up somewhere in the corpus, in the four play forms and in
                  staying, saying, walking and talking, and the word itself turns
                  up in no sentence at all. That single absence is what the rest of
                  the page is about, because it is the smallest honest version of
                  the situation every model meets the moment it is asked about
                  text it was not trained on.
                </p>
                <KeepInMind>
                  The sentences are nonsense, which is deliberate. Words are drawn
                  at random from a list, so nothing is grammatical and nothing
                  means anything, and the only structure available to any method
                  is which words turn up beside which. The two numbers this page
                  keeps reporting, how alike two words of one list came out and
                  how alike a word of each came out, are therefore the whole
                  score.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Asking for a word the corpus never held">
                <p>
                  Word2vec learns by prediction. Slide a window along the corpus,
                  and at every position nudge the vectors so that a word&rsquo;s
                  vector predicts the words beside it, and words that keep the
                  same company end up in the same place. When the passes are over
                  there is a table with one row per word, 31 rows of twelve
                  numbers here, and that table is the answer. Everything in this
                  page keeps that arrangement; the one thing it changes is what a
                  row is looked up by.
                </p>
                <p>
                  Ask that table for playing and there is nothing to return. A row
                  was allocated for each word the corpus held, playing was not one
                  of them, and no amount of further training changes that, since
                  further training walks the same sentences. This is not a
                  shortcoming of any particular program. A method whose answer is
                  a table indexed by whole words has, by construction, no entry
                  for a word it never indexed.
                </p>
                <Equation>{"vector(w) = row(w),  which exists only for the words the corpus held"}</Equation>
                <KeepInMind>
                  The honest response is a refusal rather than a default vector,
                  because any default names a position in the space, and every
                  position in that space means something the corpus taught. A
                  vector of zeros is not a neutral answer either, as Part 6 comes
                  back to, since it has no direction at all and cannot be compared
                  to anything.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The missing word is not a special case">
                <p>
                  It would be comfortable to read playing as a contrivance, one
                  word held back so that the page has something to show. This
                  corpus cannot settle that either way, and it is worth saying so
                  before leaning on it. Its sentences draw words uniformly from a
                  fixed list, so its commonest word appears 73 times and its rarest
                  17, and not one of the 31 appears only once. A text made that way
                  has no tail of rare words for a missing word to come from.
                </p>
                <p>
                  So the case has to be made rather than found. Take a word the
                  corpus really does hold, walking, and drop every sentence
                  containing it, which is 30 of the 200 and removes all 34 of its
                  occurrences. Fit both ways on the 30 words that are left, then
                  ask both for walking.
                </p>
                <FasttextHeldOut />
                <p>
                  The method built from pieces places walking at a mean cosine of
                  0.9953 to the nineteen verb forms that survived and 0.0497 to the
                  eleven money words, with walked nearest, and it does that having
                  never seen the word. The method with one row per word has
                  nothing to return, exactly as it had nothing to return for
                  playing. Which word was held out made no difference to either
                  answer.
                </p>
                <KeepInMind>
                  Nothing here measures how often a missing word turns up in
                  ordinary text, and the claim is about the shape of the method
                  rather than a frequency. Any word the training text happened to
                  miss has no row, and which words a text misses is not something
                  the method gets to choose.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. A Word Made of Its Spelling",
          content: (
            <>
              <SubSection title="4. Wrapping the word and cutting it up">
                <p>
                  FastText adds one thing. A word still has a row of its own, and
                  the window, the scoring, the drawn wrong answers and the falling
                  step size are all unchanged. What is new is that a word also
                  stands for the short runs of characters its spelling is made of,
                  so that two words spelled alike are made of some of the same
                  parts.
                </p>
                <p>
                  Before it is cut, the word is wrapped, so play becomes
                  &lt;play&gt;. The wrapping is not decoration. Without it the
                  three letters her at the beginning of a word, in the middle of
                  one and at its end would all be the same piece; with it the piece
                  at the start of her is &lt;he and the piece at its end is er&gt;,
                  while the her sitting inside where is the same plain her that her
                  itself also contains. So a beginning and an ending are told apart
                  from the same letters somewhere in the middle, which is what
                  carries a grammatical ending.
                </p>
                <Equation>{"pieces(w) = every run of m to M characters inside <w>, except <w> itself"}</Equation>
                <FasttextPieces />
                <WorkedExample title="Where, cut three characters at a time">
                  <p>
                    The wrapped word &lt;where&gt; has seven characters, so at a
                    length of exactly three it gives five pieces, &lt;wh, whe, her,
                    ere and re&gt;, which is the example the original paper works.
                    At the published lengths of three to six the same word gives
                    fourteen, five of length three, four of four, three of five and
                    two of six. The shortest useful case is a word like at, whose
                    wrapped form has four characters and yields exactly &lt;at and
                    at&gt;, since the wrapped word itself is never one of its own
                    pieces. It does not need to be; the word already has a row.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A piece is a run of characters and not a morpheme. Nothing here
                  segments anything, and &lt;pl, pla and lay are not parts of a
                  word that any linguist would name. What the method relies on is
                  the weaker and much cheaper fact that related words tend to share
                  runs of letters. A piece occurring twice in one word counts once,
                  since the collection is a set, and the released program adds the
                  wrapped word itself as one extra piece for short words, so a
                  short word there reaches one row more than it does here.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Where the pieces are kept">
                <p>
                  There are far more pieces than there are words. The 31 words of
                  this corpus own 279 distinct pieces between them, 13.6129 per
                  word on average, five for the shortest and 22 for the longest,
                  and that ratio grows with the vocabulary rather than shrinking,
                  since a bigger vocabulary holds longer words and a longer word
                  has more pieces. Giving each piece an entry of its own would mean
                  a second vocabulary to build, hold and look up, which is most of
                  what a fixed width was meant to avoid.
                </p>
                <p>
                  So the pieces get no vocabulary at all. Each is put through a
                  hash, a function that turns a string of bytes into a number, and
                  the remainder of that number on division by however many rows
                  there are is the row it uses. The number of rows is chosen before
                  any text is read, two million in the published work and two
                  thousand here so that the consequences are visible.
                </p>
                <Equation>{"hash = 2166136261,  then for each byte b of the piece:  hash = (hash xor b) × 16777619,  modulo 2³²"}</Equation>
                <Equation>{"the row for a piece  =  hash(piece) modulo the number of rows"}</Equation>
                <WorkedExample title="Three pieces and where they went">
                  <p>
                    Of two thousand rows, &lt;pl lands in row 1127, ing in 1707,
                    and laying, which no word of this corpus contains, in 827. All
                    three are computed the same way and nothing distinguishes them
                    at the moment of hashing. The difference is only that the
                    corpus wrote to the first two many times and to the third
                    never, so the third is still every coordinate zero.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  There is no lookup and no list of pieces anywhere. Nothing checks
                  whether a piece was ever seen, so a piece nobody has ever written
                  is given a row just as readily as a common one. The consequence,
                  which the method accepts and Part 4 measures, is that two
                  different pieces can be sent to one row and are then added into
                  the same numbers.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. A word’s vector is its own row plus its pieces’ rows">
                <p>
                  With the pieces placed, a word&rsquo;s vector is a sum. Its own
                  row carries whatever is true of that word alone, and the rows of
                  its pieces carry whatever is true of every word that shares them.
                </p>
                <Equation>{"vector(w) = row(w) + Σ over the pieces g of <w> of row(g)"}</Equation>
                <p>
                  On this corpus play, plays, player and played all add the rows
                  for &lt;pl, pla, lay, &lt;pla, play and &lt;play, six pieces they
                  have in common, so anything the corpus teaches about any one of
                  them moves all four. Staying and saying share ten pieces with
                  playing, all of them from the ending; walking and talking share
                  three, ing, ing&gt; and ng&gt;. That sharing is the whole of what
                  the method adds, and it is worth noticing that it is decided
                  before any fitting, by the spellings alone.
                </p>
                <WhyThisWorks title="Why a sum, and why the choice is nearly invisible">
                  <p>
                    The paper composes by adding. The released program averages the
                    parts on the way forward while still adding the whole
                    correction to each of them on the way back, which scales the
                    gradient by however many parts a word has. Since a cosine
                    ignores a vector&rsquo;s length entirely, the choice between
                    the sum and the mean cannot change any comparison of two words
                    made by angle, which is every comparison on this page. What it
                    does change is how far a step moves things, which is the next
                    step&rsquo;s subject.
                  </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="7. One correction reaches every part at once">
                <p>
                  The composition is a sum, and the derivative of a sum with
                  respect to any one of its terms is the derivative with respect to
                  the whole. So when a training pair asks a word&rsquo;s vector to
                  move, the correction is added unchanged to the word&rsquo;s own
                  row and to every one of its pieces&rsquo; rows. That is what
                  differentiating gives rather than a convention chosen for
                  convenience.
                </p>
                <Equation>{"∂cost / ∂row(part) = ∂cost / ∂vector(w),  the same for every part"}</Equation>
                <p>
                  One consequence is arithmetical. A word here has 14.6129 parts on
                  average counting its own row, six for the shortest word and 23
                  for the longest, so its composed vector travels that many times
                  as far per correction as a plain one would for the same gradient.
                  The cost curve shows it. The first pass over the corpus costs
                  2.5560 per training pair where the same fit without pieces costs
                  3.7370, and by the second pass the two are 2.0716 and 2.6643.
                </p>
                <NumberTable
                  headings={["pass", "cost per pair, with the pieces", "without them"]}
                  rows={[
                    ["1", "2.5560", "3.7370"],
                    ["2", "2.0716", "2.6643"],
                    ["3", "2.0706", "2.3677"],
                    ["4", "2.0710", "2.1853"],
                    ["5", "2.0840", "2.1509"],
                  ]}
                  caption="Both fits use the same corpus, width, reach, passes, first step and seed, so the only difference between the columns is whether a word also stands for its pieces."
                />
                <KeepInMind>
                  A step size chosen for one row per word is a different step size
                  here, and the difference is not small. At the published first
                  step of 0.025 the fit that reads spellings separates the two
                  lists by 0.8723 where the plain fit manages 0.7033. Doubling that
                  step takes the plain fit to 0.8266 and this one only to 0.8814,
                  while its mean cosine within a list falls from 0.9954 to 0.9590,
                  so the verb forms have started coming apart from each other at a
                  step the plain method was still improving under.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Answering a Word Never Seen",
          content: (
            <>
              <SubSection title="8. The sum of the pieces, and nothing else">
                <p>
                  For a word the corpus held, the vector is the row plus the
                  pieces. For a word it did not hold, the first term is simply
                  absent, and what remains is a sum a caller can still compute,
                  because the pieces of any spelling can be worked out and hashed
                  whether or not anything has ever written to their rows.
                </p>
                <Equation>{"vector(w) = Σ over the pieces g of <w> of row(g)"}</Equation>
                <p>
                  Playing has 22 pieces at the published lengths. Sixteen of them
                  are owned by some word of the corpus, and those rows have been
                  written to thousands of times; six of them, layi, playi, layin,
                  &lt;playi, playin and laying, occur in no word of the corpus and
                  their rows never moved. Seventeen of the 22 rows it reaches had
                  been written to, one more than those sixteen pieces account for,
                  and the extra one is an accident worth remembering. The piece
                  playin, which no word of this corpus holds, was sent to row 1312,
                  and so was ayed&gt;, which played, stayed, walked and talked all
                  own.
                </p>
                <KeepInMind>
                  There is no unknown word here, only unseen ones, and the
                  difference matters. A method with a fallback entry gives every
                  unknown word the same vector, so two unknown words are perfectly
                  alike and neither is near anything in particular. Here two unseen
                  words get different answers, worked out from different pieces,
                  which is the point of the arrangement and also, as Part 5 shows,
                  where its new failure lives.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. How good that answer is">
                <p>
                  A mean on its own would not settle whether the answer is any
                  good, since two means can be far apart while the ranges behind
                  them overlap completely. So both worst cases are marked as well.
                </p>
                <FasttextUnseenWord />
                <p>
                  Playing comes back at a mean cosine of 0.9970 to the twenty verb
                  forms and 0.1003 to the eleven money words. The verb form it is
                  least alike is still 0.9939 and the money word it is most alike is
                  0.1106, so the two ranges are separated by 0.8833 and nothing
                  overlaps. Its four nearest words are play at 0.9993, plays at
                  0.9988, player at 0.9987 and played at 0.9985, which are the four
                  forms of its own verb and in a sensible order, from a fit that
                  never saw the word.
                </p>
                <InAModel title="What the answer is actually made of">
                  <p>
                    Eight words of the corpus share a piece with playing, and they
                    are the eight an English speaker would name. Saying and staying
                    share ten pieces each, all from the ending; play, played, player
                    and plays share six each, all from the beginning; talking and
                    walking share the three pieces of ing. None of the eleven money
                    words shares a single piece. So the answer is a sum over rows
                    that only verb forms ever wrote to, and its landing among the
                    verb forms is that arithmetic rather than any insight into
                    English.
                  </p>
                </InAModel>
              </SubSection>

              <SubSection title="10. How much of a word the corpus did hold is its spelling">
                <p>
                  The same sum can be taken for a word the corpus did hold, leaving
                  out its own row. What comes back is what that word&rsquo;s vector
                  would have been had it never been seen, and comparing the two
                  says how much of the word is carried by its spelling rather than
                  by its own occurrences.
                </p>
                <NumberTable
                  headings={[
                    "word",
                    "pieces",
                    "cosine to its whole vector",
                    "share of its length",
                  ]}
                  rows={[
                    ["played", "18", "0.9997", "0.9827"],
                    ["walking", "22", "0.9995", "0.9808"],
                    ["market", "18", "0.9999", "0.9532"],
                    ["bond", "9", "0.9998", "0.9043"],
                  ]}
                  caption="Each word’s vector with its own row dropped, compared to the vector with it kept."
                />
                <p>
                  On this corpus a word is almost entirely its spelling. Dropping
                  played&rsquo;s own row leaves a vector pointing 0.9997 of the way
                  in the same direction and 0.9827 as long, and bond, the shortest
                  of the four with nine pieces, is the one that loses most of its
                  length at 0.9043.
                </p>
                <KeepInMind>
                  That ratio is a fact about this corpus rather than about the
                  method. A word occurring 34 times has its own row corrected 34
                  times over, while the rows of its pieces are corrected by every
                  occurrence of every word that shares them, which here is
                  hundreds. On a corpus where a word is common and its spelling
                  unusual the balance would run the other way, and nothing in the
                  method fixes where it falls.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The nearest words under both methods">
                <p>
                  Both fits use the same corpus, the same width of twelve, the same
                  reach of three, the same five passes, the same first step and the
                  same seed, so the only difference between the two columns below
                  is whether a word also stands for its pieces.
                </p>
                <FasttextNeighbours />
                <p>
                  Asked for the five words nearest walked, the fit that reads
                  spellings names talked, walk, says, walking and walks; the fit
                  with one row per word names talking, walking, talk, stays and
                  said. Both lists are entirely verb forms, so neither is wrong
                  about the category, and they share one word of the five. What has
                  changed is that three of the five are now forms of walk itself
                  where before there was one, which is what sharing &lt;wa, wal and
                  alk does.
                </p>
                <KeepInMind>
                  Pulling the forms of one verb together is what the method is for,
                  and it is not free. Two words spelled alike are pushed together
                  whether or not the corpus said they belong together, so a
                  neighbour list read as evidence about meaning is now partly a
                  statement about spelling. Part 5 measures where that goes wrong.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What the Pieces Cost",
          content: (
            <>
              <SubSection title="12. No piece short enough to exist">
                <p>
                  Before counting what the pieces cost, it is worth knowing exactly
                  what they add, and there is a clean way to ask. Set the shortest
                  piece to fifty characters. The longest wrapped word in this corpus
                  is nine characters, so no word has a piece at all, every row kept
                  for the pieces stays where it started, and what is left ought to
                  be the plain method exactly.
                </p>
                <FasttextReduction />
                <p>
                  It is the plain method exactly. Under all four pairings of the two
                  training choices the fitted table, the scoring rows and every
                  pass&rsquo;s cost agree with a fit that never had the pieces, and
                  the largest disagreement anywhere is 0.0 rather than something
                  very small. Two passes cost 3.8942 and 2.7842 by both routes, the
                  same numbers to the last bit.
                </p>
                <WhyThisWorks title="Why the rows for the pieces start at zero">
                  <p>
                    Word rows start at a small random draw, which breaks the
                    symmetry between words that would otherwise all begin
                    identical. The rows for the pieces start at zero instead, for
                    two reasons. A random offset on a shared row carries nothing
                    about the corpus, and two pieces that only ever occur together
                    receive identical corrections forever, so they would differ for
                    good by nothing but where they happened to start. And starting
                    at zero, and taking nothing from the sequence of random numbers,
                    means a word&rsquo;s composed vector begins precisely where a
                    plain one begins and the two fits walk the same walk.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  A gap of exactly zero rules out a class of mistake that a gap of
                  four decimal places would not. Any difference in how the corpus
                  is walked, how far the window reaches at each position, which
                  words are drawn as wrong answers or how the step falls would show
                  up as a small disagreement rather than none at all, so zero says
                  the added machinery touches nothing but the composition.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. More pieces than words, and no vocabulary for them">
                <p>
                  A word of length L wrapped has L plus two characters, so at
                  lengths m to M it yields one run for every starting position at
                  every length that fits, which is a count that grows with the
                  word&rsquo;s length and with the width of the range.
                </p>
                <Equation>{"how many pieces =  Σ over k from m to min(M, L + 1) of (L + 3 − k)"}</Equation>
                <p>
                  Where that lands is a choice with nothing inside the fit to settle
                  it, and both ends of it cost something. Cut this corpus at exactly
                  three characters and there are 84 distinct pieces, five per word,
                  and the missing form comes back at 0.1427 to the money words
                  rather than 0.1003. Refuse to cut below four and there are 195
                  pieces and it comes back at 0.2302, because the short pieces are
                  the ones the ending shares.
                </p>
                <NumberTable
                  headings={[
                    "pieces of length",
                    "distinct pieces",
                    "per word",
                    "the missing form, to the verb forms",
                    "to the money words",
                  ]}
                  rows={[
                    ["3 only", "84", "5.0000", "0.9988", "0.1427"],
                    ["3 to 6", "279", "13.6129", "0.9970", "0.1003"],
                    ["4 to 6", "195", "8.6129", "0.9947", "0.2302"],
                  ]}
                  caption="Every row is a fit of the whole corpus at those lengths, with the same width, reach, passes, first step and seed."
                />
                <KeepInMind>
                  Nothing computed during a fit says which of those rows is best.
                  The lengths have to be set before the corpus is read and judged
                  from outside, and the published three to six is a value that
                  worked on the languages the authors had rather than a value
                  derived from anything.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Which pieces have to share a row">
                <p>
                  With 279 pieces to place and the number of rows fixed in advance,
                  some pieces land on top of each other, and the method makes no
                  attempt to prevent it. Two pieces sent to one row are simply added
                  into the same twelve numbers, and every word that owns either
                  piece then reads the sum.
                </p>
                <FasttextBuckets />
                <p>
                  At two thousand rows the 279 pieces occupy 260, so nineteen of
                  them are sharing. Row 1713 holds &lt;play, which the four play
                  forms own, together with alk, which walk, talk and their six other
                  forms own, so every one of those twelve words is reading a number
                  the other eleven helped write. Row 897 holds &lt;sto from stock and
                  lay&gt; from play. At twenty thousand rows only two pieces share
                  one, and at the published two million none of them do.
                </p>
                <KeepInMind>
                  Two pieces sharing a row is not an error state. Nothing detects
                  it, nothing reports it, and the fit proceeds exactly as if the two
                  pieces were one. The lines above were found from outside, by
                  hashing this corpus&rsquo;s pieces a second time and looking for
                  two that agree, which is possible only because the list of pieces
                  was already in hand.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. What a table too small costs">
                <p>
                  Making the table small enough shows the sharing doing damage. At
                  ten rows all 279 pieces are crushed into ten, and the two lists
                  come out 0.9359 alike within a list and 0.4942 alike across the
                  two, a separation of 0.4417 against the 0.8723 that two thousand
                  rows give. The missing form comes back at 0.5497 to the money
                  words, which is no longer an answer worth reading.
                </p>
                <p>
                  What the sweep does not show is a smooth curve, and it is worth
                  reporting rather than smoothing over. Fifty rows put the missing
                  form at 0.1133 to the money words and two hundred rows put it at
                  0.2285, which is worse at the larger table. Which particular
                  pieces happen to collide is a fact about the hash and this
                  vocabulary, not a quantity that improves steadily as the table
                  grows.
                </p>
                <NumberTable
                  headings={[
                    "rows",
                    "pieces sharing one",
                    "same list",
                    "across lists",
                    "the missing form, to the money words",
                  ]}
                  rows={[
                    ["10", "269", "0.9359", "0.4942", "0.5497"],
                    ["50", "229", "0.9911", "0.2210", "0.1133"],
                    ["200", "128", "0.9959", "0.1479", "0.2285"],
                    ["2,000", "19", "0.9954", "0.1231", "0.1003"],
                  ]}
                  caption="Four fits of the whole corpus, differing only in how many rows the pieces are hashed into."
                />
              </SubSection>

              <SubSection title="16. The bill">
                <p>
                  The answer a caller reads is the same size either way. Thirty one
                  words of twelve numbers is 372 numbers, and composing each word
                  from its parts before handing it over does not change that. What
                  grew is what has to be kept in order to answer at all, since the
                  rows for the pieces have to be there whether or not anything ever
                  wrote to them.
                </p>
                <NumberTable
                  headings={["what", "one row per word", "reading the spelling"]}
                  rows={[
                    ["numbers in the answer", "372", "372"],
                    ["numbers that have to be kept", "372", "24,372"],
                    ["rows for the pieces", "0", "2,000"],
                    ["rows for the pieces ever written to", "0", "260"],
                    ["rows a word’s correction is added to", "1", "14.6129 on average"],
                  ]}
                  caption="Measured on this corpus at a width of twelve, two thousand rows for the pieces and the published piece lengths."
                />
                <p>
                  That is just over sixty five times as many numbers held for an
                  answer of the same size, and 1,740 of the two thousand rows were
                  never written to at all, because how many rows there are is
                  settled before any text is read rather than discovered from it. On
                  a corpus this small that is the clearest place the method is worse
                  than the one it extends, and it is also the cost that scales best,
                  since two million rows is a fixed bill however large the
                  vocabulary becomes.
                </p>
                <KeepInMind>
                  The cost per correction grew too, from one row to 14.6129 on
                  average, and the answer is composed from its parts every time it
                  is read rather than looked up. Neither shows on this corpus as a
                  wait worth mentioning, and both are the kind of constant factor
                  that matters at the size the method was built for.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Where the Spelling Leads",
          content: (
            <>
              <SubSection title="17. Words the spelling places, correctly and otherwise">
                <p>
                  Playing is the flattering case, since its spelling and its meaning
                  agree about which list it belongs to. Seven more words no sentence
                  holds are worth putting through the same fit, chosen so that some
                  of them ought to land among the money words and some among the
                  verb forms.
                </p>
                <FasttextSpelling />
                <p>
                  Five of them land where a reader would put them. Banking comes
                  back at 0.9632 to the money words against 0.3718 to the verbs, and
                  its three nearest are trade, yield and debt; stocking, traded,
                  sharing and priced do the same, the last at 0.9870 with price,
                  yield and fund nearest. Walkway lands among the verbs at 0.9970,
                  nearest walk and walks, and that is the spelling working exactly
                  as designed while giving the wrong answer, since a walkway is a
                  thing rather than something anybody does. No sentence here ever
                  put walkway beside anything, so there was no evidence to weigh
                  against the letters it shares with walk, walks, walked and
                  walking.
                </p>
                <KeepInMind>
                  Stocking is the same shape of mistake wearing a better disguise. A
                  stocking has nothing to do with the stock market, and the fit puts
                  it at 0.9694 to the money words with stock nearest, because the
                  five letters agree. A word inherits the company of the words it is
                  spelled like, whether or not it means anything similar.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. A word placed by one shared row">
                <p>
                  The eighth word is the interesting one. Queue has fourteen pieces
                  and shares no letters worth mentioning with anything in this
                  corpus, so thirteen of its rows were never written to and
                  contribute nothing. The fourteenth is queue&gt;, which the hash
                  sent to row 98, and so is arket, which market owns.
                </p>
                <p>
                  So the whole of queue&rsquo;s vector is one row that market and
                  nothing else wrote, and it comes back at 0.9919 to the eleven
                  money words with market, stock and cash nearest. That sits within
                  0.0051 of playing&rsquo;s reading of its own list, and it was
                  produced by an arithmetic accident with no connection to
                  spelling, meaning or usage. Nothing distinguishes the two answers
                  at the point a reader sees them.
                </p>
                <KeepInMind>
                  There is one visible sign and the usual comparison throws it away.
                  Queue&rsquo;s vector is 0.1893 long where playing&rsquo;s is
                  3.7789, because one written row went into the first sum and
                  seventeen into the second. A cosine divides both lengths out
                  before it compares anything, so a reader looking at 0.9919 and
                  0.9970 side by side sees no trace of that difference.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where FastText Stops Being Defined",
          content: (
            <>
              <SubSection title="19. A word reaching no written row has no direction">
                <p>
                  Zap has five pieces at the published lengths, and the hash sent
                  every one of them to a row that no word of this corpus reaches. So
                  every term of the sum is a row that never moved, and the vector is
                  every coordinate exactly zero.
                </p>
                <Equation>{"cos(a, b) = (a · b) / (|a| |b|),  which is 0 / 0 when |a| = 0"}</Equation>
                <p>
                  A cosine is a ratio whose denominator is the product of the two
                  lengths, so against a zero vector it is zero divided by zero. It
                  is not a small similarity and not a large distance; the quantity
                  does not exist, because the zero vector has no direction for an
                  angle to be measured from. That is a fact about the arithmetic
                  rather than about any program, and every implementation faces the
                  same choice. Refusing says so. Returning zero would report that
                  the word is unrelated to everything, which is a claim the method
                  never made. Returning some default direction would place the word
                  somewhere the corpus never implied, which is the thing having
                  pieces was supposed to avoid.
                </p>
                <KeepInMind>
                  This is the honest edge of the promise. A method built from pieces
                  has no unknown words, only unseen ones, and that holds exactly as
                  long as some piece of the word reaches a row something wrote to.
                  Below that line it has nothing, and the line moves with the
                  corpus, the piece lengths and the number of rows rather than
                  sitting anywhere a reader can point to in advance.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. A shared row cannot be found from the answer">
                <p>
                  When two pieces land in one row, their corrections are added into
                  the same numbers, and addition of that kind has no inverse. The
                  fitted table holds a sum and no record of what went into it, so
                  from the answer alone there is no procedure that recovers which
                  pieces wrote a row, or how many did.
                </p>
                <p>
                  The collisions this page names were found from outside, by taking
                  the corpus&rsquo;s own list of pieces and hashing it a second time
                  looking for two that agree, which works only because that list was
                  already in hand. It does not extend to the case that matters. The
                  piece queue&gt; belongs to no word of the corpus, so no list of
                  the corpus&rsquo;s pieces contains it, and the only way to find
                  that particular accident is to already suspect the word queue and
                  go looking. The set of spellings that might one day be asked for
                  is not a set anybody can enumerate.
                </p>
                <KeepInMind>
                  There is no repair inside the method either. A different hash, or
                  more rows, is a different table, and a different table has to be
                  trained again from the beginning; nothing can be moved from the
                  old one, since a row of the old table is a sum whose terms are no
                  longer separable. The number of rows is therefore a decision taken
                  before training with no way back.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Whether the spelling helps is a fact about the language">
                <p>
                  Everything the method adds is carried by one quantity, how much
                  two related words&rsquo; pieces overlap. On this corpus that
                  quantity is generous, and it is why the method works here at all.
                  Playing shares ten pieces with saying and six with played, and
                  none at all with any of the eleven money words, so the sum over its
                  pieces could hardly land anywhere else.
                </p>
                <p>
                  That overlap is not a property of the method. It is a property of
                  how a language writes its grammar, and it is fixed before any
                  fitting begins. Where related forms are built by adding letters to
                  a stem, as they are for walk and walking, the overlap is large and
                  the method is buying something real. Where a related form is
                  written differently, as go and went are, the two share no run of
                  letters at all and the pieces have nothing to carry. And where two
                  unrelated words happen to look alike, the pieces carry a
                  connection that is not there, which stocking and stock show in
                  miniature.
                </p>
                <KeepInMind>
                  Nothing on this page measures a second language, and the claim
                  here is narrower than a comparison would be. The quantity the
                  method depends on is one the writing system fixes in advance, so
                  reporting that FastText helped on one corpus says something about
                  that corpus rather than about the method, and the original
                  paper&rsquo;s own results say the same thing in the other
                  direction, since its gains were largest exactly where a word
                  carries most of its grammar in its endings.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Where the method stops being defined">
                <p>
                  Several inputs leave the method with nothing to compute rather
                  than something approximate to compute, and a few more leave it with
                  a genuine choice whose cost is worth knowing. The table gathers
                  both, with what the mathematics says in each case.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a word none of whose pieces\nreaches a written row",
                      reason:
                        "the sum is over rows that never moved, so the vector is every coordinate zero and a cosine against it is zero over zero. Undefined rather than distant. Measured here on a three-letter word whose five rows nothing had reached, giving a vector of length exactly 0.",
                    },
                    {
                      expression: "a word shorter than the\nshortest piece",
                      reason:
                        "wrapped, it holds no run of the required length, so it has no pieces at all. Its answer is its own row alone if the corpus held it, and nothing whatever if it did not. Where the shortest length is put therefore decides which words the method can answer for, and no quantity inside a fit says where to put it.",
                    },
                    {
                      expression: "the shortest and longest\npiece lengths",
                      reason:
                        "a real choice with no principle behind it. Too long and few words share anything; too short and every word shares with every other. Measured, cutting at three only puts the missing form at 0.1427 to the wrong list and refusing to cut below four puts it at 0.2302, against 0.1003 at the published three to six.",
                    },
                    {
                      expression: "two pieces sent to one row",
                      reason:
                        "defined and undetectable. Their corrections are added together and the table holds only the sum, so nothing in the answer says a row was shared or by what. The rows named on this page were found by hashing a list of pieces that was already in hand, which is not available for a spelling nobody has asked for yet.",
                    },
                    {
                      expression: "how many rows the pieces\nshare",
                      reason:
                        "a choice made before any text is read, and one with no way back, since a different number of rows is a different table that has to be trained from the start. Measured, ten rows here cost the separation of the two lists, 0.4417 against 0.8723, and the damage in between is not monotone, since fifty rows put the missing form at 0.1133 to the wrong list and two hundred at 0.2285.",
                    },
                    {
                      expression: "a word spelled like an\nunrelated word",
                      reason:
                        "defined, and confidently wrong. The method has no term that could separate resemblance from relatedness, so a word inherits the company of the words it looks like. Measured here at 0.9694 between an unseen word and a list it has nothing to do with, reached through five shared letters.",
                    },
                    {
                      expression: "the length of a word’s vector,\nread as confidence",
                      reason:
                        "it does carry how many written rows went into the sum, 3.7789 for a word with seventeen against 0.1893 for a word with one, but a cosine divides both lengths out, so the ordinary comparison cannot see it. And nothing in the method says what length is enough, since the scale depends on the corpus, the passes and the step size.",
                    },
                    {
                      expression: "the individual coordinates\nof a vector",
                      reason:
                        "undefined as quantities, exactly as they are for the method this one extends. Rotating every row, piece row and scoring row by one rotation leaves every score and so the whole objective unchanged, so the coordinates are one arbitrary choice among infinitely many. Only rotation-invariant readings, cosines and distances, carry anything.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of those lines carry most of the weight in practice. A word
                  reaching no written row has no answer at all rather than a poor
                  one, which is the limit of the promise that there are no unknown
                  words; and a shared row cannot be found from the answer, so a
                  reading produced by a collision, like the 0.9919 above, arrives
                  looking exactly like a reading produced by a shared spelling.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
