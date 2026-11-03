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
import { BothSubjectsAtOnce } from "@/components/widgets/BothSubjectsAtOnce";
import { CompanyShift } from "@/components/widgets/CompanyShift";
import { ContributionBars } from "@/components/widgets/ContributionBars";
import { OrderBlindPair } from "@/components/widgets/OrderBlindPair";
import { PoolingWorkbench } from "@/components/widgets/PoolingWorkbench";
import { SeparationLadder } from "@/components/widgets/SeparationLadder";
import { SharedDirectionProbe } from "@/components/widgets/SharedDirectionProbe";

export const metadata: Metadata = {
  title: "Pooling a Text · Perceptron Lab",
  description:
    "Pooling combines a sequence of token vectors into a single representation. The combination rule determines which information remains useful for comparing whole sentences and which details are lost.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PoolingATextPage() {
  return (
    <ConceptPage
      lessonId="pooling-a-text"
      intuition={lessonIntuitions["pooling-a-text"]}
      technicalStart="Part 3. Averaging The Positions Instead"
      openingTitle="One Vector for a Sentence Full of Words"
      playgroundTitle="What survives when word vectors become one text vector?"
      playgroundIntro="Compare sentence vectors under different weighting rules. Try sentences with the same words in a different order and inspect what each representation can distinguish."
      title="Pooling a Text"
      tagline={"Pooling combines a sequence of token vectors into a single representation. The combination rule determines which information remains useful for comparing whole sentences and which details are lost."}
      prerequisites={
        <>
          Everything here starts from a table that has already given every word a
          position, which is what the page on{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            a vector for a word
          </Link>{" "}
          builds and where the angle between two positions is defined. The
          positions used below were found by{" "}
          <Link href="/concepts/pointwise-mutual-information" className={link}>
            counting which words keep company
          </Link>
          , though nothing on this page depends on that, and a table from{" "}
          <Link href="/concepts/word2vec" className={link}>
            word2vec
          </Link>{" "}
          would do as well. The last repair takes a leading direction out of
          every vector, and that direction is found by the same decomposition{" "}
          <Link href="/concepts/pca" className={link}>
            principal component analysis
          </Link>{" "}
          performs, with one step deliberately left out, which Part 5 measures
          rather than asserts.
        </>
      }

      playground={<PoolingWorkbench />}
      sections={[
        {
          title: "Part 1. One Position For A Whole Text",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Why a model needs one position and not a list of them">
                <>
<p>Suppose each word has a vector and we want to compare two complete texts. One text may contain eight words and another twelve. Comparing vectors by their positions in the sentences would assume that corresponding positions have corresponding roles, which they usually do not. We need to decide how a set of token vectors should contribute to one text representation.</p>
                <p>
                  Suppose the next model expects a fixed-width input vector, such as a classifier with one weight per input. A variable number of token vectors will not fit that interface directly. Pooling gives us one vector of the required width, though other architectures can process the sequence without pooling it this way.
                </p>
</>
                <>
<p>We could lay the word vectors end to end. The result grows with the number of words, so texts of different lengths would have different input widths. Padding and a maximum length can make those widths match, and position-aware models can use that arrangement. Here we want a simple document comparison that does not require the third word of one text to correspond to the third word of another. Pooling is one way to build that summary, at the cost of losing word order.</p>
                <p>Pooling combines several token vectors into one vector with a fixed number of entries. A short text and a long text can then be compared in the same coordinate space. The combination rule determines which information is preserved.</p>
</>
                <Equation>
                  {"one text  ↦  one position of a fixed width"}
                </Equation>
                <KeepInMind>
                  With four-coordinate word vectors, pooling returns four coordinates whether the text contains three words or three hundred. That makes the result convenient for a fixed-width comparison or model. We now need to examine which information disappears when we combine the token vectors.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The collection everything here is pooled from">
                <>
<p>We use two collections so that the learned word vectors have context behind them and the small calculations remain checkable. The larger collection contains twenty-four six-word documents, split between ten cooking words and ten sailing words. No content word appears in both topic lists.</p>
                <p>
                  Every document also carries exactly one of three words that carry no subject at all, and, the and we. Twenty-three words in all, and each of them has a position of four numbers, found by counting which words keep company with which inside a short window.
                </p>
</>
                <>
<p>
                  The smaller collection is six documents of four words each, built on a table of seven positions written down by hand rather than fitted. Three of its words point along the first axis and three along the second, so it has two subjects the way the larger one does, and the seventh word, the, points along a third axis and is twice as long as any of the others.
                </p>
                <p>
                  It is here because every number that comes out of it can be checked with a pencil, and because it is arranged so that the failure Part 3 is about is visible in a single document.
                </p>
</>
                <KeepInMind>
                  {"The pooling rules receive no topic labels. We use the constructed groups to inspect their comparisons, including both average separation and difficult individual pairs. Those measures evaluate selected properties of this example."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Three texts that share nothing but the words carrying no subject">
                <p>
                  {"Use two sailing texts and one cooking text, with no shared content word between any pair. All three repeat the same function words. That makes raw word overlap unhelpful for distinguishing the subjects, while the fitted content-word vectors can supply additional context relationships."}
                </p>
                <NumberTable
                  headings={["text", "about", "words carrying a subject"]}
                  rows={[
                    [
                      "the crew and the boat and we sail",
                      "sailing",
                      "crew, boat, sail",
                    ],
                    [
                      "the flour and the dough and we bake",
                      "cooking",
                      "flour, dough, bake",
                    ],
                    [
                      "the wind and the tide and we anchor",
                      "sailing",
                      "wind, tide, anchor",
                    ],
                  ]}
                  caption="Eight words each, five of them carrying no subject and three of them carrying one. The first and third are about the same thing and have no word of substance in common."
                />
                <p>
                  A reader can try any of this on any text through the panel at
                  the top of the page, which is the same calculation the sections
                  below quote from. The rule to watch is whether the first and
                  third come out nearer to each other than either does to the
                  second, since that is the one fact about them nothing was told.
                </p>
                <KeepInMind>
                  {"These texts isolate one limitation of direct word overlap. They are selected examples, so we will also compare pairs across the full constructed collection."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Counting, Which Needs No Positions At All",
          content: (
            <>
              <SubSection title="4. A text as the words it uses, counted">
                <p>
                  There is an answer to the whole problem that never asks what a
                  word means. Give every word of the vocabulary a slot, and let a
                  text be how many times it used each of them. Order is gone
                  immediately, since a count says nothing about where the word
                  was, and what is left is a fixed-width position after all,
                  because the vocabulary is fixed even though the texts are not.
                  This is the bag of words, and it is the baseline every method
                  below has to beat.
                </p>
                <Equation>
                  {"count(text)₁ , count(text)₂ , … , count(text)ₘ"}
                </Equation>
                <p>For nonzero count vectors, normalizing by their lengths removes magnitude from the comparison. Cosine similarity and Euclidean distance between those unit vectors then give equivalent rankings, though they report different numerical values. Empty or zero vectors require a separate rule because normalization would divide by zero.</p>
                <KeepInMind>
                  {"A count vector keeps the vocabulary proportions and discards order. Under cosine, proportional nonzero count vectors have similarity 1, while partial overlap can still give intermediate similarity. The exact sparsity depends on vocabulary and text length."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Three documents small enough to check with a pencil">
                <p>
                  Take the cat sat, the dog sat and a cat as a collection of
                  three. Counting occurrences, cat, sat and the appear twice each
                  and a and dog once, so with ties broken alphabetically the slots
                  run cat, sat, the, a, dog. Under plain counts the second
                  document is one in the slot for sat, one for the and one for
                  dog, and zero elsewhere.
                </p>
                <WorkedExample title="Counting three documents">
                  <p>
                    Each of cat, sat and the is used by two of the three
                    documents, and each of a and dog by one, so the rarity
                    weights follow from the counts alone. The smoothed form adds
                    one to both the collection size and the document count before
                    the logarithm, and adds one to the result, so a word used by
                    every document weighs exactly one rather than nothing.
                  </p>
                  <Equation>
                    {"idf(w)  =  log( (1 + N) / (1 + documents holding w) )  +  1"}
                  </Equation>
                  <>
                    <p>
                      With three documents, the smoothed inverse-document-frequency rule
                      gives a smaller weight to words occurring in two documents than to
                      words occurring in only one.
                    </p>
                    <Equation>{"cat, sat, the: ln((3 + 1) / (2 + 1)) + 1 ≈ 1.2877\na, dog:        ln((3 + 1) / (1 + 1)) + 1 ≈ 1.6931"}</Equation>
                    <p>
                      Apply these weights to the count vector for the dog sat.
                    </p>
                    <Equation>{"counts:   (0, 1, 1, 0, 1)\nweighted: (0, 1.2877, 1.2877, 0, 1.6931)"}</Equation>
                    <p>
                      Dog now contributes about a third more than either of the other
                      words because it appears in fewer documents.
                    </p>
                  </>
                </WorkedExample>
                <p>The text the zebra sat returns (0, 1.2877, 1.2877, 0, 0). Zebra is absent from this fitted vocabulary and contributes no vector under the stated unknown-word policy. The returned text vector therefore summarizes only the recognized contributions. We should retain that missing-coverage fact when interpreting its similarity to other texts.</p>
                <KeepInMind>
                  {"Fit document-frequency weights on the chosen reference collection and reuse them for later comparisons. Updating those estimates is possible, but changes the representation and evaluation protocol. Fitting on held-out evaluation text would no longer test the same fixed preparation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Weighting a count by how rare the word is">
                <p>
                  On the larger collection the weighting is the same and its
                  effect is small, because that collection was built so that every
                  content word is used about equally often. The three words
                  carrying no subject are each used eight times across the
                  twenty-four documents and every content word between five and
                  eight times, so the weights run from about 2.02 up to about
                  2.43, a spread of a fifth rather than of an order.
                </p>
                <p>
                  That is worth stating plainly rather than glossing, since the
                  rarity weighting is usually introduced on a collection of real
                  prose where the commonest word is a thousand times commoner than
                  a rare one and the weight really does change the answer. Here it
                  moves the score for the three texts from a margin of 0.0000 to a
                  margin of 0.0040, which is not nothing and is not much.
                </p>
                <KeepInMind>
                  {"Inverse-document frequency depends on how widely each word occurs across documents. If those document frequencies are similar, the weights will be similar too. Differences in total token frequency are a separate statistic."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What counting cannot see">
                <p>
                  Now the three texts. Each of them uses the twice, and twice, we
                  once, and three content words no other text shares, so the part
                  of any two of them that overlaps is exactly the same five
                  tokens, and the part that does not overlap is exactly three
                  tokens in each. The angle between any two of them therefore has
                  to be the same angle, and it comes out at three quarters for all
                  three pairs.
                </p>
                <WhyThisWorks title="How shared function words can dominate the average">
                  <>
                    <p>
                      Each text contains the and and twice, we once, and three content
                      words once. The shared function words therefore contribute most of
                      the similarity even when the content words differ.
                    </p>
                    <Equation>{"squared length = 2² + 2² + 1² + 1² + 1² + 1² = 12\ndot product from shared words = 2 × 2 + 2 × 2 + 1 × 1 = 9\ncosine similarity = 9 / (√12 × √12) = 9/12 = 0.75"}</Equation>
                    <p>
                      The shared content vocabulary contributes nothing in this
                      comparison. The high similarity comes entirely from the repeated
                      function words.
                    </p>
                  </>
                </WhyThisWorks>
                <NumberTable
                  headings={[
                    "pair",
                    "about the same thing",
                    "counted",
                    "counted, weighted",
                  ]}
                  rows={[
                    ["first against second", "no", "0.7500", "0.6978"],
                    ["first against third", "yes", "0.7500", "0.7107"],
                    ["second against third", "no", "0.7500", "0.7067"],
                  ]}
                  caption="Three quarters, three times over. The weighting spreads the three readings over 0.0129 and does put the right pair on top, by 0.0040."
                />
                <p>
                  The same failure is measurable across the whole collection
                  rather than on three texts. Two documents of one half that
                  happen to share no content word score exactly zero against each
                  other, while two documents of different halves that share a word
                  carrying no subject score 0.1667. So the least alike same-half
                  pair is further apart than the most alike different-half pair,
                  and the gap runs the wrong way by 0.1667. Weighting the counts
                  by rarity does not repair that, since its worst same-half pair
                  is at zero too.
                </p>
                <KeepInMind>
                  A rule that reads only which words a text used cannot tell that
                  crew and sail belong together, because it has no way of knowing
                  anything about a word beyond which slot it owns. Everything
                  after this point buys nearness between words that never appear
                  together.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Averaging The Positions Instead",
          content: (
            <>
              <SubSection title="8. The mean of a text’s word positions">
                <p>
                  {"Add the available word vectors and divide by the number included. This mean has the same width as one word vector. Here an unknown word is skipped, so n in the formula counts recognized tokens; record that policy and report low vocabulary coverage."}
                </p>
                <Equation>
                  {"v(text)  =  (1 / n) · ∑ v(w)   over the n words of the text"}
                </Equation>
                <p>
                  {"When content words from a topic have related vectors, their average can provide a useful topic summary. That is a property to test, not a guarantee about every short text: order, negation and particular word roles can still matter."}
                </p>
                <KeepInMind>
                  The mean is a composition, not a fit. Nothing about a
                  word&rsquo;s position is learned or changed here, and which
                  words have a position at all was settled before pooling started.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What the average buys over counting">
                <>
<p>
                  Here is the whole argument for pooling in one number. The first and third texts share no content word, so counting scored them at exactly the same 0.7500 it scored every other pair. Averaging their words&rsquo; positions puts them at 0.8737 against each other and at 0.6631 and 0.6142 against the cooking text, so the two that are about the same thing come out ahead by 0.2106.
                </p>
                <p>
                  Nothing told the average which texts were about sailing. It reached that because crew, boat and sail sit near wind, tide and anchor in the table it was handed.
                </p>
</>
                <SeparationLadder />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Every rule on the page, scored across the whole of a
                  collection rather than on three texts. Watch the top two rows,
                  which are the counting rules, where the far end of the indigo
                  bar lies to the left of the far end of the amber one, so a pair
                  of documents about the same subject can be further apart than a
                  pair about different ones.
                </p>
                <p>
                  Across all twenty-four documents the same thing shows. Counting
                  puts two same-half documents at 0.4343 on average and two
                  different-half documents at 0.0556, a gap of 0.3788, but its
                  worst same-half pair is at 0.0000 and its best different-half
                  pair at 0.1667, so its margin is negative. The plain average
                  puts the two averages at 0.7947 and 0.1346, a gap of 0.6601, and
                  its worst same-half pair at 0.3202 against a best different-half
                  pair of 0.2581, so the margin is positive for the first time, at
                  0.0622.
                </p>
                <KeepInMind>
                  The gap between the two averages is the comfortable measure and
                  the margin between the two worst cases is the demanding one. A
                  method can improve the first while leaving the second negative,
                  which is what the weighted counting rule does here.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Why the comparison is the angle and not the distance">
                <>
<p>
                  What does the length of a pooled vector tell us? For the plain average, these three texts give lengths 0.4886, 0.5083 and 0.5279. They contain eight words each, with their word vectors pointing broadly in similar directions. We will compare other pooling rules before interpreting length as a property of the text.
                </p>
                <p>
                  Under the smooth weights they come out between 0.0104 and 0.0112, because no weight there is above 0.028. Under the last rule they come out between 0.0048 and 0.0062, because most of what was there has been taken out.
                </p>
</>
                <p>
                  {"Length depends on the word vectors, weights and their agreement or cancellation. It can contain information as well as effects of the preparation rule. We use cosine here to compare directions consistently; that is a task choice, not proof that every pooled norm is meaningless."}
                </p>
                <Equation>
                  {"cos θ  =  (a · b) / ( ‖a‖ · ‖b‖ )"}
                </Equation>
                <KeepInMind>
                  {"Cosine removes magnitude from the comparison. A zero pooled vector needs a separate policy because it has no direction; its Euclidean distance to another vector remains defined."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. What the plain average is supposed to get wrong">
                <p>
                  The usual complaint about the plain average is easy to state.
                  Every text has the in it, the has a position like any other
                  word, and the mean of a text&rsquo;s words is pulled towards it
                  as hard as towards anything else, so the words that carry the
                  least about the subject get exactly the same say as the words
                  that carry the most. On the hand-built collection that is
                  visible in one document.
                </p>
                <WorkedExample title="Why the repeated word dominates this document average">
                  <p>
                  {"For the hand-built document the cat the dog, cat and dog agree along the first axis and have opposite small fourth coordinates. The two the vectors point along the third axis. Their repeated contribution dominates the resulting average, as the calculation below shows."}
                </p>
                  <p>
                    Read that answer as the third coordinate being twice the
                    first. Two words in four supplied the whole of one coordinate
                    and none of the other, and taking each word&rsquo;s share of
                    the length of the answer along its own direction, the supplies
                    0.8000 of it and cat and dog supply 0.1000 each. Half the
                    tokens and four fifths of the answer, from a word that is in
                    every document of the collection.
                  </p>
                  <p>
                  {"To attribute this nonzero answer, project each word’s weighted contribution onto it and divide by its squared length. These signed shares sum to one. They are not probabilities: with other vector arrangements, a contribution can be negative or exceed one because terms can oppose each other."}
                </p>
                  <Equation>{"answer = (0.5, 0, 1, 0)          answer · answer = 0.5² + 1² = 1.25\nshare(word) = (what the word added) · answer / (answer · answer)\nthe:  (0, 0, 1, 0) · (0.5, 0, 1, 0) / 1.25 = 1 / 1.25 = 0.8000\ncat:  (0.25, 0, 0, 0.025) · (0.5, 0, 1, 0) / 1.25 = 0.125 / 1.25 = 0.1000\ndog:  (0.25, 0, 0, −0.025) · (0.5, 0, 1, 0) / 1.25 = 0.125 / 1.25 = 0.1000"}</Equation>
                  <p>

                    The two uses of the added (0, 0, 1, 0) between them, which
                    is the whole of the answer&rsquo;s largest coordinate. Cat
                    and dog added a quarter each to the first coordinate, and
                    their small fourth coordinates canceled.
                  </p>
                </WorkedExample>
                <ContributionBars corpus="sketch" text="the cat the dog" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {"Each bar reports a word’s contribution under the selected rule. Changing weights can change the pooled vector as well as these shares; it does not merely redistribute an otherwise identical answer."}
                </p>
                <p>
                  {"In the hand-built collection, repeated the vectors increase cross-topic similarity. One animal–finance pair scores 0.8349 under the plain average despite having no content words in common. That is a cosine score, not a statement that the texts are 83% alike in meaning."}
                </p>
                <KeepInMind>
                  The complaint is not that common words are meaningless. It is
                  that they appear in every text, so whatever they contribute is
                  contributed to every text alike, and a quantity added equally to
                  everything cannot help tell anything apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. On this collection it does not, and the reason is worth having">
                <>
<p>
                  {"The larger collection behaves differently. In the first example text, crew contributes most under the stated projection attribution, followed by sail. The two occurrences of and together contribute less than either of those single content words."}
                </p>
                <p>
                  Two tokens of and together supply less than one token of crew. Across all twenty-four documents, the one word in six that carries no subject supplies 0.0649 of its document&rsquo;s average, where an equal share would be 0.1667.
                </p>
</>
                <ContributionBars
                  corpus="documents"
                  text="the crew and the boat and we sail"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">

                  The same division of one answer, on the larger collection. The
                  gray bars are the words carrying no subject, and here they are
                  at the bottom rather than the top.
                </p>
                <>
<p>
                  {"In this fitted table, the shared words have shorter vectors than the content words. The association-based preparation contributes to that pattern, but a word occurring broadly can still have useful context associations. Frequency alone does not determine its vector length."}
                </p>
                <p>
                  The rule that made the positions had already done part of the work the weighting was invented to do.
                </p>
</>
                <KeepInMind>
                  {"A common word’s contribution depends on its vector, its repetitions and the pooling rule. Its norm alone does not tell us how much it changes document comparisons. The following projection experiment examines a shared direction, which is a different effect."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "Counting scores all three of the running texts at 0.7500 against one another. Why is it the same number for every pair?",
              [
                              "Because any two of them overlap in exactly the same five tokens and differ in exactly three",
                              "Because two of the three are about sailing and one is about cooking",
                              "Because counting gives any two texts of eight words the same angle",
                              "Because the collection is too small for a count to separate anything",
                            ],
              0,
              "Each probe repeats the and and twice, includes we once, and has three content words that the other probes do not share. Those repeated shared words give every pair the same dot product, and the count vectors also have equal norms.\n\n```math\ncos(θ) = 9 / 12 = 0.75\n```\n\nThe unshared content words affect the norms even though they contribute nothing to the cross-text dot product. Equal text length alone would not force equal cosine.",
              {
                "description": "Split on spaces and use raw token-count vectors with cosine similarity. The texts are:\n\ntext | about | words carrying a subject\nthe crew and the boat and we sail | sailing | crew, boat, sail\nthe flour and the dough and we bake | cooking | flour, dough, bake\nthe wind and the tide and we anchor | sailing | wind, tide, anchor"
              },
            ),
            trueFalse(
              "Across the twenty-four documents, the least alike pair from one half is further apart under counting than the most alike pair from different halves.",
              true,
              "Two documents of one half that happen to share no content word score exactly zero against each other, while two documents of different halves that share a word carrying no subject score 0.1667, so the gap runs the wrong way by 0.1667. Weighting the counts by rarity does not repair it, since its worst same-half pair is at zero too.",
            ),
            choice(
              "What does averaging the word positions do for the first and third texts, which share no content word?",
              [
                "It puts them at 0.8737 against each other and at 0.6631 and 0.6142 against the cooking text",
                "It leaves them where counting put them, since neither rule reads order",
                "It separates them, because averaging is pulled towards whichever words are longest",
                "It puts them at 0.7500, the same as counting, since the same words went in",
              ],
              0,
              "The word-vector table places crew, boat and sail near wind, tide and anchor because of their contexts in the training collection. Averaging can use those relationships even when the probes share no content word. Across the full collection the same-topic mean is 0.7947 and the cross-topic mean is 0.1346. The stricter worst-pair margin is positive at 0.0622. These are two different ways to evaluate topic separation.",
            ),
            trueFalse(
              "On the twenty-four documents the three words carrying no subject supply most of a plain average, as the usual complaint predicts.",
              false,
              "In this collection the common function words have relatively short vectors. Their average reported projection contribution is 0.0649, below an equal six-word share of 0.1667. Their norms are 0.3708, 0.3667 and 0.5770, while content-word norms range from 0.7327 to 1.1628. The supplied representation therefore does not support assuming that common words dominate every pooled vector. Frequency, vector direction and vector norm all affect the contribution.",
            ),
            choice(
              "For this lesson’s comparison of subject similarity, why do we use cosine rather than raw Euclidean distance?",
              [
                "The pooling rules change vector scale, so cosine lets us compare direction without treating that scale as subject similarity",
                "Because distances cannot be computed between vectors of four numbers",
                "Because the angle is cheaper to compute than the distance",
                "Because the word positions were normalized before pooling"
              ],
              0,
              "Cosine removes the overall vector scale. That is useful for this subject-similarity comparison, where the pooling rules themselves change the norm substantially. It is a choice for this evaluation, not a claim that vector length can never carry useful information or that distance is impossible.",
              {
                "description": "The same texts are represented by different averaging and weighting rules. Their vector lengths range from about 0.49–0.53 under plain averaging to about 0.005–0.006 after the final weighting/removal rule. The evaluation asks whether texts share a subject, rather than which weighting rule gave them a larger norm."
              },
            ),
        ],
        },
        {
          title: "Part 4. Weighting A Word By How Rare It Is",
          content: (
            <>
              <SubSection title="13. The rarity weight, inside a mean">
                <p>
                  The repair suggests itself. If a word in every document should
                  count for little and a word in few documents for more, then the
                  weight Part 2 already used on counts can be used again on
                  positions, multiplying each word&rsquo;s position by its weight
                  before adding. Divide by the total weight rather than by the
                  number of words, and the result is a weighted mean, which sits
                  inside the same region the words do rather than being scaled
                  arbitrarily by how many rare words the text happened to hold.
                </p>
                <Equation>
                  {"v(text)  =  ∑ idf(w) · v(w)   /   ∑ idf(w)"}
                </Equation>
                <>
                  <p>
                    In the hand-built collection, the appears in all six documents. Each
                    other word appears in two. Their inverse-document-frequency weights
                    are:
                  </p>
                  <Equation>{"weight(the) = ln((6 + 1) / (6 + 1)) + 1 = 1\nweight(other word) = ln((6 + 1) / (2 + 1)) + 1 ≈ 1.8473"}</Equation>
                  <p>
                    Each content word now counts about 1.85 times as much as the. Plain
                    averaging gave them equal weight.
                  </p>
                </>
                <KeepInMind>
                  Dividing by the total weight rather than by the word count is
                  what makes this a mean. The alternative, dividing by the count,
                  leaves a text of rare words longer than a text of common ones,
                  which matters for anything that reads the length and matters not
                  at all for an angle.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What that weighting is worth">
                <p>
                  The change is substantial on the hand-built collection. The contribution from the falls from 0.8000 to 0.5396, while cat and dog each rise from 0.1000 to 0.2302. The topic margin increases from 0.1640 to 0.3871. The most similar cross-topic document pair falls from 0.8349 to 0.6105, making those groups easier to distinguish under this measure.
                </p>
                <p>
                  On the twenty-four documents, the weights differ much less, so the effect is smaller. The topic margin moves from 0.0622 to 0.0819, and the three-text comparison from 0.2106 to 0.2331. These measured improvements do not establish how much a downstream task would benefit.
                </p>
                <NumberTable
                  headings={[
                    "collection",
                    "plain average",
                    "weighted by rarity",
                    "change",
                  ]}
                  rows={[["twenty-four documents","0.0622","0.0819","+0.0197"],["six four-word documents","0.1640","0.3871","+0.2231"]]}
                  caption="The margin between the least alike same-subject pair and the most alike different-subject pair, before and after the weighting. The weighting is worth eleven times as much where the common word is genuinely dominant."
                />
                <KeepInMind>
                  A repair is worth measuring on the collection it will be used
                  on, since the same weighting bought 0.2231 in one place and
                  0.0197 in another. Nothing about the method changed between
                  those two numbers.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The smoother weight the 2017 baseline uses">
                <p>
                  {"Arora, Liang and Ma’s 2017 sentence-embedding baseline uses token frequency rather than document frequency. It downweights frequent words when averaging their vectors, then removes a leading shared component across sentence vectors. This was proposed as a simple alternative to training a more elaborate sentence model. We will inspect the two operations separately."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://github.com/PrincetonML/SIF">{"Arora, Liang and Ma: A Simple but Tough-to-Beat Baseline for Sentence Embeddings (2017)"}</Link></p>
                <Equation>
                  {"weight(w)  =  a / ( a + p(w) )     with a = 0.001"}
                </Equation>
                <p>
                  {"The parameter a controls how quickly the weight falls with frequency. At a=0.001, the two illustrative probabilities below produce very different weights. Dividing the weighted sum by token count, rather than total weight, preserves those magnitude differences; a cosine comparison still removes a positive common rescaling of an individual vector."}
                </p>
                <Equation>{"For a = 0.001:\np = 0.5: weight = 0.001 / 0.501 ≈ 0.001996\np = 0.000001: weight = 0.001 / 0.001001 ≈ 0.999001"}</Equation>
                <p>
                  On the twenty-four documents that sharpness has nothing to bite
                  on. No word is commoner than an eighteenth of the collection, so
                  the weights run from 0.017682 up to 0.027994, a ratio of 1.5832
                  against the 500 the paper&rsquo;s own illustration reaches.
                  Measured, the weights alone take the margin from 0.0622 to
                  0.1096, which is a little more than the rarity weight managed
                  and is still not the thing that makes the method work.
                </p>
                <KeepInMind>
                  {"The effect depends on the frequency distribution. On the hand-built collection, where the accounts for half the tokens, these weights improve the reported topic margin substantially. That result evaluates the supplied example, not a universal need to suppress every common word."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Why the weights alone do not finish the job">
                <p>
                  {"After frequency weighting, some cross-topic pairs still have positive cosine. That alone is not a failure: related vectors can share useful background properties. To investigate whether a dominant shared component interferes with topic separation here, compare a projection-removal variant."}
                </p>
                <p>
                  {"The document vectors all have a substantial positive projection along one leading direction. Their cosines to it range from 0.5820 to 0.7774. The scalar projection differs by document; a mean cosine near 0.68 does not mean that two-thirds of every representation is an identical answer."}
                </p>
                <KeepInMind>
                  {"Nonnegative word weights cannot directly subtract an arbitrary component from each finished document vector. They can still change that component through different contributions and cancellations. Projection removal offers a separate operation whose effect we can measure."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Direction Every Text Shares",
          content: (
            <>
              <SubSection title="17. One direction through a whole collection">
                <p>
                  {"Find the leading right singular vector of the training document-vector matrix, then subtract each document’s projection onto that unit direction. This removes the component with the largest uncentered squared magnitude. It can discard useful information as well as background variation."}
                </p>
                <Equation>
                  {"v  ←  v − u · (u · v)     where u is the leading direction"}
                </Equation>
                <>
<p>
                  {"This SVD uses the document vectors without subtracting their mean first. Centering would instead describe deviations from that mean. The leading uncentered direction often reflects a shared component, but is not generally equal to the mean direction."}
                </p>
                <p>
                  {"The unit direction and its negative give the same projection-removal transform. A sign convention can make a displayed direction reproducible, but the document transform does not require one."}
                </p>
</>
                <KeepInMind>
                  The direction belongs to the collection and not to any text.
                  Nothing about a particular document decides it, and every
                  document is then measured against the same one.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What lies along it, probed rather than described">
                <p>To interpret the removed direction, compare each word vector with it. In these twenty-four documents, and has cosine 0.9897, we has 0.9848 and the has 0.9032. No topic word exceeds 0.7087. The direction therefore aligns most strongly with the common words shared by both constructed topics. That observation explains its role here; another corpus could produce a different direction.</p>
                <SharedDirectionProbe />
                <p className="text-sm text-slate-500 dark:text-slate-400">

                  Every word of the collection, ranked by how far it leans along
                  the direction that is about to be removed. The three gray bars
                  at the top are the words carrying no subject, and the dashed
                  line is where the furthest content word reaches. Switching to
                  the smaller collection reorders the list entirely, which the
                  note below is about.
                </p>
                <p>
                  {"The shared words are short but strongly aligned with the removed direction in this fitted example. That helps explain why projection removal changes the topic comparisons even after frequency weighting. It does not establish that their contribution was uniformly useless in every document."}
                </p>
                <InAModel>
                  The same probe on the hand-built collection returns something
                  else, and the difference is instructive. There the leading
                  direction is (0.6384, 0.6384, 0.4299, 0), which mixes both
                  subjects&rsquo; axes with the axis the sits on, and the word
                  furthest along it is not the at 0.4299 but pet and market at
                  0.7050. With one shared word and two perfectly symmetric halves,
                  the direction the documents most agree on is the average of
                  everything rather than the shared word alone. What is removed is
                  whatever the collection has in common, and only sometimes is
                  that a set of words a person would have named in advance.
                </InAModel>
                <KeepInMind>
                  {"The leading direction differs across the two constructed collections. Interpret its contributions empirically: it is the largest uncentered component, not a guaranteed list of function words or a component with identical magnitude in every document."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Taking it out, and what happens to the three texts">
                <p>
                  With the direction removed, the three texts stop being variations
                  on one theme. The two about sailing come out at 0.3633 against
                  each other, and the sailing texts against the cooking one come
                  out at &minus;0.9016 and &minus;0.5762, which is to say they now
                  point in substantially opposite directions rather than in
                  slightly different ones. The margin goes from 0.2637 under the
                  weights alone to 0.9395.
                </p>
                <NumberTable
                  headings={[
                    "rule",
                    "the two about sailing",
                    "the most alike cross-subject pair",
                    "margin",
                  ]}
                  rows={[
                    ["counted", "0.7500", "0.7500", "0.0000"],
                    ["counted, weighted", "0.7107", "0.7067", "0.0040"],
                    ["averaged", "0.8737", "0.6631", "0.2106"],
                    ["averaged, weighted by rarity", "0.8521", "0.6190", "0.2331"],
                    ["the smooth weights alone", "0.8148", "0.5511", "0.2637"],
                    ["smooth inverse frequency", "0.3633", "−0.5762", "0.9395"],
                  ]}
                  caption="The three texts under all six rules. The last row is the only one where two texts about different subjects come out pointing away from each other rather than merely less towards each other."
                />
                <p>
                  Across the whole collection the same thing happens at scale. Two
                  documents of different halves average &minus;0.6370 against each
                  other, where every rule before this had them positive, and the
                  margin between the worst same-half pair and the best
                  different-half pair reaches 0.2752, four times what the plain
                  average managed.
                </p>
                <KeepInMind>
                  Removing one of four directions changes a large part of the representation. Here it improves the separation more than the weighting choices did. Next we will inspect what useful information that removal can also discard.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Where taking it out makes things worse">
                <p>
                  {"The least-similar within-topic pair falls from 0.3202 to −0.0767 after removal. Its vectors point slightly beyond a right angle. That is a loss of angular cohesion under this representation, not proof that the two documents have become semantically unrelated."}
                </p>
                <p>
                  It is the same mechanism as the improvement, seen from the other
                  side. What every document of the collection had in common was
                  also part of what any two documents of one half had in common,
                  so removing it removes some genuine agreement along with the
                  spurious kind. Two documents of one half that share no content
                  word were relying on the shared part more than most, and they are
                  the pair that suffers.
                </p>
                <NumberTable
                  headings={["rule", "least alike same-half pair"]}
                  rows={[
                    ["counted", "0.0000"],
                    ["averaged", "0.3202"],
                    ["smooth inverse frequency", "−0.0767"],
                  ]}
                  caption="The worst case inside one half, which is the quantity the removal makes worse rather than better. On this measure alone the plain average is the best rule on the page."
                />
                <KeepInMind>
                  {"This example improves cross-topic separation while weakening one within-topic comparison. Whether that tradeoff helps depends on the actual task and decision rule. Broad-topic retrieval can still care about that difficult within-topic pair."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. What all this costs">
                <p>
                  {"Some preparation must be learned or supplied before each rule can transform a new text. Count vectors need a vocabulary; IDF and smooth-frequency pooling need frequency estimates; component removal needs a fitted direction. Once those are fixed, all of these transforms can process a single arriving text. Plain averaging also depends on its existing word-vector table."}
                </p>
                <p>
                  The second is width, and it runs the other way. A counted text is
                  as wide as the vocabulary, which is twenty-three numbers here and
                  tens of thousands on real prose, and almost all of them are zero.
                  A pooled text is as wide as one word&rsquo;s position, which is
                  four numbers here whatever the vocabulary does. That is the trade
                  a fixed width was bought with.
                </p>
                <p>
                  {"Count vectors retain known-word counts but not order. A pooled vector generally loses information about its individual tokens. The reported nearest-word experiment recovers an average number of source words; it does not prove that every word it misses is mathematically unrecoverable or quantify a fraction of the original document’s information."}
                </p>
                <NumberTable
                  headings={[
                    "rule",
                    "numbers per text",
                    "needs a collection first",
                    "words back out of six",
                  ]}
                  rows={[
                    ["counted", "23", "for the vocabulary", "all six, by definition"],
                    ["counted, weighted", "23", "yes", "all six, by definition"],
                    ["averaged", "4", "no", "4.3333"],
                    ["averaged, weighted by rarity", "4", "yes", "4.3333"],
                    ["the smooth weights alone", "4", "yes", "4.2500"],
                    ["smooth inverse frequency", "4", "yes", "4.1667"],
                  ]}
                  caption="Stored width, fitted preparation, and source words recovered by the stated nearest-word heuristic. All fitted rules can transform one new text once their preparation is available."
                />
                <KeepInMind>
                  {"Count and pooled representations retain different information and give different rankings in this example. If a later operation needs exact word counts, retain them or the source text rather than rely on approximate recovery from a pooled vector."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            trueFalse(
              "The rarity weighting bought about the same improvement on the hand-built collection as on the twenty-four documents.",
              false,
              "It bought 0.2231 in one place and 0.0197 in the other, and nothing about the method changed between those two numbers. On the hand-built collection the margin goes from 0.1640 to 0.3871 and the share of the answer supplied by the falls from 0.8000 to 0.5396. On the twenty-four documents the margin moves only from 0.0622 to 0.0819, because the weights themselves barely differ where every content word is used about equally often.",
            ),
            choice(
              "The tested positive weighting rules leave a shared direction in both topics. How does subtracting that direction differ from changing word weights?",
              [
                "Positive weighting rescales the word vectors being added; component removal explicitly subtracts each document’s projection onto a fitted direction",
                "Because the weights are estimated from the same collection they are applied to",
                "Because the word positions were fitted on too little text",
                "Because the angle is insensitive to how long each vector is",
              ],
              0,
              "A positive weight changes how much of a word vector is added. Component removal instead subtracts each document's projection onto a direction fitted from the collection. The plain document vectors have cosines from 0.5820 to 0.7774 with that direction, so it is shared substantially across these documents. Those cosines describe angles; they do not mean that two thirds of every vector's contents are identical.",
            ),
            trueFalse(
              "On both collections the words leaning furthest along the removed direction are the ones carrying no subject.",
              false,
              "In the twenty-four-document collection, the function words align most strongly with the leading direction: and at 0.9897, we at 0.9848 and the at 0.9032. In the hand-built collection, pet and market instead lead at 0.7050, while the is at 0.4299. The direction is fitted from the pooled vectors, not from a list of words designated as unimportant. It can include information we would prefer to keep.",
            ),
            trueFalse(
              "The least alike pair of documents from one half reads as less alike after the shared direction is removed than it did under the plain average.",
              true,
              "The least-similar same-topic pair changes from cosine 0.3202 under plain averaging to −0.0767 under the weighted, component-removed representation. Removing a shared component can remove agreement between documents of the same topic as well as across topics. This comparison also changes the word weights, so it does not isolate component removal alone. By this worst-same-topic-pair measure, the plain average performs best among the reported rules.",
            ),
            several(
              "Which statements agree with this representation comparison?",
              [
                "Of these choices, only the plain average needs no newly estimated corpus vocabulary, frequencies or principal direction",
                "A pooled text is as wide as one word’s position whatever the vocabulary does",
                "Asking which words lie nearest a pooled position recovers 4.3333 of a document’s six words on average under the plain average",
                "A pooled vector keeps the text’s vocabulary readable straight off it"
              ],
              [0, 1, 2],
              "A plain average needs only the supplied word vectors. The other variants first need a vocabulary or corpus-level statistics, but can then process new texts too. Pooled width is fixed by the word-vector width. Reading its coordinates does not directly recover a word-count vocabulary; the reported nearest-word recovery is partial.",
              {
                "description": "All variants can represent a new text once their required vocabulary or corpus statistics have been fixed. “Needs a collection first” means that preprocessing statistics are unavailable when starting with just a lone text and a supplied word-vector table.",
                "data": "rule | numbers per text | needs a collection first | words back out of six\ncounted | 23 | for the vocabulary | all six, by definition\ncounted, weighted | 23 | yes | all six, by definition\naveraged | 4 | no | 4.3333\naveraged, weighted by rarity | 4 | yes | 4.3333\nthe smooth weights alone | 4 | yes | 4.2500\nsmooth inverse frequency | 4 | yes | 4.1667"
              },
            ),
        ],
        },
        {
          title: "Part 6. Words and Directions the Document Vector Loses", id: "part-6-where-pooling-stops-being-defined",
          content: (
            <>
              <SubSection title="22. Every rule here is blind to order">
                <p>
                  A sum does not remember the order its terms arrived in. Every
                  rule on this page is a sum over the words of a text, divided by
                  something that depends on the multiset of those words and not on
                  their arrangement, so any two texts built from the same words in
                  any two orders are one position. This is not a limitation of a
                  particular weighting and it cannot be repaired by choosing better
                  weights, because it follows from the shape of the calculation.
                </p>
                <p>
                  Crew sail the boat and boat sail the crew are two English
                  sentences that say opposite things about who is doing the
                  sailing. Under both counting rules they come back as the identical
                  list of numbers, agreeing in every bit. Under the four averaging
                  rules the largest disagreement between the two lists first
                  appears in the seventeenth decimal place, which is the order the
                  additions ran in rather than any difference in what was computed,
                  and the angle between them is one.
                </p>
                <OrderBlindPair />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The same four words in two orders under every rule. The column to
                  read is the last one, which is the angle between the two answers,
                  and it does not move.
                </p>
                <p>
                  {"These four distinct words have 24 permutations, which share a pooled result in exact arithmetic. Repeated words reduce the number of distinct permutations. Order can affect topic and sentiment as well as who did what, so evaluate whether discarding it is acceptable for the task."}
                </p>
                <KeepInMind>
                  {"These rules pool static word vectors symmetrically, so rearranging them does not change the exact result. Sequence models or contextual word vectors can supply order-sensitive features before pooling. Processing tokens recurrently is one option, not the only way to retain order."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A shared direction is a fact about the company">
                <p>
                  {"Changing the fitted frequency estimates or removed direction changes the transform. Once those are fixed, a given text has a fixed representation under that preparation. Merely placing it beside other query texts does not require refitting."}
                </p>
                <p>
                  Scoring the crew and the boat and we sail against all
                  twenty-four documents and then against the twelve sailing ones
                  gives two positions whose cosine is &minus;0.6124. Not two
                  slightly different readings of one text. Two readings that point
                  substantially away from each other, from a change in nothing but
                  which documents were in the room.
                </p>
                <CompanyShift />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Each word of the text against the direction removed under each of
                  the two collections. Watch sail, which is nearly perpendicular to
                  the whole collection&rsquo;s direction and almost parallel to the
                  sailing half&rsquo;s.
                </p>
                <p>
                  The mechanism is visible word by word. In the whole collection
                  the three words carrying no subject lead the direction, because
                  they are what all twenty-four documents agree on. In the sailing
                  half every document is about sailing, so sail is now something
                  they all agree on too, and it leads at 0.9031 where in the whole
                  collection it reached only 0.6551. The two directions themselves
                  agree only to 0.7812.
                </p>
                <KeepInMind>
                  {"Use a consistent fitted transform when comparing text vectors. If the reference data or projection changes, re-encode the candidates or establish another compatible comparison protocol. The coordinates remain numerically defined, but their preparation differs."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. One position cannot say two things">
                <p>
                  {"One vector can contain evidence for multiple subjects through different coordinates or directions. A plain average may be close to both a cooking and a sailing reference. The question is whether that representation and comparison preserve enough detail for the task, not whether a vector is mathematically forbidden from representing both."}
                </p>
                <BothSubjectsAtOnce />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  A text about both subjects against a text about each, under every
                  rule. The first rules put it near both, and the last one picks a
                  side.
                </p>
                <>
<p>
                  {"The mixed text scores 0.8862 to the sailing reference and 0.9202 to the cooking reference, higher than those two references score to each other. That can be an appropriate result for a text containing both subjects. Test against the intended relevance criteria before calling it a failure."}
                </p>
                <p>
                  Under the last rule it scores &minus;0.1187 against sailing and 0.5057 against cooking, and all four of the documents it comes out nearest are cooking documents, so a text holding crew and boat has been placed in the kitchen.
                </p>
</>
                <KeepInMind>
                  {"Multiple vectors can retain separate aspects more explicitly, but one vector is not inherently limited to one topic. Compare the representational choices on tasks that require either broad relevance or fine distinctions among the text’s parts."}
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Empty texts and averages with no direction" id="25-the-cases-with-nothing-to-compute">
                <p>
                  The cases below expose undefined calculations or missing information. For each one, identify the quantity we cannot compute and choose an explicit response rather than quietly manufacturing a vector.
                </p>
                <DerivationTable
                  expressionHeading="Text, vocabulary or shared direction"
                  reasonHeading="What remains after pooling"
                  rows={[{"expression":"a text none of whose words has a position","reason":"This SDK returns zero when no recognized vectors contribute. A mean over an empty set needs that explicit convention, and cosine is then undefined because the returned vector has zero length."},{"expression":"a collection of one document","reason":"One row spans one direction, so the leading direction is that document's own direction and removing it leaves exactly the zero vector, measured here at a length of 4.3 in ten billion billion. Every text scored in that company that leans the same way loses everything, and the residue that remains is rounding rather than content."},{"expression":"a text whose weighted average lies exactly along the shared direction","reason":"Projection removal sends any vector exactly parallel to the removed unit direction to zero. That can include useful task information; it is not proof that the document carried little content."},{"expression":"a collection whose documents all pool to zero","reason":"An all-zero reference matrix has no uniquely leading direction. A documented policy can skip the removal, reject fitting, or choose a convention; its effect on later nonzero queries must be made explicit."},{"expression":"a word the collection used, whose probability is therefore not zero","reason":"For positive a, a/(a+p) is defined at every probability from0 to1. A zero estimated frequency gives weight1. A new text can contain such a word if its embedding vocabulary is broader than the frequency-estimation corpus, so state the policy."}]}
                />
                <p>
                  {"A text containing no recognized vocabulary entries returns zero under the policies used here. Report the missing coverage and avoid interpreting a cosine fallback as evidence that it resembles nothing."}
                </p>
                <KeepInMind>
                  {"Check the pooled norm before applying cosine. Zero gives no defined direction; a tiny residual from projection may reflect rounding and also needs careful handling. Other comparisons can still be mathematically defined for the zero vector."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Part 6",
          quiz: [
            trueFalse(
              "Crew sail the boat and boat sail the crew come back as one position under every rule on the page.",
              true,
              "Under both counting rules they agree in every bit, and under the four averaging rules the largest disagreement first appears in the seventeenth decimal place, which is the order the additions ran in. Every rule here is a sum over the words divided by something that depends on the multiset and not on the arrangement, so this follows from the shape of the calculation and cannot be repaired by choosing better weights.",
            ),
            choice(
              "Fit the pooling statistics first on all twenty-four documents, then on the twelve sailing documents. The same query’s transformed vectors have cosine −0.6124. What changed?",
              [
                "What the collection agrees on, since in the sailing half sail leads the direction at 0.9031 where across all twenty-four it reached only 0.6551",
                "The word positions, which are refitted for each collection",
                "The weights, which are the only quantity a smaller collection changes",
                "Nothing real, since the two directions differ only by their sign",
              ],
              0,
              "The word vectors stay fixed, but the fitted pooling statistics change. The sailing-only collection has a different leading direction because its documents share sailing content as well as function words. The two learned directions have cosine 0.7812, and removing their projections gives different representations of the same text. Use the same fitted pooling transform for query and reference vectors when comparing them.",
            ),
            choice(
              "A text holds two sailing words and two cooking words. What do the rules do with it?",
              [
                "The plain average puts it nearer each subject than the two subjects are to each other, and the last rule places it among the cooking documents",
                "Both rules place it exactly between the two subjects, which is the right answer",
                "Both rules refuse it, since a mixed text has no single direction",
                "The plain average picks a side and the last rule keeps it between the two",
              ],
              0,
              "The mixed-topic probe has cosine 0.8862 to the sailing probe and 0.9202 to the cooking probe under plain averaging. After the last transformation, those values become −0.1187 and 0.5057, and its four nearest documents are cooking examples. A single pooled vector can represent a mixture, but this particular representation and comparison do not preserve both topics equally. If both topics matter, evaluate mixed-topic probes explicitly or retain separate representations for parts of the text.",
            ),
            trueFalse(
              "Under the rules shown here, a text made entirely of unknown words produces a zero vector, for which cosine similarity is undefined.",
              true,
              "None of the unknown words contributes a vector under these fitted rules, so the pooled result is the origin. A zero vector has no direction, and the cosine helper rejects it rather than reporting similarity zero. A partially known text can still return a nonzero vector while silently omitting unknown words, so callers should check how much of the input was represented.",
            ),
        ],
        },
        {
          title: "Practice. Pooling The Three Texts With The Library",
          practice: [
            exercise(
              "Score the three texts by counting and by averaging",
              [
  "Fit the supplied four-dimensional PMI word table at window two on the twenty-four documents. Fit normalized BagOfWords and MeanPooling from the same collection.",
  "Transform the three supplied probes and print their three pairwise cosines under each representation. Keep the first/third sailing probes and the middle cooking probe labeled in the report."
],
              `from oop_ml import BagOfWords, MeanPooling, PointwiseMutualInformationEmbeddings

COOKING = "flour sugar butter eggs oven bake stir whisk dough pan".split()
SAILING = "sail wind boat harbour anchor tide mast rope deck crew".split()
FILLERS = [(2, "and"), (3, "the"), (0, "we")]

documents = []
for topic in (COOKING, SAILING):
    for start in range(12):
        words = [topic[(start + step) % 10] for step in range(5)]
        place, filler = FILLERS[start % 3]
        words.insert(place, filler)
        documents.append(" ".join(words))

texts = [
    "the crew and the boat and we sail",
    "the flour and the dough and we bake",
    "the wind and the tide and we anchor",
]

# Fit the word positions on the documents and keep the embeddings.

# Build the two rules, a normalised BagOfWords and a MeanPooling on the positions.

# For each rule, fit it on the documents, transform the three texts, and print
# the similarity of each pair, (0, 2), (0, 1) and (1, 2), to four places.`,
              `from oop_ml import BagOfWords, MeanPooling, PointwiseMutualInformationEmbeddings

COOKING = "flour sugar butter eggs oven bake stir whisk dough pan".split()
SAILING = "sail wind boat harbour anchor tide mast rope deck crew".split()
FILLERS = [(2, "and"), (3, "the"), (0, "we")]

documents = []
for topic in (COOKING, SAILING):
    for start in range(12):
        words = [topic[(start + step) % 10] for step in range(5)]
        place, filler = FILLERS[start % 3]
        words.insert(place, filler)
        documents.append(" ".join(words))

texts = [
    "the crew and the boat and we sail",
    "the flour and the dough and we bake",
    "the wind and the tide and we anchor",
]

positions = PointwiseMutualInformationEmbeddings(window=2, dimension=4).fit(documents).embeddings

rules = {"counted": BagOfWords(normalise=True), "averaged": MeanPooling(embeddings=positions)}
for name, rule in rules.items():
    pooled = rule.fit(documents).transform(texts)
    print(name)
    print(f"  the two about sailing: {pooled.similarity(0, 2):.4f}")
    print(f"  first against cooking: {pooled.similarity(0, 1):.4f}")
    print(f"  third against cooking: {pooled.similarity(1, 2):.4f}")`,
              `counted
  the two about sailing: 0.7500
  first against cooking: 0.7500
  third against cooking: 0.7500
averaged
  the two about sailing: 0.8737
  first against cooking: 0.6631
  third against cooking: 0.6142`,
              { hints: [
  "Use the same probe order for both representations.",
  "A bag counts exact shared words, while the mean representation also uses the learned relationships among their vectors."
], check: numberCheck("What cosine does the plain average give the two texts about sailing, to four places?", 0.8737, 5e-05, "The mean-vector sailing similarity is 0.8737. Compare it with both sailing/cooking pairs to see what the representation distinguishes in this small probe set."), question: "Does averaging learned word vectors distinguish these short messages better than shared-word counts?" },
            ),
            exercise(
              "Take the shared direction out and count what it costs",
              [
  "Pool all twenty-four supplied documents with MeanPooling and with SmoothInverseFrequency at smoothing 0.001 with first-component removal.",
  "For each print within-topic mean/minimum cosine and cross-topic mean/maximum cosine. The first twelve documents are cooking; exclude self-pairs. This comparison changes both weighting and component removal."
],
              `from itertools import combinations
from statistics import mean

from oop_ml import MeanPooling, PointwiseMutualInformationEmbeddings, SmoothInverseFrequency

COOKING = "flour sugar butter eggs oven bake stir whisk dough pan".split()
SAILING = "sail wind boat harbour anchor tide mast rope deck crew".split()
FILLERS = [(2, "and"), (3, "the"), (0, "we")]

documents = []
for topic in (COOKING, SAILING):
    for start in range(12):
        words = [topic[(start + step) % 10] for step in range(5)]
        place, filler = FILLERS[start % 3]
        words.insert(place, filler)
        documents.append(" ".join(words))

positions = PointwiseMutualInformationEmbeddings(window=2, dimension=4).fit(documents).embeddings

# Build the two rules, a MeanPooling and a SmoothInverseFrequency, on the positions.

# For each rule, fit it and transform the documents themselves.
# same: the similarity of every pair inside the first twelve and inside the last twelve.
# different: the similarity of every pair with one document from each half.
# Print the mean and min of same, and the mean and max of different.`,
              `from itertools import combinations
from statistics import mean

from oop_ml import MeanPooling, PointwiseMutualInformationEmbeddings, SmoothInverseFrequency

COOKING = "flour sugar butter eggs oven bake stir whisk dough pan".split()
SAILING = "sail wind boat harbour anchor tide mast rope deck crew".split()
FILLERS = [(2, "and"), (3, "the"), (0, "we")]

documents = []
for topic in (COOKING, SAILING):
    for start in range(12):
        words = [topic[(start + step) % 10] for step in range(5)]
        place, filler = FILLERS[start % 3]
        words.insert(place, filler)
        documents.append(" ".join(words))

positions = PointwiseMutualInformationEmbeddings(window=2, dimension=4).fit(documents).embeddings

rules = {
    "plain average": MeanPooling(embeddings=positions),
    "direction removed": SmoothInverseFrequency(
        embeddings=positions, smoothing=0.001, remove_first_component=True
    ),
}
halves = (range(12), range(12, 24))
for name, rule in rules.items():
    pooled = rule.fit(documents).transform(documents)
    same = [pooled.similarity(a, b) for half in halves for a, b in combinations(half, 2)]
    different = [pooled.similarity(a, b) for a in halves[0] for b in halves[1]]
    print(name)
    print(f"  same half:        mean {mean(same):.4f}   least alike {min(same):.4f}")
    print(f"  different halves: mean {mean(different):.4f}   most alike {max(different):.4f}")`,
              `plain average
  same half:        mean 0.7947   least alike 0.3202
  different halves: mean 0.1346   most alike 0.2581
direction removed
  same half:        mean 0.6212   least alike -0.0767
  different halves: mean -0.6370   most alike -0.3520`,
              { hints: [
  "Keep each distinct within-topic pair once and all cross-topic pairs.",
  "Inspect the least-similar topic mates as well as the mean; aggregate separation can hide a damaged individual pair."
], check: numberCheck("After the direction is removed, what is the mean cosine between two documents of the same half, to four places?", 0.6212, 5e-05, "The same-topic mean is 0.6212 under this weighted, component-removed representation. Cross-topic separation improves here while some topic mates become less similar."), question: "What does removing a common direction improve, and which similarities can it damage?" },
            ),
            exercise(
              "Weight the cat the dog by rarity",
              [
  "Use the supplied seven-word vector table and six-document collection. Fit MeanPooling with inverse-document-frequency weighting.",
  "For the text the cat the dog, print the fitted weights for the and cat, then its pooled vector. Compute the vector contribution from the two occurrences of the. Project that contribution onto the pooled vector and divide by the pooled vector's squared norm. Print this projection fraction to four decimal places; it measures a directional contribution, not the fraction of token weights."
],
              `import numpy as np
from oop_ml import MeanPooling, PoolingWeighting, Vocabulary, WordEmbeddings

words = ["the", "cat", "dog", "pet", "stock", "bond", "market"]
table = [
    (0.0, 0.0, 2.0, 0.0),
    (1.0, 0.0, 0.0, 0.1),
    (1.0, 0.0, 0.0, -0.1),
    (0.9, 0.1, 0.0, 0.0),
    (0.0, 1.0, 0.0, 0.1),
    (0.0, 1.0, 0.0, -0.1),
    (0.1, 0.9, 0.0, 0.0),
]
positions = WordEmbeddings(Vocabulary(words), np.asarray(table))
documents = [
    "the cat the dog", "the pet the cat", "the dog the pet",
    "the stock the bond", "the market the stock", "the bond the market",
]

# Fit MeanPooling on the positions with the inverse document frequency weighting.

# weights: the model's inverse document frequencies, one per word in table order.

# answer: the pooled position of "the cat the dog".

# added_by_the: two uses, times the weight of the, times its position,
# divided by the total weight of the document's four words.

# Print the two weights, the answer, and (added_by_the . answer) / (answer . answer).`,
              `import numpy as np
from oop_ml import MeanPooling, PoolingWeighting, Vocabulary, WordEmbeddings

words = ["the", "cat", "dog", "pet", "stock", "bond", "market"]
table = [
    (0.0, 0.0, 2.0, 0.0),
    (1.0, 0.0, 0.0, 0.1),
    (1.0, 0.0, 0.0, -0.1),
    (0.9, 0.1, 0.0, 0.0),
    (0.0, 1.0, 0.0, 0.1),
    (0.0, 1.0, 0.0, -0.1),
    (0.1, 0.9, 0.0, 0.0),
]
positions = WordEmbeddings(Vocabulary(words), np.asarray(table))
documents = [
    "the cat the dog", "the pet the cat", "the dog the pet",
    "the stock the bond", "the market the stock", "the bond the market",
]

model = MeanPooling(
    embeddings=positions, weighting=PoolingWeighting.INVERSE_DOCUMENT_FREQUENCY
).fit(documents)

weights = np.asarray(model.inverse_document_frequencies)
print(f"weight of the: {weights[0]:.4f}   weight of cat: {weights[1]:.4f}")

answer = np.asarray(model.transform(["the cat the dog"]).vector_of(0))
print("pooled position:", ", ".join(f"{value:.4f}" for value in answer))

total = 2 * weights[0] + weights[1] + weights[2]
added_by_the = 2 * weights[0] * np.asarray(table[0]) / total
share = added_by_the @ answer / (answer @ answer)
print(f"share supplied by the: {share:.4f}")`,
              `weight of the: 1.0000   weight of cat: 1.8473
pooled position: 0.6488, 0.0000, 0.7024, 0.0000
share supplied by the: 0.5396`,
              { hints: [
  "Weights apply per occurrence, so the contributes twice.",
  "First divide each weighted vector contribution by the sum of all four occurrence weights. Then compute the dot product of added_by_the with answer and divide by answer's squared norm, as requested. Keep full-precision fitted weights during both calculations."
], check: numberCheck("What fraction of the pooled vector's squared norm is accounted for by the projection of the two the contributions, to four decimal places?", 0.5396, 5e-05, "The projection fraction is 0.5396. The two occurrences of the both contribute their weighted vectors. This fraction describes their contribution along the final pooled direction; it is different from their share of the total scalar pooling weight."), question: "How much influence do repeated common words retain after rarity weighting?" },
            ),
          ],
        },
      ]}
    />
  );
}
