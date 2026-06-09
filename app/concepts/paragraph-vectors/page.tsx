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
import { ParagraphAgainstAveraging } from "@/components/widgets/ParagraphAgainstAveraging";
import { ParagraphDocumentMap } from "@/components/widgets/ParagraphDocumentMap";
import { ParagraphInferenceCurve } from "@/components/widgets/ParagraphInferenceCurve";
import { ParagraphOrderProbe } from "@/components/widgets/ParagraphOrderProbe";
import { ParagraphRowLengths } from "@/components/widgets/ParagraphRowLengths";
import { ParagraphVectorWorkbench } from "@/components/widgets/ParagraphVectorWorkbench";

export const metadata: Metadata = {
  title: "Paragraph Vectors · oop_ml",
  description:
    "Give a whole text a coordinate of its own and learn it alongside the words, then measure what a text the fit never saw costs to place.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function ParagraphVectorsPage() {
  return (
    <ConceptPage
      title="Paragraph Vectors"
      tagline="Paragraph vectors give a whole text a coordinate of its own and train it by the same predict-a-neighbour objective the words are trained by, so the text learns whatever helps predict its own words."
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
      history={
        <>
          <p>
            Quoc Le and Tomáš Mikolov published &ldquo;Distributed
            Representations of Sentences and Documents&rdquo; at the
            International Conference on Machine Learning in 2014, and the problem
            they set out in its first page is a narrow one. A text written as
            counts over a vocabulary loses the order of its words entirely, and,
            worse for them, it makes every pair of distinct words equally
            unrelated, so that a text about powerful and a text about strong have
            nothing in common at all under that description. Mikolov had spent
            the previous year at Google showing that a word could be given a
            position by asking it to help predict its neighbours, which fixed the
            second half of that complaint for single words, and the question left
            over was what to do with a text.
          </p>
          <p>
            Their answer was to change almost nothing. Treat the document as one
            more token, present at every window inside it and at no window
            outside it, and let the same loop learn a row for it alongside the
            rows for the words. Their phrase for the paragraph vector was another
            word that acts as a memory, and the two arrangements they described
            are the two this page measures, one in which the document is averaged
            in with the surrounding words to predict the centre one, and one in
            which the document is asked to predict a word of its own on its own.
            They reported results on the Stanford Sentiment Treebank and on a
            large collection of film reviews that were the best on those tasks at
            the time, and they recommended the first arrangement.
          </p>
          <p>
            What happened next is worth knowing before reading any of the numbers
            below. The implementation most people met the method through calls it
            doc2vec, and that has become the commoner name. Jey Han Lau and
            Timothy Baldwin, at the University of Melbourne, published &ldquo;An
            Empirical Evaluation of doc2vec with Practical Insights into Document
            Embedding Generation&rdquo; in 2016, having found the original
            results hard to reproduce, and among their conclusions was that the
            second arrangement, the one the paper had not recommended, was
            usually both better and cheaper. Every architecture comparison on
            this page lands on the same side of that question, which is a small
            piece of evidence and not a replication. The five questions worked
            through here, in order, are these. What can averaging a text&rsquo;s
            words never say? What does the document&rsquo;s own row learn, and
            from what? What do the two arrangements each do with that row? Why
            does a text the fit never saw have to be searched for rather than
            looked up, and how long does that search take? And where does the
            method stop being defined at all?
          </p>
        </>
      }
      playground={<ParagraphVectorWorkbench />}
      sections={[
        {
          title: "Part 1. What Averaging A Text Cannot Do",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. The collection every number here comes from">
                <p>
                  A position for a text has to be learned from usage, so nothing
                  on this page can be shown on a single sentence, and every
                  number below comes from one collection of thirty short
                  documents. Fifteen of them are about cooking and fifteen about
                  sailing, each eight words long, and each drawn with replacement
                  from a list of ten words about its own subject. The two lists
                  share no word at all, so twenty words in two hundred and forty
                  occurrences is the whole of it.
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
          ),
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

              <SubSection title="5. One position, worked all the way through">
                <p>
                  Take one position of one document at a width of three, so the
                  arithmetic fits on a line. The document&rsquo;s row is (0.2,
                  &minus;0.1, 0.4) and the one context word&rsquo;s row is (0,
                  0.3, &minus;0.2), and the vector the prediction is made from is
                  the mean of those two.
                </p>
                <Equation>
                  {"h  =  ( d  +  ∑ v(c) )  /  ( 1 + n )     over the n context words"}
                </Equation>
                <WorkedExample title="One position of one document">
                  <p>
                    The mean of (0.2, &minus;0.1, 0.4) and (0, 0.3, &minus;0.2) is
                    (0.1, 0.1, 0.1). Suppose the row for the word actually there
                    is (1, 0, 0) and the row for the one wrong word drawn against
                    it is (0, 1, 0), so both scores come out at 0.1 and both
                    probabilities at 0.524979. The right answer wanted a one and
                    got 0.524979, so its error is &minus;0.475021; the wrong
                    answer wanted a zero and got the same 0.524979, so its error
                    is +0.524979. Reading those back onto the coordinates gives a
                    gradient of (&minus;0.475021, 0.524979, 0).
                  </p>
                  <p>
                    That gradient is with respect to the mean, and the mean was
                    over two rows, so each row is answerable for half of it. At a
                    step size of 0.025 the step every averaged row takes is the
                    same vector, (0.005938, &minus;0.006562, 0), added to the
                    document&rsquo;s row and to the context word&rsquo;s row
                    alike.
                  </p>
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
                  It is worth being precise about what the objective actually
                  rewards, since the phrase about a row learning the subject of a
                  document is a description of an outcome rather than of a
                  mechanism. What is rewarded is raising the score of the words
                  that really are in the document and lowering the score of a
                  handful of words drawn at random, at every one of that
                  document&rsquo;s eight positions.
                </p>
                <p>
                  A row that leaned towards one cooking word and away from
                  everything else would do well at one position and badly at seven,
                  so the only row that does well across all eight is one that
                  leans towards all eight words at once. Here the eight words are
                  drawn from a list of ten, and any two cooking documents are
                  drawing from the same ten, so the rows that serve two cooking
                  documents well are similar rows. That is the whole of why the
                  fitted positions come out separated by subject, and it depends
                  on the collection having a structure of that kind rather than on
                  anything in the method.
                </p>
                <WhyThisWorks>
                  <p>
                    An untrained pair costs a fixed amount that can be worked out
                    in advance. The output table starts at zero, so every score is
                    zero and every probability is a half, and a half costs the
                    logarithm of two whichever side it was wanted on. Each
                    position is scored against the right word and five drawn wrong
                    ones, so six halves at log 2 each gives 6 log 2 = 4.1589, and
                    the first pass over the collection comes in at 4.1529, just
                    below it, because the rows begin to move inside the first pass
                    rather than waiting for the end of it.
                  </p>
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
                <p>
                  Measured, that is exactly what it looks like. Under distributed
                  memory butter and garlic reach a cosine of 0.994 against 0.120
                  for butter and anchor, which is the separation of the two lists
                  showing up in the words as well as the documents. Under the plain
                  bag of words the same two pairs read 0.4206 and &minus;0.2104,
                  which are the values two random draws happen to have and mean
                  nothing whatever. Adding an ordinary word pair alongside each
                  document pair, which is the usual repair, brings them back to
                  0.9666 and 0.0965 in a third of the passes.
                </p>
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
                  Every number above comes from thirty passes at a step size of
                  0.1, and it is worth saying plainly why, since those are not the
                  settings the published work uses. At the reference settings of
                  ten passes from a step size of 0.025, this collection offers
                  2,400 positions in total, which is not enough movement to get
                  anywhere. The cost falls from 4.1586 to 4.1155, barely off the
                  4.1589 an untrained pair costs.
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
                  Pooling a text is a calculation with one answer. Placing a text
                  here is a search with a starting point, and a search that is
                  stopped early has not merely lost accuracy, as sections 14 and
                  20 both show in different ways.
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
                  with. The objective being minimised falls monotonically with
                  passes, since that is what descent does, and the quantity anybody
                  actually wanted turns and comes back down, which is the same
                  disagreement the word2vec page finds between the cost of a
                  training pair and the separation of two word lists.
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
                  On a collection whose subjects are made of disjoint word lists,
                  averaging the words is close to the ideal method, since which
                  list a document drew from is the only fact there is and every
                  word announces it. That is the case where a learned position has
                  nothing to add, and it is worth knowing that it is also the case
                  most easily built for a teaching page.
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
                <p>
                  One row of five passes the test. Under distributed memory at two
                  hundred passes the two arrangements agree to 0.8548 while two
                  starting draws of one arrangement agree to 0.9823 and 0.9905, so
                  the two arrangements are about three times further apart in angle
                  than two draws of one arrangement are.
                  At twenty passes the same comparison reads 0.9874 against 0.6076,
                  which is the opposite verdict, because the descent has not gone
                  far enough for anything but the starting point to matter. The bag
                  of words gives 0.9996 and 0.9998 at the two lengths, reading no
                  order at all, and the average gives exactly one.
                </p>
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
                <p>
                  Both arrangements answer with a word table and a document table
                  of the same shapes, and the two word tables do not mean the same
                  thing. Under distributed memory a word&rsquo;s row was trained
                  against the same objective the documents were, so a document and
                  a word live in one space and the angle between them is a quantity
                  the fit actually pushed on. Under the plain bag of words a
                  word&rsquo;s row was never touched, so the angle between a
                  document and a word is the angle between something learned and
                  something drawn at random.
                </p>
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

              <SubSection title="23. The cases with nothing to descend on">
                <p>
                  Four inputs make the placement undefined rather than merely
                  awkward, and in each one it is worth knowing which quantity fails
                  and why, since each is a decision anybody implementing the method
                  has to make.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the mathematics says"
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
                  The first of those is the one that arises in ordinary use rather
                  than in a constructed example, and it is worth contrasting with
                  the pooled answer to the same input. Pooling a text of unknown
                  words gives the origin, which is honestly nothing; this gives a
                  random direction of ordinary length, which is confidently
                  something. Of the two, the second is the harder mistake to
                  notice.
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
      ]}
    />
  );
}
