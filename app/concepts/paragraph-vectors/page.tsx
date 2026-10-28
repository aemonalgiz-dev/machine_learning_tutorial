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
import { ParagraphAgainstAveraging } from "@/components/widgets/ParagraphAgainstAveraging";
import { ParagraphDocumentMap } from "@/components/widgets/ParagraphDocumentMap";
import { ParagraphInferenceCurve } from "@/components/widgets/ParagraphInferenceCurve";
import { ParagraphOrderProbe } from "@/components/widgets/ParagraphOrderProbe";
import { ParagraphRowLengths } from "@/components/widgets/ParagraphRowLengths";
import { ParagraphVectorWorkbench } from "@/components/widgets/ParagraphVectorWorkbench";

export const metadata: Metadata = {
  title: "Paragraph Vectors · oop_ml",
  description:
    "A document may have useful characteristics beyond an average of its word vectors. Paragraph vectors learn a document representation by asking it to help predict the words in that document.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function ParagraphVectorsPage() {
  return (
    <ConceptPage
      lessonId="paragraph-vectors"
      intuition={lessonIntuitions["paragraph-vectors"]}
      technicalStart="Part 2. A Document As A Word That Is Always There"
      openingTitle="Give the Whole Document Something to Learn"
      playgroundTitle="Learn a vector that helps predict a document's words"
      playgroundIntro="Compare the word and document contributions to a prediction. Inspect how a new document's vector changes during inference while the trained word representations remain fixed."
      title="Paragraph Vectors"
      tagline={"A document may have useful characteristics beyond an average of its word vectors. Paragraph vectors learn a document representation by asking it to help predict the words in that document."}
      prerequisites={
        <>
          The training loop here is the one{" "}
          <Link href="/concepts/word2vec" className={link}>
            word2vec
          </Link>{" "}
          establishes, both of its architectures and the handful of wrong answers
          that make the arithmetic affordable, and none of that is derived again
          below. The method this one replaces is on the page about{" "}
          <Link href="/concepts/pooling-a-text" className={link}>
            pooling a text
          </Link>
          , which measures what combining a text&rsquo;s word positions can and
          cannot keep. Every comparison here is the{" "}
          <Link href="/concepts/distance-metrics" className={link}>
            cosine
          </Link>{" "}
          between two positions, and giving a held-out text a position is plain{" "}
          <Link href="/concepts/gradient-descent-regression" className={link}>
            gradient descent
          </Link>
          , which Part 4 leans on heavily.
        </>
      }

      playground={<ParagraphVectorWorkbench />}
      sections={[
        {
          title: "Part 1. What Averaging A Text Cannot Do",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The collection every number here comes from">
                <p>
                  We will learn from thirty short documents, fifteen about cooking and fifteen about sailing. Each document has eight words, sampled with replacement from its topic&apos;s ten-word list. The lists do not overlap, giving twenty words across two hundred and forty occurrences. We know the intended topic structure, so we can check whether the learned document vectors reflect it.
                </p>
                <NumberTable
                  headings={["about", "the ten words it draws from"]}
                  rows={[
                    [
                      "cooking",
                      "simmer, onion, garlic, butter, saucepan, whisk, flour, season, ladle, broth",
                    ],
                    [
                      "sailing",
                      "mainsail, rudder, harbour, anchor, keel, tide, starboard, rigging, mooring, gust",
                    ],
                  ]}
                  caption="The first document reads broth flour flour ladle whisk season ladle garlic, and the sixteenth reads keel starboard keel starboard tide starboard gust rudder. Nothing tells any fit below which document belongs to which list."
                />
                <p>
                  Two texts run through the page from here on and neither of them
                  is in the collection. One is butter garlic onion simmer broth
                  whisk flour ladle, which is plainly about cooking, and the other
                  is anchor tide rudder harbour keel gust mooring mainsail. They
                  are the held-out texts, and the whole of Part 4 is about what it
                  takes to give one of them a position after the fit has
                  finished.
                </p>
                <KeepInMind>
                  The collection is small and its two subjects are disjoint by
                  construction, which makes it an easy case. That matters when a
                  method comes out badly on it, since a method that struggles
                  here has nowhere gentler to be tried.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a sum over a text’s words cannot distinguish">
                <p>
                  There is an obvious way to give a text a position once its words
                  have one, which is to stand at the middle of them, and the page
                  on pooling works through what that keeps. The finding worth
                  carrying here is the one it ends on. Every rule of that kind is a
                  sum over the words of a text divided by something that depends
                  on which words they were and not on the order they came in, so
                  any two texts built from the same words in any two arrangements
                  land on one position.
                </p>
                <p>
                  Measured here on the held-out cooking text against its own eight
                  words shuffled, the average of the word positions gives the two
                  arrangements a cosine of exactly 1.0000, which is the same
                  position and not a very near one. That is not a weakness of a
                  particular weighting and no better weighting repairs it, because
                  it follows from the shape of the sum.
                </p>
                <Equation>
                  {"v(text)  =  (1 / n) · ∑ v(w)   over the n words, in any order"}
                </Equation>
                <KeepInMind>
                  Order blindness is the sharpest thing that can be said about
                  pooling, and it is a fact about the arithmetic rather than about
                  any table of word positions. Anything that escapes it has to
                  read the words in some arrangement rather than adding them up.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Giving the text a row of its own">
                <p>
                  Here is the other way. Instead of building the text&rsquo;s
                  position out of its words&rsquo; positions, give the text a row
                  in the table, exactly as a word has one, and learn it. The row
                  starts as a small random draw and is moved by the same rule that
                  moves the words&rsquo; rows, so at the end of the fit it holds
                  whatever it turned out to need to hold.
                </p>
                <p>
                  Nothing in that description says what the row means. It is not
                  an average of anything, it is not a summary anybody designed,
                  and it cannot be computed from the text by any formula. It is
                  wherever the optimisation left it, which is why the rest of the
                  page has to measure rather than describe, and why Part 4 is the
                  long one.
                </p>
                <KeepInMind>
                  A word&rsquo;s row is learned and a pooled text&rsquo;s position
                  is computed. This method moves the text to the first kind, which
                  buys the thing Part 5 measures and costs the thing Part 4
                  measures.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. A Document As A Word That Is Always There",
          content: (
            <>
              <SubSection title="4. The change of question">
                <p>
                  Word2vec learns a word&rsquo;s row by asking it to help predict
                  the words that appear beside it. The whole of this method is one
                  observation about that loop, which is that it never asks where
                  the row it is training came from. So put the document into the
                  window as one more token, one that is present at every position
                  inside that document and at no position anywhere else, and the
                  loop trains its row alongside the words&rsquo; rows without
                  needing to be changed.
                </p>
                <p>
                  What that row then learns follows from where it appears. It is
                  present at every position of its own document and nowhere else,
                  so the only thing it can help predict is that document&rsquo;s
                  own words, and the only thing worth carrying is whatever those
                  words have in common. A single context of three words does not
                  determine the subject and a whole document mostly does, which is
                  the argument for expecting the subject to end up there.
                </p>
                <Equation>
                  {"a document  =  a token present at every window inside it, and no other"}
                </Equation>
                <KeepInMind>
                  Nothing here is a new objective. It is word2vec&rsquo;s
                  objective with one extra row in the input table, and every
                  property the objective had, including the fact that the answer
                  depends on the random start, comes across unchanged.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Predict a word using its document and one context word" id="5-one-position-worked-all-the-way-through">
                <p>
                  Take one position of one document with three coordinates per
                  vector. There is one context word, so the prediction uses the
                  mean of the document vector and that word&rsquo;s vector.
                </p>
                <Equation>
                  {"h  =  ( d  +  ∑ v(c) )  /  ( 1 + n )     over the n context words"}
                </Equation>
                <WorkedExample title="One position of one document">
                  <p>
                    First average the two input vectors, coordinate by coordinate.
                  </p>
                  <Equation>{[
                    "document vector d = (0.2, −0.1, 0.4)",
                    "context vector v = (0, 0.3, −0.2)",
                    "h = (d + v) / 2",
                    "  = (0.2 / 2, 0.2 / 2, 0.2 / 2)",
                    "  = (0.1, 0.1, 0.1)",
                  ].join("\n")}</Equation>
                  <p>
                    Use one output vector for the observed word and one for a
                    sampled negative word. Each dot product gives a score;
                    sigmoid turns it into the probability used by the
                    positive-versus-negative training task.
                  </p>
                  <Equation>{[
                    "observed-word output vector u₊ = (1, 0, 0)",
                    "negative-word output vector u₋ = (0, 1, 0)",
                    "s₊ = h · u₊ = 0.1",
                    "s₋ = h · u₋ = 0.1",
                    "p₊ = p₋ = sigmoid(0.1) ≈ 0.524979",
                    "",
                    "observed-word error = p₊ − 1 ≈ −0.475021",
                    "negative-word error = p₋ − 0 ≈ 0.524979",
                    "g = (p₊ − 1)u₊ + p₋u₋ ≈ (−0.475021, 0.524979, 0)",
                  ].join("\n")}</Equation>
                  <p>
                    The gradient describes a change to the mean. Each input
                    contributed equally to that mean, so each receives half of
                    this gradient. Apply the chosen learning rate to obtain
                    the update added to both input vectors.
                  </p>
                  <Equation>{[
                    "learning rate = 0.025",
                    "Δd = Δv = −0.025 × g / 2",
                    "         ≈ (0.005938, −0.006562, 0)",
                  ].join("\n")}</Equation>
                </WorkedExample>
                <Equation>
                  {"Δ  =  −rate · g / ( 1 + n )     the same step for every averaged row"}
                </Equation>
                <p>
                  The document&rsquo;s row and the word&rsquo;s row move by the
                  identical amount at this position, which looks like symmetry and
                  is the source of the asymmetry Part 4 is about. The word will
                  meet many more positions than this document will.
                </p>
                <KeepInMind>
                  Every row that went into the mean is answerable for the same
                  share of the mistake, because the mean weights them equally.
                  Nothing in the objective knows that one of those rows is a
                  document.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. What the row is forced to learn">
                <p>
                  The objective does not explicitly label a document&apos;s subject. At each training position, it increases the score of an observed word and decreases scores for sampled negative words. A topic-like arrangement can emerge when documents share these prediction patterns. We should check that outcome separately from describing the objective.
                </p>
                <>
<p>
                  A row that leaned towards one cooking word and away from everything else would do well at one position and badly at seven, so the only row that does well across all eight is one that leans towards all eight words at once. Here the eight words are drawn from a list of ten, and any two cooking documents are drawing from the same ten, so the rows that serve two cooking documents well are similar rows.
                </p>
                <p>
                  Documents from one topic repeatedly ask their vectors to help predict that topic&apos;s words. In this constructed collection, that gives them related training signals and can bring their fitted representations together. Whether useful groups emerge on another collection depends on its patterns and on how well training fits them.
                </p>
</>
                <WhyThisWorks title="Why the first update moves the output table before the document vector">
                  <>
                    <p>
                      The output table starts at zero, so every score starts at zero and
                      every sigmoid probability at one half. Each position is compared
                      with one observed word and five sampled alternatives.
                    </p>
                    <Equation>{"loss for either target at probability 0.5 = −ln(0.5) = ln 2\ninitial loss per position = 6 ln 2 ≈ 4.1589"}</Equation>
                    <p>
                      The measured first-epoch mean is 4.1529, slightly lower, because
                      updates begin during that epoch rather than waiting until it ends.
                    </p>
                  </>
                </WhyThisWorks>
                <KeepInMind>
                  The objective is about predicting words and not about grouping
                  documents, and nothing anywhere in it mentions cooking or
                  sailing. The grouping is a by-product, which means it can fail
                  quietly on a collection whose documents do not share vocabulary
                  in the way this one does.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. The Two Arrangements",
          content: (
            <>
              <SubSection title="7. The document averaged in with its context">
                <p>
                  The first arrangement is called distributed memory, and it is
                  the one worked through in section 5. The words on either side of
                  a position are collected up, the document&rsquo;s row is added
                  to that collection, the whole lot is averaged, and the average
                  is asked to predict the word in the middle. The document is
                  there at every position, which is what the word memory in the
                  name is pointing at, since it is the thing that remembers what
                  the rest of the document was about while a local window is being
                  read.
                </p>
                <p>
                  Two details of the version measured here are choices rather than
                  consequences. The paper describes joining the vectors end to end
                  as well as averaging them, and averaging is what is used
                  throughout below, because joining them fixes the window size
                  into the model and makes a shorter window a different model
                  rather than a different setting. And a document of one word has
                  no context at all, in which case the mean is over the
                  document&rsquo;s row alone and the position is scored rather
                  than skipped.
                </p>
                <KeepInMind>
                  Under this arrangement the word rows are always trained, since
                  they are part of every mean. That is not true of the other one,
                  and section 10 is about how much difference it makes.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The document predicting its own words alone">
                <p>
                  The second arrangement is called the distributed bag of words,
                  and it throws the context away. The document&rsquo;s row is the
                  whole of what predicts, and what it is asked to predict is a word
                  of the document, one word at a time, with no reference to what
                  stood beside that word. The paper draws a window and then a word
                  from inside it at each step; sweeping every word of the document
                  once per pass, which is what happens here, is the same objective
                  with the sampling replaced by an exhaustive walk.
                </p>
                <Equation>{"h  =  d     the document’s row and nothing else"}</Equation>
                <p>
                  The immediate consequence is that the whole of the gradient
                  belongs to the document&rsquo;s row. Under the first arrangement
                  that row got one share of a mean over several rows; here there
                  is nothing to share it with, and it takes the step whole. That
                  one difference is behind almost every number in Part 4.
                </p>
                <WorkedExample title="The same position under this arrangement">
                  <p>
                    Take the position section 5 worked, with the same document
                    vector, the same two output vectors and the same learning
                    rate. The context vector is no longer read, so the
                    document&rsquo;s row is scored against the output vectors on
                    its own.
                  </p>
                  <Equation>{[
                    "h = d = (0.2, −0.1, 0.4)",
                    "s₊ = h · u₊ = 0.2         p₊ = sigmoid(0.2) ≈ 0.549834",
                    "s₋ = h · u₋ = −0.1        p₋ = sigmoid(−0.1) ≈ 0.475021",
                    "g = (p₊ − 1)u₊ + p₋u₋ ≈ (−0.450166, 0.475021, 0)",
                    "Δd = −0.025 × g ≈ (0.011254, −0.011876, 0)",
                  ].join("\n")}</Equation>
                  <p>
                    There is no division by two, because nothing else went into
                    h. Under the first arrangement this position moved the
                    document&rsquo;s row by (0.005938, &minus;0.006562, 0), so
                    here the row travels close to twice as far in both
                    coordinates, and no word&rsquo;s row moves at all.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Discarding the context makes this arrangement cheaper per
                  position and blind, by construction, to which words stood beside
                  which. Section 19 measures whether the first arrangement
                  actually cashes in the difference.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What the two produce on this collection">
                <p>
                  Both work. Under distributed memory two cooking documents come
                  out at a mean cosine of 0.8974 and two sailing documents at
                  0.8696, against 0.2811 for one of each; under the bag of words
                  the three figures are 0.7763, 0.8078 and 0.1445. Under both, the
                  fourteen documents nearest the first cooking document are the
                  other fourteen cooking documents, with no sailing document
                  breaking in.
                </p>
                <ParagraphDocumentMap />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Every pair of fitted documents, as a grid of cosines. The two
                  bright blocks on the diagonal are the two subjects, and no fit
                  was told which document belonged to which. Switch the
                  arrangement to see the same structure found twice by different
                  arithmetic.
                </p>
                <p>
                  The across-subject figure is positive under both, and that is
                  worth stopping on, because a reader used to seeing two unrelated
                  things come out near zero or below it will read 0.2811 as a
                  failure. Every document in the collection is trained against one
                  shared table of output rows, so every document&rsquo;s position
                  picks up a component pointing the same way as every other
                  document&rsquo;s. The quantity to read is therefore the gap
                  between the within figure and the across figure, and not the
                  sign of either.
                </p>
                <NumberTable
                  headings={[
                    "arrangement",
                    "two cooking",
                    "two sailing",
                    "one of each",
                    "cost, first pass to last",
                  ]}
                  rows={[
                    [
                      "distributed memory",
                      "0.8974",
                      "0.8696",
                      "0.2811",
                      "4.1529 → 2.0891",
                    ],
                    [
                      "distributed bag of words",
                      "0.7763",
                      "0.8078",
                      "0.1445",
                      "4.1538 → 1.8720",
                    ],
                  ]}
                  caption="Thirty passes at a step size of 0.1, a width of eight and a window of three. Both start just under the 4.1589 an untrained pair costs and both fall by about half."
                />
                <KeepInMind>
                  Two documents about different subjects come out positively alike
                  here, and that is what a shared output table does rather than a
                  fault. Compare the two numbers to each other, never either of
                  them to zero.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Why the bag of words learns no word vectors at all">
                <p>
                  Under the bag of words the word rows are never read and never
                  written. The prediction is made from the document&rsquo;s row,
                  the correction goes to the document&rsquo;s row and to the
                  output rows, and the input row belonging to butter is never
                  touched from the beginning of the fit to the end of it. So the
                  word table this arrangement hands back at the end is the random
                  draw it was given at the start, which is a fact about the method
                  and not a shortcoming of any particular run.
                </p>
                <>
<p>
                  Measured, that is exactly what it looks like. Under distributed memory butter and garlic reach a cosine of 0.994 against 0.120 for butter and anchor, which is the separation of the two lists showing up in the words as well as the documents. Under the plain bag of words the same two pairs read 0.4206 and &minus;0.2104, which are the values two random draws happen to have and mean nothing whatever.
                </p>
                <p>
                  Adding an ordinary word pair alongside each document pair, which is the usual repair, brings them back to 0.9666 and 0.0965 in a third of the passes.
                </p>
</>
                <NumberTable
                  headings={[
                    "what was fitted",
                    "butter against garlic",
                    "butter against anchor",
                  ]}
                  rows={[
                    ["distributed memory", "0.9940", "0.1200"],
                    ["distributed bag of words", "0.4206", "−0.2104"],
                    ["the same, with word pairs added", "0.9666", "0.0965"],
                  ]}
                  caption="The middle row is the untouched random start, and it is the only row here where the numbers are not about the collection at all."
                />
                <KeepInMind>
                  A fitted table of word positions from the bag of words is not a
                  weaker table. It is the initialisation, and using it for
                  anything is using a random draw, which is a mistake that shows up
                  as mediocre results rather than as an error.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Settings that separate nothing at all">
                <p>
                  The results above use thirty passes at a step size of 0.1. At the reference settings discussed here, ten passes starting at 0.025, the small collection supplies only 2,400 training positions. Its cost changes from 4.1586 to 4.1155, close to the untrained pair cost of 4.1589. That run has made little progress, so we must report the stronger training settings when discussing the later results.
                </p>
                <p>
                  The document positions are then still essentially where they were
                  drawn. Two documents of one subject come out at a mean cosine of
                  0.0330 and two documents of different subjects at 0.0437, so the
                  pairs that ought to be alike are on average slightly less alike
                  than the pairs that ought not to be, which is what thirty
                  directions drawn at random in eight dimensions look like.
                </p>
                <KeepInMind>
                  A published default is a statement about the corpus the authors
                  had, which was very much larger than this one. On a collection of
                  two hundred and forty word occurrences the defaults do not fail
                  loudly, they simply return the starting draw, which is the kind
                  of failure that is easy to mistake for the method not working.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "A better weighting of the word positions would let an averaged text tell two arrangements of the same words apart.",
              false,
              "Every rule of that kind is a sum over the words divided by something that depends on which words they were and not on the order they came in, so no weighting repairs it. Measured here, the held-out cooking text and its own eight words shuffled come out at a cosine of exactly 1.0000, which is the same position rather than a very near one.",
            ),
            choice(
              "What makes a document train alongside the words inside word2vec’s own loop?",
              [
                "It is put into the window as one more token, present at every position inside that document and at no position anywhere else",
                "A second objective is added for documents",
                "The document’s row is reset to the mean of its words before each pass",
                "The output table is given a separate half for documents",
              ],
              0,
              "The loop never asks where the row it is training came from, so nothing in it has to change. Every property the objective had, including that the answer depends on the random start, comes across unchanged.",
            ),
            trueFalse(
              "At the reference settings of ten passes from a step size of 0.025, the fit still separates the two subjects, only less sharply.",
              false,
              "It separates nothing. Two documents of one subject come out at a mean cosine of 0.0330 and two of different subjects at 0.0437, which is what thirty directions drawn at random in eight dimensions look like, and the cost only falls from 4.1586 to 4.1155. The collection offers 2,400 positions at those settings, so the defaults do not fail loudly and simply return the starting draw, which is why every other number on the page uses thirty passes at 0.1.",
            ),
            choice(
              "Two documents about different subjects come out at a cosine of 0.2811 under distributed memory. How should that be read?",
              [
                "Against the within-subject figures of 0.8974 and 0.8696, since a shared output table pushes every document the same way",
                "As a failure, since two unrelated things ought to come out near zero or below it",
                "As evidence that the two word lists overlap after all",
                "As the level of noise left by the random start",
              ],
              0,
              "Every document in the collection is trained against one shared table of output rows, so every position picks up a component pointing the same way as every other. The quantity to read is the gap between the within figure and the across figure, never the sign of either.",
            ),
            trueFalse(
              "The word table the plain bag of words hands back at the end of a fit is the random draw it was given at the start.",
              true,
              "The prediction is made from the document’s row, and the correction goes to that row and to the output rows, so the input row belonging to butter is never touched from the beginning of the fit to the end. Measured, butter and garlic read 0.4206 there and butter and anchor −0.2104, which are plausible-looking numbers that mean nothing whatever.",
            ),
        ],
        },
        {
          title: "Part 4. A Text The Fit Never Saw",
          content: (
            <>
              <SubSection title="12. There is no row to look up">
                <p>
                  Here is where the method becomes awkward. A word seen during the
                  fit has a row, and a document seen during the fit has a row, and
                  either can be looked up in constant time. A text that arrives
                  afterwards has no row, and there is nothing whatever to look up,
                  because its position was never a function of its words in the
                  first place.
                </p>
                <p>
                  What there is instead is the same loop, run again with everything
                  else nailed down. Give the new text a fresh random row, freeze
                  the word table and the output table so nothing already learned
                  can move, and run the same updates over the new text&rsquo;s own
                  positions, moving that one row and nothing else. After enough
                  passes the row sits wherever it needed to sit to predict that
                  text&rsquo;s words.
                </p>
                <Equation>
                  {"d*  =  argmin over d of  ∑ loss( word, d )     every table held fixed"}
                </Equation>
                <p>
                  Two things follow immediately and both matter. The answer is
                  gradient descent, so it depends on where it started and on how
                  long it was allowed to run, and the cost of placing one text is
                  no longer a table lookup but an optimisation whose length the
                  caller chooses. Section 14 is about how badly that second choice
                  can go.
                </p>
                <KeepInMind>
                  With fixed word vectors, pooling gives us a direct calculation. Inferring a paragraph vector instead runs an optimization from an initial value. Stopping early can leave the representation strongly dependent on that starting point. Sections 14 and 20 test this by comparing runs rather than assuming a chosen pass count is sufficient.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Why the document rows are short and the word rows long">
                <p>
                  Before the passes are counted, the reason the count matters has
                  to be visible, and it is a fact about how often each kind of row
                  is stepped. Under distributed memory a document&rsquo;s row is
                  stepped eight times a pass, once at each of its own positions,
                  and never again. A word&rsquo;s row is stepped once for every
                  position it stands beside, in every document that used it, and
                  each of the ten cooking words turns up in between seven and
                  twelve of the fifteen cooking documents.
                </p>
                <p>
                  Measured after the fit, the word rows have lengths between 1.7429
                  and 2.6753, mean 2.2348, and the document rows lengths between
                  0.2909 and 0.5249, mean 0.3897. The word rows are nearly six
                  times as long. A new document begins at a random draw of length
                  about 0.115, so it enters a mean in which the word rows already
                  dominate, and it is answerable for only its share of a gradient
                  that has to move it a long way.
                </p>
                <ParagraphRowLengths />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The range of row lengths in each family, with the dot at the
                  mean. The top two bars are distributed memory, where the words
                  are long; the bottom two are the bag of words, where the word
                  rows were never stepped and the document rows took every step
                  whole.
                </p>
                <p>
                  Under the bag of words the picture is the reverse, and for the
                  reason section 8 gave. The document rows there run from 1.9010 to
                  2.5183 while the word rows sit between 0.0713 and 0.1485, which
                  are the lengths a random draw at this width has. A new document
                  under that arrangement starts short and is stepped by the whole
                  gradient rather than a share of it.
                </p>
                <KeepInMind>
                  How far a row travelled during a fit is a count of how often it
                  was stepped, not a statement about how important it is. The
                  lengths are the mechanism behind everything the next two sections
                  measure, which is why they are worth reading before the curve.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The published twenty passes, measured">
                <p>
                  The published number of passes to give a new text is twenty. On
                  this collection, under distributed memory, twenty passes put the
                  held-out cooking text at a mean cosine of 0.4786 to the cooking
                  documents and 0.7608 to the sailing ones. It is in the wrong
                  half, and not narrowly. All five of the documents it comes out
                  nearest are sailing documents, and a reader who took that answer
                  and did anything with it would be working with a cooking text
                  filed under sailing.
                </p>
                <ParagraphInferenceCurve />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The held-out cooking text&rsquo;s position against the number of
                  passes, on a logarithmic axis, with the published twenty marked.
                  Under distributed memory the two lines have not yet crossed
                  there. Switch the arrangement to see the other one, where they
                  never cross because they never had to.
                </p>
                <p>
                  Given more passes it arrives, and the crossing happens between
                  twenty and fifty. Fifty passes give 0.8347 against 0.3303, a
                  hundred give 0.9031 against 0.2116, and two hundred give 0.9081
                  against 0.1405, after which very little more is bought. The
                  length of the inferred row rises with the passes too, from 0.1112
                  at one pass to 0.8071 at two hundred, which is the row walking
                  out of its random start towards the scale the fitted rows work
                  at.
                </p>
                <NumberTable
                  headings={[
                    "passes",
                    "towards cooking",
                    "towards sailing",
                    "length of the answer",
                    "verdict",
                  ]}
                  rows={[
                    ["1", "−0.3490", "−0.0298", "0.1112", "sailing"],
                    ["20", "0.4786", "0.7608", "0.2068", "sailing"],
                    ["50", "0.8347", "0.3303", "0.2387", "cooking"],
                    ["100", "0.9031", "0.2116", "0.4397", "cooking"],
                    ["200", "0.9081", "0.1405", "0.8071", "cooking"],
                    ["400", "0.8993", "0.1081", "1.3869", "cooking"],
                  ]}
                  caption="The held-out cooking text under distributed memory. The published twenty is on the wrong side of the crossing, and the first count in this sweep that gets the subject right is fifty."
                />
                <KeepInMind>
                  A default number of passes is a statement about a model of a
                  certain size, and on a small model under this arrangement twenty
                  is far too few. The failure is silent, since a wrong answer here
                  looks exactly like a right one.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The bag of words arrives at once, and then drifts">
                <p>
                  The same measurement under the other arrangement looks nothing
                  like it. A single pass already puts the held-out text at 0.8330
                  to the cooking documents against 0.4047 to the sailing ones, so
                  it is in the right half before it has seen its own eight words
                  more than once. Twenty passes give 0.8565 against 0.1420, which
                  is a good answer, and the published default serves this
                  arrangement well.
                </p>
                <p>
                  What happens after twenty is more interesting than what happens
                  before it. Two hundred passes give 0.7665 against 0.0924, so the
                  distance to the wrong subject keeps improving while the distance
                  to the right one gets worse, and four hundred passes leave the
                  text at 0.6954 to its own subject. The row is not going wrong. It
                  is becoming a better and better description of its own eight
                  particular words, which is what it was asked to do, and a
                  description that particular has moved away from what the fifteen
                  cooking documents share.
                </p>
                <InAModel>
                  This is the shape of an overfitting curve with none of the
                  apparatus of one, and there is nothing held out to detect it
                  with. In this recorded run the fitting objective keeps falling,
                  while the quantity anybody
                  actually wanted turns and comes back down, which is the same
                  disagreement the word2vec page finds between the cost of a
                  training pair and the separation of two word lists. Descent
                  does not guarantee a decrease after every finite update,
                  especially with sampled training signals. Check the measured
                  curve and the held-out behaviour separately.
                </InAModel>
                <KeepInMind>
                  One default cannot serve both arrangements here. Twenty passes is
                  too few for one by a factor of at least two and a half, and past
                  the best point for the other, and no number was measured that is
                  good for both.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Part 4",
          quiz: [
            choice(
              "A text that arrives after the fit has no row. How is one produced?",
              [
                "The same loop is run again with the word and output tables frozen, moving that one row",
                "Its words’ rows are averaged",
                "The row of the nearest fitted document is copied",
                "A row is interpolated between the two subject centres",
              ],
              0,
              "Its position was never a function of its words in the first place, so there is nothing to look up. The answer is gradient descent, which means it depends on where it started and on how long it was allowed to run, so placing one text is a search rather than a lookup.",
            ),
            trueFalse(
              "After the fit under distributed memory the word rows are nearly six times as long as the document rows.",
              true,
              "Word rows measure between 1.7429 and 2.6753 with a mean of 2.2348, against document rows between 0.2909 and 0.5249 with a mean of 0.3897. How far a row travelled is a count of how often it was stepped, and a document’s row is stepped eight times a pass and never again while each cooking word turns up in between seven and twelve of the fifteen cooking documents.",
            ),
            choice(
              "At the published twenty passes under distributed memory, where does the held-out cooking text land?",
              [
                "At 0.4786 to the cooking documents and 0.7608 to the sailing ones, with all five of its nearest documents sailing",
                "At 0.8347 to cooking and 0.3303 to sailing",
                "At 0.9081 to cooking and 0.1405 to sailing",
                "Exactly between the two subjects, having learned nothing either way",
              ],
              0,
              "It is in the wrong half and not narrowly. The crossing happens between twenty and fifty passes, with fifty giving 0.8347 against 0.3303 and two hundred giving 0.9081 against 0.1405, after which very little more is bought. The failure is silent, since a wrong answer here looks exactly like a right one.",
            ),
            trueFalse(
              "Under the bag of words, running more passes on a held-out text keeps improving its cosine to its own subject.",
              false,
              "Twenty passes give 0.8565 against 0.1420 and two hundred give 0.7665 against 0.0924, so the distance to the wrong subject keeps improving while the distance to the right one gets worse, and four hundred passes leave the text at 0.6954. The row is becoming a better description of its own eight particular words, which is exactly what it was asked to do.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Held-out cooking text, distributed bag of words:\npasses  cosine toward cooking  cosine toward sailing\n20      0.8565                 0.1420\n200     0.7665                 0.0924\n400     0.6954                 not needed here\nThe trained word and output tables are held fixed while the document row is inferred."
              },
            ),
            trueFalse(
              "Watching the objective fall is enough to catch that inference has run too long.",
              false,
              "In this recorded run the fitting objective keeps falling while the useful subject comparison gets worse. That illustrates a difference between fitting the prediction task and obtaining the representation we wanted. It does not establish that descent always lowers the objective after every finite or sampled update. The word2vec example likewise compares its training objective with a separate measure of the learned representation.",
            ),
        ],
        },
        {
          title: "Part 5. What It Costs, And Where Averaging Wins",
          content: (
            <>
              <SubSection title="16. What a fit costs, counted in positions">
                <p>
                  The honest unit of cost here is a position, since every position
                  costs one vector of eight numbers and six output rows whatever
                  machine is running it. The collection is thirty documents of
                  eight words, so a pass is two hundred and forty positions and
                  thirty passes are 7,200. Averaging the words of those same
                  documents costs two hundred and forty additions and no passes at
                  all, because there is nothing to fit.
                </p>
                <Equation>
                  {"a fit  =  documents × words per document × passes     positions"}
                </Equation>
                <p>
                  The tables that come out of it are worth counting too. Twenty
                  words at a width of eight is 160 numbers of word table, thirty
                  documents is 240 of document table, and the output rows the fit
                  needed and does not answer with are another 160. Already, on a
                  collection this small, the document half of what was learned is
                  larger than the word half, and section 22 comes back to what that
                  means as a collection grows.
                </p>
                <KeepInMind>
                  Counting positions rather than seconds keeps the cost a fact
                  about the method. The seconds in the next section are a fact
                  about one machine and are quoted because the ratio between them
                  is the point rather than either number.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What one held-out text costs">
                <p>
                  A held-out text of eight words at two hundred passes costs 1,600
                  positions, which is more than six times what one training
                  document contributed to the whole fit and is 22 per cent of the
                  entire fit, for one document out of thirty. Under the bag of
                  words at twenty passes it is 160 positions. Averaging that
                  text&rsquo;s word positions costs eight additions and a
                  division.
                </p>
                <NumberTable
                  headings={[
                    "giving one held-out text a position",
                    "positions walked",
                    "against the whole fit",
                  ]}
                  rows={[
                    ["distributed memory, 200 passes", "1600", "22.2%"],
                    ["distributed memory, 20 passes", "160", "2.2%"],
                    ["distributed bag of words, 20 passes", "160", "2.2%"],
                    ["the average of its word positions", "8 additions", "no fit at all"],
                  ]}
                  caption="Machine-independent, since a position is one hidden vector and six output rows in every case. The first row is the setting section 14 found necessary and the second is the setting that got the subject wrong."
                />
                <p>
                  In seconds on one machine the ratios come out at roughly three
                  thousand to one between the first row and the last, and roughly a
                  hundred and fifty to one between the third row and the last. The
                  panel in the next section carries the current figures, and they
                  move a little from run to run, which is the reason to trust the
                  position counts above rather than the clocks.
                </p>
                <KeepInMind>
                  The cost of this method is not paid at fitting time, which is
                  where anybody would look for it. It is paid every time a text
                  arrives afterwards, for as long as the model is in use.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Averaging the words separates the subjects better here">
                <p>
                  The comparison that matters is not which method has the higher
                  average similarity inside a subject, since that can be raised by
                  making everything more alike. It is the margin between the least
                  alike pair from one subject and the most alike pair across the
                  two, because a positive margin means the two groups do not
                  overlap at all and a negative one means they do.
                </p>
                <p>
                  On that measure the learned positions lose. Under distributed
                  memory the least alike pair inside one subject scores 0.6364 and
                  the most alike pair across the two scores 0.7204, a margin of
                  &minus;0.0840; under the bag of words the figures are 0.4552 and
                  0.4994, a margin of &minus;0.0442. The average of a
                  document&rsquo;s word positions gives 0.9935 and 0.1552, a margin
                  of +0.8383, so its two groups are cleanly apart where neither
                  learned rule&rsquo;s are.
                </p>
                <ParagraphAgainstAveraging />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Each bar runs from the least alike pair inside one subject to the
                  most alike pair across the two, so a bar is green where the two
                  have not crossed. Two of the three are red, and they are the two
                  that were fitted.
                </p>
                <p>
                  The held-out text tells the same story. Averaging places it at
                  0.9996 to the cooking documents and 0.1336 to the sailing ones,
                  which is better than the 0.9081 and 0.1405 that two hundred
                  passes of descent reach, and it does it in eight additions
                  against 1,600 positions. Some of that advantage is borrowed,
                  since the word table being averaged is the one this
                  method&rsquo;s own fit produced, so averaging is getting the fit
                  for free and paying only for the composition.
                </p>
                <KeepInMind>
                  This corpus makes averaging a strong baseline. Each topic has its own disjoint word list, so every word identifies which group supplied the document. A learned document vector has little extra structure to recover. We should keep that favourable setup in mind before extending the comparison to ordinary documents.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The one thing averaging cannot do, against its own noise">
                <p>
                  So what is the learned position for? The claim to test is the one
                  Part 1 set up, which is that a sum over words cannot tell two
                  arrangements of the same words apart and this method might. Under
                  distributed memory the window really does read which words stood
                  beside which, so a different arrangement is a different set of
                  contexts and could produce a different answer.
                </p>
                <p>
                  Testing it needs a control, because this method&rsquo;s answers
                  differ from run to run anyway. So the same eight words are
                  inferred in two arrangements from one starting draw, and the same
                  arrangement is inferred from two different starting draws, and
                  the question is whether the order moved the answer more than the
                  draw did.
                </p>
                <ParagraphOrderProbe />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The grey band is the control, which is how far apart two starting
                  draws of one arrangement come out, and the dot is how far apart
                  two arrangements come out. Only where the dot is well to the left
                  of the band did the order do anything.
                </p>
                <>
<p>
                  One row of five passes the test. Under distributed memory at two hundred passes the two arrangements agree to 0.8548 while two starting draws of one arrangement agree to 0.9823 and 0.9905, so the two arrangements are about three times further apart in angle than two draws of one arrangement are. At twenty passes the same comparison reads 0.9874 against 0.6076, which is the opposite verdict, because the descent has not gone far enough for anything but the starting point to matter.
                </p>
                <p>
                  The bag of words gives 0.9996 and 0.9998 at the two lengths, reading no order at all, and the average gives exactly one.
                </p>
</>
                <NumberTable
                  headings={[
                    "rule",
                    "two arrangements",
                    "two starting draws",
                    "did the order do anything",
                  ]}
                  rows={[
                    ["distributed memory, 20 passes", "0.9874", "0.6076", "no"],
                    ["distributed memory, 200 passes", "0.8548", "0.9823", "yes"],
                    ["distributed bag of words, 20 passes", "0.9996", "0.9887", "no"],
                    ["distributed bag of words, 200 passes", "0.9998", "0.9984", "no"],
                    ["the average of its word positions", "1.0000", "exact", "no"],
                  ]}
                  caption="A rule reads the order only where the second column is above the first. One of the five rows manages it, and only once the descent has been given ten times the published number of passes."
                />
                <KeepInMind>
                  The escape from order blindness is real and it is small, and it
                  belongs to one arrangement at a pass count nobody uses by
                  default. It is not the reason to reach for this method on a
                  collection like this one, though it is the only thing here that
                  averaging cannot do in principle.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where Paragraph Vectors Stop Being Defined",
          content: (
            <>
              <SubSection title="20. A held-out position is the answer to an optimisation">
                <p>
                  A fitted document&rsquo;s row was determined jointly with
                  everything else the fit learned, and it is what it is. A held-out
                  text&rsquo;s row is defined as the point that minimises a
                  quantity, and that definition only names a unique answer if the
                  quantity has a unique minimum and the search is run until it gets
                  there. Neither holds. The objective is not convex in the row it
                  is being minimised over, and the search is stopped after a number
                  of passes the caller picks.
                </p>
                <p>
                  So the position of a held-out text is a function of three things
                  rather than one, the text and the starting draw and the number of
                  passes, and the same text really does come back differently. At
                  twenty passes under distributed memory, two starting draws agree
                  to 0.6076, which is a disagreement about the answer and not about
                  its last few digits. At two hundred passes they agree to 0.9823,
                  so more passes narrow the spread without closing it.
                </p>
                <DerivationTable
                  expressionHeading="what could be done about it"
                  reasonHeading="what it costs"
                  rows={[
                    {
                      expression: "fix the starting draw",
                      reason:
                        "Makes the answer a function of the text again, which is what any caller comparing two texts needs. It does not make the answer any less arbitrary, since a different fixed draw is a different set of answers, and it hides the spread rather than removing it.",
                    },
                    {
                      expression: "run several draws and combine them",
                      reason:
                        "Turns the spread into something that can be reported, and multiplies the cost of placing one text by the number of runs, which section 17 already found to be the expensive half of the method.",
                    },
                    {
                      expression: "run until the movement is small",
                      reason:
                        "Replaces a chosen pass count with a chosen tolerance, which is the honest form of the same decision. It also runs into section 15, where the objective keeps improving past the point where the answer stopped being useful.",
                    },
                    {
                      expression: "accept the spread and quote it",
                      reason:
                        "Costs nothing and is the only option that does not pretend. It means a similarity between two held-out texts is a number with a spread attached, which anything downstream then has to be willing to read.",
                    },
                  ]}
                />
                <KeepInMind>
                  Comparing two held-out positions is only meaningful when both
                  were produced the same way, from the same fitted tables, the same
                  pass count and the same choice about the starting draw. That is a
                  stronger condition than a table lookup ever imposes.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The table means two different things">
                <>
<p>
                  Both arrangements answer with a word table and a document table of the same shapes, and the two word tables do not mean the same thing. Under distributed memory a word&rsquo;s row was trained against the same objective the documents were, so a document and a word live in one space and the angle between them is a quantity the fit actually pushed on.
                </p>
                <p>
                  Under the plain bag of words a word&rsquo;s row was never touched, so the angle between a document and a word is the angle between something learned and something drawn at random.
                </p>
</>
                <p>
                  Nothing in the shape of the answer records which of those it is.
                  Two tables of twenty rows by eight numbers arrive, and only a
                  reader who knows how they were made can tell that one of them is
                  the initialisation. Measured here, the untouched rows give butter
                  and garlic a cosine of 0.4206 and butter and anchor
                  &minus;0.2104, both of which are perfectly plausible-looking
                  numbers.
                </p>
                <KeepInMind>
                  A representation is only defined together with the procedure that
                  produced it. Here two procedures produce the same shaped answer
                  and one of the two halves of it is meaningless, which no
                  inspection of the numbers reveals.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. The table grows with the collection, and nothing says what a document is">
                <p>
                  A word table has one row per word, and a vocabulary saturates, so
                  a table fitted to ten times as much text of the same language is
                  not ten times larger. A document table has one row per document
                  and grows without limit, so the size of what has been learned is
                  a function of how much text was shown rather than of the language
                  it was in. Here the document table is already 240 numbers against
                  the word table&rsquo;s 160, on thirty documents of eight words.
                </p>
                <p>
                  Worse for the definition, nothing in the objective says where one
                  document ends and the next begins. The method gives a row to each
                  text it is handed, so the same corpus divided into paragraphs
                  instead of articles is a different model with a different number
                  of rows and different positions, and the division is a modelling
                  choice made before the fit that the fit itself never sees. A word
                  boundary is at least a fact about the text.
                </p>
                <KeepInMind>
                  The unit of a document is an input to this method rather than
                  something it discovers, and the answer depends on it. Two people
                  who chunk the same corpus differently have fitted two models
                  whose positions cannot be compared.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Documents that supply no useful training signal" id="23-the-cases-with-nothing-to-descend-on">
                <p>
                  The four cases below leave the inference procedure without a required quantity or require an explicit policy. Check which part of the calculation fails before deciding how the implementation should respond.
                </p>
                <DerivationTable
                  expressionHeading="Document or vocabulary evidence"
                  reasonHeading="Whether a useful position can be inferred"
                  rows={[
                    {
                      expression:
                        "a held-out text using no word the collection used",
                      reason:
                        "The sum being minimised is over the text's positions and the text has none the model can read, so the objective is the empty sum and its gradient is zero everywhere. Every point is a minimiser, and the descent moves nothing. Measured here the answer comes back at the length of a fresh random draw, 0.11516, and points wherever that draw pointed. Answering the origin instead would be worse, since a position of length zero has no direction and cannot be compared with anything at all.",
                    },
                    {
                      expression: "a vocabulary of one word",
                      reason:
                        "The objective raises the score of the word that is there and lowers the score of words drawn as wrong answers, and with one word in the vocabulary there is no wrong answer to draw. What is left has no maximum, since the score of the only word can be raised without limit and nothing pushes back. Two words is the smallest vocabulary on which the quantity exists.",
                    },
                    {
                      expression: "a document of one word, averaged in",
                      reason:
                        "The window on either side is empty, so the mean is over the document's row alone and the first arrangement collapses exactly onto the second for that position. Nothing is undefined and no position needs skipping, which is worth stating because the natural reading of an average over a bag is that an empty bag has no mean.",
                    },
                    {
                      expression:
                        "two documents holding exactly the same words",
                      reason:
                        "They present the objective with the same problem, so they have the same minimisers, and yet their rows are two different rows walked from two different starting draws against two different sequences of wrong answers. They are not obliged to coincide, and the amount by which they differ is the same spread section 20 measured rather than anything about the texts.",
                    },
                  ]}
                />
                <p>
                  Consider a text containing only unknown words. Under the fallback used here, pooling returns a zero vector. Paragraph inference can instead leave an ordinary-length random initial vector when it receives no usable training signal. Neither is a learned description of the text. The second is easier to mistake for one unless we report that inference had no evidence.
                </p>
                <KeepInMind>
                  A method that answers a question by search rather than by formula
                  has no natural way of saying it had nothing to go on, because the
                  search still returns wherever it started. That is the price of
                  the whole approach, and it is paid on exactly the inputs a
                  careful caller most wants warning about.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "If clean separation means the least-similar same-subject pair still exceeds the most-similar cross-subject pair, which comparison and winner follow?",
              [
                              "The margin between the least alike pair inside a subject and the most alike pair across the two, which averaging wins at +0.8383",
                              "The mean similarity inside a subject, which distributed memory wins at 0.8974",
                              "The cost in positions, which the bag of words wins",
                              "The cosine of the held-out text to its own subject, which distributed memory wins",
                            ],
              0,
              "A mean similarity inside a subject can be raised simply by making everything more alike. On the margin the two fitted methods come out at −0.0840 and −0.0442, so their groups overlap, where averaging’s two groups are cleanly apart.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "                         least within  greatest across\ndistributed memory       0.6364        0.7204\ndistributed bag of words 0.4552        0.4994\naveraged word vectors    0.9935        0.1552\n\nDistributed memory’s mean within-cooking cosine is 0.8974.\nThe strict separation margin is least within minus greatest across."
              },
            ),
            choice(
              "The same eight words were inferred in two arrangements and, as a control, from two starting draws. Where did the order move the answer more than the draw did?",
              [
                "Only under distributed memory at two hundred passes, where two arrangements agree to 0.8548 and two draws of one arrangement to 0.9823",
                "Under distributed memory at the published twenty passes",
                "Under both arrangements, once enough passes were run",
                "Nowhere, since every rule on the page is a sum over the words",
              ],
              0,
              "One row of five passes the test. At twenty passes distributed memory reads 0.9874 across two arrangements against 0.6076 across two draws, the opposite verdict, because the descent has not gone far enough for anything but the starting point to matter. The bag of words discards the context and gives 0.9996 and 0.9998, and the average gives exactly one. The escape from order blindness is real, small, and at ten times the published number of passes.",
            ),
            choice(
              "Where is the cost of this method actually paid?",
              [
                "Every time a text arrives afterwards, for as long as the model is in use",
                "Once at fitting time, which is where anybody would look for it",
                "In the size of the output table the fit needs",
                "In the number of words the vocabulary holds",
              ],
              0,
              "A held-out text of eight words at two hundred passes costs 1,600 positions, which is more than six times what one training document contributed to the whole fit and is 22 per cent of the entire fit, for one document out of thirty.",
            ),
            several(
              "Which of these make a held-out position something other than a function of the text alone?",
              [
                              "The starting draw, since two draws agree only to 0.6076 at twenty passes",
                              "The number of passes, which the caller picks",
                              "The word table, which the descent goes on adjusting while it places the text",
                              "The order of the text’s own words, which both arrangements read",
                            ],
              [0, 1],
              "A finite optimisation run can depend on its initial row and the number of passes. The measured starting-draw comparison demonstrates that dependence here. The word table is frozen during inference, and the bag-of-words variant cannot use word order. None of this requires assuming that every document-inference objective is non-convex.",
              {
                "description": "Infer a new document row while keeping the learned word and output tables frozen. The caller chooses a starting draw and a finite pass budget. In distributed memory, two starting draws give inferred-vector cosine 0.6076 at 20 passes and 0.9823 at 200. Distributed bag of words discards the order of words."
              },
            ),
            trueFalse(
              "A text of entirely unknown words comes back from this method with a position of ordinary length.",
              true,
              "The objective is an empty sum whose gradient is zero everywhere, so the search returns wherever it started, at the 0.11516 of a fresh random draw. That is a random direction, which is confidently something, where pooling the same text gives the origin, which is honestly nothing. The random direction is the harder mistake to notice, and it arrives on exactly the inputs a careful caller most wants warning about.",
            ),
        ],
        },
        {
          title: "Practice. Placing The Held-Out Texts With The Library",
          practice: [
            exercise(
              "Fit the thirty documents under both arrangements",
              [
  "Fit the supplied thirty documents with DISTRIBUTED_MEMORY and DISTRIBUTED_BAG_OF_WORDS using the stated width eight, window three, thirty passes, rate 0.1, seed zero and minimum count one.",
  "For each print mean cosine among cooking-document pairs, among sailing-document pairs and across topics. The first fifteen documents are cooking."
],
              `from itertools import combinations
from statistics import mean

import numpy as np
from oop_ml import ParagraphArchitecture, ParagraphVectors

COOKING = "simmer onion garlic butter saucepan whisk flour season ladle broth".split()
SAILING = "mainsail rudder harbour anchor keel tide starboard rigging mooring gust".split()

generator = np.random.default_rng(7)
documents = []
for words in (COOKING, SAILING):
    for _ in range(15):
        documents.append(" ".join(generator.choice(words, 8)))

for architecture in ParagraphArchitecture:
    # Fit ParagraphVectors with this architecture and the settings in the task.

    # fitted: the model's document vectors, one per training document.

    # Mean similarity over pairs inside the first fifteen, inside the last
    # fifteen, and over pairs with one document from each.

    # Print the architecture's name and the three means.
    pass`,
              `from itertools import combinations
from statistics import mean

import numpy as np
from oop_ml import ParagraphArchitecture, ParagraphVectors

COOKING = "simmer onion garlic butter saucepan whisk flour season ladle broth".split()
SAILING = "mainsail rudder harbour anchor keel tide starboard rigging mooring gust".split()

generator = np.random.default_rng(7)
documents = []
for words in (COOKING, SAILING):
    for _ in range(15):
        documents.append(" ".join(generator.choice(words, 8)))

for architecture in ParagraphArchitecture:
    model = ParagraphVectors(
        dimension=8, window=3, epochs=30, learning_rate=0.1,
        random_seed=0, architecture=architecture, minimum_count=1,
    ).fit(documents)
    fitted = model.document_vectors
    cooking = mean(fitted.similarity(a, b) for a, b in combinations(range(15), 2))
    sailing = mean(fitted.similarity(a, b) for a, b in combinations(range(15, 30), 2))
    across = mean(fitted.similarity(a, b) for a in range(15) for b in range(15, 30))
    print(architecture.name)
    print(f"  two cooking {cooking:.4f}   two sailing {sailing:.4f}   one of each {across:.4f}")`,
              `DISTRIBUTED_MEMORY
  two cooking 0.8974   two sailing 0.8696   one of each 0.2811
DISTRIBUTED_BAG_OF_WORDS
  two cooking 0.7763   two sailing 0.8078   one of each 0.1445`,
              { hints: [
  "Use each distinct same-topic pair once; exclude self-pairs.",
  "Compare cross-topic similarity with both within-topic means rather than assuming its useful reference must be zero."
], check: numberCheck("Under distributed memory, what is the mean cosine between a cooking document and a sailing one, to four places?", 0.2811, 5e-05, "The distributed-memory cross-topic mean is 0.2811. Its significance comes from comparison with the two within-topic means, not from closeness to zero alone."), question: "Do the two paragraph-vector objectives separate the supplied document topics?" },
            ),
            exercise(
              "Give the held-out cooking text twenty passes, then two hundred",
              [
  "Use distributed memory with the supplied settings and compare inference_epochs=20 with 200 on the held-out cooking text.",
  "For each print mean cosine to the fifteen cooking and fifteen sailing training documents and the zero-based indices of its five nearest documents. Indices from fifteen onward refer to sailing documents."
],
              `import numpy as np
from oop_ml import ParagraphVectors, cosine_similarity

COOKING = "simmer onion garlic butter saucepan whisk flour season ladle broth".split()
SAILING = "mainsail rudder harbour anchor keel tide starboard rigging mooring gust".split()

generator = np.random.default_rng(7)
documents = []
for words in (COOKING, SAILING):
    for _ in range(15):
        documents.append(" ".join(generator.choice(words, 8)))

text = "butter garlic onion simmer broth whisk flour ladle"

for passes in (20, 200):
    # Fit ParagraphVectors as in the first problem, with inference_epochs=passes.

    # vector: the position the model infers for the text.

    # table: the fitted document vectors as an array, one row per document.

    # Mean cosine from vector to the first fifteen rows, and to the last fifteen.

    # Print the passes, the two means, and the five nearest documents.
    pass`,
              `import numpy as np
from oop_ml import ParagraphVectors, cosine_similarity

COOKING = "simmer onion garlic butter saucepan whisk flour season ladle broth".split()
SAILING = "mainsail rudder harbour anchor keel tide starboard rigging mooring gust".split()

generator = np.random.default_rng(7)
documents = []
for words in (COOKING, SAILING):
    for _ in range(15):
        documents.append(" ".join(generator.choice(words, 8)))

text = "butter garlic onion simmer broth whisk flour ladle"

for passes in (20, 200):
    model = ParagraphVectors(
        dimension=8, window=3, epochs=30, learning_rate=0.1,
        inference_epochs=passes, random_seed=0, minimum_count=1,
    ).fit(documents)
    vector = model.infer_vector(text)
    table = np.asarray(model.document_vectors.vectors)
    to_cooking = np.mean([cosine_similarity(vector, row) for row in table[:15]])
    to_sailing = np.mean([cosine_similarity(vector, row) for row in table[15:]])
    nearest = list(model.document_vectors.similar_to_vector(vector, 5))
    print(f"{passes:3d} passes: to cooking {to_cooking:.4f}   to sailing {to_sailing:.4f}   nearest {nearest}")`,
              ` 20 passes: to cooking 0.4786   to sailing 0.7608   nearest [26, 28, 22, 16, 23]
200 passes: to cooking 0.9081   to sailing 0.1405   nearest [10, 1, 3, 9, 0]`,
              { hints: [
  "Training a document table and optimising a vector for new text are separate procedures.",
  "Keep the source collection/settings fixed while changing the new-text inference budget."
], check: numberCheck("At twenty passes, what is the mean cosine from the held-out cooking text to the cooking documents, to four places?", 0.4786, 5e-05, "At twenty inference passes the cooking-reference mean is 0.4786, lower than its sailing-reference mean. The new-text optimisation budget affects this placement."), question: "Can too few inference steps misplace an otherwise familiar-topic paragraph?" },
            ),
            exercise(
              "Place the sailing text, and see what twenty passes was reading",
              [
  "Infer both supplied cooking and sailing probes at twenty and two hundred inference passes under the stated distributed-memory setup.",
  "For every probe/budget pair print both topic mean cosines and five nearest document indices. Compare the actual neighbour lists as well as whether their labels appear plausible."
],
              `import numpy as np
from oop_ml import ParagraphVectors, cosine_similarity

COOKING = "simmer onion garlic butter saucepan whisk flour season ladle broth".split()
SAILING = "mainsail rudder harbour anchor keel tide starboard rigging mooring gust".split()

generator = np.random.default_rng(7)
documents = []
for words in (COOKING, SAILING):
    for _ in range(15):
        documents.append(" ".join(generator.choice(words, 8)))

texts = {
    "cooking": "butter garlic onion simmer broth whisk flour ladle",
    "sailing": "anchor tide rudder harbour keel gust mooring mainsail",
}

for passes in (20, 200):
    # Fit as in the second problem, with inference_epochs=passes.

    for name, text in texts.items():
        # Infer the text's position and compute the two means and the five
        # nearest documents exactly as before.

        # Print the passes, the text's name, the two means and the nearest five.
        pass`,
              `import numpy as np
from oop_ml import ParagraphVectors, cosine_similarity

COOKING = "simmer onion garlic butter saucepan whisk flour season ladle broth".split()
SAILING = "mainsail rudder harbour anchor keel tide starboard rigging mooring gust".split()

generator = np.random.default_rng(7)
documents = []
for words in (COOKING, SAILING):
    for _ in range(15):
        documents.append(" ".join(generator.choice(words, 8)))

texts = {
    "cooking": "butter garlic onion simmer broth whisk flour ladle",
    "sailing": "anchor tide rudder harbour keel gust mooring mainsail",
}

for passes in (20, 200):
    model = ParagraphVectors(
        dimension=8, window=3, epochs=30, learning_rate=0.1,
        inference_epochs=passes, random_seed=0, minimum_count=1,
    ).fit(documents)
    table = np.asarray(model.document_vectors.vectors)
    for name, text in texts.items():
        vector = model.infer_vector(text)
        to_cooking = np.mean([cosine_similarity(vector, row) for row in table[:15]])
        to_sailing = np.mean([cosine_similarity(vector, row) for row in table[15:]])
        nearest = list(model.document_vectors.similar_to_vector(vector, 5))
        print(f"{passes:3d} passes, {name} text: to cooking {to_cooking:.4f}   to sailing {to_sailing:.4f}   nearest {nearest}")`,
              ` 20 passes, cooking text: to cooking 0.4786   to sailing 0.7608   nearest [26, 28, 22, 16, 23]
 20 passes, sailing text: to cooking 0.3339   to sailing 0.6671   nearest [26, 28, 22, 16, 23]
200 passes, cooking text: to cooking 0.9081   to sailing 0.1405   nearest [10, 1, 3, 9, 0]
200 passes, sailing text: to cooking 0.2827   to sailing 0.9025   nearest [16, 20, 19, 28, 22]`,
              { hints: [
  "A correctly labelled topic on one probe can hide a common initial placement shared by unrelated probes.",
  "Use the document-index/topic mapping from the supplied collection for both probes."
], check: numberCheck("At two hundred passes, what is the mean cosine from the held-out sailing text to the sailing documents, to four places?", 0.9025, 5e-05, "With two hundred passes, the sailing-reference mean is 0.9025. Comparing both probes reveals whether their neighbours reflect text content rather than a shared early inference state."), question: "Do two different new texts really get different neighbours after short inference?" },
            ),
          ],
        },
      ]}
    />
  );
}
