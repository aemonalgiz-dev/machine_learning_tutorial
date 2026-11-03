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
import { FasttextBuckets } from "@/components/widgets/FasttextBuckets";
import { FasttextHeldOut } from "@/components/widgets/FasttextHeldOut";
import { FasttextNeighbours } from "@/components/widgets/FasttextNeighbours";
import { FasttextPieces } from "@/components/widgets/FasttextPieces";
import { FasttextPlayground } from "@/components/widgets/FasttextPlayground";
import { FasttextReduction } from "@/components/widgets/FasttextReduction";
import { FasttextSpelling } from "@/components/widgets/FasttextSpelling";
import { FasttextUnseenWord } from "@/components/widgets/FasttextUnseenWord";

export const metadata: Metadata = {
  title: "FastText · Perceptron Lab",
  description:
    "FastText represents words using character fragments as well as whole-word information. Shared fragments allow related spellings to contribute to each other's representations, including words with few observed occurrences.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FasttextPage() {
  return (
    <ConceptPage
      lessonId="fasttext"
      intuition={lessonIntuitions["fasttext"]}
      technicalStart="Part 2. A Word Made of Its Spelling"
      openingTitle="An Unfamiliar Word May Have Familiar Parts"
      playgroundTitle="What can word parts tell us about an unseen word?"
      playgroundIntro="Compare a familiar word's whole-word contribution with its substring contributions. Try an unseen spelling and inspect which learned pieces support its vector."
      title="FastText"
      tagline={"FastText represents words using character fragments as well as whole-word information. Shared fragments allow related spellings to contribute to each other's representations, including words with few observed occurrences."}
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
          {" similarity, which measures directional alignment rather than vector magnitude. The "}{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            what a vector for a word is for
          </Link>{" "}
          is assumed rather than argued.
        </>
      }

      playground={<FasttextPlayground />}
      sections={[
        {
          title: "Part 1. The Word With No Row",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Two lists of words, and the form left out of one">
                <>
<p>
                  We will use two hundred generated sentences, each five to eight words long. Each draws from either a list of twenty forms of play, stay, say, walk and talk, or a list of eleven finance words such as stock, bond, market and price. The lists never mix within a sentence. This keeps the context pattern controlled while we investigate what spelling contributes.
                </p>
                <p>
                  That comes to 1,311 word occurrences across 31 distinct words, and no word appears in both lists.
                </p>
</>
                <p>
                  There is a deliberate omission: the corpus contains play, plays, player and played, but never playing. Its shorter character pieces occur in those forms and in staying, saying, walking and talking. Can the model build a useful representation for the unseen word from pieces it has learned elsewhere? That is the question we will test.
                </p>
                <KeepInMind>
                  {"The sentences are generated from the two lists rather than written as grammatical prose. That creates a controlled topic pattern and deliberately omits natural syntax. We will inspect both topic separation and the effects of spelling; two mean scores do not capture every useful property."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Asking for a word the corpus never held">
                <p>The word-level comparison keeps one learned vector per vocabulary entry. Training adjusts those vectors using nearby-word prediction tasks. Here the table has 31 rows of twelve numbers. FastText retains that prediction setting while changing how an input word&apos;s representation is assembled.</p>
                <p>A lookup table indexed only by known whole words has no learned row for playing when that word is absent from its vocabulary. Repeating the same training text cannot supply a missing entry. A subword representation offers another route by reusing learned pieces of its spelling.</p>
                <Equation>{"vector(w) = row(w),  which exists only for the words the corpus held"}</Equation>
                <KeepInMind>
                  {"A whole-word lookup needs a policy for an entry absent from its vocabulary. It can reject it or return a documented fallback. A zero fallback has no cosine direction, while a shared unknown-word row cannot distinguish unseen spellings."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The missing word is not a special case">
                <p>
                  Holding out playing gives us a controlled test, but this corpus cannot show how often the problem occurs in ordinary text. Its words are sampled uniformly from a fixed list: the most frequent appears 73 times, the least frequent 17 times, and none of the 31 appears only once. We deliberately omitted a word; we did not reproduce a natural distribution with a long tail of rare forms.
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
                  {"In this walking holdout, the subword model places it closer to the surviving verb forms than to the money words, with walked nearest. The whole-word model still has no entry. Two successful held-out examples do not establish that every missing spelling will receive the same quality of answer."}
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
</>),
        },
        {
          title: "Part 2. A Word Made of Its Spelling",
          content: (
            <>
              <SubSection title="4. Wrapping the word and cutting it up">
                <p>
                  {"FastText combines a whole-word vector with character n-gram vectors. An n-gram is an overlapping run of n characters. Related spellings can share learned rows, including when a complete word was rare or unseen. Bojanowski and colleagues described this extension in a 2016 preprint and the 2017 paper Enriching Word Vectors with Subword Information, addressing the limited evidence available for many individual word forms."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://aclanthology.org/Q17-1010/">{"Bojanowski et al.: Enriching Word Vectors with Subword Information (2017)"}</Link></p>
                <>
<p>
                  Before it is cut, the word is wrapped, so play becomes &lt;play&gt;. The wrapping is not decoration. Without it the three letters her at the beginning of a word, in the middle of one and at its end would all be the same piece; with it the piece at the start of her is &lt;he and the piece at its end is er&gt;, while the her sitting inside where is the same plain her that her itself also contains.
                </p>
                <p>
                  So a beginning and an ending are told apart from the same letters somewhere in the middle, which is what carries a grammatical ending.
                </p>
</>
                <Equation>{"pieces(w) = every run of m to M characters inside <w>, except <w> itself"}</Equation>
                <FasttextPieces />
                <WorkedExample title="Where, cut three characters at a time">
                  <>
<p>
                    The wrapped word &lt;where&gt; has seven characters, so at a length of exactly three it gives five pieces, &lt;wh, whe, her, ere and re&gt;, which is the example the original paper works. At the published lengths of three to six the same word gives fourteen, five of length three, four of four, three of five and two of six.
                  </p>
                  <p>
                  {"With the three-to-six range, the wrapped form <at> supplies <at and at> in this SDK, excluding the complete wrapped word. Some shorter spellings provide no eligible fragment. A known word still has its own row; an unseen word then depends entirely on whatever fragment rows can be used."}
                </p>
</>
                </WorkedExample>
                <KeepInMind>
                  {"These are overlapping character fragments, not a linguistic segmentation into meaningful word parts. This SDK uses distinct fragment strings and excludes the full wrapped spelling. The released implementation’s fragment handling differs, including whether repeated n-gram occurrences contribute more than once, so exact vectors need not agree."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Where the pieces are kept">
                <p>
                  {"The 31 vocabulary words produce 279 distinct fragments, averaging 13.6129 per word in this example. A separate fragment dictionary is possible, but this implementation instead allocates a fixed set of hash buckets. Vocabulary growth does not necessarily increase fragments per word: that depends on the spellings and length range."}
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
                  {"The hash computes a bucket without consulting a fragment-to-ID vocabulary. Different fragments can share that bucket and therefore share its learned row. The SDK can still enumerate a supplied word’s fragments when inspecting how its vector was assembled."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. A word’s vector is its own row plus its pieces’ rows">
                <p>
                  {"Compose the word from its whole-word row and the rows selected by its fragments. The whole-word row can capture occurrence-specific evidence for that spelling; shared rows receive updates from all the words that use them, including hash collisions. None is a direct statement of what is true about the word."}
                </p>
                <Equation>{"vector(w) = row(w) + Σ over the pieces g of <w> of row(g)"}</Equation>
                <p>
                  Play, plays, player and played share the pieces &lt;pl, pla, lay, &lt;pla, play and &lt;play. Updating one of those shared rows therefore changes several word representations. Playing also shares ten ending pieces with staying and saying, and three with walking and talking: ing, ing&gt; and ng&gt;. Spelling determines these shared rows before training; the corpus determines how their values change.
                </p>
                <WhyThisWorks title="Why a sum, and why the choice is nearly invisible">
                  <p>
                  {"For fixed stored component rows, summing or averaging multiplies a word’s composed vector by a positive scalar, so cosine comparisons are unchanged. Using the two rules during training is different: forward scores and gradients can change, producing different fitted component rows. This SDK uses a sum and its corresponding derivative."}
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
                  {"With distinct component rows, applying the same gradient to each moves their composed sum by the number of components times the individual step. Hash collisions within a word can add multiplicities, changing that factor. The loss comparison below also includes differences in the resulting representation and trajectory; it does not isolate update amplification as the sole cause."}
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
                <>
<p>
                  Playing has 22 pieces at the published lengths. Sixteen of them are owned by some word of the corpus, and those rows have been written to thousands of times; six of them, layi, playi, layin, &lt;playi, playin and laying, occur in no word of the corpus and their rows never moved. Seventeen of the 22 rows it reaches had been written to, one more than those sixteen pieces account for, and the extra one is an accident worth remembering.
                </p>
                <p>
                  {"The unseen fragment playin hashes to row 1312. The fragment ayed>, present in played and stayed, hashes there too. Walked and talked do not contain ayed>; their spelled endings differ."}
                </p>
</>
                <KeepInMind>
                  {"An unseen spelling can receive a vector from its component buckets, rather than sharing one unknown-word fallback. The result may be distinct, but collisions or identical fragment sets can also give different spellings the same vector. Check its supporting fragments rather than assume that every unseen word has a useful unique representation."}
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
                  {"Playing is closer to every tested verb form than to any tested money word under this fit. Its nearest entries are play, plays, player and played. That agrees with the held-out construction; the precise ordering among those forms needs a task criterion before calling it sensible."}
                </p>
                <InAModel title="What the answer is actually made of">
                  <p>
                  {"Playing shares literal fragments with the listed verb forms and none with the money words. Those shared fragments explain much of its learned support. Hash collisions can also bring updates from words with no matching literal fragment, so inspect bucket usage as well as string overlap."}
                </p>
                </InAModel>
              </SubSection>

              <SubSection title="10. How much of a word the corpus did hold is its spelling">
                <p>
                  {"Drop the whole-word row from a known word after training and compare the remaining fragment sum with its full vector. This measures a component contribution in the trained model. It is not the counterfactual vector from a fit that never observed the word, since its occurrences also trained the shared buckets and output rows."}
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
                  {"For these words, the fragment-only sum has nearly the same direction and length as the full vector. For played, the cosine is 0.9997 and the length ratio is 0.9827. Cosine is not a fraction of the way in a direction, and this ablation does not separate spelling knowledge from the contexts that trained those fragments."}
                </p>
                <KeepInMind>
                  {"The balance depends on the gradients and how often component rows are used. Whole-word rows and shared fragment rows both receive context-based updates. Count alone does not fix their norms or guarantee which contribution dominates."}
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
                  {"The two nearest-word lists contain only verb forms but differ in their fine ordering. In the subword list, walk and walking are forms of the query verb; talked and says belong to other verbs. The shared fragments add a spelling-based influence that the whole-word model does not have."}
                </p>
                <KeepInMind>
                  {"Shared rows tie part of the representation to spelling. Context-trained whole-word rows and other fragments can still distinguish words with similar spelling. The mechanism creates a tendency, not a requirement that every similar spelling be close regardless of context."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "With all 30 sentences that contain walking dropped, the method built from pieces still placed walking among the verb forms.",
              true,
              "It placed walking at a mean cosine of 0.9953 to the nineteen surviving verb forms and 0.0497 to the eleven money words, with walked nearest, having never seen the word at all. The method with one row per word had nothing to return, exactly as it had nothing for playing, because a table indexed by whole words has no entry for a word it never indexed.",
            ),
            choice(
              "Why is a word wrapped before it is cut into pieces, so that play becomes <play>?",
              [
                "So the same letters at the start of a word, inside one and at its end are three different pieces",
                "So the wrapped word is always one of its own pieces",
                "So the hash cannot send two pieces to the same row",
                "So a word shorter than the minimum piece length still yields pieces",
              ],
              0,
              "The boundary markers tell a piece at the start or end of a word apart from the same letters inside another word. For her, <he marks the beginning and er> marks the end; her inside where has neither marker. This provides information about spelling position, which may help represent prefixes and suffixes. The implementation excludes the complete wrapped word from its character pieces because a known word already has its own word row.",
            ),
            choice(
              "Playing is in no sentence, yet it comes back at 0.9970 to the verb forms and 0.1003 to the money words. Why does it land there?",
              [
                "Its vector combines bucket rows trained through character pieces shared with familiar verb forms, while hash collisions can add other words’ updates",
                "The fit recognized ing as a verb ending and placed the word by its grammar",
                "An unseen word is given the average of the verb forms’ vectors as a fallback",
                "Its own row was filled in from the rows of play, plays, player and played",
              ],
              0,
              "Playing shares character pieces with familiar verb forms, including pieces from play and ing. Their trained bucket rows contribute to its vector even though playing has no word row of its own. The resulting cosines are 0.9970 to the verb group and 0.1003 to the money group. This is a useful result on the supplied corpus, but spelling overlap is evidence about usage only when the training data supports that relationship.",
            ),
            trueFalse(
              "A piece is given a row only once some word of the corpus has been found to contain it.",
              false,
              "The piece table has a fixed number of bucket rows before fitting. Hashing a piece selects one of those rows whether or not the piece has appeared in training. No vocabulary of observed piece spellings is needed for that lookup. In this example laying maps to row 827, which remains zero because no training piece updated it.",
            ),
            several(
              "Which statements follow from the update rule or agree with this first-pass comparison?",
              [
                "The correction from a training pair is added unchanged to every part’s row",
                "A word’s composed vector travels further per correction than a plain one would",
                "A step size chosen for one row per word is still the right step size here",
                "The first pass has lower mean loss per training pair than the same fit without pieces"
              ],
              [0, 1, 3],
              "The derivative passes the same correction to every contributing row. With distinct rows, their combined vector therefore moves by more than a single-row vector would; repeated hash buckets need their multiplicities counted too. The table also reports a lower first-pass mean loss with parts. That result is an observation of this setup, not a guarantee that the same learning rate is suitable for another model or corpus.",
              {
                "description": "A word vector is its word row plus its character-part rows, without dividing by the number of rows. Every contributing row receives the derivative of this sum. In the measured corpus a word uses 14.6129 rows on average. The same step size is used in both runs.\n\npass | cost per pair, with the pieces | without them\n1 | 2.5560 | 3.7370\n2 | 2.0716 | 2.6643\n3 | 2.0706 | 2.3677\n4 | 2.0710 | 2.1853\n5 | 2.0840 | 2.1509"
              },
            ),
        ],
        },
        {
          title: "Part 4. What the Pieces Cost",
          content: (
            <>
              <SubSection title="12. No piece short enough to exist">
                <p>
                  We can check the contribution of character pieces by disabling them. Set the minimum piece length to fifty characters. The longest wrapped word here has nine, so no pieces qualify and their rows receive no updates. The remaining calculation should agree with the plain word-level method.
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
                  <>
<p>
                  {"This SDK initializes word rows randomly and bucket rows at zero. The zero bucket initialization helps the no-fragments case reproduce the plain model without consuming extra random draws. It is an implementation choice; other initializations are possible. Two components used together can receive matching updates, but collisions and other words may change their histories."}
                </p>
                  <p>
                    And starting at zero, and taking nothing from the sequence of random numbers, means a word&rsquo;s composed vector begins precisely where a plain one begins and the two fits walk the same walk.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"The no-fragments equality check verifies that this test follows the same calculation as the plain model. It is useful regression evidence, but a finite equality result does not rule out every possible implementation mistake on other inputs."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. More pieces than words, and no vocabulary for them">
                <p>
                  {"Count the candidate substring spans at each length after wrapping the word. Exclude the complete wrapped word for this SDK. The formula below counts positions; if the same fragment string occurs more than once, the distinct-string set can contain fewer entries."}
                </p>
                <Equation>{"how many pieces =  Σ over k from m to min(M, L + 1) of (L + 3 − k)"}</Equation>
                <WorkedExample title="The count, checked on three words">
                  <>
                    <p>
                      Where has five letters, so L is 5, and at the published
                      lengths the sum runs over k from three to six. A wrapped
                      word of L plus two characters holds L plus three minus k
                      runs of k characters, one for each place a run of that
                      length can start. The sum stops at L plus one rather than
                      L plus two, because the single run of L plus two
                      characters is the wrapped word itself, which is never one
                      of its own pieces.
                    </p>
                    <Equation>{"where, L = 5:     (5 + 3 − 3) + (5 + 3 − 4) + (5 + 3 − 5) + (5 + 3 − 6) = 5 + 4 + 3 + 2 = 14\nplaying, L = 7:   7 + 6 + 5 + 4 = 22\nat, L = 2:        (2 + 3 − 3) = 2"}</Equation>
                    <p>
                      Those are the fourteen pieces Part 2 counted for where,
                      the 22 that playing is made of, and the two that at
                      yields. For at the sum has one term, since a piece of
                      four characters would be the whole of the wrapped word.
                      Every extra letter adds one piece at each length in the
                      range, which is why a longer word has more pieces and why
                      widening the range from three only to three to six takes
                      this corpus from 5.0000 pieces per word to 13.6129.
                    </p>
                  </>
                </WorkedExample>
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
                  {"Choose the fragment-length range for the language and task, then evaluate it. The paper’s three-to-six range is a useful reference setting, rather than a universal optimum. Training diagnostics and held-out tests can help compare alternatives."}
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
                  {"At 2,000 buckets, 279 fragments occupy 260 rows: 19 more fragments than occupied rows. That is a count of excess assignments, not necessarily the number of distinct fragments participating in collisions. The named collisions show which words share particular rows."}
                </p>
                <KeepInMind>
                  {"A collision is accepted by the hash-based model. It can be detected for a known set of fragments by comparing their bucket IDs, and that inspection can be instrumented during training. The vector values alone do not identify every contributor."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. What a table too small costs">
                <p>
                  {"With ten buckets, the two topic groups have less separation under the reported measure, and the held-out spelling is more similar to finance words. This is a degraded result for the intended test, rather than proof that the vector is useless for every possible query."}
                </p>
                <p>
                  The sweep is uneven. With fifty rows, the missing form&apos;s similarity to the finance words is 0.1133; with two hundred rows it is 0.2285, worse for this comparison. A larger table changes which pieces collide under this hash. It need not improve this particular result at every size.
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
                  {"The bucket rows add a substantial fixed allocation in this small example, including 1,740 unused rows. The bucket allocation stays fixed when vocabulary grows, but whole-word and output tables still grow with it. Alternative storage or export formats may retain fewer arrays depending on the queries they support."}
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
                <>
<p>The held-out examples show both the value and the limit of shared spelling. Banking has a cosine of 0.9632 to the finance group and 0.3718 to the verbs, with trade, yield and debt nearest. Stocking, traded, sharing and priced also join the finance group; priced reaches 0.9870, nearest price, yield and fund. Walkway instead joins the verb group at 0.9970, nearest walk and walks. Its shared fragments explain that result without establishing that its grammatical role or meaning matches those verbs.</p>
                <p>
                  No sentence here ever put walkway beside anything, so there was no evidence to weigh against the letters it shares with walk, walks, walked and walking.
                </p>
</>
                <KeepInMind>
                  {"In the clothing sense, stocking is unrelated to the stock market, yet this fit places it near the finance words. The same spelling can also refer to supplying goods. An unseen word’s intended sense is not specified by its letters alone, so choose evaluation prompts that make that distinction clear."}
                </KeepInMind>
              </SubSection>

              <SubSection title="18. A word placed by one shared row">
                <p>
                  {"Queue has fourteen eligible fragments here. None matches a trained fragment string, but queue> hashes to the same bucket as arket from market. The other thirteen selected rows remain zero in this fit."}
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
          title: "Part 6. What Shared Spelling Can and Cannot Tell Us", id: "part-6-where-fasttext-stops-being-defined",
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
                <>
<p>
                  A cosine is a ratio whose denominator is the product of the two lengths, so against a zero vector it is zero divided by zero. It is not a small similarity and not a large distance; the quantity does not exist, because the zero vector has no direction for an angle to be measured from.
                </p>
                <p>
                  {"Cosine needs a nonzero vector. This SDK rejects the comparison when the fragment sum is zero. Another system could return a labeled fallback, but that would be an interface policy rather than a cosine measured from this vector."}
                </p>
</>
                <KeepInMind>
                  {"Reaching trained buckets does not guarantee a nonzero or useful result: their vectors can cancel or contain irrelevant collision evidence. An unseen-word interface should report those limits and, where possible, the amount and kind of supporting evidence."}
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
                <>
<p>
                  {"For a query such as queue, enumerate its fragments and inspect their buckets against retained training provenance. This identifies known collisions affecting that query. Discovering every possible future collision is a different and much larger problem."}
                </p>
                <p>
                  {"There are infinitely many possible spellings without a length bound. A finite query set can still be checked directly."}
                </p>
</>
                <KeepInMind>
                  {"Changing the hash or bucket count changes the parameter-sharing scheme. The existing sums generally do not reveal how to split collided contributions exactly. A system can still migrate an approximation, retain provenance, or retrain and evaluate the new representation; starting from nothing is not mathematically required in every case."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Whether the spelling helps is a fact about the language">
                <p>
                  {"The character representation helps when useful forms share fragments, as playing does with trained play and-ing forms. The learned context values and hash collisions matter too. String overlap alone does not determine where a vector must land."}
                </p>
                <>
<p>
                  That overlap is not a property of the method. It is a property of how a language writes its grammar, and it is fixed before any fitting begins. Where related forms are built by adding letters to a stem, as they are for walk and walking, the overlap is large and the method is buying something real.
                </p>
                <p>
                  Where a related form is written differently, as go and went are, the two share no run of letters at all and the pieces have nothing to carry. And where two unrelated words happen to look alike, the pieces carry a connection that is not there, which stocking and stock show in miniature.
                </p>
</>
                <KeepInMind>
                  {"These examples use English and do not measure another language. To compare languages, evaluate their data, tokenization and morphology directly. Results on one corpus give evidence about the method under those conditions, rather than saying nothing about the method itself."}
                </KeepInMind>
              </SubSection>

              <SubSection title="22. When Shared Spelling Does Not Supply Useful Context" id="22-where-the-method-stops-being-defined">
                <p>Character parts can provide a representation for an unseen word, but they do not guarantee useful context evidence or a nonzero direction. Check what actually contributed to the vector.</p>
                <DerivationTable
                  expressionHeading="Word or character-part evidence"
                  reasonHeading="What can contribute to its vector"
                  rows={[{"expression":"a word none of whose pieces\nreaches a written row","reason":"the sum is over rows that never moved, so the vector is every coordinate zero and a cosine against it is zero over zero. Undefined rather than distant. Measured here on a three-letter word whose five rows nothing had reached, giving a vector of length exactly 0."},{"expression":"a word shorter than the\nshortest piece","reason":"wrapped, it holds no run of the required length, so it has no pieces at all. Its answer is its own row alone if the corpus held it, and nothing whatever if it did not. Where the shortest length is put therefore decides which words the method can answer for, and no quantity inside a fit says where to put it."},{"expression":"the shortest and longest\npiece lengths","reason":"Lengths control which spellings share fragments and how many updates are combined. Compare candidate ranges on development tasks; the shown English setting is not a universal optimum."},{"expression":"two pieces sent to one row","reason":"The shared row combines updates. Its values alone do not identify all contributing fragments, but retained fragment-to-bucket provenance can reveal collisions for known training strings and queries."},{"expression":"how many rows the pieces\nshare","reason":"Bucket count changes collisions and storage. Moving to another count may require retraining or an evaluated migration because collided contributions cannot generally be separated exactly."},{"expression":"a word spelled like an\nunrelated word","reason":"Shared fragments can encourage similarity, while whole-word rows and other context-trained components can counter it. The unseen stocking example depends on which sense is intended."},{"expression":"the length of a word’s vector,\nread as confidence","reason":"Vector length depends on both the contributing rows and their alignment, not only their count. It is not a calibrated confidence value; cosine removes it from the comparison."},{"expression":"the individual coordinates\nof a vector","reason":"Coordinates are defined in a chosen basis. Shared orthogonal rotations preserve scoring dot products; coordinate-specific interpretation or cross-fit comparison requires a compatible basis."}]}
                />
                <KeepInMind>
                  {"For an unseen query, inspect its fragment support and whether the sum has a defined cosine direction. Shared strings, hash collisions and cancellation can produce quite different evidence behind a similar-looking score."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            trueFalse(
              "With the shortest piece set to fifty characters, the fit agrees with the plain method exactly, with a largest disagreement of 0.0.",
              true,
              "No wrapped corpus word reaches the minimum piece length of fifty, so every word is represented by its whole-word row alone. Both implementations report costs of 3.8942 and 2.7842 over the two passes, and their compared outputs agree exactly. That is a useful regression check for this configuration. It does not rule out every implementation error or prove that a different corpus traversal would necessarily produce a different result.",
            ),
            choice(
              "Stocking is in no sentence and comes back at 0.9694 to the money words with stock nearest. What does that reading show?",
              [
                "A word inherits the company of the words it is spelled like, whether or not it means anything similar",
                "The corpus used stocking beside the money words often enough to place it",
                "One of its pieces was hashed by accident into a row a money word wrote, as happened to queue",
                "The fit is right, since a stocking belongs with the stock market",
              ],
              0,
              "The model places stocking near stock because their shared character pieces contribute trained vectors. It also shares some pieces with verb forms, but it has no observed contexts of its own to establish the intended meaning. A stocking as clothing need not belong near financial words. The example shows why generating a vector for an unfamiliar spelling is different from verifying that vector's meaning.",
            ),
            trueFalse(
              "Raising the number of rows improves the answer steadily, because fewer pieces collide.",
              false,
              "A larger bucket table does not improve every measured result in this sweep. The missing form's money-group cosine rises from 0.1133 at fifty rows to 0.2285 at two hundred rows. Changing the table size changes which pieces collide, so a particular word can receive less suitable contributions even as overall collision pressure falls. The gap between the known groups is 0.4417 at ten rows and 0.8723 at two thousand rows.",
            ),
            choice(
              "Queue comes back at 0.9919 to the eleven money words. What produced that reading?",
              [
                "Its spelling resembles that of several of the money words",
                "Thirteen of its fourteen pieces are shared with money words",
                "One of its pieces, queue>, was hashed to the row that arket uses, and market owns arket",
                "An unseen word falls back to a default vector that sits among the money words",
              ],
              2,
              "Queue reaches fourteen distinct rows here. Thirteen stay zero, and the remaining row was updated by a piece of market that hashes to the same bucket. That collision supplies queue's entire nonzero vector in this fit. Its high cosine to the money words therefore does not establish a relationship in spelling or usage. Looking at bucket coverage helps us see evidence that a cosine value alone hides.",
            ),
            several(
              "Zap has five pieces, and the hash sent every one of them to a row no word of this corpus reaches. Which of these then hold?",
              [
                              "Its vector is every coordinate exactly zero",
                              "A cosine against it is zero divided by zero, so the quantity does not exist",
                              "Its cosine against another word is zero, which reports that it is unrelated to everything",
                              "More passes over the same corpus would give it a direction",
                            ],
              [0, 1],
              "Zap’s selected rows remain zero under this corpus, so their sum has zero norm. Cosine divides by the product of vector norms and is undefined for that result. This SDK rejects the comparison. A system could instead return a labeled fallback, but that would be an interface convention rather than a measured cosine. Repeating the unchanged corpus still supplies no updates to these five rows.",
              {
                "description": "Zap has no whole-word row in this model. Its vector is the sum of its five hashed character-part contributions. Unused character-part rows start at zero, and no training word reaches any of these five rows. The corpus remains unchanged."
              },
            ),
        ],
        },
        {
          title: "Practice. Asking the Library for Words It Never Saw",
          practice: [
            exercise(
              "Ask both fits for the word no sentence holds",
              [
  "Fit the supplied Word2Vec and FastText models with identical settings, giving FastText two thousand piece buckets. The verb corpus deliberately omits playing.",
  "Catch and print the plain embedding table’s unknown-word refusal. For FastText print playing’s four nearest words and mean cosine to the supplied verb and money lists, to four decimal places."
],
              `import random
from statistics import mean

from oop_ml import FastText, UnknownTokenError, Word2Vec

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

draw = random.Random(11)
corpus = []
for _ in range(100):
    for words in (VERBS, MONEY):
        length = draw.randint(5, 8)
        corpus.append(" ".join(draw.choice(words) for _ in range(length)))

settings = dict(dimension=12, window=3, epochs=5, learning_rate=0.025, random_seed=0)

# Fit Word2Vec with the settings, ask its embeddings for the four words
# nearest playing, and print the UnknownTokenError it raises.

# Fit FastText with the same settings and n_buckets=2000.

# Print its four nearest words to playing with their cosines, then the mean
# similarity from playing to VERBS and to MONEY.`,
              `import random
from statistics import mean

from oop_ml import FastText, UnknownTokenError, Word2Vec

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

draw = random.Random(11)
corpus = []
for _ in range(100):
    for words in (VERBS, MONEY):
        length = draw.randint(5, 8)
        corpus.append(" ".join(draw.choice(words) for _ in range(length)))

settings = dict(dimension=12, window=3, epochs=5, learning_rate=0.025, random_seed=0)

plain = Word2Vec(**settings).fit(corpus)
try:
    plain.embeddings.most_similar("playing", 4)
except UnknownTokenError as refusal:
    print(f"one row per word: {refusal}")

pieces = FastText(**settings, n_buckets=2000).fit(corpus)
for neighbour in pieces.most_similar("playing", 4):
    print(f"{neighbour.word:8s}{neighbour.similarity:.4f}")
to_verbs = mean(pieces.similarity("playing", word) for word in VERBS)
to_money = mean(pieces.similarity("playing", word) for word in MONEY)
print(f"to the verb forms:  {to_verbs:.4f}")
print(f"to the money words: {to_money:.4f}")`,
              `one row per word: token 'playing' is not in this vocabulary of 31, which has no unknown token to fall back on
play    0.9993
plays   0.9988
player  0.9987
played  0.9985
to the verb forms:  0.9970
to the money words: 0.1003`,
              { hints: [
  "The plain table has no row for an absent word. FastText composes from hashed character pieces instead.",
  "Use FastText’s own most_similar/similarity methods for the composed word; its fixed known-word embedding table is a different interface."
], check: numberCheck("What is the mean cosine from playing to the eleven money words, to four places?", 0.1003, 5e-05, "Playing’s mean cosine to the money words is 0.1003 in this fit. Compare it with the verb-group mean; an unfamiliar spelling can still use parts learned from familiar forms."), question: "Can word parts supply a vector for a spelling absent from the training vocabulary?" },
            ),
            exercise(
              "Find the words stocking is spelled like",
              [
  "Without fitting, cut stocking and every supplied corpus word into FastText character pieces of lengths three through six.",
  "Print the number of distinct pieces in stocking and how many also occur in any supplied corpus word. Then print each word with a nonzero overlap, ordered by decreasing overlap count and alphabetically when counts tie. This compares spelling before any vectors are trained."
],
              `from oop_ml import FastText

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

cutter = FastText()

# The pieces of stocking, as a set.

# The pieces every corpus word owns between them, as one set.

# Print how many pieces stocking has and how many are in the owned set.

# For each corpus word, count the pieces it shares with stocking, and print
# the words that share at least one, largest count first.`,
              `from oop_ml import FastText

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

cutter = FastText()

pieces = set(cutter.n_grams_of("stocking"))
owned = {piece for word in VERBS + MONEY for piece in cutter.n_grams_of(word)}
print(f"stocking has {len(pieces)} pieces, {len(pieces & owned)} of them owned by a corpus word")

shared = {word: len(pieces & set(cutter.n_grams_of(word))) for word in VERBS + MONEY}
for word in sorted(shared, key=lambda word: (-shared[word], word)):
    if shared[word] > 0:
        print(f"{word:9s}{shared[word]}")`,
              `stocking has 26 pieces, 16 of them owned by a corpus word
stock    10
talking  6
walking  6
staying  4
saying   3
stay     1
stayed   1
stays    1`,
              { hints: [
  "Use n_grams_of and sets to compare distinct piece spellings.",
  "Count each set intersection. Sort with (-shared[word], word) so a larger overlap comes first and ties use alphabetical order."
], check: numberCheck("How many pieces does stocking share with stock?", 10, 0, "Stocking and stock share ten distinct pieces. Character overlap supplies reusable parameters but cannot establish which meaning of a spelling is intended."), question: "Which known spellings share character pieces with stocking?" },
            ),
            exercise(
              "Read the length a cosine throws away",
              [
  "Fit FastText as in the first exercise. For playing, stocking, queue and zap, find the distinct bucket rows reached by their character pieces. Print how many of those rows contain nonzero vectors, the total number of reached rows, and the norm of the composed word vector.",
  "Finally ask for zap’s nearest word and print the library refusal. A bucket hit can be caused by a different piece hashing to that bucket, so a nonzero row does not prove that exact spelling was observed."
],
              `import random

import numpy as np
from oop_ml import FastText, UndefinedMetricError

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

draw = random.Random(11)
corpus = []
for _ in range(100):
    for words in (VERBS, MONEY):
        length = draw.randint(5, 8)
        corpus.append(" ".join(draw.choice(words) for _ in range(length)))

settings = dict(dimension=12, window=3, epochs=5, learning_rate=0.025, random_seed=0)
model = FastText(**settings, n_buckets=2000).fit(corpus)

for word in ("playing", "stocking", "queue", "zap"):
    # rows: the set of rows this word's pieces are hashed to.

    # written: how many of those rows hold anything but zeros.

    # length: the length of the word's vector.

    # Print the word, written, the number of rows, and length to four places.
    pass

# Ask for the word nearest zap and print the UndefinedMetricError it raises.`,
              `import random

import numpy as np
from oop_ml import FastText, UndefinedMetricError

VERBS = (
    "play played plays player stay stayed stays staying say said says saying "
    "walk walked walks walking talk talked talks talking"
).split()
MONEY = "stock bond market price trade fund bank cash debt yield share".split()

draw = random.Random(11)
corpus = []
for _ in range(100):
    for words in (VERBS, MONEY):
        length = draw.randint(5, 8)
        corpus.append(" ".join(draw.choice(words) for _ in range(length)))

settings = dict(dimension=12, window=3, epochs=5, learning_rate=0.025, random_seed=0)
model = FastText(**settings, n_buckets=2000).fit(corpus)

for word in ("playing", "stocking", "queue", "zap"):
    rows = set(model.n_gram_ids_of(word))
    written = sum(1 for row in rows if model.bucket_vectors[row].any())
    length = float(np.linalg.norm(model.vector_of(word).values))
    print(f"{word:9s}rows written {written:2d} of {len(rows):2d}   length {length:.4f}")

try:
    model.most_similar("zap", 1)
except UndefinedMetricError as refusal:
    print(f"zap: {refusal}")`,
              `playing  rows written 17 of 22   length 3.7789
stocking rows written 16 of 26   length 3.0864
queue    rows written  1 of 14   length 0.1893
zap      rows written  0 of  5   length 0.0000
zap: the zero vector has no direction, so nothing is similar to it`,
              { hints: [
  "n_gram_ids_of identifies reached bucket rows. Inspect bucket_vectors for nonzero entries.",
  "vector_of(word).values gives the composed vector. A zero vector has no cosine direction."
], check: numberCheck("How long is stocking’s vector, to four places?", 3.0864, 5e-05, "Stocking’s vector norm is 3.0864. Its nonzero hashed buckets include reused information; a bucket hit alone does not prove that exact piece was observed."), question: "How much learned bucket information supports an unfamiliar word’s vector?" },
            ),
          ],
        },
      ]}
    />
  );
}
