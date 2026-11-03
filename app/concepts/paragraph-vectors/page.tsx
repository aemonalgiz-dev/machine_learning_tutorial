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
  title: "Paragraph Vectors · Perceptron Lab",
  description:
    "Paragraph vectors learn a representation of a document by using it to help predict its words. The document vector captures information that a fixed average of word vectors may not preserve.",
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
      tagline={"Paragraph vectors learn a representation of a document by using it to help predict its words. The document vector captures information that a fixed average of word vectors may not preserve."}
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
                  {"The two subjects have disjoint vocabulary, making their grouping easy to inspect. That helps diagnose this experiment, but successful training still depends on the architecture, capacity and optimization settings. There is no universal ranking of how gentle every dataset is for a method."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a sum over a text’s words cannot distinguish">
                <p>The pooling lesson combined word vectors into one text vector. Its averages and weighted sums depend on which words occur, while discarding their order. Reordering the same words therefore leaves those pooled representations unchanged. Paragraph-vector training offers a different way to learn a document representation; we will examine what its training objective adds and what it still cannot distinguish.</p>
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
                  {"Pooling these static word vectors discards order. Context-dependent vectors can retain order information before a symmetric pooling step, while paragraph vectors offer another way to learn a document representation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Giving the text a row of its own">
                <p>A document can have its own trainable vector rather than being represented only by an average of word vectors. Its initial values are adjusted to help predict words from that document. The training task determines which information is useful to retain.</p>
                <p>The document vector is learned through optimization. Its individual coordinates do not come with predefined meanings, and a simple pooling formula does not reproduce that learned vector in general. We therefore evaluate what its comparisons preserve and explain how a new document receives a vector after training.</p>
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
              <SubSection title="4. Learning a Shared Document Input" id="4-the-change-of-question">
                <p>
                  {"Le and Mikolov introduced paragraph vectors in 2014. A learned document ID joins the word inputs in a prediction task, providing a parameter row shared across positions in that document. The row can retain information useful across those contexts, so the document representation is learned rather than fixed by an averaging rule."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://proceedings.mlr.press/v32/le14.pdf">{"Le and Mikolov: Distributed Representations of Sentences and Documents (2014)"}</Link></p>
                <p>A document vector is encouraged to retain information that helps predict its words. Shared subject matter is one possible source of that information, which motivates the topic comparison in this controlled collection. The objective does not guarantee a complete description of a document&apos;s meaning.</p>
                <Equation>
                  {"a document  =  a token present at every window inside it, and no other"}
                </Equation>
                <KeepInMind>
                  {"This SDK uses a negative-sampling objective related to word2vec and adds document rows. Distributed memory also uses local word inputs; distributed bag of words can use the document row alone. The original paper’s softmax and concatenation settings differ from some choices measured here."}
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
                  {"At this position, the document row and the context-word row receive equal gradient shares. Across the corpus they participate in different sets of updates. Their final sizes depend on those gradients and update histories, rather than update count alone."}
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
                  {"A document row receives training signals from all its positions. Shared word distributions can therefore encourage similar document representations. Neither the objective nor this toy construction proves a unique vector that must point toward every observed word."}
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
                  {"In this distributed-memory variant, input word rows are trained when they occur in a context. A one-word document has no context-word row to update at that position."}
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
                  {"Here the full hidden gradient updates the document row, rather than being divided among averaged inputs. The hidden vector and resulting scores also change. Differences later in the experiment therefore cannot be attributed to that divisor alone."}
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
                  {"Both models give positive mean cross-topic cosine in this run. A shared output table does not require that sign. Evaluate separation and retrieval under a consistent criterion instead of treating zero as an intrinsic boundary between related and unrelated documents."}
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
                  {"Compare the within-topic and cross-topic results for the task. Their sign alone is not a semantic verdict, and a shared output table does not guarantee one sign."}
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Why the bag of words learns no word vectors at all">
                <p>
                  {"In this SDK’s plain distributed-bag-of-words mode, input word rows are not used or updated. The document and output rows are trained instead. The exported input table therefore remains its random initialization unless extra word-pair training is enabled."}
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
                  {"Check whether an exported table was trained before using it. The plain bag-of-words mode leaves this SDK’s input word table random, while the output rows do receive updates. Optional word-pair training changes that distinction."}
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
                  {"At the SDK’s weaker reference settings, this run has made little progress on topic separation. Report the stronger settings used for the later measurements. A default pass count and learning rate require evaluation on the supplied data; their names do not establish convergence."}
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
              "An order-independent weighted average uses the same terms and denominator after a permutation, so it cannot represent word order. The measured cosine of 1.0000 confirms the same direction in this example; cosine alone would not prove identical vector lengths. An order-aware model must use position or context in a way that can change the representation when words move.",
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
              "Give each training document its own parameter row and use that row in predicting the document's words. Prediction errors can then update the document row alongside the relevant word parameters. The document vector is learned through this objective rather than obtained by a fixed average. Its finite-training result can depend on initialization and optimization settings.",
            ),
            trueFalse(
              "At the reference settings of ten passes from a step size of 0.025, the fit still separates the two subjects, only less sharply.",
              false,
              "The reported within-topic mean is 0.0330 and the cross-topic mean is 0.0437, so these means do not show the desired separation. The cost changes from 4.1586 to 4.1155 over ten passes. The fit has made updates, but they have not produced useful topic separation by this measure. The later comparisons use thirty passes at initial learning rate 0.1; that is an experimental choice, not a guarantee for other data.",
            ),
            choice(
              "Two documents about different subjects come out at a cosine of 0.2811 under distributed memory. How should that be read?",
              [
                "Compare it with the within-topic means 0.8974 and 0.8696; a positive cross-topic cosine alone does not establish failure",
                "As a failure, since two unrelated things ought to come out near zero or below it",
                "As evidence that the two word lists overlap after all",
                "As the level of noise left by the random start",
              ],
              0,
              "A positive cross-topic cosine does not by itself show failure. Compare 0.2811 with the distributed-memory means of 0.8974 within cooking and 0.8696 within sailing. Those values show separation on average for this collection. Shared output parameters can encourage common structure, but they do not mathematically force every document vector to have the same component.",
            ),
            trueFalse(
              "The word table the plain bag of words hands back at the end of a fit is the random draw it was given at the start.",
              true,
              "In this distributed-bag-of-words implementation, the document row predicts words and training updates that row and the output table. The separate input word table is not used by this objective and remains at initialization. Its reported cosines of 0.4206 and −0.2104 are therefore not evidence of learned word relationships. The document vectors, which are trained, must be evaluated separately.",
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
                  {"For a new text, initialize one document vector and freeze the fitted word and output tables. Run updates using that text’s recognized words. The finite result depends on the inference settings; the argmin below describes an optimization target, not a guarantee that the chosen pass count attains it."}
                </p>
                <Equation>
                  {"d*  =  argmin over d of  ∑ loss( word, d )     every table held fixed"}
                </Equation>
                <p>

                  Two things follow immediately and both matter. The answer is
                  gradient descent, so it depends on where it started and on how
                  long it was allowed to run, and the cost of placing one text is
                  no longer a table lookup but an optimization whose length the
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
                  {"Update frequency helps explain which rows receive evidence, but does not determine their traveled distance or final norm. Read the measured row lengths as part of this fitted example, alongside the gradients and inference behavior."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Comparing Inference Pass Counts" id="14-the-published-twenty-passes-measured">
                <p>
                  {"This SDK defaults to twenty inference passes. Under distributed memory here, that leaves the held-out cooking text closer on average to sailing documents. The original paper describes inferring with the trained network fixed until convergence; it does not establish twenty as a universal required pass count. Compare the sweep below to see when this particular classification changes."}
                </p>
                <ParagraphInferenceCurve />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {"The curve compares the held-out text’s similarity with both document groups over inference passes. The marked twenty-pass setting falls before the distributed-memory curves cross in this example. Under the bag-of-words variant, the cooking similarity is higher from the first displayed pass."}
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
                  caption="The SDK’s twenty-pass reference falls before the observed crossing. Fifty is the first tested count with the correct topic ordering, not an exact minimum pass requirement."
                />
                <KeepInMind>
                  {"Check inference convergence and task behavior before accepting the default pass count. Here the twenty-pass result is misleading under the chosen topic check, even though it returns an ordinary-looking vector."}
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
                  {"After twenty passes in this bag-of-words run, similarity to the cooking group decreases while similarity to sailing also decreases. The optimization uses the held-out text’s particular words, rather than directly optimizing the topic comparison. Inspect both curves and the fitting objective before deciding when to stop."}
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
                  curve and the held-out behavior separately.
                </InAModel>
                <KeepInMind>
                  {"The two architectures have different inference trajectories in this experiment. Select a stopping procedure using representative development texts, rather than assuming one fixed pass count will work equally well for both."}
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
                "A row is interpolated between the two subject centers",
              ],
              0,
              "A new text has no stored document row. Keep the trained word parameters fixed, initialize a new row, and update it to improve predictions of that text's words. This is gradient-based inference rather than a table lookup. The result can depend on its starting row, learning rate and number of passes.",
            ),
            trueFalse(
              "After the fit under distributed memory the word rows are nearly six times as long as the document rows.",
              true,
              "The reported mean word-row norm is 2.2348, compared with 0.3897 for document rows. Word parameters are shared across documents, so they can receive many more updates than any one document row. Update count alone does not determine the final norm: gradient directions, magnitudes and initialization also matter. A row's length is not a counter of how often it was trained.",
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
              "At twenty inference passes, the cooking probe is closer on average to the sailing documents. At fifty passes its cooking and sailing means are 0.8347 and 0.3303; at two hundred they are 0.9081 and 0.1405. The early result still looks like an ordinary vector and neighbor list. Comparing with known-topic probes reveals the error more clearly than inspecting whether inference returned a value.",
            ),
            trueFalse(
              "Under the bag of words, running more passes on a held-out text keeps improving its cosine to its own subject.",
              false,
              "In this recorded bag-of-words run, cosine to cooking documents falls from 0.8565 at twenty passes to 0.7665 at two hundred, then to 0.6954 at four hundred. Its sailing cosine also falls from 0.1420 to 0.0924 over the first comparison. The fitting objective and topic similarity measure different things; further optimization need not monotonically improve either the sampled objective on every step or each topic measure. Choose an inference budget using relevant development examples.",
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
                <p>Count the training positions as well as elapsed time. This collection has thirty documents with eight words each, and training makes thirty passes through them. Each position involves the document vector and the relevant output rows. Averaging the existing word vectors processes the words once and has no document-training loop. The two approaches therefore require different work before we even compare their retrieval results.</p>
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
                  {"Position counts describe part of the work without depending on one machine’s clock. They still omit vector width, context size and the number of output comparisons per position, so equal counts need not imply equal runtime."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What one held-out text costs">
                <p>
                  {"The held-out text has eight tokens, giving 1,600 training positions at 200 passes and 160 at 20 passes. Averaging reads its eight word vectors once and combines their coordinates. One vector addition touches every coordinate, so eight additions is not a scalar instruction count."}
                </p>
                <Equation>{"Original training positions = 30 documents × 8 tokens × 30 passes = 7200\nInference positions at 200 passes = 8 × 200 = 1600\nShare of original position count = 1600 / 7200 ≈ 22.2%"}</Equation>
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
                  caption="Counts of target positions visited. Distributed memory also reads and may update several context rows per position; inference freezes those rows. The settings therefore have different per-position work."
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
                  {"Paragraph-vector training has an up-front cost and a further optimization cost for each new document. Cached document vectors can be reused, but a text without a stored vector requires the inference procedure or an alternative encoder."}
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Averaging the words separates the subjects better here">
                <p>
                  {"Use the evaluation that matches the application. This example checks the margin between the least-similar within-topic pair and most-similar cross-topic pair. A positive margin separates those sampled pair scores by one threshold; it does not establish disjoint groups under every geometric or task definition."}
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

                  This corpus makes averaging a strong baseline. Each topic has its own disjoint word list, so every word identifies which group supplied the document. A learned document vector has little extra structure to recover. We should keep that favorable setup in mind before extending the comparison to ordinary documents.
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

                  The gray band is the control, which is how far apart two starting
                  draws of one arrangement come out, and the dot is how far apart
                  two arrangements come out. Only where the dot is well to the left
                  of the band did the order do anything.
                </p>
                <>
<p>
                  {"At200 passes, the reordered and original texts have lower cosine than the two tested starting draws of the same order. That suggests an order effect larger than this initialization control. Compare the reported cosines directly; a ratio of cosine gaps is not a ratio of angles."}
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
                  caption="The order comparison is clearer when its similarity is below the same-order initialization control. In this sweep that occurs for distributed memory at 200 passes. The tested settings do not establish that every other default or architecture is always order-blind."
                />
                <KeepInMind>
                  {"This distributed-memory variant can respond to changes in local context arrangement. The experiment compares that effect with initialization variability. It does not show complete word-order understanding, and contextual vectors followed by pooling provide another way to build order-sensitive summaries."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where Paragraph Vectors Stop Being Defined",
          content: (
            <>
              <SubSection title="20. A held-out position is the answer to an optimization" id="20-a-held-out-position-is-the-answer-to-an-optimisation">
                <p>
                  {"Joint training is nonconvex, but inference with fixed word and output tables is different. For this SDK’s negative-sampling logistic loss, the hidden vector is affine in the new document vector, so the fixed-sample objective is convex in that vector. It may lack a unique finite minimizer, and finite stochastic updates need not reach an optimum. Initialization can therefore still affect the returned result without invoking nonconvex local minima."}
                </p>
                <p>Inferring a held-out document vector depends on the text, the initial random values and how far we run the optimization. At twenty passes under distributed memory, two starting draws agree to 0.6076. That is a substantial difference between the inferred positions. At two hundred passes they agree to 0.9823. More passes reduce the disagreement in this experiment without removing it, so the inference settings belong with the reported result.</p>
                <DerivationTable
                  expressionHeading="what could be done about it"
                  reasonHeading="what it costs"
                  rows={[{"expression":"fix the starting draw","reason":"Makes the answer a function of the text again, which is what any caller comparing two texts needs. It does not make the answer any less arbitrary, since a different fixed draw is a different set of answers, and it hides the spread rather than removing it."},{"expression":"run several draws and combine them","reason":"Turns the spread into something that can be reported, and multiplies the cost of placing one text by the number of runs, which section 17 already found to be the expensive half of the method."},{"expression":"run until the movement is small","reason":"A convergence criterion can replace a fixed pass budget. With sampled gradients, assess the criterion under a stable protocol, and evaluate downstream behavior separately from the training objective."},{"expression":"accept the spread and quote it","reason":"Estimate and report variation from repeated runs when it matters. That takes additional computation; accepting uncertainty does not make every returned vector equally useful."}]}
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
                  {"Distributed memory trains document and context-word inputs through their combined prediction. They use compatible coordinates, but the loss does not directly optimize document–input-word cosine. Evaluate that comparison if an application intends to use it."}
                </p>
                <p>
                  Under the plain bag of words a word&rsquo;s row was never touched, so the angle between a document and a word is the angle between something learned and something drawn at random.
                </p>
</>
                <p>

                  Nothing in the shape of the answer records which of those it is.
                  Two tables of twenty rows by eight numbers arrive, and only a
                  reader who knows how they were made can tell that one of them is
                  the initialization. Measured here, the untouched rows give butter
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
                  {"The word table grows with the retained vocabulary; it need not fully saturate as text is added. The document table grows with the number of assigned document IDs. Here it has 240 values, compared with 160 for the input word table, so document count is an important storage choice."}
                </p>
                <p>
                  {"Choose what receives a document ID: an article, paragraph or another chunk. Changing that boundary changes the shared training contexts and the number of rows. Word boundaries also depend on tokenization choices, so neither unit should be treated as a universally fixed fact."}
                </p>
                <KeepInMind>
                  {"Record the chunking rule with the model. Fits using different document units can still be compared through common evaluation tasks, but their raw rows do not have an automatic one-to-one correspondence."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Documents that supply no useful training signal" id="23-the-cases-with-nothing-to-descend-on">
                <p>
                  The four cases below leave the inference procedure without a required quantity or require an explicit policy. Check which part of the calculation fails before deciding how the implementation should respond.
                </p>
                <DerivationTable
                  expressionHeading="Document or vocabulary evidence"
                  reasonHeading="Whether a useful position can be inferred"
                  rows={[{"expression":"a held-out text using no word the collection used","reason":"With no recognized training positions, this SDK’s inference leaves its random initial vector unchanged. That vector is not a learned text description. Rejecting the query or returning a labeled zero or missing value are other policies; zero would need special handling before cosine."},{"expression":"a vocabulary of one word","reason":"This negative-sampling setup cannot draw a distinct alternative from a one-word vocabulary. Other objectives can handle such a vocabulary, so two words is an implementation requirement here rather than the minimum for every possible document loss."},{"expression":"a document of one word, averaged in","reason":"The window on either side is empty, so the mean is over the document's row alone and the first arrangement collapses exactly onto the second for that position. Nothing is undefined and no position needs skipping, which is worth stating because the natural reading of an average over a bag is that an empty bag has no mean."},{"expression":"two documents holding exactly the same words","reason":"For distributed bag of words, equal word multisets define the same expected target objective under the same protocol. Distributed memory can use different local contexts when order changes. Even identical objectives can return different finite iterates from different starts and sample sequences."}]}
                />
                <p>
                  Consider a text containing only unknown words. Under the fallback used here, pooling returns a zero vector. Paragraph inference can instead leave an ordinary-length random initial vector when it receives no usable training signal. Neither is a learned description of the text. The second is easier to mistake for one unless we report that inference had no evidence.
                </p>
                <KeepInMind>
                  {"Detect when a text supplies no usable training positions before running inference. An explicit status can distinguish an unchanged initialization from a learned representation. Search-based encoding can provide that check just as a direct formula can."}
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
              "The displayed strict margin is negative for both paragraph-vector variants, −0.0840 and −0.0442. Their least-similar within-topic pair is therefore below their most-similar cross-topic pair. Averaging has a positive margin in this fixture. This compares a particular similarity criterion; a negative margin does not prove that the document vectors cannot be separated by another decision rule.",
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
              "Only one reported row shows a larger effect from word order than from changing the starting draw. At twenty passes, distributed memory gives cosine 0.9874 between arrangements but 0.6076 between starts, so initialization has the larger effect in that comparison. With more inference, some order sensitivity appears. This demonstrates sensitivity to the training setup; it does not show that word order never matters or that more passes always solve the problem.",
            ),
            choice(
              "Which stage still requires repeated prediction updates when previously unseen texts arrive after fitting?",
              [
                "Every time a text arrives afterwards, for as long as the model is in use",
                "Once at fitting time, which is where anybody would look for it",
                "In the size of the output table the fit needs",
                "In the number of words the vocabulary holds",
              ],
              0,
              "New-text inference performs repeated prediction updates instead of one fixed pooling pass. For this eight-word probe, the reported position counts are:\n\n```math\n8 × 200 = 1600 inference positions\n8 × 30 = 240 training positions per document\n30 × 240 = 7200 training positions in total\n```\n\nThe probe's inference count is about 22 percent of that total. These counts describe visited positions, not measured wall-clock runtime.",
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
              "A finite inference run can depend on its initialized document row and pass budget, as this starting-draw comparison shows. The word and output tables stay frozen. For this SDK’s fixed negative-sampling examples, the hidden representation is affine in the document vector, making the logistic objective convex in that vector. It need not have a unique finite minimizer, and finite stochastic updates need not reach it. Initialization dependence here therefore does not require nonconvex local minima.",
              {
                "description": "Infer a new document row while keeping the learned word and output tables frozen. The caller chooses a starting draw and a finite pass budget. In distributed memory, two starting draws give inferred-vector cosine 0.6076 at 20 passes and 0.9823 at 200. Distributed bag of words discards the order of words."
              },
            ),
            trueFalse(
              "A text of entirely unknown words comes back from this method with a position of ordinary length.",
              true,
              "If every word is unknown, this implementation has no prediction examples for inference. Its gradient is zero and the initialized document row stays unchanged, with reported norm 0.11516. That nonzero vector contains no learned evidence from the input text, even though nearest-neighbor lookup can still return results. Check known-word coverage before treating those results as a useful representation. Pooling instead returns a zero vector for the same unsupported input.",
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
  "Training a document table and optimizing a vector for new text are separate procedures.",
  "Keep the source collection/settings fixed while changing the new-text inference budget."
], check: numberCheck("At twenty passes, what is the mean cosine from the held-out cooking text to the cooking documents, to four places?", 0.4786, 5e-05, "At twenty inference passes the cooking-reference mean is 0.4786, lower than its sailing-reference mean. The new-text optimization budget affects this placement."), question: "Can too few inference steps misplace an otherwise familiar-topic paragraph?" },
            ),
            exercise(
              "Place the sailing text, and see what twenty passes was reading",
              [
  "Infer both supplied cooking and sailing probes at twenty and two hundred inference passes under the stated distributed-memory setup.",
  "For every probe/budget pair print both topic mean cosines and five nearest document indices. Compare the actual neighbor lists as well as whether their labels appear plausible."
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
  "A correctly labeled topic on one probe can hide a common initial placement shared by unrelated probes.",
  "Use the document-index/topic mapping from the supplied collection for both probes."
], check: numberCheck("At two hundred passes, what is the mean cosine from the held-out sailing text to the sailing documents, to four places?", 0.9025, 5e-05, "With two hundred passes, the sailing-reference mean is 0.9025. Comparing both probes reveals whether their neighbors reflect text content rather than a shared early inference state."), question: "Do two different new texts really get different neighbors after short inference?" },
            ),
          ],
        },
      ]}
    />
  );
}
